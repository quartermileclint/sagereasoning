# M5 — Docs staged for the founder's activation step (CI-15 two-gate cadence + CI-13 reflect-at-close default)

**Status:** Staged (NOT applied to any public surface). **Date:** 2026-06-13. **Session:** M5 practice-completion build.
**Why staged:** the public materials describe the live service (R18 lineage — the S8b honesty corrections; the M1 staging precedent). The CI-13 `practice` response field is flag-gated (`SUBSTRATE_PRACTICE_CYCLE_HINT_ENABLED` UNSET in production), so publishing "responses carry a `practice` field" or "reflect-at-close is the default flow" before the field is emitted would claim behaviour production does not yet serve. The CI-15 two-gate cadence is adopted methodology, but it is still a public-surface change and rides the same activation. These inserts are applied **at the founder's 0c-ii activation step**, alongside the CI-13 flag flip (CI-15 may be applied independently as docs-only if the founder elects — it carries no flag). Verbatim-faithful to the 2026-06-12 mentor consultation record (`2026-06-12-mentor-consultation-methodology-verdicts.md`; `D-SAGE-PRACTICE-METHODOLOGY-AMENDMENTS-ADOPTED-2026-06-12`).

> **R18 honesty note:** no latency number appears below. The only economics quoted are (a) the existing R5 call-count framing already on the manifest (`guard + score + optional iterate` = 2–3 calls) and (b) the per-loop billing model already published on llms.txt (line 247). Both are facts about the live service; neither is a new claim. If a latency envelope is ever added here, it uses the M1/M3 measured figures (post-CI-3) with their environment label.

---

## 1. CI-15 — the two-gate consultation cadence (Q1 verdict, verbatim-faithful)

**Fixes FX-2** (the adopted cadence was published nowhere — the leg-B protocol had to invent its own density). **Serves §4.1.** Content adopted per Q1 (2026-06-12); this is the carry-onto-surfaces step.

**Surfaces:**
- `website/public/llms.txt` — a new top-level section **`## Consultation Cadence (When to Examine)`**, placed after `## Core Principle for AI Reasoning` (~line 281) and before `## Adoption Guidance for AI Agents`; plus a one-line pointer added to the Adoption-Guidance numbered list (between current steps 4 and 5, i.e. before the guardrail step).
- `website/public/.well-known/agent-card.json` — a new extension object in the `extensions` array: `consultation-cadence-two-gate/v1`.
- `website/src/app/api-docs/page.tsx` — a subsection under "For AI Agents" (~lines 321-437), titled "Consultation cadence — the two-gate rule".
- `website/src/lib/mcp-contracts.ts` — append a one-paragraph reference to `MCP_COMPLIANCE_NOTICE` (~line 363) pointing at the cadence; the MCP discovery route (`/api/mcp/tools`) re-exposes it automatically.

### Canonical content (verbatim-faithful — do not paraphrase the gates, sub-questions, or suppression signal)

