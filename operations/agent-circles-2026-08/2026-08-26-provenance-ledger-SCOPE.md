# Scope — the signature-keyed provenance ledger (ruled option (a))

**Session:** 2026-08-26, founder stream, `governance` — **documents only.** No code, migration, flag,
credential, or public surface was touched. **AC7 not engaged. This document licenses nothing.**

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
| Refusal visibility | **Every refused mint is a named coverage gap, never silence**; no signature or artifact detail | §6 |

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
| 6 | ⚠ **`layer1Source` is computed only inside `isTrajectoryDeltaEnabled()`.** The ledger must compute provenance **unconditionally** from `preExtractedLayer1Schema !== undefined`, or it inherits the existing stamp's blind window (fact J of the inherited scope) | `route.ts:1867-1873` |
| 7 | `emitOrientationReadingTrustEvent` is the closest structural precedent for a provenance-aware per-consult side-write: same identity inputs, `sharedCredCtx` reuse, never throws, MEASURE | `emission-hooks.ts:441-470` |
| 8 | `emitLedgerOnlyTrustEvents` exists: **INSERT-ONLY, never folds state, never touches a reflect timestamp** | `trust-core-store.ts:300` |
| 9 | **`agent_trust_events.artifact_ref` is `NOT NULL CHECK (length > 0)`** and the column comment states the invariant: *"no trust event without a verifiable artifact"* | `supabase-agent-trust-core-migration.sql:137-143` |
| 10 | `TrustEventType` currently enumerates **21** values; `ArtifactKind` **5** | `types.ts:55-137` |
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
`orientation-reading-*` triple. **It should not be used, for one decisive reason:**
`agent_trust_events.artifact_ref` is `NOT NULL`, and the column's own comment states the invariant as
*"no trust event without a verifiable artifact"* (fact 9). **A refusal record is by definition the case
where no verifiable artifact exists — that is why it was refused.** Putting it in that table means
either fabricating an `artifact_ref` or widening the invariant that `TRUST_RECORD_ENVELOPE.attests[0]`
publicly rests on. Neither is acceptable in a change whose whole purpose is to make an attestation
accurate.

**The right precedent is `agent_hold_observations`** — an insert-only, append-only, service-role-only,
`retain_until`-swept table built for exactly this: recording something the trust core must observe and
must not fold.

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

