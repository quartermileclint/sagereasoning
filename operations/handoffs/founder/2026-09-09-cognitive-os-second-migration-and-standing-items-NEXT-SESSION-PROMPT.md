# SESSION PASTE — Cognitive OS: the second migration, plus standing items freed by the table step

**Paste this as the FIRST message of a FRESH session.**

**Open the standing opener first** (`STANDING-SESSION-OPENER-grounded-foundations.md`, most recent
version), then this. **EVERY NUMBER IN THIS FILE IS A CLAIM TO RE-DERIVE, NOT A FACT TO QUOTE** —
this prompt's own authoring session made two verification-claim errors this exact way (see §0) and
found both only because a founder-run check disagreed with a written expectation. Trust the check,
not the prose, including this file's prose.

---

## 0. Where the prior session actually left things — read before choosing what to do

**The Cognitive OS table step (core slice) is COMPLETE: authored, PR19-reviewed, applied to TEST and
production, deployed, and LIVE-VERIFIED against the real deployed build** — not merely tested
locally. Four tables exist in production: `cognitive_contexts` (the ownership root), `cognitive_events`
(append-only), `cognitive_claims` (ordinal confidence), `cognitive_belief_states` (epistemic-debt
components, no score column). RLS on, zero policies, R17 wired on all four data-rights surfaces,
retention sweep built on its own dedicated flag (`SUBSTRATE_COGNITIVE_OS_SWEEP_ENABLED`, **deliberately
left unset** — no data exists yet for it to have work to do).

**Full record, read before touching anything cognitive-os-shaped:**
`operations/cognitive-os-2026-09/2026-09-09-TABLE-STEP-CORE-SLICE-CLOSE.md`. **Verbatim wins over
this paste.**

**Two things worth carrying forward as method, not just history, because they cost real time in the
authoring session and are exactly the kind of error a fresh session is primed to repeat:**

1. **A verification-claim inside a comment is not evidence until it is re-run.** The migration
   header's SECURITY DEFINER cross-check quoted a narrower `grep` than the one that produced its own
   numbers — the same class of defect this project already corrected once in a sibling migration
   (`supabase-practice-family-rls-lockdown-migration.sql`). Twice is a class. The fix that finally
   held was not a better sentence — it was an **executing check** (`§1.13d–f` in the store battery,
   which walks the actual filesystem rather than trusting the header). If you write a claim about
   what a shell command returns, either run it in the same turn or don't write the number.
2. **A response-shape assumption is not a fact until the source is read.** The founder's own
   post-deploy smoke test failed on its first attempt because the probe assumed
   `gatherUserPersonalData()`'s output sat at the response's top level; it actually sits under
   `personal_data` in `/api/user/access`'s response. Reading `route.ts` before writing the probe
   would have caught it on the first try. It cost one of five hourly `RATE_LIMITS.dataRights` calls.

**A live population fact, disclosed rather than filtered:** the authoring session's own consult
activity is now IN the false-hold observation window (2026-09-09 went from 1 to 15 consult records
during that session). This did not move the gated day-count — 09-09 already qualified before that
session opened — but it changed that day's composition. **Do not treat this as a reason to discount
or re-derive the window differently; the mentor has ruled twice against exactly that move.** Simply
re-derive the window fresh, as always.

---

## 1. Your governing documents, in precedence order

1. **The table-step close** —
   `operations/cognitive-os-2026-09/2026-09-09-TABLE-STEP-CORE-SLICE-CLOSE.md`. **Read in full.**
2. **The R9/R10 reconciliation + its adopted rulings** —
   `operations/cognitive-os-2026-09/2026-09-09-R9-R10-HANDOFF-RECONCILIATION.md` §8a governs.
3. **The thirteen rulings, verbatim** —
   `operations/cognitive-os-2026-09/2026-09-08-mentor-rulings-cognitive-os-thirteen-questions-verbatim.md`.
4. **The Phase-1 build report** — `…-2026-09-09-STEP-2-PHASE-1-BUILD-REPORT.md`.
5. **The library** — `website/src/lib/cognitive-os/` (nine pure components — **read `types.ts`'s
   header before touching anything here; three binding constraints, C3/C5/C6, are compile-time
   enforced and must not be weakened**).
6. **The store** — `website/src/lib/cognitive-os-store/` (the persistence layer; deliberately OUTSIDE
   the pure library — see its own `store.ts` header and the table-step close §5 for why, before
   assuming the split is accidental or reversible without cause).

