import { createContextTemplateHandler, createOptionsHandler } from '@/lib/context-template'

export const POST = createContextTemplateHandler({
  skillId: 'sage-pivot',
  name: 'sage-pivot',
  endpoint: '/api/skill/sage-pivot',
  depth: 'standard',
  chainsTo: ['sage-premortem', 'sage-iterate'],
  domainContext: 'Strategic pivot analysis: Evaluate the reasoning quality behind a decision to change strategic direction. Focus on whether the pivot is driven by principled reassessment (virtuous) or by passions like fear of failure, impatience, or chasing trends. Examine whether oikeiosis obligations to stakeholders affected by the pivot are being considered.',
  validateInput: (body) => {
    if (!body.current_direction || typeof body.current_direction !== 'string') return 'current_direction is required'
    if (!body.proposed_pivot || typeof body.proposed_pivot !== 'string') return 'proposed_pivot is required'
    return null
  },
  formatInput: (body) => {
    const currentDirection = typeof body.current_direction === 'string' ? body.current_direction : ''
    const proposedPivot = typeof body.proposed_pivot === 'string' ? body.proposed_pivot : ''
    const reasonForChange = typeof body.reason_for_change === 'string' ? body.reason_for_change : ''

    const parts = [
      `Current direction: ${currentDirection}`,
      `Proposed pivot: ${proposedPivot}`,
    ]
    if (reasonForChange) parts.push(`Reason for change: ${reasonForChange}`)

    return {
      input: parts.join('\n'),
      context: 'Strategic pivot reasoning evaluation.',
    }
  },
})

export const OPTIONS = createOptionsHandler()
