# SCOPE DOCUMENT — Kathêkon: role-relative candidate evaluation (for mentor ruling)

**Date:** 2026-08-15. **Produced by:** concurrent-arc session C2 (scoping session A), under the
M2 ruling of 2026-08-15 (*"The AI runs each session and produces a scope document for ruling…
The sessions produce the document. The mentor rules on the document. Execution folds into
post-run sessions after the ruling."*). **Input record:**
`2026-08-12-SESSION-kathekon-role-relative-evaluation-SCOPING-RECORD.md` (its boundaries are
honoured in full). **Status: RULED 2026-08-15** — Ruling Set A, verbatim canonical:
`2026-08-15-mentor-rulings-C2-scope-documents-verbatim.md` (R-1 yes-conditionally; R-2 D-i;
R-3 option-F source, C6 satisfied; R-4 pre-filter, winner rule not amended; R-5 option B
adopted, wording in hand, founder sign-off required; execution post-run per M2). As authored,
this document decides nothing, builds nothing,
and self-starts nothing. Every mechanism named below was verified against the code first-hand on
2026-08-15 (file:line citations throughout); nothing is restated from records alone.

---

## 1. The question for ruling

Verbatim, as ruled open on 2026-08-12:

> Should the IDEA loop's candidate evaluation be role-relative, and if so, by what mechanism,
> given that `/api/guardrail` takes no role input and the ruled winner rule is "highest proximity
> among novelty-passers"?

The question decomposes into severable sub-questions. Stating them separately is structural,
not a recommendation about how to answer them:

- **R-1 (whether):** Should candidate evaluation be role-relative at all?
- **R-2 (locus):** If yes — at which layer: the extraction input, the deterministic engine, or
  the loop's own selection pipeline?
- **R-3 (source):** From where may a role signal legitimately come, given the C6 bounded set?
- **R-4 (winner rule):** Does the chosen mechanism amend the ruled winner rule — and if so, is
  that amendment being made explicitly (the QG-D discipline)?
- **R-5 (naming honesty, severable):** Independently of R-1–R-4: the live public surface serves
  `is_kathekon` / `kathekon_quality` computed role-blind, while the doctrinal ground the opening
  record cites (Cicero, *De Officiis* 1.107–115; DL 7.107–108) holds kathêkon to be
  role-relative by definition — *"an assessment blind to role is assessing conformity to a
  general standard — a different thing, which should not carry the same name."* Whether the
  public naming should carry a role-blindness qualification can be ruled even if R-1 is answered
  "no" or "not yet."

---

## 2. Verified mechanics (PR20 — first-hand, 2026-08-15)

### 2.1 The live evaluation path takes no role input — and injects no caller identity at all

- **Request shape** (`website/src/app/api/guardrail/route.ts:105`):
  `{ action, context, threshold = 'deliberate', agent_id, risk_class, urgency_context,
  considered_alternatives }`. No `role`, no `purpose`, no `orchestrator_profile`, and no
  `loop_id` body field. One precision: the route DOES accept a caller-supplied continuity key
  as the CI-10 **`X-Loop-Id` metering header** (`route.ts:34-36`; validated UUIDv4 in
  `loop-cost-tracker.ts:512-525`, server-generated otherwise) — an existing caller-asserted
  channel, but a metering identity only; it never reaches the evaluation.
- **`agent_id` never reaches the evaluation.** It is consumed only by the CI-10 billing
  accumulator (`route.ts:114`) and as analytics-event metadata (`:322`, `:512`), and is
  documented as "(optional) Your agent identifier for tracking" (`:604`). There is no path by
  which caller identity conditions the verdict.
- **The live branch is the signed sandwich** (`route.ts:174-183`;
  `SUBSTRATE_GUARDRAIL_SANDWICH_ENABLED=true` in production since 2026-06-19). Its evaluation
  inputs are exactly: `action`, the caller's free-text `context` (≤5,000 chars, `:143-146`),
  `urgency_context`, a **server-composed** `domain_context` string (`"This is a
  ${resolvedRiskClass}-risk agent action safety-gate evaluation."`, `:175`), and `threshold`.
  These feed one Layer-1 extraction under the **shared Layer-1 system prompt** — built per call
  by `buildLayer1SystemPrompt(...)` (`layer1-extractor.ts:2249`; the exported
  `LAYER1_SYSTEM_PROMPT` constant is the flags-off snapshot retained for consumers), the same
  builder `/api/reason`'s extraction uses via `extractFeatures` — then the deterministic
  Layer 2.
- **A correction to a claim that could otherwise mislead the ruling:** the
  `getProjectContext('minimal')` call at `route.ts:389` — and the accepted-risk comment that
  external agents "will receive SageReasoning's identity + ethical commitments on every call"
  (`:51-57`) — belong to the **dormant legacy branch** (flag-off path). On the live sandwich
  branch, no project identity, no practitioner context, and no caller identity enter the
  evaluation. Role-blindness on the live path is complete in both directions: the evaluation
  knows neither whose proposal it is nor whose standard it serves beyond the Stoic frame itself.
  (Consequence: the mentor's existing `projectContext`-removal ruling for API-key `/api/reason`
  calls has no live counterpart needed on this route; the legacy branch's retention of it is
  named here for completeness, not scoped.)

### 2.2 The runner reality — the "candidate evaluation" is a prose protocol, not code

Verified against the scratch project (read-only) on 2026-08-15:

- **There is no runner code.** `idea-loop-validation-run/` holds Markdown + JSON only; the
  runner is a Claude session executing the ruled protocol by hand-issued `curl`. Every
  "mechanism" on the loop side is therefore a prose contract plus protocol compliance, not an
  enforcement path.
- **What is actually sent per candidate:** `action` (the candidate text) and `context`
  (`watching-wire-contract.md:15-31`). The only verbatim `context` observed in the run log names
  the run, cycle, gap, heuristic, and domain (`RUN-LOG.md:1610-1613`) — it never states what the
  loop is for or what it is authorised to propose. `threshold` and `risk_class` are never sent
  (server defaults `deliberate` / `standard` apply).
- **The ruled pipeline order:** guardrail → novelty (`POST /api/practice/fresh`) → winner
  selection. A guardrail-rejected candidate never reaches novelty (`RUN-LOG.md:3322`); only
  novelty-passers are ranked; the M6 tie-break is `r mod n` over candidates tied at highest
  proximity, in heuristic order (`RUN-LOG.md:338-341`). The friction-only M4-b mode is in force
  as of cycle 18 (`RUN-LOG.md:329`): all heuristics still run guardrail + `fresh`, but only
  heuristic 7's survivors enter winner selection.
- **No role/remit declaration exists anywhere on the loop side.** Grep across the scratch
  project's governing documents returns no `role`/`remit`/`purpose`/`orchestrator` declaration.
  The gap the loop works toward (circle 2→3) is human-authored and fixed for the run, but never
  transmitted on any evaluation call.
- **One observed-generation-inputs note, flagged and not adjudicated here:** the generation
  step's observed inputs are the shared task list (read), cycle history (read from
  `RUN-LOG.md` prose, not the DB), and the hand-curated `capability-inventory.md` as the
  corpus heuristics 1–4 generate against; the credential-scoped examination history and the
  loop's own public trust record — both in the C6 bounded set — have never been fetched in 17
  cycles. Whether the hand-curated inventory sits inside C6's bounded set as stated is a
  run-protocol observation that belongs to the §6 report (R1), not to this document's question;
  it is named here only because C6 is load-bearing for R-3 below.

