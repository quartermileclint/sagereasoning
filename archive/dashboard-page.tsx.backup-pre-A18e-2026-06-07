'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { authFetch } from '@/lib/auth-fetch'
import { trackEvent } from '@/lib/analytics'
import {
  DIMENSION_LEVEL_ENGLISH,
  DIMENSION_LEVEL_COLORS,
  SENECAN_GRADE_ENGLISH,
  OIKEIOSIS_STAGE_ENGLISH,
  DOMINANT_PASSION_ENGLISH,
  BASELINE_DISCLAIMER,
  type DimensionLevel,
} from '@/lib/baseline-assessment'
import PracticeCalendar from '@/components/PracticeCalendar'
import MilestonesDisplay from '@/components/MilestonesDisplay'
import type { User } from '@supabase/supabase-js'
import type { KatorthomaProximityLevel, OikeiosisStageId, SenecanGradeId } from '@/lib/stoic-brain'

// ─── V3 Dashboard Types ───

interface V3BaselineData {
  passion_reduction: DimensionLevel
  judgement_quality: DimensionLevel
  disposition_stability: DimensionLevel
  oikeiosis_stage: OikeiosisStageId
  senecan_grade: SenecanGradeId
  dominant_passion: string
  interpretation: string
  created_at: string
}

interface V3ActionEvaluation {
  id: string
  action: string
  katorthoma_proximity: KatorthomaProximityLevel
  passions_detected: Array<{ name: string; root_passion: string }>
  false_judgements: string[]
  virtue_domains_engaged: string[]
  ruling_faculty_state: string
  improvement_path: string
  created_at: string
}

interface BaselineStatus {
  has_baseline: boolean
  version?: 'v1' | 'v3'
  baseline?: V3BaselineData
  retake_eligible?: boolean
  retake_eligible_date?: string
}

// ─── Proximity display helpers ───

const PROXIMITY_ENGLISH: Record<KatorthomaProximityLevel, string> = {
  reflexive: 'Reflexive',
  habitual: 'Habitual',
  deliberate: 'Deliberate',
  principled: 'Principled',
  sage_like: 'Sage-Like',
}

const PROXIMITY_COLORS: Record<KatorthomaProximityLevel, string> = {
  reflexive: '#DC2626',
  habitual: '#B45309',
  deliberate: '#CA8A04',
  principled: '#65A30D',
  sage_like: '#059669',
}

