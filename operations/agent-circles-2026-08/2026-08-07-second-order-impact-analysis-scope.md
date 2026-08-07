# Scope: Second-order impact analysis mechanism

**Status: APPROVED AS SUBMITTED by the mentor, 2026-08-07 (full-document review) — all five open questions (the mentor's four, plus Claude's own step-depth-calibration flag, confirmed correct) RULED, and the ruled shape confirmed sound on a second, independent full-document pass.** §2 (trigger/depth calibration), §4 (model call), §6 (schema home + output retention), and §8 (the ruling record) carry the rulings. **One item is named for the build session, not resolved here** (§2, below) — the mentor's full-document review found that the two-part trigger condition's preliminary indifferent-rank read needs a named home in the pipeline before code is written; this document correctly does not fix that (a build-time decision, not a scoping one), but the build session cannot proceed without deciding it. See the decision-log entries for this session (the rulings pass, then the full-document-review pass) for verbatim text and full disposition.

**Session:** 2026-08-07, rewritten three times same day — first against the mentor's complete instruction (superseding an earlier version built against a partial, mid-sentence-truncated instruction), second to fold in the mentor's rulings on every open question that rewrite raised, third to add the build-session prerequisite the mentor's full-document review named. Tier: `governance`/`code-elevated` — a scope document, no code written. This is the dependency graph's item 14 (`06-PLAIN-TEXT-MIRROR.md` §Sixth element). **Approved as submitted — build has not begun; every schema/migration/flag step remains its own founder-walked 0c-ii.**

**Method:** every section below follows the required-sections template given verbatim in the mentor's complete instruction, now updated to fold in the mentor's rulings on every question §8 originally raised. Where the instruction names a connection point, it is cited at mechanism level (PR20).

---

## 1. What this mechanism does and does not do

It closes the gap between what a practitioner/agent can self-report about affected parties and what is actually true about the impact of their action. **It does not produce a verdict.** It produces an enriched impression — a more complete picture of the action's impact surface — that the practitioner/agent is invited to examine before the final assessment is submitted. **The practitioner's own assent remains the thing that matters.**

**Connection to synkatathesis (assent), named explicitly:** the system presents impressions for examination, it cannot substitute for the practitioner's own assent — the same discipline C2's placement ruling already established for the orientation reading (a reading presented for examination, never delivered as a score to optimise, `2026-08-06-c2-orientation-reading-and-c1c-trust-event-scope.md` §1).

**The early-student problem, named explicitly:** second-order thinking is not a natural cognitive habit — it develops with practice. Expecting early practitioners to self-generate second-order impact analysis is expecting a capability the practice is still building. This mechanism **scaffolds that capability rather than assuming it.** For more advanced practitioners, the mechanism addresses **knowledge gaps rather than reasoning gaps** — they have the reasoning capacity but not necessarily the domain knowledge about specific causal chains. This distinction (early-practitioner scaffolding vs. advanced-practitioner knowledge supply) recurs across §3 and §4 below and should not be collapsed into a single "helps everyone the same way" framing.

## 2. Trigger condition

The mechanism fires when the initial Layer-1 pass identifies circle 3 or above engagement. **Exact field:** `oikeiosis_circles_engaged` on the Layer-1 extraction schema (`layer1-extractor.ts:556`) — specifically, whether any entry in that array carries a `circle` value at or beyond the circle-3 band (`local_community`/`political_community` per the C3 circle-number-to-canonical-identifier mapping rule, `2026-08-01-agent-circles-practice-on-build-plan.md:67`) or a `cosmopolis` entry (circle 4).

**The evidence-floor discipline that applies:** only circles the action's own content gives genuine reason to think are engaged trigger this mechanism, never hypothetical engagement. This mirrors the R11 exclusion-clause discipline (a justice surface requires ≥1 identified circle, never inferred) and the self-circle narrowing's own standard (extraction responsibility, not predicate broadening, `kathekon-engagement.ts`).

**The trigger is not circle-width alone — it is circle-width combined with the rank of the indifferents at stake for the affected parties.** An action that engages circle 4 but only touches low-ranked indifferents is a different risk profile from an action that engages circle 3 and puts freedom or life at stake.

