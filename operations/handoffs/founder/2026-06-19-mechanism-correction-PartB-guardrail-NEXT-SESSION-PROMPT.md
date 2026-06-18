# Next-Session Prompt — Mechanism-correction **Part B**: Guardrail honesty + determinism (#3a + #3b + #3c)

**Stream:** founder. **Tier:** **code-critical** (Part B touches the Live endpoint `/api/guardrail` and changes its response shape). Full Critical Change Protocol; every prod step founder-walked (PR17).
**Governing frame:** `/adopted/standing-protocol-cache.md`. **Model:** per AC1.
**Predecessors:** Part A is **LIVE** — `D-MECHANISM-CORRECTION-PART-A-CONTINUATION-PRODUCTION-ACTIVATION-2026-06-19` + its build (`D-MECHANISM-CORRECTION-PART-A-LOOP-CLOSURE-CONTINUATION-BUILT-TEST-VERIFIED-2026-06-19`) + close (`operations/handoffs/founder/2026-06-19-mechanism-correction-PartA-loop-closure-continuation-close.md`).
**Diagnosis + dispositions (first-hand confirmed):** `operations/benchmarks/sage-practice-v1/mechanism-corrections-plan.md` §3; the FOLLOWUP prompt `operations/handoffs/founder/2026-06-18-sage-practice-mechanism-corrections-FOLLOWUP-NEXT-SESSION-PROMPT.md` Part B.

## How to use this prompt
The 2026-06-18 diagnosis root-caused the guardrail's three defects first-hand. Founder elected: **#3a folded into this session** (the whole guardrail moves at once). This session does **#3a first** (a clean, near-stand-alone honesty fix) then the **#3b/#3c signed-sandwich port** (the real win — its own ADR). **Re-confirm every cited file:line at session open** (line numbers may have drifted; the diagnosis is the source of truth for the *mechanism*).

---

## Step 1 — #3a: guardrail model-reporting honesty (**do first; code-elevated**)

**Defect (first-hand):** `meta.ai_model` **lies**. `buildEnvelope({ … model: 'claude-haiku-4-5-20251001' … })` at `website/src/app/api/guardrail/route.ts:306` is **hardcoded Haiku**, but `risk_class` elevated+critical map to `deep`/`standard` depth → `MODEL_DEEP = 'claude-sonnet-4-6'` (`sage-reason-engine.ts:393-396`, `model-config.ts:25`). So every elevated/critical gate **reports Haiku while it actually ran Sonnet** (exactly what Benchmark v1 recorded). The honest **cost** figure is unaffected — it is computed from `reasoningResult.meta.ai_model`, the real model (`route.ts:185,194`); only the displayed `model` lies.

**Fix (one line):** `model: reasoningResult.meta.ai_model` at `route.ts:306`.
- **Confirmed side-effect-free:** `buildEnvelope` uses the explicit `costUsd` override (always supplied here) and never reaches the `model`-based `estimateCostUsd` branch (`response-envelope.ts:173-178`), so the change affects **only** `meta.ai_model` (line 206). `reasoningResult.meta.ai_model` is a truthful string on every engine return path incl. cache-hit (`sage-reason-engine.ts:509/631/699`) — no fallback needed.
- **Add a regression test** asserting elevated/critical ⇒ `meta.ai_model` is the deep model (Sonnet), not Haiku.
- **Risk:** code-elevated (meta-field honesty on a Live endpoint; no auth/verdict/threshold/perimeter touch). **R18 honesty.** This is always-on (not flag-gated) — verdict/threshold path byte-unchanged.

> The competitor *price* figure retained for the human-tool routes is a separate fleet-wide price-vs-cost question (CI-8 lineage) — **out of scope** here; touch only `meta.ai_model` on `/api/guardrail`.

---

## Step 2 — #3b/#3c: port the guardrail onto the signed translation-sandwich (**the real win; Critical; new ADR**)

