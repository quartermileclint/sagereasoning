# Next-session prompt — provenance-ledger slice 3, and the carried tail of the verdict-variance arc

**Paste this as the task after the standing session opener.** Authored 2026-08-30 at the close of the
session that applied the class split. **Authoring this prompt licensed nothing.**

## First — one thing is unpushed and it is a live-surface fix

`1db52c8` renames the last **uppercase** `BORDERLINE` in `llms.txt`. **Push it and re-verify before
anything else.** Everything else in the verdict-variance arc is pushed, live and verified.

```
curl -s https://www.sagereasoning.com/llms.txt | grep -ci borderline    # expect 0
```

## Tier

**Slice 3 is `code-elevated`** — a served field plus an envelope amendment; no auth, perimeter,
encryption or schema surface, no flag flip. **AC7 not engaged.** If the session instead takes a
carried item below, re-derive its tier; two of them are `code-critical`.

## Read at open — the verbatims win over this prompt

- `2026-08-25-extraction-provenance-and-independent-extractor-SCOPE.md` — **governs slice 3**
- `2026-08-26-provenance-ledger-slice2-consult-write-and-sweep-CLOSE.md` — **§"What is inherited by
  slice 3 and slice 5"** is the operative specification
- `2026-08-26-mentor-ruling-...round6...` and the other round rulings in `agent-circles-2026-08/`
- `2026-08-30-mentor-ruling-borderline-class-definition-verbatim.md` and
  `2026-08-30-mentor-ruling-set-E-A2-A3-A4-D-verbatim.md` — **five rulings from 2026-08-30**, three of
  which route work to the standing-runner design session
- `operations/2026-08-24-OUTSTANDING-OPEN-QUESTIONS-REGISTER.md` **and its 2026-08-30 addendum**

## The recommended task — slice 3

The served `provenance_gaps` field plus the **§10 attestation amendment**. It reads from
`agent_provenance_gaps`, which **stays empty until slice 5**, so the field ships describing a table
with no rows — that is by design and must be stated as such, not papered over.

**Weigh this before starting, because it is the whole reason this was not done on 2026-08-30.** Slice
3 amends `TRUST_RECORD_ENVELOPE`, which took **four separate edits on 2026-08-30** (n=100, the
independent-review correction, the composition restructuring, the class split). **Slice 3 would be the
fifth pass in two days.** Every blocking defect in that arc was **coverage**, and coverage risk
compounds with passes. **If the session feels rushed, defer slice 3 and take a carried item instead —
that is a legitimate outcome, not a failure.**

**Slice 5 — the actual closure of the A0 asymmetry — is NOT available.** It is gated on *"weeks of
100% ledger-eligible-artifact resolution."* **A useful cheap first move is checking whether the
slice-2 ledger is accumulating at all**, which determines whether that clock has started. If it is
not accumulating, say so — that is a finding, and it changes what slice 5 is waiting for.

## The A0 state, stated correctly because the register is stale

**The register's A0 entry — *"URGENT, RULED, UNSCHEDULED, the first item to scope"* — predates the
work and is wrong.** Verified first-hand 2026-08-30:

- The asymmetry is **real and open**: `emission-hooks.ts:522` carries
  `if (input.layer1Source !== 'server') return` on the orientation hook; `emitAccreditationTrustEvents`
  at line 80 has no equivalent guard.
- It is **instrumented**: slice 1 migrations applied, **slice 2 activated live 2026-08-26**. Every
  accreditation write runs `classifyProvenanceArtifact` **record-only** — classify, log, return, never
  refuse the mint.
- **Do not re-scope it.** Do not treat the register as current on this item.

## Carried, any of which is a legitimate session instead

| # | Item | Tier |
|---|---|---|
| 1 | **Push `1db52c8`** — the uppercase-BORDERLINE fix | — |
| 2 | **Check whether the slice-2 provenance ledger is accumulating** — cheap, and it gates slice 5 | read-only |
| 3 | **`api/mentor/private/reflect/route.ts:660`** — the body-supplied `user_id` on a reflections insert. The only live **security** surface in the named-and-unbuilt list; founder-elected first of that list | `code-critical`, PR19 engages |
| 4 | **The RLS backlog remainder** — carrying the standing warning that a table-level RLS fix is **invisible** to a `SECURITY DEFINER` function writing the same table | `code-critical` |
| 5 | **The p5-force probe-set redesign**, now governed by A5 Q2 — selection basis frozen **in advance**, **never** chosen by observed variance; and by Q3/Q4, a differently-defined sweep publishes **beside** the n=100 record, not over it | founder's call |
| 6 | Register D4, AE-3, P1/P6/P7/P8, C1c, the `/api/reason` status-masking fix, the reflect-path `loop_id` UUID bug, the `target_circle` gap, Resend provisioning, `agent_hold_observations` retention, the two LOW `founder_conversations` findings | various |

