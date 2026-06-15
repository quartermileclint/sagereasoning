# Session Close — 2026-06-15 — Carried activations: M3-CI-11 (K1 coverage columns) + M5 (practice hint + core cadence/reflect docs) — LIVE

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`. PR1 (TEST before prod); PR17 (every Supabase/Vercel step founder-walked live); PR18 at close.
**Tier:** **`code-critical`** ×2 — a prod schema migration (M3-CI-11) + a prod env-flag activation (M5), each its own 0c-ii Critical Change Protocol, completed live. The doc inserts are Elevated (R18) and rode the M5 flag.
**Environment:** Claude Code on the founder's machine (TEST + production reachable). Model: Opus 4.8 (1M).
**Date:** 2026-06-15.
**Operative prompt:** `operations/handoffs/founder/2026-06-15-mechanism-correction-carried-activations-M1-M3CI11-M4-M5-NEXT-SESSION-PROMPT.md` (founder elected the **"light pair" — M3-CI-11 + M5**; M1 and M4 not in scope).
**Predecessor close:** `operations/handoffs/founder/2026-06-15-credential-consolidation-CI14-completion-step6e-step7-close.md` (CI-14 fully complete).

## What this session did

Founder-walked two carried mechanism-correction levers to **LIVE in production**. The AI performed no Supabase/Vercel/git operation — the founder ran every live step; the AI guided + verified.

- **M3-CI-11 — K1 coverage columns (prod migration).** Applied `website/supabase-agent-accreditation-k1-coverage-migration.sql` on production (three nullable additive columns `coverage_status`/`monitored_since`/`credential_basis` + the `agent_accreditation_coverage_status_check` CHECK). §0 pre-flight confirmed the columns ABSENT (the breakage); §1–3 ALTERs applied; §4 VERIFY green (3 nullable columns + 1 constraint). TEST already carried the columns (DDL proven there in the M3 session).
- **M5 — practice hint + core docs (prod flag + docs).** `SUBSTRATE_PRACTICE_CYCLE_HINT_ENABLED=true` set in Vercel (Production) + redeployed → the additive `practice` reflect-at-close hint is now served on the `/api/reason` consult happy-path + the accreditation-write 200. The **core** CI-15 two-gate cadence + CI-13 reflect-at-close staged docs were applied to `llms.txt` + `agent-card.json` (heavier api-docs/mcp-contracts/skill-registry surfaces deferred).

**Material finding (adversarial pre-activation review, verified first-hand):** **production accreditation writes were already broken** before this migration. The deployed M3 store (`accreditationRecordToRow`, `sage-assent-accreditation-store.ts:344-346`) unconditionally sends the three K1 column keys into an awaited `.upsert`; PostgREST rejects unknown columns (PGRST204); the columns were unapplied in prod. Latent since the M3 push, unsurfaced only because there are no external users. **M3-CI-11 is therefore a FIX restoring broken writes**, not merely "the coverage fold goes live." (The M3 close's belief that the opts "are dropped at a row builder that has no such columns" was incorrect — the row always carries the keys.)

**Method (ultracode):** a 6-agent adversarial pre-activation review (5 dimensions + synthesis) returned overall **GO_WITH_FIX** — one blocking fix (a staged-doc cross-ref drift), applied before the docs; write-breakage hypothesis TRUE; M5 flag-off byte-identity + flag-on shape confirmed; staged docs R18-honest; proximity phrasing still correct post-M7; plus a current-state drift map of the doc-insert surfaces.

## Decisions Made
- `D-MECHANISM-CORRECTION-CARRIED-ACTIVATIONS-M3CI11-M5-PRODUCTION-2026-06-15` appended (Critical form, both activations).

## Status Changes
| Item | Old | New |
|---|---|---|
| M3-CI-11 K1 coverage columns | Built (TEST-migrated; prod pending) | **LIVE on production** (migration applied + §4 verified) |
| Prod accreditation write path | Latently broken (PGRST204, columns missing) | **Restored** (columns now present) |
| M5 CI-13 `practice` hint | Built dark (flag UNSET) | **LIVE** (`SUBSTRATE_PRACTICE_CYCLE_HINT_ENABLED=true`, Production) |
| M5 CI-15 two-gate cadence + CI-13 reflect docs | Staged | **Core surfaces applied** (llms.txt + agent-card); heavier surfaces deferred |
| `sage-assent-accreditation-store.test.ts` RT-1/RT-2 | Red (81/2 — stale fixtures) | **Green (83/0)** |

## Verification Method Used (0c framework / PR10 PEV)
- **AI-side (local, re-run this session):** `tsc --noEmit` exit 0; coverage-status 26/0, agent-id-vocabulary 114/0, loop-closure-gate 29/0, accreditation-store-k1-fields 14/0, accreditation route 90/0, practice-cycle-hint 13/0, m5-docs-staged 22/0, reason-loop-closure 33/0; the fixed store round-trip 83/0. agent-card.json re-validated as parseable JSON (9 extensions).
- **6-agent adversarial pre-activation review:** GO_WITH_FIX; write-breakage TRUE; all M5/M3 honesty + byte-identity axes clean; the one blocking fix folded.
- **M3-CI-11 prod (founder-walked):** §0 pre-flight (3 K1 columns ABSENT) → §1–3 ALTERs → §4 VERIFY (3 nullable columns + the CHECK present).
- **M5 prod (founder-walked, lighter verification elected):** env var `=true` on Production + redeploy green; flag-on behaviour proven by practice-cycle-hint.test.ts (13/0) + the review. No live consult smoke (proportionate to a purely additive non-auth field; rollback is unset-the-flag).

## Risk Classification Record (0d-ii)
- **M3-CI-11 — Critical** (prod schema migration): additive nullable columns + a CHECK that validates trivially against all-NULL existing rows; no table rewrite; reversible by DROP×3 (note: rollback re-breaks writes). No auth/perimeter touch.
- **M5 — Critical** (prod env-flag activation): a pure additive top-level `practice` field, disjoint from every other field, success-path-only on accreditation-write, KG1-clean; flag-off byte-identical. CI-13 docs pushed only after the flag was live (R18).
- R18f provenance gate, R20a/distress, Layer-2 signing, UPC auth path, B1 trajectory, B2 CI-4, CI-10 metering — **all untouched.** AC7 not engaged. PR6 not engaged.

## Next Session Should
The remaining mechanism-correction items are independent founder elections, each its own 0c-ii: **(1) M1 consult-path activation** (the heaviest — prod migration `20260612_m1_substrate_audit_narratives.sql` + 2 flags `SUBSTRATE_L3_DEFER_ENABLED`/`SUBSTRATE_L1_SCHEMA_KEY_PATH_ENABLED` + the `vercel.json` narrative-sweep cron + Fluid-Compute check + staged docs + privacy sentence — note the `l1_supply`-enforcement sequencing per the carried prompt Part A). **(2) the deferred M5 doc surfaces** (api-docs/mcp-contracts/skill-registry — a small follow-up). **(3) parked CI-16** (gate-engine value classification). **(4) the 0h launch call** — the one true launch gate (a founder strategic decision, verdict-memo §8). No next-session prompt is owed; the carried-activations prompt still covers M1 + M4.

## Blocked On
**Files remaining uncommitted (the founder commits by name; the AI did no git ops):**
- CHANGED: `website/public/llms.txt`, `website/public/.well-known/agent-card.json`, `website/src/lib/substrate/__tests__/sage-assent-accreditation-store.test.ts`, `operations/p1-rebuild-2026-06/m5-docs-staged-for-activation.md`, `operations/decision-log.md`, `CLAUDE.md`.
- NEW: this close.
- **Exclude:** `website/tsconfig.tsbuildinfo`; never stage `.env*`.

**Production state at session close:** **M3-CI-11 K1 coverage columns are LIVE on production** (migration applied; accreditation writes restored; public payload folds to null for existing rows, honest values on new writes). **M5 CI-13 `practice` hint is LIVE** (`SUBSTRATE_PRACTICE_CYCLE_HINT_ENABLED=true`, Production) with the core CI-15/CI-13 docs applied to llms.txt + agent-card (live on the doc push). CI-14 (UPC + 6e + Step 7), the four R20a flags, B1 trajectory, B2 CI-4, CI-10 metering, the UPC auth path — all remain Live, untouched. Stripe `not_configured`. 0h: **HELD** — unchanged.

## Open Questions
- The deferred M5 doc surfaces (api-docs/mcp-contracts/skill-registry) — founder-elected follow-up; the staged doc carries the corrected instructions (agent skills only; api-docs needs a new subsection since `/api/reason` is absent from its endpoints array).
- Carried unchanged: M1 activation; parked CI-16; `/api/keys` 100/100/1 vs admin 30/1/1; the leg-B seed-row disposition; the 0h call.

## PR5 Knowledge-Gap Carry-Forward
- **A "build-dark, migrate-later" feature whose deployed code already WRITES the new columns has a broken write path in prod until the migration lands** — the migration is a fix, not just a feature. Verify the row-builder's actual key set, not the close's prose belief. (This session's M3-CI-11 finding; memory candidate.)
- **tsx + `security.ts` keepalive** (carried): the accreditation route suite prints its summary then hangs; use the redirect-to-file + timeout-kill runner, never `| tail` (memory `tsx-tests-setinterval-keepalive-hang`).
- **PR17 + project-confusion guard:** read-only `SELECT`s batched across TEST/prod are safe; the mutating ALTERs were run only after an explicit "go ahead" + a project re-confirm.

## Founder Verification (Between Sessions)
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsc --noEmit                                                                                   # exit 0
node_modules/.bin/tsx --env-file=.env.local src/lib/substrate/__tests__/sage-assent-accreditation-store.test.ts > /tmp/s.txt 2>&1; tail -1 /tmp/s.txt   # 83 passed / 0 failed
node_modules/.bin/tsx src/lib/__tests__/practice-cycle-hint.test.ts > /tmp/p.txt 2>&1; tail -1 /tmp/p.txt    # 13 passed
node_modules/.bin/tsx src/lib/__tests__/m5-docs-staged.test.ts > /tmp/m.txt 2>&1; tail -1 /tmp/m.txt         # 22 passed
python3 -c "import json; print('agent-card extensions:', len(json.load(open('public/.well-known/agent-card.json'))['capabilities']['extensions']))"   # 9
```
Then commit (by name) + push via GitHub Desktop. **The push carries doc + test + record changes only** — the M5 flag is already live in Vercel and the M3-CI-11 migration was founder-applied, so the deploy serves the now-honest CI-13 docs alongside the already-live `practice` field. Expect Vercel green.

