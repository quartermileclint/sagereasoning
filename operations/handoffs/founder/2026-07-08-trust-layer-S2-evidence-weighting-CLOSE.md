# Session Close — 2026-07-08 — Trust Layer S2: evidence weighting + verdict confidence (the deterministic weighting lib)

**Stream:** founder.
**Governing frame:** /adopted/session-opening-protocol.md (cached via /adopted/standing-protocol-cache.md).
**Tier:** `code-elevated` — Elevated risk under 0d-ii (new pure-lib modules, not wired to any live path). Lean + Elevated template.
**Date:** 2026-07-08.
**Decision-log entry:** `D-TRUST-LAYER-S2-EVIDENCE-WEIGHTING-BUILT-REVIEW-FOLDED`.

## What shipped (all repo-only; nothing wired, nothing deployed)

Trust Layer S2 — the pure deterministic **evidence-weighting + verdict-confidence** library — is **built, battery-verified (87/0), and adversarially reviewed**. It turns the mentor's binding A5 and A2 answers into code that S3 (the combiner) and S4 (the intervention engine) consume. **No S1 engine change** (S1 batteries re-pass 75/0). **NO schema / prod / flag / perimeter / auth change; production byte-equivalent until push.** The AI performed no Supabase/Vercel/git op.

- **A5 — `confidence-tiers.ts`:** `assessConfidence(dims | null)` scores a signed examination verdict onto one of the seven canonical confidence tiers via a **max-of-floors** realisation of the verbatim rule "Depth > Signature > Corroboration > Recency, each a multiplier, **the weakest dimension sets the ceiling**" (unsigned → tier 6 hard gate; null → tier 7 profile-prior; each dropped dimension imposes a distinct floor, the worst wins). Returns tier + a DERIVED monotone weight scalar + the `ceilingDimension`. Reuses `ReasonDepth` (depth) + `CorroborationFindingStatus` (corroboration) via type-only imports (battery stays bare-runnable).
- **A2 — `evidence-weighting.ts`:** `domainDistance` = Σ|Δweights| (verbatim); per-dimension credential transfer `τ_d` = normalised agreement (reproduces the mentor's data-analysis→communication example; a credential that never exercised a required domain transfers 0); the deployer zero-confidence floor (per-domain + optional total-distance cutoff); the enforcement primitives `credentialCanContribute` + `weighEvidence`; the three evidence tiers (credential > behavioural condition-matched > profile-prior); the justice-surface modifier. **The load-bearing safety property is structural:** a credential source is a discriminated union that REQUIRES its transfer (compile-time), and `weighEvidence` hard-zeroes a zeroed required domain before any tier/confidence/justice factor — "a zero-confidence credential can never contribute to a proceed verdict on a task requiring that domain," domain-scoped.

## Confirmations at open
Tier `code-elevated`; P0 0h active (R&D-phase, repo-only); model N/A (no LLM calls); KG-EX1 governs the battery (KG1/KG7 N/A — no DB writes); binding spec = the verbatim mentor A2/A5 (verbatim wins over the ADR).

## Status Changes
| Item | Old | New |
|---|---|---|
| Trust Layer arc — Phase 1 | S1 built dark | S2 built (pure lib) |
| `confidence-tiers.ts` (A5) / `evidence-weighting.ts` (A2) | — | Wired (pure lib, battery-verified) — S3/S4 consume |
| A2 zero-floor enforcement | (spec only) | Structural (discriminated-union + hard-zero, compile-time locked) |
| S3 combiner | — | Scoped (prompt authored) |

## Verification Method Used (AI-run, all green)
- `npx tsx src/lib/substrate/trust-core/__tests__/s2-evidence-weighting.test.ts` → **87 passed, 0 failed** (the seven A5 exemplars land exactly; the weakest-dimension-ceiling property; contradicted→tier3; the derived weight scalar strictly decreasing; `domainDistance` = Σ|Δweights|; the mentor's transfer example + the zero-exercise boundary + the both-zero fold; the deployer zero-floor domain-scoped; **the load-bearing enforcement — a zeroed credential contributes 0 even at tier-1/tier-1**; the compile-time enforcement lock via `@ts-expect-error`; evidence-tier ordering; the justice deficit lowers-never-zeroes; monotonicity in every dimension).
- `npx tsx src/lib/substrate/trust-core/__tests__/trust-core.test.ts` → **75 passed, 0 failed** (S1 regression — no S1 engine change).
- `npx tsc --noEmit` → 0; `npm run build` → 0 (no registered file changed; run for insurance).

## Adversarial Review (Risk Record)
A 4-dimension Workflow (A5 fidelity / A2 distance + zero-floor enforcement / monotonicity-never-beats-bare / claims-vs-code), each finding adversarially verified — **completed fully** (7 agents, 0 errors, ~1.33M subagent tokens; the S0a/S0b/S1 account-limit exhaustion did not recur this time). **3 findings, 2 refuted, 1 surviving LOW — all resolved.** The two substantive findings were **pre-empted first-hand** before the review returned: a CRITICAL A2 fail-open (`&& input.transfer` gated the floor) → closed by the discriminated union (verifier: "cannot occur on any path"); a MEDIUM both-zero boundary → folded to `if (c === 0) return 0` + a regression test (verifier ran the exact scenario → weight 0). The surviving LOW was a doc drift my both-zero fold left behind (a stale `transferFactorForDomain` JSDoc) → corrected. A5-fidelity + monotonicity returned CLEAN. No confirmed critical/high/medium survives. **Honest note:** the two substantive findings were raised against the pre-hardening code (the finders launched before my proactive fixes) — the review's value here was independent *corroboration* of the fixes plus catching the residual doc drift.

## Next Session Should
**S3 — the multi-source combiner** (mentor A1). `code-elevated` for the pure combiner; **Critical at wiring** (the LLM second-reader = a real Anthropic call on a live surface, and any live decision-path wiring). Build the A1 router (default / justice-pre-corrob / justice-post-corrob, routing on the corroboration key), the agree/conflict resolver (**conflict → pause, never average**), the cross-session per-domain weighted-recency fold, and the spec-6 aggregate refinement of S1's `computeAggregate` — consuming S2's `weighEvidence` / confidence tiers. **Honor the S2→S3 handoff:** a `contributes === false` (zeroed) credential counts as NO coverage for that domain; a domain whose only evidence is zeroed falls back to profile-prior. Prompt: `operations/handoffs/founder/2026-07-08-trust-layer-S3-combiner-NEXT-SESSION-PROMPT.md`. Estimated ~4–5.5 h. S2+S3 parallelizable after S1; S5–S7 parallelizable with S4.

## Blocked On
**Files remaining uncommitted (this session's commit set):**
- `website/src/lib/substrate/trust-core/confidence-tiers.ts` (NEW)
- `website/src/lib/substrate/trust-core/evidence-weighting.ts` (NEW)
- `website/src/lib/substrate/trust-core/index.ts` (exports)
- `website/src/lib/substrate/trust-core/__tests__/s2-evidence-weighting.test.ts` (NEW)
- `operations/decision-log.md` (the S2 entry)
- `operations/handoffs/founder/2026-07-08-trust-layer-S2-evidence-weighting-NEXT-SESSION-PROMPT.md` (marked SPENT)
- `operations/handoffs/founder/2026-07-08-trust-layer-S2-evidence-weighting-CLOSE.md` (this file)
- `operations/handoffs/founder/2026-07-08-trust-layer-S3-combiner-NEXT-SESSION-PROMPT.md` (NEW)
- `CLAUDE.md` (PR18 production-state refresh)
- the memory file + `MEMORY.md` pointer (if committed with the repo — memory lives outside the repo tree)

**Production state at session close:** byte-equivalent. On push, Vercel deploys two new pure library files + one index export + a test — none wired to any route/page/flag. `SUBSTRATE_TRUST_CORE_ENABLED` remains UNSET; `SUBSTRATE_CORROBORATION_CHECK_ENABLED` + `SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED` remain `true` (untouched). R18f / R20a / distress / Layer-2 signing / UPC auth untouched. AC7 not engaged.

## Founder Verification (Between Sessions)
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsx src/lib/substrate/trust-core/__tests__/s2-evidence-weighting.test.ts
npx tsx src/lib/substrate/trust-core/__tests__/trust-core.test.ts
npx tsc --noEmit && npm run build
```
Expected: `87 passed, 0 failed` / `75 passed, 0 failed` / tsc 0 / build 0. Then commit the file list above and push via GitHub Desktop. Vercel will deploy the pure lib (no behaviour change — nothing consumes it yet).

## Rollback
`git revert` the build commit — a pure lib + tests; nothing deploys, no schema, no flag set, no S1 file changed.

## Orchestration Reminder
Phase 1 of the Trust Layer arc: S1 built dark (migration TEST+PROD-inert); **S2 built (this session)**. S3 (combiner, Critical at wiring) is next; S4 (intervention engine, MEASURE) follows; S5–S7 (discernment) parallelizable with S4. Binding enforcement is S11 (a separate founder-walked activation — nothing here pre-approves it). Weights BLOCKED throughout; the 0h call remains the founder's.

## Cross-references
- `operations/handoffs/founder/2026-07-08-trust-layer-S1-trust-state-CLOSE.md` (predecessor close)
- `operations/handoffs/founder/2026-07-08-trust-layer-S2-evidence-weighting-NEXT-SESSION-PROMPT.md` (the executed prompt, SPENT)
- `operations/handoffs/founder/2026-07-08-trust-layer-S3-combiner-NEXT-SESSION-PROMPT.md` (S3 next)
- `adopted/adr/2026-07-08-sage-trust-layer.md` (ADR-013 §3 row 2 + §5 A2/A5 — the spec)
- `operations/trust-layer-2026-07/2026-07-07-mentor-nine-answers-verbatim.md` (A2/A5 binding)
- `D-TRUST-LAYER-S2-EVIDENCE-WEIGHTING-BUILT-REVIEW-FOLDED`

*End of session close. The A5 confidence tiers and A2 domain-distance/zero-floor are built, battery-verified, and review-folded; the load-bearing enforcement is compile-time structural; S3 (the combiner) builds the multi-source routing + conflict-pause on top.*
