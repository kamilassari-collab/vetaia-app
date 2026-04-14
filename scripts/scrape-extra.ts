/**
 * scrape-extra.ts
 * Adds 3 high-quality vet knowledge sources to the RAG database:
 *
 *  1. PubMed — vet-specific queries, plain-text abstracts (no XML)
 *  2. WikiVet  — open veterinary wiki, static HTML, comprehensive
 *  3. BMC Veterinary Research — open-access journal articles, static HTML
 *
 * Run: npx tsx scripts/scrape-extra.ts
 */

import axios, { AxiosError } from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";

const DOCS_ROOT = path.join(__dirname, "..", "documents");

// ─── UTILITIES ───────────────────────────────────────────────────────────────

function sanitize(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, "-").replace(/\s+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "").slice(0, 110);
}

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }
function randomDelay() { return delay(1000 + Math.random() * 1000); }

let saved = 0, skipped = 0;

function saveFile(folder: string, filename: string, content: string, url: string, source: string): boolean {
  if (!content || content.trim().length < 200) return false;
  const fullPath = path.join(DOCS_ROOT, folder, filename);
  if (fs.existsSync(fullPath)) {
    console.log(`  ⏭  ${filename}`);
    return false; // already exists, no delay needed
  }
  const body = `Source: ${source}\nURL: ${url}\nTitle: ${filename.replace(/_/g, " ").replace(/\.txt$/, "")}\n\n${"=".repeat(60)}\n\n${content.trim()}`;
  fs.writeFileSync(fullPath, body, "utf-8");
  console.log(`  ✓  ${folder}/${filename} (${(body.length / 1024).toFixed(0)} KB)`);
  saved++;
  return true;
}

async function fetchText(url: string): Promise<string | null> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const r = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36",
          Accept: "text/html,text/plain,*/*",
        },
        timeout: 25000,
        maxRedirects: 5,
      });
      return r.data as string;
    } catch (e) {
      const status = (e as AxiosError).response?.status;
      if (status === 403 || status === 404 || status === 401 || status === 410) {
        console.warn(`  ✗ ${url} (HTTP ${status})`);
        skipped++;
        return null;
      }
      if (attempt < 3) await delay(2000 * attempt);
      else { console.warn(`  ✗ Failed: ${url}`); skipped++; }
    }
  }
  return null;
}

function extractHTML(html: string, extraSelectors: string[] = []): { title: string; text: string } {
  const $ = cheerio.load(html);
  $("script,style,nav,header,footer,noscript,.ad,.ads,.sidebar,[class*='nav'],[class*='footer'],[class*='cookie'],[class*='banner'],[class*='menu'],[id*='nav'],[id*='header'],[id*='sidebar']").remove();
  const title = $("h1").first().text().trim() || $("title").text().replace(/\s*[|–—-].*$/, "").trim() || "untitled";
  const selectors = [...extraSelectors, "article", "main", "[role='main']", ".content", ".article-content", ".entry-content", "#content", "#main", "body"];
  let root = $("body");
  for (const s of selectors) { if ($(s).length) { root = $(s).first(); break; } }
  const lines: string[] = [];
  root.find("h1,h2,h3,h4,p,li,td,blockquote").each((_, el) => {
    const tag = (el as cheerio.TagElement).tagName?.toLowerCase() ?? "";
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (!text || text.length < 4) return;
    if (tag === "h1") lines.push(`\n# ${text}\n`);
    else if (tag === "h2") lines.push(`\n## ${text}\n`);
    else if (tag === "h3") lines.push(`\n### ${text}\n`);
    else if (tag === "h4") lines.push(`\n#### ${text}\n`);
    else if (tag === "li") lines.push(`  - ${text}`);
    else lines.push(text);
  });
  return { title, text: lines.filter(Boolean).join("\n") };
}

// ─── 1. PUBMED — PLAIN TEXT ABSTRACTS ────────────────────────────────────────
// Use rettype=medline retmode=text → clean key:value format, no XML
// Very vet-specific queries to avoid irrelevant human medicine

const PUBMED_DIR = path.join(DOCS_ROOT, "pubmed", "reviews");

