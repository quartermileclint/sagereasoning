# Session Close — 2026-05-21 — Sage Calling: Build Stage 1 (Content + Schema)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` (`code-elevated` → Lean + Elevated additions) + `/adopted/build-sessions-protocol-cache.md` ("no current users" note).
**Tier:** `code-elevated` (spanning `schema`); highest sub-part = the additive substrate Layer 1 extension. **Elevated** risk under 0d-ii. AC7 NOT engaged. PR6 NOT engaged. Critical Change Protocol NOT engaged.
**Date:** 2026-05-21.
**Operative deliverable:** `/adopted/purpose-discovery-product-design.md` (the locked design — implemented this session).
**Operative prompt:** `/operations/handoffs/founder/2026-05-21-sage-calling-stage1-build-NEXT-SESSION-PROMPT.md`.
**Decision-log entry:** `D-SAGE-CALLING-STAGE1-BUILD-WIRED-VERIFIED-2026-05-21`.

This session built Stage 1 of the two-stage Sage Calling build (D-9): the **inert** content + schema groundwork, so Stage 2 (Critical) can wire the engine and go Live cleanly. Three things landed and nothing else — **no public endpoint, no engine, no auth gate, no behaviour change.**

## What was built

1. **Layer 1 extension (D-5 — the Elevated element).** Added an optional `discovered_purpose` object (`work`, `circle_and_obligation`, `role`, `capacity`, `first_appropriate_act`; all sub-fields optional) to `Layer1Schema` in `layer1-extractor.ts`, following the established carried-context pattern (optional, additive, not in `REQUIRED_KEYS`, validated defensively only when present, inert in Layer 2). Schema `version` left unbumped (additive-optional precedent).
2. **`discovery_sessions` migration (D-3/D-7).** New idempotent table; RLS enabled with no policy (service-role-locked, mirrors `credential_audit`); 3 CHECK guards; 2 indexes; the D-7 retention/deletion/minimisation policy encoded (90-day window finalised; R17h hard-delete path; R17i minimisation); inline VERIFY SELECTs; commented rollback.
3. **Content module (D-4 content).** The 24-variant question library + the four clarification templates as typed constants — content only, no selection engine. `use_when` is engine-internal (R4).

## Decisions Made
- `D-SAGE-CALLING-STAGE1-BUILD-WIRED-VERIFIED-2026-05-21` appended (lean form). Stage 1 built + Verified in-session; → Verified (full) once the founder runs the migration.

## Status Changes
| Item | Old | New |
|---|---|---|
| Sage Calling — Stage 1 (content + schema) | Designed | **Verified** (migration run 2026-05-21; commit + push remain) |
| `discovery_sessions` table | Scoped (D-3) | **Verified** (migration run + 5 VERIFY blocks confirmed 2026-05-21) |
| Substrate Layer 1 `discovered_purpose` field (D-5) | Designed | **Verified** (in-session: tsc + 50/0 schema test) |
| Sage Calling question library + clarification templates | Designed | **Verified** (90/0 content-integrity, verbatim vs design) |

## Verification Method Used (0c framework)
- **Library logic / schema validation** → AI authored + ran plain-assertion test scripts: content-integrity **90/0**; extended Layer 1 schema test **50/0** (incl. 17 new `discovered_purpose` checks + Layer 2 inertness); `tsc --noEmit` clean project-wide. Substrate/translation-sandwich regression sweep green (score-architecture 69/0, layer3-service 28/0, atl-bridge/atl-tree-search-adapter/atl-wrapper/agent-hand-back-report/r20a-gate/atl-iteration-patterns exit 0; the four Supabase-importing tests pass with `--env-file=.env.local`).
- **Database change** → AI authored an idempotent migration with inline VERIFY SELECTs; **founder runs it in the Supabase SQL Editor** and confirms the output (this is the one remaining step to flip Stage 1 to Verified).

## Risk Classification Record (0d-ii)
- Layer 1 `discovered_purpose` field — **Elevated** (additive change to an existing surface; backward-compatible).
- `discovery_sessions` migration — Standard (idempotent new table).
- Content module + content test + extended schema test — Standard (new module / additive test assertions).
- Session set to **Elevated** (highest sub-part). No Critical surface this stage.

## PR5 — Knowledge-Gap Carry-Forward
No concept required re-explanation. KG1 (await all DB read/writes; no fire-and-forget) and KG7 (JSONB written as arrays/objects, never `JSON.stringify`'d) are documented in the migration header as standing requirements for the Stage 2 writer/reader. One reusable harness note reinforced (not new): substrate tests run from `website/` for `@/` alias resolution; the Supabase-importing ones need `--env-file=.env.local`; the two `layer2-*` files are Jest-framework (don't run under bare `tsx`).

## Next Session Should
**Sage Calling — Stage 2 (Critical, ~4–5 hr; full Critical Change Protocol).** Wire the rule-based variant-selection engine (D-4), the `POST /api/calling` endpoint (D-2), the A10 auth gate (D-6), the Hard Gate + global-flag kill switch (D-14), full-session-persistence wiring into `discovery_sessions` (D-7), and the R18d adversarial-evaluation tests (D-13, incl. poisoned/spoofed `agent_card_url`). The public surface goes Live, gated by the global flag (`SAGE_CALLING_ENABLED`, the `SUBSTRATE_WRITE_PATH_ENABLED` analogue). **Pre-conditions:** Stage 1 Verified (founder runs the migration — see below); A10 Verified (satisfied). A Stage-2 build prompt (full Critical template) should be written first. Resolve the three open questions below at Stage 2 kickoff.

