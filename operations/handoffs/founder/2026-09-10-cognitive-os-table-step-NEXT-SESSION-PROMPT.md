# SESSION PASTE — Cognitive OS: the table step (schema, data-rights, retention, migration)

**Paste this as the FIRST message of a FRESH session.**

**Open the standing opener first** (`STANDING-SESSION-OPENER-grounded-foundations.md`, most recent
version), then this. **EVERY NUMBER IN THIS FILE IS A CLAIM TO RE-DERIVE, NOT A FACT TO QUOTE.**

**Tier: `code-critical` — founder-walked.** New schema, a migration applied to TEST then production,
and data-rights wiring on live routes. **AC7 engages.** The AI performs no Supabase, Vercel, git-push
or mint operation; the founder runs every live step and the AI guides and verifies.

**This session does NOT build Phase 2.** Phase 2 (the Epistemic Debt service) remains **NOT
LICENSED**. The R9/R10 reconciliation prerequisite is now **DISCHARGED** (see §1), but discharging one
prerequisite does not open the phase.

---

## 0. Why this session exists, and what changed immediately before it

Phase 1 of the Cognitive OS is built, PR19-reviewed and mentor-approved. Its state lives **in memory
only** — nothing is persisted. The table step is what gives it a home, and it is the next item the
Phase-1 close named.

**On 2026-09-09 the R9/R10 handoff reconciliation ran and was ruled.** Read
`operations/cognitive-os-2026-09/2026-09-09-R9-R10-HANDOFF-RECONCILIATION.md` **in full before
anything else** — especially **§8a (the seven adopted rulings)**, which is the governing section, and
**§5/§5.6 (the four Phase-2 hazards)**. Two of those rulings bind this session directly (§2 below).

That session also executed the Q-R4 disclosure: `handoff-envelope.ts` gained a header note and the
battery gained pin **§7.10**, both recording that `sendExternally` does **not** enforce the Q1 assent
boundary. **Do not "fix" §7.10 if it fails** — read its own comment first; a failure there means
enforcement was added, which is a doctrinal change needing its own ruling.

---

## 1. Your governing documents, in precedence order

1. **The reconciliation + its adopted rulings** —
   `operations/cognitive-os-2026-09/2026-09-09-R9-R10-HANDOFF-RECONCILIATION.md` **§8a governs.**
