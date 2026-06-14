# Session Close — 2026-06-14 — Mechanism-Correction M8: credential-consolidation design (CI-14 ADR)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`.
**Tier:** `governance` — **Standard** (an ADR + design documents; no code/schema/flag touched). Lean template.
**Date:** 2026-06-14.
**Predecessor close:** `operations/handoffs/founder/2026-06-14-mechanism-correction-M7-trajectory-activation-close.md`.

## What this session did

**M8 is the last item of the approved mechanism-correction arc, and it is a design session — this close ends the arc.** Founder-elected scope at open: **documents-only** (the trajectory-retention sweep was scoped, not built).

- **Authored the CI-14 ADR** — `adopted/adr/2026-06-14-credential-consolidation.md` (**Proposed; Accepted on your commit**). Reconciles the three credential classes (`sr_live_` ecosystem key / `sr_inst_` per-install / `sr_assent_` accreditation-write) into a single **Unified Practice Credential (UPC)**: one `public.api_keys` row keyed on the K1 composite `(owner_user_id, agent_id)`, a `capabilities TEXT[]` set `{consult, l1_supply, accreditation_write, calling, reflect}` **replacing** the `purpose` discriminator, the opaque-bearer/SHA-256/`is_active` primitive **retained verbatim**, and the three validators collapsed into one `validatePracticeCredential` chokepoint. Realises **SR-14's "one credential across the practice"** (already partially shipped — `sr_assent_` is reused unscoped for calling+reflect; this extends it to consult+l1-supply) and **closes the FX-3 regression class + FX-17 by construction** (no second credential to switch to mid-practice; `l1_supply` rides every consult-capable credential).
- **States both CI-14 founder-verification requirements explicitly:** the **migration path for existing credentials** (7 additive/reversible/flag-gated steps; every issued token keeps validating via `COALESCE(capabilities, preset_for(purpose))` zero-backfill parity) and **the FX-3 regression class it closes**.
- **Folded the `sr_live_`-owner backfill** (M6/M7 follow-up (a)) into the ADR's migration path via a new declared **`owner_kind`** column (`operator` | `external_consumer`) — turning today's ambiguous null-`owner_user_id` (the legacy admin mint omits it) into an auditable invariant that routes data-rights correctly and feeds honest `credential_basis`.
- **Scoped the trajectory-retention sweep** — `operations/p1-rebuild-2026-06/trajectory-retention-sweep-scope.md` (the **M6-P2 gate**): a universal `retain_until < now()` purge mirroring the M1 narrative-sweep, behind a dedicated `SUBSTRATE_TRAJECTORY_SWEEP_ENABLED` kill-switch so it can go live *before* M6-P2; full activation sequence + the Standard-vs-Critical classification tension named.
- **Named the activation sequence + confirmed CI-16 parked** (see Next Session Should).
- **PR15 honoured:** Plugin per-install auth / MCP server auth / managed-agent Vault all reviewed — none is an *issuer* SageReasoning can adopt; the A10 token-format ADR's bespoke opaque-bearer election (instant revocation + per-key quota) is reaffirmed; a VC/AP2 primitive belongs only on the deferred portable creator-credential Surface-2.

