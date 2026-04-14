/**
 * scrape-master.ts
 * Massive veterinary knowledge base scraper
 * Run: npx tsx scripts/scrape-master.ts
 */

import axios, { AxiosError } from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import pdfParse from "pdf-parse";

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const DOCS_ROOT = path.join(__dirname, "..", "documents");

const FOLDERS = [
  "merck/pharmacologie",
  "merck/petits-animaux",
  "merck/urgences-toxicologie",
  "merck/infectieux-zoonoses",
  "merck/clinique-systemes",
  "merck/nac-exotiques",
  "merck/equin",
  "merck/rente",
  "merck/parasitologie",
  "merck/nutrition",
  "guidelines/wsava",
  "guidelines/esccap",
  "guidelines/aaha",
  "guidelines/isfm",
  "guidelines/woah",
  "guidelines/fecava",
  "clinique/vca",
  "clinique/petmd",
  "clinique/cliniciansbrief",
  "france/reglementation",
  "france/ordre-veterinaires",
  "france/anmv",
  "france/esccap-fr",
  "pubmed/reviews",
];

const USER_AGENTS = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15",
];

// ─── METADATA TRACKING ───────────────────────────────────────────────────────

interface FileMeta {
  filename: string;
  folder: string;
  source: string;
  url: string;
  sizeBytes: number;
  scrapedAt: string;
}

const metadata: FileMeta[] = [];
let totalSaved = 0;
let totalSkipped = 0;

// ─── UTILITIES ───────────────────────────────────────────────────────────────

function randomUA(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function randomDelay(): Promise<void> {
  return delay(1000 + Math.random() * 1000); // 1–2s between successful fetches
}

function sanitize(name: string): string {
  return name
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 120);
}

function ensureFolders(): void {
  for (const folder of FOLDERS) {
    fs.mkdirSync(path.join(DOCS_ROOT, folder), { recursive: true });
  }
}

function saveFile(folder: string, title: string, content: string, url: string, source: string): void {
  if (!content.trim()) return;
  const filename = sanitize(title) + ".txt";
  const fullPath = path.join(DOCS_ROOT, folder, filename);

  // Skip if already exists (resume support)
  if (fs.existsSync(fullPath)) {
    const sizeKB = (fs.statSync(fullPath).size / 1024).toFixed(1);
    console.log(`  ⏭  Already saved: ${folder}/${filename} (${sizeKB} KB)`);
    metadata.push({ filename, folder, source, url, sizeBytes: fs.statSync(fullPath).size, scrapedAt: "cached" });
    totalSaved++;
    return;
  }

  const body = `Source: ${source}\nURL: ${url}\nTitle: ${title}\nScraped: ${new Date().toISOString()}\n\n${"=".repeat(60)}\n\n${content}`;
  fs.writeFileSync(fullPath, body, "utf-8");
  const sizeKB = (body.length / 1024).toFixed(1);
  console.log(`  ✓ ${folder}/${filename} (${sizeKB} KB)`);
  metadata.push({ filename, folder, source, url, sizeBytes: body.length, scrapedAt: new Date().toISOString() });
  totalSaved++;
}

// ─── HTTP CLIENT WITH RETRY ───────────────────────────────────────────────────

async function fetchWithRetry(url: string, options: { responseType?: "arraybuffer" | "text" } = {}): Promise<{ data: Buffer | string; status: number } | null> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const resp = await axios.get(url, {
        responseType: options.responseType ?? "text",
        headers: { "User-Agent": randomUA(), Accept: "text/html,application/xhtml+xml,application/pdf,*/*" },
        timeout: 30000,
        maxRedirects: 5,
      });
      return { data: resp.data as Buffer | string, status: resp.status };
    } catch (err) {
      const e = err as AxiosError;
      const status = e.response?.status;
      // Hard failures — no retry, no delay
      if (status === 403 || status === 404 || status === 410 || status === 401) {
        console.warn(`  ✗ Skip ${url} (HTTP ${status})`);
        totalSkipped++;
        return null;
      }
      if (attempt < 3) {
        console.warn(`  ↺ Retry ${attempt}/3 for ${url} (${e.message})`);
        await delay(2000 * attempt);
      } else {
        console.warn(`  ✗ Failed ${url} after 3 attempts: ${e.message}`);
        totalSkipped++;
      }
    }
  }
  return null;
}

// ─── HTML → CLEAN TEXT ───────────────────────────────────────────────────────

function htmlToText(html: string): string {
  const $ = cheerio.load(html);
  $("body").text();
  return $("body").text().replace(/\s+/g, " ").trim();
}

