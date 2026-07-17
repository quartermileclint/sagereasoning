# Next-Session Prompt — AE-1: the practice-delta layer (items 1+3's shared module + the `meta.trajectory` delta projection)

**Stream:** founder (agent-extension).
**Tier:** `code-elevated` — repo-only, dark, flag-gated, additive. **Two named `code-critical` arms live OUTSIDE this session:** (a) any schema element the in-session elections produce (the `layer1_source` provenance column; any row widening) is its own founder-walked 0c-ii; (b) the activation (flag flip on `/api/reason`'s response shape) is its own founder-walked 0c-ii with the R18 docs. The AI performs no Supabase/Vercel/git/mint op.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` (substrate build session); open under `STANDING-SESSION-OPENER-grounded-foundations.md`.
**BINDING DESIGN (read §§3.1, 3.3, 4, 5 in full before any code):** `adopted/adr/2026-07-18-agent-practice-trajectory.md` (ADR-014). The mentor verbatim record it rests on wins over every digest.
**Predecessor close:** `operations/handoffs/founder/2026-07-18-agent-extension-design-CLOSE.md`.
**Risk classification:** Elevated under 0d-ii for the repo build (changes to existing user-facing functionality, dark); the two Critical arms named above are NOT this session's.

## Why this session matters

ADR-014 disposed the mentor's headline item — D17 progression deltas for agents — as **extend-existing**: the composite already runs live (M6/M7), `computeWindowSnapshot` already computes per-dimension trends + persisting sub-species passions and discards them, and sub-species frequency deltas are derivable from persisted columns. This session builds the **one shared delta module** (items 1+3) and its first projection (the `meta.trajectory` delta block), with the ADR's honesty guards baked in from the first line — per-signal evidence floors, `*_basis` fields, regime markers, provenance-mix disclosure, and the `(owner_user_id, agent_id)` identity-resolution module as its first consumer.

## Pre-conditions (HARD)

1. **S11a has run and the extraction regime is settled + version-marked** (ADR-014 §6; the R12 logic — computing baselines before the extraction question resolves bakes the starved regime into every baseline). Read the S11a close first; carry its regime-marker mechanism into this build. If S11a has NOT run, STOP and say so — this session is mis-sequenced.
2. ADR-014 is committed + pushed.
3. The trust-layer state is per the 2026-07-18 close (or read the latest close for drift).

## Part A — Open under the protocol

1. `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`
2. ADR-014 §§3.1, 3.3, 4, 5 — in full (the binding design)
3. The S11a close (the regime settlement this build inherits)
4. `/operations/decision-log.md` — last 2 entries
5. Anchors, first-hand: `website/src/lib/substrate/trajectory-overlay.ts` (whole file), `window-aggregator.ts:89-148, 333-460, 655-698`, `agent-assessment-history-store.ts` (read projection + row shapes), `sage-assent-bridge.ts:186-233`

Confirm at open: tier; hold-point (P0 0h); model selection (N/A — pure lib + projection; no new LLM call); status vocabulary; signals; KG1 (any new DB read is one indexed windowed query — the M7 latency budget precedent); KG7 (JSONB `passions_detected`).

## Part B — Scope

**In:**
1. **The identity-resolution module** (pure): canonical `(owner_user_id, agent_id)` pair; fallback chain pair → `credential_ref` (subsumes `install:`); the rotation-join seam with the honest **"window truncated by credential rotation"** disclosure where a join is not performed. ADR-014 §4 verbatim. Every longitudinal read in this build goes through it.
2. **The shared delta module** (pure lib beside the overlay; PR15 — extends `computeWindowSnapshot`'s outputs, re-implements nothing):
   - Surface the already-computed-and-discarded material: the four progress-dimension trends + `persisting_passions`.
   - Between-window per-mechanism deltas in D17's vocabulary: sub-species frequency (`fading|recurring|new|stable`), kathekon-quality trend, first-circle obligation trend (disclosed first-circle semantics), domain-engagement frequency. **No signal without a feeding column** — causal-stage/per-circle-obligation/Senecan signals are OUT (they need the row-widening decision, not read-side improvisation).
   - **Per-signal evidence floors:** compute only when the feeding field is non-empty in ≥3 window rows; else the distinct `insufficient_extraction` value — never a defaulted `stable`. Every signal carries its `*_basis` {input_count, empty_count}.
   - **Regime discipline:** rows are regime-marked per S11a's mechanism; windows split at regime boundaries; no delta compares across one.
3. **The `meta.trajectory` delta-block projection** — additive, behind a NEW flag (`SUBSTRATE_TRAJECTORY_DELTA_ENABLED` or similar; UNSET ⇒ byte-identical, test-asserted). Vocabulary record-descriptive past-tense per ADR-014 §5.
4. **The `depth_tier` read-projection addition** (additive column in the windowed read select — AE-3's future input; harmless now).
5. **The in-session election (AskUserQuestion):** `layer1_source` provenance — (a) persist a nullable column (schema; authored here, applied in the founder-walked arm) vs (b) exclude supplied-extraction consults from delta computation; either way the delta block carries the provenance-mix disclosure (`n_supplied/n_server`).
6. **Battery:** evidence-floor pins (starved window ⇒ `insufficient_extraction`, never `stable`); regime-split pins; identity-resolution pins (rotation truncation disclosed; cross-tenant impossibility — no agent_id-only read path); flag-off byte-identity; the projection's additive shape.

**Out (explicit):** the reflect projection (gated on reflect-store owner-scoping — ships NOTHING until then, per the one-record rule); AE-2's loop fold; AE-3; any schema application; any flag flip; the public trust-record surface.

## Part C — Procedure

1. Ground (Part A reads + re-verify the anchors).
2. The `layer1_source` election (AskUserQuestion) + any other fork that surfaces.
3. Build the three modules + projection, dark.
4. Battery + full regression sweep (trajectory-overlay, aggregator, store, reason-route byte-identity suites; `tsc`; `npm run build`).
5. Adversarial review (Workflow; dimensions at minimum: evidence-floor non-vacuity, flag-off byte-identity, identity/cross-tenant, regime-boundary correctness, claims-vs-code, envelope wording).
6. Records: decision-log entry + close per the cache templates; author the founder-walked activation prompt (flag + R18 docs for the new field + the weights-BLOCKED restatement) and, if elected, the schema-arm prompt.

## Anticipated session shape

| Phase | Estimate |
|---|---|
| Open + ADR §§ + anchors | 30–40 min |
| Election(s) | 10–15 min |
| Build (identity module + delta lib + projection) | 2–3 h |
| Battery + regressions | 45–60 min |
| Adversarial review + folds | 60–90 min |
| Records + activation prompt | 30–40 min |
| **Total** | **~5–6.5 h** |

## Rollback path

`git revert` the build commit (flag unset ⇒ byte-identical; nothing live). The founder-walked arms have their own rollback lines in their own prompts.

## Forecast

Success = the shared delta module exists dark with the ADR-014 guards structurally enforced (evidence floors + `*_basis` + regime splits pinned non-vacuously), the identity-resolution module is the single read path, flag-off is byte-identical, and the activation prompt is authored. AE-2 (the CI-4 fold) follows on the same identity module.

End of prompt.
