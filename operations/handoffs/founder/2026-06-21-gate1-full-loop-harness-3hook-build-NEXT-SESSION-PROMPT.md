# Next-Session Prompt — Gate-1 Full-Loop Harness (Slice 5a): build the 2 new hooks dark (H3 at-action + H4 close)

**For the founder. Paste as the first message of a fresh session.**

**Stream:** founder.
**Tier:** `code-elevated` for **this** session — Slice 5a is **repo-only / dark**: new hook scripts + battery under `harness/` (outside the Next build graph), no install, no prod / perimeter / auth / schema / flag change. *(The ADR-011 lineage treats the harness as a PR1/PR6 surface; the genuinely Critical, founder-walked step is **Slice 5b — activation**, carried to its own session.)*
**Governing frame:** /adopted/standing-protocol-cache.md.
**Governing design:** `adopted/adr/2026-06-20-pre-decision-harness-arc2.md` — **the "Amendment 2026-06-21 — The full-loop harness: minimum 3-hook architecture (Arc 3)"** (the H1–H4 table + design decisions D-A…D-F + the Slice 5a/5b staging). Read it first; this prompt executes Slice 5a of it.
**Predecessor decision-log entry:** `D-SAGE-PRACTICE-GATE1-STANDING-HARNESS-DOGFOOD-PRE-DECISION-MARKER-LIVE` (the standing harness — H1/H2 Live).
**Predecessor finding:** `operations/benchmarks/sage-practice-v1/runs/2026-06-21/leg-d-v6-bare/` (the bare-into-harness test: the installed environment auto-invokes **only** the pre-decision frame; an uninstructed agent self-invoked the practice **zero** times — the motivation for H3/H4).

## Why this session matters

H1 + H2 (the pre-decision frame, top-level + subagent) are Live and dogfooded. The bare-into-harness test proved the gap: the environment frames pre-decision and **nothing else** — Gate 2, loop-closure, the at-action gate, reflect-at-close, and the accreditation write never fire on their own. The dossier's full operating model (`operations/p1-rebuild-2026-06/sage-practice-grounding-dossier.md` §5) needs them. The ADR amendment worked out the floor: **3 hook events deliver the whole task-bearing loop; 2 are Live; this session builds the other 2 scripts (H3, H4) dark + their release-gate battery.** Activation (installing them live) is Slice 5b, founder-walked.

## The architecture (from the ADR amendment — read it for the full rationale)

| Hook | Event | Carries | This session |
|---|---|---|---|
| H1 | `UserPromptSubmit` | Gate 1 top-level frame | Live (unchanged) |
| H2 | `PreToolUse` / `Task\|Agent` | Gate 1 subagent frame | Live (unchanged) |
| **H3** | `PreToolUse` / `<consequential tools>` | R5 at-action cadence — **guardrail gate (can block) + Gate-2 consult + loop-closure (state)** | **BUILD (dark)** |
| **H4** | `Stop` / `SessionEnd` | **reflect-at-close (initiate) + accreditation write (accumulated provenance)** | **BUILD (dark)** |

