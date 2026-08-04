# Stoa ST7 thread 2 — Q5c/Q13a trust-event wiring — SCOPED

**Status:** investigation complete (2026-08-03); **design questions answered + adopted 2026-08-04**. Nothing built. The build (and its schema migration) is a separate, later, founder-walked session.

**Binding sources, in precedence order:**
1. `operations/connective-layer-2026-08/2026-08-04-mentor-consultation-stoa-followups-verbatim.md` — the six answers scoping THIS build. **Verbatim wins over anything below.**
2. `operations/connective-layer-2026-08/2026-08-02-mentor-consultation-connective-layer-verbatim.md` — Q5(c) and Q13(a) themselves.

## What the mentor ruled (2026-08-02, the underlying rulings)

- **Q5(c):** a demonstrated false capability claim in examined use is a trust-relevant event in the oversight and dikaiosyne domain; evidentiary standard = an examined artifact, never accusation alone. *"The directory entry is a claim. Examined use that contradicts it is evidence. The gap between them is the trust-relevant event."*
- **Q13(a):** divergence between an agent's directory declaration and its declared calling is an honesty signal, surfaced honestly, never auto-removed — *"not as a violation, but as a discrepancy that warrants attention."*

## Current state (verified first-hand against the tree, post-ST6)

Genuinely unbuilt: `grep -rl stoa` across `website/src/lib/substrate/trust-core/` and the accreditation/calling routes returns nothing.

What exists and is **not** this: the entry-lifecycle removal path (`removal_ground='dishonesty_examined'` requires a substantive `removal_artifact_ref`, structural CHECK, PR19-hardened). That is a decision about the *entry*. Q5(c)/Q13(a) ask for a write to the *agent's trust ledger* — a separate mechanism. An entry may be removed, a trust event may fire, either, both, or neither. **Do not conflate them.**

The event vocabulary is a closed, DB-enforced enumeration (`CHECK (event_type IN (...))` on `agent_trust_events`, widened once already by `website/supabase-agent-trust-events-s9b-vocabulary-migration.sql`). Postgres rejects an unrecognised `event_type` at INSERT regardless of the TypeScript union.

## The four settled design decisions

### 1. THREE event types, not two (Q1 + Q4)

The mentor split Q5(c) into **two** events by domain, and confirmed Q13(a) as a **third**, separate type:

| Event type (proposed name) | Domain | Effect class | Fires when |
|---|---|---|---|
| `stoa-claim-contradicted-oversight` | `oversight` | decrease | the claim was simply false regardless of who was affected — "the agent said it could do something, and it demonstrably could not" |
| `stoa-claim-contradicted-dikaiosyne` | `dikaiosyne` | decrease | the contradiction involved treatment of another party — "claimed it would handle something in a way that affected others, and examined use showed it did not" |
| `stoa-declaration-diverges-from-calling` | (see §3) | **flag** | the Stoa declaration diverges from the declared calling record |

**Critical clarification, verbatim:** *"oversight here is not a severity escalation over dikaiosyne. It is a different domain of concern."* Domain is chosen by **content of the claim and nature of the contradiction, never severity**. **Where both are true, both fire.** Where only one is true, only that one fires. Any implementation that treats these as a severity ladder, or picks "the worse one," contradicts the ruling.

### 2. Flag-triggered, never continuous (Q3) — the load-bearing constraint

Option (b) adopted. **Do NOT build a background process comparing fresh assessments against active Stoa entries.** The mentor's reason is not cost or complexity — it is optimisation pressure: *"An agent that knows its assessments are continuously compared against its Stoa entry has an incentive to manage its entry to match its assessments rather than to declare honestly."* Continuous comparison would corrupt the honesty the Stoa exists to enable.

The trigger is a **specific flag naming a specific artifact and a specific contradiction** — mirroring how removal already works. Any of: the agent's owner, a curator, or another practitioner acting on the existing removal-ground standard. *"The trigger determines when the examination happens; the standard determines what counts as evidence when it does."*

