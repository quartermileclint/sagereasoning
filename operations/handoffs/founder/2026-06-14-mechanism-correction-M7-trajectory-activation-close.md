# Session Close — 2026-06-14 — Mechanism-Correction M7: trajectory activation (CI-5 — read + activation half)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`.
**Tier:** `code-elevated` (an engine read-path change on Live `/api/reason` — but the assessment stays byte-identical; only an additive, flag-gated response overlay). Lean + Elevated additions.
**Date:** 2026-06-14.
**Predecessor close:** `operations/handoffs/founder/2026-06-14-mechanism-correction-M6-trajectory-persistence-close.md`.

## What this session did

Closed the **continuity claim** of the Character-Kernel (FX-6 / dossier B5): the consulting credential's own windowed assessment history (M6's `agent_assessment_history`, D17 90d/last-30) is now read back on `/api/reason` and surfaced as an **honest, sparse-truthful trajectory overlay** under `meta.trajectory`. Ships **production-inert** (new read flag `SUBSTRATE_TRAJECTORY_READ_ENABLED` UNSET = byte-identical, zero new DB reads).

- **Founder election at open — Read-and-overlay.** The path-check surfaced a material gap between the prompt's literal Step 2 ("make Layer 2 *act* on the carried-context per Rule 10") and the code: the translation-sandwich engine has **no Rule-10 longitudinal machinery** (its `Layer2Assessment` is per-instance only; the Rule-10 `direction`/`senecan_grade`/`confidence_weighted` is the alt-3 rag-mentor *spec*, not the sandwich), and the trust-layer direction/grade aggregator is **non-deterministic** (`computeWindowSnapshot` stamps `computed_at`). You elected **Read-and-overlay**: leave `applyMechanisms` **byte-identical** (it never reads the trajectory) and realise the Rule-10 longitudinal projection as a deterministic *overlay* fed by the windowed read — faithful to the prompt's own guards ("supplies evidence, does not move grades directly"; hysteresis stays the Assent engine's; the depth-scope mapping untouched).
- **Determinism, re-expressed over the enlarged input set:** the engine output is a pure function of `input` (strongest form of "same `(input + context)` → same output"); the overlay is a pure function of the stored window — reuses `computeWindowSnapshot` (PR15) but **never surfaces `computed_at`**, computes the evidence span from the rows' own timestamps (not the wall clock), and feeds the aggregator a total, deterministic order (created_at desc + correlation_id tiebreak). Asserted byte-identical for a fixed window; `computed_at` proven absent from the surfaced JSON.
- **CI-15 proximity-calibrated depth → operational** by surfacing `typical_proximity` + confidence as the agent's calibration **input** (per the M5 staged-docs contract — no server-side depth override, which would collide with CI-4's same-depth rule and the untouchable depth-scope mapping).
- **Adversarial review** (6-dimension / 8-agent workflow, each finding adversarially verified): determinism, flag-off byte-identity, R17a, KG1/KG7/fail-honest, `prior_instances` placement, D17 honesty all **clean**; 2 findings, both **refuted** (the documented `regressing`-vs-`declining` PR15-reuse vocabulary).

## Decisions Made
- `D-MECHANISM-CORRECTION-M7-TRAJECTORY-ACTIVATION-BUILT-TEST-VERIFIED-2026-06-14` appended. M7 (CI-5 read + activation) built + TEST-Verified at the assertion level; production-inert.

## Status Changes
| Item | Old | New |
|---|---|---|
| CI-5 trajectory activation — read half (`getTrajectoryWindow`) | Scoped | **Built; Verified (assertion-level)** — flag UNSET = byte-identical |
| CI-5 — the trajectory overlay (`trajectory-overlay.ts`) | — | **Built; Verified** (33 overlay assertions; tsc clean) |
| `agent-assessment-history-store.ts` (M7 read additions) | M6 write-only | **Built; Verified** (97 store assertions, +37 over M6) |
| CI-5 (the Character-Kernel continuity claim) | write-only (M6) | **read + overlay built; closes once the founder activates the flags** |
| CI-15 proximity-calibrated depth | Scoped (M5 docs conditional) | **operational input built** (typical_proximity surfaced; docs-flip is a founder step) |

