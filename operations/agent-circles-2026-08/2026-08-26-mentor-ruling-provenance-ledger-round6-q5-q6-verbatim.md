# Mentor ruling, round 6 — verbatim (Q5: slice-2 scope; Q6: sweep flag shape)

**Ruled 2026-08-26.** Answers the two questions raised in
`2026-08-26-MENTOR-QUESTION-round6-provenance-ledger-slice2-scope-and-sweep-flag.md`. Both questions
RULED, no corrections needed. Folded into the slice-2 build prompt the same session.

---

### Q5 — Does slice 2 build §5's classification logic, or only the write?

> Reading A is correct. Slice 2 builds §5's classification logic in record-only mode alongside the
> consult-side write.
>
> The reasoning is in §9's C2 threshold itself. C2 requires observing, across at least two consecutive
> weeks of record-only operation, that every agent with an accreditation write in the trailing 30 days
> has 100% of that write's ledger-eligible submitted artifacts resolving in the ledger. There is no way
> to observe that without something classifying each submitted artifact against the ledger during the
> record-only window.
>
> Reading B's alternative — a standalone founder-run script that independently re-implements the
> lookup-and-classify logic — would work, but it creates a second implementation of the same logic that
> must be kept in sync with the first. The S11 false-hold-observation-report precedent it cites was
> appropriate for a one-time measurement against existing data. C2 is an ongoing observation across two
> consecutive weeks. A mirrored script is the wrong shape for an ongoing observation — it is the right
> shape for a retrospective audit.
>
> The classification logic belongs in slice 2, running at every accreditation write, record-only.
> During record-only it never refuses and never writes an `agent_provenance_gaps` row — those are
> enforce-phase behaviours per §5 step 4 as written. It classifies, logs the outcome, and returns. The
> founder-run readiness check tallies the logged outcomes to assess C2.
>
> On the pure-function question: yes, build it as a pure function. Identity plus ledger-lookup-result
> in, outcome out. The reasons are the same ones the observation history has been tracking as a
> maturing capacity — surfacing structural constraints before implementation rather than discovering
> them mid-build. Slice 5's enforce-phase wiring will need to call the exact same classification logic
> and act on its output rather than permitting the mint. If the classification logic is a pure
> function, slice 5 wires it into the enforcing branch without rewriting it — the function's output
> drives the branch decision. If it is not a pure function, slice 5 either rewrites it or inherits its
> side effects into the enforcing branch, which is the wrong shape for a two-phase design where
> record-only and enforce-only differ only in what they do with the classification result, not in how
> they produce it.
>
> One implementation note that should travel into the slice-2 build prompt: the pure function's
> signature should be explicit about what constitutes a ledger-eligible artifact. The classification
> logic cannot run on artifacts the ledger was never designed to cover. The eligibility predicate
> should be defined in the pure function's contract, not inferred by its callers.

---

### Q6 — Flag shape for the two new purge functions

> Gate internally on `SUBSTRATE_PROVENANCE_LEDGER_ENABLED`. Not the shared trajectory sweep flag, not
> a dedicated third flag.
>
> The Stoa ST3/ST4 precedent is the right frame and the document applies it correctly. The lesson from
> that incident is not merely that a sweep silently active before its owning feature's flag is set is a
> shape problem — it is that the shape problem persists in the record. Every session between ST6's
> activation and the discovery kept recording ST3/ST4 as dark without re-checking the actual flag they
> depended on. The shape contradiction between what the record said and what was live was the durable
> harm, not the nine days of inert sweep activity.
>
> The argument that riding the shared trajectory sweep flag is fine here — unlike the Stoa case —
> because a purge with nothing to purge is inert regardless of when it goes live is technically correct
> and strategically wrong. It is technically correct because the two new tables are empty until slice
> 2's write path is deployed and its own flag is set. It is strategically wrong because it reproduces
> the exact shape that the Stoa incident named as a standing rule: dark is per-flag, not per-feature. A
> sweep function gated only by `SUBSTRATE_TRAJECTORY_SWEEP_ENABLED` is described as dark in the
> provenance ledger's own record until `SUBSTRATE_PROVENANCE_LEDGER_ENABLED` is set — but it is not
> dark, it is active and inert. That is the same shape. The inertness is a coincidence of the current
> state, not a property of the design.
>
> The dedicated third flag is the maximal-separation option and it is not wrong, but it is unnecessary.
> The provenance ledger already has its own flag. The purge functions are part of the provenance ledger
> feature. Gating them on `SUBSTRATE_PROVENANCE_LEDGER_ENABLED` couples sweep activity to the same flag
> that governs whether the ledger writes anything at all — which is the right coupling. A sweep that
> runs only when the ledger is active is not an arbitrary constraint. It is the correct description of
> the feature's operational state. When the ledger is off, the purge functions are off. When the
> ledger is on, the purge functions are on. The flag's meaning is preserved and the record is accurate
> at every point.
>
> The verification note — that `SUBSTRATE_TRAJECTORY_SWEEP_ENABLED`'s production state is a CLAUDE.md
> record claim, not independently re-verified this session — is correctly flagged and correctly carried
> into the slice-2 build prompt as a pre-build verification step. That discipline is the right shape.
> Do not trust the file; verify against the live environment before writing the sweep code.

---

## Disposition

- **Q5 → Reading A, RULED.** Slice 2 builds the §5 classification logic (pure function: identity +
  ledger-lookup-result in, outcome out; the eligibility predicate for "ledger-eligible artifact" is
  part of the function's own contract, not inferred by callers) alongside the consult-side write,
  running record-only at every accreditation write — classifies, logs, returns; never refuses, never
  writes `agent_provenance_gaps`. Slice 5 reuses the identical function in its enforcing branch.
- **Q6 → `SUBSTRATE_PROVENANCE_LEDGER_ENABLED`, RULED.** Both new purge functions gate internally on
  the ledger's own flag — not the shared trajectory sweep flag, not a new dedicated flag.

Both folded into
`operations/handoffs/founder/2026-08-26-provenance-ledger-slice2-consult-write-and-sweep-
NEXT-SESSION-PROMPT.md` the same day.

## Cross-references

- `2026-08-26-MENTOR-QUESTION-round6-provenance-ledger-slice2-scope-and-sweep-flag.md` — the questions
- `2026-08-26-provenance-ledger-SCOPE.md` §5, §9, §13 — the governing design this ruling extends
- Memory: `shared-flag-dark-is-per-flag-not-per-feature` — the Stoa precedent Q6 turns on
