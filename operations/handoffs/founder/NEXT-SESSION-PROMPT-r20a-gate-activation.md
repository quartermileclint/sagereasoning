# Next-Session Prompt — A7 Gate Activation (the deferred 4th R20a flag, `SUBSTRATE_R20A_GATE_ENABLED`)
Paste this whole file into a new session to proceed.

**Stream:** founder. **Tier:** `code-critical` — **Critical** risk. The Critical Change Protocol (0c-ii) APPLIES — see Part B Step 3. **PR6 engaged** (R20a perimeter — safety-critical, always Critical). **PR17 engaged** (the Vercel env-flag change is a founder-performed operational step — walked through live, click by click, NOT handed off). **AC2 paid live** if the gate makes a fresh classifier call. This session activates **one** flag: the shared A7 substrate gate. It is the **largest-blast-radius** R20a flag and the prompt's predecessor deliberately deferred it — read the "carried-forward state" below before anything.

**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache) + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-31-r20a-calling-activation-close.md`.
**Predecessor decision-log entries:** `D-R20A-BATCH-ACTIVATION-REFLECT-AUDIENCE-2026-05-31` (contains the **PR7 deferral record** for this flag, with the revisit condition); `D-R20A-CALLING-ACTIVATION-2026-05-31`; `D-R20A-C2-LIVE-RUN-VERIFIED-2026-05-30` (the TEST live-run that did **not** include this flag).

---

## ⚠️ Read this first — carried-forward state (do NOT re-derive)

**Three of the four R20a flags are already live in production** (activated 2026-05-31, each under its own CCP + live PR17 walkthrough, config-verified):
- `SUBSTRATE_CALLING_R20A_ENABLED = true` — `/api/calling` catch.
- `SUBSTRATE_REFLECT_R20A_ENABLED = true` — `/api/practice/reflect` catch.
- `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED = true` — `/api/reason` API-caller redirect output is developer-form.

**The fourth flag — `SUBSTRATE_R20A_GATE_ENABLED` (the A7 substrate gate) — is UNSET (deferred).** This session activates it. It was deferred deliberately, for three reasons that must shape this session:

1. **Not Verified-live.** C2's live Haiku run (`D-R20A-C2-LIVE-RUN-VERIFIED-2026-05-30`) set Calling + Reflect + Audience and **explicitly excluded this flag** — see `website/scripts/whole-system-harness/run-c2.ts` lines 30–33, 408 ("SUBSTRATE_R20A_GATE_ENABLED is NOT required — /api/reason route-guard is always-on"). So the A7 gate is unit/invocation-Verified + `tsc` green, **not Verified-live**. This is the one R20a flag with no live evidence.
2. **Largest blast radius.** Unlike the per-route flags (which use `overrideFlag: true` and touch one route each), this flag has **no override** — it runs inside the shared substrate path (`runSandwichInner`) and affects `/api/reason` and any future substrate consumer, not one isolated route. Reader: `r20a-gate.ts:238` `isSubstrateR20aGateEnabled()`, case-strict `=== 'true'`.
3. **Main new effect is inert in current production.** A7's headline contribution is the **mild-severity** path: it detects mild distress → attaches `distress_signal=true` to the Layer 2 assessment → A5.4 injects the redirection pass-through into the **Layer 3 prose**. But **`SUBSTRATE_LAYER3_ENABLED` is UNSET in production** (`/api/substrate/layer3` → 503), so that prose never serves — the mild-severity benefit does not surface until Layer 3 is also enabled. `/api/reason` already has an **always-on** route-level moderate/acute catch on `input` (independent of this flag), so activating the gate today adds **defence-in-depth** + **forward protection** (no substrate consumers exist yet) — it removes no existing protection, but its signature feature is dormant.

**Production now (as of 2026-05-31):** 3 of 4 R20a flags `true`; `SUBSTRATE_R20A_GATE_ENABLED` UNSET; `SUBSTRATE_LAYER3_ENABLED` UNSET (Layer 3 → 503); `/api/reason` byte-identical for human/web callers (API-caller redirect output now developer-form); `/api/public-key` steady-state (`substrate-layer2-2026Q2`). Journal distress screening LIVE; R17b realtime-journal encryption LIVE. AC7 not engaged.

---

## The decision this session must make BEFORE activating (don't skip)

Because this flag is not Verified-live and its benefit is dormant while Layer 3 is off, the predecessor's PR7 revisit condition is explicit: activate it **with a live probe or a TEST run that sets `SUBSTRATE_R20A_GATE_ENABLED` specifically**, and **consider Layer 3 activation** so the mild-severity benefit actually surfaces. So at session open, the AI presents these options and the founder elects:

**Option 1 — Live-verify in TEST first, then activate (Recommended).** Stand up / reuse the TEST env (per `data-room/04_test_brief/test-env-standup-checklist.md` + `test-flag-config.md`), set `SUBSTRATE_R20A_GATE_ENABLED='true'` in `website/.env.local`, run a gate-specific live probe against real Haiku (confirm A7 fires inside `runSandwichInner` on `/api/reason` and the fail-CLOSED outer wrapper behaves), THEN activate in production with live evidence in hand. This closes the "not Verified-live" gap before touching production. Most thorough; mirrors how C2 proved the other three.

**Option 2 — Activate in production now, defence-in-depth only, accept dormant mild-path.** Flip the flag in production with eyes open: additive defence-in-depth, reversible in one redeploy, but not live-verified and the mild-severity feature stays inert until Layer 3 is enabled. Lowest effort; weakest evidence.

**Option 3 — Pair with Layer 3.** Treat Layer 3 activation (`SUBSTRATE_LAYER3_ENABLED`) as a prerequisite so the gate's mild-severity prose injection actually surfaces — but note Layer 3 activation is **its own Critical change** with its own blast radius and must get its own CCP; do not bundle silently. This likely becomes a two-flag session or two sequenced sessions.

The AI's open recommendation: **Option 1** (live-verify in TEST, then production). The founder decides at open.

---

## Pre-conditions (founder confirms at open; AI verifies by read)

1. The three activated R20a flags are still `true` in Vercel (Production); `SUBSTRATE_R20A_GATE_ENABLED` still UNSET.
2. The batch governance commit (`D-R20A-BATCH-ACTIVATION-REFLECT-AUDIENCE-2026-05-31` + the updated close) is pushed and Vercel is green.
3. The Cowork project-instructions panel remains paste-synced against `/adopted/project-instructions-snapshot.md` (PR1–PR17).

---

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — tier, risk class, signals, status vocabulary, model-selection AC1 row for the safety classifier).
2. `/operations/handoffs/founder/2026-05-31-r20a-calling-activation-close.md` (the predecessor close — full session state).
3. `D-R20A-BATCH-ACTIVATION-REFLECT-AUDIENCE-2026-05-31` (esp. the **PR7 deferral record** for this flag) + `D-R20A-C2-LIVE-RUN-VERIFIED-2026-05-30`.
4. `/manifest.md` targeted sections only: §R20a; §AC5 (perimeter); §AC2 (synchronous safety / latency budget); §AC7 (gate disposition).
5. Code-of-the-day:
   - `website/src/lib/substrate/r20a-gate.ts` — `isSubstrateR20aGateEnabled()` (line 238; case-strict), `enforceLayer2R20aGate` (the default/non-override path), `attachDistressSignalToAssessment`, the fail-CLOSED outer wrapper, the A7↔A5.4 (Layer 3) dependency.
   - The substrate orchestrator that calls `enforceLayer2R20aGate` on the `/api/reason` path (`runSandwichInner` in `website/src/lib/translation-sandwich/parallel-run.ts`) — confirm the call site, the sequencing (after Layer 1, before `applyMechanisms`), and whether the route passes a SafetyGate (zero added latency) or A7 makes a fresh classifier call (~500ms, AC2).
   - **Confirm whether `/api/reason`'s production path even invokes `runSandwichInner`** while Layer 3 is off — this determines what the flag actually does in production today. State the finding before proceeding.

Confirm at open: tier (`code-critical`, Critical); hold-point status (P0 0h active); model selection (Haiku for the distress classifier; cite AC1 — reused); status vocabulary; signals/risk class. Narrate before substantive work: where we are in the arc (3 of 4 R20a flags live; this is the 4th + last); what's queued (the plaintext-table encryption batch; any Layer 3 decision); what's awaiting the founder vs the AI.

---

## Part B — Procedure

### Step 1 — Present the activation-approach decision (the three options above)
Lay out Option 1 / 2 / 3 with the AI's recommendation (Option 1). Founder elects. If Option 1, do Step 2; if Option 2, skip to Step 3; if Option 3, scope the Layer 3 CCP as a separate change first.

### Step 2 — (Option 1 only) Live-verify in TEST, walked through live (PR17)
Per `data-room/04_test_brief/`: reuse or stand up the TEST env; set `SUBSTRATE_R20A_GATE_ENABLED='true'` (plus the supporting flags the gate path needs — Layer 3 etc. per `test-flag-config.md`) in `website/.env.local` (NEVER production); run a gate-specific probe against real Haiku confirming A7 fires inside `runSandwichInner` and the fail-CLOSED wrapper holds. The harness/probe is supplied by the AI; the founder runs it on `localhost` (the Cowork sandbox cannot reach localhost) and reports the ledger. Classify the diagnostic certainty (PR10). Production untouched in this step.

### Step 3 — Critical Change Protocol (0c-ii), in chat, BEFORE touching Vercel
Complete all six visibly and get approval specific to the named risks:
1. **What changes** — `SUBSTRATE_R20A_GATE_ENABLED` set to `true` in Vercel (Production); on redeploy, A7 runs inside the substrate path on `/api/reason`. Plain language: the substrate's own distress gate turns on as a second layer behind the always-on route catch.
2. **What could break** — (a) largest blast radius: every `/api/reason` substrate call routes through A7 (name whether latency is zero via gate-reuse or ~500ms fresh classifier per the Step-A code-read); (b) the fail-CLOSED outer wrapper redirects on any unexpected throw (conservative; no users); (c) the mild-severity benefit is inert until Layer 3 is enabled — state plainly so the founder isn't expecting a user-visible change.
3. **What happens to existing sessions** — none; forward-looking; no stored data; no schema change.
4. **Rollback** — delete `SUBSTRATE_R20A_GATE_ENABLED` in Vercel → Settings → Environment Variables → Remove → redeploy. Under a minute; nothing persisted. Provide the exact path.
5. **Verification** — env var present (Production = `true`) + redeploy green; plus the Step-2 TEST evidence if Option 1 was taken.
6. **Explicit approval** — founder says "Go ahead", specific to the largest-blast-radius framing.

### Step 4 — Execute the activation (PR17 — walked through LIVE, click by click)
1. Vercel → SageReasoning project → **Settings** → **Environment Variables**.
2. **Add New** → Key: `SUBSTRATE_R20A_GATE_ENABLED` → Value: `true` (lowercase, exact — case-strict reader) → Environment: **Production** only → **Save**.
3. **Deployments** → latest production deployment → **⋯** → **Redeploy** → confirm → wait for **Ready** (green).
Directed live, one step at a time, with a confirmation check after each (not a one-line hand-off).

### Step 5 — Verify
- **Config present:** `SUBSTRATE_R20A_GATE_ENABLED = true` listed under Production; redeploy green.
- **Behaviour:** rests on the Step-2 TEST evidence (Option 1) or stated as defence-in-depth-only / not-live-verified (Option 2). Classify diagnostic certainty (PR10).
- Optional production probe (same auth-gate caveat as `/api/reason` API calls) — founder elects; activation is additive + reversible regardless.

### Step 6 — Append decision-log entry (full Critical form) + session close (full Critical form)
Per `/adopted/standing-protocol-cache.md` §"Critical-risk sessions": CCP record, the option taken, the TEST evidence (if any), the Vercel change, the verification, the rollback. The close states the Vercel disposition explicitly: **all four R20a flags now `true`** (or the gate's exact state), and that `/api/reason` remains byte-identical for human/web callers. Note whether a Layer 3 decision is now queued.

---

## What is NOT in this session
- The three lower-severity plaintext tables (`mentor_interactions`, `mentor_observations_structured`, `mentor_journal_refs`) — a later scoped encryption batch (PR1).
- Layer 3 activation, unless the founder elects Option 3 — and even then it is its own CCP, not a silent bundle.
- Any application-code change — this session is configuration + (optionally) a TEST run + governance. If a code defect surfaces, stop and re-scope.

## Rollback path (whole session)
Delete `SUBSTRATE_R20A_GATE_ENABLED` in Vercel and redeploy. No code, no schema, nothing persisted — production returns to its pre-activation state in one redeploy.

## Forecast
The session ends with the fourth and final R20a flag activated — ideally with fresh TEST live-evidence closing the one gap C2 left — completing the R20a production-activation arc. The next session is the plaintext-table encryption batch, or (if surfaced) the Layer 3 activation decision.

**End of prompt. Opens on `main`. Critical-tier — the full CCP runs in chat before any Vercel change, and the Vercel steps are walked through live (PR17). This flag is the largest blast radius and was deliberately deferred; treat the live-verification decision (Step 1) as the heart of the session, not a formality.**
