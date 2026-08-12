# Standing Session Opener — Grounded Foundations

**Version 2026-08-12** (amends the 2026-08-11 version in place; that version was written but never
committed, so there is no separate artifact to archive — the 2026-08-01 predecessor it supersedes is
archived at `archive/2026-08-01_STANDING-SESSION-OPENER-grounded-foundations.md`).

> **⚑ The 2026-08-12 amendment — read this before trusting any line below.** A grounding-record
> reconciliation session (`D-GROUNDING-RECORD-RECONCILIATION-2026-08-12`) re-verified this document
> against primary sources rather than carrying it forward, because **its drift had demonstrably
> produced defects in real build work**: a stale R20a perimeter count in CLAUDE.md propagated into
> the S7 scope; this opener listed the mentor's live-page factual amendment as outstanding when it
> had been applied the day before it was written; and its D1/D2 blockers were restated as open, in a
> mentor relay, after both were cleared. **What changed:** the run's cycle count, the PR range
> (PR1–PR24, not PR23), the CLAUDE.md staleness note (now folded), queue items 2/4/8 (all done or
> subsumed), the August entry count (~80, not ~60), the stale `git log` commit triple, the Tier-2
> manifest line (it named two un-numbered sections; there are three), and new carried items 10–12.
>
> **A FOURTH drift instance was found by this amendment's own independent review, and it is the most
> consequential: the Stoa's ST2/ST3/ST4 were described everywhere as "built, reviewed, and dark."
> They are not — the base `SUBSTRATE_STOA_ENABLED` was already `true` in production on 2026-08-03,
> and ST3/ST4 gate on nothing else.** The self-contradiction sat inside a single sentence (ST6 was
> described as live *because* it rides that same base flag) and had been carried across multiple
> documents unchallenged. It is corrected in both records and the flag's live state marked
> `unverified` pending a Vercel check. **Note what this says about method: the reconciliation session
> itself initially copied the wrong claim forward into CLAUDE.md — the independent review, not the
> author's own care, is what caught it.** **Claims that could not be verified from the repo are now
> marked "unverified" rather than restated** — an item marked unverified is more useful than one
> silently carried. The standing lesson this serves is
> `primary-data-beats-secondary-characterisation`, and this document is its highest-leverage
> instance: **every session reads it first, so an error here propagates rather than sits.**

The body below was written by a Sonnet 5
session that closed the ARC2 arc (three sessions: process adoptions, the forced Next.js 14→16
upgrade, CRED-1 + the four AUTH post-deploy smokes) and then synthesised everything the project has
done since the 2026-08-01 Fable-5 re-grounding audit — ten days, ~60 decision-log entries *(count
corrected 2026-08-12: **~80** through 08-12)*, two major
new programs, one live production process still running. This is a synthesis pass, not a fresh
audit: facts below are drawn from `operations/decision-log.md` and the files it points to, not
independently re-verified against production the way the 08-01 audit was. Treat it as strongly
grounded, not re-audited.

**For the founder. Paste this as the FIRST message of a new session, then state your task beneath
it (or in your next message).** This opener grounds the session in the project's current state and
the trust-layer harness *before* any work begins, under the standard protocol. It is **reusable
across any task** — a preamble, **not a task**: read, confirm, then wait for the task.

---

## ⚠️ The one fact every session in this window must know before anything else

**A live, founder-attended production process is running right now, in a separate scratch
project, and will keep running for days.** The IDEA-loop bounded validation run
(`sagereasoning:idea-loop@v1#001`) started 2026-08-10, targets 20–40 completed cycles at a 4-hour
minimum interval (so roughly 3.5–7 days of real elapsed time), and is calling live production
`/api/guardrail`, `/api/practice/fresh`, `/api/reason`, `/api/practice/watching` on a real
credential. **As of 2026-08-12: 8 cycles complete** — 1/2/4/7/8 = `winner`; 3/5/6 =
`dependency_unavailable` (three distinct, separately-diagnosed failure classes: `contamination`,
root-caused/fixed/verified; `extraction_instability`, mentor-ruled **carry as a named finding, do
not chase further**; and a `layer1_throw`, mentor-ruled **not** a third strike, because an honest
null return is structurally unlike a confident-but-wrong verdict and cannot contaminate completed
ones). The cross-endpoint traceability check is in force **from cycle 6**. **Do not take this count
as current** — it is a snapshot; `RUN-LOG.md` is authoritative and moves daily. **If your task
touches `/api/reason`, `/api/guardrail`, `/api/practice/{fresh,watching}`,
the trust-core emission path, credential validation, or `project-context.ts`/`project-context.json`,
read `operations/handoffs/founder/2026-08-10-idea-loop-parallel-window-NEXT-SESSION-PROMPT.md`
FIRST** — it is a standing, re-read-every-session prompt with a pre-flight check (a blocking spec
in the scratch project? the run at its target range yet?) that determines whether your session is
routine build work, an urgent unblock, or a wrap-up. The scratch project itself
(`/Users/clintonaitkenhead/Claude-work/PROJECTS/idea-loop-validation-run/RUN-LOG.md`) is the
authoritative live record — more current than anything in this repo. If the founder is asking you
to act as the `sagereasoning`-side counterpart to that run specifically, use
`operations/handoffs/founder/2026-08-11-idea-loop-sagereasoning-companion-HANDOFF-PROMPT.md`
instead of this file (it is a different, narrower opener for that specific thread).

