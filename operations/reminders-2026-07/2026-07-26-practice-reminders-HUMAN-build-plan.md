# Practice Reminders — Human Practitioner Build Plan

**Stream:** founder (website build).
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Authored:** 2026-07-26, from the mentor consultation `inbox/mentor discussion about reminders for humans and agents.rtf` (verbatim source — commit with this plan) analysed against the verified current state.
**Status:** Authored; the four scope elections below were made by the founder 2026-07-26 (AskUserQuestion). Build sessions commence on the founder's go. **Step M (mentor consultation, §10) gates the *content* of Phases 2–3 going live; Phases 0–1 carry only mentor-verbatim content and are not gated on it.**
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

**A nuance recorded, not smoothed over:** the introduction *sequence* and the *stage mapping* do not linearize identically — premeditatio + hupexairesis sit 4th/5th in the sequence but belong to The Worn Path (habitual), 2nd on the proximity ladder. The coherent reading, encoded in this plan: **the stages are conditions, not a corridor** — the stage-crossing trigger serves whichever stage the practitioner's signals actually indicate; the sequence trigger is only the no-signal default. This reading is one of the Step M confirmation items (§10).

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

**Mechanism:** each gated tool's POST/PATCH response gains an additive, optional **`suggested_practice`** field `{practice_id, href, line, basis}` — computed **deterministically** from the entry's own stored classification via one locked mapping table in `practice-sequence.ts`; rendered on the tool page beneath the existing quality-gate block. `line` strings come from a **fixed pre-authored set** (never composed, never LLM-authored) of the shape: *"This entry showed ⟨basis⟩. ⟨Practice⟩ is suited to examining it further."* — and then stop (constraint 5). Field absent when no row fires — an honest null, not a filler suggestion. At most **one** suggestion per response (the teacher names *the* next practice, not a menu).

**DRAFT mapping table (Step M vets before this phase's content goes live; the two mentor-given rows are anchors):**

| Tool | Stored signal | Draft suggestion | Confidence |
|---|---|---|---|
| passion-log | sub-species in the **phobos** family (incl. `agonia`) | premeditatio | **Mentor-given** ("agonia suggests premeditation — the direct rational response to future-facing fear"); family generalization proposed |
| passion-log | sub-species in the **lupe** family | view-from-above | Proposed (restoring proportion addresses distress/catastrophising) |
| passion-log | sub-species in the **epithumia** family | hupexairesis | Proposed (desire → equanimity held contingent on outcomes) |
| passion-log | sub-species in the **hedone** family | morning preparation | Proposed, low-confidence — Step M decides |
| passion-log | repeated `caught_before_assent = false` | morning preparation | Proposed (orientation before impressions arrive) |
| view-from-above | `minimised` | passion-log | Mentor-adjacent ("both require some prior practice with the passion log") |
| view-from-above | `unchanged` | *(none — honest null)* | — |
| premeditatio | `is_generic = true` | passion-log | Mentor-adjacent (the premeditatio-vs-agonia distinction "requires prior work with the passion log") |
| oikeiosis (quarterly) | `philodoxia_warning` fired | passion-log (philodoxia is an epithumia sub-species) | Proposed |
| hupexairesis | `separates_action_from_outcome = false` | view-from-above | Proposed, low-confidence — Step M decides |
| sage-compass | `expression_quality = vague` | `/logos` re-grounding | Proposed |
| sage-compass | practitioner-selected `distance_reading = far` + `virtue_engaged` | the domain's suited practice: dikaiosyne → oikeiosis · sophrosyne → passion-log · andreia → premeditatio · phronesis → morning | Proposed |
| score (action evaluation) | `passions_detected` non-empty | passion-log ("log what was noticed") | Proposed |
| morning | `preparation_quality = vague` | *(retry line only; no cross-tool suggestion)* | — |

**Named honest limitation:** the mentor's second worked example (morning prep revealing sound externals-reasoning but weak obligations-reasoning → oikeiosis) requires a signal the morning gate does not produce today (`prepared|vague` only). **v1 suggests only from signals that already exist**; enriching a gate's classification is out of scope and would need its own measurement-neutrality review. Recorded as a Step M discussion item, not built.

**Tier:** `code-elevated`. **Verify:** unit tests per mapping row incl. the honest-null rows; the one-suggestion invariant; strings asserted against the locked set (the `content pins assert exported values` lesson); boundary suites re-run; review Workflow per §13.

## §8 Phase 3 — Stage-crossing trigger

1. **The earn moment:** Phase 0's POST response feeds a dashboard card shown when a `stage_*` milestone is newly earned — mirror language, verbatim-derived: *"Something has shifted in how you are meeting difficulty. These practices meet you where you now are."* — naming the stage's practices (`STAGE_PRACTICES`) + the Stage page link. Dismissible (client-side); the milestone grid remains the durable record. Never "you have reached…"; never a congratulation.
2. **Stage pages gain their practices:** each `/stages/<slug>` page renders its `STAGE_PRACTICES` tools with doorbell lines (The Inner Fire renders the no-scaffolding line instead).
3. **`MilestonesDisplay`:** stage-milestone detail panels add the same practice links beside the existing Stage-page link.
4. **The two existing cadence banners** (premeditatio Monday, oikeiosis quarterly) are restyled onto the same visual component for consistency — cadence logic unchanged.

**Tier:** `code-elevated`. **Gated on:** Phase 0 (awarding must exist) + Step M (the stage-mapping reading confirmed). **Verify:** earn-card render driven by a stubbed newly-earned response; language review against constraint 5; boundary suites; build/tsc.

## §9 Phase 4 — The daily rhythm (in-product, per E1)

A dashboard rhythm strip (and nothing louder): **Morning preparation** — done / not yet today; **Evening review** (journal or reflection) — done / not yet today; the Monday and quarterly banners folded in visually. States, not commands; the doorbell line appears only for the not-yet state (*"It is time for morning preparation"* is the mentor's own sanctioned example). **Returning-after-absence:** when every practice table is idle ≥ 14 days, one gentle line (draft, Step M vets): *"It has been a while. The practice is here when you turn toward it — begin with whatever is nearest."* No guilt framing, no lapsed-streak framing — the mentor is explicit that reminders cannot fix the false-judgement lapse, so the line invites and stops.

**Tier:** `code-elevated`. **Verify:** rhythm states against seeded rows for today/yesterday; absence line threshold unit-tested; build/tsc.

## §10 Step M — the mentor consultation (one consultation, per E3)

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
