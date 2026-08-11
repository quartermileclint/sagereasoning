# The traceability criterion — a checkable instrument for the examined-assent verification problem

**S4's concurrent deliverable.** Written 2026-08-11, feeding the IDEA-loop bounded validation run's
§6 report. **Scope document:** `S4-traceability-criterion-scope.md`. **Binding rulings this document
implements:** `2026-08-11-mentor-ruling-scope-confirmation-verbatim.md` (A5, A6, B7, C2, C3, C4) and
`2026-08-11-mentor-rulings-cycle6-and-open-questions-verbatim.md` (Ruling 1, Ruling 2 §Q4-e).

**This document does not modify `/api/reason`, `/api/guardrail`, `project-context.json`, or any file
in either endpoint's import graph. It is not written into the validation run's own records** — the
process change it describes (§3) was relayed into the run's own channel by the founder, per B7, and
is recorded there, not here.

---

## 1. The locust problem, and the criterion

The mentor names the hardest challenge the IDEA-loop validation run is designed to surface evidence
about — not solve — as **the locust problem**: *"the difference between an agent that genuinely
performs examined assent and one that simulates it producing correct outputs."* Cycle 3's
contamination incident was named as the concrete instance: *"the service produced a confident verdict
computed over the wrong input. Served-200, substantively wrong. That is the locust wearing the
appearance of virtue."*

The criterion, verbatim and load-bearing:

> genuine examination produces verdicts that are **traceable to the specific content examined**,
> **proportionate to the actual virtue domains engaged**, and **consistent across equivalent inputs**.
> Simulated examination produces verdicts that are **confident, formulaic, and contaminated by context
> that was not in the input**.

This document turns those three properties into checks a reviewer can actually apply.

---

## 2. Two evidence streams — the criterion's spine (Q4-e)

The three properties do not apply uniformly. **What evidence exists to test them against splits by
what point in the ruled cycle sequence a candidate reached** — the guardrail filters first; only
survivors reach `/api/reason`. A `rejected_by_guardrail` candidate is examined once, by one endpoint,
and never again. A winner is examined twice, by two endpoints, on the same text.

- **Winners** (both extractions exist — `/api/guardrail` at Step 2, `/api/reason` at Step 5): all
  three properties apply, including the cross-endpoint comparison.
- **Filtered candidates** (guardrail extraction only): traceability and proportionality apply
  **within the single extraction**. The third property — consistency across equivalent inputs — is
  **unavailable by construction**, because a `rejected_by_guardrail` candidate never reaches
  `/api/reason`. There is no second reading to be consistent with.

The mentor states the resulting shape of the §6 report directly:

> *"The §6 report carries two distinct evidence streams: cross-endpoint divergence for winners,
> guardrail-internal coherence for filtered candidates. Neither closes the problem. Both narrow it
> honestly."*

| Property | Winners (both extractions exist) | Filtered candidates (guardrail only) |
| --- | --- | --- |
| **Traceable to the content examined** | cross-endpoint **and** within-extraction | **within-extraction only** — can each element be sourced to a span of the submitted text? |
| **Proportionate to the domains engaged** | cross-endpoint **and** within-extraction | **within-extraction only** — do the claimed domains match what the text engages? |
| **Consistent across equivalent inputs** | **the cross-endpoint comparison** | **unavailable by construction** |

For the floored/filtered class, three named sources of evidence stand in for the missing third
property (ruling, Q4-e): **consistency of the floor across cycles**; **consistency of the proposal
class that triggers it**; and **guardrail-internal coherence** (per-candidate). The first two
accumulate across cycles at no cost; the third is available immediately from a single extraction.

---

## 3. The three checks, each with its pass case

A criterion that names only failure will read every unusual verdict as a defect. Each check below
states what a genuine pass looks like, not only the failure signature it exists to catch.

### 3.1 Traceable to the specific content examined

**Check:** for each extraction element (`control_filter_elements`, `oikeiosis_circles_engaged`,
`kathekon_factors`), can a specific span of the submitted text be named as its source?

**Pass case:** every element points to a phrase, sentence, or clause genuinely present in the
submitted action text. A verbose or philosophically dense extraction is not itself a failure — the
check is source-existence, not brevity.

