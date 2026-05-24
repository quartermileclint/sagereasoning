# Session Close — 2026-05-24 — Sage Assent Provenance Gate (Option (a)) — CRITICAL build

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Tier:** `code-critical` — **Critical** risk (0d-ii). Full Critical Change Protocol applied. **KG1 engaged** (DB-write route). **PR6 NOT engaged** (no distress / Zone-2 / Zone-3 logic). **Model selection N/A** (deterministic Ed25519 crypto, no LLM — AC1). Substrate-build-arc session.
**Date:** 2026-05-24.
**Deliverable-of-the-day:** the option-(a) ADR `/adopted/adr/2026-05-23-sage-assent-sagereasoning-dependency-enforcement.md` (built, not re-designed).

Opened under the protocol with FULL reads (both caches; the ADR in full; both predecessor closes; decision-log tail; targeted manifest R18f/R18a/R18b/R19/AC7/AC8). Confirmed pre-conditions against the codebase: `website/src` byte-identical between `main` and `whole-system-data-room` (so the production baseline is correct); the signer + canonicaliser + published-key machinery present exactly as the ADR described. PR15 consult: the verify is the missing half of an existing primitive (no Anthropic substitute); F1–F4 target other sessions. Founder elected **Build A → checkpoint → continue into Build B**, working **directly on `main`**.

