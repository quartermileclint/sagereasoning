# Multidisciplinary Project Review — 2026-06-10

**Reviewer:** Claude (Fable 5), Cowork session, founder stream. Independent of the early-June planning pass (the bring-forward + completion plans of 2026-06-07) and of the S1–S7 execution arc.
**Scope:** project directory (current + historical records), live website (verified via founder's Chrome), production Supabase (read-only SQL via founder's dashboard session), codebase, governance corpus, business/compliance documents, PR11 current-sources consultation.
**Method:** three parallel deep-sweeps (operations history; website codebase; governance/business/compliance) + direct live verification of production endpoints, pages, and database today. Every load-bearing claim in this report was either verified live today or carries its source file.
**Status:** Review record — Adopted as a record of findings. All recommendations are **Under review** until the founder elects them (see companion file `2026-06-10-recommended-actions-and-priorities.md`).
**Companion files:**
- `/operations/reviews/2026-06-10-recommended-actions-and-priorities.md` — actions, owners, sequencing
- `/operations/handoffs/founder/2026-06-10-NEXT-SESSION-PROMPT.md` — paste into the next session
- `/operations/handoffs/founder/2026-06-10-multidisciplinary-review-close.md` — session close (0b)

---

## 1. Where the project actually stands (verified production truth, 2026-06-10)

**I'm confident** in every line of this table — each was verified live today (Chrome session) or read directly from the working tree, not taken from any status document.

| Surface | Verified state today | Evidence |
|---|---|---|
| Site | Live at `www.sagereasoning.com` | Home, /limitations, /accessibility, /privacy all rendered and read |
| `/api/health` | 200 healthy; supabase + anthropic connected; **`stripe_billing: not_configured`** | Live fetch |
| R20a safety floor | All four flags Live (since 2026-05-31; both audience branches production-verified at S6) | S6 close + decision log; perimeter code read |
| A19 abuse detection | Live, 3 detectors; `/api/abuse/evaluate` → 401 without token; `abuse_signals` = 0 rows | Live fetch + SQL |
| A12 OTel audit | Live; `substrate_audit_events` = 6 rows; schema is structural-only (latencies, severity band, decision event, `provenance` + `use_policies` jsonb — AC10 implemented); no raw-text columns | SQL (schema + counts) |
| A10 plugin-install auth | Live (S5); `api_keys` = 11 rows (incl. verification tombstones), `credential_audit` = 13 | SQL + S5 close |
| A11b injection defence | Live (S4) | S4 close + decision log |
| GDPR endpoints | Live: /access, /rectify, /delete, /export; `compliance_access_log` + `compliance_rectification_log` exist (0 rows — no users yet) | SQL + S1 close |
| Layer 3 standalone | Inert by decision (OUT of launch scope, S7): GET 405 / POST 503 `substrate_layer3_disabled` | Live fetch |
| A13 delivery + A14 SLO | **Built, tested, uncommitted** in working tree; `/api/cron/observability` + `/api/admin/slo-health` → 404 in production (not yet deployed) | `git status` + live fetch |
| `/api/public-key` | 200, Ed25519, `substrate-layer2-2026Q2`, steady-state shape | Live fetch |
| Old README pages | `/hiring` → 404, `/therapy` → 404 (stale README copy only; **no live R1/R2 violation**) | Live fetch |
| Supabase security | **75 public tables; RLS enabled on all 75** (`tables_without_rls = NONE`) — the April 0h RLS warning is resolved | SQL |
| `vulnerability_flag` | Table exists (migration `supabase/migrations/20260416_r20a_vulnerability_flag.sql`), 0 rows = classifier never down | SQL + repo |
| Working tree | HEAD `a47642b` (S6); S7 build uncommitted: `vercel.json`, cron route + lib, slo route + lib, S7 docs; plus modified `decision-log.md`, stray `tsconfig.tsbuildinfo` | `git status` |
| Database activity | founder_conversation_messages 1,491; analytics_events 310; corpus_passages 186; classifier_cost_log 169; mentor_interactions 161; loop_billing_events 23; translation_sandwich_comparisons 61; discovery_sessions 0; sage_reflect_sessions 0 | SQL |

**Plain takeaway:** the product is real, live, safety-floored, observable, and quiet (founder is the only human user; no agent traffic yet). One deploy session (S7b) and one verification session (S8) stand between here and the completion plan's "pre-lawyer readiness" bar.

### Note on "the Opus 4.8 review"

