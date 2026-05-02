# Next-Session Prompt — Post-Streams-BCD (Founder Selects Scope)

**Stream:** founder. **Tier:** founder/governance scope.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Predecessor session close:** `/operations/handoffs/founder/2026-05-02-streams-bcd-close.md`.
**Predecessor decision-log entries (this session):**
- `D-API-REASON-PRE-ALT3-SNAPSHOT-2026-05-02` (Stream C — `/api/reason` snapshot)
- `D-VALIDATION-ADDENDUM-PROMOTED-2026-05-02` (Stream D — architectural-conventions catalogue)
- `D-D2-AMENDMENT-2026-05-02` (Stream B — D2 v1.0.0 → v1.1.0)

This session's scope is **founder-selected at session open**. The predecessor session closed Phase-2 pass-1 readiness at 6 of 7 preconditions complete; Candidate E (Critical-risk encryption wiring) is the final precondition. Two bounded next-session candidates remain plus standing standalone candidates. The founder calls.

---

## Why this session matters

The 2 May 2026 streams session brought the Phase-1 design batch to internal completeness:
- Stream C produced the `/api/reason` snapshot (the highest-priority snapshot in the perimeter per D24).
- Stream D promoted the Validation Addendum content to a permanent architectural-conventions catalogue per PR8 third-recurrence promotion.
- Stream B amended D2 to v1.1.0 with five D24 coverage-gap additions.

Phase-2 pass-1 readiness inventory after the predecessor session:

| Precondition | Status |
|---|---|
| All 26 Phase-1 + D-A16 deliverables Adopted | ✅ Complete |
| D-A16 catalogue minimum (T3-001 + T3-002 stems) | ✅ Complete |
| `/api/mentor/private/reflect` snapshot | ✅ Complete |
| `/api/reason` snapshot | ✅ **Complete (Stream C)** |
| Component registry up-to-date | ⚠️ **Stale-by-one — Stream B + D added entries that need v1.4.1 registry update** |
| D2 internally consistent with D24 | ✅ **Complete (Stream B; D2 v1.1.0)** |
| Validation Addendum promoted | ✅ **Complete (Stream D)** |
| **P2 task 2c encryption wiring** | ⚠️ **Pending — Critical-risk; the Candidate E session** |
| Founder approval of pass-1 Critical Change Protocol responses | ⚠️ Pending — happens at pass-1 commencement |

The two pending items: (1) the registry update reflects this session's governance changes; (2) Candidate E ADR-style preparation. Either can land first; the founder calls based on time budget and priority.

---

## Pre-conditions for this session opening

1. **Founder push of the predecessor session-close commit via GitHub Desktop.** The session-close file `/operations/handoffs/founder/2026-05-02-streams-bcd-close.md` is the only file the predecessor session left uncommitted. Verbatim push command in the predecessor close §"Founder Verification" Step 5.
2. **Vercel green confirmation.** Founder confirms Vercel deployed the session-close commit cleanly (no live-system effect; documentation-only push).
3. **Founder readiness for the session's selected scope** (per stream choice surfaced at Part B below).

If pre-conditions 1 + 2 are not met at session open, the agent's first action is to confirm with the founder which path applies. Do not proceed to stream work on top of an unpushed session-close.

---

## Part A — Open the session under the protocol

Per `/adopted/session-opening-protocol.md` Part A elements 1–8, do the full read sequence. Tier: founder/governance scope. Read:

