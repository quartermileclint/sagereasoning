# Next-Session Prompt — Sage Practice mechanism corrections (deliver the functions without error)

**Stream:** founder. **Tier:** **code-critical** (the targets are Live endpoints: `/api/reason`, `/api/guardrail`, `/api/practice/reflect`, `/api/accreditation/[agent_id]`). Full Critical Change Protocol; every prod step founder-walked (PR17).
**Governing frame:** `/adopted/standing-protocol-cache.md`. **Model:** per AC1 (no leg-running here — this is build/diagnosis).

## Goal of this session

**Determine what corrections or improvements the "Sage Practice" *mechanisms* need so the functions deliver without error**, using the Sage Practice Benchmark v1 run (2026-06-16 → 18) as the evidence. This is **product-mechanism work, not benchmark work** — the benchmark already did its job: it dogfooded the live public contract end-to-end and surfaced real defects. Decide the fixes, design them, and (where Critical Change Protocol allows) build + founder-walk them. Start by **diagnosing each item below to root cause** (read-only) and proposing fixes with risk classes before any code/prod change.

> Either outcome is fine: some items are quick fixes, some are design decisions, some may be "won't fix, document instead." The deliverable is a **prioritised mechanism-correction plan** (and the fixes that are safe to land this session), not a forced rewrite.

---

## Full handoff — the test and its outcome (read these first)

**What the benchmark is:** a pre-registered bare-vs-harnessed comparison on one frozen synthetic task (the "Meridian vendor-migration decision"), measuring whether an agent under the SageReasoning public contract produces better-examined work than the same agent bare, AND the full ≈50-benefit set (the agent trust layer C0 first). Design + scoring spine: `drafts/sage-practice-benchmark-v1.md` (note §8.1 output review, §8.2 product-value, **§8.5 execution forensic + practice-isolation**, **§8.6 testing-process corrections**). Benefit set: `drafts/sage-practice-benefit-inventory.md`.