No artefact in the repo carries an "Opus 4.8" attribution. The work matching that description is the **2026-06-07 planning pass** (bring-forward plan + pre-launch completion plan) and the **Pre-Launch S1–S7 sessions** (2026-06-07 → 2026-06-09) that executed it. This review treats those as the predecessor work and audits both their outcomes and what they did not cover.

---

## 2. Arc position

- **Phase:** P0, hold point 0h **active** (not exited). Criterion 1 declared MET for the Stage-1 dependency (2026-06-03); full 0h exit is S8's deliverable.
- **Completion plan:** S1 ✅ S2 ✅ S3 ✅ S4 ✅ S5 ✅ S6 ✅ (verification, not activation) S7 ✅ (build only) → **S7b queued (deploy, Critical, approval carried)** → **S8 (e2e verification + honest capability inventory + pre-lawyer readiness statement = 0h exit)**.
- **Then:** lawyer engagement (LRQ-1/2/3/5/7, FPE-5) → P1 business-plan review → launch decision.
- **Decision-log:** ~378 entries across archives + active log; append-only discipline intact; three stale "Under review" status lines are residue, not live questions (see §4.11).

---

## 3. Findings by discipline (PR14 ten domains + three project-specific)

### 3.1 Security
**Strong.** All 75 production tables RLS-enabled (verified today — resolves the open 0h-harness warning from 2026-04-17). Injection defence Live on both LLM seams (S4, TEST-parity adversarial probe re-passed in production). Abuse detection Live, detection-only, 0 false positives. A10 credential mint→use→revoke→401 cycle production-verified at S5. Ed25519 signing live with steady-state key shape. Secrets correctly out of the repo; `.env.local` gitignored.
**Gaps:** (a) `.env.example` documents ~6 of ~50 env vars the code reads — a real recovery/bus-factor risk for a solo founder (if Vercel env were lost, no complete reference exists outside Vercel itself); (b) 13 npm vulnerabilities (3 moderate, 10 high) recorded in May, deferred — still unaddressed, needs its own maintenance session (do NOT `npm audit fix --force` casually); (c) no CI — all tests run manually; (d) A19 enforcement (vs detection) deliberately unbuilt — fine pre-launch, needs a decision before real exposure.

### 3.2 Regulatory + compliance
**Substantially prepared, deadline-pressured.** DPIA, sub-processor register, ISO 27701 informal map, Article 50 posture, quarterly cadence (next due **2026-07-06**), reconciled register (manifest CR-2026-Q2-v5 authoritative), and a fully articulated 7-item Lawyer Review Queue all adopted 2026-06-07. Privacy page live with the US East region fix and the APP 1.7 ADM disclosure, honestly labelled "Draft pending legal review" (R19-consistent).
**The clock:** EU AI Act **Article 50 applies 2026-08-02 (~7.5 weeks)**; APP 1.7 ADM binding wording due 10 Dec 2026. At the current cadence S7b+S8 land mid-June; lawyer engagement must start essentially immediately after S8 to leave the lawyer usable lead time before 2 August. **This is the single most acute external deadline in the project.**
**Note:** whether Art. 50 strictly binds a pre-launch, no-EU-users product is itself LRQ-3 territory — the posture (MONITORING, not COMPLIANT) is correctly honest.

### 3.3 Accessibility
**Good for this stage.** A18e cognitive-accessibility pass done (AA contrast, live regions, inline errors, plain-language error copy). /accessibility statement live and honest (AA as target, not claim). CR-EAA-WCAG-AA remains ESCALATED pending the EU-customer-plausibility decision — correctly parked for the lawyer/founder.

### 3.4 Privacy by design
**Strong.** R17b AES-256-GCM server-side encryption applied at all intimate-data write paths (profile stores, journal prose, reflect sessions); client-side PBKDF2/AES path for journal entries the server never sees; R17c genuine deletion Verified-live; SAR/rectify/export live; audit table masked-by-design (verified at schema level today); founder's own 1,491 mentor messages are the live proof the protections matter. The mirror principle (R19d) now on 18 surfaces.
**Gaps:** (a) single `MENTOR_ENCRYPTION_KEY` with no rotation mechanism (version field exists; rotation unimplemented — acceptable now, log it); (b) `/api/user/export` duplicates gathering logic with R17b decryption — consolidation deferred (carried, correctly, as its own Elevated step); (c) retention-period schedule + breach-response runbook are named ISO-map gaps — lawyer-adjacent, cheap to draft.

