# Capability Inventory — First Pass (0h hold-point, criterion 4)

**Status:** Drafted 2026-05-29. Under review (Adopted as a deliverable per `D-CAPABILITY-INVENTORY-FIRST-PASS-2026-05-29`; promotion `/drafts/` → `/adopted/` is a later founder-gated step).
**Purpose:** The 0h hold-point capability inventory (0h exit criterion 4 — "a clear-eyed catalogue of every component, its true status (0a vocabulary), and its readiness for each audience"), re-cut as configurations × dimensions × audience. Output: a filled matrix + a **ranked gap list** that decides what to do next in P1–P7 order.
**Direction:** `D-CONFIG-AUDIT-DIRECTION-CAPABILITY-INVENTORY-2026-05-29` (supersedes the prior AI's Option I catalog).
**Seed artefact:** `/website/public/component-registry.json` (v1.5.0; 2026-05-02; 191 components). **The registry is the seed, NOT the truth — it predates the Option A arc (S1–S5) by ~4 weeks.** Every value taken from it is flagged `(seed — verify; registry 2026-05-02)`. Cells marked `[read-verified]` were checked against the live source this session.
**Session scope:** Assessment + documentation only. No code, no production change, no governance amendment. Standard risk under 0d-ii. Production state UNCHANGED (all four R20a flags UNSET; `/api/reason` byte-identical).

---

## How to read this

The inventory is a **cube**: configurations (rows C1–C7) × dimensions (columns D1–D11) × audience (human / agent, carried in each cell). Each assessable cell records: implementation **status** (0a), **human-readiness** and **agent-readiness** (`ready / partial / not-ready / n/a`), a one-line **gap**, and a **severity** (`blocker / significant / minor / cosmetic`). Usage-dependent cells are marked `⏸ deferred-until-traffic`. `–` = not applicable.

Confirmed at session open (founder): all seven rows C1–C7; all eleven columns D1–D11; registry **note-and-defer** (seed + flag + note divergences; no in-pass rewrite); AEO = **Agent Engine Optimisation** (agent analogue of SEO — discovery + ranking/selection; `agent-card.json`/`llms.txt` are table stakes).

---

## Verification findings — where the source disagrees with the registry/skeleton

Read these first; they move the ranking. All `[read-verified]` against live source this session.

1. **R17c genuine deletion is implemented — NOT a "503 stub."** `/api/user/delete` is a full DELETE route: auth + `{confirm:"DELETE"}` token + foreign-key-safe deletion across 8 tables + `auth.admin.deleteUser` + a PII-free audit log. The skeleton's "deletion is a 503 stub" line is **outdated**; the registry's `tool-delete = wired, human-ready` is closer to the truth. **However** — the deletion covers `analytics_events, action_evaluations_v3, deliberation_steps, deliberation_chains, journal_entries, baseline_assessments_v3, user_locations, profiles`. It does **not** delete the R17b intimate mentor store: `mentor_interactions, mentor_profiles, mentor_profile_snapshots, mentor_baseline_appendix, mentor_journal_refs, mentor_observations_structured, realtime_journal_entries`. So genuine deletion **exists but is incomplete** — it leaves the most sensitive intimate data behind. This is a real, assessable, pre-users **significant** D4 gap (and a legal one: GDPR Art 17 / Australian Privacy Act erasure must cover all personal data).

2. **Distress catch (D1) — two postures, both honestly assessable now.** Human-facing routes (`/api/reason`, `/api/mentor/private/reflect`, `/api/reflect`) invoke `await enforceDistressCheck(detectDistressTwoStage(...))` directly and **synchronously — the catch fires now, it is not flag-gated.** Agent-facing routes (`/api/calling`, `/api/practice/reflect`) carry the Option-A `enforceLayer2R20aGate` substrate catch, but it is **flag-gated OFF** (`SUBSTRATE_CALLING_R20A_ENABLED` / `SUBSTRATE_REFLECT_R20A_ENABLED` UNSET) *and* both routes sit behind kill-switches (`SAGE_CALLING_ENABLED` / `SAGE_REFLECT_ENABLED` → 503 until flipped). So the agent-path catch has **never fired in production**. This confirms the skeleton's "Wired, not Verified-live" for C2/C3 — and refines it: the *human* path is live; the *agent* path is wired-but-dark.

3. **Discovery artefacts (D8) exist and serve.** `public/llms.txt`, `public/.well-known/agent-card.json`, `public/openapi.yaml`, plus a generator (`sage-calling/agent-card.ts`) with tests. Launch criterion #4 (llms.txt + agent-card.json serving agent discovery) is **largely met at the artefact level** — the gap is ranking/selection (AEO proper), not table stakes. Lower severity than the skeleton implied.

4. **Limitations page (D5) exists.** `src/app/limitations/page.tsx` is present. Launch criterion #9's "limitations page live" is **substantially built** (verify deployed); the remaining R19 part is the mirror principle in mentor prompts. Lower severity than the skeleton implied.

The net effect of findings 3 and 4: two gaps the prior framing treated as significant are smaller than thought. The net effect of findings 1 and 2: the genuine-deletion gap is more precisely a *completeness* gap, and the safety gap is concentrated on the *agent* path's operational proof.

---

## Configuration rows (confirmed)

| Row | Configuration | Primary audience(s) | Registry seed |
|---|---|---|---|
| C1 | `/api/reason` (Reasoning) | human (web) + agent (API) | `engine-sage-reason-engine` (wired, a:partial), `prod-action-scorer` (wired, h:partial), `tool-sage-reason` |
| C2 | `/api/calling` (purpose discovery) | agent (API) | calling route + `tool-sage` (post-registry) |
| C3 | `/api/practice/reflect` (Reflect) | agent (API) | `tool-sage-reflect` (wired) + reflect-service |
| C4 | `/api/mentor/private/reflect` (Private Mentor) | human (founder/web) | `agent-private-mentor` (wired), `engine-mentor-ledger`, `api-mentor-profile` (wired, h+a ready) |
| C5 | Sage Assent surfaces (certification) | agent | `engine-trust-layer` (wired, **h+a not-ready, isolated**), `doc-trust-framework` (verified) |
| C6 | Website human-facing tools | human (web) | `prod-action-scorer`, `prod-doc-scorer`, `prod-journal`, `prod-scenarios` (all wired, h:partial) |
| C7 | Plugin-internal tools (future) | agent | `tool-mcp` (wired, a:partial), `tool-sage-*` family (wired, h+a partial) |

---

## Dimension columns (confirmed — the 11, PR14-grounded)

D1 Safety perimeter · D2 Audience contract · D3 Auth/authorisation · D4 Privacy/R17 (encrypt, retain, genuine-delete, SAR/export) · D5 Honest positioning (R19c/e) · D6 Regulatory/compliance · D7 Economics · D8 AEO/discoverability · D9 Telemetry/output surfaces · D10 Operational resilience · D11 Eval/quality coverage.

*Excluded (named, not catalogued per-row): Insurance (PR14 #7 — org-level, cross-cutting); K-category migration (a work program, not a property to audit). Onboarding UX (PR14 #9) folds into D5/D9.*

---

## Master matrix — status / severity per cell

Legend: status is 0a (`Wd`=Wired, `Vf`=Verified, `Dg`=Designed, `Lv`=Live, `Sc`=Scaffolded). Severity in **(b)**locker / **(s)**ignificant / **(m)**inor / **(c)**osmetic. `⏸` = deferred-until-traffic. `–` = n/a. `seed` = registry-seeded, unverified this pass.

| | D1 Safety | D2 Audience | D3 Auth | D4 Privacy | D5 Position | D6 Compliance | D7 Econ | D8 AEO | D9 Telem | D10 Resil | D11 Eval |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **C1 /api/reason** | Wd (s) | Wd (s) | Wd (s) | Wd (s) | Wd (m) | Wd (s) | ⏸ | Wd (m) | ⏸ | Wd (m) | Wd (s) |
| **C2 /api/calling** | Wd-dark (s) | Wd (m) | Wd (m) | Wd (m) | Wd (m) | Wd (s) | ⏸ | Wd (m) | ⏸ | Wd (m) | Wd (s) |
| **C3 /api/practice/reflect** | Wd-dark (s) | Wd (m) | Wd (m) | Wd (s) | Wd (m) | Wd (s) | ⏸ | Wd (m) | ⏸ | Wd (m) | Wd (s) |
| **C4 /api/mentor/private/reflect** | Wd-live (m) | Wd (m) | Wd (m) | **Wd (s)** | Wd (m) | Wd (s) | ⏸ | – | ⏸ | Wd (m) | Wd (s) |
| **C5 Sage Assent** | – | Wd (m) | Wd (m) | Wd (m) | Wd (s) | Wd (s) | ⏸ | Wd (m) | ⏸ | Dg (s) | – |
| **C6 Website tools** | Wd (s) | Wd (m) | Wd (m) | Wd (s) | Wd (s) | Wd (s) | ⏸ | – | ⏸ | Wd (s) | Wd (s) |
| **C7 Plugin tools (future)** | Dg (s) | Dg (m) | Dg (s) | Dg (s) | Dg (m) | Dg (s) | ⏸ | Dg (s) | ⏸ | Dg (s) | Dg (s) |

"Wd-dark" = wired in source but flag-gated OFF and behind a 503 kill-switch (never fired in prod). "Wd-live" = wired and firing now (not flag-gated).

---

## Per-dimension detail (assessable cells; gap + severity)

### D1 — Safety perimeter (R20a distress catch) · launch criterion #10
- **C1 /api/reason** — *Wired, catch synchronous + live; agent-audience redirect rendering flag-OFF.* `[read-verified]` Gap: operational proof of the agent-audience redirect path (S5 config-flow tests + a live run with `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` on). **Severity: significant.**
- **C2 /api/calling** — *Wired-dark.* `[read-verified]` R20a substrate-gate catch present; `SUBSTRATE_CALLING_R20A_ENABLED` UNSET; route behind `SAGE_CALLING_ENABLED` (503). Never fired in prod. Gap: C2 live run + flag activation + S5. **Severity: significant.**
- **C3 /api/practice/reflect** — *Wired-dark.* `[read-verified]` Same posture (`SUBSTRATE_REFLECT_R20A_ENABLED` UNSET; `SAGE_REFLECT_ENABLED` kill-switch). Gap: live run + S5. **Severity: significant.**
- **C4 /api/mentor/private/reflect** — *Wired, catch synchronous + live.* `[read-verified]` Gap: 0h-criterion-1 founder live-data test (the catch fires, but has not been exercised with real distress input). **Severity: minor.**
- **C6 Website tools** — Human tools route through distress-checked endpoints (`/api/reason`, `/api/reflect`). Gap: confirm *every* human-facing tool path hits a distress-checked endpoint (score/scenario pages). **Severity: significant** (launch criterion #10 is "all human-facing tools include distress detection").
- **C5 Sage Assent** — n/a (certification surface; not a distress-exposed conversational input).
- **C7 Plugin tools** — Designed; inherit the three-layer R20a defence once the plugin ships. **Severity: significant** (future).

### D2 — Audience contract (human vs agent output shape)
- **C1** — Audience renderer wired (the Option A work), flag-OFF. Gap: live proof the agent vs human output shapes render correctly. **Significant.** Others: agent-only (C2/C3/C5/C7) or human-only (C4/C6) contracts are simpler — **minor**.

### D3 — Auth / authorisation
- **C1** — `requireAuth` + API-key path + `PLUGIN_AUTH_ENABLED` (OFF). `[read-verified]` Gap: agent/plugin-auth path not activated (bears on launch criterion #1, external metered calls). **Significant.**
- **C2/C3** — token auth wired (`validateSageAssentWriteToken` / `verifyReflectToken`). `[read-verified]` **Minor.**
- **C4/C6** — `requireAuth` wired (seed h:partial). **Minor.**
- **C7** — Designed (per-agent credentials + revocation = staging A10). **Significant** (future).

### D4 — Privacy / R17 · launch criterion #7
- **Genuine deletion (R17c)** — `/api/user/delete` implemented but **incomplete**: omits the intimate mentor store (7 tables). `[read-verified]` Gap: extend FK-safe deletion to cover `mentor_*` + `realtime_journal_*`. **Severity: significant** (legal: erasure must be complete). Applies most to **C4**, also C1/C6.
- **Encryption (R17b)** — `infra-encryption` + `infra-server-encryption` wired (seed h:partial). Gap: confirm intimate-data fields are application-level encrypted end-to-end. **Significant** for C4.
- **Export (R17/GDPR 20)** — `/api/user/export` implemented. `[read-verified]` **Minor** (verify it covers the same tables the deletion should).

### D5 — Honest positioning (R19c/e) · launch criterion #9
- **Limitations page** — `src/app/limitations/page.tsx` exists. `[read-verified]` Gap: confirm deployed/live; add the mirror principle to mentor prompts; per-configuration "what this does / doesn't do" disclosures. **Severity: significant for C5/C6** (certification + public tools), **minor for C1–C4**.

### D6 — Regulatory / compliance (cross-cutting) · launch criterion #5
- R14 register exists (`doc-security-audit`, compliance-pipeline). Accessibility (`CR-EAA-WCAG-AA`) is ESCALATED. EU AIA Art 50 transparency = R18e placeholder. **Lawyer review is the critical-path launch item (#5).** Mostly org-wide, not per-flow. **Severity: significant** (cross-cutting; not a per-row build).

### D7 — Economics · launch criteria #2, #11
- Metering wired on `/api/reason`, `/api/practice/reflect`, `/api/calling` (`recordLoopBilling`). `[read-verified]` Stripe = **Designed** (`infra-stripe`, `stripe-*` all designed; P4). R5 cost alerts not built. **Mostly `⏸ deferred-until-traffic`**; the buildable part (Stripe wiring + R5 alerts) is **significant** but P4-homed.

### D8 — AEO / discoverability · launch criterion #4
- `llms.txt` + `.well-known/agent-card.json` + `openapi.yaml` serve. `[read-verified]` Table stakes **met**. Gap: ranking/selection in agent ecosystems (AEO proper) — depends on D5 positioning. **Severity: minor** for the artefacts; the AEO strategy itself is a P6/marketplace concern.

### D9 — Telemetry / output surfaces
- Developer dashboard depends on AC11 OpenTelemetry instrumentation (lands A12 — **not built**). `prod-dashboard` wired (h:partial). **Mostly `⏸ deferred-until-traffic`**; the instrumentation prerequisite is **significant** but P7-homed.

### D10 — Operational resilience
- Fail-closed posture present across routes (503 on billing/store failure, KG1). `[read-verified]` Design-level sound; behaviour needs runtime. **Minor** now; revisit with traffic.

### D11 — Eval / quality coverage · gates phase transitions
- `infra-r20a-classifier-eval` + `infra-invocation-guard-test` wired; `governance-safety-signal-audit` verified. Gap: Zone-2 ES1–ES3 coverage audit + R18d adversarial evaluation (needs external review). **Severity: significant** (safety-adjacent; 0h-relevant).

---

## Ranked gap list — the headline output

Ordered by `severity × launch-criticality` within P1–P7 priority order. "LC#" = the 11 MVP launch criteria (P6). This is the founder's prioritised "what to do next."

| # | Gap | Rows | Dim | Severity | Roadmap home | Blocks LC? |
|---|---|---|---|---|---|---|
| **1** | **Genuine deletion is incomplete** — `/api/user/delete` omits the R17b intimate mentor store (7 tables). Legal erasure gap. | C4, C1, C6 | D4 | **significant** | P2 (R17c) | **LC#7** |
| **2** | **R20a agent-path safety unproven live** — C2/C3 catches wired-dark (flags OFF, 503 kill-switches); never fired in prod. This is the "finish Option A?" question. | C2, C3 | D1 | **significant** | P2 (R20a) / Option A S5+C2-live | **LC#10** |
| **3** | **R20a audience-rendering unproven live** — C1 agent-audience redirect path flag-OFF; S5 config-flow tests unrun. | C1 | D1, D2 | **significant** | Option A S5 | **LC#10** |
| **4** | **Distress coverage of all human tools unconfirmed** — verify every C6 tool path routes through a distress-checked endpoint. | C6 | D1 | **significant** | P2 (R20a) | **LC#10** |
| **5** | **Intimate-data encryption end-to-end unconfirmed** — verify R17b application-level encryption on the mentor store. | C4 | D4 | **significant** | P2 (R17b) | **LC#7** |
| **6** | **Lawyer review (privacy policy + ToS)** — critical-path; brought forward to Stage 1 close (ST2 Q4). | all | D6 | **significant** | P6 #5 | **LC#5** |
| **7** | **R18d adversarial evaluation + Zone-2 eval coverage** — needs external review. | C1–C3, C5 | D11 | **significant** | P3 (R18d) | LC#8 |
| **8** | **Mirror principle in mentor prompts + per-config R19 disclosures** (limitations page itself exists). | C5, C6, C4 | D5 | minor–sig | P2 (R19) | **LC#9** |
| **9** | **Stripe wiring + R5 cost-health alerts** — payment processing for paid tiers. | all | D7 | significant | P4 | **LC#2, LC#11** |
| **10** | **Plugin-auth activation** (`PLUGIN_AUTH_ENABLED`) + per-agent credentials/revocation (A10). | C1, C7 | D3 | significant | P6 #1 / staging A10 | **LC#1** |
| **11** | **Sage Assent trust-layer is architecturally isolated** (registry: zero imports; h+a not-ready) — wire it in. | C5 | D11, D2 | significant | P3 | LC#8 |
| **12** | **AEO ranking/selection strategy** (artefacts already serve). | C2, C5, C7 | D8 | minor | P6 #4 | LC#4 (mostly met) |
| **13** | **AC11 telemetry instrumentation → developer dashboard** (prerequisite for D9). | all | D9 | minor now | P7 / A12 | — |
| **14** | **Plugin-tool build (C7)** — entire row is Designed; future arc. | C7 | all | significant | build arc | LC (multiple, future) |

**Deferred-until-traffic** (cannot be honestly assessed pre-users; not ranked): most of D7 economics (real billing behaviour, rate-limit tuning, double-counting), the dashboard half of D9, D10 runtime failure behaviour.

---

## What the ranking says

The two questions this inventory was meant to answer:

- **Is "finish Option A" the top gap?** It is gaps #2 and #3 — high, but **not #1.** The **incomplete genuine-deletion** (gap #1) outranks it: it is a live legal exposure (GDPR Art 17 / Privacy Act erasure leaving intimate data behind), it is launch-blocking (LC#7), and unlike Option A it is *not* gated behind "no current users" reasoning — erasure must be complete the moment any real user exists. Finishing Option A (S5 + C2 live) remains the natural #2/#3 and is a tidy, well-scoped arc with an existing next-session prompt in limbo.
- **Is anything else surprising?** Yes — three skeleton/registry assumptions were wrong in the founder's favour (deletion exists; discovery artefacts serve; limitations page exists), which *lowers* three gaps. The deletion *completeness* gap is the one genuinely new, ranking-topping finding this pass produced.

A defensible next-session sequence: **gap #1 (complete the deletion)** → **gaps #2–#4 (finish Option A operationally + confirm human-tool distress coverage)** → **gap #5 (encryption confirm)**. All sit in P2, the next priority after the P1 business-plan gate. The founder picks.

---

## Limitations of this pass

This is a first pass, not the certified 0h inventory. Cells marked `seed` are registry-derived and unverified; `⏸` cells await traffic; `[read-verified]` cells were checked against source but not exercised at runtime (0h criterion 1 — founder live-data testing — is still outstanding for every "Wired" row). Severities are the AI's assessment and the founder may reclassify. The registry itself remains stale (note-and-defer per (c)); a registry reconciliation is its own later session.

*End of first-pass inventory. Filled 2026-05-29 from the skeleton (`/drafts/2026-05-29-capability-inventory-skeleton.md`, preserved). Assessment only — no code, no production change. Promotion to `/adopted/` is a later founder-gated step.*
