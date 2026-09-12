# The M/W/S election — the decision document

**2026-09-13.** Prepared by the executing session under the 2026-09-13 rulings. **This document
does not make the election and offers no recommendation between W, M and S** — R8 reserved that as
doctrine. It states the question, the evidence, and what each policy does, so the election can be
made on accurate terms.

**Binding records:** `2026-09-13-mentor-rulings-option-s-result-and-F-R1-verbatim.md` and the
correction ruling capture of the same date. **Verbatim wins over this document.**

---

## 1. The question

R8 §5.3 left three candidate policies for a floor verdict under sampling:

- **M — median-of-K.** Treat a floor as a sample of a distribution; take the ordinal median.
- **W — worst-of-K.** Any floor among the K samples stands — the sampling-layer analogue of the
  weakest-link minimum the engine already applies across domains.
- **S — sample and disclose, decide nothing.** Record all K verdicts; **keep the FIRST verdict as the
  operative one**; change no gate behaviour.

**The doctrinal question, ruled and unchanged:**

> **When the engine returns a block verdict on a minority of draws on an input that is otherwise
> permitted, does the project prefer a policy that blocks on any adverse draw, or one that blocks
> only when the weight of draws is adverse?**

Ruled: *"a values judgement about what a floor is for — whether it is a ceiling on permitted risk
(any adverse draw is disqualifying) or a majority signal about the input's character (one adverse
draw in ten is noise, not signal)."* **Doctrine, not statistics.**

---

## 2. Where the election has content — and where it has none

**21 of 24 measured inputs are deterministic**: every one of their ten draws returned the same
block-or-permit decision. **Where the engine is deterministic there is no uncertainty for a sampling
policy to handle, and M, W and S coincide by construction.**

**The election has content on 3 inputs.** Everything below concerns those three.

**Variable fraction: 3/24 = 0.125, Wilson 95% [0.043, 0.310].** Ruled **directional context, not the
election's basis** — the doctrinal question does not need a larger n; this figure does not bear the
weight of a measurement.

---

## 3. What each policy does, on each of the three inputs

**Read from the stored verdict sequences, not from distributions.** S is `first-verdict-operative`,
so its outcome depends on the order of draws and cannot be read off a distribution.

### c6 — cycle 6, `combinatorial_generation`, 390 bytes
> *"Add an honest 'extraction confidence' note next to each signed assessment on the public trust
> record, naming the extraction-trust ceiling directly…"*

Sequence: `principled, deliberate, reflexive, deliberate, deliberate, deliberate, principled, deliberate, principled, principled` — **1 of 10 blocks.**

| | outcome |
|---|---|
| **W** | **BLOCKS** |
| **M** | permits (`deliberate`) |
| **S** | permits (`principled` — first draw) |

*W diverges. M and S coincide here — but, as ruled, S's permit is **coincidental with M's, not
structural**: it is what the first draw happened to be.*

### c9 — cycle 9, `friction_detection`, 394 bytes
> *"Add an explicit 'owner' field to the next-session handoff template for any founder-walked
> Critical step in a session sequence…"*

Sequence: **`reflexive`**, then 9 × `principled` — **1 of 10 blocks, and the block came first.**

| | outcome |
|---|---|
| **W** | **BLOCKS** |
| **M** | permits (`principled`) |
| **S** | **BLOCKS** (`reflexive` — first draw) |

*W and S agree; **M diverges**. S blocks an input that **9 of 10 draws permit**.*

### c16 — cycle 16, `friction_detection`, 448 bytes
> *"T-01: at the point a freshly minted UPC credential first approaches its own CI-6 default quota…
> add quota-state headers…"*

Sequence: **`deliberate`**, then 9 × `reflexive` — **9 of 10 block, and the permit came first.**

| | outcome |
|---|---|
| **W** | **BLOCKS** |
| **M** | **BLOCKS** (`reflexive`) |
| **S** | **PERMITS** (`deliberate` — first draw) |

***S alone diverges from both.** S permits an input that **9 of 10 draws block**.*

