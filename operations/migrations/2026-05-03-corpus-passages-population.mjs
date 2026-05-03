// ============================================================================
// 2026-05-03 — corpus_passages population (corpus rows from stoic-brain-compiled.ts)
// ============================================================================
//
// Source: D4 Corpus Inventory (Adopted 2026-05-02) §"canonical_mechanism mapping rules"
//         + D5 Index Schema (Adopted 2026-05-02) §"Migration shape — Step 1"
//         + KG7 (JSONB storage shape — canonical_mechanism passed as plain array)
//         + KG1 rule 2 (await all DB writes)
//
// What this script does:
//   1. Reads website/src/data/stoic-brain-compiled.ts
//   2. Strips TypeScript syntax (as const, export const) so Node can eval it
//   3. Decomposes each of the 8 const exports into per-passage rows per D5
//      §"Chunk-size policy" (each leaf-node entry becomes a passage; parent
//      block becomes paragraph_text)
//   4. Applies per-source-file canonical_mechanism tagging per D4 §"canonical_mechanism
//      mapping rules" table
//   5. Upserts each row into corpus_passages (idempotent via passage_id UNIQUE)
//   6. Reports progress + final counts
//
// SESSION DEFERRAL NOTE: embedding column is NULL across all rows.
//   OpenAI text-embedding-3-small generation is deferred to Sub-session C
//   alongside D6 retrieval interface + D7 re-ranker wiring per
//   D-CORPUS-PASSAGES-SCHEMA-AND-POPULATION-2026-05-03 deferral note.
//   The tsvector_en column populates automatically via the schema's trigger.
//
// To run:
//   cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
//   node operations/migrations/2026-05-03-corpus-passages-population.mjs
//
// Expected output:
//   "Loaded 8 corpus constants. Decomposed into N passages."
//   "Upserted N rows. Skipped 0. Errors 0."
//   "Final corpus_passages count: N rows."
//
// Idempotent: re-runs upsert by passage_id UNIQUE. Safe to re-run if interrupted.
//
// Rollback: TRUNCATE corpus_passages; (then re-run script if needed).
// ============================================================================

import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
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

// Service role bypasses RLS — required for build-time INSERTs per D5 §"RLS policy"
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ----------------------------------------------------------------------------
// Step 1 — Load stoic-brain-compiled.ts via TS-syntax strip + eval
// ----------------------------------------------------------------------------

const tsSourcePath = './website/src/data/stoic-brain-compiled.ts';
let tsSource;
try {
  tsSource = readFileSync(tsSourcePath, 'utf-8');
} catch (err) {
  console.error(`ERROR: cannot read ${tsSourcePath}. Run from project root.`);
  process.exit(1);
}

// Strip TS-specific syntax (`as const`). The file uses standard ESM
// `export const X = {...};` which dynamic-import handles natively.
const jsSource = tsSource.replace(/ as const/g, '');

// Write to a temp .mjs file, dynamic-import it, then clean up. This avoids
// eval and respects ES module scope. The transformed source is pure JS
// object literals so the import is safe.
const tmpFile = join(tmpdir(), `corpus-temp-${Date.now()}-${Math.random().toString(36).slice(2)}.mjs`);
writeFileSync(tmpFile, jsSource);

let mod;
try {
  mod = await import(tmpFile);
} finally {
  try { unlinkSync(tmpFile); } catch (_) { /* ignore */ }
}

const {
  PSYCHOLOGY_CONTEXT,
  PASSIONS_CONTEXT,
  VIRTUE_CONTEXT,
  VALUE_CONTEXT,
  ACTION_CONTEXT,
  PROGRESS_CONTEXT,
  SCORING_CONTEXT,
  STOIC_BRAIN_FOUNDATIONS,
} = mod;

console.log('Loaded 8 corpus constants from stoic-brain-compiled.ts');

