Governing frame: /adopted/session-opening-protocol.md

Session prompt — Shape adapter Session 3b (second consumer migration: `/api/mentor-baseline-response`, public baseline, Elevated risk)

This session continues the five-session transition adopted under ADR-Ring-2-01 (`/compliance/ADR-Ring-2-01-shape-adapter.md`, Adopted 25 April 2026). Sessions 1, 2, and 3a are Verified.

Sessions verified to date:
* Session 1 (canonical loader on `/api/mentor/ring/proof`, commit `b2f3882`).
* Session 2 (`MentorProfile` extended with seven website-only optional fields under C-α, commit `d2b3619`).
* Session 3a (`buildProfileSummary` rewritten to consume canonical `MentorProfile`; `/api/mentor/private/baseline-response` migrated as the PR1 single-endpoint proof, commit `7065234`).

After Session 3a, three transitional shims exist in the codebase awaiting follow-up Session-3 work — each of the three remaining route callers wraps `adaptMentorProfileDataToCanonical(...)` at its `buildProfileSummary` call site instead of switching its loader. The shims retire one at a time as each route fully migrates to `loadMentorProfileCanonical()`.

Goal: migrate `/api/mentor-baseline-response/route.ts` (the public-facing baseline endpoint) fully to `loadMentorProfileCanonical()`. Remove its transitional shim. This is the second consumer migration of Session 3 — same caller pattern as Session 3a but with a larger blast radius (public-facing rather than founder-only) and a wire-contract translation: the route currently returns `current_profile` in its response body, and switching the loader changes that field's shape from `MentorProfileData` to `MentorProfile`.

Adopted in prior sessions:

* Option C with `MentorProfile` canonical, C-α field placement (Session 2 verified).
* `loadMentorProfileCanonical()` is Live and used by `/api/mentor/ring/proof` and (transitively, via the rewritten `buildProfileSummary`) every other consumer.
* The frequency-bucket helper `frequencyBucketFromCount` is the single source of truth (exported from the adapter file). The legacy duplicated mapping at `mentor-profile-summary.ts:131` was retired in Session 3a.
* `buildProfileSummary` consumes canonical `MentorProfile`. All five call sites compile against the canonical signature.
* Sage-mentor's zero-imports-from-website encapsulation must be preserved.
* Coordinates with ADR-R17-01 (retrieval cache, not yet implemented): no change to the cache surface this session.
* Founder uses GitHub Desktop to push commits — the sandbox cannot push (PR8 process rule, formally promoted at Session 3a close). The session-close handoff names the GitHub Desktop steps explicitly under Founder Verification.

Before starting, please:

1. Complete the session-opening protocol — read this handoff prompt first, then the canonical-source tier for code sessions (1, 2, 3, 8, 9). Specifically:
   1. Manifest — `/manifest.md`, full read.
   2. Project instructions — pinned in your system prompt.
   3. Most recent handoff in tech stream — `/operations/handoffs/tech/2026-04-25-shape-adapter-session-3-private-baseline-close.md` (Session 3a close — first consumer migration, decision walk, the PR8 push promotion proposed for adoption this session, the wire-contract reasoning at Decision 2).
   4. Technical state — `/summary-tech-guide.md` and `/summary-tech-guide-addendum-context-and-memory.md`. Sections relevant: any orchestration sections that touch the public baseline endpoint or its downstream sage-reason path.
   5. Verification framework — `/operations/verification-framework.md`. Read the "Code Change" verification method.
   * Plus scan `/operations/knowledge-gaps.md` for entries relevant to this session's scope. KG1 (Vercel rules) potentially relevant — `/api/mentor-baseline-response` is a server-side route; confirm no fire-and-forget. KG2 (Haiku boundary) not relevant — `buildProfileSummary` itself has no LLM in path; the route's downstream `runSageReason` invocation is unchanged. KG3 (hub-label consistency) not relevant — no `mentor_interactions` writes here. KG6 (composition order) potentially relevant — confirm the rewritten `buildProfileSummary`'s output continues to land in the same prompt zone as before. KG7 (JSONB shape) not relevant.

2. Confirm P0 hold-point status (still active). This work is permissible inside the hold-point assessment set because it advances live-data integration of the baseline endpoints.

3. Read ADR-Ring-2-01 (`/compliance/ADR-Ring-2-01-shape-adapter.md`) for context — particularly §7 (Session 3 in the adopted plan), §11 (rollback plan, per-session), and §12 (Notes for Implementation Sessions — Session 3).

