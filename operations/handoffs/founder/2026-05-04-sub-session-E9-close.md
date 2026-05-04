# Session Close — 2026-05-04 — Sub-session E9: ADR-003 (depth-as-migration-scaffolding) drafted + adopted; AC8 added to manifest; cache drift resolved

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` (cached governance; full reads via the cache).
**Tier:** governance — Elevated risk under 0d-ii (highest-risk action: manifest amendment adding AC8; ADR-003 adoption is Standard; cache-drift cleanup is Standard).
**Date:** 2026-05-04.

## Decisions Made

- **D-E9-ADR003-AC8-AND-CACHE-DRIFT-RESOLVED-2026-05-04** appended to active log (1888 → ~1920 lines). Three-part decision: (1) ADR-003 — Depth-as-Migration-Scaffolding for the Translation-Sandwich Architecture drafted in `/drafts/adr/`, founder-approved verbatim ("approve" — no edits), moved to `/adopted/adr/`. (2) AC8 — Translation-Sandwich Architectural Constraint added to `/manifest.md` between AC7 and the Knowledge Gaps Register section, founder-approved verbatim. (3) Cache drift resolved across three "AC1–AC7" → "AC1–AC8" references in `/adopted/`. Historical handoffs and the predecessor next-session prompt intentionally not edited (snapshot semantics).

## Status Changes

| Item | Old status | New status |
|---|---|---|
| Depth-architecture migration framing | Captured as session insight in D-E8-CLEANUP-AND-DEPTH-FRAMING-2026-05-04 §3 (E8) — explicitly NOT promoted to ADR or AC | **Codified.** ADR-003 Adopted at `/adopted/adr/2026-05-04-depth-architecture-migration.md`. AC8 Adopted in `/manifest.md`. |
| `/drafts/adr/` | Held ADR-003 draft awaiting founder review | **Empty.** ADR-003 moved to `/adopted/adr/` after approval. Directory preserved for future drafts. |
| `/adopted/adr/` | Two ADRs (ADR-001 Pattern A1/A2, ADR-002 α loop pattern) | **Three ADRs.** ADR-003 added, governing the depth-architecture migration. |
| `/manifest.md` Architectural Constraints | AC1–AC7 (seven constraints; AC7 last) | **AC1–AC8.** AC8 — Translation-Sandwich Architectural Constraint added between AC7 and the Knowledge Gaps Register section. |
| `/adopted/standing-protocol-cache.md` AC reference count | Three "AC1–AC7" references (line 46 §"Element 2 — Canonical-source read sequence"; line 317 §"Cache update discipline"; line 330 §"Cross-references") | **Updated to "AC1–AC8".** All three locations updated. Cache drift resolved per cache's own update discipline. |
| `/adopted/rag-mentor-alt3/migration-plan.md` AC reference | One "AC1–AC7" reference (line 22) | **Updated to "AC1–AC8".** |
| Pilot session (M1) for the migration | Did not exist as a named future session | **Named.** ADR-003 §"Migration sequence" identifies M1 = `/api/reason` (proposed; founder revisable). M1 is Critical-tier under PR6-style escalation when scheduled. |

## Next Session Should

**Sub-session E10 — founder's choice; the post-codification menu.** With ADR-003 adopted, AC8 in the manifest, and the migration sequence named (M1 → M2 → M3 → M4 → M5 with retirement triggers), E10 has three plausible directions:

- **Schedule M1 (the pilot).** Begin the translation-sandwich migration on `/api/reason` (or an alternative pilot consumer per ADR-003 §"What this ADR does not decide"). Critical-tier under PR6-style escalation; the Critical Change Protocol applies. Multi-session arc; M1 alone is several hours minimum and may need its own ADR for the new engine's interface, fallback semantics, and verification harness. The pilot generates the cost data and schema-fidelity evidence ADR-003 lists as open questions.
- **Resolve a carried-forward cleanup candidate.** Candidates 3 (`/api/score-scenario` SCORING depth-mismatch — now reframed as holding-pattern; stops mattering at M2 but not foreclosed), 4 (fault-injection of Pattern A1 fallback — independent of migration), or 5 (HTTP-layer verification — independent of migration) are all eligible. Ranges from 30 minutes (Candidate 3 leave-and-document) to 2-3 hours (Candidate 5).
- **Strategic pivot to a non-rollout Priority sequence item.** Candidate 6 from E8's menu — P0 0h hold-point work, ethical safeguards (R17/R19/R20), or Agent Trust Layer (R18). Some sub-items are Critical-tier and need ADRs before coding. Independent of the migration.

Founder confirms scope at E10 open. The next-session prompt surfaces all three with the post-ADR-003 framing as visible context.

Next-session prompt: `/operations/handoffs/founder/2026-05-04-E9-NEXT-SESSION-PROMPT.md`.

## Blocked On

**Files remaining uncommitted at session close:**

- `/manifest.md` (modified — AC8 added between AC7 and the `---` separator that precedes the Knowledge Gaps Register)
- `/adopted/adr/2026-05-04-depth-architecture-migration.md` (new — ADR-003 adopted state; ~210 lines)
- `/adopted/standing-protocol-cache.md` (modified — three "AC1–AC7" → "AC1–AC8" updates: lines 46, 317, 330)
- `/adopted/rag-mentor-alt3/migration-plan.md` (modified — one "AC1–AC7" → "AC1–AC8" update: line 22)
- `/operations/decision-log.md` (modified — D-E9 entry appended; 1888 → ~1925 lines)
- `/operations/handoffs/founder/2026-05-04-sub-session-E9-close.md` (this file — new)
- `/operations/handoffs/founder/2026-05-04-E9-NEXT-SESSION-PROMPT.md` (next — new)
- *Note: the original `/drafts/adr/2026-05-04-depth-architecture-migration.md` was created earlier this session via Write and then moved via bash `mv` into `/adopted/adr/`. Git never tracked the draft (it was created and removed within the same uncommitted state), so there is no deletion for git to track — the file simply does not appear in `git status` from `/drafts/adr/`. The `git add -A drafts/adr/` in the verification command below is harmless if a draft existed, no-op otherwise.*

**Production state at session close:**

- Vercel deployment: unchanged. This is a documentation + governance commit; no `.ts` file touched; no deploy will trigger any behaviour change. Vercel build will run on push (Next.js may rebuild for any commit) and should succeed unchanged.
- Supabase `supabase-us`: unchanged; no DDL or data writes this session.
- AC7 standing constraint: NOT engaged at any edit this session.
- AC8 standing constraint: newly added; first engagement at M1 (whenever M1 is scheduled).
- PR6 NOT engaged. Critical Change Protocol NOT engaged. R20a perimeter unchanged.

## Open Questions

(Carried into the decision-log entry at length; summarised here.)

1. **Pilot session (M1) timing.** Founder's call when to schedule. **Revisit at E10 or any future session where the founder elects to advance the migration.**
2. **M1 pilot consumer choice.** ADR-003 proposes `/api/reason`; alternatives exist. **Revisit at the moment M1 is scheduled.**
3. **Cost data for the migration.** Not yet measured; gathered at M1. **Revisit at M1.**
4. **AC-12 vs AC8 naming inconsistency.** Pre-existing in ADR-001 + ADR-002 + D-E8. ADR-003 also uses "AC-12" in its Engages header for continuity. **Revisit opportunistically.**
5. **Candidate 3 disposition.** Reframed by ADR-003 but not foreclosed. **Revisit at E10 or M2.**
6. **Candidates 4 + 5 + 6 (carried forward from E8's menu).** All eligible at E10. **Revisit at E10 founder's choice.**

## Founder Verification

Open Terminal, paste this exact block, press **Enter** (one combined command — adds all touched governance files including the deleted draft):

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning" && git add -A manifest.md adopted/adr/ drafts/adr/ adopted/standing-protocol-cache.md adopted/rag-mentor-alt3/migration-plan.md operations/decision-log.md operations/handoffs/founder/2026-05-04-sub-session-E9-close.md operations/handoffs/founder/2026-05-04-E9-NEXT-SESSION-PROMPT.md && git commit -m "session close: E9 codification of depth-architecture migration — ADR-003 adopted + AC8 added to manifest + cache drift resolved — 2026-05-04 (Sub-session E9)

- D-E9-ADR003-AC8-AND-CACHE-DRIFT-RESOLVED-2026-05-04 — three-part decision

- ADR-003 (Depth-as-Migration-Scaffolding for the Translation-Sandwich Architecture) drafted in /drafts/adr/, founder-approved verbatim, moved to /adopted/adr/. Names target architecture (Layer 1 LLM extract schema -> Layer 2 deterministic mechanism application in code -> Layer 3 LLM per-consumer prose), today's reality (depth-tier does six bundled jobs across 25+ consumers), migration sequence (M1 pilot on /api/reason -> M2 score family -> M3 mentor family -> M4 skill family -> M5 scaffolding retirement), and seven retirement triggers required for M5.

- AC8 (Translation-Sandwich Architectural Constraint) added to /manifest.md between AC7 and the Knowledge Gaps Register section. Wording per ADR-003 'AC8 candidate wording', adopted verbatim. Binds new pre-M5 consumers to the bundled-depth engine.

- Cache drift resolved: three 'AC1-AC7' references in /adopted/ updated to 'AC1-AC8' (standing-protocol-cache.md x2; rag-mentor-alt3/migration-plan.md x1). Historical handoffs not edited (snapshot semantics).

- Elevated risk under 0d-ii (governing-document edit). AC7 NOT engaged. PR6 NOT engaged. Critical Change Protocol NOT engaged. No code touched; no deploy triggered.

- E10 candidates: M1 pilot (Critical multi-session arc); carried-forward cleanup (3, 4, 5); or strategic pivot (Candidate 6 Priority sequence)"
```

