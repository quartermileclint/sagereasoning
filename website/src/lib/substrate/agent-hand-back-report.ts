/**
 * agent-hand-back-report.ts — the Sage Assent Wrapper, the
 * trajectory-enriched developer hand-back report.
 *
 * STATUS: Scaffolded → Wired → Verified (2026-05-16, this session). New code,
 * imported by no route — no production exposure this session.
 *
 * GOVERNING DOCUMENTS
 *   - /adopted/substrate-modes/sage-assent-wrapper-spec.md — the spec
 *     (Adopted 2026-05-14). This module builds spec §"The report the agent
 *     hands back to the developer" — the human-readable companion to
 *     Component 2's in-loop machine-readable rendering (renderAgentMode in
 *     agent-mode-service.ts).
 *   - /operations/decision-log.md — D-HAND-BACK-REPORT-WIRED-VERIFIED-
 *     2026-05-16 (this build; the Step 1 design-decision gate is recorded
 *     there).
 *   - /adopted/sage-assent-items-1-3-design.md — Decision A (deliberation_breadth) +
 *     Decision B (carried_candidates) — both surface in this report.
 *   - /adopted/adr/2026-05-12-substrate-category-character-kernel.md — J1 ADR,
 *     the Character Kernel category language the R18a preamble reuses.
 *   - /manifest.md §R3 / §R4 / §R17e / §R18 (a-e) / §R19c / §R19d / §AC8 /
 *     §PR1 / §PR2 / §PR10 / §PR15.
 *
 * WHAT THIS MODULE IS
 *
 * The wrapped agent runs its loop, consuming the in-loop machine-readable
 * agent-mode rendering (renderAgentMode) to make decisions. The agent does not
 * exist in isolation — it has a developer. At task end, session end, or on
 * demand, the wrapped agent hands back a report to its developer. THAT report
 * is what this module renders.
 *
 * Three audience surfaces; one wrapper:
 *   1. Agent in-loop view ........ renderAgentMode  (Component 2; machine-readable)
 *   2. Developer view ............ THIS MODULE       (the hand-back report)
 *   3. Third-party verification .. /api/accreditation/[agent_id] (Component 3; the badge)
 *
 * The hand-back report consumes everything the wrapper has accumulated across
 * a session and renders five Markdown sections plus one always-on subsection
 * (and one contextual peer-agents section that appears only when an
 * orchestrator ran with peers):
 *
 *   1. Decisions                — every committed decision the agent reasoned on
 *   1.5. Still under consideration — the wrapper's working set (Decision B)
 *   2. Trajectory                — the WindowSnapshot summary
 *   3. Grade / authority / badge — the AccreditationPayload-shape summary
 *   4. Persisting passions       — the recurring distortions
 *   5. Peer agents (conditional) — the orchestrator's view of its peers
 *
 * The five fixed sections map 1:1 to the wrapper spec's five bullets in
 * §"The report the agent hands back to the developer". Section 1.5 is
 * additionally surfaced per Decision B (the carried_candidates working set).
 *
 * PURITY / DETERMINISM
 *
 * The module is SYNCHRONOUS and pure GIVEN A SUPPLIED snapshot. The optional
 * `snapshot` input parameter exists to keep the function fully deterministic
 * for the test path. If omitted, the function computes its own WindowSnapshot
 * via the ported computeWindowSnapshot — which stamps a `computed_at` ISO from
 * the system clock (the documented behaviour the ported /trust-layer/
 * functions inherit; see sage-assent-wrapper.ts module-header PURITY PROFILE). For
 * session-end production use, supply the snapshot from the preceding
 * computeTrajectory call.
 *
 * No LLM call. No I/O. No randomness. No DB writes (the report is a pure
 * library deliverable this session; the route wiring is a future session).
 *
 * COMPLIANCE
 *   - R3 (evaluative disclaimer): the signoff includes record.disclaimer
 *     verbatim (which is ACCREDITATION_DISCLAIMER on the ported builder's seed
 *     default).
 *   - R4 (IP boundary): the report sources its grade/authority/badge data
 *     from the AccreditationPayload shape (R4-compliant subset built via
 *     buildAccreditationPayload) plus the WindowSnapshot's public fields plus
 *     the EvaluatedAction fields the bridge populates. No internal thresholds
 *     (UPGRADE/DOWNGRADE numerics, dimension confidence scores, grade-engine
 *     micro-logic) cross to the rendered output.
 *   - R17e: does NOT apply to agent profiles — an agent's reasoning-pattern
 *     profile is not an intimate human vulnerability (wrapper spec §"R-rule
 *     engagement"; the load-bearing distinction from private mode). This
 *     module applies no R17e filter.
 *   - R18a (Character Kernel): the preamble names what the report measures
 *     using the Character Kernel category language adopted under the J1 ADR.
 *   - R18e: NOT engaged at the report level — the report consumes structured
 *     fields (EvaluatedAction, WindowSnapshot, AccreditationRecord,
 *     PeerAgentAssessmentPayload). It does NOT quote raw Layer 3 prose; each
 *     per-rendering Article-50 transparency wrap stays in its rendering. No
 *     re-wrap at the report level.
 *   - R19c (limitations link): the preamble names the limitations page URL.
 *   - R19d (mirror principle): the preamble names the developer-audience
 *     mirror — the report is a mirror onto the agent's behaviour, not a
 *     verdict on the developer.
 *   - R20a passthrough: NOT a new wrap. Any R20a event during the session is
 *     naturally reflected in the EvaluatedAction's existing fields; the
 *     consumer-side passthrough surface stays at the per-rendering level
 *     (renderAgentMode). The report does not re-wrap.
 *   - AC8: this module sits in /website/src/lib/substrate/ and consumes the
 *     translation-sandwich substrate's Sage Assent outputs.
 *   - PR1: single-endpoint proof — the hand-back rendering is proved on one
 *     module + one test file this session. Route wiring is a future session.
 *   - PR2: the test file (__tests__/agent-hand-back-report.test.ts) invokes
 *     renderAgentHandBackReport in the same session this module is written.
 *   - PR4: N/A — no LLM call.
 *   - PR6: NOT engaged — this module does not touch the R20a distress
 *     classifier, Zone 2 / Zone 3 logic, or their wrappers.
 *   - PR10: PEV — Plan (Step 1 gate), Execute (Steps 2–7), Verify (Step 8).
 *   - PR15: bespoke election justified — the report is the developer-facing
 *     companion to the existing bespoke renderAgentMode. Anthropic primitives
 *     considered: frontend-design (web UI — wrong domain); internal-comms
 *     (org messaging — wrong domain); doc-coauthoring (collaborative
 *     documents — wrong domain). No primitive substitutes for a deterministic
 *     Markdown renderer over substrate-specific data shapes. Recorded in the
 *     decision-log entry's Reasoning section.
 */

