'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { authFetch } from '@/lib/auth-fetch'
import type { User } from '@supabase/supabase-js'
import {
  STOA_SELF_DESCRIPTION,
  STOA_ETHIC,
  STOA_NEAR_EMPTY_FRAMING,
  STOA_NEAR_EMPTY_THRESHOLD,
  STOA_NOT_YET_OPEN,
} from '@/lib/stoa/stoa-copy'
import { STOA_SUGGESTED_TAGS } from '@/lib/stoa/stoa-tags'

/**
 * /stoa — The Stoa: the colonnade where practitioners make themselves visible
 * to one another (ST3; the fourteen adopted mentor rulings, constraint
 * numbers per the build plan §2).
 *
 * This page:
 *   - presents the space with the CANONICAL two-sentence self-description +
 *     the published ethic (#22/#30 — imported as values from stoa-copy.ts,
 *     never paraphrased)
 *   - browses in declaration-recency order SERVED VERBATIM (#8 — no client
 *     re-sort exists in this file; battery-pinned), with tag filter + text
 *     search as FILTERS (#9)
 *   - never gates browsing on declaring (#3) — anonymous visitors see public
 *     entries; signed-in practitioners see the community scope (#1/#2)
 *   - names the near-empty state honestly (#4)
 *   - lets the practitioner declare / tend / withdraw their ONE entry (#11)
 *     with per-entry visibility choice (#1), first-person form (#15 — their
 *     own words, by structure), suggested-never-required domain tags (#10)
 *   - always shows declaration dates (#12)
 *   - shows the passive shelf on the practitioner's OWN view only (#5 —
 *     declared-content matches, no notification, no call to action)
 *   - asks the gentle "is this still yours?" only on one's own long-aged
 *     entry (#24 — renew or leave it; nothing expires)
 *   - renders the honest dark state pre-activation (the routes 503 while
 *     SUBSTRATE_STOA_ENABLED is unset)
 *
 * NO engagement capture (#23): this page makes no analytics/tracking calls.
 * NO evaluative anything (#20): no rank, badge, score, or grade appears.
 */

interface StoaEntryView {
  id: string
  kind: 'human' | 'agent'
  display_name: string
  agent_id: string | null
  what_i_bring: string | null
  what_i_seek: string | null
  contact_channel: string | null
  visibility: 'community' | 'public'
  tags: string[]
  declared_at: string
  renewed_at: string | null
}

interface OwnEntry {
  id: string
  whatIBring: string | null
  whatISeek: string | null
  contactChannel: string | null
  visibility: 'community' | 'public'
  tags: string[]
  declaredAt: string
  renewedAt: string | null
  status: 'active' | 'withdrawn' | 'removed'
}

interface Staleness {
  stale: boolean
  days_since_tended: number
  question?: string
}

interface SupportResources {
  severity: 'mild'
  message: string
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function StoaPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [closed, setClosed] = useState(false)

  // Browse state
  const [entries, setEntries] = useState<StoaEntryView[]>([])
  const [scope, setScope] = useState<'public' | 'community'>('public')
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [listError, setListError] = useState(false)
  // Whether the CURRENT list is filtered — the near-empty framing (#4) must
  // describe the SPACE, not a narrowed search result (PR19 fold: a filtered
  // 2-hit view of a 40-entry colonnade must not read "nearly empty").
  const [listFiltered, setListFiltered] = useState(false)

