# P1 Comparison — Forensic Execution Analysis (post-verdict)

**Date:** 2026-06-11, late evening (same-day follow-on to the verdict memo, founder-directed). **Tier:** `governance` — Standard risk; documents and read-only evidence only.
**Question examined (founder):** what did leg B actually do differently to leg A; root-cause the Box-2 wall-clock fail; confirm whether the sage practice operated as intended (discovery, calling, scoring-over-time, redirection, reflect usage, looping); compare reasoning methodology incl. agent/subagent counts.
**Evidence:** the two run transcripts (Claude Code `.jsonl`, copied to `transcripts/` — **gitignored; contains retired credential values; delete after use**), the full `harnessed/raw/` payload+header trail, the incorporation log, both metrics files, and route/library source (`/api/reason`, `/api/guardrail`, `translation-sandwich/`).
**Discipline:** this analysis does **not** amend the verdict. The boxes were applied as ticked and the result stands. This is the root-cause layer beneath it, for the 0h call and P1.

---

## 1. Reasoning methodology — the two legs side by side

| Dimension | Leg A (bare) | Leg B (harnessed) |
|---|---|---|
| Orchestrating agents | **1** | **1** |
| Subagents (Task tool) | **0** | **0** |
| Assistant turns / tool calls | 129 turns; 59 tool calls (25 Bash, 20 Read, 6 Write, 7 Edit) | 261 turns; 117 tool calls (**82 Bash**, 20 Read, 9 Write, 6 Edit) |
| Looping / iteration | none | none — consults #3–8 were one parallel batch; every loop had exactly **2 internal calls** (L1 + L3 translation); `max_chain_iterations` never engaged; **no consult was ever re-run** after its correction was adopted |
| Founder-interactive phases inside the measured window | 1 (threshold sign-off, ~4 min) | 3 (credential mint walkthrough ~50 min incl. retries; revocation walkthrough post-deliverables; one console-typo recovery) |
| External calls | 0 (two read-only DB queries) | 12 consults + 2 gates + 1 accreditation write + pre-flight probes |
| Task tracking | Claude Code todo list (18 calls) | none (2 chapter marks) |

**Answer to the subagent question: there were no subagents in either leg, and nothing looped.** The delay was not a runaway loop. Reflect was **never called** (not "too often" — never; the election point passed at revocation), so the reflect-for-subagents hypothesis does not arise.

## 2. The wall-clock root cause — minute-by-minute (UTC, from transcript timestamps)

**Leg B's 74m45s deliverables window decomposes as:**

| Phase | Span | Duration | What happened |
|---|---|---|---|
| Open + protocol reads + pre-flight prep | 08:15:39–08:18:04 | ~2.5 min | Baseline check, prompt read, mint-walkthrough setup |
| **Idle — waiting on founder** | **08:18:04–08:51:37** | **33.5 min** | Zero agent activity. Founder working through the browser-console mint walkthrough; first reply reports the PF-1 400 |
| **Interactive credential phase** | 08:51:37–09:07:04 | ~15.5 min | Two 400-retry rounds (missing `purpose`, both mint bodies), one console typo (`etch is not defined` — a mangled `fetch` paste), key values delivered 09:00:58 and 09:07:04 |
| Pre-flight 401 probe + consult #1 prep (local Layer-1 build) | 09:07–09:10 | ~3 min | Guardrail credential-class rejection confirmed; layer1_schema computed locally |
| **All actual harnessed work** | **09:10–09:31:20** | **~21 min** | Research, 12 consults (parallel batches), incorporation logging, raw capture, all three content outputs written |

**Leg A's 17m15s window:** ~4 min of it was also founder wait (the threshold sign-off gap, 07:47:24→07:51:35); agent work ≈ **13 min**.

**Conclusion — root cause ranked:**

