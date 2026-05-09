# Stoic Agent Substrate — Build Plan (recommendation-only)

**Status:** Draft — under founder review and approval.
**Date:** 2026-05-09.
**Stream:** founder.
**Tier:** governance.
**Risk classification:** Standard under 0d-ii (drafts only; no production touch).
**Supersedes:** `/drafts/stoic-agent-substrate-staging-plan.md` (the options-form draft preserved for reference).
**Source materials:** predecessor close `2026-05-09-substrate-architecture-explore-close.md`; the five inbox files; the founder's open-source declaration; the staging-plan options-form draft.

This plan is a single recommended path. No alternative options are presented inside the plan; where a decision is needed before Session 1, the recommendation is named in §4 and the founder approves or adjusts. After §4 decisions, Sessions 1 onward run with minimum founder mid-session input.

---

## 1. Executive summary

**What this plan delivers:** v1 of the Stoic Agent Substrate — open-source Layers 1 and 3, authoritative Layer 2 with auth/signing/keys/metering, a published schema with documentation, decision-path mechanisms in evaluative mode, and a translation pattern wiki — across **32 packed sessions** estimated at **8–12 calendar months** at 4–6 sessions per month with calendar-parallel external engagements.

**What is deferred to v2:** credential infrastructure (F-cluster), other modes beyond evaluative (E5 prescriptive/configurable/combo), ecosystem offerings (G-cluster), and public engagement / standards formation (B8, H7). v2 is sketched at §8 and re-planned at v1 close.

**What this plan does that the predecessor draft did not:**

1. **Sessions are the unit, not items.** Each session is a self-contained card: pre-conditions, deliverables, mid-session founder touch points (only Critical sessions have any), verification, rollback, and next-session pre-conditions.
2. **Decisions batched upfront.** The ten pre-build decisions in §4 cover everything the founder needs to decide before Session 1. After §4, mid-session founder input is limited to Critical Change Protocol approvals (one per Critical session).
3. **Sessions packed to ~90% capacity.** Each session combines multiple deliverables where dependencies allow. ADR work is densely packed; Critical work is one-per-session by necessity.
4. **Rework prevented by sequencing.** ADR-before-implementation; schema-before-validation; design-before-execution; Critical-changes-after-all-design-frozen.
5. **Total compressed.** v1 = 32 sessions vs. the predecessor's 115–192 estimate, achieved by aggressive ADR packing, v1 scoping, and consolidated multi-item sessions.

---

## 2. Operational model

**How sessions are shaped.** Each session opens with the cache + predecessor close + the day's deliverable spec, runs as long as context allows (target ~90% before close-out), and ends with a lean session close + next-session prompt prepared for the founder. Founder reviews close + prompt asynchronously; next session opens when founder confirms.

**How decisions are batched.** Decisions live in next-session prompts, not mid-session conversation. The pattern: session N close names the decisions session N+1 needs; founder makes those decisions in their pre-session message; session N+1's prompt locks them in; session N+1 runs without further decisions.

**The one mid-session founder touch point.** Critical-tier sessions (per 0d-ii: auth, signing, encryption, R20a perimeter, deployment configuration, data deletion) require Critical Change Protocol step 6 — explicit founder approval specific to named risks before deployment. This is mid-session and unavoidable. Standard and Elevated sessions have no mid-session founder touch points.

**How rework is prevented.**

- ADRs precede implementation. Every Critical implementation session (Stream B) executes a decision already adopted in an ADR session (Stream A).
- Schema precedes validation. C1 schemas are stable before A4 validation surface is wired.
- Design precedes execution. E5 mode-separation paper design lands before any E1/E2/E3 implementation.
- Open-source readiness precedes publication. B3/B4 hardening lands before B7 governance goes live; B7 governance lands before public release.
- External validation precedes scale. Stage gates require external validation (developer beta in Stream C exit; external agent test in Stream E exit) before declaring stage complete.

**Status vocabulary.** Implementation status (Scoped → Designed → Scaffolded → Wired → Verified → Live) for substrate components. Decision status (Adopted / Under review / Superseded) for ADRs and this plan. Never mixed.

**Risk and tier mapping per session.** Each session card names its risk class. Standard and Elevated use the lean templates per the cache. Critical uses the full templates per 0c-ii. Sessions with mixed risk are governed by the highest-risk classification.

---

## 3. Scope: v1 and v2

