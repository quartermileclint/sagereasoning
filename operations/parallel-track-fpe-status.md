# Parallel Pre-Launch Track — Founder Personal Exposure (FPE) Status

**Status artefact created:** 2026-05-12 under `D-PROJECT-INSTRUCTIONS-AMENDED-FROM-ST2-2026-05-12` (Move 6 of ST2 adoption session).
**Scope:** five parallel pre-launch items that gate Stage 4 G4 marketplace approval per the amended staging plan (`/adopted/substrate-plugin-staging-plan.md` §Parallel pre-launch founder-personal-exposure track). The track runs alongside substrate-build sessions; items are executed by the founder + engaged professionals (lawyer, accountant, insurance broker), not within substrate-build sessions.
**Update discipline:** founder updates this file as item statuses change. Each status change to "Complete" is logged in `/operations/decision-log.md` (lean form). Each new "Initiated" status (the founder has begun the engagement / submitted the form / paid the deposit) is also logged. This artefact is the source of truth for Stage 4 G4 readiness on the FPE side; substrate-build readiness is tracked elsewhere (component registry, decision log, staging plan).
**Status taxonomy:** `Scoped → Designed → Initiated → Complete` (a five-step taxonomy abbreviated for FPE work; the substrate's `Scoped → Designed → Scaffolded → Wired → Verified → Live` doesn't fit non-software items).

---

## Plain-language summary

Five parallel-track items must reach Complete before Stage 4 G4 marketplace approval can be sought. None of them is a substrate-build session. All of them have wall-clock dependencies the substrate-build cannot accelerate. The founder should begin FPE-1 and FPE-2 immediately after ST2 adoption (today, 2026-05-12) — Pty Ltd incorporation takes weeks and gates FPE-3 (which gates FPE-4). FPE-5 depends on lawyer engagement (Stage 1 close per ST2 Q4).

| # | Item | Status | Wall-clock dependency | Cross-references |
|---|---|---|---|---|
| FPE-1 | Pty Ltd structure decision + incorporation | **Scoped** | Lawyer engagement; ASIC processing time (~5-10 business days post-application) | ST2 Phase 2 Domain 6 L1 |
| FPE-2 | GST registration timing decision | **Scoped** | Accountant engagement | ST2 Phase 2 Domain 6 L2 |
| FPE-3 | Tech E&O + Cyber Liability + General Liability purchase | **Scoped** | FPE-1 Complete (Pty Ltd needed for company-name policy); insurance broker engagement; quote-to-bind time (~2-3 weeks) | ST2 Phase 2 Domain 7 I1 |
| FPE-4 | Coverage-gap audit for AI-specific exclusions | **Scoped** | FPE-3 quotes received | ST2 Phase 2 Domain 7 I2 |
| FPE-5 | TOS + liability allocation document | **Scoped** | Lawyer engagement (Stage 1 close per ST2 Q4) | ST2 Phase 2 Domain 8 M1 |

---

## Per-item detail

### FPE-1 — Pty Ltd structure decision + incorporation

**Why:** Move founder-personal-liability boundary from founder-as-sole-trader to founder-as-director-of-company. Required before any insurance policy can name the company; required before TOS + liability allocation (FPE-5) can name the contracting party as the company.

**Founder workflow:**

1. Engage lawyer (covered by ST2 Q4 bring-forward to Stage 1 close); lawyer recommends company-structure form (Pty Ltd; small-business CGT eligibility consideration; sole-director-sole-shareholder vs other configurations).
2. Engage accountant (couples with FPE-2 — GST decision).
3. Prepare and lodge ASIC application (company registration; ACN issued).
4. Apply for TFN + ABN for the company.
5. Open business bank account in company name.
6. Update sagereasoning.com privacy policy + terms (when published) to name the company as data controller (CR-AU-PRIVACY-1988 posture switch — see manifest `change_trigger`).

**Status milestones:**

- **Scoped** (default at ST2 adoption) — Decision to incorporate has not been formally made; lawyer engagement not yet initiated.
- **Designed** — Lawyer recommendation received; structure form chosen (e.g., "Pty Ltd, sole director, sole shareholder").
- **Initiated** — ASIC application lodged.
- **Complete** — ACN issued; TFN + ABN active; business bank account open; privacy policy updated to name company as data controller.

**Current status:** Scoped.

**Note:** The amended manifest `change_trigger` field includes "Pty Ltd incorporation (FPE-1) — switches CR-AU-PRIVACY-1988 controller posture." When FPE-1 reaches Complete, R14 quarterly review is triggered out-of-cycle for that compliance entry.

---

