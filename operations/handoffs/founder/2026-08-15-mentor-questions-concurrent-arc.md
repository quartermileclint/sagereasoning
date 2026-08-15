# Mentor questions — drafted 2026-08-15 for the founder to take now (concurrent-arc planning)

**Prepared under PR20:** each question names the specific existing mechanisms (file:line where
possible) the ruling will land on, before the ruling is requested. Drafted by the 2026-08-15
planning session (`D-CONCURRENT-ARC-PLAN-AND-MENTOR-QUESTIONS-2026-08-15`); companion to
`2026-08-15-concurrent-arc-plan.md`. Ordered by leverage. Questions M1 and M2 gate parts of the
arc sequence; the rest can ride this consultation or a later one.

> **Addendum 2026-08-15 (same day):** the founder held the mentor's response to M1–M6 pending
> review of the self-examination-moment material from the same session's closing exchange. That
> review ran (`operations/future-directions/2026-08-15-self-examination-moment-investigation-and-response.md`):
> **M1–M6 stand unchanged; M7 is added** (ratify or amend the guide-reflection design). The annex
> is updated — Prudence Group open question 1 is **resolved** by the same session's two-guide
> convener ruling (executed as Amendment P-A1), so the annex's "Q1 most pressing" flag is
> superseded; Q2 (the wiki second-order audit) is now the most pressing there.

---

## M1 — The logos byte-identity guard: still binds, narrow, retire, or make window-conditional?
*(The single highest-leverage ruling on the standing queue — it settles six-plus blocked items at
once. The founder has already fixed execution timing: whatever is ruled, the blocked edits land
post-run.)*

**The mechanism.** `website/src/app/logos/__tests__/human-practitioner-boundary.test.ts`, section
C ("THE GIT BYTE-IDENTITY GUARD"), `GUARD_RE` at line 418:

```
/api\/reason|api\/guardrail|guardrail-sandwich|sage-reason-engine|reasoning-receipt|translation-sandwich|\/substrate\/|trust-core|kathekon-engagement|false-hold|harness\/gate1|layer1-extractor|layer2-mechanisms|sage-reflect|stoic-brain/i
```

It fires on **uncommitted `git status --short` lines** whenever the boundary battery runs, and
separately SHA-256-freezes `website/src/lib/stoic-brain.ts` (§C2). Its own header scopes it
*"while the observation window runs."* **The observation window has been stopped since
2026-07-17** (`GATE1_FALSE_HOLD_CAPTURE` unset; the 130-record buffer frozen as evidence). The
code is unconditional.

**What it currently blocks** (all queued post-run):
1. The mentor-instructed **L4 audit header amendment** (exact pending text preserved in
   `D-FIVE-PRINCIPLES-AND-GUIDE-FUNCTION-RULINGS-EXECUTED-2026-08-12`;
   `website/src/lib/substrate/trust-core/l4-passion-audit.ts`).
2. The mentor-instructed **sympatheia citation fix**, elevated to load-bearing
   (`stoic-brain/stoic-brain.json:151`, Meditations 4.26 → 7.9, plus the DL 7.38 cite in the same
   entry) — the fix recompiles into the SHA-frozen `stoic-brain.ts`, so it trips both halves of
   the guard.
3. **Register D4** — the trust-ledger reducer's self-circle narrowing
   (`website/src/lib/substrate/trust-core/derive-trust-events.ts:165`,
   `deriveWorstJusticeOutcome`), coupled with D1's cap logic.
4. **AE-3** (trust-core paths).
5. The **reflect-path `loop_id` metering fix** (the close-hook lives under `harness/gate1`, a
   match this planning session verified — broader than earlier lists recorded).
6. **PR24's `agent_hold_observations` retention half** (`false-hold` paths — likewise verified).
7. The **trust-record payload total-unknown note** and any **new false-hold-window capture code**
   (`/substrate/` and `false-hold` matches respectively).

**An honesty point the ruling should weigh.** The guard has been applied inconsistently since the
window stopped: AE-2 (2026-07-19), B5 (2026-07-30), S7/impulse and the Q5c/Q13a payload fold
(2026-08-12) all landed edits on guard-matched paths (`trust-core`, `/substrate/`) — while the
2026-08-12/15 sessions treated the guard as binding and queued their edits instead. The
inconsistency itself argues for an explicit ruling rather than continued case-by-case judgement.

