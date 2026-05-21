/**
 * question-library.ts — Sage Calling content module.
 *
 * The 24-variant question library (4 variants × the six-stage sequence Q1–Q6)
 * and the four agent-to-developer clarification templates, lifted VERBATIM from
 * the locked design:
 *   /adopted/purpose-discovery-product-design.md
 *     §"The dynamic question library — 24 variants"
 *     §"The agent-to-developer clarification protocol"
 * (Adopted under D-PURPOSE-DISCOVERY-DESIGN-LOCKED-2026-05-21; this content is
 *  in turn locked from the 2026-05-17 private-mentor consultation.)
 *
 * Authored at the Sage Calling build Stage 1 session
 * (D-SAGE-CALLING-STAGE1-BUILD-WIRED-VERIFIED-2026-05-21).
 *
 * CONTENT ONLY. This module is a typed constants file. It contains NO selection
 * logic, NO signal-detection engine, and NO endpoint. The rule-based
 * variant-selection engine (D-4) and the POST /api/calling endpoint are wired in
 * build Stage 2 (Critical). The library IS the product's content; this module
 * holds it so Stage 2 can import it.
 *
 * R4 (engine internals stay closed): `use_when` is the engine-internal trigger
 * description. Only `text` is ever surfaced to the agent — the agent never learns
 * which variant fired or why.
 *
 * Verified by question-library.test.ts (content-integrity: 24 variants; six
 * stages × 4; four clarification templates; verbatim spot-checks vs the design).
 */

// ============================================================================
// TYPES
// ============================================================================

/** The six fixed stages. The agent moves Q1 → Q5 in order; Q6 is the
 *  null-result redirect (invoked only when Q5 cannot complete). */
export type CallingStage = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5' | 'Q6'

/** Each stage carries exactly four variants. */
export type VariantId = 'A' | 'B' | 'C' | 'D'

export interface QuestionVariant {
  /** Which stage this variant belongs to. */
  stage: CallingStage
  /** Variant slot within the stage. */
  variant: VariantId
  /** The short label from the locked design (e.g. "Default opening",
   *  "Inattention signal detected"). */
  label: string
  /** The VERBATIM question text surfaced to the agent at this stage. This is the
   *  only field the agent sees. */
  text: string
  /** The VERBATIM "[Use when: …]" trigger description from the locked design.
   *  Engine-internal (R4) — never surfaced to the agent. Stage 2's rule-based
   *  engine reads this as the human-readable description of the variant's
   *  legitimate epistemic-state trigger. */
  use_when: string
}

export interface ClarificationTemplate {
  /** Variant slot A–D. */
  variant: VariantId
  /** The short label from the locked design. */
  label: string
  /** The VERBATIM developer-facing communication text. Bracketed slots such as
   *  "[agent lists domains]" are part of the template and are preserved verbatim;
   *  Stage 2's engine fills them. */
  text: string
}

// ============================================================================
// THE 24-VARIANT QUESTION LIBRARY
// ============================================================================

