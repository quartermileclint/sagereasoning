Governing frame: /adopted/session-opening-protocol.md

Session prompt — Shape adapter Session 3 follow-up (private-baseline full migration: `/api/mentor/private/baseline-response`, founder-only, Elevated risk)

This session continues the staged transition adopted under ADR-Ring-2-01 (`/compliance/ADR-Ring-2-01-shape-adapter.md`, Adopted 25 April 2026). It completes the Session 3a pair — Session 3a wrapped `/api/mentor/private/baseline-response/route.ts` in a transitional shim (proving the rewritten `buildProfileSummary` end-to-end on a real production request path); this session does the full loader switch on the same caller.

Sessions verified to date:

* Session 1 (canonical loader on `/api/mentor/ring/proof`, commit `b2f3882`).
* Session 2 (`MentorProfile` extended with seven website-only optional fields under C-α, commit `d2b3619`).
* Session 3a (`buildProfileSummary` rewritten to consume canonical `MentorProfile`; `/api/mentor/private/baseline-response` placed on a transitional shim; commit `7065234`).
* Session 3b (`/api/mentor-baseline-response` — public baseline — fully migrated to `loadMentorProfileCanonical()`; Session 3a shim retired at that caller; `current_profile` dropped from response body under Decision 1=c, audit-confirmed no consumer; commit `ea505ec`).

