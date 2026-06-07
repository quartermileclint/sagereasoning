# Next-Session Prompt — Post-A18b/A18d: continue the A18 onboarding/honest-positioning pass (or elect another track)

Paste this whole file into a new session to proceed. Canonical prompt for the session after **A18b + A18d** (the `/limitations` R19c structural-critique + R19d mirror-principle sections, the additive mirror-principle line in the reflection-mentor prompt, the new `/accessibility` statement page, and the footer links) reached **Verified** and was committed, pushed, and **Vercel went green** — so all four are live in production.

**Stream:** founder. **Tier:** set by the elected slice — `code-standard`/`governance` for A18a/A18e/governance-housekeeping; `code-elevated` for the mirror-principle propagation; `code-elevated`→`code-critical` (PR6) for A18c. Confirm at open.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds → Critical Change Protocol step 3 = N/A; all other steps in full force).
**Predecessor close:** `/operations/handoffs/founder/2026-06-07-A18b-A18d-close.md`.
**Predecessor decision-log entries:** `D-A18B-A18D-LIMITATIONS-MIRROR-ACCESSIBILITY-2026-06-07`; `D-A15C-RECTIFICATION-ENDPOINT-BUILT-2026-06-07`; `D-PROFILE-EXPORT-ACCESS-KEYING-FIX-2026-06-07`.

## Why this session matters

A18b + A18d are done and live, so the honest-positioning *page* layer (R19c limitations, R19d mirror principle on `/limitations`, the `/accessibility` statement) and footer discoverability are in production. What remains of A18 is A18a (first-run), A18c (framework-dependence detection — the one Critical slice), A18e (cognitive-accessibility pass), and propagating the R19d mirror principle from its single proven mentor surface to the practitioner-facing mentor surfaces. Beyond A18, the FPE/legal track (gating A16/A17 + Stage-1 close) remains the highest-leverage long-pole, and there is a small queue of governance housekeeping + two production migrations.

## Carried-forward state (read before scoping)

* **A18b + A18d — live.** `/limitations` now carries the R19c "Stoicism emphasises the individual, not the system" section + the R19d "A mirror, not a lens" section. `/api/mentor/private/reflect` `REFLECTION_PROMPT` carries one additive `MIRROR PRINCIPLE (R19d)` paragraph (no schema/4-stage-logic change). `/accessibility` page live. Footer Legal column now links Limitations + Accessibility. Verified by the founder; committed; pushed; Vercel green. `/api/reason` byte-identical. Pre-edit backups in `archive/limitations-page.tsx.backup-pre-A18b-2026-06-07` and `archive/reflect-route.ts.backup-pre-A18b-2026-06-07`.
* **Mirror-principle propagation (deferred Elevated).** The R19d mentor text is proven on ONE surface — the founder-only reflection companion (`/api/mentor/private/reflect`). R19d's intent covers the practitioner-facing mentor surfaces too (e.g. `app/api/mentor-baseline/route.ts` `BASELINE_SYSTEM_PROMPT` and the other ~18 mentor routes, each with its own system-prompt constant — there is no single shared mentor prompt). A focused Elevated pass extends the additive text to the practitioner surfaces; single-surface-proof discipline (PR1) is already satisfied by this session.
* **Two production migrations pending (founder-performed; walk live per PR17; low urgency, no users):**
   1. `supabase/migrations/20260607_a15b_compliance_access_log.sql` (A15b request-logging).
   2. `supabase/migrations/20260607_a15c_compliance_rectification_log.sql` (A15c rectification audit). A missing rectification table makes a successful correction return HTTP 207 — run before relying on `/api/user/rectify` in production.
* **Governance housekeeping debt (each Standard/Elevated; each needs explicit per-edit approval + a prior-version backup to `archive/`):**
   1. `manifest.md` `CR-GDPR-A20-PORTABILITY` posture → "implementation complete; pending lawyer review".
   2. `manifest.md` `CR-GDPR-A15-ACCESS` posture → "built + TEST-verified + deployed; pending production log-table migration + lawyer review".
   3. `manifest.md` `CR-GDPR-A16-RECTIFICATION` posture → "built + TEST-verified + deployed; pending production audit-table migration + lawyer review".
   4. `adopted/substrate-plugin-staging-plan.md` §A15 annotation (A15a Verified-live; A15b/A15c Verified-on-TEST + deployed; A15d build-complete).
   5. `adopted/substrate-plugin-staging-plan.md` §A14 status → "governance done; implementation deferred".
   6. `adopted/substrate-plugin-staging-plan.md` §A18 annotation → **NEW**: A18b + A18d Verified-live; A18a/A18c/A18e + mirror-propagation remaining.
   7. `CLAUDE.md` "Production state (as of 2026-05-14)" block — stale; refresh to the post-A18 state.