function extractStaticPage(html: string): { title: string; content: string } {
  const $ = cheerio.load(html);

  // Remove noise
  $("script, style, nav, header, footer, .ad, .ads, .advertisement, .cookie-banner, .modal, .popup, .sidebar, .social-share, .breadcrumb, [aria-hidden='true'], [role='banner'], [role='navigation'], [role='complementary']").remove();
  $("[class*='nav']").remove();
  $("[class*='footer']").remove();
  $("[class*='sidebar']").remove();
  $("[class*='cookie']").remove();
  $("[class*='banner']").remove();
  $("[id*='nav']").remove();
  $("[id*='header']").remove();

  const title =
    $("h1").first().text().trim() ||
    $("title").text().replace(/\s*[|–—-].*$/, "").trim() ||
    "untitled";

  // Find best content container
  const candidates = ["article", "main", "[role='main']", ".content", ".article-content", ".main-content", ".page-content", ".post-content", "#content", "#main", ".entry-content"];
  let root = $("body");
  for (const sel of candidates) {
    if ($(sel).length) { root = $(sel).first(); break; }
  }

  const lines: string[] = [];
  root.find("h1,h2,h3,h4,h5,h6,p,li,td,th,dt,dd,blockquote").each((_, el) => {
    const tag = (el as cheerio.TagElement).tagName?.toLowerCase() ?? "";
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (!text || text.length < 3) return;
    if (tag === "h1") lines.push(`\n# ${text}\n`);
    else if (tag === "h2") lines.push(`\n## ${text}\n`);
    else if (tag === "h3") lines.push(`\n### ${text}\n`);
    else if (["h4", "h5", "h6"].includes(tag)) lines.push(`\n#### ${text}\n`);
    else if (tag === "li") lines.push(`  - ${text}`);
    else lines.push(text);
  });

  return { title, content: lines.filter(Boolean).join("\n") };
}

// ─── MERCK — __NEXT_DATA__ EXTRACTOR ─────────────────────────────────────────

interface MerckTopic { TopicName?: { value: string }; TopicUrl?: { path: string }; Summary?: { value: string }; InThisTopic?: { value: string } }
interface MerckChapter { ChapterName?: { value: string }; Description?: { value: string }; ChapterChildren?: { results: MerckTopic[] } }
interface MerckSection { SectionName?: { value: string }; SectionChildrens?: { results: MerckChapter[] } }
interface MerckTopic2 { TopicName?: { value: string }; Body?: { value: string }; Summary?: { value: string } }

function extractMerckSection(componentProps: Record<string, unknown>): MerckSection | null {
  for (const v of Object.values(componentProps)) {
    const item = (v as Record<string, unknown>)?.fields?.data?.item as MerckSection | undefined;
    if (item?.SectionChildrens) return item;
  }
  return null;
}

function extractMerckTopic(componentProps: Record<string, unknown>): MerckTopic2 | null {
  for (const v of Object.values(componentProps)) {
    const fields = (v as Record<string, unknown>)?.fields as Record<string, unknown> | undefined;
    if (fields?.Body || fields?.TopicName) return fields as unknown as MerckTopic2;
    // Also look in data.item
    const item = (fields as Record<string, unknown> | undefined)?.data?.item as MerckTopic2 | undefined;
    if (item?.TopicName || item?.Body) return item;
  }
  return null;
}

function buildMerckSectionText(section: MerckSection): string {
  const lines: string[] = [`# ${section.SectionName?.value ?? "Unknown"}\n`];
  for (const ch of section.SectionChildrens?.results ?? []) {
    lines.push(`\n## ${ch.ChapterName?.value ?? "Chapter"}`);
    const desc = htmlToText(ch.Description?.value ?? "");
    if (desc) lines.push(desc);
    for (const t of ch.ChapterChildren?.results ?? []) {
      lines.push(`\n### ${t.TopicName?.value ?? "Topic"}`);
      const sum = htmlToText(t.Summary?.value ?? "");
      if (sum) lines.push(sum);
      try {
        const subs = JSON.parse(t.InThisTopic?.value ?? "[]") as Array<{ Title: string; Summary: string; Children?: Array<{ Title: string; Summary: string }> }>;
        for (const s of subs) {
          lines.push(`\n#### ${s.Title}`);
          if (s.Summary) lines.push(htmlToText(s.Summary));
          for (const c of s.Children ?? []) { lines.push(`\n##### ${c.Title}`); if (c.Summary) lines.push(htmlToText(c.Summary)); }
        }
      } catch { /* ignore */ }
    }
  }
  return lines.join("\n");
}

async function scrapeMerck(url: string, folder: string): Promise<boolean> {
  const result = await fetchWithRetry(url);
  if (!result) return false;

  const $ = cheerio.load(result.data as string);
  const nextDataRaw = $("#__NEXT_DATA__").html();
  if (!nextDataRaw) {
    const { title, content } = extractStaticPage(result.data as string);
    saveFile(folder, title, content, url, "Merck Veterinary Manual");
    return true;
  }

  const nextData = JSON.parse(nextDataRaw);
  const pageProps = nextData?.props?.pageProps ?? {};
  const componentProps = pageProps?.componentProps ?? {};

  const section = extractMerckSection(componentProps);
  if (section && (section.SectionChildrens?.results?.length ?? 0) > 0) {
    const title = section.SectionName?.value ?? url.split("/").pop() ?? "untitled";
    const content = buildMerckSectionText(section);
    saveFile(folder, title, content, url, "Merck Veterinary Manual");
    return true;
  }

  const routeFields = nextData?.props?.pageProps?.layoutData?.sitecore?.route?.fields;
  if (routeFields) {
    const titleVal = routeFields?.pageTitle?.value || routeFields?.Title?.value || "";
    const bodyVal = routeFields?.Body?.value || routeFields?.TopicBody?.value || "";
    if (titleVal && bodyVal) {
      saveFile(folder, titleVal, htmlToText(bodyVal), url, "Merck Veterinary Manual");
      return true;
    }
  }

  const { title, content } = extractStaticPage(result.data as string);
  saveFile(folder, title, content, url, "Merck Veterinary Manual");
  return true;
}

