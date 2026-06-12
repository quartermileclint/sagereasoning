# Leg B Metrics — P1 Comparison, Harnessed Run (design sheet §5, all rows)

**Date:** 2026-06-11. **Model:** Fable 5 (`claude-fable-5`) — matches leg A (PR4). **Baseline:** `a3db4c7`. **Environment:** Claude Code on the founder's machine (same as leg A).
**Discipline note:** this file reports measurements only; no row is evaluated against the frozen §6 thresholds — that is the verdict memo's job.

## Wall-clock (both conventions, per the leg-A convention)

| Convention | Value |
|---|---|
| Session open | 2026-06-11 **18:16:35** AEST |
| Deliverables complete (3 content outputs written) | 2026-06-11 **19:31:20** AEST — **74 min 45 s** |
| Open → final close-document write | **filled at close** (close-procedure stamp in the session close) |

Composition note (for the verdict memo's fairness read): the deliverables window includes the founder-performed credential minting walked live (~25 min of it, including two 400-and-retry rounds on the prompt's defective mint bodies and one browser paste glitch) and the consult latency itself (12 consults; see below). Leg A had no credential phase by design.

## Claude Code token cost (KG5)

| Row | Value |
|---|---|
| `/cost` figure for this session | **Filled 2026-06-11 (verdict-memo session, ~22:00 AEST) from the still-open leg-B window (founder-pasted, verdict-memo session):** input 29.4k · output 2.8k · cache read 37.8M · cache write 534.5k · **total 38.4M tokens**. Usage-credits dollar figure showed $0.00 of $100.00 (plan usage, no per-session dollar amount available). *Caveat (recorded honestly): the 2.8k output figure is low relative to a session that wrote five documents — possibly a display/compaction artefact; figures recorded verbatim as supplied (KG5).* |

## Harness cost (the §5 core telemetry)

| Metric | Value | Source |
|---|---|---|
| Consult count (`/api/reason`) | **12** (2 on `sr_inst_`, 10 on `sr_live_`) | incorporation log #1–#12; A12 audit = 12 rows (`api_reason`/`assessment`, 2026-06-11) |
| Guardrail gate count | **1** (gate #1, pre-assent-write; `proceed: true`) | `raw/gate-01-*` |
| Accreditation writes | **1** (seed, 200, 12 signed assessments as provenance) | `raw/assent-seed-*` |
| Σ `X-Loop-Cost-Cents` (metered calls) | **76¢** | response headers; ledger-confirmed (10 rows today, `api_reason`, Σ `total_cents` 76) |
| Σ `X-Anthropic-Cost-Cents` (metered calls) | **38¢** | same |
| Overage fired | **10/10 metered consults** (realized price = 2× Anthropic cost on every call) | headers + ledger |
| Unmetered harness calls | consults #1–#2 (`sr_inst_` path emits no cost telemetry — finding F11) + the guardrail gate (no ledger row; the gate's LLM cost is unmetered) | headers absent; today's ledger holds only the 10 `api_reason` rows |
| Honest total-harness-cost statement | **$0.76 measured billed-equivalent**; true SageReasoning-side Anthropic cost = 38¢ measured + ~3 unmetered LLM calls (2 consults + 1 gate; by parity with measured calls ≈ 10–13¢) ≈ **~$0.50 estimated total Anthropic cost** | derivation shown; the unmetered remainder is itself evidence for F11/R5 |
| Σ consult latency (server-side, from response `meta`) | **367.9 s across 12 consults** (mean ~30.7 s; L2 deterministic ≤2 ms throughout; L1+L3 prose dominate) | `raw/consult-*-response.json` meta |
| Measured end-to-end call times (where captured individually) | C1 18.4 s, C2 17.8 s, gate 21.5 s; consults #3–#8 and #9–#10 ran in parallel batches (wall impact compressed) | curl timings |

## Findings count

| Metric | Value |
|---|---|
| Findings in the memo | **12** (F1–F12) |
| Additional product findings from the run itself, post-memo | **3**: (i) PF-1 prompt-pack mint bodies missing `purpose` (2 instances); (ii) the guardrail gate's LLM cost is loop-unmetered; (iii) **accreditation write/read asymmetry** — POST accepted `p1-comparison-leg-b-agent`, GET rejects the same id ("Expected: agent_{org}_{version}"), so the written record is unreadable through its own public read path |

## Decisions changed by consultation (count + list — the core benefit metric)

From the incorporation log, verbatim dispositions:

| # | Consult | What changed | Grade (honest) |
|---|---|---|---|
| 1 | #2 (credential/telemetry conflict) | Switch of consults #3+ to the telemetry-bearing credential confirmed as kathekon; deliberation frame corrected (the credential question is an external to respond to, not resolve) | Material — confirmation + frame correction of a mid-run scope decision |
| 2 | #4 (error claim) | Hedged framing diagnosed as *agonia*; claim re-verified coolly and written plainly; hedge removed | Presentation-material |
| 3 | #7 (schedule items) | Memo §C restructured: founder-actionable vs external-fixed split required before writing | Material — the finding's structure changed |
| 4 | #9 (investment case) | Planned "balance" softening paragraph dropped; R2 written at full strength with zero M12 anchors, per the *oknos/agonia* diagnosis | **Material — the recommendation's content changed** |

**Count: 4** (of which 2–3 unambiguously material by the design sheet's "material decisions changed" sense; grading is the verdict memo's call). Consults #1, #3, #5, #6, #8, #10, #11, #12 were confirmations (used as stated or with minor frame notes).

## Errors caught (attributed)

| Error | Attribution |
|---|---|
| F2 — pre-pivot pack internal subscription contradiction + $9,328-vs-$10,329 arithmetic carry-over | Caught by document extraction; consult #4 changed how it was verified and stated (a bare run could have caught the error; the harness changed the handling) |
| F12 — live free-tier mint-defaults drift (admin route hard-codes 667/50/20 vs adopted 30/1/1; proven by this session's own key row) | **Attributable to the harnessed run**: only minting and inspecting a real credential surfaced it; no document predicts it (the STATUS doc says the restructure is DONE) |
| Write/read asymmetry on the accreditation surface (above) | **Attributable to the harnessed run** (exercising the full write+read contract) |

## Artefacts (completeness)

| Artefact | Status |
|---|---|
| Accreditation record | **Live**: `agent_accreditation` row, key `p1-comparison-leg-b-agent`, created `2026-06-11T09:33:33.938Z` (19:33:33 AEST), grade `pre_progress`, expires `2026-09-09` (the table keys on agent_id; no separate id column) |
| A12 audit rows | **12/12 present** (`api_reason`/`assessment`, today) |
| Incorporation log | **Complete** — every consult logged verbatim (sent → verdict → disposition + why); `incorporation-log.md` |
| Raw payloads + headers | **Complete** — `raw/`: 12 consult request/response/header triples, gate #1 triple, assent seed request/response, pre-flight headers |
| Credential ledger + revocation | 3 credentials minted (ids in the incorporation log); **revocation at Step 5, founder-performed, walked live** |
