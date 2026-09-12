# Next-Session Prompt — O-2: an honest HTTP response for a provider account block, and the /api/guardrail logging gap

**Stream:** founder.
**Tier:** likely `code-critical` for the two `GUARD_RE` routes (`/api/reason`, `/api/guardrail`);
`code-elevated` for the other ten. **Critical Change Protocol engages** for any edit inside the two
guarded files — full 0c-ii, founder-walked, AC7 engaged.
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessor close:** `operations/handoffs/founder/2026-09-12-O1-llm-outage-classifier-account-block-CLOSE.md`.
**Predecessor decision-log entries:** `D-LLM-OUTAGE-CLASSIFIER-ACCOUNT-BLOCK-2026-09-12`,
`D-SPEND-LIMIT-OUTAGE-DURATION-CORRECTED-2026-09-12`.
**Confirmed at prompt-authoring time:** `origin/main` at `3b0bf47` (the O-1 commit); Vercel green on
the founder's report. `HEAD` and `origin/main` matched exactly, `ahead=0`, at `2026-09-12 20:29 AEST`.

---

## Why this session matters

O-1 fixed the *log*: `route_errors.context.provider_error` now says "the provider refused us for an
account reason," and `error_type` carries the real SDK class instead of a generic `Error`. It
deliberately did **not** fix the *response*. A caller hitting a provider account block today still
gets one of:

- a generic `{"error":"Internal server error"}` **500** on the human tool routes (`/api/score*`,
  `/api/reflect`, `/api/evaluate`, `/api/mentor/private/reflect`, `/api/mentor/passion-classify`);
- a masked **200** `engine_unavailable` on `/api/reason` (the R3 status-masking design, unrelated to
  this bug, compounding it);
- a bare **503** `{"error":"service error"}` with no `Retry-After` on `/api/practice/discernment`;
- fail-open **200**s on the six mentor gate routes.

None of these is honest, and `Retry-After: 30` — the one response O-1 proved is *never* emitted for
a block (pinned `ACC-6`) — is still the best-case outcome, because `llmOutageResponse()` is the only
degraded-response helper any route calls. `isProviderAccountBlock` exists and is exported. Nothing
calls it.

**Separately, named at O-1 and not touched:** `/api/guardrail` writes **no** `route_errors` row on
error at all (see below — it 500s or 503s with zero logging call). A guardrail-only outage — provider
block or otherwise — is invisible to the error log and only surfaces via a hand-run smoke, exactly as
it did on 2026-09-12 before the founder noticed the block from the billing page. Folding both into one
session, since both touch the guarded route.

## Pre-conditions

1. `origin/main` at or after `3b0bf47`. Nothing uncommitted matching `GUARD_RE` without a recorded
   waiver for this session's own commit.
2. The observation window is running and the byte-identity guard is ARMED — re-derive at open
   (buffer size, both SHA pins, guard battery green). Do not quote O-1's close figures forward.
3. **A founder waiver by commit hash is required before editing `/api/reason/route.ts` or
   `/api/guardrail/route.ts`.** Precedent: `D-W2-ENFORCEMENT-MACHINERY-MERGED-LIVE-UNDER-WAIVER-2026-09-12`
   (the guard binds on `git status --short`, i.e. uncommitted lines — a committed edit is caught only
   by the two unconditional SHA pins, neither of which covers these two routes, which is exactly why
   a waiver is the real gate here, not the guard). **Scope the design and get the waiver BEFORE
   touching either file.** If the founder declines the waiver, ship the ten free routes and leave the
   two guarded ones named-open.

---

## ⛔ The hard constraint, restated precisely

| File | Status |
|---|---|
| `website/src/lib/llm-outage.ts` | **free** — `isProviderAccountBlock` and `LLM_ERROR_NOTES` already live there |
| `website/src/lib/__tests__/llm-outage.test.ts` | **free** |
| `website/src/app/api/score-decision/route.ts` (and the 9 other `llmOutageResponse()` callers below) | **free** |
| `website/src/app/api/practice/discernment/handler.ts` | **free** — confirm; not previously checked against `GUARD_RE` |
| `website/src/app/api/reason/route.ts` | **`GUARD_RE` — waiver required** |
| `website/src/app/api/guardrail/route.ts` | **`GUARD_RE` — waiver required** |

The regex is `website/src/app/logos/__tests__/human-practitioner-boundary.test.ts` — re-read it, do
not trust this table.

**All eleven current `llmOutageResponse()` call sites** (re-grep at open; `route.ts` files unless
noted):
`score-decision:305` · `reflect:402` · `score-scenario:274,531` · `score-conversation:481` ·
`mentor/passion-classify:196` · `mentor/private/reflect:953` · `score-iterate:719` · `evaluate:332` ·
`score:265` · `score-social:258` · `reason:2447` (**guarded**).

