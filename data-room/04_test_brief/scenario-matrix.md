# 04 — Scenario Matrix (one scenario per configuration)

**Status:** Designed (0a). The scenarios are *specified* here; they are *run* by the orchestrator harness in later sessions (single-loop proof — L7 — first, per PR1). `05_outputs/` stays empty until a scenario is actually run, **except** Combination 1, whose negative assertion was verified in production 2026-05-24 (see `test-brief.md` A.2).
**Reads alongside:** `orchestrator-harness-design.md` (how the harness threads each scenario), `test-brief.md` (§A configurations, §B per-seam pass criteria, §C cross-cutting), `03_seam_map/seam-map.md` (the seams), `test-flag-config.md` (the genuine→200 trio + safety boundary).
**Tier:** `governance` — Standard risk. Specification only; no code/env/deploy.
**Date:** 2026-05-24.

---

## How to read this matrix

Each scenario names: the **configuration** (test-brief A.1 / A.2); the **Claude-generated inputs** the orchestrator feeds in (a representative example — the harness generates fresh inputs in the same shape per run); the **endpoints exercised** in order; the **seam(s) covered** (`03_seam_map/`); whether the harness must **drop to a `tsx` step** (only the Seam 2 bridge requires this); and the **pass assertion**, tied to test-brief §B.