import type {
  CarriedProfile,
  CarriedCandidate,
} from './sage-assent-wrapper'

import type {
  SequentialStepResult,
  OrchestrationStepResult,
  PeerAgentAssessmentPayload,
} from './sage-assent-iteration-patterns'

import { buildAccreditationPayload } from './trust-layer/accreditation/accreditation-record'
import { isTopRungOrBeyond } from './trust-layer/card/accreditation-card'
import type { AccreditationPayload } from './trust-layer/types/accreditation'

import {
  deriveDeliberationBreadth,
  type WindowSnapshot,
  type DeliberationBreadth,
  type EvaluatedAction,
  type KathekonQuality,
} from './trust-layer/types/evaluation'

import { computeWindowSnapshot } from './trust-layer/evaluation-window/window-aggregator'

// ============================================================================
// CONSTANTS — the R-rule wrap content (developer audience)
// ============================================================================

/** R19c limitations page URL. */
const LIMITATIONS_URL = 'https://sagereasoning.com/limitations' as const

/**
 * R18a Character Kernel category-framing text — what this report measures.
 * Mirrors the agent-mode rendering's R18a wrap in substance, adapted for the
 * developer audience reading a session-end report. The text is identical-in-
 * substance to the J1 ADR's Character Kernel category language adopted
 * 2026-05-12 — observable reasoning patterns, NOT safety/ethics/trustworthiness
 * in any absolute sense.
 */
