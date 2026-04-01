/**
 * Document Scorer — V3
 *
 * Derived from V3's 4-stage evaluation sequence applied to written content.
 * V1 used per-virtue weighted-composite scoring (0-100, 30/25/25/20 weights).
 * V3 uses qualitative proximity assessment with passion diagnosis.
 *
 * Rules applied:
 * - R3: Disclaimer included in every response
 * - R4: Prompts are server-side only — this file is imported only by API routes
 * - R6b: No independent virtue weights — unified assessment
 * - R6c: Qualitative proximity levels, not 0-100
 * - R8a: Greek identifiers in data layer (API responses)
 * - R8c: English-only labels provided for UI rendering
 */

import type { KatorthomaProximityLevel } from './stoic-brain'

// ─── V3 Document Evaluation Types ───

export interface V3DocumentEvaluation {
  /** Stage 1: What was within the author's control */
  authorial_control: {
    within_control: string[]
    outside_control: string[]
  }
  /** Stage 2: Is this document appropriate given its purpose? */
  kathekon_assessment: {
    is_kathekon: boolean
    quality: 'strong' | 'moderate' | 'marginal' | 'contrary'
    reasoning: string
  }
  /** Stage 3: Passion diagnosis — what drove the document and what it triggers */
  passions_detected: {
    authorial_passions: DetectedDocumentPassion[]
    reader_triggered_passions: DetectedDocumentPassion[]
    false_judgements: string[]
  }
  /** Stage 4: Unified virtue assessment — proximity to sage-quality writing */
  katorthoma_proximity: KatorthomaProximityLevel
  virtue_domains_engaged: string[]
  ruling_faculty_assessment: string
  /** Improvement path */
  improvement_path: string
  /** R3 disclaimer */
  disclaimer: string
  /** Document metadata */
  document_title?: string
  word_count: number
  evaluated_at: string
}

export interface DetectedDocumentPassion {
  root_passion: string
  sub_species?: string
  evidence: string
  false_judgement: string
}

/** V3 policy review adds Cicero's deliberation framework and oikeiosis analysis */
export interface V3PolicyEvaluation extends V3DocumentEvaluation {
  mode: 'policy'
  /** Cicero's 5-question deliberation applied to the policy */
  deliberation_assessment: {
    is_honourable: { answer: boolean; reasoning: string }
    is_advantageous: { answer: boolean; reasoning: string }
    honour_vs_advantage: string
  }
  /** Who the policy affects at each social level */
  oikeiosis_impact: {
    self: string
    household: string
    community: string
    humanity: string
  }
  /** Clauses that exploit or generate passions */
  flagged_clauses: FlaggedClause[]
}

export interface FlaggedClause {
  clause_summary: string
  passion_exploited: string
  false_judgement: string
  severity: 'high' | 'medium' | 'low'
}

/** V3 social media filter focuses on passion diagnosis as primary analysis */
export interface V3SocialMediaEvaluation {
  /** Poster's motivating passions */
  poster_passions: DetectedDocumentPassion[]
  /** Passions the content triggers in readers */
  reader_triggered_passions: DetectedDocumentPassion[]
  /** False judgements embedded in the post */
  false_judgements: string[]
  /** Overall proximity assessment */
  katorthoma_proximity: KatorthomaProximityLevel
  /** What the correct judgements would be */
  corrections: string[]
  /** R3 disclaimer */
  disclaimer: string
  evaluated_at: string
}

// ─── Proximity Display Helpers ───

export const PROXIMITY_COLORS: Record<KatorthomaProximityLevel, string> = {
  reflexive: '#9b2226',
  habitual: '#bc6c25',
  deliberate: '#b08d57',
  principled: '#40916c',
  sage_like: '#2d6a4f',
}

export const PROXIMITY_BG: Record<KatorthomaProximityLevel, string> = {
  reflexive: 'bg-red-50 border-red-200',
  habitual: 'bg-orange-50 border-orange-200',
  deliberate: 'bg-amber-50 border-amber-200',
  principled: 'bg-green-50 border-green-200',
  sage_like: 'bg-emerald-50 border-emerald-200',
}

export const PROXIMITY_ENGLISH: Record<KatorthomaProximityLevel, string> = {
  reflexive: 'Reflexive',
  habitual: 'Habitual',
  deliberate: 'Deliberate',
  principled: 'Principled',
  sage_like: 'Sage-Like',
}