**Defects (first-hand):**
- **#3b latency (~90s):** critical → `deep` depth → `MODEL_DEEP` (Sonnet), `maxTokens: 8192`, all 6 mechanisms, a **single non-streamed call** at temp 0.2 (`sage-reason-engine.ts:396,561-567`). The ~91–95s is Sonnet generating a near-max dense-JSON completion — output-token time, not compute-wait. (The M1 L3 deferral does **not** help — the guardrail's expensive output *is* the verdict; there is no separable narrative to defer.)
- **#3c determinism:** the guardrail runs the older **single-LLM `sage-guard`** engine (temp 0.2, unsigned, `is_deterministic:false`, `sr_rcpt_` receipt) — **not** `/api/reason`'s signed deterministic translation-sandwich. The verdict is non-reproducible and unsigned; it does **not** carry the verifiability a consult does.

**The opportunity (first-hand):** the sandwich's **Layer-2 is a pure, no-LLM, byte-reproducible, Ed25519-signed function** that already emits `katorthoma_proximity` (`layer2-mechanisms.ts`), and the guardrail verdict is **pure ordinal-rank arithmetic** over that proximity (`meetsThreshold` / `getV3Recommendation`). **Port the guardrail onto the sandwich** →
1. the verdict becomes **deterministic + signed** (a truthful `is_deterministic:true`, same verifiability as a consult), and
2. **latency drops** — replace the 8192-token reasoning generation with **one bounded Layer-1 extraction** call + the free deterministic L2 + the rank-arithmetic verdict.

**Cost / scope (this is a genuine port, not a flag flip):**
- The sandwich is **`/api/reason`-only today** — porting it behind `/api/guardrail` is real wiring.
- **Reconcile the guardrail-bespoke response fields** (`deliberation_quality`, `hasty_assent_risk`, `rollback_path`): re-derive each from L1/L2, or drop with an R10 announcement. This is a **response-shape change** on a Live endpoint — announce under **R10**.
- **New ADR** for the port (cite ADR-008 / the Layer-2 signing ADR as precedent; the engine choice + the field reconciliation are the load-bearing decisions).
- **Build dark / flag-gate the engine swap** (`SUBSTRATE_GUARDRAIL_SANDWICH_ENABLED` or similar): flag-off ⇒ the old `sage-guard` path retained verbatim (byte-identical); flag-on ⇒ the sandwich port. Byte-identity test-asserted flag-off.
- **Interim latency mitigations to weigh in the ADR** (if the full port is staged): stream/early-return the verdict ahead of any prose; cap `maxTokens`. The full sandwich port is **preferred** — it solves latency *and* determinism together.

**Method (ultracode):** adversarial **pre-activation** review before any flag flip (mirror Part A's 8-dim/15-agent pass — dimensions: flag-off byte-identity; verdict-equivalence old-vs-new on a fixture battery; determinism + signing; the response-shape reconciliation; the R20a/perimeter ordering on `/api/guardrail`; threshold arithmetic parity). Founder-walk the prod step (env-flag activation + a verdict-equivalence smoke).

**Risk:** **Critical** (Live endpoint + response-shape change + engine swap). **Rollback:** unset the flag + redeploy (old `sage-guard` path retained, byte-identical).

---

## Not in scope
- Part C (apply the staged public-contract docs incl. §7 + the thin SDK) — its own future session (`operations/handoffs/founder/2026-06-19-mechanism-correction-PartC-docs-SDK-NEXT-SESSION-PROMPT.md`).
- The fleet-wide price-vs-cost question on the human-tool routes (CI-8 lineage).
- The **0h launch call** (the founder's — this corrections arc is the "execution" gating work the verdict named).

*Open code-critical on `main`. Do #3a first (clean honesty win), then ADR + build-dark the #3b/#3c sandwich port. Start from the plan §3 + the cited file:lines; re-confirm them at open.*
