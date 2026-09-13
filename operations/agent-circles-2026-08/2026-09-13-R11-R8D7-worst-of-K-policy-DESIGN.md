# R11 — Deliverable B: R8-D7 as amended — the worst-of-K sampling policy, at the contract level, with its parameters left OPEN

> **⚖️ RULED 2026-09-13, same day, on the relay this document fed** (verbatim, canonical:
> `2026-09-13-mentor-ruling-R11-seven-questions-verbatim.md`; wins over this document).
> **Q-R11-B1:** §1.4's fork is settled — **reading (i), floor-only dethronement**, ruled; the
> recorded worst-draw proximity still flows on the existing edge (R9-D10) but never re-ranks a
> floor-free winner. **Q-R11-B2:** §2/§5's incomplete-series parameter is settled — **hold**; no
> verdict issues on fewer than K draws; disclose the hold and its cause, never a partial verdict.
> **Q-R11-A2** (shared with Deliverable A): §5's surface parameter confirmed **gate only**; the
> consult path is a separate future design, not an extension. **K, the trigger condition,
> vocabulary and the persistence target remain OPEN** (Q-R11-A1/A3/A4 bear on them via Deliverable
> A). **No build is licensed by this ruling.**

**Authored 2026-09-13 (from `date`)** by the standing-runner design sitting R11
(`sagereasoning-6b [802222]`), tier `governance` / design documents, on the main checkout, under
`operations/handoffs/founder/2026-09-13-standing-runner-R11-R8D7-policy-and-live-measurement-design-NEXT-SESSION-PROMPT.md`.
**This document designs a policy at the contract level. It proposes no build, licenses no build, sets
no parameter, touches no file under `website/`, changes no R18 surface (wording is STAGED in §9, not
applied), and elects nothing.** Any implementation of worst-of-K in a live path *"is its own
`code-critical` founder-walked step"* (Exchange 5's recording note), with its own PR19 and its own
activation. Every number is a claim to re-derive.

**Standing facts this document rests on and does not move.** **W is elected as doctrine** — *"A floor
is a ceiling on permitted risk. It is not a majority signal about an input's character… W is the
sampling-layer analogue of the weakest-link minimum the engine already applies"* (Exchange 5). **No
sampling layer exists on the live gate.** **K=1 with the published disclosure is the live state today
and IS W** (Q-M6). The near-boundary R18 gap is NOT closed (Q-S2). Weights BLOCKED.

**Sources (verbatim wins).** R8 §4.9, §5.3, §5.4, §7 #5, §11, §12; R9 §11 (R9-D10), §16; the
2026-08-30 Q3 floor-semantics ruling; the five Option S exchanges and the election document; the
R8-D7 scoping draft; Q-M5–Q-M8 (`operations/trust-layer-2026-07/2026-09-13-mentor-ruling-eight-questions-w2-work-s11d2-sequencing-r8d7-under-w-verbatim.md`);
the published disclosure (`website/public/llms.txt`); `manifest.md` §"The Prerequisite Criterion";
the watching-table vocabularies (read only). Deliverable A
(`2026-09-13-R11-live-loop-verdict-measurement-DESIGN.md`) is the measurement this policy's
parameters wait on.

---

## 1. Scope — what enters the sampling layer

### 1.1 The amended scope, verbatim

> *"R8-D7 applies worst-of-K to the would-be winner population only. A rejection that has already
> blocked does not enter the sampling layer — it is already blocked. The sampling layer's purpose
> under W is to catch winners that carry a latent floor the single-draw verdict missed. The scope is
> therefore: K-sampling of inputs that would otherwise permit, with any floor among K draws blocking.
> The re-election fixpoint for rejections is removed. The dethronement path for winners remains."*
> — Q-M5

### 1.2 "Would-be winner", defined against the runner's election as R8/R9 describe it