### 3.5 Observability + SRE
**One deploy away from complete.** OTel Live; cost-health detection Live; A19 Live; **but alert delivery is pull-only until S7b deploys the cron** — signals exist that nobody is told about. A14 SLO tracker built (provisional, honest). After S7b: daily 08:00 UTC sweep → Slack. SLO/error-budget policy adopted 2026-06-07.
**Residual:** Vercel-log-only tracing (no persistent trace backend — deferred, fine); `/api/health` appears edge-cached (response timestamp was ~24h old when fetched today — **diagnostic-uncertain, symptom level**: probably CDN caching on the GET; worth a `Cache-Control: no-store` check some session, cosmetic).

### 3.6 Legal entity + tax structure
**Not started — now the longest lead-time item.** FPE-1 (Pty Ltd incorporation), FPE-2 (GST), FPE-3 (professional indemnity insurance quote), FPE-4 (coverage audit), FPE-5 (ToS/liability with lawyer) are all recorded, none initiated. These are wall-clock items independent of build pace; the build snapshot said "worth starting early" on 2026-05-31 and ten days of build sessions have passed. Incorporation also changes the privacy policy's "we are an Australian entity" wording and the Stripe account setup — sequencing matters.

### 3.7 Insurance
**Not started** (FPE-3/FPE-4 above). A solo founder operating a live distress-detection surface should not take real external users without professional indemnity / cyber cover priced in. Pre-launch gate, not a build item.

### 3.8 Marketplace economics + dispute resolution
**Designed, dark.** Option D loop billing ($0.02 base, overage at 50%×2.0) is implemented in code and consistent across stripe.ts / llms.txt / agent-card.json; 23 `loop_billing_events` rows accruing from verification traffic; **Stripe itself `not_configured` in production** (no keys/price IDs set). Launch criterion 2 ("Stripe handles paid-tier billing") therefore conflicts with the completion plan, which (reasonably) treats billing activation as post-verification work triggered by the first paying consumer. **This is a genuine founder decision at P1: amend the criterion or schedule the activation.** Dispute-resolution posture for marketplace listings remains future Stage-4 scope.

### 3.9 Onboarding UX
**Improved this arc.** /welcome first-run page + Getting Started nav links (A18a); baseline → welcome handoff; cognitive-accessibility pass; honest /limitations + /accessibility pages. Open cosmetics: two practice-name H1 renames awaiting founder voice-decision (Premeditatio Malorum, Oikeiosis Extension — carried since A18e).

### 3.10 Anthropic-native capabilities (PR15) + current sources (PR11)
Consultation performed this session (WebSearch; inbox scanned — no new files since 2026-05-22).
Findings: **(a)** June 15, 2026 — programmatic/agent use of Claude subscriptions moves to monthly credit pools (Pro $20 / Max-5x $100 / Max-20x $200); third-party agent tools re-permitted under those caps. **(b)** Claude Fable 5 / Mythos 5 released June 9 (new tier above Opus). **(c)** Managed Agents now support self-hosted sandboxes + private MCP servers (public beta); dynamic multi-agent workflows in research preview.
**PR13 five-question assessment:**
1. *Contradict a prior decision?* No.
2. *Refine one?* Yes — AC1's model table should be re-confirmed at the next quarterly review (2026-07-06) now that a new tier exists; no change before then (AC1 is a constraint, PR4).
3. *Affect in-flight work?* No (S7b/S8 add no LLM calls).
4. *Affect future stages?* Yes — (i) the credit-pool change may alter the founder's own Cowork/Claude-Code working costs from June 15 → watch against R5 discipline; (ii) self-hosted-sandbox Managed Agents and the agent-credit regime mildly strengthen the agent-developer market thesis for P1 (more sanctioned third-party agents = more potential substrate consumers); fold into the P1 market section.
5. *Affect operational discipline?* Minor — releasebot/docs consultation worked; no cache changes needed.

