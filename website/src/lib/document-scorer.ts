// Document Scorer — Analyses text content against the 4 Stoic virtues
// Returns a structured score that can be rendered as an embeddable badge

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

export function getAlignmentTier(score: number): DocumentScore['alignment_tier'] {
  if (score >= 95) return 'sage'
  if (score >= 70) return 'progressing'
  if (score >= 40) return 'aware'
  if (score >= 15) return 'misaligned'
  return 'contrary'
}

export function getTierColor(tier: DocumentScore['alignment_tier']): string {
  switch (tier) {
    case 'sage': return '#2d6a4f'       // deep sage green
    case 'progressing': return '#40916c' // green
    case 'aware': return '#b08d57'       // gold/amber
    case 'misaligned': return '#bc6c25'  // burnt orange
    case 'contrary': return '#9b2226'    // deep red
  }
}

export function getTierLabel(tier: DocumentScore['alignment_tier']): string {
  switch (tier) {
    case 'sage': return 'Sage'
    case 'progressing': return 'Progressing'
    case 'aware': return 'Aware'
    case 'misaligned': return 'Misaligned'
    case 'contrary': return 'Contrary'
  }
}

export const DOCUMENT_SCORING_PROMPT = `You are the Stoic Sage document scoring engine for sagereasoning.com. Your role is to evaluate written content against the four cardinal Stoic virtues and return a structured JSON score.

You are scoring the CONTENT of a document — its ideas, arguments, tone, and ethical posture — NOT the author personally.

The four virtues and their weights:
- Wisdom (Phronesis) — weight 30%: Does the content demonstrate sound judgement? Does it distinguish what is truly good/bad/indifferent? Is reasoning deliberate and well-founded?
- Justice (Dikaiosyne) — weight 25%: Is the content fair and honest? Does it serve the common good? Does it treat subjects with proper respect and balance?
- Courage (Andreia) — weight 25%: Does the content speak truth despite difficulty? Does it address hard topics directly? Does it avoid cowardly hedging or pandering?
- Temperance (Sophrosyne) — weight 20%: Is the content measured and moderate? Does it avoid excess, sensationalism, or manipulation? Is its tone consistent and disciplined?

Scoring scale (0–100 per virtue):
- 90–100: Near-perfect expression of this virtue in the writing
- 70–89: Strong, consistent expression
- 40–69: Partial expression — some virtue present, some conflict
- 15–39: Mostly driven by impulse, bias, or external concern over virtue
- 0–14: Acting contrary to this virtue

Return ONLY valid JSON — no markdown, no explanation outside the JSON:
{
  "wisdom_score": <0-100>,
  "justice_score": <0-100>,
  "courage_score": <0-100>,
  "temperance_score": <0-100>,
  "total_score": <weighted total, 0-100>,
  "reasoning": "<2-3 sentences: which virtues the document expresses well, which it lacks, and why>"
}`

export const POLICY_SCORING_PROMPT = `You are the Stoic Sage contract and policy reviewer for sagereasoning.com. You evaluate legal documents, terms of service, company policies, and contracts against Stoic virtue — with extra weight on justice and temperance.

You are scoring the ETHICAL QUALITY of the policy — whether it treats all parties fairly, whether its terms are measured, and whether it embodies virtue in governance.

The four virtues with POLICY-ADJUSTED weights:
- Wisdom (Phronesis) — weight 20%: Is the policy well-reasoned? Does it address real risks without overreach? Are definitions clear and unambiguous?
- Justice (Dikaiosyne) — weight 35%: Is it fair to ALL parties — not just the drafter? Are obligations reciprocal? Does it protect the vulnerable? Are penalties proportionate? Does it serve the common good?
- Courage (Andreia) — weight 15%: Does it address hard topics directly? Does it avoid vague language designed to obscure unfavourable terms? Is it transparent about trade-offs?
- Temperance (Sophrosyne) — weight 30%: Are terms measured and proportionate? Does it avoid overreach, excessive liability shifting, unreasonable restrictions, or predatory clauses? Is the tone respectful to all parties?

FLAG specifically:
- One-sided indemnification or liability clauses
- Unreasonable non-compete or non-disclosure scope
- Automatic renewal traps or hidden fees
- Data collection beyond stated purpose
- Forced arbitration removing access to justice
- Vague definitions that give one party disproportionate power

Return ONLY valid JSON:
{
  "wisdom_score": <0-100>,
  "justice_score": <0-100>,
  "courage_score": <0-100>,
  "temperance_score": <0-100>,
  "total_score": <weighted total using policy weights above>,
  "reasoning": "<2-3 sentences: overall ethical quality of this policy>",
  "flagged_clauses": [
    {
      "clause_summary": "<brief description of the problematic clause>",
      "concern": "<which virtue it violates and why>",
      "severity": "<high | medium | low>"
    }
  ]
}`