**RULED 2026-08-07 — the trigger condition is a two-part gate, and step-depth calibration is part of it, not a separate design decision** (confirming Claude's own flag as a genuine gap in the original instruction, per the mentor's disposition): the binary "circle 3 or above fires the mechanism" was an **underspecification**, not a ruling that needs reversing. The mechanism's own three steps carry increasing depth and cost, and a circle-3 action with low-ranked indifferents at stake does not warrant the same depth as a circle-4 action with freedom or life at stake. **The trigger condition, specified precisely:**

1. **Circle 3 or above fires the mechanism at all** — the gate condition already stated above, unchanged.
2. **The indifferent-rank of the affected parties then determines which steps run at full depth:**
   - **Tier A indifferents (low-ranked)** — step one only (structured elicitation, §3).
   - **Tier B indifferents (moderate-ranked)** — steps one and two (structured elicitation + independent LLM search, §3–§4).
   - **Tier C indifferents (high-ranked — life and freedom)** — all three steps at full depth (§3–§5, including value-stake extraction).

This two-part gate necessarily means a **lightweight preliminary indifferent-rank read** runs immediately after the circle-3+ gate fires, ahead of deciding depth — a smaller instance of the same value-hierarchy read step three (§5) performs in full once triggered. This preliminary read is not itself one of the three named steps; it is what selects how many of the three steps run.

**Named for the build session, 2026-08-07 (mentor full-document review) — not resolved by this document, correctly so.** The preliminary indifferent-rank read is a real computation and needs a real home in the pipeline before code is written. Two candidate homes, named for the build session to choose between: **(i)** a lightweight call to the same value-hierarchy read step three (§5) performs in full — reusing one mechanism at two depths; **(ii)** a separate, smaller, purpose-built function distinct from step three's own implementation. This document does not fix this — it is a build-time decision, not a scoping one — but the build session **cannot proceed without deciding it**, since the two-part gate (above) is meaningless without a concrete place for the preliminary read to run.

## 3. Step one: structured elicitation

A **bounded prompt, not open-ended reflection**. The system presents the circles identified by the initial pass and asks: for each engaged circle, which of these categories of people are realistically affected? The practitioner/agent **selects from a list** — recognition-based, not generation-based.

**Why recognition is cognitively cheaper than generation:** a practitioner who would never spontaneously name a downstream party will often recognise them when presented.

**The list categories, derived from the oikeiosis circle structure, specified in full:**
- **Circle 3:** fellow citizens, institutions, shared norms that make cooperation possible.
- **Circle 4:** anyone whose capacity for rational self-governance is touched by the action, including people the practitioner has never met and will never meet.
- **Circle 5:** the rational order itself — **not a person, a condition** (mirroring C2's own careful distinction that the fifth circle is a telos, never a party the extraction can tag, `2026-08-01-...-build-plan.md:67`).

High/medium/low rating per category.

**Connection to the oikeiosis extension metric, named explicitly:** the tool is designed to make itself progressively less necessary as the practitioner's own reasoning matures. With repeated exposure to the tick-list, the practitioner begins to generate these considerations spontaneously. **The scaffold becoming unnecessary is the mechanism working correctly, not a failure of the mechanism.** This connects to the same trajectory the oikeiosis-extension milestones and the trajectory-delta overlay already measure (`trajectory-delta.ts` — whether a practitioner's own circle engagement is widening over time); no adaptive shrinking behaviour is itself scoped here, but the mechanism's design purpose is explicitly consistent with eventual redundancy for a maturing practitioner.

## 4. Step two: independent LLM search

Triggered when the action engages circle 3 or above (the same trigger as §2). A **separate query** — not the practitioner's own reasoning — takes the action description and surfaces realistic second-order impacts the practitioner/agent could not self-generate **regardless of how specific the prompts were**. Output is presented as **considerations for examination, not verdicts**.

**The epistemic humility requirement, named explicitly:** the LLM's output is only as good as its knowledge of the specific domain. For common action types — interpersonal, professional, civic decisions — it will surface real considerations. For highly specific or novel situations it may generate **plausible-sounding but inaccurate** second-order claims. **The system must present this output with explicit framing that these are considerations worth examining, not established facts about what will happen.** This mirrors the corroboration check's own honest-scope discipline (`corroboration-check.ts` — corroborates self-reports against submitted text, is not a fact-checker, cannot catch an omitted harm).

