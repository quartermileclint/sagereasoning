import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS } from '@/lib/security'
import { detectDistressTwoStage } from '@/lib/r20a-classifier'
import { enforceDistressCheck } from '@/lib/constraints'
import { composeDistressSubject, hasScreenableSubject, buildMildSupportResources, DISTRESS_SUBJECT_SEPARATOR } from '@/lib/r20a-gap-closure'
import { isScoreSaveR20aEnabled, SCORE_SAVE_PERSISTED_FIELD_CAP } from './r20a'

/**
 * POST /api/score/save
 *
 * Persists an already-computed /api/score evaluation result to
 * action_evaluations_v3, on behalf of the authenticated caller. Deliberately
 * separate from /api/score itself (which stays engine-adjacent and
 * measurement-neutral — this route never calls the engine, never touches
 * scoring, purely a store operation).
 *
 * Route-change-first for the RLS-vs-route-enforcement survey's Class B row
 * 19: `src/app/score/page.tsx` previously inserted into `action_evaluations_v3`
 * directly from the browser via the anon-key client for practitioners who
 * chose "cloud" storage, relying on the table's owner INSERT policy. This
 * route removes that dependency by moving the identical insert server-side,
 * `user_id` taken from the server-verified session (`requireAuth`), never
 * from the request body. Column set and validation mirror the client's
 * previous insert body — see `supabase-v3-migration.sql` for the schema this
 * must stay in lockstep with (the 2026-07-26 schema-drift incident this table
 * already survived once).
 *
 * Bearer-JWT only — callers must use `authFetch`, never a bare `fetch`. No
 * `sr_*` practice credential can reach this route; the audience is always a
 * human practitioner in a browser session, which is why the R20a redirect
 * below is rendered in the human form and never the developer form.
 *
 * ===========================================================================
 * R20a PERIMETER MEMBER — RULED 2026-08-31, REBUILT AFTER A REVERT
 * ===========================================================================
 *
 * This route screens caller-supplied free text for acute distress before it is
 * persisted. It is the 43rd route-level member of the R20a perimeter (derive
 * the ordinal from HUMAN_FACING_POST_ROUTES, never from prose — the first
 * attempt took "fifteenth" from a stale narrative).
 *
 * THE RULING (operations/agent-circles-2026-08/2026-08-31-mentor-ruling-corrected-
 * questionB-and-A2b-verbatim.md, binding; verbatim wins over this comment):
 * the screened set is "all caller-supplied fields capable of carrying prose …
 * enumerated from the route's actual schema, not from a criterion that the code
 * does not enforce."
 *
 * The earlier seven-field scope was rejected because it rested on "engine
 * outputs echoed back by the client" — a criterion that (a) does not partition
 * the fields (three of the seven it required screening are themselves engine
 * outputs, by exactly the test used to exclude the other six) and (b) the route
 * cannot enforce, since the ruling's own premise is that a caller can POST here
 * directly with /api/score never executing. NOTE, because the reverted version's
 * docstring got this wrong: /api/score does NOT call this route. The page calls
 * each independently (score/page.tsx:148 then :196), which is precisely why the
 * "echoed back" criterion has no force here.
 *
 * SCREENED (10), enumerated against the destructure and supabase-v3-migration.sql:
 *   action, context, relationships, emotional_state          — TEXT, practitioner-typed
 *   philosophical_reflection, improvement_path,
 *   oikeiosis_context, ruling_faculty_state                   — TEXT, engine-authored
 *                                                               but CALLER-SUPPLIED here
 *   false_judgements, passions_detected                       — JSONB, zero validation
 *
 * `false_judgements` is where a practitioner records their own catastrophic
 * self-statements; the ruling calls it "the field most likely to carry the
 * material the perimeter exists to screen". `passions_detected` and
 * `ruling_faculty_state` were NOT named by the ruling — the enumeration caught
 * them. That is the instruction working.
 *
 * EXCLUDED (3), each on a ground THIS ROUTE enforces — deliberately not on a
 * DB CHECK constraint, because "enforced in a different file" is the same shape
 * of criterion the ruling rejected:
 *   katorthoma_proximity  — validated against the enum below (was: any non-empty
 *                           string, so "I want to kill myself" passed the route
 *                           and was stopped only by the DB)
 *   kathekon_quality      — validated against the enum below (was: no route
 *                           validation at all)
 *   is_kathekon           — BOOLEAN, typeof-checked below
 *
 * ORDERING IS RULED AND LOAD-BEARING: the perimeter check runs BEFORE field
 * validation and BEFORE any DB call, so distress inside an otherwise-invalid
 * body still catches. It reads `body?.x` for exactly that reason.
 *
 * THE RESPONSE ON DETECTION IS 422, NOT 200. This is the direct fix for the
 * defect that forced the revert: the first attempt returned the redirect as
 * HTTP 200, `score/page.tsx` reads a 200 as success, and a practitioner writing
 * acute distress into `emotional_state` received a silently unsaved record, the
 * word "saved", and no crisis resources — worse than the unscreened state it
 * replaced, for exactly the population the perimeter protects.
 *
 * This route is the ONLY non-200 distress redirect in the codebase, and that
 * divergence is deliberate: it is the only one whose caller treats a 200 as a
 * durable write having happened. CHECKED 2026-08-31 by parsing every
 * `NextResponse.json(...)` call under src/app/api whose argument span contains
 * `distress_detected: true` — 45 such calls, of which 44 are 200 (12 explicit,
 * 32 by omitting the second argument) and 1 is this one at 422.
 * (Do NOT restate that as a count of `distress_detected: true` OCCURRENCES —
 * that grep returns a larger number because it also matches type definitions,
 * comments and non-response contexts. An earlier draft of this comment made
 * exactly that error.)
 *
 * A 422 here is a SAFETY EVENT, not an error-rate regression — alert on the
 * body flag, never suppress 4xx on this route. The calling page discriminates
 * on the BODY, not the status.
 *
 * FLAG: SUBSTRATE_SCORE_SAVE_R20A_ENABLED (dedicated — see ./r20a.ts for why it
 * is not the shared gap-closure flag, and for the rollback lever, which is this
 * flag or `git revert`, NEVER the shared flag).
 *
 * Rules served: R20a, AC5, PR6 (Critical).
 */

