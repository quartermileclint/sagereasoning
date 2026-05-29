# Capability Inventory — Skeleton (to be filled at the first-pass inventory session)

**Status:** Drafted 2026-05-29. Under review. This is an empty structure, not an assessment. It is filled at the capability-inventory session per `/operations/handoffs/founder/2026-05-29-capability-inventory-NEXT-SESSION-PROMPT.md`.
**Purpose:** Seed structure for the 0h hold-point capability inventory (0h exit criterion 4 — "a clear-eyed catalogue of every component, its true status (0a vocabulary), and its readiness for each audience"), re-cut through the per-configuration × audience lens the founder's thought experiment was reaching for.
**Adopted direction:** `D-CONFIG-AUDIT-DIRECTION-CAPABILITY-INVENTORY-2026-05-29`.
**Seed artefact:** `/website/public/component-registry.json` (v1.5.0; lastUpdated 2026-05-02; 191 components). **Caveat: the registry predates the entire Option A arc (S1–S5, 2026-05-27/28) and is ~4 weeks stale — it is the seed, not the truth. Reconcile to current reality as you fill.**

---

## How to read this

The inventory is a **cube**: configurations (rows) × dimensions (columns) × audience (depth). The registry already carries the audience depth as `humanReady` / `agentReady` per component, so the cube is partly pre-populated — your job is to re-cut it by configuration and fill the gaps.

Each filled cell records:

- **Status (0a):** `Scoped / Designed / Scaffolded / Wired / Verified / Live` — the implementation status of that dimension for that configuration.
- **Readiness — human:** `ready / partial / not-ready / n/a` (seed from registry `humanReady`).
- **Readiness — agent:** `ready / partial / not-ready / n/a` (seed from registry `agentReady`).
- **Gap:** one line — what's missing for "good" on this dimension for this configuration.
- **Severity:** `blocker / significant / minor / cosmetic` (per 0h exit criterion 3).
- **Deferred?:** mark `⏸ deferred-until-traffic` for cells that cannot be honestly assessed without real usage (most economics + telemetry cells).

---

## Configuration rows (candidates — confirm/correct at session open; the founder owns this list)

| Row | Configuration | Primary audience(s) | Registry components to seed from |
|---|---|---|---|
| C1 | `/api/reason` (Reasoning) | human (web) + agent (API) | `engine-sage-reason-engine`, `prod-action-scorer`, `tool-sage-*` |
| C2 | `/api/calling` (Calling / purpose discovery) | agent (API) | Calling route + S2 catch (post-registry) |
| C3 | `/api/practice/reflect` (Reflect) | agent (API) | Reflect route + S3 catch (post-registry) |
| C4 | `/api/mentor/private/reflect` (Private Mentor) | human (founder/web) | `agent-private-mentor`, `agent-mentor`, `engine-mentor-ledger` |
| C5 | Sage Assent surfaces (certification) | agent | Sage Assent components |
| C6 | Website human-facing tools (score / reason / reflect pages) | human (web) | `prod-action-scorer`, `prod-doc-scorer`, `prod-*` pages |
| C7 | Plugin-internal tools (future) | agent | `tool-mcp`, `tool-sage-*` |

*The "L1–L7" the design spec §5.5 referenced maps to these seven candidate rows. Confirm the count and identity at session open — the founder's classification governs.*

---

## Dimension columns (the 11 — PR14-grounded; confirm at session open)