  // Own-entry state
  const [ownEntry, setOwnEntry] = useState<OwnEntry | null>(null)
  const [shelf, setShelf] = useState<StoaEntryView[]>([])
  const [staleness, setStaleness] = useState<Staleness | null>(null)

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [bring, setBring] = useState('')
  const [seek, setSeek] = useState('')
  const [contact, setContact] = useState('')
  const [visibility, setVisibility] = useState<'community' | 'public'>('community')
  const [tags, setTags] = useState<string[]>([])
  const [freeTag, setFreeTag] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'redirect'; text: string } | null>(null)
  const [supportResources, setSupportResources] = useState<SupportResources | null>(null)

  const fetchList = useCallback(async (tag: string | null, q: string) => {
    try {
      const params = new URLSearchParams()
      if (tag) params.set('tag', tag)
      if (q.trim()) params.set('q', q.trim())
      const res = await authFetch(`/api/stoa/entries?${params.toString()}`)
      if (res.status === 503) {
        setClosed(true)
        return
      }
      if (res.ok) {
        const data = await res.json()
        // Rendered EXACTLY as served — declaration recency (#8). No sort here.
        setEntries(data.entries ?? [])
        setScope(data.scope ?? 'public')
        setListError(false)
      } else {
        // An honest error state — never an empty colonnade masquerading as
        // the truth (PR19 fold: silent swallow removed).
        setListError(true)
      }
    } catch {
      setListError(true)
    }
  }, [])

  const fetchOwn = useCallback(async () => {
    const res = await authFetch('/api/mentor/stoa')
    if (res.status === 503) {
      setClosed(true)
      return
    }
    if (res.ok) {
      const data = await res.json()
      setOwnEntry(data.entry ?? null)
      setShelf(data.shelf ?? [])
      setStaleness(data.staleness ?? null)
    }
  }, [])

  useEffect(() => {
    async function load() {
      // Browsing never requires signing in (#3) — the user read is a
      // presence check, not a gate.
      const { data: { user: u } } = await supabase.auth.getUser()
      setUser(u)
      await fetchList(null, '')
      if (u) await fetchOwn()
      setLoading(false)
    }
    load()
  }, [fetchList, fetchOwn])

  function startDeclare() {
    setBring(ownEntry?.whatIBring ?? '')
    setSeek(ownEntry?.whatISeek ?? '')
    setContact(ownEntry?.contactChannel ?? '')
    setVisibility(ownEntry?.visibility ?? 'community')
    setTags(ownEntry?.tags ?? [])
    setMessage(null)
    setSupportResources(null)
    setShowForm(true)
  }

  function toggleTag(t: string) {
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : prev.length < 12 ? [...prev, t] : prev))
  }

  function addFreeTag() {
    const t = freeTag.trim()
    if (t && !tags.includes(t) && tags.length < 12 && t.length <= 40) {
      setTags((prev) => [...prev, t])
    }
    setFreeTag('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setMessage(null)
    setSupportResources(null)
    try {
      const body = JSON.stringify({
        what_i_bring: bring.trim() || null,
        what_i_seek: seek.trim() || null,
        contact_channel: contact.trim() || null,
        visibility,
        tags,
      })
      const editing = ownEntry && ownEntry.status === 'active'
      const res = editing
        ? await authFetch('/api/mentor/stoa', { method: 'PATCH', body })
        : await authFetch('/api/mentor/stoa', { method: 'POST', body })
      const data = await res.json()

      if (res.ok && data.distress_detected) {
        // The R20a crisis redirect — the declaration was NOT saved.
        setMessage({ type: 'redirect', text: data.redirect_message })
      } else if (res.ok && data.success) {
        setMessage({ type: 'success', text: editing ? 'Your entry has been tended.' : 'Your presence is declared.' })
        if (data.support_resources) setSupportResources(data.support_resources)
        setShowForm(false)
        await Promise.all([fetchOwn(), fetchList(tagFilter, query)])
      } else {
        setMessage({ type: 'error', text: data.error ?? 'Something went wrong.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleWithdraw() {
    if (submitting) return
    setSubmitting(true)
    setMessage(null)
    try {
      const res = await authFetch('/api/mentor/stoa', { method: 'DELETE' })
      const data = await res.json()
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: 'Your entry is withdrawn. Re-declare whenever you choose.' })
        setShowForm(false)
        await Promise.all([fetchOwn(), fetchList(tagFilter, query)])
      } else {
        setMessage({ type: 'error', text: data.error ?? 'Something went wrong.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRenew() {
    if (submitting) return
    setSubmitting(true)
    setMessage(null)
    try {
      // An empty patch is the Q9 renewal — "is this still yours?" answered yes.
      const res = await authFetch('/api/mentor/stoa', { method: 'PATCH', body: JSON.stringify({}) })
      const data = await res.json()
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: 'Renewed. Your declaration stands as it is.' })
        await fetchOwn()
      } else {
        setMessage({ type: 'error', text: data.error ?? 'Something went wrong.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  async function applyFilters(tag: string | null, q: string) {
    setTagFilter(tag)
    setListFiltered(Boolean(tag) || q.trim().length > 0)
    await fetchList(tag, q)
  }

  // ==========================================================================

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div role="status" className="text-center text-sage-600 font-body">Loading…</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* The space's own presentation — canonical copy (#22/#30) */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-sage-900 mb-3">The Stoa</h1>
        <p className="font-body text-sage-700 leading-relaxed">{STOA_SELF_DESCRIPTION}</p>
        <div className="mt-4 border-l-2 border-sage-200 pl-4">
          <p className="font-body text-sm text-sage-600 leading-relaxed">{STOA_ETHIC}</p>
        </div>
      </div>

      {closed ? (
        <div className="bg-white border border-sage-200 rounded-lg p-6">
          <p className="font-body text-sage-700">{STOA_NOT_YET_OPEN}</p>
        </div>
      ) : (
        <>
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg text-sm font-body whitespace-pre-line ${
                message.type === 'success'
                  ? 'bg-sage-50 border border-sage-200 text-sage-800'
                  : message.type === 'redirect'
                    ? 'bg-amber-50 border border-amber-200 text-amber-900'
                    : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}
          {supportResources && (
            <div className="mb-6 p-4 rounded-lg text-sm font-body whitespace-pre-line bg-amber-50 border border-amber-200 text-amber-900">
              {supportResources.message}
            </div>
          )}

          {/* Own-entry panel — signed-in practitioners only */}
          {user && (
            <div className="bg-white border border-sage-200 rounded-lg p-6 mb-8">
              <h2 className="font-display text-lg font-medium text-sage-800 mb-2">Your presence</h2>

              {ownEntry && ownEntry.status === 'active' && !showForm && (
                <div>
                  <p className="font-body text-xs text-sage-500 mb-3">
                    Declared {formatDate(ownEntry.declaredAt)}
                    {ownEntry.renewedAt ? ` · Tended ${formatDate(ownEntry.renewedAt)}` : ''}
                    {' · '}
                    {ownEntry.visibility === 'community' ? 'Visible to signed-in practitioners' : 'Public'}
                  </p>
                  {ownEntry.whatIBring && (
                    <div className="mb-2">
                      <div className="font-display text-sm font-medium text-sage-600">What I bring</div>
                      <p className="font-body text-sm text-sage-800 whitespace-pre-line">{ownEntry.whatIBring}</p>
                    </div>
                  )}
                  {ownEntry.whatISeek && (
                    <div className="mb-2">
                      <div className="font-display text-sm font-medium text-sage-600">What I seek</div>
                      <p className="font-body text-sm text-sage-800 whitespace-pre-line">{ownEntry.whatISeek}</p>
                    </div>
                  )}
                  {ownEntry.contactChannel && (
                    <div className="mb-2">
                      <div className="font-display text-sm font-medium text-sage-600">How to reach me</div>
                      <p className="font-body text-sm text-sage-800 whitespace-pre-line">{ownEntry.contactChannel}</p>
                    </div>
                  )}
                  {ownEntry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {ownEntry.tags.map((t) => (
                        <span key={t} className="font-body text-xs bg-sage-50 border border-sage-200 text-sage-600 rounded-full px-2 py-0.5">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* The gentle staleness question (#24) — own view only */}
                  {staleness?.stale && staleness.question && (
                    <div className="mt-4 p-3 rounded-lg bg-sage-50 border border-sage-200">
                      <p className="font-body text-sm text-sage-700">{staleness.question}</p>
                      <button
                        onClick={handleRenew}
                        disabled={submitting}
                        className="mt-2 font-body text-sm text-sage-700 underline hover:text-sage-900 disabled:opacity-50"
                      >
                        Yes — this is still mine
                      </button>
                    </div>
                  )}

                  <div className="mt-4 flex gap-4">
                    <button onClick={startDeclare} className="font-body text-sm text-sage-700 underline hover:text-sage-900">
                      Edit
                    </button>
                    <button
                      onClick={handleWithdraw}
                      disabled={submitting}
                      className="font-body text-sm text-sage-500 underline hover:text-sage-700 disabled:opacity-50"
                    >
                      Withdraw
                    </button>
                  </div>

                  {/* The passive shelf (#5) — declared-content matches, own view
                      only, no notification, no call to action */}
                  {shelf.length > 0 && (
                    <div className="mt-6 border-t border-sage-100 pt-4">
                      <div className="font-display text-sm font-medium text-sage-600 mb-1">
                        Relevant to what you declared
                      </div>
                      <p className="font-body text-xs text-sage-500 mb-3">
                        Drawn only from your own declaration&apos;s words and tags. No one is told they appear here.
                      </p>
                      <div className="space-y-3">
                        {shelf.map((e) => (
                          <EntryCard key={e.id} entry={e} compact />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {ownEntry && ownEntry.status === 'withdrawn' && !showForm && (
                <div>
                  <p className="font-body text-sm text-sage-600 mb-3">
                    Your entry is withdrawn — it is not visible to anyone. Re-declare whenever you choose.
                  </p>
                  <button onClick={startDeclare} className="font-body text-sm text-sage-700 underline hover:text-sage-900">
                    Re-declare your presence
                  </button>
                </div>
              )}

              {ownEntry && ownEntry.status === 'removed' && !showForm && (
                <p className="font-body text-sm text-sage-600">
                  Your previous entry was removed from the colonnade. You may declare a new one.
                </p>
              )}

              {!ownEntry && !showForm && (
                <div>
                  <p className="font-body text-sm text-sage-600 mb-3">
                    You have no entry in the colonnade. Declaring is voluntary — browsing never requires it.
                  </p>
                  <button onClick={startDeclare} className="font-body text-sm text-sage-700 underline hover:text-sage-900">
                    Declare your presence
                  </button>
                </div>
              )}

              {showForm && (
                <form onSubmit={handleSubmit} className="mt-2">
                  <p className="font-body text-xs text-sage-500 mb-4">
                    In your own words. Every field is voluntary; the platform verifies nothing.
                  </p>
                  <div className="mb-4">
                    <label htmlFor="stoa-bring" className="font-display text-sm font-medium text-sage-600 block mb-1">
                      What I bring
                    </label>
                    <textarea
                      id="stoa-bring"
                      value={bring}
                      onChange={(e) => setBring(e.target.value)}
                      rows={3}
                      maxLength={2000}
                      placeholder="What you are working on; what you offer."
                      className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="stoa-seek" className="font-display text-sm font-medium text-sage-600 block mb-1">
                      What I seek
                    </label>
                    <textarea
                      id="stoa-seek"
                      value={seek}
                      onChange={(e) => setSeek(e.target.value)}
                      rows={3}
                      maxLength={2000}
                      placeholder="What you are looking for."
                      className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="stoa-contact" className="font-display text-sm font-medium text-sage-600 block mb-1">
                      How to reach me
                    </label>
                    <p className="font-body text-xs text-sage-500 mb-1">
                      Any channel you choose to extend — it carries whatever further identity you choose.
                    </p>
                    <input
                      id="stoa-contact"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      maxLength={2000}
                      placeholder="e.g. an email, a handle, a form"
                      className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300"
                    />
                  </div>
                  <div className="mb-4">
                    <div className="font-display text-sm font-medium text-sage-600 mb-1">Who may see this</div>
                    <div className="flex gap-4">
                      <label className="font-body text-sm text-sage-700 flex items-center gap-1">
                        <input
                          type="radio"
                          name="stoa-visibility"
                          checked={visibility === 'community'}
                          onChange={() => setVisibility('community')}
                        />
                        Signed-in practitioners
                      </label>
                      <label className="font-body text-sm text-sage-700 flex items-center gap-1">
                        <input
                          type="radio"
                          name="stoa-visibility"
                          checked={visibility === 'public'}
                          onChange={() => setVisibility('public')}
                        />
                        Public
                      </label>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="font-display text-sm font-medium text-sage-600 mb-1">
                      Domain tags <span className="font-body text-xs text-sage-500">(suggested, never required)</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {STOA_SUGGESTED_TAGS.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => toggleTag(t)}
                          className={`font-body text-xs rounded-full px-2 py-0.5 border ${
                            tags.includes(t)
                              ? 'bg-sage-600 border-sage-600 text-white'
                              : 'bg-sage-50 border-sage-200 text-sage-600 hover:border-sage-400'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={freeTag}
                        onChange={(e) => setFreeTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addFreeTag()
                          }
                        }}
                        maxLength={40}
                        placeholder="Add your own tag"
                        className="border border-sage-200 rounded-lg p-2 font-body text-xs text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300"
                      />
                      <button type="button" onClick={addFreeTag} className="font-body text-xs text-sage-600 underline">
                        Add
                      </button>
                    </div>
                    {tags.filter((t) => !STOA_SUGGESTED_TAGS.includes(t)).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {tags
                          .filter((t) => !STOA_SUGGESTED_TAGS.includes(t))
                          .map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => toggleTag(t)}
                              className="font-body text-xs rounded-full px-2 py-0.5 border bg-sage-600 border-sage-600 text-white"
                            >
                              {t} ×
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-sage-700 text-white font-body text-sm rounded-lg px-4 py-2 hover:bg-sage-800 disabled:opacity-50"
                    >
                      {ownEntry && ownEntry.status === 'active' ? 'Save' : 'Declare'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="font-body text-sm text-sage-500 underline hover:text-sage-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {!user && (
            <div className="bg-white border border-sage-200 rounded-lg p-4 mb-8">
              <p className="font-body text-sm text-sage-600">
                You are seeing public entries. Community-scoped entries are visible to signed-in
                practitioners, who may also declare their own presence.{' '}
                <a href="/auth" className="underline hover:text-sage-800">Sign in</a>
              </p>
            </div>
          )}

          {/* Browse — consultation of the resource (#9) */}
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  applyFilters(tagFilter, query)
                }
              }}
              placeholder="Search declarations"
              className="border border-sage-200 rounded-lg p-2 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300"
            />
            <button
              onClick={() => applyFilters(tagFilter, query)}
              className="font-body text-sm text-sage-600 underline hover:text-sage-800"
            >
              Search
            </button>
            {(query || tagFilter) && (
              <button
                onClick={() => {
                  setQuery('')
                  applyFilters(null, '')
                }}
                className="font-body text-sm text-sage-500 underline hover:text-sage-700"
              >
                Clear
              </button>
            )}
          </div>
          <div className="mb-6 flex flex-wrap gap-1">
            {STOA_SUGGESTED_TAGS.map((t) => (
              <button
                key={t}
                onClick={() => applyFilters(tagFilter === t ? null : t, query)}
                className={`font-body text-xs rounded-full px-2 py-0.5 border ${
                  tagFilter === t
                    ? 'bg-sage-600 border-sage-600 text-white'
                    : 'bg-sage-50 border-sage-200 text-sage-600 hover:border-sage-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <p className="font-body text-xs text-sage-400 mb-3">
            {scope === 'community'
              ? 'Showing community and public declarations, newest declaration first.'
              : 'Showing public declarations, newest declaration first.'}
          </p>

          {listError && (
            <p className="font-body text-sm text-red-700 mb-4">
              The colonnade could not be loaded just now. Please try again.
            </p>
          )}

          {!listError && !listFiltered && entries.length < STOA_NEAR_EMPTY_THRESHOLD && (
            <p className="font-body text-sm text-sage-500 italic mb-4">{STOA_NEAR_EMPTY_FRAMING}</p>
          )}
          {!listError && listFiltered && entries.length === 0 && (
            <p className="font-body text-sm text-sage-500 mb-4">No declarations match this search.</p>
          )}

          <div className="space-y-4">
            {entries.map((e) => (
              <EntryCard key={e.id} entry={e} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/** One declaration, rendered in the declarer's own words (#15 — the form does
 *  the framing work; no platform assessment, no disclaimer noise). Dates
 *  always shown (#12). */
function EntryCard({ entry, compact }: { entry: StoaEntryView; compact?: boolean }) {
  return (
    <div className={`bg-white border border-sage-200 rounded-lg ${compact ? 'p-4' : 'p-5'}`}>
      <div className="flex flex-wrap items-baseline gap-2 mb-1">
        <span className="font-display text-sm font-medium text-sage-800">{entry.display_name}</span>
        {entry.kind === 'agent' && (
          <span className="font-body text-xs text-sage-500 border border-sage-200 rounded-full px-2 py-0.5">agent</span>
        )}
        <span className="font-body text-xs text-sage-400">
          Declared {formatDate(entry.declared_at)}
          {entry.renewed_at ? ` · Tended ${formatDate(entry.renewed_at)}` : ''}
        </span>
      </div>
      {entry.what_i_bring && (
        <div className="mb-2">
          <div className="font-display text-xs font-medium text-sage-500">What I bring</div>
          <p className="font-body text-sm text-sage-800 whitespace-pre-line">{entry.what_i_bring}</p>
        </div>
      )}
      {entry.what_i_seek && (
        <div className="mb-2">
          <div className="font-display text-xs font-medium text-sage-500">What I seek</div>
          <p className="font-body text-sm text-sage-800 whitespace-pre-line">{entry.what_i_seek}</p>
        </div>
      )}
      {entry.contact_channel && (
        <div className="mb-2">
          <div className="font-display text-xs font-medium text-sage-500">How to reach me</div>
          <p className="font-body text-sm text-sage-800 whitespace-pre-line">{entry.contact_channel}</p>
        </div>
      )}
      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {entry.tags.map((t) => (
            <span key={t} className="font-body text-xs bg-sage-50 border border-sage-200 text-sage-600 rounded-full px-2 py-0.5">
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
