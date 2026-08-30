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

**Two steps escalate, at different tiers:**

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
   record. It carries **five** distinct inline corrections, cited here by their opening text
   rather than by line number (**this document's first version cited line numbers into this file
   and every one of them broke** when a correction was later inserted near the top — see §F):
   *"Qualification added 2026-08-30…"* (the dikaiosyne floor was stable ten times but the circle
   set was not); *"This paragraph's first committed draft read 'absent ×7…'"* (the indicator
   distribution is **four** states, not three); *"Both magnitude figures corrected…"* (the swing
   is 2 ranks, not 4); the §Footprint cost recomputation; and *"Correction added 2026-08-30 per
   the D6a prompt's independent PR19 re-run…"* (the stale cost and the incomplete write set).
   **The first two bear directly on probe-set design — read them, not just the cost ones.**
3. `operations/agent-circles-2026-08/2026-08-30-c11-rerun-experiment-script.sh` — the pilot.
   **Read it as a shape reference and as a defect to NOT repeat**, not as a reference
   implementation: its CSV extractor reads top-level response keys and is **wrong** — the record
   documents this in the parenthetical beginning *"The run script's own live summary CSV
   mis-extracted the verdict fields…"*. The pilot's findings survived only because full response
   bodies were retained and re-extracted by hand — a K=10 one-off tolerates that; a standing time
   series does not.
4. The mentor ruling's Q3 + its sequencing note.

## C. Build items

