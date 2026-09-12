# Next-Session Prompt — Observability O-1: teach the error classifier to recognise a provider account block

**Stream:** founder.
**Tier:** `code-elevated`. **Critical Change Protocol NOT engaged** — no auth, no schema, no
perimeter logic, no env flag, no credential, no deploy in-session. AC7 not engaged.
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessor close:** `operations/handoffs/founder/2026-09-12-W2-waiver-merge-and-schema-walk-CLOSE.md`.
**Predecessor decision-log entries:** `D-ANTHROPIC-SPEND-LIMIT-OUTAGE-DIAGNOSED-2026-09-12`
(the grounding finding), `D-W2-ENFORCEMENT-MACHINERY-MERGED-LIVE-UNDER-WAIVER-2026-09-12`,
`D-W2-ENFORCEMENT-VOCABULARY-MIGRATION-APPLIED-2026-09-12`.
**Memory to read first:** `anthropic-spend-limit-masks-as-layer1-unavailable`.

---

## Why this session matters

On 2026-09-12 the founder's Anthropic **spend limit** (not credit balance — the balance was healthy
at US$11.53) blocked every Layer-1 call for **seven days**. `/api/reason`, `/api/guardrail` and
`/api/practice/discernment` all failed on every request from 2026-09-05 onward.

`route_errors.is_llm_outage` read **`false` on all 239 rows.** That column exists for exactly one
purpose: telling a reader "this is the provider refusing us, not our code." It said the opposite,
for a week, which is why the outage was diagnosed by a hand-run smoke and a billing page rather than
by the error log that was built to surface it.

**The interesting part is not that the classifier missed a case. It is that "outage" may be the
wrong category.** `isLlmOutage` gates `llmOutageResponse` — a **503 with `Retry-After: 30`**. That
is honest for a transient upstream failure. It is **actively misleading** for an account block: no
amount of retrying will clear a spend limit, and a 30-second retry hint tells every caller to keep
hammering a door that will not open until a human visits a billing page. **Do not assume the fix is
to widen `isLlmOutage`.** Decide that on the evidence.

## Pre-conditions

1. `origin/main` at or after `8685d5a`. Nothing uncommitted matching `GUARD_RE`.
2. The observation window is running and **the byte-identity guard is ARMED**. See the hard
   constraint below.
3. No founder-walked step is planned. If the session concludes one is needed, it **stops and says
   so** rather than improvising one.

---

## ⛔ The one hard constraint

**No file matching `GUARD_RE` may be modified.** The regex is in
`website/src/app/logos/__tests__/human-practitioner-boundary.test.ts`. The relevant fact:

| File | Status |
|---|---|
| `website/src/lib/llm-outage.ts` | **free** — the classifier, where the work belongs |
| `website/src/lib/__tests__/llm-outage.test.ts` | **free** — 113 lines, extend it |
| `website/src/lib/observability-store.ts` | **free** |
| `website/src/app/api/reason/route.ts` | **`GUARD_RE` — do not touch** |
| `website/src/app/api/guardrail/route.ts` | **`GUARD_RE` — do not touch** |

Every other `isLlmOutage` caller (~18 routes) is free, but **prefer a fix that needs no route edit at
all.** If the session concludes a `GUARD_RE` route edit is genuinely required, **STOP and report** —
that needs a founder waiver and is not this session's to grant.

---

## Part A — Open under the protocol

Read in order: `/adopted/standing-protocol-cache.md`;
`operations/handoffs/founder/STANDING-SESSION-OPENER-grounded-foundations.md`; the predecessor close
above; `website/src/lib/llm-outage.ts` **in full**; `website/src/lib/__tests__/llm-outage.test.ts`
in full; the decision-log physical tail.

Confirm at open: tier; hold-point (**0h HELD, S11 flip REFUSED, weights BLOCKED**); model per AC1;
status vocabulary; **window state re-derived by you** (buffer size, both SHA pins, armed guard
battery green); `git status` whole; `ListAgents` peer count.

---

## Part B — Procedure

### Step 0 — ONE founder paste, then nothing further is asked of them

**This is the only thing the founder does all session.** Everything after it is self-run.

Ask the founder to run this in the **production** Supabase SQL Editor and paste the result:

```
SELECT occurred_at, route, error_type, status_code, is_llm_outage,
       left(message, 400) AS message
FROM   public.route_errors
WHERE  occurred_at BETWEEN '2026-09-05' AND '2026-09-13'
ORDER  BY occurred_at DESC
LIMIT  30;
```

