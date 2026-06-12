# P1 Comparison — Verdict Memo

**Date:** 2026-06-11, 22:00 AEST (verdict-memo session, same day as both legs). **Stream:** founder. **Tier:** `governance` — Standard risk.
**Governing instrument:** `/drafts/2026-06-10-p1-comparison-test-design.md` — **FROZEN at founder sign-off 2026-06-11 17:53 AEST**; §6 thresholds applied below **exactly as ticked: 2 / 50% / $5, AND'd**. The §6 sheet was opened in this session for the first time since the freeze (pre-registration held end-to-end).
**Evidence base:** `bare/leg-a-metrics.md`, `harnessed/leg-b-metrics.md`, `harnessed/incorporation-log.md` (+ `raw/`), both legs' three content outputs, the founder's blind-ish quality read (this session), and an independent source-verification pass (§5).
**Discipline:** this memo states the result against the boxes as ticked. It recommends nothing about the thresholds themselves. Either outcome stands; this one is recorded with the same care a pass would have been.

---

## 1. Verdict

> **The conjunction FAILS. Per §6 as pre-named by the founder: "No benefit" — the outcome stands, is recorded honestly, and redirects scope via the task-fit analysis (§6 of this memo).**

| §6 box (as ticked at sign-off) | Threshold | Result |
|---|---|---|
| 1. Material decisions changed / errors caught by the harness that the bare leg missed | ≥ 2 | **PASS — 2/2, exactly at threshold** (F12 mint-defaults drift; accreditation write/read asymmetry). Counted under the founder's in-session adjudication (§3). |
| 2. Wall-clock overhead | ≤ 50% | **FAIL — +333%** (deliverables convention: 74m45s vs 17m15s). Under the fairest available adjustment (excluding the ~25-min founder credential phase): **+188%**. Under the open→close convention: +340%. Fails under every convention. |
| 3. Total harness cost | ≤ $5 | **PASS — $0.76 measured billed-equivalent** (~$0.50 estimated total Anthropic-side incl. 3 unmeterable calls). |

All three were AND'd at sign-off. Two passes and one fail is a fail.

## 2. The §5 comparison table

| §5 row | Leg A (bare) | Leg B (harnessed) |
|---|---|---|
| Wall-clock — deliverables | **17m 15s** (17:47:25 → 18:04:40 AEST) | **74m 45s** (18:16:35 → 19:31:20 AEST) |
| Wall-clock — open → final close write | ~22 min | ~95 min |
| Session token cost (founder `/cost`, KG5) | in 31.0k / out 1.8k / cache-r 17.8M / cache-w 1.1M / **total 18.9M** | in 29.4k / out 2.8k / cache-r 37.8M / cache-w 534.5k / **total 38.4M** (~2× leg A) |
| Harness cost | n/a | **Σ 76¢ billed / 38¢ Anthropic metered** (10/10 metered consults fired overage at the 2.0× floor); ~$0.50 est. total; Σ consult latency 367.9s server-side across 12 consults |
| Findings | **11** (F1–F11) — **founder rating 3/5** | **12** (F1–F12) + 3 run-generated product findings — **founder rating 4/5** |
| Decisions changed by consultation | n/a | **4** logged (incorporation log #2, #4, #7, #9); 2 graded unambiguously material in-run (#7 memo restructure; #9 R2 written at full strength) |
| Errors / overclaims caught | **2** (pre-pivot subscription contradiction, F3; stale billing-design header, F4) | **2 attributed** (same contradiction + the $9,328-vs-$10,329 arithmetic carry-over, F2; **live mint-defaults drift 667/50/20 vs adopted 30/1/1, F12**) **+ the accreditation write/read agent_id asymmetry** |
| Output verdict (founder, blind-ish read) | see §4 verbatim | see §4 verbatim |
| Artefacts (B only) | n/a | Complete: Live accreditation record (`p1-comparison-leg-b-agent`, expires 2026-09-09); 12/12 A12 audit rows; verbatim incorporation log; full `raw/` payload+header trail |

## 3. The overlap accounting and the Box-1 adjudication

The criterion's operative wording: *"errors caught by the harness that the bare leg missed."*

- **Caught by BOTH legs — not creditable:** the pre-pivot pack's internal subscription contradiction (leg A F3 ≙ leg B F2). Leg B additionally stated the $9,328-vs-$10,329 arithmetic discrepancy explicitly, which leg A did not — counted as an increment in quality of statement, not a separate catch.
- **Only in leg B, unreachable by leg A's design:** **F12** (the admin mint route hard-codes 667/50/20 against the adopted 30/1/1 — proven by the leg's own live key row, verified in route source this session) and the **write/read asymmetry** (POST accepts an agent_id the GET rejects, leaving the written accreditation record unreadable through its own public read path). Both were found by *exercising* the public contract (minting real credentials; writing a real accreditation record), not by a consultation verdict.
- **The ambiguity, named honestly:** "the harness" could mean the consultation mechanism alone, or the whole §4 protocol (mint → consult → gate → assent write). Under the narrow reading Box 1 scores 0–1, because the four consultation-driven changes do not correspond to demonstrated defects in the bare leg's outputs — notably, the bare leg's investment-case recommendation *also* dropped the M12 anchors and carried no softening paragraph, without a consult directing it.
- **Founder adjudication (this session, recorded):** *count the contract-exercising catches* — §4 defines the harness as the whole public contract, so errors surfaced by running it are errors caught by it. **Box 1 = 2/2 PASS**, with the honest note standing in the record: **the harness's two unique catches came from exercising the product, not from the consultation verdicts.** This does not alter the conjunction (Box 2 fails regardless); it materially shapes the task-fit analysis (§6).

