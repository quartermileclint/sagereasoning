# Session Close — 2026-09-12 — Observability O-1: the error classifier now recognises a provider account block, and the "seven-day outage" was two hours

**Stream:** founder.
**Governing frame:** /adopted/session-opening-protocol.md (cached via /adopted/standing-protocol-cache.md).
**Tier:** `code-elevated` — Elevated risk. AC7 not engaged. No auth, schema, perimeter logic, env flag, credential or deploy touched. No `GUARD_RE` file modified; the byte-identity guard ran ARMED 250/0 at open and at close; all three SHA pins unchanged (`60cefedb…`, `fa8895ec…`, `db86fccb…`).
**Date:** 2026-09-12 (machine `date`, evening AEST; the opening prompt's "09-13" filename is the standing context-date artifact).
**Session:** `sagereasoning-d2 [6c5506]`. **Opened under:** `2026-09-13-llm-outage-classifier-account-block-NEXT-SESSION-PROMPT.md`.
**Peers at open:** 3 interactive (`sagereasoning-08`, `-bf`, `-bd`) + 1 cloud idle + 7 offline remote.
**Window at open, re-derived:** buffer 597 lines / 0 unparseable; window (line 140 onward) 458 = 323 guard + 135 consult; schema v1=138 (pre-window) / v3=135 (all consult) / v4=97 / v5=135 / v6=92; `callerClass` window: unknown 186, live_agent 27, subagent 14, absent 231 (v3 consult + v4 guard); every UTC day 09-06 → 09-12 carries consults.

## Decisions Made
- `D-LLM-OUTAGE-CLASSIFIER-ACCOUNT-BLOCK-2026-09-12` appended. A provider account block is not an outage: `isLlmOutage` deliberately NOT widened; a four-kind `classifyLlmError` beside it; the store writes `context.provider_error` on every `route_errors` row and records the SDK class name in `error_type`. Option (c) of the prompt's Step 1, argued in the entry; PR19 reviewer R2 argued the strongest case for widening and found it does not hold.
- `D-SPEND-LIMIT-OUTAGE-DURATION-CORRECTED-2026-09-12` appended. The spend-limit block ran **2026-09-12 06:07Z → 08:27Z (~2 h 20 min, 94 rows)**, not seven days. The week's other 165 error rows were A11b injection rejects (96) and Layer-1 JSON truncation (64) plus 4 enum-drift rows and 1 TypeError. **The window did not record a dead engine for a week** — the buffer shows successful consult readings on every day.

## Step 0 — what the live rows said (founder-elected read-only query, not a paste)
Primary data: `operations/observability-2026-09/2026-09-12-route-errors-outage-window-READOUT.md`.
- 259 rows in 09-05 → 09-13 (exact count, bounded read), all `is_llm_outage = false`.
- The account block: HTTP **400** `invalid_request_error`, verbatim *"You have reached your specified API usage limits. You will regain access on 2026-10-01 at 00:00 UTC."* — SDK `BadRequestError`, `.name` 'Error'. **Not a 402, not a 429.** My pre-read inference (402 `billing_error`) was wrong; that is what Step 0 exists to catch. Both shapes are covered, the observed one verbatim.
- Miss mechanism, from `@anthropic-ai/sdk` 0.80 `src/core/error.ts`: 400 outside `OUTAGE_STATUS`, `BadRequestError` outside the name hints, no outage vocabulary; and because no SDK class sets `.name`, the store's `name || constructor.name` never reached the constructor — every SDK error was logged as `Error`. Class names survive the production bundle (local `.next/server` build of 18:11 today), so the hint mechanism was not the failure.
- The `first_seen 2026-09-05` the earlier diagnosis dated the outage from was the first row of ANY class — an A11b reject.

## Step 1 — is an account block an "outage"? No.
`isLlmOutage` gates `llmOutageResponse`, a 503 with `Retry-After: 30` — honest for a transient failure, a false promise for a spend limit only a human can lift. Widening (a) ships that promise on ~11 routes; a distinct branch (b) needs edits to `/api/reason` (`GUARD_RE`) and ten other routes, several R20a members. The founder's need was diagnostic, and the store already holds the raw error, so it classifies it itself and no route changes what it returns (c). **`Retry-After: 30` is never emitted for an account block** (pinned ACC-6). The truer 503-without-retry response is a named follow-on (`isProviderAccountBlock` exported and ready; chip raised).

## Built (three free files)
| File | Change |
|---|---|
| `website/src/lib/llm-outage.ts` | `classifyLlmError`, `isProviderAccountBlock`, `LLM_ERROR_NOTES`, the O-1 header. `isLlmOutage`, `llmOutageResponse` and the three hint constants **byte-identical** (bodies extracted and diffed against the pre-O-1 file at close). Every account-block/provider-rejection disjunct sits behind a provenance gate: the SDK's attached body, or an SDK status-error instance (exact SDK constructor name + generic `.name` + numeric status). `regain_at` parsed from the message. |
| `website/src/lib/observability-store.ts` | `error_type` via `errorTypeOf` (constructor name when `.name` is only 'Error'); `context.provider_error` on every row, caller context spread last (never clobbered); optional injected client for tests. `is_llm_outage` stays the route's passthrough. |
| `website/src/lib/__tests__/llm-outage.test.ts` | 38 → **83** assertions: ACC (the live shape verbatim; 402; credit-balance 400), BND (boundaries incl. the ungated-402 and name-collision folds and the one disclosed divergence), PAR (parity on 33 fixtures), SRC (no caller claims `provider_error`), STO (row shape via a fake client, incl. the throwing-client path). |

## PR19 — three independent Sonnet/low reviewers, read-only (founder's standing permission); all folded at the root, re-run, re-mutated
| Finding | Severity | Fold |
|---|---|---|
| `status === 402` sat outside the provenance gate — `classifyLlmError({ status: 402 })` read `account_block` | R1 HIGH · R3 MEDIUM · R2 LOW, all CONFIRMED | every disjunct now behind `provenance`; pins BND-12/12b; M19r red |
| Provenance was a name-substring match; `cognitive-os`'s own `PermissionDeniedError` shares an SDK name | R1 MEDIUM · R2 LOW, CONFIRMED, not reachable today | exact constructor match + generic-`.name` discriminator + numeric status; pins BND-13/14/15; M18, M21r red |
| Test header "every O-1 pin was mutation-verified" overclaimed | R3 LOW, CONFIRMED | reworded to the honest scope; six property/self-check pins named; second mutation pass |
| "byte-identical … pinned in §PAR" conflated a static-diff fact with a behavioural check | R3 LOW, CONFIRMED | reworded, each check stated separately |
| No in-repo reader filters `error_type = 'Error'` or `context IS NULL`; a founder-run dashboard outside the repo cannot be ruled out by grep | R2, note | disclosed, not fixable from the repo |
Clean across the three: signature parity at all 33 call sites; no response path touched; `waitUntil` untouched; `next/server` in the store's import graph proven safe under bare tsx; PII (STO-8); caller-context precedence; fixture fidelity (the computed-key class trick holds under tsx).

## Mutation record (both passes; each applied, run, restored, hash-verified)
| Mutation | Red pins |
|---|---|
| M1 account_block branch off | ACC-1/4/5/7/8/9/10, BND-6, STO-2 |
| M2 provenance gate dropped | BND-1, BND-2, BND-12, BND-12b, BND-13 |
| M3 `isLlmOutage` widened to 400 | OUT-14, ACC-6, BND-2, BND-3, PAR-1 |
| M4 store `error_type` reverted | STO-1, STO-3b |
| M5 store enrichment removed | STO-2, STO-8, STO-5, STO-3b, STO-6 |
| M6 caller context clobbered | STO-7 |
| M7 transient branch skipped | BND-5/7/8/10, PAR-1, STO-3b |
| M8 `regain_at` regex broken | ACC-4, STO-2 |
| M9 vocabulary widened to 'usage limit' | BND-10 |
| M10 a caller supplying `provider_error` | SRC-1 |
| M11 provider_rejection branch off | BND-3, BND-4, BND-14 |
| M12 caller-context spread dropped | STO-4, STO-7 |
| M13 classifier try/catch rethrows | BND-9 |
| M14 `is_llm_outage` forced true | STO-3, STO-6 |
| M15 insert into the wrong table | STO-0 |
| M16 store rethrows instead of ok:false | STO-14 — **survived first**; the outer catch was unpinned; pin added |
| M17 no-client path reports ok:true | STO-11 |
| M18 generic-name test dropped | BND-13 |
| M19 402 disjunct un-gated | BND-12, BND-12b, BND-13 (first attempt was a syntax error, not a survival) |
| M20 message column nulled | STO-9 |
| M21 numeric-status requirement dropped | BND-15 — **survived first**; pin added |
BND-1's first fixture ("billing unavailable") never matched the vocabulary and was passing vacuously under M2; retargeted to "monthly spend limit exceeded", which our cost-health evaluator plausibly throws.

## Verified (Step 4, post-fold)
`tsc --noEmit` 0 (baseline, post-edit, post-fold); `llm-outage` battery **83/0**; `discernment-observability-wiring` 15/0; `observability-retention-sweep` route 52/0; `stoa/draft-reflect` r20a 63/0; `score`/`reflect`/`reason` r20a-invocation 12/12, 17/17, 19/19; byte-identity guard **ARMED 250/0** (open and close); SHA pins unchanged; `npm run build` not run (no `route.ts` touched, per the prompt).

## Status Changes
| Item | Old | New |
|---|---|---|
| `route_errors.is_llm_outage` false on a provider account block (gap 1) | OPEN | CLOSED at the log level on the founder's push — `context.provider_error.kind = 'account_block'`, `regain_at` carried |
| `error_type` reading `Error` for every SDK error | latent, unrecorded | fixed (same commit) |
| Account-block HTTP response (500 / masked 200 / 503) | — | disclosed residual; chip "Give provider account blocks an honest HTTP response" |
| `/api/guardrail` writes no `route_errors` row (gap 2) | OPEN | OPEN — `GUARD_RE`; named for the same waiver session |
| "Seven-day outage" premise | recorded as fact in five places | corrected; ~2 h 20 min on 09-12; CLAUDE.md annotated, memory rewritten |
| Layer-1 JSON truncation at `max_tokens: 4000` | unrecorded | found (64 rows/week, sizes ≈15k chars); chip "Fix Layer-1 extraction JSON truncation" |

## Disclosed residuals
1. A hypothetical 429 `RateLimitError` whose body carries the usage-limit wording is recorded `account_block` but would still receive `Retry-After: 30` from the untouched response path (BND-6 pins it as known; not observed live).
2. `provider_rejection` covers any SDK 4xx that is neither outage nor block; the cause is usually ours (request shape) and the note says so.
3. The store's classification is authoritative only while no caller supplies `provider_error` (SRC-1 pins that today).
4. A founder-run SQL dashboard outside the repo filtering `error_type = 'Error'` would now miss SDK errors; none is known.
5. **Concurrency (mine to name):** both mutation passes ran on the shared checkout, leaving a deliberately broken classifier on disk for ~10 s per mutation. Every restore was hash-verified, and `git status` at close shows no peer touched the files, but a worktree would have removed the exposure to a peer's unscoped `git add`. Do it that way next time.
6. The memory file `anthropic-spend-limit-masks-as-layer1-unavailable` was overwritten without a scratch copy first; its prior content is carried into the rewrite, but the `cp` would have cost nothing.

## Next Session Should
Either chip (both need a founder waiver by commit hash: `GUARD_RE`), or the standing queue. **The correction entry should reach the founder and mentor before the pre-flip report is re-read** — the "seven blind days" premise handed to them at the W2 close is withdrawn with primary data behind it. Update the S11 pre-flip report's composition paragraph at the next records fold; not done here (out of scope, and it is a ruled document).

## Blocked On
**Files to commit (path-scoped; the founder pushes; nothing deploys in-session):**
- `website/src/lib/llm-outage.ts`, `website/src/lib/observability-store.ts`, `website/src/lib/__tests__/llm-outage.test.ts`
- `operations/decision-log.md` (two appended entries), `operations/observability-2026-09/2026-09-12-route-errors-outage-window-READOUT.md`, this close, `CLAUDE.md` (one annotation line)
**Not mine, left alone:** the six modified/untracked files from other sessions listed in `git status` at open (cognitive-os and condition-3 closes, `environmental-context.json`, S10 working notes, the post-build relay and mentor verbatim).
**Production state at session close:** unchanged. Vercel unchanged; Supabase unchanged (two read-only SELECTs, founder-elected); no flag set. On the founder's push the classifier and store changes deploy always-on: every new `route_errors` row gains `context.provider_error` and a truthful `error_type`; **no HTTP response changes.**

## Founder Verification
```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && npx tsx src/lib/__tests__/llm-outage.test.ts | tail -1 && GATE1_FALSE_HOLD_CAPTURE=true npx tsx src/app/logos/__tests__/human-practitioner-boundary.test.ts | tail -1
```
Expected: `83 passed, 0 failed` and `250 passed, 0 failed`. Then push via GitHub Desktop; Vercel deploys always-on log enrichment, no response change.

## Cross-references
- `operations/handoffs/founder/2026-09-12-W2-waiver-merge-and-schema-walk-CLOSE.md` (predecessor)
- `operations/handoffs/founder/2026-09-13-llm-outage-classifier-account-block-NEXT-SESSION-PROMPT.md`
- `D-LLM-OUTAGE-CLASSIFIER-ACCOUNT-BLOCK-2026-09-12`, `D-SPEND-LIMIT-OUTAGE-DURATION-CORRECTED-2026-09-12`
- `operations/observability-2026-09/2026-09-12-route-errors-outage-window-READOUT.md`

**D2 remains blocked. The S11 flip remains REFUSED. Weights remain BLOCKED. The 0h call remains the founder's.**

*End of session close.*
