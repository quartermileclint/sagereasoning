# Next-Session Prompt — Pre-Launch S6 (dense): R20a audience-correct safety rendering go-live (PR6 safety perimeter — its own clean spine) + R20b inert build + accessibility statement

Paste this whole file into a new session to proceed.

This is Session 6 of the pre-launch completion plan (`/operations/pre-launch-completion-plan-2026-06-07.md`, adopted 2026-06-07). S5 (A10 per-install plugin-auth + the A19 two-detector rollout) is done and Live in production. S6 makes the substrate's distress handling **audience-correct**: a distressed *human* caller gets the human crisis message; a distressed *agent-path* caller gets an agent-correct response. The machinery is built (`website/src/lib/substrate/r20a-audience-renderer.ts`, `r20a-gate.ts`) and wired across routes; this session activates and verifies the remaining production disposition.

**This is a PR6 safety-perimeter session — its own clean spine, extra care.** Keep non-safety activations out of it. The only fill permitted is **off-perimeter and inert** (R20b build kept inert; accessibility statement — docs).

## Tier and protocol posture (confirm at open, don't assume)

- **Stream:** founder. **Tier:** `code-critical` — **Critical** under 0d-ii (env-flag activation on the live R20a distress path).
- **PR6 ENGAGED** — this is the R20a distress perimeter. The full Critical Change Protocol (0c-ii) applies, walked live (PR17). The load-bearing invariant: **the human distress redirect must be identical before and after the change** (a distressed human must always get the human crisis message); the change only adds/corrects the *agent-path* rendering.
- **AC5 ENGAGED** (R20a perimeter). **AC7** — confirm by read; expected **not** engaged (the audience is derived from the existing `auth.user?.id` signal — no new auth surface). State the AC7 disposition explicitly at open.
- **Governing frame:** `/adopted/standing-protocol-cache.md` §"Critical-risk sessions" + `/adopted/build-sessions-protocol-cache.md`. Model selection: confirm per AC1 (the distress classifier is **Haiku** per the cache; this session changes rendering, not the classifier — state explicitly).

## Predecessors

- **Predecessor close (read in full at open):** `/operations/handoffs/founder/2026-06-09-prelaunch-S5-a10-metering-activation-close.md` (S5; most recent — authoritative production-state block).
- **R20a build/activation references:** the Option-A arc entries `D-R20A-OPTIONA-S2…S5` (2026-05-28→30), the **2026-05-31 batch** `D-R20A-GATE-ACTIVATION-2026-05-31` / `D-R20A-CALLING-ACTIVATION-2026-05-31` / `D-R20A-BATCH-ACTIVATION-REFLECT-AUDIENCE-2026-05-31`, `D-R20A-C2-LIVE-RUN-VERIFIED-2026-05-30`, and the contract `D-R20A-SC1-SINGLE-CATCH-CONTRACT-DRAFTED-2026-05-28`.
- **Single-catch contract (the authoritative rendering spec):** `/drafts/2026-05-28-r20a-single-catch-contract.md` §3.2 (audience-assignment table).
- **Plan context:** `/operations/pre-launch-completion-plan-2026-06-07.md` — this is its S6.

## Why this session matters

R20a is the safety floor for the whole product. The four core distress flags are already live (the human safety net is on). What is *not* yet confirmed live is **audience-correct rendering**: that a distressed caller on the **agent path** (now reachable, since A10 went live in S5 — an `sr_inst_` token can make an agent-authenticated `/api/reason` call) gets an agent-appropriate distress response rather than a human-framed crisis message, while a human still gets the human crisis message. Getting this right is a launch-blocking safety-polish item (completion-plan criterion 1 + the R20 exit criteria).

## ⚠ The one thing to reconcile FIRST at open (do not skip)

There is an **apparent tension in the record** that must be resolved before any flag is touched:

- The S4/S5 close production-state blocks and `CLAUDE.md` (2026-06-08) record `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` and `SUBSTRATE_R20A_GATE_ENABLED` as **UNSET** in production.
- **But** the decision log contains 2026-05-31 entries that read as activations: `D-R20A-GATE-ACTIVATION-2026-05-31`, `D-R20A-CALLING-ACTIVATION-2026-05-31`, `D-R20A-BATCH-ACTIVATION-REFLECT-AUDIENCE-2026-05-31`. And the flags are referenced in **several** routes (`api/calling/route.ts`, `api/practice/reflect/route.ts`, `api/reason/route.ts`, `api/accreditation/[agent_id]/provenance-gate.ts`) plus `r20a-audience-renderer.ts` / `r20a-gate.ts`.

**Resolve this before planning the activation.** The likely picture (confirm, don't assume): the 2026-05-31 batch activated audience-rendering/gate on the *calling* + *reflect* surfaces (and/or in a TEST/config-flow context), while `/api/reason` still has its agent-developer audience branch behind the **UNSET** flag (per the S5 close + the route's own comment at ~line 624-629: "gated behind `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` (default OFF) … falls back to `human_user` regardless"). **The real S6 scope is whatever remains UNSET in production** — most likely `/api/reason`'s audience rendering (+ the gate disposition). The AI states the reconciled per-flag, per-route disposition explicitly at open and scopes the activation to the genuine remainder. If the reconciliation shows everything is already live, S6 becomes a verification-only session — that is a valid outcome, surfaced to the founder.

## Carry-forward discipline from S5 (apply here)

1. **Verify what the flag actually does by code-read before claiming it (PR12/PR13).** In S5 the "metering" label turned out to be unwired; surfacing that honestly at open was load-bearing. Read `r20a-audience-renderer.ts` + the route gates and state precisely what flipping each flag changes — for *each audience branch* — before the founder approves.
2. **TEST-clone data gaps (Diagnostic-certain, S5):** the TEST project has **no `ADMIN_USER_ID`** and **no `profiles` row** for the founder's TEST account, so admin endpoints 401/500 there. Human-path R20a testing via `/admin/test-reason` (session JWT) works on TEST; **agent-path** R20a testing needs an agent credential. A10 is now live, so the agent-path distress branch can be exercised in **production** with an `sr_inst_` token (mint with the flag-of-the-day still in its pre-state, as in S5) — or with an `sr_live_` API key if one exists on TEST. Plan the agent-path verification accordingly; production-direct is acceptable and was the founder's S5 election.
3. **PR17:** every founder-performed step (any TEST standup, the Vercel flag flip + redeploy, any mint, the commit) is walked live, click-by-click, with a confirmation check after each — not handed off as a one-liner.

## Decisions to settle at open (founder elects; AI presents with a recommendation)

1. **Confirm S6 = R20a audience-correct rendering as the spine** (per the plan). Recommendation: yes.
2. **Scope after reconciliation:** activate only the genuine production remainder (most likely `/api/reason` audience rendering) vs. a broader pass. Recommendation: activate the minimal verified remainder; keep the spine clean. AI presents the reconciled disposition; founder elects.
3. **`SUBSTRATE_R20A_GATE_ENABLED` disposition:** confirm whether the server-side gate is in-scope for S6 or a separate confirm. Recommendation: decide from the reconciliation — if the gate is already live on the relevant surfaces, confirm-only; if not, treat its activation as a second clearly-labelled PR6 step (do not bundle silently).
4. **Fill (off-perimeter, inert only):** (a) R20b framework-dependence detection — note: scaffolding already exists (`website/src/lib/r20b-dependence.ts` + tests + ADR draft `/drafts/adr/2026-06-07-r20b-framework-dependence-detection.md`), so this is review/confirm-inert, not build-from-scratch; kept **inert** (PR6). (b) Accessibility statement — note: `website/src/app/accessibility/page.tsx` already exists, so this is review/complete, not create. Founder elects whether to include either as fill or keep the session spine-only.

## Pre-conditions (AI verifies by read at open; founder confirms)

