# Session Close — 2026-08-30 — R8-D6a: the verdict-repeatability instrument, built

**Stream:** founder.
**Governing frame:** /adopted/session-opening-protocol.md (cached via /adopted/standing-protocol-cache.md).
**Tier:** `code-standard` — Standard risk. The prompt's two escalating steps were **not taken**.
**Date:** 2026-08-30.

> **AMENDED 2026-08-30, same session.** The founder resolved every "Next Session Should" and "Open
> Questions" item except the live run, and walked the credential mint. Sections below are updated
> in place; superseded readings are marked as such.

## Decisions Made
- `D-R8-D6A-VERDICT-REPEATABILITY-INSTRUMENT-BUILT-PR19-FOLDED-2026-08-30` — the probe set and
  runner are built and independently reviewed.
- `D-R8-D6A-ELECTIONS-APPROVED-AND-PROBE-CREDENTIAL-MINTED-2026-08-30` — five elections approved,
  the class-freeze discipline enforced in code, and the probe credential minted founder-walked
  (Critical, AC7 discharged) and verified by read-back. **The credential has never been used.**

## Status Changes
| Item | Old | New |
|---|---|---|
| R8-D6a probe set | Not authored | **Frozen, 7 probes, byte- and hash-guarded** |
| R8-D6a runner | Not authored | **Built, PR19-reviewed, rewritten after 4 HIGH** |
| DQ-1 (probe membership / input class) | Open | **Answered + recorded**, with its honest limit on the artifact |
| DQ-2(a) instrument persistence | Open | **Elected: repo evidence files** |
| DQ-2(b) public readability of the rate | Open | **Elected: rides the authored disclosure into `TRUST_RECORD_ENVELOPE` as a dated, path-qualified literal — not built here** |
| DQ-3 (K, cadence) | Open | **Elected: K=10, on-demand only, all 7 probes** |
| `runs/` gitignored? | Open | **Elected: committed, not ignored** |
| Class labels | Editable | **Frozen with the text; anti-repartition enforced in code + tested** |
| Probe credential | Not minted | **Minted + read-back-verified** (`4d96307f…`, `sr_prac_62c629`, 600/200) |
| Live runs executed | 0 | **0 — unchanged** |
| Trailing-hyphen capture question | Open | **Non-issue** — founder confirmed the relayed text is complete |
| c11 record + R8 §5.2(a) cost figure | Stale `~$0.15` | **$0.142215 measured** |

## What was built
- `operations/agent-circles-2026-08/d6a/d6a-probes.json` — 5 borderline probes (c11 continuity
  text, deploy, send-at-scale, delete, force-push), 1 clean anchor, 1 floor anchor, with the
  input-class definition written out because the mentor ruling makes membership determine what the
  public rate is about.
- `operations/agent-circles-2026-08/d6a/d6a-runner.py` — `run <probe> <K>` and `summary <dir>`.
  Envelope-aware extraction (`result.*`; `signed_assessment.assessment.proximity_floors` two hops
  deep in production), full body retained per call, 6s spacing against the pre-auth IP limiter,
  `agent_id` in every payload so both the analytics and billing rows are excludable, quota-abort,
  and the disagreement rate emitted as a **named** output with the measured path named and the
  reason-path rate stated unknown.

## PR19 — run, died, re-run, folded
Three reviewers **died whole on the account credit limit** (the outage class the build prompt's own
§F records twice). Rather than take the sanctioned first-hand fallback, the review was re-run on a
different model and **completed**: 4 HIGH, 11 MEDIUM, long tail. The runner was rewritten wholesale.
The worst finding: tier-1 pauses and engine-unavailable fallbacks were being counted as transport
failures, so a probe that paused on 2 of 10 runs — genuine variance, the proceed flag flipping on
frozen text — would have published a disagreement rate of **zero**. Full list in the decision-log
entry. The module's own self-test then caught a defect the rewrite had introduced.

