# Scope — the signature-keyed provenance ledger (ruled option (a))

**Session:** 2026-08-26, founder stream, `governance` — **documents only.** No code, migration, flag,
credential, or public surface was touched. **AC7 not engaged. This document licenses nothing.**

> **⚠ POST-ESCALATION NOTICE, appended after this document's first close.** The founder elected to
> escalate this scoping to the mentor. Two independent-review passes then found this document's own
> §14 recommendation and §15 self-assessment materially wrong in four places — corrected in place below
> (§1's ruled-table, §4.1, §6, §7.2, §9's C3, §10, §14, §15) rather than by silent rewrite. **The
> companion mentor-question document carries the resulting four questions:**
> `2026-08-26-MENTOR-QUESTION-provenance-ledger-identity-and-policy.md`. Read this scope alongside it —
> the corrections here are what changed the mentor package from three questions to four.

**What it scopes is `code-critical` when built** — two new tables, a trust-core write path, the
accreditation write boundary's mint decision, and a change to a served public payload.

**Binding inputs, verbatim wins over anything here:**
`2026-08-25-mentor-ruling-extraction-provenance-fix-choice-verbatim.md` **and its ADDENDUM (F-1/F-2/F-3)
and ADDENDUM 2** — all three are the binding record.
Mechanism inheritance: `2026-08-25-extraction-provenance-and-independent-extractor-SCOPE.md`.

---

## §0 — The headline, before the detail

Three things this session establishes that the ruling could not see, in descending order of how much
they change the build:

**1. F-1's correction does not, by itself, do what F-1 said it does — and the reason is a fact about
the s9-loop consult credential, not about the module F-1 named.** F-1 corrected the scoping unit to
the owner+agent pair *"with a credential-only fallback"*, citing
`website/src/lib/substrate/longitudinal-identity.ts` as computing exactly the right unit. It does.
But `resolveLongitudinalIdentity` reaches `owner_agent_pair` **only when owner AND agent are both
non-null**, and the s9-loop **consult** credential — the one that produces the signed assessments —
is **owner-less by design**. That module's own docstring names it: *"An agent-declared but owner-less
credential (the live s9-loop consult credential's shape — `external_consumer`, owner NULL,
agent-bound) resolves to the CREDENTIAL scope with the pair-join REFUSED."* The **accreditation-write**
credential is owner+agent bound (the 6e §A invariant). **So consult-side resolves to `credential`,
write-side resolves to `owner_agent_pair`, and they never match — every mint from the project's own
reference harness is still refused.** F-1's stated purpose is preserved by the ruling and defeated by
the configuration. **§3 works this and resolves it without a design compromise and without a new
identity notion** — the fix is a credential-configuration prerequisite on the switch-on, not a
relaxation of the cross-tenant guard. **It needs one founder SQL query to confirm (§12.1).**

