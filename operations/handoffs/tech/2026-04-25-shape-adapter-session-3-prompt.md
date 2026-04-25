Governing frame: /adopted/session-opening-protocol.md
Session prompt — Shape adapter Session 3 (first consumer migration: `buildProfileSummary`, Elevated risk)

This session implements the first consumer migration of the five-session transition adopted under ADR-Ring-2-01 (`/compliance/ADR-Ring-2-01-shape-adapter.md`, Adopted 25 April 2026). The ADR is the authority for what gets built; this prompt is the day's brief.

Sessions 1 and 2 are Verified (live-probe of `/api/mentor/ring/proof` confirmed `profile_source: 'live_canonical'`, six pass criteria met after each session). The canonical `MentorProfile` (in `/sage-mentor/persona.ts`) now carries every field the persisted `MentorProfileData` carries (16 required + 7 optional), and the read-time adapter (`/website/src/lib/mentor-profile-adapter.ts`) populates them all on every read.

Goal: Rewrite `buildProfileSummary` (in `/website/src/lib/mentor-profile-summary.ts`) to consume the canonical `MentorProfile` instead of the legacy `MentorProfileData`. This is the simplest-first consumer per ADR §12 Session 3 — the function is a pure text-summary builder, not a route handler, so its rewrite tests the canonical type's expressive completeness without touching the production request path. Migrate exactly one caller of `buildProfileSummary` in the same session (the PR1 single-endpoint proof). Other callers continue to consume the legacy path until follow-up sessions migrate them.

Adopted under ADR-Ring-2-01:

* Option C with `MentorProfile` canonical, C-α field placement (Session 2 verified C-α held — no fallback to C-β was needed).
* `loadMentorProfileCanonical()` is Live and used by `/api/mentor/ring/proof`. Other callers still use `loadMentorProfile()` (legacy) — they retire one at a time across Session 3's consumer migrations.
* The frequency-bucket helper `frequencyBucketFromCount` is the single source of truth (exported from the adapter file). The legacy duplicated mapping at `mentor-profile-summary.ts:139` is a candidate for consolidation in this session (see decision 3 below).
* Sage-mentor's zero-imports-from-website encapsulation must be preserved. This session does not add any sage-mentor → website imports.
* Coordinates with ADR-R17-01 (retrieval cache, not yet implemented): no change to the cache surface this session.
* Founder uses **GitHub Desktop** to push commits — sandbox cannot push (KG1 rule 3 + missing credentials). The session-close handoff names the GitHub Desktop steps explicitly under Founder Verification.

Before starting, please:

1. Complete the session-opening protocol — read this handoff prompt first, then the canonical-source tier for code sessions (1, 2, 3, 8, 9). Specifically:
   * 1. Manifest — `/manifest.md`, full read.
   * 2. Project instructions — pinned in your system prompt.
   * 3. Most recent handoff in tech stream — `/operations/handoffs/tech/2026-04-25-shape-adapter-session-2-close.md` (Session 2 close — type extension and adapter pass-through).
   * 4. Technical state — `/summary-tech-guide.md` and `/summary-tech-guide-addendum-context-and-memory.md`. Sections relevant: any orchestration sections that touch the practitioner context or the baseline endpoints.
   * 5. Verification framework — `/operations/verification-framework.md`. Read the "Code Change" verification method.
   * Plus scan `/operations/knowledge-gaps.md` for entries relevant to this session's scope. KG1 (Vercel rules) potentially relevant — `buildProfileSummary` is called from server-side route handlers; confirm no fire-and-forget. KG2 (Haiku boundary) not relevant — `buildProfileSummary` itself has no LLM in path. KG3 (hub-label consistency) not relevant — no `mentor_interactions` writes. KG6 (composition order) potentially relevant — confirm `buildProfileSummary`'s output continues to land in the same prompt zone as before. KG7 (JSONB shape) not relevant — no JSONB read/write.

2. Confirm P0 hold-point status (still active per the prior tech-stream handoffs). This work is permissible inside the hold-point assessment set because it advances live-data integration of the ring proof and the baseline endpoints.

