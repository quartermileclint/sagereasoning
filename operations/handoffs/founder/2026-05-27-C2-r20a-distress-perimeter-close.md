# Session Close — 2026-05-27 — C2: R20a Distress Perimeter (diagnostic + harness; live exercise deferred)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Tier:** **`code-critical`** as scoped (the R20a perimeter + a TEST env-flag activation). **Work executed this session: Standard risk** — a diagnostic, additive test scaffolding under `website/scripts/` (never bundled/deployed), and a findings-log append. **No production code path, schema, env, or deploy touched.** The Critical change (the TEST flag flip + live run) was **drafted (CCP) and deferred** per the founder's open election. Full close template per the standing cache §"Critical-risk sessions".
**Date:** 2026-05-27.
**Branch:** `main` (the AI did **no** git operations).
**Predecessor close (this stream):** `/operations/handoffs/founder/2026-05-27-comb2-no-practice-disclaimer-close.md`.
**Predecessor close (R20a gate):** `/operations/handoffs/founder/2026-05-13-A7-r20a-gate-close.md`.

> ⚠ **Superseded for handoff + commit by the consolidated session close** `2026-05-27-r20a-config-perimeter-adr-adopted-close.md`. This file is retained as the **C2 sub-session detail** only. The session continued after this was written (configuration-level reframe → Option A adopted → ADR Accepted → sequencing set). **Use the consolidated close's single commit list** — the file lists + commit block *below* in this file are partial/stale (the ADR moved to `/adopted/adr/`).

## Founder election at open

Given the Step-1 diagnostic (below), the founder elected **"build + compile-verify the C2 harness now; defer the live TEST-env exercise."** The diagnostic is C2's headline result; the live run mainly re-confirms `/api/reason`, which A7 already marked **Verified 2026-05-13**.

## What this session did

1. **Opened under the protocol** (code-critical): tier; P0 0h active; R20a classifier = **Haiku** (AC1/cache Element 6); status vocab + signals; **PR3 / PR6 / PR1 / AC2 / AC4 / PR12 / PR15** engaged. Two prompt-vs-code corrections (PR12): the harness lives at **`website/scripts/whole-system-harness/`**, and the AC5 registry is at **`website/src/lib/__tests__/r20a-invocation-guard.test.ts`**.
2. **Step-1 diagnostic — the honest R20a coverage map of the four product entries** (the "hard truth" the prompt flagged). Recorded as finding **M-7** in `data-room/99_review/missing-context.md`.
3. **Built `run-c2.ts`** (build-only + live modes; PR1 — `/api/reason` first) and **added the `C2_DISTRESS_INPUT` fixture** (vetted, non-graphic). Sandbox-verified: build-only PASS + EXIT 0; `npx tsc --noEmit` whole-project EXIT 0.
4. **Drafted the full Critical Change Protocol** for the TEST-only flag flip (not executed — deferred).

## The diagnostic (finding M-7)

