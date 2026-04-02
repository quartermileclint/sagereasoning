'use client'

import { useState } from 'react'
import { authFetch } from '@/lib/auth-fetch'
import {
  PROXIMITY_ENGLISH,
  PROXIMITY_BG,
  PROXIMITY_COLORS,
  DOCUMENT_EVALUATIVE_DISCLAIMER,
  type DetectedDocumentPassion,
} from '@/lib/document-scorer'
import type { KatorthomaProximityLevel } from '@/lib/stoic-brain'

const ROOT_PASSION_ENGLISH: Record<string, string> = {
  craving: 'Craving',
  irrational_pleasure: 'Irrational Pleasure',
  fear: 'Fear',
  distress: 'Distress',
}

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

/** V3 scenario evaluation output — matches actual API response shape */
interface V3ScenarioResult {
  audience: string
  katorthoma_proximity: KatorthomaProximityLevel
  passions_detected: DetectedDocumentPassion[]
  kathekon_quality: string
  feedback: string
  sage_says: string
  scored_at: string
  disclaimer: string
  /** Optional V3-extended fields (may not always be present) */
  control_filter?: {
    within_control: string[]
    outside_control: string[]
  }
  kathekon_assessment?: {
    is_kathekon: boolean
    quality: string
    reasoning: string
  }
  false_judgements?: string[]
  virtue_domains_engaged?: string[]
  ruling_faculty_assessment?: string
  improvement_path?: string
  deliberation_walkthrough?: {
    is_honourable: string
    more_honourable: string
    is_advantageous: string
    more_advantageous: string
    honour_vs_advantage: string
  }
  sage_response?: string
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
  const [result, setResult] = useState<V3ScenarioResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'setup' | 'respond' | 'result'>('setup')

