# ADR-008 — Multi-Turn Input Flow for AC-13 Tier 1 Force-Clarification on `/api/reason`

**Status:** Adopted (founder approval at Sub-session M1-CP4d, 2026-05-06 — "approve as drafted" with no edits).
**Date:** 2026-05-06.
**Stream:** founder.
**Decided by:** founder, informed by AI recommendation.
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessor decision-log entries:** `D-M1-CP4c-LAYER-MODULES-AC14-TIER2-IMPLEMENTED-2026-05-06` (M1-CP4c — the four AC-14 + Tier 2 triggers now operative in code; the substrate this ADR extends to Tier 1); `D-M1-CP4b-AC14-TIER2-ADR-AMENDMENTS-2026-05-06` (M1-CP4b — the ADR amendments this ADR's downstream amendments mirror); `D-M1-AC13-AC14-WIRING-REQUIRED-BEFORE-CUTOVER-2026-05-05` (parent scope decision — names this ADR's Tier 1 deliverable as in-scope before M1-CP6 cutover).
**Related deliverables:** `/adopted/adr/2026-05-04-translation-sandwich-pilot-api-reason.md` (ADR-004 — names the parent specification; §2 response shape; §6.3 failure-isolation guarantee preserved here; §10 checkpoint table this ADR advances); `/adopted/adr/2026-05-04-layer1-schema-specification.md` (ADR-005 — Layer 1 input contract; pending companion amendment for ELEMENT_FUSION trigger field per §3.4 below); `/adopted/adr/2026-05-04-layer2-mechanism-algorithm.md` (ADR-006 — Layer 2 contract; pending companion amendment for SCOPE_AMBIGUITY + TEMPORAL_AMBIGUITY detection per §3.5 below); `/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md` (ADR-007 — Layer 3 contract; not amended by Tier 1 because Tier 1 halts before Layer 3); `/adopted/rag-mentor-alt3/three-tier-intake.md` (D13 — canonical Tier 1 specification; per-trigger question stems + slot specifications); `/adopted/ADR-RAG-MENTOR-ALT3-01-translation-sandwich-deterministic-engine.md` AC-13 (the architectural commitment this ADR realises); `/website/src/app/api/reason/route.ts` (the perimeter route to be amended at M1-CP4e); `/website/src/lib/translation-sandwich/layer1-extractor.ts` + `layer2-mechanisms.ts` + `layer3-prose.ts` (the engine modules; layer1 + layer2 amended at M1-CP4e per §3.4–§3.5 below).
**Engages:** R0 (oikeiosis — engine reasons by principled mechanism, including halting honestly when input is structurally undecidable); R3 (evaluative disclaimer — preserved on the second-turn full evaluation); R4 (server-side reasoning IP — Tier 1 detection + signing key remain server-side); R5 (cost — Tier 1 fire costs one extra Layer 1 LLM call on re-submission; no storage round-trip); R7 (source fidelity — question stems trace to D13 / D-A16 catalogue); R8a (controlled vocabulary — trigger codes preserved); R8c (English-only on user-facing prose — clarification_text rendered in English); R10 (skill marketplace — public API contract gains a second response variant under R10 announcement at M1-CP6 cutover); AC1 (model selection — Layer 1 remains Sonnet for re-extraction); AC4 (invocation testing — R20a perimeter preservation verified at M1-CP4e); AC5 (R20a perimeter — `/api/reason` route's distress check runs on every turn, including the second turn); AC6 (four-layer context architecture — preserved); AC7 (NOT engaged — no auth / cookie / session surface; the continuation token is a stateless cryptographic signature, not a session credential); AC8 (translation-sandwich engine extension — adds halt-and-resume mechanic); KG1 (Vercel five rules — every turn is a fresh request; no shared in-memory state); KG2 (Haiku reliability boundary — Layer 1 remains Sonnet); KG6 (composition order — Tier 1 detection sits inside Layers 1 + 2 + halt happens before Layer 3); PR1 (single-endpoint proof — `/api/reason` is the M1 pilot; Tier 1 generalises to other consumers in M2/M3/M4 only after this proof); PR3 (safety systems are synchronous — distress check + Layer 1 + Layer 2 halt-detection synchronous; no fire-and-forget); PR4 (model selection is constraint — Sonnet enforced); PR5 (knowledge-gap carry-forward — preserved from M1-CP4c); PR6 (safety-critical changes — the M1-CP4e route amendment is Critical; this ADR is governance-tier, the implementation it specifies is Critical); PR7 (decisions not made are documented — the in-ADR sub-decisions named in §10 are explicit deferrals).

---

## Context

### What this ADR resolves

`D-M1-AC13-AC14-WIRING-REQUIRED-BEFORE-CUTOVER-2026-05-05` named the requirement that AC-13 Tier 1 force-clarification (ELEMENT_FUSION at Layer 1, SCOPE_AMBIGUITY at Position 6 oikeiosis, TEMPORAL_AMBIGUITY at Position 2 passion-root detection) ship with the M1 pilot before the M1-CP6 cutover. M1-CP4b adopted ADR amendments for AC-14 Tier 3 + AC-13 Tier 2 (the soft + withhold tiers, neither of which requires multi-turn input). M1-CP4c implemented those amendments in code. Tier 1 — which halts the engine and demands a clarification turn before assessment can complete — was deferred to M1-CP4d because it requires a multi-turn architectural design that the existing single-request / single-response `/api/reason` shape does not support.

ADR-008 is that design. It specifies the response-shape extension, the route flow, the continuation-token mechanic, the per-trigger detection logic, the failure-isolation preservation, and the companion ADR-005 + ADR-006 amendments required at M1-CP4e to make Tier 1 operative.

### What this ADR does not resolve

- The Layer 1 + Layer 2 + route code that implements the Tier 1 mechanic. Implementation is the work of M1-CP4e (a Critical-tier session under PR6 + AC5).
- The companion ADR-005 + ADR-006 amendment text. ADR-008 names the amendments at high level (§3.4–§3.5 below); the precise amendment text is drafted at M1-CP4e alongside the implementation, in the same in-place pattern adopted by M1-CP4b.
- Tier 1 force-clarification on consumers other than `/api/reason`. M2/M3/M4 consumer wiring under the new engine inherits this ADR's pattern but each gets its own ADR per ADR-004's migration sequence.
- The `/admin/test-reason` fixture set extension to exercise Tier 1 triggers. Folds into M1-CP4f per the parent scope decision.
- Comparison-rubric handling of Tier 1 fires during the parallel-run period. The parallel-run path remains dormant by default (per ADR-004 §10.1); when active, Tier 1 fires in the parallel path are logged but do not affect the user-facing response (per §6.3 failure-isolation guarantee). M1-CP4f extends comparison capture to include `clarification_required` fires.

### Founder-confirmed decisions surfaced before drafting

The following load-bearing decision was surfaced at session open and approved:

1. **Multi-turn input flow shape:** Option B — client-renders-form stateless protocol. The engine returns a typed force-clarification response shape (question text + trigger code + slot fills + opaque continuation token); the client renders the question, the practitioner answers, the client re-submits the original input augmented with the answer + the continuation token; the engine restarts at Position 1 with the augmented input. The engine remains stateless. AC7 not engaged. (Alternatives considered: Option A — server-side ephemeral session, rejected for AC7 surface engagement + new external dependency + per-call storage cost; Option C — Tier 1 deferred to a later milestone, rejected because it partly reverses the parent scope decision `D-M1-AC13-AC14-WIRING-REQUIRED-BEFORE-CUTOVER-2026-05-05`.)

The following lower-stakes parameters are codified in this ADR without separate founder confirmation, per ADR-007's precedent:

- **Continuation-token mechanic:** HMAC-SHA256 over a small payload (input hash + trigger code + timestamp + expiry); base64-encoded; opaque to the client; verified server-side at the resume turn. Detail in §4.
- **Token expiry:** 30 minutes. Long enough that a practitioner who steps away and returns can complete the clarification; short enough that stale tokens cannot be replayed indefinitely. Revisited at M1-CP5 if real traffic surfaces a different need.
- **Companion-amendment timing:** ADR-005 + ADR-006 amendments deferred to M1-CP4e (not folded into this checkpoint), in the same pattern as M1-CP4b → M1-CP4c. M1-CP4d adopts the design ADR; M1-CP4e amends the per-layer ADRs alongside the implementation.

---

## Decision

### 1. Multi-turn flow shape

The translation-sandwich engine, when running for `/api/reason`, may produce one of two terminal response shapes:

- **Full evaluation** — the existing shape per ADR-004 §2 (`extraction` + `assessment` + `prose` + `meta` + `disclaimer`), produced when no Tier 1 trigger fires.
- **Force-clarification request** — a new shape (§2 below), produced when a Tier 1 trigger fires at any sequencing position.

The engine never produces both. A Tier 1 fire halts execution at the position the trigger fires; subsequent positions do not run; Layer 3 is not called.

The client (sagereasoning.com or any external skill consumer) inspects the response. If `clarification_required: true`, the client renders the clarification question, gathers the practitioner's answer, and re-submits the augmented input + the continuation token to `/api/reason`. The engine starts fresh from Position 1 with the augmented input. If a Tier 1 trigger fires again on the second turn (a different one — Layer 1's translation is structurally bounded, so the same trigger does not fire indefinitely), the cycle repeats. If no Tier 1 fires, the engine produces the full evaluation.

