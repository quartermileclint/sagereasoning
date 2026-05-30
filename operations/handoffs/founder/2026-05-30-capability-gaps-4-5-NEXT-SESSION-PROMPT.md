# Next-Session Prompt — Capability Gaps #4 + #5: Human-Tool Distress Coverage + Intimate-Data Encryption (Assessment)

Paste this whole file into a new session to proceed.

**Stream:** founder.
**Tier:** `governance` / `code-standard` — **Standard** risk (read-only assessment; no code change planned). Critical Change Protocol NOT engaged. **If the assessment finds a missing distress check on a live human-tool path, that fix is a separate future Critical session (PR6 + AC5 + the full CCP) — it is NOT built in this session.**
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Predecessor session close (just completed):** `/operations/handoffs/founder/2026-05-30-C2-live-run-close.md`.
**Predecessor decision-log entry:** `D-R20A-C2-LIVE-RUN-VERIFIED-2026-05-30`.
**Source of the gap framing:** `/drafts/2026-05-29-capability-inventory-first-pass.md` (gaps #4, #5; and adjacent #1).

---

## What just happened (carry-forward state — do NOT re-derive)

- **C2 is complete.** The agent-path R20a distress catch is **Verified-live** in a TEST environment against real Haiku across the three wired surfaces (`/api/calling`, `/api/practice/reflect`, `/api/reason` agent-API) — 34/34, Diagnostic-certain. Launch criterion #10's **agent leg** is closed; the four M-7 finding rows are closure-ready. The TEST env has been torn down.
- **Production state now (UNCHANGED):** all four R20a flags UNSET in Vercel; `/api/reason` byte-identical for all caller types; `/api/substrate/layer3` → 503; `/api/public-key` steady-state (`substrate-layer2-2026Q2`). The R17 `/api/user/*` changes from 2026-05-29 remain LIVE.
- **The four R20a production activations remain queued** — each a separate future Critical session with its own CCP + PR17 walkthrough. This session is the assessment that should precede them.

## Why this session (the human leg + the encryption boundary)

C2 proved the **agent leg** of launch criterion #10. This session assesses the **human leg** (gap #4) and the intimate-data-encryption boundary (gap #5) — both `significant`, both launch-blocking, neither yet confirmed. This is assessment, not build: the deliverable is a clear-eyed coverage map + an encryption confirmation, each with honest severities, so the next build sessions are grounded in evidence.

- **Gap #4 (LC#10) — Human-tool distress coverage unconfirmed.** Verify that *every* C6 human-facing tool path routes through a distress-checked endpoint. The C6 tools per the inventory: `prod-action-scorer`, `prod-doc-scorer`, `prod-journal`, `prod-scenarios`. The distress-checked endpoints are `/api/reason` (route-guard `enforceDistressCheck(detectDistressTwoStage(input))`, always-on) and the Reflect/Calling Option-A catches (agent-facing). The open question: do the score/scenario/journal *web* tool paths each hit a distress-checked endpoint, or are some unscreened?
- **Gap #5 (LC#7) — Intimate-data encryption end-to-end unconfirmed.** Verify R17b application-level encryption (AES-256-GCM via `MENTOR_ENCRYPTION_KEY`) holds end-to-end on the mentor store: `mentor_interactions, mentor_profiles, mentor_profile_snapshots, mentor_baseline_appendix, mentor_journal_refs, mentor_observations_structured, realtime_journal_entries`. Confirm each intimate field is encrypted at write and decrypted only server-side.

**Adjacent finding to keep in view (gap #1, LC#7 — do NOT scope-creep into fixing it here):** `/api/user/delete` performs genuine deletion across 8 tables but **omits those same 7 mentor-store tables** — a legal-erasure gap (GDPR Art 17 / Australian Privacy Act). It shares gap #5's surface, so note anything relevant while reading the mentor store, but the deletion fix is its own session.

## Pre-conditions (founder confirms at open; the AI verifies by code-read)

1. Production green and untouched since the C2 close (the four R20a flags still UNSET; nothing deployed). The founder confirms no Vercel/deploy action since.
2. The C2 commit (rewritten `run-c2.ts` + decision-log + close) has been pushed (or the founder states it is still local — either is fine; this session touches none of it).
3. The Cowork project-instructions panel remains paste-synced against `/adopted/project-instructions-snapshot.md` (PR1–PR17). No governance changes expected.

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — tier, risk class, signals, status vocabulary).
2. `/operations/handoffs/founder/2026-05-30-C2-live-run-close.md` (~5 min — the predecessor close).
3. `/drafts/2026-05-29-capability-inventory-first-pass.md` — in full (the gap framing; C6 row; D1/D4 sections; the ranked gap table; the "defensible next-session sequence" note).
4. `/operations/decision-log.md` — last 2 entries (`D-R20A-C2-LIVE-RUN-VERIFIED-2026-05-30` + S5).
5. `/manifest.md` targeted sections only: §R20a, §R17b, §R17c, §AC5 (the human-distress perimeter + the route registry), §R19.

Confirm at open: tier (`governance`/`code-standard`, Standard); hold-point status (P0 0h active); status vocabulary; signals/risk class. Narrate before substantive work: where we are in the arc (C2 done; this is the human-leg + encryption assessment); what's queued (the four R20a production activations; gap #1 deletion completion; lawyer review); what's awaiting the founder vs the AI.

## Part B — Procedure (assessment; read-only)

### Step 1 — Gap #4: human-tool distress-coverage map
- Identify the route each C6 human-facing tool calls (`prod-action-scorer`, `prod-doc-scorer`, `prod-journal`, `prod-scenarios`) — start from `/website/public/component-registry.json` (C6 rows) + the website tool pages + `/summary-tech-guide.md` §1 (File Map).
- For each route, confirm by code-read whether the human free-text input passes through a distress check **before any LLM/engine call** (grep for `detectDistressTwoStage` / `enforceDistressCheck` / `enforceLayer2R20aGate` in the route's execution path — calls, not just imports, per PR2).
- Produce a coverage table: tool → route → distress-checked? (yes / no / partial) → audience → severity if a gap (blocker / significant / minor / cosmetic).
- Diagnostic-certainty signal on each row (PR10): `Diagnostic-certain` where the code path is unambiguous.

### Step 2 — Gap #5: intimate-data encryption confirmation
- Read `/website/src/lib/server-encryption.ts`, `/website/src/lib/encryption-helpers.ts`, `/website/src/lib/sage-reflect/session-store.ts`, and the mentor-store write paths (`mentor_interactions, mentor_profiles, mentor_profile_snapshots, mentor_baseline_appendix, mentor_journal_refs, mentor_observations_structured, realtime_journal_entries`).
- For each table's intimate fields, confirm: encrypted at write (AES-256-GCM, `MENTOR_ENCRYPTION_KEY`); ciphertext stored (not plaintext); decrypted only server-side. Flag any field written in plaintext.
- Produce an encryption table: table → intimate field(s) → encrypted at write? → decrypt path server-only? → gap + severity.
- Note (do not fix) any gap-#1 overlap: whether the table is covered by `/api/user/delete`.

### Step 3 — Severity + sequencing roll-up
- Consolidate both maps into a short findings list with severities (blocker / significant / minor / cosmetic), each tagged to its launch criterion (#10 for gap #4; #7 for gap #5).
- For any `blocker`/`significant` fix identified, name it as a **future session** with its risk tier (a missing human-tool distress check = Critical/PR6; an encryption gap = Critical/R17b). Do not build fixes this session.

### Step 4 — Decision-log entry (lean form)
Pattern: `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". Entry name `D-CAPABILITY-GAPS-4-5-ASSESSED-YYYY-MM-DD`. Record the two coverage maps, the severities, and the named follow-up sessions. Status: Adopted. Implementation status: gaps #4 + #5 **assessed** (not yet remediated).

### Step 5 — Session close (lean form)
Pattern: `/adopted/standing-protocol-cache.md` §"Lean session close". Next Session Should: the highest-severity fix surfaced (likely gap #1 deletion completion or any human-tool distress gap), or the first R20a production activation. Production state at close MUST be UNCHANGED.

## What is NOT in this session
- **No code changes / no fixes.** This is assessment. Any remediation (a missing distress check; an encryption gap; the gap-#1 deletion completion) is a separate future session at its own risk tier.
- **No production activation** of any R20a flag.
- **No TEST-env standup** — this session is read-only code assessment; no live runs needed.

## Forecast
The session ends with two evidence-grounded coverage maps — human-tool distress coverage (gap #4, LC#10) and intimate-data encryption (gap #5, LC#7) — each with honest severities and named follow-up sessions, plus any gap-#1 overlap noted. Production remains UNCHANGED. The next build session is then chosen from evidence: the highest-severity fix, or the first R20a production activation.

End of prompt. Opens on `main`. Standard-tier assessment — read-only; if a fix is found, it is named for a future session, not built here.
