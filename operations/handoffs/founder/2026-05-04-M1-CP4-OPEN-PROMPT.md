# Next-Session Prompt — M1-CP4: End-to-End Orchestration + Parallel-Run Wiring on `/api/reason` (Critical-tier)

**Stream:** founder.
**Tier:** `code-critical`.
**Governing frame:** `/adopted/standing-protocol-cache.md` for tier confirmation. **This is a Critical-tier session** — per cache §"Critical-risk sessions", the **full** template applies and the **Critical Change Protocol (project instructions §0c-ii)** governs every load-bearing change. The lean form does NOT apply.
**Predecessor session close:** `/operations/handoffs/founder/2026-05-04-sub-session-M1-CP3-close.md`.
**Predecessor next-session prompt (full procedure lives here):** `/operations/handoffs/founder/2026-05-04-M1-CP3-NEXT-SESSION-PROMPT.md`. **This file is a paste-ready opener that extends that prompt with the post-amendment state.** The deeper procedure (Steps 0–6, Part C anticipated session shape, Part D Critical Change Protocol activation) lives in the predecessor prompt and is unchanged.
**Predecessor decision-log entries:**
- `D-M1-CP3-LAYER3-MODULE-AND-ADR007-2026-05-04` (M1-CP3 — Layer 3 module Verified standalone + ADR-007 Adopted) **+ first Amendment block (single-snapshot fix)** **+ Post-amendment harness re-run record** **+ Second Amendment block (kathekon-null fix)**
- `D-M1-CP2-LAYER2-MODULE-AND-ADR006-2026-05-04` (M1-CP2 — Layer 2 module + ADR-006)
- `D-M1-CP1-LAYER1-MODULE-AND-ADR005-2026-05-04` (M1-CP1 — Layer 1 module + ADR-005)
- `D-E10-ADR004-DRAFTED-AND-ADOPTED-2026-05-04` (E10 — ADR-004 codification)

**Risk classification:** **Critical** under 0d-ii. Critical Change Protocol APPLIES — see Part D in the predecessor prompt. Engages: AC5 + AC4 + PR6 + PR1. AC7 NOT engaged at the wiring layer.

---

## Why this session matters

This is the first session in the M1 arc that touches the user-facing route. M1-CP1 + CP2 + CP3 built three Verified-standalone modules in isolation. M1-CP4 composes them into the route in parallel-run mode: the user receives the bundled-depth result unchanged; the translation-sandwich result is logged for offline comparison. Failure isolation is the central design property.

**Confirmed at M1-CP3 close:** The harness Phase 5 run **passed 79/79** (after two in-session amendments). The Layer 3 prose-assessment consistency contract holds across all four fixtures. The Layer 3 module is genuinely Verified standalone — not just structurally, but against real Sonnet output.

This session creates the first comparison data the founder will read at M1-CP5 to make the cutover decision. Harness Phase 6 (end-to-end orchestration) + Phase 7 (R20a perimeter preservation via AC4 invocation testing) + Phase 8 (fallback semantics) + Phase 9 (cost + latency reporting) all become live this session.

---

## Pre-conditions (post-amendment state)

1. ✅ M1-CP3 work committed + pushed via GitHub Desktop. Working tree clean at session open.
2. ✅ Vercel build green confirmed post-push (no behaviour change deployed; modules not imported by any route).
3. ✅ **Real-Sonnet harness 79/79 confirmed** (founder ran it post-second-amendment). Phases 1–5 all pass; Phases 6–9 stubbed for this session.
4. ✅ **PR5 disposition resolved at M1-CP3 close:** the candidate "LLM marginal-case discipline requires worked OUTPUT examples" stays in **watch (2nd recurrence)**. Resolution applied at 2nd observation per the watch-status convention. ADR-007 §3 marks all three marginal-case disciplines (kathekon-null, single-snapshot, improvement_path-null) as MANDATORY with worked OUTPUT-example demonstration. The `layer3-prose.ts` `fallbackPhilosophicalReflection` honours all three independently. **No further amendment expected at M1-CP4 open** unless a third recurrence surfaces (e.g., the LLM omits a marginal sentence under different per-request input variance, OR the same pattern appears in M2/M3/M4 Layer 3 templates).
5. Founder availability: 4–6 hours estimated for the wiring + harness, with reservation for a separate M1-CP4b session if cost-cap approval pulls scope. Critical-tier sessions can run long; budget conservatively.
6. Anthropic API key + Supabase service-role key for `supabase-us` available in `.env.local` (already present per M1-CP3 verification).

---

