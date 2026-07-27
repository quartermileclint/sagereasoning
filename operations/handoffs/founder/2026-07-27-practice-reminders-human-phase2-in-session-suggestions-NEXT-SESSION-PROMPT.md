# Next-Session Prompt — Practice Reminders Phase 2: The In-Session Trigger

**Stream:** founder (website build).
**Tier:** `code-elevated`.
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache; deliverables named below).
**Predecessor session close:** `operations/handoffs/founder/2026-07-27-step-M-verdicts-adopted-CLOSE.md`.
**Predecessor decision-log entries:** `D-PRACTICE-REMINDERS-STEP-M-MENTOR-VERDICTS-ADOPTED-2026-07-27`, `D-STEP-M-BRIEFING-AUTHORED-AND-PHASE4-DAILY-RHYTHM-BUILT`.
**Risk classification:** Elevated under 0d-ii (changes to existing user-facing functionality — several tool routes gain an additive response field; tool pages gain a rendering block). Critical Change Protocol NOT engaged — no schema, flag, auth-model or deploy-config change is in scope. AC7/PR6 not engaged. KG1 awareness (the routes stay read/insert as they are; the new field is response-composition only).

## Where the arc stands

Phases 0, 1 and 4 are **live** (milestone awarding; the sequence trigger; the daily rhythm strip). **Step M is answered and adopted as binding** — the vetted mapping table is in the human plan §7, and the verbatim record at `operations/reminders-2026-07/2026-07-27-step-M-mentor-verdicts-verbatim.md` **wins over every summary, including §7's table and anything in this prompt**. Phase 2 (this session) and Phase 3 are unblocked. Phase 2 is the mentor's *in-session trigger*: "the suggestion emerges from the diagnosis, not from a schedule."

## Why this session matters

This is the phase where the tools stop only grading and start teaching — the school model's core move, the teacher naming the next practice at the moment the diagnosis warrants it. The content is fully specified; what remains is faithful mechanism.

## Pre-conditions

1. The Step M adoption commit is pushed (check `git log` for "Adopt the Step M mentor verdicts"; if absent, it is still local — fine for building, say so in the close).
2. `git status` clean apart from other threads' carry-forwards (`environmental-context.json` has been sitting modified — not yours to stage).
3. **Run all eight `human-practitioner-boundary` suites first** (the logos suite's repo-global git byte-identity guard fails on a dirty measured file — know before you start):
   ```bash
   cd website && for f in $(find src -name 'human-practitioner-boundary.test.ts' | sort); do printf "%-58s " "$f"; npx tsx "$f" 2>&1 | grep -oE '[0-9]+ passed, [0-9]+ failed'; done
   ```
   Expected at open: 466 / 466 / 355 / 626 / 479 / 527 / 466 / 249, all 0 failed. Also `npx tsx src/lib/__tests__/practice-sequence.test.ts` → 367/0 and the render suite (`npx tsx --tsconfig tsconfig.rendertest.json src/components/__tests__/daily-rhythm-strip.test.tsx`) → 53/0.

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min).
2. **`operations/reminders-2026-07/2026-07-27-step-M-mentor-verdicts-verbatim.md` in full** — the binding content spec for this phase. Where anything below diverges from it, it wins.
3. The human plan — **§1 (constraints), §7 (the VETTED table + status block — your build spec), §11 (boundaries)**.
4. The predecessor close; `/operations/decision-log.md` last 2 entries.

