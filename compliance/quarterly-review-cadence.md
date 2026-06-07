# Quarterly Compliance Review Cadence — R14 operationalised (A17c)

**Status:** Adopted 2026-06-07 under `D-A16-A17-PRIVACY-REGULATORY-GOV-2026-06-07`.
**Rule served:** R14 (Regulatory Compliance Pipeline).
**Owner:** founder.
**Cadence:** quarterly.
**Next review due:** **2026-07-06**.
**Where results are recorded:** `/compliance/compliance_audit_log.json` (append one new run object per review).

---

## Why this exists

R14 requires a quarterly review of the compliance register, but the *procedure* — what to check, who runs it, where to record it — had not been written down. This document is that procedure, written so the founder can run it without help. It is deliberately a checklist, not prose.

It governs **both** registers (see `/compliance/register-reconciliation-2026-06-07.md` for why there are two):
- **Manifest header CR register** (`/manifest.md` YAML front-matter) — authoritative, 8 headline obligations + the four GDPR data-subject rights.
- **Pipeline register (JSON)** (`/compliance/compliance_register.json`) — the broad working register the quarterly pipeline operates on.

---

## When to run it

1. **Every quarter**, on or near the `next_review_due` date (currently 2026-07-06). After each review, set the next date three months out (e.g. 2026-10-06).
2. **Out of cycle**, whenever a **change trigger** fires. The triggers (from the manifest header) are:
   - EU AI Act classification guidance publication
   - **EU AI Act Article 50 obligations apply — 2 August 2026** (and the 2 December 2026 marking backstop)
   - Australia mandatory guardrails announcement
   - Australian Privacy Act reform bill passage
   - **Australian Privacy Act APP 1.7 automated-decision-making transparency — 10 December 2026**
   - Pty Ltd incorporation (FPE-1) — switches `CR-AU-PRIVACY-1988` controller posture
   - Any data breach, sub-processor change, or new product surface that processes personal data

---

## The review checklist (founder-runnable)

Work top to bottom. Each step says exactly what to open and what to look for. Nothing here requires reading code.

### Part 1 — Regulatory scan (has anything changed in the law?)
- [ ] **1.1** For each obligation in the manifest header register, do a quick web search for any change since the last review (e.g. "EU AI Act Article 50 latest", "Australian Privacy Act APP 1.7 2026", "California CCPA deletion 2026"). The AI can do this scan for you and summarise — ask it to.
- [ ] **1.2** Note any change with: what changed, the date, and a source link. (These go into the audit-log entry, §Part 4.)

### Part 2 — Register currency (do our records still match reality?)
- [ ] **2.1** Open `/manifest.md` (the YAML block at the very top). Read each of the 8 CR entries. For each, ask: *is the `posture` still true today?* Note anything that has moved (e.g. an endpoint that went live, a lawyer review that completed).
- [ ] **2.2** Open `/compliance/compliance_register.json`. Confirm it still agrees with the manifest header on the overlapping obligations (the `cross_ref` fields show the links). If they disagree, the manifest header wins — fix the JSON (a Standard edit; back it up to `/archive/` first).
- [ ] **2.3** **Do not upgrade any posture to a stronger claim on your own** (e.g. PARTIAL → ALIGNED) if the upgrade depends on legal confirmation. Those wait for the lawyer (see `/compliance/lawyer-review-queue.md`). Honest positioning, R19.
- [ ] **2.4** Check the `/compliance/lawyer-review-queue.md` — has any queued item been answered by the lawyer since last time? If so, apply the answer and move the queue item to "resolved".

### Part 3 — Model-selection governance (AC1)
- [ ] **3.1** Open `/manifest.md` AC1 ("Model Reliability Boundaries"). Confirm the model strings are still current (today: Opus / Sonnet 4.6 / Haiku 4.5 family). If Anthropic has released newer models, ask the AI to re-check the Haiku reliability boundary (KG2) and update the table. Record any change in the decision log.

### Part 4 — Record the result
- [ ] **4.1** Append a new run object to `/compliance/compliance_audit_log.json` with: `run_date`, `run_type: "quarterly"`, the regulatory changes found (Part 1), the impact assessments (which CR-IDs / rules are affected and how), any register updates made, and `next_scheduled_run` (three months out). The most recent run object in that file is the template — copy its shape.
- [ ] **4.2** If any change is material, append a short decision-log entry (`D-...`) per the lean template.
- [ ] **4.3** Update `next_review_due` in **both** registers to the next quarter.
- [ ] **4.4** Commit the changed files via GitHub Desktop.

### Part 5 — Layer 0 context sync (R14, second paragraph)
- [ ] **5.1** R14 pairs the quarterly compliance review with a Layer 0 re-immersion: re-read the strategic documents, confirm project direction still aligns with the oikeiosis sequence (R0), and surface any recommended changes to priorities. This is currently a **manual** step (Sage Ops Layer 0 sync is Priority 7, post-launch). For now: a 15-minute re-read of the manifest's purpose section + the current staging plan, noting anything that drifted. Record observations in the audit-log run object under a `layer_0_observations` field.

---

## What the 2026-07-06 review specifically needs to close

Carried into the first scheduled run after this cadence was written:
1. Confirm the A17a reconciliation held (CR-002/005/009 still accurate).
2. Walk the Lawyer Review Queue — by 2026-07-06 the Stage-1-close lawyer engagement may have started; apply any answers.
3. The APP 1.7 privacy-policy update (due 10 Dec 2026) and the Article 50 dates (apply 2 Aug 2026) are both approaching — confirm they are tracked, not slipping.
4. Re-confirm the manifest-header Article 50 date fix (LRQ-6) — either approved + applied, or still queued.

---

## A note on automation (future)

This is the **manual** cadence. Per project instructions §0g / PR8, a workflow skill (e.g. `sage-registry-audit`, which already exists) may automate Parts 1–2 once the manual process has proven itself over a few cycles. Do not automate before the manual pattern is proven. The reminder (below) is the lightest possible automation and is safe to set now.

---

*End of cadence. This is the operative procedure for every R14 quarterly review. Update it if R14 or the register structure changes.*
