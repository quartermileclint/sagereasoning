# Close — Provenance-ledger slice 3: the served `provenance_gaps` field + the §10 attestation amendment

**Date authored: 2026-08-30** (the founder elected to leave the label as-is).
**Tier:** `code-critical` (corrected from the predecessor prompt's `code-elevated`, per SCOPE §13).
**Decision-log entry:** `D-PROVENANCE-LEDGER-SLICE3-SERVED-FIELD-AND-ATTESTATION-BUILT-PR19-FOLDED`.

**Production state at close: UNCHANGED.** Nothing pushed, nothing deployed, no flag set, no schema
applied, no credential minted or revoked. **AC7 engages at the deploy, which is the founder's — and
under the elected option B the deploy IS the activation.**

---

## ⚠️ The one thing to read before anything else

**Slice 3 is NOT a dark build, and this session's own first framing said it was.**

`SUBSTRATE_PROVENANCE_LEDGER_ENABLED` has been `true` in Vercel **across all environments, Production
included, since 2026-08-26** — verified three ways (the slice-2 activation decision-log entry, the
187 live ledger rows, and the C2 baseline artifact). "Byte-identical flag-off" is true of the *code*
and misleading about the *deployment*: **there is no dark interval and no activation step left.** On
the next push+deploy this ships live — every trust-record `200` gains two keys and one extra DB read,
and the relaxed gate plus the new 503 branch go live with it.

Three independent PR19 reviewers converged on this. It is the standing lesson
`shared-flag-dark-is-per-flag-not-per-feature` in its sharpest form: not a sibling feature on a shared
flag, **the same flag, already on**.

**The ruling is not in doubt; its premise expired.** SCOPE §6.5.6 ruled the relaxation *"should be
tied to the same flag gating the ledger… so that flag-off leaves this endpoint byte-identical"*,
giving as its reason that *"the change is inert until the ledger itself ships."* The ledger shipped
four days later. The instruction stands; the reason is discharged. **PR20-class stale mechanism fact
— surfaced, not silently re-decided.**

**DECIDED 2026-08-30 — the founder elected option B: ship live on deploy.** No separate flag. Slice 3
rides the already-live ledger flag, so **push + deploy IS the activation** and there is no separate
0c-ii step. Consequently the **R18 surfaces were applied in the SAME commit as the code** — under
option B there is no dark window in which to document ahead of exposure, so the never-lead-the-code
rule is met by simultaneity rather than sequence, and applying them *after* the deploy would have been
strictly worse (an undocumented live field in the interval).

**Rollback is `git revert` ONLY.** Unsetting the flag is **not** a rollback path: it would also stop
the live ledger write, which is a standing production change.

**A mentor note is carried, not blocking:** §6.5.6's *instruction* (tie the gate to the ledger flag)
was followed; its *stated reason* (*"the change is inert until the ledger itself ships"*) expired when
the ledger shipped four days later. Worth putting to the mentor at the next consultation.

---

## What was built — five components, one edit (SCOPE §13's slice-3 row)

| # | Component | Notes |
|---|---|---|
| 1 | `provenance_gaps` + `total_provenance_gaps_count` | C2c `orientation_readings` shape; cap 50 at the **store read** via a genuine `+1` truncation probe; total **omitted, never fabricated**; not-attestable clause **inline** per entry |
| 2 | §10 attestation amendment | **Exact founder-signed text**, minimal-diff — only the trigger clause moves |
| 3 | ENV-1 gate relaxation | `domains.some(hasEvidence) \|\| provenance_gaps.length > 0` |
| 4 | ADR-013 §8 dated amendment | Same edit, as the ruling requires |
| 5 | Pins **S2-69 → S2-102** | Battery **194/0** (from 156/0) |

**A sibling field, never a widening of `coverage_gaps`** — ruled twice. Unmodified reuse *launders* a
provenance refusal into a signal indistinguishable from an A2-zeroed domain; widening the element
type breaks a documented public shape. **F-2's hard exclusion is structural at the QUERY**: only
`reason` and `occurred_at` are selected, so `correlation_id` is never read.

**Edit one of two.** The substantive coverage update fires at enforcement (slice 5) and was **not**
pre-empted — the commitment stays future-tense, pinned by S2-71.

**One behaviour built that no ruling states**, named so nobody later assumes it was ruled: the
`!hasDomainEvidence && gapsReadFailed → 503 no-store` branch. Derived from the S10-ABUSE-1 precedent
(a 404 is a positive claim of absence and may not be made from a read that failed). Inert flag-off;
pinned both directions.

---

## PR19 — two rounds, five independent reviewers

**Round 1** (flag-off byte-identity · gate/fail-honest matrix · scope fidelity · pin adequacy ·
served-wording honesty). Scope fidelity returned **no material divergence**: the §10 text
character-matches the signed replacement, edit two is not pre-empted, `coverage_gaps` is untouched,
§6.4's three precedent details are copied not approximated, and nothing slice 2 or slice 5 owns was
touched (`classifyProvenanceArtifact` is byte-unchanged — a pure append).

**Five served-wording defects confirmed and folded:**

- **`no_ledger_entry`** carried an empirical **frequency claim with a zero-observation denominator**
  — and it **inverts in steady state**: ledger `retain_until` (90d) equals the classification window
  (90d) and its purge is wired into the scheduled sweep, so routine aged-out artifacts arrive *here*,
  not at `out_of_window`, and would have been served a pre-ledger explanation.
- **`out_of_window`** conflated **retention** (deletion) with **acceptance**, and asserted the ledger
  *"can no longer speak to"* an origin it had in fact found and read. A malformed timestamp also
  lands here, where nothing aged out. The window is now **interpolated from the constant**, killing a
  three-copy drift.
- **`identity_mismatch`** read as a **near-accusation** about a population that is owner-less **by
  design** — and it is the string this system would serve **first** (187/187 live rows are
  `identity_kind: 'credential'`; the C2 baseline's own recorded sample outcome is
  `identity_mismatch`).
- **The shared clause's causal half flatly contradicted** the `caller_supplied_extraction` text
  served beside it, reintroducing one line later the very distinction Q2 exists to preserve.
- **The headline:** an empty `provenance_gaps: []` beside `total_provenance_gaps_count: 0` carried
  **no note** — a quantitative, machine-readable claim that this agent's artifacts were checked for
  origin and none failed, **from a pipeline that has never run**. The envelope prose was deliberately
  kept future-tense for exactly this reason, and the data field then made the present-tense claim
  numerically. **An empty-state note now fires.**

**Round 2 (pin adequacy) falsified this session's own claim** that all 22 pins were mutation-verified.
True for wiring, false for content: the reviewer replaced all four reason texts with
`'provenance unverified 1..4'` — collapsing the Q2 distinction — and the battery scored **179/0**,
because S2-74 compares the served value against the constant that produced it and S2-75 asserts only
pairwise inequality. Pins are now anchored on **the meaning in the words**, in both directions.

**Four further unpinned properties closed:** the serve set is now **derived** from the wording map (a
widening that added both the type member *and* its template passed `tsc` **and** the battery while
silently dropping entries from a public honesty surface, under a note falsely claiming no wording
existed); the **migration CHECK** — the vocabulary's third copy, read by nothing — is pinned against
the served set; **newest-first ordering** and the **cap value** are pinned; **`REAL_DEPS`** is pinned
to the real flag and the real store read. Also folded: the gate now counts the **renderable** set
rather than raw rows; a served-copy grammar defect; a stale 2026-08-25 comment marked superseded.

---

## A process failure this session caused

I instructed the pin-adequacy reviewer to mutate the **shared working tree** and restore from its own
backups, while I was editing the same files. Its restores silently reverted three of my folds
**twice**, and my verification greps reported them present because the same phrases occur in doc
comments — the `content-pins-assert-exported-values` lesson, broken by the session that cites it.
Separately, my own mutation harness silently failed to apply three times and printed a green battery.

**Standing corrections, worth carrying:**
- **A review agent that mutates must work on a COPY, never the shared tree.**
- **A mutation harness must assert its mutation applied**, and exit non-zero otherwise — a mutation
  that does not apply produces a meaningless green.
- **Verify a fold by running, not by grepping** — a substring check is satisfied by a comment.

---

## Verification

S10 battery **194/0**, every new pin mutation-verified individually — including the reviewer's own
Q2-collapse mutation, which now fails. Regressions all green: provenance-classification 14/0 ·
provenance-ledger-store 18/0 · write-lookup-purge 33/0 · emission-hooks 19/0 · orientation-trust-events
57/0 · trust-core 112/0 · retention-sweep 43/0. `tsc --noEmit` clean. `npm run build` exit 0, route
registered.

## Switch-on scoreboard

**C1 ✅ · C2 ✅ · C3 ~4/90 days — the binding clock · C4 built, NOT discharged until the R18 docs land.**
Slice 5 cannot happen before late November regardless.

## Carried (founder-walked; nothing pre-approved)

1. **Push + deploy.** This is the activation. Everything else follows it.
2. **Live `curl` against production immediately after** — three of the four defects in the recent
   envelope arc were found only that way, never by a local sweep. On a real agent's record check:
   `provenance_gaps` + `total_provenance_gaps_count` present; the empty-state note in `notes`; the
   amended `does_not_attest[1]` trigger; and that a previously-404 agent still 404s.
3. **A mentor note, carried not blocking:** §6.5.6's instruction was followed but its stated reason
   (*"inert until the ledger itself ships"*) expired when the ledger shipped four days later.
4. **Not taken, reviewer-proposed:** behavioural coverage for `readProvenanceGaps` (two source-greps
   only today); `capped`×`totalCount` consistency validation.

## R18 — SIGNED and APPLIED (2026-08-30)

All three public surfaces carry the change, in the **same commit** as the code (option B leaves no
dark window in which to document ahead of exposure):

- **`llms.txt`** — new "Provenance gaps" section; the trigger clause; **and the 404/200 contract,
  which the relaxation made false** (*"a 200 genuinely implies at least one domain carries examined
  evidence"* — now scoped: a 200 implies examined domain evidence **or** a determinate ledger verdict).
- **`agent-card.json`** — new extension **#26** `provenance-gaps/v1` (**26 total**, parse-verified);
  the trigger clause; the same 404/200 correction inside `trust-record/v1`.
- **`api-docs`** — new paragraph; the trigger clause; the same 404/200 correction.

**Found while applying:** the superseded trigger sat on all three surfaces in **three different
phrasings** — three edits, not one find/replace. Post-apply sweep for `structural fix (is|was) in
place` across `public/` and `src/`: **zero hits.** The stale 404/200 claim was found by sweeping for
it rather than by assuming the new paragraph was the whole job.

**Checked and deliberately left:** the held-event statements (`llms.txt` ~651, api-docs ~922) saying
*"a 404 trust record stays 404"* — explicitly scoped to what a **held curator-flagged event** does, a
different mechanism, and accurate in that scope.

## Rollback

`git revert` the build commit; the served-field edit, the public-claim edit and the ADR amendment are
separable. **For option (B), unsetting the flag is NOT a rollback path** — it would also stop the live
ledger write, which is a standing production change.
