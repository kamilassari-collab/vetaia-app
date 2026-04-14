import { NextRequest } from 'next/server';
import { createConsultation } from '@/lib/patients';

export async function POST(req: NextRequest) {
  const { patient_id, vet_id } = await req.json();
  try {
    const consultation = await createConsultation(patient_id, vet_id ?? 'demo');
    return Response.json(consultation);
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
