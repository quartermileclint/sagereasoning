# Session Close — B3 Blocker-Field Classification (C1 scope)

**Date:** 22 April 2026
**Scope:** C1 candidate from the forward prompt — add explicit `blocker` field to the subset of non-Ready components whose notes describe a real launch blocker, so the `by_journey` cross-cut filters down to launch-relevant items only. Two files touched: the registry (data) and the Ops continuity loader (one-line filter added to `by_journey` construction).

## Decisions Made

- **Adopted C1 from the forward prompt.** Founder directive at session open: "C1 — B3 blocker field (Recommended)".
- **Scope corrected mid-session from registry-only to registry + loader filter.** Initial claim ("registry-only, no loader change needed") was wrong: `pickBlockerOrNotes` picks text, but the `by_journey` construction pushes all non-Ready entries regardless of `blocker` presence. Without a loader filter, `by_journey` would stay at 65 items. Founder chose Option 1 (registry + loader) so the view actually drops to 19. Self-correction recorded in chat; no governance edit made.
- **19 blocker fields set across the registry.** 1 existing blocker cleared (agent-mentor — referenced resolved Vercel path fix); 1 existing blocker trimmed (agent-sage-ops — dropped C2 path-fix reference, kept C1 migration); 1 existing blocker left unchanged (agent-support); 16 new blockers added. Distribution post-edit: paid_api=3, both=3, free_tier=9, internal=4, unknown=0.
- **Loader filter lives in `loadCapabilityInventory`, not in the formatter.** Filter placed where the grouped view is constructed, so downstream consumers (type shape, stub fallbacks) all see the same filtered `by_journey`. The `items` array (main non-Ready list) is untouched — all 65 partial+not-ready components still enumerate there with their blocker-or-notes text.
- **Parallel raw-component array (`nonReadyRaw`) added to preserve index alignment.** `nonReady` is a filtered subset of `list`, so `nonReady[idx]` does not map to `list[idx]`. First filter attempt relied on this false assumption; corrected before TypeScript check. Now each non-Ready entry has its raw source in `nonReadyRaw[idx]`, enabling filters that consult registry fields not projected onto `CapabilityNonReadyEntry`.
- **Pre-existing registry duplicate `id: doc-journal-layers` left in place.** Two components share this id (index 27 = type `document`, agentReady `na`; index 104 = type `reasoning`, agentReady `not-ready`). B3 applied the blocker to both during the first pass; the stray blocker on the `na` entry was cleaned up. The duplicate-id itself is a pre-existing data-integrity issue, outside B3 scope. Logged in Open Questions for a future registry hygiene session.

## Status Changes

- `website/public/component-registry.json`: registry gained 17 new `blocker` fields + 1 rewritten + 1 cleared. **Status: Verified** (end-to-end probe confirmed the surfaced blocker text matches the registry edits).
- `website/src/lib/context/ops-continuity-state.ts`: `loadCapabilityInventory` gained `nonReadyRaw` parallel array and a `hasBlocker` filter on `by_journey` construction. **Status: Verified** (TypeScript clean; end-to-end render against live registry confirmed `by_journey` count 65→19 with correct per-journey distribution).
- No changes to types, stub fallbacks, formatters, or the hub route. External shape of `OpsContinuityBlock` is unchanged; consumers still read `.formatted_context`.

## What Was Done

1. **Session-opening protocol.** Read handoff prompt, B2 close note, decision log tail, and knowledge-gaps register. PR5 scan surfaced KG3/KG7 (Build-to-Wire Gap) as the relevant guardrail for C1.
2. **B2 decision-log entries drafted in chat for founder approval.** Three entries covering D-B2-1 (indices-on-sections), D-B2-2 (journey render order paid_api→…→unknown), D-B2-3 (scope boundary — B2 adopted, B1 rejected, B3 deferred, B4 budget-deferred). Founder approved all three.
3. **Decision log backed up** as `operations/decision-log.md.backup-2026-04-22`; three entries appended (lines 964, 982, 1000 in the updated file).
4. **Component-registry classification prepared.** Python script inventoried all 65 non-Ready components grouped by journey; cross-checked against the 3 existing `blocker` fields. Found 2 of 3 existing blockers were partially stale (both referenced the Vercel `process.cwd()` path fix resolved by D-Fix-1 on 21 April).
5. **Classification proposed to founder** in three parts: A (stale-blocker revisions for agent-mentor / agent-sage-ops / agent-support), B (16 new blockers grouped by rationale), C (46 components left as status notes with no blocker field). Founder approved en-bloc.
6. **Scope correction.** Before applying edits, re-read the loader's `by_journey` construction and caught that my earlier "registry-only" framing was incorrect. Stated the correction explicitly, offered Option 1 (registry + loader) vs Option 2 (registry only). Founder chose Option 1.
7. **Backups taken before any edit.** `component-registry.json.backup-2026-04-22` (128 KB) and `ops-continuity-state.ts.backup-2026-04-22` (37 KB) parked alongside live files.
8. **Registry edits applied** via Python script writing a single `json.dump(data, f, indent=2)` pass. 2-space indent confirmed against existing file style; no whitespace-only diff expected.
9. **Duplicate-id cleanup.** Discovered `doc-journal-layers` has two entries; stripped the blocker from the `na` entry (never read by the loader anyway). Logged in Open Questions.
10. **Loader filter added.** First attempt used `list[idx]` which was wrong because `nonReady` is a filtered subset; corrected to use a parallel `nonReadyRaw` array before running the TypeScript check.
11. **TypeScript clean.** `cd website && npx --no-install tsc --noEmit -p tsconfig.json` returns zero output.
12. **End-to-end verification** via Node 22 `--experimental-strip-types` against the live loader, registry, and flows. Assertions: main non-Ready = 65, `by_journey` total = 19, per-journey counts = 3/3/9/4/0, rendered subsection shows blocker text (not notes). All PASS.
13. **Build-to-wire grep (KG3/KG7).** Confirmed call chain: `hub/route.ts:213 → getOpsContinuityState → loadCapabilityInventory (with B3 filter) → formatBlockersByJourney`. The filter IS on the execution path.