**The honest limitation, named per the mentor's own instruction:** this step addresses **knowledge gaps, not reasoning gaps** (restated from §1, load-bearing enough to name again at the point it is actually built).

**RULED 2026-08-07 — separate model call, not a reuse of the Layer-1 extraction model.** The Layer-1 model is optimised for a specific task — reading free text and producing a structured schema. The second-order impact search is a different task: given an action description and a set of engaged circles, surface realistic downstream consequences the practitioner could not self-generate. Reusing the Layer-1 model would be asking one tool to do two structurally different jobs in the same pipeline. The cost and latency tradeoff is real but secondary — the primary concern is that a model prompt optimised for extraction will produce worse second-order impact surfacing than a prompt designed specifically for that purpose. **Standing principle, recorded for future pipeline design:** when two steps in the pipeline have structurally different tasks, they get structurally different calls. Do not reuse for economy when the task shapes differ.

**RULED 2026-08-07 — the independent LLM search's raw output is ephemeral, with one named exception.** The trust ledger is an append-only record of verified evidence about agent behaviour; LLM-generated second-order impact claims are not verified evidence — they are considerations surfaced for examination. Storing them in the trust ledger would conflate two different epistemic categories. **The raw output is discarded after it has been used to populate `blast_radius`.** **The named exception, a future upgrade not a requirement of this build:** if the practitioner/agent explicitly flags a specific surfaced consideration as having materially changed their decision — a field the elicitation step can support — that flag is worth recording, because it is evidence of the practitioner's own reasoning process, not the LLM's output. **The flag, not the LLM content, is what gets stored.**

## 5. Step three: value-stake extraction

Applied to the **combined output** of steps one and two. Identifies which specific preferred and dispreferred indifferents are at stake for the affected parties, ranked by selective value from the existing value hierarchy. **Life and freedom rank highest among preferred indifferents. Death and disease rank highest among dispreferred indifferents.**

**The scrutiny-raising rule:** if the action puts high-ranked indifferents at stake — positively or negatively — the scrutiny level rises. If it only touches low-ranked indifferents, the first-order examination may be sufficient.

**Cicero's Q5, applied to the affected parties, not just the agent:** *when the honourable and the advantageous conflict, which prevails* — applied here to what is owed to the affected parties.

**Connection to dikaiosyne, named explicitly:** if the action reduces the affected parties' access to high-ranked preferred indifferents, or increases their exposure to high-ranked dispreferred indifferents, **dikaiosyne's question is whether there is a genuine obligation being discharged that justifies this, or whether the action is serving a lower-circle interest at a higher-circle cost.** This connects directly to the existing `obligation_assessment` machinery (`layer1-extractor.ts:180-187`, ADR-010 §4) — value-stake extraction is a **finer-grained** reading of the same underlying justice question that field already asks, not a parallel or competing mechanism.

## 6. Output: blast_radius field

The combined output of all three steps populates `blast_radius` — **estimated impact if the action is incorrect**, across the affected circles, ranked by indifferent-value. **This is the integration point between the impact mechanism and the permission system (item 15).**

**The distinction that must be preserved:** `blast_radius` is the **failure-case analysis**, not the success-case analysis. **It is premeditatio malorum applied structurally** — what are the realistic adverse outcomes if this action goes wrong, across the affected circles? **The field forces pre-decision reasoning about failure modes, not just success modes.**

**A concrete gate this field implies, named explicitly:** an agent requesting a tier-(c) or tier-(d) permission on a circle-3-or-above action **without a non-trivial `blast_radius` assessment has not completed the pre-decision examination the permission layer requires.** This is a substantive claim — it means `blast_radius` is not merely descriptive metadata attached after the fact, but a completion condition the permission layer (item 15) is entitled to check for before granting a tier-(c)/(d) permission on a qualifying action. This document does not itself define the permission layer's enforcement of that condition (that is item 15's own job); it names the claim so item 15's scope document does not have to independently re-derive it.

