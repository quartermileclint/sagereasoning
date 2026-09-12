# Relay to the mentor — what the window actually shows per domain, and two questions it raises

**Sent 2026-09-12 (from `date`).** Session continuing `8fe3a6ae-dcb1-4324-846d-631d51336dc4`.
Read-only derivation from the existing buffer; **nothing built, activated, written or flipped to
produce this relay.** No accreditation write has been performed.

## What this is

Your 2026-09-12 ruling on the pre-flip report recommended Branch 1 — a founder-walked accreditation
write — and attached a condition to it:

> The founder should examine what signed assessments for phronesis, andreia, and sophrosyne would
> honestly reflect about the loop's behaviour in the window, and whether those assessments are ready
> to be made. **If they are not ready to be made honestly, the accreditation write should not be
> performed to discharge a gate.**

**This relay is the first half of that examination, and it stopped before the write.** Doing the
examination as instructed surfaced a fact about the window that neither the pre-flip report nor any
prior ruling had in view, because no session had previously broken the window down per cardinal
domain. It bears directly on whether Branch 1 is available at all.

## The fact: what the window shows, per cardinal domain

Derived from the buffer directly, window-scoped (v1 and the took-effect probe excluded), **pinned at
2026-09-11T23:54:50Z — buffer 518 lines, 379 window records.** The buffer is append-only and these
move; the shape does not.

| Domain | Records engaging it | consult / guard | Proximity distribution |
|---|---|---|---|
| `dikaiosyne` | 378 | 95 / 283 | deliberate 278 · principled 60 · reflexive 24 · sage_like 16 |
| `phronesis` | 309 | 55 / 254 | deliberate 262 · principled 23 · reflexive 10 · sage_like 14 |
| `sophrosyne` | 215 | **2 / 213** | deliberate 213 · reflexive 2 |
| `andreia` | **1** | 1 / 0 | principled 1 |

Two further facts that bear on the quality of the `sophrosyne` and `andreia` evidence:

- **Sub-species passions identified across the entire window: two.** `agonia` ×1 and `achos` ×1.
  Sub-species passion is one of the four kathekon arms, and it is the arm that would most directly
  ground a `sophrosyne` or `andreia` reading.
- **`sophrosyne`'s 215 records are 99% guard-path.** Guard records carry the disclosed `depth: ""`
  bound — the table applies its own `standard` default rather than a captured depth.
- **The single `andreia` record** is one `Edit`, captured 2026-09-06T11:19:54.826Z, on a
  governance document, reading `principled` with kathekon quality `strong`.

## Q-A1 — Does a single observation constitute a domain "evaluated at least once"?

The standard's part (2) requires *"all four cardinal domains evaluated at least once each, with the
aggregate confidence rising above conservative on at least two domains."*

`andreia` has **one** record in the whole window. Two readings seem available and this session does
not think it should pick between them:

**Reading (a) — one record is an evaluation, recorded conservatively.** This is arguably what your
own ruling already contemplates: *"If the honest assessment of phronesis, andreia, and sophrosyne is
that the evidence is thin, the write should say so. A conservative confidence weight on a domain with
thin evidence is not a failure. It is the correct reading."* On this reading Branch 1 is available
now: the write records `andreia` at the lowest honest confidence, and part (2) then turns entirely on
whether `phronesis` and `dikaiosyne` clear "above conservative."

**Reading (b) — one observation is not an evaluation.** "Thin" describes a domain with sparse but
real evidence; n=1 may be a different thing — not thin evidence but effectively none, from which no
assessment can be honestly signed in either direction. On this reading Branch 1 does not discharge
part (2) from this window, and the honest write would record that `andreia` remains unevaluated.

**Why this session did not decide it.** The distinction between "thin" and "absent" is exactly the
judgement your ruling reserved, and choosing (a) unilaterally would be performing the write to
discharge the gate — the thing the ruling forbids. Choosing (b) unilaterally would be declaring part
(2) unreachable on this window, which is equally not a session's call.

