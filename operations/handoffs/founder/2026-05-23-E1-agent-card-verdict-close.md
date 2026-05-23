# Session Close — 2026-05-23 — E#1 (persist the Sage Calling Agent-Card verdict)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Tier:** `code-elevated` — **Elevated** risk. PEV loop (PR10). AC7 NOT engaged. PR6 NOT engaged.
**Date:** 2026-05-23.

Executed E#1 on the committed Track-C-Phase-3 baseline. At open I confirmed the protocol, ran the PR15 consult + PR16 lens, read the three live code files + the three Sage Calling lib modules, and surfaced the bite + the design choices. You elected **E#1** with the **role-hint column**. Built: an additive migration, the session-open persistence (folded into the existing creation INSERT), and the approval-path read into the five-spec assembly. Everything is `tsc`-clean and green across the affected suites. **Production is UNCHANGED** until you run the migration + commit/push.

## Decisions Made
- `D-SAGE-CALLING-E1-AGENT-CARD-VERDICT-PERSIST-2026-05-23` appended (lean form). Persist the verified Agent-Card `chosen_role` hint at session-open; read it on approval so the assembled `role` reflects a verified card instead of defaulting to `individual_nature`.

## Status Changes
| Item | Old | New |
|---|---|---|
| E#1 (persist Agent-Card verdict) | Scoped | **Wired** (tsc 0 + suites green in-session) → **Verified (production)** on your migration VERIFY + optional runtime smoke |
| `discovery_sessions` table | 11 columns | **12 columns** (+ `agent_card_role_hint`, after you run the migration) |
| Track E item 1 | surfaced (design pack §E) | **built** (the one pre-launch E item; E#2/#4/#5 stay condition-gated, E#3 finding-conditional) |

## Next Session Should
Elect the next bite at open. Track E item 1 is now done; the remaining E items are condition-gated. The two parked items remain available and are both small: the **`mode:'atl_wrapper'` discriminant classification** (`governance`; the sensible quick win to clear before any future rename of that discriminant) and the **`trust-layer/` directory rename** (`code-elevated`; needs grep-compensated verification because the cross-boundary import is invisible to `tsc`). No new prompt is pre-written; either parked item can be scoped at open from the design-pack §C open-questions + the Phase-3 close's Open Questions.

## Blocked On
**Files changed this session (uncommitted — for your commit):**
- NEW: `website/supabase-discovery-sessions-agent-card-role-hint-migration.sql`
- Modified: `website/src/lib/sage-calling/session-store.ts`; `website/src/app/api/calling/route.ts`; `website/src/app/api/calling/approve/route.ts`; `website/src/lib/sage-calling/__tests__/session-store.test.ts`
- Incidental: `website/tsconfig.tsbuildinfo` (build cache touched by the `tsc` run — commit or discard, no behaviour)
- `operations/decision-log.md` (entry appended), this close (NEW)

**Production state at session close:** **UNCHANGED.** No deploy, no env change, no migration run yet. `SAGE_REFLECT_ENABLED=true`; `MENTOR_ENCRYPTION_KEY` set; substrate A7 Verified; A10 Live+Verified on the `sr_assent_`/`sage_assent_write` surface; Sage Calling Live (gated by `SAGE_CALLING_ENABLED`); `SUBSTRATE_WRITE_PATH_ENABLED='true'`; Layer-3 + R20a substrate gates UNSET. Until you run the migration + commit/push, production runs the identical pre-E1 code (verdict logged, role defaults to `individual_nature`).

## Open Questions
- "Where/when" was elected by my recommendation as **session-open only** — a card supplied on a later (advance) call is logged but not persisted. Say the word to broaden it to "any verified-card call" (handles mid-sequence card supply; slightly more branching). No need otherwise.

## Founder Verification (Between Sessions)

**Step 1 — type-check + suites** (from `website/`; `npm install` first on a clean checkout — `tsx` is a devDependency). Run one command at a time:
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsc --noEmit
npx tsx src/lib/sage-calling/__tests__/session-store.test.ts
npx tsx src/lib/sage-calling/__tests__/calling-service.test.ts
npx tsx src/lib/sage-calling/__tests__/agent-card.test.ts
npx tsx src/lib/sage-calling/__tests__/r18d-adversarial.test.ts
```
Expected: `tsc` exits 0; session-store **34 pass / 0 fail** (incl. ICH-1..4); calling-service **28 pass / 0 fail**; agent-card **16 pass / 0 fail**; r18d reports the rules held (spoofed/poisoned cards rejected). (All confirmed in-session.)

**Step 2 — run the DB migration.** In the Supabase SQL editor, run `website/supabase-discovery-sessions-agent-card-role-hint-migration.sql`. Paste the VERIFY output back. Expected: row 1 → `agent_card_role_hint | text | YES | (null)`; row 2 → the `discovery_sessions_agent_card_role_hint_check` constraint present; row 3 → `column_count = 12`. (Additive + idempotent; reversible via the commented ROLLBACK block.)

**Step 3 — commit + push** (via GitHub Desktop). CLI equivalent:
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add -A
git commit -m "E#1 (D-SAGE-CALLING-E1-AGENT-CARD-VERDICT-PERSIST-2026-05-23): persist verified Agent-Card chosen-role hint on discovery_sessions at session-open; read it on /api/calling/approve so the five-spec role reflects a verified card instead of defaulting to individual_nature; additive migration + session-store/route wiring + ICH tests"
```
Then push. Vercel rebuilds. Deploy code + run the migration in the same window (so the column exists when the approve path reads it; the read fail-opens to the default if it's absent, so order is not load-bearing — but match them for cleanliness).

**Step 4 — optional runtime smoke** (only if you want the end-to-end confirmation; the unit round-trip + `tsc` already prove the logic). With `SAGE_CALLING_ENABLED='true'`: run a Sage Calling session (with a minted `sr_assent_` credential) supplying a verifiable `agent_card_url`, drive it to the Hard Gate, and approve via `/api/calling/approve`. Then in Supabase:
```sql
SELECT session_id, agent_card_role_hint FROM discovery_sessions WHERE agent_card_role_hint IS NOT NULL;
```
Expected: the session's `agent_card_role_hint` reads `chosen_role`, and the approve response's `discovered_purpose.role` reads `chosen_role` (not `individual_nature`). A spoofed/unverified card leaves the column NULL and the role defaults — the unchanged pre-E1 behaviour.

When Steps 1–3 pass, the implementation status flips **Wired → Verified (production)**.

## Cross-references
- `/operations/handoffs/founder/2026-05-23-C-phase3-external-wire-close.md` (predecessor)
- `/operations/handoffs/founder/2026-05-23-E1-agent-card-verdict-NEXT-SESSION-PROMPT.md` (the prompt this session executed)
- `D-SAGE-CALLING-E1-AGENT-CARD-VERDICT-PERSIST-2026-05-23`; `D-TRACK-FOLLOWONS-C-PHASE3-EXTERNAL-WIRE-2026-05-23`; `D-SAGE-CALLING-STAGE2-ENGINE-STORE-WIRED-VERIFIED-2026-05-21`; `D-PURPOSE-DISCOVERY-DESIGN-LOCKED-2026-05-21` (D-13)
- `/drafts/2026-05-23-track-followons-design-pack.md` §E (deliverable-of-the-day)
- `website/supabase-discovery-sessions-agent-card-role-hint-migration.sql` (the migration to run)

*End of session close. Stabilised to a known-good state: E#1 Wired (tsc 0 + suites green); production unchanged pending your migration + commit. The one actionable pre-launch Sage Calling follow-on is built.*
