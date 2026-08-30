> # ⛔ SPENT — DO NOT RUN. Slice 3 was BUILT, REVIEWED, SHIPPED and LIVE-VERIFIED on 2026-08-30.
>
> Commits `df894ec` (build) + `38bc55d` (signed R18 surfaces) + `5416749` (live verification).
> **C4 is DISCHARGED.** Records: `D-PROVENANCE-LEDGER-SLICE3-SERVED-FIELD-AND-ATTESTATION-BUILT-PR19-FOLDED`,
> `D-PROVENANCE-LEDGER-SLICE3-R18-SIGNED-APPLIED-OPTION-B-ELECTED`,
> `D-PROVENANCE-LEDGER-SLICE3-LIVE-VERIFIED-C4-DISCHARGED`; close at
> `2026-08-30-provenance-ledger-slice3-served-field-and-attestation-CLOSE.md`.
>
> **Two of this prompt's own statements were found wrong while executing it, recorded here so the
> file is not read as accurate:**
> 1. It said `attests[1]` "currently has none" (a content pin). **Stale** — S2-46 pinned its scoping
>    clause at the 2026-08-25 edit. Its *core* claim was genuinely unpinned and is now S2-72.
> 2. It framed the work as gated behind a flag. **Slice 3 was never dark:**
>    `SUBSTRATE_PROVENANCE_LEDGER_ENABLED` had been `true` in Production since 2026-08-26, so deploy
>    was the activation. The founder elected that path knowingly (option B).
>
> **Successor:** `2026-08-31-post-slice3-carried-tail-and-election-NEXT-SESSION-PROMPT.md`.

# Next-session prompt — provenance-ledger slice 3: the served field + the attestation amendment

**Paste this as the task after the standing session opener.** Authored 2026-08-30 at the close of the
C2-discharge session. **Authoring this prompt licensed nothing.** It supersedes the slice-3 half of
`2026-08-31-slice3-or-C2-ruling-and-carried-NEXT-SESSION-PROMPT.md`; that file remains current for the
**carried tail** only.

---

## TIER — `code-critical`. This is a correction; do not inherit the earlier figure.

The founder-signed §13 build table (`2026-08-26-provenance-ledger-SCOPE.md:1100`) sets slice 3 at
**`code-critical`**. **The 2026-08-30 predecessor prompt said `code-elevated`, and that was wrong** —
caught while grounding this prompt. Treat it as Critical: **AC7 engages**, the deploy and any live
verification are **founder-walked**, and PR19 applies.

The reason it is Critical is not the field itself but what it rides with: it amends a **served public
attestation** on a live surface and **relaxes a 404 gate** on the same payload.

---

## Read at open — the verbatims win over this prompt

- `operations/agent-circles-2026-08/2026-08-26-provenance-ledger-SCOPE.md` — **§6** (the field, RULED),
  **§6.5** (the 404 gate relaxation, RULED), **§10** (the attestation wording, **founder-signed, exact
  text locked**), **§11** (what the fix does NOT cover), **§13** (the build table)
- `…/2026-08-26-mentor-ruling-provenance-ledger-q3-and-404-verbatim.md` — Q3 + the 404, both RULED
- `…/2026-08-26-provenance-ledger-slice2-consult-write-and-sweep-CLOSE.md` §"What is inherited by slice
  3 and slice 5" — **slice 3 inherits nothing from slice 2's code and should not need to touch it**
- `…/2026-08-30-mentor-ruling-provenance-ledger-C2-reachability-verbatim.md` — incl. **§ Revised
  ruling** and the §VERIFY block
- `…/2026-08-30-provenance-ledger-C2-observation-input-unreachable-FINDING.md`

---

## The work — FIVE components, ONE edit

§13 is explicit that these ship together, because they touch the same served payload:

**1. The `provenance_gaps` served field.** Name **confirmed by ruling**: `provenance_gaps` plus
`total_provenance_gaps_count`, **shaped on the `orientation_readings` precedent** already in
`trust-record-payload.ts` (capped list + honest total count + inline per-entry clause). **Do NOT widen
`coverage_gaps`** — ruled out twice over: the degraded reuse is *"a corruption of it"*, and the two
are *"different kinds of fact at different grains."*

**2. The §10 attestation amendment — EXACT TEXT, no variant.** Minimal diff; **only the trigger clause
changes**, so existing content pins on the rest keep applying.

> Live (`trust-record-payload.ts`, `does_not_attest[1]`): *"This disclaimer list will be updated when a
> structural fix **is in place**; that fix will surface any artifact whose origin it cannot verify as a
> named coverage gap on this record, never as silence — an absent event will say why it is absent, and
> that it does not mean the agent did not practise."*
>
> **Ships:** *"This disclaimer list will be updated when a structural fix **begins enforcing which
> events are minted**; that fix will surface any artifact whose origin it cannot verify as a named
> coverage gap on this record, never as silence — an absent event will say why it is absent, and that
> it does not mean the agent did not practise."*

**No further mentor question or founder sign-off is owed on this wording** unless the PR19 review
surfaces a reason to revisit it.

