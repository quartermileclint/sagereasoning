'use client'

import { useState } from 'react'
import { authFetch } from '@/lib/auth-fetch'

interface ScenarioOption {
  label: string
  text: string
}

interface Scenario {
  audience: string
  scenario: string
  options: ScenarioOption[]
  topic: string
}

interface ScenarioResult {
  wisdom_score: number
  justice_score: number
  courage_score: number
  temperance_score: number
  total_score: number
  alignment_tier: string
  feedback: string
  sage_says: string
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

const AUDIENCES = [
  { value: 'child', label: 'Child (6-11)', description: 'Simple school and family situations' },
  { value: 'teen', label: 'Teen (12-17)', description: 'Peer pressure, social media, independence' },
  { value: 'adult', label: 'Adult (18+)', description: 'Workplace, relationships, moral ambiguity' },
]

export default function ScenariosPage() {
  const [audience, setAudience] = useState('teen')
  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [customResponse, setCustomResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingScenario, setLoadingScenario] = useState(false)
  const [result, setResult] = useState<ScenarioResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'setup' | 'respond' | 'result'>('setup')

  async function loadScenario() {
    setLoadingScenario(true)
    setError(null)
    try {
      const res = await authFetch(`/api/score-scenario?audience=${audience}`)
      const data = await res.json()
      setScenario(data)
      setSelectedOption(null)
      setCustomResponse('')
      setStep('respond')
    } catch {
      setError('Failed to generate scenario')
    } finally {
      setLoadingScenario(false)
    }
  }

  async function handleScore() {
    const responseText = customResponse.trim() || selectedOption
    if (!responseText || responseText.length < 5) {
      setError('Please select an option or write your own response.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await authFetch('/api/score-scenario', {
        method: 'POST',
        body: JSON.stringify({
          scenario: scenario?.scenario,
          response: responseText,
          audience,
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

  const virtues = result ? [
    { name: 'Wisdom', score: result.wisdom_score, weight: '30%' },
    { name: 'Justice', score: result.justice_score, weight: '25%' },
    { name: 'Courage', score: result.courage_score, weight: '25%' },
    { name: 'Temperance', score: result.temperance_score, weight: '20%' },
  ] : []

  return (
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl text-sage-900 mb-3">Ethical Scenarios</h1>
          <p className="font-body text-sage-600 max-w-xl mx-auto">
            Age-appropriate ethical dilemmas to develop virtue-based thinking.
            Choose your level, face a dilemma, and see how a Stoic sage would respond.
          </p>
        </div>

        {/* Step 1: Choose audience */}
        {step === 'setup' && (
          <div className="space-y-4">
            <div className="grid gap-3">
              {AUDIENCES.map((a) => (
                <button
                  key={a.value}
                  onClick={() => setAudience(a.value)}
                  className={`text-left p-4 rounded-lg border-2 transition-colors ${
                    audience === a.value
                      ? 'border-sage-600 bg-sage-50'
                      : 'border-sage-200 hover:border-sage-400'
                  }`}
                >
                  <span className="font-display text-sage-800">{a.label}</span>
                  <p className="font-body text-sage-500 text-sm mt-1">{a.description}</p>
                </button>
              ))}
            </div>

            {error && <p className="font-body text-red-600 text-sm">{error}</p>}

            <button
              onClick={loadScenario}
              disabled={loadingScenario}
              className="w-full py-3 bg-sage-800 text-white font-display text-lg rounded-lg hover:bg-sage-700 transition-colors disabled:opacity-50"
            >
              {loadingScenario ? 'Creating Scenario...' : 'Start a Scenario'}
            </button>
          </div>
        )}

        {/* Step 2: Respond */}
        {step === 'respond' && scenario && (
          <div className="space-y-6">
            <div className="bg-sage-50 rounded-xl border border-sage-200 p-6">
              <span className="text-xs font-body bg-sage-200 text-sage-700 px-2 py-1 rounded capitalize">{scenario.topic}</span>
              <p className="font-display text-lg text-sage-800 mt-3">{scenario.scenario}</p>
            </div>

            {/* Options */}
            <div className="space-y-2">
              {scenario.options.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => { setSelectedOption(opt.text); setCustomResponse('') }}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    selectedOption === opt.text && !customResponse
                      ? 'border-sage-600 bg-sage-50'
                      : 'border-sage-200 hover:border-sage-400'
                  }`}
                >
                  <span className="font-display text-sage-600 mr-2">{opt.label}.</span>
                  <span className="font-body text-sage-800">{opt.text}</span>
                </button>
              ))}
            </div>

            <div className="text-center font-body text-sage-400 text-sm">— or write your own —</div>

            <textarea
              value={customResponse}
              onChange={(e) => { setCustomResponse(e.target.value); if (e.target.value) setSelectedOption(null) }}
              placeholder="Your own response..."
              rows={4}
              className="w-full px-4 py-3 border border-sage-300 rounded-lg font-body text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-400 resize-y"
            />

            {error && <p className="font-body text-red-600 text-sm">{error}</p>}

            <button
              onClick={handleScore}
              disabled={loading || (!selectedOption && !customResponse.trim())}
              className="w-full py-3 bg-sage-800 text-white font-display text-lg rounded-lg hover:bg-sage-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Evaluating...' : 'Submit My Response'}
            </button>
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
                <p className="font-body text-sage-700 text-sm">{result.feedback}</p>
              </div>

              <div className="bg-sage-100/50 rounded-lg p-4">
                <p className="font-display text-sm text-sage-700 mb-1">The Sage Says</p>
                <p className="font-body text-sage-600 text-sm italic">{result.sage_says}</p>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => { setResult(null); setStep('respond'); setSelectedOption(null); setCustomResponse('') }}
                className="px-6 py-3 border-2 border-sage-300 text-sage-700 font-display rounded-lg hover:border-sage-500 transition-colors"
              >
                Try Same Scenario Again
              </button>
              <button
                onClick={() => { setResult(null); setStep('setup'); setScenario(null); setSelectedOption(null); setCustomResponse('') }}
                className="px-6 py-3 bg-sage-800 text-white font-display rounded-lg hover:bg-sage-700 transition-colors"
              >
                New Scenario
              </button>
            </div>
          </div>
        )}

        <div className="mt-16 border-t border-sage-200 pt-8">
          <h2 className="font-display text-2xl text-sage-800 mb-4">For AI Agents &amp; Developers</h2>
          <div className="bg-sage-50 rounded-lg p-6 font-body text-sage-700 text-sm space-y-3">
            <p><strong>GET</strong> <code className="bg-sage-200 px-1 rounded">/api/score-scenario?audience=teen</code> — Generate a scenario</p>
            <p><strong>POST</strong> <code className="bg-sage-200 px-1 rounded">/api/score-scenario</code> — Score a response</p>
            <pre className="bg-sage-900 text-sage-100 rounded p-3 text-xs overflow-x-auto">{`{
  "scenario": "The ethical dilemma text...",
  "response": "User's answer...",
  "audience": "teen"
}`}</pre>
            <p>Audiences: child (6-11), teen (12-17), adult (18+)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