The runner's cycle, as recorded (R8 §2; the S6 report; the watching handler's ruled vocabularies):
each candidate is examined once at `/api/guardrail`; a floor makes it `rejected_by_guardrail`; the
survivors pass the novelty check (`rejected_by_novelty` otherwise — the guardrail-then-novelty
order is as the handler's own comment describes the survivors, *"passed guardrail filtering AND
passed the novelty check"*, and as the vocabulary is ordered; no source read here states the
sequencing in so many words, and a build must confirm it against the runner); **the election returns
the highest-proximity survivor, ties broken at random** (R8-D6c's `election_basis ∈ {uncontested,
tie_break_random, out_scored}` is the telemetry of exactly this; in the closed run h7's five wins were
four tie-breaks and one uncontested); every other survivor is `not_selected`.

**Definition.** *The would-be winner is the candidate the runner's election returns on the cycle's
STANDING verdicts* — the verdicts as they are at the moment the election runs, which before any
sampling are the single-draw verdicts. It is a role a candidate holds, not a property of its text:
a candidate becomes the would-be winner when the election returns it, and stops being it when
dethroned (§3).

**What enters the sampling layer, and only this:** the would-be winner, at the moment the election
returns it. Nothing else in the cycle is sampled — not the other survivors, not the novelty rejects,
and not the guardrail rejections (*"already blocked"*). Under the amended scope the sampling layer is
a post-election check on one candidate at a time.

### 1.3 What the removal of the rejection fixpoint does to R8 §5.3's iteration semantics

R8 §5.3 wrote the iteration as a two-directional fixpoint: *"a rejection whose resampled verdict
recovers re-enters the field; a winner whose verdict drops is dethroned, and the new would-be winner
would then hold a single-sample verdict while the deposed one held three. The procedure must therefore
be a fixpoint: re-elect after each resampled change, K-sample any candidate that newly holds the winner
slot, and repeat until the election is stable."*

Under Q-M5 the first branch is gone by construction (*"The recovery path is closed"*). What remains
is **monotone**: the field of survivors can only shrink, and the only event the sampling layer can
produce is *the would-be winner leaves the field*. The procedure is therefore no longer a fixpoint
over a field that can grow and shrink; it is a **descending chain**:

1. Elect on the standing verdicts → would-be winner `w₁`.
2. Sample `w₁` (K−1 further draws of its byte-identical text). If any draw floors, `w₁` is blocked
   under W, leaves the field, and its recorded verdict becomes the worst draw (§2). Re-elect on the
   remaining survivors → `w₂`. Repeat.
3. If no draw floors, `w₁` stands; its recorded verdict is the worst of its K draws (§2). **Stop.**

**Termination** is trivial and stronger than R8's: each candidate is sampled at most once, the field
strictly shrinks on every non-terminal step, and the chain ends either at a would-be winner that
survives K draws or at an empty field — a **null cycle produced by sampling** (`null_cycle` is
already in the ruled cycle-level vocabulary; whether a sampling-produced null cycle needs its own
outcome value is a vocabulary question for the build, §5).

**The cost bound changes shape and drops.** R8's bound counted every candidate that *"ever becomes
decision-bearing"* — winners and rejections — at ~2 extra calls each (K=3), worst case *"≈ 2 × 120 =
240 extra calls per 20 cycles"* if every candidate were drawn in. Under the amended scope
rejections cost **zero** extra calls, and the worst case is (K−1) × (survivors in the cycle), reached
only if every survivor in turn is elected and floored — a chain of latent floors on every survivor.
On the closed run's density (74 survivors over 20 cycles ≈ 3.7 per cycle):

| | K=3 | K=5 | K=10 |
|---|---|---|---|
| expected extra calls per cycle, if latent floors are rare (0/144 on measured winners) | ≈ 2 | ≈ 4 | ≈ 9 |
| worst case per cycle (every survivor elected and floored in turn) | ≈ 7.4 | ≈ 14.8 | ≈ 33 |
| expected per 20 cycles at the CI-10 mean $0.0142/call | ≈ $0.57 | ≈ $1.14 | ≈ $2.56 |

Arithmetic on a closed-run density and the measured winner stratum, shown to make the shape of the
bound visible; **not** a cost the policy claims — Deliverable A's run reads the live density.

### 1.4 The dethronement path and its two possible readings — one design question, recommended not decided

*"The dethronement path for winners remains"* (Q-M5). A would-be winner that floors on any draw is
dethroned: that reading is unambiguous. **A second reading exists and this design names it rather
than silently taking one:** under Q-M8 *"the operative verdict is the worst draw"*, and the worst draw
carries a proximity as well as a decision; the election ranks by proximity. If the sampled would-be
winner's recorded proximity becomes its worst-of-K proximity while every other survivor still holds a
single-draw proximity, the election is then comparing a minimum of K draws against single draws — two
different statistics on one ranking. That could dethrone a would-be winner that floored on no draw,
in favour of an unsampled survivor whose single draw happened to read higher, which is then sampled,
deflated, and so on down the field.

- **Reading (i) — floor-only dethronement.** The sampling layer dethrones only on a floor. The
  worst-of-K proximity is *recorded* (Q-M8; R9-D10 — it is what flows on the backward edge) but the
  election does not re-rank a floor-free sampled winner against unsampled survivors on it.
- **Reading (ii) — full worst-draw re-ranking.** The recorded worst-of-K proximity re-enters the
  election, and a floor-free sampled winner can be dethroned by an unsampled survivor.

**⚖️ RULED (Q-R11-B1, 2026-09-13): reading (i).** *"The sampling layer dethroning a would-be winner
requires a floor. A floor-free sampled winner is not dethroned by an unsampled survivor whose single
draw read higher… A K-draw minimum is systematically deflated relative to a single draw on the same
distribution. Ranking them against each other on the election axis would disadvantage the sampled
candidate by construction, not by evidence. That is not what a floor is for. The worst-draw proximity
still flows on the existing backward edge per R9-D10. It does not re-rank a floor-free winner."* The
design's recommendation and its grounds — the ruling's own stated purpose as catching a latent floor,
not a rank; the D6a precedent against ranking a K-draw minimum against single draws — are confirmed.
The design's own retry-shopping analogy is not repeated by the ruling and is not part of the binding
text; the ruling's reasoning stands on its own. **The build brief carries reading (i). Reading (ii)
is closed.**

---

## 2. The rule

- **Worst of K.** K draws of the byte-identical candidate text (draw 1 is the runner's ordinary
  examination; draws 2..K the sampling layer's). **The operative verdict is the worst draw.**
- **Any floor blocks.** If any of the K draws returns a floor (a non-proceed at the gate's band), the
  candidate is blocked. This is W: *"any adverse draw among K samples stands"* (Exchange 5).
- **"Worst" among permitting draws.** If no draw floors, the worst draw is the draw with the lowest
  `katorthoma_proximity` rank; ties among equal-rank draws are the same verdict. The recorded
  proximity is that draw's. (Whether it re-ranks the election is §1.4.)
- **Engine outage and Tier-1 pause are not draws.** An `engine_unavailable` or `tier1_pause` outcome
  is neither a floor nor a permit; it is recorded as its own class and does not count toward K. What
  the layer does when it cannot complete K verdicts is a parameter (§5) — the conservative reading
  (treat an incomplete series as no verdict, i.e. hold) is named, not set.
- **Dethronement path retained** — §1.3 step 2; the re-ranking question §1.4.
- **No recovery path.** A rejection is never resampled. A blocked would-be winner is never resampled.
  *"The re-election fixpoint for rejections is removed."*
- **What the rule is not** (R8 §5.3, unchanged): not a weighting function; not a change to the
  ordinal scale; not active until built, reviewed and founder-activated.

---

## 3. What a sampled verdict discloses — Q-M8's list, nothing more

A sampled verdict carries, on the record and on any surface that renders it:

1. that **K draws were taken** (the number K);
2. **how many produced a floor** (the count);
3. that **the worst-draw rule was applied** (`verdict_basis: worst_of_K`).

**It must not carry a confidence scalar.** *"No confidence scalar is derived from the draw
distribution"* (Q-M8). Not a probability, not a band, not a label such as "uncertain" or "stable",
not a ratio of floors to draws presented as anything but the two integers it is made of. The
prohibition applies to the recorded verdict, the watching-table row, the founder dashboard, and any
R18 surface alike.

**The K−1 permitting draws are not evidence of anything on the record.** The scoping draft's Option D
named W's specific risk: reading the permitting draws as a measure of the block's weakness. The
disclosure carries the count of floors and the count of draws and no reading of either.

---

## 4. What persists

Per sampled would-be winner, all of it, on the watching-table complex (the persistence target R8 §4.9
inherited; the exact table is a build question under the Q-B2 one-window discipline — §5):

- **every draw**, with the per-draw fields Deliverable A §4.1 specifies (verdict, recommendation,
  `katorthoma_proximity`, `proximity_floors` including `basis`, `is_kathekon`/`kathekon_quality`,
  corroboration contradiction, outage/pause class, signature and `key_id`, the CI-10 meter, timestamps)
  — the draws are the same record whether they are measurement (A) or policy (B); the difference is
  whether the operative verdict reads them;
- **the floor attribution per flooring draw** (which domain, or sparse-extraction, or corroboration);
- **`verdict_basis: worst_of_K`** on the recorded verdict, with `k` and `n_floors` as integers;
- **`operative_draw_index`** — which draw's verdict is the recorded one;
- the election event: dethroned-by-sampling, or stood — so the descending chain (§1.3) is
  reconstructible from the record;
- **for an unsampled candidate, `verdict_basis: single_draw`** (K=1), so the record never leaves the
  basis implicit — the live state today, made explicit at the build.

All of this stays founder-only on the watching table (§2.5 of the watching design: *"NEVER served
publicly"*); what reaches a public surface is §3's three items.

---

## 5. Parameters left explicitly OPEN — to be set from Deliverable A's data

**K.** Open. *"K is a cost election for the founder. W does not impose a doctrinal minimum above
K=1"* (Q-M6). Set from Deliverable A §5.4's K-subsampling table on a live population, not from the
closed run (Q-M7). **K=1 with the published disclosure is the live state today and IS W** —
*"'no sampling, disclosure carried' is W at K=1. It is not a rejection of W. It is the cheapest
implementation of W."*

**Trigger condition.** Open. Whether the sampling layer runs on every would-be winner (the
unconditional form), or only on would-be winners meeting a first-draw condition (the scoping draft's
Option C shape — proximity distance to the band threshold; `is_kathekon: null`; an `uncorroborated`
finding), **is set only after Deliverable A §5.5's cross-tabulation exists and only if the mentor
rules a first-draw signal admissible** (scoping Q3, carried as Q-R11-A1). Until then the only form
this design describes is the unconditional one, and it describes it without electing it.

**Incomplete-series handling.** **⚖️ RULED (Q-R11-B2, 2026-09-13): hold.** *"When the sampling layer
cannot obtain K verdicts for the would-be winner, no verdict is issued until K verdicts are in hand…
A partial series under W is not a completed measurement. The worst-draw rule requires K draws to
operate; fewer than K draws is not a worst-of-K verdict, it is an incomplete attempt… Hold until K
verdicts are obtained. Disclose the hold and its cause. Do not issue a partial verdict."* The fallback
reading named in §2 (the single operative draw stands, incompleteness disclosed) is closed. **This is
now a parameter set, not open** — the only remaining build question is where the hold is recorded and
surfaced (a build-session detail, not a doctrinal one).

**Vocabulary.** Whether a sampling-produced block needs its own candidate outcome (distinct from
`rejected_by_guardrail`, which today means a single-draw floor) and whether a sampling-produced empty
field needs its own cycle outcome — a founder-walked CHECK-widening in the bundled migration window,
the `not_selected` precedent (migration-before-code; backward-compatible superset). Named, not
designed.

**The dethronement reading** — §1.4, Q-R11-B1.

**Surface.** **⚖️ RULED (Q-R11-A2, 2026-09-13): gate only.** *"The sampling policy does not reach the
consult path at this stage… If the consult path comes into scope in future, it is a separate design
with its own measurement, not an extension of this one."* `/api/reason` is closed to this policy
until its own measurement exists.

**Persistence target.** Open. §4 names the fields and the watching-table complex as the home; the
exact table (a new FK'd table in the shape Deliverable A §4.2 names for the measurement, or columns
on the candidate row) is a build question under the Q-B2 one-window discipline, bundled with R9
§16.2's migration window, not decided here.

---

## 6. R9-D10 restated for the amended scope

R9-D10 confirmed R8 §4.9's evaluation — the would-be-winner refinement path is *"an examination
refinement loop, not an information-integration feedback path"* — with one precision: *"under M or W
the recorded verdict changes, and the recorded verdict is what flows on that existing edge — so a
non-S policy changes what flows on the edge, not the number or topology of edges."*

Restated under Q-M5: the recorded verdict that can change is now **the would-be winner's only** —
permit → block on a latent floor, and proximity → worst draw. **Rejections' recorded verdicts are
unchanged by construction** (never resampled), so the change in what flows on the existing edge is
strictly narrower than the one R9-D10 evaluated. The topology is unchanged: the sampling layer adds
no edge into generation; the edge it changes the content of is the one the watching table already
serves (R9 §12 block 4; §3.3's examined-at-all exhaustion read). The descending chain (§1.3) is
bounded, terminating, examination-side, and inert at K=1. **R9-D10's confirmation holds under the
amendment; this restatement elects nothing, and the confirmation is carried to the build brief as
R8 §4.9 required, not treated as discharging the build's own review.**

---

## 7. The Prerequisite Criterion — applied to the recorded verdict

**Engaged.** The recorded verdict is a practitioner-facing output (it is what an agent receives and
what the watching table records; R8 §5.3: *"the recorded verdict is a practitioner-facing score"*).

R8's condition governs and is not weakened here: *"passage depends on the disclosure riding the
record"*; W's specific risk is *"recording examination friction that no additional examination
produced"*. Under the amended scope that risk narrows — every extra draw **is** an additional
examination of the same text, so a block from draw 4 is friction that examination produced, not
friction manufactured by the layer. What remains is the risk that the block *looks* like a stronger
finding than one draw in K: that is closed only by §3's disclosure (K and the floor count, no
scalar). **The design passes the criterion conditionally: with §3 riding every recorded sampled
verdict, and with §4's full draw record behind it, the output is a verdict plus the examinations that
produced it — adequate ideas built through more examined assent, not fewer. Without §3 it fails, and
the build brief must pin §3 as a structural requirement (a sampled verdict cannot be written without
`k`, `n_floors`, `verdict_basis`), not a rendering convention.**

Two resemblances are named and ruled against in advance: (a) any field derived from the draw
distribution that reads as confidence (Q-M8); (b) any surfacing of the K−1 permitting draws as
mitigating the block (§3). Either would be an output resembling a better-examined verdict without
the examination, and is ruled against on this criterion.

---

## 8. What this design deliberately does not do

No build. No K. No trigger. No election between the two dethronement readings. No `/api/reason`
extension. No R18 change — the wording in §9 is staged and marked conditional. No change to the
gate's band, to ADR-010 §4's floors, or to the guardrail's blocking behaviour (PR20 named these as
the mechanisms a ruling lands on; this design lands on none of them, because it is not a ruling).
No claim about the closed run's numbers beyond arithmetic shown as arithmetic. **The live gate today
is W at K=1 with the published disclosure; this document leaves it exactly there.**

---

## 9. R18 wording — STAGED, NOT APPLIED; applies only if K>1 is ever served

The published sentence (`llms.txt`, the "What 'deterministic' scopes to" paragraph, its last
sentence; the trust-record item's *"Read a single verdict as one draw"*) is **true today** and is
left as published (Q-M8's recording note: *"left as published — it is true of the live gate today
(W at K=1, Q-M6). The amendment is owed if and when K>1 is served"*).

**Staged amendment, conditional, for founder sign-off on three surfaces when and only when a sampled
verdict is served on a live path** (Q-M8: *"The R18 update requires founder sign-off on three live
public surfaces. This ruling does not pre-empt that."*):

> If a verdict is consequential to you, treat one call as one draw — re-submitting is a legitimate
> way to see whether the reading is stable. **Where a verdict is marked `verdict_basis: worst_of_K`,
> K draws of the identical text were taken and the operative verdict is the worst draw: any floor
> among the K draws blocks. The number of draws and the number that produced a floor are disclosed
> alongside the verdict. No confidence scalar is derived from the draw distribution, and none should
> be read into the counts.**

The bolded addition is the whole of the change; the existing sentence stays, because a single-draw
verdict (`verdict_basis: single_draw`) is still one draw. **The three surfaces, named:** (1)
`llms.txt` — both the guardrail paragraph's closing sentence and the trust-record item's *"Read a
single verdict as one draw"*; (2) `agent-card.json` — the `verdict-variance/v1` extension's *"Read a
single verdict as one draw"*, which gains the same parallel clause; (3) `api-docs/page.tsx`, which
**carries no "one draw" sentence today** (grep-confirmed at this writing: no match on "one draw",
"single verdict" or "re-submit"), so nothing is staged for it unless a future version adds the
sentence. **Nothing here is applied; no file under `website/` was touched by this sitting.**

---

## 10. Questions drafted for the mentor (RULED 2026-09-13 — see the banner and §1.4/§2/§5 above; kept for the record)

- **Q-R11-B1 — the dethronement reading (§1.4).** **RULED: reading (i), floor-only.**
- **Q-R11-B2 — incomplete series under W (§2, §5).** **RULED: hold; no partial verdict.**
- **Q-R11-A2 — surface.** **RULED: gate only** (see §5's Surface entry above; shared with
  Deliverable A).
- Scoping Q2 (provenance-triggered stratum) is **narrowed, not closed, by Q-M5**: the provenance
  stratum can no longer be a population (rejections are out), but "would-be winner whose text this
  gate previously rejected" could still be proposed as a *trigger*. That remains a trigger question
  under Q-R11-A1's condition (a measured relation to the latent floor) and is not answered by this
  round.
- Scoping Q3, Q8 are carried by Deliverable A §9 as Q-R11-A1/A3, both now ruled — see Deliverable A.

---

## 11. Standing constraints this design honours (the summary index)

No code, schema, flag, credential, migration, deploy or push. No `GUARD_RE` file touched. No R18
surface changed (§9 staged only). No relay sent. `option-s/` not opened. Parameters open (§5).
No confidence scalar anywhere (§3, §7). No directional decomposition anywhere. **D2 remains blocked.
The S11 flip remains REFUSED. Weights remain BLOCKED. The 0h call remains the founder's.**

## 12. PR19 review record — one blind Sonnet reviewer, read-only, RUN 2026-09-13; all findings folded

**What the reviewer was given:** this document and the source paths in its header (plus read-only
access to the watching handler/migration and the two `llms.txt` sentences), with an instruction not
to open `option-s/`. **What it was not given:** Deliverable A beyond the sections this document
cites into, Deliverable C, the session prompt, the close, or the author's reasoning. Model `sonnet`
under the founder's standing permission for adversarial reviews.

**Findings — 0 HIGH, 0 MEDIUM, 4 LOW, 1 NIT; the four hard dimensions (no parameter set; no
confidence scalar; no build language; fidelity to Q-M5–Q-M8) and the R9-D10 and Prerequisite
Criterion sections reported clean; the §1.3 cost table re-checked and confirmed.** Each verified
first-hand before folding:

1. **LOW — §4 → §5 dangling pointer** ("the exact table is a build question … §5" with no §5 bullet).
   **Folded** — a "Persistence target — open" bullet added to §5.
2. **LOW — "confidence figure" vs Q-M8's "confidence scalar"** in the staged §9 wording. **Folded** —
   aligned to the ruling's term.
3. **LOW — §9 named two surfaces, Q-M8 says three.** Verified by grep: `api-docs/page.tsx` carries no
   "one draw" / "single verdict" sentence today. **Folded** — the three surfaces are now named and the
   api-docs absence stated.
4. **LOW — §1.4's "retry-shopping asymmetry R8 §5.3 ruled out"** overstated the link: R8's ban was on
   re-running adverse verdicts only, a mechanism that cannot recur once rejections are never
   resampled. **Folded** — reworded to "of the same general shape as … though not that mechanism".
5. **NIT — §1.2's guardrail-then-novelty order** is implied by the handler comment and vocabulary
   ordering, not stated in so many words by any source. **Folded** — the inference is disclosed and
   flagged for the build to confirm against the runner.

**What the reviewer did not check (its own statement):** Wilson intervals (none are computed in this
document); the per-input draw sequences from raw data; whether `website/` code implements the
pipeline as the record describes; Deliverable A's soundness beyond the citations into it.

*End of Deliverable B. Verbatim wins over every summary, including this one.*