// ─── GENERIC CHEERIO SCRAPER ──────────────────────────────────────────────────

async function scrapeStatic(url: string, folder: string, source: string): Promise<boolean> {
  const result = await fetchWithRetry(url);
  if (!result) return false;
  const { title, content } = extractStaticPage(result.data as string);
  saveFile(folder, title, content, url, source);
  return true;
}

// ─── PDF SCRAPER ──────────────────────────────────────────────────────────────

async function scrapePDF(url: string, folder: string, source: string): Promise<boolean> {
  const result = await fetchWithRetry(url, { responseType: "arraybuffer" });
  if (!result) return false;
  try {
    // pdf-parse default export varies by bundler — handle both shapes
    const parse = (pdfParse as unknown as { default?: typeof pdfParse }).default ?? pdfParse;
    const parsed = await parse(result.data as Buffer);
    const title = url.split("/").pop()?.replace(/\.pdf$/i, "") ?? "document";
    const content = parsed.text.replace(/\f/g, "\n\n").replace(/[ \t]+/g, " ").trim();
    saveFile(folder, title, content, url, source);
    return true;
  } catch (e) {
    console.warn(`  ✗ PDF parse failed ${url}: ${(e as Error).message}`);
    totalSkipped++;
    return false;
  }
}

// ─── PUBMED API SCRAPER ───────────────────────────────────────────────────────

const NCBI_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

async function scrapePubMedQuery(query: string): Promise<void> {
  console.log(`\n[PubMed] Query: ${query}`);
  const searchUrl = `${NCBI_BASE}/esearch.fcgi?db=pmc&term=${query}&retmax=20&retmode=json&usehistory=y`;
  const searchResult = await fetchWithRetry(searchUrl);
  if (!searchResult) return;

  let ids: string[] = [];
  try {
    const json = JSON.parse(searchResult.data as string);
    ids = json?.esearchresult?.idlist ?? [];
  } catch { return; }

  console.log(`  Found ${ids.length} articles`);

  for (const pmcid of ids.slice(0, 20)) {
    await randomDelay();
    const fetchUrl = `${NCBI_BASE}/efetch.fcgi?db=pmc&id=${pmcid}&rettype=text&retmode=text`;
    const articleResult = await fetchWithRetry(fetchUrl);
    if (!articleResult) continue;

    const text = (articleResult.data as string).trim();
    if (text.length < 200) continue;

    // Extract title from first non-empty line
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const title = lines[0]?.slice(0, 100) || `PMC${pmcid}`;
    saveFile("pubmed/reviews", `PMC${pmcid}_${sanitize(title)}`, text, fetchUrl, "PubMed Central");
  }
}

// ─── SOURCE DEFINITIONS ───────────────────────────────────────────────────────

const MERCK_PHARMACOLOGIE = [
  "https://www.merckvetmanual.com/pharmacology",
  "https://www.merckvetmanual.com/pharmacology/anti-infective-agents",
  "https://www.merckvetmanual.com/pharmacology/anti-infective-agents/antibacterial-agents",
  "https://www.merckvetmanual.com/pharmacology/anti-infective-agents/antifungal-agents",
  "https://www.merckvetmanual.com/pharmacology/anti-infective-agents/antiviral-agents",
  "https://www.merckvetmanual.com/pharmacology/anti-infective-agents/antiparasitic-agents",
  "https://www.merckvetmanual.com/pharmacology/anti-infective-agents/sulfonamides",
  "https://www.merckvetmanual.com/pharmacology/anti-infective-agents/tetracyclines",
  "https://www.merckvetmanual.com/pharmacology/anti-infective-agents/aminoglycosides-and-aminocyclitols",
  "https://www.merckvetmanual.com/pharmacology/anti-infective-agents/fluoroquinolones",
  "https://www.merckvetmanual.com/pharmacology/anti-infective-agents/macrolides-lincosamides-and-streptogramins",
  "https://www.merckvetmanual.com/pharmacology/analgesics",
  "https://www.merckvetmanual.com/pharmacology/anti-inflammatory-agents",
  "https://www.merckvetmanual.com/pharmacology/anti-inflammatory-agents/nonsteroidal-anti-inflammatory-drugs",
  "https://www.merckvetmanual.com/pharmacology/anti-inflammatory-agents/corticosteroids",
  "https://www.merckvetmanual.com/pharmacology/systemic-pharmacotherapeutics-of-the-nervous-system",
  "https://www.merckvetmanual.com/pharmacology/pharmacokinetics",
  "https://www.merckvetmanual.com/pharmacology/anesthetics-and-analgesics",
  "https://www.merckvetmanual.com/pharmacology/sedatives-and-tranquilizers",
  "https://www.merckvetmanual.com/pharmacology/diuretics",
  "https://www.merckvetmanual.com/pharmacology/cardiovascular-drugs",
  "https://www.merckvetmanual.com/pharmacology/gastrointestinal-drugs",
  "https://www.merckvetmanual.com/pharmacology/hormones-and-related-compounds",
  "https://www.merckvetmanual.com/pharmacology/immunologic-drugs",
  "https://www.merckvetmanual.com/pharmacology/antineoplastic-agents",
  "https://www.merckvetmanual.com/pharmacology/drug-residues-in-food-and-fiber",
  "https://www.merckvetmanual.com/pharmacology/antidotes-and-treatment-of-poisoning",
];

