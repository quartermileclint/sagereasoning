/**
 * stoa-tags.ts — The Stoa's suggested domain-tag vocabulary (ST3).
 *
 * ZERO imports (pure exported values, battery-assertable).
 *
 * Constraint #10 (Q3c, binding): tags describe DOMAINS OF WORK AND INQUIRY,
 * never QUALITIES OF THE PRACTITIONER. The mentor's own examples: "Stoic
 * ethics," "agent development," "grief processing" are domain tags;
 * "experienced," "advanced," "trusted" are evaluative tags and MUST NOT
 * appear. "The distinction is between helping practitioners find relevant
 * declarations and grading the declarers."
 *
 * SUGGESTED, NEVER REQUIRED: the vocabulary below is offered in the declare
 * form; free tags are equally valid and no tag is mandatory. The store caps
 * tags at 12 per entry, 40 chars each.
 *
 * The deny-class battery (stoa-boundary.test.ts §G) asserts every seed tag
 * against the evaluative deny-list — any evaluative term added here goes red.
 */

/** The seed vocabulary — domains only. Extend deliberately (the battery's
 *  deny-class check runs over every entry). */
export const STOA_SUGGESTED_TAGS: readonly string[] = [
  // The mentor's own three examples (Q3c)
  'stoic-ethics',
  'agent-development',
  'grief-processing',
  // Practice domains
  'daily-practice',
  'journaling',
  'meditation',
  'premeditatio',
  // Inquiry domains
  'philosophy',
  'stoic-physics',
  'stoic-logic',
  'ai-ethics',
  'research',
  // Work domains
  'software-engineering',
  'writing',
  'teaching',
  'mentoring',
  'community-building',
  'parenting',
]
