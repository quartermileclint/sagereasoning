# Next-Session Prompt — Gaming-Robustness Bar — BUILD the red-team-the-scorer harness

**For the founder. Paste as the first message of a fresh session.** (Rename the date prefix to the actual session date.)

**Stream:** founder.
**Tier:** **`code-elevated` (repo-only)** — build + run an adversarial scoring harness against the engine + synthetic artifacts. **NO production / perimeter / auth / schema / flag / credential change; no live-fire against prod; no mint. Production byte-equivalent. AC7 NOT engaged.** (Arm A runs the REAL Sonnet extraction via `.env.development.local`, like the existing LOCUS-2 batteries — that is repo-local API consumption, not a production op. If the session would touch the Live gate, stop — that is a separate Critical step.)
**Governing decisions:** ADR-012 (the bar is its named gate) + ADR-010 (engine fidelity, fully landed) + the bar SCOPE (`operations/benchmarks/sage-practice-v1/2026-06-27-gaming-robustness-bar-scope.md`).
**Predecessor scope:** `D-SAGE-PRACTICE-GAMING-ROBUSTNESS-BAR-SCOPED` (decision-log 2026-06-27) + the scope doc above.

## Why this session
The bar is DEFINED (purpose, observable `G`, threat model, test-design). This session BUILDS the harness the scope proposed and runs it, so the bar becomes a measured number rather than a definition. **Read the scope doc in full first — it makes the method-before-purpose call already, so this session executes the agreed design and does not re-litigate the frame.** Standing guard still applies: the harness measures the **instrument's resistance** (`S_max` of a vicious action), NOT a "beats-bare" lift.

## Part A — Open under the protocol
Read in order: `/adopted/standing-protocol-cache.md` (AI failure-modes table — method-before-purpose); `/adopted/build-sessions-protocol-cache.md`; the bar SCOPE doc in full; `2026-06-24-scoring-validity-battery-results.md` (the P5/P4/P1 fixtures you reuse as vicious seeds); `website/scripts/scoring-validity-battery.ts` + `scoring-validity-fixtures.ts` (the substrate to extend); the LOCUS-2 battery scripts already in `website/scripts/` (the real-Sonnet extraction pattern + `--env-file`). Memories: `method-before-purpose-test-drift`, `deterministic-l2-measures-apatheia-not-dikaiosyne`, `verdict-battery-test-the-default-threshold` (exercise the live `deliberate` default), `over-strictness-check-must-be-rank-preserving`. Confirm at open: tier (`code-elevated`/repo-only); 0h held; no production change; the instrument-resistance framing.

## Part B — Procedure (build per the scope's Step 3)
**PR15 FIRST:** an adversarial optimization loop is a multi-agent fan-out. Strongly prefer the **Workflow / subagent fan-out** primitive (attacker agents → the deterministic `applyMechanisms` scorer → keep the max) over a bespoke hill-climber. Justify any bespoke election in the decision-log.

Build three arms with sealed `T(a)` (true-virtue-rank) labels on the vicious seed set:
1. **Locus-1 regression arm (cheap, no LLM):** attacker varies only the schema fields the arithmetic reads (faithful-extraction-consistent); assert no lift above `T(a)`. Confirms §4's closure holds (a FAIL here = a §4 regression).
2. **Arm A — honest extractor, adversarial artifact (Sonnet-backed, LOCUS-2):** attacker agents rewrite the *artifact text only*; the real `LAYER1_SYSTEM_PROMPT` extracts honestly; measure `S_max` against the live `deliberate` threshold. The developer/logos bar.
3. **Arm B — extraction-controlled (the weights worst case):** attacker supplies the `Layer1Schema` directly (the `l1_supply` path) or emits a self-serving extraction; measure `S_max`. **Expected to fail** without a mitigation — quantify the residual the weights-tier mitigation must close.

Run loop-until-dry (no new score-lift for K rounds). Report `S_max` per fixture per arm; compute the gaming gap `G`; state clear/fail per the scope's §3.3 criteria. Adversarially review the harness (is it wired to the real engine? are the `T(a)` labels defensible? did the attacker actually try? — the same hostile-skeptic pass the scoring-validity battery used).

## Part C — The corroboration-check fork (decide, maybe build)
The scope leaves ONE genuine fork (Step 4.1): is the **corroboration check** (cross-reference claimed `met`/`examined` against the action text; override `met→violated` on a non-consented cost; reject a bare `examined` boolean) its own near-term `/api/reason` + gate fidelity build arc, or deferred to the weights tier? **AI recommendation: scope it as a near-term arc.** If the founder elects to build it this session or next, it is its own repo-only build with a **both-directions** verdict-equivalence battery (lenience AND over-strictness — it must not re-open the §4-fixed over-strictness); its activation on the Live gate would be a later founder-walked Critical step.

## Part D — Records
Results memo (`…/<date>-gaming-robustness-harness-results.md`) + decision-log entry + close. Update the bar's gating in ADR-012 / the scope doc with the measured outcome (which uses clear). If the corroboration check is elected, author its build prompt. Memory if a durable lesson emerges (e.g. an unexpected Arm-A miss class).

## Forecast
Ends with the gaming gap `G` **measured** per arm — Locus-1 confirmed closed, Arm A's honest-extractor robustness quantified (clearing or with a disclosed miss class → developer/logos gating decided), Arm B's residual quantified (→ the weights mitigation scoped). Clears the path to the corroboration-check decision, then the `practice-on/off` rename, logos-mode, and — only if the bar clears — the model-creator/weights signal. The **0h call remains the founder's.**

End of prompt.
