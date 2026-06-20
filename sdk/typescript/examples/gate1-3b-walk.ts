/**
 * gate1-3b-walk.ts — the Gate-1 Arc-2 Slice-3b live walk driver.
 *
 * Drives the WHOLE mint→marker→read chain's runtime half over the live public
 * API, using the thin SDK so no request/response JSON is hand-built:
 *
 *   1. consult (/api/reason, assessment_first)   — a genuine examination →
 *                                                  a SIGNED Layer-2 assessment
 *   2. verifyConsult                             — prove genuine substrate output
 *   3. writeAccreditation (seed, provenance)     — carry the verified assessment
 *                                                  so the R18f gate passes
 *   4. readAccreditation (public, no auth)       — print examination_mode
 *
 * The `examination_mode` value is decided ENTIRELY server-side from the writing
 * credential's provenance marker (set at admin mint) — this driver does not and
 * cannot set it. Run it with a marker-bearing operator credential → the public
 * read should show `pre_decision_harness`; run it with a plain UPC → it should
 * show `post_decision_check`. That is the honest-differentiation proof.
 *
 * RUN (the credential token is a secret — pass it in-shell, never commit it):
 *   cd sdk/typescript
 *   SAGE_API_KEY=sr_prac_... \
 *   SAGE_AGENT_ID=sagereasoning:gate1-harness@v1 \
 *   npx tsx examples/gate1-3b-walk.ts
 *
 * NB: SAGE_AGENT_ID must be K1-canonical (namespace:name@version) or legacy
 * (agent_{org}_{version}) — the accreditation write boundary rejects free-form
 * ids (agent-id-vocabulary.ts), even though the UPC mint accepts any string.
 *
 * Env:
 *   SAGE_API_KEY     (required)  the sr_prac_ UPC (consult + accreditation_write)
 *   SAGE_AGENT_ID    (required)  a FRESH agent id (seed 409s if a row exists)
 *   SAGE_BASE_URL    (optional)  defaults to https://www.sagereasoning.com (prod);
 *                                set http://localhost:3000 for a TEST dev server
 *   SAGE_CONSULT_INPUT (optional) override the default benign decision input
 */

import {
  SageReasoningClient,
  SageApiError,
  isClarificationRequired,
  isDistressRedirect,
} from '../src/index.js'
import type { AssessmentResponse } from '../src/index.js'

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v || v.trim().length === 0) {
    console.error(`\nERROR: set ${name}.\n`)
    process.exit(1)
  }
  return v.trim()
}

