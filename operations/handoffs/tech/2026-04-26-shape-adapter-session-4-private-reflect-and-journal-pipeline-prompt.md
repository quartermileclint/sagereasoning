Governing frame: /adopted/session-opening-protocol.md

Session prompt — Shape adapter Session 4: live private reflect endpoint + journal pipeline write-side migration (`/api/mentor/private/reflect/route.ts` + `saveMentorProfile()` and the journal-ingestion output stage; **Critical risk** per ADR §7 Session 4 — R20a perimeter (AC5), encryption pipeline, journal pipeline write-side; Critical Change Protocol (0c-ii) applies in full)

This session continues the staged transition adopted under ADR-Ring-2-01 (`/compliance/ADR-Ring-2-01-shape-adapter.md`, Adopted 25 April 2026). It executes the only remaining Critical-classified migration in the Session 3 series. After this session, every consumer in `/website/src` is on the canonical loader; only Session 5 (legacy retirement) remains before the migration is complete.

Sessions verified to date:

* Session 1 (canonical loader on `/api/mentor/ring/proof`, commit `b2f3882`).
* Session 2 (`MentorProfile` extended with seven website-only optional fields under C-α, commit `d2b3619`).
* Session 3a (`buildProfileSummary` rewritten to consume canonical `MentorProfile`; transitional shim landed at `/api/mentor/private/baseline-response`; commit `7065234`).
* Session 3b (`/api/mentor-baseline-response` — public baseline — fully migrated; Session 3a shim retired at that caller; commit `ea505ec`, founder-verified).
* Session 3 follow-up (`/api/mentor/private/baseline-response` — private baseline — fully migrated; commit `5cdbb52`, founder-verified).
* Session 3c (`/api/mentor-profile/route.ts` GET fully migrated; last transitional shim retired across the codebase; commit `34019e7`, founder-verified).
* Session 3d (`/website/src/lib/context/practitioner-context.ts` — all 3 read-side context-builders fully migrated; field-access translations applied per ADR §2.1/§2.2; commit `fbe12d5`, founder-verified via founder hub mentor flow).
* Session 3e (`/website/src/app/api/founder/hub/route.ts` — loader switched; transitional `ProfileForSignals` structural type introduced in `mentor-context-private.ts` because the live reflect route also calls `getRecentInteractionsAsSignals` and remains on legacy until this session; commit `95c40db`, founder-verified via founder hub mentor flow).

After Session 3e, the only un-migrated consumers in `/website/src` are: (a) `/api/mentor/private/reflect/route.ts` (this session — Critical, R20a perimeter, AC5); (b) `setFounderFacts` and `appendFounderFactsNote` in `mentor-context-private.ts` (this session — they round-trip through `saveMentorProfile()` which migrates this session); (c) the journal-ingestion output stage that writes the persisted profile (this session — first time the canonical shape is written at rest). The transitional `ProfileForSignals` type tightens to `MentorProfile | null` this session.

Goals for this session (Critical, R20a perimeter, encryption-pipeline-adjacent):

1. **Sub-goal 4a — Migrate `/website/src/app/api/mentor/private/reflect/route.ts`.** Switch the loader from `loadMentorProfile()` to `loadMentorProfileCanonical()`. The route's current `loadMentorProfile()` call (line 196) is the last legacy read-side call across `/website/src`. The result feeds `getRecentInteractionsAsSignals` (now accepting the transitional structural type post-Session-3e) and is not directly field-accessed inside the route handler — verify by reading the route at session open. Wire-contract decisions apply if the route returns profile-derived fields to the client; audit at session open.
2. **Sub-goal 4b — Migrate the write side.** `saveMentorProfile(userId, profile: MentorProfileData)` in `/website/src/lib/mentor-profile-store.ts` currently consumes `MentorProfileData` and serialises it to JSON for AES-256-GCM encryption at rest. Migrate to `saveMentorProfile(userId, profile: MentorProfile)`. The journal-ingestion output stage (which produces the profile shape that `saveMentorProfile` accepts) must be migrated in the same session — the writer and its only producer are coupled.
3. **Sub-goal 4c — Tighten `ProfileForSignals`.** The transitional structural type introduced in Session 3e (`/website/src/lib/context/mentor-context-private.ts`) retires this session. Replace it with `MentorProfile | null` on `getRecentInteractionsAsSignals` and `MentorProfile['passion_map']` on `rowToSignal`. The reflect route is the only legacy caller; once 4a lands, only canonical remains.
4. **Sub-goal 4d — Retire `setFounderFacts` and `appendFounderFactsNote`'s legacy pattern.** Both functions currently call `loadMentorProfile()` (legacy) + `saveMentorProfile()` (legacy `MentorProfileData`). After 4b, `saveMentorProfile()` accepts `MentorProfile`. Switch these two functions to `loadMentorProfileCanonical()` + canonical-shape spread + `saveMentorProfile(canonical)`.