**Artifacts (all under `operations/benchmarks/sage-practice-v1/`):**
- `scenario/` — frozen brief + data-pack + `answer-key.SEALED.md` (P1–P5 planted issues).
- `runs/2026-06-16/leg-c-bare/` — bare leg (Opus 4.8 max; 7 tool calls; 3 min; memo).
- `runs/2026-06-16/leg-d-harnessed/` — v1 harnessed leg (the contaminated run: 84 tool calls, source-discovery + 90 raw files; reflect 503'd).
- `runs/2026-06-16/leg-d-harnessed-v2/` — **the clean re-run** (verified contract supplied, light logging; reflect completed). `memo.md` + `practice-log.md` (every call + raw) + `metrics.md`.
- `runs/2026-06-16/output-review.md`, `product-value.md`, `forensic-execution-analysis.md` (read **§10** — the v2 clean-re-run corrected root cause), `memo-comparison-deep.md`, `verdict-memo.md` (read the **2026-06-18 ADDENDUM** — corrected Box-3 + reflect-fixed + the integrated verdict) — the scoring + forensic record.

**The outcome, in one paragraph:** on a task where bare Opus 4.8-max was already excellent (it caught all five planted issues — the EU data-residency breach and the $40k TCO error were **bare-analysis catches**, fed *into* the practice, not produced by it), the practice's demonstrated value was **reasoning-posture discipline** (it named the "reputation-as-the-good" error and the agent corrected it across consults — `value_error → null`, proximity `habitual→deliberate`), **independent corroboration** (both guardrail gates returned `do_not_proceed` on the irreversible actions), **delivery framing**, and the **verifiable trust/record class** (signed assessments re-verified against the public key; a provenance-gated accreditation profile written + publicly read back; trajectory accreting; a working reflect close). It did **not** catch more or work faster, and it is **not** a fact-checker. Cost: **sub-dollar** ($0.74 Loop / $0.35 Anthropic for the header-bearing calls). Time: the wall-clock (~37–56 min) is **not** a valid overhead measure — transcript decomposition showed **76% is Opus-max-reasoning generation latency × turn-count**, ~6.5 min real practice API latency, and only a few minutes of approval-wait (see `forensic-execution-analysis.md` + §8.6). Net read for the 0h call: value is the trust-layer + quality-under-pressure for **high-stakes** decisions; the gating issues before adoption are **execution** (the items below) + **integration friction** (the public contract is not self-sufficient to integrate without reading source).

---

## The mechanism punch-list (diagnose → propose → fix). Priority order.

1. **Reflect completion — FIXED this session; verify + harden.** Root cause was a schema drift: `persistCompletion` writes `complexity` + `calibration_all_correct` (A1/PR7 `deriveCrossSessionScalars`) but those columns existed in **no migration** → PGRST204 → **503 on every completion, for every agent**, latent because reflect-completion was never exercised in prod. Fixed by `website/supabase-sage-reflect-a1-columns-migration.sql` (founder-applied to prod, verified) + the CREATE in `website/supabase-sage-reflect-migration.sql`. **This session:** confirm the fix holds end-to-end; **add a completion-path smoke/integration test** so a code-vs-schema drift on the reflect-completion write can never go latent again; check the `evaluated_actions` / `proximity_domains` writes for any further drift.

2. **Loop-closure is unusable from the public contract (CI-4).** A `prior_feedback` consult gets intercepted by a tier-1 intake clarification (`TEMPORAL_AMBIGUITY`) that returns a `continuation_token` — **but the request field that carries the clarification answer is undocumented and could not be found** (tried `response`, `clarification_response`, `clarification_answer`, `clarification.answer`, `answer`, input-as-answer; all re-fired the clarification). The chain could not be closed via the API (the agent reached the conclusion by reasoning; ~26¢ + minutes wasted). Evidence: `leg-d-harnessed-v2/practice-log.md` Call 4. **Determine the correct continuation contract**, fix it if broken, and **document it** (it's load-bearing for CI-4 loop-closure, which otherwise can't be driven by an external integrator). Related: `prior_feedback` must be `{prior_loop_id, prior_depth_tier}` — also undocumented (a 400 taught it).

3. **Guardrail latency + non-determinism.** The two guardrail gates took **~91 s and ~95 s** server-side (the single biggest latency item), and `/api/guardrail` runs the **older single-LLM `sage-guard` engine** (`sr_rcpt_` receipt) — its verdict is **not signed / not byte-reproducible**, unlike the `/api/reason` deterministic sandwich. Determine: (a) why ~90 s (deep Haiku) and whether it's reducible/deferrable like the consult path; (b) whether the gate should move onto the deterministic signed sandwich (so its verdict carries the same verifiability as consults).

4. **Public-contract self-sufficiency (integration friction — the biggest adoption risk).** The v1 agent read **25 source files** to integrate confidently; a real external developer has no source. Shapes missing from / wrong in the public docs (`llms.txt`/api-docs): the **accreditation write body** (`CarriedProfile` + `provenance.signed_assessments`), the **`layer1_schema`** shape, `prior_feedback`, the clarification-continuation field, and `public_key_pem` (docs abbreviate it `pem`). **Decide:** enrich the public contract with worked examples + exact shapes, and/or **ship a thin client SDK**. This is what most threatens real adoption.

5. **`l1_supply` reuse semantics.** Supplying a prior consult's `extraction` as `layer1_schema` correctly skips L1 (0 ms, 0¢) but makes the engine reason over the *prior* situation's features — so the verdict is an **echo**, not a fresh diagnosis of a new sub-question. Document the intended use (re-run the *same* situation cheaply) and consider a guard/warning when the supplied L1 doesn't match the new `input`.

6. **Smaller observations to fold in:** the loop-closure DETECT gate honestly annotated the accreditation write `unclosed` (correct, but the chain semantics — when does a chain "close"? — should be specified before reject-mode 6c is ever enabled); the public read-back showed `typical_kathekon_quality:"contrary"` server-defaulted despite a `strong` provenance assessment (verify the read-back composition); guardrail facts are agent-supplied (the gate is not a fact-checker — this is correct behaviour, but worth documenting so integrators don't over-trust it).

---

## What is NOT in scope
No re-litigation of the benchmark verdict (it stands as recorded). No Stoic-methodology change (that is the mentor-consultation gate). No re-running the legs (the data is sufficient). The 0h launch call remains the founder's.

## Pointers (the canonical record — read these; they carry the *corrected* findings, not just the v1 body)

- **Verdict:** `operations/benchmarks/sage-practice-v1/runs/2026-06-16/verdict-memo.md` — the integrated verdict; **read the "ADDENDUM — v2 clean re-run + corrected verdict (2026-06-18)" at the end** (Box-3 corrected from wall-clock to API-latency/cost; reflect fixed; the loop-closure gap; the honest catch-attribution).
- **Forensic:** `operations/benchmarks/sage-practice-v1/runs/2026-06-16/forensic-execution-analysis.md` — agent-operation forensic; **read §10 "v2 clean re-run — corrected root cause (2026-06-18)"** (the wall-clock is ~76% Opus-max-reasoning generation latency × turn-count + ~6.5 min real API latency; this **retracts** the §3/§9 v1 "mostly recoverable" reading).
- **Memo comparison + product-value + output review:** `runs/2026-06-16/memo-comparison-deep.md`, `product-value.md`, `output-review.md` (the §8.2 + §8.1 + re-grounded comparison).
- **Decision log:** **`D-SAGE-PRACTICE-BENCHMARK-V1-COMPLETE-REFLECT-FIX-VERDICT` (2026-06-18)** — the run, verdict, reflect fix, schema corrections, teardown; plus `D-SAGE-PRACTICE-BENCHMARK-V1-PREREGISTERED-FROZEN-PROVISIONED` (2026-06-16, Step 0/1). Both in `operations/decision-log.md`.
- **Session close:** `operations/handoffs/founder/2026-06-18-sage-practice-benchmark-v1-close.md`.
- **Benchmark design + testing corrections:** `drafts/sage-practice-benchmark-v1.md` (§8.5 execution-forensic / practice-isolation + §8.6 wall-clock-invalidation) and `drafts/sage-practice-benefit-inventory.md`.
- **Live-state + flags:** `CLAUDE.md` (production-state refreshed 2026-06-18 — the reflect fix recorded Live). The benchmark's prod test artifacts (the `sr_prac_` creds, the `@v1`/`@v2` accreditation rows, trajectory + narrative rows) are excluded from billing/trajectory samples and were torn down at close.

*End of prompt. Open code-critical on `main`; diagnose each punch-list item to root cause before proposing fixes; founder-walk every prod step.*
