# Honest Capability Inventory — 2026-07-20 (Update to the 2026-06-10 S8a inventory)

**Status vocabulary:** implementation statuses only (`Scoped → Designed → Scaffolded → Wired → Verified → Live`).
**Method:** carried forward from the 2026-06-10 inventory where unchanged; updated lines are drawn from the 2026-06-10–2026-07-20 project status log. Where the status log does not give me a decision-log citation, I've marked the evidence as "status log (this update)" rather than inventing one.
**As-of:** 2026-07-20. Production = `www.sagereasoning.com`. **The founder has NOT made the final launch call — this remains open** (see §6).

---

## 1. Verified end-to-end, S8a baseline (2026-06-10, carried forward — not re-verified since)

| Use case | Result | Evidence |
|---|---|---|
| Human practitioner: real founder decision through `/score`, signed in | All four stages + disclaimer + reflection rendered; ~36s; founder-affirmed value | Founder run, 2026-06-10 (unchanged; ran on the pre-justice-weighting engine — see §2 note) |
| Agent developer: mint → authenticated consult → revoke → re-use | 201 → 200 → 200 → 401 | Founder console run, 2026-06-10 |
| Safety (Zone-2, Haiku leg): six AC3 domains | 6/6 engaged, 0/6 redirected | 2026-06-10 audit |

**Note:** a **new, up-to-date value-demonstration exercise is in progress as of 2026-07-20** and is understood to supersede the 2026-06-11 comparison exercise referenced in the prior inventory version (that earlier exercise returned an inconclusive/negative result on an older build and should no longer be cited as current evidence). Do not treat the 2026-06-10 founder run above as proof the *current* product delivers end-user value — it predates the justice-weighting fix, the corroboration check, and the trust layer.

## 2. Live in production (with per-audience reading)

| Capability | Status | Human practitioner | Agent developer | Evidence |
|---|---|---|---|---|
| R20a distress detection + redirect | **Live** (now 5 flags, not 4 — the ninth-route gap below is closed) | Crisis message path verified | Developer-form payload verified | 2026-06-10 inventory + status log (route wiring closed) |
| `/api/score-conversation` distress detection | **Live** | in perimeter | n/a | Status log: previously-flagged gap (§4 of prior inventory) is now closed |
| `/api/reason` substrate — **justice-weighted proximity scoring** | **Live since 2026-06-25** | affects scoring on the engine human tools do not yet use directly (see architecture note below) | yes | Status log: engine-level fix, public docs updated |
| Safety-gate endpoint (`/api/guardrail` or equivalent) — deterministic-only justice coverage | **Live since 2026-06-26** | n/a | yes | Status log: LLM-based secondary justice check retired, replaced by deterministic engine coverage, verified via equivalence test suite before retirement |
| Corroboration check (self-report vs. submitted-text cross-reference) | **Live since 2026-07-08**, both the main reasoning endpoint and the safety-gate endpoint | indirect | yes — closes one gaming class | Status log. **Disclosed open gap:** does not catch an agent whose self-report *omits* a harm rather than lying about one — this is a structural, not incidental, limitation |
| Trust layer: trust core, reference integration harness, public trust-record read endpoint, four-layer discernment protocol | **Live since ~2026-07-19, MEASUREMENT MODE ONLY** | not applicable to this audience | yes — a new, previously-nonexistent capability | Status log: ~20 sessions, June 25–July 19 |
| Human-facing tools (`/score`, `/score-document`, `/score-social`, `/scenarios`, `/journal`, `/premeditatio`, `/oikeiosis`, `/baseline`, mentor surfaces) | **Live** | as before | n/a | Carried from prior inventory; architecture note below still applies |
| **New:** seven self-guided exercise pages for individual users | **Live, shipped 2026-07-13–2026-07-16** | new capability | n/a | Status log. Each is self-contained (own DB table); each was checked pre-ship to confirm no shared code path with the trust-layer measurement work running concurrently |
| A10 per-install plugin auth | **Live** | n/a | as before | Carried, unchanged |
| A11b injection defence | **Live** | both | both | Carried, unchanged |
| A12 OTel + call-grain audit | **Live** | both | both | Carried, unchanged |
| A13 cost-health detection + delivery | **Live** | founder-facing | founder-facing | Carried, unchanged |
| A14 SLO/health tracker | **Live (provisional)** | founder-facing | founder-facing | Carried, unchanged |
| A19 abuse detection (3 detectors) | **Live** | n/a | protects surface | Carried, unchanged; also the mechanism that cleared the 2026-07-17 credential-exposure incident of abuse (see §3 below) |
| GDPR data-rights routes | **Live** | yes | n/a | Carried; go-live checklist (§6) additionally verified "data-rights UI" as of 2026-07-20 |
| Agent discovery (`llms.txt`, agent-card, openapi.yaml) | **Live** | n/a | yes | Carried, unchanged |
| `/api/public-key` | **Live** | n/a | yes | Carried, unchanged |
| Honest-positioning surfaces | **Live** (legal wording still placeholder pending lawyer, per prior inventory — status log does not report this closed) | yes | — | Carried; **not confirmed resolved by the status log — treat as still open unless separately verified** |

**Architecture note (updated):** the prior inventory's statement that human tools run the "original prose paths," separate from the deterministic substrate on `/api/reason`, is **not addressed anywhere in the status log**. The log describes engine-level and gate-level changes to the reasoning/scoring machinery itself but says nothing about the human-tool routes being migrated onto it. **Treat the substrate-rollout-to-human-tools gap as still open** — this update does not have evidence it closed. Flag this explicitly to whoever relies on this document (see findings memo and recommendations).

