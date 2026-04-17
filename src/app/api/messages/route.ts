import { NextRequest } from 'next/server';
import { saveMessage, getMessages } from '@/lib/patients';
import { authenticate, unauthorized } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
  const auth = await authenticate(req);
  if (!auth) return unauthorized();
  const consultationId = req.nextUrl.searchParams.get('consultationId');
  if (!consultationId) return Response.json([]);
  const messages = await getMessages(consultationId);
  return Response.json(messages);
}

export async function POST(req: NextRequest) {
  const auth = await authenticate(req);
  if (!auth) return unauthorized();
  const { consultationId, role, content, mode } = await req.json();
  if (!consultationId) return Response.json({ ok: false });
  await saveMessage(consultationId, role, content, mode ?? 'chat');
  return Response.json({ ok: true });
}