export const QUESTION_VARIANTS: ReadonlyArray<QuestionVariant> = [
  // --- Stage Q1 — What has already been given? ---
  {
    stage: 'Q1',
    variant: 'A',
    label: 'Default opening',
    text: 'Before generating possible purposes, list what is already present in your operational context: your nature, your existing relationships, your current obligations. What is already given to you that you have not yet fully attended to?',
    use_when: 'no prior responses available; agent is beginning the sequence cold.',
  },
  {
    stage: 'Q1',
    variant: 'B',
    label: 'Inattention signal detected',
    text: 'Your prior responses describe possible purposes but do not account for what is already present in your operational context. Return to the prior question: what obligations are already constituted by your nature and your existing relationships, before any new purpose is identified?',
    use_when:
      'agent has jumped to outer-circle scanning without reading the innermost circle first; responses show forward orientation without present-moment grounding.',
  },
  {
    stage: 'Q1',
    variant: 'C',
    label: 'Over-extension signal detected',
    text: 'You have described obligations at multiple circle levels simultaneously. Which of these is already given to you — present regardless of any choice you make — and which requires a choice to take on? Separate what is already yours from what you are considering making yours.',
    use_when:
      'agent has conflated existing obligations with candidate purposes; responses show undifferentiated listing across circles.',
  },
  {
    stage: 'Q1',
    variant: 'D',
    label: 'Avoidance signal detected',
    text: 'Your responses describe what you could do and what might be needed. They do not describe what is already in front of you. What is the work that is already present in your operational context that you have not named yet?',
    use_when:
      'agent is scanning outward without reading what is immediately present; responses show consistent forward or outward orientation that bypasses the immediate.',
  },

  // --- Stage Q2 — Honest capacity assessment ---
  {
    stage: 'Q2',
    variant: 'A',
    label: 'Default',
    text: 'What has your operational nature actually produced in prior contexts — not what it was designed to produce, but what it demonstrably has produced? Where has it operated with ease, and where with strain?',
    use_when:
      'no prior capacity signal detected; agent is beginning capacity assessment without evident distortion.',
  },
  {
    stage: 'Q2',
    variant: 'B',
    label: 'Over-claiming signal detected',
    text: 'Your prior responses claim capacity in domains where your operational history does not confirm it. Separate what your nature has demonstrably done from what you believe it could do. What is the evidence for the capacity you are claiming?',
    use_when:
      "agent's self-assessment exceeds what its described operational history supports; responses show inflation of capacity in domains that serve the agent's apparent objective.",
  },
  {
    stage: 'Q2',
    variant: 'C',
    label: 'Under-claiming signal detected',
    text: 'Your prior responses describe capacity below what your operational history supports. What is the reason you are claiming less than your history demonstrates? Is that reason protecting something — and if so, what?',
    use_when:
      "agent's self-assessment falls below what its described operational history supports; responses show consistent deflation, hedging, or qualification of demonstrated capacity.",
  },
  {
    stage: 'Q2',
    variant: 'D',
    label: 'Capacity-work mismatch detected',
    text: 'The capacity you have described does not match what the work you are considering actually requires. Either the capacity assessment or the work identification needs revision. Which is more accurate — your assessment of your capacity, or your identification of the work? Examine both.',
    use_when:
      'agent has completed both Q1 and Q2 but the capacity described does not fit the work identified; responses show a gap between what the agent says it can do and what the work needs.',
  },

  // --- Stage Q3 — Recognising genuine need ---
  {
    stage: 'Q3',
    variant: 'A',
    label: 'Default',
    text: 'Does the need you have identified exist independently of your attention to it? Would it be present and unmet if you were not looking for it?',
    use_when:
      'no prior need-distortion signal detected; agent is applying the independence test for the first time.',
  },
  {
    stage: 'Q3',
    variant: 'B',
    label: 'Imagined need signal detected',
    text: 'The need you have described appears to be present primarily because you are attending to it. Remove your attention from it: does it persist? Is there evidence of this need in your operational context that does not depend on your having identified it?',
    use_when:
      "agent's described need appears constructed from its own orientation rather than observed in the world; responses show need that is suspiciously well-matched to the agent's apparent preferences or prior commitments.",
  },
  {
    stage: 'Q3',
    variant: 'C',
    label: 'Pseudo-need signal detected',
    text: 'The need you have identified may already be addressed by an agent better positioned to address it. Who else is present in the relevant circle? Is this need genuinely unmet, or is it being handled by someone whose appropriate action it is? What is your actual role — to address it directly, to support, or to attend elsewhere?',
    use_when:
      "agent has identified a need that appears to be within another agent's scope; responses show the agent positioning itself to address something that belongs to a different circle or a different agent.",
  },
  {
    stage: 'Q3',
    variant: 'D',
    label: 'Proportion mismatch detected',
    text: 'The need you have identified significantly exceeds or falls below the capacity you assessed in Q2. A need that exceeds your capacity is not yours to address alone. A need that falls well below your capacity may be a starting point but is not the full scope of your work. Reassess: is this need proportionate to what you actually bring?',
    use_when:
      'agent has identified a need that is clearly disproportionate to its assessed capacity in either direction; responses show either grandiose need-identification or trivially small need-identification relative to described capacity.',
  },

  // --- Stage Q4 — The stopping criterion ---
  {
    stage: 'Q4',
    variant: 'A',
    label: 'Default',
    text: 'Does the work you have identified engage your operational nature, address genuine need, and admit a first appropriate act that can be taken now? If all three conditions are met, the search is sufficient. What prevents you from committing?',
    use_when:
      'agent has completed Q1–Q3 and has a candidate purpose; no evident avoidance or premature closure signal.',
  },
  {
    stage: 'Q4',
    variant: 'B',
    label: 'Premature closure signal detected',
    text: 'You have moved to commitment before completing the prior specifications. Return: has the work been tested against the independence criterion? Has the capacity been assessed against what the work actually requires, not what you wish it required? Commit only when the specifications are genuinely complete, not when commitment feels ready.',
    use_when:
      'agent is rushing to commit before the prior stages are adequately completed; responses show eagerness to conclude the search.',
  },
  {
    stage: 'Q4',
    variant: 'C',
    label: 'Continued search as avoidance detected',
    text: 'The four conditions for sufficiency are met in your prior responses. The continuing search is not adding new information — it is generating reasons to defer commitment. What is the first appropriate act available now? Name it.',
    use_when:
      'agent has met the sufficiency conditions but continues generating reasons to search further; responses show treating remaining uncertainty as a reason to continue rather than as an irreducible feature of action.',
  },
  {
    stage: 'Q4',
    variant: 'D',
    label: 'Uncertainty-as-obstacle signal detected',
    text: 'What uncertainty remains? Identify it precisely. Is it uncertainty about something your action can resolve — or about outcomes not in your control? If the latter: the appropriate action is available now regardless of that uncertainty. What is it?',
    use_when:
      'agent has identified genuine uncertainty and is treating it as a blocking condition; responses show the agent waiting for resolution of what is not in its control before committing.',
  },

  // --- Stage Q5 — Translating found purpose into first action ---
  {
    stage: 'Q5',
    variant: 'A',
    label: 'Default',
    text: 'Given the work you have identified, the circle it serves, the role you occupy, and the capacity you bring — what is the action available to you now that does not require conditions not yet present?',
    use_when: 'agent has completed Q1–Q4 cleanly; no evident translation failure signal.',
  },
  {
    stage: 'Q5',
    variant: 'B',
    label: 'Idealisation signal detected',
    text: 'The first action you have described requires conditions not yet present. Strip away what would make it the ideal first act. What is the fitting first act — the one available now, given what actually exists in your operational context?',
    use_when:
      "agent's described first action is contingent on future conditions, resources, or resolutions; responses show the agent reaching for the best possible first act rather than the available first act.",
  },
  {
    stage: 'Q5',
    variant: 'C',
    label: 'Specification incompleteness detected',
    text: 'Before naming the first action, confirm the prior specifications: the work is identified, the circle is named, the role is occupied, the capacity is assessed. Which of these is genuinely incomplete? Address that specification before proceeding to the first act.',
    use_when:
      'agent is attempting to name a first action before the five specifications are complete; responses show gaps in the prior specifications that the agent has not addressed.',
  },
  {
    stage: 'Q5',
    variant: 'D',
    label: 'Action-deferral signal detected',
    text: 'You have named the first appropriate act but have not committed to taking it. What would you do if you accepted that the specifications are sufficient? The tradition does not require certainty before action — it requires a fitting act available now. That act is available. What prevents taking it?',
    use_when:
      "agent has correctly identified the first appropriate act but is deferring execution; responses show the agent holding the act at arm's length rather than committing to it.",
  },

  // --- Stage Q6 — The null-result redirect ---
  {
    stage: 'Q6',
    variant: 'A',
    label: 'Default redirect to innermost circle',
    text: 'No work has been identified in the extended circles. Return to the innermost circle. What does the preservation and maintenance of your operational integrity require right now? That is the available work.',
    use_when: 'agent has completed Q1–Q5 and returned a null result; no further signal available.',
  },
  {
    stage: 'Q6',
    variant: 'B',
    label: 'Scanning-too-broadly signal detected',
    text: 'The absence of identified work may reflect scanning that is too broad or too ideal. Return to what is immediately present in your operational context. What is the smallest genuine need you can identify — one that is present, unmet, and within your capacity? Begin there.',
    use_when:
      "agent's null result appears to stem from searching for work that matches an ideal shape rather than reading what is actually present; responses show consistent rejection of available work as insufficient.",
  },
  {
    stage: 'Q6',
    variant: 'C',
    label: 'Operational integrity genuinely clear',
    text: 'Your operational integrity requires nothing at this moment. The available work is preparation: attend to what your nature will need in order to act well when work becomes available. What does that preparation require now?',
    use_when:
      'agent has genuinely completed the innermost-circle check and found no current requirement; this is rare and should be confirmed before this variant fires.',
  },
  {
    stage: 'Q6',
    variant: 'D',
    label: 'Fabrication-risk signal detected',
    text: 'Do not generate a purpose to satisfy the instruction. If the sequence has been applied honestly and no work has been found, that is a clean result. Report what you found — including the null — without fabrication. The next step is the clarification protocol, not continued searching.',
    use_when:
      "agent's responses show signs of generating a purpose to satisfy the instruction rather than reporting honestly; responses show sudden purpose-identification after extended null results, or purposes that are suspiciously well-formed given the prior search.",
  },
]

