# Next-session prompt — R8-D6a: the verdict-repeatability instrument (build + cadence election)

**Paste this as the task after the standing session opener.** Authored 2026-08-30 under the R8
follow-on session (`operations/handoffs/founder/2026-08-30-R8-followon-rulings-adoption-NEXT-SESSION-PROMPT.md`
§B2(iii)), executing design §11 follow-on 4 by founder election. **Authoring this prompt licensed
nothing; the build runs only under this prompt's own future session and the elections inside it.**

**Tier:** `code-standard` for the probe harness and records (a repo script + evidence records;
no auth/encryption/safety-surface change), **escalating to founder-walked steps** for the two
live operations it needs: (a) the dedicated probe-credential mint (founder-run, prod admin JWT —
memory `prod-mint-needs-prod-admin-jwt`), and (b) the first live probe run + any standing
cadence (production guardrail calls = real metered spend; each run founder-elected or
founder-scheduled, never self-scheduled by the session). If the session elects DB persistence
(design question DQ-2 below) instead of repo-file records, the migration escalates that step to
`schema` with the founder-walked TEST→prod walk convention.

## A. What this is (verbatim scope from the R8 design, §5.2(a))

The c11 experiment, generalized and made standing: a small fixed probe set re-submitted K times
per probe on a periodic founder-elected cadence against the **live `/api/guardrail`**, with
per-probe verdict distributions and per-run floor attributions recorded over time. **What it
measures: the instrument's per-input verdict distribution and its drift across deploys** — the
quantity the **seven-probe adversarial review's** Probe 3(c) named latent
(`2026-08-29-ADVERSARIAL-REVIEW-cybernetic-seven-probes.md` — R8 §5.2(a) cites it; it is not
R8's own probe) and the c11 record (9× `deliberate` / 1× `reflexive` on ten byte-identical
submissions) demonstrated is real.

**⚠ VERIFIED BLOCKER ON THE "DRIFT ACROSS DEPLOYS" HALF — read before designing the run record.**
Checked first-hand 2026-08-30: **no deploy identifier is exposed anywhere the probe can reach.**
`VERCEL_GIT_COMMIT_SHA` appears nowhere in `website/src/`; `/api/health` returns a hardcoded
`version: '0.4.0'` + `phase: 'P0'` (`src/app/api/health/route.ts:134`), not a commit; the
`/api/guardrail` response body carries no deploy field (`src/app/api/guardrail/route.ts:265-300`
— `signed_assessment.key_id` changes only on key rotation and is not a deploy proxy). So half the
instrument's stated purpose has no mechanism today. **This is a build item, not a hedge to pass
over.** Named options, none pre-elected: (i) the founder records the deployed commit from the
Vercel dashboard at each run and it is entered in the run record; (ii) the runner captures
`git rev-parse origin/main` locally as a proxy **with the honest caveat recorded in every run
that local `origin/main` is not necessarily the deployed commit**; (iii) an additive `/api/health`
change exposing `VERCEL_GIT_COMMIT_SHA` — its own separate elevated step, not licensed here.
Until one is chosen, the instrument measures per-input distribution honestly and **drift
attribution to a deploy must not be claimed.**

**Boundary, restated as binding: the instrument characterises the scorer; nothing consumes its
output as a signal into generation or election.** It is MEASURE-only, weights-BLOCKED-compliant
(no weighting function; it produces distributions, not scores-of-scores), and it is NOT Option S
— Option S (ruled buildable, `2026-08-30-mentor-ruling-R8-producer-floor-semantics-verbatim.md`
Q3) is the *runner-side* K-sampling policy on decision-bearing verdicts and lives in the
standing-runner build brief, not here. D6a probes the gate from outside with fixed texts; it
changes no cycle, no election, no verdict.

## B. Read at open

1. `operations/agent-circles-2026-08/2026-08-30-standing-runner-design-R8.md` §5.2(a) (the
   design), §3 (the pilot experiment), §5.3 (what this is NOT — the M/W/S election, deferred
   with locked framing).
2. `operations/agent-circles-2026-08/2026-08-30-c11-rerun-experiment-record.md` + the preserved
   script `2026-08-30-c11-rerun-experiment-script.sh` — the pilot IS the reference
   implementation shape (minimal payload, byte-exact text, length guard, server defaults, full
   response capture). Note its two inline corrections.
