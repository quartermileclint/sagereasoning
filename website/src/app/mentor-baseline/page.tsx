'use client'

import { useState, useEffect, useCallback } from 'react'

// ============================================================================
// Mentor Baseline Gap Questions — Practitioner Answer Form
//
// Lives at /mentor-baseline. Dedicated practitioner-facing page (not the demo
// Mentor Index). Generates 10 tailored gap questions via /api/mentor-baseline,
// displays each with an answer box, saves drafts to localStorage, and submits
// completed answers to /api/mentor-baseline-response for profile refinement.
//
// Auth: uses the same Supabase Bearer-token pattern as Founder Hub /
// Mentor Index. Signed-out users see a sign-in prompt.
// ============================================================================

type Phase = 'loading' | 'ready' | 'submitting' | 'complete' | 'error'

interface BaselineQuestion {
  id: string
  category?: string
  target_dimension?: string
  stoic_brain_source?: string
  question_text: string
  what_the_answer_reveals?: string
  follow_up_if_surprising?: string
}

interface Draft {
  questions: BaselineQuestion[]
  answers: Record<string, string>
  generatedAt: string
}

const DRAFT_KEY = 'sage-baseline-draft-v1'
const SUPABASE_TOKEN_KEY = 'sb-jdbefwkonfbhjquozgxr-auth-token'

// Same profile summary the Mentor Index demo card uses.
const PROFILE_SUMMARY = `Practitioner: Clinton. Grade: Deliberate (Proficiens Medius — Middle Progressor).
Strongest virtue: Wisdom (phronesis) — strong post-hoc analysis, can articulate principles accurately. Weakest: Courage (andreia) — developing, fear still prevents action in real-time.
Dominant passions: Philodoxia (love of reputation, 9 sections, strong), Agonia (anxiety about future, 5 sections, strong), Pothos (yearning for lost identity, 4 sections, mild), Penthos (grief over perceived failures, 4 sections, strong).
Primary causal breakdown: synkatathesis (assent) — assents to false judgement that external recognition constitutes a genuine good. Secondary: horme (anger impulse bypasses deliberation with children), phantasia (catastrophizing).
Key tensions: Reputation/validation treated as genuine good despite intellectual understanding it is a preferred indifferent. Wife and self celebrate wealth/status as shared value system.
Oikeiosis: Strong self-preservation, strong household, developing community, nascent humanity, emerging cosmic.
12 of 12 journal sections processed (Oct-Dec 2025). 119 entries. 13,834 words.`

function readAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(SUPABASE_TOKEN_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored)
    return parsed?.access_token || null
  } catch {
    return null
  }
}

function readDraft(): Draft | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(DRAFT_KEY)
    if (!stored) return null
    return JSON.parse(stored) as Draft
  } catch {
    return null
  }
}

function writeDraft(draft: Draft): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch {
    // Ignore quota errors — user will see stale draft next load but won't break flow.
  }
}

function clearDraft(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {
    // Ignore.
  }
}

