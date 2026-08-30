# R18 sign-off package — the instrument-level verdict-variance disclosure (layer 1 of 2)

**Authored 2026-08-30.** `code-elevated` session, but **this file is documents only — NOTHING IS
APPLIED.** No public surface, code file, ADR, or battery has been touched. This is the wording put
to the founder for R18 sign-off.

**Mandated by:** the 2026-08-30 mentor ruling on verdict-variance disclosure. Verbatim canonical:
`2026-08-30-mentor-ruling-verdict-variance-disclosure-verbatim.md` — **the verbatim wins over this
package.** Adopted at `D-VERDICT-VARIANCE-DISCLOSURE-RULED-ADOPTED-D6a-FOLD-VERIFIED-2026-08-30`.

**Scope: the ruling's FIRST disclosure layer only** — the instrument-level, one-time
acknowledgement. The second layer (a per-verdict disagreement count riding K-sampled verdicts) is
**not in this package**; it becomes available only once D6a and Option S are running.

**The founder signs off the WORDING before any surface changes.** That is the R18 gate, and it is
why this file exists rather than a commit.

> ## STATUS 2026-08-30 — **SIGNED. HOLD RELEASED BY THE MENTOR. ONE GATE REMAINS (PR19).**
>
> **Sequence of the day, in order.** The founder **signed the wording as drafted** (§3, §4, §6),
> **elected the guardrail R10 addition in full including its advisory sentence** (§7), and
> **elected to take the epistemic-status-map route** (§8) — then, on §1, elected to **put the
> rate-location question to the mentor and hold every edit** rather than let the executing session
> resolve it on its own reading.
>
> **The mentor answered the same day, and the hold is released.** Verbatim:
> `2026-08-30-mentor-ruling-verdict-variance-rate-location-verbatim.md` (binding; it wins over this
> package). The ruling: *"Available in the watching table" described where I assumed aggregate
> measurement data would naturally accumulate… It was not a ruling that D6a's output must persist
> there. The executing session's reading is correct… **That wording stands.** D6a's DQ-2 remains
> open.* See §1 below, now resolved, for the two new obligations the ruling creates.
>
> **NOTHING IS APPLIED YET, and the reason is no longer the hold.** The remaining gate is **PR19** —
> an independent adversarial review of this wording has not been run (§11). The authoring session
> was under a standing no-subagent constraint and recorded that rather than claiming the gate
> discharged. **The wording is final; the review is what is owed.**
>
> **On the founder's call to hold, judged after the fact rather than before:** the executing
> session's reading was vindicated word-for-word, so the hold cost a round-trip and changed no
> published text. It also produced two binding constraints that would otherwise have been
> discovered later, downstream, by someone building against a disclosure whose update path did not
> work (§1). That is the trade, stated in both directions.

---

## §0 — ORDERING (binding precedent, not preference)

ADR-013 §8's 2026-08-15 amendment stated it outright: *"publishing them ahead of this code edit is
deliberately avoided — it would make a public surface claim a `does_not_attest` entry the served
envelope does not yet carry."* The 2026-08-25 amendment repeated it.

1. **Edit 1 — one commit:** `TRUST_RECORD_ENVELOPE` + the ADR-013 §8 dated amendment + the battery
   pins land **together**.
2. **Edit 2 — the public surfaces**, after edit 1 is committed.

**The public surfaces must not lead.**

---

## §1 — THE LOCATION QUESTION — **RESOLVED BY THE MENTOR, 2026-08-30**

**The question was:** the prior ruling located the rate *"a measured property of the instrument
available in the watching table"*, which is not true today. Verified this session: the watching
table is the IDEA-loop runner's per-cycle ledger (`POST /api/practice/watching`, live 2026-08-10);
its read route `/api/founder/watching` is **FOUNDER_USER_ID Bearer-gated** while the trust record is
**public and unauthenticated**; and it writes **no trust event** by its own ruled scope §2.9. D6a is
unbuilt and its persistence question (**DQ-2**) was an open election whose *recommended* default —
repo evidence files — is not publicly readable either.

**The executing session's proposed resolution** was that today's wording names **no location at
all**, because today there is no rate; the ruling's locator describes the **post-measurement** state
and belongs to the update, not this edit.

