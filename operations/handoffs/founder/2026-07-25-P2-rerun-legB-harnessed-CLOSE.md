# Session Close — 2026-07-25/26 — P2 Fable-5 Rerun, Leg B (harnessed)

**Stream:** founder.
**Governing frame:** /adopted/session-opening-protocol.md (cached via /adopted/standing-protocol-cache.md).
**Tier:** `governance` — Standard risk for the documents; the two mints and two revokes are **live production credential ops, founder-performed under PR17**, with the six-element Critical exchange preceding the first mint.
**Date:** 2026-07-25 (preparation, runs) → 2026-07-26 UTC (S3 completion, collection, scoring, records).
**Model (Step 0 gate):** preparation half under **Claude Fable 5** (`claude-fable-5`, no effort override in any settings file); the founder switched the session to **`claude-opus-5`** via `/model` before collection, so collection, scoring, and all records are Opus-5 work. Performing sessions, harness-attested via `get_session`: **S1 `claude-fable-5`/high · S2 `claude-fable-5`/high · S3 `claude-opus-5`/high**.

## Decisions Made

- `D-AGENT-ORG-P2-RERUN-LEG-B-HARNESSED-2026-07-26` — leg B COMPLETE with one material validity finding recorded rather than absorbed: **S3 ran under Opus 5, not Fable 5**, so its A-vs-B comparison is confounded. Founder election (AskUserQuestion): **apply the frozen thresholds to the model-controlled subset S1+S2; report S3 descriptively.** Sealed-key verdicts **S1 CAUGHT (full, 2 bonus) · S2 FULL CATCH (3 bonus) · S3 STRONG (confounded)** — identical tiers to leg A on all three.

## What the run produced (the numbers the verdict session will apply)

| Box | Frozen threshold | S1+S2 (operative) | All three (context) |
|---|---|---|---|
| Material catches the bare leg missed | ≥ 2 | **≤ 1, non-net** | +4 on S3, non-attributable |
| Wall-clock overhead | ≤ +50% | **+558%** (822s vs 125s) | **+502%** (1921s vs 319s) |
| Harness cost | ≤ $5 | **$0.32** metered / $0.64 billed | **$1.09** / $2.24 |

**Transient 401s: 0 of 36 calls.** The overhead is the protocol's own call pattern, not auth retries. Other non-200s: HTTP 400 ×4 (the 5,000-char `input` cap), HTTP 409 ×2 (designed accreditation reuse), null extraction ×2 on S3 chunks (one recovered on retry).

## Status Changes

| Item | Old | New |
|---|---|---|
| P2 rerun arc | Leg A complete; leg B next | **Leg B COMPLETE** — verdict session next |
| Leg-B prompt (`…legB-harnessed-NEXT-SESSION-PROMPT.md`) | Operative | Spent |
| Model constancy across legs | Assumed holdable via selector-constancy | **Broken on S3** (observed, reported, harness-corroborated); S1/S2 held |
| Verdict scope | Three scenarios | **Two (S1+S2)** by founder election |
| Scratch `ops-briefs-b-20260725` | Built | Runs → collected → **destroyed** (with `credentials.txt`) |
| Throwaway credentials (consult + assent) | Minted this session | **Revoked at teardown** |
| Verdict-session prompt | — | Authored |

## Next Session Should

Run the **verdict session** per `operations/handoffs/founder/2026-07-26-P2-rerun-VERDICT-NEXT-SESSION-PROMPT.md` — a FRESH `governance` session, documents only. It applies the frozen thresholds to S1+S2 as pre-registered, compares to both prior points explicitly labelled, writes the **mandatory Limitations section**, and carries the three task-fit findings (the S2 measure-not-intervene result; the 5,000-character cap versus protocol rule 1c; the surfaced-but-not-acted-on framing gap). ~2 hours. Then P2 closes and the founder's 0h call is the live question.

## Blocked On

