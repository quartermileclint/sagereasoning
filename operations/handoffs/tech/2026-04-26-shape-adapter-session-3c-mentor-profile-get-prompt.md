Governing frame: /adopted/session-opening-protocol.md

Session prompt — Shape adapter Session 3c (mentor-profile GET full migration: `/api/mentor-profile/route.ts`, last remaining transitional shim, Elevated risk)

This session continues the staged transition adopted under ADR-Ring-2-01 (`/compliance/ADR-Ring-2-01-shape-adapter.md`, Adopted 25 April 2026). It migrates the **last remaining transitional shim** in the codebase — the GET endpoint at `/api/mentor-profile/route.ts`. After this session, every consumer that calls `buildProfileSummary` will be on `loadMentorProfileCanonical()`; only `/api/founder/hub` (Session 3e, no shim — uses `loadMentorProfile` directly) and the two context loaders `practitioner-context.ts` + `mentor-context-private.ts` (Session 3d, no `buildProfileSummary` involvement) remain to migrate before Session 4 (Critical) and Session 5 (legacy retirement).

Sessions verified to date:

* Session 1 (canonical loader on `/api/mentor/ring/proof`, commit `b2f3882`).
* Session 2 (`MentorProfile` extended with seven website-only optional fields under C-α, commit `d2b3619`).
* Session 3a (`buildProfileSummary` rewritten to consume canonical `MentorProfile`; `/api/mentor/private/baseline-response` placed on a transitional shim; commit `7065234`).
* Session 3b (`/api/mentor-baseline-response` — public baseline — fully migrated to `loadMentorProfileCanonical()`; Session 3a shim retired at that caller; `current_profile` dropped from response body under Decision 1=c, audit-confirmed no consumer; commit `ea505ec`).
* Session 3 follow-up (`/api/mentor/private/baseline-response` — private baseline, founder-only — fully migrated to `loadMentorProfileCanonical()`; Session 3a shim retired at that caller; `current_profile` dropped from response body under Decision 1=c, audit-confirmed no consumer; commit `5cdbb52`, founder-verified Vercel green + DevTools live-probe pass).

