'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { authFetch } from '@/lib/auth-fetch'

interface Exercise {
  exercise_title: string
  exercise_type: string
  instructions: string
  journaling_prompt: string
  virtue_focus: string
  therapeutic_goal: string
}

interface TherapyResult {
  wisdom_score: number
  justice_score: number
  courage_score: number
  temperance_score: number
  total_score: number
  alignment_tier: string
  practitioner_notes: string
  client_feedback: string
  next_exercise_suggestion: string
  scored_at: string
}

interface LocalSession {
  id: string
  timestamp: string
  focus: string
  exercise_title: string
  total_score: number
  alignment_tier: string
  client_feedback: string
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

const FOCUS_AREAS = [
  'anxiety', 'anger management', 'grief', 'relationship conflict',
  'self-worth', 'decision paralysis', 'perfectionism', 'burnout', 'general resilience',
]

// ─── Local history helpers ───
function getLocalSessions(userId: string): LocalSession[] {
  try {
    const raw = localStorage.getItem(`therapy_history_${userId}`)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveLocalSession(userId: string, session: LocalSession) {
  try {
    const sessions = getLocalSessions(userId)
    sessions.unshift(session)
    localStorage.setItem(`therapy_history_${userId}`, JSON.stringify(sessions.slice(0, 50)))
  } catch { /* storage full */ }
}

function getHistoryPreference(userId: string): boolean {
  try {
    return localStorage.getItem(`therapy_save_history_${userId}`) === 'true'
  } catch { return false }
}

function setHistoryPreference(userId: string, value: boolean) {
  try {
    localStorage.setItem(`therapy_save_history_${userId}`, value ? 'true' : 'false')
  } catch { /* ignore */ }
}

export default function TherapyPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [saveHistory, setSaveHistory] = useState(false)
  const [localSessions, setLocalSessions] = useState<LocalSession[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [focus, setFocus] = useState('general resilience')
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingExercise, setLoadingExercise] = useState(false)
  const [result, setResult] = useState<TherapyResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'setup' | 'respond' | 'result'>('setup')
  const [showPractitionerNotes, setShowPractitionerNotes] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? null
      setUserId(uid)
      if (uid) {
        const pref = getHistoryPreference(uid)
        setSaveHistory(pref)
        if (pref) setLocalSessions(getLocalSessions(uid))
      }
    })
  }, [])

  function handleToggleSaveHistory() {
    if (!userId) return
    const newVal = !saveHistory
    setSaveHistory(newVal)
    setHistoryPreference(userId, newVal)
    if (newVal) setLocalSessions(getLocalSessions(userId))
  }

  async function loadExercise() {
    setLoadingExercise(true)
    setError(null)
    try {
      const res = await authFetch(`/api/score-therapy?focus=${encodeURIComponent(focus)}`)
      const data = await res.json()
      setExercise(data)
      setResponse('')
      setStep('respond')
    } catch {
      setError('Failed to generate exercise')
    } finally {
      setLoadingExercise(false)
    }
  }

  async function handleScore() {
    if (response.trim().length < 10) {
      setError('Please write at least a few sentences.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await authFetch('/api/score-therapy', {
        method: 'POST',
        body: JSON.stringify({
          exercise_title: exercise?.exercise_title,
          journaling_prompt: exercise?.journaling_prompt,
          response: response.trim(),
          focus,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Scoring failed')
      }

      const data: TherapyResult = await res.json()
      setResult(data)
      setStep('result')

      // Save session to localStorage if user opted in
      if (userId && saveHistory && exercise) {
        const session: LocalSession = {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          focus,
          exercise_title: exercise.exercise_title,
          total_score: data.total_score,
          alignment_tier: data.alignment_tier,
          client_feedback: data.client_feedback,
        }
        saveLocalSession(userId, session)
        setLocalSessions(getLocalSessions(userId))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const virtues = (scores: { wisdom_score: number; justice_score: number; courage_score: number; temperance_score: number }) => [
    { name: 'Wisdom', score: scores.wisdom_score, weight: '30%' },
    { name: 'Justice', score: scores.justice_score, weight: '25%' },
    { name: 'Courage', score: scores.courage_score, weight: '25%' },
    { name: 'Temperance', score: scores.temperance_score, weight: '20%' },
  ]

  return (
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-sage-900 mb-3">Stoic Coaching Companion</h1>
          <p className="font-body text-sage-600 max-w-xl mx-auto">
            Stoic-based therapeutic exercises for practitioners and clients. Generate exercises,
            journal responses, and receive virtue-based feedback on your growth.
          </p>
        </div>

        {/* Privacy notice + history toggle */}
        <div className="bg-sage-50 border border-sage-200 rounded-lg p-4 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-sage-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="font-body text-xs text-sage-600">
              Your responses are processed by our AI for scoring but <strong>not stored on our servers</strong>.
              Only anonymous score statistics are logged.
            </p>
          </div>
          {userId && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-body text-xs text-sage-500 whitespace-nowrap">Save session history on this device</span>
              <button
                onClick={handleToggleSaveHistory}
                className={`relative w-10 h-5 rounded-full transition-colors focus:outline-none ${saveHistory ? 'bg-sage-500' : 'bg-sage-200'}`}
                aria-label="Toggle local session history"
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${saveHistory ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          )}
        </div>

        {/* Local session history */}
        {userId && saveHistory && localSessions.length > 0 && (
          <div className="mb-8">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="font-display text-sm text-sage-600 hover:text-sage-800 flex items-center gap-2 mb-3"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {showHistory ? 'Hide' : 'Show'} session history ({localSessions.length} session{localSessions.length !== 1 ? 's' : ''} on this device)
            </button>
            {showHistory && (
              <div className="space-y-2">
                {localSessions.slice(0, 5).map(s => (
                  <div key={s.id} className="bg-white border border-sage-200 rounded-lg p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm text-sage-800 truncate">{s.exercise_title}</p>
                      <p className="font-body text-xs text-sage-500 capitalize">{s.focus} · {new Date(s.timestamp).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-display text-lg font-bold text-sage-700">{s.total_score}</p>
                      <p className={`font-body text-xs capitalize ${tierColors[s.alignment_tier] || 'text-sage-500'}`}>{s.alignment_tier}</p>
                    </div>
                  </div>
                ))}
                {localSessions.length > 5 && (
                  <p className="font-body text-xs text-sage-400 text-center">{localSessions.length - 5} more sessions stored locally</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 1: Choose focus */}
        {step === 'setup' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="focus" className="block font-body text-sage-700 text-sm mb-1">Focus Area</label>
              <select
                id="focus"
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                className="w-full px-4 py-3 border border-sage-300 rounded-lg font-body text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-400"
              >
                {FOCUS_AREAS.map((f) => (
                  <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                ))}
              </select>
            </div>

            {error && <p className="font-body text-red-600 text-sm">{error}</p>}

            <button
              onClick={loadExercise}
              disabled={loadingExercise}
              className="w-full py-3 bg-sage-800 text-white font-display text-lg rounded-lg hover:bg-sage-700 transition-colors disabled:opacity-50"
            >
              {loadingExercise ? 'Generating Exercise...' : 'Generate Stoic Exercise'}
            </button>
          </div>
        )}

        {/* Step 2: Do the exercise */}
        {step === 'respond' && exercise && (
          <div className="space-y-6">
            <div className="bg-sage-50 rounded-xl border border-sage-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-body bg-sage-200 text-sage-700 px-2 py-1 rounded capitalize">{exercise.exercise_type}</span>
                <span className="text-xs font-body bg-sage-200 text-sage-700 px-2 py-1 rounded capitalize">{exercise.virtue_focus}</span>
              </div>
              <h2 className="font-display text-xl text-sage-800 mb-3">{exercise.exercise_title}</h2>
              <p className="font-body text-sage-700 mb-4">{exercise.instructions}</p>
              <div className="bg-white rounded-lg p-4 border border-sage-200">
                <p className="font-display text-sage-800 italic">{exercise.journaling_prompt}</p>
              </div>
              <p className="font-body text-sage-500 text-xs mt-3">{exercise.therapeutic_goal}</p>
            </div>

            <div>
              <label htmlFor="response" className="block font-body text-sage-700 text-sm mb-1">Your Journal Response</label>
              <textarea
                id="response"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Take your time. Write honestly..."
                rows={8}
                className="w-full px-4 py-3 border border-sage-300 rounded-lg font-body text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-400 resize-y"
              />
            </div>

            {error && <p className="font-body text-red-600 text-sm">{error}</p>}

            <button
              onClick={handleScore}
              disabled={loading || response.trim().length < 10}
              className="w-full py-3 bg-sage-800 text-white font-display text-lg rounded-lg hover:bg-sage-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Reflecting...' : 'Submit Response'}
            </button>

            {loading && (
              <p className="font-body text-sage-500 text-sm text-center animate-pulse">
                Reflecting on your response with care...
              </p>
            )}
          </div>
        )}

        {/* Step 3: Results */}
        {step === 'result' && result && (
          <div className="space-y-8">
            <div className={`rounded-xl border-2 p-8 ${tierBg[result.alignment_tier] || 'bg-gray-50 border-gray-200'}`}>
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-4">
                  <span className="text-5xl font-display font-bold text-sage-900">{result.total_score}</span>
                  <span className={`text-xl font-display font-medium capitalize ${tierColors[result.alignment_tier] || 'text-gray-600'}`}>
                    {result.alignment_tier}
                  </span>
                </div>
                {userId && saveHistory && (
                  <p className="font-body text-xs text-sage-400 mt-2">Session saved to this device</p>
                )}
              </div>

              <div className="space-y-3 mb-6">
                {virtues(result).map((v) => (
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
                <p className="font-body text-sage-700 text-sm">{result.client_feedback}</p>
              </div>

              <div className="bg-sage-100/50 rounded-lg p-4">
                <p className="font-display text-sm text-sage-700 mb-1">Next Step</p>
                <p className="font-body text-sage-600 text-sm">{result.next_exercise_suggestion}</p>
              </div>
            </div>

            <div className="bg-sage-50 rounded-xl border border-sage-200 p-6">
              <button
                onClick={() => setShowPractitionerNotes(!showPractitionerNotes)}
                className="font-display text-sage-800 text-lg w-full text-left flex items-center justify-between"
              >
                Practitioner Notes
                <span className="text-sage-400 text-sm">{showPractitionerNotes ? 'Hide' : 'Show'}</span>
              </button>
              {showPractitionerNotes && (
                <p className="font-body text-sage-700 text-sm mt-3">{result.practitioner_notes}</p>
              )}
            </div>

            <div className="text-center">
              <button
                onClick={() => { setResult(null); setStep('setup'); setExercise(null); setResponse('') }}
                className="px-6 py-3 bg-sage-800 text-white font-display rounded-lg hover:bg-sage-700 transition-colors"
              >
                Try Another Exercise
              </button>
            </div>
          </div>
        )}

        <div className="mt-16 border-t border-sage-200 pt-8">
          <h2 className="font-display text-2xl text-sage-800 mb-4">For AI Agents &amp; Developers</h2>
          <div className="bg-sage-50 rounded-lg p-6 font-body text-sage-700 text-sm space-y-3">
            <p><strong>GET</strong> <code className="bg-sage-200 px-1 rounded">/api/score-therapy?focus=anxiety</code> — Generate an exercise</p>
            <p><strong>POST</strong> <code className="bg-sage-200 px-1 rounded">/api/score-therapy</code> — Score a client response</p>
            <pre className="bg-sage-900 text-sage-100 rounded p-3 text-xs overflow-x-auto">{`{
  "exercise_title": "Evening Review",
  "journaling_prompt": "What challenged you today?",
  "response": "Client's journal entry...",
  "focus": "anxiety"
}`}</pre>
            <p>Focus areas: anxiety, anger management, grief, relationship conflict, self-worth, decision paralysis, perfectionism, burnout, general resilience</p>
          </div>
        </div>
      </div>
    </div>
  )
}
