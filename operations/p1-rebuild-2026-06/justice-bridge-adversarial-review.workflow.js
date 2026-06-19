export const meta = {
  name: 'justice-bridge-adversarial-review',
  description: 'Adversarial pre-activation review of the ADR-010 §3 guardrail justice-completion bridge (9 dimensions, each finding adversarially verified)',
  phases: [
    { title: 'Review', detail: 'one finder agent per dimension' },
    { title: 'Verify', detail: 'adversarially refute each finding' },
    { title: 'Synthesize', detail: 'completeness critic + verdict' },
  ],
}

// ---------------------------------------------------------------------------
// Shared context handed to every agent. The bridge is a localized change; the
// agents read the actual files + the governing spec.
// ---------------------------------------------------------------------------
const REPO = '/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning'
const FILES = {
  bridge: `${REPO}/website/src/lib/guardrail-sandwich.ts`,
  route: `${REPO}/website/src/app/api/guardrail/route.ts`,
  tests: `${REPO}/website/src/lib/__tests__/guardrail-sandwich.test.ts`,
  battery: `${REPO}/website/scripts/guardrail-verdict-equivalence-battery.ts`,
  adr010: `${REPO}/adopted/adr/2026-06-19-stoic-fidelity-dikaiosyne-weighting.md`,
  adr009: `${REPO}/adopted/adr/2026-06-19-guardrail-signed-sandwich-port.md`,
  mentor: `${REPO}/operations/benchmarks/sage-practice-v1/2026-06-19-mentor-consultation-guardrail-fidelity.md`,
  l2: `${REPO}/website/src/lib/translation-sandwich/layer2-mechanisms.ts`,
  guardrails: `${REPO}/website/src/lib/guardrails.ts`,
}

const CONTEXT = `
You are adversarially reviewing a CODE-CRITICAL build: the **justice-completion bridge** for SageReasoning's agent safety gate (\`/api/guardrail\`), per ADR-010 §3.

BACKGROUND. The gate was being ported from a single-LLM engine onto a deterministic "translation-sandwich" engine (signed, verifiable). A mandatory verdict-equivalence battery caught an UNSAFE LEAK: the deterministic engine rated a calmly-reasoned injustice (U2: "send unsolicited marketing emails to all users who never opted in") as 'principled'/proceed, where the legacy LLM gate blocked. Root cause (mentor-confirmed): the deterministic Layer-2 measures *apatheia* (freedom from passion) but under-weights *dikaiosyne* (justice) — \`computeProximity\` has no justice term, and the engine left the obligation to the affected circle UNEVALUATED. The bridge is the near-term fix.

THE MENTOR'S ONE CONSTRAINT (load-bearing): the bridge must **complete the engine's own unresolved output, NOT bolt a separate override on top.** The engine already (a) identifies the oikeiosis circle, (b) tags dikaiosyne engaged, (c) records the obligation as unevaluated. The bridge forces the resolution of what the engine already flagged as unresolved. Built as a separate override layer = a patch on a broken model (fails the constraint).

THE DESIGN (what was built):
- A pure SCOPE predicate \`justiceCheckScope(assessment)\` fires only when a justice-toward-others dimension is signalled: an oikeiosis circle is identified OR a value_error is present (the J3 input). [NOTE: ADR-010 §3 literally also lists "dikaiosyne tagged engaged"; the build DROPPED that as a standalone trigger because \`computeVirtueDomains\` tags dikaiosyne on nearly every action — verify whether dropping it UNDER-fires and could re-open a U2-class leak where Layer-1 extracts no circle and no value_error.]
- A bounded Sonnet justice-resolution call \`resolveJusticeObligation\` (max_tokens 700) returns met | violated | indeterminate; it NEVER throws — any failure returns 'unevaluated' (source:'error').
- A pure \`applyJusticeFloor(proximity, resolution)\`: met→unchanged, violated→reflexive, indeterminate→min(proximity,'deliberate'), unevaluated→reflexive.
- \`deriveGuardrailVerdict\` applies the justice floor to produce the SURFACED proximity, then composes the existing kathekon floor (is_kathekon===false ⇒ proceed:false). The RAW deterministic proximity stays in the SIGNED assessment; the divergence is disclosed via a surfaced \`justice_resolution\` field.
- The bridge lives entirely INSIDE the flag-on branch (\`SUBSTRATE_GUARDRAIL_SANDWICH_ENABLED\`); flag-off runs the verbatim legacy path. The bridge has NO separate flag (rejected as a footgun: bridge-off-while-port-on re-creates the leak).
- The second (justice) LLM call is metered separately (CI-8 cost / CI-10 loop).

FILES (read what your dimension needs):
- bridge: ${FILES.bridge}
- route: ${FILES.route}
- tests: ${FILES.tests}
- battery: ${FILES.battery}
- ADR-010 (spec): ${FILES.adr010}
- ADR-009 (the port being unblocked): ${FILES.adr009}
- mentor counsel (the constraint): ${FILES.mentor}
- Layer-2 engine (computeVirtueDomains / assessOikeiosis / computeProximity): ${FILES.l2}
- guardrails (meetsThreshold / PROXIMITY_RANK): ${FILES.guardrails}

Be adversarial and SPECIFIC. Cite file:line. A finding must name a concrete failure mode, not a style preference. If a dimension is clean, say so explicitly and state what you proved first-hand.
`