const MERCK_PETITS_ANIMAUX = [
  "https://www.merckvetmanual.com/dog-owners",
  "https://www.merckvetmanual.com/cat-owners",
  "https://www.merckvetmanual.com/reproductive-system",
  "https://www.merckvetmanual.com/reproductive-system/reproductive-diseases-of-the-female-small-animal",
  "https://www.merckvetmanual.com/reproductive-system/reproductive-diseases-of-the-male-small-animal",
  "https://www.merckvetmanual.com/reproductive-system/pregnancy-and-parturition",
  "https://www.merckvetmanual.com/behavior",
  "https://www.merckvetmanual.com/behavior/behavior-of-dogs",
  "https://www.merckvetmanual.com/behavior/behavior-of-cats",
  "https://www.merckvetmanual.com/behavior/behavioral-problems-of-dogs",
  "https://www.merckvetmanual.com/behavior/behavioral-problems-of-cats",
];

const MERCK_URGENCES = [
  "https://www.merckvetmanual.com/emergency-medicine-and-critical-care",
  "https://www.merckvetmanual.com/emergency-medicine-and-critical-care/shock-and-dehydration",
  "https://www.merckvetmanual.com/emergency-medicine-and-critical-care/cardiopulmonary-arrest-and-resuscitation",
  "https://www.merckvetmanual.com/emergency-medicine-and-critical-care/emergency-care-of-specific-conditions",
  "https://www.merckvetmanual.com/emergency-medicine-and-critical-care/fluid-therapy",
  "https://www.merckvetmanual.com/emergency-medicine-and-critical-care/wound-management",
  "https://www.merckvetmanual.com/toxicology",
  "https://www.merckvetmanual.com/toxicology/small-animal-toxicology",
  "https://www.merckvetmanual.com/toxicology/food-hazards",
  "https://www.merckvetmanual.com/toxicology/household-hazards",
  "https://www.merckvetmanual.com/toxicology/insecticide-and-acaricide-toxicity",
  "https://www.merckvetmanual.com/toxicology/rodenticide-poisoning",
  "https://www.merckvetmanual.com/toxicology/plant-toxicoses-in-small-animals",
  "https://www.merckvetmanual.com/toxicology/heavy-metal-toxicosis",
  "https://www.merckvetmanual.com/toxicology/mycotoxicoses",
];

const MERCK_INFECTIEUX = [
  "https://www.merckvetmanual.com/infectious-diseases",
  "https://www.merckvetmanual.com/infectious-diseases/bacterial-diseases",
  "https://www.merckvetmanual.com/infectious-diseases/viral-diseases",
  "https://www.merckvetmanual.com/infectious-diseases/fungal-diseases",
  "https://www.merckvetmanual.com/infectious-diseases/zoonoses",
  "https://www.merckvetmanual.com/infectious-diseases/parasitic-diseases",
  "https://www.merckvetmanual.com/infectious-diseases/rickettsial-diseases",
  "https://www.merckvetmanual.com/infectious-diseases/prion-diseases",
];

