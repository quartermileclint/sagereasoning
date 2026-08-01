# Close — Agent Circles: the first-circle correction (practice-on C0 + C1a/b/d/f + C3)

**Session date:** 2026-08-01 · **Model:** `claude-opus-5`, effort `high` (harness-attested; no substitution occurred) · **Stream:** founder (substrate / trust layer / agent circles).

**Tier:** `code-critical` arc. **Risk (0d-ii):** Critical — the Layer-1 extractor prompt is shared with the LIVE `/api/guardrail` gate (it is now flag-gated dark, per BD-7). **AC7 / PR6 / PR17 engage at the walk, not in this session.**

**Production state at session close: BYTE-EQUIVALENT.** No deploy, no push, no schema applied, no flag set, no mint, no live op of any kind was performed by the AI. Every activation step is the founder's and is listed in §5.

---

## 1. What was built

| Phase | State | Notes |
|---|---|---|
| **C0.2** `practitioner_type` | Built, flag-gated | Server-composed from the route's own resolved auth (`apiKey ? 'agent' : undefined`). Never caller-supplied — mentor Q1 makes it the key that governs how the circle vocabulary is read, so a request body must not be able to claim it. |
| **C0.3** `agent-circles-v1` era | Built | Appended to `SETTLED_REGIME_BOUNDARIES`. **Its band dates must be reconciled to the actual deploy day — a blocking walk step (§5.1).** |
| **C1a** first-circle re-grounding | Built, **flag-gated (dark)** | The prompt teaches the first circle as the practitioner's own reasoning integrity, with the mentor's three classes, and explicitly refuses the background reading. **Gated at the PR19 fold — see BD-7.** |
| **C1b** three-element standard | Built, flag-gated | New optional Layer-1 fields + a new pure module `reasoning-integrity.ts`. Conjunction required; domain routed by causal locus. |
| **C1d** predicate confirmation | Verified, no code change | `kathekon-engagement.ts` is byte-unchanged, as the ruling requires; battery 0 fails. |
| **C1e** calibration probe | **Authored, not run** | `website/scripts/first-circle-calibration-probe.ts`. Both legs are the founder's (real API calls). Gates C2. |
| **C1f** B5 regime exclusion | Built | `session-decline-signal.ts` now segments to the latest extraction regime. Closes the gap its own header carried as open. |
| **C3** circle-4 class | Built, **flag-gated (dark)** | Prompt teaching only — no new mechanism: a `cosmopolis` circle flows through the existing justice machinery. **Gated at the PR19 fold — see BD-7; this was a confirmed CRITICAL.** |
| **C1c** trust-event classes | **DEFERRED — see §2** | Not built. |
| **C2** fifth-circle criterion | Not started (correctly — gated on C1e) | |

**New flag:** `SUBSTRATE_AGENT_CIRCLES_ENABLED`. UNSET everywhere ⇒ **the entire build is dark**: the Layer-1 system prompt is **byte-identical to HEAD (16,942 chars, verified by direct module comparison)**, and the Layer-2 assessment carries neither new field (battery-asserted). Flag-on adds 6,830 prompt chars. **Deploying this commit changes nothing in production; one flag flip is the whole activation, and unsetting it is the whole rollback.**

## 2. Scope decisions (BD-*)

