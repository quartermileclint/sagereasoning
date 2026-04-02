import { createContextTemplateHandler, createOptionsHandler } from '@/lib/context-template'

export const POST = createContextTemplateHandler({
  skillId: 'sage-align',
  name: 'sage-align',
  endpoint: '/api/skill/sage-align',
  depth: 'standard',
  chainsTo: ['sage-iterate'],
  domainContext: 'Team alignment reasoning: Evaluate the reasoning quality of a team decision or alignment process. Focus on justice (is each team member given their due consideration?), oikeiosis (are the relationships between team members being honoured?), and whether the alignment process is driven by principled reasoning or by passions like people-pleasing, dominance, or conflict avoidance.',
  validateInput: (body) => {
    if (!body.situation || typeof body.situation !== 'string') return 'situation is required'
    return null
  },
  formatInput: (body) => {
    const situation = typeof body.situation === 'string' ? body.situation : ''
    const teamContext = typeof body.team_context === 'string' ? body.team_context : ''
    const proposedAlignment = typeof body.proposed_alignment === 'string' ? body.proposed_alignment : ''

    const parts = [situation]
    if (teamContext) parts.push(`Team context: ${teamContext}`)
    if (proposedAlignment) parts.push(`Proposed alignment: ${proposedAlignment}`)

    return {
      input: parts.join('\n'),
      context: 'Team alignment reasoning evaluation.',
    }
  },
})

export const OPTIONS = createOptionsHandler()
