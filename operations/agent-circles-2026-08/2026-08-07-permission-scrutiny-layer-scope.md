# Scope: Permission scrutiny layer

**Status: APPROVED AS SUBMITTED by the mentor, 2026-08-07 (full-document review) — all four open questions RULED, and the ruled shape confirmed sound on a second, independent full-document pass with no further corrections required.** §3 (mode 2 threshold), §4 (non-trivial threshold), §5 (deterministic composition), and §6/§2 (tier B audit table) carry the rulings. See the decision-log entries for this session (the rulings pass, then the full-document-review pass) for verbatim text and full disposition.

**Session:** 2026-08-07, rewritten twice same day — first against the mentor's complete instruction (superseding an earlier version built against a partial instruction cut off mid-sentence after Tier A), then again to fold in the mentor's rulings on every open question that first rewrite raised. Tier: `governance`/`code-elevated` — a scope document, no code written. This is the dependency graph's item 15 (`06-PLAIN-TEXT-MIRROR.md` §Sixth element). **Approved as submitted — build has not begun; every schema/migration/flag step remains its own founder-walked 0c-ii.**

**Method:** every section below follows the required-sections template given verbatim in the mentor's complete instruction, now updated to fold in the mentor's rulings on every question §7 originally raised.

---

## 1. What this layer does and does not do

It is a **scrutiny layer, not a permission system**. It does not replace the credential layer (Diagram 5) — the front door handles what the agent is allowed to attempt, which is a credential question. This layer handles what scrutiny level the attempt receives, which is a circle-impact question.

