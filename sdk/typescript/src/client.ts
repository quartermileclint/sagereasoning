/**
 * client.ts — a thin, dependency-free TypeScript client for the SageReasoning
 * substrate API. Encodes the live public contract ONCE so integrators never
 * reconstruct request/response shapes from prose:
 *
 *   - consult (/api/reason) incl. response_format:'assessment_first',
 *     layer1_schema reuse (+ the §5 echo caveat), and prior_feedback (§4)
 *   - the clarification-continuation round-trip (§7): keep the byte-identical
 *     input, carry continuation_token + clarification_response
 *   - signature verification (§3): the canonical-form footgun, over
 *     response.assessment.assessment
 *   - accreditation write (§1): the provenance.signed_assessments round-trip,
 *     plus the public read-back
 *
 * Runtime: Node 18+ (global fetch + node:crypto). No third-party dependencies.
 *
 * Faithful to: website/public/llms.txt and /.well-known/agent-card.json
 * (Mechanism-correction Part C, 2026-06-19).
 */

import { createPublicKey, verify as cryptoVerify } from 'node:crypto'
import { canonicalise } from './canonical-json.js'
import type {
  AccreditationReadResponse,
  AccreditationWriteBody,
  AccreditationWriteResponse,
  AssessmentResponse,
  ClarificationResponse,
  ConsultRequest,
  ConsultResponse,
  DistressRedirect,
  PublicKeyResponse,
  SignedAssessment,
} from './types.js'

export * from './types.js'
export { CanonicalisationError } from './canonical-json.js'

const DEFAULT_BASE_URL = 'https://www.sagereasoning.com'

export interface SageClientOptions {
  /** A bearer credential: sr_live_ / sr_prac_ / sr_inst_. */
  apiKey: string
  /** Defaults to https://www.sagereasoning.com */
  baseUrl?: string
  /** Override the fetch implementation (e.g. for tests). Defaults to global fetch. */
  fetchImpl?: typeof fetch
}

/** Thrown when the API returns a non-2xx status. Carries the parsed body. */
export class SageApiError extends Error {
  readonly status: number
  readonly body: unknown
  constructor(status: number, body: unknown) {
    const detail =
      body && typeof body === 'object' && 'error' in (body as Record<string, unknown>)
        ? String((body as Record<string, unknown>).error)
        : `HTTP ${status}`
    super(`SageReasoning API error (${status}): ${detail}`)
    this.name = 'SageApiError'
    this.status = status
    this.body = body
  }
}

// ---- Response narrowing helpers --------------------------------------------

export function isClarificationRequired(r: ConsultResponse): r is ClarificationResponse {
  return (r as ClarificationResponse).clarification_required === true
}

export function isDistressRedirect(r: ConsultResponse): r is DistressRedirect {
  return (r as DistressRedirect).status === 'redirected'
}

export function isAssessment(r: ConsultResponse): r is AssessmentResponse {
  return !isClarificationRequired(r) && !isDistressRedirect(r)
}

function isSignedAssessment(a: unknown): a is SignedAssessment {
  return (
    !!a &&
    typeof a === 'object' &&
    'assessment' in (a as Record<string, unknown>) &&
    typeof (a as Record<string, unknown>).signature === 'string' &&
    typeof (a as Record<string, unknown>).key_id === 'string'
  )
}

export class SageReasoningClient {
  private readonly apiKey: string
  private readonly baseUrl: string
  private readonly fetchImpl: typeof fetch
  private publicKeyCache: PublicKeyResponse | null = null

  constructor(opts: SageClientOptions) {
    if (!opts.apiKey) throw new Error('SageReasoningClient: apiKey is required.')
    this.apiKey = opts.apiKey
    this.baseUrl = (opts.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '')
    const f = opts.fetchImpl ?? globalThis.fetch
    if (!f) throw new Error('SageReasoningClient: no fetch implementation (need Node 18+ or pass fetchImpl).')
    this.fetchImpl = f
  }

