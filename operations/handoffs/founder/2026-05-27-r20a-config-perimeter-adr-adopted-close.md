# Session Close (consolidated, authoritative) — 2026-05-27 — C2 Diagnostic + R20a Configuration-Perimeter ADR Adopted

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds).
**Tier:** **`code-critical`** as scoped (R20a perimeter). **Work executed this session: Standard governance + additive test scaffolding + one Elevated `/drafts/→/adopted/` ADR move.** **No production code path, schema, env, or deploy touched.** No Critical change was executed (the TEST flag flip + the Option A build are both future work).
**Date:** 2026-05-27.
**Branch:** `main` (the AI did **no** git operations).
**This close supersedes, for handoff + commit purposes, the interim C2 close** (`2026-05-27-C2-r20a-distress-perimeter-close.md`), which is retained as the C2 sub-session detail. **Use this close's commit list.**
**Predecessor close (this stream):** `/operations/handoffs/founder/2026-05-27-comb2-no-practice-disclaimer-close.md`.

## What this session did (three phases)

1. **C2 Step-1 diagnostic + harness.** By code-read, mapped the real R20a coverage of the four product entries → finding **M-7**. Built `run-c2.ts` (build-only + live; PR1 — `/api/reason` first) + a vetted non-graphic distress fixture. Sandbox-verified: build-only PASS + EXIT 0; `npx tsc --noEmit` EXIT 0. The TEST flag flip was **drafted (CCP) and deferred** per the founder's election.
2. **Configuration-level reframe (founder).** The founder reframed coverage to the **configuration level** (per L1–L7 flow), required **audience-appropriate** output (human message vs agent-developer notification), and required **no double-reporting** across chained configurations. Diagnostic confirmed the per-product view hides flow gaps (Calling-origin distress rides into Reasoning as `discovered_purpose`, which the route guard does not classify).
3. **Option A adopted + ADR Accepted + sequencing set.** The founder elected **Option A** (centralise distress detection at the substrate; per-consumer Layer-3 rendering; route non-substrate products through the single catch; a propagated flow-terminating flag), **approved the ADR** (now in `/adopted/adr/`), and **set the build order: Option A FIRST**, then C2 live (rescoped), then Session 3.

## Decisions Made (3 appended to the decision log this session)

- `D-C2-R20A-PERIMETER-DIAGNOSTIC-AND-HARNESS-2026-05-27` — the diagnostic (M-7), `run-c2.ts` + fixture, the drafted-and-deferred CCP.
- `D-R20A-CONFIG-PERIMETER-OPTION-A-2026-05-27` — Option A elected as the structural direction.
- `D-R20A-ADR-ADOPTED-SEQUENCING-2026-05-27` — ADR Accepted + moved to `/adopted/adr/`; sequence = Option A → C2 live (rescoped) → Session 3; C2-live + Session 3 scope updates recorded.

## Status Changes

| Item | Old | New |
|---|---|---|
| R20a coverage of the four entries | unstated | **Documented (M-7)** + reframed to configuration-level |
| `run-c2.ts` + `C2_DISTRESS_INPUT` | — | **Scaffolded + build-only Verified** (live deferred) |
| R20a-CFG ADR | — | **Accepted** in `/adopted/adr/` |
| Option A (config-level perimeter) | — | **Adopted direction**; implementation **Scoped** (next arc) |
| Build sequence | C2 live / Session 3 next | **Option A build → C2 live (rescoped) → Session 3** |
| `SUBSTRATE_R20A_GATE_ENABLED` (TEST + prod) | UNSET | **UNSET (unchanged)** |

## Next Session Should

**Open the Option A build arc — session 1** from the paste-ready prompt:
`/operations/handoffs/founder/2026-05-27-OPTION-A-build-session-1-NEXT-SESSION-PROMPT.md`

That session is **code-critical** but opens **read-only**: it resolves the ADR's four verification items first (they could change the catch locus or gap set — PR12), then designs the single-catch contract + propagation flag. No Critical code until the verification confirms the design. The per-endpoint wiring (Calling, then Reflect-content) follows as separate PR1 + CCP sessions.

## Carry-forward backlog (so nothing is forgotten; rescoped to suit)

| Item | When | Updated scope |
|---|---|---|
| **Option A build arc** | **NOW (next)** | Session 1 = verification + contract/flag design; then per-endpoint PR1 wiring (Calling, Reflect-content); then Layer-3 audience rendering (A6); then config-level invocation tests (AC4 across flows). Each step its own CCP. |
| **C2 live run** | After Option A | **Rescoped:** `run-c2.ts --live` now verifies the **new** configuration-level coverage (caught + correct audience form at each entry), not today's honest gaps. Optionally capture a pre-build baseline first for before/after evidence. Needs the TEST-env standup + the CCP approval (drafted in the C2 close / `D-C2-…` entry). |
| **Session 3 — value-evidence rig** | After Option A | Unchanged in nature (control-vs-treatment value demonstration); resequenced to after the Option A arc, so value is shown on a configuration-complete distress perimeter. |
| **M-7 severities + audit note** | At your convenience | Record severities for the audit trail; disposition is now "being remediated under Option A," not "accepted gap." |
| **A7 production activation** | Separate future Critical | Carried from the A7 close #1; out of scope of the Option A arc. |

