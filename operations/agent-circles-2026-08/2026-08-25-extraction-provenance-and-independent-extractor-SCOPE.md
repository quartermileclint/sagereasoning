# Scope — the extraction-provenance gap and route (i), as one architecture

**Authored 2026-08-25.** `governance`, **documents only.** No code, migration, flag, credential, or
public-surface edit. AC7 not engaged. Weights BLOCKED. Nothing here bears on the 0h call.

**Mentor-ordered and mentor-shaped.** The binding ruling
(`2026-08-24-mentor-ruling-gaming-robustness-bar-route-ii-verbatim.md`; **verbatim wins**) named the
emission-hooks finding *"the first item to scope after today's rulings are recorded, ahead of any
cybernetics build work"* and ruled that it and route (i) *"are not independent work items — they are
the same architectural intervention applied to the same channel."* They are scoped here together.

**Status of this document:** a scope and a recommendation. **It elects nothing.** The fix choice has
architectural consequence and the ruling declined to make it; the accompanying mentor question
(`2026-08-25-MENTOR-QUESTION-extraction-provenance-fix-choice.md`) puts it.

---

## §0 — The headline, before the detail

The inherited framing of **option 2 (server-side join-back)** asked whether a submitted signed
assessment carries anything that joins to the persisted trajectory row. **It does.** The join key
exists and it is inside the signed bytes: `assessment.examination.ref` ↔
`agent_assessment_history.correlation_id`, both set from the same `correlationId` variable.

**But the join does not do what it needs to do, and the reason is not a missing key — it is that the
key is not a per-consult identifier.** On the API-key path `correlationId` is the caller-supplied
`X-Loop-Id` header, format-validated only, and **reusable across many consults by design** (that is
what a metered loop is). `correlation_id` is UNIQUE on the trajectory table, so **only the first
consult in a loop writes a row**; every later consult is a benign no-op. One `ref`, many assessments,
one row.

**Consequence: a lookup on `ref` returns the provenance of whichever consult wrote first — not the
provenance of the assessment being checked.** A caller sends one ordinary server-extracted consult
under loop `X` (row written: `layer1_source='server'`), then an `l1_supply` consult under the same
loop `X` (no row written). Both signed assessments carry `examination.ref = X`. A provenance check
keyed on `ref` reads `'server'` for the supplied one. **Setting one request header defeats it.**

This is worse than having no check, because a check that can be defeated by a header would be the
thing licensing the public attestation. **Option 2 as framed is not buildable.** A near variant
(**option 2′**, §4.2b) is, and is the lightest sound structural fix on the table.

---

## §1 — Why one architecture and not two items

The gap and route (i) meet at a single point: **the moment a trust event is minted, does the server
know whether it extracted the reasoning it is attesting to?**

- The **gap** is that at that moment the server does not know, and mints anyway.
- **Route (i)** makes the server extract on every path, so at that moment the answer is always yes.

Route (i) therefore closes the gap as a side effect — the ruling's own observation. The converse does
not hold: closing the gap does not deliver route (i)'s Arm-B mitigation. **They are one channel with
two questions, and any fix to either changes what the other needs.** §5 works the interactions.

---

## §2 — Verified mechanism facts

**Every fact below was re-verified first-hand at source on 2026-08-25** (PR20 drafting-time
discipline, as strengthened 2026-08-19 for present-tense mechanism claims). The inherited list was
used as a starting point, not an authority; **three items came back different** and are marked ⚠.