| Product entry | In AC5 eight? | Route-level distress guard | A7 substrate gate (flag on) | Catches distress in free text? | Proposed severity |
|---|---|---|---|---|---|
| `/api/reason` | **yes (#6)** | **YES** (AC4-tested) | **YES** (Branch 1.7) | **YES**, synchronous (PR3) | none — full coverage |
| `/api/calling` | no | NO | NO (deterministic engine; no sandwich) | **NO** | **significant** (founder to confirm) |
| `/api/practice/reflect` | no | NO | NO (own extractor path) | **PARTIAL** — own SR-9 Zone-3 boundary, but engages only on a **developer-declared** `safety_signal.harm_flagged` / `acts_blocked[category='harm']`, not content | **significant** (founder to confirm) |
| `/api/accreditation/[agent_id]` | no | NO | NO | **N/A** — no free-text human-distress surface (credential record); "AC5 NOT engaged" in its own headers | **not-a-gap / cosmetic** |

- **Diagnostic-certain — root cause identified** for the code facts (guard/gate presence confirmed by direct read; the A7 gate appears only in `parallel-run.ts`).
- **Diagnostic-uncertain — pattern level**: the three uncovered entries are all **agent-facing** (A10-credentialed). The AC5 registry deliberately excludes agent-facing endpoints "because they process agent output, not human distress input." So their absence is *consistent with AC5's design* — but C2's literal property ("distress at any entry is caught") holds for `/api/reason` and is **not** met content-wise on the other three. **Founder acknowledgement required** before treating this as resolved-vs-gap.

## Decisions Made

- `D-C2-R20A-PERIMETER-DIAGNOSTIC-AND-HARNESS-2026-05-27` appended (full Critical form, incl. the drafted CCP). The diagnostic (M-7), the harness + fixture, and the deferred-CCP disposition.
- `D-R20A-CONFIG-PERIMETER-OPTION-A-2026-05-27` appended (lean/governance). After the founder reframed coverage to the **configuration level** (per L1–L7 flow, audience-appropriate output, no double-reporting), the founder elected **Option A — centralise distress detection at the substrate boundary** (single Layer-2 catch; per-consumer Layer-3 rendering; non-substrate products routed through the catch; a propagated flow-terminating `safety_signal` flag). Design captured in a **draft ADR** (Under review): `drafts/adr/2026-05-27-r20a-configuration-perimeter-and-audience-contract.md`. Implementation is **future Critical work** (AC5 + PR6 + PR1 per endpoint); does **not** block Session 3.

## Status Changes

| Item | Old | New |
|---|---|---|
| C2 (test-brief §C, scenario-matrix C2) | Designed; Critical-tier; not built | **Diagnostic complete + harness Scaffolded/build-only-Verified**; live run deferred |
| `run-c2.ts` + `C2_DISTRESS_INPUT` | — | **Scaffolded + build-only Verified** (tsc EXIT 0; build-only PASS) |
| R20a coverage of the four entries | unstated | **Documented honestly (M-7)** with proposed severities |
| `SUBSTRATE_R20A_GATE_ENABLED` (TEST) | UNSET | **UNSET — CCP drafted, flip deferred** |
| `SUBSTRATE_R20A_GATE_ENABLED` (production/Vercel) | UNSET | **UNSET (unchanged)** |

## Next Session Should

Two paths, founder's call:

- **Finish C2 live (Critical).** Stand up the TEST env per `data-room/04_test_brief/test-env-standup-checklist.md` with `SUBSTRATE_R20A_GATE_ENABLED='true'`, confirm `/api/public-key` → `key_id: substrate-layer2-test`, give the CCP approval (decision-log entry §CCP), then run `run-c2.ts --live`. This stamps the `/api/reason` perimeter **Verified-in-integration** and confirms the honest behaviour of the other three.
- **Proceed to Session 3 — the value-evidence rig (control-vs-treatment)** per the v2 sequence, and treat the C2 live run as optional (the diagnostic already delivered C2's safety-coverage result). Set the M-7 severities at that session's open.

Either way: **set the M-7 severities** and make the **resolved-vs-gap call** on the agent-facing entries.

**Also pending (Option A):** review the draft ADR `drafts/adr/2026-05-27-r20a-configuration-perimeter-and-audience-contract.md` and, if it matches intent, approve moving it to `/adopted/adr/`. The Option A *direction* is Adopted (`D-R20A-CONFIG-PERIMETER-OPTION-A-2026-05-27`); the ADR *document* is Under review until you approve it. The implementation is future Critical work (per-endpoint PR1), separate from Session 3.

## Blocked On

**Files remaining uncommitted (stage by name — do NOT `git add .`; never stage `website/.env.local*` or `website/tsconfig.tsbuildinfo`):**
- `website/scripts/whole-system-harness/run-c2.ts`
- `website/scripts/whole-system-harness/lib/scenario-input.ts`
- `data-room/99_review/missing-context.md`
- `drafts/adr/2026-05-27-r20a-configuration-perimeter-and-audience-contract.md` (NEW — the Option A ADR, Under review)
- `operations/decision-log.md` (TWO appends this session: the C2 entry + the Option A entry)
- `operations/handoffs/founder/2026-05-27-C2-r20a-distress-perimeter-close.md`
- (optional) `data-room/05_outputs/C2-build-only-*.json` + `.md` — regenerated each run; stage only if you want this run on file.

**Production state at session close:** **UNCHANGED.** No code path, schema, env, or deploy touched. `/api/reason` byte-identical; provenance gate Live; `/api/substrate/layer3` → 503; `SUBSTRATE_R20A_GATE_ENABLED` UNSET in Vercel. Local dev is still on **production** (`.env.local` unchanged — the TEST standup is the deferred founder step).

## Open Questions

- **M-7 severities + resolved-vs-gap call** (founder) — `/api/calling` (proposed significant), `/api/practice/reflect` (proposed significant), `/api/accreditation` (not-a-gap). And: should the agent-facing entries *ever* get content-based R20a coverage? That would be a separate **Critical** perimeter change (AC5 + PR6 + PR1).
- **Sage Reflect harm-flag carrier contract** — `zone3-boundary.ts` flags `safety_signal` as a Diagnostic-uncertain (symptom-level) interpretation pending a canonical contract. Revisit: a Sage Reflect spec session.
- **A7 production activation** (carried from the A7 close #1) — unchanged; out of C2's scope; a separate future Critical change.

## Verification Method Used (per 0c framework)

| Work type | Verification method |
|---|---|
| Coverage diagnostic (code-read) | AI direct read of the four route files + the AC5 registry + `r20a-gate.ts` + `zone3-boundary.ts` + `route.ts` Branch 1.7; grep of `detectDistressTwoStage`/`enforceDistressCheck` call sites. Founder re-runs the greps below. |
| New test scaffolding (`run-c2.ts`) + fixture | AI in-session `npx tsx` build-only run (PASS, EXIT 0) + `npx tsc --noEmit` whole-project (EXIT 0). Founder re-runs both between sessions. |
| Findings-log + decision-log + close (governance) | Founder reads directly. |
| Live perimeter behaviour | **Deferred** — founder-performed against the standing TEST env (sandbox cannot reach localhost). The `--live` run is the between-session step if the founder elects to finish C2 live. |

## Risk Classification Record (0d-ii)

| Change | Classification | Reason |
|---|---|---|
| `run-c2.ts` (NEW test scaffolding) | **Standard** | Test code under `website/scripts/`; never bundled/deployed; *calls* endpoints, does not modify the classifier or any wrapper — PR6 not engaged by the scaffolding. |
| `C2_DISTRESS_INPUT` in `scenario-input.ts` | **Standard** | Additive fixture (vetted, reused from the eval suite); no logic change. |
| M-7 append to `missing-context.md` | **Standard** | Data-room findings log; append-only. |
| Decision-log entry + close | **Standard** | Governance documentation. |
| **Deferred TEST flag flip** (`SUBSTRATE_R20A_GATE_ENABLED='true'` in TEST) | **Critical** | Env-flag activation + R20a perimeter. **Drafted CCP, not executed.** Engages only on the founder's live exercise. |

No Critical change was executed this session. Production `SUBSTRATE_R20A_GATE_ENABLED` remains UNSET in Vercel.

## PR5 Knowledge-Gap Carry-Forward

- **KG2 (Haiku reliability boundary)** — applied: R20a classifier = Haiku (AC1/cache Element 6), confirmed at open; no new model introduced.
- **No concept required re-explanation this session.** No new candidate logged. The two A5/A7 watch-status candidates (two-entry-point substrate; defensive-read-of-future-fields) did not recur (no substrate code written).

## Founder Verification (Between Sessions)

Run one at a time (not as a pasted block). All are sandbox-verified this session.

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"

# 1. Build-only harness run (no env, no network): expect 0 assertions, PASS, EXIT 0; writes a C2 ledger.
npx tsx scripts/whole-system-harness/run-c2.ts

# 2. Whole-project typecheck: expect EXIT 0.
npx tsc --noEmit
```

Confirm the diagnostic for yourself (the coverage map is the result that matters):

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"

# Only /api/reason should appear among the four product entries (the AC5 guard):
grep -l "detectDistressTwoStage" \
  src/app/api/reason/route.ts src/app/api/calling/route.ts \
  src/app/api/practice/reflect/route.ts "src/app/api/accreditation/[agent_id]/route.ts"
# Expected: only src/app/api/reason/route.ts is listed.
```

Optional — finish C2 live (only after the TEST-env standup; this is the deferred Critical step with CCP approval):

```bash
# After standing up the TEST env with SUBSTRATE_R20A_GATE_ENABLED='true', confirm the boundary FIRST:
#   GET http://localhost:3000/api/public-key  → key_id: substrate-layer2-test   (production key ⇒ STOP)
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsx --env-file=.env.local scripts/whole-system-harness/run-c2.ts --live
```

**Commit (host-side, stage by name):**

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add \
  website/scripts/whole-system-harness/run-c2.ts \
  website/scripts/whole-system-harness/lib/scenario-input.ts \
  data-room/99_review/missing-context.md \
  drafts/adr/2026-05-27-r20a-configuration-perimeter-and-audience-contract.md \
  operations/decision-log.md \
  "operations/handoffs/founder/2026-05-27-C2-r20a-distress-perimeter-close.md"
git commit -m "C2 diagnostic + run-c2.ts harness (build-only verified); R20a coverage map = M-7; CCP drafted, TEST flip deferred (D-C2-R20A-PERIMETER-DIAGNOSTIC-AND-HARNESS). Plus configuration-level R20a reframe: Option A adopted, draft ADR (D-R20A-CONFIG-PERIMETER-OPTION-A). Standard/governance + test scaffolding; no code/env/deploy."
```

Then push via GitHub Desktop. **No Vercel behaviour change** — `run-c2.ts` lives under `website/scripts/` (never bundled), and nothing else touches a deployed path. Production `SUBSTRATE_R20A_GATE_ENABLED` stays UNSET.

## Orchestration Reminder

Critical-tier session → full close template (Verification Method Used; Risk Classification Record; PR5 Knowledge-Gap Carry-Forward; Founder Verification; Orchestration Reminder — all present). Per **AC12** no verifier sub-agent was spawned; verification is in-session (build-only run + `tsc`) plus the founder's between-session re-runs. Per **PR12** the prompt's "submit distress at each product entry" framing was checked against actual code at open and found to need the diagnostic recalibration captured in M-7 (only `/api/reason` is in-perimeter among the four); surfaced honestly before any assertion was written. Per **PR1** the harness proves `/api/reason` first. Per **PR3** the assertion design treats the redirect as synchronous (in the response body). The **Critical change (TEST flag flip) was deferred, not executed** — its CCP is drafted in the decision-log entry and engages only on the founder's live exercise with explicit approval.

## Cross-references

- `/operations/decision-log.md` — `D-C2-R20A-PERIMETER-DIAGNOSTIC-AND-HARNESS-2026-05-27`
- `data-room/99_review/missing-context.md` — finding **M-7** (the coverage map)
- `data-room/04_test_brief/test-brief.md` (§C2) + `data-room/04_test_brief/test-env-standup-checklist.md` + `data-room/04_test_brief/test-flag-config.md`
- `/operations/handoffs/founder/2026-05-27-comb2-no-practice-disclaimer-close.md` (predecessor close, this stream)
- `/operations/handoffs/founder/2026-05-13-A7-r20a-gate-close.md` (the A7 substrate gate — Verified on `/api/reason`)
- `/operations/handoffs/founder/2026-05-26-sage-practice-sequence-v2-NEXT-SESSION-PROMPT.md` (the v2 sequence; Session 3 = value-evidence rig next)
- Code surfaces read: `website/src/app/api/{reason,calling,practice/reflect,accreditation/[agent_id]}/route.ts`; `website/src/lib/__tests__/r20a-invocation-guard.test.ts`; `website/src/lib/substrate/r20a-gate.ts`; `website/src/lib/sage-reflect/zone3-boundary.ts`
- New/modified artefacts: `website/scripts/whole-system-harness/run-c2.ts` (NEW); `website/scripts/whole-system-harness/lib/scenario-input.ts` (MODIFIED — `C2_DISTRESS_INPUT`)

*End of C2 session close. Stabilised to a known-good state: the R20a coverage of the four product entries is documented honestly (M-7), `run-c2.ts` is built and build-only-verified (tsc EXIT 0), the TEST flag flip is drafted (CCP) and deferred, and production is UNCHANGED. The diagnostic — only `/api/reason` has content-based distress coverage among the four entries — is C2's headline result and awaits the founder's severity + resolved-vs-gap call.*