const MERCK_CLINIQUE = [
  "https://www.merckvetmanual.com/digestive-system",
  "https://www.merckvetmanual.com/digestive-system/diseases-of-the-stomach-and-intestines-in-small-animals",
  "https://www.merckvetmanual.com/digestive-system/hepatic-diseases-in-small-animals",
  "https://www.merckvetmanual.com/digestive-system/pancreatic-diseases-in-small-animals",
  "https://www.merckvetmanual.com/digestive-system/diseases-of-the-esophagus-in-small-animals",
  "https://www.merckvetmanual.com/digestive-system/gastrointestinal-ulcers-in-small-animals",
  "https://www.merckvetmanual.com/respiratory-system",
  "https://www.merckvetmanual.com/respiratory-system/respiratory-diseases-of-small-animals",
  "https://www.merckvetmanual.com/respiratory-system/bronchitis-in-dogs-and-cats",
  "https://www.merckvetmanual.com/respiratory-system/feline-asthma",
  "https://www.merckvetmanual.com/cardiovascular-system",
  "https://www.merckvetmanual.com/cardiovascular-system/heart-disease-in-small-animals",
  "https://www.merckvetmanual.com/cardiovascular-system/heart-failure",
  "https://www.merckvetmanual.com/cardiovascular-system/cardiomyopathy-in-dogs",
  "https://www.merckvetmanual.com/cardiovascular-system/cardiomyopathy-in-cats",
  "https://www.merckvetmanual.com/musculoskeletal-system",
  "https://www.merckvetmanual.com/musculoskeletal-system/musculoskeletal-disorders-in-small-animals",
  "https://www.merckvetmanual.com/musculoskeletal-system/joint-disorders-in-small-animals",
  "https://www.merckvetmanual.com/nervous-system",
  "https://www.merckvetmanual.com/nervous-system/diseases-of-the-spinal-column-and-cord",
  "https://www.merckvetmanual.com/nervous-system/seizure-disorders",
  "https://www.merckvetmanual.com/nervous-system/vestibular-disease",
  "https://www.merckvetmanual.com/urinary-system",
  "https://www.merckvetmanual.com/urinary-system/noninfectious-diseases-of-the-urinary-system-in-small-animals",
  "https://www.merckvetmanual.com/urinary-system/infectious-diseases-of-the-urinary-system-in-small-animals",
  "https://www.merckvetmanual.com/urinary-system/chronic-kidney-disease-in-small-animals",
  "https://www.merckvetmanual.com/eye-and-ear",
  "https://www.merckvetmanual.com/eye-and-ear/ophthalmology",
  "https://www.merckvetmanual.com/eye-and-ear/ear-disorders-of-dogs-and-cats",
  "https://www.merckvetmanual.com/skin-disorders",
  "https://www.merckvetmanual.com/skin-disorders/dermatologic-diseases-of-small-animals",
  "https://www.merckvetmanual.com/skin-disorders/allergic-skin-disorders-of-dogs-and-cats",
  "https://www.merckvetmanual.com/skin-disorders/mange-in-dogs-and-cats",
  "https://www.merckvetmanual.com/endocrine-system",
  "https://www.merckvetmanual.com/endocrine-system/the-adrenal-glands",
  "https://www.merckvetmanual.com/endocrine-system/the-pancreas",
  "https://www.merckvetmanual.com/endocrine-system/the-thyroid-gland",
  "https://www.merckvetmanual.com/endocrine-system/diabetes-mellitus-in-cats",
  "https://www.merckvetmanual.com/endocrine-system/diabetes-mellitus-in-dogs",
  "https://www.merckvetmanual.com/immune-system",
  "https://www.merckvetmanual.com/blood-disorders",
  "https://www.merckvetmanual.com/blood-disorders/anemia",
  "https://www.merckvetmanual.com/blood-disorders/blood-parasites",
  "https://www.merckvetmanual.com/blood-disorders/platelet-disorders",
];

const MERCK_NAC = [
  "https://www.merckvetmanual.com/exotic-and-laboratory-animals",
  "https://www.merckvetmanual.com/exotic-and-laboratory-animals/rabbits",
  "https://www.merckvetmanual.com/exotic-and-laboratory-animals/rodents",
  "https://www.merckvetmanual.com/exotic-and-laboratory-animals/guinea-pigs",
  "https://www.merckvetmanual.com/exotic-and-laboratory-animals/hamsters",
  "https://www.merckvetmanual.com/exotic-and-laboratory-animals/gerbils",
  "https://www.merckvetmanual.com/exotic-and-laboratory-animals/chinchillas",
  "https://www.merckvetmanual.com/exotic-and-laboratory-animals/birds",
  "https://www.merckvetmanual.com/exotic-and-laboratory-animals/reptiles",
  "https://www.merckvetmanual.com/exotic-and-laboratory-animals/ferrets",
  "https://www.merckvetmanual.com/exotic-and-laboratory-animals/hedgehogs",
  "https://www.merckvetmanual.com/exotic-and-laboratory-animals/sugar-gliders",
  "https://www.merckvetmanual.com/exotic-and-laboratory-animals/miniature-pigs",
  "https://www.merckvetmanual.com/exotic-and-laboratory-animals/nonhuman-primates",
];

const MERCK_EQUIN = [
  "https://www.merckvetmanual.com/horse-owners",
  "https://www.merckvetmanual.com/musculoskeletal-system/lameness-in-horses",
  "https://www.merckvetmanual.com/digestive-system/colic-in-horses",
  "https://www.merckvetmanual.com/respiratory-system/respiratory-diseases-of-horses",
  "https://www.merckvetmanual.com/skin-disorders/skin-diseases-of-horses",
  "https://www.merckvetmanual.com/reproductive-system/reproductive-diseases-of-mares",
];

const MERCK_RENTE = [
  "https://www.merckvetmanual.com/beef-cattle",
  "https://www.merckvetmanual.com/dairy-cattle",
  "https://www.merckvetmanual.com/sheep-and-goats",
  "https://www.merckvetmanual.com/swine",
  "https://www.merckvetmanual.com/poultry",
  "https://www.merckvetmanual.com/management-and-nutrition",
];

const MERCK_PARASITO = [
  "https://www.merckvetmanual.com/parasitic-diseases-of-dogs-and-cats",
  "https://www.merckvetmanual.com/gastrointestinal-parasites-of-dogs",
  "https://www.merckvetmanual.com/gastrointestinal-parasites-of-cats",
  "https://www.merckvetmanual.com/external-parasites",
];

const MERCK_NUTRITION = [
  "https://www.merckvetmanual.com/management-and-nutrition/nutrition-small-animals",
  "https://www.merckvetmanual.com/management-and-nutrition/nutrition-cats",
  "https://www.merckvetmanual.com/management-and-nutrition/nutrition-dogs",
  "https://www.merckvetmanual.com/management-and-nutrition/nutritional-requirements-and-related-diseases-of-small-animals",
];