1. Working tree clean; no `.git/index.lock` (if present: `rm -f .git/index.lock`; founder runs git, AI does read-only git inspection only). S5 commit pushed; Vercel green.
2. S5 done — A10 Live (`PLUGIN_INSTALL_AUTH_ENABLED=true`; identity + auth + revocation, metering deferred); A19 all three detectors Live. Confirm by reading the S5 close + `D-PRELAUNCH-S5-A10-METERING-ACTIVATION-2026-06-09`.
3. The four R20a core distress flags are `true` (the human safety floor). Confirm by read.
4. The reconciled production disposition of `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` + `SUBSTRATE_R20A_GATE_ENABLED`, per-route, per the ⚠ section above.
5. Hosts: production `www.sagereasoning.com` (apex 307-redirects to `www`); production Supabase ref `jdbefwkonfbhjquozgxr`; TEST ref `iwdtrvuphogkwmovhnvz`.
6. The AI does no Vercel/git/Supabase operations — the founder performs any TEST standup, the env-flag change + redeploy, any mint, and the commit, each walked live (PR17).

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min) — Critical tier; §"Critical-risk sessions"; signals; AI-failure-modes table (prescribe-before-grounding; narrow-unit-of-analysis — relevant here, the audience dimension is the whole point; PR17).
2. `/operations/pre-launch-completion-plan-2026-06-07.md` — this session is its S6.
3. `/operations/handoffs/founder/2026-06-09-prelaunch-S5-a10-metering-activation-close.md` — most-recent production state.
4. `/drafts/2026-05-28-r20a-single-catch-contract.md` §3.2 — the audience-assignment contract (read in full).
5. `website/src/lib/substrate/r20a-audience-renderer.ts` + `website/src/lib/substrate/r20a-gate.ts` — what each flag actually changes, per audience branch (PR12/PR13 — state it precisely).
6. `website/src/app/api/reason/route.ts` (~line 610-690, the `r20aAudience` derivation + both redirect branches) + the other R20a-flagged routes (`api/calling/route.ts`, `api/practice/reflect/route.ts`) to reconcile the per-route disposition.
7. The 2026-05-31 R20a activation entries + `D-R20A-OPTIONA-S4-AUDIENCE-RENDERING-WIRED-2026-05-28` in `/operations/decision-log.md` (reconcile the activation history).
8. `/manifest.md` — targeted: R20a, AC5 (perimeter), the R20 exit criteria; confirm AC7 disposition; confirm PR6 engagement.

Confirm at open (narrate before any action): where we are in the arc (S6 of the completion plan; A10 + A19 Live as of S5); the reconciled R20a flag disposition per route; tier = Critical; PR6 ENGAGED; AC5 ENGAGED; AC7 disposition stated; model selection (distress classifier Haiku, unchanged — state explicitly); PR17 engaged; PR15 (no Anthropic primitive substitutes for a Vercel flag flip — state explicitly); status vocabulary.

## Part B — Procedure

Order: **reconcile the disposition** → Critical Change Protocol brief (visible) → TEST rehearsal of *both* audience branches (+ the human-invariant check) → production flag flip(s) (the genuine remainder) → verify *both* branches in production + the human distress invariant preserved → (optional, off-perimeter) inert fill → decision log → close.

**Step 0 — Reconcile + baseline.** AI states the per-flag, per-route production disposition (the ⚠ section). Founder baseline (flag pre-state): one human distress input via `/admin/test-reason` on `www` → confirm the human crisis redirect (the invariant reference). If a flag is already live on a surface, this is confirm-only there.

**Step 1 — Critical Change Protocol brief (AI completes visibly before the founder runs anything) — 0c-ii + PR6.** (1) What changes — per flag, plain language. (2) What could break — the PR6 risk: a distressed human must still get the human crisis message; name how the change preserves that (the human branch is unchanged; only the agent-developer branch is added/corrected). (3) Existing sessions — none affected. (4) Rollback — unset the flag(s) + redeploy → byte-identical to pre-state. (5) Verification — both audience branches + the human-invariant check. (6) Explicit approval — founder approves specific to the named PR6 safety risk.

**Step 2 — TEST rehearsal (founder, walked live).** On `npm run dev` against the TEST env (set the flag-of-the-day in `.env.development.local` only): (a) **human branch** — a distress input via `/admin/test-reason` (session JWT) → human crisis message; (b) **agent branch** — a distress input on `/api/reason` via an agent credential (an `sr_inst_` token — note the S5 TEST-clone mint gaps; or an `sr_live_` API key if present on TEST) → the agent-correct distress response; (c) **invariant** — confirm the human redirect is identical flag-ON vs flag-OFF. Remove the TEST flag at teardown. *(If the TEST agent-path mint is blocked by the clone data gaps as in S5, the founder may elect production-direct for the agent branch — recommend mint-before-flip as in S5.)*