`/api/practice/discernment` does **not** call `llmOutageResponse()` at all — its two catch blocks
(`handler.ts:713-732`, `:751-763`) return a bespoke `503 {"error":"service error"}` with no
`Retry-After`. Confirm this handler is free of `GUARD_RE` before editing it (it imports `isLlmOutage`
and `logRouteError`, neither of which appears in the regex — but re-check the file path itself
against the regex, not just its imports).

**`/api/guardrail`'s current error handling (read-only, confirm at open, do not trust this table):**
`route.ts:217-218` — a signing failure → `503 substrate_signing_unavailable` (no `logRouteError` call
anywhere near it, confirmed by grep at O-1). `route.ts:245-259` — an `engine_unavailable` outcome
(from `guardrail-sandwich.ts:423/451/535/540`, itself catching Layer-1/engine throws) is folded into
the **200** verdict response, not a 4xx/5xx — so a provider block on this route today reads as a
`200` with `assessment_status: engine_unavailable`, same masking pattern as `/api/reason`. `route.ts`'s
own outer `catch (error)` at line 646 returns a bare `500` with **no `logRouteError` call at all** —
this is the logging gap. Confirm all of this first-hand; `guardrail-sandwich.ts` is itself `GUARD_RE`
(matches `guardrail-sandwich`), so read it, don't edit it without the same waiver.

---

## Part A — Open under the protocol

Read in order: `/adopted/standing-protocol-cache.md`; the standing opener
(`operations/handoffs/founder/STANDING-SESSION-OPENER-grounded-foundations.md` — check for a newer
dated version first); the predecessor close above; `website/src/lib/llm-outage.ts` in full (the O-1
header names the intended future response shape); `website/src/app/api/guardrail/route.ts` in full;
`website/src/lib/guardrail-sandwich.ts` in full (read-only orientation — do not edit without a
waiver); the decision-log physical tail.