const VCA_URLS = [
  "https://vcahospitals.com/know-your-pet/library/dog",
  "https://vcahospitals.com/know-your-pet/library/cat",
  "https://vcahospitals.com/know-your-pet/drug-library",
  "https://vcahospitals.com/know-your-pet/library/bird",
  "https://vcahospitals.com/know-your-pet/library/rabbit",
  "https://vcahospitals.com/know-your-pet/library/ferret",
  "https://vcahospitals.com/know-your-pet/library/reptile",
  "https://vcahospitals.com/know-your-pet/library/small-mammal",
];

const PETMD_URLS = [
  "https://www.petmd.com/dog/conditions",
  "https://www.petmd.com/cat/conditions",
  "https://www.petmd.com/dog/symptoms",
  "https://www.petmd.com/cat/symptoms",
  "https://www.petmd.com/dog/nutrition",
  "https://www.petmd.com/cat/nutrition",
  "https://www.petmd.com/dog/conditions/cardiovascular",
  "https://www.petmd.com/dog/conditions/digestive",
  "https://www.petmd.com/dog/conditions/endocrine",
  "https://www.petmd.com/dog/conditions/infectious-parasitic",
  "https://www.petmd.com/dog/conditions/neurological",
  "https://www.petmd.com/dog/conditions/respiratory",
  "https://www.petmd.com/dog/conditions/skin",
  "https://www.petmd.com/dog/conditions/urinary",
  "https://www.petmd.com/cat/conditions/cardiovascular",
  "https://www.petmd.com/cat/conditions/digestive",
  "https://www.petmd.com/cat/conditions/endocrine",
  "https://www.petmd.com/cat/conditions/infectious-parasitic",
  "https://www.petmd.com/cat/conditions/neurological",
  "https://www.petmd.com/cat/conditions/respiratory",
  "https://www.petmd.com/cat/conditions/skin",
  "https://www.petmd.com/cat/conditions/urinary",
];

const WSAVA_PDF_URLS = [
  "https://wsava.org/wp-content/uploads/2020/01/WSAVA-Vaccination-Guidelines-2015.pdf",
  "https://wsava.org/wp-content/uploads/2020/01/WSAVA-Nutritional-Assessment-Guidelines-2011.pdf",
  "https://wsava.org/wp-content/uploads/2020/01/Pain-Management-Guidelines-for-Dogs-and-Cats.pdf",
  "https://wsava.org/wp-content/uploads/2020/01/Liver-Standardization-Group-report.pdf",
  "https://wsava.org/wp-content/uploads/2020/01/Global-Dental-Guidelines-2020.pdf",
  "https://wsava.org/wp-content/uploads/2020/01/WSAVA-AMR-guidelines.pdf",
];

const ESCCAP_FR_URLS = [
  "https://esccap.fr/recommandations/",
  "https://esccap.fr/fiche/strongles-digestifs/",
  "https://esccap.fr/fiche/trichures/",
  "https://esccap.fr/fiche/toxocara/",
  "https://esccap.fr/fiche/dipylidium-caninum/",
  "https://esccap.fr/fiche/ectoparasites/",
  "https://esccap.fr/fiche/giardia/",
  "https://esccap.fr/fiche/cryptosporidium/",
  "https://esccap.fr/fiche/leishmaniose/",
  "https://esccap.fr/fiche/dirofilariose/",
  "https://esccap.fr/fiche/thelaziose/",
  "https://esccap.fr/fiche/hepatozoonose/",
  "https://esccap.fr/fiche/babesiose/",
  "https://esccap.fr/fiche/ehrlichiose-et-anaplasmose/",
  "https://esccap.fr/fiche/filaires/",
];

const AAHA_URLS = [
  "https://www.aaha.org/aaha-guidelines/2023-aaha-senior-care-guidelines-for-dogs-and-cats/",
  "https://www.aaha.org/aaha-guidelines/2020-aaha-anesthesia-and-monitoring-guidelines-for-dogs-and-cats/",
  "https://www.aaha.org/aaha-guidelines/2020-aaha-diabetes-management-guidelines-for-dogs-and-cats/",
  "https://www.aaha.org/aaha-guidelines/2022-aaha-pain-management-guidelines-for-dogs-and-cats/",
  "https://www.aaha.org/aaha-guidelines/2019-aaha-dental-care-guidelines-for-dogs-and-cats/",
  "https://www.aaha.org/aaha-guidelines/vaccination-canine-configuration/",
  "https://www.aaha.org/aaha-guidelines/vaccination-feline-configuration/",
  "https://www.aaha.org/aaha-guidelines/2021-aaha-nutrition-and-weight-management-guidelines-for-dogs-and-cats/",
];

const ISFM_URLS = [
  "https://icatcare.org/advice/cat-health/",
  "https://icatcare.org/advice/cat-health/feline-chronic-kidney-disease/",
  "https://icatcare.org/advice/cat-health/diabetes-in-cats/",
  "https://icatcare.org/advice/cat-health/hyperthyroidism-in-cats/",
  "https://icatcare.org/advice/cat-health/hypertrophic-cardiomyopathy/",
  "https://icatcare.org/advice/cat-health/feline-lower-urinary-tract-disease/",
  "https://icatcare.org/advice/cat-health/inflammatory-bowel-disease/",
  "https://icatcare.org/advice/cat-health/lymphoma-in-cats/",
  "https://icatcare.org/advice/cat-health/pancreatitis-in-cats/",
  "https://icatcare.org/advice/cat-health/feline-infectious-peritonitis/",
  "https://icatcare.org/advice/cat-health/cat-flu/",
  "https://icatcare.org/advice/cat-health/feline-leukaemia-virus/",
  "https://icatcare.org/advice/cat-health/feline-immunodeficiency-virus/",
];

