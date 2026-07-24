# Next-Session Prompt — Retroactive Independent Adversarial Reviews: AE-1 + S11b

**Authored:** 2026-07-25, by the Fable-5 audit session (`operations/2026-07-25-fable5-audit-of-sessions-2026-07-19-to-24.md` §2 R-2, §6.3). **Planned as the session following the P2 Fable-5 rerun arc** (or interleaved at the founder's discretion — this work is independent of P2 and parallel-safe; what it should NOT wait for is the loss of top-tier model access).

**Why:** two live surfaces were built on 2026-07-18 with adversarial Workflows that **died whole on the account spend limit** and were completed first-hand only, each close noting "an independent re-run can follow the limit reset; nothing gates on it." The re-run never happened. The very next day, the two sibling builds whose re-runs DID happen each yielded real defects the first-hand pass had missed (AE-2: **7 confirmed incl. a spec-infidelity**; self-circle narrowing: **1 HIGH double-counting**) — a 2/2 hit rate that grounded PR19 itself. PR19 (adopted 07-21) made re-runs mandatory going forward but was never applied backward. These are the two highest-blast-radius first-hand-only surfaces now live.

**Tier:** `code-elevated` for the reviews + any test/pin folds. **Escalation rule:** any confirmed finding whose fix touches a LIVE behavioural surface beyond MEASURE annotations — especially `derive-trust-events.ts` (the live trust-event reducer) or anything on the `/api/reason` graph — is its own `code-critical`, founder-walked fix step (0c-ii), not a rider on this session. MEASURE-only folds (loop_fold/delta annotations, harness capture, tests) may fold in-session with batteries re-run.

**Model:** run the review Workflows at the strongest available tier (per the audit's AUTH-1 lesson: review tier matters independently of review structure — a completed Sonnet Workflow still missed what a Fable read found).

---

## Scope — the two review subjects

### Subject 1: AE-1 — the practice-delta layer (LIVE in production, MEASURE)
Built dark 2026-07-18 (`933faf7`), activated same day (`11d0792`); first-hand review only (`wf_489570a7` died 6/6; 5 findings F1–F5 folded first-hand). Files:
- `website/src/lib/substrate/trajectory-delta.ts` (the shared delta module — per-signal evidence floors, regime split at the S11b boundary + one-day band, provenance mix, mention-conversion bound)
- `website/src/lib/substrate/longitudinal-identity.ts` (the canonical `(owner_user_id, agent_id)` identity resolution — pair-join refusal for owner-less credentials, rotation-truncation disclosure)
- The `meta.trajectory.delta` projection + `layer1_source` stamp wiring in the `/api/reason` route + `agent-assessment-history-store.ts` touches
- Batteries to re-run post-review: trajectory-delta (73/0 at build), aah-store (120/0), trajectory-overlay (36/0)

**Review dimensions (seed from the template):** evidence-floor non-vacuity (can a starved window ever read `stable`/`advanced`?) · regime-boundary arithmetic (band inclusivity, NaN, segment selection) · identity/cross-tenant guards (the pair-join refusal under adversarial credential shapes) · flag-off byte-identity · claims-vs-code on every `*_basis`/bounds string · the F1–F5 first-hand folds verified non-vacuously (the AE-2 precedent: a first-hand fold can be present but its pin defeatable).

### Subject 2: S11b — the examined-input recomposition + reducer narrowing (LIVE in the founder loop + deployed)
Built 2026-07-18 (`b2ae8d5`, walk `a77b324`); first-hand review only (7/7 finders died; 1 HIGH — sensitive-Edit snippet egress — folded first-hand, 1 MED disclosed, 3 LOW folded). Files:
- `harness/gate1-pre-decision/claude-code/hooks/lib/action-composer.mjs` (composed intent+payload, the MANDATORY sensitive-path denylist, token redaction, payload-content-hash dedup, `GATE1_ACTION_TEXT_MODE`)
- The R11 Arm-1 narrowing's REDUCER half in `website/src/lib/substrate/trust-core/derive-trust-events.ts` (zero-circle silenced, J2 kept) — **note: reviewing this also feeds register item D4** (the reducer self-circle narrowing is still open; findings here should sharpen D4's spec, not implement it)
- `false-hold-capture.mjs` v2/v3 record schema + the report's regime split
- Batteries: kathekon (105/0 current), trust-core S1 (98/0), logic-harness (155/0), capture (37/0), **negative-battery (230/0 RELEASE GATE)**

**Review dimensions:** sensitive-path egress completeness (the HIGH's fix — is the denylist actually append-only-mandatory, and does ANY composed part still leak sensitive content? try adversarial paths/extensions) · token-redaction bypasses (encodings, split tokens) · dedup-hash correctness (collision/eviction) · the disclosed ledger-replay re-latch caveat (is it still just a caveat?) · reducer-narrowing fidelity both directions (zero-circle silenced without dropping adverse J2 evidence) · claims-vs-code on the S11b close's own assertions.

## Method (PR19 + the template)

1. Use `operations/review-harness/independent-review-workflow-template.md` — a FRESH Workflow per subject, given the artifact itself, never the first-hand reviews' conclusions (independence rule). Watch the template's named `results.filter(Boolean)` index-alignment pitfall.
2. Per-finding adversarial verify stage; fold confirmed findings at the root; every fold gains a non-vacuous, mutation-verified pin (the `content-pins-assert-exported-values` / AE-2 precedent).
3. Re-run the full battery set for the touched half after folds; negative-battery 230/0 is a release gate for any harness-side change.
4. If a Workflow dies on limits: PR19's fallback applies — first-hand completion is permitted for the session but the re-run becomes REQUIRED before any downstream Critical activation leans on the surface; record it loudly, don't soften it.
5. Records: decision-log entry per subject outcome; the S11 register gains a dated note (these surfaces feed the flip prerequisites — P3's composed input and D4's reducer); close per house style.

## Success criterion

Each subject ends either **CLEAN under genuinely independent review** (recorded, with the reviewed dimensions named) or **folded + re-verified green** — no third state. The PR19 retroactive debt for the 07-18 builds is then discharged; the audit's R-2 finding closes.

## Rollback / risk

Review + test folds only, by default: `git revert` the fold commit(s). Any behavioural fix = its own founder-walked step with its own rollback line. The live flags are untouched by this session (`SUBSTRATE_TRAJECTORY_DELTA_ENABLED`, `SUBSTRATE_LOOP_FOLD_ENABLED` stay as they are).

---

*Cross-references: `operations/2026-07-25-fable5-audit-of-sessions-2026-07-19-to-24.md` §2 · `D-AGENT-EXTENSION-AE1-DELTA-LAYER-BUILT-DARK-REVIEW-FOLDED-2026-07-18` + activation entry · `D-TRUST-LAYER-S11B-RECOMPOSITION-NARROWING-REDUCER-CAP-FIX` · `D-PR19-ADOPTED-INDEPENDENT-REVIEW-REQUIRED-2026-07-21` · `operations/review-harness/independent-review-workflow-template.md` · `operations/trust-layer-2026-07/S11-FLIP-PREREQUISITES-REGISTER.md` (P3, D4) · memories `independent-rereview-catches-self-review-blind-spots`, `content-pins-assert-exported-values`.*
