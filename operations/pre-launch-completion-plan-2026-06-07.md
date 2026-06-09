# Pre-Launch Completion Plan — "a finished product I can be sure works, before lawyer spend and before exposure"

**Created:** 2026-06-07 (founder direction, after the S2 OTel-activation close).
**Status:** Plan for founder review — **not** an adopted governing document; nothing here is executed yet. No governing document was edited to produce it. It **refines, does not replace,** `/operations/pre-launch-bring-forward-plan-2026-06-07.md` (that plan's S1+S2 are done; this plan re-frames what remains around the founder's "finished product" goal and denser sessions).
**Supersedes for sequencing:** the S3–S5 framing in the bring-forward plan (folded into the denser sequence below).

---

## What you asked for (so it's on record)

1. **A finished product you can be sure works as intended** — verified in production, for both audiences (human users + agent developers) — **before** spending money on a lawyer or exposing it to real users/agents.
2. **Placeholders are acceptable** where only a lawyer's wording or real user metrics can finish a thing. Word them honestly now; replace them later.
3. **Each session fully utilised** — the per-session reading-prep and writing-close overhead should be justified by enough substantive work. Where there's housekeeping or AI-doable work that doesn't need you, fold it in to fill the session.

This plan is built around all three.

---

## The one finding that reshapes everything

**The substrate is extensively built and TEST-verified, but its core agent-facing capabilities are switched OFF in production.** The registry shows 148 components *wired*, 30 *verified*, and only **2 *live***. The production flags confirm it. After today (S2), what is actually live in production is:

- ✅ Core distress detection + redirect (the four R20a safety flags `true`) — the safety floor is on
- ✅ OTel observability (`SUBSTRATE_OTEL_ENABLED=true`, today)
- ✅ Cost-health detection (A13), GDPR data-rights endpoints (A15b/A15c)
- ✅ The website's human-facing pages + the agent-discovery files (`llms.txt`, `.well-known/agent-card.json`) are deployed

…but these are **inert in production** (flags unset), so the agent-facing path is not really "on":

| Capability | Flag (unset in prod) | What's off | Audience affected |
|---|---|---|---|
| **A10** per-agent identity + metering | `PLUGIN_INSTALL_AUTH_ENABLED` | external agent callers can't authenticate/meter via the plugin path | agent developers |
| **A11b** injection defence | `SUBSTRATE_INJECTION_DEFENCE_ENABLED` | prompt-injection hardening on the substrate path | both (security) |
| **Layer 3** per-consumer rendering | `SUBSTRATE_LAYER3_ENABLED` | `/api/substrate/layer3` returns 503 | agent developers (scope to confirm) |
| **R20a audience-correct rendering** | `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` | agent path can get a human-framed crisis message | both (safety polish) |
| **R20a server-side gate** | `SUBSTRATE_R20A_GATE_ENABLED` | a substrate-level distress gate refinement | both (safety) |
| **A19** abuse-detection | `SUBSTRATE_ABUSE_DETECTION_ENABLED` | request-burst detection | operations |

> **Correction (2026-06-09, S6 close — `D-PRELAUNCH-S6-R20A-AUDIENCE-RENDERING-VERIFIED-2026-06-09`):** the two R20a rows in the table above — **R20a audience-correct rendering** (`SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED`) and **R20a server-side gate** (`SUBSTRATE_R20A_GATE_ENABLED`) — were **not** unset when this plan was written. Both have been **Live in production since 2026-05-31** (decision log: `D-R20A-BATCH-ACTIVATION-REFLECT-AUDIENCE-2026-05-31`, `D-R20A-GATE-ACTIVATION-2026-05-31`). The "unset" listing here was stale drift, which then propagated through the S3–S5 production-state blocks and `CLAUDE.md`. S6 was accordingly run as **verification + documentation correction, not activation** — both audience branches were verified live in production (human path → human crisis message; agent path → developer-form payload). The original table text is left intact above for the record; this note is the correction.

**Plain takeaway:** "works as intended, exposed to agents" requires turning these on and verifying each in production — not just on TEST. That is the real spine of the remaining work, and it's exactly what the bring-forward plan under-emphasised. Your instinct to not pay a lawyer or launch until it actually works is correct: today the agent path is mostly a verified-but-dark build.

