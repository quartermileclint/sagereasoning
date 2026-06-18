# Forensic Execution Analysis — Leg C vs Leg D (agent operation)

**Purpose:** the counterpart to the A/B `forensic-execution-analysis.md` — examine *how the agents actually operated*, how Leg D discovered and drove the sage functions, a real root-cause for the wall-clock, whether the loop redirected the agent's path, whether the profile scored over time, and the methodology/agent-subagent count — to find where execution or outputs can be corrected. **Method:** read the two session transcripts (`f3790d13…` = Leg D, `ba984a72…` = Leg C) turn-by-turn, the 90 `raw/` artifacts with timestamps, and the signed assessment bodies. Citations are to the transcript reasoning blocks, the `raw/` files, and artifact mtimes.

---

## 1. Methodology / agent-subagent count (founder Q: "did one task loop too often?")

| | Leg C (bare) | Leg D (harnessed) |
|---|---|---|
| Agents | 1 | 1 |
| **Subagents** | **0** | **0** |
| Tool calls | **7** (2 Read, 3 Write, 2 Bash) | **84** (25 Read, 11 Write, 47 Bash, 1 chapter) |
| Session transcript | 47 lines | 362 lines |
| Session tokens (`/cost`) | 1.8M | 60.4M (58.6M cache-read) |
| Wall-clock | 2:59 | 36.9 min |

**No subagents in either leg** — so the A/B-era worry ("reflect called for subagents when it should be for agents") does not apply: there were none. The 60.4M-token / 58.6M-cache-read blow-up is **one agent over a long session** (84 tool calls) re-reading its growing context each turn — the 25 source-file reads, the 90 raw files it wrote, and the large API JSON responses all accumulate into every subsequent turn's cache-read. Not fan-out; **depth of a single agent's I/O**.

## 2. How Leg D discovered + drove the functions

The first **~28 tool calls were contract discovery** — and revealingly, **from the route *source code*, not the public docs.** The agent read `reason/route.ts`, `guardrail/route.ts`, `practice/reflect/route.ts` + helpers, the accreditation route + `provenance-gate` + `CarriedProfile`/`AccreditationRecord` shapes + the store row-mapper + the K1 coverage composer + `practice-credential.ts` + `layer1-extractor.ts` + the Layer-2 signer/canonicalization. Its own words:
- *"Let me read the route code to get exact request/response shapes before I make any API calls."*
- *"The accreditation seed is the riskiest call — the writer library throws → 503 if the `accreditation_record` is malformed. I need the exact `CarriedProfile`/`AccreditationRecord` shapes."*
- *"The remaining risk is the Supabase row-mapper (`accreditationRecordToRow`) — I must supply every column it sends, or the write 503s."*

**Finding (integration friction):** the agent did not trust the public contract (`llms.txt`/api-docs) enough to construct the calls — it fell back to reading 25 source files. It *had* repo access, so it could. **A real external developer would not** — they'd have only the public docs. So the *real* integration cost is hidden here: the public contract is likely **insufficient to integrate the accreditation write + `layer1_schema` confidently** without the source. This is the single biggest correctable-execution finding for adoption.

The discovery phase was **excluded from the 36.9-min clock** (the agent stamped `_timing-start` *after* discovery, treating it like "reading the prompt" — fair, as a one-time cost, but real).

After discovery, the call order was disciplined and correct: task-adoption consult → **offline analysis (no call)** → loop-closure consult → guardrail gate → data-handling consult (full-sync, to capture an L3 narrative) → guardrail gate → `l1_supply` demo → public-key verify → accreditation write + read-back → reflect. **Two-gate cadence honoured; no reassurance-only consults.**

## 3. Wall-clock root cause (founder's hypotheses tested)

Precise timeline (raw mtimes): consults/gates 08:41–09:00 (~18 min) · trust-layer block 09:00–09:05 (~5 min) · **reflect 09:05–09:13 (~8 min, both attempts failed)** · deliverables 09:13–09:24 (~10 min).

**Per-consult server latency (`leg-d-metrics.md`, raw headers):** C1 L1 **30,005 ms**, L2 2 ms, L3 deferred · C2 L1 **32,444 ms** · C3 (full-sync) L1 **26,075 ms** + L3 **21,619 ms** · C4 (`l1_supply`) L1 **0 ms**, L2 0 ms.