// ----------------------------------------------------------------------------
// Step 2 — Per-source-file canonical_mechanism mapping per D4 §"mapping rules"
// ----------------------------------------------------------------------------
//
// D4 §"canonical_mechanism mapping rules" table (the authoritative source):
//   stoic-brain → prohairesis_filter; katorthoma_proximity; oikeiosis_stage; oikeiosis_obligation
//   psychology  → passion_causal_stage (primary); prohairesis_filter; passion_root_detection
//   passions    → passion_root_detection; passion_sub_species; passion_false_judgement; passion_causal_stage
//   virtue      → virtue_domain_engaged (primary); katorthoma_proximity (virtue dimension)
//   value       → value_indifferent (primary); passion_false_judgement (Pass-2); prohairesis_filter
//   action      → oikeiosis_stage; oikeiosis_obligation; katorthoma_proximity (kathekon/katorthoma)
//   progress    → katorthoma_proximity (Senecan grade overlay)
//   scoring     → all mechanisms (integration point); katorthoma_proximity most direct
//
// The 10 canonical mechanism IDs (per D2 + D4 Examples A & B):
//   prohairesis_filter, passion_root_detection, passion_sub_species,
//   passion_causal_stage, passion_false_judgement, oikeiosis_stage,
//   oikeiosis_obligation, value_indifferent, virtue_domain_engaged,
//   katorthoma_proximity
// ----------------------------------------------------------------------------

const passages = [];

function addPassage(row) {
  // Defensive: enforce KG7 — canonical_mechanism stays as a plain array.
  // Defensive: enforce focus_question_completeness CHECK — non-stem rows have
  // trigger_condition + intake_tier + slot_fields all NULL.
  if (row.passage_type !== 'focus_question_stem') {
    row.trigger_condition = null;
    row.intake_tier = null;
    row.slot_fields = null;
  }
  passages.push(row);
}

// ----------------------------------------------------------------------------
// STOIC_BRAIN_FOUNDATIONS — source_file: stoic-brain
// ----------------------------------------------------------------------------

const sbf = STOIC_BRAIN_FOUNDATIONS;

addPassage({
  passage_id: 'stoic-brain:foundations:core_premise',
  source_file: 'stoic-brain',
  source_citation: 'stoic-brain.json (Stoic Brain v3.0.0); DL Lives 7.87-89; Stobaeus Eclogae 2.59-63',
  passage_type: 'canonical_line',
  canonical_mechanism: ['katorthoma_proximity'],
  passion: null,
  sub_passion: null,
  audience_tier: 'R8a',
  text: sbf.core_premise,
  paragraph_text: null,
});

// dichotomy_of_control.up_to_us[] — Mechanism 1 prohairesis_filter
const upToUsParagraph =
  'What is up to us (eph\' hemin), per Epictetus Enchiridion 1: ' + sbf.dichotomy_of_control.up_to_us.join('; ') + '.';
addPassage({
  passage_id: 'stoic-brain:foundations:dichotomy_of_control:up_to_us:list',
  source_file: 'stoic-brain',
  source_citation: 'Epictetus Enchiridion 1; Discourses 1.1',
  passage_type: 'mechanism',
  canonical_mechanism: ['prohairesis_filter'],
  passion: null,
  sub_passion: null,
  audience_tier: 'R8a',
  text: upToUsParagraph,
  paragraph_text: null,
});
sbf.dichotomy_of_control.up_to_us.forEach((item, i) => {
  addPassage({
    passage_id: `stoic-brain:foundations:dichotomy_of_control:up_to_us:${i}`,
    source_file: 'stoic-brain',
    source_citation: 'Epictetus Enchiridion 1; Discourses 1.1',
    passage_type: 'mechanism',
    canonical_mechanism: ['prohairesis_filter'],
    passion: null,
    sub_passion: null,
    audience_tier: 'R8a',
    text: item,
    paragraph_text: upToUsParagraph,
  });
});

// dichotomy_of_control.not_up_to_us[] — Mechanism 1 + Mechanism 8 (per D4 value tagging)
const notUpToUsParagraph =
  'What is not up to us, per Epictetus Enchiridion 1: ' + sbf.dichotomy_of_control.not_up_to_us.join('; ') + '.';
