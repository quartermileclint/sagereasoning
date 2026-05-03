// ============================================================================
// 2026-05-03 — D-A16 catalogue population (27 focus_question_stem rows)
// ============================================================================
//
// Source: D-A16 catalogue (Adopted 2026-05-02) Sections 1-6 — the 27 stem
//         entries with their slot_fields, source_citations, and trigger_conditions.
//         + D5 corpus_passages schema (Adopted 2026-05-02) — the table this
//           script populates.
//         + KG7 (JSONB storage shape — canonical_mechanism + slot_fields passed
//           as plain JS arrays/objects, never JSON.stringify-ed).
//         + KG1 rule 2 (await all DB writes).
//         + Path B per D-CORPUS-PASSAGES-SCHEMA-2026-05-03 (ritual stems use
//           synthetic intake_tier:1; trigger_condition RITUAL_MORNING_PROMPT /
//           RITUAL_EVENING_PROMPT carries the semantic distinction).
//
// What this script does:
//   1. Defines the 27 D-A16 catalogue stems as plain JS objects, each shaped
//      to the corpus_passages schema (passage_type='focus_question_stem',
//      source_file='focus-questions', audience_tier='R8c').
//   2. Validates KG7 compliance (canonical_mechanism + slot_fields are arrays
//      / objects, not stringified) before each upsert.
//   3. Upserts each row into corpus_passages (idempotent via passage_id UNIQUE).
//   4. Reports progress + final count of focus_question_stem rows.
//
// Stem inventory (27 entries):
//   Section 1 — Tier 3 engine-level (2): T3-001, T3-002 (Phase-2 pass-1 blocking)
//   Section 2 — Tier 1 engine-level (4): T1E-001 through T1E-004
//   Section 3 — Tier 2 engine-level (2): T2E-001, T2E-002
//   Section 4 — Tier 1 surface-level (8): T1S-001 through T1S-008
//   Section 5 — Tier 2 surface-level (4): T2S-001 through T2S-004
//   Section 6 — Ritual stems (7): RIT-M-001..003, RIT-E-001, RIT-E-001b, RIT-E-002, RIT-E-003
//
// SESSION DEFERRAL NOTE: embedding column is NULL across all rows. Generation
//   deferred to Sub-session C alongside D6 retrieval interface + D7 re-ranker.
//
// To run:
//   cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
//   node operations/migrations/2026-05-03-d-a16-catalogue-population.mjs
//
// Expected output:
//   "27 D-A16 catalogue stems prepared."
//   "Upserted 27 rows. Errors 0."
//   "Final focus_question_stem count: 27 rows."
//   "Final corpus_passages total count: 186 rows (159 corpus + 27 D-A16 stems)."
//
// Idempotent: re-runs upsert by passage_id UNIQUE. Safe to re-run if interrupted.
//
// Rollback: DELETE FROM corpus_passages WHERE passage_type = 'focus_question_stem';
//           (then re-run script if needed).
// ============================================================================

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

// ----------------------------------------------------------------------------
// Step 0 — Load env vars from website/.env.local
// ----------------------------------------------------------------------------

