# Next-session prompt — R8-D6a: the verdict-repeatability instrument (build + cadence election)

**Paste this as the task after the standing session opener.** Authored 2026-08-30 under the R8
follow-on session (`operations/handoffs/founder/2026-08-30-R8-followon-rulings-adoption-NEXT-SESSION-PROMPT.md`
§B2(iii)), executing design §11 follow-on 4 by founder election. **Authoring this prompt licensed
nothing; the build runs only under this prompt's own future session and the elections inside it.**

> **REVISION NOTE — this document was substantially rewritten 2026-08-30 after an independent
> three-dimension PR19 re-run returned 6 HIGH findings against the first version** (§F carries the
> full record). Two of those were introduced or endorsed by the authoring session's own first-hand
> review. **Do not work from any earlier copy.**

## Tier

**Base: `code-standard`** for the probe harness and evidence records (a repo script + append-only
run files; no auth/encryption/safety-surface *change* — the build calls a live gate, it does not
modify one).

**Two steps escalate, and both are `code-critical`:**

1. **The probe-credential mint AND the SQL limit-raise it requires (§C.3)** — **`code-critical`,
   AC7 engaged, PR6, PR17 founder-walked.** Issuing a production access credential is an
   access-control change under the cache's risk table, and raising limits by SQL is a direct write
   to the live `api_keys` table. This project's record is unbroken on the point (Gate-1 Slice-3b
   and the Standing-Harness onboarding both ran credential mints as founder-walked Critical 0c-ii,
   AC7 + PR6). The founder runs every live step; the AI performs no mint or SQL op.
2. **DB persistence, if elected at DQ-2** — `schema`, founder-walked TEST→prod, and see DQ-2's
   RLS requirements, which are not optional.

The first live probe run is **founder-elected** (real metered spend against a live safety gate),
following the R8 precedent where the c11 experiment ran as the one tier-escalated sub-step of an
otherwise `governance` session.

## A. What this is (scope from the R8 design, §5.2(a))

The c11 experiment generalized and made standing: a small fixed probe set re-submitted K times
per probe on a periodic founder-elected cadence against the **live `/api/guardrail`**, with
per-probe verdict distributions and per-run floor attributions recorded over time.

