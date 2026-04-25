Governing frame: /adopted/session-opening-protocol.md

**Session prompt — Shape adapter ADR (MentorProfile vs MentorProfileData)**

> I want to work on resolving the shape mismatch between `MentorProfile` (sage-mentor's profile shape, defined in `/sage-mentor/persona.ts`) and `MentorProfileData` (the website's loaded-profile shape, defined in `/website/src/lib/mentor-profile-summary.ts`). This is **D-Ring-2 carried** from the 25 April 2026 ring-wrapper session, and the same blocker now applies to pattern-engine (verified yesterday on `/api/mentor/ring/proof`). Resolving it once unblocks both subsystems for live integration.
>
> Context for this session: The two shapes are similar but not identical. The ring-wrapper's `executeBefore`, `executeAfter`, `buildBeforePrompt`, `buildAfterPrompt`, and pattern-engine's `analysePatterns` all consume `MentorProfile`. The website's `loadMentorProfile()` returns `MentorProfileData`. Concrete examples of the divergence we already know about: `MentorProfile.passion_map[].frequency` is the string union `'rare' | 'occasional' | 'recurring' | 'persistent'`; `MentorProfileData.passion_map[].frequency` is a number 1–12. There will be others — the ADR session needs to enumerate them.
>
> Why this session is leveraged: until the shape adapter lands, **two existing proof endpoints (`/api/mentor/ring/proof` for ring-wrapper, the augmented version for pattern-engine) cannot transition from fixture-driven to live-profile-driven.** The PROOF_PROFILE and PROOF_INTERACTIONS fixtures are explicitly TEMPORARY in their file headers; this session begins their retirement. The fixtures stay in place until the adapter is Verified end-to-end on at least one live flow.
>
> **This session is ADR-first. Do not write code yet.** The output of this session should be an Adopted ADR in `/compliance/`, not a code change. Code lands in a follow-up session per PR1 (single-endpoint proof on the existing mentor-ring proof endpoint, then rollout).
>
> Before we start, please:
>
> 1. Complete the session-opening protocol — read `/operations/handoffs/tech/2026-04-25-pattern-engine-proof-close.md` first, then the canonical-source tier for code sessions (1, 2, 3, 8, 9), then scan `/operations/knowledge-gaps.md` for entries relevant to type taxonomies, profile loading, or shape mapping. Confirm the P0 hold-point status (still active per the prior handoff).
>
> 2. Read both type definitions in full and produce a side-by-side comparison:
>    - `MentorProfile` from `/sage-mentor/persona.ts` (the type and all dependent types — `PassionMapEntry`, `CausalTendency`, `ValueHierarchyEntry`, `OikeioisMapEntry`, `VirtueDomainAssessment`, `JournalReference`, `ProgressionPrescription`, `DimensionScores`, `KatorthomaProximityLevel`)
>    - `MentorProfileData` from `/website/src/lib/mentor-profile-summary.ts` (the type and all dependent types — `PassionMapEntry`, `VirtueEntry`, anything else it pulls in)
>    - Tell me: which fields are equivalent, which differ in type/shape, which exist on one side but not the other.
>
> 3. Enumerate the call sites. Grep for everywhere each shape is used:
>    - `MentorProfile`: in `/sage-mentor/` (ring-wrapper, persona, pattern-engine, session-bridge, profile-store, journal-ingestion, others), in `/website/src/lib/sage-mentor-ring-bridge.ts`, in `/website/src/lib/mentor-ring-fixtures.ts`, in the proof routes.
>    - `MentorProfileData`: in `/website/src/lib/` (mentor-profile-store, mentor-profile-summary, practitioner-context, others), in route handlers (`/api/mentor/private/reflect`, `/api/founder/hub`, others).
>    - Report: a count and a per-file breakdown. This drives the cost estimate for each adapter approach.
>
> 4. Walk the three approaches with concrete trade-offs (D-Ring-2 named these as a/b/c):
>    - **(a) One-way adapter `MentorProfileData → MentorProfile`** — a function in `/website/src/lib/` that maps loaded data into the ring's expected shape. Lowest churn for sage-mentor (zero changes), highest at-call-time cost (every call to a sage-mentor function from website code goes through the adapter). Where would the adapter live? What does it do for fields that exist on one side but not the other?
>    - **(b) Refactor ring (and pattern-engine, and others) to accept `MentorProfileData`** — change sage-mentor's function signatures to consume the website's shape directly. Highest sage-mentor churn (many functions), but no per-call adapter cost. Breaks sage-mentor's encapsulation as an isolated module — sage-mentor would now depend on a website type.
>    - **(c) Unify the two shapes** — make one shape the canonical source of truth, retire the other. Largest one-time refactor across BOTH sides. Cleanest end state. Most risk in the change because every reader of either shape must be updated together (PR1 violation if done atomically; needs an alias/transition period if done in stages).
>
>    For each approach, name: estimated number of files touched, estimated session count, what breaks if the change is partial, and the rollback story.
>
> 5. Surface the questions the ADR has to answer regardless of approach:
>    - Where do **fields with no counterpart** go? E.g., `MentorProfile.causal_tendencies` and `oikeiosis_map` — are they computed from `MentorProfileData` somehow, defaulted, or simply omitted (degrading the ring's evaluation)?
>    - What happens to `MentorProfile.persisting_passions` (a denormalised array) when only `passion_map` exists in `MentorProfileData`? Compute on the fly?
>    - The `frequency` field type difference: string-union vs number-1-to-12. Is there a defensible canonical mapping (e.g., 1–3 = rare, 4–6 = occasional, 7–9 = recurring, 10–12 = persistent)? If so, where does it live?
>    - Does the adapter need to handle missing/partial data (a profile not yet seeded by journal ingestion)?
>    - **R17 footprint** — does the adapter touch encrypted data? (It would, if it operates on the decrypted MentorProfileData returned by `loadMentorProfile`.) Is that a Critical surface even though the adapter is pure-function?
>
> 6. Recommend an approach with reasoning. Include estimated session-count and the risk classification for the eventual code change (not the ADR itself, which is Standard). I will pick.
>
> 7. Before writing the ADR, confirm the ADR template/conventions used by the existing accepted ADR (`/compliance/ADR-R17-01-profile-store-cache.md` from yesterday) so this one matches the established format.
>
> Do not write any code yet. Produce the assessment and the ADR draft. The ADR moves from `/drafts/` to `/compliance/` only on my explicit "Approve" signal, per the established pattern.
