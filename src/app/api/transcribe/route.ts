import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { authenticate, unauthorized } from '@/lib/server-auth';

export const runtime = 'nodejs';

// Per-user rate limit: max 60 transcriptions per hour
const transcribeStore = new Map<string, { count: number; resetAt: number }>();

function checkTranscribeLimit(userId: string): boolean {
  const now = Date.now();
  let entry = transcribeStore.get(userId);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + 60 * 60 * 1000 };
    transcribeStore.set(userId, entry);
  }
  if (entry.count >= 60) return false;
  entry.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  const auth = await authenticate(req);
  if (!auth) return unauthorized();

  if (!checkTranscribeLimit(auth.userId)) {
    return Response.json({ error: 'Limite de transcriptions atteinte. Réessayez dans une heure.' }, { status: 429 });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const formData = await req.formData();
    const audio = formData.get('audio') as File;
    if (!audio) return Response.json({ error: 'No audio' }, { status: 400 });

    const transcription = await openai.audio.transcriptions.create({
      file: audio,
      model: 'whisper-1',
      language: 'fr',
      prompt: 'Vétérinaire qui parle de sa consultation. Il parle naturellement et parfois vite. Il peut dire : chien, chat, lapin, cheval, cochon d\'inde, furet. Il peut mentionner : propriétaire, madame, monsieur. Il peut décrire des symptômes : mange plus, boit beaucoup, a vomi, diarrhée, boite, se gratte, tousse, respire mal, ventre gonflé, a de la fièvre, perd du poids. Il peut citer des médicaments : amoxicilline, métronidazole, prednisolone, ibuprofène, doxycycline, meloxicam, furosémide. Il peut mentionner des examens : prise de sang, radio, écho, NFS, biochimie, tension, température, poids.',
    });

    return Response.json({ text: transcription.text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[api/transcribe]', message);
    return Response.json({ error: 'Erreur de transcription' }, { status: 500 });
  }
}
