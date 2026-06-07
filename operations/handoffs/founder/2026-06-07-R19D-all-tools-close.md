# Session Close — 2026-06-07 — R19d "all tools": mirror-principle propagation to the scoring/skill surfaces

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds → Critical Change Protocol step 3 = N/A; this session is Elevated, not Critical).
**Tier:** `code-elevated` — **Elevated** risk (additive changes to existing live user-facing system prompts + one additive optional engine parameter). PR6 **not** engaged; model selection N/A (no LLM call written — prompt-text + opt-in param only).
**Date:** 2026-06-07. **Branch:** `main`.
**Operative prompt:** the R19d "all tools" next-session prompt.
**Predecessor close:** `/operations/handoffs/founder/2026-06-07-A18c-framework-dependence-close.md`; direct R19d precedent `/operations/handoffs/founder/2026-06-07-A18-mirror-propagation-close.md`.

## What this session did

Closed R19d's "the mentor **and all tools**" reach. A18 had completed the mentor portion (8/8 surfaces). This session added the mirror principle to **every** evaluation/skill scoring surface — additive only, no JSON-schema or route-logic change:

1. **The 6 named scoring/skill surfaces** — a paragraph added to each prompt constant, surface-tailored:
   - **Evaluation-tool variant** (a new fourth variant): `evaluate` (DEMO_SYSTEM_PROMPT); `score-iterate` (INITIAL_SYSTEM_PROMPT **and** the Mode-2 iteration prompt in `lib/deliberation.ts`); `score-document` (V3_DOCUMENT_SCORING_PROMPT **and** V3_POLICY_SCORING_PROMPT in `lib/document-scorer.ts`, document/policy-flavoured).
   - **Plain-English R8d variant**: `skill/sage-classify`, `skill/sage-prioritise` (the `buildClassifyPrompt` / `buildPrioritisePrompt` builders in their libs).
   - **Age-appropriate, real-people-only variant**: `score-scenario` (SCENARIO_PROMPT) — fictional dilemma characters stay in scope by design.

2. **The 4 engine-backed scoring routes** — `score`, `score-decision`, `score-social`, `score-conversation`. These were **not** in the prompt's inventory; grounding surfaced them. They have no prompt of their own — they call the shared `runSageReason` engine using its default prompts, which `/api/reason` (deliberately mirror-free) and `/api/guardrail` also use. A constant edit was therefore impossible without contaminating `/api/reason`. Resolved via a new **opt-in `applyMirrorPrinciple` parameter** on the engine (canonical `MIRROR_PRINCIPLE_EVAL` block, pushed only when a caller opts in). The four scorers set it `true`; `/api/reason` + `/api/guardrail` do not → byte-identical.

**Result:** R19d now carried by **18 surfaces** (8 mentor + 6 named scoring/skill + 4 engine-backed), completing R19d across the human-facing + skill product surface. `/api/reason` + `/api/guardrail` deliberately excluded (open question below).

## Decisions Made
- `D-R19D-ALL-TOOLS-2026-06-07` (Elevated) appended to the decision log.

## Status Changes

| Item | Old | New |
|---|---|---|
| R19d mirror principle — scoring/skill tools | 0 surfaces | **10 surfaces** (6 named + 4 engine-backed) |
| R19d overall ("mentor and all tools") | mentor only (8) | **18 surfaces — complete** (reason/guardrail excluded; open Q) |
| `runSageReason` engine | no mirror opt-in | **`applyMirrorPrinciple?` param added** (opt-in, default off) |

## Verification Method Used (0c framework)

- **AI-side (Diagnostic-certain — PR10):** full `node_modules/.bin/tsc --noEmit` → **exit 0, 0 errors** (run after the PR1 proof on `/api/evaluate`, again after the PR1 proof on `/api/score`, and once more after all edits). Greps confirm: one `MIRROR PRINCIPLE (R19d)` per scoring/skill prompt constant; `document-scorer.ts` = 2 (document + policy); engine `MIRROR_PRINCIPLE_EVAL` defined once + one guarded push; the four engine-backed routes set `applyMirrorPrinciple: true` (1 each); `/api/reason` + `/api/guardrail` set it 0; all 7 R20a-perimeter distress blocks unchanged (`grep -c` = 1 each). Diffs vs backups are **purely additive — 0 lines removed across all 12 source files** (engine +25; each route/lib +1 to +4). `tsx` not run AI-side (documented sandbox esbuild native-binary mismatch).
- **Founder-side (0c):** run the typecheck below; optional behaviour spot-check.

## Risk Classification Record (0d-ii)

- Mirror-principle propagation across 10 scoring/skill surfaces + an additive optional engine param — **Elevated** (existing user-facing functionality; additive). AC7 not engaged; PR6 not engaged (no distress/Zone-2-3/R20a-wrapper surface touched). Excluded routes (`/api/reason`, `/api/guardrail`) byte-identical — they don't opt in and the new system block is guarded.

## Blocked On

**Files uncommitted (commit command below) — 12 source + 12 backups + 2 docs:**
- Source: `website/src/app/api/evaluate/route.ts`, `.../score-iterate/route.ts`, `website/src/lib/deliberation.ts`, `website/src/lib/document-scorer.ts`, `.../score-scenario/route.ts`, `website/src/lib/sage-classify.ts`, `website/src/lib/sage-prioritise.ts`, `website/src/lib/sage-reason-engine.ts`, `.../score/route.ts`, `.../score-decision/route.ts`, `.../score-social/route.ts`, `.../score-conversation/route.ts`
- Backups: `archive/*.backup-pre-r19d-alltools-2026-06-07` (12 files)
- Docs: `operations/decision-log.md`, this close.

