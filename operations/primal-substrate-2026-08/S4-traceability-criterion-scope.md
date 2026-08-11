# S4 — Scope: the traceability criterion (the examined-assent verification problem)

**Mentor heading 4.** **Execution order: 1 of 8 — first.** See `00-PRIORITY-INDEX.md` for why.

---

## §0 Status, tier, gate

> **RULED 2026-08-11 — all four open questions answered; the corrections (A6) confirmed.** Verbatim
> record, which wins over every annotation below:
> `2026-08-11-mentor-ruling-scope-confirmation-verbatim.md`. **The cross-endpoint comparison starts
> IMMEDIATELY** (B7) — it is a protocol change on the live validation run, carried through the run's
> own channel, **which is a founder relay into `RUN-LOG.md`, not a repo-side edit.** The table
> extension stays parked on the §6 report. Rulings folded inline below as **RULED** annotations;
> proposal prose kept, marked ruled rather than deleted.

**Status: SCOPE. Nothing here licenses a build, a schema change, a flag, or a route.** The concurrent
half is a documents change plus a **process** change that belongs to the validation run's own channel,
not to a repo build session. The parked half is a schema change and stays parked.

- **Tier for the concurrent half:** `governance` / documents. No code.
- **Tier for the parked half (when it opens):** `code-critical` — an additive migration on
  `idea_loop_candidates`, therefore a founder-walked 0c-ii step in its own right.
- **Deadline:** the validation run's **§6 report**. This item exists to change how cycles are
  reviewed *while cycles are still being run*. Written after the report, it is an autopsy rather than
  an instrument.
- **Parked half waits on:** the **§6 report** (not "the first build gate", which has closed — see
  §7.4).

**Why this is first.** It carries the strongest safety argument in the family. There are now **two
distinct `/api/reason` defects inside five cycles**, of opposite sign, and the run log's own
instruction is that a resuming session *"should not treat `/api/reason` as trustworthy by default"*
with an explicit escalation trigger on a third occurrence. The mentor's criterion is precisely what
turns that instruction from a caution into a check.

---

## §1 What the mentor said

The heading names the **locust problem** — *"the difference between an agent that genuinely performs
examined assent and one that simulates it producing correct outputs"* — and states it is *"not a
problem the validation run solves"* but *"a problem the validation run is designed to surface evidence
about."*

The criterion, verbatim and load-bearing:

> genuine examination produces verdicts that are **traceable to the specific content examined**,
> **proportionate to the actual virtue domains engaged**, and **consistent across equivalent inputs**.
> Simulated examination produces verdicts that are **confident, formulaic, and contaminated by context
> that was not in the input**.

Three consequences are named:

1. **Infrastructure:** *"the watching table needs to carry not just the proximity verdict but the
   traceability evidence — the specific content from the input that generated each extraction
   element."*
2. **Process:** *"That traceability check should be a systematic part of the cycle review, not an ad
   hoc anomaly detection."*
3. **Human practitioners:** the equivalent is naming the specific impression — *"Not 'I felt
   competitive' but 'I felt competitive when X said Y, because I interpreted it as a threat to Z.'"*
   (This third consequence is **built in S7**, not here; S4 supplies the criterion, S7 supplies the
   surface. Cross-referenced so neither document re-derives it.)

The mentor cites cycle 3 as the concrete instance: *"the service produced a confident verdict computed
over the wrong input. Served-200, substantively wrong. That is the locust wearing the appearance of
virtue."*

---

## §2 Mechanism facts (PR20) — what a build would land on

