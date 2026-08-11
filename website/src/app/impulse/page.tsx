'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { authFetch } from '@/lib/auth-fetch'
import type { User } from '@supabase/supabase-js'
import {
  PASSION_SUB_SPECIES,
  ROOT_PASSION_LABELS,
  EXAMINATION_PATHWAYS,
  RECIPROCITY_QUESTIONS,
  pathwayForTrait,
  traitName,
  type ExaminationMode,
} from '@/app/api/mentor/impulse/vocabulary'

/**
 * Impulse — the primal-impulse examination tool (mentor synthesis Heading 7).
 *
 * The practitioner names which primal impulse is most active for them right
 * now, and the committed examination runs from there: the specific impression,
 * the false belief under it, whether the impulse exceeded reason, which
 * passion sub-species was operative, and the correct judgement that would
 * replace the false one. The reciprocity trait runs a different, ruled
 * question set instead — it is not a passion sub-species, and is not forced
 * into that shape.
 *
 * THE REFRAME THIS PAGE MUST MAKE VISIBLE (the mentor's own words): a
 * practitioner who notices competitive anxiety, territorial defensiveness
 * about their work, or status-seeking is NOT FAILING — "they are generating
 * examination material." The page says this at the point of use, not only in
 * a framing document, because the exercise asks people to write down things
 * they are inclined to hide.
 *
 * The relationship to the Passion Log is stated in PROSE and is deliberately
 * NOT a code coupling (mentor ruling B2 — passion_events feeds a live,
 * mentor-vetted suggestion surface and is not touched by this tool).
 *
 * Human-only. It POSTs to /api/mentor/impulse; it never touches /api/reason,
 * the signed assessment, or the substrate engine. The passion vocabulary is
 * imported from this tool's own local module, never from the engine's corpus.
 */

type ImpulseExceeded = 'yes' | 'no' | 'uncertain'
type CooperationGround = 'rational_being' | 'expected_return' | 'both' | 'uncertain'
type ImpressionSpecificity = 'specific' | 'general' | null

const EXCEEDED_OPTIONS: { value: ImpulseExceeded; label: string }[] = [
  { value: 'yes', label: 'Yes — it overshot' },
  { value: 'no', label: 'No — it was proportionate' },
  { value: 'uncertain', label: "I can't yet tell" },
]

const GROUND_OPTIONS: { value: CooperationGround; label: string }[] = [
  { value: 'rational_being', label: 'Recognition of them as a rational being' },
  { value: 'expected_return', label: 'Expected return' },
  { value: 'both', label: 'Honestly, both' },
  { value: 'uncertain', label: "I can't yet tell" },
]

interface ImpulseEntry {
  id: string
  trait: string
  mode: ExaminationMode
  impression: string
  false_belief: string | null
  impulse_exceeded: ImpulseExceeded | null
  impulse_note: string | null
  sub_species: string | null
  correct_judgement: string | null
  cooperation_ground: CooperationGround | null
  cooperation_ground_note: string | null
  counterfactual: string | null
  impression_specificity: ImpressionSpecificity
  created_at: string
}

function subSpeciesName(id: string): string {
  return PASSION_SUB_SPECIES.find((s) => s.id === id)?.name ?? id
}

function groundLabel(g: CooperationGround): string {
  return GROUND_OPTIONS.find((o) => o.value === g)?.label ?? g
}

function exceededLabel(e: ImpulseExceeded): string {
  return EXCEEDED_OPTIONS.find((o) => o.value === e)?.label ?? e
}