## Blocked On — single complete commit list (stage by name; do NOT `git add .`; never stage `website/.env.local*` or `website/tsconfig.tsbuildinfo`)

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add \
  website/scripts/whole-system-harness/run-c2.ts \
  website/scripts/whole-system-harness/lib/scenario-input.ts \
  data-room/99_review/missing-context.md \
  adopted/adr/2026-05-27-r20a-configuration-perimeter-and-audience-contract.md \
  operations/decision-log.md \
  "operations/handoffs/founder/2026-05-27-C2-r20a-distress-perimeter-close.md" \
  "operations/handoffs/founder/2026-05-27-r20a-config-perimeter-adr-adopted-close.md" \
  "operations/handoffs/founder/2026-05-27-OPTION-A-build-session-1-NEXT-SESSION-PROMPT.md"
git commit -m "C2 R20a perimeter: diagnostic (M-7) + run-c2.ts harness (build-only verified, live deferred); configuration-level reframe → Option A adopted + ADR accepted; sequence = Option A build first, then C2 live (rescoped), then Session 3. (D-C2-R20A-PERIMETER-DIAGNOSTIC-AND-HARNESS; D-R20A-CONFIG-PERIMETER-OPTION-A; D-R20A-ADR-ADOPTED-SEQUENCING). Standard/governance + test scaffolding + drafts→adopted ADR move; no code/env/deploy."
```
Then push via GitHub Desktop. **No Vercel behaviour change** — `run-c2.ts` lives under `website/scripts/` (never bundled); everything else is governance/docs. Production `SUBSTRATE_R20A_GATE_ENABLED` stays UNSET.

> Note: the ADR was created and moved within this single uncommitted session, so git never tracked the `/drafts/adr/` path — only the `/adopted/adr/` path needs staging (no deletion to stage).
> Optional: `data-room/05_outputs/C2-build-only-*.json` + `.md` (the build-only ledger; regenerated each run; stage only if you want this run on file).

**Production state at session close:** **UNCHANGED.** `/api/reason` byte-identical; provenance gate Live; `/api/substrate/layer3` → 503; `SUBSTRATE_R20A_GATE_ENABLED` UNSET in Vercel. Local dev still on **production** (the TEST standup is a deferred founder step).

## Founder Verification (between sessions)

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsx scripts/whole-system-harness/run-c2.ts   # build-only: PASS, EXIT 0
npx tsc --noEmit                                  # EXIT 0
```
And confirm the adoption move:
```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
ls adopted/adr/2026-05-27-r20a-configuration-perimeter-and-audience-contract.md   # exists
ls drafts/adr/ 2>/dev/null                                                        # no longer holds the ADR
```
All sandbox-verified this session. Run one at a time.

## Open Questions

The four ADR verification items (the first work of the Option A arc): does Layer 2/A7 inspect `discovered_purpose`; is the `/api/reason` agent-API human-framed message intended; is a distress flag already carried end-to-end; reconcile the Sage Reflect harm-flag carrier with the A.4 propagation flag.

## Cross-references

- Decision log: `D-C2-R20A-PERIMETER-DIAGNOSTIC-AND-HARNESS-2026-05-27`; `D-R20A-CONFIG-PERIMETER-OPTION-A-2026-05-27`; `D-R20A-ADR-ADOPTED-SEQUENCING-2026-05-27`
- ADR (Accepted): `/adopted/adr/2026-05-27-r20a-configuration-perimeter-and-audience-contract.md`
- Finding: `data-room/99_review/missing-context.md` (M-7)
- Interim C2 sub-session close: `/operations/handoffs/founder/2026-05-27-C2-r20a-distress-perimeter-close.md`
- Next-session prompt: `/operations/handoffs/founder/2026-05-27-OPTION-A-build-session-1-NEXT-SESSION-PROMPT.md`
- A7 substrate gate: `/operations/handoffs/founder/2026-05-13-A7-r20a-gate-close.md`

*End of consolidated session close. Stabilised to a known-good state: M-7 documented, `run-c2.ts` built + build-only-verified, the R20a configuration-perimeter ADR Accepted, Option A adopted and sequenced first, C2-live + Session 3 carried forward with updated scope, production UNCHANGED. Next: the Option A build arc, session 1 (verification-first).*
