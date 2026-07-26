# Session Close — 2026-07-26 — P2 Fable-5 Rerun, the Verdict Session

**Stream:** founder.
**Governing frame:** /adopted/session-opening-protocol.md (cached via /adopted/standing-protocol-cache.md).
**Tier:** `governance` — Standard risk. Documents only: no mint, flag, schema, deploy, credential, or live op. AC7 not engaged.
**Date:** 2026-07-26.
**Model (Step 0 gate):** `claude-opus-5`. Reasoning effort is **not attestable from inside the session** (`get_session` refuses the current session), so it is stated as unverified rather than asserted — recorded in the memo's Limitations §6.4 alongside leg A's Fable-5 scoring and leg B's Opus-5 scoring.

## Decisions Made

- `D-AGENT-ORG-P2-RERUN-VERDICT-2026-07-26` — **P2 closes with "No benefit shown"** under the frozen thresholds, applied as pre-registered to the model-controlled subset S1+S2. Box 1 **≤1 and non-net** (bar 2) · Box 2 **FAIL +558%** (ceiling +50%) · Box 3 **PASS $0.32 metered / $0.64 billed** (ceiling $5). AND'd, the conjunction fails. **The first cleanly model-controlled repeat since 2026-06-11 — and the result did not move** despite a build that has since gained native dikaiosyne weighting, the corroboration check, the full trust-layer arc, and AE-1/AE-2.

## What the session did beyond arithmetic

- **Re-verified the load-bearing ledger call first-hand** rather than accepting it from the scoring file: leg B added a go/no-go gate and a rollback trigger; leg A independently produced a 30-day schedule-notice policy, a hardship review channel, and renewal-last site sequencing. Confirmed against both outputs. **The harnessed deliverable is different, not net-better, on precisely the dimension the harness flagged.**
- **Recorded Box 1 under both readings.** Strictly ≤1. Under the 2026-06-11 founder adjudication that *contract-exercising* catches count, arguably 2 (the 5,000-character cap collision). Applying that precedent only where it hurt would not have been honest — and it changes nothing, because Box 2 decides the verdict either way, exactly as +333% did in 2026-06-11 when Box 1 passed.
- **Showed the wall-clock result is robust to the S3 confound** rather than asserting it: +558% excluded, +502% as run, +218% had leg B's S3 matched leg A's exactly, +158% even at zero S3 time. The permitted ceiling on S1+S2 was 187.5s; the leg consumed 822s.
- **Wrote the ten-item Limitations section** the 2026-07-21 memo lacked — the S3 break and its undiagnosed safeguard trigger, the unresolved `high` ↔ `reasoning_effort: 40` mapping, n=2 with both scenarios single-decision-point, the split-scorer condition, the S1 criterion-2 call contestable in *both* legs, the anti-signalling cost of the uniform outbound-artifact rule, the non-blind harnessed arm, synthetic-artifact realism from the sealed author notes, S1's non-identical permission mode, and the absence of any downstream verifier.
- **Carried the three task-fit findings as findings, not consolation** (memo §5).

## Status Changes

| Item | Old | New |
|---|---|---|
| **P2 (bare-vs-harnessed value benchmark)** | OPEN — rerun in progress | **CLOSED — "No benefit shown", model-controlled** |
| Verdict-session prompt (`…2026-07-26-P2-rerun-VERDICT-NEXT-SESSION-PROMPT.md`) | Operative | **Spent** |
| `runs/verdict-memo-2026-07-21.md` + its close + `D-AGENT-ORG-P2-LEG-B-HARNESSED-RUN-2026-07-21` | Erratum'd, standing alone | **Pointed forward** — "informed but did not settle" |
| The 0h main blocker (value demonstration) | Awaiting a model-controlled result | **Evidence in hand; the call is the founder's** |
| 5,000-char `input` cap vs protocol rule 1c | Observed in leg B | **Named engineering follow-up** (unscoped) |

## Next Session Should

**The founder's call comes first — nothing is queued behind this by default.** One **branch-neutral** prompt is authored and can run before or independently of that call: `operations/handoffs/founder/2026-07-26-reason-input-cap-vs-artifact-rule-NEXT-SESSION-PROMPT.md` (`code-elevated`) — the 5,000-character `input` cap versus protocol rule 1c, grounded first-hand at `website/src/app/api/reason/route.ts:947` and `website/src/lib/security.ts:208–217`, and carrying one hypothesis worth resolving in either direction: whether a truncated or chunked submission leaves the corroboration check examining a fragment, which would connect this to the recorded A2 structural residual rather than to ergonomics.

Memo §7 sets out three branches: (1) accept the verdict, close P2, reposition the agent-facing claim onto measurement plus the durable record, and queue the cap fix — after which 0h turns on the remaining go-live items and P6/P7/P8 become the live program work; (2) hold for **one** bounded successor test, best-value-first being a **downstream-verifier** test (the only condition under which the accreditation record's value can be exercised at all), then a **reduced-density** protocol test (the 2026-06-11 §6 finding, never directly tested), then a model-controlled S3 re-run (which by the memo's own arithmetic cannot change the verdict); (3) treat the result as bearing on the benchmark's observable rather than only on the harness. Any successor needs its own threshold sign-off — this memo recommends nothing about thresholds.

## Blocked On

