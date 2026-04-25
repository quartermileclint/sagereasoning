# Session prompt — Shape adapter Session 1 (canonical loader on the ring proof)

**Stream:** tech
**Governing frame:** `/adopted/session-opening-protocol.md`
**Authority for this session's scope:** ADR-Ring-2-01 §12 ("Notes for implementation sessions" → Session 1) at `/compliance/ADR-Ring-2-01-shape-adapter.md`.
**Risk classification:** Elevated (encryption-adjacent, production request path, no PR6 surface modified).

---

## Paste-ready prompt for the next session

Copy everything between the `>>>` markers into a new session.

>>>

Governing frame: /adopted/session-opening-protocol.md

Session prompt — Shape adapter Session 1 (canonical loader on the ring proof, Elevated risk)

This session implements Session 1 of the five-session transition adopted under ADR-Ring-2-01 (compliance/ADR-Ring-2-01-shape-adapter.md, Adopted 25 April 2026). The ADR is the authority for what gets built; this prompt is the day's brief.

**Goal:** Add `loadMentorProfileCanonical()` to `website/src/lib/mentor-profile-store.ts` alongside the existing `loadMentorProfile()`. Implement a read-time adapter as a pure function that converts `MentorProfileData` to `MentorProfile` (per ADR §6.1 and §6.2). Wire `loadMentorProfileCanonical()` into `/api/mentor/ring/proof` to replace the `PROOF_PROFILE` fixture. Verify end-to-end (TypeScript clean pre-deploy; live-probe post-deploy with founder-seeded profile).

**Adopted under ADR-Ring-2-01:**
- Option C with `MentorProfile` canonical, C-α field placement (extend `MentorProfile` in place with optional website-only fields). C-β fallback named in advance if Session 2 surfaces friction — not in scope this session.
- Frequency mapping: 1 → 'rare', 2–3 → 'occasional', 4–6 → 'recurring', 7–12 → 'persistent'. Adapter exports `frequencyBucketFromCount(n: number)` as the single source of truth.
- Coordinates with ADR-R17-01 (retrieval cache): the canonical loader wraps the same retrieval cache. Cache invalidation rules from R17-01 apply unchanged.
- Sage-only-field defaults (per ADR §6.2): `persisting_passions` computed from `passion_map[].frequency >= 'recurring'`; `current_prescription: null`; `direction_of_travel: 'stable'`; `dimensions: {…all 'developing'}`; `interaction_count: 0`; `last_interaction: persisted last_updated timestamp`; `journal_references: []`. Honest sentinels, no fabrication.

Before starting, please:

1. Complete the session-opening protocol — read this handoff prompt first, then the canonical-source tier for code sessions (1, 2, 3, 8, 9). Specifically:
   - **1. Manifest** — `/manifest.md`, full read.
   - **2. Project instructions** — pinned in your system prompt.
   - **3. Most recent handoff in tech stream** — `/operations/handoffs/tech/2026-04-25-pattern-engine-proof-close.md` (the close that last touched `/api/mentor/ring/proof`).
   - **8. Technical state** — `/summary-tech-guide.md` and `/summary-tech-guide-addendum-context-and-memory.md`. Sections relevant: Layer 2b (practitioner context, addendum §D.2) and any orchestration sections relevant to the ring proof.
   - **9. Verification framework** — `/operations/verification-framework.md`. Read the "API Endpoint" and "Code Change" verification methods.
   - Plus scan **/operations/knowledge-gaps.md** for entries relevant to this session's scope (KG2 Haiku boundary not relevant — no LLM in adapter; KG3 hub-label consistency not relevant — no `mentor_interactions` writes; KG7 JSONB shape not relevant — no JSONB read/write).

2. Confirm P0 hold-point status (still active per the prior tech-stream handoff). This work is permissible inside the hold-point assessment set because it advances live-data integration of the ring proof, which is the hold-point's testing surface.

3. Read **ADR-Ring-2-01** (`/compliance/ADR-Ring-2-01-shape-adapter.md`) in full — it's the authority for the design. Pay particular attention to §6 (open questions resolved), §7 ("Adopted plan" — Session 1 in the bullet list), §10 (founder verification methods), §11 (rollback plan, per-session — Session 1), §12 (Notes for implementation sessions — Session 1).

