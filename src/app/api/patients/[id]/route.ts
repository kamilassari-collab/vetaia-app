import { NextRequest } from 'next/server';
import { getPatient, getPatientHistory, updatePatient } from '@/lib/patients';
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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticate(req);
  if (!auth) return unauthorized();
  const { id } = await params;
  try {
    const [patient, history] = await Promise.all([getPatient(id), getPatientHistory(id)]);
    if (!patient) return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json({ patient, history });
  } catch (e) {
    if (isTableNotFound(e)) return Response.json({ patient: null, history: [] });
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticate(req);
  if (!auth) return unauthorized();
  const { id } = await params;
  const body = await req.json();
  try {
    const patient = await updatePatient(id, body);
    return Response.json(patient);
  } catch (e) {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