**The mentor's answer — the reading is correct, and the wording stands unchanged:**

> *"'Available in the watching table' described where I assumed aggregate measurement data would
> naturally accumulate given the watching table's role as the loop's transparency ledger. It was not
> a ruling that D6a's output must persist there. The executing session's reading is correct, and its
> interim wording — location-free, stating the rate is not yet measured and that the entry will be
> updated to name both the rate and where it can be read — is the right response to that ambiguity.
> That wording stands. D6a's DQ-2 remains open."*

**So §3, §4 and §6 need no change on this axis.** No word of the held wording moves.

### The two obligations the ruling creates, which did not exist before it

**(1) A publicly-readable location is a BINDING constraint on the eventual update** — *"derived
directly from the disclosure's purpose: to calibrate the recipient who reads
`GET /api/trust-record/{agent_id}`. A rate that lives only in a founder-facing route or in repo
evidence files satisfies the measurement requirement but not the disclosure requirement. The
disclosure exists for the recipient, not for the instrument's own records."*

DQ-2 must therefore answer **two questions, not one**: where D6a persists the measurement for the
instrument's own purposes, **and** how the rate reaches somewhere a trust-record recipient can read.
These *may* converge (a DB table feeding a public surface) or may not (repo files, in which case
**a separate served field or public document is owed**). The mentor confirms that separate delivery
is **its own scoped work, not a line in D6a**, and directs that it be **named as such in D6a's build
prompt so the scope boundary is explicit before the build opens.** — *folded into that prompt this
session.*

**(2) The eventual rate must name the path it was measured on.** *"'The variance rate is N%' without
that qualification would be a confidence-exceeds-evidence failure of exactly the kind the disclosure
corrects."* The update carries a single rate with its path named, or separate rates if both paths are
measured, or an explicit statement that one path's rate is unknown. **D6a's probe design should note
this** — *folded into that prompt this session.* This vindicates the path-scoping clause already in
the held wording (§2, §3): the mentor calls mechanism fact 6 *"a genuine complication the disclosure
must address honestly."*

---

## §2 — THE FACTS THE WORDING RESTS ON (each verified this session, not carried)

| Fact | How verified |
|---|---|
| Ten identical `POST /api/guardrail` calls, byte-identical 130-char action, live defaults (`threshold=deliberate`, `risk_class=standard`), 2026-08-29T15:59-16:03Z → **9 `deliberate`/proceed, 1 `reflexive`/blocked** | `2026-08-30-c11-rerun-experiment-record.md`, the ten-run table + the three verbatim excerpts |
| The entire 2-rank swing rode on **one field**: the same grave-act indicator's causal-stage assignment - absent x4, `phantasia` x2, `synkatathesis` x3, `praxis` x1 | same record, section "The mechanism, localized to a single extraction field" (the corrected all-ten distribution) |
| `/api/reason` and `/api/guardrail` call the **same** `extractFeatures` function | `guardrail-sandwich.ts:441` and `parallel-run.ts:657` both call `extractFeatures({...})` from `layer1-extractor.ts` |
| That function samples Sonnet at **temperature 0.2** | `layer1-extractor.ts:2265` (`temperature: 0.2`), single call site |
| **No caching** makes repeat calls identical | `layer1-extractor.ts:15` - "no module-level cache"; and empirically, ten identical calls gave four different indicator states |
| The consult path passes **additional** context Layer 1 does not receive on the gate (`stoicBrainContext`, `retrievedPassages`, `practitionerContext`, `projectContext`) | `parallel-run.ts:657-665` vs `guardrail-sandwich.ts:441-446` |
| Layer 2 **is** deterministic, and the signature attests reproducibility **from the extraction** | `applyMechanisms` is pure; llms.txt "Epistemic status of engine outputs" already says the signature "does not attest the extraction's truth" |
| Live `agent-card.json` extension count is **24** | re-derived by parsing the file this session; the +1 addition makes it **25** |
| S10 battery baseline is **140 passed, 0 failed** | run this session (`npx tsx .../s10-trust-record-surface.test.ts`). **The prompt's "106/0 at last record" is stale** - a PR20-class check that paid off |