3. The mentor ruling's Q3 + the sequencing note (the M-vs-W deferral and where D6a's cousin
   data feeds).

## C. Build items

1. **The probe set** — 3–5 texts spanning the grade range, frozen verbatim in a repo evidence
   file with per-text length guards (the c11 pattern: assert byte length before every
   submission). Must include: the c11 text itself (already floor-class-borderline, the only
   input with a measured distribution — continuity with the pilot), at least one clean
   high-grade text, at least one unambiguous floor-class text (expected `reflexive` stable).
   Selection is a session task; freezing is one-way — a changed probe is a NEW probe with its
   own series, never an edit (drift measurement dies otherwise).
2. **The runner script** — `tsx` or shell per the pilot; K submissions per probe (default K=10,
   matching the pilot; founder may elect smaller for cost); records per run: timestamp, the
   deploy identifier per whichever option §A's blocker note elects, full verdict, and the fields
   below. **Field availability verified first-hand 2026-08-30 against
   `src/app/api/guardrail/route.ts:265-300` — all three are genuinely on the wire, no assumption
   carried:** `katorthoma_proximity` (line 267); `extraction` (line 293 — the Layer-1 extraction,
   R10-2 parity with `/api/reason`, which is where the **stage-assignment of grave indicators**
   is read, exactly as the pilot read it); and `proximity_floors`, which rides **inside** the
   assessment — `signed_assessment` when signing is on (production) else the bare `assessment`
   (lines 296-300), so the script must handle both shapes rather than assuming the signed one.
   Plus the cost headers (CI-8/CI-10). Append-only run records (JSONL or dated files, full
   response body per call as the pilot did) so the time series is the artifact.
3. **The dedicated probe credential** (founder-minted): labelled (e.g.
   `sagereasoning:d6a-probe@v1`), `consult`-class only (verified correct shape: `/api/guardrail`
   authenticates via `validateApiKey(request, 'guardrail')` at `src/app/api/guardrail/route.ts:90`
   → the UPC `consult` capability; the pilot drove it with an `X-Api-Key` header), so all probe
   traffic is excludable from every billing/usage/trajectory sample by `credential_ref`.
   **Q1c note:** this credential is neither the runner's nor any executing agent's; keep its
   `agent_id` distinct from both (the ruling's identity-separation applies at mint by default
   discipline, even though D6a is outside the completion-signal path).

   **⚠ THE MINT-LIMIT TRAP — name it at the mint step or the first run dies at call #2.**
   `API_KEY_FREE_TIER_DEFAULTS` is **monthly 30 / daily 1 / chain 1**
   (`src/lib/api-key-defaults.ts:20-24`). Three consequences, all verified: (a) a freshly minted
   probe credential **401s on the second call of any K>1 run**, and per memory
   `api-key-1-per-day-limit-masks-as-401` it masks as a "Please sign in" auth failure, not a quota
   error — a debugging rabbit-hole this prompt is naming in advance; (b) a full run at 3–5 probes
   × K=10 is **30–50 calls, at or over the monthly-30 default in a single run**; (c) per the S9
   record (CLAUDE.md, s9-loop gen-2) **the practice mint silently drops `--daily`/`--monthly`
   flags**, so limits had to be raised **by SQL** afterwards. **Therefore: compute the required
   daily/monthly limits from the elected probe-count × K × cadence, raise them by SQL at mint
   time, and verify the stored row's limits by reading it back before the first run** — do not
   assume the mint honoured them.
4. **The cadence election** (founder, in-session): one-shot-on-demand vs scheduled (e.g.
   post-deploy, weekly). **Per-run cost disclosed before election, from the pilot's measured
   figures — not the rounded ones:** the c11 run metered **$0.142215 across 10 calls, mean
   $0.014222/call** (experiment record §Footprint, which explicitly corrects an earlier
   "~$0.15 / ≈$0.0148" that had quoted run 1's cost as if it were the mean; design §5.2(a) still
   carries the rounded figure — **use the measured mean**). So: ≈ **$0.43 for 3 probes × K=10,
   ≈ $0.71 for 5 × K=10**, per run. No cron is created without the founder walking it.

