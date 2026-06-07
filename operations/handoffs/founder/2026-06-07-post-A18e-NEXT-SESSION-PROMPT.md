# Next-Session Prompt — Post-A18e: close out A18 (mirror-propagation or A18c) or elect another track

Paste this whole file into a new session to proceed. Canonical prompt for the session after **A18e** (the cognitive-accessibility design pass — review + seven fixes across 13 mentor/assessment page files) reached **Verified**, was committed, pushed, and **Vercel went green** — so all of it is live in production.

**Stream:** founder. **Tier:** set by the elected slice — `code-elevated` for the mirror-principle propagation; `code-elevated`→`code-critical` (PR6) for A18c; `governance`/`code-standard` for the housekeeping pass or migrations. Confirm at open. **Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds → Critical Change Protocol step 3 = N/A; all other steps in full force). **Predecessor close:** `/operations/handoffs/founder/2026-06-07-A18e-cognitive-accessibility-close.md`. **Predecessor decision-log entries:** `D-A18E-COGNITIVE-ACCESSIBILITY-2026-06-07`; `D-A18A-FIRST-RUN-WELCOME-2026-06-07`; `D-A18B-A18D-LIMITATIONS-MIRROR-ACCESSIBILITY-2026-06-07`.

## Why this session matters

A18e is done and live, so **A18a + A18b + A18d + A18e are all in production**: the onboarding (`/welcome`), honest-positioning (`/limitations`, `/accessibility`), the single-surface mirror principle, and the cognitive-accessibility pass (AA contrast, screen-reader announcements, inline errors, plain error copy, de-jargon, selection semantics). What remains of A18 is **A18c** (framework-dependence detection — the one Critical slice) and **propagating the R19d mirror principle** from its single proven mentor surface to the practitioner-facing mentor surfaces. Once those two are done, A18 is complete and the only Stage-1-close items left are A16/A17 (lawyer-coupled) and the deferred A14 tracker — so the **FPE/legal track remains the highest-leverage long-pole**, startable in parallel on wall-clock anytime.

## Carried-forward state (read before scoping)

* **A18e — live.** Review deliverable `reference/a18e-cognitive-accessibility-review-2026-06-07.md`. Seven findings fixed across 13 files (baseline, score, dashboard, scenarios, premeditatio, oikeiosis, passion-log, score-document, score-policy, score-social, journal, mentor-baseline). Verified by the founder; committed; pushed; Vercel green. `/api/reason` + the R20a distress block byte-identical. Pre-edit backups in `archive/*.backup-pre-A18e-2026-06-07` (12 files).
  * **Two A18e follow-ups deliberately deferred (documented in the review + close):**
    1. **Practice-name page titles (R8c).** `/premeditatio` H1 "Premeditatio Malorum" and `/oikeiosis` H1 "Oikeiosis Extension" are still Greek/Latin. Not renamed unilaterally — it's a product-voice/identity decision and spans the nav, footer, and `/welcome` links. A plain-English option (e.g. "Preparing for Adversity"; "Widening Your Circle of Concern") with the original kept on a glossary page would close R8c. **Founder voice-decision.** If elected, it's a small `code-standard` cross-surface rename (H1 + nav + footer + welcome links; back up each; `tsc --noEmit` to verify).
    2. **F10** — `private-mentor` uses its own inline-styles object, not the shared Tailwind design system. Left as a note (founder-only surface, low urgency); worth aligning when the practitioner mentor surfaces are next hardened.
* **A18a / A18b / A18d — live** (prior sessions). `/welcome` first-run + revisit links; `/limitations` R19c+R19d sections; `/accessibility` page; `/api/mentor/private/reflect` `REFLECTION_PROMPT` carries the additive R19d mirror paragraph (single-surface proof).
* **Mirror-principle propagation (deferred Elevated).** The R19d mentor text is proven on ONE surface — the founder-only reflection companion (`/api/mentor/private/reflect`). R19d's intent covers the practitioner-facing mentor surfaces too (e.g. `app/api/mentor-baseline/route.ts` `BASELINE_SYSTEM_PROMPT` and the other ~18 mentor routes, each with its own system-prompt constant — there is no single shared mentor prompt). A focused Elevated pass extends the additive text to the practitioner surfaces; single-surface-proof discipline (PR1) is already satisfied. Cheapest way to fully close R19d.
* **A18c — framework-dependence detection + coaching (R20b).** Elevated → **Critical under PR6** (mentor-behaviour change; may add an LLM classifier). Its own dedicated Critical-protocol session. Detect dependence patterns ("running every trivial decision through evaluation") and have the mentor encourage independence. If a classifier is introduced, confirm model selection per the cache AC1/KG2 table (Haiku only if a single small JSON output; Sonnet otherwise) against `constraints.ts` (PR4) + run an invocation test (AC4). **This is the last A18 build.**
* **Two production migrations pending** (founder-performed; walk live per PR17; low urgency, no users):
   1. `supabase/migrations/20260607_a15b_compliance_access_log.sql` (A15b request-logging).
   2. `supabase/migrations/20260607_a15c_compliance_rectification_log.sql` (A15c rectification audit). A missing rectification table makes a successful correction return HTTP 207 — run before relying on `/api/user/rectify` in production.
