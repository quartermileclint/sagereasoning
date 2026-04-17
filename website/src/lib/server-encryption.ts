/**
 * Server-Side Encryption for Mentor Profile Data (R17b)
 *
 * Encrypts sensitive profile data (passion maps, false judgements, causal
 * tendencies, virtue assessments) at rest in Supabase. Decrypts on read
 * so API endpoints can process the data for LLM calls.
 *
 * Algorithm: AES-256-GCM via Node.js crypto (available on Vercel)
 * Key source: MENTOR_ENCRYPTION_KEY environment variable
 *
 * This complements (not replaces) the client-side encryption in encryption.ts.
 * Client-side encryption protects data the server should never see (journal entries).
 * Server-side encryption protects data the server processes but shouldn't store in
 * plaintext (profile data needed for LLM calls).
 *
 * R17b: Application-level encryption beyond database-level encryption
 * R17e: Passion profiling results never exposed via API — encrypted at rest
 * R17f: Changes to encryption follow Critical Change Protocol (0c-ii)
 */

import * as crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12 // 12 bytes for AES-GCM
const AUTH_TAG_LENGTH = 16 // 16 bytes authentication tag
export interface ServerEncryptedPayload {
  /** Base64-encoded ciphertext */
  ciphertext: string
  /** Base64-encoded initialisation vector */
  iv: string
  /** Base64-encoded authentication tag */
  authTag: string
  /** Algorithm identifier for future-proofing */
  algorithm: 'AES-256-GCM'
  /** Version for key rotation support */
  version: number
}

/**
 * Get the encryption key from environment.
 * The key must be a 64-character hex string (32 bytes = 256 bits).
 * Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */
function getEncryptionKey(): Buffer {
  const keyHex = process.env.MENTOR_ENCRYPTION_KEY
  if (!keyHex) {
    throw new Error(
      'MENTOR_ENCRYPTION_KEY environment variable is not set. ' +
      'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    )
  }
  if (keyHex.length !== 64) {
    throw new Error(
      `MENTOR_ENCRYPTION_KEY must be 64 hex characters (32 bytes). Got ${keyHex.length} characters.`
    )
  }
  return Buffer.from(keyHex, 'hex')
}

/**
 * Encrypt a string (typically JSON-stringified profile data) for storage.
 * Each call generates a fresh random IV — never reuse IVs.
 */
export function encryptProfileData(plaintext: string): ServerEncryptedPayload {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  })

  let ciphertext = cipher.update(plaintext, 'utf8', 'base64')
  ciphertext += cipher.final('base64')

  const authTag = cipher.getAuthTag()

  return {
    ciphertext,
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    algorithm: 'AES-256-GCM',
    version: 1,
  }
}

/**
 * Decrypt profile data retrieved from Supabase.
 * Throws if the key is wrong or data has been tampered with.
 */
export function decryptProfileData(payload: ServerEncryptedPayload): string {
  const key = getEncryptionKey()
  const iv = Buffer.from(payload.iv, 'base64')
  const authTag = Buffer.from(payload.authTag, 'base64')

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  })
  decipher.setAuthTag(authTag)

  let plaintext = decipher.update(payload.ciphertext, 'base64', 'utf8')
  plaintext += decipher.final('utf8')

  return plaintext
}

/**
 * Check if server-side encryption is configured.
 * Call this at startup or in health checks.
 */
export function isServerEncryptionConfigured(): boolean {
  const keyHex = process.env.MENTOR_ENCRYPTION_KEY
  return !!keyHex && keyHex.length === 64
}
