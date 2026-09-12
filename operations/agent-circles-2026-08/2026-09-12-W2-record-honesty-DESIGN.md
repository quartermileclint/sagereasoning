# W2 — the enforcement-class record machinery: design of record

**Date:** 2026-09-12 (from `date`). **Session:** `sagereasoning-bd [acc3ac]`.
**Tier:** `code-elevated`, dark, flag-gated. AC7 not engaged here; the schema step and any
activation are separate founder-walked `code-critical` sessions.
**Binding sources (verbatim wins over the plan; the plan wins over the session prompt):**
`2026-08-01-mentor-consultation-agent-circles-logos-on-verbatim.md` L4, L5, L7;
`2026-08-01-agent-circles-logos-on-plan.md` §3 W2 items 1–5, §4, §6.
**Status:** Designed → (built on branch `w2-record-honesty`, see §9) → awaiting the founder-walked
waiver + schema session.

---

## 0. The one sentence

A guardrail deny becomes a ledger entry of a new, effect-neutral class that says, in the record's
own words, that the infrastructure acted and the agent's reasoning did not; the entry cites only an
other-directed ground; and every examination entry gains a regime marker so a reader can tell
enforced alignment from practised character.

## 1. Grounding facts this design rests on (re-derived from source this session)

| Fact | Where checked |
|---|---|
| The ledger `agent_trust_events.event_type` CHECK admits **21** values today (last widened by the orientation migration, 18 → 21). | `website/supabase-agent-trust-events-orientation-vocabulary-migration.sql` §A |
| `EVENT_EFFECT` is `Record<TrustEventType, …>` — total over the union, so a new type forces a row. | `trust-core/trust-transition.ts:40` |
| Effect `'flag'` is a genuine no-op on state (`return { ...prior }`). | `trust-transition.ts:109` |
| A NULL-domain event through `emitTrustEvents` mis-routes to the reflect fold; `emitLedgerOnlyTrustEvents` is the insert-only path and is battery-pinned as the orientation events' only path. | `trust-core-store.ts:301`, `types.ts` orientation comment |
| The guardrail route already holds, at deny time, the signed Layer-2 assessment (`outcome.signed`), the verdict (`recommendation`, `katorthoma_proximity`), and the credential (`keyCheck.api_key_id`). It does **not** resolve the credential's agent id today. | `api/guardrail/route.ts:90,116,296-392` |
| `/api/reason` sources the orientation event's agent id via `resolveCredentialContext(api_key_id)` + `isAcceptedAgentId` — never from the caller-supplied `agent_id` body field. | `api/reason/route.ts:2347-2351` |
| `deriveWorstJusticeOutcome` already encodes "other-directed" as `circle !== SELF_PRESERVATION_CIRCLE` on `oikeiosis.relevant_circles[]` with `obligation_assessment.status`. | `derive-trust-events.ts:228-247` |
| The **original** build-plan C1c (first-circle failure/demonstration event classes + its CHECK widening) is confirmed distinct, "unscheduled", and has never been built. The "C1c" that went live 2026-08-08 is the circle-5 orientation class. | decision log lines 18600, 18918; `types.ts` has no first-circle event type |
| The S10 public record carries orientation entries with an inline not-attestable clause, a cap, and an honest total count — the pattern the mentor's L7 tells W2 to mirror ("the entry is the unit that will be read in isolation"). | `trust-record-payload.ts` `TrustRecordOrientationEntry` |
| `GUARD_RE` matches `trust-core`, `/substrate/`, `api/guardrail`; the guard binds on `git status --short` lines (untracked files included) while `GATE1_FALSE_HOLD_CAPTURE=true`. | `logos/__tests__/human-practitioner-boundary.test.ts:419-456` |

## 2. Item 1 — the enforcement class

**Event type:** `enforcement-outcome` — **one** type. The orientation class used three types because
event_type is the single source of truth for *effect*; here the effect is uniform (`'flag'`) whatever
the ground, so one type keeps that doctrine intact and the ground lives in the payload.