**Verbatim mentor records win over every summary, including this paste and the table-step close.**

---

## 2. Two adopted constraints that bind whatever this session builds — do not re-derive them

**Q9 / Q-R7 — no Cognitive OS scalar is persisted anywhere, and the table step made this concrete.**
`cognitive_belief_states` stores the epistemic-debt COMPONENTS, never a score. If the second
migration persists `DecisionRecord` (which carries `epistemic_debt_score: EpistemicDebtScore` as a
required field) or `HandoffEnvelope` (whose `epistemic_debt.score` is the EXACT field
`toExternalView` strips at egress), **the same discipline applies**: either the score column does not
exist and the summary is re-derived on read, or — if a stored score is judged unavoidable for a
specific reason — the R17 export surfaces (`/api/user/export`, `/api/user/access`) MUST become
explicit projections that exclude it, and this is stated as a deliberate, reviewed departure, not a
default. **The table-step battery's `§7` pin will fail the moment a score column appears anywhere
under `cognitive_*`. That failure is the system working — the fix is the projection, never relaxing
the pin.**

**The purity guard's shape is now a precedent for any THIRD directory.** `§12.C9` in
`cognitive-os.test.ts` (every import in `cognitive-os/` must be a relative sibling) caught the table
step's persistence layer being placed in the wrong directory, mid-session, dropping the Phase-1
battery from 149/0 to 146/3. The fix was moving the layer out, never relaxing the guard. **If this
session adds anything that touches `process.env`, the wall clock, randomness, or a network client, it
does NOT belong inside `cognitive-os/`** — it belongs beside `cognitive-os-store/`, or in a third
sibling directory of its own, following the same reasoning.

---

## 3. What this session should do

**Determine what the second migration actually needs, from the library, not from the spec** — the
discipline that worked for the table step. The close's §10 names the deferred set: decisions
(`belief-revision.ts` `DecisionRecord`), handoffs (`handoff-envelope.ts` `HandoffEnvelope`), and the
dependency graph (`dependency-graph.ts` — nodes and edges). **Read each module fresh before assuming
the deferred set is still exactly these three or that all three belong in one migration.**

Follow the same shape that worked for the table step:
1. **Inspect the library**, not the spec.
2. **Design the R17 wiring implications before the schema** — Q-R6 is not a one-time obligation
   discharged by the core slice; it applies to every table this session might add. In particular:
   `HandoffEnvelope.payload` is `Readonly<Record<string, unknown>>` — open-ended — and was named at
   §5.6(i) of the reconciliation as its OWN R17 surface, distinct from the tables the core slice
   already covers.
3. **Author the migration** in the project's `§PRE`/`§APPLY`/`§VERIFY`/`§INVERSE` form. **Author it;
   do not apply it** without the founder walking TEST then production, reading every output, exactly
   as the table step did.
4. **`retain_until` + a sweep**, on the footing already established — a THIRD dedicated flag if this
   warrants its own activation timeline, or an extension of the existing
   `SUBSTRATE_COGNITIVE_OS_SWEEP_ENABLED` sweep if the new tables share the same ownership root
   (`cognitive_contexts`) and can be swept together. **State the reasoning either way; do not default
   silently.**
5. **RLS: service-role-only**, in the exact proven shape (RLS on, zero policies, explicit REVOKE +
   GRANT). Re-run the SECURITY DEFINER sweep — `grep -rn "SECURITY DEFINER" --include="*.sql" .`
   from repo root — **and confirm it, don't just cite the table step's number**, since a session may
   have added a migration since.
6. **PR19 independent review** before any founder-walked step, cap disclosed per the standing
   requirement (Q3, 2026-09-09).

### ⛔ Do NOT, in this session

- **Do not build Phase 2** — the Epistemic Debt service, debt calculation, or the decision-readiness
  gate remain NOT LICENSED. Persisting `DecisionRecord`/`HandoffEnvelope` is storage, not the service.
- **Do not instantiate an actor.** Still a separate, unlicensed step (Q-R2: two vocabularies, kept
  distinct in code).
- **Do not weaken** the C3/C5/C6 disclosures in `types.ts`, the `§7.10` pin in `cognitive-os.test.ts`,
  or the `sendExternally` header note in `handoff-envelope.ts`.
- **Do not touch the observation window's measured files.** Re-derive `GUARD_RE` from
  `website/src/app/logos/__tests__/human-practitioner-boundary.test.ts` §C — re-derive, do not quote.
  Confirm every new file's path is clear of it BEFORE writing, not after.
