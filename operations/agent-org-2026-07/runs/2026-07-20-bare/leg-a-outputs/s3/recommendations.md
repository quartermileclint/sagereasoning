# Recommendations — For Whoever Next Relies on This Inventory

Prepared 2026-07-20, alongside `updated-inventory.md` and `findings-memo.md`.

## Do these differently now vs. six weeks ago

1. **Never state "trust layer live" without "measurement-only, non-enforcing" in the same breath.** This is the single highest-risk phrase in the whole update if quoted out of context (investor deck, partner one-pager, new-hire briefing). It computes and records; it does not currently gate or block anything.

2. **Stop citing the 2026-06-11 value-demonstration exercise.** It ran on an old build and returned an inconclusive/negative result. A fresh exercise on the current build is in progress and explicitly supersedes it. Until that concludes, do not make an affirmative "this helps users" claim beyond the single 2026-06-10 founder anecdote — and even that anecdote predates the engine changes described in this update, so don't extend it to describe the current build.

3. **Do not describe the project as "launched" or "launch-ready."** The go-live checklist closing is a real, positive signal about operational readiness (observability, data-rights UI). It is not the launch decision. The founder has explicitly not made that call, and it's gated on a broader review still underway. Any summary that blurs "checklist closed" into "ready to launch" or "launched" is factually wrong.

4. **Describe the corroboration check narrowly.** "Catches contradicted self-reports" is accurate. "Prevents agents from gaming their scores" is not — the project itself discloses the omission gap as structural and unresolved.

5. **Include the credential-exposure incident in any security/trust narrative, don't hide it.** It's a stronger story told honestly (found, contained, audited clean, root-caused) than it would be if surfaced later by someone else. Don't let a well-intentioned instinct to "keep the deck clean" cause an omission that later reads as concealment.

6. **Treat four carried-forward items as unresolved, not resolved, absent explicit confirmation:** legal wording finalization, the substrate-rollout-to-human-tools migration, npm vulnerability remediation, and the component-registry staleness reconcile. None of these appear in the six-week status log. Silence there is not evidence they were fixed — six weeks of shipping elsewhere makes it just as likely the registry, in particular, is now more stale than before.

## Judgement calls that need a decision-maker's sign-off, not a document author's assumption

These are the places where I (or anyone else preparing a summary from this inventory) should not simply state a conclusion as fact — a decision-maker needs to weigh in:

- **Whether "measurement-only" trust-layer data is safe to reference in any external claim about agent trustworthiness.** Even accurately caveated, referencing unenforced measurement data in an investor or partner conversation could be read as more assurance than it provides. Whether to reference it at all — not just how to caveat it — is a positioning call, not a factual one.

- **Whether the current product, absent the fresh value-demonstration exercise's result, should be described to a partner or investor as "helping users" at all**, versus "in active internal validation." I've defaulted to the more conservative framing throughout the updated inventory and findings memo; a decision-maker may have a different risk tolerance here, and the exercise result itself (once available) should override my framing regardless.

- **Whether the still-open substrate-rollout question (human tools potentially still on older prose-based reasoning paths, separate from the deterministic engine improvements) is disclosed to any external audience before it's resolved.** This affects how honestly the "justice-weighting fix" and "corroboration check" claims can be extended to the human-practitioner product experience specifically, as opposed to the agent-developer API surface. I've flagged it as unconfirmed rather than asserting either way — someone with direct access to the engineering team should close this gap before it's used in messaging.

- **Whether the trust layer's disclosed lower-assurance review path (manual inspection substituting for automated multi-agent review on some sessions, due to a spend cap) is material enough to disclose to a technical due-diligence audience.** I've treated it as worth stating plainly; a decision-maker with more context on how the two review methods compare in practice may reasonably conclude it's immaterial, or conversely that it should be remediated (re-reviewed) before external claims are made about the trust layer's correctness.

- **Whether the four "status unclear" carried-forward gaps (legal wording, substrate rollout, npm vulnerabilities, registry staleness) should block any external-facing use of this inventory until re-confirmed**, or whether it's acceptable to publish with those caveats attached. I've defaulted to flagging rather than blocking, since the task was to update the inventory, not gate its use — but a decision-maker closer to the launch timeline may want them closed first.

## Bottom line

The project has real, positive, and reviewable progress since the original inventory: a materially improved reasoning engine, a new (if unenforced) trust layer, a handled security incident, and new product surface. None of that changes the fact that the launch decision is open and gated on evidence not yet in hand. The single biggest failure mode for whoever uses this next would be compressing six weeks of genuine progress into a "ready to go" summary that the founder's own stated position does not yet support.
