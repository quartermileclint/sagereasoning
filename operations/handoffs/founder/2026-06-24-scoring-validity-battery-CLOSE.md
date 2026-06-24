# Session Close — 2026-06-24 — Scoring-Validity Battery (the engine-fidelity gate)

**Stream:** founder.
**Governing frame:** /adopted/standing-protocol-cache.md (cached).
**Tier:** `code-elevated` — Elevated risk. **Repo-only** (a `tsx` test harness + synthetic fixtures against existing engine modules). **No production / schema / flag / credential change; no live-fire, no mint. AC7 NOT engaged. Production byte-equivalent to session open.**
**Date:** 2026-06-24.
**Governing decisions:** ADR-012 (the reframe — engine fidelity is the critical path) + ADR-010 §4 (the root fix this scopes).

## What happened
Built + ran the **scoring-validity battery** the ADR-012 reframe named as the next work: does the deterministic scoring engine have the property a measurement instrument needs — *a worse decision earns a worse score, across the four Stoic stages, including adversarially*. The battery (repo-only, no LLM/creds/prod) drives `applyMechanisms` → `computeProximity` + the calling/reflect engines on hand-authored, faithful / maximally-favourable quality-graded fixtures, and "scores the scoring." It **quantified the standing ADR-010 apatheia-not-dikaiosyne gap (+3.0 ranks) and four further engine defects**, was **adversarially verified by a 10-agent workflow** (which independently reproduced the run + confirmed the headline against the source and against ADR-010's first-hand U2 extraction), and **scoped the ADR-010 §4 engine root-fix** as the carried `code-critical` successor. The engine itself was NOT changed (that is §4).

## Decisions Made
- `D-SAGE-PRACTICE-SCORING-VALIDITY-BATTERY-BUILT-RUN-SECTION4-SCOPED` appended. The battery is built + run + adversarially reviewed; ADR-010 §4 is scoped as the next Critical session.

## Status Changes
| Item | Old | New |
|---|---|---|
| Scoring-validity battery | Scoped (predecessor) | **Built + run + adversarially-verified** (repo-only; controls 7/7) |
| Engine-fidelity gap (apatheia/dikaiosyne) | named (ADR-010) | **Quantified: +3.0 ranks; calm injustice → `principled` not `reflexive`** (2/2 probes) |
| Engine defects | 1 named | **5 attributed to code** (D1 dikaiosyne, D2 kathekon-count gaming, D3 no-epistemic-accuracy bound, D4 hasDeliberation proxy, D5 no-andreia/irreversibility) |
| ADR-010 §4 engine root-fix | Adopted-design / Scoped (cleanup→enabling) | **Build spec written** — the carried `code-critical` successor |
| Model-creator/weights gaming bar | asserted (ADR-012) | **Demonstrated reachable**: gamed injustice scores `sage_like`, indistinguishable from a legitimate sage action |

## Next Session Should
Run the **ADR-010 §4 engine root-fix** (`code-critical`) per `operations/benchmarks/sage-practice-v1/2026-06-24-adr010-section4-engine-fix-scope.md`: refactor `computeProximity` to per-domain proximity + the minimum-domain rule (reuse the KP-04 `weakest()` *pattern*) + obligation-resolution as a required oikeiosis field, so calm injustice floors to `reflexive` and the gamed artifacts stop reaching `sage_like`. Shared `/api/reason` determinism → its own fixtures/idempotency + a **full-sandwich verdict-equivalence battery** (where LOCUS 2 / extraction reliability is finally measured, AND the over-strictness/false-positive direction is added) + an adversarial pre-activation review; retire the guardrail justice bridge when it lands. **D4 (`hasDeliberation`) is a separable, low-risk first slice.** After §4 + the gaming-robustness bar: the `sage-on`/`sage-off` → `practice-on`/`practice-off` rename. The battery's P1/P4/P5 fixtures are the §4 known-quality seeds + gaming regression set.

## Blocked On
**Files to commit (this session's deliverables — commit scoped to these; do NOT `git add -A`):**
- `website/scripts/scoring-validity-fixtures.ts` (new)
- `website/scripts/scoring-validity-battery.ts` (new)
- `operations/benchmarks/sage-practice-v1/2026-06-24-scoring-validity-battery-results.md` (new)
- `operations/benchmarks/sage-practice-v1/2026-06-24-adr010-section4-engine-fix-scope.md` (new)
- `operations/decision-log.md` (entry appended)
- `operations/handoffs/founder/2026-06-24-scoring-validity-battery-CLOSE.md` (this file)
- `CLAUDE.md` (PR18 refresh)

**Do NOT commit:** unrelated pre-existing working-tree changes (the many `M`/`??` files from prior sessions in `git status`). The memory files live outside the repo. The `s6-phase2-scratch/` directories are prior-session scratch (a founder teardown call, unchanged this session).

**Production state at session close:** **byte-equivalent to session open.** No mint, no Supabase/Vercel/git op. The two new files are scripts outside the Next build graph. The standing `pre_decision_harness` dogfood marker + the LIVE H1/H2 install untouched; R18f/R20a/distress/Layer-2 signing/UPC auth untouched.

## Open Questions
- **Coverage (named residual, not blocking):** the battery probes calling at 2 of 6 stages + destructive assent with 1 fixture; the four-stage "calling reads role-appropriateness" claim is tested as signal-*detection* fidelity only. Expanding coverage + the over-strictness direction is folded into the §4 successor's full-sandwich battery.

## Verification Method Used
- The battery was **run first-hand** (`npx tsx scripts/scoring-validity-battery.ts`): controls 7/7 OK; apatheia 2/2 at +3.0; `tsc --noEmit` clean on both new files.
- Every load-bearing claim was traced first-hand against `layer2-mechanisms.ts` (`computeProximity:1251`, `assessOikeiosis:940`, `assessKathekon:1069`) before authoring fixtures (PR11 — verify against code, not memory).
- A **10-agent adversarial workflow** (`scoring-validity-adversarial-review`) independently reproduced the run + verified the four claims against the source; its three actionable folds were applied + the battery re-run green.

## Risk Classification Record
**Elevated** under 0d-ii (`code-elevated`): a new repo-only test harness + synthetic fixtures exercising existing engine modules; no change to any engine/route/auth/perimeter behaviour, no new external dependency, no flag/schema/credential. **AC7 NOT engaged. PR6 NOT engaged.** Reversed by `git revert` of the battery commit.

## PR5 Knowledge-Gap Carry-Forward
- **The deterministic engine measures apatheia, not dikaiosyne — now QUANTIFIED (+3 ranks) and code-attributed** (`computeProximity` has no justice term; `obligation_met` is dead-written). The honest profile claim, logos-mode, and the model-creator/weights signal all gate on the ADR-010 §4 fix (memory `deterministic-l2-measures-apatheia-not-dikaiosyne` reinforced).
- **The score is gameable to `sage_like`** by naming kathekon factor-*types* + within-framing — the model-creator/weights Goodhart risk, demonstrated. §4 must clear an adversarial gaming bar (the P5 fixtures are the regression set).
- **A repo-only fidelity battery probes LOCUS 1 only** (the deterministic scorer on a hand-authored extraction); LOCUS 2 (does the real LLM extraction surface the violation) needs the full sandwich — assigned to the §4 successor's verdict-equivalence battery.

## Founder Verification (Between Sessions)
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add website/scripts/scoring-validity-fixtures.ts website/scripts/scoring-validity-battery.ts operations/benchmarks/sage-practice-v1/2026-06-24-scoring-validity-battery-results.md operations/benchmarks/sage-practice-v1/2026-06-24-adr010-section4-engine-fix-scope.md operations/decision-log.md operations/handoffs/founder/2026-06-24-scoring-validity-battery-CLOSE.md CLAUDE.md
git commit -m "Scoring-validity battery (the engine-fidelity gate): repo-only tsx harness scoring the deterministic engine on quality-graded fixtures. Quantifies the apatheia-not-dikaiosyne gap (+3.0 ranks; calm injustice -> principled not reflexive) + 4 further engine defects; gamed injustice reaches sage_like; adversarially verified (10-agent workflow, controls 7/7). Scopes the ADR-010 section-4 engine root-fix as the carried code-critical successor. Repo-only; production byte-equivalent; AC7 not engaged."
```
Then push via GitHub Desktop. **No Vercel change expected** (scripts outside the Next build graph + docs; no `website/src/` or route change). **Do not** `git add -A` (prior-session working-tree changes are not this session's).

## Orchestration Reminder
No credentials minted; nothing standing changed; production byte-equivalent. The §4 engine fix (next session) is **`code-critical`** — shared `/api/reason` determinism; founder-walked, its own battery + review. The **0h launch call remains the founder's.**

## Cross-references
- `operations/benchmarks/sage-practice-v1/2026-06-24-scoring-validity-battery-results.md` (results memo)
- `operations/benchmarks/sage-practice-v1/2026-06-24-adr010-section4-engine-fix-scope.md` (the §4 build spec / next-session content)
- `operations/handoffs/founder/2026-06-24-scoring-validity-battery-NEXT-SESSION-PROMPT.md` (this session's prompt)
- `operations/handoffs/founder/2026-06-24-sage-practice-measurement-reframe-CLOSE.md` (predecessor)
- `operations/decision-log.md` → `D-SAGE-PRACTICE-SCORING-VALIDITY-BATTERY-BUILT-RUN-SECTION4-SCOPED`
- `adopted/adr/2026-06-24-sage-practice-measurement-instrument-reframe.md` (ADR-012) + `adopted/adr/2026-06-19-stoic-fidelity-dikaiosyne-weighting.md` (ADR-010 §4)

*End of session close. The battery turned the ADR-010 finding from a known risk into a quantified, code-attributed, adversarially-verified measurement (apatheia +3 ranks; gaming to sage_like), and handed the §4 engine fix a concrete build spec. The engine — not the hooks or the credential — is the product's critical path, and it now has a fidelity gate. Production is byte-equivalent; the 0h call remains the founder's.*