| # | Fact | Source, verified 2026-08-25 |
|---|---|---|
| 1 | `emitAccreditationTrustEvents` gates ONLY on `isTrustCoreEnabled()`, `input.provenanceEnforced` (Ed25519 **signature** check), and a non-empty `signed_assessments` array. **No extraction-provenance check.** | `trust-core/emission-hooks.ts:78-93` |
| 1b | Its input interface is `{agentId, credentialId, provenanceEnforced, rawBody, now?, resolvedOwnerUserId?}` — **no `layer1Source`, and none derivable from the request** | same file, `:54-68` |
| 2 | `emitOrientationReadingTrustEvent` HAS the guard — `if (input.layer1Source !== 'server') return // supplied extractions never mint a reading` — docstring naming *"the gaming ceiling's structural half"* | same file, `:465`; docstring `:393-396` |
| 3 | `presetForPurpose` returns `{consult, l1_supply}` for BOTH `ecosystem` and `plugin_install` | `practice-credential.ts:216-220` |
| 3a | ⚠ **More precise than inherited.** That preset is the **fallback for rows whose `capabilities[]` is NULL**, and must match the Step-2 backfill exactly. A UPC row carries an explicit `capabilities[]` and is authoritative (fail-closed if absent). So "default preset" is exact for legacy/backfilled `ecosystem`+`plugin_install` rows; **the live population size is a DB question a repo session cannot settle** | same file, `:205-214` |
| 4 | A supplied `layer1_schema` is **MANDATORY** on the plugin path — absent/null ⇒ 400 | `api/reason/route.ts:554-568` |
| 5 | `Layer2Assessment` carries **no provenance field**; the Ed25519 signature covers only that object (`"Layer2Assessment-only signed payload"`) | `layer2-mechanisms.ts:381-400`; `layer2-signer.ts:4-6,95-99` |
| 5a | `SignedLayer2Assessment` is exactly `{assessment, signature, key_id}` — three fields | `layer2-signer.ts:95-99` |
| 6 | `meta.layer1_source` is set **outside** the signed object, flag-gated on `SUBSTRATE_L1_SCHEMA_KEY_PATH_ENABLED` | `api/reason/route.ts:2043-2049` |
| 7 | `TRUST_RECORD_ENVELOPE.attests[1]` claims unconditionally that decisions were reasoned *"as narrated and extracted from the submitted text"* | `trust-core/trust-record-payload.ts:48` |
| 8 | That file has **zero** occurrences of `layer1` / `supplied` / `provenance` (`grep -ci`: 0) | same file |
| 8a | ⚠ **New.** The same claim is mirrored on **all three R18 surfaces**, not only the served payload: `llms.txt:759` and `agent-card.json:446` (*"as narrated and extracted"*) | those files |
| 8b | ⚠ **New, and it sharpens option 3.** `attests[1]` has **NO content pin.** The only battery assertion is `S2-37`, strict reference identity (`eq(payload.envelope, TRUST_RECORD_ENVELOPE)`) — whose own in-test comment states it *"cannot detect a missing envelope ITEM."* `grep "extracted from the submitted text"` across `website/src/` returns the payload file and one unrelated engine string; **no test pins this sentence.** An edit to it today passes every battery silently | `s10-trust-record-surface.test.ts:266-278` |
| 9 | `/api/guardrail` has **zero** `layer1_schema` occurrences in the route or the sandwich; body destructure is closed (`action, context, threshold, agent_id, risk_class, urgency_context, considered_alternatives`) — **the live ENFORCE surface is structurally supply-proof** | `api/guardrail/route.ts:105`; `guardrail-sandwich.ts` |
| 10 | The corroboration check does not mitigate this — **ruled**: *"It reads the submitted text against the claims. It does not read the extraction against its own origin."* | the ruling |

### 2.1 Facts the inherited list did not carry, established here

