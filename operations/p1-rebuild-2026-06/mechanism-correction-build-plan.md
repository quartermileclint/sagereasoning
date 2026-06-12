# Sage Practice — Mechanism Correction Build Plan (DRAFT — awaiting founder item-by-item approval)

**Date:** 2026-06-12. **Stream:** founder. **Tier of this drafting session:** `governance` — Standard (document only; nothing below is built).
**Session:** Sage Practice Mechanism Correction arc, Part 3.
**Inputs:** `sage-practice-grounding-dossier.md` (boundary table §6, B1–B12) + `fresh-test-analysis.md` (FX-1…FX-17).
**Gate:** **nothing proceeds until the founder marks an item "approved."** Approval may be partial, amended, or refused per item. Build sessions then take approved items in the named ride-groups, under PR10 PEV, PR1 single-endpoint proof, PR2 same-session wire-verification, 0c-ii for anything Critical, PR17 for every founder-performed step, PR18 at close.
**Hard constraint honoured:** every item below is **mechanism-side** (dossier §6); the five parked methodology questions are listed at the end and are **not** in this plan.
**Amendment record (2026-06-12, same day):** the five parked questions were mentor-consulted and **all five verdicts adopted** (`D-SAGE-PRACTICE-METHODOLOGY-AMENDMENTS-ADOPTED-2026-06-12`). Amended in place: CI-1 (design space narrowed per Q2), CI-4 (required step per Q4), CI-13 (default-on contract per Q3), CI-15 (content adopted per Q1); **CI-16 and CI-17 added** (Q5 quick-tier value classification; Q2 narrative-existence guarantee); sequencing + exclusion list updated. **The approval gate below still stands — methodology adoption approves no build item.** Pre-amendment text in git history.
**PR15 standing check (stated once, applies per item unless noted):** Anthropic-canonical primitives reviewed (Claude Code commands, sub-agents, Skills, MCP servers, SDK patterns, Plugin spec, Cookbook patterns, Outcomes, multi-agent orchestration). None substitutes for changes inside SageReasoning's own Live API surfaces (Next.js routes, Supabase schema, deterministic engine) — bespoke election justified as product-internal code throughout. Where a primitive *does* bear on an item (CI-7, CI-9, CI-15), it is named in the item.
**0h interaction (named, not presumed):** the founder's 0h call (verdict memo §8) is untouched by this plan. CI-1…CI-3 are what a Branch-2 re-run would exercise; CI-6/CI-7/CI-11/CI-12 serve launch readiness under any branch; nothing here pre-empts the call.

---

## The items