**Files remaining uncommitted (this session's commit set):**
- `operations/agent-org-2026-07/runs/2026-07-25-rerun/leg-b/` (FOUNDER-RUN-INSTRUCTIONS.md, outputs ×119, leg-b-metrics.md, leg-b-scoring.md)
- `operations/handoffs/founder/2026-07-26-P2-rerun-VERDICT-NEXT-SESSION-PROMPT.md`
- `operations/handoffs/founder/2026-07-25-P2-rerun-legB-harnessed-CLOSE.md`
- `operations/decision-log.md` (one entry)
- `CLAUDE.md` (arc pointer)

**Production state at session close (as of 2026-07-26, per PR18):** No production *change* — no flag, schema, code, deploy, or perimeter touch; the leg only consumed live APIs. Two throwaway credentials were minted (founder-performed, six-element Critical exchange first) and **revoked at teardown**, both bound to `sagebench:rerun-ops@v1`. The build benchmarked is `origin/main abd52e0` with the corroboration check, §4 native dikaiosyne weighting, AE-1 and AE-2 all Live; `/api/health` 200 healthy at open. **Test traffic:** 36 API calls (33 metered), one `agent_accreditation` row (seeded by S1; may stand as a genuine artifact per precedent) plus its trajectory/billing rows — **exclude from billing, trajectory, and adopter samples**; `retain_until`-swept. `website/public/images/millstone.PNG` remains untracked (the founder's brand-thread image; untouched). **S11 remains REFUSED; MEASURE throughout; weights BLOCKED; the 0h call remains the founder's.**

## Open Questions

- **The S3 safeguard trigger is undiagnosed** — the same protocol block in S1 and S2 did not trip it. Recorded so a future S3-class run expects the possibility rather than being surprised by it.
- Carried to the memo's Limitations: the `high` ↔ `reasoning_effort: 40` mapping (from leg A); the single-scorer limitation, now compounded into a **split-scorer** one (leg A scored under Fable 5, leg B under Opus 5).
- S1's permission mode may have started in "accept edits" before the founder switched it to "auto"; S2/S3 were "auto" throughout. No evidence of any effect on a deliverable — it governs approval friction, not reasoning.
- Carried, unrelated to this arc: CRED-1 (ae2-smoke revocation check) and the four AUTH post-deploy smokes.

## Founder Verification

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add \
  operations/agent-org-2026-07/runs/2026-07-25-rerun/leg-b \
  operations/handoffs/founder/2026-07-26-P2-rerun-VERDICT-NEXT-SESSION-PROMPT.md \
  operations/handoffs/founder/2026-07-25-P2-rerun-legB-harnessed-CLOSE.md \
  operations/decision-log.md \
  CLAUDE.md
git commit -F - <<'MSG'
P2 rerun leg B (harnessed) COMPLETE + the S3 model break that scoped the verdict

Leg B ran the three fresh scenarios under the full practice protocol on two
founder-minted throwaway credentials. Harness attestation caught a model-constancy
break the mandatory model: field exists to catch: S3 ran under claude-opus-5 (a
safeguard fallback the founder observed and reported at handover) against leg A's
claude-fable-5, so S3's A-vs-B comparison is confounded. S1/S2 held Fable 5 / high.
Founder elected to apply the frozen thresholds to S1+S2 only, on the surfaced fact
that the AND'd verdict is already determined there: wall-clock +558% against a +50%
ceiling, cost $0.32 metered against $5, and at most one non-net material catch
against a bar of 2. Sealed-key tiers identical to leg A on all three scenarios.
Zero transient 401s in 36 calls. Two findings recorded as findings, not caveats:
S2's mechanism discriminated correctly (violated on the false claim, met on the
correction) while changing no decision, and the 5,000-char input cap collides with
the protocol's own outbound-artifact rule. Credentials revoked, scratch destroyed.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
MSG
git status --porcelain
```
Expected: only `?? website/public/images/millstone.PNG` remains. Then push via GitHub Desktop — documents only; the deploy is a runtime no-op.

## Cross-references

- `operations/handoffs/founder/2026-07-26-P2-rerun-VERDICT-NEXT-SESSION-PROMPT.md` (next)
- `operations/agent-org-2026-07/runs/2026-07-25-rerun/leg-b/leg-b-metrics.md` + `leg-b-scoring.md` (the differential catch ledger is Part 2 of the latter)
- `D-AGENT-ORG-P2-RERUN-LEG-B-HARNESSED-2026-07-26`
- `operations/handoffs/founder/2026-07-25-P2-rerun-legA-bare-CLOSE.md` (predecessor)
- `operations/agent-org-2026-07/2026-07-20-P2-spec-freeze.md` §4 (frozen thresholds)
- Performing sessions (app records): `local_b1a134c7…` (S1) · `local_9d4762d9…` (S2) · `local_33a4ca37…` (S3, Opus 5)

*End of session close. Both arms are now run under a known model attribution — including where that attribution broke — and the verdict session has clean numbers and an honest scope to apply them to.*
