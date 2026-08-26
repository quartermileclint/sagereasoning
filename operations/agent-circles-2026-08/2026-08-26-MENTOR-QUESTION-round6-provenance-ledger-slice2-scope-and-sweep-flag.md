# Mentor question, round 6 — two questions found while prepping slice 2, after the arc's own closure

**Raised 2026-08-26.** Round 5 closed the provenance-ledger scoping arc in full — every design question
this document's earlier rounds carried was ruled, and slice 1 (both migrations) has since been built,
adversarially reviewed, and applied clean to TEST and production. **Nothing here reopens anything
already ruled.** These two questions were found while authoring the slice-2 next-session prompt (the
consult-side write + its flag + the PR24 sweep) — schema-adjacent implementation questions the SCOPE
document's own text does not cleanly resolve, surfaced now rather than left for the build session to
guess at.

---

## Q5 — Does slice 2 also build §5's classification logic, or only the write?

**The ambiguity, stated precisely.** §13's build-sequencing table (mentor-signed 2026-08-26) describes
slice 2 as: *"The consult-side write + its flag, record-only; PR24 sweep wiring in the same session."*
Read narrowly, that is ONE piece of work: populate `agent_provenance_ledger` from `/api/reason`.

But §5 ("The lookup and the refusal") describes a DIFFERENT piece of logic, at a DIFFERENT location —
`emitAccreditationTrustEvents` (the accreditation write boundary, not `/api/reason`) — and §5's own
step 4 states a record-only BEHAVIOUR for it: *"Record-only phase: log every outcome, mint as today
regardless of outcome (§9). Enforce phase: any refused artifact ⇒ no mint for that write, plus one
`agent_provenance_gaps` row..."* That sentence only makes sense if the classification logic (resolve
identity → hash the signature → look it up → classify `permit` / `no_ledger_entry` / `out_of_window` /
`identity_mismatch` / `caller_supplied_extraction`) already exists and runs DURING record-only — it
just doesn't refuse anything or write a gap row yet.

**Why this isn't merely academic.** §9's own C2 threshold requires exactly this measurement: *"every
agent with an accreditation write in the trailing 30 days has 100% of that write's ledger-eligible
submitted artifacts resolving in the ledger, observed across at least two consecutive weeks of
record-only operation."* There is no way to observe that without something classifying each submitted
artifact against the ledger during the record-only window. Two ways to get there:

- **(A) Build §5's classification logic now, in slice 2**, running at every accreditation write,
  record-only (never refuses, never writes `agent_provenance_gaps` — that stays an enforce-phase
  behaviour per §5 step 4 as written), logging its outcome so a founder-run readiness check can later
  tally it.
- **(B) Defer §5 entirely** to a later, unnamed slice (or fold it into slice 5's "switch-on," which
  would then need to build the classification logic AND its enforcement in one step), and measure C2
  in the interim via a standalone founder-run script that independently re-implements the same
  lookup-and-classify logic against the ledger directly — mirroring the Trust Layer S11
  false-hold-observation-report precedent.

**Question:** which reading is correct — does slice 2's ruled scope include building §5's
classification logic in record-only mode (reading A), or is that logic's construction deliberately
left for a later slice, with C2 measured by an independent script in the meantime (reading B)? If
reading A: should the classification logic live as a pure function (identity + ledger-lookup-result in,
outcome out) so slice 5 can later wire the exact same function into the enforcing branch without
rewriting it, or does the mentor see a reason it should be built differently?

---

## Q6 — Should the two new purges ride the ALREADY-LIVE `SUBSTRATE_TRAJECTORY_SWEEP_ENABLED`, or their own flag?

**The context.** §7's ruled recommendation is to extend the existing `/api/cron/trajectory-retention-
sweep` handler to purge both new tables, rather than add a new cron — citing the
`/api/cron/observability-retention-sweep` two-table-in-one-handler precedent, where BOTH purges share
ONE flag (`SUBSTRATE_OBSERVABILITY_SWEEP_ENABLED`) because they are the same feature.

**The hazard, found by checking rather than assuming.** `SUBSTRATE_TRAJECTORY_SWEEP_ENABLED` is already
`true` in production (documented since 2026-06-14, `/CLAUDE.md`'s production-state record — to be
re-verified live before build, not merely trusted from the file). If the two new purges are gated ONLY
by that same, already-"on" flag — the naive way to "extend the handler" — they go live the instant
this slice's code is deployed, regardless of whether `SUBSTRATE_PROVENANCE_LEDGER_ENABLED` has been
set. This is the exact class of mistake this project's own standing record already caught once: the
Stoa's ST3/ST4 silently went live for nine days when they gated on the same base flag a sibling feature
(ST6) later activated, and every session in between kept recording them as "dark" without re-checking
the actual flag they depended on.

**Why this is low-severity in practice but still worth ruling on the shape.** The two new tables are
empty until slice 2's write path is deployed and its OWN flag is set — so an accidentally-early-active
sweep deletes zero rows today. The concern is the SHAPE (a sweep silently active before its owning
feature's flag is set, contradicting whatever record later describes it as "dark"), not an immediate
live-data risk.

**Question:** should the two new purge functions (`purgeExpiredProvenanceLedger`,
`purgeExpiredProvenanceGaps`) gate internally on `SUBSTRATE_PROVENANCE_LEDGER_ENABLED` itself (coupling
sweep activity to the same flag that governs whether the ledger writes anything at all — the reading
this document's author leans toward), on a dedicated new sweep sub-flag independent of both the write
flag and the trajectory sweep's flag (maximal separation, at the cost of a third flag for one feature),
or is riding the shared `SUBSTRATE_TRAJECTORY_SWEEP_ENABLED` flag actually fine here — unlike the Stoa
case — because unlike ST3/ST4 (which served live, user-facing behaviour on that shared flag) a purge
with nothing to purge is inert regardless of when it goes live?

---

## Why both together

Both questions surfaced from the same pass — authoring the slice-2 build prompt — and both are
implementation-shape questions the SCOPE document's existing text doesn't fully close, rather than new
policy questions. Neither reopens anything already ruled in rounds 1–5.

## Verification status

- Q5's mechanism claims (the `emitAccreditationTrustEvents` location, §5 step 4's exact wording, §9's
  C2 exact wording) verified against `operations/agent-circles-2026-08/2026-08-26-provenance-ledger-
  SCOPE.md` at source this session, and against `website/src/lib/substrate/trust-core/
  emission-hooks.ts:74` (the function's current location, re-confirmed at HEAD, not assumed from the
  SCOPE document's own citation).
- Q6's claim that `SUBSTRATE_TRAJECTORY_SWEEP_ENABLED` is live in production is a `/CLAUDE.md` record
  claim, not independently re-verified against the live Vercel environment this session — flagged as
  such in both this document and the slice-2 build prompt, which instructs re-verification before the
  sweep code is written.
- The Stoa ST3/ST4 precedent cited in Q6 is from this project's own memory record
  (`shared-flag-dark-is-per-flag-not-per-feature`, 2026-08-12), not re-derived from the Stoa's own
  session records this session.

## Cross-references

- `2026-08-26-provenance-ledger-SCOPE.md` §5 (the lookup/refusal design), §9 (the readiness threshold),
  §13 (the build sequencing)
- `operations/handoffs/founder/2026-08-26-provenance-ledger-slice2-consult-write-and-sweep-
  NEXT-SESSION-PROMPT.md` — the build prompt these two questions were found while authoring
- Memory: `shared-flag-dark-is-per-flag-not-per-feature` (the Stoa precedent Q6 cites)
