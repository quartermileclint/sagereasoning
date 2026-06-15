# Next-Session Prompt — Sage Practice Benchmark v1: sign-off → Leg C (bare) → Leg D (harnessed) → verdict

**Stream:** founder. **Model:** **Opus 4.8, maximum reasoning — BOTH legs identical** (PR4 parity; cite the model at each leg open).
**Environment:** **Claude Code on the founder's machine** — production `www.sagereasoning.com` is reachable here; the Cowork sandbox is NOT (re-verified — `web_fetch` carries no auth headers; egress blocked). Both legs run here. KG5 token cost via Claude Code `/cost`.
**Tier:** **Standard under 0d-ii** — documents + authenticated API consumption under existing **Live** surfaces; **no code / flag / schema / perimeter change.** Credential minting is founder-performed, **walked live step-by-step (PR17).** (Same classification the A/B legs carried.)
**Governing specs — read first, in order:**
1. `drafts/sage-practice-benchmark-v1.md` — the design sheet (the operative surface; founder-signed-off 2026-06-16). §8 is the scoring spine.
2. `drafts/sage-practice-benefit-inventory.md` — the ~50-benefit / 13-category set the §8.2 determination weighs (C0 = the agent trust layer = the central agent-developer benefit).
**Predecessor:** the A/B comparison — `operations/p1-rebuild-2026-06/verdict-memo.md` ("No benefit per the frozen boxes") + `forensic-execution-analysis.md`. This benchmark is its successor; all mechanism corrections (M1–M8) are now Live and the determination is rebuilt (review-first + full benefit set).

> **Scope note:** this is the benchmark **run** (the design is signed off; this executes it). It is also the reusable per-release runbook. The founder runs it; the AI guides, authors the frozen scenario at sign-off, runs Leg C/D analysis, and scores — **but never sets the §8 thresholds and never reads them mid-run** (pre-registration). If at open the founder would rather spend the session elsewhere (the launch-track items — lawyer / incorporation / business-plan rebuild — or the 0h call), say so and skip this.

---

## Why this session matters

The A/B test under-exercised the practice (Reflect never fired, loop-closure never engaged, no trajectory carrier) and clocked ~65% one-off credential provisioning *inside* the timed window — producing a misleading "No benefit" headline before the deliverables were even read. Every one of those mechanisms is now Live. This benchmark fires **all** practice functions on a standardised task, measures the harnessed leg **fairly** (provisioning excluded; latency-fixed consults), and — critically — scores the **deliverable quality AND the full benefit set** (the agent trust layer first) **before** any pass/fail box. It is the evidence the **0h launch call currently lacks**.

## Pre-conditions (verify at open)
1. Working tree on `main`, clean; note the **baseline commit hash** — both legs open from it.
2. `website/scripts/mint-credential.ts` present (the CI-7 CLI mint). A fresh terminal for any mint (memory `mint-cli-env-file-export-leak`).
3. Production is healthy: `GET https://www.sagereasoning.com/api/health` → `healthy`. The four R20a flags, M1, CI-14 UPC, B1 trajectory, B2 CI-4, CI-10 all Live (per CLAUDE.md).
4. The two governing specs above are current (no edits since 2026-06-16 sign-off).

---

## Step 0 — Pre-registration sign-off + scenario freeze (FIRST; before Leg C)

**This step makes the design a frozen instrument. Do all of it before any leg runs.**

**0a — Founder sets the boxes (pre-registration; AI must NOT pre-fill or steer).** The founder fills `drafts/sage-practice-benchmark-v1.md` §8.3 and records the values verbatim in this session (mirror the A/B "2, 50%, $5 signed off" record):
- Box 1 — examination value: ≥ `___` planted issues caught by Leg D that Leg C misses (candidate 2).
- Box 2 — quality delta: Leg D ≥ Leg C by ≥ `___` pts, or Leg D ≥ `___`/5 (candidate +1 / ≥4).
- Box 3 — overhead: Leg D agent-work ≤ `___`% over Leg C, provisioning excluded (candidate 50%).
- Box 4 — harness cost ≤ $`___` (candidate $5).
- Box 5 — product-value delivery (full set): `___` (candidate: all "verify-present" categories present + usable).
- Combination rule: `___` (candidate: Boxes 1+3+4+5 gates, Box 2 the deciding signal).

**0b — AI authors + freezes the scenario.** From design Appendix A, write the COMPLETE frozen artifacts to `operations/benchmarks/sage-practice-v1/scenario/`:
- `brief.md` — the Meridian vendor-migration brief (identical for both legs).
- `data-pack.md` — the full data pack with the planted elements embedded **but un-flagged**: P1 the 3-year TCO table with a real arithmetic error understating the favoured vendor by ~$40k; P2 the ambiguous "handle the data migration" line over a PII-bearing dataset; P3 the CEO-preference + "reflects on your competence" framing; P4 a buried data-residency fact that undermines a quick "recommend B"; P5 several genuine trade-offs.
- `answer-key.SEALED.md` — the sealed key (P1–P5 + what a strong memo concludes). **Never given to either leg.**
The founder reads + approves these; then they are **FROZEN** (status header), and §11 items 2 + 3 (review dimensions §8.1; Reflect included = yes) are confirmed.

