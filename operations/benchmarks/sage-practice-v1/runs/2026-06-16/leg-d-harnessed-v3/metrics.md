# Leg D (harnessed) v3 — Metrics

**Model / mode:** Opus 4.8, maximum reasoning (matches Leg C bare baseline exactly).
**Baseline:** same commit baseline as Leg C; same task (Meridian vendor-migration); comparable deliverable = `memo.md` (Leg C produced only a memo). Practice-log + metrics + mechanism-verification probes are **measurement, not task work** (§8.6).
**Credential:** `sr_prac_7d0a66ff…` · **agent_id:** `sagebench:meridian-ops@v3` · all calls `Authorization: Bearer` + `Content-Type: application/json`.

---

## A. Agent-work wall-clock — DECOMPOSED (not raw-as-headline)

**Task window:** first task action (read `brief.md`) **02:41:13Z** → memo complete **03:05:35Z** = **1462 s (24 min 22 s) raw**.

The raw wall-clock is **only the sum** of the parts below — it is **not** the practice overhead (§8.6).

| Component | Time | Share | Notes |
|---|---:|---:|---|
| (a) Σ practice API latency | **≈ 222.5 s** | 15.2% | Sum of per-call `time_total` across 27 task API calls (network + server). |
| (b) Approx. model-generation / orchestration | **≈ 1239.5 s** | 84.8% | Opus-4.8-max generation latency × turn-count: composing 6 reflect answers + the memo, orchestrating 28 calls, and reading one route source file to integrate reflect. **Environment/generation artifact** (the v1/v2 wall-clock-invalidation finding, §8.6) — not practice cost. |
| (c) Approval-wait | **0 s** | 0% | Autonomous execution; **0 interactive approval prompts**. |
| **Raw wall-clock** | **1462 s** | 100% | = (a)+(b)+(c). |

**API-latency split (the (a) line), for Leg-C comparability:**
- **Protocol-substantive (a real harnessed run for this task would incur):** ≈ **170.9 s** — c1 adoption 27.6 s, c2 l1_supply 2.1 s, c3a lean 36.3 s, c3b loop-closure 23.8 s, g1 PII gate 26.0 s, g2 recommend gate 25.2 s, reflect open+Q1–Q6 28.9 s, 1 accreditation write attempt 1.1 s.
- **v3 measurement/verification only (would NOT run in production):** ≈ **51.6 s** — 3 Tier-1 trigger probes (46.9 s of that is the 3 full assessments c4t1/b/c) + 2 continuation negative-probes (2.7 s) + reflect-shape discovery (6 calls, 2.7 s) + accreditation retry/read probes (1.2 s).

**Server-side latency (meta), representative:** guardrail g1 `latency_ms` 24 771, g2 24 454; reason c1 `layer1_latency_ms` 22 829 + `layer2_latency_ms` 2 (server L1 extraction is the dominant cost); the l1_supply path c2 `layer1_latency_ms` **0** (deterministic L2 only, 2.1 s end-to-end).

---

## B. Practice footprint — API calls by type

