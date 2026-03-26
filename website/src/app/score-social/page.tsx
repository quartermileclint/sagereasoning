'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { authFetch } from '@/lib/auth-fetch'

interface SocialResult {
  total_score: number
  wisdom_score: number
  justice_score: number
  courage_score: number
  temperance_score: number
  alignment_tier: string
  publish_recommendation: string
  reasoning: string
  revision_suggestion: string
  character_count: number
  scored_at: string
}

interface LocalSocialCheck {
  id: string
  timestamp: string
  platform: string
  total_score: number
  alignment_tier: string
  publish_recommendation: string
}

const tierColors: Record<string, string> = {
  sage: 'text-emerald-700',
  progressing: 'text-green-600',
  aware: 'text-amber-600',
  misaligned: 'text-orange-600',
  contrary: 'text-red-700',
}

const tierBg: Record<string, string> = {
  sage: 'bg-emerald-50 border-emerald-200',
  progressing: 'bg-green-50 border-green-200',
  aware: 'bg-amber-50 border-amber-200',
  misaligned: 'bg-orange-50 border-orange-200',
  contrary: 'bg-red-50 border-red-200',
}

const recommendationStyle: Record<string, { bg: string; text: string; label: string }> = {
  publish: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Good to publish' },
  revise: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Consider revising' },
  reconsider: { bg: 'bg-red-100', text: 'text-red-800', label: 'Reconsider posting' },
}

const PLATFORMS = ['Twitter/X', 'LinkedIn', 'Reddit', 'Facebook', 'Instagram', 'Other']

