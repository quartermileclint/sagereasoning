# Session Close — 2026-09-12 — Observability O-2: an honest response for a provider account block, and the /api/guardrail logging gap

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Tier:** `code-critical` for the four `GUARD_RE` paths, `code-elevated` for the rest. **AC7 engaged
and discharged** by a founder waiver granted on the scoping finding (below). PR6, PR17, PR19, PR25.
No auth, schema, perimeter logic, env flag, credential or migration touched. Nothing deployed
in-session.
**Date:** 2026-09-12 (machine `date`, evening AEST).
**Opened under:** `operations/handoffs/founder/2026-09-12-O1-followon-account-block-response-and-guardrail-logging-NEXT-SESSION-PROMPT.md`.
**Predecessor:** `operations/handoffs/founder/2026-09-12-O1-llm-outage-classifier-account-block-CLOSE.md`.
**State at open, re-derived not quoted:** `HEAD` = `origin/main` = `3b0bf47`, ahead 0. Observation
window RUNNING (`GATE1_FALSE_HOLD_CAPTURE=true`), buffer **623** lines. Byte-identity guard **ARMED
250/0**. Both test-asserted SHA pins unchanged (`stoic-brain` `fa8895ec…`,
`translation-sandwich/layer2-mechanisms` `60cefedb…`); the third carried hash
(`intervention-engine` `db86fccb…`) also unchanged — worth noting precisely: **only two of the
"three SHA pins" are asserted by a test; the third is a hash carried forward in records.** The S9
`*-stdin.json` residual files are **absent** — the founder's owed `rm` appears discharged.

## Decisions Made
- `D-PROVIDER-ACCOUNT-BLOCK-RESPONSE-AND-GUARDRAIL-LOGGING-2026-09-12` appended. Both O-1 residuals
  closed: the account-block HTTP response (503 / `ai_unavailable_provider_account` / `retriable:false`
  / `regain_at` / conditional capped `Retry-After`) across 11 routes + discernment, and
  `/api/guardrail` writing a `route_errors` row on all three failure paths.

## The scoping finding that changed the plan, and the waiver
`runGuardrailSandwich` returned only `detail: err.message` — a **string**. O-1's classifier needs the
error OBJECT's provenance, so a reconstructed `new Error(detail)` classifies as `none`: a provider
block on `/api/guardrail` was **structurally invisible**, not merely unhandled. Closing it required a
THIRD guarded file (`lib/guardrail-sandwich.ts`) the prompt had named read-only. Put to the founder
before any guarded file was touched; **waiver granted for all three**, and the ARMED guard then named
a **fourth** matching path (`api/reason/__tests__/r20a-invocation.test.ts`). Two further corrections
of carried prose: `/api/reason`'s live block path is **Branch 2** (the R3 masked-200 fallback, which
does carry `error_cause`), not the outer catch the prompt targeted; and `/api/reason` never emitted
`assessment_status: engine_unavailable` — that field is `/api/guardrail`'s alone.

## Built
| File | Change |
|---|---|
| `lib/llm-outage.ts` | `providerAccountBlockResponse` / `providerAccountBlockPayload` / `retryAfterSecondsFor` / the code, cap and per-audience messages. Audience is a **required** argument. `isLlmOutage` and `llmOutageResponse` untouched. |
| 10 free routes (`score`, `score-decision`, `score-social`, `score-conversation`, `score-scenario` ×2, `score-iterate`, `evaluate`, `reflect`, `mentor/passion-classify`, `mentor/private/reflect`) | block branch **before** the outage branch; logged `statusCode` widened to follow the served one. |
| `api/practice/discernment/handler.ts` | both catch blocks, with `corsHeaders()` passed explicitly (its `json()` adds them, the shared helper does not). GET's branch is unreachable today and labelled as such. |
| `api/guardrail/route.ts` **(waived)** | `logRouteError` on all three failure paths — signing 503, `engine_unavailable`, outer catch. Response keeps its fail-closed 200; the block is named via a third value on the existing `engine_error`. |
| `lib/guardrail-sandwich.ts` **(waived)** | `error_cause: unknown` on the `engine_unavailable` outcome + both return sites. |
| `api/reason/route.ts` **(waived)** | Branch 2's block sub-case leaves the masking for a real 503 through `respond()`, `isBillable:false`; outer catch gets the block branch. |
| `private-mentor` / `score-social` / `scenarios` pages | prefer the route's sentence over its machine code. |
| batteries | `llm-outage` 83 → **140**; `reason/r20a-invocation` 19 → **21**; `discernment-observability-wiring` 15 → **16**. |

