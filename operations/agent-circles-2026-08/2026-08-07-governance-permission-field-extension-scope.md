# Scope: Governance-oriented permission field extension

**Status: APPROVED AS SUBMITTED by the mentor, 2026-08-07 (full-document review) — all six open questions (the mentor's five, plus Claude's own verification_method-shape flag, confirmed correct) RULED, and the ruled shape itself confirmed sound on a second, independent full-document pass.** §2, §4, §5, and §7 carry the rulings; §4 additionally now carries the approver-view FIELD ORDER (added on the full-document review, not part of the original six rulings); a companion ruling adds **item 17** to the dependency graph for the intent-versus-assessed-quality gap trust event — **its soft dependency (this document's §2 `intent` structured categories) is now MET, so item 17 is UNBLOCKED**, ready to open whenever the founder elects it, not merely soft-dependent on a future approval. See the decision-log entries for this session (the rulings pass, then the full-document-review pass) for verbatim text and full disposition.

**Session:** 2026-08-07, rewritten three times same day — first against the mentor's complete instruction (superseding an earlier version authored with no dedicated required-sections template at all, since the partial instruction had been cut off before reaching a B3 section), second to fold in the mentor's rulings on every open question that rewrite raised, third to fold in the approver-view field order and the item-17-unblock confirmation from the mentor's full-document review. Tier: `governance`/`code-elevated` — a scope document, no code written. This is the dependency graph's item 16 (`06-PLAIN-TEXT-MIRROR.md` §Sixth element). **Approved as submitted — build has not begun; every schema/migration/flag step remains its own founder-walked 0c-ii.**

**Method:** every section below follows the required-sections template given verbatim in the mentor's complete instruction, now updated to fold in the mentor's rulings on every question §7 originally raised.

---

## 1. What this extension does and does not do

It extends the standard IAM permission model with **ten governance-oriented fields** that are not yet industry standard but are well suited to autonomous agent reasoning harnesses. **It does not replace the standard IAM fields** — `resource`, `action`, `scope`, `conditions`, `allowed`, `approval_required`, `approval_level`, `expires_at`, `effective_from`, `granted_by`, `granted_to`, `delegation_allowed`, `inheritance`, `audit_required`, `risk_level`, `justification`, `usage_limit`, `rate_limit`, `confirmation_required` — all of which remain in place. The ten new fields make agent actions more transparent, auditable, and governable.

**The distinction that must be preserved, honestly:** some of the ten fields are genuinely new to this architecture; others already exist under different names and need only a named connection to the permission layer. §2 states which is which for each field individually; §3 summarises the distinction.

## 2. The ten fields, defined individually

**`intent`.** Why the agent believes the action is needed. **New — not currently captured anywhere in the architecture. The gap was confirmed 2026-08-07.** This is the agent's own stated reason, distinct from the system's assessment of the action's kathekon quality. **The gap between stated intent and assessed quality is itself a signal worth recording** — an agent whose stated intent diverges from what the assessment reveals about the action's actual character is showing something the trust ledger should know about (developed fully in §5).

**RULED 2026-08-07 — both, with structured categories as the primary surface and free-text as an optional extension.** Structured categories are auditable and comparable across actions; free-text captures nuance the categories cannot. **The right design is structured categories first** — a bounded list derived from the oikeiosis circle structure, naming the circle the agent believes the action serves — **with an optional free-text field for elaboration.** The structured field is what the intent-versus-assessed-quality gap signal (§5) reads; the free-text field is for the human approver's benefit. **The structured categories, defined precisely:** self-regarding (circle 1), relational (circle 2), civic (circle 3), universal (circle 4), rational-order (circle 5) — mapping directly to the oikeiosis structure and making the gap signal computable: if the agent declares circle-4 intent and the assessment classifies the action as self-regarding, the gap is visible without reading the free text.

**`expected_outcome`.** The desired result of the action. **New.** Distinct from `blast_radius` — `expected_outcome` is the success-case analysis, `blast_radius` is the failure-case analysis. Together they form the pre-decision examination the permission layer requires: what do I expect to happen, and what happens if I am wrong? **Connection to premeditatio malorum, named explicitly:** the Stoic practice of imagining adverse outcomes before acting is here made structural, not optional.

**`confidence`.** The agent's confidence in the decision. **Maps to existing architectural concepts:** `generationConfidence` on `GeneratedCandidate` (approved 2026-08-06), `noveltyConfidence` on the C2-adjacent novelty detection specification (approved 2026-08-06), and the `*_basis` field on the orientation reading. Confidence is already a first-class concept in this architecture. **The connection needed here is a named mapping** from those existing fields to the permission layer's `confidence` field — not a new confidence computation, but a named surface where existing confidence signals are visible to the permission layer.

**`reversibility`.** Whether the action can be safely undone. **Maps to an existing design principle** — reversibility has been a trigger condition for the second scrutiny pass since the pre-determination discussion; it is already a design principle in the architecture. It needs a **formal field** so it is explicitly present in the permission record rather than implicit in the scrutiny logic.

**RULED 2026-08-07 — a three-value enum: fully reversible, partially reversible, irreversible.** A boolean is simpler but loses information the human approver genuinely needs — a **partially reversible** action, where some consequences can be undone but others cannot, is a different risk profile from a fully reversible one, and the human approver should see that distinction. The three-value enum is more informative without being significantly more complex to implement. **Defined precisely:** fully reversible means the action can be completely undone with no residual effect; partially reversible means some but not all consequences can be undone; irreversible means the action cannot be undone once taken.

**`blast_radius`.** Estimated impact if the action is incorrect. This is the **output of the second-order impact analysis mechanism (item 14)** and the integration point between that mechanism and the permission system. **It is the most important of the ten fields** because it is the one that connects the Stoic framework's second-order reasoning to the permission layer's approval logic. **The field's shape must carry:** the affected circles, the indifferents at stake for each circle ranked by selective value, and the overall severity assessment (high/medium/low). The item 14 scope document is named as the authoritative source for how this field is populated. **RULED 2026-08-07 (via item 14's own §6/§8(c)):** `blast_radius` lives on a **separate permission-layer schema**, referencing the signed Layer-2 assessment by `execution_trace_id` — never on the Layer-2 assessment schema itself, a category-error avoided (verdict isolation over verification integrity; full reasoning in `2026-08-07-second-order-impact-analysis-scope.md` §6).

