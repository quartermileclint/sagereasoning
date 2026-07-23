import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// SessionStorage key AuthRedirect.tsx sets right before handing off to
// /auth/reset-password on a genuine PASSWORD_RECOVERY event. That page
// requires this marker before trusting an ambient getSession() result, so
// an unrelated already-signed-in session (e.g. on a shared device) can't
// also reach the set-new-password form.
export const PASSWORD_RECOVERY_MARKER_KEY = 'sage_password_recovery_pending'

// Sync auth state to a cookie so server-side middleware can verify sessions.
// The createClient stores tokens in localStorage (browser-only), but Next.js
// middleware runs on the server and can only read cookies. This bridge ensures
// both work: localStorage for the client, cookie for route protection.
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((event, session) => {
    if (session?.access_token) {
      // Set a cookie with the access token — HttpOnly is not possible from JS,
      // but the middleware verifies the token with Supabase on every request,
      // so a forged cookie would still be rejected.
      document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax; Secure`
    } else if (event === 'SIGNED_OUT') {
      document.cookie = 'sb-access-token=; path=/; max-age=0'
    }
  })
}