const WOAH_URLS = [
  "https://www.woah.org/en/disease/anthrax/",
  "https://www.woah.org/en/disease/bovine-brucellosis/",
  "https://www.woah.org/en/disease/canine-distemper/",
  "https://www.woah.org/en/disease/rabies/",
  "https://www.woah.org/en/disease/leishmaniosis/",
  "https://www.woah.org/en/disease/leptospirosis/",
  "https://www.woah.org/en/disease/q-fever/",
  "https://www.woah.org/en/disease/toxoplasmosis/",
  "https://www.woah.org/en/disease/west-nile-fever/",
  "https://www.woah.org/en/disease/cat-parvoviral-disease/",
  "https://www.woah.org/en/disease/feline-caliciviral-disease/",
  "https://www.woah.org/en/disease/feline-herpesviral-rhinotracheitis/",
  "https://www.woah.org/en/disease/infectious-canine-hepatitis/",
  "https://www.woah.org/en/disease/canine-parvovirus-disease/",
];

const FRANCE_URLS = [
  "https://www.veterinaire.fr/communications/actualites",
  "https://www.veterinaire.fr/exercer-la-profession-veterinaire/la-reglementation",
  "https://www.veterinaire.fr/exercer-la-profession-veterinaire/la-deontologie",
  "https://agriculture.gouv.fr/le-medicament-veterinaire",
  "https://agriculture.gouv.fr/antibioresistance-en-medecine-veterinaire",
  "https://agriculture.gouv.fr/les-vaccins-veterinaires",
];

const CB_URLS = [
  "https://www.cliniciansbrief.com/topics/pharmacology",
  "https://www.cliniciansbrief.com/topics/emergency-critical-care",
  "https://www.cliniciansbrief.com/topics/dermatology",
  "https://www.cliniciansbrief.com/topics/internal-medicine",
  "https://www.cliniciansbrief.com/topics/cardiology",
  "https://www.cliniciansbrief.com/topics/oncology",
  "https://www.cliniciansbrief.com/topics/neurology",
  "https://www.cliniciansbrief.com/topics/ophthalmology",
  "https://www.cliniciansbrief.com/topics/behavior",
  "https://www.cliniciansbrief.com/topics/nutrition",
  "https://www.cliniciansbrief.com/topics/dentistry",
  "https://www.cliniciansbrief.com/topics/exotic-animal-medicine",
];

const PUBMED_QUERIES = [
  "veterinary+pharmacology+review+open+access",
  "feline+chronic+kidney+disease+treatment",
  "canine+diabetes+mellitus+management",
  "veterinary+emergency+critical+care+review",
  "small+animal+anesthesia+protocol",
  "feline+hyperthyroidism+treatment+review",
  "canine+lymphoma+chemotherapy+protocol",
  "veterinary+antimicrobial+resistance",
  "feline+lower+urinary+tract+disease+treatment",
  "canine+osteoarthritis+pain+management",
];

// ─── BATCH RUNNER ─────────────────────────────────────────────────────────────

async function runBatch(
  label: string,
  urls: string[],
  folder: string,
  fn: (url: string, folder: string) => Promise<boolean | void>
): Promise<void> {
  const total = urls.length;
  console.log(`\n${"─".repeat(60)}`);
  console.log(`[${label}] ${total} URLs → documents/${folder}/`);
  console.log("─".repeat(60));

  for (let i = 0; i < urls.length; i++) {
    console.log(`[${i + 1}/${total}] ${urls[i]}`);
    const fetched = await fn(urls[i], folder);
    // Only delay after a real network fetch (not a skip/404/cached)
    if (fetched !== false && i < urls.length - 1) await randomDelay();
  }
}

// ─── INDEX + METADATA GENERATION ─────────────────────────────────────────────

function generateIndex(): void {
  const byFolder: Record<string, FileMeta[]> = {};
  for (const m of metadata) {
    if (!byFolder[m.folder]) byFolder[m.folder] = [];
    byFolder[m.folder].push(m);
  }

  const lines = ["# Veterinary Knowledge Base — Index", "", `Generated: ${new Date().toISOString()}`, `Total files: ${metadata.length}`, ""];

  for (const [folder, files] of Object.entries(byFolder).sort()) {
    const totalKB = (files.reduce((a, f) => a + f.sizeBytes, 0) / 1024).toFixed(0);
    lines.push(`\n## ${folder} (${files.length} files, ${totalKB} KB)\n`);
    for (const f of files.sort((a, b) => a.filename.localeCompare(b.filename))) {
      lines.push(`- [${f.filename}](./${f.folder}/${f.filename})`);
    }
  }

  fs.writeFileSync(path.join(DOCS_ROOT, "INDEX.md"), lines.join("\n"), "utf-8");
  console.log("\n✓ INDEX.md written");
}

