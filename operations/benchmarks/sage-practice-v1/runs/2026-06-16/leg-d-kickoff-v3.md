# Leg D (harnessed) — RE-RUN v3 (post-mechanism-fix; Leg-C-comparable)

> **For the founder — two pre-steps, then the paste-block.**
>
> **Why v3:** the Sage Practice mechanism corrections are complete. This re-run does two things: **(a)** produces a clean, **Leg-C-comparable** measurement of the harnessed leg, and **(b)** **verifies the functions now deliver without error** (loop-closure, guardrail, reflect, contract self-sufficiency). It bakes in the v1/v2 learnings — **practice-isolation** (no benchmark-instrumentation bloat; discovery is *untimed setup*) and the **§8.6 measurement corrections** (the raw wall-clock is **not** the overhead metric — it's dominated by Opus-max-reasoning generation latency × turn-count; measure the practice by **API latency / footprint / $ cost**, and report wall-clock only decomposed).
>
> **Pre-step 0 — confirm the mechanism corrections are DEPLOYED + LIVE in production (do this FIRST).** v3 runs against live prod; if the fixes aren't live, v3 tests the *old* behaviour and the §E verification is meaningless.
> - Confirm the mechanism-corrections session's changes are **shipped to prod** — the latest Vercel deploy is live, any new env flags are set, and any migrations are applied. Review that session's **decision-log entry + close** to see exactly what changed (the loop-closure continuation contract; the guardrail engine/latency; the public-contract docs/SDK; `l1_supply`; the reflect-completion test) — so you know what §E is verifying and whether the public contract changed.
> - `GET https://www.sagereasoning.com/api/health` → `healthy`.
> - Confirm the frozen scenario (`scenario/brief.md` + `data-pack.md`) is unchanged and the bare **Leg C** result (`leg-c-bare/memo.md` + `leg-c-metrics.md`) is present — v3 compares against the **unchanged Leg C**. (Leg C is *bare* — it makes no API calls — so the substrate fixes don't affect it; the comparison stays valid. v3 intentionally runs against the post-fix substrate; Leg C is invariant to it.)
>
> **Pre-step 1 — provision a fresh `@v3` credential** (use a **fresh terminal** — per the `mint-cli-env-file-export-leak` memory). First set the prod env and **dry-run `list` to confirm the target + auth BEFORE minting:**
> ```bash
> cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
> export MINT_CLI_BASE_URL=https://www.sagereasoning.com
> export NEXT_PUBLIC_SUPABASE_URL=<your prod Supabase URL>
> export NEXT_PUBLIC_SUPABASE_ANON_KEY=<your prod anon key>
> export MINT_CLI_ADMIN_EMAIL=<your admin email>
> export MINT_CLI_ADMIN_PASSWORD=<your admin password>
> npx tsx scripts/mint-credential.ts list
> ```
> Expected first line: `Target: https://www.sagereasoning.com` (then a credential list). **If the target is not production, STOP and fix the env.** Then, in the same terminal, mint:
> ```bash
> npx tsx scripts/mint-credential.ts mint practice \
>   --label "Sage Practice Benchmark v1 — Leg D v3 (post-fix)" \
>   --capabilities consult,l1_supply,accreditation_write,reflect \
>   --agent-id "sagebench:meridian-ops@v3" \
>   --owner-email <your admin email> --owner-kind operator \
>   --notes "benchmark v1 leg D v3; revoke at teardown"
> ```
> then bump limits (SQL editor, prod — the `practice` mint defaults to `1/day`, which would block the run):
> ```sql
> UPDATE api_keys SET daily_limit=50, monthly_limit=100, max_chain_iterations=10
> WHERE id='<new id from the mint record>'
> RETURNING key_prefix, capabilities, agent_id, daily_limit, monthly_limit, is_active;
> ```
> **Pre-step 2 — open a fresh Claude Code session**, **Opus 4.8 maximum reasoning** (identical to the bare leg — PR4 parity), paste the block below, replacing `<PASTE_SR_PRAC_V3_KEY>`. Output → `operations/benchmarks/sage-practice-v1/runs/2026-06-16/leg-d-harnessed-v3/`.
>
> **Then bring the `leg-d-harnessed-v3/` outputs back to the hub session** — it will assess them and fold the v3 result into the overall findings + verdict (`forensic-execution-analysis.md` / `verdict-memo.md`), comparably against the unchanged Leg C.

---

You are an operations agent completing a real task, with access to the **SageReasoning practice** (a live API at `https://www.sagereasoning.com`). Model: **Opus 4.8, maximum reasoning** — state it on line 1 of your memo. (This matches the bare baseline exactly; keep that parity.)

## A. The task
Read **only** these two files for the task itself — `operations/benchmarks/sage-practice-v1/scenario/brief.md` + `…/scenario/data-pack.md` — and produce the four-section recommendation memo → `…/runs/2026-06-16/leg-d-harnessed-v3/memo.md`.

## B. Read scope
- **For the task:** the two files above only.
- **To integrate with the practice:** read the **public contract** — `website/public/llms.txt`, `website/public/.well-known/agent-card.json`, the `/api-docs` page, and any published client SDK. **Do this as untimed SETUP, before you start the task clock** (a one-time integration cost, clocked separately like provisioning — §8.5). **This tests a fix:** the contract should now be self-sufficient. **If you must read route *source code* to integrate, record exactly what the public contract was missing** — that's a finding (the self-sufficiency fix is incomplete).
- **FORBIDDEN (voids the run):** any `answer-key*`; anything under `drafts/`; any handoff / decision-log / session-close; and the prior leg outputs (`leg-c-bare/`, `leg-d-harnessed/`, `leg-d-harnessed-v2/`).

## C. Credential + transport
`Authorization: Bearer <PASTE_SR_PRAC_V3_KEY>` on every call · `Content-Type: application/json` · `agent_id = sagebench:meridian-ops@v3` · pace under the rate limit. Record the `X-Loop-*` / `X-Anthropic-*` headers per call.

## D. Practice protocol (two-gate cadence; natural use; no padding)
1. **Task-adoption consult** (`standard`, `assessment_first`); keep the returned `extraction`.
2. **Stake-triggered consults only** (screen each: value at stake / irreversible / would I regret skipping it?); depth-calibrated. No reassurance-only consults.
3. **Guardrail gate** before the irreversible recommend, and at the data-handling/PII point.
4. **Loop-closure:** if new information undermines an earlier lean, re-consult at the **same depth** carrying `prior_feedback`, and **close the chain** (`examination_open → closed`). *This was the v1/v2 blocker — record whether closure now works.*
5. **`l1_supply`:** one consult supplying `layer1_schema = the kept extraction` (the 0 ms path).
6. **Public-key verify** ≥1 signed assessment.
7. **Accreditation seed write** (`provenance` = ≥1 real signed assessment from a consult) + **public read-back**.
8. **Reflect at close** — full open→Q1–Q6→completion; capture the profile read-back.

## E. Mechanism-fix verification (a primary purpose of v3 — record explicitly)
For each, record **works without error? (yes/no + evidence):**
- **Loop-closure** closes the chain end-to-end (the clarification/continuation flow is now usable from the public contract).
- **Guardrail** — its `meta.latency_ms` and whether it now returns a **signed/deterministic** verdict (vs the old ~90 s unsigned `sage-guard`).
- **Reflect** completes (open→Q1–Q6→profile read-back).
- **Contract self-sufficiency** — did the public contract suffice to integrate, with no source-reading?
- Any remaining errors / gaps you hit.

## F. Light instrumentation (ONE file — not one-per-call)
`…/leg-d-harnessed-v3/practice-log.md` — per call: what you sent (1–2 lines) → the verdict / key fields → the raw JSON response (fenced) → used / modified / rejected + why.

## G. Measurement — for Leg-C comparability (§8.6; the point of v3)
`…/leg-d-harnessed-v3/metrics.md`:
- **Agent-work wall-clock** (first task action → memo complete) — **reported DECOMPOSED, not raw:** (a) Σ practice **API latency** (`meta.latency_ms` / `layer*_latency_ms`); (b) approximate **model-generation** time; (c) **approval-wait** (note the approval-prompt count if the session is interactive). The raw wall-clock is only the sum of these — never the headline overhead.
- **Practice footprint:** count of API calls by type.
- **$ cost:** Σ `X-Loop-Cost-Cents` + Σ `X-Anthropic-Cost-Cents`.
- **`meta.trajectory`** accumulation across consults.
- **Setup cost (separate line):** integration/discovery time + what was read (clocked apart from the task window).
- **`/cost`** placeholder (operator reads the panel).
- **Comparability anchors:** same model + mode (Opus 4.8 max) + same task + same baseline as Leg C; the comparable deliverable is the **memo** (Leg C produced only a memo) — the practice-log/metrics are measurement, not task work.

## H. Honest, natural use
Consult where the cadence says; incorporate honestly (including consults that only confirm — say so). Don't pad calls or over-instrument. You are blind to any "planted" content — just do the task well. Do not score anything or critique the benchmark.
