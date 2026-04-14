import { createClient } from '@supabase/supabase-js';

// Anon client — safe for browser (NEXT_PUBLIC_ keys only)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
