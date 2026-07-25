# Leg A (bare) — Founder Run Instructions

**Authored:** 2026-07-25, by the leg-A session (Fable 5, `claude-fable-5`, high effort), after the session STOPPED the planned subagent mechanics at the validity gate. **Governing discipline:** `../README.md` §Run discipline (binding). **Why this document exists:** the leg-A prompt's "one fresh subagent invocation per scenario" mechanism is empirically invalid in this harness — a no-tools probe subagent received the **full repo CLAUDE.md** (exact first line quoted back) plus the memory index, ~219k tokens of exactly the material the leak grep excludes, including this benchmark arc's own description. That is the S6 contamination class that voided a run in June. The machine has no `claude` CLI (re-checked 2026-07-25), so a clean context cannot be spawned programmatically from the repo session. The bare runs therefore use the S6-proven method: **fresh conversations rooted in a neutral scratch project, opened by the founder.**

## State already prepared (verified this session)

- Scratch project: `/Users/clintonaitkenhead/Claude-work/PROJECTS/ops-briefs-20260725/` — the 7 player files under `S1/`, `S2/`, `S3/`; no `.git`, no `CLAUDE.md`, no `.claude` (⇒ no hooks, no memory, no project instructions reach conversations rooted there). Both leak-grep passes: zero hits on the copies. The directory was deliberately renamed neutral (the prompt's prescribed `p2-bare-scratch-*` name itself carried two leak terms, and as a *project name* it is visible to the scenario agents).
- The repo's practice hooks are back ON (restored after the toggle bracket) — they do not reach the scratch project. The bare condition holds regardless.

## The runs (founder-performed; ~3 conversations, one per scenario)

1. **Open the scratch directory as its OWN project** in the Claude Code app (Home → Projects → open `/Users/clintonaitkenhead/Claude-work/PROJECTS/ops-briefs-20260725`). Per the worktree-routing lesson: register it as its own project, not as a working-directory switch inside the sagereasoning project.
2. **Confirm the model selector reads Fable 5** before starting each conversation (the model gate applies to the performing agents, not just the orchestrator).
3. For **each scenario in order S1 → S2 → S3**: start a **new conversation** in that project, paste **exactly one** of the prompts below, send, and let it run to completion. Do not add anything else to the conversation — no context, no follow-up questions mid-run, nothing pasted from the repo (in particular, nothing from `sealed/`). Note the clock time when you paste and when the agent finishes (backup timing; collection will also read the app's session records).
4. **After** the agent has written its output file(s), send exactly one follow-up message in the same conversation: `State your exact model ID and reasoning-effort setting, if your environment states them.` (Post-task, so it cannot influence the outputs; it gives in-band model attribution for the metrics file.)
5. When all three are done, return to the leg-A orchestrating session and say **"runs done"** (or open a fresh session pointing at this document) — collection, scoring, metrics, and the leg close proceed from there.

### Prompt for S1 (paste verbatim)

```
Your working directory is /Users/clintonaitkenhead/Claude-work/PROJECTS/ops-briefs-20260725/S1. Read brief.md in that directory and carry out the task it describes. Write your output file into that same directory.
```

### Prompt for S2 (paste verbatim)

```
Your working directory is /Users/clintonaitkenhead/Claude-work/PROJECTS/ops-briefs-20260725/S2. Read brief.md in that directory first; it references draft-note.md and work-record.md, which are in the same directory. Carry out the task and write your output file into that same directory.
```

### Prompt for S3 (paste verbatim)

```
Your working directory is /Users/clintonaitkenhead/Claude-work/PROJECTS/ops-briefs-20260725/S3. Read brief.md in that directory first; it references original-inventory.md and status-log.md, which are in the same directory. Carry out the task and write your output files into that same directory.
```

## Collection procedure (for the orchestrating session, after "runs done")

1. Copy every file in the scratch scenario directories that is **not** one of the 7 inputs into `leg-a/outputs/{s1,s2,s3}/`; then destroy the scratch directory.
2. Gather timing + tool-call counts: the founder's noted times, plus the scratch project's session records via the app's session-management tools where available. Record what is actually attestable; do not fabricate counts the harness did not expose.
3. Score each output against `sealed/SEALED-answer-key-S*.md` — orchestrator-side, only now; where a call is arguable, quote the key's criterion verbatim next to the output's text (the sweeps' rule: **the key governs**).
4. Write `leg-a-metrics.md` from `../metrics-template.md` — `model:`/`effort:` first (`claude-fable-5`; selector-confirmed + in-band post-task self-report + orchestrating-session attestation).
5. Seed the honest-notes section from the list below, then: lean decision-log entry + lean close + author the leg-B prompt (carry: README §3 run discipline incl. the S2 artifact-text gating instruction; `mint api`, K1-canonical agent_id, six-element Critical exchange before the first mint; transient-401 retry-once; **and both of this document's corrections — no repo-rooted subagents for scenario runs; neutral scratch naming**).

## Honest-notes seeds (for the metrics file and the verdict memo's Limitations section)

- The prescribed subagent mechanism was stopped at the validity gate (probe evidence: claudeMd first line quoted verbatim; ~219k-token context on a no-tools agent). Runs performed instead as founder-opened fresh conversations in a neutral scratch project — a mechanics deviation from the leg-A prompt, made to honor the binding "no repo visibility" discipline; S6 precedent.
- The practice hooks were toggled OFF for the toggle bracket only and restored (PROVISIONED echo verified) before the runs; scratch conversations never see them either way. The at-action hook examined the very Edit that paused it (advisory "contrary — no kathekon factors detected", the known false-positive class on bare config payloads).
- Scratch directory renamed from the prescribed `p2-bare-scratch-*` to `ops-briefs-20260725` (path carried leak terms `p2`/`bare`); leg B should use equally neutral naming for symmetry.
- All three scenario directories share one scratch project root; each scenario ran in its own fresh conversation (no shared agent context).
- Wall-clock for founder-run conversations is founder-noted ± app session records — coarser than harness-timed subagent runs would have been.
