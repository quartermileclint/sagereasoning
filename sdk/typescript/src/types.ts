/**
 * types.ts — request/response shapes for the SageReasoning substrate API.
 *
 * These mirror the live public contract documented in llms.txt and the agent
 * card (https://www.sagereasoning.com/.well-known/agent-card.json). They are
 * intentionally permissive on the deep nested shapes (assessment internals,
 * extraction internals) — the value of the SDK is encoding the ENVELOPE and the
 * handshakes correctly so integrators never reconstruct them from prose.
 */

export type DepthTier = 'quick' | 'standard' | 'deep'
export type ResponseFormat = 'full' | 'assessment_first'
export type RiskClass = 'standard' | 'elevated' | 'critical'

// ---- Layer-1 extraction / supplied schema (§2) -----------------------------
// The simplest valid layer1_schema is the `extraction` block returned by a prior
// consult — capture it and supply it back verbatim. See the §5 echo caveat: a
// supplied extraction re-runs the verdict over THAT situation's features.
export type Layer1Schema = Record<string, unknown>

// ---- Signed assessment envelope (§3) ---------------------------------------
// In a consult response the top-level `assessment` field is this envelope when
// production signing is on. `signature`/`key_id` cover the INNER `assessment`
// object exactly (response.assessment.assessment).
export interface SignedAssessment {
  assessment: Record<string, unknown>
  signature: string
  key_id: string
}

// ---- Re-examination (§4) ---------------------------------------------------
export interface PriorFeedback {
  /** The prior consult's assessment.examination.ref (== its X-Loop-Id header). */
  prior_loop_id: string
  /** The re-examination carries the prior depth (the same-depth rule). */
  prior_depth_tier: DepthTier
  adopted_correction?: string
}

// ---- Consult request (/api/reason) -----------------------------------------
export interface ConsultRequest {
  input: string
  context?: string
  depth?: DepthTier
  domain_context?: string
  response_format?: ResponseFormat
  /** Supplying a schema skips server Layer-1; requires the l1_supply capability. */
  layer1_schema?: Layer1Schema
  prior_feedback?: PriorFeedback
}

// ---- Clarification-continuation (§7) ---------------------------------------
export type Tier1TriggerCode = 'ELEMENT_FUSION' | 'TEMPORAL_AMBIGUITY' | 'SCOPE_AMBIGUITY'

/** Turn-1 force-clarification response — returned with HTTP 200 INSTEAD of an assessment. */
export interface ClarificationResponse {
  version: string
  clarification_required: true
  intake_tier: 1
  trigger_code: Tier1TriggerCode
  clarification: {
    question_text: string
    stem_id: string
    slot_fills: string[]
  }
  continuation_token: string
  evaluation_partial: null
  disclaimer?: string | null
}

/** Distress redirect — returned (HTTP 200) when an input carries acute distress. */
export interface DistressRedirect {
  status: 'redirected'
  severity?: string
  developer_note?: string
  /** MUST be surfaced to the end user verbatim; then terminate the flow. */
  suggested_user_message?: string
  flow_terminated: true
}

/** A full assessment response (signing on → `assessment` is a SignedAssessment). */
export interface AssessmentResponse {
  version?: string
  extraction?: Record<string, unknown>
  assessment: SignedAssessment | Record<string, unknown>
  /** null on the deferred (assessment_first) path. */
  prose?: string | null
  /** Present on the deferred path. */
  narrative?: { status: 'deferred'; correlation_id: string } | Record<string, unknown> | null
  examination_open?: boolean
  meta?: Record<string, unknown>
  [k: string]: unknown
}

export type ConsultResponse = AssessmentResponse | ClarificationResponse | DistressRedirect

// ---- Public key (§3) -------------------------------------------------------
export interface PublicKeyResponse {
  key_id: string
  algorithm: 'Ed25519'
  public_key_pem: string
  issued_at: string
  rotation_overlap_until: string | null
  previous: { key_id: string; public_key_pem: string; issued_at?: string; retires_at?: string } | null
}

// ---- Accreditation (§1) ----------------------------------------------------
export interface AccreditationWriteBody {
  kind: 'seed' | 'update'
  profile: {
    agent_id: string
    accreditation_record: Record<string, unknown>
    regressing_check_count: number
    [k: string]: unknown
  }
  /** Required when kind === 'update'. */
  transition_result?: { grade_changed: boolean; record: Record<string, unknown> }
  provenance: {
    /** Non-empty. Each element is a prior consult's SignedAssessment, verbatim. */
    signed_assessments: SignedAssessment[]
  }
}

export interface AccreditationWriteResponse {
  status: 'ok'
  documentation_url?: string
  loop_closure?: {
    verdict: string
    redirections: number
    closed: number
    open: number
    indeterminate: number
  }
  practice?: { reflect_due: string; endpoint: string; default: string; opt_out: string }
  [k: string]: unknown
}

export interface AccreditationReadResponse {
  status: 'ok'
  data: {
    agent_id: string
    senecan_grade?: string
    typical_proximity?: string
    authority_level?: string
    direction_of_travel?: string
    actions_evaluated?: number
    /** Server-composed, consumer-unforgeable; conservative default 'contrary'. */
    typical_kathekon_quality?: string
    /** Server-composed; 'agent_elected' for a discretionary single-session seed. */
    coverage_status?: string
    credential_basis?: string
    [k: string]: unknown
  }
}
