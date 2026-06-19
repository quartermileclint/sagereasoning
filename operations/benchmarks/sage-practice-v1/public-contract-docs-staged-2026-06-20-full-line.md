# Staged Public-Contract Additions — Full Line Coverage (for Arm 1 viability)

**As of:** 2026-06-20 · **Status:** STAGED — not applied. Drafted for the founder to apply on push (PR17), per the house pattern (`public-contract-docs-staged.md`). Nothing here changes a live surface until you apply it.
**Purpose:** Close the doc gaps identified in `public-docs-gap-audit-for-arm1.md` so a contract-only agent can integrate all four products from public docs alone. Every shape below is grounded first-hand in route code + real wire captures from `runs/2026-06-16/leg-d-harnessed-v3/raw/`.
**Surfaces affected:** `website/public/llms.txt`, `website/public/.well-known/agent-card.json`, `website/src/app/api-docs/page.tsx`.

---

## R18 liveness gate — read first

I can only honestly publish what is live. Status of each product, verified this session:

| Product | Endpoint | Live in prod? | Evidence | Publish? |
|---|---|---|---|---|
| sage-reason | `/api/reason` | **Yes** | In Live list; A7 Verified | **Publish** |
| Sage Reflect | `/api/practice/reflect` | **Yes** | "SR-13 fully Live" (2026-06-18); `SAGE_REFLECT_ENABLED='true'` | **Publish** |
| Sage Assent | `/api/accreditation/{id}` | **Yes** (write + read) | `SUBSTRATE_WRITE_PATH_ENABLED=true` (founder-confirmed); **R18f provenance gate confirmed ON** by live probe → HTTP 403 `no_examination` (2026-06-20) | **Publish** |
| Sage Calling | `/api/calling` | **Yes** | `SAGE_CALLING_ENABLED=true` (founder-confirmed 2026-06-20); build-complete (six stages, no stubs, `lib/sage-calling/engine.ts`) | **Publish** (§4 hold lifted) |

**Liveness confirmed 2026-06-20 (founder-walked).** `SAGE_CALLING_ENABLED` and `SUBSTRATE_WRITE_PATH_ENABLED` confirmed `true` in Vercel prod by the founder; `SUBSTRATE_PROVENANCE_GATE_ENABLED` is sensitive (value hidden) but **confirmed enforcing** by a behavioral probe — a forged-provenance accreditation write returned **HTTP 403 `no_examination`**, which only the live R18f gate produces. So §3's "provenance gate (R18f), LIVE" wording is accurate, and the §4 Sage Calling block is cleared to publish.