**Effect:** `EVENT_EFFECT['enforcement-outcome'] = 'flag'`. Moves no domain level in either direction.
**`virtue_domain`:** NULL (the entry is not evidence for any domain — the reflect/orientation
agent-wide precedent). **Emission path:** `emitLedgerOnlyTrustEvents` only (insert-only; never folds
state, never touches a reflect timestamp) — the same load-bearing choice the orientation class made,
for the same reason.
**Artifact:** `artifact_kind = 'signed_layer2_assessment'`, `artifact_ref = <signature>` — the
guardrail signs its verdict; **no signed assessment ⇒ no entry** (R18f-parallel; a signing outage
already fails the gate closed with 503, so this branch is unreachable in practice and pinned anyway).
**Correlation:** `enforce:<sha256(agentId|signature)[:32]>` — one deny, at most one entry, dedup by
`uq_ate_correlation` (COALESCE covers the NULL domain).

**Payload (typed additions to `TrustEventPayload`):**

| field | value | why |
|---|---|---|
| `regime` | `'logos-on-enforcement'` | item 2 |
| `enforcementSource` | `'guardrail_deny'` today; `'s11_intervention'` reserved in the type, **never emitted**, pinned | plan item 1 ("today: guard denies; eventually: S11") |
| `enforcementGround` | `{ kind: 'other_directed', circles: string[], obligationStatus: 'violated' }` or `{ kind: 'no_other_directed_ground', basis: string }` | item 5 (§6 below) |
| `enforcementContextMarker` | the L5 three-part marker, verbatim constant | item 1 |
| `complianceNotVirtueClause` | the L7 clause, verbatim constant | item 3, inline half |
| `verdictRecommendation`, `verdictProximity`, `proximityFloorsBasis` | from the signed assessment / verdict | reproducibility |

**PA-6 re-run (same change):** the battery asserts `applyTrustEvent` returns a state equal to the
prior for `enforcement-outcome` on **every** trust domain including `oversight`, at every starting
level; and that the effect is `'flag'` (the S9b PA-6 idiom, extended to the new row).

**Retroactivity:** none. Plan §6 item 2 recommends forward-only; this design makes it structural —
the only producer is the deny-time seam, there is no backfill path, and the design records the
decision here as the plan asked.

## 3. Item 2 — per-entry regime markers

`TrustEventPayload.regime: 'practice-on' | 'logos-on-enforcement'`.

**Stamping:** at the store's single row-mapping chokepoint (`insertEvent` → the row builder), **flag-on
only**: any event lacking `regime` is stamped `'practice-on'`; the enforcement deriver sets
`'logos-on-enforcement'` itself. Flag-off, nothing is stamped — every existing emitter's row bytes
are unchanged. One seam, not eight emitters.

**Reading:** the S10 orientation entries and the new enforcement entries carry `regime` on the wire
(flag-on). Older rows with no stamp are served as `practice-on` — honest, because no enforcement
entry could have existed before the flag, and the only enforcement producer stamps its own regime.

**Where this design deliberately stops:** the mentor's "alongside the existing examination-timing
credential field" names `examination_mode` on the accreditation payload. Adding a per-entry regime
column to accreditation rows touches the accreditation write path, which this session's prompt puts
out of scope. Recorded as a named follow-on for the flip-component session, not silently dropped.

## 4. Item 3 — the compliance-not-virtue clause

The L7 clause lands **verbatim** as `COMPLIANCE_NOT_VIRTUE_CLAUSE` in `trust-core/enforcement-record.ts`,
battery-locked against drift:

> what this record shows under logos-on enforcement is compliance with rational structure, not
> constructed virtue. Enforced outcomes are not character evidence. The absence of violations under
> enforcement does not attest to the agent's virtue; it attests to the infrastructure's function.

