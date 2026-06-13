/**
 * PORTED — verbatim mirror of /trust-layer/accreditation/agent-id-vocabulary.ts
 *
 * Source of truth: /trust-layer/accreditation/agent-id-vocabulary.ts
 *   (created 2026-06-13 under the mechanism-correction M3 accreditation session).
 * See ../types/accreditation.ts banner for why the /trust-layer/ closure is
 * ported into website/'s tsconfig rather than imported across the boundary.
 *
 * KEEP IN SYNC: if /trust-layer/accreditation/agent-id-vocabulary.ts changes,
 *   re-port it here in the same change. Everything below the banner is a
 *   VERBATIM copy.
 * ===========================================================================
 */

/**
 * agent-id-vocabulary.ts — the ONE agent_id vocabulary for the accreditation
 * surface (CI-12, mechanism-correction M3).
 *
 * WHY THIS MODULE EXISTS (FX-11, founder-adjudicated Box-1 catch). Before
 * 2026-06-13 the write boundary (POST /api/accreditation/[agent_id] + the A10
 * mint surface) accepted ANY non-empty agent_id while the public GET validated
 * /^agent_[a-z0-9_]+$/i — so a written record could be structurally unreadable
 * through its own public read path (the P1 leg-B repro: id
 * `p1-comparison-leg-b-agent` wrote 200 and read 400). The reconcile invariant
 * this module enforces BY CONSTRUCTION: the write boundary and the public read
 * path call the SAME validator, so write-accepted ⇒ read-accepted always.
 *
 * THE CANONICAL FORM (K1 ADR governs — carry, don't re-derive):
 *   /adopted/adr/2026-05-26-credential-scope-and-coverage-status.md names the
 *   agent identity `namespace:name@version`, "named like a package":
 *
 *     namespace : name @ version        e.g.  acme:support-bot@v1
 *
 *   - namespace — the publisher/operator namespace (lowercase by convention)
 *   - name      — the agent's name; permits the K1 fork form
 *                 `you:fork-of(publisher:name)@v1` (parens + inner colon)
 *   - version   — developer-declared version or content-hash (K1 coarse
 *                 granularity: a material change forks the identity)
 *
 * THE LEGACY FORM (grandfathered): `agent_{org}_{version}` — the pre-K1
 * pattern the public GET has validated since 2026-05-16. Existing rows and
 * credentials in this form remain writable + readable. The pattern is
 * preserved BYTE-IDENTICAL to the original isValidAgentId regex so no
 * previously-readable id loses readability.
 *
 * What is REJECTED now (at write as well as read): free-form ids matching
 * neither form. The shared error message names both accepted forms.
 *
 * PURE — no I/O, no env, no imports. Founder-elected shape 2026-06-13:
 * "Both, shared validator" (CI-12 election, M3 session).
 */

/**
 * K1 canonical `namespace:name@version`.
 *   namespace: [a-z0-9][a-z0-9._-]{0,63}   — simple package-like token
 *   name:      [a-z0-9(][a-z0-9._:()-]{0,127} — permits the fork form's
 *              parens + inner colon; '@' excluded so the version split is
 *              unambiguous (exactly one '@' can appear in a valid id)
 *   version:   [a-z0-9][a-z0-9._-]{0,63}   — declared version or content-hash
 * Case-insensitive; lowercase is the documented convention.
 */
export const CANONICAL_AGENT_ID_PATTERN =
  /^[a-z0-9][a-z0-9._-]{0,63}:[a-z0-9(][a-z0-9._:()-]{0,127}@[a-z0-9][a-z0-9._-]{0,63}$/i

/**
 * Legacy `agent_{org}_{version}` — byte-identical to the original
 * isValidAgentId regex (accreditation-record.ts, 2026-05-16). Grandfathered:
 * every id readable before CI-12 stays readable after it.
 */
export const LEGACY_AGENT_ID_PATTERN = /^agent_[a-z0-9_]+$/i

/** True iff the id is in the K1 canonical `namespace:name@version` form. */
export function isCanonicalAgentId(agentId: string): boolean {
  return CANONICAL_AGENT_ID_PATTERN.test(agentId)
}

/** True iff the id is in the grandfathered legacy `agent_*` form. */
export function isLegacyAgentId(agentId: string): boolean {
  return LEGACY_AGENT_ID_PATTERN.test(agentId)
}

/**
 * THE shared validator — the single source of truth for what the accreditation
 * surface accepts, consumed by BOTH the write boundary (POST handler + A10
 * mint validation) and the public read path (isValidAgentId →
 * handleAccreditationLookup + the route's card path). Because both sides call
 * this one function, the CI-12 invariant — every writable record is readable
 * through the public GET — holds by construction.
 */
export function isAcceptedAgentId(agentId: string): boolean {
  return isCanonicalAgentId(agentId) || isLegacyAgentId(agentId)
}

/**
 * The shared rejection message. Served verbatim by the public GET (400), the
 * POST write boundary (400), and the A10 mint surface (400) — one vocabulary,
 * one message, no drift.
 */
export const AGENT_ID_FORMAT_MESSAGE =
  'Invalid agent_id format. Expected the canonical form namespace:name@version ' +
  '(e.g. acme:support-bot@v1) or the legacy form agent_{org}_{version}.'