*(Two scope confirmations live inside this finding, settled at each session's open, not assumed here: whether the standalone **Layer 3** endpoint is launch-needed or only an internal surface; and whether **A10 metering** must be live pre-launch or only when the first external agent onboards. Both are flagged in the sessions below.)*

---

## Definition of "pre-launch complete" (the bar we're building to)

Pre-launch is complete — ready for lawyer spend and controlled exposure — when **all** of these hold:

1. **Every capability intended for launch is Live in production AND verified in production** (a real controlled call, not only a TEST pass), for both audiences.
2. **One human use case and one agent use case are demonstrated end-to-end on production** (the 0h hold-point value demonstration).
3. **An honest capability inventory exists** — the registry's statuses reflect production truth (right now only 2 are marked "live"; that gap is itself a deliverable).
4. **Every legal/compliance surface is present as an honest, well-worded placeholder** — limitations page, privacy policy, terms, R18 certification language, Article 50 marking — marked "draft / in preparation for legal review," nothing overclaimed (R19).
5. **Observability is on** so you can watch cost, health, and abuse the moment anything is exposed (OTel ✅ done; A19 + A14 + A13-delivery to come).
6. **Every activation has a one-step documented rollback.**
7. **The remaining gates are cleanly isolated** — lawyer wording and metric-tuned thresholds are the *only* things left, and neither blocks the "it works" verification.

When 1–7 are true, you spend on the lawyer from a position of confidence, swap placeholders for final wording, and launch.

---

## Placeholder strategy (what stays a placeholder, and why)

Two kinds of things genuinely can't be finished now. They get honest placeholders, not fake completeness:

**Lawyer-gated (final wording needs the lawyer):** privacy policy + terms final wording, GDPR lawful-basis statement, erasure-vs-retention posture, Article 50 final marking, sub-processor DPAs, DPIA residual-risk sign-off, R18 certification claims, compliance-register posture upgrades. → Each rendered now as a clear draft labelled *"In preparation for legal review — not a compliance claim"* (the R19 honesty posture already adopted on the privacy page). The lawyer replaces wording; the *structure and mechanism* are built and working.

**Metrics-gated (values need real usage/revenue):** A18c dependence-detection thresholds, A14 error-budget burn tuning, A13 D1/D2 cost detectors (revenue-vs-cost, Ops cap). → The *detection mechanism* is built and verified inert/conservative now; the *threshold values* carry a "provisional — retune against first real metrics" note. They activate or tune themselves once data exists; no rework of the mechanism.

This is the discipline that lets us reach "verifiably works" without the lawyer or live traffic.

---

## The dense session sequence

**Packing principle (how each session gets fully utilised):** every session has **one founder-gated Critical activation as its spine** (kept isolated so each switch stays reversible and individually verified), **plus AI-doable build / verification / housekeeping that fills the rest** without adding risk to the Critical change. The AI does the read-prep and the write-close regardless — folding AI-doable work into the middle raises utilisation at no extra cost to you and no compromise to the Critical isolation. Safety-perimeter activations (A11b, R20a) keep their spine clean and only take low-risk doc/inert fill.

Estimates assume the current ~45–90 min Critical-session rhythm.

### Session 3 — Abuse-detection go-live *(revised to dense form)*
- **Spine (Critical, you):** activate A19 `request_velocity_anomaly` in production — `abuse_signals` migration + `SUBSTRATE_ABUSE_DETECTION_ENABLED` + token + redeploy + verify. *(The S3 prompt already drafted does exactly this.)*
- **Fill (AI-doable):** build the two remaining detectors (`systematic_enumeration`, `rapid_input_variation`) **inert**, off the structural `masked_context` fields (R3/R17), with unit tests — ready for a TEST pass; **refresh the stale `CLAUDE.md` "Production state" block** to current truth (it predates A10–A19 and misleads every session open).
- **Why packed:** the detectors are pure additive code that don't touch the live activation; the CLAUDE.md refresh needs no decision from you beyond a glance.
- **Estimate:** ~1 session. *(I'll update the queued S3 prompt to this denser form if you adopt this plan.)*

### Session 4 — Injection-defence go-live (A11b)
- **Spine (Critical, you — security):** activate `SUBSTRATE_INJECTION_DEFENCE_ENABLED` in production + verify with a benign + a probe input on TEST-then-prod.
- **Fill (AI-doable):** draft the **R19c limitations page** content with honest placeholder legal wording; apply the **R19d mirror-principle** decision once (a one-line founder call I'll tee up); clear queued governance edits batch 1 (staging-plan status annotations).
- **Estimate:** ~1 session.

### Session 5 — Per-agent identity + metering go-live (A10)
- **Spine (Critical, you — the agent front door):** confirm scope (metering live pre-launch vs at first onboarding), then activate `PLUGIN_INSTALL_AUTH_ENABLED` + verify a metered external-style call.
- **Fill (AI-doable):** verify the **agent-discovery surface** is correct and served (`llms.txt`, `.well-known/agent-card.json`, `openapi.yaml`) — MVP discovery criterion; code hygiene (`/export` onto the shared helper; delete the dead `V3_SOCIAL_MEDIA_PROMPT`).
- **Estimate:** ~1 session.

### Session 6 — Audience-correct safety rendering go-live (R20a refinements)
- **Spine (Critical, you — PR6 safety perimeter, extra care):** activate `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` (and confirm the `SUBSTRATE_R20A_GATE_ENABLED` disposition) so a distressed *agent-path* caller gets an agent-correct response and a *human* gets the human crisis message; verify both audience branches.
- **Fill (AI-doable, off-perimeter only):** build **R20b framework-dependence detection** inert (PR6 applies — kept inert, not activated here); draft the **accessibility statement**.
- **Estimate:** ~1 session (safety spine kept clean).

### Session 7 — Observability completion (A14 + A13-delivery)
- **Spine (Critical, you):** A13 **automated alert delivery** — a Vercel Cron job that runs the cost + abuse evaluators on a schedule and notifies you (so signals arrive on their own). Confirm + activate.
- **Fill (AI-doable / Elevated):** build the **A14 live SLO / health tracker** reading the OTel `substrate_audit_events` latency fields — prove on `/api/reason` first (PR1); a small read-only health view.
- **Confirm at open:** whether standalone **Layer 3** activation belongs here or is out of launch scope.
- **Estimate:** ~1–2 sessions (this one may split if Layer 3 is in scope).

### Session 8 — End-to-end verification + capability inventory (the 0h exit, your confidence gate)
- **You (TEST passes):** run **one human use case** (sign in → a real assessment / mentor flow) and **one agent use case** (authenticated metered `/api/reason` + discovery) end-to-end **on production**.
- **AI (the writing):** produce the **honest capability inventory** (registry statuses moved to production truth); the **limitations + R18 certification placeholder pass** (honest draft wording); a one-page **"pre-lawyer readiness" statement** mapping each MVP launch criterion to its evidence and naming exactly what still waits on the lawyer vs on metrics.
- **Exit:** when this session closes, criteria 1–7 above are met — you're ready to engage the lawyer with confidence and, after final wording, launch.
- **Estimate:** ~1 session (mostly your two test runs + my write-up).

**Total to "pre-launch complete":** ~6–7 dense sessions (S3–S8), each carrying a Critical activation plus real AI-doable fill.

---

## What stays gated (and slots in *after* the above)

- **Lawyer engagement** — happens *after* S8, from confidence: the lawyer reviews the working product + the placeholder wording, returns final language, you swap it in. This is the Stage-1-close legal step (LRQ-1/2/3/5/7 + register posture + final privacy/ToS/Art-50 wording). Wall-clock, not session count.
- **Metric-gated tuning** — A18c thresholds, A14 burn tuning, A13 D1/D2 detectors — tuned once there's real traffic/revenue. Mechanisms already built + verified; only values change.
- **Business plan review (P1)** — your affirm/reject of the investment case; informed by the now-tested product group, exactly as 0h intends.

---

## Recommended path

1. **Adopt this denser sequencing** and let me **update the queued S3 prompt** to the packed form (A19 activation + 2 detectors inert + CLAUDE.md refresh).
2. Run **S3 → S8 in order.** The activations build confidence cumulatively; each is reversible; observability is on throughout so nothing is exposed blind.
3. **Engage the lawyer after S8**, when the product demonstrably works and the only open items are wording and metric-tuning.

Two genuine decisions are yours and only need a moment at the relevant session's open (not now): **(a)** is the standalone **Layer 3** endpoint in launch scope? **(b)** must **A10 metering** be live pre-launch, or only when the first external agent onboards? I'll surface both with a recommendation when we reach them.

---

*End of plan. Review artefact; nothing executed or activated. Production state is as at the S2 close (OTel on; A19/A11b/A10/Layer3/R20a-rendering inert; core distress safety on; cost-health + data-rights live).*