addPassage({
  passage_id: 'stoic-brain:foundations:dichotomy_of_control:not_up_to_us:list',
  source_file: 'stoic-brain',
  source_citation: 'Epictetus Enchiridion 1; Discourses 1.1',
  passage_type: 'mechanism',
  canonical_mechanism: ['prohairesis_filter', 'value_indifferent'],
  passion: null,
  sub_passion: null,
  audience_tier: 'R8a',
  text: notUpToUsParagraph,
  paragraph_text: null,
});
sbf.dichotomy_of_control.not_up_to_us.forEach((item, i) => {
  addPassage({
    passage_id: `stoic-brain:foundations:dichotomy_of_control:not_up_to_us:${i}`,
    source_file: 'stoic-brain',
    source_citation: 'Epictetus Enchiridion 1; Discourses 1.1',
    passage_type: 'mechanism',
    canonical_mechanism: ['prohairesis_filter', 'value_indifferent'],
    passion: null,
    sub_passion: null,
    audience_tier: 'R8a',
    text: item,
    paragraph_text: notUpToUsParagraph,
  });
});

addPassage({
  passage_id: 'stoic-brain:foundations:flourishing',
  source_file: 'stoic-brain',
  source_citation: 'stoic-brain.json (Stoic Brain v3.0.0); DL 7.87-89; Stobaeus Eclogae 2.77',
  passage_type: 'canonical_line',
  canonical_mechanism: ['katorthoma_proximity'],
  passion: null,
  sub_passion: null,
  audience_tier: 'R8a',
  text: sbf.flourishing,
  paragraph_text: null,
});

// ----------------------------------------------------------------------------
// PSYCHOLOGY_CONTEXT — source_file: psychology
// ----------------------------------------------------------------------------

const psy = PSYCHOLOGY_CONTEXT;

const causalParagraph =
  'The Stoic causal sequence (per Stobaeus Eclogae 2.86-97; DL 7.40-43): ' +
  psy.causal_sequence.map((s) => `${s.stage}. ${s.name} (${s.id})`).join(' → ') + '.';

psy.causal_sequence.forEach((stage) => {
  addPassage({
    passage_id: `psychology:causal_sequence:${stage.id}`,
    source_file: 'psychology',
    source_citation: 'Stobaeus Eclogae 2.86-97; DL Lives 7.40-43',
    passage_type: 'mechanism',
    canonical_mechanism: ['passion_causal_stage'],
    passion: null,
    sub_passion: null,
    audience_tier: 'R8a',
    text: `Stage ${stage.stage} — ${stage.name} (${stage.id}). Failure mode: ${stage.failure_mode}`,
    paragraph_text: causalParagraph,
  });
});

addPassage({
  passage_id: 'psychology:ruling_faculty:hegemonikon',
  source_file: 'psychology',
  source_citation: 'Stobaeus Eclogae 2.86-97; DL Lives 7.40-43; Marcus Aurelius Meditations 7.55',
  passage_type: 'canonical_line',
  canonical_mechanism: ['prohairesis_filter', 'passion_causal_stage'],
  passion: null,
  sub_passion: null,
  audience_tier: 'R8a',
  text: `${psy.ruling_faculty.id} — ${psy.ruling_faculty.description}`,
  paragraph_text: null,
});

const impulseTaxonomyParagraph =
  'Stoic impulse taxonomy (per Stobaeus Eclogae 2.86-97): the 8 species of impulse — ' +
  psy.impulse_taxonomy.map((i) => `${i.id} (${i.name})`).join('; ') + '.';

addPassage({
  passage_id: 'psychology:impulse_taxonomy:list',
  source_file: 'psychology',
  source_citation: 'Stobaeus Eclogae 2.86-97',
  passage_type: 'canonical_line',
  canonical_mechanism: ['passion_causal_stage'],
  passion: null,
  sub_passion: null,
  audience_tier: 'R8a',
  text: impulseTaxonomyParagraph,
  paragraph_text: null,
});

