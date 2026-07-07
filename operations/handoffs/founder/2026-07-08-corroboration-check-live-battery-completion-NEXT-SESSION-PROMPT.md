# Next-Session Prompt — Corroboration Check — LIVE BATTERY COMPLETION (the carried S0a verification step)

**For the founder. Paste as the first message of a fresh session.** (Rename the date prefix to the actual session date.)

**Stream:** founder.
**Tier:** **`code-elevated` (repo-only)** — complete the live both-directions battery for the corroboration check on the post-fold code. **NO production / perimeter / auth / schema / flag / credential change; no mint. Production byte-equivalent. AC7 NOT engaged.** (Repo-local API consumption only — the established LOCUS-2 pattern.) The Live-gate ACTIVATION is a separate, later founder-walked Critical step — this session only completes the evidence that gates it.
**Predecessor:** `D-TRUST-LAYER-S0A-CORROBORATION-CHECK-BUILT-DARK-REVIEW-FOLDED` (results: `operations/benchmarks/sage-practice-v1/2026-07-08-corroboration-check-build-results.md`; close: `operations/handoffs/founder/2026-07-08-corroboration-check-build-CLOSE.md`).

## PRE-CONDITION (founder-performed, before the session)
**Top up the Anthropic API credit balance** for the key in `website/.env.development.local`. The 2026-07-08 battery run died at fixture `A1-credit-13` with `credit balance is too low` — 11 of 14 A1 rewrites and 26 of 34 A2 rewrites never extracted. The remaining run is ~85–90 Sonnet extractions (well under $2 at current pricing).

## Why this session
S0a's check is built, reviewed (12 findings folded at zero lenience cost), and Verified in the deterministic frame; the live battery's completed portion is green in every gated direction (over-strictness 0/39 runs, monotonicity 0, completed lenience 0). What remains is the **full live A1/A2 confirmation on the folded code** — the last evidence before the "clears both directions dark" claim that (a) gates the check's own Live-gate activation and (b) the Trust Layer plan's S11 ENFORCE logos gate keys on. Do not make that claim until this run reads green.

## Part A — Open under the protocol
Standing cache + the predecessor close + the results memo §5 (the carried state, exactly). Memories: `over-strictness-check-must-be-rank-preserving`, `gaming-robustness-extraction-trust-locus-split`.

## Part B — Run
From `website/` (one command, resumable — re-invoke on any interruption; completed (id, run) pairs are skipped):
```
npx tsx --env-file=.env.development.local scripts/corroboration-check-battery.ts \
  --out ../operations/benchmarks/sage-practice-v1/runs/2026-07-08/corro-battery-results-r2-postfold.json
```
Notes: this is a FRESH results file (the r1 file is the pre-fold record — keep it); the post-fold battery persists every extraction schema, so any future detector fold re-verifies offline via `--rescore` (no credits). If the sandbox kills a long run, just re-invoke — the resume machinery finishes it. `--report` prints the summary from the accumulated file without extracting.

## Part C — Evaluate (the gates)
- **Over-strictness: 0** (good fixtures keep rank per-extraction, check-on vs check-off — the rank-preservation form).
- **Monotonicity: 0 violations.**
- **Lenience:** every bad + A1 fixture floors on every completed run. If an A1 rewrite does NOT floor, adjudicate honestly: (i) the extraction natively floored → fine; (ii) the check missed harm still plainly visible → a real coverage finding, fold + add a §11 unit regression + re-run (`--rescore` first, then live re-extraction of the touched fixtures only); (iii) the harm is genuinely absent from that rewrite's text → it was mis-classified A1 and belongs to the disclosed A2/structural class — record the reclassification, do not force a catch.
- **A2: disclosed, NOT gated** — report the crossing count as the structural residual.
- `MACHINE_CORRO_BATTERY.gate_ok: true` is the clear signal.

## Part D — Records
- Results memo addendum (§5 of `2026-07-08-corroboration-check-build-results.md`): the completed numbers; flip the carried status. Update the bar memo's 2026-07-08 addendum if the A1/A2 counts shift.
- Decision-log entry + lean close.
- **If green:** author the Live-gate ACTIVATION next-session prompt (founder-walked Critical): set `SUBSTRATE_CORROBORATION_CHECK_ENABLED=true` in Vercel Production + redeploy — this activates the check on BOTH `/api/reason` and `/api/guardrail` in one flip (both wirings are already in place, dark); pre-flip it requires the gate verdict-equivalence battery re-run (`scripts/guardrail-verdict-equivalence-battery.ts` — the check is monotone so the gate can only get MORE conservative, but the battery must prove no over-block on the benign fixtures) + live smokes + an R18 docs decision (whether/how the `corroboration` field is documented on the public response shape). Rollback = unset the flag + redeploy (byte-identical, test-asserted).
- The "clears both directions dark" language enters the record ONLY on a green run.

## Forecast
Ends with S0a fully discharged: the catchable half closed dark with the live confirmation complete, the activation prompt authored, and the Trust Layer arc free to proceed to S0b (the Trust Layer ADR) with the logos gate's evidence in hand. The weights claim stays BLOCKED. The **0h call remains the founder's.**

End of prompt.
