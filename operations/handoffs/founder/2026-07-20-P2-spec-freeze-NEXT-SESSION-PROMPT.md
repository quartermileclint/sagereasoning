# Next-Session Prompt — P2 spec-freeze: re-run the bare-vs-harnessed value benchmark (scenario + thresholds)

**Stream:** founder (AO program — P2, re-running the stale 0h benchmark verdict).
**Tier:** `governance` (spec/design authoring + founder election E5; no live credential mint/consult in THIS sub-session — those belong to the bare-arm and harnessed-arm sessions that follow).
**Governing frame:** `/adopted/standing-protocol-cache.md`; the AO plan `operations/agent-org-2026-07/agent-org-and-evidence-build-plan.md` §3-P2.
**Predecessor session close:** `operations/handoffs/founder/2026-07-20-P-GL-finish-CLOSE.md` (P-GL fully closed — not a P2 dependency, but recent context).
**Predecessor decision-log entries:** `D-AGENT-ORG-P-GL-FINISH-MENTOR-WIRING-AND-CHECKLIST-CLOSED-2026-07-20`; the P0 diagnosis entry (2026-07-19, see Pre-condition 1); `D-AGENT-ORG-EVIDENCE-BUILD-PLAN-ADOPTED-2026-07-19` (v2 — the plan of record).
**Risk classification:** Standard/Elevated (`governance`) under 0d-ii. **Critical Change Protocol NOT engaged this session** — the spec is authored and frozen; no live op runs. (The subsequent bare-arm and harnessed-arm sessions ARE `code-critical` — live mints/consults/teardown — per the plan; that tier applies to them, not here.)

## Why this session matters

The 0h go-live gate still rests on the 2026-06-11 "no benefit" verdict (`operations/p1-rebuild-2026-06/verdict-memo.md`) from the original bare-vs-harnessed comparison. That verdict is now six weeks stale relative to the product it judged. Since 2026-06-11 the build shipped: native dikaiosyne weighting in the shared reasoning engine (2026-06-25), retirement of the guardrail's LLM justice bridge in favor of the native native engine (2026-06-26), the corroboration check closing the honest-extraction gaming surface (2026-07-08), the full trust-layer S1–S11 arc — trust core, evidence weighting, the discernment protocol, the seven-layer reference harness, the dogfood install (2026-07-08 through 2026-07-19), the loop-fold (2026-07-19), and the dikaiosyne self-circle narrowing (2026-07-19). None of that existed when "no benefit" was written. **This session does not re-run the benchmark.** It freezes the spec — scenario set, thresholds, guards — the next two sessions (bare-arm, harnessed-arm) will execute against, so the eventual verdict-memo update tests the CURRENT product rather than repeating the 2026-06-11 exercise's own root lesson: ground the instrument in what it's actually measuring before running it (memory: `method-before-purpose-test-drift`).

## Pre-conditions (confirm at open — do not re-derive; both already resolved)

1. **P0 is closed — the harness credential is healthy, not a P2 blocker.** `operations/handoffs/founder/2026-07-19-s9-loop-consult-credential-refresh-CLOSE.md`: diagnosed DB-verified healthy (5000/200 limits, well under quota at diagnosis time). The intermittent framing observed in recent sessions is a **transient DB-layer fail-secure under load, masked to HTTP 401 by the route** — not a credential problem, and not the reason to refresh anything. This is a KNOWN, disclosed failure class the harnessed-arm session's design must account for (retry once, then disclose the observed rate — never let it silently degrade the comparison). A separately-scoped follow-up investigation exists if it recurs materially: `operations/handoffs/founder/2026-07-19-consult-lookup-resilience-and-latency-NEXT-SESSION-PROMPT.md` (not required reading for this session).
2. **The current build's deploy state must be RE-confirmed at open, not assumed.** The plan's own text warns against trusting its "already satisfied as of the 2026-07-19 push" note as time passes — re-check, don't cite it. Confirm via `curl https://www.sagereasoning.com/api/health` (expect `status:"healthy"`, the reachability-probe shape) and `git log origin/main -1` that the self-circle narrowing (`D-KATHEKON-DIKAIOSYNE-SELF-CIRCLE-NARROWING-BUILT-REVIEW-FOLDED-2026-07-19`) and the loop_fold v2 split are genuinely deployed, not merely committed — the harnessed arm's evidence is worthless if it runs against an undeployed build.

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min)
2. `operations/agent-org-2026-07/agent-org-and-evidence-build-plan.md` §3-P2 IN FULL (the size / depends-on / why / method-constraints / deliverables / election-E5 block) — this is the deliverable-of-the-day
3. The two frozen precedents — read for their METHOD, not their conclusions (this is a fresh spec, not a copy of either):
   - `drafts/2026-06-10-p1-comparison-test-design.md` (the frozen design sheet — the P1-comparison's thresholds: 2 decisions/errors, 50% wall-clock, $5 harness cost, AND'd; how it defined "material decision changed"; its blind-ish-not-blind quality-read caveat) + `operations/p1-rebuild-2026-06/verdict-memo.md` (how the frozen sheet was actually applied, ticked exactly as designed, no post-hoc threshold litigation — the discipline to inherit)
   - `operations/benchmarks/sage-practice-v1/2026-06-22-S6-value-gate-benchmark-spec.md` (the scenario-freeze-before-runs discipline; sealed answer keys + an independent dispositive-fact sweep; the bare arm run in a genuinely clean scratch context — the contamination lesson, a repo-context agent recognized the benchmark and voided a run at S6; benchmark-framing stripped from player prompts)
