# AE-3 scoping — executed per the 2026-08-17 prompt

**Authored 2026-09-03.** `governance` / scope — documents and read-only analysis only. No code, flag,
schema, migration, or credential touched. Executes
`operations/handoffs/founder/2026-08-17-AE3-scoping-NEXT-SESSION-PROMPT.md` in full.

**Bottom line, stated first per the prompt's own forecast:** AE-3 is **DEFERRED, unchanged**. Both of
ADR-014 §3.4's preconditions — structural cadence-provenance, and a non-monoculture proximity
distribution — remain unmet, for the same reasons named at S11a/AE-1 plus one the prompt itself got
wrong: the "derived per-task/per-loop measure" candidate is not merely undecided, it is **not
buildable from the persisted row today**, because `loop_id` is not a column on
`agent_assessment_history` (§B.2 below). No build prompt is authored.

---

## Part B.1 — What is AE-3 actually for?

From ADR-014 §7's own framing (row "AE-3 | The agent R20b detector per §3.4's fixed constraints"),
read against §3.4 itself: **AE-3 is the agent-side analog of R20b's human independence-coaching
detector** — a MEASURE-only advisory signal that an agent is consulting `/api/reason` **in excess of**
the mandatory two-gate cadence (CI-15), never a signal on the mandated floor itself.

**The observable, stated concretely (the prompt requires this be stated crisply or the gap named as
the finding):** a record-descriptive line an operator could read that says, in effect, *"agent X made
N examinations beyond the two-gate cadence in window W."* Nobody can see that today — not because no
count exists, but because **the credential-bearing traffic on the one populated harness identity is,
by the harness's own design, never in excess of anything**: every consult on `sagereasoning:s9-loop@v1`
is either the Gate-1 task-adoption consult or the S1 at-action floor consult, both mandated (§B.3).

This states cleanly. It is not the part of AE-3 that is unresolved.

---

## Part B.2 — Is structural cadence-provenance decidable now?

### Candidate 1 — per-channel credentials

**Status: unchanged since the 2026-08-16 deferral. No split has occurred.** The harness still runs on
**one** consult credential per identity (`sagereasoning:s9-loop@v1`'s current gen-2 pair — one
`consult` credential, one `accreditation_write`+`reflect` credential; CLAUDE.md's S9 Live bullet,
re-verified current this session — no decision-log entry between 2026-07-17 and today records a
consult-credential split). Building this candidate would mean minting a **third** credential class
(a dedicated hook-consult credential distinguishable from a task-adoption consult by `credential_ref`)
and touches:

- the UPC capability model (a new capability, or a new `purpose`/label convention, on top of the
  existing `consult`/`l1_supply`/`accreditation_write`/`calling`/`reflect` set);
- the ADR-014 §4 canonical identity — the `(owner_user_id, agent_id)` pair already tolerates multiple
  credentials per identity via the identity-resolution module, so this is architecturally compatible,
  **but it is still a new credential-issuance decision**, not a code change alone;
- every windowed read keyed on `credential_ref` (R17a subject-credential scoping) — a per-channel split
  would mean the M7/AE-1 windowed reads need to either union across the identity's credentials (via the
  identity module, which already exists) or the "excess" computation needs to read across channels
  explicitly. Buildable, but undesigned.

This is a real design decision with a real founder question behind it (Part C, restated below), **not
a scoping gap I can close by reading code more carefully.**

### Candidate 2 — a derived per-task/per-loop measure

**The prompt instructed reading the actual select list rather than trusting its own summary — doing
so found the prompt's summary was wrong.** The 2026-08-17 prompt states: *"`agent_assessment_history`
carries `correlation_id`, `credential_ref`, `agent_id`, `created_at`, `receipt_id`, `skill_id`,
`candidates_considered`, `depth_tier`, `session_marker`, `loop_id`."* Read first-hand against
`website/src/lib/substrate/agent-assessment-history-store.ts` (the `trajectorySelectCols()` builder,
`:316-329`) and against every `.sql` migration file mentioning `loop_id` (`grep -rn "loop_id"
supabase-*.sql` — exit code 1 against the store file, confirming it as a genuine absence, not a missed
grep):

- **`loop_id` is NOT a column on `agent_assessment_history`.** It exists on `agent_accreditation` (the
  A10 migration, `nullable loop_id for downstream JOIN against loop_billing_events.loop_id`) and on
  `idea_loop_completion_signals` (the IDEA-loop family). It has never been added to the trajectory
  table.
- The actual select list is: `correlation_id, credential_ref, agent_id, created_at, receipt_id,
  proximity, kathekon fields, oikeiosis_met, oikeiosis_stage, ruling_faculty_state, skill_id,
  candidates_considered, depth_tier` (+ `session_marker` when `SUBSTRATE_SESSION_DECLINE_SIGNAL_ENABLED`
  is on, live since 2026-07-30).

**None of these distinguish a mandated consult from an agent-elected one.** `session_marker`
(`session_open|mid_session|session_close`) is a *declared* value the caller chooses to send — it marks
*where in a session* a consult falls, not *why* it was made, and per B5's own design it is advisory,
never validated against actual harness behaviour. `skill_id`/`depth_tier`/`candidates_considered`
describe the content of the examination, not its provenance. So candidate 2, as the prompt itself
framed it, rests on a column that does not exist — it is not merely undesigned, it is **currently
un-derivable from the stored row at all.** Adding it would require its own schema change (a new
provenance-marking column, structurally distinct from the existing `loop_id` on the two sibling
tables) — which is exactly a version of candidate 1's problem (a new discriminator must be minted
somewhere), not a lighter alternative to it.

