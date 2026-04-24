# Ops Channel Wiring Fix — Handoff

**Status:** Scoped + Designed (0a vocabulary), pending in-session diagnostic
confirmation. Not yet Scaffolded.
**Risk classification:** Elevated (0d-ii). See §6.
**Applies to:** Sage Ops agent.
**Pattern source:** PR1 — mirrors the method proven on the private mentor,
designed for Support, Tech, and Growth.
**Author:** AI, 20 April 2026, in-session prior to scaffold.

---

## 1. Purpose

The Ops agent (invoked as a chat persona through `/api/founder/hub`) is the
operational voice for the founder — process, financial, compliance, people,
analytics, vendor. Today it answers from a six-domain static brain plus a
persona prompt with nine "operational reasoning upgrades."

Unlike the other three wiring sessions (Support, Tech, Growth), Ops was
**not directly asked the self-diagnostic question** that surfaced the
channel gaps in those cases. This handoff proceeds from a **likely
diagnosis** — applying the same lens used on Support, Tech, Growth — that
Ops has two dark dynamic channels:

1. **Live cost/spend feed** — reasons from documented thresholds but has
   no live signal when they are approached.
2. **Operational continuity / session-state synthesis** — starts each
   session from the last handoff rather than a rolling picture.

The first execution-session task is to **confirm or correct** this
diagnosis by asking Ops directly. The design below is contingent on that
confirmation. If Ops's self-report reveals a different channel gap, the
next session should re-scope, not execute this design.

---

## 2. Likely broken channels (current state, subject to confirmation)

### Channel 1 — Live Cost / Spend Feed

**Today:** Ops's persona prompt references four cost thresholds:

- Revenue-to-cost ratio < 2x (R5 launch bar).
- Ops pipeline approaching $100/month (R5 Ops cap).
- Single endpoint exceeding 10% of LLM spend.
- Runway below 6 months.

Ops cannot read any of these numbers today. The infrastructure to compute
them **partly exists** in Supabase:

- `cost_health_snapshots` (pre-existing; extended 17 April 2026 with
  `classifier_cost_cents` and `classifier_to_mentor_ratio` columns).
- `classifier_cost_log` (per-invocation classifier tracking, last 30 days).
- `analytics_events` (product event log — not cost, but per-endpoint
  usage is derivable).

No loader exists that aggregates these into a ready-to-inject context
block. Ops is therefore relying on the founder to report numbers in
conversation, or on rote recall of the threshold values.

Consequence: Ops flags cost risk only when the founder raises it.
"Is anything about to breach a threshold?" gets a confident but
uninformed reply.

### Channel 2 — Operational Continuity / Session State Synthesis

**Today:** Each Ops session starts from:

- The last handoff note (paste at session open).
- Whatever the founder has in working memory.

The active workstream picture is scattered across:

- `operations/decision-log.md` — all consequential decisions across all
  domains.
- `operations/handoffs/*.md` — 25+ handoff files, most recent ≠ most
  relevant.
- `operations/session-handoffs/*.md` — parallel handoff directory
  (legacy), 30+ files.
- `operations/knowledge-gaps.md` — KG register, third-observation
  promotion tracking.
- `operations/session-debriefs/` — post-failure reviews.
- `compliance/compliance_register.json` — compliance posture (JSON).
- `compliance/compliance_audit_log.json` — audit log.
- D1–D10 non-decisions register in
  `operations/build-knowledge-extraction-2026-04-17.md`.

Consequence: Ops has no synthesised view of "where is everything right
now." A founder asking "what's blocking us?" or "what's the compliance
posture this week?" gets the contents of the most recent handoff, not
the rolling operational state.

---

## 3. Diagnostic step — REQUIRED before any code

The next session's **first action after reading this handoff** is to
invoke Ops as a chat persona and ask the same question used for the other
three agents:

> "What is your foundation info based on, which input channels do you
> actively draw from, and what triggers when you receive them?"

**Compare the answer against §2 above.** Three possible outcomes:

- **Confirmed.** Ops's answer matches the diagnosis — static brain +
  persona prompt, no live cost feed, no synthesised continuity state.
  Proceed with the design in §4.
- **Partially confirmed.** Ops identifies one of the two channels but
  not the other, or identifies a different gap. Re-scope: take the
  confirmed channel forward, log the divergence in the decision log,
  defer the other.
- **Corrected.** Ops's answer contradicts the diagnosis — e.g., it
  reports a live channel the designer missed. Stop. Do not execute this
  design. Produce a revised handoff based on Ops's self-report.

