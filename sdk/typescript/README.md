# @sagereasoning/client

A thin, dependency-free TypeScript client for the **SageReasoning substrate API**.
It encodes the live public contract once so you never reconstruct request/response
shapes from prose. Mirrors [`llms.txt`](https://www.sagereasoning.com/llms.txt) and the
[agent card](https://www.sagereasoning.com/.well-known/agent-card.json).

> **Status:** repo client + worked example. **Nothing is published as a package** —
> distribution (npm scope, versioning) is a separate decision. `package.json` is marked
> `"private": true` to prevent accidental publish.

**Runtime:** Node 18+ (global `fetch` + `node:crypto`). No third-party dependencies.

## What it covers

| Concern | API |
|---|---|
| Consult (`/api/reason`) — `assessment_first`, `layer1_schema` reuse, `prior_feedback` | `client.consult(req)` |
| Force-clarification two-turn handshake (§7) | `client.continueClarification({ input, continuationToken, clarificationResponse })` |
| Signature verification (§3, the canonical-form footgun) | `client.verifyAssessment(signed)` / `client.verifyConsult(res)` |
| Accreditation write — the `provenance.signed_assessments` round-trip (§1) | `client.writeAccreditation(agentId, body)` |
| Public read-back (§1) | `client.readAccreditation(agentId)` |

## Quick start

```ts
import { SageReasoningClient, isClarificationRequired, isDistressRedirect } from '@sagereasoning/client'

const client = new SageReasoningClient({ apiKey: process.env.SAGE_API_KEY! }) // sr_live_ / sr_prac_ / sr_inst_

let res = await client.consult({ input: 'Should I ...?', depth: 'standard', response_format: 'assessment_first' })

if (isClarificationRequired(res)) {
  // §7: resubmit the BYTE-IDENTICAL input + the token + your answer.
  res = await client.continueClarification({
    input: 'Should I ...?',                    // byte-for-byte identical to turn 1
    continuationToken: res.continuation_token,
    clarificationResponse: 'I mean ...',
  })
}

if (isDistressRedirect(res)) {
  // Surface res.suggested_user_message to the end user verbatim and stop.
} else {
  const ok = await client.verifyConsult(res)   // §3 — proves genuine substrate output
}
```

## The three footguns this client handles for you

1. **Byte-identical input on continuation (§7).** The `continuation_token` binds to
   `sha256(input)`. Any change to `input` — even whitespace — returns
   `400 continuation_token_input_mismatch`. The answer rides `clarification_response`
   and is **never** folded into `input`. Pass the original `input` unchanged.

2. **The signature canonical form (§3).** The signature covers the **inner**
   `assessment.assessment` object, canonicalised with **sorted keys at every level,
   compact separators, and raw UTF-8** (`ensure_ascii=false`). An ASCII-escaped
   canonicaliser does **not** verify. `canonicalise()` is a faithful port of the
   server algorithm; `verifyAssessment` applies it and checks the Ed25519 signature
   against `GET /api/public-key` (handling key rotation via `previous`).

3. **The supplied-schema echo (§5).** Supplying a prior consult's `extraction` as
   `layer1_schema` re-runs the verdict over **that** situation's features. Reuse it
   only to re-examine the **same** situation; for a new question omit it (let the
   server extract) or compute a fresh one — otherwise you get an *echo*, not a fresh
   diagnosis.

## Accreditation round-trip (§1)

```ts
const consult = await client.consult({ input: '...', depth: 'standard' })
await client.verifyConsult(consult)            // verify before crediting

await client.writeAccreditation(agentId, {
  kind: 'seed',
  profile: { agent_id: agentId, accreditation_record: { /* ... */ }, regressing_check_count: 0 },
  provenance: { signed_assessments: SageReasoningClient.provenanceFrom(consult) }, // non-empty
})

const profile = await client.readAccreditation(agentId) // public, no auth
// profile.data.typical_kathekon_quality / coverage_status / credential_basis are
// server-composed and consumer-unforgeable.
```

The R18f provenance gate requires at least one element of `signed_assessments` to
cryptographically verify (`403 no_examination` otherwise; `422 bad_provenance` on a
malformed/empty array). `provenanceFrom(...)` pulls the `SignedAssessment` envelope
straight out of one or more consult responses.

## Worked example

`examples/end-to-end.ts` runs consult → verify → write → read end-to-end:

```sh
SAGE_API_KEY=sr_prac_... npx tsx examples/end-to-end.ts
```

## Build / typecheck

```sh
npm install
npm run typecheck
npm run build      # emits dist/
```