**F-PERM-4 is named explicitly as the ruling that establishes this distinction** (Diagram 5's footnotes, ruled 2026-08-07): *"Permission type is a credential-layer concern; circle-impact scrutiny is an engine-layer concern... Conflating them would mean either over-restricting at the front door or under-scrutinising inside the engine."* The two layers are structurally separate and must not be conflated in any future build.

**What this layer does not do to the verdict, named explicitly:** it does not alter the Layer-2 proximity rating, it does not write trust events, and it does not substitute for the pre-action safety gate's proceed/pause/do-not-proceed determination. It operates AFTER the safety gate has cleared the action and BEFORE the permission is confirmed.

## 2. The four permission tiers

Each tier's rationale connects to the value hierarchy and the `blast_radius` analysis — **tier placement is not arbitrary; it reflects the realistic impact surface of each permission type on preferred and dispreferred indifferents for the affected parties.**

**Tier A — always-auto.** Permissions: **Read, List, Search, Observe, Subscribe.** Rationale: these are informational, they do not change anything, and adding a human gate creates friction without adding safety. The system handles these without prompting. **No `blast_radius` computation is required for tier A actions** because the failure-case impact is bounded to the information surface — no state is altered, no resource is created or destroyed.

**Tier B — auto-with-audit.** Permissions: **Write, Update, Append, Copy, Download, Upload, Schedule.** Rationale: these change things but within bounded, recoverable scope. The system executes but every instance is recorded in an audit trail — **RULED 2026-08-07: a separate permission-audit table, not the trust ledger** (see §6's connection-point correction below for the full ruling). The audit trail is the safeguard, not the human gate. **`blast_radius` computation is triggered for tier B actions that engage circle 3 or above** — the audit record must include the `blast_radius` assessment, not just the action taken.

**Tier C — human-prompted with suggested adjustment.** Permissions: **Create, Delete, Move, Execute, Share, Trigger, Delegate.** Rationale: these have meaningful consequences that may not be reversible. The system assesses, generates a suggested permission level based on the combined signal of circle-width, indifferent-rank, and C2 orientation direction, and presents it to the human for confirmation. The human can accept the suggestion, override it, or escalate to tier D handling. **`blast_radius` computation is required for all tier C actions regardless of circle engagement** — the human approver must see the failure-case analysis before confirming.

**Tier D — preset-human-required, no auto path.** Permissions: **Manage Permissions, Sign, Encrypt, Decrypt, Escalate, Approve, Reject.** Rationale: these touch security, legal, financial, or governance surfaces. **No assessment score, however favourable, bypasses human approval.** The system can inform the human's decision — it must present the `blast_radius` assessment, the circle engagement, the indifferent-rank analysis, and the C2 orientation reading where available — but it cannot substitute for the human's own synkatathesis. **Named connection to the Stoic principle:** the system presents impressions for examination, the human's assent is what matters, and no automation replaces that assent for tier D actions.

## 3. The three dashboard modes

**Mode 1 — human-prompted suggested adjustment.** The system computes a suggested permission level based on the combined signal (circle-width, indifferent-rank, C2 orientation direction, `blast_radius`) and presents it to the human with the reasoning visible. The human sees: the current permission level, the suggested adjustment, the `blast_radius` assessment, the circle engagement, and the indifferent-rank analysis. The human confirms, overrides, or escalates. **This mode applies to tier C actions and to any tier B action where the `blast_radius` assessment is non-trivial.**

**Mode 2 — automatic permission change, restriction direction only.** The system changes the permission level without human prompting, but only in the direction of greater restriction. **F-PERM-2 governs this mode explicitly.** An automatic upgrade never fires without human confirmation.

**RULED 2026-08-07 — one tier at a time, triggered by `blast_radius` crossing the non-trivial threshold on a tier B action, with a named floor of tier C.** An automatic downgrade fires when a tier B action's `blast_radius` assessment identifies at least one high-ranked dispreferred indifferent as a realistic adverse outcome (the same "non-trivial" definition ruled in §4 below). The automatic step is **one tier — from B to C.** The system does not automatically move an action to tier D; that requires human confirmation. **The floor is tier C because tier C is the human-prompted tier** — the automatic restriction's purpose is to ensure a human sees the action before it proceeds, not to block it. The automatic restriction is the system saying: *this action looked like tier B but the impact analysis suggests it warrants a human eye.* The human then decides. Consistent with F-PERM-2 — automatic changes move only in the direction of greater restriction, and the restriction is bounded to one step.

**Mode 3 — preset always-auto.** The system executes without prompting or automatic adjustment. This mode applies to all tier A actions. No `blast_radius` computation, no dashboard interaction, no audit beyond the standard trust ledger emission for credentialed consults.

## 4. The second scrutiny pass trigger condition

The second scrutiny pass fires when **all three** of the following conditions are met simultaneously:

1. The action engages circle 3 or above, as identified by the Layer-1 schema.
2. The permission type is tier C or tier D.
3. The `blast_radius` assessment from item 14 is non-trivial.

**RULED 2026-08-07 — "non-trivial" means any high-ranked dispreferred indifferent present for the affected parties.** Of the three candidates (above a threshold indifferent-rank; above a threshold circle-width; any high-ranked dispreferred indifferent present), circle-width is already in condition 1 of this trigger — it is not the right threshold for `blast_radius` non-triviality, which is about impact severity, not scope. An indifferent-rank threshold is the right category but needed precise specification. **The clearest specification: the second scrutiny pass fires when the `blast_radius` assessment identifies at least one high-ranked dispreferred indifferent — death, disease, loss of freedom, isolation — as a realistic adverse outcome for the affected parties.** This is premeditatio malorum made operational: if the failure case puts something genuinely serious at stake for someone outside the agent's own circle, the human approver needs to see that before confirming. **Low-ranked dispreferred indifferents do not trigger the second pass — the first-order examination is sufficient.**

When the second scrutiny pass fires, **the structured elicitation from item 14 step one is presented to the practitioner/agent.** The output of the elicitation, combined with the independent LLM search output and the value-stake extraction, enriches the `blast_radius` field that the human approver sees. **The second pass does not alter the Layer-2 verdict. It does not write a trust event. It produces an enriched impression for the human approver's examination.**

## 5. The C2 orientation reading as one of three inputs

The C2 orientation reading's toward/away/indeterminate signal is **one of three inputs** to the tier C suggested-adjustment computation — the other two being circle-width and indifferent-rank.

**The composition rule, stated exactly:** an `away` or `indeterminate` reading **raises** the suggested restriction level relative to what circle-width and indifferent-rank alone would produce; a `toward` reading **does not lower it** below what circle-width and indifferent-rank produce. **The orientation reading can only raise the suggested restriction level, never lower it.**

**Named as a principled asymmetry, parallel to F-PERM-2:** the system is always more conservative when uncertain, never less.

**The C2 scope document (item 2b) is named as the authoritative source** for the orientation reading's output schema — this document consumes that schema, it does not redefine it.

**RULED 2026-08-07 — the tier C suggested-adjustment composition is deterministic, not an LLM call.** All three inputs (circle-width, indifferent-rank, C2 orientation direction) are already structured outputs from earlier in the pipeline. A deterministic function over structured inputs is auditable, reproducible, and cannot introduce the epistemic humility concerns that attend LLM calls (item 14's own independent-search caveat, §4 of that document). **The suggested adjustment is not a reasoning task — it is a composition task. The reasoning has already happened upstream.** Compose the three signals into a suggested tier using a fixed rule, document the rule in this scope document once it is finalised (a build-time detail, not fixed by this ruling itself), and make it inspectable. An LLM call here would add latency, cost, and opacity for no gain in reasoning quality.

## 6. Connection points at mechanism level

- **Layer-1 schema field carrying the circle engagement signal** (`oikeiosis_circles_engaged`, `layer1-extractor.ts:556`) — same field item 14's own §2 trigger reads.
- **The C2 orientation reading output field** (`toward|away|indeterminate`, `2026-08-06-c2-orientation-reading-and-c1c-trust-event-scope.md` §1.2) — the input §5's composition rule reads.
- **The `blast_radius` field from item 14** (`2026-08-07-second-order-impact-analysis-scope.md` §6) — the primary input to the tier C suggested-adjustment computation.
- **A NEW separate permission-audit table** (not yet built; not the trust ledger) — the audit mechanism for tier B actions (§2). **RULED 2026-08-07:** the trust ledger records virtue-assessment evidence — what an action revealed about an agent's character, examined through the Stoic framework. Tier B permission records are not that; they are operational audit records ("this action was taken, at this time, with this `blast_radius` assessment"). Mixing operational audit records with virtue-assessment evidence would make the trust ledger harder to reason about and would blur the distinction between what an action revealed and what an action did. **Use a separate permission-audit table.** The table references the trust ledger by `agent_id` and by `execution_trace_id` where a signed assessment exists, but it is not part of the trust ledger itself — a clean architectural boundary.
- **The credential layer from Diagram 5** — the structurally separate upstream layer this layer must not be conflated with (F-PERM-4, §1).
- **The pre-action safety gate from Diagram 1** — the verdict layer this layer enriches but does not replace (F-PERM-1, §1).
- **The governance-oriented permission field extension from item 16** (`2026-08-07-governance-permission-field-extension-scope.md`) — the field schema this layer populates when presenting the human approver's view.

**What is NOT touched:** the Layer-2 proximity rating, the corroboration check, the distress perimeter, the Stoa.

## 7. Open questions — RULED 2026-08-07

All four questions this document originally raised are now ruled. Each ruling is folded into its own section above (§4 for (a); §3 for (b); §5 for (c); §6/§2 for (d)). Recorded here in full as the ruling record, not left as open questions.

**(a) Threshold definition for non-trivial blast_radius — RULED: any high-ranked dispreferred indifferent present for the affected parties.** See §4 above for the full ruling.

**(b) Threshold definition for the automatic restriction trigger in mode 2 — RULED: one tier at a time, B → C, triggered by the same non-trivial `blast_radius` definition as (a), floor of tier C.** See §3 above for the full ruling.

**(c) Suggested adjustment computed deterministically or via LLM call — RULED: deterministically, via a fixed, documented, inspectable rule.** See §5 above for the full ruling.

**(d) Tier B audit records in the trust ledger or a separate permission-audit table — RULED: separate permission-audit table.** See §6 above for the full ruling and the architectural-boundary reasoning.

---

*This document was offered for the mentor's review per the established pattern and is now approved-with-rulings — every open question §7 originally raised is folded into its ruling above. No TypeScript, migration, or RLS policy is written — every shape above is proposed for review, not committed. Build has not begun.*