**One residual founder call on Calling (not a blocker):** the flag is on, but Calling is **not self-serve** — it ends in an admin-approval Hard Gate (`/api/calling/approve`, admin-only). It is honest to publish (it's live), but decide whether you *want* it discoverable to external agents given that posture. If not, hold §4 by choice (not by R18).

---

## 1. Sage Reflect wire shape — the binding gap (PUBLISH-READY)

**Why:** today Reflect appears in public docs only as a concept + the practice hint. No request/response shape, no `session_summary`, no Q1–Q6 flow. The v3 run sent `session_summary` as a string and was rejected (`"Body field 'session_summary' must be an object on the first call."`); the closing step is unintegrable without this. Shapes below are from real captures (`reflect-open.json`, `reflect-q1.json`, `reflect-q6.json`) + `request-helpers.ts`/`response-builders.ts`.

### 1a. New `llms.txt` section (insert after the "Practice Cycle — Reflect at Session Close" section)

```
## Sage Reflect — the session-close reflection (wire shape)

POST https://www.sagereasoning.com/api/practice/reflect
Authorization: Bearer <sr_assent_ or sr_prac_ token with the `reflect` capability>
Content-Type: application/json

Sage Reflect is a STATEFUL multi-turn sequence (Q1–Q6, never abbreviated). You OPEN a
session, then answer each returned question in turn until status:"complete".

OPEN call (first turn) — `session_summary` is REQUIRED and must be an OBJECT:
{
  "session_id": "<your unique id for this reflection>",
  "agent_id":   "<the agent_id your credential is bound to>",
  "session_summary": {
    "purpose_at_open":   "<the purpose you pursued this session>",
    "circle_at_open":    "self_preservation | household | community | humanity | cosmic",
    "role_at_open":      "<your role/context>",
    "capacity_at_open":  ["<skills/capacities brought to bear>"],
    "sage_reasoning_passes": <integer: how many /api/reason consults you ran>
  }
}

ANSWER turns (every turn after the open) — send `response`; `session_summary` is ignored:
{ "session_id": "<same id>", "agent_id": "<same>", "response": "<your answer to the last question>" }

RESPONSE — question turn (status "in_progress"):
{ "status":"in_progress", "session_id":"...", "step":"Q1..Q6 | verification | supporting",
  "question":"<verbatim question — render as-is>",
  "subquestions":[...], "mandatory_subquestions":[...],   // you must answer the mandatory ones
  "interaction_type":"stoic-post-action-reflection", "disclaimer":"...", "documentation_url":"..." }

RESPONSE — completion (status "complete"):
{ "status":"complete", "session_id":"...",
  "exit_path":"<e.g. standard | sage_calling>",
  "profile_update_confidence":"normal | high | low",
  "scrutiny_flags":[{"type":"...","detail":"..."}],
  "sage_calling_trigger": <object|null>,
  "profile": {                                  // the Sage Assent engine read-back (may be null)
    "senecan_grade":"pre_progress|grade_3|grade_2|grade_1|sage_ideal",
    "typical_proximity":"reflexive|habitual|deliberate|principled|sage_like",
    "katorthoma_proximity_by_domain":{ "phronesis":"...", "dikaiosyne":"...", "andreia":"...", "sophrosyne":"...", "aggregate":"..." },
    "dimension_levels":{ "passion_reduction":"...", "judgement_quality":"...", "disposition_stability":"...", "oikeiosis_extension":"..." },
    "direction_of_travel":"improving|stable|declining|single_snapshot",
    "grade_changed": false },
  "profile_update_framing": { "mandatory_note":"<R19d mirror note — surface verbatim>" },
  "interaction_type":"stoic-post-action-reflection", "disclaimer":"...", "documentation_url":"..." }

SAFETY: an answer carrying acute/moderate distress returns status:"redirected" with
{ severity, suggested_user_message, flow_terminated:true } — surface suggested_user_message verbatim and stop.

Auth: requires the `reflect` capability (sr_assent_ legacy or sr_prac_ unified). Master switch SAGE_REFLECT_ENABLED.
Cost: one metered loop per session-close pass (Q1–Q4 carry Sonnet extraction; Q5/Q6 base rate).
```

### 1b. `agent-card.json` — add a skill entry so the endpoint is discoverable

Add to `skills[]` (alongside the existing reasoning skill): a `sage-reflect` skill naming `POST /api/practice/reflect`, the `reflect` capability requirement, the stateful open→Q1–Q6→complete flow, and a one-line `request_body_shape` pointer to the llms.txt section above. (Mirror the existing `sage-assent-write-auth/v1` extension style: a `request_body_shape` string + a `response_shape` string.)

### 1c. `api-docs/page.tsx` — add a "Sage Reflect" endpoint section

Mirror the existing endpoint sections: endpoint, auth (capability `reflect`), the OPEN-vs-ANSWER request distinction, and one example of each response status. This is the M5-deferred "practice-cycle / `/api/reflect`" doc surface called out in CLAUDE.md as outstanding.

---

## 2. `/api/reason` full response example (PUBLISH-READY)

**Why:** request fields are documented but there is no full response example; the `.assessment.assessment` nesting is described in prose and already caused a parse mismatch. Add a concrete example to remove the exploratory-call dependency.

### 2a. `llms.txt` — add right after the existing `/api/reason` "Returns the translation-sandwich-v1 shape…" paragraph

```
Full response example (standard depth, response_format:"full"):
{
  "version": "translation-sandwich-v1",
  "extraction": { "version":"layer1-schema-v1", ...Layer-1 features... },
  "assessment": {                          // SIGNED envelope when signing is on
    "assessment": {                        // <-- the verdict lives here (assessment.assessment)
      "katorthoma_proximity": "deliberate",
      "passion_diagnosis": { "passions_detected":[...], "false_judgements":[...], "correct_judgements":[...] },
      "control_filter": { "within_prohairesis":[...], "outside_prohairesis":[...] },
      "oikeiosis": {...}, "value_assessment": {...},
      "kathekon_assessment": { "is_kathekon":true, "quality":"strong|moderate|marginal|contrary", "justification":"..." },
      "improvement_path_structured": { ... } | null,
      "examination": { "ref":"<loop id>", "depth_tier":"standard", "prior_feedback_ref":"<set only on re-examination>" }
    },
    "signature": "<base64 Ed25519>", "key_id": "substrate-layer2-2026Q2"
  },
  "prose": { "philosophical_reflection":"...", "improvement_guidance":"...", "summary":"...", "source":"llm" },
  "meta": { "layer1_source":"server|supplied", "layer1_latency_ms":<n>, "narrative_status":"inline",
            "trajectory": <present only when trajectory read is on> },
  "disclaimer": "...",
  "practice": { "reflect_due":"TR-02", "endpoint":"/api/practice/reflect", "default":"auto", "opt_out":"reflect_at_close" }
}

With response_format:"assessment_first": `prose` is null, `meta.narrative_status`:"deferred", and a top-level
`narrative: { "status":"deferred", "correlation_id":"<id>" }` is added (the narrative is generated server-side and retained).

To re-examine after a correction (loop-closure), add to the request:
  "prior_feedback": { "prior_loop_id":"<prior examination.ref>", "prior_depth_tier":"<same tier or deeper>", "adopted_correction":"<what you changed>" }

Verify any assessment: canonicalise assessment.assessment, check `signature` against GET /api/public-key with `key_id`.
```

*(Do not document `meta.cost_usd` / `meta.ai_model` / `meta.evaluation_depth` on `/api/reason` — those are pre-M1 fields, not wired on this route. The honest cost surface is the `X-Loop-Cost-Cents` / `X-Anthropic-Cost-Cents` response headers.)*

### 2b. `api-docs/page.tsx` — extend the existing `/api/reason` section with the same example + the `assessment.assessment` nesting note.

---

## 3. Sage Assent — complete the accreditation write (PUBLISH-READY; confirm flags at apply-time)

**Why:** the write is discoverable but `CarriedProfile`/`accreditation_record` internals, the provenance extraction path, the error codes, and the loop-closure annotation are missing/partial. This is the highest-friction surface — the v3 run **503'd because its `accreditation_record` had no `dimension_levels` object** (`accreditationRecordToRow` reads `record.dimension_levels.passion_reduction` and throws if absent). Shapes below are from `trust-layer/types/accreditation.ts` + the store row-mapper `sage-assent-accreditation-store.ts:297`.

### 3a. `llms.txt` — extend the Accreditation section

```
Write request (POST /api/accreditation/{agent_id}) — `accreditation_record` MUST carry these exact fields
(a missing `dimension_levels` object causes a 503 — the store flattens its four keys into columns):
{
  "kind": "seed",                              // "seed" = first write; "update" = subsequent (also needs transition_result)
  "profile": {
    "agent_id": "<must equal the path>",
    "accreditation_record": {
      "senecan_grade": "pre_progress|grade_3|grade_2|grade_1|sage_ideal",
      "typical_proximity": "reflexive|habitual|deliberate|principled|sage_like",
      "authority_level": "supervised|guided|spot_checked|autonomous|full_authority",
      "dimension_levels": {                     // REQUIRED object — all four keys
        "passion_reduction":     "emerging|developing|established|advanced",
        "judgement_quality":     "emerging|developing|established|advanced",
        "disposition_stability": "emerging|developing|established|advanced",
        "oikeiosis_extension":   "emerging|developing|established|advanced"
      },
      "direction_of_travel": "improving|stable|regressing",
      "actions_evaluated": <integer>,
      "typical_deliberation_breadth": "intuited|deliberated|multi_branch_deliberated",
      "typical_kathekon_quality": "strong|moderate|marginal|contrary"
    },
    "regressing_check_count": 0,
    "evaluated_actions": [],
    "window_config": { "window_days": 90, "max_instances": 30, "basis": "single_session_seed" },
    "carried_candidates": []
  },
  "provenance": {
    "signed_assessments": [
      // Each element is copied VERBATIM from a prior /api/reason response:
      //   assessment = that response's  assessment.assessment   (the inner signed verdict)
      //   signature  = that response's  assessment.signature
      //   key_id     = that response's  assessment.key_id
      { "assessment": { ... }, "signature": "<base64>", "key_id": "substrate-layer2-2026Q2" }
    ]
  }
}

Provenance gate (R18f, LIVE): at least one signed_assessment must cryptographically verify, or the write is refused.
Success (200): { "status":"ok", "documentation_url":"...",
  "loop_closure": { "verdict":"closed|unclosed|no_redirections|no_chain", "redirections":N, "closed":N, "open":N, "indeterminate":N },
  "practice": { ...reflect hint... } }
Errors: 400 malformed body / agent_id mismatch · 401 bad token · 403 no_examination (no verifying signed_assessment)
  · 404 update against missing agent · 409 seed against existing agent · 422 bad_provenance (missing/empty block)
  · 503 write path disabled OR record malformed (e.g. dimension_levels absent).

Public read-back (GET /api/accreditation/{agent_id}, no auth): returns the server-composed payload —
agent_id, senecan_grade, typical_proximity, authority_level, dimension_levels, direction_of_travel,
actions_evaluated, typical_kathekon_quality, coverage_status (e.g. "agent_elected"), verification_url, disclaimer.
```

### 3b. `agent-card.json` — extend the existing `sage-assent-write-auth/v1` extension's `request_body_shape` with the `accreditation_record` required-field list above (it currently points at the shape without the field detail).

### 3c. `api-docs/page.tsx` — extend the existing Accreditation section with the `accreditation_record` required fields + the error-code table.

---

## 4. Sage Calling — CLEARED TO PUBLISH (R18 hold lifted 2026-06-20)

> **R18 hold lifted.** `SAGE_CALLING_ENABLED=true` confirmed in prod; build is complete. Publishable. One optional strategy call remains (yours, not R18): Calling is admin-approval-gated (not self-serve), so decide whether you *want* it discoverable to external agents. If you'd rather keep it private, hold this block by choice.

```
## Sage Calling — purpose discovery (multi-stage)

POST https://www.sagereasoning.com/api/calling
Authorization: Bearer <sr_assent_ or sr_prac_ token with the `calling` capability>

A deterministic Q1–Q6 purpose-discovery sequence. OPEN with no `response`; then answer each question.
Request: { "session_id":"...", "agent_id":"...", "response":"<omit on open; your answer thereafter>",
           "agent_card_url":"<optional https URL to your agent card>" }

Responses (all 200, distinguished by `status`):
- in_progress:      { "status":"in_progress", "session_id":"...", "stage":"Q1..Q6", "question":"<verbatim>" }
- awaiting_approval:{ "status":"awaiting_approval", "session_id":"...", "message":"..." }   // Hard Gate; admin must approve
- null_result:      { "status":"null_result", "session_id":"...", "clarification":"<template>" }
- holding / timed_out: 24-hour holding pattern after a null result
- redirected:       { "status":"redirected", "severity":"moderate|acute", "suggested_user_message":"...", "flow_terminated":true }
Errors: 400 / 401 / 404 (session) / 409 (state conflict) / 503 (disabled or infra).

Approval is out-of-band: POST /api/calling/approve is ADMIN-ONLY ({ session_id, decision:"approve"|"block" }) — an
agent credential cannot approve its own handoff. Auth: `calling` capability. Master switch SAGE_CALLING_ENABLED.
```

`agent-card.json`: add a `sage-calling/v1` skill/extension. `api-docs/page.tsx`: add a Calling section. **Both gated as above.**

---

## 5. Cross-cutting (small, PUBLISH-READY)

- **Metering headers.** Document on every metered response: `X-Loop-Id`, `X-Loop-Cost-Cents`, `X-Anthropic-Cost-Cents` (and the others). Currently only mentioned in the billing prose, not the endpoint reference. This is what an agent reads for the `meta.cost_usd` it won't find.
- **Capabilities → surfaces.** A one-line table: `consult`→/api/reason, `l1_supply`→supplying layer1_schema, `accreditation_write`→/api/accreditation, `calling`→/api/calling, `reflect`→/api/practice/reflect. Note write-class capabilities (`accreditation_write`/`calling`/`reflect`) are **Authorization: Bearer only** (no `X-Api-Key`).

---

## Apply-time checklist (for the founder / the apply session, PR17)

1. ~~Confirm the two Assent flags~~ **DONE 2026-06-20** — `SUBSTRATE_WRITE_PATH_ENABLED=true`; provenance gate confirmed enforcing (probe → 403). §3 "LIVE" wording stands.
2. ~~Confirm `SAGE_CALLING_ENABLED`~~ **DONE 2026-06-20** — `true` in prod. Only the optional "do we want Calling public given the admin-gate" strategy call remains; if you hold §4, Arm 1 covers consult + reflect + assent (honest).
3. Apply §1, §2, §3, §5 to `llms.txt`, `agent-card.json`, `api-docs/page.tsx`. Validate the agent-card JSON parses.
4. R18 self-check: every published field is true of the live response. (The shapes here are first-hand from route code + real captures, but you own the final read.)
5. **Then run Arm 1** — its whole value is as the acceptance test of these very additions. If the contract-only agent now integrates all of consult + reflect + assent without reading source, the docs pass; where it still stalls, that's the next gap.

## What I did / didn't touch
- I edited **no** live surface. Everything is staged here for your application.
- Shapes verified first-hand this session: `/api/reason` route + translation-sandwich, `practice/reflect` route + helpers + builders, `accreditation` route + `trust-layer/types/accreditation.ts` + the store row-mapper, `calling` route + `sage-calling/engine.ts`, plus real wire captures from the v3 run. The one field I corrected against a bad agent summary: the `practice` hint is `{reflect_due, endpoint, default, opt_out}` (not `{hint, url}`).
