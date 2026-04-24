# Project Instructions — Amendments for Founder to Apply

**Status:** Drafted 2026-04-24 following the D8 / D9 / D14 resolutions in discrepancy-sort-2026-04-23. Requires founder to copy-paste into the Cowork project-instructions UI (project instructions are configured at the Cowork project level and cannot be edited as a repo file).

**How to apply:**
1. Open the Cowork project settings for `sagereasoning`.
2. Edit the project instructions.
3. For each of the three sections below, locate the existing block in the project instructions and replace it with the amended text. Each block's "existing text" is shown first so you can find it by search.
4. Save. Confirm the change in the next session by asking the AI to quote back the amended wording.

**Rollback:** If any amendment causes unintended behaviour in the next session, revert to the pre-amendment wording below (each block shows both states).

---

## Amendment 1 — D8 (handoff format minimum + defined extensions)

**Section affected:** 0b. Session Continuity Protocol.

**Existing Format block:**

```
Format:
# Session Close — [Date]
## Decisions Made
- [Decision]: [Reasoning] → [Impact on build]
## Status Changes
- [Module/Rule]: [Old status] → [New status]
## Next Session Should
- [First thing to do]
- [Second thing to do]
## Blocked On
- [What's waiting for what]
## Open Questions
- [Unresolved items needing founder input]
```

**Replace with:**

```
Format — required minimum:
# Session Close — [Date]
## Decisions Made
- [Decision]: [Reasoning] → [Impact on build]
## Status Changes
- [Module/Rule]: [Old status] → [New status]
## Next Session Should
- [First thing to do]
- [Second thing to do]
## Blocked On
- [What's waiting for what]
## Open Questions
- [Unresolved items needing founder input]

Format — defined extensions (add these sections when the session involved code, deployment, or safety changes):
## Verification Method Used (0c Framework)
- [How the work was verified, per the work-type table]
## Risk Classification Record (0d-ii)
- [Standard / Elevated / Critical — one line per change]
## PR5 — Knowledge-Gap Carry-Forward
- [Concepts re-explained this session and their cumulative count]
## Founder Verification (Between Sessions)
- [URLs / test commands / expected results for the founder to run independently]

Rationale: the minimum is what every handoff carries. The extensions earned their place in practice and are promoted to the format for sessions where they apply. Extension use is the AI's judgement; the founder may request any extension at session close.
```

---

## Amendment 2 — D9 (PR5 wording to allow pre-population and candidate tracking)

**Section affected:** PR5 — Knowledge-Gap Carry-Forward.

**Existing block:**

```
PR5 — Knowledge-Gap Carry-Forward
Any concept requiring re-explanation in a session is flagged in the handoff note (0b) with a cumulative count. At three re-explanations, a documentation task is created in operations/knowledge-gaps.md and the concept earns a permanent entry in the Knowledge Gaps Register.

The session-opening protocol (0b, handoff read) includes a scan of operations/knowledge-gaps.md for concepts relevant to the session's scope. If any match, read the resolution before beginning work.
```

**Replace with:**

```
PR5 — Knowledge-Gap Carry-Forward
Any concept requiring re-explanation in a session is flagged in the handoff note (0b) with a cumulative count. The Knowledge Gaps Register (operations/knowledge-gaps.md) supports three entry states:
- Candidate — observed once. Logged with session, concept, and one-line note. Not yet a permanent entry.
- Candidate (2nd recurrence) — observed twice. Promoted to "watch" status with a proposed resolution sketch.
- Entry — observed three times OR pre-populated from a structured extraction pass (e.g., Build Knowledge Extraction 17 Apr 2026). Permanent entry with reasoning, examples, and resolution.

Pre-population from an extraction pass is explicitly authorised: concepts that the extraction identified as load-bearing can be entered as permanent entries without waiting for three recurrences. The extraction source is cited in the entry's provenance line.

The session-opening protocol (0b, handoff read) includes a scan of operations/knowledge-gaps.md for concepts relevant to the session's scope. If any match, read the resolution before beginning work.
```

---

## Amendment 3 — D14 (document both status taxonomies)

**Section affected:** 0a. Shared Status Vocabulary.

**Existing block (header only — add a new paragraph after the existing table):**

```
StatusMeaningScopedRequirements defined, no architecture or code yetDesignedArchitecture decided, schema/types may exist, no functional codeScaffoldedStructural code exists (files, interfaces, placeholders) but doesn't do anything yetWiredCode connects to live systems (database, API, LLM) and functions end-to-endVerifiedTested and confirmed working by both partiesLiveDeployed to production and serving real users/agents
Deliverable: Adopted vocabulary added to project instructions.
```

**Add this after the existing block:**

```
Status taxonomies are separate along two axes:
- Implementation status (this table, 0a). Applies to modules, rules, endpoints, and features. Vocabulary: Scoped → Designed → Scaffolded → Wired → Verified → Live.
- Decision status (0f). Applies to decision-log entries. Vocabulary: Adopted / Under review / Superseded by [ref]. A decision's status is about whether it currently governs — not about implementation progress.

Rule: do not mix the two. Do not describe a module as "Adopted" (a decision word) or a decision as "Live" (an implementation word). When tooling or docs need to describe both (e.g., "the R17c deletion endpoint decision is Adopted; the endpoint implementation is Scoped"), use both taxonomies explicitly.

Resolved 2026-04-24 under D14-A (discrepancy-sort 2026-04-23).
```

---

## After applying

Ask the AI in the next session to quote back the amended PR5 wording, the amended 0b format, and the new 0a paragraph to confirm the changes are visible in the system prompt. If they are not visible, the amendment did not take effect.

**Then move this file** to `/archive/2026-04-24_project-instructions-amendments-applied.md` once the founder has confirmed the amendments are applied.