const R18A_CATEGORY_FRAMING =
  "This report measures the wrapped agent's observable reasoning patterns " +
  'as evaluated against the Stoic philosophical framework — the Character ' +
  'Kernel category. It does not measure safety, ethics, or trustworthiness ' +
  'in any absolute sense.'

/**
 * R19d mirror-principle reminder adapted for the developer audience. The
 * standard R19d framing addresses the practitioner ("a mirror onto your own
 * behaviour"); the hand-back report's audience is the practitioner's developer
 * reading about their agent.
 */
const R19D_DEVELOPER_MIRROR =
  "This report is a mirror onto your wrapped agent's reasoning patterns " +
  'across the session. It is not a verdict on you as a developer, nor on ' +
  "your agent's worth. Use it as a basis for reflection and refinement."

// ============================================================================
// TYPES
// ============================================================================

/** Optional rendering controls. */
export interface HandBackOptions {
  /**
   * When true (the default), Section 1.5 "Still under consideration" renders
   * regardless of whether the carried_candidates slot is empty (showing an
   * empty-state line). When false, the section is suppressed when empty. Per
   * Q5-elected default — always render so the developer never wonders if the
   * section exists.
   */
  readonly always_render_carried_candidates?: boolean
}

/** Input to the hand-back report renderer. */
export interface HandBackReportInput {
  /**
   * The agent's carried profile at session end — the source of the current
   * accreditation record, the carried_candidates working set, and the
   * accumulated EvaluatedAction ledger.
   */
  readonly profile: CarriedProfile

  /**
   * The session's step results, in chronological order. Each step's `profile`
   * field carries that step's just-committed EvaluatedAction at its
   * evaluated_actions array's last index; an OrchestrationStepResult also
   * carries `peer_agent_assessments` for that step.
   *
   * An empty steps[] is valid — the report renders the empty-state Section 1.
   */
  readonly steps: ReadonlyArray<SequentialStepResult | OrchestrationStepResult>

  /**
   * Optional pre-computed snapshot for determinism. When supplied, the report
   * uses it verbatim. When omitted, the report computes its own via
   * computeWindowSnapshot — which reads the clock (see module header). For
   * deterministic-test paths, always supply this.
   */
  readonly snapshot?: WindowSnapshot

  /**
   * Consumer-context flags inherited from renderAgentMode's pattern. The
   * hand-back report's preamble currently uses these only for forward-
   * compatibility — the developer-audience R18a + R19d phrasing is fixed at
   * this point. Reserved for future wiring (e.g. a future "mentor-wrapping"
   * developer voice variant).
   */
  readonly consumer_context: {
    readonly is_mentor_flavoured?: boolean
    readonly include_category_framing?: boolean
  }

  /** Optional rendering controls. */
  readonly options?: HandBackOptions
}

/** The rendered hand-back report. */
export interface HandBackReportResult {
  /**
   * The complete Markdown rendering of the report. Ends with a single
   * trailing newline. Deterministic for identical input (modulo the
   * `snapshot` parameter's clock-read behaviour — see module header).
   */
  readonly markdown: string
}

// ============================================================================
// PUBLIC RENDERER
// ============================================================================

/**
 * Render the trajectory-enriched developer hand-back report.
 *
 * The function walks `steps[]` to extract each step's committed EvaluatedAction
 * (Section 1) and any orchestrator peer_agent_assessments (Section 5); reads
 * the working set from `profile.carried_candidates` (Section 1.5); reads the
 * trajectory from the supplied or computed `snapshot` (Section 2); reads the
 * grade/authority/badge data from the AccreditationPayload-shape projection
 * of `profile.accreditation_record` (Section 3); reads persisting passions
 * from the snapshot + payload (Section 4); and wraps the whole rendering with
 * the developer-audience R3 + R18a + R19c + R19d content (preamble + signoff).
 *
 * Synchronous, deterministic (given a supplied snapshot), R3/R4/R18a/R19c/R19d-
 * respecting. No LLM call. No I/O. No randomness.
 */
