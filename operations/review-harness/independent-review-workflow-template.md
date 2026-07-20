# Independent Review Workflow Template

**Status:** Adopted 2026-07-21 under `D-PR19-ADOPTED-INDEPENDENT-REVIEW-REQUIRED-2026-07-21` (P3, the Agent-Organization + Evidence Program build plan §3-P3).
**Governs:** how to launch the independent adversarial review PR19 requires. Not a governance document itself — a working template for the `Workflow` tool invocation (or an equivalent fresh-agent fan-out) that satisfies PR19's independence requirement.
**Seeded from:** three 2026-07-19 runs that each caught real, previously-invisible defects — two code reviews (`wf_95e8d22f-7a8`, the kathekon self-circle-narrowing re-review; `wf_05daaca5-c3d`, the AE-2 loop-fold re-review) and one document review (`wf_e55e52e4-d7c`, this program's own build-plan critique).

---

## 1. The one rule that makes a review "independent"

**The reviewing Workflow receives the artifact itself (the diff, the code, the document) — never the first review's conclusions, summary, or "here's what we think is fine."**

This is the entire mechanism. A review launched with "please double-check this build, which our first-hand pass called clean" is not independent — it anchors on the prior verdict and inherits its blind spots. All three grounding runs were launched as fresh prompts describing the artifact from scratch, with their own dimension breakdown and their own per-finding adversarial refuters. That is what caught:
- a HIGH double-counting defect the self-circle-narrowing session's own docstring had warned against, one file away from where it was violated;
- 7 confirmed defects in the AE-2 fold, including a genuine spec-infidelity (calibration-class elements folded into domain levels despite the spec's own plain-text guard) the first-hand pass had called clean;
- 23 confirmed findings (0 refuted) in this program's own build plan, including 3 high-severity items — one of which (the unattended-activation gate) became the single most consequential addition to the whole plan.

If you are tempted to save tokens by summarizing "what we already checked" into the reviewing prompt: don't. That summary is exactly the blind spot the review exists to catch.

## 2. Shape: dimension-based fan-out

Each grounding run split the artifact into named, largely-independent dimensions and ran one (or more) agents per dimension, then adjudicated findings against per-finding adversarial refuters. Concrete precedent shapes:

- **Code review (loop-fold AE-2 re-review, `wf_05daaca5-c3d`):** 6 dimensions — kathekon-split, combiner-wiring, envelope-scope, measure-purity-write-safety, honesty-claims, test-adequacy. 14 agents total including per-finding refuters.
- **Code review (self-circle-narrowing re-review, `wf_95e8d22f-7a8`):** 20 agents auditing the identical diff, explicitly instructed not to trust the first-hand "CLEAN" claims. Three independent finder dimensions converged on the same HIGH defect from different angles — a useful cross-check signal in itself (convergence from unrelated angles raises confidence the finding is real, not a single dimension's artifact).
- **Document review (build-plan critique, `wf_e55e52e4-d7c`):** 4 dimensions — sequencing, tiering, accuracy, proactive-safety. Use this shape for governance/planning documents, not just code: a build plan or process-rule amendment has "dimensions" too (does the sequence hold together; are risk tiers assigned correctly; is the factual grounding accurate; does it introduce a safety/proactive-scope gap).

Pick dimensions that partition the artifact's actual failure surface — not a generic template. A predicate/engine change's dimensions differ from a plan's; think about where THIS artifact could be wrong before naming the fan-out.

## 3. Adjudication discipline

- Every raised finding gets a verdict: **CONFIRMED**, **REFUTED**, or (if account limits force it) folded first-hand per §4 below.
- A REFUTED finding is not automatically discarded — if the underlying concern is cheap to close as defense-in-depth (as with the AE-2 re-review's refuted-but-hardened try/catch finding), fold it anyway while being honest that it was refuted, not confirmed.
- State the confirmed/refuted count explicitly in the record (e.g. "8 findings raised, 7 CONFIRMED, 1 REFUTED, 0 unresolved"). A review that doesn't report its own refutation rate reads as unfalsifiable.
- Fix confirmed findings **at the root**, not by re-disclosing the same gap more loudly. The AE-2 re-review's headline finding is instructive: a prior session had already "fixed" the calibration-laundering issue by widening a disclosure comment — the independent re-review caught that the disclosure didn't match what the code actually did, and the real fix was to gate the code, not reword the note.
- After fixing, re-run the full regression battery (not just the new fixture) and report the before/after count (e.g. "104/0 → 132/0").

## 4. The spend-limit fallback (PR19-codified)

Account spend/session limits killing a Workflow mid-run is a recurring, disclosed operational reality in this project (cited across multiple 2026-07 entries as "the account's monthly spend limit"). When it happens:

1. **Complete the review first-hand** across every dead dimension — read the code/document directly, reason through each dimension's failure surface by hand, and record findings the same way an agent-driven pass would.
2. **Disclose the single-perspective limitation explicitly** in the session's close/decision-log entry — do not silently present a first-hand pass as equivalent to an independently-launched one.
3. **Treat the independent re-run as REQUIRED, not merely recommended**, before:
   - any Critical 0c-ii live-op activation (flag flip, mint, deploy) that depends on the artifact's correctness, or
   - a governance document's Adopted status being treated as final for an irreversible downstream commitment.

   The requirement does not block the current session's close — record it as a named, carried follow-up — but it does gate whatever comes next that leans on the artifact being genuinely sound. This is stricter than the prior informal practice ("an independent re-run CAN follow the limit reset"), because two of the three grounding instances found real defects specifically on that later re-run.
4. **When the limit resets, launch the fresh Workflow per §1** — not a "second look" at the first-hand notes, a genuinely independent fan-out against the artifact itself.

## 5. Named implementation pitfall: index-alignment in post-processing

**Never key downstream aggregation off an array's POSITION once any upstream `filter`/error-drop could have changed which branch sits at which index.**

Concrete failure mode, from this program's own build-plan critique (`wf_e55e52e4-d7c`): the review launched 4 dimensions (sequencing, tiering, accuracy, proactive-safety). The accuracy dimension hit the account spend limit and errored out mid-run. The post-processing code applied `results.filter(Boolean)` to drop the null/errored entry, **then** used a positional `flatMap` keyed to the original dimension-order array to attribute each surviving result's findings back to its dimension name. Because the filter had shifted every subsequent index down by one, the proactive-safety dimension's 7 findings were mislabeled as belonging to the (dead) accuracy dimension.

**Caught during adjudication** by re-checking each finding's actual content against what it claimed to be about, not by trusting the label. **Fix pattern:** tag each result with its dimension identity BEFORE any filtering (e.g. `{dimension: 'proactive-safety', result: ...}` pairs, filter the pairs, then destructure) — never rely on array position surviving a `filter`. This applies to any Workflow script combining `parallel()`/`pipeline()` output with a `.filter(Boolean)` (the standard pattern for handling agent errors) followed by anything that reads position as identity.

## 6. What counts as a genuine finding vs. noise

All three grounding runs found REAL, previously-invisible defects — not busywork, not style nits dressed up as findings. A useful bar, drawn from what these runs actually surfaced:
- A defect a documented discipline (a docstring, a spec's plain-text guard, an ADR clause) explicitly warns against, found violated in the code that discipline was supposed to govern.
- A claim in a disclosure note, comment, or plan section that is provably false against the actual code/logic when live-mutated or traced end-to-end (not merely "could be worded better").
- A structural gap (an unhandled branch, an unenforced dependency ordering, an under-specified gate) that would silently mis-behave under a real input, not a hypothetical adversary.

If a review's findings are all phrasing/formatting suggestions with no behavioral or factual consequence, that is a signal the dimension split didn't target the artifact's real failure surface — reconsider the dimension breakdown (§2) before concluding the artifact is clean.

## 7. Minimal invocation checklist

1. Name the artifact (diff / file set / document) and confirm the reviewing prompt embeds it directly, not a summary of a prior review.
2. Choose dimensions that partition the artifact's actual failure surface (§2) — 3–7 is typical; more for a security-sensitive engine change, fewer for a scoped document.
3. Launch fresh (no shared context with any prior review of the same artifact).
4. Adjudicate every finding to CONFIRMED/REFUTED with reasoning (§3); fold confirmed findings at the root; re-run the regression battery.
5. If the Workflow dies wholesale on a spend/session limit, apply §4 in full — first-hand completion, explicit disclosure, and a REQUIRED (not optional) independent re-run gating whatever activation/adoption step comes next.
6. Before trusting any post-processing code that aggregates per-dimension results, check it against §5's pitfall.
7. Record the confirmed/refuted count and the before/after regression numbers in the decision-log entry, per PR19.

---

*End of template. Update this file when a future independent review surfaces a new reusable pattern or pitfall — it is a living reference, not a frozen artifact.*
