# Session Close — 2026-07-18 — AE-1: the practice-delta layer BUILT DARK (shared delta module + identity resolution + the `meta.trajectory` delta projection) + review-folded

**Stream:** founder (agent-extension).
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`.
**Tier:** `code-elevated` — repo-only, dark, flag-gated, additive. **The two named `code-critical` arms were NOT engaged** (no schema applied, no flag set, no deploy; the AI performed no Supabase/Vercel/git/mint op). The activation arm is authored and carried (below).
**Date:** 2026-07-18.
**Binding design executed:** ADR-014 §§3.1, 3.3, 4, 5 (+ the S11b regime settlement carried in per the prompt's dated pre-condition notes).

## Decisions Made
- **`D-AGENT-EXTENSION-AE1-DELTA-LAYER-BUILT-DARK-REVIEW-FOLDED-2026-07-18`** appended (full form — the complete record; this close is the operational digest).

## 1. How the session opened (the pre-condition gate did its job)

The prompt's hard pre-condition 1 branch was **exercised**: at first open the repo showed no S11a/S11b close and the session **STOPPED as mis-sequenced** per the prompt's own instruction. The founder confirmed S11a + S11b had completed in a separate session; re-verification found `83a290d` (S11a), `b2ae8d5` (S11b — "the ADR-014 regime SETTLED ONCE … AE-1 pre-condition discharged"), and `a77b324` (the Part-3 walk) on `origin/main`. Only then did the build proceed.

## 2. What landed (all dark behind the NEW `SUBSTRATE_TRAJECTORY_DELTA_ENABLED`; UNSET everywhere ⇒ byte-identical, battery-asserted)

- **`longitudinal-identity.ts`** (NEW, pure) — the canonical `(owner_user_id, agent_id)` identity resolution every longitudinal read goes through: pair when owner+agent present; **pair-join REFUSED for owner-less agent-declared credentials** (the cross-tenant guard — the live s9-loop consult credential's shape); credential as the identity floor for undeclared; the ADR-014 §4 **"window truncated by credential rotation"** disclosure wherever the identity is broader than the presenting credential.
- **`trajectory-delta.ts`** (NEW, pure, env-free) — the ONE shared delta module: surfaces the aggregator's discarded material (four dimension details + persisting passions) and computes the between-half per-mechanism deltas (sub-species frequency `fading|recurring|new|stable`; kathekon-quality, first-circle obligation, domain-engagement) — **every signal floored** (≥3 non-empty feeding rows per compared half ⇒ else the distinct **`insufficient_extraction`**, never a defaulted `stable`; a starved window is never certified `advanced`) with a **`*_basis`** per signal; **regime-split** at the settled S11b boundary (election E-AE1-2 — one-day uncertainty band excluded + counted; latest segment only); **provenance mix** disclosed (`n_supplied/n_server/n_unknown`); the S11b **mention-conversion bound** riding every circle-fed signal; record-descriptive past-tense wording locked by the battery. **MEASURE-only** — no recommendation surface (pinned on the output).
- **The `meta.trajectory.delta` projection** — attached in the route's M7 read branch, flag-gated, fail-honest (a compute failure omits the delta, never the response); reuses the SAME M7 window (**no second windowed query**) + ONE flag-gated PK read **shared with the M6 write block** (the F4 fold — never two per consult). The engine assessment is untouched.
- **Election E-AE1-1 — the `layer1_source` column:** migration **AUTHORED, NOT APPLIED** (`website/supabase-agent-assessment-history-layer1-source-migration.sql`); the write stamp uses **TRUE provenance** (`preExtractedLayer1Schema !== undefined` — catching the plugin path the meta field's flag-gated emission misses); stamp AND select both gated behind the delta flag ⇒ the PGRST204 build-dark-migrate-later class is structurally avoided.
- **The `depth_tier` read-projection addition** (AE-3's seam) + `readRows` on `TrajectoryWindow` (in-memory, optional).
- **OUT, per the prompt:** the reflect projection (gated on reflect-store owner-scoping — ships NOTHING until then); AE-2/AE-3; any schema application; any flag flip.

## 3. The adversarial review — and its honest limit

Workflow `wf_489570a7-80a` (6 find dimensions → per-finding adversarial verify) **died whole on the account MONTHLY SPEND LIMIT** (6/6 finders errored; ~1.18M tokens) → **completed FIRST-HAND per the §4 precedent, all six dimensions.** **5 findings, 0 refuted, ALL folded + re-verified:**

| Sev | Finding | Disposition |
|---|---|---|
| **MED** | `isMissingTableError`'s `/does not exist/` regex matches a 42703 `column … does not exist` ⇒ a flag-before-migration misorder would serve a **false EMPTY window** (fresh-start lie on the live M7 overlay — the standing missing-table-benign memory class) | **FOLDED AT ROOT** (pre-folded before the workflow died): 42703/PGRST204/column-mentioning errors are NEVER benign — always-on error-path hardening, strictly safer; pinned ×3 (§11: 42703 ⇒ ok:false, PGRST204 ⇒ ok:false, 42P01 missing-TABLE stays benign-empty) |
| LOW | The mention-conversion bound text omitted the circle-fed `oikeiosis_extension` dimension trend | **FOLDED** — named in the bound |
| LOW | `VOCABULARY_NOTE` over-attributed every floor to starved extraction (sparse history is the other honest cause) | **FOLDED** — both causes named; the `*_basis` counts distinguish |
| LOW | `resolveCredentialContext` ran TWICE per consult with write+delta flags both on (KG1) | **FOLDED** — the write block reuses the delta block's context; flag-off byte-identical |
| test gap | No pin locked the fail-honest column-error behavior | **FOLDED** — the three §11 pins |

**Clean:** evidence-floor non-vacuity (deleting any floor fails its pin); regime-edge arithmetic (band start-inclusive/end-exclusive; NaN timestamps land conservative; newest-non-band-row segment selection); identity (no agent_id-keyed read anywhere — pinned; the route's identity derivation matches the M6 write path exactly); determinism (sorted keys; no clock; the aggregator's `computed_at` never surfaced — pinned). **Honest limit:** single-perspective first-hand; an independent Workflow re-run can follow the limit reset; nothing gates on it.

## 4. Live observation (the dogfood measuring its own builder, post-recomposition)

The at-action frames read circles + prohairesis from the actual edit content throughout (the S11b recomposition visibly working on this session's own tool calls), **closed multiple correction loops in-session** — including on the exact review folds — fired the **G3 elicitation once** (answered genuinely), issued **one guard CAUTION** (proceeded deliberately), and hit **repeated 28s consult timeouts** on this session's larger writes (fail-open-honest — the S11b close's disclosed latency class, observed first-hand; the count kept moving as these records were themselves written, so it is recorded as a class, not a number). Several redirections were superseded before re-examination (the known intermittent class; register P6's window design owns the measurement).

## 5. Status Changes

| Item | Old | New |
|---|---|---|
| AE-1 (ADR-014 §7 slice 1) | Scoped (pre-condition discharged at S11b) | **BUILT DARK — Verified (battery 73/0); activation carried** |
| The identity-resolution module (ADR-014 §4) | Scoped | **Verified (dark); AE-2 consumes it next** |
| `layer1_source` (election E-AE1-1) | Open fork | **Elected: column; migration authored; applied in the activation arm** |
| Regime row-marking mechanism (ADR-014 §3.1, "decided at AE-1") | Open | **Elected (E-AE1-2): read-side boundary-date split; per-row column deliberately not taken** |
| `isMissingTableError` false-benign column class | Latent (all four store read/delete/export/purge paths) | **CLOSED always-on (F1); pinned** |
| The S11 flip | REFUSED | **Unchanged. Nothing here binds; MEASURE throughout; weights BLOCKED.** |

## 6. Next Session Should

**➡ The founder-walked AE-1 ACTIVATION** (`operations/handoffs/founder/2026-07-18-agent-extension-AE1-activation-NEXT-SESSION-PROMPT.md` — `code-critical` 0c-ii; migration TEST→prod **BEFORE** the flag → live smokes → R18 docs incl. the **WEIGHTS-BLOCKED** restatement). Then **AE-2** (the CI-4 loop fold — wires `combineVerificationResults` through the shared identity module; kathekon-engagement-classified; MEASURE-only) → **AE-3** (last). Parallel, unblocked: RA-1-F1; the registry follow-up; the Layer-1 mention-conversion re-check (named at S11b). The `inbox/Mentor feedback on website pages.rtf` remains uncaptured (its own session's input — flagged at open).

## 7. Blocked On

**Files remaining uncommitted (this session's — enumerate; do NOT `git add -A`):** see §Founder Verification. **NOT this session's (other streams, untouched at open + close):** `operations/handoffs/founder/2026-07-13-remaining-principles-build-plan-CLOSE.md`, `operations/trust-layer-2026-07/2026-07-13-remaining-stoic-principles-build-plan.md`, `website/src/data/environmental-context.json`, `inbox/Mentor feedback on website pages.rtf`.

**Production state at session close (2026-07-18, as-of this close — PR18):** **byte-equivalent to session open** — no deploy, flag, schema, credential, mint, or DB write occurred. `SUBSTRATE_TRAJECTORY_DELTA_ENABLED` does not exist/is unset; the `layer1_source` migration is authored, unapplied. On the founder's push the only always-on deltas are: the `depth_tier` addition to the M7 windowed-read select (in-memory; the response is unchanged), the F1 `isMissingTableError` column hardening (error paths surface truth instead of false-benign — fires only on genuine schema drift), and comments; everything else is flag-gated dark. All live trust/S9b flags, the trajectory flags (write/read/sweep), R18f, R20a, distress, Layer-2 signing, UPC auth, the `gate1-dogfood@v1` marker, and the gen-2 s9-loop credentials untouched. **The S11 enforce flag does not exist/is unset; the intervention engine remains MEASURE; ENFORCE remains S11 — refused on readiness. Weights BLOCKED. The 0h call remains the founder's.**

**Batteries (all green at close):** trajectory-delta **73/0** (NEW) · agent-assessment-history-store **120/0** · trajectory-overlay **36/0** · sage-assent-bridge **33/0** · direction-of-travel **7/0** · tier1-continuation **42/0** · r20a-audience-rendering **66/66** · `tsc` **0** · `npm run build` **✓ Compiled** (`ƒ /api/reason` registered). No harness or trust-core file touched (those batteries unaffected; the S11b close's counts stand).

## 8. Founder Verification

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"

git add website/src/lib/substrate/trajectory-delta.ts \
        website/src/lib/substrate/longitudinal-identity.ts \
        website/src/lib/substrate/agent-assessment-history-store.ts \
        website/src/lib/substrate/trajectory-overlay.ts \
        website/src/app/api/reason/route.ts \
        website/supabase-agent-assessment-history-layer1-source-migration.sql \
        website/src/lib/substrate/__tests__/trajectory-delta.test.ts \
        website/src/lib/substrate/__tests__/agent-assessment-history-store.test.ts \
        operations/handoffs/founder/2026-07-18-agent-extension-AE1-activation-NEXT-SESSION-PROMPT.md \
        operations/handoffs/founder/2026-07-18-agent-extension-AE1-delta-layer-CLOSE.md \
        operations/decision-log.md \
        CLAUDE.md

git commit -m "AE-1: the practice-delta layer BUILT DARK (ADR-014 §§3.1/3.3/4/5) — the ONE shared delta module (per-mechanism deltas in D17's vocabulary; per-signal evidence floors emitting insufficient_extraction + *_basis, never a defaulted stable; regime-split at the settled S11b boundary with a one-day uncertainty band, latest-segment-only; provenance-mix disclosure; the mention-conversion bound on every circle-fed signal; MEASURE-only) + the canonical (owner,agent) identity-resolution module (pair-join refused for owner-less agent-declared credentials; rotation-truncation disclosed; no agent_id-keyed read, pinned) + the meta.trajectory.delta projection dark behind NEW SUBSTRATE_TRAJECTORY_DELTA_ENABLED (UNSET = byte-identical, battery-asserted) + the depth_tier read column (AE-3 seam); elections E-AE1-1 (layer1_source column — migration AUTHORED not applied; stamp+select flag-gated, PGRST204 class structurally avoided; TRUE provenance incl. the plugin path) + E-AE1-2 (boundary-date regime split; no request-shape change); adversarial review: the Workflow died whole on the monthly spend limit -> completed FIRST-HAND per the §4 precedent, 5 findings 0 refuted ALL folded (MED: isMissingTableError false-benign on 42703/PGRST204 column errors hardened always-on — a flag-before-migration misorder can no longer serve a false-empty window; + bound/vocabulary/double-PK-read/test-gap folds); battery 73/0 · store 120/0 · overlay 36/0 · bridge 33/0 · tier1 42/0 · r20a 66/66 · tsc 0 · build green; production byte-equivalent — activation is the founder-walked arm

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```
Then push via GitHub Desktop. **Vercel will deploy the always-on deltas named above (behaviourally inert on every response); the delta feature stays dark until the walked activation.**

## 9. Cross-references
- `operations/handoffs/founder/2026-07-18-agent-extension-AE1-activation-NEXT-SESSION-PROMPT.md` — THE CARRIED ARM
- `D-AGENT-EXTENSION-AE1-DELTA-LAYER-BUILT-DARK-REVIEW-FOLDED-2026-07-18` — the full record
- ADR-014 (binding design) · the AE-1 prompt (executed; its STOP branch exercised) · the S11b close + `b2ae8d5` (the regime settlement inherited)
- `D-TRUST-LAYER-S11-F2-MENTOR-RULING-EXCLUSION-CLAUSE-GOVERNS-ADOPTED` (R13 — the generalisation this build encodes structurally)

---

*End of session close. The delta layer now exists dark: one record, one identity, one computation — with the starvation visible in every signal it touches. The instrument examined the build that will project its own record, and closed its loops on the folds. What remains is yours: one migration, one flag, walked.*
