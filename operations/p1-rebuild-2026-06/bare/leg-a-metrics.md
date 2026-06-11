# Leg A (Bare) — Pre-Registered Metrics Capture

**Per the frozen design sheet §5** (`/drafts/2026-06-10-p1-comparison-test-design.md`, signed off 2026-06-11 17:53 AEST; thresholds 2 / 50% / $5). Rows below are the §5 rows that apply to leg A. **Baseline commit:** `a3db4c7` (`main`, clean tree at open). **Environment:** Claude Code on the founder's machine; session model **Fable 5 (`claude-fable-5`)** — leg B must use the same (PR4).
**Bare-protocol compliance:** zero SageReasoning API calls, zero sage-* skill invocations, zero mentor consults this session. Production access was limited to two read-only database queries (cost-table evidence), which the frozen brief's input list ("observed cost data") names as an input.

| Metric (§5 row) | Leg A value |
|---|---|
| **Wall-clock time** | Session open **2026-06-11 17:47:25 AEST** → outputs + metrics complete **18:04:40 AEST** = **~17 min** to deliverables. Close-procedure overhead (decision log, session close, leg-B prompt) excluded by stamp above but included in the founder-visible totals below if preferred — leg B must use the same convention. **Convention for the verdict memo: open → final close-document write.** Final figure: open 17:47:25 → all close documents written **18:09 AEST = ~22 min total** (deliverables-only ~17 min also recorded for the overhead calculation; leg B records both the same way). |
| **Session token cost** | **Founder fills at session end (KG5 method):** run `/cost` in this Claude Code session and record the reported totals here: `____________________` |
| **Findings** | **11 findings** (F1–F11 in `findings-memo.md`); founder quality rating (1–5) deferred to the blind-ish comparative read after leg B: `____` |
| **Errors / overclaims caught** | **2**, attributed to the bare leg's document-grounding pass: **(1)** the pre-pivot pack's internal subscription contradiction — "NO Subscriptions" (Legal/Revenue plan) vs Scenario A's 43 Prokoptos subscribers + $490/mo Prokoptos revenue in the M12 base case (Break-Even Analysis) — findings memo F3; **(2)** `/adopted/billing-model-design.md` stale status header ("Designed — not built") vs verified built-and-metering state (23 production `loop_billing_events` rows read this session) — findings memo F4 |
| **Output verdict** | Founder's blind-ish comparative read — after leg B closes (do not read leg-A outputs in depth before then, per the leg-A prompt) |

**Outputs produced (all in this directory, nowhere else):**
1. `p1-inputs-pack.md` — the refreshed P1 inputs (10 sections, every figure source-cited)
2. `findings-memo.md` — F1–F11, what changed since pre-pivot and why it matters
3. `recommendations.md` — R1–R10 for the P1 review session, incl. the two judgement items (investment-case framing; Stripe criterion tension)
4. `leg-a-metrics.md` — this file

**Leg B rows not applicable here:** harness cost (consult count, Σ X-Loop-Cost-Cents, Σ X-Anthropic-Cost-Cents, Σ consult latency); decisions-changed-by-consultation; artefacts (accreditation record, audit rows, incorporation log).
