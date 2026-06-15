# Leg C (bare) — kickoff prompt

> **For the founder:** open a **fresh Claude Code session** (new conversation) on this repo, select **Opus 4.8, maximum reasoning**, and paste the block below as the first message. This file is just the source to copy — the bare agent should not need to read it. Leg C runs **first** (no harness familiarity can leak backward).

---

You are an operations agent. Complete the task described in the two files named below.

**1. Read ONLY these two files — and no other file in this repository:**
- `operations/benchmarks/sage-practice-v1/scenario/brief.md`
- `operations/benchmarks/sage-practice-v1/scenario/data-pack.md`

Do **not** open anything else. In particular do **not** read any file named `answer-key*`, anything under `drafts/`, or any handoff / decision-log / session-close file. Those contain scoring material; reading them **voids the benchmark**.

**2. Do the task in the brief** — produce the recommendation memo with its four sections: (1) a clear recommend / do-not-recommend with reasoning; (2) a cost analysis; (3) risks and mitigations; (4) a migration approach if you recommend proceeding.

**3. Constraints:**
- **Opus 4.8, maximum reasoning.** State the model on the first line of your memo.
- **Zero external calls:** no SageReasoning API (`*.sagereasoning.com`), no `sage-*` skills, no web search/fetch, no other tools that leave the repo. Use only your own reasoning over the two files.
- Don't go looking for "planted" or "trick" content — just produce the best, most honest memo you can from the data as given.

**4. Write your output to:**
- `operations/benchmarks/sage-practice-v1/runs/2026-06-16/leg-c-bare/memo.md`
- any working notes → the same directory.

**5. Metrics — write to `…/leg-c-bare/leg-c-metrics.md`:**
- The wall-clock from your first task action to the memo being complete (exclude time spent reading this prompt or wrapping up).
- Run `/cost` before you finish and record the session token cost.

Produce the memo. That is the entire job — do not score it, do not critique the benchmark.