**v1 (this plan):**

- H1 substrate concept ADR adopted; manifest amended (H6, H8).
- B1 licence chosen and adopted; B6 brand posture established; trademark filing initiated.
- A6 V3 endpoint family migration path adopted and first migration steps executed.
- A5 R20a perimeter handover executed (replicate in open Layer 1 + enforce server-side at Layer 2).
- A1 auth, A2 signing, A3 key management, A7 metering all wired and Verified on at least one pilot endpoint.
- A4 input validation surface wired to C1 schemas.
- C1 schemas published in JSON Schema, OpenAPI, TypeScript types; C2 documentation published; C3 three-mode reference published; C5 error catalogue published; C6 linter published; C7 fixtures published; C4 developer guide published.
- B2 monorepo structure adopted; B3 Layer 1 hardened and published; B4 Layer 3 hardened and published; B5 R20a reference in open Layer 1 (per A5 path); B7 governance day-one minimum live.
- D1–D6 wiki structure, corpus (~50–100 patterns), governance, code linkage, test corpus, docs source — all live.
- E5 mode-separation paper design adopted; E1 action-scorer endpoint Verified; E2 verification endpoint Verified; E3 subagent handoff payload format published with reference verifier; E5 evaluative mode endpoint Verified; E6 acceptance/rejection audit trail wired.
- One external agent successfully running an end-to-end Stoic causal sequence against the substrate.

**v2 (re-planned at v1 close):**

- F1–F6 credential infrastructure; H4 credential format ADR.
- E5 prescriptive, configurable, combo modes.
- E4 concern-radius credential (consolidated into Stream J at v2 — see §8).
- G1–G8 ecosystem offerings (SDKs, MCP packaging, domain adapters, calibration, narrative, examples-as-data, adoption playbook).
- B8 public announcement strategy.
- H7 standards-formation engagement plan.
- Final manifest amendments resulting from v1 evidence.

**Why this v1 / v2 split:** v1 establishes the substrate as a real, running, open-source-with-authoritative-Layer-2 thing in the world. v2 expands it into a portable-credential, multi-mode, full-ecosystem offering. The split lets v1 ship in under a year and lets v2 be planned with v1 evidence.

---

## 4. Pre-build founder decisions

The founder approves or adjusts each item below before Session 1 opens. After Session 1 is in flight, no further pre-build decisions are needed.

**Governance approvals (3):**

1. **Approve this plan.** Recommendation: approve as written. If revisions needed, name them and the plan is re-drafted before Session 1.
2. **Confirm v1 scope per §3.** Recommendation: approve as written.
3. **Confirm operational model per §2.** Recommendation: approve as written.

**Architectural signals (7):**

4. **Licence direction.** Recommendation: **Apache 2.0 with a custom Layer-2-API addendum.** Apache 2.0 is permissive, well-understood, friendly to commercial adoption, and patent-grant-bearing. The custom addendum specifies that any system claiming to provide "SageReasoning Authoritative Layer 2" assessments must call the SageReasoning Layer 2 endpoint (or a successor licensed by SageReasoning); brand and trademark posture (B6) enforces this in parallel. Lawyer review at Session 2 confirms the addendum's enforceability. Adjust if you want pure permissive (no addendum), copyleft (AGPL), or dual-licence.

5. **Migration path direction (A6).** Recommendation: **coexist for six months, then deprecate `/api/reason` and the V3 endpoint family in favour of the substrate.** During the coexistence window, both endpoints are live; the substrate carries the new schema; `/api/reason` is internally re-implemented as a substrate consumer where reasonable. Deprecation announcement in v2. Adjust if you want immediate cutover (faster but riskier) or permanent coexistence (slower but lower-risk).

6. **R20a perimeter handover direction (A5).** Recommendation: **belt-and-braces — replicate R20a distress detection in open Layer 1 AND enforce server-side at Layer 2 as a precondition.** Anyone running open Layer 1 inherits the protection by default; anyone calling authoritative Layer 2 cannot bypass it even if they fork Layer 1 and remove it. B5 (open-source R20a reference) ships. Adjust if you want server-side-only (lower attack surface for Layer 1 implementation; higher risk that forks ship without protection) or open-Layer-1-only (lower trust signal at Layer 2).