1. **~49 minutes (≈65% of the window) was credential provisioning**: founder-performed browser-console mints inside the measured window, inflated by two prompt-pack defects (PF-1), a paste typo, and walkthrough latency. In a real deployment this is a **one-off per install**, not a per-task cost — but the frozen design measured it inside the window, and the box was applied as written.
2. **Translation latency, not reasoning latency**: each consult averaged ~31s, of which **Layer 2 — the actual reasoning engine — took 0–3 milliseconds**. The rest was two Sonnet prose-translation calls (details §3). Server-side total 367.9s, compressed to ~2–3 wall minutes by parallel batching.
3. **Harness bookkeeping**: 82 Bash calls vs leg A's 25 (curl plumbing, header capture, raw triple writes, verbatim incorporation logging) — order of ~5 min.

**Like-for-like agent work: ~13 min bare vs ~23–25 min harnessed ≈ +80–90% overhead** — still over the 50% box as run, but nowhere near the headline +333%, and most of the remainder has a clean correction path (§3–§4).

## 3. The Layer-3 hypothesis — confirmed in substance, relocated in mechanism

Founder hypothesis: L3 may still run the old prose system, explaining the time difference. From `meta` on all 12 consults:

| Consult | L1 (ms) | L2 (ms) | L3 (ms) | depth | layer1_schema supplied? |
|---|---|---|---|---|---|
| #1 | 0 | 2 | 13,829 | standard | **yes** (sr_inst_ contract) |
| #2 | 0 | 1 | 14,982 | standard | **yes** |
| #3–#8 | 13,236–16,949 | 2–3 | 11,932–19,842 | quick | **no** |
| #9–#11 | 20,115–33,585 | 0–1 | 15,489–18,685 | standard | **no** |
| #12 | 19,424 | 0 | 16,925 | quick | **no** |

Findings:

