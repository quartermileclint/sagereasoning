# Next Session Prompt — After 2026-05-02 Registry v1.3.0 + Validation Addendum Close

**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Predecessor close:** `/operations/handoffs/founder/2026-05-02-registry-v1.3.0-with-alt3-addendum-close.md`.
**Working tree state at close:** 4 modified + 4 untracked + 2 new = 10 files staged for founder push (verbatim git commands in the close §6). No half-changed state.

---

## Where you left off

The validation findings from the live private mentor (recorded as `D-RAG-MENTOR-ALT3-VALIDATED-2026-04-29`) are now in three places:

1. The decision log — full reasoning, per-adjustment implementation guidance, explicit non-edit of historical Phase-1 prompt with revisit condition.
2. The alt-3 architecture handoff (`/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md`) — Validation Addendum section near top.
3. D8 rule book (`/drafts/rag-mentor-alt3/operationalised-rules.md`) — Validation Addendum section just before "Rule book overview," with implementation guidance per adjustment for the subsequent revision pass.

The component registry is at v1.3.0. Five new entries (alt-3 handoff + D2 + D3 + D8 + D24); ten existing-component blocker + notes updates capturing alt-3 future-phase impact. JSON re-validated; statusSummary `{wired: 121, verified: 30, designed: 14, live: 2, scaffolded: 1}`; total 168 components.

Git working tree at close: clean once founder pushes via GitHub Desktop per D-PR8-PUSH (commands in close §6). Until then, the four backups + apply proposal + close + this prompt are in the working tree as additions.

## Four candidate paths for the next session

The founder calls. None of these are required to land in any specific order; they're independent except where noted.

### Path A — Phase-1 session 2 (alt-3 design continuation). **Recommended.**

**Existing prompt:** `/operations/handoffs/founder/2026-05-01-rag-phase1-alt3-NEXT-SESSION-PROMPT.md`.

**Scope:** Phase-1 deliverables 4 (corpus inventory), 9 (rule dependency map / engine sequencing), 10 (Layer-1 translation), 11 (Layer-3 translation), 13 (three-tier intake clarification specification), 14a (engine substitution at /api/mentor/private/reflect), 14b (deferral-resolution build), 15 (long-deferred questions handling). The prompt as written includes audit-derived refinements per D24.

**Inputs that landed since the prompt was written (this session, 2026-05-02):**
- D8 now carries a Validation Addendum naming Rule 7/8/9 adjustments. Phase-1 session 2's deliverables that reference Rule 7/8/9 outputs (D9 engine sequencing; D11 Layer-3 projection rules; D13 trigger catalogue) should incorporate the addendum's guidance.
- Registry v1.3.0 reflects the alt-3 transitive impact; Phase-1 session 2 will read these blockers as "what's next" context.

**Risk classification:** Standard (design only; no code).

**Why recommended:** Phase 1's critical-path drafts (D2, D3, D8) are under founder review with the Validation Addendum visible; Phase-1 session 2 unblocks the remaining 19 deliverables and brings the full Phase-1 design within reach. The alternative paths can wait without blocking the architectural design progression.

### Path B — D8 revision pass

**Scope:** Dedicated session to fold the three Validation Addendum adjustments into D8's per-rule sections (Rule 9 logic; Rule 8 outputs vocabulary; Rule 7 inputs). Produces D8 v1.0.0-revised. The addendum stays at the top with a "superseded into per-rule sections" note.

**Risk classification:** Standard (design only; the rule book is `/drafts/`, not `/adopted/`).

**Why this might come first:** if you want a cleaner D8 before Phase-1 session 2 references its outputs in D9/D11/D13.

**Why this might come later:** Phase-1 session 2 doesn't directly modify Rule 7/8/9 *logic*; it builds downstream specifications. The addendum is sufficient guidance for downstream design; the per-rule revision can happen in parallel or after.

### Path C — Founder triage of D24 current-state findings