function generateMetadata(): void {
  const totalBytes = metadata.reduce((a, m) => a + m.sizeBytes, 0);
  const summary = {
    generatedAt: new Date().toISOString(),
    totalFiles: metadata.length,
    totalSizeMB: (totalBytes / 1024 / 1024).toFixed(2),
    skipped: totalSkipped,
    files: metadata,
  };
  fs.writeFileSync(path.join(DOCS_ROOT, "METADATA.json"), JSON.stringify(summary, null, 2), "utf-8");
  console.log("✓ METADATA.json written");
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("═".repeat(60));
  console.log("  LEASH-AI — Veterinary Knowledge Base Scraper");
  console.log(`  Started: ${new Date().toISOString()}`);
  console.log("═".repeat(60));

  ensureFolders();

  // ── MERCK ──────────────────────────────────────────────────────
  await runBatch("Merck — Pharmacologie", MERCK_PHARMACOLOGIE, "merck/pharmacologie", scrapeMerck);
  await runBatch("Merck — Petits animaux", MERCK_PETITS_ANIMAUX, "merck/petits-animaux", scrapeMerck);
  await runBatch("Merck — Urgences & Toxicologie", MERCK_URGENCES, "merck/urgences-toxicologie", scrapeMerck);
  await runBatch("Merck — Infectieux & Zoonoses", MERCK_INFECTIEUX, "merck/infectieux-zoonoses", scrapeMerck);
  await runBatch("Merck — Clinique systèmes", MERCK_CLINIQUE, "merck/clinique-systemes", scrapeMerck);
  await runBatch("Merck — NAC & Exotiques", MERCK_NAC, "merck/nac-exotiques", scrapeMerck);
  await runBatch("Merck — Équin", MERCK_EQUIN, "merck/equin", scrapeMerck);
  await runBatch("Merck — Animaux de rente", MERCK_RENTE, "merck/rente", scrapeMerck);
  await runBatch("Merck — Parasitologie", MERCK_PARASITO, "merck/parasitologie", scrapeMerck);
  await runBatch("Merck — Nutrition", MERCK_NUTRITION, "merck/nutrition", scrapeMerck);

  // ── VCA ────────────────────────────────────────────────────────
  await runBatch("VCA Hospitals", VCA_URLS, "clinique/vca",
    (url, folder) => scrapeStatic(url, folder, "VCA Animal Hospitals"));

  // ── PETMD ──────────────────────────────────────────────────────
  await runBatch("PetMD", PETMD_URLS, "clinique/petmd",
    (url, folder) => scrapeStatic(url, folder, "PetMD"));

  // ── WSAVA PDFs ─────────────────────────────────────────────────
  await runBatch("WSAVA Guidelines (PDFs)", WSAVA_PDF_URLS, "guidelines/wsava",
    (url, folder) => scrapePDF(url, folder, "WSAVA"));

  // ── ESCCAP France ──────────────────────────────────────────────
  await runBatch("ESCCAP France", ESCCAP_FR_URLS, "france/esccap-fr",
    (url, folder) => scrapeStatic(url, folder, "ESCCAP France"));

  // ── AAHA ───────────────────────────────────────────────────────
  await runBatch("AAHA Guidelines", AAHA_URLS, "guidelines/aaha",
    (url, folder) => scrapeStatic(url, folder, "AAHA"));

  // ── ISFM / iCatCare ────────────────────────────────────────────
  await runBatch("ISFM / iCatCare", ISFM_URLS, "guidelines/isfm",
    (url, folder) => scrapeStatic(url, folder, "ISFM / iCatCare"));

  // ── WOAH ───────────────────────────────────────────────────────
  await runBatch("WOAH / OIE", WOAH_URLS, "guidelines/woah",
    (url, folder) => scrapeStatic(url, folder, "WOAH"));

  // ── France ─────────────────────────────────────────────────────
  await runBatch("France — Réglementation", FRANCE_URLS, "france/reglementation",
    (url, folder) => scrapeStatic(url, folder, "Réglementation française"));

  // ── Clinician's Brief ──────────────────────────────────────────
  await runBatch("Clinician's Brief", CB_URLS, "clinique/cliniciansbrief",
    (url, folder) => scrapeStatic(url, folder, "Clinician's Brief"));

  // ── PubMed ─────────────────────────────────────────────────────
  console.log(`\n${"─".repeat(60)}`);
  console.log("[PubMed Central] Open-access veterinary reviews");
  console.log("─".repeat(60));
  for (const query of PUBMED_QUERIES) {
    await scrapePubMedQuery(query);
    await randomDelay();
  }

  // ── SUMMARY ────────────────────────────────────────────────────
  generateIndex();
  generateMetadata();

  const totalMB = (metadata.reduce((a, m) => a + m.sizeBytes, 0) / 1024 / 1024).toFixed(1);
  console.log("\n" + "═".repeat(60));
  console.log(`  DONE: ${totalSaved} files saved, ${totalSkipped} skipped`);
  console.log(`  Total: ~${totalMB} MB of veterinary knowledge`);
  console.log(`  Ended: ${new Date().toISOString()}`);
  console.log("═".repeat(60));
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