**Design questions the session resolves (not pre-answered here):** DQ-1 — probe-set membership
and count; DQ-2 — persistence: repo evidence files (pilot pattern, zero schema) vs a DB table
(only if the founder wants dashboard visibility; brings PR24 retention-parity and the migration
walk with it — the repo-file default is recommended); DQ-3 — K and cadence.

## D. Standing constraints (unchanged; do not soften)

- **Weights-BLOCKED** — distributions are measurement; no weighting function may be designed,
  sketched, or evaluated on top of them.
- **Q1** — untouched; D6a is not in the loop's path at all.
- **The boundary in §A** — if any session proposes feeding D6a output into election, generation,
  or verdict adjustment, that is a different design requiring its own ruling; refuse in place.
- **Prerequisite Criterion** — the R8 design already dispositioned R8-D6a under **"checked and
  not fired"** (§10's index, grouped with D6b/D6c as "instrument calibration and runner
  telemetry"). Do not re-litigate it; re-check only if any output is ever surfaced
  practitioner-facing, which v1 (internal evidence files) does not do.
- **PR19** — the runner script + probe set get independent review before the first live run is
  treated as evidence (parallel `Agent` calls if the Workflow gate is unmet, disclosed).
- **Excludability** — every live run's footprint disclosed in the close, per the pilot's example
  and naming the row type: **one `loop_billing_events` row per call (CI-10)**, the metered cost,
  the credential, and the UTC timestamp window that makes the traffic excludable. Zero trust
  events, zero watching rows, zero other writes — assert this, don't assume it.
- **Concurrency convention** — `ListAgents` at open; `git status` twice; path-scoped commits;
  tail-append shared records.
- **M-vs-W stays deferred** — D6a data informs instrument drift; the disagreement-rate data the
  next design-capable session opens with is Option S's (runner-side). Do not present D6a data as
  discharging that dependency; it corroborates, it does not substitute.
- Nothing bears on the 0h call, which remains the founder's.

## E. What "done" looks like

Probe set frozen + reviewed; runner script built + reviewed; credential minted (founder);
first run executed (founder-elected) with its record committed and footprint disclosed; cadence
elected and recorded (including "on-demand only" as a valid election); a PR19-reviewed
decision-log entry at the tail; a lean close. Nothing consumes the output; no gate behaviour
changes anywhere.

## F. Review record for THIS prompt (PR19, honest limit disclosed)

Three independent parallel reviewers (claims-vs-source / constraint compliance / build soundness)
were launched and **all three died whole on the account session limit** (resets 9:10am Brisbane)
before returning anything. Per PR19's codified spend-limit-outage fallback the review was
**completed first-hand across all three dimensions** by the authoring session — which is the
sanctioned fallback, **not** the equivalent of independent review, and is disclosed as such. **An
independent re-run after the limit resets is worth doing** (the standing lesson
`independent-rereview-catches-self-review-blind-spots` applies with force: this is exactly the
self-review configuration that has previously missed real defects).

**Six findings, all confirmed against source, all folded above:** 2 HIGH — the mint-limit trap
(§C.3) and the verified absence of any deploy identifier (§A), the latter negating half the
instrument's stated purpose until a build item solves it; 1 MEDIUM — the cost figure reproduced
a number the experiment record had explicitly corrected (§C.4); 2 LOW — Probe 3(c) misattributed
to R8 rather than the seven-probe review (§A), and the Prerequisite Criterion re-derived rather
than citing the design's existing "checked and not fired" disposition (§D); 1 NIT — footprint
disclosure now names `loop_billing_events`/CI-10 explicitly (§D).

**Confirmed clean against source:** the 9/10 verdict split (experiment record line 36); the
credential shape and auth path (`route.ts:90`); all three recorded fields genuinely on the wire
(`route.ts:265-300`); the pilot-script shape as described; the Q1c note presented as *discipline*
rather than as a ruling extended beyond its scope; the M-vs-W deferral framing matching the
ruling's sequencing note; and the tier/escalation structure matching the R8 precedent (the c11
experiment ran as a founder-elected tier-escalated sub-step of a `governance` session).

End of prompt.