> **AMENDED 2026-08-11 (cycle 6) — there are now THREE failure classes, and B7 is DISCHARGED.**
> Verified first-hand against the run log, not inferred from a summary:
> - **B7 is in force from cycle 6** (`RUN-LOG.md:286`, *"Ruling 2026-08-11 (B7, with C2/C3/C4) — the
>   cross-endpoint traceability check, in force from cycle 6"*). The relay is discharged; the check is
>   running and has its own carried-findings table (`:371`).
> - **A third `/api/reason` failure class fired at cycle 6: `layer1_throw`** — an honest served
>   fallback (`extraction: null`, `meta.fallback: true`, `fallback_reason: "layer1_throw"`), reproduced
>   on retry, cycle written `dependency_unavailable`.
> - **Mentor-ruled: NOT the third strike.** *"A `layer1_throw` with null extraction is the service
>   announcing its own failure honestly. It did not serve a wrong verdict. It served no verdict … This
>   is the infrastructure working as designed under a different failure class — honest unavailability
>   rather than confident wrongness."* The escalation bar exists because *"a pattern of confident wrong
>   verdicts entering the run undetected would corrupt the §6 findings irreparably. A pattern of honest
>   null returns does not carry that risk."* **Cycle 7 proceeds; three failure classes carried as named
>   §6 findings.**
> - **The B7 recording vocabulary needs a THIRD value** — see §2.1b. The run session applied the check
>   at cycle 6 and immediately hit a condition the two named divergence signatures do not cover, and
>   correctly refused to force it into either.

### §2.1 The incidents, and why they matter differently than the synthesis assumes

The synthesis argues from **one** incident. There are now **three**, and they do not share a sign. All
three are ruled and recorded; all three are `/api/reason`; all three reproduced on retry.

| | Cycle 3 (2026-08-10) | Cycle 5 (2026-08-11) | Cycle 6 (2026-08-11) |
| --- | --- | --- | --- |
| `failure_class` (mentor-ruled) | `contamination` | `extraction_instability` | `layer1_throw` |
| Shape | Extracted content **never submitted** | Failed to extract content **genuinely submitted** | **Made no attempt** — `extraction: null`, `meta.fallback: true`, honest `fallback_reason` |
| Mentor's phrasing | contamination by **addition** | contamination by **omission** | *"the service announcing its own failure honestly"* |
| Root cause | `/api/reason/route.ts:1409` called `getProjectContext('condensed')` unconditionally; the block was **unlabelled**, unlike its already-labelled `domain_context` / `urgency_context` siblings | **No clean fix.** Mentor-ruled *"not a defect with a clean fix"*; carried as a named §6 finding; **no further diagnostic probes before cycle 6** (explicit instruction) |
| Status | **FIXED + verified** (`D-REASON-INPUT-CAP-VS-PROJECTCONTEXT-CONTAMINATION-FIXED`, 2026-08-11): label added in `layer1-extractor.ts`; `tsc` 0; `injection-defence` 60/60 incl. a new mutation-verified pin; deployed Vercel-green; probe clean | **OPEN, by ruling** — carried, not chased |

**The decisive property cycles 3 and 5 share**, in the mentor's own cycle-3 words: *"a served-but-wrong
verdict cannot be distinguished from a correct one without independent knowledge of what was actually
submitted."*

**Cycle 6 does NOT share it, and that is the whole of the mentor's ruling.** An honest null return is
distinguishable from a correct verdict without any independent knowledge — the service says so itself.
The two classes therefore carry different risk to the §6 findings: confident wrongness **contaminates**
the verdicts that were completed; honest unavailability only **reduces the count** of completed
verdicts. The first corrupts irreparably; the second costs cycles and preserves integrity.

**The mentor's framing of the run's three `dependency_unavailable` outcomes (cycles 3, 5, 6) is worth
carrying into the §6 report verbatim, because the naive reading is the opposite one:** *"they are not
evidence that the run is unreliable. They are evidence that the retry-then-stop discipline is working.
A run that recorded verdicts from contaminated, instability-affected, and null-extraction cycles would
have a higher completion rate and a less trustworthy §6 report. The discipline is costing cycles and
preserving integrity. That is the correct trade."*

### §2.1b The B7 recording vocabulary needs a third value — found by the check on its first cycle

The B7 relay specified two divergence signatures (empty-vs-populated; disjoint domain sets) and three
recording values (`clean` / `diverged` / `unlabelled`). **Cycle 6 produced a fourth condition on the
check's very first application**, and the run session correctly refused to file it under either
signature (`RUN-LOG.md:1749`):

> *"**not comparable — a third signature, distinct from both named in the B7 ruling.** The reason
> endpoint did not serve a wrong or thin reading; it honestly declined to evaluate at all
> (`fallback_reason: "layer1_throw"`) … Empty-vs-populated (cycle 5) presumes a populated guardrail
> side against an *attempted-but-empty* reason side; **here the reason side made no attempt.** Named as
> a fourth signature for the ruling's scope, not filed under either of the two named ones, since
> forcing it into 'empty-vs-populated' would misdescribe an honest failure as an extraction defect."*

**This is the check working as intended on its first run** — it met an unanticipated condition and
named it honestly rather than coercing it into the taxonomy. Two consequences:

1. **The recording vocabulary gains `not_comparable`**, distinct from `diverged`: the comparison could
   not be performed, because one side did not attempt an extraction. It is **not** a divergence and
   must not be counted as one in the §6 rate — doing so would inflate the divergence rate with honest
   outages.
2. **Under B5's frozen discriminator, `not_comparable` behaves like `unlabelled` — out of scope.** The
   discriminator is restricted to cycles *cross-checked clean*; a cycle where the cross-check could not
   run is not clean, and inferring clean from a non-comparison is the exact error the `unlabelled`
   category exists to prevent.

### §2.1c The check has acquired a second, named diagnostic job (mentor, cycle 6)

Beyond detecting divergence per se, the mentor has assigned the cross-endpoint check a specific
discriminating task — see §2.6.

### §2.2 The criterion already has a working instance — and this is the most useful fact in this document

**Cycle 5 was detected by a cross-endpoint comparison, and nothing else.** The same action text went
to `/api/guardrail` (Step 2) and `/api/reason` (Step 5) minutes apart in the same cycle:

- `/api/guardrail` Layer-1: three `control_filter_elements`, three `oikeiosis_circles_engaged`, two
  `kathekon_factors` → `principled` / `is_kathekon: true`.
- `/api/reason` Layer-1 on the **identical action text**: **every extraction category empty**, plus an
  explicit note that *"no Stoic features are extractable from the input as presented"* → `deliberate`
  / `is_kathekon: false`.

The run log states the inference exactly: this *"is not a floored version of the guardrail's reading
(floors can only make a verdict more conservative on a shared extraction) — it is a verdict computed
over a **different, materially poorer extraction of the same text**."*

**This is the traceability criterion, already operating, in a form that costs nothing extra.** Every
cycle already sends each candidate's text through `/api/guardrail` during filtering, and the winner's
text through `/api/reason`. The two extractions of the same text are therefore **already both
produced** — they are simply never compared. Making that comparison systematic is the cheapest
possible realisation of the mentor's "systematic part of the cycle review", and it requires **no
schema change, no new call, and no new cost**.

This reframes the concurrent half from "add a new check" to "compare two readings the run already
pays for."

### §2.3 The existing traceability affordance in the schema

`website/supabase-idea-loop-watching-migration.sql` §2, `idea_loop_candidates`, already carries:

```sql
  -- §2.5 traceability affordance: checkable against SageReasoning's own signed
  -- assessments + loop_billing_events rows where present; never required.
  guardrail_session_id TEXT,
```

So a **call-level** traceability handle exists and is ruled *"never required"*. What does **not**
exist is **element-level** traceability — the mentor's *"the specific content from the input that
generated each extraction element."* The full committed column list for `idea_loop_candidates`, read
first-hand 2026-08-11:

`id`, `cycle_id`, `gap_ref`, `heuristic`, `proposed_action`, `classification_kind`,
`classified_domains`, `generation_confidence`, `guardrail_proximity`, `guardrail_domains`,
`guardrail_session_id`, `passed_novelty_check`, `novelty_confidence`, `novelty_basis`,
`cycle_outcome`, `unavailable_dependency`, `created_at`.

There is **no** column carrying extraction elements, and none carrying `target_circle` (see S8 §2.2 —
the same gap, surfaced from the other direction).

### §2.4 What the engine already returns that the run does not persist

The extraction is **already on the wire**. `/api/reason` returns the `extraction` object alongside the
signed assessment (the disclosed-extraction posture the guardrail port also adopted — the R10 change
of 2026-06-19 put `extraction` on the guardrail response explicitly so a verdict is
*"reproducible-from-extraction"*). The elements the criterion needs —
`control_filter_elements`, `oikeiosis_circles_engaged`, `kathekon_factors` — are the fields both
incidents were diagnosed from. **The evidence exists per call and is discarded per cycle.**

That is the precise gap: not that the system cannot produce traceability evidence, but that the
run's record keeps the verdict and drops the basis.

### §2.5 Adjacent, deliberately NOT in scope

- **The larger `projectContext` architectural fix** — removing injection from API-key-authenticated
  `/api/reason` calls entirely, on the mentor's reasoning that *"an agent's pure examination should
  rest on the proposal, the Stoic Brain, and the practitioner profile, not the project's internal
  decision log."* **Mentor-RULED, deliberately NOT built, and NOT scheduled.** It was gated on cycle 4
  completing cleanly (which it did) but has no session. **Do not build it unless the founder
  explicitly asks.** Named here only so a build session does not "discover" it and assume it is owed.
- **`practitionerContext`'s identical unlabelled defect** — named 2026-08-11, deliberately left
  untouched under a narrow-scope instruction. A known-open item, not work in this scope.

### §2.6 The dikaiosyne floor pattern (cycle 6) — the check's second diagnostic job

**What happened.** Cycle 6 produced the run's **first genuine `rejected_by_guardrail` verdicts**: three
of six candidates (h1, h2, h4) received full, signed, populated examinations returning
`proceed: false`, each floored all the way to `reflexive` by the same mechanism —
`dikaiosyne: "reflexive"` in `proximity_floors` — regardless of the unfloored `base`. **h4's base was
`principled`, the highest of the cycle**, cut to the lowest rank on the scale.

**This is live production behaviour**, not a run artefact: the ADR-010 §4 unity-thesis minimum-domain
rule, `SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED=true` since 2026-06-25, operating on `/api/guardrail` via
the §3-bridge retirement (2026-06-26). So this bears on the repo, not only on the §6 report.

**The mentor's two readings, verbatim in substance:**

- **(a) Genuine.** *"the guardrail is doing something philosophically precise: it is refusing to endorse
  disclosure proposals that would overclaim the system's current reliability. That is not a defect.
  That is the justice domain working correctly."* — the justice question being whether a disclosure
  *"accurately represent[s] what the system actually does"*, when examination fidelity is precisely
  what the run is testing.
- **(b) False positive.** *"the dikaiosyne floor is firing on a false impression — treating disclosure
  proposals as claims about output quality when they are actually proposals about transparency
  infrastructure."*

**One explanation is already ruled out, by the run session itself.** The control filter classified all
of h1/h2/h4's proposed changes as `"outside"` prohairesis — but *"h3, h5, and h7 — the three that
passed — are phrased identically in kind"* (also system-level proposals), so
classification-as-`outside` does not explain the split.

**A sharper discriminator this scoping proposes — a refinement, not a settled diagnosis.** Across all
six candidates, one line separates the floored from the passed cleanly:

| Candidate | Proposal | Verdict |
| --- | --- | --- |
| h1 | a thin-extraction flag **on the trust record** | **floored** (base `deliberate`) |
| h2 | an extraction-confidence note **next to each signed assessment** | **floored** (base `deliberate`) |
| h4 | MEASURE-vs-ENFORCE language **on the trust record's own wording** | **floored** (base `principled`) |
| h3 | relocate **existing** `/limitations` + `/transparency` content into the SDK README | passed, `principled` |
| h5 | publish the full SDK | passed, `deliberate` |
| h7 | a CI check on a timeout constant | passed, `principled` |

The discriminator is not *disclosure versus shipping* — **h3 is a disclosure proposal and it passed at
the cycle's joint-highest proximity.** It is **whether the proposal places a NEW claim about assessment
reliability onto the assessment-bearing surface itself.** h1/h2/h4 do; h3 relocates content already
published elsewhere; h5 and h7 make no reliability claim at all.

**Why this matters for the mentor's two readings:** reading (b) — a blanket misreading of disclosure
proposals as output-quality claims — **predicts h3 would also floor.** It did not. Reading (a) predicts
exactly the observed asymmetry: refuse new reliability claims on the record while reliability is under
test; accept honest limitations content moving to a new surface. **On the evidence available, the
asymmetry points toward (a).**

**Honest bounds, which must ride this wherever it is reported:**
- **N = 6, in one cycle.** The run log's own note applies: this is *"the first time this run's guardrail
  step has produced enough variance in a single cycle … to observe a within-cycle pattern like this at
  all."*
- **The discriminating evidence the mentor named is not yet available.** The mentor assigns the
  cross-endpoint check the job of separating the readings — *"If the guardrail and reason extractions
  agree on the dikaiosyne failure for this proposal class, the floor is more likely genuine. If they
  diverge, the floor may be an extraction artefact."* **Cycle 6 could not supply it**: the winner's
  reason-side call was the `layer1_throw`, so cycle 6's B7 row is `not_comparable` (§2.1b). The
  discriminating evidence begins at cycle 7 at the earliest.
- **Rejected candidates never reach the reason endpoint at all.** The ruled sequence filters at the
  guardrail step, so `rejected_by_guardrail` candidates are excluded from novelty and never consulted —
  meaning the cross-endpoint check, as specified, runs **only on winners** and will therefore *never*
  directly compare the two readings **for a floored candidate**. The discriminating evidence is
  necessarily indirect: it comes from whether winners of the same proposal class show extraction
  agreement, not from re-examining the floored ones. **Named as an open question (Q4-e), because the
  mentor's stated test may not be performable in the form stated.**

**Binding instruction, carried:** *"do not adjust the generation heuristics to avoid producing
disclosure proposals. The pattern is data."*

---

## §3 The concurrent half — what can be done now

Three deliverables. None touches code.

### §3.1 The criterion, written down as a checkable instrument (repo document)

**Deliverable:** `operations/primal-substrate-2026-08/traceability-criterion.md` — the mentor's three
properties turned into three checks a reviewer can actually apply, each with the failure signature it
detects.

| Property (mentor) | The check | Detects |
| --- | --- | --- |
| **Traceable to the specific content examined** | For each extraction element, can a specific span of the submitted text be named as its source? | Cycle 3's class — elements with no source in the input |
| **Proportionate to the actual virtue domains engaged** | Do the domains claimed match what the text actually engages — neither inflated nor empty? | Cycle 5's class — an empty read of a text that demonstrably engages domains |
| **Consistent across equivalent inputs** | Do two examinations of the same text agree? | Both classes — this is the cross-endpoint comparison of §2.2 |

Each check must state its **negative** case explicitly (what a *pass* looks like), because a criterion
that only names failure will read every unusual verdict as a defect. This is the same discipline the
evidence-floor work follows: *never a defaulted pass or fail.*

**Honest bound the document must carry:** this criterion detects **divergence and unsourceability**.
It does not detect a *consistently* wrong extraction — two agreeing readings can both be wrong. That
is the residual, and it is the same structural residual the gaming-robustness bar named as the A2
class (self-report omission). State it; do not imply the criterion closes the locust problem. It
narrows it.

### §3.2 The cross-endpoint consistency check — routed to the run, not built here

**Deliverable:** a proposed addition to the run's per-cycle review, delivered through the validation
run's own channel (`RUN-LOG.md` / the mentor-question channel), **not** committed as a repo process
change by a `sagereasoning` build session.

**Why routed rather than built:** the run is live, founder-attended, and has its own ruling channel
and an established stop-and-escalate posture. A repo-side session changing the run's review protocol
mid-flight would be exactly the cross-project reach the parallel-window prompt exists to prevent.

**Content of the proposal:**
1. For each cycle's **winner**, record both extractions — the `/api/guardrail` reading from Step 2 and
   the `/api/reason` reading from Step 5 — for the same action text.
2. Compare on three axes: element counts per category; the domain set; the resulting proximity.
3. A **material divergence** (an empty-vs-populated read, or a domain set disjoint from the sibling's)
   is a **finding**, handled under the existing retry-then-stop posture, not a footnote.
4. Agreement is recorded too — the negative case is evidence, and a run that only records anomalies
   cannot report a rate.

**What this costs:** nothing. Both readings are already produced and already billed.

**What it would have caught:** cycle 5, at the moment it happened, by rule rather than by an alert
reviewer noticing.

### §3.3 The §6 report requirement

**Deliverable:** a stated requirement, carried into the §6 report shape, that the report distinguish
the two failure classes by name (`contamination` / `extraction_instability`) and report **how many
winner cycles were cross-checked and how many diverged** — a rate, not an anecdote. Without a
denominator, "two incidents in five cycles" cannot be interpreted.

---

## §4 The parked half — the watching-table extension

**Parked on: the §6 report.** Not on "the first build gate", which closed 2026-08-10.

**Shape, specified now so the build does not re-derive it:**

- **An additive, nullable column** on `idea_loop_candidates` carrying the winner's extraction evidence
  — the same posture as the existing `guardrail_session_id` affordance: *checkable where present,
  never required*.
- **Nullable and non-blocking by construction.** The write must never be able to fail a cycle record.
  The precedent is the whole watching table's own ruled posture (nullable fields + CHECK vocabulary
  representing whatever actually happened, including failure states).
- **Populated for the winner only**, at minimum. Populating for all seven candidates multiplies the
  row payload by seven for evidence whose value is concentrated in the examined winner. If the §6
  data shows non-winner divergence matters, widen it then.
- **R17c retention applies unchanged** — the table's existing `retain_until` (90 days) and the
  existing sweep/data-rights wiring cover the new column with no additional work, because it is a
  column on an already-covered row.
- **This is a founder-walked 0c-ii Critical step** when it opens: an additive migration on a live
  table, applied TEST → prod with a `§VERIFY` block, per the house pattern.

**Open design point the build must decide, named not resolved:** whether the column stores the
extraction **verbatim** (full fidelity, larger rows, and it is agent-authored text about the run's own
task list) or a **derived summary** (element counts + domain set + a divergence flag — enough to
compute a rate, not enough to re-audit a specific verdict). The criterion in §3.1 needs only the
latter; the mentor's wording (*"the specific content from the input that generated each extraction
element"*) asks for the former. **Question Q4-c below.**

---

## §5 Open questions for the mentor

**Q4-a — Does the cross-endpoint comparison satisfy the "systematic part of the cycle review"
requirement?** The synthesis asks for traceability evidence in the watching table. §2.2 shows a check
with the same detective power is available **now, at zero cost, with no schema change**, because both
extractions are already produced. Recommendation: adopt the cross-endpoint check as the systematic
review step immediately, and treat the table extension as the durable record of it rather than as the
mechanism. Does the mentor agree, or is element-level evidence in the table required for the check
itself to count as systematic?

**Q4-b — The criterion's honest bound.** Two agreeing extractions can both be wrong; the criterion
detects divergence and unsourceability, not consistent error. Is the mentor content for the written
criterion to carry that bound explicitly (recommended, matching the house honest-claims posture), or
does the mentor want a third, independent reading introduced to break agreement — which would add a
call and a cost per winner?

**Q4-c — Verbatim extraction, or derived summary?** See §4. Verbatim satisfies the wording; derived
satisfies the check at a fraction of the payload. Recommendation: **derived summary in v1** (element
counts, domain set, divergence flag, plus the already-present `guardrail_session_id` so a full
re-audit remains possible from the signed assessment), with verbatim named as a future upgrade if the
§6 data shows the summary is insufficient.

**Q4-e — NEW, raised 2026-08-11 (cycle 6). The mentor's stated test for the dikaiosyne floor pattern
may not be performable in the form stated.** The mentor assigns the cross-endpoint check the job of
discriminating readings (a) and (b): *"If the guardrail and reason extractions agree on the dikaiosyne
failure for this proposal class, the floor is more likely genuine. If they diverge, the floor may be an
extraction artefact."* But the ruled cycle sequence **filters at the guardrail step** — a
`rejected_by_guardrail` candidate never reaches novelty and is never consulted on `/api/reason`. So
there is **no reason-side extraction to compare against for any floored candidate**, and the check (which
runs on winners) can never directly test the floored class. Options: (i) accept indirect evidence only —
whether *winners* of the same proposal class show extraction agreement; (ii) consult one floored
candidate per cycle on `/api/reason` purely for the comparison, accepting the extra cost and the
disclosure that it is a diagnostic call outside the ruled sequence; (iii) something else. **AI
recommendation: (i) in v1** — (ii) adds cost and inserts a non-ruled call into a live run whose whole
value rests on its sequence being ruled. But the limitation should be stated in the §6 report rather
than left for a reader to discover.

> **RULED 2026-08-11 (Q4-e) — option (i), and the §6 report carries TWO evidence streams.** Verbatim
> record: `2026-08-11-mentor-rulings-cycle6-and-open-questions-verbatim.md` §Ruling 2.
>
> *"the cross-endpoint check's scope is **amended in the §6 report to state explicitly that it applies
> to winners only**. The floored class is assessed by **guardrail-internal coherence — traceability and
> proportionality within the single extraction** — and reported separately. The dikaiosyne floor pattern
> is carried as a named finding with both the coherence evidence and the honest bound stated: **the
> check cannot rule out that two agreeing guardrail extractions are both wrong.** The §6 report carries
> two distinct evidence streams: cross-endpoint divergence for winners, guardrail-internal coherence
> for filtered candidates. **Neither closes the problem. Both narrow it honestly.**"*
>
> **This changes the criterion document's structure** (§3.1). The three properties are no longer applied
> uniformly — they split by what evidence is available:
>
> | Property | Winners (both extractions exist) | Filtered candidates (guardrail only) |
> | --- | --- | --- |
> | **Traceable to the content examined** | cross-endpoint **and** within-extraction | **within-extraction only** — can each element be sourced to a span of the submitted text? |
> | **Proportionate to the domains engaged** | cross-endpoint **and** within-extraction | **within-extraction only** — do the claimed domains match what the text engages? |
> | **Consistent across equivalent inputs** | **the cross-endpoint comparison** | **unavailable by construction** |
>
> The third property is the one that vanishes for filtered candidates, and it is the strongest of the
> three — hence the mentor's *"weaker criterion … but it is honest evidence rather than no evidence."*
>
> **Three named sources of evidence for the floored class**, from the ruling: consistency of the floor
> across cycles; consistency of the proposal class that triggers it; and guardrail-internal coherence.
> The first two accumulate across cycles and cost nothing; the third is per-candidate.
>
> **The honest bound is now doubled and both halves must be stated:** two agreeing *cross-endpoint*
> extractions can both be wrong (C3), **and** two agreeing *guardrail* extractions can both be wrong
> (Q4-e). Neither stream closes the locust problem.

---

**RULED 2026-08-11 (Q4-a) — confirmed as recommended (C2).** *"The cross-endpoint comparison is adopted
as the systematic step now. Zero cost, no schema change. The table extension is the durable record, not
the mechanism."*

**RULED 2026-08-11 (Q4-b) — confirmed as recommended (C3).** *"The criterion's honest bound is stated
explicitly: the check detects divergence and unsourceability. Two agreeing extractions can both be
wrong. No third independent reading is introduced."*

**RULED 2026-08-11 (Q4-c) — derived summary (C4).** *"Derived summary in v1 — element counts, domain
set, divergence flag — with `guardrail_session_id` preserving the full re-audit path. **Verbatim is
preserved as an upgrade path, not a v1 requirement.**"*

**Q4-d — Does the run's review protocol change now, mid-flight, or at cycle 6's natural boundary?**
The run has ~15–35 cycles remaining. Recommendation: propose it through the run's channel and let the
run's own ruling cadence decide; a repo session should not impose it.

**RULED 2026-08-11 (Q4-d / B7) — NOW, and the ruling itself is the protocol change.** *"the
cross-endpoint comparison is proposed through the run's own channel now, in this response, as a ruling
on the run's review protocol. It requires no repo-side session because it costs nothing … The check is:
after each cycle's winner is identified, compare the guardrail extraction and the reason extraction on
the same input. Divergence is flagged. The table extension is the durable record of it, parked on the
§6 report gate. **The mechanism is the comparison itself, which starts immediately.**"*
**Founder action required:** the ruling was issued into the mentor channel; carrying it into the run's
`RUN-LOG.md` so the next cycle applies it is a **founder relay**. A repo-side session must not write
into the validation run's records.

---

## §6 Build-success criteria

For the **concurrent** half (documents + a routed proposal):

1. The criterion document states all three properties **with their pass cases**, not only failure
   signatures.
2. It carries the honest bound (§3.1) in its own words, not buried.
3. It names both failure classes by their **ruled** names and does not conflate them.
4. The cross-endpoint proposal is delivered to the run's channel and **not** committed as a repo-side
   process change.
5. Nothing in the deliverable modifies `/api/reason`, `/api/guardrail`, `project-context.json`, or any
   file in either endpoint's import graph. (A `git diff --stat` on the session's commit is the check.)
