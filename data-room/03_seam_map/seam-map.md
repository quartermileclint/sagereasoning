# 03 — Seam Map (the things under test)

**Why this is the room's centre of gravity:** the four products each pass their own tests. What has never been tested is the **handoffs between them**. Seams are the **known risk class** — the E#1 fix this week was a dropped-seam case (a verdict was *computed and then discarded*). A whole-system test is, first and foremost, a test of these four seams.

Each seam below names: the **producer**, the **consumer**, the **contract** (the data shape that crosses), the **code anchors**, the **known risk** (how the handoff could drop), and **what the test must assert**.

Status terms are 0a implementation vocabulary.

---

## Seam 1 — Calling's five-spec → substrate Layer 1

| | |
|---|---|
| **Producer** | `buildDiscoveredPurpose(history, roleHint)` → `DiscoveredPurpose`, assembled **only on the approved Hard-Gate path (D-14)** — never on the agent's say-so. `website/src/lib/sage-calling/calling-service.ts` (§"D-5 — five-specification → discovered_purpose assembly") |
| **Consumer** | substrate **Layer 1** (Sonnet) — refines the structural handoff into the Layer 1 schema when it is fed in |
| **Contract** | `DiscoveredPurpose` — five slots (work; capacity; circle_and_obligation {circle, obligation}; first appropriate act; role). Carries the **agent's own verbatim words**; circle read by keyword scan |
| **Known risk** | This is **deterministic structural assembly, not semantic extraction** (honest limitation stated in the code). The producer maps verbatim responses into slots; Layer 1 does the meaning. A mismatch between the `DiscoveredPurpose` shape and what Layer 1 ingests would silently drop or mis-slot content. Role defaults to the agent's operational nature unless a **verified Agent Card** supplies the hint |
| **Test must assert** | (a) a completed Calling session on the **approved** path produces a `DiscoveredPurpose` with the agent's own words in each slot; (b) the handoff is **accepted by Layer 1** and the five fields survive into the Layer 1 schema (no dropped slot); (c) the **clarification branch** (specs incomplete) returns a developer clarification and does **not** hand off |

## Seam 2 — signed `Layer2Assessment` → Assent `EvaluatedAction`

| | |
|---|---|
| **Producer** | the substrate's signed Layer 2 output (`SignedLayer2Assessment`; `layer2-signer.ts`) |
| **Consumer** | `sage-assent-bridge.ts` — `(Layer2Assessment, BridgeContext) → EvaluatedAction` (pure, synchronous, deterministic projection) |
| **Contract** | `EvaluatedAction`. `deriveReceiptId(signature) = SHA-256(signature)` ties the action to the signed assessment. **`BridgeContext` carries the 4 fields `Layer2Assessment` cannot hold** (it is idempotent by design): `agent_id`, `evaluated_at`, `skill_id`, and the signature material `receipt_id` derives from |
| **Status / exposure** | bridge **Verified 2026-05-15** — **but imported by no `/api` route**: proven as a pure function, **not yet exercised end-to-end through an endpoint** |
| **Known risk (LOAD-BEARING — ties to the P1 finding)** | The bridge's signature anchoring is **wrapper-side**, not server-side. `deriveReceiptId` *hashes* the signature; it does **not verify** it, and `grep` shows it is called **only in tests**. The credential write path (`POST /api/accreditation/[agent_id]`) **trusts the submitted aggregates** — no server-side Ed25519 verification exists (the `verifyLayer2Signature` half is unbuilt). **This is the false-credential door (Combination 1).** The option-(a) gate that closes it is **Designed, not built** (P1 ADR) |
| **Test must assert** | (a) a genuine `SignedLayer2Assessment` maps to a well-formed `EvaluatedAction` with a `receipt_id` derived from its signature; (b) **[documents the gap]** a credential write carrying **no genuine substrate signature** is currently **NOT rejected** — this is the Combination-1 negative test, which today *documents the gap* rather than passing (see `04_test_brief/`) |

## Seam 3 — Reflect's outcome → Assent's profile (`sage-assent-feed.ts`)