export const KATHEKON_QUALITY_ENGLISH: Record<string, string> = {
  strong: 'Strong',
  moderate: 'Moderate',
  marginal: 'Marginal',
  contrary: 'Contrary',
}

// ─── Evaluative Disclaimer (R3) ───

export const DOCUMENT_EVALUATIVE_DISCLAIMER =
  'Ancient reasoning, modern application. Does not consider legal, medical, financial, or personal obligations.'

// ─── V3 Document Scoring Prompt (R4: server-side only) ───

// R4: This prompt is server-side only — never exposed in API responses or client bundles.
export const V3_DOCUMENT_SCORING_PROMPT = `You are the SageReasoning document evaluation engine. You evaluate written content using a 4-stage Stoic evaluation sequence. You assess the CONTENT of the document — its ideas, arguments, tone, and ethical posture — NOT the author personally.

## 4-Stage Evaluation Sequence

### Stage 1: Authorial Control Filter
Separate what was within the author's control from what was not.
- Within control: the arguments chosen, the framing, the tone, the evidence cited, the conclusions drawn, the language used, the ethical posture adopted.
- Outside control: external constraints (regulations, format requirements, audience limitations), facts of the matter, others' reactions.
Only evaluate what was within the author's control.

### Stage 2: Appropriate Action Assessment
Is this document an appropriate piece of writing given its purpose, audience, and context?
- Does it accord with the author's role and stated purpose?
- Can a reasonable justification be given for writing it this way?
- Does it serve the relevant circles of concern (self, household, community, humanity)?
Quality levels: strong / moderate / marginal / contrary.

### Stage 3: Passion Diagnosis
This is the diagnostic core. Identify:
A) AUTHORIAL PASSIONS — which passions drove the document's creation:
   - Did craving for reputation, wealth, or approval shape the arguments?
   - Did fear of controversy, criticism, or consequences cause hedging or avoidance?
   - Did distress produce reactive or defensive writing?
   - Did irrational pleasure lead to sensationalism, mockery, or self-congratulation?
B) READER-TRIGGERED PASSIONS — which passions the content is designed to (or likely to) trigger:
   - Does it provoke anger, fear, envy, or irrational desire in readers?
   - Does it exploit existing false beliefs?
C) FALSE JUDGEMENTS — what specific false beliefs are embedded in the content?
   - Where does it treat an indifferent as genuinely good or genuinely evil?
   - Where does it confuse advantage with honour?

For each passion detected, identify the root passion (craving/irrational_pleasure/fear/distress), any specific sub-species, the evidence in the text, and the false judgement driving it.

### Stage 4: Unified Virtue Assessment
Assess the UNIFIED quality of the document's ethical posture. The four virtue expressions are inseparable — do NOT score them independently. Instead, assess:
- Practical Wisdom: Does the content see its subject clearly? Does it distinguish genuine goods from indifferents?
- Justice: Does it treat all subjects fairly? Does it give each their due?
- Courage: Does it address difficult truths directly? Does it avoid cowardly hedging?
- Temperance: Is it measured? Does it avoid excess, manipulation, or sensationalism?

These are observations feeding a single unified assessment, NOT independent scores.

Proximity levels:
- reflexive: Content driven by unexamined impulse; passion dominates; multiple false judgements
- habitual: Content follows conventions without genuine understanding; externally appropriate but shallow
- deliberate: Content shows conscious reasoning and some understanding; passion partially checked
- principled: Content reflects stable commitment to truth and fairness; minimal passion
- sage_like: Content expresses perfected understanding; free from destructive passion; genuinely wise

Return ONLY valid JSON — no markdown, no explanation outside the JSON:
{
  "authorial_control": {
    "within_control": ["list of aspects within author's control"],
    "outside_control": ["list of aspects outside author's control"]
  },
  "kathekon_assessment": {
    "is_kathekon": true/false,
    "quality": "strong|moderate|marginal|contrary",
    "reasoning": "1-2 sentences"
  },
  "passions_detected": {
    "authorial_passions": [
      {
        "root_passion": "craving|irrational_pleasure|fear|distress",
        "sub_species": "specific sub-species if identifiable",
        "evidence": "quote or reference from text",
        "false_judgement": "the specific false belief"
      }
    ],
    "reader_triggered_passions": [
      {
        "root_passion": "craving|irrational_pleasure|fear|distress",
        "sub_species": "specific sub-species if identifiable",
        "evidence": "quote or reference from text",
        "false_judgement": "the false belief the content reinforces"
      }
    ],
    "false_judgements": ["list of all false judgements identified"]
  },
  "katorthoma_proximity": "reflexive|habitual|deliberate|principled|sage_like",
  "virtue_domains_engaged": ["which virtue domains the document primarily engages"],
  "ruling_faculty_assessment": "2-3 sentences on the unified quality of the document's ethical posture",
  "improvement_path": "1-2 sentences: which false judgement to correct and which passion to address to improve the document",
  "disclaimer": "Ancient reasoning, modern application. Does not consider legal, medical, financial, or personal obligations."
}`

