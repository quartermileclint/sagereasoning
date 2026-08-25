# The signal-quality gap — scope

**Date:** 2026-08-25 · **Tier:** `governance`, scope + design proposal. **No build.** **AC7 not engaged.**
**Predecessor:** `operations/reflections-examination-2026-08/2026-08-25-mentor-ruling-iw7-three-openings-verbatim.md`
— the mentor held opening 2 and gated opening 3 phase two on exactly this question: *"the trigger must
distinguish a genuine adverse verdict from a sparse-extraction default. The honest answer may be that
this distinction is not currently derivable from the consult's output … If that is true, opening 2
cannot be armed until the consult's output carries that signal, or until the hook has an independent
basis for filtering sparse-extraction defaults."*

**Status: a scope, not a ruling, and not a build.** This document answers the mentor's own conditional
— it is derivable, partially, from data the consult's output already carries — and names precisely
where the remaining honest gap is, rather than closing the question outright.

**[RULED 2026-08-25.]** The heuristic is confirmed as real and correctly characterised (*"a confidence
proxy, not a discriminant"*). **Opening 2 stays HELD** — not primarily on the residual false-negative
risk, but because a proxy at opening 2's firing rate is *"a rate-limiter on false positives that still
passes false positives through,"* which the condition named in the prior ruling (a genuine second-pass
check on the kathekon dimension, or a new wire field) requires and this proxy does not supply.
**Opening 3 phase two is UNBLOCKED**, because it uses the same proxy at a fixed, once-per-session
frequency to vary content rather than to gate a firing — with a design constraint: the content
variation must carry the confidence level explicitly and disclose, plainly, when a high-confidence
reading is what's driving the content. Verbatim:
`operations/reflections-examination-2026-08/2026-08-25-mentor-ruling-signal-quality-gap-verbatim.md`.

---

## §0 — Mechanism facts, verified first-hand this session (PR20)

**The sparse-extraction default is a fully deterministic function of one count, and it is already on
the wire.** Read directly: `website/src/lib/translation-sandwich/layer2-mechanisms.ts:1255-1303`.

```
satisfiedCount = (natural_relationship engaged ? 1 : 0)
               + (role_obligation engaged ? 1 : 0)
               + (justification_offered ? 1 : 0)
quality = { 0: 'contrary', 1: 'marginal', 2: 'moderate', 3: 'strong' }[satisfiedCount]
is_kathekon = { contrary: false, marginal: null, moderate: true, strong: true }[quality]
```

**`quality === 'contrary'` (equivalently `satisfiedCount === 0`) is the EXACT and ONLY condition**
under which the engine emits the mentor-ruled, test-pinned justification string — *"No kathekon
factors were extracted from the submitted text; on that basis, the engine reads the action as
contrary to appropriate action."* (EE-C1, ruled 2026-08-23, locked byte-for-byte by
`website/src/lib/translation-sandwich/__tests__/ee-c1-kathekon-justification-wording.test.ts` §B,
which asserts the live engine's output matches the mentor's own ruled record verbatim.) This session's
own opening frame carried exactly this reading.

