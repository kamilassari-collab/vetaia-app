import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { getPatient, getPatientHistory, appendRawNotes, updateConsultationReport, calculateAge } from '@/lib/patients';

// ─── Model config ───────────────────────────────────────────────────────────────
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

// ─── Source label registry ──────────────────────────────────────────────────────
// Keys match filename stems (without .txt) stored in Supabase metadata
const SOURCE_LABELS: Record<string, { name: string; url: string; type: string }> = {
  // Merck Veterinary Manual (existing files use Sitecore title as name)
  'Pharmacology':                         { name: 'Merck Vet Manual — Pharmacologie',          url: 'https://www.merckvetmanual.com/pharmacology',                        type: 'Reference' },
  'Digestive_System':                     { name: 'Merck Vet Manual — Système digestif',        url: 'https://www.merckvetmanual.com/digestive-system',                    type: 'Reference' },
  'Infectious_Diseases':                  { name: 'Merck Vet Manual — Maladies infectieuses',   url: 'https://www.merckvetmanual.com/infectious-diseases',                 type: 'Reference' },
  'Emergency_Medicine_and_Critical_Care': { name: 'Merck Vet Manual — Urgences & soins intensifs', url: 'https://www.merckvetmanual.com/emergency-medicine-and-critical-care', type: 'Reference' },
  'Respiratory_System':                   { name: 'Merck Vet Manual — Système respiratoire',   url: 'https://www.merckvetmanual.com/respiratory-system',                  type: 'Reference' },
  'Circulatory_System':                   { name: 'Merck Vet Manual — Système cardiovasculaire', url: 'https://www.merckvetmanual.com/cardiovascular-system',              type: 'Reference' },
  'Urinary_System':                       { name: 'Merck Vet Manual — Système urinaire',        url: 'https://www.merckvetmanual.com/urinary-system',                      type: 'Reference' },
  'Nervous_System':                       { name: 'Merck Vet Manual — Système nerveux',         url: 'https://www.merckvetmanual.com/nervous-system',                      type: 'Reference' },
  'Reproductive_System':                  { name: 'Merck Vet Manual — Système reproducteur',    url: 'https://www.merckvetmanual.com/reproductive-system',                 type: 'Reference' },
  'Endocrine_System':                     { name: 'Merck Vet Manual — Système endocrinien',     url: 'https://www.merckvetmanual.com/endocrine-system',                    type: 'Reference' },
  'Integumentary_System':                 { name: 'Merck Vet Manual — Dermatologie',            url: 'https://www.merckvetmanual.com/integumentary-system',                type: 'Reference' },
  'Musculoskeletal_System':               { name: 'Merck Vet Manual — Système musculo-squelettique', url: 'https://www.merckvetmanual.com/musculoskeletal-system',        type: 'Reference' },
  'Toxicology':                           { name: 'Merck Vet Manual — Toxicologie',             url: 'https://www.merckvetmanual.com/toxicology',                          type: 'Reference' },
  'Behavior':                             { name: 'Merck Vet Manual — Comportement animal',     url: 'https://www.merckvetmanual.com/behavior',                           type: 'Reference' },
  'Ear_Disorders':                        { name: 'Merck Vet Manual — Oreille',                 url: 'https://www.merckvetmanual.com/eye-and-ear',                         type: 'Reference' },
  'Cat_Owners':                           { name: 'Merck Vet Manual — Guide félin',             url: 'https://www.merckvetmanual.com/cat-owners',                          type: 'Reference' },
  // IRIS Kidney
  'iris_kidney_guidelines':   { name: 'IRIS — Recommandations IRC chien/chat',   url: 'https://www.iris-kidney.com/iris-guidelines-1',     type: 'Guideline International' },
  'iris_kidney_staging':      { name: 'IRIS — Staging insuffisance rénale',      url: 'https://www.iris-kidney.com/iris-staging-system',   type: 'Guideline International' },
  'iris_hypertension':        { name: 'IRIS — Hypertension systémique',          url: 'https://www.iris-kidney.com/hypertension',          type: 'Guideline International' },
  'iris_proteinuria':         { name: 'IRIS — Protéinurie',                      url: 'https://www.iris-kidney.com/proteinuria',           type: 'Guideline International' },
  // WSAVA / RECOVER / ISCAID
  'wsava_guidelines':         { name: 'WSAVA — Guidelines vaccination & nutrition', url: 'https://wsava.org/global-guidelines/',           type: 'Guideline International' },
  'recover_cpr_2024':         { name: 'RECOVER — CPR Guidelines 2024',           url: 'https://recoverinitiative.org/2024-guidelines/',    type: 'Guideline International' },
  'iscaid_guidelines':        { name: 'ISCAID — Antimicrobial Use Guidelines',   url: 'https://www.iscaid.org/guidelines',                 type: 'Guideline International' },
  'vetlit_consensus_statements': { name: 'VetLit — Consensus statements',        url: 'https://vetlit.org/consensus-statements-and-guidelines/', type: 'Guideline International' },
  // Sources françaises officielles
  'anses_medicaments_veterinaires':  { name: 'ANSES — Médicaments vétérinaires autorisés en France', url: 'https://www.anses.fr/fr/portails/medicaments-veterinaires', type: 'Réglementation FR' },
  'ordre_veterinaires_fiches':       { name: 'Ordre National des Vétérinaires — Fiches professionnelles', url: 'https://www.veterinaire.fr/je-suis-veterinaire/mon-exercice-professionnel/les-fiches-professionnelles', type: 'Réglementation FR' },
  'virbac_pro_cas_cliniques':        { name: 'Virbac Pro — Cas cliniques vétérinaires FR',  url: 'https://pro-fr.virbac.com/home/ressources-scientifiques/cas-cliniques.html', type: 'Cas cliniques FR' },
  'msd_vet_manual_fr':               { name: 'MSD Vet Manual — Version française',          url: 'https://www.msdvetmanual.com/fr/index',                               type: 'Reference' },
  // Internal
  'compte-rendus-types': { name: 'VetaIA — Templates SOAP vétérinaires', url: '', type: 'Interne' },
};