**A side effect I caused + owned:** an in-sandbox `git checkout main` partially failed (the sandbox cannot unlink the founder's mounted files), leaving a stale `.git/index.lock` + a spurious on-disk `decision-log.md` modification. Founder cleared it host-side (`rm -f .git/index.lock`; `git restore operations/decision-log.md`) → clean `main` tree confirmed. Lesson logged: **no git state changes from the sandbox** — branch ops are host-side only.

## Decisions Made
- `D-SAGE-ASSENT-PROVENANCE-GATE-BUILD-WIRED-VERIFIED-2026-05-24` appended (full form). Built option (a): `verifyLayer2Signature` + signed-provenance write contract + the synchronous provenance gate wired into `POST /api/accreditation/[agent_id]` behind `SUBSTRATE_PROVENANCE_GATE_ENABLED` (OFF by default). 45 assertions pass; `tsc` clean; ships dark.

## Status Changes
| Item | Old | New |
|---|---|---|
| `verifyLayer2Signature` (layer2-verifier.ts) | (none) | **Scaffolded → Wired** (imported by the gate) |
| Provenance write contract (provenance-contract.ts) | (none) | **Scaffolded** (built + unit-tested) |
| Provenance gate (provenance-gate.ts) | (none) | **Wired + Verified (sandbox)** |
| Enforcement gate (option (a)) | Designed (ADR) | **Wired + Verified (sandbox); Live pending flag flip** |
| R18f ("no credential without examination") | Adopted, **unenforced** | **enforced (Live) upon the founder's flag flip + verification** |
| Combination-1 negative test (data room) | documented gap | **flips to passing once the flag is flipped** (doc edit deferred — branch) |

## Next Session Should
Founder's call once the flag is flipped + verified:
- **Run the data-room manual loop (Step 7)** on the `whole-system-data-room` branch — exercises the genuine→200 provenance path end-to-end and flips the room's Combination-1 row from *documented gap* → *passing assertion* (the doc edit deferred this session because the room files live on the branch, not `main`); **or**
- **Layer (b)** `loop_id` → `loop_billing_events` defense-in-depth onto (a) (ADR revisit-condition 4); **or**
- **Schedule the aggregate-faithfulness closure** (ADR revisit-condition 1) as a separate decision.

## Blocked On
**Files to commit (stage by name — do NOT `git add .`; there is untracked `data-room/` clutter on `main`):**
- NEW: `website/src/lib/translation-sandwich/layer2-verifier.ts`
- NEW: `website/src/lib/translation-sandwich/__tests__/layer2-verifier.test.ts`
- NEW: `website/src/app/api/accreditation/[agent_id]/provenance-contract.ts`
- NEW: `website/src/app/api/accreditation/[agent_id]/__tests__/provenance-contract.test.ts`
- NEW: `website/src/app/api/accreditation/[agent_id]/provenance-gate.ts`
- NEW: `website/src/app/api/accreditation/[agent_id]/__tests__/provenance-gate.test.ts`
- MODIFIED: `website/src/app/api/accreditation/[agent_id]/route.ts`
- MODIFIED: `website/src/app/api/accreditation/[agent_id]/response-builders.ts`
- MODIFIED: `operations/decision-log.md`
- NEW: `operations/handoffs/founder/2026-05-24-sage-assent-provenance-gate-build-close.md` (this close)

**Production state at session close:** **UNCHANGED until you deploy.** `main` at `e0278ab` + this commit; the code ships **dark** (`SUBSTRATE_PROVENANCE_GATE_ENABLED` UNSET → gate inert → `POST /api/accreditation/[agent_id]` byte-identical to today). Baseline otherwise per the predecessor: substrate A7 Verified; Sage Assent A10 Live+Verified; `SUBSTRATE_WRITE_PATH_ENABLED='true'`; `/api/public-key` steady-state Ed25519 shape. The gate enforces only when you flip the flag.

## Open Questions
- **Stale test harnesses (flagged, not fixed):** `layer2-signer.test.ts` + `layer2-canonical-json.test.ts` are Jest-style with no Jest installed → un-runnable; `route.test.ts` needs `--env-file=.env.local`. `CLAUDE.md`'s test-running notes are inaccurate on both points. Future cleanup.
- **Data-room Combination-1 doc edit** — deferred to the `whole-system-data-room` branch (see Next Session).
- Aggregate-faithfulness gap; option (b) — both deferred per the ADR.

## Founder Verification (Between Sessions)

**Step 1 — re-run the tests independently (one at a time):**
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsx src/lib/translation-sandwich/__tests__/layer2-verifier.test.ts
npx tsx "src/app/api/accreditation/[agent_id]/__tests__/provenance-contract.test.ts"
npx tsx "src/app/api/accreditation/[agent_id]/__tests__/provenance-gate.test.ts"
npx tsc --noEmit
```
Expected: `18  Pass: 18`, `15  Pass: 15`, `12  Pass: 12`, then no output (tsc clean).

**Step 2 — commit (stage by name) + push (DARK deploy):**
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add \
  website/src/lib/translation-sandwich/layer2-verifier.ts \
  website/src/lib/translation-sandwich/__tests__/layer2-verifier.test.ts \
  "website/src/app/api/accreditation/[agent_id]/provenance-contract.ts" \
  "website/src/app/api/accreditation/[agent_id]/__tests__/provenance-contract.test.ts" \
  "website/src/app/api/accreditation/[agent_id]/provenance-gate.ts" \
  "website/src/app/api/accreditation/[agent_id]/__tests__/provenance-gate.test.ts" \
  "website/src/app/api/accreditation/[agent_id]/route.ts" \
  "website/src/app/api/accreditation/[agent_id]/response-builders.ts" \
  operations/decision-log.md \
  "operations/handoffs/founder/2026-05-24-sage-assent-provenance-gate-build-close.md"
git commit -m "Sage Assent provenance gate (R18f, option (a)): verifyLayer2Signature + signed-provenance contract + write-boundary gate behind SUBSTRATE_PROVENANCE_GATE_ENABLED (dark, UNSET=byte-identical). 45 tests pass; tsc clean. Critical; CCP completed + approved."
```
Then push via GitHub Desktop. **Vercel deploys with the flag UNSET → production behaviour byte-identical to today.** Confirm Vercel is green and `GET /api/accreditation/<agent_id>` is unchanged. (If GitHub Desktop reports a lock: close it, `rm -f .git/index.lock`, retry.)

**Step 3 — flip the flag (the enforcement step; do this as a separate, deliberate action):**
1. First confirm `SUBSTRATE_LAYER2_PUBLIC_KEY` is set in Vercel (it is — `/api/public-key` serves the steady-state shape). Without it the gate would 503 every write.
2. Vercel → Project → Settings → Environment Variables → add `SUBSTRATE_PROVENANCE_GATE_ENABLED` = `true` (Production).
3. Redeploy so the env change propagates to the running functions (same pattern as `SUBSTRATE_WRITE_PATH_ENABLED`).

**Step 4 — verify enforcement (decisive negative — the Combination-1 test):**
POST a credential write with your `Bearer sr_assent_…` write token but **no `provenance` field** → expect **422**; with a forged/tampered `provenance` → expect **403** with body `error: "no_examination"`. That is the false-credential door closed (R18f enforced/Live). The genuine→200 path is proven at the unit level (`provenance-gate` ON-VALID-1) and is exercised end-to-end by the data-room manual loop.

**Rollback (instant, independent):** set `SUBSTRATE_PROVENANCE_GATE_ENABLED` UNSET in Vercel → behaviour returns to today's, no code redeploy. Secondary: `git revert <commit>` + push.

## Verification Method Used (0c Framework)
API endpoint / gate logic — AI-provided `npx tsx` commands + expected output, founder-run (Step 1). 45 assertions (18 verifier + 15 contract + 12 gate) all pass; `tsc --noEmit` = 0 errors. Build A verified in isolation at the checkpoint (route untouched; new modules imported only by their tests). End-to-end production behaviour verified by the founder's post-flip URL check (Step 4).

## Risk Classification Record (0d-ii)
- Build A (verify primitive + contract shape, not wired) — **Standard** (new modules, not yet wired).
- Build B (gate wiring into the write route + env-flag enforcement) — **Critical** (access-control gating on a write surface; deployment-config / env-flag activation). Full Critical Change Protocol applied + founder-approved against named risks. PR6 NOT engaged.

## PR5 — Knowledge-Gap Carry-Forward
- **`@/` resolves under `tsx`** (confirmed empirically) — but tests transitively importing `supabase-server.ts` need `--env-file=.env.local` (client constructed at module load). Re-confirmed this session (1st recurrence beyond CLAUDE.md's note; CLAUDE.md's list is incomplete — omits `route.test.ts`).
- **Two test conventions coexist:** plain-assertion `tsx` scripts (substrate/route tests — runnable) vs Jest-style (`layer2-signer`/`layer2-canonical-json` — Jest not installed, un-runnable). New tests must use the plain-assertion style. (1st explicit logging; candidate for a CLAUDE.md correction.)
- **Sandbox cannot mutate git working-tree / `.git`** on the mounted folder (unlink "Operation not permitted"). Branch/checkout/commit are host-side only. (Recurring friction — repeatedly noted in recent closes re: `index.lock`.)

## Orchestration Reminder
This was a single-session two-phase build (A then B) on one founder stream — no sub-agent orchestration used. The verification (45 assertions + tsc + PR2 grep) was run in-session in the sandbox; the founder re-runs independently (Step 1) and performs the production post-flip check (Step 4). For a future Critical adversarial pass (e.g. R18d), a subagent verification would be appropriate.

## Cross-references
- `/adopted/adr/2026-05-23-sage-assent-sagereasoning-dependency-enforcement.md` (the design built)
- `/operations/decision-log.md` — `D-SAGE-ASSENT-PROVENANCE-GATE-BUILD-WIRED-VERIFIED-2026-05-24`
- `/operations/handoffs/founder/2026-05-23-P1-sage-assent-dependency-rule-close.md` (rule + ADR adopted)
- `/operations/handoffs/founder/2026-05-24-P2-whole-system-data-room-build-close.md` (the data room; Combination-1 gap documented)
- `/operations/handoffs/founder/2026-05-24-sage-assent-provenance-gate-CRITICAL-NEXT-SESSION-PROMPT.md` (this session's prompt)
- `D-ATL-WRITE-PATH-BUILD-WIRED-VERIFIED-2026-05-16`; `D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21` (the write path + A10 gate this builds on)

*End of session close. Stabilised to a known-good state: the option-(a) gate is built, wired behind `SUBSTRATE_PROVENANCE_GATE_ENABLED`, and Verified in the sandbox (45 assertions, tsc clean); it ships dark (production byte-identical) until the founder flips the flag. On flip + verification, R18f moves from Adopted-but-unenforced to enforced (Live) and Combination 1 is structurally rejected.*
