/**
 * watching-shared.ts — the ONE shared, dependency-free module for constants both
 * halves of the `watching` surface consume (agent-circles, RULED 2026-08-09):
 * the server read route (/api/founder/watching) puts the disclosure on the wire;
 * the founder dashboard page (/founder-watching) RENDERS it. Sharing the literal
 * means the rendered text and the wire text cannot drift — and the §2.10
 * required review dimension (2) ("the runner-composed disclosure actually
 * RENDERED, not just documented") is pinned against this single source.
 *
 * Zero imports on purpose: the page is a client component; anything here lands
 * in the client bundle.
 */

/** The ruled §2.5 disclosure — every row is the runner's self-report. */
export const RUNNER_COMPOSED_DISCLOSURE =
  'Runner-composed record: every row is the runner’s self-report of its own cycle ' +
  '(the runner is the only party holding full cycle state). maximum_duration_ms is ' +
  'runner-declared configuration the server cannot verify. Guardrail session refs, ' +
  'where present, are checkable against SageReasoning’s own signed assessments.'
