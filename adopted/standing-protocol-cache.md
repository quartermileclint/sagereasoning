# Standing Protocol Cache

**Status:** Adopted 2026-05-03 under `D-PHASE-2-PASS-1-REPLAN-EFFICIENCY-REFINEMENT-2026-05-03`.
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

For `code-elevated` and `code-critical` categories, also read in full: the manifest's relevant rules; the protocol's Part B + C elements that engage; any deliverable that names architectural constraints (AC1–AC7); the predecessor session close; the operational deliverable spec.

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

- Manifest rules (R0–R20, AC1–AC7, KG1–KG7)
- Session-opening protocol (Parts A, B, C; the 21 elements)
- Project instructions (this version is per the project instructions snapshot at adoption time)
- Process rules (PR1–PR9)

…update this cache **in the same session as the governance change**. The update is Standard risk per 0d-ii. Append `D-CACHE-DRIFT-RESOLVED-YYYY-MM-DD` entry to the decision log naming the cache-update step.

If the cache and the governance documents diverge, the governance documents are authoritative. The cache is a reference convenience, not a substitute.

---

## Cross-references

- `/manifest.md` — full manifest (R0–R20, AC1–AC7, KG1–KG7)
- `/adopted/session-opening-protocol.md` — full 21-element protocol
- `/operations/knowledge-gaps.md` — full knowledge-gaps register
- `/operations/decision-log.md` — append-only decision trail; entries cross-reference this cache by section name
- Project instructions (system prompt) — process rules PR1–PR9; verification framework 0c; Critical Change Protocol 0c-ii; risk classification 0d-ii

---

*End of cache. This document is the operative session-opening reference for `governance` / `schema` / `code-standard` / `registry` / `archive` categories. For `code-elevated` and `code-critical`, the cache supplements the full governance reads. Update discipline: in-session amendment when underlying governance changes.*