## Blocked On
**Files to commit + push via GitHub Desktop (only these — do NOT blanket `git add .`):**
- `website/src/lib/translation-sandwich/layer1-extractor.ts` (modified)
- `website/src/lib/translation-sandwich/__tests__/layer1-schema-additions.test.ts` (modified)
- `website/supabase-discovery-sessions-migration.sql` (new)
- `website/src/lib/sage-calling/question-library.ts` (new)
- `website/src/lib/sage-calling/__tests__/question-library.test.ts` (new)
- `operations/decision-log.md` (entry appended)
- `operations/handoffs/founder/2026-05-21-sage-calling-stage1-build-close.md` (this close)

**Side-effect I caused (cleanup):** running `tsc` modified the tracked build cache `website/tsconfig.tsbuildinfo`. It's a generated incremental-build artefact — leave it out of the commit, or discard it with `git restore website/tsconfig.tsbuildinfo`. Untracked `reference/*.md`/`*.svg` and the NEXT-SESSION-PROMPT in `git status` are from prior sessions, not this one — not part of this commit.

**Production state at session close:** **UNCHANGED — nothing deployed.** No public Sage Calling surface exists; the optional Layer 1 `discovered_purpose` field is unused until Stage 2; `discovery_sessions` now exists in Supabase (migration run + 5 VERIFY blocks confirmed 2026-05-21) but is empty and unread — no code touches it until Stage 2. A10 Live + Verified. Substrate at A7 Verified. `SUBSTRATE_LAYER3_ENABLED` UNSET. `SUBSTRATE_R20A_GATE_ENABLED` UNSET. Option D Live. A Vercel rebuild on push will compile the additive type but change no runtime behaviour.

## Open Questions
- **Retention window = 90 days** (set this session per D-7's delegation). Confirm — privacy-policy-adjacent; candidate for the Stage 1 lawyer-engagement track. Policy is documented-only at Stage 1; enforcement (sweep + on-demand R17h deletion endpoint) is Stage 2.
- **`outcome` enum** stored as `'found' | 'null_result'` (avoided the literal `'null'` from the design's "found/null" phrasing, to prevent SQL/JSON-NULL confusion). Confirm at Stage 2 for R10 consistency across API/marketplace/docs.
- **Layer 1 `version` left unbumped.** Confirm (alternative: bump to v3 — heavier; touches the open-source Layer 1 contract / Rule A licensing gate).

## Founder Verification (between sessions)
**1. Re-run the in-session checks (optional; from `website/`):**
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsc --noEmit
npx tsx src/lib/sage-calling/__tests__/question-library.test.ts
npx tsx src/lib/translation-sandwich/__tests__/layer1-schema-additions.test.ts
```
Expected: tsc exits 0 (no output); each test prints `… pass / 0 fail`.

**2. Run the migration (this is what flips Stage 1 to Verified):** open the Supabase Dashboard → SQL Editor → New Query, paste the full contents of `website/supabase-discovery-sessions-migration.sql`, run it, and confirm the five VERIFY blocks return: the `discovery_sessions` table; its 11 columns; the indexes (`discovery_sessions_pkey`, the `session_id` unique index, `discovery_sessions_agent_id_idx`, `discovery_sessions_created_at_idx`); the 3 CHECK constraints; and `relrowsecurity = true`. Safe to re-run (idempotent).

**3. Commit + push (GitHub Desktop):** stage the seven files listed under "Blocked On" (and discard `tsconfig.tsbuildinfo`), paste the commit message below, commit, then push.
```
Sage Calling Stage 1 — content + schema (inert; no public surface)

D-5 additive optional discovered_purpose on Layer1Schema (backward-compatible,
carried-context pattern); new idempotent discovery_sessions table (RLS
service-role-locked; D-7 retention 90d + R17h hard-delete + R17i minimisation);
24-variant question library + 4 clarification templates as typed content (no
engine). tsc clean; content-integrity 90/0; Layer 1 schema test 50/0.

Elevated (additive Layer 1 schema change). No endpoint, no engine, no auth gate,
no behaviour change. Per D-SAGE-CALLING-STAGE1-BUILD-WIRED-VERIFIED-2026-05-21.
```
A Vercel rebuild compiles the additive type; runtime behaviour is unchanged.

## Cross-references
- `/operations/handoffs/founder/2026-05-21-sage-calling-design-lock-close.md` (predecessor close — design lock)
- `/operations/handoffs/founder/2026-05-21-sage-calling-stage1-build-NEXT-SESSION-PROMPT.md` (the operative prompt)
- `/adopted/purpose-discovery-product-design.md` (the locked design implemented)
- `D-SAGE-CALLING-STAGE1-BUILD-WIRED-VERIFIED-2026-05-21` + `D-PURPOSE-DISCOVERY-DESIGN-LOCKED-2026-05-21` + `D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21` (decision-log)
- `/adopted/standing-protocol-cache.md`; `/adopted/build-sessions-protocol-cache.md`

*End of session close. Stabilised to a known-good state: additive/inert code Verified in-session, nothing deployed, production unchanged; one founder step (run the migration) flips Stage 1 to Verified. Seven files await commit + push.*
