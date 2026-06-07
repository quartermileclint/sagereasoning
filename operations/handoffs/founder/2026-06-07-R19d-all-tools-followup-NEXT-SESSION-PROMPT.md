# Next-Session Prompt — R19d "all tools" follow-up: mirror-principle propagation to the 6 scoring/skill surfaces

Paste this whole file into a new session to proceed. This is the broader reading of R19d's "*the mentor **and all tools***" — extending the mirror principle from the 8 mentor surfaces (done) to the 6 scoring/skill surfaces. Elevated, per-surface wording tailoring. **Not Critical** — but two of the six are inside the R20a distress perimeter, so the distress block on those must be left byte-identical.

**Stream:** founder. **Tier:** `code-elevated`. Confirm at open.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds → Critical Change Protocol step 3 = N/A; this session is Elevated, not Critical, so the full Critical Change Protocol is not engaged unless the AI reclassifies upward).
**Predecessor close:** `/operations/handoffs/founder/2026-06-07-A18c-framework-dependence-close.md` (most recent — A18 complete) and `/operations/handoffs/founder/2026-06-07-A18-mirror-propagation-close.md` (the direct R19d precedent — the 8-mentor-surface propagation this extends).
**Predecessor decision-log entries:** `D-A18-MIRROR-PROPAGATION-2026-06-07` (the proven pattern); `D-A18C-FRAMEWORK-DEPENDENCE-2026-06-07` (most recent).
**Risk classification:** **Elevated** under 0d-ii — additive changes to existing live user-facing system prompts. AC7 not engaged. PR6 **not** engaged (none of the six is the distress classifier / Zone 2-3 / R20a wrapper). The Critical Change Protocol is **not** required; the lean template applies. If a design step is found to require touching a distress-perimeter wrapper, **stop and reclassify**.

## Why this session matters

R19d (manifest line 217) requires the mirror principle in "the mentor **and all tools**." The mentor portion is complete (8/8 mentor surfaces carry the paragraph, `D-A18-MIRROR-PROPAGATION-2026-06-07`). This session closes the "all tools" reach: the 6 evaluation/skill surfaces where a user could paste in *another identifiable person's* writing, decision, or reasoning to "score" them — exactly the misapplication R19d guards against. It is the cheapest remaining R19d work and the last open R19d item. After it, R19d is complete across the entire product surface. It does not gate Stage-1 close (the FPE/legal track does), so it is optional and lower-urgency than A16/A17 — but it is small, self-contained, and finishes a rule cleanly.

## Grounded surface inventory (confirmed 2026-06-07; ground again at open per prescribe-before-grounding)

None of the six carries `MIRROR PRINCIPLE (R19d)` yet (confirmed by grep). Several have more than one system-prompt constant — each must be grounded and decided on individually.

| # | Surface | Route file | System-prompt constant(s) | In R20a perimeter? | Per-surface note |
|---|---|---|---|---|---|
| 1 | `evaluate` | `website/src/app/api/evaluate/route.ts` | `DEMO_SYSTEM_PROMPT` | No (distress block absent) | Demo/eval engine; single prompt; simplest — good PR1 first-proof candidate. |
| 2 | `score-iterate` | `website/src/app/api/score-iterate/route.ts` | `INITIAL_SYSTEM_PROMPT` (+ a second prompt for the iteration step — confirm) | No | Two-step: the engine is called twice. Ground **both** prompt constants. |
| 3 | `score-document` | `website/src/app/api/score-document/route.ts` | `V3_DOCUMENT_SCORING_PROMPT` **and** `V3_POLICY_SCORING_PROMPT` (document vs policy mode) | **Yes** (distress block present) | Two prompts. Keep the R20a distress block byte-identical. Document/policy scoring is where "score someone else's writing" is most likely. |
| 4 | `score-scenario` | `website/src/app/api/score-scenario/route.ts` | `SCENARIO_PROMPT` | **Yes** (distress block present) | **Education tool for young people**; scores responses to *fictional* dilemmas. R19d wording needs the most care here: the framework is applied to fictional scenario characters *by design*, so the paragraph must target applying it to *real, identifiable* people without consent — and must stay age-appropriate. Keep the distress block byte-identical. |
| 5 | `skill/sage-classify` | `website/src/app/api/skill/sage-classify/route.ts` (+ `lib/sage-classify.ts`) | confirm at open | No | Skill contract → **plain-English** wording per R8d glossary tier (no Greek-laden text). |
| 6 | `skill/sage-prioritise` | `website/src/app/api/skill/sage-prioritise/route.ts` (+ `lib/sage-prioritise.ts`) | confirm at open | No | Skill contract → plain-English per R8d. |