1. **The probe set** — frozen verbatim in a repo evidence file with per-text byte-length guards
   (the pilot's pattern: assert length before every submission). **Freezing is one-way — a changed
   probe is a NEW probe with its own series, never an edit**, or drift measurement dies. **Hard
   ceiling: each probe text must be under 5000 chars** (`TEXT_LIMITS.medium`, validated for
   `action` at `guardrail/route.ts:138-141`) or the call 400s.

   **⚠ BINDING (mentor ruling 2026-08-30, verdict-variance disclosure — verbatim capture at
   `operations/agent-circles-2026-08/2026-08-30-mentor-ruling-verdict-variance-disclosure-verbatim.md`,
   which wins over this summary): the probe set must be scoped to produce a disagreement rate on a
   REPRESENTATIVE INPUT CLASS, not only on the c11 candidate.** The rate is destined for a public
   disclosure ("on the input class examined, the floor-flip rate was approximately N%"), so probe
   membership is no longer only an instrument-calibration choice — it determines what that public
   number is *about*, and a rate derived from one atypical text would be a claim whose confidence
   exceeds its basis. **DQ-1 is correspondingly narrowed: what counts as a representative input
   class is now the question, and it must be answered explicitly and recorded**, not left implicit
   in a text selection.

   *Recommendations within that constraint:* include the c11 text itself (the only input with a
   measured distribution, so continuity is worth something — note design §5.2(a) asks only for a
   text "of c11's kind"); a clean high-grade text; an unambiguous floor-class text; and enough of
   the borderline class that the rate is about that class rather than about one candidate.

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
   the c11 finding's causal localisation rested on** — run 8's divergence was visible in
   `katorthoma_proximity` alone (`reflexive`, `proceed: false`), so a runner recording only the
   verdict would still see *that* it diverged; what needs `proximity_floors` is attributing the
   divergence to the andreia floor and the grave-indicator stage assignment, which is the entire
   mechanism finding. Getting the path wrong yields a runner that completes, writes clean-looking
   JSONL, and records nulls for the field that explains *why*.

   Record per call: timestamp; the deploy identifier per §A's elected option; the full response
   body (as the pilot did); `result.katorthoma_proximity`; `result.extraction` (where the
   **stage-assignment of grave indicators** is read, via `urgency_indicators`); `proximity_floors`
   per the paths above; and **`meta.cost_usd` — a BODY field, not a header** (CI-8,
   `guardrail/route.ts:412`; the `X-Loop-*` headers are CI-10 loop metering and are a different
   thing). `meta.cost_usd` is the figure §C.4's cost model derives from.

   `meta.cost_usd` is computed on the live path at `guardrail/route.ts:306-314` and passed to the
   envelope at `:347` (the CI-8 comment at `:412` sits in the **dark legacy branch** — accurate as
   a statement of intent, but do not verify against it).

   **Mandatory first-run assertion:** before any run counts as evidence, assert every recorded
   field is non-null on the first call and halt if not. A silent-null instrument is worse than no
   instrument. **PR25 applies to this script:** any verification claim written in a comment
   carries its check — a comment asserting a field is present must name the check that
   established it.

   **Failures must be recorded as failures, never omitted** — a dropped failed call silently
   biases the distribution. Carry the pilot's error handling forward (`set -u`, non-2xx capture,
   `--max-time`, per-run stderr).

   Append-only run records (JSONL or dated files) so the time series is the artifact.

   **⚠ TWO BINDING REQUIREMENTS from the same 2026-08-30 mentor ruling — these are no longer
   design latitude:**
   - **Persist every per-examination verdict, never only the modal or operative one.** The ruling:
     *"persistence is not optional instrumentation; it is the evidential basis for the per-verdict
     disclosure. If only the operative verdict is persisted, the disclosure cannot be made
     honestly."* A design that summarises K down to one recorded verdict is ruled out.
   - **Emit the aggregate disagreement rate as a NAMED OUTPUT**, not merely something derivable
     from the stored rows. The public instrument-level disclosure needs a specific rate, and
     *"'variance exists' is honest but weak."* Name the field; do not leave the rate implicit in
     a pile of JSONL.

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
   - (b) **Each metered call consumes TWO quota units, not one.** `increment_api_usage`
     unconditionally increments `total_calls` and `daily_calls`, and `/api/guardrail` invokes it
     **twice per request** with CI-10 live: once inside `validateApiKey` (`security.ts:439`
     legacy / `:582` UPC — the UPC variant is the live one) and again inside `recordLoopBilling`
     (`loop-cost-tracker.ts:369`) reached via `finalizeLoopResponse` (`guardrail/route.ts:361`).
     So a 3–5 probe run at K=10 is 30–50 calls but **60–100 quota units**, and the monthly-30
     default is exhausted at **15 calls**, not 30. **Size limits from calls × 2**, or the run dies
     mid-series.
   - (c) The mint **CLI has no `--daily`/`--monthly` flags at all**, so limits must be set or
     raised by another path. **Prefer the application's own audited route over raw SQL:**
     `/api/admin/api-keys` accepts `monthly_limit`/`daily_limit` at mint and exposes a PATCH that
     updates them. A direct SQL write to the live `api_keys` table is **less** conservative than
     the route, not more — an earlier version of this prompt asserted the opposite. (The mint
     itself remains founder-walked Critical on independent grounds: it issues a production
     access credential.)
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

   **There is NO depth election on the live path — do not construct one.** An earlier version of
   this prompt said `risk_class: 'standard'` maps to quick depth (3 mechanisms) and invited an
   election over it. **That is false for production.** In the live sandwich branch
   (`SUBSTRATE_GUARDRAIL_SANDWICH_ENABLED=true`), `runGuardrailSandwich` is called with **no depth
   argument** (`guardrail/route.ts:176-182`), `applyMechanisms(schema, options?: ApplyOptions)`
   takes **no depth parameter** at all (`layer2-mechanisms.ts:2843-2846`), and the response
   hardcodes `evaluation_depth: 'deterministic'`. `risk_class` shapes only the Layer-1
   `domain_context` string and the critical-only `alternatives_warning`/`rollback_path`; the
   `evaluationDepth` variable is referenced solely inside the **dark legacy branch**. The route's
   own GET self-doc still repeats the stale "mechanism count follows risk_class" claim — **do not
   reproduce it** (this is the same in-repo-docstring-over-live-code error §F records twice, and
   it is consistent with CI-16, parked precisely because the gate does not inherit the sandwich's
   depth machinery). Vary `risk_class` across probes only if you want to characterise its Layer-1
   `domain_context` effect, and say that is what you are doing.

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
  **If that review dies on the account session limit** — which happened twice to this prompt —
  the first-hand fallback is available, but the cache's wording is *"a **mandatory-not-recommended**
  independent re-run before downstream reliance"*: **re-run it after the limit resets, before the
  live run.** Do not treat a first-hand pass as discharging the obligation. This document's own
  history is the argument: the first-hand pass found 2 findings, the independent re-run found 6
  HIGH, and a third pass found 3 more HIGH that the re-run's own folds had introduced.
