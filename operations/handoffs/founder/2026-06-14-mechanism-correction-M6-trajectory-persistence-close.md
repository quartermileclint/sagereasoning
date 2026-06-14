# Session Close — 2026-06-14 — Mechanism-Correction M6: trajectory persistence (CI-5 — schema + write half)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`.
**Tier:** `schema` (Standard, idempotent additive migration) + `code-elevated` (an awaited write on Live `/api/reason` + the data-rights extensions). Lean + Elevated additions.
**Date:** 2026-06-14.
**Predecessor close:** `operations/handoffs/founder/2026-06-14-mechanism-correction-M5-practice-completion-close.md`.

## What this session did

Built the **continuity half of the Character-Kernel claim** (FX-6 / dossier B5): a standalone `agent_assessment_history` table now persists one structural row per `/api/reason` consult, keyed to the consulting credential, written **awaited + flag-gated**, with genuine deletion wired into the existing user-JWT data-rights paths. **WRITE-ONLY this half** — the engine does NOT read history back; determinism is untouched (the read/activation is M7). Ships **production-inert** (flag UNSET; migration TEST-first).

- **Two path-check corrections** (the prompt's "verify before citing"): `evaluated_actions` is **already built** (Sage Reflect Stage A; TEST-verified 2026-05-25) — so Step 1(a) was verified+cited, not recreated, and per-consult rows go in a **separate** table (writing into `evaluated_actions` would create an unintended read-back through Sage Reflect/Assent's aggregator + FK-violate). And `/api/reason` carries **no agent identity** at the seam today — so the credential identity is derived off the already-validated credential, flag-gated (no auth-surface change).
- **Founder election at open:** identity model = **Standalone, credential-keyed** — `credential_ref` (`api_key:<id>` | `install:<id>`) + a denormalised `owner_user_id` (operator = `profiles.id`) for the user-JWT data-rights paths + a nullable validated K1 `agent_id`. Decoupled from `agent_accreditation`; EvaluatedAction-shaped (reuses the canonical bridge) so M7 reuses `computeWindowSnapshot`.
- **Adversarial review** (6 dimensions): KG1/determinism, flag-off byte-identity, and migration SQL came back clean. Real fixes applied (bridge `agent_id` projection clarified; `depth_tier` CHECK removed — `depth` is type-safe; the missing-table route checks simplified to lean on the store's `isMissingTableError`, which catches PostgREST's PGRST205). The "critical null-owner deletion gap" was reframed (not fixed by the reviewer's suggestion) — see Open Questions.

## Decisions Made
- `D-MECHANISM-CORRECTION-M6-TRAJECTORY-PERSISTENCE-BUILT-TEST-VERIFIED-2026-06-14` appended. M6 (CI-5 schema+write) built + TEST-Verified at the assertion level; production-inert.

## Status Changes
| Item | Old | New |
|---|---|---|
| CI-5 trajectory persistence — schema half (`agent_assessment_history`) | Scoped | **Built; TEST-Verified (assertion-level)** — migration applies on TEST at activation (production its own 0c-ii step) |
| CI-5 trajectory persistence — write half (`/api/reason` awaited write) | Scoped | **Built; Verified (assertion-level)** — flag UNSET = byte-identical; founder-walked TEST legs pending 0c-ii |
| `agent-assessment-history-store.ts` + the data-rights extensions | — | **Built; Verified (60 store assertions; tsc clean)** |
| `evaluated_actions` (Step 1a) | assumed unmigrated | **Verified ALREADY BUILT (Stage A); cited, not recreated** |

## Next Session Should
Execute **M7 — trajectory activation (CI-5 read half)**, per `operations/handoffs/founder/2026-06-14-mechanism-correction-M7-trajectory-activation-NEXT-SESSION-PROMPT.md`. This is the **determinism-sensitive** half: the windowed read (D17, 90d/last-30) feeds Rule 10 as deterministic carried-context inputs, surfaces `direction_of_travel`/grade honestly (CONFIDENCE_WEIGHTED bands; `single_snapshot` on sparse evidence), and makes **CI-15's proximity-calibrated depth operational**. Risk: `code-elevated` (engine read-path change; the grade-hysteresis + same-inputs→same-output property must be preserved). Pre-conditions: the M6 commit pushed; the M6 migration applied on TEST; rows accumulating.

## Blocked On
**Files remaining uncommitted (the founder commits by name; the AI did no git ops):**
- `website/supabase/migrations/20260614_m6_agent_assessment_history.sql` (NEW)
- `website/src/lib/substrate/agent-assessment-history-store.ts` (NEW)
- `website/src/lib/substrate/__tests__/agent-assessment-history-store.test.ts` (NEW)
- `website/src/app/api/reason/route.ts` (M6 imports + the awaited write block)
- `website/src/app/api/user/delete/route.ts`, `website/src/app/api/user/export/route.ts`
- this close; the decision-log entry; the M7 prompt
- **Exclude:** `website/tsconfig.tsbuildinfo`; never stage `.env*`.

**Production state at session close:** **unchanged** from M5. M6 is production-inert: the write flag is UNSET (byte-identical — no write, no new DB read) and `agent_assessment_history` is not migrated in production. On push, the only Live-route change is additive + dormant — the data-rights routes call the new store helpers, which return benign (missing-table) until the migration lands, so `/api/user/delete` + `/api/user/export` behave identically today. The four R20a flags remain `true`; CI-10 Live.

## Open Questions
- **Pending founder-elected 0c-ii (M6 activation):** apply the migration on TEST → founder-walked TEST live legs (mint a **per-install `sr_inst_`** TEST credential via the CI-7 CLI to exercise the owner-bearing delete/export end-to-end; an `sr_live_` key also persists but carries no owner) → two consults → two rows keyed to the credential → the delete path removes them (SQL-verified) → then the production migration + setting the flag, each its own step.
- **The null-owner / external-consumer R17c boundary (needs your awareness at activation):** `sr_live_` API keys are issued to external consumers with no `profiles`/JWT account, so their rows carry `owner_user_id = NULL` and are *not* reachable by the user-JWT delete/export (the consumer is not a JWT user). We still persist their trajectory (skipping it would gut CI-5's primary surface); their R17c is the 90-day `retain_until` retention limit. Two named follow-ups: (a) a **trajectory-retention sweep** to actually enforce `retain_until` (mirrors the M1 narrative-sweep); (b) **set `owner_user_id` on `sr_live_` mints + backfill** (the legacy `/api/admin/api-keys` route leaves it null — fits the CI-14/M8 credential-consolidation track). The adversarial review's "critical" finding is this boundary; its suggested fix (owner NOT NULL + skip the write) was rejected as it would exclude the whole external surface.
- **Carried:** the M1 activation checklist; the M3 CI-11 migration + CI-4 write-boundary flags; the M5 CI-4/CI-13 flag activations + the CI-15/CI-13 staged-docs application; the M4 CI-9 replay-ack; `/api/keys` 100/100/1 vs 30/1/1; the leg-B seed-row disposition; **the 0h call**.

## Founder Verification
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsc --noEmit
npx tsx src/lib/substrate/__tests__/agent-assessment-history-store.test.ts
```
Expected: tsc silent; `60 passed, 0 failed`. Then commit the files above and push via GitHub Desktop. **Vercel deploy is behaviourally inert** — the write flag is UNSET and the table is not migrated in production; the data-rights routes behave identically (the store no-ops on the missing table).

## Cross-references
- `operations/handoffs/founder/2026-06-14-mechanism-correction-M6-trajectory-persistence-NEXT-SESSION-PROMPT.md` (the prompt this close answers)
- `operations/handoffs/founder/2026-06-14-mechanism-correction-M7-trajectory-activation-NEXT-SESSION-PROMPT.md` (next)
- `D-MECHANISM-CORRECTION-M6-TRAJECTORY-PERSISTENCE-BUILT-TEST-VERIFIED-2026-06-14`
- `operations/p1-rebuild-2026-06/mechanism-correction-build-plan.md` (CI-5 = M6/M7)
- `adopted/adr/2026-05-26-credential-scope-and-coverage-status.md` (K1 — the identity key)
- `website/supabase/evaluated-actions` lineage: `D-SAGE-REFLECT-L2COMPLETE-L4-L6-VERIFIED-2026-05-25`

*End of session close. M6 (CI-5 schema+write) is built, TEST-Verified at the assertion level, and production-inert; the agent trajectory now persists durably (awaited, flag-gated, credential-keyed) with genuine deletion wired for owner-bearing credentials. The arc continues at M7 (the read + activation half — where determinism re-enters and CI-15's proximity-calibrated depth goes live), then M8 (CI-14 design) and the parked CI-16.*
