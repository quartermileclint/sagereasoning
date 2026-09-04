/**
 * r20a-invocation-guard.test.ts — Automated invocation test for the R20a perimeter.
 *
 * PURPOSE: Prevents the 5-session dead-code gap (SS3) from recurring.
 * detectDistress() was defined on 6 Apr but never called until 11 Apr.
 * This test reads the source files of every R20a-perimeter route and
 * confirms the canonical safety function is both imported AND called.
 *
 * Two registries (per AC5 + Option A build arc 2026-05-28 spec §5):
 *
 *   HUMAN_FACING_POST_ROUTES (route-level members; see the array itself):
 *     route-level pattern → `await enforceDistressCheck(detectDistressTwoStage(...))`
 *
 *   SUBSTRATE_GATE_ROUTES (added under D-R20A-OPTIONA-S2-CALLING-WIRED-2026-05-28):
 *     substrate-gate pattern → `await enforceLayer2R20aGate({ text, ... })`
 *     Calling is the first member of this registry.
 *     The substrate-gate path reuses A7 which internally invokes
 *     detectDistressTwoStage via SafetyCriticalCallParams — same Haiku
 *     classifier, different surface call. AC5's intent (the safety function
 *     runs on the route) is preserved.
 *
 * This is an INVOCATION test, not a FUNCTIONAL test. It verifies the
 * function exists in the execution path — not that it returns correct
 * output. The eval suite (r20a-classifier-eval.ts) handles functional
 * testing against the live API; per-route functional tests live under each
 * route's `__tests__/` folder (e.g. api/calling/__tests__/r20a-invocation.test.ts).
 *
 * No API key required. No network calls. Runs at build time.
 *
 * Run: npx tsx src/lib/__tests__/r20a-invocation-guard.test.ts
 *
 * Rules served: R20a (vulnerable user detection and redirection); AC4 (invocation
 * testing); AC5 (the perimeter).
 *
 * ⚠ NO PERIMETER COUNT IS WRITTEN IN THIS DOCSTRING, DELIBERATELY, AND ONE MUST
 * NOT BE ADDED. The count lived here and went stale THREE times: it read
 * "eight + one = nine" for months; was corrected to "20 + 2 = 22" on 2026-08-12
 * and was wrong within days; was corrected to "42 + 2 = 44" on 2026-08-18 and
 * was wrong again once /api/score/save joined on 2026-09-02 (the true figure at
 * that point being 43 + 2 = 45). The third staleness was found on 2026-09-04 by
 * a session that happened to read this file, not by any scheduled process.
 *
 * A WARNING NOT TO HAND-MAINTAIN THE NUMBER WAS ALREADY PRESENT AND DID NOT
 * PREVENT THE THIRD RECURRENCE — an instruction embedded in the drifting
 * artifact does not arrest the drift, which is the same lesson manifest.md §AC5
 * recorded when it stopped hand-enumerating route membership for the same
 * reason. So this is now ENFORCED rather than requested: the
 * `docstring carries no hand-maintained perimeter count` case below fails if a
 * count is reintroduced into this header. Derive it from
 * HUMAN_FACING_POST_ROUTES.length and SUBSTRATE_GATE_ROUTES.length.
 * Knowledge gaps addressed: KG3, KG7 (build-to-wire gap pattern).
 */

import * as fs from 'fs'
import * as path from 'path'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string): void {
  if (condition) { passed++ } else { failed++; failures.push(label); console.error('FAIL: ' + label) }
}

// ---------------------------------------------------------------------------
// Human-facing POST routes that MUST call detectDistressTwoStage.
//
// This list is the authoritative registry. When a new human-facing POST
// endpoint is added, it MUST be added here. If it is not added, this test
// will not catch missing safety checks on the new route — which is its own
// failure mode. The pre-commit checklist (verification-framework.md) covers
// that case: "Safety-critical function: at least one endpoint calls the
// function, and a test confirms the end-to-end path."
//
// Agent-facing endpoints (score-iterate, assessment/*, baseline/agent) are
// excluded because they process agent output, not human distress input.
//
// Stoa ST4 (2026-08-03, recorded decision): src/app/api/stoa/declare/route.ts
// is excluded for the same reason — its what_i_bring/what_i_seek/
// contact_channel/tags fields are agent-authored text submitted over a
// credential-authenticated API call (Bearer practice credential), not human
// free text through a cookie/JWT session. Its human counterpart,
// src/app/api/mentor/stoa/route.ts, IS the perimeter member above for this
// exact field set, because there the same fields are typed by a human.
// ---------------------------------------------------------------------------