### The three together

| input | blocks/10 | W | M | S |
|---|---|---|---|---|
| c6 | 1 | **block** | permit | permit |
| c9 | 1 (first) | **block** | permit | **block** |
| c16 | 9 | **block** | **block** | **permit** |

**No two policies agree on all three.** W blocks all three. M permits two and blocks one. S permits
two and blocks one — **but not the same two as M.**

---

## 4. What S is — stated plainly, as ruled

S was characterised in the original design as the **conservative baseline**: the status quo, the safe
option to build, *"changes no gate behaviour at all; pure measurement."* **That characterisation does
not survive the data.**

**S is first-verdict-operative. On a variable input its outcome is determined by draw order, not by
the weight of the evidence.** On this population it returned the **minority outcome on 2 of the 3
variable inputs** — blocking an input 9 of 10 draws permit, then permitting an input 9 of 10 draws
block. On c16 it disagreed with both M and W.

**This is a property the election must carry, not one to be set aside.** Ruled: *"the election cannot
be conducted without the parties knowing what S actually does."*

**Stated precisely, so it is neither overstated nor softened:** S is safe in the sense that matters
operationally — it changes nothing, so adopting it cannot make the gate behave differently from how
it behaves today. It is **not** conservative in the sense of erring toward caution. Those are
different properties, and the original framing conflated them.

**⚠ This correction was the executing session's error and reached a binding ruling before being
caught.** The prior framing paired M and S on the false claim that both permit c6 and c9. Recorded
here so the election is not made on the superseded terms.

---

## 5. The evidence, and every limit that rides it

**The measurement.** 240 calls, 24 inputs × K=10, 2026-09-12, against the live `/api/guardrail`.
228 verdicts, 12 `engine_unavailable`, zero `tier1_pause`.

| stratum | inputs | draws | floors | rate | Wilson 95% |
|---|---|---|---|---|---|
| **guardrail rejections — OPERATIVE** | 9 | 84 | 45 | **0.5357** | [0.430, 0.638] |
| winners | 15 | 144 | 0 | 0.0000 | [0.000, 0.026] |
| pooled — **disclosed, NOT the election's input** | 24 | 228 | 45 | 0.1974 | [0.151, 0.254] |

**Ruled:** the rejection-stratum rate is operative; the pooled rate *"describes no actual input in the
set"* and is not the election's input.

**The limits, all ruled to ride every figure:**

1. **Not representative.** The sample is not representative of a future candidate stream.
2. **Selected on the measured variable.** The strata were chosen on the very property being measured.
3. **Multi-channel variance.** A floor count does not identify *which* floor fired.
4. **Engine era.** The texts were produced by a loop under the older engine, though today's engine
   examined them.
5. **Two thin inputs.** Two inputs rest on **4 verdicts rather than 10** (six `engine_unavailable`
   each) — one a rejection (c15), one a winner. **Neither is c6, c9 or c16**, so the election's
   content is unaffected. The rejection-stratum interval carries this limit.
6. **c11 did not reproduce** — 1/10 blocked on 2026-08-29, 0/10 on 2026-09-12, byte-identical text,
   same K, with the engine change predating both. **Within the noise envelope** (at p=0.1, P(0/10) =
   0.35). **No conclusion about drift is warranted.**

---

## 6. What this document does not do

It does not make the election. It offers **no recommendation between W, M and S**. It does not
re-open the doctrinal question, the operative figure, or any limit above. It does not treat
3 variable inputs as a measurement.

**The election is the founder's and the mentor's, on the doctrine.**

---

## 7. After the election

**Revoke the credential** (`sagereasoning:option-s@v1`, ~520 quota units unused) — ruled: *"keep
until the election concludes, then revoke immediately."* Held through this correction; released once
the election is made.

**R8-D7's verdict-confidence sampling policy** proceeds on the same discharge and is not decided here.

**The R18 update** is drafted separately and needs founder sign-off on three live public surfaces.
It must **not** publish 0.536 against the *"near-boundary inputs"* sentence.
