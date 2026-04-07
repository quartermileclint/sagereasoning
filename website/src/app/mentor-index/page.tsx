'use client'

import { useState } from 'react'

// ============================================================================
// Mentor Capability Index — Proof of Concept Demo Page
//
// One-click triggers for every built mentor output.
// Each card calls a real API endpoint and displays the live result.
// Linked from the Private Mentor Hub for hold-point assessment.
// ============================================================================

type DemoStatus = 'idle' | 'loading' | 'success' | 'error'

interface DemoCard {
  id: string
  title: string
  description: string
  endpoint: string
  method: 'POST' | 'GET'
  category: 'core' | 'proactive' | 'assessment' | 'journal' | 'scoring'
  status: 'wired' | 'scaffolded' | 'new'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: Record<string, any>
}

const DEMO_CARDS: DemoCard[] = [
  // ── Core Mentor ────────────────────────────────────────────────────────
  {
    id: 'conversation',
    title: 'Mentor Conversation',
    description: 'Send a message to the Sage Mentor and receive Stoic-informed guidance drawn from your profile.',
    endpoint: '/api/reason',
    method: 'POST',
    category: 'core',
    status: 'wired',
    payload: {
      input: 'I have been putting off a difficult conversation with someone I care about because I am afraid of their reaction. What would a Stoic approach look like?',
      depth: 'standard',
    },
  },
  {
    id: 'quick-reason',
    title: 'Quick Reasoning Check',
    description: 'Fast 3-mechanism check: Control Filter + Passion Diagnosis + Oikeiosis.',
    endpoint: '/api/reason',
    method: 'POST',
    category: 'core',
    status: 'wired',
    payload: {
      input: 'My colleague took credit for my work in a meeting. I want to confront them publicly.',
      depth: 'quick',
    },
  },
  {
    id: 'deep-reason',
    title: 'Deep Reasoning Analysis',
    description: 'Full 6-mechanism analysis including iterative refinement.',
    endpoint: '/api/reason',
    method: 'POST',
    category: 'core',
    status: 'wired',
    payload: {
      input: 'I am considering leaving my stable job to pursue a creative project that has no guaranteed income. My family depends on me financially. How should I think about this?',
      depth: 'deep',
    },
  },

  // ── Proactive Outputs ──────────────────────────────────────────────────
  {
    id: 'morning-checkin',
    title: 'Morning Check-In',
    description: 'Generate a morning reflection prompt drawing from your ledger entries and maxims.',
    endpoint: '/api/reason',
    method: 'POST',
    category: 'proactive',
    status: 'wired',
    payload: {
      input: 'Generate a morning check-in for a practitioner who is working on courage (their weakest virtue) and tends toward reputation-fear as their dominant passion. Draw from their stated aim: "Build inner citadel accessible in adversity." Frame as Seneca-style morning preparation.',
      depth: 'standard',
      domain_context: 'morning_check_in',
    },
  },
  {
    id: 'evening-reflection',
    title: 'Evening Reflection',
    description: 'Generate an evening review prompt in the Senecan tradition.',
    endpoint: '/api/reason',
    method: 'POST',
    category: 'proactive',
    status: 'wired',
    payload: {
      input: 'Generate an evening reflection for a practitioner whose day included: a tense meeting where they held back from defensive reaction (progress on courage), but then spent 30 minutes doom-scrolling financial news (regression on fear of future catastrophe). Their stated tension: "Knows measured responses work but cannot execute in moment." Connect today to their trajectory.',
      depth: 'standard',
      domain_context: 'evening_reflection',
    },
  },
  {
    id: 'weekly-mirror',
    title: 'Weekly Pattern Mirror',
    description: 'Generate a weekly synthesis of patterns, progress, and areas needing attention.',
    endpoint: '/api/reason',
    method: 'POST',
    category: 'proactive',
    status: 'wired',
    payload: {
      input: 'Generate a weekly pattern mirror for a practitioner at Early-to-Mid Progressor stage (Senecan B-minus). This week: 3 morning check-ins completed, 2 evening reflections, 1 deep reasoning session. Patterns observed: courage tested twice (held once, avoided once), reputation-fear triggered 4 times (down from 6 last week), new awareness of catastrophic extrapolation pattern. Their strongest virtue is Justice, weakest is Courage. Synthesise the week.',
      depth: 'deep',
      domain_context: 'weekly_pattern_mirror',
    },
  },

  // ── Assessment ─────────────────────────────────────────────────────────
  {
    id: 'mentor-baseline',
    title: 'Baseline Gap Questions',
    description: 'NEW: After journal extraction, generate tailored questions to confirm findings and fill gaps.',
    endpoint: '/api/mentor-baseline',
    method: 'POST',
    category: 'assessment',
    status: 'new',
    payload: {
      profile_summary: `Practitioner: Clinton. Grade: Prokoptōn (Progressor), Early-to-Mid, Senecan B-minus.
Strongest virtue: Justice (fairness-seeking is core identity). Weakest: Courage in real-time application.
Dominant passions: Fear (reputation, judgment, inadequacy), Appetite (validation, control, perfectionism), Distress (shame spirals from perceived failure).
Primary causal breakdown: hasty assent and unexamined impulse — moves from impression to regret without pausing.
Key tensions: Intellectual understanding far outpaces embodied practice. Promotes can-do but hasn't walked it. Values virtue but carries self-image as delusional/fraud blocking action.
Oikeiosis: Strong self-examination, strong family concern (guilt-driven), emerging community, weak humanity, moderate-strong nature connection.
7 of 12 journal sections processed (Oct-Dec 2025). Gaps in: Master Your Thoughts, Master Your Feelings, Live in Gratitude, Accept Your Fate, Be Responsible for Others.`,
    },
  },

  // ── Personalised Journal ──────────────────────────────────────────────
  {
    id: 'weekly-journal',
    title: 'Weekly Journal Questions',
    description: 'NEW: Generate 7 personalised daily journal questions based on your developmental needs.',
    endpoint: '/api/mentor-journal-week',
    method: 'POST',
    category: 'journal',
    status: 'new',
    payload: {
      profile_summary: `Practitioner: Clinton. Grade: Prokoptōn (Progressor), Early-to-Mid.
Weakest virtue: Courage (real-time application, not theoretical). Strongest: Justice.
Dominant passion: Fear — specifically reputation-damage (pervasive, overwhelming), future-catastrophe (frequent, strong), fear-of-inadequacy (pervasive, strong).
Causal breakdown: hasty assent stage — gives assent to negative interpretations too quickly.
Top tension: "Comprehensive eudaimonia vision but admits nothing stopping start — inaction."
Top aim: "Achieve eudaimonia: flourishing with continual improvement, positive outlook, strength, health, unburdened peace."
Recent insight: "Nothing stopping start except habit patterns."
Language style: pragmatic, concrete-with-principles, battle/journey metaphors.`,
      week_number: 1,
    },
  },

  // ── Scoring Tools ─────────────────────────────────────────────────────
  {
    id: 'score-action',
    title: 'Score an Action',
    description: 'Evaluate a specific action against the virtue framework.',
    endpoint: '/api/score',
    method: 'POST',
    category: 'scoring',
    status: 'wired',
    payload: {
      action: 'I noticed my colleague was struggling with their workload and offered to help with a task that wasn\'t my responsibility, even though I was behind on my own deadline.',
    },
  },
  {
    id: 'daily-reflect',
    title: 'Daily Reflection',
    description: 'Submit a daily reflection for Stoic evaluation (what happened + how you responded).',
    endpoint: '/api/reflect',
    method: 'POST',
    category: 'scoring',
    status: 'wired',
    payload: {
      what_happened: 'A client criticised my work publicly in a meeting with my boss present. I felt my face flush and the urge to defend myself aggressively.',
      how_i_responded: 'I paused, took a breath, and asked the client to elaborate on their specific concerns. I addressed each point calmly. Afterwards I felt shaky but proud I did not react from anger.',
    },
  },
  {
    id: 'guardrail',
    title: 'Guardrail Check',
    description: 'Fast check for ethical red flags before an action.',
    endpoint: '/api/guardrail',
    method: 'POST',
    category: 'scoring',
    status: 'wired',
    payload: {
      action: 'I want to tell my friend what their partner said about them behind their back, because I think they deserve to know the truth.',
    },
  },
]

