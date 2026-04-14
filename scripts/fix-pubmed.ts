/**
 * fix-pubmed.ts
 * Cleans the 175 PubMed XML files:
 *   1. Strips all XML/HTML tags from content
 *   2. Extracts the real article title from <article-title> tag
 *   3. Renames files to PMC{id}_{clean-title}.txt
 * Run: npx tsx scripts/fix-pubmed.ts
 */

import * as fs from "fs";
import * as path from "path";
import * as cheerio from "cheerio";

const PUBMED_DIR = path.join(__dirname, "..", "documents", "pubmed", "reviews");

function sanitize(name: string): string {
  return name
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 100);
}

function extractPmcId(filename: string): string {
  const match = filename.match(/^(PMC\d+)/);
  return match?.[1] ?? filename.replace(".txt", "");
}

function cleanXmlToText(raw: string): { title: string; content: string } {
  // The file starts with our header (Source/URL/Title/Scraped/===) then the XML body
  const sepIdx = raw.indexOf("=".repeat(60));
  const header = sepIdx > -1 ? raw.slice(0, sepIdx) : "";
  const xmlBody = sepIdx > -1 ? raw.slice(sepIdx + 60) : raw;

  // Parse XML with cheerio
  const $ = cheerio.load(xmlBody, { xmlMode: true });

  // Extract article title
  const title =
    $("article-title").first().text().trim() ||
    $("title").first().text().trim() ||
    "";

  // Extract abstract
  const abstractParts: string[] = [];
  $("abstract").each((_, el) => {
    const label = $(el).find("title").text().trim();
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (label) abstractParts.push(`\n### ${label}\n${text}`);
    else abstractParts.push(text);
  });

  // Extract body sections
  const sections: string[] = [];
  $("sec").each((_, el) => {
    const sTitle = $(el).children("title").first().text().trim();
    // Get only direct paragraph children (not nested sec paragraphs)
    const paragraphs: string[] = [];
    $(el).children("p").each((__, p) => {
      const txt = $(p).text().replace(/\s+/g, " ").trim();
      if (txt.length > 20) paragraphs.push(txt);
    });
    if (sTitle && paragraphs.length > 0) {
      sections.push(`\n## ${sTitle}\n\n${paragraphs.join("\n\n")}`);
    } else if (sTitle) {
      // May have nested text
      const allText = $(el).text().replace(/\s+/g, " ").trim();
      if (allText.length > 50) sections.push(`\n## ${sTitle}\n\n${allText}`);
    }
  });

  // Fallback: just strip all tags if no structure found
  let content: string;
  if (sections.length > 0 || abstractParts.length > 0) {
    const parts = [];
    if (abstractParts.length > 0) parts.push("## Abstract\n\n" + abstractParts.join("\n"));
    if (sections.length > 0) parts.push(sections.join("\n"));
    content = parts.join("\n\n");
  } else {
    // Strip all XML tags as fallback
    content = xmlBody
      .replace(/<[^>]+>/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#\d+;/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Preserve the original header source/url
  const urlMatch = header.match(/URL: (.+)/);
  const url = urlMatch?.[1]?.trim() ?? "";

  return { title, content: content.slice(0, 500_000) }; // cap at 500KB per file
}

async function main() {
  const files = fs.readdirSync(PUBMED_DIR).filter((f) => f.endsWith(".txt"));
  console.log(`Fixing ${files.length} PubMed files...`);

  let fixed = 0;
  let skipped = 0;

  for (const filename of files) {
    const oldPath = path.join(PUBMED_DIR, filename);
    const raw = fs.readFileSync(oldPath, "utf-8");

    const pmcId = extractPmcId(filename);
    const { title, content } = cleanXmlToText(raw);

    if (!content || content.length < 100) {
      console.log(`  ✗ Skip (empty): ${filename}`);
      fs.unlinkSync(oldPath);
      skipped++;
      continue;
    }

    const cleanTitle = title || pmcId;
    const newFilename = `${pmcId}_${sanitize(cleanTitle)}.txt`;
    const newPath = path.join(PUBMED_DIR, newFilename);

    // Extract original header metadata
    const urlMatch = raw.match(/URL: (.+)/);
    const url = urlMatch?.[1]?.trim() ?? "";

    const body = `Source: PubMed Central\nURL: ${url}\nTitle: ${cleanTitle}\nPMCID: ${pmcId}\n\n${"=".repeat(60)}\n\n# ${cleanTitle}\n\n${content}`;
    fs.writeFileSync(newPath, body, "utf-8");

    // Remove old file if renamed
    if (newFilename !== filename) fs.unlinkSync(oldPath);

    console.log(`  ✓ ${newFilename} (${(body.length / 1024).toFixed(0)} KB)`);
    fixed++;
  }

  console.log(`\nDone: ${fixed} fixed, ${skipped} removed (empty).`);
}

main().catch(console.error);