**Neither candidate is buildable today without a prior design decision.** ADR-014 §3.4 "makes neither"
mechanism — this session confirms that is still true, and sharpens candidate 2 from "undesigned" to
"foreclosed by the current schema as read, pending its own schema change."

---

## Part B.3 — The structural-zero question, answered plainly

**With a single mandated-consult credential per identity, the "excess consults" AE-3 keys on is
structurally zero.** This was true at S11a (the frozen-buffer measurement: ~130 at-action consults in
~5 days against a 25/week human threshold, 100% mandated) and remains true today — nothing in AE-1,
AE-2, S11a/S11b's composition fix, the B5 session-decline signal, the IDEA-loop family, or the
2026-08 agent-circles arc changed the harness's consult-mandate design. The Gate-1 task-adoption
consult and the S1 at-action floor consult are still the only two consult triggers on the live harness
identity; both are mandated by design, not discretionary.

**Consequence, stated per the prompt's own instruction:** *"If yes, AE-3 cannot be built usefully
regardless of which mechanism is chosen, and the recommendation is to keep it deferred with the
precondition named."* Yes. The recommendation is exactly that.

---

## Part B.4 — The empirical half: is the live distribution still a monoculture?

**Not independently re-measured this session** (the prompt correctly names this as founder-only —
no prod credentials in a repo session, and the founder-run aggregate the prompt asked for
[`GROUP BY depth_tier`, proximity counts] was never supplied; a grep of the decision log for that
exact query, or any grouped proximity breakdown, returns nothing).

**The most recent available live data point corroborates rather than contradicts the original
monoculture finding.** The 2026-08-30 provenance-gaps activation smoke read the harness's sample
record (`sagereasoning:s9-loop@v1`) and reported `aggregate.level: deliberate` — a single row, not a
distribution, but consistent with the S11a-era finding of `deliberate` 125/125. Nothing in the
intervening five weeks (AE-1's delta layer, AE-2's loop fold, the B5 session-decline signal, the
IDEA-loop family, the C1/C2/C3 provenance-ledger arc) changed what proximity level the harness's own
consults tend to score at — none of those built a mechanism that would shift the harness's *own*
action proximity, only mechanisms that read or fold the *history* of it.

This is not a disproof that the distribution has diversified; it is an absence of evidence either
way, with the one available sample pointing the same direction as before. **Recommendation: if the
founder can run a genuine grouped aggregate before any future AE-3 revisit, it would settle this
precondition outright; absent that, treat it as still-monoculture by the weight of the last five
weeks' single-sample evidence.**

---

## Part C — The founder question, restated (not answered here)

**Q1 (unchanged from the 2026-08-17 prompt, still genuinely open): is per-channel credentialing
something the founder wants at all?** This session adds one fact bearing on it: candidate 2 (the
lighter-seeming alternative) is now known to be foreclosed by the current schema, so if AE-3 is ever
built, per-channel credentialing (or an equivalently new schema addition serving the same purpose) is
**not a choice between a heavier and lighter path — it is the only path**, since candidate 2 requires
its own new column regardless. If the answer to Q1 is "no," that does not collapse to "then use
candidate 2 instead" — it collapses to "then AE-3 needs a third mechanism nobody has proposed."

**Q2 (unchanged): the live proximity distribution** — still needs a founder-run read, per §B.4.

---

## Recommendation

**Defer. Do not build. The two ADR-014 §3.4 preconditions remain unmet — one (structural
cadence-provenance) is now confirmed unbuilt AND its lighter candidate confirmed non-viable without a
schema change; the other (non-monoculture distribution) is unmeasured, with the one available data
point pointing toward "still a monoculture."** A third, independent reason to defer, not present in
the original 2026-08-16 election: **R20b's own activation gate is "post-launch by standing decision"
(ADR-014 §3.4's closing line), and the 0h launch call has not been exited** — every decision-log entry
through today that touches it still reads "nothing bears on the 0h call." AE-3 inherits that gate
regardless of the other two preconditions, so even a fully-designed, fully-diversified AE-3 could not
activate today.

**Per the prompt's own instruction, no build prompt is authored** since the recommendation is defer.

**One correction to carry forward, independent of the defer/build question:** the 2026-08-17 prompt's
own Part B.2 bullet asserting `agent_assessment_history` carries `loop_id` was factually wrong when
written (`loop_id` was added to `agent_accreditation` and `idea_loop_completion_signals` only,
never to the trajectory table) — any future AE-3 revisit should re-read the schema first-hand rather
than trust that prompt's summary, including this document's own summary, without a fresh grep.

---

## Cross-references

- `adopted/adr/2026-07-18-agent-practice-trajectory.md` §3.4, §4, §7 — the binding design-of-record
- `operations/handoffs/founder/2026-08-17-AE3-scoping-NEXT-SESSION-PROMPT.md` — the prompt this
  document executes
- `operations/trust-layer-2026-07/2026-07-18-S11a-extraction-gate-diagnosis.md` — the original
  monoculture measurement (`deliberate` 125/125)
- `operations/decision-log.md`, `D-C4-PROVENANCE-GAPS-SURFACE-LIVE-2026-08-30` (or the nearby entry
  carrying the 2026-08-30 sample-record read) — the most recent live `aggregate.level` data point
- `website/src/lib/substrate/agent-assessment-history-store.ts` — the actual select list, read
  first-hand this session

*End of scope document. Nothing built, nothing elected. AE-3 remains deferred.*
