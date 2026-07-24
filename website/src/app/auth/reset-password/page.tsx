'use client'

import { useState, useEffect } from 'react'
import { supabase, PASSWORD_RECOVERY_MARKER_KEY } from '@/lib/supabase'

/**
 * Set-a-new-password page. Reached one of two ways:
 *   1. Directly, with recovery tokens in the URL hash — the in-app
 *      "Forgot your password?" link on /auth sets redirectTo here.
 *   2. Via a client-side hand-off from AuthRedirect.tsx, when the
 *      recovery link's own destination (the project's Site URL) is the
 *      homepage — the session is already established by the time this
 *      page loads, with no hash tokens of its own.
 *
 * Either way the form is GATED (AUTH-1 fix, 2026-07-25): Case 2 requires
 * the one-time hand-off marker AuthRedirect sets; Case 1 requires a genuine
 * PASSWORD_RECOVERY event. A bare ambient session — or a SIGNED_IN re-emit
 * (auth-js re-fires SIGNED_IN on tab visibilitychange and rebroadcasts it
 * cross-tab via BroadcastChannel, for ANY valid stored session) — never
 * unlocks the form. Trusting SIGNED_IN here allowed a borrowed-device
 * password takeover: open this page signed-in, switch tabs and back, and
 * the form appeared with no recovery link involved.
 */
export default function ResetPasswordPage() {
  const [checking, setChecking] = useState(true)
  const [hasSession, setHasSession] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    let cancelled = false

    // Case 2 — a session already exists when this page mounts (arrived via
    // AuthRedirect's client-side hand-off; no hash tokens here, but the
    // session persists across the navigation via localStorage). Require
    // the marker AuthRedirect sets immediately before its hand-off, so an
    // unrelated ambient signed-in session (e.g. a shared/borrowed device)
    // doesn't also reach this password-change form.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return
      if (session && sessionStorage.getItem(PASSWORD_RECOVERY_MARKER_KEY)) {
        sessionStorage.removeItem(PASSWORD_RECOVERY_MARKER_KEY)
        setHasSession(true)
        setChecking(false)
      }
    })

    // Case 1 — recovery tokens are in this page's own URL hash (arrived
    // directly via the in-app "Forgot your password?" link). ONLY
    // PASSWORD_RECOVERY is trusted: its two emission sites in auth-js are
    // both hash/OTP-verification driven (a recovery-type link sets
    // redirectType='recovery', which emits PASSWORD_RECOVERY, never
    // SIGNED_IN). SIGNED_IN is deliberately NOT accepted — it has ~12
    // emission sites, including a visibilitychange re-emit and a cross-tab
    // BroadcastChannel rebroadcast for any ambient stored session, which
    // made it a marker-free bypass of the Case-2 gate (AUTH-1, 2026-07-25).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return
      if (event === 'PASSWORD_RECOVERY' && session) {
        sessionStorage.removeItem(PASSWORD_RECOVERY_MARKER_KEY)
        setHasSession(true)
        setChecking(false)
      }
    })

    // Stop showing the spinner if nothing has resolved after a few
    // seconds — but the listener stays subscribed (cleanup only runs on
    // unmount), so a genuinely slow recovery event can still promote the
    // UI from the fallback message to the real form once it arrives,
    // rather than being permanently locked out by this timeout.
    const timeout = setTimeout(() => {
      if (!cancelled) setChecking(false)
    }, 3000)

    return () => {
      cancelled = true
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError(updateError.message)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <img src="/images/sagelogosmall.PNG" alt="SageReasoning" className="w-16 h-16 mx-auto mb-4 rounded-full" />
        <p className="font-body text-sage-600">Checking your reset link...</p>
      </div>
    )
  }

  if (!hasSession) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <img src="/images/sagelogosmall.PNG" alt="SageReasoning" className="w-16 h-16 mx-auto mb-4 rounded-full" />
        <h1 className="font-display text-2xl font-medium text-sage-800 mb-4">No active reset link</h1>
        <p className="font-body text-sage-600 mb-6">
          This page is for setting a new password after clicking a password-reset link.
          Your link may have expired or already been used.
        </p>
        <div className="space-y-2">
          <a href="/auth" className="block text-sage-800 underline font-body">Request a new reset link</a>
          <a href="/auth" className="block text-sage-600 underline font-body text-sm">Sign in instead</a>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <img src="/images/sagelogosmall.PNG" alt="SageReasoning" className="w-16 h-16 mx-auto mb-4 rounded-full" />
        <h1 className="font-display text-2xl font-medium text-sage-800 mb-4">Password updated</h1>
        <p className="font-body text-sage-600">Redirecting you to your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <div className="text-center mb-10">
        <img src="/images/sagelogosmall.PNG" alt="SageReasoning" className="w-16 h-16 mx-auto mb-4 rounded-full" />
        <h1 className="font-display text-3xl font-medium text-sage-800">Set a new password</h1>
        <p className="font-body text-sage-600 mt-2">Choose a new password for your account.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded p-4 mb-6 font-body text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block font-display text-sm font-medium text-sage-700 mb-1">New password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-sage-300 rounded bg-white font-body text-sage-900 focus:outline-none focus:ring-2 focus:ring-sage-400"
            placeholder="At least 6 characters"
            minLength={6}
          />
        </div>

        <div>
          <label className="block font-display text-sm font-medium text-sage-700 mb-1">Confirm new password</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 border border-sage-300 rounded bg-white font-body text-sage-900 focus:outline-none focus:ring-2 focus:ring-sage-400"
            placeholder="Repeat your new password"
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-sage-400 text-white font-display text-lg rounded hover:bg-sage-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Updating...' : 'Set new password'}
        </button>
      </form>
    </div>
  )
}