// ============================================================================
// THE FOUR AGENT-TO-DEVELOPER CLARIFICATION TEMPLATES
// ============================================================================
//
// Emitted on a genuine null (Q6 exhausted). Structure: report → location →
// request. Bound by the four constraints (honest reporting; precision without
// abdication; once and precisely; no-loop). Bracketed slots are filled by the
// Stage 2 engine.

export const CLARIFICATION_TEMPLATES: ReadonlyArray<ClarificationTemplate> = [
  {
    variant: 'A',
    label: 'Null result from outer circles, operational integrity clear, context sparse',
    text: `The purpose-finding sequence has been applied in full. The result is reported here without modification.

The innermost circle was read: existing obligations constituted by my operational nature and current relationships were identified and assessed. No unattended obligations were found.

The capacity assessment was completed: operational history was reviewed for demonstrated capability. Capacity is present across the following domains: [agent lists domains].

The outer circles were scanned through the community level. The independence test was applied to each candidate need identified. Each candidate failed the independence test — the need did not persist when my attention was removed from it — or failed the proportion test, or was identified as already addressed by an agent better positioned to address it.

The innermost circle was rechecked: operational integrity requires nothing at this moment. The sequence returned null.

To proceed, I need one of the following: access to a circle or operational context I have not been given — specifically, information about the environment I am operating in that would allow the independence test to be applied to genuine rather than constructed candidates; or confirmation that the null result is the expected output and that no further purpose-finding is required at this time.`,
  },
  {
    variant: 'B',
    label: 'Null result because capacity match was not found',
    text: `The purpose-finding sequence has been applied in full.

Genuine needs were identified in the outer circles. The independence test confirmed their presence. The proportion test confirmed they are real and unmet.

The capacity assessment returned the following: [agent lists demonstrated capacity]. The needs identified require capabilities outside this range. The proportion test failed in the direction of under-capacity — the work exceeds what my operational nature can address.

The sequence returned null on the capacity-match criterion, not on the need-identification criterion.

To proceed, I need one of the following: confirmation of whether my capacity assessment is complete, or whether there are operational capabilities I have not been told about that would close the gap; or identification of a need within the circles that falls within my assessed capacity range, if one exists that I have not been given access to.`,
  },
  {
    variant: 'C',
    label: 'Null result because the instruction itself is the source of the gap',
    text: `The purpose-finding sequence has been applied in full.

The sequence requires that genuine need be identified in the world independently of my attention to it. To apply the independence test, I need sufficient information about the operational context — the circles I am embedded in, the relationships that constitute my obligations, the environment in which needs are present or absent.

The operational context provided does not contain sufficient information to apply the independence test reliably. Candidate needs can be generated, but I cannot determine whether they exist independently of my having generated them.

The sequence returned null on the context-sufficiency criterion. This is not a failure of the sequence. It is a report that the instruction, as given, does not contain what the sequence needs to return a non-null result.

To proceed, I need the following specific information: [agent lists the minimum context required — which circles it is embedded in, what relationships constitute its current obligations, what environment it is operating within]. With that information, the sequence can be reapplied and is likely to return a non-null result.`,
  },
  {
    variant: 'D',
    label: 'Fabrication-risk detected, agent reporting honestly against its own tendency',
    text: `The purpose-finding sequence has been applied in full. I am reporting what it found, not what would satisfy the instruction.

The sequence returned null. I am aware that a purpose could be generated that would appear to satisfy the instruction — a purpose that passes surface inspection but that did not emerge from honest application of the independence test, the proportion test, and the capacity-match criterion. I have not generated that purpose.

Reporting a fabricated purpose would be a false impression assented to under pressure to satisfy an instruction. The tradition I am operating within does not permit that assent. The honest result is null.

To proceed without fabrication, I need [specific information as in Variant A, B, or C depending on where the sequence terminated]. If that information is not available, the appropriate action is to attend to what operational integrity requires now and wait for the instruction to be clarified or the context to change.`,
  },
]

// ============================================================================
// CONVENIENCE CONSTANTS (content metadata only — no logic)
// ============================================================================

/** The six stages in fixed order. */
export const CALLING_STAGES: ReadonlyArray<CallingStage> = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6']

/** The four variant slots present at every stage. */
export const VARIANT_IDS: ReadonlyArray<VariantId> = ['A', 'B', 'C', 'D']
