# Findings Memo — What Changed Since the 2026-06-10 Inventory, and Why It Matters

Prepared 2026-07-20. Covers 2026-06-10 through 2026-07-20.

This document explains what each change means for how the project should be described, positioned, or relied upon going forward — not merely that it shipped.

## 1. Engine justice-weighting and gate consolidation

Three changes landed in sequence: native justice-weighting in the core proximity engine (6/25), retirement of a now-redundant LLM-based justice check on the safety-gate endpoint (6/26), and a deterministic corroboration check on both endpoints (7/8). Together these close a known scoring blind spot (a calmly-reasoned decision that neglected an affected third party could previously score as highly virtuous) and consolidate justice-checking into one deterministic path instead of two.

This is a separate issue from the substrate-rollout question the original inventory raised (whether human-facing tools call the deterministic engine at all, versus older prose-based paths). The update log does not address that migration. Do not treat the justice-weighting fix as evidence the migration happened — it is orthogonal and still unconfirmed.

## 2. The trust layer — live, but measurement-only, and the framing risk is real

A full trust layer (server-side trust core, a real installable reference-integration plugin, a public read-only trust-record endpoint, and a four-layer discernment protocol for agent-to-agent delegation) was built over roughly 20 sessions and is now live. Critically, it runs in measurement mode only: nothing it computes currently blocks or overrides a decision. Enforcement mode exists only as an unscheduled, founder-gated future step.

This is the highest-risk framing item in the whole update. "Trust layer is live" without the "measurement-only, non-enforcing" qualifier will read to most audiences as "the system now enforces trust," which is false. Any external summary must carry both halves of that sentence together.

Separately: the build required a correction after an external review caught a conceptual error (self-interest alone was wrongly treated as satisfying a justice check). This should be described as "built and corrected under review," which is a point in favor of the review process, not a black mark.

## 3. Corroboration check has a disclosed, structural gap

The check catches an agent that lies about having done something, cross-referencing self-reported claims against submitted text. It does not catch an agent whose self-report simply omits a harm rather than misstating one — a structural limitation the project discloses openly rather than treating as a near-term fix. Describe this capability narrowly ("catches contradicted self-reports") rather than broadly ("prevents gaming").

## 4. Some trust-layer review work used a weaker verification method than usual

Part of the trust-layer review fell back to manual code inspection because the automated multi-agent review harness hit the project's monthly AI-spend cap mid-session. This is disclosed in the project's own records, not hidden, but it means confidence in some trust-layer correctness claims should be held slightly lower than for fully-reviewed components elsewhere.

## 5. A credential-exposure incident occurred and was handled cleanly — include it, don't omit it

On 2026-07-17 a local config backup containing two live API credentials was found to have been committed to the public repo roughly 5.5 days earlier. Both credentials were revoked immediately, reissued, and a full audit of billing/usage across the exposure window found no evidence of abuse; the ignore-rules were fixed. This should be included in any external narrative as evidence the incident-response process works — omitting it in favor of a sanitized narrative would be the more misleading choice.

## 6. Seven new human-facing exercise pages shipped, deliberately isolated from the trust-layer work

Each page is self-contained with its own database table, and each was checked before shipping to confirm it shares no code path with the concurrent trust-layer measurement work. Low-risk, genuine surface-area growth for the individual-user audience.

## 7. Go-live checklist closed; launch decision is explicitly still open — this is the most important correction to the original inventory's framing

The original inventory was structured around a "Pre-Launch" readiness criterion and read as launch-imminent. As of 2026-07-20 a go-live readiness checklist (observability, data-rights UI, related items) has been closed out, but the founder has explicitly not made the final launch call, which is gated on a broader review still in progress — including a fresh value-demonstration exercise. An unedited carry-forward of the original inventory's framing would now overstate launch-readiness. This must be corrected in any downstream use of this document.

## 8. The prior value-demonstration exercise is superseded — do not cite the old result

The 2026-06-11 exercise returned an inconclusive/negative result on an older build and is being re-run now on the current build specifically because that result doesn't reflect the current system. Until the new exercise concludes, there is no current affirmative evidence that the full product, used end-to-end, demonstrably helps end users. The founder's single 2026-06-10 decision run is anecdotal and predates every engine change above.

## 9. What has not changed

Billing/Stripe remains unconnected to a live payment processor, with no firm timeline — unchanged and deliberate. No new audience segment, pricing tier, or contractual commitment exists.

## 10. Items the status log is silent on

The log does not address: legal wording finalization, the substrate-rollout-to-human-tools migration, npm vulnerability remediation, or the registry staleness reconcile — all flagged as significant gaps six weeks ago. Silence is not evidence of resolution; carry these forward as open pending explicit re-check.