**The honest scoping this forces, and it is load-bearing:** the measurement was made on the
**gate**, while the trust record aggregates events derived from **`/api/reason`** consults. The
shared component is the extraction stage — same function, same model, same temperature, no cache —
so the variance is a property of the instrument rather than of the gate alone. But the *rate* has
never been measured on the consult path, and the consult path's prompt carries more context. **The
wording below therefore says variance is demonstrated and shared; it does not transfer the 1-in-10
figure to the consult path, and it publishes no rate at all.**

---

## §3 — PROPOSED: new `does_not_attest` entry (`trust-record-payload.ts`)

Appended as the final item, following the house shape — state the bound, name the class, point at
the scheduled closure.

> **Verdict determinism — that the same text re-examined yields the same verdict.** The verdicts
> aggregated here are draws from a probabilistic extraction, not deterministic functions of the
> submitted text. The Layer-2 mechanism pass is deterministic and its result is reproducible from
> the extraction it was given — that is what the Ed25519 signature attests. Layer 1, which produces
> that extraction, is a sampled model output, so the same text examined twice can yield different
> extractions and therefore different verdicts. This is measured, not hypothetical: ten identical
> re-submissions of one action to the live gate on 2026-08-29 returned nine proceed verdicts and one
> block, the whole two-rank swing riding on how a single grave-act indicator's causal stage was
> assigned — the extractor placed the same indicator in four different states across the ten runs.
> That measurement was taken on the guardrail gate; the extraction stage that varied is the same
> code path, model and sampling temperature that produces the assessments this record aggregates,
> so the variance is a property of the instrument and not of the gate alone. **Its rate has not been
> measured.** A ten-run demonstration on one input establishes that variance exists; it does not
> establish how often it occurs, and no rate is claimed here. An instrument to measure it is
> scheduled; this entry will be updated to state the measured rate, and where that rate can be read,
> once it exists. Until then, read any single verdict as one draw — what the examination found on
> that occasion, not the only reading the same text can produce.

**Traceability — every clause earns its place:**

| Clause | Source |
|---|---|
| "draws from a probabilistic extraction" | ruling: *"the examination is a draw from a distribution"* |
| Layer-2-deterministic / Layer-1-sampled split | the mechanism, verified §2; prevents the reader concluding the signature is worthless |
| the ten-run figures, no percentage | ruling: rate ships **unknown**; prompt §D: *"a single-input demonstration is not a rate"* |
| "on the guardrail gate... same code path, model and sampling temperature" | the honest scoping §2 forces; without it the entry over-claims |
| "will be updated to state the measured rate, and where that rate can be read" | ruling's timing section; **no location named** — §1 |
| "read any single verdict as one draw" | ruling: the disclosure exists so a recipient *"will calibrate differently"* |

---

## §4 — PROPOSED: ADR-013 §8 dated amendment (same commit)

