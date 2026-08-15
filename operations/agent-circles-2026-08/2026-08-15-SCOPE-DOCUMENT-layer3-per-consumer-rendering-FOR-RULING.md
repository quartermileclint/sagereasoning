# SCOPE DOCUMENT — Layer 3 per-consumer rendering (for mentor ruling)

**Date:** 2026-08-15. **Produced by:** concurrent-arc session C3 (scoping session B), under the
M2 ruling of 2026-08-15 (*"The AI runs each session and produces a scope document for ruling…
The sessions produce the document. The mentor rules on the document. Execution folds into
post-run sessions after the ruling."*) and under Ruling Set C of the 2026-08-15 C2 rulings,
which explicitly awaits this document (*"The Layer 3 session remains OPEN — awaiting ruling —
and is not ruled here. It will be ruled in a separate consultation once the scope document is
produced under the M2 process."*). **Input record:**
`2026-08-12-SESSION-layer3-per-consumer-rendering-SCOPING-RECORD.md`, as amended 2026-08-14
(the Stage 2 relational-context widening). **Status: FOR RULING.**

Nothing here is a build, a design of record, or a recommendation beyond what the input record
licenses — and the input record licenses none (*"Not pre-answered. Nothing below proposes what
an agent-calibrated rendering would contain."*). Where the record binds something (the
discriminator-reuse constraint; the R20d boundary; the four placeholder fields as design
target), it is stated below as an **inherited constraint**, not a recommendation. Every
mechanism named was verified against the code first-hand on 2026-08-15, including a live probe
of the production route (§2.3).

> **⚠ `SUBSTRATE_LAYER3_ENABLED` remains UNSET, live-verified 2026-08-15 (§2.3). Its
> activation is a founder-walked step and is NOT licensed by this document, by the session that
> produced it, or by any ruling on it short of an explicit activation ruling plus the
> founder-walked 0c-ii step.** Restated from the input record, at the mentor's original
> instruction.

---

## 1. The questions for ruling

- **L-1 (whether):** Should the S7 "Layer 3 out of launch scope, internal-only" decision be
  re-opened on the ground that the guide's response is uncalibrated for practitioner type
  everywhere outside the R20a crisis path? The S7 decision is presented honestly in §2.2; the
  decision space is §3.1.
- **L-2 (what distinguishes):** If re-opened — what distinguishes an agent-calibrated rendering
  from a human-calibrated one, given that Layers 1 and 2 are correctly practitioner-blind? §3.2
  presents the distinctions the architecture already encodes, as observed material for the
  ruling, not as a proposed design.
- **L-3 (the discriminator's limits):** The auth-signal discriminator-reuse constraint is
  inherited and binding (§2.5). What is for ruling is how its two named honest limits are
  carried — transport-level classification and the relay pattern (§3.3) — and the required
  distinctness between the discriminator and the self-declared `relationship_type` field
  (§3.4).
- **L-4 (relational context — the widened scope):** What does the guide need to know about the
  practitioner's relational context to respond appropriately? The two minimum pieces, the R20d
  self-side boundary, and the four placeholder fields are carried in §2.9; the landing-surface
  decision space and the fields' honest limits are §3.4.
- **L-5 (the reflect-wording residual — SEVERABLE):** The Q1–Q6 reflect sequence invites
  self-examination in language presuming an interior access the architecture declines to trust
  (§2.7). **This question is severable from L-1:** `/api/practice/reflect` is live today; the
  wording gap exists whether or not the dormant Layer 3 surface is ever re-opened, and can be
  ruled independently. §3.5 presents what a ruling would decide and the instrument-change
  discipline any wording change carries.

---

## 2. Verified mechanics (PR20 — first-hand, 2026-08-15)

### 2.1 The session question, verbatim (surfaced, not answered)

> Should the S7 "Layer 3 out of launch scope, internal-only" decision be re-opened on the
> ground that the guide's response is uncalibrated for practitioner type everywhere outside the
> R20a crisis path — and if so, what distinguishes an agent-calibrated rendering from a
> human-calibrated one, given that Layers 1 and 2 are correctly practitioner-blind?

### 2.2 The S7 decision, from its primary record

The primary record is `operations/decision-log.md:10842`, founder decision 4 of
`D-PRELAUNCH-S7-A13-DELIVERY-BUILT-DEPLOY-DEFERRED` (2026-06-09):

> 4. Standalone Layer 3 (`/api/substrate/layer3`) — **OUT of launch scope** (internal-only);
> remains inert (`SUBSTRATE_LAYER3_ENABLED` unset → 503). Settles the carried S7 scope
> question; recorded per PR7; revisit post-launch.

Two facts the honest presentation must carry. First, the decision was a **launch-scope rider**
inside a session whose spine was A13 alert delivery — it settled a carried scope question on
launch-readiness grounds, with "revisit post-launch" recorded in the decision itself. Second,
the grounds available to it: the route's intended consumers (Stage 3 plugin-originated
traffic) did not exist, and the per-consumer differentiation inside the service was itself
still a stub (§2.3). **The ground it did not have** is the one the 2026-08-12 mentor ruling
supplied: the ongoing agent-guide relationship examined as its own question. The S7 decision
was sound on its grounds; re-opening it is the mentor's call.

### 2.3 The dormant surface — what actually exists (live-verified)

- **The route:** `website/src/app/api/substrate/layer3/route.ts` — the flag gate at `:85-97`
  returns 503 `substrate_layer3_disabled` when `SUBSTRATE_LAYER3_ENABLED` is unset; the header
  (`:39-41`) states *"When flag is OFF, returns 503. No production traffic possible."*
  **Live-verified 2026-08-15:** a read-only probe of
  `POST https://www.sagereasoning.com/api/substrate/layer3` returned HTTP 503
  `substrate_layer3_disabled` — the flag posture is confirmed on production, not inherited
  from records.
- **The service:** `website/src/lib/substrate/layer3-service.ts` (`generateLayer3Response`) —
  wraps the live prose generator with the deterministic injection set (R3 disclaimer, R19c
  limitations, R19d mirror-principle when mentor-flavoured, R20a distress pass-through when
  gated, R18a category framing when requested, R18e transparency notice).
- **The differentiation machinery is parameter plumbing, not finished mechanism.** The service
  header states it plainly (`layer3-service.ts:122-124`): *"This session (A5 scaffolding)
  implements PARAMETER PLUMBING ONLY. All four modes currently route to the existing
  api_reason prose template. A6 (next or subsequent session) fills in per-mode templates"* —
  and A6's per-mode templates were never built. `ProseMode` (`:127` —
  `clinical | terse | standard | educational`) routes all four values to one template;
  `Layer3Consumer` (`layer3-prose.ts:63`) admits exactly one consumer, `'api_reason'`, and
  any other consumer throws (`layer3-prose.ts:728-732`). **Consequence for L-1:** the input
  record's "the mechanism was built, verified, and then deliberately scoped out" is true of
  the service, route, and injection set; the per-consumer *differentiation* those wrap was
  never designed. Re-opening S7 does not flip a finished calibration on — it opens a design
  question the S7-era build never reached.
- **The seam the design target would use already exists:** `ConsumerContext`
  (`layer3-service.ts:200-223`) carries `consumer`, an optional
  `audience?: R20aAudience` (added S4, 2026-05-28 — today driving only crisis rendering;
  defaults to `'agent_developer'` on absence as the safest default for unknown callers,
  `:205-213`), `include_category_framing?`, and `is_mentor_flavoured?`. A practitioner-type
  calibration would extend this context type rather than invent a parallel one.

### 2.4 The live Layer-3 prose — one template for both practitioner types

`website/src/lib/translation-sandwich/layer3-prose.ts` is **live on `/api/reason`** (the M1
deferral moves *when* the narrative is generated — `assessment_first` defers it, CI-17
guarantees it exists and is retained — never *what form* it takes). `/api/reason` serves both
practitioner types: web-authenticated human callers (the `/private-mentor`, `/mentor-hub`,
`/ops-hub`, `/mentor-index` page flows) and API-key/plugin agent callers. All receive prose
from the single `api_reason` template (`layer3-prose.ts:755` — *"Select per-consumer system
prompt. At M1, only api_reason exists"*). This is the mechanical form of the ruling's
"uncalibrated for practitioner type everywhere outside the R20a crisis path" on the shared
consult surface.

The rest of the architecture's current calibration strategy is **route segregation**, not
rendering: the human tools run their own routes with their own prose paths (the five score
routes on `runSageReason`; `/score-scenario` + `/reflect` on raw `messages.create`; the
`/api/mentor/*` tools), and the agent surfaces are API-only. Segregation calibrates by
audience-exclusive construction; it leaves the shared surfaces (`/api/reason`) and the
agent surfaces whose wording inherits human-introspective framing (§2.7) uncalibrated.

### 2.5 The discriminator — verified, with an input-side sharpening

The single live derivation is `website/src/app/api/reason/route.ts:805`:

```ts
const r20aAudience: R20aAudience = auth.user?.id ? 'human_user' : 'agent_developer'
```

with the assignment table in the comment block at `:786-804` (Supabase JWT / cookie-session →
`human_user`; API-key or plugin-auth → `agent_developer`). The renderer
(`website/src/lib/substrate/r20a-audience-renderer.ts`) is the single form-picker: the
`R20aAudience` type at `:153`, the structural split at `renderR20aRedirectResponse`
(`:286-309`), the derivation described in the header at `:43-45`. Both audience branches are live
in production (`SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED=true` since 2026-05-31).

**Sharpening the input record did not carry — it strengthens the finding.** The same
`auth.user?.id` signal already drives a second practitioner-differentiated behaviour on
`/api/reason`: `route.ts:1408` gates practitioner context —
`auth.user?.id ? getPractitionerContext(auth.user.id) : Promise.resolve(null)` — so web
(human) callers get personalised Layer-2 practitioner context and API (agent) callers do not.
The route's own S4 comment (`:794-797`) names this deliberately: reusing the signal *"keeps
the audience determination on the same determinant."* So the architecture already tells the
two practitioner types apart in production and already differentiates on it **input-side**
(what the engine is given) — while the **response side** renders one form for both, except in
crisis. The gap is narrower and therefore sharper than "the architecture only discriminates in
crisis": the discriminator exists, runs on every consult, and feeds personalisation; only the
rendering ignores it.

### 2.6 The crisis precedent — the only differentiated rendering

`renderR20aRedirectResponse` returns structurally different payloads: `human_user` →
`{ distress_detected, severity, redirect_message }` (direct address to the person in need,
resource list included); `agent_developer` → `{ status: 'redirected', distress_detected,
severity, developer_note, suggested_user_message, flow_terminated, safety_signal? }` — a
structured flag addressed to the operator, with the human-form message carried inside
`suggested_user_message` for the operator to relay through their own safety pipeline
(`R20A_DEVELOPER_NOTE_DEFAULT`, `:175-184`). The renderer's own header (`:105-106`) places it
architecturally: *"helper sits at the Layer-3 audience-rendering surface within the
translation-sandwich architecture; sibling to layer3-service.ts."* The crisis path is thus
both the precedent for *telling the types apart* and the precedent for *what a per-type
rendering looks like* (§3.2).

### 2.7 The reflect wording, verbatim, and its live instrument coupling

The Q1–Q6 question text lives in `website/src/lib/sage-reflect/question-bank.ts`
(`REFLECT_QUESTIONS`, `:46-127`). Verified exemplars:

- **Q1** (`:50-53`): *"What impressions were presented to you during this session? Which of
  them, on reflection, were distorted — presenting as genuine goods or genuine evils what were
  in fact indifferents?"*
- **Q2** (`:63-65`): *"Where during this session did you assent to an impression before
  examining it? What was the impression, and what false judgement did the assent carry?"*

The residual as ruled into this session: this wording invites first-person introspective
report — "presented **to you**," "**on reflection**," "where did **you** assent" — while the
architecture simultaneously runs the forensic posture that declines to trust exactly that
access (`l4-passion-audit.ts`, reading the trace out-of-band, structurally barred from
self-report) and treats divergence between the two postures as the signal (G4). The
architecture's both-postures design is deliberate and **already encoded**; the residual is a
**wording** gap on the invitational surface only — the invitation does not disclose the
posture it sits inside.

**The instrument coupling PR20 requires naming: the reflect wording is upstream of live
trust-event emission.** Verified 2026-08-15:

- The G4 suppression watch runs at reflect completion (`reflect-service.ts:519-544` →
  `emitSuppressionWatchEvents`, `emission-hooks.ts:199`), crossing Q4's surfaced passions
  against the session's Ed25519-re-verified signed assessments. Its two event types carry
  real effects (`trust-transition.ts:48,58`): `passion-unflagged-by-self-screen` =
  **decrease**; `self-screen-absent` = **flag**.
- The honest-completion event `reflect-completed-honest` = **modulate**
  (`trust-transition.ts:42`), keyed on verbatim provenance (`reflect-service.ts:505-516`).
- Q6 carries the mandatory orientation sub-question (`question-bank.ts` /
  `ORIENTATION_REFLECT_QUESTION`, agent-circles C2e), feeding the live orientation-reading
  ledger (all three orientation events = **flag**, insert-only).
- The G4 cross-check's 3-part standard is gated on the controlled `SUB_SPECIES` vocabulary —
  wording changes that shift how agents name passions in Q4 answers shift the cross-check's
  hit rate.

**Consequence:** a Q1–Q6 wording change is not effect-free copy-editing. It changes the
elicitation side of a measured distribution feeding decrease-, flag-, and modulate-class
events on the live trust ledger, and it touches a sequence the mentor has already ruled on
structurally (the 2026-06-12 methodology verdicts: reflect default-on, *"sequence never
abbreviated"*). §3.5 carries the discipline this implies.

### 2.8 Three "Layer 3"s — a disambiguation so the ruling lands on the right one

The codebase and records carry three distinct things under the name "Layer 3." The ruling
should land on (a) and its wrapper (b); (c) is named only to prevent collision:

- **(a) `translation-sandwich/layer3-prose.ts`** — the live prose generator on `/api/reason`
  (§2.4). One consumer, one template.
- **(b) `substrate/layer3-service.ts` + `/api/substrate/layer3`** — the dormant per-consumer
  rendering service that wraps (a) with the injection set and the `ConsumerContext` seam
  (§2.3). This is what S7 scoped out and what the session question names.
- **(c) The alt-3 RAG-mentor design's "Layer 3 translation specification"** (D11,
  `/adopted/rag-mentor-alt3/layer-3-translation.md` — Adopted 2026-05-02, design only; its
  Phase-2 build has not begun) — a design for the human mentor architecture, not built,
  carrying its own per-consumer projection rules and its own R20d prohibition (second-person
  passion attribution prohibited). It is **not** this session's subject; it is evidence only
  that R20d-at-Layer-3 has design precedent in the project (§2.9).

### 2.9 The relational-context amendment — verified pieces

- **R20d verified at source:** `agent-learning-integration-april-2026.md:334`, DA4.3 —
  *"Relationship-asymmetry breach. The mentor diagnosing the practitioner's spouse, boss, or
  cousin is R20d violation. Engage the self-side, decline the other-side."* The input record's
  cite is exact. The record's carried inversion note stands with it: the Grok research
  consulted on 2026-08-14 frames calibration as helping the practitioner understand the other
  party; the Stoic frame inverts this — the guide's first move when relational context is
  active is *what impression are you assenting to about this relationship, and have you
  examined it?*
- **The two minimum pieces** (carried verbatim in kind from the record): (1) the
  practitioner's **role** in the relationship, not the relationship type — different roles
  carry different kathekonta, and the guide calibrates to the role; (2) whether the
  practitioner's impressions about the relationship are being **examined or assumed**.
- **The four placeholder fields are named, not built — verified:** `relational_context`,
  `practitioner_role`, `relationship_type`, `examination_status` appear nowhere in
  `website/src` (repo-wide grep, 2026-08-15). They are the design target, exactly as the
  record intends.
- **The classical locus is now text-verified** (discharging the record's own "transcribed,
  not text-verified" flag): Cicero, *De Officiis* 1.107–115 — verified 2026-08-15 against the
  Perseus Digital Library text (Walter Miller translation, Loeb 1913). §107 carries the two
  natural personae (*"we are invested by Nature with two characters… one of these is
  universal, arising from the fact of our being all alike endowed with reason… The other
  character is the one that is assigned to individuals in particular"*); §115 carries the
  third and fourth (*"To the two above-mentioned characters is added a third, which some
  chance or some circumstance imposes, and a fourth also, which we assume by our own
  deliberate choice"*). The four-personae doctrine spans exactly the cited sections. The same
  locus now also carries mentor-ruling standing via Ruling Set A (R-1, R-5), which cited it
  directly.

---

## 3. The decision space (presented, not answered)

### 3.1 L-1 — whether to re-open: three postures

- **O-A — S7 stands; the gap is accepted and disclosed.** No re-open. The honest form would
  add a disclosure to the R18 surfaces that the guide's response outside the crisis path is
  not calibrated for practitioner type. *For:* no instrument change; no design debt taken on
  before the 0h call; the route segregation (§2.4) already gives de facto calibration on
  human-only tools. *Against:* the 2026-08-12 examination's ground stands unanswered — the
  ongoing agent-guide relationship gets human-shaped or undifferentiated rendering
  indefinitely; the reflect residual (L-5) would still need its own answer, because it lives
  on a live surface regardless.
- **O-B — re-open the question narrowly: calibration on existing live surfaces, wording-level
  first.** The S7 decision about the *route and flag* stands; what re-opens is the
  practitioner-type calibration question on surfaces already live — the reflect Q1–Q6 wording
  (L-5) and, if ruled, the live `api_reason` prose template's treatment of its two caller
  types. *For:* addresses the concrete instance the record itself names as "what
  uncalibrated costs in practice"; no dormant surface or flag involved; smallest honest step.
  *Against:* wording-level calibration on a single-template surface has a ceiling — it cannot
  express structurally different payloads the way the crisis precedent does (§2.6); touching
  the live template is an instrument-adjacent change with its own discipline (§3.5, §4).
- **O-C — re-open fully: the per-consumer rendering design.** The design question the S7-era
  build never reached (§2.3) is opened: what an agent-calibrated rendering contains, designed
  into the existing seam (`ConsumerContext` + the unfilled per-mode/per-consumer templates),
  with the relational-context fields (L-4) as part of the design target. Activation remains
  explicitly not licensed; the design would be produced for its own ruling before any build.
  *For:* the only posture that can express the full distinction space (§3.2) and give the
  relational-context fields a coherent home; uses machinery that already exists as plumbing.
  *Against:* the largest scope; lands mostly post-run and post-design-ruling in any case; the
  consumers that would justify the standalone route (plugin-originated traffic) still do not
  exist, so parts of O-C would be design-ahead-of-demand — the same consideration that made
  S7's call sound.

O-B and O-C are not mutually exclusive: O-B's wording work is contained in O-C's design space,
and a ruling could adopt O-B now with O-C's design opened later (or never). The sequencing
consequences are identical either way (§8).

### 3.2 L-2 — what distinguishes the two renderings: the distinctions already encoded

Presented as observed architectural material, not a proposed design. The crisis precedent
(§2.6) and the reflect residual (§2.7) together encode four distinction dimensions, and the
2026-08-14 amendment adds a fifth:

- **(a) Who the reader is presumed to be.** Human form: the practitioner themselves, addressed
  directly. Agent form: the operator/agent as an intermediary bearing relay responsibility
  (`developer_note` + `suggested_user_message` — the human-form content carried *inside* the
  agent form, not replaced by it).
- **(b) Direct address vs structured relay.** Human form: prose. Agent form: structured
  fields, machine-consumable, with explicit flow-state (`flow_terminated`).
- **(c) Which interior-access presumptions the language makes.** The reflect residual is the
  concrete instance: wording written for a reader whose introspective report the architecture
  trusts differs from wording honest to a reader whose self-report is deliberately
  cross-checked out-of-band. An agent-calibrated wording could disclose the posture
  (invitation + the fact of the forensic cross-check) rather than presume the access.
- **(d) Which affordances are named.** Human form: crisis resources, support paths. Agent
  form: endpoints, structured next steps, the operator's own escalation process.
- **(e) Role-calibration (the widened scope).** What the guide needs to know about the
  practitioner's relational context — the two minimum pieces (§2.9) — before its response can
  be appropriate to the role occupied, with the R20d self-side boundary governing the
  response's direction regardless of practitioner type.

What the ruling would settle under L-2 is which of these dimensions (if any) constitute the
distinction the project should encode, and whether (c) — the honesty dimension — is the
load-bearing one, as the record's residual suggests.

### 3.3 L-3 — the discriminator's honest limits

The reuse constraint is inherited and binding (input record: any second practitioner-type
discriminator must reuse the auth-signal one; two independent notions that could disagree
would put a safety decision and a rendering decision on different footings). The verified
mechanics (§2.5) add two honest limits any calibrated rendering inherits:

- **Transport-level classification.** The signal classifies the *caller*, not the downstream
  practitioner: an agent operator whose end-user is human reads `agent_developer`. The crisis
  precedent already handles this honestly via the relay pattern (`suggested_user_message` —
  the human-form content travels inside the agent form). A calibrated rendering that adopted
  the same pattern would inherit the same honesty; one that did not would need its own answer
  to the relayed-human case.
- **The flag-off asymmetry is historical, not live.** The route falls back to `'human_user'`
  when the audience-rendering flag is off (`route.ts:800-804`) while `ConsumerContext`
  defaults to `'agent_developer'` on absence (`layer3-service.ts:205-213`); the flag has been
  on since 2026-05-31, so only the service-side default is operative for future consumers.
  Named so a future design does not treat the two defaults as contradictory precedent.

### 3.4 L-4 — relational context: landing surfaces and honest limits

**The `relationship_type` distinctness requirement (for ruling, flagged here as a
constraint-precision):** `relationship_type` (human–human / human–agent / agent–agent)
describes the relationship the practitioner is reasoning *about*; the discriminator describes
the practitioner's *own* type. These must remain distinct notions by construction — the moment
`relationship_type` is read to infer *which practitioner type is this*, a second discriminator
exists and the inherited constraint is violated. The document flags this because the two are
easy to conflate: a `human–agent` relationship declared by an agent practitioner and the
`agent_developer` audience read from auth are different facts about different parties.

**Landing surfaces for the four fields (presented, not recommended):**

- **F-a — the `ConsumerContext` extension (the dormant seam).** The fields extend
  `ConsumerContext`/`Layer3ServiceInput` on the per-consumer service. Coherent with O-C only;
  inert until the route ever activates; no live surface touched.
- **F-b — request-level fields on live surfaces** (`/api/reason` input; the reflect open).
  Reaches the practitioners who exist today. Both surfaces are fenced while the validation run
  is in flight (`/api/reason` is one of the four fenced route contracts), so this lands
  post-run regardless of ruling; any addition is additive-optional with absent ⇒ byte-identical
  behaviour, per the project's standing flag/field discipline.
- **F-c — the human mentor tools** (`/api/mentor/*` surfaces, where relational material
  already arrives as free text). Human-side work: out of this arc's agent-first ordering;
  named for completeness because R20d's original home is the human mentor (§2.9).
- **F-d — design-target only (status quo).** The fields stay named-not-built until a design
  session is licensed by the ruling. This is the current state and remains coherent under
  O-A.

**Honest limits carried with the fields, whatever the landing:**

- **Self-report, unverifiable by construction.** `practitioner_role` is self-declaration
  "held against behaviour over time" (the record's own phrase). This is the same class as
  Ruling Set A's R-3 named honest limit for the runner's remit statement — *"self-report
  through extraction, unverifiable by construction. The corroboration check has nothing to
  corroborate it against"* — and should be carried in the same posture: a named honest limit,
  not a blocking constraint. (Set A touchpoint noted; nothing ruled there is re-opened here.)
- **Personal-data class if persisted.** `relational_context` / `practitioner_role` /
  `examination_status` are practitioner personal data the moment they persist. Any persisted
  form engages R17 (encryption where intimate, data-rights wiring: access/export/delete) and,
  on human surfaces, sits adjacent to the R20a perimeter's subject matter (relationship
  material is Zone-2 working material). As categorical/binary fields they carry less than free
  text, but the wiring obligation is structural, and it is why F-b/F-c are heavier than they
  look.
- **Event effects: none.** None of the four fields implies a trust event, an evidence-gate
  interaction, or an S4 input on any presented landing. They are rendering/input-context
  only. If a future design ever proposed emitting events from relational-context declarations,
  that would be a new scoping question, not an execution detail of this one.

### 3.5 L-5 — the reflect-wording residual: what a ruling decides

A ruling on L-5 would decide whether the Q1–Q6 invitational wording should be recalibrated for
the agent practitioner — for instance (illustrative of the *kind* of change, not proposed
wording) whether the invitation should disclose the posture it sits inside (that answers are
cross-checked out-of-band against signed evidence, and that honest "I cannot determine" is a
legitimate answer) rather than presuming interior access. What this document establishes is
the discipline any yes-ruling carries, from §2.7's verified coupling:

1. **Mentor-vetted verbatim wording** — the sequence is mentor-ruled territory (2026-06-12:
   never abbreviated), and the project's precedent (the B5 suggestion-line) is that even
   concept-approved wording on measured surfaces awaits mentor-vetted verbatim.
2. **Instrument-change discipline** — the wording is the elicitation side of distributions
   feeding live decrease/flag/modulate-class trust events (G4, honest-reflect, the Q6
   orientation sub-question). A wording change should land at a clean boundary (post-run;
   with the change recorded so any before/after read of reflect-derived event rates is
   segmentable), the same class of discipline the arc already applies to the false-hold
   observation window (R4 starts the new window only after every measured-instrument edit is
   live).
3. **Structure is not touched** — the never-abbreviated sequence, the mandatory
   sub-questions (FD-R3, FD-R4, the C2e orientation sub-question), and the G4 mechanism are
   all outside a wording ruling's reach unless the mentor explicitly re-opens them, which
   this document does not ask.

---

## 4. Affected architectural surfaces (PR20, per mechanism)

| Mechanism (by option) | Files/surfaces touched | Event effects | Evidence-gate interaction | Public vs ledgered vs rendered | MEASURE/ENFORCE posture |
|---|---|---|---|---|---|
| O-A disclosure | `llms.txt`, `agent-card.json`, api-docs (R18, founder wording sign-off) | none | none | public docs only | n/a (documentation) |
| O-B / L-5 reflect wording | `question-bank.ts` (`REFLECT_QUESTIONS` `default_text`); no mechanism file changes | none directly; **shifts elicitation feeding** `passion-unflagged-by-self-screen` (decrease), `self-screen-absent` (flag), `reflect-completed-honest` (modulate), orientation readings (flag) | none (G4's deriver, vocabulary gate, and 3-part standard unchanged) | rendered to the agent in-sequence; the events it feeds are ledgered; nothing new served publicly | wording is advisory rendering; the coupled events remain MEASURE as today; nothing binds |
| O-B live-prose calibration (if ruled) | `layer3-prose.ts` (live on `/api/reason`) ± `parallel-run.ts`; prose-deferral battery | none (prose binds nothing; CI-17 narrative-existence must hold per type) | none | rendered on consults; narratives retained encrypted (R17b) | rendering only; nothing binds |
| O-C per-consumer design | `layer3-service.ts` (`ConsumerContext`, per-mode templates), `layer3-prose.ts` (consumer vocabulary), `/api/substrate/layer3` route, `layer3-service.test.ts`; flag **not** set | none | none | dormant surface (503) until a separate activation ruling + founder walk | rendering only; nothing binds |
| L-4 fields, F-a | `layer3-service.ts` types + battery | none | none | dormant | rendering only |
| L-4 fields, F-b | `/api/reason` request shape (**fenced while the run flies**; post-run regardless) and/or reflect open (`request-helpers.ts` etc.); additive-optional, absent ⇒ byte-identical | none | none | request context; if persisted → R17 data-rights wiring required | input context; nothing binds |
| L-4 fields, F-c | human `/api/mentor/*` surfaces (out of this arc's ordering) | none | none | human-side; R17 + R20a-adjacent subject matter | input context; nothing binds |

Every row: no change to Layers 1–2 (which remain correctly practitioner-blind — the
extraction and deterministic scoring are the same operation regardless of who reasoned), no
trust-event vocabulary change, no evidence-gate change, no flag set in any session executing a
ruling (activations are separately walked), and the Q1 hard constraint untouched (the loop
proposes; it never executes). Weights remain BLOCKED.

---

## 5. Boundary against the kathêkon session (ruled and closed — Set A)

Both this session and the kathêkon session draw on role-carries-kathekonta; neither absorbs
the other (the input record's own boundary, restated with Set A now closed):

- The kathêkon session asked how an *act or proposal is judged* role-relatively (the guardrail
  takes no role input). Set A ruled it: role-relativity yes-conditionally (R-1), guardrail-
  local threading (R-2, D-i), human-authored-protocol source with the self-report honest limit
  (R-3), the remit gate as a pre-filter not a winner-rule amendment (R-4), and the
  role-blindness naming qualification with wording in hand (R-5).
- This session asks what the *guide's rendering* needs to know about relational context — a
  response-side question. Shared ground touched without re-opening: the R-3 honest-limit
  class applies verbatim to `practitioner_role` (§3.4); the four-personae locus Set A's R-1
  cited is now text-verified (§2.9). Nothing in Sets A or B is re-opened, amended, or
  executed by this document.

---

## 6. Citations discipline (C2 lesson — the input record's cites re-verified)

Every load-bearing cite in the input record was re-verified first-hand before reproduction,
and the document's own cites were then independently re-verified by a claims-vs-repo check
before close. Two of the record's cites drifted (content unchanged, locations moved) and are
corrected wherever this document cites them:

- `CLAUDE.md:347` → the Layer 3 bullet is now at **`CLAUDE.md:352`** (wording as quoted).
- `reflect-service.ts:521-522` / `emission-hooks.ts:195-196` → the G4 sites are now at
  **`reflect-service.ts:519-544`** and **`emission-hooks.ts:195-199`** (same content).

Verified exact as cited: **`r20a-audience-renderer.ts:45`** (the derivation-description
header comment — the quoted text is a comment, with the actual form-picking code at
`renderR20aRedirectResponse` `:286-309` and the payload-shape comments at `:74-84`; recorded
honestly: this document's pre-check first mis-read the line as `:46`, and the independent
claims-vs-repo check caught the inversion — the record's `:45` was correct all along, the
file untouched since its original S4 commit); `layer3/route.ts` flag-gate/header (`:85-97` /
`:39-40` — the record cited `:84-95`, within drift tolerance and content-exact);
`agent-learning-integration-april-2026.md:334` (DA4.3, byte-exact); decision-log:10842 (the
S7 primary record). The Cicero locus is text-verified (§2.9), discharging the record's own
flag.

---

## 7. Not asked / out of scope

- **`SUBSTRATE_LAYER3_ENABLED` activation** — not licensed by this document or any ruling on
  it (restated per the mentor's original instruction; see the banner).
- **Any build or code edit** — M2 is explicit: scope documents only; execution folds into
  post-run sessions after the ruling.
- **The five C2 ruled-additions items** (A/R-5, A/R-3, B/M-A, B/M-B, B/R-6) — all post-run,
  slotted in the arc plan; none executed or re-scoped here.
- **The uniformity-reads-as-stable family** — open in the hegemonikon scoping record, ruled
  together or not at all; not this session's.
- **GS-ATRF-1/2/3, the four QG rulings, B1's §2.12, the S6 frozen null result, the
  `high|medium|low` blast-radius vocabulary** — untouched.
- **The alt-3 RAG-mentor Layer 3 (D11)** — named in §2.8 for disambiguation only.
- **The founder-convened Prudence Q2 and SagePals Stage-4 questions** — not pre-answered.
- **The 0h call, the S11 flip, weights (BLOCKED), the P0 hold** — standing, unchanged.
- **The fenced surfaces** — the three IDEA-loop flags, watching vocabularies, runner
  credential, the four live route contracts, `idea_loop_*` schema: untouched by this session;
  any F-b-class execution is post-run by fence regardless of ruling.

## 8. Sequencing note

Per M2: this document goes to the mentor at the founder's cadence; **execution of whatever is
ruled folds into post-run sessions after the ruling.** Additional sequencing facts a ruling
may want in hand: any `/api/reason`-adjacent execution (F-b; live-prose calibration) is
post-run by fence independently of M2; any reflect-wording execution carries the
instrument-change discipline of §3.5 (mentor-vetted verbatim; land at a clean boundary,
recorded for segmentability); any O-C design output would itself return for ruling before any
build, and any activation after that remains a separately-walked founder step. The document
self-starts nothing.

*End of scope document. Status: FOR RULING.*
