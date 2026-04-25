Governing frame: /adopted/session-opening-protocol.md

Session prompt — Shape adapter Session 5: legacy retirement (`loadMentorProfile()` and `MentorProfileData` removed; `loadMentorProfileCanonical` renamed to `loadMentorProfile`; static fallback reconciled; **Elevated risk** per ADR §7 Session 5).

This session completes the staged transition adopted under ADR-Ring-2-01 (`/compliance/ADR-Ring-2-01-shape-adapter.md`, Adopted 25 April 2026). It removes the legacy types and the legacy loader that became dead code at the close of Session 4. After this session, the codebase has a single canonical profile shape (`MentorProfile`) and a single canonical loader (`loadMentorProfile`, post-rename). Optional Session 6 (persisted-row migration) becomes founder-choice.

Sessions verified to date:

* Session 1 (canonical loader on `/api/mentor/ring/proof`, commit `b2f3882`).
* Session 2 (`MentorProfile` extended with seven website-only optional fields under C-α, commit `d2b3619`).
* Session 3a (`buildProfileSummary` rewritten to consume canonical `MentorProfile`, commit `7065234`).
* Session 3b (`/api/mentor-baseline-response` migrated, commit `ea505ec`).
* Session 3 follow-up (`/api/mentor/private/baseline-response` migrated, commit `5cdbb52`).
* Session 3c (`/api/mentor-profile/route.ts` GET migrated; last transitional shim retired, commit `34019e7`).
* Session 3d (`practitioner-context.ts` migrated at all 3 read-side context-builders, commit `fbe12d5`).
* Session 3e (`/api/founder/hub` migrated; `ProfileForSignals` transitional type introduced, commit `95c40db`).
* Session 4a (`/api/mentor/private/reflect` migrated — last R20a-perimeter read-side caller; Critical, commit `cc4d569`).
* Session 4b (`saveMentorProfile()` parameter type migrated to canonical; `loadMentorProfileCanonical` shape-dispatch added; POST `/api/mentor-profile` body type migrated; `setFounderFacts`/`appendFounderFactsNote` migrated to canonical loader+spread+save; Critical, commit `0a9505e`).
* Session 4c (`ProfileForSignals` retired — type tightened to `MentorProfile | null`; Standard, commit `b5413fc`).

After Session 4: every consumer in `/website/src/` is on the canonical loader. `loadMentorProfile()` is dead code (no live callers). `MentorProfileData` is still imported by 3 files for residual definitional / type-cast purposes:
- `mentor-profile-summary.ts` (defines the type).
- `mentor-profile-store.ts` (legacy loader cast + summary type — both retire this session).
- `mentor-profile-adapter.ts` (input type for the read-time adapter — adapter retains the legacy input type because old rows are still legacy at rest).
- `/api/mentor-profile/route.ts` (cast on the static fallback JSON — see Decision 5-3 below).

The persisted shape at rest is mixed: post-4b writes are canonical, pre-4b rows are legacy. The shape-dispatch in `loadMentorProfileCanonical` (post-Session-5 renamed to `loadMentorProfile`) handles both indefinitely. The optional Session 6 migrates pre-4b rows; until then, the legacy_adapt dispatch path remains in service.

Goals for this session (Elevated, cleanup):

1. **Sub-goal 5a — Remove `loadMentorProfile()` (legacy)** from `/website/src/lib/mentor-profile-store.ts`. The function is dead code (no live callers in `/website/src/` — verified by `grep "loadMentorProfile[^C]" website/src` at session open). Verify by grep before and after the deletion that no live caller exists. The function definition + its docstring + its imports of `MentorProfileData`, `buildProfileSummary`, and `adaptMentorProfileDataToCanonical` (where they exist solely for the legacy loader) are removed. The `adaptMentorProfileDataToCanonical` import remains because the canonical loader's legacy_adapt dispatch branch still uses it.

