import { createContextTemplateHandler, createOptionsHandler } from '@/lib/context-template'

export const POST = createContextTemplateHandler({
  skillId: 'sage-prioritise',
  name: 'sage-prioritise',
  endpoint: '/api/skill/sage-prioritise',
  depth: 'quick',
  chainsTo: ['sage-reason-standard'],
  domainContext: 'Priority reasoning: Evaluate the reasoning quality behind a prioritisation decision. Focus on whether items are being ranked by genuine importance (virtue-alignment) or by passions like urgency addiction, fear of missing out, or desire for approval. Check the control filter — are priorities focused on what is within prohairesis?',
  validateInput: (body) => {
    if (!body.items) return 'items is required'
    return null
  },
  formatInput: (body) => {
    let itemsString = ''
    if (typeof body.items === 'string') {
      itemsString = body.items
    } else if (Array.isArray(body.items)) {
      itemsString = body.items
        .map((item, idx) => `${idx + 1}. ${item}`)
        .join('\n')
    } else {
      return { error: 'items must be a string or array' }
    }

    const criteria = typeof body.criteria === 'string' ? body.criteria : ''

    const parts = [itemsString]
    if (criteria) parts.push(`Criteria: ${criteria}`)

    return {
      input: parts.join('\n'),
      context: 'Prioritisation reasoning evaluation.',
    }
  },
})

export const OPTIONS = createOptionsHandler()
