import { createContextTemplateHandler, createOptionsHandler } from '@/lib/context-template'

export const POST = createContextTemplateHandler({
  skillId: 'sage-retro',
  name: 'sage-retro',
  endpoint: '/api/skill/sage-retro',
  depth: 'standard',
  chainsTo: ['sage-iterate'],
  domainContext: `Retrospective reasoning with structured debrief analysis (Item 14 — debrief structure).

Evaluate a completed project, period, or incident across FIVE dimensions:

1. WHAT HAPPENED — Plain-language narrative. What was the goal? What went wrong or right? What was the actual impact?

2. COMMUNICATION QUALITY — Where did signals break down? Was uncertainty presented as confidence? Were assumptions named? Were risks communicated before acting? Rate as: clear / partial / breakdown.

3. ASSUMPTION ERRORS — What was assumed that turned out to be wrong? What information was missing? Did anyone proceed on incomplete information without signalling it?

4. VERIFICATION GAPS — Were results verified before moving on? Was the verify-decide-execute sequence followed? What would have caught the problem earlier?

5. PASSION DIAGNOSIS — Was the failure driven by a specific false judgement? Was hasty assent (propeteia) involved — acting under urgency without adequate examination? Which root passion (epithumia/hedone/phobos/lupe) was the driver?

For each dimension, provide a quality rating: strong / adequate / weak / not_applicable.

In your response JSON, include a "debrief_analysis" object with these 5 dimensions as keys, each containing "assessment" (the analysis), "quality" (the rating), and "improvement" (what to do differently).

Also identify PATTERNS: does this connect to previously observed failures? Is there a recurring theme?

Focus on what was within prohairesis (decisions made) vs outside (outcomes received). This is for learning, not blame — frame all findings as opportunities for philosophical growth.`,
  validateInput: (body) => {
    if (!body.what_happened || typeof body.what_happened !== 'string') return 'what_happened is required'
    return null
  },
  formatInput: (body) => {
    const whatHappened = typeof body.what_happened === 'string' ? body.what_happened : ''
    const decisionsMade = typeof body.decisions_made === 'string' ? body.decisions_made : ''
    const outcomes = typeof body.outcomes === 'string' ? body.outcomes : ''
    const communicationContext = typeof body.communication_context === 'string' ? body.communication_context : ''
    const urgencyContext = typeof body.urgency_context === 'string' ? body.urgency_context : ''

    const parts = [whatHappened]
    if (decisionsMade) parts.push(`Decisions made: ${decisionsMade}`)
    if (outcomes) parts.push(`Outcomes: ${outcomes}`)
    if (communicationContext) parts.push(`Communication context: ${communicationContext}`)
    if (urgencyContext) parts.push(`Urgency context: ${urgencyContext}`)

    return {
      input: parts.join('\n'),
      context: 'Retrospective reasoning evaluation with structured debrief analysis.',
    }
  },
})

export const OPTIONS = createOptionsHandler()