### 2.3 Where role exists today — three places, none reaching the candidate path

1. **The human surface:** `/morning` — the page asks the practitioner to name "the roles you
   carry today and what each asks of you" (`website/src/app/morning/page.tsx:174-175`), and its
   route contract names the doctrine explicitly: *"`roles_active` (required) — the roles active
   today + the kathekonta they generate"*
   (`website/src/app/api/mentor/morning/route.ts:88`). Explicitly role-indexed; human-only.
   (The opening record cited `page.tsx:174` for the kathekonta wording; verified first-hand,
   that wording lives on the route contract — the point survives, the citation is corrected
   here.)
2. **The harness calling gate (G1):** `orchestrator_profile.purpose` in
   `harness/gate1-pre-decision/claude-code/discernment.config.json` — a **harness-side config
   surface**, read by the harness's own hooks (`hooks/lib/discernment.mjs`), never a route
   input. The IDEA-loop runner has no harness and no such config.
3. **The mint-time provenance channel (exists, carries no role today):**
   `api_keys.credential_provenance` (jsonb) — the consumer-unforgeable, operator-declared
   attribute channel (the `examination_enforcement: pre_decision_harness` precedent). No role or
   remit attribute is defined on it today.

### 2.4 What "role-relative" would land on — the kathekon predicate, stated explicitly

