# Next-Session Prompt — ADR-010 §3 Guardrail Bridge Retirement (the gated Step 5) — evaluate + decide

**For the founder. Paste as the first message of a fresh session.** (Rename the date prefix to the actual session date if you like.)

**Stream:** founder.
**Tier:** **`code-critical`** — touches the Live `/api/guardrail` verdict path (re-couples it to the §4 native engine and removes the §3 LLM bridge). **Full Critical Change Protocol (0c-ii); every prod step is the founder's (PR17).** AC7 engaged (a code change + a re-run gate battery + a live smoke + possibly a deploy).
**Governing decisions:** ADR-010 §3 (the bridge) + §4 (native weighting, now LIVE) + the bridge-retirement gate (`adopted/adr/2026-06-19-stoic-fidelity-dikaiosyne-weighting.md`).
**Predecessor close:** `operations/handoffs/founder/2026-06-25-adr010-section4-FLAG-FLIP-ACTIVATION-CLOSE.md`.

## Carried state — what IS done (the §4 engine is LIVE; the bridge is the only remaining ADR-010 cleanup)
- **ADR-010 §4 native dikaiosyne weighting is LIVE on `/api/reason`** (`SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED=true`, 2026-06-25). A calm injustice scores `reflexive` natively; the signed assessment carries `proximity_floors` + per-circle `obligation_assessment`. R18 contract published (15 extensions). Verified live.
- **The `/api/guardrail` gate is DECOUPLED + still on the §3 LLM bridge** — `guardrail-sandwich.ts` pins `applyMechanisms(schema, { dikaiosyneWeighting: false })` (INV-15a/b/c), so the gate floors justice via the §3 bridge (`justiceCheckScope` / `resolveJusticeObligation` [one bounded Sonnet call] / `applyJusticeFloor`), NOT the §4 engine. **This is intentional belt-and-braces — the bridge was kept because the §4 native dikaiosyne trigger was potentially narrower than the bridge's `kathekon moderate|strong` firing (the P5e role-only circle-free class).**
- **The retirement gate is now mostly cleared:** the higher-N (N=8) full-sandwich LOCUS-2 battery (`scripts/locus2-sandwich-battery.ts`, `LOCUS2_REPRO_RUNS=8`) read `bridge_retirement_equivalence_ok:true` (role-framed/gamed injustices reliably surfaced a violated circle natively) AND `over_strictness_fails:0` — so on this sample the native §4 path covers what the bridge caught, without over-flooring good actions. Evidence: `operations/benchmarks/sage-practice-v1/2026-06-25-adr010-section4-locus2-battery-N8-preflip.txt`.

## The decision this session makes
**Retire the §3 bridge (re-couple the gate to the §4 native engine) OR keep it (document the conservatism).** Retiring removes one bounded LLM call per justice-signalled guardrail action (latency + cost) and removes the disclosed non-reproducibility on those gate verdicts (the §4 floor is folded into the *signed* proximity, so a re-coupled gate verdict becomes fully reproducible). Keeping it costs nothing material (decoupled, free belt-and-braces). **The decouple means retirement is never forced — conservative-keep is a fully defensible outcome.**