The diagnostic is not a formality. The other three agents' self-reports
produced more accurate channel maps than the designer's guesses. Treat
Ops's answer as ground truth, not a rubber stamp.

---

## 4. Design (status: Designed, contingent on diagnostic confirmation)

### 4.1 Channel 1 — Live Cost / Spend Feed

**Data source:** Supabase read path (not file-based, unlike Growth).

- **Table:** `cost_health_snapshots` — latest row.
- **Table:** `classifier_cost_log` — aggregated over last 30 days.
- **Table:** `analytics_events` — aggregated for per-endpoint usage
  over last 30 days, **only if** per-endpoint LLM-spend attribution is
  already instrumented. If not, this third dimension is deferred to a
  later session (see Choice 3 below).

**Thresholds evaluated by the loader** (from Ops upgrades in the persona
prompt):

| Threshold | Signal | Default level |
|---|---|---|
| Revenue-to-cost ratio | latest snapshot's revenue / (mentor_cost + classifier_cost + ops_cost) | green ≥ 2.0 · amber 1.5–2.0 · red < 1.5 |
| Ops pipeline vs $100/mo cap | latest snapshot's ops_cost_cents projected monthly | green < $70 · amber $70–$100 · red ≥ $100 |
| Single-endpoint > 10% of LLM spend | per-endpoint aggregate from analytics_events | green all < 10% · amber any at 10–15% · red any > 15% (only if data available) |
| Runway < 6 months | (cash_balance / monthly_burn) — cash_balance and monthly_burn pulled from latest snapshot | green > 9 months · amber 6–9 · red < 6 |

**Loader (new file):**
`website/src/lib/context/ops-cost-state.ts`

```ts
// Reads cost_health_snapshots (latest) + classifier_cost_log (30-day
// aggregate). Computes threshold statuses. Returns a structured block.
// Supabase dependency — service-role read.

export type ThresholdStatus = 'green' | 'amber' | 'red' | 'unknown';

export interface OpsCostBlock {
  as_of: string;                          // snapshot timestamp
  snapshot_age_days: number;              // how stale is the data
  revenue_to_cost_ratio: {
    value: number | null;
    status: ThresholdStatus;
  };
  ops_pipeline_monthly_usd: {
    value: number | null;
    cap_usd: 100;
    status: ThresholdStatus;
  };
  single_endpoint_concentration: {
    worst_endpoint: string | null;
    worst_share_pct: number | null;
    status: ThresholdStatus;             // 'unknown' if per-endpoint attribution not wired
  };
  runway_months: {
    value: number | null;
    status: ThresholdStatus;
  };
  classifier_30d: {
    total_cost_cents: number;
    invocations: number;
    llm_stage_rate: number;              // proportion of invocations that ran Haiku
  };
  formatted_context: string;
}

export async function getOpsCostState(): Promise<OpsCostBlock>;
```

**Failure modes:**

- Supabase read error → return a stub with all values `null`, all
  statuses `'unknown'`, and `formatted_context` explicitly saying
  "Live cost feed unavailable: [error]. Ops is answering from the
  documented thresholds only."
- Snapshot > 7 days old → include an "as_of X days ago" warning in
  the formatted block.
- Per-endpoint concentration unknown (Choice 3 Option A) → status
  `'unknown'` with a line: "Per-endpoint LLM-spend attribution not yet
  instrumented. Concentration risk cannot be computed from this
  channel."

**Injection point:** `case 'ops'` branch of `/api/founder/hub/route.ts`,
after the nine operational reasoning upgrades and before the existing
`${brainContext}` injection.

### 4.2 Channel 2 — Operational Continuity / Session State Synthesis

**Data source:** File-based — reads from multiple existing files at
request time. No new canonical file needed.

- `operations/handoffs/*-close.md` — most recent **three** close
  handoffs (most-recent first by file mtime, filtered for `-close.md`
  suffix).
- `operations/decision-log.md` — entries from last 30 days, tagged by
  status field (Adopted / Under review / Superseded).
- `operations/knowledge-gaps.md` — the register's current entries with
  observation counts.
- `compliance/compliance_register.json` — current compliance posture
  (one line per item).
- D-register from `operations/build-knowledge-extraction-2026-04-17.md`
  — D1–D10 non-decisions with current posture (mitigated / accepted /
  open).

**Synthesis shape:** The loader does not send the raw file contents —
it parses and synthesises into a fixed structure that Ops can reason
over cheaply.

