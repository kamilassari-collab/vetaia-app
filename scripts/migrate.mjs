import pg from 'pg';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env
const envFile = readFileSync(resolve(__dirname, '../.env.local'), 'utf8');
const env = Object.fromEntries(
  envFile.split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const PROJECT_REF = 'migkqqhrtwkpivszaxtt';
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

const SQL = `
-- Create tables (safe to re-run)
create table if not exists patients (
  id uuid default gen_random_uuid() primary key,
  vet_id text not null,
  name text not null,
  species text not null,
  breed text,
  sex text,
  birth_date date,
  weight_kg numeric(5,2),
  microchip text,
  owner_name text,
  owner_phone text,
  notes text,
  created_at timestamp with time zone default now()
);

create table if not exists consultations (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references patients(id) on delete cascade,
  vet_id text not null,
  date timestamp with time zone default now(),
  raw_notes text,
  soap_report text,
  intent text,
  created_at timestamp with time zone default now()
);

create table if not exists chat_messages (
  id uuid default gen_random_uuid() primary key,
  consultation_id uuid references consultations(id) on delete cascade,
  role text not null,
  content text not null,
  mode text default 'chat',
  created_at timestamp with time zone default now()
);

alter table if exists patients enable row level security;
alter table if exists consultations enable row level security;
alter table if exists chat_messages enable row level security;
`;

// Try regions in order
const REGIONS = ['eu-west-1', 'eu-central-1', 'us-east-1', 'us-west-1', 'ap-southeast-1'];

async function tryConnect(host) {
  const client = new pg.Client({
    host,
    port: 5432,
    database: 'postgres',
    user: `postgres.${PROJECT_REF}`,
    password: SERVICE_ROLE_KEY,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  });
  await client.connect();
  return client;
}

async function main() {
  let client = null;

  for (const region of REGIONS) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    try {
      console.log(`Trying ${host}…`);
      client = await tryConnect(host);
      console.log(`✓ Connected via ${host}`);
      break;
    } catch (e) {
      console.log(`  ✗ ${e.message}`);
    }
  }

  if (!client) {
    console.error('\n❌ Could not connect to any pooler region.');
    process.exit(1);
  }

  try {
    await client.query(SQL);
    console.log('\n✅ Migration complete — tables created successfully.');

    // Verify
    const res = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('patients', 'consultations', 'chat_messages')
      ORDER BY table_name;
    `);
    console.log('Tables in DB:', res.rows.map(r => r.table_name).join(', '));
  } finally {
    await client.end();
  }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
