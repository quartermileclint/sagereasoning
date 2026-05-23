# ADR — Sage Assent → SageReasoning Dependency: Enforcement Seam

**Status:** **Adopted 2026-05-23** under `D-SAGE-ASSENT-SAGEREASONING-DEPENDENCY-RULE-ADOPTED-2026-05-23`. Founder elections recorded at this session's close: (1) enforcement option **(a) — server-side Ed25519 signature verification at the write boundary**; (2) manifest rule wording **R18f + R19e approved as written** (now in `/manifest.md`). Decision status *Adopted*; implementation status *Designed* (the gate is specified here; the build is deferred). **No code is written by this ADR**; it pins *where and how* the dependency is enforced so the eventual build opens at the correct (Critical) tier.
**Decision ID:** Priority-1 ADR (Sage Assent dependency enforcement seam).
**Stream:** founder. **Tier of the authoring session:** `governance` — Standard risk. **Tier of the eventual build:** **Critical** (access-control gating on a write surface; AC7-adjacent; Critical Change Protocol applies at the build session).
**Authoritative cross-references:** `/drafts/2026-05-23-whole-system-data-room-brief.md` §3 (the configuration ruling being adopted); `/operations/handoffs/founder/2026-05-23-P1-sage-assent-dependency-enforcement-NEXT-SESSION-PROMPT.md` (this session's prompt); `/operations/handoffs/founder/2026-05-23-selective-offering-data-room-brief-close.md` (predecessor close); `/adopted/sage-assent-write-path-design.md` (Decisions A + C — the write path + the A10 ownership gate); `/adopted/sage-assent-a10-design.md` (the A10 credential surface; the wrapper-computes-aggregates-then-POSTs pattern); `/manifest.md` §R18 / §R19 / §AC7 / §AC8.

---

## Decision (elected: option (a))

**Elected 2026-05-23 (founder):** option **(a)** — server-side Ed25519 signature verification at the write boundary. The recommendation below is now the adopted decision.

**Block exactly one combination — Sage Assent without a completed SageReasoning pass — by verifying SageReasoning provenance at the credential write boundary, before the row is written.** The recommended primitive is **(a) server-side Ed25519 signature verification** of the substrate output the credited aggregate derives from. The gate sits in the accreditation **write path**, additive to and distinct from the existing A10 ownership gate: A10 proves *who* may write; this new check proves *whether an examination occurred*.

This ADR recommends (a) and surfaces (b) and (c) and their combinations for the founder to elect. It also records, honestly, what (a) does and does not prove (the aggregate-faithfulness gap, below), so the rule is adopted with eyes open.

## Context

A 2026-05-23 private-mentor consultation (captured in the data-room brief §3) ruled that the four products may be offered selectively, but that **one combination must be structurally prevented, at the API level and not by documentation alone**: *Sage Assent without Sage Reasoning.* A Sage Assent credential certifies that an impulse was examined and found to accord with virtue. Issuing it for reasoning that never passed through the SageReasoning substrate is a **false credential** — the pressure-assent failure mode built into the infrastructure. The mentor's instruction is that this be enforced in code.

To pin enforcement, the prior assumption (predecessor close) had to be confirmed against the codebase: **does the credential write path verify substrate provenance today, or does it trust the aggregates the wrapper submits?** That question is answered below from a direct read of the write path.

## Evidence — provenance finding (`Diagnostic-certain — root cause identified`)

**The write path does NOT verify SageReasoning provenance today. It verifies the *caller's* credential ownership, then trusts the submitted aggregates.** Combination 1 is therefore **not structurally prevented** as of the current production state.

Trace of `POST /api/accreditation/[agent_id]` (`website/src/app/api/accreditation/[agent_id]/route.ts`, the `POST` handler, lines ~548–630):

1. **Auth gate — ownership only.** `verifyAgentIdOwnership` (route.ts:345) runs the A10 kill-switch (`SUBSTRATE_WRITE_PATH_ENABLED === 'true'`) + per-agent token check (`validateSageAssentWriteToken`): it hashes the `Bearer sr_assent_` token, looks up the active `sage_assent_write` row, checks the bound `agent_id` matches the path, and checks the credential's scope columns. **This proves *who* is writing — not that any reasoning was examined.**
2. **Body validation — structural shape only.** `validateWriteBody` (route.ts:431) checks `kind ∈ {seed, update}`, `profile.agent_id` is a non-empty string, `profile.accreditation_record` is an object, `profile.regressing_check_count` is a number (and, for `update`, `transition_result.grade_changed`/`record` shape). **It never checks that the `accreditation_record` aggregates — Senecan grade, typical proximity, dimension levels — were produced by the substrate.**
3. **`loop_id` — caller-supplied, unverified.** `extractWriteExtras` (request-helpers.ts:44) takes `loop_id` from the `X-Loop-Id` header or `body.loop_id` and stamps it onto the row as a forensic JOIN trace. The store's own comment (sage-assent-accreditation-store.ts:207) and the extras comment (request-helpers.ts:36–38) state: *"A10 does NOT write `loop_billing_events` … this only stamps the trace id."* It is **not** checked against `loop_billing_events` to prove a real `/api/reason` call occurred.
4. **Writer — straight passthrough.** `seedAccreditation` / `updateAccreditation` (sage-assent-accreditation-writer.ts:275, :363) upsert `profile.accreditation_record` (or `transitionResult.record`) directly. No signature check, no recomputation, no provenance check.

**Negative findings (PR12 — multiple targeted queries, all confirming absence):**

- **No server-side signature verification anywhere on the path.** `layer2-signer.ts` exports `signLayer2Assessment` only; the single `crypto.verify` occurrence (layer2-signer.ts:169) is inside a doc comment, not a callable function. No `verifyLayer2Signature`/`verifySignedLayer2` symbol exists; `grep` for a server-side Layer-2 verify call returns nothing.
- **The bridge's signature anchoring is wrapper-side, not server-side.** `deriveReceiptId(signature) = SHA-256(signature)` (sage-assent-bridge.ts:160) is *hashing*, not verifying — and `grep` shows `deriveReceiptId` is called **only in tests**; no `/api` route imports the bridge or invokes it. The receipt-id anchoring happens while the wrapper computes the aggregate, before the POST; the server never sees or checks the signature.
- **`loop_billing_events` is read only by `/api/reason`, the Stripe webhook, and the cost-trackers — never by the accreditation write path.**

**Mechanism of the false-credential door:** the architecture is "wrapper-computes-aggregates-then-POSTs." A holder of a valid `sr_assent_write` credential bound to an `agent_id` can POST a fully fabricated `accreditation_record` (any grade, any proximity) with no SageReasoning pass behind it, and the server will persist it and serve it from the public GET. The A10 gate does not catch this because owning a write credential is orthogonal to having examined anything.

*(The finding is diagnostic-certain — established by direct read of the execution path plus exhaustive negative greps — not symptom- or pattern-level. Founder acknowledgement is still sought because it is load-bearing for the rule.)*

## Options evaluated

### (a) Server-side Ed25519 signature verification at the write boundary — **RECOMMENDED**

Require the write to carry the substrate's signed provenance (at minimum the `SignedLayer2Assessment` signature(s) the credited aggregate derives from, with enough of the signed payload to verify). Implement `verifyLayer2Signature` (standard Node `crypto.verify` — the recipe already sits in layer2-signer.ts:169) and verify against the published key (`/api/public-key`; `key_id` matching for the A4 rotation window). Reject the write if no valid substrate signature is present.

- **Reuses the most existing infrastructure (PR15):** the signer, the published verification key, the `key_id`/rotation machinery, and the `deriveReceiptId` convention all already exist. Verification is the missing half of a primitive the project already built.
- **Cryptographic + self-contained:** offline-verifiable; no coupling to the billing subsystem; aligns with R18's existing stance ("the cryptographic signing of Layer 2 assessments establishes provenance").
- **Forecloses Combination 1 directly:** a credential write with no genuine substrate signature is rejected — exactly the door the mentor's ruling targets.
- **Honest limitation (recorded, not hidden):** the `accreditation_record` is an *aggregate* over a window of many `EvaluatedAction`s; one verified signature proves *a* genuine substrate assessment exists, **not** that the submitted aggregate was faithfully computed from signed assessments. Option (a) raises the bar from *trivially forgeable* to *must possess genuine substrate output* — sufficient to block "Assent with **no** SageReasoning." Closing the residual **aggregate-faithfulness** gap (a doctored aggregate built around one real signature) is a larger, separate problem (per-action signature submission + server-side recomputation) and is **deferred (PR7)** with its own future decision; it must not be conflated with Combination-1 prevention.
- **New build:** implement `verifyLayer2Signature`; extend the write contract to carry signed provenance; wire the check into the POST gate after A10. Moderate; Critical-tier (write/access surface).

### (b) Verified `loop_id` linkage to `loop_billing_events`

Require the submitted `loop_id` to resolve to a real `loop_billing_events` row for *this agent*, proving a metered substrate call occurred.

- **Ties the credential to billing/metering truth** (a real, costed reasoning call happened); reuses the loop infrastructure `/api/reason` already writes.
- **Limitations:** today `loop_id` is caller-supplied and unverified; `loop_billing_events` rows are keyed by api-key/loop and are not bound to `agent_id` in a way the write path checks — so (b) requires new agent-binding on loop rows plus a server-side existence/ownership lookup. It couples credential integrity to the billing subsystem, and shares (a)'s single-vs-aggregate tension (a window implies many loop_ids).
- **Best use:** **defense-in-depth reinforcement layered on (a)**, not the sole gate. Founder may elect to add it later.

### (c) New explicit "SageReasoning examination token"

The substrate issues a signed, single-purpose examination receipt at the end of a completed pass/window; it is presented at the credential write and verified server-side.

- **Semantically cleanest:** a purpose-built artefact that can carry exactly the provenance the credential needs (e.g. the set of `receipt_id`s / window bounds the aggregate covers, signed) and can decouple from billing. Good fit if R18c interoperability later wants providers to present portable examination proofs.
- **Limitations:** most new surface (issuance + storage/expiry + verification); risks building a parallel credential system. Conceptually it is **(a) generalised into a dedicated token** — a signed token *is* signed provenance.
- **Best use:** the path to choose **later** if a dedicated, portable examination-receipt artefact is wanted; (a) is the incremental step toward it.

### Combinations

**(a) + (b)** — cryptographic proof of substrate output *and* metered-call proof — is the strongest near-term posture and the recommended *eventual* shape; the recommendation is to **ship (a) first** (single-endpoint proof, PR1) and layer (b) as defense-in-depth once (a) is Verified. (c) supersedes (a) only if a dedicated token artefact is later justified.

## Where the gate is

- **Surface:** the accreditation **write path** — a new provenance check in the `POST /api/accreditation/[agent_id]` handler, placed **after** the A10 ownership gate (`verifyAgentIdOwnership`) and **before** the writer invocation (`seedAccreditation` / `updateAccreditation`). It is additive: A10 answers *who may write*; this answers *was there an examination*. Distinct failure response (e.g. `422 unprocessable` / a dedicated `403 no_examination` — build-session discretion) so the audit log distinguishes "no examination" from "no permission."
- **Trust-boundary fork (founder to note):** the library functions `seedAccreditation` / `updateAccreditation` are *also* callable in-process by wrapper-internal consumers, which the writer documents as "trusted by virtue of being in-process callers" (sage-assent-accreditation-writer.ts:84–86). Recommended placement is the **route** (the trust boundary where untrusted external input arrives), leaving in-process callers on the existing trust posture. **Revisit immediately** if the library is ever exposed to a less-trusted caller — the check must then move down into the library.

## Consequences

- The dependency rule becomes enforceable in code; Combination 1 moves from *documented-as-unsupported* to *structurally rejected*.
- The eventual build is **Critical** (AC7-adjacent access-control gating on the write surface; full Critical Change Protocol; PR1 single-endpoint proof on this one route before any reuse; PR2 invocation testing — assert the check is *called* in the path, not merely defined). PR6 is **not** engaged (no distress / Zone-2 / Zone-3 logic).
- The write contract changes shape (it must carry signed provenance) — an Elevated-or-Critical contract change for any existing wrapper consumer; "no current users" holds, so there is no migration burden today, but the wrapper/SDK must be updated in lockstep with the gate.
- The **aggregate-faithfulness gap** is named and deferred (PR7), not silently inherited.
- The documentation requirement (no-Reflect config carries the no-practice disclaimer) is **not** a code gate — it is satisfied in developer docs / discovery surfaces (R19; handled at P3/P4 for the actual text).

## Revisit conditions

1. **The aggregate-faithfulness gap is scheduled for closure** → a new decision evaluates per-action signature submission + server-side recomputation (supersedes this ADR's "(a) is sufficient for Combination 1" scope note with a stronger guarantee).
2. **The writer library is exposed to a less-trusted caller** → the provenance check moves from the route into the library; re-open as Critical.
3. **R18c interoperability requires portable examination proofs** → re-evaluate option (c) (dedicated examination token) as a superseding artefact.
4. **`loop_billing_events` gains agent-binding** → option (b) becomes cheap defense-in-depth; layer it onto (a).

Each revisit produces a new decision-log entry; this ADR is preserved.

## Cross-references

- `/operations/decision-log.md` — the session's adopting entry (to be appended on founder election/OK); `D-ATL-WRITE-PATH-BUILD-WIRED-VERIFIED-2026-05-16`, `D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21` (the write path + A10 ownership gate this ADR builds on); `D-FOUNDER-HUB-MENTOR-PROFILE-DECRYPT-GUARD-2026-05-23` (most-recent entry; unrelated).
- `/drafts/2026-05-23-whole-system-data-room-brief.md` §3 (the configuration ruling).
- `/adopted/sage-assent-write-path-design.md` (Decision A — route+library; Decision C — A10 ownership gate, which explicitly scoped provenance *out*).
- `/adopted/sage-assent-a10-design.md` (the A10 credential surface; the aggregates-then-POST pattern).
- `website/src/app/api/accreditation/[agent_id]/route.ts` (`POST` handler; `verifyAgentIdOwnership`; `validateWriteBody`); `website/src/app/api/accreditation/[agent_id]/request-helpers.ts` (`extractWriteExtras` — caller-supplied `loop_id`).
- `website/src/lib/substrate/sage-assent-accreditation-writer.ts` (`seedAccreditation` / `updateAccreditation` — straight passthrough).
- `website/src/lib/substrate/sage-assent-bridge.ts` (`deriveReceiptId` — wrapper-side signature *hashing*, test-only callers).
- `website/src/lib/translation-sandwich/layer2-signer.ts` (`signLayer2Assessment`; the `crypto.verify` recipe in-comment — the missing verify half); `website/src/app/api/public-key/route.ts` (published Ed25519 verification key).
- `/manifest.md` §R18a/R18b (badge integrity this rule protects), §R19 (honest positioning — the documentation requirement's home), §AC7 (auth/access surface — build-tier driver), §AC8 (substrate).

---

*End of Priority-1 ADR. Adopted 2026-05-23 (option (a) elected; R18f + R19e in manifest). Provenance finding: the credential write path trusts submitted aggregates (Diagnostic-certain); Combination 1 is not structurally prevented today. Recommended enforcement: option (a) — server-side Ed25519 signature verification at the write boundary, after the A10 ownership gate. The eventual build is Critical. No code written by this ADR.*
