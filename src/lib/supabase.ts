import { createClient } from '@supabase/supabase-js';

// Anon client — safe for browser (NEXT_PUBLIC_ keys only)
// Fallbacks prevent build-time crashes when env vars aren't available during SSG
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'
);