export default function MentorBaselinePage() {
  const [phase, setPhase] = useState<Phase>('loading')
  const [questions, setQuestions] = useState<BaselineQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [refinement, setRefinement] = useState<unknown>(null)
  const [savedNotice, setSavedNotice] = useState<string>('')
  const [draftLoadedAt, setDraftLoadedAt] = useState<string | null>(null)

  const generateQuestions = useCallback(async () => {
    setPhase('loading')
    setErrorMsg('')

    const token = readAuthToken()
    if (!token) {
      setErrorMsg('You are not signed in. Please sign in at /auth and return to this page.')
      setPhase('error')
      return
    }

    try {
      const res = await fetch('/api/mentor-baseline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profile_summary: PROFILE_SUMMARY }),
      })

      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(`Question generation failed: ${data?.error || res.statusText}`)
        setPhase('error')
        return
      }

      // Shape: { success, baseline_questions: { result: { questions: [...] }, meta: {...} } }
      const rawQuestions =
        (data?.baseline_questions?.result?.questions as BaselineQuestion[] | undefined) ??
        (data?.baseline_questions?.questions as BaselineQuestion[] | undefined) ??
        []

      if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
        setErrorMsg('No questions were returned. Please try again, or check the endpoint response shape.')
        setPhase('error')
        return
      }

      const cleanQuestions: BaselineQuestion[] = rawQuestions.map((q, i) => ({
        id: q.id || `baseline_${String(i + 1).padStart(2, '0')}`,
        category: q.category,
        target_dimension: q.target_dimension,
        stoic_brain_source: q.stoic_brain_source,
        question_text: q.question_text || '(no question text returned)',
        what_the_answer_reveals: q.what_the_answer_reveals,
        follow_up_if_surprising: q.follow_up_if_surprising,
      }))

      const freshDraft: Draft = {
        questions: cleanQuestions,
        answers: {},
        generatedAt: new Date().toISOString(),
      }
      writeDraft(freshDraft)
      setQuestions(cleanQuestions)
      setAnswers({})
      setDraftLoadedAt(freshDraft.generatedAt)
      setPhase('ready')
    } catch (err) {
      setErrorMsg(`Network error: ${String(err)}`)
      setPhase('error')
    }
  }, [])

  // On mount: if a draft exists, load it. Otherwise generate fresh questions.
  useEffect(() => {
    const draft = readDraft()
    if (draft && Array.isArray(draft.questions) && draft.questions.length > 0) {
      setQuestions(draft.questions)
      setAnswers(draft.answers || {})
      setDraftLoadedAt(draft.generatedAt)
      setPhase('ready')
    } else {
      generateQuestions()
    }
  }, [generateQuestions])

  const handleAnswerChange = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }))
  }

  const handleAnswerBlur = () => {
    // Auto-save on blur so a stray navigation does not lose progress.
    const draft: Draft = {
      questions,
      answers,
      generatedAt: draftLoadedAt || new Date().toISOString(),
    }
    writeDraft(draft)
  }

  const handleSaveDraft = () => {
    const draft: Draft = {
      questions,
      answers,
      generatedAt: draftLoadedAt || new Date().toISOString(),
    }
    writeDraft(draft)
    setSavedNotice(`Draft saved at ${new Date().toLocaleTimeString()}`)
    setTimeout(() => setSavedNotice(''), 3000)
  }

  const handleRegenerate = () => {
    const hasAnyAnswer = Object.values(answers).some(a => a && a.trim().length > 0)
    if (hasAnyAnswer) {
      const ok = confirm(
        'Regenerating will discard your current draft answers. Are you sure?'
      )
      if (!ok) return
    }
    clearDraft()
    generateQuestions()
  }

  const handleSubmit = async () => {
    setPhase('submitting')
    setErrorMsg('')

    const token = readAuthToken()
    if (!token) {
      setErrorMsg('You are not signed in. Please sign in at /auth and return to this page.')
      setPhase('error')
      return
    }

    const responses = questions.map(q => ({
      question_id: q.id,
      question_text: q.question_text,
      answer: answers[q.id] || '',
    }))

    try {
      const res = await fetch('/api/mentor-baseline-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ responses }),
      })

      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(`Submission failed: ${data?.error || res.statusText}`)
        setPhase('error')
        return
      }

      setRefinement(data)
      setPhase('complete')
    } catch (err) {
      setErrorMsg(`Network error: ${String(err)}`)
      setPhase('error')
    }
  }

  const answeredCount = Object.values(answers).filter(a => a && a.trim().length > 0).length

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        padding: '32px',
        maxWidth: 900,
        margin: '0 auto',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        color: '#e0e0e0',
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 24, borderBottom: '1px solid #2a2d3a', paddingBottom: 20 }}>
        <div style={{ marginBottom: 8 }}>
          <a href="/private-mentor" style={{ color: '#5b9cf5', textDecoration: 'none', fontSize: 14 }}>
            &larr; Back to Mentor Hub
          </a>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: '8px 0', color: '#fff' }}>
          Baseline Gap Questions
        </h1>
        <p style={{ fontSize: 14, color: '#8a8fa0', margin: '8px 0 0 0' }}>
          Tailored questions drawn from your extracted profile. Answer what you can —
          drafts are saved in this browser. Submit when you are ready to refine the profile.
        </p>
      </div>

      {/* Phase: loading */}
      {phase === 'loading' && (
        <div style={{ padding: 40, textAlign: 'center', color: '#8a8fa0' }}>
          Generating questions from your profile…
        </div>
      )}

      {/* Phase: error */}
      {phase === 'error' && (
        <div
          style={{
            padding: 20,
            background: '#3a1a1a',
            border: '1px solid #5a2a2a',
            borderRadius: 6,
            color: '#f5a0a0',
          }}
        >
          <div style={{ marginBottom: 12 }}>{errorMsg}</div>
          <button
            onClick={generateQuestions}
            style={{
              padding: '8px 16px',
              background: '#5b9cf5',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Try again
          </button>
        </div>
      )}

      {/* Phase: ready (answering) */}
      {phase === 'ready' && questions.length > 0 && (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
              padding: '12px 16px',
              background: '#1a1d2a',
              border: '1px solid #2a2d3a',
              borderRadius: 6,
            }}
          >
            <div style={{ fontSize: 14, color: '#8a8fa0' }}>
              {answeredCount} of {questions.length} answered
              {draftLoadedAt && (
                <span style={{ marginLeft: 12, color: '#5a5f70' }}>
                  · Generated {new Date(draftLoadedAt).toLocaleDateString()}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleRegenerate}
                style={{
                  padding: '6px 12px',
                  background: 'transparent',
                  color: '#8a8fa0',
                  border: '1px solid #3a3d4a',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                Regenerate questions
              </button>
            </div>
          </div>

          {questions.map((q, idx) => (
            <div
              key={q.id}
              style={{
                marginBottom: 24,
                padding: 20,
                background: '#1a1d2a',
                border: '1px solid #2a2d3a',
                borderRadius: 6,
              }}
            >
              <div style={{ fontSize: 13, color: '#5a5f70', marginBottom: 8 }}>
                Question {idx + 1} of {questions.length}
              </div>
              <div
                style={{
                  fontSize: 16,
                  lineHeight: 1.5,
                  color: '#e8e8e8',
                  marginBottom: 16,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {q.question_text}
              </div>
              <textarea
                value={answers[q.id] || ''}
                onChange={e => handleAnswerChange(q.id, e.target.value)}
                onBlur={handleAnswerBlur}
                placeholder="Your answer…"
                rows={6}
                style={{
                  width: '100%',
                  padding: 12,
                  background: '#0f1119',
                  color: '#e8e8e8',
                  border: '1px solid #2a2d3a',
                  borderRadius: 4,
                  fontSize: 15,
                  fontFamily: 'inherit',
                  lineHeight: 1.5,
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          ))}

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginTop: 24,
              paddingTop: 20,
              borderTop: '1px solid #2a2d3a',
            }}
          >
            <button
              onClick={handleSaveDraft}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                color: '#5b9cf5',
                border: '1px solid #5b9cf5',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Save draft
            </button>
            <button
              onClick={handleSubmit}
              disabled={answeredCount === 0}
              style={{
                padding: '10px 20px',
                background: answeredCount === 0 ? '#2a2d3a' : '#5b9cf5',
                color: answeredCount === 0 ? '#5a5f70' : '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: answeredCount === 0 ? 'not-allowed' : 'pointer',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Submit all answers
            </button>
            {savedNotice && (
              <span style={{ fontSize: 13, color: '#4caf6a' }}>{savedNotice}</span>
            )}
          </div>
        </>
      )}

      {/* Phase: submitting */}
      {phase === 'submitting' && (
        <div style={{ padding: 40, textAlign: 'center', color: '#8a8fa0' }}>
          Analysing your answers and refining the profile…
        </div>
      )}

      {/* Phase: complete */}
      {phase === 'complete' && (
        <div
          style={{
            padding: 20,
            background: '#1a3a2a',
            border: '1px solid #2a5a3a',
            borderRadius: 6,
          }}
        >
          <div style={{ fontSize: 16, color: '#4caf6a', marginBottom: 12, fontWeight: 500 }}>
            Answers submitted. Refinement returned below.
          </div>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              background: '#0f1119',
              padding: 16,
              borderRadius: 4,
              fontSize: 13,
              color: '#c8c8c8',
              maxHeight: 600,
              overflow: 'auto',
            }}
          >
            {JSON.stringify(refinement, null, 2)}
          </pre>
          <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
            <button
              onClick={() => {
                clearDraft()
                generateQuestions()
              }}
              style={{
                padding: '8px 16px',
                background: '#5b9cf5',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              Start a new round
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