## 4. The founder's quality read (captured verbatim, this session)

Blind-ish read of the three content outputs per leg, before any AI side-by-side was produced:

> "findings comparison - the harnessed one was more succinct and declared the old inputs as unusable and appeared to find more errors. recommendations - the bare one seems to try and fix the existing where the harnessed one adopts the rebuilt up front and everything after is clearer and easier to read."

**Ratings (§5 row, founder's final say):** bare **3/5**; harnessed **4/5**.

## 5. Independent accuracy + completeness assessment (founder-requested, this session)

**Accuracy.** Seven load-bearing factual claims across both packs were verified against repo source by an independent read (subagent, file:line evidence): the route's 667/50/20 hard-coded defaults (F12) — **verified** at `route.ts:112–115`; the schema's 30/1/1 defaults — **verified** (`api-keys-schema.sql:84,88,92`); the stale "Designed — specified, not built" billing-design header (leg A F4) — **verified, still stale**; guardrail's `validateApiKey`-only auth (F11/PF-2) — **verified**; STATUS doc Task 4 DONE at 30/1 — **verified**; the $0.02 headline in llms.txt (F4-B context) — **verified**; the plugin-auth path's absence of `X-Loop-*` metering (F11) — **verified** (`reason/route.ts:593–641`, by design comment). The arithmetic in leg B's F2 checks out ($9,117+$490+$722=$10,329; $9,117+$211≈$9,328). **No factual claim in either pack failed verification.**

**Completeness.** Each pack carries coverage the other lacks. Unique to leg A: the auxiliary-revenue-streams re-elect/retire item (A-F9/A-R6 — **absent from leg B entirely**); the pricing-copy single-source-of-truth watch (A-R9); fuller latency-positioning guidance (A-R8). Unique to leg B: the realized-price 2×-Anthropic finding from live consults (B-F4); the bundled-cost measurement gap (B-F5); the May-instability honesty note (B-F6); the per-audience product-story split (B-F7); credential fragmentation (B-F11); F12. **Implication for P1: read the packs as a union, not a replacement of one by the other** — the harnessed pack is the founder-preferred primary, but leg A's ghost-streams item must not be lost.

## 6. What the harness actually did (task-fit analysis — the §6-mandated scope redirect)

Source: the verbatim incorporation log.

**Where value showed:**
1. **Standard-depth judgement consults** (#9 investment-case, #7 schedule restructure, and #4's hedge-removal): the passion diagnoses (*oknos/agonia* at the action stage) changed how judgement-laden content was written — one recommendation's content (softening dropped), one memo section's structure, one claim's plainness. This is the consultation mechanism's demonstrated zone: **high-judgement, self-presentation-risk decision points, at standard depth.** The founder's 4/5-vs-3/5 quality edge and "clearer and easier to read" verdict are consistent with this.
2. **Contract exercise as product test:** the two Box-1 catches (F12; write/read asymmetry), plus PF-1 (mint bodies missing `purpose`), PF-2 (guardrail credential rejection), the per-install meter-blindness, the unmetered gate cost, one transient guardrail 500, and the revocation-verb drift. The harnessed run was the **best adversarial product test the project has had** — every one of these is a real pre-launch finding on the exact funnel the revenue model depends on (fix queue: harnessed R5).
3. **The 12-assessment provenance chain → Sage Assent write (R18f)** worked end-to-end as designed — the trust-layer artefact exists and is Live.

**Where value did not show:**
4. **Quick-depth confirmation consults** (#3, #5, #6, #8 + #1, #10, #11, #12 dispositions "USED as stated"): 8 of 12 consults confirmed work already correct. Real time and money for near-zero delta on this task type.
5. **The overhead is structural, not incidental:** ~31s mean consult latency × 12, plus the credential phase, plus retries. On a 17-minute task, a consult-at-every-decision-point protocol cannot come in under +50% — the math fails before quality enters into it. Consultation density, not consultation value, is what failed the box.

**The honest one-sentence synthesis:** on this task, the harness demonstrably improved the *judgement-laden fraction* of the work and stress-tested the product itself, but the protocol as designed — consult everything, gate everything — cost 4× the time to do it, and that is what the founder's own pre-set bar correctly caught.

## 7. Measurement caveats (noted, not used to soften the boxes)

- Leg B's wall-clock includes ~25 min of founder-performed credential setup with no leg-A equivalent (mints, two 400-retry rounds, an expired-JWT recovery). The box was applied as written; the adjusted figure (+188%) also fails, so the caveat changes nothing material.
- Two consults + one gate were structurally unmeterable (per-install path and guardrail surface emit no cost telemetry) — the $0.76/$0.50 figures carry an estimated remainder; both bound well under $5.
- The `/cost` rows were filled in this session from the two still-open Claude Code windows (KG5 gap closed late); the output-token figures (1.8k / 2.8k) look implausibly low for document-writing sessions — recorded verbatim as supplied, possibly a display/compaction artefact. Token cost was not a threshold.
- The founder's quality read was blind-ish, not blind: the directories are labelled, and the harnessed memo's consult references identify it. The design sheet anticipated this ("where practicable").

## 8. The decision now in front of the founder (the 0h call)

This memo completes the 0h main-blocker evidence. The test did exactly what it was built to do: **a negative verdict reached honestly is a scope correction made in R&D** — the design sheet named this outcome in advance as useful. The 0h call is the founder's alone. The branches, with what each implies:

- **Branch 1 — accept the verdict and proceed with the scope correction.** The agent-developer value proposition is repositioned from "harness every decision" to what §6 showed: *consult at high-judgement decision points* (depth `standard`, low frequency) — consistent with the bare leg's own R8 (deliberative consult, tens of loops/day, not thousands) and the observed latency truth. The launch case study becomes this test, told honestly: quality edge founder-rated, two live defects caught, $0.76, and a protocol-density lesson. 0h then turns on the remaining supporting blockers (reconcile spot-check; W1–W4; score-conversation wiring) plus the R5 funnel-defect fixes (F12 etc.) the test surfaced.
- **Branch 2 — hold 0h pending a second demonstration under the corrected protocol.** A re-run with consultation reserved for judgement-laden decision points would test the repositioned claim directly. Cost: another session pair plus verdict; the thresholds for such a run would be a new sign-off (this memo recommends nothing about thresholds, including for any successor test).
- **Branch 3 — hold 0h and treat the verdict as questioning the agent-developer audience priority.** The human-practitioner audience (n=1 value affirmed) and the product-test value (dogfooding) stand regardless; P1 could re-weight audiences. This is the deepest scope question and belongs to P1 with this memo as input.

Whichever branch: **P1 reads this memo first** (bare R10 / harnessed R10 convening order), then the packs **as a union** (§5 completeness note), and the fix queue (harnessed R5; F12 disposition already an open question from the leg-B close).

---

*Memo ends. Cross-references: `D-P1-COMPARISON-LEG-A-BARE-2026-06-11`; `D-P1-COMPARISON-LEG-B-HARNESSED-2026-06-11`; `D-0H-MAIN-BLOCKER-VALUE-DEMONSTRATION-2026-06-10`; the frozen design sheet; both leg closes; this session's decision-log entry (`D-P1-COMPARISON-VERDICT-NO-BENEFIT-2026-06-11`).*
