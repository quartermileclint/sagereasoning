# Next-Session Prompt — A18c: framework-dependence detection + independence coaching (R20b)

Paste this whole file into a new session to proceed. Canonical prompt for **A18c — the last A18 build**. A18c is **Elevated → Critical under PR6** (mentor-behaviour change; may add an LLM classifier): the **full Critical Change Protocol (0c-ii) is completed visibly before any production change**, and every founder-performed dashboard/Vercel/Terminal step is walked live (PR17).

**Stream:** founder. **Tier:** `code-critical` (PR6). Confirm at open.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds → Critical Change Protocol **step 3 = N/A**; all other steps in full force).
**Predecessor close:** `/operations/handoffs/founder/2026-06-07-A18-mirror-propagation-close.md`.
**Predecessor decision-log entries:** `D-A18-MIRROR-PROPAGATION-2026-06-07`; `D-A18E-COGNITIVE-ACCESSIBILITY-2026-06-07`; `D-A18B-A18D-LIMITATIONS-MIRROR-ACCESSIBILITY-2026-06-07`.

---

## Why this session matters

A18a + A18b + A18d + A18e + the R19d mirror-principle propagation are all done and **live** (committed, pushed, Vercel green, verified). R19d's mentor-prompt requirement is now complete across the product (8/8 mentor surfaces). **A18c is the only remaining A18 build.** Once it lands, A18 is complete and the only Stage-1-close items left are A16/A17 (lawyer-coupled) and the deferred A14 tracker — so the FPE/legal track becomes the sole long-pole.

A18c implements **R20b — Independence, not dependence** (manifest line 227): *"The system must be designed to encourage internalisation of principled reasoning, not dependence on the tool. Usage patterns indicating growing dependence (running every trivial decision through evaluation, inability to reason without the framework) should trigger a response from the mentor: 'You're ready to reason through this yourself.' Success means users who need the tool less over time."* Two halves: **(1) detect** dependence usage-patterns; **(2) coach** independence through the mentor when the pattern is present.

This is the careful Critical session the mirror-propagation prompt held A18c back for. It changes mentor behaviour and may introduce a classifier — both reasons it is treated as Critical.

## Carried-forward state (read before scoping)