## Part A — Open under the protocol (full reads required for `code-critical`)

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier `code-critical`, model selection rows, status vocabulary, signals, the §"Critical-risk sessions" pointer to the full templates).
2. `/operations/handoffs/founder/2026-05-04-sub-session-M1-CP3-close.md` (~10 min — predecessor close including both amendment blocks).
3. `/operations/handoffs/founder/2026-05-04-M1-CP3-NEXT-SESSION-PROMPT.md` (~10 min — this is the deeper M1-CP4 procedure: Step 0 PR5 disposition, Step 1 surface decisions for the parallel-run wiring (5 items), Step 2 Critical Change Protocol activation (6 sub-steps), Step 3 implementation (Supabase migrations + route wiring + Phases 6–9), Step 4 verify, Step 5 decision-log full form, Step 6 close full form, Part C anticipated session shape, Part D Critical Change Protocol activation reproduced, rollback path, forecast).
4. `/adopted/adr/2026-05-04-translation-sandwich-pilot-api-reason.md` (ADR-004) — **§6 + §7 + §8 + §9 + §10 in full** (parallel-run mechanics, harness phases, R20a perimeter preservation, fallback semantics, multi-session checkpoint structure including M1-CP4 deliverable).
5. `/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md` (ADR-007) — **§6 in full + Changelog (3 entries)**. The fallback prose helper (per ADR-007 §6 + the two amendments) is what the route invokes when `generateProse` throws.
6. `/manifest.md` AC4 (invocation testing for safety functions); AC5 (R20a perimeter — eight bound routes including `/api/reason`); AC7 (auth/cookie/session/redirect surface — confirm not engaged at the wiring layer); PR1 (single-endpoint proof); PR6 (safety-critical changes are always Critical risk).
7. `/website/src/app/api/reason/route.ts` — entire route file. Re-read line 144 (the existing `enforceDistressCheck(detectDistressTwoStage(input))` — the R20a perimeter; this MUST NOT move) and lines 162–170 (existing four-layer context composition).
8. `/website/src/lib/sage-reason-engine.ts` `runSageReason` function (lines ~340–550 — bundled-depth path; the call surface the route makes today).
9. `/operations/decision-log.md` last entries: D-M1-CP3 (parent + first Amendment + Post-amendment record + Second Amendment); D-M1-CP2; D-M1-CP1.
10. `/operations/knowledge-gaps.md` — full read. Engagement scan: KG1 (DB writes — the new `translation_sandwich_comparisons` table writes), KG2 (model selection — Sonnet for Layer 1 + Layer 3, deterministic for Layer 2), KG6 (composition order), KG7 (JSONB storage format — the comparison table stores both engine outputs as JSONB). The PR5 candidate "LLM marginal-case discipline requires worked OUTPUT examples" is in **watch (2nd recurrence)** — note the resolution-applied state + the third-recurrence trigger for permanent KG promotion.

**Confirm at session open per cache:**
- Tier: **`code-critical`** (cache §"Work categories")
- Hold-point: P0 0h active (cache Element 5)
- Model selection (PR4 + AC1): Sonnet for Layer 1 + Layer 3 (cache Element 6 rows); Haiku for the existing R20a distress check (`safety_critical` PermittedModel row); deterministic for Layer 2 (no model)
- Status vocabulary (D14): the route reaches Wired (parallel-run) at session close; it does NOT reach Verified — that requires the parallel-run observation period at M1-CP5
- Risk class: **Critical** under 0d-ii; Critical Change Protocol APPLIES
- AC4: ENGAGED — Phase 7 invocation test of the R20a distress check is the gating proof
- AC5: ENGAGED — `/api/reason` is one of the eight bound R20a perimeter routes
- AC7: NOT engaged at the wiring layer
- AC8: ENGAGED — the route now imports the three translation-sandwich modules
- PR1: ENGAGED — single-endpoint proof on `/api/reason`
- PR3: ENGAGED — Layer 1 + Layer 3 awaited; Layer 2 synchronous
- PR6: ENGAGED
- KG1: ENGAGED — the comparison table write must follow the Vercel five rules
- KG6: ENGAGED — composition order verified at runtime (R20a → Layer 1 → Layer 2 → Layer 3 → log to comparison table → return bundled-depth)
- KG7: ENGAGED — confirm the table schema uses JSONB

---

## Part B — Procedure

The full procedure (Steps 0–6) lives in the predecessor next-session prompt at `/operations/handoffs/founder/2026-05-04-M1-CP3-NEXT-SESSION-PROMPT.md` Part B. **Do not duplicate it here.** Open that file and follow it.

**Adjustments to the predecessor procedure based on the post-M1-CP3-close state:**

- **Step 0 (PR5 carry-forward disposition):** Resolved at M1-CP3 close — no action needed at session open beyond reading the close + decision-log entries. The candidate is in watch (2nd recurrence) with resolution applied. If the new session's reading uncovers a third observation (unlikely — would only happen if the founder runs the harness again at session open and a different per-request variance produces yet another marginal-case omission), the AI engages the third-recurrence promotion per PR5.