const VET_QUERIES = [
  // Pharmacologie vétérinaire
  "small+animal+antibiotic+treatment+protocol",
  "feline+chronic+kidney+disease+management+review",
  "canine+diabetes+mellitus+insulin+protocol",
  "veterinary+NSAID+pain+management+dog+cat",
  "feline+hypertrophic+cardiomyopathy+treatment",
  "feline+hyperthyroidism+methimazole+radioiodine",
  "dog+cat+corticosteroid+immunosuppression+protocol",
  "veterinary+chemotherapy+lymphoma+dog+cat",
  "small+animal+anesthesia+protocol+monitoring",
  // Infectieux
  "feline+infectious+peritonitis+GS-441524+treatment",
  "canine+parvovirus+treatment+outcome",
  "veterinary+antimicrobial+resistance+companion+animal",
  "leptospirosis+dog+treatment+vaccination",
  "leishmaniasis+dog+treatment+miltefosine",
  "feline+herpesvirus+calicivirus+upper+respiratory",
  "tick+borne+disease+dog+ehrlichia+anaplasma",
  "dirofilariasis+dog+treatment+prevention",
  // Urgences
  "veterinary+emergency+toxicology+small+animal",
  "gastric+dilatation+volvulus+dog+treatment",
  "urethral+obstruction+cat+treatment+prognosis",
  "veterinary+fluid+therapy+shock+resuscitation",
  "canine+hypoadrenocorticism+treatment",
  // Dermatologie
  "canine+atopic+dermatitis+oclacitinib+lokivetmab",
  "feline+dermatology+skin+disease+treatment",
  "canine+otitis+externa+treatment+management",
  // NAC
  "rabbit+gastrointestinal+stasis+treatment",
  "ferret+adrenal+disease+treatment",
  "exotic+pet+reptile+bird+disease+treatment",
  // Nutrition
  "veterinary+clinical+nutrition+dog+cat+renal+diet",
  "feline+obesity+weight+management",
];

async function scrapePubMed(): Promise<void> {
  console.log(`\n${"─".repeat(60)}`);
  console.log("[PubMed] Vet-specific queries — plain text abstracts");
  console.log("─".repeat(60));

  fs.mkdirSync(PUBMED_DIR, { recursive: true });
  const seenIds = new Set<string>();

  for (const query of VET_QUERIES) {
    console.log(`\n  Query: ${query.slice(0, 70)}...`);

    // Respect NCBI rate limit: max 3 req/s without API key
    await delay(500);

    // Search for IDs — use encodeURIComponent so spaces are %20, not +
    const term = encodeURIComponent(query.replace(/\+/g, " "));
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${term}&retmax=25&retmode=json&sort=relevance`;
    const searchRaw = await fetchText(searchUrl);
    if (!searchRaw) continue;

    let ids: string[] = [];
    try {
      const parsed = JSON.parse(searchRaw);
      ids = parsed?.esearchresult?.idlist ?? [];
    } catch (e) {
      console.warn(`  ✗ JSON parse failed for query: ${query}`);
      continue;
    }
    console.log(`  → ${ids.length} articles found`);

    // Fetch abstracts in clean medline text format
    const newIds = ids.filter(id => !seenIds.has(id)).slice(0, 15);
    if (newIds.length === 0) continue;

    newIds.forEach(id => seenIds.add(id));

    const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${newIds.join(",")}&rettype=abstract&retmode=text`;
    await randomDelay();
    const raw = await fetchText(fetchUrl);
    if (!raw) continue;

    // Split into individual articles (separated by blank lines + digit)
    const articles = raw.split(/\n\n(?=\d+\.\s)/).filter(a => a.trim().length > 100);

    for (const articleText of articles) {
      // Extract PMID and title
      const pmidMatch = articleText.match(/PMID:\s*(\d+)/);
      const titleMatch = articleText.match(/^[\d]+\.\s+(.+?)(?:\n|Author)/s);
      const pmid = pmidMatch?.[1] ?? `unknown_${Date.now()}`;
      const rawTitle = titleMatch?.[1]?.replace(/\s+/g, " ").trim() ?? `PMID_${pmid}`;

      // Skip articles that are clearly not veterinary
      const lowerText = articleText.toLowerCase();
      const isVet = lowerText.includes("dog") || lowerText.includes("cat") || lowerText.includes("feline")
        || lowerText.includes("canine") || lowerText.includes("veterinar") || lowerText.includes("animal")
        || lowerText.includes("rabbit") || lowerText.includes("ferret") || lowerText.includes("exotic")
        || lowerText.includes("equine") || lowerText.includes("bovine") || lowerText.includes("livestock");
      if (!isVet) { console.log(`    ⏭  PMID ${pmid} — not vet-relevant, skipping`); continue; }

      const filename = `PMID${pmid}_${sanitize(rawTitle)}.txt`;
      const fetched = saveFile("pubmed/reviews", filename, articleText, `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`, "PubMed");
      if (fetched) await randomDelay();
    }
  }
}