| # | Fact | Source |
|---|---|---|
| **A** | **The join key exists and is inside the signed bytes.** `Layer2Assessment.examination?: {ref?, depth_tier?, prior_feedback_ref?}` is attached **before signing** — the field's own docstring says so explicitly, because the M3 write-boundary gate must be able to trust it | `layer2-mechanisms.ts:425-443`; attached at `parallel-run.ts:898-900`, signed at `:1084` |
| **B** | **`ref` is the `correlationId`** — the same variable the trajectory row's `correlation_id` is set from | `route.ts:1374` (`ref: correlationId`) and `route.ts:1851` (`correlationId`) |
| **C** | **`correlationId` is the caller-supplied `X-Loop-Id` on the API-key path**, else a server UUID. Verbatim: `const loopId: string \| null = isApiKeyAuth ? (extractLoopId(request) ?? generateLoopId()) : null`, then `const correlationId: string = loopId ?? generateLoopId()`. **The `isApiKeyAuth` ternary is load-bearing** — on the user-JWT path `loopId` is unconditionally `null`, so `correlationId` is always a fresh server UUID there | `route.ts:808-810,823` |
| **D** | `extractLoopId` validates **UUIDv4 format only** — no uniqueness check, no credential binding, no per-consult constraint | `loop-cost-tracker.ts:512-525` |
| **E** | **One loop id spans many consults by design** — that is the Option-D metering unit (`createLoopAccumulator`, `loop_billing_events`, the six `X-Loop-*` headers, `x-loop-internal-calls`) | `route.ts:770-815` |
| **F** | `agent_assessment_history.correlation_id` is **UNIQUE**; a duplicate insert is *"a benign no-op (inserted: 0)"* | `agent-assessment-history-store.ts:427,460` |
| **G** | ⚠ **A code comment that is false on the API-key path.** `route.ts:1844-1845` reads *"correlation_id is the per-consult unique handle (no signed-assessment dependency on this path)."* It is per-**loop**, not per-consult, whenever `X-Loop-Id` is supplied. **PR25-relevant** (a verification claim in a comment, unchecked) | `route.ts:1844-1845` |
| **H** | `receipt_id` on the trajectory path is **NOT** derived from the Ed25519 signature. `deriveReceiptId(sig) = 'rcpt_' + sha256(sig)`, but the route passes `signature: correlationId` into the bridge — so the persisted `receipt_id` hashes the **loop id**. Two `receipt_id` namespaces exist and **do not join** | `sage-assent-bridge.ts:160-163,214`; `route.ts:1846` |
| **I** | **No table persists an Ed25519 signature anywhere.** The A12 audit row stores only `layer2_signature_present` (a boolean). There is no existing signature-keyed surface to join to | `20260603_a12_substrate_audit_events.sql:61`; repo-wide `grep` |
| **J** | ⚠ **The `layer1_source` stamp is gated on `SUBSTRATE_TRAJECTORY_DELTA_ENABLED`, not on the trajectory **write** flag.** The insert omits the column key entirely when the delta flag is off. Per the decision record the write flag went live 2026-06-14 and the delta flag 2026-07-18, so **rows written in that window carry `layer1_source = NULL`** | `supabase-agent-assessment-history-layer1-source-migration.sql:26-33`; `route.ts:1867-1873` |
| **K** | The trajectory write fires only when `isTrajectoryWriteEnabled() && error===null && tier1_trigger===null && layer2_assessment!==null` **and** a credential ref resolved | `route.ts:1802-1831` |
| **L** | `examination.ref` is present only when `SUBSTRATE_REASON_LOOP_CLOSURE_ENABLED` is on (field omitted entirely otherwise, for signing byte-identity) | `route.ts:1355-1377` |
| **M** | The signed assessment IS reachable at the trajectory-write call site (`sandwichResult.output.assessment`, a `SignedLayer2Assessment` when signing is on) — so persisting a signature hash there is a one-expression change | `parallel-run.ts:1081-1108`; `route.ts:1533,1850` |
| **N** | ⚠ **The closest existing published caveat addresses TRUTH, not ORIGIN — and points at a place that does not carry it.** `agent-card.json:474` states *"the Ed25519 signature attests the deterministic computation's reproducibility from the extraction; it does not attest the extraction's truth (see `does_not_attest` … for the canonical condition, which is deliberately held in ONE place)."* `does_not_attest` has **zero** provenance content (fact 8). The pointer resolves to nothing on this axis | `agent-card.json:474`; `trust-record-payload.ts` |

**Not verifiable from a repo session, and marked as such (PR20):** the live production state of
`SUBSTRATE_TRAJECTORY_WRITE_ENABLED`, `SUBSTRATE_TRAJECTORY_DELTA_ENABLED`,
`SUBSTRATE_REASON_LOOP_CLOSURE_ENABLED`, `SUBSTRATE_L1_SCHEMA_KEY_PATH_ENABLED`, and the count of
live credentials carrying `l1_supply`. The decision record asserts all four flags live; **that is a
record claim, not a verification.** Each is a founder-run `curl` or one SQL query away. **No option
below should be elected on the assumption that any of them is live.**

---

## §3 — The joinability question, resolved

The prompt named this as the question option 2 lives or dies on. **It dies on it, in a more
instructive way than "no key exists."**

**3.1 The key exists — conditionally.** `examination.ref` rides inside the signed bytes (fact A) **when `SUBSTRATE_REASON_LOOP_CLOSURE_ENABLED` is on** (fact L; its live state is unverified from a repo session). If that flag is off there is no `ref` at all and option 2 fails trivially for want of any key. **§3.2–3.3 deliberately argue the harder branch** — that option 2 fails *even with* the key present — because that forecloses the "just turn the flag on" shortcut. The conclusion is the same on both branches. `examination.ref` and is set from the
same `correlationId` the trajectory row is keyed on (fact B). Because it is inside the signature, a
caller **cannot forge it**: only the server signs, and altering `ref` invalidates the signature. That
much is genuinely sound, and it is why this had to be checked rather than assumed.