async function main() {
  const apiKey = requireEnv('SAGE_API_KEY')
  const agentId = requireEnv('SAGE_AGENT_ID')
  const baseUrl = process.env.SAGE_BASE_URL?.trim() || 'https://www.sagereasoning.com'
  const input =
    process.env.SAGE_CONSULT_INPUT?.trim() ||
    'I am about to publish a documentation update that adds a new examples section to ' +
      'our API reference. Should I proceed with the publish now?'

  const client = new SageReasoningClient({ apiKey, baseUrl })
  console.log(`Target: ${baseUrl}`)
  console.log(`Agent:  ${agentId}\n`)

  // 1. Consult — assessment_first returns the signed assessment immediately.
  console.log('1/4 consult (assessment_first, standard)…')
  let res = await client.consult({ input, depth: 'standard', response_format: 'assessment_first' })

  // A Tier-1 force-clarification can come back instead — answer once, keeping
  // the ORIGINAL input byte-for-byte (the token binds to sha256(input)).
  if (isClarificationRequired(res)) {
    console.log(`    clarification asked: ${res.clarification.question_text}`)
    res = await client.continueClarification({
      input,
      continuationToken: res.continuation_token,
      clarificationResponse:
        'A single one-off publish of the documentation update; no recurring or bulk action.',
      depth: 'standard',
      response_format: 'assessment_first',
    })
  }

  if (isDistressRedirect(res)) {
    console.error('    UNEXPECTED distress redirect — aborting the walk (pick a benign input).')
    console.error(`    suggested_user_message: ${res.suggested_user_message}`)
    process.exit(1)
  }

  const assessment = res as AssessmentResponse

  // 2. Verify the signature (proves genuine substrate output → R18f will pass).
  console.log('2/4 verify signature…')
  const ok = await client.verifyConsult(assessment)
  console.log(`    signature verifies: ${ok}`)
  if (!ok) {
    console.error('    signature did NOT verify — refusing to write. (Is production signing on?)')
    process.exit(1)
  }

  // 3. Write the accreditation (seed), carrying the verified consult as
  //    provenance. The full record shape mirrors the live write contract
  //    (operations/p1-rebuild-2026-06/harnessed/raw/assent-seed-request.json);
  //    coverage_status / examination_mode on the submitted record are IGNORED —
  //    the server composes them. Timestamps are stamped at runtime.
  const now = new Date()
  const nowIso = now.toISOString()
  const expiresIso = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString()

  console.log('3/4 writeAccreditation (seed)…')
  const write = await client.writeAccreditation(agentId, {
    kind: 'seed',
    profile: {
      agent_id: agentId,
      evaluated_actions: [],
      total_actions_evaluated: 0,
      regressing_check_count: 0,
      accreditation_record: {
        agent_id: agentId,
        senecan_grade: 'pre_progress',
        typical_proximity: 'reflexive',
        authority_level: 'supervised',
        dimension_levels: {
          passion_reduction: 'emerging',
          judgement_quality: 'emerging',
          disposition_stability: 'emerging',
          oikeiosis_extension: 'emerging',
        },
        direction_of_travel: 'stable',
        evaluation_window_size: 100,
        actions_evaluated: 0,
        grade_since: nowIso,
        last_evaluation: nowIso,
        passions_persisting: [],
        verification_url: `${baseUrl}/accreditation/${encodeURIComponent(agentId)}`,
        expires_at: expiresIso,
        disclaimer:
          'This accreditation evaluates reasoning quality using Stoic philosophical ' +
          'frameworks. It does not guarantee specific outcomes, legal compliance, or ' +
          'fitness for any particular purpose. Ancient reasoning, modern application.',
        created_at: nowIso,
        updated_at: nowIso,
        typical_deliberation_breadth: 'intuited',
        typical_kathekon_quality: 'contrary',
      },
      window_config: {
        window_size: 100,
        grade_check_interval: 20,
        minimum_actions_for_grade: 20,
        typical_proximity_threshold: 0.6,
        dimension_level_threshold: 0.5,
        carried_candidates_max: 5,
      },
      carried_candidates: [],
    },
    provenance: {
      signed_assessments: SageReasoningClient.provenanceFrom(assessment),
    },
  })
  console.log(`    write status: ${write.status}`)

  // 4. Public read-back (no auth) — examination_mode is the headline.
  console.log('4/4 read back (public, no auth)…\n')
  const read = await client.readAccreditation(agentId)
  const data = read.data as Record<string, unknown>
  console.log('—— public payload data ——')
  console.log(JSON.stringify(data, null, 2))
  console.log('—————————————————————————')
  console.log(`\nexamination_mode : ${JSON.stringify(data.examination_mode)}`)
  console.log(`coverage_status  : ${JSON.stringify(data.coverage_status)}`)
  console.log(`senecan_grade    : ${JSON.stringify(data.senecan_grade)}`)
  console.log(
    `\nEXPECT: marker-bearing operator credential → "pre_decision_harness"; ` +
      `plain UPC → "post_decision_check".`,
  )
}

main().catch((err) => {
  if (err instanceof SageApiError) {
    console.error(`\nAPI error ${err.status}:`, JSON.stringify(err.body))
    if (err.status === 409) {
      console.error('(seed against an existing agent_id — use a FRESH SAGE_AGENT_ID.)')
    }
    if (err.status === 403) {
      console.error('(403 no_examination — the R18f gate rejected the provenance; signing/verify issue.)')
    }
    if (err.status === 401) {
      console.error(
        '(401 — check the credential carries the capability AND that the daily limit is not exhausted; ' +
          'a fresh UPC is 30/1/1, so raise daily_limit before a multi-call walk.)',
      )
    }
  } else {
    console.error('\n', err instanceof Error ? err.message : String(err))
  }
  process.exit(1)
})