## The proven pattern (from `D-A18-MIRROR-PROPAGATION-2026-06-07`)

Additive only — add one mirror paragraph to the relevant system-prompt constant; **no** JSON-schema or route-logic change. The mentor propagation used three surface-adapted variants (verbatim-canonical / question-design / analysis). The scoring/skill surfaces need a **fourth variant — the evaluation-tool variant** — because these tools score a *submitted artefact* (an action, document, scenario response), not the user's own reflection.

**Canonical mentor text (for reference):**
> MIRROR PRINCIPLE (R19d): This framework is a mirror, not a lens — it is for examining the user's own reasoning, not for diagnosing or judging anyone else. If the reflection turns to analysing, labelling, or pathologising another person's character, passions, or reasoning, gently return the focus to the user's own judgements and responses — the only thing within their control. Never use Stoic or philosophical language to invalidate another person's feelings or reasoning. Applying the framework to evaluate someone else without their knowledge and consent is a misapplication, however internally consistent it may seem.

**Evaluation-tool variant (starting point — tailor per surface at the keyboard):** shift the emphasis from "the reflection turns to judging another" to "the *submitted input* is used to evaluate an identifiable other person." E.g.: *"This evaluation is a mirror for the user's own reasoning, not a lens for judging others. If the submitted input is really about evaluating another identifiable person's character or reasoning rather than the user's own action, note that this framework is for self-examination and that scoring another person without their knowledge and consent is a misapplication. Score the reasoning in the input; do not invalidate any real person's feelings or reasoning."* For `skill/*` surfaces, render this in plain English (R8d). For `score-scenario`, target *real* people only (fictional dilemma characters are in-scope by design) and keep it age-appropriate.

## Pre-conditions (founder confirms at open; AI verifies by read)

1. A18c is committed, pushed, Vercel green (confirmed by the founder at A18c close). Working tree clean; no `.git/index.lock`.
2. All 8 mentor surfaces carry the R19d paragraph (`D-A18-MIRROR-PROPAGATION-2026-06-07`); none of the 6 scoring/skill surfaces does (this session's scope).
3. Production flags unchanged; `R20B_INDEPENDENCE_COACHING_ENABLED` UNSET; all four R20a flags `true`.
4. The AI does no git operations (founder commits/pushes via GitHub Desktop; remove `.git/index.lock` first if present).

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — tier, risk class, signals, status vocabulary, AI-failure-modes table incl. prescribe-before-grounding + PR17).
2. `/operations/handoffs/founder/2026-06-07-A18-mirror-propagation-close.md` — the proven R19d pattern (the model for this session).
3. `/manifest.md` targeted — R19d (line 217, the rule); R19 (honest positioning); R8d (plain-English skill contracts); R20d (relationship asymmetry — adjacent); AC5 (R20a perimeter — so the distress block on `score-document` + `score-scenario` is left byte-identical).
4. `/operations/decision-log.md` last 2 entries (`D-A18C-FRAMEWORK-DEPENDENCE`, `D-A18-MIRROR-PROPAGATION`).
5. Each of the 6 surfaces' actual system-prompt constant(s) in full **before editing any** (prescribe-before-grounding guard; the inventory above is a map, not a substitute).