## The two opposite masking decisions
`/api/reason` leaves the R3 masking for this class (not ambiguous; a masked 200 invites endless
retry; not a gate, so 5xx cannot become fail-open). `/api/guardrail` keeps its 200. **The first draft
of the second rationale was wrong and PR19 refuted it** — that route already returns 503 for
`signing_unavailable`, blessed by ADR-009 §5, so "5xx is unsafe here" is refuted by our own code. The
surviving reasons, both read in the harness source: no caller behaviour improves (the reference
client hard-blocks only on `do_not_proceed`), and **the observation window is running** — a 503
re-routes that client to `guardOutage`, changing `guardHold`/`guardOutcome` mid-window and, under
`strict` fail-mode, turning currently-ALLOWED actions into denials. Stated precisely: it would **not**
move records between capture-basis classes (both are `no_assessment`) — checked in
`buildGuardHoldRecord`, not assumed. **Consistency at 503 is a live founder election for after the
window closes.**

## PR19 — four independent Sonnet/low reviewers, read-only
| Dimension | Result |
|---|---|
| Response correctness | CLEAN. 14 sites reachable, no headers lost, `respond()`/`isBillable` correct, `loopId` in scope, helper cannot throw. 1 NIT folded: `isProviderAccountBlock`'s docstring still said "no route calls it yet". |
| Blast radius | CLEAN, no HIGH/MEDIUM. 2 folded: two pages rendered `data.error` verbatim (a practitioner would have seen the raw code); the Layer-3 billing carve-out now recorded, not absorbed. Confirmed no `route_errors` aggregator groups by `status_code`, and the harness already treated a masked 200 as `ok:false`. |
| Masking policy | `/api/reason` SURVIVES; `/api/guardrail` SURVIVES but NEEDS DISCLOSURE → rationale rewritten. |
| Battery non-vacuity | **The most valuable dimension. A SYSTEMIC weakness + one real defect, both folded.** See below. |

**PR19's battery finding, in full, because it reverses something this session had already claimed.**
Every WIRE pin matched RAW file text, so a comment reproducing the expected literal satisfies it while
the live statement is deleted. The reviewer defeated **6 of ~14** pins that way — **including WIRE-12
and WIRE-13, the two I had hardened earlier in this same session after mutation M9 survived.**
Anchoring harder was the wrong repair and is abandoned: every WIRE read now passes through a
string-aware `stripComments` (string-aware on purpose — these files carry `https://` URLs a naive
stripper would eat, which could turn a pin silently green; pinned STRIP-1..3). Separately, **WIRE-4
was a real hole needing no comment at all**: its negative check excluded only the literals
`(error, 'agent'` / `(err, 'agent'`, so renaming a catch variable and swapping the audience passed —
demonstrated on `score-scenario`'s scoring catch serving the **agent** register (operator vocabulary,
`regain_at`) to a route the table declares human. That is the AC5 audience-leak class, at a site the
battery was meant to guard. Now matched by call shape over any variable name, wrong-audience count
required zero. WIRE-17 strengthened to require the `respond({` call itself. Two same-class residuals
the reviewer flagged but did not test (WIRE-8, WIRE-20/21) are covered by the stripping repair — stated
as coverage-by-construction, not as separately demonstrated. Recorded clean by that reviewer: **WIRE-6**
(it caught a planted twelfth caller) and the whole RTY/PAY/MSG/BLK group, which call the exported
functions directly rather than parsing text.

## Two pre-existing pins broke — and were strengthened, not loosened
`discernment` §1-2 matched a single-line import literal a multi-line import defeats → matched
formatting-independently, still requiring specifier + module, plus §1-2b. `reason` R3-1 asserted
Branch 2 logs once; it now logs twice → R3-1 asserts both and that the masked path still reports 200,
with new **R3-1b** (block guard, its 503, a distinguishable log context) and **R3-1c** (the block
branch precedes the masked return).

## Mutation record — 37 mutations across three batteries, every restore SHA-verified, 0 survivors at close
Run in **git worktrees**, never the shared checkout — closing O-1's disclosed residual #5. **Two
survived along the way.** (i) M9: WIRE-12 matched the `logRouteError` CONTEXT line, not the response
body, so the guardrail could stop naming the block with the pin green. (ii) The whole decoy-comment
class, found by PR19 *after* that repair. Post-fix the review's own attacks were replayed and all fail
red: P1 (classification deleted, literal in a block comment) → WIRE-13; P2 (`error_cause` deleted,
literal in a line comment) → WIRE-14; P3 (logged status flattened, ternary in a comment) → WIRE-5;
P4 (signing log call deleted, decoy keeps the count) → WIRE-10; the WIRE-4 probe (rename + wrong
audience + decoy comment) → WIRE-4. **Control P5** — a renamed catch variable with the CORRECT
audience — correctly stays green, so the repair rejects the leak without rejecting a legitimate rename.

**One at-action guard DENY is on the record and is not a footnote.** While composing a later mutation
batch the live Gate-2 guardrail returned `do_not_proceed` (reflexive, floored by dikaiosyne and
andreia) and blocked the call. It was **not retried**; the action was re-examined and replaced with a
narrower one — a single-line edit to one file in the disposable worktree, backed up first and restored
with the hash re-verified (`75b41a01…` before and after). The evidence obtained is the same.

