'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { CORE_QUESTIONS, Q5_BRANCHES, type FinalBaselineResult } from '@/lib/baseline-assessment'
import { VIRTUES, getAlignmentTier } from '@/lib/stoic-brain'
import { trackEvent } from '@/lib/analytics'
import { authFetch } from '@/lib/auth-fetch'

type Phase = 'intro' | 'questions' | 'q5' | 'loading' | 'result'

// ─── Local storage backup helpers ───
function saveBaselineLocally(userId: string, result: FinalBaselineResult) {
  try {
    localStorage.setItem(`baseline_result_${userId}`, JSON.stringify({
      ...result,
      saved_at: new Date().toISOString(),
    }))
  } catch { /* storage full */ }
}

export default function BaselineAssessmentPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('intro')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [q5Branch, setQ5Branch] = useState<'branch_a' | 'branch_b' | null>(null)
  const [q5Selected, setQ5Selected] = useState<string | null>(null)
  const [result, setResult] = useState<FinalBaselineResult | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/auth'
        return
      }
      setUserId(user.id)
    }
    checkAuth()
  }, [])

  const handleSelectOption = (optionId: string) => {
    setSelectedOption(optionId)
  }

  const handleNext = () => {
    if (!selectedOption) return
    const newAnswers = [...answers, selectedOption]
    setAnswers(newAnswers)
    setSelectedOption(null)

    if (currentQuestion < CORE_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      submitAssessment(newAnswers)
    }
  }

  const submitAssessment = async (coreAnswers: string[], q5Answer?: string) => {
    setPhase('loading')
    setError('')

    try {
      const res = await authFetch('/api/baseline', {
        method: 'POST',
        body: JSON.stringify({
          answers: coreAnswers,
          q5_answer: q5Answer || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        setPhase('questions')
        return
      }

      if (data.needs_q5) {
        setQ5Branch(data.needs_q5)
        setPhase('q5')
        return
      }

      setResult(data)
      setPhase('result')

      // Save a local backup of the result so users can always access it
      if (userId) {
        saveBaselineLocally(userId, data)
      }

      trackEvent({ event_type: 'baseline_completed', metadata: { score: data.total_score, tier: data.alignment_tier } })
    } catch {
      setError('Network error. Please try again.')
      setPhase('questions')
    }
  }

  const handleQ5Submit = () => {
    if (!q5Selected) return
    submitAssessment(answers, q5Selected)
  }

  // INTRO SCREEN
  if (phase === 'intro') {
    return (
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <img src="/images/sagelogosmall.PNG" alt="SageReasoning" className="w-20 h-20 mx-auto mb-6 rounded-full" />
        <h1 className="font-display text-3xl font-medium text-sage-800 mb-4">
          5-Question Baseline Stoic Assessment
        </h1>
        <p className="font-body text-sage-600 mb-2 text-lg">
          Discover where you stand on the path toward Stoic virtue.
        </p>
        <p className="font-display text-sage-700 italic mb-8">
          &ldquo;Begin your path toward truth by answering truthfully.&rdquo;
        </p>
        <div className="bg-white/60 border border-sage-200 rounded-lg p-6 mb-6 text-left">
          <p className="font-body text-sage-600 text-sm mb-3">
            This assessment measures your current alignment with the four Stoic cardinal virtues:
            Wisdom, Justice, Courage, and Temperance.
          </p>
          <p className="font-body text-sage-600 text-sm mb-3">
            There are no right or wrong answers. Answer based on what you <em>typically</em> do — not what you aspire to.
          </p>
          <p className="font-body text-sage-600 text-sm">
            4 core questions, plus 1 follow-up if needed. Takes about 2 minutes.
          </p>
        </div>

        {/* Privacy notice */}
        <div className="bg-sage-50 border border-sage-200 rounded-lg p-4 mb-8 text-left">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-sage-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-body text-xs text-sage-600 mb-1">
                <strong>What is stored:</strong> Your selected answer options (not any free text) and your scores are saved to your account to track your progress over time. Your results are also saved as a local backup in this browser.
              </p>
              <p className="font-body text-xs text-sage-500">
                You can retake this assessment every 30 days. Your baseline helps calibrate your virtue trend on the dashboard.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setPhase('questions')}
          className="px-8 py-3 bg-sage-400 text-white font-display text-lg rounded hover:bg-sage-500 transition-colors"
        >
          Begin Assessment
        </button>
      </div>
    )
  }

  // LOADING
  if (phase === 'loading') {
    return (
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <div className="animate-pulse">
          <img src="/images/sagelogosmall.PNG" alt="SageReasoning" className="w-16 h-16 mx-auto mb-6 rounded-full opacity-60" />
          <p className="font-body text-sage-600 text-lg">Calculating your Stoic baseline...</p>
        </div>
      </div>
    )
  }

  // Q5 BRANCH
  if (phase === 'q5' && q5Branch) {
    const branch = q5Branch === 'branch_a' ? Q5_BRANCHES.branchA : Q5_BRANCHES.branchB
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="font-display text-sm text-sage-500">Question 5 of 5</span>
            <span className="font-display text-sm text-sage-500">Refinement</span>
          </div>
          <div className="w-full bg-sage-100 rounded-full h-2">
            <div className="h-2 rounded-full bg-sage-400 transition-all duration-500" style={{ width: '100%' }} />
          </div>
        </div>

        <h2 className="font-display text-2xl text-sage-800 mb-8 leading-relaxed">
          {branch.question}
        </h2>

        <div className="space-y-3">
          {branch.options.map((option) => (
            <button
              key={option.id}
              onClick={() => setQ5Selected(option.id)}
              className={`w-full text-left p-5 rounded-lg border-2 transition-all font-body text-sage-800 leading-relaxed ${
                q5Selected === option.id
                  ? 'border-sage-400 bg-sage-50 shadow-sm'
                  : 'border-sage-200 bg-white/60 hover:border-sage-300'
              }`}
            >
              {option.text}
            </button>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleQ5Submit}
            disabled={!q5Selected}
            className="px-8 py-3 bg-sage-400 text-white font-display rounded hover:bg-sage-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Complete Assessment
          </button>
        </div>
      </div>
    )
  }

  // RESULT SCREEN
  if (phase === 'result' && result) {
    const tier = getAlignmentTier(result.total_score)
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl font-medium text-sage-800 mb-2">Your Baseline Stoic Profile</h1>
          <p className="font-body text-sage-600">Your starting point on the path to virtue</p>
        </div>

        {/* Score card */}
        <div className="bg-white/60 border border-sage-200 rounded-lg p-8 text-center mb-8">
          <p className="font-body text-sm text-sage-500 mb-2">Baseline Score</p>
          <p className="font-display text-6xl font-bold mb-2" style={{ color: tier.color }}>
            {result.total_score}
          </p>
          <p className="font-display text-xl font-medium" style={{ color: tier.color }}>
            {tier.label}
          </p>
          <p className="font-body text-sage-500 text-sm mt-1">{tier.description}</p>

          {/* Local backup notice */}
          <div className="mt-5 pt-4 border-t border-sage-100">
            <p className="font-body text-xs text-sage-400 flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Saved to your account and as a local backup in this browser
            </p>
          </div>
        </div>

        {/* Virtue breakdown */}
        <div className="bg-white/60 border border-sage-200 rounded-lg p-8 mb-8">
          <h2 className="font-display text-xl font-medium text-sage-800 mb-6">Virtue Breakdown</h2>
          <div className="space-y-4">
            {VIRTUES.map((virtue) => {
              const score = result[`${virtue.id}_score` as keyof FinalBaselineResult] as number
              const isStrongest = virtue.id === result.strongest_virtue
              const isGrowth = virtue.id === result.growth_area
              return (
                <div key={virtue.id} className="flex items-center gap-4">
                  <img src={virtue.icon} alt={virtue.name} className="w-12 h-12" />
                  <div className="w-28">
                    <span className="font-display text-sage-800">{virtue.name}</span>
                    {isStrongest && <span className="block text-xs text-sage-500 font-body">Strongest</span>}
                    {isGrowth && <span className="block text-xs text-sage-500 font-body">Growth area</span>}
                  </div>
                  <div className="flex-1 bg-sage-100 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${score}%`, backgroundColor: virtue.color }}
                    />
                  </div>
                  <span className="font-display font-bold w-10 text-right" style={{ color: virtue.color }}>
                    {score}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Interpretation */}
        <div className="bg-white/60 border border-sage-200 rounded-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <img src="/images/Zeus.PNG" alt="The Sage" className="w-14 h-14 object-contain rounded-full border-2 border-amber-200 bg-amber-50/50 drop-shadow-sm" />
            <div>
              <h2 className="font-display text-xl font-medium text-sage-800">Your Path Forward</h2>
              <span className="font-body text-xs text-amber-700 italic">ancient advice*</span>
            </div>
          </div>
          <p className="font-body text-sage-700 leading-relaxed">{result.interpretation}</p>
          <p className="font-body text-xs text-sage-400 mt-4 italic">
            * ancient advice does not consider your legal or personal obligations.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4">
          <a
            href="/dashboard"
            className="inline-block px-8 py-3 bg-sage-400 text-white font-display text-lg rounded hover:bg-sage-500 transition-colors"
          >
            Go to Dashboard
          </a>
          <p className="font-body text-sm text-sage-500">
            Score your first action to start building on your baseline.
          </p>
        </div>
      </div>
    )
  }

  // QUESTIONS FLOW
  const question = CORE_QUESTIONS[currentQuestion]
  const progress = ((currentQuestion) / CORE_QUESTIONS.length) * 100

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="font-display text-sm text-sage-500">
            Question {currentQuestion + 1} of {CORE_QUESTIONS.length}
          </span>
          <span className="font-display text-sm text-sage-500 capitalize">{question.virtue}</span>
        </div>
        <div className="w-full bg-sage-100 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-sage-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded p-4 mb-6 font-body text-center">
          {error}
        </div>
      )}

      <h2 className="font-display text-2xl text-sage-800 mb-8 leading-relaxed">
        {question.question}
      </h2>

      <div className="space-y-3">
        {question.options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelectOption(option.id)}
            className={`w-full text-left p-5 rounded-lg border-2 transition-all font-body text-sage-800 leading-relaxed ${
              selectedOption === option.id
                ? 'border-sage-400 bg-sage-50 shadow-sm'
                : 'border-sage-200 bg-white/60 hover:border-sage-300'
            }`}
          >
            {option.text}
          </button>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleNext}
          disabled={!selectedOption}
          className="px-8 py-3 bg-sage-400 text-white font-display rounded hover:bg-sage-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {currentQuestion === CORE_QUESTIONS.length - 1 ? 'Submit' : 'Next'}
        </button>
      </div>
    </div>
  )
}