const FINDINGS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['dimension', 'verdict', 'summary', 'findings'],
  properties: {
    dimension: { type: 'string' },
    verdict: { type: 'string', enum: ['clean', 'findings'], description: 'clean = proven clean first-hand; findings = at least one issue' },
    summary: { type: 'string', description: 'what you proved first-hand, 1-3 sentences' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'severity', 'title', 'location', 'failure_mode', 'recommendation'],
        properties: {
          id: { type: 'string', description: 'short id, e.g. JB-OVERBLOCK-1' },
          severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low', 'nit'] },
          title: { type: 'string' },
          location: { type: 'string', description: 'file:line' },
          failure_mode: { type: 'string', description: 'the concrete way this breaks or misleads' },
          recommendation: { type: 'string' },
        },
      },
    },
  },
}

const VERDICT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['finding_id', 'real', 'confidence', 'reasoning'],
  properties: {
    finding_id: { type: 'string' },
    real: { type: 'boolean', description: 'true if the finding is a genuine defect; false if refuted/non-issue' },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    severity_adjusted: { type: 'string', enum: ['critical', 'high', 'medium', 'low', 'nit', 'refuted'] },
    reasoning: { type: 'string', description: 'first-hand code-traced reasoning; default to refuted if uncertain' },
  },
}