psy.impulse_taxonomy.forEach((impulse) => {
  addPassage({
    passage_id: `psychology:impulse_taxonomy:${impulse.id}`,
    source_file: 'psychology',
    source_citation: 'Stobaeus Eclogae 2.86-97',
    passage_type: 'canonical_line',
    canonical_mechanism: ['passion_causal_stage'],
    passion: null,
    sub_passion: null,
    audience_tier: 'R8a',
    text: `${impulse.id} — ${impulse.name}`,
    paragraph_text: impulseTaxonomyParagraph,
  });
});

// ----------------------------------------------------------------------------
// PASSIONS_CONTEXT — source_file: passions (highest passion-tagging density)
// ----------------------------------------------------------------------------

const passionsCtx = PASSIONS_CONTEXT;

Object.entries(passionsCtx.four_root_passions).forEach(([passionId, root]) => {
  // Root passion definition (Mechanism 2)
  addPassage({
    passage_id: `passions:${passionId}:definition`,
    source_file: 'passions',
    source_citation: 'Stobaeus Eclogae Section 5; DL Lives 7.110-116',
    passage_type: 'mechanism',
    canonical_mechanism: ['passion_root_detection', 'passion_false_judgement'],
    passion: passionId,
    sub_passion: null,
    audience_tier: 'R8a',
    text: `${root.id} (${root.name}) — root passion targeting ${root.root_passion}.`,
    paragraph_text: null,
  });
  // Sub-species (Mechanism 3 + 5)
  const subSpeciesParagraph = `Sub-species of ${root.id} (${root.name}): ` +
    root.sub_species.map((s) => `${s.id} (${s.name})`).join('; ') + '.';
  root.sub_species.forEach((sub) => {
    addPassage({
      passage_id: `passions:${passionId}:${sub.id}:definition`,
      source_file: 'passions',
      source_citation: 'Stobaeus Eclogae Section 5; DL Lives 7.110-116',
      passage_type: 'mechanism',
      canonical_mechanism: ['passion_root_detection', 'passion_sub_species', 'passion_false_judgement'],
      passion: passionId,
      sub_passion: sub.id,
      audience_tier: 'R8a',
      text: `${sub.id} (${sub.name}) — sub-species of ${root.id}.`,
      paragraph_text: subSpeciesParagraph,
    });
  });
});

// Diagnostic sequence — application of Mechanisms 2, 3, 5 in sequence
const diagnosticParagraph = 'Stoic passion diagnostic sequence: 5 questions for assessing passion-presence and shape.';
passionsCtx.diagnostic_sequence.forEach((step, i) => {
  addPassage({
    passage_id: `passions:diagnostic_sequence:${i + 1}`,
    source_file: 'passions',
    source_citation: 'Stobaeus Eclogae Section 5; DL Lives 7.110-116',
    passage_type: 'scoring_rule',
    canonical_mechanism: ['passion_root_detection', 'passion_sub_species', 'passion_false_judgement'],
    passion: null,
    sub_passion: null,
    audience_tier: 'R8b',
    text: step,
    paragraph_text: diagnosticParagraph,
  });
});

// Three good feelings — eupatheiai (sub_passion holds the eupatheia ID per D5 §"passion / sub_passion indexing")
const eupatheiaParagraph =
  'The three eupatheiai (rational good feelings) per Stobaeus Eclogae 2.88: each replaces a corresponding root passion in the sage.';
passionsCtx.three_good_feelings.forEach((eup) => {
  addPassage({
    passage_id: `passions:eupatheia:${eup.id}`,
    source_file: 'passions',
    source_citation: 'Stobaeus Eclogae 2.88; DL Lives 7.116',
    passage_type: 'canonical_line',
    canonical_mechanism: ['passion_root_detection'],
    passion: null,
    sub_passion: eup.id,
    audience_tier: 'R8a',
    text: `${eup.id} (${eup.name}) — replaces ${eup.replaces}.`,
    paragraph_text: eupatheiaParagraph,
  });
});

