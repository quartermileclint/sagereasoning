# Session Close — 2026-07-19 — AE-2: the CI-4 loop fold BUILT DARK (wiring `combineVerificationResults`; kathekon-classified; MEASURE-only)

**Stream:** founder (agent-extension).
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`.
**Tier:** `code-elevated` — Elevated risk under 0d-ii. Repo-only, dark, flag-gated, additive, MEASURE-only, **no schema**. AC7 NOT engaged (the activation is the carried `code-critical` arm). PR6 not engaged.
**Date:** 2026-07-19.
**Binding design executed:** ADR-014 §3.2 (item 2's elected split — the CI-4 signed-marker fold now; chains to A8), §4 (identity + one-record), §5 (honesty posture), §6 (regime inheritance), §7 (slice AE-2).

## Decisions Made
- **`D-AGENT-EXTENSION-AE2-CI4-LOOP-FOLD-BUILT-DARK-REVIEW-FOLDED-2026-07-19`** appended (full reasoning; this close is the operational digest).

## 1. What was built

The previously dark, zero-caller **`combineVerificationResults`** (S3, `combiner.ts:484-573`) is **wired** into a read path. The pivotal grounding fact (Explore sweep + first-hand): the CI-4 examination markers persist in **no server table** — they exist only inside signed assessments in flight and in the accreditation POST's `provenance.signed_assessments`. So the fold lives at the **accreditation write boundary** (where the 6e §A invariant guarantees the owner+agent-bound credential — the canonical ADR-014 §4 identity by construction): a NEW pure module **`website/src/lib/substrate/trust-core/loop-fold.ts`** computes a **`loop_fold`** annotation (schema `agent-loop-fold-v1`) on the write **200**, dark behind the NEW **`SUBSTRATE_LOOP_FOLD_ENABLED`** (UNSET everywhere ⇒ byte-identical, battery-asserted).

Per submitted chain, flag-on: **(1)** per-element **Ed25519 re-verification** (the derive-trust-events pattern; unverified/malformed excluded + counted — the ADR-013 §8 envelope made structural: unsigned V3 chains can never enter); **(2)** each loop's **opening verdict classified through the canonical shared Q3 predicate** (`kathekon-engagement.ts`, imported never re-implemented; NARROWED_ARM_BOUNDS carried verbatim) — engaged loops feed `character` closure signals, the measured **false-positive hold class surfaces only as `instrument_calibration`** (never character data; mutation-verified); domain **levels** fold every verified verdict (the S1 posture) while **closure** signals are engaged-gated — both stated on-block; **(3)** the per-domain fold **through the combiner as-is** — supersession by explicit ref links, the Q4 same-depth rule (both via the live `analyseLoopClosure`), per-domain isolation, **conflict ⇒ pause with the conservative MIN, never an average**, publication **EVIDENCE_FLOOR-gated** emitting the distinct `insufficient_extraction` + basis (R13); **(4)** honesty bounds ON the block: `occurredAt` synthesized from **submission order** (no signed per-element timestamp exists — verified; recency degenerates to confidence weighting, proven conservative: min reachable weight 0.4 > the 0.25 materiality floor), **temporal/regime attribution REFUSED** (ADR-014 §6's refuse-branch taken explicitly — the fold computes no between-time trend, labels the write era via the **shared** `assignRegimeEra` export from AE-1's machinery, and discloses that a chain may mix regimes undetectably), the **PA-10 replay bound**, the chain-scope note (no stored-history fold exists; the marker **row-widening** is a named A8-review input, not improvised), and the MEASURE note. **MEASURE-only by construction:** no recommendation field; not an S4 input; never a trust-event source; computed AFTER the writer succeeds via a never-throws wrapper — the write outcome is unreachable. The identity PK read is **deduped** into the trust-event emission (`resolvedOwnerUserId`, flag-off byte-identical).

## 2. Adversarial review

The 6-dimension Workflow (`wf_fc0d7881-3b0`) **died whole on the account monthly spend limit** (6/6 finders errored, ~1.25M tokens) → **completed FIRST-HAND per the §4 precedent, all six dimensions** (kathekon-split · combiner-wiring · envelope-scope · measure-purity/write-safety · honesty-claims · test-adequacy): **0 critical/high/medium; 3 findings (2 LOW + 1 nit), 0 refuted, ALL folded + re-verified** — **F1** identity fallback to the auth-verified path agent_id (a transient resolver error can no longer mislabel an agent-bound credential); **F2** the character note now states the levels-vs-closure posture; **F3** a negative INV pin (`loopFoldAnnotation` exactly twice in route.ts). The two load-bearing pins were **mutation-verified LIVE** (engagement-gate drop → §3/§13 fail; verification bypass → 5 fails; reverted, green). The honesty-claims dimension **adjudicated the regime question**: per-element segmentation is impossible without a request-shape/signing change (no signed timestamp; the S11b `extractionRegime` mark is harness-side only), so refuse-and-disclose is the faithful reading — the alternative fabricates eras. **Honest limit: single-perspective first-hand; an independent re-run can follow the limit reset; nothing gates on it.**

## 3. Verified

loop-fold **104/0** (NEW) · accreditation route **90/90** · s3-combiner **106/0** · kathekon-engagement **79/0** · emission-hooks **15/0** · loop-closure-gate **29/0** · trajectory-delta **73/0** · trajectory-overlay **36/0** · aah-store **120/0** · `tsc` **0** · `npm run build` ✓ (`/api/accreditation/[agent_id]` registered). The pre-existing route suite passing unchanged flag-off is the route-level byte-identity regression.

## 4. Session honesty note

The founder-loop harness ran **UNFRAMED all session** — every Gate-1/Gate-2 hook attempt 401'd (the stale s9-loop consult token, the standing AE-1 named follow-up) and one at-action guard probe 429'd (fail-open-honest). The practice measured none of this session's own actions. The credential refresh remains its own recommended `code-critical` step.

## 5. Status Changes
| Item | Old | New |
|---|---|---|
| `combineVerificationResults` (S3) | Built dark, zero callers | **Wired (dark)** — one production consumer behind the fold flag |
| AE-2 (ADR-014 §7 slice 3) | Scoped | **Verified (dark)**; activation carried |
| `SUBSTRATE_LOOP_FOLD_ENABLED` | — | **defined; UNSET everywhere** |
| A8-review inputs | 2 (chains half; CarriedProfile) | **3** (+ the marker row-widening decision) |

## 6. Next Session Should
Run the **AE-2 activation arm** (`operations/handoffs/founder/2026-07-19-agent-extension-AE2-activation-NEXT-SESSION-PROMPT.md` — founder-walked `code-critical`: flag + redeploy + live smoke + the R18 election) — or, founder's call, the **s9-loop consult-credential refresh first** (recommended; un-frames→re-frames the loop and would let the dogfood measure AE-3's build). Then **AE-3** (last; per ADR-014 §3.4's fixed constraints). Parallel unblocked: RA-1-F1; the registry follow-up; the mention-conversion re-check; `inbox/Mentor feedback on website pages.rtf` (uncaptured).

## 7. Blocked On
**Files remaining uncommitted:** see §Founder Verification (this session's set only — the tree also carries other-stream files; do NOT `git add -A`).

**Production state at session close (2026-07-19, PR18):** production **byte-equivalent** — nothing deployed, no flag set, no schema, no mint; on the founder's push the fold code deploys DARK (`SUBSTRATE_LOOP_FOLD_ENABLED` unset ⇒ the accreditation write response is byte-identical, battery-asserted; the only always-on deltas are comments + three additive-inert seams). All live flags/surfaces untouched (AE-1, trust core, R18f, R20a, distress, Layer-2 signing, UPC auth). **The S11 flip remains REFUSED; MEASURE throughout; ENFORCE is S11; weights BLOCKED; the 0h call remains the founder's.**

## 8. Founder Verification
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"

git add website/src/lib/substrate/trust-core/loop-fold.ts \
        website/src/lib/substrate/trust-core/__tests__/loop-fold.test.ts \
        website/src/lib/substrate/trust-core/index.ts \
        website/src/lib/substrate/trust-core/emission-hooks.ts \
        website/src/lib/substrate/trajectory-delta.ts \
        "website/src/app/api/accreditation/[agent_id]/route.ts" \
        "website/src/app/api/accreditation/[agent_id]/response-builders.ts" \
        operations/decision-log.md \
        operations/handoffs/founder/2026-07-18-agent-extension-AE2-ci4-loop-fold-NEXT-SESSION-PROMPT.md \
        operations/handoffs/founder/2026-07-19-agent-extension-AE2-ci4-loop-fold-CLOSE.md \
        operations/handoffs/founder/2026-07-19-agent-extension-AE2-activation-NEXT-SESSION-PROMPT.md \
        CLAUDE.md

git commit -m "AE-2: the CI-4 loop fold BUILT DARK (ADR-014 §3.2) — combineVerificationResults WIRED at the accreditation write boundary (the only server-readable home of the signed CI-4 markers — no table persists them); per-element Ed25519 re-verification (envelope structural: signed CI-4 loops only, unverified excluded+counted); each loop's opening verdict classified via the canonical kathekon predicate — engaged loops feed character closure, the false-positive hold class surfaces ONLY as instrument_calibration (mutation-verified); per-domain folds through the combiner as-is (conflict=>pause conservative-MIN never average; EVIDENCE_FLOOR insufficient_extraction + basis); submission-order occurredAt disclosed (recency degenerates conservative); regime attribution REFUSED on-block (no signed per-element time; write_era via the SHARED assignRegimeEra; PA-10 disclosed); MEASURE-only (no recommendation field; after-writer never-throws; identity PK read deduped into emission) — all dark behind NEW SUBSTRATE_LOOP_FOLD_ENABLED (UNSET = byte-identical, battery-asserted); adversarial review: the Workflow died whole on the monthly spend limit -> completed FIRST-HAND per the §4 precedent, 3 findings (2 LOW 1 nit) 0 refuted ALL folded (identity fallback to auth-verified path agent_id; levels-vs-closure posture stated on-block; negative attachment-site pin) + 2 live mutation verifications; battery loop-fold 104/0 · route 90/90 · s3-combiner 106/0 · kathekon 79/0 · emission 15/0 · gate 29/0 · delta 73/0 · overlay 36/0 · store 120/0 · tsc 0 · build green; production byte-equivalent — activation is the founder-walked arm; the A8 review gains the marker row-widening input; S11 flip REFUSED; the 0h call remains the founder's

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```
Then push via GitHub Desktop. **Vercel deploys the fold DARK** (flag unset — the write response stays byte-identical until the activation walk).