**Production state at session close:** **UNCHANGED from pre-session.** Nothing deployed; `/api/reason` + `/api/guardrail` + every R20a/distress block byte-identical; A13 cost-health Live; all four R20a flags `true`; `R20B_INDEPENDENCE_COACHING_ENABLED` + OTel / injection-defence / Layer3 / plugin-install-auth / abuse-detection flags UNSET. The two pending production migrations (`compliance_access_log`, `compliance_rectification_log`) remain pending (untouched).

## Open Questions / Deferred (documented, not lost)

- **`/api/reason` + `/api/guardrail` R19d status.** Inherited as deliberately mirror-free from the A18 mentor exclusion; not silently changed. Revisit: founder voice-decision on whether the raw substrate reasoning API is a "tool" within R19d's meaning. If yes, both can opt into `applyMirrorPrinciple` in a one-line follow-up.
- **`V3_SOCIAL_MEDIA_PROMPT` dead code.** Defined in `document-scorer.ts`, imported nowhere (`/api/score-social` uses the engine). Flagged for a future cleanup pass; untouched this session.
- Carried from A18c: the two practice-name H1 renames (R8c); F10 `private-mentor` design-system alignment; PR7 shared-engine promotion of the R20b detector + 7-surface rollout.

## Founder Verification (Between Sessions)

No TEST database or dashboard needed — a typecheck plus an optional look. I can walk any step live (PR17).

1. Typecheck (proves all edits compile):
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && node_modules/.bin/tsc --noEmit
```
Expected: no output, exit 0 (already run this session).

2. Optional behaviour check (while signed in): in any scoring tool (e.g. score a decision, or paste a short document), submit an input that is really about judging *another identifiable person*; confirm the tool returns the focus to your own reasoning and that ordinary self-directed scoring is unchanged.

### Then commit + push
```
rm -f "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/.git/index.lock"
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add website/src/app/api/evaluate/route.ts \
  website/src/app/api/score-iterate/route.ts \
  website/src/lib/deliberation.ts \
  website/src/lib/document-scorer.ts \
  website/src/app/api/score-scenario/route.ts \
  website/src/lib/sage-classify.ts \
  website/src/lib/sage-prioritise.ts \
  website/src/lib/sage-reason-engine.ts \
  website/src/app/api/score/route.ts \
  website/src/app/api/score-decision/route.ts \
  website/src/app/api/score-social/route.ts \
  website/src/app/api/score-conversation/route.ts \
  archive/evaluate-route.ts.backup-pre-r19d-alltools-2026-06-07 \
  archive/score-iterate-route.ts.backup-pre-r19d-alltools-2026-06-07 \
  archive/deliberation.ts.backup-pre-r19d-alltools-2026-06-07 \
  archive/document-scorer.ts.backup-pre-r19d-alltools-2026-06-07 \
  archive/score-scenario-route.ts.backup-pre-r19d-alltools-2026-06-07 \
  archive/sage-classify.ts.backup-pre-r19d-alltools-2026-06-07 \
  archive/sage-prioritise.ts.backup-pre-r19d-alltools-2026-06-07 \
  archive/sage-reason-engine.ts.backup-pre-r19d-alltools-2026-06-07 \
  archive/score-route.ts.backup-pre-r19d-alltools-2026-06-07 \
  archive/score-decision-route.ts.backup-pre-r19d-alltools-2026-06-07 \
  archive/score-social-route.ts.backup-pre-r19d-alltools-2026-06-07 \
  archive/score-conversation-route.ts.backup-pre-r19d-alltools-2026-06-07 \
  operations/decision-log.md \
  operations/handoffs/founder/2026-06-07-R19D-all-tools-close.md
git commit -m "R19d all-tools: add mirror principle to all 10 scoring/skill surfaces (6 named + 4 engine-backed via opt-in applyMirrorPrinciple). R19d now 18 surfaces. Additive; /api/reason + /api/guardrail + all distress blocks byte-identical. (D-R19D-ALL-TOOLS-2026-06-07)"
```
Then push via GitHub Desktop. Additive system-prompt text + one optional engine param (default off) — Vercel should build green with no config or env change; `/api/reason` and `/api/guardrail` behaviour unchanged.

## Next Session Should

You elect. After this session:
- **R19d is complete** across mentor + all tools (18 surfaces), bar the `/api/reason` + `/api/guardrail` open question (one-line follow-up if you decide they're "tools").
- **A16 / A17** (privacy + regulatory governance, lawyer-coupled) — the FPE/legal track remains the sole long-pole gating Stage-1 close. Highest-leverage next move.
- Small carried items: `V3_SOCIAL_MEDIA_PROMPT` dead-code cleanup; the two practice-name H1 renames (R8c); F10 design-system alignment; the two pending production migrations; PR7 R20b shared-engine promotion.

## Cross-references
- Decision log: `D-R19D-ALL-TOOLS-2026-06-07`; predecessors `D-A18-MIRROR-PROPAGATION-2026-06-07` (mentor portion), `D-A18C-FRAMEWORK-DEPENDENCE-2026-06-07`.
- Rules: `manifest.md` R19d / R19 / R8d / R20d / AC5.
- Backups: `archive/*.backup-pre-r19d-alltools-2026-06-07` (12 files).

*End of session close. Stabilised to known-good: production byte-identical and undeployed; R19d mirror principle added to all 10 scoring/skill surfaces (R19d now 18 surfaces); shared engine gained an opt-in `applyMirrorPrinciple` param (default off); full typecheck exit 0; all 12 edits purely additive (0 lines removed); `/api/reason` + `/api/guardrail` + all 7 perimeter distress blocks byte-identical; all 12 files backed up; uncommitted, awaiting your typecheck then commit; no flags, schema, deploys, or distress-perimeter surfaces touched.*