**`verification_method`.** How success will be validated. **New — genuinely absent from the current architecture.** An action without a verification method is an action whose consequences cannot be learned from. The trust ledger records what happened; the verification method determines whether what happened was what was intended. **Connection to the trust ledger's learning function, named explicitly:** the trust ledger is only as useful as the verification that confirms whether the action's `expected_outcome` was achieved.

**RULED 2026-08-07 — Claude's own flag confirmed as a genuine gap in the original instruction.** `verification_method` is **a free-text field with a structured enum of verification types as the primary surface**, following the same pattern as `intent`. **The structured enum, naming the categories of verification meaningful for agent actions:** outcome-observable (the result is directly visible), third-party-confirmable (a separate agent or human can confirm), metric-trackable (a measurable signal changes as expected), trust-ledger-verifiable (the trust ledger records the outcome), and **unverifiable** (no verification method is available —**this value must be permitted**, because forcing a false verification claim is worse than recording honest absence). **The `unverifiable` value is not a failure state — it is an honest signal** that the action's consequences cannot be confirmed, which is itself important information for the human approver and for the trust ledger's learning function.

**`ethical_policy`.** The governance or policy rules applied to the action. **Maps to the existing Stoic framework application** — the virtue assessment, the kathekon quality, the circle engagement, and the C2 orientation reading together constitute the ethical policy applied to every action in this system. **The connection needed here is a named field that makes that application visible in the permission record, not a new policy computation.** Defined as a **structured reference to the Layer-2 assessment artifact** — the signed assessment is the ethical policy record, and this field carries the `execution_trace_id` that links to it.

**`human_review_reason`.** Why human approval is required, where applicable. **New.** Populated only for tier C and tier D actions (item 15 §2). It must carry: the tier assignment rationale (which combination of circle-width, indifferent-rank, and C2 orientation direction triggered the tier), the `blast_radius` severity, and any specific concern the second scrutiny pass surfaced. **The human approver must be able to read this field and understand why their approval is being sought without needing to read the full assessment artifact.**

**`execution_trace_id`.** A link to the full reasoning and execution trace. **Maps to the existing signed Layer-2 assessment artifact.** The Ed25519-signed assessment is already the verifiable artifact that the trust ledger treats as verified evidence (`layer2-signer.ts`). **The connection needed here is a named field in the permission record that carries the identifier linking to that artifact** — so that any permission record can be audited against the reasoning that produced it. The exact identifier format is named from `layer2-signer.ts` — **open question §7(c)** whether this document should restate that format verbatim or simply cite the file, since restating it here risks drift if the signer's own format ever changes.

**`provenance`.** The source of the data or decision that led to the action. **New.** Distinct from `execution_trace_id` — `provenance` names where the input data came from, not where the reasoning artifact lives. An agent acting on data from an external source whose reliability is unknown is in a different risk position from an agent acting on data it generated itself or data from a verified internal source. Provenance makes that distinction explicit and auditable.