### CI-1 — Decouple Layer-3 narrative from the consult hot path + retain it server-side
**Fixes:** FX-13 (B4). **Serves (dossier):** §4.7 the audit narrative. **Largest single latency+cost lever** (forensic §5.1: ~12–20s + ~half the LLM cost per consult).
**Shape (design freedom for the build session, narrowed per Q2 — adopted 2026-06-12):** the narrative **must exist for every examination** (mentor verdict: it is the record that examination occurred; a verdict-only configuration is blocked). Therefore: **(a) respond-then-generate async, retained against `loop_id`, is the compliant default**; (c) a `response_format` flag may defer prose out of the hot path but never suppress generation; **(b) pure on-demand ("generate only if requested") is out** — a narrative that may never exist fails the requirement. Retaining the signed Layer2Assessment remains needed for audit pairing (today nothing but structural facts persists — `reason/route.ts:948-972`). CI-17 carries the existence-guarantee enforcement/documentation and rides this item.
**Binding constraints:** R17 intimate-data posture on any retention store (retention limit, genuine deletion, minimisation — SR-12 precedent); R18e Article-50 transparency notice rides the prose wherever it is served; **the R20a Layer-C deterministic injection path must be untouched** — any prose deferral must be structurally unavailable when a distress signal is in play.
**Risk:** **Elevated** (existing user-facing response path + new schema). **Reclassify Critical per PR6 if implementation touches the distress branch, the A5 wrapper, or any flag activation** — expected implementation avoids all three.
**PR16:** positioning **strengthens** (auditability becomes a server-backed claim; latency story honest); dogfood **yes** (`/api/reason` consult on the retention-design kathekon is available if elected).
**Rollback:** new behaviour behind a flag (unset = today's synchronous shape); retention table additive (DROP on revert); `git revert` for code.
**Founder verification:** one consult with deferral elected → response returns in ~1–2s with assessment + no prose; follow-up fetch (or audit query) returns the narrative; `substrate_audit_events` row shows the new facts; a distress-class probe still returns the redirect with prose injection intact.

### CI-2 — `layer1_schema` supply on the API-key path (accept + validate + encourage)
**Fixes:** FX-3 (B1). **Serves:** §4.1/4.2 consultation. ~13–34s + double-L1 billing saved per consult when supplied.
**Shape:** extend the existing A2 validation to the API-key auth branch (same contract, same rejection semantics); response `meta` names whether schema was supplied (`layer1_source: supplied | server`); docs state the option with the open-Layer-1 contract reference (substrate ADR posture: "accepts any Layer1Schema that validates").
**Risk:** **Elevated** (input surface of a Live route; validation reused, no auth change). PR1: prove on `/api/reason` only (the only consult surface — trivially satisfied).
**PR16:** positioning **strengthens** (open Layer-1 becomes real on every path); dogfood **partial**.
**Rollback:** flag-gated acceptance; unset restores server-L1-only on the key path; `git revert`.
**Founder verification:** same input twice on an `sr_live_` key — once raw text, once with locally-computed schema; second shows `layer1_ms: 0` & `layer1_source: supplied`; a malformed schema 400s with the A2 error shape.

### CI-3 — Depth as a real latency tier (composition + honesty pass)
**Fixes:** FX-4 (B3). **Serves:** §4.1 consultation; R18 tier/latency honesty (S8b corrections lineage).
**Shape:** no engine-scope change (methodology row B3). With CI-1 + CI-2 in place, publish measured per-depth latency envelopes; align `llms.txt` / api-docs / mcp-contract latency claims to measurements; `quick` + schema + deferred-prose becomes the documented low-latency consult.
**Risk:** **Elevated** (rides CI-1+CI-2; the docs portion alone is Standard). **Rides with:** CI-1+CI-2 verification session.
**PR16:** positioning **strengthens** (honest tiers); dogfood **partial**.
**Rollback:** docs revert.
**Founder verification:** three timed consults (quick/standard/deep, schema supplied, prose deferred) land inside the published envelopes.

### CI-4 — Loop closure as a **required** sequence step (re-examination after correction) — *reshaped per Q4 (adopted 2026-06-12)*
**Fixes:** FX-8 (B6, amended). **Serves:** §4.4 reiterate → re-examine — now **mandatory methodology** ("a correction is a new phantasia owed a new synkatathesis"; elective returns demonstrably don't happen).
**Shape:** (1) `prior_feedback` input (Note-A vocabulary) carrying the prior loop id + adopted correction; (2) redirection-grade responses mark the examination **open** (structural field); (3) the same-depth rule enforced — the re-examination runs at the original examination's depth tier, not quick-by-default; (4) **provenance-chain enforcement**: the accreditation write validates loop closure — an assessment chain containing adopted-redirections without same-depth re-examinations is flagged (or rejected; build session proposes, founder elects) at the R18f write boundary. The stateless API cannot compel the return call; the credential is where the requirement bites.
**Risk:** **Elevated** on the reason-route half; the write-boundary validation extends the R18f enforcement seam — **Critical-check at build** (the seam was built Critical; PR6 posture applies if the validation logic is touched rather than extended additively). **Rides with:** CI-13 (practice-affordance session); the write-boundary half may land with M3's accreditation session if that order is approved.
**PR16:** positioning **strengthens decisively** (the loop the category claims becomes contract-visible and credential-enforced); dogfood **yes**.
**Rollback:** flag-gated open/close marking and validation (unset = today's behaviour); `git revert`.
**Founder verification:** consult → redirection received (response marks open) → re-submit with `prior_feedback` at same depth → closure visible in meta; an accreditation write over an unclosed chain shows the flag/rejection; omitting everything reproduces today's behaviour under the unset flag.

### CI-5 — Agent-path trajectory persistence (activate the designed carriers)
**Fixes:** FX-6 (B5). **Serves:** §4.8 the profile; Rule 10's longitudinal inputs; the Character-Kernel continuity claim.
**Shape (lands on existing design, not new invention):** (1) additive migration creating `evaluated_actions` (the table the live Assent runs in-memory — named Stage-A scope in `sage-reflect-product-design.md:357`); (2) per-consult assessment-history rows keyed to the credential's agent identity (K1 composite-key ADR governs identity); (3) activate the **already-accepted** carried-context fields (`history_window`, `carried_profile` — `layer2-mechanisms.ts:2069-2078`) as deterministic Rule-10 inputs (D17 prior-state read semantics, windowed 90d/30); (4) surface `direction_of_travel`/grade overlay honestly (CONFIDENCE_WEIGHTED low on sparse evidence, per D17 bands). Engine determinism is preserved — same inputs (now including supplied/stored context) → same output.
**Binding constraints:** R17a (only the subject agent's own record, gated by its own credential); retention + genuine deletion for agent assessment history (R17c analogue); hysteresis untouched (grade movement stays the Assent engine's).
**Risk:** **schema (Standard, idempotent additive) + Elevated** (engine behaviour change on a Live route). **Sequenced after** CI-1/CI-2 (response/latency shape settles first). Largest item — its own session, possibly two (schema+write first, read+activation second, PR1-style).
**PR16:** positioning **strengthens decisively** (Judgment + *Continuity* — currently the continuity half is human-side only); dogfood **yes**.
**Rollback:** flag-gated read path (unset = per-instance behaviour); tables additive (DROP on revert).
**Founder verification:** two consults same agent, second shows the windowed read in meta (`prior_instances: 1`, `confidence_weighted: low`); SQL row-count on the new tables; deletion path removes the agent's rows verifiably.

### CI-6 — F12: mint defaults drift fix
**Fixes:** FX-12 (B8). **Serves:** §4.6 accreditation honesty; R5 economics.
**Shape:** admin mint route reads the adopted 30/1/1 defaults from the schema source instead of hard-coding 667/50/20 (`route.ts:112-115` vs `api-keys-schema.sql:84,88,92`); existing over-provisioned keys reviewed (the leg-B key is retired; production scan for others).
**Risk:** **Elevated** (existing route behaviour; billing-adjacent). **Rides with:** CI-7 (one mint session). Resolves the open question from the leg-B close (fix vehicle: this session, pre-P1).
**PR16:** positioning **neutral**; dogfood **no**.
**Rollback:** `git revert` (route-local).
**Founder verification:** mint a test key → row shows 30/1/1 → revoke; grep confirms no literal 667 remains on the route.

### CI-7 — Mint UX: replace browser-console paste-work
**Fixes:** FX-1 (B8; carries leg-B R5 + PF-1). **Serves:** §4.1 onboarding.
**Shape:** founder-elected one of: minimal admin mint page (founder-JWT-gated, same gate as `/api/admin/slo-health`) **or** a repo CLI script (`npx tsx scripts/mint-credential.ts`, env-creds). **PR15 note:** a Claude Code *skill* wrapping the flow was considered and rejected — the defect is the founder-facing manual surface itself; a skill still ends in console paste-work. Prompt-pack defects (PF-1 `purpose` field) corrected in the same pass.
**Risk:** **Standard** (new admin-gated module; no public surface). **Rides with:** CI-6.
**PR16:** positioning **neutral**; dogfood **no**.
**Rollback:** delete the page/script (additive).
**Founder verification:** PR17 live walkthrough — founder mints+revokes a key through the new surface with zero console use, zero retries.

### CI-8 — Gate meta honesty: retire the stale `$0.0025` constant
**Fixes:** FX-14 (B9). **Serves:** §4.6/§4.7 honest telemetry (R18 honesty lineage).
**Shape:** `response-envelope.ts:91-92` stops reporting the retired sage-guard price; gate meta either reports measured/billed cost (if CI-10 lands) or omits `cost_usd` with an honest field note. No verdict-path change.
**Risk:** **Standard** per the arc prompt's expectation (meta-field honesty; verdict behaviour unchanged) — named tension: it alters a user-visible field; if the founder prefers, classify Elevated. **Rides with:** CI-9 + CI-10 (one gate session).
**PR16:** positioning **strengthens** (honest meta); dogfood **no**.
**Rollback:** `git revert`.
**Founder verification:** gate call meta no longer carries `0.0025`; docs/marketplace strings consistent (grep).

### CI-9 — Gate latency-variance diagnostic (20,015ms vs 46ms `ai_generated`)
**Fixes:** FX-15 (B9). **PR10 status: Diagnostic-uncertain — symptom level.** This item is a **bounded diagnostic, not a fix**: instrument/inspect the gate path to determine whether 46ms was a cache hit, a mislabelled fallback, or something else; report with diagnostic-certainty signalling; any fix is its own follow-on item with its own risk class. **PR15 note:** AC-13 sub-agent verification / an Outcomes-grader probe were considered; a direct code-path read + replay probe is smaller.
**Risk:** **Standard** (read + replay in TEST; no production change).
**Rides with:** CI-8 + CI-10.
**Rollback:** n/a (diagnostic).
**Founder verification:** a one-page diagnostic note naming the mechanism with evidence; founder acks before any "resolved" claim (PR10).

### CI-10 — Gate loop metering (X-Loop-* on `/api/guardrail`)
**Fixes:** FX-16 (B9; F11-adjacent). **Serves:** §4.6 honest economics; R5.
**Shape:** the gate's LLM cost joins the Option-D loop telemetry the consult surface already emits (`loop_billing_events` + headers).
**Risk:** **Elevated** (billing surface). **Rides with:** CI-8 + CI-9.
**PR16:** positioning **strengthens**; dogfood **no**.
**Rollback:** flag-gated metering write; `git revert`.
**Founder verification:** gate call returns X-Loop-Cost headers; matching `loop_billing_events` row (SQL).

### CI-11 — coverage_status / configuration honesty on the credential (K1 implementation, first slice)
**Fixes:** FX-10 (B8). **Serves:** §4.6 (R19e + K1 — adopted design, unbuilt field).
**Shape (first slice only):** add the K1 fields to `agent_accreditation` + the public read payload (`coverage_status`, `monitored_since`, `credential_basis`); writes from the existing paths set honest initial values (single-session write ⇒ the R19e-consistent basis, exact vocabulary per K1 ADR `2026-05-26-credential-scope-and-coverage-status.md` — carry, don't re-derive). The full state machine (suspend/resume on guardrail toggling) is **not** this slice — it needs the hook/plugin surface and stays in the Sage Practice spec track.
**Risk:** **schema (Standard additive) + Elevated** (Live trust-surface payload change). **Rides with:** CI-12 (one accreditation session).
**PR16:** positioning **strengthens** (the honesty rules become visible product); dogfood **partial**.
**Rollback:** additive columns (nullable; DROP on revert); read-path flag.
**Founder verification:** GET on a seeded record shows the new fields with honest values; R19e wording check against the K1 ADR vocabulary.

### CI-12 — Accreditation write/read agent_id asymmetry fix
**Fixes:** FX-11 (B8; founder-adjudicated Box-1 catch). **Serves:** §4.6/§4.7 (the provenance artefact must be publicly readable through its own path).
**Shape:** reconcile the POST-accepted agent_id vocabulary with the GET's validation so every writable record is readable; decide-and-document the canonical id form (K1 composite-key ADR governs).
**Risk:** **Elevated** (public read path on a Live trust surface). **Rides with:** CI-11.
**PR16:** positioning **strengthens**; dogfood **no**.
**Rollback:** `git revert`.
**Founder verification:** write a TEST record → public GET returns it (today's repro 404s); negative case still 404s for unknown ids.

### CI-13 — Reflect as the **default-on** close step (integration contract + opt-out) — *reshaped per Q3 (adopted 2026-06-12)*
**Fixes:** FX-9 (B7, amended). **Serves:** §4.5 — for agents, **automatic firing at session close is the default** ("the developer's configuration is the agent's disposition"); explicit opt-out; **the full Q1–Q6 sequence, never abbreviated**.
**Shape:** the substrate is stateless and cannot observe session close, so the default lives where it can bite: (1) the **published integration contract** (docs/llms.txt/agent-card/plugin + skill templates) ships reflect-at-close as the default flow with an explicit named opt-out config; (2) consult and accreditation-write responses carry the structural practice-cycle field (`practice: { reflect_due: 'TR-02', endpoint: '/api/practice/reflect', default: 'auto', opt_out: '<config key>' }`); (3) the opt-out documentation states the metering cost of an auto-fired reflect pass plainly (R5 — auto-fired calls bill; consent must be informed); (4) no server-side abbreviation path is added — the Q1–Q6 sequence ships whole or not at all.
**Risk:** **Elevated** (response-shape addition on Live routes + contract-default change on published surfaces). **Rides with:** CI-4 (+ CI-15 riding).
**PR16:** positioning **strengthens** (R19e alignment becomes the shipped default — the "ongoing practice" claim and the default configuration now match); dogfood **yes**.
**Rollback:** flag-gated field; docs revert restores elective-close as the published default.
**Founder verification:** consult response carries the field; the docs flow shows reflect-at-close as default with the opt-out named + costed; a reflect call from the hint succeeds on a TEST credential and runs all six questions.

### CI-14 — Credential consolidation across the practice (design first — **Critical track**)
**Fixes:** FX-17 (B7/B8; leg-B B-F11; SR-14 intent). **Serves:** §4.1/§4.5 (one credential across the agent's practice).
**Shape:** **design session only in this arc** — an ADR reconciling `sr_inst_` / `sr_live_` / `sr_assent_` against SR-14's one-credential intent and the K1 composite key; build is its own later session(s).
**Risk:** the design session is `governance`/Standard; **any build is Critical (AC7 + PR6 — auth surface), full 0c-ii**. Not ridden with anything.
**PR16:** positioning **strengthens** (onboarding coherence); dogfood **no**.
**Rollback (design):** document revert.
**Founder verification (design):** ADR readable; explicitly states the migration path for existing credentials and the FX-3 regression class it closes.

### CI-15 — Publish the consultation cadence: **the two-gate rule** (docs) — *content adopted per Q1 (2026-06-12)*
**Fixes:** FX-2 (B10, amended). **Serves:** §4.1 — the cadence is now adopted methodology, not pending guidance.
**Shape:** developer docs / llms.txt / agent-card integration section publishes the **two-gate rule**: Gate 1 — one mandatory full examination at task adoption (sets the frame; non-negotiable); Gate 2 — stake-triggered thereafter via the three-sub-question deterministic self-screen (*stake in how it lands / drawn to a conclusion before the evidence / would I reason differently unobserved*), any positive → examine at the appropriate depth; plus the **suppression signal** ("a self-screen consistently negative across sessions of genuine complexity is itself a signal requiring examination" — maps to Sage Reflect's FD-R1 null-suspicion); plus the existing R5 guard+score+iterate framing and the gate risk-class→depth mapping. **Note for sequencing:** Q1's "depth calibrated to proximity as well as stake" is publishable as principle now, but operational calibration presupposes a readable trajectory → named CI-5 dependency.
**Risk:** **Standard** (documentation of adopted methodology). Rides CI-13's session. R18 honesty check applies to any latency/cost number quoted (post-CI-3 measurements only).
**PR16:** positioning **strengthens** (the practice ships with its own economics lesson encoded); dogfood **yes** — this arc's own sessions can run the self-screen.
**Rollback:** docs revert.
**Founder verification:** founder reads the integration section; the two gates, three sub-questions, and suppression signal all present verbatim-faithful to the consultation record.

### CI-16 — Quick-tier minimal value classification (NEW — per Q5, adopted 2026-06-12)
**Fixes:** the Q5 amendment (B3, amended). **Serves:** §4.1/§4.2 — quick becomes "a genuine — if compressed — examination" instead of a triage.
**Shape:** the engine's quick depth adds one deterministic classification before returning a verdict: *is the object of the operative passion a genuine good, a genuine evil, or an indifferent (selective value noted)?* — a minimal M8 read against the value hierarchy, not the full standard-tier assessment. The gate inherits automatically (standard-risk → quick). **Build-session verification point:** confirm the quick-tier Layer-1 extraction already carries the value features the classification needs (the L1 schema is depth-independent in design; verify before wiring). If the founder ever elects *not* to ship this, the mentor's named alternative applies instead: rename quick to *screening* and credential its outputs as the lesser claim — that alternative is the bigger surface (naming across docs + credential payload) and is not this item.
**Risk:** **Elevated** (deterministic engine change on Live routes — `/api/reason` quick + `/api/guardrail` standard-risk). PR1: prove on `/api/reason` quick first; the gate inherits second. PR15: bespoke engine change; no Anthropic primitive substitutes.
**PR16:** positioning **strengthens** ("what distinguishes Stoic examination from generic emotional regulation" becomes true at every tier); dogfood **partial**.
**Rollback:** flag-gated mechanism step (unset = today's 3-mechanism quick); `git revert`.
**Founder verification:** a quick consult with a passion present returns the value classification field; the same input pre-flag shows today's shape; a standard-risk gate call carries it; engine determinism test (same input → byte-equal output) passes.

### CI-17 — Narrative-existence guarantee + blocked-configuration enforcement (NEW — per Q2, adopted 2026-06-12)
**Fixes:** the Q2 amendment (B4, amended). **Serves:** §4.7 — "a verdict without a narrative account is a classification, not an examination."
**Shape:** rides CI-1. (1) CI-1's implementation guarantees every examination eventually has its narrative generated and retained (async always-generate; deferral flags may move generation, never suppress it); (2) the documentation states the blocked configuration in R19e-adjacent wording ("a verdict-only configuration is not a legitimate practice configuration"), aligned with the existing no-Reflect disclaimer lineage; (3) **manifest rule candidate flagged for separate founder election** (not authored by this item): an R18f-parallel — *no examination credential over verdict-only assessments* — would make the block enforceable at the accreditation write the way R18f enforces examination provenance.
**Risk:** **Standard** as documentation + a design constraint binding CI-1 (whose Elevated class covers the code); the manifest rule, if elected, is its own governance session.
**PR16:** positioning **strengthens** (anti-gaming: "the narrative is the fabrication defence at the examination layer"); dogfood **yes**.
**Rollback:** rides CI-1's flag + docs revert.
**Founder verification:** after CI-1: an examination consumed with prose deferred still produces a retained narrative server-side (query by loop id); the docs state the blocked configuration.

## Sequencing (PR1 discipline; ride-groups named)

| Order | Session | Items | Risk envelope | Why this order |
|---|---|---|---|---|
| 1 | **M1 — consult-path levers** | CI-1 (+ CI-17 riding), then CI-2, CI-3 riding | Elevated (Critical guard named in CI-1) | Largest latency/cost lever; CI-17's existence guarantee binds CI-1's design; Branch-2 re-run (if elected) needs these |
| 2 | **M2 — mint session** | CI-6 + CI-7 | Elevated + Standard | Pre-P1 funnel fixes; resolves the carried F12-vehicle open question; PR17 walkthrough retires the console workflow |
| 3 | **M3 — accreditation session** | CI-11 + CI-12 (+ CI-4's write-boundary half if this order holds) | Elevated (+ additive schema; Critical-check at the R18f seam) | Trust-surface honesty (read asymmetry + configuration honesty) serves launch under any 0h branch |
| 4 | **M4 — gate + quick-tier session** | CI-8 + CI-9 + CI-10 + **CI-16** | Standard ×2 + Elevated ×2 | Self-contained; CI-9 diagnostic-first (PR10); CI-16 proven on `/api/reason` quick first (PR1), gate inherits in-session |
| 5 | **M5 — practice-completion session** | CI-4 (reason-route half) + CI-13 + CI-15 riding | Elevated | The mandatory loop + default-on reflect + the two-gate cadence docs — the adopted methodology becomes shipped contract; benefits from M1's fast consults for verification |
| 6 | **M6(+M7) — trajectory persistence** | CI-5 (split schema→activation if needed) | Standard schema + Elevated | The largest build; lands on inert fields + named Stage-A migration; also unlocks Q1's proximity-calibrated depth (CI-15 note) |
| 7 | **M8 — credential consolidation design** | CI-14 (design only) | Standard (design); build later = Critical | Needs M1–M5 learnings; build is its own Critical track |

**Part-5 benchmark dependencies (for the later schema session):** the benchmark's harnessed-leg efficiency assumptions are CI-1/CI-2/CI-3 (schema supplied; prose decoupled); its loop-closure and reflect legs assume CI-4 and CI-13; credentials pre-provisioned assumes CI-7 (and is measurable outside agent-work regardless); an ambiguous-input consult exercises the AC-13/14 machinery no CI touches (designed-dormant, FX-5).

## The former parked list — RESOLVED by mentor consultation + founder adoption (2026-06-12)

All five questions were mentor-consulted (verbatim record in this directory) and the verdicts **adopted** (`D-SAGE-PRACTICE-METHODOLOGY-AMENDMENTS-ADOPTED-2026-06-12`): (1) consultation cadence → the two-gate rule, published via **CI-15**; (2) narrative elimination → **blocked** — existence guaranteed via **CI-1 + CI-17**; (3) reflect firing → **default-on with explicit opt-out** via **CI-13**; (4) re-examination after correction → **mandatory, same depth** via **CI-4**; (5) quick-tier scope → **amended** — minimal value classification via **CI-16**. The mentor-confirmation gate remains in force for any future methodology question.

Still out of this plan: anything touching the R20a perimeter, distress classifier, or zone logic (PR6/Critical, separate protocol); the Sage Assent rename track; Stripe activation; the Q2-derived **manifest rule candidate** (R18f-parallel "no examination credential over verdict-only assessments" — flagged in CI-17, its own governance session if the founder elects); the 0h call itself.

---

**STOP.** This plan is presented for item-by-item founder decision. Suggested decision vocabulary per item: **approve / amend (state the amendment) / reject / defer**. The first build session opens only on the items marked approved, in the §Sequencing order unless re-ordered at approval.

> **APPROVED IN FULL — founder, 2026-06-12** (`D-MECHANISM-CORRECTION-BUILD-PLAN-APPROVED-2026-06-12`): all items **CI-1…CI-17 approved as amended**, sequencing M1–M8 as named. Approval carries the items' internal gates unchanged: CI-8 at Standard as drafted; CI-9 diagnostic-only; CI-14 design-only (build = its own Critical track); **no production flag activation approved — each activation follows 0c-ii at its own step**. The build commences at M1: `operations/handoffs/founder/2026-06-12-mechanism-correction-M1-consult-path-build-NEXT-SESSION-PROMPT.md`.

*Plan ends. Cross-references: grounding dossier (boundary table); fresh-test-analysis (FX register); verdict memo §8; forensic §5–§7; K1 ADR; SR-14/SR-12 (sage-reflect design); `D-SAGE-ASSENT-SAGEREASONING-DEPENDENCY-RULE-ADOPTED-2026-05-23` (R18f/R19e lineage); manifest R5/R17/R18/R19; PR1/PR2/PR6/PR10/PR15/PR16/PR17/PR18.*
