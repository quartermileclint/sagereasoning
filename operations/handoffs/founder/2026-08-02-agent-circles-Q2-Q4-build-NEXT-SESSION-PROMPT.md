# Next-Session Prompt — Build Q2 + Q4 (agent-circles), with a checkpoint before verification

**Paste this whole file as the FIRST message of a new session.**

**Target model: `claude-opus-5`, effort `medium`.** State this at the start of your reply (model + effort), one sentence.

**Tier: `code-critical`.** This session writes and lands code in `layer2-mechanisms.ts` — shared with the live `/api/reason` public profile and the live `/api/guardrail` gate (`SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED=true` in production; `dikaiosyneWeighting: true` pinned unconditionally on the gate). Follow this project's own established discipline for this tier: build against a scoped design (already done — see below), test immediately, run the established verdict-equivalence/LOCUS-2 batteries before calling anything done, and run an adversarial review before recommending activation. Nothing in this session sets a flag, deploys, or pushes.

---

## Context (read these before writing any code — do not re-derive from the full build plan)

1. `operations/agent-circles-2026-08/2026-08-02-Q2-positive-routing-scope.md` — the Q2 design (phronesis/sophrosyne routing for a circle-1-only action).
2. `operations/agent-circles-2026-08/2026-08-02-Q4-preexisting-channel-remediation-scope.md` — the Q4 design (narrow `computeDikaiosyneFloor` to exclude `self_preservation`), **now updated with the resolved open question** at its "The open sub-question — RESOLVED, binding" section.
3. `operations/agent-circles-2026-08/2026-08-02-mentor-consultation-q4-residual-verbatim.md` — the binding ruling Q4's design rests on. Verbatim wins over any summary, including the one below.
4. `operations/handoffs/founder/2026-08-01-agent-circles-C0-C1-C3-CLOSE.md` §5 step -1 and §7 — current status of all three blocking items (Q2/Q3/Q4) against the `SUBSTRATE_AGENT_CIRCLES_ENABLED` flag.

**Do not read** the agent-circles build plan, the logos-on plan, the PR19 raw journal, or the earlier Q1–Q9/L1–L4 mentor verbatim records unless one of this session's specific tasks needs to cite something from them — the four files above already carry everything needed to build.

**Build status at handoff:** committed on `main` at `ee6c3f8` (or later — check `git log` fresh; the founder pushes via GitHub Desktop on their own schedule, so do not assume push state). A same-day scoping-only session (Q2/Q3/Q4 design) plus a mentor-consultation reconciliation are committed on top of that. `SUBSTRATE_AGENT_CIRCLES_ENABLED` is unset everywhere; nothing from this arc is live.

## What is settled, so you don't have to re-derive it

- **Q4's narrowing is final-shape, confirmed by the mentor:** exclude `self_preservation` from `computeDikaiosyneFloor`'s engaged-circle set (`website/src/lib/translation-sandwich/layer2-mechanisms.ts`, currently line ~1564-1574), mirroring `kathekon-engagement.ts`'s Arm-1 narrowing (`website/src/lib/substrate/trust-core/kathekon-engagement.ts`, line ~106-132) exactly. **No compensating branch, no Arm-2-style asymmetry at this layer** — the mentor ruled a self-only violated obligation carries zero residual proximity consequence through this function. Do not add one.
- **Q2's routing must key off the SAME "beyond-self engaged" predicate Q4's narrowing introduces**, not a hand-rolled restatement (`circles.length === 0` is the WRONG condition post-Q4 — a schema carrying only a `self_preservation` circle must also trigger Q2's routing, and only Q4's narrowed predicate captures that). **Practical consequence for build order: land Q4's narrowing first, expose its engagement boolean (or the `beyondSelf` array) in a form `applyMechanisms` can reuse**, then write Q2's routing function against that exact value — do not compute "no circle" twice, independently, in two functions.
- **`weakestProximity`, `obligationToProximity`, `PROXIMITY_RANK` are currently unexported** from `layer2-mechanisms.ts` (confirmed by grep at scoping time). Q4's narrowing lives inside the same file as these helpers, so it does not need them exported — only Q3 (if attempted this session) would need that decision made. Do not export them speculatively; only widen the export surface if a task in this session actually needs it.
- **`deriveGuardrailVerdict` (`guardrail-sandwich.ts`) does not read `virtue_domains_engaged`**, confirmed by grep — Q2's routing is verdict-safe by construction. Re-confirm this with a fresh grep before relying on it (files can drift between sessions).

## Build tasks, in order

