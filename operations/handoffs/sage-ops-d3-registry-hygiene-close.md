# Session Close — D3 Registry Hygiene (doc-journal-layers resolution)

**Date:** 22 April 2026
**Scope:** D3 candidate from the B3 forward prompt — fix the pre-existing `doc-journal-layers` duplicate id surfaced during B3. Sweep the registry for other duplicates. Plus: retroactively append the three B3 decision-log entries (D-B3-1, D-B3-2, D-B3-3) drafted in chat and approved in this session.

## Decisions Made

- **Adopted D3 at session open.** Founder directive: "D3 — Registry hygiene (Recommended)".
- **Drafted and appended the three B3 decision-log entries this session, not deferred.** Founder directive: "Yes, draft now". Pattern matches B2→B3 in effect but collapsed to one session for D-B3-*.
- **Sweep confirmed one duplicate id only — `doc-journal-layers`.** The entire 163-entry registry contains no other duplicate ids. Q4 from the forward prompt ("sweep all duplicate ids this session, or fix doc-journal-layers only") collapsed; there was nothing else to sweep.
- **Deeper data-integrity issue surfaced and scoped.** The "duplicate" is one facet of a three-entry naming overlap for "Journal Interpretation (10 Layers)": index 27 (the spec document, `doc-journal-layers` / type=document), index 104 (the Frankenstein — `doc-journal-layers` / type=reasoning with the spec's path but the code's readiness), and index 105 (`reasoning-journal-interp`, the proper reasoning entry with correct code path but empty readiness).
- **Option B adopted: rename + fix path/desc/ext on index 104.** Founder chose Option B over: Option A (rename only, leave path/desc mismatched), Option C (merge index 104 into `reasoning-journal-interp`, Elevated risk), Option D (defer entirely).
- **Option B scope is index 104 only.** No changes to index 27 (spec document) or index 105 (`reasoning-journal-interp`). Index 104's `connects`, `rules`, `priority`, `status`, `oldStatus`, readiness fields, `blocker`, and `notes` were all left untouched.
- **Wording decisions (AI-proposed, founder-accepted by implication via `proceed`):** `desc` set to `"Multi-layer interpretation pipeline implementation. Layers 1-8 wired; layers 9-10 stub only (25 TODOs)."`; `ext` set to `.ts` (pure code, distinct from index 105's `.ts/.md` which covers both).

## Status Changes

- `operations/decision-log.md`: three B3 entries appended at lines 1022, 1040, 1058. File grew 1018 → 1072 lines. **Status: Verified** (grep confirms all three headers present).
- `website/public/component-registry.json`: index 104 renamed `doc-journal-layers` → `reasoning-journal-layers`, with path / ext / desc corrected to match the reasoning-implementation scope. **Status: Verified** (registry integrity probe confirmed 0 duplicates, 163 entries, 19 blockers, per-journey distribution unchanged).
- No changes to loader code, types, formatters, flows.json, or the hub route. External shape of `OpsContinuityBlock` unchanged.

## What Was Done

1. **Session-opening protocol.** Read the B3 close note and knowledge-gaps register. PR5 scan: no safety-critical surfaces in D3 scope; KG3/KG7 (Build-to-Wire Gap) not applicable (no new code).
2. **Outputs-folder audit.** The B3 close note's recommendation to archive B3 probe scripts to `/archive/2026-04-22-b3-tmp-scripts/` is no-op: the outputs scratch folder is cleared between sessions on this platform, so the scripts don't exist to archive. Noted for the forward prompt.
3. **Reference scan.** Grep across registry, source, and operations docs for `doc-journal-layers`. Found: two registry occurrences (targets), one archived B2 temp script (historical — leave), three references in the B3 close note (historical — leave). No live code references outside the registry.
4. **Registry sweep.** Python scan of all 163 entries for duplicate ids. Finding: one duplicate (`doc-journal-layers`). No others.
5. **Deeper-shape inspection.** Dumped the three "Journal Interpretation (10 Layers)" entries (indexes 27, 104, 105) and compared fields. Found the Frankenstein pattern on index 104 and the naming-convention statistics (`document` → `doc-*` universally; `reasoning` → `reasoning-*` except for the one offender).
6. **B3 decision-log drafts presented.** Three entries (D-B3-1, D-B3-2, D-B3-3) drafted in chat in the existing format; founder approved all three as-is.
7. **Registry fix scope presented as A/B/C/D.** Founder chose Option B.
8. **Backups taken first.** `operations/decision-log.md.backup-2026-04-22-d3` (108 KB) and `website/public/component-registry.json.backup-2026-04-22-d3` (128 KB) parked alongside live files. Existing `.backup-2026-04-22` backups from yesterday's B3 session preserved.
9. **Decision log appended.** Three B3 entries written via heredoc append. Tail verified clean, three `## 2026-04-22 — D-B3-*` headers grep-confirmed.
10. **Registry edit applied.** Python script with guards: found exactly one reasoning-type entry with id=doc-journal-layers, confirmed index 104, asserted current field values before mutation, applied four changes (id / path / ext / desc), wrote back with `json.dump(data, f, indent=2)`.
11. **Verification.** JSON parses. Duplicate-id count = 0. Total entries = 163 (unchanged). Components with blocker field = 19 (unchanged). Per-journey distribution `paid_api=3, both=3, free_tier=9, internal=4, unknown=0` (unchanged). `reasoning-journal-layers` present exactly once. `doc-journal-layers` present exactly once (the spec-document entry at index 27). TypeScript check (`npx tsc --noEmit` in `website/`) returned exit 0.

## Verification Method Used (0c Framework)

| Work Type | Method | Result |
|---|---|---|
| Decision-log append | Grep for the three new `## 2026-04-22 — D-B3-*` headers; `wc -l` before/after (1018 → 1072) | PASS — three headers present at lines 1022, 1040, 1058 |
| Registry integrity | Python integrity probe: total count, duplicate-id Counter, blocker count, per-journey distribution | PASS — 163 entries, 0 duplicates, 19 blockers, distribution unchanged |
| Renamed-entry presence | Python filter on `id == 'reasoning-journal-layers'` and `id == 'doc-journal-layers'` | PASS — new id present once; old id present once (the spec-document entry) |
| Type shape | `cd website && npx --no-install tsc --noEmit -p tsconfig.json` | PASS — exit 0, no TS errors (npm version notice is informational) |
| No stray references | `grep -rn doc-journal-layers` across registry/source/operations | PASS — only the expected references remain (registry spec entry, historical close notes, archived B2 script) |

## Risk Classification Record (0d-ii)

- **Task 1 (decision-log append, three B3 entries):** Standard. Additive text to a non-executable document; backup taken first. No governance rule edited. No code effect.
- **Task 2 (registry Option B edit on index 104):** Standard. Data-only edit to a public JSON file consumed by one loader. No consumer type changes; the fields edited (`id`, `path`, `ext`, `desc`) are existing optional/string fields already read by `pickBlockerOrNotes` and other accessors without structural assumptions. No safety surface touched.
- **No Elevated or Critical changes this session.** PR6 does not apply. The session's one self-correction (Option-B desc wording proposed by AI) was pre-reviewed; founder had the option to revise and chose `proceed`.

## PR5 — Knowledge-Gap Carry-Forward

- **KG3 / KG7 (Build-to-Wire Gap):** Not applicable — no new code was wired. Registry data edit only.
- **No re-explanations needed this session.** No new KG entries.
- **Candidate pattern — "Frankenstein duplicate" in registry edits:** First observation. When a registry entry was created by duplicating another and changing the `type` field but not the `id`, `path`, `ext`, or `desc`, the resulting entry has partial semantic alignment with its new type and partial carry-over from its source. Easy to miss on a surface sweep; only visible when inspecting full fields. Logged for PR8 tracking (third recurrence triggers promotion).
- **Candidate pattern — "type-prefix naming invariant":** First observation. The registry's id-naming convention is strongly type-prefixed (21/21 `document` use `doc-*`; 11/12 `reasoning` use `reasoning-*`). The one offender was the one we fixed. A future pass could consider enforcing this invariant at load time (JSON schema or loader assertion). Logged for PR8 tracking.

## Founder Verification (Between Sessions)

Once deployed, verify independently:

| Check | Method | Expected |
|---|---|---|
| TypeScript clean in CI | Deploy pipeline | Zero TS errors |
| Ops `by_journey` internal group shows the renamed id | In an Ops chat, ask: *"List the non-Ready items in the internal journey, showing the id and blocker for each."* | Ops should list 4 items including `reasoning-journal-layers [not-ready]` with the blocker text about Layers 9–10 / 25 TODOs. The pre-D3 answer would have named `doc-journal-layers` for this item. |
| No stale references surface | In an Ops chat, ask: *"Any mention of doc-journal-layers in the component list?"* | Ops should name only the spec-document entry (type=document, agentReady=na). Note: Ops' grouped `by_journey` view filters out `na` entries, so this might legitimately return "not in blocker list" — that's correct and expected. |
| Deploy pipeline renders correctly | The Architecture Map and Capability Inventory HTML still render at the existing URLs | No visible change from B3 — D3 is registry-only, no dashboard logic touched. If anything renders differently, diagnose. |

If Ops still names `doc-journal-layers` for the internal-journey reasoning item, the deployed bundle hasn't picked up the registry change. Diagnose: confirm Vercel rebuilt after the registry edit; confirm the deployed `component-registry.json` contains the rename.

## Blocked On

- Nothing. D3 is self-contained.

## Open Questions

- **D-D3-1 decision-log entry is pending.** A draft is offered below. The B2→B3 pattern was to defer session-N entries to session-N+1 for approval; this session broke that pattern for B3 decisions but not yet for D3's own decision. The next session should offer the draft for approval, or the current session can approve it now on request.
- **"Frankenstein duplicate" pattern first observation.** Logged under PR8. Promotion trigger: third recurrence.
- **Type-prefix naming invariant first observation.** Logged under PR8. Promotion trigger: third recurrence. A future session could consider adding a loader-level assertion (`assert(component.id.startsWith(TYPE_PREFIX[component.type]))` or similar) as a forcing function.
- **Archive hygiene step is effectively obsolete under current platform.** The B3 close note recommended archiving B3 probe scripts to `/archive/2026-04-22-b3-tmp-scripts/`, but the outputs scratch folder is cleared between sessions, so there are no scripts to archive. Future close notes can skip this step or rephrase it ("probe scripts were temporary; cleared with session workspace").

## D-D3-1 Draft (for next-session approval, matching B2→B3 pattern)

```
## 2026-04-22 — D-D3-1: Rename `doc-journal-layers` (reasoning) → `reasoning-journal-layers` with path/desc/ext correction

**Decision:** Index 104 of the component registry, previously `id: doc-journal-layers` / `type: reasoning`, was renamed to `reasoning-journal-layers`. Its `path`, `ext`, and `desc` were updated to describe the implementation (`/sage-mentor/journal-interpreter.ts`, `.ts`, "Multi-layer interpretation pipeline implementation. Layers 1-8 wired; layers 9-10 stub only (25 TODOs)."). Index 27 (the spec document entry, still `doc-journal-layers` / `type: document`) and index 105 (`reasoning-journal-interp`) were left untouched.

**Reasoning:** The duplicate id `doc-journal-layers` was one facet of a three-entry naming overlap. Index 104 was a "Frankenstein" entry: the id, path, ext, and desc came from the spec-document entry (index 27) it was duplicated from, but the type, readiness status, journey, and blocker described the code implementation. Renaming and fixing the three surface fields aligns the entry with the registry's type-prefix naming invariant (`document` → `doc-*`, `reasoning` → `reasoning-*`) and with the semantic content of its readiness fields. Leaves the deeper overlap with index 105 (`reasoning-journal-interp`, which describes the same code at a different abstraction level) for a future design call.

**Alternatives considered:** Option A (rename only, leave path/desc mismatched) — rejected; leaves the Frankenstein shape visible in Ops' rendered context. Option C (merge index 104 into `reasoning-journal-interp`) — rejected; Elevated risk, shifts which entry carries the blocker in `by_journey`, and requires a readiness-status reconciliation (index 104 is `verified`, index 105 is `designed`). Option D (defer entirely) — rejected; the duplicate-id foot-gun was cheap to close and this was the explicit scope of the D3 session.

**Revisit condition:** If a future registry change creates semantic overlap between `reasoning-journal-layers` and `reasoning-journal-interp` that becomes hard to reason about, revisit whether they should be merged (Option C, re-examined with the readiness reconciliation explicit).

**Rules served:** PR1 (scope discipline — only index 104 touched). PR2 (verification immediate — JSON parse, duplicate-count, TypeScript clean, all in-session).

**Impact:** Registry duplicate-id count drops 1 → 0. Ops' rendered `by_journey` internal group now shows `reasoning-journal-layers` instead of `doc-journal-layers` for the Journal Interpretation implementation entry. Total entries (163), blocker count (19), and per-journey distribution (paid_api=3, both=3, free_tier=9, internal=4, unknown=0) unchanged.

**Status:** Adopted
```

## Approximate Budget Impact

None material. The `formatted_context` size is essentially unchanged: `reasoning-journal-layers` is one character longer than `doc-journal-layers`, contributing +1 byte to one rendered line. Well within noise.

## Files Changed

- `operations/decision-log.md` — edited (three B3 entries appended; lines 1022, 1040, 1058)
- `operations/decision-log.md.backup-2026-04-22-d3` — new (pre-edit backup)
- `website/public/component-registry.json` — edited (index 104: id / path / ext / desc)
- `website/public/component-registry.json.backup-2026-04-22-d3` — new (pre-edit backup)
- `operations/handoffs/sage-ops-d3-registry-hygiene-close.md` — new (this file)

Prior backups preserved:
- `operations/decision-log.md.backup-2026-04-22` (pre-B3, from 22 Apr earlier in the day)
- `website/public/component-registry.json.backup-2026-04-22` (pre-B3)
- `website/public/component-registry.json.backup-2026-04-21` (pre-Option-A)

## Next Session Should

1. Read this close note first.
2. Offer the D-D3-1 decision-log entry above for founder approval and append to `operations/decision-log.md` if approved (matching the B2→B3 retroactive pattern).
3. If any of the founder-verification checks above fails, diagnose before starting new work.
4. Only if all pass: pick a follow-on. Natural candidates (unchanged from B3 except D3 is now done):
   - **D1 (C3 journey classifications second pass)** — bounded, judgement-based. Now that blocker text is visible and the registry is clean, mis-classifications are easier to spot.
   - **D2 (B4 flow-step descriptions)** — pending the budget-headroom decision. `formatted_context` remains ~49–50 KB after D3 (essentially no change from B3).
   - **D4 (0h Hold-Point assessment)** — the P0 → P1 gate. Multi-session scope per the project instructions.
   - **D5 (move to P1 or P2)** — leave P0/0h and start the next build priority.
   - **Registry hygiene follow-on (optional)** — the "Frankenstein duplicate" and "type-prefix naming invariant" candidate patterns logged above could earn a loader-level assertion. Low urgency; nice-to-have.
