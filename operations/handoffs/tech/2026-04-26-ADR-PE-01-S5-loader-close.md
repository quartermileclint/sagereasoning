# Session Close — 26 April 2026 (ADR-PE-01 Session 5, Live `mentor_interactions` Loader — Verified)

**Stream:** tech
**Governing frame:** `/adopted/session-opening-protocol.md`
**Tier read this session:** 1, 2, 3, 6, 8, 9 (every-session + KG governance scan + code state — code touched this session)
**Risk classification:** Critical under PR6. The session introduced a new live read path (`loadMentorInteractionsAsRecords`) whose output, on cache miss / bypass, flows into `analysePatterns()` and is then persisted inside the encrypted profile blob via the existing Sessions 1/3.5 writer site. Encryption-pipeline blast radius engaged. Critical Change Protocol (0c-ii) executed in full pre-deploy with eleven worst cases (A–K) named explicitly and accepted by founder approval ("I accept worst cases A - K. Go ahead.").

This session continued from `/operations/handoffs/tech/2026-04-26-ADR-PE-01-session-3.5-and-4-close.md`. The §8 single-endpoint-proof sequence had reached a natural pause after Sessions 1, 2, 3, 3.5, 4 wired the two major mentor-touching live consumers (reflect + founder-hub) under per_request + 2A-skip on absence. The remaining ADR-PE-01 work item with architectural significance was the live `mentor_interactions` loader (ADR §1.2 (c)), which was deferred at the original ADR adoption and at every Session 1–4 close. Founder selected Framing A at session open with all defaults: hub-scoped per (user, hub); per-consumer-request cadence; last 90 days + limit 100; keep 2A-skip on absence on existing live consumers (reflect, founder-hub) until loader is Verified live; defer backfill (natural per_request cadence will overwrite on next consumer call); single-endpoint proof target = the proof endpoint.

## Decisions Made

- **Framing A: live `mentor_interactions` loader.** Founder selected the architectural completion of ADR-PE-01 over Framing B (cleanup pass — blob-size measurement, cosmetic comment-date fix, commit-hash recording) and Framing C (step out — hold-point assessment work, P2 ethical safeguards, MENTOR_CONTEXT_V2 decoupling). AI's gentle push-back at session open (against starting P2 work while ADR-PE-01 carry-forward items remained open) was not engaged because the founder picked A, not C.

- **Q-Loader-Scope: hub-scoped per (user, hub).** Continuity with the 2026-04-26 ADR adoption direction and ADR §1.4. Default recommendation accepted.

- **Q-Loader-Cadence: per-consumer-request.** Continuity with the per_request cadence already in use at Sessions 1, 2, 3, 3.5, 4. Default recommendation accepted. The loader is invoked on cache miss / bypass only; on cache hit, the loader does not fire (verified live by Probes L1/L2/Re-L1 returning `interactions_source: null`).

- **Q-Loader-Source: hub-scoped + last 90 days + limit 100.** Default recommendation accepted. The cutoff timestamp is computed inside the loader (`Date.now() - windowDays * 24 * 60 * 60 * 1000`); ordering is `created_at DESC`; the existing index `idx_mentor_interactions_hub` on `(hub_id, profile_id, created_at DESC)` matches the query shape exactly.

- **Q-Recompute-Read-Precedence: keep 2A-skip on absence everywhere initially.** Reflect (Session 3) and founder-hub (Session 4) remain on 2A-skip on absence; per-consumer revisit to switch to 2A-recompute is deferred until the founder makes that call after observing this session's loader behaviour live. The proof endpoint was excluded from this rule because it has always recomputed on cache miss (with the fixture as input pre-Session-5).

- **Q-Backfill: defer.** No automatic replacement of the founder's existing fixture-derived `pattern_analyses['founder-mentor']` and `['private-mentor']` entries. Verification probes L3 and L4 used `bypass_pattern_cache: true` to exercise the loader, which **did** overwrite both entries with live-recomputed entries. Worst case J accepted explicitly at session open: bypass-during-verification is partial backfill via opt-in. The founder's profile now carries live-recomputed pattern data for both labels (verified by Re-L1 cache hit on the new entry).

- **Q-Single-Endpoint-Proof: `/api/mentor/ring/proof`.** Continuity with Sessions 1/2/3.5 — symmetric proof pattern. Reflect and founder-hub were not modified this session.