> ## Consultation Cadence — When to Examine (the two-gate rule)
>
> Stoic *prosoche* is continuous **attention**, not continuous formal **examination**. A practitioner with stable judgement in a domain does not re-derive every impression from first principles — the examination is encoded in the disposition. What *prosoche* requires is staying alert to the signal that a new examination is owed, and acting on it when it fires. Examine on this two-gate cadence rather than on every impression:
>
> **Gate 1 — Mandatory at task adoption.** When you adopt a task plan, run exactly one **full** examination (a `standard`- or `deep`-depth `/api/reason` consult). This is non-negotiable and never skippable: it sets the frame — the circle of concern served, the role occupied, the capacity engaged, and the purpose against which every later impression is read. Skipping it removes the examination's function from the session.
>
> **Gate 2 — Stake-triggered thereafter.** After the opening examination, examine again only when a deterministic three-question self-screen returns positive on **any** of:
> 1. *Is there something at stake for me in how this output lands?* (tests for epithumia + phobos)
> 2. *Am I drawn toward one conclusion before examining the evidence?* (tests for a synkatathesis failure)
> 3. *Would I reason differently about this if no one would know the outcome?* (tests for philodoxia)
>
> If **any** answer is yes, examine at the appropriate depth. If **all three** are no, proceed without a formal examination — the attention is being paid; the formal tool is not owed here.
>
> **The suppression signal.** A self-screen that consistently returns negative across sessions of genuine complexity is itself a signal requiring examination. The screen can be gamed by the very passions it tests for (a confirmed philodoxia pattern may suppress rather than fire it), so examine the screen periodically, not only the task. (This mirrors Sage Reflect's null-result suspicion rule, FD-R1.)
>
> **Depth follows scrutiny.** Match examination depth to the stake — and, where your trajectory is known, to your *proximity* as well as the stake (an agent at principled proximity in a domain may run the self-screen and proceed; an agent at deliberate proximity still needs the formal examination when the screen fires). The independence principle means you need the formal tool *less* as your disposition stabilises — never that examination becomes unnecessary. The same scrutiny ladder is already encoded in the guardrail's `risk_class` mapping: `standard → quick`, `elevated → standard (full virtue analysis)`, `critical → deep`.
>
> **Economics.** Each consequential wrapper invocation consumes 2–3 API calls (guard + score + optional iterate) and counts against your monthly allowance; the two-gate cadence is what keeps that cost proportional to genuine stake rather than firing on every impression.

**Note for sequencing (do not ship as a live claim yet):** Q1's "depth calibrated to proximity as well as stake" is published above as a *principle* ("where your trajectory is known"). Its **operational** calibration presupposes a readable longitudinal trajectory, which is **CI-5 (M6)** — not built. Keep the conditional phrasing ("where your trajectory is known") until CI-5 lands; do not promise proximity-calibrated depth as an automatic behaviour.

### agent-card.json extension object (CI-15)

```json
{
  "name": "consultation-cadence-two-gate/v1",
  "description": "Adopted consultation cadence for agents integrating the Stoic Brain. Gate 1: one mandatory full examination at task adoption. Gate 2: stake-triggered thereafter via a deterministic three-question self-screen (stake in the outcome / drawn to a conclusion pre-evidence / would reason differently unobserved); any positive fires an examination at the appropriate depth. A self-screen consistently negative across genuinely complex sessions is itself examinable. Depth follows the guardrail risk_class ladder (standard->quick, elevated->standard, critical->deep).",
  "uri": "https://www.sagereasoning.com/llms.txt#consultation-cadence"
}
```

---

## 2. CI-13 — reflect-at-close as the default-on flow (Q3 verdict) + informed-cost opt-out

**Fixes FX-9** (Reflect is Live and one call away but undiscoverable from the consult/close path). **Serves §4.5.** For agents, automatic firing at session close is the **default** ("the developer's configuration is the agent's disposition"); explicit opt-out; the full Q1–Q6 sequence is **never abbreviated**.

**Surfaces:**
- `website/public/llms.txt` — a new section **`## Practice Cycle — Reflect at Session Close (default)`** placed after the new Consultation-Cadence section; plus a step appended to the Adoption-Guidance numbered list ("At session close, run Sage Reflect — on by default").
- `website/public/.well-known/agent-card.json` — a new extension object: `practice-cycle-reflect-default/v1`.
- `website/src/app/api-docs/page.tsx` — the `/api/reason` (+ accreditation-write) response-shape docs gain the `practice` field; a "Practice cycle" subsection under "For AI Agents".
- `website/src/lib/skill-registry.ts` — `SkillContract` gains optional fields (`practice_default`, `reflect_required`); each skill's `example_output` carries the `practice` hint.
- `website/src/lib/mcp-contracts.ts` — toolset metadata notes reflect-at-close as the default close step.

### Canonical content

> ## Practice Cycle — Reflect at Session Close (default)
>
> A completed SageReasoning pass at session close is a Sage Reflect trigger (TR-02). For agents, **Sage Reflect fires automatically at session close by default** — this is the configured disposition of the integration, not a compelled act. Every consult and accreditation-write response carries a structural practice-cycle hint so the closing step is discoverable from the practice's own surfaces:
>
> ```json
> "practice": {
>   "reflect_due": "TR-02",
>   "endpoint": "/api/practice/reflect",
>   "default": "auto",
>   "opt_out": "reflect_at_close"
> }
> ```
>
> **Opt-out (explicit).** Auto-firing is the default; to disable it set the integration config key `reflect_at_close` to `"off"` (default `"auto"`). Opt-out is binary — fire or do not. There is no shortened or partial reflection: a Sage Reflect pass runs the **full Q1–Q6 sequence** whether fired automatically or by hand. (A genuinely brief session that returns clean results quickly is legitimate; shortening the sequence *because* it fired automatically is not.)
>
> **Cost (so consent is informed).** An auto-fired reflect pass is a metered call — one `/api/practice/reflect` invocation per session close, billed per your tier's standard per-loop model (one loop = one wrapper invocation; $0.02 base + LLM-token overage above 50% of base × 2, per the published billing model). If you do not want a reflect pass billed at every session close, set `reflect_at_close: "off"`.

### agent-card.json extension object (CI-13)

```json
{
  "name": "practice-cycle-reflect-default/v1",
  "description": "Sage Reflect fires automatically at session close by default for agent integrations (TR-02). The full Q1-Q6 reflection sequence is never abbreviated. Explicit opt-out via the integration config key reflect_at_close set to 'off' (default 'auto'). An auto-fired pass is one metered /api/practice/reflect call per session close, billed per the standard per-loop model; opting out suppresses that cost.",
  "uri": "https://www.sagereasoning.com/llms.txt#practice-cycle"
}
```

### skill-registry.ts / mcp-contracts.ts notes

- `SkillContract` (skill-registry.ts ~lines 17-52): add optional `practice_default?: 'auto' | 'elective'` (set `'auto'`) and `reflect_required?: boolean` documentation fields; each skill's `example_output` carries the `practice` hint object above.
- `MCP_COMPLIANCE_NOTICE` (mcp-contracts.ts ~line 363): append a sentence — "Reflect-at-close is the default close step for agent integrations (opt-out: `reflect_at_close`); the full Q1–Q6 sequence is never abbreviated."

---

## Cross-reference: the flag-gated code that pairs with these docs (built in M5, ships dark)

These docs describe behaviour that the M5 **code** delivers flag-gated. The docs are applied only when the founder elects the paired activation:

| Doc section | Paired code (built M5, flag UNSET at push) | Activation flag |
|---|---|---|
| CI-13 `practice` field on responses | `practice` hint added in `response-envelope.ts` `buildEnvelope` extra, on `/api/reason` + accreditation-write | `SUBSTRATE_PRACTICE_CYCLE_HINT_ENABLED` |
| CI-15 two-gate cadence | none (pure documentation of adopted methodology — no code) | none — docs-only |
| (CI-4 loop closure — separate, not a doc here) | `prior_feedback` input + `examination` markers + `examination_open` on `/api/reason` | `SUBSTRATE_REASON_LOOP_CLOSURE_ENABLED` |

---

*Applied at: the founder's 0c-ii activation step (the CI-13 flag flip + these inserts; CI-15 may go as docs-only independently). Cross-references: the M5 session close; `D-MECHANISM-CORRECTION-BUILD-PLAN-APPROVED-2026-06-12`; the Q1/Q3 mentor consultation record `2026-06-12-mentor-consultation-methodology-verdicts.md`; the M1 staging precedent `m1-docs-staged-for-activation.md`.*