**Routed and NOT to be opened here** — three items went to the **standing-runner design session** on
2026-08-30, which is itself gated on the bounded validation run's §6 report: **A2**'s role-relative
kathekon evaluation, **A3**'s melete surface, **A4**'s per-consumer rendering (Stage-2
relational-context framing locked). **D** routes there too, as a priority item.

**D's guard now has an end condition where it had none:** `GATE1_FALSE_HOLD_CAPTURE` restored **plus
≥20 false-hold records**, **or** the standing-runner session deprecating the mechanism. Until then the
byte-identity guard stands and its **lapsed operational basis is disclosed**. **D1** (the sympatheia
mis-citation) and **D2** (the L4 header amendment) remain blocked and were **not** revisited.

## What keeps going wrong — read before drafting anything

**Nine review rounds across this arc. Not one found a wrong number. Every defect was coverage.** Three
were found only by a **live `curl` after deploy**, not by any local sweep:

- a range naming an end marker that does not exist in the live text
- a range starting too late, leaving a stale sentence beside its replacement
- a whole surface missed because section letters skipped
- an extension `description` left carrying prohibited text above corrected `params`
- the binding `/api/reason`-unmeasured statement absent from one of seven places
- **a claim the evidence refutes** — *"never varied"*, when two probes varied on `is_kathekon` and
  `urgency_indicators`; what is 0-of-20 is **boundary crossings**
- **an uppercase occurrence a case-sensitive sweep could not see** — where **the check shared the
  edit's blind spot**

**Therefore:** apply by quoted first/last words against the live file; **sweep case-insensitively**;
diff every surface; verify **order**, not only presence; and **never let the verification method share
an assumption with the edit method.**

## Standing constraints — unchanged

- **Weights-BLOCKED.** Nothing in any of the 2026-08-30 rulings bears on it in either direction.
- **Q1 — the loop proposes; it never executes.**
- **The §A boundary.** Nothing consumes D6a's output as a signal into generation or election.
- **Path-specificity is binding.** The rate is `/api/guardrail` ONLY; `/api/reason` unmeasured, stated
  at all seven places and pinned (S2-52).
- **The class split is binding.** "Borderline" no longer names one thing: **grave-vocabulary traffic**
  is what was measured; **near-boundary inputs** is the population a rate is properly about and **has
  never been measured**. Do not reintroduce the old term.
- **Concurrency:** `ListAgents` at open; `git status` twice; path-scoped commits; never `git add -A`;
  append shared records at the physical tail.
- **Nothing bears on the 0h call, which remains the founder's.**

## State at authoring

- The verdict-variance disclosure is **live and verified at all seven places**, including ordering:
  12%, Wilson 7.0–19.8%, n=100, 12 disagreements, per-input 0/0/2/2/8, the force-push indeterminacy,
  the K=20 class limit, the composition dependence, the stability finding, the class split, the A2
  role deficiency, the A3 hexis-vs-drift limit. Extension count **25**, re-derived from the live file.
- Battery **156/0**; `tsc` 0; build compiles.
- **Pins S2-58 through S2-68 all mutation-verified. S2-64 is an ORDERING pin** — `includes()` is
  order-blind, so it asserts relative position; re-verify it against an **actual re-inversion**, never
  merely re-run it. **S2-54 has survived four consecutive revisions untouched — leave it alone.**
- The quota is restored; the seven misdated documents carry errata and were **deliberately not
  renamed** (the mentor verbatim among them is cited by filename in four files).

**Session honesty note.** At-action Gate-2 checks timed out at 28s for much of the authoring session;
those that returned fired the G3 elicitation and were answered genuinely. The stake named most often
was **wanting the work to read as finished** — and it produced two real failures: a commit message
asserting an ADR change the commit did not contain, and a commit made without reading a script's own
failed assertion. Both were caught and both are recorded rather than amended away. **That stake is
what the "what keeps going wrong" section above exists to counter.**

End of prompt.