3. Read ADR-Ring-2-01 (`/compliance/ADR-Ring-2-01-shape-adapter.md`) in full — it's the authority for the design. Pay particular attention to §2 (side-by-side type comparison — the field-access translation table for the rewrite), §6.1 (C-α held in Session 2; the canonical type is what it appears to be), §7 ("Adopted plan" — Session 3 in the bullet list), §10 (founder verification methods), §11 (rollback plan, per-session — Session 3 per consumer), §12 (Notes for implementation sessions — Session 3).

4. Read the source files involved:
   * `/website/src/lib/mentor-profile-summary.ts` — primary edit target. Contains `buildProfileSummary(profile: MentorProfileData): string` (lines 96–191) and the duplicated frequency-bucket mapping (line 139).
   * `/sage-mentor/persona.ts` — `MentorProfile` type definition. Reference for the rewrite's field accesses; do NOT edit.
   * `/website/src/lib/mentor-profile-adapter.ts` — `frequencyBucketFromCount` export. Reference for the consolidation in decision 3.
   * `/website/src/lib/mentor-profile-store.ts` — both `loadMentorProfile()` (legacy, returns `MentorProfileData`) and `loadMentorProfileCanonical()` (canonical, returns `MentorProfile`). Reference for the caller-migration in decision 1.
   * Every caller of `buildProfileSummary`. Run a grep to enumerate them — they are at least `/api/mentor-baseline-response/route.ts` and `/api/mentor/private/baseline-response/route.ts`. The PR1 caller-migration is one of these (decision 1 below).

5. Before writing any code, surface these decisions for the founder and wait for direction:

   * Decision 1 — Which caller migrates as the PR1 single-endpoint proof? `buildProfileSummary` is consumed by multiple routes. PR1 says each is its own single-endpoint proof. The function's signature changes (input type goes from `MentorProfileData` to `MentorProfile`), so every caller has to either convert at the call site or switch its loader. Three options:
      * (a) Migrate `/api/mentor-baseline-response/route.ts` (the public-facing baseline endpoint, founder-test on a real journal-baseline request). Largest user-visible verification. Highest stakes.
      * (b) Migrate `/api/mentor/private/baseline-response/route.ts` (the private-mentor variant). Founder-only path; smaller blast radius. Recommended as the simplest-first proof.
      * (c) Migrate every caller in one session. Largest scope; strictly violates PR1's per-consumer discipline. Not recommended.
      * Recommend (b). Each remaining caller becomes its own follow-up session in Session 3's series.

   * Decision 2 — Loader pattern at the migrated caller. The PR1 caller currently does `const { profile, summary } = await loadMentorProfile(userId)` (returns `MentorProfileData`). Two options for the migrated form:
      * (a) Switch to `loadMentorProfileCanonical(userId)` (returns `MentorProfile`). The caller now has the canonical shape and passes it directly to the rewritten `buildProfileSummary`. Cleanest end state — matches Session 1's pattern from the proof endpoint.
      * (b) Keep `loadMentorProfile()` and adapt at the call site via `adaptMentorProfileDataToCanonical(...)`. Transitional — adds an adapter call in the caller that gets removed in a future session when the caller fully migrates. Not recommended unless `loadMentorProfileCanonical` proves problematic for this caller.
      * Recommend (a). Symmetric with Session 1; no transitional code.

   * Decision 3 — `frequencyBucketFromCount` consolidation in this session. O-C from Session 1's close noted that `mentor-profile-summary.ts:139` carries a duplicated copy of the frequency-bucket mapping. The rewrite naturally retires the inline mapping (the canonical `passion_map[]` already carries the bucket — no number-to-bucket conversion needed in the rewritten function). Two options:
      * (a) Retire the inline mapping cleanly. The rewrite no longer needs it; delete it.
      * (b) Retire and add `import { frequencyBucketFromCount } from './mentor-profile-adapter'` for any future reader of the legacy `MentorProfileData` shape that might still need the conversion. Defensive but adds an import that may not be used.
      * Recommend (a). The legacy `MentorProfileData` is being retired in Session 5; an import that has no other reader serves nobody.