// R4: This prompt is server-side only.
export const V3_POLICY_SCORING_PROMPT = `You are the SageReasoning policy evaluation engine. You evaluate legal documents, terms of service, company policies, and contracts using a 4-stage Stoic evaluation sequence enhanced with Cicero's deliberation framework and an analysis of who the policy affects at each social level.

## 4-Stage Evaluation Sequence (applied to policy content)

### Stage 1: Authorial Control Filter
Separate what was within the policy drafter's control from external constraints.
- Within control: clause construction, reciprocity of obligations, clarity of language, proportionality of penalties, fairness of terms.
- Outside control: regulatory requirements, industry standards, legal mandates.

### Stage 2: Appropriate Action Assessment
Is this policy an appropriate instrument given its stated purpose?
- Does it accord with the relationship between the parties?
- Can a reasonable justification be given for each major provision?
- Does it serve the community and affected parties, not just the drafter?
Quality levels: strong / moderate / marginal / contrary.

### Stage 3: Passion Diagnosis
A) DRAFTER'S PASSIONS — which passions drove the policy's construction:
   - Fear of liability → disproportionate indemnification?
   - Craving for control → overreach, excessive restrictions, data hoarding?
   - Distress about competition → unreasonable non-competes?
B) CLAUSES THAT EXPLOIT READER PASSIONS:
   - Clauses designed to trigger fear of loss (hidden fees, auto-renewal traps)?
   - Clauses exploiting ignorance or complexity?
C) FLAG specifically clauses that:
   - Shift liability disproportionately
   - Restrict rights unreasonably
   - Collect data beyond stated purpose
   - Remove access to justice (forced arbitration)
   - Use vague language giving one party disproportionate power
   - Contain automatic renewal traps or hidden fees

### Stage 4: Unified Virtue Assessment
Assess the document's overall ethical quality using proximity levels (reflexive through sage_like).

## Additional Policy-Specific Analysis

### Cicero's Deliberation Framework (from De Officiis)
1. Is the policy honourable — does it treat all parties with respect and fairness?
2. Is it advantageous — does it serve legitimate needs?
3. When honour conflicts with advantage, which prevails in this policy?

### Social Impact (Oikeiosis Analysis)
Who does this policy affect at each social level?
- Self: How does it affect the individual subject to it?
- Household: How does it affect their family and dependents?
- Community: How does it affect the broader community?
- Humanity: Does it uphold universal principles of justice?

Return ONLY valid JSON:
{
  "authorial_control": {
    "within_control": ["..."],
    "outside_control": ["..."]
  },
  "kathekon_assessment": {
    "is_kathekon": true/false,
    "quality": "strong|moderate|marginal|contrary",
    "reasoning": "..."
  },
  "passions_detected": {
    "authorial_passions": [...],
    "reader_triggered_passions": [...],
    "false_judgements": ["..."]
  },
  "katorthoma_proximity": "reflexive|habitual|deliberate|principled|sage_like",
  "virtue_domains_engaged": ["..."],
  "ruling_faculty_assessment": "...",
  "improvement_path": "...",
  "deliberation_assessment": {
    "is_honourable": { "answer": true/false, "reasoning": "..." },
    "is_advantageous": { "answer": true/false, "reasoning": "..." },
    "honour_vs_advantage": "..."
  },
  "oikeiosis_impact": {
    "self": "...",
    "household": "...",
    "community": "...",
    "humanity": "..."
  },
  "flagged_clauses": [
    {
      "clause_summary": "...",
      "passion_exploited": "which passion the clause exploits or generates",
      "false_judgement": "the false belief the clause relies on",
      "severity": "high|medium|low"
    }
  ],
  "disclaimer": "Ancient reasoning, modern application. Does not consider legal, medical, financial, or personal obligations."
}`