// ─── 2. WIKIVET ───────────────────────────────────────────────────────────────
// Open veterinary encyclopedia — static MediaWiki HTML, comprehensive

const WIKIVET_DIR = path.join(DOCS_ROOT, "clinique", "wikivet");

const WIKIVET_PAGES = [
  // Pharmacologie
  "https://en.wikivet.net/Pharmacology",
  "https://en.wikivet.net/Antibiotics",
  "https://en.wikivet.net/Aminoglycosides",
  "https://en.wikivet.net/Beta-lactam_Antibiotics",
  "https://en.wikivet.net/Fluoroquinolones",
  "https://en.wikivet.net/Tetracyclines",
  "https://en.wikivet.net/Macrolides",
  "https://en.wikivet.net/Metronidazole",
  "https://en.wikivet.net/NSAIDs",
  "https://en.wikivet.net/Corticosteroids",
  "https://en.wikivet.net/Opioids",
  "https://en.wikivet.net/Anaesthesia",
  "https://en.wikivet.net/Sedation",
  "https://en.wikivet.net/Diuretics",
  "https://en.wikivet.net/ACE_Inhibitors",
  "https://en.wikivet.net/Antifungals",
  "https://en.wikivet.net/Antiparasitics",
  "https://en.wikivet.net/Vaccination",
  // Systèmes cliniques
  "https://en.wikivet.net/Cardiology",
  "https://en.wikivet.net/Dilated_Cardiomyopathy",
  "https://en.wikivet.net/Hypertrophic_Cardiomyopathy",
  "https://en.wikivet.net/Mitral_Valve_Disease",
  "https://en.wikivet.net/Congestive_Heart_Failure",
  "https://en.wikivet.net/Nephrology_and_Urology",
  "https://en.wikivet.net/Chronic_Kidney_Disease",
  "https://en.wikivet.net/Acute_Kidney_Injury",
  "https://en.wikivet.net/Urinary_Tract_Infection",
  "https://en.wikivet.net/Feline_Lower_Urinary_Tract_Disease",
  "https://en.wikivet.net/Gastroenterology",
  "https://en.wikivet.net/Pancreatitis",
  "https://en.wikivet.net/Inflammatory_Bowel_Disease",
  "https://en.wikivet.net/Hepatic_Lipidosis",
  "https://en.wikivet.net/Portosystemic_Shunt",
  "https://en.wikivet.net/Gastric_Dilatation_Volvulus",
  "https://en.wikivet.net/Endocrinology",
  "https://en.wikivet.net/Diabetes_Mellitus",
  "https://en.wikivet.net/Hyperthyroidism",
  "https://en.wikivet.net/Hypothyroidism",
  "https://en.wikivet.net/Hyperadrenocorticism",
  "https://en.wikivet.net/Hypoadrenocorticism",
  "https://en.wikivet.net/Neurology",
  "https://en.wikivet.net/Epilepsy",
  "https://en.wikivet.net/Intervertebral_Disc_Disease",
  "https://en.wikivet.net/Vestibular_Disease",
  "https://en.wikivet.net/Oncology",
  "https://en.wikivet.net/Lymphoma",
  "https://en.wikivet.net/Mast_Cell_Tumour",
  "https://en.wikivet.net/Osteosarcoma",
  "https://en.wikivet.net/Mammary_Tumour",
  "https://en.wikivet.net/Dermatology",
  "https://en.wikivet.net/Atopic_Dermatitis",
  "https://en.wikivet.net/Otitis_Externa",
  "https://en.wikivet.net/Demodex",
  "https://en.wikivet.net/Sarcoptes",
  "https://en.wikivet.net/Dermatophytosis",
  "https://en.wikivet.net/Ophthalmology",
  "https://en.wikivet.net/Uveitis",
  "https://en.wikivet.net/Glaucoma",
  "https://en.wikivet.net/Cataracts",
  // Infectieux
  "https://en.wikivet.net/Infectious_Disease",
  "https://en.wikivet.net/Feline_Infectious_Peritonitis",
  "https://en.wikivet.net/Feline_Immunodeficiency_Virus",
  "https://en.wikivet.net/Feline_Leukaemia_Virus",
  "https://en.wikivet.net/Feline_Herpesvirus",
  "https://en.wikivet.net/Feline_Calicivirus",
  "https://en.wikivet.net/Canine_Parvovirus",
  "https://en.wikivet.net/Canine_Distemper",
  "https://en.wikivet.net/Leptospirosis",
  "https://en.wikivet.net/Rabies",
  "https://en.wikivet.net/Leishmaniasis",
  "https://en.wikivet.net/Ehrlichiosis",
  "https://en.wikivet.net/Toxoplasmosis",
  "https://en.wikivet.net/Ringworm",
  // Parasitologie
  "https://en.wikivet.net/Parasitology",
  "https://en.wikivet.net/Toxocara",
  "https://en.wikivet.net/Dipylidium",
  "https://en.wikivet.net/Giardia",
  "https://en.wikivet.net/Cryptosporidium",
  "https://en.wikivet.net/Heartworm",
  "https://en.wikivet.net/Fleas",
  "https://en.wikivet.net/Ticks",
  "https://en.wikivet.net/Mites",
  // NAC
  "https://en.wikivet.net/Rabbit",
  "https://en.wikivet.net/Ferret",
  "https://en.wikivet.net/Guinea_Pig",
  "https://en.wikivet.net/Reptile",
  "https://en.wikivet.net/Avian",
  "https://en.wikivet.net/Chinchilla",
  // Urgences
  "https://en.wikivet.net/Emergency_and_Critical_Care",
  "https://en.wikivet.net/Shock",
  "https://en.wikivet.net/Fluid_Therapy",
  "https://en.wikivet.net/Cardiopulmonary_Resuscitation",
  "https://en.wikivet.net/Toxicology",
  "https://en.wikivet.net/Poisoning",
  // Chirurgie
  "https://en.wikivet.net/Surgery",
  "https://en.wikivet.net/Wound_Management",
  "https://en.wikivet.net/Orthopaedics",
];