1. **Q4 — narrow `computeDikaiosyneFloor`.** Implement per the scope doc's code sketch. Add unit tests mirroring `kathekon-engagement.test.ts`'s non-vacuous beyond-self pins (a self-only circle, violated, must NOT floor; a self-only circle plus one other circle, that other circle violated, must still floor via the other circle; the `hasNaturalRelationship`-only path, unidentified party, still reads `reflexive` — unchanged by this fix). Confirm flag-off byte-identity is preserved (this sits behind `dikaiosyneWeighting`, already live, so "flag-off" here means the pre-existing `!dikaiosyne` early-return path in `computeProximity` — untouched by this change; state explicitly in your own verification which flag(s) this narrowing is reachable under).
2. **Q2 — positive routing.** Implement the new pure function per the scope doc, called from `applyMechanisms` right after `computeVirtueDomains`, gated on `agentCircles` (`isAgentCirclesEnabled()`), triggered by Q4's engagement predicate reading "not engaged." Add unit tests: flag-off byte-identity; flag-on + no circle at all → both `phronesis` and `sophrosyne` present, stable order, no duplicates; flag-on + ≥1 circle present → untouched; a mutation test removing the routing call to confirm the new pins are non-vacuous. Extend or add a proximity-invariance pin (mirroring `reasoning-integrity.test.ts` §13) confirming `katorthoma_proximity` is byte-identical with and without the routing call on a matched fixture pair.
3. **Full regression sweep.** `tsc --noEmit`, `npm run build`, and the existing full battery list this arc has been re-running every session (`practice-suggestion`, `loop-fold`, `corroboration-check`, `kathekon-engagement`, `trajectory-delta`, `proximity-dikaiosyne`, `layer2-signer`, `session-decline-signal`, `reasoning-integrity`, `layer1-schema-additions`, `guardrail-sandwich`) — confirm every one is still green, not just the new tests.
4. **The verdict-equivalence and LOCUS-2 batteries** (`website/scripts/guardrail-verdict-equivalence-battery.ts`, `website/scripts/locus2-sandwich-battery.ts`), both directions (`SUBSTRATE_AGENT_CIRCLES_ENABLED` unset vs. `=true`), same pattern the 2026-08-01 build session used. Confirm no fixture's `proceed`/`recommendation` moved in an unsafe direction. Consider adding one dedicated fixture that is genuinely circle-free and natural-relationship-free (the "reorganize my own task queue" class the 2026-08-01 close's §8 caveat named as missing) to positively demonstrate Q2's routing firing, not merely its absence-of-harm.
5. **An adversarial review of Q2+Q4 together** before recommending this build for a founder walk — this project's own established standard for any change to `layer2-mechanisms.ts` this arc. Use the Workflow tool if available; if the account session limit truncates it (this arc has hit that limit repeatedly — four times during the PR19 review alone), complete the review first-hand per the established precedent, and say so plainly rather than silently under-reviewing.

### If time and budget remain: Q3 — the staged-pause tier

Q3 (`operations/agent-circles-2026-08/2026-08-02-Q3-staged-pause-scope.md`) is fully scoped and touches a different file (`guardrail-sandwich.ts`, not `layer2-mechanisms.ts`) with less coupling to Q2/Q4. Attempt it only after Q2+Q4 are battery-green and reviewed. Its one open design choice (evidence-accumulation/promotion — recommended: stateless pause, manual promotion, no new persistence) was left as a recommendation, not a mentor ruling; if you judge it needs the mentor's word before building, say so and stop rather than deciding unilaterally, matching this arc's own established practice. If Q3 is not reached this session, say so plainly at close and leave it fully carried — do not rush it to fit the session.

## PAUSE CHECKPOINT — before starting the verification/adversarial-review phase (task 3 onward)

**Stop before running the regression sweep, the batteries, or the adversarial review (build tasks 3–5, and the Q3 review if you reach it).** At that point, explicitly ask the founder — in plain text, not silently proceeding — whether they want to switch this session's model to **`claude-sonnet-5`, effort `low`**, for the remainder of the session.

Reasoning to give them, briefly: the design and implementation work (tasks 1–2) is the part that benefits most from Opus-tier judgment — it involves the coupled-predicate coordination between Q2 and Q4 and needs to get the narrowing exactly right against the mentor's ruling. The verification phase (running existing batteries, checking pass/fail, running an adversarial-review workflow, adjudicating its findings against already-established patterns from this same arc) is comparatively mechanical and pattern-matching against precedent this project has already run many times — a reasonable place to economize model spend. This project's own history is relevant context to offer them: the PR19 adversarial review earlier in this arc needed four separate resumes purely because of account session-limit exhaustion, not because of task difficulty — so conserving budget going into a verification-heavy phase is a real, previously-demonstrated risk, not a hypothetical one.

Do not decide this yourself — ask, wait for the answer, and proceed with whatever model is actually running afterward (you cannot switch your own model; the founder does this via the CLI). If they decline, continue on Opus at whatever effort is current.

## Boundaries

- No flag set, no deploy, no push, no schema change, no credential mint.
- Don't touch `derive-trust-events.ts` (D4 — a separate, unrelated trust-ledger question), `stoic-brain.ts`, or the logos boundary guard test.
- Don't attempt the new phronesis/sophrosyne-proximity-path question the Q4 ruling surfaced (`operations/agent-circles-2026-08/2026-08-02-mentor-consultation-q4-residual-verbatim.md`, "What this settles, and what it newly opens") — it is explicitly out of scope for this build, named only, its own future scoping item.
- Don't re-litigate Q1/Q3/Q5 or any already-closed fidelity question.
- Only build Q3 if Q2+Q4 are fully done first, per the ordering above.

## Exit

- Update the close doc (`2026-08-01-agent-circles-C0-C1-C3-CLOSE.md`) §1/§4/§5/§6/§7 to reflect what actually got built, tested, and reviewed this session — including which model ran which phase, per the pause checkpoint above (state this plainly; it is a legitimate, disclosed part of the session's method, not something to omit).
- Append a decision-log entry.
- Commit only if explicitly asked (per standing git policy — do not commit without being told to this session); the founder pushes separately via GitHub Desktop.
- State plainly at the end: whether Q2+Q4 are battery-green and reviewed (ready for a founder walk toward the flag), whether Q3 was reached, and what — if anything — is still carried.