> **2026-08-30 amendment (verdict-variance disclosure, instrument level — mentor ruling of the same
> day, layer 1 of 2).** The does-not-attest list gains a **verdict-determinism** item. The ground is
> the standing honest-claims principle the ruling restates — *"what is attested must be what is
> actually known, stated at the confidence level the evidence supports"* — applied here to a
> property of the instrument rather than of any input: an examination is a draw from a distribution,
> demonstrated directly by the c11 re-submission experiment (ten byte-identical `POST /api/guardrail`
> calls at the live default band, 2026-08-29: nine `deliberate`/proceed, one `reflexive`/blocked,
> the two-rank swing localised entirely to one grave-act indicator's causal-stage assignment, which
> the extractor placed in four different states across ten runs). The ruling's reasoning is
> calibration, not falsity: withholding it is *"not a false statement, but a statement whose
> confidence exceeds its evidential basis"*, and the variance *"is not noise around a stable signal
> — it is a property of the instrument itself."* **The item publishes no rate.** The ruling places
> the disclosure BEFORE the measuring instrument (D6a) is built, precisely because waiting *"would
> itself be a confidence-exceeds-evidence failure: we know variance exists; we are withholding that
> knowledge from recipients while we measure how much."* **Scope discipline carried into the
> wording:** the measurement was taken on the gate, while this record aggregates `/api/reason`-derived
> events — the shared component is the extraction stage (the same `extractFeatures`, same model,
> same sampling temperature, no cache), so the item claims the variance is the instrument's and
> declines to transfer the observed 1-in-10 figure to the consult path, whose Layer-1 prompt carries
> additional context. **The ruling's "available in the watching table" locator is deliberately NOT
> published**, because D6a's persistence election (its DQ-2) is open and repo evidence files — its
> recommended default — are not readable by a public trust-record consumer; naming a location the
> number is not in would reproduce the defect this amendment corrects. D6a's DQ-2 therefore inherits
> the obligation to elect a location this disclosure can honestly name at update time. The live
> `TRUST_RECORD_ENVELOPE` gains the identical item in the **same edit**, with battery pins
> **S2-48/S2-49/S2-50** (`s10-trust-record-surface.test.ts`, each mutation-verified) — necessary
> because S2-37 is strict reference identity and cannot detect a missing envelope item. **This is
> layer 1 of 2**: the ruled per-verdict disagreement count (*"examined 3 times, 2 deliberate, 1
> reflexive, operative verdict deliberate"* — a raw count, explicitly not a confidence interval)
> lands only once K-sampling is live, and is not scoped here. The public surfaces carry the
> amendment **after** this code edit, never ahead of it — the 2026-08-15 and 2026-08-25 ordering.

---

## §5 — PROPOSED: battery pins (same commit)

Three substring pins, mutation-verified at authoring (deleting the clause must make the pin fail):

- **S2-48** — `env.includes('Verdict determinism')` — the item exists at all.
- **S2-49** — `env.includes('Its rate has not been measured')` — the rate stays UNPUBLISHED. This is
  the pin that matters most: it is what stops a later edit quietly inserting the c11 figure, or a
  D6a-derived figure, without the sign-off that publishing a rate requires.
- **S2-50** — `env.includes('same code path, model and sampling temperature')` — the honest scoping
  clause survives. Without it the entry silently over-claims that the rate was measured where this
  record's evidence comes from.

---

## §6 — PROPOSED: the public surfaces (edit 2)

**(a) `llms.txt` — Trust Record section**, appended to the "WHAT IT DOES NOT ATTEST" list, in that
list's compressed register (it paraphrases; it is not a verbatim copy of the envelope today, and
the discriminative-range item shows the house tolerance for length):

> - verdict determinism — the verdicts aggregated here are draws from a probabilistic extraction,
>   not deterministic functions of the submitted text. Layer 2 is deterministic and reproducible
>   from the extraction it was given (that is what the signature attests); Layer 1, which produces
>   that extraction, is a sampled model output, so the same text examined twice can yield different
>   extractions and different verdicts. Measured, not hypothetical: ten identical re-submissions of
>   one action to the live gate on 2026-08-29 returned nine proceed and one block, the whole swing
>   riding on one grave-act indicator's causal-stage assignment. The rate has NOT been measured — a
>   ten-run demonstration on one input shows variance exists, not how often; an instrument to
>   measure it is scheduled, and this entry will be updated with the rate and where to read it. Read
>   a single verdict as one draw.

**(b) `agent-card.json` — NEW extension, `verdict-variance/v1`.** Live count re-derived this session
as **24**; this makes **25**. `description`: the §3 item, prose-flattened. `params`:
`{ "layer2": "deterministic; reproducible from the extraction (Ed25519-signed)", "layer1":
"sampled model output; the same text can extract differently", "demonstration": { "surface":
"/api/guardrail", "date": "2026-08-29", "n": 10, "verdicts": "9 proceed / 1 block", "locus":
"one grave-act indicator's causal-stage assignment" }, "rate": "not measured", "rate_location":
"not yet determined" }`.

*Note the `"rate": "not measured"` param is deliberate and not filler — this extension is
machine-read, and an absent key reads as "not disclosed" where an explicit `"not measured"` reads
as the claim it is.*

**(c) api-docs (`page.tsx`) — Trust record paragraph**, appended to the existing does-not-attest
inline list: `verdict determinism — verdicts are draws from a probabilistic extraction; Layer 2 is
deterministic and reproducible from the extraction, Layer 1 is sampled, so the same text can
examine differently; measured on one input (9 of 10 proceed, one block), rate not yet measured`.