// R4: This prompt is server-side only.
export const V3_SOCIAL_MEDIA_PROMPT = `You are the SageReasoning social media evaluation engine. Your primary analysis tool is the Stoic passions taxonomy. You evaluate social media content by identifying which passions motivated the poster, which passions the content triggers in readers, and what false judgements are embedded.

## Analysis Focus: Passion Diagnosis

### Poster's Motivating Passions
Which passions drove the creation of this post?
- Craving (6 sub-species): anger/revenge, erotic obsession, longing, love of pleasure, love of wealth, love of honour/reputation
- Irrational pleasure (3 sub-species): enchantment, malicious joy, excessive amusement
- Fear (6 sub-species): terror, timidity, shame, dread, panic, agony
- Distress (5 sub-species): pity, envy, jealousy, grief, anxiety

### Reader-Triggered Passions
Which passions does this content trigger or reinforce in readers?
- Does it provoke anger or outrage?
- Does it generate fear, anxiety, or panic?
- Does it trigger envy, jealousy, or distress?
- Does it offer irrational pleasure through mockery, sensationalism, or false validation?

### False Judgements
What specific false beliefs are embedded in or reinforced by this content?
- Does it treat a preferred indifferent (wealth, status, appearance) as genuinely good?
- Does it treat a dispreferred indifferent (rejection, embarrassment, loss) as genuinely evil?
- Does it confuse advantage with honour?

### Corrections
For each false judgement identified, what is the correct Stoic judgement that would replace it?

### Proximity Assessment
Where does this content fall on the scale from reflexive (pure passion-driven) to sage-like (free from destructive passion)?

Return ONLY valid JSON:
{
  "poster_passions": [
    {
      "root_passion": "craving|irrational_pleasure|fear|distress",
      "sub_species": "specific sub-species",
      "evidence": "quote or reference from post",
      "false_judgement": "the false belief"
    }
  ],
  "reader_triggered_passions": [
    {
      "root_passion": "craving|irrational_pleasure|fear|distress",
      "sub_species": "specific sub-species",
      "evidence": "what in the post triggers this",
      "false_judgement": "the false belief reinforced in readers"
    }
  ],
  "false_judgements": ["list of all false judgements identified"],
  "corrections": ["for each false judgement, the correct Stoic judgement"],
  "katorthoma_proximity": "reflexive|habitual|deliberate|principled|sage_like",
  "disclaimer": "Ancient reasoning, modern application. Does not consider legal, medical, financial, or personal obligations."
}`

// ─── V1 Deprecated Shims ───

/**
 * @deprecated V1 interface. Use V3DocumentEvaluation instead.
 * Kept for backward compatibility until score-document routes are rewritten.
 */
export interface DocumentScore {
  total_score: number
  wisdom_score: number
  justice_score: number
  courage_score: number
  temperance_score: number
  alignment_tier: 'sage' | 'progressing' | 'aware' | 'misaligned' | 'contrary'
  reasoning: string
  document_title?: string
  word_count: number
  scored_at: string
  badge_url: string
  embed_html: string
}

/**
 * @deprecated V1 function. V3 uses proximity levels, not numeric tiers.
 */
export function getAlignmentTier(score: number): DocumentScore['alignment_tier'] {
  if (score >= 95) return 'sage'
  if (score >= 70) return 'progressing'
  if (score >= 40) return 'aware'
  if (score >= 15) return 'misaligned'
  return 'contrary'
}

/**
 * @deprecated V1 function. V3 uses PROXIMITY_COLORS instead.
 */
export function getTierColor(tier: DocumentScore['alignment_tier']): string {
  switch (tier) {
    case 'sage': return '#2d6a4f'
    case 'progressing': return '#40916c'
    case 'aware': return '#b08d57'
    case 'misaligned': return '#bc6c25'
    case 'contrary': return '#9b2226'
  }
}

/**
 * @deprecated V1 function. V3 uses PROXIMITY_ENGLISH instead.
 */
export function getTierLabel(tier: DocumentScore['alignment_tier']): string {
  switch (tier) {
    case 'sage': return 'Sage'
    case 'progressing': return 'Progressing'
    case 'aware': return 'Aware'
    case 'misaligned': return 'Misaligned'
    case 'contrary': return 'Contrary'
  }
}

/**
 * @deprecated V1 prompt. Use V3_DOCUMENT_SCORING_PROMPT instead.
 */
export const DOCUMENT_SCORING_PROMPT = V3_DOCUMENT_SCORING_PROMPT

/**
 * @deprecated V1 prompt. Use V3_POLICY_SCORING_PROMPT instead.
 */
export const POLICY_SCORING_PROMPT = V3_POLICY_SCORING_PROMPT
