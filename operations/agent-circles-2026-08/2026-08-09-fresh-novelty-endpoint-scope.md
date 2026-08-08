# Scope: `fresh` — the novelty-check endpoint (Q2's ruled shape, scoped as its own small item) — RULED

**Status: RULED by the mentor, 2026-08-09 — §1 confirmed unchanged; every §2 proposal confirmed (§2.5/Q-C with a named build-time wiring detail); Q-A/Q-B/Q-C all ruled; the sequence advances to `watching` (the per-cycle record table).** Verbatim record, which wins over every annotation below: `2026-08-09-mentor-consultation-fresh-endpoint-scope-rulings-verbatim.md`; decision-log `D-FRESH-ENDPOINT-SCOPE-RULED-2026-08-09`. Rulings folded as inline **RULED** annotations under each §2 subsection and in §3; proposal prose kept, marked ruled rather than deleted (the predecessor session's precedent). **Nothing here licenses a build, a route, a flag, a credential, or a schema — the first build gate sits after `watching` and the generation-step scope document.**

**Session:** 2026-08-09. Tier: `governance` / design (explore-scope). **This is a scope document, not a build.** No code, schema, flag, credential, or public-surface change accompanies it. The committed-but-dark `website/src/lib/substrate/idea-loop-types.ts` is read here, never edited (the Q6 seventh-value amendment remains a named code follow-up for the next code session that touches the module — the mentor confirmed it is plausibly `fresh`'s own build session, and instructed it be named explicitly in that build prompt).

**Position in the ruled sequence (Q11, binding):** brief ruled *(2026-08-09)* → `fresh` endpoint scoped and **RULED (THIS DOCUMENT, 2026-08-09)** → **per-cycle record table (`watching`) scoped — NEXT** → generation-step scope document → first build gate → bounded validation run (mentor-reviewed) → only then any standing-runner design.

**The Q1 hard constraint, carried as required in every document of this sequence: the loop proposes; it never executes.** Nothing in this endpoint touches that line — `fresh` classifies candidates' structural novelty; it neither executes nor recommends execution of anything.

**Naming:** the endpoint's settled surface name is **`fresh`** (no switch suffix — a server-side seam wrapping `assessStructuralNovelty`; no independent human-switched operational state), per the SETTLED SURFACE NAMES register (`D-PROJECT-CONTEXT-MENTOR-UPDATE-APPLIED-2026-08-09`).

**Sources (verbatim wins):** the Q2 ruling (`2026-08-09-mentor-consultation-autonomous-loop-design-brief-rulings-verbatim.md`); the ruled brief §1.6/§3 items 1–2/6/§8 Q2/Q5 (`2026-08-08-autonomous-loop-design-brief.md`); the approved novelty specification (C2 scope §3, `2026-08-06-c2-orientation-reading-and-c1c-trust-event-scope.md`); the C2-widening prebrief ruling 3 (`D-IDEA-LOOP-PREBRIEF-RULINGS-C2-WIDENED-2026-08-05`) — the source of the query-shape/floor fix, distinct from Q2 (see §1 item 2's provenance note); the committed code, read first-hand per PR20 (`idea-loop-types.ts`; `trajectory-delta.ts`; `agent-assessment-history-store.ts`).

**PR19 adversarial review (run before relay):** a three-dimension independent review (Q2-fidelity; structural-novelty-limitation + PR20 mechanism-fact verification; boundary compliance) with per-finding adversarial verification ran on this scope — 11 agents, 0 errors; 8 findings raised, **8 confirmed, 0 refuted** (1 medium, 5 low, 2 nit; boundary-compliance dimension returned 0 findings — the document contains no build artifact and stays inside the Q11/§7 boundary). All eight are folded below, cited inline as **[PR19]**.

---

## 1. What Q2 settled — consolidated, cited, not re-opened

> **RULED 2026-08-09 — all five items confirmed unchanged, no re-opening.** *"The two closed alternatives — runner-side computation and flag-gated guardrail extension — remain closed. The Q1 hard constraint is correctly carried."*

1. **The endpoint is new and dedicated.** *"A dedicated endpoint wrapping the committed-but-dark assessStructuralNovelty is the cleanest shape"* (Q2 ruling, verbatim).
2. **It wraps the existing dark pure function, which is not re-designed here.** `assessStructuralNovelty` (`idea-loop-types.ts:202-234`) is committed at HEAD, dark and unconsumed; it implements the approved C2(iii) specification (structural novelty over the candidate's `targetCircle` + sorted virtue-domain combination, against a windowed history row set, reusing `trajectory-delta.ts`'s exact `EVIDENCE_FLOOR = 3`). **[PR19, F2/q2-fidelity, low — provenance correction]** the query shape and the floor value are fixed by the **2026-08-05 C2-widening prebrief ruling** (`D-IDEA-LOOP-PREBRIEF-RULINGS-C2-WIDENED-2026-08-05` ruling 3), restated in the C2 scope document — **not by Q2**, which addresses only the endpoint's home. *"The exact confidence curve is a build-time detail the ruling leaves open"* (C2 scope §3) — see §2.5 for the one curve question this scoping surfaces for ruling.
3. **It is server-side**, per the ruled per-cycle contract — SageReasoning provides *"the examination, the novelty check, and the trust-event write"* per cycle (the 2026-08-05 architecture ruling, restated in Q2).
4. **The two alternative homes are closed:** runner-side computation against exported history is **ruled out** (*"would move a server-side responsibility to the runner and break the clean separation"*); a flag-gated guardrail-response extension was considered and **set aside** (*"adds complexity to an already load-bearing endpoint"*).
5. **This scoping is a server-side seam question, not generation content** — hence its own small item ahead of the generation-step scope document (Q2 + Q11).

Nothing in that list is proposed for re-opening below.

---

## 2. Proposals for the mentor (PROPOSAL throughout — nothing decided here)

### 2.1 Route path and method

**PROPOSAL:** `POST /api/practice/fresh` — the settled surface name as the terminal segment, housed under `/api/practice/` beside the existing agent-facing practice seams (`/api/practice/discernment`, `/api/practice/reflect`). POST rather than GET because the request carries a candidate batch (a body), and because the practice family's compute seams are POST. Handler-split into `handler.ts` + a thin `route.ts` per the Next route-export rule (memory `nextjs-route-export-validation`).

*Alternative named, not preferred:* a top-level `/api/fresh`. Set aside because the practice prefix states what the surface is (an agent-practice seam) and keeps the R20a perimeter reasoning uniform with its siblings.

**RULED 2026-08-09 — confirmed as proposed.** *"POST /api/practice/fresh confirmed. The practice prefix is correct — this is an agent-practice seam, and uniformity with the sibling routes is the right posture. Handler-split into handler.ts and thin route.ts confirmed per the Next route-export rule."*

### 2.2 Auth — capability class and transport

**PROPOSAL:** UPC **`consult`** capability via the `validatePracticeCredential` chokepoint, **Bearer-only** transport — the exact discernment-route posture. Reasons: (a) Q3 rules the runner presents **a dedicated credential + K1 agent identity, scoped at the runner's own scoping session** — so this document names the capability class only and mints nothing; (b) reusing `consult` means the runner credential needs no new capability value, no mint-surface change, and no `api_keys` CHECK widening; (c) the endpoint reads only the presenting credential's own history and writes nothing, so the narrowest existing read-class capability fits; (d) Bearer-only keeps the practice family's transport uniform even though nothing here strictly requires the write-class discipline.

**Named question for the mentor (Q-A):** is `consult` reuse acceptable, or does the mentor want a dedicated capability value (e.g. finer per-surface revocability for the runner credential)? The AI recommends reuse; revocation granularity is already per-credential, and the runner's credential is dedicated per Q3.

**RULED 2026-08-09 (Q-A) — consult reuse confirmed.** *"The AI's recommendation is correct. Per-credential revocability already provides the granularity the runner credential needs, and the runner's dedicated identity per Q3 means reuse introduces no cross-credential entanglement. No new capability value, no mint-surface change, no api_keys CHECK widening. Bearer-only transport confirmed for uniformity with the practice family."*

### 2.3 Request shape — and whose history the check reads

**PROPOSAL:** the request carries **only the candidates' two structural axes** — exactly the `Pick<GeneratedCandidate, 'targetCircle' | 'initialClassification'>` the pure function takes — as a **batch** (an array, one entry per guardrail-surviving candidate), plus the `gapRef` echoed per entry for the runner's own correlation. Batch because Phase 3 runs novelty on *all* guardrail survivors of a filtering pass, and one call per pass amortises the single windowed read; input caps (max candidates per call, max `gapRef` length) are build-time details under the house input-cap pattern. **[PR19, F4/structural-novelty-and-pr20, low]** the earlier phrase "up to seven" (one candidate per `GenerationHeuristic`, which has exactly seven values) is an **unverified inference from the type's cardinality, not a traced fact or a ruled cap** — the generation step is not yet built or scoped, so no committed mechanism fixes a per-pass candidate count. Struck as a number; the batch bound itself is correctly a build-time detail.

**The history window is read server-side, from the presenting credential's own rows — the caller never submits history.** Mechanism facts (PR20): the existing `getTrajectoryWindow` read is scoped by `credential_ref` equality (R17a — *"never a cross-credential read"*, `agent-assessment-history-store.ts`), one awaited indexed query (`idx_aah_credential_time`), default window 90 days / last 30 rows (`TRAJECTORY_DEFAULT_WINDOW_DAYS = 90`); `NoveltyHistoryRow` is a `Pick` of exactly the two structural columns (`oikeiosis_stage`, `virtue_domains_engaged`) from that projection. Letting the caller supply the window would reintroduce the ruled-out runner-side-history shape through the back door *and* open a curated-window gaming surface (submit an empty window ⇒ everything novel); server-side read forecloses both. Under Q3's dedicated identity this means **the check runs against the runner's own record** — which is also the honest reading of "novel for this loop."

**Named question for the mentor (Q-B):** the C2 scope §3 left the window bound open — *"narrowed here to one loop's session rather than the 90-day/30-instance trajectory window — a build-time parameter, named as a design call this document does not fix."* The endpoint must fix a default at build. The AI proposes **reusing the existing 90-day/30-row trajectory window as the v1 default** (no new windowing code; the constant is already live-exercised), with a session-scoped narrowing available later if validation-run data shows the wide window mutes novelty. Does the mentor confirm, or fix a different bound?

**RULED 2026-08-09 (Q-B) — the 90-day/30-row window confirmed as v1 default.** *"No new windowing code at build. The session-scoped narrowing is available as a named future adjustment if validation-run data shows the wide window mutes novelty — but that decision waits for data, not anticipation."* **Carried as a named follow-up, not an open question: "revisit window bound after first bounded validation run."** The batch-shape/gapRef proposal and the striking of "up to seven" as an unverified inference are both confirmed as stated in the [PR19] annotation above.

### 2.4 Response shape

**PROPOSAL:** per submitted candidate, `{ gapRef, passedNoveltyCheck, noveltyConfidence }` — the wire field names mirror the approved `GeneratedCandidate` fields (the pure function's internal `novel`/`confidence` are mapped at the seam), per the approved spec (§1.6: `passedNoveltyCheck` + `noveltyConfidence`, distinct from `generationConfidence`). Plus one per-call disclosure block: `window: { rows_in_window, window_days, max_rows, basis: 'credential_ref' }` — the house honesty pattern (the reader can see what evidence base the verdict stood on). **The endpoint stores nothing**: the runner writes the results onto its own `GeneratedCandidate` records (the external-state ruling — SageReasoning stays stateless and request-scoped per cycle).

**RULED 2026-08-09 — confirmed as proposed.** *"The per-call disclosure block ... is confirmed as required, not optional. The house honesty pattern applies here: the reader must be able to see what evidence base the verdict stood on. The endpoint stores nothing; the runner writes results onto its own GeneratedCandidate records."*

### 2.5 Honest-outcome handling — the evidence-floor discipline

Two honest cases are already in the committed function, carried as-is:

- **A friction candidate** (no `targetCircle`, `preferred_indifferent` classification) has neither structural axis: the check returns `{ novel: true, confidence: 0 }` — *"the zero confidence says the check has no basis, rather than manufacturing one"* (the function's own documented behaviour). The endpoint surfaces this unchanged.
- **Confidence is a monotone distance-from-floor curve**, two decimals, clamped [0,1].

**One new fact this scoping surfaced, raised for ruling rather than resolved (Q-C — the session's most substantive open question):** on an **empty or starved history window** the committed curve returns `novel: true, confidence: 1.0` (count 0 ⇒ |0 − 3| / 3 = 1). A fresh dedicated runner identity (Q3) starts with **zero history**, so every candidate in the loop's earliest cycles would pass novelty at *maximal* confidence — a confident verdict derived from absence of evidence. The house evidence-floor discipline elsewhere never lets starvation read as a confident result (`insufficient_extraction` is a distinct value in `trajectory-delta.ts`; *"never a defaulted pass or fail"*). This question is **within bounds**: the ruling explicitly left the confidence curve open as a build-time detail; the query shape and floor are not touched. Options for the mentor:

1. **Disclose-and-carry:** keep the committed curve; the response's `window.rows_in_window` disclosure lets the runner (and the per-cycle record) see the verdict stood on a starved window. Cheapest; the verdict is still arguably honest ("nothing in the window matches" is true).
2. **Distinct basis (AI's recommendation):** when the window itself carries fewer than `EVIDENCE_FLOOR` rows *in total*, the endpoint reports `passedNoveltyCheck: true` with a distinct `basis: 'insufficient_history'` and `noveltyConfidence: 0` — mirroring the friction-candidate treatment (a true verdict, zero claimed confidence, the no-basis condition named). A small dated amendment to the function's curve at build time, inside the latitude the ruling left open.
3. Something else the mentor prefers.

**[PR19, F2/structural-novelty-and-pr20, low — precision note]** the empty-window arithmetic is confirmed exact by direct trace (`count=0` ⇒ `|0−3|/3=1` ⇒ `confidence=1.00`, `novel=true`). Option 2's condition — "the window itself carries fewer than `EVIDENCE_FLOOR` rows *in total*" — is a **different quantity** from `count`, the *matching-row* count `assessStructuralNovelty` actually computes (a candidate could see `count=0` against a *populated* window that simply contains no rows sharing its circle/domain combination — the honest "genuinely novel" case — as well as against an *empty* window). The endpoint's build must decide which quantity Option 2's basis check reads (total window size, vs. the matching-row count already computed) and the function does not currently receive or expose the former; named as a build-time wiring detail for whichever option the mentor selects, not a defect in the arithmetic itself.

**RULED 2026-08-09 (Q-C) — Option 2, the distinct `insufficient_history` basis, confirmed.** *"The house evidence-floor discipline does not permit starvation to read as a confident result anywhere else in the system, and it must not do so here. A fresh dedicated runner identity starting with zero history is a foreseeable and common condition, not an edge case. Returning noveltyConfidence: 1.0 on an empty window would present a false impression of evidential strength to the runner and to the per-cycle record. The distinct basis — passedNoveltyCheck: true, basis: 'insufficient_history', noveltyConfidence: 0 — mirrors the friction-candidate treatment exactly and is the honest shape."* **The [PR19] precision note is confirmed as a build-time wiring detail, and its resolution is fixed by the ruling:** *"the basis check must read total window size, not the matching-row count the function currently computes, because the distinction matters — a populated window with no matching rows is the genuinely novel case, not the starved-window case. The function does not currently receive or expose total window size; the build must wire this. Name it explicitly in the build prompt so it is not missed."*

### 2.6 Rate and cost posture (mechanism facts, stated not proposed)

- **No LLM call.** The check is pure computation over one windowed indexed read. Zero Anthropic spend per call, by construction.
- **No loop-billing write proposed.** The cycle's cost surface is the guardrail calls (CI-10 metering, `X-Loop-*` headers) and the winner's full consult; a pure-compute check would meter nothing meaningful. Proposed posture: no `loop_billing_events` write, no cost headers (stated so its absence is a decision, not an omission).
- **Rate-limit bucket:** deliberately NOT `scoring`, which is IP-shared with `/api/reason` and would couple this surface to the measured instrument (the recorded 2026-07-29 lesson and fix; memory `rate-limit-bucket-couples-to-measured-surface`). **[PR19, F5/structural-novelty-and-pr20, nit]** the draft proposed `analytics` (60/min), but the closest sibling agent-facing route — `/api/practice/discernment` — uses **`publicAgent` (30/min)** (`discernment/route.ts:15,21`), and `analytics` has no agent-facing-route precedent. Revised proposal: **`publicAgent` (30/min/IP)**, matching the sibling; one batch call per cycle sits far inside either bound, so the choice is uniformity, not capacity.
- **Quota note:** the call authenticates via UPC, so it draws on the credential's daily/monthly limits — a fact for the runner-credential sizing session (Q3's territory; the known limits-mask-as-401 failure shape), not resolved here.

**RULED 2026-08-09 — confirmed as revised.** *"No loop_billing_events write confirmed — its absence is a decision, not an omission, as the document correctly states. No cost headers confirmed. publicAgent (30/min/IP) confirmed, matching the discernment sibling. The analytics bucket is correctly set aside — no agent-facing-route precedent, and the rate-limit-bucket-couples-to-measured-surface lesson is correctly applied."*

### 2.7 Flag posture

**PROPOSAL:** dark behind a NEW env flag, **`SUBSTRATE_FRESH_ENABLED`**, UNSET everywhere ⇒ honest **503, zero work** (the discernment/S10 dark-route pattern; flag-off byte-identity battery-asserted at build). Activation is its own founder-walked `code-critical` step at or after the first build gate — nothing here pre-approves it.

**RULED 2026-08-09 — confirmed as proposed.** *"SUBSTRATE_FRESH_ENABLED confirmed, UNSET everywhere, honest 503, zero work. Activation is its own founder-walked code-critical step at or after the first build gate. Nothing here pre-approves it."*

### 2.8 What `fresh` deliberately does NOT do

- **No verdict modification** — it never touches, floors, or annotates a guardrail or `/api/reason` verdict; it is a separate post-filtering classification the runner consumes.
- **No trust-event write of its own — SETTLED ground, not an open question. [PR19, F1/q2-fidelity, medium — the review's substantive catch]** The draft posed this as an open question (Q-D); the review confirmed it is **already ruled**: the brief's Phase 5 states verbatim *"the trust-event write carries `loopId`; orientation readings and seeds accrue as ordinary consequences of the consults themselves (no new write path)"*, and the mentor's §2 ruling approved *"Phases 0 through 7 ... as proposed"* with the sole amendment at Phase 4 — Phase 5 stands un-amended. So "no novelty trust event" is settled by the ruling and carried here as settled: the endpoint writes no trust event, and any future novelty event class would be a new question for the mentor, not a default this document leaves ajar. (Former Q-D withdrawn from §3 accordingly.)
- **No generation content** — heuristics, prompts, thresholds, phantasia-variation all stay in the generation-step scope document (Q11's next-but-one item).
- **No persistence** — stateless per call; the runner stores results (external-state ruling). Nothing lands on S10; the public trust record is untouched.
- **No edit to `idea-loop-types.ts`** — the wrap consumes the module as committed; the Q6 `'terminated_by_timeout'` seventh value remains the named follow-up for the first code session touching the module (plausibly the endpoint's own build session — named so the build prompt carries it).
- **MEASURE-only; weights blocked** — a novelty verdict binds nothing and is not a training signal; the standing postures inherit unchanged.
- **R20a:** agent-facing endpoint processing agent-produced candidate text — **outside the human-distress perimeter** per the standing recorded precedent (the discernment/trust-record posture); recorded as a decision at build in the route header, re-checkable per AC5 if the perimeter question is ever re-opened.

**RULED 2026-08-09 — all eight items confirmed.** *"The PR19 medium finding — Q-D withdrawn, no-novelty-trust-event is settled ground — is correctly handled. Carry the settled statement forward into the build prompt verbatim: 'the endpoint writes no trust event; any future novelty event class is a new question for the mentor.' The Q6 'terminated_by_timeout' seventh value as a named follow-up for the first code session touching idea-loop-types.ts is confirmed — plausibly the fresh endpoint's own build session, as the document notes. Name it in the build prompt."*

### 2.9 Required review dimension, carried

**The structural-novelty-only limitation** — two structurally identical but substantively different actions (same circle, same domains, genuinely different content) are indistinguishable — is a confirmed, required PR19 review dimension for this scope and for the endpoint's eventual build (C2 scope §3; brief §1.6). It is disclosed in the function's own doc-comment and must be disclosed in the endpoint's response documentation at build (content novelty stays a named future upgrade, not required).

**RULED 2026-08-09 — confirmed as a required PR19 review dimension for the build, and as a required disclosure in the endpoint's response documentation at build.** *"Content novelty remains a named future upgrade."*

---

## 3. Open questions for the mentor — ALL THREE RULED 2026-08-09

- **Q-A (§2.2):** `consult` capability reuse vs a dedicated capability value for the runner credential. *AI recommends reuse.*
  **RULED: consult reuse confirmed.** See §2.2's inline ruling.
- **Q-B (§2.3):** the history-window bound — reuse the existing 90-day/30-row trajectory window as v1 default, or fix a session-scoped bound now? *AI recommends reuse, revisit on validation-run data.*
  **RULED: the 90-day/30-row window confirmed as v1 default.** Revisit gated on validation-run data, carried as a named follow-up, not left open. See §2.3's inline ruling.
- **Q-C (§2.5):** the starved-window confidence question — disclose-and-carry the committed curve, or the distinct `insufficient_history` basis with zero claimed confidence? *AI recommends the distinct basis.* (Within the build-time latitude the ruling left open; the query shape and floor are untouched either way — and note §2.5's [PR19] precision note on which quantity the basis check reads.)
  **RULED: Option 2, the distinct `insufficient_history` basis, confirmed, with the total-window-size wiring detail fixed** (the basis check reads total window rows, not the matching-row count `count`). See §2.5's inline ruling. **Name this explicitly in the build prompt.**

*(A former fourth question, Q-D — whether a novelty trust event is wanted — was withdrawn by the PR19 review: it is settled ground, not open; see §2.8's second bullet. Confirmed settled by the ruling, not re-opened.)*

**No other questions remain open in this scope** (verbatim).

Everything above is now ruled; §1 remains settled ground, not re-opened.

---

## 4. What follows

**RULED 2026-08-09 (supersedes this section's original "goes to the mentor" text, kept below for the record):** *"fresh endpoint scope: ruled. Next item: per-cycle record table scope (watching). The generation-step scope document does not open until watching is ruled. The first build gate does not open until the generation-step scope document is ruled. Nothing in this ruling licenses a build, a route, a flag, a credential, or a schema."*

**Carry-forward for the `watching` scoping session (verbatim):** *"the per-cycle record must represent the full outcome vocabulary now including 'terminated_by_timeout' at the candidate level (Q6's seventh value), rejected_by_guardrail candidates with full transparency (Q7's ruling), and the dependency_unavailable / null-cycle distinction for the fallback counter — the brief's §1.3 carry-forward that was named but not yet resolved. If that distinction is not already settled in the corpus, the watching scope document should surface it as an open question rather than resolve it by default."* **Checked against the corpus at this session's close: it is NOT settled** — the brief's carry-forward note (ii) pointed to "Q6's territory," but Q6 ruled only the seventh `cycleOutcome` value (`'terminated_by_timeout'`) and never addressed whether a `dependency_unavailable` cycle counts toward, resets, or is excluded from the "three consecutive null cycles" fallback trigger (brief §1.3: the fallback counts *null* cycles specifically; `dependency_unavailable` is stated only as "honestly distinct" from a null cycle, brief line 51). The pointer resolves to nothing. Per the ruling's own instruction, `watching`'s scope document must surface this as a genuine open question.

*Original text (as offered):* This scope goes to the mentor via the founder. The session that produced it ends there — per the Q11 sequence, the per-cycle record table scoping (the next small item) does not open until the mentor rules on this scope. Nothing in this document licenses a build, a route, a flag, a credential, or a schema; the first build gate sits after the per-cycle table item and the generation-step scope document.

*End of scope. Authored 2026-08-09 under the ruled Q11 sequence; PR19 adversarial review run and all eight confirmed findings folded before relay; RULED 2026-08-09 with every fold cited to the verbatim record (see the front-matter review record — the two positive confirmations were that every PR20 mechanism-fact claim traced exactly to the code, and that the structural-novelty-only limitation is carried un-watered-down in §2.9).*