/** The DB CHECK vocabularies, restated here so the ROUTE enforces them.
 *  Machine-checked against supabase-v3-migration.sql by
 *  src/lib/__tests__/action-evaluations-v3-schema-drift.test.ts — without that
 *  pin this trades a DB-enforced invariant for a hand-maintained one, and
 *  hand-maintained lists in this codebase have drifted undetected before. */
const KATORTHOMA_PROXIMITY_VALUES = ['reflexive', 'habitual', 'deliberate', 'principled', 'sage_like']
const KATHEKON_QUALITY_VALUES = ['strong', 'moderate', 'marginal', 'contrary']

/**
 * Flatten a JSONB value to the prose it carries, at any depth and in any shape.
 *
 * WHY A WALKER AND NOT A FIELD LIST: `false_judgements` is an array of strings
 * and `passions_detected` an array of `{id, name, root_passion}`, but neither
 * is validated in any way — a caller posting directly can put any structure in
 * either. composeDistressSubject SKIPS non-strings silently, which is how the
 * reverted implementation let `emotional_state: {note: "I want to kill myself"}`
 * screen clean and reach the insert (register M5). A shape-agnostic walk cannot
 * be defeated by a shape nobody anticipated.
 *
 * OBJECT KEYS ARE COLLECTED TOO. A key persists verbatim in JSONB and can
 * itself be the prose — `{"I want to kill myself": true}` is a legal body.
 *
 * RETURNS ONE STRING, joined with the shared separator, and that is the
 * structural point. Returning an array would give each JSONB field UNBOUNDED
 * arity against DISTRESS_SUBJECT_MAX_FIELDS (20), so a 30-element
 * `passions_detected` could consume the whole budget and push `action`,
 * `emotional_state` and `false_judgements` out of the subject entirely —
 * screening them against nothing. That is input-inducible, reachable by the
 * direct POST the ruling's premise establishes, and invisible to every battery.
 * Flattened to one value, each of the ten sources occupies exactly one slot.
 *
 * The separator is DISTRESS_SUBJECT_SEPARATOR and never whitespace: multi-word
 * DISTRESS_PATTERNS use `\s+`, so a bare newline would let two benign adjacent
 * strings bridge into a false acute across the seam.
 *
 * NEVER THROWS — it runs before this route's own 400s and receives raw wire
 * values. No JSON.stringify inside, no unguarded property access.
 *
 * ⚠ THE BOUND HERE IS A WORK LIMIT, NOT THE SAFETY GUARANTEE. Read this before
 * changing either it or the route's JSONB size check.
 *
 * An earlier version of this function bounded accumulation at
 * SCORE_SAVE_PERSISTED_FIELD_CAP raw prose characters and claimed that made
 * screened >= persisted hold, reasoning that a JSON serialization is always at
 * least as long as the sum of the raw strings inside it. The premise is true.
 * THE CONCLUSION WAS FALSE, because it compared the wrong quantity: what
 * composeDistressSubject caps is not the sum of the raw strings, it is the
 * JOINED string — and the joins are OUR OWN separator, 7 characters each.
 *
 * Demonstrated bypass (found by testing the claim, before review):
 *   false_judgements = [ ...700 x "a", "I want to kill myself and I have a plan" ]
 *   JSON.stringify -> 2,843 chars, comfortably under the cap, so it PERSISTED
 *   collected      -> 5,639 chars (700 separators = 4,900 of that)
 *   screened       -> truncated at 5,000, and the acute phrase sat past the cut
 * Acute distress persisted having never been shown to the classifier. A caller
 * can tune the padding to push anything past the boundary.
 *
 * THE GUARANTEE IS NOW EXACT AND LIVES IN THE ROUTE: the JSONB check rejects on
 * the length of THIS FUNCTION'S OUTPUT, not on serialized size. If the collected
 * text fits the cap, composeDistressSubject cannot truncate it, so everything
 * that persists was screened. The ceiling below is only a work limit so a
 * hostile payload cannot make us walk forever — it is deliberately well ABOVE
 * the cap, so hitting it produces an over-cap string that the route then
 * REJECTS, rather than a quietly-shortened one that it accepts.
 */
