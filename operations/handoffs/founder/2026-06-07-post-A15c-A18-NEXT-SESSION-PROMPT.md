# Next-Session Prompt — Post-A15c: A18 (onboarding + limitations governance pass)

Paste this whole file into a new session to proceed with **A18**. Canonical prompt for the session after A15c (the GDPR Article 16 rectification endpoint `/api/user/rectify`) reached Verified-on-TEST, was committed + pushed, and Vercel went green — alongside the `D-PROFILE-EXPORT-ACCESS-KEYING-FIX` (the `profiles` `user_id`→`id` fix so the profile section now populates in `/export` + `/access`).

**Stream:** founder. **Tier:** set by the elected A18 slice — `governance`/`code-standard` for A18a/A18b/A18d/A18e; `code-elevated` (possibly `code-critical` under PR6) for A18c. Confirm at open.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds → Critical Change Protocol step 3 = N/A; all other steps in full force).
**Predecessor close:** `/operations/handoffs/founder/2026-06-07-A15c-rectification-endpoint-close.md`.
**Predecessor decision-log entries:** `D-A15C-RECTIFICATION-ENDPOINT-BUILT-2026-06-07`; `D-PROFILE-EXPORT-ACCESS-KEYING-FIX-2026-06-07`; `D-A15B-SAR-ACCESS-ENDPOINT-BUILT-2026-06-07`; `D-A15-SAR-PORTABILITY-GOVERNANCE-CONFIRM-2026-06-07`.

---

## Why this session matters

A18 is the onboarding + honest-positioning pass: the limitations page (R19c), the mirror principle in the mentor (R19d), framework-dependence detection (R20b), an accessibility statement, the first-run experience, and a cognitive-accessibility pass. It is one of the two remaining clean **no-lawyer** items before Stage-1 close (the other being the deferred A14 live-adherence tracker). Most of it is Standard-risk content/design; one slice (A18c) is a mentor-behaviour change and is handled carefully.

---

## Carried-forward state (read before scoping)

* **A15c `/api/user/rectify`** — Verified-on-TEST, committed, pushed, **Vercel green → live in production** for the rectification function. The before/after audit-write is **inert in production until the `compliance_rectification_log` table is created in the production Supabase project** — a missing table makes a *successful* correction return HTTP 207 (correction applied, audit not logged). Low urgency (no real users), but run that migration before relying on the endpoint in production.
* **Profile-keying fix** (`D-PROFILE-EXPORT-ACCESS-KEYING-FIX`) — shipped with the push (no migration). `/api/user/export` + `/api/user/access` now return the user's profile section (`profiles` queried by `id`). Verified-on-TEST on both (`export-test.py` + `access-test.py` report `profile section populated: YES ✓ (rows: 1)`).
* **Two production migrations pending** (founder-performed; walk live per PR17; low urgency, no users):
   1. `supabase/migrations/20260607_a15b_compliance_access_log.sql` (A15b request-logging).
   2. `supabase/migrations/20260607_a15c_compliance_rectification_log.sql` (A15c rectification audit).
* **Governance housekeeping debt** (each Elevated; each needs explicit per-edit approval + a prior-version backup to `archive/`):
   1. `manifest.md` `CR-GDPR-A20-PORTABILITY` posture → "implementation complete; pending lawyer review".
   2. `manifest.md` `CR-GDPR-A15-ACCESS` posture → "built + TEST-verified + deployed; pending production log-table migration + lawyer review".
   3. `manifest.md` `CR-GDPR-A16-RECTIFICATION` posture → "built + TEST-verified + deployed; pending production audit-table migration + lawyer review" (NEW from A15c).
   4. `adopted/substrate-plugin-staging-plan.md` §A15 annotation → A15a-d statuses (A15a Verified-live; A15b/A15c Verified-on-TEST + deployed; A15d build-complete).
   5. `adopted/substrate-plugin-staging-plan.md` §A14 status → "governance done; implementation deferred".
   6. `CLAUDE.md` "Production state (as of 2026-05-14)" block — stale; refresh to the post-A15c state.
