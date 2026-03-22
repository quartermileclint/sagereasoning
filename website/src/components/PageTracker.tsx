'use client'

import { useEffect } from 'react'
import { trackEvent, type EventType } from '@/lib/analytics'

export default function PageTracker({ eventType }: { eventType: EventType }) {
  useEffect(() => {
    trackEvent({ event_type: eventType })
  }, [eventType])

  return null // Invisible — just fires the tracking event
}