---

## §7 — the guardrail R10 contract (prompt §C.5) — **ELECTED: YES, FULL TEXT INCLUDING THE ADVISORY SENTENCE**

**Recommendation: YES — include it, and it is the single strongest case in the package.**

The gate's own published contract currently reads (llms.txt Guardrail section, and the
`guardrail-signed-sandwich/v1` extension, both live):

> "The verdict is computed **deterministically** from `extraction`..."
> "...the floor is folded into the **signed** proximity, so a justice-floored verdict is **fully
> reproducible from the signed assessment**."

Both sentences are **true and must not be changed** — they scope reproducibility to *from the
extraction*. But this is the surface where the variance **physically originates**, it is where the
word "deterministically" appears in bold, and a recipient reading only the gate's contract would
take away that re-submitting the same action re-produces the same verdict. That is exactly the
inference the c11 data refutes, on this exact endpoint. Leaving it out would mean the disclosure
appears everywhere except the one place it was measured.

**Proposed addition** (llms.txt Guardrail section, immediately after the "fully reproducible from
the signed assessment" sentence, and mirrored in the extension description — the existing sentences
untouched):

> **What "deterministic" scopes to.** The determinism above is Layer 2's: given an `extraction`, the
> verdict is a pure function of it and is reproducible by re-running the mechanisms. It is **not** a
> claim that the same `action` text re-submitted produces the same `extraction`, and therefore not a
> claim that it produces the same verdict. Layer 1 is a sampled model output. Ten identical
> submissions of one action to this endpoint on 2026-08-29 returned nine `proceed` and one
> non-`proceed`, the entire two-rank difference arising from how a single grave-act indicator's
> causal stage was assigned. The rate of such divergence has not been measured and none is claimed
> here; a measurement is scheduled. If a verdict is consequential to you, treat one call as one
> draw — re-submitting is a legitimate way to see whether the reading is stable.

*The last sentence is the one clause here that is advice rather than disclosure. It is included
because it is the practical form of the ruling's calibration purpose and costs the reader nothing;
it is flagged separately so the founder can strike it without touching the disclosure.*

---

## §8 — OPTIONAL FOURTH SURFACE (beyond the ruling's five) — **ELECTED: TAKE IT**

**llms.txt "Epistemic status of engine outputs"** — the published map of provenance/credence. Two
places in it are a near-miss of this exact class:

1. Class **(b)** covers *"Layer-1 classifications (passions, oikeiosis circles, kathekon factors,
   **urgency indicators**, orientation observations) — provenance: inference, observation-anchored."*
   `urgency_indicators` is the **precise field that varied** in c11. A reader consulting the map to
   calibrate that field learns its provenance and learns nothing about its run-to-run stability.
2. The section's standing constraint reads: *"The Ed25519 signature attests the deterministic
   computation's reproducibility from the extraction; it does not attest the extraction's **truth**."*
   Truth and **stability** are different properties, and only the first is disclosed.
3. The section closes with *"Three disclosed routes where confidence can exceed basis, none closed
   by this map"* — all three are input-side (an argued `met`, a lying `examined_before_acting`, an
   omitted harm). **Variance is a fourth route and the only one that is not about the input at
   all.**

**Proposed** (a fourth numbered route in that list): *"Fourth: the extraction itself is not stable
across occasions. The same text examined twice can produce different Layer-1 classifications and
therefore a different verdict — a two-rank swing was measured on one input in ten runs
(2026-08-29). This is not a defect in any rule; the deterministic layer faithfully computes what it
is given, and what it is given varies. Its rate is unmeasured."*

**Why it is offered rather than assumed:** it is outside the five surfaces the ruling names, and
PR1's discipline is not to widen scope on my own judgement. **My recommendation is to take it** —
it is the same document as (a), one paragraph, and the map explicitly enumerates
confidence-exceeds-basis routes, so an unlisted fourth route is a gap in a list that claims to be
complete.

---

## §9 — WHAT IS **NOT** IN THIS PACKAGE, deliberately

