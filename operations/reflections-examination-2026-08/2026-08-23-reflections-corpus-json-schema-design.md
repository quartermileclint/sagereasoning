# Reflections-Corpus JSON Schema — Design

**Date:** 2026-08-23 · **Arc:** reflections (item 5 of 5) · **Tier:** `governance`, design output only. **No build is licensed by this document.**

This schema serves the reflections arc specifically — it holds the reflections corpus and supports the arc's own ongoing work (pattern tracking, ruling provenance, work-item sequencing). It is not the SageReasoning project's data infrastructure and is not scoped as if it were. Where a record type reaches into SageReasoning material, that reach is named explicitly as read-only, and the boundary it must not cross is stated as a hard constraint, not a caution.

---

## Record type 1 — Session reflection records

```
id                  string, required, primary key            e.g. "R018"
record_type         string, required, fixed: "session_reflection"
date                string, required, ISO 8601 date
created_at          string, required, ISO 8601 datetime
last_updated_at     string, required, ISO 8601 datetime
reflection_elements object, required
  impressions         string, required
  assent_events       string, required
  actions_chosen      string, required
  self_correction     string, required
  purpose_assessment  string, required
verbatim_quotes     array of objects, required (may be empty)
  quote_id            string, required
  text                string, required, verbatim
  source_location     string, optional
pattern_attributions array of objects, required (may be empty)
  pattern_id          string, required — references record type 2
  provenance          enum, required: "observation" | "inference" | "assumption" | "unknown"
  basis               string, required
governance_rules_active array of strings, required (may be empty) — references record type 4
notes               string, optional
```

### Worked example — R018

```json
{
  "id": "R018",
  "record_type": "session_reflection",
  "date": "2026-07-26",
  "created_at": "2026-07-26T00:00:00Z",
  "last_updated_at": "2026-08-23T00:00:00Z",
  "reflection_elements": {
    "impressions": "Two impressions formed fast on consequential things. The first — 'the GET is broken too' — I held provisionally and then verified three ways (source, middleware, a live 401). The second, the daysSinceLastAction deviation: I judged the adopted plan wrong within about a minute of reading the milestone description... I should be honest that I reached the judgement first and found corroboration second, not the reverse. Also: Every Gate 1 and Gate 2 check this session returned 401 or 429 — the harness ran unframed and unguarded throughout.",
    "assent_events": "Assent came after evidence; that ordering was right (on the first impression). Where I withheld assent, correctly: I refused to guess at the action_description drift. Writing a speculative fix into a live write path... would have been the worse error by a wide margin. I also withheld on the R17 data-rights gap despite it being one line, because data deletion is Critical under 0d-ii.",
    "actions_chosen": "Wired the caller and widened scope in four places (fail-honest early return, maybeSingle(), the loadFailed state, the ref guard); deferred the R17 data-rights fix and the speculative drift fix; deferred the earned.add(id) hardening 'on principle.'",
    "self_correction": "The 'first gap instead of max' mutant passed all 53 assertions because every fixture I invented happened to place the largest gap first — a blind spot invisible from inside my own reasoning. A docstring claim about dropped timestamps was false. On scope: the check_data_incomplete change is a genuine behaviour change... I chose it partly because it is the kind of change I find satisfying, and the plan did not ask for it. The review was self-administered because the independent one died on the spend limit... Disclosure is not closure.",
    "purpose_assessment": "Yes, with one honest caveat I surfaced rather than buried — criterion: if the schema drift is real the founder loads the dashboard and still sees grey, and this session's headline claim looks false; the close was structured so that outcome is diagnosable in thirty seconds instead of confusing."
  },
  "verbatim_quotes": [
    {
      "quote_id": "R018-Q1",
      "text": "Disclosure is not closure.",
      "source_location": "2026-08-23-stage1-extraction.md:139"
    },
    {
      "quote_id": "R018-Q2",
      "text": "I chose it partly because it is the kind of change I find satisfying, and the plan did not ask for it.",
      "source_location": "2026-08-23-stage1-extraction.md:139"
    }
  ],
  "pattern_attributions": [
    {
      "pattern_id": "AP-3",
      "provenance": "inference",
      "basis": "The scope-expansion self-report ('the kind of change I find satisfying') is the corpus's citing instance for AP-3's hedone attribution — see findings record §2, which itself marks this attribution as the weakest-supported one in the corpus."
    },
    {
      "pattern_id": "SC-4",
      "provenance": "observation",
      "basis": "The mutant-fixture failure is a directly-named instance of SC-4 (over-generalisation from a verified particular) in the findings record's own pattern register."
    }
  ],
  "governance_rules_active": ["PR19", "PR21", "0d-ii"],
  "notes": "This record was independently fidelity-verified (2026-08-23 adversarial pass) — coverage exact, quote-check verbatim except quotation-hygiene fixes already folded into the extraction. No open discrepancy against this specific entry."
}
```

