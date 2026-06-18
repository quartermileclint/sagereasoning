# Public-Contract Docs — STAGED for founder application (Sage Practice mechanism-correction #4/#5/#6)

**Status:** STAGED. **Nothing public changes by writing this file (R18).** The founder applies these additions to the public surfaces (`website/public/llms.txt`, the api-docs `page.tsx`, `website/public/.well-known/agent-card.json`) in a founder-walked step. Mirrors the M1/M5 staged-docs pattern.
**Source of truth (faithful to LIVE behaviour):** the live route/types cited per item + the Benchmark v1 **proven raw bodies** (`leg-d-harnessed-v2/practice-log.md`, all calls returned the stated status against production). **Date:** 2026-06-18.
**Governing:** R18 (public materials must be faithful to live behaviour). Each addition below is verified against the live code path cited.

> **UPDATE 2026-06-19 — EXCLUSION LIFTED:** the **clarification-continuation** field (Tier-1 force-clarification answer channel) was excluded while it was broken by construction (mechanism-correction #2). **#2 (Part A) is now fixed + LIVE in production (2026-06-19, `D-MECHANISM-CORRECTION-PART-A-CONTINUATION-PRODUCTION-ACTIVATION-2026-06-19`)** — so it is now documented in **§7** below, faithful to the live route (re-verified this session). Everything in this file works as written.

---

## Gap map (what's missing today)

| Shape | llms.txt | api-docs | agent-card | This file stages |
|---|---|---|---|---|
| Accreditation write body (`profile` + `provenance.signed_assessments`) | ABSENT | ABSENT | auth-only | **§1** (highest-leverage) |
| `layer1_schema` object shape | gating-rules only | gating-rules only | gating-rules only | **§2** |
| Verifying signatures + `public_key_pem` field name | ABSENT | ABSENT | ABSENT | **§3** |
| `prior_feedback {prior_loop_id, prior_depth_tier}` | ABSENT | ABSENT | ABSENT | **§4** |
| `l1_supply` reuse semantics (echo caveat) | ABSENT | — | — | **§5** |
| `typical_kathekon_quality` conservative-default note (#6b) | ABSENT | — | — | **§1** (read-back note) |
| Guardrail is-not-a-fact-checker note (#6c) | ABSENT | — | — | **§6** |
| Clarification-continuation (`clarification_response`, Tier-1 answer channel) | ABSENT | ABSENT | ABSENT | **§7** (now LIVE — was the #2 exclusion) |

---

## §1 — Accreditation write + read (the single biggest gap)

**Live contract (verified):** `POST /api/accreditation/{agent_id}` with `Authorization: Bearer sr_prac_…` (a credential carrying the `accreditation_write` capability). Body parsed at `route.ts:443-547`; provenance gate at `provenance-contract.ts` + `provenance-gate.ts` (R18f). Body shape:

```json
{
  "kind": "seed",
  "profile": {
    "agent_id": "<must equal the {agent_id} in the path>",
    "accreditation_record": { "...": "the credential aggregate (see below)" },
    "regressing_check_count": 0,
    "evaluated_actions": [],
    "total_actions_evaluated": 5,
    "window_config": { "...": "rolling-window config" },
    "carried_candidates": []
  },
  "provenance": {
    "signed_assessments": [
      { "assessment": { "...": "the .assessment block from a prior /api/reason consult" },
        "signature": "<that consult's base64 signature>",
        "key_id": "substrate-layer2-2026Q2" }
    ]
  }
}
```

- **`kind`:** `"seed"` (first credential for the agent) or `"update"` (requires an additional `transition_result` field). `route.ts:466-547`.
- **`profile`:** a `CarriedProfile` (`src/lib/substrate/sage-assent-wrapper.ts`). The route requires `profile.agent_id` (non-empty string, must match the path), `profile.accreditation_record` (object), `profile.regressing_check_count` (number); the rest of the `CarriedProfile`/`AccreditationRecord` shape is the canonical record (cite the type as the full field list — do not transcribe inline).
- **`provenance.signed_assessments`** (the R18f gate, load-bearing): a **non-empty array**; each element is `{ assessment, signature, key_id }` taken **verbatim from the `.assessment` of a prior `/api/reason` consult response** (the `assessment` object, its `signature`, its `key_id`). The gate (i) structurally validates the shape (400/422 on malformed) then (ii) **requires at least one element to cryptographically verify** against the published key — a forged/absent signature returns **403 (`no_examination`)**. This proves the writer possesses genuine substrate output. It does **not** prove the credited aggregate was faithfully computed (honest scope limit — `provenance-contract.ts:30-34`).

**200 response (proven, Call 8):**
```json
{ "status": "ok",
  "documentation_url": "https://sagereasoning.com/limitations",
  "loop_closure": { "verdict": "unclosed", "redirections": 1, "closed": 0, "open": 1, "indeterminate": 0 },
  "practice": { "reflect_due": "TR-02", "endpoint": "/api/practice/reflect", "default": "auto", "opt_out": "reflect_at_close" } }
```

**Public read-back (no auth):** `GET /api/accreditation/{agent_id}` returns the server-composed honest profile (proven, Call 9):
```json
{ "status": "ok", "data": {
  "agent_id": "…", "senecan_grade": "grade_1", "typical_proximity": "habitual",
  "authority_level": "guided", "dimension_levels": { "...": "..." }, "direction_of_travel": "improving",
  "actions_evaluated": 5, "typical_kathekon_quality": "contrary",
  "coverage_status": "agent_elected", "credential_basis": "…(discretionary submission; single-session…)" } }
```

> **#6b note to add (read-back honesty):** `typical_kathekon_quality`, `coverage_status`, and `credential_basis` are **server-composed and consumer-unforgeable**. A self-submitted profile that does not carry `typical_kathekon_quality` reads back as the conservative default **`contrary`** (the aggregate is distinct from any single consult's `kathekon` quality, which describes that one consult, not the credential). `coverage_status: "agent_elected"` honestly marks a discretionary, self-reported single-session seed (not third-party-monitored). Integrators cannot inflate these by what they submit.

**Placement:** a new `### Accreditation — Verifiable Reasoning Profile (write + read)` section in `llms.txt` (after the Guardrail section); a paired api-docs subsection; the `agent-card.json` `sage-assent-write-auth/v1` extension already names the auth scheme — add a `request_body_shape` pointer to the llms.txt section.

---

## §2 — `layer1_schema` object shape (augments the existing llms.txt §"Supplying your own Layer-1 schema")

Today llms.txt says only "any `layer1_schema` that validates against the documented contract" without giving the contract. Add:

> **The simplest valid `layer1_schema` is the `extraction` block returned by any prior consult** — capture a consult's `extraction` and supply it back verbatim as `layer1_schema`. (See §5 on when this is appropriate.) For agents computing it locally, the `layer1-schema-v1` contract is the top-level shape:
> ```
> { version: "layer1-schema-v1",
>   passions_present: [{ root_passion, sub_species, evidence }],
>   control_filter_elements: [{ item, agent_named_position }],
>   value_categories_at_stake: [{ indifferent, agent_framing, evidence }],
>   oikeiosis_circles_engaged: [{ circle, evidence }],
>   kathekon_factors: [{ factor_type, description, evidence }],
>   urgency_indicators: [...], causal_stage_evidence: [...],
>   eupatheia_candidates: [...], stated_concern_targets: [...],
>   stated_equanimity_signals: [...], motivation_stated: bool,
>   motivation_evidence: [...], element_fusion_detected: { fused, fused_concerns },
>   ambiguity_notes: [...] }
> ```
> Field semantics are specified canonically in the Layer-1 schema specification (ADR-005). A schema that fails validation returns **400** with the field-level validator error.

(The top-level keys above are the live `layer1-schema-v1` shape — verbatim from a production consult's `extraction`, Benchmark v1 Call 1.)

---

## §3 — Verifying signed assessments + the `public_key_pem` field (new subsection)

Today llms.txt says "verify against GET /api/public-key" but never names the field or the canonical form. Add a `### Verifying signed assessments` subsection:

> `GET /api/public-key` (no auth) returns:
> ```json
> { "key_id": "substrate-layer2-2026Q2", "algorithm": "Ed25519",
>   "public_key_pem": "-----BEGIN PUBLIC KEY-----\n…\n-----END PUBLIC KEY-----",
>   "issued_at": "…", "rotation_overlap_until": null, "previous": null }
> ```
> The signature in a consult response (`assessment.signature`, `assessment.key_id`) covers the **nested `.assessment.assessment` object exactly**. The canonical form that verifies is the JSON of `.assessment.assessment` with **sorted keys, compact separators, raw UTF-8** (`ensure_ascii=false`); ASCII-escaped canonicalization does **not** verify. During key rotation, `previous` carries the prior `{ key_id, public_key_pem }` and `rotation_overlap_until` the overlap deadline.

(Field name `public_key_pem` verified at `public-key/route.ts:196`; canonical-form note proven by the independent verifier in Benchmark v1 Call 7.)

---

## §4 — `prior_feedback` (re-examination affordance — augments the consult section)

Add to the `/api/reason` body documentation:

> **`prior_feedback`** (optional object) — carries a re-examination back to a prior consult so the examination composes as a closed loop. Shape:
> ```json
> { "prior_loop_id": "<the prior consult's assessment.examination.ref (== its X-Loop-Id)>",
>   "prior_depth_tier": "quick | standard | deep",
>   "adopted_correction": "<optional: the correction you adopted from the prior consult>" }
> ```
> The re-examination **carries the prior depth** (the same-depth rule — a re-examination is not quick-by-default). The response surfaces `examination_open` and places `examination.{ref, depth_tier, prior_feedback_ref}` inside the signed assessment. A malformed `prior_feedback` returns **400** (`prior_feedback must be an object carrying prior_loop_id and prior_depth_tier`).

(Shape verified at `reason-loop-closure.ts:88-95,110-123`; the `prior_loop_id == examination.ref` mapping confirmed by the live route.)

---

## §5 — `l1_supply` reuse semantics (echo caveat — augments §2 / the supplied-schema note)

Add:

> **When to supply a prior extraction:** supplying a prior consult's `extraction` as `layer1_schema` re-runs the deterministic Layer-2 verdict over **that prior situation's features** — it is the cheap path for **re-examining the *same* situation** (0 ms server L1, 0¢). It is **not** a fresh diagnosis of a *new* sub-question: if you supply situation A's extraction while asking about situation B, the verdict reflects A's features (an **echo**), not B. For a genuinely new question, omit `layer1_schema` (let the server extract) or compute a fresh one.

(Behaviour confirmed in Benchmark v1 Call 3: `layer1_source: supplied`, 0 ms, but the `value_error`/`proximity` echoed the supplied Call-1 framing.)

---

## §6 — Guardrail is not a fact-checker (#6c — augments the Guardrail section)

Add:

> **What the gate evaluates:** the Sage Risk Gate evaluates the **reasoning over the premises you supply** — it diagnoses passions, value-errors, and proximity in the framing of the action. It is **not a fact-checker**: it does not independently verify arithmetic, claims, or external facts in your `context`. Supplying false or incomplete facts yields a verdict over those facts. Verify your inputs before trusting the gate's framing.

(Correct behaviour, confirmed in Benchmark v1 Calls 5–6: the gate returned genuine `do_not_proceed` verdicts + useful framing but caught nothing independently — the agent supplied the facts.)

---

## §7 — Clarification-continuation (Tier-1 force-clarification answer channel) — **#2 fixed + LIVE 2026-06-19; now publishable**

**Live contract (re-verified this session):** ADR-008 §A (Design A); route `route.ts:949-975,1107-1170,1638-1671`; engine `layer2-mechanisms.ts` + `parallel-run.ts:1124-1128`. Activated `D-MECHANISM-CORRECTION-PART-A-CONTINUATION-PRODUCTION-ACTIVATION-2026-06-19`.

**First turn — a Tier-1 force-clarification fires.** When a consult's situation is too ambiguous to assess on one axis (ELEMENT_FUSION — two concerns fused; TEMPORAL_AMBIGUITY — regret-vs-worry undetermined; SCOPE_AMBIGUITY — an unspecified other with no relational circle), `/api/reason` returns **HTTP 200** with a force-clarification shape *instead of* an assessment:
```json
{ "version": "translation-sandwich-v1",
  "clarification_required": true,
  "intake_tier": 1,
  "trigger_code": "ELEMENT_FUSION | TEMPORAL_AMBIGUITY | SCOPE_AMBIGUITY",
  "clarification": {
    "question_text": "<the single clarifying question>",
    "stem_id": "<question-template id>",
    "slot_fills": ["<the elements the question references>"] },
  "continuation_token": "<opaque token, 30-min expiry>",
  "evaluation_partial": null,
  "disclaimer": "…" }
```

**Second turn — answer the question to close the clarification.** Re-submit:
```json
{ "input": "<the ORIGINAL input, byte-for-byte identical to turn 1>",
  "continuation_token": "<from the turn-1 response>",
  "clarification_response": "<your answer to question_text>" }
```
- **`input` must be byte-identical to turn 1.** The token binds to `sha256(input)`; any change (even whitespace) → **400 `continuation_token_input_mismatch`**. The answer rides its **own** field — do **not** fold it into `input`.
- **`clarification_response`** (string, ≤ 5000 chars) carries your answer.
- The engine **suppresses re-firing the answered trigger** and folds the answer into the Layer-1 re-extraction → you get a **full assessment**. A *different* Tier-1 trigger may still fire on the second turn (never the same one twice in a row).

**Structural errors (HTTP 400):**

| condition | error |
|---|---|
| `clarification_response` is not a string | `clarification_response must be a string.` |
| `continuation_token` present, no answer | `clarification_response_required` |
| `clarification_response` present, no token | `clarification_response_without_token` |
| `clarification_response` + a supplied `layer1_schema` | `clarification_response_with_supplied_layer1_schema` |

> **Supplied-schema callers (`l1_supply` / plugin):** the answer informs server-side Layer-1 **re-extraction**, which is skipped when you supply your own `layer1_schema`. So a continuation **cannot** combine `clarification_response` with `layer1_schema` (the last 400 above). To resume a force-clarification on the supplied-schema path, **re-submit a disambiguated `layer1_schema`** — the trigger then simply does not fire (no answer field needed).

**Safety (unchanged guarantee):** on the continuation turn the R20a vulnerable-user perimeter runs on **`input` + `clarification_response`** — distress in your answer is caught and redirects, exactly as on a first turn.

**Placement:**
- **llms.txt** — a new `### Force-clarification & continuation` subsection in the `/api/reason` consult section (after the §4 `prior_feedback` addition): the turn-1 shape, the turn-2 contract, the byte-identical rule, and the 400 table.
- **api-docs** (`page.tsx`) — add `continuation_token` + `clarification_response` to the `/api/reason` request params and a short "Force-clarification" subsection with the turn-1/turn-2 example.
- **agent-card.json** — a new 11th `extensions[]` entry (matches the `{ uri, description }` shape of the existing 10):
```json
{ "uri": "https://sagereasoning.com/extensions/tier1-clarification-continuation/v1",
  "description": "Tier-1 force-clarification answer channel (ADR-008 Design A, live 2026-06-19). When a consult is too ambiguous to assess on one axis, /api/reason returns HTTP 200 { clarification_required:true, clarification:{question_text}, continuation_token } instead of an assessment. To resume: re-POST the BYTE-IDENTICAL original input + the continuation_token + clarification_response (your answer, <=5000 chars). The token binds to sha256(input) — any change to input returns 400 continuation_token_input_mismatch; the answer rides clarification_response and is never folded into input. The engine suppresses re-firing the answered trigger and returns a full assessment (a different trigger may still fire — never the same twice). 400s: clarification_response_required (token, no answer); clarification_response_without_token (answer, no token); clarification_response_with_supplied_layer1_schema (answer + a supplied layer1_schema — resolve by re-supplying a disambiguated schema instead, since a supplied schema skips the server re-extraction the answer informs). The R20a vulnerable-user perimeter runs on input + clarification_response on the continuation turn." }
```

(Verified against the live route this session: force-clarification shape `parallel-run.ts:1122-1134` [`version`/`intake_tier`/`trigger_code`/`clarification.{question_text,stem_id,slot_fills}`/`evaluation_partial`] + the route fills `continuation_token` + `disclaimer` at `route.ts:1638-1671`; the four 400s `route.ts:956,1114,1143,1161` [exact strings]; `clarification_response` ≤ `TEXT_LIMITS.medium` = 5000 `security.ts:202`; byte-identical hash + `continuation_token_input_mismatch` `tier1-token.ts`; R20a coverage of `input + clarification_response` `route.ts:996-1002`. Activated + flag-took-effect smoke-verified, `D-MECHANISM-CORRECTION-PART-A-CONTINUATION-PRODUCTION-ACTIVATION-2026-06-19`.)

---

## SDK follow-up (founder elected "Both")

The staged docs above close the immediate fidelity gaps. The **structural** fix — so integrators never reconstruct shapes from prose — is a **thin client SDK** that encodes: consult (incl. `assessment_first`, `layer1_schema` reuse, `prior_feedback`), the **clarification-continuation round-trip** (the byte-identical-input + `clarification_response` two-turn handshake in §7), signature verification (the canonical-form footgun in §3), and the accreditation write (the `provenance.signed_assessments` round-trip in §1). Scope: a small TS client + a worked end-to-end example; the canonical shapes are the live types cited above. Tracked as a follow-up session (see the mechanism-corrections follow-up prompt). Not built this session.

---

*End of staged docs. Apply order: §1 (accreditation) first — it forces publishing §3 (verification) and the consult→provenance round-trip an integrator most needs. Re-verify each shape against the cited live path at apply time (R18).*