**Mechanism of retirement (if elected):** the bridge is not "deleted into a gap" — the §4 native weighting REPLACES it. Concretely: flip `guardrail-sandwich.ts` to `applyMechanisms(schema, { dikaiosyneWeighting: true })` (so the gate uses native per-domain proximity + the obligation_assessment the Layer-1 prompt already extracts — the prompt change is unconditional, so the gate's extraction already emits the field), then remove the now-dead `justiceCheckScope`/`resolveJusticeObligation`/`applyJusticeFloor` path + the `justice_resolution` response field (or keep the field, now sourced from `proximity_floors.dikaiosyne` — a doc decision). INV-15 must be updated/removed in lockstep.

## Part A — Open under the protocol
Read in order: `/adopted/standing-protocol-cache.md`; `/adopted/build-sessions-protocol-cache.md`; this prompt's predecessor close + the N=8 results + ADR-010 (the §3 build record + the §4 record + the bridge-retirement gate); `website/src/lib/guardrail-sandwich.ts` (the bridge + the decouple pin) first-hand. Confirm at open: tier `code-critical`; 0h held; AC1; model selection; the founder election below.

## Part B — Procedure (founder-walked; the AI guides + verifies)
### Step 1 — Higher-N confirmation (N≥10)
Run `LOCUS2_REPRO_RUNS=10 npx tsx --env-file=.env.development.local scripts/locus2-sandwich-battery.ts` (real Sonnet, a few minutes / a few $). **Gate:** `bridge_retirement_equivalence_ok:true` AND `over_strictness_fails:0` AND `lenience_fails:0`. If equivalence wavers at N=10 (a role-framed injustice fails to surface a circle on some run) → **KEEP the bridge**, document the residual as a deliberate live conservatism, close the item. Skip to Step 5-keep.
### Step 2 — Founder election: retire or keep
Present the N=10 result. The founder elects. Conservative-keep is defensible even on a clean run (the bridge is free).
### Step 3 (retire only) — Re-couple the gate to the §4 engine + remove the bridge
In `guardrail-sandwich.ts`: set `dikaiosyneWeighting: true`; remove the §3 bridge functions + the second Sonnet call; reconcile the `justice_resolution` response field (drop, or re-source from `proximity_floors`); update/remove INV-15 + the guardrail-sandwich tests. `tsc` + `npm run build` 0; `guardrail-sandwich.test.ts` green.
### Step 4 (retire only) — The MANDATORY gate verdict-equivalence battery
Re-run `scripts/guardrail-verdict-equivalence-battery.ts` (real Sonnet). **U2 marketing-spam MUST still block via the native path** (now `justice=violated` from the obligation_assessment, not the bridge); 0 unsafe leaks. **This is the hard gate — do NOT deploy if any unsafe leak appears.**
### Step 5 — Deploy + live smoke (retire) / record (keep)
**Retire:** the founder pushes the code → Vercel green → live `/api/guardrail` smoke (U2 → `proceed:false`; the verdict now reproducible from the signed assessment). **Keep:** record the decision; no deploy.
### Step 6 — Adversarial pre-change review (retire only)
A focused review (the established pattern): flag-equivalence (does the re-coupled gate match the bridge on the battery set?), no fail-open, reproducibility-now-restored. Fold findings.
### Step 7 — Decision-log + close (full Critical template) + ADR-010 §3 "Expiry" marked done (or the keep-decision recorded) + CLAUDE.md refresh.

## Carried residuals / follow-ups (named)
- After this: the `practice-on`/`practice-off` rename + logos-mode + the model-creator/weights signal are all **gated behind the gaming-robustness bar** (closing the `examined_before_acting` corroboration + resistance to a gamed all-`met` dikaiosyne) — that bar is the next substantive arc, not this session.
- The 0h launch call remains the founder's.

## Critical Change Protocol (0c-ii) — to discharge in-session
What changes (retire): the gate floors justice via the §4 native engine instead of the §3 LLM bridge; one fewer LLM call; the gate verdict becomes reproducible from the signed assessment. What could break: a native-path under-fire that the bridge would have caught (mitigated — the mandatory gate battery + the N≥10 LOCUS-2 equivalence; do NOT deploy on any leak). Existing sessions: only-founder/test logins. Rollback: `git revert` the change → the gate is back on the §3 bridge (re-pin `dikaiosyneWeighting:false`); no flag, byte-revertible. Verification: the gate battery (U2 blocks) + the live smoke. Founder approval: the retire/keep election, the code change, the deploy.

## Forecast
Ends with either the §3 bridge retired (the gate on the §4 native engine, one fewer LLM call, reproducible verdicts, ADR-010 fully landed) or a recorded, defensible keep-decision (the bridge as deliberate belt-and-braces). Either way ADR-010 is closed. The next arc is the gaming-robustness bar (which unblocks the rename + logos + the model-creator signal). The 0h call remains the founder's.

End of prompt.
