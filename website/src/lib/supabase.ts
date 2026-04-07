import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Using createBrowserClient from @supabase/ssr stores auth tokens in cookies
// instead of localStorage. This enables server-side middleware to verify
// authentication before serving protected pages — critical for R17 compliance.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