1. **`/manifest.md`** — particularly R0 (oikeiosis), R6a–R6e (methodology), R7 (source fidelity), R8a–R8d (audience-tier glossary), R17a / R17b / R17c / R17d / R17e / R17f (Critical for Candidate E — intimate data protections including the Critical Change Protocol obligation per R17f), R20a (perimeter — Critical for Candidate E if it touches mentor profile storage), AC1 (model selection), AC4 (invocation testing — N/A this session unless Candidate E gets to wiring stage), AC5 (R20a perimeter — N/A unless Candidate E touches a perimeter route), AC6 (four-layer context architecture), AC7 (Session 7b standing constraint — Candidate E sits adjacent to AC7's surface; ADR drafting must name AC7-compatibility posture even if no AC7 surface is touched at the ADR stage), KG1 (Vercel rules — Critical for Candidate E if encryption module touches DB writes), KG7 (JSONB storage — Critical for Candidate E if encrypted blobs are stored in JSONB columns).

2. (Project instructions — already in system prompt.)

3. **`/operations/handoffs/founder/2026-05-02-streams-bcd-close.md`** — the predecessor session close. Required context. Particularly §"Next Session Should" for the candidate definitions and §"Founder Verification" Step 5 for the post-deploy state.

4. **`/operations/decision-log.md`** — read at minimum the last 5 entries:
   - `D-D2-AMENDMENT-2026-05-02` (Stream B output — D2 v1.1.0)
   - `D-VALIDATION-ADDENDUM-PROMOTED-2026-05-02` (Stream D output — architectural-conventions catalogue)
   - `D-API-REASON-PRE-ALT3-SNAPSHOT-2026-05-02` (Stream C output — `/api/reason` snapshot)
   - `D-REGISTRY-UPDATE-v1.4.0-2026-05-02` (the registry baseline this session may amend to v1.4.1)
   - `D-A16-CATALOGUE-ASSEMBLED-AND-ADOPTED-2026-05-02` (the precedent for adopting brand-new files in `/adopted/rag-mentor-alt3/`)

5. **Stream-specific reads (do these at the time the founder selects the stream — not all up front, since scope is conditional on the founder's choice).**

   **For the Registry update v1.4.1 stream (Standard risk — see Stream 1 below):**
   - **`/.claude/skills/sage-registry-update/SKILL.md`** (588 lines, Q1–Q5 + Pass-4-enhanced — the operative skill).
   - **`/website/public/component-registry.json`** (v1.4.0; 190 components — the source of truth).
   - **`/operations/registry-updates/proposed-2026-05-02-b.md`** (the predecessor session's proposal — for Pass-4-enhancement context).
   - **`/operations/handoffs/founder/2026-05-02-component-registry-update-close.md`** (the predecessor registry session — for the v1.4.0 baseline reasoning).

   **For Candidate E — encryption wiring ADR drafting (Standard risk at the ADR stage; the wiring itself is Critical at the implementation session per R17f):**
   - **`/manifest.md`** R17a–R17f (the intimate-data-protection rules driving the encryption requirement). R17f explicitly: "Changes to authentication, access control, or encryption that protect intimate data must follow the project's Critical Change Protocol (0c-ii). The urgency of protecting intimate data does not reduce the classification — it increases it. A protection that locks the data owner out of their own system has failed as a protection."
   - **`/adopted/rag-mentor-alt3/migration-plan.md`** (D21 — § Precondition 4 names the encryption module as the Phase-2 pass-1 build precondition).
   - **`/adopted/rag-mentor-alt3/operationalised-rules.md`** (D8 — for context on what intimate data the engine produces and where it lands).
   - **`/website/src/lib/`** survey for any existing encryption module (`encryption.ts` or similar — per the project instructions Priority 2 §2c "Wire application-level encryption for intimate data — Connect encryption.ts to mentor profile storage pipeline").
   - **`/operations/SageReasoning_Priority5_Local_Storage_Strategy.docx`** (if relevant to the local-first storage question per R17d).
   - **`/.claude/skills/`** check for any existing ADR skill (`sage-adr` or similar; otherwise use the engineering:architecture skill from the available skills list).

   **For the D24 audit current-state findings triage (mixed risk; see Standalone candidates below):**
   - **`/adopted/rag-mentor-alt3/consumer-workflow-audit.md`** (D24) §"Audit findings on existing route behaviour (independent of Phase 1)" — particularly finding 6 (Critical under R17 + PR6: `user_id` vs `auth.user.id` discrimination at `/api/reflect`).

6. **`/operations/knowledge-gaps.md`** — scan KG1–KG7 for relevance. KG1 (Vercel rules), KG7 (JSONB storage) are likely engaged for Candidate E. KG3 (hub-label) may be engaged if encryption touches hub-scoped data. KG2 (Haiku boundary) N/A unless Candidate E touches model selection.

Confirm: tier, hold-point status (still active per P0 0h), model selection (no LLM model selection at session level for the Registry update; for Candidate E ADR drafting, document the model-selection posture for any future encryption-aware endpoints but do not select), status-vocabulary readiness, signals/risk-classification readiness.

---

## Part B — Founder selects scope (AskUserQuestion at session open)

The agent surfaces a stream-choice question via AskUserQuestion. Recommended options:

### Stream 1 — Registry update v1.4.1 (Standard; bounded; ~30–60 minutes)

**Why this priority:** Bundles the follow-up registry items from the predecessor session — (a) new entry `doc-rag-mentor-alt3-architectural-conventions` from Stream D; (b) D2's `blocker` field cleared (and D2 v1.1.0 status reflected if appropriate) post-Stream-B amendment. Standard risk; routine `sage-registry-update` skill run with the four-pass discipline.

**Recommended sequencing within Stream 1:**
1. Run Pass 1 source scan with anchor 2026-05-02 (the predecessor session date; same-day window since the session-close commit is the trigger).
2. Identify entries needing updates: D2 entry's `blocker` text + status / notes; new architectural-conventions entry per D-VALIDATION-ADDENDUM-PROMOTED-2026-05-02; new `/api/reason` snapshot entry per D-API-REASON-PRE-ALT3-SNAPSHOT-2026-05-02 (if snapshot files are tracked in the registry — check the existing `/api/mentor/private/reflect` snapshot for precedent; if the predecessor snapshot is not tracked, the new one need not be either).
3. Run Pass 2 code-grep verification + Pass 3 transitive impact + Pass 4 internal consistency per the operative skill.
4. Draft proposal at `/operations/registry-updates/proposed-2026-05-03.md` (or per session date).
5. Surface proposal for founder approval via AskUserQuestion.
6. Apply per skill discipline (Step 8.1 backup → 8.2–8.9 apply → 9 decision log).
7. Append `D-REGISTRY-UPDATE-v1.4.1-2026-05-XX` to decision log.

**Risk classification:** Standard. Same shape as the predecessor v1.4.0 registry update.

**Exit criterion:** Registry at v1.4.1; statusSummary recomputed; new entries reflect the predecessor session's governance changes; D2 blocker cleared / updated to reflect v1.1.0 state; founder verification commands provided in the session close.

### Stream 2 — Candidate E ADR drafting (Standard at the ADR stage; the implementation is Critical at a future session)

**Why this priority:** Phase-2 pass-1 build precondition per D21 § Precondition 4. The application-level encryption module (per R17b) must be operational before the new `open_deferrals` and `deferral_resolutions` tables go live. **This session is ADR drafting only** — produce the architecture decision record covering: encryption module design choice (which fields encrypted; key management approach; encryption-at-rest vs application-level vs both); local-first storage decision per R17d (which fields stay client-side only; which are server-side encrypted); session-management compatibility per AC7 (the encryption module must not affect session validity); rollback paths; founder approval gates per R17f's Critical Change Protocol obligation.

**Recommended sequencing within Stream 2:**
1. Read R17a–R17f, AC7, KG1, KG7 in detail at session open.
2. Survey existing encryption code in `/website/src/lib/` (per project instructions Priority 2 §2c — "Connect encryption.ts to mentor profile storage pipeline" implies an `encryption.ts` exists or is designed; verify status with the founder before proceeding).
3. Survey existing intimate-data storage sites: `mentor_profiles` (per the predecessor session's snapshots), `reflections` table, `mentor_observations_structured`, `mentor_interactions` (per KG3) — what data lives at each, what the access-control profile is.
4. Use the `engineering:architecture` skill (from available skills) to draft the ADR per its template.
5. Draft ADR at `/drafts/ADR-ENCRYPTION-WIRING-01.md` (or similar naming per project convention).
6. Surface ADR for founder review via AskUserQuestion (Path A — adopt + move to /adopted/ this session vs Path B — adopt at separate session vs Path C — hold for revision).
7. Append `D-ENCRYPTION-WIRING-ADR-DRAFTED-2026-05-XX` to decision log.

**Critical posture note for the agent:** the ADR drafting itself is Standard risk (a document). The eventual implementation per the ADR is Critical and triggers R17f's Critical Change Protocol requirement at the wiring session. Per R17f: "A protection that locks the data owner out of their own system has failed as a protection." The ADR must explicitly address this risk — what happens if the encryption key is lost; what happens if the key rotation fails; what the rollback path is for a failed encryption wiring.

**Risk classification:** Standard at the ADR stage; Critical at the eventual implementation session.

**Exit criterion:** ADR drafted (and possibly Adopted depending on founder approval-pathway choice); decision-log entry; the ADR specifies the implementation steps that the future Critical-risk session will execute.

### Standalone candidates (founder may select one of these instead)

- **D24 audit current-state findings triage (especially finding 6 — Critical under R17 + PR6).** D24 §Audit findings item 6: `/api/reflect` persists reflections to the body-supplied `user_id` without verifying it matches `auth.user.id`. R17 finding — an authenticated user could potentially write a reflection to another user's record. **Recommendation per D24:** add the equality check, or drop the body parameter and use `auth.user.id` directly. **Risk:** Critical under PR6 (touches access control). **Session shape:** Critical Change Protocol applies at deployment; ADR drafting is Standard at the ADR stage; per the protocol the Critical-risk wiring session is separate from the ADR drafting.
- **D8 v1.1.0 revision pass.** Architecture-exercise transcript folds Adjustments 1, 2, 3 into D8's per-rule sections. The architectural-conventions catalogue (Stream D output of the predecessor session) persists as the standalone reference; D8 v1.1.0 makes the per-rule integration. **Risk:** Standard. **Session shape:** read transcript → revise per-rule sections → bump D8 v1.0.0 → v1.1.0 → decision-log entry. **Pending:** the architecture-exercise transcript has not yet surfaced in the working directory; founder confirms availability before the session begins.
- **D24 partial R20a input coverage finding (Routes 1, 2, 6).** D24 §Audit findings item 7: distress detection runs on the primary input field only, not on related fields. Logged for separate triage. **Risk:** Standard if the founder chooses to broaden the distress check to all user-controlled string inputs (additive); Elevated if any change to `enforceDistressCheck`'s wrapper logic is involved. **Session shape:** ADR-style decision (broaden vs accept asymmetry) → if broaden, per-route Edit operations.

---

## Part C — Recommended sequencing if multiple streams

If the founder selects multiple streams: **Stream 1 (registry update) first, then Stream 2 (ADR drafting).**

Rationale: Stream 1 is bounded, low-risk, and cleans the registry to reflect the current state — useful baseline for any subsequent work. Stream 2 is heavier-prep and benefits from a clean baseline. Both are Standard risk.

Recommended hard pause point: between Stream 1 and Stream 2. If the founder signals "done for now" after Stream 1, stabilise (registry update committed; founder verification provided) and close cleanly.

If the founder selects only **Standalone — D24 finding 6** (Critical surface), this should be the only stream of the session. Critical-risk work is not multi-streamed.

---

## Part D — Founder reads needed for in-session decisions

Beyond the protocol read sequence (Part A), at certain decision points the founder may need to read:

- **For Stream 1 (registry update):** the proposal document (~25KB) for batch approval. The agent provides a Plain-language §"What changes" summary at proposal time so the founder can decide without reading the full JSON.
- **For Stream 2 (Candidate E ADR):** the drafted ADR for review. The agent provides a Plain-language summary of the encryption module design choice + its implications + the rollback path before requesting Adopt approval.
- **For Standalone D24 finding 6 (Critical):** the full Critical Change Protocol per 0c-ii, with the agent producing all five steps (what changes, what could break, what happens to existing sessions, rollback plan, verification step) for the founder's explicit approval before any Edit operation.

---

## Part E — Session close + next-next-session preparation

After all engaged streams land, produce a session close at `/operations/handoffs/founder/[date]-[description]-close.md` per protocol Part C. Include the standard 0b minimum + extensions per the predecessor close's pattern.

The "Next Session Should" section recommends the remaining candidates from this prompt's catalogue (whichever streams are not engaged this session) plus any new candidates surfaced during this session.

If Stream 2 (Candidate E ADR) lands and is Adopted, the next-next session's "Next Session Should" includes **Candidate F — Phase-2 pass 1 commencement** as the immediate next item, contingent on the encryption wiring's implementation session landing first per the ADR's specification.

---

## Important context

- **Founder is a non-coder.** Plain-language explanations of every decision. Define every technical term the first time it appears.
- **Founder decides direction.** Where any stream surfaces ambiguity, the agent surfaces options with reasoning; the founder calls.
- **Streams are bounded.** Pause cleanly between streams. Respect "done for now" immediately.
- **Risk classifications:** Stream 1 — Standard. Stream 2 — Standard at ADR stage; Critical at implementation. Standalone D24 finding 6 — Critical at deployment; Standard at ADR stage. Standalone D8 v1.1.0 — Standard. Standalone partial R20a coverage — Standard or Elevated depending on scope.
- **No Critical implementation surface engaged unless the founder selects Standalone D24 finding 6.** Stream 2's ADR drafting is Standard; the Critical event is at a future implementation session.
- **The registry IS updated this session if Stream 1 is selected.** Stream 1's exit criterion is registry at v1.4.1 with statusSummary recomputed.
- **No founder concept re-explanation expected.** If a concept does need re-explanation, flag it for PR5.

---

## Standing reminders

- Single source of truth for governance metadata: `/website/public/component-registry.json`. The registry is at v1.4.0 at session open; Stream 1 may bump to v1.4.1.
- Decision-log entry per stream per PR7 — including for explicitly deferred decisions.
- Provide the founder with verification methods (URLs, expected results, copy-paste commands) for any work that touches a live surface. Stream 1 affects dashboards (live surface — verification required). Stream 2 ADR drafting does not affect any live surface.
- Do not propose changes to any /adopted/ governance document beyond what each stream specifies. Substantive edits to other documents are separate decisions.
- Do not commence Phase-2 build during this session. Phase-2 commences as its own Critical-risk session per D21's migration plan after Candidate E (encryption wiring) implementation lands — which is a future session, not this one.
- If any stream's work surfaces a need that exceeds the stream's scope, surface it as a scope question for the founder before proceeding.
- Per-stream commits + pushes (the predecessor session's pattern): the founder may continue committing + pushing each stream's output as it lands, rather than batching to session close. Either pattern is acceptable; the agent surfaces what files would be staged after each stream's verification step so the founder can choose.

---

## Forecast (varies by founder selection)

**If Stream 1 alone:**
- `/website/public/component-registry.json` — v1.4.0 → v1.4.1 (or v1.5.0 if the founder elects a major bump). totalComponents likely 190 → 191 (architectural-conventions catalogue) or 190 → 192 (catalogue + snapshot). statusSummary recomputed.
- `/operations/registry-updates/proposed-2026-05-XX.md` — new proposal document.
- `/operations/decision-log.md` — one new entry appended (`D-REGISTRY-UPDATE-v1.4.1-2026-05-XX`).
- `/archive/component-registry/component-registry.json.backup-2026-05-XX-XXXX` — pre-edit backup.
- 1 verification step specified for the founder.

**If Stream 2 alone:**
- `/drafts/ADR-ENCRYPTION-WIRING-01.md` (or `/adopted/` if Path A approval) — new ADR document.
- `/operations/decision-log.md` — one new entry appended (`D-ENCRYPTION-WIRING-ADR-DRAFTED-2026-05-XX` or `D-ENCRYPTION-WIRING-ADR-ADOPTED-2026-05-XX` depending on approval path).
- 1 verification step specified for the founder.
- Phase-2 pass-1 readiness inventory: 7 of 7 preconditions complete if the ADR is Adopted (the encryption wiring's implementation session is then the only blocker).

**If both Streams 1 + 2 (recommended ordering: 1 → 2):**
- All of the above.
- 2 new decision-log entries appended.
- 2 verification steps specified for the founder.
- Phase-2 pass-1 readiness inventory: 7 of 7 preconditions complete (both registry update + encryption ADR landed).

**If Standalone D24 finding 6 alone (Critical):**
- `/website/src/app/api/reflect/route.ts` — `user_id` vs `auth.user.id` access-control fix (or removal of body parameter).
- `/operations/decision-log.md` — one new entry appended (`D-REFLECT-USER-ID-FIX-2026-05-XX`).
- Critical Change Protocol responses captured in the conversation.
- Pre-edit backup of the route file.
- Verification step specified — confirm the equality check is in place; confirm a non-matching write returns the expected error.
- AC4 invocation test verifies the fix is in the execution path.

---

End of prompt. Confirm receipt and full Part A read before proceeding to Part B (founder scope selection via AskUserQuestion).
