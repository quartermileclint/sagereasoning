# SCOPE DOCUMENT — Hegemonikon habituation drift + melete (for mentor ruling)

**Date:** 2026-08-15. **Produced by:** concurrent-arc session C2 (scoping session A), under the
M2 ruling of 2026-08-15 (*"The AI runs each session and produces a scope document for ruling…
The sessions produce the document. The mentor rules on the document. Execution folds into
post-run sessions after the ruling."*). **Input record:**
`2026-08-12-SESSION-hegemonikon-drift-and-melete-SCOPING-RECORD.md` (all four scope inputs, the
Seneca criterion, the hysteresis warning, and the n=1 survivorship flag are carried in full).
**Status: RULED 2026-08-15** — Ruling Set B, verbatim canonical:
`2026-08-15-mentor-rulings-C2-scope-documents-verbatim.md` (R-1 confirmed with the
disposition_stability sharpening as the central finding; R-2 M-A adopted, wording in hand;
R-3 M-B only; R-4 melete deferred; R-5 window stands with the survivorship limit named;
R-6 loop-ledger measure in scope, trust-record subject-matter dispersion not; the
uniformity-reads-as-stable family remains open in the 08-12 scoping record; execution post-run
per M2). As authored, nothing here is a build, a design of record, or a
recommendation beyond what the input record licenses. Every mechanism named was verified against
the code first-hand on 2026-08-15; the live honest-claims envelope is quoted from the wire
module, not from records.

---

## 1. The questions for ruling

- **R-1 (attestation fact):** Does the trust record attest anything about discriminative range?
  **Finding, verified:** no — and the finding is sharper than the opening record stated (§2.2).
- **R-2 (envelope):** Should ADR-013 §8's `does_not_attest` list — and the live
  `TRUST_RECORD_ENVELOPE` that publishes it verbatim — say so explicitly?
- **R-3 (signal legitimacy + landing surface):** Is a variance/dispersion signal over the
  existing M7 window a legitimate addition — and if legitimate, on which surface does it land
  (delta member / public payload field / ledgered observation class / documentation only)?
- **R-4 (melete's half, same session by ruling):** What, if anything, may honestly measure
  whether rehearsal is *building* discrimination — given that no agent-side rehearsal surface
  exists (§2.7)?
- **R-5 (the window):** Is the M7 window (90 days / last 30 rows) the right measurement window
  for variance — in **length** and in **completeness** (the survivorship half, now grounded in
  primary data, §2.6)?
- **R-6 (the second axis):** Is proposal-range narrowing — dispersion of the *subject matter*,
  not of the *reading* — in scope for the same family, and over which data may it honestly
  compute (§2.8)?

**Carried into this family by the mentor's own M7 ruling (2026-08-15), listed and deliberately
not designed:** *"The trust-record reading of recurring corroborated patterns is correctly
parked with the open hegemonikon drift and melete scoping session. The uniformity-reads-as-stable
family is the right home for this. Do not design it now."* It is named here so the ruling on
this document can place it; no design for it appears below.

---

## 2. Verified mechanics (PR20 — first-hand, 2026-08-15)

### 2.1 The envelope, quoted from the wire

ADR-013 §8's `does_not_attest` list (live text, `adopted/adr/2026-07-08-sage-trust-layer.md`
§8 — the base list, the 2026-07-12 S10 amendment that added the PA-10 replay class and the PA-6
reflect narrowing, and the two 2026-08-08 amendments that added the orientation items) names:
factual correctness (D3); omitted harms (A2 / A9-case-3); the stale-artifact replay class
(PA-10); reasoning quality beyond the signed artifacts; future behaviour; the weights tier;
fifth-circle alignment; confirmed delivery. The
live wire constant `TRUST_RECORD_ENVELOPE`
(`website/src/lib/substrate/trust-core/trust-record-payload.ts:45-64`) publishes the same eight
`does_not_attest` items verbatim on every `GET /api/trust-record/{agent_id}` response.
**Nothing in either text names discriminative range, dispersion, variance, or uniformity.**
R-1's factual half is settled by direct quotation: the record does not attest it — and does not
disclaim it either.

### 2.2 The sharpening the opening record did not carry: a variance signal already exists, with the inverted valence

The opening record's finding was *"None [of the live signals] measures variance, dispersion, or
discriminative range."* Verified first-hand, that needs one precision that **strengthens** the
gap rather than refuting it:

- `computeDispositionStability`
  (`website/src/lib/substrate/trust-layer/evaluation-window/window-aggregator.ts:520-574`)
  computes the **standard deviation of proximity ranks** over the window. Its levels:
  stddev < 0.4 ⇒ `advanced`, with the indicator strings *"Highly consistent proximity across
  actions"* and *"Disposition approaching hexis"*; its trend reads `improving` when the recent
  half's stddev **falls** (`:551`).
- This dimension is surfaced through AE-1's `dimension_trends`
  (`trajectory-delta.ts:313-320`), and its starvation-floor feeding predicate is `() => true`
  (`trajectory-delta.ts:564`) — it always computes once the row-count floor is met.

So the pipeline does not merely *fail to measure* discriminative range: **its one
variance-reading signal certifies zero variance as the top level and names it "approaching
hexis."** The thirty-identical-`deliberate` profile the opening record describes would read
`disposition_stability: advanced, improving-or-stable` — the strongest possible endorsement.

**The doctrinal precision that keeps this honest:** stability-as-hexis is genuinely Stoic; the
dimension is not simply wrong. The conflation is between **stability under perturbation**
(Seneca, *Letters* 75.8–9 — the ruled criterion: the grades are distinguished by
relapse-resistance) and **absence of perturbation**. A standard deviation computed over an
unperturbed window cannot distinguish "tested and held" from "never varied." No current signal
introduces, or conditions on, perturbation — which is why the criterion has nowhere to bind
today (§2.9).

### 2.3 Every smoothing mechanism, named at its site (the hysteresis warning made checkable)

The ruled warning: *a session that conflated [measurement smoothing with practitioner
stability] would report the smoothing of its own measurement as evidence of the subject's
steadiness.* The smoothings actually in the pipeline, each verified:

| Mechanism | Site | What it smooths |
| --- | --- | --- |
| Grade downgrade hysteresis | `grade-transition-engine.ts:184-211` (`regressing_checks_trigger`: 2/3/3/4/999 consecutive regressing checks, keyed by the record's **typical-proximity level**, `:361-364` — not by grade); AND a downgrade needs **≥2 of 3** conditions (`:379-383`: below proximity floor / above passion ceiling / persistent regression) — persistent regression alone never downgrades; counter maintained at `sage-assent-wrapper.ts:456-463` | The grade **assignment** (doubly smoothed) |
| Trust-core transition hysteresis | `trust-core/trust-transition.ts:175,194` (increases rise at most ±1 ordinal rank per event); most decreases step down one rank, but `justice-surface-violated` is exempt — it hard-floors to `reflexive` (`:226-229`) | The earned-level **fold** |
| Direction-of-travel evidence gate | `window-aggregator.ts:342` (`trajectory.length < 10 ⇒ 'stable'`) | The trend **readout** |
| B5 decline predicate | `session-decline-signal.ts:308` (non-increasing AND strictly-lower-final, ≥3 declared sessions of ≥3 rows) | The cross-session **decline claim** |
| A3 decay onsets | `trust-core/constants.ts:46-50` (12/6/3 months by volatility; reflect modulation doubles the onset) | Decay-from-**disuse** (a different mechanism from drift-from-repetition) |
| Delta evidence floors + regime segmentation | `trajectory-delta.ts:125` (`EVIDENCE_FLOOR = 3` per compared half); `SETTLED_REGIME_BOUNDARIES` `:167-223` (append-only, two entries; boundary-band exclusion) — the boundaries a live window segments on are flag-dependent via `activeRegimeBoundaries(...)`, `:243-250` | What the delta will **compare at all** |

None of these measures the practitioner's stability; each stabilises a reading. Any candidate
variance signal must state which of these smoothings sit upstream of it, or the warning's
failure mode is realised by construction. (Stated as a constraint on scoping, not a design.)

### 2.4 What a variance signal could compute over — the persisted row, exactly

The M7 windowed read selects (`agent-assessment-history-store.ts:271-275`): `correlation_id`,
`credential_ref`, `agent_id`, `created_at`, `receipt_id`, `proximity`, `is_kathekon`,
`kathekon_quality`, `passions_detected`, `virtue_domains_engaged`, `oikeiosis_met`,
`oikeiosis_stage`, `ruling_faculty_state`, `skill_id`, `candidates_considered`, `depth_tier`
(+ flag-gated `layer1_source`, `session_marker`). **Not persisted:** the action text, the full
circle list, the extraction schema, any delivery marker.

Consequence: **reading-dispersion** (variance of proximity, domain mix, passion mix,
kathekon-quality mix, depth mix) is computable from existing rows with no schema change — the
posture AE-1 took. **Subject-matter dispersion is not computable from these rows** beyond those
coarse proxies; the row deliberately carries no record of *what* was examined. That asymmetry is
load-bearing for R-6 (§2.8).

### 2.5 The M7 window as it actually is

`TRAJECTORY_DEFAULT_WINDOW_DAYS = 90`, `TRAJECTORY_DEFAULT_MAX_INSTANCES = 30`
(`agent-assessment-history-store.ts:145-147`), read date-descending. The delta layer halves the
regime segment oldest-first (baseline = first half) and floors each signal at 3 non-empty rows
per half. The window was sized for **level and rate** (D17); whether 30 rows — 15 per compared
half — is the right base for a **dispersion** estimate is exactly R-5's length half and is
presented, not answered. One structural fact the ruling should have: any future Layer-1 prompt
change **appends an extraction-regime boundary** (`SETTLED_REGIME_BOUNDARIES`,
`trajectory-delta.ts:167-223`, append-only; the set a live window segments on is flag-dependent
via `activeRegimeBoundaries(...)`, `:243-250`), re-segmenting every window — a variance signal
inherits the regime discipline or silently compares across instrument changes.

### 2.6 The survivorship half of R-5 — now grounded in primary data, with bounds

The opening record's n=1 harness table (session `828ee5d0`: 8 of 39 at-action consults
delivered; 7 of 8 delivered readings `principled`) is **client-side** data, and its own warning
was that the delivered subset may be systematically the simpler actions. Two verified facts
advance this:

1. **Server persistence is independent of client delivery.** The examined/observed split
   (ADR-013 §8, 2026-08-08 amendment) exists precisely because the server completes extraction
   — and persists — after the harness's 28s client timeout has already fired.
2. **A read-only production query (2026-08-15, this session):** the same credential's
   (`sagereasoning:s9-loop@v1`) `agent_assessment_history` rows over 2026-08-12 → 08-14 number
   **143**, with proximity distribution **60 `deliberate` / 61 `principled` / 14 `sage_like` /
   8 `reflexive`** — visibly non-uniform.

**Stated with its bounds:** the 143 rows span every session and consult class of that credential
across three days, not only the logged session's 39 at-action attempts; rows carry no session
**identity** and no delivery marker (the flag-gated `session_marker` column of §2.4 names a
session *phase* — open/mid/close — not which session), so no row-level mapping to the harness
log is possible. What the query
establishes at window level: **the near-uniform "7 of 8 `principled`" delivered subset was not
representative of the server-side record — the survivorship warning is confirmed as a real
selection effect, not a hypothetical.** And it reframes the source question: the server-side M7
window does **not** inherit the ~80% client-delivery loss, but it carries two completeness
bounds of its own — (a) consults that fail server-side (rate-limit/outage) produce no row, and
(b) rows include examinations whose framing was never delivered to the agent (the observed
class), so variance over the window measures the pipeline's scoring of submitted actions, not
necessarily the agent's *engaged* practice. Because aah rows carry no delivery marker, **a
variance signal over the M7 window cannot condition on delivery** — a named honest limit for
R-5, not a design proposal to add one.

The n=1 limitation stands as the record ordered: one session's harness figures, one credential's
three-day window — observations, not a distribution to design against.

### 2.7 Melete's half — the verified state of the rehearsal side

The human side has three live proactive surfaces (`/morning`, `/premeditatio`'s "Prepare a
disposition", `/sage-compass`). **The agent side has no rehearsal surface at all** — its live
mechanisms (Gate-1 frames, reflect, discernment, the calling gate) are advisory-at-action,
retrospective, or declarative; none rehearses a response to an impression before it arrives.
The ruled constraint binds: drift and melete are one axis, scoped together or not at all. The
decision space R-4 therefore actually has:

- **(i)** melete measured as the **positive sign of the same range signal** — does
  discrimination widen with practice? (No new surface; the same honesty questions as R-3/R-5.)
- **(ii)** an agent-side rehearsal surface designed first, so there is a rehearsal *practice*
  whose effect a signal could measure. (A separate scoped session if ever elected; not designed
  here.)
- **(iii)** rule that melete's measurement is deferred until (ii) exists — the one-axis
  constraint honoured by this document scoping both halves now, as ordered.

### 2.8 The second axis (R-6) — where subject-matter dispersion can and cannot compute

- **On the trust-record side: it cannot** (beyond coarse proxies) — §2.4: no action text, no
  subject record.
- **On the loop's own ledger: it can.** `idea_loop_candidates` persists, per candidate:
  `heuristic`, **`proposed_action` (the full text)**, `classification_kind`,
  `classified_domains`, `generation_confidence`, `guardrail_proximity`, `guardrail_domains`,
  novelty fields, `cycle_outcome` (`idea-loop-watching-store.ts:126-141`). Subject-matter
  dispersion over the loop's proposals is computable read-side from rows already persisted — a
  **per-loop** measure on the watching ledger (which has, by design, no bearing on any agent's
  public trust record), distinct in kind from a **per-agent** trust-record measure.
- **The nearest live mechanism:** the novelty gate already computes per-candidate structural
  novelty over the credential's own 90d/30 window — the windowed read + honest-503 on read
  failure at `fresh/handler.ts:348-357` and the per-candidate map at `:363-372`; the honest
  starved-window rule itself (`{ novel: true, confidence: 0, basis: 'insufficient_history' }`
  below `EVIDENCE_FLOOR = 3`, imported from `trajectory-delta`) lives in
  `assessStructuralNovelty` (`idea-loop-types.ts:208-241`). A range reading is close to an
  aggregate over what this gate already sees — named as a mechanical fact, not a proposal.
- **The governing correction, carried verbatim in substance:** the research this axis derives
  from optimises for *more original ideas*; the practice optimises for *examining accurately*,
  which sometimes means fewer proposals and sometimes withholding assent entirely. The ruled
  null cycle is a legitimate outcome, not a failure to be optimised away. A range signal whose
  consumers read "narrowing" as "produce more variety" would invert the instrument — which is an
  argument bearing on *where and to whom* any such signal is served (R-3's landing question),
  presented for the ruling.

### 2.9 Candidate landing surfaces (PR20 — surfaces, event effects, evidence gates, public-vs-ledgered, posture)

For each mechanism the ruling might select, what it would actually touch. All are MEASURE-only
by standing constraint; **weights remain BLOCKED**; none binds anything.

**M-A — Documentation only: an explicit `does_not_attest` item.**
Files: ADR-013 §8 (dated amendment), `trust-record-payload.ts:52-61` (the `does_not_attest`
array — pinned object-identical by the S10 battery,
`s10-trust-record-surface.test.ts:265`, so the battery moves with it), R18 surfaces
(`llms.txt`, `agent-card.json`, api-docs) under founder wording sign-off. No event, no fold, no
schema, no flag. Public by definition (the envelope ships on every trust-record GET).

**M-B — A dispersion member inside the AE-1 delta (`meta.trajectory.delta`).**
Files: `trajectory-delta.ts` (+ its types and battery), R18 docs. No schema (computable from
§2.4's columns — the AE-1 posture). Inherits the evidence floors, the regime segmentation, and
the `*_basis` discipline by construction. Served only on credential-bearing `/api/reason`
consults (the agent's own overlay), not on the public trust record. Flag discipline: the
shared-flag lesson (2026-08-12) applies — a new member riding `SUBSTRATE_TRAJECTORY_DELTA_ENABLED`
is live the moment it deploys; per-feature darkness needs its own flag. Event effects: none.

**M-C — A field on the public trust-record payload (S10 surface).**
Files: `trust-record-payload.ts` + the trust-record route + the S10 battery + R18 docs. This is
the maximal-honesty-stakes surface: a public per-agent claim about range, which makes an §8
envelope amendment (M-A) a **co-requisite, not an alternative** — the payload cannot serve a
range reading while the envelope is silent on what range claims mean. The orientation-readings
precedent governs presentation mechanics (capped list, inline not-attestable clauses,
total-count disclosure). Event effects: none (a read-time composition).

**M-D — A ledgered observation class (the orientation-reading emission precedent).**
Files: `emission-hooks.ts` (a new emitter on the **`emitLedgerOnlyTrustEvents` INSERT-ONLY
path** — `emission-hooks.ts:452-458`: never the generic fold path, never seeds state, never
stamps the reflect timestamp), an `event_type` CHECK-widening migration (founder-walked; the
2026-08-12 staleness lesson binds: re-derive the live constraint via `pg_get_constraintdef`,
never trust a migration file's own comments), and a served-or-ledgered-only decision that
determines whether M-C/M-A ride along. Fold/seed interaction, stated per PR20 even though this
path avoids it by construction: the generic fold seeds a **new domain row at a
`habitual`/high-volatility prior for any event folding into an unexamined domain**
(`trust-core-store.ts:375-380`) — which is precisely why the insert-only path exists and why
the emission-path choice is load-bearing, not cosmetic.

**M-E — Nothing is built; the gap is ruled out-of-envelope.**
The record cannot honestly measure discriminative range given the extraction starvation the
delta module already discloses, the survivorship bounds (§2.6), and the perturbation problem
(§2.2) — so the honest artifact is the disclosure (M-A) or nothing at all. Presented as a live
option, not a fallback.

**Melete-positive variants** ride the same surfaces (a widening trend is the same signal read in
the building direction). **The R-6 loop-ledger range measure** is read-side over
`idea_loop_cycles`/`idea_loop_candidates` — post-run only (the tables are fenced while the run
is in flight, and execution is post-run per M2 regardless); a *served* form of it would need its
own scoping.

### 2.10 The Seneca criterion — where it could land, and what it cannot yet bind on

The Senecan frame is live on both sides (`baseline-assessment.ts:63-68` human;
`sage-assent-wrapper.ts` `SenecanGradeId` / `DEFAULT_STARTING_GRADE: 'pre_progress'` and
`agent-hand-back-report.ts` agent-side), so a ruled criterion has vocabulary to land on. But the
criterion is **relapse-resistance under perturbation**, and (§2.2) no current signal introduces
or conditions on perturbation; a dispersion signal gains its Senecan meaning only when read
against input variety — which is the R-6 axis. **The two axes need each other:** reading-
dispersion without subject-dispersion cannot distinguish tested stability from untested
uniformity; subject-dispersion without reading-dispersion cannot say whether varied inputs were
discriminated. This is the strongest structural argument for ruling them as one family, and it
is presented as structure, not as a recommendation to build either. Any coupling of a variance
signal to the **grade engine** would additionally sit downstream of the grade hysteresis
(§2.3, row 1) — the exact conflation the warning names — so grade-coupling is flagged as the
highest-risk landing of all, and nothing here proposes it.

---

## 3. Recommendation posture

The opening record pre-answers nothing and licenses no recommendation; none is made. Constraints
restated rather than recommended: scope items 1 and 2 are one axis (same ruling or neither);
scope item 3 precedes any build; the n=1 data are observations, not a distribution; weights
remain BLOCKED; every candidate mechanism is MEASURE-only.

## 4. Not asked / out of scope

- GS-ATRF-1/2/3; the four QG rulings; B1's §2.12; the S6 frozen null result; the
  `high|medium|low` blast-radius vocabulary.
- The guide-reflection recurring-corroborated-patterns reading — **listed in §1 as parked here
  by M7 6b; deliberately not designed** (*"Do not design it now"*).
- The `disposition_stability` dimension itself: §2.2 names its valence as scope input; no
  redesign of it is proposed or implied.
- The harness at-action outage rate (~79% in the logged session) — an operational matter with a
  documented mitigation knob (`GATE1_ACTION_TEXT_MODE=lean`), the founder's open call since
  2026-07-30; not this session's to fix.
- The S11 flip and its readiness standard; the false-hold instrument and its frozen buffer.
- Any schema change (none is needed for reading-dispersion — §2.4 — and none is proposed).
- The run's fenced surfaces; the Q1 hard constraint (the loop proposes; it never executes)
  stands.

## 5. Sequencing

Per M2, verbatim: *"The sessions produce the document. The mentor rules on the document.
Execution folds into post-run sessions after the ruling."* If M-D were ever selected, its
migration is founder-walked with the full `§PRE`/`§APPLY`/`§VERIFY`/`§INVERSE` discipline; if
M-C, the §8 amendment travels with it; the R-6 loop-ledger measure is post-run by fence and by
M2 alike. Nothing in this document starts anything.

*End of scope document.*
