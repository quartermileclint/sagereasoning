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

> **⚠ ROUND 2, 2026-08-26.** The mentor ruled on all four questions. **Q2 is fully decided and
> implemented below (§5, §4.1, §11).** **Q3 is decided in shape, with the departure now properly cased
> rather than asserted (§6) — a genuine choice offered, not presupposed.** **Q4 is half-implemented**
> (§9's C2 now resubmission-reachable per the ruling) **and half carried forward as an explicitly open
> design question** (the 404/stub-record fork, §6.5 — the mentor's own framing, not yet answered).
> **Q1 was returned by the mentor, unruled — it declined to rule on inferred options and asked for the
> actual three, restated below.** See
> `2026-08-26-mentor-ruling-provenance-ledger-q1-q4-verbatim.md` and
> `2026-08-26-MENTOR-QUESTION-round2-provenance-ledger-q1-options.md`.

> **⚠ ROUND 3, 2026-08-26. Q1 is now RULED.** Defer the harness's own accreditation by name, not a
> general policy (§3.3); option A (merge the two credentials) is available in principle as an
> unrecommended founder election; §9's C1 is defined only after the split-pair population beyond the
> harness is measured (§12.0), and the cohort-freeze machinery is retired as unneeded. **One dependency
> the ruling's own wording surfaced and did not resolve: the harness deferral is only honestly visible
> once §6.5's still-open 404 question is answered** — named explicitly in §3.3 as the strongest
> remaining candidate for a further mentor round. See
> `2026-08-26-mentor-ruling-provenance-ledger-q1-round2-verbatim.md`.

> **⚠ ROUND 4, 2026-08-26.** Both remaining cases are now made and sent, not merely named. §6.5's
> "free reuse" claim was checked against source and found wrong — the composer's null-aggregate branch
> is dead code on its sole live call path, not proven reuse — and the case for relaxing the 404 gate is
> now argued on ENV-1's own stated principle rather than asserted. See
> `2026-08-26-MENTOR-QUESTION-round4-provenance-ledger-q3-and-404.md`.

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
| Refusal visibility | **Every refused mint is a named coverage gap, never silence, "using the existing machinery" — F-2: "The existing `coverage_gaps` field is the right surface"**; no signature or artifact detail | **§6 — DEPARTED FROM, flagged, and cased per the round-2 ruling.** The first draft of this row dropped the `coverage_gaps` clause, which is the clause §6 departs from. Restored. Ruling on Q3 (2026-08-26): bring the departure back labelled, and make the case that `coverage_gaps` is inadequate rather than merely inconvenient — done in §6.2/6.3 |
| **Supplied-entry disposition (Q2, RULED 2026-08-26)** | **A ledger entry reading `supplied` REFUSES the mint** — a second refusal branch distinct from missing-entry, with its own reason surfaced separately on the record. Server entry permits. The plugin path (mandatory-supplied) is named as its own open sub-question, not blocking non-plugin shipping | §5 — implemented; §11 — named |
| **The identity conflict (Q1, RULED round 2, 2026-08-26)** | **Defer the harness's own accreditation, by name, as a single-agent decision. NOT a general policy toward every split-pair agent.** Option A (merge the harness's two credentials) is available IN PRINCIPLE as a founder security trade, explicitly NOT ruled and NOT recommended. Option B remains closed | §3 — implemented; §9 — restructured |

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

### 3.2 The three ways out — SUPERSEDED. This table's own "available path" (C, below) was later shown
blocked by the same index, and the real resolution came from the mentor across two rounds. Kept as the
honest record of how the reasoning moved, not as the current design.

| | Path (as first drafted) | Verdict at the time |
|---|---|---|
| A | Relax the guard: let a `credential`-kind consult entry be resolved by an `owner_agent_pair` lookup sharing the agent_id | Rejected then, rejected now — this is the `(null, agent_id)` join the cross-tenant guard forbids, and the mentor's round-1 ruling closed it outright: no path abandoning owner+agent-pair scoping for a bare-credential or unbounded lookup is available |
| B | Widen the ledger's matching to "identity matches **or** credential_ref matches" | Correctly rejected — the two credential refs differ; buys nothing |
| C | Mint a fresh owner+agent-bound consult credential for the harness, retiring the current one | **Called "the available path… recommended" here — WRONG, and the error survived into this document until §1.4 caught it.** `api_keys_upc_owner_agent_active_uniq` permits at most one active credential per `(owner_user_id, agent_id)` **across all purposes**; the write-class credential is already owner+agent bound on that exact pair. Minting a second owner+agent-bound credential for the same pair collides on the identical index the identity conflict itself depends on (fact confirmed on production record, §1.4). **This path is blocked, not available.** |

**What actually happened next, stated plainly because the document owes it to itself:** §1.4 (written
later in this same session, after independent review) found C blocked and re-scoped the real fork as
A′ (merge the harness's two credentials into one) / B′ (relax the match, already closed) / C′ (accept
permanent refusal — either generally, or narrowed to the harness by name). **The mentor ruled on that
later fork, not on this one.** Table 3.2 above is retained only so a reader can see where the first
error was and that it was caught in-session before reaching the mentor, not silently dropped.

### 3.3 The RULED resolution (two mentor rounds, 2026-08-26)

**Defer the harness's own accreditation, by name, as a single-agent decision. Not a general policy
toward every split-pair agent.** Mentor, round 2, verbatim: *"The ruling: defer the harness's
accreditation specifically, by name, as a single-agent decision. Do not adopt option C's general
policy."*

**Option A′ (merge the harness's two credentials into one) is available IN PRINCIPLE — the identity
requirement is satisfied cleanly, and it does not violate the owner+agent-pair scoping — but it is a
security-posture trade the mentor explicitly declined to rule and explicitly recommended against:**
*"The least-privilege split is not a preference. It is a documented response to a real incident and a
HIGH adversarial finding... Option A is available to the founder as a decision. It is not available as
a ruling from me."* **Not elected here.** If the founder takes it, the security trade must be
documented explicitly alongside the provenance rationale — its own record, not a side effect of this one.

**Consequence, named by the mentor rather than discovered later:** deferring the harness's
accreditation means **the harness's own practice is not visible on the public trust record under
enforcement.** The mentor judges this proportionate — *"the harness is not a practitioner whose
progress is being obscured; it is the project's own reference integration whose configuration creates
the identity conflict"* — on the stated premise that *"the coverage gap surfaces per F-2 — the refusal
is named, not silent."*

**⚠ That premise is not yet true, and this document is the place to say so rather than let it pass.**
Under the CURRENT unresolved state of Q4's second finding (§6.5), an agent whose every mint is refused
gets a **404**, not a coverage-gap entry — the record that would carry the gap does not exist. The
mentor's own round-1 ruling named this the more serious of Q4's two findings and left it explicitly
open. **So today, deferring the harness's accreditation would make its refusal genuinely INVISIBLE, not
merely honestly-refused-and-visible** — the exact silent-carve-out shape the whole arc exists to
prevent, arriving through the interaction of two separately-ruled, separately-correct decisions.
**Named as a dependency, not resolved here: the harness deferral's own honesty claim is contingent on
§6.5's 404/stub-record question being answered before or alongside enforcement switching on.** This is
carried forward rather than silently assumed away.

### 3.4 The general form, which now applies only after measurement — RULED, sequencing changed

The general rule the identity finding produces still holds descriptively:

> **For any agent, every credential that produces assessments must resolve to the same longitudinal
> identity as the credential that submits them — or its assessments will be refused.**

**What changed is what this rule is FOR.** The first draft made it a switch-on condition (§9's original
C1) evaluated over every agent, with a cohort-freeze or exception-register mechanism to keep the
threshold reachable. **The mentor's round-2 ruling replaces that:** *"C1's population-wide threshold is
defined AFTER the split-pair population is measured, not before... The harness is excluded from C1's
denominator by name until its configuration changes."* **The measurement — how many agents beyond the
harness use a split consult/write pair — is now a hard founder prerequisite that must run BEFORE §9's
C1 is defined, not merely before this scoping closes.** §9 is restructured accordingly.

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
| `reason` | four values, per the Q2 ruling: `no_ledger_entry \| out_of_window \| identity_mismatch \| caller_supplied_extraction` — the last is a DISTINCT fact from the first three (§5) |
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

**RULED, and it changes this section's design from what the first draft carried. Mentor ruling on Q2,
2026-08-26:** *"the ledger's enforcement logic has two branches, not one — missing entry refuses,
supplied entry refuses. Server entry permits."* The first draft's §5 only ever named `no_ledger_entry`,
`out_of_window`, and `identity_mismatch` as refusal reasons — a supplied-and-resolved entry was never
covered, which is exactly the gap two independent reviews and the mentor all converged on
(the companion mentor-question document's Q2). **Corrected below; this design point is no longer open.**

At `emitAccreditationTrustEvents`, after the existing gates and before deriving events, **per submitted
signed assessment:**

1. Resolve the write-side identity via `resolveLongitudinalIdentity({credentialRef, ownerUserId, agentId})`
   — the module unchanged, no second notion.
2. `sha256(signature)` → ledger lookup.
3. **Three outcomes, not two:**
   - **No entry, or an entry outside the window, or an entry whose recorded identity does not match
     the write-side identity (§3.4)** → refuse, reason `no_ledger_entry` / `out_of_window` /
     `identity_mismatch`. *"The instrument could not verify origin."*
   - **An entry that resolves and reads `layer1_source = 'supplied'`** → refuse, reason
     `caller_supplied_extraction` — **a distinct reason from the missing-entry class, per the ruling's
     own instruction: "one says the instrument had no data. The other says the instrument had data and
     the data disqualified the mint. They are different facts and should be named differently."**
   - **An entry that resolves and reads `layer1_source = 'server'`** → permit.
4. **Record-only phase:** log every outcome, mint as today regardless of outcome (§9). **Enforce
   phase:** any refused artifact ⇒ no mint for that write, plus one `agent_provenance_gaps` row per
   §6's revised reason vocabulary.
5. The write still returns 200 (fact 2a).

**The closed reason vocabulary is now four values, not three:** `no_ledger_entry | out_of_window |
identity_mismatch | caller_supplied_extraction`. §4.1's table 2 schema and §6's served field must both
carry this.

**The plugin path — RULED as a named open question, not settled here, not blocking non-plugin
shipping.** Supplied extraction is MANDATORY on the plugin path (`route.ts:564`; fact from §2). Under
this design, **every plugin accreditation write would refuse at mint time**, because its ledger entry
always reads `supplied`. The mentor's own words: *"That is not a misconfiguration. It is the honest
consequence of the capability's design... That question may require a separate ruling before the ledger
ships on the plugin path. It does not block the ledger shipping on the non-plugin paths."* **Carried
here as a named, unscheduled sub-question, not decided:** what is the plugin path's accreditation story
if every mint is permanently refused? Candidates for a future session, none elected: (i) the plugin path
is accepted as accreditation-incapable by design, disclosed as such; (ii) the plugin capability preset
is narrowed to exclude `accreditation_write` explicitly (it already carries none — confirm this is
already the case, not merely coincidental, before treating it as settled); (iii) a route-(i)-style
change to the plugin path's extraction obligations, which would re-open the question route (i) already
owns and must not be pre-empted here.

**Fail-honest, not fail-open.** A ledger read that *errors* is not a missing entry. It must be logged
and must not be silently treated as either resolution or refusal — the `isMissingTableError`
false-benign class this codebase has been bitten by twice (the S9b ack write; the C-1 sweep) is the
named hazard, and the ledger's read is exactly its shape.

---

## §6 — The coverage-gap surface: a departure from F-2, the case for it, and the 404 carried forward

> **RULED — Q3. The mentor's disposition of this section's first draft: correctly self-identified as a
> departure that had been mislabelled "answered," and returned with an instruction — "bring the
> alternative field back with the departure labelled explicitly. State what `coverage_gaps` cannot do
> that the alternative field can, or what the alternative field does that `coverage_gaps` cannot... If
> `coverage_gaps` can carry the refused-mint signal without modification, use it."** This section is
> rewritten to do that work rather than assert a decision.

### 6.1 This is a departure from F-2's exact wording, stated as one

F-2, verbatim, twice: *"A refused mint must surface on the public record as a named coverage gap using
the existing machinery, not as silence... The existing `coverage_gaps` field is the right surface."*

**The recommendation below does not use that field.** It is a departure from a binding ruling's stated
mechanism, made because the mechanism cannot carry the ruling's own stated minimum content — not because
a different mechanism is more convenient. The case for that follows; the founder and mentor decide
whether it is sufficient.

### 6.2 Can `coverage_gaps` carry the signal without modification? No — and this is the first, weaker
branch of the case, disposed of first because it is the branch the ruling names as decisive if available

`coverage_gaps: VirtueTrustDomain[]` (`trust-record-payload.ts:131`) is literally an array of virtue-
domain name strings — `'dikaiosyne'`, `'sophrosyne'`, and so on — with no companion structure at all.

**Unmodified reuse is possible in exactly one degraded form, and it is worse than useless.** For a
`caller_supplied_extraction` refusal, the refused artifact's own extraction is IN HAND (that is what
made it resolvable as `supplied` rather than `missing` — §5's second branch), so its
`virtue_domains_engaged` could be pushed into `coverage_gaps` unmodified, today, with zero schema
change. **This is not recommended, and stating why is the strongest single argument in this section:**
it would make a **provenance refusal indistinguishable from an A2-zeroed domain** — the exact confusion
F-2 exists to prevent, restated in the ruling's own words: *"Honest refusal and absence look identical
to the reader the public record is written for. That is a fidelity failure, not a cosmetic one."*
Unmodified reuse doesn't merely fail to carry F-2's minimum content (no reason, no timestamp, no
clause) — it actively **launders** a provenance refusal into a domain-coverage signal the reader has no
way to distinguish from the pre-existing A2 semantic. **Unmodified reuse is available and is rejected on
the merits, not skipped.**

For a `no_ledger_entry` / `out_of_window` / `identity_mismatch` refusal there is no even-degraded form:
these have no resolved extraction to draw a domain name from, so unmodified `coverage_gaps` cannot
represent them at all — an empty entry, or an entry with no available content, which is functionally
silence.

**Verdict on the first branch: `coverage_gaps` cannot carry the signal without modification, and its one
available unmodified form should be rejected even where technically possible.**

### 6.3 Could `coverage_gaps` carry the signal WITH modification — widening its element type? This is
the real fork, and the first draft never considered it

The mentor's instruction implies more than literal reuse: *"if `coverage_gaps` can carry the… signal…
use it"* leaves modification on the table. A serious case requires weighing this, not dismissing it.

**The modification would be:** widen `coverage_gaps`'s element type from a bare `VirtueTrustDomain`
string to a discriminated union — e.g. `{kind:'domain_evidence', domain} | {kind:'provenance_refused',
reason, occurred_at, not_attestable_clause}` — keeping the field's name, its place inside the aggregate
block, and its stated commitment ("sparse evidence… named, never papered over") while widening what an
element can say.

**Arguments for it:** it is literally the field F-2 named; it avoids new parallel plumbing (a second
served array, a second cap, a second count); and it makes the *concept* — "this record names its own
gaps" — visibly singular rather than split across two fields a reader must learn are related.

**Arguments against it, and this is the actual case for the sibling field:**

1. **It is a breaking change to a documented, currently plain-shaped public field, and this project has
   a standing, repeatedly-applied answer for exactly this situation: never retrofit, always add.** Every
   prior addition of a new kind of signal to this same payload — the C2c `orientation_readings` list,
   the AE-1 `meta.trajectory.delta` block, the AE-2 `loop_fold` annotation — shipped as a **new optional
   field**, never as a widened type on an existing one, even in cases where an adjacent overload was
   arguably available. That is not incidental convenience; it is the pattern this codebase uses
   precisely because a currently-simple field's shape is itself a contract external readers hold, and
   `coverage_gaps: VirtueTrustDomain[]` is published on all three R18 surfaces as exactly that shape
   today. Widening it silently changes what an existing integration parsing `coverage_gaps[0]` as a
   bare string receives.
2. **The two kinds of gap are not the same kind of fact, and folding them into one field's element type
   would make every reader re-derive that distinction from a discriminant tag instead of from field
   identity.** A2-zeroed-domain coverage is a property of the AGGREGATE's evidence composition across
   the agent's history. A provenance refusal is a property of ONE ACCREDITATION WRITE at one moment. The
   aggregate block's own confidence-weighting language (`CONFIDENCE_BASIS`) is written in terms of
   folded, weighted evidence — a provenance-refusal entry inside it would sit awkwardly beside a field
   whose neighbours are all continuous, weighted quantities.
3. **This is genuinely NOT the "coverage_gaps is inadequate, not merely inconvenient" case falsely — it
   is that case, honestly:** §6.2 already showed unmodified reuse actively launders the signal into the
   wrong meaning. A widened type avoids the laundering but pays for it by breaking a public field's
   documented shape, which is the exact class of harm (an undisclosed change to a served public
   contract) this entire arc exists to correct. **The sibling field pays neither cost**: additive,
   backward-compatible, and it does not launder — which is why it is recommended, not because it is more
   convenient to build.

**Recommendation, offered as a case rather than a decision:** a new field, following the C2c
`orientation_readings` pattern exactly (§6.4), is the sound resolution of the departure — because
unmodified reuse launders the signal (§6.2) and modified reuse breaks a documented public contract in
the same way this arc exists to fix (§6.3). **If the mentor judges the breaking-change cost acceptable
given F-2's mechanism preference, `coverage_gaps` should be widened instead** — the choice is now made
on stated, comparable grounds rather than asserted.

### 6.4 The recommended shape, if a sibling field is elected

```
record: {
  …,
  provenance_gaps?: TrustRecordProvenanceGapEntry[]   // capped, newest first, absent flag-off
  total_provenance_gaps_count?: number                 // "showing N of M" — the honesty rule
}

TrustRecordProvenanceGapEntry {
  reason: 'no_ledger_entry' | 'out_of_window' | 'identity_mismatch' | 'caller_supplied_extraction'
  reason_text: string             // template per reason code — DISTINCT text for caller_supplied_extraction
                                   // per the Q2 ruling ("the instrument had data and the data
                                   // disqualified the mint" vs "the instrument had no data")
  not_attestable_clause: string   // the did-not-stop-practising clause, INLINE
  occurred_at: string
}
```

**Three details of the precedent a build must copy rather than approximate** — an independent review
found this document's first draft diverging from the pattern it claims to follow:

1. **The field is `not_attestable_clause`**, not `not_attested_clause` — corrected throughout this
   document.
2. **The cap is 50, enforced at the STORE READ, not the serialiser** — `ORIENTATION_READINGS_ROW_CAP`
   (`trust-core-store.ts:628`), via `.limit(CAP + 1)` as a truncation probe then `.slice(0, CAP)`.
   Enforce the new cap the same way.
3. **The total count is OMITTED, never fabricated, when the count read fails** (`trust-core-store.ts:713`;
   payload `:191-197`). `total_provenance_gaps_count` must carry the same honest-omission branch.

**Why inline and not once at the top:** the C2c ruling's structural reason applies unchanged — *"the
entry is the unit that will be read in isolation."*

**F-2's minimum content, mapped, now against the four-value vocabulary (§5):** the non-mint (the
entry's existence and its `reason` field — no longer delegated to an unpinned string alone); the reason,
now genuinely distinguishing "no data" from "data that disqualified the mint" as the ruling requires;
and the did-not-practise clause, inline. **F-2's hard exclusion:** no signature-derived value is ever
serialised — enforced by the serialiser's field list (§4.1's earlier correction), not by an absence in
the schema.

### 6.5 The 404 — a case is now made, not just two names on a list

**Mentor, verbatim, on Q4:** *"the public trust record 404ing for an agent with no evidence at all
means that the agent the fix exists to make visible... has no public record at all... That is the
silent carve-out I rejected, arriving through a different path."* And the fork the mentor put back:
*"does the public trust record need a stub record... or does the coverage gap need to surface through a
different mechanism for the zero-evidence population?"*

**The first draft of this section named both shapes and picked neither. It also asserted, without
checking, that a stub record would be nearly free — "closer to compose the existing null-aggregate
branch... than a wholly new response shape." Verified at source, that claim is wrong, and the actual
mechanism facts change the case.**

**6.5.1 What is actually true, verified against `composeTrustRecordPayload` and its call graph.**
`GET /api/trust-record/{agent_id}` has exactly ONE caller of the composer
(`handler.ts:269`), and it is called only after the ENV-1 gate (`handler.ts:222`,
`verdict.profile.domains.some(d => d.hasEvidence)`) has already passed. Inside the composer, the
`aggregate ? {…} : {level: null, …}` branch's FALSE arm is reachable only when `verdict.aggregate` is
`null` — but `readTrustVerdict` (`harness-integration.ts:503-582`) only ever returns a null `aggregate`
on an early failure path (store error, disabled flag), never alongside a non-null `profile`. **On the
sole live call path, the composer's own "no evidence" branch is dead code, not a proven, exercised
shape.** Reaching it for the first time — which any stub-record build would do — is new surface, not
reuse, and needs its own test coverage.

**6.5.2 What a zero-evidence agent's profile actually looks like, also verified.** `readTrustProfile`
(`trust-core-store.ts:524-550`) reads `agent_trust_state` rows for the agent and passes whatever it
finds — possibly nothing — into `computeTrustProfile`. An agent with zero rows still gets a **non-null**
profile: `computeTrustProfile` synthesizes a `domains` array from the profile-prior defaults, each
entry honestly `hasEvidence: false`, and sets `sparse: evaluated.length === 0`
(`trust-aggregate.ts:110`) — which for such an agent correctly reads `true`. **The 404 gate is not
"does a profile exist" — it is the single condition `domains.some(hasEvidence)`.** This narrows what a
stub-record build actually is: not composing a new near-empty shape, but **relaxing one boolean
condition** and, for the first time, exercising an existing-but-dormant branch honestly.

**6.5.3 The case for the stub record, on grounds sharper than "F-2 wants it visible."** The ENV-1 fold's
own stated purpose, quoted in its own comment, was never "must have virtue-domain evidence" as an end
in itself — it was **"gating the 404 on bare row existence would have served [a declaration-class]
agent a 200, falsifying the published contract... A 200 now genuinely implies... examined evidence."**
The thing ENV-1 rejects is a *bare row* — evidence of nothing, dressed as evidence of something. **A
provenance-gap entry is not that.** It is proof the ledger genuinely examined an artifact's origin and
reached a determinate verdict (refuse, and why) — a different KIND of examination than virtue-domain
evaluation, but not a lesser one, and not the bare-row case ENV-1 was built to exclude. **Extending the
gate to `domains.some(hasEvidence) || provenance_gaps.length > 0` is a faithful extension of ENV-1's
actual principle — genuine examination, not bare existence — not a violation of it.**

**6.5.4 The case against the separate-endpoint alternative, worked through rather than left as a name.**
A dedicated sibling endpoint (e.g. `GET /api/trust-record/{agent_id}/provenance-gaps`) would leave the
main record's existing, already-published ENV-1 contract untouched — a real advantage, smaller PR19
surface on the already-shipped endpoint. **But it fails on its own unless the main endpoint's 404 body
points to it.** A client that follows the documented flow, hits a 404, and stops would never discover
the sibling surface — reproducing, in a new place, the exact "pointer resolves to nothing" defect class
this whole arc opened by correcting (fact N, the `agent-card.json` pointer to an empty
`does_not_attest`). Making the 404 honest then requires modifying the 404 response body to carry a
pointer — its own change to a documented response shape, with its own R18 consideration. **Once made
honest, the separate-endpoint approach costs a NEW endpoint plus a modified 404 body; the stub-record
approach costs one relaxed gate condition on an endpoint already being changed this session.** The
former is not simpler once honesty is priced in; it is two smaller changes instead of one, with the
same total surface.

**6.5.5 A genuine cost of the stub record, named rather than omitted because the case favours it.**
Today, EVERY 200 from this endpoint implies at least one domain has evidence — an assumption no live
consumer has ever had to violate, because the dead branch has never fired. Any future integration built
against today's live behaviour (200 ⇒ some evidence exists) would need to additionally check
`aggregate.level !== null` before treating the record as evaluative. This is disclosable and bounded
(the payload already, honestly, says `sparse: true` and `aggregate.basis: 'no evaluated cardinal-domain
evidence'`), but it is a real change to an implicit contract, not a free extension.

**6.5.6 Recommendation.** The stub-record approach — relax `verdict.profile.domains.some(hasEvidence)`
to also admit `provenance_gaps.length > 0` — on the grounds that it is a faithful extension of ENV-1's
own stated principle rather than a violation of it (6.5.3), it is the smaller total change once the
separate-endpoint alternative is made honest (6.5.4), and its costs are disclosable and already
partially covered by the payload's existing honesty fields (6.5.5). **The relaxation should be tied to
the same flag gating the ledger** (`SUBSTRATE_PROVENANCE_LEDGER_ENABLED`), so that flag-off leaves this
endpoint byte-identical — `provenance_gaps` is never populated flag-off, so the additional OR-condition
is never true, and the change is inert until the ledger itself ships. **Offered as a case, per the same
discipline Q3 required — not a decision.**

### 6.6 Cost and blast radius, stated as Step 2 requires it be

### 6.6 Cost and blast radius, stated as Step 2 requires it be

This is a **change to a served public payload**, whichever shape is elected. It carries its own founder
R18 sign-off, its own ADR-013 §8 dated amendment, and its own battery pins **in one edit** — the
S2-39/S2-40 and S2-43..S2-46 precedent, which exists because `attests[1]` was found to have no content
pin at all. New pins start at **S2-48**. The `does_not_attest` list also gains its second edit at
enforcement (§10), and that edit belongs in a separate, later slice from this one — see §10's slice
correction.

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

## §9 — The record-only → enforce switch-on threshold (hard requirement) — RESTRUCTURED per the
mentor's round-2 ruling

Addendum 2 requires this be *"defined before the ledger ships, not discovered operationally."* It is
stated here as a concrete checkable condition. **It decides nothing — the switch-on remains a
founder-walked 0c-ii step, and this is the condition that step checks.**

> **⚠ This section is materially different from its first two drafts. The first draft's C1 was a
> population-wide universal that a review found could never clear (§3's stale table shows why). The
> second draft added cohort-freeze / exception-register machinery to work around that. The mentor's
> round-2 ruling removes the need for that machinery entirely, by changing the SEQUENCE: measure the
> population, THEN define C1 against it, with the harness excluded by name in the meantime.** Verbatim:
> *"C1's population-wide threshold is defined after the split-pair population is measured, not before...
> This is cleaner than the cohort-freeze machinery §9 currently requires under option C's general
> policy. It is also more honest: the threshold reflects the population the ledger actually covers, not
> a population that includes a permanently excluded agent whose exclusion is papered over by a freeze
> mechanism."*

**A new, sequence-ordering step precedes the four conditions below, and it is now the load-bearing one:**

**S0 — Measure the split-pair population, before C1 is defined.** A population-wide query, not the
harness-scoped one §12.1 already answers: group `api_keys` by `agent_id`, and for every agent with an
accreditation write in the trailing 90 days, compare the longitudinal identity resolved on its
consult-capable credential(s) against its write-class credential. **This is a hard founder prerequisite
that gates C1's own definition, not merely this scoping's close.** If the population beyond the harness
is zero, C1 collapses to a single named exclusion and nothing else is needed. If it is non-zero, C1's
threshold is set against that measured population — with real data, per the ruling, rather than
generalising from the one known case.

**Enforcement may be switched on when S0 has run and all four hold:**

**C1 — Identity coherence, defined AFTER S0, over the population S0 measures, EXCLUDING the harness by
name.** For every agent **other than `sagereasoning:s9-loop@v1`** with an accreditation write in the
trailing 90 days, every credential that produces its assessments resolves to the **same** longitudinal
identity as the credential that submits them (§3.4's general rule, now correctly scoped to the measured
population rather than assumed universal). **The harness's own accreditation is deferred by name**
(§3.3, RULED) — it is not counted toward C1, and it does not block enforcement from switching on for
every other agent.

**C2 — Coverage, RE-DEFINED per the Q4 ruling to be reachable.** Mentor, verbatim: *"the threshold
definition must be reachable by every population the ledger is designed to cover, including legitimate
resubmission... An artifact that predates the ledger, or that was submitted while the consult-side
write flag was off, is not a supplied artifact — it is an artifact the ledger cannot speak to. The
missing-entry refusal applies, and the coverage gap surfaces. That is honest."*

**C2, corrected:** every agent with an accreditation write in the trailing 30 days has **100% of that
write's ledger-eligible submitted artifacts** resolving in the ledger, observed across at least **two
consecutive weeks** of record-only operation — where an artifact is **ledger-eligible** only if it was
consulted at or after the point the ledger's consult-side write began recording for its identity.
**Artifacts consulted before that point are honestly `no_ledger_entry` forever, are named as such, and
are EXCLUDED from C2's completeness denominator.** This does not weaken C2's honesty: a pre-ledger
artifact still refuses at enforcement and still surfaces its gap (subject to §6.5's still-open 404
question); it simply does not block the SWITCH from clearing on its account.

*Why 100% and not a percentage.* At a small, now-measured population (S0), any percentage below 100 is
one agent, and a threshold that tolerates one agent's artifacts failing is a threshold that tolerates
shipping enforcement into a known silent refusal. Completeness is what makes the refusals that follow
**honest** refusals rather than blanket ones.

**C3 — A minimum 90-day soak period**, ensuring the ledger has observed ordinary traffic before
enforcement is considered. **Not a drain guarantee** — a legitimately-resubmitted pre-ledger artifact
never drains by aging (§8's PA-10 discussion); C2's redefinition, not C3, is what keeps such artifacts
from blocking the switch.

**C4 — The surface is live.** §6's `provenance_gaps` field (or the widened `coverage_gaps`, per the
mentor's still-open Q3 election) is deployed, pinned, and R18-signed **before** the first refusal can
fire. F-2 is not satisfied by a refusal that has nowhere to surface — **and per §3.3's carried-forward
dependency, C4 should be read as also requiring §6.5's 404/stub-record question to be resolved BEFORE
enforcement switches on for any agent whose refusals could produce a zero-evidence record — the harness
being the first, named example.** This is a strengthening of C4 this document did not carry until the
round-2 ruling's own consequence (§3.3) surfaced it; not yet put to the mentor as its own question.

**The cohort-freeze / exception-register machinery the prior draft carried is RETIRED.** It was designed
to keep C1 reachable under a general-policy reading of the identity conflict that the mentor did not
adopt. Under the ruled narrower reading (§3.3), C1 is defined once, after S0, over a population that
already excludes the one known blocker by name — no freeze mechanism is needed unless S0 finds other
split-pair agents whose configuration cannot be resolved before C1 is set, which would be its own,
smaller, future question.

**Ordering, restated:** S0 → C1's definition → (C1, C2 observed, C3 soak, C4 live, incl. the §6.5
dependency) → switch-on. **S0 is now the step that requires action first**, ahead of §3.3's harness
credential question (which the round-2 ruling makes moot for the harness specifically — the deferral,
not a credential change, is the ruled resolution — though §3.3's Option A remains open as a founder
election if the founder prefers coverage over the least-privilege posture).

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

**12.0 — NOW THE HARD PREREQUISITE, per the round-2 ruling (§9's S0). Gates §9's C1 definition, not
just this scoping's close.** The population-wide split-pair query:

```sql
-- Every agent with an accreditation write in the trailing 90 days, and for each: does its
-- consult-capable credential resolve to the same (owner_user_id, agent_id) pair as its
-- write-class credential? Population beyond the harness decides whether C1 needs any
-- machinery beyond the harness's own named exclusion.
select
  k_write.agent_id,
  k_write.owner_user_id       as write_owner,
  k_consult.owner_user_id     as consult_owner,
  (k_write.owner_user_id is not distinct from k_consult.owner_user_id) as identity_coheres
from api_keys k_write
join api_keys k_consult
  on k_consult.agent_id = k_write.agent_id
  and k_consult.is_active
  and 'consult' = any(coalesce(k_consult.capabilities, array['consult']))
where k_write.is_active
  and ('accreditation_write' = any(coalesce(k_write.capabilities, array['accreditation_write'])))
  and k_write.agent_id in (
    select agent_id from agent_trust_events
    where event_type = 'credential-completed' and occurred_at > now() - interval '90 days'
  )
order by identity_coheres, k_write.agent_id;
```

If this returns only `sagereasoning:s9-loop@v1` with `identity_coheres = false`, C1 is defined as the
single named exclusion §3.3/§9 already specify and nothing further is owed. If it returns others, C1's
population-wide threshold is set against them specifically, per the ruling.

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

## §14 — Recommendation *(permitted; this elects nothing)* — updated after round 4

**Option (a) is still buildable within its ruled limits.** Option (b) and the hybrid stay unneeded.
**(a) does not fail.**

**Fully RULED:** the two-branch refusal design (§5); C2's resubmission-reachable redefinition (§9); the
identity conflict (§3, §9) — defer the harness by name, not a general policy; §9's C1 defined only after
the split-pair population is measured (§12.0).

**Cased and sent, awaiting a ruling (round 4):** Q3's mechanism choice — sibling field recommended over
widening `coverage_gaps` (§6.1–6.4); the 404 question — relaxing the ENV-1 gate for the provenance-gap
population recommended over a separate endpoint (§6.5, with a prior draft's "free reuse" claim corrected
in the process — the composer's null-aggregate branch is dead code today, not proven reuse).

**Still open, smaller now:**

1. **§12.0's population measurement** — a founder SQL query, load-bearing for C1's own definition.
2. **The live attestation amendment** (§10) — unchanged, still owed, likely a founder R18 sign-off item
   rather than a further mentor round (the original ruling delegated "confirm or amend" to this scoping
   session).
3. **The 90-day window, PR24 sweep wiring, and the recency-tier sequencing** — unchanged, all held up
   under review.

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
