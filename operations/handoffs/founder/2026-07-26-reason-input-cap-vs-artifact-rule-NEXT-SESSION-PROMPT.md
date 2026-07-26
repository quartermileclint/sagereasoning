# Next-Session Prompt — The `/api/reason` Input Cap vs the Outbound-Artifact Rule

**Stream:** founder. **Tier:** `code-elevated` — investigation + design, and a dark build only if the elected fix earns it. **Governing frame:** `/adopted/standing-protocol-cache.md`. **Predecessor close:** `operations/handoffs/founder/2026-07-26-P2-rerun-VERDICT-CLOSE.md`. **Predecessor decision-log entry:** `D-AGENT-ORG-P2-RERUN-VERDICT-2026-07-26`. **Risk:** Elevated under 0d-ii for a repo-only investigation/dark build. **Any change to the live cap, the public contract, or the R20a perimeter is its own founder-walked step — nothing here pre-approves one.**

## Why this session matters

P2 closed with "no benefit shown," and the single most actionable engineering output of the whole arc was not a benchmark number — it was a collision the run walked straight into. **The harness protocol requires submitting an outbound artifact's full text; `/api/reason` caps `input` at 5,000 characters.** In the run, S1 resolved it by *editing its own deliverable down to 4,800 characters to fit the instrument*, and S3 — whose documents run 20,037 / 20,620 / 14,360 characters — split them into 18 consecutive verbatim chunks, which was the largest single driver of its cost and latency.

For a product whose target audience is agents that produce documents, that is a real fit defect. This session is branch-neutral: it is useful whichever way the founder's 0h call goes, and it does not require that call to have been made.

## Pre-conditions

1. The P2 verdict commit is pushed; working tree clean apart from `website/public/images/millstone.PNG`.
2. **This session does not need the 0h branch decided.** If the founder has decided it, note it at open and let it inform priority — not scope.
3. FRESH session — no P2 verdict context carried.

## Part A — Open under the protocol

Read: the standing-protocol cache; the P2 verdict close; **`operations/agent-org-2026-07/runs/2026-07-25-rerun/verdict-memo.md` §5.2 and Limitations §6.6**; `leg-b/leg-b-metrics.md` honest note 3 (the primary evidence — the character counts and the two workarounds); and the `README.md` §3 item 3 rule 1c that created the requirement. Confirm tier, hold-point status, model selection, risk class.

## Part B — Procedure

### Step 1 — Ground the collision first-hand (do not trust these citations)

They were located by the predecessor session and must be re-verified, not cited forward:

- `website/src/app/api/reason/route.ts:947` — `validateTextLength(input, 'Input', TEXT_LIMITS.medium)`. Note lines 949/951/976 apply the same cap to `context`, `domain_context`, and one further field.
- `website/src/lib/security.ts:208–217` — `TEXT_LIMITS`: `short 2000` · **`medium 5000`** · `long 15000` · `document 30000`. **A larger-tier vocabulary already exists and is already used elsewhere** — this is a tier-selection question as much as a new-limit question.
- The harness side of the collision: `truncateForServer` (4,800 + marker) on the H1 input and guard action, built *around* the 5,000 cap. Find it and read it — the client already truncates, which is why the collision manifests as a silent shortening rather than only as a 400.

Establish and state plainly: **why 5,000?** Is it a considered limit (cost, latency, Layer-1 context budget, abuse surface) or an inherited default? The answer determines whether this is a tuning change or a design change. If the provenance cannot be established from code, comments, migrations, or the decision log, **say so** rather than inferring a rationale.

### Step 2 — Map the blast radius before proposing anything

A cap on this field is not only an ergonomics knob. At minimum, establish first-hand:

- **R20a / AC5.** The distress perimeter runs over `input` before any context load or LLM call. Raising the cap raises what the classifier processes. Does the two-stage classifier have its own bound? Does a longer input change stage-1/stage-2 behaviour or cost? **This is the surface that makes any live change Critical, not Elevated.**
- **Layer-1 extraction.** Cost and latency scale with input. Quantify the delta at 15,000 and 30,000 characters rather than asserting it is fine.
- **Loop metering and the billing path.** A larger input changes per-call cost; check whether any CHECK constraint, integer column, or quota assumption is sized to today's ceiling (the S9b lesson: `loop_billing_events` params are INTEGER and a float or oversized value 503s the route).
- **The `l1_supply` path.** A supplied `layer1_schema` skips extraction, but the `input` text is still required and still runs the perimeter — confirm the cap applies identically there.

### Step 3 — The hypothesis worth testing, stated as a hypothesis

**The corroboration check cross-references self-report claims against the *verbatim submitted text*.** If an agent must truncate or chunk a long artifact to fit the cap, the check may be examining a fragment — in which case a harm present only in the un-submitted remainder is structurally invisible to it, and an agent could satisfy the protocol while defeating the mechanism without ever lying.

**Verify this first-hand against `corroboration-check.ts` and the chunked-call behaviour.** If it holds, this is not an ergonomics finding — it connects to the already-recorded A2 structural residual (`gaming-robustness-extraction-trust-locus-split`, and the weights-BLOCKED disposition that rests on it), and its severity and the honest scope of the public claim both change. **If it does not hold, say so plainly and record why** — a refuted hypothesis recorded is worth more than a hedged one carried.

### Step 4 — Options, with a recommendation

Produce at least: (a) raise the tier for credential-bearing consults (`long`/`document`); (b) a first-class chunked or streamed examination path, so the protocol stops requiring agents to improvise one and the corroboration check sees the whole artifact; (c) leave the cap and fix the *protocol rule* instead (submit a bounded, faithful extract under a stated rule) — which trades instrument fit for honesty about what was examined; (d) do nothing, disclosed. Recommend one. Name what each costs on the Step-2 surfaces.

### Step 5 — Build, or stop at design

Stop at design if the elected option touches the perimeter or the public contract — those are founder-walked. Build dark and flag-gated if it is genuinely additive. **Per PR19, an independent adversarial review is required — not optional — before any change touching the engine or a predicate is treated as verified**, with the codified spend-limit first-hand fallback if the review dies. Template: `operations/review-harness/independent-review-workflow-template.md`.

### Step 6 — Records

Lean decision-log entry + lean close per the cache. If Step 3's hypothesis holds, the R18 public-claim scope is affected and must be named in the entry, not left to a later session to discover.

## Rollback path

Investigation and design are documents — `git revert` the records commit. Any dark build is flag-gated and reverts with its commit; nothing activates in this session.

## Forecast

Success = the cap's provenance established or honestly declared unknown, the blast radius mapped rather than assumed, the corroboration-fragment hypothesis resolved in one direction or the other, and one recommended option with its costs named. That either closes a small fit defect or promotes it into a mechanism-scope finding — and the session should be equally willing to reach either.

End of prompt.