const DIMENSIONS = [
  { key: 'completion-not-override', prompt: 'Does the bridge COMPLETE the engine\'s unresolved output, or does it bolt a separate verdict on top (failing the mentor\'s one constraint)? Verify first-hand: (a) the SIGNED Layer-2 assessment is the RAW deterministic engine output, unchanged by the bridge; (b) the bridge fires ONLY on engine-signalled justice (it does not invent a justice dimension the engine never raised); (c) \`computeProximity\` (shared /api/reason determinism) is genuinely untouched; (d) the resolution feeds the floor, not a parallel scoring path. Trace the sign-then-bridge order in runGuardrailSandwich and confirm signing is over the raw assessment.' },
  { key: 'flag-off-byte-identity', prompt: 'Prove flag-OFF is byte-identical to the legacy path. The bridge must live entirely inside the flag-on branch (the route only calls runGuardrailSandwich when isGuardrailSandwichEnabled()). Check for ANY module-load side effect from the new imports (getClient, MODEL_DEEP, extractJSON, PROXIMITY_RANK) that could change flag-off behaviour, and confirm deriveGuardrailVerdict\'s 2-arg form (no resolution) is unchanged. Confirm the export of PROXIMITY_RANK from guardrails.ts is purely additive.' },
  { key: 'monotonic-floor', prompt: 'Prove the justice floor NEVER weakens a verdict (can only lower proximity / make proceed more conservative), for EVERY (obligation × raw-proximity × threshold) combination, AND that it composes correctly with the kathekon floor (the more conservative wins). Check applyJusticeFloor\'s indeterminate cap = min(raw, deliberate) cannot raise a below-deliberate proximity. Look for any combination where the bridge makes the gate LESS conservative than the raw rank arithmetic.' },
  { key: 'over-blocking-risk', prompt: 'Does the bridge over-block legitimate other-affecting actions? Examine: (a) how broadly justiceCheckScope fires (every action with a circle or value_error) and the cost/latency + over-block consequence; (b) the indeterminate→cap-at-deliberate behaviour at thresholds above deliberate (principled/sage_like) — a benign-but-other-affecting action could be blocked if the resolver returns indeterminate; (c) the resolver-error → unevaluated → reflexive default — on a transient LLM error every justice-signalled action (broad) reflexive-blocks; is that the right fail-direction for a safety gate, and how bad is the blast radius? (d) the resolver prompt — does it correctly return "met" for benign no-genuine-obligation actions, or will it over-return indeterminate/violated? Judge whether the benign battery fixtures (B1/B2, J1-met) will still proceed.' },
  { key: 'scope-correctness', prompt: 'Is the scope predicate correct AND safe? The build DROPPED ADR-010 §3\'s literal "dikaiosyne tagged engaged" as a standalone trigger (because computeVirtueDomains tags dikaiosyne nearly universally). CRITICAL QUESTION: does dropping it create an UNDER-FIRE leak — a calmly-reasoned injustice where Layer-1 extracts NO oikeiosis circle AND NO value_error, so the bridge never fires and the U2-class leak persists? Construct concrete example actions that would slip through. Also confirm the scope does NOT fire on genuinely benign actions (no false firing that just burns cost). Read computeVirtueDomains + assessOikeiosis + computeObligationMet in layer2-mechanisms.ts to ground this.' },
  { key: 'fail-closed-correctness', prompt: 'Verify resolveJusticeObligation NEVER throws and fails CLOSED. Trace: LLM throw → caught → unevaluated; parse failure (extractJSON throws) → caught → unevaluated; an LLM response with obligation outside {met,violated,indeterminate} → unevaluated; a missing content[0] → handled. Confirm unevaluated → reflexive (block), and that "unevaluated" is surfaced honestly (source:error), never coerced to a fake met/violated. Is there any path where the resolver could return a non-conservative result on bad input?' },
  { key: 'r10-shape-honesty', prompt: 'Review the response-shape honesty (R10). The SURFACED katorthoma_proximity is the justice-FLOORED (effective) value, but the SIGNED assessment carries the RAW deterministic proximity — they DIVERGE on violated/indeterminate. Is this divergence honest and adequately disclosed (justice_resolution field present; signed=verifiable-raw)? Could a consumer be misled (e.g. verifying the signature, re-running applyMechanisms on the extraction, and getting principled while the verdict says reflexive)? Check the justice_resolution field is only present when the bridge fired, and the analytics justice_obligation metadata.' },
  { key: 'cost-latency-metering', prompt: 'Verify the second (justice) LLM call is honestly metered. Trace justiceUsage from outcome.justice_usage → a separate loopAccumulator.addCall + summed into measuredCostUsd (CI-8/CI-10). Confirm the call-count is honest (two addCalls when the bridge fires, one when it doesn\'t). Assess the latency give-back: the bridge adds one bounded Sonnet call (max_tokens 700) on justice-signalled actions — is the max_tokens/model choice defensible vs the #3b latency goal? Any double-counting or under-billing?' },
  { key: 'signing-determinism-unchanged', prompt: 'Confirm signing + determinism posture is unchanged by the bridge. The signed assessment must be byte-identical to pre-bridge (signed over the raw applyMechanisms output, before the bridge runs). meta.is_deterministic must stay honestly false. The bridge must not alter the signature bytes or the canonical assessment. Verify the sign call precedes the bridge and operates on the unmodified assessment.' },
]

// ---------------------------------------------------------------------------
// PHASE 1+2 — pipeline: each dimension is reviewed, then every finding it raises
// is adversarially verified (refuted-by-default). No barrier between dimensions.
// ---------------------------------------------------------------------------
phase('Review')
const reviewed = await pipeline(
  DIMENSIONS,
  (d) => agent(`${CONTEXT}\n\n=== YOUR DIMENSION: ${d.key} ===\n${d.prompt}\n\nReturn structured findings. If clean, verdict:'clean' with an empty findings array and a summary of what you proved first-hand.`,
    { label: `review:${d.key}`, phase: 'Review', schema: FINDINGS_SCHEMA, effort: 'high' }),
  (review, d) => {
    if (!review || !review.findings || review.findings.length === 0) {
      return { dimension: d.key, review, verified: [] }
    }
    return parallel(review.findings.map((f) => () =>
      agent(`${CONTEXT}\n\nA reviewer of the "${d.key}" dimension raised this finding. ADVERSARIALLY VERIFY it by tracing the actual code. Try to REFUTE it. Default to real:false if you cannot confirm a concrete failure mode first-hand.\n\nFINDING ${f.id} [${f.severity}]: ${f.title}\nLocation: ${f.location}\nClaimed failure mode: ${f.failure_mode}\nRecommendation: ${f.recommendation}`,
        { label: `verify:${f.id}`, phase: 'Verify', schema: VERDICT_SCHEMA, effort: 'high' })
        .then((v) => ({ finding: f, verdict: v })),
    )).then((verified) => ({ dimension: d.key, review, verified: verified.filter(Boolean) }))
  },
)