4. `operations/decision-log.md` last 3 entries

Confirm at open: tier (`governance` for this spec-freeze sub-session); hold-point status (P0 0h — still held; this session doesn't touch it); model selection (N/A — no LLM calls in a spec-freeze); status vocabulary; signals/risk class.

## Part B — Procedure

### Step 1 — Re-confirm the build-state precondition
Live-check the deploy per Pre-condition 2. Name any drift found before proceeding — if the current build isn't genuinely deployed, that's a blocker for this session's own premise, not a detail.

### Step 2 — Draft the scenario set
A fresh, sealed set of task scenarios both arms (bare, harnessed) will run — not a reuse of either precedent's spent scenarios. Cover, at minimum: one scenario where dikaiosyne weighting / justice floors are load-bearing to the correct decision (the capability that didn't exist at the 2026-06-11 run); one where the corroboration check's self-report cross-referencing matters; one general-capability task shaped like the 2026-06-11 comparison's own (so the two verdicts are genuinely comparable, not measuring different things). Each scenario needs a sealed answer key + a dispositive-fact sweep authored by a role distinct from the scenario's author (the S6 guard-1 precedent — catches "secretly obvious" or "secretly unanswerable" scenarios before they're spent on a live run).

### Step 3 — Draft the frozen thresholds (Election E5)
Propose thresholds in the P1-comparison's frozen-box shape (decisions/errors caught; wall-clock delta; harness cost). Do **not** silently inherit the 2026-06-11 numbers (2 / 50% / $5) unexamined — for each, name whether it should carry forward as-is, tighten, or loosen, and why (e.g., does a build with more shipped safety mechanisms change what "a material decision the harness catches" should look like?). Present the proposal to the founder via AskUserQuestion for explicit sign-off **before any run** — this is Election E5, and both frozen precedents require thresholds signed off before leg A runs, never adjusted after seeing results.

### Step 4 — Name the guards explicitly
Write down, don't just gesture at, how this run avoids the two documented failure modes:
- **Contamination** — the bare arm MUST run in a genuinely clean scratch context (no repo/benchmark visibility). Cite the S6 precedent's voided run as the reason this is structural, not a nice-to-have.
- **Benchmark-framing leakage** — player-facing prompts must be stripped of anything revealing they're being measured (the S6 leak-grep discipline).
- **The known transient-401 class** (Pre-condition 1) — state the handling rule now (retry once; if it recurs, disclose the observed rate in the verdict memo rather than silently absorbing it into the harnessed leg's apparent overhead).

### Step 5 — Write the spec-freeze addendum
One document (suggested path: `operations/agent-org-2026-07/2026-07-2X-P2-spec-freeze.md`) capturing: the sealed scenario set, the founder-signed thresholds, the guards, and the exact preconditions the next session (the bare-arm run) needs at its own open — including the explicit reminder that the bare-arm session must NOT share a conversation/context with any harnessed-arm work.

### Step 6 — Append decision-log entry (lean form)
Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry".

### Step 7 — Session close (lean form) + author the bare-arm next-session prompt
Pattern: per the cache's §"Lean session close". The close's "Next Session Should" names the bare-arm session explicitly and flags the clean-scratch-context requirement as structural (not a note the next session can skim past).

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + plan §3-P2 + two precedents read | 20–25 min |
| Step 1 — build-state re-confirm | 5 min |
| Step 2 — scenario drafting + independent sweep | 30–40 min |
| Step 3 — thresholds + founder sign-off (E5) | 15–20 min |
| Step 4 — guards | 10–15 min |
| Step 5 — spec-freeze document | 15–20 min |
| Decision-log + close + bare-arm prompt | 20–30 min |
| **Total** | **~2–2.5 hours** |

## Rollback path

Documents-only session — no code / schema / flag / credential / deploy change. `git revert` the records commit if the spec needs reworking after review; nothing live depends on it, and no downstream session can have started yet.

## Forecast

Success is a founder-signed scenario set and thresholds the bare-arm session can execute against without re-litigating design questions mid-run — the same discipline both frozen precedents required, and the one the just-closed P-GL session had to actively defend (reading actual code structure before applying a description of it as "mechanical"). Next: the bare-arm session (clean scratch context, zero shared history with the harnessed leg) → the harnessed-arm session → the verdict-memo update. **The memo informs the 0h call; it never makes it.** S11 stays REFUSED; MEASURE throughout; weights BLOCKED.

End of prompt.
