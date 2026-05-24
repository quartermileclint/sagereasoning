# Next-Session Prompt — Priority 2: Whole-System Test — Data Room + First Manual Loop

**Stream:** founder.
**Tier:** `governance` — **Standard** risk. Building a bounded, non-destructive workspace + observing one manual loop on **test data only**. **No production writes; no code, schema, env, or deploy-config change to production.** Any code experiment is **branch-only** and non-production. Critical Change Protocol NOT engaged this session; PR6 NOT engaged. (The Critical build of the option-(a) gate is a **separate** track — not this session.)
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`. Deliverable-of-the-day: `/drafts/2026-05-23-whole-system-data-room-brief.md` (the brief this session executes).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-23-P1-sage-assent-dependency-rule-close.md`.
**Predecessor decision-log entries:** `D-SAGE-ASSENT-SAGEREASONING-DEPENDENCY-RULE-ADOPTED-2026-05-23`; `D-FOUNDER-HUB-MENTOR-PROFILE-DECRYPT-GUARD-2026-05-23`; `D-PARKED2-DISCRIMINANT-RENAME-TRUST-LAYER-RETAIN-2026-05-23`.
**Risk classification:** **Standard** under 0d-ii (non-destructive workspace + read/observe on test data). Critical Change Protocol NOT engaged. PR6 NOT engaged. KG1 engages only if any DB-write code is touched (it should not be this session).

## Why this session matters

The four products each pass their own test suite, but the **system** has never been tested — the four seams between products, the shared-substrate consistency, the safety perimeter across the whole loop, and the audit trail a full journey leaves. Priority 1 adopted the dependency rule (R18f/R19e) and designed the enforcement gate (option (a)), so the headline whole-system assertion — the Combination-1 negative test — now has a precise definition. This session builds the bounded **data room** and runs **one manual founder-verified loop** to demonstrate value end-to-end and map what is actually there: evidence, not projection (0h). It is also the **safe first use of the Code tab** — a bounded, non-production workspace where a mistake cannot reach the live system.

## Locked context (do NOT re-litigate)
- The configuration rules are **Adopted** (R18f + R19e); the supported-configuration table is the brief §3 table.
- The option-(a) gate is **Designed, not built**. So the Combination-1 negative test this session **documents the open gap** (the credential write would *not* be rejected today) — it does **not** pass. That is expected and useful (0h: gaps are expected).
- **"No current users" holds** — founder + test logins only. No production writes.
- The top-level guides are a **stale source** (brief §7). Ground the test in current-authoritative sources only (May decision-log; the four adopted design docs; the code + test suites; the SQL migrations).

## Pre-conditions (confirm at open)
1. The P1 commit pushed; Vercel green (confirmed 2026-05-23); working tree clean; no `.git/index.lock` (if present, clear host-side: `rm -f .git/index.lock`).
2. Production baseline unchanged: substrate **A7 Verified**; Sage Assent **A10 Live+Verified**; Sage Calling **Live (gated)**; Sage Reflect **Live/Verified (gated `SAGE_REFLECT_ENABLED=true`)**; `SUBSTRATE_WRITE_PATH_ENABLED='true'`; Layer-3 + R20a substrate gates UNSET.
3. No production env/schema/deploy change expected. Any code experiment is on a dedicated branch/worktree only.

---

## Part A — Open under the protocol
Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — tier, model selection, risk class, signals, status vocab).
2. `/adopted/build-sessions-protocol-cache.md` (build-arc context).
3. `/drafts/2026-05-23-whole-system-data-room-brief.md` — **in full** (the deliverable-of-the-day).
4. `/operations/handoffs/founder/2026-05-23-P1-sage-assent-dependency-rule-close.md` + `/adopted/adr/2026-05-23-sage-assent-sagereasoning-dependency-enforcement.md` (so the Combination-1 test definition is exact).
5. `/operations/decision-log.md` — last 3 entries.
6. Targeted: `/manifest.md` R18f + R19e (just adopted), AC5 (R20a perimeter — the eight routes), AC8 (substrate).

Confirm at open: tier (`governance`/Standard); hold-point (P0 0h active); model selection (N/A for room-building; if the manual loop drives `/api/reason`, model is per AC1 by depth — no new model-selection *decision* is made); status vocabulary; signals + risk class. Run the PR15 consult (`.claude/skills/anthropic/` — note `webapp-testing` + the `sage-*` skills — plus `/operations/agentic-commerce-findings-downstream-order.md`) and note the PR16 lens (**the manual loop IS the dogfood run**).

---

## Part B — Procedure (no production writes)

### Step 1 — Decide the data-room location (founder decision)
In-repo **dedicated branch** (recommended — same source-of-truth discipline, kept off `main`) vs a separate workspace. Confirm before building. (Brief §6.)