---

## Part A — Open under the standard protocol (Tier 1 — always; ~8–10 min)

Read, in order:
1. `/adopted/standing-protocol-cache.md` — session protocol, model selection (AC1), risk classification (0d-ii), the AI-failure-mode table (esp. *method/altitude-before-purpose* and *one-line operational hand-off*), the status vocabulary, the signals tables. **Note: PR1–PR24 now exist** — *corrected 2026-08-12; this line previously read "PR1–PR23", verified wrong by enumerating both `adopted/project-instructions-snapshot.md` and `adopted/standing-protocol-cache.md`, which agree.* PR20 (mentor briefs must name affected architectural surfaces before a ruling) landed earlier; **PR21–PR24 were adopted at ARC2 Session 1, 2026-08-10**, each put individually to the founder and none silently adopted: PR21 reflect-harvest (both read and write sides), PR22 model+effort commit trailers (mandatory, convention only — hook enforcement declined), PR23 memory-first triage (extended to code-*writing*), PR24 retention parity (with two open gaps queued: `agent_hold_observations` and `stoa_entries`).
2. `/adopted/build-sessions-protocol-cache.md` — read if the task is a substrate/trust-layer build session (Rule A licensing gate; Rule B holistic second pass; the no-current-users note; the TEST-run process).
3. `/adopted/project-instructions-snapshot.md` — the operative project instructions (**PR1–PR24** — corrected 2026-08-12, see item 1; verification framework 0c; Critical Change Protocol 0c-ii; risk classification 0d-ii; signals). **PR19 makes independent adversarial review REQUIRED**; **PR20 (new since 08-01) requires a mentor-consultation brief to name the specific existing mechanisms a ruling will land on**, before the ruling is requested — the whole agent-circles/Stoa/autonomous-loop programs below were run under this discipline and it repeatedly caught real gaps.
4. `/CLAUDE.md` — **the "Live in production" list, the "Agent-Organization + Evidence Program — status" section, the "Brand assets" section, and the most recent dated refreshes.** The single best current-state ground truth for the *substrate/trust-layer* surface. **Corrected 2026-08-12: this line previously warned that the Stoa program, the IDEA-loop build, R21/R22, and ARC2 were "not yet folded into CLAUDE.md" and that this opener was the more current document. That is no longer true — all of them, plus `/impulse` and the primal-substrate family, are folded in under CLAUDE.md's `2026-08-12 refresh` block, and its Production-state heading now carries an accurate as-of date.** One standing caution survives the fold: **CLAUDE.md's R20a perimeter count was the specific stale figure that propagated into a build scope. It now reads 14 route-level + 2 substrate-gate = 16, but any session quoting that number must re-derive it from the arrays in `website/src/lib/__tests__/r20a-invocation-guard.test.ts` — not from CLAUDE.md, and not from the test file's own header comment.**
5. `/operations/decision-log.md` — the **last 2–3 entries** (what just happened, and why) — as of this writing: `D-ARC2-SESSION3-CRED1-AUTH-SMOKES-2026-08-11`, `D-REASON-INPUT-CAP-VS-PROJECTCONTEXT-CONTAMINATION-FIXED`, `D-ARC2-SESSION2-NEXTJS-14-EOL-UPGRADE-TO-16-2026-08-10`.
6. **The most recent close is bifurcated — read the one matching your task:**
   - For ordinary `sagereasoning` build/governance work: `operations/handoffs/founder/2026-08-11-ARC2-session-3-cred1-auth-smokes-CLOSE.md` (the ARC2 arc's final close — all three sessions now discharged).
   - For anything touching the IDEA-loop run: `operations/handoffs/founder/2026-08-11-idea-loop-sagereasoning-companion-HANDOFF-PROMPT.md` + the scratch project's `RUN-LOG.md` (read fresh, not summarised).
7. **`git status`** — know the pending working tree before writing anything, and never treat another session's uncommitted records as yours to stage. As of this writing the expected strays are: `website/src/data/environmental-context.json` (modified, unrelated weekly-scan drift), and several untracked files — `a3-developmental-streak.py` (stranded A3 smoke driver), `brand/Brand_Guidelines_superseded.docx`, `sdk/typescript/package-lock.json`, `website/smoke_a_prod.json`, and four untracked IDEA-loop handoff prompts in `operations/handoffs/founder/` (`2026-08-10-bounded-validation-run-…`, `2026-08-10-idea-loop-cycle2-resume-…`, `2026-08-10-idea-loop-parallel-window-…`, `2026-08-11-idea-loop-sagereasoning-companion-…` — these four are **live, in-use, standing prompts for the run currently in progress; do not delete or "clean up" them as stray files**). All await the founder's disposition on the truly stray ones; the four IDEA-loop prompts should stay untracked-but-present until the founder elects to commit them (a live decision, not an oversight — check before assuming).

*Tier 2 (task-dependent — read only what the task touches):* the day's primary deliverable in full; `/manifest.md` targeted rules (**R0–R22** now, plus **three** deliberately un-numbered sections — the **Moral Community Boundary** (2026-08-12, immediately after R0; *added here 2026-08-12 — this line named only the other two*), the **ATRF framework section**, and the **Consciousness and Continuity Obligation** — see below) for `code-*` work; the relevant ADR for architecture work; `operations/agent-org-2026-07/agent-org-and-evidence-build-plan.md` for AO-program work; the S11 register (`operations/trust-layer-2026-07/S11-FLIP-PREREQUISITES-REGISTER.md`) for anything touching the flip prerequisites; `operations/reminders-2026-07/` for the human/agent practice-reminders arc; `operations/agent-circles-2026-08/` for anything touching agent circles, C2/C1c, or the IDEA loop's design corpus; `operations/connective-layer-2026-08/` for anything touching The Stoa.

---

## Part B — Ground in the current project state (confirm you can state these)

### Production state

The SageReasoning substrate is live at `www.sagereasoning.com`. Everything through this session's
close is pushed and Vercel-green. **Updated 2026-08-12:** this line previously said `git log --oneline -3`
"should show `c51b8c0`/`3a00351`/`f68d191`" — those are now four commits back (still *reachable*, but
not in the last three, so a session following it literally sees a false mismatch). `origin/main`'s
last three are now **`693ea65`** (S7 `/impulse` migration + R20a activation recorded) / **`98716d4`**
(S7 built dark) / **`243536f`** (the S5 moral-community manifest amendment), with **`e6af2e9`** (the
eleven-traits research, discharging D1) behind them. **Re-derive this rather than trusting it — it
goes stale every session that commits.** Beyond the 08-01 opener's list (still all live —
the examination engine, guardrail, accreditation, corroboration check, ADR-010 §4, S10, R20a
perimeter, AE-1/AE-2, practice-suggestion, B5, the human practice-reminders arc), **new since
2026-08-01:**