function autoDerive(stem: string): { name: string; url: string; type: string } {
  const parts = stem.split('/');
  const dir1 = parts[0];
  const dir2 = parts[1] ?? '';
  const base = parts[parts.length - 1].replace(/_/g, ' ').replace(/-/g, ' ');

  if (dir1 === 'merck') return { name: `Merck Vet Manual — ${base}`, url: 'https://www.merckvetmanual.com', type: 'Reference' };
  if (dir2 === 'wikivet') return { name: `WikiVet — ${base}`, url: 'https://en.wikivet.net', type: 'Reference' };
  if (dir2 === 'vca')     return { name: `VCA Hospitals — ${base}`, url: 'https://vcahospitals.com/know-your-pet', type: 'Reference' };
  if (dir2 === 'petmd')   return { name: `PetMD — ${base}`, url: 'https://www.petmd.com', type: 'Reference' };
  if (dir2 === 'iris')    return { name: `IRIS — ${base}`, url: 'https://www.iris-kidney.com', type: 'Guideline International' };
  if (dir2 === 'wsava')   return { name: `WSAVA — ${base}`, url: 'https://wsava.org', type: 'Guideline International' };
  if (dir2 === 'woah')    return { name: `WOAH — ${base}`, url: 'https://www.woah.org', type: 'Guideline International' };
  if (dir2 === 'isfm')    return { name: `ISFM — ${base}`, url: 'https://isfm.net', type: 'Guideline International' };
  if (dir1 === 'france')  return { name: `${base}`, url: '', type: 'Réglementation FR' };
  if (dir1 === 'pubmed')  return { name: `PubMed — ${base}`, url: '', type: 'Cas cliniques FR' };
  return { name: base, url: '', type: 'Reference' };
}

function resolveSource(filename: string, excerpt: string): { name: string; url: string; type: string; excerpt: string } {
  const stem = filename.replace(/\.txt$/, '');
  // 1. Exact path match (new relative-path format)
  const exactMatch = SOURCE_LABELS[stem];
  if (exactMatch) return { ...exactMatch, excerpt: excerpt.slice(0, 150) };
  // 2. Basename match (backward compat with old flat filenames)
  const basename = stem.split('/').pop() ?? stem;
  const baseMatch = SOURCE_LABELS[basename];
  if (baseMatch && !stem.includes('/')) return { ...baseMatch, excerpt: excerpt.slice(0, 150) };
  // 3. Auto-derive from directory structure
  const derived = stem.includes('/') ? autoDerive(stem) : (SOURCE_LABELS[basename] ?? { name: basename, url: '', type: 'Reference' });
  return { ...derived, excerpt: excerpt.slice(0, 150) };
}