## Founder design elections to make at open (the ADR's open decisions)
1. **D-A — tool sets:** which tools trigger the **guardrail block** (narrow, irreversible — e.g. destructive `Bash`, deploys) vs the **Gate-2 consult** (broader consequential — e.g. `Edit`/`Write`/`Bash`), and the **dedup/throttle** rule so it doesn't consult before every tool. (Recommendation in the ADR: narrow guard set + broader consult set, fire-once-per-distinct-decision.)
2. **D-F — outage fail-mode for the guardrail block:** default **fail-open-with-honest-log** on an API outage (don't brick the loop), configurable strict. Confirm or change.
3. **D-C — reflect:** confirm H4 **initiates** Q1–Q6 (injects the open) and the model drives the sequence (a hook can't drive a multi-turn exchange) — honest partial.

## Pre-conditions
1. H1/H2 Live + the harness repo intact; local gates green (`logic-harness.mjs` 32/0, `negative-battery.mjs` 56/0). The standing dogfood install + marker are **untouched** by this session.
2. This session writes **only** under `harness/` + the decision log + the close. No install into `.claude/settings.local.json`, no prod call, no credential mint. (Activation is Slice 5b.)
3. 0h remains held.

## Part A — Open under the protocol
Read in order:
1. /adopted/standing-protocol-cache.md (~3 min) — tier, model N/A (hooks are deterministic JS), status vocab, risk class.
2. `adopted/adr/2026-06-20-pre-decision-harness-arc2.md` — **the 2026-06-21 amendment in full** (H1–H4, D-A…D-F, staging) + the original D1–D7 for context.
3. `operations/p1-rebuild-2026-06/sage-practice-grounding-dossier.md` §4 (expected operation, esp. §4.1 R5 cadence, §4.4 loop-closure, §4.5 reflect, §4.6 accreditation) + §6 rows B6/B7/B9/B10.
4. The harness: `harness/gate1-pre-decision/README.md`; `claude-code/hooks/lib/framing-core.mjs` (the shared examine/render/fail core to reuse); `claude-code/hooks/subagent-framing-hook.mjs` (the closest template for H3 — a `PreToolUse` hook that reads `tool_input` and can block); `test/negative-battery.mjs` + `test/logic-harness.mjs` + `test/mock-reason-server.mjs` (the gate to extend); `claude-code/hooks/hooks.json` (registration).
5. For H3's loop-closure (D-B): the LIVE CI-4 `loop-closure-gate.ts` (`analyseLoopClosure`) — **reuse its semantics, don't re-invent** (PR15). For H4's accreditation write (D-D): `sdk/typescript/examples/gate1-3b-walk.ts` + the SDK `writeAccreditation`/`provenanceFrom` (the write+provenance pattern). For H3's guard: the `/api/guardrail` request/response shape (public docs / the route's GET self-doc).

Confirm at open: tier (code-elevated, repo-only); the three founder elections above; status vocab; 0h held.

## Part B — Procedure (Slice 5a — build dark)

### Step 1 — PR11 wire-contract verification (the genuine unknowns)
Before building, confirm first-hand (the close event is **unexercised**; capture raw stdin with the existing `GATE1_DEBUG` pattern, never trust the docs/SDK types alone — the Slice-2 lesson):
- **The close event:** is it `Stop` or `SessionEnd`? Its stdin shape? **Can it initiate a model turn** (required for H4's reflect-initiate)? If neither can initiate, H4's reflect degrades to an honest "run your reflect now" injected note + the accreditation write still lands.
- **`PreToolUse` on real tools:** the `tool_input` shapes for `Bash` / `Edit` / `Write` (what identifies a "consequential"/"irreversible" action), and re-confirm the block contract (`permissionDecision:"deny"` / exit 2).
- Record findings in the close + update the README wire-contracts section.

### Step 2 — Build H3 (the at-action hook, dark)
`claude-code/hooks/at-action-hook.mjs` (reuse `framing-core.mjs`): a `PreToolUse` hook matched to the consequential-tool set (D-A). It implements the R5 cadence:
- **Guard** — on the irreversible-tool subset, call `/api/guardrail`; on a genuine `do_not_proceed`, **block** (deny); on outage, fail-open-with-honest-log (D-F).
- **Score** — on the consequential set, fire a Gate-2 `/api/reason` consult (assessment_first), deduped per distinct decision (fire-once state); inject the redirection as context; **append the signed assessment to the session-provenance state** (for H4/D-D).
- **Iterate (loop-closure, D-B)** — if a prior consult opened a loop (state), carry `prior_feedback` at the same depth; close the loop when the re-examination clears (mirror `analyseLoopClosure`).
- All fail-open-with-honest-log except the guard block. No fake frames, no silent blocks.

### Step 3 — Build H4 (the close hook, dark)
`claude-code/hooks/close-hook.mjs` (reuse `framing-core.mjs`): a `Stop`/`SessionEnd` hook, fire-once-per-session:
- **Reflect-initiate (D-C)** — initiate the reflect open (and the first question) via `/api/practice/reflect`; inject "run your Q1–Q6 now"; the model drives the sequence (honest partial; never abbreviated).
- **Accreditation write (D-D)** — write the accreditation carrying the **accumulated session provenance** (the signed assessments from H1/H3), via the SDK pattern; on a **non-marker** credential bound to the loop's agent_id (NEVER the standing marker credential — it would clobber the marker). Fail-honest.

### Step 4 — Extend the release gate + register dark
- `test/negative-battery.mjs`: add H3 legs (guard-blocks-on-`do_not_proceed`; consult-fires-on-consequential; loop-closure-carries-`prior_feedback`; fire-once-per-decision; outage→fail-open) + H4 legs (reflect-initiates; accreditation-carries-accumulated-provenance; fire-once-per-session; outage→honest), against `mock-reason-server.mjs` (extend the mock for `/api/guardrail` + `/api/practice/reflect` + `/api/accreditation`).
- `test/logic-harness.mjs`: add H3/H4 request-construction + state proofs.
- `claude-code/hooks/hooks.json`: register H3 + H4 (so a future `/plugin install` / standalone merge picks them up) — **but do NOT add them to the founder's `.claude/settings.local.json`** (no live-fire this session).
- Run both gates green. `tsc`/`node` clean.

### Step 5 — Decision-log (lean→full as risk warrants) + close
- Decision-log entry (suggested id `D-SAGE-PRACTICE-GATE1-FULL-LOOP-HARNESS-SLICE5A-BUILT-TEST-VERIFIED`): H3 + H4 built dark + battery green; repo-only, no prod change; the founder elections recorded; Slice 5b (activation) staged.
- Close (per the cache) + CLAUDE.md note (the harness now has H3/H4 built-but-not-installed).
- **Slice 5b spec (carried, `code-critical`/founder-walked):** install H3+H4 in a real loop on a **non-marker** credential; live-verify the four behaviours (guard blocks a destructive action; a mid-task consult fires + a loop opens/closes; reflect initiates at close; an accreditation write lands carrying provenance); PR17 — every prod step the founder's.

## Risk classification
**Slice 5a: code-elevated** — new hook scripts + tests under `harness/` (repo-only, outside the prod build graph); no prod / perimeter / auth / schema / flag / credential change; reversible by `git revert`. **No live-fire.** **Slice 5b (carried): code-critical** — installing the hooks live makes them fire prod consults/gates/writes and **block tool calls** in a real loop (AC7/PR6, founder-walked).

## Rollback
`git revert` the Slice-5a commit (removes the H3/H4 scripts + battery + hooks.json entries). Nothing is installed or live, so there is nothing to deactivate. The standing dogfood install (H1/H2) + the marker are untouched.

## Forecast
Ends with H3 (at-action: guard+score+iterate) and H4 (close: reflect+accredit) **built dark and battery-green**, the release gate extended, and the close-event contract confirmed first-hand — so the full 3-hook loop is ready for a founder-walked Slice-5b activation. After that, an installed environment will invoke the practice at *every* stage deterministically (the gap the bare-into-harness test exposed) — and the harnessed-vs-bare value comparison can finally run on the *real* product, not a tailored prompt. The 0h call stays the founder's.

End of prompt.
