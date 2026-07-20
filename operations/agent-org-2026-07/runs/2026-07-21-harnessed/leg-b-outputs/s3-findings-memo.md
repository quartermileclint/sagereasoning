# Findings Memo — What Changed Since 2026-06-10, and Why It Matters

## What changed

1. **The engine got more honest about justice.** The old scoring gap (a calm, competent decision that ignored an affected third party could still score as near-virtuous) is closed at the engine level, live in production, not just documented as a known limitation. This matters because it was previously a real gap between what the system claimed to measure and what it actually measured.

2. **A safety-relevant LLM call was retired — correctly, not as a cost-cut.** The gate's secondary justice-check call was redundant once the engine fix above landed, and its removal was verified via an equivalence test suite first. Framing this as "the gate got cheaper" without the fidelity context would be misleading; the framing that matters is "the gate's safety coverage didn't degrade, and it's simpler now."

3. **A new corroboration check landed — with a disclosed, deliberate scope limit.** It catches lying self-reports, not omitted ones. This is worth stating precisely because a reader could easily round it up to "the system now catches agents hiding things," which overstates what shipped.

4. **A large new subsystem (the trust layer) exists and is significant — but it does nothing yet, by design.** This is the single biggest thing that changed since June 10, and it is also the item most at risk of being mis-described. It is measurement infrastructure, not an enforcement mechanism. Calling it "the safety system that now catches bad agent behavior" would be actively wrong, not merely imprecise — it doesn't catch or block anything currently; it only records for a future decision the founder hasn't made yet.

5. **A process-integrity signal, not a defect report.** The mid-arc mentor-flagged correction (self-interest ≠ justice) is worth surfacing to a reader precisely because it demonstrates the project has a working external-review discipline that catches real conceptual errors before they ship — the opposite of what it would look like if this were buried or read as "there's a known bug."

6. **A disclosed verification-method gap exists and should stay disclosed.** Hitting the spend cap and falling back to manual review for part of the trust-layer work is a real limitation on how thoroughly that portion was checked. It doesn't invalidate the work, but a reader relying on this inventory to represent "how rigorously was this verified" should know not every session got the full automated multi-agent treatment.

7. **The credential-exposure incident is a clean incident report, not a live risk.** Found, revoked, audited (no abuse found), and structurally prevented from recurring. Worth including for completeness and because it's evidence of how the project handles incidents, not because it's an open issue.

8. **Seven new human-facing pages shipped with a real isolation guarantee, not just volume.** The fact that they were checked to share no code path with what's being measured is the material fact — without it, a reader might reasonably worry that a burst of shipping activity during a measurement window contaminated the measurement. It didn't, and that was verified, not assumed.

9. **The launch decision itself has not moved.** This is the item most likely to be gotten wrong if this memo is read quickly: nothing above constitutes a launch, and nothing above should be cited as grounds to expect one imminently. A 2026-06-11 negative/inconclusive value-demonstration result is explicitly being superseded by a fresh exercise — the old result should not be cited going forward as still-current, but its replacement hasn't concluded either.

## What would be actively misleading if left uncorrected in the original inventory

The original inventory (2026-06-10) predates all of the above, so nothing in it is *wrong* about that date — but if it's the document someone hands to an investor or new hire today without this memo attached, its silence on measurement-vs-enforcement, on the trust layer's existence, and on the still-open launch decision would let a reader draw exactly the wrong conclusions (that the system's safety posture is unchanged, and/or that a launch call has been made). The recommendation set below addresses this directly.