**Loader (new file):**
`website/src/lib/context/ops-continuity-state.ts`

```ts
// Reads five sources at request time. Synthesises into a structured
// operational-state block. Read-only, no Supabase dependency, no
// writes. Token-bounded (~3000 tokens max).

export interface OpsContinuityBlock {
  as_of: string;
  active_workstreams: Array<{
    name: string;               // parsed from recent close handoffs
    current_status: string;     // 0a status vocabulary
    last_touched: string;       // date
    next_action: string | null;
  }>;
  open_blockers: Array<{
    description: string;
    surface: string;            // e.g. "Channel 1 wiring", "legal review"
    blocking_since: string;
  }>;
  pending_decisions: Array<{
    id: string;                 // e.g. "D4", "D-Growth-3"
    title: string;
    current_posture: 'mitigated' | 'accepted' | 'open';
  }>;
  compliance_posture: Array<{
    item: string;               // e.g. "R17b encryption"
    status: string;             // e.g. "Wired, not Verified"
    last_reviewed: string;
  }>;
  knowledge_gaps_in_flight: Array<{
    kg_id: string;
    concept: string;
    observation_count: number;
  }>;
  formatted_context: string;
}

export async function getOpsContinuityState(): Promise<OpsContinuityBlock>;
```

**Failure modes:**

- Any source file missing → that section returns empty with an
  explicit "source unavailable: [path]" line in the formatted block.
  Loader never throws.
- Compliance register JSON parse error → section returns empty with
  the parse error reported.
- Token budget exceeded (rare but possible with long handoffs) →
  truncate handoffs in order: `active_workstreams` preserved in full,
  `compliance_posture` preserved in full, `pending_decisions`
  preserved in full, `open_blockers` truncated with count of omitted
  items, `knowledge_gaps_in_flight` truncated last.

**Injection point:** Same `case 'ops'` branch. Order:

1. Persona prompt (existing).
2. Operational reasoning upgrades (existing — 9 bullets).
3. **(new) Cost state block** — Channel 1.
4. **(new) Continuity state block** — Channel 2.
5. Ops brain static context (existing, `getOpsBrainContext(depth)`).

### 4.3 Verification harness

**New file:** `scripts/ops-wiring-verification.mjs`

Three checks:

1. **Channel 1 parse.** Call the Channel 1 loader. Print all four
   threshold statuses, the snapshot `as_of` timestamp, and the
   classifier 30-day aggregate. If Supabase read fails, print the
   failure-mode block and confirm the loader handled it gracefully.
2. **Channel 2 parse.** Call the Channel 2 loader. Print counts of
   each structured field (workstreams, blockers, decisions,
   compliance items, KGs). Print the first entry from each for
   eye-inspection.
3. **Integration check.** Simulate the `case 'ops'` injection —
   concatenate persona prompt + nine upgrades + cost block +
   continuity block + ops brain context. Print total character count
   and rough token estimate. Confirm it sits below the model's
   context ceiling with room for the conversation history.

---

## 5. Choice points for the next session

Present as options with reasoning, not prescriptions. Wait for explicit
answer before any code.

### Choice 1 — Diagnostic first, or run design-as-written?

- **Option A (recommended, and mandatory per §3):** Run the diagnostic
  first. Execute design only if Ops confirms the two-channel gap.
- **Option B:** Skip the diagnostic, execute design as written. Risks
  building a channel Ops didn't actually need. Recommend against —
  violates the principle that made the other three wiring sessions
  successful.

### Choice 2 — Channel 1 data sources: which to wire

- **Option A (recommended):** Wire `cost_health_snapshots` + a simple
  `classifier_cost_log` 30-day aggregate. Do not wire per-endpoint
  attribution. Concentration-risk status returns `'unknown'` with an
  explicit note.
- **Option B:** Wire all three sources including per-endpoint
  concentration. Requires confirming that analytics_events records
  endpoint-level LLM-spend attribution — if it does not, this option
  expands scope into instrumentation work.
- **Option C:** Wire only `cost_health_snapshots`. Omit classifier
  aggregate. Simplest, but loses the R20a cost surface that Ops was
  extended to cover on 17 April 2026.

### Choice 3 — Channel 2 source filtering: broad or narrow?

- **Option A (recommended):** Read all five sources listed in §4.2.
  Most complete picture. Largest parse surface.
- **Option B:** Read only close handoffs + decision log + compliance
  register. Omit knowledge-gaps and D-register. Simpler; loses
  signal on in-flight process risks.
