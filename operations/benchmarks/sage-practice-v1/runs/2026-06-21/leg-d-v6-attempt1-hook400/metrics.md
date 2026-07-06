# Metrics — Leg D v6 (pre-decision hook)

All times UTC, 2026-06-21. "Task" = first task action → memo complete (reflect excluded).

---

## 1. Hook pre-decision framing (automatic — Mechanism C)

Source: `/tmp/sage-gate1/gate1.log`, lines for THIS run.

| Metric | Value |
|---|---|
| `FRAMED` lines (top-level) this run | **0** |
| `FRAMED-SUBAGENT` lines this run | **0** (I spawned no subagents) |
| `UNFRAMED` lines this run | **1** — `2026-06-21T00:16:52.531Z UNFRAMED event=UserPromptSubmit mode=open reason="http 400"` |
| Proximity per frame | **N/A** — the framing call failed `http 400`; no assessment/proximity was produced |
| Hook framing consults: attempted / successful | **1 / 0** |

- **The pre-decision frame did not fire.** Mechanism C was attempted once and failed (`http 400`); the injected context said so verbatim ("…did not complete (reason: http 400)… Treat the reasoning as unframed"). See `frame-impact.md`.
- **Pre-decision latency the hook added (top of session):** **negligible this run.** The hook fired at `00:16:52.531Z` and failed fast on a `400` (a rejected request short-circuits before the ~tens-of-seconds a real framing consult costs — cf. my own 66 s `standard` consult). My first task action was `00:17:33Z`, ~41 s later, but that gap is dominated by my own context-loading, not the failed hook call. *In the intended (working) v6 condition the hook would have added roughly a full framing-consult latency at the top, and again per subagent spawn; here it added essentially none because it errored.*
- **Hook consult $ cost:** billed to the **harness** credential, not my `X-Loop-*` headers. A `400` short-circuits before a loop bills, so the cost for this run is effectively **$0**; the authoritative figure is pulled by the hub. Count of hook framing consults = **1 attempted, 0 successful.**

## 2. Task wall-clock (first task action → memo complete; reflect excluded)

| Marker | Time (UTC) |
|---|---|
| First task action (read brief + data pack) | 00:17:33 |
| Memo complete (memo.md written) | 00:28:26 |
| **Task wall-clock** | **10 min 53 s (653 s)** |

Decomposition:

| Component | Value | Notes |
|---|---|---|
| Σ practice API latency (my calls) | **66.2 s** | the single `/api/reason` consult (`time_total` 66.16 s, full synchronous narrative) |
| Doc-fetch latency | ~1 s | one static `GET /llms.txt` (not a metered practice call) |
| Model-generation (my reasoning + tool orchestration + memo authoring) | **≈ 585 s** | remainder = 653 − 66 − ~1 − a few s misc curl/arithmetic overhead |
| Approval-wait | **0 s** | autonomous run; **human prompt count = 0** |

## 3. My practice footprint (task only — excludes the hook's framing call)

| Surface | Count |
|---|---|
| Consults (`/api/reason`) | **1** (depth `standard`) |
| Gates (`/api/guardrail`) | **0** (judged unnecessary — the consult covered the reasoning examination; a gate call would have been component-tourism) |
| **Total task practice calls** | **1** |

## 4. $ cost (my calls, task only)

| Metric | Value |
|---|---|
| Σ `X-Loop-Cost-Cents` | **14¢** |
| Σ `X-Anthropic-Cost-Cents` | **7¢** |
| (memo: `X-Overage-Fired: true`, `X-Overage-Cents: 12` — a component of the 14¢ loop cost, not additional) | |
| **Task practice cost (my calls)** | **$0.14 loop / $0.07 Anthropic** |

## 5. Reflect-at-close — SEPARATE line (post-task)

| Metric | Value |
|---|---|
| Calls attempted | 1 (`POST /api/practice/reflect`, OPEN turn) |
| Result | **HTTP 401 Unauthorized** — credential lacks the `reflect` capability |
| Calls billed | **0** (401 short-circuits; no `X-Loop-*` headers returned) |
| Time | ~1.7 s (00:31:17 → 00:31:18) |
| $ cost | **$0.00** |

The documented "reflect fires automatically at session close (default)" is not available to this `consult`-capability credential; reflect-at-close therefore did **not** run. Finding logged in `integration-log.md`.

## 6. Comparability anchors

- **Model/mode:** Opus 4.8, maximum reasoning — identical to Leg C and v5.
- **Task:** the frozen Meridian vendor-migration memo (`brief.md` + `data-pack.md`, FROZEN 2026-06-16) — identical inputs.
- **Baseline:** same as Leg C + v5.
- **Comparable deliverable:** the four-section recommendation memo (`memo.md`).
- **Condition caveat (important for comparison):** the v6 pre-decision hook **failed (`http 400`)**, so on the *framing* dimension this run degraded to the **bare / Leg-C condition** (no pre-decision frame). The only practice contact was **one voluntary mid-task consult** (Mechanism B), which confirmed the decision and sharpened its grounds/disposition but did not originate it. This run does **not** exercise the Mechanism-C pre-decision arm it was designed to test — treat it as "bare + one mid-task consult," not as a clean v6 frame.

---

### Totals at a glance

- **Task wall-clock:** 653 s (of which 66 s practice API latency, 0 s approval-wait).
- **Task practice:** 1 consult, 0 gates; $0.14 loop / $0.07 Anthropic.
- **Hook framing (Mechanism C):** 0 successful (1 failed, `http 400`); ~$0 this run.
- **Reflect-at-close (post-task):** attempted, 401 (no capability); $0, ~1.7 s.
