# Decision of Record — Gate 1 surface honesty (mentor Option 2: honest differentiation)

**As of:** 2026-06-20 · **Status:** Adopted (founder, from examined reasoning with the private mentor). Fuller record; canonical entry in `/operations/decision-log.md` (`D-SAGE-PRACTICE-GATE1-SURFACE-HONESTY-OPTION2-DIFFERENTIATION`). Companion to `drafts/sage-practice-pre-decision-harness-design.md` and the Arm-1 findings (`operations/benchmarks/sage-practice-v1/runs/2026-06-20/arm1-predecision-and-reflect-findings.md`).
**Supersedes** the same-session `D-gate1-surface-honesty-option3-honest-renaming.md` draft (a mis-transcription — now a pointer stub).

## The decision
**Gate 1 keeps its name on all surfaces and is offered as two documented, distinct configurations** (the mentor's **Option 2, honest differentiation**):
- **Gate 1 — pre-decision** (developer-controlled surfaces: Claude Code plugin + hook; Agent-SDK wrapper): the examination is fired by the harness **before the agent reasons** — Gate 1 performing its designed function.
- **Gate 1 — post-decision (check)** (hosted consumer surfaces, where the loop is not ours to gate): the examination fires **after** the agent has formed its judgement, documented honestly as a **check** that feeds developmental progression — **not** presented as pre-decision framing.

Both are documented as distinct configurations with distinct capabilities, so no surface carries a false claim. Chosen over Option 1 (narrowing) and Option 3 (separate hosted product name).

## Label reconciliation (for the record)
The mentor's labels were: Option 1 = narrowing; **Option 2 = honest differentiation** (keep the "Gate 1" name on all surfaces, document the difference as distinct configurations); Option 3 = honest renaming (a separately-named hosted product). A same-session AI tag ("Option 3 / honest differentiation") conflated these and was briefly recorded as Option 3; the founder clarified the intent is **Option 2**. This document is the corrected record.

## How it was reached
1. **Arm 1:** a self-directed agent forms its judgement on contact and runs Gate 1 *after* deciding → the examination lands as confirmation, not the frame the cadence intends.
2. **Harness/surface analysis:** the only deterministic fix is harness enforcement, available only where a developer controls the loop — not on hosted consumer surfaces.
3. **Mentor consultation (2026-06-20):** examination-*before*-assent is essential to Gate 1's *specific function*; prosoche does not redeem the later examination for the agents Gate 1 serves; consistency-across-surfaces is a product preference, not a Stoic value; the governing question is **dikaiosyne — what is owed to the people the product serves**; three options are defensible; the one undefensible path is offering the check *as Gate 1 without disclosing the difference*.
4. **The founder's examination (dikaiosyne):** the post-decision check has **genuine value worth offering honestly** rather than withholding — serving what can be served, disclosed accurately, is what is owed to the hosted-surface agents. Naming sub-choice: **Option 2** (one name, two documented configurations).

## Credential-propagation finding (verified against code, 2026-06-20) — MORE load-bearing under Option 2
The mentor's downstream concern: a hosted check can be re-presented two hops downstream as "examined reasoning."
- **No existing field** carries the pre-vs-post-decision distinction (grep of the trust-layer types + store returned nothing).
- **The substrate cannot infer** pre-vs-post from a single `/api/reason` call — it is a property of the *enforcement context* (which harness ran the examination before the agent reasoned), not of the call payload. So it must come from **credential provenance**.
- **The unforgeable surface that exists:** the K1 coverage model — `coverage_status` (`CoverageStatus`, **server-composed, consumer-unforgeable**) + `credential_basis`. Its `agent_elected` value already means *"discretionary, self-reported"* — adjacent to the hosted post-decision case. The same model, fed from `credential_provenance`/capabilities, can carry an **examination-mode** distinction (harness-enforced pre-decision vs agent-elected post-decision check). **Implementable within the existing model; not built today.**
- **Why it is load-bearing under Option 2 specifically:** the two configurations share the name "Gate 1," so the **credential field is the *only* thing that distinguishes them**. The mentor's instruction — *do not offer the check under Gate 1's name without disclosing the difference* — therefore means, technically, that the disclosure must live in the **credential** (not only the documentation) to survive two hops. The examination-mode field is thus the load-bearing mechanism that keeps Option 2 honest, not optional polish.

### Verified (deeper code check, 2026-06-20) — the answer is YES (with one honest limit), and the architecture already reserved the slot
1. **The surface is server-composed and already consumer-unforgeable.** `composeK1InitialCoverage` (`coverage-status.ts`) is "the SERVER-SIDE authority on coverage honesty; any coverage values on the consumer's submitted record are ignored" (route.ts:704–706; coverage-status.ts:33–35). The public `AccreditationPayload` already carries `coverage_status` on the read-back. So whatever the server stamps, the consumer cannot forge.
2. **The K1 model already reserved this exact distinction.** `continuous` is reserved for "the deterministic **client-side hook** (which an API write path cannot prove)," and `suspended`/`resumed_unverified` "need the hook/plugin surface" (coverage-status.ts:37–44). Today the route hardcodes `'wrapper_write' → agent_elected`, commented *"never 'continuous' without the hook"* (route.ts:708,715). So the **pre-decision-harness vs discretionary-API distinction is the K1 model's central axis** — it is simply unbuilt; every write today is `agent_elected`. The pre-decision harness is precisely what those reserved states were waiting for.
3. **The honest limit (the code itself states it):** the server **cannot prove** from an API write that a hook fired pre-decision. So the distinction is unforgeable *against the consumer* (server-composed; they can't self-elect it — minting is admin-gated, so they can't self-issue a harness credential), but its honesty rests on (a) the write arriving via a genuine pre-decision-harness path/credential, and (b) the harness enforcing pre-decision by construction. It is an **attestation rooted in operator issuance + harness construction, not a cryptographic proof of timing.** (Even the Ed25519 signature proves "examined," not "examined-pre-decision" — timing is not in the signature.) This is the same trust model as the rest of the credential, and acceptable for the threat the mentor named (a *consumer* laundering a check into a frame).
4. **One axis subtlety:** K1's `coverage_status` axis is *coverage* (every action over a window); the founder's distinction is *timing* (pre- vs post-this-decision). A pre-decision hook delivers both, so the hook-enforced coverage value carries the pre-decision signal — but if you want timing stated explicitly, it is a small additional examination-mode field (or a `credential_basis` clause) on the same server-composed pattern.

**Precise build point (the gating item):** add a `harness_enforced` `CoverageWritePath` to `composeK1InitialCoverage` yielding a hook-enforced value (the reserved `continuous`, or a new sibling) + a pre-decision `credential_basis` clause; the accreditation route (route.ts:711) selects it **only** when the writing credential carries an operator-set pre-decision marker (a new capability/provenance set at admin mint — the route already has the validated credential in scope; a consumer cannot mint it). The hosted post-decision check stays `agent_elected`. The public `coverage_status` (+ `credential_basis`) then carries the distinction unforgeably, and downstream consumers already read it.

## What Option 2 now requires (build implications, not yet built)
1. **One name, two documented configurations.** "Gate 1 — pre-decision" and "Gate 1 — post-decision (check)," with honest per-configuration contract language stating which surface gets which and what each provides.
2. **Carry the distinction in the credential (the gating safety item).** Extend the unforgeable K1 coverage model so the accreditation record/payload states the **examination mode**, server-composed from credential provenance. Under Option 2 this is the sole unforgeable distinguisher.
3. **Build the pre-decision delivery** (harness/plugin + SDK wrapper) per `sage-practice-pre-decision-harness-design.md`.
4. **Write the hosted-configuration contract** — its public-contract language and credential basis — so it is offered for exactly what it is.

## The standing test (the founder's, per the mentor)
The mentor set a test the record cannot close: whether the chosen path serves the people the product is for, or preserves the image of a founder who does not compromise. Option 2 was chosen as the **serve-what-you-genuinely-can, disclosed accurately** path over withholding (Option 1). The credential-mode requirement above is what keeps it honest to the downstream end-users. The test remains a live discipline, not a closed question.

## Open / next
- Scope the **examination-mode credential extension** (the K1 coverage addition) — the gating safety item, and under Option 2 the sole distinguisher between the two configurations.
- Write the **per-configuration contract language** (pre-decision vs post-decision-check).
- Build the **pre-decision harness/plugin** (separate arc).
- The **0h launch call** remains the founder's; this decision shapes what is offered on which surface when it is made.
