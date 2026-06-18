# Future-Session Prompt — Mechanism-correction **Part C**: Apply staged public-contract docs (incl. §7) + scope the thin SDK (#4)

**Stream:** founder. **Tier:** **R18 / code-standard** (docs apply = R18 faithfulness; the SDK = code-standard). Founder-walks the doc push (PR17); no auth/perimeter/schema change.
**Governing frame:** `/adopted/standing-protocol-cache.md`. **Model:** per AC1.
**Sequencing:** run **after Part B** (or independently — Part C has no dependency on Part B). It **does** depend on **Part A being LIVE** (it is, 2026-06-19) so §7 is publishable.
**Predecessors:** the FOLLOWUP prompt `operations/handoffs/founder/2026-06-18-sage-practice-mechanism-corrections-FOLLOWUP-NEXT-SESSION-PROMPT.md` Part C; the diagnosis plan `operations/benchmarks/sage-practice-v1/mechanism-corrections-plan.md` §4.

## How to use this prompt
The public contract isn't self-sufficient (the Benchmark v1 agent read 25 source files). The 2026-06-18 diagnosis **staged** the doc additions (§1–§6); the 2026-06-19 Part-A activation **added §7** (the clarification-continuation contract — publishable now that Part A is live) and **lifted the exclusion**. Founder elected **Both** (apply docs + a thin SDK). This session **applies the staged set to the live surfaces** and **scopes/builds the SDK**.

**The staged source of truth:** `operations/benchmarks/sage-practice-v1/public-contract-docs-staged.md` — **§1–§7**, each with its live contract, the exact doc content, placement, and a per-item verification parenthetical.

---

## Step 1 — Apply the staged docs (§1–§7) to the live public surfaces (**R18; founder-walks the push**)

Apply to: `website/public/llms.txt`, the api-docs `website/src/app/api-docs/page.tsx`, and `website/public/.well-known/agent-card.json`.

**Apply order (highest-leverage first):**
1. **§1 — Accreditation write + read** (the single biggest gap — forces publishing the consult→`provenance.signed_assessments` round-trip + §3). New `### Accreditation — Verifiable Reasoning Profile` section in llms.txt + a paired api-docs subsection + the `sage-assent-write-auth/v1` agent-card pointer. Include the **#6b** read-back-honesty note (`typical_kathekon_quality`/`coverage_status`/`credential_basis` server-composed + consumer-unforgeable).
2. **§2** `layer1_schema` object shape · **§3** signature verification + the `public_key_pem` field + the canonical-form footgun · **§4** `prior_feedback` · **§5** `l1_supply` echo caveat · **§6** guardrail-is-not-a-fact-checker.
3. **§7 — Clarification-continuation** (Part A, live 2026-06-19): the turn-1 force-clarification shape, the turn-2 byte-identical-`input` + `clarification_response` contract, the four structural 400s (incl. the CF-2 supplied-schema rejection), the R20a safety guarantee, and the **new 11th agent-card extension** `tier1-clarification-continuation/v1` (ready-to-paste `{uri, description}` in the staged file).

**R18 discipline — re-verify each shape against its cited live path AT APPLY TIME.** The staged file carries the citations; live line numbers may have drifted. (At §7 drafting on 2026-06-19 the turn-1 shape was found richer than first written and corrected against `parallel-run.ts:1122-1134` — expect to re-confirm similarly.)

**Verification:** `npm run build` (the api-docs `.tsx` change is gated by Next's route/page validation, not just `tsc`); validate `agent-card.json` parses (11 extensions); confirm llms.txt renders. **Founder-walks the commit + push** (PR17). **Nothing auth/perimeter/schema** — pure public-doc content (R18).

---

## Step 2 — Scope (and likely build) the thin client SDK (#4 structural fix; **code-standard**)

The docs close the *fidelity* gap; the **structural** fix is a small TS client so integrators never reconstruct shapes from prose. **Encode once:**
- **consult** — incl. `response_format:'assessment_first'`, `layer1_schema` reuse (+ the §5 echo caveat), `prior_feedback` (§4), and the **clarification-continuation round-trip** (the §7 two-turn handshake: keep the byte-identical `input`, carry `continuation_token` + `clarification_response`; surface the suppressed-trigger / different-trigger outcome).
- **signature verification** — the canonical-form footgun (§3: sorted keys, compact separators, raw UTF-8 over `.assessment.assessment`).
- **accreditation write** — the `provenance.signed_assessments` round-trip (§1: capture a consult's `{assessment, signature, key_id}`, submit a non-empty array).
- **a worked end-to-end example** (consult → verify signature → accreditation write → public read-back).

Scope: a small TS client + the worked example; the canonical shapes are the live types cited in the staged file. **Could be its own session** if it grows. Risk code-standard (a repo client + example; nothing deploys unless published as a package — decide distribution separately).

---

## Not in scope
- Part B (guardrail honesty + signed-sandwich port) — `operations/handoffs/founder/2026-06-19-mechanism-correction-PartB-guardrail-NEXT-SESSION-PROMPT.md`.
- The methodology / mentor-consultation gate (scoped OUT — methodology, not mechanism).
- The **0h launch call** (the founder's).

*Open R18/code-standard on `main`. Apply §1 first (it forces the round-trip an integrator most needs); §7 is ready (Part A live). Re-verify every shape against its cited live path at apply time (R18). Then scope/build the SDK.*
