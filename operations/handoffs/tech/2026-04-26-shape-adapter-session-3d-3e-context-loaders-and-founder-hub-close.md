# Session Close — 26 April 2026 (Shape Adapter Sessions 3d + 3e — Context Loaders and Founder Hub: `practitioner-context.ts` (3d) and `/api/founder/hub/route.ts` (3e) migrated to `loadMentorProfileCanonical()` in a combined session)

**Stream:** tech
**Governing frame:** `/adopted/session-opening-protocol.md`
**Authority for the work:** `/compliance/ADR-Ring-2-01-shape-adapter.md` (Adopted 25 April 2026), §7 Session 3 + §12 Session 3 notes
**Tier read this session:** 1, 2, 3, 6, 8, 9 (every-session + KG governance scan + code)
**Risk classification across the session:** Elevated × 2 (per ADR §7 Session 3, one per sub-session). Pre-deploy `tsc` clean at three checkpoints (after each substantive edit). Two commits made on local `main` from the sandbox after a single `mcp__cowork__allow_cowork_file_delete` cleared the stale `.git/index.lock` — the revised D-LOCK-CLEANUP discipline succeeded under its primary path this session (5th recurrence of the lock; cleanup tool returned "File deletion is now enabled" rather than the "Could not find mount for path" error observed at Session 3c).

## Decisions Made

The session prompt anticipated 3 decisions for 3d and 4 for 3e. Empirical reads at session open changed the scope materially; three findings were surfaced and accepted before any code was written.

### Findings surfaced at session open (accepted)

1. **Finding 1 — `mentor-context-private.ts` cannot fully migrate this session (write-roundtrip dependency).** Both `loadMentorProfile()` calls in the file (lines 476, 513) live inside `setFounderFacts` and `appendFounderFactsNote`, which spread the loaded profile and pass it to `saveMentorProfile()` — still on `MentorProfileData` until ADR Session 4 (journal-pipeline write-side migration). Migrating only the read here would force an inverse adapter the ADR explicitly defers. Decision: leave both functions on legacy `loadMentorProfile()` this session; they retire together at Session 4. The other functions in `mentor-context-private.ts` either don't call `loadMentorProfile` (Supabase-direct queries) or take a profile parameter from the caller (`getRecentInteractionsAsSignals`).

2. **Finding 2 — The founder hub's surface is dramatically smaller than the prompt anticipated.** The hub has one `loadMentorProfile()` call (line 517). The result is used only at line 544 to pass `storedProfile?.profile` to `getRecentInteractionsAsSignals`. The hub itself does no direct field access on the profile and does not return profile-derived fields in its response body. Hub UI consumers (`founder-hub/page.tsx`, `private-mentor/page.tsx`) read conversation/message data only — no profile fields. Decisions 3e-1 (wire-contract) and 3e-3 (static fallback) are therefore N/A; Decision 3e-2 (field-access translation inside the hub) is "none". The migration is a one-line loader switch plus one signature change.

3. **Finding 3 — `getRecentInteractionsAsSignals` couples 3d and 3e.** The function lives in `mentor-context-private.ts` and is called only by the hub *and* the live private reflect route (`/api/mentor/private/reflect`). Migrating its signature to canonical-only would force the reflect route's migration too, but the reflect route is Session 4 — Critical, R20a perimeter, AC5 — explicitly out of scope this session. Decision: introduce a transitional structural type `ProfileForSignals` that both `MentorProfileData` and canonical `MentorProfile` satisfy; tighten to `MentorProfile | null` in Session 4 when the reflect route migrates. The function reads only `passion_map[].{root_passion, sub_species, frequency}` from the profile, so the structural minimum is honest about the actual coupling. Caught by `tsc --noEmit` after the first 3e edit attempt — the founder-hub-only signature change broke the reflect route at compile time. Pivot to the structural type was the correct resolution; the reflect route's call is unchanged this session.

### Decisions

**Sub-session 3d:**

1. **Decision 3d-1 — Field-access translation inside `practitioner-context.ts`.** Procedural confirmation. Translations applied per ADR §2.1/§2.2 across `buildCondensedContext`, `projectProfile`, `formatPassion`, `findWeakestVirtue`:
   - `proximity_estimate.{level,senecan_grade}` → `proximity_level` + `senecan_grade` (flat fields)
   - `virtue_profile` Record → `VirtueDomainAssessment[]` array iteration (`v.domain`, `v.strength`, `v.evidence` — replacing legacy `data.overall_strength`, `data.observations_count`, `data.evidence_summary[]`)
   - `causal_tendencies.{primary_breakdown,description}` Record → `CausalTendency[]` array; primary picked by frequency order (`common > occasional > rare`); read `failure_point` and `description` from picked entry
   - `value_hierarchy.{explicit_top_values,primary_conflict,classification_gaps}` Record → `ValueHierarchyEntry[]` array; top values derived from entries with `gap_detected === false`; gaps formatted from entries with `gap_detected === true`; legacy `primary_conflict` string has no canonical equivalent — surface first gap entry as the closest replacement signal in `buildCondensedContext`, drop the line in `projectProfile`'s decisions section
   - `oikeiosis_map` Record `[ring, {level, evidence}]` → `OikeioisMapEntry[]` array; iterate by `o.person_or_role`, `o.relationship`, `o.oikeiosis_stage`, `o.reflection_frequency` — legacy `level`/`evidence` fields have no direct canonical analogue
   - `passion_map[].false_judgements[]` (plural array) → `false_judgement` (singular string)
   - `passion_map[].frequency` (1–12 number) → bucket string (`'rare'|'occasional'|'recurring'|'persistent'`); sort changes from numeric (`b.frequency - a.frequency`) to fixed bucket order via `PASSION_BUCKET_ORDER` constant; legacy `freq ${n}/12` interpolation drops the `freq ` prefix and `/12` suffix
   - `passion_map[].max_intensity` and `sections_present` — no canonical equivalent; dropped from per-passion lines
   - `findWeakestVirtue` returns `{ name, strength }`: `name` ← `v.domain`; `strength` ← `v.strength`; the `strengthOrder` table values (`'gap' | 'developing' | 'moderate' | 'strong'`) match the canonical strength union one-for-one

