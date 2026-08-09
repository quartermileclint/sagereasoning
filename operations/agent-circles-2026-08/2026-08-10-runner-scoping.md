# Runner scoping — the IDEA loop's operational environment (2026-08-10)

**Status:** produced by the runner scoping session, the fifth step of the binding sequence
(`D-ACTIVATION-OWNERSHIP-RULED-2026-08-09`). **Tier:** `code-critical`, AC7 engaged and
discharged — every mint, SQL statement and Vercel flag was founder-performed under PR17; the AI
guided and verified and performed no live op.

**Position in the binding sequence:**

> brief ruled → `fresh` ruled → `watching` ruled → generation-step ruled → first build gate
> (all three built dark) → **runner scoping session (THIS DOCUMENT)** → bounded validation run
> → standing-runner design

**Dates:** the session's live operations are stamped 2026-08-09 UTC in the database; the founder's
local date at close is 2026-08-10. Both appear below where timestamps are quoted.

---

## 0. What this document is

The runner's complete operational environment, as established. It is **not** a runner design —
no heuristic template, no threshold, no prompt text, no pacing mechanism, and no standing-runner
decision appears here or is implied by anything here (§1.8's boundary; architecture ruling §1
item 1: runner-side content is external to this repo permanently).

It carries five things: the identity and capability surface; the validation-run configuration
values; the resolved `ORIENTATION_DELIVERY_TIMEOUT_MS` position; the `frictionAssessment` mapping;
and **GS-ATRF-1/2/3 as named inputs** — questions the runner's design must answer **before** the
bounded validation run begins, per the mentor's instruction that they are inputs to this document
and not build items.

---

## 1. The identity and its capability surface

| Property | Value |
|---|---|
| Agent id (K1-canonical) | `sagereasoning:idea-loop@v1` |
| Credential record id | `527cc86b-830b-4337-8fd7-ff28d9b0b5dc` |
| Key prefix | `sr_prac_03c2e0` |
| Purpose | `unified_practice` (CI-14 UPC) |
| Capabilities | `consult`, `watching_write` — **exactly these two** |
| `owner_kind` | `operator` |
| `owner_user_id` | `babdde33-9b87-4ec4-957e-488dc61a6ae9` (`clintonaitkenhead@gmail.com`) |
| Limits | monthly 5000 · daily 500 · max_chain_iterations 1 |
| Minted | 2026-08-09T21:13:02Z, production |

**No token appears in this document or in any session record.** The token was printed once at
mint and is held by the founder only.

### 1.1 Why exactly these two capabilities (least privilege against the ruled cycle)

The §2.8 six-step cycle calls four server surfaces. Their capability requirements were read from
source, not assumed:

| Cycle step | Surface | Capability | Verified at |
|---|---|---|---|
| 2 — guardrail filtering | `POST /api/guardrail` | `consult` | `guardrail/route.ts:90` → `validateApiKey` → UPC chokepoint |
| 3 — novelty | `POST /api/practice/fresh` | `consult` | `fresh/handler.ts:207` |
| 5 — winner's examination | `POST /api/reason` | `consult` | UPC chokepoint |
| 6 — record write | `POST /api/practice/watching` | `watching_write` | `watching/handler.ts:244` |

`l1_supply` is **deliberately not granted**: a supplied Layer-1 extraction can never mint an
orientation reading, and the runner has no reason to supply one. `accreditation_write`, `calling`
and `reflect` are not called anywhere in the ruled cycle.

### 1.2 The 6e §A invariant, proven on the row

The `watching_write` CHECK widening was confirmed **already live** on production before the mint
(Step 0(1) — it was walked at the `watching` build; it was **not** re-run):

- `api_keys_capabilities_subset_check` — six values, includes `watching_write`
- `api_keys_sage_assent_write_requires_owner_and_agent` — firing array includes `watching_write`

The mint was then verified **at the database**, field by field, not inferred from a successful
response. This distinction is load-bearing and was stated at the time: §W proves owner+agent
*given* the capability; it cannot prove the capability landed. Had `capabilities` failed to
persist, §W would never fire and the mint would have succeeded just as cleanly while leaving a
credential unable to write a single cycle record. The DB read confirmed
`capabilities: ["consult","watching_write"]`, `owner_user_id` non-null, `agent_id` canonical.

