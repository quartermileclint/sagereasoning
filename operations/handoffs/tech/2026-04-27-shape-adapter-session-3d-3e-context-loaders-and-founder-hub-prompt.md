Governing frame: /adopted/session-opening-protocol.md

Session prompt — Shape adapter Session 3d + 3e combined (context loaders AND founder hub: `practitioner-context.ts`, `mentor-context-private.ts`, `/api/founder/hub/route.ts`, no transitional shims involved, Elevated risk per sub-session)

This session continues the staged transition adopted under ADR-Ring-2-01 (`/compliance/ADR-Ring-2-01-shape-adapter.md`, Adopted 25 April 2026). It combines **Sessions 3d and 3e** into one session at founder direction. The targets are the three remaining un-migrated callers in the Session 3 series: the two context loaders (`practitioner-context.ts`, `mentor-context-private.ts`) and the founder hub (`/api/founder/hub/route.ts`). After this session, every consumer of the legacy `loadMentorProfile()` across `/website/src` is migrated; only `/api/mentor/private/reflect` (Session 4 — Critical, R20a perimeter) remains before Session 5 (legacy retirement).

**Scope note — combining 3d + 3e is a deviation from ADR §12.** The ADR's "simplest first" ordering had 3d before 3e in separate sessions because the founder hub is the largest single surface (~1,540 lines). The founder has chosen to combine them. The agent's discipline in this session: do 3d first (lower stakes, no wire-contract change), reach Verified locally with `tsc` clean and a per-file walkthrough, then assess 3e against the time/complexity already spent. **If at any point 3e turns out to be materially larger than expected — for example, if the hub touches `mentor_interactions` reads in non-trivial ways that intersect with KG3, or if the field-access translation inside the hub is widespread — the agent must surface this with the AI signal "This session will exceed the scope stated at open" and offer the founder the choice to split (close 3d+partial-3e and queue rest for next session) rather than push through.** Founder retains scope authority per element 18 of the protocol.

Sessions verified to date:

* Session 1 (canonical loader on `/api/mentor/ring/proof`, commit `b2f3882`).
* Session 2 (`MentorProfile` extended with seven website-only optional fields under C-α, commit `d2b3619`).
* Session 3a (`buildProfileSummary` rewritten to consume canonical `MentorProfile`; `/api/mentor/private/baseline-response` placed on a transitional shim; commit `7065234`).
* Session 3b (`/api/mentor-baseline-response` — public baseline — fully migrated to `loadMentorProfileCanonical()`; Session 3a shim retired at that caller; `current_profile` dropped from response body under Decision 1=c, audit-confirmed no consumer; commit `ea505ec`).
* Session 3 follow-up (`/api/mentor/private/baseline-response` — private baseline, founder-only — fully migrated to `loadMentorProfileCanonical()`; Session 3a shim retired at that caller; `current_profile` dropped from response body under Decision 1=c, audit-confirmed no consumer; commit `5cdbb52`, founder-verified Vercel green + DevTools live-probe pass).
* Session 3c (`/api/mentor-profile/route.ts` GET fully migrated to `loadMentorProfileCanonical()`; **last transitional shim retired across the codebase**; `profile` field in response body switched to canonical `MentorProfile` shape under Decision 1b=a; `meta` block source paths translated, output keys unchanged under Decision 1a=a; commit `34019e7`, founder-verified Vercel green + DevTools live-probe pass).

After Session 3c, **zero transitional shims remain in the codebase.** The three callers targeted this session sit on the legacy `loadMentorProfile()` directly — no shims, no `buildProfileSummary` involvement (KG3 not in scope for the two context loaders; potentially in scope for the founder hub). The migrations are pure loader-switch + field-access translation per ADR §2.1/§2.2.

**Goals for this session:**

1. **Sub-session 3d.** Migrate `/website/src/lib/context/practitioner-context.ts` and `/website/src/lib/context/mentor-context-private.ts` to call `loadMentorProfileCanonical()` internally instead of `loadMentorProfile()`. Update field accesses in their `buildCondensedContext` (or equivalent) string-builder functions per ADR §2.1/§2.2 (e.g., `profile.proximity_estimate.level` → `profile.proximity_level`; `profile.virtue_profile[<key>]` Record-iteration → `profile.virtue_profile[i]` array-iteration; `profile.causal_tendencies.primary_breakdown` Record → `profile.causal_tendencies[i].failure_point` array; `profile.value_hierarchy.explicit_top_values` summary record → array filter on `value_hierarchy[]`; etc.). These are internal context-builder files; no wire contract changes apply. Output is a string injected into mentor prompts (KG6 zone discipline preserved).