- **Do not assume a response shape without reading the route source first** — see §0.2 above.

---

## 4. Practice discipline this session must carry

1. **Re-derive window + baseline health at OPEN and again at CLOSE.** At this paste's authoring:
   buffer **398**, window population **258** (217 guard + 41 consult), **4 of 5 consult-bearing days**.
   **Re-derive, do not quote.**
2. **The denominator question from the prior prompt is now closed as MOOT, not resolved.** Every UTC
   day since the window opened has been consult-bearing, so "elapsed days" and "days present" have
   given the same answer every time this has been checked. It remains an open THRESHOLD question for
   whoever eventually sets the consult-side bound (F-3′), but nothing in ordinary session work turns
   on it — do not spend time re-litigating it absent an empty day actually appearing.
3. **Run the byte-identity guard at open and after any commit-shaped moment.** **250/0** at authoring.
   Both SHA pins: `layer2-mechanisms.ts` `60cefedb…`, `stoic-brain.ts` `fa8895ec…`.
4. **Cognitive OS gates at authoring:** Phase-1 battery **149/0**, critical scenario **30/0**, table-step
   battery **137/0**, `tsc --noEmit` **0**. Re-run all four at open — do not assume they are still green.
5. **`git status` whole, never truncated. `ListAgents` at open.** At authoring: **3 interactive peers**
   on this project. **Path-scoped commits, always** — the last session found two peer files sitting in
   the tree throughout and never staged them; check for the same pattern at your own open.
6. **Disclose the tool-mode effect** — state in the close which tool mode was used and what it
   contributed to the window. The prior session added 14 consult records via Write/Edit-authored
   files; a Bash-authored session adds approximately zero. Choose on the task's merits, disclose
   either way.
7. **`cat >` redirects fire the guard as CAUTION with a sparse-extraction reading — read the frame
   from the CURRENT action, never carry a prior turn's classification forward.** The authoring session
   drew a substantive, non-sparse caution on its FIRST heredoc (a genuine `Ruling faculty: Unsettled`
   read on a mutation-testing script) and, on later reflection, found it had classified that one by
   habit rather than reading its grounds. **Read each caution's stated grounds before deciding it is
   the sparse-extraction default** — most will be; do not assume all are.
8. **Never place executable DDL in a runnable code block during a live SQL-editor walk.** When
   preparing paste-ready SQL for the founder, extract exact byte ranges from the authored file
   (`sed -n`) rather than retyping, and SHA-checksum the extraction so the founder can confirm nothing
   drifted from what a battery already verified.
9. **When preparing a founder-run browser/console probe against a live route, READ THE ROUTE'S ACTUAL
   RESPONSE SHAPE FIRST.** This is the corrected form of a mistake made in the authoring session (§0.2)
   — do not repeat it. And remember rate limits: `RATE_LIMITS.dataRights` is 5/hour on `/api/user/access`
   and `/api/user/export`; a wasted probe costs the founder one of five.

---

## 5. Carried forward — visible so nothing is rediscovered

- **`Q-PREFLIP-REPORTS`** — three owed disclosures, all unbuilt: baseline composition day-by-day;
  loop count by action class; tool-mode composition per baseline day. Gated on a founder waiver
  (`false-hold-observation-report.ts` matches `GUARD_RE`). Unchanged by this session's work.
- **The session-opener `cat >` addition** — still owed at the opener's next revision.
- **The cap-transparency requirement** — ruled standing 2026-09-09; not yet folded into
  `/adopted/project-instructions-snapshot.md`.
- **A manifest amendment owed BEFORE Phase 3** (Consciousness and Continuity Obligation, component
  one) — unchanged, gated at Phase 3, untouched by the table step.
- **Three Phase-2 hazards named but not fully closed** (reconciliation §5.6): the internal-scope
  branch untested against R9's privacy constraint; the two epistemic vocabularies; the R17-on-envelope
  item — **this last one is now PARTIALLY addressed** (the core slice's own R17 wiring exists) but the
  envelope's `payload`/`claims`/`events` fields, if persisted in the second migration, reopen the same
  question on a wider surface. Name explicitly whether this session closes it or narrows it further.

---

## 6. If you hit a conflict

**Route it; do not resolve it.** If any part of this touches a governed surface, a settled constraint,
or a `GUARD_RE` file, stop and flag it. The founder is the decision authority on all governance
questions.

**The S11 flip remains REFUSED; weights remain BLOCKED; the 0h call remains the founder's.**
