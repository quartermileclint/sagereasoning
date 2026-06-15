# Session Close — 2026-06-15 — Mechanism-correction M1: consult-path **production activation** — LIVE

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`. PR1 (TEST/recorded-TEST before prod); PR17 (every Supabase/Vercel/git step founder-walked live — the AI performed none); PR18 at close.
**Tier:** **`code-critical`** — a prod schema migration + two independent env-flag activations + a deployment-config change (`vercel.json` cron) + a Vercel **Hobby→Pro** upgrade, each its own 0c-ii Critical Change Protocol gate, completed live. The R18 public-doc inserts rode the now-live behaviour.
**Environment:** Claude Code on the founder's machine (TEST + production reachable). Model: Opus 4.8 (1M).
**Date:** 2026-06-15.
**Operative prompt:** `operations/handoffs/founder/2026-06-15-mechanism-correction-M1-consult-path-activation-NEXT-SESSION-PROMPT.md`.
**Predecessor close:** `operations/handoffs/founder/2026-06-15-carried-activations-M3CI11-M5-close.md`.

## What this session did

Founder-walked the **M1 consult-path levers to LIVE in production** — the heaviest and last of the carried mechanism-correction activations. The AI performed no Supabase/Vercel/git operation; the founder ran every live step; the AI guided + verified.

- **Step 1 (AI, ultracode):** a 7-dimension / 12-agent adversarial pre-activation review → **GO_WITH_FIX** (no upheld critical; every blocking finding's code trace confirmed first-hand, nothing refuted as fictional). Two non-blocking code findings folded (below).
- **Step 2 (founder-walked checks):** Fluid Compute **ON**; `MENTOR_ENCRYPTION_KEY` present; `CRON_SECRET` present — all GO-conditions met.
- **Step 3 (prod migration):** `supabase/migrations/20260612_m1_substrate_audit_narratives.sql` applied on production under the CCP — §0 ABSENT→ §verify green (19 cols / 5 indexes / 4 CHECKs / `rls_enabled=t` / `table_present=t`). Migration landed **before** the defer flag (hard ordering).
- **Step 4 (Sub-activation A):** `SUBSTRATE_L3_DEFER_ENABLED=true` + the `vercel.json` narrative-sweep cron (`0 * * * *`) in the **same deploy**. Prod smoke (throwaway `sr_prac_` consult, `assessment_first`): fast assessment, `prose:null`, `narrative:{status:'deferred',correlation_id}`; the narrative row landed **`retained`/`deferred`/`prose_source=llm`/encrypted/`retain_until +90d`** (`waitUntil` completion via Fluid Compute; the encrypted row proves `MENTOR_ENCRYPTION_KEY`). Sweep curl → `flag_enabled:true`; no-auth → 401.
- **Step 5 (Sub-activation B):** `SUBSTRATE_L1_SCHEMA_KEY_PATH_ENABLED=true`. Prod probes: a consult-only `sr_prac_` supplying a `layer1_schema` → **403** "Insufficient capability" (the never-run UPC `l1_supply` fail-closed branch — clean, writes nothing); a `consult+l1_supply` `sr_prac_` supplying a valid schema → **HTTP 200** full consult (schema accepted; `meta.layer1_source:'supplied'` guaranteed by construction).
- **Step 6 (R18 docs):** the CI-17 blocked-config statement (Q2 verbatim), the CI-2 open-Layer-1 contract (incl. `l1_supply`/`sr_prac_`), the CI-1 `response_format` + R17 retention disclosure → `llms.txt` + `agent-card.json` (now 10 extensions); a NEW api-docs `/api/reason` subsection; a **privacy §9 sentence** (90-day encrypted retention + deletion-on-request); **CI-3 latency kept TEST-labelled** (R18 — no prod envelope measured).

**Platform change (required):** the Vercel project was **upgraded Hobby → Pro**. Hobby caps crons at 2 (daily-only) and the project already had 2, so the 3rd hourly narrative-sweep cron could not register — the first `0721191` deploy errored on the Hobby cron limit, leaving prod on `b954360` (with the env var applied to the old commit). Pro (40 crons, any frequency) + a fresh redeploy brought it live.

**In-session fixes folded (review-driven; byte-identical / additive):**
- **FH-1 (audit honesty, founder-elected):** the A12 audit row now carries `narrative_retained` so an inline retention failure cannot be masked as a clean `narrative_status:'inline'`; the consumer-facing `meta.narrative_status` is unchanged.
- **L1SUP-1 (coverage):** the `l1_supply` 403 decision extracted to a pure `l1SupplyRefused` helper + unit-tested; the route wiring is byte-identical.
- A migration rollback-order precondition comment (MS-6).

## Decisions Made
- `D-MECHANISM-CORRECTION-M1-CONSULT-PATH-PRODUCTION-ACTIVATION-2026-06-15` appended (Critical form).

## Status Changes
| Item | Old | New |
|---|---|---|
| M1 CI-1 (L3 deferral + retention) | Built (TEST-Verified, prod-inert) | **LIVE on production** |
| M1 CI-2 (key-path layer1_schema) | Built (TEST-Verified, prod-inert) | **LIVE on production** |
| M1 CI-17 (narrative-existence guarantee) | Built | **LIVE** (smoke-verified: encrypted row retained) |
| `substrate_audit_narratives` | TEST only | **Migrated + active on production** |
| `/api/cron/narrative-sweep` | deployed inert (no cron entry) | **Scheduled hourly (Pro), `flag_enabled:true`** |
| Vercel plan | Hobby | **Pro** (required for the 3rd hourly cron) |
| `practice-credential.test.ts` | 33/0 | **37/0** (l1SupplyRefused cases) |

## Next Session Should
The remaining mechanism-correction items are independent founder elections: **(1) the deferred M5 doc surfaces** (api-docs practice-cycle / `mcp-contracts.ts` / `skill-registry.ts` — a small follow-up). **(2) parked CI-16** (gate-engine value classification). **(3) the 0h launch call** — now the gating launch item (a founder strategic decision, verdict-memo §8). Optional M1 tails: a clean **production CI-3 latency measurement** (to replace the TEST label), the **consumer-facing narrative-retrieval endpoint** (R17a), and the **CI-17 manifest-rule candidate** (its own governance session). No next-session prompt is owed.

## Blocked On
**Files remaining uncommitted (the founder commits by name; the AI did no git ops):**
- CHANGED: `CLAUDE.md`, `operations/decision-log.md`, `operations/p1-rebuild-2026-06/m1-docs-staged-for-activation.md`, `website/public/llms.txt`, `website/public/.well-known/agent-card.json`, `website/src/app/api-docs/page.tsx`, `website/src/app/privacy/page.tsx`.
- NEW: this close.
- **Exclude:** `website/tsconfig.tsbuildinfo`; never stage `.env*`.
- Already committed live this session (3 commits): `0721191` (vercel.json cron + FH-1 + migration comment), `af66e0d` (Pro redeploy), `ded568e` (l1SupplyRefused helper + test).

**Production state at session close:** **M1 is LIVE in production** — both flags `true`; `substrate_audit_narratives` migrated; the hourly narrative-sweep cron scheduled (Pro); the deferred shape + key-path L1 + encrypted 90-day narrative retention all serving and prod-verified. CI-14 (UPC/6e/Step-7), M3-CI-11, M5, B1 trajectory, B2 CI-4, CI-10 metering, the four R20a flags, the UPC auth path — all remain Live, untouched. Stripe `not_configured`. **0h: HELD** — now the one true remaining launch gate.

## Open Questions
- CI-3 latency carries the TEST label until a clean production envelope is measured (R18).
- The privacy §9 wording is a conservative factual placeholder — the lawyer refines it at the Stage-1 engagement.
- Carried unchanged: M5 deferred doc surfaces; parked CI-16; the `/api/keys` 100/100/1 vs admin 30/1/1 split; the leg-B seed-row disposition; the 0h call.

## Verification Method Used (0c framework / PR10 PEV)
- **AI-side (local):** `tsc --noEmit` 0; `npm run build` 0 (×3 — route FH-1, l1SupplyRefused, docs); narrative-retention 19/0, prose-deferral 26/0, substrate-audit-writer 25/0, practice-credential 37/0. agent-card.json re-validated (10 extensions).
- **7-dim/12-agent adversarial pre-activation review:** GO_WITH_FIX; GO-conditions honoured as founder-walked gates; both code findings folded.
- **Prod (founder-walked):** §0/§verify on the migration; the Sub-A deferred-consult smoke (encrypted `retained` narrative row + sweep `flag_enabled:true` + no-auth 401); the Sub-B probes (403 fail-closed + 200 schema-accepted); teardown counts (0/0) confirmed.

## Risk Classification Record (0d-ii)
**Critical** — two prod env-flag activations + a prod schema migration + a deployment-config change + a platform upgrade. **No auth/perimeter touch:** R18f provenance gate, R20a/distress classifier, A5/A7, Layer-2 signing, the UPC auth path — all untouched (deferral structurally unavailable for distress signals; git-confirmed M1 modified none of those files). AC7 not engaged. The build-arc no-users note covers CCP step 3. Each flag rolls back to byte-identical via unset+redeploy; the migration is additive + reversible (flag-off first).

## PR5 Knowledge-Gap Carry-Forward
- **Vercel Hobby caps crons at 2 (daily-only); a 3rd / hourly cron silently fails to register and can error the deploy** (the deploy stays on the prior commit). Adding cron capacity or any hourly cron requires Pro. (This session's blocker; memory candidate.)
- **"Success. No rows returned" in the Supabase SQL editor is the standard message for a `DELETE`/`UPDATE` without `RETURNING` — it does NOT report the row count.** Always confirm a teardown delete with a follow-up `SELECT count(*)`. (Surfaced twice this session.)
- Carried: the `MENTOR_ENCRYPTION_KEY` round-trip is the load-bearing pre-condition for any encrypted-retention activation — confirm present before the flag (the encrypted-then-retained row is the proof).

## Founder Verification (Between Sessions)
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsc --noEmit                                                                              # exit 0
npx tsx src/lib/substrate/__tests__/narrative-retention.test.ts                              # 19 passed
npx tsx src/lib/translation-sandwich/__tests__/prose-deferral.test.ts                        # 26 passed
npx tsx src/lib/__tests__/practice-credential.test.ts                                        # Total 37  Pass 37
npx tsx --env-file=.env.local src/lib/substrate/__tests__/substrate-audit-writer.test.ts     # 25 passed
python3 -c "import json; print('agent-card extensions:', len(json.load(open('public/.well-known/agent-card.json'))['capabilities']['extensions']))"   # 10
```
Then commit (by name) + push via GitHub Desktop. **The push carries doc + record changes only** — both flags are already live in Vercel, the prod migration was founder-applied, and the code/config (FH-1, l1SupplyRefused, vercel.json cron) shipped in the 3 earlier commits, so the deploy serves the now-honest R18 docs alongside the already-live behaviour. Expect Vercel green.

