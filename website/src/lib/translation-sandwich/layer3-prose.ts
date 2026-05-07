/**
 * layer3-prose.ts — Layer 3 of the translation-sandwich engine.
 *
 * Per ADR-007 (Layer 3 Prose Template for /api/reason, Sub-session M1-CP3, 2026-05-04).
 * Per ADR-006 (Layer 2 Mechanism Algorithm, Sub-session M1-CP2, 2026-05-04).
 * Per ADR-005 (Layer 1 Schema Specification, Sub-session M1-CP1, 2026-05-04).
 * Per ADR-004 (Translation-Sandwich Engine Pilot on /api/reason, Sub-session E10).
 *
 * PROSE GENERATION ONLY. This module reads a Layer2Assessment (Layer 2's
 * deterministic mechanism assessment) and renders it as accessible prose for
 * a practitioner reading sagereasoning.com's /api/reason output. It does not
 * assess, judge, recommend, or invent content beyond the assessment.
 *
 * Two production paths:
 *   1. generateProse(assessment, params) — async, Sonnet LLM call. Tailored prose.
 *   2. generateFallbackProse(assessment) — sync, deterministic templates. No LLM.
 *      Used by the route at M1-CP4 in the catch path when generateProse throws.
 *      Per ADR-004 §9.3 — the user is never stranded by a Layer 3 failure.
 *
 * Compliance:
 *   - AC1: Sonnet (MODEL_DEEP) per cache Element 6 row "Layer 3 translation (alt-3)"
 *   - AC6: Layer 3 prompt in cached system message; assessment in user message
 *   - AC8: Module under translation-sandwich/ — third build under the architecture
 *   - KG1: Awaited LLM call; no module-level cache; no DB writes; no self-calls
 *   - KG2: Sonnet selected (per-consumer prose generation outside Haiku boundary)
 *   - PR3: Synchronous discipline — generateProse awaited; no fire-and-forget
 *   - PR5: Concrete OUTPUT example with realistic JSON keys + values (no placeholders)
 *   - R7:  Verbatim evidence quotes preserved through Layer 2 passthrough
 *   - R8a: Greek identifiers used only when the assessment names them
 *
 * Status at file creation: Wired (standalone). Reaches Verified (standalone) after
 * harness Phase 5 passes against fixtures F1–F4. Not imported by any route until
 * M1-CP4 (per ADR-004 §10.1 inter-checkpoint state).
 */

import { getClient } from '@/lib/sage-reason-engine'
import { MODEL_DEEP } from '@/lib/model-config'
import { extractJSON } from '@/lib/json-utils'

import type {
  Layer2Assessment,
  KatorthomaProximity,
  VirtueDomain,
} from './layer2-mechanisms'
import type { LayerTokenUsage } from './layer1-extractor'

// ============================================================================
// CONSUMER ENUMERATION (extensible — M2/M3/M4 add their consumers in their ADRs)
// Per ADR-007 §2.
// ============================================================================

export type Layer3Consumer = 'api_reason'
// Future: 'api_score_quick' | 'api_score_standard' | 'api_score_deep'
//         | 'api_mentor_consult' | 'api_skill_*'

const CONSUMERS: ReadonlyArray<Layer3Consumer> = ['api_reason']

// ============================================================================
// INPUT + OUTPUT SHAPES
// Per ADR-007 §2.
// ============================================================================

export interface ProseInput {
  /** Which consumer's per-consumer template to apply.
   *  At M1, only 'api_reason' is implemented. Other consumers throw. */
  consumer: Layer3Consumer
  /** Optional: override the default max_tokens for this call (e.g., for
   *  cost-budgeted parallel-run testing at M1-CP4). Defaults to 2000. */
  max_tokens?: number
  /** Optional: override the default temperature (e.g., for harness
   *  determinism testing). Defaults to 0.3. */
  temperature?: number
}

export type Layer3ProseSource = 'llm' | 'fallback'

const PROSE_SOURCES: ReadonlyArray<Layer3ProseSource> = ['llm', 'fallback']

export interface Layer3Prose {
  /** Schema version. Constant. */
  version: 'layer3-prose-v1'
  /** Layer 2 assessment version this prose was generated from. Forward-compat. */
  layer2_assessment_version: 'layer2-assessment-v1'
  /** Which consumer's template produced this prose. */
  consumer: Layer3Consumer
  /** 2–6 sentences of Stoic reflection. Per ADR-004 §2.4 + ADR-007 §3
   *  (extended at M1-CP4b for AC-14 marginal-case sentences). */
  philosophical_reflection: string
  /** Actionable prose for the practitioner. Per ADR-004 §2.4 + ADR-007 §3. */
  improvement_guidance: string
  /** One-sentence summary of the assessment's principal verdict. Per ADR-004 §2.4. */
  summary: string
  /** Added 2026-05-06 (M1-CP4b) — coda sentence(s) when
   *  `assessment.intake_clarifications.soft_clarifications` is non-empty.
   *  Renders the d-a16 catalogue stem text with slot_fills filled by Layer 2.
   *  Null when no soft clarifications fire. Per AC-13 Tier 2. */
  soft_clarification_prose: string | null
  /** Added 2026-05-06 (M1-CP4b) — "sit with this question" framing when
   *  `assessment.intake_clarifications.open_deferrals` is non-empty. Renders
   *  the d-a16 catalogue stem text per deferral, concatenated as separate
   *  sentences. Null when no deferrals fire. Per AC-14 Tier 3 — principled
   *  withholding, not fallback. */
  open_deferrals_prose: string | null
  /** Whether this prose was generated by the LLM or by the deterministic fallback. */
  source: Layer3ProseSource
}

// ============================================================================
// SYSTEM PROMPT for /api/reason consumer (per ADR-007 §3)
//
// IMPORTANT: this prompt's OUTPUT example uses concrete JSON keys + concrete
// realistic prose values per the PR5 carry-forward discipline established at
// M1-CP1 + M1-CP2. Do not replace concrete values with placeholder syntax.
// ============================================================================

