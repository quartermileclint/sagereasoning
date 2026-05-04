# Session Close — 2026-05-04 — Sub-session E10: ADR-004 (translation-sandwich pilot on `/api/reason`) drafted + adopted; M1 multi-session arc opened

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` (cached governance; full reads via the cache).
**Tier:** governance — Elevated risk under 0d-ii (highest-risk action: file move from `/drafts/adr/` to `/adopted/adr/`; ADR drafting alone is Standard).
**Date:** 2026-05-04.

## Decisions Made

- **D-E10-ADR004-DRAFTED-AND-ADOPTED-2026-05-04** appended to active log (1938 → ~1985 lines). ADR-004 — Translation-Sandwich Engine Pilot on `/api/reason` — drafted in `/drafts/adr/`, founder-approved verbatim ("Approve as drafted" — no edits), moved to `/adopted/adr/`. Three load-bearing structural decisions surfaced and confirmed by founder before drafting: A-2 (full schema redesign); B-3 (parallel-run cutover mechanics); C-2 (new harness, retire existing at M5). AI flagged concern about A-2's downstream costs; founder confirmed A-2 with the costs accepted. ADR-004 specifies the M1 pilot's wiring shape, the three new module surfaces (Layer 1 / Layer 2 / Layer 3), parallel-run cutover, new verification harness, R20a perimeter preservation, fallback semantics, and a six-checkpoint multi-session structure (M1-CP1 through M1-CP6).

## Status Changes

| Item | Old status | New status |
|---|---|---|
| M1 pilot wiring shape | Named in ADR-003 §"Migration sequence" M1 only at the architectural level; pilot mechanics not specified | **Codified.** ADR-004 Adopted at `/adopted/adr/2026-05-04-translation-sandwich-pilot-api-reason.md`. M1 wiring shape, schema redesign, cutover mechanics, harness, fallback semantics, and six-checkpoint structure all named. |
| `/drafts/adr/` | Empty (after ADR-003 promotion at E9) | **Empty again.** ADR-004 moved to `/adopted/adr/` after approval. |
| `/adopted/adr/` | Three ADRs (ADR-001 + ADR-002 + ADR-003) | **Four ADRs.** ADR-004 added, governing the M1 pilot. |
| M1 arc | Named in ADR-003 only; no checkpoint structure | **Opened.** Six-checkpoint structure (M1-CP1 through M1-CP6) named. M1-CP1 (Layer 1 module + ADR-005) is the next session's deliverable. |
| AC8 binding | First engagement deferred to M1 | **First engagement realised.** ADR-004 is the M1 pilot ADR ADR-003 §"Migration sequence" M1 names; AC8's binding force on new pre-M5 consumers is now operative for the migration. |
| Translation-sandwich pattern variant naming | Architectural name only | **Pilot wiring named.** "Translation-sandwich pilot wiring" + "Layer 1/2/3 module triplet" + "M1 parallel-run period" added to the pattern-variant lexicon. |

## Next Session Should

**Sub-session M1-CP1 — Layer 1 module + ADR-005 (Layer 1 schema specification).** Per ADR-004 §10. Build the `layer1-extractor.ts` module with `extractFeatures` exported; standalone harness Phases 1 + 2 passing against initial fixtures; ADR-005 drafted naming the field-level `Layer1Schema` specification + the Layer 1 system prompt. Risk class: Standard (new module; not yet wired into route; no production effect). Estimated time: 3–5 hours. Pre-conditions: ADR-004 pushed via GitHub Desktop and Vercel build green confirmed.

Next-session prompt: `/operations/handoffs/founder/2026-05-04-E10-NEXT-SESSION-PROMPT.md`.

## Blocked On

**Files remaining uncommitted at session close:**

- `/adopted/adr/2026-05-04-translation-sandwich-pilot-api-reason.md` (new — ADR-004 in adopted state; ~280 lines)
- `/operations/decision-log.md` (modified — D-E10 entry appended; 1938 → ~1985 lines)
- `/operations/handoffs/founder/2026-05-04-sub-session-E10-close.md` (this file — new)
- `/operations/handoffs/founder/2026-05-04-E10-NEXT-SESSION-PROMPT.md` (next — new, pending)
- *Note: the original `/drafts/adr/2026-05-04-translation-sandwich-pilot-api-reason.md` was created earlier this session via Write and then moved via bash `mv` into `/adopted/adr/`. Per E9's snapshot-semantics note, git tracks only the file at its `/adopted/adr/` location.*

**Production state at session close:**

- Vercel deployment: unchanged. This is a documentation + governance commit; no `.ts` file touched; no deploy will trigger any behaviour change. Vercel build will run on push (Next.js may rebuild for any commit) and should succeed unchanged.
- Supabase `supabase-us`: unchanged; no DDL or data writes this session.
- AC7 standing constraint: NOT engaged at any edit this session.
- AC8 standing constraint: first engagement realised at ADR-004 codification; binding force operative for M1 build sessions onward.
- PR6 NOT engaged this session (engages at M1-CP4 + M1-CP6 per ADR-004 §10). Critical Change Protocol NOT engaged this session (engages at the same checkpoints). R20a perimeter unchanged.

## Open Questions

(Carried into the decision-log entry at length; summarised here.)

1. **Layer 1 schema field-level specification.** Deferred to M1-CP1's ADR (proposed ADR-005). **Revisit at M1-CP1.**
2. **Layer 2 per-mechanism deterministic rules.** Deferred to M1-CP2's ADR (proposed ADR-006). **Revisit at M1-CP2.**
3. **Layer 3 prompt template for `/api/reason`.** Deferred to M1-CP3's ADR (proposed ADR-007). **Revisit at M1-CP3.**
4. **Verification harness fixture set.** Deferred to M1-CP4. **Revisit at M1-CP4.**
5. **Parallel-run cost cap.** Proposed default named in ADR-004 §6.2; founder approves at M1-CP4. **Revisit at M1-CP4.**
6. **Cutover criteria and thresholds.** Proposed comparison rubric in ADR-004 §6.4; thresholds set at M1-CP5 based on observed parallel-run data. **Revisit at M1-CP5.**
7. **External agent developer deprecation timing.** Proposed 14-day notice in ADR-004 §10; specific timing decided at M1-CP5. **Revisit at M1-CP5.**
8. **Whether the M1 redesigned schema becomes the input for M2/M3/M4 consumer redesigns, or each designs Layer 3 independently.** Deferred to M2's ADR. **Revisit at M2.**

## Founder Verification

Open Terminal, paste this exact block, press **Enter** (one combined command — adds all touched governance files):

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning" && git add -A adopted/adr/ drafts/adr/ operations/decision-log.md operations/handoffs/founder/2026-05-04-sub-session-E10-close.md operations/handoffs/founder/2026-05-04-E10-NEXT-SESSION-PROMPT.md && git commit -m "session close: E10 ADR-004 drafted + adopted — translation-sandwich pilot on /api/reason — 2026-05-04 (Sub-session E10)

- D-E10-ADR004-DRAFTED-AND-ADOPTED-2026-05-04 — ADR-004 codification

- ADR-004 (Translation-Sandwich Engine Pilot on /api/reason) drafted in /drafts/adr/, founder-approved verbatim ('Approve as drafted'), moved to /adopted/adr/. Specifies M1 pilot's wiring shape per ADR-003 + AC8: redesigned output schema (A-2 full redesign — extraction/assessment/prose/meta blocks); three new modules under /website/src/lib/translation-sandwich/ (layer1-extractor.ts Sonnet feature extraction; layer2-mechanisms.ts deterministic code no LLM; layer3-prose.ts Sonnet per-consumer prose); parallel-run cutover (B-3 — both engines per request, user receives bundled-depth, layer-separated logged for offline comparison); new harness verify-translation-sandwich.ts (C-2 — nine phases including R20a perimeter preservation per AC4); R20a perimeter preserved engine-agnostically; fallback semantics (Layer 1/3 throw -> bundled-depth result); six-checkpoint structure (M1-CP1 Layer 1 + ADR-005; M1-CP2 Layer 2 + ADR-006; M1-CP3 Layer 3 + ADR-007; M1-CP4 end-to-end + parallel-run wired - Critical; M1-CP5 observation + cutover decision; M1-CP6 cutover - Critical).

- AI surfaced three load-bearing structural decisions before drafting (A-2 vs A-1/A-3 schema fidelity; B-3 vs B-1/B-2 cutover; C-2 vs C-1/C-3 harness). AI flagged concern about A-2's downstream costs (M2/M3/M4 session size, fragmented output, public API breaking change). Founder confirmed A-2 with costs accepted.

- Elevated risk under 0d-ii (file move /drafts to /adopted). AC7 NOT engaged. PR6 NOT engaged this session (engages at M1-CP4 + M1-CP6). Critical Change Protocol NOT engaged this session (engages at same checkpoints). No code touched; no deploy triggered.

- M1 arc opened. M1-CP1 (Layer 1 module + ADR-005) is the next session's deliverable."
```