## Orchestration Reminder
Every production change (the migration, both Vercel flags, the cron deploy, the Pro upgrade) was founder-performed live this session; the AI did no Supabase/Vercel/git op. The final commit carries only the R18 docs, the privacy sentence, the staged-doc mark, the decision-log entry, the CLAUDE.md PR18 refresh, and this close. **Rollback:** unset either flag + redeploy (byte-identical) / `DROP TABLE substrate_audit_narratives` (flag-off first) / `git revert` the cron+docs (Pro can stay). Nothing here touches the UPC auth path, R18f, R20a, distress, A7/A5, or Layer-2 signing.

## Cross-references
- `D-MECHANISM-CORRECTION-M1-CONSULT-PATH-PRODUCTION-ACTIVATION-2026-06-15` (the authoritative record)
- `D-MECHANISM-CORRECTION-M1-CONSULT-PATH-BUILT-VERIFIED-2026-06-13` (the build) · the M1 build close (2026-06-13)
- `operations/handoffs/founder/2026-06-15-mechanism-correction-M1-consult-path-activation-NEXT-SESSION-PROMPT.md` (this session's prompt)
- `operations/p1-rebuild-2026-06/m1-docs-staged-for-activation.md` (applied)
- Predecessor: `operations/handoffs/founder/2026-06-15-carried-activations-M3CI11-M5-close.md`

*End of session close. M1 (L3 prose deferral + key-path Layer-1 + the CI-17 narrative-existence guarantee with 90-day encrypted retention) is LIVE in production, founder-walked, adversarially pre-verified. The mechanism-correction build arc's last activation is complete — only the deferred M5 doc surfaces, parked CI-16, and the 0h launch call remain.*