2. **Sub-session 3e.** Migrate `/website/src/app/api/founder/hub/route.ts` to call `loadMentorProfileCanonical()` instead of `loadMentorProfile()`. The hub is the largest single surface in the migration (~1,540 lines). It does not have a transitional shim — it consumes `MentorProfileData` directly today. Field-access translation work is broader here than in any prior Session 3 sub-session. Wire-contract decisions apply to the hub's response body if it returns profile-derived fields to the client.

After Session 3d + 3e is Verified, the only remaining un-migrated caller is `/api/mentor/private/reflect/route.ts` (Session 4 — Critical, R20a perimeter, AC5).

**Adopted in prior sessions:**

* Option C with `MentorProfile` canonical, C-α field placement (Session 2 verified).
* `loadMentorProfileCanonical()` is Live and used by `/api/mentor/ring/proof` (Session 1), `/api/mentor-baseline-response` (Session 3b), `/api/mentor/private/baseline-response` (Session 3 follow-up), and `/api/mentor-profile` GET (Session 3c).
* The frequency-bucket helper `frequencyBucketFromCount` is the single source of truth (exported from the adapter file).
* `buildProfileSummary` consumes canonical `MentorProfile`. **No transitional shims remain.**
* Sage-mentor's zero-imports-from-website encapsulation must be preserved.
* Coordinates with ADR-R17-01 (retrieval cache, not yet implemented): no change to the cache surface this session.
* **Founder uses GitHub Desktop to commit and push** — the sandbox cannot push (PR8 process rule, formally proposed at Session 3a close as D-PR8-PUSH; widened scope proposed at Session 3c close to cover commit too, since stale `.git/index.lock` blocks sandbox commits when host-side has held the lock). Sandbox push attempts have failed six times consecutively; sandbox commit attempts have failed once (Session 3c). The session-close handoff names the GitHub Desktop steps explicitly under Founder Verification.
* **Stale `.git/index.lock` cleanup discipline** (proposed promotion D-LOCK-CLEANUP at Session 3b close — pending decision-log adoption; **revision proposed at Session 3c close because the original cleanup tool failed in that session**): on encountering "Operation not permitted" warnings on `.git/index.lock` and/or `.git/objects/**/tmp_obj_*`, FIRST try `mcp__cowork__allow_cowork_file_delete` for the repo's `.git/` directory and `rm -f` the stale lock and tmp files. **If the cleanup tool returns "Could not find mount for path" (the failure observed at Session 3c), do NOT attempt repeated bash retries — surface the AI signal "This is a limitation" and ask the founder to clear the lock host-side: either by closing and reopening GitHub Desktop (often releases stale locks automatically) or by running `rm -f "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/.git/index.lock"` from a Terminal on the Mac. Then ask the founder to commit and push via GitHub Desktop instead of the sandbox.**

**Before starting, please:**

