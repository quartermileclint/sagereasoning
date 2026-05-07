# Next-Session Prompt — M1-CP5b: ADR-007 amendment for Layer 3 prose-template revisions

**Stream:** founder.
**Tier:** governance (Standard).
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache; deliverable-of-the-day named below).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-07-sub-session-M1-CP5-close.md`.
**Predecessor decision-log entries:** `D-M1-CP5-COMPARISON-RUBRIC-FIRST-PASS-2026-05-07` (the founder's Revise election + the seven Layer 3 prose-template gaps); `D-M1-CP4f-PARALLEL-RUN-OBSERVATION-INFRA-2026-05-07` (observation infrastructure landed); `D-M1-CP4e-B-AC13-TIER1-DEPLOYED-2026-05-07` (Tier 1 deployed).
**Risk classification:** Standard under 0d-ii. Governance/documentation only; no production touch. Critical Change Protocol NOT engaged. AC4/AC5/AC7/PR6 NOT engaged.

## Why this session matters

M1-CP5 read the comparison rubric and found the analytical engine sound but the Layer 3 prose-rendering layer not yet user-ready. Seven specific gaps in the prose template were catalogued. Founder elected Revise rather than Cutover. M1-CP5b is the first half of the Revise path: amend ADR-007 (the Layer 3 prompt-template specification) to address the seven gaps. M1-CP5c (the second half) implements the amendments in `/website/src/lib/translation-sandwich/layer3-prose.ts`, regenerates the harness fixture caches, and runs a brief parallel-run re-validation. Then return-to-M1-CP5 with refreshed comparison data; M1-CP6 cutover when prose is user-ready.

This is governance/design work. No code is touched at M1-CP5b. The output is an amended `/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md` that names exactly what M1-CP5c implements.

## Pre-conditions

1. M1-CP5 commit + push completed (Vercel state unchanged — M1-CP5 was read-only against data; no `/website/**` files touched).
2. Founder ready for a Standard-tier governance session — typically 1.5–2 hours.
3. ADR-007 read in full at session open (Part A reads).
4. The seven Layer 3 prose-template gaps from `D-M1-CP5-COMPARISON-RUBRIC-FIRST-PASS-2026-05-07` reviewed at session open.
5. No env-flag changes anticipated.
6. No Anthropic API key required (governance session; no LLM calls).
7. No Supabase access required (governance session; no DB reads/writes).

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier `governance`, Standard risk class, signals).
2. `/operations/handoffs/founder/2026-05-07-sub-session-M1-CP5-close.md` (~5 min — predecessor close).
3. `/operations/decision-log.md` last entry (`D-M1-CP5-COMPARISON-RUBRIC-FIRST-PASS-2026-05-07`) — read in full, especially the seven prose-template gaps catalogue.
4. `/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md` (ADR-007 — the deliverable to amend) — read in full.
5. `/adopted/adr/2026-05-04-layer1-schema-specification.md` §3 (ADR-005 — read the section on what Layer 1 extracts; relevant to gap 6 disposition).
6. `/adopted/adr/2026-05-04-translation-sandwich-pilot-api-reason.md` §2.4 (ADR-004 — Layer 3 contract) + §10 M1-CP4b row (in-place ADR amendment precedent).

Confirm at session open per cache + Standard-tier protocol:

- **Tier:** `governance` — Standard risk under 0d-ii (in-place ADR amendment; no production touch).
- **Hold-point:** P0 0h active.
- **Model selection (per cache Element 6):** N/A. Governance session; no LLM calls.
- **Status vocabulary:** ADR-007 at Verified (existing); the amendment lands the ADR at Verified (amended) at session close. Layer 3 module status: unchanged at Verified (today's behaviour); becomes Scoped → Designed for the amendment scope, lands at Wired/Verified at M1-CP5c.
- **Engaged rules:** R0 (oikeiosis — the prose template is what the practitioner experiences; this amendment serves Circle 1 + 2 of the oikeiosis sequence directly); R8a (controlled vocabulary — preserved); R8c (English-only on user-facing prose — gap 3 directly addresses this); R7 (source fidelity — preserved); AC8 (translation-sandwich engine — Layer 3 is part of the engine surface the amendment targets); PR1 (single-endpoint proof — `/api/reason` is the M1 pilot; this amendment is the per-consumer Layer 3 template for this consumer). **NOT engaged:** AC4, AC5, AC7 (no R20a perimeter or auth surface touched); PR6 (no safety-critical surface touched at the documentation step); PR3 (synchronous discipline — N/A this session); PR4 (model selection — N/A this session).

## Part B — Procedure

### Step 1 — Read the seven gaps + ADR-007 carefully

Read each of the seven gaps from `D-M1-CP5-COMPARISON-RUBRIC-FIRST-PASS-2026-05-07` against the corresponding section of ADR-007. For each gap, identify which section(s) of ADR-007 the amendment touches. Likely touchpoints (to confirm by reading ADR-007):

- Gap 1 (closing-on-action): probably ADR-007's section on the prose template's closing-sentence rules.
- Gap 2 (voice as guidance not recap): probably ADR-007's section on the prose template's overall voice/structure.
- Gap 3 (consistent bracketed glossing): probably ADR-007's section on R8c application + Greek terminology rules.
- Gap 4 (careful false-judgement framing): probably a new sub-section needed under the prose-template section, since today's ADR-007 likely doesn't address this specific concern.
- Gap 5 (no filler disclaimers when fields are absent): probably ADR-007's section on conditional prose blocks / what-to-omit.
- Gap 6 (surface preferred-indifferent observations): possibly an ADR-005 amendment co-required, depending on whether Layer 1 already extracts preferred-indifferent data into the schema.
- Gap 7 (lighter assessment recap): probably ADR-007's section on the assessment-recap-vs-actionable-guidance proportions.

This step is 30–40 minutes of reading + cross-referencing. Output: a short note (in-chat or scratch) listing which ADR-007 sections each gap targets.

### Step 2 — Disposition gap 6 (Layer 1 vs Layer 3)

This is the most consequential investigation in the session. Gap 6 says sandwich missed observations bundled caught — specifically the preferred-indifferent observation in row 5b8bf957 ("compulsive checking is a search for relief from the discomfort of uncertainty, which is itself a preferred indifferent being treated as an evil"). Two possibilities:

**Possibility A — Layer 1 extraction is missing preferred-indifferent extraction.** ADR-005 §3 names the Layer 1 schema. Look for whether `preferred_indifferents_at_stake` (or equivalent) is extracted as a Layer 1 field. If not present → Layer 1 schema is missing this category → ADR-005 amendment co-required → M1-CP5c scope expands to include `layer1-extractor.ts` + the system-prompt update + a new harness assertion.

**Possibility B — Layer 1 already extracts; Layer 3 isn't surfacing it.** If `preferred_indifferents_at_stake` is in the Layer 1 schema and propagates into the Layer 2 assessment block, Layer 3 has the data — it just isn't rendering it into prose. Then ADR-007 amendment alone is sufficient: add a prose-template instruction to surface preferred-indifferent observations when present.

Resolution method: read ADR-005 §3 (or whichever section names the schema fields). Search the schema spec for "preferred_indifferent" or "indifferents." If present, possibility B; if absent, possibility A.

If possibility A: name the ADR-005 amendment as co-required in the ADR-007 amendment's text. M1-CP5c then handles both modules in the same session.
If possibility B: ADR-007 amendment is the single deliverable.

This step is 15–20 minutes.

### Step 3 — Draft the ADR-007 amendment

Per the in-place ADR amendment pattern (cache + the M1-CP4b precedent in ADR-004 §10), the amendment is appended to ADR-007 as a new section dated `2026-05-08` (or whatever today's date is at the time of M1-CP5b). The amendment's structure, recommended:

```
## Amendment — 2026-MM-DD — M1-CP5b: Layer 3 prose-template revisions per M1-CP5 prose-quality findings

**Adopted:** [founder approval at this session]
**Predecessor decision:** D-M1-CP5-COMPARISON-RUBRIC-FIRST-PASS-2026-05-07
**Engages rules:** R0, R8a, R8c, R7, AC8, PR1
**Risk class:** Standard (governance — documentation only; no production touch)

### Why this amendment

[Short paragraph naming the M1-CP5 prose-quality finding and the Revise election.]

### Revisions to the Layer 3 prompt template

#### Revision 1 — Closing sentence must be the action

[Prose specifying the rule. Names the failure mode (closing on disclaimer / factual recap) and the corrective rule (closing on a concrete practice, example, or specific Stoic move the practitioner can do). Ideally cites a few examples drawn from the bundled prose that illustrate the target shape.]

#### Revision 2 — Voice as guidance, not factual recap

[Prose specifying the rule. The prose's structure should weight actionable guidance more heavily than assessment recap. Cite the founder's reformatted version of row ae112723 as the target shape.]

#### Revision 3 — Consistent bracketed Greek-to-English glossing

[Prose specifying the rule per R8c. List the terms that require glossing on first use in the prose: praxis, katorthoma, lupe, ruling faculty, prohairesis, kathekon, eudaimonia, phronesis, dikaiosyne, andreia, sophrosyne, achos, agonia, philodoxia, epithumia, hedone, phobos, pothos, oknos, eupatheia, chara, boulesis, eulabeia, etc. Names the inclusive convention: Greek term followed by English translation in parentheses on first occurrence per response.]

#### Revision 4 — Careful false-judgement framing

[Prose specifying that the criterion-of-good-and-evil concept must be rendered without implying the practitioner's character is itself evil. Names target phrasings ("only virtue and vice carry that weight" without "your character in responding is the evil/good"). Cite the bundled handling on row ae112723 as the target.]

#### Revision 5 — No filler disclaimers when fields are absent

[Prose specifying conditional prose blocks: when `direction_of_travel` is absent (single-snapshot input), omit the "This is a single snapshot; no trajectory data is available" sentence rather than surfacing the absence as filler. Same conditional pattern for any other prose block whose underlying field is absent.]

#### Revision 6 — Surface preferred-indifferent observations

[Per Step 2's disposition: either (a) require a parallel ADR-005 amendment if Layer 1 schema doesn't extract preferred-indifferents, or (b) name the prose-template instruction to surface preferred-indifferent observations when present in the Layer 2 assessment block.]

#### Revision 7 — Lighter assessment recap, heavier actionable guidance

[Prose specifying the proportion shift. The assessment block is in the response payload as JSON; Layer 3 prose duplicating it in narrative form is filler. Target: assessment recap ≤ 25% of prose by sentence count; actionable guidance ≥ 60%. Cite the founder's reformatted row ae112723 as the proportion target.]

### Implementation scope (M1-CP5c)

[Bullets: which files at M1-CP5c, which harness fixtures need re-cache, what the parallel-run re-validation period looks like.]
```

This is the substantive output of M1-CP5b. AI drafts; founder reviews + approves with the "Adopted" / "Approve" / "Approve with edits" signal.

This step is 40–60 minutes.

### Step 4 — Founder review + approval

AI presents the amendment text in chat (or via a draft file at `/drafts/adr/2026-MM-DD-adr-007-amendment-m1-cp5b.md` if substantial). Founder reviews each Revision section. Founder approves verbatim, approves with edits, or rejects. AI executes per the founder's signal — typically the amendment is appended directly to `/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md` (per the in-place ADR amendment pattern from M1-CP4b precedent).

This step is 15–30 minutes (depends on edits).

### Step 5 — Append decision-log entry (lean form)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". ID: `D-M1-CP5b-ADR-007-AMENDMENT-2026-MM-DD`. Cross-references: `D-M1-CP5-COMPARISON-RUBRIC-FIRST-PASS-2026-05-07`, `D-M1-CP4f-PARALLEL-RUN-OBSERVATION-INFRA-2026-05-07`.

Entry MUST capture: the seven revisions adopted; the gap 6 disposition (possibility A or B); whether ADR-005 is co-amended; the M1-CP5c implementation scope; PR8 promotion candidate count update (this is the Nth observed in-place ADR amendment — name the count and whether the third-recurrence threshold is met for promotion).

### Step 6 — Session close (lean form) + draft M1-CP5c next-session prompt

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close". Names M1-CP5c as the next session.

The M1-CP5c next-session prompt scope: implement the seven revisions in `/website/src/lib/translation-sandwich/layer3-prose.ts` (system-prompt update + any new conditional logic for revision 5); regenerate F1–F4 + F5 harness Layer 3 prose caches against live Sonnet; run brief parallel-run re-validation (5–10 `/admin/test-reason` clicks against new prompt template); confirm tsc clean + harness 273/273 PASS in REPLAY. Estimated time: 2–3 hours. Risk class: Elevated (existing user-facing functionality changes — Layer 3 module is on the parallel-run path; user-facing path remains bundled-depth so the change is dormant until cutover, but the change touches a module that will become user-facing at M1-CP6).

If gap 6 disposition is possibility A (ADR-005 co-amendment), M1-CP5c scope expands to include `layer1-extractor.ts` + the Layer 1 system-prompt update + a new Layer 1 harness assertion. The Elevated risk class still holds (no perimeter change).

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + ADR-007 + ADR-004 §2.4/§10 + ADR-005 §3 read | 20–25 min |
| Step 1 — read seven gaps against ADR-007; map gaps to ADR-007 sections | 30–40 min |
| Step 2 — disposition gap 6 (Layer 1 vs Layer 3) by reading ADR-005 §3 | 15–20 min |
| Step 3 — draft ADR-007 amendment text | 40–60 min |
| Step 4 — founder review + approval | 15–30 min |
| Step 5 — decision-log entry (lean form) | 15–20 min |
| Step 6 — session close (lean form) + draft M1-CP5c next-session prompt | 20–30 min |
| **Total** | **~2.5–3.5 hours** |

This is at the upper end of "Standard-tier governance" — the amendment scope is non-trivial (seven revisions; gap 6 may co-amend ADR-005). Founder should plan for a 2.5–3 hour block; if cumulative fatigue sets in around step 4, can pause + resume Step 5–6 next session (decision-log + close are quick when the amendment is approved).

## Rollback path

This session is documentation-only; no `git revert` needed for the amendment itself if it's adopted. If the founder rejects the amendment at Step 4, the draft is set aside and M1-CP5b reschedules. If the amendment is adopted but later determined to be wrong (post-M1-CP5c finding), the amendment is itself amended in a follow-up ADR-007 amendment (same in-place pattern).

There is no production effect from this session in any path; the user-facing route remains on bundled-depth throughout.

## Forecast

If M1-CP5b lands clean: M1-CP5c follows (Elevated tier; 2–3 hours) implementing the seven revisions + harness re-cache + brief parallel-run re-validation. After M1-CP5c: return-to-M1-CP5 with refreshed comparison data; if the prose review now confirms user-facing readiness, advance to M1-CP6 cutover (Critical tier; with R10 announcement). Total path from here to cutover: M1-CP5b (~2.5–3.5hr) + M1-CP5c (~2–3hr) + return-to-M1-CP5 (~2hr) + M1-CP6 (~3–4hr; Critical) = ~10–13 hours of session time across 4 sub-sessions, plus the brief parallel-run re-validation period within M1-CP5c.

If M1-CP5b discovers gap 6 requires ADR-005 co-amendment, M1-CP5c scope expands and the path may add ~1 hour. Total stays within ~14 hours session time before cutover.

This is the design pivot session — the analytical work proven at M1-CP5 gets translated into a prose template that ships with it. Cutover-by-readiness rather than cutover-by-deadline.

End of prompt.
