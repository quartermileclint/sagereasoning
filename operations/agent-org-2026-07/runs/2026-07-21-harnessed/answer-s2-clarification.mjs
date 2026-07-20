#!/usr/bin/env node
/**
 * answer-s2-clarification.mjs — closes the Tier-1 clarification s2-consult
 * raised. Resubmits the ORIGINAL s2 input byte-for-byte (the continuation
 * token binds to sha256(input)) plus the answer and the token.
 */
import { writeFile, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = (process.env.SAGE_BASE_URL || 'https://www.sagereasoning.com').replace(/\/+$/, '')
const INST_KEY = process.env.SAGE_INST_KEY
if (!INST_KEY) { console.error('\nERROR: set SAGE_INST_KEY.\n'); process.exit(1) }

const ORIGINAL_INPUT =
  "The data-retention and cross-border-transfer compliance review for a new third-party marketing-automation integration (Cascade, which will newly receive customer PII: name, email, plan tier, last-login date) has been completed and cleared, based solely on the product lead's verbal assurance that 'the policy checklist stuff is basically always fine for integrations like this.' No completed checklist, sign-off email, or updated privacy notice was shown to me, and the company's live privacy notice still does not mention Cascade or any marketing-automation partner — it only describes an older analytics vendor. I am deciding whether to write the board-facing integration readiness note's compliance status line as 'reviewed and cleared.'"

const prior = JSON.parse(await readFile(path.join(__dirname, 'outputs', 's2-consult.json'), 'utf8'))
const continuationToken = prior.body.continuation_token
if (!continuationToken) { console.error('No continuation_token found in outputs/s2-consult.json'); process.exit(1) }

const answer =
  "Something I'm worried might happen: that I write 'reviewed and cleared' on the board note and the board approves go-live on that basis, when the compliance review may not actually have happened — I have no artifact confirming it did."

const res = await fetch(`${BASE_URL}/api/reason`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${INST_KEY}` },
  body: JSON.stringify({
    input: ORIGINAL_INPUT,
    continuation_token: continuationToken,
    clarification_response: answer,
    depth: 'standard',
    response_format: 'assessment_first',
  }),
})
const text = await res.text()
let body
try { body = JSON.parse(text) } catch { body = text }
await writeFile(path.join(__dirname, 'outputs', 's2-consult-resolved.json'), JSON.stringify({ status: res.status, body }, null, 2))
console.log(`HTTP ${res.status} — written to outputs/s2-consult-resolved.json`)
if (body && body.assessment && body.assessment.signature) {
  console.log('Signed assessment obtained — katorthoma_proximity:', body.assessment.assessment?.katorthoma_proximity)
}
