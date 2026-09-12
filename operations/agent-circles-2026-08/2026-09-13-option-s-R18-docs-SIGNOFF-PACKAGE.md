# R18 sign-off package — the Option S measurement on the three live public surfaces

**2026-09-13. DRAFT. Nothing is applied.** R18 requires founder sign-off on wording **before** any
public surface changes. This package carries the exact text; the founder signs, then a session
applies it verbatim.

**Ruled 2026-09-13** (`2026-09-13-mentor-rulings-option-s-result-and-F-R1-verbatim.md`, Q-S2). The
ruling confirms what the update **may and must not claim**; it does not pre-empt the sign-off.

---

## The constraint, stated first because it is the whole difficulty

**MUST NOT:** publish **0.536** against the live disclosure's sentence *"no rate has been measured on
near-boundary inputs as a defined population."*

**The gap is NOT closed.** Of the 9 rejections, **4 are stably blocked and 2 stably permitted** across
all ten draws; only 3 sit near a boundary behaviourally. Publishing 0.536 there would substitute a
**provenance** category (*rejected in August*) for a **behavioural** one (*sits near the boundary
today*) — the exact error the disclosure's own two-population split exists to prevent.

**MAY:** publish the measurement **labelled by its actual provenance**, with strata and per-input
distributions — and, ruled *"the measurement's most useful contribution"*, the winner stratum's
**zero boundary crossings in 144 draws against 10 of 15 varying on proximity**, which confirms on
real candidate texts the proximity-versus-decision distinction the disclosure already draws with its
benign control.

---

## Surface 1 — `website/public/llms.txt`

**Insertion point:** inside the **"What 'deterministic' scopes to"** paragraph (currently line 434),
**immediately after** the sentence ending *"…no rate has been measured on near-boundary inputs as a
defined population."* and **before** *"Two sweeps on one date…"*.

**Rationale for that placement:** it lands directly after the sentence it must not be read as
answering, so a reader meets the limit and its non-closure together rather than several sentences
apart.

### Exact text to insert

> **A second measurement was taken on 2026-09-12, on real candidate texts rather than synthetic
> probes: 24 inputs × 10 byte-identical submissions each at the default band, 240 calls, 228 verdicts
> and 12 engine outages.** The inputs are the decision-bearing candidates of a closed internal
> reasoning-loop run — 15 that the loop selected and 9 that this gate had previously rejected — so
> they are **real traffic of the kind the loop submits, not a near-boundary population**: this
> measurement does **not** close the gap named in the sentence above, and the two strata are labelled
> by where the inputs came from, not by where their verdicts sit. **Per-input distributions, as
> before, rather than a single rate: 21 of the 24 inputs returned the same block-or-permit decision
> on all ten draws — 17 permitted throughout, 4 blocked throughout — and 3 varied.** On the 15
> previously-selected inputs the gate **blocked on none of 144 verdicts** while **10 of those 15
> varied on proximity**, which is the same behaviour the benign control above showed and is worth
> stating plainly: **the proximity score moves while the block-or-permit decision does not.** On the 9
> previously-rejected inputs a floor appeared on **45 of 84 verdicts (Wilson 95% CI 43.0–63.8%)** —
> **a rate about inputs this gate had already rejected once, which is a statement about that
> provenance and not about near-boundary inputs as a class.** **Two of the 24 rest on 4 verdicts
> rather than 10**, the other six calls having returned engine outages, and the interval carries that
> limit. One input carried over from the 2026-08-30 probe set — the package-registry publish — was
> examined at K=10 on both dates and crossed once then and not at all now, a difference well inside
> the noise for a rate of that size at that K; **no conclusion about drift is drawn from it.** The
> inputs were produced by a loop running under an earlier build of the examination path than the one
> that examined them here.

**Word-level notes for the signer.** *"previously-selected"* and *"previously-rejected"* are used in
place of the internal terms *winner* and *guardrail rejection*, which mean nothing to a reader.
**43.0–63.8%** is the interval on the floor rate over verdicts, recomputed at correction; the raw
counts are given so a reader can check it. The c11 sentence deliberately names **no conclusion** —
per the ruling, the difference is within the noise envelope and *"no conclusion about drift is
warranted."*

---

## Surface 2 — `website/public/.well-known/agent-card.json`

**No new extension.** The existing `verdict-variance/v1` extension is the right home — this is the
same claim with more evidence, and a second extension would imply a second, separate disclosure.
**The extension count therefore does not change** (derive it, never quote it:
`python3 -c "import json;d=json.load(open('website/public/.well-known/agent-card.json'));print(len(d['capabilities']['extensions']))"`).

### Exact text to APPEND to that extension's existing `description`

> A second measurement on 2026-09-12 used real candidate texts rather than synthetic probes: 24
> inputs at 10 byte-identical submissions each, 240 calls. 21 of the 24 returned the same
> block-or-permit decision on all ten draws; 3 varied. On 15 inputs an internal reasoning loop had
> selected, the gate blocked on none of 144 verdicts while 10 of those 15 varied on proximity — the
> proximity score moves while the block-or-permit decision does not. On 9 inputs this gate had
> previously rejected, a floor appeared on 45 of 84 verdicts. That rate is about inputs already
> rejected once and is not a rate on near-boundary inputs, which remain unmeasured as a defined
> population.

---

## Surface 3 — `website/src/app/api-docs/page.tsx`

**Insertion point:** the existing `/api/guardrail`-adjacent determinism/variance note.

### Exact bullet to add

> **Measured again 2026-09-12 on real candidate texts** — 24 inputs × 10 submissions, 240 calls. 21
> of 24 gave the same block-or-permit decision on every draw. On 15 loop-selected inputs: **no blocks
> in 144 verdicts**, though 10 of the 15 varied on proximity — the score moves, the decision does
> not. On 9 previously-rejected inputs: a floor on 45 of 84 verdicts. **Neither figure is a rate on
> near-boundary inputs**, which remain unmeasured as a defined population.

---

## What the signer is being asked to approve

1. **That 0.536 is published labelled by provenance** (*inputs this gate had already rejected once*)
   and **never** as a near-boundary rate, with the non-closure stated in the same breath on all three
   surfaces.
2. **That the winner-stratum finding is published** — zero blocks in 144 verdicts with 10 of 15
   varying on proximity — as confirmation of the proximity-versus-decision distinction.
3. **That no new agent-card extension is created** and the count is unchanged.
4. **That the c11 non-reproduction is published with no conclusion attached.**
5. **That the two thin inputs are disclosed** on `llms.txt` (the fullest surface) and not on the two
   briefer ones, where they would crowd out the load-bearing claims. *If the signer prefers them on
   all three, say so — the omission is an editorial judgement, not a ruling.*

## What this package does NOT do

It does not apply anything. It does not claim the near-boundary gap is closed. It does not draw a
drift conclusion from c11. It does not create an extension. It does not touch any file matching the
byte-identity `GUARD_RE` — all three surfaces were checked clear, which matters while the false-hold
observation window is running.

**On application:** apply the wording **and** its supporting figures as ONE change — wording alone
repeats the failure the 2026-09-06 assessment-contract correction was written to close. Re-derive
every count from source at application time; do not quote them from this package.
