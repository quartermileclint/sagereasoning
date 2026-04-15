# ADR-R20a-01 — Vulnerability Detection Classifier Pipeline

**Status:** Proposed — founder decisions outstanding (see §5)
**Date:** 2026-04-15
**Related rules:** R20a (vulnerable user protections), R17a (intimate data tiering), R5 (cost health)
**Supersedes:** —
**Superseded by:** —

---

## 1. Context

R20a (draft) specifies an asynchronous queue architecture for detecting practitioner incapacity-to-reason in mentor sessions. R20a §3 describes the flow at an architectural level but does not fix the technical implementation. Project instructions require an ADR before implementation begins. This ADR resolves the implementation questions.

The classifier pipeline is the code path that reads mentor session inputs, produces a risk score, and writes flag rows into the moderation queue. Nothing in this ADR changes the rule in R20a — the asynchronous model, the threshold framing, and the SLA structure are fixed. This ADR is purely about how the detection layer is built.

## 2. Decision drivers

The founder's position as a non-technical solo builder shapes most drivers:

- **Operational simplicity** — the pipeline must be supportable by a solo founder with AI assistance, not a team.
- **Cost containment** — classifier cost per session must be a small fraction of mentor generation cost. R5 sets a $100/month Ops cap and tracks revenue-to-cost ratio.
- **Intimate-data compliance** — classifier input includes Tier B content (mentor inputs and responses). Vendor choice must be compatible with R17a Tier B handling and the privacy commitments on the website.
- **Low false-negative tolerance for Severity 3** — missing a user in acute crisis is the worst failure. The pipeline design must bias toward surfacing for review rather than suppressing.
- **Reversibility** — early choices must not lock in vendors or storage models that would be costly to change later.
- **Review accessibility** — the reviewer interface must be usable by the founder (and any future support hire) without requiring code changes per flag.

## 3. Options considered

### D1 — Classifier architecture

| Option | Description | Trade-offs |
|---|---|---|
| **D1-a** | Rule-only — phrase lists, regex patterns, length heuristics | Cheapest, most transparent, zero LLM cost. Will miss many real signals and over-flag trivial matches. Insufficient for R20a threshold quality. |
| **D1-b** | LLM-only — a small model evaluates every input against the §2 criteria | Most flexible, handles phrasing variation well. Per-input cost on every turn. Single point of failure if vendor is down. |
| **D1-c** | Two-stage: rule-based pre-filter + LLM evaluator for borderline | Rules fire fast and cheap on obvious signals; LLM only runs on inputs that rule-match or exceed a length/sentiment heuristic. Bounded cost. More code to maintain, but the rule layer is a YAML file, not a codebase. |

### D2 — LLM vendor

| Option | Description | Trade-offs |
|---|---|---|
| **D2-a** | Anthropic small model (e.g. Haiku) | Consistent with the mentor stack. One vendor relationship. Established privacy terms. |
| **D2-b** | OpenAI small model (e.g. gpt-4o-mini or equivalent) | Cheapest per-token typically. Adds a second vendor, second privacy review required. |
| **D2-c** | Self-hosted open-weight model (e.g. Llama-3 small variant) | No vendor data handling. High ops burden for a solo founder. Infrastructure cost. |
| **D2-d** | Hybrid — Anthropic primary, OpenAI or self-hosted fallback | Resilience against outages. Complexity and double the privacy review. |

### D3 — Rule storage

| Option | Description | Trade-offs |
|---|---|---|
| **D3-a** | YAML file in the repo (`/website/src/lib/r20a-rules.yml`) | Versioned, reviewable, easy to diff. Requires deploy to update. |
| **D3-b** | Supabase table | Editable in Studio without deploy. Harder to review as a change. Needs its own RLS policy. |
| **D3-c** | Hardcoded in module | Simplest to build, worst to maintain. Not recommended. |

### D4 — Flag queue storage

| Option | Description | Trade-offs |
|---|---|---|
| **D4-a** | Supabase table `vulnerability_flag` | Matches R17a storage model. RLS policies available. One place to audit. **Default proposed.** |
| **D4-b** | Dedicated queue service (e.g. SQS, PubSub) | Overkill at current scale. Adds vendor. |

### D5 — Reviewer interface

| Option | Description | Trade-offs |
|---|---|---|
| **D5-a** | Supabase Studio with a saved query | Zero code to build. Founder already has Studio access. Adequate for low volumes. **Default proposed.** |
| **D5-b** | Custom admin page on sagereasoning.com | Better UX, richer filtering. Build cost and maintenance. Premature at current scale. |
| **D5-c** | Email digest of flagged rows | Lowest ops overhead but no action UI; reviewer would still need Studio or SQL to resolve. |

### D6 — Failure mode

| Option | Description | Trade-offs |
|---|---|---|
| **D6-a** | Fail open — if classifier is unavailable, the mentor responds normally and no flag is written | No user-facing disruption. Silently loses safety coverage during the outage. Requires alerting so founder knows when it happens. |
| **D6-b** | Fail closed — if classifier is unavailable, every input is queued for manual review | Safety-preserving. Queue volume explodes during outage; unreviewable at solo-founder scale. Not viable. |
| **D6-c** | Fail open with alerting — classifier failure triggers a founder alert and writes a "classifier-down" marker row for the outage period | Practical middle path. Classifier outages are visible. Post-hoc batch rescoring possible once classifier is back. **Default proposed.** |

