/**
 * scrape-pubmed.ts
 * Fetches clean plain-text PubMed abstracts for veterinary topics.
 * Run: npx tsx scripts/scrape-pubmed.ts
 */

import axios from "axios";
import * as fs from "fs";
import * as path from "path";

const PUBMED_DIR = path.join(__dirname, "..", "documents", "pubmed", "reviews");

function sanitize(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, "-").replace(/\s+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "").slice(0, 110);
}
function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

let saved = 0;

const VET_QUERIES = [
  "feline chronic kidney disease management",
  "canine diabetes mellitus treatment",
  "feline hypertrophic cardiomyopathy",
  "feline hyperthyroidism methimazole",
  "canine lymphoma chemotherapy",
  "small animal anesthesia monitoring",
  "feline infectious peritonitis treatment",
  "canine parvovirus treatment",
  "veterinary antimicrobial resistance",
  "canine leptospirosis treatment",
  "leishmaniasis dog miltefosine",
  "canine atopic dermatitis oclacitinib",
  "gastric dilatation volvulus dog",
  "urethral obstruction cat treatment",
  "canine hypoadrenocorticism addison",
  "rabbit gastrointestinal stasis",
  "feline lower urinary tract disease",
  "canine osteoarthritis pain management",
  "veterinary fluid therapy shock",
  "feline pancreatitis treatment",
  "canine epilepsy phenobarbital",
  "dog cat vaccination protocol",
  "feline obesity weight management",
  "canine intervertebral disc disease",
  "heartworm dirofilaria treatment prevention",
  "veterinary NSAIDs pharmacology",
  "canine chronic kidney disease",
  "feline diabetes mellitus insulin",
  "dog cat toxicology poisoning",
  "veterinary emergency critical care",
];

async function search(query: string): Promise<string[]> {
  await delay(400); // stay under NCBI 3 req/s limit
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=20&retmode=json&sort=relevance`;
  try {
    const r = await axios.get(url, { timeout: 15000, headers: { "User-Agent": "LeashAI/1.0 (research)" } });
    return r.data?.esearchresult?.idlist ?? [];
  } catch { return []; }
}

async function fetchAbstracts(ids: string[]): Promise<string> {
  await delay(400);
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${ids.join(",")}&rettype=abstract&retmode=text`;
  try {
    const r = await axios.get(url, { timeout: 20000, headers: { "User-Agent": "LeashAI/1.0 (research)" } });
    return r.data as string;
  } catch { return ""; }
}

async function main() {
  fs.mkdirSync(PUBMED_DIR, { recursive: true });
  const seenIds = new Set<string>();

  // Pre-populate seenIds from already saved files
  for (const f of fs.readdirSync(PUBMED_DIR)) {
    const m = f.match(/PMID(\d+)/);
    if (m) seenIds.add(m[1]);
  }

  console.log(`Starting PubMed scrape (${seenIds.size} already saved)...`);

  for (const query of VET_QUERIES) {
    console.log(`\nQuery: "${query}"`);
    const ids = await search(query);
    if (ids.length === 0) { console.log("  → 0 results"); continue; }

    const newIds = ids.filter(id => !seenIds.has(id)).slice(0, 12);
    console.log(`  → ${ids.length} found, ${newIds.length} new`);
    if (newIds.length === 0) continue;

    newIds.forEach(id => seenIds.add(id));

    const raw = await fetchAbstracts(newIds);
    if (!raw.trim()) { console.log("  → empty response"); continue; }

    // Split individual articles — each starts with "N. Title\n"
    const articles = raw.split(/\n\n(?=\d+\. )/).filter(a => a.length > 150);

    for (const article of articles) {
      const pmidMatch = article.match(/PMID-\s*(\d+)|PMID:\s*(\d+)/);
      const pmid = pmidMatch?.[1] ?? pmidMatch?.[2];
      if (!pmid) continue;

      // Vet relevance filter
      const lower = article.toLowerCase();
      const isVet = ["dog","cat","feline","canine","veterinar","rabbit","ferret","equine","bovine","porcine","avian","reptile","rodent","exotic"].some(w => lower.includes(w));
      if (!isVet) { console.log(`  ⏭  PMID ${pmid} — not vet-relevant`); continue; }

      // Extract title from "1. Title\n"
      const titleMatch = article.match(/^\d+\.\s+(.+?)(?:\n|$)/);
      const title = titleMatch?.[1]?.trim().slice(0, 100) ?? `PMID${pmid}`;

      const filename = `PMID${pmid}_${sanitize(title)}.txt`;
      const fullPath = path.join(PUBMED_DIR, filename);
      if (fs.existsSync(fullPath)) { console.log(`  ⏭  ${filename}`); continue; }

      const body = `Source: PubMed\nURL: https://pubmed.ncbi.nlm.nih.gov/${pmid}/\nTitle: ${title}\nPMID: ${pmid}\n\n${"=".repeat(60)}\n\n${article.trim()}`;
      fs.writeFileSync(fullPath, body, "utf-8");
      console.log(`  ✓ ${filename} (${(body.length / 1024).toFixed(0)} KB)`);
      saved++;
    }
  }

  console.log(`\nDone — ${saved} PubMed abstracts saved.`);
}

main().catch(console.error);