const HUMAN_FACING_POST_ROUTES = [
  'src/app/api/score/route.ts',
  'src/app/api/score-decision/route.ts',
  'src/app/api/score-document/route.ts',
  'src/app/api/score-scenario/route.ts',
  'src/app/api/score-social/route.ts',
  'src/app/api/reason/route.ts',
  'src/app/api/reflect/route.ts',
  'src/app/api/mentor/private/reflect/route.ts',
  // gap-#4 remediation (2026-05-31; AC5 ninth/tenth-route protocol) — the two
  // journal routes accept human free-text and store it; both now screen via
  // `await enforceDistressCheck(detectDistressTwoStage(...))` before storing.
  'src/app/api/mentor/journal-feed/route.ts',
  'src/app/api/journal/route.ts',
  // Foundation Completion Session 2 (2026-07-07; AC5 eleventh-route protocol;
  // closes the S8b 0h-exit blocker (c) — the S8a "inside-perimeter exception"):
  // score-conversation joins the route-level pattern FLAG-GATED behind
  // SUBSTRATE_SCORE_CONVERSATION_R20A_ENABLED (dark until the founder-walked
  // activation; flag-off is byte-identical). The AC5-mandated call pattern is
  // asserted below like every other route-level entry; the flag posture is
  // asserted in FLAG_GATED_ROUTE_LEVEL_ROUTES + the per-route test at
  // src/app/api/score-conversation/__tests__/r20a-invocation.test.ts.
  'src/app/api/score-conversation/route.ts',
  // Stoa ST3 (2026-08-03; AC5 twelfth-route protocol): the Stoa declaration
  // route accepts human free text (what_i_bring / what_i_seek /
  // contact_channel — a person's own words about what they carry and what
  // they need) on POST + PATCH and screens it via the mandated
  // `await enforceDistressCheck(detectDistressTwoStage(...))` BEFORE any
  // store write. Dark behind SUBSTRATE_STOA_ENABLED (the whole route 503s
  // flag-off — no separate R20a flag; the route never exists live without
  // its check). The browse route (/api/stoa/entries) takes no free text and
  // stays outside the perimeter (the recorded AC5 decision's other half).
  'src/app/api/mentor/stoa/route.ts',
  // Stoa ST6 (2026-08-03; AC5 thirteenth route-level protocol; the Q12
  // exception): the draft mirror-reading route accepts the SAME human
  // free-text class (what_i_bring / what_i_seek / contact_channel), this
  // time pre-publish, and screens it via the mandated
  // `await enforceDistressCheck(detectDistressTwoStage(...))` BEFORE the
  // mirror-reading LLM call ever fires. Dark behind SUBSTRATE_STOA_ENABLED
  // AND SUBSTRATE_STOA_DRAFT_REFLECT_ENABLED (both required).
  'src/app/api/mentor/stoa/draft-reflect/route.ts',
  // S7 (2026-08-12; AC5 FOURTEENTH route-level protocol) — the primal-impulse
  // examination tool.
  //
  // *** A RULED DEPARTURE FROM FAMILY PRECEDENT (mentor ruling B3). *** Every
  // other Remaining-Principles human-practitioner tool (/premeditatio,
  // /hupexairesis, /oikeiosis, /view-from-above, /morning, /sage-compass,
  // /logos) sits OUTSIDE this perimeter, carrying SupportFooter as its crisis
  // exit. /impulse is INSIDE it, deliberately, because it "deliberately
  // elicits shame and agonia in the practitioner's own words, beside grief,
  // envy, and jealousy" — `aischyne` (shame) and `agonia` (dread) are named,
  // selectable sub-species of the exercise — and "the design premise is that
  // the practitioner should not suppress this material, which means the tool
  // is doing exactly what the perimeter exists to catch when it fires
  // genuinely."
  //
  // Recorded here as well as in the route, in
  // src/app/api/mentor/impulse/r20a.ts, and in the decision-log entry, because
  // a reader comparing this tool to its siblings would otherwise read the
  // membership as an error. DO NOT REMOVE THIS ENTRY on the assumption it was
  // added by mistake.
  //
  // Screens BOTH write paths (POST create + PATCH revise — a revision carries
  // the same free text) via the mandated
  // `await enforceDistressCheck(detectDistressTwoStage(...))`, before the
  // gate's LLM call AND before the route's own field validation. Dark behind
  // SUBSTRATE_IMPULSE_R20A_ENABLED; flag-off is byte-identical.
  'src/app/api/mentor/impulse/route.ts',
  // ── GAP CLOSURE (2026-08-17; AC5 fifteenth through EIGHTEENTH route-level
  // protocol). FOUR routes found in this pass; PR19 then found TWO MORE (the
  // nineteenth + twentieth block below), so the gap totals SIX. Each accepts human
  // practitioner free text behind requireAuth (up to TEXT_LIMITS.medium per
  // field) with NO distress check of any kind, and each absent from this
  // registry — so this battery could not see them.
  //
  // HOW THE GAP AROSE, recorded so the shape is not read as intentional: the
  // 13 sibling skill routes are built on createContextTemplateHandler, which
  // screens at context-template.ts:112. sage-classify and sage-prioritise have
  // their OWN route.ts and inherited nothing. The passion routes never had a
  // shared handler to inherit from.
  //
  // TWO DIFFERENT GROUNDS FOR MEMBERSHIP — do not flatten them:
  //   • passion-classify / passion-log (and the two baseline-response routes)
  //     are ARGUED inside by extending the reasoning of the mentor's B3 ruling.
  //     ⚠ B3 IS SCOPED TO /impulse (S7) ALONE — it says nothing about these
  //     routes. The extension is the BUILDER'S judgement, not a mentor ruling;
  //     ratification is an open mentor question (see r20a-gap-closure.ts, which
  //     states this provenance before making the argument). The argument: their
  //     whole subject is the practitioner's own fear, anger, grief and shame,
  //     and passion-log.false_judgement asks specifically for the belief that
  //     drove it — arguably a purer instance of B3's reasoning than /impulse.
  //   • sage-classify / sage-prioritise are inside on the ordinary ground that
  //     every human-facing free-text evaluation route is inside (the five
  //     score routes, /reflect, the journal routes). A practitioner in crisis
  //     does not confine their words to the routes designed to receive them.
  //
  // The recorded exclusion for the OTHER Remaining-Principles tools
  // (/premeditatio, /hupexairesis, /oikeiosis + /extension, /view-from-above,
  // /morning, /sage-compass, /logos) is UNCHANGED — they remain outside by
  // family precedent, carrying SupportFooter. That standing AC5 question is
  // NOT resolved by this closure.
  //
  // All SIX share ONE flag (SUBSTRATE_R20A_GAP_CLOSURE_ENABLED) rather than
  // one each: they are one remediation of one gap, and a half-closed safety
  // perimeter is worse than a fully-open one because it invites the belief the
  // gap was handled. See src/lib/r20a-gap-closure.ts for the full rationale.
  'src/app/api/mentor/passion-classify/route.ts',
  'src/app/api/mentor/passion-log/route.ts',
  'src/app/api/skill/sage-classify/route.ts',
  'src/app/api/skill/sage-prioritise/route.ts',
  // ── The SAME gap closure, two MORE routes found by the PR19 review of the
  // first four (AC5 nineteenth + twentieth route-level protocol). Both accept
  // an array of practitioner-authored free-text `answer` fields with NO length
  // validation and concatenate them straight into the runSageReason LLM input.
  //
  // The finding that settles it: /api/score-scenario accepts the SAME field
  // shape (a practitioner's free-text answer to a posed question) and DOES call
  // enforceDistressCheck(detectDistressTwoStage(...)). These two did not. The
  // asymmetry between siblings was the tell.
  //
  // Founder-only auth is NOT an exemption for the /private twin:
  // /api/mentor/private/reflect is founder-only and is already a member.
  //
  // ⚠ THE COUNT HAS MOVED THREE TIMES: 2 → 4 (second pass) → 6 (PR19's third,
  // independent pass) → 8 (PR19's FOURTH pass, reviewing the six-route
  // activation, found two more: gap4 + founder-facts, both founder-only).
  // Each pass over a different slice of api/ found more. DO NOT treat 8 as
  // proven final. There is no filesystem-level exhaustiveness check in this
  // file (see the named follow-up in the gap-closure decision-log entry) —
  // this registry is purely additive, so a structurally identical NINTH route
  // would not be caught by anything here.
  'src/app/api/mentor-baseline-response/route.ts',
  'src/app/api/mentor/private/baseline-response/route.ts',
  'src/app/api/mentor/gap4/route.ts',
  'src/app/api/mentor/private/founder-facts/route.ts',
  // ── PERIMETER COMPLETION (2026-08-18; AC5 twenty-first through FORTY-SECOND
  // route-level protocol). TWENTY routes, added in ONE edit with all three
  // floors, closing the sweep out to zero unclassified in-scope routes.
  //
  // These are NOT another "gap found by re-reading a slice by hand". They are
  // the complete remainder produced by the filesystem sweep below — the
  // mechanism the mentor RULED a prerequisite precisely because five manual
  // passes and one automated pass had each undercounted. Every one of them
  // failed the backstop assertion; the list closed only when the backstop went
  // green. That is the difference between this pass and its four predecessors.
  //
  // THREE GROUNDS, and the record should not flatten them:
  //
  //   • THE PRACTICE FAMILY (premeditatio, hupexairesis, oikeiosis +
  //     /extension, view-from-above, morning, sage-compass) — RULED IN
  //     2026-08-17. This REVERSES the recorded family precedent that every
  //     comment above still describes as standing, so the older text is
  //     superseded rather than wrong-when-written. The mentor, verbatim: the
  //     precedent "reflects the original scoping of B3 to /impulse alone, not a
  //     considered judgement that the practice family is lower-risk. It is not
  //     lower-risk. It is the family where the material is most likely to
  //     surface acute distress." /view-from-above was named the clearest case —
  //     a route for reframing catastrophic loss carrying only a static footer:
  //     "That is the wrong configuration."
  //
  //     /logos is the one genuine non-member and is NOT an omission: it is a
  //     static page with no route.ts and no free-text input, so it never enters
  //     the sweep at all. Confirmed first-hand, not assumed.
  //
  //   • /api/evaluate — RULED 2026-08-18, and the FIRST time the B3 asymmetry
  //     argument resolved toward REMOVING a surface from public availability
  //     rather than adding it to the perimeter. It was an UNAUTHENTICATED
  //     free-text Stoic evaluator: proximity rating and improvement path
  //     returned to anonymous visitors with no screening. It is a member here
  //     only BECAUSE it was first gated behind requireAuth. Screening it while
  //     it remained anonymous was forbidden by name — "Do not add distress
  //     screening to the unauthenticated surface as a standalone fix" — so
  //     ⚠ DO NOT EVER RE-OPEN THIS ROUTE TO ANONYMOUS ACCESS AND LEAVE IT HERE.
  //     Membership and the auth gate stand or fall together.
  //
  //   • THE REMAINDER — the mentor-examination and orchestration surfaces the
  //     sweep surfaced: both journal-week routes, both baseline routes,
  //     mentor-appendix, mentor-profile, compose, execute, founder/hub, and the
  //     three ring-proof routes. Inside on the ordinary ground that every
  //     human-facing free-text surface is inside. Founder-only is not an
  //     exemption (the gap4 / founder-facts / private-reflect precedent).
  //
  // TWO OF THESE WERE INVISIBLE TO THE OLD auth-based PREDICATE and surfaced
  // only when it was rebuilt: /api/execute and /api/compose authenticate via
  // supabase.auth.getUser() rather than requireAuth. That is the ruling's point
  // about proxies, demonstrated a second time within the hour of it being made.
  //
  // THE THREE RING-PROOF ROUTES SCREEN UNCONDITIONALLY — no feature flag — so
  // they are deliberately absent from FLAG_GATED_ROUTE_LEVEL_ROUTES below.
  // They already called the AC5 pattern correctly before this session; they
  // were simply never registered, so nothing asserted it and a refactor could
  // have deleted the check with this suite still green.
  'src/app/api/mentor/premeditatio/route.ts',
  'src/app/api/mentor/hupexairesis/route.ts',
  'src/app/api/mentor/oikeiosis/route.ts',
  'src/app/api/mentor/oikeiosis/extension/route.ts',
  'src/app/api/mentor/view-from-above/route.ts',
  'src/app/api/mentor/morning/route.ts',
  'src/app/api/mentor/sage-compass/route.ts',
  'src/app/api/evaluate/route.ts',
  'src/app/api/mentor-journal-week/route.ts',
  'src/app/api/mentor/private/journal-week/route.ts',
  'src/app/api/mentor-baseline/route.ts',
  'src/app/api/mentor/private/baseline/route.ts',
  'src/app/api/mentor-appendix/route.ts',
  'src/app/api/mentor-profile/route.ts',
  'src/app/api/compose/route.ts',
  'src/app/api/execute/route.ts',
  'src/app/api/founder/hub/route.ts',
  'src/app/api/founder/hub/ring-proof/route.ts',
  'src/app/api/mentor/ring/proof/route.ts',
  'src/app/api/support/agent/proof/route.ts',

  // ── RULED 2026-08-31, built, PR19-reviewed, REVERTED, and rebuilt ────────
  // /api/score/save screens TEN caller-supplied fields — every one capable of
  // carrying prose, enumerated from the route's destructure against
  // supabase-v3-migration.sql rather than from a criterion the code does not
  // enforce (the mentor's A2b reasoning; the earlier seven-field scope rested
  // on "engine outputs echoed back by the client", which does not partition the
  // fields and which the route cannot enforce because a caller can POST here
  // directly with /api/score never executing).
  //
  // THE FIRST IMPLEMENTATION WAS REVERTED, and the reason belongs here rather
  // than only in the record: it returned the distress redirect as HTTP 200, the
  // calling page reads 200 as success, and a practitioner writing acute distress
  // into `emotional_state` received a silently unsaved record, the word "saved",
  // and no crisis resources — worse than the unscreened state it replaced. This
  // route therefore returns 422 — the ONLY non-200 distress redirect in the
  // codebase (checked 2026-08-31 by parsing the argument span of every
  // NextResponse.json call containing `distress_detected: true`: 45 calls, 44 of
  // them 200) — and score/page.tsx discriminates on the BODY. Both halves are
  // pinned: the status in the gap-closure wiring battery's ROUTE_WIRING row,
  // the page in score-save-response.test.ts + the page structural pin.
  'src/app/api/score/save/route.ts',
]

// ---------------------------------------------------------------------------
// Flag-gated route-level routes — route-level-pattern perimeter members whose
// check is additionally gated behind a per-route feature flag (dark-build
// posture; the flag defaults OFF and activation is a founder-walked Critical
// step). Each entry pairs the route with the exported flag-check function it
// must import AND call — mirroring the SUBSTRATE_GATE_ROUTES flag assertions.
// The flag lives with its mechanism (see src/lib/score-conversation-r20a.ts).
// ---------------------------------------------------------------------------

interface FlagGatedRouteLevelEntry {
  /** Route source path relative to website/ root. */
  readonly route: string
  /** The exported flag-check function name the route imports + calls. */
  readonly flag: string
  /** The module (import-path fragment) the flag is imported from. */
  readonly flagSource: string
}