After Session 3 follow-up, **one transitional shim remains** in the codebase awaiting follow-up Session-3 work — `/api/mentor-profile/route.ts` (this session's target). The founder hub (`/api/founder/hub`) is on legacy `loadMentorProfile()` directly with no shim; it migrates as Session 3e. The two context loaders `practitioner-context.ts` and `mentor-context-private.ts` migrate as Session 3d (lower stakes, no `buildProfileSummary` involvement).

Goal: migrate `/api/mentor-profile/route.ts` (GET) fully to `loadMentorProfileCanonical()`. Remove the last transitional shim. **Additional translation work this session**: the route's GET response includes a `meta` block that reads MentorProfileData fields directly (e.g., `journal_name`, `proximity_estimate.level`, `proximity_estimate.senecan_grade`, etc.); these field accesses translate to canonical field names. The wire contract for the `meta` block changes shape — a Decision 1 analogue (a/b/c) applies to the `meta` block as a whole, and additionally to `current_profile` if the route returns one in its response body.

Adopted in prior sessions:

* Option C with `MentorProfile` canonical, C-α field placement (Session 2 verified).
* `loadMentorProfileCanonical()` is Live and used by `/api/mentor/ring/proof` (Session 1), `/api/mentor-baseline-response` (Session 3b), and `/api/mentor/private/baseline-response` (Session 3 follow-up).
* The frequency-bucket helper `frequencyBucketFromCount` is the single source of truth (exported from the adapter file).
* `buildProfileSummary` consumes canonical `MentorProfile`. All five call sites compile against the canonical signature; four are now on the canonical loader; one remains on the transitional shim (this session's target).
* Sage-mentor's zero-imports-from-website encapsulation must be preserved.
* Coordinates with ADR-R17-01 (retrieval cache, not yet implemented): no change to the cache surface this session.
* **Founder uses GitHub Desktop to push commits** — the sandbox cannot push (PR8 process rule, formally proposed at Session 3a close as D-PR8-PUSH; pending decision-log adoption but operationally in force across all five sessions to date — sandbox push attempts have failed five times consecutively). The session-close handoff names the GitHub Desktop steps explicitly under Founder Verification.
* Stale `.git/index.lock` cleanup discipline (proposed promotion D-LOCK-CLEANUP at Session 3b close — pending decision-log adoption; operationally in force, performed cleanly at Session 3 follow-up close): on encountering "Operation not permitted" warnings on `.git/index.lock` and/or `.git/objects/**/tmp_obj_*`, invoke `mcp__cowork__allow_cowork_file_delete` for the repo's `.git/` directory and `rm -f` the stale lock and tmp files before retrying.

Before starting, please:

1. Complete the session-opening protocol — read this handoff prompt first, then the canonical-source tier for code sessions (1, 2, 3, 8, 9). Specifically:
   1. Manifest — `/manifest.md`, full read.
   2. Project instructions — pinned in your system prompt.
   3. Most recent handoff in tech stream — `/operations/handoffs/tech/2026-04-25-shape-adapter-session-3-private-baseline-full-migration-close.md` (Session 3 follow-up close — the path-depth correction at "Decisions Made / Path-depth correction surfaced and applied", the verified Decision 1=c symmetric removal, the four pending decision-log entries from prior sessions plus the new D-RING-2-S3-PRIVATE-FULL). Also still relevant: `/operations/handoffs/tech/2026-04-25-shape-adapter-session-3b-public-baseline-close.md` and `/operations/handoffs/tech/2026-04-25-shape-adapter-session-3-private-baseline-close.md` (Session 3a close — for context on how the shim landed at this caller).
   4. Technical state — `/summary-tech-guide.md` and `/summary-tech-guide-addendum-context-and-memory.md`. Sections relevant: any orchestration sections that touch the mentor-profile GET endpoint or its `meta` block consumers.
   5. Verification framework — `/operations/verification-framework.md`. Read the "Code Change" verification method.
   * Plus scan `/operations/knowledge-gaps.md` for entries relevant to this session's scope. KG1 (Vercel rules) potentially relevant — the route is server-side; confirm no fire-and-forget added; preserve the existing async posture. KG2 (Haiku boundary) not relevant — no LLM in `buildProfileSummary`'s path. KG3 (hub-label consistency) potentially relevant — the GET endpoint may read from `mentor_interactions` for context; confirm any hub-label work at the read boundary. KG6 (composition order) potentially relevant — confirm `buildProfileSummary` output continues to land in the same prompt zone (if the GET endpoint composes it into a downstream prompt). KG7 (JSONB shape) not relevant unless the route writes JSONB this session — it shouldn't; this is a read-side migration.
2. Confirm P0 hold-point status (still active). This work is permissible inside the hold-point assessment set because it advances live-data integration of the profile read endpoint.
3. Read ADR-Ring-2-01 (`/compliance/ADR-Ring-2-01-shape-adapter.md`) for context — particularly §7 (Session 3 in the adopted plan), §11 (rollback plan, per-session), and §12 (Notes for Implementation Sessions — Session 3).
4. Read the source files involved:
   * `/website/src/app/api/mentor-profile/route.ts` — primary edit target. Currently has a transitional shim at the `buildProfileSummary` call site (line ~51 area per Session 3a handoff). The shim retires this session. The loader switches. The field accesses change at the buildProfileSummary call site AND at the `meta` block (this is the additional translation work that distinguishes this session from the two baseline migrations). The Session 3a handoff specifically flagged the `meta` block as the additional work this route requires.
   * `/website/src/lib/mentor-profile-store.ts` — both `loadMentorProfile()` (legacy, returns `MentorProfileData`) and `loadMentorProfileCanonical()` (canonical, returns `MentorProfile`). Reference for the loader switch.
   * `/website/src/lib/mentor-profile-summary.ts` — `MentorProfileData` (legacy type) and `buildProfileSummary` (now consumes `MentorProfile`). Reference for the field-access translation when reading the route's `currentProfile` after the loader switch.
   * `/sage-mentor/persona.ts` — `MentorProfile` type definition. Reference for the field accesses; do NOT edit. Pay particular attention to the canonical names of the seven website-only optional fields added under C-α (Session 2): `journal_name?`, `journal_period?`, `sections_processed?`, `entries_processed?`, `total_word_count?`, `founder_facts?`, `proximity_estimate_description?`. These are exactly the fields that historically lived on the legacy `MentorProfileData` shape that the `meta` block reads, and they now live as optional fields on the canonical `MentorProfile`.
   * `/website/src/app/api/mentor-baseline-response/route.ts` — Session 3b's already-migrated counterpart (commit `ea505ec`). Reference for the migration pattern at the buildProfileSummary call site and the loader switch. Note: the `meta`-block work this session adds is NOT in the public baseline; it's specific to this GET endpoint.
   * `/website/src/app/api/mentor/private/baseline-response/route.ts` — Session 3 follow-up's already-migrated counterpart (commit `5cdbb52`). Reference for the migration pattern when the caller is auth-gated. Same observation: no `meta`-block work was needed in either baseline route.
   * Any frontend or server client that reads the GET response's `meta` block. Run a grep before changing the loader so the wire-contract change is audited end-to-end. Likely candidates: `mentor-baseline/page.tsx`, `mentor-baseline/refinements/page.tsx`, the founder hub UI, any `useMentorProfile`-style hook. The GET endpoint is the obvious profile-fetch endpoint and is more likely to have external consumers than the POST refinement endpoints. Re-run the grep with the explicit field paths the `meta` block exposes (e.g., `journal_name`, `proximity_estimate.level`).
5. Before writing any code, surface these decisions for the founder and wait for direction:
   * Decision 1a — Wire-contract translation for the `meta` block. Switching the loader changes the shape of the fields the `meta` block reads (e.g., `proximity_estimate.level` → `proximity_level`; nested objects → flat fields per ADR §2.1/§2.2). Three options:
      * (a) Switch the loader and let the `meta` block emit canonical field names. Audit any client that reads the meta block; update those clients alongside the route migration.
      * (b) Switch the loader for `buildProfileSummary` purposes but explicitly translate the `meta` block back to legacy field names in the response (preserves the wire contract; partial migration but cleaner client surface for now).
      * (c) Switch the loader; do not return the `meta` block at all. Removes a redundancy if no client reads it.
      * Recommend running the grep audit (`grep -rn 'meta\\.' website/src` and `grep -rn 'meta:.*journal_name\\|proximity_estimate\\.level' website/src`) and applying logic similar to Sessions 3b and 3 follow-up: if no client reads the meta block, recommend (c) — same end-state pattern; if a client does read it, recommend (b) for now and adopt (a) when the client surface is also ready to change.
   * Decision 1b — Wire-contract translation for `current_profile` (if applicable). If the GET response also returns a `current_profile` field (mirror of the POST baseline endpoints), the same Decision 1 (a/b/c) applies. Run the same audit as Sessions 3b and 3 follow-up (`grep -rn '\\.current_profile' website/src`) — historical audits returned zero matches; re-confirm.
   * Decision 2 — Field-access translation inside the route. After switching to `loadMentorProfileCanonical()`, the route's local profile variable becomes `MentorProfile`. The shim collapses to `buildProfileSummary(profile)`. The `meta` block's field accesses translate per ADR §2.1/§2.2 (e.g., `profile.proximity_estimate.level` → `profile.proximity_level`; `profile.proximity_estimate.senecan_grade` → `profile.senecan_grade`; `profile.virtue_profile[<key>]` Record → `profile.virtue_profile[i]` array iteration). Walk the route file at decision-walk and enumerate every field access on the local profile variable; flag each one for translation explicitly before writing code.
   * Decision 3 — Static fallback (`mentorProfileFallback`) shape. Same two options as Sessions 3b and 3 follow-up:
      * (a) Stays as `MentorProfileData` and adapts at the use site — `adaptMentorProfileDataToCanonical(mentorProfileFallback as MentorProfileData)`. Keeps the static JSON file unchanged. Retires alongside `MentorProfileData` in Session 5.
      * (b) Becomes a `MentorProfile`-shaped JSON file. Cleanest end state, but adds a file-format change to this session.
      * Recommend (a) — symmetric with Sessions 3b and 3 follow-up. The static JSON file retires alongside `MentorProfileData` in Session 5.
6. Walk the change plan with risk classification before writing any code (Elevated, per ADR §7 Session 3):
   * Files to be edited:
      * Always: `/website/src/app/api/mentor-profile/route.ts` — switch loader from `loadMentorProfile` to `loadMentorProfileCanonical`; add type-only import of `MentorProfile` from sage-mentor (count the relative path segments empirically — the file is at `/website/src/app/api/mentor-profile/route.ts` which is **5 segments** from project root, so the type-only import path is `'../../../../../sage-mentor'` — the same as Session 3b's public baseline because both routes are at the same directory depth; verify this against any existing relative-path import in the same file before deciding); update the type annotation on the local profile variable; update the fallback handling per Decision 3; update the `buildProfileSummary` call to drop the adapter wrap; resolve the `meta` block field accesses; resolve `current_profile` if present per Decision 1b; update inline comments and docstring to mark this caller as fully migrated.
      * If Decision 1a = (a) and a client consumes the `meta` block: that client also migrates this session. Re-confirm via grep before declaring scope.
      * If Decision 1a = (c): the response body shrinks; no client edit needed but document the removal in the route's docstring and inline comments.
   * What could break:
      * Any client reading the `meta` block's legacy field paths (e.g., `data.meta.proximity_estimate.level`) — those field paths change under canonical. Grep first.
      * Any client reading `current_profile.<x>` — historical audits returned zero matches, but re-confirm.
      * The fallback path. If `mentorProfileFallback` is read but the adapter-wrap step is missed, TypeScript catches the type mismatch at compile time.
      * The `meta` block field translation itself. If a field name is mistranslated (e.g., `proximity_level` typo), TypeScript catches it because `MentorProfile` is a strict type.
   * What happens to existing sessions: Nothing. No auth, cookie, session, or domain-redirect change. AC7 not engaged. No safety-critical surface modified. PR6 not engaged. (R20a perimeter is the `/api/mentor/private/reflect` endpoint per AC5 — NOT the `/api/mentor-profile` GET endpoint. Confirm the route file does not invoke `enforceDistressCheck` or `detectDistressTwoStage`; if it does not, PR6 remains not engaged.)
   * Rollback plan (per ADR §11 Session 3): revert the single commit. The transitional shim and the legacy loader at this caller are restored. ~5 minutes via GitHub Desktop's history view + revert. The migrated caller is on a profile-read request path; rollback is per-session.
   * Verification: pre-deploy TypeScript clean (`npx tsc --noEmit` in `/website`). Post-deploy: live-probe of `/api/mentor-profile` (GET). The session-close handoff has the exact snippet ready to paste — pre-test the snippet's expected response shape against the route handler's actual response before handing it to the founder.
7. After founder approval of the plan, build in this order:
   1. Edit `/website/src/app/api/mentor-profile/route.ts`. Switch the loader; resolve the fallback per Decision 3; update the `buildProfileSummary` call to drop the adapter wrap; translate the `meta` block field accesses; resolve `current_profile` if present per Decision 1b; update inline comments and docstring to mark this caller as fully migrated.
   2. `npx tsc --noEmit`. Confirm exit 0.
   3. If a client consumes the `meta` block (or `current_profile`) and Decision 1a (or 1b) = (a), update the client. `npx tsc --noEmit` again.
   4. Commit (single commit on `main`). The commit message names ADR-Ring-2-01 Session 3c, the migrated caller, the wire-contract decisions (1a = a/b/c, 1b = a/b/c if applicable), and the retirement of the last transitional shim.
   5. **Founder pushes the commit using GitHub Desktop:**
      1. Open GitHub Desktop.
      2. Top-left, confirm Current Repository = `sagereasoning`.
      3. Top-right, click Push origin (badge shows `1`).
      4. Wait for the spinner to finish.
   6. Wait for Vercel to deploy the new commit hash. Founder confirms `Ready` status before testing.
   7. Founder live-probe of the migrated caller. The DevTools Console snippet GETs `/api/mentor-profile` and checks the response shape. The snippet must include the wire-contract assertion appropriate to the resolved Decision 1a (and 1b if applicable). Note: this route is `requireAuth`-gated only (no founder-only check) — any signed-in account works for the live-probe.
8. Out of scope this session (queued for later sessions per ADR §7):
   * Migration of `practitioner-context.ts` and `mentor-context-private.ts` (Session 3d — lower stakes; no `buildProfileSummary` involvement).
   * Migration of `/api/founder/hub/route.ts` (Session 3e — large surface, may split).
   * `/api/mentor/private/reflect/route.ts` (Session 4 — Critical, R20a perimeter).
   * Journal pipeline write-side migration (Session 4 — Critical).
   * Retiring the legacy `loadMentorProfile()` or `MentorProfileData` (Session 5).
   * Persisted-row migration (Session 6 — optional).
   * Any sage-mentor runtime function rewrite.
9. Decision-log items pending founder approval at this session open (carried from prior sessions — five entries now):
   * D-RING-2-S3a — Promotes Session 3a to Verified in the decision log (founder confirmed verification by paste-snippet check on commit `7065234`). Carried from Session 3a close. Approve at session open.
   * D-PR8-PUSH — Promotes the sandbox-cannot-push limitation to a process rule (3rd recurrence per PR8 at Session 3a close; 4th observed at Session 3b close; 5th observed at Session 3 follow-up close). Approve at session open. Once adopted, future session-close handoffs continue to include the GitHub Desktop step format as standard.
   * D-RING-2-S3b — Promotes Session 3b to Verified in the decision log (founder confirmed verification by paste-snippet check on commit `ea505ec`). Carried from Session 3b close. Approve at session open.
   * D-LOCK-CLEANUP — Promotes the stale-lock cleanup discipline to a process rule (3rd recurrence per PR8 at Session 3b close; 4th observed at Session 3 follow-up close, where the discipline performed cleanly under its proposed text). Carried from Session 3b close. Approve at session open.
   * D-RING-2-S3-PRIVATE-FULL — Promotes Session 3 follow-up to Verified in the decision log (founder confirmed verification by paste-snippet check on commit `5cdbb52`, Vercel green + DevTools live-probe pass). Carried from Session 3 follow-up close. Approve at session open.
10. PR-rule discipline named at session open:
   * PR1 — single-endpoint proof. The migrated caller is the proof endpoint for this session. The remaining un-migrated routes (`/api/founder/hub`, the two context loaders) stay on the legacy loader directly.
   * PR2 — verification immediate. `tsc --noEmit` after each substantive edit; live-probe in same session as deploy.
   * PR3 — no async behaviour added. Route already async; the loader switch preserves that posture.
   * PR4 — model selection. No LLM in `buildProfileSummary`'s path. Confirm the GET endpoint does not invoke any LLM at all (it should be pure profile-fetch + summary-build); if it does, name the model and check against `constraints.ts`.
   * PR5 — re-explanations flagged in handoff. Cumulative count maintained in close note. Path-depth count for the relative-path import is a known re-explanation candidate (Session 3 follow-up corrected the prompt's stated count from 6 to 7 segments). For this session the route is at the same depth as Session 3b's public baseline, so the count should be 5 segments; verify empirically against the existing `mentor-profile-store.ts` import pattern or any existing dynamic import in the route file before writing code.
   * PR6 — safety-critical changes are Critical. This session is Elevated, not Critical. Confirm at session open: this route is `/api/mentor-profile` (the profile-fetch endpoint), NOT `/api/mentor/private/reflect` (which is in the AC5 R20a perimeter and is Session 4). The mentor-profile GET route does not invoke `enforceDistressCheck` or `detectDistressTwoStage` (verify by reading the route file at session open). If verification confirms, PR6 remains not engaged.
   * PR7 — deferred decisions logged. The remaining un-migrated routes continue to carry their disposition (legacy loader directly for the founder hub; legacy loader internal calls for the two context loaders) with named retirement conditions (Session 3d, Session 3e).
   * PR8 — push limitation and stale-lock cleanup are process rules (D-PR8-PUSH and D-LOCK-CLEANUP — both pending decision-log adoption at session open; both operationally in force). **Use GitHub Desktop for the push step in the Founder Verification section.** Do not attempt `git push` from the sandbox.
   * AC7 — Session 7b standing constraint. No auth/cookie/session/domain-redirect change. Confirm at session open and again at deploy.
11. Close-session obligations (per protocol Part C, elements 19–21):
   * Stabilise to a known-good state. If the live-probe surfaces a regression, founder may signal "I'm done for now" — do not propose additional fixes.
   * Produce a handoff note at `/operations/handoffs/tech/[date]-shape-adapter-session-3c-mentor-profile-get-close.md` in the required-minimum format plus extensions (Verification Method Used, Risk Classification Record, PR5, Founder Verification, Decision Log Entries — Proposed). Name that the **last transitional shim has retired** this session — after this session, every consumer that calls `buildProfileSummary` is on `loadMentorProfileCanonical()`.
   * The Founder Verification section must use **GitHub Desktop** for the push step — not a terminal command. Format:
      1. Open GitHub Desktop.
      2. Confirm Current Repository = `sagereasoning`.
      3. Click Push origin (badge shows `1`).
      4. Wait for the spinner.
   * Pre-test the DevTools snippet's expected response shape against the route handler before handing it to the founder. The snippet must use the correct HTTP method (GET), include `Content-Type: application/json` and a Supabase Bearer token. The wire-contract assertion lines must match the resolved Decisions 1a and 1b (presence with canonical keys for option (a); presence with legacy keys for option (b); absence for option (c)).
   * State plainly at close that this protocol was the governing frame and the work was governed by ADR-Ring-2-01 §7 Session 3.

Signal "OK" when the plan above is approved and the step-5 decisions are in (1a, 1b if applicable, 2, 3). I'll then build, verify, and close.