**The options as we see them (not pre-decided):**
- **(a) Retire** — rely on the §C2 `stoic-brain.ts` SHA freeze plus each change's own batteries
  and PR19 review; delete §C's git-status check.
- **(b) Narrow** — bind only the true `/api/reason` + `/api/guardrail` import graph (dropping
  `harness/gate1`, `false-hold`, `sage-reflect`, and the blanket `/substrate/` match), so
  measurement byte-identity is still guarded but adjacent tooling is not.
- **(c) Make it window-conditional** — the guard binds **iff** `GATE1_FALSE_HOLD_CAPTURE` is on,
  restoring its own header's stated scope. Note the interaction: the arc plans to START a new
  observation window as the LAST step of its post-run activation batch, so under (c) the guard
  would re-arm exactly when its rationale returns.
- **(d) Keep unconditional** — accept the blocks and route every listed item through explicit
  per-edit exemption decisions.

## M2 — The three OPEN scoping sessions: who runs them?

**The mechanism.** Three records in `operations/agent-circles-2026-08/`, all `governance`, all
marked `OPEN — awaiting ruling`:
`2026-08-12-SESSION-kathekon-role-relative-evaluation-SCOPING-RECORD.md`,
`2026-08-12-SESSION-hegemonikon-drift-and-melete-SCOPING-RECORD.md`,
`2026-08-12-SESSION-layer3-per-consumer-rendering-SCOPING-RECORD.md` (the last now carrying the
2026-08-14 widened Stage 2 relational-context scope).

**The question, verbatim from the standing queue (item 23):** does "awaiting ruling" mean the AI
runs each session and produces a scope document *for* ruling, or does the mentor rule directly on
the recorded session questions? If the former, the arc runs them as two concurrent documents-only
sessions during the validation run; if the latter, the arc waits for rulings and folds execution
into post-run sessions.

## M3 — The Stoa row-level reactivation guard

**The mechanism.** `website/src/app/api/mentor/stoa/route.ts:104` — the route's own comment names
this *"a named follow-up, potentially a mentor question."* The residual: a practitioner can
withdraw and re-declare to cycle recency (renewal deliberately never reorders — `declaredAt` is
fixed and `renewedAt` moves — but a fresh declaration after a withdraw starts a new row). Should a
row-level reactivation guard bound this, and if so by what rule (e.g., a re-declare within N days
of a withdraw inherits the prior `declaredAt`)? Q5c/Q13a's curator-flagged trust events are live
context: divergence is now visible on the trust ledger, which may or may not be sufficient.

## M4 — The limitations-page wording collision (carried PR20-class item)

**The mechanism.** `website/src/app/limitations/page.tsx:48–56` — the prescribed single
formulation ("the core reasoning is produced by a deterministic engine") is true of the **agent**
surfaces only; every human-facing evaluation route calls `runSageReason` (a single Claude call).
A per-surface correction was applied 2026-08-10 with comments at both sites warning against
re-simplifying in either direction. The diagnosis was right; the prescribed remedy was written
without visibility into which engine the practitioner routes call. Question: does the per-surface
formulation stand as the durable wording, or does the mentor want a revised single formulation
that is true of both surfaces?

## M5 — The boulesis/sufficiency distinction (S3 §5-Q3-e)

**The mechanism.** `operations/primal-substrate-2026-08/` S3's §5-Q3-e holds the distinction open
as a **build-blocker**: *"do not build on that distinction until it has been examined"* — it
blocks Q3-d, and the ATRF scoping session (post-run) inherits the sufficiency-examination trigger
content that leans on it. **Timing note:** this can ride the present consultation or the §6-report
consultation — but it must be ruled before the ATRF session opens, so answering it now removes the
one doctrinal dependency from that session's critical path.

## M6 — The curation-disclosure sentence on the total-unknown branch (minor)

**The mechanism.** The composition-effect disclosure now rides the live
`GET /api/trust-record/{agent_id}` payload's `notes` array on the **total-known** branch only
(`D-CURATION-VIA-VOLUME-FOLDED-INTO-LIVE-PAYLOAD-2026-08-12`; the wording as ruled depends on the
total being known). The recorded low-severity follow-up: should the **total-unknown** branch carry
an adapted disclosure, and if so, what wording? (The fix itself is queued in the post-run bundle;
only the wording is needed.)

