import { createContextTemplateHandler, createOptionsHandler } from '@/lib/context-template'

export const POST = createContextTemplateHandler({
  skillId: 'sage-compliance',
  name: 'sage-compliance',
  endpoint: '/api/skill/sage-compliance',
  depth: 'standard',
  chainsTo: ['sage-iterate'],
  domainContext: 'Compliance reasoning: Evaluate the reasoning quality behind compliance-related decisions. Focus on whether compliance is being pursued as a genuine expression of justice and social obligation (kathekon) or merely as fear-driven box-ticking. IMPORTANT: This skill evaluates reasoning quality only. It does not provide legal, regulatory, or compliance advice, and its output must not be presented as compliance certification (R1, R9).',
  validateInput: (body) => {
    if (!body.situation || typeof body.situation !== 'string') return 'situation is required'
    return null
  },
  formatInput: (body) => {
    const situation = typeof body.situation === 'string' ? body.situation : ''
    const regulationContext = typeof body.regulation_context === 'string' ? body.regulation_context : ''
    const proposedAction = typeof body.proposed_action === 'string' ? body.proposed_action : ''

    const parts = [situation]
    if (regulationContext) parts.push(`Regulation context: ${regulationContext}`)
    if (proposedAction) parts.push(`Proposed action: ${proposedAction}`)

    return {
      input: parts.join('\n'),
      context: 'Compliance reasoning evaluation. Not legal or regulatory advice.',
    }
  },
  frameResult: (result) => ({
    ...result,
    compliance_notice: 'This evaluation assesses reasoning quality only. It is not a compliance assessment, certification, or legal opinion. Consult qualified professionals for actual compliance guidance.',
  }),
})

export const OPTIONS = createOptionsHandler()