export function renderAgentHandBackReport(
  input: HandBackReportInput
): HandBackReportResult {
  const { profile, steps, consumer_context, options } = input

  // Resolve the snapshot — supplied (deterministic) or computed (clock-read).
  const snapshot: WindowSnapshot =
    input.snapshot ??
    computeWindowSnapshot(
      profile.agent_id,
      [...profile.evaluated_actions],
      profile.total_actions_evaluated,
      profile.window_config
    )

  // Build the R4-compliant payload shape. The report sources its grade/
  // authority/badge data from this, NOT from the record's full internal fields.
  const payload = buildAccreditationPayload(profile.accreditation_record)

  // Walk steps[] for the per-step action ledger and any peer assessments.
  const stepActions = collectStepActions(steps)
  const latestPeers = collectLatestPeerAssessments(steps)

  // Resolve options.
  const alwaysRenderCarried = options?.always_render_carried_candidates ?? true

  // Build the report part by part. parts[] gives the Markdown blocks; the join
  // glues them with a blank line each, and a trailing newline ends the doc.
  const parts: string[] = []

  parts.push(renderPreamble(profile, consumer_context))
  parts.push(renderDecisionsSection(stepActions))

  if (alwaysRenderCarried || profile.carried_candidates.length > 0) {
    parts.push(renderCarriedCandidatesSubsection(profile.carried_candidates))
  }

  parts.push(renderTrajectorySection(snapshot))
  parts.push(renderGradeSection(payload))
  parts.push(renderPassionsSection(payload))

  if (latestPeers.length > 0) {
    parts.push(renderOrchestratorSection(latestPeers))
  }

  parts.push(renderSignoff(payload))

  const markdown = parts.join('\n\n') + '\n'
  return { markdown }
}

// ============================================================================
// HELPERS — type guards + collection
// ============================================================================

/** Type guard: does this step result carry orchestrator peer assessments? */
function isOrchestrationStep(
  step: SequentialStepResult | OrchestrationStepResult
): step is OrchestrationStepResult {
  return (step as OrchestrationStepResult).peer_agent_assessments !== undefined
}

/**
 * For each step, extract the just-committed EvaluatedAction. Each step appends
 * exactly one action to its post-accumulate profile, so the action is at the
 * evaluated_actions array's last index.
 *
 * Returns an empty array when steps[] is empty (the valid empty-state).
 */
function collectStepActions(
  steps: ReadonlyArray<SequentialStepResult | OrchestrationStepResult>
): EvaluatedAction[] {
  const actions: EvaluatedAction[] = []
  for (const step of steps) {
    const actionList = step.profile.evaluated_actions
    if (actionList.length > 0) {
      // The last action is the one this step committed.
      actions.push(actionList[actionList.length - 1] as EvaluatedAction)
    }
  }
  return actions
}

/**
 * Collect the LATEST observation of each peer agent across the session. When
 * an orchestrator runs multiple steps with overlapping peers, each peer's
 * latest assessment is what the developer wants to see at session end.
 *
 * Walks steps[] in chronological order; later observations overwrite earlier
 * ones (by agent_id key); returns the values in the order each peer's FIRST
 * appearance occurred — deterministic ordering.
 */
function collectLatestPeerAssessments(
  steps: ReadonlyArray<SequentialStepResult | OrchestrationStepResult>
): PeerAgentAssessmentPayload[] {
  // Track first-seen order alongside latest payload.
  const order: string[] = []
  const latest = new Map<string, PeerAgentAssessmentPayload>()

  for (const step of steps) {
    if (!isOrchestrationStep(step)) continue
    for (const peer of step.peer_agent_assessments) {
      if (!latest.has(peer.agent_id)) {
        order.push(peer.agent_id)
      }
      latest.set(peer.agent_id, peer)
    }
  }

  // Preserve first-appearance ordering.
  return order.map((id) => latest.get(id) as PeerAgentAssessmentPayload)
}

// ============================================================================
// HELPERS — formatting
// ============================================================================