**3. The ENV-1 404 gate relaxation (§6.5).** `handler.ts:222` currently reads
`if (!verdict.profile.domains.some((d) => d.hasEvidence))` → 404. Ruled condition:
**`domains.some(hasEvidence) || provenance_gaps.length > 0`**, **tied to the same flag gating the
ledger** (byte-identical flag-off). Ruled *"a faithful extension of ENV-1's actual principle"* — a
provenance-gap entry is not the bare row ENV-1 exists to exclude.

**4. The ADR-013 §8 dated amendment** — the honest-claims envelope gains the new field.

**5. Pins — and the numbering in SCOPE is STALE.** §10 says *"pins from S2-48."* **S2-48 is taken** —
the verdict-variance arc consumed through **S2-68**. **New pins start at S2-69.** Required: a content
pin for **`attests[1]`** (fact 8b — it currently has none) and one for the **amended
`does_not_attest`** clause, following the S2-39/S2-40 precedent.

---

## Settled — do NOT reopen any of these

- **Q3** — sibling field, name confirmed. **The 404** — relax the gate. **§3.3's dependency** — RULED
  CLOSED.
- **C1 ✅ and C2 ✅.** C2 was discharged 2026-08-30 on **SCOPE's pre-ledger exclusion** (not the C1
  precedent — the first ruling's basis was withdrawn). Verified under four independent lines.
- **Edit two is NOT this edit.** The disclaimer's *substantive* update describing the fix's actual
  coverage fires at **enforcement (slice 5)**. This edit is the earlier, **trigger-clarifying** one.
  Two edits, two slices — §10 states this explicitly *"so a build session does not conflate them."*
- **Options (b) and (c)** from the C2 ruling remain ruled out.

## The honest content of what ships

`agent_provenance_gaps` is **empty and will stay empty until slice 5** — and, as of the 2026-08-30
finding, **the pipeline that would populate it has never run**: `classifyProvenanceArtifact` sits
behind an accreditation-write route that 409s the harness's `seed` writes before reaching it. **Say
this plainly in the amendment's supporting material; do not paper over it.** Shipping a field that
describes a table with no rows is by design (C4 requires the surface live *before* the first refusal
can fire) — but the reader should not have to infer that it has never been exercised.

**R18 applies:** C4 requires the field *"deployed, pinned, and **R18-signed**."* Expect
`llms.txt` + `agent-card.json` + api-docs, on the `orientation_readings` precedent.

---

## The standing caution — this is the fifth envelope pass in three days

`TRUST_RECORD_ENVELOPE` took **four separate edits on 2026-08-30**. **Every blocking defect in that
arc was coverage, and coverage risk compounds with passes.** Three were found only by a **live `curl`
after deploy**, never by a local sweep.

**Therefore:** apply by quoted first/last words against the live file; **sweep case-insensitively**;
diff every surface; verify **order**, not only presence; **count rather than estimate**; **ask what
could have deleted or inflated your evidence before trusting its absence**; and **never let the
verification method share an assumption with the edit method.**

**Two live pin cautions:** **S2-64 is an ORDERING pin** — `includes()` is order-blind, so re-verify it
against an **actual re-inversion**, never merely re-run it. **S2-54 has survived four consecutive
revisions untouched — leave it alone.**

**Inherited lessons §13 says must not be rediscovered:** re-derive any CHECK constraint's *current*
definition via `pg_get_constraintdef`, never from a migration file's comments; a fake PostgREST client
that ignores its `select()` argument cannot catch a wrong primary-key column; a `retain_until` without
its purge and sweep in the same session is a PR24 violation.

---

## Standing constraints — unchanged

- **Weights-BLOCKED.** **Q1 — the loop proposes; it never executes.** **The §A boundary** holds.
- **Path-specificity is binding.** The rate is `/api/guardrail` ONLY; `/api/reason` unmeasured, stated
  at all seven places, pinned (S2-52).
- **The class split is binding.** **Grave-vocabulary traffic** was measured; **near-boundary inputs**
  has never been measured. Do not reintroduce the old term.
- **Concurrency:** `ListAgents` at open; `git status` twice; **path-scoped commits — never a
  directory-level `git add`** (the 2026-08-30 session swept in three unrelated untracked C15 files that
  way and caught it only on the second `git status`).
- **Nothing bears on the 0h call, which remains the founder's.**

## State at authoring

- **Switch-on scoreboard: C1 ✅ · C2 ✅ · C3 ~4/90 days (began 2026-08-26) · C4 = this slice.**
  **C3 is the binding clock — slice 5 cannot happen before late November regardless.**
- Ledger **187 rows**, span 2026-08-26 → 2026-08-30; `identity_kind` `credential` 187/187;
  **structurally resolvable 0 / unresolvable 187**; `agent_provenance_gaps` **0**.
- Baseline artifact: `agent-circles-2026-08/runs/2026-08-30/c2-discharge-baseline.json`. The tally
  (`website/scripts/provenance-c2-discharge-tally.ts`) is read-only and **must never be scheduled**.
- **The switch-on re-check is a HARD C2 obligation** — carry it into slice 5's prerequisites.
- Battery **156/0**, `tsc` 0, build compiles — **inherited from 2026-08-29 and NOT re-run since**; the
  2026-08-30 sessions added only records and a standalone script outside the build graph.
- Two small open items, neither blocking: the **per-identity exclusion loophole** (named for the
  mentor) and the **Q5c teardown gap** (`agent_accreditation` missed).

End of prompt.
