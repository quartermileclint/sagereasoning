# Next-Session Prompt — A16/A17 follow-up: the two queued Elevated edits (LRQ-6 manifest Article 50 date + LRQ-4 privacy policy)

Paste this whole file into a new session to proceed.

This session closes the two **Elevated** accuracy edits that the A16/A17 governance pass surfaced but deliberately did **not** make (because they touch governing/live surfaces and need your explicit per-edit approval). Both are factual corrections — neither needs the lawyer. The lawyer-dependent items (LRQ-1, 2, 3, 5, 7) stay in the queue for the Stage-1-close engagement and are **out of scope** here.

**Stream:** founder. **Tier:** mixed `governance` + `code-elevated` → the session runs at **Elevated** risk (the higher of the two sets the form). Confirm at open.
**Governing frame:** `/adopted/standing-protocol-cache.md` (lean templates + Elevated additions).
**Predecessor close:** `/operations/handoffs/founder/2026-06-07-A16-A17-privacy-regulatory-governance-close.md` (A16/A17 drafted, committed, pushed, Vercel green).
**Predecessor decision-log entry:** `D-A16-A17-PRIVACY-REGULATORY-GOV-2026-06-07`.
**Risk classification:** **Elevated** under 0d-ii. Critical Change Protocol **NOT** engaged (no auth, session, encryption, access-control, R20a perimeter, data-deletion, or deployment-config change). PR6 not engaged. AC7 not engaged. Each of the two edits is to a governing/live surface, so each requires **explicit per-edit founder approval + a prior-version backup to `/archive/`** before the change.

## Why this session matters

A16/A17 produced the governance paper layer and a Lawyer Review Queue (`/compliance/lawyer-review-queue.md`). Two of the seven queue items are **founder-approvable now without a lawyer** because they are pure accuracy fixes:
- **LRQ-6** — the manifest header records EU AI Act Article 50 as "Enforcement live 2026-12-02" only. The correct picture (web-checked 2026-06-07): Article 50 **applies 2 August 2026**; 2 December 2026 is the narrower AI-Omnibus **marking backstop** (Art. 50(2)) for generative systems already on the market.
- **LRQ-4** — the live privacy policy says Supabase is hosted in **Singapore**; the actual region is **US East (North Virginia)**. It also lacks a Vercel sub-processor listing and full APP 1.7 automated-decision-making transparency (due 10 Dec 2026).

Closing these removes two known-inaccuracies from a governing document and a live user-facing page. The **final legal wording** for the APP 1.7 / Article 50 transparency text remains lawyer-queued — this session corrects facts and strengthens transparency, it does not claim legal compliance (R19 — no overclaiming).

## Pre-conditions (founder confirms at open; AI verifies by read)
1. `D-A16-A17-PRIVACY-REGULATORY-GOV-2026-06-07` is committed, pushed, Vercel green (founder confirmed at the A16/A17 close). Working tree clean; no `.git/index.lock`.
2. Production flags unchanged from the A16/A17 close (all four R20a flags `true`; R20b/OTel/injection-defence/Layer3/plugin-install-auth/abuse-detection UNSET). The two pending migrations (`compliance_access_log`, `compliance_rectification_log`) remain pending — out of scope.
3. The AI does no git operations (founder commits/pushes via GitHub Desktop; remove `.git/index.lock` first if present).
4. No governing-document or live-page edit without explicit per-edit founder approval + prior-version `/archive/` backup.

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — Elevated risk; lean + Elevated additions; signals; AI-failure-modes table incl. prescribe-before-grounding + PR17).
2. `/operations/handoffs/founder/2026-06-07-A16-A17-privacy-regulatory-governance-close.md` — predecessor close (production-state line; the two queued edits).
3. `/compliance/lawyer-review-queue.md` — LRQ-6 and LRQ-4 in full (the question, draft posture, risk-if-wrong).
4. `/compliance/article-50-transparency-posture.md` and `/compliance/sub-processor-register.md` — the drafted source content for the two edits.
5. `/manifest.md` — the CR register YAML front-matter (the `CR-EU-AIA-A50` block) + R18e.
6. `website/src/app/privacy/page.tsx` — the live privacy policy (the Anthropic/Supabase/Automated-Decision-Making sections).

Confirm at open (narrate before substantive work, per the AI-failure-modes table): where we are in the arc (A16/A17 drafted + committed + green; this session closes the two queued Elevated accuracy edits; lawyer-dependent items stay queued); tier = governance + code-elevated → Elevated; model selection N/A (no LLM call written); status vocabulary; PR15 (no Anthropic primitive substitutes for these edits — state explicitly); PR11/PR13 (no new web check needed — the 2026-06-07 findings stand; state explicitly).

## Part B — Procedure

Ground each surface before editing it (prescribe-before-grounding). Do LRQ-6 first (smaller, governance-only), then LRQ-4 (code-elevated).