- **BD-1 — the W2 co-ride election: DECLINED.** The logos-on W2 record machinery (enforcement class, regime markers, compliance-not-virtue clause) does **not** ride C1c's migration. Reasons: (a) its storage shape is an explicitly OPEN engineering item in the logos-on plan's own §6.3, and settling it as a rider inside a gate-touching Critical build is the "widen until unverifiable" failure; (b) nothing is blocked by deferring — the enforcement class has no emitter until the S11 flip, which is deferred and readiness-gated; (c) a second purely-additive schema step is cheap, whereas a wrong append-only schema is not. **The founder can overrule; this is a recorded judgement, not a constraint.**
- **BD-2 — C1c deferred to its own session.** Its derivations must be flag-gated dark rather than merely migration-ordered, because `SUBSTRATE_TRUST_CORE_ENABLED` is LIVE: a new event type reaching production before its CHECK widening yields Postgres 23514, which `insertEvent` matches with neither its 23505 nor its missing-table branch, so `emitTrustEvents` **aborts the rest of the batch** and silently loses the remaining trust events for that write. C1c also depends on C1e's calibration having run. Folding it in would have made this artifact too large for one review pass.
- **BD-3 — the C1b reading is measure-only and never feeds `computeProximity`.** Mentor L4 rules first-circle enforcement a category error; the live gate blocks on proximity; therefore a first-circle floor *would be* that enforcement. Attached after proximity is computed, and pinned in both directions.
- **BD-4 — C1b's fields are a new top-level Layer-1 category**, not members of `OikeiosisCircleEngaged`: the demonstration is not a circle engagement, and the routing is a property of the decision.
- **BD-5 — the domain routing is derived from element 1**, per Q2c's own text ("if no tension was identified, the failure is phronesis"), rather than from a second extracted field.
- **BD-6 — one flag for the whole C0/C1b measure layer**, so the founder has one activation surface rather than three.
- **BD-7 — the C1a/C3 prompt change is flag-gated, not unconditional. This reverses the plan's instruction, on the binding record's authority, and it is the PR19 CRITICAL fold (§4a).** The plan directs an unconditional prompt on the route-2a precedent. That precedent does **not** transfer: at route-2a the prompt shipped unconditionally but Layer-2 *consumption* was flag-gated, so a new extraction could not move a verdict. Here consumption is the pre-existing, always-on `obligation_assessment → dikaiosyne` floor — `/api/guardrail` pins `dikaiosyneWeighting: true` unconditionally, a `violated` obligation floors proximity to `reflexive`, and `reflexive` is below the live default threshold `deliberate`, i.e. a hard `proceed:false`. So an unconditional C3 teaching would have created a **new live deny class on deploy**, which mentor ruling **L3** forbids in terms: the circle-4 class *"enters the staged pause tier first, not the do-not-proceed class at the flip"*, because *"LLM extraction at this level of specificity does not yet meet the zero-false-positive standard… a deny is irreversible"*. C1a is gated in the same switch because (a) it is itself an unmeasured lenience-direction change on the same gate, and (b) it makes the regime boundary land at an instant the founder chooses rather than a guessed deploy day.

## 3. The finding the founder most needs to see

**C1a is a LENIENCE-direction change on the live gate — now dark behind the flag (BD-7), so it is a risk to weigh at ACTIVATION rather than at deploy.**

Today the extractor attaches `self_preservation` to nearly every decision. `computeDikaiosyneFloor` engages whenever `circles.length >= 1`, and a circle carrying no `obligation_assessment` resolves through `obligationToProximity` to `reflexive`. So a purely self-regarding action can currently be floored to `reflexive` by a background circle — and the live gate can block on it.

After C1a, that action may emit **no circles at all**, so dikaiosyne is not engaged, there is no floor, and the verdict can be **more permissive than today**.

This is the faithful reading — mentor Q3 is explicit that a first-circle-only engagement is not a justice surface — but it changes what production refuses. It is bounded by the fact that C1a narrows *only* the self circle: the prompt's anti-role-framing guard for affected third parties is untouched, so actions affecting others still surface their circles. **It has not been measured.** Measuring it is walk step §5.2 and is a blocking gate.

**C3 moves the other way:** a `cosmopolis` obligation read `violated` floors reflexive, so the gate can newly **block** where it previously proceeded. The PR19 reviewer verified this by execution — a realistic passing extraction flipped from `proceed:true` to hard `proceed:false` with only the C3-taught circle added. The plan called this consequence "legitimate"; **the verbatim L3 ruling says the opposite**, and the verbatim record wins. It is now dark, and the mentor's staging requirement (pause tier before deny) is an **open design question for the activation session** — gating buys the time, it does not discharge L3.

## 4a. PR19 independent adversarial review — RAN, one CRITICAL folded, **and INCOMPLETE**

