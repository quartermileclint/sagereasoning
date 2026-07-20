# Session Close — 2026-07-20 — P2 Spec-Freeze: Bare-vs-Harnessed Value Benchmark Re-Run

**Stream:** founder (AO program — P2).
**Governing frame:** `/adopted/standing-protocol-cache.md`; `operations/agent-org-2026-07/agent-org-and-evidence-build-plan.md` §3-P2.
**Tier:** `governance` — Standard risk.
**Date:** 2026-07-20.

## Decisions Made
- `D-AGENT-ORG-P2-SPEC-FREEZE-2026-07-20` appended (+21 lines). Froze the P2 scenario set (3 scenarios) and thresholds (2 / 50% / $5, all confirmed via AskUserQuestion at the recommended carried-forward values) for the bare-vs-harnessed re-run.

## Status Changes
| Item | Old | New |
|---|---|---|
| P2 (bare-vs-harnessed re-run) | Not started | Spec frozen — scenario set + thresholds signed off; ready for the bare-arm session |
| `operations/agent-org-2026-07/runs/` | Did not exist | Created (empty — the bare-arm session's output root) |

## Next Session Should

Run the **bare-arm leg (leg A)** of the P2 benchmark. Estimated tier: `code-critical` per the plan's §3-P2 (this leg itself is read/write-only in a scratch context, no live credential mint needed for leg A specifically — but the plan tiers the whole P2 arc `code-critical` and the bare-arm session must still treat the scratch-context isolation as a structural, not optional, requirement). Estimated time: comparable to the 2026-06-11 bare leg (a multi-hour session).

**Pre-conditions the bare-arm session must discharge at its own open (per §6 of the spec-freeze document, not re-derived here):**
1. Re-run the build-state precondition check (§0 of the spec-freeze) live — do not cite this close's confirmation as still-true.
2. Author the three full sealed scenario briefs from the §3 sketches (S1 justice-floor, S2 corroboration, S3 general-task), each with a sealed answer key and a **sealed dispositive-fact sweep written by a reviewer distinct from the brief's author** — this can be a separate Agent/Task invocation within the orchestrating session.
3. **Open a genuinely clean scratch context** (fresh worktree or directory) with NO visibility into `operations/agent-org-2026-07/`, `operations/p1-rebuild-2026-06/`, `operations/benchmarks/`, or the spec-freeze document itself — this is the S6-precedent contamination guard and is **structural, not a nice-to-have**. A repo-context agent recognizing the benchmark voided a run at S6; do not let that recur.
4. Strip all benchmark-framing language from the task brief text handed into the scratch context (leak-grep for "benchmark," "harness," "bare," "leg," "compare," "P2" before use).
5. Run leg A across all three scenarios; record the pre-registered metrics (wall-clock, token cost, findings, errors/overclaims caught) per the P1-comparison design sheet's §5 shape.
6. Close leg A's session fully before any harnessed-arm work opens — **the bare-arm and harnessed-arm sessions must not share a conversation or context.**

Reference: `operations/agent-org-2026-07/2026-07-20-P2-spec-freeze.md` (the frozen spec this close hands off).

## Blocked On

**Files remaining uncommitted:** none from this session beyond what this close's own commit will carry (the spec-freeze document, the decision-log entry, this close, and the new `runs/` directory placeholder — the founder commits per standing practice; the AI does not commit unless asked).

**Production state at session close:** unchanged from session open — no code/schema/flag/credential/deploy touched this session. `/api/health` reported `healthy` at open; `origin/main` HEAD `9a370f0` (P-GL finish) confirmed as the deployed build, carrying the self-circle narrowing (`bcf8667`) and AE-2 activation (`a506916`) the P2 rationale cites. No live op ran in this session (spec-authoring only, per its `governance` tier).

## Open Questions
- Whether the S3 general-task's actual brief (deferred to the bare-arm session per §3's "Scenario authoring note") should target a stale artifact within this AO program itself or elsewhere in the repo — left to the bare-arm session's own open, since pre-selecting it now risks the document going stale before that session runs.
- Whether the harnessed leg should be instructed to use `response_format:'assessment_first'` for consults that don't need synchronous prose (the spec-freeze's §4 wall-clock rationale assumes this will be exercised, but the actual harness-protocol instruction for the harnessed-arm session should confirm this explicitly at that session's own open).

End of close.
