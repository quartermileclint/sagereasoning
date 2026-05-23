# Session Close — 2026-05-23 — Parked-2 (discriminant rename + `trust-layer/` retain)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Tier:** `code-elevated` — **Elevated** risk. AC7 NOT engaged. PR6 NOT engaged. No schema, no env, no deploy-config, no data.
**Date:** 2026-05-23.

Opened on the committed Parked-1 (Verified/CLOSED) baseline. At open I ran the protocol (both caches + the Parked-1 close + the classification ADR + the last decision-log entries + design-pack §C + targeted code reads), the PR15 consult, and the PR16 lens. I re-confirmed all three Parked-1 ADR revisit-conditions remain **unfired**, so bite 1 stayed Standard/Elevated. You elected: **both bites, bite 1 first**; bite-1 value **`'sage_assent'`** (overriding the AI-recommended `'agent_mode'` — stylistic, no risk/correctness difference); bite-2 **option (c)** — retain `trust-layer/` as the one named residual ATL-era token. Bite 1 renamed and Verified in-session; bite 2 recorded as a decision (no code change). **The Track C ATL→Sage Assent rename arc is now complete end-to-end.**

## Decisions Made
- `D-PARKED2-DISCRIMINANT-RENAME-TRUST-LAYER-RETAIN-2026-05-23` appended (lean form). Bite 1: `'atl_wrapper'` → `'sage_assent'` across 6 files (40 lines, 1:1). Bite 2: (c) consciously retain `trust-layer/`. Track C parked-item backlog now empty.

## Status Changes
| Item | Old | New |
|---|---|---|
| `'atl_wrapper'` discriminant value | Live (parked for rename) | **Renamed → `'sage_assent'`; Verified (in-session)** |
| `trust-layer/` directory rename | Parked (open question) | **Dispositioned — retain (c), recorded** |
| Track C ATL→Sage Assent rename arc | Complete except 2 parked internals | **Complete end-to-end** |

## Next Session Should
Open on a **new task** — the parked-item backlog is empty. No prompt is pre-written; elect scope at open from the design-pack remaining tracks (Track A follow-ons A1/A2/A4 are greenlightable design notes; Track E items E#2/#4/#5 stay condition-gated; A3 governance-ack remains if you want to confirm the harm-flag carrier). Standard session-open under `/adopted/standing-protocol-cache.md`.

## Blocked On
**Files changed this session (uncommitted — for your commit):**
- Modified: `website/src/lib/substrate/philosophical-mode-service.ts`
- Modified: `website/src/lib/substrate/agent-mode-service.ts`
- Modified: `website/src/lib/substrate/sage-assent-iteration-patterns.ts`
- Modified: `website/src/lib/substrate/__tests__/agent-mode-service.test.ts`
- Modified: `website/src/lib/substrate/__tests__/sage-assent-iteration-patterns.test.ts`
- Modified: `website/src/lib/substrate/__tests__/agent-hand-back-report.test.ts`
- Modified: `operations/decision-log.md` (entry appended)
- NEW: `operations/handoffs/founder/2026-05-23-parked2-renames-close.md` (this close)
- Untracked from the prior session: `operations/handoffs/founder/2026-05-23-parked2-renames-NEXT-SESSION-PROMPT.md` (the prompt this session executed — commit alongside)

**Production state at session close:** **UNCHANGED until you deploy.** Renames only — byte-identical runtime behaviour. Same baseline: `discovery_sessions` at 12 columns; `SAGE_REFLECT_ENABLED=true`; `MENTOR_ENCRYPTION_KEY` set; substrate A7 Verified; A10 Live+Verified; Sage Calling Live (gated by `SAGE_CALLING_ENABLED`); `SUBSTRATE_WRITE_PATH_ENABLED='true'`; Layer-3 + R20a substrate gates UNSET. On push, Vercel rebuilds with no behaviour change.

## Open Questions
None new. `trust-layer/` is a recorded residual — revisit only if the root `/trust-layer/` codebase is itself renamed (the website mirror would then follow for structural identity per its KEEP-IN-SYNC banners).

## Founder Verification
Re-run independently if you wish (one command at a time; the first two need `--env-file=.env.local` per CLAUDE.md):
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsc --noEmit
npx tsx --env-file=.env.local src/lib/substrate/__tests__/agent-mode-service.test.ts
npx tsx --env-file=.env.local src/lib/substrate/__tests__/philosophical-mode-service.test.ts
npx tsx src/lib/substrate/__tests__/sage-assent-iteration-patterns.test.ts
npx tsx src/lib/substrate/__tests__/agent-hand-back-report.test.ts
grep -rIn "atl_wrapper" src --include="*.ts" | grep -v fuse_hidden ; echo "exit: $?"
```
Expected: tsc exit 0; 63 / 43 / 64 / 54 pass, 0 fail (224 total, incl. R20A-1..4 distress); negative grep exit 1 (no matches).

Then commit + push (via GitHub Desktop). CLI equivalent:
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add website/src/lib/substrate/philosophical-mode-service.ts website/src/lib/substrate/agent-mode-service.ts website/src/lib/substrate/sage-assent-iteration-patterns.ts website/src/lib/substrate/__tests__/agent-mode-service.test.ts website/src/lib/substrate/__tests__/sage-assent-iteration-patterns.test.ts website/src/lib/substrate/__tests__/agent-hand-back-report.test.ts operations/decision-log.md "operations/handoffs/founder/2026-05-23-parked2-renames-close.md" "operations/handoffs/founder/2026-05-23-parked2-renames-NEXT-SESSION-PROMPT.md"
git commit -m "Parked-2 (D-PARKED2-DISCRIMINANT-RENAME-TRUST-LAYER-RETAIN-2026-05-23): rename Layer3 render-mode discriminant 'atl_wrapper'->'sage_assent' (tsc 0 + 224 assertions incl. R20A distress + negative grep); retain trust-layer/ dir as the one recorded residual (option c); Track C ATL->Sage Assent rename arc complete end-to-end; lean decision-log entry"
```
Then push. Vercel rebuilds (no behaviour change — renames only).

## Cross-references
- `/operations/handoffs/founder/2026-05-23-parked1-atl-wrapper-classification-close.md` (predecessor)
- `/operations/handoffs/founder/2026-05-23-parked2-renames-NEXT-SESSION-PROMPT.md` (the prompt this session executed)
- `D-PARKED2-DISCRIMINANT-RENAME-TRUST-LAYER-RETAIN-2026-05-23`; `D-ATL-WRAPPER-CLASSIFICATION-INTERNAL-DISPATCH-2026-05-23`; `D-TRACK-FOLLOWONS-C-PHASE3-EXTERNAL-WIRE-2026-05-23`; `D-TRACK-FOLLOWONS-C-PHASE1-RENAME-2026-05-23`
- `/adopted/adr/2026-05-23-atl-wrapper-discriminant-classification.md` (the classification that de-risked bite 1)
- `/drafts/2026-05-23-track-followons-design-pack.md` §C (the rename impact-map)

*End of session close. Stabilised to a known-good state: bite 1 renamed + Verified in-session (tsc 0, 224 assertions, negative grep clean); bite 2 dispositioned (retain, recorded); production unchanged until you commit + push. The parked-item backlog is empty and the Track C rename arc is complete — the next session opens on a new task.*