### FPE-2 — GST registration timing decision

**Why:** GST registration becomes mandatory when annual turnover exceeds AUD 75,000. Pre-launch revenue is zero, so registration is optional now but founder needs to decide whether to register voluntarily (claim input-tax credits on the business expenses substrate-build incurs — Anthropic API costs, Vercel hosting, Supabase, etc.) vs delay until threshold approaches.

**Founder workflow:**

1. Engage accountant (couples with FPE-1).
2. Review business expense schedule for the next 12 months (substrate-build costs; pre-launch operational costs).
3. Accountant recommends: register voluntarily now (claim input-tax credits — net positive if expenses > ~AUD 8,250 over the year, since 1/11 of expenses is reclaimable); or delay until threshold approaches.
4. If voluntarily registering: lodge with ATO; receive GST registration date; quarterly BAS lodgement begins.

**Status milestones:**

- **Scoped** — Accountant engagement not yet initiated.
- **Designed** — Accountant recommendation received; voluntary-now vs delay election made.
- **Initiated** — If voluntary-now: GST registration lodged with ATO. If delay: decision recorded; revisit condition documented.
- **Complete** — Decision finalised + (if voluntary) GST registration date confirmed + first BAS schedule set up.

**Current status:** Scoped.

---

### FPE-3 — Tech E&O + Cyber Liability + General Liability purchase