Confirm at open (narrate before substantive work): where we are in the arc (A18 complete; this is the optional R19d "all tools" close); tier = `code-elevated`; risk Elevated; PR6 not engaged; model selection N/A (prompt-text edits only, no LLM call written); status vocabulary. PR15 consult before any bespoke build (here: none — this is prompt-text propagation; state that explicitly).

## Part B — Procedure

### Step 1 — Single-surface proof first (PR1)
Recommend proving the evaluation-tool variant on **`/api/evaluate`** first (simplest, single prompt, not in the perimeter, lowest blast radius). Back up the file to `archive/evaluate-route.ts.backup-pre-r19d-alltools-2026-MM-DD` before editing. Add the tailored paragraph to `DEMO_SYSTEM_PROMPT`. Bring to Verified (typecheck + grep) before extending.

### Step 2 — Extend to the remaining five, per-surface tailored
For each: back up the file first; ground the actual prompt constant(s); add the paragraph tailored to the surface (multi-prompt surfaces — `score-iterate`, `score-document` — get the paragraph in **each** relevant constant; skill surfaces get the plain-English render; `score-scenario` gets the age-appropriate, real-people-only render). On the two perimeter surfaces (`score-document`, `score-scenario`), leave the `enforceDistressCheck(detectDistressTwoStage(...))` block **byte-identical**.

### Step 3 — Build-to-wire verification (additive prompt text; PR2 spirit)
Grep each edited file: exactly one `MIRROR PRINCIPLE (R19d)` (or its plain-English equivalent marker) per relevant prompt constant; every output-JSON schema line intact; the two perimeter distress blocks unchanged (`grep -c` = 1 each, same text).

### Step 4 — Verify
```
cd website && node_modules/.bin/tsc --noEmit      # → exit 0
```
Plus per-surface greps from Step 3. Optional founder behaviour check while signed in: submit an input to one scoring tool that is really about judging another identifiable person; confirm the tool returns focus to self-examination and ordinary self-directed scoring is unchanged. Classify any diagnostic finding's certainty (PR10).

### Step 5 — Decision-log entry (lean form) + session close (lean form)
Per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry" / §"Lean session close". Append `D-R19D-ALL-TOOLS-YYYY-MM-DD`. Record: R19d now complete across mentor + all tools (8 mentor + 6 scoring/skill = 14 surfaces). Then remove `.git/index.lock` if present and supply the exact `git add`/commit command for the founder to push via GitHub Desktop.

## What is NOT in this session
- No JSON-schema or route-logic change — additive system-prompt text only.
- No change to any R20a distress block, Zone 2-3 logic, or wrapper (PR6 trip-wire). The two perimeter surfaces get prompt-text additions only; their distress blocks stay byte-identical.
- No flag activation, no schema, no deploy by the AI (founder commits/pushes; remove the lock file first).
- No edits to governing docs (manifest, staging plan, `CLAUDE.md`) without explicit per-edit founder approval + prior-version backup to `archive/`.

## Rollback path
Per file: restore from its `archive/*.backup-pre-r19d-alltools-*` backup, or revert the commit and push. Pure system-prompt text additions — no schema, flag, or logic to reverse.

## Forecast
Most likely shape: the evaluation-tool variant is proven on `/api/evaluate`, then tailored across the other five (handling the multi-prompt and perimeter and skill-contract and education-tool wrinkles), full typecheck exit 0, all six backed up — completing R19d across the whole product (14 surfaces). One Elevated session, ~1.5–2.5h. After it, the open R19-series and R20-series rule items are closed; the FPE/legal track (A16/A17) remains the sole long-pole to Stage-1 close.

End of prompt. Opens on `main`. Tier `code-elevated`, Elevated risk. Additive prompt-text propagation; distress perimeter untouched; founder commits/pushes via GitHub Desktop.
