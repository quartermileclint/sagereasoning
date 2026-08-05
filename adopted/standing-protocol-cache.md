# Standing Protocol Cache

**Status:** Adopted 2026-05-03 under `D-PHASE-2-PASS-1-REPLAN-EFFICIENCY-REFINEMENT-2026-05-03`. **Amended 2026-05-12 under `D-CACHE-DRIFT-RESOLVED-2026-05-12`** to incorporate ST2 changes: AI signals table extended with three diagnostic-certainty rows; manifest range updated (AC1–AC13); process-rule range updated (PR1–PR16); project-instructions surface now `/adopted/project-instructions-snapshot.md` (first repo-tracked snapshot, created at ST2 adoption); cross-references updated for new ADR (J1 Character Kernel) and amended staging plan. **Amended 2026-05-14 under `D-CACHE-DRIFT-RESOLVED-2026-05-14`** to incorporate the Anthropic-native posture session changes: `/CLAUDE.md` entry-point file created at repo root for Claude Code sessions; 17 Anthropic skills installed at `/.claude/skills/anthropic/`; PR15 amended (operational discipline mandating consultation of `.claude/skills/anthropic/` + agentic-commerce-findings tracker before bespoke election). **Amended 2026-06-10 under `D-PR18-ADOPTED-CLOSE-TIME-PRODUCTION-STATE-2026-06-10`** (same-session cache update per the update discipline): process-rule range PR1–PR18; PR18 = production-state blocks are close-time artifacts. **Amended 2026-07-21 under `D-CACHE-DRIFT-RESOLVED-2026-07-21`** (same-session cache update per the update discipline, P3 of the Agent-Organization + Evidence Program): process-rule range PR1–PR19; PR19 = independent adversarial review is required (not optional) before a trust-core/predicate/fold/engine change or a live-op-consequential build plan is treated as verified, with a codified spend-limit-outage fallback and a reusable review-workflow template at `operations/review-harness/independent-review-workflow-template.md`. **Amended 2026-08-04 under `D-PR20-ADOPTED-MENTOR-BRIEF-ARCHITECTURAL-SURFACES-2026-08-04`** (same-session cache update per the update discipline, following the Stoa Q5c/Q13a floor-creation finding): process-rule range PR1–PR20; PR20 = a mentor-consultation brief on any question with an architectural consequence must name the specific existing mechanisms (one-sentence, mechanism-level facts about current behaviour) the ruling will land on, so a downstream consequence the mentor cannot see from the question alone is visible before the ruling is given, not discovered afterward by PR19 adversarial review.
**Governs:** Session-opening overhead. Replaces full re-reads of the manifest + session-opening protocol + knowledge-gaps register at every session open with a one-stop reference. Full re-reads only when work specifically requires it.
**Does not govern:** What gets built (manifest's remit) or how to work together (project instructions' remit). The full governance documents remain authoritative when this cache flags a change or when work touches a surface this cache does not pre-resolve.
**Update discipline:** When the manifest, session-opening protocol, project instructions, or knowledge-gaps register changes, this cache must be updated in the same session as the change (Standard-risk amendment). Cache drift is logged via a `D-CACHE-DRIFT-…` entry.

---

## How to use this cache at session open

1. **Tier declaration** (protocol element 1) — state stream + work-category. Match against §"Work categories" below.
2. **Read this cache** (~3 min). Stand on the standing answers below for elements 2–8 unless the day's work touches a surface flagged "re-read full".
3. **Read the day's primary deliverable in full** (the deliverable-of-the-day for the substantive work). The cache does not replace this.
4. **Read the predecessor session close** (~5 min). Stop there if the predecessor's "Next Session Should" block is unambiguous.
5. **Confirm at session open**: tier; hold-point status (P0 0h); model selection per AC1 table below; status vocabulary; signals + risk classification.

If any standing answer below is contested by the day's work or by founder direction, treat the cache as overridable and re-read the underlying governance document.