**Scope:** Walk the seven current-state findings surfaced by the audit (per D-RAG-MENTOR-ALT3-PHASE1-AUDIT-2026-05-01 §"Headline findings"):
1. Ops Hub malformed body to /api/score-decision — Standard.
2. Missing distress handling on Ops Hub callers of /api/score-decision and /api/reason — Standard-to-Elevated.
3. KG1 rule 2 candidate violations (fire-and-forget analytics inserts) on Routes 2, 3, 7 — Standard.
4. Fire-and-forget on safety-relevant distress-event log at /api/reflect — upper Long-term-regression tier per PR9.
5. user_id vs auth.user.id at /api/reflect — **Critical under PR6 (R17 perimeter)**. Most urgent; warrants its own session under Critical Change Protocol (0c-ii).
6. Partial R20a input coverage on Routes 1, 2, 6 (distress check on primary input only) — Elevated; warrants perimeter-wide policy decision.
7. (audit also names: D24 is the catalogue.)

**Risk classification:** mixed. Item 5 is Critical and must follow 0c-ii. Items 4, 6 are Elevated. Items 1, 2, 3 are Standard.

**Why this might come first:** safety-relevant findings on a live R20a perimeter route. Item 5 specifically is a known PR6/R17 issue today; every day it remains is a day a safety perimeter is partially unenforced.

**Why this might come later:** these are existing live-system bugs, not regressions from this session. They've been live since before D-RAG-MENTOR-ALT3-ADOPTED-2026-04-29 and the audit just surfaced them. Founder calls based on operational risk tolerance.

### Path D — Section 6 Class A review (still optional)

**Scope:** Walk `/operations/registry-updates/audit-2026-04-28.md` Section 6a — 62 Class A completeness candidates (substantive components without registry entries). Founder picks a batch to add; the redesigned skill handles additions as part of its run with version bump to v1.3.1 or v1.4.0.

**Risk classification:** Standard.

**Why this might come at all:** the registry's coverage of substantive components is incomplete; the Class A list is the documented gap.

**Why this might wait:** no operational pressure; v1.3.0 already added the highest-priority new entries (alt-3 governance artefacts).

## Standing reminders (carried forward)

- **Single source of truth for the registry:** `/website/public/component-registry.json`. Do not edit the HTML dashboards for content updates — rendering is derived from the JSON.
- **Pre-edit backups go to `/archive/component-registry/`** before any JSON write.
- **Decision-log entry per applied update.**
- **Provide founder with `git add / git commit` commands verbatim. Push via GitHub Desktop** per D-PR8-PUSH (sandbox cannot reliably push).
- **If `.git/index.lock` warning appears:** run `rm .git/index.lock` from Terminal at the project folder, then retry `git add`. Pattern logged as D-LOCK-CLEANUP-2026-04-26.
- **Founder verifies between sessions, not in real time.** Provide URLs and expected results for any deploy.
- **The audit skill (`sage-registry-audit`)** does not run unless founder explicitly opens its scope. The update skill is the right tool for v1.3.0+ → v1.3.1+.
- **Do not commingle alt-3 design work with registry maintenance.** The registry-update skill runs after a session of design/build work, not during it.

## At session open

Per `/adopted/session-opening-protocol.md` Part A elements 1–8:

1. Declare tier (founder + scope per chosen path).
2. Read sources per the canonical-sources tier:
   - Every session: `/manifest.md`; project instructions (system prompt); the predecessor close (`/operations/handoffs/founder/2026-05-02-registry-v1.3.0-with-alt3-addendum-close.md`).
   - Governance/design path (Paths A, B): + `/operations/decision-log.md` (last 5–6 entries; D-RAG-MENTOR-ALT3-VALIDATED + D-REGISTRY-UPDATE-v1.3.0 are the most recent); `/operations/knowledge-gaps.md`.
   - Code path (Path C, particularly item 5): + `/summary-tech-guide.md`; `/summary-tech-guide-addendum-context-and-memory.md`; `/operations/verification-framework.md`; `/website/src/lib/ai/constraints.ts` (PR4 model selection).
3. Confirm hold-point status (P0 0h still active). Confirm the chosen path's permissibility.
4. For Path C item 5: classify as Critical at session open and run 0c-ii Critical Change Protocol before any code touches the route.
5. For Paths A, B, D: classify as Standard.

End of prompt.
