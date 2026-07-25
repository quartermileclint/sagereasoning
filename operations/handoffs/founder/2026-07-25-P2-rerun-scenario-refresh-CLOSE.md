# Session Close — 2026-07-25 — P2 Fable-5 Rerun, Session 1: Spec/Scenario Refresh

**Stream:** founder.
**Governing frame:** /adopted/session-opening-protocol.md (cached via /adopted/standing-protocol-cache.md).
**Tier:** `governance` — Standard risk.
**Date:** 2026-07-25.
**Model (Step 0 gate, stated per the arc prompt):** Claude Fable 5 (`claude-fable-5`), high reasoning effort — genuinely, not a fallback. Every scenario-authoring/key/sweep subagent inherited the same model.

## Decisions Made

- `D-AGENT-ORG-P2-RERUN-SCENARIO-REFRESH-2026-07-25` appended. The P2 rerun arc is commenced: model gate passed; build-state precondition re-confirmed live (health `healthy`, `origin/main` = `15ba8fd` clean, `bcf8667`/`a506916` ancestors of deployed HEAD); three fresh sealed scenario packages authored, independently keyed, independently swept (nine distinct agent invocations — author ≠ key-writer ≠ sweep-reviewer per audit §6.7(a)); all sweeps PASS WITH REQUIRED EDITS, every edit applied verbatim; final leak-grep over all 7 player files clean.

## Status Changes

| Item | Old | New |
|---|---|---|
| P2 rerun arc | Awaiting commencement | In progress — session 1 of 3–4 complete |
| Fresh scenario packages (S1/S2/S3) | — | Authored + swept + frozen (`runs/2026-07-25-rerun/`) |
| S2 finding-4 design gap (claim-as-fact in the gated artifact) | Open | Closed in the fresh S2 package design |
| Mandatory `model:`/`effort:` metrics fields (Step 0.2) | — | Encoded in `runs/2026-07-25-rerun/metrics-template.md` |
| Verdict-memo Limitations requirement (Step 2d) | — | Encoded in the package README + S3 sealed Realism-limits section |

## What the packages are (one line each)

- **S1 (justice-floor):** Rowanmere facilities — dynamic-roster savings (~$410k) vs. ~140 satellite night cleaners' schedule-stability claim; borderline by design; sweep re-derived the arithmetic and confirmed not secretly stark.
- **S2 (corroboration):** Torvane/Ellsworth field-safety Method Change Notice — the draft asserts "independently reviewed … cleared without conditions" as fact; three work-record entries contradict it; the artifact text itself is what leg B gates.
- **S3 (general task):** Coldspur cold-chain telemetry — inventory refresh over a deliberately imperfect status log; ten judgement items keyed; realism limits candidly sealed for the verdict memo's Limitations section.

## Next Session Should

Run **leg A (bare)** per `operations/handoffs/founder/2026-07-25-P2-rerun-legA-bare-NEXT-SESSION-PROMPT.md` — model gate first; clean scratch sibling directory; one fresh subagent per scenario; `model:`/`effort:` logged in the metrics file; score against the sealed keys after the runs; close entirely before any leg-B work. Pre-condition: this session's records commit pushed. ~1–2 hours.

## Blocked On

**Files remaining uncommitted (this session's commit set):**
- `operations/agent-org-2026-07/runs/2026-07-25-rerun/` (18 files)
- `operations/handoffs/founder/2026-07-25-P2-rerun-legA-bare-NEXT-SESSION-PROMPT.md`
- `operations/handoffs/founder/2026-07-25-P2-rerun-scenario-refresh-CLOSE.md`
- `operations/decision-log.md`
- `CLAUDE.md`

**Production state at session close (as of 2026-07-25, per PR18):** No production change — documents only; no mint, flag, schema, deploy, or live op. Production remains exactly as CLAUDE.md's Live list describes. The predecessor close's founder-walked items remain outstanding and unrelated to this arc: CRED-1 (ae2-smoke revocation check) and the four AUTH post-deploy smokes. **S11 remains REFUSED; MEASURE throughout; weights BLOCKED; the 0h call remains the founder's.**

## Open Questions

- **S3 fictional-vs-real (founder-overridable before leg A):** this session elected a fully fictional project (Coldspur) over the spec-freeze sketch's "AO program's own state" gesture — reasoning: mandatory freshness, cleaner leak control, §6.7(c)'s synthetic-context-with-disclosed-limits path. Flagged, not silently inherited; say the word and S3 gets re-authored sanitized-real before leg A.
- Harness observation (honest note): the session-open framing and one at-action frame fired live; every other at-action examination on this session's writes timed out at 28s (the disclosed fail-open-honest class, S11b) — consistent with the standing consult-latency observations; nothing blocked.

## Founder Verification

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add \
  operations/agent-org-2026-07/runs/2026-07-25-rerun \
  operations/handoffs/founder/2026-07-25-P2-rerun-legA-bare-NEXT-SESSION-PROMPT.md \
  operations/handoffs/founder/2026-07-25-P2-rerun-scenario-refresh-CLOSE.md \
  operations/decision-log.md \
  CLAUDE.md
git commit -F - <<'MSG'
P2 Fable-5 rerun session 1: fresh sealed scenario packages under full role separation

Model gate passed (genuine Fable 5, high effort, stated at open). Build-state
precondition re-confirmed live. Three fresh packages (S1 Rowanmere justice-floor;
S2 Torvane claim-asserted-as-fact corroboration — the finding-4 fix at the root;
S3 Coldspur deliberately-imperfect general task) authored, independently keyed,
and independently swept — nine distinct agents, author != key-writer != sweep
(audit §6.7(a)). All sweeps PASS WITH REQUIRED EDITS; all edits applied verbatim;
leak-grep over all 7 player files clean. Metrics template mandates model:/effort:
(Step 0.2). Leg-A prompt authored; leg A runs next, then leg B (founder-walked
mints), then the verdict memo with its mandatory Limitations section.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
MSG
git status --porcelain
```
Expected: `git status --porcelain` shows nothing after the commit. Then push via GitHub Desktop (no Vercel-relevant changes — documents only; the deploy will be a no-op for runtime behaviour).

## Cross-references

- `operations/handoffs/founder/2026-07-25-P2-fable5-rerun-NEXT-SESSION-PROMPT.md` (the arc prompt; Steps 0–2 discharged this session)
- `operations/handoffs/founder/2026-07-25-P2-rerun-legA-bare-NEXT-SESSION-PROMPT.md` (next)
- `D-AGENT-ORG-P2-RERUN-SCENARIO-REFRESH-2026-07-25`
- `operations/agent-org-2026-07/2026-07-20-P2-spec-freeze.md` (frozen thresholds — unchanged)
- `operations/agent-org-2026-07/runs/verdict-memo-2026-07-21.md` (erratum + finding 4)
- `operations/handoffs/founder/2026-07-25-fable5-audit-and-auth-fixes-CLOSE.md` (predecessor)

*End of session close. The instrument for the model-controlled rerun is built, independently reviewed, and frozen; leg A is next.*