4. Read the source files involved:
   - `/sage-mentor/persona.ts` (the canonical type definition — do not edit).
   - `/website/src/lib/mentor-profile-store.ts` (where the new function lives).
   - `/website/src/lib/mentor-profile-summary.ts` (the legacy type — do not edit yet; that's Session 5).
   - `/website/src/lib/mentor-ring-fixtures.ts` (`PROOF_PROFILE` to be replaced; remains in place as fallback for un-seeded users).
   - `/website/src/app/api/mentor/ring/proof/route.ts` (the wiring target).
   - `/website/src/lib/sage-mentor-ring-bridge.ts` (where `MentorProfile` is re-exported).

5. Before writing any code, surface these decisions for the founder and wait for direction:
   - **Un-seeded-profile fallback.** When `loadMentorProfileCanonical()` returns null (the user has no persisted profile), should `/api/mentor/ring/proof` (a) error honestly with a 4xx telling the caller no profile exists, (b) fall back to `PROOF_PROFILE`, or (c) something else? ADR-Ring-2-01 leaves this to session open; pick at session start.
   - **Cache coordination posture (preferred per ADR §6.6: shared cache).** Confirm that the canonical loader wraps the same retrieval cache as the legacy `loadMentorProfile` — sharing the ciphertext store and applying the canonical adapter on each call's plaintext output. Alternative (separate cache) is named but not recommended.
   - **Adapter file location.** Two viable locations: (a) inline inside `mentor-profile-store.ts` (simpler — adapter is private to the store; only `loadMentorProfileCanonical` consumes it); (b) separate file `website/src/lib/mentor-profile-adapter.ts` (more visible — easier to test in isolation; founder can navigate to the file directly). Pick at session start.
   - **TypeScript test for the adapter.** ADR §8.4 names a structural-completeness test as a drift-risk mitigation. Should we land that test in this session or defer to a follow-up? Recommend landing it — adds ~30 lines and gives founder a stable verification artifact.

6. Walk the change plan with risk classification before writing any code (Elevated, per ADR-Ring-2-01 §7). Specifically:
   - Files to be edited: `mentor-profile-store.ts` (add new function + adapter, or import adapter from new file), `/api/mentor/ring/proof/route.ts` (replace `PROOF_PROFILE` import with canonical-loader call). Optionally a new file `mentor-profile-adapter.ts` and a co-located test file.
   - What could break: `loadMentorProfile()` (legacy) is untouched; existing consumers continue to work. The proof endpoint is the only wiring target; the other two ring-proof endpoints are out of scope. Worst-case observed regressions would be: the adapter produces a malformed `MentorProfile`, the ring functions throw at runtime, the proof endpoint returns 500. Detected by TypeScript pre-deploy and the live-probe post-deploy.
   - What happens to existing sessions: nothing — no auth, cookie, session, or domain-redirect change. AC7 not engaged.
   - Rollback plan: per ADR §11 — delete `loadMentorProfileCanonical()` (and the new adapter file if separate), revert the proof endpoint to use `PROOF_PROFILE`. ~5 minutes. Push, verify with the existing DevTools probe.
   - Verification: pre-deploy TypeScript clean (`npx tsc --noEmit` in `/website`). Post-deploy live-probe via the founder-paste DevTools Console snippet pattern established 2026-04-25 (Bearer token from localStorage). Pass criteria: response 200, `pattern_analysis.interactions_analysed === 15` (PROOF_INTERACTIONS retained as the interaction source for now), `before.augmented_prompt_includes_patterns` consistent with prior session, profile fields reflect the founder's actual seeded profile.

7. After founder approval of the plan, build in this order:
   1. Implement `frequencyBucketFromCount(n: number)` and the read-time adapter (per ADR §6.1, §6.2, §6.3). Pure function. Handles partial data per ADR §6.4 (clamps invalid frequency counts; produces honest sentinels for missing fields).
   2. Add `loadMentorProfileCanonical(userId)` to `mentor-profile-store.ts`. Internally: same Supabase fetch + decrypt as legacy (preferred: shared internal helper); apply adapter; return `{ profile: MentorProfile; summary: string; version: number } | null`. Wraps the same retrieval cache as the legacy function.
   3. Add reference comments in `MentorProfile` (sage-mentor/persona.ts only if a top-level docstring update without changing the type — confirm no other sage-mentor edits) and `MentorProfileData` (mentor-profile-summary.ts) pointing at the adapter file so future amendments are flagged.
   4. Update `/api/mentor/ring/proof/route.ts`: import `loadMentorProfileCanonical`; replace the `PROOF_PROFILE` use with `(await loadMentorProfileCanonical(userId)) ?? PROOF_PROFILE` (or whatever fallback the founder selected at step 5).
   5. (Optional, recommended) Land the structural-completeness test alongside the adapter file.
   6. `npx tsc --noEmit` pre-deploy. Exit 0 required.
   7. Push to main. Confirm Vercel deployment hash matches latest commit before founder-test.
   8. Founder-paste DevTools Console snippet. AI confirms pass criteria from step 6.

8. Out of scope this session (queued for later sessions per ADR §7):
   - Type extension on `MentorProfile` (Session 2).
   - Migration of any consumer other than the proof endpoint (Session 3 onward).
   - Any change to `/api/mentor/private/reflect` (Session 4 — Critical).
   - Retiring the legacy `loadMentorProfile()` or `MentorProfileData` (Session 5).
   - Persisted-row migration (Session 6 — optional).
   - Anything in `/sage-mentor/` files. (Sage-mentor remains untouched. Zero-imports-from-website encapsulation is preserved.)

9. PR-rule discipline named at session open:
   - PR1 — single-endpoint proof. The proof endpoint is the proof.
   - PR2 — verification immediate. Live-probe in same session as wire.
   - PR3 — adapter is synchronous, no I/O.
   - PR4 — model selection. Adapter has no LLM in path; not relevant beyond the existing ring proof's existing model selection (already governed by `constraints.ts`).
   - PR5 — re-explanations flagged in handoff. Cumulative count maintained in close note.
   - PR6 — safety-critical changes are Critical. This session is **Elevated**, not Critical. No distress classifier, Zone 2/3, encryption pipeline, session, access control, deletion, or deployment-config changes. Adapter consumes data that came from the encryption pipeline — Elevated, not Critical.
   - PR7 — deferred decisions logged. C-β fallback decision logged for Session 2; un-seeded fallback decision logged for this session's open.
   - AC7 — Session 7b standing constraint. No auth/cookie/session/domain-redirect change. Confirm at session open and again at deploy.

10. Close-session obligations (per protocol Part C, elements 19–21):
    - Stabilise to a known-good state. If the live-probe fails, founder may signal "I'm done for now" — do not propose additional fixes.
    - Produce a handoff note at `/operations/handoffs/tech/[date]-shape-adapter-session-1-close.md` in the required-minimum format plus extensions (Verification Method Used, Risk Classification Record, PR5, Founder Verification, Decision Log Entries — Proposed). The handoff names whether `PROOF_PROFILE` and `PROOF_INTERACTIONS` retired in this session or remain as fallback.
    - State plainly at close that this protocol was the governing frame and the work was governed by ADR-Ring-2-01.

Signal "OK" when the plan above is approved and the four step-5 decisions are in. I'll then build, verify, and close.

>>>

---

## Notes (not part of the paste-in)

- This prompt is the day's brief, designed to be pasted at the start of the next session. The hub route normally prepends `Governing frame: /adopted/session-opening-protocol.md` automatically; the prompt repeats it inside the paste so the founder can use it whether they reach the next session via the hub or via a fresh chat.
- The four decisions surfaced at step 5 are deliberate — they're the only choices the founder needs to make at session open. Everything else is fixed by ADR-Ring-2-01.
- Risk is **Elevated**. If anything in step 6 surfaces a concern that suggests Critical, the AI must flag it and the founder may reclassify upward per 0d-ii.
- The previous session (2026-04-25 pattern-engine proof close) verified the proof endpoint end-to-end. This session graduates that endpoint from fixture-driven to live-data-driven on the profile side. The interaction side stays on `PROOF_INTERACTIONS` for now (interaction-side work is a different ADR — D-PE-2 (c)).
- If the live-probe shows the founder's seeded profile produces a malformed `MentorProfile` (adapter bug), the rollback is single-file revert (~5 minutes), and the proof endpoint reverts to the existing fixture-driven behaviour.

---

*End of prompt file.*