Do NOT `git add -A` — the tree carries other-stream files (`inbox/Mentor feedback on website pages.rtf`, `operations/handoffs/founder/2026-07-13-remaining-principles-build-plan-CLOSE.md`, `operations/trust-layer-2026-07/2026-07-13-remaining-stoic-principles-build-plan.md`, `website/src/data/environmental-context.json`) untouched this session.

## 9. Cross-references
- `D-AGENT-EXTENSION-AE2-CI4-LOOP-FOLD-BUILT-DARK-REVIEW-FOLDED-2026-07-19` — the full record
- `operations/handoffs/founder/2026-07-18-agent-extension-AE2-ci4-loop-fold-NEXT-SESSION-PROMPT.md` — the prompt executed
- `operations/handoffs/founder/2026-07-19-agent-extension-AE2-activation-NEXT-SESSION-PROMPT.md` — the carried arm
- ADR-014 §§3.2/4/5/6/7 (binding) · ADR-013 §8 · the AE-1 closes (2026-07-18)

---

*End of session close. The dark combiner finally has a caller: the write boundary now knows how to read the loop record it has always been handed — verified element by element, the false holds set aside as news about the instrument, the genuine corrections folded per domain with every conflict paused rather than averaged. It binds nothing, claims no trend it cannot time-stamp, and waits dark for the walk. The enforce assent is still yours.*
