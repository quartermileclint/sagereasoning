# Standing Session Opener — Grounded Foundations

**Version 2026-08-29** (amends the 2026-08-15 version, archived at
`archive/2026-08-15_STANDING-SESSION-OPENER-grounded-foundations.md`; predecessors at
`archive/2026-08-12_…`, `archive/2026-08-01_…`).

> **How this version was grounded.** Written by a Fable 5 session on 2026-08-29 that re-derived the
> whole 2026-08-15 → 2026-08-26 window from primary sources: every decision-log heading in the window
> (~115 entries, read in full via twelve parallel segment-readers whose outputs were then synthesised
> and spot-verified first-hand), the four most recent closes, the concurrent-arc plan, the
> outstanding-open-questions register, the primal-substrate priority index (incl. its gates table and
> named-input register), the prompt↔close discharge audit across every handoff file dated 08-15→08-26,
> and direct first-hand checks of git state, the R20a registry arrays, flag names in source, and the
> founder's dogfood `settings.local.json`. Load-bearing production claims were verified where a repo
> session can verify them (one — the EE-C1 wire wording — was observed live in this session's own
> Gate-1 frame); claims a repo session cannot verify are marked **unverified**. The record's last
> activity is **2026-08-26** (three quiet days before this writing); `git log origin/main..HEAD` was
> **empty** at writing — everything is pushed. Re-derive both facts at your own open.

**For the founder. Paste this as the FIRST message of a new session, then state your task beneath it
(or in your next message).** This opener grounds the session in the project's current state and the
trust-layer harness *before* any work begins, under the standard protocol. It is **reusable across
any task** — a preamble, **not a task**: read, confirm, then wait for the task.

---

## ⚠️ The facts every session in this window must know before anything else

1. **The IDEA-loop bounded validation run is OVER.** The 08-15 opener's top box (a live run in a
   scratch project, parallel-window fences, Mode 1/2/3 pre-flights) is **retired**. The mentor ruled
   **stop at 20 cycles** (2026-08-16; option "one more cycle" explicitly rejected; "the founder ends
   the run; the runner does not"), the **§6 report was compiled from live production data and
   accepted by the mentor IN FULL** ("the epistemic standard the project has been building toward")
   — `operations/agent-circles-2026-08/2026-08-16-idea-loop-S6-report.md`. Final figures: 20 cycles,
   15 winner / 3 dependency_unavailable / 2 null_cycle; $6.82 total; h7 wins split three ways (4
   contested tie-break / 1 uncontested / **0 contested out-scoring**); h5 zero wins
   (reach/competitiveness decoupled); h6 zero candidates (session-boundary flattening — a standing
   hard infrastructure requirement). The parallel-window fences are moot. Post-run gates opened and
   were then largely traversed (see Part B).

2. **A live record-only observation window is running instead: the provenance ledger.**
   `SUBSTRATE_PROVENANCE_LEDGER_ENABLED=true` in Vercel (all environments) since **2026-08-26**
   (`D-PROVENANCE-LEDGER-SLICE2-ACTIVATION-LIVE-2026-08-26`). Every credential-bearing,
   successfully-signed `/api/reason` consult writes one `agent_provenance_ledger` row
   (`sha256(signature) → layer1_source`), and every accreditation write runs the classification
   **record-only** (`classifyProvenanceArtifact` → permit / no_ledger_entry / out_of_window /
   identity_mismatch / caller_supplied_extraction; logs, never refuses, never writes
   `agent_provenance_gaps`). **The founder-run readiness watch for slice 5 (ENFORCE) started at
   activation**: SCOPE §9's C2 threshold needs two consecutive weeks of 100% ledger-eligible-artifact
   resolution in the Vercel function logs (`[trust-core][provenance-ledger] classify …`) — nominally
   reaching eligibility ~2026-09-09. Slice 5 additionally waits on slice 3 (the served
   `provenance_gaps` sibling field + the §10 attestation amendment, wording already founder-signed)
   and the other switch-on conditions. The harness (`sagereasoning:s9-loop@v1`) is **excluded by
   name** from C1's denominator by mentor ruling (its consult credential is owner-less by design, so
   its identities never cohere; deferral ruled single-agent, not policy).

3. **CLAUDE.md is substantially stale for this window — this opener is currently the more complete
   record.** CLAUDE.md's last edit is 2026-08-23 and touched only the perimeter-count paragraph; its
   Live list and refresh blocks carry nothing from 08-17→08-26 (no R20a perimeter completion, no
   practice-family RLS, no agent-hold sweep, no M-4/M-5 work, no ATRF/EE wave, no D4-completion
   unflagged engine change, no extraction-provenance correction, no provenance ledger, no close-hook
   variation). **Folding this window into CLAUDE.md is a queued housekeeping item** (below). Trust
   CLAUDE.md for pre-08-15 state; trust this opener + the decision log for the window; trust source
   over both.

