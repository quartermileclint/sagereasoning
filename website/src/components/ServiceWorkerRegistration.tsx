'use client'

import { useEffect } from 'react'

/**
 * Registers the journal service worker for offline support.
 * Phase 0.6 — Structural placeholder for Apple App Intents readiness.
 *
 * The service worker is scoped to /journal and provides:
 * - Offline access to journal content
 * - Queued entry submission when offline
 * - Background sync when back online
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw-journal.js', { scope: '/journal' })
        .then((registration) => {
          console.log('[Sage] Journal service worker registered:', registration.scope)
        })
        .catch((error) => {
          console.warn('[Sage] Journal service worker registration failed:', error)
        })

      // Sync offline entries when coming back online
      const handleOnline = () => {
        if (navigator.serviceWorker.controller) {
          const messageChannel = new MessageChannel()
          messageChannel.port1.onmessage = (event) => {
            if (event.data?.synced?.length > 0) {
              console.log('[Sage] Synced offline journal entries:', event.data.synced)
            }
          }
          navigator.serviceWorker.controller.postMessage(
            { type: 'SYNC_OFFLINE_ENTRIES' },
            [messageChannel.port2]
          )
        }
      }

      window.addEventListener('online', handleOnline)
      return () => window.removeEventListener('online', handleOnline)
    }
  }, [])

  return null
}
