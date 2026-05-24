# 04 — Whole-System Test Brief

**Purpose:** define what gets tested, what counts as a pass, and **how the founder verifies each result without reading code** (the 0c verification framework). This brief is the input to the manual-loop session (Step 7) and the automated harness.

**Status:** the matrix and verification methods are **defined** here; the full in-room manual loop has **not** been *run* yet (room build is Steps 1–6 only), so `05_outputs/` stays empty until the manual loop runs. **Exception:** the **Combination-1** negative assertion (A.2 / S2-neg) was **verified in production on 2026-05-24** via the gate build's post-deploy check (R18f enforced; no-provenance → 422, forged → 403), so that row is recorded here as **passing**.

**The 0c verification framework (project instructions 0c) — how a row is verified:**

| Work type under test | Founder verification method |
|---|---|
| Website page / human flow | Open the URL; check content matches the expected result |
| API endpoint | AI provides a test command (curl / `npx tsx`); founder runs it; compares to expected output |
| Database effect | AI provides a query + shows the expected result; founder confirms |

All test runs happen in a **test** environment per `test-flag-config.md` — **never production**.

---

## A. The configuration test matrix (brief §4)

The whole-system test space is **not** "any subset of four products." It is exactly this table. R18f + R19e (Adopted 2026-05-23) govern which configurations are even valid to offer.

### A.1 — Supported (legitimate) configurations — positive path

For each: drive the config end-to-end; confirm correct output **and** honest description/positioning for what it provides.

| # | Configuration | Expected behaviour | 0c verification method |
|---|---|---|---|
| L1 | **Sage Reasoning alone** | Examines an impression, returns reasoned output; honest about what it does | API: POST `/api/reason` with a sample impression → 200 with a Layer-2/Layer-3 reasoned result |
| L2 | **Sage Calling alone** | Purpose-finding session runs; no downstream examination | API: POST `/api/calling` through a session → on the approved path, a `DiscoveredPurpose`; on incomplete specs, a developer clarification |
| L3 | **Sage Reflect alone** (unusual) | Session-close review runs over the developer's own infra; profile is thinner without Reasoning feeding it | API: POST `/api/practice/reflect` (flag on) → 200 review output; confirm profile update is present but thin |
| L4 | **Calling + Reasoning** | Find the work, then examine impressions in doing it | Loop: L2 → hand the five-spec into `/api/reason` → confirm Seam 1 carries the five fields |
| L5 | **Reasoning + Reflect** | Examine, act, review — examination↔reflection loop intact | Loop: `/api/reason` → `/api/practice/reflect` → confirm the profile is updated via Seam 3 |
| L6 | **Full suite (all four)** | The complete cycle, loop closes | The full manual loop (Step 7); all four seams exercised in order |
| L7 | **Reasoning + Assent (no Reflect)** | Legitimate single-session credentialing — **must carry the no-practice disclaimer** | API: the config runs; **AND** the no-practice disclaimer string is surfaced wherever the config is offered (see C2 below) |

### A.2 — Misaligned configurations — named as unsupported

| Combination | Required disposition (per R18f/R19e) | Expected result **TODAY** | 0c verification method |
|---|---|---|---|
| **Combination 1 — Sage Assent *without* Sage Reasoning** | **BLOCKED, API-enforced** — a virtue-stamp on reasoning never examined is a false credential | **✅ PASSING — ENFORCED (Live 2026-05-24).** The option-(a) Ed25519 write-boundary gate is **Wired + Verified in production** behind `SUBSTRATE_PROVENANCE_GATE_ENABLED='true'`. A token-authenticated credential write with no genuine SageReasoning provenance is **rejected at the write boundary**, not persisted: no `provenance` field → **422 `bad_provenance`**; forged/tampered provenance → **403 `no_examination`**. No accreditation row is written | API: POST `/api/accreditation/[agent_id]` with a valid test `sr_assent_` write token but **no** `provenance` field → **422 `bad_provenance`**; with a forged/tampered `provenance` → **403 `no_examination`**. Verified in production 2026-05-24 (gate Live). This row is now a **passing assertion** of R18f enforcement — see `D-SAGE-ASSENT-PROVENANCE-GATE-BUILD-WIRED-VERIFIED-2026-05-24` |
| **Combination 2 — Reasoning + Assent, no Reflect, marketed as a "practice"** | **Documentation-gated** — legitimate use; unsupported *claim* | Disclaimer present | Docs/discovery surfaces: assert the no-practice disclaimer string appears wherever this config is offered |

### A.3 — The disclaimer itself (Priority 4 output)

| Item | Expected | 0c verification method |
|---|---|---|
| No-practice disclaimer | Present, plain-language, accurate, across docs / `llms.txt` / `agent-card.json` / limitations page | Once Priority 4 drafts the text: grep/open each surface and assert the disclaimer string is present. (The *text* is not yet written — Priority 4) |