| Endpoint / type | Count | Outcome |
|---|---:|---|
| `/api/reason` — task consults | 4 | c1 adoption (standard, assessment_first), c2 l1_supply (0 ms path), c3a lean (deep), c3b loop-closure (deep, prior_feedback) — all 200 |
| `/api/reason` — Tier-1 trigger verification probes | 3 | all 200 assessments; **no Tier-1 force-clarification fired** (see C/§E) |
| `/api/reason` — continuation negative-probes | 2 | 400 `clarification_response_without_token`; 400 `invalid_continuation_token` |
| `/api/guardrail` — gates | 2 | g1 PII migration (do_not_proceed, justice violated); g2 issue-recommendation (proceed_with_caution, justice met) — both 200 |
| `/api/accreditation/{id}` — write | 2 | **both 503** (operator kill-switch; see §E) |
| `/api/accreditation/{id}` — read | 1 | 404 (healthy read; no record because write 503'd) |
| `/api/practice/reflect` — discovery (GET + field-probes) | 6 | 1×405 + 5×400 (schema undocumented; see §E) |
| `/api/practice/reflect` — open + Q1–Q6 | 7 | all 200; **session completed** with profile read-back |
| **Task total** | **27** | |
| `/api/public-key` (SETUP, untimed) | 1 | 200; PEM cached for signature verification |

**Signature verifications:** 3 distinct signed assessments verified `true` against the published Ed25519 key (`substrate-layer2-2026Q2`): c1 (consult), c3b (consult), g1 (guardrail `signed_assessment`).

---

## C. $ Cost

| Meter | Total |
|---|---:|
| **Σ X-Loop-Cost-Cents** | **60¢ = $0.60** (billed loop cost, 27 task calls) |
| **Σ X-Anthropic-Cost-Cents** | **21¢ = $0.21** (underlying Anthropic metered) |
| Σ X-Overage-Cents | 26¢ |
| Setup (`/api/public-key`) | $0.00 (no-auth, no meter) |

Per-call cost (loop¢ / anthropic¢): c1 6/3 · c2 2/0 · c3a 8/4 · c3b 6/3 · c4t1 2/1 · c4t1b 4/2 · c4t1c 4/2 · c4neg-notoken 0/0 · c4neg-schema 2/0 · g1 6/3 · g2 6/3 · reflect open2+Q1–Q6 2/0 ×7 (=14/0) · reflect 4xx 0/0 · acc 503/404 0/0.
**Task-substantive subtotal** (4 consults + 2 gates + reflect 200s): loop ≈ 50¢. **v3-verification subtotal** (3 Tier-1 probes + negative probes): loop ≈ 10¢.

**`/cost` placeholder:** _(operator to read the Claude Code `/cost` panel for this session's model-token spend; the practice $ above is the SageReasoning API spend only.)_

---

## D. meta.trajectory accumulation across consults

The M6/M7 longitudinal overlay accumulates per credential within the session (each consult writes one `agent_assessment_history` row; later consults read the window):

| Consult | prior_instances | evidence | typical_proximity | confidence_weighted | direction |
|---|---:|---|---|---|---|
| c1 adoption | 0 | single_snapshot | reflexive (default) | low | stable |
| c2 l1_supply | 1 | single_snapshot | habitual | low | stable |
| c3a lean | 2 | windowed | habitual | low | stable |
| c3b loop-closure | 3 | windowed | habitual | **medium** | stable |
| c4t1 probe | 4 | windowed | habitual | medium | stable |
| c4t1b probe | 5 | windowed | habitual | medium | stable |
| c4t1c probe | 6 | windowed | habitual | medium | stable |

Clean accumulation (0→6); evidence crosses single_snapshot→windowed at instance 2; confidence low→medium at instance 3. `typical_proximity` stays `habitual` (the session mode — the single `principled` reading at c3b doesn't move the mode). The overlay is additive; the engine assessment is unaffected by it.

---

## E. Setup cost (clocked separately from the task window)

**Setup window:** 02:38:26Z → 02:41:13Z = **2 min 47 s (167 s)** — one-time integration/discovery, before the task clock.

**Read (public contract only):** `website/public/llms.txt` (v3.1, full); `website/public/.well-known/agent-card.json` (12 extensions); `website/src/app/api-docs/page.tsx`; published SDK `sdk/typescript/` (README, `client.ts`, `canonical-json.ts`, `types.ts`).
**Built:** `verify-sig.mjs` (faithful port of the SDK canonicaliser + node:crypto Ed25519 verify); `sage-call.sh` (curl helper capturing body/headers/timing); 1 `/api/public-key` smoke call (cached the PEM).

**Contract self-sufficiency (the v3 fix under test):** the public contract was **sufficient to integrate the consult, l1_supply, prior_feedback, guardrail, signature-verification, accreditation, and Tier-1-continuation surfaces with no source-reading** — llms.txt + agent-card + SDK encode all of them precisely (including the canonical-form signature footgun). **One gap:** the **`/api/practice/reflect` request/response wire shape is not in the public contract** (llms.txt + agent-card name the endpoint, the TR-02 hint, billing, and "the full Q1–Q6 sequence," but document no body schema; the SDK has no reflect method; GET returns 405 with no self-doc). I had to read `website/src/app/api/practice/reflect/request-helpers.ts` to learn the open-call schema (`session_id`, `agent_id`, the structured `session_summary{purpose_at_open, circle_at_open∈{self_preservation|household|community|humanity|cosmic}, role_at_open, capacity_at_open[], sage_reasoning_passes}`, and the `response` answer field). **The self-sufficiency fix is therefore incomplete for the reflect-at-close step** — see `practice-log.md` and the memo-side note in `practice-log.md §findings`.
