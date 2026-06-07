# Next-Session Prompt — A16 + A17: Privacy + Regulatory governance pass (draft on current wording; lawyer review deferred)

Paste this whole file into a new session to proceed.

This session does the **draftable** privacy + regulatory governance work **now**, on current wording, and **defers the legal sign-off** to the lawyer engagement at Stage-1 close. Nothing here waits on the lawyer: every deliverable is produced as a founder-authored draft, and each item that genuinely needs a lawyer is captured in a single **Lawyer Review Queue** so the engagement, when it happens, is a review — not a blank page.

**Stream:** founder. **Tier:** `governance`. Confirm at open.
**Governing frame:** `/adopted/standing-protocol-cache.md` (lean templates; this is a `governance` category session → Standard risk, lean forms).
**Predecessor close:** `/operations/handoffs/founder/2026-06-07-R19D-all-tools-close.md` (most recent — R19d complete; committed, pushed, Vercel green).
**Predecessor decision-log entries:** `D-R19D-ALL-TOOLS-2026-06-07`; `D-A18C-FRAMEWORK-DEPENDENCE-2026-06-07`; and the most relevant substantive one — `D-R17-ERASURE-PORTABILITY-COMPLETENESS-2026-05-29` (the data-subject-rights build these governance docs sit on top of).
**Risk classification:** **Standard** under 0d-ii for the new `/compliance/` draft files (documentation only — no code, no schema, no flags). **Elevated** for any edit to the manifest compliance front-matter (a governing document): such edits require **explicit per-edit founder approval + prior-version backup to `/archive/`** before the change. AC7 not engaged. PR6 not engaged. Critical Change Protocol **not** engaged.

## Why this session matters

A16 (privacy governance) and A17 (regulatory governance) are the two Standard, lawyer-coupled governance passes that run in parallel with the Stage-1 critical path (staging plan §"Concurrency", Efficiency 9). The data-subject-rights *machinery* already exists and is live in production — deletion (`/api/user/delete`), export/portability (`/api/user/export`), access (`/api/user/access`), rectification (`/api/user/rectify`) — per `D-R17-ERASURE-PORTABILITY-COMPLETENESS-2026-05-29` and the A15 series. What is missing is the *governance paper layer* around it: a DPIA, an ISO-27701 alignment map, a sub-processor DPA register, a reconciled compliance register, an Article 50 transparency posture, and an operationalised quarterly-review cadence (next due **2026-07-06** — imminent). This session produces all of that on current wording so the lawyer engagement at Stage-1 close is a review of real drafts, not a discovery exercise.

## Scope (from staging plan §A16 / §A17)

