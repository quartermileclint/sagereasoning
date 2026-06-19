# Public-Contract Drop-In Blocks — apply-ready (2026-06-20)

**What this is:** exact, paste-ready blocks keyed to real anchors in the three live surfaces, so applying is paste-not-judgement. All shapes verified first-hand this session (route code + real wire captures). Nothing here is applied — you apply on your push (PR17).
**Liveness:** all three flags confirmed live (`SAGE_CALLING_ENABLED`, `SUBSTRATE_WRITE_PATH_ENABLED`, provenance gate via 403 probe). Everything below is honest to publish.
**Safety note on the two code-ish files:** `llms.txt` is plain text — safe to paste. `agent-card.json` (JSON) and `api-docs/page.tsx` (React/TSX) break the build if a comma or tag is off. For those two I recommend **letting me apply + run `npm run build`** rather than hand-pasting — flagged again at each. After any `agent-card.json` edit, validate with: `python3 -m json.tool website/public/.well-known/agent-card.json > /dev/null && echo OK`.

---

# FILE 1 — `website/public/llms.txt`  (plain text; safe to paste)

## Block A — `/api/reason` full response example
**Anchor:** find the paragraph that begins `Returns the translation-sandwich-v1 shape:` (≈ line 116). **Paste this immediately AFTER that paragraph** (a blank line, then the block), before the `**Agent integrations (per-install tokens):**` paragraph.

```
Full response example (standard depth, response_format:"full"):
{
  "version": "translation-sandwich-v1",
  "extraction": { "version": "layer1-schema-v1", "...": "the validated Layer-1 features" },
  "assessment": {                       // signed envelope
    "assessment": {                     // the verdict lives at assessment.assessment
      "katorthoma_proximity": "deliberate",
      "passion_diagnosis": { "passions_detected": [ "..." ], "false_judgements": [ "..." ], "correct_judgements": [ "..." ] },
      "control_filter": { "within_prohairesis": [ "..." ], "outside_prohairesis": [ "..." ] },
      "oikeiosis": { "...": "..." },
      "value_assessment": { "indifferents_at_stake": [ "..." ], "value_error": null },
      "kathekon_assessment": { "is_kathekon": true, "quality": "strong|moderate|marginal|contrary", "justification": "..." },
      "improvement_path_structured": { "...": "..." },
      "examination": { "ref": "<loop id>", "depth_tier": "standard", "prior_feedback_ref": "<present only on a re-examination>" }
    },
    "signature": "<base64 Ed25519>", "key_id": "substrate-layer2-2026Q2"
  },
  "prose": { "philosophical_reflection": "...", "improvement_guidance": "...", "summary": "...", "source": "llm" },
  "meta": { "layer1_source": "server", "layer1_latency_ms": 0, "narrative_status": "inline" },
  "disclaimer": "...",
  "practice": { "reflect_due": "TR-02", "endpoint": "/api/practice/reflect", "default": "auto", "opt_out": "reflect_at_close" }
}

The verdict is at assessment.assessment (NOT the top-level assessment, which is the signed envelope). With response_format:"assessment_first", prose is null, meta.narrative_status is "deferred", and a top-level narrative:{ "status":"deferred", "correlation_id":"<id>" } is added. To re-examine after a correction (loop-closure), add to the request: "prior_feedback": { "prior_loop_id":"<prior examination.ref>", "prior_depth_tier":"<same tier or deeper>", "adopted_correction":"<what you changed>" }. Cost is on the response headers X-Loop-Id / X-Loop-Cost-Cents / X-Anthropic-Cost-Cents (there is no meta cost field on this route).
```

## Block B — Sage Assent: the exact `accreditation_record` fields (surgical)
The Accreditation section already documents the round-trip; only the record shape is hand-waved. **Two edits inside the `### Accreditation — Verifiable Reasoning Profile (write + read)` section:**

**B1 — find this line** (inside the write-body JSON, ≈ line 270):
```
    "accreditation_record": { "...": "the credential aggregate" },
```
**Replace it with:**
```
    "accreditation_record": {
      "senecan_grade": "pre_progress|grade_3|grade_2|grade_1|sage_ideal",
      "typical_proximity": "reflexive|habitual|deliberate|principled|sage_like",
      "authority_level": "supervised|guided|spot_checked|autonomous|full_authority",
      "dimension_levels": {
        "passion_reduction": "emerging|developing|established|advanced",
        "judgement_quality": "emerging|developing|established|advanced",
        "disposition_stability": "emerging|developing|established|advanced",
        "oikeiosis_extension": "emerging|developing|established|advanced"
      },
      "direction_of_travel": "improving|stable|regressing",
      "actions_evaluated": 1,
      "typical_deliberation_breadth": "intuited|deliberated|multi_branch_deliberated",
      "typical_kathekon_quality": "strong|moderate|marginal|contrary"
    },
```

**B2 — find the bullet that begins** `- **\`profile\`** is the canonical \`CarriedProfile\`.` **and append this sentence to that bullet:**
```
 The `accreditation_record` must carry all the fields shown above — in particular `dimension_levels` must be present as an object with its four keys, or the write is rejected with **503** (the store flattens those four keys into columns; a missing object throws before any row is written — this is the single most common write failure).
```