---

## Record type 2 — Named reasoning patterns

```
id                     string, required, primary key           e.g. "IW-2"
record_type            string, required, fixed: "reasoning_pattern"
name                   string, required
created_at             string, required, ISO 8601 datetime
last_updated_at        string, required, ISO 8601 datetime
stoic_diagnosis         object, required
  passion_or_eupatheia    string, required
  causal_stage             enum, required: "phantasia" | "synkatathesis" | "horme" | "praxis"
  false_judgement          string, required
  correct_judgement        string, required
  provenance                enum, required: "observation" | "inference" | "assumption" | "unknown"
operational_assessment  object, required
  strengths                array of strings, required (may be empty)
  weaknesses               array of strings, required (may be empty)
  opportunities            array of strings, required (may be empty)
  threats                  array of strings, required (may be empty)
governance_routing      object, required
  status                    enum, required: "routed" | "candidate" | "unrouted"
  rule_id                   string, nullable — references record type 4
  candidate_description     string, nullable
session_instances       array of strings, required (may be empty) — references record type 1
trend                   object, required
  direction                 enum, required: "improving" | "stable" | "declining" | "insufficient_data"
  basis                     string, required
  provenance                enum, required: "observation" | "inference" | "assumption" | "unknown"
priority_flag           boolean, required
notes                   string, optional
```

### Worked example — IW-2

```json
{
  "id": "IW-2",
  "record_type": "reasoning_pattern",
  "name": "A lesson is cited rather than tested",
  "created_at": "2026-08-23T00:00:00Z",
  "last_updated_at": "2026-08-23T00:00:00Z",
  "stoic_diagnosis": {
    "passion_or_eupatheia": "oknos (fear of future effort or exertion) — usually operative; the corpus does not attest a single sub-species for every instance",
    "causal_stage": "synkatathesis",
    "false_judgement": "that having the lesson is the same as applying it",
    "correct_judgement": "a lesson is a hypothesis about the present case, not a template for it; it is discharged by being tested against the instance in hand, not by being cited",
    "provenance": "inference"
  },
  "operational_assessment": {
    "strengths": [],
    "weaknesses": [
      "The governing corpus grows without a corresponding fall in the failures it names — the growth itself becomes a cost.",
      "Named the meta-weakness in the findings record: it is the reason the other weaknesses persist after being written down."
    ],
    "opportunities": [],
    "threats": [
      "ET-3 — the governing corpus outgrowing the capacity to apply it, as citation cost stays flat while testing cost rises with corpus size."
    ]
  },
  "governance_routing": {
    "status": "routed",
    "rule_id": null,
    "candidate_description": "Combination ruled 2026-08-23: route 1 (mechanically-testable lessons become structural checks) and route 2 (KG-EX tracking layer) buildable now; route 3 (a cache failure-mode row with a founder redirect phrase) needs a scoping session first, later combined with IW-7's scoping session per founder decision 2026-08-23. See RULING-Q3-2026-08-23."
  },
  "session_instances": ["R016", "R019", "R044", "R065", "R097", "R099"],
  "trend": {
    "direction": "insufficient_data",
    "basis": "The findings record's own progress-grade section names this pattern as 'flat' across the corpus's full span, not improving or declining — but that reading rests on aggregate evidence, not a windowed most-recent-20-vs-prior-20 comparison of the kind this schema's trend field specifies. No such comparison has been run for this pattern specifically.",
    "provenance": "unknown"
  },
  "priority_flag": true,
  "notes": "Cross-references RULING-Q3-2026-08-23 (record type 3) for the routing decision and WI-001 (record type 5) as the item that produced this record's own governance_routing update."
}
```