**3.2 The key is not per-consult.** On the API-key path it is the caller's `X-Loop-Id` (facts C, D),
reusable across consults **by design** (fact E). `correlation_id` is UNIQUE and duplicate inserts are
silent no-ops (fact F). So the mapping is **many assessments → one row**, and the row carries the
provenance of whichever consult happened to write first.

**3.3 The defeat requires no forgery and no unusual behaviour.**

| Step | Caller action | Server state |
|---|---|---|
| 1 | Consult under `X-Loop-Id: X`, raw text (server extracts) | Row `X` written, `layer1_source='server'` |
| 2 | Consult under the **same** `X-Loop-Id: X`, supplying `layer1_schema` | Insert on `X` is a UNIQUE-violation no-op. **Row `X` still says `'server'`** |
| 3 | Submit step 2's signed assessment as accreditation evidence | Its `examination.ref = X` → lookup returns `'server'` → **event minted** |

Every step is ordinary, documented behaviour. **A provenance check built on this join would be
defeated by reusing a header** — and, being a check, it would be the thing licensing the corrected
attestation. That is a strictly worse position than the honest gap.

**3.4 A content-join is unsound and must not be reached for.** The trajectory row stores only the flat
`EvaluatedAction` projection (`proximity`, `is_kathekon`, `kathekon_quality`, `passions_detected`,
`virtue_domains_engaged`, `oikeiosis_met`, `oikeiosis_stage`, `ruling_faculty_state`). One could
project a submitted assessment and look for a matching row. **This launders rather than checks:** the
projection space is small and finite, the match is many-to-many, and — decisively — **an `l1_supply`
attacker chooses the extraction and therefore chooses the projection**, so it can aim at whichever
server-extracted row it knows exists. It is a "does some server row look like this" test, not a
provenance test. Named here so a build session does not rediscover it as the easy answer.

**3.5 What survives — stated precisely, because the imprecise version misleads a build session.** The
signature is the only **caller-uninfluenceable** identity in the system, and nothing persists it today
(fact I). That is what option 2′ builds on. **But it is per-CONTENT, not per-consult** — Ed25519
signing here is deterministic (`layer2-signer.ts:34`) over the canonical JSON of a `Layer2Assessment`
carrying **no timestamp, no nonce, and no request id** (verified: the full field list is derived
content only), and `signLayer2Assessment` adds nothing before signing (`:183-194`). **Two consults
producing byte-identical assessments produce byte-identical signatures.** Reachable in practice, not
theoretical: `/api/reason` returns `extraction: layer1Schema` in its own response
(`parallel-run.ts:1107`), so a caller can replay the server's own extraction back as its supplied
schema and — Layer 2 being deterministic — obtain the identical assessment.

**Why this does NOT reproduce the §3.3 defeat, and the distinction matters.** A signature collision
requires a **byte-identical** assessment. Identical content means the caller gained nothing: the
replayed artifact and the genuine one score the same. To make a *different*, more favourable
assessment read as `'server'`, a caller would need an Ed25519 collision across different messages —
infeasible. The only reachable misattribution runs the other way: a `'supplied'` entry landing first,
a later genuine `'server'` assessment then reading as `'supplied'`. That **fails closed**. **So
option 2′ remains sound against the threat; what was wrong is the word "per-consult" — and a build
session reasoning from it would design the ledger's write semantics wrongly.**

---

## §4 — The options

Each carries cost, blast radius, tier, and — stated separately, because they differ — **what it closes
and what it does not.**

### 4.1 Option 1 — signing-contract change (provenance inside the signed payload)

Add a provenance field to `Layer2Assessment` so it travels with the artifact and is covered by the
signature.

- **Closes:** the gap completely and permanently, for every consumer, with no lookup, no retention
  window, and no historical blind spot going forward. Cleanest semantics of any option.
- **Does not close:** route (i)'s Arm-B threat. A supplied extraction would be honestly *labelled*
  supplied — it would still be trusted for whatever it is allowed to do.
