# Session Close — 2026-06-13 — Mechanism-Correction M3: accreditation session (CI-12 + CI-11 + CI-4 write-boundary half)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` (PR1–PR18).
**Tier:** `code-elevated` (CI-12 public read path + CI-11 Live trust-surface payload + CI-4 response-shape) + `schema` (Standard — additive nullable columns). **Critical-check at the R18f seam HELD** (the loop-closure gate is a separate additive module; `provenance-gate.ts`/`provenance-contract.ts`/`layer2-verifier` byte-unchanged — adversarially diff-verified). No auth-surface/R20a/A5/zone change.
**Environment:** Claude Code on the founder's machine; TEST Supabase (`iwdtrvuphogkwmovhnvz`) is the live-verification target; **production untouched this session**. Model: Fable 5, maximum reasoning effort.
**Date:** 2026-06-13.

## Decisions Made

- `D-MECHANISM-CORRECTION-M3-ACCREDITATION-BUILT-TEST-VERIFIED-2026-06-13` appended. CI-12 + CI-11 + CI-4 write-boundary half built and TEST-Verified at the assertion level, under three in-session founder elections (CI-12 = both/shared validator; CI-4 half = IN, both modes flag-first; PATCH-audit candidate = OUT).

## What this session did

1. Opened under the M3 prompt (full Part A read order incl. the K1 ADR in full; pre-conditions verified: M2 commit `4cea191` pushed, tsc clean, TEST env standing).
2. **CI-12** (FX-11 — the second Box-1 catch): a single shared vocabulary module (`agent-id-vocabulary.ts`, mirrored to `/trust-layer/`) — `isAcceptedAgentId` = K1-canonical `namespace:name@version` (carried from the K1 ADR) **or** the grandfathered legacy `agent_*` (byte-identical to the prior regex). The public GET, the POST write boundary, the A10 mint validation, **and the store write chokepoint** all validate against it ⇒ *write-accepted ⇒ read-accepted by construction*.
3. **CI-11** (FX-10 — K1 first slice): three nullable additive columns (`coverage_status`/`monitored_since`/`credential_basis`) via a new migration; a server-side composer sets honest initial values (`agent_elected`, never `continuous`); the store takes the fields from write-time options only (consumer cannot forge coverage); the payload carries them. The full suspend/resume state machine is **not** this slice.
4. **CI-4 write-boundary half** (founder-elected IN): a separate additive gate module invoked after the R18f provenance gate — two env flags, both UNSET = byte-identical; flag mode annotates, reject mode 422s an unclosed chain per the Q4 same-depth rule. R18f untouched.
5. **Adversarial verification workflow** (4 dimensions → 11 agents) before the founder leg: 6 confirmed findings → **all resolved this session.** Three in-scope, fixed + re-verified: the Sage Reflect feed write-path bypass → store-chokepoint + early feed guard; consumer-timestamp honesty in `credential_basis` → window-provenance labelling; the 422 discriminator alignment. Two initially deferred as pre-existing then fixed on founder direction ("fix all"): the `/trust-layer` `createAccreditationRecord` drift → restored to byte-identical with the website port (reference tree compiles clean, 0 errors); the `/trust-layer` payload K1 optionality → aligned to required in both trees. (The sixth folded into the first.)

## Status Changes