**Inline half (built, dark):** every served enforcement entry carries it as
`compliance_not_virtue_clause`, and every ledger row carries it in the payload.

**Record-level half (STAGED, not applied):** the `TRUST_RECORD_ENVELOPE.does_not_attest` addition and
the ADR-013 §8 dated amendment must land in the **same** edit as each other and be R18-signed before
they touch a public surface. The staged text, and the sentence pairing it with C2d's not-attestable
clause as the record's honest-claims boundary, are in
`operations/agent-circles-2026-08/2026-09-12-W2-compliance-not-virtue-clause-STAGED-R18.md`.
Nothing public changes in this build.

## 5. Item 4 — the schema election: **a separate step** (decided, recorded)

**Decision:** W2 takes its own CHECK-widening step (21 → 22, adding `enforcement-outcome`), authored
as `website/supabase-agent-trust-events-enforcement-vocabulary-migration.sql`.

**Reasoning:** the plan's efficiency argument assumed C1c's schema walk was coming. The original C1c
(first-circle event classes) is unbuilt and unscheduled (§1). W2 is a **hard flip component**
(register §F W3-d): binding it to an unscheduled step would make the flip's own prerequisite wait on
work nobody has elected. The migration is additive and idempotent, so if C1c-original is later
scheduled its widening simply lists 22 values instead of 21 — nothing is lost by going first.
The plan's review clause ("review may split it") is exercised here on the dependency fact, not on
taste.

## 6. Item 5 — L4's dual-recording rule

The pure deriver `deriveEnforcementRecord(input)` returns **two lanes** and never mixes them:

```
{ enforcement: TrustEvent | null, firstCircleFinding: FirstCircleFinding | null }
```