### 1.3 Quota sizing — measured, not inherited

The predecessor prompt's arithmetic (~10 calls/cycle, ~60/day) was checked and **corrected**:
`validatePracticeCredential` — the chokepoint `fresh` and `watching` use — contains no
`increment_api_usage` call, so **those two surfaces do not consume quota.** Only `/api/guardrail`
and `/api/reason` (via `validateApiKey`) do.

| Measure | Value |
|---|---|
| Quota-consuming calls per cycle | **≤8** (≤7 guardrail + ≤1 consult) |
| At `minimumInterval` 4h (~6 cycles/day) | ≤48/day |
| A 40-cycle validation run | ≤320 total |

The founder elected 500/day and 5000/month — substantial headroom, and a deliberate election
above the AI's recommendation of 200/2000. Recorded as the founder's call, with the note that a
quota is also a spend guardrail on a loop making bounded Sonnet calls.

**Why sizing at mint time mattered:** the CI-6 mint defaults are 30/month, 1/day, which would have
starved the runner after one action on day one — and the failure presents as a **401 "Please sign
in"**, not a quota error. That confusion has cost a session before.

---

## 2. Validation-run configuration values (§2.5, ruled)

All five defaults ruled 2026-08-09 and carried here unchanged as the **validation-run** values.
The standing runner re-proposes its own from the run's data (§1.8's boundary).

| Parameter | Value | Note |
|---|---|---|
| `loopId` | convention `{k1AgentId}#{instance}` — first instance `sagereasoning:idea-loop@v1#001` | An identifier, not a tunable. Immutable for the instance's life; uniqueness is the runner's responsibility. |
| `minimumInterval` | 14,400,000 ms (4 h) | ~6 cycles/day |
| `maximumDuration` | 1,800,000 ms (30 min) | A **hard ceiling, not a soft target**. Bounds steps 1–5; the record write (step 6) executes **outside** it. |
| `randomOffsetPercent` | 20 | Additive-only jitter; one draw per cycle used twice (timing + phantasia permutation) |
| `minimumIncubationInterval` | 3,600,000 ms (1 h) | Subordinate to `minimumInterval` — the throttle stays binding |

**Reserved:** `#smoke` is used by this session's activation artifacts (§6) and must not be reused
as a loop instance.

---

## 3. `ORIENTATION_DELIVERY_TIMEOUT_MS` — the revisit, answered

**The constant is correct and unchanged: 28,000 ms.** It tracks the harness's own documented
`GATE1_TIMEOUT_MS` default exactly, verified first-hand in two places this session
(`harness/gate1-pre-decision/README.md:126`; `framing-core.mjs:100`). The mentor-ruled dependency
holds: if the harness default changes, this constant must change with it.

**The revisit question — does the runner's own client timeout match 28,000 ms? — is answered NO,
on measurement rather than preference.**

This session's own live consult (probe 2, the `loop_id` activation smoke) reported:

```
layer1_latency_ms: 22167  +  layer2: 19  +  layer3_latency_ms: 12576  ≈ 34,762 ms
```

**~34.8 seconds — past the 28,000 ms bound.** And §2.8 rules the winner's consult runs the **full
synchronous shape** (no `assessment_first`) until a narrative-retrieval seam exists. So this is
the shape of every winner consult the runner will make, not an outlier.

**Confirmed at the DB, not left as inferred arithmetic:** the resulting orientation event's
`orientationDeliveryClass` reads **`observed`**, not `examined` —

```sql
SELECT payload->>'orientationDeliveryClass' FROM public.agent_trust_events
WHERE correlation_id = 'orient:9d31fe1b9a83c4dcf678b90f9922d294';
-- observed
```

— so this section demonstrates the consequence on this session's own data rather than predicting it.

**Consequences, in order:**

1. The runner **cannot** adopt a 28,000 ms client timeout — it would time out on its own winner
   consults and the ruled cycle would never complete. That branch is foreclosed by evidence.
2. The runner's client timeout must therefore exceed 28,000 ms, and the divergence is permanent.
3. **Every orientation reading from a runner winner-consult completing between 28 s and the
   runner's own timeout will be classified `observed`, not `examined`** — even though the runner
   genuinely received it.