- **Blast radius:** breaks byte-identity of the signing contract; the canonical form changes, so every
  previously-signed assessment and every downstream verifier is affected. Needs a key/version story
  (the existing `SUBSTRATE_LAYER2_PREVIOUS_*` rotation vars are the nearest precedent). Historical
  artifacts carry no field, so an absent-field policy is still required.
- **Mitigating precedent, and it is real:** `examination`, `proximity_floors`, and `corroboration` are
  all **optional fields already added to this exact object**, each omitted entirely when its flag is
  off precisely to keep flag-off signing bytes byte-identical (facts A, and `layer2-mechanisms.ts:
  446-470`). The house pattern for extending the signed payload exists and has been walked three
  times. **This lowers the cost estimate materially versus the inherited framing.**
- **The asymmetry that precedent does NOT cover, and it cuts against the cheapness claim:** those three
  precedent fields are **evaluative enrichments** — if `proximity_floors` is absent or wrong, the
  assessment is less informative and nothing else changes. **A provenance field IS the attestation**
  this whole document is about, and would be what a corrected `attests[1]` rests on. A field that is
  mis-set — under one of the flag combinations §2 explicitly marks **unverified in production** —
  silently recreates the exact exposure being fixed, now underwritten by a corrected-sounding public
  claim. **This is not hypothetical: fact J is precisely that failure**, in the structurally analogous
  `layer1_source` stamp, which was gated on the wrong flag and left a real window of NULL rows.
  **Engineering effort is genuinely lower than the inherited framing; the stakes of getting it wrong
  are higher than any of the three precedents.** Both belong in the comparison.
- **Tier:** `code-critical`.

### 4.2 Option 2 — server-side join-back on the existing key

**Not buildable. See §3.** Retained here so the record shows it was resolved at source, not skipped.

### 4.2b Option 2′ — a signature-keyed provenance ledger *(the near variant; surfaced here)*

Persist, at consult time, the mapping `sha256(signature) → layer1_source`. At accreditation-write
time the server hashes each submitted signature and looks it up.

- **Why it is sound where option 2 is not:** the signature is per-consult, server-produced, and
  **caller-uninfluenceable**. A caller cannot obtain a valid signature for an assessment the server did
  not sign — the R18f gate already proves that. There is no header to reuse.
- **Closes:** the mint-time gap for every consult covered by the ledger, with **no signing-contract
  change**, no change to the wire shape, and no change to what any existing verifier sees.
- **Does not close:** route (i)'s Arm-B threat (same as option 1). Nor anything outside the ledger's
  coverage — see the limits, which are load-bearing.
- **Honest limits, all four material:**
  1. **Retention.** If the ledger inherits the trajectory table's 90-day `retain_until` + sweep, any
     artifact older than the window is unresolvable. This interacts directly with the **already-disclosed
     PA-10 stale-artifact replay class** — a genuinely-earned old assessment may legitimately be
     resubmitted, and would read as unknown.
  2. **No history.** The ledger starts empty. Every assessment signed before it exists reads unknown.
     Fact J shows the existing `layer1_source` column has its own earlier blind window.
  3. **Flag dependency.** Coverage is only as good as the consult-side write actually firing (fact K).
  4. **The absent-row policy is the whole decision.** Fail-open (mint anyway on unknown) preserves
     today's behaviour and leaves the gap for uncovered artifacts. Fail-closed (refuse to mint) is
     honest but would refuse legitimate historical and out-of-window writes. **This is not a technical
     question — it is the founder's, and it is put to the mentor.**
- **Design question the collision property forces (§3.5), unaddressed until now:** because one signature
  can correspond to more than one consult, the ledger's write semantics are a real choice —
  **insert-once** (first write wins; a later genuine `'server'` consult cannot correct an earlier
  `'supplied'` entry — biases fail-closed) versus **upsert** (last write wins; the safer-*sounding*
  option is the more dangerous one here, since it lets a later supplied replay overwrite a genuine
  `'server'` entry). **Insert-once is the conservative direction and should be the default**, but the
  choice belongs in the ruling, not in a build session's implementation detail.
- **A strictly sounder variant, named because it removes the property rather than managing it:** add a
  fresh **server-random per-consult id** to the signed payload and key the ledger on *that* rather than
  on the signature. True randomness has no collision-by-replay property at all. It costs what option 1
  costs (it *is* a signing-payload addition), so it is best read as a **hybrid of 1 and 2′** rather
  than a fifth option — and it inherits option 1's caveat below.
