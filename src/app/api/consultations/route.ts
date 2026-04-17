import { NextRequest } from 'next/server';
import { createConsultation } from '@/lib/patients';
import { authenticate, unauthorized } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
  const auth = await authenticate(req);
  if (!auth) return unauthorized();
  const { patient_id } = await req.json();
  try {
    const consultation = await createConsultation(patient_id, auth.userId);
    return Response.json(consultation);
  } catch (e) {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
