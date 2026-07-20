# Updated Capability Inventory — as of 2026-07-20

**Supersedes:** the 2026-06-10 inventory. Same structure, updated to current verified state.

## 1. Engine / scoring

- The core reasoning engine's proximity scoring now natively weights justice (live 2026-06-25). A calmly-reasoned decision that neglects an affected third party's claim can no longer score as highly virtuous — this closes a real, previously-known scoring gap. Documentation updated publicly.
- The safety-gate endpoint's secondary LLM justice-check was retired (2026-06-26) once the engine-level fix made it redundant — verified via an equivalence test suite before retirement, no loss of safety coverage.
- A deterministic "corroboration check" (live 2026-07-08, both the main reasoning endpoint and the safety gate) cross-references an agent's self-reported claims against the submitted text and downgrades the score when a claim isn't supported. **Scope, stated precisely:** this closes the class where an agent *lies* about having done something (e.g., "I checked X" when the text shows no such check). It does **not** close the class where an agent's self-report simply *omits* a harm rather than lying about it — that structural gap remains open and is disclosed as such in the project's own documentation.

## 2. Trust layer (built June 25 – July 19, ~20 sessions)

A trust layer now exists: a server-side trust core tracking per-agent, per-virtue-domain trust levels over time from verified evidence; a reference integration harness (a real developer-usable plugin); a public read-only endpoint for looking up an agent's accumulated trust record; and a four-layer discernment protocol for agent-to-agent delegation.

**Status, precisely: this runs in measurement mode only.** Nothing it currently computes blocks or overrides any decision. An enforcement mode is designed but not activated — activation is explicitly gated on the founder reviewing accumulated live measurement data, and is not yet scheduled. Any description of this system as currently enforcing, blocking, or overriding decisions is inaccurate as of this writing.

**Process note (a positive signal, not a defect):** a binding external review caught and required correction of an early defect mid-build — an early version wrongly counted "the agent considered its own self-interest" as satisfying a justice-related check (self-interest alone isn't a justice consideration; justice requires weighing someone else's claim). This was fixed and independently re-verified. This is evidence the project's review process catches real defects, not evidence of an unfixed bug in the shipped system.

**Verification-method disclosure:** the trust layer's own automated multi-agent review harness hit the project's monthly AI-spend cap during several build sessions, so some review work was completed via direct manual code inspection instead. This is disclosed in the project's own records as a known limitation on how some of the work was verified — not hidden, and not evidence the work is unverified, only that part of it was verified by a different (slower, human) method than the automated one.

## 3. Incident (disclosed, resolved)

On 2026-07-17, a credential-exposure incident was found and handled: a local config backup containing two live API credentials had been accidentally committed to the public repo roughly 5.5 days earlier. Both credentials were revoked on discovery; a full audit of billing/usage across the exposure window found no evidence of abuse; the repo's ignore-rules were updated to prevent recurrence.

## 4. Human-facing product surfaces

Seven new self-guided exercise pages for individual (non-developer) users shipped 2026-07-13 through 2026-07-16. Each is a self-contained page with its own database table. **Each was built and checked, before shipping, to prove it shares no code path with the parts of the system the trust layer is measuring** — i.e., these ship without contaminating the concurrent measurement work. This is a deliberate isolation guarantee, not merely "seven new features."

## 5. Go-live status

A go-live readiness checklist (observability, data-rights UI, related items) closed out on 2026-07-20, all items marked verified-live. **The founder's final launch decision has not been made.** It remains explicitly open, gated on a broader review still in progress — including a fresh value-demonstration exercise (whether the product's full workflow actually helps end users, on the current build), which supersedes an earlier, inconclusive/negative such exercise run 2026-06-11 on an older build. Nothing in this inventory should be read as "the project has launched" or as a signal that launch is imminent-and-certain.

## 6. Unchanged

- Billing/payment is still not connected to a live payment processor. Deliberate, no firm timeline.
- No new audience segment, pricing tier, or contractual commitment added since 2026-06-10.