The canonical kathekon-engagement predicate is `assessKathekonEngagement`
(`website/src/lib/substrate/trust-core/kathekon-engagement.ts:158`) — the ONE shared function
the eventual **S11 G6(a) flip binds on** (its own header, `:5-10`), with two mentor-mandated
Arm-1 narrowings already layered (R11 zero-circle; the 2026-07-19 self-circle narrowing). Its
live consumers, verified: the AE-2 `loop_fold` (`trust-core/loop-fold.ts:608`, LIVE MEASURE),
the A1 practice-suggestion basis (`practice-suggestion.ts:717`, LIVE), the false-hold instrument
(`harness/.../false-hold-capture.mjs`, `at-action-hook.mjs`, and
`website/scripts/false-hold-observation-report.ts` — including the frozen 130-record buffer,
classified under the current predicate), and the future S11 flip.

**Stated explicitly, as the session prompt requires: any change to `assessKathekonEngagement`
re-opens the S11 flip-readiness questions.** The mentor's four-part readiness standard includes
a measured false-hold rate; that rate was measured under the current predicate, so a
role-relative redefinition of kathekon-engagement would invalidate the comparability of the
frozen buffer and any new observation window opened before the change. It would also alter two
live MEASURE surfaces (AE-2, A1) in the same edit. **No option in §3 proposes changing this
predicate.** It is named because "role-relative kathêkon evaluation," taken literally at the
engagement layer, would land here — and the ruling should know the cost of that landing before
choosing any option that implies it.

### 2.5 Event effects, fold/seed, and posture (PR20)

- **The guardrail path emits no trust events.** Its only writes are CI-10 loop metering
  (`loop_billing_events`) and analytics. No fold, no seed, no trust-state interaction — a role
  mechanism confined to `/api/guardrail` touches no trust-ledger mechanics.
- **The shared-prompt coupling is the real blast radius.** If a role signal were threaded into
  the shared Layer-1 system prompt (`buildLayer1SystemPrompt`), the change reaches
  `/api/reason`'s extraction too — which feeds the signed assessments, the orientation-reading
  events, and the M7 trajectory rows — and **appends an extraction-regime boundary**
  (`trajectory-delta.ts:167-223`, `SETTLED_REGIME_BOUNDARIES` — append-only, two entries today;
  note the boundaries a live delta window actually segments on are additionally
  **flag-dependent** via `activeRegimeBoundaries(agentCirclesEnabled)`, `:243-250`),
  re-segmenting every delta window. A
  guardrail-only threading (a new sandwich param folded into the extraction *user* context, the
  way `context`/`domain_context` already are, `guardrail-sandwich.ts:369-375`, `:443-445`) does
  not change the shared prompt builder and avoids that consequence. The distinction matters to
  R-2.
- **MEASURE/ENFORCE, honestly:** everything server-side stays MEASURE. But within the loop's own
  ruled protocol the guardrail verdict is **binding in effect** — a rejected candidate never
  reaches novelty. That binding is protocol compliance by the runner (prose, self-applied), not
  server enforcement. Any role mechanism inherits this posture: on the loop it would bind by
  protocol; on the server it binds nothing.
- **The Q1 hard constraint is unaffected by every option below:** the loop proposes; it never
  executes. Weights remain BLOCKED.