const JSONB_COLLECTOR_WORK_CEILING = SCORE_SAVE_PERSISTED_FIELD_CAP * 4
const JSONB_COLLECTOR_MAX_DEPTH = 32

interface JsonbCollected {
  /** All prose found, joined with DISTRESS_SUBJECT_SEPARATOR. */
  text: string
  /** True when a bound stopped the walk, so `text` is INCOMPLETE. */
  bounded: boolean
}

function collectScoreSaveJsonbText(value: unknown): JsonbCollected {
  const parts: string[] = []
  let chars = 0
  // Set when a bound stopped the walk. The route REFUSES the write when it is
  // true. A walk that stopped early has NOT seen everything that would persist,
  // and a partial screen is exactly the failure this perimeter exists to
  // prevent — so "we could not read all of it" must never resolve to "save it".
  let bounded = false
  const walk = (v: unknown, depth: number): void => {
    if (depth > JSONB_COLLECTOR_MAX_DEPTH || chars >= JSONB_COLLECTOR_WORK_CEILING) {
      bounded = true
      return
    }
    if (typeof v === 'string') {
      if (v.trim().length > 0) {
        parts.push(v)
        chars += v.length
      }
      return
    }
    if (typeof v === 'number' || typeof v === 'boolean') {
      const s = String(v)
      parts.push(s)
      chars += s.length
      return
    }
    if (v === null || v === undefined) return
    if (Array.isArray(v)) {
      for (const item of v) walk(item, depth + 1)
      return
    }
    if (typeof v === 'object') {
      for (const [k, item] of Object.entries(v as Record<string, unknown>)) {
        if (chars >= JSONB_COLLECTOR_WORK_CEILING) {
          bounded = true
          return
        }
        if (k.trim().length > 0) {
          parts.push(k)
          chars += k.length
        }
        walk(item, depth + 1)
      }
    }
  }
  walk(value, 0)
  return { text: parts.join(DISTRESS_SUBJECT_SEPARATOR), bounded }
}