### Step 1 — LRQ-6: correct the manifest header Article 50 date (Elevated; governing document)
1. **Back up first:** copy `/manifest.md` to `/archive/manifest.md.backup-pre-lrq6-2026-06-DD`.
2. **Show the founder the exact before/after** for the `CR-EU-AIA-A50` block (the `note` and consider whether `next_review` should change). Proposed `note` replacement: *"R18 §Article 50 placeholder in force; final language deferred to lawyer engagement at Stage 1 close. Article 50 obligations apply 2026-08-02; machine-readable marking (Art. 50(2)) has an AI-Omnibus transition backstop of 2026-12-02 for generative systems already on the market before 2026-08-02."*
3. **Get explicit approval** ("OK") specific to the manifest-header change before editing.
4. Apply. Then update the JSON `CR-002` note pointer if it references the old framing, and mark **LRQ-6 resolved** in `/compliance/lawyer-review-queue.md` + the D7 line in `/compliance/register-reconciliation-2026-06-07.md`.
5. **Cache check:** a manifest change triggers the standing-protocol-cache update discipline only if it touches rules/ACs/PRs — a CR-header date note does not, but confirm and state so.

### Step 2 — LRQ-4: privacy-policy update (Elevated; live user-facing page)
1. **Back up first:** copy `website/src/app/privacy/page.tsx` to `/archive/privacy-page.tsx.backup-pre-lrq4-2026-06-DD`.
2. **Draft the three changes and show the founder before/after:**
   - (a) **Supabase region:** "Asia-Pacific region (Singapore)" → "United States (US East / North Virginia)". Align with `/compliance/sub-processor-register.md`.
   - (b) **Add Vercel** as a named hosting/compute sub-processor (it processes request/response data transiently in the US).
   - (c) **Strengthen §5 Automated Decision-Making** for APP 1.7 transparency (disclose that AI produces scores/reasoning that could significantly affect individuals; the user can request human review / apply their own judgement). Keep it factual; do **not** assert "APP 1.7 compliant" — final wording is lawyer-queued.
3. **Get explicit approval** specific to the privacy-policy change before editing.
4. Apply. Mark **LRQ-4 progressed** in the queue (facts corrected + transparency strengthened; final legal wording still lawyer-queued) and update `CR-005` in the JSON to note the region/Vercel/ADM update applied.

### Step 3 — Verify (Elevated)
- `cd website && node_modules/.bin/tsc --noEmit` → exit 0 (privacy/page.tsx compiles).
- Grep confirms: privacy page no longer says "Singapore"; now names Vercel; §5 strengthened.
- `manifest.md` `CR-EU-AIA-A50` note reads the corrected dates.
- `python3 -c "import json; json.load(open('compliance/compliance_register.json'))"` → valid.
- Confirm no other file changed (no auth/encryption/flag/deploy surface touched).

### Step 4 — Decision-log entry (lean form)
Append `D-A16-A17-FOLLOWUP-QUEUED-EDITS-2026-06-DD`: LRQ-6 manifest Article 50 date corrected; LRQ-4 privacy-policy facts corrected + ADM transparency strengthened (final legal wording still queued). Both Elevated; backups in `/archive/`. PR7: the remaining LRQ items stay deferred to Stage-1 close.

### Step 5 — Session close (lean form) + commit command
Per `/adopted/standing-protocol-cache.md`. Provide the exact `rm -f .git/index.lock` + `git add`/commit block for the founder to push via GitHub Desktop. **Vercel note:** the privacy-page edit is a live user-facing change — expect a normal Vercel rebuild; the page should render with the corrected content.

## What is NOT in this session
- No lawyer engagement; LRQ-1, LRQ-2, LRQ-3, LRQ-5, LRQ-7 stay queued for Stage-1 close.
- No auth, session, encryption, access-control, R20a, data-deletion, or deployment-config change (not Critical).
- No new env flag, schema, or migration.
- No posture upgraded to a stronger CR claim on these edits alone (R19).

## Rollback path
- LRQ-6: restore `/manifest.md` from `/archive/manifest.md.backup-pre-lrq6-2026-06-DD`.
- LRQ-4: restore `website/src/app/privacy/page.tsx` from its `/archive/` backup and redeploy (Vercel rebuild).
- No schema, flag, or data change to reverse.

## Optional (founder elects)
- Set a scheduled reminder for the **2026-07-06** quarterly compliance review (next due per `/compliance/quarterly-review-cadence.md`).

## Forecast
Most likely shape: manifest Article 50 date corrected (LRQ-6 resolved); privacy policy region/Vercel/ADM transparency corrected (LRQ-4 progressed, final legal wording still queued); typecheck green; one Elevated commit. After it, the two known accuracies are closed and the **only** remaining A16/A17 work is the lawyer-dependent queue at Stage-1 close. One Elevated session, ~1.5–2 hours.

End of prompt. Opens on `main`. Tier governance + code-elevated → Elevated risk; per-edit approval + `/archive/` backup before each of the two edits; founder commits/pushes via GitHub Desktop.
