/**
 * longitudinal-identity.ts — the canonical identity-resolution module for every
 * longitudinal read (ADR-014 §4, AE-1).
 *
 * THE ONE-RECORD RULE'S IDENTITY HALF: the agent's practice trajectory is ONE
 * record keyed on the canonical identity `(owner_user_id, agent_id)` — the UPC
 * identity, whose uniqueness is the owner+agent PAIR (`agent_id` alone is NOT
 * owner-unique — the S10 cross-tenant finding). Every longitudinal read goes
 * through this module so the three physical stores (trajectory on
 * `credential_ref`; trust state on `(agent_id, virtue_domain)`; reflect on
 * un-owner-scoped `agent_id`) can never grow a fourth, divergent key.
 *
 * PURE — no I/O, no env reads, no clock. Physical store keys are UNCHANGED by
 * this module (no migration; ADR-014 §4): trajectory rows stay keyed on
 * `credential_ref` (R17a subject-credential scoping preserved). This module
 * RESOLVES what identity a credential context denotes and what an
 * identity-scoped surface must DISCLOSE when its read is narrower than the
 * canonical identity.
 *
 * CROSS-TENANT STRUCTURAL GUARD (ADR-014 §4): no resolution here ever yields an
 * agent_id-only key. An agent-declared but owner-less credential (the live
 * s9-loop consult credential's shape — `external_consumer`, owner NULL,
 * agent-bound) resolves to the CREDENTIAL scope with the pair-join REFUSED,
 * because a `(null, agent_id)` join would aggregate any owner-less credential
 * claiming that agent_id. This is discipline pre-0h and load-bearing before
 * external multi-tenant onboarding.
 *
 * ROTATION (ADR-014 §4): where a read does not join across the identity's
 * credentials (v1 builds no join — the windowed read stays ONE indexed query,
 * KG1), the surface must disclose that a credential rotation truncates the
 * window rather than silently presenting a fresh-start trend. A rotation must
 * never manufacture a clean slate. For an UNDECLARED credential the credential
 * IS the identity (the A10 `install:{install_id}` floor — the mentor's
 * per-install identifier honored as the floor, not the canon); nothing links a
 * rotated undeclared credential to its predecessor, and that floor is the
 * documented semantic, not a truncation.
 */

/** The resolved longitudinal identity for a credential context. */
export type LongitudinalIdentity =
  | {
      /** The canonical `(owner_user_id, agent_id)` pair — the UPC identity. */
      kind: 'owner_agent_pair'
      owner_user_id: string
      agent_id: string
      /** The presenting credential (the physical read key in v1). */
      credential_ref: string
    }
  | {
      /** The credential-scope fallback (ADR-014 §4 fallback chain). */
      kind: 'credential'
      credential_ref: string
      /** True when an agent_id was declared but the pair join was REFUSED
       *  (owner-less credential — the cross-tenant guard). False when no
       *  agent_id was declared (the identity floor). */
      agent_declared: boolean
    }

export interface LongitudinalIdentityInput {
  /** Stable per-credential handle: 'api_key:<id>' | 'install:<id>'. */
  credentialRef: string
  /** The credential's operator (owner) — null when owner-less. */
  ownerUserId: string | null
  /** The K1 declared agent identity — null when undeclared. */
  agentId: string | null
}

/**
 * Resolve the canonical longitudinal identity for a credential context.
 * ADR-014 §4 fallback chain: the pair when owner AND agent are both present →
 * `credential_ref` otherwise (which subsumes the A10 install identity).
 * An agent-declared owner-less credential deliberately does NOT resolve to any
 * agent-keyed identity (cross-tenant guard) — it is credential-scoped with
 * `agent_declared: true` so the surface can disclose the narrower scope.
 */
export function resolveLongitudinalIdentity(
  input: LongitudinalIdentityInput,
): LongitudinalIdentity {
  if (input.ownerUserId !== null && input.agentId !== null) {
    return {
      kind: 'owner_agent_pair',
      owner_user_id: input.ownerUserId,
      agent_id: input.agentId,
      credential_ref: input.credentialRef,
    }
  }
  return {
    kind: 'credential',
    credential_ref: input.credentialRef,
    agent_declared: input.agentId !== null,
  }
}

/** The scope disclosure an identity-scoped longitudinal surface carries when
 *  its physical read is the presenting credential's rows only (v1 — no
 *  cross-credential join is built). Record-descriptive; never predictive. */
export interface WindowScopeDisclosure {
  /** v1 reads are always scoped to the presenting credential's own rows. */
  window_scope: 'presenting_credential'
  /** The canonical identity kind the scope may be narrower than. */
  canonical_identity: 'owner_agent_pair' | 'credential'
  agent_declared: boolean
  /** The ADR-014 §4 rotation disclosure — present whenever the identity is
   *  broader than one credential (pair) or a rotation is linkable in principle
   *  (agent-declared), so a rotated credential's earlier history being absent
   *  is DISCLOSED, never a silent fresh start. Null for undeclared credentials
   *  (the credential IS the identity floor — a new credential is a new
   *  identity by construction, and that semantic is documented, not hidden). */
  rotation_note: string | null
}

/** ADR-014 §4's disclosure wording — exported so tests lock the exact clause. */
export const ROTATION_TRUNCATION_NOTE =
  'window truncated by credential rotation: this window is scoped to the ' +
  'presenting credential and does not join the identity’s other or prior ' +
  'credentials; history under a rotated credential is not included.'

/**
 * Describe the window scope for a v1 (single-credential) longitudinal read of
 * the given identity. PURE.
 */
export function describeWindowScope(
  identity: LongitudinalIdentity,
): WindowScopeDisclosure {
  if (identity.kind === 'owner_agent_pair') {
    return {
      window_scope: 'presenting_credential',
      canonical_identity: 'owner_agent_pair',
      agent_declared: true,
      rotation_note: ROTATION_TRUNCATION_NOTE,
    }
  }
  return {
    window_scope: 'presenting_credential',
    canonical_identity: 'credential',
    agent_declared: identity.agent_declared,
    // Agent-declared (owner-less): the identity COULD span rotated credentials
    // (the live gen-1→gen-2 s9-loop instance) — disclose the truncation.
    // Undeclared: the credential is the identity floor; no truncation exists.
    rotation_note: identity.agent_declared ? ROTATION_TRUNCATION_NOTE : null,
  }
}