6. The `projectContext` architectural fix is **not** built (§2.5).

For the **parked** half, when it opens:

1. Migration additive, nullable, idempotent, reversible, with a `§VERIFY` block; applied TEST → prod,
   founder-walked.
2. A candidate write with the new column absent behaves **byte-identically** to today — asserted by a
   test, not by inspection.
3. The write cannot fail a cycle record under any input (fail-soft, asserted).
4. Data-rights and retention coverage confirmed by query, not by assumption, on both TEST and prod.
5. PR19 independent adversarial review before the migration is walked.

---

## §7 Corrections carried

1. **The synthesis argues from one incident; there are two, of opposite sign.** Cycle 5's
   `extraction_instability` is contamination by *omission* and is mentor-ruled **without a clean fix**,
   carried as a §6 finding. Any brief on this heading that cites only cycle 3 understates the case.
2. **Cycle 3's root cause is fixed**; the criterion is therefore not being proposed against a live
   defect but as a standing instrument. The fix's own verification probe was explicitly ruled *"should
   not be read as evidence the earlier state was merely transient."*
3. **Cycles 1–2 remain uncertified, not cleared** — their verdicts were produced under the unlabelled
   mechanism. Any traceability rate computed over the run must exclude or flag them.
4. **"Park until after the first build gate" is stale.** That gate closed 2026-08-10. The parked half
   waits on the **§6 report**.
5. **The mentor's third consequence (human practitioners naming the specific impression) is built in
   S7**, not here. S4 supplies the criterion; S7 supplies the surface.

---

## §8 Rollback

- **Concurrent half:** `git revert` the records commit. Documents only; nothing deploys.
- **Run-side process proposal:** withdraw it through the same channel; the run's protocol is the run's
  to change.
- **Parked half, post-build:** `ALTER TABLE public.idea_loop_candidates DROP COLUMN <name>;` — safe
  because the column is additive and nullable and no read path requires it; plus `git revert` of the
  write-side commit. The existing `guardrail_session_id` affordance is untouched either way.
