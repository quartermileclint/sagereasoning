'use client'

import { useState } from 'react'
import { authFetch } from '@/lib/auth-fetch'
import {
  PROXIMITY_ENGLISH,
  PROXIMITY_BG,
  PROXIMITY_COLORS,
  DOCUMENT_EVALUATIVE_DISCLAIMER,
  type V3PolicyEvaluation,
  type DetectedDocumentPassion,
  type FlaggedClause,
} from '@/lib/document-scorer'

const ROOT_PASSION_ENGLISH: Record<string, string> = {
  craving: 'Craving',
  irrational_pleasure: 'Irrational Pleasure',
  fear: 'Fear',
  distress: 'Distress',
}

const severityColors: Record<string, string> = {
  high: 'bg-red-100 border-red-300 text-red-800',
  medium: 'bg-amber-100 border-amber-300 text-amber-800',
  low: 'bg-yellow-50 border-yellow-200 text-yellow-800',
}

export default function ScorePolicyPage() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<V3PolicyEvaluation | null>(null)
  const [error, setError] = useState<string | null>(null)

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  async function handleScore() {
    if (wordCount < 20) {
      setError('Policy must be at least 20 words.')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await authFetch('/api/score-document', {
        method: 'POST',
        body: JSON.stringify({ text: text.trim(), mode: 'policy' }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Evaluation failed')
      }

      const envelope = await res.json()
      // API returns { result, meta } envelope — unwrap to get evaluation data
      const data = envelope.result ?? envelope
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl text-sage-900 mb-3">Policy &amp; Contract Review</h1>
          <p className="font-body text-sage-600 max-w-xl mx-auto">
            Evaluate a policy, contract, or terms of service through a Stoic lens — assessing fairness,
            proportionality, and the passions the document exploits or generates.
          </p>
          <p className="font-body text-xs text-sage-400 mt-2 italic">
            {DOCUMENT_EVALUATIVE_DISCLAIMER}
          </p>
        </div>

        {/* Input Form */}
        {!result && (
          <div className="space-y-4">
            <div>
              <label htmlFor="text" className="block font-body text-sage-700 text-sm mb-1">
                Policy / Contract Text
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the policy, terms of service, or contract text here..."
                rows={16}
                className="w-full px-4 py-3 border border-sage-300 rounded-lg font-body text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-400 resize-y"
              />
              <div className="flex justify-between mt-1">
                <span className="font-body text-xs text-sage-400">
                  {wordCount} words {wordCount > 0 && wordCount < 20 && '(minimum 20)'}
                </span>
                <span className="font-body text-xs text-sage-400">Max ~8,000 words</span>
              </div>
            </div>

            {error && <p className="font-body text-red-600 text-sm">{error}</p>}

            <button
              onClick={handleScore}
              disabled={loading || wordCount < 20}
              className="w-full py-3 bg-sage-800 text-white font-display text-lg rounded-lg hover:bg-sage-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Evaluating...' : 'Evaluate This Policy'}
            </button>

            {loading && (
              <p className="font-body text-sage-500 text-sm text-center animate-pulse">
                Running Stoic evaluation with deliberation framework...
              </p>
            )}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-6">
            {/* Proximity Header */}
            <div className={`rounded-xl border-2 p-8 ${PROXIMITY_BG[result.katorthoma_proximity] || 'bg-gray-50 border-gray-200'}`}>
              <div className="text-center mb-4">
                <span
                  className="text-3xl font-display font-bold"
                  style={{ color: PROXIMITY_COLORS[result.katorthoma_proximity] }}
                >
                  {PROXIMITY_ENGLISH[result.katorthoma_proximity]}
                </span>
                <p className="font-body text-sage-500 text-sm mt-1">Right Action Proximity</p>
              </div>
              <div className="bg-white/50 rounded-lg p-4">
                <p className="font-body text-sage-700 text-sm">{result.ruling_faculty_assessment}</p>
              </div>
            </div>

            {/* Deliberation Framework */}
            {result.deliberation_assessment && (
              <div className="bg-white border border-sage-200 rounded-lg p-6">
                <h3 className="font-display text-sm font-medium text-sage-400 uppercase tracking-wider mb-3">
                  Deliberation Framework
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-body text-xs font-medium text-sage-600">Is this policy honourable?</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-body ${
                        result.deliberation_assessment.is_honourable.answer
                          ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {result.deliberation_assessment.is_honourable.answer ? 'Yes' : 'No'}
                      </span>
                      <span className="font-body text-sm text-sage-600">{result.deliberation_assessment.is_honourable.reasoning}</span>
                    </div>
                  </div>
                  <div>
                    <span className="font-body text-xs font-medium text-sage-600">Is it advantageous?</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-body ${
                        result.deliberation_assessment.is_advantageous.answer
                          ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {result.deliberation_assessment.is_advantageous.answer ? 'Yes' : 'No'}
                      </span>
                      <span className="font-body text-sm text-sage-600">{result.deliberation_assessment.is_advantageous.reasoning}</span>
                    </div>
                  </div>
                  <div>
                    <span className="font-body text-xs font-medium text-sage-600">When honour conflicts with advantage:</span>
                    <p className="font-body text-sm text-sage-700 mt-1">{result.deliberation_assessment.honour_vs_advantage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Social Impact (Oikeiosis) */}
            {result.oikeiosis_impact && (
              <div className="bg-white border border-sage-200 rounded-lg p-6">
                <h3 className="font-display text-sm font-medium text-sage-400 uppercase tracking-wider mb-3">
                  Who This Policy Affects
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Individual', value: result.oikeiosis_impact.self },
                    { label: 'Household', value: result.oikeiosis_impact.household },
                    { label: 'Community', value: result.oikeiosis_impact.community },
                    { label: 'Humanity', value: result.oikeiosis_impact.humanity },
                  ].map((level) => (
                    <div key={level.label}>
                      <span className="font-body text-xs font-medium text-sage-600">{level.label}</span>
                      <p className="font-body text-sm text-sage-700">{level.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Flagged Clauses */}
            {result.flagged_clauses && result.flagged_clauses.length > 0 && (
              <div className="bg-white border border-sage-200 rounded-lg p-6">
                <h3 className="font-display text-sm font-medium text-sage-400 uppercase tracking-wider mb-3">
                  Flagged Clauses ({result.flagged_clauses.length})
                </h3>
                <div className="space-y-3">
                  {result.flagged_clauses.map((clause: FlaggedClause, i: number) => (
                    <div key={i} className={`border rounded-lg p-4 ${severityColors[clause.severity]}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-body font-medium uppercase">{clause.severity}</span>
                      </div>
                      <p className="font-body text-sm mb-1">{clause.clause_summary}</p>
                      <p className="font-body text-xs opacity-80">
                        Passion exploited: {ROOT_PASSION_ENGLISH[clause.passion_exploited] || clause.passion_exploited}
                      </p>
                      <p className="font-body text-xs opacity-80">
                        False judgement: {clause.false_judgement}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Passions in the Drafter */}
            {result.passions_detected.authorial_passions.length > 0 && (
              <div className="bg-white border border-sage-200 rounded-lg p-6">
                <h3 className="font-display text-sm font-medium text-sage-400 uppercase tracking-wider mb-3">
                  Passions Identified in Drafter
                </h3>
                <div className="space-y-2">
                  {result.passions_detected.authorial_passions.map((p: DetectedDocumentPassion, i: number) => (
                    <div key={i} className="bg-sage-50 rounded p-3">
                      <span className="font-display text-xs font-medium text-sage-700">
                        {ROOT_PASSION_ENGLISH[p.root_passion] || p.root_passion}
                      </span>
                      <p className="font-body text-xs text-sage-600 mt-1">{p.evidence}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Improvement Path */}
            {result.improvement_path && (
              <div className="bg-sage-50 border border-sage-200 rounded-lg p-6">
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

            {/* Evaluate Another */}
            <div className="text-center">
              <button
                onClick={() => { setResult(null); setText('') }}
                className="px-6 py-3 bg-sage-800 text-white font-display rounded-lg hover:bg-sage-700 transition-colors"
              >
                Evaluate Another Policy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