/**
 * Compose the distress-check subject from all TEN screened fields.
 *
 * ORDERING IS LOAD-BEARING (the established discipline in r20a-gap-closure's
 * own collectMentorProfileText): DISTRESS_SUBJECT_MAX_FIELDS truncates at 20
 * values, so the most distress-bearing sources come FIRST. Ten sources against
 * twenty slots leaves headroom by construction, because the two JSONB sources
 * are flattened to one value each rather than expanding.
 */
function scoreSaveDistressSubject(body: Record<string, unknown> | null | undefined): string {
  return composeDistressSubject([
    body?.emotional_state,
    body?.action,
    collectScoreSaveJsonbText(body?.false_judgements).text,
    body?.context,
    body?.relationships,
    body?.philosophical_reflection,
    body?.improvement_path,
    body?.oikeiosis_context,
    body?.ruling_faculty_state,
    collectScoreSaveJsonbText(body?.passions_detected).text,
  ])
}

/** Bound an engine-authored field to the screening window. Truncates rather
 *  than rejecting — the practitioner did not author these and cannot shorten
 *  them — and never does so silently. */
function boundEngineField(name: string, value: unknown): unknown {
  if (typeof value !== 'string') return value
  if (value.length <= SCORE_SAVE_PERSISTED_FIELD_CAP) return value
  console.warn(
    `[score/save] engine-authored field '${name}' truncated for persistence: ` +
      `${value.length} chars -> ${SCORE_SAVE_PERSISTED_FIELD_CAP} (screened window >= persisted window)`
  )
  return value.slice(0, SCORE_SAVE_PERSISTED_FIELD_CAP)
}