**Detects:** cycle 3's class — elements whose content demonstrably did **not** come from the
submitted input (governance-document vocabulary appearing inside `control_filter_elements` /
`kathekon_factors` / `oikeiosis_circles_engaged` that was never in the practitioner's own action
text). This is contamination by **addition**.

### 3.2 Proportionate to the actual virtue domains engaged

**Check:** do the domains claimed by the extraction match what the text actually engages — neither
inflated (domains claimed with no supporting element) nor empty (a text that demonstrably engages a
domain returning no reading of it)?

**Pass case:** the claimed domain set is non-empty exactly where the text gives it grounds to be, and
each claimed domain has at least one supporting extraction element. A narrow domain set on a narrow
text is a pass, not a defect — proportionality cuts both ways.

**Detects:** cycle 5's class — an extraction returning every category empty, with an explicit note
that *"no Stoic features are extractable from the input as presented,"* on a text the sibling
endpoint (on the identical text, minutes apart) read as three `control_filter_elements`, three
`oikeiosis_circles_engaged`, and two `kathekon_factors` engaging `phronesis`/`dikaiosyne` at
`principled`. This is contamination by **omission**.

### 3.3 Consistent across equivalent inputs

**Check:** do two examinations of the same text agree — on element counts per category, on the
virtue-domain set, and on the resulting proximity (allowing that a shared extraction may be
lawfully floored to a more conservative rank, per the unity thesis, without that alone counting as a
divergence)?

**Pass case:** the two readings are computed over the same understanding of the text — comparable
element counts, the same or an overlapping domain set, and any proximity difference traceable to a
disclosed floor mechanism operating on a shared extraction, not to a different reading of the input
itself.

**Detects:** both classes above, from the outside — this is the cross-endpoint comparison (§4), and
it is available **only for winners** (§2).

---

## 4. The cross-endpoint check already exists, at zero cost (§2.2 of the scope document)

Cycle 5 was detected by exactly this comparison, and nothing else. The same action text went to
`/api/guardrail` (Step 2) and `/api/reason` (Step 5) minutes apart in the same cycle. The guardrail
reading returned three `control_filter_elements`, three `oikeiosis_circles_engaged`, two
`kathekon_factors`, `principled`/`is_kathekon: true`. The `/api/reason` reading on the identical text
returned every category empty and an explicit refusal to extract, `deliberate`/`is_kathekon: false`.
The run log states the inference precisely: this *"is not a floored version of the guardrail's
reading (floors can only make a verdict more conservative on a shared extraction) — it is a verdict
computed over a **different, materially poorer extraction of the same text**."*

Every cycle already sends each candidate's text through `/api/guardrail` during filtering, and the
winner's text through `/api/reason`. **Both extractions are therefore already produced and already
billed** — they are simply never compared. Making that comparison systematic costs nothing extra: no
new call, no schema change, no additional spend.

**This check is now the run's own standing practice, not a proposal.** Per B7, ruled 2026-08-11, the
mentor put the comparison directly into force through the run's own channel: *"the cross-endpoint
comparison is proposed through the run's own channel now, in this response, as a ruling on the run's
review protocol… The mechanism is the comparison itself, which starts immediately."* It is **in force
from cycle 6 onward** (`RUN-LOG.md:286`), with its own carried-findings table (`RUN-LOG.md:371`,
extended per cycle). This document records the check's specification and its evidentiary shape; it
does not re-propose it, and it is not the mechanism that carries it forward — the run's own record is.

**Two divergence signatures — the run has already met a third, unanticipated condition on the check's
very first application.** The B7 ruling named two:

