'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  CORE_QUESTIONS,
  Q6_BRANCHES,
  DIMENSION_LEVEL_ENGLISH,
  DIMENSION_LEVEL_COLORS,
  SENECAN_GRADE_ENGLISH,
  OIKEIOSIS_STAGE_ENGLISH,
  DOMINANT_PASSION_ENGLISH,
  BASELINE_DISCLAIMER,
  type V3FinalBaselineResult,
} from '@/lib/baseline-assessment'
import { trackEvent } from '@/lib/analytics'
import { authFetch } from '@/lib/auth-fetch'

type Phase = 'intro' | 'questions' | 'q6' | 'loading' | 'result'

/** Senecan grade display colors. */
const GRADE_COLORS: Record<string, string> = {
  pre_progress: '#B45309',
  grade_3: '#CA8A04',
  grade_2: '#65A30D',
  grade_1: '#059669',
}

export default function BaselineAssessmentPage() {
  const [_userId, setUserId] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('intro')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [q6Branch, setQ6Branch] = useState<'borderline_grade_2_3' | 'borderline_grade_1_2' | null>(null)
  const [q6Selected, setQ6Selected] = useState<string | null>(null)
  const [result, setResult] = useState<V3FinalBaselineResult | null>(null)
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

  const submitAssessment = async (coreAnswers: string[], q6Answer?: string) => {
    setPhase('loading')
    setError('')

    try {
      const res = await authFetch('/api/baseline', {
        method: 'POST',
        body: JSON.stringify({
          answers: coreAnswers,
          q6_answer: q6Answer || undefined,
        }),
      })

      const raw = await res.json()

      if (!res.ok) {
        setError(raw.error || 'Something went wrong')
        setPhase('questions')
        return
      }

      if (raw.needs_q6) {
        setQ6Branch(raw.needs_q6)
        setPhase('q6')
        return
      }

      // API returns { result, meta } envelope — unwrap to get assessment data
      const data = raw.result ?? raw
      setResult(data)
      setPhase('result')

      trackEvent({
        event_type: 'baseline_completed',
        metadata: { senecan_grade: data.senecan_grade, dominant_passion: data.dominant_passion },
      })
    } catch {
      setError('Network error. Please try again.')
      setPhase('questions')
    }
  }

  const handleQ6Submit = () => {
    if (!q6Selected) return
    submitAssessment(answers, q6Selected)
  }

  // ─── INTRO SCREEN ───
  if (phase === 'intro') {
    return (
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <img src="/images/sagelogosmall.PNG" alt="SageReasoning" className="w-20 h-20 mx-auto mb-6 rounded-full" />
        <h1 className="font-display text-3xl font-medium text-sage-800 mb-4">
          Baseline Philosophical Assessment
        </h1>
        <p className="font-body text-sage-600 mb-2 text-lg">
          Discover where you stand on the path of moral progress.
        </p>
        <p className="font-display text-sage-700 italic mb-8">
          &ldquo;Begin your path toward truth by answering truthfully.&rdquo;
        </p>
        <div className="bg-white/60 border border-sage-200 rounded-lg p-6 mb-6 text-left">
          <p className="font-body text-sage-600 text-sm mb-3">
            This assessment maps your starting position across four dimensions of moral progress:
            how well you recognise and manage strong reactions, the quality of your judgement about
            what truly matters, the consistency of your character under pressure, and the breadth of
            your concern for others.
          </p>
          <p className="font-body text-sage-600 text-sm mb-3">
            There are no right or wrong answers. Answer based on what you <em>typically</em> do — not what you aspire to.
          </p>
          <p className="font-body text-sage-600 text-sm">
            5 core questions, plus 1 follow-up if needed. Takes about 2 minutes.
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
                <strong>What is stored:</strong> Your selected answer options and your profile are saved to your account to track progress over time.
              </p>
              <p className="font-body text-xs text-sage-500">
                You can retake this assessment every 30 days. Your baseline helps calibrate your progress on the dashboard.
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

  // ─── LOADING ───
  if (phase === 'loading') {
    return (
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <div className="animate-pulse">
          <img src="/images/sagelogosmall.PNG" alt="SageReasoning" className="w-16 h-16 mx-auto mb-6 rounded-full opacity-60" />
          <p className="font-body text-sage-600 text-lg">Generating your philosophical baseline...</p>
        </div>
      </div>
    )
  }

  // ─── Q6 CONDITIONAL BRANCH ───
  if (phase === 'q6' && q6Branch) {
    const branch = Q6_BRANCHES[q6Branch]
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="font-display text-sm text-sage-500">Question 6 of 6</span>
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
              onClick={() => setQ6Selected(option.id)}
              className={`w-full text-left p-5 rounded-lg border-2 transition-all font-body text-sage-800 leading-relaxed ${
                q6Selected === option.id
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
            onClick={handleQ6Submit}
            disabled={!q6Selected}
            className="px-8 py-3 bg-sage-400 text-white font-display rounded hover:bg-sage-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Complete Assessment
          </button>
        </div>
      </div>
    )
  }

  // ─── RESULT SCREEN ───
  if (phase === 'result' && result) {
    const gradeColor = GRADE_COLORS[result.senecan_grade] || '#6B7280'
    const gradeLabel = SENECAN_GRADE_ENGLISH[result.senecan_grade]

    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl font-medium text-sage-800 mb-2">Your Baseline Profile</h1>
          <p className="font-body text-sage-600">Your starting point on the path of progress</p>
        </div>

        {/* Grade card */}
        <div className="bg-white/60 border border-sage-200 rounded-lg p-8 text-center mb-8">
          <p className="font-body text-sm text-sage-500 mb-2">Progress Grade</p>
          <p className="font-display text-3xl font-bold mb-1" style={{ color: gradeColor }}>
            {gradeLabel}
          </p>
          <p className="font-body text-sage-500 text-sm mt-1">
            Based on three grades of moral progress
          </p>
        </div>

        {/* Four dimensions */}
        <div className="bg-white/60 border border-sage-200 rounded-lg p-8 mb-8">
          <h2 className="font-display text-xl font-medium text-sage-800 mb-6">Progress Dimensions</h2>
          <div className="space-y-5">
            {/* Passion Reduction */}
            <DimensionRow
              label="Awareness of Passions"
              level={result.passion_reduction}
              description="How well you recognise and manage strong emotional reactions"
            />
            {/* Judgement Quality */}
            <DimensionRow
              label="Quality of Judgement"
              level={result.judgement_quality}
              description="How accurately you distinguish what is genuinely good from externals"
            />
            {/* Disposition Stability */}
            <DimensionRow
              label="Consistency of Character"
              level={result.disposition_stability}
              description="How stable your character is under pressure"
            />
            {/* Oikeiosis */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="font-display text-sage-800 text-sm mb-0.5">Circle of Concern</p>
                <p className="font-body text-xs text-sage-500">How broadly you consider others in decisions</p>
              </div>
              <span
                className="font-display text-sm font-bold px-3 py-1 rounded-full"
                style={{
                  color: DIMENSION_LEVEL_COLORS[
                    result.oikeiosis_stage === 'humanity' || result.oikeiosis_stage === 'cosmic'
                      ? 'advanced'
                      : result.oikeiosis_stage === 'community'
                        ? 'established'
                        : result.oikeiosis_stage === 'household'
                          ? 'developing'
                          : 'emerging'
                  ],
                  backgroundColor: `${DIMENSION_LEVEL_COLORS[
                    result.oikeiosis_stage === 'humanity' || result.oikeiosis_stage === 'cosmic'
                      ? 'advanced'
                      : result.oikeiosis_stage === 'community'
                        ? 'established'
                        : result.oikeiosis_stage === 'household'
                          ? 'developing'
                          : 'emerging'
                  ]}15`,
                }}
              >
                {OIKEIOSIS_STAGE_ENGLISH[result.oikeiosis_stage]}
              </span>
            </div>
          </div>
        </div>

        {/* Dominant Passion */}
        <div className="bg-white/60 border border-sage-200 rounded-lg p-8 mb-8">
          <h2 className="font-display text-xl font-medium text-sage-800 mb-2">Dominant Tendency</h2>
          <p className="font-body text-sm text-sage-500 mb-4">
            The passion most active in your current practice — not a diagnosis, but a starting point for self-knowledge.
          </p>
          <div className="bg-sage-50 border border-sage-200 rounded-lg p-4">
            <p className="font-display text-lg font-medium text-sage-800">
              {DOMINANT_PASSION_ENGLISH[result.dominant_passion]}
            </p>
          </div>
        </div>

        {/* Interpretation */}
        <div className="bg-white/60 border border-sage-200 rounded-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <img src="/images/Zeus.PNG" alt="The Sage" className="w-14 h-14 object-contain rounded-full border-2 border-amber-200 bg-amber-50/50 drop-shadow-sm" />
            <div>
              <h2 className="font-display text-xl font-medium text-sage-800">Your Path Forward</h2>
              <span className="font-body text-xs text-amber-700 italic">philosophical reflection*</span>
            </div>
          </div>
          {result.interpretation.split('\n\n').map((para, i) => (
            <p key={i} className="font-body text-sage-700 leading-relaxed mb-3">
              {para}
            </p>
          ))}
          <p className="font-body text-xs text-sage-400 mt-4 italic">
            * {BASELINE_DISCLAIMER}
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

  // ─── QUESTIONS FLOW ───
  const question = CORE_QUESTIONS[currentQuestion]
  const progress = ((currentQuestion) / CORE_QUESTIONS.length) * 100

  // Dimension labels for question header (R8c — English only)
  const DIMENSION_LABELS: Record<string, string> = {
    passion_reduction: 'Awareness of Passions',
    judgement_quality: 'Quality of Judgement',
    disposition_stability: 'Consistency of Character',
    oikeiosis_extension: 'Circle of Concern',
    passion_profile: 'Dominant Tendency',
    refinement: 'Refinement',
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="font-display text-sm text-sage-500">
            Question {currentQuestion + 1} of {CORE_QUESTIONS.length}
          </span>
          <span className="font-display text-sm text-sage-500">
            {DIMENSION_LABELS[question.dimension] || question.dimension}
          </span>
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

      <h2 className="font-display text-2xl text-sage-800 mb-4 leading-relaxed">
        {question.question}
      </h2>

      {question.context && (
        <p className="font-body text-sm text-sage-500 mb-6 italic">{question.context}</p>
      )}

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

// ─── Helper component for dimension display ───

function DimensionRow({
  label,
  level,
  description,
}: {
  label: string
  level: string
  description: string
}) {
  const dimensionLevel = level as keyof typeof DIMENSION_LEVEL_ENGLISH
  const color = DIMENSION_LEVEL_COLORS[dimensionLevel] || '#6B7280'
  const levelLabel = DIMENSION_LEVEL_ENGLISH[dimensionLevel] || level

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <p className="font-display text-sage-800 text-sm mb-0.5">{label}</p>
        <p className="font-body text-xs text-sage-500">{description}</p>
      </div>
      <span
        className="font-display text-sm font-bold px-3 py-1 rounded-full"
        style={{ color, backgroundColor: `${color}15` }}
      >
        {levelLabel}
      </span>
    </div>
  )
}