Adopted in prior sessions (carried into this one):

* Option C with `MentorProfile` canonical, C-α field placement.
* `loadMentorProfileCanonical()` is Live and used by 6 callers (post-3e): ring proof, public baseline, private baseline, mentor-profile GET, practitioner-context (×3), founder hub.
* `frequencyBucketFromCount` is the single source of truth for the frequency bucket mapping.
* `buildProfileSummary` consumes canonical `MentorProfile`. No transitional shims remain across the codebase.
* `ProfileForSignals` (Session 3e introduction) retires this session.
* Sage-mentor's zero-imports-from-website encapsulation must be preserved.
* Coordinates with ADR-R17-01 (retrieval cache): `saveMentorProfile()`'s cache invalidation must apply equally to the migrated canonical write path. If the cache wraps `loadMentorProfileCanonical` and is invalidated by `saveMentorProfile`, the migration must not break the invalidation contract.
* Founder uses **GitHub Desktop** for both commits and pushes (PR8 process rule). The sandbox cannot reliably perform Git operations that require modifying the working tree's lock state when host-side has held those locks. **The agent does not run `git push` from the sandbox.** The agent attempts `git commit` from the sandbox; if a stale `.git/index.lock` blocks it, the agent first tries `mcp__cowork__allow_cowork_file_delete` for the repo's `.git/` directory, then `rm -f` the stale lock; if the cleanup tool returns "Could not find mount for path", the agent surfaces "This is a limitation" and asks the founder for host-side help (close GitHub Desktop briefly to release the lock, or run `rm -f "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/.git/index.lock"` from a Terminal). Founder Verification at close names the GitHub Desktop steps explicitly.

Before starting, please:

