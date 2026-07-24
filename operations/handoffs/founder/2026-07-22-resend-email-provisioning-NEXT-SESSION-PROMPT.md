# Next-Session Prompt — Resend email provisioning (closing #15's decided-not-done gap)

**Stream:** founder (Agent-Organization + Evidence Program — a direct continuation of the Section D closure session, not a new program thread).
**Tier:** `code-elevated`. No auth/session/encryption/R20a-perimeter/deploy-flag-activation surface is touched (so the full Critical Change Protocol is not automatically engaged), but this session adds a **new external dependency** (a Resend account) and, if domain verification is pursued, **live DNS record changes on the production `sagereasoning.com` domain** — per the standing cache's 0d-ii table, "new external dependencies" defaults to Elevated risk, and DNS changes to a live domain deserve the same care as any other production-adjacent change even though they sit outside this repo. Treat any DNS-record step with real caution: read the exact record Resend asks for, confirm it does not collide with anything already on the zone, and never remove or replace a record you cannot first identify the purpose of.
**Predecessor session close:** `operations/handoffs/founder/2026-07-22-section-D-support-channel-and-org-decisions-CLOSE.md`.
**Predecessor decision-log entry:** `D-SECTION-D-SUPPORT-CHANNEL-AND-ORG-DECISIONS-CLOSED-2026-07-22`.
**Risk classification:** Elevated under 0d-ii (new external dependency; possible DNS change). Critical Change Protocol NOT automatically engaged, but AskUserQuestion approval should still gate the DNS step specifically before any record is added, per this project's general caution discipline around anything touching the live production domain.

## Why this session matters

The predecessor session closed Section D of the go-live readiness checklist to a single genuine remaining item (#11, support-channel monitoring — left honestly open, not this session's job to resolve). Item **#15 (email platform) was *decided* but not *done*** — the founder chose to actually provision Resend (matching the original ring-architecture design in `sage-mentor/send-notification.ts`, which already exists and expects a `RESEND_API_KEY`), rather than keep the no-cost `mailto:` status quo. Nothing in that decision could be executed by the AI: creating a Resend account and verifying a sending domain via DNS are both actions squarely outside what the AI may do on the founder's behalf (account creation is categorically prohibited; DNS access requires the founder's own registrar/DNS-provider login). This session exists to **walk the founder through that live, external setup**, then close the loop in the repo: confirm the API key lands in the right place (a local env file, *not* Vercel — `send-notification.ts` is a locally-run CLI script with no live production caller, a fact the manual previously stated wrong), test the send pipeline end-to-end, and update the manual + checklist from "decided, pending" to "live."

**What this session is explicitly NOT:** it is not the moment to build the automated Support run-loop (that path was declined at the predecessor session — Path B was chosen over Path A) and it is not the moment to resolve #11 (support-channel monitoring stays open until the founder's actual practice changes, per their own explicit choice — do not re-raise it here unless the founder brings it up first).

## Pre-conditions

1. The founder has not yet created a Resend account (if they have, since the predecessor session closed, say so at open and this session adapts — don't assume the account doesn't exist without asking).
2. The founder has access to whatever registrar or DNS provider hosts `sagereasoning.com`'s DNS zone (needed for domain verification — if they don't have this handy, the session should stop at the account-creation step and defer verification to a session where they do).

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier, model selection N/A, risk class, signals).
2. `operations/handoffs/founder/2026-07-22-section-D-support-channel-and-org-decisions-CLOSE.md` (~5 min — the predecessor close this session continues from).
3. `operations/SageReasoning_Support_Agent_Manual.docx` §5 (via `textutil -convert txt -stdout`, since the Read tool cannot open `.docx`) — the corrected §5.2 note now states plainly what's missing and why the key belongs locally, not in Vercel. Read it in full before touching anything so the session's own claims match what's already on record.
4. `sage-mentor/send-notification.ts` in full — the script this session is provisioning credentials *for*. Confirm its actual expected invocation (`npx ts-node sage-mentor/send-notification.ts notifications/filename.md` per the manual) and where it reads `RESEND_API_KEY` from (env var lookup — confirm whether it uses `process.env` directly or expects a config object, since that determines exactly where the local key needs to live).
5. `operations/agent-org-2026-07/go-live-readiness-checklist.md` §Section D, item #15 — the exact current status text this session will update.

