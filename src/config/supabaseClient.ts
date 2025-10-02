import { createClient } from '@supabase/supabase-js'

// Access Vite environment variables directly
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase configuration missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env or environment variables.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export default supabase