- **The whole website now runs on Next.js 16 / React 19** (ARC2 Session 2, forced by Next 14's
  EOL security advisory having no patch path in the 14.x line — this was NOT a routine bump). Two
  post-upgrade fixes landed: an ERESOLVE peer-dependency conflict (`react-simple-maps` forced via
  `overrides`) and a trivial merge. **Carried, not yet done:** a full manual smoke of every page
  class (the upgrade's own verification step), the `/community` CSP gap, `stoa-draft-reflect.ts`
  boundary-violation findings from that arc, and general lint debt — all named in the ARC2 Session 2
  close, none blocking.
- **C2/C1c — the fifth-circle orientation reading — LIVE (MEASURE) since 2026-08-08.**
  `SUBSTRATE_ORIENTATION_READING_ENABLED=true`. A credential-bearing `/api/reason` consult may
  now produce a directional `toward|away|indeterminate` reading (never fed back into the verdict,
  never returned on the consult response, never shown to the agent) that lands as an insert-only
  `'flag'`-effect trust event and surfaces, capped, on the public `GET /api/trust-record/{agent_id}`
  with an inline not-attestable clause and a `class: 'examined'|'observed'` field (the
  examined/observed delivery-class fold, added 08-08 after a genuine finding: 12 of the first 13
  readings were server-completed but the agent's own client had already timed out at 28s — an
  *observation*, not an *examination*, per the mentor's Stoic distinction). **This unblocked part
  (a) of the autonomous-loop's two-part blocking condition; part (b) (a genuine, mentor-reviewed
  post-fix production reading) closed the same day** — both conditions are now satisfied, and the
  autonomous-loop program below is the direct consequence.
- **The Stoa (the connective layer / practitioner directory) — LIVE, and now verified, not merely
  flag-confirmed.** **⚠ CORRECTED AGAIN 2026-08-12** (a second correction the same day, session
  `D-STOA-ST3-ST4-RETROACTIVE-ACTIVATION-RECONCILED-2026-08-12`) — the amendment above this line
  marked the flag's state `unverified` and left it as a founder-check item. **The founder confirmed
  it directly: `SUBSTRATE_STOA_ENABLED` is `true` in production**, and that session did the
  verification work the missing ST5 walk never did: **ST1** (`/community`, permanently de-graded) is
  live. **ST3** (`POST/PATCH /api/mentor/stoa`, the twelfth R20a perimeter member) and **ST4**
  (`/api/stoa/declare`, agent surface, correctly OUTSIDE the perimeter — its own recorded design
  decision) and the **browse route** (`GET /api/stoa/entries`) are all live and **now
  distress-check-verified live on production, both write paths, both directions** (a throwaway
  practitioner account: benign POST saved and incremented the row count; acute PATCH redirected with
  **zero write**, content and `updated_at` unchanged; benign PATCH saved correctly; acute POST on a
  second fresh account redirected with **zero row created**; all test artifacts torn down, count
  returned to baseline). **ST6** (the draft-mirror tool) remains live as before. **Real data exists**
  — 2 rows, both from 2026-08-03: one is the founder's own genuine declaration (still active,
  public, real email), the other a self-labelled agent smoke row (withdrawn). **The R18 public docs
  are live too, not staged** — landed 2026-08-08 inside an unrelated commit
  (`4dbd22f8b`, "C2d — the fifth-circle orientation reading..."), never recorded as its own event;
  re-verified against production (`llms.txt`, `agent-card.json` — 22 extensions, Stoa at #21,
  `STOA_ETHIC` byte-exact, no drift). The **anonymous-sign-ins-OFF** gate is confirmed (`false`, via
  Supabase's public `/auth/v1/settings` endpoint). The **q-filter pagination bound** holds (`limit`
  clamped to 200; the q-filter never scans beyond the fetched page). **Still genuinely open, and
  deliberately NOT resolved by AI judgement:** the **row-level reactivation guard** — the route's own
  code comment already names it as *"potentially a mentor question"* (the withdraw→re-declare
  recency-cycling residual); it stays a named, unscheduled mentor question. **What actually remains
  to activate:** the **Q5c/Q13a trust-event wiring** (curator-flagged claim contradictions;
  calling↔declaration divergence), built dark behind its own `SUBSTRATE_STOA_TRUST_EVENTS_ENABLED`,
  genuinely unactivated. A second mentor ruling on "curation via volume" (the recency-window gaming
  vector on S10, distinct from the already-shipped total-count disclosure) is a **named,
  unscheduled** follow-up mentor consultation. **The process lesson, worth carrying forward: a
  shared base flag makes "dark" a per-flag claim, not a per-feature claim** — one flag set once for
  one sub-item (ST6) silently activated three siblings gating on the same flag, and every subsequent
  record described them as dark for nine days before anyone checked.