**RULED 2026-08-07 — a nested structure.** A single field cannot carry the information the audit use case requires. Provenance needs to name: **the data source identifier, the source type** (internal/external/agent-generated), **and the verification status of the source at the time the action was taken.** These are three distinct pieces of information that a single string field would flatten into an unparseable blob. **Use a nested structure** — the three sub-fields as named above. The schema complexity is modest and the audit value is real.

## 3. Fields that are new versus fields that map to existing concepts

**New fields requiring implementation:** `intent`, `expected_outcome`, `verification_method`, `human_review_reason`, `provenance`.

**Fields mapping to existing concepts, requiring only a named connection:** `confidence` (maps to `generationConfidence`, `noveltyConfidence`, orientation reading `*_basis`), `reversibility` (existing design principle needing a formal field), `blast_radius` (output of item 14), `ethical_policy` (maps to the signed Layer-2 assessment), `execution_trace_id` (maps to the signed Layer-2 artifact identifier).

**This distinction matters for build sequencing:** the mapping fields can be connected before the new fields are designed, and the new fields each require their own open-question rulings before implementation begins.

## 4. The human approver's view

When a tier C or tier D action reaches the human approver, the permission record must present a **coherent, readable summary — not a raw dump of all ten fields.**

**The default approver view, as a structured subset — RULED 2026-08-07 (mentor review), field ORDER now fixed alongside the field SET:**
1. `human_review_reason` (why approval is being sought)
2. `blast_radius` (what happens if this goes wrong, across the affected circles)
3. `reversibility` (whether the action can be undone)
4. `expected_outcome` (what the agent expects to happen)
5. `intent` (why the agent believes the action is needed)
6. `ethical_policy` (a reference to the signed assessment, not the full assessment text)
7. `execution_trace_id` (the link to the full reasoning artifact for any approver who wants to examine it)

**Why this order, per the mentor's own reasoning:** for a human approver making a time-pressured decision on a tier C or tier D action, order is not cosmetic — it determines what they see first. `human_review_reason` comes first because it tells them WHY they are being asked. `blast_radius` comes second because it tells them WHAT HAPPENS if they approve something they should not. `reversibility` moves up (from its position in an earlier draft of this list) to third, ahead of `expected_outcome` and `intent`, because it is the first thing an approver needs to know once they understand the stakes: **can this be undone if I am wrong?**

**The remaining fields — `confidence`, `verification_method`, `provenance` — are available in the full record but not surfaced in the default approver view.**

**RULED 2026-08-07 — fixed, with a named future upgrade path to configurable.** Consistency is more important than flexibility at this stage. A fixed view ensures every human approver sees the same fields in the same order, which makes the approval process auditable and prevents approvers from hiding fields that should be visible. **The fields in the fixed view are exactly the seven listed above** (`human_review_reason`, `blast_radius`, `expected_outcome`, `intent`, `reversibility`, `ethical_policy` reference, `execution_trace_id`). **Configurability is a named future upgrade** — it requires understanding how approvers actually use the view before deciding what flexibility serves them. Build fixed first; configurability is named as a future upgrade, not decided here as an open question left standing.

## 5. The intent-versus-assessed-quality signal

**The gap between stated intent and the system's assessment of the action's kathekon quality is a signal worth recording explicitly.** If an agent states an intent that the assessment reveals to be inconsistent with the action's actual character — for example, stating a circle-4 intent for an action the assessment classifies as self-regarding — that gap is a coherence signal parallel to the corroboration check in Diagram 1.

**This connection is named explicitly, not left implicit:** the corroboration check catches gaps between self-report claims in the schema and the submitted text. The `intent` field catches gaps between stated purpose and assessed virtue-domain engagement. **The two checks are structurally parallel** and should be named as such wherever this field is later built.

**RULED 2026-08-07 — yes, it writes a trust event. The event type is to be determined in a separate session. It is not folded into the circle-5 C1c item.** The gap between stated intent and assessed quality is a coherence signal parallel to the corroboration check. The corroboration check writes no trust event of its own — it makes the verdict more conservative. **The intent gap is different: it is evidence about the agent's self-representation, not just about the action's quality.** An agent that consistently declares circle-4 intent for actions the assessment classifies as self-regarding is showing a pattern the trust ledger should record.

**The event type is NOT settled by this ruling** — it requires its own session, because the shape of the event depends on the `intent` field's structured categories (§2) being finalised first. **What is settled: it writes a trust event, it is structurally distinct from the circle-5 C1c item approved 2026-08-06, and it must not be silently folded into that item.**

