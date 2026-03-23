'use client'

import { supabase } from './supabase'

export type EventType =
  | 'page_view'
  | 'score_action'
  | 'sign_in'
  | 'sign_up'
  | 'api_docs_view'
  | 'dashboard_view'
  | 'stoic_brain_fetch'
  | 'baseline_assessment'
  | 'baseline_completed'

interface TrackEventOptions {
  event_type: EventType
  metadata?: Record<string, unknown>
}

export async function trackEvent({ event_type, metadata }: TrackEventOptions) {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type,
        user_id: user?.id || null,
        user_email: user?.email || null,
        metadata: metadata || {},
      }),
    })
  } catch {
    // Silently fail — analytics should never block the user
  }
}
