import { createContextTemplateHandler, createOptionsHandler } from '@/lib/context-template'

export const POST = createContextTemplateHandler({
  skillId: 'sage-invest',
  name: 'sage-invest',
  endpoint: '/api/skill/sage-invest',
  depth: 'standard',
  chainsTo: ['sage-iterate'],
  domainContext: 'Investment reasoning: Evaluate the reasoning quality behind an investment decision. Focus on whether the agent is treating wealth as a preferred indifferent (correct) or as a genuine good (incorrect). Check for passions like philoplousia (love of wealth), phobos (fear of loss), or hedone (excitement about gains). Does not provide financial advice — evaluates reasoning quality only.',
  validateInput: (body) => {
    if (!body.decision || typeof body.decision !== 'string') return 'decision is required'
    return null
  },
  formatInput: (body) => {
    const decision = typeof body.decision === 'string' ? body.decision : ''
    const rationale = typeof body.rationale === 'string' ? body.rationale : ''
    const riskFactors = typeof body.risk_factors === 'string' ? body.risk_factors : ''

    const parts = [decision]
    if (rationale) parts.push(`Rationale: ${rationale}`)
    if (riskFactors) parts.push(`Risk factors: ${riskFactors}`)

    return {
      input: parts.join('\n'),
      context: 'Investment reasoning evaluation. Not financial advice.',
    }
  },
})

export const OPTIONS = createOptionsHandler()
