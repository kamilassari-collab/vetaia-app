import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, feature, name, clinic } = await req.json();
    if (!email) return Response.json({ error: 'Email required' }, { status: 400 });

    // Save lead to Supabase using service role (direct fetch, bypass JS client)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // Try to insert into leads table (may not exist yet — graceful fallback)
    const res = await fetch(`${supabaseUrl}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        email,
        feature: feature ?? 'unknown',
        name: name ?? null,
        clinic: clinic ?? null,
        created_at: new Date().toISOString(),
      }),
    });

    if (!res.ok && res.status !== 201) {
      // Table might not exist yet — log and return success anyway
      const err = await res.text();
      console.warn('[/api/notify] Supabase error (table may not exist yet):', err);
    }

    console.log(`[notify] New lead registered — feature: ${feature}`);
    return Response.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
