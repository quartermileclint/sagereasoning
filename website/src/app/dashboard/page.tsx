'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { trackEvent } from '@/lib/analytics'
import { VIRTUES, getAlignmentTier } from '@/lib/stoic-brain'
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

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<StoicProfile | null>(null)
  const [scores, setScores] = useState<ActionScore[]>([])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/auth'
        return
      }
      setUser(user)

      const [profileRes, scoresRes] = await Promise.all([
        supabase.from('user_stoic_profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('action_scores').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      ])

      if (profileRes.data) setProfile(profileRes.data)
      if (scoresRes.data) setScores(scoresRes.data)
      setLoading(false)

      // Track dashboard view
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
        <p className="font-body text-sage-600 text-lg">Loading your Stoic profile...</p>
      </div>
    )
  }

  const tier = profile ? getAlignmentTier(profile.avg_total) : null

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

      {!profile || scores.length === 0 ? (
        /* Empty state */
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
          {/* Overview cards */}
          <div className="grid md:grid-cols-4 gap-4">
            {/* Total score */}
            <div className="bg-white/60 border border-sage-200 rounded-lg p-6 text-center">
              <p className="font-body text-sm text-sage-500 mb-2">Average Score</p>
              <p className="font-display text-4xl font-bold" style={{ color: tier?.color }}>
                {Math.round(profile!.avg_total)}
              </p>
              <p className="font-display text-sm font-medium mt-1" style={{ color: tier?.color }}>
                {tier?.label}
              </p>
            </div>

            {/* Actions scored */}
            <div className="bg-white/60 border border-sage-200 rounded-lg p-6 text-center">
              <p className="font-body text-sm text-sage-500 mb-2">Actions Scored</p>
              <p className="font-display text-4xl font-bold text-sage-800">{profile!.actions_scored}</p>
            </div>

            {/* Strongest virtue */}
            <div className="bg-white/60 border border-sage-200 rounded-lg p-6 text-center">
              <p className="font-body text-sm text-sage-500 mb-2">Strongest Virtue</p>
              <p className="font-display text-xl font-bold text-sage-800 capitalize">{profile!.strongest_virtue}</p>
              {profile!.strongest_virtue && (
                <img
                  src={VIRTUES.find(v => v.id === profile!.strongest_virtue)?.icon}
                  alt={profile!.strongest_virtue}
                  className="w-10 h-10 mx-auto mt-2"
                />
              )}
            </div>

            {/* Growth area */}
            <div className="bg-white/60 border border-sage-200 rounded-lg p-6 text-center">
              <p className="font-body text-sm text-sage-500 mb-2">Growth Area</p>
              <p className="font-display text-xl font-bold text-sage-800 capitalize">{profile!.growth_virtue}</p>
              <p className="font-body text-xs text-sage-500 mt-2 capitalize">{profile!.trend}</p>
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
                    <img src={virtue.icon} alt={virtue.name} className="w-8 h-8" />
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
                      <p className="font-body text-sm text-sage-600 mt-3 border-t border-sage-100 pt-3">
                        {score.reasoning}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
