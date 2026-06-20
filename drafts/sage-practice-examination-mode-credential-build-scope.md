# Build Scope — `examination_mode` credential extension (the Option-2 gating safety item)

**As of:** 2026-06-20 · **Status:** Scope/spec for founder decision (documents-only; nothing built). The build itself is **Critical** (touches the accreditation write + public-read path) and runs as its own 0c-ii session. Companion to `drafts/D-gate1-surface-honesty-option2-honest-differentiation.md` (the decision) and `drafts/sage-practice-pre-decision-harness-design.md` (the harness).

## What this builds, and why
The Option-2 decision keeps the "Gate 1" name on all surfaces, so the **credential** must be what distinguishes the two configurations downstream. This build adds an **unforgeable `examination_mode`** to the trust layer — so the public accreditation credential states whether the agent's reasoning was **examined pre-decision (harness-enforced)** or **examined post-decision (discretionary check)**. Verified feasible: the K1 coverage model is server-composed and consumer-unforgeable, and already reserves hook-enforced states for exactly this case (`coverage-status.ts:37–44`; route hardcodes `agent_elected`, *"never 'continuous' without the hook"*, `route.ts:708,715`).

## The mechanism (verified end-to-end)
```
admin mint  →  credential carries an operator-set pre-decision marker (unforgeable: mint is admin-gated)
   ↓
/api/accreditation write  →  route reads the marker from the validated credential (already in scope at route.ts:711)
   ↓
composeK1InitialCoverage(record, <write-path>)  →  SERVER-composed examination_mode (coverage-status.ts; consumer input ignored)
   ↓
agent_accreditation row  →  examination_mode persisted (additive, nullable)
   ↓
public GET read-back (buildAccreditationPayload)  →  examination_mode on the unforgeable payload; downstream consumers already read coverage fields
```

## Design decisions to make (forks — recommendation given, your call)

**D1 — where the mint-time marker lives.**
- (a) **`credential_provenance` jsonb** on `api_keys` (already exists, UPC) — add `{ "examination_enforcement": "pre_decision_harness" }`. *Recommended:* semantically correct (provenance about issuance/intended use), additive, no new column, set only at admin mint.
- (b) A new **capability** in `capabilities[]` (e.g. `pre_decision_attested`). Simpler to read, but category-mismatched — capabilities are permissions ("can do X"), not provenance ("was issued as a harness credential").
- (c) A new **column** (`examination_enforcement`) on `api_keys`. Most explicit/queryable, but a schema change for a low-cardinality flag.
- *Recommend (a)*; choose (c) only if you want to constrain/query it at the DB level.

**D2 — how the timing is expressed on the credential.**
- (a) **A new structured `examination_mode` field** on `AccreditationRecord`/`AccreditationPayload` (`pre_decision_harness | post_decision_check | null`). *Recommended:* machine-parseable, so a downstream gate (or another agent) can read it unambiguously — which is the whole point (survive two hops).
- (b) **`credential_basis` clause only** (free text). Already provenance text, but not machine-parseable — a downstream consumer can't reliably gate on prose. Use *in addition to* (a), not instead.
- *Recommend (a) + a matching (b) clause for the human-readable record.*

**D3 — do NOT repurpose `coverage_status: continuous`.**
`continuous` means *every consequential action examined over the window* (coverage breadth). A Gate-1 hook examines the **framing pre-decision at task adoption** — that is a **timing** property, not per-action coverage. Stamping `continuous` would **overclaim**. *Recommendation: keep `coverage_status` for coverage (both configs stay `agent_elected` for now), and carry the pre/post distinction in the new `examination_mode` field.* This keeps each claim honest on its own axis. (If a future per-action hook genuinely examines every action, `continuous` becomes earnable separately.)

## Build components (concrete, once D1–D3 are set)
1. **Schema (additive, nullable, reversible):** `examination_mode` on `agent_accreditation`; the marker on `api_keys.credential_provenance` (D1a). Mirror the K1 first-slice pattern (nullable; pre-existing rows read back `null` = "unstated", honest).
2. **Mint (operator-only):** the admin `/api/admin/api-keys` route + the CLI gain a flag to set the pre-decision marker on `credential_provenance`. **Admin-gated only** — a consumer cannot self-issue it (this is the unforgeability root).
3. **Composer:** `composeK1InitialCoverage` gains a `harness_enforced` `CoverageWritePath` (joining `wrapper_write` / `sage_reflect_feed`) that emits `examination_mode: pre_decision_harness` + a basis clause. Pure, server-side, consumer input ignored (unchanged guarantee).
4. **Route wiring:** at `route.ts:711`, select the write path from the validated credential's marker (`harness_enforced` iff the marker is present; else `wrapper_write` → `post_decision_check`/`agent_elected`).
5. **Public read-back:** `buildAccreditationPayload` folds `examination_mode` onto the payload (it already serves `coverage_status`/`credential_basis`).
6. **Public docs (R18 — honest):** describe `examination_mode` accurately, including the limit below — it is an **attestation**, not cryptographic proof of timing.

## The honest limit (must be documented, not hidden)
The server **cannot prove** from an API write that a hook fired pre-decision (timing isn't observable in the call; even the Ed25519 signature proves *examined*, not *examined-pre-decision*). So `examination_mode: pre_decision_harness` is **unforgeable against the consumer** (server-composed; admin-gated mint) but rests on an attestation: (a) the write came via an operator-issued harness credential, and (b) the harness enforces pre-decision by construction. The residual trust is **operator issuance discipline + the harness's by-construction enforcement** — the same trust model as the rest of the credential. *(Optional future hardening: have the harness emit a verifiable signed attestation that it fired pre-decision; out of scope here.)*

## Sequencing / dependency (important)
- The **field can be built now**, dark and **un-issued** — the mechanism is independent of the harness.
- The marker must **not be issued to anyone until a genuine pre-decision harness exists** to earn it (else `pre_decision_harness` would be an empty claim). So: build the field → build the harness (`sage-practice-pre-decision-harness-design.md`) → issue the marker to the harness integration. The harness is the prerequisite for **issuing**, not for **building** the field.
- Until issued, **everything reads `post_decision_check` / `null`** — which is honest for today's surfaces (all discretionary).

## Risk, protocol, tests
- **Risk: Critical** (0d-ii — touches the accreditation write boundary + the public trust credential; the honesty surface). Full Critical Change Protocol (0c-ii), dark flag, adversarial pre-activation review, AC7 if the auth/credential read changes.
- **Unforgeability tests (the load-bearing battery):** consumer-submitted `examination_mode` is ignored (server-composed); only an admin-minted marked credential earns `pre_decision_harness`; an unmarked credential → `post_decision_check`; the public payload carries it; flag-off byte-identity; pre-existing rows read `null`.
- **Rollback:** additive/nullable → DROP the column + remove the marker handling; flag-gated so flag-off = byte-identical.

## Not in scope here
The pre-decision **harness/plugin** itself (its own arc); the **hosted-configuration contract language**; the optional signed-harness-attestation hardening.

## Open decisions for you
D1 (marker home — rec: `credential_provenance` jsonb), D2 (a structured `examination_mode` field — rec: yes), D3 (don't repurpose `continuous` — rec: agreed). Set these and the next session can build the field dark; the harness and the hosted contract follow.