After Session 3b, two transitional shims remain in the codebase awaiting follow-up Session-3 work — `/api/mentor/private/baseline-response` (this session's target) and `/api/mentor-profile` (Session 3c). The founder hub (`/api/founder/hub`) is on legacy `loadMentorProfile()` directly and will migrate as Session 3e.

Goal: migrate `/api/mentor/private/baseline-response/route.ts` (the founder-only baseline endpoint) fully to `loadMentorProfileCanonical()`. Remove its transitional shim. This is the third consumer migration of Session 3 — same caller pattern as Session 3b, smaller blast radius (founder-only gate via `FOUNDER_USER_ID` rather than public `requireAuth`-only). Same wire-contract translation: the route currently returns `current_profile` in its response body; switching the loader changes that field's shape from `MentorProfileData` to `MentorProfile`, so the same Decision 1 (a/b/c) applies.

Adopted in prior sessions:

* Option C with `MentorProfile` canonical, C-α field placement (Session 2 verified).
* `loadMentorProfileCanonical()` is Live and used by `/api/mentor/ring/proof` (Session 1) and `/api/mentor-baseline-response` (Session 3b).
* The frequency-bucket helper `frequencyBucketFromCount` is the single source of truth (exported from the adapter file).
* `buildProfileSummary` consumes canonical `MentorProfile`. All five call sites compile against the canonical signature.
* Sage-mentor's zero-imports-from-website encapsulation must be preserved.
* Coordinates with ADR-R17-01 (retrieval cache, not yet implemented): no change to the cache surface this session.
* Founder uses GitHub Desktop to push commits — the sandbox cannot push (PR8 process rule, formally proposed at Session 3a close as D-PR8-PUSH; pending decision-log adoption but operationally in force across all four sessions to date). The session-close handoff names the GitHub Desktop steps explicitly under Founder Verification.
* Stale `.git/index.lock` cleanup discipline (proposed promotion D-LOCK-CLEANUP at Session 3b close — pending decision-log adoption): on encountering "Operation not permitted" warnings on `.git/index.lock` and/or `.git/objects/**/tmp_obj_*`, invoke `mcp__cowork__allow_cowork_file_delete` for the repo's `.git/` directory and `rm -f` the stale lock and tmp files before retrying.

Before starting, please:

1. Complete the session-opening protocol — read this handoff prompt first, then the canonical-source tier for code sessions (1, 2, 3, 8, 9). Specifically:
   1. Manifest — `/manifest.md`, full read.
   2. Project instructions — pinned in your system prompt.
   3. Most recent handoff in tech stream — `/operations/handoffs/tech/2026-04-25-shape-adapter-session-3b-public-baseline-close.md` (Session 3b close — public-baseline full migration, the Decision 1=c wire-contract drop reasoning at Decision 1, the proposed promotions D-RING-2-S3b and D-LOCK-CLEANUP). Also still relevant: `/operations/handoffs/tech/2026-04-25-shape-adapter-session-3-private-baseline-close.md` (Session 3a close — for context on how the shim landed at this caller).
   4. Technical state — `/summary-tech-guide.md` and `/summary-tech-guide-addendum-context-and-memory.md`. Sections relevant: any orchestration sections that touch the private baseline endpoint or its downstream sage-reason path.
   5. Verification framework — `/operations/verification-framework.md`. Read the "Code Change" verification method.
   * Plus scan `/operations/knowledge-gaps.md` for entries relevant to this session's scope. KG1 (Vercel rules) potentially relevant — the route is server-side; confirm no fire-and-forget added; preserve the existing async posture. KG2 (Haiku boundary) not relevant — no LLM in `buildProfileSummary`'s path; the route's downstream `runSageReason` invocation is unchanged. KG3 (hub-label consistency) potentially relevant — this route hardcodes `'private-mentor'` (or `PRIVATE_MENTOR_HUB` constant) and writes to `mentor_interactions`; confirm the hardcode and the writer/reader pairing are unchanged. KG6 (composition order) potentially relevant — confirm the `buildProfileSummary` output continues to land in the same prompt zone as before. KG7 (JSONB shape) not relevant unless the auto-save block writes JSONB this session — it shouldn't, since no auto-save logic changes.

2. Confirm P0 hold-point status (still active). This work is permissible inside the hold-point assessment set because it advances live-data integration of the baseline endpoints.

3. Read ADR-Ring-2-01 (`/compliance/ADR-Ring-2-01-shape-adapter.md`) for context — particularly §7 (Session 3 in the adopted plan), §11 (rollback plan, per-session), and §12 (Notes for Implementation Sessions — Session 3).

4. Read the source files involved:
   * `/website/src/app/api/mentor/private/baseline-response/route.ts` — primary edit target. Currently has a transitional shim at the `buildProfileSummary` call site (line ~127 area per Session 3a handoff) and imports `loadMentorProfile` (legacy) and `adaptMentorProfileDataToCanonical`. The shim retires this session. The loader switches. The field accesses change. The wire-contract decision applies.
   * `/website/src/lib/mentor-profile-store.ts` — both `loadMentorProfile()` (legacy, returns `MentorProfileData`) and `loadMentorProfileCanonical()` (canonical, returns `MentorProfile`). Reference for the loader switch.
   * `/website/src/lib/mentor-profile-summary.ts` — `MentorProfileData` (legacy type) and `buildProfileSummary` (now consumes `MentorProfile`). Reference for the field-access translation when reading the route's `currentProfile` after the loader switch.
   * `/sage-mentor/persona.ts` — `MentorProfile` type definition. Reference for the field accesses; do NOT edit.
   * `/website/src/app/api/mentor-baseline-response/route.ts` — Session 3b's already-migrated counterpart. Reference for the migration pattern (Decisions 1=c, 2 procedural, 3=a were the choices that landed cleanly; you may adopt the same posture at this caller for symmetry, or audit and decide independently).
   * Any frontend or server client that reads `current_profile` from the private baseline endpoint's response body. Run a grep before changing the loader so the wire-contract change is audited end-to-end. Session 3b's audit found zero `\.current_profile` matches anywhere in `/website/src` — the same is likely true for the private route, but re-run the grep to confirm.

5. Before writing any code, surface these decisions for the founder and wait for direction:
   * **Decision 1 — Wire-contract translation for `current_profile`.** Switching the loader changes the `current_profile` field's shape in the response body from `MentorProfileData` to `MentorProfile`. Same three options as Session 3b:
      * (a) Switch the loader and let `current_profile` become `MentorProfile`. Audit any client that reads it; update those clients alongside the route migration.
      * (b) Switch the loader for `buildProfileSummary` purposes but explicitly return `current_profile` in its legacy shape (preserves the wire contract; partial-migration but cleaner client surface).
      * (c) Switch the loader; do not return `current_profile` in the response body at all. Removes a redundancy.
      * Recommend running the same grep audit Session 3b did (`grep -rn 'current_profile' website/src` and `grep -rn '\.current_profile' website/src`) and applying the same logic: if no client reads the field, recommend (c) — same end-state Session 3b adopted, symmetric to the public route. If a client does read it, recommend (b).
   * **Decision 2 — Field-access translation inside the route.** After switching to `loadMentorProfileCanonical()`, `currentProfile` is `MentorProfile`. The shim collapses to `buildProfileSummary(currentProfile)`. Confirm at decision-walk that no other field access changes are needed (Session 3b's analogous walk found exactly two read-sites: the buildProfileSummary line and the response body). The private baseline route is more involved than the public one — it includes the auto-save block (`recordInteraction` to `mentor_interactions`) and possibly references additional fields on `currentProfile` for that purpose. Read carefully.
   * **Decision 3 — Static fallback (`mentorProfileFallback`) shape.** Same two options as Session 3b:
      * (a) Stays as `MentorProfileData` and adapts at the use site — `adaptMentorProfileDataToCanonical(mentorProfileFallback as MentorProfileData)`. Keeps the static JSON file unchanged (still in the legacy shape). Retires alongside `MentorProfileData` in Session 5.
      * (b) Becomes a `MentorProfile`-shaped JSON file. Cleanest end state, but adds a file-format change to this session.
      * Recommend (a) — symmetric with Session 3b. The static JSON file retires alongside `MentorProfileData` in Session 5.

6. Walk the change plan with risk classification before writing any code (Elevated, per ADR §7 Session 3):
   * Files to be edited:
      * Always: `/website/src/app/api/mentor/private/baseline-response/route.ts` — switch loader from `loadMentorProfile` to `loadMentorProfileCanonical`; add type-only import of `MentorProfile` from `'../../../../../../sage-mentor'` (this route is one level deeper than Session 3b's caller — confirm the path count: `/website/src/app/api/mentor/private/baseline-response/route.ts` is six levels from project root, so the relative path is six `..` segments); update the type annotation on `currentProfile`; update the fallback handling per Decision 3; update the `buildProfileSummary` call to drop the adapter wrap; resolve `current_profile` per Decision 1.
      * If Decision 1 = (a) and a client consumes `current_profile`: that client also migrates this session. (Session 3b's audit suggests zero such clients exist, but re-confirm.)
      * If Decision 1 = (c): the response body shrinks; no client edit needed but document the removal in the route's docstring and inline comments.
   * What could break:
      * Any client reading `current_profile.proximity_estimate.*`, `current_profile.virtue_profile.<key>`, etc. — those field paths change under canonical. Grep first.
      * The fallback path. If `mentorProfileFallback` is read but the adapter-wrap step is missed, TypeScript catches the type mismatch at compile time.
      * The auto-save block. If the route reads `currentProfile` fields beyond the buildProfileSummary call site (e.g., for `recordInteraction` or hub labelling), those field accesses also change under canonical. Read the route carefully and surface any additional field-access translations at Decision 2.
   * What happens to existing sessions: Nothing. No auth, cookie, session, or domain-redirect change. AC7 not engaged. No safety-critical surface modified. PR6 not engaged. (R20a perimeter is the `/api/mentor/private/reflect` endpoint per AC5 — NOT this baseline-response endpoint. Confirm the route file does not invoke `enforceDistressCheck` or `detectDistressTwoStage`; if it does not, PR6 remains not engaged.)
   * Rollback plan (per ADR §11 Session 3): revert the single commit. The transitional shim and the legacy loader at this caller are restored. ~5 minutes via GitHub Desktop's history view + revert; or via `git revert <hash> && git push origin main` if you prefer terminal. The migrated caller is on a founder-only request path; rollback is per-session.
   * Verification: pre-deploy TypeScript clean (`npx tsc --noEmit` in `/website`). Post-deploy: live-probe of `/api/mentor/private/baseline-response` (POST). The session-close handoff has the exact snippet ready to paste — pre-test the snippet's body shape against the route handler's expected body before handing it to the founder.

7. After founder approval of the plan, build in this order:
   1. Edit `/website/src/app/api/mentor/private/baseline-response/route.ts`. Switch the loader; resolve the fallback per Decision 3; update the `buildProfileSummary` call to drop the adapter wrap; resolve `current_profile` per Decision 1; update inline comments and docstring to mark this caller as the migrated caller.
   2. `npx tsc --noEmit`. Confirm exit 0.
   3. If a client consumes `current_profile` and Decision 1 = (a), update the client. `npx tsc --noEmit` again.
   4. Commit (single commit on `main`). The commit message names ADR-Ring-2-01 Session 3 follow-up (private-baseline full migration), the migrated caller, and the wire-contract decision (1 = a/b/c).
   5. Founder pushes the commit using GitHub Desktop:
      1. Open GitHub Desktop.
      2. Top-left, confirm Current Repository = `sagereasoning`.
      3. Top-right, click Push origin (badge shows `1`).
      4. Wait for the spinner to finish.
   6. Wait for Vercel to deploy the new commit hash. Founder confirms `Ready` status before testing.
   7. Founder live-probe of the migrated caller. The DevTools Console snippet posts to `/api/mentor/private/baseline-response` with a stub `responses` array and checks the response shape. The snippet must include the wire-contract assertion appropriate to the resolved Decision 1. Note: this route is founder-only, gated by `FOUNDER_USER_ID` — the founder must be signed in with the founder account.

8. Out of scope this session (queued for later sessions per ADR §7):
   * Migration of `/api/mentor-profile/route.ts` GET endpoint (Session 3c — has additional `meta` block translation work).
   * Migration of `/api/founder/hub/route.ts` (Session 3e — large surface, may split).
   * `practitioner-context.ts` and `mentor-context-private.ts` (Session 3d — lower stakes; no `buildProfileSummary` involvement; switch their internal `loadMentorProfile()` calls).
   * `/api/mentor/private/reflect/route.ts` (Session 4 — Critical, R20a perimeter).
   * Journal pipeline write-side migration (Session 4 — Critical).
   * Retiring the legacy `loadMentorProfile()` or `MentorProfileData` (Session 5).
   * Persisted-row migration (Session 6 — optional).
   * Any sage-mentor runtime function rewrite.

9. Decision-log items pending founder approval at this session open (carried from prior sessions):
   * **D-RING-2-S3a** — Promotes Session 3a to Verified in the decision log (founder confirmed verification by paste-snippet check on commit `7065234`). Carried from Session 3a close. Approve at session open.
   * **D-PR8-PUSH** — Promotes the sandbox-cannot-push limitation to a process rule (3rd recurrence per PR8 at Session 3a close; 4th observed at Session 3b close). Approve at session open. Once adopted, future session-close handoffs continue to include the GitHub Desktop step format as standard.
   * **D-RING-2-S3b** — Promotes Session 3b to Verified in the decision log (founder confirmed verification by paste-snippet check on commit `ea505ec`). Approve at session open.
   * **D-LOCK-CLEANUP** — Promotes the stale-lock cleanup discipline to a process rule (3rd recurrence per PR8 at Session 3b close). Approve at session open.

10. PR-rule discipline named at session open:
    * PR1 — single-endpoint proof. The migrated caller is the proof endpoint for this session. Other endpoints stay on the transitional shim or legacy loader.
    * PR2 — verification immediate. `tsc --noEmit` after each substantive edit; live-probe in same session as deploy.
    * PR3 — no async behaviour added. Route already async; the loader switch preserves that posture.
    * PR4 — model selection. No LLM in `buildProfileSummary`'s path. The route's downstream `runSageReason` invocation is unchanged.
    * PR5 — re-explanations flagged in handoff. Cumulative count maintained in close note.
    * PR6 — safety-critical changes are Critical. **This session is Elevated, not Critical.** Confirm at session open: this route is `/api/mentor/private/baseline-response` (the baseline endpoint), NOT `/api/mentor/private/reflect` (which is in the AC5 R20a perimeter and is Session 4). The baseline-response route does not invoke `enforceDistressCheck` or `detectDistressTwoStage` (verify by reading the route file at session open). If verification confirms, PR6 remains not engaged.
    * PR7 — deferred decisions logged. The remaining un-migrated routes continue to carry their shims with named retirement conditions.
    * PR8 — push limitation and stale-lock cleanup are process rules (D-PR8-PUSH and D-LOCK-CLEANUP — both pending decision-log adoption at session open; both operationally in force).
    * AC7 — Session 7b standing constraint. No auth/cookie/session/domain-redirect change. Confirm at session open and again at deploy.

11. Close-session obligations (per protocol Part C, elements 19–21):
    * Stabilise to a known-good state. If the live-probe surfaces a regression, founder may signal "I'm done for now" — do not propose additional fixes.
    * Produce a handoff note at `/operations/handoffs/tech/[date]-shape-adapter-session-3-private-baseline-full-migration-close.md` in the required-minimum format plus extensions (Verification Method Used, Risk Classification Record, PR5, Founder Verification, Decision Log Entries — Proposed). Name which shim was retired this session and which one remains (`/api/mentor-profile`).
    * The Founder Verification section must use GitHub Desktop for the push step — not a terminal command. Format:
      1. Open GitHub Desktop.
      2. Confirm Current Repository = `sagereasoning`.
      3. Click Push origin (badge shows `1`).
      4. Wait for the spinner.
    * Pre-test the DevTools snippet's body shape against the route handler before handing it to the founder. The snippet must use the correct HTTP method (POST), include `Content-Type: application/json` and a Supabase Bearer token, and a stub `responses: [{ question_id, question_text, answer }]` body. The wire-contract assertion line must match the resolved Decision 1 (presence with canonical keys for (a); presence with legacy keys for (b); absence for (c)).
    * State plainly at close that this protocol was the governing frame and the work was governed by ADR-Ring-2-01 §7 Session 3.

Signal "OK" when the plan above is approved and the three step-5 decisions are in (1, 2, 3). I'll then build, verify, and close.
