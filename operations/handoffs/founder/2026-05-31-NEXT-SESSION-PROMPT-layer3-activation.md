# Next-Session Prompt — Layer 3 Activation Decision (`SUBSTRATE_LAYER3_ENABLED`)

Paste this whole file into a new session to proceed.

**Stream:** founder. **Tier:** `code-critical` — Critical risk. The Critical Change Protocol (0c-ii) applies to any activation. PR6 may engage (Layer 3 carries the A5.4 R20a deterministic injection — safety-critical). PR17 engaged (any Vercel env-flag change is a founder-performed operational step — walked through live, click by click, NOT handed off). PR15 engaged (Anthropic-primitive considered before any bespoke build). PR10 engaged (PEV loop + diagnostic-certainty signalling).

**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache) + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-31-r20a-gate-activation-close.md` (the A7 gate activation — the 4th/final R20a flag; completed the R20a arc).
**Predecessor decision-log entries:** `D-R20A-GATE-ACTIVATION-2026-05-31` (the gate activation, with the code-read of the Layer-3 dependency); `D-R20A-BATCH-ACTIVATION-REFLECT-AUDIENCE-2026-05-31`; `D-A5-LAYER3-SCAFFOLDED-VERIFIED-2026-05-12` (the A5 Layer-3 service scaffolding).

---

## ⚠️ Read this first — carried-forward state + a finding that reshapes the session (do NOT re-derive blind; DO re-verify at open)

**Production now (as of 2026-05-31):** all four R20a flags are `true` in Vercel (Calling, Reflect, Audience, **Gate** — the gate activated this session, Verified-live in TEST 28/28). `SUBSTRATE_LAYER3_ENABLED` is **UNSET** → `/api/substrate/layer3` returns **503**. `/api/reason` byte-identical for human/web callers. `/api/public-key` steady-state (`substrate-layer2-2026Q2`). Journal distress screening LIVE; R17b realtime-journal encryption LIVE. AC7 not engaged.

**Why Layer 3 looked like the natural next step:** the A7 gate (just activated) attaches `distress_signal=true` to the Layer 2 assessment on mild distress; the *intended* third-layer defence is A5.4 injecting `R20A_DISTRESS_PASSTHROUGH` into the Layer 3 prose, and that injection is gated by `SUBSTRATE_LAYER3_ENABLED`. So "turn on Layer 3 to make the gate's mild-severity benefit surface" was the headline.

**But a code-read during the gate session (2026-05-31, Diagnostic-certain — re-verify at open) found Layer 3 activation is NOT a simple flag flip. The single flag controls TWO different things, and BOTH carry a catch:**

1. **On `/api/reason` (in-process) — the flag is effectively metadata-only / inert.** When ON, `parallel-run.ts:737` runs `applyLayer3Injections(...)` and stores the result in `result.substrate_layer3_response`. `applyLayer3Injections` is **deterministic — it does NOT call `generateProse`, so no new LLM call, no added latency/cost** (`layer3-service.ts:574,582`). It would compute the five deterministic injections (R3 + R19c + R19d + R20a + R18a + R18e) and the A5.4 `R20A_DISTRESS_PASSTHROUGH` when `assessment.distress_signal` is truthy. **HOWEVER `/api/reason/route.ts` does NOT reference `substrate_layer3_response` at all** (confirmed: the route file is not among the files that mention the symbol). So the route **does not serve it to the caller** — the injection is computed and discarded; A5 is fail-open (`parallel-run.ts:755`). **Net: flipping the flag changes nothing the user sees on `/api/reason`, and it does NOT actually surface the gate's mild-severity benefit.** Surfacing that benefit would require a *route code change* (have `/api/reason` read + serve `substrate_layer3_response`) — a separate decision, not a flag flip.

2. **On `/api/substrate/layer3` (public endpoint) — flipping the flag un-503s an UNAUTHENTICATED, Sonnet-calling endpoint.** When OFF → 503 (`substrate_layer3_disabled`, `route.ts:85`). When ON → the handler parses the body and calls `generateLayer3Response`, which **DOES call `generateProse` → a real Sonnet LLM call** (cache AC1). **The handler has NO auth check** (no `requireAuth`, no API key, no Bearer — confirmed by grep), **and the global `middleware.ts` explicitly SKIPS all `/api/` routes** (`middleware.ts:48–55`), so there is **no middleware auth either**. The endpoint's protection today is *the flag being off*. Its intended auth (A10 per-agent credentials) is described in the route's own comments as Stage-3 future work **not yet wired on this surface** (`route.ts:38–47`). **So flipping `SUBSTRATE_LAYER3_ENABLED=true` in production would expose an unauthenticated public POST endpoint that runs Sonnet on arbitrary caller-supplied input — a cost / abuse exposure. This is a likely BLOCKER for a naive activation.**

**Conclusion this prompt is built on:** Layer 3 "activation" is really an **investigate-and-decide** session, not a flip. The flag couples an inert-on-`/api/reason` effect with an un-authenticated-endpoint exposure. The session's job is to confirm both findings by code-read and decide the safe path — which may be "do NOT flip the flag yet; wire auth on `/api/substrate/layer3` first" (its own Critical code session), or "decouple the surfacing of the gate's mild-benefit on `/api/reason` from the public endpoint." Activation may not happen this session, and that is a successful outcome.

---

## The decision this session must make (before any activation)

At open, after the code-read re-verifies the two findings, the AI presents these and the founder elects:

**Option A — Wire auth on `/api/substrate/layer3` first, then activate (Recommended if the goal is the public substrate endpoint).** Treat the auth gap as a blocker: add the dual-auth pattern (API-key / plugin-auth, as `/api/reason` uses; A10 per-agent credentials) to the `/api/substrate/layer3` handler as its own Critical code change (TEST-verify per Option-1 discipline, full CCP), THEN flip `SUBSTRATE_LAYER3_ENABLED`. Closes the exposure before the endpoint goes live. Most work; safest.

**Option B — Surface the gate's mild-benefit on `/api/reason` via a route change, leave the public endpoint gated.** If the actual goal is "the gate's mild-severity redirection language reaches the practitioner," that needs `/api/reason` to read + serve `substrate_layer3_response` — a route code change — and does NOT require un-503ing the public endpoint. But the single flag controls both, so this needs either a separate flag for the public endpoint or the route change plus accepting the public endpoint goes live (back to the Option-A auth concern). Scope carefully; likely a flag-split design first.

**Option C — Defer Layer 3 entirely; do the plaintext-table encryption batch instead.** The gate is active and its mild-benefit being dormant is documented and harmless (the always-on route catch already handles moderate/acute on `/api/reason`). Layer 3 delivers no human-facing value until the public endpoint has consumers (Stage 3 plugin traffic) or the `/api/reason` route change is made. Defer under PR7 with a clear revisit condition; pick up the encryption batch (`mentor_interactions`, `mentor_observations_structured`, `mentor_journal_refs`).

**The AI's open recommendation:** present the verified findings first, then recommend **Option C (defer)** unless the founder has a near-term need for the public substrate endpoint — in which case **Option A**. Reason: today, flipping the flag delivers no user-facing benefit on `/api/reason` (metadata-only) and opens an unauthenticated paid endpoint. Neither serves the founder now. The founder decides.

---

## Pre-conditions (founder confirms at open; AI verifies by read)

1. All four R20a flags still `true` in Vercel (Production); `SUBSTRATE_LAYER3_ENABLED` still UNSET (`/api/substrate/layer3` → 503).
2. The gate-activation governance is committed + pushed and Vercel is green (`D-R20A-GATE-ACTIVATION-2026-05-31` + the close + `run-r20a-gate-probe.ts`).
3. The Cowork project-instructions panel remains paste-synced against `/adopted/project-instructions-snapshot.md` (PR1–PR17).

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — tier, risk class, signals, status vocabulary, model-selection AC1 row; note **Layer 3 translation = Sonnet** per the cache).
2. `/operations/handoffs/founder/2026-05-31-r20a-gate-activation-close.md` (predecessor close — full state; the Layer-3 dependency is described in its "Open Questions" + the decision-log entry).
3. `D-R20A-GATE-ACTIVATION-2026-05-31` (the code-read of the gate↔Layer-3 dependency); `D-A5-LAYER3-SCAFFOLDED-VERIFIED-2026-05-12`.
4. `/manifest.md` targeted sections only: §R3, §R18a, §R18e, §R19/§R19c/§R19d, §R20a, §AC1 (model selection), §AC7 (auth posture), §AC5 (perimeter).
5. **Code-of-the-day (re-verify the two findings — do not trust this prompt blindly):**
   - `website/src/lib/substrate/layer3-service.ts` — `isSubstrateLayer3Enabled()` (`:700`, case-strict `=== 'true'`); `applyLayer3Injections` (`:582`, deterministic, no `generateProse` call); `generateLayer3Response` (`:663`, DOES call `generateProse` → Sonnet); the A5.4 distress injection reading `assessment.distress_signal` (`:419–422`, `R20A_DISTRESS_PASSTHROUGH` at `:398`).
   - `website/src/lib/translation-sandwich/parallel-run.ts` — the Layer-3 gate at `:737` (`isSubstrateLayer3Enabled()` → `applyLayer3Injections` → `result.substrate_layer3_response`; fail-open `:755`).
   - `website/src/app/api/reason/route.ts` — **confirm it does NOT read/serve `substrate_layer3_response`** (grep the file; expect no match). This is finding #1.
   - `website/src/app/api/substrate/layer3/route.ts` — the flag gate (`:85` → 503 when off); the handler (`:99–137`) calling `generateLayer3Response`; **confirm NO auth check** (grep for `requireAuth|api_key|Authorization|Bearer|sr_assent` → expect no match). This is finding #2.
   - `website/src/middleware.ts` — confirm `/api/` is **skipped** (`:48–55`), so no middleware auth on the endpoint.

Confirm at open: tier (`code-critical`, Critical); hold-point status (P0 0h active); model selection (Layer 3 = Sonnet per cache AC1; the A5.4 *injection* is deterministic, no model); status vocabulary; signals/risk class. **Narrate before substantive work** (cache §"AI failure modes"): where we are in the arc (R20a arc complete; this is the Layer-3 decision); what's queued (the encryption batch); what's awaiting the founder (the Option A/B/C election) vs the AI (the code-read re-verification).

## Part B — Procedure

### Step 1 — Re-verify the two findings by code-read (read-only; no change)
Confirm finding #1 (`/api/reason` does not serve `substrate_layer3_response`) and finding #2 (`/api/substrate/layer3` has no auth; middleware skips `/api/`). State each as **Diagnostic-certain / -uncertain** per PR10. If either finding is wrong (e.g. an auth wrapper exists that the prior grep missed — PR12 negative-finding discipline: try multiple queries before concluding absence), the option set changes — say so explicitly.

### Step 2 — Present the decision (Options A / B / C)
Lay out the verified findings plainly (no jargon — founder has no coding background), then Options A/B/C with the AI's recommendation. Founder elects. **If Option C (defer):** record a PR7 deferred-decision entry with the revisit condition (Stage-3 plugin traffic, or a decision to make the `/api/reason` route change) and stop — move to the encryption batch in a later session. **If Option A or B:** proceed; these involve **application code**, so this becomes a build session (not a config flip).

### Step 3 — (Option A/B only) Build under the protocol
Single-endpoint proof (PR1); build-to-wire-verification-immediate (PR2); safety-synchronous (PR3) if the A5.4 injection path is touched. TEST-verify against real Haiku/Sonnet per the Option-1 discipline proven in the gate session (a probe or harness supplied by the AI; founder runs it on `localhost`; PR17). Full Critical Change Protocol (0c-ii) in chat before any deploy. PR15 — name the Anthropic primitive considered before any bespoke auth/build.

### Step 4 — (only if an activation is reached) Critical Change Protocol + Vercel, walked live (PR17)
Six CCP steps in chat; founder "Go ahead" specific to the named risks (esp. the public-endpoint exposure); then the Vercel `SUBSTRATE_LAYER3_ENABLED=true` add + redeploy walked through click-by-click. Rollback = delete the flag + redeploy (and `git revert` any code).

### Step 5 — Verify
Config present + redeploy green; behaviour rests on the TEST evidence; classify diagnostic-certainty (PR10). For Option A, verify the endpoint now rejects unauthenticated calls (the exposure is closed) BEFORE relying on the flag.

### Step 6 — Decision-log entry + session close (full Critical form, or lean if Option C defer)
Per `/adopted/standing-protocol-cache.md`. State the Vercel disposition explicitly (Layer 3 flag state; the four R20a flags unchanged at `true`).

## What is NOT in this session
- Blindly flipping `SUBSTRATE_LAYER3_ENABLED` without resolving the auth-gap finding. If the code-read confirms the exposure, a naive flip is **off the table**.
- The three plaintext-table encryption batch (its own session).
- Stage-3 plugin-originated traffic wiring (A10 per-agent credentials beyond what Layer 3 needs).

## Rollback path (whole session)
If any activation is reached: delete `SUBSTRATE_LAYER3_ENABLED` in Vercel + redeploy (returns `/api/substrate/layer3` to 503), and `git revert` any code commit. If Option C, nothing changes — production is already in the target state.

## Forecast
Most likely outcome: the session confirms that flipping the flag today delivers no `/api/reason` benefit and would expose an unauthenticated paid endpoint, and the founder either (A) commissions the endpoint-auth build first or (C) defers Layer 3 under PR7 and moves to the encryption batch. A clean "we examined it and chose not to flip" is a successful Critical session — the whole point of the pre-activation rigor.

End of prompt. Opens on `main`. Critical-tier — the auth-gap finding is the heart of the session; re-verify it by code-read before any decision, and do not flip the flag until the exposure is resolved.
