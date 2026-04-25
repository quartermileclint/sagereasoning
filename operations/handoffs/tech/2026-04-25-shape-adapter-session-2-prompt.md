# Session prompt — Shape adapter Session 2 (extend canonical type, C-α)

**Stream:** tech
**Governing frame:** `/adopted/session-opening-protocol.md`
**Authority for this session's scope:** ADR-Ring-2-01 §7 ("Adopted plan" — Session 2 in the bullet list) and §12 ("Notes for implementation sessions" → Session 2) at `/compliance/ADR-Ring-2-01-shape-adapter.md`.
**Risk classification:** Standard (additive type extension; no production request-path change unless adapter pass-through is bundled — see decision 2 below).

---

## Paste-ready prompt for the next session

Copy everything between the `>>>` markers into a new session.

>>>

Governing frame: /adopted/session-opening-protocol.md

Session prompt — Shape adapter Session 2 (extend canonical type, C-α, Standard risk)

This session implements Session 2 of the five-session transition adopted under ADR-Ring-2-01 (`/compliance/ADR-Ring-2-01-shape-adapter.md`, Adopted 25 April 2026). The ADR is the authority for what gets built; this prompt is the day's brief.

**Goal:** Extend `MentorProfile` (defined in `/sage-mentor/persona.ts`) with the website-only optional fields enumerated in ADR §12 Session 2 — `journal_name?`, `journal_period?`, `sections_processed?`, `entries_processed?`, `total_word_count?`, `founder_facts?`, `proximity_estimate_description?`. Verify TypeScript clean across the existing sage-mentor consumers (no consumer should fail to compile because the new fields are all optional). If C-α surfaces material friction (e.g., a sage-mentor function unexpectedly assumes a field is present), fall back to C-β (companion envelope) with founder approval.

**Adopted under ADR-Ring-2-01:**

- Option C with `MentorProfile` canonical, **C-α field placement** — extend `MentorProfile` in place with optional website-only fields. C-β fallback (companion envelope) is named in advance; invoke only if friction surfaces this session.
- The seven optional fields named above. `founder_facts` reuses the `FounderFacts` type defined in `/website/src/lib/mentor-profile-summary.ts`. Decide at session open whether to (a) re-export `FounderFacts` from sage-mentor (cleanest), (b) inline the type in sage-mentor, or (c) keep the import path crossing — see decision 1 below.
- `proximity_estimate_description?` is flat (single optional string) per ADR §12, not nested. Avoids introducing a `proximity_estimate?: {...}` sub-object that would duplicate `senecan_grade` and `proximity_level` already on the canonical type.
- Sage-mentor's zero-imports-from-website encapsulation must be preserved. If `founder_facts` requires importing the `FounderFacts` type from `/website/`, that crosses the encapsulation boundary in the wrong direction — addressed by decision 1.
- Coordinates with ADR-R17-01 (retrieval cache): no change to the cache surface this session.

**Before starting, please:**

1. **Complete the session-opening protocol** — read this handoff prompt first, then the canonical-source tier for code sessions (1, 2, 3, 8, 9). Specifically:
   - 1. Manifest — `/manifest.md`, full read.
   - 2. Project instructions — pinned in your system prompt.
   - 3. Most recent handoff in tech stream — `/operations/handoffs/tech/2026-04-25-shape-adapter-session-1-close.md` (Session 1 close — canonical loader and adapter).
   - 8. Technical state — `/summary-tech-guide.md` and `/summary-tech-guide-addendum-context-and-memory.md`. Sections relevant: any orchestration sections that touch the ring or the practitioner context.
   - 9. Verification framework — `/operations/verification-framework.md`. Read the "Code Change" verification method.
   - Plus scan `/operations/knowledge-gaps.md` for entries relevant to this session's scope. KG2 (Haiku boundary) not relevant — no LLM. KG3 (hub-label consistency) not relevant — no `mentor_interactions` writes. KG7 (JSONB shape) not relevant — no JSONB read/write.

2. **Confirm P0 hold-point status** (still active per the prior tech-stream handoffs). This work is permissible inside the hold-point assessment set because it advances live-data integration of the ring proof.

3. **Read ADR-Ring-2-01** (`/compliance/ADR-Ring-2-01-shape-adapter.md`) in full — it's the authority for the design. Pay particular attention to §6.1 (the C-α / C-β / C-γ trade-off), §7 ("Adopted plan" — Session 2 in the bullet list), §10 (founder verification methods), §11 (rollback plan, per-session — Session 2), §12 (Notes for implementation sessions — Session 2).

4. **Read the source files involved:**
   - `/sage-mentor/persona.ts` — primary edit target (the `MentorProfile` type definition).
   - `/website/src/lib/mentor-profile-summary.ts` — read for the `FounderFacts` type definition and the field semantics being lifted.
   - `/website/src/lib/mentor-profile-adapter.ts` — may be edited (decision 2 below).
   - `/website/src/lib/__tests__/mentor-profile-adapter.test.ts` — may be edited (decision 2 below).
   - All sage-mentor files that consume `MentorProfile` (per ADR §3.1 — 13 files, ~80 occurrences). The TypeScript check is the primary verification; you do not need to read every consumer line-by-line, but you should know which they are so you can interpret any compile failure.

