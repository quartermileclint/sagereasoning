# Next-Session Prompt — ATL Wrapper Session 8: step 6b — the Public Verification Endpoint

**Stream:** founder.
**Tier:** **`code-critical`** — a new public route + deployment surface. The **full Critical Change Protocol (0c-ii)** applies and is completed visibly in the conversation before the founder deploys. **The build session confirms the risk classification at Step 0** — it is expected to be `code-critical` and should not be talked down (urgency does not reduce classification). PR6 not engaged — the accreditation endpoint does not touch the R20a distress classifier, Zone 2 / Zone 3 logic, or their wrappers. PR1 engaged — this is the single new endpoint that consumes the 6a persistence layer; no rollout to a second endpoint (batch) this session. **KG1** (Vercel five rules) engages — the route reads Supabase. **KG7** engages on read — the route surfaces `passions_persisting` through `rowToAccreditationRecord`'s `Array.isArray` guard. **AC5** — confirm at Step 0 that a public read-only accreditation endpoint is **not** added to the R20a enforcement perimeter (it carries no distress surface); state the finding explicitly. **AC7** — a public, no-auth GET endpoint touches no auth / cookie / session / redirect surface; state the Session-7b-compatibility posture explicitly per AC7 anyway, as the cache requires for any Critical session.
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol — note the `code-critical` row and the **full** templates) + `/adopted/build-sessions-protocol-cache.md` (build-arc context — note the "no current users" governing note: the Critical Change Protocol's step 3 is answered "N/A — only founder + test logins exist"). **Deliverable-of-the-day:** `/adopted/substrate-modes/agent-trust-layer-wrapper-spec.md` — read §"Component 3 — The Badge / Accreditation", §"R-rule engagement" (the **R18 a–e** rows + **R4**), §"The report the agent hands back to the developer", and §"Open questions deferred to build" (**8** — agent identity) — plus the three 6a-built files this session consumes: `/website/src/lib/substrate/atl-accreditation-store.ts`, `/website/src/lib/substrate/trust-layer/accreditation/public-endpoint.ts`, `/website/src/lib/substrate/trust-layer/card/accreditation-card.ts`.
**Predecessor session close (most-recent — same-day brainstorm):** `/operations/handoffs/founder/2026-05-15-post-build-brainstorm-close.md`.
**Predecessor build close (same-day, immediately prior):** `/operations/handoffs/founder/2026-05-15-atl-badge-schema-persistence-close.md`.
**Predecessor decision-log entry:** `D-ATL-BADGE-SCHEMA-PERSISTENCE-WIRED-VERIFIED-2026-05-15` (confirm at session open).

---

## Why this session matters

Step 6a built the badge's foundation — the `agent_accreditation` + `grade_history` tables, the ported `public-endpoint.ts` + `accreditation-card.ts`, and the `atl-accreditation-store.ts` persistence layer with `lookupAccreditationRecord` shaped exactly as `handleAccreditationLookup`'s injected `lookupFn` seam. **Everything is in place except the route that exposes it.** Step 6b wires that route — `GET /api/accreditation/[agent_id]` — the public face of the wrapper: the verifiable credential other humans or agents query to confirm a wrapped agent's reasoning-pattern profile.

After 6b lands, **every ATL Wrapper component is real** — Components 1, 2, 4, 5 and now Component 3 end-to-end — and the post-6b enhancement arc agreed in the brainstorm close (items 1–3 + the kathekon-aligned alternative + the trajectory-enriched developer hand-back report) becomes buildable.

This is the **first public route in the ATL arc** and the **first route to read the 6a tables**, which is why it is `code-critical` and why the 6a/6b split held the route back behind the persistence-layer proof (PR1).

## Predecessor brainstorm context — what is already decided for the post-6b arc

The same-day post-build brainstorm close (cited above) captured a refined post-6b roadmap and four forward-planning decisions. **Read it at session-open** so 6b's "Next Session Should" line points at the right next thing and the build session does not redesign these forward decisions:

- **Updated post-6b sequencing (8 steps):** 6b → items 1–3 design pass → items 1–3 build → trajectory-enriched developer hand-back report → kathekon-aligned alternative design pass → kathekon-aligned alternative build → write-path into `agent_accreditation` → A10 (per-agent credentials). The 6b session's Step 6 close MUST name the **items 1–3 design pass** as its "Next Session Should", not the hand-back report (which now sits two steps later).
- **Items 1, 2, 3 confirmed for the next arc** (build-deferred to after 6b). Item 1: `deliberation_breadth` signal on `EvaluatedAction` (records whether a committed action was deliberated or intuited — currently dropped). Item 2: per-node evaluation contract + tree-search composition guide (PR15 — the ATL is the per-node evaluator; tree search stays agent-side / framework-side; do not reimplement). Item 3: top-k retention as a named pattern (mechanically already possible — agent holds N `CarriedProfile` values; gap is documentation + helpers).
- **Item 4 (original — alternative generation) parked permanently** as a future ideation-product opportunity. Off the post-6b arc.
- **Item 4 reframed adopted in principle: "kathekon-aligned alternative in the handoff."** The substrate offers one normative counterfactual *after* the agent's deliberation has been assessed (NOT before), respecting R0 / R20b / mirror principle. Architecture: a new deterministic Layer 2 mechanism + Layer 3 rendering field + carried-context field. Three concerns to design around: R20b conditional offering, R4 IP boundary, and naming ("perfect sage" rejected; use "kathekon-aligned alternative" or similar). Sequenced after items 1–3 + the hand-back report — design pass first, then build.
- **Layer 1 asked-question multiple-choice (narrowed scope) adopted in principle.** Multiple-choice options for *Layer-1-asked questions only*; agent pick wins, LLM translation is fallback. Implementation contained inside Layer 1 question-handling. Most useful at the 55-assessment onboarding framework (spec open question 7); lower priority for in-loop consultations.
- **Pre-decision model — corrected and recorded:** the substrate is consulted *during* the agent's deliberation, before commit. Layer 1 captures deliberation, not emitted action. The carried profile records deliberation quality over time. The "harness on Claude" framing is real (consultation-during-deliberation, three composition patterns: self-wrapping, outer-agent, substrate-as-skill); it does not reach into the model's tokens, but it does intervene at the deliberation/commit boundary.

**None of these are 6b's work.** They are recorded so 6b's close can correctly hand off to the items-1–3 design pass and so the 6b build session does not re-litigate them.

## The build state going in — almost everything is built

- **`atl-accreditation-store.ts`** — Verified (6a). `lookupAccreditationRecord(agentId): Promise<AccreditationRecord | null>` is the persistence seam — its signature matches `handleAccreditationLookup`'s `lookupFn` parameter exactly (6a's SEAM-1 test compile-checks this). Also exports `upsertAccreditationRecord`, `appendGradeHistory`, `appendInitialGradeHistory` (write paths — not consumed by the read endpoint; see "the genuine design problems" below).
- **`trust-layer/accreditation/public-endpoint.ts`** — Verified (6a, ported). `handleAccreditationLookup(agentId, lookupFn)` returns a discriminated `AccreditationEndpointResponse` — `{status: 'ok', data}` / `{status: 'not_found', message}` / `{status: 'expired', message, data}` / `{status: 'error', message}`. `handleBatchLookup` + `ACCREDITATION_RESPONSE_HEADERS` (CORS `*`, `Cache-Control: public, max-age=300`, an `X-Accreditation-Disclaimer` header) are also exported.
- **`trust-layer/card/accreditation-card.ts`** — Verified (6a, ported). `buildAccreditationCard(record, agentName?)` + `serializeCard(card)` produce the displayable badge object.
- **The `agent_accreditation` + `grade_history` tables** — exist in Supabase (the founder ran `website/supabase-agent-accreditation-migration.sql` between sessions). **They are empty** — no write path has been wired yet.
- **`/api/badge/[id]/route.ts`** — the pre-existing V3 *document-evaluation* SVG badge route. A different concern; **leave it untouched** (the 6a Step 2 route-reconciliation decision). It is the reference for the Next.js dynamic-route `{ params }: { params: Promise<{ id: string }> }` pattern + `checkRateLimit` + `publicCorsHeaders`.
- **`/api/public-key/route.ts`** — the reference for a public, no-auth, CORS + edge-cached GET endpoint with a clean GET / POST-405 / OPTIONS shape and a 503 fail-closed posture.