const FLAG_GATED_ROUTE_LEVEL_ROUTES: readonly FlagGatedRouteLevelEntry[] = [
  {
    route: 'src/app/api/score-conversation/route.ts',
    flag: 'isScoreConversationR20aEnabled',
    flagSource: 'score-conversation-r20a',
  },
  {
    // Stoa ST3: the route's flag IS the surface flag (SUBSTRATE_STOA_ENABLED
    // via isStoaEnabled) — flag-off the route 503s before any work, so the
    // perimeter check is unconditional on the flag-on path.
    route: 'src/app/api/mentor/stoa/route.ts',
    flag: 'isStoaEnabled',
    flagSource: 'stoa-store',
  },
  {
    // Stoa ST6: gated behind BOTH the base Stoa flag and its own dedicated
    // sub-flag — two entries, same route, one per flag (the interface only
    // carries one flag per entry; the loop below checks each independently).
    route: 'src/app/api/mentor/stoa/draft-reflect/route.ts',
    flag: 'isStoaEnabled',
    flagSource: 'stoa-store',
  },
  {
    route: 'src/app/api/mentor/stoa/draft-reflect/route.ts',
    flag: 'isStoaDraftReflectEnabled',
    flagSource: 'stoa-draft-reflect',
  },
  {
    // S7 /impulse — the flag lives with its mechanism in a module COLOCATED
    // with the route (src/app/api/mentor/impulse/r20a.ts) rather than in
    // src/lib/, so the whole tool reverts as one unit. Imported as './r20a';
    // route.ts cannot export it itself (Next.js rejects non-handler exports
    // from route.ts at build — memory: nextjs-route-export-validation).
    route: 'src/app/api/mentor/impulse/route.ts',
    flag: 'isImpulseR20aEnabled',
    flagSource: './r20a',
  },
  // ── GAP CLOSURE (2026-08-17): all SIX share ONE flag, deliberately, so the
  // perimeter cannot be half-closed by a forgotten flag. Unlike /impulse the
  // module lives in src/lib/ rather than colocated, because it serves routes in
  // two different trees (api/mentor/ and api/skill/).
  {
    route: 'src/app/api/mentor/passion-classify/route.ts',
    flag: 'isR20aGapClosureEnabled',
    flagSource: 'r20a-gap-closure',
  },
  {
    route: 'src/app/api/mentor/passion-log/route.ts',
    flag: 'isR20aGapClosureEnabled',
    flagSource: 'r20a-gap-closure',
  },
  {
    route: 'src/app/api/skill/sage-classify/route.ts',
    flag: 'isR20aGapClosureEnabled',
    flagSource: 'r20a-gap-closure',
  },
  {
    route: 'src/app/api/skill/sage-prioritise/route.ts',
    flag: 'isR20aGapClosureEnabled',
    flagSource: 'r20a-gap-closure',
  },
  {
    // PR19-found, same gap, same flag.
    route: 'src/app/api/mentor-baseline-response/route.ts',
    flag: 'isR20aGapClosureEnabled',
    flagSource: 'r20a-gap-closure',
  },
  {
    route: 'src/app/api/mentor/private/baseline-response/route.ts',
    flag: 'isR20aGapClosureEnabled',
    flagSource: 'r20a-gap-closure',
  },
  {
    // PR19-found, session's activation review, gap 7 — founder-only is not an
    // exemption.
    route: 'src/app/api/mentor/gap4/route.ts',
    flag: 'isR20aGapClosureEnabled',
    flagSource: 'r20a-gap-closure',
  },
  {
    // PR19-found gap 8 (POST) + builder-found while wiring it (PUT). Two
    // guarded handlers, ONE flag import — a single entry covers both per this
    // interface's per-route (not per-handler) shape; the per-route source-grep
    // below matches once regardless of how many exported functions call it.
    route: 'src/app/api/mentor/private/founder-facts/route.ts',
    flag: 'isR20aGapClosureEnabled',
    flagSource: 'r20a-gap-closure',
  },
  // ── PERIMETER COMPLETION (2026-08-18): SEVENTEEN of the twenty new members
  // ride the SAME shared flag, for the same reason it was shared in the first
  // place — one remediation of one perimeter, and a half-closed perimeter is
  // worse than an open one because it invites the belief the gap was handled.
  //
  // ⚠ THE OTHER THREE (founder/hub/ring-proof, mentor/ring/proof,
  // support/agent/proof) ARE ABSENT ON PURPOSE, NOT BY OVERSIGHT. They screen
  // UNCONDITIONALLY — no flag — so they are live-screening today, ahead of the
  // activation. Adding them here would assert a flag call that does not exist
  // and go red. DO NOT "fix" their absence by adding entries; the correct
  // reading is that they are strictly safer than their flag-gated siblings.
  { route: 'src/app/api/mentor/premeditatio/route.ts', flag: 'isR20aGapClosureEnabled', flagSource: 'r20a-gap-closure' },
  { route: 'src/app/api/mentor/hupexairesis/route.ts', flag: 'isR20aGapClosureEnabled', flagSource: 'r20a-gap-closure' },
  { route: 'src/app/api/mentor/oikeiosis/route.ts', flag: 'isR20aGapClosureEnabled', flagSource: 'r20a-gap-closure' },
  { route: 'src/app/api/mentor/oikeiosis/extension/route.ts', flag: 'isR20aGapClosureEnabled', flagSource: 'r20a-gap-closure' },
  { route: 'src/app/api/mentor/view-from-above/route.ts', flag: 'isR20aGapClosureEnabled', flagSource: 'r20a-gap-closure' },
  { route: 'src/app/api/mentor/morning/route.ts', flag: 'isR20aGapClosureEnabled', flagSource: 'r20a-gap-closure' },
  { route: 'src/app/api/mentor/sage-compass/route.ts', flag: 'isR20aGapClosureEnabled', flagSource: 'r20a-gap-closure' },
  { route: 'src/app/api/evaluate/route.ts', flag: 'isR20aGapClosureEnabled', flagSource: 'r20a-gap-closure' },
  { route: 'src/app/api/mentor-journal-week/route.ts', flag: 'isR20aGapClosureEnabled', flagSource: 'r20a-gap-closure' },
  { route: 'src/app/api/mentor/private/journal-week/route.ts', flag: 'isR20aGapClosureEnabled', flagSource: 'r20a-gap-closure' },
  { route: 'src/app/api/mentor-baseline/route.ts', flag: 'isR20aGapClosureEnabled', flagSource: 'r20a-gap-closure' },
  { route: 'src/app/api/mentor/private/baseline/route.ts', flag: 'isR20aGapClosureEnabled', flagSource: 'r20a-gap-closure' },
  { route: 'src/app/api/mentor-appendix/route.ts', flag: 'isR20aGapClosureEnabled', flagSource: 'r20a-gap-closure' },
  { route: 'src/app/api/mentor-profile/route.ts', flag: 'isR20aGapClosureEnabled', flagSource: 'r20a-gap-closure' },
  { route: 'src/app/api/compose/route.ts', flag: 'isR20aGapClosureEnabled', flagSource: 'r20a-gap-closure' },
  { route: 'src/app/api/execute/route.ts', flag: 'isR20aGapClosureEnabled', flagSource: 'r20a-gap-closure' },
  { route: 'src/app/api/founder/hub/route.ts', flag: 'isR20aGapClosureEnabled', flagSource: 'r20a-gap-closure' },
  // score/save takes a DEDICATED flag, not the shared gap-closure one — the
  // /impulse shape (flagSource './r20a'). Two reasons, both from the PR19
  // review of the reverted first attempt: the shared flag is already true in
  // production, so deploy would equal activation and the live distress smoke
  // could not precede it (register M6); and the shared flag covers 26 routes,
  // so unsetting it to mitigate an incident HERE would also strip screening
  // from passion-log, passion-classify and view-from-above — the most
  // distress-likely tools in the product (register M2, the safety-inverting
  // rollback lever). The route still imports the shared HELPERS, so it keeps
  // its full ROUTE_WIRING row.
  { route: 'src/app/api/score/save/route.ts', flag: 'isScoreSaveR20aEnabled', flagSource: './r20a' },
]

// ---------------------------------------------------------------------------
// Substrate-gate routes — perimeter additions catching distress via the A7
// substrate gate (enforceLayer2R20aGate). A7 internally invokes
// detectDistressTwoStage via SafetyCriticalCallParams (Haiku), so the
// underlying safety classifier is the same; only the surface call pattern
// differs. Added under the Option A build arc (D-R20A-SC1-...-2026-05-28
// design spec §5.2 + §5.3); each entry here joins the R20a perimeter as the
// ninth+ route per AC5's ninth/tenth-route protocol.
//
// Each entry pairs a route source path with its per-route feature-flag name
// (the flag the route imports + calls from substrate/r20a-gate). The four
// test.each blocks below assert both surfaces — import + call — for each
// entry. Per-route flags decouple activations across endpoints per design
// spec §5.6 (Calling's flag is independent of Reflect-content's flag is
// independent of A7's flag).
// ---------------------------------------------------------------------------

interface SubstrateGateRouteEntry {
  /** Route source path relative to website/ root. */
  readonly route: string
  /** The exported flag-check function name the route imports + calls. */
  readonly flag: string
}

const SUBSTRATE_GATE_ROUTES: readonly SubstrateGateRouteEntry[] = [
  { route: 'src/app/api/calling/route.ts', flag: 'isCallingR20aEnabled' },
  { route: 'src/app/api/practice/reflect/route.ts', flag: 'isReflectR20aEnabled' },
]

// ---------------------------------------------------------------------------
// The function that MUST be present — both import and call
// ---------------------------------------------------------------------------

const REQUIRED_FUNCTION = 'detectDistressTwoStage'
const REQUIRED_IMPORT_SOURCE = 'r20a-classifier'

// Task 3 addition: the safety gate wrapper that enforces synchronous execution
const REQUIRED_GATE_FUNCTION = 'enforceDistressCheck'
const REQUIRED_GATE_SOURCE = 'constraints'

// Substrate-gate addition: the A7 entry point reused by Option A perimeter routes
const REQUIRED_SUBSTRATE_GATE_FUNCTION = 'enforceLayer2R20aGate'
const REQUIRED_SUBSTRATE_GATE_SOURCE = 'substrate/r20a-gate'
// Per-route flag names are carried on each SubstrateGateRouteEntry (see above).

// websiteRoot — original test resolves from __dirname (.. .. ..) i.e. website/.
const websiteRoot = path.resolve(__dirname, '..', '..', '..')

/**
 * Strip TS comments before any CALL-site check (ST3 fold, 2026-08-03 — a
 * live mutation proved the raw-source call checks were COMMENT-SATISFIABLE:
 * a route whose documentation quotes the AC5 pattern kept passing this guard
 * with the real call mutated away; the guard-non-vacuity lesson). Import
 * checks stay on raw source (import lines are code). Strictly tightening —
 * every registered route re-verified green after the fold.
 *
 * Known corruption classes (PR19 review, 2026-08-03 — none currently trip):
 * a '//' inside a non-protocol string literal truncates that line, and a
 * regex literal containing '/*' opens a phantom block comment. Both fail in
 * the SAFE direction (a swallowed real call site goes loudly red, never a
 * vacuous pass); revisit only if a registered route ever carries such text.
 */
function stripComments(ts: string): string {
  return ts.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
}

// ---------------------------------------------------------------------------
// R20a Safety Invocation Guard
// ---------------------------------------------------------------------------

// test.each(HUMAN_FACING_POST_ROUTES): '%s imports detectDistressTwoStage from r20a-classifier'
for (const routePath of HUMAN_FACING_POST_ROUTES) {
  const label = `R20a Safety Invocation Guard: ${routePath} imports detectDistressTwoStage from r20a-classifier`
  const fullPath = path.join(websiteRoot, routePath)
  assert(fs.existsSync(fullPath) === true, `${label} (file exists)`)

  const source = fs.readFileSync(fullPath, 'utf-8')

  // Check import statement
  const hasImport =
    source.includes(`import`) &&
    source.includes(REQUIRED_FUNCTION) &&
    source.includes(REQUIRED_IMPORT_SOURCE)

  assert(hasImport === true, `${label} (hasImport)`)
}

// test.each(HUMAN_FACING_POST_ROUTES): '%s calls detectDistressTwoStage (not just imports it)'
for (const routePath of HUMAN_FACING_POST_ROUTES) {
  const label = `R20a Safety Invocation Guard: ${routePath} calls detectDistressTwoStage (not just imports it)`
  const fullPath = path.join(websiteRoot, routePath)
  const source = stripComments(fs.readFileSync(fullPath, 'utf-8'))

  // Remove import lines to isolate call sites
  const lines = source.split('\n')
  const nonImportLines = lines.filter(
    (line) => !line.trim().startsWith('import ')
  )
  const bodySource = nonImportLines.join('\n')

  // The function must appear in the body (as a call, not just an import)
  const hasCall = bodySource.includes(REQUIRED_FUNCTION)

  assert(hasCall === true, label)
}