5. **Before writing any code, surface these decisions for the founder and wait for direction:**

   - **Decision 1 — `FounderFacts` type location.** The website defines `FounderFacts` in `/website/src/lib/mentor-profile-summary.ts`. To add `founder_facts?: FounderFacts` to `MentorProfile`, the type needs to be reachable from sage-mentor without crossing the encapsulation boundary in the wrong direction. Three options:
     - (a) **Move `FounderFacts` to sage-mentor** (e.g., into `persona.ts` or a new `/sage-mentor/founder-facts.ts`). Update the website's `MentorProfileData` to import from sage-mentor instead. Cleanest end state but touches a website type.
     - (b) **Inline an equivalent `FounderFacts` shape inside `persona.ts`** as a separate exported type. Two type definitions for one concept temporarily; consolidates in Session 5.
     - (c) **Use `unknown` / structural typing for the field on `MentorProfile`** (e.g., `founder_facts?: { age: number; years_married: number; …optional fields… }` inlined). Most flexible, weakest typing. Not recommended.
     - Recommend (a) for the cleanest end state, but (b) is acceptable if the founder wants minimum cross-file churn this session.

   - **Decision 2 — Adapter pass-through scope.** The adapter (`mentor-profile-adapter.ts`) currently does NOT populate the new optional fields (they don't exist yet on `MentorProfile`). Two options for this session:
     - (a) **Add type slots only** — extend `MentorProfile`, leave the adapter as-is. The new fields are `undefined` on every adapter output until a future session populates them. Cleanest scope cap. Risk: Standard.
     - (b) **Add type slots + adapter pass-through** — extend `MentorProfile`, then update the adapter to forward `journal_name`, `journal_period`, `sections_processed`, `entries_processed`, `total_word_count`, `founder_facts`, and `proximity_estimate?.description` from the persisted `MentorProfileData` into the canonical `MentorProfile`. Update the structural-completeness test to assert pass-through. Slightly larger session; touches the encryption-adjacent file. Risk remains Standard because the changes are additive and pass-through.
     - Recommend (b) — the new fields are useful precisely because consumers can read them, and they're useless until the adapter populates them. The additional code is small (~15 lines in the adapter, ~10 lines in the test).

   - **Decision 3 — C-α vs C-β fallback condition.** ADR-Ring-2-01 §6.1 names C-β (companion envelope) as the fallback if C-α surfaces friction. Confirm at session open whether the founder accepts the AI's judgement on whether friction is "material" enough to invoke fallback, or wants any C-α friction surfaced explicitly before fallback. Default: AI surfaces explicitly with a recommendation; founder decides.

6. **Walk the change plan with risk classification before writing any code (Standard, per ADR §7):**

   - **Files to be edited** (depending on decisions):
     - Always: `/sage-mentor/persona.ts` (extend `MentorProfile` with seven optional fields, possibly add `FounderFacts` type per decision 1).
     - If decision 1 = (a): `/website/src/lib/mentor-profile-summary.ts` (move `FounderFacts` import to sage-mentor; legacy `MentorProfileData` continues to use it via re-export).
     - If decision 2 = (b): `/website/src/lib/mentor-profile-adapter.ts` (add pass-through), `/website/src/lib/__tests__/mentor-profile-adapter.test.ts` (extend assertions).

   - **What could break.** All seven new fields are optional, so existing sage-mentor consumers that don't read them continue to compile. Worst case: a sage-mentor consumer assumes a previously-required field is required (e.g., reads `profile.user_id` without optional-chaining) — but that's already the case today (those fields are not changing). The new optional fields cannot break existing readers because nothing is reading them yet. If `FounderFacts` moves (decision 1a), the website's `MentorProfileData` interface needs to import from the new location — TypeScript catches this at compile time.

   - **What happens to existing sessions.** Nothing. No auth, cookie, session, or domain-redirect change. AC7 not engaged. No safety-critical surface modified. PR6 not engaged.

   - **Rollback plan** (per ADR §11): revert the type extension on `MentorProfile`. The added fields were optional, so consumers that read them (none yet, since they're new) tolerate revert without TypeScript errors. ~5 minutes. If decision 1a was taken, also revert the `FounderFacts` move.

   - **Verification:** pre-deploy TypeScript clean (`npx tsc --noEmit` in `/website` AND ideally compile the sage-mentor consumers too — sage-mentor doesn't have its own tsconfig, so the website's tsc covers it transitively when sage-mentor is imported via the bridge). Post-deploy: live-probe of `/api/mentor/ring/proof` to confirm no regression — the proof endpoint should still return 200 with all six pass criteria from Session 1's close handoff. If decision 2 = (b), additionally confirm one of the new fields surfaces in the response (suggest: log the persisted profile's `journal_name` in the proof response under a new `profile_meta` field for visibility, or hold off on response surfacing until Session 3 wires the consumer).

7. **After founder approval of the plan, build in this order:**

   1. If decision 1 = (a): move `FounderFacts` from `mentor-profile-summary.ts` into sage-mentor (new file `/sage-mentor/founder-facts.ts` or extend `persona.ts`). Update `mentor-profile-summary.ts` to re-import. `npx tsc --noEmit` should still be clean.
   2. Extend `MentorProfile` in `/sage-mentor/persona.ts` with the seven optional fields. Each field gets an inline doc comment naming its source field on `MentorProfileData`.
   3. `npx tsc --noEmit` after the type extension. Confirm no sage-mentor consumer breaks. If any does, surface the failure to the founder; consider C-β fallback per decision 3.
   4. If decision 2 = (b): extend the adapter's `adaptMentorProfileDataToCanonical` to pass through the new fields. Each pass-through is a single-line copy with optional handling (e.g., `founder_facts: data.founder_facts`). Extend the structural-completeness test with assertions for the new fields.
   5. `npx tsc --noEmit` again. Exit 0 required.
   6. Push to main. Confirm Vercel deployment hash matches latest commit before founder-test.
   7. Founder-paste the existing DevTools Console snippet from Session 1's close (it tests the proof endpoint end-to-end). Confirm: status 200, `profile_source: 'live_canonical'`, all six pattern-engine criteria still met, no regression. If decision 2 = (b) and a new `profile_meta` field was added to the response, also confirm it carries the expected values from the founder's seeded profile.

8. **Out of scope this session** (queued for later sessions per ADR §7):

   - Migration of any consumer from `loadMentorProfile` to `loadMentorProfileCanonical` (Session 3 onwards).
   - Any change to `/api/mentor/private/reflect` (Session 4 — Critical).
   - Retiring the legacy `loadMentorProfile()` or `MentorProfileData` (Session 5).
   - Persisted-row migration (Session 6 — optional).
   - Any sage-mentor runtime function rewrite (sage-mentor's reasoning code is unchanged; only the type definition gains optional fields).
   - Any change to the encryption pipeline, the cache (still not yet implemented; ADR-R17-01 is a separate session), the distress classifier, or the R20a perimeter.

9. **PR-rule discipline named at session open:**

   - **PR1** — single-endpoint proof. The type extension affects no endpoint directly. The optional adapter pass-through (decision 2b) is exercised on the same proof endpoint Session 1 verified.
   - **PR2** — verification immediate. `tsc --noEmit` after each substantive edit; live-probe in same session as deploy.
   - **PR3** — no async behaviour added. Type extension is compile-time only.
   - **PR4** — model selection. No LLM in path for this session.
   - **PR5** — re-explanations flagged in handoff. Cumulative count maintained in close note.
   - **PR6** — safety-critical changes are Critical. This session is **Standard** — no distress classifier, Zone 2/3, encryption pipeline, session, access control, deletion, or deployment-config changes. Type extension is the lowest-risk class of change.
   - **PR7** — deferred decisions logged. Any C-β invocation is logged with reasoning. Any field that the founder wants to defer adding is logged.
   - **AC7** — Session 7b standing constraint. No auth/cookie/session/domain-redirect change. Confirm at session open and again at deploy.

10. **Close-session obligations** (per protocol Part C, elements 19–21):

    - Stabilise to a known-good state. If the live-probe surfaces a regression, founder may signal "I'm done for now" — do not propose additional fixes.
    - Produce a handoff note at `/operations/handoffs/tech/[date]-shape-adapter-session-2-close.md` in the required-minimum format plus extensions (Verification Method Used, Risk Classification Record, PR5, Founder Verification, Decision Log Entries — Proposed). The handoff names whether C-α held or C-β was invoked, and whether decision 2 was (a) or (b).
    - State plainly at close that this protocol was the governing frame and the work was governed by ADR-Ring-2-01.

Signal "OK" when the plan above is approved and the three step-5 decisions are in. I'll then build, verify, and close.

>>>

---

## Notes (not part of the paste-in)

- This prompt is the day's brief, designed to be pasted at the start of the next session. The hub route normally prepends `Governing frame: /adopted/session-opening-protocol.md` automatically; the prompt repeats it inside the paste so the founder can use it whether they reach the next session via the hub or via a fresh chat.
- The three decisions surfaced at step 5 are deliberate — they're the only choices the founder needs to make at session open. Everything else is fixed by ADR-Ring-2-01.
- Risk is Standard. If anything surfaces a Critical concern (e.g., type extension somehow forces a change to the encryption pipeline, which it should not), the AI must flag it and the founder may reclassify upward per 0d-ii.
- Session 1 (this session's predecessor) Verified the canonical loader and adapter end-to-end. Session 2 builds on that by giving the canonical type the full set of fields the website's surfaces will eventually need. The adapter pass-through (decision 2b) is what makes the new fields useful to consumers in Session 3.
- If the live-probe in step 7.7 shows the proof endpoint regresses (e.g., the type extension breaks the ring's `executeBefore` because some sage-mentor function tightened a field), the rollback is single-file revert of `persona.ts` (~5 minutes), and the proof endpoint reverts to Session-1-Verified behaviour.

End of prompt file.