4. Read the source files involved:
   * `/website/src/app/api/mentor-baseline-response/route.ts` — primary edit target. Currently has a transitional shim at the `buildProfileSummary` call site (line 117 area) and imports `loadMentorProfile` (legacy) and `adaptMentorProfileDataToCanonical`. The shim retires this session. The loader switches. The field accesses change.
   * `/website/src/lib/mentor-profile-store.ts` — both `loadMentorProfile()` (legacy, returns `MentorProfileData`) and `loadMentorProfileCanonical()` (canonical, returns `MentorProfile`). Reference for the loader switch.
   * `/website/src/lib/mentor-profile-summary.ts` — `MentorProfileData` (legacy type) and `buildProfileSummary` (now consumes `MentorProfile`). Reference for the field-access translation when reading the route's `currentProfile` after the loader switch.
   * `/sage-mentor/persona.ts` — `MentorProfile` type definition. Reference for the field accesses; do NOT edit.
   * Any frontend client that reads `current_profile` from the public baseline endpoint's response body. Run a grep before changing the loader so the wire-contract change is audited end-to-end.

5. Before writing any code, surface these decisions for the founder and wait for direction:

   * **Decision 1 — Wire-contract translation for `current_profile`.** Switching the loader changes the `current_profile` field's shape in the response body from `MentorProfileData` to `MentorProfile`. Two options:
     * (a) Switch the loader and let `current_profile` become `MentorProfile`. Audit any frontend client that reads it; update those clients alongside the route migration.
     * (b) Switch the loader for `buildProfileSummary` purposes but explicitly return `current_profile` in its legacy shape (e.g., by also calling the legacy loader or by storing the persisted shape before adaptation). Preserves the wire contract; partial-migration but cleaner client surface.
     * (c) Switch the loader; do not return `current_profile` in the response body at all. Removes a redundancy (the client can fetch the profile separately if needed).
     * Recommend (a) if no frontend client consumes `current_profile`; recommend (b) or (c) if a client does. Run the grep first; surface the finding.

   * **Decision 2 — Field-access translation inside the route.** After switching to `loadMentorProfileCanonical()`, `currentProfile` is `MentorProfile`. The route currently passes `currentProfile` directly to `buildProfileSummary` via the shim — that simplifies to `buildProfileSummary(currentProfile)`. No other route logic reads `currentProfile` directly except in the response body (Decision 1). Confirm at decision-walk that no other field access changes are needed.

   * **Decision 3 — Static fallback (`mentorProfileFallback`) shape.** The route falls back to `mentorProfileFallback` (a `MentorProfileData` JSON cast) when no Supabase profile exists or encryption is not configured. After the loader switch, the fallback either:
     * (a) Stays as `MentorProfileData` and adapts at the use site — `adaptMentorProfileDataToCanonical(mentorProfileFallback as MentorProfileData)`. Keeps the static JSON file unchanged (still in the legacy shape).
     * (b) Becomes a `MentorProfile`-shaped JSON file. Cleanest end state, but adds a file-format change to this session.
     * Recommend (a). The static JSON file retires alongside `MentorProfileData` in Session 5.

6. Walk the change plan with risk classification before writing any code (Elevated, per ADR §7 Session 3):
   * Files to be edited:
     * Always: `/website/src/app/api/mentor-baseline-response/route.ts` — switch loader from `loadMentorProfile` to `loadMentorProfileCanonical`; remove the `adaptMentorProfileDataToCanonical` import (no longer needed at this call site if the fallback is also adapted at the use site per Decision 3 = a, OR keep the import if the fallback stays adapter-wrapped — confirm at decision-walk); update the `buildProfileSummary` call to pass `currentProfile` directly; resolve `current_profile` per Decision 1.
     * If Decision 1 = (a) and a frontend client consumes `current_profile`: that client also migrates this session.
     * If Decision 1 = (c): the response body shrinks; no client edit needed but document the removal.
   * What could break.
     * Any frontend client reading `current_profile.proximity_estimate.*`, `current_profile.virtue_profile.<key>`, `current_profile.causal_tendencies.primary_breakdown`, etc. — those field paths change under canonical. Grep for `current_profile` in `website/src/app` and `website/src/lib` first.
     * The fallback path. If `mentorProfileFallback` is read but the adapter-wrap step is missed, TypeScript catches the type mismatch at compile time.
   * What happens to existing sessions. Nothing. No auth, cookie, session, or domain-redirect change. AC7 not engaged. No safety-critical surface modified. PR6 not engaged.
   * Rollback plan (per ADR §11 Session 3): revert the single commit. The transitional shim and the legacy loader at this caller are restored. ~5 minutes. The migrated caller is on the production request path; rollback is per-session.
   * Verification: pre-deploy TypeScript clean (`npx tsc --noEmit` in `/website`). Post-deploy: live-probe of `/api/mentor-baseline-response` (POST). The session-close handoff has the exact snippet ready to paste — pre-test the snippet's body shape against the route handler's expected body before handing it to the founder.

