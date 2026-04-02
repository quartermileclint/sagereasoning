import { createContextTemplateHandler, createOptionsHandler } from '@/lib/context-template'

export const POST = createContextTemplateHandler({
  skillId: 'sage-premortem',
  name: 'sage-premortem',
  endpoint: '/api/skill/sage-premortem',
  depth: 'standard',
  chainsTo: ['sage-reason-deep', 'sage-iterate'],
  domainContext: 'Pre-mortem analysis: Evaluate a planned decision by imagining it has already failed. Identify which passions and false judgements could lead to failure. Focus on what is within prohairesis (the quality of the decision-making), not external outcomes.',
  validateInput: (body) => {
    if (!body.decision || typeof body.decision !== 'string') return 'decision is required'
    return null
  },
  formatInput: (body) => {
    const decision = typeof body.decision === 'string' ? body.decision : ''
    const stakeholders = typeof body.stakeholders === 'string' ? body.stakeholders : ''
    const timeline = typeof body.timeline === 'string' ? body.timeline : ''

    const parts = [decision]
    if (stakeholders) parts.push(`Stakeholders: ${stakeholders}`)
    if (timeline) parts.push(`Timeline: ${timeline}`)

    return {
      input: parts.join('\n'),
      context: 'Pre-mortem analysis: The agent is examining a planned decision before execution.',
    }
  },
})

export const OPTIONS = createOptionsHandler()
