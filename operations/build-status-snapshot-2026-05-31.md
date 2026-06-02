# SageReasoning — Build Plan Status Snapshot

**As of:** 2026-05-31 (after the Layer 3 activation-deferred session).
**Purpose:** One-page-ish view of the whole build plan — what's done, what's left.
**Sources reconciled:** the adopted staging plan (`/adopted/substrate-plugin-staging-plan.md`), the capability-inventory first pass (`/drafts/2026-05-29-capability-inventory-first-pass.md`), and the decision log through 2026-05-31.
**Status words (implementation):** Scoped → Designed → Scaffolded → Wired → Verified → Live. **(decisions):** Adopted / Under review / Superseded.
**Health warning:** the component registry itself is still stale (note-and-defer); the capability inventory is a *first pass*, not a certified one; and 0h criterion 1 (you testing every "Wired" feature with real data) is still outstanding. Treat this as an honest working snapshot, not a certified audit.

---

## 1. The big picture — where we are

The project has two layers of plan:

- **The priority roadmap (P0–P7)** — the high-level order of the whole company.
- **The substrate staging plan (Stages 1–6 + licensing gate + a parallel legal/insurance track)** — the detailed engineering build, executed *inside* P0 as R&D.

**We are in P0 (Foundations / R&D phase). The 0h hold-point is still active.** That means: nothing has formally graduated to P1 (the business-plan review) yet. The hold-point's job is to test what we've actually built before committing to the rest. The recent run of sessions (late May) was a capability-inventory-driven push to close the most launch-critical safety and privacy gaps — and it worked through the top five in order.

**One-line summary of done vs left:** the *safety perimeter and intimate-data protections* are now largely live (the hard, scary part). What's left is breadth — the bulk of Stage 1's gap-closure items (A10–A19), migrating the rest of the products onto the substrate (Stage 2), all the plugin/packaging/marketplace work (Stages 3–6), the legal/insurance track (not yet started), and the business-plan gate (P1).

---

## 2. Priority roadmap (P0–P7) — status

| Priority | What it is | Status | Notes |
|---|---|---|---|
| **P0** Foundations / R&D | How we work + build + test the foundation | **In progress** | Protocols 0a–0g established and in daily use. 0h hold-point: capability inventory first pass done (2026-05-29). **Not exited** — criterion 1 (you live-data-testing every "Wired" feature) outstanding. |
| **P1** Business plan review | Affirm/reject the investment case | **Not started** | Gated behind 0h exit. |
| **P2** Ethical safeguards (R17/R19/R20) | Distress detection, deletion, encryption, honest positioning | **Substantially advanced** | R17b encryption **live**; R17c deletion **complete** + export; R20a four-flag perimeter **live**; journal distress screening **live**. Remaining: mirror principle in mentor prompts, R20b independence, confirm limitations page deployed. |
| **P3** Sage Assent (honest certification) | Trust badge + assessment endpoints | **Partial** | Provenance gate built + verified. Trust-layer is wired but **architecturally isolated** (needs wiring in). R18d adversarial evaluation outstanding (needs external review). |
| **P4** Stripe + R5 cost alerts | Paid billing + cost-health monitoring | **Designed only** | Not built. Metering is wired on three endpoints; Stripe itself is designed, not wired. |
| **P5** R0 operationalisation | The reasoning sequence becomes a live decision tool | **Not started** | — |
| **P6** MVP launch (11 criteria) | The launch gate | **Not started as a gate** | Several individual criteria materially advanced (see §5). |
| **P7** Sage Ops pipeline | Post-launch ops automation | **Not started** | — |

---

## 3. Substrate staging plan — Stage 1 (Backend foundations + gap closures)

This is the stage we're actually in. It's the biggest and most critical.

### Done / advanced

| Item | What it is | Status |
|---|---|---|
| A1 | Layer 2 authentication infrastructure | **Verified** |
| A2 | Layer 2 input validation | **Verified** |
| A3 | Layer 2 signing | **Verified** |
| A4 | Key management | **Verified** |
| A5 | Layer 3 server-side service (library) | **Scaffolded/Verified** (library); public endpoint Scaffolded but gated (503). **Layer 3 activation deferred 2026-05-31** — see §6. |
| A6 | Layer 3 four-mode redesign | **Designed** (four specs adopted 2026-05-14; builds deferred) |
| A7 | Server-side R20a distress gate | **Live** (all four R20a flags activated in production 2026-05-31) |
| A9 | Cost monitoring on new substrate path | **Done** (close 2026-05-14) |
| J1 | ADR — substrate concept (Character Kernel) | **Adopted** 2026-05-12 |
| J6 | R5 cost-impact assessment | **Done** (close 2026-05-14) |
| — | R17b realtime-journal encryption | **Live** 2026-05-31 |
| — | R17c genuine deletion completeness + export | **Live/complete** 2026-05-29 |
| — | Journal distress screening | **Live** 2026-05-31 |

### Still to do in Stage 1

