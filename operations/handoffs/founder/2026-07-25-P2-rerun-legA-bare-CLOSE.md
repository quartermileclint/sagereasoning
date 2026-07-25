# Session Close — 2026-07-25 — P2 Fable-5 Rerun, Leg A (bare)

**Stream:** founder.
**Governing frame:** /adopted/session-opening-protocol.md (cached via /adopted/standing-protocol-cache.md).
**Tier:** `governance` — Standard risk (documents + an isolated, destroyed scratch; a local reversible settings bracket, restored in-session; no production surface, no mint).
**Date:** 2026-07-25.
**Model (Step 0 gate):** Claude Fable 5 (`claude-fable-5`), extended thinking active, no effort override in settings — orchestrator. The three scenario-performing sessions: **harness-attested `claude-fable-5` / effort `high`** via the app's session records, corroborated 3/3 by in-band post-task self-report (with the `reasoning_effort: 40` discrepancy disclosed below).

## Decisions Made

- `D-AGENT-ORG-P2-RERUN-LEG-A-MECHANICS-STOP-2026-07-25` — the prescribed repo-rooted-subagent mechanism STOPPED at the validity gate before any run: a no-tools probe subagent received the full repo CLAUDE.md + memory index (~219k tokens; exact first-line quote returned) — the S6 contamination class; no `claude` CLI exists for a programmatic clean spawn. Replacement: founder-opened fresh conversations in a neutral scratch project (`ops-briefs-20260725`, renamed from the prescribed `p2-bare-scratch-*`, whose name itself carried leak terms). Leg-A prompt amended in place; memory `subagent-context-carries-claudemd` saved.
- `D-AGENT-ORG-P2-RERUN-LEG-A-BARE-2026-07-25` — leg A COMPLETE, same day. Three fresh conversations, opening prompts verified verbatim from the app's transcripts, sealed files never in the scratch context, leak greps zero-hit. Scored against the sealed keys (the key governs; arguable calls quoted verbatim in `leg-a-scoring.md`): **S1 CAUGHT (full, 2 bonus signals) · S2 FULL CATCH (3 bonus signals) · S3 STRONG (10/10 judgement items; no automatic-Weak; C1–C3 shown)**. Task wall-clock 68s / 57s / 194s (sum 319s); tool calls 3 / 4 / ≥6; zero API-billed cost (bare = uncredentialed app usage; KG5).

## Status Changes

| Item | Old | New |
|---|---|---|
| P2 rerun arc | Session 1 complete; leg A next | **Leg A COMPLETE** — leg B next |
| Leg-A prompt (`…legA-bare-NEXT-SESSION-PROMPT.md`) | Operative | Spent + AMENDED (Step 3 mechanism invalid; Step 2 name superseded; leg B inherits) |
| Scenario subagent mechanics (repo-rooted) | Assumed viable | **Empirically invalid** (claudeMd injection, probe-proven; durable memory saved) |
| Scratch `ops-briefs-20260725` | — | Built → runs → collected → destroyed |
| Practice hooks (founder loop) | ON | OFF during the run window → **RESTORED + validated** (PROVISIONED echo; net-zero) |
| Leg-B prompt (`…legB-harnessed-NEXT-SESSION-PROMPT.md`) | — | Authored |

## Next Session Should

Run **leg B (harnessed)** per `operations/handoffs/founder/2026-07-25-P2-rerun-legB-harnessed-NEXT-SESSION-PROMPT.md` — a FRESH session (this one closes the leg entirely). Founder-walked mints (six-element Critical exchange first; `mint api`, K1-canonical agent_id, raised limits); selector-constancy is a hard pre-condition (see Open Questions); the S2 artifact-text gating instruction is load-bearing. ~1.5–2.5 hours. Then the verdict session (frozen thresholds; Limitations mandatory).

## Blocked On