### 2. Force-clarification response shape

```
{
  "version": "translation-sandwich-v1",
  "clarification_required": true,
  "intake_tier": 1,
  "trigger_code": "ELEMENT_FUSION" | "SCOPE_AMBIGUITY" | "TEMPORAL_AMBIGUITY",
  "clarification": {
    "question_text": "<the slot-filled question text in English>",
    "stem_id": "<D-A16 catalogue ID when promoted; null pre-promotion>",
    "slot_fills": { "<slot_name>": "<value>", ... }
  },
  "continuation_token": "<opaque base64-encoded HMAC-signed token>",
  "evaluation_partial": null,
  "meta": {
    "engine_version": "translation-sandwich-v1",
    "fired_at_position": "layer1" | "position-2" | "position-6",
    "latency_ms": <number>,
    "cost_usd_microcents": <number>
  },
  "disclaimer": "<R3 evaluative disclaimer, unchanged>"
}
```

#### 2.1 Field semantics

- **`clarification_required: true`** — the discriminator. Clients dispatch on this field. When `false` or absent, the response is a full evaluation per ADR-004 §2.
- **`intake_tier: 1`** — fixed for force-clarification responses. Mirrors the field name on Tier 2 + Tier 3 outputs (per M1-CP4b's amendments).
- **`trigger_code`** — one of the three engine-level Tier 1 trigger codes. Surface-level Tier 1 codes (per D13's surface-level table) are out of scope for `/api/reason` because `/api/reason` has no consumer-specific input fields beyond `text`; surface-level codes engage at M2/M3/M4 consumers' own ADRs.
- **`clarification.question_text`** — the slot-filled question stem rendered in English. Pre-D-A16 promotion: alt-3 derived per D13. Post-D-A16: corpus-traced per the catalogue.
- **`clarification.stem_id`** — null pre-D-A16 promotion. Post-promotion: the catalogue ID. Allows R7 source-fidelity verification.
- **`clarification.slot_fills`** — the resolved slot values, surfaced for diagnostics + for clients who wish to re-render the question with their own template (R10 skill marketplace consumers).
- **`continuation_token`** — opaque to the client; verified server-side. See §4 for mechanics.
- **`evaluation_partial: null`** — fixed for Tier 1. Per D13: "engine halts execution; subsequent positions do not run on this request". No partial assessment is produced. (This field is reserved for a possible future extension where a partial evaluation could accompany a clarification; at present, null is the only valid value for Tier 1 responses.)
- **`meta.fired_at_position`** — diagnostic; identifies where in the sequencing the trigger fired. Useful for analytics + harness coverage.

#### 2.2 Why a new shape, not an extension of the existing shape

Under ADR-004 A-2 (full schema redesign), the cutover at M1-CP6 already commits external consumers to a shape change. Adding a discriminated-union variant (full evaluation OR force-clarification request) keeps the contract clean: clients dispatch on `clarification_required`; the two branches do not share field names; type systems on the consumer side can model this as a tagged union. The alternative — extending the full-evaluation shape with optional clarification fields — would conflate a halt-state with a complete-state and risks consumer code reading partial assessment fields when none exist.

### 3. Per-trigger detection logic

Per D13 § "Engine-level Tier 1 triggers (full text)". This ADR specifies the high-level detection logic for each trigger; the precise field-level extraction + algorithm changes are drafted as ADR-005 + ADR-006 amendments at M1-CP4e per §3.4–§3.5.

#### 3.1 ELEMENT_FUSION (fires at Layer 1)

**Detection condition:** Layer 1's extraction recognises that the input narrative contains multiple distinct concerns at the high-level Layer 1 categories (e.g., the practitioner names work + family + parents + a town meeting in a single phrase) AND cannot decompose them into separable entities suitable for downstream mechanisms.

**Layer 1 schema addition (companion ADR-005 amendment, drafted at M1-CP4e):** a new top-level field `element_fusion_detected: { fused: boolean, fused_concerns: string[] | null }`. When `fused: true`, `fused_concerns` is a non-empty array of high-level concern labels Layer 1 partially extracted before the fusion was detected.

**Question stem (per D13, pre-D-A16 transitional):** *"There are several distinct concerns here — [LIST_OF_FUSED_CONCERNS]. Before I work through this with you, can you tell me which one of these is most centrally on your mind right now?"*

**Slot fills:** `LIST_OF_FUSED_CONCERNS` rendered as a comma-separated list with Oxford "and" before the final item, drawn from `element_fusion_detected.fused_concerns`.

**Halt position:** Layer 1. Layer 2 + Layer 3 do not run.

#### 3.2 SCOPE_AMBIGUITY (fires at Position 6 — Mechanism 6 oikeiosis_stage)

**Detection condition:** Mechanism 6 cannot map the action's target to a canonical oikeiosis circle because the narrative names an action ("I responded to them") without identifying the target's relational role.

**Layer 2 algorithm addition (companion ADR-006 amendment, drafted at M1-CP4e):** a new short-circuit at Position 6 that, when `oikeiosis_stage` cannot be determined for the action's primary referent, sets a Tier 1 trigger flag and returns from `applyMechanisms` early with the trigger flag set. The standard `intake_clarifications.open_deferrals` and `soft_clarifications` from M1-CP4b are not produced (Tier 1 supersedes Tier 2 + Tier 3).

**Question stem (per D13):** *"Who else was affected by this, if anyone? And what role do they play in your life — colleague, family member, someone you don't know well?"*

**Slot fills:** none. The stem is fully canonical.

**Halt position:** Position 6. Mechanisms 7 onwards do not run. Layer 3 does not run.

#### 3.3 TEMPORAL_AMBIGUITY (fires at Position 2 — Mechanism 2 passion_root_detection)

**Detection condition:** Mechanism 2 cannot place the practitioner's concern on the 2×2 matrix (past / future × external / internal) because the temporal axis is undetermined. The narrative references a past event ("that conversation") but the practitioner's continued concern is ambiguous between regret (past-orientation) and worry about consequences (future-orientation).

**Layer 2 algorithm addition (companion ADR-006 amendment, drafted at M1-CP4e):** a new short-circuit at Position 2 that, when the temporal axis is undetermined for the dominant entity, sets a Tier 1 trigger flag and returns early.

**Question stem (per D13):** *"When you think about this situation right now, are you more concerned about something that's already happened, or something you're worried might happen?"*

**Slot fills:** none. The stem is fully canonical.

**Halt position:** Position 2. Mechanisms 3 onwards do not run. Layer 3 does not run.

#### 3.4 Companion ADR-005 amendment (drafted at M1-CP4e)

ADR-005's Layer1Schema adds:

- One new top-level field: `element_fusion_detected` per §3.1 above.
- One new entry-shape interface: `ElementFusionDetected` with the two sub-fields named.
- `REQUIRED_KEYS` extended.
- `validateLayer1Schema` extended with shape + boolean check + array-of-string check + non-empty-when-true cross-field validation.
- `LAYER1_SYSTEM_PROMPT` updated — header changed from "eleven content categories" to "twelve content categories"; category 12 added to EXTRACTION CONTRACT with worked OUTPUT example entry per PR5 worked-example discipline (one fixture-bound example showing a fused-concerns input and the corresponding extraction).
- New harness fixture F7 (element-fusion case).
- Schema version remains `layer1-schema-v1` (additive change).

The amendment is drafted in `/adopted/adr/2026-05-04-layer1-schema-specification.md` in place at M1-CP4e, with a Changelog entry dated 2026-05-06 (M1-CP4d-design) + 2026-MM-DD (M1-CP4e-amendment) per the M1-CP4b precedent.

#### 3.5 Companion ADR-006 amendment (drafted at M1-CP4e)

ADR-006's Layer2Mechanisms algorithm adds:

- Two new short-circuits in `applyMechanisms`: at Position 2 (TEMPORAL_AMBIGUITY) and at Position 6 (SCOPE_AMBIGUITY) per §3.2 + §3.3 above. ELEMENT_FUSION is detected upstream at Layer 1, so Layer 2 receives a sentinel input (e.g., when `element_fusion_detected.fused === true`, `applyMechanisms` is bypassed entirely by the route — Layer 2 not called).
- A new exported function `detectTier1Trigger(schema: Layer1Schema): Tier1Trigger | null` that runs ahead of `applyMechanisms` and returns the trigger code + slot fills if Tier 1 fires. The existing `applyMechanisms` is unchanged on the no-Tier-1 path; on the Tier-1 path it is not called for this request.
- A new controlled-vocabulary type `Tier1TriggerCode = 'ELEMENT_FUSION' | 'SCOPE_AMBIGUITY' | 'TEMPORAL_AMBIGUITY'`.
- A new interface `Tier1Trigger { trigger_code: Tier1TriggerCode; question_text: string; stem_id: string | null; slot_fills: Record<string, string>; fired_at_position: 'layer1' | 'position-2' | 'position-6' }`.
- New harness fixtures F7 (element-fusion case — paired with the Layer 1 F7 above), F8 (scope-ambiguity case), F9 (temporal-ambiguity case).
- Phase 2 + Phase 3 + Phase 4 + Phase 6 assertions extended for the Tier 1 fixtures.
- Assessment version remains `layer2-assessment-v1` (additive change to the algorithm, not the assessment shape).

The amendment is drafted in `/adopted/adr/2026-05-04-layer2-mechanism-algorithm.md` in place at M1-CP4e per the same pattern as §3.4.

#### 3.6 ADR-007 not amended

Tier 1 halts before Layer 3. ADR-007's `Layer3Prose` shape and prompt template are unchanged. ADR-007's Changelog gains no entry from this ADR.

### 4. Continuation-token mechanic

The continuation token is a stateless cryptographic signature, not a session credential. It carries no user-identifying data; it is bound to the request, not to the user. AC7 is not engaged.

#### 4.1 Token structure

A continuation token is a base64-encoded JSON payload + HMAC-SHA256 signature, joined by a single delimiter:

```
<base64(payload_json)>.<hex(hmac_sha256(payload_json, secret))>
```

The payload JSON shape:

```
{
  "v": 1,
  "input_hash": "<sha256(original_input_text) hex>",
  "trigger_code": "ELEMENT_FUSION" | "SCOPE_AMBIGUITY" | "TEMPORAL_AMBIGUITY",
  "issued_at": <unix timestamp>,
  "expires_at": <unix timestamp = issued_at + 1800>
}
```

#### 4.2 Server-side secret

A new environment variable `TRANSLATION_SANDWICH_TIER1_SECRET` holds the HMAC signing key. Set in Vercel project settings (Production + Preview + Development). Generated as a 32-byte cryptographically random value, base64-encoded. Rotation policy: rotate quarterly or on any indication of compromise; rotation invalidates all in-flight tokens but does not affect existing sessions because tokens carry no session data.

The secret is server-side only; never sent to clients; never logged. The token validation logic at the route uses constant-time comparison (`crypto.timingSafeEqual`) to prevent timing attacks.

#### 4.3 Issuance

When Tier 1 fires, the route:

1. Computes `input_hash = sha256(original_input_text)`.
2. Builds the payload with `issued_at = now()`, `expires_at = now() + 1800`, `trigger_code = <fired trigger>`.
3. Computes `signature = hmac_sha256(payload_json, TRANSLATION_SANDWICH_TIER1_SECRET)`.
4. Encodes `<base64(payload_json)>.<hex(signature)>` and returns it in the response under `continuation_token`.

#### 4.4 Validation

When the client re-submits with `continuation_token` present in the request body:

1. Split the token at the delimiter. If malformed: return HTTP 400 with `{ error: "invalid_continuation_token" }`.
2. Decode the payload; verify it parses as JSON with the required fields. If not: HTTP 400.
3. Recompute the signature over the payload; compare against the supplied signature with `timingSafeEqual`. If mismatch: HTTP 400 with `{ error: "invalid_continuation_token_signature" }`.
4. Check `expires_at >= now()`. If expired: HTTP 400 with `{ error: "continuation_token_expired", expired_at: <expires_at> }`. Client behaviour: discard the in-flight clarification and start a fresh request.
5. Compute `sha256(input.text)` from the re-submitted request. Compare to `payload.input_hash`. If mismatch: HTTP 400 with `{ error: "continuation_token_input_mismatch" }`. (This catches accidental client-side input truncation / corruption between turns.)
6. If all checks pass, the route proceeds to call the engine with the augmented input. The trigger code in the token is logged as the `previous_trigger` in the meta block of the second-turn response, for diagnostics.

#### 4.5 Why HMAC + hash, not a JWT

JWT carries more machinery than this surface needs: claims namespace, algorithm negotiation, optional encryption, key-id headers. The Tier 1 force-clarification path is bounded to one server, one secret, one algorithm, and a payload of four fields. A bespoke HMAC token is simpler, has a smaller validation surface, and is easier to audit. If a future surface engages JWT for unrelated reasons (e.g., a future agent-side authentication), Tier 1 tokens remain bespoke.

### 5. Route flow (M1-CP4e implementation reference)

The route at `/website/src/app/api/reason/route.ts` is amended at M1-CP4e per the Critical Change Protocol. The amended flow:

```
1. Existing R20a distress check at line 144 — UNCHANGED.
   If shouldRedirect: return redirect response.
2. Existing rate-limit + auth + text-length validation — UNCHANGED.
3. NEW: If request body contains `continuation_token`:
     Validate per §4.4. On any failure: return HTTP 400 with the specific error code.
     On success: extract `previous_trigger` for downstream meta logging.
4. Existing per-request RAG cache + parallel L1+L2+L3 context loading — UNCHANGED.
5. NEW: Call the translation-sandwich engine via a new orchestrator function
   (added to `parallel-run.ts` at M1-CP4e or its own module) that:
     a. Calls Layer 1 extraction.
     b. If `element_fusion_detected.fused === true`, halts and emits Tier 1 ELEMENT_FUSION response.
     c. Else, calls `detectTier1Trigger(schema)`. If non-null, halts and emits Tier 1 response with the trigger.
     d. Else, calls Layer 2 `applyMechanisms` (which itself short-circuits on TEMPORAL_AMBIGUITY at Position 2 or SCOPE_AMBIGUITY at Position 6).
     e. If Layer 2 short-circuits, halts and emits Tier 1 response.
     f. Else, calls Layer 3 `generateProse`. Returns full evaluation.
6. Existing parallel-run dispatch (bundled-depth in user-facing path; sandwich result logged) — preserved per ADR-004 §6.3 failure-isolation guarantee.
   On Tier 1 fire in the parallel path: log the fire to the comparison table; the user-facing response remains the bundled-depth result (per §6.3); the sandwich Tier 1 response is not surfaced to the user during parallel-run. At cutover (M1-CP6), the sandwich response becomes the user-facing response, and Tier 1 fires surface to the client.
7. Existing meta block + disclaimer — UNCHANGED. The meta block gains the `fired_at_position` field on Tier 1 responses; existing fields preserved on full evaluations.
```

The full implementation is the work of M1-CP4e under PR6 + AC5 + the Critical Change Protocol.

### 6. R20a perimeter preservation

Per AC5: `/api/reason` is one of the eight bound R20a routes. Per PR6 + AC4: any change touching the R20a perimeter is Critical. The Tier 1 mechanic MUST NOT bypass the existing distress check at `/api/reason` line 144.

Concretely:

- **Every turn through the route runs the full perimeter.** The first turn (initial request) and the second turn (re-submission with continuation_token) both pass the existing `await enforceDistressCheck(detectDistressTwoStage(input))` at line 144 before the engine is called. The augmented input on the second turn is what gets distress-checked.
- **The continuation token does not bypass the perimeter.** Token validation runs after the distress check (per §5 step 3 — after the perimeter, before the engine).
- **A second-turn distress fire takes precedence over the token.** If the second turn's augmented input surfaces Zone 3 acute distress, the route returns the redirect response. The continuation token is discarded; the in-flight clarification is abandoned. The practitioner sees the redirect; the clarification context is preserved client-side for retrieval after redirect resolution if desired (this is a client-side concern, not a server-side concern).
- **Phase 7 of the verification harness asserts the perimeter on Tier 1 paths** at M1-CP4e under both engines: every Tier 1 fire in the harness runs through a synthetic distress check stub to confirm the order of operations.

The R20a perimeter is engine-agnostic and turn-agnostic by design.

### 7. Failure isolation (ADR-004 §6.3 preserved)

The §6.3 guarantee — "a failure in the translation-sandwich engine during parallel-run does NOT affect the user's response" — is preserved across Tier 1 fires.

- **Parallel-run path Tier 1 fire:** the sandwich engine halts, emits a Tier 1 response, the response is logged to the comparison table, the user receives the bundled-depth full evaluation (not the Tier 1 response). The user is not made aware of the sandwich path's halt during parallel-run.
- **Parallel-run path token validation failure:** treated as any other sandwich-path failure — logged, ignored, bundled-depth result returned to the user.
- **Post-cutover (M1-CP6) Tier 1 fire:** the sandwich engine halts, emits a Tier 1 response to the user. The bundled engine is no longer in the call path. If the sandwich halt fails (e.g., trigger detection throws), the route returns a generic clarification-unavailable error per a fallback path drafted at M1-CP4e — the user is told the engine could not produce a response, not given a malformed Tier 1 response.

### 8. Verification harness extension (drafted at M1-CP4e)

The harness `verify-translation-sandwich.ts` is extended at M1-CP4e:

- **F7** — element-fusion case (Layer 1 ELEMENT_FUSION fires; engine halts at Layer 1).
- **F8** — scope-ambiguity case (Layer 1 succeeds; Mechanism 6 SCOPE_AMBIGUITY fires; engine halts at Position 6).
- **F9** — temporal-ambiguity case (Layer 1 succeeds; Mechanism 2 TEMPORAL_AMBIGUITY fires; engine halts at Position 2).

New phases / assertions:

- **Phase 1** extended with `element_fusion_detected` field assertions for F1–F9 (F1–F6 baseline-`fused: false`; F7 `fused: true` with non-empty `fused_concerns`).
- **Phase 4** extended with Tier 1 trigger expectations per fixture (F1–F6 baseline-no-Tier-1; F7 ELEMENT_FUSION; F8 SCOPE_AMBIGUITY; F9 TEMPORAL_AMBIGUITY).
- **Phase 6** extended with end-to-end orchestration: Tier 1 fixtures produce force-clarification response shape; non-Tier-1 fixtures produce full-evaluation response shape; the discriminator `clarification_required` is correct in all cases.
- **Phase 7** extended with R20a perimeter preservation across both turns (turn 1 → distress check → Tier 1 fire; turn 2 → distress check → engine resumes with augmented input).
- **Phase 11 (new)** — continuation-token mechanic: token issued on Tier 1 fire is parseable; re-validates correctly with matching input; rejects with mismatched input; rejects when expired; rejects with tampered signature.
- **Phase 12 (new)** — second-turn resume: a Tier 1 fixture's response is fed back as a second-turn input (augmented input + continuation token) and the engine produces either a full evaluation or a different Tier 1 fire (never the same trigger twice in a row, per D13's loop-guard implication).

### 9. Cleanliness rating

The Tier 1 mechanic's cleanliness rating, per the corpus discipline:

- **Detection logic — HIGH** (per D13 § "Cleanliness rating"): each trigger has a deterministic firing condition based on Layer 1 / Layer 2 outputs.
- **Question stems — HIGH post-D-A16; PARTIAL pre-D-A16 promotion**: the catalogue ID will be filled at promotion; pre-promotion the alt-3 derived stems are structurally bounded.
- **Continuation-token mechanic — HIGH**: a small, well-specified cryptographic surface. HMAC-SHA256 with constant-time comparison; bounded payload; explicit expiry.
- **Route flow — HIGH** post-implementation: the order-of-operations (perimeter → token validation → engine → response) is fully specified.

### 10. In-ADR sub-decisions explicitly deferred (per PR7)

The following are deferred decisions named here so PR7's "decisions not made are documented" discipline is honoured:

1. **Token expiry tuning.** Default 30 minutes (§4.1). Revisit at M1-CP5 if real-traffic data shows practitioners frequently exceed this window or rarely use the full window.
2. **Multiple-trigger-on-same-turn handling.** Per D13: only one Tier 1 trigger fires per turn (the first-firing one in sequencing order). A future case where multiple trigger conditions are simultaneously true (e.g., a fused narrative whose un-fused entities also have temporal ambiguity) would surface only the upstream one (Layer 1's ELEMENT_FUSION) at the first turn; the downstream one would surface at the second turn after fusion is resolved. This is the D13-specified behaviour and is preserved here. Revisit if real traffic shows users frustrated by sequential clarifications.
3. **Loop-guard maximum.** D13 implies a loop guard: "the engine does not loop indefinitely on the same trigger". The current specification does not impose a maximum-turns cap. Working assumption: Layer 1's structural boundedness means the loop terminates naturally within 2–3 turns in worst-case real traffic. Revisit at M1-CP5 if observed real traffic surfaces longer chains. A loop-guard implementation (e.g., max 5 turns; after which the engine returns a generic "I can't work through this with the information I have" message) is a future amendment if needed.
4. **External skill consumer onboarding.** The R10 announcement at M1-CP6 cutover covers the new response shape. A separate "how to handle Tier 1 force-clarification" section in the agent-developer documentation is drafted before cutover; the timing decision (M1-CP4f vs M1-CP6) is the founder's call when the announcement is being prepared.
5. **Surface-level Tier 1 triggers for `/api/reason`.** None engaged at this time. If future `/api/reason` enhancements add consumer-specific input fields (currently only `text`), surface-level Tier 1 codes would be added under a future ADR amendment. Out of scope here.

---

## Consequences

### Positive

- **AC-13 fully honoured at cutover.** The architectural commitment to the three-tier intake clarification model is operative across all three tiers (Tier 2 + Tier 3 from M1-CP4b/4c; Tier 1 from M1-CP4e per this ADR). The engine reasons by principled mechanism — including halting honestly when the input is structurally undecidable.
- **AC7 not engaged.** No cookies, no sessions, no auth surface. The Critical-tier surface area at M1-CP4e is bounded to the perimeter route + the engine modules; auth is not touched.
- **No new external dependency.** No Redis, no in-memory state store. Vercel's stateless serverless model is preserved.
- **Stateless API for skill marketplace.** External agent developers receive a self-describing force-clarification response and can render it however they choose. R10 cleanliness preserved.
- **Failure isolation preserved.** ADR-004 §6.3 guarantee holds across Tier 1 fires during the parallel-run period. The user-facing response is unaffected by sandwich-path Tier 1 fires until cutover.
- **Cost discipline.** No storage round-trip per Tier 1 fire. The single cost is one extra Layer 1 LLM call on re-submission, which is the architecturally intended behaviour per D13.

### Negative / known costs

- **Public API shape becomes a discriminated union.** External consumers must dispatch on `clarification_required`. Documented in the M1-CP6 cutover R10 announcement; consumer onboarding effort is non-zero.
- **Re-submission costs an extra Layer 1 Sonnet call.** Per Tier 1 fire, the practitioner pays approximately one additional Sonnet input + output token bundle. Real-traffic frequency will determine the cost impact at M1-CP5; R5 cost-health alerts engage during parallel-run.
- **Continuation-token mechanic adds cryptographic surface.** Small but non-zero. The surface is bounded to one HMAC verification + constant-time comparison + JSON parse + hash compare. Audit at M1-CP4e implementation review.
- **Two harness fixtures + new harness phases.** F7/F8/F9 and Phases 11 + 12 increase harness runtime + maintenance. Acceptable given coverage value.
- **M1-CP4e is a Critical-tier session.** PR6 + AC5 + Critical Change Protocol apply. The session will be longer than a Standard-tier code session and requires explicit named-risk approval before deployment.

### Risks named

- **Tier 1 over-firing.** If Layer 1 detection of ELEMENT_FUSION is over-permissive or Layer 2 short-circuits at Position 2 / 6 fire too readily on inputs that should be assessed despite ambiguity, practitioners experience a clunky "it keeps asking me questions" workflow. Mitigation: harness fixtures F7–F9 calibrated against D13 worked examples; M1-CP5 real-traffic observation; threshold tuning available via per-trigger config flags introduced at M1-CP4e if needed.
- **Tier 1 under-firing.** If Layer 1 detection misses fusions or Layer 2 fails to short-circuit when it should, the engine produces an impoverished assessment instead of asking. Mitigation: harness Phase 1 + 4 assertions per fixture; M1-CP5 spot-checks of full-evaluation responses for inputs that should have triggered Tier 1.
- **Continuation-token compromise.** If `TRANSLATION_SANDWICH_TIER1_SECRET` leaks, an attacker could forge tokens. Impact is bounded: a forged token allows submitting a `previous_trigger` value in meta logging that wasn't actually the engine's prior output, and possibly skipping the second-turn distress check in a not-yet-implemented optimisation. Currently, every turn runs distress check independently per §6, so the impact is limited to log diagnostic noise. Mitigation: secret rotation policy; secret stored only in Vercel env vars; never logged.
- **Token expiry edge cases.** A practitioner who steps away from a Tier 1 question for more than 30 minutes returns to a stale token and must re-submit fresh. Communication: client UI shows the question with a "this question expires in 30 minutes" hint at M1-CP4e implementation. Revisit expiry default at M1-CP5.
- **R20a perimeter regression on second turn.** A wiring error at M1-CP4e could place token validation before the distress check, allowing the second-turn input to reach the engine without the perimeter firing. Mitigation: AC4 invocation test (grep + execution path proof) at M1-CP4e; Phase 7 harness assertion; Critical Change Protocol's named-risk approval explicitly cites this risk before deployment.
- **Loop without termination.** Despite D13's loop-guard implication, a pathological input could in principle produce repeated Tier 1 fires (e.g., the practitioner's clarification is itself structurally ambiguous). Mitigation: §10.3 names this as a deferred decision with a loop-guard implementation available as a future amendment if observed.
- **Failure isolation regression during parallel-run.** A wiring error at M1-CP4e could cause a sandwich-path Tier 1 fire to surface to the user as a Tier 1 response when the parallel-run path should be dormant. Mitigation: explicit assertion at M1-CP4e harness Phase 8 (fallback semantics extended for Tier 1); founder verification step at M1-CP4e includes a parallel-run-active spot-check.

### What this ADR is not

- **Not an implementation.** No `.ts` file is touched at this session. M1-CP4e is the first build session under this ADR.
- **Not a Layer 1 detection algorithm specification.** ADR-005's amendment at M1-CP4e specifies the precise field-level extraction. ADR-008 specifies the high-level requirement only.
- **Not a Layer 2 short-circuit algorithm specification.** ADR-006's amendment at M1-CP4e specifies the precise short-circuit logic.
- **Not a Layer 3 amendment.** Layer 3 is unaffected.
- **Not a Tier 1 specification for consumers other than `/api/reason`.** M2/M3/M4 consumers inherit this pattern but each gets its own ADR per the migration sequence.
- **Not a commitment to the proposed harness fixture count.** F7/F8/F9 is the proposed minimum; the founder may add fixtures at M1-CP4e if coverage gaps are surfaced.
- **Not a foreclosure on revision.** If M1-CP5 real-traffic data shows the Tier 1 mechanic is over-firing, under-firing, or otherwise mistuned, ADR-008 is revisited and the founder decides whether to amend, defer, or revert.

---

## Approval

Approval signal from the founder: "approve" (or specific edits) → ADR-008 moves from `/drafts/adr/` to `/adopted/adr/` in this session. M1-CP4e becomes the next session's deliverable.

If the founder rejects ADR-008 or requests substantial edits, the draft is revised in this session or deferred to a future session. M1-CP4e does not begin until ADR-008 is Adopted.

---

## Changelog

- **2026-05-06 (initial Adoption, Sub-session M1-CP4d)** — drafted in `/drafts/adr/`, approved verbatim by founder ("approve as drafted"), moved to `/adopted/adr/`. One load-bearing decision surfaced at session open and confirmed: Option B (client-renders-form stateless protocol). Three lower-stakes parameters codified per ADR-007 precedent: HMAC-SHA256 token mechanic; 30-minute expiry; companion ADR-005 + ADR-006 amendments deferred to M1-CP4e. Tier 1 specifies three engine-level triggers (ELEMENT_FUSION at Layer 1; SCOPE_AMBIGUITY at Position 6; TEMPORAL_AMBIGUITY at Position 2) per D13's canonical specification. AC7 not engaged. Failure isolation per ADR-004 §6.3 preserved. R20a perimeter preservation specified at §6 for AC4 invocation testing at M1-CP4e.

---

*End of ADR-008 (draft).*
