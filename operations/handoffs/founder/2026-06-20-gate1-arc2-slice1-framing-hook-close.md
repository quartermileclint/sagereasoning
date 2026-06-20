# Session Close — 2026-06-20 — Gate-1 Arc 2, Slice 1: the framing hook (built + logic-Verified)

**Stream:** founder.
**Governing frame:** /adopted/standing-protocol-cache.md (Lean + Elevated additions).
**Tier:** `code-elevated` — Elevated risk. (Founder reclassified down from the staged `code-critical` at open: Slice 1 is TEST-only and touches no production / auth / R20a-perimeter / deployment surface; the genuine AC7 triggers arrive at Slice 3.)
**Date:** 2026-06-20.
**Mode:** Cowork. Third session dated 2026-06-20 (after the Arc-1 activation close and the Arc-2 design/staging close).

## Decisions Made
- `D-SAGE-PRACTICE-GATE1-ARC2-SLICE1-FRAMING-HOOK-BUILT-LOGIC-VERIFIED` appended. The Slice-1 `UserPromptSubmit` framing hook is built and **logic-Verified in-sandbox (22/0)**; the PR1 trajectory proof is staged as a founder-walked Claude Code step.
- Two founder elections at open: **tier → code-elevated**; **session scope → build here + I script the proof**.
- **Wire-contract resolution (PR11/PR12, first-hand):** ADR-011's open question is answered — the `http` handler type **exists**, but it can only fail *open*, so the reference hook uses the **`command`** path to serve both fail modes from one artifact.

## Status Changes
| Item | Old | New |
|---|---|---|
| Gate-1 Arc-2 harness (Claude Code surface) | Scoped (ADR-011) | **Wired; logic-Verified in-sandbox** |
| Slice 1 (`UserPromptSubmit` framing hook) | Scoped | **Built; Verified (trajectory) pending the founder-walked proof** |
| `pre_decision_harness` marker | Un-issued | Un-issued (first issued at Slice 3) |
| ADR-011 open question (`http` handler) | Open | **Resolved first-hand** (exists; `command` chosen for strict-mode support) |

## Next Session Should
**Run the PR1 trajectory proof to close Slice 1 to Verified** — the founder-walked Claude Code step in `harness/gate1-pre-decision/claude-code/PR1-PROOF-WALKTHROUGH.md` (mint a throwaway TEST credential → start the TEST dev server → smoke-test `/api/reason` → register the hook → fresh Claude Code session → submit the one fixture → confirm framing-before-first-action + frame-in-first-turn). This needs Claude Code + the local TEST server, which Cowork cannot reach. **Then Slice 2** — the trajectory + negative battery (skip-attempt / outage / continuation / subagent) as the CI release gate (`code-critical` per ADR-011), which must pass before Slice 3 (plugin packaging + the operator credential mint that issues the first `pre_decision_harness` marker). Est: PR1 proof ~30–45 min; Slice 2 ~2.5–3 hours.

## Blocked On
**Files remaining uncommitted (the founder commits by name):**
- `harness/gate1-pre-decision/` (NEW — 8 files: the hook, config example, settings snippet, fixture, PR1 walkthrough, mock, logic harness, README)
- `operations/decision-log.md` (`D-SAGE-PRACTICE-GATE1-ARC2-SLICE1-FRAMING-HOOK-BUILT-LOGIC-VERIFIED`)
- `operations/handoffs/founder/2026-06-20-gate1-arc2-slice1-framing-hook-close.md` (this file)

**Production state at session close (PR18):** **No production change this session** (a TEST-only developer artifact; nothing deployed, no flag/schema/credential touched). Everything Live before this session is unchanged: Arc 1 `examination_mode` Live (`SUBSTRATE_EXAMINATION_MODE_ENABLED=true`); `pre_decision_harness` un-issued. **`CLAUDE.md` intentionally NOT edited** — no production state changed (PR18; founder-approval preference for the governing entry-point). Say the word if you want a one-line "Arc 2 Slice 1 built (logic-Verified)" note added to it.

## Open Questions
- The trajectory proof wants `SUBSTRATE_L3_DEFER_ENABLED=true` on TEST for a clean fast happy path (else the call runs the ~30s full-prose path and the hook fail-opens on timeout). Documented in the walkthrough Prerequisites.
- Fire-once is **session-keyed** (D5's accepted "per-session/state flag"). Distinguishing multiple *distinct* tasks within one session is a Slice-2 refinement.
- `UserPromptSubmit` does not fire for subagents — delegated-task framing via `SubagentStart` is a Slice-2 battery item.

## Founder Verification (between sessions)
Independent, in-sandbox (no TEST server needed):
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
node harness/gate1-pre-decision/test/logic-harness.mjs        # expect: 22 passed, 0 failed
```
Then commit:
```
git add harness/gate1-pre-decision/ \
        operations/decision-log.md \
        operations/handoffs/founder/2026-06-20-gate1-arc2-slice1-framing-hook-close.md
git commit -m "Gate-1 Arc 2 Slice 1: UserPromptSubmit framing hook (logic-Verified; PR1 proof staged)"
```
Then push via GitHub Desktop. No build/deploy behaviour changes — Vercel will rebuild from the push but the harness is outside the Next.js app (it is a standalone developer artifact). (If GitHub Desktop reports a stale `.git/index.lock`, run `rm -f ".git/index.lock"` first — the Cowork sandbox cannot clear it.)

To verify the substance: open `harness/gate1-pre-decision/README.md` and `claude-code/PR1-PROOF-WALKTHROUGH.md`; confirm the hook design matches ADR-011 D1–D5 and the walkthrough is runnable on your machine.

## Cross-references
- adopted/adr/2026-06-20-pre-decision-harness-arc2.md (ADR-011 — Slice 1)
- operations/handoffs/founder/2026-06-20-gate1-arc2-harness-design-staging-close.md (predecessor close)
- operations/handoffs/founder/2026-06-20-gate1-arc2-slice1-framing-hook-NEXT-SESSION-PROMPT.md (this session's prompt)
- /operations/decision-log.md — `D-SAGE-PRACTICE-GATE1-ARC2-SLICE1-FRAMING-HOOK-BUILT-LOGIC-VERIFIED`
- harness/gate1-pre-decision/ (the build)

*End of session close. Stable, known-good state: the Slice-1 framing hook is built and logic-Verified in-sandbox (22/0); nothing in production changed; `pre_decision_harness` stays un-issued. Slice 1 reaches Verified when the founder runs the PR1 trajectory proof in Claude Code. The 0h launch call remains the founder's.*
