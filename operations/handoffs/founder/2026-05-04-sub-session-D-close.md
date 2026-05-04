# Session Close — 4 May 2026 — Sub-session D: D6/D7 first consumer route wired (PR1 single-endpoint proof)

**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md` (cached via `/adopted/standing-protocol-cache.md`).
**Tier:** code-elevated — Elevated risk under 0d-ii (highest-risk action: ADR move from `/drafts/adr/` to `/adopted/adr/`).
**Date:** 2026-05-04.

## Decisions Made

- **D-INTERNAL-RETRIEVE-ROUTE-VERIFIED-2026-05-04** appended to decision-log (+~70 lines). New `/api/internal/retrieve` route wires D6 + D7 over HTTP as Sub-session D's PR1 single-endpoint proof; D6 `retrievePassages` extended with optional `bm25_query` parameter (additive; backward-compatible) so consumers can OR-shape the BM25 channel without affecting vector embedding; ADR-001 (D6/D7 consumer wiring pattern) drafted and Adopted; verification harness ran 25/25 ALL CHECKS PASSED across helpers + real-Supabase wiring + BM25 reformulation lift.

## Status Changes

| Item | Old status | New status |
|---|---|---|
| ADR-001 D6/D7 consumer wiring pattern (`/adopted/adr/2026-05-04-d6-d7-consumer-wiring.md`) | did not exist | **Adopted** (ADR drafted in /drafts/, moved to /adopted/) |
| `/api/internal/retrieve` route (`/website/src/app/api/internal/retrieve/route.ts`) | did not exist | **Verified** (script-based wiring proof; HTTP-layer auth/rate-limit deferred to optional post-deploy curl) |
| `/api/internal/retrieve` helpers (`/website/src/app/api/internal/retrieve/helpers.ts`) | did not exist | **Verified** (toBm25OrShape + validateRequest tested against 14 cases) |
| D6 `retrievePassages` (`/website/src/lib/rag/retrieve-passages.ts`) | Verified (C-bis; single-query parameter) | **Verified** (with optional `bm25_query` param; backward-compatible; same-call-shape callers unaffected) |
| Verification harness (`/website/scripts/verify-internal-retrieve.ts`) | did not exist | **Verified** (executed end-to-end; 25/25) |
| Phase-2 pass-1 readiness inventory | substrate pieces 1–6 of 7 Verified | **all 7 of 7 pieces Verified** — first consumer route wired per PR1 single-endpoint proof; rollout phase begins at Sub-session E1 |

## Next Session Should

**Sub-session E1 — wire D6/D7 into the second consumer route (PR1 rollout begins).**

Estimated 2–4 hours. Risk: **code-elevated** under 0d-ii (changes to existing user-facing functionality if E1 picks Candidate A `/api/reason` quick-depth, which is the AI's recommendation; reclassifies to **code-critical** if E1 picks Candidate B V3 mentor reflection — R20a perimeter). Pattern from ADR-001 + verified D6 contract is the foundation; E1's primary work is integrating D6/D7 into existing prompt composition (KG6 surface) rather than reinventing the wiring.

Pre-conditions: founder commits + pushes this session's artefacts before Sub-session E1 opens; founder-side decision at E1 session-open whether the second consumer is Candidate A (Elevated) or Candidate B (Critical).

Next-session prompt: `/operations/handoffs/founder/2026-05-XX-sub-session-E1-NEXT-SESSION-PROMPT.md`.

**Parallel-track session available (founder-scheduled order):** decision-log archive cleanup — short ~30–45 min governance session; can be slotted before or after E1. Prompt: `/operations/handoffs/founder/2026-05-XX-decision-log-archive-NEXT-SESSION-PROMPT.md`.

## Blocked On

**Files remaining uncommitted at session close:**

- `/adopted/adr/2026-05-04-d6-d7-consumer-wiring.md` (ADR-001 — moved from /drafts/ during session; amended in-session — see ADR changelog)
- `/website/src/lib/rag/retrieve-passages.ts` (modified — added optional `bm25_query`)
- `/website/src/app/api/internal/retrieve/route.ts` (new)
- `/website/src/app/api/internal/retrieve/helpers.ts` (new)
- `/website/scripts/verify-internal-retrieve.ts` (new)
- `/operations/migrations/2026-05-04-verify-internal-retrieve-output.log` (new — verification run record)
- `/operations/decision-log.md` (one entry appended, +~70 lines)
- `/operations/handoffs/founder/2026-05-04-sub-session-D-close.md` (this file)
- `/operations/handoffs/founder/2026-05-XX-sub-session-E1-NEXT-SESSION-PROMPT.md` (next-session prompt)
- `/operations/handoffs/founder/2026-05-XX-decision-log-archive-NEXT-SESSION-PROMPT.md` (parallel-track session prompt — captured per founder direction in this session)

**Production state at session close:**

- Vercel deployment: unchanged from predecessor at the moment of session close. The new `/api/internal/retrieve` route + D6 `bm25_query` extension will deploy on the founder's push; the route will be reachable at `https://sagereasoning.com/api/internal/retrieve` with admin auth (no public-facing surface change since the route is admin-only and not advertised).
- Supabase `supabase-us`: unchanged; no DDL or data writes this session.
- AC7 standing constraint: NOT engaged at any edit this session.