// ----------------------------------------------------------------------------
// VIRTUE_CONTEXT — source_file: virtue
// ----------------------------------------------------------------------------

const virtueCtx = VIRTUE_CONTEXT;

addPassage({
  passage_id: 'virtue:unity_thesis',
  source_file: 'virtue',
  source_citation: 'DL Lives 7.125; Stobaeus Eclogae 2.59-63; Cicero De Officiis 1.15-18',
  passage_type: 'mechanism',
  canonical_mechanism: ['virtue_domain_engaged'],
  passion: null,
  sub_passion: null,
  audience_tier: 'R8a',
  text: virtueCtx.unity_thesis,
  paragraph_text: null,
});

const virtueParagraph =
  'The four expressions of virtue (per DL 7.92-93; Stobaeus Eclogae 2.59-63): ' +
  virtueCtx.four_expressions.map((v) => `${v.id} (${v.name})`).join('; ') + '. All four are unified.';

virtueCtx.four_expressions.forEach((virtue) => {
  addPassage({
    passage_id: `virtue:${virtue.id}:definition`,
    source_file: 'virtue',
    source_citation: 'DL Lives 7.92-93; Stobaeus Eclogae 2.59-63; Cicero De Officiis 1.15-18',
    passage_type: 'mechanism',
    canonical_mechanism: ['virtue_domain_engaged', 'katorthoma_proximity'],
    passion: null,
    sub_passion: null,
    audience_tier: 'R8a',
    text: `${virtue.id} (${virtue.name}) — domain: ${virtue.domain}.`,
    paragraph_text: virtueParagraph,
  });
  const subExpressionsParagraph = `Sub-expressions of ${virtue.id} (${virtue.name}): ` +
    virtue.sub_expressions.map((s) => `${s.id} (${s.name})`).join('; ') + '.';
  virtue.sub_expressions.forEach((sub) => {
    addPassage({
      passage_id: `virtue:${virtue.id}:${sub.id}`,
      source_file: 'virtue',
      source_citation: 'DL Lives 7.92-93; Stobaeus Eclogae 2.59-63',
      passage_type: 'mechanism',
      canonical_mechanism: ['virtue_domain_engaged'],
      passion: null,
      sub_passion: null,
      audience_tier: 'R8a',
      text: `${sub.id} (${sub.name}) — sub-expression of ${virtue.id}.`,
      paragraph_text: subExpressionsParagraph,
    });
  });
});

// ----------------------------------------------------------------------------
// VALUE_CONTEXT — source_file: value
// ----------------------------------------------------------------------------

const valueCtx = VALUE_CONTEXT;

addPassage({
  passage_id: 'value:hierarchy',
  source_file: 'value',
  source_citation: 'Stobaeus Eclogae Section 3; DL Lives 7.101-107; Cicero De Finibus 3.50-57',
  passage_type: 'mechanism',
  canonical_mechanism: ['value_indifferent'],
  passion: null,
  sub_passion: null,
  audience_tier: 'R8a',
  text: valueCtx.hierarchy,
  paragraph_text: null,
});

const preferredParagraph =
  'Preferred indifferents (proegmena) per Stobaeus Eclogae Section 3: ' +
  valueCtx.preferred_indifferents.map((i) => `${i.id} (${i.name}, axia: ${i.axia})`).join('; ') + '.';
valueCtx.preferred_indifferents.forEach((item) => {
  addPassage({
    passage_id: `value:preferred:${item.id}`,
    source_file: 'value',
    source_citation: 'Stobaeus Eclogae Section 3; DL Lives 7.101-107',
    passage_type: 'mechanism',
    canonical_mechanism: ['value_indifferent', 'prohairesis_filter'],
    passion: null,
    sub_passion: null,
    audience_tier: 'R8a',
    text: `${item.id} (${item.name}) — preferred indifferent, axia: ${item.axia}.`,
    paragraph_text: preferredParagraph,
  });
});