| Item | What it is | Status | Risk |
|---|---|---|---|
| A8 | V3-endpoint → plugin-tool mapping | Scoped | Standard |
| K1 | Inventory of bundled-prose consumers | Scoped (partially covered by capability inventory) | Standard |
| **A10** | Per-agent credentials + revocation | **Not started** | Critical |
| **A11** | Endpoint-auth audit + prompt-injection defence | **Not started** | Mixed |
| **A12** | OpenTelemetry instrumentation | **Not started** | Elevated |
| **A13** | R5 cost-as-health alerts | **Not started** | Elevated |
| **A14** | SLOs + error budgets | **Not started** | Standard/Elevated |
| **A15** | R17 SAR + rectification + portability (a–d) | Partially advanced (deletion/export done; SAR/rectification formalisation remains) | Critical |
| **A16** | Privacy governance pass (DPIA, DPAs) | **Not started** (lawyer-coupled) | Standard |
| **A17** | Regulatory governance pass (CR register, AI Act) | **Not started** (lawyer-coupled) | Standard |
| **A18** | Onboarding + limitations + independence-coaching | Partially (limitations page exists; mirror principle + R20b remain) | Mixed |
| **A19** | Abuse detection + rate limiting | **Not started** | Elevated |
| **Stage 1 close** | Lawyer engagement begins; EU-customer decision; FPE track review | **Not reached** | Standard |

**Plain-language read:** A1–A7 plus the encryption/deletion/distress work form a solid, mostly-live foundation. The remaining ~10 Stage-1 items (A10–A19) are the larger block of work still ahead, and several are gated on A10 (per-agent credentials) landing first.

---

## 4. Substrate staging plan — Stages 2–6, gate, and the legal track

| Stage | What it is | Status |
|---|---|---|
| **Stage 2** — K-category migration | Move every existing product onto the new substrate | **Tier 1 only** (`/api/reason`) done. Other tiers (score family, mentor surfaces, skill wrappers, assessments) **not yet migrated.** |
| **Stage 3** — Layer 1 hardening + plugin internals | Open-source Layer 1; build plugin on Anthropic Plugin spec + MCP | **Not started.** Variant-strategy decision (C8) and repo-structure decision (B4) needed before it begins. |
| **Licensing gate** (Rule A) | Lawyer sign-off before anything goes public | **Not reached.** |
| **Stage 4** — First marketplace (Cowork) | Package + list the plugin | **Not started.** Target locked in (Cowork → anthropics/skills → Claude Code Plugins). |
| **Stage 5** — Public open-source + announcement | Release Layer 1 publicly | **Not started.** |
| **Stage 6** — Multi-marketplace + ecosystem | Second/third marketplace; ongoing | **Not started.** |
| **Parallel legal/insurance track (FPE-1…5)** | Pty Ltd, GST, insurance, coverage audit, ToS | **All 5 "Scoped" — none initiated.** ⚠️ These have *wall-clock* dependencies (incorporation takes weeks, insurance quotes days, lawyer turnaround weeks) and they gate the Stage 4 marketplace approval. Worth starting early, independent of build pace. |

---

## 5. The 11 MVP launch criteria (P6) — readiness

| # | Criterion | Readiness |
|---|---|---|
| 1 | sage-reason API external calls with metering | Metering wired; external/plugin-auth path **not activated** |
| 2 | Stripe paid-tier billing | **Designed only** |
| 3 | ≥3 human-facing tools live | Tools wired (confirm distress-coverage of every path) |
| 4 | llms.txt + agent-card.json serving discovery | **Largely met** (artefacts serve) |
| 5 | Privacy policy + ToS lawyer-reviewed | **Not started** — critical path |
| 6 | Business plan review complete | **Not started** (P1) |
| 7 | R17 intimate-data protections | **Largely done** (encryption + complete deletion live) |
| 8 | R18 honest certification language | Partial (trust-layer isolated; adversarial eval outstanding) |
| 9 | R19 limitations page + mirror principle | Page exists; mirror principle in prompts **remaining** |
| 10 | R20 vulnerable-user detection | **Largely live** (human + agent paths now active) |
| 11 | R5 cost-health alerts | **Not built** |

---

## 6. What just happened, and the recommended next steps

**This session (2026-05-31):** examined whether to activate Layer 3 (`SUBSTRATE_LAYER3_ENABLED`). Found that flipping the flag would (a) give no user-visible benefit on the main service and (b) expose an unauthenticated paid endpoint. **Decision: deferred** (Option C), recorded under PR7. Production unchanged. Layer 3 returns only when there's plugin traffic to consume it (then wire endpoint auth first) or a decision to surface its mild-distress text on `/api/reason` (a route change). Layer 3 is **not** a launch blocker.

**Recommended sequence from here** (the capability inventory's ranked list, with gaps #1–#5 now closed):

1. **Declare the remaining 0h work** — the main outstanding hold-point item is *you* testing the now-live features with real data (criterion 1). That's the gate to P1.
2. **Finish the P2 tail** — mirror principle in mentor prompts (gap #8), confirm limitations page deployed, R20b independence coaching.
3. **Lawyer engagement (gap #6 / LC#5)** — critical path with wall-clock lag; can start in parallel with anything.
4. **Begin the FPE legal/insurance track** — all five items are still un-started and gate the eventual marketplace listing.
5. **Then the larger Stage-1 block (A10 onward)** — per-agent credentials first, since A11/A12/A13/A15/A19 depend on it.

**Lower down / deferred:** the three-table encryption batch (mentor_interactions etc.), Stripe + R5 alerts (P4), Sage Assent trust-layer wiring (P3), the whole plugin build (Stage 3), and everything public (gate + Stages 4–6).

---

*End of snapshot. This is a working reconciliation, not a certified inventory. The authoritative per-item records live in the staging plan, the capability inventory first pass, and the decision log.*
