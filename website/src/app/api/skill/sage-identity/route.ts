import { createContextTemplateHandler, createOptionsHandler } from '@/lib/context-template'

export const POST = createContextTemplateHandler({
  skillId: 'sage-identity',
  name: 'sage-identity',
  endpoint: '/api/skill/sage-identity',
  depth: 'deep',
  chainsTo: ['sage-iterate'],
  domainContext: 'Identity and values reasoning: Evaluate the reasoning quality of decisions related to personal identity, values, or life direction. Focus on whether the agent is distinguishing between what is truly up to them (prohairesis) and external markers of identity. Check for passions like philodoxia (love of honour/reputation) or fear of social judgement. Deep analysis including Senecan progress tracking.',
  validateInput: (body) => {
    if (!body.situation || typeof body.situation !== 'string') return 'situation is required'
    return null
  },
  formatInput: (body) => {
    const situation = typeof body.situation === 'string' ? body.situation : ''
    const valuesAtStake = typeof body.values_at_stake === 'string' ? body.values_at_stake : ''
    const identityQuestion = typeof body.identity_question === 'string' ? body.identity_question : ''

    const parts = [situation]
    if (valuesAtStake) parts.push(`Values at stake: ${valuesAtStake}`)
    if (identityQuestion) parts.push(`Identity question: ${identityQuestion}`)

    return {
      input: parts.join('\n'),
      context: 'Identity and values reasoning evaluation.',
    }
  },
})

export const OPTIONS = createOptionsHandler()