- **L3 is not a leftover of the old bundled-prose path** (`engine_attribution: translation-sandwich` on every call) — but it **is a full Sonnet prose-generation call (~12–20s) on every consult, by design**, and the response **already carries the complete signed structured L2 assessment alongside the prose**. The leg-B agent consumed the structured fields in-run. **Founder correction (this session, accepted):** the prose is not dead weight — it is the after-the-fact audit narrative pairing each L1 input with a readable verdict for the developer/auditor. All 12 prose outputs survived in `raw/` and have been tabulated (`consultation-audit-report.md` — the auditor use-case demonstrated). The design issue is therefore **when** the prose is generated (synchronously, inside the agent's hot path) and **where** it is retained (nowhere server-side — only a `has_substrate_layer3_response` boolean persists; the audit narrative survives only if the consumer saves it), not whether it should exist.
- **The agent dropped the local-Layer-1 practice when it switched credentials.** Consults #1–2 (per-install contract, which *requires* agent-computed layer1_schema) show L1 = 0ms. After the switch to `sr_live_`, consults #3–12 sent raw text and paid ~16s server-side L1 each — **execution defect in the run** (≈160s server-side avoidable, plus billed cost), and a product gap (the API-key path neither requires nor encourages schema supply; the leg-B prompt didn't mandate carrying the practice across the switch).
- **"Quick" depth is not quick.** Depth changes only the deterministic engine (2ms); quick consults still cost ~27–30s because L1+L3 dominate. The depth tiers currently deliver a *price* tier, not a *latency* tier.
- **Corrected-path arithmetic (estimate, clearly labelled):** with layer1_schema supplied and an L3-skip option, a consult ≈ engine 2ms + auth/distress/injection overhead ≈ **1–2s**. Twelve consults ≈ ~20s total. Harnessed agent work would then be ≈ bare + bookkeeping ≈ 17–19 min vs 13 — **plausibly inside the 50% box**. This is an estimate, not a result; only a re-run under a corrected protocol (verdict memo §8, Branch 2) could claim it.

## 4. Did the sage practice operate as intended?

| Practice element | Operated? | Evidence |
|---|---|---|
| Discovery + calling of the contract | **Yes, with friction** | Endpoints called per §4 protocol; friction items all logged live (PF-1 `purpose`, PF-2 guardrail credential class, 422 provenance, PATCH-not-DELETE) |
| Scoring per decision | **Yes** | 12 signed L2 assessments; proximity per consult: deliberate ×3 → principled (#4) → deliberate ×4 → **reflexive (#9)** → principled ×2 → **habitual (#12)** |
| Score → **redirect** mid-task | **Yes — the clearest success** | 4 documented redirections: #2 frame correction; #4 *agonia* caught → hedge removed; #7 memo §C restructured; #9 *oknos/agonia* caught → R2 written at full strength |
| Redirect → **re-score** (loop closure) | **No** | No consult was re-run after its correction was adopted; every loop was single-pass (2 internal calls = translation only) |
| Profile scored **over time** | **No — stateless by design** | `/api/reason` holds no per-agent profile; each score is an independent snapshot. The only longitudinal artefact is the accreditation write aggregating all 12 signed assessments → grade `pre_progress`. The proximity sequence above tracks the *cases consulted*, not an evolving agent profile |
| Reflect (practice-loop completion) | **No — never called** | Election point passed at revocation; 0 reflect calls in the transcript |
| Notable change in agent operation vs leg A | **Yes** | Leg B compressed all content work into the final 21 min; skipped Claude Code task-tracking; tripled shell activity on harness plumbing; paid double-translation after the credential switch |

**Net: the "examine → redirect" half of the practice demonstrably worked; the "reiterate → re-examine → reflect" half never engaged.** Per-call scoring is a snapshot service; nothing in the current contract carries an agent's trajectory between consults except the terminal accreditation write.

## 5. Additional product findings from this examination (new, beyond F1–F12/PF-1/PF-2)

1. **L3 prose cannot be decoupled from the synchronous response path, and is not retained server-side** — agents pay ~15s and ~half the LLM cost in the hot path for prose whose real consumer (the auditor, per founder direction) reads it *after the fact*; meanwhile the server keeps only a boolean, so the audit narrative survives only if the consumer saves responses. Correction options, all preserving the audit story while removing the hot-path cost: (a) generate L3 asynchronously after responding, retained server-side against the loop id; (b) on-demand generation at report time from the stored signed assessment; (c) a `response_format` flag deferring prose to an audit store. Any of these also makes depth tiers real latency tiers. (Largest single latency+cost lever.)
2. **Guardrail meta still reports the retired per-call price** — `cost_usd: 0.0025` (the old sage-guard rate) in both gate responses; the gate's actual LLM cost is loop-unmetered (already F11-adjacent, but the stale constant is new).
3. **Gate latency variance 20,015ms vs 46ms** (gate-01 vs gate-02, both `ai_generated: true`, same Haiku model) — 46ms is implausible for a generated verdict; suggests a cache hit or a fallback path reporting itself as AI-generated. Worth one look before any latency claim about the gate.
4. **Gate usage block re-confirms F12 live** (`monthly_limit: 667` on the leg's key) — independent corroboration.
5. **The credential walkthrough is browser-console `fetch` paste-work** — the founder's `etch is not defined` typo cost a retry round; a one-page admin mint UI or CLI script removes the whole error class (feeds harnessed R5).

## 6. What this changes (and what it does not)

- **The verdict stands.** The boxes were applied as ticked to the measured windows; this analysis re-litigates nothing.
- **It sharpens the 0h-call branches** (verdict memo §8): the Box-2 fail is ~65% one-off human provisioning measured in-window, ~25% a latency design choice (L3 always-on; L1 re-run) with a named correction, ~10% bookkeeping. The harness's *reasoning* cost is milliseconds. A Branch-2 re-run under a corrected protocol (schema supplied, L3-skip if built, credentials pre-provisioned and measured separately, consults reserved for judgement points) plausibly lands inside all three boxes — estimate, not promise.
- **It adds five concrete fix candidates** (§5) to the harnessed R5 funnel-defect queue for P1.
- **Cleanup owed:** `transcripts/` is gitignored and holds retired credential values — delete the two `.jsonl` files once P1 no longer needs them (or immediately; this document preserves what matters).

## 7. Learnings from the audit report — reasoning methodology, leg B vs leg A (founder-directed addendum)

Compiled from `harnessed/consultation-audit-report.md` read against the leg A transcript and the founder's blind quality read.

**L-1. The two legs used different metacognitive instruments — procedural vs dispositional.** Leg A's self-management was a task list (18 TaskCreate/TaskUpdate calls): it examined *whether the work was progressing*, never *the state of the reasoner doing it*. Leg B dropped the task list entirely and used consultation instead: 12 examinations of the reasoner's own judgement state at decision points. Leg A's reasoning quality is unknowable after the fact; leg B's is tabulated row by row. **The audit trail is not a by-product of the methodology — it is the methodological difference.**

**L-2. The harness's contribution was affect-regulation, not information.** Across all 12 rows, no consult added a fact. Every "used as stated" confirmation (8/12) sat on factual/verification content; every redirection (4/12) sat where the *writer had something at stake in how the claim would land*: an error accusation (#4, *agonia*), the investment-case framing (#9, *agonia + oknos*), a structural judgement (#7), the impulse to report a defect (#12, *epithumia*). The engine discriminated — passions were flagged on exactly 3 of 12 rows, kathekon quality reached "strong" only at the two highest-judgement items (#9, #11). It is not a rubber stamp; it is a passion detector that fires where self-review is least reliable, because there the passion is doing the reviewing.

**L-3. The founder's blind quality verdict is explained by the passion mechanics.** The harnessed pack was rated 4/5 — "more succinct, declared the old inputs unusable, clearer" — vs bare 3/5 — "tries to fix the existing." The redirected rows are precisely where leg B's prose got plainer and stronger (hedge removed at #4; softening paragraph dropped at #9). Leg A's "fix the existing" posture reads as the same passion-class — *oknos*, hesitancy before the bolder true claim — operating unexamined. Same model, same competence, same evidence: the observable quality gap tracks the checked-vs-unchecked dispositions, not capability.

**L-4. A trajectory signal appeared even though the substrate is stateless.** The proximity column profiles the agent's register across the task: *deliberate* baseline → *principled/reflexive* at the judgement peaks (#4, #9–#11) → **habitual at #12, the final consult, with a craving (epithumia) detected on the impulse to report the F12 find**. That is late-task drift, caught in real time — and it is invisible in leg A, whose tail-of-task state has no record. Since `/api/reason` holds no profile, this trajectory exists only because the run kept its responses. Methodology implication: per-agent trajectory persistence (the "scored over time" gap, §4) has demonstrated, not hypothetical, value.

**L-5. The opening consult did disproportionate work.** Consult #1 (plan adoption, standard depth) corrected the control-filter frame — standards located in quality of attention, outcomes released — and the posture held for the whole run (every figure source-cited at the moment of writing; no mid-run threshold-peeking). One well-placed consult at task adoption may carry more value than the six routine confirmations combined. Cheapest methodology rule available: **always consult once, at plan adoption, at standard depth.**

**L-6. Over-consultation has a detectable signature.** All eight "used as stated" rows share one shape: *deliberate* proximity + *moderate* kathekon + no passions. The redirected rows never have it. A self-screen of "is anything at stake for me in how this lands?" before consulting would have cut the count from 12 to ~4–5 with (on this evidence) zero loss — converging with the verdict memo's task-fit analysis, now with the mechanism identified.

*Analysis ends. Cross-references: verdict memo (`verdict-memo.md`); `harnessed/consultation-audit-report.md`; incorporation log; `leg-b-metrics.md`; `D-P1-COMPARISON-VERDICT-NO-BENEFIT-2026-06-11`; route source `/api/reason/route.ts` (L1-skip at ~line 905; metering ~593–641); `translation-sandwich/layer3-prose.ts`.*