Then push via **GitHub Desktop**: open GitHub Desktop → select sagereasoning repo → click **Push origin**. Vercel auto-rebuilds on push to main but no behaviour change deploys (documentation + governance only).

If `git add` fails with `index.lock` errors (D-LOCK-CLEANUP-2026-04-26 pattern), paste this in Terminal first then retry:

```
rm "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/.git/index.lock"
```

**Independent verification of the ADR-004 adoption:**

```
ls "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/adopted/adr/" && echo "--- drafts/adr/ ---" && ls "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/drafts/adr/"
```

Expected: `/adopted/adr/` lists four files (ADR-001 + ADR-002 + ADR-003 + ADR-004 by date+topic); `/drafts/adr/` is empty.

**Independent verification of ADR-004 status:**

```
grep -n "Approve as drafted" "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/adopted/adr/2026-05-04-translation-sandwich-pilot-api-reason.md"
```

Expected: two matches (the Status line + the Changelog initial-Adoption entry).

**Optional — TypeScript compile sanity check:**

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && npx tsc --noEmit -p . && echo "tsc clean"
```

Expected: `tsc clean` (exit 0). Should be unchanged from E9 — no `.ts` file touched this session.

## Cross-references

- `/operations/handoffs/founder/2026-05-04-sub-session-E9-close.md` (predecessor — Sub-session E9: ADR-003 codification + AC8 manifest amendment + cache-drift resolution)
- `/operations/handoffs/founder/2026-05-04-E9-NEXT-SESSION-PROMPT.md` (this session's opening prompt — surfaced three top-level paths; founder picked M1 → M1a)
- `/operations/handoffs/founder/2026-05-04-E10-NEXT-SESSION-PROMPT.md` (next session — M1-CP1 Layer 1 module + ADR-005)
- `/operations/decision-log.md` `D-E10-ADR004-DRAFTED-AND-ADOPTED-2026-05-04` (this session's entry)
- `/operations/decision-log.md` `D-E9-ADR003-AC8-AND-CACHE-DRIFT-RESOLVED-2026-05-04` (E9 — migration codification)
- `/adopted/adr/2026-05-04-translation-sandwich-pilot-api-reason.md` (ADR-004 — adopted this session)
- `/adopted/adr/2026-05-04-depth-architecture-migration.md` (ADR-003 — names the migration)
- `/adopted/adr/2026-05-04-d6-d7-consumer-wiring.md` (ADR-001 — Pattern A1/A2 substrate)
- `/adopted/adr/2026-05-04-d6-d7-loop-pattern-wiring.md` (ADR-002 — α loop pattern substrate)
- `/manifest.md` AC8 (binds the migration; this session is the first engagement)
- `/adopted/standing-protocol-cache.md` (operative governing frame)

*End of session close. ADR-004 codifies the M1 pilot's wiring shape. The migration's first build session (M1-CP1) is the next item.*