## Next Session Should
Execute **M8 — credential-consolidation design (CI-14)**, per `operations/handoffs/founder/2026-06-14-mechanism-correction-M8-credential-consolidation-NEXT-SESSION-PROMPT.md`. ADR-only (governance/Standard; any later *build* is a Critical track). M8 also folds the M6 follow-up — **setting `owner_user_id` on `sr_live_` mints + the backfill** (the legacy `/api/admin/api-keys` mint leaves it null) — and names the **trajectory-retention sweep** (the small cron that enforces `retain_until` for null-owner external rows; the gate on M6-P2 + the M7/M6 production flag activations). The parked **CI-16** (quick-tier value classification, gate-engine decision) remains deferred.

## Blocked On
**Files remaining uncommitted (the founder commits by name; the AI did no git ops):**
- `website/src/lib/substrate/agent-assessment-history-store.ts` (M7 read additions)
- `website/src/lib/substrate/trajectory-overlay.ts` (NEW)
- `website/src/lib/substrate/__tests__/trajectory-overlay.test.ts` (NEW)
- `website/src/lib/substrate/__tests__/agent-assessment-history-store.test.ts` (extended)
- `website/src/app/api/reason/route.ts` (M7 imports + the read block + the Branch-3 overlay)
- this close; the decision-log entry; the M8 prompt; the CLAUDE.md production-state refresh
- **Exclude:** `website/tsconfig.tsbuildinfo`; never stage `.env*`.

**Production state at session close:** **unchanged** from the M6 state. M7 is production-inert: `SUBSTRATE_TRAJECTORY_READ_ENABLED` is UNSET (byte-identical — no read, no overlay, zero new DB reads) and the engine assessment is untouched; the M6 write flag is also still UNSET (P2 held on the retention sweep). The four R20a flags remain `true`; CI-10 Live.

## Open Questions
- **Pending founder-elected 0c-ii (M6+M7 activation sequence):** on TEST set `SUBSTRATE_TRAJECTORY_WRITE_ENABLED=true` → ≥2 consults on one credential → set `SUBSTRATE_TRAJECTORY_READ_ENABLED=true` → a 3rd consult shows `meta.trajectory.prior_instances ≥ 2` + `confidence_weighted: low` + an honest `direction_of_travel`; a fresh credential shows `single_snapshot`. Production write-flag (P2) + read-flag activations are each their own step, gated on the trajectory-retention sweep.
- **Surfaced vocabulary:** the wire surfaces the aggregator's `direction_of_travel: 'regressing'` (consistent with the accreditation surface), not D17's prose `declining` — recorded, not changed (a one-line mapping could align it but would diverge from accreditation).
- **CI-15 docs:** the M5 staged-doc phrasing can move from conditional ("where your trajectory is known") to operational now that the proximity input is readable — a founder docs-activation step (R18).
- **Carried:** the M1/M3/M4/M5 flag activations + staged-docs; the M4 CI-9 replay-ack; `/api/keys` 100/100/1 vs 30/1/1; the leg-B seed-row; **the 0h call**.

## Founder Verification
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsc --noEmit
npx tsx src/lib/substrate/__tests__/trajectory-overlay.test.ts
npx tsx src/lib/substrate/__tests__/agent-assessment-history-store.test.ts
```
Expected: tsc silent; `33 passed, 0 failed`; `97 passed, 0 failed`. Then commit the files above and push via GitHub Desktop. **Vercel deploy is behaviourally inert** — the read flag is UNSET, so `/api/reason` is byte-identical (no read, no overlay) and the engine is untouched.

## Cross-references
- `operations/handoffs/founder/2026-06-14-mechanism-correction-M7-trajectory-activation-NEXT-SESSION-PROMPT.md` (the prompt this close answers)
- `operations/handoffs/founder/2026-06-14-mechanism-correction-M8-credential-consolidation-NEXT-SESSION-PROMPT.md` (next)
- `D-MECHANISM-CORRECTION-M7-TRAJECTORY-ACTIVATION-BUILT-TEST-VERIFIED-2026-06-14`
- `operations/p1-rebuild-2026-06/mechanism-correction-build-plan.md` (CI-5 = M6/M7; CI-14 = M8)
- `adopted/rag-mentor-alt3/progression-delta.md` (D17 — windowing + CONFIDENCE_WEIGHTED bands)
- `operations/p1-rebuild-2026-06/m5-docs-staged-for-activation.md` (CI-15 contract)

*End of session close. M7 (CI-5 read + activation) is built, TEST-Verified at the assertion level, and production-inert; the agent's own stored trajectory is now read back into the response as an honest, deterministic overlay — the engine assessment byte-identical, hysteresis intact — closing CI-5's continuity claim pending the founder's flag activation. The arc continues at M8 (CI-14 design + the `sr_live_`-owner backfill), the trajectory-retention sweep, and the parked CI-16.*
