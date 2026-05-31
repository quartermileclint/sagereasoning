/**
 * journal-encryption.ts — R17b encrypt/decrypt helpers for the real-time
 * journal store (`realtime_journal_entries`).
 *
 * The raw verbatim impression → assent → action prose is the most intimate
 * free-text content captured by the journal feed. Per R17b it is encrypted at
 * rest (AES-256-GCM, MENTOR_ENCRYPTION_KEY) and stored as a ciphertext TEXT
 * column + a meta JSONB column — the established mentor-profile-store /
 * encryption-helpers / sage-reflect session-store pattern. The closest
 * precedent for this table's shape (verbatim prose → one ciphertext column +
 * one meta column) is `sage-reflect/session-store.ts`
 * (`encryptPersistedState` / `decryptPersistedState`).
 *
 * The three prose fields are always written together and always read together,
 * so they are encrypted as ONE JSON blob (one ciphertext + one meta), not three
 * column pairs. The queryable signal on this table (timestamps; the generated
 * `lag_hours`; the `realtime_journal_lag_stats` view) is unaffected — the view
 * reads only `event_timestamp` / `created_at`, never the prose columns.
 *
 * R17 footprint:
 *   - R17b — application-level encryption beyond database-level encryption.
 *   - R17f — encryption changes follow the Critical Change Protocol (0c-ii);
 *     this module's introduction is the operative-Critical event for the
 *     realtime-journal encryption-at-write change (D-R17B-REALTIME-JOURNAL-
 *     ENCRYPTION-2026-05-31).
 *
 * KG7: the returned `meta` MUST be passed to Supabase as a plain object, never
 * JSON.stringify-ed. `encryptForStorage` returns it as a plain object literal;
 * verify post-write with `SELECT jsonb_typeof(entry_meta) ...` → 'object'.
 */

import {
  encryptForStorage,
  decryptFromStorage,
  type EncryptedField,
} from '@/lib/encryption-helpers'

/** The three verbatim prose fields of a real-time journal entry. */
export interface JournalProse {
  impression: string
  assent: string
  action: string
}

/**
 * R17b — encrypt the three prose fields as one storage-shaped blob.
 * `ciphertext` goes into `realtime_journal_entries.entry_ciphertext` (TEXT);
 * `meta` goes into `realtime_journal_entries.entry_meta` (JSONB — plain object).
 * Reads MENTOR_ENCRYPTION_KEY at call time (server-encryption is lazy).
 */
export function encryptJournalProse(prose: JournalProse): EncryptedField {
  return encryptForStorage({
    impression: prose.impression,
    assent: prose.assent,
    action: prose.action,
  })
}

/**
 * R17b — decrypt a stored journal blob back to the three prose fields.
 * @throws if MENTOR_ENCRYPTION_KEY is missing/malformed or the auth tag
 *   mismatches (tampered ciphertext) or the plaintext is not valid JSON.
 */
export function decryptJournalProse(field: EncryptedField): JournalProse {
  const plaintext = decryptFromStorage(field)
  return JSON.parse(plaintext) as JournalProse
}

/**
 * Resolve the prose for a stored row, transparently handling BOTH the new
 * encrypted shape and any pre-change plaintext row (leave-and-tolerate, per
 * D-R17B-REALTIME-JOURNAL-ENCRYPTION-2026-05-31).
 *
 *   - If `entry_ciphertext` + `entry_meta` are present → decrypt them.
 *   - Else → fall back to the legacy plaintext `impression`/`assent`/`action`
 *     columns (any row written before this change; founder/test only).
 *
 * Returns the three prose fields plus `_decryption_error` when a present
 * ciphertext fails to decrypt (so a single bad row never throws the whole
 * read). Never returns the ciphertext/meta to the caller.
 */
export function resolveJournalProse(row: {
  entry_ciphertext?: string | null
  entry_meta?: unknown
  impression?: string | null
  assent?: string | null
  action?: string | null
}): JournalProse & { _decryption_error?: string } {
  if (
    typeof row.entry_ciphertext === 'string' &&
    row.entry_ciphertext.length > 0 &&
    row.entry_meta &&
    typeof row.entry_meta === 'object'
  ) {
    try {
      const field: EncryptedField = {
        ciphertext: row.entry_ciphertext,
        meta: row.entry_meta as EncryptedField['meta'],
      }
      return decryptJournalProse(field)
    } catch (e) {
      return {
        impression: '',
        assent: '',
        action: '',
        _decryption_error: e instanceof Error ? e.message : String(e),
      }
    }
  }
  // Legacy plaintext row (pre-encryption; founder/test only).
  return {
    impression: row.impression ?? '',
    assent: row.assent ?? '',
    action: row.action ?? '',
  }
}