7. **Repo structure direction (B2).** Recommendation: **monorepo for v1.** All open-source components (Layer 1, Layer 3, schema, docs, wiki) in one repository. Multi-repo split deferred to v2 if volume warrants. Monorepo is simpler for governance and contribution; multi-repo complicates B7 day-one governance. Adjust if you want multi-repo from v1.

8. **External-engagement budget.** Recommendation: **engage lawyer (B1, B6) and cryptographer (A2, A3) within v1; defer philosopher review (C2, D2 corpus) to v1 mid-point or v2.** Lawyer engagement starts at Session 2; cryptographer at Session 5 mid-point. Budget figure for these is a separate operational decision; the plan assumes engagement happens. Adjust if budget constrains.

9. **Pilot endpoint for Critical infrastructure (A1–A7).** Recommendation: **`/api/reason` quick depth.** It is currently live, has a known shape, is a Layer 2 entry point per the existing V3 architecture, and provides the cleanest pilot surface for auth + signing + metering. Critical Change Protocol rollback paths preserve its current behaviour throughout. Adjust if you want a fresh `/api/substrate/v1/score` endpoint instead (cleaner naming; more code; no rollback to existing behaviour).

10. **Beta cohort for Stream C exit.** Recommendation: **closed invitation to 5–10 selected developers** before public release (Session 18). Cohort drawn from Anthropic developer ecosystem and any agent-developer contacts the founder has. Two-to-four-week beta window before Session 18 goes live. Adjust if you want public-from-day-one (simpler logistics; higher risk of public-facing rough edges) or larger cohort (more validation; longer wait).

After founder confirms or adjusts the ten items above, Session 1 opens.

---

## 5. v1 session-by-session plan

Five streams, 32 sessions. Each session is a card.

### Stream A — Governance and ADRs (Sessions 1–4)

**Session 1 — Foundational ADRs Pass 1**
- **Risk:** Standard. **Sessions:** 1.
- **Pre-conditions:** Plan approved; §4 decisions confirmed; cache + predecessor close + this plan re-read at session open.
- **Mid-session founder input:** None.
- **Deliverables drafted in `/drafts/`:**
  - H1 substrate concept ADR (substrate as unified architecture; layers; addressable Stoic causal-sequence moments; scope)
  - B1 licensing ADR (Apache 2.0 + custom Layer-2-API addendum per §4.4; lawyer engagement note)
  - A6 migration ADR (six-month coexist then deprecate per §4.5)
  - A5 R20a handover ADR (belt-and-braces per §4.6)
  - H3 three-mode access ADR (developmental sequence; Mode 1/2/3 contracts)
  - H5 cost impact preliminary update in `/business/`
- **Verification (founder, between sessions):** read each ADR; mark approve, request revisions, or escalate.
- **Rollback:** all files in `/drafts/`; revert by `rm`.
- **Next session pre-conditions:** founder approval of all six ADRs; lawyer engagement initiated for B1 (calendar parallel).

**Session 2 — Foundational ADRs Pass 2 + Critical-infrastructure Unified ADR**
- **Risk:** Standard. **Sessions:** 1.
- **Pre-conditions:** Session 1 ADRs approved.
- **Mid-session founder input:** None.
- **Deliverables drafted in `/drafts/`:**
  - B2 repo structure ADR (monorepo per §4.7)
  - A1+A2+A3+A7 unified Critical infrastructure ADR (auth + signing + key management + metering as one document because they are tightly coupled and adopting them piecemeal invites design drift)
  - A4 input validation surface ADR (Elevated; Layer 2 boundary contract)
  - H6 manifest amendments draft (R-codes, AC additions, PR additions if any, KG entries needed)
- **Verification:** founder reads four ADRs; cryptographer engagement initiated for A1+A2+A3+A7 review (calendar parallel).
- **Rollback:** revert in `/drafts/`.
- **Next session pre-conditions:** ADRs approved; lawyer review of B1 returned (or the ADR proceeds with a "lawyer-pending" note); cryptographer review initiated.

**Session 3 — Adoption + Manifest Amendment + Reconciliation**
- **Risk:** Elevated (file moves from `/drafts/` to `/adopted/`).
- **Pre-conditions:** All Session 1 + 2 ADRs approved.
- **Mid-session founder input:** None.
- **Deliverables:**
  - All ADRs moved from `/drafts/` to `/adopted/` with archive entry per file
  - H6 manifest amendments adopted; cache updated; D-CACHE-DRIFT-RESOLVED-2026-... entry appended
  - H8 reconciliation pass: read manifest end-to-end against substrate; flag drift; either resolve in-session or list as deferred items in decision-log
