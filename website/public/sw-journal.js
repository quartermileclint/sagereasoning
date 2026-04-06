/**
 * SageReasoning — Journal Service Worker (Phase 0.6)
 *
 * Provides offline support for the 55-day Stoic journal.
 * Caches journal content and allows users to compose entries
 * without a network connection. Entries sync when online.
 *
 * This service worker is SCOPED to journal-related routes only.
 * It does not interfere with API calls, auth flows, or other pages.
 *
 * Future native app benefit: The cached data model (day, phase, entry text,
 * timestamp) is the same model that backs SwiftData in the native iOS app.
 * Users who start on the web and move to native have their data ready.
 *
 * Registration: Add to your layout.tsx or _app.tsx:
 *
 *   if ('serviceWorker' in navigator) {
 *     navigator.serviceWorker.register('/sw-journal.js', {
 *       scope: '/journal'
 *     })
 *   }
 */

const CACHE_NAME = 'sage-journal-v1'
const JOURNAL_CONTENT_URL = '/journal'
const OFFLINE_QUEUE_KEY = 'sage-journal-offline-queue'

// ============================================================
// Pages and assets to cache for offline journal use
// ============================================================

const JOURNAL_URLS_TO_CACHE = [
  '/journal',
  // Static assets needed for the journal page will be added
  // dynamically via the fetch handler below
]

// ============================================================
// Install — Pre-cache journal shell
// ============================================================

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW Journal] Pre-caching journal shell')
      return cache.addAll(JOURNAL_URLS_TO_CACHE)
    })
  )
  // Activate immediately without waiting for existing clients to close
  self.skipWaiting()
})

// ============================================================
// Activate — Clean up old caches
// ============================================================

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('sage-journal-') && name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW Journal] Deleting old cache:', name)
            return caches.delete(name)
          })
      )
    })
  )
  // Take control of all open clients immediately
  self.clients.claim()
})

// ============================================================
// Fetch — Cache-first for journal pages, network-first for API
// ============================================================

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Only handle journal-related requests
  if (!url.pathname.startsWith('/journal')) {
    return
  }

  // API calls: network-first, fall back to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithCache(event.request))
    return
  }

  // Journal pages and assets: cache-first, fall back to network
  event.respondWith(cacheFirstWithNetwork(event.request))
})

// ============================================================
// Strategies
// ============================================================

/**
 * Cache-first: serve from cache, update cache from network in background.
 * Used for journal page HTML and static assets.
 */
async function cacheFirstWithNetwork(request) {
  const cache = await caches.open(CACHE_NAME)
  const cachedResponse = await cache.match(request)

  if (cachedResponse) {
    // Serve cached version immediately, update in background
    const networkFetch = fetch(request)
      .then((response) => {
        if (response.ok) {
          cache.put(request, response.clone())
        }
        return response
      })
      .catch(() => {
        // Network failed, cached version already served
      })

    // Don't await the background fetch
    return cachedResponse
  }

  // Nothing in cache — must go to network
  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    // Both cache and network failed
    return new Response(
      JSON.stringify({
        error: 'offline',
        message:
          'You are offline and this page is not yet cached. Connect to the internet and visit the journal page once to enable offline access.',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

/**
 * Network-first: try network, fall back to cache.
 * Used for API calls (journal entry submissions).
 */
async function networkFirstWithCache(request) {
  try {
    const response = await fetch(request)
    // Cache successful API responses (GET only)
    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    // Network failed — check cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // For POST requests that fail offline: queue for later sync
    if (request.method === 'POST') {
      await queueOfflineEntry(request)
      return new Response(
        JSON.stringify({
          queued: true,
          message:
            'Your journal entry has been saved locally and will sync when you reconnect.',
        }),
        {
          status: 202,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({
        error: 'offline',
        message: 'This data is not available offline.',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

// ============================================================
// Offline queue — Store journal entries for later sync
// ============================================================

/**
 * Queue a failed POST request for sync when back online.
 * Uses IndexedDB-like storage via the Cache API.
 */
async function queueOfflineEntry(request) {
  try {
    const body = await request.clone().text()
    const queuedEntry = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: body,
      queuedAt: new Date().toISOString(),
    }

    // Store in a separate cache as a JSON blob
    const cache = await caches.open(CACHE_NAME + '-queue')
    const queueKey = `queued-${Date.now()}`
    await cache.put(
      new Request(queueKey),
      new Response(JSON.stringify(queuedEntry), {
        headers: { 'Content-Type': 'application/json' },
      })
    )
    console.log('[SW Journal] Queued offline entry:', queueKey)
  } catch (error) {
    console.error('[SW Journal] Failed to queue offline entry:', error)
  }
}

// ============================================================
// Sync — Replay queued entries when back online
// ============================================================

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_OFFLINE_ENTRIES') {
    syncOfflineEntries().then((results) => {
      event.ports[0].postMessage({ synced: results })
    })
  }
})

/**
 * Replay all queued offline journal entries.
 * Call this from the main app when navigator.onLine becomes true.
 *
 * From your app code:
 *   navigator.serviceWorker.controller.postMessage({ type: 'SYNC_OFFLINE_ENTRIES' })
 */
async function syncOfflineEntries() {
  const queueCache = await caches.open(CACHE_NAME + '-queue')
  const keys = await queueCache.keys()
  const results = []

  for (const key of keys) {
    try {
      const response = await queueCache.match(key)
      const entry = await response.json()

      // Replay the original request
      const replayResponse = await fetch(entry.url, {
        method: entry.method,
        headers: entry.headers,
        body: entry.body,
      })

      if (replayResponse.ok) {
        await queueCache.delete(key)
        results.push({ key: key.url, status: 'synced' })
        console.log('[SW Journal] Synced:', key.url)
      } else {
        results.push({ key: key.url, status: 'failed', code: replayResponse.status })
        console.warn('[SW Journal] Sync failed:', key.url, replayResponse.status)
      }
    } catch (error) {
      results.push({ key: key.url, status: 'error', message: error.message })
      console.error('[SW Journal] Sync error:', key.url, error)
    }
  }

  return results
}
