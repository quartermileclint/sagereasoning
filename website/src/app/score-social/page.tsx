'use client'

import { useState } from 'react'
import { authFetch } from '@/lib/auth-fetch'
import {
  PROXIMITY_ENGLISH,
  PROXIMITY_BG,
  PROXIMITY_COLORS,
  DOCUMENT_EVALUATIVE_DISCLAIMER,
  type V3SocialMediaEvaluation,
  type DetectedDocumentPassion,
} from '@/lib/document-scorer'

const ROOT_PASSION_ENGLISH: Record<string, string> = {
  craving: 'Craving',
  irrational_pleasure: 'Irrational Pleasure',
  fear: 'Fear',
  distress: 'Distress',
}

export default function ScoreSocialPage() {
  const [text, setText] = useState('')
  const [platform, setPlatform] = useState('general')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<V3SocialMediaEvaluation | null>(null)
  const [distressRedirect, setDistressRedirect] = useState<{ severity: string; redirect_message: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const charCount = text.length

  async function handleScore() {
    if (text.trim().length < 5) {
      setError('Enter at least a few words to evaluate.')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)
    setDistressRedirect(null)

    try {
      const res = await authFetch('/api/score-social', {
        method: 'POST',
        body: JSON.stringify({ text: text.trim(), platform }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Evaluation failed')
      }

      const envelope = await res.json()
      const data = envelope.result ?? envelope

      // R20a — distress detection: show redirect instead of evaluation
      if (data.distress_detected) {
        setDistressRedirect({ severity: data.severity, redirect_message: data.redirect_message })
        setLoading(false)
        return
      }

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
          <h1 className="font-display text-4xl text-sage-900 mb-3">Social Media Filter</h1>
          <p className="font-body text-sage-600 max-w-xl mx-auto">
            Before you post, check: what passions drove this content? What passions will it trigger
            in readers? What false judgements does it carry? A Stoic diagnostic for your public words.
          </p>
        </div>

        {/* Input Form */}
        {!result && (
          <div className="space-y-4">
            <div className="flex gap-2">
              {['general', 'twitter', 'linkedin', 'email'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`px-4 py-2 rounded-lg font-body text-sm transition-colors ${
                    platform === p
                      ? 'bg-sage-800 text-white'
                      : 'bg-sage-100 text-sage-600 hover:bg-sage-200'
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>

            <div>
              <label htmlFor="text" className="block font-body text-sage-700 text-sm mb-1">
                Your draft
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your draft post, tweet, message, or email here..."
                rows={8}
                className="w-full px-4 py-3 border border-sage-300 rounded-lg font-body text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-400 resize-y"
              />
              <div className="text-right mt-1">
                <span className="font-body text-xs text-sage-400">{charCount} characters</span>
              </div>
            </div>

            {error && <p className="font-body text-red-600 text-sm">{error}</p>}

            <button
              onClick={handleScore}
              disabled={loading || text.trim().length < 5}
              className="w-full py-3 bg-sage-800 text-white font-display text-lg rounded-lg hover:bg-sage-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Diagnosing...' : 'Run Passion Diagnostic'}
            </button>

            {loading && (
              <p className="font-body text-sage-500 text-sm text-center animate-pulse">
                Identifying passions, false judgements, and corrections...
              </p>
            )}
          </div>
        )}

        {/* R20a — Distress redirect */}
        {distressRedirect && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center space-y-4">
            <div className="text-4xl">❤️</div>
            <h2 className="font-display text-2xl text-red-800">We want to make sure you are okay</h2>
            <p className="font-body text-red-700 whitespace-pre-line">{distressRedirect.redirect_message}</p>
            <button
              onClick={() => {
                setDistressRedirect(null)
                setText('')
              }}
              className="mt-4 px-6 py-3 bg-sage-800 text-white font-display rounded-lg hover:bg-sage-700 transition-colors"
            >
              Start Over
            </button>
          </div>
        )}

        {/* Result */}
        {result && (
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
            </div>

            {/* Your draft */}
            <div className="bg-sage-50 rounded-lg p-4">
              <span className="font-body text-xs text-sage-400 block mb-2">Your draft</span>
              <p className="font-body text-sage-700 text-sm whitespace-pre-wrap">{text}</p>
            </div>

            {/* Poster's Passions */}
            {result.poster_passions.length > 0 && (
              <div className="bg-white border border-sage-200 rounded-lg p-6">
                <h3 className="font-display text-sm font-medium text-sage-400 uppercase tracking-wider mb-3">
                  Your Motivating Passions
                </h3>
                <p className="font-body text-xs text-sage-500 mb-3">
                  Passions identified in what drove you to write this:
                </p>
                <PassionList passions={result.poster_passions} />
              </div>
            )}

            {/* Reader-Triggered Passions */}
            {result.reader_triggered_passions.length > 0 && (
              <div className="bg-white border border-sage-200 rounded-lg p-6">
                <h3 className="font-display text-sm font-medium text-sage-400 uppercase tracking-wider mb-3">
                  What This Triggers in Readers
                </h3>
                <p className="font-body text-xs text-sage-500 mb-3">
                  Passions this content is likely to provoke in those who read it:
                </p>
                <PassionList passions={result.reader_triggered_passions} />
              </div>
            )}

            {/* False Judgements */}
            {result.false_judgements.length > 0 && (
              <div className="bg-white border border-sage-200 rounded-lg p-6">
                <h3 className="font-display text-sm font-medium text-sage-400 uppercase tracking-wider mb-3">
                  False Judgements Embedded
                </h3>
                <ul className="space-y-2">
                  {result.false_judgements.map((fj, i) => (
                    <li key={i} className="font-body text-sm text-sage-700">• {fj}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Corrections */}
            {result.corrections.length > 0 && (
              <div className="bg-sage-50 border border-sage-200 rounded-lg p-6">
                <h3 className="font-display text-sm font-medium text-sage-400 uppercase tracking-wider mb-3">
                  Correct Judgements
                </h3>
                <p className="font-body text-xs text-sage-500 mb-3">
                  The Stoic corrections for each false judgement identified:
                </p>
                <ul className="space-y-2">
                  {result.corrections.map((c, i) => (
                    <li key={i} className="font-body text-sm text-sage-700">• {c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* No passions case */}
            {result.poster_passions.length === 0 && result.reader_triggered_passions.length === 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <p className="font-body text-green-700">No significant passions detected. This content appears measured and rational.</p>
              </div>
            )}

            {/* Disclaimer (R3) */}
            <p className="font-body text-xs text-sage-400 text-center italic">
              {DOCUMENT_EVALUATIVE_DISCLAIMER}
            </p>

            {/* Try Again */}
            <div className="text-center">
              <button
                onClick={() => { setResult(null); setText('') }}
                className="px-6 py-3 bg-sage-800 text-white font-display rounded-lg hover:bg-sage-700 transition-colors"
              >
                Check Another Draft
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

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