Then push via **GitHub Desktop**: open GitHub Desktop → select sagereasoning repo → click **Push origin**. Vercel auto-rebuilds on push to main but no behaviour change deploys (documentation + governance only).

If `git add` fails with `index.lock` errors (D-LOCK-CLEANUP-2026-04-26 pattern), paste this in Terminal first then retry:

```
rm "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/.git/index.lock"
```

**Independent verification of the manifest amendment:**

```
grep -n "AC8 — Translation-Sandwich" "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/manifest.md"
```

Expected: one match (the AC8 section heading). If zero or more than one, the edit did not land cleanly.

**Independent verification of the cache drift cleanup:**

```
grep -rn "AC1–AC7" "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/adopted/"
```

Expected: zero matches in `/adopted/` (all updated to AC1–AC8). Historical handoffs in `/operations/handoffs/` will still contain "AC1–AC7" as snapshot semantics — that is correct, do not edit.

**Independent verification of ADR-003 adoption:**

```
ls "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/adopted/adr/" && ls "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/drafts/adr/"
```

Expected: `/adopted/adr/` lists three files (ADR-001, ADR-002, ADR-003); `/drafts/adr/` is empty.

**Optional — TypeScript compile sanity check:**

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && npx tsc --noEmit -p . && echo "tsc clean"
```

Expected: `tsc clean` (exit 0). Should be unchanged from E8 — no `.ts` file touched this session.

## Cross-references

- `/operations/handoffs/founder/2026-05-04-sub-session-E8-close.md` (predecessor — Sub-session E8: cleanup + depth-as-migration-scaffolding framing captured)
- `/operations/handoffs/founder/2026-05-04-E8-NEXT-SESSION-PROMPT.md` (this session's opening prompt — surfaced five candidates including H1 = ADR-003 codification)
- `/operations/handoffs/founder/2026-05-04-E9-NEXT-SESSION-PROMPT.md` (next session — three-direction post-codification menu)
- `/operations/decision-log.md` `D-E9-ADR003-AC8-AND-CACHE-DRIFT-RESOLVED-2026-05-04` (this session's entry)
- `/operations/decision-log.md` `D-E8-CLEANUP-AND-DEPTH-FRAMING-2026-05-04` (E8 — framing origin in §3)
- `/adopted/adr/2026-05-04-depth-architecture-migration.md` (ADR-003 — adopted this session)
- `/adopted/adr/2026-05-04-d6-d7-consumer-wiring.md` (ADR-001 — Pattern A1/A2 substrate)
- `/adopted/adr/2026-05-04-d6-d7-loop-pattern-wiring.md` (ADR-002 — α loop pattern substrate)
- `/manifest.md` (AC8 added this session)
- `/adopted/standing-protocol-cache.md` (operative governing frame; cache drift resolved this session)

*End of session close. ADR-003 codifies the depth-architecture migration; AC8 binds it; cache is in sync. The migration itself begins (or doesn't) at the founder's call from E10 onward.*
