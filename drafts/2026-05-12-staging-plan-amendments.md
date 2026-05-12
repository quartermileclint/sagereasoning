# Staging Plan Amendments — ST2 Output (2026-05-12)

**Status:** Drafted 2026-05-12 during ST2 Phase 4. Triage decisions per ST2 Phase 3 (ALLOW / REVISE / BLOCK / ESCALATE framework). Cross-references the Phase 2 gap analysis (`/drafts/2026-05-12-phase-2-gap-analysis.md`) and the Phase 2.5 candidate deep-dives (consolidated in this session's ST2 close note).
**Risk classification:** Standard (drafting). The `/drafts/` → `/adopted/` move (a separate operation in a future session) is Elevated per the standing protocol cache risk table.
**Adoption pre-conditions:** see `/drafts/2026-05-12-amendment-adoption-checklist.md`.
**Source:** Founder elections in ST2 Phase 3 (record in this session's chat; consolidated in the ST2 close note's triage record).

---

## Plain-language summary

The current adopted staging plan (`/adopted/substrate-plugin-staging-plan.md`) is structured around backend foundations (Stage 1) → K-category migration (Stage 2) → plugin internals (Stage 3) → marketplace listing (Stage 4) → operations + multi-marketplace (Stages 5-6). ST2's stress-test against ten domains surfaced 34 gap-driven amendments plus 16 Anthropic-native + community-pattern candidates. Founder triaged 50 items total in four-outcome vocabulary.

The headline structural change: **Stage 1 expands by ~10-15 sessions to absorb Critical-gap closures before Stage 2 K-category migration broadens substrate exposure.** Stage 2 start is correspondingly delayed. Stage 3 plugin work is re-scoped to commit C1-C7 (minus C5) to Anthropic Plugin spec + MCP rather than bespoke architecture. A parallel pre-launch founder-personal-exposure track is created for Domains 6+7+8-partial work (legal entity; insurance; marketplace TOS + liability). Multi-marketplace strategy locks in Cowork as first target, anthropics/skills as second, Claude Code Plugins as third.

---

## Stage 1 — Expansion (foundations grow before Stage 2 starts)

Per ST2 Phase 3 Q3 election (Expand Stage 1; delay Stage 2). Stage 1's existing sub-stages (A1-A9) remain at current status (A1, A2, A3, A4 Verified; A5+ Scoped). The expansion adds the following sub-stages.

### A10 — Per-agent credentials + revocation + identity discrimination (NEW; Critical)

**Source:** Phase 2 Domain 1 S1 (REVISE election). Phase 1.5 G1 + G2 + T3-9 + T3-10 (Critical judge-layer gaps).

**Scope:**
- Replace single `PLUGIN_AUTH_SECRET` with per-install token issuance
- Per-token metadata: `identity_type` (human | agent), `install_id`, `scope` (assessment-only | mentor-also | admin)
- Revocation list checked at every authenticated call (Redis-backed or Supabase row read)
- Admin-only revocation API + revocation runbook mirroring rotation runbook
- Token format ADR drafted in Phase 4 of ST2 (separate ADR; see Phase 4 manifest-amendments file). Candidate token formats: JWT (HMAC or asymmetric); W3C Verifiable Credentials; hybrid.

**Pre-conditions:** Token format ADR adopted (founder elects between sessions).
**Stage 1 sequencing:** Lands AFTER A5 (Layer 3 service) wires up; BEFORE Stage 2 K-category migration broadens substrate exposure to multiple consumers.
**Closes:** Phase 1.5 G1 + G2; T3-9 + T3-10; Phase 2 S1.

### A11 — Endpoint-auth inventory + JSON-key SQL audit + prompt-injection defence (NEW)

Decomposed from Phase 2 Domain 1 S2 (REVISE → S2a Standard + S2b Critical).

**A11a — Audits (Standard).**
- Endpoint-auth inventory: list every route in `/website/src/app/api/`; classify each as authenticated / unauthenticated / public-by-design
- CI check on PRs to flag any new unauthenticated route (`/security-review` GitHub Action candidate per Phase 2.5 Candidate 1)
- JSON-key SQL injection audit: code-review pass on all `from()` + `select()` calls in Supabase queries; verify input parameters never reach JSON key paths unescaped
- Closes Phase 1.5 G3 + G4; T3-11 + T3-12.

**A11b — Prompt-injection defence at Layer 1 + Layer 3 (Critical; PR6 engages).**
- Layer 1 (extractFeatures): adversarial-input testing for prompt-injection patterns ("ignore previous instructions"; tool-call escape attempts); structured-output sanitisation
- Layer 3 (sage-prose-engine): consumer-context sanitisation; output validation against injection-of-prompts-into-prose
- Closes Phase 1.5 G6; T3-13 + T3-14.

### A12 — OpenTelemetry GenAI semantic conventions + call-grain audit (NEW; Elevated)

**Source:** Phase 2 Domain 5 O1 (ALLOW). Cross-cuts P1 (DPIA — call-grain audit logging) + S1 (behavioural baselines) + A9 (cost monitoring).

**Scope:**
- Adopt OpenTelemetry GenAI semantic conventions for substrate operations
- Auto-instrumentation for Anthropic SDK calls
- Trace propagation: Layer 1 → Layer 2 → Layer 3 → Supabase write (correlation IDs)
- Per-call audit logging: structured logs with decision event + context + masked sensitive data + immutable storage
- A9 cost-monitoring expanded: per-call cost tracking; per-identity baseline behavioural metrics

**Stage 1 sequencing:** After A10 (per-agent credentials provide identity for per-identity tracking); before Stage 2.

### A13 — R5 cost-as-health-metric alerts (NEW; Elevated)

**Source:** Phase 2 Domain 5 O2 (ALLOW). Depends on A12.

**Scope:**
- Revenue-to-cost ratio threshold: <2x → alert (per R5)
- Per-call cost threshold: >2x baseline → alert
- Daily total cost threshold: >budgeted cap → alert
- Per-identity cost (anomaly detection: identity X spending Nx its baseline)
- Alerts delivered via configured channel (email; later: Slack / PagerDuty)

### A14 — SLOs + error-budget discipline (NEW; Standard governance + Elevated implementation)

**Source:** Phase 2 Domain 5 O3 (ALLOW).

**Scope:**
- Per-surface SLOs documented (e.g., `/api/reason` p95 latency <3s; `/api/public-key` p95 <100ms; R20a synchronous distress classifier p95 <500ms per AC2)
- Error budgets per surface (e.g., 99.5% success rate per surface = ~4 hours error budget per quarter)
- Discipline: when error budget burns >50% in a quarter, freeze new feature work for that surface until reliability restored

### A15 — R17 expansion: SAR + rectification + portability (NEW; Critical; R17 surface)

**Source:** Phase 2 Domain 4 P2 (REVISE — phased). Cross-cuts R1 (R17c deletion endpoint bring-forward).

**Phased sequencing:**
- A15a — R17c genuine deletion endpoint (bring-forward from P2 priority 2d). Replaces 503 placeholder. Critical.
- A15b — R17g access (SAR — GDPR Article 15). Standard contract, Critical surface.
- A15c — R17h rectification (GDPR Article 16). Standard contract, Critical surface.
- A15d — R17i portability (GDPR Article 20). Most complex; structured-export contract; Critical surface.

Closes Phase 1.5 T4-4; Phase 2 R1 + P2.

### A16 — Privacy governance pass (NEW; Standard; lawyer-coupled)

**Source:** Phase 2 Domain 4 P1 + P3 + P4 (ALLOW).

**Scope:**
- A16a — DPIA + substrate data-flow diagram (lawyer-coupled per Q4)
- A16b — ISO/IEC 27701:2025 informal alignment mapping
- A16c — Sub-processor DPA register (Anthropic + Supabase + Vercel; founder as controller; user-facing privacy policy lists sub-processors)

### A17 — Regulatory governance pass (NEW; Standard; lawyer-coupled)

**Source:** Phase 2 Domain 2 R2 + R4 (ALLOW / REVISE).

**Scope:**
- A17a — Manifest CR-### register populated with live binding obligations (GDPR Article 17; EAA WCAG 2.1 AA; Australia Privacy Act 1988; EU AI Act Article 50; CCPA deletion rights)
- A17b — EU AI Act Article 50 transparency posture (lawyer-coupled; specific language deferred to lawyer engagement)
- A17c — R14 quarterly review cadence operationalised (next-due 2026-07-06 per manifest header)

### A18 — Onboarding + limitations governance pass (NEW; Standard → Elevated)

**Source:** Phase 2 Domain 9 U1 + U2 + U3 (ALLOW). Cross-cuts A3 (cognitive accessibility).

**Scope:**
- A18a — Sagereasoning.com first-run experience designed + built (U1)
- A18b — R19c limitations page + R19d mirror principle in mentor prompts (P2 priority 2e bring-forward)
- A18c — R20b framework-dependence detection + coaching (Elevated; mentor-behaviour change; PR6 applies)
- A18d — Accessibility statement page (A2)
- A18e — Cognitive-accessibility design pass on mentor + assessment surfaces (A3)

### A19 — Abuse-detection + rate-limiting (NEW; Elevated)

**Source:** Phase 2 Domain 8 M4 (ALLOW). Cross-cuts A10 (per-agent credentials).

**Scope:**
- Per-identity rate-limit (depends on A10's identity surface)
- Reverse-engineering probe detection (systematic prompt enumeration; rapid variations of same input)
- Abuse-response: rate-limit; revoke; alert

### Stage 1 close (NEW gating step)

Per Q4 lawyer-engagement bring-forward election: **lawyer engagement begins at Stage 1 close.** Lawyer reviews:
- R4 / A17 regulatory posture (CR-### register; Article 50 language)
- P1 / A16 privacy work (DPIA; sub-processor DPAs; ISO 27701 mapping)
- M1 TOS + liability allocation (parallel-track item — see below)
- L1 Pty Ltd structure recommendation (parallel-track item)
- R3 / A1 EU customer plausibility decision (gates EAA + WCAG work)

**Stage 1 close exit criteria:**
1. All A10-A19 sub-stages Verified
2. Lawyer engagement initiated + first-review report delivered
3. EU customer plausibility decision recorded
4. Parallel pre-launch founder-personal-exposure track has at least L1 ADR + I1 quote received

**Estimated Stage 1 expansion impact:** +10-15 sessions (per Phase 2 Cross-cutting Observation 2). Total Stage 1 arc estimate revised from current 16-24 sessions to ~28-40 sessions.

---

## Stage 2 — K-category migration (UNCHANGED scope; delayed start)

Stage 2 start blocked by Stage 1 close exit criteria. Otherwise unchanged: K1-K8 K-category migration of bundled-prose consumers to translation-sandwich substrate, per the existing adopted staging plan.

**Sequencing implication:** K-category migration is the first work that broadens substrate exposure beyond founder + test logins. Stage 1's A10 (per-agent credentials) must be Verified before K-category migration begins, so each migrated consumer can be issued its own credential.

---

## Stage 3 — Plugin work (RE-SCOPED on Anthropic Plugin spec + MCP)

Per ST2 Phase 3 Step 4 election: ALLOW with REVISE on scope (Candidates 10 + 11). Stage 3 work re-scoped as follows.

### Re-scoped sub-stages

| Original | Re-scope | Source |
|---|---|---|
| C1 Plugin manifest (bespoke) | C1 Adopt Plugin spec manifest format | Anthropic Plugin spec |
| C2 Plugin skills (bespoke) | C2 Adopt Agent Skills format | `anthropics/skills` repo |
| C3 Plugin tools (bespoke HTTP) | C3 Adopt MCP as protocol; substrate's Layer 2 + Layer 3 expose as MCP servers | modelcontextprotocol.io; code-execution-with-MCP pattern |
| C4 Plugin hooks (bespoke) | C4 Adopt Plugin spec hooks | Anthropic Plugin spec |
| **C5 Substrate-specific integrations** | **C5 STAYS BESPOKE** — this is the substrate's value-add | — |
| C6 Plugin assets (bespoke) | C6 Adopt Plugin spec assets convention | Anthropic Plugin spec |
| C7 Plugin documentation (bespoke) | C7 Standardise on Plugin spec + Anthropic skill-creator conventions | Anthropic Plugin spec |

**Estimated reduction:** ~5-8 sessions of Stage 3 work removed per inbox synthesis Opportunity #1.

### NEW Stage 3 items

**D-mechanisms (re-evaluation under Anthropic primitives):**
- D1-D5 (action scorer, verification, subagent handoff) re-evaluated against Sub-Agents + Multi-agent orchestration (Phase 2.5 Candidates 2 + 7). Candidate 7 (Multi-agent orchestration) ESCALATED pending Stage 3 architecture; re-evaluation happens at Stage 3 kickoff.

**Agent SDK adoption (selective per ST2 Phase 3 Step 3):**
- Layer 1 open-source plugin client adopted on Claude Agent SDK
- Closed Layer 2 + Layer 3 services stay on current Vercel + Supabase + bespoke orchestration
- Wholesale Managed Agents re-platform ESCALATED with three revisit conditions (see ST2 close)

**S4 — OWASP Agentic Top 10 2026 mapping (J7):**
- Source: Phase 2 Domain 1 S4 (ALLOW). Cross-references manifest rules to each OWASP Agentic 2026 risk; flags coverage gaps.

**U4 — Plugin-developer first-call success path:**
- Source: Phase 2 Domain 9 U4 (ALLOW). Standalone deliverable in Stage 3 C7 expansion.

---

## Stage 4 — Marketplace listing (UNCHANGED scope; expanded gating)

### G1 — First marketplace target decision (LOCKED IN)

Per ST2 Phase 3 Step 6 Candidate 8 (ALLOW second marketplace) + Phase 3 Step 9 M3 (REVISE):

- **First marketplace: Cowork** (Decision 5 candidate from build-sessions cache)
- **Second marketplace: anthropics/skills** (after Cowork ships)
- **Third marketplace: Claude Code Plugins** (after anthropics/skills ships; staged adoption per PR1)

### G3 — Marketplace listing copy (operative term)

- **Category label: "Character Kernel"** (locked in ST2 Phase 3 Step 1; per Candidate 14 election)
- R18 honest-certification language adopts "Character Kernel" as operative term
- Peer-category language: "Character Kernel; peers in this category include ANCHOR (Cognitive Middleware), ResontoLogic (Reasoning for Humans)"

### G4 — Marketplace approval (gating expanded)

**NEW gating criteria for Stage 4 G4 approval (in addition to existing criteria):**

Parallel pre-launch founder-personal-exposure track items MUST be complete:
- L1 Pty Ltd structure incorporated; ASIC + accountant engagement complete
- L2 GST registration decision recorded
- I1 Tech E&O + Cyber Liability + General Liability policies purchased (D&O purchasable at first investor engagement)
- I2 Coverage-gap audit complete (AI-specific exclusion endorsements verified)
- M1 TOS + liability allocation document published; lawyer-reviewed

Substrate items MUST be at Verified status:
- A10-A19 (Stage 1 expansion) Verified
- C1-C7 (re-scoped Stage 3) Verified or BESPOKE (C5 only)
- R18 + R19c + R20a + R20b operational

### G6 — Plugin economics + Stripe (M2)

- Stripe integration + paid-tier launch (Phase 2 Domain 8 M2 ALLOW; project priority P4)
- Per-call metered with monthly cap
- Free-tier preserved
- R5 cost-as-health-metric thresholds operationalised against revenue (depends on A13)

---

## Stage 6 — Multi-marketplace strategy (EXPANDED)

Per ST2 Phase 3 Step 6 Candidate 8 + Step 9 Domain 8 M3:

**Marketplace adoption sequence (locked in):**
1. Cowork (Stage 4 G1)
2. anthropics/skills (Stage 6 first deliverable)
3. Claude Code Plugins (Stage 6 second deliverable)
4. Additional marketplaces (computer-use surfaces; per inbox synthesis Theme H) — ESCALATE pending Cowork + anthropics/skills evidence

**Per-marketplace packaging:**
- Plugin spec format provides cross-marketplace portability (Candidate 11 + Stage 3 re-scope)
- Marketplace-specific adaptations: Cowork connector wrapper; anthropics/skills skill-creator output; Claude Code Plugins plugin manifest

---

## Parallel pre-launch founder-personal-exposure track (NEW)

Per ST2 Phase 3 Q6 election. Track runs alongside the build arc; gates Stage 4 G4.

### Track items

| # | Item | Source | Dependency |
|---|---|---|---|
| FPE-1 | Pty Ltd structure decision + incorporation | Phase 2 Domain 6 L1 | P1 investment-case affirmation; lawyer engagement (Q4) |
| FPE-2 | GST registration timing decision | Phase 2 Domain 6 L2 | Accountant engagement |
| FPE-3 | Tech E&O + Cyber Liability + General Liability purchase | Phase 2 Domain 7 I1 | FPE-1 complete (Pty Ltd needed) |
| FPE-4 | Coverage-gap audit for AI-specific exclusions | Phase 2 Domain 7 I2 | FPE-3 quotes received |
| FPE-5 | TOS + liability allocation document | Phase 2 Domain 8 M1 | Lawyer engagement (Q4) |

### Track governance

- Track is recorded in this staging plan but executed independently of substrate-build sessions
- Founder maintains a parallel `/operations/parallel-track-fpe-status.md` (NEW deliverable) listing each item's current status (Scoped / Designed / Initiated / Complete)
- Each item Complete is logged in the decision log
- Stage 4 G4 marketplace approval gated on all five items Complete (per G4 expanded gating above)

---

## Cross-references

- Phase 2 gap analysis: `/drafts/2026-05-12-phase-2-gap-analysis.md`
- Phase 2.5 candidate deep-dives: consolidated in ST2 close note
- Triage decisions: ST2 Phase 3 chat record + ST2 close note
- Manifest amendments: `/drafts/2026-05-12-manifest-amendments.md` (this session's sibling draft)
- Project-instruction amendments: `/drafts/2026-05-12-project-instruction-amendments.md`
- Adoption checklist: `/drafts/2026-05-12-amendment-adoption-checklist.md`
- Current adopted staging plan: `/adopted/substrate-plugin-staging-plan.md`
- Decision log entry: `D-STRESS-TEST-STAGING-PLAN-AMENDMENTS-2026-05-12` (appended at ST2 close)

---

*End of staging plan amendments draft. Adoption is a separate Elevated-risk operation per the standing protocol cache. Adoption pre-conditions in `/drafts/2026-05-12-amendment-adoption-checklist.md`.*