**The harness already reads both fields that identify this case.** `framing-core.mjs:622-624`
(`fetchFrame`'s verdict parsing) already extracts `isKathekon`, `kathekonQuality`, **and the full
`extraction` object** — confirmed by reading `website/src/lib/translation-sandwich/parallel-run.ts:949,1107`,
where the server sets `extraction: layer1Schema` — the complete `Layer1Schema` interface
(`layer1-extractor.ts:550`), not a trimmed summary. Its fields, beyond `kathekon_factors`:
`passions_present`, `control_filter_elements`, `oikeiosis_circles_engaged`,
`value_categories_at_stake`, `urgency_indicators`, `causal_stage_evidence` — all independently
populated or empty arrays.

**So detecting "kathekon read as contrary" is not the gap.** The hook can check
`kathekonQuality === 'contrary'` (or, equivalently, string-match the pinned justification) with zero
server change, right now. That is exactly the unqualified signal this session's own drafting
mistake would have armed on — and the mentor correctly held it, because detecting *that* condition
answers a different question than the one that matters.

---

## §1 — The actual gap, restated precisely

**`quality === 'contrary'` cannot distinguish two different underlying situations that produce the
identical wire output:**

1. **Genuinely nothing kathekon-relevant is in the text.** A governance-only, documents-editing
   session with no third party affected — this session's own opening frame, honestly. The extraction
   is *correct*; there is nothing to find.
2. **The extractor missed something real.** A genuine kathekon factor was present in the action but
   the Layer-1 pass did not surface it — a false negative, indistinguishable on the wire from case 1.

**Neither the `kathekon_quality` field nor its justification string carries any information that
resolves which of these occurred.** This is the mentor's stated concern exactly, and no amount of
re-reading the *kathekon* fields alone closes it — there is genuinely no further signal on that axis.

---

## §2 — A derivable cross-check, proposed (not a certainty)

**What IS derivable, without a server change, is a proxy for extraction richness OUTSIDE the kathekon
dimension** — a heuristic, not a guarantee, and named as exactly that.

**Proposal:** when `kathekon_quality === 'contrary'`, additionally check whether the *other* Layer-1
arrays in the same `extraction` object are also empty:

- **All empty** (`passions_present`, `oikeiosis_circles_engaged`, `value_categories_at_stake`,
  `causal_stage_evidence` all length 0) → **low confidence the null is genuine.** The extraction found
  nothing anywhere, which is more consistent with a general extraction failure (a thin input, an
  extraction-regime issue, a Layer-1 pass that didn't engage) than with a specifically-examined,
  specifically-empty kathekon reading.
- **Some populated** → **higher confidence the null is genuine.** The extractor engaged substantively
  with the text elsewhere and specifically found nothing kathekon-relevant — closer to case 1 in §1
  than case 2.

**What this heuristic does NOT resolve, stated honestly rather than smoothed over:** a rich extraction
elsewhere does not *prove* the kathekon dimension specifically was examined correctly — a genuinely
missed kathekon factor could coexist with a well-populated extraction on every other axis. This
narrows the false-negative risk; it does not eliminate it. **It converts an unqualified binary signal
into a graded confidence read, not into a certainty.**

**Cost:** zero server change, zero new wire fields, zero new endpoint. The hook already receives every
field this check needs. It is a pure client-side (harness-side) logic addition, reading data already
in hand.

---

## §3 — What this unblocked, ruled [updated 2026-08-25]

**Opening 2 — stays HELD.** The mentor's reasoning turns on what opening 2 *does* with the proxy, not
only on the proxy's own residual error rate: at opening 2's firing rate (every distinct adverse-verdict
decision), a confidence proxy is *"a rate-limiter on false positives that still passes false positives
through."* The condition the prior ruling actually named — a genuine second-pass check on the kathekon
dimension itself, or a new structured wire field — is not satisfied by a proxy derived from *adjacent*
dimensions. **Held pending one of those two, not this document.**

**Opening 3 phase two — UNBLOCKED, with a design constraint.** Because opening 3 fires once per session
regardless of what the proxy returns, the proxy's role there is to vary *content*, not to *gate a
firing* — a materially different use of the identical signal. Ruled acceptable at that frequency,
**on the condition that the content variation carries the confidence level explicitly**: a
high-confidence adverse verdict (contrary + rich extraction elsewhere) gets session-specific content
naming the kathekon dimension, disclosed plainly as such; a low-confidence one (contrary + extraction
empty elsewhere too) gets generic content or none. The disclosure must tell the practitioner the
difference between *"the instrument found something worth reflecting on"* and *"the instrument thinks
it found something but cannot be certain."*

---

## §4 — What this scope asked for, and the answer received (PR20)

**Original question:** is a confidence-graded richness proxy an acceptable basis for arming opening 2
or opening 3 phase two? **Answer: differently for each**, per §3 — opening 2 no (the proxy is the
wrong kind of signal for a gating use at that frequency); opening 3 phase two yes, conditioned on
disclosing the confidence level in the content itself rather than absorbing it silently.

---

## §5 — Limits of this document

- **The cross-check in §2 is a proposal verified against the type definitions and the response
  builder, not tested against real session data.** Whether "some other array populated" actually
  correlates with genuine-vs-sparse in practice (as opposed to just in the schema's logical
  possibility space) is an empirical question this document does not answer.
- **No code was written.** `layer2-mechanisms.ts`, `layer1-extractor.ts`, `parallel-run.ts`, and
  `framing-core.mjs` were read, not edited.
- **Not independently reviewed.** PR19 does not engage a governance scoping session.
- **This document does not resolve whether a heuristic proxy is the right STANDARD for arming a
  trigger**, only what is technically derivable. That standard-setting question is named in §4 for
  the mentor, not decided here.
