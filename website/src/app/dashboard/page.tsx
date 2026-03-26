'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { authFetch } from '@/lib/auth-fetch'
import { trackEvent } from '@/lib/analytics'
import { VIRTUES, getAlignmentTier } from '@/lib/stoic-brain'
import PracticeCalendar from '@/components/PracticeCalendar'
import VirtueConstellation from '@/components/VirtueConstellation'
import MilestonesDisplay from '@/components/MilestonesDisplay'
import type { User } from '@supabase/supabase-js'

interface StoicProfile {
  avg_wisdom: number
  avg_justice: number
  avg_courage: number
  avg_temperance: number
  avg_total: number
  sage_alignment: string
  strongest_virtue: string
  growth_virtue: string
  actions_scored: number
  trend: string
}

interface ActionScore {
  id: string
  action_description: string
  total_score: number
  sage_alignment: string
  wisdom_score: number
  justice_score: number
  courage_score: number
  temperance_score: number
  reasoning: string
  created_at: string
}

interface BaselineData {
  total_score: number
  wisdom_score: number
  justice_score: number
  courage_score: number
  temperance_score: number
  alignment_tier: string
  strongest_virtue: string
  growth_area: string
  interpretation: string
  created_at: string
}

interface BaselineStatus {
  has_baseline: boolean
  baseline?: BaselineData
  retake_eligible?: boolean
  retake_eligible_date?: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<StoicProfile | null>(null)
  const [scores, setScores] = useState<ActionScore[]>([])
  const [baselineStatus, setBaselineStatus] = useState<BaselineStatus | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/auth'
        return
      }
      setUser(user)

      const [profileRes, scoresRes, baselineRes] = await Promise.all([
        supabase.from('user_stoic_profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('action_scores').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
        authFetch('/api/baseline').then(r => r.json()),
      ])

      if (profileRes.data) setProfile(profileRes.data)
      if (scoresRes.data) setScores(scoresRes.data)
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
        <div className="flex items-center justify-center gap-4 mb-4">
          {VIRTUES.map((v, i) => (
            <img
              key={v.id}
              src={v.icon}
              alt={v.name}
              className="w-12 h-12 opacity-40"
              style={{ animation: `dashPulse 1.5s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
        <p className="font-body text-sage-600 text-lg">Loading your Stoic profile...</p>
        <style>{`
          @keyframes dashPulse {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.15); }
          }
        `}</style>
      </div>
    )
  }

  const baseline = baselineStatus?.baseline
  const baselineTier = baseline ? getAlignmentTier(baseline.total_score) : null
  const profileTier = profile ? getAlignmentTier(profile.avg_total) : null

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="font-display text-3xl font-medium text-sage-800">Your Stoic Profile</h1>
          <p className="font-body text-sage-600 mt-1">{user?.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 border border-sage-300 text-sage-600 font-display text-sm rounded hover:bg-sage-100 transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Baseline prompt for existing users without one */}
      {baselineStatus && !baselineStatus.has_baseline && (
        <div className="bg-sage-50 border-2 border-sage-300 rounded-lg p-8 mb-8 text-center">
          <img src="/images/sagelogosmall.PNG" alt="Sage" className="w-14 h-14 mx-auto mb-4 rounded-full" />
          <h2 className="font-display text-2xl text-sage-800 mb-2">Complete Your Baseline Assessment</h2>
          <p className="font-body text-sage-600 mb-1">
            Discover your starting Stoic score with a quick 5-question assessment.
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

      {/* Baseline score section */}
      {baseline && baselineTier && (
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
            {/* Score + tier */}
            <div className="text-center">
              <p className="font-body text-sm text-sage-500 mb-2">Baseline Score</p>
              <p className="font-display text-5xl font-bold mb-1" style={{ color: baselineTier.color }}>
                {baseline.total_score}
              </p>
              <p className="font-display text-lg font-medium" style={{ color: baselineTier.color }}>
                {baselineTier.label}
              </p>
              <p className="font-body text-xs text-sage-400 mt-2">
                Taken {new Date(baseline.created_at).toLocaleDateString('en-AU', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </p>
            </div>

            {/* Virtue breakdown bars */}
            <div className="space-y-3">
              {VIRTUES.map((virtue) => {
                const score = baseline[`${virtue.id}_score` as keyof BaselineData] as number
                return (
                  <div key={virtue.id} className="flex items-center gap-3">
                    <img src={virtue.icon} alt={virtue.name} className="w-10 h-10" />
                    <span className="font-display text-sm w-24 text-sage-800">{virtue.name}</span>
                    <div className="flex-1 bg-sage-100 rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full transition-all duration-1000"
                        style={{ width: `${score}%`, backgroundColor: virtue.color }}
                      />
                    </div>
                    <span className="font-display text-sm font-bold w-8 text-right" style={{ color: virtue.color }}>
                      {score}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Interpretation */}
          {baseline.interpretation && (
            <div className="mt-6 pt-6 border-t border-sage-100">
              <div className="flex items-center gap-3 mb-3">
                <img src="/images/Zeus.PNG" alt="The Sage" className="w-10 h-10 object-contain rounded-full border border-amber-200 bg-amber-50/50" />
                <span className="font-display text-sm text-amber-800 italic">Ancient Advice* — Your Path Forward</span>
              </div>
              <p className="font-body text-sm text-sage-600 leading-relaxed">
                {baseline.interpretation}
              </p>
              <p className="font-body text-xs text-sage-400 mt-2 italic">
                * ancient advice does not consider your legal or personal obligations.
              </p>
            </div>
          )}
        </div>
      )}

      {!profile || scores.length === 0 ? (
        /* Empty state — no scored actions yet */
        <div className="bg-white/60 border border-sage-200 rounded-lg p-12 text-center">
          <img src="/images/sagelogo.PNG" alt="Sage" className="w-20 h-20 mx-auto mb-6 opacity-60" />
          <h2 className="font-display text-2xl text-sage-800 mb-3">No actions scored yet</h2>
          <p className="font-body text-sage-600 mb-6 max-w-md mx-auto">
            Score your first action to begin building your Stoic profile and tracking your alignment over time.
          </p>
          <a href="/score" className="px-6 py-3 bg-sage-400 text-white font-display rounded hover:bg-sage-500 transition-colors">
            Score Your First Action
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Virtue Constellation + Stats side by side */}
          <div className="grid md:grid-cols-2 gap-6">
            <VirtueConstellation
              avgWisdom={profile!.avg_wisdom}
              avgJustice={profile!.avg_justice}
              avgCourage={profile!.avg_courage}
              avgTemperance={profile!.avg_temperance}
              avgTotal={profile!.avg_total}
            />
            <div className="grid grid-cols-2 gap-4 content-start">
              <div className="bg-white/60 border border-sage-200 rounded-lg p-6 text-center">
                <p className="font-body text-sm text-sage-500 mb-2">Average Score</p>
                <p className="font-display text-4xl font-bold" style={{ color: profileTier?.color }}>
                  {Math.round(profile!.avg_total)}
                </p>
                <p className="font-display text-sm font-medium mt-1" style={{ color: profileTier?.color }}>
                  {profileTier?.label}
                </p>
              </div>

              <div className="bg-white/60 border border-sage-200 rounded-lg p-6 text-center">
                <p className="font-body text-sm text-sage-500 mb-2">Actions Scored</p>
                <p className="font-display text-4xl font-bold text-sage-800">{profile!.actions_scored}</p>
              </div>

              <div className="bg-white/60 border border-sage-200 rounded-lg p-6 text-center">
                <p className="font-body text-sm text-sage-500 mb-2">Strongest Virtue</p>
                <p className="font-display text-lg font-bold text-sage-800 capitalize">{profile!.strongest_virtue}</p>
                {profile!.strongest_virtue && (
                  <img
                    src={VIRTUES.find(v => v.id === profile!.strongest_virtue)?.icon}
                    alt={profile!.strongest_virtue}
                    className="w-14 h-14 mx-auto mt-2 drop-shadow-sm"
                  />
                )}
              </div>

              <div className="bg-white/60 border border-sage-200 rounded-lg p-6 text-center">
                <p className="font-body text-sm text-sage-500 mb-2">Growth Area</p>
                <p className="font-display text-lg font-bold text-sage-800 capitalize">{profile!.growth_virtue}</p>
                {profile!.growth_virtue && (
                  <img
                    src={VIRTUES.find(v => v.id === profile!.growth_virtue)?.icon}
                    alt={profile!.growth_virtue}
                    className="w-14 h-14 mx-auto mt-2 opacity-50 drop-shadow-sm"
                  />
                )}
                <p className="font-body text-xs text-sage-500 mt-1 capitalize">{profile!.trend}</p>
              </div>
            </div>
          </div>

          {/* Virtue averages */}
          <div className="bg-white/60 border border-sage-200 rounded-lg p-8">
            <h2 className="font-display text-xl font-medium text-sage-800 mb-6">Virtue Averages</h2>
            <div className="space-y-4">
              {VIRTUES.map((virtue) => {
                const avg = Math.round(profile![`avg_${virtue.id}` as keyof StoicProfile] as number)
                return (
                  <div key={virtue.id} className="flex items-center gap-4">
                    <img src={virtue.icon} alt={virtue.name} className="w-12 h-12" />
                    <span className="font-display w-28 text-sage-800">{virtue.name}</span>
                    <div className="flex-1 bg-sage-100 rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${avg}%`, backgroundColor: virtue.color }}
                      />
                    </div>
                    <span className="font-display font-bold w-10 text-right" style={{ color: virtue.color }}>{avg}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Practice Calendar */}
          {user && <PracticeCalendar userId={user.id} />}

          {/* Virtue Milestones */}
          {user && <MilestonesDisplay userId={user.id} />}

          {/* Recent scores */}
          <div className="bg-white/60 border border-sage-200 rounded-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-medium text-sage-800">Recent Actions</h2>
              <a href="/score" className="font-display text-sm text-sage-500 hover:text-sage-700 underline">Score another</a>
            </div>
            <div className="space-y-4">
              {scores.map((score) => {
                const scoreTier = getAlignmentTier(score.total_score)
                return (
                  <div key={score.id} className="border border-sage-200 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-body text-sage-800 leading-relaxed">{score.action_description}</p>
                        <p className="font-body text-xs text-sage-500 mt-1">
                          {new Date(score.created_at).toLocaleDateString('en-AU', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-display text-2xl font-bold" style={{ color: scoreTier.color }}>
                          {score.total_score}
                        </p>
                        <p className="font-display text-xs" style={{ color: scoreTier.color }}>
                          {scoreTier.label}
                        </p>
                      </div>
                    </div>
                    {score.reasoning && (
                      <div className="mt-3 border-t border-sage-100 pt-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <img src="/images/Zeus.PNG" alt="The Sage" className="w-6 h-6 object-contain rounded-full border border-amber-200 bg-amber-50/50" />
                          <span className="font-body text-xs text-amber-700 italic">ancient advice*</span>
                        </div>
                        <p className="font-body text-sm text-sage-600">
                          {score.reasoning}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <p className="font-body text-xs text-sage-400 mt-6 pt-4 border-t border-sage-100 italic">
              * ancient advice does not consider your legal or personal obligations.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
