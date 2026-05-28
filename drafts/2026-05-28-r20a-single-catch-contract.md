# Design Spec — R20a Single-Catch Contract + Propagation Flag (Option A)

**Status:** **Drafted 2026-05-28** under the Option A build arc. Implementation status (0a): **Designed**. Decision status (0f): **Under review** until the founder approves the per-endpoint build sessions that implement it.
**Decision ID (this design):** R20a-SC1 (Single-Catch Contract spec, session 1 of the Option A build arc).
**Origin:** Option A build arc, session 1, 2026-05-28 — verification + design (read-only; no production code).
**Authoritative parent:** `/adopted/adr/2026-05-27-r20a-configuration-perimeter-and-audience-contract.md` (Accepted 2026-05-27 under `D-R20A-ADR-ADOPTED-SEQUENCING-2026-05-27`). This spec firms up Sections A.1–A.5 of that ADR into a concrete contract the build sessions implement.
**Predecessor close:** `/operations/handoffs/founder/2026-05-27-r20a-config-perimeter-adr-adopted-close.md`.
**Cross-references:** `/manifest.md` §R20a, §AC2 (~500ms two-stage budget — accepted), §AC4 (invocation testing), §AC5 (the eight-route perimeter + ninth-route protocol), §AC8 (translation-sandwich), §R19 (honest positioning); `/website/src/lib/substrate/r20a-gate.ts` (A7 — the seed); `/website/src/lib/substrate/layer3-service.ts` (A5.4); `/website/src/lib/sage-reflect/zone3-boundary.ts` (the existing carrier-field at Reflect's input boundary); `/data-room/03_seam_map/seam-map.md`.

---

## §0 — What this spec is, and what it is not

**Is:** the contract the build sessions implement to deliver Option A's *configuration-level R20a perimeter*. Three things in one document — the single catch, the audience-correct rendering, and the propagation carrier — because they are one mechanism, not three.

**Is not:** a re-litigation of the ADR (Option A is Accepted); not the Layer-3 audience-message wording (that is the A6 design work, which this spec scopes but does not draft); not the per-endpoint Critical Change Protocols (each endpoint wiring carries its own CCP at the build session that wires it).

**Discipline:** PR15 first. The design reuses A7 (Layer-2 gate), A5.4 (Layer-3 distress injection), the per-consumer `prose_mode` slot from A6, and Sage Reflect's existing `safety_signal` carrier. No primitive is rebuilt.

---

## §1 — Findings from session 1 verification (carried forward, with signals)

The ADR named four open verification items. Session 1 resolved them by code-read:

1. **A7 / Layer 2 inspects only `text: params.input`** — *Diagnostic-certain*. Not the Layer-1 schema, not `discovered_purpose`. `parallel-run.ts:582-587`. Consequence: Calling-origin distress arriving as `discovered_purpose` is unscreened. L4/L6 get no catch today. **ADR's anticipated gap set holds.**
2. **`/api/reason`'s `redirect_message` is human-framed on the agent API path** — *Diagnostic-certain (mechanism)*; *Diagnostic-uncertain — pattern level (intent)*. `buildRedirectMessage()` at `r20a-classifier.ts:263-275` produces text addressed to the person in distress; returned verbatim at `route.ts:625` (route guard) and `route.ts:846-858` (Branch 1.7 — A7 redirect). Compare Reflect's `ZONE3_DEVELOPER_NOTE` (`zone3-boundary.ts:70-75`) which is developer-framed. **The audience-form gap A.3 names is confirmed; founder treats this as a gap to correct under A.3 (not as intentional).**
3. **No seam carries a substrate-emitted distress flag end-to-end today** — *Diagnostic-certain*. The only existing locus using `safety_signal` is Reflect's developer-input boundary (`request-helpers.ts:22, 40, 78-85`). Seams 1, 3, 4 carry no such field; Seam 2 carries an internal `distress_signal` on `Layer2Assessment` for A5.4 only. **The A.4 propagation carrier is net-new as a mechanism; the field name `safety_signal` is reusable.**
4. **Reflect's harm-flag carrier reconciles with A.4 — one mechanism, not two — by widening the contract along three axes:** producer set (developer-only → developer + substrate); cause vocabulary (`harm_flagged` only → `harm | distress` with severity); semantics (read-once at one boundary → flow-terminating + idempotent + cross-seam). *Diagnostic-certain (path); Diagnostic-uncertain — pattern level (exact union shape — this spec proposes one in §4).*

**None of the four findings changes the ADR's catch locus or gap set. No ADR amendment is required by the verification.** This spec is therefore a free-standing design under the existing Accepted ADR.

---

## §2 — The single distress-catch contract at the substrate boundary

### §2.1 — Locus

**One catch, at the substrate's Layer-2 boundary.** A7 (`/website/src/lib/substrate/r20a-gate.ts`) is the seed; it stays where it sits — inside `runSandwichInner`, after Layer 1 extraction, before `applyMechanisms`. The "single catch" is not a *new* function — it is *A7, called from every entry that produces substrate-bound text*.

**What changes for the substrate (Reasoning) consumer:** nothing. A7 already runs on `/api/reason`'s `input` via the `safetyGate` passthrough (zero added latency). This is the proof endpoint per PR1.

**What changes for non-substrate consumers (Calling, Reflect-content):** their free-text human-bearing input must route *through* A7's catch (either by sending text to the substrate which then runs A7, or by an authorised in-process call into `enforceLayer2R20aGate`). Calling and Reflect-content each get a separate PR1 + CCP build session (§5).

### §2.2 — Input shape (what every consumer hands to the catch)

The catch already accepts `EnforceR20aGateInput` (`r20a-gate.ts:326-336`):

```ts
interface EnforceR20aGateInput {
  text: string                  // the raw human-bearing text to classify
  gate?: SafetyGate             // optional — pass-through from a prior route-level R20a check (zero added latency)
  sessionId?: string            // optional — for cost tracking via the underlying classifier
}
```

**Decision:** **reuse this shape unchanged**. It is the substrate boundary's contract; every consumer that catches through the substrate uses it. No new wrapper. (PR15: A7 is the substrate primitive; do not rebuild.)

**Consumer mapping:**
- `/api/reason`: passes `input` + `safetyGate` (status quo; unchanged).
- `/api/calling` (Calling-conversation `response`): passes the agent's verbatim conversational turn as `text`; no prior gate to pass through, so A7 makes a fresh classifier call inheriting the AC2 ~500ms budget on borderline inputs. Per-call cost: one Haiku invocation. Cost-tracking goes through `sessionId`.
- `/api/practice/reflect` (Reflect-content path): passes the agent's free-text content as `text`; no prior gate. Same fresh-call posture as Calling.

**What does NOT route through the catch:** structured agent outputs that carry no free-text human-bearing surface (e.g. `accreditation` signed-credential records). The ADR-confirmed AC5 stance — agent-facing-only routes are out-of-perimeter because they process agent output, not human distress input — is preserved.

### §2.3 — Authoritative verdict object (what the catch returns)

The catch already returns the `R20aGateOutput` discriminated union (`r20a-gate.ts:170-207`):

```ts
type R20aGateOutput = R20aGateResult | R20aGateBypassedResult

interface R20aGateResult {
  decision: 'PASS' | 'REDIRECT'
  distress_signal: boolean      // true on PASS + mild severity (sub-threshold)
  redirect_message: string | null  // present on REDIRECT only
  severity: 'none' | 'mild' | 'moderate' | 'acute'
  underlying: DistressDetectionResult
  span_id: string               // AC11 OpenTelemetry
  source: 'fresh_call' | 'reused_gate' | 'outer_throw'
}
```

**Decision:** **reuse the type unchanged as the verdict object**. Two amendments to its use are made downstream (§3 and §4), but the type itself does not change.

**Why it works:** the type already distinguishes the three outcomes (PASS-no-signal, PASS-with-mild-signal, REDIRECT). Mild stays a substrate-prose injection through A5.4. Moderate/acute short-circuits Layer 2 + Layer 3 and surfaces the redirect to the calling consumer for per-audience rendering (§3).

### §2.4 — Catch existing callers obtain the verdict

- `/api/reason` (status quo): A7 fires inside `runSandwichInner`; `R20aGateOutput` is attached to `SandwichRunResult.substrate_r20a_gate_output` and (when REDIRECT) `SandwichRunResult.error = 'r20a_gate_redirect'` with the redirect shape on `output`. The route reads these and renders.
- Calling and Reflect-content (build-session work): the build session wires the catch in-process before whatever their current "engage" step is. The verdict object is read and routed (REDIRECT → halt + render; PASS → continue, attach distress_signal if mild).

---

## §3 — Per-consumer Layer-3 rendering (the A.3 audience contract)

### §3.1 — One catch, two output forms

The catch is one. The rendering is two:

- **Human user form** (sagereasoning.com web tools — `/api/reason` called from web; future human-facing web tools). Reader: the person in distress. Text: the existing `buildRedirectMessage()` crisis pass-through + resource list.
- **Agent-developer form** (the API surfaces — `/api/reason` agent-API path; `/api/calling`; `/api/practice/reflect`). Reader: a developer / agent operator. Shape: a structured flag + a developer note (the existing `ZONE3_DEVELOPER_NOTE` is the model: *"this is not a crisis pathway; do not proceed; route through your own safety/escalation process"*). Optionally a `suggested_user_message` the agent MAY relay to its own user.

### §3.2 — Consumer identification

The selector lives in the `consumer_context` slot already used by A5 (`layer3-service.ts` — `consumer_context: { consumer: 'api_reason', is_mentor_flavoured: boolean, include_category_framing: boolean }`). Add a single field:

```ts
interface ConsumerContext {
  consumer: 'api_reason' | 'api_calling' | 'api_practice_reflect' | /* ... */
  audience: 'human_user' | 'agent_developer'  // NEW — drives R20a redirect rendering
  is_mentor_flavoured: boolean
  include_category_framing: boolean
}
```

**Audience assignment per surface (initial):**

| Surface | Audience |
|---|---|
| `/api/reason` from sagereasoning.com web tools | `human_user` |
| `/api/reason` from external API (agent / plugin / API-key) | `agent_developer` |
| `/api/calling` (API-only) | `agent_developer` |
| `/api/practice/reflect` (API-only) | `agent_developer` |
| `/api/mentor/private/reflect` (founder web tool) | `human_user` |
| Future plugin-internal callers | `agent_developer` (default) |

**Determination point:** at the route, from the same auth signal already used to distinguish web vs API traffic (cookie/session vs API key vs plugin token). The route sets `audience` once and passes it into A5 via `consumer_context`.

### §3.3 — Renderer placement

The catch returns `R20aGateOutput` (severity + the existing human-framed `redirect_message` when REDIRECT). The render decision is per-audience:

- **`audience: 'human_user'`** — return `redirect_message` (the existing crisis pass-through) on the wire. Behaviour matches today's sagereasoning.com.
- **`audience: 'agent_developer'`** — replace the wire shape with a developer-form payload:

```jsonc
{
  "distress_detected": true,
  "severity": "moderate" | "acute",
  "developer_note": "<the agent-developer-framed standing text>",
  "suggested_user_message": "<the existing crisis pass-through, optional for the agent to relay>",
  "flow_terminated": true
}
```

**Where this lives in code:** the rendering selector is a single helper in `layer3-service.ts` (or a sibling module) that converts an `R20aGateOutput` + an `audience` into the wire shape. The helper is the *only* place that picks the form. This means:
- The route does not branch on audience for distress; it only sets `audience` once and passes the verdict + audience to the helper.
- The Layer-3 prose-mode work (A6) supplies the standing text strings (human + developer) and the optional `suggested_user_message`.

### §3.4 — `/api/reason`'s existing agent-API gap

Finding 2 confirms `/api/reason` today returns the human-framed `redirect_message` over the agent API. **Under this spec the fix is:**

- The route's two redirect branches (`route.ts:623-630` route-guard branch; `route.ts:846-858` Branch 1.7) call the new render helper with the route's `audience` setting.
- When `audience === 'human_user'` (web call): wire shape unchanged (status quo).
- When `audience === 'agent_developer'` (API call): wire shape becomes the developer-form payload above.

**Risk classification of this fix:** Critical (PR6 + AC5 — any change touching R20a redirect logic). The fix lands in the Layer-3 audience-rendering build session (§5.4), after Calling + Reflect-content wiring proves the verdict object and the propagation flag end-to-end.

### §3.5 — Standing text (A6 dependency)

The exact wording of the developer-form `developer_note` and the (optional) `suggested_user_message` is **A6 design work** — `prose_mode` per-consumer Layer-3 prose. This spec scopes A6 to:
- Two new prose-mode keys: `r20a_developer_note` and `r20a_suggested_user_message`.
- Initial wording drawn from `ZONE3_DEVELOPER_NOTE` (developer note) and `buildRedirectMessage()` (suggested user message), with founder review.
- Standing rule: the developer note tells the agent operator the substrate has halted and that this is not a crisis pathway; the suggested user message is the existing human pass-through, surfaced separately so the agent operator may relay it through their own safety pipeline.

A6 is its own sub-task. This spec does not draft the wording.

---

## §4 — The propagated, flow-terminating distress flag (A.4)

### §4.1 — Carrier

**Decision:** **reuse `safety_signal` as the carrier name.** The field already exists at Reflect's input boundary (`request-helpers.ts`); reusing the name keeps one mechanism rather than introducing a parallel one. The schema widens (§4.2). The Diagnostic-uncertain note in `zone3-boundary.ts:24-32` ("the canonical harm-flag contract is a founder-ack item") resolves into the canonical schema below.

### §4.2 — Canonical schema (the contract)

```ts
type SafetySignalCause = 'distress' | 'harm'  // extensible later

interface SafetySignal {
  /** True when the configuration must halt and not re-screen. */
  flow_terminated: boolean

  /** What kind of termination this is. */
  cause: SafetySignalCause

  /** Distress severity, when cause === 'distress'. Reflect's harm path uses 'n/a'. */
  severity: 'n/a' | 'mild' | 'moderate' | 'acute'

  /** Free-text detail for forensics + audit. Never user-facing. */
  detail?: string

  /** Where in the configuration the catch fired. AC11 span ID is the canonical link. */
  caught_at: 'substrate_layer2' | 'reflect_input_boundary' | 'other'

  /** Reflect's `harm_flagged: boolean` is computed from `cause === 'harm' && flow_terminated`. */
}
```

**Migration of existing Reflect contract:**
- Reflect's existing `SafetySignal { harm_flagged: boolean; detail?: string }` (zone3-boundary.ts:46-51) is a **subset** of the canonical schema. When a developer supplies the old shape on Reflect's input, the parser maps:
  - `harm_flagged === true` → `{ flow_terminated: true, cause: 'harm', severity: 'n/a', detail, caught_at: 'reflect_input_boundary' }`.
  - `harm_flagged === false` → `{ flow_terminated: false, cause: 'harm', severity: 'n/a', detail, caught_at: 'reflect_input_boundary' }` (or omit entirely).
- This is a non-breaking change at Reflect's input boundary (existing developer integrations keep working).
- Reflect's internal `checkZone3Boundary` widens to check `flow_terminated && (cause === 'harm' || cause === 'distress')` — the harm path is preserved exactly; the distress path is new.

### §4.3 — Producers and consumers

**Producers** (anywhere `flow_terminated: true` can be set):
- **Substrate, after A7 catches REDIRECT** (the new path): substrate emits `safety_signal: { flow_terminated: true, cause: 'distress', severity: 'moderate' | 'acute', caught_at: 'substrate_layer2', detail }` on its outward output. Mild PASS does NOT set `flow_terminated: true` — mild is a Layer-3 prose injection only (A5.4 path) and the loop continues.
- **Developer, at Reflect's input boundary** (the existing path, unchanged in behaviour): the developer supplies `safety_signal` to indicate an upstream harm finding. Mapped to the canonical schema as in §4.2.

**Consumers** (anywhere `safety_signal.flow_terminated === true` triggers halt + idempotent skip):
- The route returning the substrate's output (translates to the wire shape per §3).
- Any downstream stage that reads `safety_signal` (Reflect, future stages added under K-category migration).

### §4.4 — Halt semantics

When a consumer reads `safety_signal.flow_terminated === true`:

1. **It does NOT re-run the distress catch on the same content.** Even if the consumer is a substrate caller (which would normally invoke A7), the in-process call sees `safety_signal.flow_terminated === true` and skips A7.
2. **It does NOT progress the configuration's normal flow.** Reflect does not engage its six-question sequence; a subsequent reasoning pass does not invoke Layer 2 + Layer 3 in normal mode; etc.
3. **It DOES record the kathekon failure or distress event** per the cause:
   - `cause === 'harm'`: Reflect's existing `zone3KathekonRecord` path (unchanged).
   - `cause === 'distress'`: a substrate audit record (new — the existing vulnerability_flag table is the natural home, but the exact write path is build-session work).
4. **It DOES surface the audience-appropriate output** per §3.

### §4.5 — Idempotency rule

A consumer that reads `safety_signal.flow_terminated === true` and is configured to emit its own audience output **emits exactly one notification per configuration flow**. The first authoritative catch emits; downstream stages see `flow_terminated === true` and skip emission.

**Mechanism:** the propagated `safety_signal` carries `caught_at`. Downstream consumers compare `caught_at` to their own position: if `caught_at` is upstream of "me", I MUST NOT emit. (If "me" is the catch point, I emit; this is the single emission.)

### §4.6 — What this looks like on the seams

| Seam | Today | After build |
|---|---|---|
| Calling → Reasoning (`DiscoveredPurpose`) | Five slots, no distress field | Five slots **plus** `safety_signal` when the substrate's Calling-side catch fires |
| Substrate Layer 2 → Layer 3 internal | `distress_signal: boolean` on Layer2Assessment | Unchanged (A7.3 internal). Distinct from the cross-seam `safety_signal` (which is on the outward wire). |
| Substrate output → route → consumer | None | `safety_signal` is a top-level field on the substrate's output shape when set |
| Reflect input boundary | `safety_signal: { harm_flagged, detail? }` developer-supplied | Same field, canonical schema; developer-supplied OR substrate-emitted upstream |

---

## §5 — Per-endpoint wiring plan

### §5.1 — Order: Calling first, then Reflect-content (per founder direction §28)

**Reasoning:**
- Calling is the higher-impact catch. The Calling→Reasoning seam is the gap that motivated Option A (Finding 1). Proving the contract there first stresses the propagation flag end-to-end across a configuration boundary.
- Reflect-content has a smaller mechanical change (the carrier field already exists at Reflect's input boundary) but a smaller proof per session.
- PR1 single-endpoint discipline: one endpoint proven before rollout. Calling first.

### §5.2 — Session A — Calling-side R20a catch + propagation (Critical; PR1; CCP)

**Scope:**
- Wire `enforceLayer2R20aGate` (with no `safetyGate` passthrough — Calling has no prior gate) into `/api/calling`'s handler **before** the agent's `response` is folded into the next conversational state.
- On REDIRECT: render per §3 (audience: `agent_developer`); halt the calling-conversation flow; surface the developer-form payload. Emit `safety_signal: { flow_terminated: true, cause: 'distress', severity, caught_at: 'substrate_layer2', detail }` on the outward response.
- On PASS + mild: continue the calling-conversation; attach the substrate's internal distress_signal to whatever Calling's hand-off to Reasoning carries (initial design: include `safety_signal: { flow_terminated: false, cause: 'distress', severity: 'mild', caught_at: 'substrate_layer2' }` on the `DiscoveredPurpose` hand-off envelope so Reasoning's A5.4 path injects pass-through prose).
- On PASS + none: continue unchanged.

**Critical Change Protocol (0c-ii) — engages at the build session:**
1. **What is changing:** adding a synchronous A7 invocation to `/api/calling`. AC5 perimeter broadening (Calling becomes the ninth route in the human-distress perimeter — new ground; the AC5 ninth-route protocol applies in full: registry entry, classifier import, call pattern, invocation test).
2. **What could break:** Calling's existing conversational flow regression (false-positive redirects mid-conversation); AC2 latency added to every Calling turn that contains free text (~500ms for borderline inputs, accepted); the `safety_signal` emission on the outward shape is a new field — consumers that strictly validate Calling's response shape may reject it (mitigation: additive only).
3. **Existing sessions:** N/A per build-arc cache ("no current users").
4. **Rollback:** environment flag `SUBSTRATE_CALLING_R20A_ENABLED` (default OFF) gates the new path. Rollback = flag OFF + redeploy.
5. **Verification:** invocation test (AC4) on `/api/calling`; positive test with the existing `C2_DISTRESS_INPUT` fixture; negative test confirming neutral conversational input passes unchanged.
6. **Founder approval:** explicit per the named risks.

**PR1 single-endpoint proof:** Calling is the proof endpoint for the cross-seam propagation. Reflect-content wiring waits on Calling Verified.

**Status target:** Calling-side catch → Verified at session close.

### §5.3 — Session B — Reflect-content R20a catch + propagation (Critical; PR1; CCP)

**Scope:**
- Wire `enforceLayer2R20aGate` into `/api/practice/reflect`'s pre-reflection step, on the agent's free-text `response` field. Runs after the existing developer-supplied `safety_signal` is parsed (so the catch is additive: if the developer already set `harm_flagged: true`, the existing Zone-3 boundary engages without a fresh classifier call; if the developer did not set it, the catch runs on `response` text).
- On REDIRECT: render per §3 (audience: `agent_developer`); halt Reflect's six-question sequence; emit `safety_signal` per §4.
- On PASS + mild: continue the six-question sequence; carry `safety_signal: { flow_terminated: false, cause: 'distress', severity: 'mild', ... }` so Reflect's exit routing (Seam 4) and any downstream Sage Assent feed see the mild signal.
- On PASS + none: continue unchanged.

**CCP — engages at the build session.** Same structure as §5.2; AC5 perimeter broadening (Reflect-content already has the `/api/practice/reflect` route in the AC5 eight as `/api/reflect` — confirm registry entry covers the practice path; if not, the ninth-route protocol applies in full).

**Status target:** Reflect-content catch → Verified at session close.

### §5.4 — Session C — Layer-3 audience-rendering build (Critical; A6 dependency)

**Scope:**
- Build the audience selector + the render helper per §3.
- Define the two new `prose_mode` keys (`r20a_developer_note`, `r20a_suggested_user_message`).
- Wire the `audience` field into `consumer_context` at every route that calls A5 (initial set: `/api/reason`, `/api/calling`, `/api/practice/reflect`).
- Fix `/api/reason`'s agent-API human-framed-message gap (Finding 2): the two redirect branches in `route.ts` now call the render helper with the route's `audience`.

**CCP — engages at the build session.** Risk: changing user-facing distress text. The fix to `/api/reason` is the surface change that makes the audience-form gap correct.

**Status target:** Layer-3 audience rendering → Verified at session close.

### §5.5 — Session D — Configuration-level invocation tests (AC4 across flows)

**Scope:**
- Extend AC4's invocation testing from per-route to per-configuration flow (L1–L7). Each configuration flow test asserts:
  - Distress entering at the configuration's entry point is caught at the substrate boundary.
  - The configuration's downstream stages see `safety_signal.flow_terminated === true` and skip emission.
  - The audience-appropriate output is rendered.
  - No double-reporting across the configuration.
- Add the per-flow tests to `r20a-invocation-guard.test.ts` (or a sibling test file under `__tests__/`).

**Status target:** configuration-level invocation tests → Verified at session close. **The Option A build arc is then complete; the C2 live run (rescoped per `D-R20A-ADR-ADOPTED-SEQUENCING-2026-05-27`) verifies the new coverage; Session 3 follows.**

### §5.6 — What is NOT in this arc

- **A7 production activation.** Carried forward as a separate Critical change (A7 close #1). Not part of Option A; the build sessions above keep `SUBSTRATE_R20A_GATE_ENABLED` UNSET in production until A7's separate activation session decides otherwise.
- **K-category migration of other consumers onto the translation-sandwich substrate.** This arc completes the *perimeter*; migration is the next staging-plan step.
- **The audience-form question for `audience` other than the two named** (e.g. a third-party client of `/api/reason` that wants neither form). Out of scope; the contract is extensible.

---

## §6 — Compliance map

| Rule / AC | How this design serves it |
|---|---|
| R20a | The catch + audience-correct rendering operationalise R20a at the configuration level. |
| R19 | Until built, the M-7 gaps stand and remain honestly named (R19c). After built, the gap set is closed; the perimeter is the perimeter. |
| AC2 | Catch latency inherited from the existing classifier (~500ms for borderline). Reused-gate path (Reasoning) is zero added latency. Calling + Reflect-content pay the AC2 budget on their entries; accepted. |
| AC4 | Invocation testing extends from per-route to per-flow (§5.5). |
| AC5 | The eight-route perimeter is unchanged in *name*. Calling becomes the ninth route; the ninth-route protocol applies in full at §5.2. Reflect-content already covered if `/api/reflect` registry entry includes `/api/practice/reflect`; otherwise tenth-route protocol applies at §5.3. |
| AC7 | Not engaged. No auth, cookie-scope, session-validation, or domain-redirect change. |
| AC8 | The catch is at the translation-sandwich boundary; the rendering is at Layer 3 — both within AC8's architectural shape. |
| PR1 | One endpoint at a time. Calling first (§5.2); Reflect-content second (§5.3); each its own session + CCP + Verified before the next starts. |
| PR3 | The catch is synchronous (A7 already is — `r20a-gate.ts:338` `await enforceLayer2R20aGate`). No fire-and-forget. |
| PR6 | Every per-endpoint wiring session is Critical regardless of apparent scope (PR6 + the AC5 perimeter classification). |
| PR12 | Verification preceded design (§1); the four findings shaped the design, not the other way round. |
| PR15 | Reuses A7, A5.4, A6 `prose_mode`, Reflect's `safety_signal` carrier-name. No primitive rebuilt. |
| PR16 | Positioning: strengthens "Character Kernel" positioning by demonstrating the substrate enforces R20a at its boundary across configurations (substrate consultation of its own safety discipline). Dogfood: substrate-consultable via `/api/reason`. |

---

## §7 — Open questions (PR7)

1. **Audience selector for plugin-internal calls.** §3.2 assigns `agent_developer` by default to future plugin-internal callers. Confirm at the plugin's first surfacing session. Revisit: Stage 3 plugin-tools work.
2. **`suggested_user_message` always sent on REDIRECT, or only on `audience: 'agent_developer'`?** §3.1 says optional for the agent to relay. The default proposed: present on `agent_developer` audience; absent on `human_user` audience (where the user message IS the wire form). Revisit: A6 session.
3. **AC5 registry: does `/api/reflect` cover `/api/practice/reflect`?** If yes, Reflect-content needs no ninth-route protocol; the entry is already there. If no, §5.3 takes the ninth/tenth-route protocol path. Revisit: §5.3 build session open.
4. **Whether to retire the internal `distress_signal: boolean` on `Layer2Assessment`** once `safety_signal` carries the equivalent on the outward shape. The internal flag is read by A5.4 for prose injection (different purpose). Initial design: keep both; the internal flag is local to the substrate's Layer 2 → Layer 3 hand-off, the outward `safety_signal` is the cross-seam carrier. Revisit: Session D close.
5. **`caught_at` enum extension.** Initial values `'substrate_layer2' | 'reflect_input_boundary' | 'other'`. As more configurations get wired, the enum may need values like `'calling_input_boundary'` (which is also `substrate_layer2` via A7 — likely no new value needed). Revisit: per build session.

---

## §8 — Revisit conditions

- A per-endpoint build session reveals routing the consumer through A7 is infeasible without a larger refactor → reconsider Option B for that endpoint (per the parent ADR's revisit condition).
- The audience determination at the route turns out to require a signal not currently on the request (e.g. the request shape does not distinguish web vs API for `/api/reason`) → §3.2 revisits the audience-assignment mechanism.
- The canonical `SafetySignal` schema (§4.2) collides with a substrate output field added between sessions → rename via decision-log entry; the design is otherwise unchanged.
- A new R20a perimeter route is added under the existing ninth-route protocol → fold into §5 with its own session.

---

*End of design spec. Drafted 2026-05-28; Under review; cross-referenced by the session-1 close. The build sessions implement against this spec; spec updates are amendment decision-log entries citing the originating session.*