- **Excludability** — disclose every live run's footprint in the close, and note that **three
  tables are written per call, not one** (verified): `api_key_usage` (via the
  `increment_api_usage` RPC in `validateApiKey`, `security.ts:439`/`:582`), `analytics_events`
  (unconditional awaited insert, `guardrail/route.ts:317-335`, `event_type: 'guardrail_check_v3'`),
  and `loop_billing_events` (CI-10, written by `recordLoopBilling` at `loop-cost-tracker.ts:359`
  and `:369` — **not** `:697`, which is `aggregateLoopCost`'s read); plus `throttle_events` on any
  throttle.
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
licensing discipline (judged the document's strongest dimension).

> **STRUCK 2026-08-30.** This paragraph previously ended *"Individual file:line citations were
> accurate — the errors were in what surrounded them."* **That assurance was false and is
> withdrawn** — it was the single sentence most likely to stop a reader re-checking, and the
> third review round found an entire citation set that did not resolve. Re-check citations; do
> not rely on any claim that they were checked.

**Third round — fold-verification of the rewrite (same day).** Because the rewrite was itself
unreviewed, one further reviewer verified it against source. **It found 3 HIGH, 3 MEDIUM, 1 LOW
and 3 NITs — defects the rewrite itself introduced while fixing the earlier ones.** All folded:
(1) **every line citation into the c11 evidence record was wrong**, offset by ~13 lines — the
authoring session had cited them, then *itself inserted a 13-line correction block into that
record*, shifting every line below and silently invalidating its own citations; **all such
citations are now by quoted opening text, not line number** (the durable fix — a line number is a
pointer into a file someone will edit); (2) **the depth election described a lever that is dead on
the live path** — `applyMechanisms` takes no depth parameter and `runGuardrailSandwich` is called
without one, so `risk_class` selects no mechanism count in production; the claim came from the
route's own stale GET self-doc rather than the live code, the same docstring-over-source error
recorded twice already in this document; (3) **the quota model was off by 2×** —
`increment_api_usage` fires twice per metered call (`validateApiKey` and `recordLoopBilling`), so
the monthly-30 default is exhausted at 15 calls, not 30, and the sizing instruction would have
produced limits half of what is needed. Also folded: two citations pointing into the dark legacy
branch; the PR19 mandatory-re-run instruction, which the second round *described* as a finding but
never actually folded into §D; the SQL-vs-admin-route claim, which had it backwards; the
overstated "visible only in `proximity_floors`"; and PR25, which the document had omitted.

**Binding ruling folded (2026-08-30, verdict-variance disclosure).** Verbatim at
`operations/agent-circles-2026-08/2026-08-30-mentor-ruling-verdict-variance-disclosure-verbatim.md`.
Three consequences bind this build (§C.1, §C.2): the probe set must be scoped to a **representative
input class**, because the disagreement rate is destined for a public disclosure; **every
per-examination verdict persists**, never only the operative one; and the **aggregate disagreement
rate is a named output**. A fourth consequence runs **before** this build and is not licensed here:
the instrument-level disclosure on the trust record and R18 surfaces, which the ruling places
*now*, ahead of D6a, with the rate stated as unknown and updated once D6a measures it.

**The pattern, now confirmed across three rounds:** round one (self-review) checked constraint
*presence* and missed operator *strength*; round two fixed the substance but introduced citation
rot and a false lever; round three caught both. **No single pass has yet been clean.** Budget for
independent review of whatever this build produces, and do not treat a fold as verification.

End of prompt.
