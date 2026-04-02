import { createContextTemplateHandler, createOptionsHandler } from '@/lib/context-template'

export const POST = createContextTemplateHandler({
  skillId: 'sage-moderate',
  name: 'sage-moderate',
  endpoint: '/api/skill/sage-moderate',
  depth: 'quick',
  chainsTo: ['sage-reason-standard'],
  domainContext: 'Content moderation reasoning: Evaluate the reasoning quality of a content moderation decision. Focus on justice (is the decision fair to the content creator?), temperance (is the moderator reacting proportionally?), and courage (is the moderator willing to make difficult calls?). The control filter distinguishes between what the moderator can judge (reasoning quality of the content) and what is outside their control (how the community will react).',
  validateInput: (body) => {
    if (!body.content || typeof body.content !== 'string') return 'content is required'
    return null
  },
  formatInput: (body) => {
    const content = typeof body.content === 'string' ? body.content : ''
    const moderationDecision = typeof body.moderation_decision === 'string' ? body.moderation_decision : ''
    const policyContext = typeof body.policy_context === 'string' ? body.policy_context : ''

    const parts = [content]
    if (moderationDecision) parts.push(`Moderation decision: ${moderationDecision}`)
    if (policyContext) parts.push(`Policy context: ${policyContext}`)

    return {
      input: parts.join('\n'),
      context: 'Content moderation reasoning evaluation.',
    }
  },
})

export const OPTIONS = createOptionsHandler()