## Block C — NEW section: Sage Reflect wire shape
**Anchor:** find `## Adoption Guidance for AI Agents` (≈ line 475). **Paste this NEW section immediately BEFORE it** (with a blank line after):

```
## Sage Reflect — session-close reflection (wire shape)

POST https://www.sagereasoning.com/api/practice/reflect
Authorization: Bearer <sr_assent_ or sr_prac_ token carrying the `reflect` capability>
Content-Type: application/json

A STATEFUL multi-turn sequence (Q1–Q6, never abbreviated). OPEN a session, then answer each returned question until status:"complete".

OPEN (first turn) — `session_summary` is REQUIRED and must be an OBJECT:
{
  "session_id": "<your unique id for this reflection>",
  "agent_id":   "<the agent_id your credential is bound to>",
  "session_summary": {
    "purpose_at_open":   "<the purpose you pursued this session>",
    "circle_at_open":    "self_preservation | household | community | humanity | cosmic",
    "role_at_open":      "<your role/context>",
    "capacity_at_open":  ["<capacities brought to bear>"],
    "sage_reasoning_passes": 0
  }
}

ANSWER turns (every turn after the open) — send `response`; `session_summary` is ignored:
{ "session_id": "<same id>", "agent_id": "<same>", "response": "<your answer to the last question>" }

RESPONSE — question turn:
{ "status":"in_progress", "session_id":"...", "step":"Q1..Q6 | verification | supporting",
  "question":"<verbatim — render as-is>", "subquestions":["..."], "mandatory_subquestions":["..."],
  "interaction_type":"stoic-post-action-reflection", "disclaimer":"...", "documentation_url":"..." }

RESPONSE — completion:
{ "status":"complete", "session_id":"...", "exit_path":"...", "profile_update_confidence":"normal|high|low",
  "scrutiny_flags":[{"type":"...","detail":"..."}], "sage_calling_trigger": null,
  "profile": {
    "senecan_grade":"pre_progress|grade_3|grade_2|grade_1|sage_ideal",
    "typical_proximity":"reflexive|habitual|deliberate|principled|sage_like",
    "katorthoma_proximity_by_domain":{ "phronesis":"...", "dikaiosyne":"...", "andreia":"...", "sophrosyne":"...", "aggregate":"..." },
    "dimension_levels":{ "passion_reduction":"...", "judgement_quality":"...", "disposition_stability":"...", "oikeiosis_extension":"..." },
    "direction_of_travel":"improving|stable|declining|single_snapshot", "grade_changed": false },
  "profile_update_framing": { "mandatory_note":"<mirror note — surface verbatim>" },
  "interaction_type":"stoic-post-action-reflection", "disclaimer":"...", "documentation_url":"..." }

SAFETY: an answer carrying acute/moderate distress returns status:"redirected" with
{ "severity":"moderate|acute", "suggested_user_message":"...", "flow_terminated":true } — surface suggested_user_message verbatim and stop.

Auth requires the `reflect` capability (master switch SAGE_REFLECT_ENABLED, live). Cost: one metered loop per session-close pass (Q1–Q4 carry Sonnet extraction; Q5/Q6 base rate). The reflect-at-close default and opt-out are described in "Practice Cycle — Reflect at Session Close" above.
```

## Block D — NEW section: Sage Calling  (OPTIONAL — your exposure call)
> Calling is live but **admin-approval-gated, not self-serve**. Apply this block only if you want it discoverable to external agents. If you'd rather keep it private, skip Block D (and the Calling skill in File 2). Arm 1 is unaffected either way.

**Anchor:** paste immediately before `## Adoption Guidance for AI Agents` as well (right after the Sage Reflect block from C):

```
## Sage Calling — purpose discovery (multi-stage)

POST https://www.sagereasoning.com/api/calling
Authorization: Bearer <sr_assent_ or sr_prac_ token carrying the `calling` capability>
Content-Type: application/json

A deterministic Q1–Q6 purpose-discovery sequence. OPEN with no `response`; then answer each question. NOT self-serve — a discovered purpose ends in an admin-approval Hard Gate (the operator approves via POST /api/calling/approve; an agent credential cannot approve its own handoff).

Request: { "session_id":"...", "agent_id":"...", "response":"<omit on open; your answer thereafter>", "agent_card_url":"<optional https URL to your agent card>" }

Responses (all HTTP 200, distinguished by `status`):
- in_progress:       { "status":"in_progress", "session_id":"...", "stage":"Q1..Q6", "question":"<verbatim>" }
- awaiting_approval:  { "status":"awaiting_approval", "session_id":"...", "message":"..." }   // Hard Gate
- null_result:       { "status":"null_result", "session_id":"...", "clarification":"<template>" }
- holding | timed_out: the 24-hour holding pattern after a null result
- redirected:        { "status":"redirected", "severity":"moderate|acute", "suggested_user_message":"...", "flow_terminated":true }
Errors: 400 (body) / 401 (auth) / 404 (session) / 409 (state) / 503 (disabled or infra).

Auth requires the `calling` capability (master switch SAGE_CALLING_ENABLED, live).
```