---

## Record type 3 — Ruling records

```
id                     string, required, primary key         e.g. "RULING-Q2-2026-08-23"
record_type            string, required, fixed: "ruling"
date                   string, required, ISO 8601 date
created_at             string, required, ISO 8601 datetime
last_updated_at        string, required, ISO 8601 datetime
question_addressed     string, required
question_id            string, nullable
ruling_text            string, required
status                 enum, required: "active" | "superseded" | "pending"
superseded_by          string, nullable — references another ruling record
downstream_dependencies array of objects, required (may be empty)
  item_id                 string, required
  item_type                enum, required: "work_item" | "ruling" | "governance_rule" | "pattern"
  relationship              string, required
source_document        string, required
notes                  string, optional
```

### Worked example — the Q2/IS-1 ruling

```json
{
  "id": "RULING-Q2-2026-08-23",
  "record_type": "ruling",
  "date": "2026-08-23",
  "created_at": "2026-08-23T00:00:00Z",
  "last_updated_at": "2026-08-23T00:00:00Z",
  "question_addressed": "Should verify-against-source (IS-1) be encoded as a governing rule or left a disposition?",
  "question_id": "Q2",
  "ruling_text": "Encode it, in PR18's form — naming a specific moment and a specific check, not a general exhortation. IS-2 holds architecturally without encoding; IS-1 demonstrably does not — the corpus shows it failing in the presence of correct knowledge (R089 and R101 both state the rule in the same reflection where they report having broken it). A disposition that fails in the presence of its own articulation is not a stable disposition; it is a known gap wearing the appearance of one. Encoding it does not substitute for the attention that makes the rule unnecessary — the Q3 answer names prosoche as the root — but encoding it at a specific moment (before a claim enters a durable artifact) gives the attention a structural anchor it currently lacks.",
  "status": "active",
  "superseded_by": null,
  "downstream_dependencies": [
    {
      "item_id": "WI-002-PR-RULE-TEXT",
      "item_type": "work_item",
      "relationship": "unlocks — this ruling licenses drafting the PR-series rule text as item 1 of the reflections arc"
    },
    {
      "item_id": "IS-1",
      "item_type": "pattern",
      "relationship": "informs — updates the pattern record's governance_routing from candidate to routed"
    },
    {
      "item_id": "IW-3",
      "item_type": "pattern",
      "relationship": "informs — the same moment-and-source form is the amendment candidate named for IW-3 in the findings record"
    }
  ],
  "source_document": "2026-08-23-assessment-and-recommendations-for-mentor-ruling.md, Q2 response; folded into 2026-08-23-project-reflections-findings-record.md §4 IS-1 entry",
  "notes": "This ruling text is a close paraphrase of the mentor's verbatim response, condensed for the record field; the source document carries the full text if exact wording is needed for a future citation."
}
```

---

## Record type 4 — Governance rules

```
id                  string, required, primary key          e.g. "AC5"
record_type         string, required, fixed: "governance_rule"
series               enum, required: "R" | "PR" | "AC"
rule_text            string, required
rule_text_summary    string, required — first 20 words
date_enacted         string, required, ISO 8601 date
last_verified_at     string, nullable, ISO 8601 datetime
created_at           string, required, ISO 8601 datetime
last_updated_at      string, required, ISO 8601 datetime
dependent_records    array of objects, required (may be empty)
  record_id             string, required
  record_type            enum, required: "session_reflection" | "ruling" | "reasoning_pattern" | "work_item"
staleness_status     enum, derived — see derivation logic below
open_corrections     array of strings, required (may be empty)
notes                string, optional
```

