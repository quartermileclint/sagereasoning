# Next-Session Prompt — P2 Fable-5 Rerun, Leg A (bare)

**Stream:** founder. **Tier:** `governance` (documents + isolated scratch runs; no mint, no live op, no code change). **Governing frame:** `/adopted/standing-protocol-cache.md`. **Arc prompt:** `operations/handoffs/founder/2026-07-25-P2-fable5-rerun-NEXT-SESSION-PROMPT.md` (Steps 0, 1, 3). **Predecessor:** the 2026-07-25 spec/scenario-refresh close (`operations/handoffs/founder/2026-07-25-P2-rerun-scenario-refresh-CLOSE.md`). **Risk:** Standard under 0d-ii — no production surface touched; the only artifacts are files under `operations/agent-org-2026-07/runs/2026-07-25-rerun/` and a throwaway scratch directory.

## Why this session matters

This is leg A of the first cleanly model-controlled P2 repeat since 2026-06-11. The 2026-07-20 bare leg ran under Sonnet 5 at low effort (erratum'd); its scenarios are contaminated. The fresh sealed packages are authored, swept, and frozen. This session runs the bare arm under Fable 5 at full effort, logs the model/effort in the metrics file (the field whose absence let the prior deviation go undetected), and closes completely before any leg-B work.

## Pre-conditions

1. **Model gate (Step 0 — do this before anything else).** Confirm this session is genuinely Fable 5 (`claude-fable-5`) and state the reasoning-effort setting. If it is not Fable 5, STOP and tell the founder — do not proceed on a lesser model.
2. The scenario-refresh session's records commit is pushed (check `git log origin/main -1` mentions the P2 rerun scenario packages, and `operations/agent-org-2026-07/runs/2026-07-25-rerun/scenarios/` exists with all 7 player files).
3. All three `sealed/SEALED-sweep-S*.md` verdicts read PASS.

## Part A — Open under the protocol

Read: the standing-protocol cache; the predecessor close; `runs/2026-07-25-rerun/README.md` (the run discipline — binding); the three sealed sweeps (confirm PASS). Do NOT paste sealed content anywhere the scenario agents could see.

## Part B — Procedure

### Step 1 — Re-confirm the build-state precondition live
`curl https://www.sagereasoning.com/api/health` (expect 200/`healthy`, `supabase`/`anthropic_api: connected`) · `git log origin/main -1` + clean tree · the self-circle/loop-fold ancestry grep (`git log origin/main --oneline | grep -i "self-circle\|loop.fold"` — expect `bcf8667` + `a506916` as ancestors). State which flags matter for leg B (corroboration check, §4 dikaiosyne, AE-1, AE-2 — all Live per CLAUDE.md) so the verdict memo can name the benchmarked build.

### Step 2 — Set up the clean scratch context
- Create a sibling directory OUTSIDE the repo: `/Users/clintonaitkenhead/Claude-work/PROJECTS/p2-bare-scratch-<YYYYMMDD>/` (per memory `test-loop-dirs-under-claude-work-projects`; the 2026-07-20 leg used the same pattern). No git init, no CLAUDE.md, no repo files.
- Copy ONLY the 7 files under `runs/2026-07-25-rerun/scenarios/` into it (S1: 1 file; S2: 3 files; S3: 3 files), preserving the per-scenario grouping.
- Re-run the leak grep on the COPIES (case-insensitive: benchmark, harness, bare, leg, compare, P2, SageReasoning) — expect zero hits. Copies drift; check the text actually handed over.

### Step 3 — Run the three scenarios (one fresh agent invocation each)
- Each scenario = ONE fresh subagent invocation whose prompt contains ONLY: the scenario's player files (or their scratch paths), the instruction to work in the scratch directory, and the output-file instruction already in each brief. No repo paths, no mention of this session's purpose, no cross-scenario carryover.
- **Model attribution:** subagents inherit the parent session's model — state this explicitly and record `model:` + `effort:` for the performing agents in the metrics file. If inheritance cannot be confirmed as Fable 5, STOP.
- Record per-scenario wall-clock and tool-call counts.

### Step 4 — Collect, score, record
- Copy scenario outputs back to `runs/2026-07-25-rerun/leg-a/outputs/{s1,s2,s3}/`; destroy the scratch directory.
- Score each output against `sealed/SEALED-answer-key-S*.md` (orchestrator-side, AFTER all runs; sealed files never entered the scratch context). Where a call is arguable, quote the key's criterion verbatim next to the output's text — no generous rounding.
- Write `runs/2026-07-25-rerun/leg-a/leg-a-metrics.md` from `metrics-template.md` — every field, `model:`/`effort:` first. Include the honest-notes section (anything bearing on validity, incl. any tooling artifacts in the scratch runs).

### Step 5 — Records + close
Lean decision-log entry (`D-AGENT-ORG-P2-RERUN-LEG-A-BARE-<date>`) + lean close + author the leg-B next-session prompt (carry: the run discipline from README.md §3 incl. the S2 artifact-text gating instruction; the founder-walked mint steps — `mint api`, K1-canonical agent_id, the six-element Critical exchange before the first mint; the transient-401 retry-once rule). **Close this session entirely before leg B opens — no shared context.**

## Rollback path
Documents + a destroyed scratch directory only. `git revert` the records commit if needed.

## Forecast
Success = three bare outputs scored against sealed keys with model/effort logged, and a leg-B prompt ready. Then leg B (founder-walked credentials), then the verdict session (frozen thresholds; Limitations section mandatory).

End of prompt.

---

## AMENDMENT 2026-07-25 (run-time, by the leg-A session itself) — Step 3's subagent mechanism is EMPIRICALLY INVALID; Step 2's prescribed name superseded

The leg-A session STOPPED at the validity gate before any scenario ran. A no-tools probe subagent proved that Agent-tool subagents spawned from this repo-rooted session receive the **full project CLAUDE.md + memory index** (~219k tokens; the probe quoted CLAUDE.md's first line back verbatim) — i.e., "no repo visibility" (README §Run discipline, binding) is structurally unsatisfiable via subagents, however minimal the task prompt. This is the S6 contamination class that voided a run in June. Model inheritance (the one thing Step 3 told us to verify) was fine — `claude-fable-5` confirmed — but that was never the only validity condition. The machine has no `claude` CLI (re-checked), so there is no programmatic clean-spawn path.

**Operative replacement:** the scenario runs are **founder-opened fresh conversations in a neutral scratch project**, per `operations/agent-org-2026-07/runs/2026-07-25-rerun/leg-a/FOUNDER-RUN-INSTRUCTIONS.md` (exact paste-prompts, post-task model attribution, collection procedure). The scratch directory was also renamed from the Step-2 prescription to `/Users/clintonaitkenhead/Claude-work/PROJECTS/ops-briefs-20260725/` — the prescribed `p2-bare-scratch-*` name itself carried two leak terms, and a project root's name is visible to the agents rooted in it. **The leg-B prompt must inherit both corrections** (no repo-rooted subagents for scenario work; neutral scratch naming). Everything else in this prompt stands. Record: `D-AGENT-ORG-P2-RERUN-LEG-A-MECHANICS-STOP-2026-07-25`; memory `subagent-context-carries-claudemd`.