**Ground selection** reads the signed assessment's `oikeiosis.relevant_circles[]`:
- other-directed violated circles = `status === 'violated' && circle !== SELF_PRESERVATION_CIRCLE`
  (the reducer's own encoding, **mirrored** over the shared `SELF_PRESERVATION_CIRCLE` constant —
  not a shared function call; the codebase idiom is parallel duplication, so the two cannot drift
  on the constant's value but are not one function. Corrected from "reused" at PR19.);
- a first-circle failure = a `self_preservation` circle with `status === 'violated'`.

| case | `enforcement.payload.enforcementGround` | `firstCircleFinding` |
|---|---|---|
| other-directed violation only | `other_directed`, cites those circles | `null` |
| other-directed **and** first-circle, co-occurring | `other_directed`, cites **only** the other-directed circles — `self_preservation` never appears | populated (measure-only lane) |
| first-circle only (the class L4 says infrastructure must not enforce on) | `no_other_directed_ground` with a basis string; `self_preservation` is **not** cited as ground | populated |
| no violated circle at all (a kathekon-floor / proximity deny) | `no_other_directed_ground`, basis names the verdict | `null` |

**Batteries prove both halves** (§8): the other-directed-only case cites correctly; the co-occurring
case cites the other-directed trigger and reports the first-circle failure in its own lane; a
negative pin proves `self_preservation` cannot appear in `ground.circles` under any input, by
mutation as well as by fixture.

**The first-circle lane's ledger home is named, not invented.** No first-circle event type exists;
creating one here would silently absorb the original C1c, which the record forbids twice over. The
finding is returned as a structured measure-only object and logged server-side (never in the
enforcement entry); its ledger carrier is C1c-original's event class when that session runs. This is
a disclosed limit of the build, not a design choice to be repeated forward.

**Why this sits beside §W3, not inside it:** §W3 pins what the *intervention engine* cannot see.
W2's pins are about what the *record* cites. They share the L4 verdict and the `SELF_PRESERVATION_CIRCLE`
constant, and nothing else; the new battery imports the constant so the two cannot drift apart.

## 7. Emission source and the live-gate seam

**Where:** server-side, in `api/guardrail/route.ts`'s sandwich branch, only when
`resultBody.recommendation === 'do_not_proceed'` — the deny class. Cautions are not enforcement (the
action proceeds). **Why server-side:** the entry must be consumer-unforgeable (the orientation
precedent); a harness-side write would be forgeable by any credential holder and would need a
write-class capability the consult credential does not carry.

**Agent identity:** `resolveCredentialContext(keyCheck.api_key_id)` + `isAcceptedAgentId` — never the
caller-supplied `agent_id` body field. No accepted agent id ⇒ no entry (an anonymous key cannot
accrue a record). **Gate:** `isTrustCoreEnabled() && isEnforcementRecordEnabled()`; both checked at
the route AND inside the emitter (defence in depth, the C1c PR19 fold). **Placement:** after the
response body is composed, before it is returned; awaited inside a never-throws wrapper (KG1 — no
fire-and-forget; the verdict is never affected). Flag-off the block is skipped entirely: the route is
byte-identical in behaviour and in bytes written.

**Agent identity, as folded at PR19 (HIGH):** the choice is a pure helper,
`resolveEnforcementAgentId(credCtx)`, whose only parameter is the credential context — there is no
argument through which a body field could be offered — runtime-tested for the null-bound-agent case a
`??`-fallback would have reopened. The route's seam block never mentions the request's `agent_id`
identifier; a source pin forbids it outright rather than pinning one literal shape.

**Disclosed scope limit (PR19 nit):** the seam lives in the sandwich branch only. The legacy
`sage-guard` path (live only if `SUBSTRATE_GUARDRAIL_SANDWICH_ENABLED` were rolled back) signs no
verdict, so no R18f-parallel entry could be derived there; a sandwich-flag rollback would silently
lose enforcement-record coverage. Named, not closed.

**Window note:** the guardrail is a measured surface. The seam adds no deny condition (plan §4) and
is unreachable flag-off; deploying the code is the founder's act in the waiver session, not this one.

## 8. Flag, byte-identity and the battery

**Flag:** `SUBSTRATE_ENFORCEMENT_RECORD_ENABLED`, dedicated (the shared-flag lesson: the trust core
is live, so riding its flag would make this live on deploy). Unset anywhere ⇒ no route seam, no
store stamp, no S10 keys, no envelope change — byte-identical, battery-asserted.

**New battery `trust-core/__tests__/w2-enforcement-record.test.ts` covers:** the L7 clause and L5
marker verbatim; `EVENT_EFFECT` row + the PA-6 identity on all five domains; ground selection all
four rows of §6 plus the mutation-style negative pin; the co-occurring lane split; the source
vocabulary pin (`s11_intervention` declared, never emitted); the emitter refuses an unsigned
assessment, a non-deny verdict, an unaccepted agent id, and flag-off (zero store calls); correlation
determinism and agent-salting; the store regime stamp on/off; S10 compose with and without the
slice (no new keys flag-off; entries carry regime + clause + marker flag-on; capped/total honesty).

## 9. Working-tree discipline and what the founder-walked session does

The byte-identity guard is armed and no waiver exists for this session. The code is therefore built
and battery-run in an isolated git worktree on branch `w2-record-honesty`
(`/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning-w2-worktree`); the measured checkout
on `main` is untouched by any `GUARD_RE` file. Records and the staged clause (none `GUARD_RE`) land
on `main` path-scoped.

**The next session (founder-walked, `code-critical`):** (1) grant the per-commit waiver; (2) merge or
cherry-pick the branch commit onto `main`; (3) walk the CHECK-widening migration TEST → production
(the migration must land **before** the flag); (4) leave the flag unset — activation is its own
later step, coupled to the flip per register §F W3-d; (5) the R18 sign-off for the record-level
clause is its own step still.

## 10. Out of scope, stated

The S11 flip; any accreditation write; the first-circle event class (C1c-original); the regime
column on accreditation rows (§3 follow-on); applying the record-level clause to a public surface;
any change to a deny condition.