// test('No human-facing POST route is missing from the registry')
{
  const label = 'R20a Safety Invocation Guard: No human-facing POST route is missing from the registry'
  // This test is a reminder, not an automated check.
  // It documents the routes that were verified at the time of writing.
  // When adding a new human-facing POST endpoint, add it to
  // HUMAN_FACING_POST_ROUTES above.
  //
  // NO COUNT IS WRITTEN HERE ON PURPOSE. Derive it from
  // HUMAN_FACING_POST_ROUTES.length + SUBSTRATE_GATE_ROUTES.length.
  // (This line previously carried a hand-maintained total. It went stale again
  // on 2026-09-02, when /api/score/save joined the perimeter and the floors
  // beneath were bumped but the sentence was not -- the exact
  // sentence-disagrees-with-its-own-assertion failure recorded below.)
  //
  // ⚠ THE PROSE BELOW WAS STALE AND IS CORRECTED HERE. It read "20 route-level
  // ... = 22 routes overall" while the assertion beneath it already required
  // >= 22 ROUTE-LEVEL — so the sentence and the code it annotated disagreed by
  // two. It is fixed rather than extended because a running tally maintained by
  // hand has now drifted twice; the assertions below are the authority, and
  // this comment records the ARC, not the count.
  //
  // The arc: 8 (18 Apr 2026) + 2 journal (2026-05-31, gap-#4) + score-
  // conversation (2026-07-07) + 2 Stoa (2026-08-03, ST3 + ST6) + /impulse
  // (2026-08-12, S7 — the ruled departure from family precedent) = 14; + the
  // six 2026-08-17 gap-closure routes = 20; + gap4 and founder-facts, found by
  // PR19's fourth pass = 22; + the TWENTY found by the filesystem sweep on
  // 2026-08-18 = 42.
  //
  // Historical detail retained: (8 as of 18 April 2026 + the two
  // journal routes added 2026-05-31 under the gap-#4 remediation, AC5
  // ninth/tenth-route protocol + score-conversation added 2026-07-07 under
  // the AC5 eleventh-route protocol, flag-gated dark + the Stoa declaration
  // route added 2026-08-03 under the AC5 twelfth-route protocol, flag-gated
  // dark behind SUBSTRATE_STOA_ENABLED + the Stoa draft-reflect route added
  // 2026-08-03 (ST6, the Q12 exception) under the AC5 thirteenth-route
  // protocol, flag-gated dark behind SUBSTRATE_STOA_ENABLED AND
  // SUBSTRATE_STOA_DRAFT_REFLECT_ENABLED + /impulse added 2026-08-12 (S7)
  // under the AC5 fourteenth-route protocol, flag-gated dark behind
  // SUBSTRATE_IMPULSE_R20A_ENABLED — a RULED DEPARTURE from the
  // Remaining-Principles family precedent, see its entry above)
  // + 2 substrate-gate routes (Calling + Reflect-content added 2026-05-28
  // under Option A; see SUBSTRATE_GATE_ROUTES).
  //
  // The floors are bumped with each addition on purpose: a floor left at the
  // PREVIOUS count stops guarding the newest member (13 >= 13 still passes
  // after the 14th is deleted), which is the one most likely to be removed by
  // someone who reads its perimeter membership as a mistake.
  //
  // ⚠ BUMPED 2026-08-17 (14 -> 20, 5 -> 11) — AND THE MISS IS RECORDED, because
  // it is the exact failure this comment warns about. The six gap-closure routes
  // were added to both registries while these floors were left at 14 and 5, so
  // for a short window all six could have been deleted with the battery still
  // passing. Caught by an independent records-verification pass, not by the
  // battery itself. **Bump BOTH floors in the same edit as any registry
  // addition — the comment above is not advisory.**
  //
  // ⚠ BUMPED AGAIN, same day, same session (20 -> 22, 11 -> 13) — PR19's fourth
  // pass found gap4 + founder-facts. This time the floors were bumped in the
  // SAME edit that added the routes, per the standing lesson above.
  // ⚠ BUMPED 2026-08-18 (22 -> 42, 13 -> 30) — perimeter completion. All three
  // floors moved in the SAME EDIT that added the twenty routes and the
  // seventeen flag-pairs, per the standing lesson above. The flag-gated floor
  // moves by 17 rather than 20 because the three ring-proof routes screen
  // unconditionally and carry no flag entry — see the note on their absence in
  // FLAG_GATED_ROUTE_LEVEL_ROUTES.
  //
  // The flag-gated floor had ALSO never been bumped alongside a registry
  // addition before 2026-08-12, which is how it came to be the weakest of the
  // three. It is now bumped on the same line of reasoning as the other two.
  assert(HUMAN_FACING_POST_ROUTES.length >= 43, `${label} (>=43 route-level)`)
  assert(SUBSTRATE_GATE_ROUTES.length >= 2, `${label} (>=2 substrate-gate)`)
  // FLAG_GATED_ROUTE_LEVEL_ROUTES had no count assertion at all until 2026-08-12,
  // so a flag-gated entry could be deleted silently. The entry count exceeds the
  // distinct-route count because draft-reflect carries two flags, one entry
  // each. Both numbers are derived from the array, never written here.
  assert(FLAG_GATED_ROUTE_LEVEL_ROUTES.length >= 31, `${label} (>=31 flag-gated route-level flag-pairs)`)
}

