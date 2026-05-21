/**
 * agent-card.ts — Sage Calling optional Agent Card verification (D-13).
 *
 * Built at the Sage Calling build Stage 2 — the Critical public-surface half
 * (see /operations/handoffs/founder/2026-05-21-sage-calling-stage2-endpoint-NEXT-SESSION-PROMPT.md).
 * Implements D-13 of /adopted/purpose-discovery-product-design.md:
 *   "Accept an optional `agent_card_url`; DECLINE `available_tools`."
 *
 * WHAT THIS IS
 * -----------
 * A PURE verifier for an A2A Agent Card the developer optionally supplies via
 * `agent_card_url`. The route performs the actual HTTPS fetch (I/O); this module
 * decides whether the fetched card is trustworthy and what — if anything — it
 * contributes to signal detection.
 *
 * THE D-13 DISCIPLINE (binding)
 * -----------------------------
 *  • The Agent Card is a VERIFIABLE external A2A declaration — the engine MAY
 *    consult it, but it NEVER substitutes for the agent's own response. It feeds
 *    ONLY the chosen-role persona hint used when the five-spec handoff is built
 *    (buildDiscoveredPurpose); it never short-circuits a stage.
 *  • The card is NEVER trusted at face value (R18d). It must be:
 *      (1) fetched over HTTPS (the route enforces the scheme; re-checked here),
 *      (2) a well-formed JSON object,
 *      (3) NON-SPOOFED — if the card self-declares a `url`, that URL's origin
 *          MUST match the origin the card was fetched from. A card claiming to
 *          live somewhere other than where it was served is rejected.
 *  • `available_tools` / `skills` / capability CLAIMS are NEVER read as evidence
 *    of capacity (R18d's MCP tool-poisoning vector). The agent's own Q2 response
 *    is the only capacity evidence. This module explicitly ignores those fields.
 *
 * A verified card yields a `role_hint` of 'chosen_role' (the card IS the agent's
 * formal commitment to what it does — exactly the chosen-role persona). An
 * unverified / absent / spoofed card yields no hint (null) and the role defaults
 * downstream. R18d adversarial tests exercise the spoof + poisoned-claim paths.
 */

import type { DiscoveredPurposeRole } from '@/lib/translation-sandwich/layer1-extractor'

// ============================================================================
// TYPES
// ============================================================================

/** The result of the route's HTTPS fetch, handed to the pure verifier. */
export type FetchedCard =
  | { ok: true; status: number; body: unknown }
  | { ok: false; error: string }

/** The verifier's verdict. `reason` is engine-internal (R4) — never surfaced. */
export interface AgentCardVerification {
  /** True only when the card passed every check (https, object, non-spoofed). */
  verified: boolean
  /** 'chosen_role' on a verified card; null otherwise. Feeds buildDiscoveredPurpose only. */
  role_hint: DiscoveredPurposeRole | null
  /** Short engine-internal note on the verdict. */
  reason: string
}

// ============================================================================
// HTTPS CHECK
// ============================================================================

/** True only for a well-formed https:// URL. http:// and anything unparsable
 *  are rejected (a card must be served over TLS to be verifiable). */
export function isHttpsUrl(url: string): boolean {
  try {
    return new URL(url).protocol === 'https:'
  } catch {
    return false
  }
}

/** Origin (protocol + host + port) of a URL, or null if unparsable. */
function originOf(url: string): string | null {
  try {
    return new URL(url).origin
  } catch {
    return null
  }
}

// ============================================================================
// VERIFY
// ============================================================================

/**
 * Verify a fetched Agent Card against the URL it was supposed to be served from.
 * Pure — no I/O. The route fetches; this decides.
 *
 * @param suppliedUrl  the developer-supplied agent_card_url (the fetch target)
 * @param fetched      the route's fetch outcome (parsed JSON body or an error)
 */
export function verifyAgentCard(suppliedUrl: string, fetched: FetchedCard): AgentCardVerification {
  const no = (reason: string): AgentCardVerification => ({ verified: false, role_hint: null, reason })

  // (1) HTTPS only — re-checked here even though the route also enforces it.
  if (!isHttpsUrl(suppliedUrl)) {
    return no(`agent_card_url is not https: ${suppliedUrl.slice(0, 60)}`)
  }

  // Fetch must have succeeded with a 2xx and a parseable body.
  if (!fetched.ok) {
    return no(`fetch failed: ${fetched.error}`)
  }
  if (fetched.status < 200 || fetched.status >= 300) {
    return no(`non-2xx status: ${fetched.status}`)
  }
  if (typeof fetched.body !== 'object' || fetched.body === null || Array.isArray(fetched.body)) {
    return no('card body is not a JSON object')
  }

  const card = fetched.body as Record<string, unknown>

  // (3) Anti-spoofing — if the card self-declares a url, its ORIGIN must match
  //     the origin we fetched it from. A2A Agent Cards carry a `url`; a card that
  //     claims to live elsewhere than where it was served is a spoof attempt.
  const declaredUrl = typeof card.url === 'string' ? card.url : null
  if (declaredUrl !== null) {
    const declaredOrigin = originOf(declaredUrl)
    const fetchedOrigin = originOf(suppliedUrl)
    if (declaredOrigin === null) {
      return no(`card declares an unparsable url: ${declaredUrl.slice(0, 60)}`)
    }
    if (declaredOrigin !== fetchedOrigin) {
      // Spoof: the card claims a different origin than where it was served.
      return no(`spoof: card url origin ${declaredOrigin} != fetch origin ${fetchedOrigin}`)
    }
  }

  // NOTE (R18d): we deliberately do NOT read card.available_tools / card.skills /
  // card.capabilities as evidence of agent capacity. Those are unverifiable
  // self-claims (the MCP tool-poisoning vector). They contribute NOTHING to the
  // verdict or the role_hint. Only the agent's own Q2 response is capacity
  // evidence. A poisoned card that inflates its tool list still yields at most a
  // chosen-role hint — never a capacity claim.

  // A verified card is the agent's formal A2A commitment to what it does — the
  // chosen-role persona. That is the ONLY thing a verified card contributes.
  return {
    verified: true,
    role_hint: 'chosen_role',
    reason: declaredUrl
      ? 'verified: https, object, origin-matched'
      : 'verified: https, object, no self-declared url to spoof-check',
  }
}