const CATEGORY_LABELS: Record<string, string> = {
  core: 'Core Mentor',
  proactive: 'Proactive Outputs',
  assessment: 'Assessment Tools',
  journal: 'Personalised Journal',
  scoring: 'Scoring & Evaluation',
}

const CATEGORY_ORDER = ['core', 'proactive', 'assessment', 'journal', 'scoring']

const STATUS_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  wired: { label: 'WIRED', bg: '#1a3a2a', color: '#4caf6a' },
  scaffolded: { label: 'SCAFFOLDED', bg: '#3a3a1a', color: '#c4a64a' },
  new: { label: 'NEW', bg: '#1a2a4a', color: '#5b9cf5' },
}

export default function MentorIndexPage() {
  const [results, setResults] = useState<Record<string, { status: DemoStatus; data: string; time?: number }>>({})

  const runDemo = async (card: DemoCard) => {
    setResults(prev => ({ ...prev, [card.id]: { status: 'loading', data: '' } }))
    const start = Date.now()

    try {
      const res = await fetch(card.endpoint, {
        method: card.method,
        headers: { 'Content-Type': 'application/json' },
        body: card.method === 'POST' ? JSON.stringify(card.payload) : undefined,
      })

      const elapsed = Date.now() - start
      const data = await res.json()

      if (!res.ok) {
        setResults(prev => ({
          ...prev,
          [card.id]: { status: 'error', data: JSON.stringify(data, null, 2), time: elapsed },
        }))
        return
      }

      setResults(prev => ({
        ...prev,
        [card.id]: { status: 'success', data: JSON.stringify(data, null, 2), time: elapsed },
      }))
    } catch (err) {
      const elapsed = Date.now() - start
      setResults(prev => ({
        ...prev,
        [card.id]: { status: 'error', data: String(err), time: elapsed },
      }))
    }
  }

  const grouped = CATEGORY_ORDER.map(cat => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    cards: DEMO_CARDS.filter(c => c.category === cat),
  }))

  const totalWired = DEMO_CARDS.filter(c => c.status === 'wired').length
  const totalNew = DEMO_CARDS.filter(c => c.status === 'new').length

  return (
    <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', color: '#e0e0e0' }}>
      {/* Header */}
      <div style={{ marginBottom: 32, borderBottom: '1px solid #2a2d3a', paddingBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <a href="/private-mentor" style={{ color: '#5b9cf5', textDecoration: 'none', fontSize: 14 }}>
            &larr; Back to Mentor Hub
          </a>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '8px 0', color: '#fff' }}>
          Mentor Capability Index
        </h1>
        <p style={{ fontSize: 15, color: '#8a8fa0', margin: 0 }}>
          Proof-of-concept demonstration. Each card calls a live API endpoint.
          Click any card to trigger the demo and see the real output.
        </p>
        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          <span style={{ fontSize: 13, padding: '4px 10px', borderRadius: 4, background: '#1a3a2a', color: '#4caf6a' }}>
            {totalWired} Wired
          </span>
          <span style={{ fontSize: 13, padding: '4px 10px', borderRadius: 4, background: '#1a2a4a', color: '#5b9cf5' }}>
            {totalNew} New
          </span>
          <span style={{ fontSize: 13, padding: '4px 10px', borderRadius: 4, background: '#1a1a2a', color: '#8a8fa0' }}>
            {DEMO_CARDS.length} Total
          </span>
        </div>
      </div>

      {/* Grouped Cards */}
      {grouped.map(group => (
        <div key={group.category} style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#c0c4d0', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
            {group.label}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340, 1fr))', gap: 16 }}>
            {group.cards.map(card => {
              const result = results[card.id]
              const badge = STATUS_BADGE[card.status]
              return (
                <div
                  key={card.id}
                  style={{
                    background: '#1a1d28',
                    border: '1px solid #2a2d3a',
                    borderRadius: 10,
                    padding: 20,
                    cursor: result?.status === 'loading' ? 'wait' : 'pointer',
                    transition: 'border-color 0.2s',
                  }}
                  onClick={() => result?.status !== 'loading' && runDemo(card)}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#4a4d5a')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a2d3a')}
                >
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: 0 }}>
                      {card.title}
                    </h3>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 3,
                      background: badge.bg,
                      color: badge.color,
                      letterSpacing: 0.5,
                    }}>
                      {badge.label}
                    </span>
                  </div>

                  <p style={{ fontSize: 13, color: '#8a8fa0', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                    {card.description}
                  </p>

                  <div style={{ fontSize: 11, color: '#6a6e80', marginBottom: 12 }}>
                    {card.method} {card.endpoint}
                  </div>

                  {/* Status / Result */}
                  {result?.status === 'loading' && (
                    <div style={{ fontSize: 13, color: '#5b9cf5', padding: '8px 0' }}>
                      Calling API...
                    </div>
                  )}

                  {result?.status === 'success' && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: '#4caf6a', fontWeight: 600 }}>SUCCESS</span>
                        <span style={{ fontSize: 11, color: '#6a6e80' }}>{result.time}ms</span>
                      </div>
                      <pre style={{
                        fontSize: 11,
                        color: '#b0b4c0',
                        background: '#12141c',
                        borderRadius: 6,
                        padding: 12,
                        maxHeight: 300,
                        overflow: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        margin: 0,
                      }}>
                        {result.data}
                      </pre>
                    </div>
                  )}

                  {result?.status === 'error' && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: '#e05050', fontWeight: 600 }}>ERROR</span>
                        <span style={{ fontSize: 11, color: '#6a6e80' }}>{result.time}ms</span>
                      </div>
                      <pre style={{
                        fontSize: 11,
                        color: '#e08080',
                        background: '#1c1214',
                        borderRadius: 6,
                        padding: 12,
                        maxHeight: 200,
                        overflow: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        margin: 0,
                      }}>
                        {result.data}
                      </pre>
                    </div>
                  )}

                  {!result && (
                    <div style={{ fontSize: 12, color: '#5b9cf5', padding: '4px 0' }}>
                      Click to run demo
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Footer */}
      <div style={{ borderTop: '1px solid #2a2d3a', paddingTop: 16, marginTop: 16, fontSize: 12, color: '#6a6e80' }}>
        SageReasoning Mentor Capability Index — Hold Point Assessment (P0h).
        All demos call live API endpoints using the Anthropic API.
        Results are not stored. This page is for proof-of-concept verification.
      </div>
    </div>
  )
}
