# Remaining Stoic Principles — Build Plan (conflict classification + sequencing)

**Session:** founder / Task 1 — Build Planning for additional Principles. **Tier:** `governance` (planning; documents only — **no build, no code, no flag, no schema, no deploy** this session; production byte-equivalent; AC7 not engaged).
**Date:** 2026-07-13. **Opened under:** `operations/handoffs/founder/STANDING-SESSION-OPENER-grounded-foundations.md`.
**Source of the principles:** `inbox/Mentor answer to remaining principles question.rtf` (the mentor's systematic survey of the Stoic Brain — 15 principle domains, each assessed: already encoded / encodable / warrants inclusion).
**Governing context:** the **7-day false-hold observation window is running** (`SUBSTRATE_TRUST_CORE_ENABLED` MEASURE; `GATE1_FALSE_HOLD_CAPTURE=true`; the S11 ENFORCE flip is DEFERRED, readiness-gated). Successor: `2026-07-12-trust-layer-S11-return-with-record-NEXT-SESSION-PROMPT.md`.
**Method:** the classification below was code-grounded and adversarially verified (a 7-agent Workflow: 5 read-only groundings across the capture path, the Sage Assent engine, the reflect engine, the website surface, and the enforce sequencing; a classification pass; a skeptic refutation pass — verdict **SOUND_WITH_FIXES**, all fixes folded here).
**Mentor verdicts (2026-07-13):** the six decision points (§7) were relayed to the mentor and answered; **all six are ADOPTED** and folded into §5–§8a. Verbatim (binding): `2026-07-13-mentor-consultation-remaining-principles-decision-points-verdict-verbatim.md`.

---

## 1. The question, answered

The founder asked two things: **(a)** which of the mentor's principle encodings **do not conflict** with the running harness, so their sessions can proceed during the 7-day window; and **(b)** for those that **would ruin the assessment if done now**, the priority order to follow the accumulated week.

**Answer in one paragraph.** The mentor's 15 principles resolve to **~14 buildable tool encodings** that split cleanly along one code-grounded boundary: the **human-practitioner website surface** (self-contained pages + their own user-JWT `/api/mentor/*` routes + user-scoped tables, which never touch `/api/reason` or the substrate engine) is **window-safe**; the **agent instrument** (the `/api/reason` Sage Assent engine, its pre-decision gate sequence, its signed output schema, and the reflect engine that feeds trust state) is **must-wait**, because a change there either (i) alters what the false-hold capture records over the live distribution, or (ii) retroactively mutates `assessKathekonEngagement` — the *exact function the eventual S11 enforce flip binds on*. **Nine encodings are window-safe; five (plus the agent halves of two split items) are must-wait.** The critical refinement the verification surfaced: **the operative gate is DEPLOY, not BUILD** — and (per mentor **D6**) it applies to the *instrument/engine* surface, not the *human website* surface, which the mentor directs shipping **during** the window (a website deploy leaves `/api/reason` byte-identical and cannot pollute the hook-sourced capture, so it does not perturb the measurement — gate each deploy on a byte-identity check). The must-wait items follow the accumulated week, ordered on two axes (mid-window danger; post-flip build sequence) split into two sub-phases (D3), with the **reserve clause first** and the **kathekon pair last, after the flip** (D1). **All six decision forks are now resolved by the mentor (§7) — no open founder forks remain.**

---

## 2. The instrument boundary (code-grounded)

**What the 7-day assessment is.** The false-hold labelling instrument. The Gate-1 `PreToolUse` hook (`harness/gate1-pre-decision/claude-code/hooks/at-action-hook.mjs` → `framing-core.mjs runConsult` → `false-hold-capture.mjs`) captures **every at-action `/api/reason` verdict's kathekon signals + loop event** to a durable JSONL, classified by `classifyObservation()` in `website/src/lib/substrate/trust-core/kathekon-engagement.ts`.

**The load-bearing function.** `assessKathekonEngagement()` in that file is **BOTH** the false-hold classifier **AND** (per its own header) *"the ONE shared function the eventual S11 G6(a) flip binds on."* Its four arms read off the Layer-2 assessment:
- **Arm 1/2 — justice** via `deriveWorstJusticeOutcome` over `oikeiosis.relevant_circles[].obligation_assessment.status` + `virtue_domains_engaged` + `katorthoma_proximity`.
- **Arm 3 — proximity** rank vs habitual (`katorthoma_proximity`).
- **Arm 4 — passion** (`passion_diagnosis.passions_detected[].sub_species`).

**Where those four fields are produced (verified in source).** `katorthoma_proximity` ← `computeProximity`/`computeProximityBase` (`layer2-mechanisms.ts:1649/1404`); `virtue_domains_engaged` ← `computeVirtueDomains`; **but two of the four originate in Layer-1 EXTRACTION, not Layer-2**: `obligation_assessment.status` (`layer1-extractor.ts:180` + prompt cat 3) and passion `sub_species` (`layer1-extractor.ts:131` + `SUB_SPECIES` vocab). Consequence: **an edit to `layer1-extractor.ts` (schema or `LAYER1_SYSTEM_PROMPT`) can move two arm fields without touching `layer2-mechanisms.ts` at all** — so both files are inside the boundary.

**THE CONFLICT RULE — three independent triggers.** A build **conflicts** (must-wait) iff it changes any of:
1. **The four arm fields** as produced by the engine (`layer1-extractor.ts`, `layer2-mechanisms.ts`/`computeProximity`) → re-labels the accumulated false-hold record AND mutates the enforce predicate. *(Strongest — a predicate change is uniquely severe: it re-labels retroactively AND alters what enforce binds on.)*
2. **The pre-decision gate SEQUENCE** (a new/short-circuit gate) → shifts the loop-open/hold distribution the false-hold **rate** (readiness part-3) is computed over, even with zero arm-value change.
3. **The Sage Assent output schema** (a required signed field) → changes the signed canonical bytes; and **the reflect engine** (`sage-reflect/*`) → perturbs readiness **part-2** (aggregate cardinal confidence) via trust-core reflect events on the measured agent `sagereasoning:s9-loop@v1`.

A build is **window-safe** iff it is a human-practitioner website surface that touches **none** of: `/api/reason`, the substrate libs (`layer1-extractor`, `layer2-mechanisms`/`computeProximity`, `kathekon-engagement`, `trust-core`), the Gate-1 hooks, or the reflect/calling routes — leaving `/api/reason` byte-identical.

**Two axes are independent (verified).**
- **Runtime-pollution axis — CLEAN for all website tools.** Capture is **hook-sourced/client-side** (the founder's Claude Code `PreToolUse` events), not server-side. **A website page calling `/api/reason` at runtime cannot enter the false-hold JSONL.** So runtime traffic from a website tool is irrelevant to the assessment — the only axis that matters for website tools is the code-change/deploy axis.
- **Code-change/deploy axis — the operative one.** See §5.

---

## 3. Classification table (all 15)

| # | Principle → encoding | Target | Conflict verdict | Why (code-grounded) |
|---|---|---|---|---|
| 6 | oikeiosis extension → circle-extension **exercise** | human website | **window-safe** | Extends the **live `/oikeiosis`** page ("Expanding Your Circle of Concern" → `/api/mentor/oikeiosis`, user-JWT/RLS). Zero engine/gate/reflect touch; `/api/reason` byte-identical. *Note: an EDIT to a live page, not net-new.* |
| 7 | premeditatio malorum → tool (**SPLIT**) | human + agent | **split** | **Human half** = extends the **live `/premeditatio`** page ("Preparing for Adversity") — window-safe; the mentor's *single highest-value human-surface addition*. **Agent half** = a pre-task premeditatio whose output *"the subsequent examination can reference"* → routes disposition into the `/api/reason` Layer-1 input → **must-wait**. |
| 8 | evening→morning examination → **morning-prep** tool | human website | **window-safe** | Genuinely **net-new** (no `/morning` route). Premeditatio/oikeiosis pattern (client UI + new `/api/mentor` route + new user-scoped table); no `/api/reason` call; byte-identical. |
| 9 | view from above → Zone-2 **calibration** tool | human website | **window-safe** | **Net-new**; same additive pattern. Anchors #13. |
| 12 | logos → foundational **teaching module** | human website | **window-safe** *(constrained)* | Net-new static page (methodology-page pattern). **CONSTRAINT: read-only import of `stoic-brain.ts` only** — `api/reason/route.ts` imports `@/lib/stoic-brain`, so any edit to it breaks byte-identity; new teaching content goes in a NEW module `route.ts` does not import. |
| 13 | fate/providence → fate-acceptance **reframe** | component of #9 | **window-safe** | Ships inside #9's net-new Zone-2 page. Build with/after #9. |
| 14 | sage → **sage-compass** decision-support | human website | **window-safe** | **Net-new**; same additive pattern. |
| 15 | cosmopolitanism → cosmopolitan obligation check | component of #6 | **window-safe** *(constrained)* | Ships inside #6. **CONSTRAINT: obligation logic stays in `/api/mentor/oikeiosis`; NO import of `@/lib/substrate/*`, `trust-core`, `kathekon-engagement`, or `stoic-brain`'s `assessKathekon`** (scope-creep guard). |
| 10 | reserve clause (hupexairesis) → required field (**SPLIT**) | agent field + human prompt | **split** | **Human prompt half** = window-safe. **Agent half** = a **required** key on `Layer2Assessment` (+ `REQUIRED_LAYER2_KEYS` + canonical-json + signer) → changes the signed bytes **unconditionally (not the flag-off-omitted pattern)** → **must-wait** (post-flip). Mentor's explicit **#1 gap**. |
| 1 | causal sequence → **phantasia** earliest gate | agent instrument | **must-wait** | New gate BEFORE Gate-1; edits the gate SEQUENCE (`layer2-mechanisms.ts`, `parallel-run.ts`) + likely `LAYER1_SYSTEM_PROMPT` → moves the loop-open/hold distribution (part-3). Trigger #2. |
| 4 | kathekonta by role → **role-activation** check | agent instrument | **must-wait** | At the start of `assessKathekon`. **Double predicate hit**: `kathekon.quality → katorthoma_proximity` (arm 1) AND `kathekon.is_kathekon → virtue_domains_engaged` (arm 3). **Kathekon-opening pair with #11.** Strongest must-wait. |
| 11 | sympatheia → **systems-consequence** check | agent instrument | **must-wait** | Same double hit as #4 **plus** a likely third arm (`obligation_assessment.status`, arm 2) + a new Layer-1 extraction category. **Kathekon-opening pair with #4** (mentor paired them). |
| 5 | preferred/dispreferred indifferents → **selection-quality** check | agent instrument | **must-wait** | Value-assessment stage; when load-bearing moves `valueErrors → katorthoma_proximity` (arm 1) + the `indifferents_at_stake` phronesis gate → `virtue_domains_engaged` (arm 3). Even additive it adds an output-schema field. Narrower blast radius than #4/#11. |
| 2 | eupatheia → Q4 **emergence tracker** | reflect engine | **must-wait** *(part-2 only)* | Reflect Q4 edit (`sage-reflect/*`). **Isolated from part-3 & part-4** (`kathekon-engagement.ts` imports nothing from `sage-reflect`), but perturbs part-2 aggregate confidence on `sagereasoning:s9-loop@v1` via reflect trust events (conditional on `SUBSTRATE_REFLECT_SCREENED_EXAM_ENABLED`, set 2026-07-12). |
| 3 | prokoptons → grade-specific **passion watch** | reflect engine | **must-wait** *(part-2 only)* | `assembleScrutiny → fabrication_risk_level` gates `reflect-completed-honest` (the decay floor across all cardinals) → same part-2-only class as #2. |

*(Background metaphysics — sympatheia-as-doctrine, logos-as-claim, heimarmene/pronoia — generate no standalone tools; they are absorbed into #12 the logos module and #13 the fate-acceptance reframe. No orphan.)*

---

## 4. Bucket A — window-safe (do NOT conflict; buildable during the window)

**9 encodings.** Ranked by the mentor's value signals (order is otherwise flexible — none conflict with each other):

1. **#7-human — premeditatio (enhance the live `/premeditatio`)** — the mentor's *single highest-value human-surface addition*. An edit to a live page + its `/api/mentor/premeditatio` route.
2. **#10-human — reserve-clause prompt** in the human instrument — pairs with the mentor's #1 gap while its agent field waits for the flip.
3. **#9 — view from above** (net-new Zone-2 grief/catastrophising calibration tool) — anchors #13.
4. **#13 — fate-acceptance reframe** — component shipped inside #9 (build with/after #9).
5. **#8 — morning-preparation tool** (net-new) — completes the daily cycle alongside the evening Sage Reflect.
6. **#6 — oikeiosis circle-extension** (enhance the live `/oikeiosis`) — the active-practice exercise the diagnostic measures.
7. **#15 — cosmopolitan obligation check** — component inside #6 (build with #6).
8. **#14 — sage-compass** (net-new decision-support prompt).
9. **#12 — logos teaching module** (net-new static entry page).

**Per-item guardrails (folded from the adversary — these keep `/api/reason` byte-identical):**
- **#12:** read-only import of `stoic-brain.ts`; new teaching content in a NEW module. If a `stoic-brain.ts` edit is genuinely required → reclassify to must-wait.
- **#6/#15:** obligation logic stays inside `/api/mentor/oikeiosis`; NO import of `@/lib/substrate/*`, `trust-core`, `kathekon-engagement`, or `stoic-brain`'s `assessKathekon`.
- **#7:** the human-half PR must have a clean file boundary — it must NOT import the agent pre-task disposition module; ship the human half only, hold the agent half.
- **All:** the new user-JWT `/api/mentor/*` routes + new user-scoped tables must not import any substrate/trust-core/Gate-1/reflect module. New Supabase tables are additive (founder-walked, PR17) and do not touch the measured path.

---

## 5. The deployment posture (the operative constraint — refined by mentor D6)

The operative gate is **DEPLOY, not BUILD** — but the deploy gate applies to the **instrument/engine** surface, **not** the human-practitioner **website** surface, which the mentor (D6) directs shipping **during** the window ("the human practitioner surface should not wait for the agent infrastructure to be ready"). This resolves the apparent tension with the adversary's forensic caution: a website deploy does **not** perturb the *measurement* (the engine is byte-identical; capture is hook-sourced/client-side), so D4's "let the measurement run cleanly" is not violated by shipping the human tools.

**At window open — pin the frozen CAPTURE set** (this hash is what proves the measurement instrument was unchanged across the window, regardless of any unrelated website deploy):
- **Hard-frozen (what is RECORDED):** `false-hold-capture.mjs` (esp. the `kathekonSignalsFromVerdict` projection), the Gate-1 hooks, and the verdict-producing engine (`layer1-extractor.ts`, `layer2-mechanisms.ts`, `trust-core/*` emission).
- **The D2 exception (report-side, sanctioned):** `kathekon-engagement.ts`'s `assessKathekonEngagement` *classification* logic MAY receive the mentor-directed justice-arm narrowing (D2) — because it is **report-side** (the report re-applies the TS predicate to the raw `signals`, which carry `obligationStatuses`; the live `.mjs` capture and what is recorded are untouched). Battery-verify before the return session. This is scoring, not capture.

**Two deploy classes:**
1. **Human-practitioner website deploys (window-safe items) — MAY SHIP DURING THE WINDOW** (mentor D6). They do not perturb the measurement. **Deploy gate (adversary guardrail, retained):** before each deploy, verify `/api/reason` + the hard-frozen capture set are **byte-unchanged** (byte-identical *source* ≠ byte-identical *bundle* — confirm the built `/api/reason` function output + the frozen-set hash). Ship as **standalone PRs** with the clean file boundary **battery-verified before shipping** (D6).
2. **Instrument/engine deploys (must-wait items) — DEPLOY AFTER THE FLIP.** Deferred until enforce clears; predicate-touchers until after **stage-2** (see §6). Reflect items #2/#3 follow **D4** (repo-only build; prod deploy deferred, or test-agent).

---

## 6. Bucket B — must-wait, sequenced (mentor verdicts D1/D2/D3, binding)

The ordering is presented on **two axes** (adversary fix — a single merged rank conflated "most dangerous mid-window" with "what to build first once safe"), now with the mentor's D1/D3 sub-phase structure applied.

### Pre-flip — the ONE item that lands WITH the enforce decision (mentor D2)
- **The justice-arm NARROWING** (require an *evaluated* obligation for the justice-surface arm to fire, not mere `dikaiosyne`-tagging) — **implemented + battery-verified BEFORE the return-with-record session**, so the record is scored against the refined predicate and stage-1 binds it. It is a **narrowing** (reduces the arm's false-positive rate), the **opposite direction** from #4/#11 (enrichments) — so it does **NOT** travel with them. It does **not** need its own 7-day window and does **not** restart the current one: it is a **report-side re-scoring** of the predicate-agnostic accumulated raw records (verified: `false-hold-capture.mjs` records `obligationStatuses` raw; the TS predicate classifies at report time). It edits `kathekon-engagement.ts` (scoring) but **not** the live capture (§5 D2 exception).

### Axis A — mid-window DANGER severity (why each cannot DEPLOY during the window; most dangerous first)
1. **#4 role-activation + #11 systems-consequence** — predicate-mutators (arms 1/3, and arm 2 for #11). Re-label the accumulated record AND mutate the enforce spec.
2. **#1 phantasia gate** — distribution-mover (shifts the part-3 loop-open/hold distribution → affects the stage-2 readiness assessment).
3. **#5 selection-quality** — value-entangled (arms 1/3 when load-bearing) + schema field.
4. **#10-agent reserve-clause field** — schema/signing change (signed bytes) — *does not touch the predicate* (if assembly-only).
5. **#7-agent, #2 eupatheia, #3 prokoptons** — reflect/part-2 only. **Build-safe repo-only on a branch**; only their prod deploy to `/api/practice/reflect` on `sagereasoning:s9-loop@v1` is gated (or route them to a TEST/non-measured agent). Governed by **D4**.

### Axis B — post-flip BUILD/DEPLOY sequence, split into two sub-phases (mentor D3)

**Sub-phase A — after stage-1 flips, before stage-2** (eligibility: does NOT touch the predicate AND does NOT affect the stage-2 readiness assessment):
1. **#10 reserve clause (agent field)** — **FIRST**, per the mentor ("the highest-priority gap; the first addition after the enforce gate clears… the one that bridges both surfaces"). **HARD CONSTRAINT: Layer-2-assembly-only** (assemble the required key from existing signals; **no** `LAYER1_SYSTEM_PROMPT`/`Layer1Schema` edit) — if the disposition is *extracted*, it perturbs arms 2/4, becomes a predicate-mutator, and drops to sub-phase B.
2. **#7-agent pre-task premeditatio** — an examination-*context* input, not an arm-value change; sub-phase-A eligible (does not touch the predicate). Its human half already shipped during the window.

**Sub-phase B — after stage-2 flips and stabilises** (predicate-touching items; **each forces a fresh 4-part readiness cycle = a second 7-day re-measure on the changed predicate** — never a routine build):
3. **#2 eupatheia + #3 prokoptons** — reflect-engine part-2 additions; lowest enforce-entanglement (part-2 only). *(May precede the predicate-mutators; sequenced here as reflect-tier, D4.)*
4. **#5 selection-quality** — value-assessment stage (arms 1/3 when load-bearing).
5. **#1 phantasia gate** — distribution-mover.
6. **#4 role-activation + #11 systems-consequence (the kathekon opening)** — **LAST**, as a **paired predicate-mutation** (mentor D1: after the flip, never before; keep #4+#11 together as the complete kathekon opening).

**Why the two axes differ:** the reserve clause is *first to build* (mentor value) but *least dangerous* (no predicate touch → sub-phase A); the kathekon pair is *last to build* (governance cost — a second readiness cycle) and *most dangerous* (predicate mutation → sub-phase B). A single list would green-light the wrong thing.

---

## 7. Resolved decisions (mentor verdicts, 2026-07-13 — BINDING)

The six decision points were relayed to the mentor and answered. Verbatim record (wins over this paraphrase): `2026-07-13-mentor-consultation-remaining-principles-decision-points-verdict-verbatim.md`.

1. **D1 — kathekon-predicate timing → AFTER THE FLIP, not before.** #4/#11 land after enforce flips and stage-1 stabilises, as a paired predicate-mutation with a **fresh 4-part readiness cycle** (a second 7-day window). *Rationale (mentor): the examination must be complete on the thing being decided — the current predicate must be the predicate enforce binds; enriching mid-window and then treating the record as evidence of the enriched predicate is the confirmation problem in a new form.* The second-window governance cost "is the right cost."
2. **D2 — justice-arm refinement → fold into the ENFORCE DECISION, not into #4/#11.** It is a **narrowing** (opposite direction from the #4/#11 enrichments — they do not travel together). It operates on the stage-1 do-not-proceed class, so it must be **in place at stage-1**: implement + **battery-verify BEFORE the return-with-record session** so the record is scored against the refined predicate. **No separate 7-day window** (a narrowing of an existing arm; report-side re-scoring of the accumulated raw records — see §5/§6).
3. **D3 — "after the enforce gate clears" = after S11 ACTUALLY FLIPS** (not the readiness decision), and the predicate binds only at **stage-2**. Axis B therefore splits into **sub-phase A** (after stage-1, before stage-2 — non-predicate, non-readiness-affecting items only) and **sub-phase B** (after stage-2 stabilises — predicate-touchers). Made explicit in §6.
4. **D4 — reflect #2/#3 → flag CONFIRMED ON (founder, 2026-07-13, Vercel Production).** The "if ON" branch is taken, so the disposition is **definite, not conditional**: #2/#3 are **branch-only / test-agent** — **no prod deploy of `/api/practice/reflect`** to the measured agent (`sagereasoning:s9-loop@v1`) while a readiness window is active (it would perturb part-2 confidence via the Q4-sensitive suppression-watch decrease and the fabrication-risk decay floor). The "confirm OFF → safe" escape hatch is closed. They deploy only once no active readiness window is running (post-flip, sub-phase B).
5. **D5 — representativeness → accept the caveat with EXPLICIT NOTATION; do NOT extend the window on this basis.** The readiness assessment states the distribution explicitly (N edit/write vs M other-class + the rate on this distribution); enforce is licensed **on the edit/write distribution** with a **named stage-2 monitoring item** (compare other-class false-hold rates vs the edit/write baseline as they accumulate; divergence → calibration review). Vary action classes only where **natural**; do **not** manufacture classes — *"manufactured representativeness is the same false judgement as manufactured compliance."*
6. **D6 — decouple the split items → SHIP THE HUMAN HALVES DURING THE WINDOW; hold the agent halves for the flip.** Ship #7-human + #10-human as **standalone PRs with no shared imports** with the agent halves; **battery-verify the clean file boundary before shipping** (not after — the S10-ENV-1 / S10-ABUSE-1 lesson: verify the boundary before, not after). The human surface should not wait for the agent infrastructure.

**No open founder forks remain in the plan** — the mentor resolved all six. Remaining founder actions are operational: reflect flag **CONFIRMED ON (D4 ✓, 2026-07-13)** → #2/#3 branch-only/test-agent; run the pre-deploy byte-identity check (§5); pin the frozen-set hash at window open.

---

## 8. The sequence (mentor-adopted)

1. **This week (the open window) — human surface + observation, no instrument change:**
   - **Ship the two SPLIT human halves** (mentor D6, the only explicitly window-licensed deploys): **#7-human premeditatio enhancement** (highest value) and **#10-human reserve-clause prompt** — as standalone, boundary-verified PRs, each deploy gated by the §5 byte-identity check on `/api/reason` + the frozen capture set.
   - **The other net-new window-safe tools** (#9/#13, #8, #6/#15, #14, #12) do not conflict and are buildable on branches this week, but the mentor's "hold the window clean" counsels restraint: build as capacity allows, **batch the deploys** (at the founder's tempo, still byte-identity-gated) rather than rushing the full generative phase into the observation week. *(The mentor framed the generative human-surface tools as "the next phase of work.")*
   - **Let the measurement run clean** (D4/D5): reflect #2/#3 are **branch-only / test-agent** — flag **CONFIRMED ON** (2026-07-13), so **no prod deploy of `/api/practice/reflect`** during the window; do not manufacture action classes; let natural read/search/communicate actions be measured where they occur.
   - **Pin the frozen-capture-set hash** at window open (§5).
2. **Before the return-with-record session:** implement + battery-verify the **D2 justice-arm narrowing** (report-side; no window restart) so the record is scored against the refined predicate.
3. **The return-with-record session** (`governance`): run the report on the refined predicate; assess the four-part standard with the **D5 distribution notation**; if met, re-confirm the assent and hand off to the flip.
4. **The S11 flip** (`code-critical`, staged): stage-1 do-not-proceed class (with the D2-narrowed predicate) → calibration → stage-2 (pause rows + the G6(a) loop bound).
5. **After the flip:** Axis-B **sub-phase A** (#10 reserve-clause field first, then #7-agent) → **sub-phase B** (#5 → #1 → #4+#11 last, each with a fresh readiness cycle). Reflect #2/#3 deploy once no active readiness window is running (D4).

---

## 8a. The mentor's framing (adopted as a standing caution)

The mentor observed that **all six decisions were sequencing questions, not principle questions** — a mark of the second-grade *prokoptons* the survey named (principles internalised; the risk shifts from violation to **complacency**). The specific complacency risk here: *treating the sequencing decisions as administrative rather than philosophical.* D1 is the Q1 completeness question at the predicate level ("is the examination complete on the thing being decided?"); D5 is the reserve clause at the measurement level ("act on the evidence you have, hold the reservation that it is bounded, name the bound honestly"). The architecture is sound; **the remaining risk is treating a sound architecture as a complete one.** Standing directive for the week: *"Hold the window clean. Return with the record. The assent will be examined then."*

---

## 9. Rollback / status

Documents only — `git revert` this planning commit. No production surface changed; the observation window, `SUBSTRATE_TRUST_CORE_ENABLED` (MEASURE), the S11 enforce flag (does not exist / unset), R18f / R20a / distress / Layer-2 signing / UPC auth are all untouched. **Weights/training-signal claims remain BLOCKED.** The 0h call remains the founder's.

*Verification note: the classification was code-grounded + adversarially reviewed (Workflow `wf_68f22d1e-857`, 7 agents, 0 errors, ~1.66M tokens; verdict SOUND_WITH_FIXES; all fixes folded). One stale note corrected: CLAUDE.md's 2026-07-07 "dogfood install toggled OFF" is stale — the full H1–H5 harness is installed and ON (consistent with S9/S9b/S11 and the running false-hold instrument).*