const dispreferredParagraph =
  'Dispreferred indifferents (apoproegmena) per Stobaeus Eclogae Section 3: ' +
  valueCtx.dispreferred_indifferents.map((i) => `${i.id} (${i.name}, axia: ${i.axia})`).join('; ') + '.';
valueCtx.dispreferred_indifferents.forEach((item) => {
  addPassage({
    passage_id: `value:dispreferred:${item.id}`,
    source_file: 'value',
    source_citation: 'Stobaeus Eclogae Section 3; DL Lives 7.101-107',
    passage_type: 'mechanism',
    canonical_mechanism: ['value_indifferent', 'prohairesis_filter'],
    passion: null,
    sub_passion: null,
    audience_tier: 'R8a',
    text: `${item.id} (${item.name}) — dispreferred indifferent, axia: ${item.axia}.`,
    paragraph_text: dispreferredParagraph,
  });
});

const selectionParagraph = 'Stoic selection principles for indifferents — guides what the wise person selects.';
valueCtx.selection_principles.forEach((principle, i) => {
  addPassage({
    passage_id: `value:selection_principles:${i + 1}`,
    source_file: 'value',
    source_citation: 'Cicero De Finibus 3.50-57; Stobaeus Eclogae Section 3',
    passage_type: 'canonical_line',
    canonical_mechanism: ['value_indifferent', 'prohairesis_filter'],
    passion: null,
    sub_passion: null,
    audience_tier: 'R8a',
    text: principle,
    paragraph_text: selectionParagraph,
  });
});

// ----------------------------------------------------------------------------
// ACTION_CONTEXT — source_file: action
// ----------------------------------------------------------------------------

const actionCtx = ACTION_CONTEXT;

Object.values(actionCtx.two_layers).forEach((layer) => {
  addPassage({
    passage_id: `action:two_layers:${layer.id}`,
    source_file: 'action',
    source_citation: 'Stobaeus Eclogae Section 4; Cicero De Officiis (whole); DL Lives 7.36-40',
    passage_type: 'mechanism',
    canonical_mechanism: ['katorthoma_proximity'],
    passion: null,
    sub_passion: null,
    audience_tier: 'R8a',
    text: `${layer.id} (${layer.name}) — ${layer.definition}`,
    paragraph_text: null,
  });
});

const oikeiosisParagraph =
  'The oikeiosis sequence per Cicero De Finibus 3.62-68: 5 stages of natural affiliation expansion — ' +
  actionCtx.oikeiosis_sequence.map((s) => `${s.stage}. ${s.name}`).join(' → ') + '.';

actionCtx.oikeiosis_sequence.forEach((stage) => {
  addPassage({
    passage_id: `action:oikeiosis:stage_${stage.stage}_${stage.id}`,
    source_file: 'action',
    source_citation: 'Cicero De Finibus 3.62-68; Hierocles On Appropriate Acts; Stobaeus Eclogae Section 4',
    passage_type: 'mechanism',
    canonical_mechanism: ['oikeiosis_stage'],
    passion: null,
    sub_passion: null,
    audience_tier: 'R8a',
    text: `Stage ${stage.stage} — ${stage.name} (${stage.id}): ${stage.description}`,
    paragraph_text: oikeiosisParagraph,
  });
});

const deliberationParagraph =
  'Cicero\'s 5-question deliberation framework per De Officiis Book 1: questions for assessing the honourable and the advantageous in concrete situations.';

actionCtx.deliberation_framework.forEach((q) => {
  addPassage({
    passage_id: `action:deliberation:${q.id}`,
    source_file: 'action',
    source_citation: 'Cicero De Officiis Book 1',
    passage_type: 'mechanism',
    canonical_mechanism: ['oikeiosis_obligation', 'katorthoma_proximity'],
    passion: null,
    sub_passion: null,
    audience_tier: 'R8a',
    text: `${q.id}. ${q.question}`,
    paragraph_text: deliberationParagraph,
  });
});

