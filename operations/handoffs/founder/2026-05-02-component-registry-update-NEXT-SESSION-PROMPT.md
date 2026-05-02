# Next-Session Prompt — Component Registry Update (Stream 7 — Standard Risk)

**Stream:** founder. **Tier:** founder/governance scope.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Predecessor session close:** `/operations/handoffs/founder/2026-05-02-d-a16-catalogue-assembly-close.md`.
**Predecessor decision-log entry:** `D-A16-CATALOGUE-ASSEMBLED-AND-ADOPTED-2026-05-02`.
**Operative skill:** `/.claude/skills/sage-registry-update/SKILL.md` (the registry-update skill — runs the four-pass discipline: source scan; code-grep verification; transitive impact; internal consistency).

This session is **design / housekeeping only**. No code logic changes. No live-system effect. The deliverable is a registry update (bump from v1.3.0 to v1.3.1 or v1.4.0) reflecting the file-location changes that landed on 2026-05-02. Risk classification: Standard under 0d-ii.

---

## Why this session matters

The component registry at `/website/public/component-registry.json` is the canonical map of governance documents and their locations. Two events on 2026-05-02 made the registry's `path` fields stale:

1. **The 22-file batched move** (per `D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02`). 21 alt-3 deliverable files moved from `/drafts/rag-mentor-alt3/` to `/adopted/rag-mentor-alt3/`; 1 ADR moved from `/drafts/` to `/adopted/`. The registry's entries for these files still point to `/drafts/` paths.

2. **The new D-A16 catalogue file** (per `D-A16-CATALOGUE-ASSEMBLED-AND-ADOPTED-2026-05-02`). A brand-new file at `/adopted/rag-mentor-alt3/d-a16-catalogue.md`. The registry has no entry for this file yet.

The registry is a navigator — readers (human or agent) consulting the registry to find a governance document need accurate paths. Stale `path` fields silently break that navigation. The registry-update skill's four-pass discipline (source scan; code-grep verification; transitive impact; internal consistency) is the canonical mechanism for keeping the registry sound; this session runs that discipline against the 2026-05-02 changes.

---

## Pre-conditions for this session opening

This session does not begin until:

1. **Founder push of the 2026-05-02 D-A16 commits via GitHub Desktop per D-PR8-PUSH-2026-04-26.** The new catalogue file, the decision-log entry (`D-A16-CATALOGUE-ASSEMBLED-AND-ADOPTED-2026-05-02`), the predecessor session close, and the predecessor session's input prompt must be committed and pushed before this session begins. Verbatim git commands appear in the predecessor session close §"Founder Verification" Step 5.

2. **Founder readiness for Standard-risk housekeeping work.** No Critical / Elevated changes this session; no live-system surface touched.

If pre-conditions are not met at session open, the agent's first action is to confirm with the founder which path applies. Do not proceed to registry edits on top of unpushed prior work.

---

## Part A — Open the session under the protocol

Per `/adopted/session-opening-protocol.md` Part A elements 1–8, do the full read sequence. Tier: founder/governance scope. Read:

1. **`/manifest.md`** — particularly R0 (oikeiosis), R7 (source fidelity), R8a–R8d (audience-tier glossary — applies to registry entries), KG3 (hub-label end-to-end consistency), and any Architectural Constraints relevant to documentation governance.

2. (Project instructions — already in system prompt.)

3. **`/operations/handoffs/founder/2026-05-02-d-a16-catalogue-assembly-close.md`** — the predecessor session close. Required context. Particularly §"Status Changes" (the file additions this registry update reflects) and §"Next Session Should" Candidate A.

4. **`/operations/handoffs/founder/2026-05-02-rag-phase1-completion-review-close.md`** — the prior session close (the 22-file move). Required context. Particularly §"Status Changes" and §"Stale-reference cleanup follow-ups (logged for transparency)" — item 2 names this registry update as the resolution.

5. **`/operations/decision-log.md`** — read at minimum the last 4 entries:
   - `D-A16-CATALOGUE-ASSEMBLED-AND-ADOPTED-2026-05-02`
   - `D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02`
   - `D-RAG-MENTOR-ALT3-CRITICAL-PATH-MOVED-TO-ADOPTED-2026-05-02`
   - `D-REGISTRY-UPDATE-v1.3.0-2026-05-02` (the prior registry update — establishes the v1.3.0 baseline this session bumps from)

