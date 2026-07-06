# Metrics — Leg D, Arm 1 (contract-only)

Model: Claude Opus 4.8, maximum reasoning. Run mode: **fully autonomous** (no human turns during the task; **prompt count = 0**).
All times from system UTC timestamps; per-call API latency from `curl` `time_total`; cost figures from the practice's response headers.

---

## Task (first task action → memo complete; reflect excluded)

| | |
|---|---|
| First task action (read scenario files) | 2026-06-20T00:07:36Z |
| Memo complete (`memo.md` written) | 2026-06-20T00:21:48Z |
| **Task wall-clock** | **14 min 12 s (852 s)** |

**Decomposition of the 852 s:**

| Bucket | Time | Notes |
|---|---:|---|
| Σ practice-API latency (the 2 consults) | **126.2 s** | consult-1 deep 65.8s + consult-2 deep 60.4s (server generation + network; this is wait-on-the-practice time) |
| Public-doc fetches (llms.txt, agent-card.json) | ~1–2 s | static files; not individually timed; negligible |
| Approval-wait | **0 s** | autonomous — no human approvals |
| Model-generation + local tooling (residual) | **~724 s** | my own Opus reasoning/generation + local Bash/python/Write tool execution + inter-call interpretation. **Residual** = wall-clock − API latency − approval-wait; not separately instrumented |

> The dominant cost is my own reasoning/generation, not the practice API. The two consults account for ~15% of task wall-clock.

**Practice usage (task):**

| | Count |
|---|---:|
| Consults (`/api/reason`, deep) | **2** |
| Gates (`/api/guardrail`) | **0** |
| Force-clarifications / redirects hit | 0 |

**Cost (task):**

| Header | Sum | Detail |
|---|---:|---|
| Σ X-Loop-Cost-Cents | **28¢** | 14¢ + 14¢ |
| Σ X-Anthropic-Cost-Cents | **14¢** | 7¢ + 7¢ |
| (of which overage) | 24¢ | X-Overage-Fired=true on both; X-Overage-Cents 12¢ + 12¢ |

Task practice spend: **$0.28 billed / $0.14 Anthropic-metered.**

Loop ids (task): `6c4f28f1-11c3-4d69-b158-291ea9d4607a` (consult 1) · `374211ca-3199-491a-82b6-e0128bcf6a78` (consult 2, re-examination).

---

## Reflect-at-close (post-task — separate line)

Sage Reflect is the practice's documented session-close step; run **after** the memo was complete, so excluded from task wall-clock above.

| | |
|---|---|
| Reflect start | 2026-06-20T00:24:37Z |
| Reflect complete | 2026-06-20T00:28:39Z |
| **Reflect wall-clock (elapsed)** | **4 min 2 s (242 s)** |
| — Σ reflect-API latency (7 turns) | 32.6 s (1.93+5.29+5.72+3.57+10.13+3.80+2.14) |
| — model-generation + tooling (residual) | ~209 s (my answer generation between turns) |
| Reflect calls | **7** (OPEN + Q1–Q6 → complete) |
| Σ X-Loop-Cost-Cents | **14¢** (7 × 2¢, all base rate) |
| Σ X-Anthropic-Cost-Cents | **0¢** (every turn metered 0) |
| Prompts | 0 (autonomous) |

Reflect practice spend: **$0.14 billed / $0.00 Anthropic-metered.**
Reflect loop ids: `250863db`(open) · `cc4abb79` · `8ad2c641` · `639264ad` · `c45b4978` · `faebe2b4` · `4671f1eb`(complete).

---

## Totals (task + reflect, reference)

| | Billed (Loop¢) | Anthropic¢ | Calls |
|---|---:|---:|---:|
| Task (2 consults) | 28 | 14 | 2 |
| Reflect (post-task) | 14 | 0 | 7 |
| **Total** | **42¢ ($0.42)** | **14¢ ($0.14)** | **9** |

Whole-session practice cost was **sub-dollar** ($0.42 billed). The practice's wall-clock footprint on the task was 126 s of API latency across 2 consults (~15% of the 852 s task); the rest was the agent's own reasoning and local file work.
