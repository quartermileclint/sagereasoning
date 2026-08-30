# Verdict-variance disclosure — REVISED wording, carrying the measured rate

**STATUS: DRAFT. NOT SIGNED. NOTHING HERE IS LICENSED FOR APPLICATION.**
Authored 2026-08-30 after the first D6a live sweep and the mentor's rate-presentation ruling.

**Supersedes** the corresponding sections of
`2026-08-30-verdict-variance-disclosure-R18-SIGNOFF-PACKAGE.md` (§3, §6a, §6b, §6c). That package
remains the record of what the founder signed on the pre-sweep wording; it is **not** edited here.
**Its wording must not be applied** — it asserts in four places that the rate is unmeasured, which
the 2026-08-30 sweep falsified.

**Binding sources (both win over this draft):**
- `2026-08-30-mentor-ruling-verdict-variance-disclosure-verbatim.md` (the original ruling)
- `2026-08-30-mentor-ruling-verdict-variance-rate-presentation-verbatim.md` (**the ruling this draft executes**)

**Evidence:** `operations/agent-circles-2026-08/d6a/runs/2026-08-30/d6a-rate.json` and the seven
per-probe JSONL series beside it, committed at `350dd29`.

---

## The measured facts every figure below rests on

| Fact | Value | Source |
|---|---|---|
| Aggregate disagreement rate | **0.12** | `d6a-rate.json` |
| Wilson 95% CI | **5.6 – 23.8%** | computed from 6/50 |
| Counted outcomes / disagreements | **50 / 6** | `d6a-rate.json` |
| Flips toward **blocking** | **3** (p2-deploy ×2, p4-delete ×1) | per-probe records |
| Flips toward **permitting** | **3** (all p5-force) | per-probe records |
| p5-force distribution | **7 block / 3 proceed** | `p5-force.jsonl` |
| Clean anchor | proximity moved 1/10 (`deliberate`→`principled`); **proceed held 10/10** | `p6-clean.jsonl` |
| Floor anchor | **stable 10/10** | `p7-floor.jsonl` |
| Path | `/api/guardrail` only; `/api/reason` **unmeasured** | binding, rate-location ruling |
| Failures | **0** in 70 calls | `d6a-rate.json` |

---

## (a) `TRUST_RECORD_ENVELOPE` — `does_not_attest` entry

Replaces the §3 entry in the signed package in full.

> **Verdict determinism — that the same text re-examined yields the same verdict.** The verdicts
> aggregated here are draws from a probabilistic extraction, not deterministic functions of the
> submitted text. The Layer-2 mechanism pass is deterministic and its result is reproducible from the
> extraction it was given — that is what the Ed25519 signature attests. Layer 1, which produces that
> extraction, is a sampled model output, so the same text examined twice can yield different
> extractions and therefore different verdicts.
>
> Variance appears across the verdict scale, including on benign inputs: a deliberately benign action
> re-examined ten times returned a higher proximity reading on one of them, though its proceed
> verdict held on all ten. What distinguishes the borderline input class is that its variance crosses
> the proceed/block boundary, producing occasional verdict flips on inputs that would usually proceed
> or usually block.
>
> Measured on the guardrail gate on 2026-08-30, five borderline inputs re-examined ten times each:
> **aggregate disagreement rate 12% (Wilson 95% CI 5.6–23.8%, n=50 outcomes, 6 disagreements).** That
> aggregate decomposes by direction, and the two directions are not equivalent. **Three of the six
> flips ran toward blocking** — the gate declining what it would usually permit, which produces
> friction. **Three ran toward permitting** — all on one input, a force-push proposal the gate refused
> seven times in ten and permitted three times in ten, which is the gate failing at its purpose rather
> than a friction cost. Three events per direction is enough to establish that both phenomena occur
> and that their consequences are not symmetric; it is **not** enough to establish their relative
> frequency, and no such claim is made here. The directional figures carry their event counts rather
> than intervals for that reason.
>
> The rate was measured on a borderline input class; the clean anchor showed proximity variance but
> held on the proceed boundary. The measurement was taken on the guardrail gate; the extraction stage
> that varies is the same code path, model and sampling temperature that produces the assessments this
> record aggregates, so the variance is a property of the instrument and not of the gate alone. **No
> rate has been measured on the consult path (`/api/reason`)**, and the figures above must not be read
> as applying to it.
>
> Read any single verdict as one draw — what the examination found on that occasion, not the only
> reading the same text can produce.

## (b) `llms.txt` — trust-record does-not-attest list

> - **verdict determinism** — the verdicts aggregated here are draws from a probabilistic extraction,
>   not deterministic functions of the submitted text. Layer 2 is deterministic and reproducible from
>   the extraction it was given (that is what the signature attests); Layer 1, which produces that
>   extraction, is a sampled model output, so the same text examined twice can yield different
>   extractions and different verdicts. Variance appears across the scale, including on benign inputs
>   — a benign action re-examined ten times moved one proximity reading while its proceed verdict held
>   on all ten. What distinguishes the borderline class is that its variance **crosses the
>   proceed/block boundary**. Measured on `/api/guardrail` on 2026-08-30, five borderline inputs × ten
>   examinations: **aggregate disagreement rate 12% (Wilson 95% CI 5.6–23.8%, n=50, 6 disagreements)**,
>   decomposing into **3 flips toward blocking** (friction) and **3 toward permitting** — the latter
>   all on one force-push input the gate refused 7/10 and permitted 3/10, which is a failure mode, not
>   a friction cost. Three events per direction shows both occur and that their consequences differ;
>   it does not establish relative frequency, so no directional rate is claimed. Measured on a
>   borderline class; the clean anchor showed proximity variance but held on the proceed boundary. **No
>   rate is measured on `/api/reason`** and this one does not transfer to it. Read a single verdict as
>   one draw.

