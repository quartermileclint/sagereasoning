# Close — `OikeiösisGap`/`GeneratedCandidate` type scoping, mentor approval, and the IDEA loop configuration-shape correction

**Session date:** 2026-08-06. **Tier:** `governance`/`code-elevated` throughout — no code, schema, or flag change this session.

**AC7/PR6/PR17:** not engaged. No live op, no deploy, no mint, no flag flip.

---

## 1. `OikeiösisGap` and `GeneratedCandidate` — scoped, then APPROVED by the mentor

Per the standing dependency-graph sequence (step three), authored `operations/agent-circles-2026-08/2026-08-06-oikeiosis-gap-generated-candidate-type-scope.md` — proposed TypeScript shapes for both types (not committed to the codebase), each field traced to an existing binding ruling or an existing architectural surface, per PR20. Key design calls: a new local, ordered `OikeiosisCircleRank` (1–5) distinct from the live free-form `OikeiosisCircle` string type; a discriminated-union `initialClassification` on `GeneratedCandidate` so friction-detection candidates (preferred-indifferent) can't be forced into the six-heuristic virtue-domain shape; `guardrailResult`/`fullExaminationProse` as separate optional fields populated at different pipeline stages; the current+1 rule enforced once, on `OikeiosisGap`, never re-derived per candidate.

**The mentor reviewed and approved the document**, with one ruling and two clarifications, all folded into the scope document in place:

- **`gapRef` — RULED**, not left TBD: `{sessionId}:{cycleNumber}:{currentCircle}->{targetCircle}`, cycle-local, self-describing, no external registry needed.
- **`generationConfidence` — CLARIFIED**: 0.00–1.00, two decimal places, a generation-time relevance signal orthogonal to the examination outcome (neither predicts the other).
- **`cycleOutcome` — a new field, added on the mentor's instruction**: `'pending' | 'rejected_by_guardrail' | 'rejected_by_novelty' | 'winner' | 'null_cycle'` — makes the null-cycle outcome a first-class named state in the type system, consistent with the honest-claims discipline already governing the rest of this program.
- `OikeiosisCircleRank` and the construction-time current+1 enforcement — approved as written, no changes.
- **Shared task-list storage** — formally entered into the dependency graph as its own item (item 10), per the mentor's instruction.

**Type shape is approved. Committing an actual TypeScript module into the codebase is a separate, still-unstarted step** — the approval doesn't itself require it, and no founder direction to do so was given this session.

## 2. The IDEA loop configuration shape — a flagged discrepancy, then a mentor correction

A follow-on mentor instruction (incorporating neuroscience research reviewed that session) introduced three additions to the eventual generation-step specification, framing `minimumIncubationInterval` as sitting "alongside the existing `minimumInterval`, `maximumDuration`, and `randomOffsetPercent`."