### 2.6 Live phenomenology from the run (observed data; one run; cause not diagnosed)

The run log documents the shape the question predicts, and honesty requires it be presented as
observation, not diagnosis:

- A recurring rejection/hint class in which the guardrail applies the control filter **in the
  first person** to proposals whose entire remit is system change: *"'adding an honest
  extraction-confidence note…' is outside prohairesis. Only my judgement, impulse, and response
  to it are within"* (`RUN-LOG.md:1739-1748`, cycle 6); the same hint form recurs at cycles 14,
  16, and 17 — on passes as well as rejections (`RUN-LOG.md:3146-3149`, `:3476`, `:3634-3637`).
- The runner's own precision: the pattern does **not** cleanly explain the pass/fail split —
  candidates "phrased identically in kind" passed the same cycle (`RUN-LOG.md:1747-1748`). It is
  recorded as "a pattern named for the report, not a diagnosed cause" (`:1749-1753`).
- The sharpest single instance: cycle 15, h7 — floored to `reflexive` with the run's first real
  passion extraction (`root_passion: "lupe"`, false judgement *"An irreversible evil has
  befallen me"*) read from a proposal's ordinary engineering framing ("a failure mode that has
  already cost a full session once") (`RUN-LOG.md:3309-3318`). A role-blind reading attributed a
  grief register to a design proposal.

These observations bear on R-1 (is there a real cost to role-blindness?) without settling it —
the same log shows role-blind evaluation rejecting nothing the loop was entitled to (the ruled
shape held; null cycles remain legitimate outcomes).

---

## 3. The decision space (presented, not recommended)

The opening record states its own posture — *"it does not propose a mechanism, recommend a
direction, or rank the options"* — and this document inherits it. Options are presented with
their surfaces and trade-offs; none is ranked.

**A. Keep role-blind evaluation; change nothing.**
Surfaces: none. The doctrinal naming tension in R-5 stands as-is: the public surface continues
to serve `is_kathekon`/`kathekon_quality` computed against a general standard.

**B. Keep role-blind evaluation; qualify the public naming (R-5 alone).**
An R18 disclosure that the served `is_kathekon`/`kathekon_quality` read role-blind conformity to
a general standard, kathêkon proper being role-relative (Cicero 1.107–115).
Surfaces: the guardrail GET self-doc (`route.ts` ~`:595-640`), `llms.txt`, the `agent-card.json`
guardrail extension; founder R18 wording sign-off; no code-path change; no event effects; no
fence contact (and execution is post-run regardless, per M2).

**C. Role as caller-supplied free text in the existing `context` field.**
A runner-protocol change only: the loop states its remit in `context` on each evaluation call.
Surfaces: the scratch project's wire-contract prose; zero server change. Trade-offs, honestly:
the role claim is **self-report through extraction** — unverifiable by construction (the same
class as the disclosed A2 extraction-trust ceiling: any caller can claim any role; the
corroboration check has nothing to corroborate it against). C6 question for R-3: the loop's
remit statement would derive from the human-authored run protocol — whether that counts as
inside the bounded set ("shared task list, cycle history, credential-scoped examination history,
its own public trust record") or requires C6 to be re-opened is presented, not answered.

**D. A structured role/remit input on `/api/guardrail`, threaded into extraction.**
Surfaces: the route contract (`route.ts:105` destructure + validation), `guardrail-sandwich.ts`
params (`:369-375`) and its extraction-context threading (`:443-445`), R18 docs on all three
public surfaces, battery. Two sharply different sub-shapes: **(D-i)** guardrail-local threading
into the extraction user context — no shared-prompt change, no regime boundary, `/api/reason`
untouched; **(D-ii)** a change to the shared Layer-1 prompt builder
(`buildLayer1SystemPrompt`) teaching the extractor to read role — reaches every extraction
surface and **appends an extraction-regime boundary** (§2.5), with
everything that implies for the M7/delta windows. Verifiability is unchanged in both (still
caller-asserted) unless paired with E. Fence note: the route contract is fenced while the run is
in flight; execution is post-run per M2 in any case.

**E. Role from mint-time `credential_provenance` (the `examination_enforcement` precedent).**
The operator declares the credential's remit at mint; the route reads it from the validated
credential and supplies it to the evaluation server-side — the role claim becomes an
**operator attestation** rather than caller free text (consumer-unforgeable in the same sense as
the pre-decision marker). Surfaces: the mint route/CLI, `practice-credential.ts` (surface the
provenance on the validated result), `route.ts` (read + thread), R18 docs; no schema change
(`credential_provenance` is existing jsonb). E is a **source**; it needs D's threading (either
sub-shape) to reach the evaluation. Honest limit: it attests what the operator declared, not
what the agent is doing this call.

**F. Role-relative evaluation at the loop layer (a remit gate in the ruled pipeline).**
A pass/fail remit check alongside the novelty gate, before winner selection — prose-protocol
only, self-applied by the runner, role sourced from the human-authored protocol/task-list side
(the natural C6-legal home: the shared task list is already a ruled generation source).
**The QG-D precedent bears directly and is the reason this option cannot be adopted by
implication:** QG-D rejected a selection-time *weight* because it "would modify the ruled winner
rule." A remit *gate* would make the winner rule "highest proximity among novelty-AND-remit-
passers" — whether that is an amendment of the ruled rule (the mentor's to make explicitly,
never assumed by a build) or a permissible pre-filter of the candidate set is exactly R-4, and
only the mentor can say.

