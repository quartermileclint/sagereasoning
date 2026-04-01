'use client'

import { useState } from 'react'
import { authFetch } from '@/lib/auth-fetch'
import {
  PROXIMITY_ENGLISH,
  PROXIMITY_BG,
  PROXIMITY_COLORS,
  KATHEKON_QUALITY_ENGLISH,
  DOCUMENT_EVALUATIVE_DISCLAIMER,
  type V3DocumentEvaluation,
  type DetectedDocumentPassion,
} from '@/lib/document-scorer'

const ROOT_PASSION_ENGLISH: Record<string, string> = {
  craving: 'Craving',
  irrational_pleasure: 'Irrational Pleasure',
  fear: 'Fear',
  distress: 'Distress',
}

export default function ScoreDocumentPage() {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<V3DocumentEvaluation | null>(null)
  const [error, setError] = useState<string | null>(null)

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  async function handleScore() {
    if (wordCount < 20) {
      setError('Document must be at least 20 words.')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await authFetch('/api/score-document', {
        method: 'POST',
        body: JSON.stringify({ text: text.trim(), title: title.trim() || undefined }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Evaluation failed')
      }

      const data = await res.json()
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
          <h1 className="font-display text-4xl text-sage-900 mb-3">Evaluate a Document</h1>
          <p className="font-body text-sage-600 max-w-xl mx-auto">
            Assess any written content through a four-stage Stoic evaluation: control filter,
            appropriate action assessment, passion diagnosis, and unified virtue assessment.
          </p>
        </div>

        {/* Input Form */}
        {!result && (
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block font-body text-sage-700 text-sm mb-1">
                Document Title <span className="text-sage-400">(optional)</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. My Company Policy on Ethical AI"
                className="w-full px-4 py-3 border border-sage-300 rounded-lg font-body text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-400"
              />
            </div>

            <div>
              <label htmlFor="text" className="block font-body text-sage-700 text-sm mb-1">
                Document Text
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your document content here..."
                rows={14}
                className="w-full px-4 py-3 border border-sage-300 rounded-lg font-body text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-400 resize-y"
              />
              <div className="flex justify-between mt-1">
                <span className="font-body text-xs text-sage-400">
                  {wordCount} words {wordCount > 0 && wordCount < 20 && '(minimum 20)'}
                </span>
                <span className="font-body text-xs text-sage-400">
                  Max ~8,000 words evaluated
                </span>
              </div>
            </div>

            {error && (
              <p className="font-body text-red-600 text-sm">{error}</p>
            )}

            <button
              onClick={handleScore}
              disabled={loading || wordCount < 20}
              className="w-full py-3 bg-sage-800 text-white font-display text-lg rounded-lg hover:bg-sage-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Evaluating...' : 'Evaluate This Document'}
            </button>

            {loading && (
              <p className="font-body text-sage-500 text-sm text-center animate-pulse">
                Running four-stage Stoic evaluation...
              </p>
            )}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-6">
            {/* Proximity Header */}
            <div className={`rounded-xl border-2 p-8 ${PROXIMITY_BG[result.katorthoma_proximity] || 'bg-gray-50 border-gray-200'}`}>
              <div className="text-center mb-6">
                {result.document_title && (
                  <h2 className="font-display text-xl text-sage-800 mb-1">{result.document_title}</h2>
                )}
                <div className="mt-3">
                  <span
                    className="text-3xl font-display font-bold"
                    style={{ color: PROXIMITY_COLORS[result.katorthoma_proximity] }}
                  >
                    {PROXIMITY_ENGLISH[result.katorthoma_proximity]}
                  </span>
                  <p className="font-body text-sage-500 text-sm mt-1">Right Action Proximity</p>
                </div>
              </div>

              {/* Proximity Scale */}
              <div className="flex justify-between mb-6">
                {(['reflexive', 'habitual', 'deliberate', 'principled', 'sage_like'] as const).map((level) => (
                  <div
                    key={level}
                    className={`flex-1 text-center py-2 text-xs font-body ${
                      level === result.katorthoma_proximity
                        ? 'font-bold'
                        : 'text-sage-400'
                    }`}
                    style={level === result.katorthoma_proximity ? { color: PROXIMITY_COLORS[level] } : undefined}
                  >
                    {PROXIMITY_ENGLISH[level]}
                    {level === result.katorthoma_proximity && (
                      <div
                        className="h-1 rounded-full mt-1 mx-auto w-12"
                        style={{ backgroundColor: PROXIMITY_COLORS[level] }}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Unified Assessment */}
              <div className="bg-white/50 rounded-lg p-4 mb-4">
                <p className="font-body text-sage-700 text-sm">{result.ruling_faculty_assessment}</p>
              </div>

              {/* Virtue Domains Engaged */}
              {result.virtue_domains_engaged && result.virtue_domains_engaged.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  {result.virtue_domains_engaged.map((domain) => (
                    <span key={domain} className="px-3 py-1 bg-white/60 rounded-full text-xs font-body text-sage-600">
                      {domain}
                    </span>
                  ))}
                </div>
              )}

              <div className="text-xs font-body text-sage-400 text-center">
                {result.word_count.toLocaleString()} words · Evaluated {new Date(result.evaluated_at).toLocaleDateString()}
              </div>
            </div>

            {/* Stage 1: Control Filter */}
            <div className="bg-white border border-sage-200 rounded-lg p-6">
              <h3 className="font-display text-sm font-medium text-sage-400 uppercase tracking-wider mb-3">
                Stage 1 — Control Filter
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <span className="font-body text-xs text-sage-500 block mb-2">Within Author&apos;s Control</span>
                  <ul className="space-y-1">
                    {result.authorial_control.within_control.map((item, i) => (
                      <li key={i} className="font-body text-sm text-sage-700">• {item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-body text-xs text-sage-500 block mb-2">Outside Author&apos;s Control</span>
                  <ul className="space-y-1">
                    {result.authorial_control.outside_control.map((item, i) => (
                      <li key={i} className="font-body text-sm text-sage-500">• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Stage 2: Appropriate Action */}
            <div className="bg-white border border-sage-200 rounded-lg p-6">
              <h3 className="font-display text-sm font-medium text-sage-400 uppercase tracking-wider mb-3">
                Stage 2 — Appropriate Action
              </h3>
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-body ${
                  result.kathekon_assessment.is_kathekon
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {result.kathekon_assessment.is_kathekon ? 'Appropriate' : 'Not Appropriate'}
                </span>
                <span className="font-body text-sm text-sage-600">
                  Quality: {KATHEKON_QUALITY_ENGLISH[result.kathekon_assessment.quality] || result.kathekon_assessment.quality}
                </span>
              </div>
              <p className="font-body text-sm text-sage-700">{result.kathekon_assessment.reasoning}</p>
            </div>

            {/* Stage 3: Passion Diagnosis */}
            <div className="bg-white border border-sage-200 rounded-lg p-6">
              <h3 className="font-display text-sm font-medium text-sage-400 uppercase tracking-wider mb-3">
                Stage 3 — Passions Identified
              </h3>

              {/* Authorial Passions */}
              {result.passions_detected.authorial_passions.length > 0 && (
                <div className="mb-4">
                  <span className="font-body text-xs text-sage-500 block mb-2">In the Author</span>
                  <PassionList passions={result.passions_detected.authorial_passions} />
                </div>
              )}

              {/* Reader-Triggered Passions */}
              {result.passions_detected.reader_triggered_passions.length > 0 && (
                <div className="mb-4">
                  <span className="font-body text-xs text-sage-500 block mb-2">Triggered in Readers</span>
                  <PassionList passions={result.passions_detected.reader_triggered_passions} />
                </div>
              )}

              {/* False Judgements */}
              {result.passions_detected.false_judgements.length > 0 && (
                <div>
                  <span className="font-body text-xs text-sage-500 block mb-2">False Judgements Identified</span>
                  <ul className="space-y-1">
                    {result.passions_detected.false_judgements.map((fj, i) => (
                      <li key={i} className="font-body text-sm text-sage-700">• {fj}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.passions_detected.authorial_passions.length === 0 &&
               result.passions_detected.reader_triggered_passions.length === 0 && (
                <p className="font-body text-sm text-sage-500 italic">No significant passions detected.</p>
              )}
            </div>

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
                onClick={() => {
                  setResult(null)
                  setText('')
                  setTitle('')
                }}
                className="px-6 py-3 bg-sage-800 text-white font-display rounded-lg hover:bg-sage-700 transition-colors"
              >
                Evaluate Another Document
              </button>
            </div>
          </div>
        )}

        {/* For AI Agents */}
        <div className="mt-16 border-t border-sage-200 pt-8">
          <h2 className="font-display text-2xl text-sage-800 mb-4">For AI Agents &amp; Developers</h2>
          <div className="bg-sage-50 rounded-lg p-6 font-body text-sage-700 text-sm space-y-3">
            <p><strong>POST</strong> <code className="bg-sage-200 px-1 rounded">/api/score-document</code></p>
            <pre className="bg-sage-900 text-sage-100 rounded p-3 text-xs overflow-x-auto">{`{
  "text": "Your document content here...",
  "title": "Optional Title"
}`}</pre>
            <p>Returns: four-stage evaluation with passion diagnosis, proximity level, and improvement path.</p>
            <p>CORS enabled. Authentication required.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Renders a list of detected passions with English labels */
function PassionList({ passions }: { passions: DetectedDocumentPassion[] }) {
  return (
    <div className="space-y-2">
      {passions.map((p, i) => (
        <div key={i} className="bg-sage-50 rounded p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-display text-xs font-medium text-sage-700">
              {ROOT_PASSION_ENGLISH[p.root_passion] || p.root_passion}
            </span>
            {p.sub_species && (
              <span className="font-body text-xs text-sage-500">({p.sub_species})</span>
            )}
          </div>
          <p className="font-body text-xs text-sage-600 mb-1">
            <span className="text-sage-400">Evidence:</span> {p.evidence}
          </p>
          <p className="font-body text-xs text-sage-600">
            <span className="text-sage-400">False judgement:</span> {p.false_judgement}
          </p>
        </div>
      ))}
    </div>
  )
}
