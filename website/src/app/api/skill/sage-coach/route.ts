import { createContextTemplateHandler, createOptionsHandler } from '@/lib/context-template'

export const POST = createContextTemplateHandler({
  skillId: 'sage-coach',
  name: 'sage-coach',
  endpoint: '/api/skill/sage-coach',
  depth: 'standard',
  chainsTo: ['sage-iterate'],
  domainContext: 'Coaching reasoning: Evaluate the reasoning quality of a coaching interaction or developmental guidance. Focus on whether the coaching approach honours oikeiosis (the relationship between coach and person being coached), whether guidance is based on what is within the coachee prohairesis, and whether the coach is free from passions like desire to control outcomes or need for validation.',
  validateInput: (body) => {
    if (!body.coaching_situation || typeof body.coaching_situation !== 'string') return 'coaching_situation is required'
    return null
  },
  formatInput: (body) => {
    const coachingSituation = typeof body.coaching_situation === 'string' ? body.coaching_situation : ''
    const coacheeContext = typeof body.coachee_context === 'string' ? body.coachee_context : ''
    const approach = typeof body.approach === 'string' ? body.approach : ''

    const parts = [coachingSituation]
    if (coacheeContext) parts.push(`Coachee context: ${coacheeContext}`)
    if (approach) parts.push(`Approach: ${approach}`)

    return {
      input: parts.join('\n'),
      context: 'Coaching reasoning evaluation.',
    }
  },
})

export const OPTIONS = createOptionsHandler()
