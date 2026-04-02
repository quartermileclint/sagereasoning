import { createContextTemplateHandler, createOptionsHandler } from '@/lib/context-template'

export const POST = createContextTemplateHandler({
  skillId: 'sage-retro',
  name: 'sage-retro',
  endpoint: '/api/skill/sage-retro',
  depth: 'standard',
  chainsTo: ['sage-iterate'],
  domainContext: 'Retrospective reasoning: Evaluate reasoning patterns from a completed project or period. Identify recurring passions and false judgements. Focus on what was within prohairesis (decisions made) vs outside (outcomes received). This is for learning, not blame — frame all findings as opportunities for philosophical growth.',
  validateInput: (body) => {
    if (!body.what_happened || typeof body.what_happened !== 'string') return 'what_happened is required'
    return null
  },
  formatInput: (body) => {
    const whatHappened = typeof body.what_happened === 'string' ? body.what_happened : ''
    const decisionsMade = typeof body.decisions_made === 'string' ? body.decisions_made : ''
    const outcomes = typeof body.outcomes === 'string' ? body.outcomes : ''

    const parts = [whatHappened]
    if (decisionsMade) parts.push(`Decisions made: ${decisionsMade}`)
    if (outcomes) parts.push(`Outcomes: ${outcomes}`)

    return {
      input: parts.join('\n'),
      context: 'Retrospective reasoning evaluation.',
    }
  },
})

export const OPTIONS = createOptionsHandler()
