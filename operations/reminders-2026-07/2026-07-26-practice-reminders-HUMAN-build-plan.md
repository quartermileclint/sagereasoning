# Practice Reminders — Human Practitioner Build Plan

**Stream:** founder (website build).
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Authored:** 2026-07-26, from the mentor consultation `inbox/mentor discussion about reminders for humans and agents.rtf` (verbatim source — commit with this plan) analysed against the verified current state.
**Status:** Authored; the four scope elections below were made by the founder 2026-07-26 (AskUserQuestion). Build sessions commence on the founder's go. **Step M (mentor consultation, §10) gates the *content* of Phases 2–3 going live; Phases 0–1 carry only mentor-verbatim content and are not gated on it.** **UPDATED 2026-07-27: all five phases (0/1/2/3/4) are now BUILT + VERIFIED — this plan is COMPLETE.** Live on the founder's push. What remains: the companion agent plan (its own, separately-elected next step per E4), the R17 `milestones` data-rights gap (the arc's oldest carried item, Critical), and independent-review re-runs for Phases 0 and 1 (spend-limit casualties; Phase 3's own review ran independently from the outset). **UPDATED 2026-08-01: all three closed since — the agent plan fully executed + activated 2026-07-28 (`D-PRACTICE-REMINDERS-AGENT-A3-DOCS-AND-ACTIVATION-LIVE`); the Phase 0/1 independent re-runs discharged 2026-07-29 (Phase 1 clean; Phase 0 one HIGH + two MEDIUM folded — `D-INDEPENDENT-REVIEW-RERUNS-AE1-S11B-PHASE0-PHASE1-FOLDED-2026-07-29`); the R17 `milestones` coverage closed 2026-07-30 (`D-B5-SESSION-DECLINE-SIGNAL-BUILT-ACTIVATED-LIVE-2026-07-30`, commit `f5df0fb` — run as `code-elevated`, a tier the earlier Critical classification here was not explicitly reconciled with; named for founder ratification). Nothing in this plan remains open.**
**Companion:** `2026-07-26-practice-reminders-AGENT-build-plan.md` (same source counsel; sequenced after this plan ships, per election E4).

---

## §1 The source counsel — five binding design constraints

From the mentor discussion (three questions + follow-up). These govern every phase; quoted lines are verbatim.

