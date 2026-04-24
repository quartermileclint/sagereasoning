# Next Session — Option B: Sage-Ops Live Data, Round Two

**Date written:** 21 April 2026 (end of Option A session)
**Read first:** `/operations/handoffs/sage-ops-live-data-wiring-close.md`

## Why This Prompt Exists

Option A proved the single-endpoint pattern: a source-of-truth JSON file powers both a human-facing HTML dashboard and the Sage-Ops chat persona (via `ops-continuity-state.ts`). Per PR1, the pattern has now reached Verified on one endpoint and can be rolled out.

The original Option B plan — *"extract Ecosystem Map data into `ecosystem.json`, make all three dashboards data-driven"* — needs revisiting because:

**The Ecosystem Map already fetches `/component-registry.json` at runtime.** It is not hardcoded. Confirmed at `SageReasoning_Ecosystem_Map.html:406`: `const response = await fetch('/component-registry.json');`

The only inline data in the Ecosystem Map are two small configuration constants (`EXTERNALS` — 7 external deps; `SECTIONS` — the 9-entry type taxonomy used across the sidebar). These are configuration, not content, and extracting them would yield little value.

So Option B as originally framed is either **already done** (for the content) or **low value** (for the config). The founder should choose a real Option B scope before execution.

## Option B Candidates (Choose One)

Each is a single-endpoint-proof-style task, sized to one session. The tested pattern from Option A applies identically: backup → extract → rewire → add to Sage-Ops loader → verify → handoff.

### B1. Extract the shared SECTIONS taxonomy

**Scope:** Pull the 9-entry `SECTIONS` array out of `SageReasoning_Ecosystem_Map.html` (line 422) into a new `/website/public/sections.json`. Rewire the Ecosystem Map to fetch it. Extend Sage-Ops loader as Source 8 ("Component type taxonomy") so Ops can answer *"what types of components exist and what colours are used?"* consistently with the dashboards.

**Value:** Low-medium. Establishes a shared type taxonomy. Prevents drift if a new type is added.
**Risk:** Standard (additive, small file, only one caller).
**Prerequisite for anything else:** None.

### B2. Add cross-cut indices to Sage-Ops

**Scope:** Extend `ops-continuity-state.ts` with computed cross-cut indices on top of the two files it already reads:
  - *Blockers by journey.* Group non-Ready components by `journey`, list blockers per journey.
  - *Flows per component.* Reverse-map: for each component in `flows.json`, list which flows use it.
  - *Components per flow.* Already covered in Source 7; make it a proper structured index rather than a raw step chain.

No new files. No dashboard change. Pure loader logic.

**Value:** High. Directly serves questions Sage-Ops gets asked ("what's blocking the paid API from launch?"; "which flows does `engine-sage-reason-engine` participate in?").
**Risk:** Standard (loader-internal).
**Prerequisite for anything else:** None.

### B3. Mark `blocker` field in component-registry.json

**Scope:** The Option A loader reads `c.blocker || c.notes` as `blocker_or_notes`. Today, no component has a `blocker` field — the schema doesn't require it. This task adds a `blocker` field to components where `notes` actually describes a blocker (vs. a generic note). Sage-Ops then surfaces only the real blockers, not every note.

**Value:** Medium. Turns Ops' blocker view from noisy to useful.
**Risk:** Standard (additive JSON field + one-off classification pass).
**Prerequisite for anything else:** None, but pairs well with B2.

### B4. Extract Architecture Map flow metadata into Sage-Ops queries

**Scope:** The flow descriptions inside `flows.json` (each step has `id` + `description`) are rich — 13 steps for `sage-reason`, full detail. Sage-Ops currently sees only the id chain. Extend the loader so when Ops is asked about a specific flow, it can surface the descriptions. This may require a second formatted block or a lazy-lookup helper (since including every description blows the context budget).

**Value:** Medium. Deepens what Ops can say about any one flow.
**Risk:** Standard. Main decision is context budget — don't over-include.
**Prerequisite for anything else:** None.

### Recommended order

If the founder wants one task: **B2**. Highest value-per-session, no new files, no rewiring, extends the proven loader pattern.

If the founder wants a two-task pair: **B2 then B3**. B2 establishes the structured cross-cut; B3 reduces noise in the blocker view.

## How to Execute Whichever Is Chosen

The pattern from Option A applies. Read `/operations/handoffs/sage-ops-live-data-wiring-close.md` first — especially the "What Was Done" and "Risk Classification Record" sections.