* **Governance housekeeping debt** (each Standard/Elevated; each needs explicit per-edit founder approval + a prior-version backup to `archive/`):
   1. `manifest.md` `CR-GDPR-A20-PORTABILITY` posture → "implementation complete; pending lawyer review".
   2. `manifest.md` `CR-GDPR-A15-ACCESS` posture → "built + TEST-verified + deployed; pending production log-table migration + lawyer review".
   3. `manifest.md` `CR-GDPR-A16-RECTIFICATION` posture → "built + TEST-verified + deployed; pending production audit-table migration + lawyer review".
   4. `adopted/substrate-plugin-staging-plan.md` §A15 annotation (A15a Verified-live; A15b/A15c Verified-on-TEST + deployed; A15d build-complete).
   5. `adopted/substrate-plugin-staging-plan.md` §A14 status → "governance done; implementation deferred".
   6. `adopted/substrate-plugin-staging-plan.md` §A18 annotation → **A18a + A18b + A18d + A18e Verified-live; only A18c + mirror-propagation remaining** (update from the prior post-A18a state — A18e is now done).
   7. `CLAUDE.md` "Production state (as of 2026-05-14)" block — stale; refresh to the post-A18 state.
* **PR5 candidates carried:** (a) `/api/user/export` consolidation onto the shared `user-data-gathering.ts` helper (future Elevated; its own session). (b) Supabase SQL-editor empty-`select` verification candidate (watch status in `operations/knowledge-gaps.md`; "Success. No rows returned" on a plain `select *` is the healthy result for an empty table).
* **Operational note (standing):** the AI does not run git in the Cowork sandbox (it leaves a `.git/index.lock` the sandbox can't remove). The AI reads git state via the file tools only; the founder commits/pushes via GitHub Desktop. Before any commit, remove the lock if present: `rm -f "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/.git/index.lock"`. The next-session-prompt files in `/operations/handoffs/founder/` (incl. this one) are untracked until the founder optionally commits them.

## Founder elects the slice at open

The AI re-scopes to whichever you name.

* **Mirror-principle propagation** (`code-elevated`; small). Extend the proven R19d mentor text to the practitioner-facing mentor surfaces (start with `mentor-baseline`, then the rest). Additive only; per-surface backup; completes R19d's mentor requirement across the product. Cheapest way to fully close out R19d.
* **A18c — framework-dependence detection + coaching (R20b)** (`code-elevated`; PR6 → treat as Critical). Changes mentor behaviour and may add an LLM classifier → full Critical Change Protocol; confirm model selection per the cache AC1/KG2 table. Its own dedicated session. **This finishes A18.**
* **A18e practice-name rename** (`code-standard`; small). Anglicise the `/premeditatio` + `/oikeiosis` H1s (and matching nav/footer/welcome links), original terms kept on a glossary page. Closes the last R8c gap on those pages. Founder voice-decision on the wording.
* **A different track** — the **FPE/legal track** (gates A16/A17 + Stage-1 close; highest-leverage long-pole; startable on wall-clock anytime); the **governance-housekeeping pass** (the 7 edits above); the **two production migrations** (small founder-performed steps, walk live per PR17); **A19** abuse-detection; or a deferred Critical activation.

**Recommendation:** to close out R19d fully and cheaply, take the **mirror-principle propagation** (small Elevated). Hold **A18c** for its own careful Critical session — it's the last A18 build. Regardless of which A18 slice you pick, the **FPE/legal track remains the long-pole** for Stage-1 close and the highest-leverage parallel move.

## Pre-conditions (founder confirms at open; AI verifies by read)

1. The A18e commit is pushed; Vercel green; the 13 edited pages live (AA contrast; `role="status"`/`role="alert"` live regions; baseline answer ticks; "Loading…" on premeditatio/oikeiosis; "Appropriate-Action Quality" on scenarios); `/api/reason` + the R20a distress block byte-identical. Working tree clean; no `.git/index.lock`.
2. Production flags unchanged: all four R20a flags `true`; `SUBSTRATE_OTEL_ENABLED` / injection-defence / Layer3 / plugin-install-auth / `SUBSTRATE_ABUSE_DETECTION_ENABLED` all UNSET; A13 cost-health detection Live.
3. `D-A18E-COGNITIVE-ACCESSIBILITY-2026-06-07` is the last decision-log entry; no work begun after it. Branch `main`; the AI does no git operations.
4. The two production migrations (`compliance_access_log`, `compliance_rectification_log`) remain pending unless run in the meantime — note their state at open.

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` — tier, model selection (AC1/KG2 if A18c introduces a classifier), risk class, signals, status vocabulary, AI-failure-modes table (prescribe-before-grounding; narrow-unit-of-analysis; PR17 one-line-hand-off redirect).
2. `/adopted/build-sessions-protocol-cache.md` — "no current users" note; living-state references (component-registry is the status source-of-truth).
3. The predecessor close in full: `/operations/handoffs/founder/2026-06-07-A18e-cognitive-accessibility-close.md`.
4. For the elected slice: `/adopted/substrate-plugin-staging-plan.md` §A18 (+ §A16/§A17 for the legal track); `/manifest.md` targeted — R20b for A18c; R19d + R20d for the mirror-propagation; R8c for the practice-name rename; R3/A1 + WCAG for any further accessibility work.
5. `/operations/decision-log.md` last 3 entries (the predecessors above).

Confirm at open (narrate before substantive work, per the cache's failure-modes subsection): where we are in the arc; what's queued; what's awaiting the founder vs the AI. Model selection per the cache AC1 table (N/A unless A18c introduces an LLM classifier). PR15 consult before any bespoke build (`.claude/skills/anthropic/` + `/operations/agentic-commerce-findings-downstream-order.md`; state whether an Anthropic-canonical primitive could deliver the outcome before electing bespoke). PR6 applies to A18c. PR17 on every founder-performed step.

## Part B — Procedure

Re-scope to the elected slice's staging-plan section + the named rules.

**If the mirror-principle propagation (Elevated) is elected:** ground in each target mentor route's actual system-prompt constant before editing (no single shared prompt); additive text only; back up each edited file to `archive/` first; keep each mentor's output schema + logic byte-identical; `/api/reason` untouched. Prove on `mentor-baseline` first, then extend. Verify with `node_modules/.bin/tsc --noEmit` (exit 0) — `tsc` is pure JS and runs in the sandbox; `tsx` does not (esbuild native-binary mismatch; never `npm rebuild`).

**If the practice-name rename (Standard) or the governance-housekeeping pass is elected:** lean templates (cache §"Lean decision-log entry" + §"Lean session close"). Back up any governing doc / page before an in-place edit (governance-housekeeping edits need explicit per-edit founder approval). For the rename, change all matching surfaces in one pass (H1 + nav + footer + welcome links) so nothing is left inconsistent; founder verification is "open the URL, check content matches spec" (0c website-page row).

**If A18c (Elevated → Critical under PR6) is elected:** complete the full Critical Change Protocol (0c-ii) visibly before any production change; prove on a single surface first (PR1); verify build-to-wire in-session (PR2 — `tsc --noEmit` + confirm the new functions are invoked in the execution path, not just defined); if a classifier is introduced, confirm model selection against `constraints.ts` (PR4) and run an invocation test (AC4); walk every founder-performed step live (PR17).

**Verification + commit (every slice):** founder verifies independently (URL check for pages; reflection-behaviour check for mentor edits); then remove the `.git/index.lock` if present and commit/push via GitHub Desktop (the AI supplies the exact `git add`/commit command in the close). Append a decision-log entry (lean or full per tier) + a session close.

## What is NOT in this session

* No production activation of any inert flag (A19 / A10 / A11b / A12 / A13-delivery / A14 tracker) unless explicitly elected — each its own Critical session.
* No R20a / Zone 2-3 / distress-classifier / wrapper touch (PR6 trip-wire — if any A18c step is found to touch these, it is Critical).
* No `/api/user/export`→`user-data-gathering.ts` consolidation unless explicitly elected (Elevated; its own session).
* No edits to governing docs (manifest, staging plan, CLAUDE.md) without explicit per-edit founder approval + prior-version backup.
* No git operations by the AI (founder commits/pushes via GitHub Desktop; remove the lock file first).

## Rollback path

Per the elected slice. Mentor edits: restore each file from its `archive/*.backup-pre-edit` (or revert the commit). Standard content/page/rename slices: additive or string-level; revert the commit, or restore each page from its `archive/*.backup`. A18c: full Critical rollback (additive + flag/revert-able; a classifier table, if added, is droppable). Governing-doc edits: restore each from its `archive/*.backup`.

## Forecast

Most likely: the mirror-propagation or the practice-name rename builds cleanly, leaving **A18c** (its own Critical-protocol session) as the last A18 build. After A18, the remaining Stage-1-close items are A16/A17 (lawyer-coupled) and the deferred A14 tracker — so the **FPE/legal track remains the long-pole** and the highest-leverage parallel move regardless of which slice is elected. Stage-1 close is still several sessions out.

End of prompt. Opens on `main`. Tier set by the elected slice; if A18c (Critical under PR6) is chosen, the full Critical Change Protocol (0c-ii) is completed visibly before any production change, and every founder-performed dashboard/Vercel/Terminal step is walked live (PR17).
