# ATL Wrapper — Write-Path Into `agent_accreditation` Design

**Status:** Adopted 2026-05-16 under `D-ATL-WRITE-PATH-DESIGN-LOCKED-2026-05-16`. **Implementation status:** Designed (per 0a vocabulary) — the seven decisions below are specified, not built; the write-path build session is the next sub-session in the post-6b arc.
**Stream:** founder.
**Governs:** The build spec for the write-path build session (step 7 of 8 in the post-6b arc) — `code-critical` risk classification expected (Q1's route + library election introduces a POST surface with an auth gate; Critical Change Protocol engages at the build session). The seven decisions below MUST be implemented as specified; the build session has discretion on file paths, helper naming, and test structure within those constraints.
**Does not govern:** the kathekon-aligned alternative build (step 6 — already complete and Verified at type-check); the items 1–3 build (steps 2–3 — already complete and Verified at type-check); the trajectory-enriched developer hand-back report (step 4 — already complete and Verified at type-check); A10 per-agent credentials (step 8 — separate session; Decision C names the dependency); the read-side `/api/accreditation/[agent_id]` route (Live since 6b; unchanged by this design).
**Sequencing:** step 7 of 8 in the post-6b arc per `/operations/handoffs/founder/2026-05-15-post-build-brainstorm-close.md`. Predecessor: kathekon-aligned alternative build (`D-ATL-KATHEKON-ALIGNED-ALTERNATIVE-BUILD-WIRED-VERIFIED-2026-05-16`). Successor: the write-path build session, then step 8 — A10 per-agent credentials.

---

## Scope

**In scope (this design):** Seven locked design decisions defining the write-path that populates `agent_accreditation` rows. The persistence layer (`atl-accreditation-store.ts`) is Verified and exposes four async functions (`lookupAccreditationRecord`, `upsertAccreditationRecord`, `appendGradeHistory`, `appendInitialGradeHistory`); the table is empty in production because no code currently invokes the three write functions. This design defines the surface that does.

- **Decision A** — Write-path surface (Q1)
- **Decision B** — Write trigger (Q2)
- **Decision C** — Auth model (Q3)
- **Decision D** — Initial-seed vs trajectory-update separation (Q4)
- **Decision E** — Atomicity (Q5)
- **Decision F** — Idempotency (Q6)
- **Decision G** — Observability (Q7)

**Out of scope:** code (build session); A10 per-agent credentials (step 8 — Decision C names the dependency); changes to the existing read endpoint at `/api/accreditation/[agent_id]`; changes to the persistence layer's four async functions (already Verified); changes to the Supabase schema beyond what this design's build session may need for its auth surface; changes to the proximity-driven grade engine, authority mapper, or dimension levels; changes to the Senecan grade ladder; changes to the J1 ADR's Character Kernel category framing.

---

## The underlying motivation

After step 6 (kathekon-aligned alternative build), the substrate's R18a-honest credential surface carries three observable reasoning-pattern signals — `typical_proximity`, `typical_deliberation_breadth`, `typical_kathekon_quality` — all defined in the type system and persistence-capable in Supabase. The persistence layer's write functions exist and are tested. The public read endpoint is Live. But the table is empty: no agent has a row, because nothing invokes the write functions.

The persistence layer is dormant until something writes. The wrapper's `computeTrajectory` produces an advanced `CarriedProfile` containing an updated `AccreditationRecord` on every call — but the wrapper is intentionally pure (`atl-wrapper.ts` documents this); it produces values, it does not persist. The write-path is the missing seam between the wrapper's pure computation and the persistence layer's awaited writes. Without it, the credential exists only in memory for the duration of one wrapper consumer's process.

This design defines that seam. The build session it specifies makes the table populate-able by wrapper consumers and by external callers (via a route), with the auth surface shaped to receive A10 tokens once step 8 lands.

---

## Decision A — Write-path surface

### Why

The persistence layer's four async functions are accessible only by library import. To populate `agent_accreditation` rows, *something* must call them. The "something" can be (a) a library function that wraps the four async functions for wrapper consumers, (b) a route + library where both surfaces exist, or (c) a route-only surface that owns the entire write path. The choice cascades into auth, deployment risk, and the build session's risk classification.

### Elected position

**Route + library.** A new library function in `/website/src/lib/substrate/` (e.g., `atl-accreditation-writer.ts` or sibling) exposes the elected entry points (per Decision D — two entry points: `seedAccreditation` + `updateAccreditation`) for wrapper-internal consumers. A new POST route at `/api/accreditation/[agent_id]` calls the library and exposes the write surface over HTTP for external callers (orchestrators, dashboards, CI integrations, future agent platforms).

### Why this and not the alternatives

The surface question had three candidate answers:

- **(a) Library-only.** Simplest; no HTTP surface. Rejected because the founder's intended use cases (orchestrator dashboards; external agent platforms calling the substrate; CI integrations populating credentials from wrapper runs in non-Next.js environments) all need an HTTP entry point. A library-only build would have to be re-opened to add a route later — a route-aware library design now avoids a re-architecture session.
- **(b) Route + library.** *Adopted.* Both surfaces available; wrapper-internal consumers use the library directly; external callers use the route. The route is a thin shim over the library. Build session is Critical (auth + deployment surface).
- **(c) Route-only.** Rejected because wrapper-internal consumers would have to make HTTP calls to themselves to persist, which trips KG1 rule 1 (no self-calls). The library function is also where reusability sits — multiple internal consumers (Component 5 iteration patterns; future hand-back-report endpoints; future cost-tracking integrations) all want a library call rather than an HTTP round-trip.

### Structural constraint

The route is added at `POST /api/accreditation/[agent_id]` — the same route group as the existing read endpoint (GET at `/api/accreditation/[agent_id]/route.ts`). The Next.js App Router allows both `GET` and `POST` handlers in the same `route.ts`; the build session may add `POST` to the existing file, or split the read and write handlers across `route.ts` (read) and a new sibling file. Build-session discretion.

The library function lives in a new file at `/website/src/lib/substrate/atl-accreditation-writer.ts` (filename build-session discretion; sibling to `atl-accreditation-store.ts` and `atl-wrapper.ts`).

### Function signatures (target shape for the build session)

```ts
// Decision D delivers two entry points; the library exposes both.
export async function seedAccreditation(
  profile: CarriedProfile
): Promise<void>

export async function updateAccreditation(
  profile: CarriedProfile,
  transitionResult: TransitionResult
): Promise<void>
```

The route's POST handler:

```
POST /api/accreditation/[agent_id]
Body: { kind: 'seed' | 'update', profile: <serialised CarriedProfile>, transition_result?: <serialised TransitionResult> }
Response: 200 ok | 401 unauthorized | 400 invalid-body | 404 not-found-for-update | 409 conflict-on-seed | 503 service-error
```

The exact body shape and response envelope are build-session discretion within the constraint that the route ultimately calls `seedAccreditation` or `updateAccreditation`.

### R-rule engagement

R0 (the write-path is what makes the credential persistent; this is the surface that produces the long-term audit trail); R4 (the library + route are write surfaces; they do not return any field the existing read endpoint doesn't already expose — R4 boundary unchanged); R18a (the route is the surface that writes the Character Kernel credential to the persistence layer; no change to category language); R18c (additive — the new POST surface coexists with the existing GET; third-party readers are unaffected); R20 (NOT engaged — no distress surface, no R20a perimeter touch); AC5 (NOT engaged — no R20a perimeter change); AC7 (ENGAGED at build session — new auth surface; Critical Change Protocol applies); AC8 (translation-sandwich substrate — the library consumes the wrapper's output via the persistence layer); KG1 (engaged at build session — await all writes; no self-calls between route and library; no fire-and-forget); KG7 (engaged — passions_persisting passes through as an array per the existing persistence layer's discipline).

### Layer 1 implication

None. The write-path is server-side persistence orchestration; `Layer1Schema` is unchanged.

---

## Decision B — Write trigger

### Why

If a wrapper consumer holds a `CarriedProfile` advanced by `computeTrajectory`, when should it call the write surface? Every action accumulation? Every grade transition? Only when explicitly asked? The trigger choice determines write volume, audit fidelity, and consumer responsibility.

### Elected position

**Hybrid — explicit `persistAccreditation`-style call (via `seedAccreditation` / `updateAccreditation` per Decision D) for the main row write, with grade-transition events automatically emitting `appendGradeHistory` inside the same call's flow.** The wrapper consumer decides *when* to persist; the library decides *what audit entries to write* based on the supplied `TransitionResult`.

### Why this and not the alternatives

The trigger question had four candidate answers:

- **(a) On every `computeTrajectory` call.** Every action eventually persists. Rejected because computeTrajectory is currently pure and called freely; persisting on every call would multiply write volume by the rate of trajectory computations (which Component 5's iteration patterns invoke per step). Imposes a cost/latency tax the consumer can't avoid.
- **(b) On grade transition only.** Writes only when `evaluateGradeTransition` yields a non-no-op. Rejected because the row would update only on grade change, leaving `actions_evaluated` and `last_evaluation` drifting between transitions — the read endpoint would serve stale counts. The audit trail would be clean but the row would lie.
- **(c) On explicit `persistAccreditation` call alone.** Wrapper consumer decides *everything*, including whether grade history gets written. Rejected because the audit trail is load-bearing for R0 (oikeiosis audit trail) and R18b (badge transparency); leaving its population entirely to consumer discipline is too fragile.
- **(d) Hybrid — explicit call for the main row, automatic grade-history append inside the call's flow.** *Adopted.* The consumer decides *when* to persist (so cadence is consumer-controlled); the library decides *what audit entries to write* based on the supplied `TransitionResult` (so the audit trail stays canonical). `seedAccreditation` automatically calls `appendInitialGradeHistory`; `updateAccreditation` automatically calls `appendGradeHistory` *if and only if* `transitionResult.grade_changed === true`.

### Structural constraint

`updateAccreditation` takes `TransitionResult` as a required argument — not the `CarriedProfile`'s prior state, not a recomputed snapshot. The library does not re-run `evaluateGradeTransition`; it consumes the result the wrapper consumer already has. This keeps the library deterministic given its inputs and avoids double-running the grade engine.

`seedAccreditation` does NOT take a `TransitionResult` (there is no transition on first-write — the entry is an `initial_grade` event, not a transition). The library always calls `appendInitialGradeHistory` after the upsert succeeds.

### R-rule engagement

R0 (the audit trail's automatic population is what makes the trail trustworthy as evidence); R4 (the library's automatic decision about which history function to call uses only the `TransitionResult` shape, which is itself R4-compliant — `grade_changed: boolean`, `record: AccreditationRecord`, `trigger: TransitionTrigger | null` — no internal thresholds cross); R18b (badge documentation eventually describes the audit trail's canonical population as part of the badge's transparency — no docs change this session).

### Layer 1 implication

None.

---

## Decision C — Auth model

### Why

The POST surface (Decision A) is externally callable. Without an auth check, anyone could write any agent's row. Even with no current users (per build-arc cache's governing note), a public POST endpoint that writes to a persistence layer must have an auth model from day one. The choice cascades into A10's design space.

### Elected position

**Agent_id-ownership check via a signed token.** The route validates that the caller controls the `agent_id` they're writing to, by checking a signed token in the request headers. The token issuance and verification mechanism is **A10 — per-agent credentials** (step 8 of the post-6b arc). This design names A10 as the dependency; the build session implements the auth surface in a shape that's ready to receive A10 tokens once A10 lands.

**Pre-A10 behaviour:** until A10 ships, the build session has discretion on one of three pre-A10 implementations (chosen at the build session's Step 1 design-decision gate, not locked here):

1. **Feature-flag gated** — the route returns 503 with a "writes not yet enabled" message until `SUBSTRATE_WRITE_PATH_ENABLED` env is set. The library remains callable by wrapper-internal consumers.
2. **Founder-only via service-role** — the route accepts a `Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}` header for the founder's tooling. Switches to A10 tokens when A10 lands.
3. **Founder-only via shared secret** — a separate `ATL_WRITE_KEY` env var, narrower scope than the service-role key.

The build session's pre-A10 election is recorded in its decision-log entry. The design constraint here is only: *the route's long-term auth model is A10 agent_id-ownership tokens*. The pre-A10 stopgap is a build-session detail.

### Why this and not the alternatives

The auth question had four candidate answers:

- **(a) Internal-only (no external HTTP).** Rejected by Decision A — the route exists.
- **(b) Agent_id-ownership check (A10-shaped token).** *Adopted.* Cleanest long-term; parallels A10's per-agent credential model; scales to multi-agent ownership; the token-issuance story is A10's, which is sequenced immediately after this build session.
- **(c) Shared-secret header (X-Atl-Write-Key).** Rejected as the long-term model because it doesn't scale to multi-agent ownership (one secret writes any agent's row) and doesn't survive the move to external agent platforms. *Acceptable as a pre-A10 stopgap*, per the three discretion options above.
- **(d) Founder-only / no public write.** Rejected as the long-term model because the founder's intended use cases (external agent platforms; orchestrator dashboards) all require non-founder callers. *Acceptable as a pre-A10 stopgap*.

### Structural constraint

The build session implements the route's auth check as a single function call (e.g., `verifyAgentIdOwnership(request, agent_id)`) that returns a discriminated result (`{ ok: true, claims }` or `{ ok: false, reason }`). Pre-A10, the implementation of this function is the stopgap (per the three discretion options above). Post-A10, the function's body becomes the A10 token verification — same call signature, different internals. This is the A10-shaped seam.

The route returns 401 on a failed auth check with a non-leaking error message (the kathekon close's pattern: "Unauthorized." — no detail about *why* the auth failed).

### R-rule engagement

R4 (the auth failure response leaks no internal detail — same posture as the existing read endpoint's 503-on-Supabase-error pattern); R17 (the auth gate is the primary R17 engagement — agent profiles are not R17e-protected per the existing distinction, but writes to them still need authorization; the agent_id-ownership check enforces that *the right caller writes the right row*); R18a (the auth surface protects the Character Kernel credential's integrity — without it, the credential's binding to a specific agent_id is unverifiable); AC7 (ENGAGED at build session — new auth surface; Critical Change Protocol applies; full template + per-step protocol responses).

### Layer 1 implication

None.

### Deferred under PR7

- **A10 — per-agent credentials.** Step 8 of the post-6b arc. This design names the dependency; the build session ships with a pre-A10 stopgap. Revisit condition: A10 build session kicks off, OR the pre-A10 stopgap proves inadequate for an immediate use case.
- **Token format ADR (per the build-arc cache's open-question parking lot, Q4 refined under ST2 — JWT / W3C VC / hybrid).** Sequenced inside A10's design, not this one.

---

## Decision D — Initial-seed vs trajectory-update separation

### Why

The persistence layer exposes `upsertAccreditationRecord`, `appendGradeHistory`, and `appendInitialGradeHistory` as separate functions. A wrapper consumer with a `CarriedProfile` could be in one of two states: first-write (no row exists yet for this agent_id) or update (row exists; the wrapper has computed a new trajectory). The library's entry-point surface must accommodate both.

### Elected position

**Two entry points: `seedAccreditation(profile)` and `updateAccreditation(profile, transitionResult)`.** The consumer chooses which to call based on whether the agent's row is being created or updated. Matches the existing four-function persistence layer's explicit separation. No magic; no lookup; no consumer-passed flag.

### Why this and not the alternatives

The separation question had three candidate answers:

- **(a) Lookup-first (single function).** The function looks up the existing row and decides; idempotent on either call. Rejected because it adds a guaranteed extra read on every write (slower; more Supabase round-trips); the persistence layer's three functions are already distinct and explicit — collapsing them into one library function with internal branching obscures the operation rather than simplifying it.
- **(b) One entry point with a consumer-driven flag.** Single `persist(profile, { isInitial })` where the consumer passes the flag. Rejected because consumer-passed flags are a known footgun (consumers forget the flag; consumers pass `isInitial: true` on an update by mistake; the function can't tell the difference); the two-function shape makes the contract impossible to misuse.
- **(c) Two entry points (`seedAccreditation` + `updateAccreditation`).** *Adopted.* Explicit; matches the persistence layer's separation; consumer's intent is encoded in the function name; the route's POST body can carry a `kind: 'seed' | 'update'` discriminator that maps 1:1 to the library function.

### Structural constraint

`seedAccreditation(profile)` calls (in order):
1. `upsertAccreditationRecord(profile.accreditation_record, { tier, regressing_check_count })`
2. `appendInitialGradeHistory(profile.accreditation_record)`

`updateAccreditation(profile, transitionResult)` calls (in order):
1. `upsertAccreditationRecord(transitionResult.record, { tier, regressing_check_count: profile.regressing_check_count })`
2. If `transitionResult.grade_changed === true` AND `transitionResult.trigger !== null`: build a `GradeChangeEvent` from `transitionResult.trigger` and call `appendGradeHistory(event)`.

The exact `GradeChangeEvent` construction inside `updateAccreditation` follows the existing `buildGradeChangeEvent` function in `/website/src/lib/substrate/trust-layer/grade-engine/grade-transition-engine.ts` (or wherever the build session locates it). If `buildGradeChangeEvent` doesn't already exist as an exportable function, the build session may add it or inline-construct the event — build-session discretion.

### R-rule engagement

R0 (the two-entry-point shape mirrors the audit trail's natural structure: `initial_grade` rows vs `grade_upgrade` / `grade_downgrade` rows); R4 (no internal thresholds cross; the library only routes existing R4-compliant fields).

### Layer 1 implication

None.

---

## Decision E — Atomicity

### Why

`seedAccreditation` and `updateAccreditation` each do two writes (Decision D): an upsert to `agent_accreditation` followed by an insert into `grade_history`. If the first succeeds and the second fails, the state and the audit trail diverge. The atomicity guarantee determines what divergence is possible.

### Elected position

**Two awaited writes; not transactional.** The upsert runs first and is awaited; on success, the history append runs and is awaited. A failure between them leaves the state row written but the corresponding history row missing. The state remains correct (the credential is intact); the audit trail is one entry behind.

### Why this and not the alternatives

The atomicity question had three candidate answers:

- **(a) Two awaited writes; not transactional.** *Adopted.* Simplest; no new SQL function; uses the persistence layer's existing async functions as-is; the failure mode (state ahead of history) is forensic-friendly because the *state* — the read-endpoint-visible credential — is correct. The audit gap is detectable (compare `actions_evaluated` counts against `grade_history` row counts) and the build session's structured logging (Decision G) makes the gap loud rather than silent.
- **(b) Single Supabase RPC (transactional).** Wrap both writes in a Postgres function. Rejected for now because it introduces a new SQL function to write, version, and maintain; the persistence layer's four functions are already Verified; wrapping them in an RPC duplicates surface area. The transactional guarantee is genuinely useful but not load-bearing given (a)'s failure mode is recoverable.
- **(c) History-first then upsert.** Forensic-friendly forwards (history ahead of state). Rejected because it produces a "never-persisted" failure mode (history says a grade change happened; the state row says it didn't) which is harder to reason about than the inverse.

### Structural constraint

The build session implements the order as: `await upsertAccreditationRecord(...); await appendGradeHistory(...)` (or `appendInitialGradeHistory`). No `Promise.all`; no fire-and-forget; no try/catch swallowing — both calls throw on failure per the persistence layer's existing discipline (KG1 rule 2).

If the history append fails after the upsert succeeds, the error propagates to the caller. The caller (the route, or a wrapper-internal consumer) sees the error and can decide whether to retry the history append (the upsert was idempotent under Decision F; re-calling `seedAccreditation` or `updateAccreditation` would re-attempt the history append after a no-op upsert). The build session's structured logging (Decision G) records the failure event with enough context to support a retry.

### R-rule engagement

R0 (the audit trail's slight lag-tolerance is honest about what consistency the substrate provides; promising transactional atomicity would overpromise); R4 (no engine internals cross); KG1 rule 2 (both writes are awaited; errors throw and propagate).

### Layer 1 implication

None.

---

## Decision F — Idempotency

### Why

If the same write call runs twice — because of a retry, a duplicate consumer call, a network glitch causing a client to re-issue — the system must behave predictably. The idempotency guarantee determines what "predictable" means.

### Elected position

**Idempotent upsert.** `agent_accreditation`'s primary-key constraint and the persistence layer's `onConflict: 'agent_id'` discipline handle duplicate state writes correctly: the second call is a no-op-or-update against the same row. `grade_history` is append-only with no uniqueness constraint, so duplicate history calls produce duplicate rows; this is treated as acceptable (the audit trail is human-inspectable; duplicates are visible and a forensic signal of a retry; the duplicates do not corrupt the state).

### Why this and not the alternatives

The idempotency question had three candidate answers:

- **(a) Idempotent upsert.** *Adopted.* Simplest; uses the persistence layer's existing onConflict discipline; no schema change; the duplicate-history-row failure mode is benign (visible in the audit trail; does not affect the state read endpoint).
- **(b) Client-provided idempotency key.** The wrapper passes a UUID with each write call; a server-side constraint on `grade_history` rejects duplicates. Rejected because it requires a schema change (new column + unique constraint on `grade_history`); the wrapper consumer must generate and persist idempotency keys; the marginal benefit (no duplicate history rows) doesn't justify the schema + client-side complexity for the first write-path implementation.
- **(c) Content-hashed idempotency.** Server computes a hash of the record content; same-content writes are no-ops. Rejected because hashing depends on canonical serialisation (small format drift between calls produces different hashes for "the same" content); hard to reason about; over-engineered for the first implementation.

### Structural constraint

The build session adds no schema constraint to `grade_history`. The build session's structured logging (Decision G) makes duplicate history appends loud in the logs (the event includes a server timestamp and the calling agent_id, so duplicate-event detection is a log-query operation).

### R-rule engagement

R0 (the duplicate-history-row failure mode is honestly logged rather than silently deduplicated, so the audit trail's small inconsistencies are visible and investigable rather than hidden); R4 (no engine internals cross).

### Layer 1 implication

None.

---

## Decision G — Observability

### Why

When the write-path runs, the system should leave a record that's queryable by the operator (the founder, or future ops staff). The richer the observability, the easier debugging is; the heavier the observability, the higher the operational cost and the more decisions about retention, log format, and ingestion.

### Elected position

**Structured app-level logging.** Each write-path call emits one JSON event to `console.log` (Vercel logs captures it). The event includes the `agent_id`, the call type (`seed` or `update`), `actions_evaluated`, the `senecan_grade`, the `direction_of_travel`, the elapsed time, and the outcome (`ok` / `error: <message>`). For grade-changed updates, the event also includes the previous and new grades plus the trigger reason.

### Why this and not the alternatives

The observability question had four candidate answers:

- **(a) Structured app-level logging.** *Adopted.* Lightweight; debuggable; no schema change; Vercel logs already retain (per the Vercel project's retention policy); the JSON format is grep-friendly.
- **(b) Minimal.** Supabase logs writes; no app-level telemetry. Rejected because Supabase's write logs don't carry app-level context (the calling agent_id is visible because it's in the row; the call type and elapsed time are not; the grade-change reason is not). Debugging would require correlating Supabase logs with wrapper-side traces that don't exist yet.
- **(c) AC10 provenance fields on the row.** Add `write_source`, `write_timestamp`, `wrapper_version` columns. Rejected because it requires a schema migration (additive but not free); the richer audit trail is genuinely useful but premature for the first write-path implementation. Revisit condition: a forensic requirement surfaces.
- **(d) Emit GradeChangeEvent webhook payload.** Webhooks are downstream of a webhook-URL config surface that doesn't exist yet. Rejected for now; can be added in a follow-on session if a use case emerges (e.g., real-time dashboards consuming grade-change events).

### Structural constraint

The build session implements logging as a single helper function (e.g., `logWriteEvent(event)`) called at the end of each write-path call (after both awaited writes succeed) and at the catch-site of any failure (with the failure details). The helper formats the event as:

```json
{
  "kind": "atl_write",
  "call_type": "seed" | "update",
  "agent_id": "<the agent_id>",
  "actions_evaluated": <number>,
  "senecan_grade": "<grade>",
  "direction_of_travel": "<improving | stable | regressing>",
  "elapsed_ms": <number>,
  "outcome": "ok" | "error",
  "error_message": "<message if outcome=error>",
  "grade_changed": <boolean, present on call_type=update>,
  "previous_grade": "<grade>",
  "new_grade": "<grade>",
  "trigger_reason": "<TransitionTrigger | null>"
}
```

The exact field set is build-session discretion within the constraint that the event is queryable enough to support debugging a write failure or correlating a write event with downstream effects.

### R-rule engagement

R0 (structured logging is part of how the system's behaviour becomes inspectable evidence over time); R3 (logging avoids any PII surface — the event includes the `agent_id` which is wrapper-supplied; no human-identifying fields); R4 (the logged fields are R4-compliant — grade and direction-of-travel and elapsed time are all surface-level; no engine internals cross); R17 (the logged event does not include any intimate-data field — the agent profile is not R17e-protected, but the event still avoids field-level leakage of any sensitive payload).

### Layer 1 implication

None.

### Deferred under PR7

- **AC10 provenance fields on the row.** Revisit condition: forensic requirement surfaces (an audit finds the existing structured logs insufficient for a specific question — e.g., "which wrapper version wrote this row?").
- **GradeChangeEvent webhook emission.** Revisit condition: a real-time consumer use case surfaces (a dashboard wanting live grade-change events, or an external system needing notification).
- **OpenTelemetry instrumentation.** Out of scope for the first write-path; would join the observability surface only after a clear performance or distributed-tracing need surfaces.

---

## Build-session implementation summary (for the write-path build session)

The build session implements all seven decisions. Expected risk classification: **Critical** under 0d-ii (Decision A's route + Decision C's auth surface engage AC7; full Critical Change Protocol applies). PR1 single-build proof: the library + route + tests land in one session.

| File | Change |
|---|---|
| `/website/src/lib/substrate/atl-accreditation-writer.ts` (NEW) | Decisions A + B + D + E + F + G — the library: `seedAccreditation(profile)` and `updateAccreditation(profile, transitionResult)`; both call the persistence layer's existing functions in the elected order with the elected atomicity posture and the elected logging discipline. Filename build-session discretion. |
| `/website/src/app/api/accreditation/[agent_id]/route.ts` (MODIFIED) or sibling file (NEW) | Decisions A + C — POST handler added (or new sibling file with POST handler); body validation; auth gate (pre-A10 stopgap chosen at the build session's design-decision gate); calls the library's `seedAccreditation` or `updateAccreditation`; maps outcomes to HTTP status codes (200 ok / 401 unauthorized / 400 invalid-body / 404 not-found-for-update / 409 conflict-on-seed / 503 service-error). |
| `/website/src/lib/substrate/__tests__/atl-accreditation-writer.test.ts` (NEW) | Decisions B + D + E + F + G — library tests: seed path calls upsert + appendInitialGradeHistory; update path calls upsert + appendGradeHistory only when `grade_changed === true`; failure of history append after successful upsert propagates the error; idempotent re-calls produce the elected behaviour; structured logs emitted with the elected field set. PR2 build-to-wire immediate. |
| `/website/src/app/api/accreditation/[agent_id]/__tests__/route.test.ts` (MODIFIED) | Decisions A + C — POST handler tests: valid body + valid auth → 200; missing/invalid auth → 401; invalid body → 400; update against non-existent row → 404; seed against existing row → 409; library throw → 503. Existing GET tests unchanged. |
| `/website/src/lib/substrate/trust-layer/grade-engine/grade-transition-engine.ts` (POSSIBLE MODIFICATION) | Decision D — if `buildGradeChangeEvent` is not already an exported function, the build session may add an exportable version OR construct the event inline inside `updateAccreditation`. Build-session discretion. |
| Pre-A10 auth stopgap (one of three options per Decision C, build-session election) | If feature-flag gated: new env var `SUBSTRATE_WRITE_PATH_ENABLED` documented in deployment notes. If service-role or shared-secret: header check + 401 posture documented. |

Decisions A–G all produce direct file changes. Each is recorded in the build session's decision-log entry under `Reasoning`.

PR15 consult expected to mirror the design-pass's: `mcp-builder` is a forward pointer for R18c interoperability (the write surface could later also be exposed as an MCP tool), but the spec's named surface is a Next.js route; `frontend-design` / `doc-coauthoring` / `skill-creator` are wrong domain. Bespoke election expected to be justified in the build session's decision-log entry.

---

## Cross-references

- `/operations/decision-log.md` — `D-ATL-WRITE-PATH-DESIGN-LOCKED-2026-05-16` (this design's adoption record).
- `/operations/handoffs/founder/2026-05-16-write-path-design-pass-close.md` — this session's close.
- `/operations/handoffs/founder/2026-05-16-kathekon-aligned-alternative-build-close.md` — immediate predecessor session close.
- `/operations/handoffs/founder/2026-05-15-post-build-brainstorm-close.md` — sequencing source (step 7 of 8 in the post-6b arc).
- `/adopted/atl-kathekon-aligned-alternative-design.md` — structural template (seven-decision design-pass shape mirrored here).
- `/adopted/atl-items-1-3-design.md` — earlier structural precedent (Decision A pattern source).
- `/adopted/substrate-modes/agent-trust-layer-wrapper-spec.md` — the Wrapper spec; especially §"Component 3 — The Badge / Accreditation" + §"R-rule engagement" + §"Open questions".
- `/adopted/adr/2026-05-12-substrate-category-character-kernel.md` — J1 ADR (Character Kernel category language; preserved by this design — no change at the credential level).
- `/website/src/lib/substrate/atl-accreditation-store.ts` — the persistence layer (Verified; the write-path's call target).
- `/website/src/lib/substrate/atl-wrapper.ts` — the wrapper (pure; produces the `CarriedProfile` + `TransitionResult` the write-path consumes).
- `/website/src/lib/substrate/trust-layer/grade-engine/grade-transition-engine.ts` — `evaluateGradeTransition`'s output shape (`TransitionResult`); possibly `buildGradeChangeEvent` if exported.
- `/website/src/app/api/accreditation/[agent_id]/route.ts` — the existing GET route (Live; unchanged by this design; possibly extended by the build session for POST).
- `/website/src/lib/substrate/trust-layer/accreditation/public-endpoint.ts` — `handleAccreditationLookup`'s design pattern (the precedent for any new `handleAccreditationWrite`-style handler).
- `/website/supabase-agent-accreditation-migration.sql` — the existing DDL (no migration this session).
- `/manifest.md` — R0 (the audit trail), R3 (disclaimer preserved), R4 (IP boundary preserved), R17 (auth gate is the primary engagement), R18a (Character Kernel credential's integrity protected by the auth gate), R18b (badge documentation), R18c (additive route), R18e (NOT engaged at write level), R20 (NOT engaged — no distress surface), AC5 (NOT engaged), AC7 (ENGAGED at build session — Critical), AC8 (translation-sandwich substrate), AC10 (provenance fields deferred under PR7), KG1 (Vercel rules engaged at build), KG7 (engaged on write path), PR1 (single-build proof), PR2 (build-to-wire immediate at the build session), PR6 (NOT engaged), PR7 (deferred items named — A10, token-format ADR, AC10 provenance, webhook emission, OpenTelemetry), PR10 (PEV loop — Plan is this design; Execute is the build session; Verify is the founder's local test + production verification), PR11 (inbox scan recorded — `/inbox/` empty), PR15 (Anthropic-primitive consult — `mcp-builder` forward pointer; bespoke election justified).

---

*End of design document. Status: Adopted 2026-05-16 (decision); Designed (implementation). The write-path build session opens against this document + `D-ATL-WRITE-PATH-DESIGN-LOCKED-2026-05-16` as the spec. After the build session lands, the post-6b arc closes with step 8 — A10 per-agent credentials — which fills the auth seam this design names in Decision C.*