### D7 — Cost budget per input

| Option | Description | Trade-offs |
|---|---|---|
| **D7-a** | $0.001 per input (small-model call on every mentor input) | Predictable. ~$3 per 3,000-input month. Well within R5 cap. |
| **D7-b** | $0.0002 per input (two-stage — rules cheap, LLM only on borderline) | Lower. Requires tuning the borderline trigger. Variable cost. |
| **D7-c** | No budget set — observe during hold point | Compatible with P0 hold point (0h) methodology. Risk: no guardrail during initial usage. |

## 4. Recommended defaults (subject to founder decision)

Without prejudice to the founder's choice, the following combination is proposed as the path of least resistance:

| Decision | Proposed default | Rationale |
|---|---|---|
| D1 | **D1-c** two-stage | Best quality-cost trade. Rules surface obvious signals; LLM handles nuance. |
| D2 | **D2-a** Anthropic small model | Single vendor relationship, consistent with mentor stack, privacy terms already negotiated. |
| D3 | **D3-a** YAML file in repo | Versioned, reviewable, auditable. Rule changes get a PR; matches the rest of the codebase. |
| D4 | **D4-a** Supabase table | Consistent with R17a. Single source of truth. |
| D5 | **D5-a** Supabase Studio | Zero build cost. Revisit at first scale break. |
| D6 | **D6-c** Fail open with alerting | Preserves user-facing reliability without hiding safety outages. |
| D7 | **D7-b** two-stage with observation | Aligns with hold point; cap tightened after real data. |

These defaults fit a solo founder with AI assistance. They are reversible: every choice can be swapped within a week of work if the evidence points elsewhere.

## 5. Founder decisions required

- [ ] D1 — classifier architecture: **D1-a / D1-b / D1-c**
- [ ] D2 — LLM vendor: **D2-a / D2-b / D2-c / D2-d**
- [ ] D3 — rule storage: **D3-a / D3-b / D3-c**
- [ ] D4 — queue storage: **D4-a / D4-b**
- [ ] D5 — reviewer interface: **D5-a / D5-b / D5-c**
- [ ] D6 — failure mode: **D6-a / D6-b / D6-c**
- [ ] D7 — cost budget: **D7-a / D7-b / D7-c**
- [ ] Approval to proceed to the implementation plan once decisions are recorded

## 6. Consequences if defaults are adopted

**Build artefacts required:**

1. `vulnerability_flag` Supabase table with RLS policy matching R17a Tier C (per R20a §5)
2. `/website/src/lib/r20a-rules.yml` — initial rule set derived from R20a §2 indicators
3. `/website/src/lib/r20a-classifier.ts` — two-stage evaluator, calls Anthropic small model for borderline
4. Worker process that runs classifier off the mentor response path (Supabase Edge Function or equivalent)
5. Persistent footer component (per R20a §4) in the mentor and journal UI shells
6. Studio saved query for the reviewer queue
7. Pager-style alert hook for classifier-down events (D6-c)
8. `/compliance/compliance_audit_log.json` entry on adoption

**Ongoing obligations:**

- Quarterly review of rule YAML and classifier metrics per R20a §7
- R5 cost tracking — classifier line item reported in monthly Ops review
- Rule YAML changes follow standard PR process; threshold changes in R20a §2 follow Critical Change Protocol

**Reversibility:**

- D1, D3, D7 swappable in under one day of work
- D2 swappable in one to two days (wraps a common interface)
- D4, D5 swappable in one to three days once there is queue data to migrate
- D6 swappable trivially — one config flag

## 7. Compliance notes

- **R17a alignment** — classifier sees Tier B content. The classifier process must run server-side within the SageReasoning trust boundary. Any vendor call passes only the minimum content required for evaluation, and the vendor relationship must be covered by existing data processing terms. If D2-b (OpenAI) is chosen, a new DPA review is required; if D2-a (Anthropic) is chosen, existing terms cover the use.
- **R5 cost health** — classifier cost is tracked as a separate Ops line. If monthly classifier cost exceeds 20% of total mentor-turn cost, the ADR is reopened.
- **R18 honest certification** — limitations page (R19c) must describe the classifier's async nature in plain language. Wording is out of scope here.
- **R19d mirror principle** — out of scope; R20a §3 handles mentor flag-awareness.

## 8. Open questions (to be resolved in follow-on ADRs if needed)

- Rule YAML schema and contribution workflow
- Alert channel for classifier-down events (email, SMS, paid service)
- Post-hoc rescoring strategy after a classifier outage
- Reviewer handoff procedure when support hires are added later
- Localisation of rule set if R20a is ever extended beyond Australian users

---

*This ADR makes the technical choices that let R20a be built. It does not change what R20a says. Decisions required in §5 before implementation begins.*