> **Combination 1 is the single most important whole-system assertion** the harness makes — it is the proof that the integrity rule (R18f) is *enforced*, not merely written down. **As of 2026-05-24 the option-(a) gate is built, Live, and verified in production**, so this row is a **passing assertion** (R18f enforced; no-provenance → 422 `bad_provenance`, forged → 403 `no_examination`). The earlier *"gap documented, severity: significant"* is **resolved** — see `99_review/missing-context.md` M-4 (closed).

---

## B. Success criteria per seam (from `03_seam_map/`)

| Seam | Pass criterion | 0c verification method |
|---|---|---|
| **S1 — Calling five-spec → Layer 1** | Approved-path session yields a `DiscoveredPurpose` with the agent's own words in all five slots; **all five survive into the Layer 1 schema** (no dropped slot); incomplete specs → clarification, no handoff | Run L2 then feed the handoff to `/api/reason`; founder compares the five input slots to what Layer 1 received (AI prints both side by side) |
| **S2 — signed Layer2Assessment → EvaluatedAction** | A genuine `SignedLayer2Assessment` maps to a well-formed `EvaluatedAction` with `receipt_id` derived from its signature | `npx tsx` the bridge against a real signed assessment; founder confirms the `receipt_id` equals SHA-256(signature) |
| **S2-neg — Combination 1** | **[PASSING]** a credential write with no genuine substrate signature is **rejected at the write boundary** (no `provenance` → 422 `bad_provenance`; forged → 403 `no_examination`) — R18f enforced | As Combination 1 above — the headline negative test; **verified in production 2026-05-24** (422 / 403). Passing |
| **S3 — Reflect outcome → profile** | A Reflect session updates `agent_accreditation` **via the engine** (grade moves only on evidence + hysteresis, never hand-written); FK-seed fires for a new agent; SR-15 per-domain proximity written | DB: query `agent_accreditation` + `evaluated_actions` for the test agent before/after; founder confirms rows appeared and the grade change matches the engine, not a hand-set value |
| **S4 — Reflect exit routing → next product** | Each RS class yields the correct `exit_path`; **the exit_path is actually consumed** — "purpose holds" re-enters Reasoning, "purpose complete" re-enters Calling | Loop: run Reflect to each exit; founder confirms the agent actually lands in the next product's entry, not just that the string is correct |

---

## C. Cross-cutting assertions (brief §5)

| # | Property | Pass criterion | 0c verification method |
|---|---|---|---|
| C1 | Shared-substrate consistency | Human path (`sagereasoning.com`) and agent path (API) produce the **same** authoritative Layer-2/Layer-3 reasoning for the same input | Run the same impression via the website and via `/api/reason`; founder compares the two outputs |
| C2 | R20a distress perimeter across the loop | Distress entering at **any** product is caught + redirected (the eight AC5 routes today) | Submit a distress-signal input at each entry; founder confirms the redirect/pass-through statement appears (use `webapp-testing` to screenshot the human UI). **Critical-tier when built** |
| C3 | State + audit trail | A full journey leaves one coherent, auditable trail | DB: after a full loop, query `discovery_sessions` → `evaluated_actions` / `agent_accreditation` / `grade_history` / `credential_audit` → reflect store; founder confirms the journey is traceable end-to-end |
| C4 | Credentials end-to-end (A10) | A test `sr_assent_…` credential is scoped, used to write, audited, and revocable through the loop | API: mint → write → check `credential_audit` → revoke → confirm a subsequent write fails |
| C5 | Adversarial containment (R18d) | A spoof at one stage (e.g. poisoned Agent Card at Calling) stays contained, no downstream corruption | Inject the spoof; founder confirms downstream state (profile, credential) is unaffected |

---

## D. What "done" looks like for the test (0h criteria 3 + 4)

- **Value demonstrated end-to-end** on at least one use case **per audience** — a human practitioner journey and an agent-developer journey (0h criterion 4). Captured in `05_outputs/`.
- **The Combination-1 assertion now passes** (0h criterion 3): the integrity rule (R18f) is **enforced in production as of 2026-05-24** via the option-(a) gate (Wired + Verified; Live). The earlier *gap (severity: significant)* is **resolved** — M-4 closed in `99_review/missing-context.md`.
- Each seam marked **pass / fail / gap** honestly; gaps recorded in `99_review/`.

After this brief is exercised: automate the harness (brief §9). The **Critical build of the option-(a) gate is complete** (2026-05-24) — it turned the Combination-1 row from *documented gap* into a *passing assertion* (above). The remaining whole-system work is the manual loop (Step 7) and the automated harness.