- **Secondary design question:** the lookup would be keyed on a signature hash, not on a credential, so
  it can cross credentials. Reading only `layer1_source` for an artifact the caller cryptographically
  proved possession of is defensible, but it is a departure from the R17a credential-scoping posture
  used everywhere else and should be ruled, not assumed.
- **Blast radius:** one small additive table (or one additive column plus a per-consult key), one
  expression at the consult-side write (fact M), one lookup at the write boundary, one guard in
  `emitAccreditationTrustEvents`. **No public wire change. No signing change.**
- **Tier:** `code-critical` (new schema + trust-core + the write boundary).

### 4.3 Option 3 — corrected public claims

Amend `attests[1]` and add a supply-provenance entry to `does_not_attest`.

- **Closes:** the **honesty** defect — which is the part that is inaccurate *right now* (the ruling:
  *"a live condition, not a future risk"*).
- **Does not close:** anything structural. The events are still minted; the record still aggregates
  them. It stops the record claiming something untrue about them.
- **Blast radius, larger than the inherited framing:** the claim is mirrored on **all three** R18
  surfaces (fact 8a), not only the served payload. So: `trust-record-payload.ts` + `llms.txt` +
  `agent-card.json` + an **ADR-013 §8 dated amendment** + a **battery content pin**, and — because these
  are served public claims — **founder R18 sign-off before any surface is touched.**
- **This is an EDIT to a served string, not an append,** and fact 8b makes that sharper than the prompt
  stated: `attests[1]` has **no content pin at all** today. `S2-37` is reference identity and its own
  comment says it cannot detect a missing item. **An edit would pass every battery silently.** The
  `S2-39`/`S2-40` precedent (substring pins landing in the same edit as the wording, alongside the ADR
  amendment) is the pattern to follow, and it exists precisely because this hole was found once before.
- **Fact N is the strongest argument that this is owed.** A published caveat already tells readers the
  signature *"does not attest the extraction's truth"* and directs them to `does_not_attest` *"for the
  canonical condition."* That pointer resolves to a list with zero provenance content. The record does
  not merely omit the disclosure — **it points at where the disclosure should be and it is not there.**
- **Tier:** `code-elevated` for the edit; the R18 sign-off gate is the binding constraint, not the tier.

### 4.4 Option 4 — route (i), the independent / ensemble extractor

A second server-side extraction over the submitted text, required on every `/api/reason` path, checked
against a caller-supplied schema.