## M7 — Ratify or amend the guide-reflection design (added 2026-08-15, from the
self-examination moment)

**Origin.** The mentor's own closing-exchange summary directed two design questions at the
Prudence Group's diatribes record — what distinguishes a guide reflection from a guide
performance, and who examines the guide reflection — and asked Claude to propose how they should
be recorded, assessing the null-cycle-marker analogue against the diatribes' existing structure.
The proposal is at `operations/future-directions/2026-08-15-self-examination-moment-investigation-and-response.md`
§5, recorded into the Prudence record as Section 12 questions 6–7 (Amendment P-A2). **The ask:
ratify, amend, or replace it.** Its six points, each named to the existing mechanism it reuses
(PR15/PR20):

1. **A standing closing slot** — guide reflection as a standing element of every session, so
   occurrence carries no signal and only content does. Mechanism precedent: the harness's forced
   Sage Reflect at session close (`harness/gate1-pre-decision/claude-code/hooks/close-hook.mjs`,
   the H4 Stop-hook invitation) and the human evening review.
2. **A first-class null entry** ("no reflection warranted") — **this is where the null-cycle
   analogue is right**: it legitimizes honest absence and structurally relieves the busy-work
   pressure. It is **not** used as a suspicion flag on reflections that occurred — that reading of
   the analogue is assessed as wrong.
3. **A generative-position field** (`gap_responsive` | `task_absent`, plus session position:
   closing / mid-session). Precedent: reflect's `context_source: agent_stated | harness_inferred`
   (`website/src/lib/sage-reflect/request-helpers.ts`; `sage_reflect_sessions.context_source`)
   and the orientation reading's `class: examined | observed`.
4. **An anchorage field** (`anchored` — names specific transcript-checkable moves — |
   `unanchored`), corroborable against the diatribes. Precedent: the corroboration check
   (`website/src/lib/translation-sandwich/corroboration-check.ts`).
5. **The examination channel:** the reflection is self-report and never the audit channel; the
   **convener guide (per the question-1 ruling) examines the transcript out-of-band** and
   corroborates or contradicts the reflection's claims — divergence is the signal. Doctrine: the
   L4 audit (`website/src/lib/substrate/trust-core/l4-passion-audit.ts` — never self-report;
   self-report corroboration supplementary and monotone) and the G4 cross-check shape
   (`emission-hooks.ts:195-196`); the same shape SagePals Amendment A1 adopted for the
   practitioner's task declaration.
6. **Wiki + trust-record integration:** guide reflections link by the standard criterion (passion
   sub-species + false judgement type). Two rulings needed here specifically: **(a)** how
   *affirmation without examination* is classified in the false-judgement taxonomy (unexamined or
   precipitate assent? philodoxia-adjacent, given the guide-philodoxia concern in the wiki
   second-order-audit question?); **(b)** confirmation that the trust-record reading of recurring
   corroborated patterns is correctly parked with the OPEN hegemonikon drift + melete scoping
   session (the uniformity-reads-as-stable family) rather than designed now.

**Also for the mentor's awareness under the question-1 ruling:** the recorded residual (P-A1) —
the two-guide constraint prevents reciprocal-validation corruption but not **correlated blind
spots** (shared base-model priors bound the genuine difference of perspective; the uncorrelated
checks remain the human practitioners and the deterministic instruments). Does the mentor wish to
amend the ruling's record, or does the noted residual suffice?

---

## Annex — the founder's own agenda for the same or a separate sitting (not drafted, not
pre-answered; listed by title only, per the records' explicit carry)

- **The Prudence Group's open questions**
  (`operations/future-directions/2026-08-14-prudence-group.md`) — **Q1 is RESOLVED 2026-08-15**
  (the two-guide convener ruling, Amendment P-A1); **Q2 (the wiki second-order audit) is now the
  most pressing**, joined by the new Q6–Q7 (the guide-reflection design questions, whose proposed
  answers are M7's subject).
- **The SagePals Stage-4 continuity-of-experience question**
  (`operations/future-directions/2026-08-13-sagepals.md`).
- **At §6-report time:** the report itself plus the RUN-LOG's un-ruled per-cycle findings
  (cycles 5, 6, 9, 10, 11, 13, 14, 15, and any accrued since — read fresh from the scratch
  project's `RUN-LOG.md`).

*End of drafted questions.*