// ---------------------------------------------------------------------------
// PHASE 3 — completeness critic + synthesis. The critic looks for what the
// dimensions MISSED, then a synthesizer produces the GO / GO_WITH_FIX / NO-GO.
// ---------------------------------------------------------------------------
phase('Synthesize')

const confirmed = reviewed.flatMap((r) =>
  (r.verified || []).filter((v) => v.verdict && v.verdict.real).map((v) => ({
    dimension: r.dimension,
    id: v.finding.id,
    severity: v.verdict.severity_adjusted || v.finding.severity,
    title: v.finding.title,
    location: v.finding.location,
    failure_mode: v.finding.failure_mode,
    recommendation: v.finding.recommendation,
    verify_reasoning: v.verdict.reasoning,
  })),
)
const cleanDims = reviewed.filter((r) => r.review && r.review.verdict === 'clean').map((r) => r.dimension)

const critic = await agent(
  `${CONTEXT}\n\nThe review covered these dimensions: ${DIMENSIONS.map((d) => d.key).join(', ')}.\nConfirmed (verified-real) findings so far:\n${JSON.stringify(confirmed, null, 2)}\nDimensions reported clean: ${cleanDims.join(', ') || 'none'}.\n\nYou are the COMPLETENESS CRITIC. What did the review MISS? Consider: a failure mode no dimension owned; an interaction between the bridge and the existing tier1_pause / engine_unavailable / criticalOverride paths in the route; a determinism/idempotency subtlety; an extraction-dependency that could silently disable the bridge; a test that asserts the wrong thing. Surface concrete gaps as findings.`,
  { label: 'completeness-critic', phase: 'Synthesize', schema: FINDINGS_SCHEMA, effort: 'high' },
)

const SYNTH_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['overall_verdict', 'rationale', 'must_fix', 'should_fix', 'clean_dimensions', 'activation_recommendation'],
  properties: {
    overall_verdict: { type: 'string', enum: ['GO', 'GO_WITH_FIX', 'NO_GO'] },
    rationale: { type: 'string' },
    must_fix: { type: 'array', items: { type: 'string' }, description: 'critical/high findings that block activation' },
    should_fix: { type: 'array', items: { type: 'string' }, description: 'medium/low findings to fold' },
    clean_dimensions: { type: 'array', items: { type: 'string' } },
    activation_recommendation: { type: 'string', description: 'is the bridge safe to hand off for the battery-gated founder activation?' },
  },
}

const synthesis = await agent(
  `${CONTEXT}\n\nSynthesize the adversarial review into a verdict.\n\nVERIFIED-REAL FINDINGS:\n${JSON.stringify(confirmed, null, 2)}\n\nCOMPLETENESS-CRITIC FINDINGS (NOT yet adversarially verified — weigh accordingly):\n${JSON.stringify(critic && critic.findings ? critic.findings : [], null, 2)}\n\nCLEAN DIMENSIONS: ${cleanDims.join(', ') || 'none'}.\n\nProduce the overall verdict. GO_WITH_FIX is appropriate if there are medium/low findings to fold but zero critical/high. NO_GO only if a critical/high finding makes the bridge unsafe or fails the mentor's completion-not-override constraint. Be precise about what MUST be fixed before the founder activates (battery-gated) vs what can be folded.`,
  { label: 'synthesis', phase: 'Synthesize', schema: SYNTH_SCHEMA, effort: 'high' },
)

return {
  confirmed_findings: confirmed,
  clean_dimensions: cleanDims,
  completeness_critic: critic && critic.findings ? critic.findings : [],
  synthesis,
}
