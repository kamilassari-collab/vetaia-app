import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";

const URLS = [
  "https://www.merckvetmanual.com/pharmacology",
  "https://www.merckvetmanual.com/infectious-diseases",
  "https://www.merckvetmanual.com/emergency-medicine-and-critical-care",
  "https://www.merckvetmanual.com/digestive-system",
  "https://www.merckvetmanual.com/respiratory-system",
  "https://www.merckvetmanual.com/urinary-system",
  "https://www.merckvetmanual.com/circulatory-system",
  "https://www.merckvetmanual.com/integumentary-system",
  "https://www.merckvetmanual.com/musculoskeletal-system",
  "https://www.merckvetmanual.com/nervous-system",
  "https://www.merckvetmanual.com/endocrine-system",
  "https://www.merckvetmanual.com/reproductive-system",
  "https://www.merckvetmanual.com/eye-and-ear",
  "https://www.merckvetmanual.com/toxicology",
  "https://www.merckvetmanual.com/behavior",
  "https://www.merckvetmanual.com/cat-owners",
];

const DOCUMENTS_DIR = path.join(__dirname, "..", "documents");

function sanitizeFilename(name: string): string {
  return name
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, "_")
    .trim();
}

/** Strip HTML tags and decode entities from a string */
function htmlToText(html: string): string {
  if (!html) return "";
  const $ = cheerio.load(html);
  return $("body").text().replace(/\s+/g, " ").trim();
}

interface Topic {
  TopicName?: { value: string };
  TopicUrl?: { path: string };
  Summary?: { value: string };
  InThisTopic?: { value: string };
}

interface Chapter {
  ChapterName?: { value: string };
  ChapterUrl?: { path: string };
  Description?: { value: string };
  ChapterChildren?: { results: Topic[] };
}

interface SectionData {
  SectionName?: { value: string };
  SectionChildrens?: { results: Chapter[] };
}

function extractSectionData(componentProps: Record<string, unknown>): SectionData | null {
  // Find the component that contains SectionChildrens
  for (const value of Object.values(componentProps)) {
    const v = value as Record<string, unknown>;
    const fields = v?.fields as Record<string, unknown> | undefined;
    const data = fields?.data as Record<string, unknown> | undefined;
    const item = data?.item as SectionData | undefined;
    if (item?.SectionChildrens) {
      return item;
    }
  }
  return null;
}

function buildTextContent(sectionData: SectionData): string {
  const lines: string[] = [];
  const sectionName = sectionData.SectionName?.value ?? "Unknown Section";
  lines.push(`# ${sectionName}`);
  lines.push("");

  const chapters = sectionData.SectionChildrens?.results ?? [];

  for (const chapter of chapters) {
    const chapterName = chapter.ChapterName?.value ?? "Unnamed Chapter";
    lines.push(`\n## ${chapterName}`);

    const chapterDesc = htmlToText(chapter.Description?.value ?? "");
    if (chapterDesc) {
      lines.push(chapterDesc);
    }

    const topics = chapter.ChapterChildren?.results ?? [];
    for (const topic of topics) {
      const topicName = topic.TopicName?.value ?? "Unnamed Topic";
      lines.push(`\n### ${topicName}`);

      const summary = htmlToText(topic.Summary?.value ?? "");
      if (summary) {
        lines.push(summary);
      }

      // InThisTopic contains sub-sections as JSON string
      try {
        const inThisTopic = JSON.parse(topic.InThisTopic?.value ?? "[]") as Array<{
          Title: string;
          Summary: string;
          Children?: Array<{ Title: string; Summary: string }>;
        }>;
        for (const sub of inThisTopic) {
          lines.push(`\n#### ${sub.Title}`);
          const subText = htmlToText(sub.Summary ?? "");
          if (subText) lines.push(subText);

          for (const child of sub.Children ?? []) {
            lines.push(`\n##### ${child.Title}`);
            const childText = htmlToText(child.Summary ?? "");
            if (childText) lines.push(childText);
          }
        }
      } catch {
        // InThisTopic not parseable, skip
      }
    }
  }

  return lines.join("\n");
}

async function scrapePage(url: string): Promise<void> {
  console.log(`Scraping: ${url}`);

  const response = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
    timeout: 30000,
  });

  const $ = cheerio.load(response.data);

  // Extract Next.js embedded data
  const nextDataScript = $("#__NEXT_DATA__").html();
  if (!nextDataScript) {
    throw new Error("No __NEXT_DATA__ found on page");
  }

  const nextData = JSON.parse(nextDataScript);
  const pageProps = nextData?.props?.pageProps ?? {};
  const componentProps = pageProps?.componentProps ?? {};

  const sectionData = extractSectionData(componentProps);

  let title: string;
  let content: string;

  if (sectionData) {
    title = sectionData.SectionName?.value ?? url.split("/").pop() ?? "untitled";
    content = buildTextContent(sectionData);
  } else {
    // Fallback: extract from DOM for article/topic pages
    $(
      "nav, header, footer, script, style, .ad, .sidebar, [class*='nav'], [class*='header'], [class*='footer']"
    ).remove();

    title =
      $("h1").first().text().trim() ||
      $("title").text().replace(" - Merck Veterinary Manual", "").trim() ||
      url.split("/").pop() ||
      "untitled";

    const root = $("article, main, [role='main'], .content, body").first();
    content = root
      .find("h1, h2, h3, h4, p, li")
      .map((_, el) => {
        const tag = (el as cheerio.TagElement).tagName?.toLowerCase();
        const text = $(el).text().replace(/\s+/g, " ").trim();
        if (!text) return "";
        if (tag === "h1") return `\n# ${text}\n`;
        if (tag === "h2") return `\n## ${text}\n`;
        if (tag === "h3") return `\n### ${text}\n`;
        if (tag === "li") return `  - ${text}`;
        return text;
      })
      .get()
      .filter(Boolean)
      .join("\n");
  }

  const filename = sanitizeFilename(title) + ".txt";
  const filepath = path.join(DOCUMENTS_DIR, filename);
  const output = `Source: ${url}\nTitle: ${title}\n\n${"=".repeat(60)}\n\n${content}`;

  if (fs.existsSync(filepath)) {
    console.log(`  Skipped (exists): ${filename}`);
    return;
  }
  fs.writeFileSync(filepath, output, "utf-8");
  console.log(`  Saved: ${filename} (${(output.length / 1024).toFixed(1)} KB)`);
}

async function main() {
  if (!fs.existsSync(DOCUMENTS_DIR)) {
    fs.mkdirSync(DOCUMENTS_DIR, { recursive: true });
  }

  let success = 0;
  let failed = 0;

  for (const url of URLS) {
    try {
      await scrapePage(url);
      success++;
    } catch (err) {
      console.error(`  Failed: ${url} — ${(err as Error).message}`);
      failed++;
    }
  }

  console.log(`\nDone: ${success} succeeded, ${failed} failed.`);
}

main();