**A16 — Privacy governance pass:**
- **A16a — DPIA + substrate data-flow diagram.** Draft a Data Protection Impact Assessment for the intimate-data processing (R17 store) + a data-flow diagram (user → substrate → Anthropic/Supabase/Vercel). *Lawyer-coupled:* draft fully now; legal sign-off → Lawyer Review Queue.
- **A16b — ISO/IEC 27701:2025 informal alignment mapping.** Map current controls (encryption R17b, access controls, deletion, retention) to ISO 27701 clauses. Fully draftable now; no lawyer needed for the draft.
- **A16c — Sub-processor DPA register.** Register of Anthropic + Supabase + Vercel as sub-processors (founder/company as controller), what each processes, where, and DPA status. *Lawyer-coupled:* draft the register now; confirming each DPA is executed → Lawyer Review Queue. (A16c also feeds the user-facing privacy policy's sub-processor list — note any privacy-policy change as a separate, founder-approved edit; ground the privacy-policy location at open.)

**A17 — Regulatory governance pass:**
- **A17a — Compliance register (CR-###).** Already populated in the manifest YAML front-matter (8 entries: `CR-GDPR-A17-DELETION`, `-A15-ACCESS`, `-A16-RECTIFICATION`, `-A20-PORTABILITY`, `CR-EAA-WCAG-AA`, `CR-EU-AIA-A50`, `CR-AU-PRIVACY-1988`, `CR-CCPA-DELETION`). This session **verifies** it is current and **reconciles** it with `/compliance/compliance_register.json` (confirm the two agree; the manifest header is authoritative). No lawyer needed for reconciliation.
- **A17b — EU AI Act Article 50 transparency posture.** Draft the current-wording posture for AI-generated-content transparency (substrate Layer 3 prose carries an AI-generated notice; signing establishes provenance). Manifest R18e + `CR-EU-AIA-A50` already hold placeholder language (enforcement live 2026-12-02). *Lawyer-coupled:* draft posture now; final binding language → Lawyer Review Queue.
- **A17c — R14 quarterly review cadence operationalised.** The register's `next_review_due` is **2026-07-06** (`review_cycle: quarterly`, `owner: founder`). Produce the operational cadence: what the review checks, who runs it, where it's recorded, and a scheduled reminder. No lawyer needed.

## What "draft now, lawyer later" means (the governing constraint for this session)

- Every deliverable is produced **in full** on current wording and current understanding.
- Each item that requires a lawyer is **not blocked** — it is drafted and then **logged in a single `/compliance/lawyer-review-queue.md`** (create it this session) with: the item, the specific legal question, the current draft posture, and the risk if the draft is wrong. The lawyer engagement at Stage-1 close works that queue top to bottom.
- No CR posture is upgraded to a stronger claim (e.g. PARTIAL → ALIGNED) on the strength of these drafts alone — posture upgrades that depend on legal confirmation stay as-is and go in the queue. (Honest positioning, R19.)

## Pre-conditions (founder confirms at open; AI verifies by read)

1. `D-R19D-ALL-TOOLS-2026-06-07` is committed, pushed, Vercel green (founder confirmed at the R19d close). Working tree clean; no `.git/index.lock`.
2. Production flags unchanged from the R19d close (all four R20a flags `true`; `R20B_INDEPENDENCE_COACHING_ENABLED` + OTel / injection-defence / Layer3 / plugin-install-auth / abuse-detection UNSET). The two pending migrations (`compliance_access_log`, `compliance_rectification_log`) remain pending — out of scope here.
3. The AI does no git operations (founder commits/pushes via GitHub Desktop; remove `.git/index.lock` first if present).
4. No governing-document edit (manifest header, staging plan, `CLAUDE.md`) without explicit per-edit founder approval + prior-version backup to `/archive/`.

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — `governance` tier; Standard risk; lean templates; signals; AI-failure-modes table incl. prescribe-before-grounding + PR17).
2. `/operations/handoffs/founder/2026-06-07-R19D-all-tools-close.md` — predecessor close (production state line).
3. `/adopted/substrate-plugin-staging-plan.md` §A16 + §A17 + §"Concurrency" + the lawyer-engagement bring-forward note (ST2 Q4).
4. `/manifest.md` — the compliance YAML front-matter (lines 1–65, the CR register + cadence) and targeted rules: R16 (data governance), R17 / R17b / R17c / R17g / R17h / R17i (intimate data + data-subject rights), R18e (Article 50), R14 (quarterly review), R19 (honest positioning — no overclaiming posture).
5. `/compliance/` — `compliance_register.json` + `compliance_audit_log.json` (the existing register state to reconcile against), and skim the existing reports to match house style.
6. `/operations/decision-log.md` last 2 entries + `D-R17-ERASURE-PORTABILITY-COMPLETENESS-2026-05-29` (the build these docs document).

Confirm at open (narrate before substantive work, per the AI-failure-modes table): where we are in the arc (R19d complete; this is the parallel-track A16/A17 governance drafting pass, lawyer review deferred to Stage-1 close); tier = `governance`; risk Standard (Elevated + approval for any manifest-header edit); model selection N/A (no LLM calls written); status vocabulary; PR15 (no Anthropic primitive substitutes for DPIA/ISO/DPA governance drafts — state explicitly); PR11/PR13 (you may web-check current regulatory status for accuracy, but binding interpretation is the lawyer's, deferred — state findings inline and their implications).

## Part B — Procedure

Ground each target before drafting it (prescribe-before-grounding). Suggested order — A17a/A17c first (cheapest, no lawyer, builds context), then A16b, then the lawyer-coupled A16a/A16c/A17b, then the queue.

### Step 1 — A17a: reconcile the compliance register
Compare the manifest YAML CR register (authoritative) against `/compliance/compliance_register.json`. List any divergence; propose the reconciliation. If the JSON needs updating to match the manifest, that is a Standard `/compliance/` edit. If the *manifest header* needs any change, stop — that is Elevated, needs explicit approval + `/archive/` backup first.

### Step 2 — A17c: operationalise the R14 quarterly cadence
Produce `/compliance/quarterly-review-cadence.md`: what each quarterly review checks (walk the CR register + change-triggers), who runs it (founder), where results are recorded (`compliance_audit_log.json`), and the next-due date (2026-07-06). Offer to set a scheduled reminder for the founder for the 2026-07-06 review.

### Step 3 — A16b: ISO/IEC 27701:2025 alignment mapping
Produce `/compliance/iso-27701-alignment-map.md`: a table mapping current controls (R17b encryption, access control, R17c deletion, retention, sub-processor governance) to the relevant ISO 27701 clauses, with an honest "aligned / partial / gap" column. Informal alignment, not certification — say so (R19).

### Step 4 — A16a: DPIA + data-flow diagram
Produce `/compliance/dpia-intimate-data.md`: a Data Protection Impact Assessment for the R17 intimate-data processing (purpose, lawful basis question → queue, data categories, the user→substrate→Anthropic/Supabase/Vercel flow, risks + mitigations already in place, residual risk). Include the data-flow diagram (Mermaid is fine). Flag the lawful-basis + residual-risk-acceptance items to the Lawyer Review Queue.

### Step 5 — A16c: sub-processor DPA register
Produce `/compliance/sub-processor-register.md`: Anthropic, Supabase, Vercel — what each processes, region, transfer mechanism, and DPA-execution status (mark "to confirm" where unverified → queue). Note the downstream privacy-policy sub-processor-list update as a separate founder-approved edit (do not edit the live privacy policy without approval).

### Step 6 — A17b: EU AI Act Article 50 transparency posture
Produce `/compliance/article-50-transparency-posture.md`: the current-wording posture (Layer 3 AI-generated notice + signing provenance, per R18e), what is already in place vs to-build, and the enforcement date (2026-12-02). Final binding language → Lawyer Review Queue.

### Step 7 — Lawyer Review Queue
Create `/compliance/lawyer-review-queue.md`: one entry per deferred legal item from Steps 4–6 (and any CR posture upgrade awaiting confirmation), each with the question, current draft posture, and risk-if-wrong. This is the packet for the Stage-1-close engagement.

### Step 8 — Verify
- All new `/compliance/*.md` files exist and are internally consistent with the manifest CR register (no contradictory posture claims; no posture overclaimed beyond current evidence — R19).
- If a Mermaid diagram is used, it renders (open the `.md`).
- Confirm no governing document was edited without approval + `/archive/` backup; confirm no code/schema/flag touched.
- PR13 five-question pass on any regulatory web-findings.

### Step 9 — Decision-log entry (lean form) + session close (lean form)
Per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry" / §"Lean session close". Append `D-A16-A17-PRIVACY-REGULATORY-GOV-YYYY-MM-DD`. Record: A16a-c + A17a-c drafted on current wording; lawyer review deferred to Stage-1 close via the Lawyer Review Queue (PR7 — decision deferred, with revisit condition = lawyer engagement). Then supply the exact `git add`/commit command for the founder to push via GitHub Desktop (remove `.git/index.lock` first if present).

## What is NOT in this session

- No code, schema, env-flag, or deployment change. Documentation only.
- No edit to any governing document (manifest header, staging plan, `CLAUDE.md`) without explicit per-edit founder approval + prior-version `/archive/` backup. The manifest CR register is authoritative for A17a; only reconcile the JSON to it unless the founder approves a header change.
- No edit to the live privacy policy / TOS without explicit approval (A16c only *drafts* the sub-processor list; wiring it into the published policy is a separate approved step).
- No posture upgrade in the CR register on the strength of these drafts alone — legal-dependent upgrades go to the Lawyer Review Queue (R19 honest positioning).
- No lawyer engagement performed here — this session *prepares* for it.

## Scope note (founder controls)

A16 + A17 together are estimated at ~4 sessions in the staging plan (2 + 2). This prompt front-loads the **draftable** work into one focused governance pass. If it runs long, the natural split is: **A17a/A17c/A16b** (no-lawyer, quick) in session one; **A16a/A16c/A17b + the queue** (lawyer-coupled drafts) in session two. The founder decides at open whether to do it in one pass or split.

## Rollback path

Per file: new `/compliance/*.md` files can simply be deleted (nothing depends on them yet). Any reconciliation edit to `compliance_register.json` restores from its `/archive/` backup. No code, schema, flag, or deploy to reverse.

## Forecast

Most likely shape: A17a reconciled, A17c cadence operationalised (+ optional scheduled reminder for 2026-07-06), A16b ISO map drafted, A16a DPIA + data-flow drafted, A16c sub-processor register drafted, A17b Article 50 posture drafted, and a single Lawyer Review Queue assembled — all on current wording, with every legal-dependent item parked in the queue rather than blocking. After it, A16/A17 are "drafted, pending lawyer review," and the FPE/legal track (lawyer engagement at Stage-1 close) is the sole remaining long-pole. One `governance` session (or two if split), ~3–4 hours total.

End of prompt. Opens on `main`. Tier `governance`, Standard risk (Elevated + approval for any manifest-header edit). Documentation only; no code/schema/flags; founder commits/pushes via GitHub Desktop.
