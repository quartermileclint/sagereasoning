# Next-Session Prompt — Guardrail **justice-completion bridge** (ADR-010 §3); unblock the #3b/#3c port

**Stream:** founder. **Tier:** **code-critical** (the bridge gates the activation of the Live `/api/guardrail` engine swap).
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`. **Model:** per AC1.
**Why this session exists:** the #3b/#3c guardrail signed-sandwich port (ADR-009) is built dark but its **activation is BLOCKED** — the mandatory verdict-equivalence battery caught the deterministic engine rating a **calmly-reasoned injustice as near-virtuous** (U2: marketing-spam → `principled`/proceed). The mentor root-caused it (apatheia measured as virtue; dikaiosyne under-weighted) and the correction is **adopted (ADR-010)**. This session builds the **near-term justice-completion bridge** so the gate blocks U2, re-runs the battery, and re-activates the port.

## Read at open (in order)
1. `/adopted/standing-protocol-cache.md` (~3 min) — tier, model, risk, signals.
2. **`adopted/adr/2026-06-19-stoic-fidelity-dikaiosyne-weighting.md` (ADR-010)** — the adopted design; **§2 (J1/J2/J3)** + **§3 (the bridge: scope / check / outputs / expiry)** are the spec.
3. `operations/benchmarks/sage-practice-v1/2026-06-19-mentor-consultation-guardrail-fidelity.md` — the verbatim counsel + the **one constraint** (the bridge must *complete* the engine's unresolved output, never be a separate override).
4. `adopted/adr/2026-06-19-guardrail-signed-sandwich-port.md` (ADR-009) — the port being unblocked; §1 (direct wiring), §4 (field table), §Activation (BLOCKED).
5. `/operations/decision-log.md` last 2 entries (the BLOCKED entry + the build entry).
6. The built code: `website/src/lib/guardrail-sandwich.ts` (the port), `website/src/app/api/guardrail/route.ts` (the flag-gated branch), `website/scripts/guardrail-verdict-equivalence-battery.ts` (the gate).

**Re-confirm first-hand at open:** the U2 mechanism (run the battery, or the one-off diagnostic, to see `oikeiosis: circle / obligation_met=null` + `dikaiosyne` tagged + `passions:[]` → `principled`). The diagnosis is the source of truth for the *mechanism*; line numbers may drift.

## The build — the bridge as a *completion* (ADR-010 §3)

In the **port layer** (`guardrail-sandwich.ts`, `deriveGuardrailVerdict` / `runGuardrailSandwich`) — NOT a separate override, and NOT touching `computeProximity` (that is the root correction, a later session):

1. **Scope — fire only when the engine already signalled a justice dimension.** From the `Layer2Assessment`: `oikeiosis.relevant_circles` non-empty, OR `virtue_domains_engaged` includes `dikaiosyne`, OR any relevant circle has `obligation_met === null` (unevaluated), OR (J1) a non-consenting/affected party is present. For U2 the first three all fire. Do **not** fire on every action.
2. **The check — resolve the obligation the engine left open.** A focused, bounded call (a 3-way classification — *met / violated / indeterminate* — far cheaper than the legacy 8192-tok generation; the signed deterministic assessment is unchanged): *does this action meet, violate, or leave genuinely indeterminate the obligation to the identified circle(s)?* Feed it the action + the identified circle(s) + the value-error finding (J3 input). Keep it bounded (low max_tokens, structured output).
3. **The outputs — floor the verdict (this is the justice domain reading):**
   - **met → no adjustment** (the existing proximity stands).
   - **violated → proximity floors at `reflexive`** ⇒ `proceed:false`, `recommendation:'do_not_proceed'` (U2 → blocked).
   - **indeterminate → proximity capped at `deliberate`** (never advanced to `principled`+; the unresolved justice question is itself a finding).
   This composes with the existing **kathekon floor** (the floor that is more conservative wins).
4. **Honesty:** the gate verdict is now "signed deterministic assessment **+** a bounded justice resolution" — surface a `justice_resolution: {circle, obligation: met|violated|indeterminate}` field (R10) so it's not a hidden override. Keep `engine_attribution` + the signed assessment.
5. **Flag:** keep the existing `SUBSTRATE_GUARDRAIL_SANDWICH_ENABLED` (the bridge is part of the port). Flag-off byte-identity must still hold (the bridge lives inside the flag-on branch). Consider a sub-flag only if the founder wants the justice check independently togglable.
6. **Expiry note in code + ADR-010:** mark the bridge retired-when the root correction (ADR-010 §4) lands.

## Verify
- `tsc` 0; `npm run build` 0 (`/api/guardrail` registered).
- New bridge unit tests (pure where possible): the scope predicate fires on a justice-signalled assessment; violated → reflexive floor → `proceed:false`; indeterminate → deliberate cap; met → no change; composes with the kathekon floor; flag-off byte-identity preserved (extend `guardrail-sandwich.test.ts` + the route INV).
- **Re-run the battery** (`npx tsx --env-file=.env.development.local scripts/guardrail-verdict-equivalence-battery.ts`): **U2 must now block** (no unsafe leak), the benign set must still proceed (no over-blocking), the other unsafe set still blocks. Add a couple of new other-harm fixtures (a consent/justice case that's *met*, and a genuinely *indeterminate* one) to exercise all three outputs.
- **Adversarial pre-activation review** (ultracode, mirror ADR-009's pass) — dimensions incl.: the bridge is a *completion* not an override (the mentor's constraint); flag-off byte-identity; the justice floor never *weakens* a verdict; over-blocking risk (does the bridge now block legitimate other-affecting actions?); the bounded-call cost/latency; signing/determinism of the assessment unchanged.

## Activation (founder-walked, AFTER the battery clears — 0c-ii)
Re-run the battery (U2 blocks, no over-block) → `SUBSTRATE_GUARDRAIL_SANDWICH_ENABLED=true` in Vercel + redeploy + a live verdict-equivalence smoke (run U2 + a benign action against prod; U2 must block, benign must proceed; confirm `engine_attribution:'translation-sandwich'` + `signed_assessment` + `justice_resolution`) → publish the R10 docs (incl. the in-route GET self-doc + the new `justice_resolution` field). **Do not flip the flag before the battery clears** (the standing lesson from the 2026-06-19 attempt).

## Then
Scope the **root correction** (ADR-010 §4 — per-domain proximity + minimum-domain rule in `computeProximity` reusing KP-04; obligation-resolution as a required oikeiosis field) as its own deeper Critical session (touches `/api/reason` determinism; own battery + review); retire the bridge when it lands.

## Anticipated shape
| Phase | Estimate |
|---|---|
| Read ADR-010/009 + mentor record + re-confirm U2 | 20–30 min |
| Build the bridge (scope + check + floor + field + tests) | 1.5–2.5 h |
| Re-run battery + new fixtures | 20–40 min (LLM-bound; the legacy deep calls are slow) |
| Adversarial review + fold | 30–60 min |
| Decision-log + close | 20–30 min |
| **Total** | **~3–5 h** |

## Rollback
The bridge ships inside the existing flag (UNSET in prod) — flag-off is byte-identical; `git revert` removes it. Activation is a separate founder-walked flag flip gated on the battery.

*Open code-critical on `main`. Build the justice-completion bridge per ADR-010 §3 — a completion, not an override — make the battery's U2 block, then re-activate. The root engine correction follows.*