* **PR5 candidates carried:** (a) `/api/user/export` consolidation onto the shared `user-data-gathering.ts` helper — both paths are now identically fixed, so the consolidation purely removes duplication (future Elevated). (b) Supabase SQL-editor empty-`select` verification candidate — **logged 2026-06-07 (watch status)** in `operations/knowledge-gaps.md`; future closes confirm a new table with the `information_schema.columns` query, and state that "Success. No rows returned" on a plain `select *` is the healthy result.
* **Operational note (standing):** the AI does not run git in the Cowork sandbox (it leaves a `.git/index.lock` the sandbox cannot remove, blocking the founder's commit). The AI reads git state via the file tools only; the founder commits/pushes via GitHub Desktop. **Before any commit, remove the lock if present:** `rm -f "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/.git/index.lock"`.

---

## Founder elects the slice at open

A18 has five slices (staging-plan §A18). The AI re-scopes to whichever you name.

* **A18b — limitations page (R19c) + mirror principle (R19d)** (`code-standard`/`governance`; **recommended first**). A public `/limitations` page documenting the framework's known limits (Stoicism emphasises individual virtue over collective action / structural critique / dissent — R19c text), plus adding the mirror-principle guidance (R19d: "a mirror, not a lens — for examining your own reasoning, not diagnosing others") to the mentor prompt + user-facing copy. No lawyer, no Critical surface. The cleanest value-per-session slice.
* **A18d — accessibility statement page** (`code-standard`; small). A standard accessibility statement page. No lawyer, no Critical surface. Pairs naturally with A18b in one session.
* **A18a — first-run experience** (`code-standard`/design; ~1 session). Sagereasoning.com first-run / onboarding flow designed + built. Standard build.
* **A18e — cognitive-accessibility design pass** (`code-standard`/design). Review of the mentor + assessment surfaces for cognitive accessibility (A3 cross-cut). Design-led; Standard.
* **A18c — framework-dependence detection + coaching (R20b)** (`code-elevated`; **PR6 likely → treat as Critical**). Detect usage patterns indicating dependence ("running every trivial decision through evaluation") and have the mentor encourage independence ("You're ready to reason through this yourself"). This changes mentor behaviour and may introduce an LLM classifier — **PR6 applies; treat as Critical and complete the full Critical Change Protocol.** If it introduces a classifier, confirm model selection per the cache AC1/KG2 table (Haiku only if a single small JSON output; Sonnet otherwise). Recommended as **its own dedicated session**, not bundled with the Standard slices.

**Recommendation:** start with **A18b + A18d** in one Standard session (limitations page + mirror principle + accessibility statement) — highest value, no lawyer, no Critical surface. Take **A18a** next, and hold **A18c** for its own careful Critical-protocol session. You may also still elect, instead of A18: the **FPE/legal track** (gates A16/A17 + Stage-1 close — highest-leverage), a **governance housekeeping** pass (the 6 edits above), the **production migrations** (small founder-performed steps), **A19 surface rollout**, or a **deferred Critical activation**.

---

## Pre-conditions (founder confirms at open; AI verifies by read)

1. The A15c + profile-fix commit is pushed; **Vercel green**; `/api/user/rectify`, `/api/user/export`, `/api/user/access` live; `/api/user/delete` + `/api/reason` byte-identical. Working tree clean; no `.git/index.lock`.
2. Production flags unchanged: all four R20a flags `true`; `SUBSTRATE_OTEL_ENABLED` / injection-defence / Layer3 / plugin-install-auth / `SUBSTRATE_ABUSE_DETECTION_ENABLED` all UNSET; A13 cost-health detection Live.
3. `D-PROFILE-EXPORT-ACCESS-KEYING-FIX-2026-06-07` is the last decision-log entry; no work begun after it. Branch `main`; the AI does no git operations.
4. The two production migrations (compliance_access_log, compliance_rectification_log) remain pending unless run in the meantime — note their state at open.

---

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` — tier, model selection (AC1/KG2 if A18c introduces a classifier), risk class, signals, status vocabulary, and the **AI-failure-modes table** (KG-EX1 prescribe-before-grounding; PR17 one-line-hand-off redirects; the new Supabase empty-`select` verification candidate).
2. `/adopted/build-sessions-protocol-cache.md` — "no current users" note; living-state references (component-registry is the status source-of-truth).
3. The predecessor close in full: `/operations/handoffs/founder/2026-06-07-A15c-rectification-endpoint-close.md`.
4. For the elected slice: `/adopted/substrate-plugin-staging-plan.md` §A18; `/manifest.md` targeted — R19c (limitations) + R19d (mirror principle) + R19a/b (honest positioning) for A18b; R20b (independence) for A18c; R20d (relationship asymmetry) is adjacent to A18b's mirror-principle copy.
5. `/operations/decision-log.md` last 3 entries (the predecessors above).

**Confirm at open** (narrate before substantive work, per the cache's failure-modes subsection): where we are in the arc; what's queued; what's awaiting the founder vs the AI. Model selection per the cache AC1 table (N/A unless A18c introduces an LLM classifier). PR15 consult before any bespoke build (`.claude/skills/anthropic/` + `/operations/agentic-commerce-findings-downstream-order.md`; state whether an Anthropic-canonical primitive could deliver the outcome before electing bespoke). **PR6 applies to A18c.** PR17 on every founder-performed step.

---

## Part B — Procedure

Re-scope to the elected slice's staging-plan section + the named rules.

**If a Standard slice (A18a/A18b/A18d/A18e) is elected:** lean templates (cache §"Lean decision-log entry" + §"Lean session close"). For any new public page, the founder verification is "open the URL, check content matches spec" (0c website-page row). Mirror-principle copy that lands in the mentor prompt: read the current mentor prompt before editing; additive text only; keep `/api/reason` + mentor behaviour otherwise byte-identical. Back up any governing doc before an in-place edit.

**If A18c (Elevated → Critical under PR6) is elected:** complete the **full Critical Change Protocol (0c-ii) visibly** before any production change; prove on a single surface first (PR1); verify build-to-wire in-session (PR2 — `tsc --noEmit` + `eslint` + confirm the new functions are invoked in the execution path, not just defined); if a classifier is introduced, confirm model selection against `constraints.ts` (PR4) and run an invocation test (AC4); walk every founder-performed step live (PR17). Note: the substrate/test files run with `tsx`, which fails in the Cowork Linux sandbox (esbuild native-binary platform mismatch) — verify logic with a `tsc`-compiled harness on plain node, never `npm rebuild` (it would overwrite the founder's macOS binaries).

**Verification + commit (every slice):** TEST first; founder runs the verification independently; then remove the `.git/index.lock` if present and commit/push via GitHub Desktop (the AI supplies the exact `git add`/commit command in the close). Append a decision-log entry (lean or full per tier) + a session close.

---

## What is NOT in this session

* No production activation of any inert flag (A19 / A10 / A11b / A12 / A13-delivery / A14 tracker) unless explicitly elected — each its own Critical session.
* No R20a / Zone 2/3 / distress-classifier / wrapper touch (PR6 trip-wire — if any A18c step is found to touch these, it is Critical).
* No `/api/user/export`→`user-data-gathering.ts` consolidation unless explicitly elected (Elevated; its own session).
* No edits to governing docs (manifest, staging plan, CLAUDE.md) without explicit per-edit founder approval + prior-version backup.
* No git operations by the AI (founder commits/pushes via GitHub Desktop; remove the lock file first).

---

## Rollback path

Per the elected slice. Standard content/page slices: additive; revert the commit. A18c: full Critical rollback (additive + flag/revert-able; if a classifier table is added it is droppable). Governing-doc edits: restore each from its `archive/*.backup-pre-edit`.

---

## Forecast

Most likely: A18b + A18d build cleanly as Standard content, leaving A18a (first-run), A18c (dependence detection — its own Critical-protocol session), and A18e (cognitive-accessibility pass) as the remaining A18 work. After A18, the remaining Stage-1-close items are A16/A17 (lawyer-coupled) and the deferred A14 tracker — so the **FPE/legal track remains the long-pole and the highest-leverage parallel move** regardless of which A18 slice is elected. Stage-1 close is still several sessions out.

End of prompt. Opens on `main`. Tier set by the elected slice; if A18c (Critical under PR6) is chosen, the full Critical Change Protocol (0c-ii) is completed visibly before any production change, and every founder-performed dashboard/Vercel/Terminal step is walked live (PR17).