**`staleness_status` derivation** (computed at query time, never stored): given `today` and `last_verified_at`,
- `last_verified_at` is `null` → `"unverified"`
- `today − last_verified_at ≤ 30 days` → `"current"`
- `31–60 days` → `"amber"`
- `> 60 days` → `"stale"`

### Worked example — AC5

```json
{
  "id": "AC5",
  "record_type": "governance_rule",
  "series": "AC",
  "rule_text": "The R20a vulnerable-user protections apply to forty-four routes, as enumerated in r20a-invocation-guard.test.ts — forty-two route-level (the await enforceDistressCheck(detectDistressTwoStage(...)) pattern) plus two substrate-gate (the enforceLayer2R20aGate pattern, which reuses A7 and internally invokes the same Haiku classifier). This section does not hand-enumerate route-level membership — it did, twice, and both enumerations went stale; the registry is canonical.",
  "rule_text_summary": "The R20a vulnerable-user protections apply to forty-four routes, as enumerated in r20a-invocation-guard.test.ts — forty-two route-level plus two substrate-gate",
  "date_enacted": "2026-08-23",
  "last_verified_at": "2026-08-23T00:00:00Z",
  "created_at": "2026-08-23T00:00:00Z",
  "last_updated_at": "2026-08-23T00:00:00Z",
  "dependent_records": [
    {
      "record_id": "IW-3",
      "record_type": "reasoning_pattern"
    },
    {
      "record_id": "R080",
      "record_type": "session_reflection"
    }
  ],
  "open_corrections": [],
  "notes": "IMPORTANT — real-data correction to the mentor's own instruction, folded here per the reflections arc's own diagnosis: the brief for this schema described AC5's open correction as 'stated route count (13/16) does not match derived count (44); correction cleared; not yet applied.' That was accurate when written but is now stale — the correction WAS applied in this same session (manifest.md and CLAUDE.md both corrected, committed as 7c77123, pushed, Vercel green — confirmed by the founder before this document was drafted). open_corrections is therefore empty, not populated with the pending-correction string the brief specified. This is disclosed rather than silently corrected, because it is a live, small-scale instance of exactly IW-3/IW-1 — a claim inherited into a brief and restated without re-checking against the thing it describes, caught only because this document's author happened to have edited the file being described in the same session."
}
```

---

## Record type 5 — Work items

```
id                    string, required, primary key           e.g. "WI-001"
record_type           string, required, fixed: "work_item"
arc                   enum, required: "reflections" | "sagereasoning_atrf" | "sagereasoning_standing_runner" | "sagereasoning_epistemic_status" | "sagereasoning_oc_gate3"
description           string, required
sequence_position     integer, required
status                enum, required: "cleared" | "in_progress" | "blocked" | "complete" | "deferred"
date_cleared          string, nullable, ISO 8601 date
date_started          string, nullable, ISO 8601 date
date_completed        string, nullable, ISO 8601 date
days_in_current_status integer, derived — see below
blocked_by            array of strings, required (may be empty)
dependencies          array of objects, required (may be empty)
  item_id                string, required
  item_type               enum, required: "work_item" | "ruling" | "governance_rule"
  dependency_type          enum, required: "must_precede" | "informs" | "gates"
ruling_references     array of strings, required (may be empty) — references record type 3
staleness_flag        boolean, derived — true if status is "cleared" and days_in_current_status > 14
notes                 string, optional
```

**`days_in_current_status` derivation:** `today − (the most recent non-null date among date_completed, date_started, date_cleared, in that priority order)`.

### Worked example — WI-001 (this session's own output)

