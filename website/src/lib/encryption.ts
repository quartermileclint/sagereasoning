/**
 * Client-Side Encryption Utility for SageReasoning
 *
 * Phase 0.3 — Structural placeholder for Apple App Intents readiness.
 *
 * Purpose: Encrypt sensitive user content (journal entries, reflections)
 * in the browser BEFORE sending to Supabase. Decryption happens client-side
 * only — the server never sees plaintext personal reflections.
 *
 * Future native app: The same derived key (PBKDF2 from user password + salt)
 * can be stored in the iOS Keychain, enabling the native app to read the
 * same encrypted data without re-encryption or migration.
 *
 * Algorithm: AES-256-GCM via Web Crypto API
 * Key derivation: PBKDF2 (100,000 iterations, SHA-256)
 *
 * Usage:
 *   import { encryptText, decryptText, deriveEncryptionKey } from '@/lib/encryption'
 *
 *   // On login — derive and cache the key (never store the password)
 *   const key = await deriveEncryptionKey(userPassword, userSalt)
 *
 *   // Before saving journal entry to Supabase
 *   const encrypted = await encryptText(entryText, key)
 *   // encrypted = { ciphertext: string, iv: string }  (both base64)
 *
 *   // After fetching from Supabase
 *   const plaintext = await decryptText(encrypted.ciphertext, encrypted.iv, key)
 */

// ============================================================
// Types
// ============================================================

export interface EncryptedPayload {
  /** Base64-encoded ciphertext */
  ciphertext: string
  /** Base64-encoded initialisation vector (12 bytes for AES-GCM) */
  iv: string
  /** Algorithm identifier for future-proofing */
  algorithm: 'AES-256-GCM'
  /** PBKDF2 iteration count used to derive the key */
  kdf_iterations: number
}

// ============================================================
// Constants
// ============================================================

const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256
const IV_LENGTH = 12 // 12 bytes recommended for AES-GCM
const KDF_ITERATIONS = 100_000
const KDF_HASH = 'SHA-256'
const SALT_LENGTH = 16 // 16 bytes for PBKDF2 salt

// ============================================================
// Helpers — Base64 encoding/decoding for ArrayBuffer
// ============================================================

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

// ============================================================
// Key Derivation
// ============================================================

/**
 * Generate a random salt for a new user.
 * Store this salt alongside the user's profile in Supabase (it's not secret).
 * The salt ensures the same password produces different keys for different users.
 */
export function generateSalt(): string {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  return bufferToBase64(salt.buffer)
}

/**
 * Derive an AES-256-GCM encryption key from the user's password + salt.
 *
 * Call this once at login. Keep the CryptoKey in memory (React state or context).
 * Never store the password or the raw key material.
 *
 * The same derivation (password + salt + iterations + hash) produces the same
 * key on any platform — Web Crypto API, iOS CryptoKit, Android, Node.js.
 * This is what makes the future native app able to read the same encrypted data.
 *
 * @param password - The user's password (from login form)
 * @param saltBase64 - The user's salt (stored in Supabase profiles table)
 * @returns CryptoKey usable for encrypt/decrypt operations
 */
export async function deriveEncryptionKey(
  password: string,
  saltBase64: string
): Promise<CryptoKey> {
  // Import password as raw key material
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )

  const salt = base64ToBuffer(saltBase64)

  // Derive AES-256-GCM key
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: KDF_ITERATIONS,
      hash: KDF_HASH,
    },
    passwordKey,
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    false, // not extractable — key stays in Web Crypto API
    ['encrypt', 'decrypt']
  )
}

// ============================================================
// Encrypt / Decrypt
// ============================================================

/**
 * Encrypt plaintext using AES-256-GCM.
 *
 * Each call generates a fresh random IV (initialisation vector).
 * The IV is NOT secret — it's stored alongside the ciphertext.
 * Never reuse an IV with the same key.
 *
 * @param plaintext - The text to encrypt (e.g., a journal entry)
 * @param key - CryptoKey from deriveEncryptionKey()
 * @returns EncryptedPayload with base64 ciphertext and iv
 */
export async function encryptText(
  plaintext: string,
  key: CryptoKey
): Promise<EncryptedPayload> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const encoded = new TextEncoder().encode(plaintext)

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoded
  )

  return {
    ciphertext: bufferToBase64(ciphertext),
    iv: bufferToBase64(iv.buffer),
    algorithm: 'AES-256-GCM',
    kdf_iterations: KDF_ITERATIONS,
  }
}

/**
 * Decrypt ciphertext using AES-256-GCM.
 *
 * @param ciphertextBase64 - Base64-encoded ciphertext from encryptText()
 * @param ivBase64 - Base64-encoded IV from encryptText()
 * @param key - CryptoKey from deriveEncryptionKey() (same password + salt)
 * @returns The original plaintext
 * @throws DOMException if the key is wrong or data is tampered
 */
export async function decryptText(
  ciphertextBase64: string,
  ivBase64: string,
  key: CryptoKey
): Promise<string> {
  const ciphertext = base64ToBuffer(ciphertextBase64)
  const iv = base64ToBuffer(ivBase64)

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext
  )

  return new TextDecoder().decode(decrypted)
}

// ============================================================
// Utility: Check if encryption is available
// ============================================================

/**
 * Check if the browser supports the Web Crypto API.
 * All modern browsers do, but this is a safety check for older environments.
 */
export function isEncryptionAvailable(): boolean {
  return (
    typeof crypto !== 'undefined' &&
    typeof crypto.subtle !== 'undefined' &&
    typeof crypto.getRandomValues !== 'undefined'
  )
}