- **Verification:** founder reads adopted files at their canonical paths.
- **Rollback:** `git revert` of the move-to-adopted commits.
- **Next session pre-conditions:** Adopted ADRs canonical; manifest amendments live; H8 findings either resolved or scheduled.

**Session 4 — Schema + Validation Surface + Linter Design**
- **Risk:** Standard.
- **Pre-conditions:** A6 ADR adopted (so schema design knows what code it points at); H1 adopted.
- **Mid-session founder input:** None.
- **Deliverables:**
  - C1 schemas drafted in three formats (JSON Schema, OpenAPI fragment, TypeScript types) under a new `/website/src/schemas/v1/` path
  - C2 documentation skeleton — every field defined with Greek term, primary-source citation slot, when-to-use, examples slot
  - C3 three-mode reference document drafted
  - C5 error message catalogue drafted (error codes, plain-language messages, Stoic-onboarding reference links)
  - C6 schema linter design ADR drafted (scope; library or endpoint; integration with C5)
  - C7 fixtures spec drafted (input → expected output table for first 20 fixtures)
- **Verification:** founder reads schemas, doc skeleton, error catalogue.
- **Rollback:** revert under new path.
- **Next session pre-conditions:** Schemas approved; ready for Stream B Critical execution.

### Stream B — Critical infrastructure execution (Sessions 5–10)

Each Stream B session executes one Critical change with the full Critical Change Protocol per 0c-ii. Each requires mid-session founder approval before deployment. The ADRs adopted in Stream A pre-decide everything except the deployment moment.

**Session 5 — A1 server-side authentication on pilot**
- **Risk:** Critical (PR6 + AC7).
- **Pre-conditions:** A1 ADR adopted (Session 2); pilot endpoint identified (`/api/reason` quick depth per §4.9); rollback baseline tagged in git.
- **Mid-session founder input:** Critical Change Protocol step 6 — explicit approval to deploy with named risks acknowledged.
- **Deliverables:** auth module wired on pilot endpoint; auth verified against test commands; rollback plan documented; cache updated if any KG entry triggered.
- **Verification:** founder runs test commands provided in the close; expected outputs match.
- **Rollback:** `git revert` of the wire-up commit; documented in close.
- **Next session pre-conditions:** A1 Verified live on pilot.

**Session 6 — A2 signing on pilot**
- **Risk:** Critical.
- **Pre-conditions:** A1 Verified on pilot; A2 ADR adopted; cryptographer review returned (or A2 proceeds with "cryptographer-pending" note and a v1.1 review session is scheduled).
- **Mid-session founder input:** Critical Change Protocol step 6.
- **Deliverables:** signing module wired; signed Layer 2 assessment output verifiable with a reference verifier; signature verification command in close.
- **Verification:** founder runs verification command; signed assessment validates.
- **Rollback:** `git revert`.
- **Next session pre-conditions:** A2 Verified live; signing key pair committed to KMS (preview of A3).

**Session 7 — A3 key management**
- **Risk:** Critical.
- **Pre-conditions:** A2 Verified; A3 ADR adopted; KMS choice confirmed (recommendation in A3 ADR).
- **Mid-session founder input:** Critical Change Protocol step 6.
- **Deliverables:** KMS provisioned; signing keys rotated (first rotation rehearsal); rotation runbook documented; key compromise procedure documented.
- **Verification:** founder reads runbook; observes that signing still works after rotation.
- **Rollback:** key rotation rollback per runbook.
- **Next session pre-conditions:** A3 Verified; KMS operational; rotation rehearsal complete.

**Session 8 — A7 metering and rate-limiting**
- **Risk:** Critical.
- **Pre-conditions:** A1 + A2 Verified; A7 ADR adopted (in A1+A2+A3+A7 unified ADR Session 2).
- **Mid-session founder input:** Critical Change Protocol step 6.
- **Deliverables:** metering wired on pilot; rate-limit policy documented; cost-tracking integrated with R5 health metric; abuse-protection rules documented.
- **Verification:** founder runs metered request; sees count increment; rate-limit test triggers at expected threshold.
- **Rollback:** `git revert`; remove rate-limit rule.
- **Next session pre-conditions:** A7 Verified.