4. **The R20a perimeter is complete, live, and much larger than any earlier number.** Re-derived
   first-hand at this writing from `website/src/lib/__tests__/r20a-invocation-guard.test.ts`:
   `HUMAN_FACING_POST_ROUTES` = **42** route-level members (of which the
   `FLAG_GATED_ROUTE_LEVEL_ROUTES` annotation array currently lists **31**) + `SUBSTRATE_GATE_ROUTES`
   = **2** ⇒ **44**. The registry arrays are canonical; never quote a count without re-deriving —
   this file's numbers included. The exhaustiveness sweep (a filesystem walk with a mentor-ruled
   proxy-free predicate, a **ruled prerequisite** for any coverage claim) runs inside that battery.

5. **Two session-open conventions are new since 08-15 and bind now:** (a) **PR25** (2026-08-24) — a
   verification claim in a code comment carries its check, resolved at the commit from the staged
   diff (convention-only; pilot scope = code comments); (b) the **concurrency convention**
   (2026-08-24, deliberately NOT PR26) — run `ListAgents` at session open, note the peer count, and
   **commit path-scoped, always** (never `git add -A`); grounded in two consecutive sessions bitten
   by concurrency (ten peers; HEAD moving mid-session; the slice-2 session found slice 1's "CLOSED"
   files still uncommitted and six peer-session files to exclude). Also new: **PR20 strengthened
   twice** (2026-08-19 — present-tense mechanism facts timestamp-checked at relay; carry-forwards
   naming a target session checked at drafting, redirected if the target is closed), and the
   **decision-log placement note** (2026-08-24): the top ~21 entries of the log are PREPENDED, not in
   append order — the convention is append at the physical tail; founder elected leave-in-place.

---

## Part A — Open under the standard protocol (Tier 1 — always; ~8–10 min)

Read, in order:
1. `/adopted/standing-protocol-cache.md` — session protocol, model selection (AC1), risk
   classification (0d-ii), the AI-failure-mode table (now **five** rows — "Lesson cited, not tested
   (KG-EX2)" with the redirect phrase *"That's the rule — what did the check return?"* was added
   2026-08-24), the **concurrency check §6**, the status vocabulary. **Process rules are PR1–PR25.**
2. `/adopted/build-sessions-protocol-cache.md` — if the task is a substrate/trust-layer build.
3. `/adopted/project-instructions-snapshot.md` — PR1–PR25 in full; PR19 (independent adversarial
   review REQUIRED — and note this window's repeated pattern: independent review caught what
   first-hand review missed, again, several times); PR20 as amended; PR25.
4. `/CLAUDE.md` — with fact 3 above firmly in mind: current through ~2026-08-16 plus the 08-23
   perimeter paragraph; stale for the rest of this window.
5. `/operations/decision-log.md` — the last 2–3 entries at the **physical tail** (as of this writing:
   `D-PROVENANCE-LEDGER-SLICE2-ACTIVATION-LIVE-2026-08-26`,
   `D-PROVENANCE-LEDGER-SLICE2-INDEPENDENT-REVIEW-CLEAN-2026-08-26`,
   `D-PROVENANCE-LEDGER-SLICE2-CONSULT-WRITE-CLASSIFICATION-SWEEP-BUILT-2026-08-26`). Remember the
   placement note: the file's head is NOT the newest material.
6. **The most recent closes, matched to your task:** for the provenance-ledger thread,
   `operations/handoffs/founder/2026-08-26-provenance-ledger-slice2-consult-write-and-sweep-CLOSE.md`
   (incl. its independent-review addendum and slice-3/slice-5 inheritance section); for the harness
   thread, `2026-08-26-close-hook-live-observation-completion-CLOSE.md`; for anything else, find the
   thread's own close by name in `operations/handoffs/founder/`.
7. **`git status`** — know the pending tree; never treat another session's uncommitted records as
   yours to stage. Expected strays at this writing: `website/src/data/environmental-context.json`
   (modified, weekly-scan drift), `a3-developmental-streak.py`, `brand/Brand_Guidelines_superseded.docx`,
   `inbox/Mentor Cybernetics Instructions.rtf` + `inbox/mentors brainstorming instruction.rtf` (both
   **acted on** — cybernetics executed as binding 08-24, brainstorming fed the SagePals/Prudence
   records — but never committed; founder's disposition), several 2026-08-10/-12 IDEA-loop and
   c15/S7 prompt files (untracked-but-live records; do not "clean up"),
   `sdk/typescript/package-lock.json`, `supabase/.temp/`, and
   `archive/2026-08-01_STANDING-SESSION-OPENER…` (untracked archive copy).
8. **`ListAgents`** (the concurrency convention) — note the peer count before writing anything.

*Tier 2 (task-dependent):* the day's deliverable in full; `/manifest.md` targeted rules (R0–R22 +
the three un-numbered sections) for `code-*` work; `operations/agent-circles-2026-08/` for anything
in the agent-circles/ATRF/EE/provenance line (the mentor verbatims are canonical — **verbatim wins
over every summary including this one**); `operations/reflections-examination-2026-08/` for the
reflections arc; `operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md` for the gates table +
the **named-input register** (the B1 mechanism: sessions holding inputs for not-yet-opened sessions
add a pointer row there); `operations/2026-08-24-OUTSTANDING-OPEN-QUESTIONS-REGISTER.md` (useful but
already partially stale — its A0 urgent item has since been scoped, ruled, built, and activated
through slice 2; read it as an 08-24 snapshot).

