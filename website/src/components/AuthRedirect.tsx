'use client'

import { useEffect } from 'react'
import { supabase, PASSWORD_RECOVERY_MARKER_KEY } from '@/lib/supabase'

/**
 * Invisible component that detects when a user arrives with auth tokens
 * (or an auth error) in the URL hash (e.g. after clicking an email
 * confirmation link, magic link, or password-recovery link — the
 * project's Site URL, the homepage, is the default landing page for all
 * of these unless a per-call redirectTo is set). Redirects them to
 * /baseline, /dashboard, the password-reset form, or back to /auth on an
 * expired/already-used link, as appropriate.
 */
export default function AuthRedirect() {
  useEffect(() => {
    const hash = window.location.hash
    if (!hash) return

    // An expired or already-used auth link (confirmation, magic link, or
    // recovery) redirects here with an error hash instead of tokens (e.g.
    // #error=access_denied&error_code=otp_expired) — no onAuthStateChange
    // event ever fires for this. Send the user somewhere actionable
    // instead of leaving a raw, unexplained error sitting in the URL bar.
    if (hash.includes('error=') && !hash.includes('access_token')) {
      window.location.href = '/auth'
      return
    }

    // Only run past this point if there are hash params (tokens from a
    // Supabase auth email link)
    if (!hash.includes('access_token')) return

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        // A password-recovery link (e.g. the Supabase Dashboard's "Send
        // password recovery" action) lands here because it uses the
        // project's Site URL, which has no form to set a new password.
        // Mark this hand-off so the reset page only shows its form for a
        // genuine recovery flow, not any ambient signed-in session, then
        // send the user there instead of leaving them silently signed in
        // with nowhere to go.
        sessionStorage.setItem(PASSWORD_RECOVERY_MARKER_KEY, '1')
        window.location.href = '/auth/reset-password'
        return
      }

      if (event === 'SIGNED_IN' && session) {
        try {
          const res = await fetch(`/api/baseline?user_id=${session.user.id}`)
          const baseline = await res.json()
          if (!baseline.has_baseline) {
            window.location.href = '/baseline'
          } else {
            window.location.href = '/dashboard'
          }
        } catch {
          // If baseline check fails, send to baseline as safe default
          window.location.href = '/baseline'
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return null // This component renders nothing — it just handles the redirect
}