1. Complete the session-opening protocol — read this prompt first, then the canonical-source tier for code sessions (1, 2, 3, 8, 9). Specifically:
   1. Manifest — `/manifest.md`, full read.
   2. Project instructions — pinned in your system prompt.
   3. Most recent handoff in tech stream — `/operations/handoffs/tech/2026-04-26-shape-adapter-session-3d-3e-context-loaders-and-founder-hub-close.md` (Session 3d+3e close — names the eight pending decision-log entries, the transitional `ProfileForSignals` type and its retirement condition, the write-roundtrip pair retirement condition, the stale-lock cleanup discipline succeeding under its primary path for the first time at 6th recurrence). Also still relevant for context: Session 3c close, Session 3-follow-up close, Session 3b close, Session 3a close.
   4. Technical state — `/summary-tech-guide.md` and `/summary-tech-guide-addendum-context-and-memory.md`. Sections relevant: any orchestration sections that touch the live private reflect endpoint, the encryption pipeline, the journal-ingestion output stage, and `saveMentorProfile`. Pay attention to the four-layer context architecture (AC6) — the reflect route composes Layer 2b strings on the user-message side.
   5. Verification framework — `/operations/verification-framework.md`. Read the "Code Change", "API Endpoint", and "Authentication or Access Control Change" verification methods. The reflect route's signed-in-founder-only gate falls under access-control-adjacent — name its posture explicitly.
   * Plus scan `/operations/knowledge-gaps.md` for entries relevant to this session's scope:
      * KG1 (Vercel rules): highly relevant — `saveMentorProfile()` is a database write; under KG1 rule "await all DB writes" the writer must be awaited before the response is constructed. The route must not introduce fire-and-forget writes for the migrated save path. Also relevant: the journal-ingestion output stage may run as a long-running task; confirm its execution model against KG1.
      * KG2 (Haiku boundary): relevant — the reflect route invokes Sonnet for the mentor reflection; confirm model selection unchanged after migration.
      * KG3 (hub-label consistency): relevant — the reflect route hardcodes `'private-mentor'` as `PRIVATE_MENTOR_HUB` for `mentor_interactions` reads/writes. Trace the label at all reader/writer sites in the route before any changes; if any drift surfaces, halt and queue under KG3.
      * KG6 (composition order): relevant — the reflect route composes Layer 2b strings into the user message. Confirm `getProjectedPractitionerContext` / `getFullPractitionerContext` output continues to land in the user message after the migration, not in a system block.
      * KG7 (JSONB shape): relevant — the encrypted profile is stored as a serialised JSON string inside `mentor_profiles.encrypted_profile` (TEXT), not directly as JSONB. The encryption metadata `encryption_meta` IS JSONB. Confirm no double-stringify pattern creeps in during the canonical write path; verify `jsonb_typeof(encryption_meta)` post-deploy returns `'object'`, not `'string'`.