**Mode-specific note (added 2026-05-14):** For Claude Code sessions, `/CLAUDE.md` at repo root is the auto-loaded entry point (Claude Code's special handling). It points at this cache and the other governance surfaces below; it is supplementary, not authoritative. For Cowork mode sessions, the project-instructions panel is the operative surface; the founder paste-syncs it against `/adopted/project-instructions-snapshot.md` between sessions. This cache is the heavy-lifter for both modes.

---

## Work categories

Each session declares one of these at open. The category determines which rules engage and which template form applies.

| Category | Description | Risk default | Template form |
|---|---|---|---|
| `governance` | Documentation-only changes (decision-log, deliverables, ADRs, this cache) | Standard | Lean |
| `schema` | Supabase DDL via SQL Editor; idempotent migrations | Standard | Lean |
| `code-standard` | New module / function / route stub; no auth/encryption/safety surface | Standard | Lean |
| `code-elevated` | Changes to existing user-facing functionality; new external dependencies | Elevated | Lean + Elevated additions |
| `code-critical` | Auth, session, encryption, R20a perimeter, deployment configuration, env-flag activation | Critical | **Full** (per the existing protocol) |
| `registry` | `component-registry.json` updates | Standard | Lean (per the registry skill) |
| `archive` | Move file from `/drafts/` to `/adopted/` or to `/archive/` | Elevated | Lean + archive note |

A session may span multiple categories; the highest-risk category sets the template form for the session as a whole.

---

## Standing answers — Part A elements 2–8

### Element 2 — Canonical-source read sequence

**Standing answer:** the full read sequence in `/adopted/canonical-sources.md` is replaced by this cache for `governance` / `schema` / `code-standard` / `registry` / `archive` categories. Read the cache + the day's primary deliverable + predecessor close.

For `code-elevated` and `code-critical` categories, also read in full: the manifest's relevant rules; the protocol's Part B + C elements that engage; any deliverable that names architectural constraints (AC1–AC8); the predecessor session close; the operational deliverable spec.

### Element 3 — Handoff read

Always read the most recent handoff in `/operations/handoffs/[stream]/` for the session's stream. Authoritative for the session's opening scope.

### Element 4 — Knowledge-gaps scan (PR5)

| KG | Scope | When to engage |
|---|---|---|
| **KG1** Vercel five rules | Application code touching DB writes, redirects, headers, file paths | Any `code-*` category that touches DB writes |
| **KG2** Haiku reliability boundary | LLM model selection | Any session that names a model |
| **KG3** Hub-label end-to-end contract | `mentor_interactions` writes/reads with hub labels | Any session touching hub-scoped readers |
| **KG4** Capability-matrix cell vocabulary | Capability matrix updates | Capability-matrix work |
| **KG5** Token-counts method | Token reporting | Sessions that report token counts |
| **KG6** Context-layer composition | Adding/moving context layers | Sessions that change context architecture |
| **KG7** JSONB storage format | INSERT/UPDATE against JSONB columns | Sessions with JSONB writes |

For `governance` / `archive` / `registry` sessions: KGs are typically N/A. Confirm at session open.

### Element 5 — Hold-point status (P0 0h)

**Standing answer until P1 commences:** P0 0h hold-point is active. R&D-phase work is permissible. Production-affecting changes require the Critical Change Protocol where 0d-ii names them Critical.

When P1 commences (the founder's call), update this section.

### Element 6 — Model selection (PR4)

| Operation category | Model | Rationale |
|---|---|---|
| Safety-critical (R20a distress classifier) | **Haiku** (FastModel) | Per AC1 + KG2 — single 3-field JSON output is within Haiku's reliability boundary; type-enforced via `constraints.ts` `SafetyCriticalCallParams`. |
| Layer 1 translation (alt-3) | **Sonnet** (DeepModel) | Per AC1 — multi-step structured feature extraction; Haiku unreliable. |
| Engine rule LLM-supplemented sub-steps | **Sonnet** | Per AC1 — multi-mechanism reasoning. |
| Layer 3 translation (alt-3) | **Sonnet** | Per AC1 — per-consumer prose generation requires reliable structured output. |
| Mentor reflection / private mentor (V3 existing) | **Sonnet** | Per AC1 — existing precedent at `/api/mentor/private/reflect` (`claude-sonnet-4-6`). |
| Quick-depth assessment (`/api/reason` quick) | **Haiku** | Per AC1 — single-mechanism output within boundary. |
| Standard / deep assessment | **Sonnet** | Per AC1 — multi-mechanism. |
| Documentation, schema migration, registry update | **N/A** | No LLM calls. |

The branded type system in `/website/src/lib/constraints.ts` enforces this at compile time. Document model selection in any session that names one; cite the row above.

### Element 7 — Status vocabulary (0a + 0f, D14)

**Standing answer:** two separate taxonomies; never mixed.

- **Implementation status** (modules, rules, endpoints, features): `Scoped → Designed → Scaffolded → Wired → Verified → Live`.
- **Decision status** (decision-log entries): `Adopted` / `Under review` / `Superseded by [ref]`.

A decision can be `Adopted` while the implementation it names is only `Designed` or `Scaffolded`. Use both taxonomies explicitly when both apply. Lesson from this session's scope-block finding: `Designed` is not `Scaffolded`. A build prompt that names "stitching pre-existing modules" must verify the substrate is at least `Scaffolded` before naming the step.

### Element 8 — Signals and risk classification

**AI signals:**

| Signal | Meaning |
|---|---|
| "I'm confident" | Verified and reliable |
| "I'm making an assumption" | Proceeding on incomplete information — correct me if wrong |
| "I need your input" | Can't proceed without a decision |
| "I'd push back on this" | I think there's a better approach and want to explain why |
| "This is a limitation" | I can't do this / outside what I can verify |
| "This change has a known risk" | I'm confident in the approach but want to name a specific failure mode |
| "I caused this" | The problem is a result of a change I made, not something on your end |
| "Diagnostic-certain — root cause identified" | I've isolated the root cause; the proposed change addresses it directly (per PR10 PEV-loop Verify step; added ST2 2026-05-12) |
| "Diagnostic-uncertain — symptom level" | I can describe the symptom; root cause not yet confirmed; the proposed change addresses the symptom. Founder acknowledgement required before treating as resolved (per PR10; added ST2 2026-05-12) |
| "Diagnostic-uncertain — pattern level" | The situation matches a known pattern; applicability to *this* case is not confirmed. Founder acknowledgement required before treating as resolved (per PR10; added ST2 2026-05-12) |

**Founder signals:**

| Signal | Meaning |
|---|---|
| "Explore this" | Think + present options; don't build |
| "Design this" | Produce architecture; don't write code yet |
| "Build this" | Write functional code; wire it up |
| "Ship this" | Deploy to production |
| "I've decided" | Decision is final; execute without re-debating |
| "I'm thinking out loud" | Don't act; I'm processing |
| "I'm done for now" | Stabilise + close; do not propose additional fixes |
| "Treat this as critical" | Reclassify upward; follow Critical Change Protocol |

**Risk classification (0d-ii) defaults:**

| Change | Classification |
|---|---|
| Documentation, decision-log entries, deliverable drafts | Standard |
| Idempotent schema migration | Standard |
| New module / function / route file (not yet wired) | Standard |
| Registry update (`component-registry.json`) | Standard |
| Move file from `/drafts/` to `/adopted/` or to `/archive/` | Elevated |
| Changes to existing user-facing functionality | Elevated |
| Database schema changes affecting existing tables | Elevated |
| New external dependencies | Elevated |
| Auth, session, encryption, access-control changes | **Critical** (per PR6 + AC7) |
| R20a perimeter changes (incl. ninth-route addition) | **Critical** (per PR6 + AC5) |
| Deployment-configuration changes (env flags activating new surfaces) | **Critical** |
| Data deletion functionality | **Critical** |

The founder may reclassify upward at any time. Urgency does not reduce classification.

---

## AI failure modes to watch for at session open (added 2026-05-27)

Patterns the AI has demonstrated in this project and is now required to actively guard against. Read at session open. The right-hand column lists short **redirect phrases the founder can drop into chat at any moment to force re-grounding** — no technical knowledge required.

| Pattern | What it looks like | Founder redirect phrase |
|---|---|---|
| **Prescribe-before-grounding** (KG-EX1) | The AI recommends removing / retiring / simplifying / consolidating something — *before* asking what it's for or inspecting read-only. Or it picks a tidy default framing before confirming founder intent. | *"Are you grounding this in my purpose first?"* |
| **Narrow unit of analysis** (KG-EX1 sub-form) | The AI assesses a per-component property when the founder's concern is the flow / configuration / user-facing whole. Treats per-component findings as the verdict instead of as input. Misses the audience dimension (human user message vs agent developer notification). | *"What's the unit of analysis here?"* |
| **Method/test/frame before purpose** (KG-EX1 root — recurred ≥5× Apr→Jun, incl. the P1 & S6 benchmarks *after* this table existed) | The AI picks a **test method, benchmark axis, skill scope, diagnostic unit, or verification query** before grounding what the thing is *for* + what observable proves it. Most expensive form: **testing a *measure* as an *intervention*** — a comparative "does it beat baseline" benchmark on something whose value is measurement/fidelity, which reads a structurally-guaranteed false "no benefit." | *"What's the purpose + the observable, before the method?"* · *"Are we testing this as an instrument or an intervention?"* · *"If it passes, could it have passed while broken?"* |
| **One-line operational hand-off** (PR17) | The AI defers founder-performed setup (env standup, dashboards, credentials, deployment) to a single line in a close or prompt instead of walking the founder through it live. Pointing at a checklist counts as a one-liner. | *"Are you reducing this to a one-line hand-off?"* |

Two general phrases for when the founder loses the thread:
- *"Where are we in the arc?"* — forces the AI to recite carried-forward state (current arc; queued items; what's awaiting the founder vs the AI).
- *"What's queued behind this?"* — forces the AI to surface the backlog (carried-forward + deferred items).

**At session open the AI also narrates, before any substantive work:** where we are in the arc; what's queued; what's awaiting the founder; what's awaiting the AI. This is the founder's primary handhold across sessions (the AI has no persistent memory; the docs are its memory).

**Sources:** PR17 (`D-PR17-ADOPTED-WALKTHROUGH-2026-05-27`); KG-EX1 (`/operations/knowledge-gaps.md` §"Permanent Entries (Beyond KG1–KG7)"); session debrief (`/operations/session-debriefs/2026-05-27_c2-r20a-perimeter-and-meta-debrief.md`); the **2026-06-24 generalization** of KG-EX1 to the root *method-before-purpose* failure (`D-AI-FAILURE-MODE-METHOD-BEFORE-PURPOSE-GENERALISED-2026-06-24`) — the "Method/test/frame before purpose" row + the instrument-vs-intervention redirect.

---

## Lean templates — Standard + Elevated risk (Sub-sessions A–G)

These apply to all categories except `code-critical`. For `code-critical`, use the full templates per the existing protocol.

### Lean decision-log entry (~20–30 lines)

```
## YYYY-MM-DD — D-<NAME>

**Decision:** <one sentence stating what was decided>

**Reasoning:** <one or two sentences naming the why; cross-reference predecessor entries by ID>

**Files touched:**
- <path 1> — <one-line description of the change>
- <path 2> — <one-line description>

**Risk classification:** <Standard / Elevated> under 0d-ii. <one-line reason — e.g., "Idempotent schema migration; reversible via DROP TABLE">. AC7 not engaged. PR6 not engaged.

**Rollback path:** <one or two sentences>

**Verification step (founder-performable):**
\`\`\`
<commands or queries the founder runs to verify>
\`\`\`
Expected: <expected output, succinct>

**Open questions:** <if any — bullet list with revisit conditions; omit section if none>

**Rules served:** <comma-separated list of R-codes + KG-codes + PR-codes that engaged this session, no prose>

**Status:** Adopted. Cross-references: <predecessor entry IDs + relevant deliverable paths, comma-separated>.
```

### Lean session close (~40–60 lines)

```
# Session Close — <Date> — <Title>

**Stream:** founder.
**Governing frame:** /adopted/session-opening-protocol.md (cached via /adopted/standing-protocol-cache.md).
**Tier:** <category> — <Standard / Elevated> risk.
**Date:** YYYY-MM-DD.

## Decisions Made
- D-<NAME>-YYYY-MM-DD appended (+N lines). <one-sentence summary>.

## Status Changes
| Item | Old | New |
|---|---|---|
| <module/file/feature> | <old status> | <new status> |

## Next Session Should
<paragraph naming the next sub-session, its risk, its estimated time, and its pre-conditions. Reference the next-session prompt by path.>

## Blocked On
**Files remaining uncommitted:**
- <path>
- <path>

**Production state at session close:** <one or two sentences — Vercel state, Supabase state, AC7 disposition>.

## Open Questions
<if any — bullet list with revisit conditions; omit section if none>

## Founder Verification
\`\`\`
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add <paths>
git commit -m "<commit message>"
\`\`\`
Then push via GitHub Desktop. <one-line note about Vercel expectation>.

## Cross-references
- <predecessor close path>
- <next-session prompt path>
- <decision-log entry ID>
- <relevant deliverable paths>

*End of session close. <one-sentence stabilisation summary>.*
```

### Lean next-session prompt (~70–120 lines)

```
# Next-Session Prompt — <Sub-session label>: <Title>

**Stream:** founder.
**Tier:** <category>.
**Governing frame:** /adopted/standing-protocol-cache.md (full governance via the cache; deliverable-of-the-day named below).
**Predecessor session close:** <path>.
**Predecessor decision-log entries:** <list>.
**Risk classification:** <Standard / Elevated> under 0d-ii. <Critical Change Protocol NOT engaged | Critical Change Protocol applies — see Section X>.

## Why this session matters
<short paragraph — 3-5 sentences>

## Pre-conditions
1. <pre-condition>
2. <pre-condition>
3. <pre-condition>

## Part A — Open under the protocol
Read in order:
1. /adopted/standing-protocol-cache.md (~3 min — confirms tier, model selection, risk class, signals)
2. <predecessor close path> (~5 min)
3. <deliverable-of-the-day path> — read in full
4. /operations/decision-log.md last 2 entries

Confirm at open: tier; hold-point status; model selection (cite cache row); status vocabulary; signals/risk class.

## Part B — Procedure
### Step 1 — <name>
<concise procedure>

### Step 2 — <name>
<concise procedure>

### Step 3 — <name>
<concise procedure>

### Step 4 — Verify
<verification queries / commands with expected results>

### Step 5 — Append decision-log entry (lean form)
Pattern: per /adopted/standing-protocol-cache.md §"Lean decision-log entry".

### Step 6 — Session close (lean form)
Pattern: per /adopted/standing-protocol-cache.md §"Lean session close".

## Part C — Anticipated session shape
| Phase | Estimate |
|---|---|
| Cache + predecessor close + deliverable read | 15-20 min |
| Step 1 | <est> |
| Step 2 | <est> |
| Step 3 | <est> |
| Step 4 verify | <est> |
| Decision-log + close | 20-30 min |
| **Total** | **~X hours** |

## Rollback path
<one or two sentences>

## Forecast
<two or three sentences naming what success looks like and what comes next>

End of prompt.
```

---

## Critical-risk sessions (Sub-session H + future Critical work)

Critical sessions keep the **full** templates per the existing protocol. The Critical Change Protocol (project instructions 0c-ii) governs:

1. What is changing — plain language
2. What could break — specific failure modes
3. What happens to existing sessions
4. Rollback plan
5. Verification step
6. Explicit founder approval specific to named risks

Cite this section at the start of any Critical session prompt as a pointer; do not abbreviate the protocol itself.

The full session close for a Critical session includes the additional sections per the predecessor encryption-wiring close: Verification Method Used, Risk Classification Record, PR5 Knowledge-Gap Carry-Forward, Founder Verification (Between Sessions), Orchestration Reminder.

---

## Cache update discipline

When any of the following changes:

- Manifest rules (R0–R20, AC1–AC13, KG1–KG7) — AC9–AC13 added under ST2 2026-05-12
- Session-opening protocol (Parts A, B, C; the 21 elements)
- Project instructions (this version is per `/adopted/project-instructions-snapshot.md` — first repo-tracked snapshot created 2026-05-12 under ST2; PR15 amended 2026-05-14 under `D-PR15-AMENDED-FROM-ANTHROPIC-NATIVE-2026-05-14`)
- Process rules (PR1–PR20) — PR10–PR16 added under ST2 2026-05-12; PR15 amended 2026-05-14; PR17 (founder-performed operational steps walked through live, not handed off) added 2026-05-27 under `D-PR17-ADOPTED-WALKTHROUGH-2026-05-27`; PR18 (production-state blocks are close-time artifacts — rewritten only at session close, only from the decision log + that session's verified observations, always carrying an as-of date) added 2026-06-10 under `D-PR18-ADOPTED-CLOSE-TIME-PRODUCTION-STATE-2026-06-10`; PR19 (independent adversarial review is required, not optional, before a trust-core/predicate/fold/engine change or a live-op-consequential build plan is treated as verified; codifies the spend-limit-outage first-hand fallback + a mandatory-not-recommended independent re-run before downstream reliance; reusable template at `operations/review-harness/independent-review-workflow-template.md`) added 2026-07-21 under `D-PR19-ADOPTED-INDEPENDENT-REVIEW-REQUIRED-2026-07-21`; PR20 (a mentor-consultation brief on any question with an architectural consequence must name the specific existing mechanisms — one-sentence, mechanism-level facts about current behaviour — the ruling will land on, so a downstream consequence is visible before the ruling is given, not discovered afterward by PR19 adversarial review) added 2026-08-04 under `D-PR20-ADOPTED-MENTOR-BRIEF-ARCHITECTURAL-SURFACES-2026-08-04`

…update this cache **in the same session as the governance change**. The update is Standard risk per 0d-ii. Append `D-CACHE-DRIFT-RESOLVED-YYYY-MM-DD` entry to the decision log naming the cache-update step.

If the cache and the governance documents diverge, the governance documents are authoritative. The cache is a reference convenience, not a substitute.

---

## Cross-references

- `/CLAUDE.md` — entry-point file for Claude Code sessions (auto-loaded by Claude Code's special handling); created 2026-05-14 under `D-ANTHROPIC-NATIVE-POSTURE-2026-05-14`. Pointer file, not the governing surface itself.
- `/.claude/skills/anthropic/` — 17 official Anthropic skills installed 2026-05-14; consulted before bespoke election per PR15. See `/.claude/skills/anthropic/README.md` for the full table + update instructions.
- `/manifest.md` — full manifest (R0–R20, AC1–AC13, KG1–KG7; AC9-AC13 added under ST2 2026-05-12; R17g/h/i + R18e added; R18f + R19e added 2026-05-23; R20a perimeter potential-broadening placeholder)
- `/adopted/project-instructions-snapshot.md` — first repo-tracked snapshot of project instructions; created under ST2 2026-05-12; PR15 amended 2026-05-14. Authoritative surface for the operative project instructions; founder paste-syncs into Cowork panel between sessions.
- `/adopted/adr/2026-05-12-substrate-category-character-kernel.md` — J1 ADR (Character Kernel category label)
- `/adopted/substrate-plugin-staging-plan.md` — substrate-as-plugin staging plan (amended at ST2; A10-A19 Stage 1 expansion; Stage 3 re-scope on Anthropic Plugin spec + MCP; Stage 4 G4 expanded gating; parallel pre-launch track)
- `/adopted/session-opening-protocol.md` — full 21-element protocol
- `/operations/knowledge-gaps.md` — full knowledge-gaps register
- `/operations/agentic-commerce-findings-downstream-order.md` — forward-looking findings tracker (F1–F4); consulted at session-open per PR15 operational discipline
- `/operations/decision-log.md` — append-only decision trail (active log = entries dated 2026-05-01 onwards); entries cross-reference this cache by section name. Earlier entries are in monthly archive files in `/operations/decision-log-archive-YYYY-MM.md` per the quarterly archive policy adopted under `D-DECISION-LOG-ARCHIVE-POLICY-ADOPTED-2026-05-04` (see active log's INDEX header for full archive list + policy)
- Project instructions: see `/adopted/project-instructions-snapshot.md` for the operative content (PR1–PR20; verification framework 0c; Critical Change Protocol 0c-ii; risk classification 0d-ii; AI signals diagnostic-certainty rows added ST2; PR15 amended 2026-05-14; PR17 added 2026-05-27; PR18 added 2026-06-10; PR19 added 2026-07-21; PR20 added 2026-08-04)
- `operations/review-harness/independent-review-workflow-template.md` — the PR19 reusable review-workflow template (dimension-based fan-out, spend-limit fallback, the index-alignment implementation pitfall), seeded from the three 2026-07-19 grounding runs

---

*End of cache. This document is the operative session-opening reference for `governance` / `schema` / `code-standard` / `registry` / `archive` categories. For `code-elevated` and `code-critical`, the cache supplements the full governance reads. Update discipline: in-session amendment when underlying governance changes.*