2. **Sub-goal 5b — Rename `loadMentorProfileCanonical` → `loadMentorProfile`** across the codebase. Single canonical name post-retirement. Use `grep -rn "loadMentorProfileCanonical" website/src` to enumerate call sites before the rename — expected sites are the 6 callers from Session 3+4 (ring proof, public baseline, private baseline, mentor-profile GET, practitioner-context ×3, founder hub, private reflect, plus setFounderFacts/appendFounderFactsNote = ~9 call sites). Rename in lockstep (function definition + every caller's import). `tsc --noEmit` is the safety net.

3. **Sub-goal 5c — Remove `MentorProfileData` type definition** from `/website/src/lib/mentor-profile-summary.ts`. Also remove the `PassionMapEntry` and `VirtueEntry` legacy type definitions in the same file (they belonged to `MentorProfileData`'s shape). Update the file's docstring to reflect canonical-only purpose. **`buildProfileSummary` stays** — it consumes canonical `MentorProfile` since Session 3a. Decide at session open whether to (a) keep the file as-is with just `buildProfileSummary` and the `FounderFacts` re-export, or (b) move `buildProfileSummary` to a more honestly named file (e.g., `mentor-profile-summary.ts` retains its name; or moves to `mentor-profile-canonical.ts`). Recommend (a) — minimal churn, file name still describes function.

4. **Sub-goal 5d — Update `mentor-profile-adapter.ts`'s input type** if needed. The adapter takes `MentorProfileData` as input (legacy → canonical transform). After 5c removes `MentorProfileData`, the adapter's import breaks. Two options:
   - Move the `MentorProfileData` interface definition into `mentor-profile-adapter.ts` (the only remaining consumer of the legacy shape).
   - Or rename it (`PersistedLegacyProfile` or similar) inside the adapter file to make its purpose explicit.
   Decision at session open. Recommend (a) for minimal churn — the adapter is the legacy shape's natural home post-retirement, and an inline interface keeps the conversion self-contained.

5. **Sub-goal 5e — Reconcile the static fallback JSON file** (`/website/src/data/mentor-profile.json`). Currently legacy `MentorProfileData` shape; adapted at use site in `/api/mentor-profile/route.ts` GET path. Two options under O-S5-C from Session 4:
   - **(a)** Rewrite the JSON file as canonical `MentorProfile` shape. Drop the `adaptMentorProfileDataToCanonical` call at the fallback path. Cleaner end state; one file edit + one route edit.
   - **(b)** Leave the JSON as legacy + keep the adapter call at the fallback path. The adapter is needed anyway for legacy persisted rows; using it on the fallback too is consistent.
   - Recommend (a) — eliminates the residual `MentorProfileData` import in `/api/mentor-profile/route.ts` and matches the rest-of-codebase canonical end state. The static fallback is small (one file, ~50–100 lines) and the rewrite is mechanical.

6. **Sub-goal 5f — Reference-comment cleanup.** Update inline comments in the canonical `MentorProfile` definition (`/sage-mentor/persona.ts`) and the adapter (`/website/src/lib/mentor-profile-adapter.ts`) to reflect the post-Session-5 state. Names of legacy types/loaders that no longer exist should not appear except in historical context (decision-log references).

Adopted in prior sessions (carried into this one):

* Option C with `MentorProfile` canonical, C-α field placement (Session 2).
* `loadMentorProfileCanonical()` is Live and used by all consumers in `/website/src/` (Sessions 1, 3a–e, 4a–c).
* `frequencyBucketFromCount` is the single source of truth for the frequency bucket mapping.
* `buildProfileSummary` consumes canonical `MentorProfile` since Session 3a.
* `loadMentorProfileCanonical` shape-dispatches between canonical (post-4b writes) and legacy (pre-4b rows).
* Sage-mentor's zero-imports-from-website encapsulation must be preserved.
* PR8 (sandbox-cannot-push, stale-lock cleanup) adopted as formal process rules at Session 4 close. The agent does NOT push from the sandbox. Founder pushes via GitHub Desktop.

Before starting, please:

1. Complete the session-opening protocol — read this prompt first, then the canonical-source tier for code sessions (1, 2, 3, 8, 9):
   1. Manifest — `/manifest.md`, full read.
   2. Project instructions — pinned in your system prompt.
   3. Most recent handoff in tech stream — `/operations/handoffs/tech/2026-04-26-shape-adapter-session-4-private-reflect-and-journal-pipeline-close.md`.
   4. Technical state — `/summary-tech-guide.md` and `/summary-tech-guide-addendum-context-and-memory.md`.
   5. Verification framework — `/operations/verification-framework.md`.
   * Plus scan `/operations/knowledge-gaps.md` for relevant entries:
      * KG7 (JSONB shape): potentially relevant — the static fallback file rewrite (5e option a) involves writing a JSON fixture, but it does not touch JSONB columns. Minor relevance only.
      * KG3 (hub-label consistency): not relevant — no `mentor_interactions` writes/reads modified.
      * KG6 (composition order): not relevant — no context-layer placement changes.

2. Confirm P0 hold-point status (still active). This work is permissible inside the hold-point assessment set because it completes the canonical type integration that started in P0.

3. Read ADR-Ring-2-01 (`/compliance/ADR-Ring-2-01-shape-adapter.md`) for context — particularly §7 Session 5 (legacy retirement, Elevated risk), §11 Session 5 rollback (cleanup-only session, restoration-only rollback), §12 Session 5 notes.

4. Read the source files involved:
   * `/website/src/lib/mentor-profile-store.ts` — primary edit target. Removes `loadMentorProfile()` legacy function; renames `loadMentorProfileCanonical` → `loadMentorProfile`; adjusts imports.
   * `/website/src/lib/mentor-profile-summary.ts` — primary edit target. Removes `MentorProfileData`, `PassionMapEntry`, `VirtueEntry` interfaces; updates docstring; keeps `buildProfileSummary` and the `FounderFacts` re-export.
   * `/website/src/lib/mentor-profile-adapter.ts` — secondary edit target. Move or rename the `MentorProfileData` input type per Decision 5-2 below.
   * `/website/src/app/api/mentor-profile/route.ts` — secondary edit target. The static-fallback path either drops the `adaptMentorProfileDataToCanonical` call (Decision 5-3 = a) or keeps it.
   * `/website/src/data/mentor-profile.json` — possible edit target. If Decision 5-3 = a, rewrite as canonical shape.
   * `/sage-mentor/persona.ts` — read-only. Reference for canonical field names. The reference comments may want a small update to remove obsolete pointers to legacy types.
   * Every caller of `loadMentorProfileCanonical` (post-rename, will be `loadMentorProfile`):
      - `/website/src/app/api/mentor/ring/proof/route.ts` (Session 1)
      - `/website/src/app/api/mentor-baseline-response/route.ts` (Session 3b)
      - `/website/src/app/api/mentor/private/baseline-response/route.ts` (Session 3 follow-up)
      - `/website/src/app/api/mentor-profile/route.ts` (Session 3c)
      - `/website/src/lib/context/practitioner-context.ts` (Session 3d, 3 internal call sites)
      - `/website/src/app/api/founder/hub/route.ts` (Session 3e)
      - `/website/src/app/api/mentor/private/reflect/route.ts` (Session 4a)
      - `/website/src/lib/context/mentor-context-private.ts` (Session 4b — `setFounderFacts` and `appendFounderFactsNote`)
   * Verify by `grep -rn "loadMentorProfileCanonical" website/src` at session open — the count should match the list above.

5. Before writing any code, surface these decisions for the founder and wait for direction.

   * **Decision 5-1 — File renaming after `MentorProfileData` removal.** `mentor-profile-summary.ts`'s name suggests it summarises a profile — still accurate post-retirement (it exports `buildProfileSummary`). Two options:
      * (a) Keep the file at its current name; remove the legacy types, keep `buildProfileSummary` + `FounderFacts` re-export.
      * (b) Rename the file to something more canonical (e.g., `mentor-profile-canonical.ts` or just `mentor-profile.ts`).
      * Recommend (a) — minimal churn, file name still accurate.

   * **Decision 5-2 — Where does `MentorProfileData` live after `mentor-profile-summary.ts` removes it?** The adapter (`mentor-profile-adapter.ts`) takes it as input. Two options:
      * (a) Move the interface definition into `mentor-profile-adapter.ts` itself (the only remaining consumer). Recommend.
      * (b) Rename it to make its purpose explicit (e.g., `PersistedLegacyProfile`) inside the adapter file.
      * Either preserves correctness; (a) is less churn, (b) is more honest naming. Founder choice.

   * **Decision 5-3 — Static fallback file shape.** Per O-S5-C from Session 4 close.
      * (a) Rewrite `/website/src/data/mentor-profile.json` as canonical shape. Drop the adapter call at the fallback path in `/api/mentor-profile/route.ts`. Cleaner end state.
      * (b) Leave the JSON as legacy + keep the adapter call. Consistent with how legacy persisted rows are handled.
      * Recommend (a). The static fallback is for users without a Supabase profile yet; rewriting it as canonical is straightforward.

   * **Decision 5-4 — Inline-comment cleanup scope.** Many comments across the codebase reference `loadMentorProfile()` (legacy) and `MentorProfileData` in historical context. Two options:
      * (a) Strict cleanup — remove every reference except in archived files and the decision log.
      * (b) Light cleanup — only remove references that are now misleading (e.g., comments saying "legacy until Session 4" — those are now outdated). Keep historical context where it provides value.
      * Recommend (b). Some historical context is valuable for future readers; over-aggressive cleanup loses provenance.

   * **Decision 5-5 — Write-side verification.** O-S5-B carried from Session 4 close. The canonical-write path of `saveMentorProfile()` has not been verified end-to-end (no natural founder UI triggers it). Three options:
      * (a) Add a write-probe at the close of Session 5. After all renames land, founder runs a DevTools snippet against `/api/mentor-profile` POST with a minimal canonical-shape body, then reads back. Verifies the canonical write path works on the founder's account.
      * (b) Defer until natural triggering (baseline-response, journal re-ingestion, admin operation).
      * (c) Skip — accept the partial verification and document.
      * Recommend (a) only if founder is comfortable triggering a real save on their profile. Otherwise (b).

6. Risk classification before any code:

* **Sub-goal 5a (remove legacy loader) — Elevated.** Deletion of dead code on the encryption-adjacent surface. Mitigation: `tsc --noEmit` clean (catches any leftover caller); pre-edit grep verifies dead-code status.
* **Sub-goal 5b (rename canonical → loadMentorProfile) — Elevated.** Touches every consumer. Mitigation: rename in lockstep using `grep` + multi-file edits; `tsc --noEmit` is the safety net.
* **Sub-goal 5c (remove `MentorProfileData` type) — Elevated.** Type-level surface; touches all consumers that imported it. Most consumers were already migrated in Sessions 3+4.
* **Sub-goal 5d (move/rename adapter input type) — Standard.** Type-level only.
* **Sub-goal 5e (static fallback reconcile) — Elevated** if rewriting JSON (touches a data file consumed by the GET fallback path) or **Standard** if keeping legacy + adapter.
* **Sub-goal 5f (reference comments) — Standard.** Documentation only.

The full Critical Change Protocol (0c-ii) does NOT strictly apply (no Critical sub-goal). A brief plan walk per sub-goal + founder approval is sufficient. AC7 is not engaged (no auth/cookie/session/redirect changes). PR6 not engaged (no safety-critical surface modified — distress classifier, R20a perimeter, encryption pipeline all untouched).

7. Build order (recommended):

   1. **5b first (rename `loadMentorProfileCanonical` → `loadMentorProfile`).** This is the largest mechanical change. Done first, the rest of the session uses the new name throughout.
   2. **5d (move `MentorProfileData` into the adapter file).** Independent of 5b's rename. Type-level only.
   3. **5c (remove `MentorProfileData` from `mentor-profile-summary.ts`).** Now that the type lives in the adapter file (5d), this removal is clean.
   4. **5a (remove legacy `loadMentorProfile()`).** Now that 5b has freed the name, the legacy function can be deleted without conflict.
   5. **5e (static fallback reconciliation).** Last; depends on 5d's relocation of `MentorProfileData`.
   6. **5f (reference comments).** Final cleanup pass.

   Each sub-goal commits independently if the founder prefers (5–6 commits) OR sub-goals are batched into 2–3 commits (e.g., types + renames in one commit; static fallback in another; comments in a third). Recommend 2 commits: (commit 1) 5a + 5b + 5c + 5d together because they are tightly coupled type-level changes; (commit 2) 5e + 5f as a content/docs cleanup. Each commit followed by a `tsc --noEmit` clean and a founder push via GitHub Desktop.

8. Founder push via GitHub Desktop after each commit (PR8):

   1. Open **GitHub Desktop**.
   2. Top-left, confirm **Current Repository** = `sagereasoning`.
   3. Top-right, click **Push origin**. The badge shows the count of new commits.
   4. Wait for the spinner to finish.

   If sandbox commit is blocked by a stale `.git/index.lock` or `HEAD.lock` (per D-LOCK-CLEANUP, adopted at Session 4 close):
   1. Agent calls `mcp__cowork__allow_cowork_file_delete` for the lock.
   2. Agent runs `rm -f` on the lock from the sandbox.
   3. Agent retries the commit.
   4. If the cleanup tool returns "Could not find mount for path", agent surfaces "This is a limitation" and asks the founder to either close GitHub Desktop briefly or run `rm -f "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/.git/index.lock"` from a Terminal.

9. Live-probe post-deploy (founder side, after each push and Vercel `Ready`):

   * Founder hub mentor flow: navigate to `https://sagereasoning.com/founder-hub`, send any short message to the mentor agent. Expected: a normal mentor response that references the founder's actual profile. This exercises every renamed loader call site (founder hub directly + practitioner-context indirectly).
   * If Decision 5-5 = (a): write-probe via DevTools snippet (agent provides at session close).
   * If anything errors or returns generic/unprofiled output: revert via GitHub Desktop (History → right-click latest commit → Revert this commit → push). Stabilise to known-good and close.

10. Out of scope this session (queued):

    * **Optional Session 6 — persisted-row migration.** Decrypt → transform → re-encrypt every existing `mentor_profiles` row to canonical at rest. After Session 6, the `loadMentorProfile`'s legacy_adapt dispatch branch and `mentor-profile-adapter.ts` are removable. **Critical risk.** Founder choice; can defer indefinitely.
    * **UX finding O-S5-A** (private mentor chat thread doesn't load past reflections from DB on page mount). Pre-existing UX gap; not in scope for cleanup. Queue for a UX-focused session post-launch.
    * **Any sage-mentor runtime function rewrite.**
    * **Any change to authentication, cookie scope, session validation, or domain-redirect behaviour** (AC7 not engaged this session; verify at session open and again at deploy).

11. Decision-log items pending founder approval at this session open:

    * None carried forward from Session 4 close — all 11 entries written and Adopted at the Session 4 close.
    * New entries from Session 5 will be proposed at its close (typically D-RING-2-S5 — legacy retirement Verified).

12. PR-rule discipline named at session open:

    * **PR1** — multiple sub-goals; each is its own single-endpoint or single-file proof depending on the commit grouping the founder approves.
    * **PR2** — `tsc --noEmit` after each substantive edit; founder live-probe in same session as deploy.
    * **PR3** — no async behaviour added.
    * **PR4** — no model selection changes (no LLM in path for this session).
    * **PR5** — no expected re-explanations; KG7 only relevant if Decision 5-3 = a triggers a JSON file rewrite, in which case verify the JSON is well-formed (not a JSONB issue but related discipline).
    * **PR6** — not engaged this session. Confirm at session open.
    * **PR7** — no new deferrals expected. The session retires existing carried items.
    * **PR8** — engaged. GitHub Desktop for push. Stale-lock cleanup discipline applies.
    * **AC4 / AC5** — confirm the R20a perimeter and invocation tests remain intact post-rename. The reflect route's `await enforceDistressCheck(detectDistressTwoStage(...))` pattern is unaffected by the loader rename.
    * **AC7** — confirm not engaged.

13. Close-session obligations (per protocol Part C, elements 19–21):

    * Stabilise to a known-good state. If any live-probe surfaces a regression, founder may signal "I'm done for now" — do not propose additional fixes.
    * Produce a handoff note at `/operations/handoffs/tech/[date]-shape-adapter-session-5-legacy-retirement-close.md` in the required-minimum format plus extensions (Verification Method Used, Risk Classification Record, PR5, Founder Verification, Decision Log Entries — Proposed). Name that this session completes the staged transition and the only remaining ADR Session 6 (persisted-row migration, Critical) is founder-choice.
    * The Founder Verification section must use GitHub Desktop for push (per D-PR8-PUSH).
    * State plainly at close that this protocol was the governing frame and the work was governed by ADR-Ring-2-01 §7 Session 5.

Signal "OK" when the plan is approved and the step-5 decisions (5-1 through 5-5) are in. Then I'll walk the change plan + risk classification per sub-goal, request approval, build, verify, and close per step 7's order. Each commit is followed by founder push via GitHub Desktop.