export default function ImpulsePage() {
  const [_user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<ImpulseEntry[]>([])

  // Form state
  const [showForm, setShowForm] = useState(false)
  // When set, the form is REVISING an existing entry (PATCH) rather than creating one.
  const [editingId, setEditingId] = useState<string | null>(null)
  const [trait, setTrait] = useState<string>('')
  const [impression, setImpression] = useState('')
  const [falseBelief, setFalseBelief] = useState('')
  const [impulseExceeded, setImpulseExceeded] = useState<ImpulseExceeded | ''>('')
  const [impulseNote, setImpulseNote] = useState('')
  const [subSpecies, setSubSpecies] = useState('')
  const [showAllSubSpecies, setShowAllSubSpecies] = useState(false)
  const [correctJudgement, setCorrectJudgement] = useState('')
  const [cooperationGround, setCooperationGround] = useState<CooperationGround | ''>('')
  const [cooperationGroundNote, setCooperationGroundNote] = useState('')
  const [counterfactual, setCounterfactual] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{
    type: 'success' | 'error' | 'warning'
    text: string
  } | null>(null)
  // R20a (flag-on only): a moderate/acute result replaces the save entirely
  // with the crisis message; a mild result rides alongside a successful save.
  const [crisisMessage, setCrisisMessage] = useState<string | null>(null)
  const [supportMessage, setSupportMessage] = useState<string | null>(null)

  const isEditing = editingId !== null
  const pathway = trait ? pathwayForTrait(trait) : null
  const mode: ExaminationMode | null = pathway?.mode ?? null

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/auth'
        return
      }
      setUser(user)
      await fetchEntries()
      setLoading(false)
    }
    load()
  }, [])

  const fetchEntries = useCallback(async () => {
    const res = await authFetch('/api/mentor/impulse?view=feed&limit=50')
    if (res.ok) {
      const data = await res.json()
      setEntries(data.entries ?? [])
    }
  }, [])

  function resetForm() {
    setEditingId(null)
    setTrait('')
    setImpression('')
    setFalseBelief('')
    setImpulseExceeded('')
    setImpulseNote('')
    setSubSpecies('')
    setShowAllSubSpecies(false)
    setCorrectJudgement('')
    setCooperationGround('')
    setCooperationGroundNote('')
    setCounterfactual('')
    // A crisis or support message answers ONE submission. Leaving either
    // standing once the form moves to a different or blank entry would be a
    // stale, mis-attributed claim — the stale-suggestion class an independent
    // review found across five wired pages.
    setCrisisMessage(null)
    setSupportMessage(null)
  }

  function openNewForm() {
    resetForm()
    setSubmitResult(null)
    setShowForm(true)
  }

  function startEdit(entry: ImpulseEntry) {
    setTrait(entry.trait || '')
    setImpression(entry.impression || '')
    setFalseBelief(entry.false_belief || '')
    setImpulseExceeded(entry.impulse_exceeded || '')
    setImpulseNote(entry.impulse_note || '')
    setSubSpecies(entry.sub_species || '')
    setShowAllSubSpecies(false)
    setCorrectJudgement(entry.correct_judgement || '')
    setCooperationGround(entry.cooperation_ground || '')
    setCooperationGroundNote(entry.cooperation_ground_note || '')
    setCounterfactual(entry.counterfactual || '')
    setEditingId(entry.id)
    setSubmitResult(null)
    // startEdit does not route through resetForm — a message still attached to
    // the entry just left must not follow onto a different entry.
    setCrisisMessage(null)
    setSupportMessage(null)
    setShowForm(true)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // When the practitioner changes trait, clear the fields that belong to the
  // OTHER mode — otherwise a half-filled diagnostic answer could ride along
  // with a reciprocity submission (the server rejects it, but the form should
  // never present a shape it knows is invalid).
  function selectTrait(next: string) {
    const nextMode = pathwayForTrait(next)?.mode ?? null
    if (nextMode !== mode) {
      setFalseBelief('')
      setImpulseExceeded('')
      setImpulseNote('')
      setSubSpecies('')
      setCorrectJudgement('')
      setCooperationGround('')
      setCooperationGroundNote('')
      setCounterfactual('')
    }
    setShowAllSubSpecies(false)
    setTrait(next)
  }

  const formValid = Boolean(
    trait &&
      impression.trim() &&
      (mode === 'diagnostic_sequence'
        ? falseBelief.trim() && impulseExceeded && subSpecies && correctJudgement.trim()
        : mode === 'reciprocity'
        ? cooperationGround && cooperationGroundNote.trim() && counterfactual.trim()
        : false)
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formValid || submitting) return
    setSubmitting(true)
    setSubmitResult(null)
    setCrisisMessage(null)
    setSupportMessage(null)

    try {
      const content =
        mode === 'diagnostic_sequence'
          ? {
              trait,
              impression: impression.trim(),
              false_belief: falseBelief.trim(),
              impulse_exceeded: impulseExceeded,
              impulse_note: impulseNote.trim() || null,
              sub_species: subSpecies,
              correct_judgement: correctJudgement.trim(),
            }
          : {
              trait,
              impression: impression.trim(),
              cooperation_ground: cooperationGround,
              cooperation_ground_note: cooperationGroundNote.trim(),
              counterfactual: counterfactual.trim(),
            }

      const res = editingId
        ? await authFetch('/api/mentor/impulse', {
            method: 'PATCH',
            body: JSON.stringify({ id: editingId, ...content }),
          })
        : await authFetch('/api/mentor/impulse', {
            method: 'POST',
            body: JSON.stringify(content),
          })

      if (res.ok) {
        const data = await res.json()

        // R20a moderate/acute: the route returns 200 with the crisis payload
        // and NO entry — nothing was saved. Show the message, leave the form
        // exactly as it is, and do not claim a save that did not happen.
        if (data.distress_detected) {
          setCrisisMessage(data.redirect_message ?? null)
          setSubmitting(false)
          if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
          return
        }

        // R20a mild: the entry IS saved and the resources ride alongside.
        if (data.support_resources?.message) {
          setSupportMessage(data.support_resources.message)
        }

        if (data.quality_gate?.specific === false) {
          // Keep the form open + populated so the IMPRESSION can be sharpened in
          // place. Point editingId at the row (just-created on POST, or the same
          // on PATCH) so the next submit updates it rather than creating a duplicate.
          if (data.entry?.id) setEditingId(data.entry.id)
          setSubmitResult({ type: 'warning', text: data.quality_gate.message })
          await fetchEntries()
        } else {
          setSubmitResult({ type: 'success', text: 'The examination is recorded.' })
          const carriedSupport = data.support_resources?.message ?? null
          resetForm()
          setSupportMessage(carriedSupport)
          setShowForm(false)
          await fetchEntries()
        }
      } else {
        const err = await res.json()
        setSubmitResult({ type: 'error', text: err.error || 'Failed to save' })
      }
    } catch {
      setSubmitResult({ type: 'error', text: 'Network error — please try again' })
    }
    setSubmitting(false)
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div role="status" className="text-center text-sage-600 font-body">Loading…</div>
      </div>
    )
  }

  const narrowed = pathway?.narrowedSubSpecies ?? []
  const narrowedSet = new Set(narrowed)

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-sage-900 mb-1">
          Examining an Impulse
        </h1>
        <p className="font-body text-sage-600">
          Name the impulse that is most active for you right now, then trace it: the
          impression that generated it, the belief you assented to, the passion underneath,
          and the judgement that would replace it.
        </p>
        {/* THE REFRAME, at the point of use. */}
        <div className="mt-4 rounded-lg border border-sage-200 bg-sage-50/60 p-4">
          <p className="font-body text-sm text-sage-700">
            Noticing a competitive pull, a defensiveness about your work, or a wish to be
            thought well of <strong>is not failing</strong> — it is generating examination
            material. The framework does not ask you to have no impulses. It asks you to
            examine them before you act, and the examination is only possible if the impulse
            is <em>visible</em>. Nothing here is scored, and nothing you write about the
            impulse is marked.
          </p>
          <p className="font-body text-xs text-sage-500 mt-3">
            Where the{' '}
            <a href="/passion-log" className="underline hover:text-sage-700">Passion Log</a>{' '}
            catches a passion as it arises, this works backwards from the impulse to the
            judgement that produced it. They are companions, not substitutes.
          </p>
        </div>
      </div>

      {/* R20a — moderate/acute. Rendered before everything else; nothing was saved. */}
      {crisisMessage && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-lg border border-amber-300 bg-amber-50 font-body text-sm text-amber-900 whitespace-pre-line"
        >
          {crisisMessage}
        </div>
      )}

      {/* R20a — mild. The entry was saved; the resources ride alongside. */}
      {supportMessage && (
        <div className="mb-6 p-4 rounded-lg border border-sage-300 bg-white font-body text-sm text-sage-700 whitespace-pre-line">
          {supportMessage}
        </div>
      )}

      {/* Submit result message */}
      {submitResult && (
        <div className={`mb-6 p-4 rounded-lg text-sm font-body ${
          submitResult.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : submitResult.type === 'warning'
            ? 'bg-amber-50 text-amber-700 border border-amber-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {submitResult.text}
        </div>
      )}

      {/* Entry form */}
      {showForm ? (
        <form onSubmit={handleSubmit} className="bg-white border border-sage-200 rounded-lg p-6 mb-6">
          <h2 className="font-display text-lg font-medium text-sage-800 mb-4">
            {isEditing ? 'Revise the Examination' : 'Examine an Impulse'}
          </h2>

          {/* THE ENTRY POINT: the trait */}
          <div className="mb-5">
            <label id="impulse-trait-label" className="font-display text-sm font-medium text-sage-600 block mb-2">
              Which impulse is most active for you right now?
              <span className="font-body text-xs text-sage-600 ml-2">Required</span>
            </label>
            <div role="group" aria-labelledby="impulse-trait-label" className="grid gap-2 sm:grid-cols-2">
              {EXAMINATION_PATHWAYS.flatMap((p) =>
                p.traitIds.map((id) => ({ id, pathway: p }))
              ).map(({ id }) => {
                const selected = trait === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => selectTrait(id)}
                    aria-pressed={selected}
                    className={`text-left border rounded-lg p-3 transition-colors ${
                      selected ? 'border-sage-500 bg-sage-50' : 'border-sage-200 hover:border-sage-400'
                    }`}
                  >
                    <div className="font-display text-sm font-medium text-sage-800">
                      {traitName(id)}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step 1 — the impression. THE GATED FIELD. Both modes. */}
          {trait && (
            <div className="mb-5">
              <label htmlFor="impulse-impression" className="font-display text-sm font-medium text-sage-600 block mb-1">
                What was the impression that generated it?
                <span className="font-body text-xs text-sage-600 ml-2">Required</span>
              </label>
              <p className="font-body text-xs text-sage-500 mb-2">
                {pathway?.impressionHint} Not &quot;I felt competitive&quot; but &quot;I felt
                competitive when X said Y, because I interpreted it as a threat to Z&quot; — the
                moment, what was said or done, and what you took it to mean. That precision is
                the difference between examining and merely reporting.
              </p>
              <textarea
                id="impulse-impression"
                value={impression}
                onChange={(e) => setImpression(e.target.value)}
                placeholder="When Dana presented the migration plan in standup and the room agreed with her, I took the agreement as a judgement that my design was the weaker one."
                rows={3}
                className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
                required
              />
            </div>
          )}

          {/* ---- DIAGNOSTIC_SEQUENCE mode: steps 2-5 ---- */}
          {mode === 'diagnostic_sequence' && (
            <>
              {/* Step 2 */}
              <div className="mb-5">
                <label htmlFor="impulse-belief" className="font-display text-sm font-medium text-sage-600 block mb-1">
                  What false belief did you assent to?
                  <span className="font-body text-xs text-sage-600 ml-2">Required</span>
                </label>
                <p className="font-body text-xs text-sage-500 mb-2">
                  {pathway?.falseBeliefHint} The impulse followed an assent — this is the thing
                  you took to be true in the moment{pathway ? `, characteristically ${pathway.falseJudgement}` : ''}.
                </p>
                <textarea
                  id="impulse-belief"
                  value={falseBelief}
                  onChange={(e) => setFalseBelief(e.target.value)}
                  placeholder="That standing in the team's estimation is what makes my work secure — so being judged the weaker designer is a real harm to me."
                  rows={3}
                  className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
                  required
                />
              </div>

              {/* Step 3 */}
              <div className="mb-5">
                <label id="impulse-exceeded-label" className="font-display text-sm font-medium text-sage-600 block mb-1">
                  Did the impulse exceed what reason warranted?
                  <span className="font-body text-xs text-sage-600 ml-2">Required</span>
                </label>
                <div role="group" aria-labelledby="impulse-exceeded-label" className="flex flex-wrap gap-2 mb-2">
                  {EXCEEDED_OPTIONS.map((opt) => {
                    const selected = impulseExceeded === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setImpulseExceeded(opt.value)}
                        aria-pressed={selected}
                        className={`px-3 py-1.5 rounded-full border font-body text-sm transition-colors ${
                          selected
                            ? 'border-sage-500 bg-sage-50 text-sage-800'
                            : 'border-sage-200 text-sage-600 hover:border-sage-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
                <textarea
                  id="impulse-note"
                  value={impulseNote}
                  onChange={(e) => setImpulseNote(e.target.value)}
                  placeholder="Optional — in your own words."
                  rows={2}
                  aria-label="Optional note on whether the impulse exceeded reason"
                  className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
                />
              </div>

              {/* Step 4 — narrowed by the trait, never restricted */}
              <div className="mb-5">
                <label id="impulse-species-label" className="font-display text-sm font-medium text-sage-600 block mb-1">
                  Which passion was operative?
                  <span className="font-body text-xs text-sage-600 ml-2">Required</span>
                </label>
                <p className="font-body text-xs text-sage-500 mb-2">
                  The ones this impulse most often resolves to are shown first — but the honest
                  answer is sometimes a different one, and it is worth saying so.
                </p>
                <div role="group" aria-labelledby="impulse-species-label" className="grid gap-2 sm:grid-cols-2 mb-2">
                  {PASSION_SUB_SPECIES.filter((s) => narrowedSet.has(s.id)).map((s) => {
                    const selected = subSpecies === s.id
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSubSpecies(s.id)}
                        aria-pressed={selected}
                        className={`text-left border rounded-lg p-3 transition-colors ${
                          selected ? 'border-sage-500 bg-sage-50' : 'border-sage-200 hover:border-sage-400'
                        }`}
                      >
                        <div className="font-display text-sm font-medium text-sage-800">{s.name}</div>
                        <div className="font-body text-xs text-sage-500 mt-1">{s.description}</div>
                      </button>
                    )
                  })}
                </div>

                {!showAllSubSpecies ? (
                  <button
                    type="button"
                    onClick={() => setShowAllSubSpecies(true)}
                    className="font-body text-sm text-sage-600 underline hover:text-sage-800"
                  >
                    It was something else — show all the passions
                  </button>
                ) : (
                  <div className="mt-2 space-y-4">
                    {ROOT_PASSION_LABELS.map((root) => (
                      <div key={root.id}>
                        <div className="font-display text-xs font-medium text-sage-700 uppercase tracking-wider mb-1">
                          {root.name}
                        </div>
                        <p className="font-body text-xs text-sage-500 mb-2">{root.definition}</p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {PASSION_SUB_SPECIES.filter((s) => s.root === root.id).map((s) => {
                            const selected = subSpecies === s.id
                            return (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => setSubSpecies(s.id)}
                                aria-pressed={selected}
                                className={`text-left border rounded-lg p-3 transition-colors ${
                                  selected ? 'border-sage-500 bg-sage-50' : 'border-sage-200 hover:border-sage-400'
                                }`}
                              >
                                <div className="font-display text-sm font-medium text-sage-800">{s.name}</div>
                                <div className="font-body text-xs text-sage-500 mt-1">{s.description}</div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 5 — NEVER classified */}
              <div className="mb-6">
                <label htmlFor="impulse-judgement" className="font-display text-sm font-medium text-sage-600 block mb-1">
                  What is the correct judgement that would replace it?
                  <span className="font-body text-xs text-sage-600 ml-2">Required</span>
                </label>
                <p className="font-body text-xs text-sage-500 mb-2">
                  {pathway?.correctJudgementHint} This is yours, and nothing marks it — no part
                  of this tool assesses your philosophy.
                </p>
                <textarea
                  id="impulse-judgement"
                  value={correctJudgement}
                  onChange={(e) => setCorrectJudgement(e.target.value)}
                  placeholder="Their estimation of my design is not up to me and is not what my work is for. What is up to me is whether the migration plan is actually sound — and if hers is better, adopting it is the whole point."
                  rows={3}
                  className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
                  required
                />
              </div>
            </>
          )}

          {/* ---- Reciprocity mode: the mentor's own two questions ---- */}
          {mode === 'reciprocity' && (
            <>
              <p className="font-body text-xs text-sage-500 mb-5 border-l-2 border-sage-200 pl-3">
                This one runs differently, and it is worth knowing how before you answer. The other
                three pathways trace an impulse back to a passion that produced it. This one does
                not — reciprocity is not a passion. What you are examining here is the{' '}
                <em>ground</em> of an action that may look correct either way: cooperation grounded
                in recognising the other as a rational being, versus cooperation grounded in what you
                expect back. The framework has a name for the second when it is mistaken for the
                first — action from passion, externally correct behaviour driven by wrong reasons.
                Finishing this pathway means you have examined the ground of an action, not a
                passion that preceded it.
              </p>

              <div className="mb-5">
                <label id="impulse-ground-label" className="font-display text-sm font-medium text-sage-600 block mb-2">
                  {RECIPROCITY_QUESTIONS.ground}
                  <span className="font-body text-xs text-sage-600 ml-2">Required</span>
                </label>
                <div role="group" aria-labelledby="impulse-ground-label" className="flex flex-wrap gap-2 mb-3">
                  {GROUND_OPTIONS.map((opt) => {
                    const selected = cooperationGround === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setCooperationGround(opt.value)}
                        aria-pressed={selected}
                        className={`px-3 py-1.5 rounded-full border font-body text-sm transition-colors ${
                          selected
                            ? 'border-sage-500 bg-sage-50 text-sage-800'
                            : 'border-sage-200 text-sage-600 hover:border-sage-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
                <textarea
                  id="impulse-ground-note"
                  value={cooperationGroundNote}
                  onChange={(e) => setCooperationGroundNote(e.target.value)}
                  placeholder="I covered for Sam because I will need the same next month. If I am honest, the thought of what I would be owed arrived before the thought of what he needed."
                  rows={3}
                  aria-label="Your answer, in your own words"
                  className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
                  required
                />
              </div>

              <div className="mb-6">
                <label htmlFor="impulse-counterfactual" className="font-display text-sm font-medium text-sage-600 block mb-1">
                  {RECIPROCITY_QUESTIONS.counterfactual}
                  <span className="font-body text-xs text-sage-600 ml-2">Required</span>
                </label>
                <p className="font-body text-xs text-sage-500 mb-2">
                  This is the discriminating question. Take the expected return away entirely and
                  say what is left of the action.
                </p>
                <textarea
                  id="impulse-counterfactual"
                  value={counterfactual}
                  onChange={(e) => setCounterfactual(e.target.value)}
                  placeholder="If I knew he would never be in a position to return it, I think I would still have done it — but I would have resented the evening, which tells me the return was doing more of the work than I would like."
                  rows={3}
                  className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
                  required
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                resetForm()
                setShowForm(false)
              }}
              className="font-body text-sm text-sage-600 hover:text-sage-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formValid || submitting}
              className="px-6 py-2 bg-sage-500 text-white font-display text-sm rounded hover:bg-sage-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : isEditing ? 'Save changes' : 'Record the examination'}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={openNewForm}
          className="w-full border-2 border-dashed border-sage-200 rounded-lg p-4 text-center font-body text-sm text-sage-600 hover:border-sage-400 hover:text-sage-600 transition-colors mb-6"
        >
          + Examine an impulse
        </button>
      )}

      {/* Entries feed */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-medium text-sage-800">
          Past Examinations
          {entries.length > 0 && (
            <span className="font-body text-sm text-sage-600 ml-2">({entries.length})</span>
          )}
        </h2>

        {entries.length === 0 ? (
          <div className="bg-sage-50 border border-sage-200 rounded-lg p-8 text-center">
            <p className="font-body text-sage-600">
              Nothing examined yet. The next time you notice a pull — to win, to hold ground, to
              be thought well of, to keep something safe — that is the material. Bring it here
              rather than talking yourself out of having felt it.
            </p>
          </div>
        ) : (
          entries.map((entry) => {
            const flagged = entry.impression_specificity === 'general'
            return (
              <div key={entry.id} className="bg-white border border-sage-200 rounded-lg overflow-hidden">
                <div className="px-5 py-3 border-b border-sage-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0 flex-wrap">
                    <span className="font-body text-xs text-sage-600">
                      {formatDate(entry.created_at)}
                    </span>
                    <span className="text-xs font-body px-2 py-0.5 rounded-full bg-sage-50 text-sage-700 border border-sage-200">
                      {traitName(entry.trait)}
                    </span>
                    {entry.sub_species && (
                      <span className="text-xs font-body px-2 py-0.5 rounded-full bg-sage-50 text-sage-700 border border-sage-200">
                        {subSpeciesName(entry.sub_species)}
                      </span>
                    )}
                  </div>
                  {flagged && (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-body px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                        A general description, not yet an impression
                      </span>
                      <button
                        onClick={() => startEdit(entry)}
                        className="text-xs font-body px-2 py-0.5 rounded-full border border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors"
                      >
                        Revise
                      </button>
                    </div>
                  )}
                </div>

                <div className="divide-y divide-sage-50">
                  <div className="px-5 py-3">
                    <div className="font-display text-xs font-medium text-sage-600 uppercase tracking-wider mb-1">
                      The Impression
                    </div>
                    <p className="font-body text-sm text-sage-800">{entry.impression}</p>
                  </div>

                  {entry.mode === 'diagnostic_sequence' ? (
                    <>
                      <div className="px-5 py-3">
                        <div className="font-display text-xs font-medium text-sage-600 uppercase tracking-wider mb-1">
                          The False Belief
                        </div>
                        <p className="font-body text-sm text-sage-800">{entry.false_belief}</p>
                      </div>
                      <div className="px-5 py-3">
                        <div className="font-display text-xs font-medium text-sage-600 uppercase tracking-wider mb-1">
                          Did the Impulse Exceed Reason?
                        </div>
                        <p className="font-body text-sm text-sage-800">
                          {entry.impulse_exceeded ? exceededLabel(entry.impulse_exceeded) : '—'}
                        </p>
                        {entry.impulse_note && (
                          <p className="font-body text-sm text-sage-600 mt-1">{entry.impulse_note}</p>
                        )}
                      </div>
                      <div className="px-5 py-3 bg-sage-50/40">
                        <div className="font-display text-xs font-medium text-sage-700 uppercase tracking-wider mb-1">
                          The Correct Judgement
                        </div>
                        <p className="font-body text-sm text-sage-800">{entry.correct_judgement}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="px-5 py-3">
                        <div className="font-display text-xs font-medium text-sage-600 uppercase tracking-wider mb-1">
                          The Ground of the Cooperation
                          {entry.cooperation_ground && (
                            <span className="ml-2 font-body text-xs normal-case tracking-normal text-sage-500">
                              — {groundLabel(entry.cooperation_ground)}
                            </span>
                          )}
                        </div>
                        <p className="font-body text-sm text-sage-800">{entry.cooperation_ground_note}</p>
                      </div>
                      <div className="px-5 py-3 bg-sage-50/40">
                        <div className="font-display text-xs font-medium text-sage-700 uppercase tracking-wider mb-1">
                          If the Expected Return Were Removed
                        </div>
                        <p className="font-body text-sm text-sage-800">{entry.counterfactual}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