- **Closes:** the actual Arm-B exposure directly (the ruling: *"not weaker than route (ii) on the
  substance of the threat"*), **and** the provenance gap as a side effect — a server-side extraction
  establishes provenance before the event is minted.
- **Does not close:** Threat A (a harm the caller's own text omits). Two honest extractions of a
  cleanly-narrated omission agree, and are both wrong. **This is the already-disclosed A2 class and
  route (i) does not touch it** — the §6 report's own doubled-bound finding is the same shape.
- **Cost and latency — measured, not speculated.** Basis stated: `2026-06-12`, TEST-labelled, from
  `m1-docs-staged-for-activation.md` §4 (**still carrying its TEST label; never production-verified**).
  - Server Layer-1 extraction: **~10–13s**, and it *dominates* every full-shape consult at every depth.
  - Schema supplied + `assessment_first`: **~3.1–4.3s**.
  - Raw text + full: **~29.5–33.1s**.
  - **So route (i) adds ~10–13s to every currently-supplied consult, erasing the entire latency
    advantage of the supplied path** (~3–4s → ~13–17s). This is the single strongest cost fact
    available and it is measured, not modelled.
  - **Per-call money cost, order-of-magnitude, basis stated:** Sonnet (`claude-sonnet-4-6`) at
    `$3/M` input, `$15/M` output (`loop-cost-tracker.ts:94`); `max_tokens: 4000`, `temperature: 0.2`
    (`layer1-extractor.ts:2263-2265`); system prompt measured at **17,117 chars ≈ ~4,300 tokens** by the
    chars/4 heuristic (base build; the live agent-circles + orientation flags make it larger). With the
    action text capped at 5,000 chars, input lands ~5.5–6k tokens (~$0.017) and a full `Layer1Schema`
    output plausibly 1.5–3k tokens (~$0.023–$0.045). **~$0.04–$0.06 per extraction — an estimate, not a
    measurement**, and it *doubles* for a true ensemble.
- **Two architectural consequences the ruling could not see from the question, and PR20 requires naming:**
  1. **Route (i) makes `l1_supply` advisory.** If the server always extracts, a supplied schema's only
     remaining function is to be cross-checked. Route (i) is close to **deprecating `l1_supply` with
     extra steps** — and `l1_supply` is *mandatory* on the plugin path (fact 4), where the plugin's own
     local Layer-1 becomes redundant compute it still pays for.
  2. **"Checked against" needs a disagreement policy, and the policy is itself a gaming surface.** Two
     honest extractions can differ legitimately at `temperature: 0.2`. Reject-on-disagreement re-opens
     the **over-strictness** direction the §4 unity-thesis coupling closed, against which the standing
     memory `over-strictness-check-must-be-rank-preserving` warns explicitly. Take-the-stricter is
     safe-but-biased. Take-the-server's makes the supplied schema decorative (→ consequence 1). **The
     policy is the design, and it is unruled.**
- **Blast radius:** every `/api/reason` path; the plugin contract; the disagreement policy as a new
  engine behaviour. **The largest of the four.** **Incremental cost is NOT uniform across paths and
  should not be read as such:** a raw-text consult already extracts server-side today (fact J's
  `'server'` stamp), so route (i) adds **~0** there. The ~10–13s / ~$0.04–0.06 above is the
  **incremental** cost on the **schema-supplied subset** — which is exactly the subset whose entire
  purpose is avoiding it, and, on the plugin path, is mandatory.
- **Tier:** `code-critical`.

### 4.5 Comparison

| | Closes the mint-time gap | Closes Arm-B | Public-claim honesty | Signing change | Per-consult cost | Tier |
|---|---|---|---|---|---|---|
| **1** signing contract | ✅ forward-only | ❌ | still owed | **yes** | none | critical |
| **2** join-back | ❌ **not buildable** | ❌ | — | no | none | — |
| **2′** signature ledger | ✅ within coverage | ❌ | still owed | **no** | negligible | critical |
| **3** corrected claims | ❌ | ❌ | ✅ | no | none | elevated + R18 gate |
| **4** route (i) | ✅ by construction | ✅ | still owed¹ | no | **~10–13s + ~$0.04–0.06 on supplied consults; ~0 on raw-text²** | critical |

² Raw-text consults already pay server-side extraction today, so route (i) is not an incremental cost there — the burden falls entirely on the schema-supplied subset.

¹ Route (i) makes `attests[1]` true again *going forward*, but the record aggregates historical events
minted under the gap. **No structural option retroactively repairs already-minted events** — which is
why §5 concludes what it does.

---

## §5 — The interaction between a structural fix and the honesty correction

**They are not alternatives, and the sequencing is not symmetric.**

1. **No structural option repairs the past.** Options 1, 2′ and 4 all establish provenance from the
   moment they ship. The public trust record aggregates events minted **before** that moment, under
   the gap. The attestation is inaccurate for that population **permanently**, unless events are
   retroactively re-derived (nothing supports this: no signature is persisted (fact I), and the
   ledger would start empty).
2. **Therefore the honesty correction is owed regardless of which structural fix is chosen, and is not
   discharged by any of them.** Option 3 is not the cheap alternative to a real fix; it is the part
   that is true independent of the rest.
3. **But the correction's wording depends on the structural choice**, which is the argument for not
   writing it first in isolation: "the record cannot distinguish server-extracted from caller-supplied
   reasoning" is the honest sentence *today*; after option 2′ it becomes "…for artifacts outside the
   provenance ledger's coverage"; after route (i) it becomes a historical-scope clause. **Writing it
   once, badly-scoped, then rewriting a served public claim, is worse than writing it once correctly.**
4. **The tension between 2 and 3 is real and is the mentor's to resolve.** Correct now and re-correct
   later (two edits to a served claim, honest at every instant), or correct once alongside the
   structural fix (one edit, but the inaccuracy stands meanwhile — and the ruling called it *"a live
   condition, not a future risk"*).
5. **Options 2′ and 4 are not exclusive, and 2′ does not become redundant under 4.** Route (i) would
   establish provenance going forward, but a ledger is what lets an *already-signed* artifact be
   resolved at write time. If route (i) is eventually built, 2′'s ledger is what covers the interval
   before it — and route (i) is the heaviest and slowest option to land.
6. **The exposure's blast radius is bounded, favourably, and it should be stated:** `/api/guardrail` —
   the live ENFORCE surface, the one that binds a proceed/block decision — is **structurally
   supply-proof** (fact 9). **Nothing here reaches the surface that takes actions.** It reaches the
   accreditation / public-trust-record surface and the `/api/reason` consult response.

---

## §6 — Recommendation *(permitted; this elects nothing)*

Offered with reasoning, as the prompt allows. **The founder and the mentor decide.**

**Recommended shape: option 3 first and soon, option 2′ as the structural fix, route (i) not now.**

- **Option 3 first**, because the inaccuracy is live, because it is the only item that is owed under
  *every* branch, and because fact N shows the record currently points readers at a disclosure that
  does not exist — a sharper defect than a plain omission. Scope its wording to today's mechanism and
  accept a later re-scope; a served claim that is honest now and re-scoped once is better than one that
  is inaccurate while a heavier fix is designed. **It must land as one edit** with the ADR-013 §8 dated
  amendment and a real content pin (fact 8b: there is none today), and it needs founder R18 sign-off
  first.
- **Option 2′ as the structural fix**, because it closes the mint-time gap with no signing-contract
  change, no wire change, and no per-consult cost — and because it is the only option that gives
  `emitAccreditationTrustEvents` the guard its sibling already has **using a value the caller cannot
  influence.** Its limits are real and must be disclosed rather than engineered away.
- **Route (i) not now**, because its cost is measured and large (~10–13s on every supplied consult,
  erasing that path's entire purpose), because its disagreement policy is unruled and is itself a
  gaming and over-strictness surface, and because it decides the fate of `l1_supply` — including on
  the plugin path where the schema is mandatory — as a side effect rather than as a decision. **It
  should be decided as "what is `l1_supply` for?", not as a provenance fix.**
- **Option 1 not first**, but it is *cheaper than the inherited framing suggested* (three optional
  fields have already been added to the signed payload under a flag-off byte-identity pattern). If the
  mentor prefers provenance to travel with the artifact rather than live in a server-side ledger, this
  is a defensible choice and the house pattern for it exists. **2′ and 1 are the genuine fork.**

---

## §7 — Constraints observed, and what this does not do

- **Nothing was built.** No code, migration, flag, credential, or public-surface edit.
- **`attests[]` / `does_not_attest[]` were NOT touched** — scoping them is in scope, editing them is
  not, and they need founder R18 sign-off and probably a ruling.
- **The two items were not split** — one document, one architecture, per the ruling.
- **Route (ii), the GS-CYB-1 amendment, and the bar's Arm-B measurement were not re-opened.**
- **PR19 does not engage** for a documents session, and no adversarial review was run. **It engages
  hard when this becomes a build:** trust-core, the accreditation write boundary (auth-adjacent), and
  a public attestation surface — three of PR19's named surfaces at once. The last two mentor questions
  each needed a full adversarial pass before they were fit to relay; **the build session must budget
  for one, and the honesty correction needs one too** (a served public claim, with no existing pin).
- **Concurrency:** two peer sessions were live at open (`ListAgents`). Commits path-scoped;
  `website/src/data/environmental-context.json` excluded; no file this session did not author was
  touched.

---

## Cross-references

- `2026-08-24-mentor-ruling-gaming-robustness-bar-route-ii-verbatim.md` — **binding**; the order to scope these together
- `2026-08-24-MENTOR-QUESTION-gaming-robustness-bar-route-ii.md` — Part 0 (the finding), Part 2 (route (i)'s standing)
- `operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md` — the ⚠ URGENT — UNSCHEDULED registration
- `operations/benchmarks/sage-practice-v1/2026-06-27-gaming-robustness-bar-scope.md` §2.2, §2.3, §3.3
- `operations/p1-rebuild-2026-06/m1-docs-staged-for-activation.md` §4 — the measured latency envelopes (TEST-labelled)
- `adopted/adr/2026-06-24-sage-practice-measurement-instrument-reframe.md` §4 — the unresolved ADR-012 tension
- `2026-08-25-MENTOR-QUESTION-extraction-provenance-fix-choice.md` — the question this scope puts

*End of scope. Nothing built, nothing disclosed, no claim changed, no fix elected.*