## Verified
`tsc --noEmit` **0**. `npm run build` **✓ Compiled successfully**, all three routes registered (run
because `route.ts` files were touched — the O-1 exemption did not apply). Batteries: `llm-outage`
**140/0** · `guardrail-sandwich` **91/91** · `guardrail/model-honesty` **23/23** ·
`discernment-observability-wiring` **16/0** · `reason/r20a-invocation` **21/21** ·
`score/r20a-invocation` **12/12** · `reflect/r20a-invocation` **17/17** ·
`score-conversation/r20a-invocation` **75/75** · `r20a-audience-rendering` **66/66** ·
`observability-retention-sweep` route **52/0**. Byte-identity guard **ARMED**: RED pre-commit naming
exactly the four waived paths (that red is the waiver's own evidence — the guard binds on uncommitted
lines), **green on the clean tree after commit**. SHA pins unchanged throughout.

## R18 — deliberately not published
`ai_temporarily_unavailable` is documented on NONE of `llms.txt` / `agent-card.json` / `api-docs`
(grep-confirmed). Publishing the rarer new code while its commoner sibling stays undocumented would
mislead by omission. The right unit is one error-responses entry covering both codes plus
`/api/guardrail`'s widened `engine_error` enum, under founder-signed wording. Scoped, not started.

## Disclosed residuals
1. The human tool routes' outage/500 branches emit no CORS headers — pre-existing, neither created
   nor worsened here, named.
2. `classifyLlmError` runs twice per blocked request (guard, then payload) — pure and cheap, accepted.
3. `/api/guardrail`-at-503 consistency: open, gated on the window.
4. **`S11-FLIP-PREREQUISITES-REGISTER.md`** (the paragraph beginning *"Also recorded this session,
   bearing on the window"*) **still carries the withdrawn "seven-day Layer-1 outage" premise**,
   uncorrected by `D-SPEND-LIMIT-OUTAGE-DURATION-CORRECTED-2026-09-12`. **Flagged, not edited** — a
   governing register needs its own founder/mentor step. **The S11 pre-flip report itself is clean on
   this point** (assembled before the block was diagnosed; it never carried the premise) — so the
   prompt's Part A question is answered in the negative, for the report.
5. Only two of the "three SHA pins" are test-asserted; the third is a carried hash. Worth not
   restating as three assertions.

## Next Session Should
Either the R18 error-responses contract entry (needs founder-signed wording), or the register
correction in (4), or the standing queue. The Layer-1 JSON-truncation defect
(`max_tokens: 4000`, 64 rows/week) remains its own waiver session.

## The commit route — and a governance property it exposed
The pre-commit hook blocked the AI's commit on the byte-identity guard, naming exactly the four
waived paths, and its own text reads *"Do NOT bypass with `--no-verify`."* It provides no mechanism
to accept a waiver. Rather than take that deviation unasked, it was put to the founder, who elected
to **commit from GitHub Desktop** — where, per the hook's own disclosed LIMIT,
`GATE1_FALSE_HOLD_CAPTURE` is absent (it comes from `.claude/settings.local.json`), the working-tree
guard is dormant by the M1 ruling, and only the unconditional C2/C2b/C2c pins run. Those pass. The
documented path, not a loophole; the waiver is what makes it legitimate. **The AI performed no
bypass, no commit and no push.**

**Worth your attention, because it is the class this project keeps re-finding:** the working-tree
byte-identity guard has therefore **never bound on any commit made from GitHub Desktop** — waiver or
not. The hook states this limit plainly in its own header. It is restated here because a waiver
process whose gate is dormant on the founder's normal commit path is a governance fact, not plumbing.
Not proposed for change here; named for you.

## Blocked On
**Files are STAGED and awaiting your commit from GitHub Desktop** (`git status --short` shows 21
`website/` files staged, plus `operations/decision-log.md` and this close). Suggested message is in
the session transcript; the waiver binds whatever hash results, and that hash should be named at the
next session's open rather than guessed now. **`website/src/data/
environmental-context.json` is NOT mine** — it was already modified at session open, as were the
`operations/` files from other sessions and the peer-created `option-s` artifacts.
**Production state at session close:** unchanged. On the founder's push, every account-block response
changes as described and `/api/guardrail` begins writing error rows; no flag, schema or credential is
involved either way.

## Founder Verification
```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && npx tsx src/lib/__tests__/llm-outage.test.ts | tail -1 && GATE1_FALSE_HOLD_CAPTURE=true npx tsx src/app/logos/__tests__/human-practitioner-boundary.test.ts | tail -1
```
Expected: `140 passed, 0 failed` and `250 passed, 0 failed`.

**D2 remains blocked. The S11 flip remains REFUSED. Weights remain BLOCKED. The 0h call remains the
founder's.**

*End of session close.*