* **PR5 candidates carried:** (a) `/api/user/export` consolidation onto the shared `user-data-gathering.ts` helper (both paths now identically fixed → pure dedup; future Elevated). (b) Supabase SQL-editor empty-`select` verification candidate (watch status in `operations/knowledge-gaps.md`; "Success. No rows returned" on a plain `select *` is the healthy result for an empty table).
* **Operational note (standing):** the AI does not run git in the Cowork sandbox (it leaves a `.git/index.lock` the sandbox can't remove). The AI reads git state via the file tools only; the founder commits/pushes via GitHub Desktop. Before any commit, remove the lock if present: `rm -f "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/.git/index.lock"`. The two next-session-prompt files in `/operations/handoffs/founder/` (incl. this one) are untracked until the founder optionally commits them.

## Founder elects the slice at open

The AI re-scopes to whichever you name.

* **A18a — first-run / onboarding experience** (`code-standard`/design; ~1 session). The sagereasoning.com first-run flow designed + built. Standard build, no lawyer, no Critical surface. The natural next Standard A18 slice.
* **Mirror-principle propagation** (`code-elevated`; small). Extend the proven R19d mentor text to the practitioner-facing mentor surfaces (start with `mentor-baseline`, then the rest). Additive only; per-surface backup; completes R19d's mentor requirement across the product.
* **A18e — cognitive-accessibility design pass** (`code-standard`/design). Review the mentor + assessment surfaces for cognitive accessibility (A3 cross-cut). The `/accessibility` page already flags this as ongoing work. Design-led; Standard.
* **A18c — framework-dependence detection + coaching (R20b)** (`code-elevated`; **PR6 → treat as Critical**). Detect dependence patterns ("running every trivial decision through evaluation") and have the mentor encourage independence. Changes mentor behaviour and may add an LLM classifier → full Critical Change Protocol; confirm model selection per the cache AC1/KG2 table (Haiku only if a single small JSON output; Sonnet otherwise). Its own dedicated session.
* **A different track** — the **FPE/legal track** (gates A16/A17 + Stage-1 close; highest-leverage long-pole; startable on wall-clock anytime); the **governance-housekeeping pass** (the 7 edits above); the **two production migrations** (small founder-performed steps, walk live per PR17); **A19** abuse-detection; or a deferred Critical activation.

**Recommendation:** if continuing A18 as clean Standard work, take **A18a** (first-run) next; if you'd rather close out R19d fully and cheaply, take the **mirror-principle propagation** (small Elevated). Hold **A18c** for its own careful Critical session. Regardless of which A18 slice you pick, the **FPE/legal track remains the long-pole** for Stage-1 close and is the highest-leverage parallel move.

## Pre-conditions (founder confirms at open; AI verifies by read)

1. The A18b/A18d commit is pushed; Vercel green; `/limitations`, `/accessibility` live, footer links present, mentor mirror line in place; `/api/reason` + `/api/user/*` byte-identical. Working tree clean; no `.git/index.lock`.
2. Production flags unchanged: all four R20a flags `true`; `SUBSTRATE_OTEL_ENABLED` / injection-defence / Layer3 / plugin-install-auth / `SUBSTRATE_ABUSE_DETECTION_ENABLED` all UNSET; A13 cost-health detection Live.
3. `D-A18B-A18D-LIMITATIONS-MIRROR-ACCESSIBILITY-2026-06-07` is the last decision-log entry; no work begun after it. Branch `main`; the AI does no git operations.
4. The two production migrations (compliance_access_log, compliance_rectification_log) remain pending unless run in the meantime — note their state at open.

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` — tier, model selection (AC1/KG2 if A18c introduces a classifier), risk class, signals, status vocabulary, AI-failure-modes table (prescribe-before-grounding; narrow-unit-of-analysis; PR17 one-line-hand-off redirect).
2. `/adopted/build-sessions-protocol-cache.md` — "no current users" note; living-state references (component-registry is the status source-of-truth).
3. The predecessor close in full: `/operations/handoffs/founder/2026-06-07-A18b-A18d-close.md`.
4. For the elected slice: `/adopted/substrate-plugin-staging-plan.md` §A18 (+ §A16/§A17 for the legal track); `/manifest.md` targeted — R20b for A18c; R19d + R20d for the mirror-propagation; R3/A1 + WCAG for A18a/A18e accessibility cross-cut.
5. `/operations/decision-log.md` last 3 entries (the predecessors above).

Confirm at open (narrate before substantive work, per the cache's failure-modes subsection): where we are in the arc; what's queued; what's awaiting the founder vs the AI. Model selection per the cache AC1 table (N/A unless A18c introduces an LLM classifier). **PR15** consult before any bespoke build (`.claude/skills/anthropic/` + `/operations/agentic-commerce-findings-downstream-order.md`; state whether an Anthropic-canonical primitive could deliver the outcome before electing bespoke). **PR6** applies to A18c. **PR17** on every founder-performed step.

## Part B — Procedure

Re-scope to the elected slice's staging-plan section + the named rules.

**If a Standard slice (A18a / A18e) or the governance-housekeeping pass is elected:** lean templates (cache §"Lean decision-log entry" + §"Lean session close"). For any new public page, the founder verification is "open the URL, check content matches spec" (0c website-page row). Back up any governing doc before an in-place edit (governance-housekeeping edits need explicit per-edit founder approval).

**If the mirror-principle propagation (Elevated) is elected:** ground in each target mentor route's actual system-prompt constant before editing (no single shared prompt); additive text only; back up each edited file to `archive/` first; keep each mentor's output schema + logic byte-identical; `/api/reason` untouched. Prove on `mentor-baseline` first, then extend. Verify with `node_modules/.bin/tsc --noEmit` (exit 0) — `tsc` is pure JS and runs in the sandbox; `tsx` does not (esbuild native-binary mismatch; never `npm rebuild`).

**If A18c (Elevated → Critical under PR6) is elected:** complete the full Critical Change Protocol (0c-ii) visibly before any production change; prove on a single surface first (PR1); verify build-to-wire in-session (PR2 — `tsc --noEmit` + confirm the new functions are invoked in the execution path, not just defined); if a classifier is introduced, confirm model selection against `constraints.ts` (PR4) and run an invocation test (AC4); walk every founder-performed step live (PR17).

**Verification + commit (every slice):** founder verifies independently (URL check for pages; reflection-behaviour check for mentor edits); then remove the `.git/index.lock` if present and commit/push via GitHub Desktop (the AI supplies the exact `git add`/commit command in the close). Append a decision-log entry (lean or full per tier) + a session close.

## What is NOT in this session

* No production activation of any inert flag (A19 / A10 / A11b / A12 / A13-delivery / A14 tracker) unless explicitly elected — each its own Critical session.
* No R20a / Zone 2-3 / distress-classifier / wrapper touch (PR6 trip-wire — if any A18c step is found to touch these, it is Critical).
* No `/api/user/export`→`user-data-gathering.ts` consolidation unless explicitly elected (Elevated; its own session).
* No edits to governing docs (manifest, staging plan, CLAUDE.md) without explicit per-edit founder approval + prior-version backup.
* No git operations by the AI (founder commits/pushes via GitHub Desktop; remove the lock file first).

## Rollback path

Per the elected slice. Standard content/page slices: additive; revert the commit. Mentor edits: restore each file from its `archive/*.backup-pre-edit` (or revert the commit). A18c: full Critical rollback (additive + flag/revert-able; a classifier table, if added, is droppable). Governing-doc edits: restore each from its `archive/*.backup`.

## Forecast

Most likely: a Standard A18 slice (A18a or A18e) or the mirror-propagation builds cleanly, leaving A18c (its own Critical-protocol session) as the last A18 build. After A18, the remaining Stage-1-close items are A16/A17 (lawyer-coupled) and the deferred A14 tracker — so the FPE/legal track remains the long-pole and the highest-leverage parallel move regardless of which slice is elected. Stage-1 close is still several sessions out.

End of prompt. Opens on `main`. Tier set by the elected slice; if A18c (Critical under PR6) is chosen, the full Critical Change Protocol (0c-ii) is completed visibly before any production change, and every founder-performed dashboard/Vercel/Terminal step is walked live (PR17).