/**
 * Human-readable label for a DeliberationBreadth bucket, with the raw N
 * surfaced alongside when the breadth was inferred from a candidates_considered
 * value > 1 (i.e. for deliberated / multi_branch_deliberated). For intuited,
 * the label stands alone — N is always 1.
 */
function deliberationBreadthLabel(
  breadth: DeliberationBreadth,
  candidates_considered: number
): string {
  switch (breadth) {
    case 'intuited':
      return 'intuited'
    case 'deliberated':
      return `deliberated (N=${candidates_considered})`
    case 'multi_branch_deliberated':
      return `multi-branch deliberated (N=${candidates_considered})`
  }
}

/**
 * Render the proximity_distribution as a compact "level: count" string.
 * Order is canonical: reflexive → habitual → deliberate → principled → sage_like.
 */
function renderProximityDistribution(
  distribution: Record<string, number>
): string {
  const order = ['reflexive', 'habitual', 'deliberate', 'principled', 'sage_like']
  return order.map((k) => `${k}: ${distribution[k] ?? 0}`).join(' · ')
}

/**
 * Render the deliberation_breadth_distribution as a compact "level: count"
 * string. Canonical order: intuited → deliberated → multi_branch_deliberated.
 */
function renderDeliberationDistribution(
  distribution: Record<string, number>
): string {
  const order: DeliberationBreadth[] = [
    'intuited',
    'deliberated',
    'multi_branch_deliberated',
  ]
  const labels: Record<DeliberationBreadth, string> = {
    intuited: 'intuited',
    deliberated: 'deliberated',
    multi_branch_deliberated: 'multi-branch deliberated',
  }
  return order.map((k) => `${labels[k]}: ${distribution[k] ?? 0}`).join(' · ')
}

/**
 * Render the kathekon_quality_distribution as a compact "level: count" string.
 * Canonical order (highest first): strong → moderate → marginal → contrary.
 * Per Decision G of the kathekon-aligned alternative build (2026-05-16).
 */
function renderKathekonQualityDistribution(
  distribution: Record<string, number>
): string {
  const order: KathekonQuality[] = ['strong', 'moderate', 'marginal', 'contrary']
  return order.map((k) => `${k}: ${distribution[k] ?? 0}`).join(' · ')
}

/**
 * Render the proximity_trajectory as a compact arrow-separated sequence. The
 * trajectory may contain many entries — for legibility this caps display at
 * the last 20 entries (with a leading "…" when truncated).
 */
function renderProximityTrajectory(trajectory: readonly string[]): string {
  const MAX = 20
  if (trajectory.length === 0) return '(no actions in window)'
  if (trajectory.length <= MAX) return trajectory.join(' → ')
  const tail = trajectory.slice(trajectory.length - MAX)
  return `… → ${tail.join(' → ')}`
}

/** Render a number as a percentage with 1 decimal place. */
function pct(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`
}

/** Bullet-list one entry; tolerates empty values. */
function bullet(line: string): string {
  return `- ${line}`
}

// ============================================================================
// SECTION RENDERERS
// ============================================================================

/**
 * The report's preamble — the R-rule wrap content the developer reads before
 * the substantive sections.
 *
 * Includes:
 *   - The title naming the agent_id.
 *   - The R18a Character Kernel category framing (what this measures).
 *   - The R19d developer-audience mirror principle (what this report is and
 *     is not).
 *   - The R19c limitations link.
 *
 * The R3 disclaimer is rendered in the signoff (it carries the verbatim
 * record.disclaimer text).
 */
function renderPreamble(
  profile: CarriedProfile,
  consumer_context: HandBackReportInput['consumer_context']
): string {
  // consumer_context is currently advisory only — the developer-audience
  // phrasing of R18a + R19d is fixed at this point. Reserved for future
  // wiring (see HandBackReportInput.consumer_context jsdoc).
  void consumer_context

  const lines: string[] = []
  lines.push(`# Agent Hand-Back Report — \`${profile.agent_id}\``)
  lines.push('')
  lines.push(`**What this measures.** ${R18A_CATEGORY_FRAMING}`)
  lines.push('')
  lines.push(`**Mirror principle.** ${R19D_DEVELOPER_MIRROR}`)
  lines.push('')
  lines.push(`**Limitations.** ${LIMITATIONS_URL}`)
  return lines.join('\n')
}