### Step 2 — Build the data-room skeleton (brief §6)
Create `00_baseline/`, `02_inventory/`, `03_seam_map/`, `04_test_brief/`, `05_outputs/`, `99_review/`. Non-destructive; **never experiment on `00_baseline/`** (it is the known-good comparison + rollback anchor).

### Step 3 — Populate the inventory + authority ranking (brief §7)
Per product (Calling, Reasoning, Assent, Reflect): design doc, test suite, schema, env-flags, status (0a vocabulary), and authority ranking (current-authoritative vs status-superseded). Seed the **conflict log** and **missing-context list** in `99_review/`.

### Step 4 — Map the four seams (brief §5.1 + §3)
Document, as the things under test: Calling's five-spec → substrate Layer 1; the signed `Layer2Assessment` → an Assent `EvaluatedAction`; Reflect's outcome → Assent's profile (`sage-assent-feed.ts`); Reflect's exit routing → the correct next product. (Seams are the known risk class — the E#1 fix was a dropped-seam case.)

### Step 5 — Define the test flag-config (brief §5.6)
Name the flags that turn the loop on (`SAGE_CALLING_ENABLED`, `SAGE_REFLECT_ENABLED`, `SUBSTRATE_WRITE_PATH_ENABLED`; Layer-3 + R20a substrate gates) — distinct from production by design. Naming that difference is itself a safety control.

### Step 6 — Write the test brief (`04_test_brief/`)
The configuration matrix (brief §4), success criteria per seam, and the **0c verification method per row** (so the founder verifies without reading code). Mark the **Combination-1 row** explicitly: *"documents the gap — gate Designed, not built (R18f / P1 ADR option (a)); expected result today = NOT rejected."*

### Step 7 — Run ONE manual founder-verified loop (PR1 single-loop-proof; 0g manual-first)
Drive the system end-to-end on **test data**; capture in `05_outputs/` what it does for **(a) a human practitioner** and **(b) an agent developer** — 0h criterion 4 (value demonstrated end-to-end, one use case per audience). Use `webapp-testing` / Playwright for the human front-end where useful (brief §9). **No production writes.**

### Step 8 — First Code-tab safety (brief §8 — only if using the Code tab)
Work on a branch/worktree; **manual approval + plan mode** (not auto); sandbox scoped to the room; checkpoints **plus** git commits; mind `.git/index.lock`; keep governance edits (decision log, manifest, adopted docs) in Cowork. `CLAUDE.md` auto-loads in Code and carries the risk classification + Critical Change Protocol with you.

### Step 9 — Verify
Per the 0c table written in Step 6 — founder-performable checks (URLs, expected results, test commands). Mark each seam pass/fail/gap honestly.

### Step 10 — Decision-log entry + session close (lean form)
Pattern: `/adopted/standing-protocol-cache.md` §"Lean decision-log entry" + §"Lean session close". Status changes: the data room → **Scaffolded/Wired** (as built); the whole-system test → first **manual loop run**; the Combination-1 gap → **documented with severity** (0h criterion 3). Next-session pointer: automate the harness (§9) and/or the Critical build of the option-(a) gate (founder's call).

**Scope note:** this is a large session — the founder manages scope. A clean split is Steps 1–6 (build the room) in one session, Steps 7–9 (run + verify the manual loop) in a follow-on. Either is fine; declare the cut at open.

---

## Part C — Anticipated session shape
| Phase | Estimate |
|---|---|
| Cache + brief (full) + P1 close/ADR + decision-log reads | 25–35 min |
| Step 1 location decision | 10 min |
| Steps 2–4 skeleton + inventory + seam map | 45–60 min |
| Steps 5–6 flag-config + test brief | 30–45 min |
| Step 7 manual loop (if in scope this session) | 45–75 min |
| Step 9 verify | 20 min |
| Decision-log + close | 20–30 min |
| **Total** | **~3–4.5 hours (split recommended)** |

## Rollback path
Governance / workspace only — the data room is non-destructive and (if branch-based) off `main`; nothing to roll back at runtime. `git revert` reverses any committed room files. No production env/schema/deploy touched.

## Forecast
Success = the data room exists (inventory + seam map + test brief with 0c verification methods), one manual loop demonstrates value end-to-end on at least one use case per audience (0h criterion 4), and the Combination-1 gap is documented with severity (0h criterion 3). After this: automate the harness (brief §9) and/or schedule the **Critical build** of the option-(a) gate (which makes R18f live and turns the Combination-1 negative test from *documented gap* into *passing assertion*).

End of prompt. Opens read-only on the post-P1 baseline (production unchanged; dependency rule Adopted; gate Designed-not-built). No production writes this session.