| Item | Old | New |
|---|---|---|
| CI-12 (write/read agent_id reconcile, FX-11) | Approved | **TEST-Verified** (assertion-level; founder TEST live leg pending) |
| CI-11 (K1 coverage-status first slice, FX-10) | Approved | **TEST-Verified** (assertion-level; production migration pending 0c-ii) |
| CI-4 write-boundary half (loop closure) | Approved | **Built (dark)** — both flags UNSET; TEST-Verified at assertion level |
| FX-11 (write/read asymmetry — Box-1 catch #2) | Open | **Closed in code** (both Box-1 catches now closed: F12 at M2, FX-11 here) |
| Agent-id write-path coverage | Route-only (gap) | **By construction** (store chokepoint + feed early guard) |
| api-keys PATCH audit symmetry (M2 candidate) | Open | **Declined for M3** (founder-elected OUT; stays open) |

## Next Session Should

**M4 — gate + quick-tier session (CI-8 + CI-9 + CI-10 + CI-16)** per the approved queue: prompt at `operations/handoffs/founder/2026-06-13-mechanism-correction-M4-gate-quick-tier-NEXT-SESSION-PROMPT.md`. Standard ×2 (CI-8 meta honesty; CI-9 diagnostic-only) + Elevated ×2 (CI-10 gate metering; CI-16 quick-tier value classification). CI-9 diagnostic-first (PR10); CI-16 proven on `/api/reason` quick first (PR1), gate inherits. Est. 3–4h. **Independently, the founder may elect the M1 activation and/or the M3 CI-11 migration + CI-4 flags at any time** (each its own 0c-ii step).

## Blocked On

**Files remaining uncommitted (stage BY NAME — never `.env*`, never `tsconfig.tsbuildinfo`):**
- `website/src/lib/substrate/trust-layer/accreditation/agent-id-vocabulary.ts`
- `website/src/lib/substrate/trust-layer/accreditation/coverage-status.ts`
- `website/src/lib/substrate/trust-layer/accreditation/__tests__/agent-id-vocabulary.test.ts`
- `website/src/lib/substrate/trust-layer/accreditation/__tests__/coverage-status.test.ts`
- `website/src/lib/substrate/trust-layer/accreditation/accreditation-record.ts`
- `website/src/lib/substrate/trust-layer/accreditation/public-endpoint.ts`
- `website/src/lib/substrate/trust-layer/types/accreditation.ts`
- `website/src/lib/substrate/sage-assent-accreditation-store.ts`
- `website/src/lib/substrate/sage-assent-accreditation-writer.ts`
- `website/src/lib/substrate/__tests__/accreditation-store-k1-fields.test.ts`
- `website/src/lib/sage-reflect/sage-assent-feed.ts`
- `website/src/app/api/accreditation/[agent_id]/route.ts`
- `website/src/app/api/accreditation/[agent_id]/response-builders.ts`
- `website/src/app/api/accreditation/[agent_id]/loop-closure-gate.ts`
- `website/src/app/api/accreditation/[agent_id]/__tests__/loop-closure-gate.test.ts`
- `website/src/app/api/accreditation/[agent_id]/__tests__/route.test.ts`
- `website/src/app/api/admin/accreditation-credentials/validation.ts`
- `website/supabase-agent-accreditation-k1-coverage-migration.sql`
- `trust-layer/accreditation/agent-id-vocabulary.ts`
- `trust-layer/accreditation/coverage-status.ts`
- `trust-layer/accreditation/accreditation-record.ts`
- `trust-layer/accreditation/public-endpoint.ts`
- `trust-layer/types/accreditation.ts`
- `operations/decision-log.md`
- `operations/handoffs/founder/2026-06-13-mechanism-correction-M3-accreditation-close.md` (this file)
- `operations/handoffs/founder/2026-06-13-mechanism-correction-M4-gate-quick-tier-NEXT-SESSION-PROMPT.md`
- `CLAUDE.md`

**Production state at session close (2026-06-13):** per PR18 — **no production change this session.** Nothing pushed yet; on push, the M3 commit is **behaviourally inert**: both CI-4 flags UNSET (`SUBSTRATE_LOOP_CLOSURE_GATE_ENABLED` / `_REJECT` → gate returns `enforced:false`, response byte-identical); the CI-11 migration is **not** applied in production (the three columns don't exist there yet; the read folds them to null; the write composer's opts are dropped at a row builder that has no such columns until the migration runs — **the production migration is a pending founder 0c-ii step**); the only always-on behaviour the push carries is the **agent_id vocabulary check** on the write boundary + the **store chokepoint guard** — a previously-writable legacy `agent_*` id still passes; only a free-form id (which would already have 404'd on read) is now refused at write (closing FX-11). All previously-Live surfaces unchanged (R20a ×4 true; A10/A11b/A12/A13/A14/A19/GDPR Live; M1 levers inert; M2 CI-6 live; Layer 3 + R20b inert; Stripe `not_configured`). 0h: HELD — unchanged.

## Open Questions

- **Pending founder 0c-ii activations** (each its own step): the CI-11 production migration (`supabase-agent-accreditation-k1-coverage-migration.sql`, TEST first then production); the CI-4 flag(s) (intended path: enable flag mode after M5 lands the closure markers, escalate to reject by its own step once chains demonstrably close — reject mode before M5 would refuse every redirection-bearing write).
- The leg-B `agent_accreditation` seed row (`p1-comparison-leg-b-agent`) is now an **FX-11-class id the chokepoint guard would refuse to re-write** — its disposition is a carried founder item (clear it as test material; it cannot be re-seeded through the guarded path).
- Carried from M2: the `/api/keys` 100/100/1 vs adopted 30/1/1 split (founder decision); the M1 activation checklist; the 0h call.

## Founder Verification

**AI-performable (already run green this session):**
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsc --noEmit
npx tsx "src/lib/substrate/trust-layer/accreditation/__tests__/agent-id-vocabulary.test.ts"
npx tsx "src/lib/substrate/trust-layer/accreditation/__tests__/coverage-status.test.ts"
npx tsx "src/app/api/accreditation/[agent_id]/__tests__/loop-closure-gate.test.ts"
npx tsx --env-file=.env.local "src/lib/substrate/__tests__/accreditation-store-k1-fields.test.ts"
npx tsx --env-file=.env.local "src/app/api/accreditation/[agent_id]/__tests__/route.test.ts"
```
Expected: tsc silent; `114 passed`; `26 passed`; `29 passed`; `14 passed, 0 failed`; `Total: 90 Pass: 90 Fail: 0`.

**Founder-walked TEST live leg (PR17 — the FX-11 + K1 production-shape proof, on TEST only):**
1. Apply `website/supabase-agent-accreditation-k1-coverage-migration.sql` in the **TEST** Supabase SQL editor (run the §0 pre-flight, the three ALTERs, the §4 verify — expect the three columns + the CHECK).
2. CLI-mint an `sr_assent_` credential on a K1-canonical id (e.g. `sagereasoning:m3-test@v1`) via `website/scripts/mint-credential.ts` (against TEST).
3. POST a record for that id (`SUBSTRATE_WRITE_PATH_ENABLED=true` in `.env.development.local`) → **public GET returns it** (today's FX-11 repro — the same id 404s before this change) → the K1 fields show honest values (`coverage_status: agent_elected`, a `credential_basis` naming `window self-reported by submitter`).
4. GET an unknown-but-valid id → 404; GET a free-form id (`p1-comparison-leg-b-agent`) → 400 with the shared vocabulary message.
5. Revoke the credential via the CLI; remove the TEST-only flag/secret at teardown.

Commit: stage the files above by name; push via GitHub Desktop. Vercel deploys a **behaviourally inert** change (flags unset, no production migration) — expect green.

## Cross-references

- `operations/handoffs/founder/2026-06-13-mechanism-correction-M3-accreditation-NEXT-SESSION-PROMPT.md` (this session's operative prompt)
- `operations/handoffs/founder/2026-06-13-mechanism-correction-M2-mint-close.md` (predecessor)
- `operations/p1-rebuild-2026-06/mechanism-correction-build-plan.md` (approved plan; CI-11/CI-12/CI-4)
- `adopted/adr/2026-05-26-credential-scope-and-coverage-status.md` (K1 ADR — coverage_status vocabulary carried)
- Decision log: `D-MECHANISM-CORRECTION-M3-ACCREDITATION-BUILT-TEST-VERIFIED-2026-06-13`
- M4 prompt: `operations/handoffs/founder/2026-06-13-mechanism-correction-M4-gate-quick-tier-NEXT-SESSION-PROMPT.md`

*End of session close. Stabilised: every accreditation record that can be written is now readable through its own public path (by construction, across all three write surfaces); the credential carries honest K1 coverage that a consumer cannot forge; the loop-closure requirement is built dark at the R18f write boundary; both P1 Box-1 catches are closed in code. Production is untouched — the TEST migration, the live leg, and every flag remain founder-elected 0c-ii steps.*
