# Session Close — 2026-05-04 — Sub-session E8: cleanup (shim removal + score-social metadata fix) + depth-as-migration-scaffolding framing captured

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` (cached governance; full reads via the cache).
**Tier:** code-standard + governance — Standard risk under 0d-ii (highest-risk action: single-line response-envelope metadata change on `/api/score-social`; no model-invocation change; no reasoning-behaviour change).
**Date:** 2026-05-04.

## Decisions Made

- **D-E8-CLEANUP-AND-DEPTH-FRAMING-2026-05-04** appended to active log. Three parts: (1) `/website/src/app/api/reason/helpers.ts` deprecated re-export shim deleted (continuity item from E3 onwards now closed; zero importers verified by grep at session open). (2) `/website/src/app/api/score-social/route.ts` line 218 metadata corrected from `ai_model: MODEL_FAST` to `ai_model: MODEL_DEEP`, with the import on line 6 updated accordingly (continuity item from E4 — open question #2 of `D-SCORE-SOCIAL-RAG-WIRED-2026-05-04` resolved as Option A: metadata honesty fix, not a depth change). (3) Architectural framing captured as session insight (NOT yet promoted to a binding rule or ADR): depth tiers are migration scaffolding for the translation-sandwich architecture; the reasoning middle is meant to be deterministic; once all consumers operate under the new system, depth-as-LLM-reasoning-tier has no job. This framing reframes E7's remaining cleanup candidates (3, 4, 5, 6) through the migration lens.

## Status Changes

| Item | Old status | New status |
|---|---|---|
| `/website/src/app/api/reason/helpers.ts` (deprecated shim) | Verified-in-place at E3 onwards (defensive cushioning) | **Deleted.** Zero importers verified by grep at session open. The canonical helpers location at `/website/src/lib/rag/helpers.ts` is unchanged and continues to serve all consumers. |
| `/website/src/app/api/score-social/route.ts` AI transparency metadata | Inconsistent — reported `MODEL_FAST` (Haiku) while route invoked `runSageReason({ depth: 'standard' })` → Sonnet | **Verified consistent on tsc clean.** Reports `MODEL_DEEP` (Sonnet `claude-sonnet-4-6`) matching what the engine actually invokes per `sage-reason-engine.ts:366`. Public-facing AI transparency metadata now truthful. |
| Depth-architecture framing (depth = migration scaffolding for translation-sandwich) | Did not exist as a captured project-level decision | **Captured as session insight in `D-E8-CLEANUP-AND-DEPTH-FRAMING-2026-05-04`.** Adopted under 0f decision-status vocabulary as the founder's stated design intent. Explicitly NOT promoted to a binding architectural constraint (no AC8 added) or ADR. Reframes Candidates 3, 4, 5, 6 from the E8 menu and is the lens for any future session that touches `runSageReason` or depth tiers. |
| `/api/score-social` model-config.ts comment vs. route depth disagreement | Identified at E8 (model-config.ts:5 lists score-social under "Haiku" while route invokes depth: 'standard' → Sonnet) | **Reframed under (3).** Resolved at the metadata layer this session (Option A); the deeper question — should the route use Haiku (depth: 'quick') for cost reasons, or accept Sonnet for quality — is a depth-architecture migration question, not a metadata question. Carried forward to E9. |

## Next Session Should

**Sub-session E9 — founder's choice; the live architectural question is the headline.** The depth-architecture framing captured at E8 reframes the remaining cleanup candidates from the E7 menu. The candidates re-cast through the migration lens:

- **The migration question itself (NEW, headline at E9 open).** When does retirement of depth tiers begin? What does the consumer-by-consumer migration look like? Does it want an ADR (e.g., AC8 + a migration-plan ADR)? This is the largest of the candidates and the only one that matters to the project's architecture rather than its surface.
- **Candidate 3 (`/api/score-scenario` SCORING depth-mismatch)** — under the new framing, becomes a holding-pattern fix rather than an architectural decision. Worth doing only if migration is far. Founder's previously-stated "change to 'deep'" disposition holds *if* Candidate 3 is executed before migration retires depth labels.
- **Candidate 4 (fault-injection testing of Pattern A1 fallback paths)** — independent of migration. Tests fallback robustness; eligible regardless. Standard risk.
- **Candidate 5 (HTTP-layer verification)** — independent of migration. Tests the route's HTTP surface (auth, rate-limit, JSON parsing, R20a). Eligible regardless. Standard risk; medium-size session.
- **Candidate 6 (move to a non-rollout Priority sequence item per project instructions)** — independent of migration. P0 0h hold-point continuation; capability matrix work; ethical safeguards (R17, R19, R20); Agent Trust Layer (R18). Strategic choice.

Founder confirms scope at E9 open. The next-session prompt surfaces all five and re-states the depth-architecture framing so it's the visible context for whichever candidate is chosen.

Next-session prompt: `/operations/handoffs/founder/2026-05-04-E8-NEXT-SESSION-PROMPT.md`.

## Blocked On

**Files remaining uncommitted at session close:**

- `/website/src/app/api/reason/helpers.ts` (deleted — git tracks the deletion)
- `/website/src/app/api/score-social/route.ts` (modified — line 6 + line 218)
- `/operations/decision-log.md` (one entry appended; 1830 → 1888 lines)
- `/operations/handoffs/founder/2026-05-04-sub-session-E8-close.md` (this file)
- `/operations/handoffs/founder/2026-05-04-E8-NEXT-SESSION-PROMPT.md` (next-session prompt for E9)

**Production state at session close:**

- Vercel deployment: unchanged from E7 at the moment of session close. The new metadata wording deploys on the founder's push. Public-facing surface change: `/api/score-social` response envelope now reports `ai_model: "claude-sonnet-4-6"` (was `"claude-haiku-4-5-20251001"`). The shim deletion has no public-facing effect (no consumers; build cache regenerates).
- Supabase `supabase-us`: unchanged; no DDL or data writes this session.
- AC7 standing constraint: NOT engaged at any edit this session.
- PR6 NOT engaged. Critical Change Protocol NOT engaged. R20a perimeter unchanged.

## Open Questions

1. **Depth-architecture migration plan.** The framing in `D-E8-CLEANUP-AND-DEPTH-FRAMING-2026-05-04` section (3) is captured as session insight but not yet codified. Open: whether to promote it to AC8 or an ADR; what the consumer-by-consumer migration sequence looks like; what triggers retirement of depth tiers. **Revisit condition:** at E9, or whenever a session's work materially intersects with `runSageReason` or depth labels.

2. **Candidate 3 disposition under the migration lens.** Founder's stated preference at E8 open was "change to 'deep'" if Candidate 3 is executed. Under the new framing this is a holding-pattern fix; whether it's worth doing depends on migration timing. **Revisit condition:** at E9 once migration timing is sketched.

3. **Whether the architectural framing is the founder's settled view or a working hypothesis.** Recorded at E8 as the founder's stated design intent. Whether further reflection, evidence, or stress-testing shifts it is open. **Revisit condition:** any future session where evidence (cost data, output-quality samples, migration sketch) materially informs the framing.

4. **Other E7-menu candidates (4 fault-injection, 5 HTTP-layer, 6 Priority pivot)** — all carried forward. None depend on the depth-architecture migration. **Revisit condition:** at E9 founder's choice.

5. **`/api/reason` route comment hygiene.** The shim deletion may leave stale references in adjacent comments (`/website/src/lib/rag/helpers.ts:6`, `/website/src/app/api/score/route.ts:67`, `/website/scripts/verify-reason-rag.ts:96`) describing the predecessor location. These are accurate as historical references but could be updated if a future session touches those files. **Revisit condition:** opportunistic; not session-blocking.

*All findings are continuity items or carried-forward candidates; none session-blocking.*

## Founder Verification

Open Terminal, paste this exact block, press **Enter** (one combined command — adds all five files and commits; the deletion of `helpers.ts` is captured by `git add -A` on its parent path):

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning" && git add -A website/src/app/api/reason/ website/src/app/api/score-social/route.ts operations/decision-log.md operations/handoffs/founder/2026-05-04-sub-session-E8-close.md operations/handoffs/founder/2026-05-04-E8-NEXT-SESSION-PROMPT.md && git commit -m "session close: E8 cleanup (shim removal + score-social metadata fix) + depth-as-migration-scaffolding framing captured — 2026-05-04 (Sub-session E8)

- D-E8-CLEANUP-AND-DEPTH-FRAMING-2026-05-04 — three-part decision: shim deletion + metadata honesty fix + architectural framing as session insight
- /api/reason/helpers.ts deleted (zero importers verified at session open; continuity item from E3 closed)
- /api/score-social/route.ts line 6 import + line 218 ai_model: MODEL_FAST -> MODEL_DEEP (continuity item from E4 closed; resolved as Option A metadata honesty fix)
- Architectural framing captured: depth tiers are migration scaffolding for translation-sandwich architecture; reasoning middle is deterministic; depth retired post-migration. Adopted as session insight; explicitly NOT promoted to AC8 or ADR this session.
- tsc --noEmit -p . clean (exit 0)
- Standard risk; AC7 NOT engaged; PR6 NOT engaged; Critical Change Protocol NOT engaged
- E9 candidates carried forward through the migration lens: depth-architecture migration plan (NEW headline), Candidate 3 score-scenario depth-mismatch (holding-pattern under migration), Candidate 4 fault-injection (independent), Candidate 5 HTTP-layer (independent), Candidate 6 Priority pivot (independent)"
```