* **A18c is Scoped, not started.** Grounding check 2026-06-07 (the mirror-propagation session) found **no existing dependence-detection implementation** in `website/src/`. R20b appears only in `app/limitations/page.tsx`, `app/api/founder/hub/route.ts`, and test fixtures — no detection logic, no frequency/triviality tracking, no independence-coaching prompt text. A18c is a fresh build. Ground in the actual surfaces before designing (guard prescribe-before-grounding).
* **Data the detection would read.** Dependence signal lives in usage history: `mentor_interactions` (per-practitioner interaction records, hub-scoped) and `analytics_events` (evaluation events). The "running every trivial decision through evaluation" pattern is most visible at the high-frequency evaluation surfaces (`/api/score`, `/api/reason` quick-depth); the **coaching** half belongs in the mentor surfaces (the 8 R19d mentor prompts). Confirm the exact tables/columns at session-open via the component registry + a read-only DB look.
* **Mirror-propagation (predecessor) is live.** All 8 mentor surfaces carry the R19d paragraph; `D-A18-MIRROR-PROPAGATION-2026-06-07` is the last decision-log entry. Backups at `archive/*.backup-pre-mirror-2026-06-07` (7 files). `/api/reason` + every R20a/distress block byte-identical.
* **Two production migrations still pending** (founder-performed; walk live per PR17; low urgency, no users): `supabase/migrations/20260607_a15b_compliance_access_log.sql`; `supabase/migrations/20260607_a15c_compliance_rectification_log.sql`.
* **Governance-housekeeping debt** (each Standard/Elevated; each needs explicit per-edit founder approval + a prior-version backup to `archive/`): manifest CR-GDPR posture lines (A20/A15/A16); `adopted/substrate-plugin-staging-plan.md` §A14 + §A15 + §A18 annotations (the §A18 annotation should now read **A18a+A18b+A18d+A18e + mirror-propagation done; only A18c remaining**); `CLAUDE.md` "Production state (as of 2026-05-14)" block is stale.
* **R19d "all tools" follow-up (deferred, optional).** This session's predecessor closed the *mentor* portion of R19d. R19d's text covers "the mentor *and all tools*" — the 6 scoring/skill surfaces (`evaluate`, `score-iterate`, `score-document`, `score-scenario`, `skill/sage-classify`, `skill/sage-prioritise`) are the broader reach, flagged for a future Elevated pass. Not A18c.
* **Operational note (standing):** the AI does not run git in the Cowork sandbox (it leaves a `.git/index.lock` the sandbox can't remove). The AI reads git state via file tools only; the founder commits/pushes via GitHub Desktop. Before any commit, remove the lock if present: `rm -f "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/.git/index.lock"`.

## Pre-conditions (founder confirms at open; AI verifies by read)

1. The A18-mirror-propagation commit is pushed; Vercel green; all 8 mentor surfaces carry the R19d paragraph; `/api/reason` + R20a/distress blocks byte-identical. Working tree clean; no `.git/index.lock`.
2. Production flags unchanged: all four R20a flags `true`; `SUBSTRATE_OTEL_ENABLED` / injection-defence / Layer3 / plugin-install-auth / `SUBSTRATE_ABUSE_DETECTION_ENABLED` all UNSET; A13 cost-health detection Live.
3. `D-A18-MIRROR-PROPAGATION-2026-06-07` is the last decision-log entry; no work begun after it. Branch `main`; the AI does no git operations.
4. The two production migrations (`compliance_access_log`, `compliance_rectification_log`) remain pending unless run in the meantime — note their state at open.

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` — tier, **model selection (AC1/KG2 table — engages if A18c adds a classifier)**, risk class, signals, status vocabulary, AI-failure-modes table (prescribe-before-grounding; narrow-unit-of-analysis; PR17 one-line-hand-off redirect).
2. `/adopted/build-sessions-protocol-cache.md` — "no current users" note (→ Critical Change Protocol step 3 = N/A); living-state references (component-registry is the status source-of-truth); TEST-run process (any local live-test runs against the TEST Supabase project via `website/.env.development.local`, throwaway test login — never the founder login / `.env.local` / production).
3. The predecessor close in full: `/operations/handoffs/founder/2026-06-07-A18-mirror-propagation-close.md`.
4. `/manifest.md` targeted — **R20b** (line 227, the rule this implements); **R20** preamble + **R20a/AC5** (perimeter — so the new detection is positioned correctly relative to the distress perimeter and PR6 trip-wire); **R6d** (diagnostic, not punitive); **R19/R19d** (honest positioning; the coaching must be honest, not manipulative). Staging: `/adopted/substrate-plugin-staging-plan.md` §A18 (+ §A16/§A17 for the legal long-pole).
5. `/operations/decision-log.md` last 3 entries (the predecessors above).
6. **If a classifier is on the table:** `website/src/lib/r20a-classifier.ts` (the two-stage distress classifier — the precedent pattern for a small safety-adjacent classifier) and `website/src/lib/constraints.ts` (branded-type model-selection enforcement, PR4).

Confirm at open (narrate **before** substantive work, per the cache's failure-modes subsection): where we are in the arc; what's queued; what's awaiting the founder vs the AI. **Tier = `code-critical` (PR6).** Model selection per the cache AC1/KG2 table — **N/A unless A18c introduces an LLM classifier**, in which case: Haiku **only** if the call is a single small JSON output within the reliability boundary (KG2); Sonnet otherwise — confirmed against `constraints.ts` (PR4) before any code. **PR15 consult** before any bespoke build (`.claude/skills/anthropic/` + `/operations/agentic-commerce-findings-downstream-order.md`; state whether an Anthropic-canonical primitive could deliver the outcome before electing bespoke). **PR17** on every founder-performed step.

## Part B — Procedure

**This is a Critical session. The full Critical Change Protocol (0c-ii) is completed visibly in the conversation before the founder deploys anything.** Do not abbreviate it.

### Step 0 — Architecture decision first (recommended; founder elects "Design this" vs "Build this")

Per the cross-cutting limitation *"Architecture decisions before code for R17a and R20a"* — apply the same architecture-first discipline to R20b (a new safety-adjacent detection mechanism). Produce a short **ADR** answering:

- **Detection mechanism:** deterministic/heuristic (e.g. evaluation frequency in a rolling window, repeated near-identical trivial inputs, ratio of low-stakes to considered evaluations) **vs** an LLM classifier (classify whether an input is "trivial" / whether the pattern indicates over-reliance). State the trade-off. **Bias to the deterministic option** where it suffices (PR15 — least custom surface; no model-selection risk; cheaper; no KG2 exposure). If a classifier is genuinely needed, justify it and confirm model selection per AC1/KG2 + `constraints.ts` (PR4).
- **Where detection runs** (which endpoint(s) own the signal) and **where coaching surfaces** (which mentor prompt(s) carry the "you're ready to reason through this yourself" response). Keep the two concerns separate.
- **Data source** (confirmed `mentor_interactions` / `analytics_events` columns) and the **threshold** that distinguishes healthy use from dependence — explicitly **R6d diagnostic, not punitive**, and **R19 honest** (no dark-pattern nudging; the coaching genuinely points the user toward needing the tool less).
- **PR6 boundary statement:** confirm in writing whether any step touches the distress classifier / Zone 2-3 / R20a wrapper. If it does → unambiguously Critical (PR6 trip-wire) and the detection must stay **synchronous** (PR3) and not interfere with the distress check that runs first at pipeline entry.

### Step 1 — Plan (Critical Change Protocol 0c-ii, visible)

State plainly: what is changing (founder's-eye view); what could break; what happens to existing sessions (**N/A — no third-party users**); the rollback plan (exact, founder-runnable); the verification step; then take explicit founder approval **specific to the named risks**.

### Step 2 — Execute (single-endpoint proof first)

Prove the detection + coaching on **one** surface first (PR1) and bring it to **Verified** before any rollout to other surfaces. Back up each edited file to `archive/*.backup-pre-A18c-2026-06-07` before editing. Keep `/api/reason` and the R20a distress block byte-identical unless the ADR explicitly and approvedly says otherwise.

### Step 3 — Build-to-wire verification, in-session (PR2)

A wired function must be verified the same session. Confirm the new detection function is actually **invoked in the execution path** (grep for calls, not just definitions — AC4 invocation test), not merely defined. If a classifier was added, run an invocation test confirming it fires and the model is the one `constraints.ts` enforces.

### Step 4 — Verify

`cd website && node_modules/.bin/tsc --noEmit` → expect **exit 0** (`tsc` is pure JS and runs in the sandbox; `tsx` does **not** — esbuild native-binary mismatch; never `npm rebuild`). Plus the Critical-protocol verification step the founder runs independently (URL/behaviour check for the coaching; a TEST-DB probe for the detection if it reads live data — run against the TEST Supabase project per the build cache, never production). Classify any diagnostic finding's certainty (PR10): Diagnostic-certain / symptom-level / pattern-level — symptom/pattern-level findings need founder acknowledgement before "resolved."

### Step 5 — Decision-log entry (full form) + session close (full form)

Critical sessions use the **full** templates (per `/adopted/standing-protocol-cache.md` §"Critical-risk sessions"), including: Verification Method Used, Risk Classification Record, PR5 Knowledge-Gap Carry-Forward, Founder Verification (Between Sessions). Append `D-A18C-FRAMEWORK-DEPENDENCE-2026-06-07` (or session date). Then remove `.git/index.lock` if present and supply the exact `git add`/commit command for the founder to push via GitHub Desktop.

## What is NOT in this session

* No production activation of any inert flag (A19 abuse-detection delivery / A10 / A11b / A12 / A13-delivery / A14 tracker) unless explicitly elected — each its own Critical session.
* No R19d "all tools" propagation to the 6 scoring/skill surfaces unless explicitly elected (Elevated; its own session).
* No edits to governing docs (manifest, staging plan, `CLAUDE.md`) without explicit per-edit founder approval + prior-version backup to `archive/`.
* No git operations by the AI (founder commits/pushes via GitHub Desktop; remove the lock file first).
* No change to the R20a distress classifier, Zone 2-3 logic, Zone 3 redirection, or their wrappers (PR6 trip-wire) — A18c sits **alongside** the distress perimeter, never inside it. If a design step is found to require touching it, stop and re-confirm scope with the founder.

## Rollback path

Full Critical rollback: the change is additive and (if a flag is used) flag-gated/revert-able. Per file: restore from its `archive/*.backup-pre-A18c-2026-06-07`, or revert the commit and push. If a classifier table/column was added, it is droppable (idempotent down-migration). Detection is read-only over existing data; coaching is additive prompt text — neither alters stored user data.

## Forecast

Most likely shape: an ADR/design pass settles the deterministic-vs-classifier question (deterministic preferred where it suffices), then a single-surface proof of detection + independence-coaching reaches Verified under the full Critical protocol — completing A18. After A18, the remaining Stage-1-close items are A16/A17 (lawyer-coupled) and the deferred A14 tracker, so the **FPE/legal track is the long-pole** and the highest-leverage next move. Stage-1 close is still several sessions out.

---

**Critical Change Protocol (0c-ii) pointer — do not abbreviate:** (1) what is changing, plain language; (2) what could break, specific failure modes; (3) what happens to existing sessions (= N/A here); (4) rollback plan, founder-runnable; (5) verification step; (6) explicit founder approval specific to the named risks. Complete all six visibly before the founder deploys.

End of prompt. Opens on `main`. Tier `code-critical` (PR6). The full Critical Change Protocol is completed visibly before any production change, and every founder-performed dashboard/Vercel/Terminal step is walked live (PR17).
