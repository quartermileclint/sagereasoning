'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

/**
 * Invisible component that detects when a user arrives with auth tokens
 * in the URL hash (e.g. after clicking an email confirmation link).
 * Redirects them to /baseline or /dashboard as appropriate.
 */
export default function AuthRedirect() {
  useEffect(() => {
    // Only run if there are hash params (tokens from Supabase email confirmation)
    if (!window.location.hash || !window.location.hash.includes('access_token')) return

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
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
