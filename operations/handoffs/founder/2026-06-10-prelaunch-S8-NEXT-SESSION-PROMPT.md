# Next-Session Prompt — Pre-Launch S8: end-to-end verification + honest capability inventory → pre-lawyer readiness gate (0h exit)

Paste this whole file into a new session. S8 is the last session of the pre-launch completion plan: it proves the product end-to-end on real production use cases, produces the honest capability inventory, and writes the pre-lawyer readiness statement that exits hold point 0h. After S8: engage the lawyer the same week (Article 50 applies **2026-08-02**; the runway is ~7.5 weeks and shrinking) and start FPE-1 (Pty Ltd) + FPE-3 (insurance quote) in parallel if not already running (review rec 1.5).

**Stream:** founder. **Tier:** opens `governance` + `code-standard` (verification + documentation; no production change intended). Any change that verification forces is classified on its own merits at that moment — and anything touching the R20a perimeter is Critical (PR6) and almost certainly out of S8 scope.
**Governing frame:** `/adopted/standing-protocol-cache.md`. **PR4:** N/A unless an eval run is elected (the Zone-2 eval uses the Haiku classifier per cache AC1/KG2 — cite the row if run).
**Predecessor close (authoritative):** `/operations/handoffs/founder/2026-06-10-prelaunch-S7b-deploy-close.md`.
**Predecessor decision-log entries:** `D-PRELAUNCH-S7B-A13-DELIVERY-LIVE-2026-06-10`, `D-S7B-RIDE-ALONG-FILLS-F1-F4-2026-06-10`, `D-MULTIDISCIPLINARY-REVIEW-2026-06-10`.

## Production truth at open (as of the S7b close, 2026-06-10 — verify against the close, not older docs)
Live: four R20a flags (verified both audiences at S6) · `/api/reason` (A7) · A12 OTel · GDPR /access /rectify /delete /export · A13 detection **+ A13 automated delivery (daily cron 08:00 UTC → Slack, verified)** · **A14 SLO tracker (provisional; Bearer-JWT gate — browser visits 401, use the console snippet)** · A19 (3 detectors, detection-only) · A10 plugin-install auth · A11b injection defence. Inert by decision: Layer 3 (OUT of launch scope) · R20b · rotation vars · Stripe `not_configured`. CLAUDE.md's production-state block is current as of 2026-06-10 (F1 fix) — but per the candidate-PR18 discipline, trust the most recent close + decision log over any summary block.

## Part A — Open under the protocol
Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min) — tier, signals, risk classes, AI-failure-modes table.
2. `/operations/handoffs/founder/2026-06-10-prelaunch-S7b-deploy-close.md` — authoritative state.
3. `/operations/reviews/2026-06-10-recommended-actions-and-priorities.md` — Tier 2 (the S8 shape) + the rec-2.3 decision list.
4. `/operations/pre-launch-completion-plan-2026-06-07.md` — S8's original scope + the readiness-gate definition.
5. `/operations/decision-log.md` — last 3 entries.

Confirm at open (narrate before any action): arc (S8 = 0h exit; lawyer next; P1 after); tier; PR6 disposition (engaged only if any perimeter change is contemplated — none is scoped); PR4 disposition; status vocabulary; the six queued founder decisions (Part B) taken FIRST.

## Part B — Founder decisions at open (each one line, recorded per PR7)
1. **Split decision (rec 2.1):** Option A (recommended) — S8a = two e2e use cases + capability inventory + readiness statement; S8b = registry reconcile (`sage-registry-update` skill) + R18 public-materials pass. Or Option B — one dense session with spillover risk.
2. **`/api/score-conversation`** — inside or outside the R20a perimeter? (Adding a ninth route is Critical under PR6/AC5 — decision only today; any change is its own session.)
3. **`/api/founder/hub`** — wire the distress check its comment references, or delete the comment.
4. **Two practice-name H1 renames** (Premeditatio Malorum, Oikeiosis Extension — carried since A18e).
5. **Stream concentration** — re-affirm all-work-through-founder-stream; mothball the support-inbox pipeline explicitly or schedule post-launch.
6. **PROJECT_STATE.md + summary-tech-guide disposition** (carried from the S7b F4 fill) — retire-to-archive with pointers, or refresh. Plus: elect or decline **candidate PR18** (production-state blocks are close-time artifacts — three recurrences cited in the review).

## Part C — Spine (S8a if split)
1. **Human use case, end-to-end on production:** one real founder decision run through the product as a practitioner would (the review's PR16 note: this can itself be a substrate consultation via `/api/reason` — dogfood). Record inputs, outputs, latency, and whether the value proposition held.
2. **Agent-developer use case, end-to-end on production:** mint an `sr_inst_` credential → `/api/reason` with a real layer1 schema → verify the developer-form contract (and the R20a developer-form path is already S6-verified; do NOT re-test distress inputs casually — use the S6 record).
3. **Honest capability inventory:** every component, 0a vocabulary, per audience (human practitioner / agent developer), citing decision-log entries — the review §1 table + the S7b close are the starting truth. Gaps tagged blocker / significant / minor / cosmetic.
4. **Pre-lawyer readiness statement:** what the lawyer packet contains (LRQ-1/2/3/5/7, FPE-5, DPIA, sub-processor register, Art-50 posture, ISO map), what S8 proved, what remains honest-open. This is the 0h-exit artefact — the founder declares the exit (0h is not an AI-controlled gate).
5. **If elected (rec 2.2):** Zone-2 calibration eval prep — AI prepares the `r20a-classifier-eval.ts` run against the six AC3 domains; founder runs it (~$0.10); file the follow-up audit closing the 18-April PARTIAL record. Verification, not change — no perimeter code touched.

## Part D — S8b (if split; AI-heavy)
Registry reconcile via `sage-registry-update` (39+ days stale; ≥14 components demonstrably Live) + R18 honest-certification pass over public materials (llms.txt, agent-card.json, /api-docs) against the verified inventory.

## Part E — Close
Decision-log entries (lean; Critical only if anything forced a Critical change). Session close per the cache template with a dated "Production state at session close". Update CLAUDE.md's block only at close, from the decision log + verified observations (candidate-PR18 discipline, whether or not elected as a rule). Queue: the lawyer-engagement cover note (the readiness statement IS the cover note) + the P1-input-rebuild prompt (rec 3.2).

## What is NOT in this session
No R20a/perimeter change (decisions only). No Stripe activation (P1 tension, rec 3.3). No npm-vulnerability work (own session). No business-doc rewrites (post-S8, rec 3.2). No new features.

## Rollback path
None expected — verification + documentation. Any incidental fix follows PEV with its own classification and rollback.

## Forecast
Most likely: the six decisions land in minutes; the two e2e use cases pass on production (the S1–S7b arc already verified every component in isolation); the inventory writes itself from the review §1 + closes; the readiness statement is drafted and the founder declares 0h exit (or names what's missing). Then: lawyer engaged within the week; FPE clock running; P1 input rebuild begins.

End of prompt. Opens on `main` (post-S7b docs commit). Governance/code-standard; PR17 applies to any founder-performed production test (walked live, exact commands, expected results). Trust the S7b close + decision log over any summary document.
