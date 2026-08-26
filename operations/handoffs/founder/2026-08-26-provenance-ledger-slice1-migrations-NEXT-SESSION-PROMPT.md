# Next-Session Prompt — Slice 1: the provenance-ledger migrations (TEST → production, inert)

**Paste as the first message of a new session, in the `sagereasoning` repo root.**

**Stream:** founder.
**Tier:** `code-critical` — **new schema.** Full Critical Change Protocol applies. **AC7 engages at the
founder-walked apply step** (TEST then production SQL); the AI drafts and verifies, performs no live
DB operation itself, per this project's standing practice on every prior migration in this arc's
family.
**Risk:** Critical (schema).
**Governing frame:** `/adopted/standing-protocol-cache.md` (note §6 concurrency — `ListAgents` at open).

**This is the first build slice of a fully-closed, five-round scoping arc.** Nothing in the fix choice,
the policy rulings, or the schema shape is open for re-litigation — this session builds exactly what
was scoped and ruled, and stops at two named gaps the scoping never actually resolved (below).

---

## Step 0 — Open and re-ground

1. `/adopted/standing-protocol-cache.md`; `git log -1`; `git status`; `ListAgents`.
2. **Read in full:** `operations/agent-circles-2026-08/2026-08-26-provenance-ledger-SCOPE.md` — this
   is the single governing document; every schema, gating, and sequencing decision is inside it. Read
   it whole before writing any SQL, not just §4 and §13 — §3's identity finding and §9's threshold
   design explain WHY the schema has the shape it has.
3. Skim in order, verbatim wins, none re-opened: `2026-08-25-mentor-ruling-extraction-provenance-fix-
   choice-verbatim.md` (+ its two addenda) → `2026-08-26-mentor-ruling-provenance-ledger-q1-q4-
   verbatim.md` → `2026-08-26-mentor-ruling-provenance-ledger-q1-round2-verbatim.md` →
   `2026-08-26-mentor-ruling-provenance-ledger-q3-and-404-verbatim.md`.
4. Confirm at open: tier `code-critical`; AC7 status (not yet engaged — engages at the apply step);
   PR6 (founder performs every live DB operation); hold-point P0 0h; weights BLOCKED (unaffected by
   this arc either way).

## Step 1 — What is ruled and closed, not to be re-derived or re-argued

| | Ruled | Where |
|---|---|---|
| Fix choice | Option (a), the signature-keyed ledger | `2026-08-25` ruling |
| Missing entry | Refuse the mint | Q4(i), SCOPE §5 |
| Supplied entry | **Also refuses**, distinct reason from missing — two branches, not one | Q2 round 1, SCOPE §5 |
| Write semantics | Insert-once, never upsert | Q4(ii), SCOPE §4.3 |
| Scoping unit | Owner+agent pair, credential-only fallback, via the EXISTING `resolveLongitudinalIdentity` — no second identity notion | F-1, SCOPE §3 |
| The identity conflict | Defer the harness's own accreditation by name — NOT a general policy. Confirmed empirically: no other agent is affected (§12.0, one row, `identity_coheres: false`, harness only) | Q1 round 2, SCOPE §3.3, §9 |
| Coverage-gap surface | `provenance_gaps` + `total_provenance_gaps_count`, sibling field, NOT `coverage_gaps` widened | Q3 round 4/5, SCOPE §6 |
| The 404 | ENV-1 gate relaxes: `domains.some(hasEvidence) \|\| provenance_gaps.length > 0`, tied to this ledger's own flag | Round 5, SCOPE §6.5 — **this is slice 3's territory, not slice 1's; named here so slice 1's schema doesn't accidentally foreclose it** |
| Retention window | 90 days, data-derived (SCOPE §7) | — |
| Attestation wording | Founder-signed exact sentence, SCOPE §10 — **slice 3's territory** | — |
| Build sequencing | Founder-signed, SCOPE §13; slice 4 (the original credential-mint idea) is RETIRED — no credential action needed | — |

**Do not re-open:** the fix choice, any of Q1–Q4's policy rulings, route (i)/(ii), the gaming-robustness
bar's Arm-B measurement, or anything the SCOPE document already marks RULED. If this session's own work
surfaces a genuine new tension with one of these, name it explicitly and stop rather than resolve it
unilaterally — the pattern this whole arc has followed.

