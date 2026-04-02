import { createContextTemplateHandler, createOptionsHandler } from '@/lib/context-template'

export const POST = createContextTemplateHandler({
  skillId: 'sage-govern',
  name: 'sage-govern',
  endpoint: '/api/skill/sage-govern',
  depth: 'deep',
  chainsTo: ['sage-iterate'],
  domainContext: 'Governance reasoning: Evaluate the reasoning quality of governance decisions or policy-making. Focus on justice at the community/institutional level of oikeiosis, whether power is being exercised with temperance, and whether decisions serve the common good. Deep analysis with Senecan progress tracking for institutional reasoning patterns.',
  validateInput: (body) => {
    if (!body.decision || typeof body.decision !== 'string') return 'decision is required'
    return null
  },
  formatInput: (body) => {
    const decision = typeof body.decision === 'string' ? body.decision : ''
    const stakeholdersAffected = typeof body.stakeholders_affected === 'string' ? body.stakeholders_affected : ''
    const governanceContext = typeof body.governance_context === 'string' ? body.governance_context : ''

    const parts = [decision]
    if (stakeholdersAffected) parts.push(`Stakeholders affected: ${stakeholdersAffected}`)
    if (governanceContext) parts.push(`Governance context: ${governanceContext}`)

    return {
      input: parts.join('\n'),
      context: 'Governance reasoning evaluation.',
    }
  },
})

export const OPTIONS = createOptionsHandler()