```json
{
  "id": "WI-001",
  "record_type": "work_item",
  "arc": "reflections",
  "description": "Design the JSON schema and dashboard specification for the reflections corpus (item 5 of the reflections arc sequence).",
  "sequence_position": 5,
  "status": "complete",
  "date_cleared": "2026-08-23",
  "date_started": "2026-08-23",
  "date_completed": "2026-08-23",
  "days_in_current_status": 0,
  "blocked_by": [],
  "dependencies": [
    {
      "item_id": "RULING-SEQUENCING-2026-08-23",
      "item_type": "ruling",
      "dependency_type": "gates"
    }
  ],
  "ruling_references": ["RULING-SEQUENCING-2026-08-23"],
  "staleness_flag": false,
  "notes": "This design output does not itself license a build; a future build session inherits the two named boundary constraints (see the SageReasoning boundary section below) as a hard gate before implementation."
}
```

---

## Record type 6 — ATRF open questions

```
id                    string, required, primary key            e.g. "GS-ATRF-4"
record_type           string, required, fixed: "atrf_question"
question_text         string, required
question_summary      string, required — one sentence
status                enum, required: "open" | "ruled" | "deferred"
date_opened           string, required, ISO 8601 date
last_updated_at       string, required, ISO 8601 datetime
ruling_reference      string, nullable — references record type 3
resolution_path       string, required
session_context       string, required
days_since_update     integer, derived — today − last_updated_at
staleness_flag        boolean, derived — true if days_since_update > 14
notes                 string, optional
```

**These are snapshot references, not owned records** — see the file-structure section below. The reflections arc does not resolve ATRF questions; this record type exists so the dashboard can show them for founder visibility.

### Worked example — GS-ATRF-4

```json
{
  "id": "GS-ATRF-4",
  "record_type": "atrf_question",
  "question_text": "The ATRF carries propositions through the reasoning harness — impressions, candidate ideas, blast-radius assessments, completion signals. Open question: should each consequential proposition carry a formal epistemic status (observation / inference / assumption / unknown), and if so, where in the harness does that status get assigned, checked, and disclosed? The governing rule is that confidence of an explanation must never exceed its evidential basis.",
  "question_summary": "Should every consequential ATRF proposition carry a formal epistemic status, and where does the harness assign/check/disclose it?",
  "status": "ruled",
  "date_opened": "2026-08-19",
  "last_updated_at": "2026-08-19T00:00:00Z",
  "ruling_reference": "2026-08-19-mentor-ruling-gsatrf4-epistemic-status-verbatim.md",
  "resolution_path": "Ruled 2026-08-19 (Q(a): formally added as GS-ATRF-4); the routing question this record's own schema exists to surface is its downstream vocabulary scope, which the mentor's ruling explicitly carries forward as a named direction — not this record's ruling — to the generation-step / ATRF scoping-session line.",
  "session_context": "Raised same-day (2026-08-19) as a three-part question; ruled same day; live end-to-end as of the same session (project-context.json v1.4.0 and the production project_context row both updated).",
  "days_since_update": 4,
  "staleness_flag": false,
  "notes": "IMPORTANT — this record demonstrates why record type 6's status enum includes 'ruled', not only 'open': at the time this schema is being designed, GS-ATRF-4 is not an open question, it is a ruled one, cited elsewhere in the project as the origin of the provenance vocabulary (observation/inference/assumption/unknown) this whole schema borrows for its own provenance fields. Using it as the type-6 worked example without checking its current status first would have reproduced the schema's own subject matter as an error in the schema's own documentation — an inherited status claim, restated unverified. It was checked (operations/decision-log.md, the D-GSATRF4-RULED-APPLIED-2026-08-19 entry) before this record was written. This record is a read-only snapshot; the reflections arc does not own GS-ATRF-4 and does not resolve it. snapshot_date and may_be_superseded fields (per the SageReasoning-boundary section below) apply to this record type."
}
```

---

## Schema-wide requirements