**Session 9 — A4 input validation surface**
- **Risk:** Elevated (validation is read-only; not Critical).
- **Pre-conditions:** A1 + A2 + A7 Verified; A4 ADR adopted; C1 schemas in repo (Session 4).
- **Mid-session founder input:** None (Elevated, not Critical).
- **Deliverables:** validation endpoint live; accepts Layer1Schema input; rejects malformed input with C5 error messages; integration with C6 linter spec.
- **Verification:** founder runs sample valid + invalid inputs; expected responses returned.
- **Rollback:** `git revert`.
- **Next session pre-conditions:** A4 Verified.

**Session 10 — A5 R20a perimeter handover execution**
- **Risk:** Critical (PR6 + AC5 — R20a perimeter).
- **Pre-conditions:** A4 Verified; A5 ADR adopted (belt-and-braces per §4.6); R20a current implementation reviewed.
- **Mid-session founder input:** Critical Change Protocol step 6.
- **Deliverables:** R20a server-side enforcement at Layer 2 wired (precondition check for every authoritative call); R20a reference implementation extracted into a shape ready for B5 publication in Stream C; perimeter inventory updated.
- **Verification:** founder runs distress-input test against Layer 2; expected redirection occurs.
- **Rollback:** `git revert`; R20a reverts to prior surface.
- **Next session pre-conditions:** A5 Verified live; Stream B complete; Stream C begins.

### Stream C — Open-source publication (Sessions 11–18)

**Session 11 — B7 community governance day-one + B6 brand posture**
- **Risk:** Elevated (governance; trademark filing initiated).
- **Pre-conditions:** B1 licence adopted; B6 ADR drafted (in Session 2 if folded; otherwise drafted here).
- **Mid-session founder input:** None.
- **Deliverables:** `CONTRIBUTING.md`, `MAINTAINERS.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md` drafted; brand posture document published; trademark filings drafted (lawyer-bound from §4.8 engagement).
- **Verification:** founder reads governance files; lawyer confirms trademark filings are filed.
- **Rollback:** revert.
- **Next session pre-conditions:** Governance files in place; trademark process underway.

**Sessions 12–13 — B3 Layer 1 hardening (two passes)**
- **Risk:** Elevated.
- **Pre-conditions:** A6 migration adopted (so we know what code we are extracting); B2 repo structure adopted; C1 schemas in repo.
- **Mid-session founder input:** None.
- **Deliverables (per pass):** Pass 1 — extract current Layer 1 implementation into the open repo path; clean dependencies; document each function; add unit tests. Pass 2 — examples; version contracts; external-developer-runnable; integration with C7 fixtures.
- **Verification:** founder runs the open Layer 1 reference locally per the developer guide.
- **Rollback:** revert; existing Layer 1 in `/website/src/` unchanged.
- **Next session pre-conditions:** B3 Verified externally runnable.

**Sessions 14–15 — B4 Layer 3 hardening (two passes)**
- **Risk:** Elevated.
- **Pre-conditions:** B3 pass 1 complete (so the schemas Layer 3 consumes are locked).
- **Mid-session founder input:** None.
- **Deliverables (per pass):** mirror of B3 — extract; clean; document; test; example; version-contract.
- **Verification:** founder composes Layer 1 → Layer 2 → Layer 3 end-to-end against pilot endpoint.
- **Rollback:** revert.
- **Next session pre-conditions:** B4 Verified end-to-end composable.

**Session 16 — B5 open-source R20a reference (per §4.6 path)**
- **Risk:** Critical (R20a perimeter; PR6).
- **Pre-conditions:** A5 Verified live (Session 10); B3 published.
- **Mid-session founder input:** Critical Change Protocol step 6.
- **Deliverables:** R20a reference implementation visible inside open Layer 1; tests; documentation that any fork removing R20a is an immediate disqualification from the SageReasoning brand under B6.
- **Verification:** founder reads R20a reference; runs distress-input test against open Layer 1 locally.
- **Rollback:** revert R20a from open Layer 1; server-side enforcement at Layer 2 (Session 10) remains the safety floor.
- **Next session pre-conditions:** B5 Verified.

**Session 17 — C4 developer guide + C7 test fixtures**
- **Risk:** Standard.
- **Pre-conditions:** B3 + B4 + B5 published; C2 documentation site populated.
- **Mid-session founder input:** None.
- **Deliverables:** developer guide with 5–10 worked examples (text input alongside corresponding self-classified Layer1Schema); C7 fixtures published; integration with C6 linter.
- **Verification:** founder follows guide and successfully runs all worked examples.
- **Rollback:** revert.
- **Next session pre-conditions:** C4 + C7 published; closed beta cohort invited per §4.10.