/**
 * Section 1 — Decisions. The per-action ledger of every committed decision
 * this session. Each row carries:
 *   - 1-based step index
 *   - proximity level
 *   - deliberation breadth label (with N when > 1)
 *   - whether the action was a kathekon, with quality
 *   - virtue domains engaged (if any)
 *   - passions detected (if any)
 *   - oikeiosis met (when applicable)
 *   - the skill_id (the consumer context / prose_mode)
 *   - the evaluated_at ISO timestamp
 *
 * Deterministic ordering: chronological per the input steps[] order.
 */
function renderDecisionsSection(actions: readonly EvaluatedAction[]): string {
  const lines: string[] = []
  lines.push(`## 1. Decisions (${actions.length})`)
  lines.push('')

  if (actions.length === 0) {
    lines.push('No decisions evaluated this session.')
    return lines.join('\n')
  }

  actions.forEach((action, idx) => {
    const stepNum = idx + 1
    const breadth = deriveDeliberationBreadth(action.candidates_considered)
    const breadthLabel = deliberationBreadthLabel(
      breadth,
      action.candidates_considered
    )
    const kathekonNote = action.is_kathekon
      ? `kathekon (${action.kathekon_quality})`
      : `non-kathekon (${action.kathekon_quality})`

    const virtueDomains =
      action.virtue_domains_engaged.length > 0
        ? action.virtue_domains_engaged.join(', ')
        : '(none)'

    const passionList =
      action.passions_detected.length > 0
        ? action.passions_detected
            .map((p) => `${p.root_passion}/${p.sub_species}`)
            .join(', ')
        : '(none)'

    const oikeiosisNote =
      action.oikeiosis_met === null
        ? '(not applicable)'
        : action.oikeiosis_met
          ? 'met'
          : 'not met'

    lines.push(`### Decision ${stepNum}`)
    lines.push(bullet(`**proximity:** ${action.proximity}`))
    lines.push(bullet(`**how reasoned:** ${breadthLabel}`))
    lines.push(bullet(`**kathekon:** ${kathekonNote}`))
    lines.push(bullet(`**virtue domains engaged:** ${virtueDomains}`))
    lines.push(bullet(`**passions detected:** ${passionList}`))
    lines.push(bullet(`**oikeiosis:** ${oikeiosisNote}`))
    lines.push(bullet(`**ruling faculty state:** ${action.ruling_faculty_state}`))
    lines.push(bullet(`**skill:** \`${action.skill_id}\``))
    lines.push(bullet(`**evaluated_at:** ${action.evaluated_at}`))
    lines.push('')
  })

  // Drop the trailing blank.
  return lines.join('\n').replace(/\n+$/, '')
}

/**
 * Section 1.5 — Still under consideration. The wrapper's working set of
 * unchosen-but-still-live candidates from past parallel evaluations (Decision
 * B). Top-K capped per window_config.carried_candidates_max.
 *
 * Rendered with empty-state language when the slot is empty (per Q5 elected
 * default — always render).
 *
 * R4 boundary: each candidate's `katorthoma_proximity` (the qualitative level
 * — the same field surfaced in EvaluatedAction.proximity) plus its
 * `considered_at` timestamp are surfaced. The raw layer2_assessment internals
 * are NOT exposed.
 */
function renderCarriedCandidatesSubsection(
  candidates: readonly CarriedCandidate[]
): string {
  const lines: string[] = []
  lines.push(`## 1.5. Still under consideration (${candidates.length})`)
  lines.push('')

  if (candidates.length === 0) {
    lines.push('No candidates currently held under consideration.')
    return lines.join('\n')
  }

  candidates.forEach((candidate, idx) => {
    // R4 boundary: read only the qualitative proximity from the assessment.
    const proximity = candidate.layer2_assessment.katorthoma_proximity
    lines.push(
      bullet(
        `**rank ${idx + 1}** · proximity: **${proximity}** · ` +
          `considered_at: ${candidate.considered_at}`
      )
    )
  })

  return lines.join('\n')
}

