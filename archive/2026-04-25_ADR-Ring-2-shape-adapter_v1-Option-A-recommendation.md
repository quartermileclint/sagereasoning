# ADR-Ring-2 — MentorProfile vs MentorProfileData Shape Adapter

**ARCHIVE NOTE — 2026-04-25:** This is v1 of the draft, recommending **Option A (one-way adapter)**. Superseded same day by v2 after the founder selected **Option C with MentorProfile canonical**. Preserved here for the reasoning trail per the standing user preference (always preserve previous versions before making changes).

The active draft is `/drafts/ADR-Ring-2-shape-adapter.md` (v2 onward). This file is read-only history.

---

# ADR-Ring-2 — MentorProfile vs MentorProfileData Shape Adapter

**Status:** Draft — awaiting founder approval. Located at `/drafts/`. Promotes to `/compliance/` only on explicit "Approve" signal.
**Date:** 2026-04-25
**Related rules:** R17 (intimate data — encryption pipeline; specifically R17b application-level encryption), PR1 (single-endpoint proof before rollout), PR3 (safety systems are synchronous), PR6 (safety-critical changes are Critical risk), PR7 (deferred decisions are documented).
**Supersedes:** —
**Superseded by:** —
**Related decisions:** D-Ring-2 (carried from 2026-04-25 ring-wrapper session), D-PE-2 (a) (deferred under D-PE-2 in the 2026-04-25 pattern-engine handoff).

---

## 1. Context

The website has two profile shapes that describe the same practitioner:

- **`MentorProfile`** — defined in `/sage-mentor/persona.ts`. Consumed by the Ring Wrapper (`executeBefore`, `executeAfter`, `buildBeforePrompt`, `buildAfterPrompt`), pattern-engine (`analysePatterns`, regression detection, narrative-prompt building), persona builders (morning check-in, evening reflection, weekly mirror), and journal-ingestion / reflection-generator / proactive-scheduler / llm-bridge / support-agent / mentor-ledger inside `/sage-mentor/`.
- **`MentorProfileData`** — defined in `/website/src/lib/mentor-profile-summary.ts`. Returned by `loadMentorProfile()` in `/website/src/lib/mentor-profile-store.ts`, which is the only retrieval function for the persisted (encrypted) profile. Consumed by `/api/founder/hub`, `/api/mentor/private/reflect`, `/api/mentor-baseline-response`, `/api/mentor-profile`, and the practitioner-context / private-mentor-context loaders.

The two shapes are similar but not identical (full enumeration in §2 below). The mismatch is the blocker preventing live-profile-driven integration of:

1. **Ring Wrapper** — currently exercised on `/api/mentor/ring/proof` using a TEMPORARY hand-constructed `PROOF_PROFILE: MentorProfile` fixture in `/website/src/lib/mentor-ring-fixtures.ts`.
2. **Pattern-Engine** — wired into the same proof endpoint as of 2026-04-25, augmented by a TEMPORARY `PROOF_INTERACTIONS: InteractionRecord[]` fixture in the same file.

Both fixtures' file headers explicitly mark them TEMPORARY, retiring when the live loader and the shape adapter land.

This ADR resolves the shape question once for both subsystems. It does not write code. It does not change R17 or any safety rule. It does not change `loadMentorProfile()`'s contract. The eventual code change is a separate session under PR1 (single-endpoint proof on `/api/mentor/ring/proof`, then rollout).

## 2. Side-by-side type comparison

(v1 content preserved — see active draft for the canonical comparison; v2 reuses §2 unchanged.)

## 3. Call-site enumeration

(v1 content preserved — see active draft; v2 reuses §3 unchanged.)

## 4. Decision drivers

(v1 content preserved — see active draft; v2 carries the same drivers, applied to a different recommendation.)

## 5. Options considered

(v1 content preserved — see active draft; v2 reuses §5 with the recommendation updated.)

## 6. Open questions the ADR must resolve regardless of approach

(v1 content preserved — see active draft.)

## 7. Recommendation (v1 — Option A)

**Adopt Option A — one-way adapter `MentorProfileData → MentorProfile`.**

### Reasoning (v1)

1. PR1 honoured cleanly — single new file, single proof surface, two-file change to graduate the proof from fixture-driven to live-data-driven.
2. sage-mentor encapsulation preserved — zero imports from `/website/` into `/sage-mentor/` today, kept that way.
3. Blast radius matches the work — 2 files at adoption, ~1 per additional surface; vs 13+ for Option B and 22+ for Option C.
4. Frequency mapping already exists in code (line 126 of `mentor-profile-summary.ts`) — adapter formalises it.
5. R17 surface unchanged — pure post-decryption transform, no new at-rest storage location.
6. Rollback trivial — one file revert, one route handler edit.

### Estimated session count (v1)

Two sessions: Session 1 builds adapter and wires into proof (Elevated risk); Session 2 rolls out to live reflect when D-PE-2 (b) and (c) also land (Critical risk because of the R20a perimeter, not the adapter itself).

---

## v2 supersession reasoning (2026-04-25, founder decision)

The founder selected **Option C with MentorProfile canonical** in preference to v1's Option A. The reasoning sequence on the founder's side:

- End-state cleanliness preferred over short-term blast-radius minimisation.
- Single source of truth for profile shape eliminates dual-type drift risk in future amendments.
- sage-mentor's `MentorProfile` already carries richer semantics (denormalised aggregates, temporal observation pointers, prescription, dimensions); making it canonical centralises those semantics rather than scattering them across an adapter and a persistence shape.

The AI's stated concern at the moment of supersession: the adapter's logic does not disappear under Option C — it relocates to the persistence boundary inside `loadMentorProfile()`. Existing rows in `mentor_profiles.encrypted_profile` were written using `MentorProfileData`, so transition requires either (a) migrating every existing row (Critical R17) or (b) a read-time adapter inside `loadMentorProfile()` until the journal pipeline is also updated. The founder accepted this trade-off in selecting Option C.

The active v2 draft documents the staged transition path that honours PR1 (parallel `loadMentorProfileCanonical()` introduced first, then consumers migrated one at a time, then the legacy function retired).

---

*End of v1 archive.*
