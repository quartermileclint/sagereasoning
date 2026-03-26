'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface MetricsSummary {
  total_registered_users: number
  total_actions_scored: number
  all_time: Record<string, number>
  last_7_days: Record<string, number>
  today: Record<string, number>
}

interface AnalyticsEvent {
  id: string
  event_type: string
  user_id: string | null
  user_email: string | null
  ip_address: string
  user_agent: string
  metadata: Record<string, unknown>
  created_at: string
}

interface MetricsData {
  summary: MetricsSummary
  recent_events: AnalyticsEvent[]
}

const EVENT_LABELS: Record<string, string> = {
  score_action: '1. Score Action',
  sign_in: '2. Sign In',
  sign_up: '2. Sign Up',
  dashboard_view: '3. Dashboard View',
  api_docs_view: '4. API Docs View',
  stoic_brain_fetch: '5. AI Agent Fetch',
  page_view: 'Page View',
}

const METRIC_ROWS = [
  { key: 'score_action', label: 'Humans scoring actions', icon: '⚖️' },
  { key: 'sign_in', label: 'Human sign-ins', icon: '🔑' },
  { key: 'sign_up', label: 'New registrations', icon: '📝' },
  { key: 'dashboard_view', label: 'Dashboard views', icon: '📊' },
  { key: 'api_docs_view', label: 'API docs views (developers)', icon: '🔧' },
  { key: 'stoic_brain_fetch', label: 'AI agent stoic-brain fetches', icon: '🤖' },
]

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [error, setError] = useState('')
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchMetrics = useCallback(async (_userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch('/api/admin/metrics', {
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
      })
      if (!response.ok) {
        throw new Error('Unauthorized or fetch failed')
      }
      const data = await response.json()
      setMetrics(data)
      setLastRefresh(new Date())
    } catch {
      setError('Failed to load metrics. You may not have admin access.')
    }
  }, [])

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/auth'
        return
      }
      setUser(user)
      setAuthorized(true)
      setLoading(false)
      fetchMetrics(user.id)
    }
    checkAuth()
  }, [fetchMetrics])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!user) return
    const interval = setInterval(() => fetchMetrics(user.id), 30000)
    return () => clearInterval(interval)
  }, [user, fetchMetrics])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <p className="font-body text-sage-600 text-lg">Checking access...</p>
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="font-display text-2xl text-sage-800 mb-3">Access Denied</h1>
        <p className="font-body text-sage-600">This page is restricted to administrators.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="font-display text-2xl text-sage-800 mb-3">Admin Metrics</h1>
        <p className="font-body text-red-600">{error}</p>
        <p className="font-body text-sage-500 mt-2 text-sm">
          If this is your first time, you need to run the database setup first.
          See the setup instructions below.
        </p>
        <div className="mt-8 bg-sage-800 text-sage-100 rounded-lg p-6 text-left font-mono text-xs max-w-2xl mx-auto overflow-x-auto">
          <p className="text-sage-400 mb-2">-- Run this SQL in Supabase SQL Editor:</p>
          <p>CREATE TABLE IF NOT EXISTS analytics_events (</p>
          <p>  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,</p>
          <p>  event_type TEXT NOT NULL,</p>
          <p>  user_id UUID REFERENCES auth.users(id),</p>
          <p>  user_email TEXT,</p>
          <p>  ip_address TEXT,</p>
          <p>  user_agent TEXT,</p>
          <p>  metadata JSONB DEFAULT &apos;{'{}'}&apos;,</p>
          <p>  created_at TIMESTAMPTZ DEFAULT now()</p>
          <p>);</p>
          <p className="mt-2">CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);</p>
          <p>CREATE INDEX idx_analytics_created_at ON analytics_events(created_at DESC);</p>
          <p className="mt-4 text-sage-400">-- Then add ADMIN_USER_ID and SUPABASE_SERVICE_ROLE_KEY</p>
          <p className="text-sage-400">-- to Vercel environment variables (see README).</p>
        </div>
      </div>
    )
  }

  const summary = metrics?.summary
  const recentEvents = metrics?.recent_events || []

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display text-3xl font-medium text-sage-800">Admin Metrics</h1>
          <p className="font-body text-sage-500 text-sm mt-1">
            {lastRefresh ? `Last updated: ${lastRefresh.toLocaleTimeString()}` : 'Loading...'} · Auto-refreshes every 30s
          </p>
        </div>
        <button
          onClick={() => user && fetchMetrics(user.id)}
          className="px-4 py-2 bg-sage-400 text-white font-display text-sm rounded hover:bg-sage-500 transition-colors"
        >
          Refresh Now
        </button>
      </div>

      {/* Top-level KPIs */}
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        <div className="bg-white/60 border border-sage-200 rounded-lg p-6 text-center">
          <p className="font-body text-sm text-sage-500 mb-1">Registered Users</p>
          <p className="font-display text-4xl font-bold text-sage-800">{summary?.total_registered_users || 0}</p>
        </div>
        <div className="bg-white/60 border border-sage-200 rounded-lg p-6 text-center">
          <p className="font-body text-sm text-sage-500 mb-1">Actions Scored (All Time)</p>
          <p className="font-display text-4xl font-bold text-sage-800">{summary?.total_actions_scored || 0}</p>
        </div>
        <div className="bg-white/60 border border-sage-200 rounded-lg p-6 text-center">
          <p className="font-body text-sm text-sage-500 mb-1">AI Agent Fetches (All Time)</p>
          <p className="font-display text-4xl font-bold text-sage-800">{summary?.all_time?.stoic_brain_fetch || 0}</p>
        </div>
      </div>

      {/* Dynamic metrics table */}
      <div className="bg-white/60 border border-sage-200 rounded-lg overflow-hidden mb-10">
        <div className="p-6 border-b border-sage-200">
          <h2 className="font-display text-xl font-medium text-sage-800">Tracking Metrics</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-sage-200 bg-sage-50/50">
              <th className="text-left px-6 py-3 font-display text-sm font-medium text-sage-600">Metric</th>
              <th className="text-right px-6 py-3 font-display text-sm font-medium text-sage-600">Today</th>
              <th className="text-right px-6 py-3 font-display text-sm font-medium text-sage-600">Last 7 Days</th>
              <th className="text-right px-6 py-3 font-display text-sm font-medium text-sage-600">All Time</th>
            </tr>
          </thead>
          <tbody>
            {METRIC_ROWS.map((row) => (
              <tr key={row.key} className="border-b border-sage-100 hover:bg-sage-50/30 transition-colors">
                <td className="px-6 py-4 font-body text-sage-800">
                  <span className="mr-2">{row.icon}</span>
                  {row.label}
                </td>
                <td className="px-6 py-4 text-right font-display font-bold text-sage-800">
                  {summary?.today?.[row.key] || 0}
                </td>
                <td className="px-6 py-4 text-right font-display font-bold text-sage-800">
                  {summary?.last_7_days?.[row.key] || 0}
                </td>
                <td className="px-6 py-4 text-right font-display font-bold text-sage-800">
                  {summary?.all_time?.[row.key] || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent activity feed */}
      <div className="bg-white/60 border border-sage-200 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-sage-200">
          <h2 className="font-display text-xl font-medium text-sage-800">Recent Activity (Last 50 Events)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-sage-200 bg-sage-50/50">
                <th className="text-left px-4 py-3 font-display text-xs font-medium text-sage-600">Time</th>
                <th className="text-left px-4 py-3 font-display text-xs font-medium text-sage-600">Event</th>
                <th className="text-left px-4 py-3 font-display text-xs font-medium text-sage-600">User</th>
                <th className="text-left px-4 py-3 font-display text-xs font-medium text-sage-600">Details</th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center font-body text-sage-500">
                    No events recorded yet. Events will appear here as users interact with the site.
                  </td>
                </tr>
              ) : (
                recentEvents.map((event) => (
                  <tr key={event.id} className="border-b border-sage-100 hover:bg-sage-50/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-sage-600 whitespace-nowrap">
                      {new Date(event.created_at).toLocaleString('en-AU', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-display font-medium ${
                        event.event_type === 'stoic_brain_fetch' ? 'bg-blue-100 text-blue-800' :
                        event.event_type === 'score_action' ? 'bg-sage-200 text-sage-800' :
                        event.event_type === 'sign_up' ? 'bg-green-100 text-green-800' :
                        event.event_type === 'sign_in' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-sage-100 text-sage-700'
                      }`}>
                        {EVENT_LABELS[event.event_type] || event.event_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-sage-700 max-w-[200px] truncate">
                      {event.user_email || event.ip_address || 'anonymous'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-sage-500 max-w-[200px] truncate">
                      {event.user_agent?.substring(0, 60)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
