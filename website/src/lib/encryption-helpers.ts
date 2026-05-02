/**
 * encryption-helpers.ts — D14b-specific encryption wrappers (R17b)
 *
 * Wraps the existing `server-encryption.ts` AES-256-GCM module with helpers
 * that match D14b's schema shape for `open_deferrals` and
 * `deferral_resolutions`:
 *
 *   - ciphertext column (TEXT, base64-encoded)
 *   - encryption_meta column (JSONB, plain object — NOT stringified per KG7)
 *
 * Architectural commitment: ADR-ENCRYPTION-WIRING-01 (Adopted 2026-05-02).
 *
 *   - §Decision 1 — Reuses `server-encryption.ts` (encryptProfileData /
 *     decryptProfileData / ServerEncryptedPayload).
 *   - §Decision 2 — Reuses the `MENTOR_ENCRYPTION_KEY` env var (single key
 *     for all server-side intimate data).
 *   - §Decision 3 — Per-column shape: ciphertext column + companion meta
 *     JSONB column.
 *
 * Canonical wiring precedent: `mentor-profile-store.ts`. The encryption_meta
 * object MUST be passed to Supabase as a plain object, not JSON.stringify-ed
 * (see KG7 in /operations/knowledge-gaps.md). This module's shape enforces
 * the discipline by returning meta as a plain object literal.
 *
 * R17 footprint:
 *   - R17b — application-level encryption beyond database-level encryption.
 *   - R17e — passion profiling / intimate data is never exposed via API; the
 *     route consuming these helpers must enforce founder-only auth per D14b.
 *   - R17f — encryption changes follow the Critical Change Protocol (0c-ii);
 *     this module's introduction is the operative-Critical event for the
 *     encryption-wiring implementation per ADR-ENCRYPTION-WIRING-01.
 *
 * AC4 invocation testing:
 *   - The companion test file `__tests__/encryption-helpers.test.ts`
 *     exercises round-trip + shape invariants on the helpers themselves.
 *   - At Phase-2 pass-1 commencement (separate Critical session), the new
 *     route's import + call patterns will be added to AC4 invocation testing
 *     alongside the R20a perimeter ninth-route addition.
 *
 * Naming conventions:
 *   - `encryptForStorage` / `decryptFromStorage` — generic; usable for any
 *     encrypted column in any table that follows the per-column shape.
 *   - `encryptDeferralPayload` / `decryptDeferralPayload` — named wrappers
 *     per ADR-ENCRYPTION-WIRING-01 Action Item 7. Sugar; no semantic
 *     difference from the generic helpers.
 */

import {
  encryptProfileData,
  decryptProfileData,
  type ServerEncryptedPayload,
} from '@/lib/server-encryption'

// ── Public types ────────────────────────────────────────────────────

/**
 * Storage-shaped encryption result. Matches D14b's two-column-per-encrypted-
 * field schema convention (per ADR-ENCRYPTION-WIRING-01 §Decision 3):
 *
 *   - `ciphertext` → goes into the row's TEXT column (e.g.,
 *     `open_deferrals.encrypted_payload`,
 *     `deferral_resolutions.reflection_content`,
 *     `deferral_resolutions.engine_diagnostics_ciphertext`).
 *   - `meta` → goes into the row's JSONB column (e.g., `encryption_meta`,
 *     `reflection_content_meta`, `engine_diagnostics_meta`). Pass directly
 *     to Supabase — DO NOT JSON.stringify (KG7).
 */
export interface EncryptedField {
  /** Base64-encoded ciphertext. Goes into the row's TEXT column. */
  ciphertext: string
  /**
   * Decryption metadata. Goes into the row's JSONB column AS A PLAIN OBJECT.
   *
   * Per KG7: the Supabase client serialises plain objects to JSONB correctly;
   * `JSON.stringify`-ing this value before insert produces a JSONB string
   * scalar which `Array.isArray` / `typeof` checks misread. Verify post-write
   * with `SELECT jsonb_typeof(encryption_meta) FROM ... LIMIT 1;` — expect
   * `'object'`. A `'string'` result indicates a writer is double-serialising.
   */
  meta: {
    iv: string
    authTag: string
    algorithm: 'AES-256-GCM'
    version: number
  }
}

// ── Generic helpers ─────────────────────────────────────────────────

/**
 * Encrypt arbitrary data for storage in a TEXT + JSONB column pair.
 *
 * Accepts any string or JSON-stringifiable object. Strings are passed through
 * as-is; objects are `JSON.stringify`-ed before encryption.
 *
 * Returns a storage-shaped `EncryptedField`: `ciphertext` (for the TEXT
 * column) and `meta` (for the JSONB column). Both are plain values — pass
 * directly to the Supabase client.
 *
 * @throws Error if `MENTOR_ENCRYPTION_KEY` is missing or malformed (per
 *   server-encryption.ts contract).
 */
export function encryptForStorage(input: string | object): EncryptedField {
  const plaintext = typeof input === 'string' ? input : JSON.stringify(input)
  const encrypted: ServerEncryptedPayload = encryptProfileData(plaintext)

  return {
    ciphertext: encrypted.ciphertext,
    meta: {
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      algorithm: encrypted.algorithm,
      version: encrypted.version,
    },
  }
}

/**
 * Decrypt a storage-shaped `EncryptedField` back to its plaintext string.
 *
 * For object-typed payloads, the caller is responsible for `JSON.parse` on
 * the returned string — or use `decryptDeferralPayload` below, which parses
 * automatically. The split exists because some encrypted fields (e.g.,
 * `deferral_resolutions.reflection_content`) are plain text, not JSON.
 *
 * @throws Error if `MENTOR_ENCRYPTION_KEY` is missing/malformed, or if the
 *   ciphertext has been tampered with (auth tag mismatch).
 */
export function decryptFromStorage(field: EncryptedField): string {
  const payload: ServerEncryptedPayload = {
    ciphertext: field.ciphertext,
    iv: field.meta.iv,
    authTag: field.meta.authTag,
    algorithm: field.meta.algorithm,
    version: field.meta.version,
  }
  return decryptProfileData(payload)
}

// ── D14b-named wrappers (per ADR-ENCRYPTION-WIRING-01 Action Item 7) ──

/**
 * Encrypt a deferral payload object for storage in `open_deferrals`.
 *
 * Sugar over `encryptForStorage` for readability at call sites in the
 * Phase-2 pass-1 deferral-resolve route source. The result's `ciphertext`
 * goes into `open_deferrals.encrypted_payload` (TEXT); the `meta` goes into
 * `open_deferrals.encryption_meta` (JSONB — plain object).
 */
export function encryptDeferralPayload(payload: object): EncryptedField {
  return encryptForStorage(payload)
}

/**
 * Decrypt a deferral payload from an `open_deferrals` row, returning the
 * parsed object. Generic over the payload's expected type; the caller
 * supplies the type parameter or accepts `unknown`.
 *
 * @throws Error if decryption fails (key mismatch / auth tag mismatch) or if
 *   the plaintext is not valid JSON.
 */
export function decryptDeferralPayload<T = unknown>(
  field: EncryptedField,
): T {
  const plaintext = decryptFromStorage(field)
  return JSON.parse(plaintext) as T
}