## The genuine design problems — Step 2 gate

1. **Response body — payload, card, or both.** `handleAccreditationLookup` returns an `AccreditationPayload` (the R4-compliant machine-readable subset). `accreditation-card.ts` produces a richer displayable `AccreditationCard`. The route can serve the payload, the serialized card, or offer both via a `?format=` query param. **Recommendation:** serve the `AccreditationPayload` as the default (it is exactly what `handleAccreditationLookup` is built to return, and it is the R4 boundary); add `?format=card` returning `serializeCard(buildAccreditationCard(record))` for the displayable badge. The build session confirms.
2. **Headers reconciliation.** The ported `ACCREDITATION_RESPONSE_HEADERS` carries CORS + cache + the R3/R9 disclaimer header; the house pattern is `corsHeaders()` / `publicCorsHeaders()` from `/website/src/lib/security.ts`. Decide whether to use the ported constant directly, the house helper, or a merge. **Recommendation:** use `ACCREDITATION_RESPONSE_HEADERS` (it was designed for this endpoint and carries the R3/R9 disclaimer header) — reconcile only if it conflicts with the house CORS posture.
3. **Status-code mapping.** Map `handleAccreditationLookup`'s four `status` values to HTTP: `ok` → 200; `not_found` → 404; `expired` → 200 (the response carries `data` — a known-but-stale credential, per the handler's design); `error` (invalid `agent_id` format) → 400. The build session confirms and documents the mapping.
4. **R18b — the badge-documentation link.** R18b requires the badge to link to documentation of what it measures, how, and its limitations. Step 1 surveys whether a suitable limitations/docs page exists (R19c's limitations page is a Priority 2 item — it may not be live yet). **Recommendation:** include a `documentation_url` field (or reuse the existing `X-Accreditation-Disclaimer` header pattern with a link) pointing to the limitations page; if that page is not live, use a stable placeholder URL and flag the page as a dependency in the close. Do not block 6b on the page existing.
5. **`verification_url` reconciliation (Step 1 survey finding to surface).** `accreditation-record.ts`'s `VERIFICATION_BASE_URL` is `https://sagereasoning.com/accreditation` — so `record.verification_url` points to `/accreditation/{agent_id}` (a future *human-facing* verification page), **not** the API route `/api/accreditation/{agent_id}`. The build session surfaces this: the API route and the `verification_url` page are different surfaces. Decide whether that is fine (the page is future work) or whether anything needs adjusting. **Recommendation:** leave it — the API route is `/api/accreditation/[agent_id]`; the `/accreditation/` human-facing page is future work; flag it in the close.
6. **Verifying the `ok` path with empty tables.** The tables are empty, so a live request returns `not_found` for every agent. To verify the `ok` and `expired` paths end-to-end, the build session provides a small **seed SQL snippet** (one test agent — e.g. `agent_test_v1`) the founder runs in the Supabase SQL Editor before visiting the URL, plus a **cleanup `DELETE`** after. The build session decides the exact seed row.
7. **Batch endpoint — defer.** `handleBatchLookup` exists in the ported file. **Recommendation:** do not wire a batch endpoint this session — PR1 single-endpoint discipline; batch is a clean follow-on once `GET /api/accreditation/[agent_id]` is Verified. Record the deferral per PR7.
8. **The write path is out of scope and must be named.** Nothing writes to `agent_accreditation` yet — the wrapper (`atl-wrapper.ts` / `atl-iteration-patterns.ts`) is wrapper-side carriage. How an `AccreditationRecord` gets *into* the table (a wrapper persist call, an onboarding result, an internal admin write) is a genuine open question — connects to spec open question 7 (onboarding) and the `agent_id` authentication question (spec open question 8 / A10). **6b wires the READ endpoint only.** The build session names the write-path question as a flagged follow-on; it does not solve it. Per the brainstorm sequencing, the write-path lands at step 7 of the post-6b arc.

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min) — tier, model selection, risk class (note the `code-critical` row → **full** templates, not lean), signals, KG1, KG7, PR15 discipline.
2. `/adopted/build-sessions-protocol-cache.md` (~3 min) — build-arc context; **the "no current users" governing note** — the Critical Change Protocol's step 3 ("what happens to existing sessions") is answered "N/A — only founder + test logins exist; no third-party sessions"; all other Critical Change Protocol steps remain in full force.
3. **`/operations/handoffs/founder/2026-05-15-post-build-brainstorm-close.md` (~5 min)** — the most-recent close. **Carries the post-6b sequencing + the four forward-planning decisions** the 6b session must respect. The "Next Session Should" line in 6b's own close is determined by the sequencing recorded here.
4. `/operations/handoffs/founder/2026-05-15-atl-badge-schema-persistence-close.md` (~5 min) — the build close immediately preceding the brainstorm; the 6a build state, the carried-forward findings, the Founder Verification that was run.
5. `/adopted/substrate-modes/agent-trust-layer-wrapper-spec.md` — §"Component 3", §"R-rule engagement" (R18 a–e + R4), §"The report the agent hands back to the developer", §"Open questions deferred to build" (8) (~8 min).
6. `/website/src/lib/substrate/atl-accreditation-store.ts` (~5 min) — the persistence layer; `lookupAccreditationRecord` is the seam this route consumes; note the module header's KG1 + KG7 postures.
7. `/website/src/lib/substrate/trust-layer/accreditation/public-endpoint.ts` (~4 min) — `handleAccreditationLookup`, the `AccreditationEndpointResponse` union, `ACCREDITATION_RESPONSE_HEADERS`.
8. `/website/src/lib/substrate/trust-layer/card/accreditation-card.ts` (~3 min) — `buildAccreditationCard` + `serializeCard` (only needed if the `?format=card` option is elected).
9. `/website/src/app/api/badge/[id]/route.ts` + `/website/src/app/api/public-key/route.ts` (~5 min) — the two reference routes: the Next.js dynamic-route param pattern, `checkRateLimit` + `RATE_LIMITS`, the CORS/cache/OPTIONS shape, the fail-closed posture.
10. `/website/src/lib/security.ts` — targeted: `checkRateLimit`, `RATE_LIMITS`, `corsHeaders` / `publicCorsHeaders` / `corsPreflightResponse` (~3 min).
11. `/website/src/lib/supabase-server.ts` (~1 min) — `supabaseAdmin` (already consumed by `atl-accreditation-store.ts`).
12. `/manifest.md` §R18 (a–e), §R4, §R3, §R9, §AC5 (confirm the endpoint is NOT in the R20a perimeter), §AC7, §KG1, §KG7 (targeted).
13. `/operations/decision-log.md` — last 3 entries (`D-ATL-BADGE-SCHEMA-PERSISTENCE-WIRED-VERIFIED-2026-05-15`, `D-ATL-ITERATION-PATTERNS-WIRED-VERIFIED-2026-05-15`, `D-ATL-WRAPPER-WIRED-VERIFIED-2026-05-15`).
14. **PR15 consult — before electing the route build:** `.claude/skills/anthropic/` for `SKILL.md` patterns matching the scope (`mcp-builder` is genuinely worth a closer look here — R18c interoperability means the verification surface *could* later also be an MCP server; the build session evaluates whether 6b should be the Next.js route only, or the Next.js route now with an MCP-server follow-on noted — but the spec's named surface for 6b is the Next.js route, and no Anthropic primitive substitutes for it); `/operations/agentic-commerce-findings-downstream-order.md` for any F-finding targeting this session. **PR11 inbox scan:** `/inbox/` for files dated since the brainstorm close (2026-05-15 15:57) — summarise inline or state none.

**Confirm at session open:** tier (`code-critical` — confirm, do not talk down); hold-point status (P0 0h active); model selection — confirm **N/A** (the route reads + serves deterministic records; it makes no LLM call); status vocabulary; signals + risk classification; KG1 + KG7 engagement; AC5 finding (not in the R20a perimeter — stated explicitly); AC7 posture (no auth/cookie/session/redirect surface — stated explicitly); PR11 inbox-scan result.

## Part B — Procedure

### Step 0 — Confirm session scope + risk classification (founder gate; ~5 min)

State the scope: **wire `GET /api/accreditation/[agent_id]` — the read endpoint only.** Confirm the risk classification is **`code-critical`** (new public route + deployment surface) and that the full Critical Change Protocol applies. Confirm what is **out of scope**: the batch endpoint (deferred — PR1), the write path into `agent_accreditation` (a flagged follow-on — sequenced as step 7 of the post-6b arc per the brainstorm close), the human-facing `/accreditation/` verification *page*, the trajectory-enriched hand-back report (sequenced as step 4), items 1–3 (sequenced as steps 2–3), the kathekon-aligned alternative (sequenced as steps 5–6). Founder confirms.

### Step 1 — Survey the route surface (~20–30 min)

Read the reference routes + `security.ts` + the three 6a-built files. Output (~12–15 lines in-chat): the Next.js dynamic-route param pattern (`[agent_id]` → `{ params }: { params: Promise<{ agent_id: string }> }`); the rate-limit pattern (`checkRateLimit` + which `RATE_LIMITS` entry — likely `publicAgent`); the header decision (`ACCREDITATION_RESPONSE_HEADERS` vs `publicCorsHeaders()`); the `status` → HTTP-code mapping; whether an R18b docs/limitations page exists (and the placeholder plan if not); the `verification_url` reconciliation finding (point 5 above); the route-file location (`/website/src/app/api/accreditation/[agent_id]/route.ts`).

### Step 2 — Design-decision gate + Critical Change Protocol (founder approval; ~25–35 min)

Surface the design decisions (points 1–7 from "the genuine design problems") as one consolidated change set, each with a recommendation + reasoning; the founder elects.

Then complete the **Critical Change Protocol (0c-ii) visibly in the conversation**:

1. **What is changing** — plain language: a new public web address, `sagereasoning.com/api/accreditation/{agent_id}`, that returns an agent's reasoning-pattern credential as JSON.
2. **What could break** — the specific worst case. A new route file does not alter existing routes (Next.js routes are independent), so the realistic worst cases are: the route misconfigured (wrong CORS / no rate limit / leaks more than the `AccreditationPayload` — an R4 breach); a Supabase read error surfacing as a 500 instead of a clean failure; the build failing on deploy.
3. **What happens to existing sessions** — **N/A — only founder + test logins exist** (build-arc "no current users" note). No third-party sessions to invalidate.
4. **Rollback plan** — exact, founder-performable: delete `/website/src/app/api/accreditation/[agent_id]/route.ts`, `git revert <commit>`, push via GitHub Desktop. The endpoint then returns 404 (route not found); no other surface is affected; the tables stay (empty or with the test row — a `DELETE` clears the test row).
5. **Verification step** — exact: after deploy, the founder runs the seed SQL (one test agent), visits `https://sagereasoning.com/api/accreditation/agent_test_v1` in a browser, confirms the JSON shape against the expected output the build session provides, then visits a non-existent `agent_id` and confirms a clean 404, then runs the cleanup `DELETE`.
6. **Explicit approval** — the founder says "OK" / "go ahead" specific to the named risks before the build session writes the route.

### Step 3 — Build the route (PR1; PR2; ~50–70 min)

Per the Step 2 decisions: write `/website/src/app/api/accreditation/[agent_id]/route.ts` — a `GET` handler that extracts `agent_id` from `params`, calls `handleAccreditationLookup(agentId, lookupAccreditationRecord)`, maps the `AccreditationEndpointResponse` to a `NextResponse` with the elected status code + headers; an `OPTIONS` handler for CORS preflight; a `POST`/etc → 405. KG1 — the route's five-rule posture stated in the file header (the read is awaited inside `lookupAccreditationRecord`; no self-calls; no redirects; no background work). PR1 — this single route is the proof; the batch endpoint is not built. PR2 — write a route-level test (`/website/src/app/api/accreditation/[agent_id]/__tests__/route.test.ts` or the substrate `__tests__` pattern) that invokes the `GET` handler with a fake/seeded `lookupFn` path where testable, or — if the route cannot be unit-tested without a live request — document the founder's post-deploy URL check as the PR2 discharge and say so explicitly.

### Step 4 — Verify

`tsc --noEmit`; the full regression suite (now **ten** suites — the nine prior-arc + `atl-accreditation-store` 79/0); the route's own test if one was written. Use the corrected verification form per `/CLAUDE.md` §"Running the substrate test suite" — plain `npx tsx` for the Supabase-free tests, `npx tsx --env-file=.env.local` for `atl-accreditation-store` / `agent-mode-service` / `philosophical-mode-service`; run one line at a time. The **Critical** verification is the founder's post-deploy URL check (Critical Change Protocol step 5) — provide the seed SQL, the URL, the expected JSON, and the cleanup `DELETE`. PR10 PEV Verify step — classify any diagnostic finding's certainty. If running in-sandbox, install `tsx` on the sandbox's native `/tmp` filesystem (`/tmp/sage-tsx`) per the predecessor sessions' documented esbuild-platform caveat.

### Step 5 — Append decision-log entry (FULL form — Critical)

Critical sessions use the **full** decision-log entry, not the lean form. Suggested: `D-ATL-PUBLIC-ACCREDITATION-ENDPOINT-WIRED-VERIFIED-YYYY-MM-DD`. Record the Step 2 decisions, the Critical Change Protocol responses, the route build, and the deferred batch endpoint (PR7). Rules served expected: 0a, 0c, 0c-ii, 0d-ii, 0f, R3, R4, R9, R18 (a–e), AC5, AC7, AC8, KG1, KG7, PR1, PR2, PR7, PR10, PR11, PR15.

**Optional companion entry — the brainstorm forward-planning decisions.** The 2026-05-15 post-build brainstorm took four forward-planning decisions (items 1–3 confirmed; item 4 original parked; item 4 reframed as kathekon-aligned alternative adopted in principle; Layer 1 asked-question multiple-choice narrowed-scope adopted in principle) that are PR7-relevant and currently live only in the brainstorm close. The 6b session MAY append a small companion decision-log entry capturing them under PR7 ("Decisions Not Made Are Documented" / decisions deferred), at the founder's election. Suggested name: `D-POST-6B-ARC-SEQUENCING-PR7-2026-05-15`. This is optional; the brainstorm close is sufficient as the immediate carrier and the items-1–3 design pass session can capture them when it lands.

### Step 6 — Session close (FULL form — Critical)

`/operations/handoffs/founder/YYYY-MM-DD-atl-public-accreditation-endpoint-close.md` per the **full** session-close template — including the Critical-session additional sections: Verification Method Used, Risk Classification Record, PR5 Knowledge-Gap Carry-Forward, Founder Verification (Between Sessions), Orchestration Reminder.

**"Next Session Should" — per the brainstorm sequencing — names the items 1–3 design pass.** Specifically: a design pass to lock (a) where `deliberation_breadth` lives (`EvaluatedAction`? `Layer2Assessment`? both?), (b) the live-candidates carried-context field shape (the multi-branch-carry gap from the brainstorm), (c) whether the tree-search composition lands as a doc, a small helper, or a new Component 5 pattern, and (d) the top-k retention pattern's exact ergonomics. NOT the trajectory-enriched developer hand-back report (which is step 4 of the post-6b arc, two steps later). NOT the kathekon-aligned alternative (step 5–6, four steps later). NOT the write-path (step 7).

Carry forward (in the close's open-questions block): the items-1–3 design questions; the kathekon-aligned alternative design pass + concerns (R20b conditional offering, R4 IP boundary, naming); the trajectory-enriched developer hand-back report; the write-path question + spec open questions 7 (onboarding) and 8 (agent identity → A10); the Layer 1 asked-question multiple-choice (narrowed scope) for the onboarding framework; the spec-hygiene finding (§Component 2 still owes the superseded agent-mode spec's content inline); the deferred schema tables (`evaluated_actions` / `onboarding_results` / `progression_sessions`); the batch endpoint (deferred this session, PR7); the R18b docs-page dependency if it was placeholdered; the `/accreditation/` human-facing page; R18d adversarial evaluation (Priority 3.3d).

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Caches + brainstorm close + build close + ATL Wrapper spec + the three 6a files + reference routes + decision log + PR15 consult (Part A) | 40–50 min |
| Step 0 — scope + risk confirmation | 5 min |
| Step 1 — survey the route surface | 20–30 min |
| Step 2 — design-decision gate + the full Critical Change Protocol | 25–35 min |
| Step 3 — build the route | 50–70 min |
| Step 4 — verify (tsc + 10 regressions + the route test; the founder's post-deploy check is between-sessions) | 25–35 min |
| Step 5 — decision-log entry (full form; optional companion PR7 entry) | 20–30 min |
| Step 6 — session close (full form) | 20–25 min |
| **Total** | **~3.5–4.5 hr** |

## Pre-conditions

1. **Step 6a is committed + pushed; Vercel green.** `git log --oneline -3 origin/main` shows the 6a commit and the brainstorm-close commit; `git status` clean. If a stale `.git/index.lock` is present, clear it first — `rm -f .git/index.lock`.
2. **The brainstorm close + the rewritten 6b prompt are committed + pushed** (this prompt itself is the rewritten one). Confirm at session-open by reading the brainstorm close.
3. **The 6a migration has been run** — `agent_accreditation` + `grade_history` exist in Supabase. (The founder confirmed this between sessions.) The build session can confirm at session-open by having the founder run a one-line `SELECT` if in doubt.
4. **`D-ATL-BADGE-SCHEMA-PERSISTENCE-WIRED-VERIFIED-2026-05-15` is in `/operations/decision-log.md`.** Confirm at session open.
5. **`trust-layer-bridge.ts` is retired** — `website/src/lib/trust-layer-bridge.ts` no longer exists (the founder's `git rm` completed the retirement). Confirm at session open.
6. **The 6a build outputs are Verified** — `atl-accreditation-store.ts` (79/0), the two ported badge files, and the nine prior-arc regressions. Run the verification suite as a session-open regression check.
7. **Production state unchanged** — substrate at A7 Verified; all substrate env flags UNSET; `/api/reason` byte-identical; `/api/substrate/layer3` returns 503.
8. **Founder commits to a ~3.5–4.5 hr bounded Critical session** and is available to (a) give explicit approval against the named Critical Change Protocol risks at Step 2, and (b) between sessions: run the seed SQL, visit the deployed URL to verify, run the cleanup `DELETE`, then commit + push.

## What this session does — and does NOT do

**Does:** read the ATL Wrapper spec §"Component 3" + the three 6a-built files + the reference routes in full; absorb the post-6b sequencing from the brainstorm close; run the PR15 consult; run the Step 2 design-decision gate + the full Critical Change Protocol visibly; build `/website/src/app/api/accreditation/[agent_id]/route.ts` — the public read endpoint — consuming `handleAccreditationLookup` + `lookupAccreditationRecord`; write a route test (or document the post-deploy URL check as the PR2 discharge); run the regression suite; append a **full-form** decision-log entry (and optionally a small PR7 companion for the brainstorm decisions); write a **full-form** session close with the Critical-session sections, with "Next Session Should" pointing at the items 1–3 design pass.

**Does NOT:**
- **Wire a batch endpoint.** `handleBatchLookup` stays unused — deferred per PR1, recorded per PR7.
- **Build any of items 1–3** (the deliberation_breadth field, the per-node evaluation contract / tree-search composition guide, or the top-k retention pattern). They get their own design pass + build sessions per the brainstorm sequencing.
- **Build the kathekon-aligned alternative** (the reframed item 4). Sequenced four steps later — design pass first, then build.
- **Build the write path into `agent_accreditation`.** Sequenced as step 7. Connects to onboarding / spec open question 7, and `agent_id` authentication / spec open question 8 / A10.
- **Build the trajectory-enriched developer hand-back report.** Sequenced as step 4 — buildable after items 1–3.
- **Build the human-facing `/accreditation/` verification page** (distinct from the `/api/accreditation/` route).
- Touch `/api/badge/[id]` (the V3 document-evaluation badge — a different concern), `/api/reason`, env vars, the R20a perimeter, or any auth surface.
- Build **R18d adversarial evaluation** — Priority 3.3d, its own work item.

## Verification commands (session-open regression check + Step 4)

Run from `website/`, one line at a time (per `/CLAUDE.md` §"Running the substrate test suite"):

```
npx tsc --noEmit -p tsconfig.json                                                            # clean, exit 0
npx tsx --env-file=.env.local src/lib/substrate/__tests__/atl-accreditation-store.test.ts     # 79 passed / 0 failed
npx tsx src/lib/substrate/__tests__/atl-iteration-patterns.test.ts                           # Total: 64  Pass: 64
npx tsx src/lib/substrate/__tests__/atl-wrapper.test.ts                                      # Total: 55  Pass: 55
npx tsx src/lib/substrate/__tests__/atl-bridge.test.ts                                       # Total: 31  Pass: 31
npx tsx src/lib/substrate/__tests__/score-architecture.test.ts                               # 69 pass / 0 fail
npx tsx src/lib/substrate/__tests__/layer3-service.test.ts                                   # 28 pass / 0 fail
npx tsx src/lib/substrate/__tests__/r20a-gate.test.ts                                        # 33/33 pass
npx tsx src/lib/translation-sandwich/__tests__/layer1-schema-additions.test.ts               # 33 pass / 0 fail
npx tsx --env-file=.env.local src/lib/substrate/__tests__/agent-mode-service.test.ts          # Total: 63  Pass: 63
npx tsx --env-file=.env.local src/lib/substrate/__tests__/philosophical-mode-service.test.ts  # Total: 43  Pass: 43
# + the new route test if one is written
```

## Rollback path

The route file is new and additive — Next.js routes are independent, so adding it alters no existing route. Rollback: delete `/website/src/app/api/accreditation/[agent_id]/route.ts`, `git revert <commit>`, push via GitHub Desktop — the endpoint then returns 404 (route not found) and nothing else is affected. The `agent_accreditation` + `grade_history` tables are unaffected by a code rollback (they persist); any seeded test row is cleared with the `DELETE` provided in Step 4. `/api/reason`, `/api/substrate/layer3`, `/api/badge/[id]`, and the rest of the substrate are unaffected. No data loss.

## Forecast

A successful 6b session makes the **badge real end-to-end** — `GET /api/accreditation/[agent_id]` serves a wrapped agent's `AccreditationPayload` (and optionally the displayable card), reading the 6a `agent_accreditation` table through the `lookupAccreditationRecord` seam, behind rate limiting and CORS, with the R3/R9 disclaimer and the R18b documentation link. After 6b, **every ATL Wrapper component is real**, and the post-6b enhancement arc agreed in the brainstorm close becomes buildable in its sequenced order:

**Steps 2–8 of the post-6b arc:** items 1–3 design pass (locks deliberation_breadth shape, live-candidates carried-context field, tree-search composition framing, top-k retention pattern) → items 1–3 build (additive Layer 1 / `EvaluatedAction` schema additions; PR15-aligned — the ATL is the per-node evaluator, tree search stays agent-side) → trajectory-enriched developer hand-back report (now richer because it has the deliberation-breadth signal) → kathekon-aligned alternative design pass (R20b conditional-offering policy, R4 IP boundary, naming — "perfect sage" rejected for R18a-honesty) → kathekon-aligned alternative build (new deterministic Layer 2 mechanism + Layer 3 rendering field + carried-context field, integrating with the live-candidates field from items 1–3) → write-path into `agent_accreditation` (connects to onboarding / spec open question 7 + `agent_id` authentication) → A10 (per-agent credentials + revocation API; the R20a perimeter re-evaluation per the manifest's perimeter-broadening note).

Proceed accepting the recommended Step 2 options (the read-endpoint-only scope; the `AccreditationPayload` default body with a `?format=card` option; `ACCREDITATION_RESPONSE_HEADERS`; the deferred batch endpoint). Verified, committed, and Vercel green between sessions — and, because this is Critical, the founder's post-deploy URL check is part of the verification, not optional.

End of prompt.