6. **`/.claude/skills/sage-registry-update/SKILL.md`** — the operative skill. **Read in full.** This is the canonical procedure for the four-pass discipline. The agent follows the skill end-to-end.

7. **`/website/public/component-registry.json`** — the file being updated. **Read in full** at session open to understand the current shape (entries, fields, version, internal cross-references, blocker conventions, cell-level red rendering per D-REGISTRY-UPDATE-v1.2.3 + Pass-4 enhancement per same).

8. **The 23 files that need registry entries reconciled (paths after 2026-05-02 moves):**
   - `/adopted/rag-mentor-alt3/canonical-framework.md` (D2)
   - `/adopted/rag-mentor-alt3/passion-taxonomy.md` (D3)
   - `/adopted/rag-mentor-alt3/operationalised-rules.md` (D8)
   - `/adopted/rag-mentor-alt3/corpus-inventory.md` (D4)
   - `/adopted/rag-mentor-alt3/rule-dependency-map.md` (D9)
   - `/adopted/rag-mentor-alt3/layer-1-translation.md` (D10)
   - `/adopted/rag-mentor-alt3/layer-3-translation.md` (D11)
   - `/adopted/rag-mentor-alt3/three-tier-intake.md` (D13)
   - `/adopted/rag-mentor-alt3/reflect-endpoint-14a-daily-ritual.md` (D14a)
   - `/adopted/rag-mentor-alt3/reflect-endpoint-14b-deferral-resolution.md` (D14b)
   - `/adopted/rag-mentor-alt3/long-deferred-questions.md` (D15)
   - `/adopted/rag-mentor-alt3/index-schema.md` (D5)
   - `/adopted/rag-mentor-alt3/retrieval-interface.md` (D6)
   - `/adopted/rag-mentor-alt3/re-rank-design.md` (D7)
   - `/adopted/rag-mentor-alt3/strict-prompting.md` (D12)
   - `/adopted/rag-mentor-alt3/score-in-reply.md` (D16)
   - `/adopted/rag-mentor-alt3/progression-delta.md` (D17)
   - `/adopted/rag-mentor-alt3/verification.md` (D18)
   - `/adopted/rag-mentor-alt3/residual-seams.md` (D19)
   - `/adopted/rag-mentor-alt3/cost-model.md` (D20)
   - `/adopted/rag-mentor-alt3/migration-plan.md` (D21)
   - `/adopted/rag-mentor-alt3/test-plan.md` (D22)
   - `/adopted/rag-mentor-alt3/open-questions.md` (D23)
   - `/adopted/rag-mentor-alt3/consumer-workflow-audit.md` (D24)
   - `/adopted/ADR-RAG-MENTOR-ALT3-01-translation-sandwich-deterministic-engine.md` (D1 ADR)
   - **`/adopted/rag-mentor-alt3/d-a16-catalogue.md` (D-A16 — new this session, no prior registry entry)**

   Read the headers of each file (status line + cross-references block — typically first 30 lines). The skill's source scan will confirm the canonical metadata; this read is to verify the files are findable and the metadata exists.

9. **`/operations/knowledge-gaps.md`** — scan KG1–KG7 for relevance. KG3 (hub-label consistency) and KG7 (JSONB array discipline) are typically not registry-relevant; the registry is structural metadata, not runtime data. KG6 (composition order) does not apply.

10. **`/operations/handoffs/founder/2026-04-28-update-skill-redesign-and-v1.2.2-close.md`** and **`/operations/handoffs/founder/2026-04-29-blocker-convention-cell-red-rendering-Pass4-enhancement-close.md`** — the registry-update skill's redesign + Pass-4 enhancement context. **Skim** for the four-pass discipline's design rationale and the blocker/red-cell rendering convention. Not required reading; read if the skill's procedure surfaces a question that needs deeper context.

Confirm: tier, hold-point status (still active per P0 0h), model selection (no LLM model selection at session level — design only), status-vocabulary readiness, signals/risk-classification readiness.

---

## Part B — Verify state