Confirm at open: tier; hold-point (P0 0h — unaffected); model (**no LLM calls in this phase's product code** — the suggestions are deterministic lookups over stored classifications; AC1 N/A row); status vocabulary; signals.

## Part B — Procedure

### Step 0 — Constraints that shape the build

**A. Measurement neutrality (§11).** The 7-day observation window measures `/api/reason` + `/api/guardrail`. No file in either import graph may be edited — `stoic-brain.ts` and `security.ts` included. The logos suite's byte-identity guard is the tripwire; run it after every batch of edits, not only at the end.

**B. The mapping lives in `practice-sequence.ts`, which is ZERO-IMPORT.** Any vocabulary it needs (the sub-species→target mapping, family groupings) is declared **locally** and pinned against the canonical source **by the test** (the `PROXIMITY_LEVEL_ORDER` precedent — the test imports the canonical module; the lib never does). The canonical sub-species vocabulary lives in the passion-classify route's prompt and `brand-display.ts`'s `PASSION_IMAGE_MAP` grouping; `passion_events.passion_type` and `llm_classified_type` both store sub-species ids (verified 2026-07-27) — the **differentiated** mapping branch is the operative one.

**C. Strings are exported values, verbatim-pinned.** The J4 whole-object-pin precedent from Phase 4 — a non-empty-string loop is not a copy pin, and this phase's strings ARE the doorbell boundary. Every `line` template verbatim-pinned; the gamification sweep (`ALL_COPY` in the unit suite) must include the new copy object — Phase 4's review proved that guard silently skips any surface not added to it.

**D. Rate limits / buckets.** The tool routes already exist with their own auth + limits; you are adding response composition, not new routes. Do not add a `RATE_LIMITS` category (that edits `security.ts` — forbidden by A).

### Step 1 — Ground first-hand

Read: the §7 vetted table against the verbatim record; each target route this phase touches (`/api/mentor/passion-log`, `/api/mentor/view-from-above`, `/api/mentor/premeditatio`, `/api/mentor/oikeiosis`, `/api/mentor/hupexairesis`, `/api/mentor/sage-compass`, `/api/mentor/morning` — confirm which have PATCH as well as POST) and each page's result-rendering block; the score flow's save path (row 13's host — note `action_evaluations_v3` writes happen in `score/page.tsx`'s flow, not a `/api/mentor/*` route; decide the attach point there deliberately); `/logos`'s section ids for row 11's targeted anchors (`src/app/logos/page.tsx` renders `id={...}` per section — enumerate the actual virtue ids); `classification_match` on `passion_events` (the 6b disclosure trigger).

### Step 2 — The mapping module

In `practice-sequence.ts` (zero-import, per B):
- The locked signal→suggestion table exactly per §7's vetted rows, including every silence row as an explicit honest-null entry (the mentor: "the silence rows are doing important work").
- The two line forms as exported, pinned copy: the standard form *"This entry showed ⟨basis⟩. ⟨Practice⟩ is suited to examining it further."* and the 6b disclosure form *"You named this as ⟨X⟩. The engine read it as ⟨Y⟩. ⟨Practice⟩ is suited to examining the difference."* — pre-authored per-row `basis` phrasings, never composed at runtime, never LLM-authored.
- The 6b resolution rule as a pure function: engine's reading governs; disclosure form only when they disagree AND the engine's reading fires; agreement → standard; engine fires nothing → silence; disagreement is never itself a trigger.
- Row 5's pattern rule as a pure function over the recent events the route already has access to (pick and pin a window; the mentor fixed the *principle* — pattern, never single instance — the window size is yours to set and disclose).
- One-suggestion-max structural (the resolver returns at most one row by fixed precedence).

**Build decisions the verdicts leave open (make them, record them):** the aischyne target (log-revisited-with-mirror-framing vs morning preparation — note a same-tool "revisit" renders as an invitation line on the entry, which is still a doorbell); the row-5 window; whether row 13's suggestion attaches to the score save response or the score result page load.

### Step 3 — Wire the routes + pages

Each tool's save response gains the additive, optional `suggested_practice` field; each page renders it beneath the existing quality-gate block; absent field ⇒ nothing renders. Additive-only: every existing response field byte-identical (assert in each route's boundary suite). Extend each touched route's `human-practitioner-boundary.test.ts` — and remember the Phase 1 lesson: **an unguarded shipped file is how a forbidden import arrives later**; any new component joins a TARGET_FILES list.

### Step 4 — Verify

- Unit tests per vetted row **including every silence row** and the 6b four-branch rule; the one-suggestion invariant; strings as exported values.
- All eight boundary suites; unit 367+/0; render 53/0; `tsc` 0; **`npm run build` 0 (mandatory — route/page changes)**.
- **Mutation-test every new pin; verify each mutation applied AS INTENDED, not merely that the file changed** (Phase 4's false-survival lesson: shell escaping ate an interpolation and the "mutation" injected nothing — prefer `python3` string replacement over `perl` for anything containing `$`/backticks).
- **Timezone-sensitive assertions pin their own TZ** (the Phase 4 headline: under `TZ=UTC` a local-day pin was vacuous). Row 5's window logic is date-arithmetic — same trap.
- Browser walkthrough on the dev server (TEST — signed-in states settle at the founder's post-deploy check; say so).

### Step 5 — Adversarial review (PR19)

4 dimensions + a single refuter pass — the Phase 4 sizing, which **completed fully** (~2.6M tokens, no spend-limit death) where 6-dimension versions died. Dimensions that earned their keep: verdict-fidelity (the built table vs the VERBATIM record — not vs §7's summary), rendering/language against constraint 1, blast-radius/measurement-neutrality, test-adequacy incl. files the diff does not touch. If it dies, complete first-hand and disclose the single-perspective limit.

### Step 6 — Records

Lean decision-log entry; close with a ready-to-paste commit block; update §7's status line to BUILT; name Phase 3 as successor. Founder-facing SQL in `sql`-tagged blocks, never `psql` wrappers.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + verbatim record + §7 + grounding | 30–40 min |
| Step 2 — mapping module + copy | 45–60 min |
| Step 3 — routes + pages | 60–90 min |
| Step 4 — verify incl. mutation testing | 40–50 min |
| Step 5 — review | 25–35 min |
| Records + close | 25–30 min |
| **Total** | **~4–5 h** |

If time runs short: the mapping module + one tool wired end-to-end (the passion log — it carries the most rows and the 6b mechanism) is a legitimate stopping point; say which rows shipped.

## Rollback path

`git revert` the session commit — additive response fields, page rendering blocks, the mapping module additions, tests. No schema, no flag, no migration.

## Open items carried (not this session's work)

- **R17 on `milestones`** — oldest item; Critical, founder-walked; gates external onboarding.
- The journal UTC pace-gate mismatch (chip `task_4cee2a1c`) and the day-55 evening-pole terminal case (chip `task_197803bb`).
- `/api/milestones` + `/api/baseline` on the `scoring` rate-limit bucket.
- The optional returning-line refinement (founder-electable).
- `oikeiosis_context` never written → two milestones unearnable.
- Phase 0's and Phase 1's reviews lost verifiers to the spend limit; independent re-runs remain worthwhile.

## Forecast

Success = each practice tool answers a qualifying entry with exactly one mentor-vetted, pre-authored suggestion — or an honest silence — with the engine's reading governing and disagreement disclosed, never hidden. That leaves **Phase 3** (the stage-crossing card, copy now vetted) as the arc's last unbuilt phase, and the agent plan ready behind it.

End of prompt.