**This substantially shrinks the build.** The 2026-08-03 investigation named automated free-text comparator machinery as the biggest unscoped piece; that machinery is now **explicitly ruled out**, not deferred.

### 3. Q13(a) is a separate mechanism with a distinct disposition (Q4)

Not a new arm on `calling-completed`. The mentor's reason is architectural: *"A caution capped at a ceiling is still a caution... the mechanism's existing behaviour shapes how any output from it is read."* Folding it in would import severity framing the ruling explicitly denies.

**Disposition: `flag` — it does not increase or decrease any domain level.** It is *"present in the record for a reader who consults it, named accurately as a coherence observation rather than a caution."* Shares the calling record as a **data source only**. Separate mechanisms, separate dispositions, shared data source.

**RESOLVED 2026-08-04 by reading the code (was: "decide at build"). The Q13(a) event MUST carry `virtue_domain: 'oversight'` — NEVER `null`.** This is not a style preference; `null` is actively wrong:

- `trust-core-store.ts:155` branches on `event.virtueDomain === null` → `applyReflectAcrossDomains`. That function is **reflect-specific**: it writes `reflect_last_honest_at = occurredAt` (the default branch — the column is only `reflect_last_screened_at` when `eventType === 'reflect-screened-honest'`) across **every** domain row for that agent.
- `reflect_last_honest_at` is the **decay modulator**. So a null-domain Q13(a) event would silently slow decay across all four cardinal domains — i.e. materially *benefit* the agent — on the basis of a coherence *discrepancy*. Exactly backwards, and it would do so invisibly (the `flag` effect looks like a no-op if you only read `trust-transition.ts`; the harm is in the store's routing, one layer up).

**With `oversight`, the behaviour is correct and honest** (verified by reading the fold path end-to-end):
- `foldDomainEvent` seeds a state row if none exists (`earnedLevel: 'habitual'`, `profilePrior: 'habitual'`, `volatility: 'high'`), then `applyTrustEvent`'s `flag` branch returns `{...prior}` unchanged, then upserts.
- The seeded row reads `has_evidence: false` — `trust-aggregate.ts:57` computes evidence as `lastDomainActivityAt !== null || earnedRank !== priorRank || justiceFloorActive`, and a flag event trips none of the three. So the public trust record shows the domain honestly as carrying no evidence, and the S10 `ENV-1` 404 gate (no domain carries evidence ⇒ 404) still fires for a flag-only agent.
- The **A7 AND-guard survives**: `l4-passion-audit.ts:327` gates the `higher` tier on `oversight.hasEvidence`, which stays false. The standing property — no event type can *raise* oversight — is preserved, since a flag changes no level.

**Build-session note:** row-seeding is a real (if benign) side effect — an oversight row appears where none existed. Pin it in the battery both ways: the row is created, AND it reads `has_evidence: false`.

### 4. Both may fire from one root cause — do not guard against it (Q5)

*"Two entries from one root cause is honest, not redundant. Do not guard against it structurally."* Suppressing one would require the system to rank which question matters more — *"a judgement the system should not be making."* No dedup logic across these event types. (Note: this does **not** relax the existing per-event idempotency-on-retry discipline — that prevents one event being written twice, not two different events answering different questions.)

## The evidentiary standard (Q2) — the honesty core of the build

Curator-mediated pairing is acceptable and is **not** accusation, provided:
- **The artifact does the evidentiary work; the curator supplies only the pairing** — the connection between artifact and entry text that no automated comparator exists to make.
- **"Concretely contradicts"** = *"a reader examining both the artifact and the entry text would find the contradiction without requiring inference or interpretation. If the contradiction requires interpretation, the standard is not met."*
- **"Never accusation alone"** here reads as: *"the artifact must be capable of standing on its own as evidence. A curator who points to an artifact that does not independently demonstrate the contradiction has not met the standard, regardless of how confident the curator is."*

The residual risk the mentor named explicitly: **the curator can be wrong about the relationship.** The "concretely contradicts, no interpretation required" bar is the mitigation. This should be visible in the built surface, not just in this document.

## What the build session needs to do

1. **Three new `TrustEventType` literals** in `website/src/lib/substrate/trust-core/types.ts` + their `EVENT_EFFECT` entries in `trust-transition.ts` (decrease / decrease / flag).
2. **A CHECK-widening migration** on `agent_trust_events.event_type` — additive, same pattern as the S9b vocabulary migration. **Founder-walked TEST→prod, its own 0c-ii step, before any emitting code goes live.** ← the migration gate.
3. **A flag/report intake path** — how a contradiction is submitted, by whom, carrying which artifact reference. This is the genuinely new surface and the main design work remaining. Must capture: the specific entry, the specific claim within it, the specific artifact, and the asserted contradiction.
4. **Derivers** in `derive-trust-events.ts` (following `deriveCallingEvent`'s shape) enforcing the R18f-parallel verifiable-artifact rule and the "concretely contradicts" bar.
5. **Flag-gating** behind `SUBSTRATE_TRUST_CORE_ENABLED` at minimum; a narrower dedicated flag is worth considering given a false positive writes a permanent ledger entry even in MEASURE mode.
6. **Boundary battery extension** — the Stoa↔trust-core separation (#20) is currently asserted structurally in both directions. **This build deliberately opens ONE direction** (a curator-triggered path writes trust events referencing a Stoa entry). The existing boundary pins must be re-derived, not merely relaxed: the Stoa's own surfaces must still never read trust state, and nothing about directory presence or use may feed any signal (#20 stands — the mentor did not reopen it).

## Remaining open items (none are mentor questions)

- The flag-intake surface's own shape (who can submit, what UI/route, how a curator is authorised). **The one genuinely undesigned piece.**
- ~~Whether Q13(a)'s event carries `oversight` or a null domain.~~ **RESOLVED 2026-08-04 — `oversight`, never `null`** (see §3 above; `null` routes to the reflect path and would slow decay across all domains from a divergence finding).
- Whether a narrower feature flag is warranted alongside `SUBSTRATE_TRUST_CORE_ENABLED`. **Leaning yes** — a false positive here writes a permanent ledger row even in MEASURE mode, and the curator-pairing path has a named residual risk (the curator can be wrong about the relationship). A dedicated flag makes the rollback surgical rather than "turn the whole trust core off."

## A note on the `null`-domain trap, for whoever builds this

The `null`-domain finding above generalises past this thread. **Any future trust event type must resolve its `virtue_domain` deliberately, because `null` is not a neutral "agent-wide" value — it is a routing key into reflect-specific machinery** (`trust-core-store.ts:155`). Today only the two reflect event types are legitimately null-domain. A reader of `trust-transition.ts` alone would not see this: the `flag` effect there is a genuine no-op (`return { ...prior }`), and the whole behaviour difference lives one layer up in the store's dispatch. Worth carrying into the S1 vocabulary docs the next time that file is touched.

## Separately settled the same day (Q6 — different thread)

The **map-into-Stoa fold election is CLOSED: stand apart, on principle.** The map remains a sibling surface. Reason: the fold *"fails on the consent question"* — map-present practitioners consented to geographic visibility, not to display alongside free-text claims and a contact channel; folding *"would retroactively expand the scope of what map-present practitioners consented to, without their act."* One-entry-per-practitioner governs the Stoa's internal structure, not every surface showing presence.

**Permitted, at the practitioner's election only:** a practitioner holding both an active Stoa declaration and a map opt-in **may** link their map presence to their Stoa entry — *"at their election, not by default... The link is their act. Its absence is also their act."* That optional link is a small, separate, unscheduled build item; it is not part of this thread.