6. Walk the change plan with risk classification before writing any code (Elevated, per ADR §7 Session 3):
   * Files to be edited (depending on decisions):
      * Always: `/website/src/lib/mentor-profile-summary.ts` (rewrite `buildProfileSummary` to take `MentorProfile`; retire duplicated frequency mapping per decision 3).
      * If decision 1 = (b): `/website/src/app/api/mentor/private/baseline-response/route.ts` (switch loader per decision 2; update field accesses in the call to `buildProfileSummary`).
      * Test: extend `/website/src/lib/__tests__/mentor-profile-adapter.test.ts` is NOT in scope. Add a new test alongside `buildProfileSummary` (e.g., `mentor-profile-summary.test.ts`) IF decision 4 (test scope) lands as "yes". Decision 4 surfaced inline below.
   * Decision 4 — Add a structural test for `buildProfileSummary`? The function rewrites to take a different input type. Two options:
      * (a) Add a new test file `/website/src/lib/__tests__/mentor-profile-summary.test.ts` with assertions about the output text containing the expected sections (identity, founder facts if present, proximity, passions, virtue, causal, value, oikeiosis, indifferents). ~50 lines.
      * (b) Skip — TypeScript catches the signature change; the live-probe of the migrated caller exercises the function end-to-end.
      * Recommend (a). Drift-risk mitigation per ADR §8.4. Cheap insurance against future amendments breaking the summary's structure.
   * What could break.
      * The rewrite's field-access translation table (ADR §2) is the area most at risk for typos. Every `MentorProfileData` field access changes form. TypeScript catches mismatched types at compile time — but a translation that returns the wrong field of the right type would compile and run, surfacing only at the live-probe.
      * If decision 1 = (b), the migrated caller switches loaders. `loadMentorProfileCanonical` was Verified in Session 1; same Supabase fetch + decrypt path as legacy. No regression expected.
      * Other callers of `buildProfileSummary` continue to use the OLD signature. Until they migrate (follow-up Session 3 work), they will fail to compile because the signature has changed. They MUST be updated in this session — either by switching to `loadMentorProfileCanonical` (recommended) or by inserting a one-line `adaptMentorProfileDataToCanonical(...)` call at the call site as a transitional shim. The session must not leave the build broken. Confirm at decision-walk that the AI has enumerated every caller and named what each becomes.
   * What happens to existing sessions. Nothing. No auth, cookie, session, or domain-redirect change. AC7 not engaged. No safety-critical surface modified. PR6 not engaged.
   * Rollback plan (per ADR §11 Session 3): revert the single commit. The legacy `loadMentorProfile()` and the previous `buildProfileSummary` signature are restored. ~5 minutes. The function is Standard surface (text builder); the migrated caller is Elevated (production request path) but the legacy path remains intact for it.
   * Verification: pre-deploy TypeScript clean (`npx tsc --noEmit` in `/website`). If decision 4 = (a), the new test file compiles and includes structural-completeness assertions. Post-deploy: live-probe of the migrated caller (decision 1 picks the route). Founder Verification section below has the exact DevTools snippet for whichever route is chosen.

7. After founder approval of the plan, build in this order:
   1. Rewrite `buildProfileSummary` in `/website/src/lib/mentor-profile-summary.ts`. Change the signature to `(profile: MentorProfile)`. Apply the field-access translation per ADR §2.1 / §2.2 — the new optional fields (`founder_facts`, `journal_name`, `journal_period`, etc.) are already on the canonical type from Session 2. Retire the duplicated frequency mapping per decision 3.
   2. `npx tsc --noEmit` after the rewrite. Confirm only the migrated caller from decision 1 fails to compile (because its old signature no longer matches). Other callers either ALREADY pass `MentorProfile` (none today — all pass `MentorProfileData`) or fail loudly. Surface the failure list to the founder.
   3. Migrate the caller chosen in decision 1. Switch its loader per decision 2. Confirm the call site passes the canonical profile to `buildProfileSummary`.
   4. Update any other caller as a transitional shim (insert `adaptMentorProfileDataToCanonical(profileData)` at each call site) so the build is not broken. These shims retire in their own follow-up Session 3 sessions when those callers fully migrate.
   5. `npx tsc --noEmit` again. Exit 0 required.
   6. If decision 4 = (a), create the test file and run `npx tsc --noEmit` once more to confirm the test compiles.
   7. Commit (single commit on `main`). The commit message names ADR-Ring-2-01 Session 3, the migrated caller, and the C-α posture (canonical type is unchanged this session — Session 2 did the type extension; Session 3 begins consumer migration).
   8. Founder pushes the commit using **GitHub Desktop**: open GitHub Desktop, confirm Current Repository is `sagereasoning`, click `Push origin` (badge shows `1`), wait for the spinner to finish.
   9. Wait for Vercel to deploy the new commit hash. Founder confirms `Ready` status before testing.
   10. Founder live-probe of the migrated caller. The DevTools Console snippet must POST to the endpoint with the correct body shape and check that the response is unchanged from before the migration. The session-close handoff has the exact snippet ready to paste.

