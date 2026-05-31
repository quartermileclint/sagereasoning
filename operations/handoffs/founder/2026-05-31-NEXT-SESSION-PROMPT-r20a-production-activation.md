# Next-Session Prompt — Finalise the Journal-Distress Deploy + First R20a Production Activation

Paste this whole file into a new session to proceed.

**Stream:** founder. **Tier:** `code-critical` — **Critical** risk. The Critical Change Protocol (0c-ii) APPLIES — see Part B Step 2. **PR6 engaged** (R20a perimeter — safety-critical, always Critical). **PR17 engaged** (the Vercel env-flag change is a founder-performed operational step — walked through live, click by click, NOT handed off as a one-liner). **AC2 paid live** (the synchronous Haiku check on the activated route). This session has TWO parts: a quick governance finalisation (Step 1, Standard) and the R20a activation (Steps 2–5, Critical). The highest-risk part sets the tier: **Critical**.

**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache) + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-31-r20a-journal-distress-check-close.md`.
**Predecessor decision-log entry:** `D-R20A-JOURNAL-DISTRESS-CHECK-2026-05-31`.
**Activation context:** `D-R20A-C2-LIVE-RUN-VERIFIED-2026-05-30` (the agent-path R20a catch is **Verified-live in TEST** — 34/34 on real Haiku across the three wired surfaces); `/operations/handoffs/founder/2026-05-30-C2-live-run-close.md`.

---

## ⚠️ Read this first — carried-forward state (do NOT re-derive)

**The journal-distress change shipped.** On 2026-05-31 the founder verified, committed, pushed; Vercel went green. Because that change is additive request-path code with **no schema/migration**, pushing + a green build means it is **LIVE in production**: `/api/journal` and `/api/mentor/journal-feed` now screen human free-text through the two-stage distress classifier before storing. **The founder elected to waive the optional live TEST run.** So its status is: deployed, statically Verified (tsc EXIT 0; 22/22 across both per-route tsx tests; PR2 call-path confirmed), live-in-production, end-to-end live test waived by founder. Step 1 below records this in the log — that is the only thing outstanding on the journal change.

**Production now (as of 2026-05-31):**
- Journal distress screening: **LIVE** (both routes; always-on, flag-independent).
- R17b `realtime_journal_entries` prose encryption: **LIVE + Verified-live**.
- **All four R20a substrate flags UNSET in Vercel** → `SUBSTRATE_R20A_GATE_ENABLED`, `SUBSTRATE_CALLING_R20A_ENABLED`, `SUBSTRATE_REFLECT_R20A_ENABLED`, `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED`.
- `/api/reason` byte-identical for all caller types; `/api/substrate/layer3` → 503; `/api/public-key` steady-state (`substrate-layer2-2026Q2`). R17 `/api/user/*` erasure+export changes LIVE. AC7 not engaged.

**What this session adds:** turns ON **one** R20a flag in Vercel — the first of the four production activations. The distress-catch logic those flags gate is already Verified-live in TEST (C2). Activation is a configuration change, not new code: set the env var, redeploy, confirm. Each of the four flags is its own future Critical session; this session does ONE.

---

## What the four R20a flags do (plain language)

Each flag turns ON the substrate-side distress catch for one surface. They are **independent** — turning one on does not require any other.

| Flag (Vercel env var) | Surface it protects | Blast radius if ON |
|---|---|---|
| `SUBSTRATE_CALLING_R20A_ENABLED` | `/api/calling` (agent calling flow) | Only `/api/calling`. Independent of the A7 flag (the route passes `overrideFlag: true`). **Smallest blast radius.** |
| `SUBSTRATE_REFLECT_R20A_ENABLED` | `/api/practice/reflect` | Only that route. Independent of A7 + Calling. |
| `SUBSTRATE_R20A_GATE_ENABLED` | The A7 substrate Layer-2 gate (shared) | **Largest** — affects every caller that routes through the A7 substrate gate. Highest blast radius; activate last. |
| `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` | Audience-rendering path | Rendering surface, not a distress-catch flag in the same sense. |

**AI recommendation to open with (founder decides):** activate **`SUBSTRATE_CALLING_R20A_ENABLED`** first. Reasons: smallest blast radius (one route), independent of the shared A7 gate, and it is the surface the C2 live run exercised most directly. It is the cleanest single-route proof (PR1) of the activation pattern before the larger A7-gate activation in a later session. The founder may pick a different flag at session open.

**Safety note (why this is low-risk):** activating a flag turns ON *more* protection. The worst realistic failure is a false positive blocking a legitimate request — and there are **no current users** (founder + test only). If the flag somehow doesn't take effect, the failure mode is "safety not yet active" = identical to today = no regression. There is no path by which this activation degrades an existing working feature.

---

## Pre-conditions (founder confirms at open; AI verifies by read)

1. Journal-distress change is live (pushed + Vercel green) and untouched since 2026-05-31.
2. The four R20a flags are still UNSET in Vercel.
3. The Cowork project-instructions panel remains paste-synced against `/adopted/project-instructions-snapshot.md` (PR1–PR17).

---

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — tier, risk class, signals, status vocabulary, model-selection AC1 row for the safety classifier).
2. `/operations/handoffs/founder/2026-05-31-r20a-journal-distress-check-close.md` (the predecessor close).
3. `D-R20A-C2-LIVE-RUN-VERIFIED-2026-05-30` + `/operations/handoffs/founder/2026-05-30-C2-live-run-close.md` (the activation context — what was Verified-live in TEST).
4. `/manifest.md` targeted sections only: §R20a; §AC5 (perimeter); §AC2 (synchronous safety / latency budget).
5. Code-of-the-day:
   - `website/src/lib/substrate/r20a-gate.ts` — the four flag-reader functions (`isSubstrateR20aGateEnabled`, `isCallingR20aEnabled`, `isReflectR20aEnabled`) and `enforceLayer2R20aGate`. Confirm each flag reads `=== 'true'` (case-strict; only the literal `true` enables).
   - The route that the chosen flag gates (e.g. `website/src/app/api/calling/route.ts`) — confirm the flag check + `enforceLayer2R20aGate` call site.

Confirm at open: tier (`code-critical`, Critical); hold-point status (P0 0h active); model selection (Haiku for the distress classifier; cite AC1 — no change, reused); status vocabulary; signals/risk class. Narrate before substantive work: where we are in the arc (journal distress LIVE; R17b LIVE); what's queued (the other three R20a activations; the plaintext-table encryption batch); what's awaiting the founder vs the AI.

---

## Part B — Procedure

### Step 1 — Governance finalisation (Standard; ~5 min)

Record the journal-distress change as deployed. Append a short decision-log note (or amend the existing entry's Status per append-only discipline — do NOT rewrite history; add a follow-up line) stating: `D-R20A-JOURNAL-DISTRESS-CHECK-2026-05-31` is now **deployed and live in production** (pushed + Vercel green, 2026-05-31); implementation status → **Verified-live (production), end-to-end live test waived by founder**; LC#10 for the journal is **met**. Update the relevant status table if one is maintained. This needs founder sign-off on the wording before it is written (governing-doc edit — founder preference).

### Step 2 — Critical Change Protocol (0c-ii), in chat, BEFORE touching Vercel

Founder picks the flag first (recommendation: `SUBSTRATE_CALLING_R20A_ENABLED`). Then complete all six visibly and get approval specific to the named risks:

1. **What changes** — one env var (`<CHOSEN_FLAG>`) is set to `true` in Vercel; on the next deploy, that surface's distress catch goes from OFF to ON. Plain language: the chosen route starts screening for distress live, the way it already does in TEST.
2. **What could break** — (a) a false positive could redirect a legitimate request on that one route (no current users; founder + test only); (b) ~500ms added latency on borderline inputs on that route (AC2 — accepted); (c) scope is exactly one surface for the per-route flags (Calling/Reflect); the A7-gate flag is broader (name the blast radius for whichever flag is chosen).
3. **What happens to existing sessions** — none affected; this is a forward-looking request-path check; no stored data touched; no schema change.
4. **Rollback** — set `<CHOSEN_FLAG>` back to UNSET (delete the env var) in Vercel and redeploy; behaviour returns to today's exactly. The AI provides the exact dashboard path. (Reversible in under a minute; nothing persisted.)
5. **Verification** — after the redeploy: confirm the env var is present in Vercel (Production scope), the redeploy is green, and a single live probe shows the catch active on the chosen route (AI supplies the probe; see Step 4).
6. **Explicit approval** — founder says "Go ahead", specific to the chosen flag and the named risks.

### Step 3 — Execute the activation (PR17 — walked through LIVE, click by click)

This runs on the founder's machine in the Vercel dashboard. The AI directs it interactively, one step at a time, confirming after each:

1. Vercel → the SageReasoning project → **Settings** → **Environment Variables**.
2. **Add New** → Key: `<CHOSEN_FLAG>` (e.g. `SUBSTRATE_CALLING_R20A_ENABLED`) → Value: `true` (lowercase, exactly — the reader is case-strict) → Environment: **Production** (and Preview if desired) → **Save**.
3. Trigger a redeploy so the new env var is picked up: Vercel → **Deployments** → the latest production deployment → **⋯** menu → **Redeploy** (no code change needed). Wait for green.

The AI does NOT reduce this to "founder sets the flag between sessions." It is directed live, with exact values and a confirmation check after each click (PR17).

### Step 4 — Verify (founder-performable; the activation's confirmation)

- **Config present:** the env var `<CHOSEN_FLAG> = true` is listed under Production in Vercel; the redeploy is green.
- **Live probe (recommended; AI supplies exact command):** one request to the activated route confirming the catch is active — e.g. a benign input passes normally, and a clear distress-phrasing input returns the redirect shape. Because the founder is minimising live testing, the AI offers the smallest possible single probe and the founder elects whether to run it. **Even if the probe is skipped, the activation is safe** (additive protection; no-users; no regression path) — this is stated explicitly so the decision is informed.
- Classify the diagnostic certainty (PR10) on the result.

### Step 5 — Append decision-log entry (full Critical form) + session close (full Critical form)

Per `/adopted/standing-protocol-cache.md` §"Critical-risk sessions": CCP record, the chosen flag + blast radius, the Vercel change, the verification (and whether the live probe was run or waived), the rollback (UNSET + redeploy). The close states the Vercel disposition explicitly: which flag is now `true`, which three remain UNSET, and that `/api/reason` remains byte-identical for non-activated paths.

---

## What is NOT in this session

- The other three R20a activations (one flag per future Critical session).
- The three lower-severity plaintext tables (`mentor_interactions`, `mentor_observations_structured`, `mentor_journal_refs`) — a later scoped encryption batch (PR1).
- Any code change — this session is configuration + governance only. If a code defect surfaces, stop and re-scope (do not fix-forward under an activation session).

---

## Rollback path (whole session)

Set `<CHOSEN_FLAG>` back to UNSET in Vercel and redeploy. No code, no schema, nothing persisted — production returns to its pre-activation state in one redeploy.

## Forecast

The session ends with the journal-distress change recorded as live (LC#10 met for the journal), and **one** R20a flag turned ON in production — the first of four activations, proven on the smallest-blast-radius surface first (PR1). The next session is the second R20a activation, or the plaintext-table encryption batch — founder's pick.

**End of prompt. Opens on `main`. Critical-tier — the full CCP runs in chat before any Vercel change, and the Vercel steps are walked through live (PR17).**