## Open Questions

1. **Verification harness transcription discipline (PR5 candidate).** Two of three verification re-runs failed because the harness's queries / filters drifted from the C-bis baseline. The pattern — "future verification harnesses for new wirings must copy the baseline's filter set verbatim, not re-derive from spec" — is queued as a knowledge-gap register entry for the next session's session-opening protocol. **Revisit condition:** Sub-session E1 session open; if E1's harness reuses the same shapes, consider extracting a shared `BASELINE_QUERIES` constant.

2. **HTTP-layer verification.** Script-based verification proved the wiring; the route's auth / rate-limit / JSON parsing / HTTP-status mapping under real HTTP traffic is deferred. Auth pattern is reused from `/api/admin/api-keys` (existing; proven). Optional post-deploy curl test is documented in the decision-log entry; not session-blocking. **Revisit condition:** if Sub-session E1's consumer is user-bearing, build a real HTTP verification script then.

*ADR-001 accuracy open question resolved in-session — see ADR-001 changelog at `/adopted/adr/2026-05-04-d6-d7-consumer-wiring.md`.*

## Founder Verification

Open Terminal, then paste this exact block and press **Enter** (one combined command — adds all artefacts and commits):

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning" && git add adopted/adr/2026-05-04-d6-d7-consumer-wiring.md website/src/lib/rag/retrieve-passages.ts website/src/app/api/internal/retrieve/route.ts website/src/app/api/internal/retrieve/helpers.ts website/scripts/verify-internal-retrieve.ts operations/migrations/2026-05-04-verify-internal-retrieve-output.log operations/decision-log.md operations/handoffs/founder/2026-05-04-sub-session-D-close.md operations/handoffs/founder/2026-05-XX-sub-session-E1-NEXT-SESSION-PROMPT.md operations/handoffs/founder/2026-05-XX-decision-log-archive-NEXT-SESSION-PROMPT.md && git commit -m "session close: D6/D7 first consumer route wired + Verified — 4 May 2026

- D-INTERNAL-RETRIEVE-ROUTE-VERIFIED-2026-05-04 — new /api/internal/retrieve route wires D6 + D7 over HTTP per ADR-001
- ADR-001 D6/D7 consumer wiring pattern Adopted (drafted + moved /drafts/adr/ → /adopted/adr/)
- D6 retrievePassages extended with optional bm25_query parameter (additive; backward-compatible)
- Verification harness ran 25/25 ALL CHECKS PASSED across helpers + real-Supabase wiring + BM25 reformulation lift
- Elevated risk; ADR move; new route/helpers/harness; D6 additive param; AC7 NOT engaged; PR6 NOT engaged; Critical Change Protocol NOT engaged
- Phase-2 pass-1 substrate inventory: all 7 of 7 pieces Verified (PR1 single-endpoint proof complete; E1 begins rollout)"
```

Then push via **GitHub Desktop**: open GitHub Desktop → select sagereasoning repo → click **Push origin**. Vercel auto-redeploys on push to main; the new admin-only route deploys but no public-facing surface changes.

If `git add` fails with `index.lock` errors (D-LOCK-CLEANUP-2026-04-26 pattern), paste this in Terminal first then retry:

```
rm "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/.git/index.lock"
```

## Cross-references

- `/operations/handoffs/founder/2026-05-04-sub-session-C-bis-close.md` (predecessor — Sub-session C-bis close: D6 + D7 implementation)
- `/operations/handoffs/founder/2026-05-XX-sub-session-D-NEXT-SESSION-PROMPT.md` (this session's opening prompt)
- `/operations/handoffs/founder/2026-05-XX-sub-session-E1-NEXT-SESSION-PROMPT.md` (next session — E1 wires the second consumer route; PR1 rollout begins)
- `/operations/decision-log.md` `D-INTERNAL-RETRIEVE-ROUTE-VERIFIED-2026-05-04` (this session's entry)
- `/operations/decision-log.md` `D-RETRIEVAL-RERANK-IMPLEMENTED-2026-05-04` (the D6 + D7 modules this session wires)
- `/adopted/adr/2026-05-04-d6-d7-consumer-wiring.md` (ADR-001 — wiring pattern Adopted this session)
- `/adopted/standing-protocol-cache.md` (operative governing frame)
- `/adopted/rag-mentor-alt3/retrieval-interface.md` (D6 — contract extended this session)
- `/adopted/rag-mentor-alt3/re-rank-design.md` (D7 — heuristic policy invoked by the route)
- `/website/src/app/api/internal/retrieve/route.ts` (the proven consumer route)
- `/website/src/app/api/internal/retrieve/helpers.ts` (route's pure functions; testable)
- `/website/scripts/verify-internal-retrieve.ts` (verification harness — 25/25 PASS)
- `/operations/migrations/2026-05-04-verify-internal-retrieve-output.log` (verification run record)

*End of session close. PR1 single-endpoint proof complete; D6 + D7 wiring pattern Verified-in-place; rollout phase begins at E1.*