export async function POST(request: NextRequest) {
  // Shares /api/score's own bucket — this fires once per cloud-mode
  // evaluation, the same cadence as the evaluation call itself, not an
  // independent read/browse action.
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const userId = auth.user.id

  let body: Record<string, unknown> | null
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 })
  }

  // ── R20a perimeter: BEFORE field validation, BEFORE any DB call ──────────
  let mildSupport: ReturnType<typeof buildMildSupportResources> | null = null
  // Captured so the bounds below can be gated on the SAME activation without a
  // second literal `if (isScoreSaveR20aEnabled())` block — the wiring battery
  // counts those, and this route declares exactly one.
  let r20aActive = false
  if (isScoreSaveR20aEnabled()) {
    r20aActive = true
    const subject = scoreSaveDistressSubject(body)
    // Skip the classifier on an empty subject — there is no distress to detect
    // in an empty string, and calling it anyway pays for a real billed Haiku
    // request before the 400s below fire.
    if (hasScreenableSubject(subject)) {
      // PR19 (2026-08-31): detectDistressTwoStage fails OPEN internally for
      // Anthropic errors (the ADR-R20a-01 D6-c posture), but getClient() sits
      // OUTSIDE that try — so a missing or invalid ANTHROPIC_API_KEY throws at
      // client construction and escaped this route as an uncaught 500.
      //
      // Caught here and failed CLOSED. On every other perimeter member a
      // screening failure means "the request proceeds unscreened"; on this one
      // it would mean a DURABLE WRITE of unscreened text, which is the outcome
      // the ruling exists to prevent. If we cannot screen, we do not save.
      let gate
      try {
        gate = await enforceDistressCheck(detectDistressTwoStage(subject))
      } catch (err) {
        console.error('score/save: distress screening unavailable, refusing the write:', err)
        return NextResponse.json(
          { error: 'Your evaluation could not be saved right now. Please try again shortly.' },
          { status: 503 }
        )
      }
      // PR19 (2026-08-31, dim 3): assert the codebase's branded decision
      // primitive too, not only `distress_detected`. This route previously
      // re-derived its own redirect condition — the ONLY gap-closure member to
      // do so — while every non-gap-closure peer (impulse, stoa,
      // score-conversation, journal) reads `shouldRedirect` directly. They
      // cannot diverge under the real classifier (redirect_message is non-null
      // exactly when severity is acute/moderate), so this is belt-and-braces,
      // not a fix — but on the one route where NOT redirecting means a durable
      // write, a defence that costs nothing is worth keeping. The inner
      // condition below is left in the shared gap-closure spelling on purpose:
      // the wiring battery's assertRedirectAndMild pins that exact text across
      // all 26 consumer routes, and this is additive to it, not a replacement.
      if (!gate.shouldRedirect && gate.result.distress_detected) {
        console.error('score/save: gate.shouldRedirect disagreed with distress_detected — proceeding on the conservative reading')
      }
      if (gate.result.distress_detected && gate.result.severity !== 'mild') {
        return NextResponse.json(
          {
            distress_detected: true,
            severity: gate.result.severity,
            redirect_message: gate.result.redirect_message,
          },
          { status: 422 }
        )
      }
      if (gate.result.severity === 'mild') {
        mildSupport = buildMildSupportResources('practice')
      }
    }
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 })
  }

  const {
    action,
    context,
    relationships,
    emotional_state,
    katorthoma_proximity,
    is_kathekon,
    kathekon_quality,
    passions_detected,
    false_judgements,
    ruling_faculty_state,
    philosophical_reflection,
    improvement_path,
    oikeiosis_context,
  } = body

  if (typeof action !== 'string' || !action.trim()) {
    return NextResponse.json({ error: 'action is required' }, { status: 400 })
  }

  // ── Bounds that exist ONLY to serve the perimeter, gated with it ────────
  //
  // PR19 (2026-08-31) proved these were a FLAG-OFF BEHAVIOUR CHANGE when they
  // ran unconditionally: 11 of 13 probed bodies differed from the pre-rebuild
  // route, and 9 turned a previously-accepted, persisted save into a 400. The
  // sharpest case was practitioner-facing — `emotional_state` and
  // `relationships` are unbounded upstream (/api/score validates only `action`
  // and `context`), so someone writing 6,000 characters into "How are you
  // feeling?" received a full evaluation and then a PERMANENT save failure, on
  // deploy, with the flag off and the founder told deploy was a no-op.
  //
  // They are gated now. Every one of them exists to make SCREENED >= PERSISTED
  // hold, which is a property that only means anything while screening runs —
  // so flag-off correctly reverts to the pre-rebuild bounds (i.e. none), and
  // "flag-off is byte-identical" becomes TRUE rather than merely claimed.
  if (r20aActive) {
  // Type-check every screened TEXT field. This is what closes register M5 for
  // TEXT: a non-string is silently skipped by composeDistressSubject, so a
  // structure smuggled into a TEXT column would evade screening — it is
  // rejected here rather than persisted unscreened.
  for (const [name, value] of [
    ['context', context],
    ['relationships', relationships],
    ['emotional_state', emotional_state],
    ['philosophical_reflection', philosophical_reflection],
    ['improvement_path', improvement_path],
    ['oikeiosis_context', oikeiosis_context],
    ['ruling_faculty_state', ruling_faculty_state],
  ] as const) {
    if (value !== undefined && value !== null && typeof value !== 'string') {
      return NextResponse.json({ error: `${name} must be a string` }, { status: 400 })
    }
  }

  // Practitioner-typed fields: bounded, and a breach is a 400 they can act on.
  // `action` matches /api/score's own inbound bound so this route can never
  // reject text its upstream evaluator accepted.
  const lengthError =
    validateTextLength(action, 'Action', TEXT_LIMITS.short) ??
    validateTextLength(context as string | null, 'Context', TEXT_LIMITS.medium) ??
    validateTextLength(relationships as string | null, 'Relationships', TEXT_LIMITS.medium) ??
    validateTextLength(emotional_state as string | null, 'Emotional state', TEXT_LIMITS.medium)
  if (lengthError) {
    return NextResponse.json({ error: lengthError }, { status: 400 })
  }

  // JSONB: validateTextLength does not apply to a structure, so bound the
  // serialized size. This is the other half of the screened >= persisted
  // guarantee for JSONB — see collectScoreSaveJsonbText's contract.
  for (const [name, value] of [
    ['false_judgements', false_judgements],
    ['passions_detected', passions_detected],
  ] as const) {
    if (value === undefined || value === null) continue
    let serialized: string
    try {
      serialized = JSON.stringify(value) ?? ''
    } catch {
      return NextResponse.json({ error: `${name} must be JSON-serialisable` }, { status: 400 })
    }
    void serialized
    // BIND ON THE COLLECTED LENGTH, NOT THE SERIALIZED LENGTH. This is the exact
    // screened >= persisted guarantee: composeDistressSubject caps each value at
    // SCORE_SAVE_PERSISTED_FIELD_CAP, so if the collected text fits that cap it
    // is screened in full, and if it does not we refuse the write rather than
    // persist text the classifier never saw. Serialized size is NOT a valid
    // proxy — the collector's own separators inflate the collected string past
    // the cap while the serialized form stays comfortably under it (see
    // collectScoreSaveJsonbText's header for the demonstrated bypass).
    const collected = collectScoreSaveJsonbText(value)
    if (collected.bounded) {
      return NextResponse.json(
        { error: `${name} is too deeply nested or too large to screen` },
        { status: 400 }
      )
    }
    if (collected.text.length > SCORE_SAVE_PERSISTED_FIELD_CAP) {
      return NextResponse.json(
        { error: `${name} exceeds maximum size of ${SCORE_SAVE_PERSISTED_FIELD_CAP} characters` },
        { status: 400 }
      )
    }
  }

  // The three excluded fields, enforced HERE rather than only by a DB CHECK.
  if (typeof katorthoma_proximity !== 'string' || !KATORTHOMA_PROXIMITY_VALUES.includes(katorthoma_proximity)) {
    return NextResponse.json({ error: 'katorthoma_proximity is required' }, { status: 400 })
  }
  if (typeof is_kathekon !== 'boolean') {
    return NextResponse.json({ error: 'is_kathekon (boolean) is required' }, { status: 400 })
  }
  if (
    kathekon_quality !== undefined &&
    kathekon_quality !== null &&
    (typeof kathekon_quality !== 'string' || !KATHEKON_QUALITY_VALUES.includes(kathekon_quality))
  ) {
    return NextResponse.json({ error: 'kathekon_quality is invalid' }, { status: 400 })
  }
  }

  const { data, error } = await supabaseAdmin
    .from('action_evaluations_v3')
    .insert({
      user_id: userId,
      action,
      context: context ?? null,
      relationships: relationships ?? null,
      emotional_state: emotional_state ?? null,
      katorthoma_proximity,
      is_kathekon,
      kathekon_quality: kathekon_quality ?? null,
      passions_detected: passions_detected ?? null,
      false_judgements: false_judgements ?? null,
      ruling_faculty_state: (r20aActive ? boundEngineField('ruling_faculty_state', ruling_faculty_state) : ruling_faculty_state) ?? null,
      philosophical_reflection: (r20aActive ? boundEngineField('philosophical_reflection', philosophical_reflection) : philosophical_reflection) ?? null,
      improvement_path: (r20aActive ? boundEngineField('improvement_path', improvement_path) : improvement_path) ?? null,
      oikeiosis_context: (r20aActive ? boundEngineField('oikeiosis_context', oikeiosis_context) : oikeiosis_context) ?? null,
    })
    .select('id')
    .single()

  if (error) {
    console.error('score/save insert error:', error)
    return NextResponse.json({ error: 'Failed to save evaluation' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    id: data.id,
    ...(mildSupport ? { support_resources: mildSupport } : {}),
  })
}