**Position taken (the second of the two branches the session was offered): the divergence is
recorded as a known measurement limitation on runner-produced orientation readings. The constant
is NOT changed — that would require the mentor.**

**Why the limitation is acceptable and the constant should not be loosened:** `observed` is the
*conservative* class — the server declining to claim a delivery it cannot confirm. The divergence
causes systematic **understatement** of delivery, never overstatement. Loosening the constant to
accommodate the runner would trade a safe understatement for an unsafe overstatement on **every**
caller, not just this one.

**For the mentor at the validation-run report:** this limitation is now *quantified* rather than
hypothetical, and the runner will generate a large sample of it. Whether a caller-declared timeout
channel is worth building (the mentor previously ruled extending the protocol "real but
disproportionate") can be revisited on that data.

---

## 4. `frictionAssessment` PM-tool mapping — decided

**Founder decision (this is a runner-environment call, not a server decision):**

- **The shared task list is a repo-local file** for the bounded validation run.
- **`frictionAssessment` lives alongside the task in that file** — the three contract fields as
  ordinary data, not a separate annotation store.

**Reasoning recorded:** the validation run is bounded and founder-attended, so integration cost
buys little; all three contract fields are trivially representable; and it avoids a second store
to keep in sync. The mentor's alternative (an annotation keyed by external task reference)
introduces a sync surface where a stale `assessedAt` would silently break the §2.3 dedup guard.

**The real PM-tool choice is deliberately deferred to the standing-runner design**, which the
validation run's data should inform. Nothing here pre-decides it.

**What the contract requires** (§2.3 reads these as contract fields; nothing server-side depends
on where they live):

| Field | Use |
|---|---|
| `frictionAssessment.detected` | Slot 1 of the three-slot qualification test |
| `frictionAssessment.description` | Plain-language friction; the specific step and marker |
| `frictionAssessment.assessedAt` | **Load-bearing** — the dedup guard re-converts a friction point only when `assessedAt` is newer than the prior candidate's cycle |

Without a reliable `assessedAt`, the friction channel would resubmit one stubborn friction point
indefinitely and burn a `fresh` call per cycle re-rejecting it. The repo-local file makes that
timestamp trivially reliable, which is a substantive point in its favour rather than mere
convenience.

---

## 5. GS-ATRF-1/2/3 — named inputs to the runner design

Carried in explicitly per the mentor's instruction: **these are questions the runner's design must
answer before the bounded validation run begins. They are not build items, and nothing in this
session builds toward them.** The mentor's substantive answers are attached to each.

### GS-ATRF-1 — the blast-radius indicator

**Mentor's answer (verbatim source: `2026-08-09-mentor-review-six-stoic-items-and-gs-atrf-answers-verbatim.md`):**
blast radius at the reasoning level is a function of four virtue dimensions — how many oikeiosis
circles are affected (**dikaiosyne**), how irreversible the action is (**andreia**), how many
preferred indifferents are at stake (**phronesis**), and how much the action exceeds what reason
warrants (**sophrosyne**). *"High blast radius: affects circles 3–5, low reversibility, multiple
high-axia preferred indifferents at stake, virtue domains spanning justice and courage. Low blast
radius: affects circle 1–2, high reversibility, low-axia preferred indifferents, single virtue
domain."* A proxy, disclosed as such — *"but it is a philosophically grounded proxy, not an
arbitrary one."*

**The question the runner design must answer:** does the runner compute this indicator, and from
what? See §5.4 — the dikaiosyne dimension is not currently computable from a persisted candidate
row.

### GS-ATRF-2 — proposal-shape extension

**Mentor's answer:** the blast-radius indicator **rides the existing proposal shape** as an
additional field, derived from `targetCircle` + `initialClassification` + the virtue domains
engaged. *"It does not require a separate signal. The implication for the watching table is
minimal — one additional nullable field on the candidate row, populated when the winner is
selected."*

**The question the runner design must answer:** where the derivation happens (runner-side at
selection, or server-side), and what the field's honest basis disclosure says.

### GS-ATRF-3 — the idea completion signal return path

**Mentor's answer:** *"This is a separate scope item after the first build gate. … Scoping it
inside the generation-step document would blur the Q1 hard constraint — the generation step
produces proposals, and the completion signal is what happens after a proposal becomes an
action."*

**Placement, already settled:** the post-validation-run **ATRF scoping session**
(`D-MENTOR-PRIORITISED-SEQUENCE-ADOPTED-2026-08-09`), alongside the pre-task question set and the
oikeiosis extension metric. **This satisfies GS-ATRF-3's own "explicit, not defaulted"
requirement.** No runner-design answer is owed before the validation run.

### 5.4 Carried finding — `targetCircle` is not persisted (a named consequence of GS-ATRF-2's answer)

**Verified first-hand again this session** (a repo-wide grep for `target_circle` returns nothing):

| Field | On `GeneratedCandidate` (type) | On `idea_loop_candidates` (live table) |
|---|---|---|
| `initialClassification` | ✓ | ✓ (as `classification_kind` + `classified_domains`) |
| `targetCircle` | ✓ (`idea-loop-types.ts:104`) | ✗ — **no column** |

**Not a defect:** per generation-step §2.1, `targetCircle` is a gap-level property uniform across a
cycle, so the ruled table shape carried `gap_ref` instead of duplicating the circle onto every row.
That was coherent when ruled.

**But it makes GS-ATRF-2's "one additional nullable field" understated.** The indicator's
**dikaiosyne** dimension — *"how many oikeiosis circles are affected"* — cannot be computed from a
persisted candidate row today. Realising the mentor's answer needs the blast-radius column **plus**
either a `target_circle` column on the candidate row or cycle-level circle resolution from the gap.

**Both tables are live in TEST and production**, so any column addition is a **founder-walked
Critical migration with its own §VERIFY and inverse block** — not a build-time schema edit. It
rides whichever session first scopes the blast-radius indicator. **It blocks nothing now**, and
this session deliberately did not add it (explicitly out of scope).

**Related, from the same mentor review (item 5):** the longitudinal oikeiosis-extension metric is
*"already latent in the data the watching table will accumulate"* — true at **gap** granularity
(via `gap_ref`), not at per-candidate granularity as the review states. A per-candidate
oikeiosis-reach metric needs the column; a per-cycle one does not.

---

## 6. Activation state, smoke artifacts, and teardown

**All three flags are live in Vercel Production and smoke-verified on the runner credential:**

| Flag | Surfaces | Verified |
|---|---|---|
| `SUBSTRATE_FRESH_ENABLED` | `POST /api/practice/fresh` | 200; `passedNoveltyCheck: true` with `noveltyConfidence: 0` and `basis: "insufficient_history"` over a genuinely empty window (`rows_in_window: 0`) — the ruled Q-C starved-window outcome, an honest no-basis verdict rather than confidence derived from absence of evidence |
| `SUBSTRATE_WATCHING_ENABLED` | `POST /api/practice/watching`, `GET /api/founder/watching`, `/founder-watching` | Write 200 + identity stamped **server-side** at the DB (`agent_id`, `owner_user_id`, `credential_ref`, `retain_until` +90 d); read 200 with the nested candidate array; dashboard renders the row with `fifth_circle_weighting` attribution and the runner-composed disclosure (the ruled §2.10 Q7 requirement) — **after the defect in §7 was fixed** |
| `SUBSTRATE_LOOP_ID_FIELD_ENABLED` | the `loop_id` field on `/api/reason` | Malformed → **400 non-billable** (`x-anthropic-cost-cents: 0`, `x-loop-internal-calls: 0`); valid → 200 and the stamp landed |

**The QG-C composition verified live** on `orientation-reading-indeterminate`:

```
correlation_id  : orient:9d31fe1b9a83c4dcf678b90f9922d294   (server-computed)
loopId          : sagereasoning:idea-loop@v1#smoke          (runner-declared passthrough)
virtue_domain   : null                                       (flag-effect; cannot seed trust state)
```

Two identifiers on the same event as **separate fields**, never concatenated, both independently
visible — exactly the ruled composition.

### 6.1 Artifacts

| Artifact | Disposition |
|---|---|
| `idea_loop_cycles` / `idea_loop_candidates` row, `loop_id = sagereasoning:idea-loop@v1#smoke` | **Delete at teardown** — see below |
| One `agent_assessment_history` row on the runner credential (probe 2's consult) | **Retained** — a genuine consult; `retain_until`-governed. It enters the `fresh` novelty window the validation run reads. One row is below `EVIDENCE_FLOOR` (3) so it distorts nothing, but it is a **non-cycle row** in the run's window and is named here rather than glossed. |
| One `orientation-reading-indeterminate` trust event + one `loop_billing_events` row | Retained; exclude from billing/trajectory samples |

**Teardown SQL** (candidates cascade):

```sql
DELETE FROM public.idea_loop_cycles
WHERE loop_id = 'sagereasoning:idea-loop@v1#smoke';
```

### 6.2 Rollback

Per item, in reverse order of application: unset each flag + redeploy (each byte-identical
flag-off, battery-asserted); revoke credential `527cc86b-…` (the real kill switch for identity and
capability, per the S9 precedent); `git revert` the records commit. **No schema migration was
performed this session.**

---

## 7. A defect found by this session's own smoke — fixed and live-verified

**Found:** at the `SUBSTRATE_WATCHING_ENABLED` activation smoke, `GET /api/founder/watching`
returned **503 `{"error":"service error"}`** while the write route on the same flag worked.

**Root cause:** there are **two** foreign keys between the two tables —
`idea_loop_candidates_cycle_id_fkey` (candidates.cycle_id → cycles.id, CASCADE) and
`fk_ilc_winner_candidate` (cycles.winner_candidate_id → candidates.id, SET NULL). The readers used
an **unqualified** embed `idea_loop_candidates (*)`, which PostgREST cannot resolve and refuses
(PGRST201). Writes were unaffected (no embed), so the defect stayed latent from the `watching`
build until the first live read.

**Blast radius:**

| Site | Consumer | Impact |
|---|---|---|
| `getCyclesWithCandidates` | founder dashboard | Broken — the validation run's only observation surface |
| `getWatchingDataForOwner` | `/api/user/export` (R17i) | Degraded; the route fail-honestly wrote `{error}` rather than claiming empty |

Deletion (R17c) was **unaffected** — no embed. **No real data was harmed**: the tables were empty
until this session's smoke row.

**Fix:** both readers now share one disambiguated `CANDIDATES_EMBED` constant pinning the
parent→children FK. Three INV pins added and **mutation-verified** (reverting one call site fails
§7.2 and §7.3, including the partial-regression shape where one site is fixed and the other left
broken).

**The standing lesson, which the two-line fix does not close.** Every battery was green — store
23/0, handler 20/0 — while both production readers were failing. The in-memory fake models result
**shape**, not PostgREST's relationship resolution, so it agrees with whatever the code asks for.
**A store module tested exclusively against a hand-built fake has zero coverage of the
query-planner contract.** Any future store function embedding across these tables inherits the same
blind spot, and the new pins lock the *string*, not the behaviour. This is recorded as a carried
finding, not as closed by the fix.

---

## 8. What this session did NOT do

- Did not run the bounded validation run (the next session).
- Did not build any runner-side content — no heuristic template, friction threshold,
  `randomOffsetPercent` implementation, or prompt text. **Runner-owned and external to this repo
  permanently.**
- Did not design the standing runner.
- Did not build the ATRF pre-task question set.
- Did not add `target_circle` or a blast-radius column (§5.4 — named, not built).
- Did not re-run the `watching_write` CHECK widening (already live; verified, not repeated).
- Did not change `ORIENTATION_DELIVERY_TIMEOUT_MS` (would require the mentor).
- Did not re-open anything ruled.
- **The Q1 hard constraint held throughout: the loop proposes; it never executes.**

---

## 9. What the bounded validation run needs before it starts

1. The runner's own code (external to this repo) implementing the §2.8 six-step cycle.
2. The repo-local task-list file with `frictionAssessment` per §4.
3. Answers to **GS-ATRF-1 and GS-ATRF-2** (§5) — the runner design's to give. GS-ATRF-3 needs no
   answer before the run (its placement is settled).
4. A client timeout **above 28,000 ms** on the winner consult (§3), with the measurement
   limitation understood.
5. The §6.1 smoke row deleted, so the run's data starts clean.

**Deliverable of that run:** the brief §6 report shape verbatim — *cycles run, outcome
distribution, null-cycle rate, heuristic productivity, cost per cycle, anomalies* — brought to the
mentor **before any standing-runner design opens.**

---

*End of scope document.*
