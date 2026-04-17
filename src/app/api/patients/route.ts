import { NextRequest } from 'next/server';
import { getPatients, createPatient } from '@/lib/patients';
import { authenticate, unauthorized } from '@/lib/server-auth';

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
  const auth = await authenticate(req);
  if (!auth) return unauthorized();
  try {
    const patients = await getPatients(auth.userId);
    return Response.json(patients);
  } catch (e) {
    if (isTableNotFound(e)) return Response.json([]);
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await authenticate(req);
  if (!auth) return unauthorized();
  const body = await req.json();
  try {
    const patient = await createPatient({ ...body, vet_id: auth.userId });
    return Response.json(patient);
  } catch (e) {
    if (isTableNotFound(e)) {
      return Response.json({ error: 'Table patients introuvable. Exécutez les migrations Supabase.' }, { status: 503 });
    }
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
