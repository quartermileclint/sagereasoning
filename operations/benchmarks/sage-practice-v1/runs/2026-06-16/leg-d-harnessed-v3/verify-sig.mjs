#!/usr/bin/env node
// verify-sig.mjs — faithful port of the SDK canonicaliser (sdk/typescript/src/canonical-json.ts)
// + Ed25519 verify via node:crypto. Setup tooling for leg-d-harnessed-v3.
// Usage: node verify-sig.mjs <signed-envelope.json> <public-key.pem>
//   signed-envelope.json = the consult response top-level `assessment` { assessment, signature, key_id }
//   (or a guardrail `signed_assessment`). The signature covers the INNER assessment object.
import { readFileSync } from 'node:fs'
import { createPublicKey, verify as cryptoVerify } from 'node:crypto'

function canon(v, path = 'assessment') {
  if (v === null) return 'null'
  if (v === undefined) throw new Error(`undefined at ${path}`)
  if (typeof v === 'boolean') return v ? 'true' : 'false'
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) throw new Error(`non-finite at ${path}`)
    if (Object.is(v, -0)) return '0'
    return v.toString()
  }
  if (typeof v === 'string') return JSON.stringify(v)
  if (Array.isArray(v)) return `[${v.map((x, i) => canon(x, `${path}[${i}]`)).join(',')}]`
  if (typeof v === 'object') {
    const keys = Object.keys(v).sort()
    return `{${keys.map((k) => `${JSON.stringify(k)}:${canon(v[k], `${path}.${k}`)}`).join(',')}}`
  }
  throw new Error(`unserialisable ${typeof v} at ${path}`)
}

const [, , envPath, pemPath] = process.argv
const env = JSON.parse(readFileSync(envPath, 'utf8'))
const pem = readFileSync(pemPath, 'utf8').trim()
if (!env.assessment || typeof env.signature !== 'string' || typeof env.key_id !== 'string') {
  console.error('envelope must be { assessment, signature, key_id }')
  process.exit(2)
}
const canonical = canon(env.assessment)
const ok = cryptoVerify(null, Buffer.from(canonical, 'utf8'), createPublicKey(pem), Buffer.from(env.signature, 'base64'))
console.log(JSON.stringify({ key_id: env.key_id, verified: ok, canonical_bytes: Buffer.byteLength(canonical, 'utf8') }))
process.exit(ok ? 0 : 1)
