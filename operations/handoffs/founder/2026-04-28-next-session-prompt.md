# Next Session Prompt

Copy everything below the line into a new session.

---

Governing frame: `/adopted/session-opening-protocol.md`.

Read the session handoff first: `/operations/handoffs/founder/2026-04-28-registry-update-attempt-rolled-back-close.md`. That close describes the previous session's full attempt and rollback. It is the most important context for what this session needs to do differently.

This is a continuation of SageReasoning P0 (R&D phase). Session focus: founder/tech stream.

**What just happened (in one paragraph):**

The previous session attempted to use the `sage-registry-update` skill for the first time (PR1 proof). The skill produced an internally-contradictory partial update — rows showed `status: verified` while their `notes` field still read "Not integrated", and the transitive impact on still-blocked rows was never assessed. After three patch cycles in one session, the founder concluded the skill itself answers the wrong question and chose to roll back v1.3.0 entirely. The registry on disk is now `v1.2.0`, identical to its pre-session state. No live deploy occurred. The skill requires redesign before next use.

**The founder's actual end-goal (this is the test for everything below):**

> "I want to be able to see what progress has been made by all of the work that I have done. The end goal is that everything that is needed to be updated or added in the two HTMLs is done to reflect the current status so I can see what work is done and what still needs to be done."

The two HTMLs are `https://www.sagereasoning.com/SageReasoning_Capability_Inventory.html` and `https://www.sagereasoning.com/SageReasoning_Architecture_Map.html`. Both render at runtime from `/website/public/component-registry.json` (and `/website/public/flows.json` for the architecture map). Updates land by editing those JSON files and pushing.

---

## What this session should do (in order)

### Part A — Open the session under the protocol (no shortcuts)

Per `/adopted/session-opening-protocol.md` Part A elements 1–8, do the full read sequence. Tier: founder/tech, governance scope. Read:

1. `/manifest.md`
2. (Project instructions — already in system prompt)
3. `/operations/handoffs/founder/2026-04-28-registry-update-attempt-rolled-back-close.md` (the previous session's full close — required context)
4. `/operations/decision-log.md` — at minimum the last two entries (`D-REGISTRY-UPDATE-1.3.0` and `D-REGISTRY-UPDATE-1.3.0-SUPERSEDED`, both 2026-04-28)
5. `/operations/registry-updates/proposed-2026-04-28.md` (the SUPERSEDED proposal — useful evidence input but DO NOT re-apply as-is)
6. `/operations/knowledge-gaps.md` — the two new candidate observations from the previous session are at the bottom
7. `/.claude/skills/sage-registry-update/SKILL.md` (the existing skill — read it BEFORE proposing redesign so the redesign is grounded in what's actually there)
8. `/website/public/component-registry.json` (the v1.2.0 file currently on disk)
9. `/website/public/SageReasoning_Capability_Inventory.html` and `/website/public/SageReasoning_Architecture_Map.html` (so the redesign understands what fields drive what on the rendered pages)

Confirm: tier, hold-point status (still active), model selection (no code expected; flag if changes), status-vocabulary readiness, signals/risk-classification readiness.

### Part B — Verify git working-tree state (founder needs this confirmed before further work)

In the previous session, after rollback, `git status -s` showed `M website/public/component-registry.json` even though the file was byte-identical to its backup. The founder was asked to investigate. Confirm with the founder whether:

- They ran `git diff website/public/component-registry.json | head -20` and what it showed
- Whether `git log -1 -- website/public/component-registry.json` shows a v1.3.0-shaped commit they don't recognise
- What the current working-tree state is (clean / dirty / partially staged)

If the working tree is dirty in a way that affects this session's work, stabilise it first (per session-opening-protocol element 19) before proceeding to Part C.

### Part C — Redesign the skill before any further use

This is the first agenda item, and Parts D and E depend on it.

The previous skill's failure was scope. It scanned recent handoffs only, looked at `status` and `blocker` only, and explicitly told itself to preserve `notes`, `connects`, `deps`, `humanReady`, `agentReady`. That conservative scope produced exactly the partial-update problem.

**The redesign brief (founder's stated need):**

The skill should answer ONE question: *"Does the registry reflect the actual current state of the project, across every field that drives the two HTMLs?"* Not *"what edits do recent handoffs justify?"*

Required redesign elements (subject to founder approval before any SKILL.md edits):

1. **Broaden scope from `status + blocker` to every field that drives the HTMLs.** That includes at minimum: `status`, `oldStatus`, `desc`, `notes`, `humanReady`, `agentReady`, `journey`, `priority`, `connects`, `deps`, `blocker`. Each field's source-of-truth needs naming (e.g., `status` is from handoffs + decision log; `connects` is from grep against actual imports in `/website/src/`; `notes` is a synthesis of the row's overall current state).

2. **Require an actual-code verification pass.** Don't trust handoff text alone — for any claim about a module being integrated/isolated, grep `/website/src/` (and other relevant trees) for imports of that module. This is what the founder pushback in the previous session forced manually three times.

3. **Require a transitive impact pass.** When components are promoted, every row whose blocker text references the promoted module's old state must be reviewed. Walk the registry's `connects` and `deps` arrays to find candidates.

4. **Treat the registry as the source-of-truth for "what's done / what's next" — not as a thin diff against handoffs.** A field that's stale (e.g., `notes` saying "Not integrated" while `status: verified`) is itself a defect the skill must catch.

5. **Open question for the founder to decide:** Is this one skill or two? The narrow original design isn't wrong for incremental updates between major checkpoints. The comprehensive-audit shape might warrant its own skill (e.g., `sage-registry-audit`) run less often. Surface the trade-off; let founder pick.

6. **Open question for the founder to decide:** Should the skill clear blockers when the blocking condition is genuinely resolved, or always preserve a "remaining work" note? The previous skill was conservative-by-default (refine, don't clear). The founder's end-goal ("see what's done") implies a row with no remaining work should clear its blocker entirely so it's no longer red on the dashboard.

7. **Open question for the founder to decide:** `humanReady` / `agentReady` semantics for pipeline-internal engines. Currently several read `not-ready` when they were never going to be human-facing (`na` would be the truer value, the way `engine-sage-reason-engine` is scored). Pick a rule and apply it consistently.

Propose the redesign as a markdown plan FIRST. Get founder approval. Only THEN edit `/.claude/skills/sage-registry-update/SKILL.md`. Pre-edit backup per D6-A archive convention before any SKILL.md edit.

### Part D — Run the redesigned skill to land a comprehensive update

After approval and SKILL.md edit:

1. Run the new skill against the registry.
2. The output should be a single comprehensive proposal at `/operations/registry-updates/proposed-2026-04-28-b.md` (or next-day if multi-day) covering every field of every component that needs change, with evidence per row (handoff quote, code grep result, decision-log reference).
3. The previous session's `/operations/registry-updates/proposed-2026-04-28.md` is useful evidence input — don't ignore it — but the new proposal must be derived independently. If the previous proposal's items survive the new comprehensive pass, fine. If they don't, that's also fine.
4. Founder reviews the proposal once. Approves / modifies / rejects per item or in bulk.
5. Apply approved edits in one pass. One backup. One decision-log entry. One push.
6. Per skill: pre-edit backup at `/archive/component-registry/component-registry.json.backup-YYYY-MM-DD-HHMM`, JSON validation, statusSummary recompute, lastUpdated and version bump, totalComponents recount.

### Part E — Verify on the live site

After deploy (Vercel ~1 minute after push):

1. Open `https://www.sagereasoning.com/SageReasoning_Capability_Inventory.html`. Confirm: the skill banner shows the new `lastUpdated` date; rows the proposal said should be green (no blocker) are green; rows the proposal said should still be red (with refined blocker text) show that refined text in red.
2. Open `https://www.sagereasoning.com/SageReasoning_Architecture_Map.html`. Same check on the map view.
3. Walk the founder through one or two specific rows together (e.g., engine-pattern-engine, engine-ring-wrapper) to confirm the live-site rendering matches what the proposal said it would.
4. If anything looks wrong, restore from the pre-edit backup and report what failed. Skill rollback section governs.

---

## Important context

**Founder is a non-coder.** Plain-language explanations of what each change does and means. Exact copy-paste terminal commands for any deploy. Describe changes in terms of what they do for the founder, not how they're implemented.

**Founder decides direction; AI surfaces options with reasoning.** Never edit governing documents (manifest, project instructions, adopted protocols, the skill SKILL.md) without explicit approval. The skill redesign in Part C is a governing-document edit.

**Previous session lost trust.** The founder explicitly said the skill needed patching multiple times and they want to see actual progress, not assembled patches. Restore trust by: (a) doing Part A properly with no shortcuts; (b) presenting the redesign as a plan first, not a fait accompli; (c) producing one comprehensive proposal for Part D, not a series; (d) one push, not three.

**Don't propose a parallel skill for flows.json this session.** The flows skill (`sage-flows-update`) is also Scaffolded but the previous session's failure was specifically about registry. Keep scope tight. Flows redesign is a future session.

**Risk classification:** All edits this session are likely Standard (JSON content-only, with backup + rollback) except the SKILL.md edit which is Elevated (governing document; affects future skill behaviour for every registry update). Engage the Critical Change Protocol (0c-ii) only if Critical risk surfaces (none expected).

---

## Standing reminders

- Single source of truth for both dashboards: `/website/public/component-registry.json`. Do not edit `/website/public/SageReasoning_*.html` for content updates — that's not how the rendering works.
- Pre-edit backups go to `/archive/component-registry/` (registry skill) before any JSON write.
- Decision-log entry per applied update.
- Provide the founder with `git add / git commit / git push` commands verbatim for every deploy-bound change. If `git push` fails (the recurring sandbox-can't-push pattern noted in D-PR8-PUSH 2026-04-26), use GitHub Desktop instead.
- Founder verifies between sessions, not in real time. Provide URLs, expected results, and copy-paste commands.

---

End of prompt. Confirm receipt and full Part A read before proceeding to Part B.