**Why:** SageReasoning makes ethical claims (R18 honest certification). Tech E&O covers professional negligence + errors-and-omissions exposure (e.g., a customer claims the substrate's output caused harm). Cyber Liability covers data-breach + cyber-incident exposure (R17 intimate data + Supabase + Anthropic API surface). General Liability covers third-party bodily injury + property damage exposure (low risk for a software-only business but standard inclusion). D&O (Directors & Officers) is purchasable at first investor engagement (not yet required pre-launch but worth flagging here).

**Founder workflow:**

1. Engage insurance broker (specialise in tech / AI businesses).
2. Provide broker with: scope of business (Stoic-reasoning substrate; agent-developer plugin; human-facing tools); revenue projections (zero pre-launch; competitor-anchored projections for Year 1); data shape (Supabase intimate-data; Anthropic API processing; no PCI; no PHI); risk-management posture (R17, R18, R19, R20 in manifest; Critical Change Protocol in project instructions; AC7 + AC8 + AC9 architectural constraints).
3. Receive quotes (typically 3-5 carriers; ~2 weeks).
4. Compare quotes; bind policies; pay first premium.
5. Receive certificates of insurance; store in `/business/insurance-certificates/` (folder created at bind).

**Status milestones:**

- **Scoped** — Broker engagement not yet initiated.
- **Designed** — Broker engagement initiated; risk-scope shared.
- **Initiated** — Quotes received from carriers; founder evaluating.
- **Complete** — Policies bound; certificates received; premium paid.

**Current status:** Scoped.

**Dependency:** FPE-1 must reach Complete first (insurance policies bind to the Pty Ltd company name, not founder-personal).

---

### FPE-4 — Coverage-gap audit for AI-specific exclusions

**Why:** Many Tech E&O + Cyber Liability policies (especially older ones not updated for AI-specific risks) carry exclusions for AI-generated content liability, model-output errors, training-data IP infringement, or autonomous-agent action liability. The substrate makes AI-generated content judgements; these exclusions could effectively void the policy on the most likely failure modes. Founder + broker review policy exclusions line-by-line; negotiate endorsements (add-on coverage) where needed; document residual gaps for transparent disclosure (R18 honest certification carries over to insurance-coverage honesty).

**Founder workflow:**

1. Once FPE-3 quotes received: review each policy's AI-specific exclusion language with broker.
2. Identify exclusions that materially affect substrate-relevant risks (model output; training data; autonomous-agent action; data-classification failures).
3. Negotiate endorsements (add-on coverage) with carriers where available; document residual gaps where unavailable.
4. Founder makes informed coverage choice (accept residual gap vs not bind that policy vs find alternative carrier).
5. Record residual-gap inventory in `/business/insurance-coverage-residual-gaps.md` (NEW file created at FPE-4 Complete).

**Status milestones:**

- **Scoped** — FPE-3 not yet at Initiated status.
- **Designed** — FPE-3 quotes received; broker review scheduled.
- **Initiated** — Exclusion-by-exclusion review in progress.
- **Complete** — Endorsement negotiation closed; residual-gap inventory documented.

**Current status:** Scoped.

**Dependency:** FPE-3 must reach Initiated (quotes received) before FPE-4 can begin Designed status.

---

### FPE-5 — TOS + liability allocation document

**Why:** Stage 4 G4 marketplace approval requires public-facing terms-of-service + privacy policy + liability allocation. The TOS is the contract between SageReasoning (the company) and its users (human practitioners + agent developers). Liability allocation states which party bears what risk for which failure mode (substrate-output errors; service availability; data security; etc.). The document is lawyer-reviewed (not lawyer-drafted from scratch; founder provides a draft that captures the substrate's actual posture per R17/R18/R19/R20 and the lawyer refines for enforceability + jurisdiction-specific compliance).

**Founder workflow:**

1. Founder drafts initial TOS + privacy policy + liability allocation, drawing on:
   - R17 intimate data protections (manifest)
   - R18 honest certification + Character Kernel category language (manifest + J1 ADR)
   - R19 honest positioning + limitations (manifest)
   - R20 active protection (manifest)
   - Substrate-architecture realities (Layer 1 open; Layer 2 + Layer 3 closed; per-agent credentials A10; etc.)
2. Lawyer reviews draft; identifies enforceability + jurisdiction issues; refines language.
3. Lawyer-reviewed version published on sagereasoning.com when public surface goes live; agent-card.json + llms.txt reference the TOS URL.
4. TOS-acceptance flow built into the sagereasoning.com first-run experience (A18a sub-stage of Stage 1 expansion); plugin-side TOS-acceptance flow built into Stage 3 plugin onboarding (C7).

**Status milestones:**

- **Scoped** — Founder draft not yet started; lawyer engagement not yet initiated.
- **Designed** — Founder draft complete; lawyer engagement initiated.
- **Initiated** — Lawyer-reviewed version in iteration.
- **Complete** — Lawyer-reviewed version published on sagereasoning.com; TOS-acceptance flow scoped for A18a + Stage 3 C7.

**Current status:** Scoped.

**Dependency:** Lawyer engagement (Stage 1 close per ST2 Q4 bring-forward). Lawyer engagement is shared across A16 (privacy gov), A17 (regulatory gov), FPE-5 (TOS + liability) — one engagement, multiple deliverables.

---

## Gating relationship to Stage 4 G4

Per the amended staging plan §Stage 4 G4 expanded gating criteria, Stage 4 G4 marketplace approval cannot proceed until all five FPE items reach Complete. The substrate-build arc may reach Stage 4 G1-G3 + G5 + G6 + I5 without the FPE track being complete — but G4 (the marketplace review submission) is the gate.

Substrate items also gating G4 (for reference; tracked separately, not in this file):
- A10-A19 (Stage 1 expansion) Verified
- C1-C7 (re-scoped Stage 3) Verified or BESPOKE (C5 only)
- R18 + R19c + R20a + R20b operational

---

## Decision-log integration

When any FPE item changes status:

- **Scoped → Designed**: log via `D-FPE-#-DESIGNED-YYYY-MM-DD` (lean form; one line per item).
- **Designed → Initiated**: log via `D-FPE-#-INITIATED-YYYY-MM-DD` (lean form; names the external date that triggered Initiated status, e.g., "ASIC application lodged 2026-06-15").
- **Initiated → Complete**: log via `D-FPE-#-COMPLETE-YYYY-MM-DD` (lean form; names the completion-evidence, e.g., "ACN issued 2026-06-25 — see /business/asic-certificate-2026-06-25.pdf").

All five at Complete → log via `D-FPE-TRACK-COMPLETE-YYYY-MM-DD` (lean form; unlocks Stage 4 G4 readiness check on the FPE side).

---

## Cross-references

- `/adopted/substrate-plugin-staging-plan.md` §Parallel pre-launch founder-personal-exposure track (the canonical source for what each FPE item is)
- `/adopted/substrate-plugin-staging-plan.md` §Stage 4 G4 expanded gating criteria
- `/manifest.md` §CR-AU-PRIVACY-1988 (FPE-1 Complete triggers controller-posture switch and out-of-cycle R14 review for this entry)
- `/operations/decision-log.md` — append-only decision trail for FPE status changes
- ST2 close: `/operations/handoffs/founder/2026-05-12-build-plan-stress-test-ST2-close.md` (Q6 election adopting parallel track; Q4 election bringing lawyer engagement forward)
- Adoption checklist: `/archive/2026-05-12-amendment-adoption-checklist.md` (Move 6 created this artefact at ST2 adoption)

---

*End of parallel pre-launch track status artefact. Created 2026-05-12 at ST2 adoption Move 6. Updated by the founder as items progress. Source of truth for FPE-side Stage 4 G4 readiness.*
