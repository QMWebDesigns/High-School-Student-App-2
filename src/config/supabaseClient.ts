import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL as string;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail fast in dev; in prod, this would just cause runtime errors which we want surfaced clearly
  // eslint-disable-next-line no-console
  console.warn('Supabase env vars are missing: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
