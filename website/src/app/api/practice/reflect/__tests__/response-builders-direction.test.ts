/**
 * response-builders-direction.test.ts — the reflect completion profile's
 * direction_of_travel boundary mapping (Trust Layer S0b, ADR-013 §Vocabulary,
 * 2026-07-08).
 *
 * Plain-assertion script: npx tsx <this file>   (bare — response-builders'
 * only value imports are next/server + the audience renderer, whose sole
 * import is a type; no Supabase chain is reached).
 *
 * WHY THIS LOCK EXISTS: before S0b the completion profile forwarded the
 * trust-layer AccreditationRecord's vocabulary ('regressing') verbatim while
 * the public docs (llms.txt + api-docs) documented 'declining' for this
 * surface — a live docs/wire drift. The boundary mapping fixes the wire INTO
 * the documented contract. This test drives the REAL builder end-to-end and
 * locks: 'regressing' → 'declining' on the wire, shared values pass through,
 * and the legacy term never appears in a completion body.
 */

import type { ReflectDecision } from '@/lib/sage-reflect/reflect-service'
import type { ReflectOutcome } from '@/lib/sage-reflect/engine'
import type { SageAssentFeedResult } from '@/lib/sage-reflect/sage-assent-feed'
import { buildCompleteResponse } from '../response-builders'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string): void {
  if (condition) {
    passed++
  } else {
    failed++
    failures.push(label)
    console.error(`FAIL: ${label}`)
  }
}

type CompleteDecision = Extract<ReflectDecision, { kind: 'complete' }>

const OUTCOME = {
  exit_path: 'standard',
  rs_class: 'rs1',
  profile_update_confidence: 'normal',
  progress_dimensions_held: false,
  scrutiny_flags: [],
  developer_note: null,
  sage_calling_trigger: null,
  fabrication_risk_level: 'low',
} as unknown as ReflectOutcome

function mkFeed(direction: string): SageAssentFeedResult {
  return {
    evaluated_actions_persisted: 3,
    seeded_accreditation: false,
    grade_changed: false,
    senecan_grade: 'grade_3',
    typical_proximity: 'deliberate',
    dimension_levels: {
      passion_reduction: 'developing',
      judgement_quality: 'developing',
      disposition_stability: 'developing',
      oikeiosis_extension: 'developing',
    },
    direction_of_travel: direction,
    per_domain_proximity: {
      phronesis: 'deliberate',
      dikaiosyne: 'deliberate',
      andreia: 'deliberate',
      sophrosyne: 'deliberate',
      aggregate: 'deliberate',
    },
  } as unknown as SageAssentFeedResult
}

function mkDecision(direction: string): CompleteDecision {
  return {
    kind: 'complete',
    outcome: OUTCOME,
    feed: mkFeed(direction),
    mirror_note: 'The profile describes the record, not the agent.',
  } as CompleteDecision
}

async function main(): Promise<void> {
  // 1. The record vocabulary's 'regressing' emits as canonical 'declining'.
  {
    const res = buildCompleteResponse('sess-1', mkDecision('regressing'))
    const body = await res.json()
    assert(res.status === 200, 'regressing feed: 200')
    assert(
      body.profile?.direction_of_travel === 'declining',
      "regressing feed: wire emits 'declining' (canonical; matches the documented contract)",
    )
    assert(
      !JSON.stringify(body).includes('"regressing"'),
      'regressing feed: legacy term absent from the whole body',
    )
  }

  // 2. Shared values pass through unchanged.
  {
    const up = await buildCompleteResponse('sess-2', mkDecision('improving')).json()
    assert(up.profile?.direction_of_travel === 'improving', 'improving feed: passthrough')
    const flat = await buildCompleteResponse('sess-3', mkDecision('stable')).json()
    assert(flat.profile?.direction_of_travel === 'stable', 'stable feed: passthrough')
  }

  // 3. The null-feed completion still builds (no profile, no mapping to run).
  {
    const decision = {
      kind: 'complete',
      outcome: OUTCOME,
      feed: null,
      mirror_note: 'The profile describes the record, not the agent.',
    } as CompleteDecision
    const body = await buildCompleteResponse('sess-4', decision).json()
    assert(body.profile === null, 'null feed: profile null, builder unchanged')
  }

  console.log(`\n${passed} passed, ${failed} failed`)
  if (failed > 0) {
    console.error(`Failures:\n  ${failures.join('\n  ')}`)
    process.exit(1)
  }
}

main().catch((e) => {
  console.error('Test harness threw:', e)
  process.exit(1)
})