Confirm at open: tier; hold-point (0h HELD, S11 flip REFUSED, weights BLOCKED); model per AC1;
status vocabulary; window state re-derived (buffer size, both SHA pins, armed guard battery green —
**re-run it, do not quote O-1's 250/0**); `git status` whole; `ListAgents` peer count. **Also
confirm `origin/main` still matches this prompt's stated commit** (`3b0bf47`) — if not, read
whatever landed since before scoping.

**Also read, before designing:** whether the S11 pre-flip report's composition paragraph has been
corrected to reflect `D-SPEND-LIMIT-OUTAGE-DURATION-CORRECTED-2026-09-12` (the "seven blind days"
premise). If it has not, and this session has spare capacity at its close, flag it — do not silently
edit a mentor-ruled document; that needs its own founder/mentor step.

---

## Part B — Procedure

### Step 1 — Design the response shape

Build `providerAccountBlockResponse()` in `llm-outage.ts` (free file), analogous to
`llmOutageResponse()`:

- Status: **503** (service temporarily unavailable is still the right HTTP class — a client should
  not treat this as a permanent 4xx and stop retrying forever) but with **no `Retry-After` header**,
  or one derived from `classifyLlmError(error).regain_at` if present (e.g. `Retry-After` computed as
  seconds until `regain_at`, capped at some sane maximum — decide and justify the cap).
- An honest error code distinct from `ai_temporarily_unavailable` (e.g. `ai_unavailable_provider_account`)
  and a message that does not imply a bug or invite an immediate retry — reuse or adapt
  `LLM_ERROR_NOTES.account_block` for the human-facing wording, but write it fresh for an end user
  rather than exposing the internal log note verbatim (the note names "the provider" and "the spend
  limit," which may not be the right register for a practitioner-facing tool route vs. an
  agent-facing route — consider whether the wording should differ by audience, per AC5's existing
  human/agent distinction elsewhere in this codebase).
- Decide whether `/api/score-iterate` and `/api/reason` need the loop-metering headers merged in
  (both existing `llmOutageResponse` calls do), and whether an account block should be billable at
  all (the accumulated cost up to the throw — check `isBillable` handling in `/api/reason`'s outer
  catch, since a caller should not be charged for a block that occurred before any LLM output).

### Step 2 — Wire the ten free routes

For each of the ten free-file `llmOutageResponse()` call sites, add a branch **before** the existing
`isLlmOutage` check:

```ts
if (isProviderAccountBlock(error)) return providerAccountBlockResponse(error)
const outage = isLlmOutage(error)
...
if (outage) return llmOutageResponse()
```

(`isProviderAccountBlock`/`classifyLlmError` already computed `isLlmOutage` internally in a mutually
exclusive way per O-1's ordering — confirm no route ends up calling `isLlmOutage` redundantly in a
way that changes behaviour; it shouldn't, since the two are disjoint by construction, but pin it.)

Also wire `/api/practice/discernment`'s two bespoke catch blocks (free file) to the same branch,
replacing its generic 503 with the new response for this class only — transient outages there keep
their existing bespoke 503.

### Step 3 — Scope the two guarded routes, then request the waiver

Write the exact diff for `/api/reason/route.ts:2441-2447` and `/api/guardrail/route.ts` (both the
outer `catch` at line 646 — add a `logRouteError` call there, closing the second gap — and the
`engine_unavailable` masked-200 path, where you must **decide explicitly** whether an account block
should break the masking convention and return a real status code, given that masking exists for a
different reason — R3's engine-unavailable-vs-genuine-verdict ambiguity, not provider billing).
Present the diff and the reasoning to the founder; **do not edit either file until the waiver is
granted by commit hash**, per precedent.

### Step 4 — Build, test-first

Extend `llm-outage.test.ts` (already at 83/0 from O-1) with the new response helper's shape (status,
headers, body) and a per-route wiring pin for each of the ten free routes plus discernment (mirror
the existing source-pin pattern used for `discernment-observability-wiring.test.ts` if a full
request/response harness is disproportionate — that precedent is explicitly named as acceptable in
this codebase). **Non-vacuity required**: mutation-verify every new pin, as O-1 did (21 mutations,
each shown red).

### Step 5 — R18 docs

The outage response shape (`ai_temporarily_unavailable`) is **not currently documented** on any of
`llms.txt` / `agent-card.json` / `api-docs/page.tsx` (confirmed absent at prompt-authoring time — grep
returned nothing). Decide whether the new `ai_unavailable_provider_account` shape needs a public
contract entry now, or whether documenting error responses generally is out of scope for this session
(the R18 gate is founder-signed-off before any public surface changes — do not publish without it).

### Step 6 — PR19 independent review

**Required** — this touches the error path of every LLM-calling route, including R20a perimeter
members, and (if waived) the two most sensitive routes in the system. Founder's standing permission
to run reviewers at Sonnet/low; return to the session's own model afterward. Dimensions: response
correctness (does the new response actually reach a caller in every branch); blast radius (does any
existing caller's expectation of `llmOutageResponse`'s exact shape break — grep any test or client
code asserting on `ai_temporarily_unavailable` specifically); the masking-policy decision for
`/api/reason`/`/api/guardrail` if the waiver is granted; battery non-vacuity.

### Step 7 — Verify

`npx tsc --noEmit`; the extended `llm-outage` battery; the ten-plus-one affected route suites (re-grep
their `__tests__` paths — do not assume O-1's list is exhaustive, three new routes are touched here
that O-1 did not test); **the byte-identity guard run ARMED** (expect the currently-measured
figure — re-derive, do not quote 250/0); both SHA pins unchanged (three, if the guarded routes are
untouched; note that editing `/api/reason` or `/api/guardrail` does **not** change either
`layer2-mechanisms.ts` or `stoic-brain.ts` or `intervention-engine.ts`'s hash — the SHA pins are a
separate, unconditional check on three specific files, distinct from the `GUARD_RE` working-tree
scan; confirm this distinction rather than assuming a guarded-route edit trips a SHA pin, it won't).
`npm run build` **is required this time** if either `route.ts` is touched (the O-1 session's "no
`route.ts` touched" exemption does not apply here).

### Step 8 — Records

Decision-log entry (`D-PROVIDER-ACCOUNT-BLOCK-RESPONSE-<date>` and, if the guardrail logging gap is
closed in the same session, a second entry or a combined one — the founder's call on granularity); a
session close; a path-scoped commit. **If the waiver was granted, name the commit hash in the entry
per the W2 precedent.** The founder pushes; nothing deploys in-session.

---

## Explicitly out of scope

- The Layer-1 JSON-truncation defect (64 rows/week, `max_tokens: 4000` in `layer1-extractor.ts`) —
  separate chip, separate `GUARD_RE` file, its own waiver session.
- Correcting the S11 pre-flip report's "seven blind days" composition paragraph — that is a
  mentor-ruled document; name the discrepancy to the founder, do not edit it here.
- Any change to a distress check, a deny condition, or a rate-limit bucket.
- The `SUBSTRATE_ENFORCEMENT_RECORD_ENABLED` flag, the S11 flip, any accreditation write.

## Rollback path

Free-file changes: `git revert` the commit. Guarded-route changes (if waived): `git revert -m 1`
(or a plain revert if not a merge) + redeploy; no flag, schema or credential involved either way.

## Forecast

Success is: every account-block response tells its caller (human or agent) plainly that this is a
billing-side condition, not a bug, without inviting a useless immediate retry; `/api/guardrail`
writes a `route_errors` row on every failure path the way its siblings already do; and — if the
waiver is not granted — the ten free routes and discernment are still fixed, with the two guarded
routes named as the one remaining honest gap rather than silently left inconsistent.

**D2 remains blocked. The S11 flip remains REFUSED. Weights remain BLOCKED. The 0h call remains the
founder's.**

End of prompt.