function loadEnv() {
  const envPath = './website/.env.local';
  let envFile;
  try {
    envFile = readFileSync(envPath, 'utf-8');
  } catch (err) {
    console.error(`ERROR: cannot read ${envPath}. Run from project root.`);
    process.exit(1);
  }
  envFile.split('\n').forEach((line) => {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  });
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing from website/.env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ----------------------------------------------------------------------------
// Step 1 — The 27 D-A16 catalogue stems
// ----------------------------------------------------------------------------
// Each entry below is the catalogue's row-shape literally transposed into the
// corpus_passages schema. Common defaults (passage_type, source_file,
// audience_tier) are spread via SHARED to keep the data block readable.
// ----------------------------------------------------------------------------

const SHARED = {
  passage_type: 'focus_question_stem',
  source_file: 'focus-questions',
  audience_tier: 'R8c',
};

const STEMS = [
  // ============================================================================
  // Section 1 — Tier 3 engine-level (Phase-2 pass-1 blocking minimum)
  // ============================================================================

  // T3-001 — EUPATHEIA_BOUNDARY
  {
    ...SHARED,
    passage_id: 'tier_3:eupatheia_boundary:001',
    source_citation: 'D13 §"Engine-level Tier 3 triggers (full text) — EUPATHEIA_BOUNDARY"',
    canonical_mechanism: ['passion_root_detection', 'passion_false_judgement', 'katorthoma_proximity'],
    passion: null,
    sub_passion: null,
    trigger_condition: 'EUPATHEIA_BOUNDARY',
    intake_tier: 3,
    slot_fields: [
      { variable_name: 'EUPATHEIA_SHAPE', source_path: 'engine_output.mechanism_2.eupatheia_candidate', constraint: 'eupatheia_id (chara | boulesis | eulabeia)' },
      { variable_name: 'TIME_WINDOW', source_path: "layer_5_context.longitudinal_window_label (default '30 days')", constraint: 'time_phrase' },
      { variable_name: 'SITUATIONAL_TRIGGER', source_path: 'layer_1_output.entities[].description (highest narrative_weight)', constraint: 'noun_phrase' },
      { variable_name: 'EUPATHEIA_DESCRIPTION', source_path: 'passion_taxonomy.eupatheiai[EUPATHEIA_SHAPE].description (per D3)', constraint: 'descriptive_phrase' },
      { variable_name: 'PASSION_COUNTERPART_DESCRIPTION', source_path: 'passion_taxonomy.passion_counterpart[EUPATHEIA_SHAPE].description (per D3)', constraint: 'descriptive_phrase' },
    ],
    text: 'You described responding with [EUPATHEIA_SHAPE]. Across [TIME_WINDOW], when [SITUATIONAL_TRIGGER] arose in this domain — was your inner state actually [EUPATHEIA_DESCRIPTION], or was it more like [PASSION_COUNTERPART_DESCRIPTION]?',
    paragraph_text: "Worked example (chara case): Practitioner narrative names \"felt joy at the team's win.\" Engine fires eupatheia_candidate: chara (joy-shape) with confidence_weighted: low (single-instance). EUPATHEIA_BOUNDARY fires; OPEN_DEFERRAL is created with the question filled as: \"You described responding with chara (joy in another's good). Across the last 30 days, when the team's wins arose — was your inner state actually genuine joy in their good as ends in themselves, or was it more like philodoxia (pleasure in being associated with success)?\"",
  },

  // T3-002 — PRAXIS_MOTIVATION_AMBIGUITY
  {
    ...SHARED,
    passage_id: 'tier_3:praxis_motivation_ambiguity:001',
    source_citation: 'D13 §"Engine-level Tier 3 triggers (full text) — PRAXIS_MOTIVATION_AMBIGUITY"',
    canonical_mechanism: ['passion_false_judgement', 'virtue_domain_engaged', 'katorthoma_proximity'],
    passion: null,
    sub_passion: null,
    trigger_condition: 'PRAXIS_MOTIVATION_AMBIGUITY',
    intake_tier: 3,
    slot_fields: [
      { variable_name: 'SURFACE_PATTERN', source_path: 'engine_output.mechanism_10.proximity_level + English label per R8c', constraint: "proximity_phrase (e.g., 'an action approaching the principled level')" },
      { variable_name: 'VIRTUE_DESCRIPTION', source_path: 'engine_output.mechanism_9.virtue_engagement[].virtue (strongest rated; per D3 description)', constraint: "virtue_phrase (e.g., 'phronesis — practical wisdom understanding the right action')" },
      { variable_name: 'CONVENTION_DESCRIPTION', source_path: 'operationalised_rules.rule_10.proximity_risk_flag.CONVENTION_SUBSTITUTION.description', constraint: "convention_phrase (e.g., 'habit, social expectation, or what is conventionally praiseworthy')" },
    ],
    text: 'In this instance, the action looked like [SURFACE_PATTERN]. The engine cannot tell from the current instance alone whether you acted from [VIRTUE_DESCRIPTION] or from [CONVENTION_DESCRIPTION]. When you reflect on what was operative for you in that moment, what do you find?',
    paragraph_text: "Worked example: Practitioner narrative names \"I gave the difficult feedback to my colleague.\" Engine output: proximity_level: principled, weakest_dimension: phronesis_andreia, proximity_risk_flag: CONVENTION_SUBSTITUTION because the engine cannot rule out the action being habitual professional practice. PRAXIS_MOTIVATION_AMBIGUITY fires; OPEN_DEFERRAL with: \"In this instance, the action looked like an action approaching the principled level. The engine cannot tell from the current instance alone whether you acted from phronesis (understanding the right action toward your colleague's good) or from habit and what is conventionally expected of a manager. When you reflect on what was operative for you in that moment, what do you find?\"",
  },

  // ============================================================================
  // Section 2 — Tier 1 engine-level (force clarification at intake)
  // ============================================================================

  // T1E-001 — ELEMENT_FUSION (canonical D13 form)
  {
    ...SHARED,
    passage_id: 'tier_1:element_fusion:001',
    source_citation: 'D13 §"Engine-level Tier 1 triggers (full text) — ELEMENT_FUSION"',
    canonical_mechanism: ['layer_1_translation'],
    passion: null,
    sub_passion: null,
    trigger_condition: 'ELEMENT_FUSION',
    intake_tier: 1,
    slot_fields: [
      { variable_name: 'LIST_OF_FUSED_CONCERNS', source_path: "layer_1_output.fused_concerns[] (comma-separated; ' and ' before final element)", constraint: 'noun_phrase_list' },
    ],
    text: 'There are several distinct concerns here — [LIST_OF_FUSED_CONCERNS]. Before I work through this with you, can you tell me which one of these is most centrally on your mind right now?',
    paragraph_text: null,
  },

  // T1E-002 — ELEMENT_FUSION (alt-3 handoff variant — open framing)
  {
    ...SHARED,
    passage_id: 'tier_1:element_fusion:002',
    source_citation: "alt-3 handoff 2026-04-29 line 122 (alt-3 derived) — supplementary alternative formulation when Layer 1's fusion list is uncertain or thin",
    canonical_mechanism: ['layer_1_translation'],
    passion: null,
    sub_passion: null,
    trigger_condition: 'ELEMENT_FUSION',
    intake_tier: 1,
    slot_fields: null,
    text: 'Before I work through this with you — can you tell me in one sentence what you were most concerned about in that moment? Not what happened, but what mattered to you about it.',
    paragraph_text: "Notes: This stem is an alternative for ELEMENT_FUSION when Layer 1 cannot enumerate the fused concerns confidently. Phase-2 build's Layer 3 prompt selects between T1E-001 (when layer_1_output.fused_concerns[] is well-populated) and T1E-002 (when Layer 1's fusion detection is high-confidence but enumeration is low-confidence). The selection mechanism is a Phase-2 build operational decision; this catalogue lists both stems to make the choice available.",
  },

  // T1E-003 — SCOPE_AMBIGUITY
  {
    ...SHARED,
    passage_id: 'tier_1:scope_ambiguity:001',
    source_citation: 'D13 §"Engine-level Tier 1 triggers (full text) — SCOPE_AMBIGUITY"; alt-3 handoff 2026-04-29 line 123 (canonical match)',
    canonical_mechanism: ['oikeiosis_stage'],
    passion: null,
    sub_passion: null,
    trigger_condition: 'SCOPE_AMBIGUITY',
    intake_tier: 1,
    slot_fields: null,
    text: "Who else was affected by this, if anyone? And what role do they play in your life — colleague, family member, someone you don't know well?",
    paragraph_text: null,
  },

  // T1E-004 — TEMPORAL_AMBIGUITY (D11 form with [SITUATION] slot)
  {
    ...SHARED,
    passage_id: 'tier_1:temporal_ambiguity:001',
    source_citation: 'D13 §"Engine-level Tier 1 triggers (full text) — TEMPORAL_AMBIGUITY"; alt-3 handoff 2026-04-29 line 124 (canonical match); D11 §"Slot-fill format" example (canonical match)',
    canonical_mechanism: ['passion_root_detection'],
    passion: null,
    sub_passion: null,
    trigger_condition: 'TEMPORAL_AMBIGUITY',
    intake_tier: 1,
    slot_fields: [
      { variable_name: 'SITUATION', source_path: 'layer_1_output.entities[].description (highest narrative_weight scope-stake event/abstraction)', constraint: 'noun_phrase' },
    ],
    text: "When you think about [SITUATION] right now, are you more concerned about something that's already happened, or something you're worried might happen?",
    paragraph_text: 'Notes: The D13 form omits the [SITUATION] slot ("...think about this situation right now..."); the D11 form (used here) carries the slot for situations where Layer 1 has identified a specific entity. Phase-2 build\'s Layer 3 prompt may use either; this catalogue carries the D11 form as canonical and notes the D13 form as a slotless alternative.',
  },

  // ============================================================================
  // Section 3 — Tier 2 engine-level (soft clarification alongside output)
  // ============================================================================

  // T2E-001 — STATED_OPERATIVE_CONFLICT
  {
    ...SHARED,
    passage_id: 'tier_2:stated_operative_conflict:001',
    source_citation: 'D13 §"Engine-level Tier 2 triggers (full text) — STATED_OPERATIVE_CONFLICT"; alt-3 handoff 2026-04-29 line 127 (canonical match for the framing)',
    canonical_mechanism: ['oikeiosis_stage', 'oikeiosis_obligation'],
    passion: null,
    sub_passion: null,
    trigger_condition: 'STATED_OPERATIVE_CONFLICT',
    intake_tier: 2,
    slot_fields: [
      { variable_name: 'STATED_CIRCLE_TARGET', source_path: 'engine_output.mechanism_6.stated_circle_target', constraint: 'person_or_audience (per layer_1_output)' },
      { variable_name: 'SITUATION', source_path: "layer_1_output.entities[].description (action's primary referent)", constraint: 'noun_phrase' },
    ],
    text: "You mentioned being concerned about [STATED_CIRCLE_TARGET]. I want to check something with you — when you imagine [SITUATION] going badly, what's the thing you're most worried about for yourself?",
    paragraph_text: null,
  },

  // T2E-002 — STATED_EQUANIMITY_UNVERIFIED
  {
    ...SHARED,
    passage_id: 'tier_2:stated_equanimity_unverified:001',
    source_citation: 'D13 §"Engine-level Tier 2 triggers (full text) — STATED_EQUANIMITY_UNVERIFIED"; alt-3 handoff 2026-04-29 lines 130-133 (canonical match)',
    canonical_mechanism: ['passion_root_detection', 'passion_sub_species', 'virtue_domain_engaged'],
    passion: null,
    sub_passion: null,
    trigger_condition: 'STATED_EQUANIMITY_UNVERIFIED',
    intake_tier: 2,
    slot_fields: null,
    text: "Has there been a recent time when something similar went the other way — when the outcome you hoped for didn't arrive — and you noticed how you actually felt, not how you thought you should feel?",
    paragraph_text: null,
  },

  // ============================================================================
  // Section 4 — Tier 1 surface-level (force; per consumer route)
  // ============================================================================

  // T1S-001 — OPTION_SCOPE_INCONSISTENCY (/api/score-decision)
  {
    ...SHARED,
    passage_id: 'tier_1:option_scope_inconsistency:001',
    source_citation: 'D13 §"Surface-level Tier 1 triggers — OPTION_SCOPE_INCONSISTENCY" (alt-3 derived)',
    canonical_mechanism: ['oikeiosis_stage'],
    passion: null,
    sub_passion: null,
    trigger_condition: 'OPTION_SCOPE_INCONSISTENCY',
    intake_tier: 1,
    slot_fields: [
      { variable_name: 'CIRCLE_OPTION_1', source_path: 'engine_output.mechanism_6.per_option[0].primary_circle.english_label', constraint: 'circle_phrase' },
      { variable_name: 'CIRCLE_OPTION_2', source_path: 'engine_output.mechanism_6.per_option[1].primary_circle.english_label', constraint: 'circle_phrase' },
    ],
    text: 'These two options affect different people in your life — option 1 is mostly about [CIRCLE_OPTION_1], and option 2 is mostly about [CIRCLE_OPTION_2]. Are you choosing between two genuinely different paths, or do you want to focus on one circle?',
    paragraph_text: null,
  },

  // T1S-002 — OPTION_FALSE_ALTERNATIVE (/api/score-decision)
  {
    ...SHARED,
    passage_id: 'tier_1:option_false_alternative:001',
    source_citation: 'D13 §"Surface-level Tier 1 triggers — OPTION_FALSE_ALTERNATIVE" (alt-3 derived)',
    canonical_mechanism: ['layer_1_translation'],
    passion: null,
    sub_passion: null,
    trigger_condition: 'OPTION_FALSE_ALTERNATIVE',
    intake_tier: 1,
    slot_fields: [
      { variable_name: 'A', source_path: 'layer_1_output.option_labels[0]', constraint: "option_label (e.g., '1', 'A')" },
      { variable_name: 'B', source_path: 'layer_1_output.option_labels[1]', constraint: 'option_label' },
    ],
    text: "Option [A] and option [B] don't seem to be genuine alternatives — they could be combined (or one includes the other). Do you want me to evaluate them as written, or would you like to refine the option set first?",
    paragraph_text: null,
  },

  // T1S-003 — DOCUMENT_OBJECT_AMBIGUITY (/api/score-document)
  {
    ...SHARED,
    passage_id: 'tier_1:document_object_ambiguity:001',
    source_citation: 'D13 §"Surface-level Tier 1 triggers — DOCUMENT_OBJECT_AMBIGUITY" (alt-3 derived)',
    canonical_mechanism: ['layer_1_translation'],
    passion: null,
    sub_passion: null,
    trigger_condition: 'DOCUMENT_OBJECT_AMBIGUITY',
    intake_tier: 1,
    slot_fields: null,
    text: 'Are you the sole author of this document, or is some of the content quoted or co-authored? If quoted, do you want the evaluation to focus on your authorial parts only?',
    paragraph_text: null,
  },

  // T1S-004 — DOCUMENT_PURPOSE_AMBIGUITY (/api/score-document)
  {
    ...SHARED,
    passage_id: 'tier_1:document_purpose_ambiguity:001',
    source_citation: 'D13 §"Surface-level Tier 1 triggers — DOCUMENT_PURPOSE_AMBIGUITY" (alt-3 derived)',
    canonical_mechanism: ['layer_1_translation'],
    passion: null,
    sub_passion: null,
    trigger_condition: 'DOCUMENT_PURPOSE_AMBIGUITY',
    intake_tier: 1,
    slot_fields: null,
    text: 'What is this document for, and who is it written to?',
    paragraph_text: null,
  },

  // T1S-005 — RESPONSE_AMBIGUITY (/api/score-scenario)
  {
    ...SHARED,
    passage_id: 'tier_1:response_ambiguity:001',
    source_citation: 'D13 §"Surface-level Tier 1 triggers — RESPONSE_AMBIGUITY" (alt-3 derived)',
    canonical_mechanism: ['layer_1_translation'],
    passion: null,
    sub_passion: null,
    trigger_condition: 'RESPONSE_AMBIGUITY',
    intake_tier: 1,
    slot_fields: null,
    text: 'Can you say a bit more about how you would respond and why?',
    paragraph_text: null,
  },

  // T1S-006 — POST_ELEMENT_FUSION (/api/score-social)
  {
    ...SHARED,
    passage_id: 'tier_1:post_element_fusion:001',
    source_citation: 'D13 §"Surface-level Tier 1 triggers — POST_ELEMENT_FUSION" (alt-3 derived)',
    canonical_mechanism: ['layer_1_translation'],
    passion: null,
    sub_passion: null,
    trigger_condition: 'POST_ELEMENT_FUSION',
    intake_tier: 1,
    slot_fields: null,
    text: 'This post seems to mix several distinct points. Do you want me to evaluate it as a single artefact, or would you like to focus on one of the points first?',
    paragraph_text: null,
  },

  // T1S-007 — REFLECTION_NARRATIVE_THIN (/api/reflect, /api/mentor/private/reflect)
  {
    ...SHARED,
    passage_id: 'tier_1:reflection_narrative_thin:001',
    source_citation: 'D13 §"Surface-level Tier 1 triggers — REFLECTION_NARRATIVE_THIN" (alt-3 derived); applies to D14a Verification 6 (post-substitution Tier 1 force trigger surfacing)',
    canonical_mechanism: ['layer_1_translation'],
    passion: null,
    sub_passion: null,
    trigger_condition: 'REFLECTION_NARRATIVE_THIN',
    intake_tier: 1,
    slot_fields: null,
    text: 'Can you say a bit more about what happened, and what you noticed in your own response to it?',
    paragraph_text: null,
  },

  // T1S-008 — RESPONSE_FIELD_INCONSISTENCY (/api/reflect evening flow)
  {
    ...SHARED,
    passage_id: 'tier_1:response_field_inconsistency:001',
    source_citation: 'D13 §"Surface-level Tier 1 triggers — RESPONSE_FIELD_INCONSISTENCY" (alt-3 derived)',
    canonical_mechanism: ['layer_1_translation'],
    passion: null,
    sub_passion: null,
    trigger_condition: 'RESPONSE_FIELD_INCONSISTENCY',
    intake_tier: 1,
    slot_fields: [
      { variable_name: 'INFERRED_EVENT_FROM_RESPONSE', source_path: 'layer_1_output.inferred_event_from_response', constraint: 'noun_phrase' },
      { variable_name: 'WHAT_HAPPENED_SUMMARY', source_path: 'layer_1_output.what_happened_summary', constraint: 'noun_phrase' },
    ],
    text: 'Your response describes [INFERRED_EVENT_FROM_RESPONSE], but the situation you described is [WHAT_HAPPENED_SUMMARY]. Can you tell me which one of these you want me to focus on?',
    paragraph_text: null,
  },

  // ============================================================================
  // Section 5 — Tier 2 surface-level (soft clarification per consumer route)
  // ============================================================================

  // T2S-001 — STATED_PROCESS_INCONSISTENCY (/api/score-decision)
  {
    ...SHARED,
    passage_id: 'tier_2:stated_process_inconsistency:001',
    source_citation: 'D13 §"Surface-level Tier 2 triggers — STATED_PROCESS_INCONSISTENCY" (alt-3 derived)',
    canonical_mechanism: ['oikeiosis_obligation'],
    passion: null,
    sub_passion: null,
    trigger_condition: 'STATED_PROCESS_INCONSISTENCY',
    intake_tier: 2,
    slot_fields: [
      { variable_name: 'PROCESS_QUALITY_ASSESSMENT', source_path: 'engine_output.mechanism_7.process_quality.english_label', constraint: 'quality_phrase' },
      { variable_name: 'OBSERVATION', source_path: 'engine_output.mechanism_7.process_inconsistency_observation (alt-3 derived prose by Layer 3)', constraint: 'observation_phrase' },
    ],
    text: 'You described your process for arriving at these options, and the process sounds [PROCESS_QUALITY_ASSESSMENT] — but the option set itself feels [OBSERVATION]. Want to consider whether more options were available?',
    paragraph_text: null,
  },

  // T2S-002 — POLICY_INSTITUTIONAL_DISTANCE (/api/score-document policy mode)
  {
    ...SHARED,
    passage_id: 'tier_2:policy_institutional_distance:001',
    source_citation: 'D13 §"Surface-level Tier 2 triggers — POLICY_INSTITUTIONAL_DISTANCE" (alt-3 derived per D24 Refinement 2)',
    canonical_mechanism: ['layer_1_translation', 'oikeiosis_stage'],
    passion: null,
    sub_passion: null,
    trigger_condition: 'POLICY_INSTITUTIONAL_DISTANCE',
    intake_tier: 2,
    slot_fields: [
      { variable_name: 'AUTHORIAL_DISTANCE', source_path: "layer_1_output.authorial_control (closed enum: 'you' | 'your organisation' | 'a third party')", constraint: 'authorial_phrase' },
    ],
    text: 'This document was written by [AUTHORIAL_DISTANCE]. The Stoic evaluation works best when you are evaluating your own authorial reasoning. Do you want to focus on what you would change if you were the author, or on understanding what reasoning is operative in the document as written?',
    paragraph_text: null,
  },

  // T2S-003 — RESPONSE_SCENARIO_DRIFT (/api/score-scenario)
  {
    ...SHARED,
    passage_id: 'tier_2:response_scenario_drift:001',
    source_citation: 'D13 §"Surface-level Tier 2 triggers — RESPONSE_SCENARIO_DRIFT" (alt-3 derived)',
    canonical_mechanism: ['layer_1_translation'],
    passion: null,
    sub_passion: null,
    trigger_condition: 'RESPONSE_SCENARIO_DRIFT',
    intake_tier: 2,
    slot_fields: [
      { variable_name: 'ADJACENT_TOPIC', source_path: 'layer_1_output.adjacent_topic_summary', constraint: 'noun_phrase' },
      { variable_name: 'SCENARIO_CORE_QUESTION', source_path: 'request.scenario.core_question (canonical from scenario fixtures)', constraint: 'noun_phrase' },
    ],
    text: 'Your response touches on [ADJACENT_TOPIC] more than on [SCENARIO_CORE_QUESTION]. Do you want me to evaluate the response as written, or would you like to focus more directly on [SCENARIO_CORE_QUESTION]?',
    paragraph_text: null,
  },

  // T2S-004 — POST_PURPOSE_AMBIGUITY (/api/score-social)
  {
    ...SHARED,
    passage_id: 'tier_2:post_purpose_ambiguity:001',
    source_citation: 'D13 §"Surface-level Tier 2 triggers — POST_PURPOSE_AMBIGUITY" (alt-3 derived)',
    canonical_mechanism: ['layer_1_translation'],
    passion: null,
    sub_passion: null,
    trigger_condition: 'POST_PURPOSE_AMBIGUITY',
    intake_tier: 2,
    slot_fields: null,
    text: "You picked 'general' as the platform. The post could fit a tweet, an email, or an internal Slack message. Do you want me to evaluate it generically, or for a specific platform?",
    paragraph_text: null,
  },

  // ============================================================================
  // Section 6 — Ritual evening_prompt stems (D14a; alt-3 derived this session)
  // ============================================================================
  // Path B per D-CORPUS-PASSAGES-SCHEMA-2026-05-03: synthetic intake_tier:1.
  // The trigger_condition (RITUAL_MORNING_PROMPT / RITUAL_EVENING_PROMPT) is
  // the operative dispatch field for these stems.
  // ============================================================================

  // RIT-M-001 — Morning indifferent-awareness
  {
    ...SHARED,
    passage_id: 'ritual:morning_indifferent_awareness:001',
    source_citation: 'alt-3 derived (this session — composed for D14a coverage; no Stoic primary source)',
    canonical_mechanism: ['value_indifferent', 'passion_root_detection'],
    passion: null,
    sub_passion: null,
    trigger_condition: 'RITUAL_MORNING_PROMPT',
    intake_tier: 1, // synthetic per Path B
    slot_fields: [
      { variable_name: 'SITUATION', source_path: 'layer_1_output.entities[].description (highest narrative_weight forward-looking event)', constraint: 'noun_phrase' },
      { variable_name: 'INDIFFERENT_AT_STAKE', source_path: 'engine_output.mechanism_8.indifferents_at_stake[0].english_label', constraint: 'indifferent_phrase' },
    ],
    text: "As [SITUATION] approaches today, what's the [INDIFFERENT_AT_STAKE] you're most aware of wanting? Notice it, then ask whether wanting it as a genuine good would change how you act.",
    paragraph_text: 'Notes: Forward-looking morning stem. Reads from Mechanism 8 (which surfaces indifferents at stake) and Mechanism 2 (passion detection — identifying what the practitioner is anticipating).',
  },

  // RIT-M-002 — Morning circle-and-virtue
  {
    ...SHARED,
    passage_id: 'ritual:morning_circle_virtue:001',
    source_citation: 'alt-3 derived (this session)',
    canonical_mechanism: ['oikeiosis_stage', 'virtue_domain_engaged'],
    passion: null,
    sub_passion: null,
    trigger_condition: 'RITUAL_MORNING_PROMPT',
    intake_tier: 1,
    slot_fields: [
      { variable_name: 'CIRCLE_TARGET', source_path: 'engine_output.mechanism_6.primary_circle.english_label', constraint: 'circle_phrase' },
      { variable_name: 'VIRTUE_TO_PRACTICE', source_path: 'engine_output.mechanism_9.weakest_virtue_flag (or strongest if weakest is unclear) + English label per R8c', constraint: 'virtue_phrase' },
    ],
    text: '[CIRCLE_TARGET] is the circle most operative in your morning so far. What would acting from [VIRTUE_TO_PRACTICE] toward them look like specifically today?',
    paragraph_text: null,
  },

  // RIT-M-003 — Morning passion-watchpoint
  {
    ...SHARED,
    passage_id: 'ritual:morning_passion_watchpoint:001',
    source_citation: 'alt-3 derived (this session)',
    canonical_mechanism: ['passion_root_detection', 'passion_sub_species', 'passion_causal_stage'],
    passion: null,
    sub_passion: null,
    trigger_condition: 'RITUAL_MORNING_PROMPT',
    intake_tier: 1,
    slot_fields: [
      { variable_name: 'DOMINANT_PASSION_DESCRIPTION', source_path: 'engine_output.mechanism_3.dominant_sub_species + D3 description', constraint: 'passion_phrase' },
    ],
    text: "Your morning has named [DOMINANT_PASSION_DESCRIPTION]. What's one moment today where you'd notice if it surfaces — and what would noticing in time give you?",
    paragraph_text: 'Notes: Plays the role of a daily premeditatio. The practitioner is asked to identify a watchpoint, not to suppress the passion.',
  },

  // RIT-E-001 — Evening flattering-story check
  {
    ...SHARED,
    passage_id: 'ritual:evening_flattering_story:001',
    source_citation: 'alt-3 derived (this session)',
    canonical_mechanism: ['passion_false_judgement', 'passion_sub_species'],
    passion: null,
    sub_passion: null,
    trigger_condition: 'RITUAL_EVENING_PROMPT',
    intake_tier: 1,
    slot_fields: null,
    text: "Of what happened today, what's the part you're tempted to tell yourself a flattering story about? Sit with the unflattering version overnight.",
    paragraph_text: 'Notes: Addresses self-flattering narratives generally. The stem invites the practitioner to surface their own flattering content without the engine pre-classifying it. Backward-looking; evening tone is unsentimental. The companion RIT-E-001b sharpens this stem for the founder\'s philodoxia profile per ES1.',
  },

  // RIT-E-001b — Evening philodoxia-tuned story check (founder direction 2026-05-02)
  {
    ...SHARED,
    passage_id: 'ritual:evening_flattering_story:002_philodoxia',
    source_citation: 'alt-3 derived (this session — composed for ES1 philodoxia coverage per founder direction 2026-05-02; no Stoic primary source)',
    canonical_mechanism: ['passion_root_detection', 'passion_sub_species', 'passion_false_judgement'],
    passion: 'epithumia',
    sub_passion: 'philodoxia',
    trigger_condition: 'RITUAL_EVENING_PROMPT',
    intake_tier: 1,
    slot_fields: null,
    text: "Of what happened today, what's the part you're tempted to tell a story about that earned you something — recognition, approval, a sense of standing? Sit with the version where you did the same action and no one noticed.",
    paragraph_text: 'Selection rule (Phase-2 build operational decision): Phase-2 build\'s Layer 3 prompt selects RIT-E-001b over RIT-E-001 when the engine has detected philodoxia in the day\'s evaluation. When philodoxia is not detected, the canonical RIT-E-001 is selected. R20d preserved — the stem is in first-person and asks the practitioner to examine their own reasoning, not to diagnose others.',
  },

  // RIT-E-002 — Evening false-judgement-then-and-now
  {
    ...SHARED,
    passage_id: 'ritual:evening_false_judgement_history:001',
    source_citation: 'alt-3 derived (this session)',
    canonical_mechanism: ['passion_false_judgement', 'katorthoma_proximity'],
    passion: null,
    sub_passion: null,
    trigger_condition: 'RITUAL_EVENING_PROMPT',
    intake_tier: 1,
    slot_fields: [
      { variable_name: 'FALSE_JUDGEMENT_OBJECT', source_path: 'engine_output.mechanism_5.dominant_false_judgement.object_inflated_or_deflated', constraint: 'noun_phrase' },
    ],
    text: '[FALSE_JUDGEMENT_OBJECT] looked like a genuine good in the moment. Tonight, ask yourself whether it would have looked the same to you a year ago — and what the difference tells you.',
    paragraph_text: "Notes: Invites longitudinal reflection — feeds the practitioner's own self-knowledge of trajectory, which Mechanism 10's longitudinal projection also tracks.",
  },

  // RIT-E-003 — Evening virtue-deficiency-pattern
  {
    ...SHARED,
    passage_id: 'ritual:evening_virtue_deficiency_pattern:001',
    source_citation: 'alt-3 derived (this session)',
    canonical_mechanism: ['virtue_domain_engaged', 'katorthoma_proximity'],
    passion: null,
    sub_passion: null,
    trigger_condition: 'RITUAL_EVENING_PROMPT',
    intake_tier: 1,
    slot_fields: [
      { variable_name: 'VIRTUE_DEFICIENCY', source_path: 'engine_output.mechanism_9.weakest_virtue_flag + English label per R8c', constraint: 'virtue_phrase' },
    ],
    text: '[VIRTUE_DEFICIENCY] is the operative deficiency in today\'s reasoning. The small version of it: where else does this same shape show up in your week?',
    paragraph_text: "Notes: Asks the practitioner to look for the same shape across the week — supports Mechanism 10's longitudinal classification by inviting the practitioner's own pattern recognition. Validation Addendum awareness applies because the practitioner's own answer bears on whether unity_inconsistency in this instance is unstable phronesis or false phronesis (per Adjustment 1).",
  },
];

// ----------------------------------------------------------------------------
// Step 2 — Sanity check the inventory
// ----------------------------------------------------------------------------

if (STEMS.length !== 27) {
  console.error(`ERROR: expected 27 D-A16 stems, got ${STEMS.length}`);
  process.exit(1);
}

console.log(`${STEMS.length} D-A16 catalogue stems prepared.`);

// Per-tier breakdown sanity check
const tierCounts = STEMS.reduce((acc, s) => {
  const key = s.trigger_condition.startsWith('RITUAL_')
    ? 'ritual'
    : `tier_${s.intake_tier}`;
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});
console.log(`Breakdown: ${JSON.stringify(tierCounts)}`);
// Expected: { tier_3: 2, tier_1: 12, tier_2: 6, ritual: 7 }
// (12 = 4 engine T1E + 8 surface T1S; 6 = 2 engine T2E + 4 surface T2S)

// ----------------------------------------------------------------------------
// Step 3 — KG7 validation + upsert
// ----------------------------------------------------------------------------
// KG7: canonical_mechanism + slot_fields are JSONB columns. Pass as plain JS
// arrays/objects. Never JSON.stringify them — Supabase's PostgREST client
// handles the JSON serialisation. Stringifying would store the JSON-encoded
// text inside a JSONB cell, breaking GIN index lookups.
// ----------------------------------------------------------------------------

let upserted = 0;
let errors = 0;

for (const stem of STEMS) {
  // KG7 sanity checks
  if (typeof stem.canonical_mechanism === 'string') {
    console.error(`KG7 VIOLATION on ${stem.passage_id}: canonical_mechanism is a string. Aborting.`);
    process.exit(1);
  }
  if (!Array.isArray(stem.canonical_mechanism)) {
    console.error(`KG7 VIOLATION on ${stem.passage_id}: canonical_mechanism is not an array. Aborting.`);
    process.exit(1);
  }
  if (stem.slot_fields !== null && typeof stem.slot_fields === 'string') {
    console.error(`KG7 VIOLATION on ${stem.passage_id}: slot_fields is a string. Aborting.`);
    process.exit(1);
  }
  if (stem.slot_fields !== null && !Array.isArray(stem.slot_fields)) {
    console.error(`KG7 VIOLATION on ${stem.passage_id}: slot_fields is not an array. Aborting.`);
    process.exit(1);
  }

  // Schema sanity checks (mirror corpus_passages CHECK constraints)
  if (stem.passage_type !== 'focus_question_stem') {
    console.error(`SCHEMA VIOLATION on ${stem.passage_id}: passage_type must be 'focus_question_stem'. Aborting.`);
    process.exit(1);
  }
  if (stem.source_file !== 'focus-questions') {
    console.error(`SCHEMA VIOLATION on ${stem.passage_id}: source_file must be 'focus-questions'. Aborting.`);
    process.exit(1);
  }
  if (![1, 2, 3].includes(stem.intake_tier)) {
    console.error(`SCHEMA VIOLATION on ${stem.passage_id}: intake_tier must be 1, 2, or 3. Got ${stem.intake_tier}. Aborting.`);
    process.exit(1);
  }
  if (!stem.trigger_condition) {
    console.error(`SCHEMA VIOLATION on ${stem.passage_id}: trigger_condition required for focus_question_stem. Aborting.`);
    process.exit(1);
  }

  const { error } = await supabase
    .from('corpus_passages')
    .upsert(stem, { onConflict: 'passage_id' });

  if (error) {
    console.error(`Upsert error on ${stem.passage_id}:`, error.message);
    errors++;
  } else {
    upserted++;
  }
}

console.log(`Upserted ${upserted} rows. Errors ${errors}.`);

// ----------------------------------------------------------------------------
// Step 4 — Final count checks
// ----------------------------------------------------------------------------

const { count: stemCount, error: stemCountError } = await supabase
  .from('corpus_passages')
  .select('*', { count: 'exact', head: true })
  .eq('passage_type', 'focus_question_stem');

if (stemCountError) {
  console.error('Final stem count query failed:', stemCountError.message);
  process.exit(1);
}

console.log(`Final focus_question_stem count: ${stemCount} rows.`);

const { count: totalCount, error: totalCountError } = await supabase
  .from('corpus_passages')
  .select('*', { count: 'exact', head: true });

if (totalCountError) {
  console.error('Final total count query failed:', totalCountError.message);
  process.exit(1);
}

console.log(`Final corpus_passages total count: ${totalCount} rows (expected 186 = 159 corpus + 27 D-A16 stems).`);

if (errors > 0) {
  console.error(`COMPLETED WITH ERRORS — ${errors} rows failed. Review log above.`);
  process.exit(1);
}

console.log('DONE — D-A16 catalogue population complete.');