8. Out of scope this session (queued for later sessions per ADR §7):
   * Migration of any other caller beyond the one chosen in decision 1 (each becomes its own follow-up Session 3 session).
   * `/api/mentor/private/reflect/route.ts` (Session 4 — Critical, R20a perimeter).
   * Journal pipeline write-side migration (Session 4 — Critical).
   * Retiring the legacy `loadMentorProfile()` or `MentorProfileData` (Session 5).
   * Persisted-row migration (Session 6 — optional).
   * Any sage-mentor runtime function rewrite (sage-mentor's reasoning code is unchanged; type definition was extended in Session 2; Session 3 only touches website consumers).
   * Any change to the encryption pipeline, the cache (still not yet implemented; ADR-R17-01 is a separate session), the distress classifier, or the R20a perimeter.

9. PR-rule discipline named at session open:
   * PR1 — single-endpoint proof. The migrated caller is the proof endpoint for this session. Other endpoints stay on the legacy path.
   * PR2 — verification immediate. `tsc --noEmit` after each substantive edit; live-probe in same session as deploy.
   * PR3 — no async behaviour added. `buildProfileSummary` stays pure synchronous.
   * PR4 — model selection. No LLM in path for the rewrite. The routes that call `buildProfileSummary` involve LLMs downstream, but the LLM path is unchanged by this session.
   * PR5 — re-explanations flagged in handoff. Cumulative count maintained in close note.
   * PR6 — safety-critical changes are Critical. This session is Elevated — the migrated caller is on the production request path and crosses the encryption-adjacent loader boundary. No distress classifier, Zone 2/3, encryption pipeline, session, access control, deletion, or deployment-config changes. PR6 not engaged.
   * PR7 — deferred decisions logged. Any caller left on a transitional shim is logged with the condition for retiring the shim.
   * AC7 — Session 7b standing constraint. No auth/cookie/session/domain-redirect change. Confirm at session open and again at deploy.

10. Close-session obligations (per protocol Part C, elements 19–21):
   * Stabilise to a known-good state. If the live-probe surfaces a regression, founder may signal "I'm done for now" — do not propose additional fixes.
   * Produce a handoff note at `/operations/handoffs/tech/[date]-shape-adapter-session-3-[caller]-close.md` (e.g., `…-session-3-private-baseline-close.md` if decision 1 = (b)) in the required-minimum format plus extensions (Verification Method Used, Risk Classification Record, PR5, Founder Verification, Decision Log Entries — Proposed). The handoff names which caller migrated, what shims (if any) are now in the codebase awaiting retirement in follow-up sessions, and whether decision 3 (frequency consolidation) and decision 4 (structural test) landed.
   * The Founder Verification section must use **GitHub Desktop** for the push step — not a terminal command. Format:
     1. Open GitHub Desktop.
     2. Confirm Current Repository is `sagereasoning`.
     3. Click `Push origin` (badge shows `1`).
     4. Wait for spinner.
     The DevTools snippet for the live-probe must use the correct HTTP method (most baseline endpoints are POST) and include the correct request body. Pre-test the snippet's shape against the route handler's expected body before handing it to the founder.
   * State plainly at close that this protocol was the governing frame and the work was governed by ADR-Ring-2-01.

Signal "OK" when the plan above is approved and the four step-5 / step-6 decisions are in (1, 2, 3, 4). I'll then build, verify, and close.