**A companion ruling, delivered alongside this one: this event class is now `06-PLAIN-TEXT-MIRROR.md`'s dependency-graph item 17** — *Intent-versus-assessed-quality gap trust event class. Not yet scoped. Soft dependency on item 16's intent field structured categories being approved. Structurally distinct from the circle-5 C1c item (approved 2026-08-06) and from the original build-plan C1c first-circle failure/demonstration events — must not be silently folded into either. Requires its own session. Does not block items 14, 15, or 16. Does not block any existing item in the graph.* This connects to, and is now the disposition of, the original build-plan C1c question (first-circle failure/demonstration trust-event classes, `2026-08-01-agent-circles-practice-on-build-plan.md:54`) insofar as both are trust-event classes still owed a home distinct from the circle-5 C1c already built — item 17 is its own named item, not a resolution of the original C1c's own scope, which remains separately outstanding (`D-C1C-NAMING-RESOLVED-2026-08-06`).

**Dependency status update, 2026-08-07 (full-document review):** the `intent` structured categories this section's soft dependency named (self-regarding, relational, civic, universal, rational-order) are now approved (§2 above). **The soft dependency is therefore met — item 17 is UNBLOCKED**, not merely soft-dependent on a future approval. Its own scoping session can proceed as soon as one is scheduled.

## 6. Connection points at mechanism level

- **The Layer-2 assessment schema** — the source of `ethical_policy` and `execution_trace_id`.
- **`layer2-signer.ts`** — the source of the `execution_trace_id` format (§2, open question §7(c) on whether to restate the exact format here).
- **The item 14 scope document** (`2026-08-07-second-order-impact-analysis-scope.md`) — the authoritative source for `blast_radius` population.
- **The item 15 scope document** (`2026-08-07-permission-scrutiny-layer-scope.md`) — the consumer of all ten fields in the permission record.
- **The corroboration check** (`corroboration-check.ts`) — the structural parallel to the intent-versus-assessed-quality signal (§5).
- **The trust ledger** (`agent_trust_events`) — **RULED 2026-08-07 as the write target** for the intent-versus-assessed-quality gap signal (§5) — the event TYPE is not yet settled (its own future session, item 17), but that it writes to the trust ledger is now settled, not open.
- **Item 17** (`06-PLAIN-TEXT-MIRROR.md` §Sixth element, added 2026-08-07) — the new dependency-graph home for the intent-versus-assessed-quality gap trust-event class, soft-dependent on this document's own `intent` structured categories (§2) being approved.
- **The C2 scope document** (`2026-08-06-c2-orientation-reading-and-c1c-trust-event-scope.md`) — the source of the orientation reading signal that feeds into `ethical_policy`.

**What is NOT touched:** the Layer-2 verdict, the distress perimeter, the Stoa, the credential layer.

## 7. Open questions — RULED 2026-08-07

All six questions this document originally raised (the mentor's five, plus Claude's own `verification_method`-shape flag, confirmed correct) are now ruled. Each ruling is folded into its own field definition above (§2 for (a), (b), (e), and (f); §5 for (c); §4 for (d)). Recorded here in full as the ruling record, not left as open questions.

**(a) intent — free-text, structured categories, or both — RULED: both, structured categories primary, free-text optional.** See §2 above for the full ruling and the five named categories (self-regarding/relational/civic/universal/rational-order).

**(b) reversibility — boolean or three-value enum — RULED: three-value enum (fully reversible, partially reversible, irreversible).** See §2 above for the full ruling and the three precise definitions.

**(c) intent-versus-assessed-quality gap — trust event or not — RULED: yes, writes a trust event; event type deferred to its own session (item 17); not folded into the circle-5 C1c item.** See §5 above for the full ruling.

**(d) human approver view — configurable or fixed — RULED: fixed, with a named future upgrade path to configurable.** See §4 above for the full ruling.

**(e) provenance — single field or nested structure — RULED: nested structure** (data source identifier, source type, verification status). See §2 above for the full ruling.

**(f) verification_method shape (Claude's own flag) — RULED: confirmed as a genuine gap in the original instruction; a free-text field with a structured enum of verification types as the primary surface.** See §2 above for the full ruling and the five named categories (outcome-observable/third-party-confirmable/metric-trackable/trust-ledger-verifiable/unverifiable).

**One additional ruling, delivered alongside these six, not itself one of the open questions:** the intent-versus-assessed-quality gap trust event (c, above) is now **item 17** in the dependency graph (`06-PLAIN-TEXT-MIRROR.md` §Sixth element) — see §5's full treatment for the item's exact specification.

**The cross-reference to item 14's own §8(c)** (whether `blast_radius` lives on the Layer-2 assessment schema or a separate permission-layer schema) is now also ruled — separate permission-layer schema — folded into this document's own `blast_radius` field definition, §2 above.

---

*This document was offered for the mentor's review per the established pattern and is now approved-with-rulings — every open question §7 originally raised is folded into its ruling above, plus the companion item-17 dependency-graph addition. No TypeScript, migration, or RLS policy is written — every shape above is proposed for review, not committed. Build has not begun.*