1. **Complete the session-opening protocol** — read this handoff prompt first, then the canonical-source tier for code sessions (1, 2, 3, 8, 9). Specifically:
   1. Manifest — `/manifest.md`, full read.
   2. Project instructions — pinned in your system prompt.
   3. Most recent handoff in tech stream — `/operations/handoffs/tech/2026-04-26-shape-adapter-session-3c-mentor-profile-get-close.md` (Session 3c close — last transitional shim retired; the seven-criterion live-probe verified by founder via DevTools; the new push-cannot-commit observation at 6th recurrence; the stale-lock cleanup discipline failure at 5th recurrence; the six pending decision-log entries including this session's verifications). Also still relevant for context: the Session 3-follow-up close (`2026-04-25-shape-adapter-session-3-private-baseline-full-migration-close.md`), Session 3b close, and Session 3a close.
   4. Technical state — `/summary-tech-guide.md` and `/summary-tech-guide-addendum-context-and-memory.md`. Sections relevant: any orchestration sections that touch the founder hub or the practitioner / private-mentor context loaders. Pay attention to the four-layer context architecture (AC6) — the context loaders' output is a Layer 2b string composed into the user-message side; the hub may compose Layer 3 / Layer 5 signals.
   5. Verification framework — `/operations/verification-framework.md`. Read the "Code Change" verification method.
   * Plus scan `/operations/knowledge-gaps.md` for entries relevant to this session's scope:
     - **KG1 (Vercel rules):** potentially relevant to the founder hub — confirm no fire-and-forget added; preserve the existing async posture; if the hub uses `process.cwd()`, name its posture explicitly.
     - **KG2 (Haiku boundary):** potentially relevant — if either loader or the hub invokes any LLM call (passion diagnosis, mentor narrative), confirm Sonnet for anything not single-mechanism short-output simple-JSON; the loaders themselves are pure string-builders (no LLM expected) but the hub may call out.
     - **KG3 (hub-label consistency):** **highly relevant — the founder hub reads `mentor_interactions` heavily.** Trace the `'founder-hub'` label from client → writer → reader at all three sites before any field-access translation. If any new read is added under the migration, run a write-then-read probe.
     - **KG6 (composition order):** relevant. The two context loaders return strings that compose into prompts; the hub composes Layer 3 / Layer 5 signals. Confirm `buildProfileSummary` (if used) and the loader output continue to land in the same prompt zone (user message, per AC6 L2b/L4/L5). Audit placement at any layer-touching change.
     - **KG7 (JSONB shape):** potentially relevant if the hub writes JSONB. Read-side migration only this session; if JSONB writes appear in scope, name expected `jsonb_typeof` up front.

2. **Confirm P0 hold-point status (still active).** This work is permissible inside the hold-point assessment set because it advances live-data integration of the context-builder strings and the founder hub.

3. **Read ADR-Ring-2-01** (`/compliance/ADR-Ring-2-01-shape-adapter.md`) for context — particularly §7 (Sessions 3d and 3e in the adopted plan), §11 (rollback plan, per-session), and §12 (Notes for Implementation Sessions — Session 3, including the simplest-first ordering that this combined session is electing to override).

4. **Read the source files involved:**
   * `/website/src/lib/context/practitioner-context.ts` — primary edit target for sub-session 3d. Calls `loadMentorProfile()` internally; returns a context envelope or string used by `getPractitionerContext` and `getFullPractitionerContext`. Field-access translation per ADR §2.1/§2.2 applies inside the string-builder. Read the file in full at session open to enumerate the `profile.<field>` access sites before deciding on field-access translation; the prompt does not pre-list them because the file's line counts and helper structure should be read empirically.
   * `/website/src/lib/context/mentor-context-private.ts` — primary edit target for sub-session 3d. Same posture as `practitioner-context.ts` but for the private mentor context. Read in full at session open.
   * `/website/src/app/api/founder/hub/route.ts` — primary edit target for sub-session 3e. Large surface (~1,540 lines). Calls `loadMentorProfile()` directly. Currently consumes `MentorProfileData` throughout. Field-access translation work is the largest in the Session 3 series. Read in full at session open and produce a per-section walk before writing any code; if the read makes it clear the surface is too large for a combined session, surface the scope-cap signal immediately.
   * `/website/src/lib/mentor-profile-store.ts` — both `loadMentorProfile()` (legacy, returns `MentorProfileData`) and `loadMentorProfileCanonical()` (canonical, returns `MentorProfile`). Reference for the loader switch.
   * `/website/src/lib/mentor-profile-summary.ts` — `MentorProfileData` (legacy type) and `buildProfileSummary` (canonical). Reference for the field-access translation.
   * `/sage-mentor/persona.ts` — `MentorProfile` type definition. Reference for canonical field names; do NOT edit. The seven website-only optional fields added under C-α (Session 2): `journal_name?`, `journal_period?`, `sections_processed?`, `entries_processed?`, `total_word_count?`, `founder_facts?`, `proximity_estimate_description?`.
   * `/website/src/app/api/mentor-profile/route.ts` — Session 3c's already-migrated counterpart (commit `34019e7`). Reference for the migration pattern at the field-access translation level — particularly the `proximity_estimate.level/.senecan_grade` → flat field translations and the static-fallback adapter pattern (Decision 3 = a).
   * Any frontend or server client that reads the founder hub's response body. **Run a grep before changing the loader so the wire-contract risk for sub-session 3e is audited end-to-end.** The hub is the most surface-area route in the codebase and is most likely of the Session 3 series to have downstream UI consumers reading specific profile fields. Likely candidates: `app/founder-hub/page.tsx`, `app/founder-hub/[section]/page.tsx`, any `useFounderHub`-style hook, any layout component that pulls hub data. Re-run the grep with the explicit field paths the legacy hub response exposes (e.g., `proximity_estimate.level`, nested `causal_tendencies`, `virtue_profile[<key>]`).

5. **Before writing any code, surface these decisions for the founder and wait for direction. Decisions are split by sub-session.**

   **Sub-session 3d decisions** (context loaders):

   * **Decision 3d-1 — Field-access translation inside each context loader.** After switching to `loadMentorProfileCanonical()`, the local profile variable becomes `MentorProfile`. Walk each file at decision-walk and enumerate every field access on the local profile variable; flag each one for translation explicitly before writing code. Translations applied: `proximity_estimate.{level,senecan_grade,description}` → `proximity_level`, `senecan_grade`, `proximity_estimate_description?`; `virtue_profile[<key>]` Record-iteration → `virtue_profile[i]` array-iteration with `{domain, strength, evidence}`; `causal_tendencies.{primary_breakdown,specific_breakdowns}` Record → `causal_tendencies[i]` array iteration with `{failure_point, frequency, description, examples}`; `value_hierarchy.{explicit_top_values, primary_conflict, classification_gaps}` Record → array filter on `value_hierarchy[]` with `{item, declared_classification, observed_classification, gap_detected}`; `oikeiosis_map[<key>]` Record-iteration → `oikeiosis_map[i]` array-iteration with `{person_or_role, relationship, oikeiosis_stage, reflection_frequency}`; `passion_map[].frequency` 1–12 number → `'rare'|'occasional'|'recurring'|'persistent'` bucket string; `passion_map[].false_judgements[]` plural → `false_judgement` singular; `preferred_indifferents_aggregate` → `preferred_indifferents`. **Procedural confirmation only — no founder choice required.** Surface the enumeration, note that the changes are internal to each loader's string-builder, then proceed.

   * **Decision 3d-2 — Static fallback shape (if either context loader has one).** Same options as prior sessions:
      * (a) Keep static fallback in legacy shape; adapt at use site via `adaptMentorProfileDataToCanonical()`. Symmetric with Sessions 3b, 3-follow-up, and 3c.
      * (b) Convert any static fallback file to canonical shape now.
      * **Recommend (a)** if a fallback exists. If neither file uses a fallback (both files just call the loader and propagate null), this decision is N/A — flag at session open.

   * **Decision 3d-3 — Both files in a single commit, or split commits.** Both files share the same migration pattern; the simplest-first principle prefers a single commit so the migration is atomic. If the two files have different scopes of field-access translation, split commits are also defensible. **Recommend single commit** — symmetric with the prior single-file Session 3 sub-sessions.

   **Sub-session 3e decisions** (founder hub):

   * **Decision 3e-1 — Wire-contract translation for the hub's response body.** This is the biggest decision of the session. The hub's response body returns profile-derived fields to the founder hub UI. After the loader switch, those fields' shapes change. Three options per the ADR pattern:
      * (a) Switch the loader and let the hub emit canonical field names. Audit any client that reads the hub's response body; update those clients alongside the hub migration.
      * (b) Switch the loader internally for `buildProfileSummary` / context-building purposes but explicitly translate response-body fields back to legacy names (preserves the wire contract; partial migration).
      * (c) Drop any specific response-body fields that have no current consumer.
      * **Recommend running the grep audit (`grep -rn "founder/hub" website/src` and `grep -rn "fetch\(.*founder/hub" website/src`) and applying logic similar to Sessions 3b, 3-follow-up, and 3c**: if the hub response body has fields no client reads, recommend (c) for those (drop); if a client does read fields, recommend (a) for those (canonical, with client updates) when the client surface is also ready to change, otherwise (b) for those (preserve legacy with translation).
      * **The hub is the largest UI-consumed surface in the migration. Expect this audit to surface real consumers — unlike Sessions 3b, 3-follow-up, and 3c which had zero. Plan accordingly.**

   * **Decision 3e-2 — Field-access translation inside the hub.** Same translation table as Decision 3d-1 but applied across ~1,540 lines. Walk the file at decision-walk and enumerate every field access on the local profile variable; flag each one for translation explicitly before writing code. **If the enumeration shows this is materially larger than the prior Session 3 sub-sessions combined, surface the scope-cap signal: "This session will exceed the scope stated at open" and offer the founder the choice to split.**

   * **Decision 3e-3 — Static fallback shape in the hub.** Likely the same `mentorProfileFallback` JSON file used by other routes. **Recommend (a)** — symmetric with prior sessions.

   * **Decision 3e-4 — Hub-label trace under KG3 before any read translation.** If the hub reads `mentor_interactions` (likely), trace the `'founder-hub'` label from client → writer → reader at all three sites before changing any field accesses on read paths. Document the trace in the handoff. If any drift surfaces, halt the migration and queue a separate session under KG3 — do not bundle it into the loader switch.

6. **Walk the change plan with risk classification before writing any code:**

   **Sub-session 3d — Elevated** (per ADR §7 Session 3, even though context loaders are not on the request path themselves; they are consumed by routes that are):
   * Files to be edited: `/website/src/lib/context/practitioner-context.ts`, `/website/src/lib/context/mentor-context-private.ts`. Each file: switch loader from `loadMentorProfile` to `loadMentorProfileCanonical`; add type-only import of `MentorProfile` from sage-mentor (count the relative path segments empirically — these files are at `/website/src/lib/context/<file>.ts` which is 3 segments up to `/website/src/`, then 1 up to `/website/`, then 1 up to project root, so the type-only import path is likely `'../../../../sage-mentor'` — 4 segments — but **verify against any existing relative-path import in either file before deciding**); update the type annotation on the local profile variable; update the field accesses inside the string-builder helper(s) per Decision 3d-1; update inline comments and docstring to mark each caller as fully migrated.
   * What could break: any consumer that reads the context-builder's output by structural pattern. The output is a string for prompt composition, so this risk is bounded — pattern matches in downstream prompt logic are unlikely. TypeScript catches all internal field-access mistranslations at compile time.
   * What happens to existing sessions: nothing. No auth, cookie, session, or domain-redirect change. AC7 not engaged. PR6 not engaged (these files do not invoke `enforceDistressCheck` or `detectDistressTwoStage`).
   * Rollback plan (per ADR §11): revert the single 3d commit. Each context loader returns to the legacy loader. Founder routes that consume the context strings continue to work because the strings' content is structurally similar (same sections, slightly different field-access details).
   * Verification: pre-deploy `npx tsc --noEmit` clean. Post-deploy: live-probe of any route that consumes the context loaders. The session-close handoff has snippets ready to paste.

   **Sub-session 3e — Elevated** (per ADR §7 Session 3):
   * Files to be edited: `/website/src/app/api/founder/hub/route.ts`. If Decision 3e-1 = (a) and a client consumes the hub's response: that client (likely `app/founder-hub/page.tsx` or similar) also migrates this session. Re-confirm via grep before declaring scope.
   * What could break: any UI client reading the hub's response body's legacy field paths. This is the largest blast radius in the migration so far. Grep-then-decide is non-negotiable. Any drift in the `mentor_interactions` hub-label trace is also a risk path under KG3.
   * What happens to existing sessions: nothing. No auth, cookie, session, or domain-redirect change. AC7 not engaged. PR6 not engaged (the hub is not in the AC5 R20a perimeter — that's `/api/mentor/private/reflect`; verify by reading the hub route at session open).
   * Rollback plan (per ADR §11): revert the 3e commit. Hub returns to legacy loader. If the 3e commit also touched a UI client (Decision 3e-1 = a), revert that too — the two should be a single commit so the revert is atomic, OR two adjacent commits where the UI commit is reverted first.
   * Verification: pre-deploy `npx tsc --noEmit` clean. Post-deploy: live-probe of `/api/founder/hub` from the founder hub page itself (not just DevTools — the hub UI exercises the response body's field access patterns end-to-end).

7. **After founder approval of the plan, build in this order:**
   1. **Sub-session 3d first.** Edit both context loaders. Switch each loader call; add the type-only import; update field accesses; update inline comments. `npx tsc --noEmit`. Confirm exit 0. Single commit on `main` with a message naming ADR-Ring-2-01 Session 3d, the two migrated callers, and the field-access translations applied.
   2. **Founder commits and pushes via GitHub Desktop:**
      1. **If commit lands cleanly from the sandbox**, the founder pushes only:
         1. Open GitHub Desktop.
         2. Top-left, confirm Current Repository = `sagereasoning`.
         3. Top-right, click Push origin (badge shows `1`).
         4. Wait for the spinner to finish.
      2. **If the sandbox commit is blocked by a stale `.git/index.lock`** (5+ recurrences observed, cleanup tool failed once at Session 3c — the agent must surface "This is a limitation" and ask the founder for help), the founder clears the lock host-side and commits + pushes via GitHub Desktop:
         1. **Clear the lock**: either close and reopen GitHub Desktop (often releases stale locks automatically), or run `rm -f "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/.git/index.lock"` from a Terminal on the Mac.
         2. Open GitHub Desktop.
         3. Top-left, confirm Current Repository = `sagereasoning`.
         4. The pending changes appear in the left pane. Type a commit message (the agent will provide one in the conversation).
         5. Click **Commit to main**.
         6. Click **Push origin**.
         7. Wait for the spinner to finish.
   3. Wait for Vercel to deploy the new commit hash. Founder confirms `Ready` status before testing.
   4. **Live-probe Sub-session 3d.** Founder runs the snippet provided by the agent. Confirms 3d is Verified.
   5. **Sub-session 3e — STOP HERE if any of the following is true:**
      * Sub-session 3d's live-probe surfaces a regression (founder may signal "I'm done for now" — agent stabilises and closes).
      * Reading `/api/founder/hub/route.ts` at decision-walk (step 4 above) revealed the surface to be materially larger than the prior Session 3 sub-sessions combined.
      * The grep audit for hub consumers (Decision 3e-1) surfaced 5+ UI clients that need coordinated edits.
      * The KG3 hub-label trace surfaces drift requiring a separate session.
      In any of these cases, surface the scope-cap signal and close at 3d-Verified.
   6. **If proceeding with 3e**: edit `/api/founder/hub/route.ts`. Switch the loader; resolve the wire contract per Decision 3e-1 (may require client edits in the same commit); translate field accesses per Decision 3e-2; resolve any KG3 hub-label work per Decision 3e-4. `npx tsc --noEmit`. Confirm exit 0. Single commit on `main` (or two commits: hub + UI client) with messages naming ADR-Ring-2-01 Session 3e, the migrated caller, the wire-contract decisions, and any client edits.
   7. Founder commits and pushes via GitHub Desktop using the same flow as step 2 above.
   8. Wait for Vercel to deploy. Founder confirms Ready.
   9. **Live-probe Sub-session 3e.** Founder runs the snippet provided by the agent. Snippet exercises the hub via the founder hub UI page (not just a DevTools fetch — the hub UI exercises the field access patterns end-to-end). Confirms 3e is Verified.

8. **Out of scope this session** (queued for later sessions per ADR §7):
   * `/api/mentor/private/reflect/route.ts` (Session 4 — Critical, R20a perimeter, AC5).
   * Journal pipeline write-side migration (Session 4 — Critical).
   * Retiring the legacy `loadMentorProfile()` or `MentorProfileData` (Session 5).
   * Persisted-row migration (Session 6 — optional).
   * Any sage-mentor runtime function rewrite.

9. **Decision-log items pending founder approval at this session open** (six entries now — carried from prior sessions):
   * **D-RING-2-S3a** — Session 3a Verified. Carried from Session 3a close. Approve at session open.
   * **D-PR8-PUSH** — Promotes the sandbox-cannot-push limitation to a process rule (3rd recurrence at Session 3a close, 4th at Session 3b, 5th at Session 3-follow-up, 6th at Session 3c). **Text revision proposed at Session 3c close — widen scope to cover commit too, since stale `.git/index.lock` blocks sandbox commits when host-side has held the lock.** Approve revised text at session open.
   * **D-RING-2-S3b** — Session 3b Verified. Carried from Session 3b close. Approve at session open.
   * **D-LOCK-CLEANUP** — Promotes the stale-lock cleanup discipline to a process rule (3rd recurrence at Session 3b close, 4th at Session 3-follow-up, 5th at Session 3c). **Text revision proposed at Session 3c close — original cleanup tool failed in that session; revised text adds the host-side fallback (close GitHub Desktop or `rm -f` from Terminal).** Approve revised text at session open.
   * **D-RING-2-S3-PRIVATE-FULL** — Session 3-follow-up Verified. Carried from Session 3-follow-up close. Approve at session open.
   * **D-RING-2-S3C-MENTOR-PROFILE-GET** — Session 3c Verified. Founder confirmed via DevTools live-probe pass on commit `34019e7`. Carried from Session 3c close. Approve at session open.

10. **PR-rule discipline named at session open:**

* **PR1** — single-endpoint proof. Two migrated callers in 3d (single commit OK because they share a migration pattern), one migrated caller in 3e. Each is its own PR1 proof.
* **PR2** — verification immediate. `tsc --noEmit` after each substantive edit; live-probe in same session as deploy. **Live-probe 3d before starting 3e.**
* **PR3** — no async behaviour added. Both context loaders and the hub are already async (or pure synchronous, for the loaders' string-builder portion); the loader switch preserves that posture.
* **PR4** — model selection. The two context loaders have no LLM in path (pure string-builders). The founder hub may invoke an LLM call (passion-engine narrative or similar); confirm at decision-walk by reading the hub file. If LLM is invoked, name the model and check against `constraints.ts` AC1 — Sonnet for anything not single-mechanism short-output simple-JSON; Haiku only for simple JSON.
* **PR5** — re-explanations flagged in handoff. Cumulative count maintained in close note. Path-depth counts for the relative-path imports are PR5 candidates (Session 3-follow-up corrected the prompt's stated count of 6 → 7 segments; Session 3c confirmed 5 segments empirically). For this session: context loaders are at depth `/website/src/lib/context/<file>.ts` — likely 4 segments to project root; founder hub is at `/website/src/app/api/founder/hub/route.ts` — likely 6 segments (one level deeper than the routes Session 3b/3-follow-up/3c migrated, because of the `/founder/` directory). **Verify empirically against any existing dynamic import or `'../sage-mentor'`-style import in each file before writing code.**
* **PR6** — safety-critical changes are Critical. **This session is Elevated, not Critical.** Confirm at session open: neither context loader nor the hub is in the AC5 R20a perimeter (which is `/api/mentor/private/reflect` and the seven other POST routes enumerated in `r20a-invocation-guard.test.ts`). The context loaders and hub do not invoke `enforceDistressCheck` or `detectDistressTwoStage` (verify by reading the files at session open). If verification confirms, PR6 remains not engaged.
* **PR7** — deferred decisions logged. The remaining un-migrated route (`/api/mentor/private/reflect`) continues to carry its disposition (legacy loader directly) with named retirement condition (Session 4 — Critical).
* **PR8** — push limitation and stale-lock cleanup are process rules. Use GitHub Desktop for both commit (when sandbox commit is blocked) and push. Do not attempt `git push` from the sandbox. Do not retry sandbox commit if a stale lock blocks it after one cleanup-tool attempt — ask the founder for host-side help.
* **AC7** — Session 7b standing constraint. No auth/cookie/session/domain-redirect change. Confirm at session open and again at deploy.

11. **Close-session obligations** (per protocol Part C, elements 19–21):

* Stabilise to a known-good state. If the live-probe surfaces a regression, founder may signal "I'm done for now" — do not propose additional fixes.
* Produce a handoff note at `/operations/handoffs/tech/[date]-shape-adapter-session-3d-3e-context-loaders-and-founder-hub-close.md` (or `[date]-shape-adapter-session-3d-context-loaders-close.md` if the session split at 3d) in the required-minimum format plus extensions (Verification Method Used, Risk Classification Record, PR5, Founder Verification, Decision Log Entries — Proposed). Name that this session migrated the last consumer-side callers in the Session 3 series — after this session, only Session 4 (Critical) and Session 5 (legacy retirement) remain.
* The Founder Verification section must use GitHub Desktop for the push step (and for the commit step if sandbox commit was blocked) — not a terminal command. Format:
   1. Open GitHub Desktop.
   2. Confirm Current Repository = `sagereasoning`.
   3. (If commit was made in sandbox) Click Push origin (badge shows `1`). (If commit must be made via GitHub Desktop) Type the commit message provided by the agent in the bottom-left, click Commit to main, then click Push origin.
   4. Wait for the spinner.
* Pre-test the DevTools snippet's expected response shape against the route handler before handing it to the founder. The snippet must use the correct HTTP method, include `Content-Type: application/json` and a Supabase Bearer token. The wire-contract assertion lines must match the resolved Decisions 3e-1.
* State plainly at close that this protocol was the governing frame and the work was governed by ADR-Ring-2-01 §7 Sessions 3d and 3e.

Signal "OK" when the plan above is approved and the step-5 decisions are in (3d-1, 3d-2, 3d-3, then 3e-1, 3e-2, 3e-3, 3e-4 — the 3e decisions can be made after 3d is Verified if you prefer to stage the approvals). I'll then build, verify, and close.
