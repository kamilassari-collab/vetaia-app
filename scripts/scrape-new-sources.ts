import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";

const DOCS_DIR = path.join(__dirname, "..", "documents");

const URLS: { url: string; filename: string }[] = [
  // IRIS Kidney
  { url: "https://www.iris-kidney.com/iris-guidelines-1", filename: "iris_kidney_guidelines.txt" },
  { url: "https://www.iris-kidney.com/iris-staging-system", filename: "iris_kidney_staging.txt" },
  { url: "https://www.iris-kidney.com/hypertension", filename: "iris_hypertension.txt" },
  { url: "https://www.iris-kidney.com/proteinuria", filename: "iris_proteinuria.txt" },
  // WSAVA
  { url: "https://wsava.org/global-guidelines/", filename: "wsava_guidelines.txt" },
  // RECOVER
  { url: "https://recoverinitiative.org/2024-guidelines/", filename: "recover_cpr_2024.txt" },
  // ISCAID
  { url: "https://www.iscaid.org/guidelines", filename: "iscaid_guidelines.txt" },
  // VetLit
  { url: "https://vetlit.org/consensus-statements-and-guidelines/", filename: "vetlit_consensus_statements.txt" },
  // ANSES
  { url: "https://www.anses.fr/fr/portails/medicaments-veterinaires", filename: "anses_medicaments_veterinaires.txt" },
  // Ordre des Vétérinaires
  { url: "https://www.veterinaire.fr/je-suis-veterinaire/mon-exercice-professionnel/les-fiches-professionnelles", filename: "ordre_veterinaires_fiches.txt" },
  // Virbac Pro
  { url: "https://pro-fr.virbac.com/home/ressources-scientifiques/cas-cliniques.html", filename: "virbac_pro_cas_cliniques.txt" },
  // MSD Vet Manual French
  { url: "https://www.msdvetmanual.com/fr/index", filename: "msd_vet_manual_fr.txt" },
];

async function scrape(url: string, filename: string): Promise<void> {
  const filepath = path.join(DOCS_DIR, filename);
  if (fs.existsSync(filepath)) {
    console.log(`Skipped (exists): ${filename}`);
    return;
  }

  const res = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
    },
    timeout: 30000,
  });

  const $ = cheerio.load(res.data);

  $("nav, header, footer, script, style, aside, [class*='nav'], [class*='cookie'], [class*='banner'], [class*='menu'], [class*='sidebar'], [id*='nav'], [id*='cookie'], [id*='banner'], [id*='menu'], [id*='sidebar']").remove();

  const title =
    $("h1").first().text().trim() ||
    $("title").text().trim() ||
    filename.replace(".txt", "");

  // Pick the container with the most content
  const candidates = $("article, main, [role='main'], .content, #content, #main, .main-content, .page-content, body");
  let root = candidates.first();
  let maxLen = 0;
  candidates.each((_, el) => {
    const len = $(el).text().length;
    if (len > maxLen) {
      maxLen = len;
      root = $(el);
    }
  });

  const content = root
    .find("h1, h2, h3, h4, p, li")
    .map((_, el) => {
      const tag = (el as cheerio.TagElement).tagName?.toLowerCase();
      const text = $(el).text().replace(/\s+/g, " ").trim();
      if (!text) return "";
      if (tag === "h1") return `\n# ${text}\n`;
      if (tag === "h2") return `\n## ${text}\n`;
      if (tag === "h3") return `\n### ${text}\n`;
      if (tag === "h4") return `\n#### ${text}\n`;
      if (tag === "li") return `  - ${text}`;
      return text;
    })
    .get()
    .filter(Boolean)
    .join("\n");

  const output = `Source: ${url}\nTitle: ${title}\n\n${"=".repeat(60)}\n\n${content}`;
  fs.writeFileSync(filepath, output, "utf-8");
  console.log(`Saved: ${filename} (${(output.length / 1024).toFixed(1)} KB)`);
}

async function main(): Promise<void> {
  if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true });
  }

  let ok = 0;
  let fail = 0;

  for (const { url, filename } of URLS) {
    try {
      await scrape(url, filename);
      ok++;
    } catch (e) {
      console.error(`Failed: ${url} — ${(e as Error).message}`);
      fail++;
    }
  }

  console.log(`\nDone: ${ok} ok, ${fail} failed`);
}

main();