const GRADE_COLORS: Record<string, string> = {
  pre_progress: '#B45309',
  grade_3: '#CA8A04',
  grade_2: '#65A30D',
  grade_1: '#059669',
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [evaluations, setEvaluations] = useState<V3ActionEvaluation[]>([])
  const [baselineStatus, setBaselineStatus] = useState<BaselineStatus | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/auth'
        return
      }
      setUser(user)

      const [evalsRes, baselineRes] = await Promise.all([
        supabase
          .from('action_evaluations_v3')
          .select('id, action, katorthoma_proximity, passions_detected, false_judgements, virtue_domains_engaged, ruling_faculty_state, improvement_path, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20),
        authFetch('/api/baseline').then(r => r.json()),
      ])

      if (evalsRes.data) setEvaluations(evalsRes.data)
      setBaselineStatus(baselineRes)
      setLoading(false)

      trackEvent({ event_type: 'dashboard_view' })
    }
    load()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <p className="font-body text-sage-600 text-lg">Loading your profile...</p>
      </div>
    )
  }

  const baseline = baselineStatus?.baseline as V3BaselineData | undefined
  const isV3Baseline = baselineStatus?.version === 'v3'

  // Compute summary stats from V3 evaluations
  const totalEvaluations = evaluations.length
  const proximityDistribution = computeProximityDistribution(evaluations)
  const totalPassionsDetected = evaluations.reduce(
    (sum, e) => sum + (Array.isArray(e.passions_detected) ? e.passions_detected.length : 0), 0
  )
  const avgPassionsPerAction = totalEvaluations > 0
    ? (totalPassionsDetected / totalEvaluations).toFixed(1)
    : '—'

  // Direction of travel: compare recent 5 evaluations to earlier ones
  const directionOfTravel = computeDirectionOfTravel(evaluations)

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="font-display text-3xl font-medium text-sage-800">Your Progress Profile</h1>
          <p className="font-body text-sage-600 mt-1">{user?.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 border border-sage-300 text-sage-600 font-display text-sm rounded hover:bg-sage-100 transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Baseline prompt for users without one */}
      {baselineStatus && !baselineStatus.has_baseline && (
        <div className="bg-sage-50 border-2 border-sage-300 rounded-lg p-8 mb-8 text-center">
          <img src="/images/sagelogosmall.PNG" alt="Sage" className="w-14 h-14 mx-auto mb-4 rounded-full" />
          <h2 className="font-display text-2xl text-sage-800 mb-2">Complete Your Baseline Assessment</h2>
          <p className="font-body text-sage-600 mb-1">
            Map your starting position across four dimensions of moral progress.
          </p>
          <p className="font-display text-sage-700 italic mb-6">
            &ldquo;Begin your path toward truth by answering truthfully.&rdquo;
          </p>
          <a
            href="/baseline"
            className="inline-block px-8 py-3 bg-sage-400 text-white font-display text-lg rounded hover:bg-sage-500 transition-colors"
          >
            Take Baseline Assessment
          </a>
        </div>
      )}

      {/* V3 Baseline section */}
      {baseline && isV3Baseline && (
        <div className="bg-white/60 border border-sage-200 rounded-lg p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <h2 className="font-display text-xl font-medium text-sage-800">Baseline Assessment</h2>
            <div className="text-right">
              {baselineStatus?.retake_eligible ? (
                <a
                  href="/baseline"
                  className="px-4 py-2 border border-sage-300 text-sage-600 font-display text-sm rounded hover:bg-sage-100 transition-colors"
                >
                  Retake Baseline
                </a>
              ) : (
                <div>
                  <span className="font-body text-xs text-sage-400 block">Retake available</span>
                  <span className="font-display text-sm text-sage-500">
                    {baselineStatus?.retake_eligible_date
                      ? new Date(baselineStatus.retake_eligible_date).toLocaleDateString('en-AU', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })
                      : '—'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Grade card */}
            <div className="text-center">
              <p className="font-body text-sm text-sage-500 mb-2">Progress Grade</p>
              <p
                className="font-display text-3xl font-bold mb-1"
                style={{ color: GRADE_COLORS[baseline.senecan_grade] || '#6B7280' }}
              >
                {SENECAN_GRADE_ENGLISH[baseline.senecan_grade]}
              </p>
              <p className="font-body text-xs text-sage-400 mt-2">
                Taken {new Date(baseline.created_at).toLocaleDateString('en-AU', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </p>
            </div>

            {/* Dimension levels */}
            <div className="space-y-3">
              <DimensionBar label="Awareness of Passions" level={baseline.passion_reduction} />
              <DimensionBar label="Quality of Judgement" level={baseline.judgement_quality} />
              <DimensionBar label="Consistency of Character" level={baseline.disposition_stability} />
              <div className="flex items-center gap-3">
                <span className="font-display text-sm w-40 text-sage-800">Circle of Concern</span>
                <span
                  className="font-display text-sm font-bold px-3 py-1 rounded-full"
                  style={{
                    color: GRADE_COLORS[baseline.senecan_grade] || '#6B7280',
                    backgroundColor: `${GRADE_COLORS[baseline.senecan_grade] || '#6B7280'}15`,
                  }}
                >
                  {OIKEIOSIS_STAGE_ENGLISH[baseline.oikeiosis_stage]}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-display text-sm w-40 text-sage-800">Dominant Tendency</span>
                <span className="font-display text-sm font-bold text-sage-600">
                  {DOMINANT_PASSION_ENGLISH[baseline.dominant_passion as keyof typeof DOMINANT_PASSION_ENGLISH] || baseline.dominant_passion}
                </span>
              </div>
            </div>
          </div>

          {/* Interpretation */}
          {baseline.interpretation && (
            <div className="mt-6 pt-6 border-t border-sage-100">
              <div className="flex items-center gap-3 mb-3">
                <img src="/images/Zeus.PNG" alt="The Sage" className="w-10 h-10 object-contain rounded-full border border-amber-200 bg-amber-50/50" />
                <span className="font-display text-sm text-amber-800 italic">Philosophical Reflection* — Your Path Forward</span>
              </div>
              {baseline.interpretation.split('\n\n').map((para, i) => (
                <p key={i} className="font-body text-sm text-sage-600 leading-relaxed mb-2">
                  {para}
                </p>
              ))}
              <p className="font-body text-xs text-sage-400 mt-2 italic">
                * {BASELINE_DISCLAIMER}
              </p>
            </div>
          )}
        </div>
      )}

      {evaluations.length === 0 ? (
        /* Empty state */
        <div className="bg-white/60 border border-sage-200 rounded-lg p-12 text-center">
          <img src="/images/sagelogo.PNG" alt="Sage" className="w-20 h-20 mx-auto mb-6 opacity-60" />
          <h2 className="font-display text-2xl text-sage-800 mb-3">No actions evaluated yet</h2>
          <p className="font-body text-sage-600 mb-6 max-w-md mx-auto">
            Evaluate your first action to begin tracking your progress across the four dimensions.
          </p>
          <a href="/score" className="px-6 py-3 bg-sage-400 text-white font-display rounded hover:bg-sage-500 transition-colors">
            Evaluate Your First Action
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Summary stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white/60 border border-sage-200 rounded-lg p-6 text-center">
              <p className="font-body text-sm text-sage-500 mb-2">Actions Evaluated</p>
              <p className="font-display text-4xl font-bold text-sage-800">{totalEvaluations}</p>
            </div>

            <div className="bg-white/60 border border-sage-200 rounded-lg p-6 text-center">
              <p className="font-body text-sm text-sage-500 mb-2">Most Common Proximity</p>
              <p
                className="font-display text-lg font-bold"
                style={{ color: PROXIMITY_COLORS[proximityDistribution.mode] || '#6B7280' }}
              >
                {PROXIMITY_ENGLISH[proximityDistribution.mode] || '—'}
              </p>
            </div>

            <div className="bg-white/60 border border-sage-200 rounded-lg p-6 text-center">
              <p className="font-body text-sm text-sage-500 mb-2">Avg Passions per Action</p>
              <p className="font-display text-4xl font-bold text-sage-800">{avgPassionsPerAction}</p>
            </div>

            <div className="bg-white/60 border border-sage-200 rounded-lg p-6 text-center">
              <p className="font-body text-sm text-sage-500 mb-2">Direction of Travel</p>
              <p className={`font-display text-lg font-bold ${
                directionOfTravel === 'improving' ? 'text-emerald-600'
                  : directionOfTravel === 'regressing' ? 'text-amber-600'
                    : 'text-sage-600'
              }`}>
                {directionOfTravel === 'improving' ? 'Improving' : directionOfTravel === 'regressing' ? 'Regressing' : 'Stable'}
              </p>
            </div>
          </div>

          {/* Proximity distribution */}
          <div className="bg-white/60 border border-sage-200 rounded-lg p-8">
            <h2 className="font-display text-xl font-medium text-sage-800 mb-6">Proximity Distribution</h2>
            <p className="font-body text-sm text-sage-500 mb-4">
              How your evaluated actions distribute across the proximity scale.
            </p>
            <div className="space-y-3">
              {(['sage_like', 'principled', 'deliberate', 'habitual', 'reflexive'] as KatorthomaProximityLevel[]).map(level => {
                const count = proximityDistribution.counts[level] || 0
                const pct = totalEvaluations > 0 ? (count / totalEvaluations) * 100 : 0
                return (
                  <div key={level} className="flex items-center gap-4">
                    <span className="font-display text-sm w-24 text-sage-800">{PROXIMITY_ENGLISH[level]}</span>
                    <div className="flex-1 bg-sage-100 rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${pct}%`, backgroundColor: PROXIMITY_COLORS[level] }}
                      />
                    </div>
                    <span className="font-display text-sm font-bold w-8 text-right text-sage-600">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Practice Calendar */}
          {user && <PracticeCalendar userId={user.id} />}

          {/* Milestones */}
          {user && <MilestonesDisplay userId={user.id} />}

          {/* Recent evaluations */}
          <div className="bg-white/60 border border-sage-200 rounded-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-medium text-sage-800">Recent Evaluations</h2>
              <a href="/score" className="font-display text-sm text-sage-500 hover:text-sage-700 underline">Evaluate another</a>
            </div>
            <div className="space-y-4">
              {evaluations.map((evaluation) => {
                const proxColor = PROXIMITY_COLORS[evaluation.katorthoma_proximity] || '#6B7280'
                const passionCount = Array.isArray(evaluation.passions_detected) ? evaluation.passions_detected.length : 0
                return (
                  <div key={evaluation.id} className="border border-sage-200 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-body text-sage-800 leading-relaxed">{evaluation.action}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="font-body text-xs text-sage-500">
                            {new Date(evaluation.created_at).toLocaleDateString('en-AU', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })}
                          </p>
                          {passionCount > 0 && (
                            <span className="font-body text-xs text-amber-600">
                              {passionCount} passion{passionCount !== 1 ? 's' : ''} identified
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-display text-lg font-bold" style={{ color: proxColor }}>
                          {PROXIMITY_ENGLISH[evaluation.katorthoma_proximity]}
                        </p>
                      </div>
                    </div>
                    {evaluation.improvement_path && (
                      <div className="mt-3 border-t border-sage-100 pt-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <img src="/images/Zeus.PNG" alt="The Sage" className="w-6 h-6 object-contain rounded-full border border-amber-200 bg-amber-50/50" />
                          <span className="font-body text-xs text-amber-700 italic">philosophical reflection*</span>
                        </div>
                        <p className="font-body text-sm text-sage-600">
                          {evaluation.improvement_path}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <p className="font-body text-xs text-sage-400 mt-6 pt-4 border-t border-sage-100 italic">
              * {BASELINE_DISCLAIMER}
            </p>
          </div>
        </div>
      )}

      {/* ── Data & Account Controls ── */}
      <div className="mt-12 bg-white/60 border border-sage-200 rounded-xl p-6">
        <h2 className="font-display text-lg font-semibold text-sage-800 mb-1">Your Data</h2>
        <p className="font-body text-sm text-sage-600 mb-5 leading-relaxed">
          Under the Australian Privacy Act, you have the right to access, export, and delete
          your personal data at any time.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            disabled
            title="Data export is coming soon"
            className="flex items-center gap-2 px-4 py-2.5 border border-sage-300 text-sage-500 font-display text-sm rounded cursor-not-allowed opacity-60"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export my data
            <span className="text-xs font-body italic">(coming soon)</span>
          </button>

          <button
            disabled
            title="Account deletion is coming soon"
            className="flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-400 font-display text-sm rounded cursor-not-allowed opacity-60"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete my account
            <span className="text-xs font-body italic">(coming soon)</span>
          </button>
        </div>
        <p className="font-body text-xs text-sage-400 mt-3 italic">
          Need help now? Email{' '}
          <a href="mailto:support@sagereasoning.com"
             className="underline hover:text-sage-600">support@sagereasoning.com</a>
          {' '}and we will handle your request manually.
        </p>
      </div>
    </div>
  )
}

// ─── Helper components ───

function DimensionBar({ label, level }: { label: string; level: DimensionLevel }) {
  const color = DIMENSION_LEVEL_COLORS[level]
  const levelLabel = DIMENSION_LEVEL_ENGLISH[level]
  // Map level to a visual width: emerging=25%, developing=50%, established=75%, advanced=100%
  const widthMap: Record<DimensionLevel, number> = {
    emerging: 25, developing: 50, established: 75, advanced: 100,
  }

  return (
    <div className="flex items-center gap-3">
      <span className="font-display text-sm w-40 text-sage-800">{label}</span>
      <div className="flex-1 bg-sage-100 rounded-full h-2.5">
        <div
          className="h-2.5 rounded-full transition-all duration-1000"
          style={{ width: `${widthMap[level]}%`, backgroundColor: color }}
        />
      </div>
      <span className="font-display text-sm font-bold w-24 text-right" style={{ color }}>
        {levelLabel}
      </span>
    </div>
  )
}

// ─── V3 helper functions ───

function computeProximityDistribution(evaluations: V3ActionEvaluation[]) {
  const counts: Record<string, number> = {
    reflexive: 0, habitual: 0, deliberate: 0, principled: 0, sage_like: 0,
  }
  for (const e of evaluations) {
    if (e.katorthoma_proximity in counts) {
      counts[e.katorthoma_proximity]++
    }
  }
  // Find mode
  let mode: KatorthomaProximityLevel = 'deliberate'
  let maxCount = 0
  for (const [level, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count
      mode = level as KatorthomaProximityLevel
    }
  }
  return { counts, mode }
}

const PROXIMITY_RANK: Record<string, number> = {
  reflexive: 0, habitual: 1, deliberate: 2, principled: 3, sage_like: 4,
}

function computeDirectionOfTravel(evaluations: V3ActionEvaluation[]): 'improving' | 'stable' | 'regressing' {
  if (evaluations.length < 4) return 'stable'

  // Compare average proximity rank of recent half vs older half
  const mid = Math.floor(evaluations.length / 2)
  const recent = evaluations.slice(0, mid) // most recent (sorted desc)
  const older = evaluations.slice(mid)

  const avgRecent = recent.reduce((sum, e) => sum + (PROXIMITY_RANK[e.katorthoma_proximity] || 0), 0) / recent.length
  const avgOlder = older.reduce((sum, e) => sum + (PROXIMITY_RANK[e.katorthoma_proximity] || 0), 0) / older.length

  const diff = avgRecent - avgOlder
  if (diff > 0.3) return 'improving'
  if (diff < -0.3) return 'regressing'
  return 'stable'
}
