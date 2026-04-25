/**
 * mentor-profile-store.ts — Encrypted profile storage in Supabase
 *
 * Stores the MentorProfile JSON encrypted at rest (R17b), with non-sensitive
 * metadata in queryable columns. Uses server-side AES-256-GCM encryption.
 *
 * Table: mentor_profiles
 *   - id, user_id, display_name (queryable metadata)
 *   - senecan_grade, proximity_level (queryable for analytics)
 *   - encrypted_profile (TEXT — the encrypted JSON blob)
 *   - encryption_meta (JSONB — iv, authTag, version for decryption)
 *   - profile_version (INTEGER — incremented on each update)
 *   - RLS: users can only access their own profile
 *
 * The full MentorProfile (passion maps, false judgements, causal tendencies,
 * virtue assessments) lives inside the encrypted blob. The metadata columns
 * hold only non-sensitive summary data safe for database-level access.
 */

import { supabaseAdmin } from '@/lib/supabase-server'
import { encryptProfileData, decryptProfileData, ServerEncryptedPayload } from '@/lib/server-encryption'
import { buildProfileSummary, MentorProfileData } from '@/lib/mentor-profile-summary'

// ── Types ──────────────────────────────────────────────────────────

export interface StoredProfileRow {
  id: string
  user_id: string
  display_name: string
  senecan_grade: string
  proximity_level: string
  passions_count: number
  weakest_virtue: string
  encrypted_profile: string
  encryption_meta: {
    iv: string
    authTag: string
    algorithm: string
    version: number
  }
  profile_version: number
  created_at: string
  updated_at: string
}

// ── Read ───────────────────────────────────────────────────────────

/**
 * Load and decrypt a user's MentorProfile from Supabase.
 * Returns null if no profile exists for this user.
 */
export async function loadMentorProfile(
  userId: string
): Promise<{ profile: MentorProfileData; summary: string; version: number } | null> {
  // Diagnostic instrumentation — retrieval bottleneck analysis (Path A,
  // session 2026-04-25). Logs timings only, no profile content.
  // Remove once cache design is decided and ADR is logged.
  const t0 = Date.now()

  const { data, error } = await supabaseAdmin
    .from('mentor_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  const t1 = Date.now()

  if (error || !data) {
    if (error?.code === 'PGRST116') {
      console.log(
        `[mentor-profile-store] timing user=${userId} db_ms=${t1 - t0} total_ms=${Date.now() - t0} found=false`
      )
      return null // No rows
    }
    console.error('[mentor-profile-store] Load error:', error)
    return null
  }

  const row = data as StoredProfileRow

  // Reconstruct the encrypted payload for decryption
  const payload: ServerEncryptedPayload = {
    ciphertext: row.encrypted_profile,
    iv: row.encryption_meta.iv,
    authTag: row.encryption_meta.authTag,
    algorithm: row.encryption_meta.algorithm as 'AES-256-GCM',
    version: row.encryption_meta.version,
  }

  const t2 = Date.now()
  const decryptedJson = decryptProfileData(payload)
  const t3 = Date.now()
  const profile = JSON.parse(decryptedJson) as MentorProfileData
  const t4 = Date.now()
  const summary = buildProfileSummary(profile)
  const t5 = Date.now()

  console.log(
    `[mentor-profile-store] timing user=${userId} db_ms=${t1 - t0} decrypt_ms=${t3 - t2} parse_ms=${t4 - t3} summary_ms=${t5 - t4} total_ms=${t5 - t0} found=true`
  )

  return { profile, summary, version: row.profile_version }
}

// ── Write ──────────────────────────────────────────────────────────

/**
 * Save (upsert) a MentorProfile to Supabase, encrypted.
 * If a profile already exists for this user, it's updated and version incremented.
 */
export async function saveMentorProfile(
  userId: string,
  profile: MentorProfileData
): Promise<{ success: boolean; version: number; error?: string }> {
  // Encrypt the full profile JSON
  const plaintext = JSON.stringify(profile)
  const encrypted = encryptProfileData(plaintext)

  // Extract non-sensitive metadata for queryable columns
  const weakestVirtue = Object.entries(profile.virtue_profile)
    .sort((a, b) => {
      const order = { gap: 0, developing: 1, moderate: 2, strong: 3 }
      return (order[a[1].overall_strength as keyof typeof order] ?? 1) -
             (order[b[1].overall_strength as keyof typeof order] ?? 1)
    })[0]?.[0] ?? 'unknown'

  // Check if profile exists
  const { data: existing } = await supabaseAdmin
    .from('mentor_profiles')
    .select('id, profile_version')
    .eq('user_id', userId)
    .single()

  const newVersion = existing ? (existing.profile_version || 0) + 1 : 1

  const row = {
    user_id: userId,
    display_name: profile.display_name || 'Practitioner',
    senecan_grade: profile.proximity_estimate?.senecan_grade || 'pre_progress',
    proximity_level: profile.proximity_estimate?.level || 'reflexive',
    passions_count: profile.passion_map?.length || 0,
    weakest_virtue: weakestVirtue,
    encrypted_profile: encrypted.ciphertext,
    encryption_meta: {
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      algorithm: encrypted.algorithm,
      version: encrypted.version,
    },
    profile_version: newVersion,
    updated_at: new Date().toISOString(),
  }

  let error
  if (existing) {
    // Update existing
    const result = await supabaseAdmin
      .from('mentor_profiles')
      .update(row)
      .eq('id', existing.id)
    error = result.error
  } else {
    // Insert new
    const result = await supabaseAdmin
      .from('mentor_profiles')
      .insert({ ...row, created_at: new Date().toISOString() })
    error = result.error
  }

  if (error) {
    console.error('[mentor-profile-store] Save error:', error)
    return { success: false, version: newVersion, error: error.message }
  }

  return { success: true, version: newVersion }
}

// ── Migration SQL ──────────────────────────────────────────────────

/**
 * SQL to create the mentor_profiles table.
 * Run this in the Supabase SQL Editor.
 */
export const MIGRATION_SQL = `
-- mentor_profiles — Encrypted mentor profile storage (R17b)
-- Non-sensitive metadata in queryable columns; full profile encrypted at rest.

CREATE TABLE IF NOT EXISTS mentor_profiles (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name      TEXT NOT NULL DEFAULT 'Practitioner',

  -- Queryable metadata (non-sensitive summary)
  senecan_grade     TEXT NOT NULL DEFAULT 'pre_progress',
  proximity_level   TEXT NOT NULL DEFAULT 'reflexive',
  passions_count    INTEGER NOT NULL DEFAULT 0,
  weakest_virtue    TEXT NOT NULL DEFAULT 'unknown',

  -- Encrypted profile blob (R17b: application-level encryption)
  encrypted_profile TEXT NOT NULL,
  encryption_meta   JSONB NOT NULL,

  -- Versioning
  profile_version   INTEGER NOT NULL DEFAULT 1,

  -- Timestamps
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One profile per user
  UNIQUE(user_id)
);

-- RLS: Users can only access their own profile
ALTER TABLE mentor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON mentor_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON mentor_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON mentor_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role bypasses RLS for API routes
-- (supabaseAdmin client uses service role key)

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_mentor_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mentor_profiles_updated_at
  BEFORE UPDATE ON mentor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_mentor_profile_timestamp();
`