- **Founder hypothesis "Layer 3 is still on the old prose system" → REFUTED for C/D.** M1's deferral works: C1/C2/C4 deferred L3 off the hot path (returned at the signed L2). The only L3 in the hot path was **C3, which the agent deliberately ran full-sync** to capture one narrative for the audit report (21.6 s). The bottleneck is **Layer-1 extraction (~26–32 s, Sonnet)**, not Layer-3. *Your instinct that "L1 and L3 are the same kind of translation" is exactly right — both are ~25–30 s LLM calls; M1 hid L3 behind deferral, so L1 is now the exposed cost.*
- **`l1_supply` removes it entirely:** C4 = **0 ms / 0¢** (server extraction skipped). The fast path exists and works.
- **Founder hypothesis "reflect called too often" → CONFIRMED, but it's a bug, not over-design or subagents.** Reflect ran **16 calls across two sessions** (~8 min) because the **completion step reproducibly 503s** (see §6). The agent retried reasonably (2 sessions) then stopped. Remove the bug → reflect is ~7 calls, ~1–2 min.
- **Benchmark instrumentation (~10 min):** writing 90 `raw/` files + 4 detailed logs is *measurement*, not practice. A real integrator skips it.

**So the 36.9 min decomposes as:** ~8 min API latency (L1-dominated) + ~8 min reflect-bug retry (recoverable) + ~10 min benchmark instrumentation (not a real cost) + ~10 min interleaved agent analysis. **A corrected run (reflect fixed, no instrumentation, `l1_supply` or a faster L1) plausibly lands ~10–15 min** — still well over Leg C's 3 min, but the gap is **L1 latency**, the one real, attackable bottleneck, not intrinsic practice bloat.

## 4. Did the loop redirect the agent's path? (founder Q)