  private async request<T>(path: string, init: RequestInit & { auth?: boolean }): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string> | undefined),
    }
    if (init.auth !== false) headers['Authorization'] = `Bearer ${this.apiKey}`
    const res = await this.fetchImpl(`${this.baseUrl}${path}`, { ...init, headers })
    const text = await res.text()
    const body = text ? safeJson(text) : null
    if (!res.ok) throw new SageApiError(res.status, body)
    return body as T
  }

  // ---- Consult (§2/§4/§7) --------------------------------------------------

  /**
   * Run a full Stoic reasoning consult. The response is one of:
   *   - an assessment (use isAssessment) — `assessment` is a SignedAssessment
   *     when production signing is on (verify with verifyAssessment)
   *   - a force-clarification (use isClarificationRequired) — answer it with
   *     continueClarification, keeping the byte-identical input
   *   - a distress redirect (use isDistressRedirect) — surface
   *     suggested_user_message verbatim and stop
   *
   * Note (§5 echo caveat): supplying `layer1_schema` re-runs the verdict over
   * THAT situation's features. Reuse it only to re-examine the SAME situation;
   * for a new question omit it (let the server extract) or compute a fresh one.
   */
  consult(req: ConsultRequest): Promise<ConsultResponse> {
    return this.request<ConsultResponse>('/api/reason', {
      method: 'POST',
      body: JSON.stringify(req),
    })
  }

  /**
   * Answer a turn-1 force-clarification (§7). Resubmit the ORIGINAL input
   * byte-for-byte — the token binds to sha256(input); any change returns 400
   * continuation_token_input_mismatch. The answer rides its own field and is
   * never folded into input. A different Tier-1 trigger may still fire (never
   * the same one twice).
   *
   * For supplied-schema (l1_supply / plugin) callers: you cannot combine an
   * answer with layer1_schema (400 clarification_response_with_supplied_layer1_schema).
   * Resume by re-submitting a disambiguated layer1_schema via consult() instead.
   */
  continueClarification(args: {
    /** The ORIGINAL turn-1 input, byte-for-byte identical. */
    input: string
    /** The continuation_token from the turn-1 response. */
    continuationToken: string
    /** Your answer to clarification.question_text (<=5000 chars). */
    clarificationResponse: string
    context?: string
    depth?: ConsultRequest['depth']
    domain_context?: string
    response_format?: ConsultRequest['response_format']
  }): Promise<ConsultResponse> {
    const { input, continuationToken, clarificationResponse, ...rest } = args
    return this.request<ConsultResponse>('/api/reason', {
      method: 'POST',
      body: JSON.stringify({
        input,
        continuation_token: continuationToken,
        clarification_response: clarificationResponse,
        ...rest,
      }),
    })
  }

  // ---- Signature verification (§3) -----------------------------------------

  /** GET /api/public-key (no auth). Cached on the instance after first fetch. */
  async getPublicKey(force = false): Promise<PublicKeyResponse> {
    if (!force && this.publicKeyCache) return this.publicKeyCache
    const pk = await this.request<PublicKeyResponse>('/api/public-key', { method: 'GET', auth: false })
    this.publicKeyCache = pk
    return pk
  }

  /**
   * Verify a SignedAssessment against the published Ed25519 key. The signature
   * covers the INNER assessment object exactly — pass the `assessment` field of
   * a consult response (response.assessment, which IS the SignedAssessment).
   *
   * The canonical form is the footgun: sorted keys at every level, compact
   * separators, raw UTF-8 (see canonical-json.ts). An ASCII-escaped
   * canonicaliser would NOT verify.
   */
  async verifyAssessment(signed: SignedAssessment): Promise<boolean> {
    if (!isSignedAssessment(signed)) {
      throw new Error(
        'verifyAssessment: expected { assessment, signature, key_id }. Pass response.assessment ' +
          '(the SignedAssessment envelope), not response.assessment.assessment.',
      )
    }
    const pem = await this.pemForKeyId(signed.key_id)
    if (!pem) throw new Error(`verifyAssessment: no published key matches key_id "${signed.key_id}".`)
    const canonical = canonicalise(signed.assessment)
    return cryptoVerify(
      null,
      Buffer.from(canonical, 'utf8'),
      createPublicKey(pem),
      Buffer.from(signed.signature, 'base64'),
    )
  }

  /** Convenience: verify the assessment carried by a consult response. */
  async verifyConsult(r: AssessmentResponse): Promise<boolean> {
    if (!isSignedAssessment(r.assessment)) {
      throw new Error(
        'verifyConsult: response.assessment is not signed (production signing may be off, or this is a ' +
          'deferred/clarification response).',
      )
    }
    return this.verifyAssessment(r.assessment)
  }

  private async pemForKeyId(keyId: string): Promise<string | null> {
    const pk = await this.getPublicKey()
    if (pk.key_id === keyId) return pk.public_key_pem
    if (pk.previous && pk.previous.key_id === keyId) return pk.previous.public_key_pem
    // Stale cache during a rotation: refetch once.
    const fresh = await this.getPublicKey(true)
    if (fresh.key_id === keyId) return fresh.public_key_pem
    if (fresh.previous && fresh.previous.key_id === keyId) return fresh.previous.public_key_pem
    return null
  }

  // ---- Accreditation (§1) --------------------------------------------------

  /**
   * Write a verifiable reasoning profile. The provenance round-trip: capture one
   * or more prior consults' `assessment` field (each IS a SignedAssessment) and
   * submit them as a NON-EMPTY provenance.signed_assessments array. The R18f
   * gate requires at least one to cryptographically verify (403 no_examination
   * otherwise; 422 bad_provenance on a malformed/empty array).
   *
   * Requires a credential carrying the accreditation_write capability (sr_prac_).
   */
  writeAccreditation(agentId: string, body: AccreditationWriteBody): Promise<AccreditationWriteResponse> {
    if (!body.provenance?.signed_assessments?.length) {
      throw new Error(
        'writeAccreditation: provenance.signed_assessments must be a non-empty array of prior ' +
          'consult SignedAssessments (else the R18f gate returns 422 bad_provenance).',
      )
    }
    if (body.profile?.agent_id !== agentId) {
      throw new Error('writeAccreditation: body.profile.agent_id must equal the path agentId.')
    }
    return this.request<AccreditationWriteResponse>(`/api/accreditation/${encodeURIComponent(agentId)}`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  /** Public read-back (no auth). Server-composed fields are consumer-unforgeable. */
  readAccreditation(agentId: string): Promise<AccreditationReadResponse> {
    return this.request<AccreditationReadResponse>(`/api/accreditation/${encodeURIComponent(agentId)}`, {
      method: 'GET',
      auth: false,
    })
  }

  /**
   * Helper for the round-trip: extract the SignedAssessment from a consult
   * response to drop straight into provenance.signed_assessments.
   */
  static provenanceFrom(...responses: AssessmentResponse[]): SignedAssessment[] {
    const out: SignedAssessment[] = []
    for (const r of responses) {
      if (isSignedAssessment(r.assessment)) out.push(r.assessment)
    }
    return out
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}