**Files remaining uncommitted (this session's commit set):**
- `operations/agent-org-2026-07/runs/2026-07-25-rerun/verdict-memo.md` (new)
- `operations/agent-org-2026-07/runs/verdict-memo-2026-07-21.md` (forward pointer)
- `operations/handoffs/founder/2026-07-21-P2-harnessed-arm-CLOSE.md` (forward pointer)
- `operations/handoffs/founder/2026-07-26-P2-rerun-VERDICT-CLOSE.md` (this file)
- `operations/handoffs/founder/2026-07-26-reason-input-cap-vs-artifact-rule-NEXT-SESSION-PROMPT.md` (new; branch-neutral successor)
- `operations/decision-log.md` (this entry + the forward pointer on the 07-21 entry)
- `CLAUDE.md` (arc pointer — P2 closed)

**Production state at session close (as of 2026-07-26, per PR18):** **No production change and no production traffic** — documents only; no mint, flag, schema, deploy, or API call. Both throwaway credentials bound to `sagebench:rerun-ops@v1` were revoked at the leg-B teardown and both scratch contexts are destroyed. The benchmarked build is `origin/main abd52e0`, unchanged by this session. Leg B's test traffic stands as recorded — 36 API calls (33 metered), one `agent_accreditation` row and its trajectory/billing rows, **excluded from billing, trajectory, and adopter samples**, `retain_until`-swept. `website/public/images/millstone.PNG` remains untracked (the founder's brand-thread image; untouched). **S11 remains REFUSED; MEASURE throughout; weights BLOCKED; the 0h call remains the founder's.**

**Session honesty note:** the founder-loop practice harness ran intermittently framed during this session — several at-action examinations returned honest 28s timeouts (the disclosed S11b latency class) and proceeded unframed, while others returned live frames and closed a correction loop. Recorded rather than smoothed, in a session whose whole subject is what that instrument does and does not demonstrate.

## Open Questions

- **The 0h call** — now the live question, with a model-controlled result rather than an erratum'd one. The founder's alone, gated on the full go-live checklist, not this memo.
- **The 5,000-character `input` cap versus protocol rule 1c** — a real engineering finding, no session authored. Two candidate shapes named in memo §5.2.
- **The S3 safeguard trigger is undiagnosed** (carried from the leg-B close) — the same protocol block in S1 and S2 did not trip it.
- **The `high` ↔ `reasoning_effort: 40` mapping** remains unverified across the whole arc.
- Carried, unrelated: CRED-1 (ae2-smoke revocation check) and the four AUTH post-deploy smokes.

## Founder Verification

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add \
  operations/agent-org-2026-07/runs/2026-07-25-rerun/verdict-memo.md \
  operations/agent-org-2026-07/runs/verdict-memo-2026-07-21.md \
  operations/handoffs/founder/2026-07-21-P2-harnessed-arm-CLOSE.md \
  operations/handoffs/founder/2026-07-26-P2-rerun-VERDICT-CLOSE.md \
  operations/handoffs/founder/2026-07-26-reason-input-cap-vs-artifact-rule-NEXT-SESSION-PROMPT.md \
  operations/decision-log.md \
  CLAUDE.md
git commit -F - <<'MSG'
P2 CLOSES: no benefit shown, under genuine model control for the first time since 2026-06-11

Applied the frozen 2026-07-20 thresholds as pre-registered to the model-controlled
subset S1+S2: Box 1 at most 1 material catch the bare leg missed and that one is
non-net (bar 2); Box 2 FAIL at +558% wall-clock, 822s against 125s (ceiling +50%);
Box 3 PASS at $0.32 metered / $0.64 billed (ceiling $5). AND'd, the conjunction
fails. Wall-clock decides it under every treatment of the S3 model break (+502% as
run, +218% had leg B's S3 matched leg A's, +158% even at zero S3 time), and Box 1
is recorded under both readings — including the generous 2026-06-11 adjudication
that contract-exercising catches count — because both land in the same place.
Re-verified the load-bearing non-net finding first-hand against both outputs.
Three findings carried as findings: S2's corroboration mechanism discriminated
correctly while changing no decision (measurement fidelity, not decision-change);
the 5,000-char input cap collides with the protocol's own outbound-artifact rule;
and the instrument surfaced a framing gap twice that the agent did not close.
Ten-item Limitations section, which the erratum'd 07-21 memo lacked. Those 07-21
records are pointed forward in place. The 0h call is now the founder's, with three
branches set out and no threshold recommendation for any successor test.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
MSG
git status --porcelain
```
Expected: only `?? website/public/images/millstone.PNG` remains. Then push via GitHub Desktop — documents only; the deploy is a runtime no-op.

## Cross-references

- `operations/agent-org-2026-07/runs/2026-07-25-rerun/verdict-memo.md` (the deliverable)
- `operations/agent-org-2026-07/2026-07-20-P2-spec-freeze.md` §4 (the frozen thresholds)
- `operations/handoffs/founder/2026-07-25-P2-rerun-legA-bare-CLOSE.md` · `…-legB-harnessed-CLOSE.md`
- `operations/p1-rebuild-2026-06/verdict-memo.md` (2026-06-11 predecessor — §6 task-fit template, §8 branch template)
- `operations/agent-org-2026-07/runs/verdict-memo-2026-07-21.md` (erratum'd; pointed forward)
- `D-AGENT-ORG-P2-RERUN-VERDICT-2026-07-26` · `D-AGENT-ORG-P2-RERUN-LEG-B-HARNESSED-2026-07-26` · `D-P1-COMPARISON-VERDICT-NO-BENEFIT-2026-06-11`
- `adopted/adr/2026-06-24-sage-practice-measurement-instrument-reframe.md` (ADR-012 — the reframe the S2 finding bears on)

*End of session close. P2 is settled on a controlled basis; what survives the verdict is a working measurement mechanism, a fixable protocol defect, and a live question about whether decision-change was ever the right observable.*