- **R21 (Website Image Use Policy) and R22 (Human Creator Protection Commitment) — new manifest
  rules**, adopted 2026-08-09 verbatim from mentor instruction: all public-facing website imagery
  is human-created (a hard commitment, not sentiment); no AI-generated content substitutes for
  human creative work anywhere SageReasoning controls. R22 is a named, unresolved direction feeding
  the still-unbuilt permission-scrutiny-layer items (14–17, below) as three open questions
  (PL-HCP-1/2/3) — not pre-answered.
- **The ATRF (Agent Task Reasoning Framework) and the Consciousness and Continuity Obligation —
  new, non-numbered manifest sections**, added 2026-08-09. ATRF is the task-agnostic reasoning
  harness shape (pre-task reasoning record / post-task completion assessment / idea completion
  signal — *"nothing else is carried"*) the autonomous-loop's generation step is meant to
  eventually implement; it is **scoped as a future post-validation-run session, not built**. The
  Consciousness and Continuity Obligation names two long-horizon open questions (accumulated memory
  as a tractable future build; continuity of experience as a longer philosophical obligation) —
  explicitly *"neither is in the current build sequence."* Six further "Stoic items" (kathêkon/
  katorthoma at agent level, the four-virtue pre-task diagnostic, synkatathesis as a named
  assessment point, premeditatio malorum, the oikeiosis extension metric, hegemonikon stability)
  were relayed and transcribed in full 2026-08-09 — recorded, not adopted as build items; most are
  named inputs to the future ATRF scoping session.
- **The IDEA loop / autonomous-loop program — fresh, watching, and loop_id are ALL LIVE since
  2026-08-10.** `SUBSTRATE_FRESH_ENABLED`, `SUBSTRATE_WATCHING_ENABLED`,
  `SUBSTRATE_LOOP_ID_FIELD_ENABLED` are all `true` in production. `POST /api/practice/fresh`
  (structural novelty check), `POST /api/practice/watching` + `GET /api/founder/watching` +
  `/founder-watching` dashboard (per-cycle record table), and an additive `loop_id` field on
  `/api/reason` (stamped onto the orientation trust-event payload, never validated, pure
  passthrough) are all real, live, production surfaces. A dedicated runner credential
  (`sagereasoning:idea-loop@v1`, id `527cc86b-830b-4337-8fd7-ff28d9b0b5dc`, capabilities
  `consult`+`watching_write`) is minted and in active use — **see the box at the top of this
  document.** **The Q1 hard constraint holds throughout the whole program: the loop proposes, it
  never executes** — there is no code path anywhere from a generated candidate to an action-taking
  tool or scheduler.
- **`/impulse` — the primal-impulse examination tool — LIVE since 2026-08-12** (added at the
  2026-08-12 amendment; the 08-11 body predates it). `impulse_entries` applied on TEST and
  production; `SUBSTRATE_IMPULSE_R20A_ENABLED=true`; live distress smoke passed **both directions**
  (benign saves; an acute submission redirects and **no row is written**). **It is the fourteenth
  R20a route-level perimeter member, and a RULED DEPARTURE from every sibling
  Remaining-Principles tool** — those sit *outside* the perimeter with `SupportFooter` as their
  crisis exit; `/impulse` is *inside* it deliberately (mentor ruling B3), because it elicits
  `aischyne` and `agonia` by design and the premise is that the practitioner should not suppress
  that material. **Do not "correct" this membership as an inconsistency.**
- **The primal-substrate family (S1–S8) is COMPLETE** — `operations/primal-substrate-2026-08/`,
  index `00-PRIORITY-INDEX.md` (read that index, not this summary, before touching the family).
  Both blockers are **CLEARED**: **D1** (the eleven-traits research, now committed at
  `inbox/eleven traits research.rtf`) and **D2** (the B6 manifest wording, transcribed at S5). *Two
  of this opener's own D1/D2 lines were restated as open after both had cleared — that is one of the
  three drift instances that motivated the 08-12 amendment.* **One precision constraint the family
  inherits: the research is UNNUMBERED — cite traits BY NAME, never by number** (behavioural
  flexibility is ninth by order of appearance, not "the eleventh trait" as the synthesis calls it).