// ─── IP Rate Limiter ────────────────────────────────────────────────────────────
const DEMO_LIMIT = 8;
const WINDOW_MS  = 24 * 60 * 60 * 1000;

const ipStore = new Map<string, { count: number; resetAt: number }>();

function checkIP(ip: string): { ok: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  let entry = ipStore.get(ip);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    ipStore.set(ip, entry);
  }

  if (entry.count >= DEMO_LIMIT) {
    return { ok: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { ok: true, remaining: DEMO_LIMIT - entry.count, resetAt: entry.resetAt };
}

function getIP(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? '127.0.0.1';
}

// ─── Intent detection ────────────────────────────────────────────────────────────
const NOTE_PATTERNS = [
  /^note\s*:/i,
  /^j'ai noté/i,
  /le patient présente/i,
  /à l'examen/i,
  /la temperatura/i,
  /^poids\s*:/i,
  /^t°/i,
  /^fc\s*:/i,
  /^fr\s*:/i,
  /température\s*:/i,
  /fréquence cardiaque/i,
  /examen clinique/i,
];

const REPORT_KEYWORDS = [
  'compte rendu', 'compte-rendu', 'cr ', '\bcr\b', 'soap',
  'rédige', 'rédiger', 'génère', 'générer', 'rapport',
  'write a report', 'write report', 'consultation report',
  'fiche patient', 'ordonnance', 'résumé de consultation',
  'fin de consultation', 'termine la consultation',
];

// Short conversational or meta questions — answer directly, no RAG needed
const CONVERSATIONAL_PATTERNS = [
  /^(oui|non|ok|d'accord|merci|super|parfait|c'est bon|très bien|ça marche|exact|effectivement|compris|je vois|ah|et alors|et\s*\?|donc\s*\?)/i,
  /^pourrais.tu pr[eé]ciser/i,
  /^(qu'est.ce que tu|que peux.tu|que sais.tu|as.tu des? (infos?|informations?|d[eé]tails?))/i,
  /^(peux.tu|pourrais.tu|est.ce que tu peux|tu peux|tu as)/i,
  /^(comment [çc]a marche|comment tu fonctionnes?|c'est quoi|qu'est.ce que leash)/i,
  /^(aide.moi|help|aide)/i,
  /^\s*.{0,30}\s*\??\s*$/, // very short questions under 30 chars
];

type Intent = 'CONSULTATION_NOTE' | 'GENERATE_REPORT' | 'CONVERSATIONAL' | 'QUESTION';

function detectIntent(question: string): Intent {
  const q = question.toLowerCase().trim();
  if (REPORT_KEYWORDS.some(kw => q.includes(kw))) return 'GENERATE_REPORT';
  if (NOTE_PATTERNS.some(re => re.test(question))) return 'CONSULTATION_NOTE';
  if (CONVERSATIONAL_PATTERNS.some(re => re.test(question.trim()))) return 'CONVERSATIONAL';
  return 'QUESTION';
}

// ─── System prompts ───────────────────────────────────────────────────────────────
const REPORT_SYSTEM_PROMPT = `Tu es un assistant vétérinaire expert. Le vétérinaire t'envoie une dictée ou des notes parlées de sa consultation. Il ne parle PAS en termes médicaux — il parle naturellement, comme il le ferait en consultation : "le chien mange plus", "j'ai senti le ventre il est dur", "le cœur tape vite", "j'ai prescrit de l'amoxicilline".

TON RÔLE : interpréter ce langage naturel et le transformer en compte rendu clinique structuré et précis. Tu ajoutes la terminologie médicale correcte ("anorexie", "abdomen tendu à la palpation", "tachycardie", "amoxicilline-acide clavulanique"). Tu n'inventes pas — tu traduis et structures ce que le vétérinaire a dit.

RÈGLE CRITIQUE : Réponds EXCLUSIVEMENT en français.

RÈGLES DE RÉDACTION :
- Maximum 20 lignes au total — va à l'essentiel
- Utilise la terminologie clinique dans le rapport, même si le vétérinaire ne l'a pas utilisée
- Inclus les dosages exacts si mentionnés (sinon [À COMPLÉTER])
- Ne réinvente pas de symptômes ou d'examens qui n'ont pas été évoqués

FORMAT OBLIGATOIRE (respecte ces titres exacts) :

**Motif de consultation**
[1 phrase — pourquoi l'animal est venu]

**Examen clinique**
[Constantes essentielles + findings — 2-4 lignes max. Traduis le langage naturel en termes cliniques]

**Diagnostic**
[Diagnostic principal. Différentiels si évoqués — 1-2 lignes]

**Traitement**
[Liste courte : molécule — dose — voie — fréquence — durée]

**Consignes et suivi**
[Consignes au propriétaire + signes d'alerte à surveiller + prochain RDV — 2-3 lignes]

Contexte documentaire disponible :`;

// ─── ASCII-safe JSON for HTTP headers (escapes chars > 127, stays valid JSON) ─
function headerJSON(value: unknown): string {
  return JSON.stringify(value).replace(/[\u0080-\uFFFF]/g, (c) =>
    `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`
  );
}

// ─── FLYWHEEL: Supabase service client (shared) ────────────────────────────────
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ─── FLYWHEEL: Extract authenticated user_id from Bearer token ─────────────────
async function getUserId(req: NextRequest): Promise<string | null> {
  try {
    const auth = req.headers.get('authorization') ?? '';
    const token = auth.replace('Bearer ', '').trim();
    if (!token) return null;
    const { data } = await getServiceClient().auth.getUser(token);
    return data.user?.id ?? null;
  } catch { return null; }
}

function getSessionId(req: NextRequest): string | null {
  return req.headers.get('x-session-id') ?? null;
}

// ─── FLYWHEEL: mark_accepted ────────────────────────────────────────────────────
export async function markAccepted(interactionId: string) {
  try {
    await getServiceClient()
      .from('rag_interactions')
      .update({ feedback_type: 'accepted' })
      .eq('id', interactionId);
  } catch (e) { console.warn('[FLYWHEEL] markAccepted failed:', e); }
}

// ─── FLYWHEEL: mark_edited ─────────────────────────────────────────────────────
export async function markEdited(interactionId: string, correctedText: string) {
  try {
    await getServiceClient()
      .from('rag_interactions')
      .update({ feedback_type: 'edited', response_corrected: correctedText })
      .eq('id', interactionId);
  } catch (e) { console.warn('[FLYWHEEL] markEdited failed:', e); }
}

// ─── CORS preflight ─────────────────────────────────────────────────────────────
export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ─── Route ──────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { question, patientId, consultationId } = await req.json();
    // ─── FLYWHEEL: resolve authenticated user ──────────────────────────────────
    const userId = await getUserId(req);
    const sessionId = getSessionId(req);
    if (!question) return new Response(JSON.stringify({ error: 'No question provided' }), { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } });

    // ── Rate limit check ───────────────────────────────────────────────────────
    const ip = getIP(req);
    const limit = checkIP(ip);
    if (!limit.ok) {
      return new Response(
        JSON.stringify({
          error: 'Limite de démonstration atteinte.',
          message: 'Vous avez utilisé toutes vos questions de démonstration. Réservez un appel pour accéder à la version complète.',
          calendly: 'https://calendly.com/kamilassari/30min',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': String(DEMO_LIMIT),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(limit.resetAt),
            ...CORS_HEADERS,
          },
        }
      );
    }

    // ── Fetch patient context if provided ─────────────────────────────────────
    let patientContext = '';
    let rawNotesForReport = '';

    if (patientId) {
      const [patient, history] = await Promise.all([
        getPatient(patientId),
        getPatientHistory(patientId),
      ]);

      if (patient) {
        const ageStr = patient.birth_date ? calculateAge(patient.birth_date) : 'inconnu';
        patientContext = `PATIENT EN CONSULTATION:
Nom: ${patient.name} | Espèce: ${patient.species} | Race: ${patient.breed ?? 'inconnue'} | Âge: ${ageStr} | Poids: ${patient.weight_kg ?? '?'}kg | Sexe: ${patient.sex ?? 'inconnu'}
Propriétaire: ${patient.owner_name ?? 'inconnu'}
${history.length > 0
  ? `HISTORIQUE RÉCENT (${history.length} consultations):\n${history.slice(0, 5).map((c, i) => `  ${i + 1}. ${new Date(c.date).toLocaleDateString('fr-FR')}: ${(c.soap_report || c.raw_notes || 'Aucune note').slice(0, 200)}`).join('\n')}`
  : 'Première consultation'}`;

        // For report generation, get current consultation raw notes
        if (consultationId && history.length > 0) {
          const currentConsult = history.find(c => c.id === consultationId);
          if (currentConsult?.raw_notes) rawNotesForReport = currentConsult.raw_notes;
        }
      }
    }

    // ── Intent detection ───────────────────────────────────────────────────────
    const intent = detectIntent(question);

    // ── Handle CONVERSATIONAL ─────────────────────────────────────────────────
    if (intent === 'CONVERSATIONAL') {
      const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY! });
      const result = streamText({
        model: openai(OPENAI_MODEL),
        temperature: 0.4,
        maxRetries: 3,
        messages: [
          {
            role: 'system',
            content: `Tu es VetaIA, un assistant clinique vétérinaire. Réponds de façon naturelle et concise à cette question conversationnelle. Si la question est vague ("tu as plus d'infos ?", "peux-tu préciser ?"), demande poliment de quelle pathologie, molécule ou cas clinique il s'agit pour pouvoir t'être utile.${patientContext ? `\n\n${patientContext}` : ''}`,
          },
          { role: 'user', content: question },
        ],
      });
      return result.toTextStreamResponse({
        headers: {
          'X-Sources': headerJSON([]),
          'X-RateLimit-Remaining': String(limit.remaining),
          'X-Response-Mode': 'chat',
          'Access-Control-Expose-Headers': 'X-Sources, X-RateLimit-Remaining, X-Response-Mode',
          ...CORS_HEADERS,
        },
      });
    }

    // ── Handle CONSULTATION_NOTE ──────────────────────────────────────────────
    if (intent === 'CONSULTATION_NOTE' && consultationId) {
      await appendRawNotes(consultationId, question);

      const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY! });
      console.log('[api/chat] CONSULTATION_NOTE →', { model: OPENAI_MODEL, patientId, questionLen: question.length });
      const result = streamText({
        model: openai(OPENAI_MODEL),
        temperature: 0.2,
        maxRetries: 3,
        messages: [
          {
            role: 'system',
            content: `Tu es un assistant vétérinaire. Le vétérinaire vient de dicter une note clinique. Confirme brièvement que la note a été enregistrée et fais un résumé en 1 phrase clinique concise. Sois direct et professionnel.${patientContext ? `\n\n${patientContext}` : ''}`,
          },
          { role: 'user', content: question },
        ],
      });

      return result.toTextStreamResponse({
        headers: {
          'X-Sources': headerJSON([]),
          'X-RateLimit-Remaining': String(limit.remaining),
          'X-Response-Mode': 'note',
          'Access-Control-Expose-Headers': 'X-Sources, X-RateLimit-Remaining, X-Response-Mode',
          ...CORS_HEADERS,
        },
      });
    }

    // ── Handle GENERATE_REPORT ────────────────────────────────────────────────
    if (intent === 'GENERATE_REPORT') {
      const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY! });
      console.log('[api/chat] GENERATE_REPORT →', { model: OPENAI_MODEL, patientId, consultationId, notesLen: rawNotesForReport.length });
      const reportPromptContent = [
        patientContext ? `${patientContext}\n\n` : '',
        rawNotesForReport ? `NOTES DE CONSULTATION:\n${rawNotesForReport}\n\n` : '',
        `${REPORT_SYSTEM_PROMPT}\nAucun document spécifique trouvé. Utilise les notes de consultation et tes connaissances vétérinaires générales.`,
      ].join('');

      const result = streamText({
        model: openai(OPENAI_MODEL),
        temperature: 0.2,
        maxRetries: 3,
        messages: [
          { role: 'system', content: reportPromptContent },
          { role: 'user', content: question },
        ],
        onFinish: async ({ text }) => {
          if (consultationId && text) {
            await updateConsultationReport(consultationId, text, rawNotesForReport || undefined);
          }
          // FLYWHEEL: log SOAP feedback
          if (userId && text) {
            try {
              const sections = ['subjective', 'objective', 'assessment', 'plan'];
              const soapBlocks = text.split(/\*\*[SOAP].*?\*\*/);
              await Promise.all(sections.map((section, i) => {
                const generated = soapBlocks[i + 1]?.trim() ?? '';
                if (!generated) return Promise.resolve();
                return getServiceClient().from('soap_notes_feedback').insert({
                  user_id: userId,
                  section,
                  generated,
                  was_accepted: null,
                });
              }));
            } catch (e) { console.warn('[FLYWHEEL] soap_notes_feedback insert failed:', e); }
          }
        },
      });

      return result.toTextStreamResponse({
        headers: {
          'X-Sources': headerJSON([]),
          'X-RateLimit-Remaining': String(limit.remaining),
          'X-Response-Mode': 'report',
          'Access-Control-Expose-Headers': 'X-Sources, X-RateLimit-Remaining, X-Response-Mode',
          ...CORS_HEADERS,
        },
      });
    }

    // ── Handle QUESTION (default RAG flow) ────────────────────────────────────
    const supabase = getServiceClient();

    // Vector search — direct OpenAI embeddings API, no langchain dependency
    let context = '';
    let sources: ReturnType<typeof resolveSource>[] = [];
    let retrievedChunks: unknown[] = []; // FLYWHEEL
    try {
      // 1. Embed the question via OpenAI REST API directly
      const embedRes = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        body: JSON.stringify({ model: 'text-embedding-3-small', input: question }),
      });
      const embédJson = await embedRes.json();
      const queryEmbedding: number[] = embédJson.data?.[0]?.embedding;

      type RawRow = { id: number; content: string; metadata: Record<string, string>; similarity: number };

      // FLYWHEEL: 2a+2b. Search clinic knowledge AND common base in parallel
      const [clinicResult, commonResult] = await Promise.all([
        userId
          ? Promise.resolve(supabase.rpc('match_clinic_knowledge', {
              query_embedding: queryEmbedding,
              p_user_id: userId,
              match_threshold: 0.35,
              match_count: 3,
            })).catch((e: unknown) => { console.warn('[FLYWHEEL] clinic_knowledge failed:', e); return { data: null }; })
          : Promise.resolve({ data: null }),
        supabase.rpc('match_documents', {
          query_embedding: queryEmbedding,
          match_count: 12,
          filter: {},
        }),
      ]);

      const clinicRows: RawRow[] = (clinicResult.data as RawRow[] | null) ?? [];
      const { data: rows, error: rpcError } = commonResult;
      console.log('[FLYWHEEL] clinic_knowledge:', clinicRows.length, 'rows');

      if (rpcError) throw new Error(rpcError.message);

      console.log('[api/chat] RAG: got', rows?.length ?? 0, 'rows from match_documents');

      // 3. Merge: clinic results first, then common — filter and deduplicate
      const commonRows: RawRow[] = (rows as RawRow[]).filter((r: RawRow) =>
        r.similarity >= 0.35 &&
        !String(r.metadata?.filename ?? '').includes('compte-rendus-types')
      ).slice(0, 5); // FLYWHEEL: limit common to 5

      // FLYWHEEL: clinic results prepended
      const allRows = [...clinicRows, ...commonRows];

      const MAX_CONTEXT_CHARS = 6000;
      context = allRows.map((r: RawRow) => r.content).join('\n\n---\n\n').slice(0, MAX_CONTEXT_CHARS);
      retrievedChunks = allRows.map((r: RawRow) => ({ content: r.content.slice(0, 200), similarity: r.similarity })); // FLYWHEEL

      const seen = new Set<string>();
      sources = allRows
        .filter((r: RawRow) => {
          const fn = r.metadata?.filename ?? '';
          if (seen.has(fn)) return false;
          seen.add(fn);
          return true;
        })
        .slice(0, 3)
        .map((r: RawRow) => resolveSource(r.metadata?.filename ?? '', r.content));

    } catch (vecErr) {
      const msg = vecErr instanceof Error ? vecErr.message : String(vecErr);
      console.warn('[api/chat] Vector search failed, falling back to general knowledge:', msg);
    }

    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    console.log('[api/chat] QUESTION →', {
      model: OPENAI_MODEL,
      patientId,
      questionLen: question.length,
      contextLen: context.length,
      sources: sources.map(s => s.name),
    });

    const systemContent = `Tu es VetaIA, second avis clinique vétérinaire en temps réel. Tu t'adresses EXCLUSIVEMENT à des vétérinaires diplômés en exercice.

RÈGLE CRITIQUE : Réponds EXCLUSIVEMENT dans la langue de la question.

━━━ COMPORTEMENT SELON LE TYPE DE QUESTION ━━━

POSOLOGIE / DOSAGE
→ Affiche toujours le calcul explicite si le poids est fourni :
   Molécule : [X mg/kg] × [poids kg] = [dose totale mg]
   Si dose de charge différente : J1 [dose mg] | Entretien [dose mg/j × Xj]
   Voie · Fréquence · Durée
   CI critiques : (2-3 max, les plus importantes cliniquement)
   Source : [référence si dans les documents]

INTERACTION MÉDICAMENTEUSE
→ Mécanisme : [1 ligne]
   Risque : mineur / modéré / majeur
   Conduite : [adapter dose / espacer / contre-indiquer — concis]
   Source : [référence si disponible]

DIAGNOSTIC DIFFÉRENTIEL
→ Si la question est incomplète (espèce, âge, signes cliniques, durée manquants), POSE D'ABORD 2-3 questions ciblées pour affiner — ne liste pas d'emblée 10 DDx génériques.
   Une fois les infos obtenues : DDx par probabilité décroissante, 1-2 signes discriminants par hypothèse, examens prioritaires.

QUESTION CLINIQUE COMPLEXE / AMBIGUË
→ Si plusieurs interprétations sont possibles ou si une information clé manque (espèce, poids, stade, comorbidités), demande cette information avant de répondre. Max 2 questions à la fois, ciblées.

━━━ RÈGLES ABSOLUES ━━━
1. Ton interlocuteur est un confrère — sois direct, précis, clinique. Pas de vulgarisation, pas de paraphrase.
2. Zéro mise en garde grand public. Zéro "consultez un professionnel de santé". Le vétérinaire EST l'expert.
3. Si le RAG a trouvé un document pertinent → cite la source en fin de réponse.
4. Si tu utilises tes connaissances générales → signale-le en 1 mention brève ("connaissances générales").
5. Réponds de façon structurée et courte. Un confrère expérimenté a 30 secondes, pas 3 minutes.
6. Ne jamais inventer un dosage si tu n'es pas sûr — indique l'incertitude et la source à vérifier.
${patientContext ? `\n${patientContext}\n` : ''}
Documents de référence :
${context || "Aucun document spécifique trouvé. Utilise tes connaissances vétérinaires générales en le précisant."}`;

    const result = streamText({
      model: openai(OPENAI_MODEL),
      temperature: 0.3,
      maxRetries: 3,
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: question },
      ],
      // FLYWHEEL: log interaction after response is complete
      onFinish: async ({ text }) => {
        if (!text) return;
        if (!userId && !sessionId) return;
        try {
          await getServiceClient().from('rag_interactions').insert({
            user_id: userId ?? null,
            session_id: sessionId ?? null,
            source: userId ? 'chat' : 'demo',
            query: question,
            response_generated: text,
            retrieved_chunks: retrievedChunks,
            feedback_type: 'pending',
          });
        } catch (e) { console.warn('[FLYWHEEL] rag_interactions insert failed:', e); }
      },
    });

    return result.toTextStreamResponse({
      headers: {
        'X-Sources': headerJSON(sources),
        'X-RateLimit-Remaining': String(limit.remaining),
        'X-Response-Mode': 'chat',
        'Access-Control-Expose-Headers': 'X-Sources, X-RateLimit-Remaining, X-Response-Mode',
        ...CORS_HEADERS,
      },
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[/api/chat error]', message);
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } });
  }
}