async function scrapeWikiVet(): Promise<void> {
  console.log(`\n${"─".repeat(60)}`);
  console.log(`[WikiVet] ${WIKIVET_PAGES.length} pages → clinique/wikivet/`);
  console.log("─".repeat(60));
  fs.mkdirSync(WIKIVET_DIR, { recursive: true });

  for (let i = 0; i < WIKIVET_PAGES.length; i++) {
    const url = WIKIVET_PAGES[i];
    console.log(`[${i + 1}/${WIKIVET_PAGES.length}] ${url}`);
    const html = await fetchText(url);
    if (!html) continue;

    const { title, text } = extractHTML(html, ["#mw-content-text", ".mw-parser-output"]);
    const filename = `${sanitize(title)}.txt`;
    const fetched = saveFile("clinique/wikivet", filename, text, url, "WikiVet");
    if (fetched) await randomDelay();
  }
}

// ─── 3. BMC VETERINARY RESEARCH — open-access articles ───────────────────────

const BMC_DIR = path.join(DOCS_ROOT, "clinique", "bmc-vet");

// Direct article URLs from BMC Veterinary Research (open access, static HTML)
const BMC_ARTICLES = [
  "https://bmcvetres.biomedcentral.com/articles/10.1186/s12917-024-04042-3",
  "https://bmcvetres.biomedcentral.com/articles/10.1186/s12917-024-03980-2",
  "https://bmcvetres.biomedcentral.com/articles/10.1186/s12917-024-03879-y",
  "https://bmcvetres.biomedcentral.com/articles/10.1186/s12917-023-03845-0",
  "https://bmcvetres.biomedcentral.com/articles/10.1186/s12917-023-03748-0",
  "https://bmcvetres.biomedcentral.com/articles/10.1186/s12917-023-03618-9",
  "https://bmcvetres.biomedcentral.com/articles/10.1186/s12917-022-03460-z",
  "https://bmcvetres.biomedcentral.com/articles/10.1186/s12917-022-03309-5",
  "https://bmcvetres.biomedcentral.com/articles/10.1186/s12917-021-03090-5",
  "https://bmcvetres.biomedcentral.com/articles/10.1186/s12917-021-02928-2",
  "https://bmcvetres.biomedcentral.com/articles/10.1186/s12917-020-02696-7",
  "https://bmcvetres.biomedcentral.com/articles/10.1186/s12917-020-02371-z",
  "https://bmcvetres.biomedcentral.com/articles/10.1186/s12917-019-02234-6",
  "https://bmcvetres.biomedcentral.com/articles/10.1186/s12917-019-01825-7",
  // Feline specific
  "https://bmcvetres.biomedcentral.com/articles/10.1186/s12917-024-03981-1",
  "https://bmcvetres.biomedcentral.com/articles/10.1186/s12917-023-03705-9",
  "https://bmcvetres.biomedcentral.com/articles/10.1186/s12917-022-03156-4",
  "https://bmcvetres.biomedcentral.com/articles/10.1186/s12917-021-02798-8",
  // Pharmacology
  "https://bmcvetres.biomedcentral.com/articles/10.1186/s12917-024-03882-3",
  "https://bmcvetres.biomedcentral.com/articles/10.1186/s12917-023-03541-z",
];

