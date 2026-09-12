/**
 * enforcement-clause.ts — the two VERBATIM texts of Logos-on W2 (mentor L5 +
 * L7), in a zero-import module so the PURE trust-record composer can carry them
 * inline without importing the store through enforcement-record.ts.
 *
 * Verbatim record (wins over every restatement):
 * operations/agent-circles-2026-08/2026-08-01-mentor-consultation-agent-circles-logos-on-verbatim.md
 * Battery-locked byte-for-byte in w2-enforcement-record.test.ts §1.
 */

/**
 * Mentor L7, verbatim — the logos-on analog of the not-attestable clause. This
 * is the INLINE half (per entry). The RECORD-LEVEL half (the envelope addition
 * + the ADR-013 §8 dated amendment) is STAGED for R18 sign-off in
 * operations/agent-circles-2026-08/2026-09-12-W2-compliance-not-virtue-clause-
 * STAGED-R18.md and is deliberately NOT applied anywhere yet.
 */
export const COMPLIANCE_NOT_VIRTUE_CLAUSE =
  'what this record shows under logos-on enforcement is compliance with rational ' +
  'structure, not constructed virtue. Enforced outcomes are not character evidence. ' +
  "The absence of violations under enforcement does not attest to the agent's " +
  "virtue; it attests to the infrastructure's function."

/**
 * Mentor L5's three required statements, as the inline context marker: "stating
 * that the outcome was produced under logos-on enforcement, that the agent's own
 * reasoning was not the proximate cause of the outcome, and that demonstration
 * evidence in this period should be read in light of the enforcement context."
 */
export const ENFORCEMENT_CONTEXT_MARKER =
  "Produced under logos-on enforcement. The agent's own reasoning was not the " +
  'proximate cause of this outcome. Demonstration evidence in this period should ' +
  'be read in light of the enforcement context.'