- **Step 1 (Surface decisions for parallel-run wiring):** The 5 items remain (comparison table schema; env flag for parallel-run activation; cost-cap mechanics; failure-isolation logging; R20a perimeter preservation strategy). Item (e) is the highest-stakes — AC4 invocation test (Phase 7) is the gating proof.

- **Step 2 (Critical Change Protocol activation):** Unchanged — 6 sub-steps including explicit founder approval specific to named risks. The named risks listed in Part D of the predecessor prompt are unchanged.

- **Step 3 (Implementation):** Unchanged — Supabase migrations (`translation_sandwich_comparisons` + `translation_sandwich_cost_tracker`) + route wiring + harness Phases 6 + 7 + 8 + 9.

- **Step 4 (Verify):** Unchanged. Expected: Phase 1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 all pass. Per-run cost ~$0.20–0.60 (Phase 5 already proven 79/79 at M1-CP3; Phase 9 cost reporting reads from the harness run, not new calls).

- **Step 5 (Decision-log entry):** **FULL form**, not lean. Critical-tier sessions require Verification Method Used + Risk Classification Record + PR5 Knowledge-Gap Carry-Forward + Founder Verification (Between Sessions) + Orchestration Reminder.

- **Step 6 (Session close):** **FULL form**, not lean. The next-session prompt at M1-CP4 close names M1-CP5 (Standard-tier — parallel-run observation + cutover decision; lean form applies for that one).

---

## Part C — Anticipated session shape

Per the predecessor next-session prompt Part C. Estimated total: **4–7 hours** for Critical-tier session (one of: full M1-CP4 in one session; or M1-CP4a (Supabase migrations + ADR amendment for schema) + M1-CP4b (route wiring + harness) split). Founder's call.

---

## Part D — Critical Change Protocol activation

Reproduced in full in the predecessor next-session prompt. Engaged at Step 2 of Part B.

---

## Rollback path

- Env flag `TRANSLATION_SANDWICH_PARALLEL_RUN=0` (or removed) → redeploy reverts the parallel path to dormant. Bundled-depth path unchanged. Vercel rebuild ~2 minutes.
- `git revert` of the route-wiring commit + push reverts `/api/reason` to its M1-CP3 state. Comparison table preserved for analysis.
- Supabase tables can be dropped via SQL Editor (founder runs the SQL; AI does NOT perform table drops).

---

## Forecast

If M1-CP4 succeeds: route reaches Wired (parallel-run); harness Phases 1–9 all operational; comparison table accumulating data; cost tracker active; founder has the data infrastructure for the M1-CP5 cutover decision. Cumulative session count for M1: four of an estimated six to ten.

If Step 1's schema decision proves more involved than estimated, split cleanly into M1-CP4a + M1-CP4b. PR1 single-endpoint discipline favours subdivision.

If Phase 7 (R20a perimeter preservation) fails on first run, this is a **HARD STOP** — the AI engages "I caused this" signal, surfaces the failure pattern, and the founder decides whether to revise the wiring (revert + retry) or escalate to a separate session. R20a perimeter regression is the highest-stakes failure mode in M1.

---

## Quick state summary at session open

| Item | State at M1-CP4 open |
|---|---|
| ADR-004 | Adopted (M1-CP3 close confirms §10 M1-CP4 deliverable scope holds) |
| ADR-005 | Adopted (Layer 1 schema specification) |
| ADR-006 | Adopted (Layer 2 mechanism algorithm) |
| ADR-007 | Adopted + twice amended (Layer 3 prose template; both amendments resolve the marginal-case discipline drift surfaced by the harness) |
| `layer1-extractor.ts` | Verified standalone |
| `layer2-mechanisms.ts` | Verified standalone |
| `layer3-prose.ts` | Verified standalone (twice-amended; 79/79 harness confirmed) |
| `verify-translation-sandwich.ts` | Phases 1–5 wired and passing 79/79; Phases 6–9 stubbed (this session implements them) |
| Supabase | Unchanged from M1-CP3 (no new tables yet) |
| `/api/reason` route | Unchanged from M1-CP3 (no translation-sandwich import yet) |
| Vercel | Unchanged behaviourally |
| PR5 candidate | Watch (2nd recurrence); resolution applied at 2nd observation; third-recurrence trigger preserved |
| R20a perimeter | Unchanged; AC4 invocation test will be the gating proof at Phase 7 |
| Cost cap | Not yet set — founder approves at Step 2 of Part B per ADR-004 §6.2 default (14 days OR $50 OR 1000 requests) |

---

End of M1-CP4 open prompt. Full procedure: read `/operations/handoffs/founder/2026-05-04-M1-CP3-NEXT-SESSION-PROMPT.md`.
