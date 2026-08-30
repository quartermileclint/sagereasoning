# Finding — the provenance ledger's C2 observation input is unreachable

**Date:** 2026-08-30. **Session:** founder stream, read-only diagnostic.
**Tier:** read-only. **No code, schema, flag, credential, migration, or public-surface change.
Production untouched. AC7 not engaged.**

> **⚠ ERRATUM — RAISED AND RESOLVED, 2026-08-30.** A claim in this document was **FALSE AS STATED**:
> that no agent had a completed accreditation write in the trailing 30 days, and that C2's denominator
> is empty. **`sagereasoning:stoa-q5c-smoke@v1` had a seed write on 2026-08-12**, inside the window;
> the `credential-completed` signal **under-reports** because smoke teardowns delete trust-event rows.
> **The mentor accepted the erratum, withdrew the original option-(a) discharge, and issued a revised
> conditional ruling. The condition was verified (the write predates ledger activation by 14 days,
> under four independent checks) and C2 is now DISCHARGED on SCOPE's pre-ledger exclusion — NOT on the
> C1 empty-population precedent this document wrongly supplied.** See
> `2026-08-30-mentor-ruling-provenance-ledger-C2-reachability-verbatim.md` § Revised ruling, and
> `2026-08-30-MENTOR-CORRECTION-C2-population-premise-was-wrong.md`.

**Occasion.** The successor prompt
(`operations/handoffs/founder/2026-08-30-provenance-ledger-slice3-and-carried-NEXT-SESSION-PROMPT.md`)
named this as carried item 2: *"Check whether the slice-2 provenance ledger is accumulating — cheap,
and it gates slice 5,"* and said in terms: *"If it is not accumulating, say so — that is a finding,
and it changes what slice 5 is waiting for."*

It is accumulating on one side and structurally dead on the other. This document records the
evidence, root-causes it to a specific line, and states what it does and does not change. **It rules
nothing.** The threshold question it raises is put to the mentor separately
(`2026-08-30-MENTOR-QUESTION-provenance-ledger-C2-reachability.md`).

## The two-sentence finding

**The consult-side write is healthy — 187 rows accumulated since activation.** **The classification
side has produced nothing and cannot produce anything on current mechanics**, because
`classifyProvenanceArtifact` is reached only from the accreditation-write route, and the only agent
writing accreditations sends a `seed` write against a row that already exists, which the route
refuses with a 409 *before* the emission call.

## Evidence, first-hand

Every number below was counted this session against production
(`jdbefwkonfbhjquozgxr`, identified as production by `founder_conversations` = 71, matching the
recorded ~70) or against the founder-loop log, via read-only queries. Nothing is quoted from a prior
close document without re-derivation.

### 1. The write side is working

| Fact | Value |
|---|---|
| `agent_provenance_ledger` rows | **187** |
| First / last `recorded_at` | 2026-08-26T06:28:15Z / 2026-08-30T09:04:28Z |
| Distinct `identity_kind` | `credential` — **187 of 187** |
| Distinct `layer1_source` | `server` — **187 of 187** |
| By `credential_ref` | 186 = `api_key:33bef3d4…` (`sagereasoning:s9-loop@v1`); 1 = `api_key:1727d770…` (the slice-2 activation smoke) |
| Per UTC day | 08-26: 1 · 08-28: 1 · 08-29: 120 · 08-30: 65 |
| `agent_provenance_gaps` rows | **0** — correct; that table is slice 5's |

The 187 rows are themselves the proof that `SUBSTRATE_PROVENANCE_LEDGER_ENABLED` is genuinely on in
production. That much of `D-PROVENANCE-LEDGER-SLICE2-ACTIVATION-LIVE-2026-08-26` is confirmed live,
not merely recorded.

### 2. The classification side has produced nothing

| Fact | Value |
|---|---|
| `credential-completed` trust events since 2026-08-26 | **0** |
| `justice-surface*` trust events since 2026-08-26 | **0** |
| Most recent `credential-completed` **ever** | 2026-07-29, `sagereasoning:correlationid-verify@v1` — a smoke agent, **32 days ago** |

Both event families derive from the same guarded region of `emitAccreditationTrustEvents`, so their
joint absence is the observable signature of "no accreditation write completed."

### 3. Root cause — a `seed` write against an existing row returns before emission

The call path, grepped exhaustively rather than assumed:

- `classifyProvenanceArtifact` — **one** production call site:
  `website/src/lib/substrate/trust-core/emission-hooks.ts:152`.
- `emitAccreditationTrustEvents` — **one** production call site:
  `website/src/app/api/accreditation/[agent_id]/route.ts:835`.

