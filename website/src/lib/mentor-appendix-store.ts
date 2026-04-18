/**
 * mentor-appendix-store.ts — Encrypted storage of baseline refinement rounds
 *
 * Appendix to the MentorProfile: each row represents one baseline gap-question
 * round (the 10 questions, the practitioner's answers, and the full refinement
 * response). The mentor_profiles row itself is never modified by this store.
 *
 * Encryption pattern matches mentor-profile-store.ts: non-sensitive metadata
 * in queryable columns, full payload AES-256-GCM encrypted at rest (R17b).
 *
 * Table: mentor_baseline_appendix
 *   - id, user_id (queryable)
 *   - submitted_at, generated_at, responses_processed, ai_model, receipt_id
 *   - encrypted_payload (TEXT — encrypted JSON of { questions, answers, refinement })
 *   - encryption_meta (JSONB — iv, authTag, version)
 *   - schema_version
 *   - RLS: users can only access their own rows
 */

import { supabaseAdmin } from '@/lib/supabase-server'
import {
  encryptProfileData,
  decryptProfileData,
  ServerEncryptedPayload,
} from '@/lib/server-encryption'

// ── Types ──────────────────────────────────────────────────────────

/** The payload shape stored inside the encrypted blob. */
export interface AppendixPayload {
  questions: unknown[]
  answers: Record<string, string>
  refinement: unknown
}

/** What callers pass into saveAppendixRound. */
export interface AppendixSaveInput {
  submittedAt: string // ISO
  generatedAt?: string // ISO
  responsesProcessed: number
  aiModel?: string | null
  receiptId?: string | null
  payload: AppendixPayload
}

/** What loadAppendix* functions return. */
export interface StoredAppendixRow {
  id: string
  user_id: string
  submitted_at: string
  generated_at: string | null
  responses_processed: number
  ai_model: string | null
  receipt_id: string | null
  encrypted_payload: string
  encryption_meta: {
    iv: string
    authTag: string
    algorithm: string
    version: number
  }
  schema_version: number
  created_at: string
  updated_at: string
}

export interface DecryptedAppendixRound {
  id: string
  submittedAt: string
  generatedAt: string | null
  responsesProcessed: number
  aiModel: string | null
  receiptId: string | null
  schemaVersion: number
  payload: AppendixPayload
}

// ── Write ──────────────────────────────────────────────────────────

/**
 * Save one refinement round, encrypted.
 * Inserts a new row — does not update existing rows.
 */
export async function saveAppendixRound(
  userId: string,
  input: AppendixSaveInput
): Promise<{ success: boolean; id?: string; appendix_version?: number; error?: string }> {
  // Encrypt the full payload JSON
  const plaintext = JSON.stringify(input.payload)
  const encrypted = encryptProfileData(plaintext)

  const row = {
    user_id: userId,
    submitted_at: input.submittedAt,
    generated_at: input.generatedAt || null,
    responses_processed: input.responsesProcessed,
    ai_model: input.aiModel || null,
    receipt_id: input.receiptId || null,
    encrypted_payload: encrypted.ciphertext,
    encryption_meta: {
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      algorithm: encrypted.algorithm,
      version: encrypted.version,
    },
    schema_version: 1,
  }

  const { data, error } = await supabaseAdmin
    .from('mentor_baseline_appendix')
    .insert(row)
    .select('id')
    .single()

  if (error || !data) {
    console.error('[mentor-appendix-store] Save error:', error)
    return { success: false, error: error?.message || 'Insert failed' }
  }

  // Count rounds for this user to return a human-readable version number
  const { count } = await supabaseAdmin
    .from('mentor_baseline_appendix')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  return {
    success: true,
    id: data.id as string,
    appendix_version: count || 1,
  }
}

// ── Read ───────────────────────────────────────────────────────────

/**
 * List all appendix rounds for a user (newest first).
 * Each entry is fully decrypted — caller gets the plaintext payload.
 */
export async function listAppendixRounds(
  userId: string
): Promise<DecryptedAppendixRound[]> {
  const { data, error } = await supabaseAdmin
    .from('mentor_baseline_appendix')
    .select('*')
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false })

  if (error || !data) {
    if (error) console.error('[mentor-appendix-store] List error:', error)
    return []
  }

  const rows = data as StoredAppendixRow[]
  const results: DecryptedAppendixRound[] = []

  for (const row of rows) {
    try {
      const encPayload: ServerEncryptedPayload = {
        ciphertext: row.encrypted_payload,
        iv: row.encryption_meta.iv,
        authTag: row.encryption_meta.authTag,
        algorithm: row.encryption_meta.algorithm as 'AES-256-GCM',
        version: row.encryption_meta.version,
      }
      const plaintext = decryptProfileData(encPayload)
      const payload = JSON.parse(plaintext) as AppendixPayload
      results.push({
        id: row.id,
        submittedAt: row.submitted_at,
        generatedAt: row.generated_at,
        responsesProcessed: row.responses_processed,
        aiModel: row.ai_model,
        receiptId: row.receipt_id,
        schemaVersion: row.schema_version,
        payload,
      })
    } catch (err) {
      console.error('[mentor-appendix-store] Decrypt error for row', row.id, err)
      // Skip rows that fail decryption rather than failing the whole list.
    }
  }

  return results
}

/**
 * Load the single most recent round for a user.
 * Returns null if none exist.
 */
export async function loadLatestAppendixRound(
  userId: string
): Promise<DecryptedAppendixRound | null> {
  const { data, error } = await supabaseAdmin
    .from('mentor_baseline_appendix')
    .select('*')
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) {
    if (error && error.code !== 'PGRST116') {
      console.error('[mentor-appendix-store] Load latest error:', error)
    }
    return null
  }

  const row = data as StoredAppendixRow
  try {
    const encPayload: ServerEncryptedPayload = {
      ciphertext: row.encrypted_payload,
      iv: row.encryption_meta.iv,
      authTag: row.encryption_meta.authTag,
      algorithm: row.encryption_meta.algorithm as 'AES-256-GCM',
      version: row.encryption_meta.version,
    }
    const plaintext = decryptProfileData(encPayload)
    const payload = JSON.parse(plaintext) as AppendixPayload
    return {
      id: row.id,
      submittedAt: row.submitted_at,
      generatedAt: row.generated_at,
      responsesProcessed: row.responses_processed,
      aiModel: row.ai_model,
      receiptId: row.receipt_id,
      schemaVersion: row.schema_version,
      payload,
    }
  } catch (err) {
    console.error('[mentor-appendix-store] Decrypt error for latest row:', err)
    return null
  }
}

// ── Delete ─────────────────────────────────────────────────────────

/**
 * Delete one round. Caller must pass both id and user_id so we never delete
 * another user's data even if the service-role client bypasses RLS.
 */
export async function deleteAppendixRound(
  userId: string,
  id: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabaseAdmin
    .from('mentor_baseline_appendix')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    console.error('[mentor-appendix-store] Delete error:', error)
    return { success: false, error: error.message }
  }
  return { success: true }
}