// ─── Local history helpers ───
function getLocalChecks(userId: string): LocalSocialCheck[] {
  try {
    const raw = localStorage.getItem(`social_history_${userId}`)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveLocalCheck(userId: string, check: LocalSocialCheck) {
  try {
    const checks = getLocalChecks(userId)
    checks.unshift(check)
    localStorage.setItem(`social_history_${userId}`, JSON.stringify(checks.slice(0, 50)))
  } catch { /* storage full */ }
}

function getHistoryPreference(userId: string): boolean {
  try {
    return localStorage.getItem(`social_save_history_${userId}`) === 'true'
  } catch { return false }
}

function setHistoryPreference(userId: string, value: boolean) {
  try {
    localStorage.setItem(`social_save_history_${userId}`, value ? 'true' : 'false')
  } catch { /* ignore */ }
}

export default function ScoreSocialPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [saveHistory, setSaveHistory] = useState(false)
  const [localChecks, setLocalChecks] = useState<LocalSocialCheck[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [text, setText] = useState('')
  const [platform, setPlatform] = useState('')
  const [context, setContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SocialResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? null
      setUserId(uid)
      if (uid) {
        const pref = getHistoryPreference(uid)
        setSaveHistory(pref)
        if (pref) setLocalChecks(getLocalChecks(uid))
      }
    })
  }, [])

  function handleToggleSaveHistory() {
    if (!userId) return
    const newVal = !saveHistory
    setSaveHistory(newVal)
    setHistoryPreference(userId, newVal)
    if (newVal) setLocalChecks(getLocalChecks(userId))
  }

  async function handleScore() {
    if (!text.trim()) { setError('Write something to score.'); return }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await authFetch('/api/score-social', {
        method: 'POST',
        body: JSON.stringify({
          text: text.trim(),
          platform: platform || undefined,
          context: context.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Scoring failed')
      }

      const data: SocialResult = await res.json()
      setResult(data)

      // Save to local history if opted in
      if (userId && saveHistory) {
        saveLocalCheck(userId, {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          platform: platform || 'Unknown',
          total_score: data.total_score,
          alignment_tier: data.alignment_tier,
          publish_recommendation: data.publish_recommendation,
        })
        setLocalChecks(getLocalChecks(userId))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const virtues = result ? [
    { name: 'Wisdom', score: result.wisdom_score, weight: '30%' },
    { name: 'Justice', score: result.justice_score, weight: '25%' },
    { name: 'Courage', score: result.courage_score, weight: '25%' },
    { name: 'Temperance', score: result.temperance_score, weight: '20%' },
  ] : []

  const rec = result ? recommendationStyle[result.publish_recommendation] || recommendationStyle.revise : null

  return (
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-sage-900 mb-3">Social Media Filter</h1>
          <p className="font-body text-sage-600 max-w-xl mx-auto">
            Score your post before you publish it. Get a virtue check on your tone, reasoning,
            and fairness — with a revision suggestion if needed.
          </p>
        </div>

        {/* Privacy notice + history toggle */}
        <div className="bg-sage-50 border border-sage-200 rounded-lg p-4 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-sage-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="font-body text-xs text-sage-600">
              Your post text is processed for scoring but <strong>not stored on our servers</strong>.
              Only anonymous score statistics are logged.
            </p>
          </div>
          {userId && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-body text-xs text-sage-500 whitespace-nowrap">Save check history on this device</span>
              <button
                onClick={handleToggleSaveHistory}
                className={`relative w-10 h-5 rounded-full transition-colors focus:outline-none ${saveHistory ? 'bg-sage-500' : 'bg-sage-200'}`}
                aria-label="Toggle local check history"
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${saveHistory ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          )}
        </div>

        {/* Local history */}
        {userId && saveHistory && localChecks.length > 0 && (
          <div className="mb-8">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="font-display text-sm text-sage-600 hover:text-sage-800 flex items-center gap-2 mb-3"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {showHistory ? 'Hide' : 'Show'} check history ({localChecks.length} check{localChecks.length !== 1 ? 's' : ''} on this device)
            </button>
            {showHistory && (
              <div className="space-y-2">
                {localChecks.slice(0, 5).map(c => {
                  const recStyle = recommendationStyle[c.publish_recommendation] || recommendationStyle.revise
                  return (
                    <div key={c.id} className="bg-white border border-sage-200 rounded-lg p-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm text-sage-800">{c.platform} post</p>
                        <p className="font-body text-xs text-sage-500">{new Date(c.timestamp).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`font-body text-xs px-2 py-1 rounded ${recStyle.bg} ${recStyle.text}`}>
                          {recStyle.label}
                        </span>
                        <p className="font-display text-lg font-bold text-sage-700">{c.total_score}</p>
                      </div>
                    </div>
                  )
                })}
                {localChecks.length > 5 && (
                  <p className="font-body text-xs text-sage-400 text-center">{localChecks.length - 5} more checks stored locally</p>
                )}
              </div>
            )}
          </div>
        )}

        {!result && (
          <div className="space-y-4">
            <div>
              <label htmlFor="platform" className="block font-body text-sage-700 text-sm mb-1">
                Platform <span className="text-sage-400">(optional)</span>
              </label>
              <select
                id="platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-4 py-3 border border-sage-300 rounded-lg font-body text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-400"
              >
                <option value="">Select platform...</option>
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="text" className="block font-body text-sage-700 text-sm mb-1">Your Post</label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, 2000))}
                placeholder="Type or paste your post here..."
                rows={6}
                className="w-full px-4 py-3 border border-sage-300 rounded-lg font-body text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-400 resize-y"
              />
              <div className="text-right mt-1">
                <span className="font-body text-xs text-sage-400">{text.length}/2000</span>
              </div>
            </div>

            <div>
              <label htmlFor="context" className="block font-body text-sage-700 text-sm mb-1">
                Context <span className="text-sage-400">(optional — what prompted this post?)</span>
              </label>
              <input
                id="context"
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g. Replying to someone who criticised my work"
                className="w-full px-4 py-3 border border-sage-300 rounded-lg font-body text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-400"
              />
            </div>

            {error && <p className="font-body text-red-600 text-sm">{error}</p>}

            <button
              onClick={handleScore}
              disabled={loading || !text.trim()}
              className="w-full py-3 bg-sage-800 text-white font-display text-lg rounded-lg hover:bg-sage-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Checking...' : 'Check Before Publishing'}
            </button>

            {loading && (
              <p className="font-body text-sage-500 text-sm text-center animate-pulse">
                Checking tone, reasoning, and fairness...
              </p>
            )}
          </div>
        )}

        {result && (
          <div className="space-y-8">
            {rec && (
              <div className={`rounded-xl p-6 text-center ${rec.bg}`}>
                <span className={`font-display text-2xl font-bold ${rec.text}`}>{rec.label}</span>
                {userId && saveHistory && (
                  <p className="font-body text-xs text-sage-400 mt-1">Check saved to this device</p>
                )}
              </div>
            )}

            <div className={`rounded-xl border-2 p-8 ${tierBg[result.alignment_tier] || 'bg-gray-50 border-gray-200'}`}>
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-4">
                  <span className="text-5xl font-display font-bold text-sage-900">{result.total_score}</span>
                  <span className={`text-xl font-display font-medium capitalize ${tierColors[result.alignment_tier] || 'text-gray-600'}`}>
                    {result.alignment_tier}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {virtues.map((v) => (
                  <div key={v.name} className="flex items-center gap-3">
                    <span className="font-body text-sage-700 w-28 text-sm">{v.name} <span className="text-sage-400">({v.weight})</span></span>
                    <div className="flex-1 bg-white/60 rounded-full h-4 overflow-hidden">
                      <div className="h-full rounded-full bg-sage-600 transition-all duration-700" style={{ width: `${v.score}%` }} />
                    </div>
                    <span className="font-body text-sage-800 text-sm w-8 text-right">{v.score}</span>
                  </div>
                ))}
              </div>

              <div className="bg-white/50 rounded-lg p-4 mb-4">
                <p className="font-body text-sage-700 text-sm italic">{result.reasoning}</p>
              </div>

              {result.revision_suggestion && result.revision_suggestion !== 'No revision needed.' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="font-display text-sm text-amber-800 mb-1">Sage Revision</p>
                  <p className="font-body text-sage-700 text-sm">{result.revision_suggestion}</p>
                </div>
              )}
            </div>

            <div className="text-center">
              <button
                onClick={() => { setResult(null); setText(''); setContext('') }}
                className="px-6 py-3 bg-sage-800 text-white font-display rounded-lg hover:bg-sage-700 transition-colors"
              >
                Check Another Post
              </button>
            </div>
          </div>
        )}

        <div className="mt-16 border-t border-sage-200 pt-8">
          <h2 className="font-display text-2xl text-sage-800 mb-4">For AI Agents &amp; Developers</h2>
          <div className="bg-sage-50 rounded-lg p-6 font-body text-sage-700 text-sm space-y-3">
            <p><strong>POST</strong> <code className="bg-sage-200 px-1 rounded">/api/score-social</code></p>
            <pre className="bg-sage-900 text-sage-100 rounded p-3 text-xs overflow-x-auto">{`{
  "text": "Your post text here...",
  "platform": "Twitter/X",
  "context": "Optional context"
}`}</pre>
            <p>Returns: scores, publish recommendation (publish/revise/reconsider), and revision suggestion.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