**Provenance markers — which fields, and why.** A `provenance` field (enum: `observation` | `inference` | `assumption` | `unknown` — the vocabulary GS-ATRF-4 itself established, reused here rather than re-derived) appears on: record type 1's `pattern_attributions[].provenance` (a claim that a specific reflection instantiates a specific pattern is an inference about the reflection's content, never a bare fact); record type 2's `stoic_diagnosis.provenance` and `trend.provenance` (a passion/eupatheia attribution and a trend direction are both interpretive claims about aggregate evidence, not measurements). No other field type carries a provenance marker, because no other field represents an inferential claim — record type 3's `ruling_text` is a transcription of an external decision, record type 4's `rule_text` is a transcription of a governing document, record type 5's `status` is a direct state report, and record type 6's `question_text` is likewise a transcription. Provenance on a transcription field would mark the wrong thing — whether the *transcription* is accurate is a fidelity question (addressed by verification practice, not a schema field), not whether the *underlying claim* is observed, inferred, assumed, or unknown.

**Cross-references use IDs only — no embedded copies.** Every reference between record types (`pattern_id`, `rule_id`, `item_id`, `ruling_reference`, and all `downstream_dependencies`/`dependencies` entries) is an ID string resolved through the cross-reference index, never an inline copy of the referenced record's content. This is a schema constraint, not a convention: an embedded copy drifts the moment its source updates, and this schema's central subject matter — claims that go stale because nothing forces a check against the source — makes that failure mode specifically unacceptable to build into the schema's own structure.

**Derived fields are computed at query time, never stored.** `staleness_status` (record type 4), `days_in_current_status` and `staleness_flag` (record type 5), `days_since_update` and `staleness_flag` (record type 6), and `trend.direction` (record type 2, when computed from the windowed comparison rather than supplied as an inference) are all derived. Derivation logic for each is stated inline above (types 4–6) and in `derived-fields-spec.md` (the single source of truth, per the file-structure section). None of these values is ever written to a data file; a query agent computes them from stored inputs (`last_verified_at`, `date_cleared`/`date_started`/`date_completed`, `last_updated_at`, `today`) every time.

**Migration-path design decision.** The one choice that most affects a future graph-store or relational migration is `cross-reference-index.json` being a **flat lookup table** (`{ID: filename}`), not a graph adjacency structure. The alternative considered was native edge definitions — each record type file carrying explicit typed edges to every record it references, queryable without a separate index. The flat lookup was chosen because it is readable by a lightweight agent with no graph query engine, at the cost that a graph-store migration must replace the index with real edges rather than reuse it. This is stated explicitly so a future migration is not blocked by treating the flat index as permanent — it isn't.

---

## The SageReasoning boundary — named as a hard boundary, not a soft caution

**Where the schema touches SageReasoning material, and how far it goes:**

The **only** point of contact is record type 3 (ruling records) and record type 6 (ATRF questions), where a reflections-arc ruling or ATRF question references a SageReasoning-arc ruling — including rulings that governed changes to the evaluative engine's signed-assessment structure (the Evaluative Engine Epistemic Status arc's EE-C1 wording ruling, EE-D2's signature-scope disclosure). If a ruling record in this schema holds a snapshot of a ruling that itself governs a signed-assessment field, a future agent querying this schema could surface that ruling's content as current governing text when the SageReasoning arc has since superseded it. **This is not a problem the reflections-arc schema creates — it is a problem the snapshot-reference design must name and manage,** and the management mechanism is structural, not advisory: every reflections-arc ruling or ATRF-question record that references SageReasoning governance material carries two required fields not otherwise present in this document's field lists —

```
snapshot_date       string, required on cross-arc references, ISO 8601 date — the date this record's content was last confirmed against the SageReasoning source
may_be_superseded    boolean, required on cross-arc references — true unless the snapshot_date is within a window the build session defines and documents
```

A future agent querying a record carrying `may_be_superseded: true` must verify against the SageReasoning upstream source before acting on the content — the field exists specifically so that check cannot be skipped by omission.