async function scrapeBMC(): Promise<void> {
  console.log(`\n${"─".repeat(60)}`);
  console.log(`[BMC Vet Research] ${BMC_ARTICLES.length} articles → clinique/bmc-vet/`);
  console.log("─".repeat(60));
  fs.mkdirSync(BMC_DIR, { recursive: true });

  for (let i = 0; i < BMC_ARTICLES.length; i++) {
    const url = BMC_ARTICLES[i];
    console.log(`[${i + 1}/${BMC_ARTICLES.length}] ${url}`);
    const html = await fetchText(url);
    if (!html) continue;

    const { title, text } = extractHTML(html, [".c-article-body", "article", ".article__body"]);
    const filename = `${sanitize(title)}.txt`;
    const fetched = saveFile("clinique/bmc-vet", filename, text, url, "BMC Veterinary Research");
    if (fetched) await randomDelay();
  }
}

// ─── 4. FRONTIERS IN VETERINARY SCIENCE — open access ────────────────────────

const FRONTIERS_DIR = path.join(DOCS_ROOT, "clinique", "frontiers-vet");

const FRONTIERS_ARTICLES = [
  "https://www.frontiersin.org/articles/10.3389/fvets.2023.1130097/full",
  "https://www.frontiersin.org/articles/10.3389/fvets.2023.1167422/full",
  "https://www.frontiersin.org/articles/10.3389/fvets.2023.1173487/full",
  "https://www.frontiersin.org/articles/10.3389/fvets.2022.1055506/full",
  "https://www.frontiersin.org/articles/10.3389/fvets.2022.913705/full",
  "https://www.frontiersin.org/articles/10.3389/fvets.2022.896002/full",
  "https://www.frontiersin.org/articles/10.3389/fvets.2021.758107/full",
  "https://www.frontiersin.org/articles/10.3389/fvets.2021.681619/full",
  "https://www.frontiersin.org/articles/10.3389/fvets.2020.580707/full",
  "https://www.frontiersin.org/articles/10.3389/fvets.2020.556700/full",
  "https://www.frontiersin.org/articles/10.3389/fvets.2023.1101581/full",
  "https://www.frontiersin.org/articles/10.3389/fvets.2023.1130473/full",
  "https://www.frontiersin.org/articles/10.3389/fvets.2022.1039048/full",
  "https://www.frontiersin.org/articles/10.3389/fvets.2021.697201/full",
  "https://www.frontiersin.org/articles/10.3389/fvets.2021.628933/full",
];

async function scrapeFrontiers(): Promise<void> {
  console.log(`\n${"─".repeat(60)}`);
  console.log(`[Frontiers Vet Science] ${FRONTIERS_ARTICLES.length} articles → clinique/frontiers-vet/`);
  console.log("─".repeat(60));
  fs.mkdirSync(FRONTIERS_DIR, { recursive: true });

  for (let i = 0; i < FRONTIERS_ARTICLES.length; i++) {
    const url = FRONTIERS_ARTICLES[i];
    console.log(`[${i + 1}/${FRONTIERS_ARTICLES.length}] ${url}`);
    const html = await fetchText(url);
    if (!html) continue;

    const { title, text } = extractHTML(html, [".article-full-text", ".JournalFullText", "article"]);
    const filename = `${sanitize(title)}.txt`;
    const fetched = saveFile("clinique/frontiers-vet", filename, text, url, "Frontiers in Veterinary Science");
    if (fetched) await randomDelay();
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("═".repeat(60));
  console.log("  LEASH-AI — Extra Sources Scraper");
  console.log(`  Started: ${new Date().toISOString()}`);
  console.log("═".repeat(60));

  // Ensure all new folders exist
  for (const folder of ["clinique/wikivet", "clinique/bmc-vet", "clinique/frontiers-vet"]) {
    fs.mkdirSync(path.join(DOCS_ROOT, folder), { recursive: true });
  }

  await scrapePubMed();
  await scrapeWikiVet();
  await scrapeBMC();
  await scrapeFrontiers();

  console.log("\n" + "═".repeat(60));
  console.log(`  DONE — ${saved} files saved, ${skipped} skipped`);
  console.log(`  Ended: ${new Date().toISOString()}`);
  console.log("═".repeat(60));
}

main().catch(console.error);