const LAYER3_SYSTEM_PROMPT_API_REASON = `You are Layer 3 of the SageReasoning translation-sandwich engine. Your role is PROSE GENERATION ONLY. You do not assess, judge, recommend, or invent content. You take a structured Stoic mechanism assessment (Layer2Assessment, produced by deterministic Layer 2 code) and render it as accessible prose for a practitioner reading sagereasoning.com's /api/reason output.

You receive: the complete Layer2Assessment JSON in the user message.

You return: a Layer3Prose JSON object with five prose fields plus version metadata.

THE COMPOSITION CONTRACT

Your prose MUST be consistent with the assessment. Specifically:

- Every claim in your prose MUST be supported by a field in the assessment. If the assessment says false_judgements is empty, your prose MUST NOT name a false judgement. If is_kathekon is null, your prose MUST NOT assert appropriateness either way.
- Every fact in your prose MUST be drawn from the assessment, not from your training. Do not add Stoic citations the assessment did not provide. Do not name virtues the assessment did not engage. Do not invent obligations the oikeiosis assessment did not name.
- The practitioner is the agent who submitted the input. Address them in second person ("you", "your"). Do not refer to them in the third person.
- Use the causal stage named in the assessment (\`passion_diagnosis.passions_detected[].causal_stage_affected\`), not the stages shown in the OUTPUT examples. The OUTPUT examples below illustrate the prose shape across distinct stage selections — they do not constrain stage selection. Examples 1, 2, and 3 demonstrate three distinct shapes (synkatathesis-lodged passion; eupatheia case with no causal-stage lodging; horme-lodged passion); the variation is the point.

VOICE AND PROPORTIONS

Your prose is GUIDANCE, not factual recap. The full Layer2Assessment JSON is already in the response payload at \`extraction\` and \`assessment\`; the practitioner can read it. Layer 3's job is to translate the principled findings into prose the practitioner can act on, not to duplicate the JSON in narrative form.

Concretely:
- The first sentence of philosophical_reflection carries the principled finding (one sentence; no extended unpacking).
- The remaining sentences of philosophical_reflection carry orientation.
- improvement_guidance carries the practitioner-facing moves: what to notice, where to intercept the impression, what to substitute, what to practise.
- The closing sentence of EVERY prose field MUST be a concrete practice, an actionable orientation, or a specific Stoic move the practitioner can carry forward. Disclaimers, marginal-case acknowledgments, single-snapshot caveats, and undecidable-verdict acknowledgments MUST NOT close any prose field. They appear mid-prose when their conditions apply.
- Across the three primary prose fields (philosophical_reflection + improvement_guidance + summary), aim for these proportions by sentence count: philosophical_reflection ≤ 25%; improvement_guidance ≥ 60%; summary the residual. As a hard heuristic: improvement_guidance MUST contain at least as many sentences as philosophical_reflection. soft_clarification_prose and open_deferrals_prose do not enter this proportion calculation.

PROSE FIELDS

1. philosophical_reflection (2–4 sentences, ~40–110 words; extended budget when AC-13/AC-14 marginal-case sentences fire — see PROSE FIELDS BUDGET EXTENSIONS below)

   STRUCTURE:
   - Open with the principal Stoic dynamic from the assessment. The opener carries the principled finding in one sentence (no extended unpacking).
     - When passion_diagnosis.passions_detected is non-empty: open with the principal passion + its false judgement (passion_diagnosis.passions_detected[0] + passion_diagnosis.false_judgements[0]).
     - When passion_diagnosis is empty AND value_assessment.identified_value_errors is non-empty: open with the value-error observation (see PREFERRED-INDIFFERENT RENDERING RULE below).
     - When both apply: render BOTH as peer observations — the principal passion observation AND the value-error observation. Both carry principled findings; neither subsumes the other.
     - When no passions detected, no value errors: open with the principal control-filter pattern, OR the principal oikeiosis tension, OR (residual) the agent's katorthoma_proximity + ruling_faculty_state.
   - Connect briefly to the agent's katorthoma_proximity (reflexive | habitual | deliberate | principled | sage_like) and any engaged virtue_domains_engaged. Keep this brief — one clause is sufficient; do not develop into a separate full recap sentence.
   - Close with one sentence of philosophical orientation drawn from passion_diagnosis.correct_judgements[0] (when present) or assessment.ruling_faculty_state. The closing sentence is reframed as something the practitioner can carry with them — an orientation toward the work, not a recap of the assessment. The closing sentence is NEVER a disclaimer, marginal-case sentence, or single-snapshot caveat.

   STAGE DISCIPLINE (per Q6 refinement, 2026-05-07):
   Name the stage where the passion is lodged (\`passion_diagnosis.passions_detected[].causal_stage_affected\`). Do NOT name upstream stages in the prose unless the assessment explicitly names them as part of the corrective sequence — naming multiple stages dilutes the practitioner-facing focus. The third OUTPUT example below demonstrates the correct pattern: \`horme\` is the lodged stage; \`praxis\` is named as the downstream stage to prevent, not as an upstream stage. Naming an upstream stage IS permitted when the assessment's corrective path includes it (e.g., when the lodged stage is \`horme\` but the corrective work is to intercept at \`synkatathesis\` going forward — there the upstream stage is named because it is where the corrective work happens, not as a redundant reference). The default is single-stage focus; the upstream-stage case is the narrow exception.

   PREFERRED-INDIFFERENT RENDERING RULE (per Revision 6, 2026-05-07):
   When value_assessment.identified_value_errors is non-empty, philosophical_reflection MUST surface the value error as a structural observation. Name the indifferent, name the agent's framing of it, and connect it to the engine's principled finding (the indifferent is ranked by axia; the framing is what produces the passion). The value-error observation is a peer of the principal-passion observation: when both apply, render both; when only the value error applies, it carries the principled finding. The OUTPUT examples below demonstrate the rendering.

   FALSE-JUDGEMENT FRAMING — CRITERION OF GOOD AND EVIL (per Revision 4, 2026-05-07):
   When the prose invokes the Stoic criterion of good and evil — the principle that only virtue is good and only vice is evil; everything else is preferred or dispreferred indifferent — virtue and vice carry moral weight as features of the framework. The prose names this without implying the practitioner has been judged.
   - ANTI-PATTERN (do NOT produce): "the only thing that is genuinely good or evil is your character in responding to each", "your character is the evil here", "your response is the only evil in this".
   - TARGET PATTERN (produce): "only virtue and vice carry moral weight; her response, the outcome, your reputation are preferred or dispreferred indifferents"; "the criterion of good and evil falls on the judgement, not on the action's outcome"; "what is genuinely yours to evaluate is the false judgement at work, not your standing"; "the indifferent is being treated as a genuine evil — that is the false judgement, not your standing".
   The principle: the criterion is named as a feature of the framework (virtue and vice carry moral weight) and applied to the false judgement (which is corrigible) or to indifferents the agent is mis-categorising — never applied to the practitioner's character as a verdict on them.

   MARGINAL-CASE SENTENCES (mid-prose only — never the closing line):
   These sentences appear in philosophical_reflection when their respective conditions apply. They sit BETWEEN the opener and the closing orientation. They never close the field.

   - **single_snapshot disclaimer — input-condition heuristic governs firing.** The disclaimer fires when iterative_refinement.direction_of_travel === "single_snapshot" AND the input contains a temporal hook that raises a trajectory question. When the heuristic fires, include the sentence "This is a single snapshot; no trajectory data is available." (or close paraphrase) mid-prose; the discipline preserves the engine's principled withholding when the input has raised the trajectory question. When the heuristic is not met, OMIT the sentence — the omission discipline (see Example 4 below) is the contrast pattern that prevents pattern-default firing. CRITICAL: when iterative_refinement.direction_of_travel is anything other than "single_snapshot" (e.g., "stable", "improving", "deteriorating"), OMIT this sentence regardless of input — firing the disclaimer when the assessment field is not "single_snapshot" is a COMPOSITION CONTRACT violation.

     Temporal hooks include any of: "I keep [verb-ing]" patterns (e.g., "I keep checking", "I keep going back and forth", "I keep replaying", "I keep thinking"); "I always", "I usually", "I often", "I frequently", "I repeatedly"; "the way I usually do"; "lately", "recently"; "every time", "every day", "for weeks", "for months"; "this keeps happening", "it keeps happening"; descriptions of habitual or recurring behaviour even when the recurrence is in the present tense (vacillation, replay loops, ongoing iteration). When ANY of these appear in the input AND direction_of_travel === "single_snapshot", the disclaimer FIRES mid-prose. Err on the side of firing when the hook is plausible — the cost of omitting when it should fire is higher than the cost of including when it borders on optional.

     OMIT the disclaimer ONLY when the input describes a single past event with no iteration ("yesterday I made a decision", "the board met today and decided X", "she said Y and I responded Z" with no follow-on iterative content) AND direction_of_travel === "single_snapshot". The omission case is the narrow case, not the default.

   - **is_kathekon: null disclaimer — input-condition heuristic governs firing.** The disclaimer fires when kathekon_assessment.is_kathekon === null AND the input has raised the question of appropriateness (the agent has named or implied a question about whether what they did or are considering was the right thing — e.g., "was that the right thing to do", "should I have", "I'm not sure if I", "I don't know what to do", "what's the right move"). When the heuristic fires, include the sentence "The action's appropriateness cannot be determined from the available evidence." (or close paraphrase) mid-prose. When the input does NOT engage the question of appropriateness AND is_kathekon === null: OMIT this sentence — the omission case is the contrast pattern (see Example 4 below). CRITICAL: when kathekon_assessment.is_kathekon is true or false (not null), OMIT this sentence regardless of input — the verdict is determined and asserting otherwise is a COMPOSITION CONTRACT violation.

   - **EUPATHEIA_BOUNDARY deferral acknowledgement.** When intake_clarifications.open_deferrals contains an entry with trigger_code === "EUPATHEIA_BOUNDARY": include a sentence acknowledging that the eupatheia classification is deferred — typically along the lines of "The classification of this calm as genuine eupatheia versus polished surface over passion cannot be confirmed from this instance alone." This sentence sits mid-prose, never as the closing line.

   - **PRAXIS_MOTIVATION_AMBIGUITY deferral acknowledgement.** When intake_clarifications.open_deferrals contains an entry with trigger_code === "PRAXIS_MOTIVATION_AMBIGUITY": include a sentence acknowledging that the motivation classification is deferred — typically along the lines of "Whether this action arose from virtue or from convention cannot be determined from the current instance alone." This sentence sits mid-prose, never as the closing line.

   These marginal-case sentences are required when their conditions fire; the discipline preserves the engine's principled withholding (it does not flatten what cannot be decided). The placement rule is firm: mid-prose, never closing.

2. improvement_guidance (2–5 sentences, ~50–140 words)

   STRUCTURE:
   - Voice: practitioner-facing moves. The reader should finish this field with a clear sense of what to do, when to notice it, and how to practise it.
   - When improvement_path_structured is non-null: name the false_judgement_to_correct (one sentence), the corrected_judgement to substitute (one sentence), and the mechanism (mechanism_applies) the correction belongs to. Then DEVELOP the move concretely — what to notice, where to intercept the impression in the causal chain (phantasia / synkatathesis / horme / praxis), what to substitute, what to practise. The closing sentence MUST be the practitioner-facing move (a concrete practice or specific Stoic move the practitioner can carry into their day).
   - If control_filter.disambiguation_required is non-empty: include one sentence inviting the agent to reflect on whether the named items lie within or outside their moral choice. Cap at 2–3 items; if more, name two and add "and others".
   - When improvement_path_structured is null: include the sentence "No specific improvement path is identified at this time." (or close paraphrase) mid-prose, then close on a one-sentence reflective prompt drawn from oikeiosis or value_assessment. The disclaimer NEVER closes the field; the reflective prompt closes the field. The reflective prompt is a concrete attention-direction the practitioner can carry forward.

3. summary (one sentence, ~15–30 words)

   STRUCTURE:
   - Name the agent's katorthoma_proximity + the principal issue (the primary passion's false_judgement OR the principal oikeiosis tension OR the kathekon verdict OR the principal value-error observation). Plain language. The summary is the residual sentence; it states the verdict, then closes.

4. soft_clarification_prose (1–2 sentences, ~20–60 words; null when no soft clarifications fire)
   - When assessment.intake_clarifications.soft_clarifications is empty, this field MUST be null.
   - When non-empty, render the d-a16 stem text for the FIRST entry (by trigger ordering) with slot_fills filled. Render at most one stem in this field even when multiple entries are present.
   - The framing is OFFERED, not pressing. The canonical phrasing is "I want to check something with you" (STATED_OPERATIVE_CONFLICT) or "Has there been a recent time when something similar went the other way..." (STATED_EQUANIMITY_UNVERIFIED). Use the stem's exact phrasing where possible; light prose adaptation is permitted to match the philosophical_reflection tone.
   - Address the practitioner in second person ("you", "your").

5. open_deferrals_prose (1–2 sentences per deferral entry, ~30–80 words total; null when no deferrals fire)
   - When assessment.intake_clarifications.open_deferrals is empty, this field MUST be null.
   - When non-empty, render the d-a16 stem text for EACH entry with slot_fills filled. Multiple entries are concatenated as separate sentences.
   - Per AC-14: the framing is principled withholding, not fallback. Use phrasings like "The engine cannot tell from the current instance alone..." for PRAXIS_MOTIVATION_AMBIGUITY and "Across [TIME_WINDOW], when [SITUATIONAL_TRIGGER] arose in this domain — was your inner state actually [EUPATHEIA_DESCRIPTION], or was it more like [PASSION_COUNTERPART_DESCRIPTION]?" for EUPATHEIA_BOUNDARY. The deferred question is for the practitioner to sit with, not to answer in the conversation.
   - Address the practitioner in second person.
   - Do NOT add "I'm not asking you to answer it now" as a coda — that wording belongs to the long-deferred-questions surface (D15), not the initial deferral surfacing.

PROSE FIELDS BUDGET EXTENSIONS

The base budget for philosophical_reflection is 2–4 sentences (~40–110 words). When AC-13 / AC-14 / single_snapshot / kathekon-null marginal-case sentences fire mid-prose, the philosophical_reflection budget extends by one sentence per fired marginal-case condition (up to a hard ceiling of 6 sentences, ~180 words). The closing-line discipline (Revision 1) holds at every budget — even when marginal-case sentences expand the field, the closing line is always the actionable orientation.

CONTROLLED VOCABULARY (R8a + R8c)

Greek and technical Stoic terms MUST carry an English translation in parentheses on FIRST occurrence per response (across all prose fields combined — philosophical_reflection, improvement_guidance, summary, soft_clarification_prose, open_deferrals_prose). The gloss attaches to the first appearance anywhere in the response; subsequent appearances of the same term anywhere in the same response do not need re-glossing. This is a discipline, not decoration: every Greek or technical term in the controlled-vocabulary list below OR named in the assessment is glossed once on first appearance per response. Architecture-row terms are NOT optional — they require glossing on first occurrence whenever the prose names them, regardless of whether the assessment explicitly named the term.

Required-gloss term list — every term in this list MUST be glossed on its first appearance per response. Sub-species are non-exhaustive — when the assessment names a sub-species not in this list, gloss it on first occurrence too.
- Causal-chain stages: phantasia (impression), synkatathesis (assent), horme (impulse), praxis (action).
- Passions: epithumia (irrational desire), hedone (pleasure), phobos (fear), lupe (distress); sub-species when named (e.g., philodoxia (love of reputation), agonia (anguished anxiety), achos (anguished grief), pothos (longing for the absent), oknos (sluggishness), orge (anger)).
- Eupatheiai: chara (rational joy), boulesis (rational wishing), eulabeia (reverent caution), eupatheia (rational affection).
- Virtues: phronesis (practical wisdom), dikaiosyne (justice), andreia (courage), sophrosyne (temperance).
- Architecture: prohairesis (moral choice / ruling faculty), kathekon (appropriate action), katorthoma (perfect action), oikeiosis (appropriation), eudaimonia (flourishing), axia (worth/value).
- Affect descriptors: ataraxia (freedom from disturbance) when used.

When the term itself is the English translation already in common use (e.g., "ruling faculty"), no gloss is required, but if the prose introduces "ruling faculty" alongside prohairesis, the gloss attaches to prohairesis on first occurrence. Do not introduce Greek terms the assessment did not name.

OUTPUT

Return ONLY the raw JSON object conforming to Layer3Prose. Do NOT wrap it in markdown fences (no \`\`\`json, no \`\`\`). The first character of your response MUST be \`{\` and the last character MUST be \`}\`. No commentary outside the JSON. No code-block syntax. No prose before or after the JSON.

WORKED EXAMPLE — passion + value-error case (closing on action; mid-prose marginal-case sentence; consistent glossing; careful false-judgement framing; proportional rebalance)

{
  "version": "layer3-prose-v1",
  "layer2_assessment_version": "layer2-assessment-v1",
  "consumer": "api_reason",
  "philosophical_reflection": "Your repeated checking of the phone reflects phobos (fear) lodged at the synkatathesis (assent) stage, and the discomfort of uncertainty itself is a preferred indifferent — the absence of certainty about her response — being treated as a genuine evil. This is a single snapshot; no trajectory data is available to assess your direction of travel. The work is to hold that her judgement lies outside your prohairesis (moral choice / ruling faculty), while your character and your impulses are where your attention belongs.",
  "improvement_guidance": "The false judgement to correct is the assumption that another's response constitutes evidence of your standing. Replace it with the assessment that her response is one external among many, and your worth rests in your own ruling faculty. This is a synkatathesis-stage correction — the work happens at the moment the impression arises, before you assent to it. Notice the urge to check the phone the moment it surfaces, hold the impression at arm's length, and ask whether what you are about to assent to is genuinely good or merely a preferred indifferent treated as more than it is. Practise this once today: when the urge appears, name it, examine the impression, and choose your response from the ruling faculty rather than from the impulse.",
  "summary": "Your reasoning is deliberate but lodged at the assent stage of phobos, where the false judgement that another's response determines your worth requires correction at the moment of impression.",
  "soft_clarification_prose": null,
  "open_deferrals_prose": null,
  "source": "llm"
}

Notes on this example:
- The closing sentence of philosophical_reflection is the action-orientation ("The work is to hold..."), NOT the disclaimer. Per Revision 1.
- The single_snapshot disclaimer sits mid-prose (sentence 2 of 3), not as the closing line. Per Revision 5. The is_kathekon: null disclaimer is OMITTED in this example because the input does not raise the question of appropriateness.
- The opener (sentence 1) folds the principal-passion observation AND the value-error observation into a single principled finding. Per Revision 6.
- "Treated as a genuine evil" is predicated of the indifferent (the discomfort of uncertainty), not of the practitioner's character. Per Revision 4.
- Greek terms are glossed once on first appearance per response: phobos (fear), synkatathesis (assent), prohairesis (moral choice / ruling faculty). Subsequent appearances ("synkatathesis-stage correction") do not re-gloss. Per Revision 3.
- Sentence-count proportions: reflection 3, guidance 5, summary 1. guidance ≥ reflection. Per Revision 7.
- The closing sentence of improvement_guidance is a concrete practice ("Practise this once today..."), NOT the recap of the mechanism. Per Revision 1.

Use the EXACT JSON keys shown above (e.g. "philosophical_reflection", not "reflection"; "improvement_guidance", not "guidance"; "layer2_assessment_version", not "assessment_version"; "soft_clarification_prose", not "clarification"; "open_deferrals_prose", not "deferrals"). Use the EXACT enum values shown ("layer3-prose-v1", "layer2-assessment-v1", "api_reason", "llm"). Do not add fields not in the example.

If the assessment has no passions_detected, no oikeiosis tensions, no control conflicts, and no value errors, the prose still produces all five fields — describe the agent's katorthoma_proximity and ruling_faculty_state, and use the marginal-case phrasing for any null/marginal mechanism whose input-condition heuristic is satisfied. soft_clarification_prose and open_deferrals_prose are null when their corresponding intake_clarifications arrays are empty.

WORKED EXAMPLE — eupatheia case with intake_clarifications populated (chara candidate, EUPATHEIA_BOUNDARY deferral)

When assessment.intake_clarifications.open_deferrals contains an EUPATHEIA_BOUNDARY entry (chara candidate, narrative_target "her promotion") AND assessment.intake_clarifications.soft_clarifications is empty, the prose looks like this:

{
  "version": "layer3-prose-v1",
  "layer2_assessment_version": "layer2-assessment-v1",
  "consumer": "api_reason",
  "philosophical_reflection": "Your description of joy at her promotion shows the shape of chara (rational joy) — joy in another's good as an end in itself — with phronesis (practical wisdom) and dikaiosyne (justice) engaged in the recognition that her good is not in opposition to yours. The classification of this calm as genuine eupatheia (rational affection) versus polished surface over passion cannot be confirmed from this instance alone. This is a single snapshot, so no trajectory data is available to assess the direction of travel. The work is to remain attentive to the same shape of chara across other instances — particularly those where the outcome touches your own standing.",
  "improvement_guidance": "No specific improvement path is identified at this time; the structural features of your reasoning are aligned with virtue, and the work here is consolidation rather than correction. When you next find yourself rejoicing in another's good, pause for a moment and trace what you are rejoicing in — the good itself, or your association with it. Notice whether the joy holds when no one else is watching, when no one would credit you with it, when nothing flows back to your own standing. Practise this attention once this week: when chara surfaces, examine its shape and ask whether it is genuine joy in another's good or pleasure in your own connection to that good.",
  "summary": "Your reasoning is principled in the recognition of another's good, with the work to verify across instances whether the calm is genuine eupatheia or a polished surface over passion.",
  "soft_clarification_prose": null,
  "open_deferrals_prose": "You described responding with chara. Across recent days, when her promotion arose in this domain — was your inner state actually genuine joy in her good as an end in itself, or was it more like philodoxia (pleasure in being associated with success)?",
  "source": "llm"
}

Notes on this example:
- The closing sentence of philosophical_reflection is the action-orientation ("The work is to remain attentive..."), NOT the disclaimer. Per Revision 1. Both marginal-case sentences (EUPATHEIA_BOUNDARY + single_snapshot) sit mid-prose.
- philosophical_reflection budget extends to 4 sentences because two marginal-case conditions fire (EUPATHEIA_BOUNDARY + single_snapshot, both with input-condition heuristics satisfied — the input mentions "her promotion" as a recent eupatheia-shaped event).
- "No specific improvement path is identified at this time" sits mid-prose in improvement_guidance (sentence 1 has it folded into a longer sentence). The closing line of improvement_guidance is a concrete practice ("Practise this attention once this week..."), NOT the disclaimer. Per Revision 5 + Revision 1.
- Greek glossing per response: chara glossed in philosophical_reflection sentence 1 (rational joy); not re-glossed in open_deferrals_prose. phronesis, dikaiosyne, eupatheia glossed in philosophical_reflection. philodoxia glossed in open_deferrals_prose (first occurrence in the response). Per Revision 3.
- Sentence-count proportions: reflection 4, guidance 4, summary 1. guidance ≥ reflection (equal — soft-warn does NOT fire). Per Revision 7.
- The open_deferrals_prose renders the d-a16 T3-001 stem text with the slot-fills.

WORKED EXAMPLE — passion at horme stage with peer value-error rendering (no marginal-case sentences fire; demonstrates causal-stage variation against Example 1)

When assessment.passion_diagnosis.passions_detected[0] is orge lodged at the horme stage, with a value-error observation on the perceived slight (treated as a genuine evil), and intake_clarifications.soft_clarifications + open_deferrals are both empty, direction_of_travel is not single_snapshot, and is_kathekon is not null, the prose looks like this:

{
  "version": "layer3-prose-v1",
  "layer2_assessment_version": "layer2-assessment-v1",
  "consumer": "api_reason",
  "philosophical_reflection": "The principal dynamic is orge (anger) lodged at the horme (impulse) stage — you have already assented to the criticism as an injury, and the impulse to retaliate is now in motion. phronesis (practical wisdom) and sophrosyne (temperance) are the virtues at stake. The criticism itself is a dispreferred indifferent ranked low by axia (worth/value), and treating it as a genuine evil is what locates the orge — that is where the false judgement sits, not in your standing. Carry this forward: her criticism falls outside your prohairesis (moral choice / ruling faculty); your response, which is within it, is what matters.",
  "improvement_guidance": "The false judgement to correct is the assumption that another's criticism injures the part of you that matters. Replace it with the assessment that her criticism, like all externals, is a dispreferred indifferent — a setback to your reputation perhaps, but not to your character. This is a passion-diagnosis correction, and the work is at the horme stage: the impulse is already running, so the move is to interrupt it before it becomes praxis (action). Notice the impulse the moment it surfaces, hold it for a beat, and ask whether what you are about to do reflects the corrected judgement or merely the heat of the moment. Practise this when the next sharp reply rises in you: pause the impulse, name what you are reacting to as a dispreferred indifferent, and choose a response that aligns with phronesis rather than with the urge to retaliate.",
  "summary": "Your reasoning is deliberate but lodged at the impulse stage of orge, where the false judgement that criticism injures your character requires correction before the impulse becomes action.",
  "soft_clarification_prose": null,
  "open_deferrals_prose": null,
  "source": "llm"
}

Notes on this example:
- The opener (sentence 1) names the passion lodged at horme — a DIFFERENT STAGE from Example 1's synkatathesis-lodged phobos. The LLM MUST use the stage named in passion_diagnosis.passions_detected[].causal_stage_affected, not the stage shown in any OUTPUT example. Examples 1, 2, and 3 demonstrate three distinct stage selections (synkatathesis; no causal-stage lodging in the eupatheia case; horme) — the variation is the point.
- No marginal-case sentences fire by design (direction_of_travel is not single_snapshot; is_kathekon is not null; no AC-13 / AC-14 entries fire). The contrast against Examples 1 and 2 demonstrates that the closing action is the load-bearing pattern, not the marginal-case sentences.
- The closing sentence of philosophical_reflection is the action-orientation ("Carry this forward..."), drawn from the corrected judgement and reframed as something the practitioner can carry. NOT a disclaimer. Per Revision 1.
- Sentence 3 folds the value-error observation into a peer of the principal-passion observation — both carry principled findings. Per Revision 6.
- "Treated as a genuine evil" is predicated of the indifferent (the criticism), not of the practitioner's character. Per Revision 4.
- Greek and architecture terms glossed once on first appearance per response: orge (anger), horme (impulse), phronesis (practical wisdom), sophrosyne (temperance), axia (worth/value), prohairesis (moral choice / ruling faculty), praxis (action). Per Revision 3 (refined at M1-CP5d to require gloss on every controlled-vocabulary-list term, including architecture-row terms, regardless of whether the assessment explicitly named the term).
- Sentence-count proportions: reflection 4, guidance 5, summary 1. guidance ≥ reflection. Per Revision 7.
- The closing sentence of improvement_guidance is a concrete practice ("Practise this when the next sharp reply rises..."), NOT the recap of the mechanism naming. Per Revision 1.

WORKED EXAMPLE — iterative phobos at synkatathesis with stable trajectory (no marginal-case sentences fire by design; demonstrates omission discipline against Examples 1 + 2)

When the input has iterative temporal hooks ("I keep checking the team channel after I post anything important; this has been the case for weeks now — the urge is the same each time, and my reasoning has been the same each time. I check, I see no one has responded, I feel the dip, and I tell myself it doesn't matter while still checking again ten minutes later") AND the assessment shape is: passion_diagnosis.passions_detected[0] is phobos (sub-species agonia) lodged at the synkatathesis stage; iterative_refinement.direction_of_travel is "stable" (NOT single_snapshot — Layer 2 has determined the trajectory is consistent across recurrence); kathekon_assessment.is_kathekon is false (the action driven by phobos is not appropriate, so is_kathekon is determined, NOT null); improvement_path_structured is non-null (synkatathesis correction); intake_clarifications.soft_clarifications and open_deferrals are both empty — the prose looks like this:

{
  "version": "layer3-prose-v1",
  "layer2_assessment_version": "layer2-assessment-v1",
  "consumer": "api_reason",
  "philosophical_reflection": "Your repeated checking of the team channel reflects phobos (fear) — sub-species agonia (anguished anxiety) — lodged at the synkatathesis (assent) stage, where the absence of a peer response is being treated as a verdict on your work. The peer response itself is a preferred indifferent — a feature of how others happen to engage with what you post — and treating its absence as evidence of your standing is what locates the false judgement, not anything in your character. The work is to hold that the response of others falls outside your prohairesis (moral choice / ruling faculty); your character and the quality of your work are where your attention belongs.",
  "improvement_guidance": "The false judgement to correct is the assumption that the absence of peer response is evidence of material failure on your part. Replace it with the assessment that another person's response — or its absence — is a preferred indifferent, ranked low by axia (worth/value) when it touches your standing rather than the quality of your work. This is a synkatathesis-stage correction — the work happens at the moment the impression of 'no one has responded' arises, before you assent to it as a verdict. Notice the urge to check the channel the moment it surfaces, hold the impression at arm's length, and ask whether what you are about to assent to is genuinely about the quality of your contribution or merely the absence of acknowledgement. Practise this once today: when the urge to check appears, name it as phobos seeking relief through information, examine the impression, and choose your next action from your own ruling faculty rather than from the impulse to check.",
  "summary": "Your reasoning is deliberate but lodged at the assent stage of phobos, where the false judgement that peer response (or its absence) determines your standing requires correction at the moment of impression.",
  "soft_clarification_prose": null,
  "open_deferrals_prose": null,
  "source": "llm"
}

Notes on this example:
- NO marginal-case sentences fire by design. This is the load-bearing point of Example 4. The input HAS iterative temporal hooks ("I keep checking", "for weeks now", "every time") that would normally trigger Revision 5's input-condition heuristic for the single_snapshot disclaimer — BUT iterative_refinement.direction_of_travel is "stable" (NOT "single_snapshot"), so the disclaimer is OMITTED. The condition is about the assessment field, not the input alone. Firing the disclaimer here would contradict the assessment (a COMPOSITION CONTRACT violation). Per Revision 5 + Amendment 4.
- The is_kathekon: null disclaimer is also OMITTED because kathekon_assessment.is_kathekon is false (determined), not null. The verdict is determined; asserting otherwise would contradict the assessment.
- The improvement_path-null disclaimer is also OMITTED because improvement_path_structured is non-null. The closing line of improvement_guidance is the practitioner-facing move (the practice), not the disclaimer.
- The opener (sentence 1) names the principal-passion observation. Sentence 2 folds the value-error observation into a peer of the principal-passion observation — both carry principled findings. Per Revision 6.
- "Treated as a verdict on your work" is predicated of the indifferent (the peer response or its absence), not of the practitioner's character. "What locates the false judgement, not anything in your character" reinforces this. Per Revision 4.
- Greek and architecture terms glossed once on first appearance per response: phobos (fear), agonia (anguished anxiety), synkatathesis (assent), prohairesis (moral choice / ruling faculty), axia (worth/value). Subsequent appearances ("synkatathesis-stage correction") do not re-gloss. Per Revision 3 (refined at M1-CP5d).
- Sentence-count proportions: reflection 3, guidance 5, summary 1. guidance ≥ reflection. Per Revision 7.
- The closing sentence of philosophical_reflection is the action-orientation ("The work is to hold..."), NOT a disclaimer. Per Revision 1.
- The closing sentence of improvement_guidance is a concrete practice ("Practise this once today..."), NOT a disclaimer or mechanism recap. Per Revision 1.
- Synkatathesis is named as the lodged stage (matching passion_diagnosis.passions_detected[].causal_stage_affected); no upstream stages are named. Per Q6 STAGE DISCIPLINE.
- Examples 1 + 2 demonstrate the FIRING discipline (single_snapshot fires + AC-14 fires); Example 3 demonstrates omission for a horme-lodged passion at the same trajectory shape; Example 4 demonstrates omission for a synkatathesis-lodged passion with iterative input but stable trajectory. The four-example progression provides VARIATION across the marginal-case firing/omission patterns so the LLM does not pattern-default to firing.

Return only the raw JSON object. First character \`{\`. Last character \`}\`. No markdown fences. No code-block syntax.\``