Then push via **GitHub Desktop**: open GitHub Desktop → select sagereasoning repo → click **Push origin**. Vercel auto-redeploys on push to main. Public-facing change: `/api/score-social` response envelope reports `ai_model: "claude-sonnet-4-6"`.

If `git add` fails with `index.lock` errors (D-LOCK-CLEANUP-2026-04-26 pattern), paste this in Terminal first then retry:

```
rm "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/.git/index.lock"
```

**Independent verification of the metadata fix** (re-run any time after deploy completes):

```
# Send a real /api/score-social request via the deployed site (with valid auth) and inspect
# the response. Expected: "ai_model": "claude-sonnet-4-6". Was: "claude-haiku-4-5-20251001".
```

**Independent verification of the shim deletion:**

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && npx tsc --noEmit -p . && echo "tsc clean"
```

Expected: `tsc clean` (exit 0). Verified in-session before session close. Optionally re-run the full RAG harness (`npx -y tsx scripts/verify-reason-rag.ts`) — should still pass at 171/171 since neither the shim nor the score-social metadata is exercised by any harness phase.

## Cross-references

- `/operations/handoffs/founder/2026-05-04-sub-session-E7-close.md` (predecessor — Sub-session E7: `/api/score-decision` wired via Pattern A1 + α loop pattern; PR1 rollout arc complete)
- `/operations/handoffs/founder/2026-05-04-E7-NEXT-SESSION-PROMPT.md` (this session's opening prompt — surfaced six candidates)
- `/operations/handoffs/founder/2026-05-04-E8-NEXT-SESSION-PROMPT.md` (next session — depth-architecture migration as headline)
- `/operations/decision-log.md` `D-E8-CLEANUP-AND-DEPTH-FRAMING-2026-05-04` (this session's entry)
- `/operations/decision-log.md` `D-DECISION-RAG-WIRED-2026-05-04` (E7 — predecessor)
- `/operations/decision-log.md` `D-SCORE-SOCIAL-RAG-WIRED-2026-05-04` (E4 — metadata-inconsistency origin; open question #2 resolved this session)
- `/operations/decision-log.md` `D-CONSUMER-WIRING-LIFT-2026-05-04` (E3 — shim origin)
- `/adopted/standing-protocol-cache.md` (operative governing frame)
- `/adopted/adr/2026-05-04-d6-d7-consumer-wiring.md` (ADR-001 — unchanged this session)
- `/adopted/adr/2026-05-04-d6-d7-loop-pattern-wiring.md` (ADR-002 — unchanged this session)

*End of session close. PR1 rollout arc remains complete after E8 (post-rollout cleanup work). Two cleanup items executed; one architectural framing captured as session insight. The depth-architecture migration is now the live headline question for E9 onwards.*
