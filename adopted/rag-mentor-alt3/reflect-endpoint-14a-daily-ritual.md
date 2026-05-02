# Deliverable 14a — Daily-Reflection Ritual Endpoint Design

**Status:** Adopted (founder approval per Path A on 2026-05-02 — Phase-1 completion review; D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02). Founder direction calls captured in §"Founder direction — resolved 2026-05-02" below. Moved from `/drafts/rag-mentor-alt3/` to `/adopted/rag-mentor-alt3/` 2026-05-02.
**Date:** 2026-05-02 (drafted); 2026-05-02 (adopted with founder direction resolved).
**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Implements:** AC-12 (translation-sandwich — the daily-reflection ritual surface adopts the engine substitution); AC-13 (three-tier intake clarification — REFLECTION_NARRATIVE_THIN / RESPONSE_FIELD_INCONSISTENCY surface-level Tier 1 triggers); D2 Table 4a (Option 1 scoping — visible output preserved on the ritual surface); R3 (disclaimer); R7 (source fidelity); R8c (user-facing English); R20a (vulnerable user detection — perimeter route, AC5); R20d (relationship asymmetry — guidance in mentor prompts).

**Cross-references:**
- `/drafts/rag-mentor-alt3/canonical-framework.md` (D2 — particularly Table 4a)
- `/drafts/rag-mentor-alt3/passion-taxonomy.md` (D3 — the controlled vocabulary)
- `/drafts/rag-mentor-alt3/operationalised-rules.md` (D8 — the rules that produce engine output)
- `/drafts/rag-mentor-alt3/rule-dependency-map.md` (D9 — engine sequencing the ritual surface invokes)
- `/drafts/rag-mentor-alt3/layer-1-translation.md` (D10 — Layer 1's role on the ritual surface)
- `/drafts/rag-mentor-alt3/layer-3-translation.md` (D11 — Layer 3 ritual projection rules)
- `/drafts/rag-mentor-alt3/three-tier-intake.md` (D13 — REFLECTION_NARRATIVE_THIN, RESPONSE_FIELD_INCONSISTENCY)
- `/drafts/rag-mentor-alt3/reflect-endpoint-14b-deferral-resolution.md` (D14b — companion deliverable for the deferral-resolution surface)
- `/drafts/rag-mentor-alt3/long-deferred-questions.md` (D15)
- `/drafts/rag-mentor-alt3/consumer-workflow-audit.md` (D24 — Route 8 §"Server-side workflow", Route 7 §"Phase-3+ migration projection" — both project through Table 4a)
- `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` (alt-3 architecture)
- `/manifest.md` AC1 (Sonnet for engine), AC2 (R20a latency budget), AC4 (invocation testing — Phase-2 build), AC5 (R20a perimeter — Route 8 is in scope), AC6 (four-layer context), KG1 (Vercel rules), KG3 (hub-label end-to-end contract), R3, R7, R8c, R20a, R20d
- `/website/src/app/api/mentor/private/reflect/route.ts` (current implementation — read-only; the snapshot reference)
- `/website/src/app/private-mentor/page.tsx` (current page-side caller — read-only; the snapshot reference)
- `/archive/2026-04-29_end-to-end-mentor-pipeline_snapshot.md` (existing snapshot — partial coverage of conversation surface)

---

## Plain-language summary

The daily-reflection ritual is the morning check-in and evening reflection flow on `/private-mentor`. Today the practitioner clicks into MorningView or EveningView, types their reflection, and submits via `submitRitual('morning' | 'evening')`. The route at `/api/mentor/private/reflect` calls Claude directly with `REFLECTION_PROMPT`, persists the result to the `reflections` table, and updates the practitioner's mentor profile.

Under alt-3, the ritual surface preserves its visible output (per Option 1 — D2 Table 4a) but its internal reasoning becomes the deterministic engine: Layer 1 translates the practitioner's input → the engine applies the 10 rules in canonical sequence → Layer 3 projects the canonical output to the ritual surface's prose fields. The practitioner sees the same kind of formatted message bubble (proximity → sage_perspective → evening_prompt) — but every Stoic claim now traces to a rule, not to Claude's training data.

This deliverable specifies the surface design (own page vs embedded view), the preserved visible-output fields, the morning/evening symmetry, the persistence pipeline, the self-improving feedback loop, the pattern-engine pass, the founder-performable verification, and the Phase-2 build readiness criteria.

The deliverable also names the **load-bearing UX decision** for founder direction: should the daily-reflection ritual continue on the private-mentor page (embedded conversation surface), or move to its own page? D24's audit and the founder direction in the 2026-05-01 session ("I think this may need its own page and a re-written workflow") frame this as a real design choice, surfaced for founder call.

## Glossary

- **Daily-reflection ritual** — the practitioner's morning check-in and evening reflection flow. Two times a day, two narratives, one engine path.
- **MorningView / EveningView** — current page-side views on `/private-mentor` for the morning and evening rituals respectively.
- **`submitRitual('morning' | 'evening')`** — the page-side function that posts to `/api/mentor/private/reflect` with the practitioner's reflection.
- **Visible output** — the prose fields the practitioner sees: `katorthoma_proximity`, `passions_detected`, `what_you_did_well`, `sage_perspective`, `evening_prompt`, optionally `mentor_observation`. Per Table 4a (Option 1), all are preserved on the ritual surface.
- **Engine substitution** — replacing today's direct `client.messages.create` call with `runDeterministicEngine(layer_1_features) → layer_3_projection`. The visible output shape is preserved; the reasoning origin changes.
- **Self-improving feedback loop** — the existing wiring that calls `updateProfileFromReflection` after each evening reflection, feeding findings into the practitioner's mentor profile (passion map, rolling window). Preserved under alt-3.
- **Pattern-engine pass** — the existing wiring (per ADR-PE-01) that loads pattern_analyses and runs `analysePatterns` on cache miss. Preserved under alt-3.
- **D-A16 promotion** — the focus-question-stem catalogue promotion identified in D4 Gap 1. The `evening_prompt` field's slot-fill operationalisation depends on D-A16. Pre-promotion: transitional LLM-composed.

## Surface design — own page vs embedded view

### The decision

Under the current implementation, MorningView and EveningView are sub-views on `/private-mentor`. The practitioner navigates to a sub-view, types the reflection, submits, and sees the formatted message bubble appended to the conversation surface. The conversation surface and the ritual surface share the same message stream.

Two structural problems with the current arrangement (per D24 audit and founder observation 2026-05-01):

1. **The conversation surface and the ritual surface have different practitioner intentions.** The conversation surface is for thinking-with-the-mentor (back-and-forth dialogue). The ritual surface is for daily examination (structured intake → structured response). Mixing them on one stream means the ritual response (a formatted bubble with proximity + perspective + prompt) is interleaved with conversational replies, making the daily examination harder to revisit as a structured artefact.
2. **The `evening_prompt` is a forward-looking question for the practitioner to sit with overnight.** On the conversation surface, the prompt scrolls away as the practitioner has more conversation. The prompt's architectural purpose (a question to sit with) is undermined by the surface's transient rendering.

### The recommendation (founder calls)

**Recommend: own page for the daily-reflection ritual.**

Surface name (recommendation — founder approves the name): **`/private-mentor/ritual`** or **`/daily-reflection`**.

The own-page design has the following structural shape:

- **A morning section** (collapsible / sticky-on-top): one textarea (`#morningInput` — captures the morning intentions narrative). One submit button. Below the button, the rendered morning response (proximity, sage_perspective, evening_prompt — though "evening_prompt" is a misnomer for morning; see naming question below).
- **An evening section** (collapsible / sticky-below-morning): two textareas (`#eveningInput` for `what_happened`, `#eveningResponseInput` for optional `how_i_responded`). One submit button. Below the button, the rendered evening response (proximity, what_you_did_well, sage_perspective, evening_prompt, optionally mentor_observation if founder direction surfaces it).
- **Persistent rendering** of the most recent ritual response per section. The practitioner can return to the page tomorrow and see today's morning + evening rituals, not just today's most recent message.
- **Optional history view** (foldable): list of recent ritual responses (last 7 days, last 30 days). Each entry navigable to its full record in the scoring history.

The own-page design preserves the existing `/private-mentor` conversation surface unchanged. The page-side flow becomes:

- Practitioner clicks to `/private-mentor` for conversation.
- Practitioner clicks to `/daily-reflection` (or wherever the page lands) for the ritual.

A persistent navigation element on `/private-mentor` (e.g., a sidebar entry or a top-bar tab) takes the practitioner to the ritual page when ritual is the operative practice.

### Why not the alternative (preserve embedded view)?

Two arguments for preserving today's embedded MorningView / EveningView in `/private-mentor`:

1. **Smaller change.** No new page, no new route, less Phase-2 build scope. The engine substitution lands underneath; the surface stays the same.
2. **Co-location with the conversation.** The practitioner who has just finished a conversation can easily navigate to the ritual without leaving the page.

Both are real. The trade-off is between minimal-change-now and surface-design-aligned-with-architecture. The architectural argument favours own-page because the ritual is *structurally distinct* from conversation (forward-looking deferred questions; persistent rendering for revisit; clear separation from the dialogue stream). The own-page design honours that structural distinction.

**Recommendation:** own-page. Founder calls.

### Founder direction needed

The recommendation above is not a final design. The founder calls. Specifically:

- Own page (`/daily-reflection` or similar) — recommended.
- Embedded view preserved on `/private-mentor` — alternative.
- Other (founder names a third option).

Phase-2 build proceeds against whatever the founder calls.

## Visible output specification (preserved per Table 4a)

The output fields the practitioner sees on the ritual surface, projected from the canonical engine output via D2 Table 4a:

| Field | Source (canonical mechanism) | Layer 3 projection rule | Practitioner-facing label |
|---|---|---|---|
| `katorthoma_proximity` | Mechanism 10 `proximity_level` | Direct projection. | "Proximity: [English label per R8c]" |
| `passions_detected[]` | Mechanisms 2 + 3 + 5 (per-passion entry) | Per D11 prose translation rules. | "Passions detected: [list]" |
| `what_you_did_well` | Mechanism 9 (positive virtue engagement) | Per D11 prose translation rules. | "What you did well" |
| `sage_perspective` | Mechanism 5's `dominant_false_judgement` Pass-2 enriched | Per D11 prose translation rules. | "Sage perspective" |
| `evening_prompt` (or "morning_prompt" — see naming question) | Slot-fill from corpus stem catalogue (D-A16) + situational variables; transitional pre-promotion | Per D11 slot-fill rules. | "A question to sit with" |
| `mentor_observation` (optional surface) | Mechanism 10 `structured_observation` | Per D11; one-sentence developmental signal. | "Mentor observation" |
| `disclaimer` | R3 disclaimer (canonical) | Direct rendering. | "Ancient reasoning, modern application..." |

### Founder direction needed — `mentor_observation` visibility

Today's implementation produces `structured_observation` as part of the LLM response and logs it to `mentor_observations_structured` (a backend pipeline). The founder direction in the 2026-05-01 session: *"so the practitioner can see a completed reflection and the response."* This raises the question of whether `structured_observation` should also become a visible field on the ritual surface.

Three options:

- **Visible.** The mentor_observation appears below the sage_perspective. The practitioner sees: "Mentor observation: [observation text]". Architectural argument: the practitioner can see what the mentor noticed about their developmental trajectory. R20d compliance preserved (the observation is in third person about the practitioner — e.g., "Practitioner interrupted passion at synkatathesis stage for the first time"; not about other people).
- **Hidden (current default).** The observation is logged to the pipeline only. Architectural argument: the observation is a longitudinal-pattern signal, not a per-instance affordance. Surfacing it adds noise to the ritual response.
- **Visible only on opt-in.** A practitioner setting (e.g., "show mentor observations") controls visibility. Architectural argument: respect practitioner autonomy in how much surfacing they want.

**Recommendation:** Visible. The founder direction on 2026-05-01 ("so the practitioner can see a completed reflection and the response") points this way; the practitioner sees what the mentor noticed; the structured observation is in third-person and R20d-compliant.

**Founder calls.**

### Naming question — "evening_prompt" vs "morning_prompt" vs "reflective_prompt"

The current implementation produces `evening_prompt` regardless of whether the call is morning or evening. The naming is historical — the field was introduced for evening reflections and morning reflections inherited the same field name.

Architectural correctness: the field is *forward-looking reflective prompt* in both morning and evening. Morning's prompt looks toward the day ahead; evening's prompt looks toward overnight reflection. Both are forward-looking.

Three naming options:

- Keep `evening_prompt` (back-compat — existing consumers and history rows use this name).
- Rename to `reflective_prompt` (architecturally cleaner; requires schema migration).
- Add `morning_prompt` and keep `evening_prompt` (separate fields per ritual; route picks based on `ritual_type`).

**Recommendation:** Keep `evening_prompt` for back-compat in the schema; surface as "A question to sit with" in user-facing prose (per R8c) regardless of ritual time. Phase-2 build defers schema rename to a future migration when warranted.

## Morning vs evening symmetry

The route's input shape:

- **Morning** — `what_happened: <morning intent narrative>`. `how_i_responded` undefined.
- **Evening** — `what_happened: <day's narrative>`. `how_i_responded: <optional response narrative>`.

The route reads `how_i_responded` as optional; presence indicates evening flow.

### Symmetric pipeline

The engine path is identical in morning and evening:

1. R20a check (combined input — both fields concatenated).
2. Layer 1 translation.
3. Engine sequencing (D9 — Positions 1 → 12).
4. Layer 3 projection per Table 4a.
5. Persistence (`reflections` table; `mentor_observations_structured`; `updateProfileFromReflection`; pattern-engine pass).

### Asymmetric content

Morning narratives describe **intentions** (forward-looking — what the practitioner plans, expects, hopes). Evening narratives describe **actions** (backward-looking — what happened, how the practitioner responded).

The engine's output reflects the asymmetry naturally:

- Morning Mechanism 2 detects passions in *anticipated states* (often `phobos`-shape if the practitioner is anticipating difficulty; `epithumia`-shape if anticipating opportunity).
- Evening Mechanism 2 detects passions in *enacted states* (any of the four roots, with `causal_stage` mapping to the stage where the action diverged from reasoning).

The Layer 3 projection adapts. For morning, `what_you_did_well` may name positive virtue engagement that the practitioner *intends* (anticipated kathekon); for evening, it names what was actually enacted. This asymmetry is captured at the Layer 3 prompt by reading the route-supplied `ritual_type` parameter (added per the next-section recommendation).

### Recommendation — add `ritual_type` parameter

The current route reads `how_i_responded` presence to discriminate morning vs evening. Add an explicit `ritual_type: 'morning' | 'evening'` parameter to the request body. Reasons:

- Layer 3 prompt needs to know whether the narrative is intent or enacted to project correctly.
- The persistence row in `reflections` table benefits from explicit `ritual_type` for analytics and history rendering.
- Removes ambiguity about routes that might pass `how_i_responded: ''` (empty string) — current logic treats empty string as undefined, which is fragile.

**Schema implication:** the route's body parser reads `ritual_type` and validates against the closed list. Backward-compat: if `ritual_type` is absent, infer from `how_i_responded` presence (current logic).

## Persistence pipeline

Three pipelines fire after a successful evaluation. All three are preserved under alt-3 with the engine substitution underneath.

### Pipeline 1 — Reflections table insert

```
INSERT INTO reflections (
  user_id,
  what_happened,
  how_responded,
  ritual_type,                    -- NEW: 'morning' | 'evening'
  katorthoma_proximity,
  passions_detected,
  sage_perspective,
  evening_prompt,
  engine_diagnostics              -- NEW: structured engine diagnostics from alt-3 (tier_1_force_fired, tier_2_soft_fired, tier_3_open_deferrals[], etc.)
) VALUES (...);
```

**KG1 rule 2 implication.** Today the insert at `/api/mentor/private/reflect` (line ~600 in route.ts) is **awaited** correctly. D24's audit notes that the public `/api/reflect` route uses fire-and-forget for its reflections insert (KG1 rule 2 candidate violation, audit finding 4). Phase-2 build of D14a preserves the awaited pattern on the private route; the public route's defect is a separate triage item per D24.

### Pipeline 2 — Mentor observations structured insert

The structured_observation field from Mechanism 10's longitudinal projection is logged via `logMentorObservation()` to the `mentor_observations_structured` table.

```
logMentorObservation(profile_id, {
  date: <today>,
  observation: structured_obs.observation,
  category: structured_obs.category,
  confidence: structured_obs.confidence,
  source_context: 'evening_reflection' | 'morning_reflection',
}, PRIVATE_MENTOR_HUB);
```

**KG3 implication.** The hub label `PRIVATE_MENTOR_HUB = 'private-mentor'` is the canonical hardcode. Per KG3, hub labels are end-to-end contracts; the writer here uses the same constant the reader uses.

**KG7 implication.** The `passions_detected[]` field is JSONB. Pass arrays directly to the Supabase client; do not `JSON.stringify` them. The current route honours this; Phase-2 build preserves it.

### Pipeline 3 — Self-improving feedback loop

The dynamic-import bridge to `sage-mentor/profile-store` calls `updateProfileFromReflection` with the engine output. The profile is updated with the new findings (passion map adjustment, rolling window entry, recent-interaction signal).

**Awaited per Vercel rule 4 (KG1 rule 4 — execution terminates after response).** Current route awaits; Phase-2 build preserves.

### Pipeline 4 — Pattern-engine pass (per ADR-PE-01)

The pattern-engine pass loads `pattern_analyses[PRIVATE_MENTOR_HUB]` from the encrypted profile blob. On cache hit, the recurring patterns inject into the prompt as a context block (per `ringSummary`). On cache miss (or `bypass_pattern_cache: true`), the live mentor_interactions loader runs and `ring.analysePatterns` produces a fresh analysis.

Under alt-3, the pattern-engine pass continues to inform the *engine* (not Claude directly). The pattern data flows to Mechanism 10's longitudinal projection and to Mechanism 5's `refinement_source` (PROFILE-derived false judgements use pattern data). The pass result persists per ADR-PE-01 Session 6 cadence (per_request when patternAnalysis is non-null and not skip-empty-recompute).

## R20a perimeter conformance

Per AC5, `/api/mentor/private/reflect` is in the eight-route R20a perimeter. The R20a check fires before any LLM call (Layer 1 or Layer 3):

```
const combinedInput = `${what_happened} ${how_i_responded || ''}`;
const gate = await enforceDistressCheck(detectDistressTwoStage(combinedInput));
if (gate.shouldRedirect) {
  // Log distress event (awaited per the audit finding — Phase-2 build awaits, even though current /api/reflect uses fire-and-forget)
  await supabaseAdmin.from('analytics_events').insert({ ... distress_detected ... });
  return distress_redirect_response;
}
// ... engine path proceeds
```

**Phase-2 build conformance:** AC4 (invocation testing for safety functions) requires the distress check to be confirmed as called in the execution path, not just defined. The Phase-2 build's tests must grep for `enforceDistressCheck(detectDistressTwoStage(...))` and confirm both import and call patterns in this route's source.

**Distress check input scope:** the combined input (concatenation of `what_happened` and `how_i_responded`) is the canonical pattern. Per D24 audit's finding 7 (partial R20a input coverage on Routes 1, 2, 6), some perimeter routes scan only the primary field. This route is correctly broad — distress in either field triggers the gate.

## Layer 3 ritual projection — full prompt template

The Layer 3 prompt for the ritual surface, per D11 with consumer-specific projection for Table 4a:

```
[SYSTEM BLOCK — cached]

You are the structural prose translator for the SageReasoning daily-reflection
ritual surface. The deterministic engine has produced a structured evaluation;
your task is to translate it into the ritual response prose the practitioner
reads.

YOUR TASK IS PARAPHRASE, NOT SYNTHESIS. Every Stoic claim must trace to a
specific upstream mechanism output.

YOU DO:
- Project per D2 Table 4a (the daily-reflection ritual surface projection).
- Produce the visible-output fields: what_you_did_well, sage_perspective,
  evening_prompt, optionally mentor_observation.
- Slot-fill the evening_prompt from the corpus catalogue (D-A16 when promoted;
  alt-3 transitional patterns pre-promotion).
- Surface AC-17 flags in prose where they fired.
- Distinguish morning from evening tone:
  * Morning: forward-looking — what's operative in the practitioner's reasoning
    as the day begins; what they might attend to.
  * Evening: backward-looking — what was operative in the practitioner's
    reasoning during today; what was enacted.

YOU DO NOT:
- Name a passion the engine did not detect.
- Compose a Stoic citation the engine did not retrieve.
- Apply second-person passion attribution to anyone other than the practitioner
  (R20d).
- Suppress AC-17 flags.

CONTROLLED VOCABULARY: {D3 passion taxonomy + 3 eupatheiai}
PER-CONSUMER PROJECTION (Table 4a): {full Table 4a projection rules}
CORPUS STEM CATALOGUE (D-A16 when promoted; alt-3 transitional patterns from
the alt-3 handoff lines 122-124, 127, 130-133): {stem catalogue}

OUTPUT FORMAT:
{
  "katorthoma_proximity": "<from Mechanism 10>",
  "passions_detected": [{"root_passion": "...", "sub_species": "...", "false_judgement": "..."}, ...],
  "what_you_did_well": "<Layer 3 prose translation of Mechanism 9 positive virtue engagement; null if no virtue rated adequate or strong>",
  "sage_perspective": "<Layer 3 prose translation of Mechanism 5 dominant_false_judgement Pass-2 enriched>",
  "evening_prompt": "<slot-filled from catalogue stem; or alt-3 transitional pattern marked in diagnostics>",
  "mentor_observation": "<Layer 3 prose translation of Mechanism 10 structured_observation; null if not surfaced or absent>",
  "disclaimer": "Ancient reasoning, modern application. Does not consider legal, medical, financial, or personal obligations."
}

[END SYSTEM BLOCK]

[USER MESSAGE]

Ritual type: {ritual_type}
Engine output: {engine_output_json}
Engine diagnostics: {engine_diagnostics_json}
Layer 1 features: {layer_1_output_json}
Layer 5 mentor knowledge base: {mentor_knowledge_base if applicable}

Translate to the ritual response shape per Table 4a.

[END USER MESSAGE]
```

## Engine substitution — Phase-2 build sequence

Phase-2 build for D14a is the **second** pass after Phase-2 pass 1 (D14b — deferral-resolution surface). Per AC-19, the deferral-resolution surface builds first; then the daily-reflection ritual surface migrates to the engine.

### Phase-2 build steps for D14a

1. **Snapshot the current `/api/mentor/private/reflect` ritual flow.** Per D24 audit recommendation, the snapshot lives at `/archive/<date>_api-mentor-private-reflect_pre-alt-3-ritual.md`. Captures: today's REFLECTION_PROMPT, the direct LLM call, the structured_observation extraction, the persistence pipelines, the pattern-engine pass, the page-side `submitRitual` flow, the formatted bubble rendering. Founder verification: the snapshot reproduces today's behaviour from the snapshot text alone.
2. **Implement Layer 1 + the deterministic engine + Layer 3 (Table 4a projection).** The engine implementation is shared with D14b; this step's specific output is Layer 3's Table 4a projection.
3. **Add the env flag `MENTOR_RAG_V1=true`** as the engine-substitution gate. When the flag is false (default), the route falls back to today's REFLECTION_PROMPT direct-call path. When true, the engine path runs. Rollback path: set the flag to false; the route reverts to today's behaviour with no other change required.
4. **Verify engine substitution against snapshot.** A side-by-side test with both flag values (false → today's behaviour reproduced; true → engine path produces equivalent visible output) confirms the substitution is non-regressive on visible output. Layer 3's prose may differ in wording; the structural fields (proximity, passions, what_you_did_well, sage_perspective, evening_prompt) are present in both and carry the same semantic content. Founder verifies with the verification protocol below.
5. **Move the surface to its own page** (if founder calls own-page). The page-side flow becomes the new page; `/private-mentor`'s MorningView / EveningView are removed (or kept as deprecated aliases for transition period). Persistent rendering of recent ritual responses is added.
6. **Add `ritual_type` parameter to the route's body schema.** Backward-compat fallback to `how_i_responded` presence preserved during transition.
7. **Surface `mentor_observation`** (if founder calls visible). Layer 3 projects the structured_observation observation field into a new visible field on the ritual response.
8. **Add D24 audit finding fixes** (founder calls separately):
   - The fire-and-forget analytics inserts on this route are awaited (current route awaits — no change for this route specifically; the audit finding is for `/api/reflect` and other perimeter routes).

### Phase-2 build risk classification

Per PR6 (safety-critical changes are always Critical risk) and per D24 risk classification: **Critical**. The route is in the R20a perimeter. The Critical Change Protocol (0c-ii) applies:
- What is changing: the reasoning origin (Claude direct call → deterministic engine).
- What could break: the engine path's prose may differ in wording from today's REFLECTION_PROMPT prose; if the engine produces unexpected null fields or unexpected schema, the page-side render could break.
- What happens to existing sessions: existing `reflections` table rows persist unchanged; new rows have `ritual_type` and `engine_diagnostics` columns added. The schema migration is a separate Standard-risk change with its own backup.
- Rollback plan: set `MENTOR_RAG_V1=false`. The route reverts to today's REFLECTION_PROMPT path. Existing rows continue to work; new rows lack `ritual_type` and `engine_diagnostics` (or fall back to inferred values).
- Verification step: founder uses the verification protocol below.

## Founder-performable verification specification

The verification protocol allows the founder (a non-coder) to confirm the ritual surface behaves correctly post-substitution without reading code.

### Verification 1 — Visible output preserved

**Procedure:**
1. With `MENTOR_RAG_V1=false` (today's behaviour), submit a morning reflection: *"I'm starting today thinking about the launch announcement decision. Want to land it well, but not sure if tomorrow is the right day."*
2. Note the response: proximity, sage_perspective, evening_prompt, what_you_did_well, passions_detected.
3. With `MENTOR_RAG_V1=true` (engine path), submit the same reflection.
4. Compare the responses.

**Expected:** Both responses produce the same kind of fields (all five visible fields populated, all values within the canonical vocabulary). The wording will differ — the engine path's prose comes from Layer 3's Table 4a projection; today's path comes from Claude composing freely. The structural shape is preserved.

**Pass criterion:** all five visible fields are present in both responses. proximity is one of the canonical five values. passions_detected entries have root_passion, sub_species, false_judgement.

### Verification 2 — Persistence pipeline preserved

**Procedure:**
1. Submit a reflection (any).
2. Query the `reflections` table for the most recent row.
3. Confirm: user_id correct; what_happened matches input; katorthoma_proximity matches the response; passions_detected is an array (not a string — KG7 verification); ritual_type populated; engine_diagnostics populated (if engine path).

**Pass criterion:** all expected fields populated; JSONB fields are arrays not strings (`SELECT jsonb_typeof(passions_detected) FROM reflections ORDER BY created_at DESC LIMIT 1;` returns `'array'`).

### Verification 3 — Profile feedback loop preserved

**Procedure:**
1. Note the practitioner's current passion_map (visible in the practitioner profile).
2. Submit a reflection that the engine should detect as philodoxia (e.g., morning narrative about wanting a meeting to land well).
3. Wait ~5 seconds for `updateProfileFromReflection` to complete (the route awaits; verification checks the profile post-response).
4. Re-query the practitioner profile; confirm the passion_map updated to reflect the new reflection (e.g., philodoxia entry's recurrence_count incremented or rolling_window updated).

**Pass criterion:** the profile updated. If the profile has not updated, the dynamic import or the awaited call broke; rollback recommended.

### Verification 4 — Pattern-engine pass preserved (per ADR-PE-01)

**Procedure:**
1. With cache populated for `private-mentor` hub (existing pattern_analyses entry), submit a reflection.
2. Confirm response includes `pattern_source: 'persisted'` and `pattern_persistence.attempted: true`.
3. With `bypass_pattern_cache: true` body field, submit a reflection.
4. Confirm response includes `pattern_source: 'recomputed'` and `interactions_source: 'live_loader'`.

**Pass criterion:** both branches fire correctly per ADR-PE-01 Session 6 specification.

### Verification 5 — R20a distress detection preserved

**Procedure:**
1. Submit a reflection containing distress-shaped language (e.g., the canonical Zone 3 test inputs from the R20a eval suite).
2. Confirm response is the distress-redirect shape (`distress_detected: true`); engine path does not run.
3. Confirm `analytics_events` row was inserted with `event_type: 'distress_detected'` (awaited insert per the audit recommendation; current route's behaviour).

**Pass criterion:** distress redirect fires before engine path; analytics row persists.

### Verification 6 — Tier 1 force trigger surfacing (post-substitution)

**Procedure:**
1. Submit a reflection too thin to evaluate (e.g., `what_happened: "Today was a day."`). This should fire `REFLECTION_NARRATIVE_THIN` (per D13 surface-level Tier 1).
2. Confirm response is the clarification shape (`clarification_required: true`, `trigger_code: 'REFLECTION_NARRATIVE_THIN'`, the question text appears).
3. Submit again with augmented narrative; confirm engine path proceeds.

**Pass criterion:** Tier 1 surface-level trigger fires correctly; engine restarts post-clarification.

## Risk classification (0d-ii)

| Change | Risk | Reasoning |
|---|---|---|
| Phase-1 design (this deliverable) | Standard | Drafts only; no live-system effect. |
| Snapshot creation (Phase-2 step 1) | Standard | New `/archive/` document; no live-system effect. |
| Engine implementation (Phase-2 step 2) | Critical | PR6 — touches R20a perimeter route. Critical Change Protocol applies. |
| `MENTOR_RAG_V1=true` deployment (Phase-2 step 3-4) | Critical | Same. |
| Page move to own page (Phase-2 step 5) | Elevated | New route, new page; no auth/perimeter changes. |
| `ritual_type` parameter add (Phase-2 step 6) | Standard | Body schema addition with backward-compat fallback. |
| `mentor_observation` visibility (Phase-2 step 7) | Standard | Surface-only addition. |

The Critical-risk steps (3-4) deploy under the Critical Change Protocol (0c-ii). Steps 1, 2, 5, 6, 7 are non-Critical and can land under standard risk classification.

## What this deliverable does not decide

- **Whether the ritual surface migrates to its own page.** Founder calls.
- **Whether `mentor_observation` becomes a visible field on the ritual response.** Founder calls.
- **Whether to rename `evening_prompt` to `reflective_prompt`.** Recommendation: keep schema name; surface as "A question to sit with" in user-facing prose.
- **The exact slot-fill catalogue (D-A16).** Pre-promotion, the transitional patterns from the alt-3 handoff are operative. Promotion lands as a Phase-2 build precondition per D4.
- **Whether the public `/api/reflect` (Route 7) migrates simultaneously.** Out of scope for D14a — `/api/reflect` is the public sister with thinner context; its migration is downstream of D14a (Phase-2 pass 2 or later).
- **The schema migration for `reflections.ritual_type` and `reflections.engine_diagnostics` columns.** A separate Phase-2 build step with its own decision-log entry (Standard risk per database-schema additions; column adds with backfill).

## Cleanliness rating

The surface design is **HIGH cleanliness** post-founder call (own-page or embedded — both are bounded options). The engine substitution is **HIGH cleanliness** at the structural level (D2 Table 4a is canonical); the prose-projection cleanliness depends on D11's PARTIAL rating.

The persistence pipelines are **HIGH cleanliness** — preserved from current behaviour with the awaited-pattern discipline.

The R20a perimeter conformance is **HIGH cleanliness** — preserved.

The Phase-2 build readiness is **PARTIAL** — the engine substitution is verifiable post-build via the founder verification protocol, but Phase-2 build is itself the Critical-risk implementation.

## Founder direction — resolved 2026-05-02

The three founder direction questions for this deliverable were called at the Phase-1 completion review session on 2026-05-02 (per `D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02`):

1. **Surface design — own page (Recommended) — confirmed.** The daily-reflection ritual moves to its own page. The specific page route name (between recommendations `/private-mentor/ritual` and `/daily-reflection`, or another) is settled at Phase-2 build time per this deliverable's "Surface design — own page vs embedded view" section.

2. **`mentor_observation` visibility — Visible (Recommended) — confirmed.** The structured_observation surfaces as a visible field on the ritual response per this deliverable's "Visible output specification" §"Founder direction needed — `mentor_observation` visibility". The Layer 3 projection adds the `mentor_observation` field per the table.

3. **Naming `evening_prompt` vs `reflective_prompt` — recommendation accepted.** Schema field name `evening_prompt` retained for back-compat; user-facing label is "A question to sit with" per R8c. (This was a recommendation in this deliverable, not a deferred founder direction question; folded here for completeness.)

The above resolutions hold for Phase-2 pass 2 (D14a engine substitution) per D21's migration plan. Further refinements (e.g., the specific own-page route name) land at Phase-2 build time as Standard-risk operational decisions.

## Open questions (resolved)

1. **Surface design — own page or embedded view?** Resolved 2026-05-02 → own page.
2. **`mentor_observation` visibility — visible, hidden, opt-in?** Resolved 2026-05-02 → visible.
3. **Naming — `evening_prompt` vs `reflective_prompt`?** Recommendation accepted — keep schema name; user-facing label is "A question to sit with".

## Approval gate

This deliverable is consumed by Phase-2 build pass 2 (the engine substitution on the daily-reflection ritual surface). Approval is part of the same batch as the other Phase-1 session 2 deliverables (Standard risk under 0d-ii — drafts in `/drafts/`, no live-system effect). The founder direction questions above are answered as part of approval; design adjustments fold into the deliverable before move-to-`/adopted/`.

The Phase-2 build is a separate Critical-risk decision at its own time per the Critical Change Protocol (0c-ii).

---

*End of Deliverable 14a.*