And at `route.ts` step 6, **before** that call:

```ts
const existing = await lookupAccreditationRecord(agent_id)
if (validated.body.kind === 'seed' && existing !== null) {
  return buildWriteConflictResponse()          // ← returns here
}
```

The harness close hook sends exactly one body kind —
`harness/gate1-pre-decision/claude-code/hooks/close-hook.mjs:168`, `kind: "seed"`, the sole `kind:`
occurrence in the file; it has no `update` path — and maps the 409 to its log token at line 226
(*"a row already exists — honest, not an error"*).

The `sagereasoning:s9-loop@v1` accreditation row exists. Therefore every close-hook write 409s
before classification. Confirmed in the log:

| Fact | Value |
|---|---|
| `CLOSE session=` lines since 2026-08-26 | **15** |
| Of those, `accred=already-exists` | **15 of 15** |
| `accred=written` anywhere in the log | **0**, across its full span, 2026-07-12 → 2026-08-30 (line count deliberately not quoted — the log is live and appends during any session that reads it) |

`close-hook.mjs` is the only harness caller of the accreditation endpoint
(`GATE1_ACCRED_ENDPOINT`, derived at line 67).

### 4. Even a successful write would not resolve

`writeSideIdentityMatches` (`provenance-classification.ts`) requires
`entry.identity_kind === 'owner_agent_pair'`. All 187 rows are `identity_kind: 'credential'` — the
harness's consult credential is owner-less. Every one would classify `identity_mismatch`, never
`permit`.

**This part is anticipated and correct.** SCOPE §3.1/§3.3 defers the harness by name, and the
function's own header states this outcome is *"by construction, not by a special-cased exclusion."*
It is recorded here for completeness, not as a defect.

## What this changes

**1. The slice-2 close's carried step 5 cannot be satisfied as written.** It reads: *"Watch the
`[trust-core][provenance-ledger] classify …` log lines accumulate in Vercel's function logs — this is
the founder-run readiness-check input SCOPE §9's C2 threshold needs."* There are no such lines and
there will be none while the harness's write path is a seed against an existing row. Not "few" —
**zero, by construction, indefinitely.** Nothing in the arc records this.

**2. C2's denominator is ~~empty~~ NOT empty on its own terms — CORRECTED, see the erratum above.**
C2 is scoped to *"every agent with an accreditation write in the trailing 30 days."* This document
originally read *"the last completed accreditation write was 32 days ago"*, derived from
`credential-completed` events alone. That signal under-reports: **`sagereasoning:stoa-q5c-smoke@v1`
wrote on 2026-08-12**, inside the window, and its events were deleted at the Q5c teardown. Its
artifacts nonetheless **predate the ledger** (2026-08-12 < 2026-08-26), so SCOPE's pre-ledger clause
excludes them from the completeness denominator — a different basis for a similar conclusion. Whether an empty denominator satisfies C2 vacuously — as SCOPE explicitly reasons for **C1**
(*"the population is empty — every other agent already coheres… C1 is satisfied as of the measurement
date"*) — or whether C2's *"observed across at least two consecutive weeks of record-only
operation"* clause makes an empty population unobservable and therefore unsatisfiable, **is a
threshold-definition question and is not decided here.**

**3. C3 is unaffected but far from met** — a 90-day soak, 4 days elapsed.

## What this does NOT change

- **Slice 2 is not defective.** Every behaviour observed is what its own documents specify. The write
  side works; record-only is genuinely record-only; the harness refuses by construction as ruled. The
  gap is between the readiness *observation* the close asked the founder to perform and the mechanics
  that would generate it.
- **Slice 3 is not blocked.** It reads `agent_provenance_gaps`, which is legitimately empty and stays
  so until slice 5. This finding sharpens how honestly slice 3's §10 amendment should describe that
  emptiness — the table is empty *and* the pipeline that would fill it has never run — but it does
  not gate the work.
- **Nothing here bears on weights** (BLOCKED, unchanged), **Q1**, **the §A boundary**, or **the 0h
  call**, which remains the founder's.

## Method note

The prompt's standing warning — *"never let the verification method share an assumption with the edit
method"* — applied here as: every claim was derived from the live database or the live log, and each
inferential step (*"no `credential-completed`" ⇒ "no classification ran"*) was then **independently
confirmed by reading the code path**, not left as an inference. One residual is stated honestly: a
repeat accreditation write whose evidence set exactly matched the 2026-07-29 write would dedupe on
the unique index and emit no new event while still classifying. It would require a prior write in the
window to dedupe against, and there is none — but the log evidence (15/15 `already-exists`, 0
`written`) is the independent check that closes it.

*End of finding.*