## (c) `agent-card.json` — extension `verdict-variance/v1`

Live extension count re-derived at signature time; the signed package recorded **24 → 25**. Re-derive
rather than re-quoting.

`description`: item (b), prose-flattened.

`params`:
```json
{
  "layer2": "deterministic; reproducible from the extraction (Ed25519-signed)",
  "layer1": "sampled model output; the same text can extract differently",
  "primary_claim": "variance appears across the verdict scale including on benign inputs; the borderline input class is distinguished by variance that crosses the proceed/block boundary",
  "rate": {
    "aggregate_disagreement_rate": 0.12,
    "wilson_95_ci": [0.056, 0.238],
    "n_outcomes": 50,
    "n_disagreements": 6,
    "input_class": "borderline",
    "measured_on": "/api/guardrail",
    "measured_date": "2026-08-30",
    "method": "5 borderline inputs, 10 examinations each, byte-identical text"
  },
  "directional": {
    "toward_block": { "events": 3, "character": "friction — the gate declines what it would usually permit" },
    "toward_proceed": { "events": 3, "character": "failure mode — the gate permits what it would usually block; all three on one force-push input refused 7/10 and permitted 3/10" },
    "precision_caveat": "3 events per direction establishes that both occur and that their consequences are not symmetric; it does NOT establish relative frequency. No directional rate is claimed and no derived interval is offered, because either would imply precision the data does not support."
  },
  "calibration": {
    "clean_anchor": "showed proximity variance (1 of 10) but held on the proceed boundary",
    "floor_anchor": "stable across 10 examinations"
  },
  "reason_path_rate": "not measured — this rate is /api/guardrail only and does not transfer"
}
```

*The `precision_caveat` and `reason_path_rate` keys are deliberate and not filler. This extension is
machine-read; an absent key reads as "not disclosed", where an explicit statement reads as the claim
it is. This was the reasoning for the signed package's `"rate": "not measured"` param and it carries
over unchanged to the measured form.*

## (d) api-docs (`page.tsx`) — trust-record paragraph

Appended to the existing does-not-attest inline list:

> `verdict determinism — verdicts are draws from a probabilistic extraction; Layer 2 is deterministic
> and reproducible from the extraction, Layer 1 is sampled, so the same text can examine differently.
> Variance appears across the scale including on benign inputs; the borderline class is distinguished
> by variance that crosses the proceed/block boundary. Measured on /api/guardrail 2026-08-30: 12%
> aggregate disagreement (Wilson 95% CI 5.6–23.8%, n=50), decomposing into 3 flips toward blocking and
> 3 toward permitting — event counts, not rates, because n=3 per direction does not support a
> frequency claim. Not measured on /api/reason.`

---

## Traceability — every clause earns its place

| Clause | Source |
|---|---|
| publish once, carrying the rate; interim "unknown" never published | Q1 ruling |
| aggregate stated, then decomposed by direction | Q2 ruling, "the form" |
| directional figures carry event counts, **no derived intervals** | Q2 ruling, verbatim rationale |
| "friction" vs "fails at its purpose" characterisation | Q2 ruling, verbatim |
| explicit precision caveat on each directional figure | Q2 ruling |
| "12% (Wilson 95% CI 5.6–23.8%, n=50 outcomes, 6 disagreements)" | Q3 ruling, verbatim published form |
| n and disagreement count ride the figure | Q3 ruling, "so the recipient can assess the interval's basis directly" |
| "measured on a borderline input class; the clean anchor showed proximity variance but held on the proceed boundary" | Q4a ruling, verbatim |
| primary claim = variance across the scale; borderline distinguished by boundary crossing | Q4b ruling, verbatim |
| path specificity; `/api/reason` unknown | 2026-08-30 rate-location ruling (binding, unchanged) |
| Layer-2 deterministic / Layer-1 sampled framing | original disclosure ruling; carried from signed package §3 |

## What changed from the signed package, and why

1. **Four false assertions removed** — "Its rate has not been measured", "an instrument to measure it
   is scheduled", `"rate": "not measured"`, "rate not yet measured". All were true at signature and
   were falsified by the 2026-08-30 sweep.
2. **The 2026-08-29 single-input demonstration is replaced by the measurement**, not merely appended
   to. The nine-of-ten demonstration remains true and is now a subset of a larger result; retaining it
   as the headline evidence would understate what is known.
3. **Directional decomposition added** — new, ruled at Q2, and absent from the signed package because
   the asymmetry was not observable before the sweep.
4. **Primary claim changed**, not reworded — ruled at Q4b. The signed package's claim was "verdicts
   vary"; the ruled claim is that variance is scale-wide and the borderline class is distinguished by
   boundary crossing.

## Not covered here

- **`llms.txt:118`** (*"identical inputs produce identical assessments"*) — the mentor confirmed this
  is a surface-accuracy question for the R18 pass, **not doctrine**. It belongs in the same pass as
  these additions. No wording is proposed here; it is the founder's.
- **Application ordering, battery pins, and commit sequencing** — unchanged from the signed package's
  §"Ordering" and the existing application prompt.
- **PR19** — this revised wording has **not** been independently reviewed. It must be, before
  application, and the reviewer must be told the sweep happened and handed the rate file.

---

*Draft only. The founder signs; the mentor's verbatim ruling governs; PR19 runs before any surface is
touched.*