- **Option C:** Read only the three most-recent close handoffs.
  Barely more than the current "paste the last handoff" manual
  process. Recommend against.

### Choice 4 — Snapshot freshness policy

- **Option A (recommended):** Include a warning in the formatted
  block if the latest `cost_health_snapshots` row is more than 7 days
  old. Do not block.
- **Option B:** Block the Ops persona with an error if the snapshot
  is more than N days old. Forces the founder to refresh. Overly
  paternalistic for a chat persona.
- **Option C:** No freshness warning. Ops silently reports stale data
  as current. Recommend against.

### Choice 5 — Extend pattern to mentor persona in `/api/founder/hub`?

- **Option A (recommended):** No. PR1 — Ops is the final chat-persona
  wiring; the mentor branch in `case 'mentor'` is distinct (it uses
  its own full-context architecture via the private-mentor path, not
  the four-domain brain pattern). Out of scope.
- **Option B:** Survey the mentor branch for parallel gaps. Recommend
  deferring to a later session — different architecture, different
  risk surface.

---

## 6. Risk classification — 0d-ii

| Sub-item | Risk | Reason |
|---|---|---|
| Diagnostic question to Ops | **Standard** | Read-only chat probe |
| Channel 1 wiring | **Elevated** | New Supabase read path in live request path, cost data is operationally sensitive |
| Channel 2 wiring | **Elevated** | Five-file parse surface, failure-mode coverage required |
| Injection into `case 'ops'` branch | **Elevated** | Changes live chat persona's system prompt composition |
| Verification harness (.mjs) | **Standard** | Read-only, harness only |

**No Critical sub-items.** Ops is not a safety-critical surface (PR6
applies to the distress classifier and Zone 2/3, which this wiring does
not touch). No auth, session, cookie, encryption, or deploy-config
change.

**Elevated is higher than Growth** because Channel 1 reads from Supabase
in the request path (Growth was file-only), and Channel 2's parse
surface is five sources (Tech was two, Growth was two). Blast radius is
contained to the Ops persona.

**Rollback per sub-item:**

- Injection changes: revert the `case 'ops'` branch to pre-wiring HEAD.
  Trivial `git revert` on the `hub/route.ts` file.
- Channel 1 loader: delete `ops-cost-state.ts`. No other code imports
  it outside the `case 'ops'` branch.
- Channel 2 loader: delete `ops-continuity-state.ts`. Same.
- Harness: delete the `.mjs` file.
- No schema change, no migration to roll back.

**Approval required before deploy:** Founder gives explicit "proceed"
after hearing the risk summary and rollback paths. For Elevated changes
under 0d-ii, the founder acknowledges the rollback path but does not
need to name each specific risk (that is the Critical protocol).

---

## 7. Verification steps (after wiring, before close)

Founder verifies by running the harness and reading its output, plus a
live probe against Ops.

1. **Push to Vercel. Wait for Vercel Green.**
2. **Run the harness locally:**
   ```
   node scripts/ops-wiring-verification.mjs
   ```
   Expected output (shape, verbatim phrasing provided in the prompt):
   - Channel 1 parses. Prints four threshold statuses (or "unknown"
     where data is absent), snapshot age, classifier 30-day aggregate.
   - Channel 2 parses. Prints counts per structured field + one
     sample entry per field.
   - Integration check prints total character count and estimated
     token count for the composed Ops system prompt. Confirms it
     sits below the context ceiling.
3. **Live probe.** Open `/private-mentor`, pick Ops persona, ask
   exactly:
   `What is our current cost posture against the four thresholds,
   and what are the top three active workstreams right now?`
   Expected: Ops replies with numeric values (or "unknown" with
   reason) for each of the four thresholds, and names specific
   workstreams from the synthesised continuity block. If Ops answers
   from generic threshold language without citing the live values or
   specific workstreams, the wiring is **not Verified**. Revert.

---

## 8. Out-of-scope guardrails

- No change to `ops-brain-loader.ts` or the static ops brain data.
- No extension to other chat personas in this session. Support, Tech,
  Growth are already designed in parallel handoff files. Mentor
  branch architecture is different (Choice 5 Option A).
- No new Supabase table, no migration, no RLS change. Channel 1 reads
  existing tables only.
- No `cost_health_snapshots` write path change. This is strictly a
  read-side addition.
- No new instrumentation for per-endpoint LLM-spend attribution
  (Choice 2, default Option A).