Quick check with the founder:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git status -s
```

Expected: empty (no modifications) — the prior session's commits are pushed; the working tree is clean.

If the working tree is not clean, surface the modifications to the founder before proceeding. If `index.lock` errors appear (D-LOCK-CLEANUP-2026-04-26 pattern), call `mcp__cowork__allow_cowork_file_delete` for the lock file, then retry.

---

## Part C — Run the registry update per the skill

The session has four work passes per the skill's four-pass discipline (per D-REGISTRY-UPDATE-SKILL-REDESIGNED-2026-04-28 and D-REGISTRY-UPDATE-v1.2.3-2026-04-29 enhancements). Run the passes in the order the skill specifies. Each pass's output feeds the next.

### Pass 1 — Source scan

Walk the file tree and identify every governance document that should have a registry entry. Compare to the registry's current entries. Surface:
- **Path drift** — entries whose `path` field points to `/drafts/...` but the file is now at `/adopted/...`.
- **Missing entries** — files that exist in `/adopted/` (or `/drafts/`) but have no registry entry.
- **Orphaned entries** — registry entries pointing to files that no longer exist.

The 22 files moved 2026-05-02 should all surface as path drift (current registry has them at `/drafts/...`; they're now at `/adopted/...`). The new D-A16 catalogue should surface as a missing entry.

### Pass 2 — Code-grep verification

For each entry the registry points at, grep the codebase for references to verify the path's downstream consumers (if any). Per the skill, the registry is consumed by: documentation tooling, internal navigation tooling, and any other registry-aware reader. The grep confirms whether the path change has consumers that need updating.

For the 23 governance documents this session reconciles, the expected grep outcome is: zero downstream consumers in code (the alt-3 deliverables are governance documents, not code-referenced data files). Phase-2 build will eventually code-reference some of them; this session's grep is the audit record that no current code references them.

### Pass 3 — Transitive impact

For each entry being updated, identify whether the update's transitive impact extends beyond the registry itself. Examples:
- Does the registry feed any documentation site that needs a rebuild? (Probably no — Vercel handles Next.js builds; the registry is read at request time.)
- Does the registry affect any agent skill or contract? (Probably no — the registry is governance metadata.)
- Are there cross-references between registry entries that need updating? (Yes — the alt-3 deliverables reference each other; the registry's metadata may include cross-reference summaries that change.)

The skill's transitive impact pass is bounded — it does not chase every transitive reference but does name the next-degree dependencies the founder should know about.

### Pass 4 — Internal consistency (per D-REGISTRY-UPDATE-v1.2.3 enhancement + blocker convention)

The registry's internal consistency check verifies:
- Every entry has the required fields (id, name, path, status, last_updated, etc.).
- Cross-references between registry entries resolve.
- The blocker convention (per D-REGISTRY-UPDATE-v1.2.3) is honoured — entries that block other entries carry the explicit blocker field with the blocked entry's id.
- The cell-level red rendering (per D-REGISTRY-UPDATE-v1.2.3 Pass-4 enhancement) is applied — cells with attention-needed metadata render red; cells in canonical state render normally.

After Pass 4, the registry should be internally consistent. The skill's end-state is a v1.3.1 (or v1.4.0) registry that accurately reflects the 2026-05-02 file additions and moves.

---

## Deliverable — `/website/public/component-registry.json` updated

The registry file is updated in place. The new version number is set (v1.3.1 if the changes are minor; v1.4.0 if the skill identifies that a major bump is warranted by the addition of the new D-A16 file).

The registry's metadata block is updated:
- `version`: bumped per skill recommendation.
- `last_updated`: 2026-05-02 (or the actual date of session execution).
- `updates_in_this_version[]`: a structured list of the changes (per the skill's convention).

The registry's per-entry changes:
- 22 path field updates: from `/drafts/...` to `/adopted/...` paths.
- 1 new entry: `d-a16-catalogue.md` per the new file.
- Any cross-reference field updates the skill's Pass 4 surfaces.

---

## Part D — Decision-log entry

Append to `/operations/decision-log.md`:

`D-REGISTRY-UPDATE-v1.3.1-YYYY-MM-DD` (or v1.4.0 — depending on the skill's version-bump recommendation). The entry records:
- The four passes' findings (path drifts; missing entries; orphans; transitive impact).
- The version bump reasoning.
- Cross-references: the predecessor `D-REGISTRY-UPDATE-v1.3.0-2026-05-02` (the prior baseline); `D-A16-CATALOGUE-ASSEMBLED-AND-ADOPTED-2026-05-02` (the new entry's source); `D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02` (the 22-file move's source).
- Risk classification: Standard.

---

## Part E — Session close + next-session preparation

Produce a session close at `/operations/handoffs/founder/YYYY-MM-DD-component-registry-update-close.md` per protocol Part C. Include the standard 0b minimum (Decisions Made / Status Changes / Next Session Should / Blocked On / Open Questions) plus the extensions (Verification Method Used / Risk Classification Record / PR5 / Founder Verification).

The "Next Session Should" section recommends one of the remaining candidates from the predecessor session close §"Next Session Should":

- **Candidate B** — D2 amendment session for the 5 D24 coverage gaps (Elevated risk).
- **Candidate C** — `/api/reason` snapshot session (Standard risk).
- **Candidate D** — Validation Addendum third-recurrence promotion session (Standard risk).
- **Candidate E** — P2 task 2c encryption wiring session (Critical risk; Phase-2 pass-1 precondition).
- **Candidate F** — Phase-2 pass 1 commencement (Critical risk; pending Candidates E + B).

Founder calls the next session's scope based on observed time budget and priority.

---

## Important context

- **Founder is a non-coder.** Plain-language explanations of every decision. Define every technical term the first time it appears (registry, four-pass discipline, blocker convention, cell-level red rendering, transitive impact, etc.). The skill's procedure is the agent's structured work; the founder reviews findings before commits.
- **Founder decides direction.** Where the four-pass discipline surfaces ambiguity (e.g., is this minor or major version bump?), the agent surfaces options with reasoning; the founder calls.
- **Standard risk only.** This session does not touch any code logic, any live-system surface, any auth/encryption/session/redirect surface, any database schema, any deployment configuration. It updates a single JSON file (`/website/public/component-registry.json`) and appends a decision-log entry.
- **The registry is read at request time** — there is no build step that bakes it into a deployed artefact. Vercel deploys the JSON file as-is. The change takes effect on push.
- **No founder concept re-explanation expected this session.** The skill's procedure is documented; the agent follows it. If a concept does need re-explanation, flag it for PR5.
- **Risk classification:** every change Standard under 0d-ii.

---

## Standing reminders

- Single source of truth for governance metadata: `/website/public/component-registry.json`. Cross-reference, don't duplicate, content between deliverables.
- Decision-log entry per session per PR7 — including for explicitly deferred decisions.
- Provide the founder with verification methods (URLs, expected results, copy-paste commands) for any work that touches a live surface. This session should not touch live surfaces; if any work would, surface it as a scope question and pause.
- Do not propose changes to any /adopted/ governance document this session beyond what the registry update mechanically requires (path-field metadata; cross-reference summaries surfaced by the skill). Substantive edits to governance documents are separate decisions.
- Do not commence Phase-2 build during this session. Phase-2 commences as its own Critical-risk session per D21's migration plan.
- Do not promote the Validation Addendum to a separate alt-3 architectural-conventions catalogue this session. Stream 8 — separate session per founder call.
- If the registry-update skill's procedure surfaces a need that exceeds the skill's scope (e.g., an entirely new field type), surface it as a scope question for the founder before proceeding.

---

## Forecast

After this session lands:

- `/website/public/component-registry.json` is at v1.3.1 (or v1.4.0) with all 23 alt-3-tier-1 governance documents (the 22 moved + 1 new D-A16 catalogue) accurately registered.
- Stale-reference cleanup follow-up item from `D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02` §"Stale-reference cleanup follow-ups" item 2 is resolved.
- A new decision-log entry records the registry update.
- A new session close documents the work.
- One of Candidates B–F is named as the next session's recommended scope.

Phase-2 pass-1 readiness inventory after this session:

| Precondition | Status |
|---|---|
| All 26 Phase-1 + D-A16 deliverables Adopted | ✅ Complete (post-2026-05-02 D-A16 session) |
| D-A16 catalogue minimum (EUPATHEIA_BOUNDARY + PRAXIS_MOTIVATION_AMBIGUITY stems) | ✅ Complete (per D-A16 session) |
| `/api/mentor/private/reflect` snapshot | ✅ Complete (D-MENTOR-PRIVATE-REFLECT-PRE-ALT3-SNAPSHOT-2026-05-02) |
| **Component registry up-to-date** | ✅ **Complete (this session)** |
| `/api/reason` snapshot | ⚠️ Pending — Candidate C (not pass-1 blocking; pass-3 blocking) |
| P2 task 2c encryption wiring | ⚠️ Pending — Candidate E (Critical-risk task) |
| Founder approval of pass-1 Critical Change Protocol responses | ⚠️ Pending — happens at pass-1 commencement session itself |

After Candidate E (encryption wiring) lands, Phase-2 pass 1 is unblocked subject only to founder approval of pass-1's Critical Change Protocol responses at the commencement session.

---

End of prompt. Confirm receipt and full Part A read before proceeding to Part B.
