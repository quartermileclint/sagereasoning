# Whole-System Test Data-Room Brief — The Four Products as One System

**Status:** Draft (per 0e — documents under review). **Decision status:** Under review. **Implementation status:** Scoped — the data room and the test harness are built in later sessions; this brief is their specification.
**Stream:** founder.
**Tier of the session that produced this:** `governance` — Standard risk. **Development-only; no code was written.**
**Date:** 2026-05-23.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Source inputs:** the four-product orientation (this session's open); the 2026-05-23 private-mentor consultation on selective offering (folded into §3); the three 2026-05-22 inbox items (Nate B. Jones "Prompt Kit — build the room before you write"; "using both Cowork and Claude Code").
**Purpose:** Specify the bounded, non-destructive workspace ("data room") in which the four products will be tested *as one system*, and the configuration rules that govern what is even valid to test or offer. This is the Priority-0 deliverable of the selective-offering session. **The data room and harness are built later, against this brief.**

---

## 1. Why a data room (the discipline)

The two "Prompt Kit" inbox items make one argument: **prepare the room before you produce the artifact** — inventory the sources, rank their authority, surface the conflicts, list what is missing — so the work is grounded and inspectable rather than guessed at. For us, the "artifact" is not a memo; it is a *trustworthy whole-system test*. The room is what makes that test grounded.

Each of the four products has its own passing test suite and is individually at Verified or Live. **What is untested is the system** — the handoffs between products, the consistency of the shared engine across them, the safety perimeter across the whole loop, and the state trail a full journey leaves behind. The data room exists to make that system legible before we test it.

## 2. The system under test

The four products form one cycle — the "Sage Practice" loop — wrapped around an agent's full decision process, over one shared engine.

| Stage | Product | Discipline | Function | Current status |
|---|---|---|---|---|
| 1 (pre-action) | **Sage Calling** | Purpose | Find the fitting work; hand a five-spec input to the substrate, or return a developer clarification | **Live**, gated `SAGE_CALLING_ENABLED`; E#1 Verified 2026-05-23 |
| 2 (in-action) | **Sage Reasoning** | Impression / assent | Examine the impression, reason it through (the translation-sandwich substrate itself) | Substrate **A7 Verified** |
| 3 (at-action) | **Sage Assent** | Impulse → act | Credential or block the act; hold the agent's persistent, verifiable profile/badge | **A10 Live + Verified** |
| 4 (post-action) | **Sage Reflect** | Continuous attention | Review what occurred, update the profile, decide if the purpose still fits | **Live / Verified**, gated `SAGE_REFLECT_ENABLED=true` |

The loop closes: Reflect routes back to Reasoning (purpose holds) or to Calling (purpose complete / needs revision).

The shared engine is the **translation-sandwich substrate**: Layer 1 (text → structured features, open, Sonnet) → Layer 2 (deterministic Stoic mechanisms; closed; Ed25519-signed) → Layer 3 (structured → prose by `prose_mode`; closed; with R3/R19/R20a statements injected by code, not the model). The core promise is **two front-ends, one substrate**: humans on `sagereasoning.com` and agents via the plugin/API both call the same Layer 2 + Layer 3.

## 3. The offering constraint — configuration rules

> **Status of these rules: PROPOSED, pending formal adoption at Priority 1** (decision-log entry + manifest rule + ADR for the enforcement seam). They are stated here so the test matrix can be scoped. They are **not yet adopted governance**. Source: the 2026-05-23 private-mentor consultation.

The mentor's ruling: the products **can** be offered selectively, but **two specific combinations are misaligned** and must be named explicitly as unsupported. There is **one hard dependency** (enforced in code) and **one documentation requirement** (enforced in the developer docs). Everything else is the developer's choice.

**The hard dependency (API-enforced):** *Sage Assent requires a completed SageReasoning pass.* A credential certifies that an impulse was examined and found to accord with virtue; issuing it without the examination that justifies it is a **false credential** — the pressure-assent failure mode built into the infrastructure. This must be **structurally prevented, not merely discouraged.**

**The documentation requirement:** *Any configuration without Sage Reflect must carry a plain-language note that it supports virtue-grounded reasoning in individual sessions but not ongoing virtue development, progress tracking, or profile consolidation — and must not be represented as an ongoing Stoic "practice."* The misalignment here is in the marketing claim, not the product function.

### Supported configurations (legitimate)

| Configuration | Supported? | Note |
|---|---|---|
| Sage Reasoning alone | Yes | Most foundational; impression examination + false-judgement diagnosis. Honest about what it does. |
| Sage Calling alone | Yes | Purpose-finding / role-appropriate work. (No downstream examination — developer's architectural choice.) |
| Sage Reflect alone | Yes (unusual) | Standalone session-close review over the developer's own reasoning infra; the updated profile is thinner without Reasoning feeding it. |
| Sage Calling + Sage Reasoning | Yes | The most natural partial config — find the work, examine the impressions in doing it. |
| Sage Reasoning + Sage Reflect | Yes | Examine, act, review — a genuine partial practice; the examination↔reflection loop is intact. |
| Full suite (all four) | Yes | The complete cycle. |
| Sage Reasoning + Sage Assent **(no Reflect)** | Yes, **with disclaimer** | Legitimate for single-session, virtue-grounded decision-making. **Must carry the no-practice disclaimer.** |

### Misaligned configurations (named as unsupported)

| Combination | Disposition | Why |
|---|---|---|
| **1 — Sage Assent without Sage Reasoning** | **BLOCKED (API-enforced)** | False credential: a virtue-stamp on reasoning never examined by the sequence that makes the stamp meaningful. |
| **2 — Reasoning + Assent without Reflect, *marketed as a "practice"*** | **Documentation-gated** | The examination and credential are real, but "practice" implies return + consolidation, which only Reflect provides. Legitimate use; unsupported *claim*. |

## 4. The configuration test matrix (Priority 2)

The whole-system test space is **not** "any subset of four products." It is the table below. Each row is a required test once the harness exists.

| Configuration | Expected behaviour | How it is tested |
|---|---|---|
| Each legitimate config (§3 table) | Runs end-to-end **and** is honestly described | Positive path: drive the config; confirm correct output + correct documentation/positioning for what it provides |
| **Combination 1 (Assent w/o Reasoning)** | **API rejects the credential write** with the dependency error | **Headline negative test** — attempt a Sage Assent credential with no valid SageReasoning provenance; assert rejection (not a 200) |
| **Combination 2 (no Reflect)** | The no-practice disclaimer is present wherever the config is offered/described | Assert the disclaimer string is surfaced in the developer docs / discovery surfaces for this config |
| The disclaimer itself (Priority 4 output) | Present, plain-language, accurate | Once drafted, assert its presence across docs, `llms.txt`, `agent-card.json`, limitations page |

**Note:** Combination 1's negative test is the single most important whole-system assertion the harness must make — it is the proof that the integrity rule is enforced and not merely written down.

## 5. Whole-system test surfaces

The seams (the heart) and the cross-cutting concerns the harness must cover:

1. **The four seams.** Calling's five-spec → substrate Layer 1; the substrate's signed `Layer2Assessment` → an Assent `EvaluatedAction`; Reflect's outcome → Assent's profile (via `sage-assent-feed.ts`); Reflect's exit routing → the correct next product. (The E#1 fix this week was a dropped-seam case — a verdict computed then discarded — so seams are the known risk class.)
2. **Shared-substrate consistency.** Confirm the human path and the agent path produce the same authoritative reasoning from the same Layer 2 + Layer 3.
3. **R20a distress perimeter across the *whole* loop.** Proven on `/api/reason` today; the system test asks whether distress entering at any product is caught and redirected. (Critical-tier when built; here we map where the perimeter must hold.)
4. **State and audit trail.** `discovery_sessions` → `agent_accreditation` / `evaluated_actions` / `grade_history` / `credential_audit` → reflect store. A full journey should leave one coherent, auditable trail.
5. **Credentials end-to-end (A10).** A real test `sr_assent_` credential — scoped (`sage_assent_write`), used to write, audited, revocable — exercised through the loop.
6. **Environment-flag configuration.** Define the *test* flag-config that turns the loop on (`SAGE_CALLING_ENABLED`, `SAGE_REFLECT_ENABLED`, `SUBSTRATE_WRITE_PATH_ENABLED`; Layer-3 + R20a substrate gates). It is, by design, different from production — naming that difference is itself a safety control.
7. **Both front-ends.** Human website flows (via the `webapp-testing` / Playwright skill — render, drive, screenshot the distress-redirect UI) and the agent API loop.
8. **Adversarial containment across stages (R18d).** A spoof at one stage (e.g. a poisoned Agent Card at Calling) must stay contained and not corrupt downstream state.

## 6. The data-room structure

A bounded, non-destructive workspace, adapted from the Prompt Kit's structure and the project's sources of truth (Vercel / Supabase / GitHub `main`):

- `00_baseline/` — the known-good state preserved and never experimented on: Parked-2 Verified, Vercel green, byte-identical to post-E1. The comparison + rollback anchor.
- `02_inventory/` — a source inventory of the four products: design doc, test suite, schema, env-flags, status, and **authority ranking** per product (see §7).
- `03_seam_map/` — the four handoffs documented as the things under test (the room's centre of gravity).
- `04_test_brief/` — the working test brief: the configuration matrix (§4), success criteria per seam, the test flag-config, and the 0c verification method for each (so the founder can verify without reading code).
- `05_outputs/` — test-run results and observations.
- `99_review/` — the conflict log (§7) and the missing-context list (§7).

**Location recommendation (founder to confirm at build time):** in-repo, on a **dedicated branch** — keeps the room under the same source-of-truth discipline while the branch keeps it off `main`. Alternative: a fully separate workspace (lighter; must be consciously kept in sync).

## 7. Authority ranking — the grounding move

The single most important room-building fact from the orientation: **the top-level guides are a stale source.** A test grounded in them would test the wrong system.

- **Current-authoritative (ground the test in these):** the May 2026 decision-log entries; the four adopted design docs (`sage-assent-a10-design.md`, `sage-reflect-product-design.md`, `purpose-discovery-product-design.md`, `substrate-modes/sage-assent-wrapper-spec.md`); the code + test suites under `website/src/lib/{substrate,translation-sandwich,sage-reflect,sage-calling}/`; the SQL migrations/schemas.
- **Background / status-superseded (history + human-practitioner framing only, NOT authoritative for current four-product behaviour):** `PROJECT_STATE.md` (20 Apr — pre-rename); `users-guide-to-sagereasoning.md` and `summary-tech-guide.md` (April — "three product layers / Agent Trust Layer" framing); `component-registry.json` (2 May — predates the May build arc, so its statuses lag the code).

**Conflict log (seed):** stale-docs-vs-code (above); the consciously-retained `trust-layer/` directory name (recorded residual per `D-PARKED2-…-2026-05-23`); any registry status that disagrees with current code.

**Missing-context list (seed):** there are currently **no** end-to-end loop fixtures; **no** "one real agent journey" dataset; **no** defined whole-system baseline; **no** adopted configuration rule yet (Priority 1). This list is precisely what the later build/harness sessions fill.

## 8. Cowork / Claude Code dual-system safety

The room is the ideal first place to use the Code tab, because it is a bounded, non-production workspace where a mistake cannot reach the live system. Model: **Cowork = the deterministic governance/execution system; Claude Code = the R&D/exploration layer.** They share the same project assets and only diverge if shared assets change in one without the other keeping up.

Safety mechanics to put around first Code use:

1. **Work on a branch (or git worktree), never directly on `main`.** Production-tracked `main` stays clean.
2. **No production writes during testing** — test logins/data only ("no current users" holds). Do not point Code at production Supabase or live Vercel env.
3. **Keep governance edits in Cowork** (decision log, manifest, adopted docs) so nothing drifts. Use Code for the test workspace and code experiments.
4. **Use the safety net:** checkpoints / `/rewind` (Esc Esc) restore code/conversation/both — but they cover *Claude's* edits, **not your own edits or bash commands**, so combine with git commits. Start in **manual approval + plan mode**; do **not** use auto mode while learning. Scope the **sandbox** (filesystem + network isolation) to the room.
5. **Mind `.git/index.lock`** (flagged in the Parked-2 close): if GitHub Desktop and Code both touch git, close/reopen GitHub Desktop or `rm -f .git/index.lock`.
6. **Your governance travels with you:** `CLAUDE.md` at the repo root auto-loads in Code and points at the caches; risk classification, the verification framework, and the Critical Change Protocol all still apply.

## 9. Anthropic-native tooling to build on (PR15)

Before any bespoke harness, build on existing infrastructure:

- **`webapp-testing` (Playwright)** — installed at `.claude/skills/anthropic/`; drives the human front-end (render pages, drive flows, screenshot the distress-redirect UI).
- **Claude Code sub-agents** — orchestrate a scripted agent journey through the API loop.
- **The `sage-*` internal skills** — `sage-registry-audit` (status reconciliation), `sage-consult` (substrate dogfooding), `sage-flows-update`, `sage-wiring-fix`.
- **The existing plain-`tsx` assertion-test pattern** — the harness extends this, not greenfield.
- **Checkpoints + sandbox** — the safety substrate for running tests in Code.

A whole-system test run is itself the dogfooding mandate (PR16): running an agent through the loop exercises the products on real data, and the dependency gate (§3) is validated by the same run that exercises it.

## 10. Deferred / open items

- **Build the data room** — later session (against this brief).
- **Design the test harness** — later session (Priority 2 onward), built on §9.
- **The dependency rule's enforcement seam** — Priority 1 ADR (`/operations/handoffs/founder/2026-05-23-P1-sage-assent-dependency-enforcement-NEXT-SESSION-PROMPT.md`). The eventual *build* of the gate is Critical (Critical Change Protocol).
- **The disclaimer language + the "Sage Practice" naming-vs-partial-config question** — Priority 4.
- **Reconcile the Sage Reflect design doc's "no stage is optional / no stage can be bypassed" language** with the mentor's "selective offering is legitimate" — Priority 3 (governance edit to an adopted doc; founder approval required).
- **First test approach** — recommendation: one manual founder-verified loop first (PR1 single-loop-proof; "manual process first" per 0g), then automate.

## 11. Cross-references

- `/operations/handoffs/founder/2026-05-23-selective-offering-data-room-brief-close.md` — the session close that produced this brief.
- `/operations/handoffs/founder/2026-05-23-P1-sage-assent-dependency-enforcement-NEXT-SESSION-PROMPT.md` — the Priority-1 prompt (rule + ADR).
- `/operations/handoffs/founder/2026-05-23-four-product-orientation-OPEN-TASK-NEXT-SESSION-PROMPT.md` — the orientation prompt this session opened on.
- `/adopted/ADR-stoic-agent-substrate-concept.md` — the shared substrate (two front-ends, one substrate).
- `/adopted/sage-reflect-product-design.md`, `/adopted/purpose-discovery-product-design.md`, `/adopted/sage-assent-a10-design.md`, `/adopted/substrate-modes/sage-assent-wrapper-spec.md` — the four product designs (current-authoritative).
- `/adopted/sage-assent-write-path-design.md` — the credential write path (the enforcement seam's home).
- `/manifest.md` — R18 (honest certification / Character Kernel / badge transparency), R19 (honest positioning / limitations), R20 (active protection), R18d (adversarial), AC7 (auth surface), AC8 (substrate).

*End of brief. Development-only artefact; no code written. The data room and harness are built in later sessions. The configuration rules in §3 are proposed and pending adoption at Priority 1.*