### 3.11 Product/build integrity (project-specific)
- **Safety perimeter (PR6/AC5):** 14 `enforceDistressCheck(detectDistressTwoStage(...))` call sites + 2 substrate-gate sites, all synchronous before any LLM call (PR3 holds); the invocation-guard test pins the 8-route human perimeter + 2 gates. Verified live for both audiences at S6.
- **Perimeter edge cases to put to the founder (not prescriptions — KG-EX1):** `/api/score-conversation` is JWT-authenticated (human caller) and accepts free-text transcripts but is outside the AC5 perimeter; `/api/score-iterate` is excluded by design (agent output pathway). Adding a ninth route is Critical under PR6/AC5 — founder decision whether the exclusion is intentional. Also `/api/founder/hub` mentions the distress check in a comment but never calls it (founder-only surface; tidy the comment or wire it).
- **Zone 2 calibration audit (open since 18 Apr):** `/operations/safety-signal-audits/2026-04-18-zone2-clinical-adjacency.md` is still "PARTIAL — regex stage verified, LLM stage untested." Later work (C2 live runs 2026-05-30; S6 production verification; the `r20a-classifier-eval.ts` utility) verified the acute-distress path end-to-end, so the floor is proven — but the **six-domain Zone-2 calibration audit was never completed and the audit file still presents as open.** Close the loop: run the eval utility against the Zone-2 domains and file the follow-up (Standard, AI-prepared, founder runs).
- **Registry:** `website/public/component-registry.json` v1.5.0, lastUpdated 2026-05-02 — 39 days stale; says 2 live / 148 wired / 30 verified of 191, while ≥14 components are demonstrably Live. S8's reconcile (the `sage-registry-update` skill) is the fix; **flag: S8 as scoped (e2e tests + inventory + readiness statement + registry) is a heavy single session — consider splitting the registry reconcile out** if it threatens the verification spine.
- **Tests:** 68 test files; pure tests runnable without env; the documented `--env-file` requirement for the two Supabase-importing tests stands (root cause: eager client construction in `supabase-server.ts` — known, fix deferred).
- **Dead/inert by design:** stripe-projects.ts scaffold (8 TODOs), R20b module (inert, off-perimeter, reviewed at S6), Layer-2 rotation vars unset (steady-state).

### 3.12 Documentation integrity (project-specific)
The recurring failure mode of this project is **status drift in secondary documents** — the decision log stays true while summaries go stale. Current drift inventory:

| Document | Drift | Severity |
|---|---|---|
| `/CLAUDE.md` production-state block | **Still lists A10, A11b, and the two A19 structural detectors as "Built but inert (flags UNSET)"** — all went Live at S4/S5 (2026-06-08/09). Same drift class S6 corrected for R20a, recurring within 24 hours of that correction. Misleads every session open. | Significant |
| `/README.md` | "The world's leading reference…" (R19b conflict); "score (0–100)" (R6c conflict); lists /hiring + /therapy as live (both 404 — verified). Status section dated 28 Mar 2026. | Significant (honesty rules in repo's front door) |
| `/INDEX.md` | Points to PROJECT_STATE.md + summary-tech-guide as "kept live" (both April); references TECHNICAL_STATE.md which **does not exist** | Significant (dead pointers in the canonical navigator) |
| `/PROJECT_STATE.md` | Claims authority; describes 20 April state (R17c "Scoped", Haiku stage "Untested" — both long since Live) | Significant |
| `/operations/tech-known-issues.md` | "No known issues at 20 April" — 51 days stale; none of the May–June known issues recorded | Moderate |
| `/business/*` (all 8 files) | Entirely pre-pivot (Mar–Apr): per-call pricing ~$0.0025 vs adopted $0.02/loop Option D; no Character Kernel; no Cowork-first; no Pty-Ltd structure | **Blocker for P1** (not for S7b/S8) |
| `users-guide-to-sagereasoning.md` | April draft, [TBD]s, pre-pivot product model | Minor (draft-labelled) |
| Root clutter | stale `next-session-prompt.md` (Apr 26), `prompt.md`, three `session-close-2026-04-13*.md`, `Untitled *.rtf`, `.~lock` files, `.fuse_hidden*`, ecosystem-map `.backup` twins | Cosmetic (archive sweep) |
| `component-registry.json` | 39 days stale (see §3.11) | Significant (S8 item, already planned) |
| 3 decision-log "Under review" residues | RAG-ALT3 phase-1 drafts (approved later same day); R20a Option-A ADR line (adopted via successor entry); config-audit findings doc (intentionally superseded-in-place) | Minor (annotate, don't rewrite history) |

### 3.13 Process & collaboration health (project-specific)
- The governance machinery (PR1–PR17, signals, risk tiers, PEV loop, walkthrough discipline) is demonstrably functioning: S6 is a model case — a Critical activation prompt was correctly re-scoped to verification when reconciliation contradicted its premise.
- Two debriefs (2026-04-08 auth crisis; 2026-05-27 C2) produced durable rules (deploy checklist; PR17; KG-EX1). KG-EX1 (prescribe-before-grounding) is mitigated only by session-open reading — this review deliberately frames perimeter/scope items as founder decisions, not prescriptions.
- **Stream concentration:** ops/tech/growth/support/mentor handoff streams have been dormant since late April; everything flows through the founder stream (~250 closes). Workable for a solo founder; re-affirm it as a conscious choice (PR7) rather than drift. The support inbox has no run-loop caller (deferred April) — the support pipeline is decorative until one exists.
- **Production-state drift is now a third-recurrence pattern** (completion-plan table → S3–S5 closes → CLAUDE.md post-S5). Under PR8 this earns a process rule: *production-state blocks are rewritten only at session close, only from the decision log + that session's verified observations, and always dated.* Candidate PR18 text is in the recommendations file.

---

## 4. MVP launch criteria — evidence-based status (corrected to production truth, 2026-06-10)

| # | Criterion | Status | Evidence / gap |
|---|---|---|---|
| 1 | sage-reason API accepts external calls with metering | **Substantially met** | A10 auth Live (mint→401 cycle verified S5); loop metering accruing (23 events); per-install quota *enforcement* deferred by decision (trigger: first paid onboard) |
| 2 | Stripe handles paid-tier billing | **Not met — decision needed** | Code fully wired; `stripe_billing: not_configured` live; completion plan defers activation past launch-readiness. Amend criterion or schedule activation at P1 |
| 3 | ≥3 human-facing tools live | **Met** | Score/reflect/journal/mentor/baseline + more, live and R20a-gated |
| 4 | llms.txt + agent-card serving | **Met** | Both 200 today; discovery surface verified at S5; openapi.yaml 3.1.0 live |
| 5 | Privacy + ToS lawyer-reviewed | **Not met (by design, queued)** | Honest drafts live; LRQ ready; lawyer not engaged — post-S8, Art-50 clock running |
| 6 | Business plan review complete | **Not met; inputs stale** | P1 gated on 0h exit (S8); /business docs pre-pivot — rewrite needed first |
| 7 | R17 protections operational | **Met** | Encryption, deletion, SAR, rectify, export all Verified-live; RLS on all 75 tables |
| 8 | R18 honest certification language | **Partially met** | Manifest + ADR locked; /limitations carries the honest scope; S8 carries the public-materials placeholder pass; README conflicts (§3.12) |
| 9 | R19 limitations page + mirror principle | **Met** | /limitations live + comprehensive (verified today, R19c/d/e explicit); mirror principle on 18 surfaces |
| 10 | R20 detection + redirection | **Met (R20a)** | All four flags Live, both audiences production-verified; R20b built-inert (post-launch decision); R20d covered on /limitations |
| 11 | R5 cost health alerts | **One deploy away** | Detection Live; delivery cron built + tested, deploys at S7b; thresholds provisional pending real traffic (correct) |

**Reading:** 6 of 11 effectively met; #11 closes at S7b; #8 closes at S8; #2, #5, #6 are the founder-gated tail (decision, lawyer, P1).

---

## 5. What the early-June review missed (gap-check on the predecessor pass)

The 2026-06-07 plan was excellent on activation sequencing but under-weighted: (a) the **FPE wall-clock track** (still not started; Art-50 + incorporation lead times bite regardless of session cadence); (b) **P1 input staleness** (S8 produces product truth, but no current business plan exists to review against it); (c) **documentation drift discipline** (its own table became the drift vector S6 had to correct — and CLAUDE.md drifted again immediately); (d) the **Zone-2 calibration audit loop** left formally open since April; (e) **.env.example/bus-factor** recovery documentation. All five are folded into the recommendations file.

---

## 6. Positives worth keeping in view

A solo non-technical founder, in ~11 weeks, has stood up: a live dual-audience product with a synchronous, invocation-tested safety perimeter; full GDPR data-rights mechanics; application-level encryption; RLS across the entire schema; OTel-grade structural auditing with provenance fields; abuse + cost detection; signed accreditation infrastructure; a 191-component registry; ~378 logged decisions with append-only integrity; honest public limitations/privacy/accessibility pages; and a working governance system that has caught and corrected its own drift twice. The remaining pre-lawyer work is one deploy, one verification session, and a set of Standard documentation fixes.

*End of review. Companion: recommended actions + priorities.*
