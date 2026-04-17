// Server-only auth helper — DO NOT import in 'use client' components
import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

export type AuthResult = { userId: string };

export async function authenticate(req: NextRequest): Promise<AuthResult | null> {
  const token = req.headers.get('authorization')?.replace('Bearer ', '').trim();
  if (!token) return null;
  const { data } = await createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  ).auth.getUser(token);
  return data.user ? { userId: data.user.id } : null;
}

export function unauthorized(): Response {
  return new Response(JSON.stringify({ error: 'Non autorisé' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}