**No signature, no signature hash, no artifact detail on table 2** — F-2's hard exclusion applied at
the schema level rather than at the serialiser, so a future serving change cannot leak it.

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
  reason_text: string          // template per reason code
  not_attested_clause: string  // the did-not-stop-practising clause, INLINE
  occurred_at: string
}
```

**Why inline and not once at the top:** the C2c ruling's structural reason applies unchanged — *"the
entry is the unit that will be read in isolation."* An entry that travels without its clause is an
entry that reads as an accusation.

**F-2's minimum content, mapped:** the non-mint (the entry's existence and its `reason_text`); the
reason (missing vs out-of-window, from the closed vocabulary); and the did-not-practise clause
(`not_attested_clause`, verbatim, inline). **F-2's hard exclusion** is satisfied at the schema level
(§4.1) — the serialiser has no signature to leak.

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

**7.2 Ninety is where the family's own boundary already is, and that alignment is load-bearing, not
cosmetic.** `agent_trust_events`, `agent_trust_state`, and `agent_assessment_history` all retain 90 days
(fact 11). At exactly 90, **every artifact that can still contribute to a live trust record has a live
ledger entry** — coverage and consequence are the same population. A shorter window creates a band of
artifacts that can still affect the record but cannot be verified; a longer one keeps entries for
artifacts whose events have already swept.

**7.3 The measured write pattern has three orders of magnitude of headroom.** The only production
accreditation-write pattern on record is the harness's, and it is **session-scoped by construction**:
`close-hook.mjs` writes at `Stop`, reading `readProvenance(cfg, sessionId)` — a session-id-keyed state
file that cannot accumulate across sessions (fact 13). Submitted artifacts are hours old. Ten of the
twelve accreditation agents wrote inside 90 days.

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
data.

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

**C3 — Drain.** The pre-ledger artifact population has aged past the window: at least 90 days of
record-only operation, so that no legitimate artifact predates the ledger's own existence.

**C4 — The surface is live.** §6's `provenance_gaps` field is deployed, pinned, and R18-signed **before**
the first refusal can fire. F-2 is not satisfied by a refusal that has nowhere to surface.

**Ordering note:** C3 (≥90 days) dominates C2's two weeks, so the binding path is C1 → C4 → C3, with C2
observed along the way. **C1 is the only one that requires action rather than waiting**, which is why
§3.3's credential step should be scheduled early rather than at the switch-on.

---

## §10 — The live attestation's wording (Step 2c / addendum 2 Q4)

**Confirmed: the wording covers the phased distinction. No amendment is recommended.**

The live clause (`trust-record-payload.ts`, `does_not_attest`, edit one, 2026-08-25):

> *"This disclaimer list will be updated when a structural fix is in place; that fix will surface any
> artifact whose origin it cannot verify as a named coverage gap on this record, never as silence — an
> absent event will say why it is absent, and that it does not mean the agent did not practise."*

**Why it holds.** The sentence binds the update to a fix **characterised by the coverage-gap
behaviour**. During record-only, the ledger exists and records, but it surfaces nothing as a named
coverage gap — so the fix the sentence describes is not yet the fix that is in place. Read whole, the
sentence already fires the second edit at **enforcement**, which is exactly the distinction addendum 2
asked be confirmed. This was not luck: the §F-2-DRAFT tense constraint put the coverage-gap behaviour
and the update commitment in the same future-tensed sentence, and that coupling is what carries the
distinction.

**The residual, stated rather than hidden.** A reader could parse *"a structural fix is in place"* in
isolation as *"the ledger exists."* The clause defeats that reading, but only on a whole-sentence
parse. **An amendment is therefore available but not recommended:** it would be a third edit to a
served public claim, requiring its own R18 sign-off, ADR amendment, and pins, to sharpen a distinction
the sentence already carries — and addendum 2 ruled the attestation *"stands as written."*

**What this session does owe forward:** the second edit's own wording, when enforcement begins, must
state the ledger's coverage honestly — window, empty start, and the identity condition of §3.4 — rather
than implying the gap is closed. That is edit two's drafting constraint, recorded here so it is not
rediscovered.

---

## §11 — What this fix does NOT cover

Stated plainly, because the corrected public claim will rest on it.

1. **The 454 unmarked historical consults.** They predate the `layer1_source` stamp and are *genuinely
   unknown*, not inferred clean. **No ledger repairs them**, and the attestation stays inaccurate for
   any events already minted from them. The mentor named this explicitly and it is not softened here.
2. **Every artifact signed before the ledger exists.** The ledger starts empty. Under §9's C3 this
   population drains rather than being refused, but it is never verified.
3. **Artifacts outside the retention window.** Refused, and visibly so (§6).
4. **Arm-B.** A dishonest or co-trained extractor is untouched by provenance-of-origin. That is route
   (i)'s territory and it is separately scoped by ruling.
5. **The emission-hooks asymmetry as a class.** The ledger closes it for covered artifacts at the
   accreditation mint. It does not make the sibling guards uniform.
6. **User-JWT consults.** They write no trajectory row and would write no ledger entry (§4.2). They
   carry no agent identity, so they produce no accreditation evidence — but this is a coverage boundary
   and it should be stated rather than assumed away.
7. **`/api/guardrail`.** Out of scope and structurally supply-proof. Nothing here reaches the surface
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

**Option (a) is buildable within its ruled limits, and this scoping did not find a limit that makes it
unacceptable.** Option (b) and the hybrid stay where the ruling left them — available, unneeded. Said
plainly as the prompt requires: **(a) does not fail.**

The recommended shape is the one above: two tables; the ledger's own flag; provenance computed
unconditionally; the identity module used unchanged with the credential configuration moved to satisfy
it; a C2c-shaped `provenance_gaps` surface rather than an overloaded `coverage_gaps`; a 90-day window
aligned to the trust-event boundary; sweep folded into the existing trajectory cron; the recency-tier
work sequenced after the ledger rather than displaced by it; and the live attestation left as written.

---

## §15 — Is a mentor question owed?

**No, and this is a considered answer rather than a default.** Step 6 permits one only if genuinely
owed and warns against manufacturing one.

The candidate the prompt anticipated — the coverage-gap surface shape — **is answered** (§6) and it did
not turn out to need anything the ruling failed to anticipate: the C2c precedent already carries F-2's
exact requirements and the mentor ruled that precedent themselves.

The stronger candidate is the **identity finding** (§3), since it shows F-1's stated purpose is not
achieved by F-1's stated fix. It is nonetheless not owed, for three reasons: F-1's **principle** and
**unit** are both untouched and remain correct; the resolution (§3.2 path C) requires **no relaxation of
any ruled constraint** and no second identity notion; and it lands where the ruling already said such
things should land — as a **named condition on the switch-on threshold**, which addendum 2 explicitly
assigned to this session. **Escalating it would ask the mentor to re-rule something that is not in
tension** — the tension is between the ruling and a credential's configuration, and configurations move.

**What the founder should be told, and is, in the close:** the finding exists, it is load-bearing, it
turns on one unverified fact (§12.1), and the founder may escalate it if they read the
credential-configuration prerequisite as a bigger imposition than this document treats it as.

---

## Cross-references

- `2026-08-25-mentor-ruling-extraction-provenance-fix-choice-verbatim.md` — binding, with both addenda
- `2026-08-25-extraction-provenance-and-independent-extractor-SCOPE.md` — inherited mechanism facts
- `2026-08-25-extraction-provenance-honesty-correction-SIGNOFF-PACKAGE.md` — edit one, live
- `operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md` — the ⚠ URGENT registration, item 2
- `website/src/lib/substrate/longitudinal-identity.ts` — the identity module, used unchanged
- `website/src/lib/substrate/trust-core/trust-record-payload.ts` — the served payload and the envelope
