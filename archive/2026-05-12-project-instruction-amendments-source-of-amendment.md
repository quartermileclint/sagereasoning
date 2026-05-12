# Project-Instruction Amendments — ST2 Output (2026-05-12)

**Status:** Drafted 2026-05-12 during ST2 Phase 4. Triage decisions per ST2 Phase 3.
**Risk classification:** Standard (drafting). `/drafts/` → project-instruction move is Elevated per standing cache.
**Source:** Founder elections in ST2 Phase 3 chat record + ST2 close note.
**Adoption pre-conditions:** see `/drafts/2026-05-12-amendment-adoption-checklist.md`.

---

## Plain-language summary

Project-instruction amendments add **seven new Process Rules** (PR10 — PEV loop; PR11-PR15 — Standing Requirements; PR16 — Outcomes grader option) and update the AI signals table with a diagnostic-certainty signal. Two minor housekeeping items (risk-classification correction; v2 prompt wording inaccuracy) are recorded as observations.

The Standing Requirements (SR1, SR1a, SR2, SR3, SR4, SR5) get promoted from session-open commitments to permanent project-instruction Process Rules per ST2 Phase 3 Q8 election. The promotion turns "stated aloud at session open" into "rules that govern across all sessions."

---

## PR10 — PEV loop + diagnostic-certainty patterns (NEW)

**Source:** ST2 Phase 3 Step 5 Candidate 16 (ALLOW as new PR10).

**Rule text (draft for project-instructions):**

> **PR10 — Plan → Execute → Verify (PEV) loop with diagnostic-certainty signalling.**
>
> Code work follows the PEV loop:
>
> 1. **Plan** — name the change, what could break, the rollback path, the verification step. For Critical-tier changes this is the Critical Change Protocol (0c-ii); for Elevated and Standard it is a lean version.
> 2. **Execute** — write the change. Single-endpoint-proof discipline (PR1) applies; build-to-wire-verification-immediate (PR2) applies.
> 3. **Verify** — run the verification step before declaring the work done. If verification produces a diagnostic finding, classify the finding's certainty:
>    - **Diagnostic-certain** — root cause identified; the change addresses the root cause
>    - **Diagnostic-uncertain — symptom level** — change addresses observed symptom but root cause not confirmed
>    - **Diagnostic-uncertain — pattern level** — change matches a known pattern but applicability uncertain
>
>    Symptom-level and pattern-level findings require explicit founder acknowledgement before being treated as resolved.
>
> **Rationale:** addresses the architectural-debugging-gap from the vibe-coding-debugging community pattern. Cursor's minimal-disruption + Windsurf's diagnostic-certainty + Karpathy's agentic-engineering principle ("the model is the orchestrator, not the source of knowledge") all converge on this discipline.
>
> **Engagement:** every code-elevated and code-critical session. Standard-risk code work follows abbreviated PEV (Plan and Verify steps may be implicit; Execute step still subject to PR1 + PR2).

---

## PR11 — SR1 Authoritative-current-sources rule (NEW)

**Source:** ST2 Phase 3 Q8 election (Adopt SR1-SR5 as PR11-PR15).

**Rule text (draft):**

> **PR11 — Authoritative-current-sources rule.**
>
> Before recommending any approach in a session, the AI consults:
> - (a) Anthropic developer documentation: `docs.anthropic.com`, `docs.claude.com`, `platform.claude.com`, `anthropic.com/news`, `anthropic.com/engineering`
> - (b) Founder-subscribed sources: Nate B. Jones's Substack (`natesnewsletter.substack.com`); `promptkit.natebjones.com`
> - (c) `/inbox/` for files dated since last session (scanned automatically at session open)
> - (d) Industry release-aggregators (`releasebot.io/updates/anthropic`)
>
> The consultation is performed before stating a recommendation; the consultation's findings are summarised inline. If no consultation is performed (e.g., the recommendation rests entirely on prior session context with no new information needed), this is stated explicitly.

---

## PR12 — SR1a Negative-finding discipline (NEW)

**Rule text (draft):**

> **PR12 — Negative-finding discipline.**
>
> When a search returns no results for a feature the founder mentions or prior context suggests should exist, the AI presumes the search was inadequate before concluding the feature doesn't exist:
> 1. Try at least three queries with different keywords
> 2. Try official documentation URL patterns (predictable paths for the platform in question)
> 3. Try industry news venues without domain restriction
> 4. State "I couldn't find this with the queries I tried; the feature may still exist" rather than "I cannot find this feature in the documentation"
>
> Rationale: the 2026-05-10 Anthropic-features-survey omission (Dreams + Outcomes + Multi-agent orchestration missed) was caused by inadequate negative-finding discipline. Codifying the discipline prevents recurrence.

---

## PR13 — SR2 Consider-implications five-question assessment (NEW)

**Rule text (draft):**

