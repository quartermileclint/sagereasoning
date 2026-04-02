import { createContextTemplateHandler, createOptionsHandler } from '@/lib/context-template'

export const POST = createContextTemplateHandler({
  skillId: 'sage-resolve',
  name: 'sage-resolve',
  endpoint: '/api/skill/sage-resolve',
  depth: 'standard',
  chainsTo: ['sage-iterate'],
  domainContext: 'Conflict resolution reasoning: Evaluate the reasoning quality of an approach to resolving a conflict. Focus on justice (giving each party their due), courage (willingness to address the real issue), and temperance (not being driven by anger, resentment, or desire for revenge). Oikeiosis is central — how does the resolution honour the natural relationships between the parties?',
  validateInput: (body) => {
    if (!body.conflict || typeof body.conflict !== 'string') return 'conflict is required'
    return null
  },
  formatInput: (body) => {
    const conflict = typeof body.conflict === 'string' ? body.conflict : ''
    const parties = typeof body.parties === 'string' ? body.parties : ''
    const proposedResolution = typeof body.proposed_resolution === 'string' ? body.proposed_resolution : ''

    const parts = [conflict]
    if (parties) parts.push(`Parties: ${parties}`)
    if (proposedResolution) parts.push(`Proposed resolution: ${proposedResolution}`)

    return {
      input: parts.join('\n'),
      context: 'Conflict resolution reasoning evaluation.',
    }
  },
})

export const OPTIONS = createOptionsHandler()