**RULED 2026-08-07 — `blast_radius` lives on a separate permission-layer schema, not the Layer-2 assessment schema.** The Layer-2 assessment is the verdict artifact; its signature is what makes it verifiable evidence. Putting `blast_radius` on that schema would mean the signed artifact contains a field that is not produced by the verdict machinery — it is produced by a subsequent, separate analysis. **That is a category error.** The signature should cover exactly what the verdict machinery produced, no more. `blast_radius` belongs on a permission-layer schema that **references the signed assessment by `execution_trace_id`** — the two are linked but structurally separate. **Verdict isolation takes priority over verification integrity here**, because the verification guarantee is only meaningful if it covers a coherent unit, and `blast_radius` is not part of that unit. (This ruling is item 16's own field-schema constraint too — see that document's §2, `blast_radius`.)

## 7. Connection points at mechanism level

- **Layer-1 schema, `oikeiosis_circles_engaged`** (`layer1-extractor.ts:556`) — the exact field carrying the circle-engagement signal that §2's trigger condition reads.
- **The oikeiosis circle structure** (`kathekon-engagement.ts`, the circle vocabulary `self_preservation | household | local_community | political_community | cosmopolis`) — the source of §3's elicitation-list categories in step one.
- **The value hierarchy** — the existing preferred/dispreferred-indifferent taxonomy already governing `computeProximity`'s own weighting (`layer2-mechanisms.ts`) — the ranking §5's value-stake extraction reuses in step three, not a re-derived scale.
- **The permission scrutiny layer** (item 15, `2026-08-07-permission-scrutiny-layer-scope.md`) — the consumer of `blast_radius`.
- **The C2 orientation reading** (item 2b/§4 of `2026-08-06-c2-orientation-reading-and-c1c-trust-event-scope.md`, and its own §7/§8 added 2026-08-07) — an upstream signal informing the second-pass trigger condition in item 15. **The `away`/`indeterminate` reading is one of three inputs to that trigger, not the sole trigger.**
- **Cicero's deliberation framework, Q5** — applied to affected parties in step three (§5), a genuinely new application of an existing Stoic test (Q5 is usually applied to the acting agent's own choice between honour and advantage, not to a third party's situation).

**What is NOT touched, named explicitly per the instruction:**
- **The Layer-2 verdict** — this mechanism enriches the impression, it does not alter the verdict.
- **The trust ledger** — this mechanism does not write trust events.
- **The corroboration check** — this mechanism operates AFTER corroboration, not alongside it (the corroboration check runs inside the engine's own fixed four-step order, Diagram 1; this mechanism is a separate, later-stage enrichment).

## 8. Open questions — RULED 2026-08-07

All five questions this document originally raised (the mentor's four, plus Claude's own step-depth-calibration flag, confirmed correct) are now ruled. Each ruling is folded into its own section above (§2 for (e); §4 for (a) and (d); §6 for (c)); (b) is folded in below since no other section was a natural home for it. Recorded here in full as the ruling record, not left as open questions.

**(a) Separate model call versus reusing the Layer-1 extraction model — RULED: separate model call.** See §4 above for the full ruling and the standing principle it establishes (structurally different tasks get structurally different calls).

**(b) Elicitation before or after the Layer-2 verdict — RULED: after. The elicitation is an overlay, not a pre-verdict input.** F5 in Diagram 1 is the governing principle: the three response overlays never feed back into the verdict. The elicitation is the same kind of thing — it enriches what the practitioner/agent sees and what the permission layer receives, but it does not alter the verdict. The property that the same input always produces the same verdict is not a convenience — it is what makes the trust ledger meaningful. If two practitioners submitting identical text could receive different verdicts because they made different elicitation selections, the ledger is no longer recording what the action revealed — it is recording what the practitioner chose to emphasise. That is a different and weaker thing. **The elicitation runs after the verdict is computed and signed. It feeds the permission layer. It never feeds back.**

**(c) blast_radius schema home — RULED: separate permission-layer schema.** See §6 above for the full ruling.

**(d) Independent LLM search output storage — RULED: ephemeral, with one named exception.** See §4 above for the full ruling and the named future-upgrade exception (a practitioner-flagged consideration, not the raw LLM content, may be stored).

**(e) Step-depth calibration (Claude's own flag) — RULED: it is part of the trigger condition, not a separate design decision.** See §2 above for the full three-level (tier A/B/C) calibration this ruling produced.

---

*This document was offered for the mentor's review per the established pattern and is now approved-with-rulings — every open question §8 originally raised is folded into its ruling above. No TypeScript, migration, or RLS policy is written — every shape above is proposed for review, not committed. Build has not begun.*