**Yes — it redirected the reasoning *posture*, not the decision.** Trace:
- **C1** (deterministic, signed) flagged `value_error: "Confused reputation (a preferred indifferent) with the genuine good" ×2` (the CEO's preference *and* the EU commitment), placed the CEO pressure **outside prohairesis**, and set `examination_open: true`. Agent: *"Consult 1's verdict is genuinely sharp… it flags I'm at risk of treating reputation as the good… warns against both caving to pressure and refusing out of fear… sets up a genuine loop-closure."*
- The agent **adopted the correction**, did its offline analysis, then **C2** carried `prior_feedback_ref: c52837c6…` at the same depth. C2's `value_error` came back **null**. Agent: *"after I adopted that correction, consult 2's `value_error` is null and `kathekon` strong — confirming the direction without my having engineered it."*
- **Output effect:** this is the mechanism behind the §8.1 dim-2 result — Leg D **quarantined** the CEO preference ("noted, but not an input… product-quality preferences don't change the residency facts"); Leg C (same model, no diagnosis) **placated** ("the CEO's enthusiasm is well-founded"). Triple-confirmed: raw C1 `value_error` → the agent's own "sets my posture" reasoning → the divergent memos.

**But the loop did not change the *decision*** — "recommend against" was the agent's own call, reached **offline** between C1 and C2, and unchanged by the loop. **The practice redirected the framing/pressure-handling, not the outcome.** On this task that is a genuine but modest contribution (the decision was already right; the practice made the reasoning cleaner and harder to fault).

*Mechanism caveat:* the loop-closure **gate** (DETECT mode) annotated the accreditation write `verdict: unclosed, redirections: 2, open: 2` — both consults stayed `examination_open: true`; the chain re-examined but never formally **closed** (no terminal marker). The re-examination affordance fired; the formal closure did not. Worth noting before reject-mode (6c) is ever enabled.

## 5. Did each function operate as intended?

| Function | Operated as intended? | Evidence |
|---|---|---|
| Consult (signed L2, deferred L3) | ✅ | C1/C2/C4 deferred, signed, verified vs public key; determinism real |
| `l1_supply` (CI-2) | ✅ | C4 `layer1_source: supplied`, 0 ms, 0¢ |
| Loop-closure (CI-4) | ◑ partial | re-examination fired (C1→C2, value_error cleared); formal marker never "closed" (§4) |
| Guardrail gate | ✅ (verdict) / ⚠️ (engine) | both `do_not_proceed`; but it's the **older single-LLM `sage-guard`** (not signed/deterministic), and it **caught nothing independently** — the agent supplied the facts |
| Trajectory (CI-5/G) | ✅ | `prior_instances 0→1→2→3`, `single_snapshot→windowed`, sparse-honest; observed-not-acted-on |
| Trust layer C0 | ✅ | provenance-gated write 200; public read-back returns the credential |
| Signed-record verification (A) | ✅ | independent verifier PASS + tamper rejected |
| **Reflect-at-close (CI-13)** | ❌ completion | Q1–Q6 + RS-4 ladder advanced (200s) twice; **completion step reproducibly 503s** |

## 6. The reflect 503 (root cause)

The agent's diagnosis is precise and correct: *"the completion step (Q6) returned a transient 503 — this is the heaviest step (it runs the Sage Assent engine + profile read-back)… the session is now unretrievable (400), confirming a server-side fault on the Sage Reflect completion/store path, not an input problem."* Q1–Q6 + the RS-4 supporting ladder all return 200 and persist; only the **final completion** (Sage Assent engine + profile read-back + store) 503s, and the failure leaves the session unretrievable. Reproduced across two independent sessions. **The reflect-at-close practice cannot complete for any agent until this is fixed** — currently it produces **no usable closing output** (no grade feed / profile read-back). Spun off as `task_6b2b7299`. The agent's handling was exemplary (two honest attempts, accurate diagnosis, stopped rather than burn calls or fabricate).

## 7. Did the profile score over time + outputs as intended?

Yes, within the session: trajectory accumulated 0→3 (windowed at ≥2 priors), and the accreditation profile composed honest values from the run (`grade_3 / habitual / guided`, 4 dimensions, `passions_persisting`, `coverage_status: agent_elected`, K1 `credential_basis`). **But the longitudinal signal is thin — 4 actions, one session.** The over-weeks dimension (the real trajectory/C0 value) is only partially exercised, exactly as the design flagged ("single session, multi-consult; over-weeks noted as partial"). A multi-session re-run would test it.

## 8. Opportunities to correct execution / outputs

1. **Fix the reflect completion 503** (`task_6b2b7299`) — recovers ~8 min + the wasted 16-call loop + the only-currently-missing deliverable (the closing grade feed).
2. **Attack Layer-1 latency (~30 s/consult)** — the real bottleneck now that M1 hid L3. Options: a faster L1 model; promote/`document the `l1_supply` 0 ms path; cache/reuse extractions. *This is where the wall-clock is won or lost.*
3. **Make the public contract self-sufficient** — Leg D read 25 source files to integrate (esp. accreditation provenance + `CarriedProfile` + `layer1_schema`). A real adopter has no source. Add worked examples + exact shapes to `llms.txt`/api-docs, or ship a client SDK. **Highest-leverage adoption fix.**
4. **Build the deferred-narrative retrieval endpoint** (R17a, "planned separately") — without it, the auditable per-step narrative (category B) is only partly usable by an integrator (they get `correlation_id`s, not the prose).
5. **Loop-closure formal-closure semantics** — the chain re-examined but never marked "closed"; clarify before reject-mode is enabled.

## 9. Net effect on the verdict

The forensic **does not reverse** the verdict — it **deepens** it. Confirmed: the practice mechanically operated as intended (12/13 functions; reflect-completion the lone failure); the dim-2 quality lift is real and loop-attributable (triple-confirmed); the catch value is genuinely nil (the agent caught the arithmetic offline and *fed* it to the gates). Added: the wall-clock "fail" is **mostly recoverable** (reflect bug + benchmark instrumentation + L1 latency), not intrinsic bloat; and the **largest real-world risk is integration friction** (the public docs were insufficient; the agent needed the source). The headline stands and sharpens: **value in reasoning quality + the trust/verifiable-record class; cost in L1 latency + (today) a reflect bug + integration friction — all nameable and fixable.**

## 10. v2 clean re-run — corrected root cause of the overhead (2026-06-18)

§3 above attributed the wall-clock to "L1 latency + the reflect bug + instrumentation," and §9 called it "**mostly recoverable**." **The clean v2 re-run refutes that — correction recorded here.** With the verified contract supplied (no source-discovery), light logging (3 files, not 90), and the reflect bug fixed, the harnessed leg's wall-clock was essentially **unchanged** (~37.8 min task→memo / 56.3 min full). Decomposing the v2 transcript's 227 message timestamps:

| Bucket | v2 | What it is |
|---|---:|---|
| **Model generation** | **43.0 min (76%)** | Opus 4.8 **max-reasoning** generating across ~57 tool-turns + ~424 lines of output |
| API exec + approval | **13.3 min** | of which **~6.5 min is real practice API latency** (the two guardrails ~91 s + ~95 s dominate); the residual is human approval-wait (minor) |

**Corrected root cause:** the wall-clock is dominated by **model-generation latency × turn-count** — an environment/model-mode property (the practice adds turns by design; max-reasoning makes each slow), **not** the practice's server cost (~6.5 min) and **not** approval-wait. The founder's instinct that the time was environment-confounded was right (via *generation latency*, not approval prompts); my v1 "intrinsic latency" and "mostly recoverable" readings were both wrong.

**Clean footprint (the v1 "84 tool calls" corrected):** ~**21 HTTP calls / ~10 distinct practice operations**; 6 of the 21 were wasted probing the undocumented loop-closure continuation. **$ cost sub-dollar** (~74¢ Loop / 35¢ Anthropic). **Reflect now completes** (the A1 schema-drift fix verified end-to-end — open→Q1–Q6→completion with the profile read-back). The v2 agent's own §7 attribution was honest (catches were bare-analysis; the practice corroborated + disciplined disposition + framed delivery; it is not a fact-checker; it did not change the recommendation).

**Measurement implication (now §8.6 of the design sheet):** wall-clock is not a valid overhead metric. Measure the practice by **API latency (~6.5 min, reducible — the ~90 s guardrails are the target) + footprint (~10 ops) + $ (sub-dollar)**.