// test('detectDistressTwoStage result is awaited (async safety)')
{
  const label = 'R20a Safety Invocation Guard: detectDistressTwoStage result is awaited (async safety)'
  // The classifier MUST run synchronously (awaited) before the response
  // is constructed. This checks that the call uses `await`.
  for (const routePath of HUMAN_FACING_POST_ROUTES) {
    const fullPath = path.join(websiteRoot, routePath)
    const source = stripComments(fs.readFileSync(fullPath, 'utf-8'))

    // Look for `await enforceDistressCheck(detectDistressTwoStage(` — the Task 3 pattern
    // OR the original `await detectDistressTwoStage(` pattern for backward compatibility
    const hasAwaitedCall =
      /await\s+enforceDistressCheck\s*\(\s*detectDistressTwoStage\s*\(/.test(source) ||
      /await\s+detectDistressTwoStage\s*\(/.test(source)

    assert(hasAwaitedCall === true, `${label} — ${routePath}`)
  }
}

// test.each(HUMAN_FACING_POST_ROUTES): '%s imports enforceDistressCheck from constraints (Task 3 — synchronous enforcement)'
for (const routePath of HUMAN_FACING_POST_ROUTES) {
  const label = `R20a Safety Invocation Guard: ${routePath} imports enforceDistressCheck from constraints (Task 3 — synchronous enforcement)`
  const fullPath = path.join(websiteRoot, routePath)
  assert(fs.existsSync(fullPath) === true, `${label} (file exists)`)

  const source = fs.readFileSync(fullPath, 'utf-8')

  // Check import of the safety gate wrapper
  const hasGateImport =
    source.includes('import') &&
    source.includes(REQUIRED_GATE_FUNCTION) &&
    source.includes(REQUIRED_GATE_SOURCE)

  assert(hasGateImport === true, `${label} (hasGateImport)`)
}

// test.each(HUMAN_FACING_POST_ROUTES): '%s calls enforceDistressCheck wrapping detectDistressTwoStage (Task 3 — compile-time gate)'
for (const routePath of HUMAN_FACING_POST_ROUTES) {
  const label = `R20a Safety Invocation Guard: ${routePath} calls enforceDistressCheck wrapping detectDistressTwoStage (Task 3 — compile-time gate)`
  const fullPath = path.join(websiteRoot, routePath)
  const source = stripComments(fs.readFileSync(fullPath, 'utf-8'))

  // The enforceDistressCheck(detectDistressTwoStage(...)) pattern must be present
  const hasGateCall = /enforceDistressCheck\s*\(\s*detectDistressTwoStage\s*\(/.test(source)

  assert(hasGateCall === true, label)
}

// -------------------------------------------------------------------------
// SUBSTRATE-GATE ROUTES (Option A build arc, 2026-05-28; ninth+ route)
//
// Calling and other future substrate-consuming routes catch distress via
// enforceLayer2R20aGate (A7) rather than the route-level pattern. The
// underlying classifier (detectDistressTwoStage via Haiku) is identical;
// the surface call shape is different because A7 sits at the substrate's
// Layer 2 boundary, not at the route's edge.
//
// Each substrate-gate route MUST:
//   1. Import enforceLayer2R20aGate from @/lib/substrate/r20a-gate
//   2. Import its own substrate-gate flag check (e.g. isCallingR20aEnabled)
//      from the same source — so the catch is feature-flagged
//   3. Call enforceLayer2R20aGate, awaited (PR3 — synchronous safety)
//   4. Gate the call site behind the flag check (so production with the
//      flag UNSET is byte-identical to pre-Option-A behaviour)
// -------------------------------------------------------------------------

// test.each(SUBSTRATE_GATE_ROUTES): '$route imports enforceLayer2R20aGate from substrate/r20a-gate (Option A — substrate-gate pattern)'
for (const { route } of SUBSTRATE_GATE_ROUTES) {
  const label = `R20a Safety Invocation Guard: ${route} imports enforceLayer2R20aGate from substrate/r20a-gate (Option A — substrate-gate pattern)`
  const fullPath = path.join(websiteRoot, route)
  assert(fs.existsSync(fullPath) === true, `${label} (file exists)`)

  const source = fs.readFileSync(fullPath, 'utf-8')

  const hasImport =
    source.includes('import') &&
    source.includes(REQUIRED_SUBSTRATE_GATE_FUNCTION) &&
    source.includes(REQUIRED_SUBSTRATE_GATE_SOURCE)

  assert(hasImport === true, `${label} (hasImport)`)
}

// test.each(SUBSTRATE_GATE_ROUTES): '$route imports its substrate-gate feature flag $flag from substrate/r20a-gate (Option A — feature-gated catch)'
for (const { route, flag } of SUBSTRATE_GATE_ROUTES) {
  const label = `R20a Safety Invocation Guard: ${route} imports its substrate-gate feature flag ${flag} from substrate/r20a-gate (Option A — feature-gated catch)`
  const fullPath = path.join(websiteRoot, route)
  const source = fs.readFileSync(fullPath, 'utf-8')

  // Each substrate-gate route names its own feature flag check (mirroring
  // isSubstrateR20aGateEnabled for A7). The check MUST be imported from
  // substrate/r20a-gate so the perimeter's flag surface is centralised.
  // Per-route flag names decouple activations across endpoints per design
  // spec §5.6 (Calling, Reflect-content, and A7 each have independent flags).
  const hasFlagImport =
    source.includes('import') &&
    source.includes(flag) &&
    source.includes(REQUIRED_SUBSTRATE_GATE_SOURCE)

  assert(hasFlagImport === true, label)
}

// test.each(SUBSTRATE_GATE_ROUTES): '$route calls enforceLayer2R20aGate awaited (PR3 — synchronous safety)'
for (const { route } of SUBSTRATE_GATE_ROUTES) {
  const label = `R20a Safety Invocation Guard: ${route} calls enforceLayer2R20aGate awaited (PR3 — synchronous safety)`
  const fullPath = path.join(websiteRoot, route)
  const source = stripComments(fs.readFileSync(fullPath, 'utf-8'))

  const lines = source.split('\n')
  const nonImportLines = lines.filter(
    (line) => !line.trim().startsWith('import ')
  )
  const bodySource = nonImportLines.join('\n')

  // The function must be CALLED in the body (not merely imported), and
  // the call must be awaited (PR3 — no fire-and-forget on safety paths).
  const hasAwaitedCall = /await\s+enforceLayer2R20aGate\s*\(/.test(bodySource)

  assert(hasAwaitedCall === true, label)
}

// test.each(SUBSTRATE_GATE_ROUTES): '$route gates the enforceLayer2R20aGate call behind its substrate-gate flag $flag (feature flag check present)'
for (const { route, flag } of SUBSTRATE_GATE_ROUTES) {
  const label = `R20a Safety Invocation Guard: ${route} gates the enforceLayer2R20aGate call behind its substrate-gate flag ${flag} (feature flag check present)`
  const fullPath = path.join(websiteRoot, route)
  const source = stripComments(fs.readFileSync(fullPath, 'utf-8'))

  const lines = source.split('\n')
  const nonImportLines = lines.filter(
    (line) => !line.trim().startsWith('import ')
  )
  const bodySource = nonImportLines.join('\n')

  // The flag function MUST be CALLED in the body (not just imported).
  // This guards the production default-OFF posture.
  const hasFlagCall = new RegExp(`${flag}\\s*\\(`).test(bodySource)

  assert(hasFlagCall === true, label)
}

// -------------------------------------------------------------------------
// FLAG-GATED ROUTE-LEVEL ROUTES (2026-07-07; AC5 eleventh-route protocol)
//
// These perimeter members carry the full route-level pattern (asserted by
// the HUMAN_FACING_POST_ROUTES blocks above) AND gate it behind a per-route
// feature flag for the dark-build posture. Each MUST:
//   1. Import its flag-check function from the named module
//   2. Call the flag check in the route body (not just import it)
// The flag semantics themselves (unset/false/'1' → OFF; 'true' → ON) are
// asserted in the per-route test under the route's __tests__/ folder.
// -------------------------------------------------------------------------

for (const { route, flag, flagSource } of FLAG_GATED_ROUTE_LEVEL_ROUTES) {
  const label = `R20a Safety Invocation Guard: ${route} imports its route-level feature flag ${flag} from ${flagSource}`
  const fullPath = path.join(websiteRoot, route)
  assert(fs.existsSync(fullPath) === true, `${label} (file exists)`)

  const source = fs.readFileSync(fullPath, 'utf-8')

  const hasFlagImport =
    source.includes('import') &&
    source.includes(flag) &&
    source.includes(flagSource)

  assert(hasFlagImport === true, label)
}

for (const { route, flag } of FLAG_GATED_ROUTE_LEVEL_ROUTES) {
  const label = `R20a Safety Invocation Guard: ${route} calls its route-level feature flag ${flag} in the body (flag check, not just import)`
  const fullPath = path.join(websiteRoot, route)
  const source = stripComments(fs.readFileSync(fullPath, 'utf-8'))

  const lines = source.split('\n')
  const nonImportLines = lines.filter(
    (line) => !line.trim().startsWith('import ')
  )
  const bodySource = nonImportLines.join('\n')

  const hasFlagCall = new RegExp(`${flag}\\s*\\(\\s*\\)`).test(bodySource)

  assert(hasFlagCall === true, label)
}

// ===========================================================================
// EXHAUSTIVENESS BACKSTOP — the filesystem sweep (added 2026-08-18)
// ===========================================================================
//
// WHY THIS EXISTS. Everything above this line is PURELY ADDITIVE: it verifies
// the routes someone remembered to register. It cannot see a route that was
// never added. The block at "No human-facing POST route is missing from the
// registry" says so in its own words — "This test is a reminder, not an
// automated check."
//
// The consequence is on the record. The count of unprotected human-facing
// free-text routes moved FOUR times in two sessions — 2 → 4 → 6 → 8 — and each
// move came from a human re-reading a different slice of src/app/api by hand.
// The eighth was found by a REVIEW of the sixth, and one surface inside it
// (founder-facts PUT) was found by the builder while wiring the review's
// finding. Even the review undercounted.
//
// RULED A PREREQUISITE, 2026-08-17. The mentor, verbatim: "A filesystem-level
// sweep that produces a definitive count is a prerequisite for publishing
// 'every time' honestly… The honest claim is only as strong as the
// verification behind it." No coverage claim may be published in any form
// until this sweep exists and passes. Recorded at
// operations/trust-layer-2026-07/
//   2026-08-17-mentor-ruling-limitations-perimeter-practice-family-verbatim.md
//
// HOW IT WORKS. Default-DENY. Walk every route.ts under src/app/api. Any route
// that (a) calls requireAuth — a human principal — and (b) reads a request
// body on a write verb must be EITHER a registered perimeter member above OR
// carry an explicit, reasoned entry in PERIMETER_EXCLUSIONS below. There is no
// third state. A new route of the same shape fails this battery until someone
// makes a decision about it and writes the reason down.
//
// Over-inclusion is deliberate and is the safe direction, per the same ruling's
// asymmetry argument: a false positive costs a line in an exclusion list; a
// false negative costs a practitioner in acute distress writing into a surface
// that does not notice.

// ---------------------------------------------------------------------------
// Hardened source stripper — comments AND string/template literals
// ---------------------------------------------------------------------------
//
// ⚠ THIS IS STRICTLY STRONGER THAN stripComments() ABOVE, AND THE GAP IT CLOSES
// IS REAL, NOT THEORETICAL.
//
// stripComments() removes comments only. Its docstring enumerates "known
// corruption classes" and argues they all fail SAFE (a swallowed call goes
// loudly red, never a vacuous pass). That argument is sound for the classes it
// names — but it does not cover PROSE INSIDE A STRING LITERAL, which fails in
// the UNSAFE direction: it ADDS matching text rather than removing it, so a
// route that merely QUOTES the AC5 pattern inside a template literal satisfies
// the "calls it" assertion WITHOUT CALLING IT.
//
// Such text exists in this codebase today. src/app/api/founder/hub/route.ts
// carries an embedded knowledge block containing the literal string
// "enforceDistressCheck(detectDistressTwoStage(...))" as documentation prose.
// That route is not currently registered, so no live assertion is vacuous — but
// register it (or any route like it) under the old stripper and the guard would
// certify it as protected while it screened nothing.
//
// The 2026-08-03 ST3 fold closed exactly this class for COMMENTS. This closes
// it for STRINGS. Both were found the same way: by mutation, not by reading.
//
// Blanking a template literal also blanks any ${...} interpolation inside it.
// That is accepted: a real call site inside an interpolation would become
// invisible and go LOUDLY RED, which is the safe direction.
function stripCommentsAndStringLiterals(ts: string): string {
  return stripComments(ts)
    .replace(/`(?:\\[\s\S]|[^\\`])*`/g, '``')
    .replace(/'(?:\\[\s\S]|[^\\'\n])*'/g, "''")
    .replace(/"(?:\\[\s\S]|[^\\"\n])*"/g, '""')
}

// ---------------------------------------------------------------------------
// The explicit exclusion list — every entry carries a first-hand reason
// ---------------------------------------------------------------------------
//
// An entry here is a DECISION, not a default. Each was reached by reading the
// route's own body-destructuring first-hand on 2026-08-18, not by inferring
// from its name. Adding an entry to silence this battery without reading the
// route is the one way to defeat it.
interface PerimeterExclusion {
  readonly route: string
  readonly reason: string
}

const AGENT_FACING =
  'AGENT-FACING BY DESIGN — credential-authenticated (sr_* via validateApiKey / ' +
  'validatePracticeCredential), not a human session. Agent surfaces do not carry human free text; ' +
  'this is the standing recorded AC5 class, not a per-route judgement. A human reaching this ' +
  'endpoint would need an agent credential, and the human-facing twin of each such surface is ' +
  'itself a perimeter member. '

const OPERATOR_ONLY =
  'OPERATOR/ADMIN SURFACE — not reachable by a practitioner. Gated to the founder or an admin ' +
  'identity, and its payload is configuration or credential metadata rather than anything a ' +
  'person writes about their own life. '

const PERIMETER_EXCLUSIONS: readonly PerimeterExclusion[] = [
  // ── Agent-facing: credential-authenticated, never a human session ─────────
  {
    route: 'src/app/api/accreditation/[agent_id]/route.ts',
    reason: AGENT_FACING + 'Accreditation write boundary; payload is a signed assessment chain.',
  },
  {
    route: 'src/app/api/assessment/foundational/route.ts',
    reason: AGENT_FACING + 'Body is { agent_id, responses } — an agent’s own structured assessment answers.',
  },
  {
    route: 'src/app/api/assessment/full/route.ts',
    reason: AGENT_FACING + 'Body is { agent_id, responses } — same class as its foundational sibling.',
  },
  {
    route: 'src/app/api/baseline/agent/route.ts',
    reason: AGENT_FACING + 'The agent baseline; its human twin /api/mentor-baseline-response IS a member.',
  },
  {
    route: 'src/app/api/score-iterate/route.ts',
    reason:
      AGENT_FACING +
      'Chain-revision surface (chain_id, action, revised_action, revision_rationale) — an agent ' +
      'reconsidering its own prior action, not a person disclosing their situation.',
  },
  {
    route: 'src/app/api/stoa/declare/route.ts',
    reason:
      AGENT_FACING +
      'ST4, a RECORDED design decision: its free text (what_i_bring / what_i_seek) is AGENT-authored ' +
      'over a credential-authenticated call. Its human twin /api/mentor/stoa IS a perimeter member.',
  },
  {
    route: 'src/app/api/practice/completion-signal/route.ts',
    reason:
      AGENT_FACING +
      'RULED 2026-08-31 on CORRECTED facts, and the correction is part of the reason — read it before ' +
      'trusting this entry. The original ruling request asserted this route "carries no human free-text ' +
      'field". THAT WAS FALSE: handler.ts REQUIRES examination.impression_assented_to (non-empty string, ' +
      'MAX_IMPRESSION_CHARS = 5000, handler.ts:162/338-344) and optionally accepts refusal_reason ' +
      '(MAX_REFUSAL_REASON_CHARS = 2000, handler.ts:163/386-393). The error was made by grepping route.ts ' +
      'alone while the fields live in the sibling handler.ts — the SAME split-file blindness class this ' +
      'battery fixed in its own exhaustiveness walk (see readRouteAndHandler below). The exclusion ' +
      'nevertheless STANDS, on the ground the mentor gave once corrected: the ST4 precedent is not "this ' +
      'route has no free text", it is "AGENT-AUTHORED free text over a credential-authenticated call is ' +
      'outside the perimeter, because it processes agent output rather than human distress input". ' +
      'impression_assented_to is what the AGENT examined and assented to, submitted Bearer-ONLY on the ' +
      'write-class completion_signal_write capability (handler.ts:24/220/235-240), never over a browser ' +
      'session. There is no path by which a human practitioner’s distress enters this route. ' +
      'REVISIT TRIGGER (corrected — the original was self-sealing, describing a change that had ' +
      'ALREADY happened and so could never fire): revisit if the route’s authentication model changes ' +
      'to permit browser-session callers, or if its field definitions are amended to accept ' +
      'practitioner-typed input rather than agent-authored output. Neither condition is met today. ' +
      'Ruling: operations/agent-circles-2026-08/2026-08-31-mentor-ruling-corrected-questionB-and-A2b-' +
      'verbatim.md; correction: 2026-08-31-CORRECTION-to-r20a-ruling-question-B-false-fact.md.',
  },
  {
    route: 'src/app/api/guardrail/route.ts',
    reason:
      AGENT_FACING +
      'RULED 2026-08-18 — this entry no longer rests on a deferral. It previously read as a DEFERRED ' +
      'FOUNDER ELECTION from the 2026-06-19 ADR-009 port; the mentor resolved it, and the deferral ' +
      'notation is RETIRED per that ruling ("it should not remain that way behind a published ' +
      'claim"). The reasoned judgement: the human-reachable path into the guardrail runs through ' +
      '/api/compose and /api/execute, BOTH of which are now perimeter members that screen BEFORE ' +
      'forwarding — so the human path is covered upstream. The remaining direct path requires an ' +
      'agent credential, placing it in the standing agent-facing exclusion class above. Recorded at ' +
      'operations/agent-circles-2026-08/2026-08-18-mentor-rulings-perimeter-claim-bounds-and-' +
      'curiosity-scoping-verbatim.md (Q4).',
  },

  // ── Operator / admin surfaces ────────────────────────────────────────────
  {
    route: 'src/app/api/admin/accreditation-credentials/route.ts',
    reason: OPERATOR_ONLY + 'Credential minting and revocation.',
  },
  {
    route: 'src/app/api/admin/api-keys/route.ts',
    reason:
      OPERATOR_ONLY +
      'Body is limits and flags (is_active, suspended_reason, monthly_limit, daily_limit, tier, notes).',
  },
  {
    route: 'src/app/api/admin/plugin-install-credentials/route.ts',
    reason: OPERATOR_ONLY + 'Per-install credential minting.',
  },
  {
    route: 'src/app/api/admin/stoa-trust-flag/route.ts',
    reason: OPERATOR_ONLY + 'Curator trust-flag administration over existing Stoa rows.',
  },
  {
    route: 'src/app/api/calling/approve/route.ts',
    reason:
      OPERATOR_ONLY +
      'Approval authority is ADMIN ONLY by founder election (2026-05-21, the ADMIN_USER_ID gate).',
  },
  {
    route: 'src/app/api/internal/retrieve/route.ts',
    reason: OPERATOR_ONLY + 'Checks user.id === ADMIN_USER_ID explicitly before doing any work.',
  },
  {
    route: 'src/app/api/substrate/layer3/route.ts',
    reason:
      OPERATOR_ONLY +
      'Layer-3 per-consumer rendering, DARK: SUBSTRATE_LAYER3_ENABLED is unset so the route 503s. ' +
      'Ruled OUT of launch scope at S7 and re-affirmed by Ruling Set D (2026-08-15).',
  },
  {
    route: 'src/app/api/analytics/route.ts',
    reason:
      'TELEMETRY INGEST — the payload is a validated analytics event shape, and the caller IP is ' +
      'hashed rather than stored. No practitioner prose field exists on it at all.',
  },

  // ── Human-authenticated, but structured input only ───────────────────────
  {
    route: 'src/app/api/baseline/route.ts',
    reason:
      'Structured selections only. `answers` is validated as exactly 5 answer IDs ' +
      '(`answers.length !== 5` → 400) and `q6_answer` is a structured tie-break fed to ' +
      'applyQ6(). No free-text field, and nothing typed reaches an LLM. NOTE the contrast ' +
      'with /api/mentor-baseline-response, which IS a member — that route takes the ' +
      'practitioner’s written responses; this one takes their choices.',
  },
  {
    route: 'src/app/api/billing/checkout/route.ts',
    reason: 'Payment intent only: `type` (enum) and `amount` (numeric, clamped 100–100000). No text field.',
  },
  {
    route: 'src/app/api/billing/tidings/route.ts',
    reason: 'Payment intent only: `recurring` (boolean) and `amount` (numeric, clamped 1–1000). No text field.',
  },
  {
    route: 'src/app/api/keys/route.ts',
    reason:
      'Credential management: `label` (a short operator-chosen credential name) and `key_id`. ' +
      'Not an examination surface — the label is stored as metadata and never reaches an LLM ' +
      'or any scoring path.',
  },
  {
    route: 'src/app/api/patterns/route.ts',
    reason: 'Query parameters only: `agent_id`, `since`, `limit`. Read-shaped; no authored content.',
  },
  {
    route: 'src/app/api/receipts/route.ts',
    reason: 'Structured artifacts only: `receipt`, `agent_id`, `chain_id`. No practitioner-authored prose.',
  },
  {
    route: 'src/app/api/user/delete/route.ts',
    reason:
      'Data-rights deletion. The only body field is `confirm`, compared against the literal ' +
      'string "DELETE". No free text is accepted at all.',
  },

  // ── Reasoned exclusions: free text present, but screened elsewhere or
  //    constrained to a non-examination allow-list ───────────────────────────
  {
    route: 'src/app/api/user/rectify/route.ts',
    reason:
      'GDPR rectification, constrained by an allow-list (see lib/rectifiable-fields.ts: ' +
      'display_name, city, country). Values are short profile identifiers, not examination ' +
      'content, and reach no LLM and no scoring path. A practitioner does not work through ' +
      'distress in a city field.',
  },
  {
    route: 'src/app/api/update-location/route.ts',
    reason:
      'Human-authenticated (via supabase.auth.getUser, NOT requireAuth) but structured only: ' +
      '{ city, country, latitude, longitude, show_on_map } — two short place identifiers, two ' +
      'numbers and a boolean, reaching no LLM. ⚠ WORTH NOTING FOR THE PREDICATE, NOT FOR THE ' +
      'PERIMETER: this route is invisible to any requireAuth-based predicate, which is the same ' +
      'proxy failure the 2026-08-18 ruling names, arriving from the opposite direction — a human ' +
      'surface the old predicate could not see. It is excluded on CONTENT, not on auth.',
  },
  {
    route: 'src/app/api/deliberation-chain/[id]/conclude/route.ts',
    reason:
      'Concludes an existing chain identified by the PATH parameter. It reads the body defensively ' +
      'with `.catch(() => ({}))` and destructures no free-text field from it; the operative input ' +
      'is the chain id from params. No practitioner prose is accepted or stored.',
  },

  // ── PERIMETER COMPLETION FOLLOW-UP (2026-08-18, PR19 fold): the route.ts/
  // handler.ts split-file class. PR19 found the exhaustiveness walk was blind
  // to this pattern (isInScopeForPerimeter read only route.ts, and the real
  // request.json() call for these routes lives in the sibling handler.ts) —
  // CONFIRMED under adversarial verification, fixed at the walk itself (see
  // readRouteAndHandler above). Fixing the walk made these four NEWLY VISIBLE
  // to the sweep for the first time; each is read + reasoned here, not
  // silently passed through.
  {
    route: 'src/app/api/credential/erase/route.ts',
    reason:
      AGENT_FACING +
      'CI-14 Step 7 consumer-erasure-by-token (handler.ts): the caller presents THEIR OWN CREDENTIAL ' +
      '(Authorization: Bearer sr_<token>) or, for the admin-by-id mode, the founder-admin Supabase ' +
      'JWT. No requireAuth/human-session path exists. Body is `{ confirm: "ERASE" }` or an admin ' +
      '`{ credential_id }` — no practitioner prose field at all.',
  },
  {
    route: 'src/app/api/practice/discernment/route.ts',
    reason:
      AGENT_FACING +
      'UPC `consult` capability via validatePracticeCredential (handler.ts), Bearer-ONLY (no ' +
      'X-Api-Key, no cookie/JWT session). The S8 discernment surface — an orchestrator selecting a ' +
      'sub-agent, not a person disclosing their situation.',
  },
  {
    route: 'src/app/api/practice/fresh/route.ts',
    reason:
      AGENT_FACING +
      'UPC `consult` capability via validatePracticeCredential (handler.ts), Bearer-ONLY. The ' +
      'IDEA-loop novelty-check surface — candidate proposals from an agent runner, not a ' +
      'practitioner.',
  },
  {
    route: 'src/app/api/practice/watching/route.ts',
    reason:
      AGENT_FACING +
      'UPC `watching_write` capability via validatePracticeCredential (handler.ts), Bearer-ONLY. A ' +
      'runner-submitted per-cycle transparency ledger entry, not human free text.',
  },

  // ⚠ /api/compose AND /api/execute WERE DRAFTED AS EXCLUSIONS HERE AND ARE NOT
  // ONE. The reason they moved is recorded because the mistake is instructive.
  //
  // /api/execute is /api/compose's twin — same SKILL_HANDLER_MAP, same
  // createSyntheticRequest forwarding, human-authenticated via
  // supabase.auth.getUser, taking { skill_id, input } where `input` carries the
  // practitioner's text. It screened nothing. It was invisible to the ORIGINAL
  // auth-based predicate because it uses getUser() rather than requireAuth, and
  // it surfaced the moment that predicate was rebuilt — which is the ruling's
  // point about proxies, demonstrated a second time within the hour.
  //
  // The drafted reason argued compose "delegates rather than receives": its
  // free text is `step.input`, forwarded via SKILL_HANDLER_MAP, and that map
  // imports each route's OWN exported POST — so a screened target screens
  // exactly as it does over HTTP. That much is true and was verified first-hand.
  //
  // It is also incomplete, and the assertion written to PROVE it is what
  // exposed the hole. Not every SKILL_HANDLER_MAP target screens: /api/guardrail,
  // /api/score-iterate, /api/assessment/foundational and /api/baseline/agent are
  // agent-facing and deliberately outside the perimeter. The first reading was
  // that this is unreachable for a human, since those routes take validateApiKey
  // (an sr_* credential) and would 401 a forwarded Supabase JWT. But
  // createSyntheticRequest forwards BOTH `Authorization` AND `X-Api-Key`
  // (skill-handler-map.ts:109-113), so a caller holding a session AND an agent
  // credential — which /api/keys lets any signed-in user mint — is authenticated
  // as a human at compose and as an agent downstream. Their free text reaches an
  // unscreened LLM.
  //
  // Screening at compose closes the class at the point the human principal is
  // established, and makes every downstream question moot. It is therefore a
  // PERIMETER MEMBER (see HUMAN_FACING_POST_ROUTES), not an exclusion, and the
  // SKILL_HANDLER_MAP invariant that guarded the drafted exclusion has been
  // removed with it — it existed only to defend a premise no longer being made.
  // Removed because it became unnecessary, NOT because it was failing.
]

// ---------------------------------------------------------------------------
// The walk
// ---------------------------------------------------------------------------
const API_ROOT = path.join(websiteRoot, 'src', 'app', 'api')

function walkApiRoutes(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry)
    if (fs.statSync(full).isDirectory()) walkApiRoutes(full, acc)
    else if (entry === 'route.ts') {
      acc.push(path.relative(websiteRoot, full).split(path.sep).join('/'))
    }
  }
  return acc
}

// ---------------------------------------------------------------------------
// THE PREDICATE — deliberately proxy-free (RULED 2026-08-18)
// ---------------------------------------------------------------------------
//
// In scope = a write verb + reads caller-supplied input. That is ALL. No
// authentication term, no content term, no heuristic of any kind.
//
// ⚠ THE FIRST VERSION OF THIS PREDICATE REQUIRED `requireAuth`, AND THE MENTOR
// RULED THAT OUT BY NAME:
//
//   "The predicate should be rebuilt to match on human-facing content — free
//    text input, natural language output, philosophical evaluation — rather
//    than on authentication status. Authentication is a proxy for human-facing,
//    and this surface demonstrates the proxy fails."
//   (2026-08-18-mentor-ruling-unauthenticated-public-surface-verbatim.md)
//
// The surface that demonstrated it was /api/evaluate: unauthenticated, free
// text in, Stoic evaluation out, no screening — invisible to six consecutive
// passes because all six assumed human-facing implied authenticated.
//
// WHY NOT A CONTENT-MATCHING PREDICATE, WHICH IS WHAT THE RULING LITERALLY
// DESCRIBES. It was built and MEASURED first, not assumed: matching on
// `validateTextLength || TEXT_LIMITS || an LLM call` produced a predicate that
// MISSED THREE ALREADY-REGISTERED MEMBERS — mentor/gap4, private/founder-facts,
// and mentor/stoa — because each stores practitioner free text without
// validating its length and without calling an LLM. Shipping it would have
// silently stopped guarding three live perimeter members.
//
// So a content regex is simply another proxy, and it failed the superset check
// on first contact. The ruling's PURPOSE — that no proxy stands between the
// sweep and the truth — is served by removing the proxy entirely and moving the
// content judgement OUT of the predicate, where it fails silently, and INTO
// PERIMETER_EXCLUSIONS, where every call is written down, reasoned, and
// reviewable. That is what "the honest claim is only as strong as the
// verification behind it" asks for.
//
// The cost is a longer exclusion list. That cost is the point.
//
// `searchParams`/`formData` are included alongside a JSON body because caller
// text does not have to arrive as JSON, and a predicate that assumed it did
// would be one more proxy.
function isInScopeForPerimeter(code: string): boolean {
  const readsCallerInput =
    /await\s+(?:request|req)\s*\.\s*json\s*\(/.test(code) ||
    /searchParams/.test(code) ||
    /formData/.test(code)
  const hasWriteVerb = /export\s+async\s+function\s+(?:POST|PUT|PATCH|DELETE)\b/.test(code)
  return readsCallerInput && hasWriteVerb
}

const allApiRoutes = walkApiRoutes(API_ROOT)

// BOTH registries count as registered. The substrate-gate routes (/api/calling,
// /api/practice/reflect) are perimeter members via enforceLayer2R20aGate rather
// than the route-level pattern, and they are agent-credentialed — so under the
// OLD auth-based predicate they were out of scope and this omission was
// invisible. Under the proxy-free predicate they come into scope, and building
// this set from HUMAN_FACING_POST_ROUTES alone would flag two genuine perimeter
// members as unclassified. Found by rebuilding the predicate, not by review.
const registeredRoutes = new Set<string>([
  ...HUMAN_FACING_POST_ROUTES,
  ...SUBSTRATE_GATE_ROUTES.map((e) => e.route),
])
const excludedRoutes = new Set<string>(PERIMETER_EXCLUSIONS.map((e) => e.route))

/**
 * Read a route.ts PLUS its sibling handler.ts, if one exists, concatenated.
 *
 * PR19 FINDING (2026-08-18, CONFIRMED, HIGH — this is the same session that
 * built the sweep, catching a real gap in the sweep itself). The codebase's
 * own standing memory (`nextjs-route-export-validation`) documents WHY the
 * split exists: Next.js rejects non-handler exports from route.ts at build,
 * so any route needing shared/testable/injectable logic moves it to a sibling
 * `handler.ts` and leaves route.ts as a thin re-export. This is not an edge
 * case — it is a normal, encouraged pattern here, live today in at least six
 * routes (practice/fresh, practice/watching, practice/discernment,
 * credential/erase, founder/watching, trust-record/[agent_id]).
 *
 * The original predicate read ONLY route.ts. For a split route, route.ts
 * genuinely re-exports `POST` (satisfying hasWriteVerb) but the real
 * `await request.json()` call lives in handler.ts, which the walk never read
 * — so readsCallerInput was FALSE and the route was silently treated as
 * out-of-scope. No registry entry required, no exclusion reasoning required,
 * battery green throughout. PR19 reproduced this directly: a synthetic
 * route.ts/handler.ts pair with an unscreened `body.feelings` field in
 * handler.ts was walked (route count went 124 -> 125) but never entered
 * inScopeRoutes.
 *
 * None of the 44 CURRENTLY registered members use this pattern, so nothing
 * already classified moves. The fix is prospective: closing the exact class
 * of blind spot the mentor's ruling exists to eliminate, for the next route
 * built this (normal, encouraged) way.
 */
function readRouteAndHandler(routePath: string): string {
  const routeSrc = fs.readFileSync(path.join(websiteRoot, routePath), 'utf-8')
  const handlerPath = path.join(websiteRoot, path.dirname(routePath), 'handler.ts')
  const handlerSrc = fs.existsSync(handlerPath) ? fs.readFileSync(handlerPath, 'utf-8') : ''
  return routeSrc + '\n' + handlerSrc
}

const inScopeRoutes = allApiRoutes.filter((r) =>
  isInScopeForPerimeter(stripCommentsAndStringLiterals(readRouteAndHandler(r)))
)

// ── POSITIVE PIN for the handler.ts fix — the floor alone does not catch a
// regression here. ─────────────────────────────────────────────────────────
//
// Mutation-tested 2026-08-18: reverting readRouteAndHandler to a plain
// fs.readFileSync(route.ts) dropped inScopeRoutes from 73 to 69 — STILL above
// the >=65 non-vacuity floor, so the battery stayed GREEN with the fix
// silently undone. A floor sized for catastrophic collapse is, by design, too
// loose to catch a narrow four-route regression. This pin closes that gap
// directly: it names the four routes the fix exists to catch and asserts each
// is actually detected as in-scope, independent of any floor.
{
  const KNOWN_SPLIT_FILE_IN_SCOPE_ROUTES = [
    'src/app/api/credential/erase/route.ts',
    'src/app/api/practice/discernment/route.ts',
    'src/app/api/practice/fresh/route.ts',
    'src/app/api/practice/watching/route.ts',
  ]
  for (const routePath of KNOWN_SPLIT_FILE_IN_SCOPE_ROUTES) {
    assert(
      inScopeRoutes.includes(routePath),
      `R20a Exhaustiveness Backstop: ${routePath} (route.ts/handler.ts split) is detected in-scope — regression pin for the PR19 handler.ts fix`
    )
  }
}

// ── Non-vacuity floors ─────────────────────────────────────────────────────
// A sweep that silently walks nothing reports zero violations and looks green.
// These floors make a broken walk, a moved directory, or an over-narrow
// predicate fail LOUDLY instead.
//
// ⚠ THIS FLOOR HAS NOW BEEN MEASURED-AND-WRONG TWICE IN ONE SESSION.
// It first read "Counts observed 2026-08-18: 124 route files, 48 in scope"
// (floor 40) — the true figure was 69, not 48, confirmed by direct
// instrumentation. It was corrected to 69/floor-60, and THEN a PR19 finding
// (the route.ts/handler.ts split-file blind spot — see readRouteAndHandler
// above) fixed a real hole in the walk itself, which moved the true in-scope
// count again: 73, with 44 registered + 29 excluded = 73, zero unclassified.
//
// The floor is set at 65 — below 73 with headroom for ordinary churn, but
// still loud on a genuine collapse. It is NOT set at 69 (the prior "true"
// figure) precisely because that number was itself superseded within the
// same session — proof that a floor should sit meaningfully below whatever
// was last measured, not pinned to it.
{
  const label = 'R20a Exhaustiveness Backstop: the walk is non-vacuous'
  assert(allApiRoutes.length >= 100, `${label} (>=100 route.ts files found; got ${allApiRoutes.length})`)
  assert(inScopeRoutes.length >= 65, `${label} (>=65 in-scope routes; got ${inScopeRoutes.length})`)
}

// ── The predicate must be a SUPERSET of the existing registry ──────────────
// If a route someone deliberately registered does not match the in-scope
// predicate, the predicate is too narrow and the sweep would miss its
// look-alikes. Verified passing 2026-08-18 with zero misses.
for (const routePath of HUMAN_FACING_POST_ROUTES) {
  const label = `R20a Exhaustiveness Backstop: registered route ${routePath} matches the in-scope predicate (predicate is not too narrow)`
  // Reads route.ts + a sibling handler.ts, same as inScopeRoutes above — a
  // future registered route built on the split pattern must not go spuriously
  // red here just because this check looked only at route.ts.
  const code = stripCommentsAndStringLiterals(readRouteAndHandler(routePath))
  assert(isInScopeForPerimeter(code) === true, label)
}

// ── THE BACKSTOP ITSELF ────────────────────────────────────────────────────
for (const routePath of inScopeRoutes) {
  const label = `R20a Exhaustiveness Backstop: ${routePath} is either a registered perimeter member or an explicitly reasoned exclusion`
  const known = registeredRoutes.has(routePath) || excludedRoutes.has(routePath)
  assert(known === true, label)
}

// ── The exclusion list must not rot ────────────────────────────────────────
for (const { route, reason } of PERIMETER_EXCLUSIONS) {
  const label = `R20a Exhaustiveness Backstop: exclusion ${route}`
  assert(fs.existsSync(path.join(websiteRoot, route)) === true, `${label} (file still exists — stale exclusion)`)
  assert(registeredRoutes.has(route) === false, `${label} (not ALSO registered — contradictory state)`)
  assert(reason.trim().length >= 60, `${label} (carries a substantive reason, not a placeholder)`)
}

// ── Every registered route survives the HARDENED stripper ──────────────────
// Closes the string-literal vacuous-pass class described above. The existing
// assertions use stripComments(); this repeats the call check under
// stripCommentsAndStringLiterals(). A route that only QUOTES the pattern in
// prose passes there and fails HERE.
for (const routePath of HUMAN_FACING_POST_ROUTES) {
  const label = `R20a Exhaustiveness Backstop: ${routePath} calls the AC5 pattern in REAL CODE, not in a string literal`
  const hardened = stripCommentsAndStringLiterals(
    fs.readFileSync(path.join(websiteRoot, routePath), 'utf-8')
  )
  const bodySource = hardened
    .split('\n')
    .filter((line) => !line.trim().startsWith('import '))
    .join('\n')
  assert(bodySource.includes(REQUIRED_GATE_FUNCTION) === true, `${label} (${REQUIRED_GATE_FUNCTION})`)
  assert(bodySource.includes(REQUIRED_FUNCTION) === true, `${label} (${REQUIRED_FUNCTION})`)
}

// ── RULED MEMBERSHIP — the semantic defeat of register H8 ──────────────────
//
// H8 (PR19, 2026-08-31, CONFIRMED): reclassifying /api/score/save from a
// perimeter MEMBER to a PERIMETER_EXCLUSIONS entry and dropping the route-level
// floor by one left the whole battery GREEN at 708/0 — "the ruling's own named
// failure mode, stopped only by a hand-maintained integer with a recorded
// history of drifting." The backstop above cannot see it: an exclusion IS
// "classified", so `known` stays true.
//
// Floors are a numeric defence and this is a semantic attack, so the remedy is
// semantic too. These routes are members because a BINDING MENTOR RULING put
// them there, not because a builder judged it. Downgrading one is therefore not
// a refactor — it is overturning a governance decision, and it must fail loudly
// and say so. The shape is the file's own established precedent
// (KNOWN_SPLIT_FILE_IN_SCOPE_ROUTES above, added for exactly the reason that a
// floor sized for catastrophic collapse is too loose to catch a narrow
// regression).
//
// Asserting MEMBERSHIP specifically — not merely "classified" — is the whole
// point. The ruling-record existence check makes the entry costly to fabricate:
// deleting the row means also deleting or lying about a committed governance
// document.
{
  const RULED_PERIMETER_MEMBERS: readonly { route: string; ruling: string }[] = [
    {
      route: 'src/app/api/score/save/route.ts',
      ruling:
        'operations/agent-circles-2026-08/2026-08-31-mentor-ruling-corrected-questionB-and-A2b-verbatim.md',
    },
    {
      route: 'src/app/api/mentor/view-from-above/route.ts',
      ruling:
        'operations/agent-circles-2026-08/2026-08-18-mentor-rulings-perimeter-claim-bounds-and-curiosity-scoping-verbatim.md',
    },
    {
      route: 'src/app/api/evaluate/route.ts',
      ruling:
        'operations/agent-circles-2026-08/2026-08-18-mentor-rulings-perimeter-claim-bounds-and-curiosity-scoping-verbatim.md',
    },
  ]
  const repoRoot = path.resolve(websiteRoot, '..')
  for (const { route, ruling } of RULED_PERIMETER_MEMBERS) {
    const label = `R20a Ruled Membership: ${route}`
    assert(
      HUMAN_FACING_POST_ROUTES.includes(route),
      `${label} is a HUMAN_FACING_POST_ROUTES MEMBER — downgrading it to an exclusion overturns a binding mentor ruling (register H8)`
    )
    assert(
      fs.existsSync(path.join(repoRoot, ruling)),
      `${label} — its governing ruling record still exists at ${ruling}`
    )
  }
}

// ── The exclusion registry needs a floor of its own ────────────────────────
// Every other registry in this file has one; PERIMETER_EXCLUSIONS had none, so
// entries could be deleted wholesale and only the backstop would object — and
// only for routes still in scope. Set below the true count with headroom, per
// the floor discipline stated above (a floor pinned AT the measured value
// catches nothing and goes stale on the next legitimate addition).
assert(
  PERIMETER_EXCLUSIONS.length >= 28,
  `R20a registry floor: at least 28 reasoned exclusions (saw ${PERIMETER_EXCLUSIONS.length})`
)

// ── Assertion-total floor — register H8's numeric half ─────────────────────
//
// H8's mutation dropped the total 715 -> 708 with nothing objecting. Captured
// BEFORE this assertion runs, so it is not self-referential.
//
// ⚠ BE HONEST ABOUT WHAT THIS DOES NOT CATCH. Measured at 714 on the commit
// that added it. A floor set AT the measured value would catch H8's -7, but it
// then goes red on the next legitimate addition and gets "fixed" by bumping the
// integer — which is the hand-maintained-integer drift that produced H8 in the
// first place, and which this file has already suffered twice on the in-scope
// floor above (measured-and-wrong two times in one session). A floor set BELOW
// the measured value survives ordinary churn but, by exactly that slack, does
// NOT catch a narrow -7.
//
// So this floor is the CATASTROPHIC-COLLAPSE defence only: a deleted assertion
// loop, a truncated registry, a broken walk. H8's specific mutation is caught
// SEMANTICALLY by RULED_PERIMETER_MEMBERS above, which fails on the
// reclassification itself regardless of any count. The two are a pair; neither
// alone is sufficient, and reading this floor as H8 cover would be a mistake.
// ---------------------------------------------------------------------------
// Docstring carries NO hand-maintained perimeter count (added 2026-09-04).
//
// WHY THIS IS A TEST AND NOT A COMMENT. The count lived in this file's header
// and went stale three times (nine -> 22 -> 44, each wrong within days or
// months). A written warning not to hand-maintain it was already present at the
// third recurrence and did not prevent it. manifest.md §AC5 learned the same
// lesson and stopped hand-enumerating membership. An instruction inside the
// drifting artifact does not arrest the drift; an assertion does.
//
// This scans THIS FILE'S OWN leading block comment for the shape
// "<n> route-level" / "<n> substrate-gate" / "= <n>" and fails if one appears.
// Derive the number from the arrays instead — they are the registry.
{
  const selfPath = path.join(process.cwd(), 'src/lib/__tests__/r20a-invocation-guard.test.ts')
  const selfSrc = fs.readFileSync(selfPath, 'utf8')

  // WIDENED 2026-09-05 (fifth recurrence). This scan used to cover only the
  // leading block comment -- selfSrc.slice(0, indexOf('*/')). Two hand-maintained
  // counts were sitting in the FILE BODY, outside that slice, and both had gone
  // stale: the perimeter total (42 + 2 = 44, against a live 43 + 2) and the
  // flag-pair tally (13 across 12, against a live 31 across 30). Both sat
  // directly beside assertions carrying the CORRECT figure -- the same
  // sentence-disagrees-with-its-own-assertion failure this file already records.
  // Scoping the guard to the header is what let them drift, so it now scans the
  // whole file.
  const OFFENDING =
    /(\b\d+\s+route-level|\b\d+\s+substrate-gate|\b\d+\s+flag-pairs?|\b\d+\s+distinct routes?|=\s*\d+\s*(routes)?\s*$)/i

  // A count is legitimate ONLY inside a dated historical record. One of these
  // markers opens such a record; it runs to the next blank comment line ("//"
  // alone) or the next non-comment line.
  const HISTORICAL_OPEN =
    /stale|wrong|was corrected|it read|true figure|being \d|BUMPED|The arc:|Historical detail|previously carried/i

  const scanForCounts = (src: string): string[] => {
    const found: string[] = []
    let inHistorical = false
    for (const l of src.split('\n')) {
      // COMMENT LINES ONLY. Code is the authority and legitimately carries the
      // number -- `assert(HUMAN_FACING_POST_ROUTES.length >= 43, ...)` is the
      // registry speaking, not prose drifting. Scanning code lines made this
      // guard fire on its own assertions and on `let passed = 0`.
      const isComment = /^\s*(\/\/|\*|\/\*)/.test(l)
      if (!isComment) { inHistorical = false; continue }
      if (/^\s*(\/\/|\*)\s*$/.test(l)) { inHistorical = false; continue }
      if (HISTORICAL_OPEN.test(l)) { inHistorical = true; continue }
      if (inHistorical) continue
      if (l.includes('OFFENDING.test(')) continue
      if (OFFENDING.test(l)) found.push(l.trim())
    }
    return found
  }

  const offenders = scanForCounts(selfSrc)

  assert(
    offenders.length === 0,
    `no hand-maintained perimeter count anywhere in this file -- found: ${JSON.stringify(offenders)}. ` +
      `This number has now gone stale five times. Do not write it; derive it from ` +
      `HUMAN_FACING_POST_ROUTES.length + SUBSTRATE_GATE_ROUTES.length + FLAG_GATED_ROUTE_LEVEL_ROUTES.length.`
  )

  // Non-vacuity 1: the matcher fires on each real stale line this guard exists
  // to have caught -- the 2026-08-18 header line and the 2026-09-05 body line.
  assert(
    OFFENDING.test(' * testing); AC5 (perimeter - 42 route-level + 2 substrate-gate = 44 as of'),
    'docstring count matcher is non-vacuous (fires on the real 2026-08-18 stale line)'
  )
  assert(
    OFFENDING.test('  // so a flag-gated entry could be deleted silently. 13 flag-pairs across 12'),
    'docstring count matcher is non-vacuous (fires on the real 2026-09-05 stale flag-pair line)'
  )

  // Non-vacuity 2: the SCAN (not merely the regex) must reach past the header.
  // A guard that only ever read the header would return 0 here and look green.
  {
    const synthetic = ['/**', ' * header, clean', ' */', '', 'const x = 1', '// Current count: 42 route-level'].join('\n')
    assert(
      scanForCounts(synthetic).length === 1,
      'count scan reaches the file BODY, not just the leading block comment'
    )
  }

  // Non-vacuity 3: the historical-record skip must actually skip, and must not
  // swallow the line after the record closes.
  {
    const hist = ['// It read "20 route-level" and was stale', '// >= 22 route-level disagreed', '//', '// Current count: 42 route-level'].join('\n')
    const r = scanForCounts(hist)
    assert(r.length === 1 && r[0].includes('Current count'), 'historical-record skip covers the record and stops at its end')
  }
}

{
  const observed = passed + failed
  assert(
    observed >= 700,
    `R20a assertion-total floor: the suite ran at least 700 assertions (saw ${observed}) — a net reduction of this size means a check or a whole loop was removed`
  )
}

console.log('\n' + passed + ' passed, ' + failed + ' failed')
if (failed > 0) {
  console.error('\nFailures:')
  for (const f of failures) console.error('  - ' + f)
  process.exit(1)
}