## Verification Method Used (0c Framework)

| Work Type | Method | Result |
|---|---|---|
| Registry edits | Post-edit Python scan: count components with `blocker` field, group by journey | 19 total; 3/3/9/4/0 distribution matches approved list |
| Type shape | `npx tsc --noEmit` after loader edit | Clean (zero output) |
| Loader filter correctness | Node `--experimental-strip-types` invocation of `getOpsContinuityState`; assertion block in probe script | PASS — main list 65, by_journey 19, per-journey counts correct |
| Rendered output | Eyeball the `by journey` subsection of `formatted_context` | 19 items rendered in order paid_api → both → free_tier → internal; blocker text visible (not notes text) |
| Build-to-wire (KG3/KG7) | `Grep` for call chain from `hub/route.ts` to `loadCapabilityInventory` | Chain intact; filter lives inside the function called by the route |
| Duplicate-id anomaly | Counter-based id uniqueness check | One duplicate found (`doc-journal-layers`), cleaned up stray blocker on `na` entry |

## Risk Classification Record (0d-ii)

- **Task 1 (decision-log append):** Standard. Additive text to a non-executable document; backup taken first. No governance rule edited.
- **Task 2 (registry edits — 19 blocker fields):** Standard. Data-only edits to a public JSON file consumed by one loader. No consumer type changes; the `blocker` field was already a known optional property via the existing `pickBlockerOrNotes` helper.
- **Task 3 (loader filter):** Standard. Additive filter on a non-safety-critical loader; no Elevated surface (not auth, not session, not safety classifier, not deployment config). PR1 doesn't apply (single-endpoint change, no rollout across endpoints). Rollback path: remove the filter, restore the plain `by_journey` population loop — the `.backup-2026-04-22` file parked alongside the live file is the exact rollback target.
- **Self-correction mid-session (scope widening from registry-only to registry + loader):** Not a separate risk classification but recorded here because it involved a wrong initial claim. The founder was informed before any irreversible action; Option 1 vs Option 2 was presented; Option 1 was chosen with eyes open.
- **No Elevated or Critical changes this session.** PR6 does not apply.

## PR5 — Knowledge-Gap Carry-Forward

- **KG3 / KG7 (Build-to-Wire Gap):** Applied as guardrail. Grep-confirmed the filter is on the execution path (not dead code).
- **No re-explanations needed this session.** No new KG entries.
- **Candidate pattern — parallel raw-source array pattern in multi-projection loaders:** First observation this session. The `nonReadyRaw: RawComponent[]` companion to `nonReady: CapabilityNonReadyEntry[]` is a pattern worth watching; if a second loader needs to filter by registry-level fields not projected onto the DTO, the same pattern will appear. Logged here for PR8 tracking (third recurrence triggers promotion).

## Founder Verification (Between Sessions)

Once deployed, verify independently:

| Check | Method | Expected |
|---|---|---|
| TypeScript clean in CI | Deploy pipeline | Zero TS errors |
| Architecture Map + Capability Inventory still render | `https://sagereasoning.com/SageReasoning_Architecture_Map.html` and `.../SageReasoning_Capability_Inventory.html` | No change from B2 — B3 is loader + registry only, no dashboard change |
| Ops answers paid-API blocker question with 3 items (not 28) | In an Ops chat, ask: *"What's blocking the paid API from launch — just the non-Ready components in the paid_api journey, with the blocker for each."* | Ops should list the 3 real paid_api blockers: `engine-accred-card`, `engine-trust-layer`, `engine-progression` — with the factual blocker text each. The pre-B3 list would have named 28 items including every `tool-sage-*` factory wrapper; those are no longer in the `by_journey` view. |
| Ops still knows the 28 paid_api partial components when asked | In an Ops chat, ask: *"List all non-Ready components in the paid_api journey, including ones without a blocker."* | Ops should still be able to produce the 28 (by filtering the main non-Ready list on journey). The blocker filter only affects the `by_journey` grouped view, not the main list. |
| Ops answers launch-readiness summary cleanly | In an Ops chat, ask: *"Give me a one-line per journey summary of what's blocking launch."* | Ops should report approximately: paid_api — 3 items (2 isolation, 1 integration gap); both — 3 items (2 isolation, 1 no-code-exists); free_tier — 9 items (mostly Sage Mentor isolation); internal — 4 items (Ops migration + Sage Mentor isolation + journal layers). |

If Ops still names 28 items for the paid-API blocker question, the loader filter isn't reaching production. Diagnose: verify the deployed bundle contains the B3 `hasBlocker` check (grep the Vercel build output, or re-run the probe).

## Blocked On

- Nothing. B3 is self-contained.

## Open Questions

- **Registry duplicate id (`doc-journal-layers`) — pre-existing.** Two components share this id: one `type: document` / `agentReady: na` (index 27), one `type: reasoning` / `agentReady: not-ready` (index 104). The loader's `agentReady` filter naturally excludes the `na` entry, so nothing is broken today. But the duplicate is a latent foot-gun for any future analysis keyed on `id`. Out of B3 scope; recommend a future registry hygiene pass.
- **Journey classification second pass (C3 from the forward prompt).** Still deferred. The 65 `journey` values set in Option A were a single-pass classification. Some items may benefit from a founder judgement pass — e.g., `engine-llm-bridge` is marked free_tier but its blocker text says it's a deprecation candidate rather than an integration target; the journey field might better be `unknown` or a new value like `deprecated`. Not urgent.
- **B4 (flow-step descriptions) — still parked.** Pending the budget headroom decision (Q4 in the forward prompt). Today's `formatted_context` is approximately 53 KB; B3 made it slightly smaller (fewer items in `by_journey`) — rough estimate −0.5 KB. Still well within budget.

## Approximate Budget Impact

Before B3, the `by_journey` subsection rendered 65 items (~5 KB of snippets). After B3, it renders 19 items. Rough reduction: ~3.5 KB. Total `formatted_context` size drops from ~53 KB to ~49–50 KB. Modest net reduction; the main signal gain is per-item (blocker text is factual and short) rather than byte-count.

## Files Changed

- `website/public/component-registry.json` — edited (19 blocker-field changes)
- `website/public/component-registry.json.backup-2026-04-22` — new (pre-edit backup)
- `website/src/lib/context/ops-continuity-state.ts` — edited (added `nonReadyRaw` parallel array + `hasBlocker` filter on `by_journey` construction)
- `website/src/lib/context/ops-continuity-state.ts.backup-2026-04-22` — new (pre-edit backup)
- `operations/decision-log.md` — edited (three B2 entries appended: D-B2-1, D-B2-2, D-B2-3 at lines 964/982/1000)
- `operations/decision-log.md.backup-2026-04-22` — new (pre-edit backup)
- `operations/handoffs/sage-ops-b3-blocker-classification-close.md` — new (this file)

Probe scripts (not shipped — temporary):
- `outputs/b3_inspect.py`, `outputs/b3_inspect2.py`, `outputs/b3_dump_existing.py`, `outputs/b3_dupe_inspect.py`, `outputs/b3_apply_edits.py`, `outputs/b3_e2e_probe.mts` — live in the outputs scratch folder. Recommend archiving to `/archive/2026-04-22-b3-tmp-scripts/` at the start of the next session, matching the B2 pattern.

## Next Session Should

1. Read this close note first.
2. If any of the four founder-verification checks above fails, diagnose before starting new work.
3. Only if all four pass: pick a follow-on. Natural candidates:
   - **C3 (journey classifications second pass)** — the original C3 from the forward prompt, now potentially more valuable because blocker text makes mis-classifications easier to spot.
   - **B4 (flow-step descriptions)** — pending the budget-headroom decision.
   - **Registry hygiene pass** — fix the `doc-journal-layers` duplicate id; scan for other duplicates. Small, self-contained.
   - **C4 (0h Hold-Point assessment)** — the trajectory-change option from the forward prompt. Moves P0 → P1 gate.
   - **C5 (move to P2 ethical safeguards)** — if the founder considers P0 + 0h complete or deferred.
4. Offer to archive the B3 probe scripts to `/archive/2026-04-22-b3-tmp-scripts/` at session open, matching the B2 hygiene pattern.