1. **The boundary.** Reminders serve the *distraction* failure mode only — they remove "the friction of remembering to begin." They never serve the *false-judgement* failure mode (the belief that the practice does not apply to what one is carrying) — "that is not a discovery an alarm can deliver." Operationally: "reminders that prompt the practitioner to begin are appropriate scaffolding. Reminders that tell the practitioner what to think, how to feel, or what conclusion to reach are doing the work instead of them." *"The alarm is a doorbell, not a door."*
2. **The precedent.** The school model (Epictetus's school at Nicopolis; Seneca's letters to Lucilius; the *De Ira* evening examination as a **daily** rhythm) makes regular prompting "legitimate scaffolding with ancient precedent" — a partial substitute for the philosophical community "in a context where the community is distributed and asynchronous."
3. **Three trigger points** (the follow-up's design): **in-session** — "the suggestion emerges from the diagnosis, not from a schedule"; **stage-crossing** — "the stage crossing is the natural moment to name the next tool, because the practitioner's condition has created the readiness for it"; **sequence** — "the default path before enough practitioner context exists to personalise it."
4. **The beginner sequence.** Dichotomy of control first ("not a named tool on your list but it is the prerequisite for all of them") → **morning preparation → passion log → view from above + oikeiosis → premeditatio → hupexairesis → sage compass**. "A beginner handed all eight tools simultaneously will either pick one arbitrarily or be paralysed by the choice. The sequence removes that friction without removing the work."
5. **The language rule.** "The trigger is not *you have reached Stage 3* — it is *something has shifted in how you are meeting difficulty, and there is a practice that meets you where you now are*. The difference in language is the difference between a grade and a mirror." And for in-session suggestions: "the tool says *this is what I found in your reasoning, and this practice is suited to examining it further* — and then stops."

**Stage ↔ tools mapping (mentor verbatim):** The Storm → morning preparation + passion log · The Crossroads → view from above + oikeiosis · The Worn Path → premeditatio + hupexairesis · The Clear Summit → sage compass · The Inner Fire → "no longer needs the scaffolding in the same way."

**A nuance recorded, not smoothed over — NOW A SETTLED VERDICT (Step M, 2026-07-27):** the introduction *sequence* and the *stage mapping* do not linearize identically — premeditatio + hupexairesis sit 4th/5th in the sequence but belong to The Worn Path (habitual), 2nd on the proximity ladder. The reading encoded in this plan — **the stages are conditions, not a corridor** — is **confirmed as binding**: "the two orderings were answering different questions and were never intended to agree… The fact that they produce different orderings is not a contradiction — it is evidence that they are doing different work." The difficulty inversion "dissolves when you read the stages as conditions rather than rungs" — the practices suited to The Worn Path are more demanding *because the condition calls for them*, not because the system erred. The mapping stands exactly as given (verbatim record: `2026-07-27-step-M-mentor-verdicts-verbatim.md`).

## §2 Verified ground findings this plan builds on (2026-07-26)

1. **The milestone system is built but never fires.** `POST /api/milestones` (the only award path, `website/src/app/api/milestones/route.ts:37`) has **no caller anywhere in the app** — verified by repo grep; the only fetch is `MilestonesDisplay.tsx:23`, a GET. None of the 24 milestones, including the five new `stage_*` ones (`milestones.ts:79-123`, exact-level single-evaluation triggers at `:344-355`), is ever awarded. Additionally the route never populates the journal check-data fields (`route.ts:86-93`), so the journal milestones are unreachable even once POST is wired, and `daysSinceLastAction` measures the gap between the two most recent evaluations, not days-since-now (`route.ts:78-84`).
2. **Stage pages link to no tools** (`stages/[slug]/page.tsx` — static from `STAGE_DISPLAY`, one inbound link from `MilestonesDisplay.tsx:137`).
3. **`/welcome` is explicitly non-ordered** ("There is no single right order…", `welcome/page.tsx:138-141`) — now superseded for beginners by constraint 4. Its "Start with why" card already sends new users to `/logos` first, and `/logos` explicitly derives the dichotomy of control (`logos-teaching.ts:200`) — **the sequence's step 0 already exists**. `/passion-log` is absent from `MORE_TO_EXPLORE`.
4. **The dashboard has no "what to do next" element** and never mentions the seven practice tools; `MilestonesDisplay` renders only when `evaluations.length > 0` (`dashboard/page.tsx:358`), so a brand-new user sees none of it.
5. **No reminder infrastructure exists**: no email code (Resend decided-not-provisioned), no push, no preferences store, no settings UI. Nearest precedents: two page-local cadence banners — premeditatio's Monday prompt (`premeditatio/page.tsx:259,326-346`) and oikeiosis's quarterly prompt (`oikeiosis/page.tsx:233-242,759-778`).
6. **All raw signals exist; nothing reads them cross-tool.** Every practice table is `(user_id, created_at DESC)`-indexed; every gated tool stores a deterministic classification (`preparation_quality`, `calibration_quality`, `expression_quality`, `is_generic`, `separates_action_from_outcome`, passion `llm_classified_type`, `philodoxia_flagged`). The only cross-table route is `/api/practice-calendar` (3 tables). No streaks are computed anywhere.

## §3 Founder elections (2026-07-26)

- **E1 — Channels: in-product only.** No `.ics` export, no email phase, no push in this plan (recorded as out-of-scope future options, §12).
- **E2 — `/welcome`: ordered path + freedom note.** The mentor sequence becomes the default path; "no single right order" softens to "if you are not sure, begin here."
- **E3 — Mentor vetting: yes, one consultation (Step M)** covering the human mapping table, the agent mapping table (companion plan), the §1 stage/sequence non-linearity reading, and the returning-practitioner copy — before Phase 2/3 content goes live.
- **E4 — Agent plan: authored now, built after this plan ships** (companion file).

## §4 The design at a glance

| Mentor trigger | Phase | Surface |
|---|---|---|
| (prerequisite) | **Phase 0** | Milestone awarding actually wired — the stage-crossing trigger's substrate |
| Sequence (default path) | **Phase 1** | `/welcome` ordered path + a dashboard "Your practice" module for all users incl. brand-new |
| In-session (diagnosis → suggestion) | **Phase 2** | Additive `suggested_practice` on each tool's save response, from a locked mapping table |
| Stage-crossing (readiness → introduction) | **Phase 3** | Milestone-earn moment surfaces the stage's practices; Stage pages gain their tools |
| The daily rhythm (the "alarm", in-product) | **Phase 4** | Dashboard morning/evening rhythm strip; the two existing cadence banners generalized; gentle return line |

Each phase is independently shippable; stopping at any phase boundary is a legitimate outcome.

## §5 Phase 0 — Wire milestone awarding (prerequisite + latent-defect fix)

> **STATUS: BUILT + VERIFIED 2026-07-26** (`D-PRACTICE-REMINDERS-HUMAN-PHASE0-MILESTONE-WIRING-BUILT`;
> close: `operations/handoffs/founder/2026-07-26-practice-reminders-human-phase0-milestone-wiring-CLOSE.md`).
> Live on the founder's push — no flag, no schema. Three corrections to this section, recorded rather than absorbed:
> 1. **A SECOND defect was found.** Awarding never ran *and* the read path never authenticated —
>    `MilestonesDisplay` used a bare `fetch` while the route accepts `Authorization: Bearer` only, so the GET
>    401'd unconditionally. Either alone yields an all-grey grid, and the broken state was indistinguishable
>    from an honest new-user state. Both are fixed.
> 2. **Item 3 was NOT implemented as written.** `daysSinceLastAction` is the **maximum gap between consecutive
>    evaluations**, not "days since the most recent evaluation as of now". Days-since-now would award
>    `returning_practitioner` ("Returned after 7+ days away **and evaluated an action**") to someone who has not
>    returned, and would fire for every lapsed user on the new catch-up call. Max-gap honours both clauses and is
>    what makes the retroactive catch-up work. Also: the milestone this section calls `practice_return` does not
>    exist — the ids are `returning_practitioner` and `journal_return`.
> 3. **§2.1's "24 milestones" is wrong — there are 25** (20 pre-existing + the five brand-build `stage_*`).
>
> Two findings surfaced and deferred, both recorded in the decision-log entry: an unresolved
> `action_evaluations_v3` `action` / `action_description` column drift that may mean human score saves have been
> failing silently (determinative for whether evaluation-driven milestones can fire at all); and the fact that
> Phase 0 activates a latent R17 gap — the `milestones` table is in none of the data-rights export/delete paths,
> which is Critical under 0d-ii and needs its own founder-walked step.

**Problem (Diagnostic-certain, verified §2.1):** awarding never runs. **Build:**
1. Call `POST /api/milestones` (fire-and-forget, idempotent — the route upserts on conflict `user_id,milestone_id`) from: (a) the score flow after a successful `action_evaluations_v3` insert (`score/page.tsx:165` area); (b) dashboard load (catch-up for existing history — awards retroactively from stored data, which is honest: the record already supports them).
2. Populate the journal fields in the route's check-data (`journalEntriesCompleted`, `journalPhase1Complete`, `daysSinceLastJournalEntry` from `journal_entries`) so the five journal milestones + `journal_return` become reachable.
3. Fix `daysSinceLastAction` to mean days since the most recent evaluation as of now (the `practice_return` milestone's honest semantics).
4. Return the **newly-earned list** in the POST response (Phase 3 consumes it).

**Not in scope:** no new milestones; no definition changes; no schema change (the `milestones` table exists).
**Tier:** `code-elevated` (existing route + existing user-facing pages). **Verify:** unit tests on check-data assembly incl. journal fields; a dashboard-load award observed against real dev data; `npm run build` + `tsc` green.

## §6 Phase 1 — Sequence trigger

> **STATUS: BUILT + VERIFIED 2026-07-27** (`D-PRACTICE-REMINDERS-HUMAN-PHASE1-SEQUENCE-TRIGGER-BUILT`;
> close: `operations/handoffs/founder/2026-07-27-practice-reminders-human-phase1-sequence-trigger-CLOSE.md`).
> Live on the founder's push — no flag, no schema. Corrections to this section, recorded rather than absorbed:
> 1. **This section's import guidance was unsafe, and the session prompt's version of it was factually wrong.**
>    §6 says the new lib "imports at most the proximity-level *type* via the `brand-display.ts` precedent". That
>    would put `stoic-brain` at hop TWO from `/welcome`, past the logos guard's one-hop reach. The prompt claimed
>    such a chain "fails the guard"; **mutation-verified, it does not** — 249 passed, 0 failed. The lib is
>    therefore **zero-import**, and the proximity-level union is declared locally (the `/sage-compass` precedent).
>    What binds is §11, not the guard.
> 2. **`/logos` cannot be a tracked step.** It is a reading with no row anywhere, so it is carried as step 0 with
>    `tracked: false` and is skipped by `next_in_sequence` — otherwise "next" would pin to the prerequisite forever.
> 3. **`/oikeiosis` needs TWO source tables** (`oikeiosis_reflections` + `circle_extension_entries`) — the quarterly
>    diagnostic and the circle-extension practice are separate routes writing separate tables, and either is a
>    genuine use of that page.
> 4. **The route reads 10 tables, not 9** — the 8 practice sources plus the two daily-rhythm tables.
>
> Two findings surfaced and named as follow-ups: the new route was initially sharing `/api/reason`'s IP-keyed
> rate-limit bucket (fixed here; `/api/milestones` and `/api/baseline` still do, pre-existing); and no behavioural
> test exists for the component or the route handler.


**New lib `website/src/lib/practice-sequence.ts`** (pure, human-side; imports at most the proximity-level *type* via the `brand-display.ts` precedent — **never** an edit to `stoic-brain.ts`, which is byte-identity-guarded):
- `PRACTICE_SEQUENCE` — the canonical ordered steps: step 0 `/logos` (the prerequisite orientation; already fronted by `/welcome`'s "Start with why"), then `/morning` → `/passion-log` → `/view-from-above` + `/oikeiosis` (paired) → `/premeditatio` → `/hupexairesis` → `/sage-compass`. Each step: `{id, name, href, doorbell}` where `doorbell` is a one-line pre-authored prompt-to-begin (constraint 1 language).
- `STAGE_PRACTICES` — the §1 stage↔tools mapping keyed by proximity level, with The Inner Fire mapping to *no* tools plus the mentor's "no longer needs the scaffolding in the same way" line.

**New route `GET /api/mentor/practice-status`** (user JWT, same auth pattern as the tool routes): returns per-tool `{last_used_at, count}` (one indexed `LIMIT 1` read per practice table + journal + evaluations) and `next_in_sequence` (first sequence step with no rows). No substrate imports; ships with its own `__tests__/human-practitioner-boundary.test.ts` per the family pattern.

**Dashboard "Your practice" module:** renders for **every** signed-in user — including zero-evaluation users (placed above the current `evaluations.length > 0` gate). Shows the sequence with used/unused state and names the next practice with its doorbell line. For a brand-new user this reads: begin with *why* (`/logos`), take your baseline, then morning preparation. No percentages, no completion framing, no streaks (§11).

**`/welcome` (per E2):** "Where to start" becomes the ordered default path — Start with why (`/logos`, unchanged, first) → baseline → the daily mirror (score an action as one arises; the journal in the evening) → the practice tools introduced in sequence — with the freedom note softened to: the order is a default, not a rule; nothing is locked. `/passion-log` added; `/glossary` and the Stage pages referenced where natural.

**Tier:** `code-elevated`. **Verify:** boundary suite for the new route; existing six boundary suites re-run; build/tsc; browser walkthrough as a signed-out→new→returning user.

## §7 Phase 2 — In-session trigger

> **STATUS: BUILT + VERIFIED 2026-07-27** (`D-PRACTICE-REMINDERS-HUMAN-PHASE2-IN-SESSION-TRIGGER-BUILT`;
> close: `operations/handoffs/founder/2026-07-27-practice-reminders-human-phase2-in-session-suggestions-CLOSE.md`).
> Live on the founder's push — no flag, no schema. Every vetted row below is implemented, every
> silence row as an explicit honest-null entry, all copy verbatim-pinned (unit 602/0; 19/19
> mutations killed across two rounds). Build decisions inside the verdicts' bounds, recorded in
> the decision-log entry: the aischyne target is the log-revisited-with-mirror-framing option
> (rendered link-free on the log itself); the row-5 window is ORDINAL — three consecutive
> not-caught (no date arithmetic); row 13 attaches at the score RESULT render, client-side (no
> server save route exists); the engine-driven passion resolution rides the passion-classify
> response (the only moment the engine's reading exists — an entry saved without a description is
> never classified, so only the pattern row can answer it, disclosed as a bound of 6b's "the
> engine's reading governs"); `/logos` gained the four per-virtue anchors row 11 requires. The
> morning route and the oikeiosis-extension route are deliberately untouched (silence-only), and
> both silences are boundary-suite-pinned.
>
> **Two review passes, one build.** Pass 1 (first-hand, forced by an account spend-limit outage
> on the 4-agent Workflow) found + folded one defect. **Pass 2 — the founder switched the session
> model to Sonnet 5 specifically to obtain a genuinely independent check — completed fully (11
> agents, 0 errors) and found 6 MORE, all confirmed, 0 refuted**
> (`D-PRACTICE-REMINDERS-HUMAN-PHASE2-INDEPENDENT-REVIEW-FOLDED`): a stale-suggestion state bug on
> five of the six wired pages (the suggestion card survived Cancel/new-entry/revise-a-different-
> entry, mis-attributed to an entry no longer on screen — `passion-log`'s own reset already handled
> this, the other five did not); a test-coverage asymmetry (5 of 6 DB-writing routes lacked
> passion-log's strong never-persisted regression pin); and the already-disclosed score-page
> wiring gap, actually closed with a new test. All seven fixed and regression-locked; 6 new
> mutations killed. The third corroborating instance of the standing lesson that an independent
> review catches a same-session self-review's blind spots.
>
> *(The block below is the pre-build vetting record, retained for the arc's history.)*
>
> **CONTENT VETTED 2026-07-27 — Step M answered; the table below is the MENTOR-VETTED
> mapping, superseding the draft** (`D-PRACTICE-REMINDERS-STEP-M-MENTOR-VERDICTS-ADOPTED-2026-07-27`;
> verbatim record, which wins over this table on any divergence:
> `operations/reminders-2026-07/2026-07-27-step-M-mentor-verdicts-verbatim.md`). Phase 2 is now
> **unblocked**. What the vetting changed, recorded rather than absorbed:
> 1. **The phobos generalisation was an overreach and is replaced by a differentiated per-sub-species
>    mapping** (agonia + oknos → premeditatio; deima + thorybos → morning preparation; thambos →
>    silence; aischyne → a different target entirely). Sub-species-level classification is confirmed
>    available on BOTH sides (`passion_type` and `llm_classified_type` both carry the sub-species
>    vocabulary — verified 2026-07-27), so the differentiated branch, not the root-level fallback,
>    is the operative one.
> 2. **The lupe family splits**: penthos/achos/eleos → view from above; phthonos/zelotypia
>    (comparison-borne) → oikeiosis.
> 3. **The hedone row is DECLINED** — honest silence, not morning preparation.
> 4. **The hupexairesis row is REVISED** — morning preparation, not view-from-above (a control-filter
>    failure, not a proportion failure; the single stored boolean cannot distinguish the two).
> 5. **Density verdict**: the in-session trigger fires on every qualifying entry ("a response to a
>    diagnosis, not a schedule"); repetition thresholds belong to the stage-crossing trigger. The
>    one-suggestion limit and the silence rows are what carry the density protection.
> 6. **6b verdict — whose passion reading governs: the ENGINE's, with disclosure on disagreement.**
>    Where practitioner and engine disagree AND the engine's reading fires a suggestion, the line
>    takes the disclosure form: *"You named this as ⟨practitioner's reading⟩. The engine read it as
>    ⟨engine's reading⟩. ⟨Practice⟩ is suited to examining the difference."* Agreement → standard
>    form; disagreement where the engine's reading fires nothing → silence; the disagreement itself
>    is never a trigger. (`classification_match` is already stored, so this is implementable as-is.)

**Mechanism:** each gated tool's POST/PATCH response gains an additive, optional **`suggested_practice`** field `{practice_id, href, line, basis}` — computed **deterministically** from the entry's own stored classification via one locked mapping table in `practice-sequence.ts`; rendered on the tool page beneath the existing quality-gate block. `line` strings come from a **fixed pre-authored set** (never composed, never LLM-authored) of the shape: *"This entry showed ⟨basis⟩. ⟨Practice⟩ is suited to examining it further."* — and then stop (constraint 5). Field absent when no row fires — an honest null, not a filler suggestion. At most **one** suggestion per response — both design choices (one-suggestion-max; honest silence over filler) are **mentor-confirmed**: "a menu converts the suggestion into a choice exercise", and "the silence is itself information".

**VETTED mapping table (Step M, 2026-07-27 — binding; the verbatim record wins on any divergence):**

| Tool | Stored signal | Vetted suggestion | Verdict |
|---|---|---|---|
| passion-log | **agonia** | premeditatio | **Anchor A1, confirmed** ("both are future-facing") |
| passion-log | **oknos** | premeditatio | Confirmed extension ("already imagining a future evil and shrinking from it") |
| passion-log | **deima**, **thorybos** (acute, present-tense) | morning preparation | Mentor-directed — premeditatio "requires some distance from the impression"; morning prep is the closest available proxy for the control filter |
| passion-log | **thambos** | *(none — honest silence)* | Mentor-directed ("silence is preferable to a weak suggestion") |
| passion-log | **aischyne** | the passion log revisited with the mirror-principle framing, *or* morning preparation as an orientation reset | Mentor-directed — shame is evaluative, not anticipatory; premeditatio declined. Which of the two named targets (and how a same-tool revisit renders) is a Phase 2 build decision inside the verdict's bounds |
| passion-log | **penthos**, **achos**, **eleos** (lupe) | view from above | Confirmed (narrowed-frame distress) |
| passion-log | **phthonos**, **zelotypia** (lupe, comparison-borne) | oikeiosis | Mentor-directed split ("treating their good as a threat") |
| passion-log | any **epithumia** sub-species | hupexairesis | Confirmed ("the mapping is principled") |
| passion-log | **hedone** family | *(none — honest silence)* | **DECLINED** — the stronger candidate is re-examination in the log itself; "if no practice fits cleanly, silence is preferable" |
| passion-log | repeated `caught_before_assent = false` | morning preparation | Confirmed — **fires on a pattern only, never a single instance** ("a single failure … is normal") |
| view-from-above | `minimised` | passion-log | Confirmed (minimisation is a failure of accurate impression-reading) |
| view-from-above | `unchanged` | *(none — honest silence)* | Confirmed; repeated-unchanged is stage-crossing data, not in-session |
| premeditatio | `is_generic = true` | passion-log | Confirmed (the log asks for the specificity the generic entry lacked) |
| oikeiosis (quarterly) | `philodoxia_warning` fired | passion-log | Confirmed (examine the contamination specifically) |
| hupexairesis | `separates_action_from_outcome = false` | **morning preparation** | **REVISED** from view-from-above — a control-filter failure; morning prep "builds the orientation that makes the action/outcome separation natural" |
| sage-compass | `expression_quality = vague` | `/logos` re-grounding, **linked to the named virtue's section** | Confirmed + design note — link the virtue's anchor, not the whole page (`/logos` has per-section `id=`s; verified 2026-07-27) |
| sage-compass | `distance_reading = far` + `virtue_engaged` | justice → oikeiosis · temperance → passion-log · courage → premeditatio · wisdom → morning preparation | Confirmed (wisdom **partially** — "the best available fit"; a more targeted phronesis suggestion may become possible later) |
| score (action evaluation) | `passions_detected` non-empty | passion-log | Confirmed |
| morning | `preparation_quality = vague` | *(retry line only; no cross-tool suggestion)* | Confirmed ("a second suggestion on top of it would be noise") |

**Named honest limitation — now a DEFERRED ANCHOR (6a verdict):** anchor A2 (morning prep revealing weak obligations-reasoning → oikeiosis) requires a signal the morning gate does not produce (`prepared|vague` only). **Verdict: leave A2 unimplemented; do not enrich the gate.** "The tool should not be changed to fit the mapping; the mapping should wait for the tool to develop naturally." The obligations dimension is reached instead through oikeiosis directly — the stage-crossing trigger and the phthonos/zelotypia rows. Revisit **only if** the morning tool later warrants a second classification dimension on its own terms. "Record A2 as a deferred anchor, not a dropped one."

**Tier:** `code-elevated`. **Verify:** unit tests per mapping row incl. the honest-null rows; the one-suggestion invariant; strings asserted against the locked set (the `content pins assert exported values` lesson); boundary suites re-run; review Workflow per §13.

## §8 Phase 3 — Stage-crossing trigger

> **STATUS: BUILT + VERIFIED 2026-07-27** (`D-PRACTICE-REMINDERS-HUMAN-PHASE3-STAGE-CROSSING-BUILT`;
> close: `operations/handoffs/founder/2026-07-27-practice-reminders-human-phase3-stage-crossing-CLOSE.md`).
> Live on the founder's push — no flag, no schema. **This completes the human plan** — Phases 0, 1,
> 2 and 4 were already built; item 4 below (the cadence-banner restyle) was found ALREADY DONE by
> Phase 4's own session, so item 1-3 are this session's actual build. Corrections and build
> decisions, recorded rather than absorbed:
> 1. **A found mechanical defect, fixed before shipping:** `score/page.tsx` already POSTs to
>    `/api/milestones` after every evaluation and discards the response (Phase 0). Since that POST
>    almost always lands BEFORE any dashboard visit, a dashboard-only card (item 1's literal framing)
>    would have found the crossing already earned on MilestonesDisplay's own POST and shown nothing —
>    firing only in the retroactive-catchup case, never the ordinary going-forward one. Fixed by
>    mounting the same card on BOTH the score-result view and the dashboard, each independently
>    resolving its own `new_milestones` response; whichever observes the crossing first shows it.
> 2. **No client-side store was added** for "dismissible, never repeated" — the POST response's
>    idempotency (a `stage_*` id can appear in `new_milestones` at most once, ever) already makes it
>    true, permanently, across devices, which is the more robust of the two options this section's
>    own successor prompt named ("localStorage vs a milestones-read derivation").
> 3. **RESOLVED same-day by a targeted mentor consultation.** The multi-crossing tie-break
>    ("highest rank wins") was flagged by adversarial review as an open question — the verbatim
>    record never addressed the scenario where a retroactive catch-up earns several stage_* ids at
>    once, and it is not rare (fires for most returning practitioners' first post-deploy visit). Put
>    to the mentor (`operations/reminders-2026-07/2026-07-27-phase3-tiebreak-mentor-briefing.md` /
>    `…-verdict-verbatim.md`, binding): highest-rank rejected ("not a mirror. It is a trophy"),
>    lowest-rank rejected (the mirrored failure), silence rejected ("withholding orientation from
>    the practitioners who have earned the most context"). **Adopted: disclose the plurality, and
>    name the stage matching the practitioner's MOST RECENT EVALUATION — never the highest ever
>    reached.** Built and verified same-day (`D-PRACTICE-REMINDERS-HUMAN-PHASE3-TIEBREAK-MENTOR-VERDICT-ADOPTED-AND-BUILT`)
>    — `resolveNewlyEarnedStage` now requires the current-condition signal as a second parameter, and
>    the card shows *"Your practice has moved through more than one condition. Where it stands now
>    is ⟨X⟩…"* when more than one crossing was newly earned at once.
> 4. **`StagePracticesList` was extracted mid-session** (not originally planned) after adversarial
>    review found the original inline "no prerequisite gating" render in `MilestonesDisplay` was
>    guarded only by a source-text pin a plausible refactor could defeat. The extraction makes the
>    property true by construction (the component's props carry no earned/selection concept at all);
>    both `MilestonesDisplay` and `/stages/<slug>` now delegate to it.
>
> **One review pass, genuinely independent.** The Workflow tool's opt-in gate wasn't met this
> session, so the review ran as 4 parallel independent `Agent` calls rather than a Workflow — still
> four fresh contexts blind to the build's own reasoning, and it found real defects: one HIGH
> (`newlyEarnedStage` never reset between evaluations on `/score` — the THIRD time this exact
> stale-suggestion-card bug class has appeared in this arc, after two prior fixes in Phase 2), one
> MEDIUM-HIGH (the gating-guard fragility that motivated the `StagePracticesList` extraction), one
> MEDIUM fixed (a single-fixture render-test gap), plus the open question above and two smaller
> disclosed-not-fixed residuals (a narrow concurrent-POST race; a low-severity dashboard partial-
> failure visual inconsistency). All folded into the same build session and re-verified —
> see the decision-log entry for the full account.
>
> *(The block below is the pre-build vetting record, retained for the arc's history.)*
>
> **CONTENT VETTED 2026-07-27 — Step M answered; Phase 3 is unblocked**
> (`D-PRACTICE-REMINDERS-STEP-M-MENTOR-VERDICTS-ADOPTED-2026-07-27`; verbatim record wins). Three
> verdicts bind this phase's build:
> 1. **The card NAMES the stage** — the earn-moment copy is REVISED to: *"Something has shifted in
>    how you are meeting difficulty. This is ⟨Stage Name⟩. These practices meet you where you now
>    are."* Named as a **description of a condition, never a grade**: the omission read as coy, and
>    the name "connects the card to the five stages framework the practitioner already knows".
>    Dismissible / never-repeated / never-congratulates are **load-bearing, kept exactly** ("a card
>    that can be repeated would become a grade delivered on a schedule").
> 2. **No prerequisite gating.** A stage-triggered suggestion is never held back until its
>    prerequisite practice is met — "the prerequisite logic belongs to the sequence trigger". The
>    stage signal is trusted; the practitioner decides.
> 3. **The single-signal orientation line — and in THIS system it is the rule, not the exception.**
>    The mentor's carve-out (a stage determined "by a single strong signal rather than a pattern"
>    should carry an honest orientation, not a gate: *"this practice builds on the passion log — if
>    that is not yet familiar, begin there first"*) applies to EVERY stage crossing here, because the
>    `stage_*` milestones fire on a single evaluation at the exact proximity level (Phase 0,
>    founder-elected). The mentor's "a practitioner whose signals indicate The Worn Path has, by
>    definition, the prior practice" premise does NOT hold in this system — a first-ever evaluation
>    can fire a stage milestone — so the earn card carries the orientation line.

1. **The earn moment:** Phase 0's POST response feeds a dashboard card shown when a `stage_*` milestone is newly earned — mirror language, **vetted form (Step M)**: *"Something has shifted in how you are meeting difficulty. This is ⟨Stage Name⟩. These practices meet you where you now are."* — naming the stage's practices (`STAGE_PRACTICES`) + the Stage page link, plus the single-signal orientation line above. Dismissible (client-side); the milestone grid remains the durable record. Never "you have reached…"; never a congratulation.
2. **Stage pages gain their practices:** each `/stages/<slug>` page renders its `STAGE_PRACTICES` tools with doorbell lines (The Inner Fire renders the no-scaffolding line instead).
3. **`MilestonesDisplay`:** stage-milestone detail panels add the same practice links beside the existing Stage-page link.
4. **The two existing cadence banners** (premeditatio Monday, oikeiosis quarterly) are restyled onto the same visual component for consistency — cadence logic unchanged.

**Tier:** `code-elevated`. **Gated on:** Phase 0 (awarding must exist) + Step M (the stage-mapping reading confirmed). **Verify:** earn-card render driven by a stubbed newly-earned response; language review against constraint 5; boundary suites; build/tsc.

## §9 Phase 4 — The daily rhythm (in-product, per E1)

> **STATUS: BUILT + VERIFIED 2026-07-27** (`D-PRACTICE-REMINDERS-HUMAN-PHASE4-DAILY-RHYTHM-BUILT`;
> close: `operations/handoffs/founder/2026-07-27-step-M-briefing-and-phase4-daily-rhythm-CLOSE.md`).
> Live on the founder's push — no flag, no schema. Corrections to this section, recorded rather
> than absorbed:
> 1. **The evening pole was unreadable as specified.** §9 says "journal or reflection", but the
>    route read only `journal_entries` and `action_evaluations_v3` — the `reflections` table was
>    read by nothing. A practitioner who had reflected but not journalled would have been told,
>    wrongly, that the evening review was not done. `reflections` is now a rhythm source.
> 2. **No human page writes `reflections`.** `/api/reflections` is GET-only and `/reflections` is
>    a read-only history view; rows arrive via `/api/reflect` (the API skill) and
>    `/api/mentor/private/reflect`. So the table rightly COUNTS toward the pole, but the pole
>    LINKS to `/journal` — the only surface a practitioner at a browser can write on. The strip
>    says so rather than leaving the link quietly under-describing what qualifies.
> 3. **"Today" cannot be computed server-side.** The local day boundary is the practitioner's, so
>    the fold takes the clock as a parameter and the component supplies it. The lib stays
>    clock-free (its boundary suite bans `Date.now(`).
> 4. **The returning line ships as a DRAFT** pending Step M. §10 says Step M does not gate this
>    phase, yet its item 4 is this phase's copy; shipping the line as revisable resolves that
>    rather than pretending the tension is not there.
>    **RESOLVED 2026-07-27 — Step M answered: the line is CONFIRMED AS DRAFTED** ("It is the right
>    line… *when you turn toward it* does the work"). The 14-day threshold is defensible ("do not
>    over-engineer the number"); *whatever is nearest* is kept over naming the next step ("the
>    practitioner knows themselves better than the system does at the moment of return"). One
>    optional refinement was offered, explicitly either/or: *"begin with whatever feels most honest
>    right now"* — "the current draft is not wrong; this is a refinement, not a correction." The
>    shipped line stands; the refinement is available to the founder at any time (a two-line change:
>    the copy constant + its verbatim pin).
>
> Also added, closing a gap the Phase 1 close named: a **behavioural render test** for the strip
> (`src/components/__tests__/daily-rhythm-strip.test.tsx`), because the honesty rules this feature
> turns on are *rendering* rules and a fold test cannot see them.

A dashboard rhythm strip (and nothing louder): **Morning preparation** — done / not yet today; **Evening review** (journal or reflection) — done / not yet today; the Monday and quarterly banners folded in visually. States, not commands; the doorbell line appears only for the not-yet state (*"It is time for morning preparation"* is the mentor's own sanctioned example). **Returning-after-absence:** when every practice table is idle ≥ 14 days, one gentle line (draft, Step M vets): *"It has been a while. The practice is here when you turn toward it — begin with whatever is nearest."* No guilt framing, no lapsed-streak framing — the mentor is explicit that reminders cannot fix the false-judgement lapse, so the line invites and stops.

**Tier:** `code-elevated`. **Verify:** rhythm states against seeded rows for today/yesterday; absence line threshold unit-tested; build/tsc.

## §10 Step M — the mentor consultation (one consultation, per E3)

> **STATUS: ANSWERED + ADOPTED AS BINDING 2026-07-27**
> (`D-PRACTICE-REMINDERS-STEP-M-MENTOR-VERDICTS-ADOPTED-2026-07-27`). The verbatim record —
> which wins over every summary and table — is
> `operations/reminders-2026-07/2026-07-27-step-M-mentor-verdicts-verbatim.md`; the founder-pasted
> source is `inbox/mentor consultation briefing answers - practice reminders.rtf` (committed).
> **The gate on Phases 2 and 3 content, and on agent plan A1/A2 content, is DISCHARGED.**
> Verdict summary: §7's table is vetted in place (differentiated phobos mapping; lupe split;
> hedone declined; hupexairesis row → morning prep); §1's conditions-not-corridor reading
> confirmed; §8's card names the stage + carries the single-signal orientation line, prerequisites
> never gate; §9's returning line confirmed as drafted (optional refinement recorded); A2 is a
> **deferred anchor** (do not enrich the morning gate); the passion-reading question resolves to
> **the engine's reading with disclosure on disagreement**; the agent table reorders **B2 before
> B1** and takes a **question form, not a destination form** (companion plan §4).
>
> *(The block below is the pre-answer record, retained for the arc's history.)*
>
> **BRIEFING AUTHORED 2026-07-27, awaiting the founder's send** —
> `operations/reminders-2026-07/2026-07-27-step-M-mentor-briefing.md`. It covers all five items
> below and adds two questions the build surfaced that this section did not anticipate:
> **(6a)** anchor A2 (morning preparation → oikeiosis) **cannot be implemented as given** — the
> morning gate records only `prepared|vague`, so the externals-vs-obligations distinction it keys
> on does not exist; and **(6b)** the passion log stores **two** classifications of every event
> (the practitioner's own and the engine's, plus whether they agree), so "a phobos sub-species
> suggests premeditatio" is ambiguous about whose reading governs — a question about whose
> judgement the tool defers to, which is the doorbell boundary in another guise.
>
> Also surfaced for the mentor: the stage list the counsel gives (Storm → Crossroads → Worn Path →
> Clear Summit) does not ascend the proximity ladder (Storm → Worn Path → Crossroads → Clear
> Summit), so a practitioner on the ladder's second rung would be handed premeditatio and
> hupexairesis — the two practices the counsel calls hardest — before the two it calls easier.

Founder-run against the private mentor, briefing authored from this plan + the agent plan when scheduled. **Items:** (1) the §7 human mapping table (confirm/correct every Proposed row; the two anchors restated); (2) the agent mapping table (companion plan §5); (3) the §1 stage/sequence non-linearity reading; (4) the §9 returning-practitioner line + the §8 earn-moment copy; (5) the named morning-gate limitation (§7). **Outputs are binding** (verbatim record committed, tables updated, decision-log entry) per the project's mentor-verdict convention. **Gates:** Phase 2 and Phase 3 *content* activation. Does **not** gate Phases 0, 1, 4 (mentor-verbatim or copy-only content).

## §11 Boundaries, language, and rules (all phases)

- **Measurement neutrality preserved:** no reminder code imports substrate/trust-core/`stoic-brain`; new logic lives in new human-side lib files; `stoic-brain.ts` stays byte-identical (the guard suites assert it); every new/touched route keeps or gains a `human-practitioner-boundary.test.ts`.
- **No gamification:** no streaks, no scores-for-consistency, no badges beyond the existing honest-recognition milestones (R1/R6c/R9). The mirror principle: "the reminder reflects the time back to the practitioner. It does not reflect the quality of what they do with it."
- **R20a/AC5:** these surfaces take no free text (they read existing rows), sitting outside the distress perimeter per the family precedent; `SupportFooter` stays on every practice page; the standing whether-the-family-joins-the-perimeter question remains open and is **not** settled by this plan.
- **Copy discipline:** every user-visible string in this system is pre-authored, doorbell-voiced, and test-pinned as exported values.

## §12 Out of scope (per E1), recorded so the thinking is not lost

- **`.ics` calendar export** — the zero-infrastructure phone-alarm answer; revisit any time.
- **Email reminders/digest** — requires: Resend provisioning (queued founder-performed item), a preferences store + settings UI (new schema), unsubscribe, R17 export/delete wiring (data-deletion wiring = **Critical** per 0d-ii), and an AC5 pass on email as a new medium.
- **Browser push** — advised against; the above cover the need with less machinery.
- **Richer gate classifications** (the morning obligations signal) — its own measurement-neutrality question.

## §13 Sequencing, sizing, risk

Order: **0 → 1 → (Step M) → 2 → 3 → 4** (4 may run any time after 1; 2–3 content activation gates on Step M). Estimates: Phase 0 ~0.5 session · Phase 1 ~1 · Phase 2 ~1–1.5 · Phase 3 ~0.5–1 · Phase 4 ~0.5 · Step M its own consultation. **Every phase is `code-elevated`, Standard/Elevated risk; no schema change, no flag, no auth surface, no Critical step anywhere in this plan** — deploys are ordinary pushes; AC7/PR6 not engaged. Each build session runs an adversarial review per the family precedent (PR19 template where the change is consequential); rollback per phase = `git revert` that phase's commit.

*End of plan. The companion agent plan mirrors this structure and is sequenced after this plan ships.*
