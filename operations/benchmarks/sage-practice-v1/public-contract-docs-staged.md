# Public-Contract Docs — STAGED for founder application (Sage Practice mechanism-correction #4/#5/#6)

**Status:** STAGED. **Nothing public changes by writing this file (R18).** The founder applies these additions to the public surfaces (`website/public/llms.txt`, the api-docs `page.tsx`, `website/public/.well-known/agent-card.json`) in a founder-walked step. Mirrors the M1/M5 staged-docs pattern.
**Source of truth (faithful to LIVE behaviour):** the live route/types cited per item + the Benchmark v1 **proven raw bodies** (`leg-d-harnessed-v2/practice-log.md`, all calls returned the stated status against production). **Date:** 2026-06-18.
**Governing:** R18 (public materials must be faithful to live behaviour). Each addition below is verified against the live code path cited.

> **EXCLUSION (R18 honesty):** the **clarification-continuation** field (Tier-1 force-clarification answer channel) is **NOT** documented here. It is broken by construction (mechanism-correction #2) — there is nothing correct to publish until the fix lands. Document it only after #2 ships. Everything else below works as written.

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

## SDK follow-up (founder elected "Both")

The staged docs above close the immediate fidelity gaps. The **structural** fix — so integrators never reconstruct shapes from prose — is a **thin client SDK** that encodes: consult (incl. `assessment_first`, `layer1_schema` reuse, `prior_feedback`), signature verification (the canonical-form footgun in §3), and the accreditation write (the `provenance.signed_assessments` round-trip in §1). Scope: a small TS client + a worked end-to-end example; the canonical shapes are the live types cited above. Tracked as a follow-up session (see the mechanism-corrections follow-up prompt). Not built this session.

---

*End of staged docs. Apply order: §1 (accreditation) first — it forces publishing §3 (verification) and the consult→provenance round-trip an integrator most needs. Re-verify each shape against the cited live path at apply time (R18).*
