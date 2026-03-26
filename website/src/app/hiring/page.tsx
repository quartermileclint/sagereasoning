'use client'

import { useState } from 'react'
import { authFetch } from '@/lib/auth-fetch'

interface ScenarioItem {
  number: number
  scenario: string
}

interface ScenarioScore {
  scenario_number: number
  wisdom_score: number
  justice_score: number
  courage_score: number
  temperance_score: number
  total_score: number
  alignment_tier: string
  assessment: string
}

interface OverallResult {
  wisdom_score: number
  justice_score: number
  courage_score: number
  temperance_score: number
  total_score: number
  alignment_tier: string
  summary: string
  strongest_virtue: string
  growth_area: string
}

interface HiringResult {
  role: string
  candidate_name: string | null
  scenarios: ScenarioScore[]
  overall: OverallResult
  scored_at: string
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

const ROLES = ['leadership', 'customer-facing', 'technical', 'general']

export default function HiringPage() {
  const [role, setRole] = useState('general')
  const [candidateName, setCandidateName] = useState('')
  const [scenarios, setScenarios] = useState<ScenarioItem[]>([])
  const [responses, setResponses] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(false)
  const [loadingScenarios, setLoadingScenarios] = useState(false)
  const [result, setResult] = useState<HiringResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'setup' | 'respond' | 'result'>('setup')

  async function loadScenarios() {
    setLoadingScenarios(true)
    setError(null)
    try {
      const res = await authFetch(`/api/score-hiring?role=${role}`)
      const data = await res.json()
      setScenarios(data.scenarios)
      setResponses({})
      setStep('respond')
    } catch {
      setError('Failed to load scenarios')
    } finally {
      setLoadingScenarios(false)
    }
  }

  async function handleScore() {
    const filled = scenarios.filter((s) => responses[s.number]?.trim())
    if (filled.length === 0) {
      setError('Please respond to at least one scenario.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await authFetch('/api/score-hiring', {
        method: 'POST',
        body: JSON.stringify({
          role,
          candidate_name: candidateName.trim() || undefined,
          responses: filled.map((s) => ({
            scenario_number: s.number,
            response: responses[s.number].trim(),
          })),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Scoring failed')
      }

      const data = await res.json()
      setResult(data)
      setStep('result')
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
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl text-sage-900 mb-3">Hiring Assessment</h1>
          <p className="font-body text-sage-600 max-w-xl mx-auto">
            Evaluate candidates through ethical workplace scenarios. Score their moral reasoning —
            not just their answers — against the four Stoic virtues.
          </p>
        </div>

        {/* Step 1: Setup */}
        {step === 'setup' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="role" className="block font-body text-sage-700 text-sm mb-1">Role Type</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 border border-sage-300 rounded-lg font-body text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-400"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1).replace('-', ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="name" className="block font-body text-sage-700 text-sm mb-1">
                Candidate Name <span className="text-sage-400">(optional)</span>
              </label>
              <input
                id="name"
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="e.g. Jane Smith"
                className="w-full px-4 py-3 border border-sage-300 rounded-lg font-body text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-400"
              />
            </div>

            {error && <p className="font-body text-red-600 text-sm">{error}</p>}

            <button
              onClick={loadScenarios}
              disabled={loadingScenarios}
              className="w-full py-3 bg-sage-800 text-white font-display text-lg rounded-lg hover:bg-sage-700 transition-colors disabled:opacity-50"
            >
              {loadingScenarios ? 'Loading Scenarios...' : 'Generate Scenarios'}
            </button>
          </div>
        )}

        {/* Step 2: Respond to scenarios */}
        {step === 'respond' && (
          <div className="space-y-6">
            <p className="font-body text-sage-600 text-sm">
              Have the candidate respond to each scenario below. There are no obviously right answers —
              the scoring measures the quality of moral reasoning.
            </p>

            {scenarios.map((s) => (
              <div key={s.number} className="bg-sage-50 rounded-xl border border-sage-200 p-6">
                <p className="font-display text-sage-800 mb-3">
                  <span className="text-sage-500">Scenario {s.number}.</span> {s.scenario}
                </p>
                <textarea
                  value={responses[s.number] || ''}
                  onChange={(e) => setResponses({ ...responses, [s.number]: e.target.value })}
                  placeholder="Candidate's response..."
                  rows={4}
                  className="w-full px-4 py-3 border border-sage-300 rounded-lg font-body text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-400 resize-y"
                />
              </div>
            ))}

            {error && <p className="font-body text-red-600 text-sm">{error}</p>}

            <button
              onClick={handleScore}
              disabled={loading}
              className="w-full py-3 bg-sage-800 text-white font-display text-lg rounded-lg hover:bg-sage-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Scoring Responses...' : 'Score This Candidate'}
            </button>

            {loading && (
              <p className="font-body text-sage-500 text-sm text-center animate-pulse">
                Analysing moral reasoning against the four cardinal virtues...
              </p>
            )}
          </div>
        )}

        {/* Step 3: Results */}
        {step === 'result' && result && (
          <div className="space-y-8">
            {/* Overall */}
            <div className={`rounded-xl border-2 p-8 ${tierBg[result.overall.alignment_tier] || 'bg-gray-50 border-gray-200'}`}>
              <div className="text-center mb-6">
                {result.candidate_name && (
                  <h2 className="font-display text-xl text-sage-800 mb-1">{result.candidate_name}</h2>
                )}
                <p className="font-body text-sage-500 text-sm capitalize">{result.role} role</p>
                <div className="flex items-center justify-center gap-4 mt-3">
                  <span className="text-5xl font-display font-bold text-sage-900">{result.overall.total_score}</span>
                  <span className={`text-xl font-display font-medium capitalize ${tierColors[result.overall.alignment_tier] || 'text-gray-600'}`}>
                    {result.overall.alignment_tier}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {virtues(result.overall).map((v) => (
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
                <p className="font-body text-sage-700 text-sm italic">{result.overall.summary}</p>
              </div>

              <div className="flex gap-4 text-sm font-body">
                <span className="text-sage-600">Strongest: <strong className="text-sage-800 capitalize">{result.overall.strongest_virtue}</strong></span>
                <span className="text-sage-600">Growth area: <strong className="text-sage-800 capitalize">{result.overall.growth_area}</strong></span>
              </div>
            </div>

            {/* Per-scenario breakdown */}
            <div>
              <h3 className="font-display text-xl text-sage-800 mb-4">Scenario Breakdown</h3>
              <div className="space-y-4">
                {result.scenarios.map((s) => (
                  <div key={s.scenario_number} className={`rounded-lg border p-4 ${tierBg[s.alignment_tier] || 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-display text-sage-700">Scenario {s.scenario_number}</span>
                      <span className={`font-display font-bold ${tierColors[s.alignment_tier] || 'text-gray-600'}`}>
                        {s.total_score} — <span className="capitalize">{s.alignment_tier}</span>
                      </span>
                    </div>
                    <p className="font-body text-sage-600 text-sm">{s.assessment}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => { setResult(null); setStep('setup'); setScenarios([]); setResponses({}) }}
                className="px-6 py-3 bg-sage-800 text-white font-display rounded-lg hover:bg-sage-700 transition-colors"
              >
                Assess Another Candidate
              </button>
            </div>
          </div>
        )}

        {/* API section */}
        <div className="mt-16 border-t border-sage-200 pt-8">
          <h2 className="font-display text-2xl text-sage-800 mb-4">For AI Agents &amp; Developers</h2>
          <div className="bg-sage-50 rounded-lg p-6 font-body text-sage-700 text-sm space-y-3">
            <p><strong>GET</strong> <code className="bg-sage-200 px-1 rounded">/api/score-hiring?role=leadership</code> — Returns scenarios</p>
            <p><strong>POST</strong> <code className="bg-sage-200 px-1 rounded">/api/score-hiring</code> — Scores responses</p>
            <pre className="bg-sage-900 text-sage-100 rounded p-3 text-xs overflow-x-auto">{`{
  "role": "leadership",
  "candidate_name": "Jane Smith",
  "responses": [
    { "scenario_number": 1, "response": "I would..." },
    { "scenario_number": 2, "response": "My approach..." }
  ]
}`}</pre>
            <p>Available roles: leadership, customer-facing, technical, general</p>
          </div>
        </div>
      </div>
    </div>
  )
}