2. **Decision 3d-2 — Static fallback in either context loader.** **N/A.** Neither file has a static fallback — both propagate `null` when the loader returns null.

3. **Decision 3d-3 — Commit shape.** Single commit migrating `practitioner-context.ts` only. `mentor-context-private.ts` not touched in 3d (Finding 1). `getRecentInteractionsAsSignals` signature unchanged in 3d (Finding 3 — moved to 3e). One file, one commit, one PR1 proof.

**Sub-session 3e:**

4. **Decision 3e-1 — Wire-contract for the hub response.** **N/A** per Finding 2. The hub returns no profile-derived fields (response body: `conversation_id`, `primary`, `observers`, `recommended_action`, `message_count` for POST; `conversations[]` or `{conversation, messages[]}` for GET). No client edits needed.

5. **Decision 3e-2 — Field-access translation inside the hub.** **None inside the hub itself.** The only translation is the `getRecentInteractionsAsSignals` signature change in `mentor-context-private.ts` (file edit alongside the hub's loader switch). Resolved as the transitional structural type per Finding 3.

6. **Decision 3e-3 — Static fallback in the hub.** **N/A** — no static fallback in the hub.

7. **Decision 3e-4 — KG3 hub-label trace.** Trace done at session open. Client `hub_id` body field → `effectiveHubId` (line 1034) → `mapRequestHubToContextHub` (line 137) → mapped value passed to `recordInteraction` (writer) and `getMentorObservations`/`getProfileSnapshots`/`getRecentInteractionsAsSignals` (readers). Migration changes the loader, not any reader/writer label site. **No KG3 work required this session.**

8. **Decision 3e-5 (transitional type for `getRecentInteractionsAsSignals`).** Introduced under Finding 3. `ProfileForSignals = { passion_map: ReadonlyArray<{ root_passion: string; sub_species: string; frequency: string | number }> }`. Both legacy `MentorProfileData.passion_map[]` and canonical `MentorProfile.passion_map[]` satisfy this. Replaces `MentorProfile | null` with `ProfileForSignals | null` for the function's parameter and replaces `PassionMapEntry[]` with `ProfileForSignals['passion_map']` for the helper `rowToSignal`'s parameter. Retires in Session 4 when the reflect route migrates and only canonical remains. The "freq " prefix in the pattern-match output line was dropped to read naturally with the canonical bucket-string frequency.

### Additional session decisions

- **Path-depth confirmed at 4 segments.** Both `practitioner-context.ts` and `mentor-context-private.ts` are at `/website/src/lib/context/<file>.ts`. Type-only import path: `'../../../../sage-mentor'` (4 segments — verified empirically against the resolved import at compile time, `tsc --noEmit` exit 0). The founder hub's path-depth was confirmed at 6 segments earlier in the migration; the hub's existing `await import('../../../../../../sage-mentor/profile-store')` on line 1242 was the empirical anchor.
- **C-α posture preserved.** Canonical `MentorProfile` type unchanged this session. Session 2 did the type extension; Session 3 sub-sessions execute consumer migrations.
- **Sage-mentor encapsulation preserved.** Zero new imports from `/sage-mentor/` into `/website/` beyond what Session 2 established. The new type-only imports added this session (`MentorProfile`, `PassionMapEntry`, `CausalTendency`) are all declared in `/sage-mentor/persona.ts` and re-exported via the package's `index.ts`.
- **AC7 (Session 7b standing constraint) confirmed at three checkpoints** (session open, plan walk, both commits). No change to authentication, cookie scope, session validation, or domain-redirect behaviour. AC7 not engaged.
- **Two write-roundtrip functions in `mentor-context-private.ts` explicitly out of scope.** `setFounderFacts` (line 472) and `appendFounderFactsNote` (line 509) continue to call `loadMentorProfile()` and `saveMentorProfile()` with `MentorProfileData`. They retire alongside the journal-pipeline write-side migration in ADR Session 4 (Critical). The file's existing `MentorProfileData` and `FounderFacts` imports remain.
- **Reflect route explicitly out of scope.** `/api/mentor/private/reflect` continues on legacy `loadMentorProfile()` and the new transitional `ProfileForSignals` parameter (which legacy `MentorProfileData` satisfies). Session 4 retires this together with the live-reflect Critical work.

## Status Changes

| Item | Old status | New status |
|---|---|---|
| `/website/src/lib/context/practitioner-context.ts` | Live (legacy `loadMentorProfile()` at 3 call sites) | **Live** (fully migrated — `loadMentorProfileCanonical()` at all 3 call sites; `buildCondensedContext`, `projectProfile`, `formatPassion`, `findWeakestVirtue` consume canonical `MentorProfile`) — PR1 proof for sub-session 3d |
| `/website/src/app/api/founder/hub/route.ts` | Live (no shim — uses legacy `loadMentorProfile()` directly at line 517) | **Live** (fully migrated — `loadMentorProfileCanonical()` at line 517; the loaded profile flows only into `getRecentInteractionsAsSignals` which now accepts the transitional structural type) — PR1 proof for sub-session 3e |
| `/website/src/lib/context/mentor-context-private.ts` | Live (`getRecentInteractionsAsSignals` parameter type: `MentorProfileData \| null`) | **Live (partially migrated)** — `getRecentInteractionsAsSignals` parameter type now `ProfileForSignals \| null` (transitional structural type satisfied by both legacy and canonical shapes); `rowToSignal` helper signature updated; "freq " prefix dropped on pattern-match output. **`setFounderFacts` and `appendFounderFactsNote` unchanged** — still call legacy `loadMentorProfile()` + `saveMentorProfile()` (write-roundtrip dependency, retires Session 4) |
| Wire contract: `/api/founder/hub` POST and GET response bodies | Live (no profile-derived fields) | **Live (unchanged)** — Decisions 3e-1, 3e-3 are N/A (audit-driven) |
| Wire contract: prompt-injected practitioner-context strings (consumed by 11 routes — score, score-decision, score-document, score-scenario, score-social, reason, reflect, mentor/private/reflect, sage-classify, sage-prioritise, founder/hub) | Live | **Live** — function signatures unchanged at the public surface (still `Promise<string \| null>`); content of the injected strings now derives from canonical fields (per-passion line dropped `/12` suffix; oikeiosis lines use canonical schema; virtue-profile lines use canonical evidence string) |
| KG3 hub-label flow | Live | **Live (unchanged)** — `mapRequestHubToContextHub` boundary, all reader/writer call sites untouched |
| `ProfileForSignals` transitional type (introduced this session) | — | **Scaffolded → Live** — defined in `mentor-context-private.ts`; consumed by `getRecentInteractionsAsSignals` and `rowToSignal`; retires in Session 4 when reflect route migrates |
| ADR-Ring-2-01 Session 3d (`practitioner-context.ts`) | Adopted (planned) | **Verified (pending founder live-probe of commit `fbe12d5`)** |
| ADR-Ring-2-01 Session 3e (founder hub + signal helper signature) | Adopted (planned) | **Verified (pending founder live-probe of commit `95c40db`)** |
| `/api/mentor/private/reflect/route.ts` | Live (legacy `loadMentorProfile()`, R20a perimeter, AC5) | **Live (unchanged)** — awaits Session 4 (Critical) |
| `MentorProfileData` (legacy type) | Live (unchanged — retires Session 5) | **Live (unchanged — retires Session 5)** — still imported by 4 files: `mentor-profile-summary.ts` (defines), `mentor-profile-store.ts` (legacy loader/saver), `mentor-profile-adapter.ts` (legacy→canonical adapter), `mentor-profile/route.ts` POST handler, `mentor-context-private.ts` (write-roundtrip pair) |
| `loadMentorProfile()` (legacy) | Live (unchanged — retires Session 5) | **Live (unchanged — retires Session 5)** — still called by 3 sites: `/api/mentor/private/reflect`, `setFounderFacts`, `appendFounderFactsNote` |
| `loadMentorProfileCanonical()` (canonical) | Live (used by 4 callers as of Session 3c) | **Live** (used by 6 callers post-3d/3e: ring proof, public baseline, private baseline, mentor-profile GET, practitioner-context (×3), founder hub) |
| `MentorProfile` (canonical) | Live (16 required + 7 optional fields) | **Live (unchanged)** |
| Push posture | Sandbox commit + push fails (6th observation, Session 3c close) | **Sandbox commit succeeded both times this session** after one `allow_cowork_file_delete` call cleared the lock. Push remains a host-side step via GitHub Desktop (PR8 unchanged). |
| Stale-lock cleanup discipline | Failed under proposed text at Session 3c (cleanup tool returned "Could not find mount for path") | **Succeeded under revised text this session** (5th recurrence overall, 1st under revised text). The `mcp__cowork__allow_cowork_file_delete` call returned "File deletion is now enabled for the 'sagereasoning' folder"; subsequent `rm -f .git/index.lock` from the sandbox cleared the lock; commit landed cleanly. The revised D-LOCK-CLEANUP text is supported by this evidence; recommend formal adoption next session — see Open Questions O-3DE-D. |

## What Was Changed

| File | Action | Notes |
|---|---|---|
| `website/src/lib/context/practitioner-context.ts` | Edited (full migration of all 3 read-side context-builders) | Imports: dropped `MentorProfileData, PassionMapEntry` from `@/lib/mentor-profile-summary`; switched `loadMentorProfile` → `loadMentorProfileCanonical`; added `import type { CausalTendency, MentorProfile, PassionMapEntry } from '../../../../sage-mentor'` (4 segments). Added `PASSION_BUCKET_ORDER` and `CAUSAL_FREQ_ORDER` constants for canonical sorts. All 3 call sites switched. Type annotations on `buildCondensedContext`, `projectProfile`, `formatPassion`, `findWeakestVirtue` updated to canonical. Field-access translations applied per Decision 3d-1. Docstring expanded with the translation table. |
| `website/src/lib/context/mentor-context-private.ts` | Edited (transitional structural type + `getRecentInteractionsAsSignals` signature + `rowToSignal` signature + output formatting) | Imports: dropped `PassionMapEntry` from `@/lib/mentor-profile-summary` line (kept `FounderFacts, MentorProfileData`). Added `ProfileForSignals` type definition near the top of the file with full migration-context docstring naming Session 4 retirement condition. `getRecentInteractionsAsSignals` parameter retyped from `MentorProfileData \| null` → `ProfileForSignals \| null` with updated docstring. `rowToSignal` parameter retyped from `PassionMapEntry[]` → `ProfileForSignals['passion_map']`. Pattern-match output line dropped legacy "freq " prefix. **`setFounderFacts`, `appendFounderFactsNote`, and the legacy imports they depend on are unchanged** (write-roundtrip retires Session 4). |
| `website/src/app/api/founder/hub/route.ts` | Edited (loader import + 1 call site + inline migration note) | Import line 46 expanded to a comment block + `loadMentorProfileCanonical` import — names that the loaded profile flows only into `getRecentInteractionsAsSignals`, that the hub does no direct field access, that the hub returns no profile-derived response fields, that `mapRequestHubToContextHub` is unchanged (KG3), and that only `/api/mentor/private/reflect` (Session 4) remains before Session 5. Loader call at line 517 switched. Inline comment on the `Promise.all` block names that `storedProfile.profile` is now canonical and matches the migrated parameter type. |
| `website/tsconfig.tsbuildinfo` | Edited (build artefact) | Regenerated by `tsc --noEmit` at each checkpoint. |

**Total diff (cumulative across both commits):**
- Commit `fbe12d5` (Session 3d): 2 files changed, 153 insertions(+), 55 deletions(-)
- Commit `95c40db` (Session 3e): 3 files changed, 65 insertions(+), 8 deletions(-)
- Cumulative: 4 distinct files changed, 218 insertions(+), 63 deletions(-).

### Files NOT changed
- All distress classifier code (`r20a-classifier.ts`, `constraints.ts` SafetyGate) — untouched. R20a/AC5 perimeter unaffected.
- All sage-mentor runtime files — unchanged.
- `/api/mentor/ring/proof` (Session 1's PR1 proof) — unchanged.
- `/api/mentor-baseline-response/route.ts` — unchanged (Session 3b's already-migrated counterpart).
- `/api/mentor/private/baseline-response/route.ts` — unchanged (Session 3-follow-up's already-migrated counterpart).
- `/api/mentor-profile/route.ts` — unchanged (Session 3c's already-migrated counterpart).
- `mentor-profile-store.ts` — unchanged. Both `loadMentorProfile` and `loadMentorProfileCanonical` continue to coexist.
- `mentor-profile-summary.ts` — unchanged. `buildProfileSummary` already canonical-consuming since Session 3a.
- `mentor-profile-adapter.ts` — unchanged.
- `/api/mentor/private/reflect/route.ts` — unchanged. (Session 4 — Critical, R20a perimeter, AC5.)
- `setFounderFacts`, `appendFounderFactsNote` — unchanged (write-roundtrip; retire Session 4 alongside the journal pipeline write-side migration).
- The encryption pipeline — unchanged.
- Database schema or rows — unchanged. **No DB changes. No SQL. No DDL. No env vars added. No safety-critical files modified.**
- Hub UI consumers (`founder-hub/page.tsx`, `private-mentor/page.tsx`) — unchanged.

## Verification Method Used (0c Framework)

Per `/operations/verification-framework.md`:

- **Pre-deploy: TypeScript clean — three checkpoints.**
  - Checkpoint 1 (after 3d edits): `npx tsc --noEmit` in `/website/` exit 0. Build green.
  - Checkpoint 2 (after first 3e edit attempt): **`tsc` reported the error** `src/app/api/mentor/private/reflect/route.ts(210,11): error TS2345: Argument of type 'MentorProfileData | null' is not assignable to parameter of type 'MentorProfile | null'`. This is the value of immediate verification (PR2) — the reflect-route coupling was caught before any commit, surfaced as Finding 3, and resolved with the `ProfileForSignals` transitional type.
  - Checkpoint 3 (after the structural-type fix): `npx tsc --noEmit` exit 0. Build green.
- **Sandbox commit: succeeded both times this session.** First commit (`fbe12d5` for 3d) blocked initially by stale `.git/index.lock` (6th recurrence overall); cleared with one `mcp__cowork__allow_cowork_file_delete` call ("File deletion is now enabled for the 'sagereasoning' folder") and one `rm -f`. Second commit (`95c40db` for 3e) made cleanly without further lock contention. Both commits ran the project's pre-commit hooks (`Pre-commit: TypeScript compilation check...` + `Pre-commit: ESLint safety-critical modules...`) — both passed.
- **Caller-side audit (Findings 1, 2, 3 evidence).** Three greps before any code:
  1. `grep loadMentorProfile website/src/lib/context/*.ts website/src/app/api/founder/hub/route.ts` — enumerated all call sites and revealed the write-roundtrip pair (Finding 1).
  2. `grep -rn "founder/hub" website/src` and `grep -rn "fetch(.*founder/hub" website/src` — enumerated all hub consumers; confirmed no profile-derived field reads from any client (Finding 2).
  3. `grep -rn "getRecentInteractionsAsSignals" website/src` — enumerated all callers (the hub *and* the reflect route), revealing the cross-coupling (Finding 3).
- **Path-depth verification.** Empirical `tsc --noEmit` exit 0 confirmed `'../../../../sage-mentor'` (4 segments) resolves correctly from `/website/src/lib/context/<file>.ts`.
- **Post-deploy verification — pending founder live-probe.** Pass criteria below.

| Criterion | Expected | Verification |
|---|---|---|
| Vercel deploys both commits | `Ready` against `95c40db` (latest) at the top of the deployment list | Founder check |
| Founder hub mentor flow round-trips successfully | A response from the mentor agent with no error in the UI | Founder live-probe (exercises 3d and 3e together — see snippet under Founder Verification) |
| Public score flow round-trips successfully (3d's read-side migration on the public surface) | A response from `/api/score-decision` (or any R20a-perimeter route the founder uses) with no 500 | Founder live-probe (optional but recommended — see snippet) |
| Server logs (Vercel) | No errors during the request | Founder check (optional) |
| `mentor_interactions` writes still scoped under the correct `hub_id` (KG3 sanity) | One new row written under `hub_id = 'founder-mentor'` after a hub-mentor message | Founder check (optional) |

**Why this verification is sufficient.** The hub-mentor end-to-end path exercises both sub-sessions:
- 3d: `getFullPractitionerContext(userId)` (or `getProjectedPractitionerContext` if `MENTOR_CONTEXT_V2` is on) — both are migrated to `loadMentorProfileCanonical`. The injected practitioner-context string flows into the mentor's user message.
- 3e: `loadMentorProfileCanonical(userId)` — only when `MENTOR_CONTEXT_V2` is on. The result feeds `getRecentInteractionsAsSignals` which now accepts the transitional structural type. If `MENTOR_CONTEXT_V2` is off, the hub still loads via `loadMentorProfileCanonical` in the projected branch but the result resolves to `null`.

A regression in either sub-session would surface as either a 500 from the hub (loader/parse error) or a TypeScript failure that would have stopped the Vercel build at deploy time (Vercel runs `tsc` as part of its build — the deployment would not have reached `Ready`). The pre-deploy local `tsc --noEmit` passes are belt-and-braces against the same risk class.

## Risk Classification Record (0d-ii)

- **Sub-session 3d — Elevated.** Production request path. `practitioner-context.ts`'s exported functions are consumed by all 8 R20a-perimeter routes plus the founder hub plus 2 sage-skill routes plus `score-conversation` plus `score-iterate`. A regression would manifest as a 500 from any of those routes or as a malformed practitioner-context block injected into LLM prompts. Mitigations: TypeScript caught all internal field-access mistranslations at compile time; the exported function signatures are unchanged (still `Promise<string \| null>`); the canonical fields read by these helpers all exist on canonical `MentorProfile` (verified by reading `/sage-mentor/persona.ts`); Sessions 1, 3b, 3-follow-up, and 3c verified the same canonical loader on production paths.
- **Sub-session 3e — Elevated.** Production request path on the founder hub. Single loader switch + signature widening on a helper. Mitigations: the hub does no direct field access on the loaded profile; the response body returns no profile-derived fields (audit-confirmed); the structural-type widening on `getRecentInteractionsAsSignals` is non-breaking for both call sites (founder hub passes canonical post-3e; reflect route passes legacy unchanged).
- **`ProfileForSignals` transitional type — Standard.** Type-level only; no runtime change. Retires in Session 4 when only canonical remains.
- **Wire-contract changes — None.** Decisions 3e-1, 3e-3 are N/A (Finding 2). The injected practitioner-context *strings* changed in content (per ADR §2.1/§2.2 translations) but are consumed by LLMs as natural-language prompt material, not by code that pattern-matches the legacy schema. No machine-readable wire contract is altered.
- **Encryption-pipeline interaction — none.** No file under R17b touched. `loadMentorProfileCanonical` continues to encrypt/decrypt as before; the canonical adapter operates on plaintext post-decryption, pre-return — unchanged from Session 1's posture.
- **AC7 — not engaged.** No auth, cookie scope, session validation, or domain-redirect change. Confirmed at three checkpoints. Diff inspection on both commits confirmed only the targeted lines + comments + the build artefact changed.
- **PR6 — not engaged.** No safety-critical surface modified. Distress classifier, Zone 2/3 logic, encryption pipeline, session, access control, deletion, and deployment-config all untouched. Confirmed by reading the files at session open: neither `practitioner-context.ts` nor `mentor-context-private.ts` nor `/api/founder/hub/route.ts` invokes `enforceDistressCheck` or `detectDistressTwoStage`. The hub is not in the AC5 R20a perimeter (which is `/api/mentor/private/reflect` and the seven other POST routes enumerated in `r20a-invocation-guard.test.ts`). Safety perimeter unaffected.

## PR5 — Knowledge-Gap Carry-Forward

No re-explanations this session. Existing entries scanned and respected:

- **KG1 (Vercel rules):** respected. The hub remains async; no fire-and-forget added; no self-call introduced; no header-stripping concern; no execution-after-response. No `process.cwd()` change. The migrated context-builders' existing await-on-loader behaviour preserved.
- **KG2 (Haiku boundary):** respected. The two context loaders have no LLM in path (pure string-builders). The founder hub invokes Sonnet for the primary mentor response and Opus for the Ask-the-Org synthesis (lines 578, 854) and Haiku for the observer contributions and the structured-observation extraction (lines 622, 678, 1274) — no model-selection changes this session. AC1's "Haiku only for single-mechanism, short-output, simple-JSON" is honoured (the Haiku calls produce <512 token JSON outputs).
- **KG3 (hub-label consistency):** respected. The `mapRequestHubToContextHub` boundary, all `mentor_interactions` writers and readers, and the hub-id flow from client → writer → reader are unchanged. No KG3 work required (Decision 3e-4).
- **KG6 (composition order):** respected. The two context-builders return strings that compose into the user-message side per AC6 L2b. The hub's enriched-message assembly (lines 521–565) preserves the same order. No layer placement changed.
- **KG7 (JSONB shape):** not relevant — no JSONB read or write modified.

**Cumulative re-explanation count:** zero. Knowledge-gaps register unchanged.

**Observation candidates updated:**

1. **Sandbox cannot push to GitHub.** **7th occurrence overall** (1st Session 1 close → 6th Session 3c close → 7th this session). Already at promotion threshold per PR8; the proposed D-PR8-PUSH (Session 3a close, text revised at Session 3c close) remains pending founder approval.

2. **Sandbox stale `.git/index.lock` after host-side activity.** **6th occurrence overall** (1st Session 2 close → 5th Session 3c close → 6th this session). **The discipline named in proposed D-LOCK-CLEANUP (revised at Session 3c close) SUCCEEDED here under its primary path**: `mcp__cowork__allow_cowork_file_delete` returned "File deletion is now enabled for the 'sagereasoning' folder" rather than the "Could not find mount for path" error observed at Session 3c. Subsequent sandbox `rm -f .git/index.lock` cleared the lock; commit landed cleanly. The host-side fallback (close GitHub Desktop or `rm` from Terminal) was not needed this session. The revised text is supported by this evidence — recommend formal adoption next session.

## Founder Verification (Between Sessions)

You verify this session by completing four steps. Pushing both commits is one push (badge will show 2).

### Step 1 — Push commits `fbe12d5` and `95c40db` via GitHub Desktop

The sandbox cannot push (PR8). One push covers both commits.

1. Open **GitHub Desktop**.
2. Top-left, confirm **Current Repository** = `sagereasoning`.
3. Top-right, click **Push origin**. The badge shows `2` (one for each commit).
4. Wait for the spinner to finish.

### Step 2 — Confirm Vercel deployed `95c40db`

Open the Vercel dashboard. The latest deployment should show:
- Commit: `95c40db ADR-Ring-2-01 Session 3e: migrate /api/founder/hub to loadMentorProfileCanonical`
- Status: `Ready`

If the deployment fails, do not attempt to fix it — tell me what the error says.

### Step 3 — Live-probe the founder hub mentor flow (verifies BOTH 3d and 3e)

Open `https://sagereasoning.com/founder-hub` in a browser. Sign in if not already.

Send any short message to the **mentor** agent (use the agent selector if there's a dropdown, otherwise send via the chat UI — same flow you use normally). For example:

> Quick check — please confirm you can read my context.

You should see:
- A normal mentor response (within ~10–20 seconds depending on the message).
- No error toast, no 500 banner.
- The response references some of your profile (proximity, persisting passions, growth edge, or similar) — confirming the practitioner-context block was injected and built without errors.

**This single test exercises:**
- 3d: `getFullPractitionerContext` (or `getProjectedPractitionerContext` if your `MENTOR_CONTEXT_V2` flag is on) — calls migrated to `loadMentorProfileCanonical()` and reads canonical fields.
- 3e: `loadMentorProfileCanonical(userId)` at the hub's own line 517 (only if `MENTOR_CONTEXT_V2` is on; otherwise the canonical loader still runs through `getFullPractitionerContext`).
- 3e: `getRecentInteractionsAsSignals` accepting the transitional structural type.

**If the response arrives normally: Sessions 3d and 3e are Verified.** Tell me "verified" and I'll record both in the decision log next session.

**If the response errors out:**
- Tell me what you see in the UI — error message, toast, status code if visible.
- Do NOT attempt to fix it.
- Rollback for 3e only: `git revert 95c40db` then push via GitHub Desktop. This reverts only 3e, leaving 3d intact (the hub returns to legacy `loadMentorProfile`; the reflect route remains unchanged).
- Rollback for 3d only: `git revert fbe12d5` then push. Reverts only 3d. (If both need reverting, revert 3e first, then 3d.)
- Rollback for both: in GitHub Desktop's history view, revert each commit in turn (newest first), then push.

### Step 4 — (Optional) Public-side spot-check (3d only)

The hub is founder-only. To confirm 3d also works on the public surface, visit any signed-in route that scores or reflects — e.g., `https://sagereasoning.com/score-decision` (or whichever score page you typically use). Submit any decision to score. You should see a normal scored response. This exercises `getPractitionerContext` (3d-migrated) on the R20a perimeter.

If skipped, the founder hub probe alone is sufficient — `getFullPractitionerContext` shares the same loader switch and field-access translations as `getPractitionerContext`, so a working hub probe is strong evidence the public-side migration also works.

## Next Session Should

After this session, **the Session 3 series is one Critical session away from completion** (Session 4) and one Elevated session away from full retirement of the legacy code (Session 5). The combined 3d+3e session retired the last Elevated read-side migrations.

1. **Session 4 — Critical: live reflect endpoint + journal pipeline write-side migration.** Migrates `/api/mentor/private/reflect/route.ts` (R20a perimeter, AC5). Updates the journal-ingestion output stage to write canonical `MentorProfile` rather than `MentorProfileData`. Retires `setFounderFacts` and `appendFounderFactsNote`'s legacy `loadMentorProfile`/`saveMentorProfile` call pattern (because save-side now writes canonical). Tightens `ProfileForSignals` to `MentorProfile | null`. **Critical Change Protocol (0c-ii) in full** — affects the R20a perimeter and the encryption-pipeline write side. ADR §7 Session 4. Risk: Critical.

2. **Session 5 — legacy retirement.** Removes `loadMentorProfile()` and `MentorProfileData`. Renames `loadMentorProfileCanonical` → `loadMentorProfile`. `mentor-profile-summary.ts` retains `buildProfileSummary` (now canonical-consuming) or moves it. Reference comments updated. ADR §7 Session 5. Risk: Elevated.

3. **Optional Session 6 — persisted-row migration.** Decrypt → transform → re-encrypt every existing `mentor_profiles` row to canonical at rest. After this, the read-time adapter inside `loadMentorProfileCanonical` is removable. ADR §7 Session 6. Risk: Critical.

Plus all six pending decision-log entries (now seven with this session's two — see "Decision Log Entries — Proposed" below) need formal adoption at next session open.

## Blocked On

- **Founder push** of commits `fbe12d5` and `95c40db` via GitHub Desktop (one push, badge = 2).
- **Founder live-probe** of the founder hub mentor flow confirming Sessions 3d and 3e are Verified.

## Open Questions

- **O-3DE-A — D-RING-2-S3a still pending decision-log adoption.** Carried from Session 3a close. Approve at next session open.
- **O-3DE-B — D-RING-2-S3b still pending decision-log adoption.** Carried from Session 3b close. Approve at next session open.
- **O-3DE-C — D-RING-2-S3-PRIVATE-FULL still pending decision-log adoption.** Carried from Session 3-follow-up close. Approve at next session open.
- **O-3DE-D — D-LOCK-CLEANUP needs formal adoption now that the revised text is supported by evidence.** The revised wording from Session 3c close (try `mcp__cowork__allow_cowork_file_delete` first; if it returns "Could not find mount for path", surface "This is a limitation" and ask the founder for host-side help) succeeded under its primary path this session — 6th recurrence, 1st under revised text. The proposed text from Session 3c is appropriate; recommend formal adoption next session open.
- **O-3DE-E — D-PR8-PUSH still pending decision-log adoption.** Carried from Session 3a close (text revised at Session 3c close). 7th recurrence this session; well past threshold. Approve revised text at next session open.
- **O-3DE-F — D-RING-2-S3C-MENTOR-PROFILE-GET still pending decision-log adoption.** Carried from Session 3c close. Approve at next session open.
- **O-3DE-G — `ProfileForSignals` transitional type retirement condition.** Defined this session as Session 4 (when `/api/mentor/private/reflect` migrates and only canonical remains). Inline comment in `mentor-context-private.ts` names this. Surfaced at Session 4 open as the first cleanup item.
- **O-3DE-H — `setFounderFacts` and `appendFounderFactsNote` retirement condition.** Both call legacy `loadMentorProfile()` + `saveMentorProfile()` because the save side still consumes `MentorProfileData`. Retires when Session 4's journal-pipeline write-side migration lands (`saveMentorProfile` becomes canonical-consuming or is replaced). Inline comment in `mentor-context-private.ts` names this. Surfaced at Session 4 open as the second cleanup item.

## Process-Rule Citations

- **PR1** — respected. Two single-endpoint proofs this session (3d on `practitioner-context.ts`; 3e on `/api/founder/hub/route.ts`). Each is its own PR1 proof. Each `tsc` checkpoint cleared exit 0 before the founder is asked to push.
- **PR2** — respected. Verification immediate. Three `tsc --noEmit` checkpoints across the session. Live-probe queued for the founder same-deploy. Critically: the second `tsc` checkpoint surfaced the reflect-route coupling (Finding 3) before any commit — this is the value of immediate verification.
- **PR3** — respected. No async behaviour added. Both context-builder files and the hub remain async; loader switches preserve that posture. No fire-and-forget introduced.
- **PR4** — respected. No model selection in `practitioner-context.ts`'s migration (no LLM in path). The hub's existing model selections (Sonnet for primary, Opus for synthesis, Haiku for observers and extractors) are unchanged. AC1 thresholds honoured.
- **PR5** — respected. No re-explanations. Two existing observation candidates updated (sandbox push 7th recurrence; stale-lock cleanup 6th recurrence with revised text succeeding under primary path).
- **PR6** — respected. No safety-critical surface modified. Distress classifier, Zone 2/3 logic, encryption pipeline, session, access control, deletion, and deployment-config all untouched. Sessions 3d and 3e correctly classified Elevated; Session 4 (live reflect + journal pipeline) will be Critical when it lands.
- **PR7** — respected. No new deferrals introduced. Decisions 3d-1, 3d-2, 3d-3, 3e-1, 3e-2, 3e-3, 3e-4, 3e-5 all adopted (not deferred). Findings 1, 2, 3 documented with their retirement conditions named (Session 4 for the write-roundtrip pair; Session 4 for the structural type; Session 4 for the reflect route).
- **PR8** — engaged. Sandbox push limitation 7th recurrence. Stale-lock cleanup 6th recurrence (1st under revised text, succeeded). Both pending formal adoption; promotion thresholds well-passed.
- **AC7** — respected. No auth, cookie scope, session validation, or domain-redirect change. Confirmed at session open, plan walks (×2), and both commit checkpoints. Diff inspection on both commits confirmed only the targeted import lines, type definitions, function signatures, and inline comments changed.

## Decision Log Entries — Proposed (Founder Approval Required)

### D-RING-2-S3D-CONTEXT-LOADERS

```
## 2026-04-26 — D-RING-2-S3D-CONTEXT-LOADERS: ADR-Ring-2-01
                                              Session 3d — practitioner-
                                              context.ts fully migrated to
                                              loadMentorProfileCanonical;
                                              all 3 read-side context-
                                              builders (getPractitionerContext,
                                              getFullPractitionerContext,
                                              getProjectedPractitionerContext)
                                              consume canonical MentorProfile;
                                              field-access translations
                                              applied per ADR §2.1/§2.2

**Decision:** Migrate /website/src/lib/context/practitioner-context.ts
fully to loadMentorProfileCanonical(). The 3 read-side context-
builders and their helpers (buildCondensedContext, projectProfile,
formatPassion, findWeakestVirtue) all consume canonical MentorProfile.
Field-access translations applied internally — no wire-contract
change because the functions return prompt-injection strings.

mentor-context-private.ts NOT migrated this session — its 2
loadMentorProfile() calls are inside write-roundtrip functions
(setFounderFacts, appendFounderFactsNote) that pair with
saveMentorProfile() on legacy MentorProfileData. They retire
together at ADR Session 4 (journal pipeline write-side migration).

**Reasoning:** ADR-Ring-2-01 §7 Session 3 (consumer migration). 5th
full loader-switch in the Session 3 series after Session 1
(ring proof), Session 3b (public baseline), Session 3-follow-up
(private baseline), and Session 3c (mentor-profile GET). The
practitioner-context functions are consumed by all 8
R20a-perimeter routes plus 4 other endpoints — a regression would
have been broad. Mitigated by (a) function signatures unchanged
at the public surface (Promise<string|null>); (b) all canonical
fields read by these helpers verified to exist on MentorProfile;
(c) tsc --noEmit clean before commit; (d) Sessions 1, 3b,
3-follow-up, 3c verified the same canonical loader on production.

**Alternatives considered:**
  - Migrate mentor-context-private.ts in the same session: rejected
    because the 2 loadMentorProfile() calls there are write-
    roundtrip and migrating only the read would force an inverse
    adapter the ADR explicitly defers.
  - Defer 3d entirely: rejected because the prompt scoped both 3d
    and 3e for this session and the ADR's "simplest first"
    ordering put 3d before 3e.

**Revisit condition:** None. Rollback if regression: git revert
fbe12d5 — restores legacy loadMentorProfile() at all 3 call sites
and reverts field-access translations.

**Rules served:** PR1 (single-endpoint proof, 3 call sites in one
file as one PR1 proof), PR2 (verification immediate, tsc clean
pre-commit), PR3 (no async added), PR4 (no LLM in path), PR6 (no
safety-critical surface — confirmed by reading the file), PR7 (no
new deferrals; mentor-context-private.ts retirement condition
named — Session 4), R17 (surface unchanged — canonical loader
operates on post-decryption plaintext via the existing Session 1
path), AC7 (not engaged — confirmed three checkpoints).

**Impact:** ADR-Ring-2-01 Session 3d reaches Verified status
pending founder live-probe of commit fbe12d5. The 3
practitioner-context helper functions now produce strings derived
from canonical fields — the per-passion line drops the legacy
"freq N/12" suffix; oikeiosis lines reference the canonical
person/relationship/stage/frequency schema; virtue-profile lines
use the canonical evidence string. These are content changes to
LLM-consumed prompt material, not wire-contract changes to
machine-consumed APIs.

**Status:** Adopted, pending founder live-probe post-deploy of
commit fbe12d5 confirming the founder hub mentor flow round-trips
successfully.
```

### D-RING-2-S3E-FOUNDER-HUB

```
## 2026-04-26 — D-RING-2-S3E-FOUNDER-HUB: ADR-Ring-2-01 Session 3e —
                                          /api/founder/hub fully migrated to
                                          loadMentorProfileCanonical; the
                                          loaded profile flows only into
                                          getRecentInteractionsAsSignals
                                          which retypes its profile parameter
                                          via a transitional structural type
                                          (ProfileForSignals) until ADR
                                          Session 4

**Decision:** Migrate /website/src/app/api/founder/hub/route.ts (the
hub's only loadMentorProfile call, line 517) fully to
loadMentorProfileCanonical(). Wire contract unchanged (Decisions
3e-1, 3e-3 N/A — the hub returns no profile-derived fields per
audit). KG3 unchanged (Decision 3e-4 — mapRequestHubToContextHub
boundary untouched).

Introduce a transitional structural type ProfileForSignals in
/website/src/lib/context/mentor-context-private.ts. The function
getRecentInteractionsAsSignals' profile parameter retypes from
MentorProfileData|null to ProfileForSignals|null. Both legacy
MentorProfileData and canonical MentorProfile satisfy the
structural minimum (the function reads only
passion_map[].{root_passion, sub_species, frequency}). The helper
rowToSignal's passionMap parameter retypes to the matching shape.
The "freq " prefix on the pattern-match output line is dropped to
read naturally with canonical bucket-string frequency.

**Reasoning:** ADR-Ring-2-01 §7 Session 3 (consumer migration —
last Elevated consumer). The transitional ProfileForSignals type
is necessary because /api/mentor/private/reflect (Session 4 —
Critical, R20a perimeter, AC5) also calls
getRecentInteractionsAsSignals and remains on legacy until
Session 4. Caught by tsc --noEmit after the first 3e edit
attempt — the founder-hub-only signature change broke the reflect
route at compile time. The structural type is honest about the
actual coupling and tightens to MentorProfile|null in Session 4.

**Alternatives considered:**
  - Migrate /api/mentor/private/reflect alongside the hub: rejected
    because reflect is Session 4 — Critical — explicitly out of
    scope for this Elevated session.
  - Use a union type (MentorProfile|MentorProfileData|null):
    rejected as less honest — both shapes are accepted because the
    function only needs a structural minimum, and the structural
    type self-documents that.
  - Add a canonical-to-legacy adapter inside the hub before the
    function call: rejected — the inverse adapter doesn't exist
    and shouldn't (the migration's direction is one-way; an
    inverse adapter would be a permanent intermediary).

**Revisit condition:** Tighten ProfileForSignals to
MentorProfile|null when /api/mentor/private/reflect migrates
(Session 4). Inline comment in mentor-context-private.ts names
this. Rollback if regression: git revert 95c40db — restores legacy
loadMentorProfile() at the hub call site and the
MentorProfileData|null parameter type on
getRecentInteractionsAsSignals.

**Rules served:** PR1 (single-endpoint proof — founder hub this
session), PR2 (verification immediate — tsc caught the reflect-
route coupling before commit), PR3 (no async added), PR4 (model
selection unchanged — hub's Sonnet/Opus/Haiku usage preserved),
PR6 (no safety-critical surface — hub is not in AC5 R20a
perimeter), PR7 (transitional ProfileForSignals retirement
condition named in inline comment — Session 4), R17 (surface
unchanged — canonical loader operates on post-decryption
plaintext), AC7 (not engaged — confirmed three checkpoints).

**Impact:** ADR-Ring-2-01 Session 3e reaches Verified status
pending founder live-probe of commit 95c40db. After this session,
every consumer in /website/src is on the canonical loader except
/api/mentor/private/reflect (Session 4) and the two write-
roundtrip functions in mentor-context-private.ts (setFounderFacts,
appendFounderFactsNote — also Session 4 alongside the journal
pipeline write-side). The Session 3 series is now one Critical
session (Session 4) plus one Elevated session (Session 5) away
from full legacy retirement.

**Status:** Adopted, pending founder live-probe post-deploy of
commit 95c40db confirming the founder hub mentor flow round-trips
successfully.
```

The six pending decision-log entries from prior sessions (**D-RING-2-S3a**, **D-PR8-PUSH** from Session 3a close; **D-RING-2-S3b**, **D-LOCK-CLEANUP** from Session 3b close; **D-RING-2-S3-PRIVATE-FULL** from Session 3-follow-up close; **D-RING-2-S3C-MENTOR-PROFILE-GET** from Session 3c close) remain at "Proposed — pending founder approval." The original proposed texts are preserved in the prior session-close handoffs. **D-LOCK-CLEANUP**'s revised text now has supporting evidence under its primary path (this session's successful cleanup) — recommend formal adoption next session.

## Orchestration Reminder (Protocol element 21)

This session was governed end-to-end by `/adopted/session-opening-protocol.md`. All 21 elements applied:

- **Part A** (elements 1–8): tier declared (1, 2, 3, 6, 8, 9), canonical sources read in sequence (manifest in full, project instructions pinned, prior tech handoff Session 3c for context, ADR-Ring-2-01 §7 + §11 + §12 Session 3, summary-tech-guide partial via index, knowledge-gaps register scan, source code files via Read + Grep — totalling ~3,200 lines read), KG scan completed (KG1/2/3/6/7 confirmed not relevant or respected), hold-point status confirmed (P0 0h still active — this work permissible inside the assessment set), model selection confirmed not material for the migration itself (no model selection changes; hub's existing model selections preserved), status-vocabulary separation maintained throughout, signals and risk-classification readiness confirmed.
- **Part B** (elements 9–18): Elevated classification named pre-execution per ADR §7 Session 3 (one per sub-session); three findings surfaced as AI signals before any code ("I'd push back on parts of the original scope on this basis" — Findings 1, 2, 3); Critical Change Protocol not invoked (this is Elevated, not Critical); PR6 honoured (no safety-critical surface modified); PR3 honoured (no async added); PR1 honoured (each sub-session as its own single-endpoint proof); PR2 honoured (verification immediate, three tsc checkpoints — checkpoint 2's failure caught the reflect-route coupling before commit); deferred decisions logged where applicable (no new PR7 deferrals; transitional type retirement and write-roundtrip retirement both named with Session 4 conditions); tacit-knowledge findings — push limitation extended to 7th recurrence; stale-lock cleanup at 6th recurrence (1st successful run under revised text); stewardship findings none new; **scope cap respected** — the session was sized at session open as smaller than the prompt anticipated, named honestly as such ("Combined session is now much smaller than the prompt projected"), and stayed within the named scope for the duration.
- **Part C** (elements 19–21): system stabilised to known-good state (commits `fbe12d5` and `95c40db` on local main, sandbox working tree clean — pending founder push); handoff produced in required-minimum format plus all five extensions (Verification Method Used, Risk Classification Record, PR5 Knowledge-Gap Carry-Forward, Founder Verification, Decision Log Entries — Proposed); this orchestration reminder names the protocol explicitly and confirms no element was skipped.

Authority for the work itself was `/compliance/ADR-Ring-2-01-shape-adapter.md` §7 Session 3 + §12 Session 3 notes. The protocol governed *how* the session ran; the ADR governed *what* the session built.

---

*End of session close.*