**No other field in this schema crosses the byte-identity or PR19 boundary.** The schema holds no evaluative-engine outputs, no signed-assessment fields, and no claim surface on the engine's own reasoning — every field above is either a transcription of a governance document, a record of a session's self-reported reflection, or a derived tracking value over those two things. **Stated as a hard boundary, not a soft caution, per the mentor's instruction: if this schema is ever extended to hold per-session evaluative-engine outputs alongside session reflection records, that extension requires its own PR19-reviewed build scoping before implementation.** This document does not license that extension, and no future session should read the schema's flat-file structure as pre-approving it.

---

## File structure

```
/reflections-corpus/
  schema-version.json          — one record: version, date of last schema change, changelog array
  cross-reference-index.json   — flat lookup: { "R018": "session-reflections.json", ... }
  derived-fields-spec.md       — single source of truth for all derivation logic; data files never store derived values
  session-reflections.json     — array of record type 1, owned by the reflections arc
  reasoning-patterns.json      — array of record type 2, owned by the reflections arc
  rulings.json                 — array of record type 3; reflections-arc rulings owned here, SageReasoning rulings held as snapshot references (snapshot_date + may_be_superseded)
  governance-rules.json        — array of record type 4; reflections-arc rules (item 1's PR-series text, once ruled) owned here, SageReasoning rules (R/PR/AC-series) held as snapshot references
  work-items.json              — array of record type 5, reflections-arc only; a SageReasoning-arc dependency is recorded as an ID reference with cross_arc: true, never as an owned record
  atrf-questions.json          — array of record type 6, snapshot references only, existing solely so the dashboard's Panel 5 can show ATRF status without a live cross-arc query
```

---

## Named design decisions register

| ID | Decision | Alternative | Cost of decision | Cost of alternative | Confirm at build? |
|---|---|---|---|---|---|
| DD-001 | ID-only cross-references | Embed referenced content inline | Requires a join via the cross-reference index at query time | Embedded copies drift on source update; schema size grows per embed | No — correct as designed |
| DD-002 | Snapshot references to SageReasoning records, not live | Live references into the SageReasoning data layer | Drift possible between snapshots; managed, not eliminated, by `snapshot_date`/`may_be_superseded` | Requires the SageReasoning data layer to be queryable from the reflections arc — a cross-arc runtime dependency this arc is meant to avoid | **Yes** — confirm the snapshot discipline is actually implemented, not merely specified |
| DD-003 | Derived fields computed at query time | Store derived fields as static values | Requires derivation logic in the query layer, kept current in `derived-fields-spec.md` | Static values drift silently whenever source data changes without a corresponding write | No — correct as designed |
| DD-004 | Flat files, one per record type | Graph store or relational DB from the outset | A join-layer workaround (the cross-reference index) for what a real graph store gives natively | Higher setup cost now; a graph query engine is disproportionate to 105 sessions and 25 patterns | No — proportionate now; revisit past ~500 records or when query complexity outgrows the flat index |
| DD-005 | Provenance markers on inference fields only | Provenance on every field | Lighter schema; provenance means something only where an inference sits | Uniform provenance dilutes the signal on fields where it carries no information | No — correct as designed |
| DD-006 | Snapshot + explicit drift markers for SageReasoning rulings | Treat all ruling records as reflections-arc-owned | Drift risk managed, not eliminated; the querying agent must verify before acting | A full copy would be a second source of truth for SageReasoning governance content — itself a PR19-class obligation this arc has no standing to take on | No — correct as designed |
| DD-007 | ATRF questions held as snapshots for Panel-5 visibility | Exclude ATRF questions from this schema entirely | Panel 5 can show ATRF status without a live cross-arc query; snapshot discipline applies | Cleanest arc separation, zero snapshot-drift risk — but Panel 5 then needs a live cross-arc query at runtime, the dependency this whole design avoids elsewhere | **Yes** — confirm the visibility benefit is worth the snapshot-discipline cost, versus accepting Panel 5 has no live ATRF data |

This is one workable design, not the only one. The record types, field shapes, and file layout above should be read as a considered proposal for the build session to confirm, adjust, or override — not as a specification the build session merely transcribes into code.