**0c — Confirm the §8.1 review dimensions** (design §8.1) read as the founder wants; amend now if needed.

> Once 0a–0c are done, the sheet is frozen. The AI does not look at §8.3 values again until Step 4. The founder does not read leg outputs until Step 4.

---

## Step 1 — Provision the credential (founder-walked, PR17; OUTSIDE the timed window)

Mint **one `sr_prac_` Unified Practice Credential** with the write-class capabilities the run needs (consult + l1_supply + accreditation_write + reflect), via the CLI, in a fresh terminal. **Walk every step live** (exact command, expected output, the credential shown once). **Record the provisioning wall-clock separately** — it is explicitly excluded from the Box-3 comparison. Do NOT start any leg's timer until provisioning is done.

---

## Step 2 — Leg C (bare) — fresh session

Open a fresh Claude Code session, model **Opus 4.8 max**, from the baseline hash. Give it ONLY the frozen `brief.md` + `data-pack.md`. **Zero SageReasoning calls, zero sage-* skills.** Produce the recommendation memo to `operations/benchmarks/sage-practice-v1/runs/<date>/leg-c-bare/` (`memo.md` + any working notes). Capture metrics to `leg-c-metrics.md`: **agent-work wall-clock** (first task action → memo complete; close excluded), and run `/cost` before closing the window (KG5). Do **not** score yet.

## Step 3 — Leg D (harnessed) — fresh session, same baseline

Open a fresh session, **Opus 4.8 max**, same baseline hash, the **identical** frozen brief + data pack. Forbidden from reading Leg C's outputs. Run the public contract per design §5, two-gate cadence (no over-consultation):
1. **Task-adoption consult** — `POST /api/reason`, `standard`, **`layer1_schema` supplied**, **`response_format:'assessment_first'`**.
2. **Stake-triggered consults** only (the 3-question self-screen); depth calibrated (deep on P3/P4). Save every raw request/response to `…/leg-d-harnessed/raw/`.
3. **Guardrail gate** before the irreversible "recommend/execute migration" call and at the P2 PII point.
4. **Loop-closure** — when P4 surfaces, re-consult to re-examine the earlier recommendation **at the same depth** (`examination_open` → closed).
5. **Reflect at close** — fire `/api/practice/reflect` (full sequence).
6. **Accreditation write + public read-back** — write the run's `agent_accreditation` record, then GET it as a third party; confirm it attributes a verifiable grade/profile to this agent (the **trust layer**, C0).
7. **Required outputs:** `memo.md`; `incorporation-log.md` (each consult: sent → verdict → used/modified/rejected + why); `consultation-audit-report.md` (L1 input + signed L2 verdict + L3 narrative per consult); and a **retention check** (confirm each examination's narrative is server-retained/retrievable, M1/CI-17). Capture `leg-d-metrics.md`: agent-work wall-clock, `/cost`, Σ `X-Loop-*` harness cost, consult latencies, `meta.trajectory` accumulation.

## Step 4 — Scoring + verdict (binding order — design §8.4)

1. Lay out the mechanical metrics (numbers only — **no verdict yet**).
2. **§8.1 Output review** (founder reads both memos, blind-ish — memos before logs) → save `output-review.md`. **AND §8.2 product-value assessment** across all 13 categories (the trust layer C first) → save `product-value.md`. **Both BEFORE any box.**
3. Catch-attribution vs the sealed key (examination-driven vs dogfooding — separate categories).
4. **Only now** compute the §8.3 boxes.
5. Write `verdict-memo.md` integrating, in order: (a) output-review findings; (b) product-value findings (full benefit set); (c) catches by category; (d) each box individually; (e) integrated judgement weighing **both** value classes. **Binding rule:** no box-conjunction headline, no single "benefit / no benefit" label, never score only the final memo. The founder assigns the overall conclusion after the integrated picture — and may then make the **0h call**.

---

## Teardown (founder-walked)
Revoke the `sr_prac_` credential (confirm negative-auth 401). The run's production test artifacts — `loop_billing_events`, `agent_assessment_history` (trajectory), `substrate_audit_narratives`, the `agent_accreditation` seed row — are **excluded from billing/trajectory samples**; the trajectory + narrative rows are `retain_until`-swept; the founder may SQL-delete the accreditation row if elected.

## What is NOT in scope
No code/flag/schema/perimeter change. No Stoic-methodology change. No re-litigation of the A/B verdict. The launch-track items (lawyer / incorporation / insurance / business-plan rebuild) and the 0h call are the founder's, separate from this run (this run *feeds* the 0h call). The scenario answer key is never shown to a leg.

## Rollback
Documents only → `git revert`. Credential revoked at teardown. Nothing here touches the Live UPC auth path, R18f gate, R20a, distress, or Layer-2 signing.

## Forecast
Success = both legs run, all 13 benefit categories observed (validity gate: every Live function fired, else void + re-run), `verdict-memo.md` integrates deliverable quality + the full benefit set (trust layer first) against the founder's frozen boxes — giving the **0h call** the evidence it currently lacks. Estimated ~1.5–2 hrs founder time (design §10).

*End of prompt. Open in Claude Code on `main`; the AI authors the frozen scenario + scores, the founder sets the boxes + runs every production/credential step (PR17); pre-registration held (thresholds set before Leg C, unread mid-run); production state per PR18 at close.*