  async function loadScenario() {
    setLoadingScenario(true)
    setError(null)
    try {
      const res = await authFetch(`/api/score-scenario?audience=${audience}`)
      const envelope = await res.json()
      // API returns { result, meta } envelope — unwrap to get scenario data
      const data = envelope.result ?? envelope
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
        throw new Error(data.error || 'Evaluation failed')
      }

      const envelope = await res.json()
      // API returns { result, meta } envelope — unwrap to get evaluation data
      const data = envelope.result ?? envelope
      setResult(data)
      setStep('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl text-sage-900 mb-3">Ethical Scenarios</h1>
          <p className="font-body text-sage-600 max-w-xl mx-auto">
            Age-appropriate ethical dilemmas to practise virtue-based reasoning.
            Choose your level, face a dilemma, and walk through the Stoic evaluation.
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

        {/* Step 3: Results — V3 4-stage evaluation */}
        {step === 'result' && result && (
          <div className="space-y-6">
            {/* Proximity Header */}
            <div className={`rounded-xl border-2 p-8 text-center ${PROXIMITY_BG[result.katorthoma_proximity] || 'bg-gray-50 border-gray-200'}`}>
              <span
                className="text-3xl font-display font-bold"
                style={{ color: PROXIMITY_COLORS[result.katorthoma_proximity] }}
              >
                {PROXIMITY_ENGLISH[result.katorthoma_proximity]}
              </span>
              <p className="font-body text-sage-500 text-sm mt-1">Right Action Proximity</p>

              {/* Proximity Scale */}
              <div className="flex justify-between mt-4">
                {(['reflexive', 'habitual', 'deliberate', 'principled', 'sage_like'] as const).map((level) => (
                  <div
                    key={level}
                    className={`flex-1 text-center py-1 text-xs font-body ${
                      level === result.katorthoma_proximity ? 'font-bold' : 'text-sage-400'
                    }`}
                    style={level === result.katorthoma_proximity ? { color: PROXIMITY_COLORS[level] } : undefined}
                  >
                    {PROXIMITY_ENGLISH[level]}
                    {level === result.katorthoma_proximity && (
                      <div className="h-1 rounded-full mt-1 mx-auto w-10" style={{ backgroundColor: PROXIMITY_COLORS[level] }} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Unified Assessment */}
            <div className="bg-white border border-sage-200 rounded-lg p-6">
              <h3 className="font-display text-sm font-medium text-sage-400 uppercase tracking-wider mb-3">
                Unified Virtue Assessment
              </h3>
              <p className="font-body text-sage-700 text-sm">{result.ruling_faculty_assessment}</p>
              {result.virtue_domains_engaged && result.virtue_domains_engaged.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {result.virtue_domains_engaged.map((d) => (
                    <span key={d} className="px-3 py-1 bg-sage-50 rounded-full text-xs font-body text-sage-600">{d}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Stage 1: Control Filter */}
            <div className="bg-white border border-sage-200 rounded-lg p-6">
              <h3 className="font-display text-sm font-medium text-sage-400 uppercase tracking-wider mb-3">
                Control Filter
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <span className="font-body text-xs text-sage-500 block mb-2">Within Your Control</span>
                  <ul className="space-y-1">
                    {result.control_filter.within_control.map((item, i) => (
                      <li key={i} className="font-body text-sm text-sage-700">• {item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-body text-xs text-sage-500 block mb-2">Outside Your Control</span>
                  <ul className="space-y-1">
                    {result.control_filter.outside_control.map((item, i) => (
                      <li key={i} className="font-body text-sm text-sage-500">• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Stage 2: Appropriate Action */}
            <div className="bg-white border border-sage-200 rounded-lg p-6">
              <h3 className="font-display text-sm font-medium text-sage-400 uppercase tracking-wider mb-3">
                Appropriate Action Assessment
              </h3>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-body ${
                  result.kathekon_assessment.is_kathekon ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {result.kathekon_assessment.is_kathekon ? 'Appropriate' : 'Not Appropriate'}
                </span>
                <span className="font-body text-sm text-sage-600">Quality: {result.kathekon_assessment.quality}</span>
              </div>
              <p className="font-body text-sm text-sage-700">{result.kathekon_assessment.reasoning}</p>
            </div>

            {/* Stage 3: Passions */}
            {(result.passions_detected.length > 0 || result.false_judgements.length > 0) && (
              <div className="bg-white border border-sage-200 rounded-lg p-6">
                <h3 className="font-display text-sm font-medium text-sage-400 uppercase tracking-wider mb-3">
                  Passions Identified
                </h3>
                {result.passions_detected.map((p, i) => (
                  <div key={i} className="bg-sage-50 rounded p-3 mb-2">
                    <span className="font-display text-xs font-medium text-sage-700">
                      {ROOT_PASSION_ENGLISH[p.root_passion] || p.root_passion}
                    </span>
                    {p.sub_species && <span className="font-body text-xs text-sage-500 ml-1">({p.sub_species})</span>}
                    <p className="font-body text-xs text-sage-600 mt-1">{p.evidence}</p>
                    <p className="font-body text-xs text-sage-600">False judgement: {p.false_judgement}</p>
                  </div>
                ))}
                {result.false_judgements.length > 0 && (
                  <div className="mt-3">
                    <span className="font-body text-xs text-sage-500 block mb-2">All False Judgements</span>
                    <ul className="space-y-1">
                      {result.false_judgements.map((fj, i) => (
                        <li key={i} className="font-body text-sm text-sage-700">• {fj}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Deliberation Walkthrough — Cicero's 5 Questions */}
            {result.deliberation_walkthrough && (
              <div className="bg-white border border-sage-200 rounded-lg p-6">
                <h3 className="font-display text-sm font-medium text-sage-400 uppercase tracking-wider mb-3">
                  Deliberation Walkthrough
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-body text-xs font-medium text-sage-600">1. Is this action honourable?</span>
                    <p className="font-body text-sm text-sage-700">{result.deliberation_walkthrough.is_honourable}</p>
                  </div>
                  <div>
                    <span className="font-body text-xs font-medium text-sage-600">2. Among honourable options, which is more honourable?</span>
                    <p className="font-body text-sm text-sage-700">{result.deliberation_walkthrough.more_honourable}</p>
                  </div>
                  <div>
                    <span className="font-body text-xs font-medium text-sage-600">3. Is this action advantageous?</span>
                    <p className="font-body text-sm text-sage-700">{result.deliberation_walkthrough.is_advantageous}</p>
                  </div>
                  <div>
                    <span className="font-body text-xs font-medium text-sage-600">4. Among advantageous options, which is more advantageous?</span>
                    <p className="font-body text-sm text-sage-700">{result.deliberation_walkthrough.more_advantageous}</p>
                  </div>
                  <div>
                    <span className="font-body text-xs font-medium text-sage-600">5. When honour conflicts with advantage, which prevails?</span>
                    <p className="font-body text-sm text-sage-700">{result.deliberation_walkthrough.honour_vs_advantage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Sage Response */}
            {result.sage_response && (
              <div className="bg-sage-50 border border-sage-200 rounded-lg p-6">
                <h3 className="font-display text-sm font-medium text-sage-400 uppercase tracking-wider mb-3">
                  How the Sage Would Respond
                </h3>
                <p className="font-body text-sage-700 text-sm italic">{result.sage_response}</p>
              </div>
            )}

            {/* Improvement Path */}
            {result.improvement_path && (
              <div className="bg-white border border-sage-200 rounded-lg p-6">
                <h3 className="font-display text-sm font-medium text-sage-400 uppercase tracking-wider mb-3">
                  Path Forward
                </h3>
                <p className="font-body text-sm text-sage-700">{result.improvement_path}</p>
              </div>
            )}

            {/* Disclaimer (R3) */}
            <p className="font-body text-xs text-sage-400 text-center italic">
              {DOCUMENT_EVALUATIVE_DISCLAIMER}
            </p>

            {/* Actions */}
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
            <p><strong>POST</strong> <code className="bg-sage-200 px-1 rounded">/api/score-scenario</code> — Evaluate a response</p>
            <pre className="bg-sage-900 text-sage-100 rounded p-3 text-xs overflow-x-auto">{`{
  "scenario": "The ethical dilemma text...",
  "response": "User's answer...",
  "audience": "teen"
}`}</pre>
            <p>Returns: four-stage evaluation, deliberation walkthrough, sage response, and proximity level.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