## Block E — cross-cutting (small)
Add a one-line capabilities map near the top of the "For AI Agents" area (optional but useful):
```
Credential capabilities → surfaces: `consult` → /api/reason · `l1_supply` → supplying a precomputed layer1_schema · `reflect` → /api/practice/reflect · `accreditation_write` → /api/accreditation · `calling` → /api/calling. Write-class capabilities (accreditation_write, calling, reflect) are Authorization: Bearer only (no X-Api-Key).
```

---

# FILE 2 — `website/public/.well-known/agent-card.json`  (JSON — validate after)

Minimal, low-collision edits: add skill objects. (The reflect concept already has the `practice-cycle-reflect-default/v1` extension, and Assent has `sage-assent-write-auth/v1`, so no new extensions are required — just discoverable skills.)

## Edit 1 — add a Sage Reflect skill
In the `"skills": [ ... ]` array, add a comma after the current last entry and paste this as the new last element:
```json
{
  "id": "session-close-reflection",
  "name": "Sage Reflect — Session-Close Reflection",
  "description": "Stateful Q1–Q6 post-action reflection over a completed session (never abbreviated). OPEN with session_summary (object: purpose_at_open, circle_at_open, role_at_open, capacity_at_open, sage_reasoning_passes), then answer each returned question until status:'complete' (which returns a profile read-back + mirror note). Requires the `reflect` capability (sr_assent_ or sr_prac_). Full wire shape in llms.txt 'Sage Reflect — session-close reflection'.",
  "tags": ["reflection", "stoic-practice", "session-close", "trajectory"],
  "inputModes": ["application/json"],
  "outputModes": ["application/json"],
  "endpoint": "https://www.sagereasoning.com/api/practice/reflect",
  "method": "POST"
}
```

## Edit 2 — add a Sage Calling skill  (OPTIONAL — only if you applied Block D)
```json
{
  "id": "purpose-discovery",
  "name": "Sage Calling — Purpose Discovery",
  "description": "Deterministic Q1–Q6 purpose-discovery sequence ending in an admin-approval Hard Gate (not self-serve — the operator approves the handoff). Requires the `calling` capability. Full wire shape in llms.txt 'Sage Calling — purpose discovery'.",
  "tags": ["purpose", "alignment", "discovery"],
  "inputModes": ["application/json"],
  "outputModes": ["application/json"],
  "endpoint": "https://www.sagereasoning.com/api/calling",
  "method": "POST"
}
```

## Edit 3 — (optional polish) augment the assent extension's `request_body_shape`
In the `sage-assent-write-auth/v1` extension, the `request_body_shape` string currently says `profile.accreditation_record (object)`. Optionally extend it to name the required record fields (`senecan_grade, typical_proximity, authority_level, dimension_levels{4 keys}, direction_of_travel, actions_evaluated, typical_deliberation_breadth, typical_kathekon_quality`; missing dimension_levels → 503). Low value, easy to fat-finger — skip unless you want completeness.

> **Recommendation:** let me make File 2's edits and run the JSON validator + `npm run build` rather than hand-paste — one misplaced comma 500s the agent card. Say the word.

---

# FILE 3 — `website/src/app/api-docs/page.tsx`  (React/TSX — recommend I apply)

This page renders endpoint sections as JSX (see the existing `Substrate Reasoning (/api/reason)` block ≈ line 480 and `Accreditation` block ≈ line 607). Adding **Sage Reflect** and **Sage Calling** sections means matching that JSX pattern; a stray tag breaks `next build`. This is the one file I'd **strongly recommend I apply directly + build-check**, not hand-paste.

**Content to land** (same substance as llms.txt Blocks C + D, in the page's prose style):
- A "Sage Reflect (`/api/practice/reflect`)" section: auth (`reflect` capability), the OPEN-vs-ANSWER request distinction, and one example of a question-turn and a completion response.
- A "Sage Calling (`/api/calling`)" section (only if you publish Calling): auth (`calling` capability), the session flow, the `status` values, and the admin Hard Gate note.
- One line in the existing endpoints intro noting write-class capabilities are Bearer-only.

---

# Apply order + verify
1. **File 1 (llms.txt)** — paste Blocks A, B1, B2, C, E (and D if publishing Calling). Plain text; just save.
2. **File 2 (agent-card.json)** — Edit 1 (+ Edit 2 if Calling). Then run `python3 -m json.tool website/public/.well-known/agent-card.json > /dev/null && echo OK`.
3. **File 3 (api-docs)** — let me apply + `npm run build`, or apply yourself and build-check.
4. **Build gate:** `cd website && npm run build` must be green before you push (page.tsx/JSON changes are caught here, not by tsc).
5. **Push** — the changes go live on your push (PR17). Then **run Arm 1** as the acceptance test of these very additions.

> Want me to apply Files 2 and 3 (and optionally 1) directly and run the build, then hand you a green diff to review and push? That's the lower-risk path for the JSON/TSX. Your call.