- **A real, four-month-latent production defect was found and fixed 2026-08-11**
  (`D-REASON-INPUT-CAP-VS-PROJECTCONTEXT-CONTAMINATION-FIXED`): `getProjectContext('condensed')`
  is called unconditionally on every `/api/reason` request (any caller, any credential — not
  IDEA-loop-specific) and was injecting an **unlabelled** block of `recent_decisions` prose into
  the Layer-1 extraction prompt, intermittently mistaken by the model for the practitioner's own
  reasoning. Fixed by labelling it identically to the already-labelled `domain_context`/
  `urgency_context` siblings. **A larger architectural fix was mentor-RULED but deliberately NOT
  built** — removing `projectContext` injection from API-key-authenticated `/api/reason` calls
  entirely — explicitly gated on the IDEA-loop validation run's cycle 4 completing cleanly (it
  did) but **not otherwise scheduled; do not build it unless the founder explicitly asks.**
  `practitionerContext`'s identical unlabelled defect was named but deliberately left untouched
  (narrow-scope instruction).

### The eleven days you may have missed (2026-08-01 → 2026-08-12, **~80** decision-log entries)

*(Count corrected 2026-08-12: this heading read "~60", re-derived as **80** entries whose ID carries an
August 2026 date — 86 headings mention one. The window is extended to 08-12 to cover the S5, S7-build,
and S7-activation entries; the four numbered threads below were written on 08-11 and do not describe
them — see the amendment box at the top and the two new Part B bullets.)*

Four threads, mostly run as founder-relayed mentor consultation ↔ scope ↔ PR19-adversarial-review ↔
ruling ↔ build cycles, each verbatim record winning over every summary including this one:

1. **Agent-Circles finished its core arc.** C1a/C1b/C3 (the first-circle correction) went live
   2026-08-02. C2 (the orientation reading) + C1c (its trust-event class, meaning **circle-5**,
   not the original build-plan's first-circle C1c — a real naming collision the mentor resolved
   08-06) were scoped, reviewed, ruled, built, PR19-reviewed twice (once falling back to first-hand
   review on an account session-limit outage, then a full independent re-run), signed off on their
   honest-claims wording, and activated live 08-08 — with a genuine post-activation finding
   (the examined/observed delivery-class gap) found, ruled, built, and live-verified the same day.
   **Two items remain from this thread specifically: the original first-circle C1c (failure/
   demonstration event classes) and D4 (the trust-ledger reducer's self-circle narrowing) — both
   unscoped, both named, neither blocking anything else.**
2. **The Stoa (connective layer) was designed and built end-to-end from a single day's mentor
   consultation** (08-02), through ST1–ST6 (see Production state above), with two further mentor
   consultations resolving Q5c/Q13a (curator-flagged trust events — three types, evidence-gated so
   a single curator flag can never originate a public record from nothing) and a nav-gap fix.
3. **The autonomous-loop (IDEA-loop) program is the largest single thread of the window** — from
   the C2/C1c "condition (b)" close (08-08) through eleven-plus rounds of scope → PR19-review →
   mentor-ruling (the design brief; the `fresh` scope; the `watching` scope; the generation-step
   scope — each independently reviewed and ruled, nearly always same-day), to three builds (`fresh`,
   `watching`, `loop_id`, each dark, each PR19-reviewed), to the runner-scoping session (08-10:
   identity mint, `watching_write` capability CHECK widening, all three flag activations, a real
   production defect found-and-fixed live by the session's own smoke — a PostgREST ambiguous-embed
   500 on the watching dashboard), to the bounded validation run now in progress. **The governing
   discipline throughout: PR20 (name the mechanism before ruling) caught several real gaps — most
   dramatically, a mentor instruction's own premise ("all three items will be live") was checked
   and found false (all three were still dark) before it was acted on, surfacing a genuine
   activation-ownership gap the mentor then had to rule on.** A second large sub-thread — the
   second-order impact analysis / permission scrutiny layer / governance permission field
   extension (dependency-graph items 14–16, plus item 17) — is fully **scoped and
   "approved as submitted"** by the mentor but **not built**, and not on the critical path to the
   validation run.
4. **ARC2 (this session's own arc) closed all three of its sessions**, discharging six items the
   2026-07-26→30 lesser-model week had silently dropped without a recorded outcome: process
   adoptions, the Next.js upgrade, and (today) CRED-1 + the four AUTH post-deploy smokes — the last
   of which surfaced one genuine finding (a fourth AE-2 throwaway credential still active since
   2026-07-19, now revoked) and one small named UX defect (a silent, message-less expired-reset-link
   failure state).

### The 0h launch hold-point

**Still active, unchanged in substance from the 08-01 opener.** P2 (the bare-vs-harnessed value
benchmark) is closed — "No benefit shown" under the frozen thresholds — and the founder's three
branches from the verdict memo §7 remain the standing decision (accept-and-close / one bounded
successor test / question the observable). **Nothing in this window's work resolves that call.**
What has changed: there is now a second, independent, currently-live piece of evidence-gathering
in flight — the IDEA-loop bounded validation run — which is a *different* question (does the
generative/proposing loop produce value, under a completely different architecture and gate
structure than P2 tested) and explicitly should not be read as revisiting or superseding P2's
verdict. The mentor's own boundary, restated at the close of condition (b): *"closing condition (b)
opens the path to scoping the design brief. It does not open the path to building it."* — the
build/validate/report/standing-design sequence has its own gates throughout, distinct from the 0h
call.

### Threads (updated)

1. **The Trust Layer** (ADR-013/ADR-014): S1–S10 Live under MEASURE, **now joined by C2's
   orientation-reading surface** (also MEASURE; weights BLOCKED throughout, unchanged). The founder's
   own loop (`sagereasoning:s9-loop@v1`, gen-2) continues to run framed intermittently — the 28s
   transient-timeout class recurs constantly across this whole window and is expected, not a fault.
   A real four-session 401 outage this window was root-caused to **daily-quota exhaustion masked by
   a route-level status-collapsing bug** (`/api/reason` treats a 429/503 API-key failure as "no key"
   and falls through to a misleading plugin-auth 401) — the founder raised the credential's limits
   as a live fix; **the underlying status-masking bug is a named, unbuilt follow-up** (its own
   `code-elevated` session). A second named-not-built follow-up: the reflect-path close-hook persist
   passes a non-UUID `loop_id` to loop-billing metering (fails soft; the persist itself succeeds).
   Register items **D4**, **AE-3**, **P1**, **P6/P7/P8** remain open, unchanged from 08-01.
2. **The Agent-Organization + Evidence Program**: unchanged from 08-01 — P0/P1/P3/P4/P5/P5b/P-GL
   done, P2 closed, P6/P7/P8a/P8b not started.
3. **The website/practice thread**: unchanged base (brand+nav, the human practice-reminders arc)
   **plus the whole Stoa program** (above) as a major new addition. Open product decisions from
   08-01 (journal UTC pace-gate mismatch; the day-55 evening-pole terminal case) are unchanged and
   still open.
4. **The IDEA-loop / autonomous-loop program** (NEW as its own thread — supersedes and absorbs most
   of what the 08-01 opener called "the Agent-Circles program" for anything past C2). Currently the
   most operationally live thread in the project: a real production process running right now. See
   the box at the top of this document and `operations/handoffs/founder/2026-08-10-idea-loop-parallel-window-NEXT-SESSION-PROMPT.md`
   for how ordinary build sessions should relate to it.
5. **ARC2** (process-adoption + Next.js EOL upgrade + CRED-1/AUTH-smokes) — **CLOSED, all three
   sessions discharged, no further ARC2 session exists.**

---

## Standing queue (none self-start; the founder sequences)

*Prepared / no-policy-question next steps:*
0. **The IDEA-loop bounded validation run continues** — no action needed from most sessions beyond
   the pre-flight check in the parallel-window prompt; if a blocking spec appears in the scratch
   project, that becomes the actionable item (Mode 1 of that prompt).
1. **`SUBSTRATE_CREDENTIAL_LOOKUP_RETRY_ENABLED` activation** — carried unchanged from 08-01, still
   dark, still the highest-leverage no-decision step for the intermittent 401 class (though now
   partially superseded in urgency by the quota-exhaustion root-cause finding above — check
   `gate1.log`'s current profile before assuming this is still the dominant cause).
2. ~~**The mentor's live-page factual amendments**~~ — **DONE 2026-08-10, and this item was stale
   the day this opener was written.** Verified 2026-08-12 at source: `website/src/app/limitations/page.tsx:48`
   carries the amendment with its own reasoning comment, and `/welcome` links to it. **It did not
   close cleanly, and the residue matters more than the item did:** the mentor's prescribed single
   formulation ("the core reasoning is produced by a deterministic engine") is true of the **agent**
   surfaces only — every human-facing evaluation route calls `runSageReason`, a single Claude call —
   so applying it to the practitioner pages would have replaced one false statement with another. A
   **per-surface** correction was applied instead, and **the collision is a live PR20-class item for
   the mentor's next consultation** (the diagnosis was right; the remedy was written without
   visibility into which engine the practitioner routes call). Comments at both sites warn against
   "simplifying" it back into a single blanket claim in either direction — **do not.**
3. **Resend email provisioning** — carried unchanged from 08-01. **No activation record exists in
   the decision log; the production environment cannot be read from a repo session, so its live
   status is `unverified`.** Note it now blocks a second thing: **Stoa subscriptions (ST7)**.
4. **07-25 audit §7 — re-verified 2026-08-12; "never-run" is no longer accurate for two of three.**
   The **observability retention sweep is BUILT DARK** (`GET /api/cron/observability-retention-sweep`,
   handler-split, CRON_SECRET-gated, behind an unset `SUBSTRATE_OBSERVABILITY_SWEEP_ENABLED`, no
   `vercel.json` entry; independently reviewed, three confirmed defects folded) — what remains is
   its **activation**, not its build. The **Next.js exposure assessment is SUBSUMED** by the ARC2
   Session 2 upgrade to Next 16 / React 19 — this half of the item is closed. The
   **process-adoption governance session's remaining pieces** were largely discharged at ARC2
   Session 1 (PROTO-1 retired on evidence; PR21–PR24 adopted); what survives is PR24's two named
   retention-parity gaps (`agent_hold_observations`, `stoa_entries`).
5. **The `/api/reason` status-masking fix** (429/503 API-key failures collapse to a misleading 401)
   — new this window, named, not built. `code-elevated`, AC7.
6. **The reflect-path `loop_id` UUID metering bug** — new this window, named, not built. Small,
   fail-soft.
7. **The `target_circle`/blast-radius persistence gap** — `idea_loop_candidates` does not persist
   `targetCircle` despite one mentor-relayed review's claim that it does; a future founder-walked
   additive migration whenever the blast-radius indicator (item 14) is first built.
8. ~~**Fold this window's programs into CLAUDE.md**~~ — **DONE 2026-08-12**
   (`D-GROUNDING-RECORD-RECONCILIATION-2026-08-12`). The Stoa, the IDEA-loop surfaces, R21/R22, the
   three un-numbered manifest sections, ARC2's closure, `/impulse`, and the primal-substrate family
   are all folded into CLAUDE.md's Live list and its `2026-08-12 refresh` block; the stale perimeter
   count is corrected at both sites and flagged as a re-derive-don't-quote number.
9. **Teardown SQL for the runner-scoping session's `#smoke` test row** — **status `unverified`.**
   Searched `RUN-LOG.md` for `#smoke` 2026-08-12: **no match**, so the run log neither confirms nor
   denies execution, and this cannot be settled from the repo. Confirming it needs a founder check
   or a production query. Do not restate it as either done or outstanding without one.
10. ~~**CONFIRM `SUBSTRATE_STOA_ENABLED`'s live state in Vercel**~~ — **DONE 2026-08-12**
    (`D-STOA-ST3-ST4-RETROACTIVE-ACTIVATION-RECONCILED-2026-08-12`). Confirmed `true`. ST1/ST3/ST4/
    browse/ST6 are all live; ST3's distress-check was live-verified both directions, both write
    paths, on production, retroactively. See the corrected Live-Stoa bullet above.
11. **`/impulse` post-activation: the app-wide RLS-vs-route-enforcement gap** — new 2026-08-12,
    PR19-found at the S7 build and **mentor-confirmed as correctly dispositioned** (a local fix
    would be a false guarantee; the same client can write to any other intimate table the same way).
    Unscoped, founder-elected, blocking nothing — **but the mentor ruled on its internal ordering:
    when that session opens, `impulse_entries` must be the FIRST table it addresses**, because it is
    *"the one table in the application where a route bypass reaches the exact population the
    perimeter exists to protect."*
12. **The C15 three-enumeration circle discrepancy** — new; `manifest.md` R0 has four oikeiosis
    circles, `stoic-brain.ts:445` has five, and the trust core's `OikeiosisCircle` has five in a
    different vocabulary. **Unscoped, blocking nothing.** The S5 amendment deliberately declined to
    resolve it (doing so there would have silently changed R0). Note `stoic-brain.ts` is imported
    directly by `api/guardrail/route.ts` — **editing it breaks measurement byte-identity**, so this
    is not a trivial reconciliation.
13. **Parked on the validation run's §6 report** (none self-start, all named in
    `operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md`): **S4's watching-table extension**
    (an additive migration, its own founder-walked 0c-ii Critical step); **S6's reordering
    decision**; the **GS-ATRF-2 three-column watching-row migration** (founder-walked, not before);
    and the **ATRF scoping session**, which inherits the justice carry-forward recorded at
    `operations/primal-substrate-2026-08/gs-atrf-corrections.md` §(d). The ATRF session is
    explicitly **post-validation-run — "do not open early."**

*Founder decision items (policy, not build):*
14. **The 0h call on P2's three branches** — unchanged, the standing gate above everything else.
15. **The logos byte-identity guard — scope or retire.** Carried unchanged from 08-01.
16. **Input-cap Steps 2/3** — carried unchanged from 08-01.
17. **Stoa activation — CORRECTED 2026-08-12, premise was false.** ST1/ST3/ST4/browse are already
    live and distress-check-verified (item 10, done). **What actually remains is the Q5c/Q13a
    trust-event activation only** (`SUBSTRATE_STOA_TRUST_EVENTS_ENABLED`, genuinely dark — both it
    and `SUBSTRATE_TRUST_CORE_ENABLED` required to emit, deliberately). Whether/when to run that
    activation is the founder's call (a pre-activation checklist + a pre-built evidence-gate
    cross-check query both exist and are ready, `operations/connective-layer-2026-08/`).