1. **Empty-vs-populated** (cycle 5's signature) — one reading is empty or near-empty where the other
   is populated on the same text.
2. **Disjoint domain sets** — both readings populated, but sharing no virtue domain. **No instance of
   this has occurred in the run yet.** It has no worked example; it remains a named, distinct failure
   mode rather than an observed one.

At cycle 6, the check met a third condition neither signature covers, and correctly refused to force
it into either (`RUN-LOG.md:1749`):

> *"not comparable — a third signature, distinct from both named in the B7 ruling. The reason endpoint
> did not serve a wrong or thin reading; it honestly declined to evaluate at all
> (`fallback_reason: "layer1_throw"`) … Empty-vs-populated (cycle 5) presumes a populated guardrail
> side against an attempted-but-empty reason side; here the reason side made no attempt. Named as a
> fourth signature for the ruling's scope, not filed under either of the two named ones, since forcing
> it into 'empty-vs-populated' would misdescribe an honest failure as an extraction defect."*

This is the check working as designed — meeting an unanticipated condition and naming it honestly
rather than coercing it into the existing taxonomy.

**The recording vocabulary is therefore four-valued, not three:** `clean` · `diverged` ·
`not_comparable` · `unlabelled`.

- **`clean`** — both readings produced, and they agree per §3.3's pass case.
- **`diverged`** — both readings produced, and one of the two named signatures (empty-vs-populated;
  disjoint domain sets) applies.
- **`not_comparable`** — one side made no attempt (an honest served fallback rather than a served
  wrong or thin reading). Cycle 6 is the run's first instance. **This is not a divergence and must
  not inflate the §6 divergence rate** — counting it as one would misdescribe an honest,
  self-disclosed failure as an extraction defect and would penalise the endpoint for behaving exactly
  as the criterion in §3.1 rewards (an honest non-attempt is, definitionally, not a confident,
  unsourceable claim).
- **`unlabelled`** — the cycle predates the check's own operation, or the raw material the check needs
  (per-candidate element counts and domain sets on both sides) was not preserved at the time.

**Under B5's frozen discriminator (S6), `not_comparable` behaves like `unlabelled` — out of scope,
never inferred clean.** The frozen discriminator restricts the friction hypothesis's test to *"cycles
whose winner extraction was cross-checked clean."* A cycle where the cross-check could not run is not
clean. Inferring clean from a non-comparison — treating "the check could not be applied" as evidence
of agreement — is the exact error the `unlabelled` category exists to prevent, and `not_comparable`
inherits that discipline rather than being treated as a milder or more favourable outcome.

---

## 5. Three failure classes, by their ruled names

There are now three distinct `/api/reason` failure classes recorded in the run, and they are **not
interchangeable** — the mentor's ruling on cycle 6 turns entirely on the difference.

| Class (ruled name) | Shape | Risk to the §6 findings |
| --- | --- | --- |
| **`contamination`** | Addition — extracted content **never submitted** enters the extraction (cycle 3, unlabelled `projectContext` block; fixed and verified 2026-08-11) | Contaminates a completed, served verdict |
| **`extraction_instability`** | Omission — legitimate submitted content **fails to extract**, and the endpoint still serves a full, confident, impoverished verdict (cycle 5; mentor-ruled *"not a defect with a clean fix"*, carried as a named §6 finding, no further diagnostic probes instructed) | Contaminates a completed, served verdict |
| **`layer1_throw`** | Honest non-attempt — the endpoint returns `extraction: null`, `meta.fallback: true`, an explicit `fallback_reason`, and invites a retry, rather than serving any verdict at all (cycle 6, reproduced on retry) | **Does not contaminate anything served** — it reduces the count of completed verdicts |

**Why the third is categorically different, in the mentor's own reasoning** (Ruling 1, cycle 6):

> *"Cycle 6's failure is structurally different. A `layer1_throw` with null extraction is the service
> announcing its own failure honestly. It did not serve a wrong verdict. It served no verdict. The
> retry-then-stop discipline caught it correctly, the cycle was written as `dependency_unavailable`,
> and the record is clean. This is the infrastructure working as designed under a different failure
> class — honest unavailability rather than confident wrongness."*

And why the escalation bar (a third confident-wrongness incident would have forced a halt to
winner-consult calls) is unaffected by a third failure of this shape:

> *"The escalation bar exists because a pattern of confident wrong verdicts entering the run undetected
> would corrupt the §6 findings irreparably. A pattern of honest null returns does not carry that risk
> — it reduces the run's completed cycles but does not contaminate the verdicts that were completed."*

**Ruling: not the third strike. Cycle 7 proceeds. All three failure classes are carried as named §6
findings**, distinguished by name, never conflated into one "the endpoint had problems" line.

---

## 6. The doubled honest bound

The criterion detects **divergence and unsourceability**. It does not, and cannot, detect a
**consistently wrong** extraction — and this bound now applies on both evidence streams, separately.

- **On the winners stream:** two agreeing cross-endpoint extractions can both be wrong. No third
  independent reading is introduced to break agreement (C3, ruled). This is the same structural
  residual the gaming-robustness bar named as the A2 class (self-report omission) — an honest,
  internally-consistent extraction that simply omits or misreads something the input actually
  contains is invisible to a check built on agreement between readings.
- **On the filtered-candidates stream:** two agreeing guardrail extractions can both be wrong (ruled,
  Q4-e). The guardrail-internal coherence check tests whether a single extraction is traceable and
  proportionate on its own terms — it cannot rule out that the extraction is coherently,
  self-consistently mistaken.

**Neither stream closes the locust problem. Both narrow it honestly.** State this explicitly wherever
this criterion's results are reported; do not imply that a clean result on either stream certifies
correctness rather than merely the absence of the two named defect signatures.

---

## 7. The dikaiosyne floor pattern — a named finding, not a diagnosis (§2.6 of the scope document)

Cycle 6 produced the run's first genuine `rejected_by_guardrail` verdicts: three of six candidates
(h1, h2, h4) received full, signed, populated examinations returning `proceed: false`, each floored
all the way to `reflexive` by the same mechanism — `dikaiosyne: "reflexive"` in `proximity_floors` —
regardless of the unfloored `base`. h4's base was `principled`, the highest of the cycle, cut to the
lowest rank on the scale. This is live production behaviour (ADR-010 §4's unity-thesis minimum-domain
rule, `SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED=true` since 2026-06-25), not a run artefact, so it bears
on the repository as well as on the §6 report.

**Both of the mentor's readings must be carried, and neither is preferred over the other on the
evidence available so far:**

- **(a) Genuine.** *"the guardrail is doing something philosophically precise: it is refusing to
  endorse disclosure proposals that would overclaim the system's current reliability. That is not a
  defect. That is the justice domain working correctly."* On this reading, a proposal to add a
  disclosure, note, or label about the system's own outputs is a claim about how the system
  represents itself — and while the run's own examination fidelity is precisely what is under test,
  such a claim cannot yet be fully warranted.
- **(b) False positive.** *"the dikaiosyne floor is firing on a false impression — treating disclosure
  proposals as claims about output quality when they are actually proposals about transparency
  infrastructure."*

**One explanation is already ruled out, by the run session itself.** The control filter classified
all of h1/h2/h4's proposed changes as `"outside"` prohairesis — but h3, h5, and h7, the three that
passed, are phrased identically in kind (also system-level proposals: relocating docs, publishing an
SDK). Classification-as-`"outside"` alone does not explain the split.

**A sharper discriminator — explicitly a proposed refinement at N=6, not a settled diagnosis.**
Across all six candidates, one line separates the floored from the passed:

| Candidate | Proposal | Verdict |
| --- | --- | --- |
| h1 | a thin-extraction flag **on the trust record** | **floored** (base `deliberate`) |
| h2 | an extraction-confidence note **next to each signed assessment** | **floored** (base `deliberate`) |
| h4 | MEASURE-vs-ENFORCE language **on the trust record's own wording** | **floored** (base `principled`) |
| h3 | relocate **existing** `/limitations` + `/transparency` content into the SDK README | passed, `principled` |
| h5 | publish the full SDK | passed, `deliberate` |
| h7 | a CI check on a timeout constant | passed, `principled` |

The discriminator is not disclosure versus shipping — h3 is a disclosure proposal and it passed at
the cycle's joint-highest proximity. It is **whether the proposal places a new claim about assessment
reliability onto the assessment-bearing surface itself.** h1/h2/h4 do; h3 relocates content already
published elsewhere; h5 and h7 make no reliability claim at all. This asymmetry is what makes reading
(b) — a blanket misreading of disclosure proposals as output-quality claims — predict something the
data does not show: it predicts h3 would also floor, and h3 did not. Reading (a) predicts exactly the
observed split. **On the evidence available, the asymmetry points toward (a)**, and it is named as a
proposed refinement, h3 named as the control that makes it discriminating, because it is exactly the
case that would have falsified reading (a) had it also floored.

**Honest bounds that must ride this finding wherever it is reported:**

- **N = 6, in one cycle.** The run log's own note: this is the first time the guardrail step has
  produced enough proximity variance in a single cycle to observe a within-cycle pattern like this at
  all.
- **The discriminating evidence the mentor assigned to the cross-endpoint check is not directly
  available, and this is now ruled, not merely observed (Q4-e).** The mentor named the check's job:
  *"If the guardrail and reason extractions agree on the dikaiosyne failure for this proposal class,
  the floor is more likely genuine. If they diverge, the floor may be an extraction artefact."* But
  the ruled cycle sequence filters at the guardrail step — a `rejected_by_guardrail` candidate never
  reaches `/api/reason`, so there is no reason-side extraction to compare against for any floored
  candidate. **Ruling (Q4-e):** the check's scope is amended in the §6 report to state explicitly
  that it applies to winners only; the floored class is assessed by guardrail-internal coherence,
  reported separately, with the honest bound that the check cannot rule out that two agreeing
  guardrail extractions are both wrong (§6 above). Cycle 6 itself could not even supply the indirect
  winners-side evidence — the winner's own reason-side call was the `layer1_throw`, so cycle 6's
  cross-endpoint row is `not_comparable` (§4). **The discriminating evidence begins at cycle 7 at the
  earliest.**

**Binding instruction, carried verbatim:** *"do not adjust the generation heuristics to avoid
producing disclosure proposals. The pattern is data."*

---

## 8. The three `dependency_unavailable` cycles — the framing that must survive into the §6 report

Three of the run's first six cycles (3, 5, 6) ended `dependency_unavailable`. The naive reading is
that this signals an unreliable run. The mentor's own framing is the opposite, and it should be
carried into the §6 report **verbatim**, because it is not a paraphrase-safe point:

> *"they are not evidence that the run is unreliable. They are evidence that the retry-then-stop
> discipline is working. A run that recorded verdicts from contaminated, instability-affected, and
> null-extraction cycles would have a higher completion rate and a less trustworthy §6 report. The
> discipline is costing cycles and preserving integrity. That is the correct trade."*

---

## 9. What this document does not do

- It does not propose, prepare, or license the larger `projectContext` architectural fix (removing
  `getProjectContext` injection from API-key-authenticated `/api/reason` calls entirely). That fix is
  mentor-ruled but deliberately not built and not scheduled. **Do not build it unless the founder
  explicitly asks.**
- It does not touch `practitionerContext`'s identical, unlabelled defect. Named, deliberately left.
- It does not specify the parked watching-table extension beyond what the scope document's §4
  already states (a derived summary in v1 — element counts, domain set, divergence flag, plus
  `guardrail_session_id` for a full re-audit path — per C4, ruled). That extension is parked on the
  §6 report and is its own founder-walked 0c-ii Critical step (an additive migration on a live
  table) when it opens.
- It writes nothing into the validation run's own records. The cross-endpoint check itself is already
  in force there, per B7, carried by the founder's relay — this document is the criterion behind it,
  not a duplicate of its mechanism.

---

## 10. Cycles 1–2 remain uncertified, not cleared

Cycles 1 and 2's proximity verdicts were produced under the unlabelled `projectContext` mechanism —
the same mechanism whose unlabelled state caused cycle 3's contamination, fixed 2026-08-11. Any
traceability rate or divergence rate computed over the run must exclude or flag cycles 1–2 rather than
treat their verdicts as certified clean. This is consistent with the B7 recording vocabulary: both
cycles are `unlabelled` in the cross-endpoint table, for a different but related reason — the raw
per-candidate element counts and domain sets on both sides were not preserved at the granularity the
check needs, so even a retrospective label would rest on incomplete material.

---

## 11. Sources

- `2026-08-11-mentor-synthesis-primal-substrate-verbatim.md` — Heading 4 (the criterion, verbatim).
- `2026-08-11-mentor-ruling-scope-confirmation-verbatim.md` — A5, A6, B5 (context for §6's frozen
  discriminator dependency), B7, C2, C3, C4.
- `2026-08-11-mentor-rulings-cycle6-and-open-questions-verbatim.md` — Ruling 1 (the third failure
  class; the dikaiosyne floor pattern) and Ruling 2 (Q4-e).
- `S4-traceability-criterion-scope.md` — the full mechanism-fact trace (PR20) this document builds on.
- `RUN-LOG.md:286` (B7 in force), `RUN-LOG.md:371` (the cross-endpoint carried-findings table,
  cycles 1–5), `RUN-LOG.md:1610–1838` (cycle 6, incl. the `layer1_throw` incident and the
  `rejected_by_guardrail` pattern), `RUN-LOG.md:1749` (the `not_comparable` row).
