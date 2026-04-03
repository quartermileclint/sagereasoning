'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { trackEvent } from '@/lib/analytics'

type AuthMode = 'signin' | 'signup' | 'magic'

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [privacyConsent, setPrivacyConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Handle email confirmation redirect — when user clicks the link in their
  // confirmation email, Supabase redirects here with tokens in the URL hash.
  // This detects that and redirects the user to the right page.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Check if user has completed baseline assessment
        const res = await fetch(`/api/baseline?user_id=${session.user.id}`)
        const baseline = await res.json()
        if (!baseline.has_baseline) {
          window.location.href = '/baseline'
        } else {
          window.location.href = '/dashboard'
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      trackEvent({ event_type: 'sign_in' })
      // Check if user has completed baseline assessment
      const { data: { user: signedInUser } } = await supabase.auth.getUser()
      if (signedInUser) {
        const res = await fetch(`/api/baseline?user_id=${signedInUser.id}`)
        const baseline = await res.json()
        if (!baseline.has_baseline) {
          window.location.href = '/baseline'
          return
        }
      }
      window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!privacyConsent) {
      setError('Please accept the privacy and AI processing terms to create an account.')
      return
    }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: `${window.location.origin}/auth`,
      },
    })
    if (error) {
      setError(error.message)
    } else {
      trackEvent({ event_type: 'sign_up', metadata: { method: 'email' } })
      setMessage('Check your email for a confirmation link. Once confirmed, you\'ll begin with a quick Stoic baseline assessment.')
    }
    setLoading(false)
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) {
      setError(error.message)
    } else {
      setMessage('Check your email for a sign-in link.')
    }
    setLoading(false)
  }

  const handleSubmit = mode === 'signin' ? handleSignIn : mode === 'signup' ? handleSignUp : handleMagicLink

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <div className="text-center mb-10">
        <img src="/images/sagelogosmall.PNG" alt="SageReasoning" className="w-16 h-16 mx-auto mb-4 rounded-full" />
        <h1 className="font-display text-3xl font-medium text-sage-800">
          {mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Begin your path' : 'Magic link sign-in'}
        </h1>
        <p className="font-body text-sage-600 mt-2">
          {mode === 'magic'
            ? 'We\'ll send a sign-in link to your email.'
            : 'Measure your actions against the Stoic sages.'}
        </p>
      </div>

      {message && (
        <div className="bg-sage-100 border border-sage-300 text-sage-800 rounded p-4 mb-6 font-body text-center">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded p-4 mb-6 font-body text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {mode === 'signup' && (
          <div>
            <label className="block font-display text-sm font-medium text-sage-700 mb-1">Display name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 border border-sage-300 rounded bg-white font-body text-sage-900 focus:outline-none focus:ring-2 focus:ring-sage-400"
              placeholder="Your display name"
            />
          </div>
        )}

        <div>
          <label className="block font-display text-sm font-medium text-sage-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-sage-300 rounded bg-white font-body text-sage-900 focus:outline-none focus:ring-2 focus:ring-sage-400"
            placeholder="you@example.com"
          />
        </div>

        {mode !== 'magic' && (
          <div>
            <label className="block font-display text-sm font-medium text-sage-700 mb-1">Password</label>
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
        )}

        {/* Privacy consent — shown only on sign-up */}
        {mode === 'signup' && (
          <div className="flex items-start gap-3 p-3 bg-sage-50 border border-sage-200 rounded">
            <input
              id="privacy-consent"
              type="checkbox"
              checked={privacyConsent}
              onChange={(e) => setPrivacyConsent(e.target.checked)}
              className="mt-1 w-4 h-4 accent-sage-500 flex-shrink-0 cursor-pointer"
            />
            <label htmlFor="privacy-consent" className="font-body text-sm text-sage-700 leading-snug cursor-pointer">
              I understand that text I submit for scoring will be processed by{' '}
              <strong>Anthropic&rsquo;s Claude AI</strong> (US-based), and that my account data
              is stored on <strong>Supabase</strong> (US East region). I have read and accept the{' '}
              <a href="/privacy" target="_blank" className="text-sage-600 underline hover:text-sage-800">Privacy Policy</a>{' '}
              and{' '}
              <a href="/terms" target="_blank" className="text-sage-600 underline hover:text-sage-800">Terms of Service</a>.
            </label>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (mode === 'signup' && !privacyConsent)}
          className="w-full py-3 bg-sage-400 text-white font-display text-lg rounded hover:bg-sage-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Working...' : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Magic Link'}
        </button>
      </form>

      <div className="mt-8 text-center font-body text-sm text-sage-600 space-y-2">
        {mode === 'signin' && (
          <>
            <p>
              No account?{' '}
              <button onClick={() => { setMode('signup'); setError(''); setMessage('') }} className="text-sage-800 underline">
                Sign up
              </button>
            </p>
            <p>
              Prefer passwordless?{' '}
              <button onClick={() => { setMode('magic'); setError(''); setMessage('') }} className="text-sage-800 underline">
                Use magic link
              </button>
            </p>
          </>
        )}
        {mode === 'signup' && (
          <p>
            Already have an account?{' '}
            <button onClick={() => { setMode('signin'); setError(''); setMessage('') }} className="text-sage-800 underline">
              Sign in
            </button>
          </p>
        )}
        {mode === 'magic' && (
          <p>
            Prefer password?{' '}
            <button onClick={() => { setMode('signin'); setError(''); setMessage('') }} className="text-sage-800 underline">
              Sign in with password
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