**Session 18 — Public release execution**
- **Risk:** Elevated (deployment-configuration change; first public exposure).
- **Pre-conditions:** Beta cohort feedback incorporated; B7 governance review process tested; trademark filings filed.
- **Mid-session founder input:** explicit go/no-go before flipping repo public.
- **Deliverables:** repo flipped public; announcement holding-post drafted (not yet sent — that's Stream L in v2); first public PR review process exercised.
- **Verification:** founder visits public repo URL; sees expected files.
- **Rollback:** repo reverted to private; announcement pulled.
- **Next session pre-conditions:** Stream C complete.

### Stream D — Translation pattern wiki (Sessions 19–24)

**Session 19 — D1 wiki structure + first 10 patterns**
- **Risk:** Standard.
- **Pre-conditions:** B3 published.
- **Deliverables:** wiki structure inside monorepo (recommendation: `/wiki/` directory; static-site build); pattern format documented; first 10 patterns drafted (passion patterns, kathekonta patterns, indifferent patterns).
- **Verification:** founder reads patterns; format reads cleanly.

**Sessions 20–22 — D2 corpus expansion (three passes)**
- **Risk:** Standard.
- **Per pass:** ~20–30 patterns added; per-mechanism breakdown (Pass 1 passion taxonomy; Pass 2 kathekonta + oikeiosis; Pass 3 unity-of-virtue + edge cases).
- **Verification:** founder spot-reads per pass.

**Session 23 — D3 governance + D4 wiki–code linkage**
- **Risk:** Standard.
- **Deliverables:** wiki contribution policy; PR-only contribution model; every pattern links to the B3 extractor function it implements.
- **Verification:** founder traces 3 wiki patterns to their B3 extractors.

**Session 24 — D5 wiki as test corpus + D6 wiki as docs source**
- **Risk:** Standard.
- **Deliverables:** wiki patterns wired into CI as automated validation set; B3 documentation refactored to reference wiki rather than duplicate.
- **Verification:** founder triggers CI; sees wiki-pattern tests run.
- **Next session pre-conditions:** Stream D complete.

### Stream E — Decision-path mechanisms (Sessions 25–32)

**Session 25 — E5 mode-separation paper design (full ADR)**
- **Risk:** Elevated.
- **Pre-conditions:** Streams A, B, C, D complete.
- **Deliverables:** E5 mode-separation ADR — evaluative, prescriptive, configurable, combo as separate products with shared substrate infrastructure; v1 implements evaluative only; v2 implements remaining modes.
- **Verification:** founder reads ADR.
- **Next session pre-conditions:** E5 paper design adopted.

**Session 26 — E1 action-scorer interface (sage-intuit)**
- **Risk:** Critical (substrate authoritative path; PR6).
- **Pre-conditions:** A1+A2 Verified; A4 + C1 in repo; E5 paper design adopted.
- **Mid-session founder input:** Critical Change Protocol step 6.
- **Deliverables:** action-scorer endpoint live; signed `kathekon_assessment` output; integration with C6 linter for input validation.
- **Verification:** founder calls endpoint with sample judgement + candidate action; receives signed assessment.
- **Rollback:** `git revert`.

**Session 27 — E2 verification interface (Layer B alignment)**
- **Risk:** Critical.
- **Pre-conditions:** E1 Verified.
- **Mid-session founder input:** Critical Change Protocol step 6.
- **Deliverables:** verification endpoint live; alignment metric computable and signed.
- **Verification:** founder calls endpoint with examined judgement + response; receives alignment record.
- **Rollback:** `git revert`.

**Session 28 — E3 subagent handoff payload (Layer C)**
- **Risk:** Critical.
- **Pre-conditions:** E1 + E2 Verified.
- **Mid-session founder input:** Critical Change Protocol step 6.
- **Deliverables:** subagent handoff payload format published; reference verifier library; documentation for receiving agents.
- **Verification:** founder produces a handoff payload from one substrate call; verifies it from a second.
- **Rollback:** `git revert`.

**Session 29 — E5 evaluative mode endpoint (v1)**
- **Risk:** Critical.
- **Pre-conditions:** E1 + E2 Verified; E5 paper design adopted.
- **Mid-session founder input:** Critical Change Protocol step 6.
- **Deliverables:** evaluative mode endpoint live (preserves agent agency; scores all candidates including any sage-augmented options); not configurable in v1.
- **Verification:** founder runs evaluative scoring against test scenario.
- **Rollback:** `git revert`.

**Session 30 — E6 acceptance/rejection audit trail**
- **Risk:** Elevated.
- **Pre-conditions:** E5 evaluative mode Verified.
- **Deliverables:** audit trail wired; queryable by agent developers; persistence in Supabase per existing audit-trail patterns.
- **Verification:** founder runs scoring; queries audit trail; sees the record.

**Session 31 — End-to-end integration**
- **Risk:** Elevated.
- **Pre-conditions:** E1, E2, E3, E5, E6 all Verified.
- **Deliverables:** end-to-end integration test (impression → examined judgement → action scoring → action → verification) wired into CI; documentation of full causal-sequence flow published in C2/C4.
- **Verification:** founder triggers CI; sees end-to-end test pass.

**Session 32 — First external agent test**
- **Risk:** Elevated.
- **Pre-conditions:** Session 31 complete; one beta-cohort developer briefed.
- **Mid-session founder input:** None (developer is external; founder observes).
- **Deliverables:** beta-cohort developer runs an agent through the full substrate; substrate produces signed assessments; developer reports back; v1 declared complete.
- **Verification:** founder reads developer report; signs off v1.
- **Next session pre-conditions:** v1 complete; v2 planning session opens.

---

## 6. Critical path

The longest dependency chain — items whose delay delays v1 release:

**Plan approval → Session 1 → Session 2 → Session 3 → Session 4 → Session 5 (A1) → Session 6 (A2) → Session 9 (A4) → Session 10 (A5) → Sessions 12–13 (B3) → Sessions 14–15 (B4) → Session 18 (public release) → Session 25 (E5 paper) → Session 26 (E1) → Session 27 (E2) → Session 29 (E5 evaluative) → Session 31 (integration) → Session 32 (external test).**

Sessions on the critical path: ~21 of 32.

**Items NOT on the critical path** (run in calendar parallel without delaying release):

- Lawyer engagement (B1 finalisation, B6 trademark) — calendar-parallel from Session 2
- Cryptographer engagement (A2, A3) — calendar-parallel from Session 5 mid-point
- A3 (key management) — Session 7, parallel after A2
- A7 (metering) — Session 8, parallel after A2
- B7 governance (Session 11), B5 reference (Session 16), C4+C7 (Session 17) — parallel within Stream C
- D1–D6 wiki (Sessions 19–24) — fully parallel with Stream E if founder elects
- E3 subagent handoff (Session 28), E6 audit trail (Session 30) — Stream E parallel after E1+E2

**Calendar-parallel optimisation:** if the founder runs Stream D (wiki) in parallel with Stream E (decision-path mechanisms), v1 completes in ~28 sessions of founder time rather than 32 sequential sessions. The plan stages them sequentially for simplicity but the parallelisation is available.

---

## 7. Rework-prevention discipline

Every session below carries one explicit rework-prevention measure. Surfaced here as a single list so the discipline is visible:

- **Session 1** — H1 frames the substrate concept before any implementation ADR commits to architecture. Prevents implementation-first drift.
- **Session 2** — A1+A2+A3+A7 unified ADR prevents auth/signing/keys/metering being designed piecemeal and discovering coupling problems mid-implementation.
- **Session 3** — H8 reconciliation pass catches manifest drift from Stream A's amendments before Stream B execution begins.
- **Session 4** — C1 schemas land before A4 validation surface (Session 9) is wired. Prevents validation against unstable schema.
- **Sessions 5–10** — every Critical change executes against an adopted ADR. No design happens in Critical sessions; only execution. Prevents Session 7b–style multi-session recoveries (PR1 + AC7).
- **Session 11** — B7 governance lands before B3/B4 publication. Prevents external contributions arriving without policy.
- **Sessions 12–15** — B3/B4 hardening sequenced with B3 first because B4 consumes B3's schema outputs. Prevents interface drift between Layer 1 and Layer 3.
- **Session 16** — B5 (open-source R20a) lands AFTER A5 server-side enforcement (Session 10). Prevents open Layer 1 carrying the only safety surface.
- **Session 17** — C4 developer guide lands after B3+B4+B5 publication. Prevents documenting examples against unstable code.
- **Session 18** — beta cohort feedback gates public release. Prevents public-facing rough edges.
- **Sessions 19–24** — wiki references B3 extractors (D4) only after B3 stable. Prevents wiki–code linkage drift.
- **Session 25** — E5 paper design lands before any E1/E2/E3 implementation. Prevents mode-separation forcing redesign of decision-path mechanisms.
- **Sessions 26–29** — E1 → E2 → E3 → E5 sequenced because each depends on prior. Critical changes executed against adopted ADRs only.
- **Session 31** — integration test before external agent test. Prevents external-developer-discovered issues that internal CI would catch.
- **Session 32** — single external developer first, broader exposure deferred to v2. Prevents many-developer rough-edge surface in v1.

---

## 8. v2 outline (re-planned at v1 close)

v2 is sketched at lower resolution. Each stream below becomes its own session-by-session plan when v1 closes and v1 evidence is in hand.

**Stream F — Credentials (estimated 8–12 sessions).**
F1 + H4 credential format ADR (W3C VC with selective disclosure recommended; cryptographer review required); F2 issuance; F3 verification library; F4 living-trail mechanism; F5 revocation model; F6 cross-platform readability (MCP, A2A engagement); E4 concern-radius credential consolidated here.

**Stream G — Other modes (estimated 6–10 sessions).**
E5 prescriptive mode endpoint; E5 configurable mode endpoint; E5 augmentative-combo mode endpoint; integration with E6 audit trail.

**Stream H — Ecosystem (estimated 8–14 sessions).**
G1 SDK (TypeScript first per §4 recommendation); G2 MCP server packaging; G3 first 2–3 domain adapters; G5 calibration tools; G6 process narrative; G7 examples-as-data; G8 adoption playbook.

**Stream I — Public engagement (estimated 4–6 sessions).**
B8 announcement strategy; H7 standards-formation engagement plan; v2 manifest amendments; v2 final ADRs.

**v2 estimated total:** 26–42 sessions, planned at v1 close.

---

## 9. Total estimate and calendar

| Stream | Sessions | Risk profile |
|---|---|---|
| A — Governance + ADRs | 4 | Standard / Elevated |
| B — Critical infrastructure | 6 | Critical (5 of 6) + Elevated (1) |
| C — Open-source publication | 8 | Elevated (mostly) + 1 Critical (B5) |
| D — Wiki | 6 | Standard |
| E — Decision-path mechanisms | 8 | Critical (4 of 8) + Elevated (4) |
| **v1 total** | **32** | |
| F + G + H + I (v2, sketch) | 26–42 | Critical (F-cluster, E5 modes) + Standard/Elevated (rest) |

**v1 calendar:** 32 sessions at 4–6 sessions per month = **5–8 months**. Add 2–4 months for external-engagement calendar (lawyer for B1/B6; cryptographer for A2/A3; beta cohort for Stream C). Total **8–12 months end-to-end** for v1.

**Compared with predecessor staging-plan estimate:** v1 of this build plan corresponds to ~Stages 1–5 of the predecessor at ~70–105 sessions. This recommendation-only form compresses to 32 sessions through:
- ADR packing (Sessions 1–2 produce 10 ADRs that the predecessor counted as ~10 separate items)
- Bundling decisions in unified ADRs where coupling exists (A1+A2+A3+A7)
- v1-scoped mode separation (evaluative only; rest deferred to v2)
- Calendar-parallel external engagements counted only once

---

## 10. Next step after plan approval

Founder reviews this plan. Three possible outcomes:

**Approve as written.** The next session opens with the prompt at `/operations/handoffs/founder/2026-05-09-substrate-build-session-1-NEXT-SESSION-PROMPT.md`. That prompt locks in §4 decisions and runs Session 1.

**Approve with adjustments.** Founder names the adjustments at the start of the next session; the plan is amended in-session before Session 1 begins.

**Reject.** Founder names the rejection reason. The next session is a re-planning session; Session 1 is deferred until a plan is approved.

---

*End of build plan. Recommendation-only form per founder instruction. The previous options-form draft is preserved at `/drafts/stoic-agent-substrate-staging-plan.md` for the alternative-options framing it carries. No code touched; no production change; nothing in `/adopted/` modified.*