- **Critical Change Protocol (0c-ii) executed in full pre-deploy with eleven worst cases (A–K) named explicitly and accepted.** All five steps surfaced visibly in the conversation: what changes (one new file + one modified file), what could break (worst cases A–K named: A loader query failure, B malformed rows, C JSONB-string-bug per KG7 + R2-followup, D field-shape mismatch passions_detected, E profile_id lookup failure, F new body field back-compat, G wrong-shaped persisted PatternAnalysis, H read amplification, I encryption-pipeline regression, J bypass-overwrites-fixture-entries side effect, K PR1 single-endpoint-proof discipline), what happens to existing sessions (no auth/cookie/session change; non-mentor and non-proof unchanged; only observable change is post-bypass: founder's fixture-derived pattern data becomes live-recomputed), rollback plan (per-commit GitHub Desktop revert; the new loader file is removed and proof endpoint reverts to PROOF_INTERACTIONS on recompute branch; persisted live-recomputed entries become "frozen" until a future cache miss), verification step (four probes + re-L1 from `/founder-hub` Console using `decodeURIComponent(cookies['sb-access-token'])`). Founder approved with "I accept worst cases A - K. Go ahead."

- **Probes L1, L2, L3, L4, Re-L1 all verified.** Founder confirmed "probes all verified" after running the consolidated console snippet end-to-end. The verification matrix landed: cache-hit branches preserved post-loader-integration on both labels; force-recompute branches exercised the loader on both labels; the post-bypass cache-hit (Re-L1) confirmed the L3-recomputed entry is now the persisted cache and round-trips end-to-end on real data.

- **Console-snippet auth-cookie discovery: third successful use without rediscovery.** The working pattern (`decodeURIComponent(cookies['sb-access-token'])` reading the raw JWT directly) was used as the canonical mechanism in the consolidated probe snippet from the start. Counter prior to this session was 1 of 3 conservative (per the founder's session-open prompt: "promotion to canonical at the next verification-probe session is now reasonable"). This session is the next verification-probe session. **Promotion to canonical recommended at next session open.** Founder picks at next session open whether to promote.

## Status Changes

| Item | Old status | New status |
|---|---|---|
| `/website/src/lib/mentor-interactions-loader.ts` | Did not exist | **Live.** New file (~190 lines including comment blocks). Exports `loadMentorInteractionsAsRecords(profileId, hubId, options?)` returning `Promise<InteractionRecord[]>`. Hub-scoped query, last 90 days default, limit 100 default. Defensive JSONB parse on `passions_detected` (KG7 + R2-followup). Field-shape mapping (`passion := sub_species ?? root_passion ?? passion`). Error-tolerant: returns `[]` on any DB or mapping error. Read-only — no write surface. |
| `/api/mentor/ring/proof` recompute branch input | Hardcoded `PROOF_INTERACTIONS` fixture | **Live (parameterised by profileSource).** Live loader output when `profileSource === 'live_canonical'`; `PROOF_INTERACTIONS` fallback when `profileSource === 'fixture_fallback'`. Profile_id lookup inline (4-line Supabase query, mirrors `getProfileId` pattern). |
| `/api/mentor/ring/proof` cache-read gate | Unconditional cache precedence | **Gated on `!bypassPatternCache`.** Cache hit short-circuits as before when bypass is false (back-compat preserved). When `bypass_pattern_cache: true`, the recompute branch fires unconditionally — the deterministic verification mechanism. |
| Optional `bypass_pattern_cache` request body field | Did not exist | **Live.** Boolean, default false. Strict type check; non-boolean values return 400. |
| Diagnostic response fields `interactions_source`, `interactions_count`, `bypass_pattern_cache_used` | Did not exist | **Live.** `interactions_source` is `'live_loader'` / `'fixture_fallback'` / `null` (cache hit). `interactions_count` is the row count fed into `analysePatterns` on the recompute branch (null on cache hit). `bypass_pattern_cache_used` echoes the request body field. |
| `pattern_analyses['founder-mentor']` cache entry on the founder's blob | Fixture-derived (Session 3.5 seed via `PROOF_INTERACTIONS`) | **Live-recomputed (Probe L3 overwrite).** The entry now reflects `analysePatterns(profile, live_interactions, null)` output — synthesised from real `mentor_interactions` rows for `(founder profile_id, 'founder-mentor')` in the last 90 days. |
| `pattern_analyses['private-mentor']` cache entry on the founder's blob | Fixture-derived (Sessions 1/2 writer with `PROOF_INTERACTIONS`) | **Live-recomputed (Probe L4 overwrite).** Same as above for the other label. |
| ADR-PE-01 §1.2 (c) — live `mentor_interactions` loader | Deferred (since 2026-04-25 pattern-engine close) | **Verified.** TypeScript clean (`tsc --noEmit` exit 0); PR2 invocation grep confirmed the loader is awaited at the recompute branch (line 365), bypass gate at the cache read (line 328), and diagnostic fields surfaced on the response (lines 650–652). Five-probe live verification completed in-session with founder confirmation. |
| ADR-PE-01 Session 5 (per ADR §8 derivative) | Did not exist (created mid-session) | **Verified.** First architectural extension to §8 since the natural pause at Session 4 close. Reflect and founder-hub remain on 2A-skip on absence per Q-Recompute-Read-Precedence — the loader's existence does not auto-switch them; per-consumer 2A-recompute revisit is a separate future founder decision. |
| ADR-PE-01 §8 single-endpoint-proof sequence | Sessions 1, 2, 3, 3.5, 4 Verified — natural pause | **Sessions 1, 2, 3, 3.5, 4, 5 Verified.** With the loader Verified live on the proof endpoint, the architectural completion of ADR-PE-01 is reached on a single endpoint. Live-consumer rollout (per-consumer 2A-recompute switch on reflect and founder-hub) is the next §8 sequence step, deferred to a future session per Q-Recompute-Read-Precedence. |
| O-PE-01-A (read amplification) | Open — concretely measurable on reflect + founder-hub | **Open — now measurable on the proof endpoint's recompute branch as well.** Each cache-miss / bypass invocation adds (i) one Supabase query for profile_id lookup + (ii) one Supabase query for `mentor_interactions`. Negligible at admin rate limit on the proof endpoint. Will be more material if reflect / founder-hub switch to 2A-recompute. |
| O-PE-01-B (blob-size monitoring) | Open — first measurement opportunity since Sessions 3.5/4 wrote versions 12+ | **Still open.** This session bumped the founder's blob version through the L3/L4/Re-L1 writes. Trigger condition unchanged. |
| O-PE-01-D (write cadence) | Resolved for Sessions 1, 2, 3, 4 — per_request | **Resolved for Sessions 1, 2, 3, 3.5, 4, 5 — per_request.** The loader does not introduce a new cadence; it is invoked synchronously inside the existing per_request flow on the proof endpoint. |
| O-PE-01-E (backfill) | Open — fallback is recompute | **Effectively partially resolved for the founder's profile via the verification path.** Probes L3 and L4 overwrote the founder's fixture-derived entries with live-recomputed entries. No automatic backfill mechanism added; the bypass flag is the opt-in mechanism. Carries forward unchanged for any other practitioners (none currently). |
| New open item: O-PE-01-G (NEW) — `bypass_pattern_cache` long-term posture | Did not exist | **Open.** The flag earned its place this session as the deterministic verification mechanism. Question for a future session: keep it long-term as an operational tool (force-recompute on demand), retire it once the loader is rolled out to all live consumers, or document it as a permanent admin diagnostic. Defer until natural triggering. |
| Decision-log entry D-PE-01-S5-LOADER-VERIFIED | Did not exist | **Adopted.** Will be appended to `/operations/decision-log.md` immediately after this handoff is written. Commit hash: TBD per founder share. |

## What Was Changed

### NEW file — `website/src/lib/mentor-interactions-loader.ts` (Critical risk under PR6 — sits inside the encryption pipeline blast radius once invoked)

| File | Action |
|---|---|
| `website/src/lib/mentor-interactions-loader.ts` | **+~190 lines.** New file. Exports `loadMentorInteractionsAsRecords(profileId, hubId, options?)`. Hub-scoped query: `.eq('profile_id', ...).eq('hub_id', ...).gte('created_at', cutoff).order('created_at', desc).limit(N)`. Defaults: `windowDays: 90`, `limit: 100`. Internal helpers: `parsePassionsDetected` (KG7-defensive parse mirroring `mentor-context-private.ts:687-695`); `rowToInteractionRecord` (worst case B/D mitigation — defensive row mapping; rows missing required fields return null and are skipped, not the whole load). Error-tolerant: try/catch wrapping the query and the mapping; on any error returns `[]`; logs to console with `[mentor-interactions-loader]` prefix. Type re-exports: `InteractionsHubId` (`'private-mentor' \| 'founder-mentor'`); `LoaderOptions`. |

### MODIFIED file — `website/src/app/api/mentor/ring/proof/route.ts` (Critical risk under PR6 — modifies an existing `saveMentorProfile()` consumer's read-path input)

| File | Action |
|---|---|
| `website/src/app/api/mentor/ring/proof/route.ts` | **+~95 lines (net, including expanded comment blocks).** Imports added: `loadMentorInteractionsAsRecords`, `InteractionsHubId` from `@/lib/mentor-interactions-loader`; `InteractionRecord` from `@/lib/sage-mentor-ring-bridge`. New `bypass_pattern_cache` body field validation block (lines 165–198): optional boolean, default false, 400 on invalid, strict `typeof === 'boolean'` check. Existing `if (persisted)` cache-precedence gate replaced with `if (persisted && !bypassPatternCache)` (line 328) — back-compat preserved when bypass is false; recompute branch fires unconditionally when bypass is true. Existing recompute branch (single line `ring.analysePatterns(profile, PROOF_INTERACTIONS, null)`) replaced with parameterised input pattern (lines 333–375): `let interactions: InteractionRecord[] = PROOF_INTERACTIONS; interactionsSource = 'fixture_fallback';` then if `profileSource === 'live_canonical'`, inline profile_id lookup, on success swap to `await loadMentorInteractionsAsRecords(profileId, proofHubId as InteractionsHubId, { windowDays: 90, limit: 100 })` and set `interactionsSource = 'live_loader'`. New diagnostic fields on the response (lines 650–652): `interactions_source`, `interactions_count`, `bypass_pattern_cache_used`. Notes array updated to describe the live loader integration and the bypass flag. KG3 mirror discipline preserved: single `proofHubId` variable used at the cache-read site, the loader call site, and the writer site (Sessions 1/3.5 writer at line ~431 unchanged). |

### Files NOT changed

- `website/src/app/api/mentor/private/reflect/route.ts` — unchanged. Per Q-Recompute-Read-Precedence, reflect remains on 2A-skip on absence; per-consumer 2A-recompute revisit is deferred. The `27 April 2026` → `26 April 2026` cosmetic comment-date fix carried forward from Session 3 close was NOT batched this session because Session 5 did not touch reflect. Carries forward.
- `website/src/app/api/founder/hub/route.ts` — unchanged. Same reasoning as reflect.
- `sage-mentor/persona.ts` — unchanged. `MentorProfile` and `InteractionRecord` types unchanged.
- `sage-mentor/pattern-engine.ts` — unchanged. `analysePatterns` signature unchanged.
- `website/src/lib/mentor-profile-store.ts` — unchanged. Both `loadMentorProfile` and `saveMentorProfile` consumed as-is.
- `website/src/lib/sage-mentor-ring-bridge.ts` — unchanged. Type re-exports consumed as-is.
- `website/src/lib/mentor-ring-fixtures.ts` — unchanged. `PROOF_PROFILE` and `PROOF_INTERACTIONS` continue to serve as the `fixture_fallback` path.
- `server-encryption.ts` — unchanged. R17b boundary unchanged at the code level.
- All distress classifier code — untouched. AC5 not engaged. R20a perimeter unchanged.
- Database schema — unchanged. **No DB schema changes. No SQL. No DDL. No env vars.**

### Cosmetic carry-forward

- The `27 April 2026` → `26 April 2026` comment-date inconsistency in `/api/mentor/private/reflect/route.ts` (flagged at Session 3 close, F-series Efficiency tier per PR9) **was NOT batched in this session** because Session 5's edits did not touch that file. Carries forward to the next session that touches reflect.
- The proof endpoint's top-of-file JSDoc bullet "Uses a hand-constructed fixture profile (not the live profile store)" became stale at ADR-Ring-2-01 Session 1 (25 April 2026) and is now doubly stale post-Session 5. Tiered as Efficiency & stewardship per PR9; absorbed into ongoing work.
- This session's new comment blocks (in proof and the new loader file) are dated correctly (2026-04-26, matching the system clock). No new date inconsistency introduced.

## Verification Method Used (0c Framework)

Per `/operations/verification-framework.md`:

- **Pre-deploy: TypeScript clean.** `npx tsc --noEmit` in `/website` returned exit code **0**. Confirmed the new loader file compiles standalone, the new imports in the proof endpoint resolve correctly, the `bypassPatternCache: boolean` and `interactions: InteractionRecord[]` types unify, and the cast `proofHubId as InteractionsHubId` is structurally sound (the two types are identical literal unions).
- **Pre-deploy: PR2 grep for invocation, not just declaration.** `grep -n "loadMentorInteractionsAsRecords|bypassPatternCache|interactionsSource|interactionsCount|InteractionsHubId"` against the proof route confirmed: imports at lines 54–55 (declaration); `bypassPatternCache` parsed and stored at lines 186–190; declarations at lines 324–325; **cache-read gate at line 328** (`if (persisted && !bypassPatternCache)` — the actual gate-in-execution, not just a definition); `interactionsSource = 'fixture_fallback'` at line 337; **`await loadMentorInteractionsAsRecords(...)` invocation at line 365** (the actual loader call in the execution path); `interactionsSource = 'live_loader'` at line 370; `interactionsCount = interactions.length` at line 373; **diagnostic fields surfaced on the response at lines 650–652** (`interactions_source`, `interactions_count`, `bypass_pattern_cache_used`). All five new variables are set in the execution path; the loader is awaited (KG1 rule 2 respected even though the loader is read-only).
- **Pre-deploy: KG3 mirror discipline within route.** Single local variable `proofHubId` used at the cache-read site (line 327), the loader call site (line 367 via cast to `InteractionsHubId`), and the writer site (Sessions 1/3.5 writer at ~line 431 unchanged). No drift surface within the route. KG3 comments inline on each site name the mirror.
- **Pre-deploy: AC7 confirmed not engaged.** No auth, cookie scope, session validation, or domain-redirect changes.
- **Post-deploy: smoke check.** Founder confirmed `/founder-hub` page loads normally before running the verification probes ("Deployed and page loads fine").
- **Post-deploy: five-probe verification (consolidated console snippet).** Founder pasted a single Console snippet at `https://www.sagereasoning.com/founder-hub` running L1 → L2 → L3 → L4 → Re-L1 sequentially. The probe pattern used `decodeURIComponent(cookies['sb-access-token'])` (the working auth-cookie discovery from Sessions 3 / 3.5 / 4 — third successful use without rediscovery this session). Founder confirmed "probes all verified."
  - **Probe L1** — cache hit, no bypass, founder-mentor. Expected: `pattern_source: 'persisted'`, `interactions_source: null` (cache hit — loader never fired), `bypass_used: false`. Verified.
  - **Probe L2** — cache hit, no bypass, private-mentor. Expected: same as L1 for the other label. Verified.
  - **Probe L3** — FORCE RECOMPUTE, founder-mentor (bypass=true). Expected: `pattern_source: 'recomputed'`, `interactions_source: 'live_loader'`, `bypass_used: true`. **The decisive verification: loader was actually invoked, returned data, was synthesised through pattern-engine successfully, and the live-recomputed result was persisted.** Side effect (worst case J): the founder's existing fixture-derived `pattern_analyses['founder-mentor']` was overwritten with the live-recomputed entry. Verified.
  - **Probe L4** — FORCE RECOMPUTE, private-mentor (bypass=true). Expected: same as L3 for the other label. Same side effect. Verified.
  - **Re-L1** — cache hit, no bypass, founder-mentor (post-L3). Expected: `pattern_source: 'persisted'`, `interactions_source: null`, the persisted entry now reflects the L3-recomputed live data (round-trip works end-to-end on real data). Verified.
- **No KG3 drift detected.** Both `'founder-mentor'` and `'private-mentor'` round-trip correctly through the new loader path. The KG3 surface is no wider than at Sessions 3.5 + 4 close because the loader does not map labels — callers pass canonical hub_ids constrained at the type level by `InteractionsHubId`.
- **No PITR restoration required.** No corrupt blobs.
- **PR4 checkpoint cleared at session open and re-confirmed at close.** No model selection change. The proof endpoint's `claude-sonnet-4-6` LLM call is unchanged. The loader adds no LLM call (it is pure DB read + deterministic mapping; `analysePatterns` is deterministic).

## Risk Classification Record (0d-ii)

- **Critical under PR6.** The session introduced a new live read path whose output, on cache miss / bypass, flows into `analysePatterns` and is persisted inside the encrypted profile blob via the existing Sessions 1/3.5 writer site. Although the writer code itself is unchanged, the **input** to the writer changed materially (live-derived pattern data instead of fixture-derived) — this is a substantive change to what gets persisted. PR6 governs and the Critical Change Protocol (0c-ii) was executed in full pre-deploy.
- **Eleven worst cases were named explicitly to the founder pre-deploy:**
   - **A — Loader query fails.** Mitigation: try/catch in loader; on error returns `[]`; logs to console. Empty input → `analysePatterns` produces a structurally valid empty `PatternAnalysis` (no detections) which is then persisted. Acceptable degradation; no crash.
   - **B — Loader returns malformed rows.** Mitigation: defensive `rowToInteractionRecord` mapping; rows that fail validation (missing id / interaction_type / created_at) return null and are skipped, not the whole load.
   - **C — JSONB string-vs-array bug on `passions_detected` (KG7 + R2-followup).** Mitigation: same defensive parse pattern as `mentor-context-private.ts:687-695`. `typeof === 'string'` → `JSON.parse`; otherwise use directly. Empty/malformed → row's passions field is empty array, row itself stays valid.
   - **D — Field-shape mismatch on `passions_detected`.** Mitigation: explicit mapping in the loader (`passion := sub_species ?? root_passion ?? passion`). Three-tier fallback covers live row shape, type forward-compat, and any partially-migrated rows.
   - **E — `profile_id` lookup fails.** Mitigation: lookup inline in the proof route with try/catch on the Supabase response; on null `profileId`, fall through to `PROOF_INTERACTIONS` fixture rather than throwing. Verified by the existence of the `if (profileId)` gate at line 357 of the proof route.
   - **F — New body field `bypass_pattern_cache` breaks back-compat.** Mitigation: optional field, default false, strict `typeof === 'boolean'` check. Probes L1 / L2 / Re-L1 (no bypass field in the body — implicit false) returned `bypass_pattern_cache_used: false` and the cache-hit branch fired correctly. Back-compat preserved.
   - **G — Live recompute writes a wrong-shaped `PatternAnalysis` to the encrypted blob.** Mitigation: `analysePatterns` is unchanged and deterministically produces a valid `PatternAnalysis`; the writer site (line ~431) is unchanged structurally — only the input to `analysePatterns` changed upstream. KG3 mirror discipline preserved by single `proofHubId` variable. Probes L3/L4 returned `pattern_persistence.ok: true` with version increments matching the per_request cadence, confirming the writer is well-formed.
   - **H — Read amplification on the proof endpoint.** Each cache-miss / bypass invocation adds two Supabase queries (profile_id lookup + mentor_interactions read). Accepted at admin rate limit on the proof endpoint; logged for revisit if reflect / founder-hub switch to 2A-recompute (where read amplification would scale with founder-hub mentor traffic).
   - **I — Encryption-pipeline regression.** The cipher path is unchanged; the writer code is unchanged; only the input to `analysePatterns` changed. Probes L3/L4 returned 200 with `pattern_persistence.ok: true`; Re-L1 confirmed round-trip end-to-end on the live-recomputed entry.
   - **J — Bypass-overwrites-fixture-entries side effect.** Worst case J was the most material trade-off accepted at session open. Probes L3 and L4 with `bypass_pattern_cache: true` overwrote the founder's existing fixture-derived `pattern_analyses['founder-mentor']` and `['private-mentor']` entries with live-recomputed entries. Q-Backfill posture: opt-in only via the bypass flag; the founder controlled when overwrites happened by running the verification probes. Re-L1 confirmed the new live-recomputed entry is now the persisted cache (round-trip works).
   - **K — PR1 single-endpoint-proof discipline.** The loader proves on the proof endpoint only this session. Reflect and founder-hub remain on 2A-skip on absence per Q-Recompute-Read-Precedence — they still fall through on cache miss rather than calling the loader. PR1 respected.
- **AC7 (Session 7b standing constraint) — confirmed not engaged.** No auth, cookie scope, session validation, or domain-redirect changes.
- **AC4 (Invocation Testing for Safety Functions) — not directly engaged** (no safety-critical function modified). The PR2 grep-for-invocation discipline was applied to `loadMentorInteractionsAsRecords`, `bypassPatternCache`, `interactionsSource`, and `interactionsCount` setting and surfacing as analogues.
- **AC5 (R20a perimeter) — not engaged.** Distress classifier and `enforceDistressCheck` gates unchanged.

## PR5 — Knowledge-Gap Carry-Forward

KG entries scanned at session open and engaged this session:

- **KG3 (hub-label end-to-end contract) — engaged and respected.** The loader's `InteractionsHubId` type re-imposes the same allowlist (`'private-mentor' | 'founder-mentor'`) at the type level; callers must pass a canonical hub_id, the loader does not map labels. The proof endpoint passes its single `proofHubId` variable cast to `InteractionsHubId` — same source-of-truth used at the cache-read site, the loader call site, and the writer site. No new drift surface introduced.
- **KG7 (JSONB shape) — engaged and respected.** The loader's `parsePassionsDetected` helper mirrors the defensive parse pattern from `mentor-context-private.ts:687-695`. The historical R2-followup bug (string-inside-JSONB at the writer in `sage-mentor/profile-store.ts:781`) is handled defensively at the read site. If a future writer-layer fix lands, this defensive parse remains harmless (Array.isArray check passes through correctly-shaped data). The JSONB column `passions_detected` is unchanged at the schema level.
- **KG1 rule 2 (await all DB writes — no fire-and-forget) — engaged and respected.** The loader is read-only (no writes), so KG1 rule 2 is technically not engaged for the loader file itself. But the proof endpoint's persistence block (Sessions 1/3.5 writer at ~line 431) was already awaited and is unchanged this session. The loader call itself is also awaited (`await loadMentorInteractionsAsRecords(...)`) for synchronous control flow, even though it is a read.
- **KG6 (composition-order constraint) — not engaged this session.** The loader produces input for `analysePatterns`, which produces a `PatternAnalysis` with a `ring_summary` string. The composition order at the consumer (proof endpoint's BEFORE prompt augmentation at line ~456) is unchanged. KG6 will engage if a future consumer (reflect, founder-hub) adds the loader to its prompt-assembly path.
- **KG2, KG4, KG5 — not engaged.** No model-selection change (PR4 cleared at open and close), no Layer 2 wiring change, no token-budget surface change.

**Cumulative re-explanation count this session:** zero. No project-domain concept required re-explanation. KG3, KG7, KG1 rule 2 were named pre-emptively at the design step and respected without follow-up.

**Observation candidates updated:**

1. **Console-snippet auth-cookie discovery (carried forward, prior count 1 of 3 conservative).** Used in this session once (the consolidated five-probe snippet). Worked first-try with no rediscovery — the resolution that worked at Session 3 (and at Sessions 3.5 + 4) was used from the start. **Per the founder's session-open prompt: "promotion to canonical at the next verification-probe session is now reasonable."** This is the next verification-probe session. **Recommendation: promote to canonical at next session open** under PR8's third-recurrence rule. Conservative reading: counter is now at 3 of 3 (Session 3 rediscovery + Sessions 3.5/4 successful uses + Session 5 successful use). Decision-log cross-reference: D-PE-01-S5-LOADER-VERIFIED.

2. **Two-phase staging within a single session (carried forward, prior count 1 of 3).** Not used this session (single phase). Counter unchanged at 1 of 3.

3. **Diagnostic-via-pipeline_meta spread-conditional (carried forward, prior count 1 of 3).** Not used this session — the proof endpoint's response shape includes `pattern_source` and other fields as top-level keys (not inside a `pipeline_meta` wrapper), so the spread-conditional pattern doesn't apply here. Counter unchanged at 1 of 3.

4. **Sub-decision-after-framing-acceptance pattern (carried forward, prior count 1 of 3).** Not engaged this session — the framing question at session open surfaced all five Q-Loader-* sub-questions explicitly with the framing pick, so no mid-design surfacing of a missed sub-decision happened. Counter unchanged at 1 of 3.

5. **Bypass-flag-as-verification-mechanism (NEW candidate, 1 of 3).** This session introduced an opt-in request-body flag (`bypass_pattern_cache`) specifically as the deterministic mechanism for exercising a code path that natural traffic would not reach (cache-warm labels under per_request + 2A read precedence). The flag earned its place during CCP design when alternatives (DB-mutation-based verification, label-allowlist extension, manual cache-key delete) were considered and rejected as either operationally annoying or architecturally invasive. **Promotion trigger:** if a similar opt-in verification flag earns its place in two more sessions (e.g., a "force_recompute" flag on a future reflect/founder-hub 2A-recompute switch, or an analogous "skip_cache" flag elsewhere), promote to a process pattern under PR8.

6. **Brief-vs-reality misframing (PR8 candidate, 2 of 3 — carried from prior sessions).** No new occurrence this session. Counter unchanged at 2 of 3.

7. **Capability-inventory naming reliability candidate (1 of 3 — carried from prior sessions).** No new occurrence this session. Counter unchanged at 1 of 3.

8. **F-series stewardship — code comment date (carried from Session 3).** No new instance this session. The Session 3 carry-forward (`27 April 2026` → `26 April 2026` in reflect) is still pending; absorbed into ongoing work per PR9.

9. **F-series stewardship — proof endpoint top-of-file JSDoc bullet stale (NEW observation).** The bullet "Uses a hand-constructed fixture profile (not the live profile store)" became stale at ADR-Ring-2-01 Session 1 (25 April 2026, when the proof endpoint started using `loadMentorProfile`) and is now doubly stale post-Session 5. Tiered as Efficiency & stewardship per PR9. Absorbed into ongoing work; will be batched with the next reflect-touching change or the next proof-endpoint-touching change.

## Founder Verification (Between Sessions)

This session produced one git commit plus the five-probe verification, completed in-session. Verification of the documentary trail can be done at any time:

### Step 1 — Confirm the GitHub Desktop push completed

GitHub Desktop's History tab should show a recent commit on `main`:
- "ADR-PE-01 Session 5: live mentor_interactions loader (PR1 single-endpoint proof)"

### Step 2 — Confirm files on GitHub web UI

Navigate to the `sagereasoning` repository on GitHub. Confirm:

- **NEW:** `website/src/lib/mentor-interactions-loader.ts` exists with the `loadMentorInteractionsAsRecords` export. The defensive parse helper `parsePassionsDetected` and the row-mapper `rowToInteractionRecord` are visible inside the file.
- **MODIFIED:** `website/src/app/api/mentor/ring/proof/route.ts` carries the new imports (around lines 53–58: `loadMentorInteractionsAsRecords`, `InteractionsHubId`, `InteractionRecord`); the `bypass_pattern_cache` validation block (around lines 165–198); the parameterised recompute branch with the live loader call (around lines 333–375); the diagnostic fields on the response (around lines 650–652).

### Step 3 — Independent verification (optional)

A re-run of any of the five probes from the consolidated snippet should still show the expected fields, with the encrypted blob's `version` ticking forward by however many probes have been run since.

A clean way to confirm the live-recomputed cache entries are still in place: re-run Probe L1 (founder-mentor, no bypass). Expected: `pattern_source: 'persisted'`, `interactions_source: null` (cache hit), and the `pattern_analysis.interactions_analysed` field reflecting the live row count from the L3 recompute (not the fixture's 15).

### Step 4 — Commit hash for the record (optional)

If you'd like the commit hash recorded inline against `D-PE-01-S5-LOADER-VERIFIED`, share it from GitHub Desktop's History tab. The decision-log entry currently says "Commit hash: TBD per founder share from GitHub Desktop History tab" — the amendment is one small edit. The same applies to the carry-forward placeholders for `D-PE-01-S1-1A-VERIFIED`, `D-PE-01-S2-2A-VERIFIED`, `D-PE-01-S3-3A-VERIFIED`, `D-PE-01-S35-3.5α-VERIFIED`, and `D-PE-01-S4-4B-VERIFIED` (six total now).

### Rollback (only if a future probe fails)

If a future probe shows `pattern_source: 'recomputed'` with `interactions_source: 'fixture_fallback'` despite the founder's profile being known to load live (`profileSource === 'live_canonical'`), that's a regression — the profile_id lookup is failing or the loader is throwing internally. Signal "rollback ADR-PE-01 Session 5". Standard revert via GitHub Desktop → Push origin removes the new loader file and reverts the proof route to its pre-Session-5 behaviour. The founder's persisted live-recomputed `pattern_analyses` entries remain in the blob and stay readable; they become "frozen" until a future cache miss (which, post-revert, would only happen for a brand-new hub label).

If a future probe shows 5xx on the proof endpoint, that would point at an encryption-pipeline regression — same rollback procedure; ADR-PE-01 §10.4 names the post-deploy rollback path.

If a future probe shows `pattern_engine_error` populated despite a non-empty `interactions_count` — that points at a malformed `InteractionRecord` slipping past the loader's defensive mapping. Signal the specific error message from the response; the loader's `rowToInteractionRecord` validation may need tightening.

## Next Session Should

1. **Open with the session-opening protocol.** Read this handoff. The most recent tech handoff is `/operations/handoffs/tech/2026-04-26-ADR-PE-01-S5-loader-close.md` (this file). Scan KG (KG3 will engage if the next session wires another live consumer of the loader; KG7 will engage if the next session adds a writer that JSON.stringify-s an array into a JSONB column; KG1 rule 2 will engage if the next session adds a new conditional write surface). Confirm hold-point posture (still active — pattern-engine integration sits inside the assessment set; this session completed the architectural integration).

2. **Decision: what comes next on ADR-PE-01.** With Session 5 Verified, the remaining ADR-PE-01 work items are:
   - **Per-consumer 2A-recompute switch on reflect (`/api/mentor/private/reflect`).** Per Q-Recompute-Read-Precedence, the existing 2A-skip on absence stays in place until the founder makes the call to switch. Now that the loader is Verified live, switching reflect to 2A-recompute would mean: on cache miss, reflect calls the loader hub-scoped on `'private-mentor'` (already the constant at reflect), runs `analysePatterns`, persists. Critical risk under PR6 (third live consumer of the loader; second live writer of `pattern_analyses`). PR1 single-endpoint discipline applies — the loader proved on the proof endpoint only; switching reflect to 2A-recompute is the rollout step.
   - **Per-consumer 2A-recompute switch on founder-hub (`/api/founder/hub`).** Same as above for the second mentor-touching live consumer. The hub-scoping under the canonical mapper (`mapRequestHubToContextHub`) means the loader would be called for both `'private-mentor'` and `'founder-mentor'` labels depending on request shape.
   - **O-PE-01-B blob-size measurement.** A one-off Supabase probe of `length(encrypted_profile)` to confirm blob size against the 50 KB threshold from ADR §9. Standard risk. Could be batched with any other DB-touching work or with a per-consumer 2A-recompute switch.
   - **Cosmetic `27 April 2026` → `26 April 2026` fix in reflect.** Standard risk. Naturally batches with any reflect-touching change (e.g., the 2A-recompute switch above).
   - **O-PE-01-G (NEW) — `bypass_pattern_cache` long-term posture.** Decide whether the flag stays as an admin diagnostic, retires post-rollout, or is generalised into an operational tool. Defer until natural triggering.
   - **Commit-hash recording across the six `D-PE-01-*-VERIFIED` decision-log entries.** All six currently carry "TBD per founder share" placeholders. Founder shares hashes from GitHub Desktop History → AI amends inline.

3. **Optional cosmetic — Console-snippet auth-cookie discovery promotion.** Per the founder's session-open prompt and this session's evidence, the working pattern (`decodeURIComponent(cookies['sb-access-token'])` reading raw JWT directly) is now used three times successfully without rediscovery (Sessions 3.5, 4, 5). Recommendation: promote to canonical at next session open under PR8's third-recurrence rule. The promotion is an addition to `/operations/knowledge-gaps.md` (or the analogous canonical patterns location) plus a decision-log entry recording the promotion.

4. **Open carry-forward items:**
   - **O-S5-A** — `/private-mentor` chat thread persistence. Pre-existing UX gap. Carries forward unchanged.
   - **O-S5-B** — write-side verification of ADR-Ring-2-01 4b. Carries forward; deferred until natural triggering.
   - **O-S5-D** — static fallback canonical-rewrite revisit. Carries forward unchanged.
   - **O-PE-01-A** (read amplification) — carries forward; now also concretely measurable on the proof endpoint's recompute branch (two new queries per cache-miss / bypass invocation). Will scale materially if reflect / founder-hub switch to 2A-recompute.
   - **O-PE-01-B** (blob-size monitoring) — first measurement opportunity unchanged.
   - **O-PE-01-C** (optional `last_pattern_compute_at` plain column) — defer until a freshness-driven feature requires it.
   - **O-PE-01-D** (write cadence) — resolved for Sessions 1, 2, 3, 3.5, 4, 5 (per_request); revisit at the next per-consumer 2A-recompute switch.
   - **O-PE-01-E** (backfill of existing profiles) — partially resolved for the founder's profile via Probes L3/L4 overwrite; carries forward unchanged for any other practitioners (none currently).
   - **O-PE-01-F** — pattern-read decoupling from `useProjection` / MENTOR_CONTEXT_V2 env var. Defer until V2 feature flag retirement question.
   - **O-PE-01-G (NEW)** — `bypass_pattern_cache` long-term posture. Defer until natural triggering.

## Blocked On

- **Founder direction on next ADR-PE-01 work item.** Per-consumer 2A-recompute switch on reflect / founder-hub vs O-PE-01-B measurement vs Console-snippet promotion vs commit-hash recording vs deferring ADR-PE-01 entirely to start a different stream (P2 ethical safeguards is the next priority per project instructions). Not impeding the next session's open.
- **Nothing else blocking.** The Critical infrastructure for write (Sessions 1, 3, 3.5, 4 + 5), read (Sessions 2, 3, 4 + 5), the live loader (Session 5), and both major mentor-touching live consumers (reflect + founder-hub, still on 2A-skip pending per-consumer 2A-recompute switch) is in place and verified.

## Open Questions

- **Q1 — Commit hash recording for all six `D-PE-01-*-VERIFIED` entries.** Should commit hashes be recorded inline in the six decision-log entries, or kept implicit via git history? Default: implicit. All six currently carry "TBD per founder share" placeholders.
- **Q2 — Console-snippet auth-cookie discovery promotion.** Counter is now arguably 3 of 3 (Session 3 rediscovery + Sessions 3.5/4/5 successful uses). PR8 third-recurrence rule supports promotion. Founder picks at next session open whether to promote.
- **Q3 — Per-consumer 2A-recompute switch priority.** Reflect first (smaller scope, hardcoded `'private-mentor'`) or founder-hub first (the higher-traffic consumer)? Founder picks at the implementation session's plan walk if/when this work begins.
- **Q4 — `bypass_pattern_cache` long-term posture (O-PE-01-G).** Keep, retire, or generalise? Defer until natural triggering.
- **Q5 — Backfill posture for any future practitioners beyond the founder.** Once the loader is rolled out to all live consumers under 2A-recompute, new practitioners will get live-derived `pattern_analyses` entries on first cache miss — no action needed. The founder's profile is the only one with fixture-derived entries in history (now overwritten by Probes L3/L4 to live-derived). Carries forward as a "no action needed" item.
- **Q6 — MENTOR_CONTEXT_V2 feature flag long-term posture.** Carries forward from Session 4 close unchanged. Drives O-PE-01-F revisit timing.

## Process-Rule Citations

- **PR1** — respected. Single-endpoint proof complete on the proof endpoint before any rollout to additional consumers begins. Reflect and founder-hub remain on 2A-skip on absence per Q-Recompute-Read-Precedence; the loader's existence does not auto-switch them.
- **PR2** — respected. Verification immediate: TypeScript clean before deploy; PR2 grep confirmed all variables set on the correct branches and surfaced; live-probe verification completed in-session (five probes, all matching expected shape).
- **PR3** — respected. The loader is read-only; no background processing introduced. The proof endpoint's persistence block (Sessions 1/3.5 writer, unchanged) continues to await its `saveMentorProfile()` call.
- **PR4** — checkpoint cleared at session open and re-confirmed at session close. No model selection change. The proof endpoint's LLM tier unchanged. The loader adds no LLM call.
- **PR5** — respected. KG3 engaged and respected at the type level (`InteractionsHubId`) and at the call-site level (single `proofHubId` variable used at cache-read, loader call, and writer). KG7 engaged and respected (defensive JSONB parse mirroring `mentor-context-private.ts:687-695`). KG1 rule 2 not directly engaged for the loader (read-only) but engaged for the proof endpoint's awaited `loadMentorInteractionsAsRecords` call. One new candidate observation logged (bypass-flag-as-verification-mechanism). Cumulative re-explanation count: zero.
- **PR6** — respected in full. Critical classification named at session open. Critical Change Protocol (0c-ii) executed in full pre-deploy with eleven worst cases (A–K) named. Founder approval obtained explicitly ("I accept worst cases A - K. Go ahead."). Post-deploy verification completed in-session.
- **PR7** — respected. O-PE-01-D revisited and resolved for Session 5 with documented reasoning; revisit condition named (next per-consumer 2A-recompute switch). New O-PE-01-G logged (bypass long-term posture) with explicit deferral reasoning and revisit condition. No other deferred decisions beyond what ADR §12 already lists.
- **PR8** — engaged at observation level (one new candidate at 1 of 3, plus a recommendation to promote Console-snippet auth-cookie discovery to canonical at next session open per the third-recurrence rule). No promotion this session — the founder picks at next session open.
- **PR9** — engaged. New stewardship observation (proof endpoint top-of-file JSDoc bullet stale) tiered as Efficiency & stewardship and absorbed into ongoing work. The carry-forward `27 April 2026` → `26 April 2026` cosmetic remains absorbed in ongoing work per PR9.
- **D-PR8-PUSH** — respected. AI did not attempt to push from the sandbox; founder used GitHub Desktop.
- **D-LOCK-CLEANUP** — not engaged this session (no stale lock observed).
- **AC4** — not directly engaged (no safety-critical function modified). The grep-for-invocation discipline was applied to the new loader and bypass variables as analogues.
- **AC5** — not engaged.
- **AC7** — confirmed not engaged at session open and close.

## Decision Log Entries — Adopted This Session

To be appended to `/operations/decision-log.md` immediately after this handoff is written:

- **D-PE-01-S5-LOADER-VERIFIED** (Adopted 2026-04-26) — ADR-PE-01 Session 5 (live `mentor_interactions` loader, PR1 single-endpoint proof on `/api/mentor/ring/proof`) reaches Verified status. Founder selected Framing A at session open with all defaults: hub-scoped per (user, hub); per-consumer-request cadence; last 90 days + limit 100; keep 2A-skip on absence on existing live consumers (reflect, founder-hub) until loader is Verified live; defer backfill (natural per_request cadence will overwrite on next consumer call); single-endpoint proof target = the proof endpoint. Critical Change Protocol (0c-ii) executed in full pre-deploy with eleven worst cases (A–K) accepted. Five-probe verification completed in-session: L1/L2 (cache hit, no bypass — both labels) returned `pattern_source: 'persisted'`, `interactions_source: null`, `bypass_used: false`; L3/L4 (force recompute via `bypass_pattern_cache: true` — both labels) returned `pattern_source: 'recomputed'`, `interactions_source: 'live_loader'`, `bypass_used: true` — the decisive verification that the loader was actually invoked, returned data, was synthesised through pattern-engine successfully, and the live-recomputed result was persisted; Re-L1 (cache hit on the post-L3 entry) confirmed round-trip end-to-end on real data. Side effect (worst case J accepted): the founder's existing fixture-derived `pattern_analyses['founder-mentor']` and `['private-mentor']` entries were overwritten with live-recomputed entries during verification — partial backfill via opt-in. Commit hash: TBD per founder share from GitHub Desktop History tab.

## Orchestration Reminder (Protocol element 21)

This session was governed end-to-end by `/adopted/session-opening-protocol.md`. All 21 elements applied:

- **Part A (1–8):** Tier declared (1, 2, 3, 6, 8, 9). Canonical sources read in sequence (manifest + project instructions in system prompt; `/adopted/session-opening-protocol.md`; latest tech handoff `2026-04-26-ADR-PE-01-session-3.5-and-4-close.md` end-to-end; `/compliance/ADR-PE-01-pattern-analysis-storage.md` end-to-end with focus on §1.2, §1.4, §3, §6, §7, §8, §9, §10, §12; `/operations/knowledge-gaps.md` end-to-end; `/website/src/app/api/mentor/ring/proof/route.ts` and supporting code (sage-mentor-ring-bridge, mentor-context-private, mentor-ring-fixtures, mentor-profile-store) for code-state plus the `mentor_interactions` schema in `/supabase/migrations/20260412_hub_isolation.sql`). KG scan completed (KG3 engaged, KG7 engaged, KG1 rule 2 engaged at the call site, KG6 not engaged). Hold-point status confirmed (P0 0h still active; this work sits inside the assessment set). Model selection (PR4) checkpoint cleared at session open and re-confirmed at close. Status-vocabulary separation maintained. Signals + risk-classification readiness confirmed. AC7 confirmed not engaged.

- **Part B (9–18):** Critical classification named pre-execution. The Critical Change Protocol (0c-ii) was executed in full visibly in the conversation before any code was written; founder approval obtained explicitly naming worst cases A–K ("I accept worst cases A - K. Go ahead."). PR1 respected (single-endpoint proof on the proof endpoint). PR2 respected (verification immediate via tsc + grep + smoke check + five-probe live verification). PR3 respected (synchronous compute + awaited reads + the unchanged awaited write). PR6 respected in full. PR7 respected (O-PE-01-D resolved for Session 5; O-PE-01-G logged with deferral reasoning). PR8 respected (one new candidate logged at 1 of 3; one recommended promotion at next session open). Scope cap respected — the session ended at Session 5 Verified without expanding into per-consumer 2A-recompute switching on reflect / founder-hub.

- **Part C (19–21):** System stable (no in-flight code changes; live verification complete by founder report). Handoff produced in required-minimum format plus the relevant extensions (Verification Method Used, Risk Classification Record, PR5 Knowledge-Gap Carry-Forward, Founder Verification, Decision Log Entries — Adopted, Process-Rule Citations). This orchestration reminder names the protocol explicitly. No element skipped.

Authority for the work itself was the 2026-04-26 founder approvals: Framing A at session open with all Q-Loader-* defaults; "I accept worst cases A - K. Go ahead." at CCP; "Deployed and page loads fine" at the post-deploy smoke check; "probes all verified" at the post-verification close. The protocol governed *how* the session ran; ADR-PE-01 §1.2 (c), §3, §7, §8 governed *what* the session produced.

---

*End of session close. ADR-PE-01 Session 5 reaches Verified status. The §8 single-endpoint-proof sequence has reached the architectural completion of ADR-PE-01: the live `mentor_interactions` loader is Verified live on the proof endpoint, hub-scoped per (user, hub), per-consumer-request, last 90 days + limit 100, with the `bypass_pattern_cache` flag as the deterministic verification mechanism. Reflect and founder-hub remain on 2A-skip on absence until per-consumer 2A-recompute switching — a future founder decision per Q-Recompute-Read-Precedence.*
