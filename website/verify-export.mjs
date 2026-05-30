// Temporary helper for the R17 export live-test. Safe to delete afterwards.
// Usage (run from the website/ folder, with `npm run dev` already running):
//   node verify-export.mjs "<test-user-email>" "<test-user-password>"
//
// It signs in the test user, calls GET /api/user/export on the local dev
// server, and reports whether the intimate-store tables are present.

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// Load NEXT_PUBLIC_* values from .env.local (no secrets are printed).
const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
    })
)

const url = env.NEXT_PUBLIC_SUPABASE_URL
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const appUrl = 'http://localhost:3000'

const email = process.argv[2]
const password = process.argv[3]
if (!email || !password) {
  console.error('Please pass the test user email and password:')
  console.error('  node verify-export.mjs "you@example.com" "thepassword"')
  process.exit(1)
}

const supabase = createClient(url, anon)

const { data: signIn, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
if (signInError) {
  console.error('SIGN-IN FAILED:', signInError.message)
  console.error('(If it says "Email not confirmed", open Supabase -> Authentication -> Users, click the user, and confirm them.)')
  process.exit(1)
}

const token = signIn.session.access_token

let res, json
try {
  res = await fetch(`${appUrl}/api/user/export`, { headers: { Authorization: `Bearer ${token}` } })
} catch (e) {
  console.error(`Could not reach the app at ${appUrl} — is "npm run dev" running in the other terminal?`)
  console.error(e.message)
  process.exit(1)
}

try {
  json = await res.json()
} catch {
  console.error('The app responded but not with JSON. HTTP status:', res.status)
  process.exit(1)
}

const keys = Object.keys(json).sort()
const wanted = [
  'mentor_profile',
  'mentor_baseline_appendix',
  'realtime_journal_entries',
  'passion_events',
  'premeditatio_entries',
  'oikeiosis_reflections',
  'mentor_interactions',
  'mentor_journal_refs',
  'mentor_observations_structured',
]
const missing = wanted.filter((k) => !keys.includes(k))

console.log('\n==============================')
console.log('HTTP status:', res.status)
console.log('Keys in export:', keys.join(', '))
console.log('------------------------------')
if (missing.length === 0) {
  console.log('PASS: all intimate-store tables are present in the export.')
} else {
  console.log('MISSING:', missing.join(', '))
}
const pe = json.passion_events
console.log('passion_events rows:', Array.isArray(pe) ? pe.length : JSON.stringify(pe))
console.log('==============================\n')