/**
 * Section 2 — Trajectory. The WindowSnapshot summary of where the agent is
 * heading: window scope, typical proximity, typical deliberation breadth,
 * direction of travel, distributions, compliance rate, virtue breadth, and
 * the proximity_trajectory sequence.
 *
 * R4 boundary: only the public-shape fields are rendered; the snapshot's
 * dimension_detail (internal confidences) is NOT surfaced.
 */
function renderTrajectorySection(snapshot: WindowSnapshot): string {
  const lines: string[] = []
  lines.push('## 2. Trajectory')
  lines.push('')
  lines.push(
    bullet(
      `**actions in window:** ${snapshot.actions_in_window} ` +
        `(lifetime: ${snapshot.total_actions_evaluated})`
    )
  )
  lines.push(bullet(`**typical proximity:** ${snapshot.typical_proximity}`))
  lines.push(
    bullet(
      `**typical deliberation breadth:** ${snapshot.typical_deliberation_breadth}`
    )
  )
  lines.push(bullet(`**direction of travel:** ${snapshot.direction_of_travel}`))
  lines.push(
    bullet(
      '**proximity distribution:** ' +
        renderProximityDistribution(snapshot.proximity_distribution)
    )
  )
  lines.push(
    bullet(
      '**deliberation breadth distribution:** ' +
        renderDeliberationDistribution(snapshot.deliberation_breadth_distribution)
    )
  )
  // Decision G (kathekon-aligned alternative build, 2026-05-16) — typical
  // kathekon quality + distribution mirror typical_deliberation_breadth +
  // deliberation_breadth_distribution directly above.
  lines.push(
    bullet(
      `**typical kathekon quality:** ${snapshot.typical_kathekon_quality}`
    )
  )
  lines.push(
    bullet(
      '**kathekon quality distribution:** ' +
        renderKathekonQualityDistribution(snapshot.kathekon_quality_distribution)
    )
  )
  lines.push(
    bullet(
      `**kathekon compliance rate:** ${pct(snapshot.kathekon_compliance_rate)}`
    )
  )
  lines.push(
    bullet(`**virtue breadth:** ${snapshot.virtue_breadth.toFixed(2)}`)
  )
  lines.push(
    bullet(
      '**proximity trajectory:** ' +
        renderProximityTrajectory(snapshot.proximity_trajectory)
    )
  )
  return lines.join('\n')
}

/**
 * Section 3 — Grade / Authority / Badge. The AccreditationPayload-shape
 * summary of the agent's current credential. Read off the payload, NOT the
 * full record — the payload is the R4-compliant external shape, which is
 * what the report surfaces.
 *
 * Includes a link to the public verification endpoint
 * (/api/accreditation/[agent_id]) so the developer can independently confirm
 * the credential from outside their own tooling.
 */