> **PR13 — Consider-implications five-question assessment.**
>
> After any web-search or document-read produces material findings, the AI explicitly states:
> 1. Does this contradict a prior decision?
> 2. Does this refine or improve a prior decision?
> 3. Does this affect work in flight in this session?
> 4. Does this affect future-stage work?
> 5. Does this affect operational discipline (caches; protocols; verification)?
>
> Even "no impact" is stated explicitly. Material findings are those that would change a decision if known earlier.

---

## PR14 — SR3 Proactive surfacing of ten domains (NEW)

**Rule text (draft):**

> **PR14 — Proactive surfacing of ten domains.**
>
> When scoping a stress-test or gap-analysis session, the AI proactively surfaces gaps across ten default domains: Security; Regulatory + compliance; Accessibility; Privacy by design; Observability + SRE; Legal entity + tax structure; Insurance; Marketplace economics + dispute resolution; Onboarding UX; Anthropic-native capabilities.
>
> Additional domains may be added per session; existing domains may be folded into adjacent ones; the default ten anchors the scope.

---

## PR15 — SR4 Bias toward existing Anthropic infrastructure (NEW)

**Rule text (draft):**

> **PR15 — Bias toward existing Anthropic infrastructure.**
>
> Before proposing any bespoke build, the AI evaluates whether existing Anthropic infrastructure delivers the same outcome with less custom work. Candidate infrastructures include: Claude Code commands; sub-agents; skills; managed agents; MCP servers; SDK patterns; Plugin spec; Dreams; Outcomes; Multi-agent orchestration.
>
> Existing infrastructure is the default; bespoke work is the alternative requiring justification. Justification is recorded in the decision log when bespoke is elected.

---

## PR16 — SR5 Positioning + dogfood lens (NEW)

**Rule text (draft):**

> **PR16 — Positioning + dogfood lens at every triage decision.**
>
> For each amendment, ADR, or design decision, the AI flags:
> - **Positioning impact** — strengthens / weakens / neutral for "Character Kernel / Judgment + Continuity primitive" positioning (R18a category label)
> - **Dogfood relevance** — substrate-consultable via `/api/reason`? (yes / no / partial)
>
> When dogfood relevance is high and the decision is kathekon-laden, the AI offers substrate consultation as an option. Founder elects whether and when to consult.

---

## AI signals table — UPDATE (diagnostic-certainty)

**Source:** ST2 Phase 3 Step 5 Candidate 16 (PR10 PEV loop).

Add the following rows to the AI signals table (project-instructions §"AI signals"):

| Signal | Meaning |
|---|---|
| "Diagnostic-certain — root cause identified" | I've isolated the root cause; the proposed change addresses it directly |
| "Diagnostic-uncertain — symptom level" | I can describe the symptom; root cause is not yet confirmed; the proposed change addresses the symptom |
| "Diagnostic-uncertain — pattern level" | The situation matches a known pattern; applicability to *this* case is not confirmed |

---

## Housekeeping observations (NOT amendments; recorded for completeness)

### Observation 1 — Risk-classification correction candidate (Q1 carry-forward from ST1)

The 2026-05-12 entry `D-STRESS-TEST-PROMPT-V2-ADOPTED-V1-ARCHIVED-2026-05-12` classified the v1→archive move as **Standard.** Per standing protocol cache risk table, "Move file from `/drafts/` to `/adopted/` or to `/archive/`" is **Elevated.**

**Operational impact:** none. **Audit-trail consistency:** appending a brief `D-CLASSIFICATION-CORRECTION-2026-05-12` entry to the decision log naming the Standard → Elevated correction is the lean form.

**Status:** observation in this draft; founder elects whether to append the correction entry at ST2 close.

### Observation 2 — v2 prompt wording inaccuracy (Q2 carry-forward from ST1)

The 2026-05-10 stress-test prompt v2 names "/manifest.md Process Rules section." Process Rules (PR1-PR9) actually live in project instructions, not the manifest.

**Operational impact:** none (doesn't affect any work). **Documentation hygiene:** flagged for v3 prompt revision if a v3 is authored; no standalone amendment needed.

**Status:** observation; no action required this session.

---

## Cross-references

- ST2 close note: `/operations/handoffs/founder/2026-05-12-build-plan-stress-test-ST2-close.md`
- Staging plan amendments: `/drafts/2026-05-12-staging-plan-amendments.md`
- Manifest amendments: `/drafts/2026-05-12-manifest-amendments.md`
- Adoption checklist: `/drafts/2026-05-12-amendment-adoption-checklist.md`
- v2 prompt: `/operations/handoffs/founder/2026-05-10-build-plan-stress-test-NEXT-SESSION-PROMPT-v2.md`
- ST1 close: `/operations/handoffs/founder/2026-05-12-build-plan-stress-test-ST1-close.md`
- Existing project instructions: Cowork project-instructions surface (not in repo)
- Decision log entry: `D-STRESS-TEST-STAGING-PLAN-AMENDMENTS-2026-05-12` (appended at ST2 close)

---

*End of project-instruction amendments draft. Adoption is a separate Elevated-risk operation per standing cache. Adoption pre-conditions in adoption checklist.*