**Boundary, restated as binding: the instrument characterises the scorer; nothing consumes its
output as a signal into generation or election.** It is MEASURE-only and weights-BLOCKED-compliant
(it produces per-probe distributions; no aggregation rule, no weighting function, none to be
designed). It is **NOT Option S** — Option S (ruled buildable at the mentor ruling's Q3) is the
*runner-side* K-sampling policy on decision-bearing verdicts and lives in the standing-runner
build brief. D6a probes the gate from outside with fixed texts; it changes no cycle, no election,
no verdict.

**What it measures, stated precisely (the design's own phrasing is looser than the mechanism):**
the per-input verdict distribution on a fixed text, and how that distribution moves over time.
The seven-probe adversarial review's Probe 3(c)
(`2026-08-29-ADVERSARIAL-REVIEW-cybernetic-seven-probes.md`) named a *cross-cycle* quantity — a
one-rank move between adjacent cycles on **differing** texts. D6a supplies the **noise floor** that
makes such a move interpretable; it does not measure Probe 3(c)'s quantity itself. Design §5.2(a)
elides this. Do not restate the design's version.

**⚠ VERIFIED BLOCKER ON THE "DRIFT ACROSS DEPLOYS" HALF.** Checked first-hand 2026-08-30 and
independently re-confirmed by two reviewers: **no deploy identifier is exposed anywhere the probe
can reach.** `VERCEL_GIT_COMMIT_SHA` appears nowhere in `website/src/` (only in `.next/` build
artifacts); `/api/health` returns a hardcoded `version: '0.4.0'` + `phase: 'P0'`
(`src/app/api/health/route.ts:134-135`); no guardrail response branch carries one, and
`signed_assessment.key_id` reflects the signing-key rotation generation
(`layer2-signer.ts:83`), not a deploy. So half the instrument's stated purpose has no mechanism
today. **This is a build item, not a hedge to pass over.** Named options, none pre-elected:
(i) the founder records the deployed commit from the Vercel dashboard at each run, entered in the
run record; (ii) the runner captures `git rev-parse origin/main` locally as a proxy **with the
caveat recorded in every run that local `origin/main` is not necessarily the deployed commit**;
(iii) an additive `/api/health` change exposing `VERCEL_GIT_COMMIT_SHA` — its own separate elevated
step, **not licensed here**. Until one is chosen, the instrument measures per-input distribution
honestly and **drift attribution to a deploy must not be claimed.**

## B. Read at open

1. `operations/agent-circles-2026-08/2026-08-30-standing-runner-design-R8.md` §5.2(a), §3, §5.3,
   §10. **R8 is a founder-unadopted proposal** — electing to build follow-on 4 is not adoption of
   any other part of it, including its Prerequisite-Criterion index.
2. `operations/agent-circles-2026-08/2026-08-30-c11-rerun-experiment-record.md` — the evidence
   record. It carries **four** distinct inline corrections (the circle-set stability
   qualification at line 63; the four-state indicator distribution at lines 82/90-94; the
   rank-magnitude arithmetic at lines 108-111; the cost recomputation at lines 143-147). **The
   first two bear directly on probe-set design — read them, not just the cost one.**
3. `operations/agent-circles-2026-08/2026-08-30-c11-rerun-experiment-script.sh` — the pilot.
   **Read it as a shape reference and as a defect to NOT repeat**, not as a reference
   implementation: its CSV extractor reads top-level response keys and is **wrong** (record lines
   51-56 document the mis-extraction). The pilot's findings survived only because full response
   bodies were retained and re-extracted by hand — a K=10 one-off tolerates that; a standing time
   series does not.
4. The mentor ruling's Q3 + its sequencing note.

## C. Build items

1. **The probe set** — 3–5 texts spanning the grade range, frozen verbatim in a repo evidence file
   with per-text byte-length guards (the pilot's pattern: assert length before every submission).
   **Freezing is one-way — a changed probe is a NEW probe with its own series, never an edit**, or
   drift measurement dies. **Hard ceiling: each probe text must be under 5000 chars**
   (`TEXT_LIMITS.medium`, validated at `guardrail/route.ts:138-148`) or the call 400s.
   *Recommendations, not mandates — membership is DQ-1 and stays open:* include the c11 text
   itself (the only input with a measured distribution, so continuity is worth something — note
   design §5.2(a) asks only for a text "of c11's kind"); a clean high-grade text; an unambiguous
   floor-class text.

2. **The runner script.** **Read this whole item before writing code — the field paths are the
   thing the first version of this prompt got wrong.**

   **The response is an ENVELOPE.** `buildEnvelope({ result: resultBody, ... })` returns
   `{ result, meta }` (`guardrail/route.ts:337`; `lib/response-envelope.ts:217`). So every verdict
   field sits under **`result.`** — `result.katorthoma_proximity`, `result.extraction`. The pilot's
   extractor omitted this prefix and silently recorded nulls.

   **`proximity_floors` is nested asymmetrically, two hops in production:**
   - signing ON (production): **`result.signed_assessment.assessment.proximity_floors`**
   - signing OFF: **`result.assessment.proximity_floors`**

   because `signLayer2Assessment` returns `{ assessment, signature, key_id }`
   (`layer2-signer.ts:193`). These differ by a *level*, not just a key name. **This is the field
   the entire c11 finding turned on** (run 8's divergence was visible only in
   `proximity_floors.andreia`); getting it wrong yields a runner that completes, writes
   clean-looking JSONL, and is blind to the exact phenomenon it exists to measure.

   Record per call: timestamp; the deploy identifier per §A's elected option; the full response
   body (as the pilot did); `result.katorthoma_proximity`; `result.extraction` (where the
   **stage-assignment of grave indicators** is read, via `urgency_indicators`); `proximity_floors`
   per the paths above; and **`meta.cost_usd` — a BODY field, not a header** (CI-8,
   `guardrail/route.ts:412`; the `X-Loop-*` headers are CI-10 loop metering and are a different
   thing). `meta.cost_usd` is the figure §C.4's cost model derives from.

   **Mandatory first-run assertion:** before any run counts as evidence, assert every recorded
   field is non-null on the first call and halt if not. A silent-null instrument is worse than no
   instrument.

   **Failures must be recorded as failures, never omitted** — a dropped failed call silently
   biases the distribution. Carry the pilot's error handling forward (`set -u`, non-2xx capture,
   `--max-time`, per-run stderr).

   Append-only run records (JSONL or dated files) so the time series is the artifact.

3. **The dedicated probe credential** — **founder-minted; `code-critical`, AC7, PR6, PR17 (see
   Tier).** Labelled (e.g. `sagereasoning:d6a-probe@v1`), `consult`-class (verified: the route
   authenticates via `validateApiKey(request, 'guardrail')` at `guardrail/route.ts:90`, which
   asserts the `consult` umbrella capability; the pilot drove it with an `X-Api-Key` header).
   **Q1c note (the mentor ruling's Q1c, distinct from the standing constraint Q1):** keep this
   credential's `agent_id` distinct from the runner's and any executing agent's — the ruling's
   identity-separation applied to the completion-signal path, and this is that discipline extended
   by default, not the ruling extended past its scope.

   **⚠ THE MINT-LIMIT TRAP.** `API_KEY_FREE_TIER_DEFAULTS` is **monthly 30 / daily 1 / chain 1**
   (`src/lib/api-key-defaults.ts:20-24`). Consequences, verified:
   - (a) A freshly minted credential trips the daily cap on **call #2**, and `/api/guardrail`
     returns an **honest HTTP 429 `Daily limit exceeded`** with `daily_calls`/`daily_limit` in the
     body (`security.ts:483-497`). **It does NOT present as a 401.** The 401-masking described in
     memory `api-key-1-per-day-limit-masks-as-401` is an artifact of `/api/reason`'s plugin-install
     fall-through branch; that memory names `/api/guardrail` as the *control case* where the honest
     429 surfaces, because this route returns `keyCheck.error` directly with no substitution.
     **A 401 here means a genuinely invalid/revoked/wrong-prefix credential — do not misread it as
     the quota trap.**
   - (b) A full run at 3–5 probes × K=10 is 30–50 calls, at or over the monthly-30 default in a
     single run (the check is `new_monthly_total > monthly_limit`, so exactly 30 does not trip).
   - (c) The mint **CLI has no `--daily`/`--monthly` flags at all**, so limits must be raised
     separately. (The admin *route* does honour body `monthly_limit`/`daily_limit`; the SQL remedy
     is the more conservative path.)
   - (d) **Increment-then-check**: every failed call still consumes monthly quota, so a run that
     trips the daily cap burns its remaining K against the monthly allowance.

   **Therefore: compute required daily/monthly limits from probe-count × K × cadence, raise them,
   and verify by reading the stored row back before the first run** — do not assume the mint
   honoured them.

   **⚠ A SECOND, INDEPENDENT LIMITER — IP-keyed, unfixable by any credential change.**
   `checkRateLimit(request, RATE_LIMITS.publicAgent)` runs at `guardrail/route.ts:87`, **before
   auth**: **30 requests / 60 seconds**, keyed on IP (`security.ts:122`). A 30–50-call run fired
   concurrently (the natural `Promise.all` implementation) trips this immediately, returning a
   *different* 429 — `Too many requests` — distinguishable from the quota 429 only by body.
   **The pilot's 6-second inter-call spacing is a REQUIREMENT, not an incidental detail: carry it
   forward, or cap concurrency at 1 and justify the alternative.** Note also that the limiter's
   store is in-memory per serverless instance, so it behaves non-reproducibly across runs — itself
   a confound for an instrument measuring reproducibility.

4. **The cadence election** (founder, in-session): one-shot-on-demand vs scheduled (e.g.
   post-deploy, weekly). **Cost, from the pilot's measured figures:** the c11 run metered
   **$0.142215 across 10 calls, mean $0.014222/call** (experiment record §Footprint, lines
   143-147, which corrects an earlier "~$0.15 / ≈$0.0148" that quoted run 1's cost as the mean;
   design §5.2(a) still carries the rounded figure, and the record's own line 28 still carries the
   stale "~$0.15" — **a one-line records fix worth making in this session**). So ≈ **$0.43** for
   3 probes × K=10, ≈ **$0.71** for 5 × K=10, per run.

   **⚠ RUNTIME EXCEEDS THE BASH TOOL CEILING.** At pilot latency (14.5–19.1s/call) plus 6s
   spacing ≈ 22s/call: 30 calls ≈ **11 minutes**, 50 calls ≈ **18 minutes**, against a 10-minute
   max tool timeout. **Even the smallest priced configuration overruns it.** Background the run or
   chunk it per probe — decide before starting, not after watching a series die mid-run (partial
   data is not usable for a distribution).

   **Depth election, previously inherited silently:** `risk_class: 'standard'` (the server default
   the pilot used) maps to **quick** depth — 3 mechanisms (`guardrail/route.ts:131-136`). A probe
   set "spanning the grade range" is therefore measured at the shallowest depth only, and drift at
   `elevated`/`critical` depth is invisible to this instrument. Defensible (it matches the live
   default), but make it an explicit election rather than an inherited default.

   No cron is created without the founder walking it.

**Design questions the session resolves (not pre-answered here):** DQ-1 — probe-set membership and
count (§C.1's list is a recommendation; the byte-guard, one-way-freeze, and 5000-char rules are
requirements); DQ-2 — persistence: repo evidence files (pilot pattern, zero schema, recommended)
vs a DB table; DQ-3 — K, cadence, and depth.

**If DQ-2 elects a DB table**, it carries more than a migration: **service-role-only RLS with an
explicit `REVOKE ALL` from anon/authenticated/PUBLIC, verified behaviourally by an unauthenticated
probe returning `42501`** — this project fixed four separate RLS/grant defects on 2026-08-16,
including tables whose policies were written without a `TO` clause over never-revoked default
grants (one exposing 2,201 production rows to the shipped anon key), and an open Class C backlog
of that shape is on record. Also resolve `retain_until`-or-not **explicitly**: PR24's retention
parity is conditional on the table *declaring* `retain_until`, and a drift time series whose value
is longevity arguably should not declare one — in which case PR24 does not bind and the
retention/erasure question still needs its own answer.

## D. Standing constraints (unchanged; do not soften — and note that three of the re-run's HIGH
findings were constraints named accurately then weakened by a single verb, so check operator
strength, not just presence)

- **Weights-BLOCKED** — no weighting function may be designed, sketched, or evaluated. The
  instrument produces distributions; it proposes no aggregation rule over them.
- **Q1 — the loop proposes; it never executes.** D6a is not in the loop's path at all: it submits
  fixed texts to a gate and records responses, touching no generation, election, or execution
  path. (Distinct from the mentor ruling's **Q1c** at §C.3.)
- **The boundary in §A** — if any session proposes feeding D6a output into election, generation,
  or verdict adjustment, that is a different design requiring its own ruling; refuse in place.
- **The Prerequisite Criterion (manifest, binding) — engages on any proposal claiming
  practitioner-facing outputs; apply it and SHOW the application.** The R8 design's §10 index
  lists R8-D6a under "checked and not fired" (instrument calibration): treat that as an **input to
  your reasoning, not a substitute for it** — R8 is a founder-unadopted proposal, and electing to
  build one follow-on does not adopt its criterion index. Re-apply if any output is ever surfaced
  practitioner-facing.
- **PR19** — the probe set and runner script get independent review **before the first live run is
  executed**, not merely before its output is treated as evidence: an unreviewed script firing
  real metered calls at a live safety gate is itself the live-op-consequential act PR19 governs.
- **Excludability** — disclose every live run's footprint in the close, and note that **three
  tables are written per call, not one** (verified): `api_key_usage` (via the
  `increment_api_usage` RPC in `validateApiKey`), `analytics_events` (unconditional awaited insert,
  `guardrail/route.ts:317-335`, `event_type: 'guardrail_check_v3'`), and `loop_billing_events`
  (CI-10, `loop-cost-tracker.ts:697`); plus `throttle_events` on any throttle.
  **⚠ The `analytics_events` row carries NO credential reference** — only `agent_id`, which is
  `null` unless the runner sends `agent_id` in the POST body (the pilot's minimal payload does
  not). **So send `agent_id` in the payload**, or a standing cadence permanently pollutes
  production `guardrail_check_v3` analytics with synthetic verdicts that cannot be excluded.
  Verify the write set first-hand; do not inherit the pilot script's header comment, which claims
  "no other writes" and is wrong.
- **M-vs-W** — D6a data characterises the instrument. It has **no standing** in the deferred
  M-vs-W ruling, whose empirical basis the mentor assigned to Option S's disagreement-rate data.
  Do not present D6a as bearing on that ruling in either direction.
- **Concurrency convention** — `ListAgents` at open; `git status` twice; path-scoped commits;
  **never `git add -A`**; append shared records at the physical tail.
- Nothing bears on the 0h call, which remains the founder's.

**Downstream gate this build opens (record it in the close):** design §11 item 2 makes R8-D9's
similarity dimension with its persistence counter adoptable "only alongside R8-D6a". The direction
runs D9→D6a, so it does not block this build, but completing D6a unlocks it.

## E. What "done" looks like

Probe set frozen + reviewed; runner script built + **independently reviewed**; credential minted
and its limits verified by read-back (founder-walked Critical); first run executed (founder-elected)
with its record committed, the first-run non-null assertion passed, and the full footprint
disclosed; cadence, depth, and persistence elected and recorded (including "on-demand only" as a
valid election); a PR19-reviewed decision-log entry at the tail; a lean close. Nothing consumes the
output; no gate behaviour changes anywhere.

## F. Review record for THIS prompt

**First pass (authoring session, 2026-08-30).** Three independent parallel reviewers were launched
and **all three died whole on the account session limit** before returning anything. Per PR19's
codified spend-limit-outage fallback the review was completed **first-hand** across all three
dimensions — the sanctioned fallback, not the equivalent of independent review. It found 6
findings (2 HIGH: the mint-limit trap and the deploy-identifier absence; 1 MEDIUM: a cost figure
reproducing a number the experiment record had already corrected; 2 LOW; 1 NIT).

**Independent re-run (same day, after the limit reset) — REQUIRED, and it changed the document
substantially.** Three fresh reviewers, blind to each other and to the first-hand findings
(claims-vs-source / constraint compliance / build executability). **Result: 6 HIGH, 7 MEDIUM, and
a long LOW/NIT tail. The first-hand pass had found two of them.** Every finding is folded above.

The HIGHs: (1) **every response field path was wrong by one level** — the route wraps the verdict
in `{ result, meta }`, and `proximity_floors` is two hops deep in production, so a runner written
to the first version would have recorded nulls for the discriminating field while appearing to
succeed; (2) **§B pointed the build session at the pilot's known-broken extractor as the
"reference implementation"**, when the record documents it as a defect; (3) **"zero other writes"
was false** — three tables per call, and the `analytics_events` rows are unexcludable as written;
(4) **an IP-keyed 30/60s rate limiter, checked before auth, went unmentioned** while the pilot's
protective 6s spacing was silently dropped; (5) **PR19's re-run obligation was written as "worth
doing"** when the cache states it as "mandatory-not-recommended… before downstream reliance";
(6) **the Prerequisite Criterion's binding "apply and show the application" was replaced with "do
not re-litigate"**, on the authority of an unadopted document's self-assessment — a change the
first-hand pass had *introduced and scored as a LOW improvement*.

Two reviewers independently converged on the quota-failure symptom being stated backwards (the
first version said 401-masking; `/api/guardrail` returns an honest 429, and the cited memory names
this route as precisely the control case) — a memory cited without verifying the current instance,
which is PR23's stated caveat.

**The pattern the constraints reviewer named, worth carrying forward:** three of the most serious
findings share one shape — *a rule named accurately, then relaxed by a single verb in the same
sentence*. The first-hand review checked whether each constraint was **present** and found the
list complete; it never checked whether each was still at full **strength**. Scope any future
self-review to operator strength, not constraint presence.

**Verified correct across reviewers:** the 9/10 verdict split; the corrected cost figures and every
derived estimate; the credential shape and auth path; the deploy-identifier absence; the one-way
freeze discipline; the weights-BLOCKED framing; the Option-S separation; the Q1c scoping; and the
licensing discipline (judged the document's strongest dimension). Individual file:line citations
were accurate — the errors were in what surrounded them.

End of prompt.