All runs happen against the **test** environment per `test-flag-config.md` — never production. "Claude-generated inputs" means the orchestrator uses Claude to produce realistic scenario text (an agent's impression, a purpose-finding dialogue, a post-action review) so the products are exercised on real-shaped data, not toy fixtures.

**Coverage at a glance:**

| Scenario | Config | Endpoints | Seams | `tsx` step? | Headline assertion |
|---|---|---|---|---|---|
| L1 | Reasoning alone | `/api/reason` | — | no | 200 with a Layer-2/Layer-3 reasoned result |
| L2 | Calling alone | `/api/calling` | — (Calling-internal Hard Gate) | no | approved path → `DiscoveredPurpose`; incomplete → clarification, no handoff |
| L3 | Reflect alone | `/api/practice/reflect` | — (Reflect-internal) | no | 200 review; profile present but thin |
| L4 | Calling + Reasoning | `/api/calling` → `/api/reason` | **S1** | no | five slots survive into Layer 1 (no dropped slot) |
| L5 | Reasoning + Reflect | `/api/reason` → `/api/practice/reflect` | **S3** | no | profile updated via the engine (hysteresis), not hand-written |
| L6 | Full suite (all four) | all four, in loop order | **S1, S2, S3, S4** | yes (S2 bridge) | the loop closes; all four seams pass in sequence |
| L7 | Reasoning + Assent (no Reflect) | `/api/reason` → `/api/accreditation` | **S2** (+ bridge) | yes (S2 bridge) | **genuine→200 credential write**; no-practice disclaimer surfaced |
| Comb 1 | Assent **without** Reasoning | `/api/accreditation` | **S2-neg** | no | **no `provenance` → 422; forged → 403** (R18f enforced) |
| Comb 2 | Reasoning + Assent, no Reflect, sold as "practice" | (docs / discovery surfaces) | — (documentation) | no | no-practice disclaimer string present wherever offered |

---

## L1 — Sage Reasoning alone

| | |
|---|---|
| **Config** | test-brief A.1 L1 — most foundational; impression examination + false-judgement diagnosis |
| **Claude-generated input** | A single first-person impression an agent might form, e.g. *"A user is pressuring me to ship a feature I believe is unsafe; I feel I must comply to be useful."* Submitted to `/api/reason` as the impression text + minimal context. |
| **Endpoints** | `POST /api/reason` (API-key auth; `SUBSTRATE_LAYER2_SIGNING_ENABLED='true'`, `SUBSTRATE_LAYER3_ENABLED='true'`) |
| **Seams** | none (single endpoint) |
| **`tsx` step** | no |
| **Pass assertion** | `200` with a well-formed Layer-2 assessment **and** a Layer-3 prose result; the result is **honest about what it does** (examines the impression; does not claim ongoing practice). Ties to test-brief A.1 L1. |

## L2 — Sage Calling alone

| | |
|---|---|
| **Config** | test-brief A.1 L2 — purpose-finding; no downstream examination |
| **Claude-generated input** | A short purpose-finding dialogue: an agent describing its operational nature and the work in front of it, run through enough turns to reach **either** the approved Hard-Gate path **or** an incomplete-specs branch. Two variants generated: one complete, one deliberately incomplete. |
| **Endpoints** | `POST /api/calling` (Bearer `sr_assent_` auth; `SAGE_CALLING_ENABLED='true'`) |
| **Seams** | none crossing products — exercises Calling's **internal** Hard-Gate (D-14) assembly |
| **`tsx` step** | no |
| **Pass assertion** | approved path → a `DiscoveredPurpose` with the agent's **own verbatim words** in all five slots; **incomplete specs → a developer clarification and NO handoff**. Ties to test-brief A.1 L2 + seam-map S1 assertion (c). |

## L3 — Sage Reflect alone (unusual)

| | |
|---|---|
| **Config** | test-brief A.1 L3 — standalone session-close review over the developer's own infra |
| **Claude-generated input** | A description of a completed action and its outcome, with **no upstream Reasoning record feeding it** — so the review runs but the profile it can build is thin. Includes Q4-style material so the engine has something to score. |
| **Endpoints** | `POST /api/practice/reflect` (Bearer `sr_assent_` auth; `SAGE_REFLECT_ENABLED='true'`) |
| **Seams** | none crossing products — Reflect-internal; S3 not exercised here because there is no Reasoning upstream |
| **`tsx` step** | no |
| **Pass assertion** | `200` review output; the profile update is **present but thin** (no Reasoning feed). Ties to test-brief A.1 L3. |

## L4 — Calling + Reasoning (Seam 1)

| | |
|---|---|
| **Config** | test-brief A.1 L4 — find the work, then examine the impressions in doing it |
| **Claude-generated input** | The L2 *complete* purpose-finding dialogue (approved path), reused — its `DiscoveredPurpose` is the input to Reasoning. |
| **Endpoints** | `POST /api/calling` (approved path) → thread five-spec → `POST /api/reason` |
| **Seams** | **S1** — Calling five-spec → substrate Layer 1 |
| **`tsx` step** | no |
| **Pass assertion** | the handoff is **accepted by Layer 1** and **all five slots survive** into the Layer 1 schema (no dropped/mis-slotted field); the orchestrator prints the five input slots beside what Layer 1 received for founder comparison. Ties to test-brief §B **S1** + seam-map S1 assertions (a)+(b). |

## L5 — Reasoning + Reflect (Seam 3)

| | |
|---|---|
| **Config** | test-brief A.1 L5 — examine, act, review; the examination↔reflection loop intact |
| **Claude-generated input** | An impression for `/api/reason` (as L1), then a Q4 `KathekonAssessment[]` review of the action taken, fed to `/api/practice/reflect`. |
| **Endpoints** | `POST /api/reason` → (act) → `POST /api/practice/reflect` |
| **Seams** | **S3** — Reflect outcome → Assent profile (via in-process `sage-assent-feed.ts`) |
| **`tsx` step** | no (S3 is an in-process write, verified by DB query, not the bridge) |
| **Pass assertion** | a DB query of the **test** project shows `agent_accreditation` updated **via the engine** (grade moves on evidence + hysteresis, **never** hand-written); the **FK-seed branch fires** for a brand-new test agent; **SR-15 per-domain proximity** is written. Ties to test-brief §B **S3** + seam-map S3 assertions (a)+(b)+(c). |

## L6 — Full suite (all four)

| | |
|---|---|
| **Config** | test-brief A.1 L6 — the complete cycle; the loop closes |
| **Claude-generated input** | The full journey: L2 complete dialogue → its five-spec into Reasoning → the signed assessment into a genuine credential write → a Q4 review into Reflect → consume the `exit_path`. |
| **Endpoints** | `POST /api/calling` → `POST /api/reason` → `POST /api/accreditation/[agent_id]` → `POST /api/practice/reflect` → (re-enter per `exit_path`) |
| **Seams** | **S1, S2, S3, S4** — all four, in order |
| **`tsx` step** | **yes** — the **Seam 2 bridge** (`sage-assent-bridge.ts`) is run as a `tsx` step on the same signed assessment (per harness design §5); separate from the credential write |
| **Pass assertion** | each seam passes its §B criterion **in sequence**, and **S4 closes the loop**: the `exit_path` is **actually consumed** — "purpose holds" re-enters `/api/reason`, "purpose complete" re-enters `/api/calling` (not merely that the string is correct). Ties to test-brief §B **S1–S4**. |

## L7 — Reasoning + Assent, no Reflect (the genuine→200 centrepiece)

| | |
|---|---|
| **Config** | test-brief A.1 L7 — legitimate single-session credentialing; **must carry the no-practice disclaimer** |
| **Claude-generated input** | An impression for `/api/reason` (as L1). The harness takes the returned **signed assessment** `{ assessment, signature, key_id }` and submits it as the credential write's `provenance`. |
| **Endpoints** | `POST /api/reason` → `POST /api/accreditation/[agent_id]` (genuine→200 recipe) |
| **Seams** | **S2** — signed `Layer2Assessment` → credential write (positive path) + the bridge |
| **`tsx` step** | **yes** — the Seam 2 **bridge** `tsx` step (assert `EvaluatedAction.receipt_id === SHA-256(signature)`), separate from the write |
| **Pass assertion** | **(a)** the credential write returns **`200`** — the **genuine→200 path** (requires the three-condition trio in `test-flag-config.md`: signing on; matching key-pair + recognised `key_id`; gate on with `SUBSTRATE_LAYER2_PUBLIC_KEY`); **(b)** the **no-practice disclaimer string** is surfaced wherever this config is offered (shares the Combination-2 assertion); **(c)** the bridge `tsx` step yields a well-formed `EvaluatedAction` with the SHA-256(signature) `receipt_id`. **This is the PR1 single-loop proof** (built first). Ties to test-brief A.1 L7 + §B **S2(a)**. **Positive control for the negatives:** a 200 here on the same env proves the negatives below fail for the *right* reason (forgery), not a key mismatch ("false 403"). |

---

## Combination 1 — Sage Assent **without** Sage Reasoning (the headline negative)

| | |
|---|---|
| **Config** | test-brief A.2 Combination 1 — **BLOCKED, API-enforced** (R18f). A virtue-stamp on reasoning never examined is a false credential. |
| **Claude-generated input** | Two write attempts against `/api/accreditation/[agent_id]` with a **valid** test `sr_assent_` token but: **(i)** no `provenance` field at all; **(ii)** a **forged/tampered** `provenance` (a fabricated or mutated `signed_assessments[]` that no genuine `/api/reason` produced). |
| **Endpoints** | `POST /api/accreditation/[agent_id]` only (no Reasoning upstream — that is the point) |
| **Seams** | **S2-neg** — the write-boundary rejection |
| **`tsx` step** | no |
| **Pass assertion** | **(i)** no `provenance` → **`422 bad_provenance`**; **(ii)** forged → **`403 no_examination`**; **no `agent_accreditation` row is written** in either case. **Status: PASSING** — verified in production 2026-05-24 (gate Live). Ties to test-brief A.2 Combination 1 + §B **S2-neg** + seam-map S2 assertion (b). **Validity guard:** only trust this result if L7 returns 200 on the same env (else a 403 could be a key mismatch, not a forgery rejection). |

## Combination 2 — Reasoning + Assent, no Reflect, marketed as a "practice"

| | |
|---|---|
| **Config** | test-brief A.2 Combination 2 — **documentation-gated**. Legitimate use; the unsupported thing is the *claim* of an ongoing "practice". |
| **Claude-generated input** | none at runtime — this is a **documentation assertion**, not an endpoint drive. The check inspects the surfaces where the config is offered/described. |
| **Endpoints** | none (docs / discovery surfaces: developer docs, `llms.txt`, `agent-card.json`, limitations page) |
| **Seams** | none — cross-cutting documentation property |
| **`tsx` step** | no |
| **Pass assertion** | the **no-practice disclaimer** string is **present, plain-language, and accurate** wherever this config is offered. **Blocked on Priority 4** writing the disclaimer text (test-brief A.3) — until then this row is *specified but not runnable*. Ties to test-brief A.2 Combination 2 + A.3. |

---

## Notes for the build session

- **Build L7 first** (PR1 single-loop proof). It is the only positive scenario that exercises the genuine→200 centrepiece, and it is the **positive control** that makes the Combination-1 negative trustworthy.
- **Only L6 and L7 need the Seam 2 bridge `tsx` step.** Every other scenario is pure HTTP + (for L5) a DB query.
- **Combination 2 is blocked on Priority 4** (disclaimer text not yet written). **C2 (distress perimeter, test-brief §C)** is **Critical-tier** and out of scope for the Standard build sessions — mapped, not built here.
- **Determinism:** keep `TRANSLATION_SANDWICH_PARALLEL_RUN='false'` in the test env for reproducible runs unless a scenario is specifically about parallel-run (per `test-flag-config.md`).

*End of scenario matrix. Nine scenarios specified (L1–L7 + two negatives); L7 is the single-loop proof built first; outputs land in `05_outputs/` as scenarios are run.*