2. **The Phase-1 build close** — `operations/cognitive-os-2026-09/2026-09-09-STEP-2-PHASE-1-BUILD-CLOSE.md`
   (carried item 1 is this session's mandate).
3. **The thirteen rulings, verbatim** —
   `operations/cognitive-os-2026-09/2026-09-08-mentor-rulings-cognitive-os-thirteen-questions-verbatim.md`.
4. **The Phase-1 build report** — `…-2026-09-09-STEP-2-PHASE-1-BUILD-REPORT.md` (component detail).
5. **The gap analysis** — `…-2026-09-08-cognitive-os-PHASE-1-GAP-ANALYSIS.md`.
6. **The library** — `website/src/lib/cognitive-os/` (nine components; `types.ts` carries the C5
   disclosure this session must not weaken).

**Verbatim mentor records win over every summary, including this paste.**

---

## 2. Two adopted rulings that bind this session directly — do not re-derive them

**Q-R6 — R17 data-rights on envelope content. CONFIRMED as a table-step surface item.**
> *"This must be on the table step's opening surface, not discovered after the migration is written."*

`HandoffEnvelope`'s `payload`, `claims` and `events` will carry persisted content. R17's wiring —
`/api/user/access`, `/api/user/export`, `/api/user/delete`, `/api/credential/erase` — applies to it.
**What BINDS:** the data-rights obligation must be on this step's *opening* surface — visible before
the migration is written, not discovered after it. That is the ruling's own language.

**What is only RECOMMENDED** (this is the authoring session's suggestion, not a ruling, and the
executing session should use its own judgement): designing the wiring before the schema, on the
grounds that a schema authored first tends to make the wiring conform to it. This project's standing
pattern (`collaboration_records`, the reflect store, `impulse_entries`) is the available model.
`retain_until` plus a sweep is owed on the same footing as those.

**Q-R7 — `EpistemicDebtScore` is ORDINAL, not cardinal, at Phase 2.**
> *"No Cognitive OS scalar may be combined with a proximity rank in any derived figure. […] the
> discipline is settled now."*

**Consequence for THIS session even though Phase 2 is not open:** do not design a column that
presumes a cardinal debt score. If the schema persists a debt figure at all, it must not bake in
cardinality that Phase 2 is already ruled to remove. **Prefer persisting the structured components
(stale claims, contradictions, unresolved assumptions, unverified evidence) and re-deriving the
summary, per the ruling's own description.**

---

## 3. What this session should do

Follow the shape that has worked across this arc: **inspect, then ask, then build.**

1. **Determine what actually needs persisting**, from the library, not from the spec. Nine components
   exist; not all of them need a table. State the reasoning for each.
2. **Satisfy Q-R6's data-rights obligation as an opening constraint**, not a later addition. (The
   authoring session's suggestion — not binding — is to design the wiring before the schema.)
3. **Author the migration** in this project's established form — `§PRE` / `§APPLY` / `§VERIFY` /
   `§INVERSE`, additive, idempotent, reversible. **Author it; do not apply it.** Application is
   founder-walked, TEST before production, with every `§VERIFY` output read.
4. **Wire `retain_until` and a sweep**, on the footing the standing record already uses.
5. **RLS: service-role-only.** Read the four 2026-08-16 RLS lockdown decisions before writing any
   policy — this project has been bitten four times, including by policies whose *names* said service
   role while their SQL said `USING (true)` with no `TO` clause. **Also `grep -rn "SECURITY DEFINER"`
   across `supabase/migrations/` and `operations/migrations/`** — a table-level fix is invisible to a
   `SECURITY DEFINER` function writing the same table.
6. **PR19 independent review** before any founder-walked step. **Disclose the per-dimension finding
   cap and whether it bound** (standing requirement, ruled 2026-09-09 Q3).

### ⛔ Do NOT, in this session

- **Do not build Phase 2** — not the Epistemic Debt service, not debt calculation, not the
  decision-readiness gate.
- **Do not instantiate an actor** from `Laboratory`/`Attic`/`Archive`/`Threshold`. Still a separate,
  unlicensed step. **Q-R2 ruled TWO vocabularies** — these stay permission-scope identifiers in code
  and are **not** unified with the twelve-environment room names. The convergence is documented in the
  reconciliation file; it is deliberately **not** encoded.
- **Do not weaken the C5 disclosure** in `types.ts`, or the §7.10 pin, or the `sendExternally` header
  note.
- **Do not touch the observation window's measured files.** Re-derive `GUARD_RE` from
  `website/src/app/logos/__tests__/human-practitioner-boundary.test.ts` §C — **re-derive, do not
  quote.** The cognitive-os paths were tested clear on 2026-09-09; test again rather than assume.

---

## 4. Practice discipline this session must carry

1. **Re-derive window + baseline health at OPEN and again at CLOSE.** At this paste's authoring:
   buffer **367**, window population **228**, consult-bearing days **4 of 4** (09-06→09-09 UTC).
   **⚠ Re-derive, do not quote — and note the denominator question below.**
2. **⚠ A live discrepancy, unresolved:** the previous prompt reported baseline "3 of 5"; re-derivation
   gave "4 of 4". Buffer and window counts reconcile exactly, so the divergence is in the
   **denominator** — elapsed calendar days including empty ones, versus UTC days present in the
   window. **Whoever next sets the consult-side bound threshold must settle which the five-day
   standing obligation counts.** The two give different answers about whether it is met.
3. **Run the byte-identity guard at open and after any commit-shaped moment.** **250/0** at authoring.
   Both SHA pins: `layer2-mechanisms.ts` `60cefedb…`, `stoic-brain.ts` `fa8895ec…`.
4. **Cognitive OS gates:** battery **149/0**, critical scenario **30/0**, `tsc --noEmit` **0**.
5. **`git status` whole, never truncated. `ListAgents` at open. Path-scoped commits, always.** There
   is uncommitted peer work in the tree — **never stage another session's files.**
6. **Disclose the tool-mode effect** — state in the close which tool mode was used and what it
   contributed to the window. Choose the tool on the task's merits, never on the counter.
7. **`cat >` redirects will fire the guard — read the frame before proceeding.** Read the signal from
   the CURRENT frame; never carry a prior session's classification forward.
8. **Never place executable DDL in a runnable code block during a live SQL-editor walk** (standing
   correction; the founder has hit `42710` this way once already).

---

## 5. Carried forward — visible so nothing is rediscovered

- **`Q-PREFLIP-REPORTS` — three owed disclosures**, all unbuilt: baseline composition day-by-day;
  loop count by action class; **tool-mode composition per baseline day**. Gated on a founder waiver
  (`false-hold-observation-report.ts` matches `GUARD_RE`). **Two datapoints now exist** — 2026-09-08
  (1 consult record for a 2,462-line build) and 2026-09-09 (1 consult record for a 776-line design
  session with three reviewers). Both Bash-mode.
- **The session-opener `cat >` addition** — still owed at the opener's next revision.
- **The cap-transparency requirement** — ruled standing 2026-09-09; not yet folded into
  `/adopted/project-instructions-snapshot.md`.
- **A manifest amendment owed BEFORE Phase 3** (Consciousness and Continuity Obligation, component
  one) — unchanged, gated at Phase 3.
- **Three Phase-2 hazards named but not closed** (reconciliation §5.6): the internal-scope branch is
  untested against R9's *privacy* constraint (a different axis from assent); the two epistemic
  vocabularies; and the R17 item this session addresses.

---

## 6. If you hit a conflict

**Route it; do not resolve it.** If any part of this touches a governed surface, a settled constraint,
or a `GUARD_RE` file, stop and flag it. The founder is the decision authority on all governance
questions.

**The S11 flip remains REFUSED; weights remain BLOCKED; the 0h call remains the founder's.**