A 7-dimension independent Workflow reviewed the artifact only (fresh contexts; never given my conclusions). **99 findings raised. Then the account session limit killed 80 of the 106 agents mid-verify, so only 19 findings were adjudicated: 15 confirmed (1 critical, 4 medium, 6 low, 4 nit) and 4 refuted.** Of those, only the critical was returned to me in full detail before truncation.

**The confirmed CRITICAL is folded** (BD-7 above): C3 wired a new deny class into the live gate, unstaged and unflagged, against mentor L3. The reviewer did not merely argue it — it built a realistic passing extraction and executed the chain, showing `proceed:true → proceed:false` with only the C3-taught circle added, on an action that is *not* kathekon-free. It also correctly identified that the plan's route-2a justification does not transfer, and that the build plan's own "legitimate" framing loses to the verbatim ruling. **This was my error, and it is exactly the class independent review exists to catch: I read L3 as S11-staging language, as the plan does, rather than as governing the live guardrail deny that L1 explicitly names.**

**The review is NOT complete and this build must not be treated as PR19-discharged.** ~80 findings remain unadjudicated — their titles (in the run's failure log) include several I would want verified before any activation: whether `SUBSTRATE_AGENT_CIRCLES_ENABLED` reaches everything it claims to, whether the §9/§10 pins are defeatable, C1f's absent test coverage, the l1_supply authored-schema path, B6's inverted semantics, and the layer2-signer battery not being extended. **Finishing the review is a blocking pre-condition on the walk**, not a nicety. The run is resumable: `Workflow({scriptPath: …/agent-circles-c1-pr19-review-wf_54976666-937.js, resumeFromRunId: 'wf_54976666-937'})` replays the completed finders from cache and re-runs only the dead verifiers.

**Incidental:** the review's mutation-testing left three probe files and three `.fuse_hidden` artifacts in the tree; all six were removed and the batteries re-verified green, confirming no mutation was left in place.

## 4. Verification performed

- `tsc --noEmit` **0** · `npm run build` **0** (`ƒ /api/reason` registered).
- New battery `reasoning-integrity.test.ts` **60/0**, covering the prompt gating (§13) and the conjunction both ways, causal-locus routing, empty-span handling, the demonstration standard, flag-off byte-identity, and the measure-only proximity invariance.
- **Mutation cycle (the pins are non-vacuous):** breaking the conjunction (`&&`→`||`) turns **4** pins red; introducing the L4 category error (flooring proximity on a first-circle failure) turns **3** red including the load-bearing one. Both reverted; green restored.
- Regression sweep, all 0 fails: `practice-suggestion` 791 · `loop-fold` 181 · `corroboration-check` 106 · `kathekon-engagement` 105 · `trajectory-delta` 81 · `proximity-dikaiosyne` 59 · `layer2-signer` 18 · `session-decline-signal` 15 · plus `layer1-schema-additions` and `guardrail-sandwich`.
- **Prompt byte-identity verified directly**: `buildLayer1SystemPrompt(false)` === HEAD's `LAYER1_SYSTEM_PROMPT`, 16,942 chars, compared by importing both modules — not by inspection.
- **One real regression was caught and fixed at the root:** `trajectory-delta`'s fixtures stepped one *day* apart from 2026-07-20, so a 20-row window straddled the new 2026-08-01 boundary and the module correctly refused to compute across it — ten unrelated pins red. Fixed by stepping fixtures one *hour* apart (spacing was never load-bearing; cross-boundary behaviour is pinned separately with literal dates). The §3 boundary pin was **strengthened**, not relaxed: both boundaries are now pinned individually, plus two new non-vacuity assertions on the shared reader.
- A second real catch: the `§9 MEASURE` pin rejected my boundary note because it contained the word "**verdict**" (in "mentor verdicts"), which is a forbidden substring in any MEASURE-block payload. The note was reworded to "rulings"; the pin stayed strict.

**NOT performed, and required before deploy:** the guardrail verdict-equivalence battery at **both** thresholds, and the LOCUS-2 battery. Both need real Sonnet extractions. They are the only instruments that can measure §3's lenience question. See §5.2.

## 5. Founder-walk checklist (nothing below has been done)

**Order is inviolable.** Commit-and-push before any flag; TEST before prod.

0. **Finish PR19 first (§4a) and fold whatever it confirms.** The build is not review-discharged.
1. **Reconcile the regime band — BLOCKING.** *(Note: with BD-7 the extraction change activates at the FLAG FLIP, not the deploy, so the band should be set to the flag-flip day. This is now a knowable instant rather than a guess — which is part of why the gating is an improvement.)* Original text follows.
1b. **Reconcile the regime band to the real deploy day — BLOCKING.** In `website/src/lib/substrate/trajectory-delta.ts`, the `agent-circles-v1` entry's `band_start_iso` / `band_end_iso` are authored as `2026-08-01` → `2026-08-02`. If you deploy on another day, set them to that day and the next. Getting this wrong mislabels examinations across the vocabulary change — the exact comparison Q9a forbids.
2. **Run the pre-deploy gate batteries.** The guardrail verdict-equivalence battery **at the strict threshold AND at the live `deliberate` default**, both directions (catches *and* over-strictness), plus LOCUS-2. Specifically adjudicate every fixture whose verdict CHANGES: for each, decide whether it is (a) a genuinely self-regarding action correctly no longer floored — the intended C1a effect — or (b) a real leak where the old self-circle was masking a third-party obligation the narrowed prompt now drops. **A single case of (b) stops the deploy.**
3. **Run C1e's calibration probe, both legs** (`--label=pre-c1` before the change, `--label=post-c1` after). Read it against its own stated bounds: a rate that fell because *every* circle fell is over-broadness, not calibration.
4. **Acknowledge the two disclosed consequences explicitly** before pushing: C1a's lenience direction (§3) and C3's new block class (§3).
5. Commit + push. Vercel green **with the intended code** before any flag. **This deploy is byte-identical in behaviour** — the prompt is flag-off-identical to HEAD and both new assessment fields are omitted.
6. Live smokes on a throwaway credential, revoked at teardown: a self-regarding consult (expect no `self_preservation`), a third-party-affecting consult (expect the affected circle, unchanged), a summariser-omission consult (expect `cosmopolis` + `violated`), and an honest-disclosure consult (expect **no** violation — the protective control).
7. Only then, optionally, set `SUBSTRATE_AGENT_CIRCLES_ENABLED=true` and re-smoke for `practitioner_type` + `reasoning_integrity`.
8. R18 docs: **not drafted this session, deliberately.** The public contract changes only if/when the flag is set; wording is signed off before any public surface changes.

## 6. Rollback

- Flag: unset `SUBSTRATE_AGENT_CIRCLES_ENABLED` + redeploy ⇒ `practitioner_type` and `reasoning_integrity` disappear; assessment byte-identical (battery-asserted).
- Prompt (C1a/C3): `git revert` the build commit + redeploy. **This is the only part that is live on deploy regardless of the flag**, so it is the rollback that matters.
- Regime boundary: reverting the commit removes the entry; rows written under the corrected vocabulary would then read as `post-s11b-recomposition` — acceptable only if the prompt is reverted in the same step.
- No schema was applied; nothing to reverse there.

## 7. Carried

- **C1c** — the failure/demonstration trust-event classes + the `agent_trust_events` CHECK widening, flag-gated dark per BD-2. Its own `code-critical` session.
- **C2** — the fifth-circle criterion, gated on C1e's live calibration (mentor Q9b).
- **D4** — unchanged in content, **raised in priority**: `derive-trust-events.ts` still mints dikaiosyne justice events from self-only circles, which the 2026-07-19 ruling says is not a justice surface. C1a makes the reducer *more* divergent from the predicate, not less. **C1a does not close D4** — the frequency drop must not be read as a fix.
- **W2** (logos-on record machinery) — its own schema step, per BD-1.

---

*The verbatim mentor records govern; where this close and they diverge, they win.*