// ----------------------------------------------------------------------------
// PROGRESS_CONTEXT — source_file: progress
// ----------------------------------------------------------------------------

const prog = PROGRESS_CONTEXT;

addPassage({
  passage_id: 'progress:sage:description',
  source_file: 'progress',
  source_citation: 'Stobaeus Eclogae 2.66; Seneca Ep. 75; DL Lives 7.71-80; Epictetus Discourses 1.4',
  passage_type: 'canonical_line',
  canonical_mechanism: ['katorthoma_proximity'],
  passion: null,
  sub_passion: null,
  audience_tier: 'R8a',
  text: prog.binary_foundation.sage.description,
  paragraph_text: null,
});

const sageCharsParagraph =
  'Characteristics of the Stoic sage (sophos / sapiens) per Seneca Ep. 75 + DL 7.71-80: the upper bound of katorthoma_proximity.';
prog.binary_foundation.sage.characteristics.forEach((char, i) => {
  addPassage({
    passage_id: `progress:sage:characteristics:${i + 1}`,
    source_file: 'progress',
    source_citation: 'Seneca Ep. 75; DL Lives 7.71-80',
    passage_type: 'canonical_line',
    canonical_mechanism: ['katorthoma_proximity'],
    passion: null,
    sub_passion: null,
    audience_tier: 'R8a',
    text: char,
    paragraph_text: sageCharsParagraph,
  });
});

const gradesParagraph =
  'Senecan progress gradient (Ep. 75): 3 grades on the way to the sage — each below the sage but progressing.';
prog.progress_gradient.forEach((grade) => {
  addPassage({
    passage_id: `progress:gradient:${grade.id}`,
    source_file: 'progress',
    source_citation: 'Seneca Ep. 75',
    passage_type: 'mechanism',
    canonical_mechanism: ['katorthoma_proximity'],
    passion: null,
    sub_passion: null,
    audience_tier: 'R8a',
    text: `${grade.id} — ${grade.name}.`,
    paragraph_text: gradesParagraph,
  });
  const indicatorsParagraph = `Indicators of ${grade.name} (${grade.id}): ` + grade.indicators.join('; ') + '.';
  grade.indicators.forEach((indicator, i) => {
    addPassage({
      passage_id: `progress:gradient:${grade.id}:indicators:${i + 1}`,
      source_file: 'progress',
      source_citation: 'Seneca Ep. 75',
      passage_type: 'mechanism',
      canonical_mechanism: ['katorthoma_proximity'],
      passion: null,
      sub_passion: null,
      audience_tier: 'R8b',
      text: indicator,
      paragraph_text: indicatorsParagraph,
    });
  });
});

const metricsParagraph = 'Progress metrics per the Stoic developmental framework: 4 dimensions of measurable progress.';
prog.progress_metrics.forEach((metric) => {
  addPassage({
    passage_id: `progress:metrics:${metric.id}`,
    source_file: 'progress',
    source_citation: 'Stobaeus Eclogae 2.66; Epictetus Discourses 1.4 (alt-3 derived from Stoic Brain v3.0.0)',
    passage_type: 'mechanism',
    canonical_mechanism: ['katorthoma_proximity'],
    passion: null,
    sub_passion: null,
    audience_tier: 'R8b',
    text: `${metric.id} (${metric.name}) — ${metric.description}`,
    paragraph_text: metricsParagraph,
  });
});

// ----------------------------------------------------------------------------
// SCORING_CONTEXT — source_file: scoring (application-derived per R7 carve-out)
// ----------------------------------------------------------------------------

const scoringCtx = SCORING_CONTEXT;

const evalSequenceParagraph =
  'SageReasoning 4-stage evaluation sequence (application-derived per R7 carve-out): control → kathekon → passion → virtue.';

