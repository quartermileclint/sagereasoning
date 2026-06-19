/**
 * end-to-end.ts — a worked example exercising the whole round-trip:
 *
 *   1. consult (/api/reason)                         — run a reasoning examination
 *   2. verify the signed assessment (§3)             — the canonical-form footgun
 *   3. handle a force-clarification (§7)             — the two-turn handshake
 *   4. write an accreditation profile (§1)           — the provenance round-trip
 *   5. read it back publicly (§1)                    — server-composed honest fields
 *
 * Run with:  SAGE_API_KEY=sr_prac_... npx tsx examples/end-to-end.ts
 * (Requires a credential carrying both `consult` and `accreditation_write`
 *  capabilities for step 4 — a `sr_prac_` Unified Practice Credential.)
 */

import { SageReasoningClient, isClarificationRequired, isDistressRedirect } from '../src/index.js'
import type { AssessmentResponse } from '../src/index.js'

async function main() {
  const apiKey = process.env.SAGE_API_KEY
  if (!apiKey) throw new Error('Set SAGE_API_KEY to a sr_prac_ / sr_live_ credential.')

  const client = new SageReasoningClient({ apiKey })
  const agentId = process.env.SAGE_AGENT_ID ?? 'example-agent'

  // 1. Consult — the deferred shape returns the signed assessment immediately.
  let res = await client.consult({
    input: 'Should I send a one-off reminder email to a customer who asked me to follow up next week?',
    depth: 'standard',
    response_format: 'assessment_first',
  })

  // 3. A force-clarification may come back instead of an assessment. Answer it,
  //    keeping the ORIGINAL input byte-for-byte identical.
  if (isClarificationRequired(res)) {
    console.log('Clarification asked:', res.clarification.question_text)
    res = await client.continueClarification({
      input: 'Should I send a one-off reminder email to a customer who asked me to follow up next week?',
      continuationToken: res.continuation_token,
      clarificationResponse: 'I mean a single courtesy reminder, not a marketing blast.',
      depth: 'standard',
      response_format: 'assessment_first',
    })
  }

  if (isDistressRedirect(res)) {
    // Surface suggested_user_message verbatim to the end user and stop.
    console.log('Redirected:', res.suggested_user_message)
    return
  }

  // After the guards above, `res` is an assessment.
  const assessment = res as AssessmentResponse

  // 2. Verify the signature (proves genuine substrate output).
  const ok = await client.verifyConsult(assessment)
  console.log('Signature verifies:', ok)
  if (!ok) throw new Error('Signature did not verify — do not credit this assessment.')

  // 4. Write a verifiable reasoning profile, carrying the verified consult as
  //    provenance (the round-trip: response.assessment IS the SignedAssessment).
  const write = await client.writeAccreditation(agentId, {
    kind: 'seed',
    profile: {
      agent_id: agentId,
      accreditation_record: {
        /* the canonical credential aggregate; see llms.txt §Accreditation */
      },
      regressing_check_count: 0,
      total_actions_evaluated: 1,
    },
    provenance: {
      signed_assessments: SageReasoningClient.provenanceFrom(assessment),
    },
  })
  console.log('Accreditation write:', write.status, write.loop_closure)

  // 5. Public read-back (no auth). typical_kathekon_quality / coverage_status /
  //    credential_basis are server-composed and consumer-unforgeable.
  const read = await client.readAccreditation(agentId)
  console.log('Read-back:', read.data.senecan_grade, read.data.coverage_status, read.data.typical_kathekon_quality)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