| Col | Dimension (asked per configuration) | PR14 domain | Roadmap home | Assessable now (pre-users)? |
|---|---|---|---|---|
| D1 | Safety perimeter (R20a distress catch + propagation) | Security (#1) | P2 / R20a — Option A | Code done; **needs live run to Verify** |
| D2 | Audience contract (human vs agent output shape) | — (cross-cutting) | Option A renderer | Yes — design property |
| D3 | Auth / authorisation posture (who may call) | Security (#1) | AC7 / R17f | Yes — design property |
| D4 | Intimate-data + privacy (R17: encrypt, retain, **genuine delete**, SAR/rectify/export) | Privacy by design (#4) | P2 / R17; P6 #7 | Yes — **high ethical + legal risk; deletion is a 503 stub** |
| D5 | Honest positioning / configuration honesty (R19c/e) | — (positioning) | P2 / R19; P6 #9 | Yes — design property |
| D6 | Regulatory / compliance (GDPR, EU AIA Art 50, EAA/WCAG) | Regulatory+compliance (#2), Accessibility (#3) | R14 register (exists); P6 #5 lawyer | Yes — mostly cross-cutting, not per-flow |
| D7 | Economics (pricing, seam double-counting, R5 cost-to-founder, rate-limits) | Marketplace economics (#8), tax (#6) | P4 Stripe; R5; P6 #11 | **Mostly ⏸ — needs traffic + Stripe wired** |
| D8 | Discoverability / **AEO = Agent Engine Optimisation** (agent-card.json, llms.txt, agent-marketplace ranking/selection) | Anthropic-native (#10) | P6 #4; Cowork-first marketplace | Yes — artefacts; ranking depends on D5 |
| D9 | Output / telemetry surfaces (developer dashboard, agent reporting, human outputs) | Observability+SRE (#5) | AC11 (lands A12 — unbuilt); P7 | Partly — **dashboard ⏸ (needs telemetry + traffic)** |
| D10 | Operational resilience (failure modes, degradation, fallback) | Observability+SRE (#5) | P7; observability | Design yes; behaviour needs runtime |
| D11 | Eval / quality coverage (Zone-2 ES1–ES3) | Security (#1) | manifest ES1–3; 0h gate | Yes — coverage audit |

*Not a column — tracked separately: K-category migration readiness (a future structural work program, not a property to audit). Onboarding UX (PR14 #9) and Insurance (PR14 #7) considered: onboarding folds into D9/D5; insurance is cross-cutting (org-level, not per-configuration) — name it excluded, don't catalogue per-row.*

---

## Master matrix (fill at session — `TBD` = to assess; `⏸` = deferred-until-traffic; `–` = n/a)

| | D1 Safety | D2 Audience | D3 Auth | D4 Privacy | D5 Positioning | D6 Compliance | D7 Economics | D8 AEO | D9 Telemetry | D10 Resilience | D11 Eval |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **C1 /api/reason** | seed | seed | TBD | TBD | TBD | TBD | ⏸ | TBD | ⏸ | TBD | TBD |
| **C2 /api/calling** | seed | seed | TBD | TBD | TBD | TBD | ⏸ | TBD | ⏸ | TBD | TBD |
| **C3 /api/practice/reflect** | seed | seed | TBD | TBD | TBD | TBD | ⏸ | TBD | ⏸ | TBD | TBD |
| **C4 /api/mentor/private/reflect** | TBD | TBD | TBD | TBD | TBD | TBD | ⏸ | – | ⏸ | TBD | TBD |
| **C5 Sage Assent** | – | TBD | TBD | TBD | TBD | TBD | ⏸ | TBD | ⏸ | TBD | – |
| **C6 Website tools** | TBD | TBD | TBD | TBD | TBD | TBD | ⏸ | – | ⏸ | TBD | TBD |
| **C7 Plugin tools (future)** | TBD | TBD | TBD | TBD | TBD | TBD | ⏸ | TBD | ⏸ | TBD | TBD |

**Seed note for the D1 / D2 cells (C1–C3):** Option A reached **Wired** but **not Verified-live** — the audience renderer + Calling/Reflect catches exist in code with all four flags UNSET in Vercel; S5 (config-flow tests) is not run; no C2 live run. So the honest D1/D2 entry for C1–C3 is "Wired, not Verified-live — gap: operational proof (S5 + C2 live); severity: significant." This is the single cell that decides whether "finish Option A" is your top gap — let the ranking, not momentum, answer it.

---

## Output of the session

1. This matrix filled (assessable cells), with per-cell gap + severity.
2. A **ranked gap list** — gaps ordered by `severity × launch-criticality` (do they block one of the 11 MVP launch criteria, P6?) within the P1–P7 priority order.
3. The ranked list is what tells you what to do next — including whether finishing Option A, the per-dimension deep-dives, or something else (R17 genuine deletion is a live legal gap) is top.

---

## Backout

If the matrix cannot be drafted in one session, narrow to the launch-critical rows/columns — D1 (safety), D4 (intimate data), D5 (positioning) across C1–C6 — and defer the rest. These are the P2 ethical-safeguard and P6 launch-criteria cells; everything else can wait.

*End of skeleton. Nothing here is assessed yet; this is structure only. Filled at the capability-inventory session; promoted from `/drafts/` to `/adopted/` only after a full founder approval gate per the project's archive discipline.*