export function renderGradeSection(payload: AccreditationPayload): string {
  const lines: string[] = []
  lines.push('## 3. Grade / Authority / Badge')
  lines.push('')
  lines.push(bullet(`**Senecan grade:** ${payload.senecan_grade}`))
  lines.push(bullet(`**typical proximity:** ${payload.typical_proximity}`))
  lines.push(bullet(`**authority level:** ${payload.authority_level}`))
  // M-4 obligation 1 (mentor ruling M4-return, option (c), ADOPTED 2026-08-17;
  // built + applied 2026-08-21): disposition_stability is omitted from this
  // bullet at `principled`/`sage_like` — same rationale as, and reusing the
  // SAME predicate as, accreditation-card.ts's buildDimensionIndicators (the
  // dimension no longer certifies the agent's next possible transition at
  // either proximity). PR19 fold: this used to reimplement the check inline;
  // importing the shared predicate means the two display sites cannot drift
  // apart on which proximities count as "the top rung" — a real risk this
  // ruling's own history names (a held, rejected patch got a related check
  // wrong once already). Unchanged at `reflexive`/`habitual`/`deliberate`,
  // where disposition_stability remains a genuine, live gate input.
  const atOrBeyondTopRung = isTopRungOrBeyond(payload.typical_proximity)
  lines.push(
    bullet(
      '**dimension levels:** ' +
        `passion_reduction: ${payload.dimension_levels.passion_reduction} · ` +
        `judgement_quality: ${payload.dimension_levels.judgement_quality}` +
        (atOrBeyondTopRung
          ? ''
          : ` · disposition_stability: ${payload.dimension_levels.disposition_stability}`) +
        ` · oikeiosis_extension: ${payload.dimension_levels.oikeiosis_extension}`
    )
  )
  lines.push(
    bullet(`**direction of travel:** ${payload.direction_of_travel}`)
  )
  lines.push(
    bullet(`**evaluation window:** ${payload.evaluation_window}`)
  )
  lines.push(
    bullet(`**actions evaluated (lifetime):** ${payload.actions_evaluated}`)
  )
  lines.push(bullet(`**grade since:** ${payload.grade_since}`))
  lines.push(bullet(`**last evaluation:** ${payload.last_evaluation}`))
  lines.push(
    bullet(
      `**typical deliberation breadth:** ${payload.typical_deliberation_breadth}`
    )
  )
  // Decision G (kathekon-aligned alternative build, 2026-05-16) — parallel
  // R18a-honest credential on the payload-shape projection.
  lines.push(
    bullet(
      `**typical kathekon quality:** ${payload.typical_kathekon_quality}`
    )
  )
  lines.push(bullet(`**verify:** ${payload.verification_url}`))
  return lines.join('\n')
}

/**
 * Section 4 — Persisting passions. The recurring distortions the developer
 * should know about. The payload's `passions_persisting` is a flat
 * "root/sub" string list (the R4-compliant projection); the report renders it
 * with the empty-state language when none persist.
 */
function renderPassionsSection(payload: AccreditationPayload): string {
  const lines: string[] = []
  lines.push('## 4. Persisting Passions')
  lines.push('')

  if (payload.passions_persisting.length === 0) {
    lines.push('No passions persisting across the evaluation window.')
    return lines.join('\n')
  }

  payload.passions_persisting.forEach((p) => {
    lines.push(bullet(`**${p}**`))
  })
  return lines.join('\n')
}

/**
 * Section 5 — Peer Agents (orchestration this session). Renders only when at
 * least one step in steps[] had a non-empty peer_agent_assessments (per Q6 —
 * "render only when peers exist").
 *
 * For each unique peer (by agent_id), shows the LATEST observation —
 * grade / proximity / authority / direction-of-travel / typical-deliberation-
 * breadth — plus a hint about whether the orchestrator was holding the peer's
 * latest agent-mode rendering at session end.
 */
function renderOrchestratorSection(
  peers: readonly PeerAgentAssessmentPayload[]
): string {
  const lines: string[] = []
  lines.push(`## 5. Peer Agents (orchestration this session) — ${peers.length}`)
  lines.push('')

  peers.forEach((peer) => {
    const acc = peer.accreditation
    const latestNote =
      peer.latest_rendering !== null
        ? 'latest in-loop rendering held'
        : 'no in-loop rendering held'
    lines.push(
      bullet(
        `**${peer.agent_id}** · ${acc.senecan_grade} · ${acc.typical_proximity} · ` +
          `${acc.authority_level} · ${acc.direction_of_travel} · ` +
          `deliberation: ${acc.typical_deliberation_breadth} · ` +
          `kathekon: ${acc.typical_kathekon_quality} · ${latestNote}`
      )
    )
  })

  return lines.join('\n')
}

/**
 * Signoff — R3 evaluative disclaimer (verbatim from record.disclaimer, which
 * is ACCREDITATION_DISCLAIMER for the ported builder's seed default) plus the
 * verify URL one more time as a footer.
 */
function renderSignoff(payload: AccreditationPayload): string {
  const lines: string[] = []
  lines.push('---')
  lines.push('')
  lines.push(`**Disclaimer.** ${payload.disclaimer}`)
  lines.push('')
  lines.push(`*Verify this report's credential at ${payload.verification_url}*`)
  return lines.join('\n')
}