2. Confirm P0 hold-point status (still active). This work is permissible inside the hold-point assessment set because it advances live-data integration of the canonical type at the encryption-write boundary.
3. Read ADR-Ring-2-01 (`/compliance/ADR-Ring-2-01-shape-adapter.md`) for context — particularly §7 Session 4 (Critical Change Protocol in full; reflect route migrates first; live-probe with founder's account before continuing; journal pipeline write-side second), §11 Session 4 rollback (reflect first then journal pipeline second; the adapter handles un-migrated rows; new writes after revert go back to MentorProfileData), §12 Session 4 notes.
4. Read the source files involved:
   * `/website/src/app/api/mentor/private/reflect/route.ts` — primary edit target for sub-goal 4a. Read in full at session open. Enumerate every field access on the loaded profile variable (likely none directly — the result feeds `getRecentInteractionsAsSignals` only — but verify empirically). Audit the response body to determine whether profile-derived fields are returned to the client (Decision 4-1, wire contract).
   * `/website/src/lib/mentor-profile-store.ts` — primary edit target for sub-goal 4b. `saveMentorProfile()` accepts `MentorProfileData` and serialises via `JSON.stringify(profile)` for `encryptProfileData(plaintext)`. Migration path: change parameter type to `MentorProfile`; the queryable-metadata extraction (lines 222–228 in the prior version — `weakestVirtue` from `Object.entries(profile.virtue_profile)`) needs the same field-access translation as Session 3a's `buildProfileSummary` rewrite. The other queryable-metadata fields (`senecan_grade`, `proximity_level`) move from `profile.proximity_estimate?.{senecan_grade,level}` to flat canonical fields.
   * The journal-ingestion output stage that produces the profile shape passed to `saveMentorProfile`. Find the producer at session open via grep — likely in `/website/src/app/api/mentor-baseline-response/route.ts` or `/website/src/app/api/mentor/private/baseline-response/route.ts` or a journal-ingestion library file. Trace what shape it builds and what call path leads to `saveMentorProfile`. Migration path: produce canonical `MentorProfile` directly (rather than `MentorProfileData` + adapter at the boundary).
   * `/website/src/lib/context/mentor-context-private.ts` — secondary edit target for sub-goals 4c and 4d. Tighten `ProfileForSignals` to `MentorProfile | null`. Migrate `setFounderFacts` and `appendFounderFactsNote` to canonical loader + canonical save (now possible after 4b).
   * `/sage-mentor/persona.ts` — `MentorProfile` type definition. Reference for canonical field names; do NOT edit. Optional fields under C-α are still optional; the canonical writer can produce them or not based on whether journal-ingestion has captured them.
   * `/website/src/lib/mentor-profile-summary.ts` — `MentorProfileData` (legacy type) is still used by the static fallback JSON file (`/website/src/data/mentor-profile.json`) until Session 5. After this session, the live database write is canonical; legacy `MentorProfileData` is only the static fallback's shape.
   * `/website/src/lib/mentor-profile-adapter.ts` — read-time adapter (`adaptMentorProfileDataToCanonical`). After this session, new writes are canonical at rest, so future reads of newly-written rows skip the adapter. Old rows continue through the adapter (per ADR §6.5 — persisted-row migration is optional Session 6).
   * `r20a-invocation-guard.test.ts` — invocation test for the R20a perimeter (AC4, AC5). The reflect route's `enforceDistressCheck(detectDistressTwoStage(...))` pattern must remain intact post-migration. Verify by grep at session open and again after edits.
   * Any frontend or server client that reads the reflect endpoint's response body. Run a grep before changing the loader so the wire-contract risk is audited end-to-end. Likely candidate: `/website/src/app/private-mentor/page.tsx` or wherever the reflect submission UI lives.
5. Before writing any code, surface these decisions for the founder and wait for direction.
   * **Decision 4-1 — Wire-contract translation for the reflect route's response body.** The route returns the mentor's reflection output to the client. Three options per the ADR pattern:
      * (a) Switch the loader and let any profile-derived fields emit canonical names. Audit any client that reads the response body; update those clients alongside the migration.
      * (b) Switch the loader internally for `getRecentInteractionsAsSignals` purposes but explicitly translate response-body fields back to legacy names (preserves the wire contract; partial migration).
      * (c) Drop any specific response-body fields that have no current consumer.
      * Recommend running the grep audit (`grep -rn "/api/mentor/private/reflect" website/src`) and applying logic similar to Sessions 3b, 3-follow-up, 3c, and 3e.
   * **Decision 4-2 — Field-access translation in `saveMentorProfile`.** The queryable-metadata extraction (`weakestVirtue` via `Object.entries(profile.virtue_profile)`; `senecan_grade` / `proximity_level` from `profile.proximity_estimate?`) translates to canonical iteration / flat fields. Procedural confirmation; no founder choice required.
   * **Decision 4-3 — Persisted-row backward compatibility.** New writes are canonical; old rows are still legacy. Confirm the read-time adapter inside `loadMentorProfileCanonical()` continues to handle both shapes. Verify by inspecting the adapter at session open. ADR §6.5 / §11 / §12 Session 6 (optional) governs eventual row migration.
   * **Decision 4-4 — Journal-ingestion output stage migration.** Find the producer; migrate it to emit canonical `MentorProfile` directly. If multiple producers exist (possible — baseline endpoints, journal ingestion library, manual seed scripts), name each at decision-walk and decide which migrate this session and which defer.
   * **Decision 4-5 — `setFounderFacts` and `appendFounderFactsNote` migration.** After 4b, `saveMentorProfile()` accepts `MentorProfile`. These two functions can now switch to canonical loader + canonical spread + canonical save. Procedural confirmation.
   * **Decision 4-6 — `ProfileForSignals` retirement.** Replace with `MentorProfile | null` on `getRecentInteractionsAsSignals`; `MentorProfile['passion_map']` on `rowToSignal`. Drop the structural type definition. Procedural confirmation.
   * **Decision 4-7 — KG7 confirmation.** Before any write-side change, verify the encryption metadata column's posture: `SELECT jsonb_typeof(encryption_meta) FROM mentor_profiles ORDER BY created_at DESC LIMIT 1;` should return `'object'`. If `'string'`, KG7 regression — halt and fix the writer. Document the expected posture inline in `saveMentorProfile`.
6. **Critical Change Protocol (0c-ii) — execute in full before any commit.** This session is Critical risk. The 5 steps must appear visibly in the conversation:
   1. **What is changing — plain language.** What does this do from the founder's perspective? "We are switching the live private reflect endpoint and the database writer to consume the new canonical profile shape. After this lands, your private mentor reflections will continue to work, but the underlying data shape will be the canonical one. Future profile updates write the canonical shape directly to the encrypted database column."
   2. **What could break — specific worst case.** "If the writer mistranslates a field, the encrypted profile column gets corrupted on next save and the next read fails to decrypt or fails to parse, breaking your mentor profile load. Worst case: the founder cannot use the private mentor reflection feature until we revert and the next save restores the legacy shape."
   3. **What happens to existing sessions.** Auth/cookie/session/redirect are not touched — AC7 not engaged. No localStorage, no cookies, no session-state changes. Existing signed-in sessions continue to work normally. Any in-flight reflect request that started before deploy and lands after deploy is best-effort safe (the request's handler is route-version-pinned at request time).
   4. **Rollback plan — exact steps the founder can perform.** Per ADR §11 Session 4: revert the journal-pipeline write-side commit first (restores legacy writes); revert the reflect route commit second. Each is a `git revert <hash>` then push via GitHub Desktop. The read-time adapter inside `loadMentorProfileCanonical` continues to handle un-migrated rows on revert; new writes after revert go back to `MentorProfileData`. The `ProfileForSignals` retirement is part of the reflect commit so the revert restores the structural type.
   5. **Verification step — URL + expected result.** Founder signs in to the private mentor page and submits a reflect request. Expected: a normal mentor reflection response with no error and no 500. Plus a Supabase row spot-check confirming the new write decrypts and parses to canonical shape.
   6. **Explicit approval — the founder says "OK" or "go ahead" in response to the Critical Change Protocol output, with specific reference to the named risks.** Without this approval, no commit is pushed.
7. Walk the change plan with risk classification before writing any code:

   **Sub-goal 4a — Critical** (per ADR §7 Session 4 + AC5 R20a perimeter):
   * Files to be edited: `/website/src/app/api/mentor/private/reflect/route.ts`. If Decision 4-1 = (a) and a client consumes the response: that client also migrates this session.
   * What could break: the live private mentor reflection feature breaks if the loader switch surfaces a regression. The R20a invocation pattern (AC5) must remain intact — the route's existing `enforceDistressCheck(detectDistressTwoStage(...))` lines must be untouched by the migration. PR6 engaged.
   * What happens to existing sessions: nothing. No auth, cookie, session, or domain-redirect change. AC7 not engaged.
   * Rollback plan: revert the reflect route commit. Hub returns to legacy loader. The transitional `ProfileForSignals` resurrects (revert restores it because 4c is part of this commit).
   * Verification: pre-deploy `npx tsc --noEmit` clean. Pre-deploy `r20a-invocation-guard.test.ts` passes (AC4). Post-deploy: live-probe via the private mentor reflection page.

   **Sub-goal 4b — Critical** (per ADR §7 Session 4 + encryption-pipeline write side):
   * Files to be edited: `/website/src/lib/mentor-profile-store.ts` (`saveMentorProfile` parameter type and queryable-metadata extraction); the journal-ingestion output stage producer(s); any place that calls `saveMentorProfile` with `MentorProfileData` (currently 3 sites: POST `/api/mentor-profile`, `setFounderFacts`, `appendFounderFactsNote` — verify by grep).
   * What could break: a writer mistranslation corrupts the encrypted profile column on next save. Decryption succeeds (the encryption envelope is unchanged) but `JSON.parse(decryptedJson)` may yield an unexpected shape on read. The read-time adapter must continue to handle both shapes; verify post-edit.
   * What happens to existing sessions: nothing for read paths until the next save. The next save under the migrated writer produces canonical at rest. Old rows continue to read through the adapter.
   * Rollback plan: revert the writer commit. Next save reverts to `MentorProfileData`. Rows written under the canonical writer between deploy and revert continue to be read through the adapter (the adapter is one-way, so canonical-at-rest is read as canonical without translation; legacy is adapted).
      * **Edge case worth naming:** if a row was written canonical between deploy and revert, then read post-revert by the legacy `loadMentorProfile()`, the legacy loader's `JSON.parse` produces a canonical-shaped object cast as `MentorProfileData`. TypeScript doesn't catch this because the shapes are structurally similar but not identical. Behavioural impact: any consumer that reads `profile.proximity_estimate.level` from legacy gets `undefined`. Surface this risk in the Critical Change Protocol; consider whether the canonical writer should also write a legacy-compatible mirror during the transition window.
   * Verification: pre-deploy `npx tsc --noEmit` clean. Post-deploy: write a profile (via `setFounderFacts` or POST `/api/mentor-profile`) and read it back; confirm the read returns canonical and the encrypted column round-trips cleanly.

   **Sub-goal 4c — Standard** (transitional type retirement; type-level only):
   * Files to be edited: `/website/src/lib/context/mentor-context-private.ts`. Replace `ProfileForSignals` with canonical type on the function and helper signatures. Drop the structural type definition.
   * What could break: nothing — the only legacy caller (reflect route) migrates in 4a. After 4a, `tsc` confirms only canonical reaches the function.
   * Rollback plan: revert the cleanup commit. The structural type comes back. Both shapes accepted.

   **Sub-goal 4d — Elevated** (write-roundtrip migration; user-facing functions):
   * Files to be edited: `/website/src/lib/context/mentor-context-private.ts`. `setFounderFacts` and `appendFounderFactsNote` switch to `loadMentorProfileCanonical` + canonical spread + canonical `saveMentorProfile`.
   * What could break: founder facts updates fail to persist if the canonical spread misses a required field. TypeScript catches this at compile time because `MentorProfile` is strict.
   * Rollback plan: revert the cleanup commit. Both functions return to legacy loader/save.
   * Verification: pre-deploy `tsc --noEmit` clean. Post-deploy: trigger a founder-facts update (likely via a console snippet or admin UI) and confirm the row is updated.

8. After founder approval of the plan + Critical Change Protocol approval, build in this order:
   1. **Sub-goal 4a first.** Edit the reflect route. Switch the loader; resolve Decision 4-1 (may require client edits in the same commit); confirm the R20a invocation pattern unchanged. `npx tsc --noEmit`. Run `r20a-invocation-guard.test.ts` if it's runnable from the sandbox; otherwise verify by grep that the import + call pattern remain intact. Confirm exit 0. Commit on local `main`.
   2. **Founder commits and pushes via GitHub Desktop:**
      * If sandbox commit lands cleanly, founder pushes only:
         1. Open **GitHub Desktop**.
         2. Top-left, confirm **Current Repository** = `sagereasoning`.
         3. Top-right, click **Push origin** (badge shows `1`).
         4. Wait for the spinner to finish.
      * If sandbox commit is blocked by a stale `.git/index.lock` (cleanup tool failing, per the host-side fallback discipline):
         1. Founder clears the lock host-side: either close and reopen GitHub Desktop, or run `rm -f "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/.git/index.lock"` from a Terminal on the Mac.
         2. Open **GitHub Desktop**.
         3. Top-left, confirm **Current Repository** = `sagereasoning`.
         4. The pending changes appear in the left pane. Type a commit message (the agent provides one in the conversation).
         5. Click **Commit to main**.
         6. Click **Push origin**.
         7. Wait for the spinner to finish.
   3. Wait for Vercel to deploy the new commit hash. Founder confirms `Ready` status before testing.
   4. **Live-probe Sub-goal 4a.** Founder signs in to the private mentor page and submits a reflect request. Confirms a normal mentor reflection response with no error. Founder reports "verified" or describes any failure. **STOP HERE** if the live-probe surfaces a regression — stabilise to known-good and close. Do not proceed to 4b.
   5. **Sub-goal 4b second.** Edit `saveMentorProfile` (parameter type + queryable-metadata extraction); migrate the journal-ingestion output stage producer(s); update any other callers that pass `MentorProfileData` to `saveMentorProfile`. `npx tsc --noEmit`. Confirm exit 0. Commit on local `main`.
   6. **Founder commits and pushes via GitHub Desktop** (same steps as 2 above).
   7. Wait for Vercel to deploy. Founder confirms `Ready`.
   8. **Live-probe Sub-goal 4b.** Founder triggers a profile save (e.g., via POST `/api/mentor-profile` from the founder's profile-edit UI, or via the founder hub's `setFounderFacts` flow). Confirms the row writes canonical and reads back canonical. Founder reports "verified" or describes any failure. **STOP HERE** if the live-probe surfaces a regression.
   9. **Sub-goals 4c + 4d together.** Tighten `ProfileForSignals` to canonical; migrate `setFounderFacts` and `appendFounderFactsNote` to canonical. Single commit. `npx tsc --noEmit`. Confirm exit 0. Commit on local `main`.
   10. **Founder commits and pushes via GitHub Desktop**.
   11. Wait for Vercel to deploy. Founder confirms `Ready`.
   12. **Live-probe Sub-goals 4c + 4d.** Founder triggers a founder-facts update. Confirms it persists. Confirms the founder hub mentor flow still works (regression check on the type-level cleanup).

9. Out of scope this session (queued for later sessions per ADR §7):
   * Session 5 — legacy retirement. Removes `loadMentorProfile()` and `MentorProfileData`; renames `loadMentorProfileCanonical` → `loadMentorProfile`; removes `mentor-profile-summary.ts`'s legacy type definition; updates the static fallback JSON file. Risk: Elevated.
   * Session 6 — optional persisted-row migration. Decrypt → transform → re-encrypt every existing `mentor_profiles` row to canonical at rest. Risk: Critical. Founder choice; can defer indefinitely.
   * Any sage-mentor runtime function rewrite.
   * Any change to authentication, cookie scope, session validation, or domain-redirect behaviour (AC7 — Session 4 does not engage AC7; verify at session open and again at deploy).

10. Decision-log items pending founder approval at this session open (eight entries — six carried plus two from this session):
    * **D-RING-2-S3a** — Session 3a Verified. Carried from Session 3a close. Approve at session open.
    * **D-PR8-PUSH** — Promotes the sandbox-cannot-push limitation to a process rule. 7th recurrence at Session 3d/3e close. Revised text proposed at Session 3c close (widens scope to cover commit too). Approve revised text at session open.
    * **D-RING-2-S3b** — Session 3b Verified. Carried from Session 3b close. Approve at session open.
    * **D-LOCK-CLEANUP** — Promotes the stale-lock cleanup discipline to a process rule. 6th recurrence at Session 3d/3e close (1st under revised text; succeeded under primary path). Revised text proposed at Session 3c close. Approve revised text at session open — evidence now supports it.
    * **D-RING-2-S3-PRIVATE-FULL** — Session 3 follow-up Verified. Carried. Approve at session open.
    * **D-RING-2-S3C-MENTOR-PROFILE-GET** — Session 3c Verified. Carried. Approve at session open.
    * **D-RING-2-S3D-CONTEXT-LOADERS** — Session 3d Verified. Founder confirmed via founder hub mentor flow live-probe pass on commit `fbe12d5`. Approve at session open.
    * **D-RING-2-S3E-FOUNDER-HUB** — Session 3e Verified. Founder confirmed via founder hub mentor flow live-probe pass on commit `95c40db`. Approve at session open.

11. PR-rule discipline named at session open:

* **PR1** — single-endpoint proof. Three migrated callers in this session (reflect route in 4a; `saveMentorProfile` in 4b; `setFounderFacts`/`appendFounderFactsNote` in 4d; `ProfileForSignals` retirement in 4c). Each is its own PR1 proof. 4a's live-probe must pass before 4b proceeds.
* **PR2** — verification immediate. `tsc --noEmit` after each substantive edit; live-probe in same session as deploy. R20a invocation test confirms the safety pattern intact (AC4) before commit.
* **PR3** — safety systems are synchronous. The reflect route's distress classifier must remain synchronous. The `saveMentorProfile` call must remain awaited (KG1 rule "await all DB writes").
* **PR4** — model selection. The reflect route invokes Sonnet for the mentor reflection. Confirm at decision-walk that the migration changes neither the model nor the model-selection criteria. AC1 unchanged.
* **PR5** — re-explanations flagged in handoff. Cumulative count maintained in close note. Path-depth counts for relative-path imports are PR5 candidates if any new sage-mentor type imports are added.
* **PR6** — safety-critical changes are Critical. **Engaged this session.** The reflect route is in the AC5 R20a perimeter. The full Critical Change Protocol (0c-ii, named in step 6 above) applies. Sub-goal 4a is Critical regardless of apparent scope.
* **PR7** — deferred decisions logged. The transitional `ProfileForSignals` retirement condition was named in Session 3e close as Session 4; this session executes the retirement. The write-roundtrip pair retirement condition was named as Session 4; this session executes it. No new PR7 deferrals expected; if any surface, log them.
* **PR8** — push limitation and stale-lock cleanup are process rules (pending formal adoption). Use GitHub Desktop for both commit (when sandbox commit is blocked) and push. Do not attempt `git push` from the sandbox.
* **AC4** — invocation testing for safety functions. Confirm `r20a-invocation-guard.test.ts` passes after the reflect-route migration. The route must continue to import `enforceDistressCheck` and `detectDistressTwoStage` and call them in the pattern `await enforceDistressCheck(detectDistressTwoStage(...))`.
* **AC5** — R20a enforcement perimeter. The reflect route is one of the 8 perimeter routes. The migration must NOT remove the wrapper. Verify by grep at session open and again after edits.
* **AC7** — Session 7b standing constraint. No auth/cookie/session/domain-redirect change expected. Confirm at session open and again at deploy.

12. Close-session obligations (per protocol Part C, elements 19–21):

* Stabilise to a known-good state. If any live-probe surfaces a regression, founder may signal "I'm done for now" — do not propose additional fixes.
* Produce a handoff note at `/operations/handoffs/tech/[date]-shape-adapter-session-4-private-reflect-and-journal-pipeline-close.md` (or split if 4a closes early at "I'm done for now") in the required-minimum format plus extensions (Verification Method Used, Risk Classification Record, PR5, Founder Verification, Decision Log Entries — Proposed). Name that this session migrated the last Critical-classified consumer in the Session 3 series — after this session, only Session 5 (legacy retirement) and optional Session 6 (row migration) remain.
* The Founder Verification section must use **GitHub Desktop** for the push step (and for the commit step if sandbox commit was blocked) — not a terminal command. Format:
   1. Open GitHub Desktop.
   2. Confirm Current Repository = `sagereasoning`.
   3. (If commit was made in sandbox) Click Push origin (badge shows count of new commits). (If commit must be made via GitHub Desktop) Type the commit message provided by the agent in the bottom-left, click Commit to main, then click Push origin.
   4. Wait for the spinner.
* Pre-test the live-probe snippets' expected response shapes against the route handlers before handing them to the founder. The reflect route's snippet must use the correct HTTP method, include `Content-Type: application/json` and a Supabase Bearer token, and exercise the AC5 R20a perimeter wrapper (the response should include the distress-classifier signal so the founder can confirm it ran).
* State plainly at close that this protocol was the governing frame and the work was governed by ADR-Ring-2-01 §7 Session 4.

Signal "OK" when the plan above is approved and the step-5 decisions (4-1 through 4-7) are in. Then I'll execute the Critical Change Protocol (step 6) for explicit approval before any commit. Once approved, I build, verify, and close per step 8's order.
