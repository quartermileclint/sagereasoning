# Pass-Through Fields Design — Six Enterprise-Accountability Fields on `EvaluatedAction` and `CarriedProfile`

**Status:** Adopted 2026-05-17 under `D-PASS-THROUGH-FIELDS-LOCKED-2026-05-17`. **Implementation status:** Designed (per 0a vocabulary) — the six decisions below are specified, not built; the pass-through fields build session (session #4 of 6 in the new post-6b arc tail) is the next sub-session.
**Stream:** founder.
**Governs:** The build spec for the pass-through fields build session — `code-elevated` risk classification expected under 0d-ii (additive schema fields on `agent_accreditation` if persisted per-loop; type-system extensions to `EvaluatedAction` + `CarriedProfile`; backward-compatible per-field optional posture preserves existing substrate consumers; AC7 NOT engaged in the conventional sense — no auth surface change; the discovery files update is governance-Elevated). The six decisions below MUST be implemented as specified; the build session has discretion on file paths, helper naming, validator structure, and test organisation within those constraints.
**Does not govern:** The Option D billing model (Adopted; Verified end-to-end). The A10 design (Adopted; will be Superseded at session #5). The future tiered-per-action billing variant (Option C from the Option D brainstorm — deferred under PR7; depends on `operation_class` existing + populated, which this design lands). The future agentic-commerce VC interop (deferred under PR7 — pass-through fields could later be expressed as VC claims). The R20a perimeter changes (untouched — pass-through fields are advisory, not enforcement-bearing).
**Sequencing:** session #3 of 6 in the new post-6b arc tail per `/operations/handoffs/founder/2026-05-16-A10-design-pass-close.md` Part 2 + `/operations/handoffs/founder/2026-05-17-billing-model-build-close.md` Next Session Should. Predecessor: the Option D build (`D-BILLING-MODEL-BUILD-WIRED-VERIFIED-2026-05-17` + 2026-05-17 addendum). Successor: the pass-through fields build session (session #4 of the new ordering).

---

## Scope

**In scope (this design):** Six locked design decisions defining the pass-through fields' surface. Pass-through fields = wrapper-supplied metadata that the substrate carries through on `EvaluatedAction` and `CarriedProfile` but does not use for reasoning. Downstream consumers (Option C tiered billing once activated; enterprise procurement reviewers reading the `AccreditationPayload`; the A10 credential surface at session #5; future MCP integrations per R18c) read these fields for audit, compliance, and tiered-billing decisions. The substrate validates the enum values and persists them; it does not interpret them for Layer 1, 2, or 3 reasoning.

- **Decision A** — `operation_class` (Q1)
- **Decision B** — `downstream_identity_model` (Q2)
- **Decision C** — `path_posture` (Q3)
- **Decision D** — `target_system` (Q4)
- **Decision E** — `outcome_verification` (Q5)
- **Decision F** — `reversibility_signal` (Q6)

**Out of scope:** Code (build session). Schema migration DDL text (build session writes the SQL within the column shape named here). Wrapper-side population logic (wrappers populate these fields per their own discretion; the substrate does not prescribe how a wrapper decides `path_posture: endorsed` vs `unsanctioned` — that's a wrapper-author judgement). Changes to the substrate's existing reasoning paths (Layer 1, 2, 3 untouched). Changes to R20a classification logic (the `risk_class` field on the guardrail endpoint remains independently set — pass-through fields are advisory only; the integration section below names the relationship). Changes to A10's credential layer (separate design; A10 supersession at session #5 will incorporate these fields into the `AccreditationPayload`). Future outcome-aligned billing (deferred under PR7). Future tiered-per-action billing (deferred under PR7; this design lands the `operation_class` field tiered billing needs).

---

## The underlying motivation

After the post-6b arc's earlier sessions, the substrate carries a translation-sandwich reasoning pipeline (Layers 1, 2, 3) plus a write surface (POST `/api/accreditation/[agent_id]`) plus a metering layer (Option D — per-loop billing live in production). What's missing is **enterprise-grade accountability metadata on the actions the substrate evaluates** — the kind of data procurement reviews ask for, the kind of data CFOs evaluate when comparing cost-per-completed-unit-of-work, the kind of data security reviewers need to assess governed-path compliance.

The Nate B Jones SaaS Renewal Agent License Prompt Kit (`/inbox/20260508-262-promptkit-1.md`) is the external benchmark. The Agent System Touch Map (Prompt 1) names the taxonomies enterprise procurement teams use to assess agents: operation taxonomy (READ → DELETE in 9 values), identity-model attribution (delegated_user, service_account, ..., 7 values), access-path-status flags (endorsed/open_api/ambiguous/unsanctioned), vendor target system (Salesforce, Microsoft, ..., 8 canonical vendors), outcome-verification posture (autonomous vs human-approved), reversibility (for the buyer's risk model). The Renewal Interrogation (Prompt 2) confirms these are the same dimensions CFOs use at renewal negotiations.

The substrate's existing `EvaluatedAction` + `CarriedProfile` types carry the reasoning-relevant fields (proximity, dimension, deliberation breadth, kathekon quality, candidates considered) but no pass-through metadata for downstream accountability. Adding the six fields below makes the substrate **enterprise-readable** without changing what it reasons about.

Three downstream surfaces immediately benefit once these fields exist:

1. **Tiered-per-action billing** (Option C from the Option D brainstorm — currently deferred under PR7 because `operation_class` doesn't exist). With Decision A's field populated, Option C becomes implementable as a follow-on Elevated session — different rates for `READ` (lowest, near-zero cost) vs `EXECUTE` (highest, full base + overage) vs `DELETE` (premium for the irreversibility burden).
2. **Enterprise-readable accreditation badges** — the `AccreditationPayload` returned by the public GET endpoint (`/api/accreditation/[agent_id]`) can expose typical-class distributions across the agent's evaluation window: "this agent typically performs DRAFT operations on workday with delegated_user identity and human-approved outcome verification" tells a procurement reviewer everything the Agent System Touch Map output would. Honest, observable, R18a-compliant.
3. **A10's credential surface (session #5 rewrite)** — the A10 design's `credential_audit` table currently captures only issuance + revocation events. With pass-through fields populated on every `EvaluatedAction`, the A10 rewrite can either (i) bring some of these fields onto the credential row itself (e.g., a credential might be scoped to `path_posture: endorsed` only — issued for a specific vendor-blessed framework) or (ii) leave them entirely on `EvaluatedAction` and reference them through the audit chain. The session #5 rewrite makes this call.

A non-design note: the fields' optionality with sensible defaults is load-bearing. The existing substrate consumers (the ATL Wrapper at `/website/src/lib/substrate/atl-wrapper.ts`; the kathekon-aligned scorer at `/website/src/lib/substrate/trust-layer/scoring/kathekon-quality.ts`; the trajectory-enriched hand-back report at `/website/src/lib/substrate/trust-layer/reports/hand-back-report.ts`; etc.) produce `EvaluatedAction`s today without any of these fields. The pass-through fields land as optional with defaults so existing consumers are byte-untouched at the type-system level — no breaking change. Wrappers that want to populate the fields can; wrappers that don't get the defaults.

---

## Decision A — `operation_class`

### Why

The operation taxonomy answers "what kind of action is the agent taking?" — the gating question for every downstream accountability assessment. Procurement asks "is this a READ or an EXECUTE?" because the risk profile differs by an order of magnitude. CFOs ask "what's the cost per DRAFT vs the cost per APPROVE?" because the value-per-unit-of-work differs by category. Tiered billing (Option C, deferred under PR7) requires the field exist before it can fire. Without `operation_class`, every downstream consumer has to infer from context — error-prone, expensive, inconsistent across wrappers.

### Elected position

**9-value enum from the prompt kit, plus a 10th 'unknown' default.** Wrappers self-report per action. Optional on `EvaluatedAction`; default `'unknown'`. Vocabulary verbatim from the Nate B Jones Agent System Touch Map:

- `'read'` — Retrieving or viewing data without modification.
- `'search'` — Querying across records or datasets.
- `'summarize'` — Generating condensed versions of existing information.
- `'draft'` — Creating proposed content that requires human review.
- `'recommend'` — Suggesting actions or decisions for human approval.
- `'write'` — Creating or updating records, fields, or objects.
- `'approve'` — Triggering or completing approval workflows.
- `'execute'` — Running workflows, automations, playbooks, or actions with operational consequences.
- `'delete'` — Removing records, objects, or data.
- `'unknown'` — Wrapper has not classified the operation (default).

The 10th value `'unknown'` is added for backward compatibility (existing substrate consumers don't populate this field; they get `'unknown'` automatically) and for honest reporting (wrappers that genuinely don't know what class their operation falls into have an explicit value rather than being forced into a false choice).

### Why this and not the alternatives

- **(b) 3-value trichotomy (read / draft / execute).** Matches the Nate B Jones essay's headline framing. Simplest enum. *Rejected* because it loses substantial analytical and billing granularity: SEARCH collapses into READ (loses the high-volume query operation distinction that drives Salesforce + ServiceNow meter activity); APPROVE collapses into RECOMMEND or EXECUTE (different accountability — approval is human-in-the-loop adjacent, execution is autonomous); DELETE collapses into EXECUTE (loses the irreversibility distinction that the prompt kit's 'delete' value flags specifically). The trichotomy is fine for headline marketing; it isn't enough for operational data.
- **(c) 5-value middle-ground (read / search / draft / write / execute).** Compromise between simplicity and fidelity. *Rejected* because it isn't in any external source — invents a taxonomy halfway between the trichotomy and the prompt kit, with no external validation. Loses APPROVE + DELETE + SUMMARIZE + RECOMMEND distinctions. Risks the Nate B Jones fair-license criterion "the unit makes sense" — wrappers from different developers will interpret the partial taxonomy differently because there's no canonical source to point at.
- **(d) Free-form string (no enum).** Maximum flexibility for wrappers. *Rejected* because no enumeration means no Option C billing path (the tiered-billing implementation needs an enumerable set of values to attach rates to); no analytics aggregation (different wrappers will use 'write' vs 'create' vs 'insert' for the same operation, fragmenting the data); no marketplace consistency. Fails "the unit makes sense" outright.
- **(a) 9-value prompt-kit taxonomy + 'unknown'.** *Adopted.* Fidelity to source material; supports Option C tiered billing cleanly when activated; each value maps to distinct vendor-meter behaviour per the prompt kit's vendor intelligence (Salesforce Flex Credits price READ + SEARCH + SUMMARIZE differently than APPROVE + EXECUTE; ServiceNow's Action Fabric meters EXECUTE specifically; Workday's outcome-based billing is APPROVE-shaped). The 10-value enum maintenance overhead is trivial.

### Structural constraint

The build session adds:

```ts
export type OperationClass =
  | 'read'
  | 'search'
  | 'summarize'
  | 'draft'
  | 'recommend'
  | 'write'
  | 'approve'
  | 'execute'
  | 'delete'
  | 'unknown'
```

The field lands on `EvaluatedAction` in `/website/src/lib/substrate/trust-layer/types/evaluation.ts`:

```ts
export type EvaluatedAction = {
  // ... existing fields unchanged ...
  /** Optional pass-through metadata; wrapper-supplied; default 'unknown'.
   *  Substrate does not interpret for Layer 1/2/3 reasoning. Used by
   *  downstream consumers (Option C tiered billing; AccreditationPayload
   *  enterprise readability; A10 credential scoping). Added 2026-05-17
   *  under D-PASS-THROUGH-FIELDS-LOCKED-2026-05-17 §"Decision A". */
  readonly operation_class?: OperationClass
}
```

The optionality is load-bearing: existing substrate consumers (ATL Wrapper, kathekon-aligned scorer, hand-back report, etc.) produce `EvaluatedAction`s without this field today; they get `undefined` which the validator normalises to `'unknown'`. Wrappers that supply the field get their value validated against the enum.

The build session adds a validator helper in `/website/src/lib/substrate/trust-layer/validation/pass-through-fields.ts` (NEW):

```ts
export const VALID_OPERATION_CLASSES: readonly OperationClass[] = [
  'read', 'search', 'summarize', 'draft', 'recommend',
  'write', 'approve', 'execute', 'delete', 'unknown',
]

export function normaliseOperationClass(value: string | undefined): OperationClass {
  if (value === undefined || value === null || value === '') return 'unknown'
  if ((VALID_OPERATION_CLASSES as readonly string[]).includes(value)) {
    return value as OperationClass
  }
  return 'unknown' // soft-fallback for unrecognised values; log a warning
}
```

The soft-fallback posture (rather than throwing on unknown values) preserves backward compatibility with wrappers that supply slightly-different values (e.g., 'create' for 'write') — they land as 'unknown' rather than crashing the request. A warning is logged so the integration mismatch is visible without breaking traffic.

### R-rule engagement

R0 (the operation classification is part of the audit trail's accuracy — knowing an agent typically performs READ vs typically performs DELETE materially changes the trust assessment; oikeiosis-as-accurate-attribution); R3 (no PII in the field — the operation class is structural metadata, not user content); R4 (engine internals stay closed — the field carries no information about Layer 1/2/3 reasoning logic); R9 (no outcome promises — `operation_class` describes the action attempted, not the outcome achieved); R10 (marketplace compliance — consistent taxonomy across the marketplace + api-docs + AccreditationPayload + future tiered-billing surfaces); R18a (no category-language change — the field is operational metadata, not Character Kernel credential framing); R18c (additive — third-party verifiers that don't parse the new field are unaffected; verifiers that do gain richer signal); AC7 (NOT engaged this session; NOT engaged at the build session — additive type-system change with no auth surface impact); AC8 (substrate translation-sandwich respected — the field is Layer 4 pass-through, not Layer 1 contract input); KG1 (engaged at the build session — the validator's normalisation is synchronous; no fire-and-forget; logged warnings are awaited via the standard console.log pattern).

### Layer 1 implication

None. The field is wrapper-supplied pass-through metadata; Layer 1's text → structured features extraction does not consume `operation_class` as input or produce it as output. Layer 1's input/output shapes are byte-unchanged.

### Deferred under PR7

- **Option C tiered-per-action billing implementation.** Per-operation-class rates (e.g., READ at $0.005/loop; WRITE at $0.02/loop; EXECUTE at $0.04/loop; DELETE at $0.06/loop premium). Revisit condition: 2–4 weeks of populated `operation_class` data shows the distribution is materially varied (e.g., one wrapper does 90% WRITE and another does 90% READ) AND a real customer requests differentiated billing. Implementation: extend `computeLoopBill` in `/website/src/lib/stripe.ts` to accept `operation_class` and apply per-class multipliers; extend the `loop_billing_events.surface` column or add a sibling `operation_class` column.
- **`AccreditationPayload` typical-class distribution.** Compute `typical_operation_class` across the evaluation window (matching the existing `typical_deliberation_breadth` / `typical_kathekon_quality` pattern from D-ATL-ITEMS-1-3 + D-ATL-KATHEKON-ALIGNED-ALTERNATIVE). Revisit condition: enterprise procurement-readiness session OR first marketplace listing requires it.
- **Per-vendor operation-class normalisation.** Different vendors use different terms (Salesforce 'create' vs Microsoft 'add' vs ServiceNow 'insert' all for the same WRITE class). The current shape requires wrappers to normalise; a future helper could normalise per-vendor. Revisit condition: 3+ wrappers report friction with the manual normalisation.
- **Custom operation classes beyond the 9-value taxonomy.** A future vendor (e.g., a vertical-specific platform) might have operation classes that don't fit READ → DELETE. Current shape collapses them into 'unknown'. Revisit condition: a real use case surfaces where 'unknown' is materially insufficient.

---

## Decision B — `downstream_identity_model`

### Why

The identity model answers "on whose behalf does the agent act?" — the foundational accountability question. A `delegated_user` identity means the agent inherits a specific human's permissions; if the action goes wrong, that human is accountable, and the human can revoke. A `service_account` is a separate non-human identity with its own permission scope; accountability flows to the service account's owner. A `browser_session` typically means the agent is operating without vendor sanction (the prompt kit flags this as ambiguous-at-best for procurement); a `vendor_framework` identity (Agentforce, Copilot Studio) is the cleanest endorsed path. Without this field, the substrate has no way for wrappers to declare the operational posture downstream consumers need to assess trust.

### Elected position

**7-value enum from the prompt kit; default `'unknown'`; optional on `CarriedProfile`.** Vocabulary verbatim from the Agent System Touch Map's identity-model taxonomy:

- `'delegated_user'` — The agent acts under a specific identified human's identity, inheriting their permissions.
- `'service_account'` — The agent uses a separate non-human identity with its own permission scope.
- `'vendor_framework'` — The agent operates within a vendor's endorsed framework (e.g., Salesforce Agentforce, Microsoft Copilot Studio, ServiceNow Action Fabric agents) and uses the framework's identity model.
- `'api_key'` — The agent authenticates via an API key issued for non-interactive use.
- `'browser_session'` — The agent operates by automating a user's browser session (typically a non-endorsed pattern).
- `'mcp_server'` — The agent reaches the target system via an MCP (Model Context Protocol) server that mediates identity.
- `'unknown'` — Wrapper has not classified the identity model (default).

The field lands on `CarriedProfile` (not on `EvaluatedAction`) because identity model is a property of the agent's operational posture across actions, not a property of any single action. A `CarriedProfile` typically spans many actions; the identity model holds across them.

### Why this and not the alternatives

- **(b) 4-value coarser (delegated_user / service_account / vendor_framework / other).** Simpler enum. *Rejected* because it loses three distinctions the prompt kit flags as load-bearing for procurement: `api_key` (non-interactive automation — different from a service account because there's no associated identity record, just a credential); `browser_session` (the prompt kit's specific warning about non-endorsed access patterns); `mcp_server` (the emerging MCP-mediated identity pattern that R18c interoperability touches). Collapsing these into 'other' loses the signal procurement reviewers actually need.
- **(c) Free-form string (no enum).** No enumeration. Wrappers self-describe. *Rejected* because different wrappers will use different terms for the same identity model (e.g., 'oauth' vs 'delegated_user' vs 'user_token' all mean essentially `delegated_user`); no aggregation across the evaluation window; can't be exposed cleanly on the AccreditationPayload.
- **(a) 7-value prompt-kit taxonomy.** *Adopted.* Fidelity to source material; the seven values map to distinct procurement assessments per the prompt kit's vendor intelligence; `'unknown'` allows wrappers that genuinely don't know to be honest rather than guess.

### Structural constraint

The build session adds to `/website/src/lib/substrate/trust-layer/types/evaluation.ts` (NEW type) and `/website/src/lib/substrate/trust-layer/types/profile.ts` (assuming this is where `CarriedProfile` lives — the build session checks; if `CarriedProfile` lives elsewhere in the substrate type tree the build session lands it there):

```ts
export type DownstreamIdentityModel =
  | 'delegated_user'
  | 'service_account'
  | 'vendor_framework'
  | 'api_key'
  | 'browser_session'
  | 'mcp_server'
  | 'unknown'

export type CarriedProfile = {
  // ... existing fields unchanged ...
  /** Optional pass-through metadata; wrapper-supplied; default 'unknown'.
   *  Substrate does not interpret for Layer 1/2/3 reasoning. Used by
   *  downstream consumers for accountability attribution (A10 credential
   *  scoping; AccreditationPayload enterprise readability). Added
   *  2026-05-17 under D-PASS-THROUGH-FIELDS-LOCKED-2026-05-17
   *  §"Decision B". */
  readonly downstream_identity_model?: DownstreamIdentityModel
}
```

Validator helper in `/website/src/lib/substrate/trust-layer/validation/pass-through-fields.ts`:

```ts
export const VALID_IDENTITY_MODELS: readonly DownstreamIdentityModel[] = [
  'delegated_user', 'service_account', 'vendor_framework',
  'api_key', 'browser_session', 'mcp_server', 'unknown',
]

export function normaliseIdentityModel(value: string | undefined): DownstreamIdentityModel {
  if (value === undefined || value === null || value === '') return 'unknown'
  if ((VALID_IDENTITY_MODELS as readonly string[]).includes(value)) {
    return value as DownstreamIdentityModel
  }
  return 'unknown' // soft-fallback with warning log
}
```

Same soft-fallback posture as Decision A.

### R-rule engagement

R0 (the identity model is what makes the audit trail traceable to an accountable party — `delegated_user: <user_id>` traces to a human; `vendor_framework: agentforce` traces to a vendor relationship); R3 (the identity model field carries no PII — it's structural metadata; the *specific user_id* that a `delegated_user` references would be in a separate field, not this one); R4 (engine internals stay closed); R17 (intimate-data adjacency — knowing that an agent operates under `browser_session` vs `service_account` materially changes the R17 risk model; this field enables downstream R17 enforcement decisions); R18a (no category-language change); R18c (additive); AC7 (NOT engaged); AC8 (Layer 4 pass-through; no Layer 1 contract change); KG1 (engaged at build — validator synchronous).

### Layer 1 implication

None.

### Deferred under PR7

- **Identity-model-specific credential scoping in A10.** The A10 design rewrite (session #5) could scope credentials to specific identity models — e.g., a credential issued for `vendor_framework: agentforce` only. Revisit condition: A10 design rewrite session #5.
- **Per-identity-model billing rates.** Vendor-framework identities (Agentforce, Copilot Studio) might warrant different rates than browser_session (which signals ungoverned operation; potentially priced higher to reflect support burden). Revisit condition: post-launch — if usage data shows browser_session generating disproportionate support load.
- **Identity-model conflict detection.** A wrapper supplying `downstream_identity_model: vendor_framework` while reaching a target_system the vendor framework doesn't cover (e.g., 'vendor_framework' identity reaching 'salesforce' target_system via Microsoft Copilot Studio) is an inconsistency the substrate could surface. Revisit condition: real wrapper data shows the inconsistency happens in practice.
- **Identity-model evolution beyond the 7-value taxonomy.** Emerging patterns (federated agent identity, cross-vendor agent identity) may not fit. Current shape collapses them into 'unknown'. Revisit condition: a real pattern surfaces where 'unknown' is materially insufficient.

---

## Decision C — `path_posture`

### Why

The path posture answers "how does the agent reach the target system?" — the 🟢🟡🔴 flag from the Agent System Touch Map. An `'endorsed'` path means the agent is using a vendor-blessed framework (Agentforce, Copilot Studio, ServiceNow Action Fabric agents); this is the lowest-risk procurement story. An `'open_api'` path means the agent is using a published, stable API without special licensing restrictions; this is the legitimate-third-party story. An `'ambiguous'` path means the licensing status depends on contract terms or hasn't been publicly clarified; this is the yellow-flag story procurement wants to know about. An `'unsanctioned'` path means the agent is operating outside vendor sanction (browser automation, scraping, undocumented API use); this is the red-flag story that procurement may block outright.

The substrate does not enforce path posture (wrappers self-report; the substrate has no way to verify whether the wrapper's claim of `'endorsed'` is accurate). The field is observability for downstream consumers — including the wrapper itself, which can use the field for self-reporting in its own audit trails.

### Elected position

**4-value enum from the prompt kit; default `'ambiguous'`; optional on `CarriedProfile`.** Vocabulary verbatim from the Agent System Touch Map's Access Path Status:

- `'endorsed'` — Vendor-blessed framework path (e.g., Salesforce Agentforce, Microsoft Copilot Studio, ServiceNow Action Fabric agents).
- `'open_api'` — Published, stable API without special licensing restrictions for agent use.
- `'ambiguous'` — Licensing status depends on contract terms, API policy interpretation, or hasn't been publicly clarified.
- `'unsanctioned'` — Operates outside vendor sanction (browser automation, scraping, undocumented API use).

The default `'ambiguous'` encourages explicit assertion when wrappers are uncertain — matching the Nate B Jones essay's "do not invent specific licensing status; flag as ambiguous rather than guessing" guardrail in the Agent System Touch Map prompt.

The field lands on `CarriedProfile` (not on `EvaluatedAction`) because path posture is a property of how the agent operates against a target system across actions, not a property of any single action.

### Why this and not the alternatives

- **(b) 3-value (endorsed / open_api / unsanctioned).** Drop `'ambiguous'`. *Rejected* because it loses the honesty signal for genuinely uncertain cases. Default would have to be `'open_api'` (least-claim posture); wrappers would be forced to pick a side they don't have evidence for, biasing toward 'open_api' — the same rent-seeking pattern the Nate B Jones essay warns vendors against, but in reverse (wrappers under-reporting risk). `'ambiguous'` is the prompt-kit-canonical honest middle.
- **(c) Boolean (`endorsed: true | false`).** Maximum simplicity. *Rejected* because too coarse — loses the open_api vs ambiguous vs unsanctioned distinction. The `'unsanctioned'` bucket (browser automation, scraping) has very different accountability semantics from `'open_api'` (legitimate published API) but both would be `endorsed: false` under a boolean. Procurement reviewers reading the AccreditationPayload would have no way to distinguish.
- **(a) 4-value prompt-kit taxonomy.** *Adopted.* Fidelity to source material; carries the access-path-status signal procurement reviews ask about; `'ambiguous'` default preserves honesty.

### Structural constraint

```ts
export type PathPosture =
  | 'endorsed'
  | 'open_api'
  | 'ambiguous'
  | 'unsanctioned'

export type CarriedProfile = {
  // ... existing fields + downstream_identity_model from Decision B ...
  /** Optional pass-through metadata; wrapper-supplied; default 'ambiguous'.
   *  Substrate does not enforce; field is observability for downstream
   *  consumers. Added 2026-05-17 under D-PASS-THROUGH-FIELDS-LOCKED-
   *  2026-05-17 §"Decision C". */
  readonly path_posture?: PathPosture
}
```

Validator helper:

```ts
export const VALID_PATH_POSTURES: readonly PathPosture[] = [
  'endorsed', 'open_api', 'ambiguous', 'unsanctioned',
]

export function normalisePathPosture(value: string | undefined): PathPosture {
  if (value === undefined || value === null || value === '') return 'ambiguous'
  if ((VALID_PATH_POSTURES as readonly string[]).includes(value)) {
    return value as PathPosture
  }
  return 'ambiguous' // soft-fallback with warning log
}
```

The default `'ambiguous'` differs from Decisions A + B's `'unknown'` default — the prompt-kit Access Path Status taxonomy doesn't include 'unknown' because the choice is fundamentally about *vendor sanction*, which is always answerable (even "I don't know the vendor's exact policy" is itself 'ambiguous'). The default reflects this semantic difference.

### R-rule engagement

R0 (the path posture is what makes the agent's operational footprint honestly assessable — a substrate that lets wrappers under-report 'unsanctioned' actions as 'open_api' would be R0-violating); R3 (no PII); R4 (engine internals stay closed); R10 (marketplace compliance — consistent path-posture vocabulary across marketplace listings + api-docs); R18a (no category-language change); R18c (additive); AC7 (NOT engaged); AC8 (Layer 4 pass-through); KG1 (engaged at build).

### Layer 1 implication

None.

### Deferred under PR7

- **Path-posture-driven warning surfaces.** Wrappers that consistently self-report `'unsanctioned'` actions might warrant a substrate-emitted warning ("this agent has accumulated N unsanctioned actions in its evaluation window"). Current shape is silent. Revisit condition: a real wrapper pattern emerges where this would be useful.
- **Per-target-system path-posture validation.** Some target_system + path_posture combinations are inherently inconsistent (e.g., 'salesforce' target with 'browser_session' identity and 'endorsed' posture — Salesforce doesn't endorse browser-session agents). The substrate could detect and warn. Current shape doesn't validate cross-field consistency. Revisit condition: 3+ inconsistency reports.
- **Audit-friendly path-posture justification field.** A wrapper claiming `'endorsed'` could optionally provide a justification ("uses Salesforce Agentforce API via official SDK"). Current shape captures only the enum value. Revisit condition: enterprise customer requests justification capture.

---

## Decision D — `target_system`

### Why

The target system answers "what system does the action affect?" — the vendor enumeration procurement reviews use. The Agent System Touch Map names eight canonical vendors (Salesforce, Microsoft, ServiceNow, SAP, Workday, Zendesk, HubSpot, Atlassian) because these are the SaaS platforms with explicit agent-meter pricing in 2026; future vendors will be added as their meter models become public. The substrate's existing `loop_billing_events.surface` column captures *internal* surface (which substrate route the loop went through); `target_system` captures *downstream* system (which external vendor the agent's action affects). These are complementary, not overlapping.

### Elected position

**Two-field shape: `target_system_vendor` (10-value enum) + `target_system_detail` (optional free-form string).** Both optional on `EvaluatedAction`; vendor default `'none'`; detail has no default.

`target_system_vendor` enum:

- `'salesforce'`
- `'microsoft'`
- `'servicenow'`
- `'sap'`
- `'workday'`
- `'zendesk'`
- `'hubspot'`
- `'atlassian'`
- `'other'` — A target system not in the canonical eight (e.g., a vertical-specific platform, an internal company system, a non-SaaS service).
- `'none'` — The action doesn't affect any external system (e.g., the agent is reasoning internally; the action is a thought or a draft for human review without downstream system touch). Default.

`target_system_detail` free-form string carries sub-system granularity:

- `target_system_vendor: 'salesforce'`, `target_system_detail: 'opportunities'`
- `target_system_vendor: 'microsoft'`, `target_system_detail: 'outlook.calendar'`
- `target_system_vendor: 'servicenow'`, `target_system_detail: 'change_requests'`
- `target_system_vendor: 'other'`, `target_system_detail: 'jira_data_center'` (when 'other' is used, the detail field becomes load-bearing for identification)

### Why this and not the alternatives

- **(b) Single vendor-only enum.** `target_system` is a single field with the 10-value enum, no detail field. Simpler. *Rejected* because it loses sub-system detail — 'salesforce' alone doesn't say opportunities vs leads vs accounts. Analytics would have to infer from context; procurement reviewers reading the AccreditationPayload would see "this agent typically affects salesforce" without knowing whether it's safe-read-only-on-leads or dangerous-write-on-financial-records.
- **(c) Free-form string only (no enum).** Maximum flexibility. *Rejected* because different wrappers will use different terms for the same vendor ('salesforce' vs 'sfdc' vs 'Salesforce.com'); no aggregation; can't expose vendor distribution on AccreditationPayload.
- **(d) Hierarchical string ('vendor.subsystem' format).** Single field; convention 'salesforce.opportunities'. *Rejected* because convention-by-documentation — nothing prevents wrappers from violating it; the substrate would need string-splitting validators that may fail silently on unconventional inputs; harder to query (you'd join on `LIKE 'salesforce.%'` rather than `WHERE target_system_vendor = 'salesforce'`).
- **(a) Two-field: vendor enum + free-form detail.** *Adopted.* Best balance — vendor enum enables aggregation (analytics, AccreditationPayload typical-vendor exposure, future tiered billing by vendor); free-form detail captures sub-system granularity without enum bloat; the two fields can be validated independently.

### Structural constraint

```ts
export type TargetSystemVendor =
  | 'salesforce'
  | 'microsoft'
  | 'servicenow'
  | 'sap'
  | 'workday'
  | 'zendesk'
  | 'hubspot'
  | 'atlassian'
  | 'other'
  | 'none'

export type EvaluatedAction = {
  // ... existing fields + operation_class from Decision A ...
  /** Optional pass-through metadata; wrapper-supplied; default 'none'.
   *  Substrate does not interpret. Used by downstream consumers for
   *  vendor-level aggregation + procurement readability. Added 2026-05-17
   *  under D-PASS-THROUGH-FIELDS-LOCKED-2026-05-17 §"Decision D". */
  readonly target_system_vendor?: TargetSystemVendor
  /** Optional sub-system detail (free-form); wrapper-supplied; no default.
   *  Substrate does not validate beyond length cap. Added 2026-05-17 under
   *  same decision. */
  readonly target_system_detail?: string
}
```

Validator helpers:

```ts
export const VALID_TARGET_VENDORS: readonly TargetSystemVendor[] = [
  'salesforce', 'microsoft', 'servicenow', 'sap', 'workday',
  'zendesk', 'hubspot', 'atlassian', 'other', 'none',
]

export function normaliseTargetVendor(value: string | undefined): TargetSystemVendor {
  if (value === undefined || value === null || value === '') return 'none'
  if ((VALID_TARGET_VENDORS as readonly string[]).includes(value)) {
    return value as TargetSystemVendor
  }
  return 'other' // unrecognised vendor lands in 'other', not 'none'
}

const MAX_DETAIL_LENGTH = 100

export function normaliseTargetDetail(value: string | undefined): string | undefined {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value !== 'string') return undefined
  return value.slice(0, MAX_DETAIL_LENGTH) // truncate to length cap
}
```

The vendor normaliser distinguishes 'none' (default, no target) from 'other' (target exists but not in the canonical eight) — this is a meaningful semantic distinction the soft-fallback preserves. The detail normaliser caps length at 100 characters to prevent abuse (no 10MB detail strings landing in `loop_billing_events` rows).

### R-rule engagement

R0 (the target-system field is what makes the agent's downstream footprint visible — without it, the substrate can't honestly report on what systems the agent touches); R3 (no PII — the vendor name is structural; the detail field could in principle carry PII if a wrapper passes through a record ID, so the build session's documentation warns wrappers not to put PII in this field); R4 (engine internals stay closed); R10 (marketplace compliance — consistent vendor vocabulary); R17 (intimate-data adjacency — knowing the target system materially changes the R17 assessment; this field enables downstream R17 enforcement); R18a (no category-language change); R18c (additive); AC7 (NOT engaged); AC8 (Layer 4 pass-through); KG1 (engaged at build — validators synchronous; length-cap enforcement deterministic).

### Layer 1 implication

None.

### Deferred under PR7

- **Per-vendor tiered billing.** Different rates by target_system_vendor (e.g., enterprise vendors like SAP at higher rates than mid-market vendors like Atlassian). Revisit condition: vendor-segment data shows the tiering is justified.
- **Vendor enum expansion.** Future vendors (specifically: the next batch of SaaS platforms to add agent meters — likely Notion, Linear, Asana, Zoom). Revisit condition: a vendor moves to public agent-meter pricing AND a wrapper uses them.
- **Per-vendor detail field validation.** Vendor-specific detail format conventions (e.g., 'salesforce' detail follows the Salesforce object naming convention). Current shape is free-form. Revisit condition: 3+ wrappers report friction with the free-form approach.
- **Multi-target actions.** Some agent actions affect multiple systems simultaneously (e.g., 'sync salesforce opportunities to hubspot deals'). Current shape captures one target; would need an array or multiple fields. Revisit condition: multi-target use case surfaces.

---

## Decision E — `outcome_verification`

### Why

The outcome verification answers "how will the agent know if the action succeeded?" — the human-in-the-loop attribution that distinguishes autonomous from approved actions. The Nate B Jones essay names this as load-bearing for outcome-aligned billing per the fair-license criteria ("the model aligns with the value created" + "failed or low-value work isn't billed identically to completed work"). A `'self_reported'` outcome means the wrapper claims success without independent confirmation (the highest-trust-required posture); `'system_confirmed'` means the target system returns confirmation (the cleanest case); `'external_auditor'` means a third party verifies (the highest-rigour posture); `'not_applicable'` means the action has no verifiable outcome (e.g., a draft that's never sent).

### Elected position

**4-value enum including `'external_auditor'`; default `'self_reported'`; optional on `EvaluatedAction`.**

- `'self_reported'` — Wrapper claims success without independent confirmation. Default — the most honest baseline; downstream consumers know to weight self-reported claims as agent-asserted.
- `'system_confirmed'` — Target system returns confirmation (e.g., HTTP 200 with success body; database row count matches expected).
- `'external_auditor'` — A third party verifies (audit firm; compliance attestation service; human reviewer in a structured workflow).
- `'not_applicable'` — Action has no verifiable outcome (e.g., a draft for human review that's never sent; an internal reasoning step that produces no external effect).

### Why this and not the alternatives

- **(b) 3-value (drop external_auditor).** *Rejected* because it loses the external_auditor distinction — a future use case where a third-party verifier confirms the action would have no field to land in; would require an Elevated edit to add later. The marginal cost of including it now is the enum's 4th value; the marginal benefit is forward-looking compatibility.
- **(c) Boolean (`verified: true | false`).** *Rejected* because too coarse — loses the self_reported vs system_confirmed vs external_auditor distinctions; all three would be 'verified: true' under any honest interpretation, but they carry materially different trust semantics. Procurement reviewers asking "is this agent's success self-reported or system-confirmed?" would have no answer.
- **(a) 4-value enum including external_auditor.** *Adopted.* Fidelity to the Nate B Jones essay's fair-license framing; supports forward Option C tiered billing that weights by verification posture (an `'external_auditor'`-verified loop justifies a higher rate than a `'self_reported'`-only loop); `'self_reported'` default reflects the most-honest baseline.

### Structural constraint

```ts
export type OutcomeVerification =
  | 'self_reported'
  | 'system_confirmed'
  | 'external_auditor'
  | 'not_applicable'

export type EvaluatedAction = {
  // ... existing fields + operation_class from A + target_system_* from D ...
  /** Optional pass-through metadata; wrapper-supplied; default 'self_reported'.
   *  Substrate does not enforce verification; field describes wrapper's
   *  verification posture. Added 2026-05-17 under D-PASS-THROUGH-FIELDS-
   *  LOCKED-2026-05-17 §"Decision E". */
  readonly outcome_verification?: OutcomeVerification
}
```

Validator helper:

```ts
export const VALID_OUTCOME_VERIFICATIONS: readonly OutcomeVerification[] = [
  'self_reported', 'system_confirmed', 'external_auditor', 'not_applicable',
]

export function normaliseOutcomeVerification(value: string | undefined): OutcomeVerification {
  if (value === undefined || value === null || value === '') return 'self_reported'
  if ((VALID_OUTCOME_VERIFICATIONS as readonly string[]).includes(value)) {
    return value as OutcomeVerification
  }
  return 'self_reported' // soft-fallback with warning log
}
```

### R-rule engagement

R0 (the verification posture is what makes the agent's outcome claims honestly assessable — a substrate that lets wrappers claim 'system_confirmed' without evidence would be R0-violating); R3 (no PII); R4 (engine internals stay closed); R9 (PRIMARY engagement — the verification posture is exactly where R9's "evaluates reasoning quality, does not promise outcomes" lives; the field describes the verification *claim*, not the actual outcome); R10 (marketplace compliance); R18a (no category-language change); R18c (additive); AC7 (NOT engaged); AC8 (Layer 4 pass-through); KG1 (engaged at build).

### Layer 1 implication

None.

### Deferred under PR7

- **Verification-posture-driven billing rates.** External-auditor-verified loops at higher rates (premium service); not_applicable loops at lower rates (no value delivered yet). Revisit condition: real data on verification-posture distribution + customer interest in differentiated billing.
- **Verification evidence field.** A `system_confirmed` outcome could carry the evidence (the HTTP status code, the database query result). Current shape is enum-only. Revisit condition: enterprise audit requirements need evidence capture.
- **Verification-failure handling.** Currently the field captures successful verification; a failed verification (the target system returned error; the external auditor rejected) has no separate field — it would just not be billed or would be `'not_applicable'`. Revisit condition: failure-handling use case surfaces.

---

## Decision F — `reversibility_signal`

### Why

The reversibility signal answers "can the action be undone?" — the buyer's risk model question. An `'irreversible'` action (deleting a customer record, sending an email, transferring funds) carries higher risk than a `'reversible'` action (drafting an email never sent, updating a field with a known prior value). The signal lets downstream consumers (the wrapper itself for "ask before executing irreversible high-cost actions" patterns; the AccreditationPayload for procurement risk profiles; future R20a refinements) make differentiated risk assessments.

### Elected position

**4-value enum with `'unknown'` default; optional on `EvaluatedAction`.**

- `'reversible'` — The action can be undone cleanly (undo path exists + practical).
- `'partially_reversible'` — Some effects are undoable, others are not (e.g., 'unsend' an email by sending a follow-up — the original message has been seen).
- `'irreversible'` — The action cannot be undone (delete the record permanently; transfer the funds; send the message that recipients will see).
- `'unknown'` — Wrapper hasn't classified the reversibility (default).

### Why this and not the alternatives

- **(b) 3-value (no 'unknown'; default to safer 'irreversible').** *Rejected* because it forces wrappers to assert when uncertain — biasing toward over-cautious risk presentation for many genuinely-reversible actions wrappers don't bother to mark. The honest 'unknown' is the right default (matching the Q3 'ambiguous' pattern); downstream risk classification can weight 'unknown' + 'execute' + 'irreversible-by-default-assumption' if it wants to.
- **(c) Boolean (`reversible: true | false`).** *Rejected* because too coarse — loses partially_reversible distinction. Actions that are reversible at cost (e.g., 'unsend an email by sending a follow-up') get the same risk presentation as truly irreversible actions (e.g., 'delete the record permanently'). The partially_reversible bucket captures the real "you can recover but it'll cost you" middle ground.
- **(a) 4-value enum with 'unknown' default.** *Adopted.* Matches the Q3 'ambiguous' pattern — encourages honest "I don't know" rather than forcing wrappers into false confidence; downstream risk classification can weight 'unknown' as high-risk if it wants to.

### Structural constraint

```ts
export type ReversibilitySignal =
  | 'reversible'
  | 'partially_reversible'
  | 'irreversible'
  | 'unknown'

export type EvaluatedAction = {
  // ... existing fields + operation_class + target_system_* + outcome_verification ...
  /** Optional pass-through metadata; wrapper-supplied; default 'unknown'.
   *  Substrate does not interpret for Layer 1/2/3 reasoning. Used by
   *  downstream consumers for risk assessment + cost-aware decisioning.
   *  Added 2026-05-17 under D-PASS-THROUGH-FIELDS-LOCKED-2026-05-17
   *  §"Decision F". */
  readonly reversibility_signal?: ReversibilitySignal
}
```

Validator helper:

```ts
export const VALID_REVERSIBILITY_SIGNALS: readonly ReversibilitySignal[] = [
  'reversible', 'partially_reversible', 'irreversible', 'unknown',
]

export function normaliseReversibilitySignal(value: string | undefined): ReversibilitySignal {
  if (value === undefined || value === null || value === '') return 'unknown'
  if ((VALID_REVERSIBILITY_SIGNALS as readonly string[]).includes(value)) {
    return value as ReversibilitySignal
  }
  return 'unknown' // soft-fallback with warning log
}
```

### R-rule engagement

R0 (the reversibility signal is part of the audit trail's accuracy); R3 (no PII); R4 (engine internals stay closed); R9 (the signal describes the action's nature, not its outcome); R10 (marketplace compliance); R18a (no category-language change); R18c (additive); R20 (adjacent — Decision F's signal could inform R20a's existing `risk_class` derivation if a future session elects that integration; current scope keeps R20a's risk_class independently set); AC7 (NOT engaged); AC8 (Layer 4 pass-through); KG1 (engaged at build).

### Layer 1 implication

None.

### Deferred under PR7

- **Reversibility-signal-driven R20a risk-class derivation.** The R20a guardrail endpoint currently sets `risk_class` independently. A future session could elect to derive risk_class from `(operation_class, reversibility_signal, outcome_verification)` — e.g., `(execute, irreversible, self_reported)` = highest-risk-class automatically. Revisit condition: real wrapper data shows the manual risk_class setting is mis-calibrated relative to these structural fields.
- **Reversibility-window field.** A `'partially_reversible'` action could carry a window ("reversible within 24 hours of execution"). Current shape captures only the enum. Revisit condition: time-bounded reversibility becomes a use case (e.g., financial transfers with a 24-hour cancellation window).
- **Reversibility-cost field.** A `'partially_reversible'` action could carry the cost of reversal ("$50 transaction fee to unwind"). Current shape doesn't capture cost. Revisit condition: enterprise customer asks for cost-of-reversal capture.
- **Per-reversibility-signal billing rates.** Irreversible actions could carry a premium (matches the prompt kit's framing — wrappers performing irreversible actions need higher levels of substrate trust). Revisit condition: real demand for reversibility-weighted billing.

---

## Integration with adjacent surfaces

The six fields land on `EvaluatedAction` and `CarriedProfile` in the substrate's type system. They integrate with four adjacent surfaces. This section names where the fields land in each surface; the integration is implemented at the build session.

### Option D billing (`loop_billing_events`)

The Option D metering layer (Live in production as of 2026-05-17) writes one `loop_billing_events` row per billable loop. The pass-through fields **do not propagate to `loop_billing_events` in this design** — the loop_billing_events surface is per-loop aggregate billing data; the pass-through fields are per-action metadata. A loop can contain multiple actions with different `operation_class` values; aggregating them to one row would lose the per-action distinction the fields exist to provide.

**Integration point at the build session:** the metering layer remains untouched. Pass-through fields are queryable downstream by joining `loop_billing_events.loop_id` against `agent_accreditation` rows that carry the loop's `EvaluatedAction`s (if the build session elects to persist EvaluatedAction history per-loop in `agent_accreditation` — see the build summary table for the schema decision).

**Forward integration (deferred under PR7 — Option C tiered billing):** when Option C is activated, the per-action `operation_class` becomes the gating field for differentiated billing. The implementation extends `computeLoopBill` to optionally accept a `dominant_operation_class` derived from the loop's actions; per-class multipliers apply.

### A10 credential surface (`AccreditationPayload`)

A10's design (Adopted 2026-05-16; will be Superseded at session #5) defines the credential surface third-party verifiers consume. The pass-through fields integrate at session #5's A10 design rewrite as follows:

- **Per-credential scoping** (Decision B + C): a credential may be scoped to specific `downstream_identity_model` + `path_posture` combinations. E.g., a credential for `(vendor_framework: agentforce, path_posture: endorsed)` only — agents using browser_session paths would not match. Session #5 decides whether this scoping lands as a credential-row column or as a referenced AccreditationPayload field.
- **Typical-class exposure on AccreditationPayload** (Decision A + D + E + F): matching the existing `typical_deliberation_breadth` + `typical_kathekon_quality` pattern, the AccreditationPayload could expose typical-class distributions computed across the evaluation window: `typical_operation_class`, `typical_target_system_vendor`, `typical_outcome_verification`, `typical_reversibility_signal`. Procurement reviewers reading the payload see "this agent typically performs DRAFT operations on workday with delegated_user identity and human-approved outcome verification" — equivalent to the prompt kit's Agent System Touch Map output.

The session #5 rewrite makes the per-credential vs per-payload-exposure call. This design preserves both options.

### R20a risk classification

The R20a guardrail endpoint (Live; per Option D verification) sets `risk_class` independently of any pass-through field. The pass-through fields land alongside R20a's `risk_class` on the request body but do not modify the classifier's logic.

**Forward integration (deferred under PR7):** a future Elevated session could elect to derive `risk_class` from `(operation_class, reversibility_signal, outcome_verification)` — e.g., `(execute, irreversible, self_reported)` automatically maps to the highest risk_class. This would be an Elevated edit to the guardrail endpoint's logic and is not in this design's scope.

### Discovery files (`AGENTS.md` + `llms.txt` + `agent-card.json`)

The build session updates the three discovery files to document the new pass-through fields:

- **`AGENTS.md`** — extend the substrate-call schema section to list the six pass-through fields with their enums + defaults; cross-reference the prompt-kit source.
- **`llms.txt`** — add a "Pass-through metadata" section describing the six fields and what wrappers can populate; preserve the per-loop billing documentation unchanged.
- **`agent-card.json`** — extend the `accepts` or `metadata` block (the build session inspects current shape) to expose the six field names + enum values for agent-readable discovery.

---

## Build-session implementation summary

Expected file changes for the pass-through fields build session (session #4 of the new post-6b arc tail):

| File | Change | Decisions |
|---|---|---|
| `/website/src/lib/substrate/trust-layer/types/evaluation.ts` | MODIFIED — add 6 new exported types (`OperationClass`, `DownstreamIdentityModel`, `PathPosture`, `TargetSystemVendor`, `OutcomeVerification`, `ReversibilitySignal`); extend `EvaluatedAction` with `operation_class`, `target_system_vendor`, `target_system_detail`, `outcome_verification`, `reversibility_signal` (5 fields); extend `CarriedProfile` with `downstream_identity_model`, `path_posture` (2 fields) — verify CarriedProfile lives here; if not, the relevant types file. Total: 7 new fields across two interfaces. | A, B, C, D, E, F |
| `/website/src/lib/substrate/trust-layer/types/accreditation.ts` | MODIFIED — port-mirror update; the file's banner instructs "if /trust-layer/types/accreditation.ts changes, re-port it here in the same change" — so if `CarriedProfile` lives in `accreditation.ts` rather than `evaluation.ts`, this file gets the same extensions. If it doesn't, this file gets a comment cross-reference. | B, C |
| `/trust-layer/types/accreditation.ts` (or `/trust-layer/types/evaluation.ts`) | MODIFIED — the verbatim source-of-truth port-mirror for the substrate/trust-layer ports. Same changes as above; the substrate-internal port follows. | A–F as appropriate |
| `/website/src/lib/substrate/trust-layer/validation/pass-through-fields.ts` | NEW — six `VALID_*` constants + six `normalise*` functions per the structural constraints above; one helper module for all six validators (cohesion). | A, B, C, D, E, F |
| `/website/src/lib/substrate/trust-layer/accreditation/accreditation-record.ts` | MODIFIED — if AccreditationPayload exposure is included (per Integration §A10), extend `buildAccreditationPayload` to optionally include typical-class fields; otherwise documentation-only cross-reference to the future session #5 rewrite where this lands. The build session's discretion on whether to include exposure now vs defer to #5. **Recommended: defer to #5** to keep this build session lean. | A–F (deferred) |
| `/api/migrations/agent-accreditation-pass-through-fields.sql` | NEW (if persisting per-loop EvaluatedAction history) OR documentation note (if not persisting in this build) — the build session decides whether the six fields land as additive nullable columns on an existing table or remain in-memory. **Recommended: no migration in this build**; persistence deferred to session #5 (A10 rewrite) where the storage shape is decided in context. | A–F (deferred) |
| `/product/AGENTS.md` | MODIFIED — pass-through-metadata section added; six fields documented with enums + defaults; cross-reference to the prompt kit source. | A, B, C, D, E, F |
| `/website/public/llms.txt` | MODIFIED — same as AGENTS.md. | A, B, C, D, E, F |
| `/website/public/.well-known/agent-card.json` | MODIFIED — `accepts` or `metadata` extension naming the six field schemas. | A, B, C, D, E, F |
| Test files | NEW — `/website/src/lib/substrate/trust-layer/validation/__tests__/pass-through-fields.test.ts` — plain-assertion tests covering: each normaliser's enum membership; each normaliser's default behaviour on undefined / null / empty; each normaliser's soft-fallback on unknown values; the length cap on target_system_detail; mixed-field combinations (e.g., `target_system_vendor: 'salesforce'` + `target_system_detail: 'opportunities'` round-trip). Expected ~40–50 tests. | A, B, C, D, E, F |
| `/operations/decision-log.md` | NEW entry — `D-PASS-THROUGH-FIELDS-BUILD-WIRED-VERIFIED-YYYY-MM-DD` (lean form per Elevated risk). | All |
| Session close | NEW — `/operations/handoffs/founder/YYYY-MM-DD-pass-through-fields-build-close.md` (lean form per Elevated risk). | All |

Expected pass-through fields build session: **~2–3 hr**; **Elevated** risk under 0d-ii (additive type-system changes + discovery files update + tests; no schema migration in the lean form; no auth surface change; AC7 NOT engaged in the conventional sense). PR1 single-build proof applies — the 7 new fields + validators + tests + discovery files land in one session. PR2 build-to-wire verification immediate. The persistence shape (whether the 6 fields persist per-loop on `agent_accreditation` or remain in-memory only) is deferred to session #5's A10 rewrite where the storage-vs-not-storage call is made in context.

---

## Cross-references

- `/operations/decision-log.md` — `D-PASS-THROUGH-FIELDS-LOCKED-2026-05-17` (this design's adoption entry)
- `/operations/handoffs/founder/2026-05-17-billing-model-build-close.md` — predecessor close; "Next Session Should" names this design pass
- `/operations/handoffs/founder/2026-05-16-A10-design-pass-close.md` Part 2 — scoping source (the six pass-through fields were named in the brainstorm here)
- `/adopted/billing-model-design.md` — structural template for this design's six-decision shape (modelled on its eight-decision shape; Option D's `loop_billing_events.surface` enum named in the Integration section); Decision E's deferred-under-PR7 tiered-per-action billing names `operation_class` as the gating field — this design lands that field
- `/adopted/atl-a10-design.md` — A10 design Adopted, will be Superseded at session #5 of the new post-6b arc tail; the rewrite incorporates the pass-through fields per the Integration §A10 section
- `/inbox/20260508-262-promptkit-1.md` — Nate B Jones SaaS Renewal Agent License Prompt Kit; Prompt 1 (Agent System Touch Map) is the canonical source for Decisions A + B + C + D's enum vocabularies; Prompt 2 (Renewal Interrogation) confirms these are the procurement-and-CFO dimensions
- `/inbox/Related to agent API billing.rtf` — companion essay; the fair-license criteria framing applies across all six decisions ("the unit makes sense"; "the meter is visible"; honest framing of self-reported vs system-confirmed vs external-auditor verification)
- `/website/src/lib/substrate/trust-layer/types/accreditation.ts` — existing types file; port-mirror banner instructs that changes here propagate to `/trust-layer/types/accreditation.ts`
- `/website/src/lib/substrate/trust-layer/types/evaluation.ts` — `EvaluatedAction` + `KathekonQuality` + `DeliberationBreadth` live here; the six new fields' main landing zone
- `/website/src/lib/substrate/trust-layer/accreditation/accreditation-record.ts` — `buildAccreditationPayload` lives here; future integration point for the AccreditationPayload typical-class exposure (deferred to session #5)
- `/manifest.md` — particularly §R0 (audit trail authenticity); §R9 (no outcome promises in pricing — Decision E's verification posture lives in this rule's vicinity); §R10 (marketplace consistency — all six decisions); §R18a (Character Kernel framing preserved — pass-through fields are operational metadata, not credential framing); §R18c (additive interoperability — third-party verifiers that don't parse new fields are unaffected); AC7 (NOT engaged — additive type-system change); AC8 (translation-sandwich substrate; pass-through fields are Layer 4 pass-through, not Layer 1 contract); AC10 (provenance — pass-through fields are upstream provenance candidates for A12's OpenTelemetry integration, mirroring `loop_billing_events`'s role); KG1 (engaged at build session — validator normalisation synchronous); KG7 (NOT engaged — no JSONB writes; all fields are text or text arrays)
- `/operations/agentic-commerce-findings-downstream-order.md` F4 — pass-through fields are upstream provenance for A12 OpenTelemetry integration post-launch (parallel to `loop_billing_events`'s F4 role)
- `/adopted/standing-protocol-cache.md` — governing frame (Lean template; governance row; Standard risk default for this design pass)
- `/adopted/build-sessions-protocol-cache.md` — "no current users" governing note (load-bearing for the build session's CCP-step-3 simplification)

*End of design document.*