18. **The Stoa "curation via volume" second mentor ruling request** — named, unscheduled, distinct
    from the already-shipped total-count disclosure.
19. **The original build-plan C1c + D4** — both unscoped, both named, neither blocking anything.
20. **Items 14–17 (second-order impact / permission scrutiny / governance permission field /
    the intent-vs-assessed-quality trust event)** — fully scoped and mentor-approved, not built, not
    on the critical path. Building any of them is a founder-elected `code-critical` decision, not a
    default next step.
21. **The ATRF scoping session** — explicitly a **post-validation-run** item per the mentor's own
    sequencing; do not open early.
22. **The standing-runner design** (what happens after the bounded validation run reports) —
    explicitly gated on the run's own §6 report reaching the mentor; not to be pre-scoped.

*Trust-layer named steps (no prompts authored, unchanged from 08-01):* register **D4**; **AE-3**;
register **P1**; eventually the S11 readiness re-examination.

---

## Part C — Understand the trust-layer harness + its capabilities

Read: `operations/trust-layer-2026-07/2026-07-11-trust-layer-harness-completed-state-summary.md`
(now further out of date than the 08-01 opener already flagged — add the items below on top of the
08-01 opener's own additions, which still stand: the S11b composed input, AE-1/AE-2, A1/A2
practice-suggestion, B5). Come away able to state, in addition to the 08-01 opener's summary:

- **C2 added a fifth signal class to the trust core**: the orientation reading (`toward|away|
  indeterminate`), computed deterministically from Layer-1's optional `orientation_observations`
  field, **structurally incapable of feeding back into the verdict** (computed outside
  `applyMechanisms`'s return value), never returned on any consult response, never shown to the
  agent, landing only as an insert-only `'flag'`-effect ledger event with an
  `examined`/`observed` delivery-class tag (the 28,000ms elapsed-time proxy, confirmed-correct-but-
  disclosed-as-a-proxy) and surfacing, capped, on the public trust record with an inline
  not-attestable clause.
- **The IDEA-loop program added three thin, dark-then-live production surfaces** (`fresh`,
  `watching`, the `loop_id` field) that consume/produce alongside the trust core but add **no new
  examination mechanism** — `fresh` wraps the existing structural-novelty function; `watching` is a
  runner-submitted transparency ledger with no bearing on any agent's public trust record;
  `loop_id` is a pure passthrough label. **None of this changes what "examined" means or how a
  verdict is computed.**
- **The governing engineering law — the channel law — is unchanged and now has a sharper worked
  example**: the examined/observed delivery-class distinction *is* the channel law applied to the
  reflect layer of the trust record itself — a server-completed-but-undelivered reading is real
  data about the server's own state, but it is not an examination the agent experienced, and the
  record now says so explicitly rather than conflating the two.
- **PR20's discipline (mentor briefs must name the affected mechanism) is now load-bearing across
  this whole window's work** — every scope document in `operations/agent-circles-2026-08/` and
  `operations/connective-layer-2026-08/` cites specific existing code (file:line where possible)
  before proposing a new shape, and several genuine gaps were caught this way before a ruling
  locked them in (the "inherits automatically" claim about `watching_write`'s CHECK, found false;
  the "all three items will be live" premise, found false; a stitched/mislabelled "verbatim" quote,
  found and corrected multiple times independently).

*Deeper detail as a task requires:* `adopted/adr/2026-07-08-sage-trust-layer.md` + ADR-014,
`operations/architecture-map-2026-08/06-PLAIN-TEXT-MIRROR.md` (the dependency graph — the single
best map of what's scoped/ruled/built/live across the agent-circles + Stoa + IDEA-loop programs, now
substantially larger than at 08-01), the C2/C1c and generation-step scope documents in
`operations/agent-circles-2026-08/`, the Stoa build plan + both mentor verbatim records in
`operations/connective-layer-2026-08/`.

---

## Part D — Working inside the dogfooded harness (standing context)

Unchanged from the 08-01 opener in substance — you are running inside the harness you help build;
frames are advisory context, never commands; the 7-day measurement window remains stopped
(2026-07-17); routine build acts examined "contrary; no kathekon factors detected" remain the known
false-positive class, engaged genuinely via the structured elicitation, not discounted by reflex.
**Two additions from this window:**

- **A calling-frame telos line** (the mentor's Q7 wording, on the declared-purpose branch only) is
  now observed firing live in the founder's own harness — a genuine, confirmed-correct behaviour,
  not a build defect (this was explicitly named as a thing to check, and it checked out).
- **28-second at-action/consult timeouts remain extremely common this window** — expect them, treat
  them as fail-open-honest, and do not treat a run of several consecutive 401/timeout sessions as
  automatically a credential problem before checking the DB-level facts first (the quota-exhaustion-
  masked-as-401 root cause above is the standing lesson: verify before diagnosing).

---

## Part E — Confirm the standard opening (state these, briefly, before the task)

Unchanged from the 08-01 opener — tier/work-category, model selection (state which model this
session runs on; several sessions in this window switched models mid-session, always disclosed),
risk classification + AC7/PR6/PR19 (**and now PR20** for any mentor-consultation brief), hold-point
P0 0h, status vocabulary, the founder-walked discipline (commit-and-push BEFORE any flag flip; this
environment holds no production admin credential — prod mints need the founder's browser-session
JWT via `MINT_CLI_ADMIN_JWT`, used successfully repeatedly this window), bare-SQL verification
blocks, and the Opus-5 session-model calibration notes (still relevant whenever Opus 5 is the
session model — several sessions this window ran Fable 5 or Sonnet 5 instead, per explicit founder
election each time; the same calibration doesn't automatically apply, ask if unsure).

---

## Part F — Now state the task

With the foundations in place, **state the task** (if you haven't already). The session will then:
declare its tier + risk for that task, read the task-specific deliverables (Tier 2), check whether
the IDEA-loop parallel-window prompt applies (the box at the top of this document), and proceed
under the protocol — grounded, honest, and scope-aware.

*Reusable across sessions. Update when the ground state shifts materially (a thread closes, a flip
lands, a new program adopts, the bounded validation run completes) — archive the prior version to
`archive/` with its date, per this file's own convention. The 0h call remains the founder's.*
