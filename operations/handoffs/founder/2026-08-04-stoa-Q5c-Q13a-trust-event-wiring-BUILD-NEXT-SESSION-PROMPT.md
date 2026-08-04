# Next-Session Prompt — Stoa Q5c/Q13a trust-event wiring (BUILD, dark)

**Stream:** founder. **Tier:** `code-critical` (new trust-event types + a schema migration on the append-only ledger; 0d-ii applies). **Built dark; activation is a SEPARATE founder-walked session — nothing here is pre-approved for production.**

## Read first, in this order

1. `/adopted/standing-protocol-cache.md` (session protocol).
2. **`operations/connective-layer-2026-08/2026-08-04-mentor-consultation-stoa-followups-verbatim.md` — BINDING. Verbatim wins over every summary, including the scoped plan and this prompt.**
3. `operations/handoffs/founder/2026-08-03-stoa-Q5c-Q13a-trust-event-wiring-SCOPED.md` — the scoped plan with the four settled founder elections (E1–E4). **This is the spec; the design questions are closed.**
4. `operations/decision-log.md` → `D-STOA-ST7-FOLLOWUP-MENTOR-VERDICTS-ADOPTED-2026-08-04`.
5. The 2026-08-02 verbatim record (Q5c + Q13a themselves) for the underlying rulings.

## The settled spec (do NOT re-litigate)

**Three event types, locked as CHECK literals:**
| Literal | Domain | Effect | Fires when |
|---|---|---|---|
| `stoa-claim-contradicted-oversight` | `oversight` | decrease | the claim was simply false regardless of who was affected |
| `stoa-claim-contradicted-dikaiosyne` | `dikaiosyne` | decrease | the contradiction involved treatment of another party |
| `stoa-declaration-diverges-from-calling` | `oversight` | **flag** | the Stoa declaration diverges from the declared calling record |

**Non-negotiables carried from the rulings — a build that violates any of these is wrong even if green:**
- **Domain by content, NEVER severity.** *"Oversight here is not a severity escalation over dikaiosyne. It is a different domain of concern."* **Where both are true, BOTH fire.** No "pick the worse one" logic anywhere.
- **Flag-triggered, NEVER continuous.** Do not build a background comparator over fresh assessments. Ruled out on principle, not cost: continuous comparison gives an agent *"an incentive to manage its entry to match its assessments rather than to declare honestly."*
- **Q13(a) carries `virtue_domain: 'oversight'`, never `null`.** `null` dispatches to `applyReflectAcrossDomains` (`trust-core-store.ts:155`), which writes `reflect_last_honest_at` — the decay modulator — across every domain row, silently *benefiting* the agent from a divergence finding. Invisible from `trust-transition.ts`, where the `flag` effect is a genuine no-op.
- **No structural dedup between the two Q5c events, or between Q5c and Q13a.** Two entries from one root cause is honest. (This does not relax per-event idempotency-on-retry.)
- **Evidentiary bar:** the artifact does the evidentiary work; the submitter supplies only the pairing. *"Concretely contradicts"* = a reader examining both artifact and entry text finds it *"without requiring inference or interpretation."*

**Founder elections (settled 2026-08-04):** E1 admin-only POST intake, no UI · E2 dedicated `SUBSTRATE_STOA_TRUST_EVENTS_ENABLED` alongside `SUBSTRATE_TRUST_CORE_ENABLED`, both required to emit · E3 the three literals above, locked · E4 full slice, all dark.

## Build steps

1. **Types + effects** — three literals in `trust-core/types.ts`; `EVENT_EFFECT` entries in `trust-transition.ts` (decrease/decrease/flag). No new effect class is needed — `flag` already exists and is a correct no-op.
2. **Migration** — additive CHECK widening on `agent_trust_events.event_type`, following `website/supabase-agent-trust-events-s9b-vocabulary-migration.sql` exactly (idempotent, reversible, §VERIFY block). **AUTHORED NOT APPLIED** — applying it TEST→prod is the founder's step, and it must land BEFORE any emitting code goes live.
3. **Derivers** in `derive-trust-events.ts`, shaped like `deriveCallingEvent`: enforce the R18f-parallel artifact rule; the asserted domain is an INPUT, never inferred; return `null` honestly when the standard is not met (never fabricate an event).
4. **Admin intake route** — `POST`, admin-gated, no UI. **Confirm which admin gate first** (`ADMIN_EMAILS` allowlist vs `FOUNDER_USER_ID`) by reading both; they are non-interchangeable and both exist live. Both flags checked before any work (the ST6 precedent: flag-off does nothing, not even parse).
5. **Batteries.** Beyond the usual: pin that both Q5c events can fire together; that domain is never chosen by severity; that `null` domain is impossible for these types; that a flag-event-seeded oversight row reads `has_evidence: false`; that the **A7 AND-guard survives** (`l4-passion-audit.ts:327` gates `higher` on `oversight.hasEvidence`). **Mutation-verify every pin** — house standard, a pin that can't go red isn't a pin.
6. **Boundary battery — the one that needs real thought.** The Stoa↔trust-core separation (#20) is currently structural in BOTH directions. This build **deliberately opens one direction** (an admin path writes trust events referencing a Stoa entry). Re-derive the pins rather than relaxing them: the Stoa's own surfaces must still never read trust state, and nothing about directory presence or use may feed any signal. #20 stands — the mentor did not reopen it.

## Verification

`tsc` 0 · `npm run build` ✓ · new battery green · existing trust-core batteries green (emission-hooks, kathekon, loop-fold, s10, trust-core S1) · the Stoa boundary battery green · **flag-off byte-identity asserted for both flags**.

## PR19

Independent adversarial review before close, as every session in this arc has run. Give particular weight to: whether the domain choice can be influenced by anything resembling severity; whether the intake route can write an event without a real artifact; and whether the boundary battery's one-direction opening leaked anything the other way.

## Not in scope

Activation (a separate founder-walked 0c-ii). Subscriptions (blocked on Resend). The optional map→Stoa link (permitted, unscheduled). The ST6 `support_resources` copy defect — a one-line fix, fold in only if the founder asks.