## Step 2 — THE TWO GAPS THIS SCOPING NEVER ACTUALLY CLOSED (find them early)

**Verified 2026-08-26, re-confirmed at the start of this prompt's authoring session: neither of these
was ever sent to the mentor across five rounds of consultation on this arc.** They are schema-level
questions and this is the schema session — they must be resolved here, not discovered mid-migration.

**Gap 1 — table 2 (`agent_provenance_gaps`) has no stated uniqueness constraint, despite carrying a
field labelled "idempotency."** SCOPE §4.1: *"`correlation_id` is labelled 'idempotency' but §4.1
states a uniqueness constraint only for table 1 (`signature_hash`) — without one on table 2, a retried
write... would duplicate the gap row on the public record."* The harness's own accreditation write
pattern makes retries the NORMAL case (honest-409-on-reuse), not the edge case — so this is not a
theoretical gap. **Resolve before writing the migration:** almost certainly `UNIQUE (correlation_id)`
on table 2, mirroring table 1's `UNIQUE (signature_hash)` — but state the reasoning in the migration
comment rather than adding it silently, since the scoping document itself flagged this as undecided.

**Gap 2 — no stated precedence when one write produces multiple distinct refusal reasons at once.**
SCOPE §5.4 fixed the GRANULARITY (one gap row per write, not per artifact) but never the PRECEDENCE:
if one submitted artifact is `no_ledger_entry`, another `out_of_window`, and a third
`caller_supplied_extraction`, which `reason` does the single gap row carry? **Resolve before writing
the write-path logic** (this affects slice 2, but the migration's `reason` CHECK constraint in slice 1
must admit whatever values the precedence rule can produce, so decide the ordering now even if the
logic ships in slice 2). A reasonable default, worth stating explicitly rather than defaulting silently:
`caller_supplied_extraction` first (it is a POSITIVE finding — the ledger has data and the data
disqualifies — distinct in kind from the other three, which are all "the ledger has no data"; per the
Q2 ruling's own framing of that distinction), then `identity_mismatch`, then `out_of_window`, then
`no_ledger_entry` as the true fallback. **This is a recommendation, not a ruling** — if the founder or
an adversarial review during this session judges a different order more honest, change it and record
why.

**If either gap turns out to be more consequential than a straightforward default resolves — e.g. if
the precedence question interacts with something not yet visible — STOP and put a mentor question
rather than deciding it unilaterally.** The whole arc's discipline has been: ruled questions build
freely, unruled questions get a question, not a guess.

## Step 3 — The schema (SCOPE §4.1, reproduced with the two gaps closed)

**Table 1 — `agent_provenance_ledger`:**

| column | type / notes |
|---|---|
| `signature_hash` | `text`, the key. `sha256(signature)` hex. Raw signature never stored |
| `identity_kind` | `'owner_agent_pair' \| 'credential'` |
| `owner_user_id`, `agent_id` | set on the pair branch; null otherwise |
| `credential_ref` | always set |
| `layer1_source` | `'server' \| 'supplied'` |
| `recorded_at` | consult time — load-bearing for the PA-10 dependency (SCOPE §8), not decoration |
| `retain_until` | `now() + interval '90 days'` |

`UNIQUE (signature_hash)`. RLS service-role-only, mirroring `agent_trust_events`/`agent_hold_
observations`.

**Table 2 — `agent_provenance_gaps`:**

| column | type / notes |
|---|---|
| `agent_id`, `owner_user_id`, `credential_ref` | the refused write's identity |
| `reason` | CHECK `IN ('no_ledger_entry','out_of_window','identity_mismatch','caller_supplied_
extraction')` |
| `occurred_at`, `retain_until` | as table 1 |
| `correlation_id` | `UNIQUE` (Gap 1, resolved above), derived like `accr:<digest>`, internal only, **never
served on the public payload** — F-2's hard exclusion enforced at the schema level: no signature or
artifact-detail column exists on this table at all |

RLS service-role-only. **No signature-derived column on this table** — the F-2 hard exclusion (*"must
NOT carry the signature or any artifact detail that would expose the provenance mechanism to
gaming"*) is structural, not a serialiser discipline layered on top.

**Both tables need R17 data-rights coverage in the SAME session per SCOPE §4.4** (*"Its coverage is not
a rider; it is a precondition of §6 shipping"* — and `agent_provenance_gaps` is the sharper case, since
it is served publicly; an owner deletion that left gap entries standing would keep publishing a fact
about an erased subject). **Open sequencing question, not pre-decided:** does R17 wiring (`/api/user/
delete`, `/api/user/export`, `/api/credential/erase`) ship in THIS slice (alongside the empty, inert
tables) or wait for slice 2 (when rows can actually exist)? **Recommendation: wire it in this slice**,
mirroring the PR24 precedent that retention/purge machinery ships with the schema that needs it, not
after — but this is a judgement call for this session to make and record, not a silent default.

**PR24 note, inherited and NOT this slice's job:** the purge/sweep wiring for both tables' `retain_
until` is slice 2's responsibility per SCOPE §7 (*"Sweep folded into the existing trajectory cron"*) —
name it here so slice 1 doesn't accidentally try to do it early or slice 2 doesn't forget it.

## Step 4 — Inherited lessons, named so they are not rediscovered (SCOPE §13)

- **Re-derive any CHECK constraint's CURRENT definition via `pg_get_constraintdef`** before writing a
  migration that touches one — never trust a prior migration file's own comments as ground truth (the
  Stoa Q5c/Q13a staleness class). This migration adds two NEW tables and touches no existing CHECK, so
  this mainly matters if the session's own later verification queries reference `agent_trust_events`'
  constraints.
- **A fake PostgREST test client that ignores its `select()` argument cannot catch a wrong primary-key
  column** — if this session or slice 2 writes a purge function, name the real PK column explicitly in
  any test double, the way the C-1 sweep defect required after the fact.
- **A `retain_until` declared without its purge and sweep in the same session is a PR24 violation** —
  not violated by THIS slice (the sweep is explicitly slice 2's job, named above), but do not let slice
  2 forget it either.

## Step 5 — What this session must produce

1. **Two migration files**, following the `agent_hold_observations`/`agent_trust_core` precedent shape
   (idempotent, `§PRE`/`§APPLY`/`§VERIFY`/rollback sections, additive, reversible).
2. **Both gaps from Step 2 resolved and their reasoning stated in the migration's own comments** — not
   silently defaulted.
3. **The R17 sequencing question from Step 3 decided and stated** (wire now, or explicitly deferred to
   slice 2 with a named reason).
4. **TEST apply, `§VERIFY`, then PRODUCTION apply, `§VERIFY`** — founder-walked, PR6/PR17, AC7 engaged
   and discharged. **Both tables are empty and inert at the end of this session** — no flag exists yet
   that would cause anything to write to them (`SUBSTRATE_PROVENANCE_LEDGER_ENABLED` is slice 2's flag,
   not created here). Production is genuinely byte-equivalent after this slice, in the same sense every
   prior schema-only slice in this project's history has been.
5. **A close** naming what was decided (the two gaps, the R17 sequencing call) and what slice 2 inherits.

## Constraints that bind

- **NO write path, no flag, no route change.** This slice is schema only. `SUBSTRATE_PROVENANCE_LEDGER_
  ENABLED` does not exist yet — do not create it here; slice 2 creates it alongside the write it gates.
- **PR19 does not need a full independent-review workflow for a schema-only slice with no code path**,
  but do run the adversarial pass this arc's every session has run once the migration text and the two
  gap-resolutions are drafted — this project's own standing lesson (S9b, C-1, Stoa Q5c/Q13a) is that
  migration text is exactly where staleness and false-benign errors hide.
- **Concurrency:** `ListAgents` at open; `git status` before writing and again before staging;
  path-scoped commits; exclude `website/src/data/environmental-context.json`.
- Weights BLOCKED (unaffected). Nothing here bears on the 0h call.

## What "done" looks like

Two new tables, empty and inert, live on TEST and production, with their uniqueness constraints and
CHECK vocabularies exactly matching the ruled reason taxonomy; the two previously-unresolved schema
gaps closed with stated reasoning, not silent defaults; the R17 sequencing question decided; slice 2
(the flagged write path + its sweep wiring) ready to open next.

*End of prompt.*