Confirm at open: tier (Elevated, restated above); hold-point status (P0 0h, unchanged — this is R&D-phase-permissible work, no production-affecting change in the CLAUDE.md sense); model selection N/A (no LLM calls in this session's own work); status vocabulary; signals + risk classification.

## Part B — Procedure

### Step 1 — Confirm current state, don't assume
Ask the founder directly: has a Resend account already been created since the predecessor session? If yes, skip to Step 3. If no, proceed to Step 2.

### Step 2 — Walk the founder through Resend account creation + domain verification (founder-performed, AI-guided live, PR17 discipline — no one-line hand-off)
- Give exact steps: sign up at resend.com (their own action, their own credentials — the AI does not touch this).
- Once signed in, they add `sagereasoning.com` (or a subdomain, e.g. `mail.sagereasoning.com` — ask which the founder prefers; a subdomain is often safer since it can't collide with any existing MX/mail records on the root domain, worth naming as a recommendation with the tradeoff stated plainly, not decided for them).
- Resend will present specific DNS records (typically TXT for domain ownership, plus CNAME/TXT for DKIM, and MX only if sending FROM that exact subdomain). **Before the founder adds any record to the live DNS zone, read it back to them and ask for explicit confirmation** — this is the DNS-change gate named in this prompt's header.
- Domain verification can take minutes to hours (DNS propagation) — the session may need to pause here. If it does, stop cleanly rather than waiting idle; the founder can return to a continuation of this same session once verification completes, or a short follow-up.
- Once verified, the founder generates an API key from the Resend dashboard (their own action — the AI never sees or handles the raw key value, same discipline as every credential-handling step in this project's history: placeholders only, never echoed).

### Step 3 — Set the key locally, correctly scoped
Per what Step "Read in full" (Part A step 4) actually found about how `send-notification.ts` reads its config: set `RESEND_API_KEY` in the appropriate **local, gitignored** env file (confirm which one this repo's convention uses — check `.gitignore` for existing `.env*` patterns before creating a new one). Do **not** set it in Vercel — the manual's own corrected note (2026-07-22) already states why: this script has no live production caller, it runs from the founder's own terminal.

### Step 4 — Test the pipeline end-to-end
Create one test notification file per the manual's own template (`notifications/outbox/test-....md`, `status: approved`, addressed to an address the founder controls) and run the script exactly as documented: `npx ts-node sage-mentor/send-notification.ts notifications/outbox/test-....md`. Confirm the founder actually receives the test email before declaring this working — do not mark it live on the strength of a clean exit code alone.

### Step 5 — Close the loop in the repo
- Update `operations/SageReasoning_Support_Agent_Manual.docx` §5.2's 2026-07-22 correction note from "this has not yet been configured anywhere" to an honest statement that it is now live, with the date of this session appended (don't delete the history of the correction — extend it, the same way this project's other status notes accumulate dated observations rather than erasing prior ones).
- Update `operations/agent-org-2026-07/go-live-readiness-checklist.md` item #15 from "✅ DECIDED, provisioning pending" to "✅ VERIFIED-LIVE," with the evidence (a real test send confirmed).
- Decision-log entry (lean form per the standing cache) + a short session close.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Opens reads | 15–20 min |
| Step 1 confirm state | 2 min |
| Step 2 account + domain verification (founder-performed, AI-guided; DNS propagation wait is unpredictable — could be minutes, could require a pause) | 20–60+ min, possibly spanning a pause |
| Step 3 local key setup | 10 min |
| Step 4 end-to-end test | 10–15 min |
| Step 5 close the loop | 20–30 min |
| **Total (excluding any DNS-propagation pause)** | **~1.5–2.5 hours** |

## Rollback path
Nothing in this session touches production code, schema, or deploy configuration — the API key lives in a local, gitignored file, and the only repo diffs are the manual correction and the checklist status update, both trivially `git revert`-able. The one non-repo, non-reversible-in-the-usual-sense action is the DNS record addition on the live domain — reversible by deleting the added record at the registrar, but not via any repo mechanism, which is exactly why Step 2 gates it on explicit founder confirmation before it happens, not after.

## Forecast
Success is: a real Resend account, a verified sending domain, a working local API key, one confirmed test email received, and both the manual and the checklist updated to say so truthfully — closing the one item Section D's predecessor session left as "decided, not done." If DNS propagation or account setup can't complete in one sitting, a clean, honestly-scoped partial close (recording exactly how far Step 2 got) is a legitimate outcome — don't force Steps 3–5 ahead of a genuinely verified domain.

End of prompt.
