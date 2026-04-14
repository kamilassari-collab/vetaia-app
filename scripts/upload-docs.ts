import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { OpenAIEmbeddings } from '@langchain/openai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const CLEAR_FIRST = process.argv.includes('--fresh');

if (!SUPABASE_URL || !SUPABASE_KEY || !OPENAI_API_KEY) {
  console.error('❌ Missing env variables. Check .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: OPENAI_API_KEY,
  modelName: 'text-embedding-3-small',
});

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 50,
  separators: ['\n\n', '\n', ' ', ''],
});

// Recursively collect all .txt files, returning paths relative to docsDir
function collectTxtFiles(dir: string, base: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    const rel  = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      results.push(...collectTxtFiles(full, rel));
    } else if (entry.isFile() && entry.name.endsWith('.txt')) {
      results.push(rel);
    }
  }
  return results;
}

async function getAlreadyUploadedFilenames(): Promise<Set<string>> {
  const names = new Set<string>();
  let page = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('documents')
      .select('metadata')
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (error || !data || data.length === 0) break;
    for (const row of data) {
      const fn = (row.metadata as Record<string, string>)?.filename;
      if (fn) names.add(fn);
    }
    if (data.length < pageSize) break;
    page++;
  }
  return names;
}

async function main() {
  const docsDir = path.resolve(process.cwd(), 'documents');
  const files = collectTxtFiles(docsDir, '');

  console.log(`\n📁 Found ${files.length} file(s) in documents/ (recursive)\n`);

  if (CLEAR_FIRST) {
    console.log('🗑  --fresh: deleting all existing rows from documents table…');
    const { error } = await supabase.from('documents').delete().neq('id', 0);
    if (error) console.error('   ❌ Could not clear table:', error.message);
    else console.log('   ✅ Table cleared.\n');
  }

  console.log('🔍 Checking already-uploaded files…');
  const alreadyUploaded = await getAlreadyUploadedFilenames();
  console.log(`   ${alreadyUploaded.size} file(s) already in Supabase — will skip those.\n`);

  let totalChunks = 0;
  let skipped = 0;

  for (const relPath of files) {
    if (alreadyUploaded.has(relPath)) {
      console.log(`⏭  ${relPath} — already uploaded, skipping`);
      skipped++;
      continue;
    }
    const fullPath = path.join(docsDir, relPath);
    const content = fs.readFileSync(fullPath, 'utf-8');

    const docs = await splitter.createDocuments([content], [{ filename: relPath }]);
    docs.forEach((doc, i) => {
      doc.metadata.chunk_index = i;
      doc.metadata.filename = relPath;
    });

    console.log(`📄 ${relPath} → ${docs.length} chunks`);

    try {
      await SupabaseVectorStore.fromDocuments(docs, embeddings, {
        client: supabase,
        tableName: 'documents',
        queryName: 'match_documents',
      });
      console.log(`   ✅ Uploaded ${docs.length} chunks`);
      totalChunks += docs.length;
    } catch (err) {
      console.error(`   ❌ Failed: ${relPath}`, err);
    }
  }

  console.log(`\n🎉 Done. Uploaded: ${totalChunks} chunks, Skipped: ${skipped} file(s).\n`);
}

main();
