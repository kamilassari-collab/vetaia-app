import { NextRequest } from 'next/server';
import { getPatients, createPatient } from '@/lib/patients';

function isTableNotFound(e: unknown): boolean {
  if (e && typeof e === 'object') {
    const err = e as Record<string, unknown>;
    if (err.code === 'PGRST205') return true;
    if (typeof err.message === 'string' && err.message.includes("Could not find the table")) return true;
  }
  const msg = String(e);
  return msg.includes('PGRST205') || msg.includes("Could not find the table");
}

export async function GET(req: NextRequest) {
  const vetId = req.nextUrl.searchParams.get('vetId') ?? 'demo';
  try {
    const patients = await getPatients(vetId);
    return Response.json(patients);
  } catch (e) {
    if (isTableNotFound(e)) {
      console.warn('[/api/patients] Table not found, returning empty array:', String(e));
      return Response.json([]);
    }
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const patient = await createPatient({ ...body, vet_id: body.vet_id ?? 'demo' });
    return Response.json(patient);
  } catch (e) {
    if (isTableNotFound(e)) {
      console.warn('[/api/patients POST] Table not found:', String(e));
      return Response.json({ error: 'La table patients n\'existe pas encore. Veuillez exécuter les migrations Supabase.' }, { status: 503 });
    }
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