---

## Part B — Ground in the current project state (confirm you can state these)

### Production state — what is live beyond the 08-15 opener's list

The substrate is live at `www.sagereasoning.com`. Everything the 08-15 opener listed as live remains
live (examination engine, guardrail, accreditation, corroboration check, ADR-010 §4, S10 public
trust record, trust core under MEASURE, AE-1/AE-2, practice-suggestion A1/A2, B5, orientation
readings C2/C1c, the Stoa incl. Q5c/Q13a, `/impulse`, the IDEA-loop surfaces, C-1 sweep, the
2026-08-16 RLS lockdowns). **New live state since 2026-08-15, in rough order of consequence:**

- **The R20a perimeter completion arc (08-17 → 08-19) — LIVE and founder-smoke-confirmed.**
  `SUBSTRATE_R20A_GAP_CLOSURE_ENABLED=true` in production. The arc: six unprotected human-facing
  free-text routes found and closed dark (PR19 found routes 5–6) → activated with a 14-probe
  both-directions smoke → PR19's fourth pass found TWO more (`mentor/gap4`, `founder-facts` POST+PUT)
  → the mentor RULED the six routes ratified members, the **entire Remaining-Principles practice
  family SHOULD JOIN** (reversing the family's outside-the-perimeter precedent: "the family where
  the material is most likely to surface acute distress"), and the filesystem sweep a ruled
  prerequisite → the sweep was built (proxy-free predicate after a content-matching predicate was
  built, measured, and rejected), 17 more routes wired incl. the whole practice family +
  `/api/evaluate` **gated behind `requireAuth`** (an unauthenticated public free-text evaluator six
  prior passes missed; ruling: gate first, never screen an unauthenticated surface as a standalone
  fix) → final 3 routes (`mentor-appendix`, `mentor-profile`, `founder/hub`) wired, registry 42+2,
  sweep GREEN (zero unclassified; 124 route files walked; the route/handler-split blindness fixed) →
  **live-confirmed 2026-08-19 by founder smoke on three routes, and `/limitations` published** with
  the mentor's Q3 coverage bound verbatim (a bare "every time" was ruled an over-promise) plus a
  prominent M-5 "nothing happens afterwards" disclosure. `/api/guardrail` stays outside the
  perimeter **on a ruled reason** (human path screened upstream via compose/execute; the 2026-06-19
  deferral notation retired). The **empty-subject billed-call defect** was then closed across all 22
  remaining routes (08-22, PR19 zero findings). Three false public claims corrected under
  founder-signed wording (ops-hub ×2; transparency support@).
- **The RLS/grants lockdown arc continued.** Beyond the four 08-16 fixes already in CLAUDE.md:
  the **practice-family ten-table lockdown LIVE 2026-08-22** (`sage_compass_entries`,
  `morning_preparation_entries`, `view_from_above_entries`, `reserve_clause_entries`,
  `circle_extension_entries`, `oikeiosis_reflections`, `premeditatio_entries`, `passion_events`,
  `realtime_journal_entries`, `mentor_baseline_appendix` — all service-role-only, TEST then
  production, behavioural proof both directions). The **Class-B route change BUILT + TEST-verified
  2026-08-23** (new `GET /api/action-evaluations`, new `POST /api/score/save`, journal page routed
  through the API — `action_evaluations_v3`/`journal_entries`/`reflections` now have zero
  client-side consumers; **their RLS `§APPLY` is still carried**, its migration authored:
  `website/supabase-class-b-rls-lockdown-migration.sql`). **View grants (08-26):** 4 of 5 defective
  view-creating files remediated in-source + a consolidated live-apply migration **AUTHORED, NOT
  RUN** (`website/supabase-view-grants-remediation-migration.sql`); the fifth —
  **`vulnerability_flag_owner_view`** — deliberately NOT remediated and **ESCALATED** (designed for
  authenticated-owner SELECT, no `security_invoker`, base-table RLS ENABLEd-not-FORCEd ⇒ plausible
  full-table read on the R20a vulnerable-user flags table; latent, 0 rows) — awaiting founder
  direction. The pre-commit hook now runs **five checks** (incl. new `route-export-check.ts` and
  `view-grants-check.ts`, which reports exactly the one held violation).
- **`agent_hold_observations` retention sweep LIVE 2026-08-22**
  (`SUBSTRATE_HOLD_OBSERVATIONS_SWEEP_ENABLED=true` + its `vercel.json` cron) — PR24's last named
  retention debt closed. (PR24's grounding was corrected 08-17: `stoa_entries` never bound —
  no-`retain_until` is a binding mentor posture there, not a gap.)
- **M-4 (`disposition_stability`) — corrected and partially retired, live.** The mean-blindness
  fixed 08-17 (`ADVANCED_MEAN_FLOOR = 3.0` — 30 identical `reflexive` readings no longer certify
  `advanced`); obligations 1+4 built 08-21 and since pushed: the dimension is retired from the
  `principled → sage_like` gate ONLY (that rung now structurally unreachable, as ruled — thresholds
  deliberately NOT retuned) and from agent-facing display at the top rungs, retained unchanged as an
  input at the three lower rungs; the disclosure naming BOTH defects is on all three R18 surfaces.
  **`SUBSTRATE_TRAJECTORY_DISPERSION_ENABLED` (Spec 4) stays BLOCKED** until a perturbation-adjusted
  measure restores the dimension.
- **M-5 (the distress-monitoring gap):** (a) the compliance documents' false claims corrected in
  place 08-17; (b) the genuine-detection write path to `vulnerability_flag` **built, twice
  PR19-reviewed, committed** — it has **NO feature flag**; its only gate is that no call site yet
  passes `userId`/`sessionId` (the identity-threading follow-ups). `triggered_rules` writes `{}`
  pending a dedicated Critical+schema encryption migration.
- **The ATRF → Evaluative-Engine wave (08-23).** The ATRF scoping session ran (it was gated
  post-run; the gate discharged), the mentor confirmed scope with six adjustments, then **ruled all
  sixteen ATRF questions** and, separately, **all the EE epistemic-status questions** and the **O-C
  Gate-2 questions** (verbatims in `operations/agent-circles-2026-08/2026-08-23-*`). The production
  wave then built: the blast-radius/S4 migration (six additive columns on `idea_loop_candidates`),
  `POST /api/practice/completion-signal` **dark** behind `SUBSTRATE_COMPLETION_SIGNAL_ENABLED` + its
  `idea_loop_completion_signals` table + a `completion_signal_write` capability widening, and the
  **EE-C1 wire-wording change applied at `layer2-mechanisms.ts`** ("No kathekon factors were
  extracted from the submitted text; on that basis, the engine reads the action as contrary to
  appropriate action") — **confirmed live first-hand at this writing: the string serves in this very
  session's own Gate-1 frame.** The **D4-completion** landed the same day: `ruling_faculty_state`'s
  deliberation input replaced with the substantive-note predicate `hasGenuineDeliberation` —
  **deliberately UNFLAGGED on the shared measured surface** (reasoned election, 20,176-schema
  equivalence sweep, PR19 twelve findings folded; `katorthoma_proximity` flag-off genuinely
  untouched, pinned). Two mentor-ruled **scope notes published** 08-24 (oikeiosis-only deliberation
  bound on `ruling_faculty_state` AND on `katorthoma_proximity`'s deliberation term — "a
  conservative mislabel is still a mislabel"); the **epistemic-status map (Shape 1) is signed and
  shipped** (agent-card extension #24 `epistemic-status-map/v1`; its package's stale
  AWAITING-SIGNATURE header is deliberately left as written).
  **⚠ THE CONSOLIDATED FOUNDER WALK APPEARS NOT YET EXECUTED — unverified.**
  `operations/handoffs/founder/2026-08-23-atrf-ee-production-wave-FOUNDER-WALK.md` bundles: the
  Class-B RLS apply, the blast-radius/S4 migration, the completion-signals table + `api_keys`
  widening (TEST then production each), then push/deploy, then the optional endpoint activation.
  **No decision-log entry records any of the four migration steps being applied.** The deploy half
  landed anyway through ordinary pushes (EE-C1 live, endpoint dark, code omitted-fields-safe by
  construction), so nothing is broken — but the four schema steps should be presumed UNAPPLIED until
  the founder confirms. **Verify before relying either way; if unapplied, that walk is a queued
  founder-walked session.**
- **The extraction-provenance thread (08-24 → 08-26) — the window's sharpest production finding,
  now corrected and structurally instrumented.** Found by adversarial review of a mentor question
  about something else: `emitAccreditationTrustEvents` mints public trust-record events with **no
  extraction-provenance check** while its sibling orientation hook has exactly that guard; a
  supplied extraction is byte-indistinguishable downstream; the public `attests[1]` was inaccurate
  for that population. Mentor: "a live condition, not a future risk"; route (ii) of the gaming bar
  ruled AGAINST as worded; the fix ruled as three ordered items. Executed: **item 1, the honesty
  correction, LIVE 08-25** (edit 1: `TRUST_RECORD_ENVELOPE` `attests[1]` scoped + a new
  `does_not_attest` extraction-origin item incl. the F-2 coverage-gap commitment in the FUTURE
  tense + ADR-013 §8 amendment + five mutation-verified pins; edit 2: all three R18 surfaces;
  both production-verified by direct query). **Item 2a, credential hygiene, DONE 08-25** (both
  active `l1_supply` credentials — dead test artifacts — revoked; founder-verified
  `active_with_l1_supply = 0`; measured context: **zero supplied extractions across 3,200 recorded
  consults**). **Item 2, the signature-keyed provenance ledger — scoped across six mentor rounds,
  built, and LIVE record-only** (fact 2 in the box above; slices: 1 = tables applied TEST+prod
  08-26; 2 = consult write + record-only classification + PR24 sweep extension, activated 08-26,
  independent review zero findings; 3 = served `provenance_gaps` sibling field + attestation
  amendment (wording founder-signed: `"is in place"` → `"begins enforcing which events are
  minted"`) — **not built**; 4 = RETIRED (no credential action needed under the ruled resolution);
  5 = ENFORCE switch-on — gated on the C2 window + slice 3). The 404 gate ruling is in hand
  (relax to `domains.some(hasEvidence) || provenance_gaps.length > 0`, tied to the ledger's flag).
  **Item 2b carried** (`l1_supply` out of the `ecosystem` preset — re-tiered `code-critical`, no
  longer urgent). **Item 3, route (i), reframed as its own session** ("what is caller-supplied
  extraction for?") — openable on election. The 454 pre-stamp historical consults are repairable by
  no ledger (disclosed).
- **The close-hook content variation (IW-7 opening 3) — live in the founder's dogfood.**
  `GATE1_CLOSE_CONTENT_VARIATION_ENABLED=true` in `.claude/settings.local.json` since 08-26
  (confirmed present at this writing, first-hand). The close-turn reflect invitation now varies:
  guard-caution sessions get an appended paragraph; qualifying consult verdicts get a
  confidence-graded paragraph carrying the mentor's binding disclosure constraint (never presented
  as certainty). Live observation: the flag-on/no-signal path and **case 1 (guard-caution append)
  confirmed live organically**; **case 2 (consult-verdict path) still unobserved** — a founder
  decision is pending on whether to approve one disclosed constructed test case. Opening 2 (arming
  elicitation from Gate-2 verdicts) stays **HELD on the signal-quality gap** by ruling.
- **R2a's live surfaces (pushed 08-16):** the S10 trust-record payload's ninth `does_not_attest`
  item (B/M-A discriminative range), the M6 total-unknown-branch curation disclosure, the
  **recalibrated reflect Q1–Q6 strings** (mentor-vetted verbatim; Q1/Q2/Q3 replaced, Q5/Q6 appended,
  Q4 byte-identical; reflect-derived event-rate segmentation boundary = 2026-08-16), the corpus
  citation fixes (Meditations 4.26→7.9; DL 7.38→7.138–139), and the founder-signed R18 package (9
  placements). **R2b's four dark builds remain dark** (flags UNSET:
  `SUBSTRATE_JUSTICE_SELF_CIRCLE_NARROWING_ENABLED` (register D4+D1, the reducer),
  `SUBSTRATE_CLASSIFIER_SESSION_ID_SHAPING_ENABLED`, `SUBSTRATE_REFLECT_Q1_DETERMINATION_ENABLED`,
  `SUBSTRATE_TRAJECTORY_DISPERSION_ENABLED` (M-4-blocked)) plus P8a guard-path capture (built —
  readiness part (3)'s denominator) and the `agent_hold` sweep (since activated). **The R4
  founder-walked activation batch for these has NOT run** (ruled order: Q1 flag → classifier
  shaping → D4 walk last, beginning with a founder `SELECT` of `justice_floor_active`; the new
  false-hold observation window **LAST**; `SUBSTRATE_CREDENTIAL_LOOKUP_RETRY_ENABLED` still dark).
- **GS-ATRF-4 (the epistemic-status framework: observation/inference/assumption/unknown) is a
  formally-ruled fourth generation-step question, live end-to-end** (production `project_context`
  row updated 2026-08-19 founder-walked; `project-context.json` v1.4.0). The row was updated again
  2026-08-24 with the GS-CYB-1/GS-CYB-2 register pointers and the amended two-condition
  weights-constraint (an SQL-editor MacRoman encoding incident was caught and fixed; the SQL files
  are marked APPLIED — DO NOT RE-RUN; **TEST's row was NOT updated**).
- **The byte-identity guard is WINDOW-CONDITIONAL** (ruled M1, executed 2026-08-15): the logos
  byte-identity guard binds iff `GATE1_FALSE_HOLD_CAPTURE` is set — **it is absent from the dogfood
  config at this writing, so the guard is DORMANT** (honest log) and the six formerly-blocked items
  were released; the `stoic-brain.ts` freeze + SHA-256 pin remain **UNCONDITIONAL**.

### The window's method lessons (worth carrying, all with fresh instances)

- **Independent review keeps catching what first-hand review missed** — the slice-2 independent
  four-pass (clean, but demanded); R2b's 7/7 confirmed; the gaming-bar question rewrite (a 10-agent
  review found the draft reasoning toward "the blocked thing is not really blocked"); the D4
  completion's twelve folds; the ATRF/EE waves' two rounds each. PR19 is not a formality here.
- **The harness session id is not scoped to one conversation** — verify live behaviour against your
  own `CLOSE session=…` / scratchpad-path-derived id before attributing any `gate1.log` event (two
  sessions in a row initially misattributed a concurrent peer's events).
- **"A verified arithmetic operating on an unverified set"** (the runner's own diagnosis, twice) —
  re-derive every tally from the underlying set at report time; now a ruled standing-runner design
  constraint.
- **A slice close saying CLOSED does not mean the files are committed** — slice 2 found slice 1's
  entire file set untracked at open. Check `git status` against the close's file list.
- **Session limits keep truncating review fleets** — the fallback (complete first-hand, disclose,
  re-run independently after reset) is codified in PR19 and was exercised again (practice-family
  RLS review; one reader of this opener's own grounding fleet).

### The reflections-examination arc (a parallel governance thread, now essentially complete)

All 105 Sage Reflect close-turns (2026-07-19→08-22) were examined under a mentor-authored task
(findings record + stage-1 extraction in `operations/reflections-examination-2026-08/`;
independently fidelity-verified). Products now in force: **PR25**; the KG-EX2 knowledge-gap entry +
the standing-cache fifth failure-mode row; the IW-2 route (a) tooling (pre-commit checks); **six
reflections letters authored** (letters 1–6, the full §5-named candidate set — whether more exist is
undecided); item-3 leftovers (route-export + view-grants checks, the escalated view finding); the
item-4 combined scoping whose exposure-keyed design the mentor **ruled against** (route (c)'s
redirect phrase kept by founder election), which spawned the IW-7 three-openings thread → the
signal-quality-gap ruling → the close-hook content variation now live. Headline measured facts: 58%
of tool calls occur AFTER the session's single reflect turn; elicitations reach only 2.1% of
decision volume with completion **declining** (29.2%→7.0% Jul→Aug), traced to 63 identical
`http 503` `ELICIT-OUTAGE`s from the discernment route — **the 503-rate diagnosis is a named,
unstarted, founder-prioritised task**.

### Threads (updated)

1. **Trust Layer** — S1–S10 live under MEASURE; now also: M-4 corrections, the extraction-provenance
   correction + ledger (record-only), the recalibrated reflect Q1–Q6. Register: **D4+D1 built dark**
   (flag unset, walk pending), **P8a built**, **AE-3 scoping prompt authored 08-17 and apparently
   never run** (no close/decision record — verify), P1/P6/P7/P8b unchanged. S11 flip: still
   refused/readiness-gated; the new false-hold window (P6, scoped 08-15: v3/composed-regime records,
   P8a a hard precondition) starts only as the R4 batch's LAST step. Weights BLOCKED — GS-CYB-1 now
   binds it as a two-condition gate that PRECEDES examination.
2. **Agent circles / ATRF / EE / standing runner** — every outstanding mentor ruling request was
   answered by 08-26 (zero open ruling requests at this writing, so far as the record shows). Three
   sessions are **licensed and waiting on founder election, none self-starting**: the **standing-
   runner design session** (gate DISCHARGED by ruling 08-22; carries the largest named-input load —
   see the register: §5d deliberation reading, GS-CYB-1/2, GS-ATRF-3-first ordering, the conjectural
   entry type, Q-C2b, three post-1984 inputs, h5/h6/h7 findings, the re-derive-tallies constraint;
   its CLOSE gates on classifying the nine guardrail-rejected candidates); the **O-C Gate-3 design
   session** (licensed 08-23; agenda order ruled (c)→(d)→(a)/(b)/(e); `SUBSTRATE_LAYER3_ENABLED`
   stays unset, activation licensed at no gate); the **route (i) session**. The hegemonikon
   **uniformity-reads-as-stable family remains the one open ruling-shaped item** ("ruled together or
   not at all", untouched since 08-15).
3. **Website/practice** — the R20a perimeter completion + `/limitations` publication; the RLS arc
   (backlog: Class-B apply; Class-A rows 13–18; row 28 `environmental_context`; the 8
   non-`security_invoker` views; the escalated `vulnerability_flag_owner_view`); the journal
   pace-gate fix (elapsed-16h, timezone-free) and day-55 resolved-no-build; open product items:
   `api/mentor/private/reflect/route.ts:660` body-supplied `user_id` (**founder-ordered first** of
   the named-unbuilt list), the `/api/score/save` non-`action`-field screening gap, 15 of 22 routes
   without per-route invocation tests, the `mentor_profiles` AES-GCM decrypt failure (two routes
   hard-500 on the founder's row — surfaced 08-17, recoverability **not investigated**), the
   `sage-classify` invalid-response defect, `stoa-boundary` battery RED since 08-03 (83/3, ST6
   import allowlist — awaiting ruling #20; deliberately not silently greened).
4. **Reflections arc** — see above; remaining: case 2 observation, the founder's constructed-case
   decision, letters-beyond-six question.
5. **Future directions** (recorded, not build items): SagePals (+ the Prudence Group with P-A1–P-A4
   amendments; Stage-3 scoping session not convened), the engine-evolution examination (D1–D4 with
   ruled statuses; substrate-agnostic control plane §4.4; post-1984 complexity rulings), the
   incubation entry type.

### The 0h launch hold-point

**Unchanged in substance.** P2's verdict stands; the founder's three branches remain the standing
decision. The founder's 2026-08-22 sequencing stands: **all current tasks complete before any 0h
assessment.** Nothing in this window bears on the call. **Weights BLOCKED throughout** (now with
GS-CYB-1's two-condition gate). **The Q1 hard constraint holds: the loop proposes; it never
executes** — and the bounded run that tested it is closed with that constraint never breached.

---

## Standing queue (none self-start; the founder sequences)

*Live watches / in-flight:*
0. **The provenance-ledger C2 readiness watch** — founder-run, in the Vercel function logs, started
   2026-08-26; two consecutive weeks of 100% resolution is slice 5's entry condition (~09-09 at the
   earliest). Nothing for ordinary sessions to do but not-perturb: `emission-hooks.ts`,
   `provenance-*.ts`, `/api/reason`'s write block, and the sweep handler are the watched surfaces.
1. **Close-hook case 2** — awaiting either an organic qualifying consult verdict or the founder's
   decision on one disclosed constructed test case; confirming it fully closes IW-7 opening 3.

*Founder-electable next sessions (fully unblocked, prompts/scopes in hand):*
2. **Provenance-ledger slice 3** (served `provenance_gaps` field + the signed §10 attestation
   amendment + ADR/pins; wording locked) — its own `code-critical` session; no prompt file authored
   yet (the slice-2 close's inheritance section is the spec).
3. **The ATRF-EE founder walk** — **first VERIFY whether any of its four migration steps already ran
   (no record exists)**; if not: Class-B RLS apply, blast-radius/S4 columns, completion-signals
   table + `api_keys` widening, optional endpoint activation
   (`2026-08-23-atrf-ee-production-wave-FOUNDER-WALK.md`).
4. **The R4 activation batch** (R2b flags in ruled order; Q1 determination first, D4 reducer walk
   last; `SUBSTRATE_CREDENTIAL_LOOKUP_RETRY_ENABLED`; the new false-hold window **LAST**;
   `SUBSTRATE_TRAJECTORY_DISPERSION_ENABLED` excluded — M-4-blocked).
5. **The standing-runner design session (R8)** — licensed; heaviest named-input load; its close
   gated on the nine-candidate classification. **Completing the ATRF row of the named-input register
   is owed before it opens** (the register's own honest-scope note).
6. **The O-C Gate-3 design session** — licensed 08-23, ruled agenda order in hand.
7. **Route (i)** — "what is caller-supplied extraction for?" (the `l1_supply` population query has
   run: zero live exposure).
8. **The view-grants remediation migration** live apply + a decision on the escalated
   `vulnerability_flag_owner_view` (probe vs. Critical item).
9. **Class-B RLS `§APPLY`** (if not folded into item 3's walk).
10. **AE-3 scoping** — prompt `2026-08-17-AE3-scoping-NEXT-SESSION-PROMPT.md`, apparently
    undischarged (**verify**; deferred out of R2b because its first ADR-014 precondition is an
    unmade design decision).
11. **M-5(b) identity threading** (pass `userId`/`sessionId` at call sites — activates the built
    vulnerability-flag write path) + the `triggered_rules` encryption migration (Critical+schema);
    the discernment-route **503-rate diagnosis** (elevated again by recent sessions' outage rates).
12. **R3** (`/api/reason` status-masking fix; input-cap Steps 2/3; the mentor-ruled projectContext
    removal — still do-not-build-unless-the-founder-elects); **R7** (permission-scrutiny items
    14–17, scoped + approved, not built); **item 2b** (`l1_supply` out of the ecosystem preset,
    `code-critical`, not urgent); **C5** (Stoa row-level reactivation guard, ruled M3, still
    unticked in the arc plan).
13. **Housekeeping:** fold 08-17→08-26 into CLAUDE.md (this opener's Part B is the source map);
    dispose of the untracked strays (incl. the two acted-on inbox RTFs); TEST's `project_context`
    row parity; the `watching/handler.ts:10-14` stale "DARK" comment; the `llms.txt:419` prose NIT
    (deliberately unfixed — different concept from the EE-C1 wire string).

*Held / gated (do not open):* slice 5 (C2 window + slice 3); IW-7 opening 2 (signal-quality gap, by
ruling); Spec 4 dispersion (M-4 restoration); the hegemonikon uniformity family (unruled); melete
(needs an agent-side rehearsal surface); the Prudence Stage-3 scoping session; Layer 3 activation
(licensed at no gate); Resend/ST7; S11 flip; the 0h call; **weights** (GS-CYB-1 two-condition gate).

---

## Part C — The trust-layer harness + its capabilities (deltas since 08-15)

On top of the 08-15 opener's Part C (all of which stands):

- **The trust record's honest-claims envelope grew twice**: the B/M-A discriminative-range
  `does_not_attest` item (R2a, live 08-16) and the extraction-origin item + scoped `attests[1]`
  (08-25) — the envelope now explicitly does NOT attest that submitted artifacts' extractions were
  server-produced, and commits (future tense) to surfacing provenance-refused mints as named
  coverage gaps once enforcement exists.
- **The provenance ledger is the first mint-time provenance instrument** — record-only today;
  its classification function is the exact function slice 5 will enforce with (built pure for that
  reason). The refusal record is deliberately NOT a trust event (`artifact_ref NOT NULL` invariant).
- **The reflect close-turn is recalibrated for the agent practitioner** (Q1–Q6, mentor-vetted
  verbatim) and its **invitation content now varies** with the session's own guard/consult signals
  (dogfood-only flag). The reflect-derived event-rate segmentation boundary is 2026-08-16.
- **`disposition_stability` no longer certifies the top rung and no longer displays at the top
  rungs**; its mean-floor correction means uniform poor readings cannot read as `advanced`.
- **`ruling_faculty_state` + `katorthoma_proximity`'s deliberation term carry published oikeiosis-
  only scope notes**; the deliberation predicate is now substantive (`hasGenuineDeliberation`), an
  unflagged live change on the shared measured surface — the doctrinal question (is oikeiosis-only
  the right reading of a deliberating ruling faculty?) is map §5d, a named standing-runner input,
  engine-class `code-critical` when resolved.
- **PR22 trailers, PR25 comment-check, path-scoped commits, and the five pre-commit checks** now
  frame every commit a session makes.

*Deeper detail:* `operations/agent-circles-2026-08/2026-08-26-provenance-ledger-SCOPE.md` (the ruled
design); `2026-08-23-evaluative-engine-status-documentation-map.md` (the engine's per-output
epistemic-status map, incl. §5b/§5d); the ATRF sixteen-rulings verbatim; the priority index's gates
table + named-input register.

---

## Part D — Working inside the dogfooded harness (standing context)

Unchanged in substance — you are running inside the harness you help build; frames are advisory
context, never commands; routine build acts examined "contrary — no kathekon factors extracted"
remain the known false-positive class (and the EE-C1 wording you'll see is the mentor's own ruled
formulation: an absence-of-extraction basis claim, not a factual accusation). Additions:

- **The byte-identity guard is dormant** while `GATE1_FALSE_HOLD_CAPTURE` stays unset — but the
  `stoic-brain.ts` freeze + SHA pin are unconditional. Editing `stoic-brain.ts` still breaks two
  measured surfaces.
- **28s consult timeouts remain constant and expected** (fail-open-honest); the elicitation path
  additionally suffers the 503-outage class (declining completion — see the measurement). Do not
  diagnose a credential from a 401 run without DB-level facts (the standing lesson).
- **Verify your own session id before attributing any `gate1.log` event** (`CLOSE session=…`
  cross-checked against your scratchpad path) — concurrent sessions share the log.
- **The close turn may now carry a session-specific paragraph** (guard-caution or confidence-graded
  consult content). Engage it genuinely; its confidence disclosures are binding design, not flavour.

---

## Part E — Confirm the standard opening (state these, briefly, before the task)

Tier/work-category; model (state it; disclose any mid-session switch); risk classification 0d-ii +
AC7/PR6/**PR19** (independent review REQUIRED)/**PR20** (mechanism facts named + timestamp-checked)
/**PR21** (reflect-harvest)/**PR22** (Model:/Effort: trailers)/**PR23** (memory-first)/**PR24**
(retention parity)/**PR25** (verification claims carry their check); the concurrency check
(`ListAgents` + path-scoped commits); hold-point P0 0h; status vocabulary; the founder-walked
discipline (commit-and-push BEFORE any flag flip; this environment holds no production admin
credential — prod mints go through the founder's browser-session JWT); bare-SQL verification blocks
(and the SQL-editor MacRoman lesson: pure-ASCII payloads, `chr()` for typography, length-count
verification).

---

## Part F — Now state the task

With the foundations in place, **state the task** (if you haven't already). The session will then:
declare its tier + risk for that task, read the task-specific deliverables (Tier 2), check the
standing queue for collisions with in-flight watches (the C2 window; case 2), and proceed under the
protocol — grounded, honest, and scope-aware.

*Reusable across sessions. Update when the ground state shifts materially (a licensed session opens,
slice 3/5 lands, the ATRF-EE walk runs, a new program adopts) — archive the prior version to
`archive/` with its date, per this file's own convention. The 0h call remains the founder's.*
