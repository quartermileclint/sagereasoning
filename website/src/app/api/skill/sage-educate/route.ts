import { createContextTemplateHandler, createOptionsHandler } from '@/lib/context-template'

export const POST = createContextTemplateHandler({
  skillId: 'sage-educate',
  name: 'sage-educate',
  endpoint: '/api/skill/sage-educate',
  depth: 'standard',
  chainsTo: ['sage-iterate'],
  domainContext: 'Educational reasoning: Evaluate the reasoning quality of educational decisions or teaching approaches. Focus on whether the approach honours the natural development of the learner (oikeiosis at the individual level), whether it builds genuine understanding (phronesis) rather than mere compliance, and whether the educator is free from passions like impatience or desire for control. IMPORTANT: Content must be age-appropriate. This skill does not provide educational certification or professional teaching advice.',
  validateInput: (body) => {
    if (!body.situation || typeof body.situation !== 'string') return 'situation is required'
    return null
  },
  formatInput: (body) => {
    const situation = typeof body.situation === 'string' ? body.situation : ''
    const learnerContext = typeof body.learner_context === 'string' ? body.learner_context : ''
    const educationalApproach = typeof body.educational_approach === 'string' ? body.educational_approach : ''

    const parts = [situation]
    if (learnerContext) parts.push(`Learner context: ${learnerContext}`)
    if (educationalApproach) parts.push(`Educational approach: ${educationalApproach}`)

    return {
      input: parts.join('\n'),
      context: 'Educational reasoning evaluation. Not professional teaching advice.',
    }
  },
  frameResult: (result) => ({
    ...result,
    education_notice: 'This evaluation assesses reasoning quality only. Ensure all educational content and approaches are age-appropriate for the intended audience.',
  }),
})

export const OPTIONS = createOptionsHandler()