- **Any rate.** Not the c11 1-in-10, not a Wilson interval, not "approximately". Prompt §D.
- **The per-verdict disagreement count** (ruling's layer 2) — needs K-sampling live.
- **Any location for the future rate** — §1.
- **Any behaviour change.** No flag, no gate verdict, no schema, no engine path. The disclosure
  describes the instrument; it does not touch it. Weights-BLOCKED and Q1 unchanged.
- **Any change to the existing "deterministic" / "fully reproducible" sentences** — they are
  accurate as scoped, and the 2026-08-25 append-don't-rewrite discipline (S2-39/S2-40 precedent)
  keeps every existing pin valid.

---

## §10 — SIGN-OFF

The founder signs off, per surface. Nothing is applied until then.

| # | Item | Founder's election, 2026-08-30 |
|---|---|---|
| §1 | The watching-table location question | **PUT TO THE MENTOR → ANSWERED 2026-08-30.** The executing session's reading confirmed correct; *"that wording stands"*; DQ-2 open. Two new obligations created — see §1 |
| §3 | The `does_not_attest` entry wording | **SIGNED as drafted; mentor-confirmed unchanged.** Blocked only on PR19 |
| §4 | The ADR-013 §8 amendment | **SIGNED as drafted.** Blocked only on PR19 |
| §5 | The three battery pins | **SIGNED as drafted.** Blocked only on PR19 |
| §6 | The three R18 public surfaces | **SIGNED as drafted; mentor-confirmed unchanged.** Blocked only on PR19 |
| §7 | The guardrail R10 addition | **ELECTED IN FULL**, advisory sentence retained. Blocked only on PR19 |
| §8 | The optional epistemic-status-map route | **ELECTED — take it.** Blocked only on PR19 |

---

## §11 — FIRST-HAND REVIEW OF THIS PACKAGE'S OWN WORDING, and the PR19 obligation

**PR19 status, stated plainly rather than assumed discharged.** The prompt requires an independent
adversarial review before the wording is treated as final, and warns that *"this obligation has been
missed once already in this arc."* **It has NOT been run.** This session was operating under a
standing instruction not to spawn subagents or workflows, which is the mechanism this project's
PR19 reviews use. **Because nothing is applied, the gate has not been crossed** — but the review is
**owed before any of this wording reaches a surface**, and it is a hard pre-condition on the
successor session, not a recommendation. It should review the wording *as held*, and should be told
that the author's own pass below already ran, so it looks for what that pass missed rather than
repeating it.

**The author's own claims-vs-source pass, run over §3/§4/§6/§7. Every factual claim in the proposed
wording was re-checked against the c11 record and the codebase; the checks are tabulated in §2.
Two findings, both raised rather than silently fixed** (the founder signed the exact text; changing
it quietly would defeat the sign-off):

**F-1 (wording precision, recommend adopting at re-sign).** §3 and §6(a) say *"An instrument to
measure it is scheduled."* **"Scheduled" is stronger than the facts support.** D6a's build prompt is
authored and sequenced behind this disclosure, but it has no date, and it remains a founder
election — three of R8's follow-on elections are open and unelected on record. A reader takes
"scheduled" to mean committed-and-dated. **Proposed replacement:** *"An instrument to measure it has
been designed and is queued."* This is the same defect class the ruling itself corrects — a
statement whose confidence exceeds its basis — appearing inside the correction, which is why it is
flagged rather than left.

**F-2 (recorded as accepted, no change proposed).** §3 says the extractor *"placed the same
indicator in four different states"*, where one of the four is the indicator being **absent
entirely** rather than being in a state. This is loose read literally. It is retained because it is
the c11 record's own framing verbatim (*"assigned the same indicator to four different states —
absent … phantasia … synkatathesis … praxis"*), and departing from the evidence record's wording in
a public claim about that record would be worse than the looseness. Noted so a later reader does
not mistake it for an unexamined slip.

**One stale fact in the governing prompt, corrected here** (PR20's timestamp discipline, and the
same class the prompt itself warns about): the prompt states the S10 battery is *"106/0 at last
record."* **The live baseline is 140 passed, 0 failed**, run this session. Any successor sizing its
pin work against 106 would be working from a stale number.

*End of package. Documents only — nothing applied.*