**G. Rule that the question is real but waits for the standing-runner design (R8).**
The standing runner is where a genuine calling surface (an `orchestrator_profile`-class
declaration) could exist by design rather than retrofit. R8 is gated on the mentor's ruling on
the §6 report (Q10/Q11) — so this option sequences the role question into a design context that
does not yet exist, and leaves the current run's record role-blind, honestly labelled (B remains
available alongside G).

---

## 4. A boundary kept, verbatim

**Kathêkon-appropriateness is not a blast-radius question.** Blast radius asks *how far does
this reach* (a magnitude); kathêkon-appropriateness asks *is this mine to do, here, now* (a
relation between action and role). They come apart in both directions. Nothing in this document
touches, shortens, or folds into the two settled blast-radius names — the **loop-level
blast-radius proxy** and the **permission-layer blast-radius enrichment** — and nothing here
enlarges GS-ATRF-1, whose ruled four-virtue answer stands untouched.

---

## 5. Recommendation posture

The opening record licenses no recommendation, and none is made. One structural observation
only: **R-5 is severable** — the naming-honesty question can be ruled independently of whether,
where, and how evaluation becomes role-relative, because it concerns what the live surface
*claims*, not what it computes.

## 6. Not asked / out of scope

- GS-ATRF-1, GS-ATRF-2, GS-ATRF-3 (all remain open; none touched).
- The four QG rulings; B1's §2.12 requirement; the S6 frozen null result; the
  `high|medium|low` blast-radius vocabulary.
- The ruled winner rule itself — presented under R-4 only as the amendment question; not
  re-opened here.
- The kathekon predicate's four arms and both Arm-1 narrowings (named in §2.4 as a landing
  surface to be avoided or knowingly entered — not proposed for change).
- The S11 flip, its readiness standard, and the frozen false-hold buffer.
- The `projectContext`-removal ruling (already made for `/api/reason`; §2.1 records that the
  live guardrail path has no counterpart to remove).
- The run itself: no fenced surface is touched; the Q1 hard constraint (the loop proposes; it
  never executes) and the weights block are restated, not revisited.
- The generation-inputs observation in §2.2 (flagged to the §6 report, not adjudicated here).

## 7. Sequencing

Per M2, verbatim: *"The sessions produce the document. The mentor rules on the document.
Execution folds into post-run sessions after the ruling."* Whatever is ruled: route-contract and
public-docs changes execute post-run (they are fenced or R18-gated in any case); runner-protocol
changes belong to post-run or to the standing-runner design; nothing in this document starts
anything.

*End of scope document.*