**Why it cannot be skipped without cost.** The exact thrown shape is currently **unverified**.
Anthropic returns different shapes for different account conditions (a `400` billing error, a `429`
rate-limit, a `529` overload), and the SDK's `RateLimitError` name hint is *already* in the
classifier — so a 429 would have been caught. It was not caught, which points at a status the
classifier does not cover, but **that is inference, not observation.**

**If the founder declines or is unavailable:** proceed on the SDK's documented shapes, and mark every
resulting claim **`UNVERIFIED against the live instance`** in the code comments (PR25) and in the
decision-log entry. Do not quietly present a guessed shape as a diagnosed one.

### Step 1 — Design the category question before writing any code

Answer, in the records, with reasoning: **is an account block an "outage"?** Three live options —

- **(a)** widen `isLlmOutage`. Simplest; but ships a misleading `Retry-After: 30`.
- **(b)** add a **distinct** `isProviderAccountBlock` classifier with its own response shape
  (no `Retry-After`, or a much longer one) and its own `route_errors` marking. Truer; larger blast
  radius, because ~18 routes currently branch on one boolean.
- **(c)** keep one boolean for the response path but record the finer distinction in
  `route_errors.context` (jsonb, already present) so the log can tell them apart without changing
  any route's behaviour. **Smallest blast radius; likely the best first move** — but argue it, don't
  assume it.

**The founder's actual need is diagnostic, not behavioural:** they needed the log to say "not your
code." Weigh that over elegance. Whatever is chosen, **`Retry-After: 30` must not be emitted for a
condition that cannot clear without human action** — if the chosen option leaves that in place, say
so explicitly as a disclosed residual rather than leaving it unremarked.

### Step 2 — Build it, in the free files only

Test-first. The existing 113-line battery is the pattern; extend it, don't replace it. Cover at
minimum: the live shape from Step 0 (or the documented shapes, marked unverified); a genuine
transient outage still classifying as before (**no regression** — this is the important negative);
a plain application bug still classifying as neither; and the exact boundary between the two classes.

**Non-vacuity is required, not optional.** Every new assertion must be shown to fail when the fix is
reverted — mutation-verify, and record which mutation defeated which pin. A classifier test that
passes against the broken classifier is worse than no test.

### Step 3 — PR19 independent review

**Required.** ~18 callers branch on this boolean and several are R20a perimeter members, which puts
it inside PR19's widened scope even though the change sits in their error path rather than their
distress path. **The founder has standing permission to run reviewers at Sonnet/low; return to
Opus/medium afterwards.** Dimensions: regression on the existing transient class; blast radius
across callers; response-shape honesty (the `Retry-After` question); battery non-vacuity.

Fold every confirmed finding at the root, re-run, and record what was folded.

### Step 4 — Verify

`npx tsc --noEmit`; the extended `llm-outage` battery; the suites of two or three affected routes;
**the byte-identity guard run ARMED** (expect 250/0 — and if it reports *offending* lines, you have
touched a `GUARD_RE` file and must revert that edit); both SHA pins unchanged. `npm run build` only
if a `route.ts` was touched — which it should not have been.

### Step 5 — Records

Decision-log entry (lean form) `D-LLM-OUTAGE-CLASSIFIER-ACCOUNT-BLOCK-<date>`; a session close; a
`git status`-checked, **path-scoped** commit. **The founder pushes. Nothing deploys in-session.**

---

## Explicitly out of scope

- **The second observability gap — `/api/guardrail` writes no `route_errors` row at all.** That is a
  `GUARD_RE` file and needs its own founder waiver. Name it in the close as still open; do not touch it.
- Anything touching `SUBSTRATE_ENFORCEMENT_RECORD_ENABLED`, the S11 flip, an accreditation write, or
  the staged record-level compliance-not-virtue clause (which needs its own founder R18 signature).
- Any change to a distress check, a deny condition, or a rate-limit bucket.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Open + reads + window re-derivation | 15–20 min |
| Step 0 founder paste + Step 1 design | 20–30 min |
| Step 2 build + battery | 45–60 min |
| Step 3 PR19 review + folds | 30–45 min |
| Step 4 verify | 10 min |
| Step 5 records | 25 min |
| **Total** | **~2.5–3 hours** |

## Rollback path

`git revert` the single commit. Nothing is deployed in-session, no flag is set, no schema changes,
and the classifier's current behaviour is preserved by regression pins either way.

## Forecast

Success is a `route_errors` log that, the next time the provider refuses us for an account reason,
says so in a way the founder can read without a smoke test — **and** a recorded, argued answer to
whether "outage" was ever the right word for it. The `/api/guardrail` logging gap remains open
behind it, waiting on a waiver session.

**D2 remains blocked. The S11 flip remains REFUSED. Weights remain BLOCKED. The 0h call remains the
founder's.**

End of prompt.