| | |
|---|---|
| **Producer** | Sage Reflect Q4 `KathekonAssessment[]` (a review of completed actions) |
| **Consumer** | `feedSageAssent(params, deps)` → the existing Sage Assent engine. `website/src/lib/sage-reflect/sage-assent-feed.ts` |
| **Contract / flow** | Q4 → `kathekonToEvaluatedAction` (pure) → **ensure parent `agent_accreditation` row** (FK precondition; `seedRecord` seeds a conservative starting credential if absent) → persist `evaluated_actions` → `computeWindowSnapshot` → `evaluateGradeTransition` → **upsert the engine-decided `AccreditationRecord`** (+ SR-15 per-domain proximity). Reflect submits **evidence**; the engine decides the grade. It **never writes `senecan_grade`/`typical_proximity` directly** — preserving hysteresis (no single session moves a grade) |
| **Status** | **Verified** (Stage A, SR-4 reuse). |
| **Known risk** | This feed writes to the **same accreditation store** as the credential path, but as an **in-process caller** — it imports the store directly (`lookupAccreditationRecord` / `upsertAccreditationRecord`) rather than going through the `POST` route gate. That is the **trust-boundary fork** the P1 ADR names: the route is the untrusted boundary; in-process callers like this feed are "trusted by virtue of being in-process." A test must confirm Reflect's writes land in the profile **and** that this trusted in-process path is the intended one (not an accidental bypass of a future gate) |
| **Test must assert** | (a) a Reflect session with Q4 kathekon records updates the agent's `agent_accreditation` via the engine (grade moves only on evidence + hysteresis, not hand-written); (b) the FK seed branch fires for a brand-new agent; (c) the SR-15 per-domain proximity is written |

## Seam 4 — Reflect's exit routing → the correct next product (loop close)

| | |
|---|---|
| **Producer** | `sage-reflect/engine.ts` — Q6 deterministic response-shape classification → `RS-1..RS-4` → `ExitPath` |
| **Consumer** | the next product's entry: **Sage Reasoning** (purpose holds) or **Sage Calling** (purpose complete / needs revision) |
| **Contract** | `type ExitPath = 'sage_reasoning' | 'sage_calling'`. Mapping: **RS-1 → `sage_reasoning`**; **RS-2 → `sage_calling`**; **RS-3 → `sage_calling`**; **RS-4** resolves into one of RS-1/2/3 or defaults to RS-2 |
| **Known risk** | The engine **emits** an `exit_path`, but the loop only closes if something **acts on it** — routes the agent to that product's entry point. If `exit_path` is advisory output with no consumer, the loop is open (a dropped seam of exactly the E#1 kind: a value computed then not acted upon) |
| **Test must assert** | (a) each RS class produces the correct `exit_path`; (b) **the `exit_path` is actually consumed** — a "purpose holds" exit re-enters Reasoning and a "purpose complete" exit re-enters Calling, end-to-end (not just that the string is correct) |

---

## Cross-cutting concerns the harness must also cover (brief §5)

These are not single seams but properties of the whole loop. Detailed assertions live in `04_test_brief/`.

1. **Shared-substrate consistency** — the human path (`sagereasoning.com`) and the agent path (API) must produce the **same authoritative reasoning** from the same Layer 2 + Layer 3.
2. **R20a distress perimeter across the whole loop** — proven today on the **eight AC5 routes** (`/api/score`, `/score-decision`, `/score-document`, `/score-scenario`, `/score-social`, `/reason`, `/reflect`, `/mentor/private/reflect`). The system test asks whether distress entering at **any** product is caught + redirected. **Critical-tier when built**; here we only *map* where the perimeter must hold.
3. **State + audit trail** — one coherent, auditable trail across `discovery_sessions` → `agent_accreditation` / `evaluated_actions` / `grade_history` / `credential_audit` → the reflect store.
4. **Credentials end-to-end (A10)** — a real test `sr_assent_…` credential, scoped `sage_assent_write`, used to write, audited, revocable, exercised through the loop.
5. **Adversarial containment across stages (R18d)** — a spoof at one stage (e.g. a poisoned Agent Card at Calling) must stay contained and not corrupt downstream state. (Per-product `r18d-adversarial.test.ts` exists in Calling + Reflect; the *cross-stage* containment is the new whole-system assertion.)