**2. The F-2 surface question (Step 2) is answered, not deferred, and the answer is not to touch
`coverage_gaps`.** Step 2's finding is confirmed exactly at HEAD: `coverage_gaps: VirtueTrustDomain[]`
(`trust-record-payload.ts:131`) is a bare array of virtue-domain names inside
`TrustRecordAggregateView`, populated from `aggregate.coverageGaps`, which `combiner.ts:683` fills
from A2-zeroed domains only. It is domain-level and evidence-weight-semantic; a refused mint is
event-level and provenance-semantic. **But an exact precedent for what F-2 needs already exists on the
same payload** — the C2c `orientation_readings` list: optional, capped, newest-first, **each entry
carrying its honest clause INLINE** (ruled that way because *"the entry is the unit that will be read
in isolation"*), served alongside a `total_..._count` so a reader sees *"showing 50 of 847"* rather
than inferring completeness. **F-2's requirements map onto that pattern one-for-one.** §6.

**3. The PA-10 coupling (F-3 i) is stronger than "incidental narrowing", and it runs the opposite way
from the reading that would de-prioritise the scheduled work.** Today **no artifact-age signal exists
anywhere** — the signed envelope carries no timestamp, which is why AE-2 had to refuse temporal
attribution outright and disclose that *"replayed evidence is not age-detectable."* A ledger that
records `recorded_at` per signature **supplies, for the first time, the input A5's recency tier needs
to be computable at all.** So the ledger is not a partial substitute for PA-10's closure — it is a
**prerequisite enabler** for it. §8.

---

## §1 — Ruled, and not re-litigated here

| | Ruled | Where it lands below |
|---|---|---|
| The option | (a), the signature-keyed ledger. (b) and the hybrid available **only if (a)'s limits prove unacceptable after scoping** | §14 states plainly that they did not |
| Missing entry | **Refuse the mint** | §5 |
| Write semantics | **Insert-once, never upsert** | §4.3 |
| Scoping unit | **Owner+agent pair with a credential-only fallback**, via the existing `resolveLongitudinalIdentity`; **no second identity notion** | §3 — honoured exactly, and §3 is the finding |
| Phasing | **Record-only → accumulate → switch refusal on**; threshold **defined before ship** | §9 |
| Refusal visibility | **Every refused mint is a named coverage gap, never silence, "using the existing machinery" — F-2: "The existing `coverage_gaps` field is the right surface"**; no signature or artifact detail | **§6 — DEPARTED FROM, flagged.** The first draft of this row dropped the `coverage_gaps` clause, which is the clause §6 departs from. Restored |

---

## §2 — Mechanism facts, re-verified first-hand at HEAD 2026-08-26

PR20 drafting-time discipline. The inherited list was a starting point, not an authority. **Two items
came back sharper than inherited and are marked ⚠.**

| # | Fact | Source |
|---|---|---|
| 1 | `emitAccreditationTrustEvents` gates on `isTrustCoreEnabled()`, `provenanceEnforced`, and a non-empty `signed_assessments` array. **No extraction-provenance check.** It already resolves `owner_user_id` and builds `credentialRef` — **so both identity inputs are in hand at the refusal point** | `emission-hooks.ts:74-124` |
| 2 | It is called **after** the writer, `await`ed, wrapped `.catch(() => {})`, and *"never throws to this write path"* | `accreditation/[agent_id]/route.ts:835-843` |
| 2a | ⚠ **Therefore "refuse the mint" ≠ "refuse the write."** The accreditation write still returns 200; only the trust event is not minted. A build session must not turn this into a 422 — that is a different, much larger blast radius and is not what was ruled | same |
| 3 | `resolveLongitudinalIdentity` returns `owner_agent_pair` **only if `ownerUserId !== null && agentId !== null`**; otherwise `credential` with `agent_declared` | `longitudinal-identity.ts:76-92` |
| 3a | ⚠ **The owner-less-credential branch is documented against the s9-loop consult credential by name** | same file, docstring `:20-25` |
| 4 | The consult-side write site has `credentialRef`, `ownerUserId`, `declaredAgentId`, and `preExtractedLayer1Schema` all in scope | `api/reason/route.ts:1802-1880` |
| 5 | The **signed** assessment is `sandwichResult.output.assessment` — the signed wrapper when signing is on, bare otherwise | `route.ts:1534-1536`, `:2096` |
| 6 | ⚠ **The PERSISTED `agent_assessment_history.layer1_source` stamp is written only inside `isTrajectoryDeltaEnabled()`** — a flag-gated blind window on the durable record. (The *wire* field `meta.layer1_source` is computed separately under `SUBSTRATE_L1_SCHEMA_KEY_PATH_ENABLED` at `:2045-2049`; the expression itself is not delta-gated.) The ledger must compute provenance **unconditionally** from `preExtractedLayer1Schema !== undefined`, or it inherits that blind window | `route.ts:1867-1873`; `:2045-2049` |
| 7 | `emitOrientationReadingTrustEvent` is the closest structural precedent for a provenance-aware per-consult side-write: same identity inputs, `sharedCredCtx` reuse, never throws, MEASURE | `emission-hooks.ts:441-470` |
| 8 | `emitLedgerOnlyTrustEvents` exists: **INSERT-ONLY, never folds state, never touches a reflect timestamp** | `trust-core-store.ts:300` |
| 9 | **`agent_trust_events.artifact_ref` is `NOT NULL CHECK (length > 0)`** (`:143`), and the invariant is stated inline at `:137-138` (*"NOT NULL: no trust event without a verifiable artifact"*) **and in the table comment at `:335`** (*"no trust event without one"*). **Not** in the `COMMENT ON COLUMN` at `:354-356`, which says only "NOT NULL + non-empty" — the attribution matters because §4.1 leans on this being a published invariant, and the table comment is what carries it | `supabase-agent-trust-core-migration.sql:137-143, 335, 354-356` |
| 10 | `TrustEventType` currently enumerates **21** values; `ArtifactKind` **5** | `types.ts:57-136` and `:147-156` |
| 11 | `agent_trust_events`, `agent_trust_state`, and `agent_assessment_history` all retain **90 days** | trust-core migration `:170,:288`; store `:571-613` |
| 12 | `vercel.json` carries **6** crons; `/api/cron/observability-retention-sweep` already purges **two** tables in one handler — the precedent for not adding a cron per table | `website/vercel.json`; the C-1 record |
| 13 | The harness's accreditation write reads **that session's** accumulated provenance (`readProvenance(cfg, sessionId)`, session-id-keyed) and writes at `Stop` | `close-hook.mjs:130-211` |
| 14 | Highest existing S10 battery pin is **S2-47** | `s10-trust-record-surface.test.ts` |

**Not verifiable from a repo session (PR20):** the s9-loop consult credential's `owner_user_id`; the
age distribution of submitted assessments. Both are §12 founder prerequisites.

---

## §3 — The identity finding, and its resolution

### 3.1 The mismatch, stated precisely

The ledger writes at consult time under the identity of the **consult** credential and reads at write
time under the identity of the **accreditation-write** credential. Under the ruled unit:

| | s9-loop consult credential | s9-loop accred credential |
|---|---|---|
| owner_user_id | **NULL** (`external_consumer`) | set |
| agent_id | `sagereasoning:s9-loop@v1` | `sagereasoning:s9-loop@v1` |
| `resolveLongitudinalIdentity` | `{kind:'credential', credential_ref:'api_key:33bef3d4…', agent_declared:true}` | `{kind:'owner_agent_pair', owner_user_id:…, agent_id:'sagereasoning:s9-loop@v1'}` |

**No matching rule joins these.** The credential refs differ (that is the whole point of the two-
credential split), and the pair is unreachable on the consult side by construction, not by accident —
the guard exists so a `(null, agent_id)` join cannot aggregate any owner-less credential claiming that
agent_id.

**What F-1 got right and what it did not reach.** F-1's principle is sound and its unit is the right
unit. What it did not check is that the specific configuration it cited as the reason for the
correction **fails the module's own precondition on one of its two credentials**. That is a
second-order consequence of exactly the kind PR20 exists to surface before a build discovers it.

### 3.2 The three ways out, and why only one is available

| | Path | Verdict |
|---|---|---|
| A | Relax the guard: let a `credential`-kind consult entry be resolved by an `owner_agent_pair` lookup sharing the agent_id | **Rejected.** This *is* the `(null, agent_id)` join the cross-tenant guard forbids, and it reintroduces precisely the cross-credential surface the ruling's stated reason is about. It would also be a second identity notion, which the ruling forbids by name |
| B | Widen the ledger's matching to "identity matches **or** credential_ref matches" | **Does not help.** The two credential refs differ. It buys nothing and adds a rule |
| C | Make the harness's consult credential owner+agent bound, so both sides resolve to the pair — and make that a **switch-on precondition**, not a design change | **The available path.** The module is used unchanged; no new identity notion; the guard is untouched; the configuration moves to satisfy it |

### 3.3 Path C's own blast radius — named, because it is not free

Two forms, and they are not equivalent:

- **Mutating the existing credential's `owner_user_id`** — **do not do this without weighing it.**
  `POST /api/credential/erase` scope-guards external-consumer erasure on `owner_user_id IS NULL`.
  Binding an owner takes that credential **out of the consumer-erasure path** and changes what
  `owner_kind` denotes for it. That is an auth-and-data-rights-adjacent state change, not a config tweak.
- **Minting a fresh owner+agent-bound consult credential for the harness and retiring the current one**
  — **recommended.** No existing credential's owner semantics are mutated; it is an ordinary
  founder-walked mint + revoke, which this project has done repeatedly; and it is the same shape as
  the gen-1 → gen-2 rotation already on record.

Either way it is a **founder-walked credential step and a named precondition on §9's switch-on**, not
part of the build.

### 3.4 The general form, which is what actually belongs in the switch-on condition

The harness is one instance of a general rule the ledger creates:

> **For any agent, every credential that produces assessments must resolve to the same longitudinal
> identity as the credential that submits them — or its assessments will be refused.**

That is a checkable condition over the live credential population, it is exactly the kind of concrete
condition addendum 2 demanded be *"defined before the ledger ships, not discovered operationally"*, and
it falls out of the identity finding rather than being invented for the threshold. §9 uses it.

---

## §4 — The schema and the write path

### 4.1 Two tables, and why the refusal record is not a trust event

The obvious-looking home for a refusal record is a new `agent_trust_events` type emitted through
`emitLedgerOnlyTrustEvents` (fact 8) — insert-only, non-folding, well precedented by the
`orientation-reading-*` triple. **A new table is recommended instead, but the reasoning below is
corrected from the first draft, which independent review found to equivocate.**

**The argument that does NOT hold, stated so it is not reused:** *"a refusal record is by definition the
case where no verifiable artifact exists — that is why it was refused."* That conflates two different
things. No verifiable **extraction-origin** artifact exists — true, that is the whole reason for the
refusal. But the refusal event's own claim — *an accreditation write occurred and was refused for
reason R* — is backed by a real, retained, verifiable thing: the write itself. `'accreditation:<write_
id>'` would be an honest `artifact_ref` in a shape the invariant already accommodates: the migration's
own comment names `'reflect:<session_id>'`, a bare DB-row handle, as a legitimate value, and for the
signed-assessment case `artifact_ref` is the signing `key_id` — which does not identify a particular
artifact at all. **The invariant is looser than the prose suggested, and it has already been formally
narrowed once for exactly this reason** (PA-6, closed before S10). Fabricating a ref or widening the
invariant is a false dilemma; neither branch is required.

**The reasons that DO hold are about blast radius, not semantics, and they were sitting unused in this
same document:** a refusal event would require widening **two** CHECK constraints, not one —
`event_type` (already 21 values) **and** `artifact_kind` (already 5; the orientation triple needed no
`artifact_kind` change at all, which is why it was cheap by comparison). Widening `event_type` on this
specific table is a **named live-incident class in this project** — the Stoa Q5c/Q13a activation found
a migration whose target constraint had gone stale against an unrelated later widening, and applying it
as written would have silently dropped values already in production use (§13 already carries this as
an inherited hazard for the new build; it argues directly against touching this constraint again).
And a refusal is by construction **not** examination-derived, so adding it to `agent_trust_events` means
re-auditing `TRUST_RECORD_ENVELOPE.attests[0]` — which already carries one named exception (the reflect
path) — inside a change whose entire purpose is correcting a served claim about what that table
contains.

**The right precedent is `agent_hold_observations`** — append-only (a `BEFORE UPDATE` trigger raising
*"append-only; UPDATE is forbidden"*), service-role-only, `retain_until`-swept: a table for recording
something the trust core must observe and must not fold.

**Its SHAPE is the precedent; its LIFECYCLE is not, and the difference is load-bearing.** That table's
own comment states it is populated by a script rather than a route, is expected to be DROPped at the end
of its observation window, and carries data-rights wiring as a *deferred rider* on the grounds of having
no external users. **`agent_provenance_gaps` is none of those things**: a live route writes it, it is
permanent, and §6 serves it publicly. **It therefore cannot inherit the deferred data-rights posture** —
see §4.4.

**Table 1 — `agent_provenance_ledger`** (the ledger proper)

| column | notes |
|---|---|
| `signature_hash` | `sha256(signature)`, hex. **The key.** The raw signature is never stored |
| `identity_kind` | `'owner_agent_pair' \| 'credential'` |
| `owner_user_id`, `agent_id` | set on the pair branch; null otherwise |
| `credential_ref` | always set (the fallback key and the R17a handle) |
| `layer1_source` | `'server' \| 'supplied'` — **computed unconditionally** (fact 6) |
| `recorded_at` | the consult time. **Load-bearing for §8, not decoration** |
| `retain_until` | default `now() + interval '90 days'` (§7) |

Uniqueness: `signature_hash` alone, so insert-once is enforced by the database and not by application
ordering (§4.3). Insert conflicts are a benign no-op, the `agent_assessment_history.correlation_id`
precedent. RLS service-role-only.

**Table 2 — `agent_provenance_gaps`** (the F-2 refusal record)

| column | notes |
|---|---|
| `agent_id`, `owner_user_id`, `credential_ref` | the write's identity |
| `reason` | a small closed vocabulary: `no_ledger_entry \| out_of_window \| identity_mismatch` |
| `occurred_at`, `retain_until` | as above |
| `correlation_id` | idempotency, derived like `accr:<digest>`; **internal only, never served** |

**No signature, no signature hash, no artifact detail on table 2 — corrected below.**

**Two gaps independent review found in table 2, both real and both left open here for the mentor
question rather than silently patched:** first, `correlation_id` is labelled *"idempotency"* but §4.1
states a uniqueness constraint only for table 1 (`signature_hash`) — without one on table 2, a retried
write (the harness's own honest-409-on-reuse pattern makes retries the NORMAL case, not the edge case)
would duplicate the gap row **on the public record.** Second, the all-or-nothing write-level granularity
(§5.4: one gap row per write, not per artifact) means a write producing several distinct refusal reasons
at once — one artifact missing, another out-of-window, a third identity-mismatched — has no stated rule
for which `reason` wins. **Both need a decision before build**, not an implementation-time default.

### 4.2 The write path, and the gating it must NOT inherit

Placement: alongside the trajectory write (`route.ts:1802-1880`), which already has every input.
**But it must not inherit that block's gating wholesale.** Specifically:

- **Its own flag** (`SUBSTRATE_PROVENANCE_LEDGER_ENABLED`), never `isTrajectoryWriteEnabled()`.
  Coverage that is hostage to an unrelated feature flag is exactly limit 3 of the inherited option
  sketch, and it is avoidable.
- **`layer1_source` computed unconditionally** (fact 6), never inside `isTrajectoryDeltaEnabled()`.
- **Gate on a signature actually being present.** With `SUBSTRATE_LAYER2_SIGNING_ENABLED` off there is
  no signature to key on. This is self-consistent rather than a gap: without signing, the
  accreditation write's R18f gate cannot set `provenanceEnforced`, so no mint happens anyway.
- Retained exclusions, correctly: no assessment on error or Tier-1 short-circuit; no `credentialRef`
  ⇒ nothing to record (user-JWT consults, which carry no agent identity).

### 4.4 R17 data rights — an omission in this document's first draft

**Neither new table was wired into the data-rights paths when this section was first written. That is a
standing project requirement, not an optional extra**, and `/api/user/delete` enumerates the trust-core
tables explicitly rather than relying on cascade (`route.ts:130-162`, and `tables_cleared` at `:266`).

Both tables are owner-scoped and therefore **must** ship covered by:

- `/api/user/delete` (R17c) — genuine deletion by owner, and named in `tables_cleared`
- `/api/user/export` (R17i) — owner-scoped export
- `/api/credential/erase` — the external-consumer path, keyed on `credential_ref`

**`agent_provenance_gaps` is the sharper case:** it is served on a public payload, so an owner deletion
that left gap entries standing would keep publishing a fact about an erased subject. Its coverage is not
a rider; it is a precondition of §6 shipping.

### 4.2c A sibling consumer of the same submitted chain, not previously named

`computeLoopFoldAnnotation` (AE-2, `accreditation/[agent_id]/route.ts:857-878`) independently reads the
SAME `provenance.signed_assessments` array, re-verifies each signature, and folds verdicts into
`character` / `self_regarding` / `instrument_calibration` on the write's 200 response — it has no
extraction-provenance check and would gain none from this ledger. It is MEASURE-only and is **not** on
the public trust record, which is mitigating; but it **is** R18-published (`loop-fold/v2`) on the
accreditation-write response itself, which is not. Once enforcement is live, one write can simultaneously
refuse to mint an artifact's trust event and fold that same artifact's verdict into `character` in the
response body. That may be the right outcome, but it is a decision, not a default, and a build session
should state it rather than discover it.

### 4.3 Insert-once

Ruled, and the database enforces it: unique on `signature_hash`, conflict is a no-op. The disclosed
limit stands as ruled — a later genuine `server` consult cannot correct an earlier `supplied` entry.
Per the inherited §3.5 analysis the only reachable misattribution runs in the fail-closed direction, so
insert-once is conservative here, not merely simpler.

---

## §5 — The lookup and the refusal

At `emitAccreditationTrustEvents`, after the existing gates and before deriving events:

1. Resolve the write-side identity via `resolveLongitudinalIdentity({credentialRef, ownerUserId, agentId})`
   — the module unchanged, no second notion.
2. For each submitted signed assessment, `sha256(signature)` → ledger lookup.
3. An entry resolves **only if** its recorded identity matches the write-side identity (§3.4) **and**
   it is within the window.
4. **Record-only phase:** log the outcome, mint as today. **Enforce phase:** any unresolved artifact
   ⇒ no mint for that write, plus one `agent_provenance_gaps` row.
5. The write still returns 200 (fact 2a).

**Fail-honest, not fail-open.** A ledger read that *errors* is not a missing entry. It must be logged
and must not be silently treated as either resolution or refusal — the `isMissingTableError`
false-benign class this codebase has been bitten by twice (the S9b ack write; the C-1 sweep) is the
named hazard, and the ledger's read is exactly its shape.

---

## §6 — The coverage-gap surface (Step 2, answered)

**Decision: a sibling field modelled on C2c `orientation_readings`, not an extension of `coverage_gaps`.**

`coverage_gaps` stays as it is. It is domain-level, it lives inside the aggregate block, and it means
*"this domain's evidence was A2-zeroed."* A provenance refusal is event-level and means *"an artifact's
origin could not be verified."* Overloading one field with two unrelated semantics would make both
harder to read, and F-2's own reasoning — that the reader must be able to tell refusal from absence —
argues for a distinct surface, not a shared one.

**Shape, following the precedent one-for-one:**

```
record: {
  …,
  provenance_gaps?: TrustRecordProvenanceGapEntry[]   // capped, newest first, absent flag-off
  total_provenance_gaps_count?: number                 // "showing N of M" — the §6(b) honesty rule
}

TrustRecordProvenanceGapEntry {
  reason_text: string             // template per reason code
  not_attestable_clause: string   // the did-not-stop-practising clause, INLINE
  occurred_at: string
}
```

**Three details of the precedent a build must copy rather than approximate** — an independent review
found this document's first draft diverging from the pattern it claims to follow, which would have
produced a near-miss rather than a match:

1. **The field is `not_attestable_clause`**, not `not_attested_clause`. A build following an
   approximate name would diverge from the precedent in the one place the precedent is load-bearing.
2. **The cap is 50 and it is enforced at the STORE READ, not the serialiser** —
   `ORIENTATION_READINGS_ROW_CAP` (`trust-core-store.ts:628`), via `.limit(CAP + 1)` as a truncation
   probe then `.slice(0, CAP)`. Enforce the new cap the same way, for the same reason.
3. **The total count is OMITTED, never fabricated, when the count read fails** (`trust-core-store.ts:713`;
   payload `:191-197`). `total_provenance_gaps_count` must carry the same honest-omission branch. A
   fabricated or defaulted total on an honesty surface is the defect in miniature.

**Why inline and not once at the top:** the C2c ruling's structural reason applies unchanged — *"the
entry is the unit that will be read in isolation."* An entry that travels without its clause is an
entry that reads as an accusation.

**F-2's minimum content, mapped:** the non-mint (the entry's existence and its `reason_text`); the
reason (missing vs out-of-window, from the closed vocabulary); and the did-not-practise clause
(`not_attested_clause`, verbatim, inline). **F-2's hard exclusion** is satisfied at the schema level
(§4.1) — the serialiser has no signature to leak.

**A confirmed defect independent review found and this document had not: F-2's "never silence" fails
in exactly the case it exists for.** `GET /api/trust-record/{agent_id}` 404s when no domain carries
evidence (`handler.ts:222`, the ENV-1 evidence gate — a deliberate, previously-correct design decision
that a bare row's existence must not imply examined evidence). `provenance_gaps` lives inside the
`record` object that gate only composes on a 200. **An agent whose mints are ALL refused — precisely the
population §9's C1 targets — never accumulates evidence, its record 404s, and its gap entries render
nowhere.** The reader gets silence for the agent most affected, and the live claim promises the gap will
appear *"on this record."* This is not resolved here — it needs its own decision (relax ENV-1 for
provenance-gap-only agents, its own R18 treatment of a public 404 contract; or accept and disclose the
boundary) — and is carried to the mentor as part of Q3's framing.

**Cost and blast radius, stated as Step 2 requires it be:** this is a **change to a served public
payload**. It carries its own founder R18 sign-off, its own ADR-013 §8 dated amendment, and its own
battery pins **in one edit** — the S2-39/S2-40 and S2-43..S2-46 precedent, which exists because
`attests[1]` was found to have no content pin at all. New pins start at **S2-48**. The `does_not_attest`
list also gains its second edit at enforcement (§10), and that edit belongs in the same change.

**One consequence worth naming:** the refusal record's own 90-day retention means coverage-gap entries
age out of the public record on the same clock as the events they stand in for. That is consistent
rather than convenient — a gap entry outliving the window it describes would be its own honesty defect.

---

## §7 — The retention window, with its data basis

**Recommended: 90 days.** The basis is structural and measured, not a principled guess.

**7.1 There is no "longer window = more replay exposure" tradeoff against today.** PA-10's exposure
window is currently **unbounded** — no artifact-age signal exists anywhere in the system (§8). Every
finite window is a strict improvement on ∞. The tradeoff is only *between* candidate windows.

**7.2 Ninety matches the retention family — which is an operational convenience, not a coverage
guarantee. The first draft of this section claimed otherwise and was wrong.**

It claimed that at exactly 90 *"every artifact that can still contribute to a live trust record has a
live ledger entry — coverage and consequence are the same population."* **That is false, and the
migration says so three lines from the default it cites:** `agent_trust_state` is a MATERIALISED fold
and *"persists independently of this window — the fold is not replayed from expired events"*
(`supabase-agent-trust-core-migration.sql:168-169`). An event minted from a 400-day-old artifact swept
its event row long ago; its contribution to the state row is permanent. **Artifacts far outside any
window remain reflected in live state.** The claim also contradicted §7.4 of this same document, which
correctly says a shorter window produces *more* gap entries, not more unverified influence — under
refuse-on-missing an unverifiable artifact does not affect the record, it is refused.

**What is true, and it is a good enough reason:** the three sibling tables all carry 90-day windows, so
the ledger inherits one sweep, one schedule, one retention story and one PR24 account. **That is
operational consistency, and the window is selected by §7.3, not by this.** The ledger bounds what can
be NEWLY MINTED; it does not bound what has already been folded — §11 already says so and §7 must not
imply otherwise.

**7.3 The measured write pattern has three orders of magnitude of headroom — stated at the strength the
evidence actually supports.** The only production accreditation-write pattern on record is the
harness's: `close-hook.mjs` writes at `Stop`, reading `readProvenance(cfg, sessionId)` from a
session-id-keyed state file, so submitted artifacts are hours old. (The "ten of twelve agents wrote
inside 90 days" figure is deliberately NOT cited here: it is evidence about write RECENCY, not artifact
AGE, and as corroboration it would be doing work it cannot do.)

**It does NOT accumulate across sessions in the observed configuration — but that is a filename
convention, not a structural guarantee, and an independent review was right to refuse the stronger
phrasing this section first carried.** Two paths could break it, and a build must know them: the
session id falls back to the literal `"no-session"` when an event carries none
(`close-hook.mjs:376`; `session-state.mjs:30`), so every such session appends to **one shared**
`no-session.provenance.jsonl`; and **there is no cleanup path anywhere in `harness/`** — no unlink of a
provenance file — so a long-lived or resumed session id accumulates indefinitely. Neither is reachable
for ordinary UUID-bearing sessions, and neither overturns the 90-day conclusion, which rests at least
as heavily on §7.1 and §7.2. **They are named because §7.3 is one of two supports for the window and a
support stated more strongly than its evidence is the defect class this whole arc exists to correct.**

**7.4 F-3(iii)'s framing, carried explicitly.** With F-2 live, the window is *"also a decision about how
frequently the public record will carry coverage gap entries."* At 90 days, against a session-scoped
write pattern, the expected steady-state frequency of *out-of-window* gap entries is **approximately
zero** — the gap entries that do appear would be `no_ledger_entry` (pre-ledger artifacts) and
`identity_mismatch` (§3), both of which are transitional and both of which §9's threshold is designed
to drain before enforcement begins. **A 30-day window would buy a marginal PA-10 improvement at the
cost of making the public record carry gap entries for a class of writes that is legitimate.** That
trade is the wrong way round.

**7.5 What would move this.** One number: a materially non-session-scoped write population. §12.2 gives
the query. If it comes back showing writes routinely carrying artifacts older than 30 days, 90 is
confirmed *a fortiori*; if it shows a real population beyond 90, the window is not the answer — the
refusal-vs-history question is, and that is §11's territory.

**PR24 binds:** `retain_until` is declared, so purge and sweep ship in the same session.
**Recommended: extend the existing `/api/cron/trajectory-retention-sweep` handler to purge both new
tables** rather than adding crons — the `observability-retention-sweep` two-table precedent (fact 12),
same 90-day family, same schedule. Its C-1 lesson applies directly and must be inherited: **the purge's
`.select()` must name each table's real primary key**, and the test double must validate it, or a purge
that can never delete anything passes a green battery.

---

## §8 — The PA-10 dependency (F-3 i), named as a dependency

**PA-10** (disclosed on the live envelope): a genuinely-earned signed assessment re-submitted in later
writes sustains a domain at — never above — its once-demonstrated proximity, defeating decay and latch
freshness. **Declared closure path:** recency-tier confidence weighting at the S2 fold wiring
(mentor A5's Recency tier), scheduled, not built.

**The assessment F-3 asked for: how much does the ledger change the case for that work?**

**It strengthens it, and it does so by removing the obstacle that has kept it un-buildable.** The
reason A5's recency tier has never been wired is not scheduling — it is that **there is no artifact age
to weight by.** The signed envelope carries no timestamp; AE-2 had to take ADR-014 §6's refuse branch
explicitly for this reason and disclose that *"replayed evidence is not age-detectable."* A ledger that
stores `recorded_at` per signature **is the missing input.**

So the coupling has two parts and they run in opposite directions:

1. **Incidental narrowing.** Refuse-on-missing blocks replay of any artifact older than the window —
   PA-10's exposure goes from unbounded to 90 days. Real, and it reduces the *urgency* of the recency
   work.
2. **Enablement.** For artifacts *inside* the window, the ledger supplies per-artifact age for the
   first time. The recency tier becomes computable. This raises the *tractability* and the *value* of
   the scheduled work.

**Recommendation (a recommendation, not a decision): do not treat the ledger as a substitute for the
recency-tier closure, and do not de-schedule it.** Sequence it after the ledger and record `recorded_at`
deliberately for it. The dependency runs ledger → recency-tier, and it is now named rather than
discovered mid-build, which is what F-3 asked for.

---

## §9 — The record-only → enforce switch-on threshold (hard requirement)

Addendum 2 requires this be *"defined before the ledger ships, not discovered operationally."* It is
stated here as a concrete checkable condition. **It decides nothing — the switch-on remains a
founder-walked 0c-ii step, and this is the condition that step checks.**

**Enforcement may be switched on when all four hold:**

**C1 — Identity coherence.** For every agent with an accreditation write in the trailing 90 days, every
credential that produces its assessments resolves to the **same** longitudinal identity as the
credential that submits them (§3.4). **This is the condition the identity finding produces, and the
s9-loop harness fails it today** (§3.1). Checkable by SQL over `api_keys` alone — it needs no ledger
data. **One correction: §12.1's query is scoped to `agent_id = 'sagereasoning:s9-loop@v1'` alone; C1 is
a population-wide condition and needs its own query** — group `api_keys` by `agent_id`, compare
`(owner_user_id, agent_id)` resolution across consult-capable vs write-class capabilities for every
agent with a write in the trailing 90 days. §12.1 answers the harness case specifically; C1's own
evaluation query is not yet written and is owed before switch-on, not before this scoping closes.

**C2 — Coverage.** Every agent with an accreditation write in the trailing 30 days has **100%** of that
write's submitted artifacts resolving in the ledger, observed across at least **two consecutive weeks**
of record-only operation.

*Why 100% and not a percentage.* Addendum 2 offered *"what coverage percentage, or what population of
active credentials with confirmed ledger entries."* A percentage is the wrong instrument here: the
population is roughly ten agents, so any percentage below 100 is one agent, and a threshold that
tolerates one agent's artifacts failing is a threshold that tolerates shipping enforcement into a known
silent refusal. The population is small enough to require completeness, and completeness is what makes
the refusals that follow **honest** refusals rather than blanket ones — which is exactly the standard
addendum 2 set (*"honest refusals rather than blanket refusals of legitimate server-extracted
artifacts"*).

**C3 — Corrected by independent review; the original justification was invalid.** It read *"at least
90 days of record-only operation, so that no legitimate artifact predates the ledger's own existence."*
**That inference does not hold.** Ninety days of ledger *operation* entails that no newly-created
artifact predates the ledger. It entails nothing about *submitted* artifacts — a client keeps its own
signed chain and may legitimately resubmit an artifact of any age, which is exactly PA-10 (§8),
disclosed on this very payload. §8 says artifacts do not drain by aging; the original C3 assumed they
do. Both cannot be right, and §8 is the one this document stands behind.

**C3 as corrected: a minimum 90-day SOAK period, not a drain guarantee.** It ensures the ledger has had
time to observe ordinary traffic before enforcement is considered — a good reason on its own — but it
does **not** by itself make C2 reachable, because C2's population is not bounded by ledger age. See the
termination problem below.

**C4 — The surface is live.** §6's `provenance_gaps` field is deployed, pinned, and R18-signed **before**
the first refusal can fire. F-2 is not satisfied by a refusal that has nowhere to surface.

**A termination problem an independent review found, and it is real: as stated, C1/C2 may never clear.**

Two concrete scenarios. **(i) The immortal chain** — an agent whose accreditation chain carries one
pre-ledger signed assessment and resubmits the accumulated chain on each write never reaches 100%
resolution under C2, permanently: the artifact is real and legitimate, insert-once means no backfill,
and absence is indistinguishable from missing. **(ii) The open-population problem, which is the more
serious of the two** — C1's identity-coherence rule (§3.4) is a universal over *every* agent with a
write in the trailing 90 days, evaluated on an **open, growing** population. Every future onboarding
re-tests it. §3.3 shows the fix is cheap for the founder's own harness (mint an owner-bound consult
credential) but costly for an **external consumer** — the population the owner-less `external_consumer`
shape exists for in the first place — because binding an owner removes that credential from the
`POST /api/credential/erase` path (§3.3). §3.4 generalises the rule to every agent; nothing bounds the
population it is evaluated against. A threshold that gets *harder* to satisfy as the system grows is
the wrong shape for a phase addendum 2 requires to terminate — "accept and disclose" is ruled
unavailable, and a threshold that can silently never clear converts that ruled-out posture into the
default one by omission.

**Two changes close this, and a build session should adopt at least one:**

1. **Freeze the cohort.** Evaluate C1/C2 once, over the agents active at threshold-evaluation time. New
   agents onboard *into* enforcement rather than blocking it — growth stops being a veto.
2. **A named exception register, or a hard review date.** Either an agent may be excluded from C2 by a
   recorded founder decision naming the agent, the unresolvable artifact class, and the reason — making
   the exclusion itself a disclosed limit rather than an invisible stall — or a fixed date by which, if
   C1–C4 have not cleared, the non-clearance is escalated as its own decision rather than left to
   persist as the status quo.

**This is put to the mentor** (the companion mentor-question document) rather than settled here, because
it is a genuine design fork with a founder-facing cost on one side (data rights) and a governance cost
on the other (an unbounded phase).

**Ordering note:** C3 (≥90 days) dominates C2's two weeks, so the binding path is C1 → C4 → C3, with C2
observed along the way. **C1 is the only one that requires action rather than waiting**, which is why
§3.3's credential step should be scheduled early rather than at the switch-on.

---

## §10 — The live attestation's wording (Step 2c / addendum 2 Q4)

> **REVERSED BY INDEPENDENT REVIEW. This section first concluded "confirmed, no amendment." That was
> wrong, and it was wrong in the specific way this whole arc exists to correct — it reached a
> no-work conclusion about a served public claim without engaging the two mentor passages that bear on
> it most directly, neither of which it quoted.**

**Corrected conclusion: the wording does NOT carry the phased distinction, and it should be amended —
in the same edit as §6's served-field change (slice 3).**

The live clause (`trust-record-payload.ts`, `does_not_attest`):

> *"This disclaimer list will be updated when a structural fix is in place; that fix will surface any
> artifact whose origin it cannot verify as a named coverage gap on this record, never as silence — an
> absent event will say why it is absent, and that it does not mean the agent did not practise."*

**Why the first reading failed.** It held that the relative clause *"that fix will surface…"* restricts
the trigger, so the update fires at enforcement. It does not. The trigger is the clause before the
semicolon — *when a structural fix is in place*. What follows describes what the fix will do; a
descriptive relative clause does not carry conditional force. The first draft conceded that an ordinary
reader could parse the trigger in isolation, and then claimed the whole-sentence parse defeats that.
The whole-sentence parse is where the problem is.

**And the mentor already ruled against the premise, in the addendum this section is discharging:**

> *"If the ledger ships in accumulation-only mode first, **the structural fix is partially in place** —
> the ledger exists and is recording, but enforcement has not begun."* (addendum 2, Q4)

> *"The public claim — **which now accurately says the structural fix is in place** but coverage is
> bounded — remains accurate at every instant."* (addendum 2, Q3, describing the accumulation phase)

The first draft asserted the opposite — that during record-only *"the fix the sentence describes is not
yet the fix that is in place"* — a **stronger** claim than the mentor's own "partially in place,"
resolving a real tension between those two passages silently, in the direction requiring no work, while
quoting neither. That is a motivated reading and it is named as one here rather than smoothed away.

**§9 makes it concrete rather than theoretical.** C4 requires the `provenance_gaps` field live and
R18-signed **before** the first refusal can fire — slice 3, ahead of slice 5. So there is an interval,
potentially months, in which the served record **displays** `provenance_gaps` and
`total_provenance_gaps_count` while `does_not_attest` still describes that machinery in the future
tense as something a not-yet-in-place fix *will* do. **The record would simultaneously display the
mechanism and disclaim that it exists.** That is a sharper reader-facing contradiction than the one the
first draft dismissed, and the first draft did not see it because it reasoned as though only two states
exist (recording invisibly; enforcing) when §9 creates a third.

**The "third edit" objection does not hold either.** Q4's *"stands as written"* answers whether the
second correction's **timing** moves, and the same passage then assigns this session the task —
*"confirm that the commitment's wording covers this distinction, **or amend it if it does not**."* An
amendment is licensed by the exact ruling the first draft cited against it. The weight behind *"a third
edit is not available"* comes from Q1, where it referred to an edit that **retracts** the commitment —
*"one that moves backward rather than forward."* A clarifying amendment moves forward. The first draft
imported the prohibition without its qualifier.

**Recommended amendment (founder R18 sign-off governs the final wording; this decides nothing):**
replace *"This disclaimer list will be updated when a structural fix is in place"* with wording that
names **enforcement** rather than existence as the trigger — e.g. *"…will be updated when that
verification begins to gate which events are minted."* Carried in slice 3 alongside the
`provenance_gaps` field, its ADR-013 §8 amendment and its pins, it costs one sign-off already being
sought rather than a standalone edit.

**Slice ambiguity, fixed:** §6 and §13 read differently on which slice carries edit two. **Edit two —
the disclaimer's substantive update to describe the fix's actual coverage — fires at ENFORCEMENT
(slice 5).** The amendment recommended above is a distinct, earlier, trigger-clarifying edit that rides
slice 3. Two edits, two slices, stated here so a build session does not conflate them.

## §11 — What this fix does NOT cover

Stated plainly, because the corrected public claim will rest on it.

1. **The 454 unmarked historical consults.** They predate the `layer1_source` stamp and are *genuinely
   unknown*, not inferred clean. **No ledger repairs them**, and the attestation stays inaccurate for
   any events already minted from them. The mentor named this explicitly and it is not softened here.
2. **Every artifact signed before the ledger exists.** The ledger starts empty. Under §9's C3 this
   population drains rather than being refused, but it is never verified.
3. **Artifacts outside the retention window.** Refused, and visibly so (§6).
4. **The plugin path (`sr_inst_`) — named here because the first draft never mentioned it.** Supplied
   extraction is MANDATORY on that path (`route.ts:564`); every plugin-produced artifact is `supplied`
   by construction. Its disposition is inseparable from Q2 (§ companion mentor-question document) and
   is not resolved here.
5. **Arm-B.** A dishonest or co-trained extractor is untouched by provenance-of-origin. That is route
   (i)'s territory and it is separately scoped by ruling.
6. **The emission-hooks asymmetry as a class.** The ledger closes it for covered artifacts at the
   accreditation mint. It does not make the sibling guards uniform.
7. **User-JWT consults.** They write no trajectory row and would write no ledger entry (§4.2). They
   carry no agent identity, so they produce no accreditation evidence — but this is a coverage boundary
   and it should be stated rather than assumed away.
8. **`/api/guardrail`.** Out of scope and structurally supply-proof. Nothing here reaches the surface
   that acts.

---

## §12 — Founder prerequisites

**12.1 — Required, and it gates §3.** The s9-loop **consult** credential's `owner_user_id` and
`owner_kind`. The repo asserts owner-less in two places including the identity module's own docstring,
but that is a record claim, not a verification, and §3's whole finding turns on it.

```sql
select id, label, owner_kind, owner_user_id is null as owner_less, agent_id, capabilities, is_active
from api_keys
where agent_id = 'sagereasoning:s9-loop@v1';
```

**12.2 — Confirmatory, and it firms §7.** The age distribution of submitted artifacts cannot be measured
directly today (nothing persists a signature — that is the defect). The available proxy is the gap
between an accreditation write and the consult activity on the same identity:

```sql
select a.agent_id,
       max(e.occurred_at)                    as latest_write,
       max(h.created_at)                     as latest_consult,
       max(e.occurred_at) - max(h.created_at) as write_lag
from agent_trust_events e
join agent_assessment_history h on h.agent_id = e.agent_id
join agent_accreditation a on a.agent_id = e.agent_id
where e.event_type = 'credential-completed'
group by a.agent_id
order by write_lag desc;
```

A lag in hours confirms §7.3. A lag in months would move the window question into §11's territory.

**12.3 — Already discharged 2026-08-25, re-checked here, not re-run.** All four flags founder-verified
live; `active_with_l1_supply = 0`; 3,200 consults / 0 supplied / 454 unmarked; 12 agents, 10 in 90 days.

---

## §13 — Build shape

**Tier `code-critical`.** Two new tables, a trust-core write path, the accreditation write boundary's
mint decision, and a served public payload change.

**PR19 engages hard, and the budget should say so.** Three named surfaces at once — trust-core, an
auth-adjacent write boundary, and a public attestation surface. **Budget a full independent review**,
and expect the load-bearing dimensions to be: identity-matching correctness (§3), fail-honest vs
fail-open on the ledger read (§5), the F-2 hard exclusion holding at the schema and the serialiser, and
flag-off byte-identity on the served payload.

**Suggested slicing, each its own founder-walked 0c-ii:**

| Slice | Content | Tier |
|---|---|---|
| 1 | Both migrations, TEST → production, inert | `code-critical` (schema) |
| 2 | The consult-side write + its flag, record-only; PR24 sweep wiring in the same session | `code-critical` |
| 3 | The `provenance_gaps` served field + R18 sign-off + ADR-013 §8 amendment + pins from S2-48, in one edit | `code-critical` |
| 4 | The identity-coherence credential step (§3.3), founder-walked | credential |
| 5 | Switch-on, gated on §9's C1–C4, with edit two of the public claim in the same step | `code-critical` |

**Inherited lessons that must not be rediscovered:** re-derive any CHECK constraint's *current*
definition via `pg_get_constraintdef` rather than trusting a migration file's comments (the Stoa
Q5c/Q13a staleness); a fake PostgREST test client that ignores its `select()` argument cannot catch a
wrong primary-key column (the C-1 sweep defect); and a `retain_until` declared without its purge and
sweep in the same session is a PR24 violation.

**Rollback:** flags unset ⇒ byte-identical; both tables additive and droppable; the served-field edit
and the public-claim edit independently `git revert`-able.

---

## §14 — Recommendation *(permitted; this elects nothing)*

**Option (a) is still buildable within its ruled limits, and this scoping did not find a limit that
makes it unacceptable — but two items in this recommendation's first draft are now known to be wrong or
blocked, and are corrected here rather than left standing.**

**Option (b) and the hybrid stay where the ruling left them — available, unneeded.** Said plainly as the
prompt requires: **(a) does not fail.**

The recommended shape, corrected: two tables; the ledger's own flag; provenance computed
unconditionally; the identity module used **unchanged** — but **not** with the credential configuration
"moved to satisfy it" as first stated: §1.4 of the companion mentor question found all three available
exits blocked (merging credentials trades away a documented security posture; relaxing the ledger's
match reopens the guard F-1 protects; accepting permanent refusal for split-pair agents may make the
switch-on threshold unmeetable). **This is now Q1, unresolved, and the recommendation does not
presuppose an answer.** A C2c-shaped `provenance_gaps` surface rather than `coverage_gaps` — **stated
here as a departure from binding text, put to the mentor as Q3, not as a settled design call.** A
90-day window, on the corrected §7 basis (the retention-family alignment is convenience, not coverage;
the session-scoped write pattern is the real argument). Sweep folded into the existing trajectory cron.
The recency-tier work sequenced after the ledger rather than displaced by it — unchanged, this held up.
**The live attestation should be AMENDED, not left as written** — §10's reversal, carried through here
rather than contradicted.

---

## §15 — Is a mentor question owed? — SUPERSEDED; the founder escalated, and a review found the
first answer wrong on two of three counts

**This section originally concluded "no."** The founder elected to escalate anyway. An independent
review, run afterward at the founder's direction, found the "no" wrong on two of the three questions it
should have raised — not merely conservative, wrong. Recorded rather than quietly replaced, because the
failure mode is instructive: a session can conclude "nothing further is owed" from genuine reasoning
that turns out to rest on an incomplete search.

**Where the original reasoning held.** The identity finding (§3) — that F-1's stated purpose is not
achieved by F-1's stated fix — was correctly judged NOT to need a mentor ruling on its own terms: F-1's
principle and unit are untouched, the resolution relaxes no ruled constraint, and it lands as a named
condition on a threshold addendum 2 already assigned to this session. **That reasoning still holds.**
What changed is that the identity finding, once the uniqueness-index conflict was found (§1.2 of the
companion mentor-question document), turned out to make **the threshold condition itself unmeetable
today** — which is a different, and genuinely owed, question. Not escalated because the surface shape
was wrong; escalated because the underlying configuration cannot satisfy it by any means this project
has not already forbidden elsewhere.

**Where the original reasoning failed, and how.**

**On the coverage-gap surface:** the section applied no real test and got the wrong verdict by applying
none. It called §6 an "answer" while §6 itself opens by naming a **departure** from binding text — F-2
ruled, twice, verbatim: *"a refused mint must surface… using the existing machinery"* and *"the existing
`coverage_gaps` field is the right surface."* §6 declines that field for a sibling one. The technical
case for declining is likely sound (`coverage_gaps` cannot structurally carry F-2's own minimum
content), but a sound technical case for departing from binding text is exactly the situation a mentor
question exists for — and by the very test this section applied to the identity finding ("does the
ruled principle survive untouched?"), F-2 fails that test **harder** than F-1 does: F-1's principle
survived; F-2's named mechanism did not. §1's ruled-items table had also silently dropped the
`coverage_gaps` clause from its own restatement of F-2, which is exactly the kind of drift a governance
document exists to prevent and instead reproduced. Both are corrected in place (§1, §6) and carried to
the mentor as Q3.

**On the ledger's disposition of a `supplied` result, the section never considered it at all.** Not
wrongly answered — absent. §4/§5 as drafted specify three refusal reasons (missing, out-of-window,
identity-mismatch) and never state what happens when the lookup **succeeds** and reads `supplied` —
which is the population the entire urgent item is about. The sibling function this very document cites
as its structural precedent already answers it (`emitOrientationReadingTrustEvent`'s
`if (input.layer1Source !== 'server') return`), and the scope quoted that function without noticing it
resolved the question the scope had left open. This is not a refinement; left unaddressed it reproduces
exactly the "corrected-sounding claim with a silent carve-out" the ruling rejected, for a real and
currently-active population (the mandatory-supplied plugin path). **Carried to the mentor as Q2**, and
it is very likely the strongest of the three.

**What this means for the method, stated plainly rather than absorbed silently:** a scoping session's own
conclusion that "nothing further is owed" is not more reliable than any other claim in the document and
should not have been exempted from the adversarial pass the rest of the document received. It was not,
in the first draft. It is now — both by having been checked, and by being visibly wrong here where it
was checked and found wanting.

---

## Cross-references

- `2026-08-25-mentor-ruling-extraction-provenance-fix-choice-verbatim.md` — binding, with both addenda
- `2026-08-25-extraction-provenance-and-independent-extractor-SCOPE.md` — inherited mechanism facts
- `2026-08-25-extraction-provenance-honesty-correction-SIGNOFF-PACKAGE.md` — edit one, live
- `operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md` — the ⚠ URGENT registration, item 2
- `website/src/lib/substrate/longitudinal-identity.ts` — the identity module, used unchanged
- `website/src/lib/substrate/trust-core/trust-record-payload.ts` — the served payload and the envelope