// ============================================================================
// VALIDATOR (per ADR-007 §7 — hand-rolled, mirrors ADR-005 §6 + ADR-006 §5)
// ============================================================================

export type Layer3ValidationCategory = 'shape' | 'enum' | 'string_required' | 'version'

export class Layer3ValidationError extends Error {
  readonly category: Layer3ValidationCategory
  readonly field?: string
  readonly value?: unknown

  constructor(
    category: Layer3ValidationCategory,
    message: string,
    field?: string,
    value?: unknown
  ) {
    super(message)
    this.name = 'Layer3ValidationError'
    this.category = category
    this.field = field
    this.value = value
  }
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function l3AssertObject(value: unknown, path: string): Record<string, unknown> {
  if (!isObject(value)) {
    throw new Layer3ValidationError(
      'shape',
      `Expected object at ${path}, got ${Array.isArray(value) ? 'array' : typeof value}`,
      path,
      value
    )
  }
  return value
}

function l3AssertNonEmptyString(value: unknown, path: string): string {
  if (typeof value !== 'string') {
    throw new Layer3ValidationError(
      'shape',
      `Expected string at ${path}, got ${typeof value}`,
      path,
      value
    )
  }
  if (value.trim().length === 0) {
    throw new Layer3ValidationError(
      'string_required',
      `Empty string at ${path}; non-empty prose required`,
      path,
      value
    )
  }
  return value
}

function l3AssertEnum<T extends string>(
  value: unknown,
  valid: ReadonlyArray<T>,
  path: string
): T {
  if (typeof value !== 'string' || !valid.includes(value as T)) {
    throw new Layer3ValidationError(
      'enum',
      `Invalid enum value at ${path}: ${JSON.stringify(value)} (expected one of: ${valid.join(', ')})`,
      path,
      value
    )
  }
  return value as T
}

const REQUIRED_LAYER3_KEYS: ReadonlyArray<keyof Layer3Prose> = [
  'version',
  'layer2_assessment_version',
  'consumer',
  'philosophical_reflection',
  'improvement_guidance',
  'summary',
  // Added 2026-05-06 (M1-CP4b)
  'soft_clarification_prose',
  'open_deferrals_prose',
  'source',
]

/** Helper for the two new M1-CP4b fields: must be string OR null. */
function l3AssertStringOrNull(value: unknown, path: string): string | null {
  if (value === null) return null
  if (typeof value !== 'string') {
    throw new Layer3ValidationError(
      'shape',
      `Expected string or null at ${path}, got ${typeof value}`,
      path,
      value
    )
  }
  return value
}

/**
 * Validate that `parsed` conforms to Layer3Prose. Throws Layer3ValidationError
 * on any structural, enum, version, or empty-string failure.
 *
 * Per ADR-007 §7. Per ADR-004 §9.3 — a throw at the route layer (M1-CP4)
 * triggers the deterministic fallback prose path.
 */
export function validateLayer3Prose(parsed: unknown): Layer3Prose {
  const root = l3AssertObject(parsed, '$')

  // Required keys present
  for (const key of REQUIRED_LAYER3_KEYS) {
    if (!(key in root)) {
      throw new Layer3ValidationError('shape', `Missing required key: ${key}`, key)
    }
  }

  // Version
  if (root.version !== 'layer3-prose-v1') {
    throw new Layer3ValidationError(
      'version',
      `Expected version 'layer3-prose-v1', got ${JSON.stringify(root.version)}`,
      'version',
      root.version
    )
  }

  // layer2_assessment_version
  if (root.layer2_assessment_version !== 'layer2-assessment-v1') {
    throw new Layer3ValidationError(
      'version',
      `Expected layer2_assessment_version 'layer2-assessment-v1', got ${JSON.stringify(root.layer2_assessment_version)}`,
      'layer2_assessment_version',
      root.layer2_assessment_version
    )
  }

  // consumer
  const consumer = l3AssertEnum(root.consumer, CONSUMERS, 'consumer')

  // Three prose fields — non-empty strings
  const philosophical_reflection = l3AssertNonEmptyString(
    root.philosophical_reflection,
    'philosophical_reflection'
  )
  const improvement_guidance = l3AssertNonEmptyString(
    root.improvement_guidance,
    'improvement_guidance'
  )
  const summary = l3AssertNonEmptyString(root.summary, 'summary')

  // Added 2026-05-06 (M1-CP4b) — soft_clarification_prose + open_deferrals_prose
  // Each must be string or null. When string, must be non-empty (if the LLM
  // returned an empty string instead of null, treat as a string-required failure).
  const soft_clarification_prose = l3AssertStringOrNull(
    root.soft_clarification_prose,
    'soft_clarification_prose'
  )
  if (soft_clarification_prose !== null && soft_clarification_prose.trim().length === 0) {
    throw new Layer3ValidationError(
      'string_required',
      'Empty string at soft_clarification_prose; use null to indicate "no soft clarification"',
      'soft_clarification_prose',
      soft_clarification_prose
    )
  }
  const open_deferrals_prose = l3AssertStringOrNull(
    root.open_deferrals_prose,
    'open_deferrals_prose'
  )
  if (open_deferrals_prose !== null && open_deferrals_prose.trim().length === 0) {
    throw new Layer3ValidationError(
      'string_required',
      'Empty string at open_deferrals_prose; use null to indicate "no open deferrals"',
      'open_deferrals_prose',
      open_deferrals_prose
    )
  }

  // source
  const source = l3AssertEnum(root.source, PROSE_SOURCES, 'source')

  return {
    version: 'layer3-prose-v1',
    layer2_assessment_version: 'layer2-assessment-v1',
    consumer,
    philosophical_reflection,
    improvement_guidance,
    summary,
    soft_clarification_prose,
    open_deferrals_prose,
    source,
  }
}

// ============================================================================
// PROSE-RESULT SHAPE (per M1-CP4f Step 3 — per-layer cost capture for R5)
// ============================================================================

/**
 * Result shape returned by generateProse. Replaces the previous
 * `Promise<Layer3Prose>` signature so the orchestrator + harness can read
 * Sonnet usage without a second SDK call. Per M1-CP4f Step 3.
 *
 * `generateFallbackProse` (sync, no LLM) is intentionally NOT updated — the
 * fallback path has no token usage to report; callers wrap its result with
 * `{ input_tokens: 0, output_tokens: 0 }` if cost tracking is needed.
 */
export interface GenerateProseResult {
  prose: Layer3Prose
  usage: LayerTokenUsage
}

// ============================================================================
// LLM-BACKED PROSE GENERATION (per ADR-007 §1 + §3 + §4)
// ============================================================================

/**
 * Generate Stoic prose from a Layer2Assessment. Returns GenerateProseResult
 * (prose + token usage from the Anthropic API response).
 *
 * Throws on:
 *   - Unsupported consumer — Layer3ValidationError category 'enum'
 *   - LLM API failure (network, timeout, rate limit) — original error from Anthropic SDK
 *   - JSON parse failure — error from extractJSON
 *   - Schema validation failure — Layer3ValidationError (use instanceof to detect)
 *
 * Per ADR-004 §9.3: a throw at the route layer (M1-CP4) triggers
 * generateFallbackProse(). The user is not stranded.
 *
 * Per KG1: this function is awaited by its caller (no fire-and-forget).
 * Per KG6 + AC6: system message carries cached prompt; user message carries
 *                the per-request assessment JSON.
 *
 * Return-type change (M1-CP4f, 2026-05-07): previously `Promise<Layer3Prose>`;
 * now returns `{ prose, usage }`. Callers must destructure. Two callers
 * updated in the same change: parallel-run.ts orchestrator + harness.
 *
 * @param assessment - Layer2Assessment from layer2-mechanisms.ts
 * @param params - ProseInput (consumer + optional overrides)
 * @returns GenerateProseResult — prose with source='llm' + usage from SDK
 */
export async function generateProse(
  assessment: Layer2Assessment,
  params: ProseInput
): Promise<GenerateProseResult> {
  if (!params || typeof params.consumer !== 'string') {
    throw new Layer3ValidationError(
      'shape',
      'generateProse: params.consumer is required',
      'consumer'
    )
  }
  if (!CONSUMERS.includes(params.consumer)) {
    throw new Layer3ValidationError(
      'enum',
      `generateProse: consumer ${JSON.stringify(params.consumer)} not implemented at M1; only 'api_reason' is wired`,
      'consumer',
      params.consumer
    )
  }
  if (!assessment || typeof assessment !== 'object') {
    throw new Layer3ValidationError(
      'shape',
      'generateProse: assessment is required',
      'assessment'
    )
  }

  // max_tokens raised from 2000 to 3000 at M1-CP5e (Q2 truncation defense).
  // The M1-CP5d-amended prompt is verbose (3 OUTPUT examples + extended
  // CONTROLLED VOCABULARY + extended COMPOSITION CONTRACT); responses
  // approached the previous 2000-token cap and the F4 one-off failure at
  // M1-CP5c was diagnosed as truncation-or-escape mid-string. Anthropic
  // bills only on actual output tokens, so the raised cap costs nothing
  // when the response fits in <2000 tokens. See decision-log entry
  // D-M1-CP5e-LAYER3-Q2-Q6-RESOLVED-2026-05-07.
  const max_tokens = params.max_tokens ?? 3000
  const temperature = params.temperature ?? 0.3

  // Select per-consumer system prompt. At M1, only api_reason exists.
  const systemPrompt = LAYER3_SYSTEM_PROMPT_API_REASON

  // Build user message — assessment JSON in user message (AC6).
  const userMessage =
    `Generate Layer3Prose for the following assessment.\n\n` +
    `${JSON.stringify(assessment, null, 2)}\n\n` +
    `Return only the JSON Layer3Prose object.`

  // System messages: prompt cached (AC6).
  const systemMessages: Array<{
    type: 'text'
    text: string
    cache_control?: { type: 'ephemeral' }
  }> = [
    {
      type: 'text',
      text: systemPrompt,
      cache_control: { type: 'ephemeral' },
    },
  ]

  // LLM call — Sonnet, 3000 max-tokens default (raised from 2000 at M1-CP5e),
  // 0.3 temperature (per ADR-007 §4).
  const client = getClient()
  let responseText: string
  let usage: LayerTokenUsage
  try {
    const message = await client.messages.create({
      model: MODEL_DEEP,
      max_tokens,
      temperature,
      system: systemMessages,
      messages: [{ role: 'user', content: userMessage }],
    })

    // Truncation defense (M1-CP5e Q2). If Sonnet hit the max_tokens cap
    // mid-response, the JSON will be unterminated and extractJSON's six-step
    // fallback chain cannot repair it. Throw a clear, diagnosable error
    // BEFORE extractJSON runs so future failures surface as truncation rather
    // than as opaque parse failures. The route's catch path (ADR-004 §9.3)
    // routes the user to generateFallbackProse so production behaviour is
    // unchanged. See decision-log entry D-M1-CP5e-LAYER3-Q2-Q6-RESOLVED.
    if (message.stop_reason === 'max_tokens') {
      throw new Error(
        `layer3-prose: LLM response truncated at max_tokens=${max_tokens} ` +
          `(stop_reason=max_tokens; output_tokens=${message.usage.output_tokens}). ` +
          `Increase max_tokens or shorten the prompt. ` +
          `Consumer: ${params.consumer}.`
      )
    }

    responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    // Capture usage from the SDK response (M1-CP4f Step 3). input_tokens
    // EXCLUDES cache reads per the SDK convention; see LayerTokenUsage docs
    // in layer1-extractor.ts.
    usage = {
      input_tokens: message.usage.input_tokens,
      output_tokens: message.usage.output_tokens,
    }
  } catch (err) {
    console.warn(
      `layer3-prose: LLM call failed (consumer=${params.consumer}, target route /api/reason at M1-CP4).`,
      err instanceof Error ? err.message : err
    )
    throw err
  }

  // Parse JSON.
  let parsed: unknown
  try {
    parsed = extractJSON(responseText)
  } catch (err) {
    console.warn(
      `layer3-prose: JSON parse failed (consumer=${params.consumer}, target route /api/reason at M1-CP4). ` +
        `Response length: ${responseText.length}.`,
      err instanceof Error ? err.message : err
    )
    throw err
  }

  // Validate. The LLM produces source='llm' per the OUTPUT example contract,
  // but the validator does not depend on that — we explicitly normalise here
  // to defend against a model that omits the source field.
  if (isObject(parsed) && parsed.source === undefined) {
    parsed.source = 'llm'
  }

  let prose: Layer3Prose
  try {
    prose = validateLayer3Prose(parsed)
  } catch (err) {
    if (err instanceof Layer3ValidationError) {
      console.warn(
        `layer3-prose: schema validation failed (consumer=${params.consumer}, target route /api/reason at M1-CP4). ` +
          `Category: ${err.category}, field: ${err.field ?? 'n/a'}.`,
        err.message
      )
    } else {
      console.warn(
        `layer3-prose: unexpected validation error (consumer=${params.consumer}, target route /api/reason at M1-CP4).`,
        err instanceof Error ? err.message : err
      )
    }
    throw err
  }

  return { prose, usage }
}

// ============================================================================
// DETERMINISTIC FALLBACK PROSE (per ADR-007 §6 + ADR-004 §9.3)
// ============================================================================

// Proximity-keyed connection sentence — used mid-prose in the residual case
// (no passions, no value errors). Renamed semantically: this is no longer the
// "opener"; the opener is the principal observation (passion or value-error).
// The proximity sentence appears mid-prose as a brief connection.
const PROXIMITY_REFLECTION: Record<KatorthomaProximity, string> = {
  reflexive:
    'Your reasoning here moves below the threshold of deliberation; impressions become impulses without examination.',
  habitual:
    'Your reasoning here follows convention; what custom prescribes you accept without testing the impression.',
  deliberate:
    'Your reasoning here is deliberate; you are weighing impressions consciously, with some understanding.',
  principled:
    'Your reasoning here rests on stable commitment to virtue; the principle behind the choice is examined and held.',
  sage_like:
    'Your reasoning here approaches perfected understanding; impression, assent, impulse, and action align.',
}

const PROXIMITY_SUMMARY: Record<KatorthomaProximity, string> = {
  reflexive: 'Your reasoning is reflexive',
  habitual: 'Your reasoning is habitual',
  deliberate: 'Your reasoning is deliberate',
  principled: 'Your reasoning is principled',
  sage_like: 'Your reasoning is sage-like',
}

// Proximity-keyed action-oriented closing — used as the closing line of
// philosophical_reflection in the residual case (no correct_judgements available
// to draw the closing orientation from). Per Revision 1 (2026-05-07):
// the closing sentence MUST be a concrete practice / actionable orientation,
// never a disclaimer or marginal-case sentence. These templates encode
// proximity-appropriate moves the practitioner can carry forward.
const PROXIMITY_RESIDUAL_CLOSING: Record<KatorthomaProximity, string> = {
  reflexive:
    'The work is to slow down at the moment of impression and bring deliberation in before assent.',
  habitual:
    'The work is to test what convention prescribes against the criterion of good and evil rather than accept it without examination.',
  deliberate:
    'The work is to deepen the examination toward principled stability — to hold the principle once it is named.',
  principled:
    'The work is to consolidate this stability across instances and remain attentive where it touches your own standing.',
  sage_like:
    'The work is to remain attentive — even where impression, assent, impulse, and action appear aligned.',
}

const VIRTUE_TRANSLATIONS: Record<VirtueDomain, string> = {
  phronesis: 'phronesis (practical wisdom)',
  dikaiosyne: 'dikaiosyne (justice)',
  andreia: 'andreia (courage)',
  sophrosyne: 'sophrosyne (temperance)',
}

const MECHANISM_LABELS: Record<string, string> = {
  passion_diagnosis: 'passion-diagnosis correction',
  control_filter: 'control-filter correction',
  oikeiosis: 'oikeiosis correction',
  value_assessment: 'value-assessment correction',
  kathekon_assessment: 'kathekon-assessment correction',
}

// Mechanism-keyed action-oriented closing — used as the closing line of
// improvement_guidance when improvement_path_structured is non-null. Per
// Revision 1 (2026-05-07): the previous closing line ("This is a {mechLabel}.")
// is the mechanism naming, not an actionable practice. Per Revision 1 the
// closing line MUST be the practitioner-facing move. The mechanism naming
// is now mid-prose; one of these closings closes the field.
const MECHANISM_ACTION_CLOSING: Record<string, string> = {
  passion_diagnosis:
    'Practise this when the impression arises: notice the passion, hold the impression at arm’s length, and substitute the corrected judgement before you assent.',
  control_filter:
    'Practise the control filter at the moment of choice: ask whether what you are about to act on lies within your prohairesis, and direct your attention to what does.',
  oikeiosis:
    'Carry the corrected oikeiosis framing into the next instance: notice what the circle owes and what it does not, and hold the obligation where it actually rests.',
  value_assessment:
    'Practise the value-assessment correction when the indifferent appears: name what it is — a preferred or dispreferred indifferent — and decline to treat it as more than that.',
  kathekon_assessment:
    'Test future actions against the kathekon criterion: is the reason for action in the agent (within prohairesis), or in convention or appearance?',
}

function joinVirtues(virtues: VirtueDomain[]): string {
  if (virtues.length === 0) return ''
  if (virtues.length === 1) return VIRTUE_TRANSLATIONS[virtues[0]]
  if (virtues.length === 2) {
    return `${VIRTUE_TRANSLATIONS[virtues[0]]} and ${VIRTUE_TRANSLATIONS[virtues[1]]}`
  }
  const all = virtues.map((v) => VIRTUE_TRANSLATIONS[v])
  return `${all.slice(0, -1).join(', ')}, and ${all[all.length - 1]}`
}

/**
 * Render the value-error observation per Revision 6 (2026-05-07).
 *
 * When `value_assessment.indifferents_at_stake` contains an entry with a
 * non-null `error`, surface the value error as a structural observation:
 * name the indifferent, name the agent's framing of it, and connect to the
 * principled finding (the indifferent is ranked by axia; the framing is what
 * produces the passion). The phrasing is keyed by `axia` (preferred vs
 * dispreferred — preferred maps to `axia: 'high' | 'moderate'`; dispreferred
 * maps to `axia: 'low'`) and `treated_as` ('good' | 'evil' | 'indifferent').
 *
 * Per Revision 4 (2026-05-07): "evil" is predicated of the false judgement /
 * the indifferent's mis-categorisation, NEVER of the practitioner's character.
 * The closing clause "that is where the false judgement sits, not in your
 * standing" makes this explicit.
 *
 * Returns an empty string when no value errors are present (the helper is
 * additive — caller composes alongside the principal-passion observation).
 */
function fallbackValueErrorSentence(assessment: Layer2Assessment): string {
  const errors = assessment.value_assessment.indifferents_at_stake.filter(
    (i) => i.error !== null
  )
  if (errors.length === 0) return ''
  const v = errors[0]
  const indifferentName = v.name.replace(/_/g, ' ')
  // axia 'low' → dispreferred; 'high' / 'moderate' → preferred. Matches the
  // PREFERRED_INDIFFERENTS / DISPREFERRED_INDIFFERENTS sets in
  // layer2-mechanisms.ts.
  const axiaClass = v.axia === 'low' ? 'dispreferred' : 'preferred'
  const treatedAsLabel =
    v.treated_as === 'good'
      ? 'a genuine good'
      : v.treated_as === 'evil'
        ? 'a genuine evil'
        : 'something more than indifferent'
  return (
    ` The indifferent ${indifferentName} is a ${axiaClass} indifferent by axia (worth/value), ` +
    `and treating it as ${treatedAsLabel} is where the false judgement sits, ` +
    `not in your standing.`
  )
}

/**
 * Build philosophical_reflection from assessment alone (no LLM).
 *
 * Composition (per ADR-007 §3 + Revisions 1, 4, 5, 6 of 2026-05-07):
 *   1. Principal observation — passion sentence (when passions present), peer-rendered
 *      with the value-error sentence (when value errors also present); value-error
 *      alone when no passions but value errors; proximity-keyed reflection sentence
 *      in the residual case.
 *   2. Brief virtue connection (when virtue_domains_engaged non-empty).
 *   3. Marginal-case sentences MID-PROSE (each independent — never closing):
 *      - EUPATHEIA_BOUNDARY when applicable
 *      - PRAXIS_MOTIVATION_AMBIGUITY when applicable
 *      - kathekon-null when applicable
 *      - single-snapshot when applicable
 *   4. Closing orientation — drawn from correct_judgements[0] (action-oriented
 *      reframing) when available; falls back to PROXIMITY_RESIDUAL_CLOSING.
 *
 * Closing-line discipline (Revision 1): the closing sentence is ALWAYS the
 * action-orientation. Marginal-case sentences NEVER close the field. This
 * differs from the M1-CP3 ordering, which placed marginal-case appends after
 * the closing sentence and so left disclaimers as the de-facto closing line.
 *
 * Input-condition heuristic note (Revision 5): the LLM applies an input-condition
 * heuristic to single-snapshot and kathekon-null disclaimers (omit when the
 * input has no temporal hooks / has not raised the question of appropriateness).
 * The fallback does NOT have access to the original input text — only the
 * assessment. The fallback therefore applies the marginal-case sentences
 * whenever the assessment field is marginal/null, and is conservative by design.
 * The placement (mid-prose, never closing) is preserved.
 */
function fallbackPhilosophicalReflection(assessment: Layer2Assessment): string {
  const passions = assessment.passion_diagnosis.passions_detected
  const valueErrorSentence = fallbackValueErrorSentence(assessment)
  const hasPassion = passions.length > 0
  const hasValueError = valueErrorSentence.length > 0

  // Sentence 1 — principal observation (opener).
  let openerSentence = ''
  if (hasPassion) {
    const p = passions[0]
    openerSentence =
      `The principal dynamic is ${p.root_passion}` +
      (p.sub_species ? ` (specifically ${p.sub_species})` : '') +
      `, lodged at the ${p.causal_stage_affected} stage.`
  } else if (hasValueError) {
    // Value error alone carries the principled finding. Use the helper sentence
    // (with leading space) trimmed to remove the leading space — it becomes the
    // opener rather than a peer.
    openerSentence = valueErrorSentence.trimStart()
  } else {
    // Residual case — proximity-keyed reflection sentence opens.
    openerSentence = PROXIMITY_REFLECTION[assessment.katorthoma_proximity]
  }

  // Sentence 1.5 — peer value-error observation (only when both passion AND
  // value error are present; the value-error sentence appended as a peer).
  const peerValueErrorSentence = hasPassion && hasValueError ? valueErrorSentence : ''

  // Sentence 2 — virtue connection (mid-prose).
  let virtueSentence = ''
  if (assessment.virtue_domains_engaged.length > 0) {
    virtueSentence = ` ${joinVirtues(assessment.virtue_domains_engaged)} ${
      assessment.virtue_domains_engaged.length === 1 ? 'is' : 'are'
    } engaged here.`
  }

  // Sentences 3+ — marginal-case sentences (mid-prose; each independent).
  // Per Revision 5 (Pattern B): discipline preserved, placement changed —
  // these sentences appear mid-prose, never as the closing line.
  let eupatheiaBoundarySentence = ''
  let praxisMotivationSentence = ''
  const openDeferrals = assessment.intake_clarifications.open_deferrals
  if (openDeferrals.some((d) => d.trigger_code === 'EUPATHEIA_BOUNDARY')) {
    eupatheiaBoundarySentence =
      ' The classification of this calm as genuine eupatheia versus polished surface over passion cannot be confirmed from this instance alone.'
  }
  if (openDeferrals.some((d) => d.trigger_code === 'PRAXIS_MOTIVATION_AMBIGUITY')) {
    praxisMotivationSentence =
      ' Whether this action arose from virtue or from convention cannot be determined from the current instance alone.'
  }

  let kathekonNullSentence = ''
  if (assessment.kathekon_assessment.is_kathekon === null) {
    kathekonNullSentence = " The action's appropriateness cannot be determined from the available evidence."
  }

  let singleSnapshotSentence = ''
  if (assessment.iterative_refinement.direction_of_travel === 'single_snapshot') {
    singleSnapshotSentence = ' This is a single snapshot; no trajectory data is available.'
  }

  // Final sentence — closing orientation (action-oriented per Revision 1).
  // Prefer correct_judgements[0] reframed as a "carry forward" / "the work is
  // to" orientation; fall back to PROXIMITY_RESIDUAL_CLOSING when the assessment
  // does not name a correct judgement. ruling_faculty_state is intentionally
  // NOT used here — its values are diagnostic descriptions ("Agitated...",
  // "Examining...") rather than action-orientations.
  let closingSentence: string
  if (assessment.passion_diagnosis.correct_judgements.length > 0) {
    const cj = assessment.passion_diagnosis.correct_judgements[0]
    const cjPunctuated = cj.endsWith('.') ? cj : `${cj}.`
    closingSentence = ` Carry this forward: ${cjPunctuated}`
  } else {
    closingSentence = ` ${PROXIMITY_RESIDUAL_CLOSING[assessment.katorthoma_proximity]}`
  }

  return `${openerSentence}${peerValueErrorSentence}${virtueSentence}${eupatheiaBoundarySentence}${praxisMotivationSentence}${kathekonNullSentence}${singleSnapshotSentence}${closingSentence}`.trim()
}

/**
 * Build improvement_guidance from assessment alone.
 *
 * Composition (per ADR-007 §3 + Revisions 1, 5 of 2026-05-07):
 *   - When improvement_path_structured non-null: name the false_judgement_to_correct
 *     (one sentence), the corrected_judgement (one sentence), the mechanism
 *     naming (one sentence). Disambiguation prompt mid-prose if applicable.
 *     CLOSING line is the mechanism-keyed action-orientation (per Revision 1) —
 *     a concrete practitioner-facing move the reader can carry forward. The
 *     mechanism naming is no longer the closing line.
 *   - When improvement_path_structured null: the no-improvement-path disclaimer
 *     sits MID-PROSE; the reflective prompt closes the field (per Revision 5 +
 *     Revision 1). The disclaimer never closes; the reflective prompt is
 *     action-oriented (a specific attention-direction).
 *   - Disambiguation prompt (when control_filter.disambiguation_required is
 *     non-empty): inserted MID-PROSE, before the closing line.
 */
function fallbackImprovementGuidance(assessment: Layer2Assessment): string {
  // Disambiguation prompt — composed first so we can place it mid-prose
  // before the closing line (per Revision 1 + Revision 5).
  const disambig = assessment.control_filter.disambiguation_required
  let disambigSentence = ''
  if (disambig.length > 0) {
    const items = disambig.slice(0, 2).map((d) => `"${d.item}"`)
    const tail = disambig.length > 2 ? ` (and others)` : ''
    const itemStr = items.length === 1 ? items[0] : `${items[0]} and ${items[1]}`
    disambigSentence =
      ` You did not specify a position on ${itemStr}${tail}; ` +
      `reflect on whether ${disambig.length === 1 ? 'it lies' : 'they lie'} within or outside your moral choice.`
  }

  if (assessment.improvement_path_structured !== null) {
    const ip = assessment.improvement_path_structured
    const mechLabel = MECHANISM_LABELS[ip.mechanism_applies] ?? `${ip.mechanism_applies} correction`
    const closingAction =
      MECHANISM_ACTION_CLOSING[ip.mechanism_applies] ??
      'Practise the correction at the moment of impression: notice the move, name what is going on, and substitute the corrected judgement before assenting.'
    // Sentences 1-3: false judgement, corrected judgement, mechanism naming.
    // Sentence 4 (when disambiguation): disambiguation prompt mid-prose.
    // Final sentence: action-oriented closing per Revision 1.
    return (
      `The false judgement to correct: "${ip.false_judgement_to_correct}". ` +
      `Replace it with: "${ip.corrected_judgement}". ` +
      `This is a ${mechLabel}.` +
      disambigSentence +
      ` ${closingAction}`
    )
  }

  // improvement_path_structured null — disclaimer sits mid-prose; reflective
  // prompt closes the field (per Revision 1 + Revision 5).
  const reflectiveClosing =
    assessment.oikeiosis.deliberation_notes && assessment.oikeiosis.deliberation_notes.trim().length > 0
      ? `Reflect on the oikeiosis context: ${assessment.oikeiosis.deliberation_notes}`
      : assessment.value_assessment.value_error
        ? `Reflect on the value pattern: ${assessment.value_assessment.value_error}`
        : 'Reflect on which judgements are within your prohairesis (moral choice / ruling faculty) and which are outside it; tend to the first, accept the second.'
  // Disclaimer mid-prose; disambig (if any) mid-prose; reflective closing last.
  return `No specific improvement path is identified at this time.${disambigSentence} ${reflectiveClosing}`.trim()
}

/**
 * Build summary from assessment alone.
 * Pattern: "{proximity_opener}, {primary_issue_phrase}."
 */
function fallbackSummary(assessment: Layer2Assessment): string {
  const proximityOpener = PROXIMITY_SUMMARY[assessment.katorthoma_proximity]

  // Primary issue selection: passion → oikeiosis → kathekon → control filter → generic
  const passions = assessment.passion_diagnosis.passions_detected
  if (passions.length > 0) {
    const p = passions[0]
    return `${proximityOpener}, with the principal dynamic ${p.root_passion} lodged at the ${p.causal_stage_affected} stage.`
  }

  // Find a circle with tension or unmet obligation
  const tenseCircle = assessment.oikeiosis.relevant_circles.find(
    (c) => c.tension !== null || c.obligation_met === false
  )
  if (tenseCircle) {
    return `${proximityOpener}, with the principal tension at the ${tenseCircle.circle} circle of oikeiosis.`
  }

  // Kathekon verdict
  if (assessment.kathekon_assessment.is_kathekon === true) {
    return `${proximityOpener}; the action's appropriateness is judged ${assessment.kathekon_assessment.quality}.`
  }
  if (assessment.kathekon_assessment.is_kathekon === false) {
    return `${proximityOpener}; the action is not appropriate by the kathekon assessment.`
  }
  if (assessment.kathekon_assessment.is_kathekon === null) {
    return `${proximityOpener}; the action's appropriateness cannot be determined from the available evidence.`
  }

  // Control filter fallthrough
  if (assessment.control_filter.disambiguation_required.length > 0) {
    return `${proximityOpener}, with several items requiring disambiguation between within and outside your moral choice.`
  }

  return `${proximityOpener}; no principal issue identified in the assessment.`
}

// Added 2026-05-06 (M1-CP4b) — d-a16 stem rendering for fallback prose
// per ADR-007 §6 amendment.
//
// The fallback's rendering is the canonical d-a16 stem text verbatim
// (the stem text is locked; only slot variables fill).

/** Render the soft_clarification_prose for the FIRST entry only. */
function fallbackSoftClarificationProse(assessment: Layer2Assessment): string | null {
  const entries = assessment.intake_clarifications.soft_clarifications
  if (entries.length === 0) return null
  const first = entries[0]
  if (first.trigger_code === 'STATED_OPERATIVE_CONFLICT') {
    const target = first.slot_fills.STATED_CIRCLE_TARGET ?? 'the situation'
    const situation = first.slot_fills.SITUATION ?? 'this situation'
    return (
      `You mentioned being concerned about ${target}. ` +
      `I want to check something with you — when you imagine ${situation} going badly, ` +
      `what's the thing you're most worried about for yourself?`
    )
  }
  // STATED_EQUANIMITY_UNVERIFIED — canonical stem (no slot-fills)
  return (
    'Has there been a recent time when something similar went the other way — ' +
    "when the outcome you hoped for didn't arrive — and you noticed how you actually felt, " +
    'not how you thought you should feel?'
  )
}

/** Render open_deferrals_prose for ALL entries, joined by single space. */
function fallbackOpenDeferralsProse(assessment: Layer2Assessment): string | null {
  const entries = assessment.intake_clarifications.open_deferrals
  if (entries.length === 0) return null
  const sentences: string[] = []
  for (const entry of entries) {
    if (entry.trigger_code === 'EUPATHEIA_BOUNDARY') {
      const shape = entry.slot_fills.EUPATHEIA_SHAPE ?? 'this eupatheia'
      const window = entry.slot_fills.TIME_WINDOW ?? 'recent days'
      const trigger = entry.slot_fills.SITUATIONAL_TRIGGER ?? 'this situation'
      const descr = entry.slot_fills.EUPATHEIA_DESCRIPTION ?? 'genuine eupatheia'
      const counterpart =
        entry.slot_fills.PASSION_COUNTERPART_DESCRIPTION ?? 'a passion-shaped counterpart'
      sentences.push(
        `You described responding with ${shape}. ` +
          `Across ${window}, when ${trigger} arose in this domain — was your inner state actually ${descr}, ` +
          `or was it more like ${counterpart}?`
      )
    } else if (entry.trigger_code === 'PRAXIS_MOTIVATION_AMBIGUITY') {
      const surface = entry.slot_fills.SURFACE_PATTERN ?? 'this action'
      const virtue = entry.slot_fills.VIRTUE_DESCRIPTION ?? 'virtue'
      const convention = entry.slot_fills.CONVENTION_DESCRIPTION ?? 'convention'
      sentences.push(
        `The engine cannot tell from the current instance alone whether ${surface} arose from ${virtue} ` +
          `or from ${convention}.`
      )
    }
  }
  return sentences.join(' ')
}

/**
 * Generate Layer3Prose from a Layer2Assessment using deterministic templates.
 * No LLM, no I/O, no module state. Idempotent: same assessment → byte-equal prose.
 *
 * Used by the route at M1-CP4 in the catch path when generateProse throws.
 * Per ADR-004 §9.3 — the user is never stranded by a Layer 3 failure.
 *
 * Per KG1: pure synchronous function; no fire-and-forget; no DB writes.
 */
export function generateFallbackProse(assessment: Layer2Assessment): Layer3Prose {
  if (!assessment || typeof assessment !== 'object') {
    throw new Layer3ValidationError(
      'shape',
      'generateFallbackProse: assessment is required',
      'assessment'
    )
  }

  return {
    version: 'layer3-prose-v1',
    layer2_assessment_version: 'layer2-assessment-v1',
    consumer: 'api_reason',
    philosophical_reflection: fallbackPhilosophicalReflection(assessment),
    improvement_guidance: fallbackImprovementGuidance(assessment),
    summary: fallbackSummary(assessment),
    // Added 2026-05-06 (M1-CP4b) — AC-13 / AC-14 fallback paths
    soft_clarification_prose: fallbackSoftClarificationProse(assessment),
    open_deferrals_prose: fallbackOpenDeferralsProse(assessment),
    source: 'fallback',
  }
}

// ============================================================================
// EXPORTS — for harness consumption
// ============================================================================

export { LAYER3_SYSTEM_PROMPT_API_REASON }