// Per-stage mechanism mapping per D4 §"scoring.json" — scoring_rule passages
// cite the mechanism(s) the rule operationalises. Stage 1 → prohairesis;
// Stage 2 → katorthoma_proximity (kathekon/katorthoma boundary per D4);
// Stage 3 → passion mechanisms (root + sub-species + false-judgement);
// Stage 4 → virtue.
const evalStageMechanisms = {
  control_filter: ['prohairesis_filter'],
  kathekon_evaluation: ['katorthoma_proximity'],
  passion_diagnosis: ['passion_root_detection', 'passion_sub_species', 'passion_false_judgement'],
  virtue_quality: ['virtue_domain_engaged'],
};

scoringCtx.evaluation_sequence.forEach((stage) => {
  addPassage({
    passage_id: `scoring:evaluation_sequence:${stage.id}`,
    source_file: 'scoring',
    source_citation: 'SageReasoning v3 methodology (alt-3 derived; application-layer per R7 carve-out)',
    passage_type: 'scoring_rule',
    canonical_mechanism: evalStageMechanisms[stage.id] || ['katorthoma_proximity'],
    passion: null,
    sub_passion: null,
    audience_tier: 'R8b',
    text: `Stage ${stage.stage} — ${stage.name} (${stage.id}): ${stage.question}`,
    paragraph_text: evalSequenceParagraph,
  });
});

const proximityParagraph =
  'SageReasoning katorthoma_proximity_scale (application-derived per R7 carve-out): 5 levels from reflexive to sage-like.';
scoringCtx.katorthoma_proximity_scale.forEach((level) => {
  addPassage({
    passage_id: `scoring:proximity_scale:${level.id}`,
    source_file: 'scoring',
    source_citation: 'SageReasoning v3 methodology (alt-3 derived; application-layer per R7 carve-out)',
    passage_type: 'scoring_rule',
    canonical_mechanism: ['katorthoma_proximity'],
    passion: null,
    sub_passion: null,
    audience_tier: 'R8b',
    text: `${level.id} (${level.name}) — ${level.description}`,
    paragraph_text: proximityParagraph,
  });
});

// ----------------------------------------------------------------------------
// Step 3 — Upsert all rows. KG7-aware: pass JSONB columns as plain JS values.
// KG1 rule 2: await each upsert.
// ----------------------------------------------------------------------------

console.log(`Decomposed into ${passages.length} corpus passages.`);

let upserted = 0;
let errors = 0;

for (const row of passages) {
  // KG7 sanity check: canonical_mechanism MUST be a JS array (not stringified).
  if (typeof row.canonical_mechanism === 'string') {
    console.error(`KG7 VIOLATION on ${row.passage_id}: canonical_mechanism is a string. Aborting.`);
    process.exit(1);
  }
  if (!Array.isArray(row.canonical_mechanism)) {
    console.error(`KG7 VIOLATION on ${row.passage_id}: canonical_mechanism is not an array. Aborting.`);
    process.exit(1);
  }
  const { error } = await supabase
    .from('corpus_passages')
    .upsert(row, { onConflict: 'passage_id' });
  if (error) {
    console.error(`Upsert error on ${row.passage_id}:`, error.message);
    errors++;
  } else {
    upserted++;
    if (upserted % 25 === 0) console.log(`  upserted ${upserted}/${passages.length}…`);
  }
}

console.log(`Upserted ${upserted} rows. Errors ${errors}.`);

// ----------------------------------------------------------------------------
// Step 4 — Final count check
// ----------------------------------------------------------------------------

const { count, error: countError } = await supabase
  .from('corpus_passages')
  .select('*', { count: 'exact', head: true });

if (countError) {
  console.error('Final count query failed:', countError.message);
  process.exit(1);
}

console.log(`Final corpus_passages count: ${count} rows.`);

if (errors > 0) {
  console.error(`COMPLETED WITH ERRORS — ${errors} rows failed. Review log above.`);
  process.exit(1);
}

console.log('DONE — corpus population complete.');
