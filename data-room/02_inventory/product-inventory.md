# 02 — Product Inventory + Authority Ranking

**Purpose:** A grounded source inventory of the four products — design doc, route, code, tests, schema, env-flags, and **honest status** — so the whole-system test is built on what actually exists, not on what the stale guides describe. Status terms use the 0a implementation vocabulary (`Scoped → Designed → Scaffolded → Wired → Verified → Live`).

**Grounding rule (brief §7):** statuses below are taken from the **May 2026 decision-log** + the **code/tests** + the **adopted design docs**, never from the top-level guides or the component registry (both stale — see Authority Ranking and `99_review/conflict-log.md`).

---

## Stage 1 — Sage Calling (pre-action · purpose)

| Field | Value |
|---|---|
| **Function** | Find the fitting work; on the approved path, assemble a five-specification handoff to the substrate, or return a developer clarification |
| **Status (0a)** | **Live**, gated `SAGE_CALLING_ENABLED`. Stage 1 + Stage 2 Wired/Verified/Live 2026-05-21; E#1 (Agent-Card verdict-persist) Verified 2026-05-23 |
| **Design doc** | `/adopted/purpose-discovery-product-design.md` (553 lines) |
| **Route** | `website/src/app/api/calling/route.ts` |
| **Library** | `website/src/lib/sage-calling/` — `engine.ts`, `calling-service.ts`, `agent-card.ts`, `question-library.ts`, `session-store.ts` |
| **Tests** | `…/sage-calling/__tests__/` — `engine`, `calling-service`, `agent-card`, `question-library`, `session-store`, **`r18d-adversarial`** (6 files) |
| **Schema** | `website/supabase-discovery-sessions-migration.sql`, `…-discovery-sessions-agent-card-role-hint-migration.sql` → `discovery_sessions` |
| **Env flags** | `SAGE_CALLING_ENABLED` |
| **Decision-log anchors** | `D-SAGE-CALLING-STAGE1/STAGE2-…-2026-05-21`, `D-SAGE-CALLING-E1-AGENT-CARD-VERDICT-PERSIST-2026-05-23` |

## Stage 2 — Sage Reasoning / the substrate (in-action · impression & assent)

| Field | Value |
|---|---|
| **Function** | Examine the impression and reason it through — the translation-sandwich substrate itself: Layer 1 (text → features, open, Sonnet) → Layer 2 (deterministic Stoic mechanisms, closed, Ed25519-signed) → Layer 3 (structured → prose, closed) |
| **Status (0a)** | **A7 Verified**. `/api/reason` behaviour **byte-identical to pre-A7 cutover** in production |
| **Design doc** | `/adopted/ADR-stoic-agent-substrate-concept.md` (190 lines); architecture constraint `/manifest.md` **AC8** (translation-sandwich) + AC9 (Layer2Decision envelope) |
| **Route(s)** | `website/src/app/api/reason/route.ts` (live); `…/api/substrate/layer3/route.ts` (**503** in prod — `SUBSTRATE_LAYER3_ENABLED` unset); `…/api/public-key/route.ts` (Ed25519 verification key) |
| **Library** | `website/src/lib/translation-sandwich/` — `layer1-extractor.ts`, `layer2-mechanisms.ts`, `layer2-canonical-json.ts`, `layer2-signer.ts`, `layer3-prose.ts`, `parallel-run.ts`, `tier1-token.ts`. Plus `website/src/lib/substrate/` services (`layer3-service.ts`, `agent-mode-service.ts`, `philosophical-mode-service.ts`, `r20a-gate.ts`, `score-architecture.ts`) |
| **Tests** | `…/translation-sandwich/__tests__/` — `layer1-schema-additions`, `layer2-canonical-json`, `layer2-signer` (3); plus substrate `__tests__/` `layer3-service`, `score-architecture`, `r20a-gate`, etc. |
| **Schema** | `website/migrations/2026-05-04-translation-sandwich-comparisons.sql`, `…-translation-sandwich-cost-tracker.sql` |
| **Env flags** | `SUBSTRATE_LAYER2_SIGNING_ENABLED`, `SUBSTRATE_LAYER3_ENABLED` (unset→503), `SUBSTRATE_R20A_GATE_ENABLED` (unset), `TRANSLATION_SANDWICH_PARALLEL_RUN`, `ANTHROPIC_API_KEY` |
| **Model selection** | per AC1: Layer 1 = Sonnet; Layer 3 = Sonnet; quick-depth `/api/reason` = Haiku; standard/deep = Sonnet |

## Stage 3 — Sage Assent (at-action · impulse → act)