**Method (ultracode):** an 8-agent path-check (every credential class verified at `file:line`), a 3-architect + judge **design panel** (all three independently converged on the UPC — strong corroboration; the judge synthesised base + grafts), and a 4-dimension **adversarial review** that surfaced one **major** internal-consistency finding (the backfill mapped ecosystem → `{consult}`, which would 403 existing keys' L1 supply and restate FX-3 — fixed to `{consult, l1_supply}`) plus precision fixes (all applied; all citations verified against the actual code).

## Decisions Made
- `D-MECHANISM-CORRECTION-M8-CREDENTIAL-CONSOLIDATION-DESIGN-2026-06-14` appended. CI-14 ADR adopted (design-only); the `sr_live_`-owner backfill designed; the trajectory-retention sweep scoped; the mechanism-correction build arc closed. No production change.

## Status Changes
| Item | Old | New |
|---|---|---|
| CI-14 credential consolidation | Scoped (build-plan, approved) | **Designed** — ADR adopted on commit; build = separate Critical track |
| Trajectory-retention sweep (the M6-P2 gate) | named (M6 follow-up) | **Scoped** (build is a small later Standard step) |
| `sr_live_`-owner backfill (M6/M7 follow-up) | named | **Designed** (folded into the ADR migration path via `owner_kind`) |
| Mechanism-correction build arc (CI-1…CI-17, M1–M8) | M7 built | **Design complete / arc closed** — only the credential build, the sweep build, the founder-elected activations, and parked CI-16 remain |

## Next Session Should
**There is no M9 — the arc is closed.** The remaining work is founder-elected, each its own step:
1. **Trajectory-retention sweep build** (small, `code-standard`; scope at `operations/p1-rebuild-2026-06/trajectory-retention-sweep-scope.md`) — **unblocks M6-P2**.
2. **The activation sequence:** trajectory-retention sweep (build + `SUBSTRATE_TRAJECTORY_SWEEP_ENABLED` + the `vercel.json` cron) → **M6-P2** (`SUBSTRATE_TRAJECTORY_WRITE_ENABLED` in prod) → **M7 read** (`SUBSTRATE_TRAJECTORY_READ_ENABLED` in prod) → optionally the **CI-15 docs-flip** (the M5 staged "where your trajectory is known" conditional → operational, now that M7 surfaces `typical_proximity`) + the carried **M1/M3/M4/M5** staged-doc/flag activations.
3. **The credential-consolidation build** — its own **Critical-track** session(s) (AC7 + PR6, full 0c-ii); the new ADR **is** its spec; the acceptance proof is the leg-B three-credential→one-credential replay.
4. **CI-16 stays parked** (the gate-engine architecture decision).

## Blocked On
**Files remaining uncommitted (the founder commits by name; the AI did no git ops):**
- `adopted/adr/2026-06-14-credential-consolidation.md` (NEW — the CI-14 ADR)
- `operations/p1-rebuild-2026-06/trajectory-retention-sweep-scope.md` (NEW — the sweep scope)
- this close; the decision-log entry; the CLAUDE.md production-state refresh
- **Exclude:** `website/tsconfig.tsbuildinfo`; never stage `.env*`.

**Production state at session close:** **unchanged** from the M7 state — M8 is documents-only (no code/schema/flag). `agent_assessment_history` remains migrated-but-inert on prod (P1; write flag UNSET); both trajectory flags UNSET; the four R20a flags `true`; CI-10 Live. The CI-14 build does not touch auth — nothing on the credential surface changed.

## Open Questions
- **The CI-14 build is a Critical track** carrying the residual risks the review named: the single-validator-chokepoint blast radius (mitigated by the dark-ship flag + exhaustive parity); the leaked-credential blast radius (mitigated by least-privilege write-class defaults + instant revocation); `agent_identity` normalisation debt (legacy free-form ids grandfathered); `owner_kind` mis-classification (default external; require explicit promotion); the unique-index duplicate-pair pre-check. All recorded in the ADR.
- **Carried (unchanged):** the M1/M3/M4/M5 flag activations + staged-docs; the M6-P2 + M7 read-flag activations (gated on the sweep); the M4 CI-9 replay-ack; `/api/keys` 100/100/1 vs 30/1/1 (now also folded into the ADR's mint-default discussion); the leg-B seed-row; **the 0h call**.

## Founder Verification
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsc --noEmit
```
Expected: tsc silent (documents-only — already verified clean this session, exit 0). Then read `adopted/adr/2026-06-14-credential-consolidation.md` and confirm it states (a) the migration path for existing credentials and (b) the FX-3 regression class it closes (CI-14 founder-verification). Then commit the files above and push via GitHub Desktop. **Vercel deploy is behaviourally inert** — no code/schema/flag changed.

## Cross-references
- `operations/handoffs/founder/2026-06-14-mechanism-correction-M8-credential-consolidation-NEXT-SESSION-PROMPT.md` (the prompt this close answers)
- `adopted/adr/2026-06-14-credential-consolidation.md` (the CI-14 ADR) + `operations/p1-rebuild-2026-06/trajectory-retention-sweep-scope.md` (the sweep scope)
- `D-MECHANISM-CORRECTION-M8-CREDENTIAL-CONSOLIDATION-DESIGN-2026-06-14`
- `adopted/adr/2026-05-26-credential-scope-and-coverage-status.md` (K1) + `adopted/adr/2026-06-03-a10-token-format.md` (A10)
- `operations/p1-rebuild-2026-06/mechanism-correction-build-plan.md` (CI-14 = M8; the arc)

*End of session close. M8 authored the CI-14 Unified-Practice-Credential ADR (design-only; Accepted on commit), folded the `sr_live_`-owner backfill into its migration path, and scoped the trajectory-retention sweep — closing the mechanism-correction build arc. The remaining work is the founder-elected activations, the trajectory-retention-sweep build (the M6-P2 gate), the credential-consolidation build on its own Critical track, and parked CI-16. Production untouched.*