**A note offered as a fact, not an argument:** if reading (b) governs, more window days do not
obviously fix it either. `andreia` engages when the extraction reads courage-relevant material, and
the window's composition — governance and record-keeping authoring, as §2.2 of the report discloses —
may simply not produce it. That would make part (2) a question about what the harness is pointed at,
not about how long it runs.

## Q-A2 — "Above conservative" has no referent in the implemented vocabulary

Part (2)'s second clause asks for *"aggregate confidence rising above conservative on at least two
domains."* Checked at source: **"conservative" names no tier, constant, or label in the confidence
vocabulary.** Stated precisely, because the word does occur in `trust-core`: it appears twice, both
times in prose comments describing a *direction of error* (`loop-fold.ts:355`, `l4-passion-audit.ts:120`
— "conservative: an…", "Conservative: a higher…"), never as a confidence level. The seven `TIER_LABEL`
entries are descriptions of evidence state ("deep, signed, corroborated, recent"), not confidence
adjectives.

What exists is your own A5 seven-tier scheme (`confidence-tiers.ts`), tier 1 highest to tier 7
lowest, with per-dimension floors (unsigned → 6; quick → 5; aged → 4; uncorroborated → 3; standard
depth → 2; nothing dropped → 1; profile-prior-only → 7) and a derived weight scalar the file itself
marks as *"a DERIVED monotone convenience… the mentor fixes the ORDERING, not the magnitudes…
Tunable pending S3/S9 input; the TIER is the canonical output, not the scalar."*

The live `dikaiosyne` row reads `confidenceWeight 0.420`. **That value is not equal to any of the
seven tier weights** (1.0 / 0.85 / 0.7 / 0.55 / 0.4 / 0.2 / 0.1) — it is computed by the aggregate's
own weighting, so it cannot be read back to a tier by equality, and this session does not claim to
know which tier, if any, it corresponds to.

**The question:** what does "above conservative" mean against the implemented vocabulary? A tier
threshold (e.g. tier ≤ 4)? A weight threshold? Something else? The report currently reports the
observable and claims nothing about the tier, on the grounds that the script itself says the precise
reading is the founder's — but the founder cannot make that call against a word with no referent.

This is not a complaint about the standard's drafting. The standard was written 2026-07-12; the
seven-tier scheme is S2 work that landed after it. The two have simply never been reconciled, and
part (2) cannot be answered until they are.

## Q-C1 — Part 3 pools consult and guard, and the script says this is unruled

`false-hold-observation-report.ts` prints, on its own output, at the point of the rate:

> SCOPE, stated because ruling 2 speaks of "the guard rate": the figure below POOLS the consult and
> guard populations — Part 3 has never been population-split (only Part 3b is). The ruled exclusion
> is applied to that pooled figure. **A population-split Part 3 is an OPEN, UNRULED item.**

§4.2 of the pre-flip report supplies the split by hand from Part 3b's own cross-tabs (consult: 0
false / 70 correct under the composed regime; guard: 0 false / 3 correct, now carrying your ruled
`n=3` qualification). **The headline part (3) figure remains the pooled one.**

Given the 2026-09-11 ruling held that a figure mixing two instrument regimes *"does not describe
either"* — **does the same reasoning reach the consult/guard pooling?** The two populations differ in
more than volume: the guard path carries the `depth: ""` bound, writes no record on a consult outage,
and reaches a hold by a different route (a deny, not a loop-opening). If it does reach, part (3)'s
headline should be split and the report's §4.2 split becomes the operative reading rather than a
supplementary one. If it does not, the distinction is worth stating so that a future session does not
re-raise it.

## What this session is not asking

It is not asking whether to perform the accreditation write — that is the founder's call and your
ruling already declined to pre-empt it. It is asking what "evaluated" and "above conservative" mean,
so that whatever the founder decides can be checked against something.

---

**Nothing built, activated, or written to produce this relay. No accreditation write has been
performed. The observation window is unchanged and still running; part (1) reaches its counting
threshold 2026-09-13T09:44:55Z. D2 remains blocked. The S11 flip remains REFUSED. Weights remain
BLOCKED. The 0h call remains the founder's.**