7. After founder approval of the plan, build in this order:
   1. Edit `/website/src/app/api/mentor-baseline-response/route.ts`. Switch the loader; resolve the fallback per Decision 3; update the `buildProfileSummary` call to drop the adapter wrap (now redundant); resolve `current_profile` per Decision 1.
   2. `npx tsc --noEmit`. Confirm exit 0.
   3. If a frontend client consumes `current_profile` and Decision 1 = (a), update the client. `npx tsc --noEmit` again.
   4. Commit (single commit on `main`). The commit message names ADR-Ring-2-01 Session 3b, the migrated caller, and the wire-contract decision (1 = a/b/c).
   5. Founder pushes the commit using GitHub Desktop:
      1. Open **GitHub Desktop**.
      2. Top-left, confirm **Current Repository** = `sagereasoning`.
      3. Top-right, click **Push origin** (badge shows `1`).
      4. Wait for the spinner to finish.
   6. Wait for Vercel to deploy the new commit hash. Founder confirms `Ready` status before testing.
   7. Founder live-probe of the migrated caller. The DevTools Console snippet posts to `/api/mentor-baseline-response` with a stub `responses` array and checks the response shape. The snippet must include the wire-contract assertion appropriate to the resolved Decision 1.

8. Out of scope this session (queued for later sessions per ADR §7):
   * Migration of `/api/mentor-profile/route.ts` GET endpoint (becomes Session 3c — has additional `meta` block translation work).
   * Migration of `/api/founder/hub/route.ts` (Session 3e — large surface, may split).
   * `practitioner-context.ts` and `mentor-context-private.ts` (Session 3d — lower stakes; no `buildProfileSummary` involvement; switch their internal `loadMentorProfile()` calls).
   * `/api/mentor/private/reflect/route.ts` (Session 4 — Critical, R20a perimeter).
   * Journal pipeline write-side migration (Session 4 — Critical).
   * Retiring the legacy `loadMentorProfile()` or `MentorProfileData` (Session 5).
   * Persisted-row migration (Session 6 — optional).
   * Any sage-mentor runtime function rewrite.

9. Decision-log items pending founder approval at this session open (carried from Session 3a close):
   * **D-RING-2-S3a** — Promotes Session 3a to Verified in the decision log (founder confirmed verification by paste-snippet check on commit `7065234`). Approve at session open.
   * **D-PR8-PUSH** — Promotes the sandbox-cannot-push limitation to a process rule (3rd recurrence per PR8). Approve at session open. Once adopted, future session-close handoffs continue to include the GitHub Desktop step format as standard.

10. PR-rule discipline named at session open:
    * PR1 — single-endpoint proof. The migrated caller is the proof endpoint for this session. Other endpoints stay on the transitional shim.
    * PR2 — verification immediate. `tsc --noEmit` after each substantive edit; live-probe in same session as deploy.
    * PR3 — no async behaviour added. Route already async; the loader switch preserves that posture.
    * PR4 — model selection. No LLM in `buildProfileSummary`'s path. The route's downstream `runSageReason` is unchanged.
    * PR5 — re-explanations flagged in handoff. Cumulative count maintained in close note.
    * PR6 — safety-critical changes are Critical. This session is Elevated — production request path, encryption-adjacent via `loadMentorProfileCanonical`. No distress classifier, Zone 2/3, encryption pipeline, session, access control, deletion, or deployment-config changes. PR6 not engaged.
    * PR7 — deferred decisions logged. Each remaining un-migrated route caller continues to carry its shim with named retirement condition.
    * PR8 — push limitation is now a process rule (pending D-PR8-PUSH adoption at session open). Founder pushes via GitHub Desktop.
    * AC7 — Session 7b standing constraint. No auth/cookie/session/domain-redirect change. Confirm at session open and again at deploy.

11. Close-session obligations (per protocol Part C, elements 19–21):
    * Stabilise to a known-good state. If the live-probe surfaces a regression, founder may signal "I'm done for now" — do not propose additional fixes.
    * Produce a handoff note at `/operations/handoffs/tech/[date]-shape-adapter-session-3b-public-baseline-close.md` in the required-minimum format plus extensions (Verification Method Used, Risk Classification Record, PR5, Founder Verification, Decision Log Entries — Proposed). Name which shim was retired this session and which two remain.
    * The Founder Verification section must use **GitHub Desktop** for the push step — not a terminal command. Format:
      1. Open **GitHub Desktop**.
      2. Confirm **Current Repository** = `sagereasoning`.
      3. Click **Push origin** (badge shows `1`).
      4. Wait for the spinner.
    * Pre-test the DevTools snippet's body shape against the route handler before handing it to the founder. The snippet must use the correct HTTP method (POST) and include `Content-Type: application/json` and a stub `responses: [{ question_id, question_text, answer }]` body.
    * State plainly at close that this protocol was the governing frame and the work was governed by ADR-Ring-2-01 §7 Session 3.

Signal "OK" when the plan above is approved and the three step-5 decisions are in (1, 2, 3). I'll then build, verify, and close.