| Field | Value |
|---|---|
| **Function** | Credential or block the act; hold the agent's persistent, verifiable profile/badge |
| **Status (0a)** | **A10 Live + Verified**. Write path Wired/Verified 2026-05-16; A10 (per-agent credentials + revocation) Wired/Verified 2026-05-21 |
| **Design docs** | `/adopted/sage-assent-a10-design.md` (881), `/adopted/sage-assent-write-path-design.md` (382), `/adopted/substrate-modes/sage-assent-wrapper-spec.md` (331) |
| **Route** | `website/src/app/api/accreditation/[agent_id]/route.ts` (POST = write/credential; GET = public badge) |
| **Library** | `website/src/lib/substrate/` — `sage-assent-accreditation-writer.ts`, `…-accreditation-store.ts`, `sage-assent-bridge.ts`, `sage-assent-wrapper.ts`, `sage-assent-iteration-patterns.ts`, `sage-assent-tree-search-adapter.ts`; ported pure engine under `…/substrate/trust-layer/` (window-aggregator, grade-transition-engine, accreditation-record) |
| **Tests** | substrate `__tests__/` — `sage-assent-accreditation-writer`, `…-accreditation-store`, `…-bridge`, `…-wrapper`, `…-iteration-patterns`, `…-tree-search-adapter`, `agent-hand-back-report` |
| **Schema** | `website/supabase-agent-accreditation-migration.sql` + `…-a10-migration.sql` + `…-typical-deliberation-breadth-…` + `…-typical-kathekon-quality-…`; `…-evaluated-actions-migration.sql`; `…-credential-audit-migration.sql`; `…-api-keys-a10-migration.sql`; `…-api-keys-phase3-scope-rename-migration.sql` |
| **Env flags** | `SUBSTRATE_WRITE_PATH_ENABLED='true'` (A10 kill-switch), `PLUGIN_AUTH_ENABLED`, `PLUGIN_AUTH_SECRET` |
| **Credential** | `Bearer sr_assent_…` token; DB scope `sage_assent_write`; bound to `agent_id`; revocable; audited (`credential_audit`) |
| **Decision-log anchors** | `D-ATL-WRITE-PATH-BUILD-WIRED-VERIFIED-2026-05-16`, `D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21` |

## Stage 4 — Sage Reflect (post-action · continuous attention)

| Field | Value |
|---|---|
| **Function** | Review what occurred, update the profile, decide if the purpose still fits; route back into the loop |
| **Status (0a)** | **Live / Verified**, gated `SAGE_REFLECT_ENABLED='true'` (master kill-switch; 503 until set). Stage A + Stage B Wired/Verified + live-verified 2026-05-22 |
| **Design doc** | `/adopted/sage-reflect-product-design.md` (383 lines) |
| **Route** | `website/src/app/api/practice/reflect/route.ts` (kill-switch SR-13; 503 if flag ≠ `'true'`) |
| **Library** | `website/src/lib/sage-reflect/` — `engine.ts`, `reflect-service.ts`, `reflect-extractor.ts`, `sage-assent-feed.ts` (the seam to Stage 3), `evaluated-actions-store.ts`, `proximity-domains.ts`, `zone3-boundary.ts`, `question-bank.ts`, `session-store.ts`, `reflect-cost-tracker.ts` |
| **Tests** | `…/sage-reflect/__tests__/` — `engine`, `reflect-service`, `sage-assent-feed`, `proximity-domains`, `zone3-boundary`, `session-store`, `reflect-cost-tracker`, `reflect-q5-ambiguity`, **`r18d-adversarial`** (9 files) |
| **Schema** | `website/supabase-sage-reflect-migration.sql`, `…-sage-reflect-a1-cross-session-migration.sql`, `…-sage-reflect-cost-tracker-migration.sql` |
| **Env flags** | `SAGE_REFLECT_ENABLED='true'` |
| **Exit routing** | `ExitPath = 'sage_reasoning' | 'sage_calling'` (engine.ts) — RS-1 → Reasoning (purpose holds); RS-2/RS-3 → Calling (purpose complete / needs revision) |
| **Decision-log anchors** | `D-SAGE-REFLECT-STAGE-A/STAGE-B-BUILD-WIRED-VERIFIED-2026-05-22`, `…-METERING-FIX-AND-LIVE-VERIFICATION-2026-05-22` |

---

## Authority ranking — which sources to trust (brief §7)

The single most important room-building fact: **the top-level guides are a stale source.** A test grounded in them would test the wrong system.

### Current-authoritative — ground the test in these

1. **The May 2026 decision-log** (`/operations/decision-log.md`, active entries) — the live record of what was built and its status.
2. **The four adopted design docs** — `sage-assent-a10-design.md`, `sage-reflect-product-design.md`, `purpose-discovery-product-design.md`, `substrate-modes/sage-assent-wrapper-spec.md` (+ `sage-assent-write-path-design.md`).
3. **The code + test suites** under `website/src/lib/{substrate,translation-sandwich,sage-reflect,sage-calling}/`.
4. **The SQL migrations / schemas** under `website/*.sql` and `website/migrations/`.
5. **The manifest** rules + architectural constraints (R18f, R19e, AC5 R20a perimeter, AC8 substrate) — current.

### Background / status-superseded — history + human-practitioner framing only, NOT authoritative for current four-product behaviour

| Source | Why it's superseded |
|---|---|
| `/PROJECT_STATE.md` (20 Apr) | Pre-rename; predates the four-product naming |
| `/users-guide-to-sagereasoning.md`, `/summary-tech-guide.md` (April) | Use the old "three product layers / Agent Trust Layer" framing; pre-date the May build arc |
| `/website/public/component-registry.json` (v1.5.0, 2 May) | Predates the May build arc → its statuses **lag the code** (e.g. it does not reflect A10 Live, Sage Reflect Live, or the E#1 fix) |

Conflicts these create are logged in `99_review/conflict-log.md`. What we don't yet have is logged in `99_review/missing-context.md`.
