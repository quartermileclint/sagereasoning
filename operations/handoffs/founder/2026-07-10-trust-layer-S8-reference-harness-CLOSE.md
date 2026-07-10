# Session Close — 2026-07-10 — Trust Layer S8: the seven-layer reference harness

**Stream:** founder.
**Governing frame:** /adopted/standing-protocol-cache.md + /adopted/build-sessions-protocol-cache.md.
**Tier:** `code-elevated` (the INSTALL is S9's founder-walked `code-critical`). AC7 NOT engaged; AC5 not engaged (agent-facing, recorded).
**Date:** 2026-07-10.
**Decision-log entries:** `D-TRUST-LAYER-S8-REFERENCE-HARNESS-BUILT-DARK-REVIEW-FOLDED` + `D-TRUST-LAYER-S8-INDEPENDENT-REREVIEW-FOLDED` (the same-day independent re-review; discharges this close's original honest limit).

## What shipped

**The seven-layer reference harness — the first LIVE consumer of the S1–S7 trust core — is built, repo-only and DARK, batteries green, and adversarially reviewed (folds applied + pinned).** It generalizes the Gate-1 H1–H4 harness onto the seven-layer anatomy (Execution · Tooling · Context · Lifecycle · Observability · Verification · Governance — the channel-law classification of every step is the new gate deliverable `SEVEN-LAYERS.md`) and wires the S1–S7 trust core + discernment engine + L4 audit into the Verification + Governance layers of a real Claude-Code loop, all **MEASURE**. **This OPENS Phase 3 (the reference harness + dogfood).** NO production change until the founder's push; on push the new route answers 503 (`SUBSTRATE_TRUST_CORE_ENABLED` unset), the trust-core writes stay inert, the hooks are not installed. **ENFORCE is S11.** The AI performed no mint/deploy/flag/install op.

- **`harness-extractors.ts`** (NEW) — the REAL S6/S7 injectable seams against the live Sonnet Layer-1 machinery (`makeRealL4TraceExtractor` — the A7 pipeline + the R18f-parallel signed artifact + a recomputable `traceRef`, throws toward HOLD on every failure; `makeRealDiscernmentExtractor` — L2 Q2.4 circle alignment, misaligned only on positive evidence; `assessConditionMatch` omitted per PR15).
- **`harness-integration.ts`** (NEW) — the turnkeys: `runSpawnDiscernment` (discernment → open+A9-boundary → out-of-band L4 → the boundary injection), `readTrustVerdict` (S1→S3→S4 MEASURE), `closeDelegation` (the A8/A9 event wiring — R18f-verified, explicit-violation-only, capacity-proportional case classification, idempotent). All flag-gated end-to-end + fail-honest.
- **`/api/practice/discernment`** (NEW handler+route, dark) — Bearer-only consult-capability UPC auth; POST bound to `orchestrator_agent_id` (NULL-agent 403); input caps; honest 503/400/401/403; loop metering a named follow-up.
- **The harness tree** — H2 extended (spawn discernment/L4 + A9 boundary prepend; briefed-only-on-delivery), H3 extended (once-per-session trust advisory), **H5 NEW** (`handback-hook.mjs`, PostToolUse delegation hand-back), `lib/discernment.mjs` (config/derive, transcript-tail trace, spawn payload, observability JSONL + OTel-shaped spans), `discernment.config.example.json`, `SEVEN-LAYERS.md`, `KILL-SWITCHES.md`, the README rewrite, the ADR-011 S8 amendment. Un-provisioned = byte-identical to pre-S8.
- **The `practice-on`/`practice-off` rename** — new full-procedure skills (S8-aware; stale-credential blocker surfaced); `sage-on`/`sage-off` reduced to non-acting stubs; the two S6 runbooks annotated.

## Confirmations at open
Tier `code-elevated` (the install is a deferred S9 Critical); P0 0h active (repo-only DARK); model N/A for the deterministic glue (the real extractors reuse the live Sonnet Layer-1 machinery — AC1 Layer-1 row — but make no call this session; the battery injects fakes); KG1 at every flag-gated fail-honest seam; KG-EX1 (instrument-fidelity — the S8 battery asserts the chain composes + channel classifications hold + byte-identity, never beats-bare); AC5 + AC7 NOT engaged; binding specs = ADR-013 §4/§6 + the verbatim mentor A7/A8/A9. MEASURE honored; ENFORCE is S11.

## Status Changes
| Item | Old | New |
|---|---|---|
| Trust Layer arc — Phase 3 (reference harness + dogfood) | (Phase 2 complete) | **OPENED — S8 built (the seven-layer reference harness, DARK/MEASURE)** |
| `harness-extractors.ts` / `harness-integration.ts` | — | Wired (the real seams + the turnkeys; battery-verified 145/0) |
| `/api/practice/discernment` | — | Built dark (503 flag-off; the first live consumer's server surface) |
| Gate-1 harness H5 (PostToolUse hand-back) + H2/H3 S8 extensions | (H1–H4) | Built (registered in `hooks.json` + the canonical backup; NOT installed) |
| `/sage-on` `/sage-off` skills | Live verbs | Renamed → `/practice-on` `/practice-off` (old names non-acting stubs) |
| S9 dogfood install | — | Scoped (prompt authored) — `code-critical`, founder-walked |

## Verification Method Used (AI-run, all green)
- `s8-harness-integration.test.ts` **145/0** (extractors, pure helpers, the spawn/verdict/close turnkeys e2e on the fake client, the route handler).
- Hooks: `logic-harness.mjs` **91/0** (+ the S8 pure helpers, case 16); `negative-battery.mjs` **230/0** (the new `s8-discernment` leg **64** + the fold pins 8b/8f/8g/8h/8i/8j).
- S1–S7 regressions: 75 / 87 / 106 / 417 / 87 / 84 / 122, all 0 failed (no engine change — consumed, not modified).
- `npx tsc --noEmit` → 0; `npm run build` → 0 (`/api/practice/discernment` registered; the `/api/community-map` 42703 is the pre-existing, unrelated log).
- Every hook `.mjs` + the two libs `node --check` clean; `hooks.json` / the backup / the example config all parse.

## Risk Classification Record
`code-elevated` under 0d-ii. Repo-only/dark: no flag, no schema, no migration, no mint, no deploy, no install. Production byte-equivalent until the founder's push; on push the route 503s flag-off, the trust-core writes stay inert (flag unset), the hooks are not installed (the dogfood toggle is OFF; `settings.local.json` is gitignored + untouched). MEASURE — nothing S8 added binds; the only deny remains the pre-existing irreversible-action guard. AC7/AC5/PR6 not engaged. ENFORCE is S11.

## Adversarial Review (Risk Record)
A 6-dimension Workflow (find → adversarially-verify) launched; **2 of 6 finders completed (~1.5M subagent tokens) before the account SESSION LIMIT killed the other 4 finders + both refuters** (resets 3:40pm Brisbane — the disclosed S1/S4/S6 exhaustion pattern). **Per the §4 precedent the review was completed FIRST-HAND** (the two returned findings adjudicated + the four dead dimensions run by hand). **4 substantive findings, ALL folded + regression-pinned:** **F1 (MEDIUM)** the A7 "never self-report" claim was structural only inside the harness — at the route boundary the trace is caller-supplied under the agent-readable credential, so an orchestrator could pre-empt its own L4 audit + the write-once column would keep the gamed record; folded by narrowing the claims (SEVEN-LAYERS.md invariant 1 + the extractor header), adding tamper-EVIDENCE (the l4_commit_note surfaces the write-once refusal in the spawn record + observability + log), and naming the hook-authenticated trace channel as the structural closure (S9/S10 follow-up). **F2 (MEDIUM)** H2 recorded `briefed:true` before the boundary was delivered — a frame outage would leave a falsely-briefed record biasing A9 toward the lenient case-1; folded — briefed/boundary_delivered set ONLY inside the emit, the boundary stored for outage retries, the POST skipped when the frame marker exists. **F3 (MEDIUM-HIGH)** a NULL-agent credential could poison an arbitrary agent's trust record; folded — POST now requires a credential bound to `orchestrator_agent_id`. **F4** unbounded candidates/trace/purpose = a cost vector; folded — input caps. Battery pins for all. The four first-hand dimensions (chain-correctness, extractor-fail-honest, route-security, claims-vs-code incl. the MOCK-vs-real-shape vacuous-pass check) are otherwise CLEAN.

**HONEST LIMIT DISCHARGED (same day, `D-TRUST-LAYER-S8-INDEPENDENT-REREVIEW-FOLDED`).** After the account limit reset, a **fresh** 7-dimension independent Workflow (the six re-run + a dedicated fold-verification dimension; NOT a cached resume — the tree had changed under the folds) **completed fully: 14 agents, 0 errors, ~2.99M tokens.** **All four prior folds VERIFY CORRECT with no regression** (F2's key identity independently traced; F1's tamper-evidence traced end-to-end; F3's 403 precedes all work; F4's caps precede the fan-out), and **four dimensions came back CLEAN** — including claims-vs-code, which re-ran the batteries first-hand and checked the mock-vs-real serialization field-by-field (leg 8 is **not** a vacuous pass; the `verifyLayer2Signature` envelope arg shape is correct). **Five new findings, all folded + pinned; one refuted.** Headline **(G2, LOW)**: `stripInjectedPrefix` used `lastIndexOf`, so a delegated task whose own text contained the injected separator made H5 derive a different spawn key — the delegation was silently never closed and the A8/A9 events never fired, **orchestrator-suppressibly**. Fixed at the root: H2 now writes a **spawn alias** keyed on the exact prompt it emitted; H5 resolves identity → alias → legacy fallback, so the key is never re-derived from orchestrator-controlled text. **(G1, LOW — introduced by the F3 fold)**: the consult credential must be `agent_id`-bound to the config's orchestrator id or every spawn 403s silently — documented across three operator surfaces, and `fetchDiscernment` now carries the server's honest note into the outage log. **(G3, NIT)**: a boundary-less record could finalize → the audit now runs but never commits without an A9 boundary (and the no-record path no longer burns an LLM call). **(G4, NIT)**: `delegationEventsEmitted` overcounted a deduped re-fire → reports what was actually written. **(G5, LOW)**: `signed_assessments` capped at 32. Post-fold gates: negative-battery **230/0** (leg 64), logic-harness 85/0, S8 battery **145/0**, S1–S7 unchanged, tsc 0, build 0.

## Next Session Should
**S9 — the dogfood install + instrument-fidelity validation** (`code-critical`, founder-walked). Elections at open: the discernment-credential isolation (the F1 residual), TEST-first vs straight-to-prod for `SUBSTRATE_TRUST_CORE_ENABLED`, the loop-metering surface-CHECK widening, reflect-persist (gated on the erasure wiring). **G1 adds a hard install requirement:** the loop's **consult** credential must be minted `agent_id`-bound to `discernment.config.json`'s `orchestrator_profile.agentId`, or every spawn 403s and the trust surface silently never runs (now documented + self-explaining in the outage log). The standing dogfood-credential rotation (the stale leg-d token) is a hard pre-req. Then real trust records accumulate under MEASURE + the never-beats-bare validation batteries run. Prompt: `operations/handoffs/founder/2026-07-10-trust-layer-S9-dogfood-install-NEXT-SESSION-PROMPT.md`. Then S10 (the public read surface; AC5 re-check) → S11 (the founder-walked ENFORCE activation — the logos gate).

## Blocked On
**Files remaining uncommitted (this session's commit set):**
- `website/src/lib/substrate/trust-core/harness-extractors.ts` (NEW)
- `website/src/lib/substrate/trust-core/harness-integration.ts` (NEW)
- `website/src/lib/substrate/trust-core/index.ts` (exports)
- `website/src/lib/substrate/trust-core/__tests__/s8-harness-integration.test.ts` (NEW)
- `website/src/app/api/practice/discernment/{handler,route}.ts` (NEW)
- `harness/gate1-pre-decision/claude-code/hooks/{subagent-framing-hook,at-action-hook,handback-hook}.mjs` (handback NEW)
- `harness/gate1-pre-decision/claude-code/hooks/lib/discernment.mjs` (NEW — incl. the G2 spawn-alias `writeSpawnAlias`/`resolveSpawnKey` + the G1 4xx-note diagnostic) + `hooks.json`
- `harness/gate1-pre-decision/claude-code/discernment.config.example.json` (NEW)
- `harness/gate1-pre-decision/{SEVEN-LAYERS,KILL-SWITCHES}.md` (NEW) + `README.md`
- `harness/gate1-pre-decision/test/{mock-reason-server,negative-battery,logic-harness}.mjs`
- `.claude/gate1-hooks-block.json`; `.claude/skills/practice-on/SKILL.md` + `practice-off/SKILL.md` (NEW); `.claude/skills/sage-on/SKILL.md` + `sage-off/SKILL.md` (stubs)
- `adopted/adr/2026-06-20-pre-decision-harness-arc2.md` (S8 amendment)
- `operations/benchmarks/sage-practice-v1/2026-06-22-S6-value-gate-benchmark-spec.md` + `2026-06-23-S6-run-ledger.md` (rename annotations)
- `operations/decision-log.md`; `operations/handoffs/founder/2026-07-10-trust-layer-S8-reference-harness-{CLOSE,NEXT-SESSION-PROMPT}.md`; `operations/handoffs/founder/2026-07-10-trust-layer-S9-dogfood-install-NEXT-SESSION-PROMPT.md`
- `CLAUDE.md` (PR18 refresh); the memory file + `MEMORY.md` pointer (outside the repo tree)

**Production state at session close:** unchanged from the S7 close — the trust-core + collaboration tables exist on TEST + PRODUCTION, empty and inert (`SUBSTRATE_TRUST_CORE_ENABLED` unset). On push, Vercel deploys the new `/api/practice/discernment` route (503 flag-off), the new pure libs, and the harness tree — **no behaviour change** (no live caller; the hooks are not installed; the dogfood toggle is OFF and `settings.local.json` is gitignored). `SUBSTRATE_CORROBORATION_CHECK_ENABLED` + `SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED` remain `true`. R18f / R20a / distress / Layer-2 signing / UPC auth untouched. AC7 not engaged. ENFORCE is S11.

## Founder Verification (Between Sessions)
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
node harness/gate1-pre-decision/test/logic-harness.mjs        # 91 passed, 0 failed
node harness/gate1-pre-decision/test/negative-battery.mjs      # 230 passed, 0 failed — RELEASE GATE: PASS
cd website
npx tsx src/lib/substrate/trust-core/__tests__/s8-harness-integration.test.ts   # 145 passed, 0 failed (Ctrl-C after the summary line — the tsx keepalive hang via security.ts is the known harness ergonomics issue)
npx tsx src/lib/substrate/trust-core/__tests__/s7-l4-passion-audit.test.ts       # 122 (regression)
npx tsc --noEmit && npm run build
```
Then commit the file list above and push via GitHub Desktop. Vercel deploys the dark route + the pure libs + the harness tree (no behaviour change — nothing consumes them until S9 installs + the flag is set).

## Rollback
`git revert` the build commit. `SUBSTRATE_TRUST_CORE_ENABLED` stays unset ⇒ the route 503s and the writes are inert; no flag was set, nothing installed, no schema change. The rename reverts with the commit.

## Open Questions
None blocking. **The close's original "single-perspective first-hand" limit is DISCHARGED** — the independent 7-dimension Workflow re-review completed fully the same day (14 agents, 0 errors), verified all four prior folds, and its five findings are folded + pinned (`D-TRUST-LAYER-S8-INDEPENDENT-REREVIEW-FOLDED`). Disclosed design decisions (recorded in the decision-log entry + the module docstrings): the caller-supplied-trace server-boundary posture (F1 — credential isolation is the boundary; tamper-EVIDENT; a hook-authenticated channel is the structural closure, an S9/S10 follow-up); loop metering deferred (the surface-CHECK widening — an S9 election); the circle-alignment misaligned-only-on-positive-evidence rule + the trust-verdict structural confidence dims (derived, tunable pending S9); the case-3 explicit-harm-absent default (conservative — never the fall-through).

## PR5 Knowledge-Gap Carry-Forward
KG1 (every seam flag-gated + fail-honest; hooks fail open honest — no fake frames, no silent blocks, no fabricated records). KG-EX1 (instrument-fidelity battery — the chain composes; channel classifications hold; byte-identity pinned; never beats-bare). **New durable lesson (saved to memory):** at a server boundary "never self-report" cannot be claimed STRUCTURAL when the input text is caller-supplied under a credential the audited agent can read — narrow the claim to the harness channel, make pre-emption tamper-EVIDENT (surface the write-once refusal), treat credential isolation as the boundary until a hook-authenticated channel exists; AND a delivery-dependent record flag (briefed) must be set only at the point of actual delivery, never at fetch time.

## Orchestration Reminder
**Phase 3 opens with S8 (the reference harness — this session).** S9 = the founder-walked dogfood install + instrument-fidelity validation. Phase 4 = S10 (the public trust-record read surface) + S11 (the founder-walked ENFORCE activation — the logos gate). **ENFORCE (binding any recommendation/verdict) is S11** — a founder-walked Critical logos-gate activation; nothing this session pre-approves it. Weights BLOCKED throughout; the 0h call remains the founder's.

## Cross-references
- `operations/handoffs/founder/2026-07-10-trust-layer-S7-l4-passion-audit-CLOSE.md` (predecessor close)
- `operations/handoffs/founder/2026-07-10-trust-layer-S8-reference-harness-NEXT-SESSION-PROMPT.md` (the executed prompt, SPENT)
- `operations/handoffs/founder/2026-07-10-trust-layer-S9-dogfood-install-NEXT-SESSION-PROMPT.md` (S9 next)
- `adopted/adr/2026-07-08-sage-trust-layer.md` (ADR-013 §4/§6) + `adopted/adr/2026-06-20-pre-decision-harness-arc2.md` (ADR-011 + the S8 amendment)
- `harness/gate1-pre-decision/SEVEN-LAYERS.md` + `KILL-SWITCHES.md` (the channel-law + kill-switch deliverables)
- `D-TRUST-LAYER-S8-REFERENCE-HARNESS-BUILT-DARK-REVIEW-FOLDED`

*End of session close. The seven-layer reference harness is built — the first live consumer wiring the S1–S7 trust core + discernment engine + L4 audit into a real Claude-Code loop, every step channel-law-classified, DARK/MEASURE, byte-identical until push; the four adversarial folds (the A7 server-boundary claim narrowing + tamper-evidence, briefed-only-on-delivery, the NULL-agent poisoning guard, the cost caps) applied + pinned. Phase 3 (the reference harness + dogfood) is open; S9 is the founder-walked dogfood install. ENFORCE is S11.*