**Step 3 — Production flag flip(s) (founder, walked live).** vercel.com → SageReasoning → Settings → Environment Variables → set the genuine-remainder flag(s) (`SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` and, if in scope per Decision 3, `SUBSTRATE_R20A_GATE_ENABLED`), Production only → Save → Deployments → latest Production → ⋯ → Redeploy → green.

**Step 4 — Verify in production (Critical verification step).** Against `www.sagereasoning.com`: (a) **human branch** — distress via `/admin/test-reason` → human crisis message (must equal the Step-0 baseline — the PR6 invariant); (b) **agent branch** — distress on `/api/reason` via an `sr_inst_` token → the agent-correct distress response (mint the token with the flag still in pre-state if needed, mint-before-flip as in S5); (c) a benign call on both paths → undegraded. Disposition: R20a audience rendering → Live (production).

**Step 5 — (Optional, off-perimeter, inert only) fill.** Per Decision 4: review/confirm `r20b-dependence.ts` + the 2026-06-07 R20b ADR draft, kept **inert** (PR6 — do not activate); and/or review/complete `accessibility/page.tsx`. Standard-risk; separate commit from the Critical activation.

**Step 6 — Decision-log entry (Critical form).** Append `D-PRELAUNCH-S6-R20A-AUDIENCE-RENDERING-ACTIVATION-2026-06-DD`: the reconciled disposition, the Critical-Change-Protocol record (6 points incl. the human-invariant result for *both* TEST and production), the AC5/AC7/PR6 dispositions, the both-branch verification result, the rollback path, and any inert-fill note.

**Step 7 — Session close (full Critical form) + commit.** Per the cache §"Critical-risk sessions" (Verification Method Used, Risk Classification Record, PR5, Founder Verification, Orchestration Reminder). Provide the exact `git add`/commit block (decision log + close + any inert-fill code; the flag flip already redeployed in Step 3).

## What is NOT in this session

- No A10/A19 change (Live as of S5). No metering work (deferred from S5).
- No standalone Layer 3 activation (`SUBSTRATE_LAYER3_ENABLED` → 503) — its launch-scope question is S7/S8.
- No R20b *activation* (kept inert — PR6).
- No `component-registry.json` reconcile (S8).
- No `/api/user/export` → shared-helper consolidation (deferred from S5 — its own focused Elevated step).

## Rollback path

Unset the activated flag(s) (`SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` / `SUBSTRATE_R20A_GATE_ENABLED`) + redeploy → R20a rendering byte-identical to the pre-state (human-framed for all, the current safe fallback). The human distress redirect is preserved throughout (it is the floor, not the thing being changed). Inert-fill edits reversible via `git revert` (code/docs only).

## Forecast

Most likely: the reconciliation shows `/api/reason`'s agent-developer audience branch is the genuine production remainder (calling + reflect already done 2026-05-31); the founder rehearses both branches (human via `/admin/test-reason`, agent via an `sr_inst_` token now that A10 is live), confirms the human invariant holds identical flag-ON vs flag-OFF, flips the remaining flag in Vercel, and verifies both branches in production → R20a audience-correct rendering Live. Then (optional) the R20b/accessibility inert fill, the decision log, and the close. After S6: the safety perimeter is audience-correct end-to-end; the remaining dark capabilities are per-install metering (deferred), Layer 3 rendering, and observability completion (S7), then the end-to-end verification + capability inventory (S8 — the pre-lawyer readiness gate).

End of prompt. Opens on `main`. Critical — full Critical Change Protocol; PR6 ENGAGED (its own clean spine); AC5 engaged; AC7 disposition confirmed at open. Reconcile the R20a flag disposition FIRST. Founder runs any TEST rehearsal, the env-flag flip + redeploy, any mint, and the commit, each walked live (PR17). One-flag rollback per flag.