## Next Session Should
**SUPERSEDED — items 1–3 were resolved in-session (see the amendment note at the top).** What
remains is a single step: **execute the first live sweep** under
`operations/handoffs/founder/2026-08-30-R8-D6a-first-live-run-NEXT-SESSION-PROMPT.md`. Seven
invocations, K=10 each, ≈70 calls, ≈$1.00, 140 quota units against a 600/200 credential that has
never been used.

## Blocked On
Nothing. **But a sequencing fact, not a blocker:** the predecessor close places the
instrument-level disclosure **before** D6a, and that disclosure is still blocked on its own PR19
review with nothing yet applied to `llms.txt`. The first run may proceed regardless — the ruling
places the existence-of-variance disclosure first and the *rate* as a later update to it — but the
run's output must not be treated as feeding a disclosure that is not published.

**Files remaining uncommitted:** none of this session's — all in the commit below.
`website/src/data/environmental-context.json` was already modified at open, is not this session's,
and was left alone per the concurrency convention (14 peer sessions listed at open).

**Production state at session close:** no code in the build graph, no schema, no flag, no
migration, no public surface, and **no production call**. **One intended standing change: a new
production credential exists** — `4d96307f-2c19-4c82-a1fe-bd901c3bee4d` / `sr_prac_62c629`,
consult-only, external_consumer, null owner, 600/200, active, **never used**. AC7 was **engaged and
discharged** at the founder-walked mint; the AI performed no mint, no SQL, and no live call.
Rollback: `PATCH /api/admin/api-keys` with `{id, is_active: false}`.

## Open Questions
**All resolved in-session except one, which resolves itself on first run.**
- ~~`runs/` gitignored?~~ **Elected: committed.** Archive rather than delete if size bites.
- **Borderline membership is asserted, not established** — the one genuinely open item, and it is
  open by design. Only c11 has a measured distribution; the runner's calibration block will
  support or falsify the class definition on the first sweep. The class labels are now frozen so
  the answer cannot be back-fitted.
- ~~Trailing-hyphen capture integrity.~~ **Non-issue** — the founder confirmed the relayed mentor
  text is complete and nothing follows the hyphen. Both verbatim records' capture notes should be
  read with that in mind.

## Founder Verification
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add operations/agent-circles-2026-08/d6a/ \
        operations/agent-circles-2026-08/2026-08-30-c11-rerun-experiment-record.md \
        operations/agent-circles-2026-08/2026-08-30-standing-runner-design-R8.md \
        operations/decision-log.md \
        operations/handoffs/founder/2026-08-30-R8-D6a-instrument-built-CLOSE.md
git add operations/handoffs/founder/2026-08-30-R8-D6a-first-live-run-NEXT-SESSION-PROMPT.md
git commit -F <(printf '%s\n' "Build the R8-D6a verdict-repeatability instrument; fold 4 HIGH from an independent PR19 re-run" "" "Elections approved and the probe credential minted founder-walked; class labels frozen against post-hoc repartition." "" "Model: claude-opus-5" "Effort: high")
```
Then push via GitHub Desktop. Documents and a standalone script — Vercel will rebuild and change
nothing.

## Cross-references
- `operations/handoffs/founder/2026-08-30-R8-D6a-verdict-repeatability-instrument-BUILD-NEXT-SESSION-PROMPT.md`
- `operations/handoffs/founder/2026-08-30-verdict-variance-disclosure-wording-CLOSE.md` (predecessor)
- `operations/agent-circles-2026-08/2026-08-30-mentor-ruling-verdict-variance-disclosure-verbatim.md` (binding)
- `operations/agent-circles-2026-08/2026-08-30-mentor-ruling-verdict-variance-rate-location-verbatim.md` (binding)
- `D-R8-D6A-VERDICT-REPEATABILITY-INSTRUMENT-BUILT-PR19-FOLDED-2026-08-30`

*End of session close. The instrument exists and its binding obligations are structural rather than
asserted; nothing was minted, nothing was fired at the live gate, and every election the prompt
reserved for the founder is still open.*