### Standing instructions

1. **Backups first.** For any file edit, make a `.backup-2026-MM-DD` copy before writing. List backup paths in the session close note.
2. **Single-endpoint proof (PR1).** If rolling out a pattern (e.g. extending the loader with a computed index), prove it on one index, verify, then add the second. Do not parallelise untested patterns.
3. **Risk classification before execution (0d-ii).** State the risk level plainly:
   - Additive JSON field, new loader block: Standard.
   - Changes to existing user-facing functionality: Elevated. Include rollback step.
   - Anything touching auth, session, safety classifier, or deployment config: Critical. Full Critical Change Protocol applies.
4. **Verification in the same session (PR2).** Do not mark a task Verified if the function hasn't been called in context. Grep for invocation, not definition.
5. **TypeScript check must be clean.** Run `cd website && npx --no-install tsc --noEmit -p tsconfig.json` — expect zero output.
6. **Session close note mandatory.** Write it before closing. Template: existing close notes in `/operations/handoffs/`.
7. **Do not edit governance docs** (manifest, project instructions, adopted strategies) without explicit founder approval.
8. **Respect founder working pace.** When founder says "proceed" or "done", move forward without re-explaining. When founder signals end of session, stabilise to known-good and close — no additional fixes.

### Founder Verification of Option A (Run Before Option B)

Before building Option B, confirm Option A is actually working in production. These are the checks from the Option A close note, reproduced here so Option B starts from a verified foundation:

| Check | URL / Command | Expected |
|---|---|---|
| flows.json served | `https://sagereasoning.com/flows.json` | Valid JSON; `nodes` (96 entries), `flows` (39 entries) |
| Architecture Map renders | `https://sagereasoning.com/SageReasoning_Architecture_Map.html` | Renders normally, no red error banner at the top |
| Capability Inventory still renders | `https://sagereasoning.com/SageReasoning_Capability_Inventory.html` | No change from before |
| Ops knows the counts | In an Ops chat: *"How many components are Ready vs partial vs not-ready, and how many flows are in the Architecture Map?"* | `13 ready, 46 partial, 19 not-ready, 85 n/a. 39 flows, 96 nodes.` |
| Ops can slice by journey | In an Ops chat: *"Of the non-Ready components, how many are paid-API-only vs free-tier-only?"* | `28 paid_api, 18 free_tier, 14 both, 5 internal.` |

If the last two fail, the loader was deployed but `formatted_context` isn't reaching the Ops prompt. Inspect `website/src/app/api/founder/hub/route.ts` `case 'ops'` before starting Option B.

### Tmp-script cleanup (from Option A)

Seven one-off scripts remain in `/scripts/`. Shell could not delete them from the mount. Founder can delete manually, or the Option B session can clean them up at the start:

```
scripts/tmp_inspect_registry.js
scripts/tmp_extract_flows.js
scripts/tmp_rewire_map.js
scripts/tmp_list_nonready.js
scripts/tmp_apply_journey.js
scripts/tmp_verify_flows.js
scripts/tmp_verify_loader.mjs
```

## Open Questions for the Founder

1. **Which Option B candidate to pick** (B1 / B2 / B3 / B4, or combination)? The recommended default is B2.
2. **Should the 65 `journey` classifications made in Option A be reviewed?** They were made in a single pass from component id + type. A second judgement pass could move some between `both` and `paid_api`. Not blocking, but the founder may want a quick review before any filtering decisions are made.
3. **Is there appetite to also pull the remaining `scripts/tmp_*.js` files into `/archive/` at the start of Option B?** Low priority, but keeps the `/scripts/` directory clean.

## Signals to Use in the Option B Session

- Founder says *"B2"* → treat as "Build this" signal; proceed with loader extension.
- Founder says *"B2 but just the blockers-by-journey index, not the flows-per-component one"* → scope-bounded build; do not expand.
- Founder says *"skip B, do something else"* → accept the override; surface concerns once, then execute the new direction.
- AI signals to the founder during work: *"I'm making an assumption"*, *"This change has a known risk"*, *"I need your input"* — per the 0d communication signals.

## One-Line Summary for the Session Opener

Option A proved the pattern; Option B should extend Sage-Ops with cross-cut indices (B2 recommended) rather than the originally-planned Ecosystem Map extraction, which is not needed because the Ecosystem Map already fetches `component-registry.json`.