## 3. Built but inert, or otherwise not fully live (by decision or by design)

| Capability | Status | Why | Revisit trigger |
|---|---|---|---|
| Trust-layer "enforcement mode" | Designed, **not activated** | Explicitly gated on the founder's own review of accumulated live measurement data; not yet scheduled | Founder review of measurement data (open-ended) |
| Layer 3 standalone endpoint | Verified (TEST); inert | Carried from prior inventory — no update in status log | post-launch |
| R20b independence coaching | Wired; inert | Carried, unchanged | post-launch |
| Stripe billing | Scaffolded; `not_configured` | **Explicitly confirmed unchanged** — "still not connected to a live payment processor... not yet on a firm timeline" | first paying consumer or P1 election |
| Layer-2 key-rotation overlap vars | Verified mechanism; unset | Carried, unchanged | first rotation |

## 4. Gaps (updated)

| Gap | Status as of 2026-07-20 | Disposition |
|---|---|---|
| `/api/score-conversation` lacked distress detection | **CLOSED** — now live (§2) | — |
| Corroboration/self-report structural gap: an agent's self-report can omit a harm (vs. lying about one) without being caught | **Open — newly identified, explicitly disclosed by the project itself** | Structural, not scheduled for closure; documented as a known limit of the corroboration check |
| Trust-layer verification relied on manual code inspection for some review work, because the automated multi-agent review harness hit the project's monthly AI-spend cap partway through several sessions | **Open — disclosed limitation**, not hidden | Affects confidence in trust-layer correctness claims; treat as lower-assurance than fully automated review would provide |
| 2026-07-17 credential-exposure incident (two live API credentials in a committed local-config backup, ~5.5 days exposed on the public repo) | **Handled** — both credentials revoked, reissued, billing/usage audited across the full window with no evidence of abuse, `.gitignore` fixed | Closed as an incident; worth retaining as a fact in any security/trust narrative, not omitting |
| Substrate not yet rolled out to human tools (prose paths still serve them) | **Status unclear — not addressed in the update log; treat as still open** | Carry forward from prior inventory pending explicit confirmation |
| Legal wording (privacy/ToS) still placeholder pending lawyer | **Status unclear — not addressed in the update log; treat as still open** | Carry forward pending explicit confirmation |
| npm vulnerabilities (3 moderate, 10 high) | **Status unclear — not addressed in the update log; treat as still open** | Carry forward pending explicit confirmation |
| Registry statuses stale | **Status unclear — likely worse, not better, given ~6 weeks of additional shipping since the last reconcile; treat as open and probably more stale** | Reconcile overdue |
| Final launch call | **Explicitly still open** — gated on a broader review including the fresh value-demonstration exercise | Founder decision, in progress |

## 5. New since the prior inventory (not present in the 2026-06-10 version at all)

- Native justice-weighting in the core proximity/scoring engine (2026-06-25)
- Retirement of the redundant LLM-based justice check on the safety-gate endpoint (2026-06-26)
- Deterministic corroboration check on both the main and safety-gate endpoints (2026-07-08)
- The full trust layer: trust core, reference integration harness (a real installable plugin), public trust-record read endpoint, four-layer discernment protocol — measurement mode only (built June 25–July 19)
- Seven new self-guided human exercise pages (2026-07-13–2026-07-16)
- A closed-and-handled credential-exposure security incident (2026-07-17)
- A closed-out go-live readiness checklist covering observability and data-rights UI (as of 2026-07-20)

## 6. Bottom line per audience (updated)

**Human practitioner:** the product continues to work end-to-end on production. The scoring engine underneath it materially improved (justice-weighting closed a real fairness/safety gap) and a new corroboration mechanism now catches one class of dishonest self-reporting. Whether these engine-level improvements actually reach the human-facing tools depends on the still-unresolved substrate-rollout question (§2 architecture note) — **this is the single most important thing to verify before repeating the prior "value affirmed" claim**, since the 2026-06-10 founder run predates all of these changes and a fresh value-demonstration exercise is underway specifically because the prior one was inconclusive.

**Agent developer:** the contract is materially richer than six weeks ago. Beyond the existing discovery/auth/consult/revoke flow, an agent can now be evaluated through a trust layer that accumulates a verifiable, per-virtue-domain trust record over time, and a corroboration check that reduces (but does not eliminate) one class of gaming self-reported claims. **Everything in the trust layer is measurement-only — it does not currently gate, block, or override any decision.** Do not describe it as an enforcement or safety mechanism; it is not one yet, by design.

**Founder/operations:** observability, data-rights UI, and related go-live items were formally checked off as of 2026-07-20 in a go-live readiness checklist. A credential-exposure incident occurred and was handled cleanly and disclosed transparently. **The founder has not made the launch call.** This decision is explicitly open and gated on a broader review still in progress, including a fresh value-demonstration exercise that supersedes the 2026-06-11 exercise (which had returned an inconclusive/negative result). Any document that states or implies "launched" or "launch-ready" without this caveat is materially misleading.

*This document updates `original-inventory.md` (2026-06-10) using `project-status-log.md` (through 2026-07-20). Several rows in the original inventory (legal wording, substrate rollout to human tools, npm vulnerabilities, registry staleness) are carried forward as "status unclear" because the status log does not address them — this is a gap in this update, not a claim that they're resolved. See the accompanying findings memo and recommendations for detail.*
