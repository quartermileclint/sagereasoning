import { createContextTemplateHandler, createOptionsHandler } from '@/lib/context-template'

export const POST = createContextTemplateHandler({
  skillId: 'sage-negotiate',
  name: 'sage-negotiate',
  endpoint: '/api/skill/sage-negotiate',
  depth: 'standard',
  chainsTo: ['sage-iterate'],
  domainContext: 'Negotiation reasoning: Evaluate the reasoning quality of a negotiation position or strategy. Focus on justice (giving each party their due), oikeiosis (natural relationships between parties), and whether the approach is driven by passions (greed, fear of loss) or principled reasoning.',
  validateInput: (body) => {
    if (!body.position || typeof body.position !== 'string') return 'position is required'
    return null
  },
  formatInput: (body) => {
    const position = typeof body.position === 'string' ? body.position : ''
    const counterparty = typeof body.counterparty === 'string' ? body.counterparty : ''
    const interests = typeof body.interests === 'string' ? body.interests : ''

    const parts = [position]
    if (counterparty) parts.push(`Counterparty: ${counterparty}`)
    if (interests) parts.push(`Interests: ${interests}`)

    return {
      input: parts.join('\n'),
      context: 'Negotiation reasoning evaluation.',
    }
  },
})

export const OPTIONS = createOptionsHandler()