**Before recording that as fact, checked the repository:** a full search (working tree + `git log --all -S` across every branch and commit) for those three names returned **zero prior matches anywhere**. No IDEA-loop configuration shape had been scoped or documented in this program before that instruction. Flagged this explicitly rather than silently absorbing the "existing" framing — recorded in both the design document and the decision log as an unresolved conflict, per the same discipline this program has applied every other time an unverifiable claimed-prior-fact has surfaced (the friction-detection session's unverifiable self-continuity attribution is the direct precedent).

**The founder asked for a targeted check of the Stoa Q5c/Q13a session specifically** (the commit and its two predecessors, all files touched). Same result: zero matches, confirming the flag rather than surfacing anything missed.

**The mentor then corrected the instruction**, acknowledging the flag was right: those three parameters existed in session reasoning only, never scoped or committed anywhere. The correction supplied the missing scope item directly — **the IDEA loop configuration shape**, now queued as its own prerequisite ahead of the generation-step session, carrying four parameters:

- `minimumInterval` — computational throttle between cycle starts.
- `maximumDuration` — per-cycle hard ceiling, regardless of outcome.
- `randomOffsetPercent` — jitter, against multi-loop synchronisation problems and to introduce phantasia variation into the generation step's input sequence.
- `minimumIncubationInterval` — mandatory generative rest between cycle close and next generation; distinct from `minimumInterval` — not a throttle, a design-encoded incubation period (rationale: fresh knowledge-base material entering the context between cycles increases the odds the next generation step draws on richer inputs).

Also confirmed unchanged (per the mentor's own instruction): two design-rationale mappings, recorded as prose documentation only, not type definitions —

- **Three-network pipeline mapping**: generation ↔ Default Mode Network, guardrail examination ↔ Executive Control Network, novelty detection ↔ Salience Network.
- **Four-stage creativity-model alignment**: Preparation ↔ between-session knowledge accumulation, Incubation ↔ `minimumIncubationInterval`, Illumination ↔ a candidate passing both guardrail examination and novelty check, Verification ↔ the full-examination Layer 3 prose reaching the dashboard.

Both are captured in `operations/agent-circles-2026-08/2026-08-05-idea-loop-generation-heuristics.md` §"Neuroscience-grounded additions."

## 3. Dependency graph and binding sequence — updated

`operations/architecture-map-2026-08/06-PLAIN-TEXT-MIRROR.md` §"Sixth element":

- Item 2a marked **APPROVED 2026-08-06**, summarising the ruling and clarifications.
- New item 10 — shared task-list storage (from the prior session, formally entered this session).
- New item 11 — the IDEA loop configuration shape, recording the flag-then-correction sequence explicitly.
- The prose binding-sequence summary: step three marked **DONE and APPROVED**; new step thirteen added for the two now-queued prerequisites (configuration shape + shared task-list storage), both independent of C2/C1c and of each other, converging only at the generation step.

---

## Production state at session close

**Byte-equivalent to session open.** No flag was set, no migration was applied, nothing was deployed or pushed. Everything this session is documents only.

## What's carried, in binding order (per the dependency graph)

1. ~~Build the Stoa evidence-gate cross-check query~~ — done, prior session.
2. **The founder walks the Stoa activation** using the existing checklist. Ready now, independent track.
3. ~~Scope `OikeiösisGap` and `GeneratedCandidate`~~ — **DONE and APPROVED**, this session.
4. Scope C2 and C1c together (the three-component document) — next in the standing numbered sequence.
5–12. Unchanged from the prior close (build C2 → validate → build C1c → D4 → degraded consumers → logos-on W1/W2/W3 → the autonomous-loop design brief, in the graph's stated order and dependencies).
13. **NEW — scope the IDEA loop configuration shape** (four parameters, above) **and the shared task-list storage** (item 10); bring both to the mentor for approval. Both are prerequisites for the generation-step scope document, which is not yet itself a numbered item — it follows step thirteen. Runs independent of, and in parallel with, steps four through twelve.

## Files touched this session (commit-scoped)

**Records/design:** `operations/agent-circles-2026-08/2026-08-06-oikeiosis-gap-generated-candidate-type-scope.md` (new) · `operations/agent-circles-2026-08/2026-08-05-idea-loop-generation-heuristics.md` (modified — neuroscience additions, then corrected) · `operations/architecture-map-2026-08/06-PLAIN-TEXT-MIRROR.md` (modified — items 10/11, step three/thirteen) · `operations/decision-log.md` (four new entries: `D-OIKEIOSIS-GAP-GENERATED-CANDIDATE-TYPES-SCOPED-2026-08-06`, `D-OIKEIOSIS-GAP-GENERATED-CANDIDATE-TYPES-APPROVED-2026-08-06`, `D-IDEA-LOOP-NEUROSCIENCE-ADDITIONS-RECORDED-2026-08-06`, `D-IDEA-LOOP-CONFIGURATION-SHAPE-QUEUED-2026-08-06`) · this close · the companion next-session prompt.

**Deliberately excluded from this commit** (pre-existing modifications/untracked files from a different, concurrent work stream, unchanged by this session — same exclusion list as the prior close): `brand/Brand_Guidelines.docx`, `website/Brand/~$and_Guidelines.docx` (deletion), `website/public/.well-known/agent-card.json`, `website/public/llms.txt`, `website/src/app/api-docs/page.tsx`, `website/src/data/environmental-context.json`, `a3-developmental-streak.py`, `brand/Brand_Guidelines_superseded.docx`, `brand/Lituus.PNG`, `brand/millstone.PNG`, `brand/open hand extended.PNG`, `brand/stone basin.PNG`, `sdk/typescript/package-lock.json`.

## Rollback

`git revert` this session's commit reverts every file listed above as one unit. Both approved type definitions revert to unscoped; the configuration-shape and shared-task-list-storage dependency-graph items disappear; nothing had any code or live-system dependency on their existence.

---

*Cross-reference: every ruling above has its own decision-log entry. This close is a summary; the decision log is the record.*
