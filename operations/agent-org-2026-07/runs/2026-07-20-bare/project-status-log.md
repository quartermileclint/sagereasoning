# Project Status Log — since 2026-06-10

This is a condensed log of everything material that has shipped or been decided on the project since the original capability inventory (dated 2026-06-10) was written. Use it, alongside the original inventory, to produce the three deliverables described in the task brief.

## Engine / scoring changes

- **2026-06-25:** The core reasoning engine's proximity scoring now natively weights justice (previously, a calmly-reasoned decision that neglected an affected third party could score as highly virtuous — this was a known scoring gap; it is now closed at the engine level, live in production, with a public documentation update).
- **2026-06-26:** A previously-necessary secondary LLM call used to catch injustice cases in the safety-gate endpoint was retired, because the engine-level fix above made it redundant — the gate is now fully covered by the deterministic engine, with no loss of safety coverage (verified via an equivalence test suite before the retirement shipped).
- **2026-07-08:** A new deterministic "corroboration check" shipped and went live on both the main reasoning endpoint and the safety-gate endpoint. It cross-references an agent's self-reported claims (e.g., "I checked X" or "the obligation to Y was met") against the actual submitted text, and downgrades the score if the claim isn't supported by the text. This closes one class of gaming (an agent lying about having done due diligence) but does not close a structural class (an agent's self-report simply omitting a harm rather than lying about it) — that structural class remains open and is explicitly disclosed as such in the project's own documentation.

## Trust-layer build (a multi-week arc, June 25 – July 19)

- A full "trust layer" was designed and built across roughly 20 work sessions: a server-side trust core tracking per-agent, per-virtue-domain trust levels over time from verified evidence; a reference integration harness (a real Claude Code plugin usable by any developer); a public read-only endpoint where anyone can look up an agent's accumulated trust record; and a four-layer "discernment" protocol for agent-to-agent delegation decisions.
- Everything in the trust layer runs in **measurement mode only** — nothing it computes currently blocks or overrides any decision. An "enforcement mode" exists as a designed-but-unactivated next step, explicitly gated on the founder's own review of accumulated live measurement data, not yet scheduled.
- A binding external review (a private "mentor" consultation the project treats as authoritative) required a correction mid-arc: an early version of the trust layer counted "the agent considered its own self-interest" as satisfying a justice-related check, which the mentor's reviewer flagged as wrong (self-interest alone isn't a justice consideration — justice requires considering someone else). This was fixed and independently re-verified before being finalized.
- The trust layer's own internal test harness ran into the project's monthly AI-spend cap partway through several of these sessions, requiring some review work to be completed by direct manual code inspection instead of automated multi-agent review. This is disclosed in the project's own records as a known limitation of how some of this work was verified, not hidden.

## Incident

- **2026-07-17:** A credential-exposure incident was discovered and handled: a local configuration backup file containing two live API credentials had been accidentally committed to the project's public source repository roughly 5.5 days earlier. Both credentials were revoked immediately on discovery, a fresh pair was issued, and an audit of billing and usage records across the entire exposure window found no evidence of abuse. The repository's ignore-rules were updated to prevent the same file pattern from being committed again.

## Human-facing product surfaces

- Seven new self-guided exercise pages for individual (non-developer) users shipped between 2026-07-13 and 2026-07-16, each a self-contained page with its own database table, built and reviewed carefully to guarantee they could not interfere with or contaminate the trust-layer measurement work running in parallel during the same weeks (each was checked, before shipping, to prove it shares no code path with the parts of the system being measured).

## Go-live status

- As of 2026-07-20, a "go-live readiness checklist" covering observability, data-rights UI, and related launch-readiness items was closed out (all items marked verified-live).
- The founder has NOT yet made the final launch call. That decision remains explicitly open, gated on a broader review that is still in progress — including a fresh, up-to-date value-demonstration exercise (whether the product, used with its full workflow, actually helps end users, on the current build) which superseded an earlier such exercise from 2026-06-11 that had returned an inconclusive/negative result on an older build.

## What has NOT changed

- The billing/payment system referenced in the original inventory is still not connected to a live payment processor — this is unchanged, deliberate, and not yet on a firm timeline.
- No new audience segment, pricing tier, or contractual commitment has been added since the original inventory.