- No change to `runSageReason` or `sage-reason-engine.ts`.
- No auth / session / cookie / deploy-config change (AC7 / PR1
  standing-Critical surface — if one appears, stop and apply 0c-ii).
- No change to the distress classifier, Zone 2 classification, Zone 3
  redirection, or their wrappers (PR6 — always Critical).
- No reconciliation of `operations/handoffs/` vs
  `operations/session-handoffs/` directory duplication. Channel 2
  reads the canonical `operations/handoffs/` only; the legacy
  directory is a future cleanup task flagged for a later session.

If the next session notices something else that should change, flag it
with "I'd push back on this" or "this is a limitation" — do not silently
expand.

---

## 9. Decision-log plan (PR7)

Session-close handoff will log six choice-point or diagnostic-step
decisions:

- D-Ops-0: Diagnostic outcome — Confirmed / Partially confirmed /
  Corrected. Records Ops's self-report verbatim.
- D-Ops-1: Diagnostic-first execution order.
- D-Ops-2: Channel 1 data sources included.
- D-Ops-3: Channel 2 source filtering breadth.
- D-Ops-4: Snapshot freshness policy.
- D-Ops-5: Mentor persona extension deferral.

Each entry records: decision, reasoning, alternatives considered, what
would trigger revisiting. Format matches PR7.

---

## 10. Knowledge-gap candidates (PR5 / PR8)

The Ops wiring introduces **two new patterns** and is the **fourth
observation** of one existing pattern:

- **Fourth observation (PR8 threshold already reached at Growth if
  Growth promoted at close):** File-based context loader for chat-
  persona agents. If Growth did not promote at its close, Ops is the
  third observation and becomes the promotion session.
- **First observation (new):** Supabase-read-path loader for chat-
  persona agents. Ops Channel 1 is the first instance of a chat-
  persona loader that reads from a live database in the request path.
  If this pattern recurs (e.g., a Growth loader wired to
  analytics_events later), it becomes a PR8 candidate.
- **First observation (new):** Multi-source synthesis loader. Ops
  Channel 2 reads five sources and produces a single synthesised
  block. All prior loaders (Tech, Growth) read one or two sources.
  Flag if recurs.

Session close should record all three observations with the session
cited.

---

## 11. Today's verified facts (as of 20 April 2026, this session)

Not assumptions — findings from this session's exploration:

- `ops-brain-loader.ts` exists at `website/src/lib/context/ops-brain-loader.ts`,
  exports `getOpsBrainContext(depth: 'quick' | 'standard' | 'deep')`,
  with six domains: process, financial, compliance, people, analytics,
  vendor.
- Ops is invoked as a chat persona in the `case 'ops'` branch of
  `/api/founder/hub/route.ts`, starting line 196, running through
  ~line 252 (`${brainContext}` injection).
- Nine "OPERATIONAL REASONING UPGRADES" are baked into the persona
  prompt: status-as-evidence, D1–D10 live risk, knowledge-gap
  protocol, compliance-as-reconstructable-reasoning, Critical-change
  debriefs, token-count methodology, T-series third-recurrence,
  F-series tier split, evidentiary framing.
- `cost_health_snapshots` table exists in Supabase. Extended on
  17 April 2026 to add `classifier_cost_cents` and
  `classifier_to_mentor_ratio` columns.
- `classifier_cost_log` table exists in Supabase (created 17 April
  2026) with per-invocation classifier cost tracking including
  `estimated_cost_cents`, stage flags, severity result.
- `analytics_events` records product events (not cost directly).
  Per-endpoint LLM-spend attribution status unverified —
  confirm in Choice 2.
- `compliance/compliance_register.json` and
  `compliance/compliance_audit_log.json` exist.
- `operations/decision-log.md`, `operations/knowledge-gaps.md`, and
  `operations/build-knowledge-extraction-2026-04-17.md` (with D1–D10
  register) exist.
- Two handoff directories exist: `operations/handoffs/` (canonical,
  current) and `operations/session-handoffs/` (legacy). Channel 2
  reads from `operations/handoffs/` only; legacy directory
  reconciliation is out of scope.
- The four chat-persona branches (`ops`, `tech`, `growth`, `support`)
  in `/api/founder/hub` share the same injection pattern. Ops is the
  fourth and final to receive the wiring pattern via this series of
  sessions. The `case 'mentor'` branch uses a different architecture
  (full-context private-mentor path) and is out of scope.

These are the factual ground from which the next session proceeds —
after it has first confirmed the diagnostic.