## Orchestration Reminder
The two production changes (the prod migration + the Vercel flag) were founder-performed live this session; the commit carries only the doc inserts, the red-test fix, the staged-doc precision fixes, the decision-log entry, the CLAUDE.md refresh, and this close. **Rollback:** M3-CI-11 — DROP the three columns (only if the migration is faulty — it is verified); M5 — unset `SUBSTRATE_PRACTICE_CYCLE_HINT_ENABLED` + redeploy / `git revert` the docs. Nothing here touches the UPC auth path, R18f, R20a, distress, or Layer-2.

## Cross-references
- `D-MECHANISM-CORRECTION-CARRIED-ACTIVATIONS-M3CI11-M5-PRODUCTION-2026-06-15` (the authoritative record)
- `D-MECHANISM-CORRECTION-M3-ACCREDITATION-BUILT-TEST-VERIFIED-2026-06-13` (CI-11 build) · `D-MECHANISM-CORRECTION-M5-PRACTICE-COMPLETION-BUILT-TEST-VERIFIED-2026-06-14` (M5 build)
- `operations/handoffs/founder/2026-06-15-mechanism-correction-carried-activations-M1-M3CI11-M4-M5-NEXT-SESSION-PROMPT.md` (the prompt this close answers; still covers M1 + M4)
- `operations/p1-rebuild-2026-06/m5-docs-staged-for-activation.md` (the staged docs — core surfaces applied, heavier deferred)
- Predecessor: `operations/handoffs/founder/2026-06-15-credential-consolidation-CI14-completion-step6e-step7-close.md`

*End of session close. M3-CI-11 (K1 coverage columns — and the latent accreditation-write fix) and M5 (the reflect-at-close `practice` hint + the core two-gate-cadence/reflect docs) are LIVE in production, founder-walked, adversarially pre-verified. The remaining mechanism-correction items are the carried M1 activation, the deferred M5 doc surfaces, parked CI-16, and the 0h launch call.*
