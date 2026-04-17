/**
 * public-endpoint.ts — Public Accreditation Verification Endpoint
 *
 * GET /accreditation/{agent_id} — returns the verifiable credential.
 *
 * This is a read-only endpoint serving the AccreditationPayload.
 * Any system — platform, agent, or human — can query it to check
 * an agent's current trust level.
 *
 * Priority 1: Foundation endpoint.
 *
 * Rules:
 *   R3:  Disclaimer always present
 *   R4:  Returns grade + dimensions, never internal logic
 *   R9:  Evaluates reasoning quality, does not promise outcomes
 */

import type { AccreditationPayload } from '../types/accreditation'
import {
  buildAccreditationPayload,
  isValidAgentId,
  isExpired,
} from './accreditation-record'

// ============================================================================
// REQUEST / RESPONSE TYPES
// ============================================================================

export type AccreditationRequest = {
  agent_id: string
}

export type AccreditationEndpointResponse =
  | { status: 'ok'; data: AccreditationPayload }
  | { status: 'not_found'; message: string }
  | { status: 'expired'; message: string; data: AccreditationPayload }
  | { status: 'error'; message: string }

// ============================================================================
// ENDPOINT HANDLER
// ============================================================================

/**
 * Handle a GET /accreditation/{agent_id} request.
 *
 * In production, this would query Supabase. For now, it defines the
 * complete handler logic that will wrap the DB query.
 *
 * @param agentId - The agent_id from the URL path
 * @param lookupFn - Function to look up the accreditation record from storage
 * @returns AccreditationEndpointResponse
 */
export async function handleAccreditationLookup(
  agentId: string,
  lookupFn: (agentId: string) => Promise<import('../types/accreditation').AccreditationRecord | null>
): Promise<AccreditationEndpointResponse> {
  // Validate agent_id format
  if (!isValidAgentId(agentId)) {
    return {
      status: 'error',
      message: 'Invalid agent_id format. Expected: agent_{org}_{version}',
    }
  }

  // Look up the record
  const record = await lookupFn(agentId)

  if (!record) {
    return {
      status: 'not_found',
      message: `No accreditation record found for agent: ${agentId}. ` +
        'The agent may need to complete onboarding assessment first.',
    }
  }

  // Build the public payload
  const payload = buildAccreditationPayload(record)

  // Check expiry
  if (isExpired(record)) {
    return {
      status: 'expired',
      message: 'This accreditation has expired and requires re-evaluation. ' +
        'The last known grade is included for reference.',
      data: payload,
    }
  }

  return {
    status: 'ok',
    data: payload,
  }
}

// ============================================================================
// BATCH LOOKUP — for platforms verifying multiple agents
// ============================================================================

export type BatchLookupRequest = {
  agent_ids: string[]
}

export type BatchLookupResponse = {
  results: Record<string, AccreditationEndpointResponse>
  total_requested: number
  total_found: number
  total_expired: number
}

/**
 * Handle a batch lookup for multiple agents.
 * Platforms use this to verify a fleet of agents at once.
 *
 * @param agentIds - Array of agent_ids to look up
 * @param lookupFn - Function to look up individual records
 * @returns BatchLookupResponse
 */
export async function handleBatchLookup(
  agentIds: string[],
  lookupFn: (agentId: string) => Promise<import('../types/accreditation').AccreditationRecord | null>
): Promise<BatchLookupResponse> {
  // Cap at 50 agents per batch request
  const cappedIds = agentIds.slice(0, 50)

  const results: Record<string, AccreditationEndpointResponse> = {}
  let totalFound = 0
  let totalExpired = 0

  // Look up each agent (in production, this would be a batch DB query)
  for (const agentId of cappedIds) {
    const response = await handleAccreditationLookup(agentId, lookupFn)
    results[agentId] = response

    if (response.status === 'ok') totalFound++
    if (response.status === 'expired') {
      totalFound++
      totalExpired++
    }
  }

  return {
    results,
    total_requested: cappedIds.length,
    total_found: totalFound,
    total_expired: totalExpired,
  }
}

// ============================================================================
// RESPONSE HEADERS — for caching and CORS
// ============================================================================

/**
 * Standard response headers for accreditation endpoints.
 */
export const ACCREDITATION_RESPONSE_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=300',  // 5 min cache — grade changes are event-driven
  'X-SageReasoning-Version': '2.0',
  'X-Accreditation-Disclaimer': 'Evaluates reasoning quality. Does not promise outcomes.',
  'Access-Control-Allow-Origin': '*',       // Public endpoint
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const