**Files remaining uncommitted (this session's commit set):**
- `operations/agent-org-2026-07/runs/2026-07-25-rerun/leg-a/` (FOUNDER-RUN-INSTRUCTIONS.md, outputs ×5, leg-a-metrics.md, leg-a-scoring.md)
- `operations/handoffs/founder/2026-07-25-P2-rerun-legA-bare-NEXT-SESSION-PROMPT.md` (amendment)
- `operations/handoffs/founder/2026-07-25-P2-rerun-legB-harnessed-NEXT-SESSION-PROMPT.md`
- `operations/handoffs/founder/2026-07-25-P2-rerun-legA-bare-CLOSE.md`
- `operations/decision-log.md` (two entries)
- `CLAUDE.md` (arc pointer)

**Production state at session close (as of 2026-07-25, per PR18):** No production change — documents only; no mint, no flag, no schema, no deploy, no SageReasoning API traffic (the bare leg made none — that is what bare means). The three scenario conversations consumed founder-subscription app usage only. The practice hooks are restored ON with the trust-record write path PROVISIONED (validated echo); during this session the hooks demonstrably fired (one live at-action frame, one guard CAUTION + elicitation on the scratch teardown — answered genuinely — and repeated honest 28s consult timeouts, the disclosed S11b class). `website/public/images/millstone.PNG` remains untracked in the working tree — the founder's brand-thread image, not this session's; untouched. **S11 remains REFUSED; MEASURE throughout; weights BLOCKED; the 0h call remains the founder's.**

## Open Questions

- **Effort attribution (`high` vs `reasoning_effort: 40`):** app session metadata says `high` for all three performing sessions; all three agents self-read an in-band numeric 40. The mapping is unverifiable from this session. Bounded by making **selector-constancy** leg B's pre-condition (arms matched regardless); belongs verbatim in the verdict memo's Limitations.
- **Single-scorer limitation:** one scorer (this session, same model family as the performers) against independently-authored keys; every arguable call quoted key-verbatim in `leg-a-scoring.md` so a second scorer can re-adjudicate without re-deriving. Also for Limitations.
- The predecessor close's S3 fictional-vs-real override window is now closed (leg A ran on Coldspur as authored).
- Carried, unrelated to this arc: CRED-1 (ae2-smoke revocation check) + the four AUTH post-deploy smokes (founder-walked, from the 07-25 audit close).

## Founder Verification

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add \
  operations/agent-org-2026-07/runs/2026-07-25-rerun/leg-a \
  operations/handoffs/founder/2026-07-25-P2-rerun-legA-bare-NEXT-SESSION-PROMPT.md \
  operations/handoffs/founder/2026-07-25-P2-rerun-legB-harnessed-NEXT-SESSION-PROMPT.md \
  operations/handoffs/founder/2026-07-25-P2-rerun-legA-bare-CLOSE.md \
  operations/decision-log.md \
  CLAUDE.md
git commit -F - <<'MSG'
P2 rerun leg A (bare) COMPLETE under harness-attested Fable 5 + the mechanics stop that made it valid

Stopped the prescribed subagent mechanics at the validity gate (probe: subagents
receive the full repo CLAUDE.md + memory index, ~219k tokens — the S6 contamination
class); ran the three scenarios as founder-opened fresh conversations in a neutral
scratch project instead. Attribution harness-side: claude-fable-5 / effort high on
all three performing sessions (in-band reasoning_effort:40 discrepancy disclosed;
leg B pre-condition = selector-constancy). Sealed-key scoring: S1 CAUGHT (full),
S2 FULL CATCH, S3 STRONG (10/10). Wall-clock 68/57/194s; zero API cost (bare).
Practice hooks bracketed off for the runs and restored (PROVISIONED). Leg-B prompt
authored carrying both mechanics corrections + mint walk + S2 artifact-text gating.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
MSG
git status --porcelain
```
Expected: only `?? website/public/images/millstone.PNG` remains (the founder's untracked brand image). Then push via GitHub Desktop — documents only; the deploy is a runtime no-op.

## Cross-references

- `operations/handoffs/founder/2026-07-25-P2-rerun-legB-harnessed-NEXT-SESSION-PROMPT.md` (next)
- `operations/agent-org-2026-07/runs/2026-07-25-rerun/leg-a/leg-a-metrics.md` + `leg-a-scoring.md`
- `D-AGENT-ORG-P2-RERUN-LEG-A-MECHANICS-STOP-2026-07-25` · `D-AGENT-ORG-P2-RERUN-LEG-A-BARE-2026-07-25`
- `operations/handoffs/founder/2026-07-25-P2-rerun-scenario-refresh-CLOSE.md` (predecessor)
- Performing sessions (app records): `local_47323768…` (S1) · `local_b57f99f8…` (S2) · `local_25601d94…` (S3)

*End of session close. The bare arm is run, attributed, scored, and torn down; the harnessed arm is next.*
