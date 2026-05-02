# Session Close — 2 May 2026 — Streams 1 + 2 (Registry Update v1.5.0 + Encryption-Wiring ADR Adopted)

**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Tier:** founder/governance scope.
**Date:** 2026-05-02.
**Session scope:** Two bounded streams from the predecessor session prompt's catalogue — Stream 1 (Standard, registry update v1.5.0) + Stream 2 (Standard at the ADR-drafting stage; Critical at the eventual implementation; encryption-wiring ADR drafted and Adopted). Recommended sequencing 1 → 2 executed in full. Design / governance / documentation only; no code; no live-system effect; no Critical surface engaged at any edit.

---

## Decisions Made

- **D-REGISTRY-UPDATE-v1.5.0-2026-05-02** appended (Stream 1). The decision-log entry records:
  - Registry bumped from v1.4.0 to v1.5.0 (minor bump per skill rule for additions).
  - 1 component updated (D2 — `doc-rag-mentor-alt3-canonical-framework`: blocker cleared per Q2 rule, notes extended to record the v1.1.0 amendment).
  - 1 component added (`doc-rag-mentor-alt3-architectural-conventions` — the PR8-promoted Validation Addendum standalone catalogue from D-VALIDATION-ADDENDUM-PROMOTED-2026-05-02).
  - Pass 1 anchor: 2026-05-02 (D-REGISTRY-UPDATE-v1.4.0-2026-05-02 — same-day baseline). 1 handoff scanned (yesterday's streams-bcd-close); 3 decision-log entries scanned (D-API-REASON-PRE-ALT3-SNAPSHOT, D-VALIDATION-ADDENDUM-PROMOTED, D-D2-AMENDMENT).
  - Pass 2 N/A (both touched entries are documents in `/adopted/`, not TypeScript modules in `/website/src/`).
  - Pass 3 transitive impact: no entries needing update beyond D2 itself; D8 + D24 entries' blockers reference distinct work that remains pending.
  - Pass 4 spot-check: post-update consistency confirmed on touched entries; v1.4.0 baseline trusted for the 188 unchanged components (same-day comprehensive Pass 4 baseline).
  - statusSummary recomputed: `wired` 147 → 148; other counts unchanged.
  - Pre-edit backup at `/archive/component-registry/component-registry.json.backup-2026-05-02-0809`.
  - Founder approved 4 decisions via AskUserQuestion: apply batch (yes); v1.5.0 minor bump (per skill rule); D8 optional cross-reference deferred (to D8 v1.1.0 revision pass session); Option A connects strategy (only the new entry's outgoing connects).

- **D-ENCRYPTION-WIRING-ADR-ADOPTED-2026-05-02** appended (Stream 2). The decision-log entry records:
  - ADR-ENCRYPTION-WIRING-01 drafted at `/drafts/`, Status line updated to Adopted, then `mv`-moved to `/adopted/` (plain `mv` because the file was newly created and not yet under version control).
  - Five named architectural decisions adopted:
    - **D1 (Option 1A)** — Reuse existing `server-encryption.ts` module.
    - **D2 (Option 2A)** — Reuse existing `MENTOR_ENCRYPTION_KEY` env var.
    - **D3 (Option 3A)** — Per-column ciphertext + companion `_meta` JSONB shape matching `mentor-profile-store.ts` precedent.
    - **D4 (Option 4A)** — Founder three-copy backup ceremony (password manager + paper + Vercel env var) with monthly verification cadence.
    - **D5** — Env-flag-based rollback path (Path A flip `MENTOR_RAG_V1=false`; Path B `DROP TABLE`; Path C key restoration from backup).
  - Critical Change Protocol responses pre-drafted for the eventual implementation session per R17f obligation (what's changing; what could break; what happens to existing sessions; rollback plan; verification step; explicit approval).
  - 12 action items specified for the implementation session.
  - 6 open questions logged with revisit conditions.
  - AC7 compatibility posture explicitly named (NOT engaged — module-level wiring only; no auth/cookie/session/redirect surface touched).
  - Founder approved Path A (adopt + move this session); founder additionally approved flagging the "is `MENTOR_ENCRYPTION_KEY` already set in production with no founder backup?" question as a high-priority next-session item per ADR §"Open questions" Q1.

---

## Status Changes

| Item | Old status | New status |
|---|---|---|
| `/website/public/component-registry.json` | v1.4.0 (190 components; statusSummary wired:147) | **v1.5.0 (191 components; statusSummary wired:148)** |
| `doc-rag-mentor-alt3-canonical-framework` (D2 entry) | blocker = "Next: D2 amendment for the five D24 coverage-gap additions..."; notes describe Adopted v1.0.0 state | **blocker = ""; notes describe Adopted v1.0.0 + Amended 2026-05-02 to v1.1.0 under D-D2-AMENDMENT-2026-05-02** |
| `doc-rag-mentor-alt3-architectural-conventions` (new entry) | (did not exist) | **Added — status `wired`, subtype `["design", "catalogue"]`, priority `P2`, rules `["R6b","R6d","R7","R19","ES1"]`, connects to 9 alt-3 deliverables** |
| `/operations/registry-updates/proposed-2026-05-02-c.md` | (did not exist) | **Created — registry update proposal with Pass 1–4 audit trail** |
| `/archive/component-registry/component-registry.json.backup-2026-05-02-0809` | (did not exist) | **Created — pre-edit backup of v1.4.0** |
| `/adopted/ADR-ENCRYPTION-WIRING-01.md` | (did not exist) | **Created and Adopted — ADR for Phase-2 pass-1 Precondition 4 (P2 task 2c encryption wiring)** |
| `/operations/decision-log.md` | 3219 lines (post-D-D2-AMENDMENT, post-streams-bcd-close) | **3345 lines (2 entries appended: D-REGISTRY-UPDATE-v1.5.0 + D-ENCRYPTION-WIRING-ADR-ADOPTED; +126 lines)** |

Two new decision-log entries; one new registry version with 1 added component + 1 updated component; one new ADR Adopted; two pre-existing Stream files committed by the founder mid-session per the per-stream commit pattern.

No code, no schema migrations, no live-system effect (other than the registry-driven dashboards re-rendering on next page load), no auth/encryption/session/redirect surface touched. AC7 not engaged. PR6 not engaged at any edit (PR6 preserved at the eventual encryption-wiring implementation session per the ADR's Critical Change Protocol responses).

---

## Phase-2 Pass-1 Readiness Inventory After This Session

| Precondition | Status |
|---|---|
| All 26 Phase-1 + D-A16 deliverables Adopted | ✅ Complete |
| D-A16 catalogue minimum (T3-001 + T3-002 stems) | ✅ Complete |
| `/api/mentor/private/reflect` snapshot | ✅ Complete |
| `/api/reason` snapshot | ✅ Complete |
| Component registry up-to-date | ✅ **NOW Complete (this session — Stream 1 — at v1.5.0)** |
| D2 internally consistent with D24 | ✅ Complete |
| Validation Addendum promoted | ✅ Complete |
| **P2 task 2c encryption wiring ADR drafted** | ✅ **NOW Complete (this session — Stream 2 — Adopted)** |
| **P2 task 2c encryption wiring IMPLEMENTATION** | ⚠️ **Pending — Critical risk; the implementation session per ADR Action Items** |
| Founder approval of pass-1 Critical Change Protocol responses | ⚠️ Pending — happens at pass-1 commencement |

**7 of 7 design preconditions complete.** The encryption wiring's IMPLEMENTATION session is the only remaining work before Phase-2 pass 1 commencement. The implementation session is Critical risk and follows the Critical Change Protocol responses pre-drafted in ADR-ENCRYPTION-WIRING-01.

---

## Completed Work

1. **Read all canonical sources per session-opening protocol Part A.** Manifest (R0, R6a–R6e, R7, R8a–R8d, R17a–R17f, R20a, AC1, AC4, AC5, AC6, AC7, KG1, KG7); session-opening protocol (Parts A–C, 21 elements); predecessor session close (`2026-05-02-streams-bcd-close.md`); decision-log last 5 entries via grep (D-API-REASON-PRE-ALT3-SNAPSHOT, D-VALIDATION-ADDENDUM-PROMOTED, D-D2-AMENDMENT, D-REGISTRY-UPDATE-v1.4.0, D-A16-CATALOGUE-ASSEMBLED-AND-ADOPTED); knowledge-gaps register (KG1–KG7).

2. **Stream-specific reads completed for Stream 1.** sage-registry-update SKILL.md (588 lines, Q1–Q5 + Pass-4-enhanced — operative skill); component-registry.json (v1.4.0; 190 components — extracted D2 entry, d-a16-catalogue precedent, D8 entry, all alt-3 doc entry IDs, statusSummary); proposed-2026-05-02-b.md (predecessor proposal — referenced for context); 2026-05-02-rag-phase1-completion-review-close.md (predecessor v1.4.0 baseline reasoning).

3. **Stream-specific reads completed for Stream 2.** Manifest R17a–R17f, AC7, KG1, KG7 (already read in Part A); D21 migration plan in full (337 lines — Phase-2 Precondition 4 + Pass 1 Build Steps + Pass 1 Critical Change Protocol pattern); D14b deferral-resolution endpoint sections (encryption + R17 conformance + schema additions); engineering:architecture SKILL.md (ADR template); `/website/src/lib/encryption.ts` (client-side — informs R17d posture); `/website/src/lib/server-encryption.ts` (server-side — the module to reuse); `mentor-profile-store.ts` encryption usage (the canonical wiring precedent); local-storage strategy docx (R17d philosophy — March 2026 founder document); existing encryption call sites surveyed (18+ call sites; the pattern is established).

4. **Verified pre-conditions and state at session open.** Founder confirmed Vercel green via AskUserQuestion. Git evidence: latest commits include `81bcfd2 close` (predecessor session-close) and `341691f post bcd session prompt` (this session's input); working tree clean except this session's new files. Pre-condition 1 (push) ✅; Pre-condition 2 (Vercel green) ✅; Pre-condition 3 (founder readiness) ✅.

5. **Surfaced Part B scope selection via AskUserQuestion.** Founder selected Both Streams (1 → 2 ordering) — recommended pause point between streams with founder option to signal "done for now" after Stream 1.

6. **Stream 1 — Registry update v1.5.0 executed.**
   - Pass 1 lookback anchored to D-REGISTRY-UPDATE-v1.4.0-2026-05-02 per skill rule. Source scan: 1 handoff + 3 decision-log entries.
   - Pass 2 N/A (both touched entries are documents).
   - Pass 3 transitive impact: 18 entries connect to D2 (no updates needed — D2's identity unchanged); 3 entries' blockers match Pass 3 grep (only D2 itself needs update; D8 + D24 entries reference distinct work).
   - Pass 4 spot-check on touched entries; v1.4.0 baseline trusted for unchanged 188.
   - Proposal drafted at `/operations/registry-updates/proposed-2026-05-02-c.md` with full Pass 1–4 audit trail and three founder-decision questions surfaced (versioning v1.5.0/v1.4.1; D8 optional cross-reference; connects strategy A/B).
   - Surfaced 4-question batch via AskUserQuestion. Founder approved batch + v1.5.0 + Defer D8 + Option A.
   - Pre-edit backup at `/archive/component-registry/component-registry.json.backup-2026-05-02-0809` (MD5 verified identical to source pre-edit).
   - Apply via Python script (8.2 / 8.3 / 8.4 / 8.5 / 8.6 / 8.7 / 8.8 / 8.9 in atomic pass): D2 blocker cleared + notes extended; new entry appended; statusSummary recomputed; lastUpdated set to 2026-05-02; version bumped to 1.5.0; totalComponents set to 191; JSON re-parsed cleanly post-write.
   - Post-write verification: JSON parse ✅; counts agree (191 = 191 = 191) ✅; D2 blocker empty ✅; D2 notes contains v1.1.0 ✅; new entry present with correct fields ✅; git diff shows expected shape (header + D2 notes + D2 blocker + new entry).
   - Decision-log entry `D-REGISTRY-UPDATE-v1.5.0-2026-05-02` appended (+59 lines).
   - Founder verbatim git command provided.

7. **Surfaced commit-or-batch + continue-or-pause via AskUserQuestion.** Founder selected: commit Stream 1 now (per-stream pattern, matching predecessor) + proceed to Stream 2.

8. **Stream 2 — Encryption-wiring ADR drafted, Adopted, moved to `/adopted/`.**
   - Encryption modules surveyed (`encryption.ts` client-side; `server-encryption.ts` server-side; both AES-256-GCM; 18+ call sites; the canonical pipeline reference is `mentor-profile-store.ts`).
   - D14b's encryption requirements extracted (4 encrypted fields across `open_deferrals` + `deferral_resolutions` tables).
   - Local-storage strategy docx read (R17d philosophy; tables-must-be-server-side per D14b's cross-instance state requirement).
   - ADR drafted at `/drafts/ADR-ENCRYPTION-WIRING-01.md` with 11 top-level sections: Plain-language summary; Context; Decisions (5 named with options + trade-offs); Trade-off Analysis; Consequences; Action Items (12); Critical Change Protocol responses (pre-drafted per R17f); Open questions (6); AC7 compatibility posture; Honest disclosure; Approval gate.
   - Surfaced 2-question batch via AskUserQuestion (approval pathway A/B/C; flag MENTOR_ENCRYPTION_KEY backup-status check). Founder approved Path A + Yes-flag-it.
   - Status line updated to "Adopted (founder approval per Path A on 2026-05-02; D-ENCRYPTION-WIRING-ADR-ADOPTED-2026-05-02). Moved from /drafts/ to /adopted/ 2026-05-02."
   - Plain `mv` (not `git mv`) because the file was newly created and not yet under version control. The founder's git activity in parallel committed the file at the new location (`2f610e2 encrytion wiring`) before the decision-log append; rename detection runs at commit time if applicable.
   - Decision-log entry `D-ENCRYPTION-WIRING-ADR-ADOPTED-2026-05-02` appended (+67 lines).

9. **Founder per-stream commit activity in parallel.** Per the founder's selection at the Stream 1 commit-or-batch question, the founder committed each stream's output as it landed:
   - `7a8c5a1 registry` — Stream 1 (registry v1.5.0 + proposal + backup + decision-log up to D-REGISTRY-UPDATE-v1.5.0).
   - `2f610e2 encrytion wiring` — Stream 2 (the ADR file in its `/adopted/` location).
   - The decision-log entry for D-ENCRYPTION-WIRING-ADR-ADOPTED is in the working tree (modified, uncommitted) at session close — the founder commits this with the session close.

10. **Session close (this document) produced.**

---

## Where We Are in P0

- **0a (status vocabulary):** Used consistently. Implementation status (`wired` for both touched and new registry entries; `Adopted` for the ADR file) and decision status (`Adopted` for both decision-log entries) kept separate per the 0a discipline.
- **0b (session continuity protocol):** Followed. This close is the artefact in required-minimum format with extensions.
- **0c (verification framework):** Founder-performable verification specifications listed per stream in §"Founder Verification" below.
- **0d-ii (change risk classification):** Stream 1 classified Standard. Stream 2 classified Standard at the ADR drafting stage; Critical at the eventual implementation session (preserved in the ADR's Critical Change Protocol responses). No Critical changes this session.
- **0e (file organisation):** Registry at canonical path; proposal under `/operations/registry-updates/`; pre-edit backup under `/archive/component-registry/`; ADR at `/adopted/` (alt-3 ADR precedent at `/adopted/ADR-RAG-MENTOR-ALT3-01-...md`). Conventions preserved.
- **0f (decision log):** Two new entries appended (one per stream). Append-only discipline preserved.
- **0g (workflow skills earn their place):** No new workflow-skill candidates surfaced this session.
- **0h (hold point):** unchanged. R&D-phase work; design / governance / documentation only.
- **PR1 (single-endpoint proof):** Phase-2 pass 1 lands at D14b deferral-resolution per AC-19; this session does not commence Phase-2 build. The encryption-wiring ADR's design extends the proven `mentor-profile-store.ts` pattern (per ADR §Decision 1); the existing wiring is the proof endpoint for the encryption pattern.
- **PR4 (model selection):** N/A this session — no LLM model selection. ADR Stream 2 documents the existing `MENTOR_ENCRYPTION_KEY` env var without changing model selection at any layer.
- **PR5 (knowledge-gap carry-forward):** No founder concept re-explanation observed this session. KG1 / KG2 / KG3 / KG4 N/A for Stream 1; KG1 (rule 2 — await DB writes) + KG7 (JSONB storage format) explicitly named in the ADR §Forces at play (load-bearing for the implementation session); KG2 / KG3 / KG4 N/A for Stream 2 (no model selection; no hub-label surface; no Layer 2 applicability decisions).
- **PR6 (safety-critical changes Critical):** Not engaged at any edit this session. Stream 2's ADR pre-drafts the Critical Change Protocol responses for the eventual implementation session — that session is when PR6 becomes operative for the encryption surface.
- **PR7 (decisions not made are documented):** Six open questions logged in the ADR §"Open questions" with revisit conditions. D8 optional cross-reference deferred per founder direction. Option B comprehensive connects update deferred per founder direction.
- **PR8 (third-recurrence promotion):** N/A this session — no new tacit-knowledge candidates surfaced; the catalogue (Stream D output of yesterday's session) was the operative PR8 promotion event.

---

## Next Session Should

The next session is the **encryption-wiring implementation session** — Critical risk per R17f and PR6. Per founder's Stream 2 direction, the implementation session's first work is the **MENTOR_ENCRYPTION_KEY backup status check** before any other steps.

### Candidate F (highest priority) — Encryption-wiring IMPLEMENTATION session (Critical risk)

**Per ADR-ENCRYPTION-WIRING-01 Action Items + the founder's flag from this session.**

**Implementation session's Step 1 (NEW — per founder direction this session):** Verify `MENTOR_ENCRYPTION_KEY` backup status against the existing production value.
- Read the existing `MENTOR_ENCRYPTION_KEY` value from Vercel project env vars.
- Founder confirms whether they have backup copies of the existing key (password manager + paper).
- If yes (backups exist and verified): proceed to ADR Action Item 4 (skip Action Items 1–3; the ceremony already done).
- If no (key is in production but no backup): execute ADR Action Item 2 (founder backup ceremony) AGAINST THE EXISTING KEY before any other steps. **Do not generate a new key when the existing one is in active use** — that would invalidate the existing mentor-profile data.
- If unsure (founder hasn't checked): pause; founder verifies between sessions; implementation session resumes.

**Then proceed per ADR Action Items 4–12:**
4. Schema migrations against staging (open_deferrals + deferral_resolutions per §Decision 3).
5. Encrypt-then-decrypt dry-run test against canonical seed data.
6. Schema migrations against production.
7. Wire `lib/encryption-helpers.ts` (or extend `mentor-profile-store.ts` pattern).
8. AC4 invocation testing for the new helpers + new route source.
9. Critical Change Protocol for the deploy (verbatim per ADR §"Critical Change Protocol responses").
10. Post-deploy verification (founder runs decrypt-test against first real write; KG7 typeof check).
11. Decision-log entry `D-ENCRYPTION-WIRING-IMPLEMENTED-YYYY-MM-DD`.
12. Phase-2 pass-1 readiness inventory updates to "ready for pass-1 commencement" (subject only to founder approval of pass-1 Critical Change Protocol responses at the pass-1 session itself).

**Risk classification:** Critical under R17f + PR6. Critical Change Protocol applies at deployment. The ADR's Critical Change Protocol responses are pre-drafted; the implementation session executes them verbatim.

### Candidate G — Phase-2 pass 1 commencement (D21 § Phase-2 Pass 1 build steps)

**Why this priority deferred:** Pass 1 commencement is contingent on Candidate F (encryption-wiring implementation). All other Phase-2 pass-1 preconditions are now complete (registry up-to-date — Stream 1 of this session; Validation Addendum promoted; `/api/reason` snapshot; D2 v1.1.0 internally consistent with D24; D-A16 catalogue minimum; `/api/mentor/private/reflect` snapshot).

**Risk classification:** Critical under PR6 + AC5 ninth-route discipline + R17 perimeter expansion. Critical Change Protocol applies (separate from Candidate F's protocol; both Critical sessions are sequential, not bundled).

### Other standing candidates from prior session closes

- **D8 v1.1.0 revision pass.** Architecture-exercise transcript folds Adjustments 1, 2, 3 into D8's per-rule sections. The architectural-conventions catalogue persists as the standalone reference; D8 v1.1.0 makes the per-rule integration. Standard risk; pending the architecture-exercise transcript surfacing.
- **D24 audit current-state findings triage.** Seven findings logged in D24 §Audit findings. Finding 6 (`user_id` vs `auth.user.id` at `/api/reflect`) is Critical under R17 + PR6; founder triage decision separate from Phase 1 design.

**Recommendation for next session:** **Candidate F — encryption-wiring IMPLEMENTATION** (the only remaining blocker for Phase-2 pass 1; Critical risk; the ADR pre-drafts the Critical Change Protocol; founder direction this session promoted the MENTOR_ENCRYPTION_KEY backup-status check to first-action priority). Founder calls.

---

## Blocked On

**Per-stream commits already pushed by the founder during the session.** Git history at session close:

```
2f610e2 encrytion wiring        ← Stream 2 (ADR file at /adopted/)
7a8c5a1 registry                ← Stream 1 (v1.5.0 + proposal + backup + decision-log up to D-REGISTRY-UPDATE-v1.5.0)
341691f post bcd session prompt ← This session's input prompt (committed pre-session)
81bcfd2 close                   ← Predecessor session close
39d8560 pre d24 amendment       ← Predecessor Stream B
05261bd arch conventions        ← Predecessor Stream D
```

**Working tree state at session close:** `M operations/decision-log.md` (the D-ENCRYPTION-WIRING-ADR-ADOPTED entry appended after the founder's `2f610e2` commit). `git status -uno` confirms `Your branch is up to date with 'origin/main'` (with the local modified state pending). Vercel has been auto-redeploying per push.

**Files remaining uncommitted at session close:**
- `operations/decision-log.md` (the D-ENCRYPTION-WIRING-ADR-ADOPTED entry, +67 lines from `2f610e2`).
- This session-close file.

Founder commits both at session close per the verbatim git command in §"Founder Verification" Step 5.

**Live-system effect:** Stream 1 (registry update v1.5.0) reaches the registry-driven dashboards via Vercel auto-redeploy. The dashboards now render the v1.5.0 state — D2 row no longer flagged red (blocker cleared); new architectural-conventions row appears in the alt-3 design grouping; statusSummary header reads `wired:148`. Stream 2 (ADR) is `/adopted/` documentation only; no live-system effect from the ADR itself (the implementation session is the live-system event).

---

## Open Questions

1. **`MENTOR_ENCRYPTION_KEY` backup status against the existing production value.** Promoted to next-session Step 1 priority per founder direction. Founder may resolve between sessions (read Vercel env var; confirm against personal backup copies) or at the next session's start.

No other open questions at session close. The session prompt's recommendations across both selected streams have all landed (registry v1.5.0; ADR drafted, Adopted, moved; two decision-log entries; this session close).

---

## Verification Method Used (0c Framework)

| Work item | Verification method |
|---|---|
| Pre-conditions confirmation | `git log --oneline -6` (confirmed `81bcfd2 close` + `341691f post bcd session prompt` present); `git status -s` (clean except this session's input); founder confirmed Vercel green via AskUserQuestion at session open. |
| Stream 1 Pass 1 source scan | `python3` script extracted handoff + decision-log entries since 2026-05-02 anchor; targeted grep confirmed 1 handoff (`2026-05-02-streams-bcd-close.md`) + 3 decision-log entries in lookback window. |
| Stream 1 Pass 2 (N/A) | Confirmed both touched entries are `type: document` via `python3` registry inspection; Pass 2 targeted import-pattern grep applies to TypeScript/TSX modules in `/website/src/`, not document entries; Pass 2 N/A confirmed. |
| Stream 1 Pass 3 transitive impact | `python3` registry script grep for blockers matching `'d2 amendment'`, `'d24 coverage-gap'`, `'coverage-gap addition'`, `'d2-amendment'`, `'validation addendum'` — returned 3 entries (D2 itself; D8 distinct concern; D24 distinct concern); 18 entries connect to D2 (D2's identity unchanged so connects edges remain valid). |
| Stream 1 Pass 4 spot-check | `python3` post-write inspection of D2 entry (blocker `''`, notes contains v1.1.0) + new entry (id, name, status, rules count, connects count, priority, blocker `''`); Pass 4 trusted v1.4.0 baseline same-day for the 188 unchanged. |
| Stream 1 proposal drafting | Write to `/operations/registry-updates/proposed-2026-05-02-c.md` (full Pass 1–4 audit trail per skill output shape; 3 founder-decision questions surfaced for the AskUserQuestion batch). |
| Stream 1 founder approval batch | AskUserQuestion 4-question call at the close of Stream 1 proposal; founder selected approval + v1.5.0 + Defer D8 + Option A. |
| Stream 1 pre-edit backup | `cp` to `archive/component-registry/component-registry.json.backup-2026-05-02-0809`; verified via `ls -la` + MD5 checksum match (identical bytes between source and backup pre-edit). |
| Stream 1 apply (Steps 8.2–8.9) | Python script executed atomically: D2 blocker cleared + notes extended; new entry appended (no duplicate id); statusSummary recomputed via `Counter`; lastUpdated `2026-05-02`; version `1.5.0`; totalComponents `191`; JSON re-parsed cleanly post-write; assertions on (`version == "1.5.0"`, `totalComponents == 191`, `len(components) == 191`); file written with `indent=2, ensure_ascii=False` + trailing newline. |
| Stream 1 post-write verification | `python3` re-load registry; print version / totalComponents / len(components) / statusSummary sum (all = 191; ✅); `git diff --stat` confirmed expected shape (50 ++ / 5 --); `git diff` excerpt confirmed header changes + D2 notes update + D2 blocker clear + new entry append; spot-check D2 entry post-write (blocker empty, notes contains v1.1.0); spot-check new entry post-write (id, name, rules, connects count = 9, blocker empty). |
| Stream 1 decision-log append | bash heredoc append; `wc -l` confirmed +59 lines (3219 → 3278); `grep -A 1 "D-REGISTRY-UPDATE-v1.5.0"` confirmed entry headline visible. |
| Stream 1 git status post-edit | `git status -s` showed expected modified + untracked files; `.git/index.lock` warning surfaced (D-LOCK-CLEANUP pattern; sandbox can't unlink; non-blocking for the founder's commit). |
| Stream 1 founder commit-or-batch | AskUserQuestion 2-question call after Stream 1 verification; founder selected: commit Stream 1 now (per-stream pattern) + proceed to Stream 2. |
| Stream 2 source-of-truth reads | Direct file reads of `engineering:architecture` SKILL.md (86 lines — ADR template); D21 migration-plan.md (337 lines — Phase-2 Precondition 4 + Pass 1 build steps); `encryption.ts` (217 lines); `server-encryption.ts` (114 lines); D14b grep for encryption + R17 + intimate (key sections); `mentor-profile-store.ts` grep for encrypt/decrypt usage (the canonical pipeline reference); local-storage strategy docx via `python-docx` (founder document — March 2026); env-var grep against `.env.example` + encryption modules. |
| Stream 2 ADR drafting | Write to `/drafts/ADR-ENCRYPTION-WIRING-01.md` (11 top-level sections per the engineering:architecture template adapted for the multi-decision shape; 5 named decisions with options + trade-offs; Critical Change Protocol pre-drafted per R17f). |
| Stream 2 founder approval | AskUserQuestion 2-question call (path A/B/C + flag MENTOR_ENCRYPTION_KEY backup-status check); founder selected Path A + Yes-flag-it. |
| Stream 2 Status line update | Edit tool — old_string verified unique before edit (matched the "Status: Drafted — under founder review.\n**Date:** 2026-05-02." block); new_string includes Adopted line + Date line. |
| Stream 2 move to /adopted/ | `git mv` failed (file not yet under version control — newly created); `mv` used instead; verified via `ls` (file present at /adopted/; not present at /drafts/); rename detection runs at the founder's next commit if applicable. |
| Stream 2 post-move verification | `head -3 adopted/ADR-ENCRYPTION-WIRING-01.md` confirmed Adopted Status line; `grep -c "^## " adopted/ADR-ENCRYPTION-WIRING-01.md` returned 11 (matched expected 11 sections); `grep "^## "` listed all 11 expected headings in expected order. |
| Stream 2 decision-log append | bash heredoc append; `wc -l` confirmed +67 lines (3278 → 3345); `grep -A 1 "D-ENCRYPTION-WIRING-ADR-ADOPTED"` confirmed entry headline visible. |
| Stream 2 git status post-edit | `git status` confirmed `M operations/decision-log.md` only (the founder committed `7a8c5a1 registry` and `2f610e2 encrytion wiring` in parallel during the session); the decision-log entry awaits the session-close commit. |
| Final sanity check | Git log `--oneline -6` confirms expected per-stream commits + this session's input + predecessor session-close + predecessor per-stream commits. |
| Founder live-site verification (between sessions) | The founder verifies via filesystem inspection + dashboard inspection post-deploy; specifications in §"Founder Verification" below. |

---

## Risk Classification Record (0d-ii)

| Change | Classification | Reasoning |
|---|---|---|
| Pre-condition AskUserQuestion (1 round at session open; 2 questions) | N/A — discovery only | No code/data change. |
| Stream 1 proposal AskUserQuestion (1 round; 4 questions) | N/A — discovery only | No code/data change. |
| Stream 1 proposal file write (`/operations/registry-updates/proposed-2026-05-02-c.md`) | Standard | New file; documentary only. |
| Stream 1 pre-edit backup (`/archive/component-registry/component-registry.json.backup-2026-05-02-0809`) | Standard | New file; no overwrites; MD5 verified identical to source. |
| Stream 1 registry edits (D2 update + new entry append + version + summary recompute + lastUpdated + totalComponents) | Standard | Field-only update + new component append. Same shape as predecessor v1.4.0 update. Pre-edit backup at known timestamp; rollback via restore-from-backup. JSON validation enforced post-write. AC7 not engaged. PR6 not engaged. Affects registry-driven dashboards (live surface — verification specified). Critical Change Protocol not engaged. |
| Stream 1 decision-log append (`D-REGISTRY-UPDATE-v1.5.0-2026-05-02`) | Standard | Append-only. |
| Stream 1 commit-or-batch AskUserQuestion (1 round; 2 questions) | N/A — discovery only | No code/data change. |
| Stream 2 ADR draft file (`/drafts/ADR-ENCRYPTION-WIRING-01.md`) | Standard | New file under `/drafts/`; design-only document; no live-system effect. |
| Stream 2 approval-pathway AskUserQuestion (1 round; 2 questions) | N/A — discovery only | No code/data change. |
| Stream 2 Status line edit + plain `mv` to `/adopted/` | Standard | Brand-new file move-to-`/adopted/` with no incoming cross-references; no overwrites; same precedent as D-A16-CATALOGUE-ASSEMBLED-AND-ADOPTED-2026-05-02 + D-VALIDATION-ADDENDUM-PROMOTED-2026-05-02. The plain `mv` (vs `git mv`) is a tooling consequence of the file being newly created; rename detection runs at the founder's commit time. |
| Stream 2 decision-log append (`D-ENCRYPTION-WIRING-ADR-ADOPTED-2026-05-02`) | Standard | Append-only. |
| Session close (this document) | Standard | Documentation. |

**No Critical changes this session.** PR6 not engaged at any edit. AC7 not engaged at any edit. Critical Change Protocol not engaged at any edit. Stream 2's ADR pre-drafts the Critical Change Protocol responses for the eventual implementation session — that drafting is itself Standard risk; the operative-Critical event is the implementation session's deploy.

---

## PR5 — Knowledge-Gap Carry-Forward

Knowledge gaps engaged this session:

- **KG1 (Vercel five rules) — engaged at Stream 2 documentation level.** ADR §Forces at play names KG1 rule 2 (await all DB writes) as load-bearing for the implementation session: "encryption is async-friendly but writes to the encrypted columns must be awaited, not fire-and-forget." The eventual implementation session must honour this rule — the new helpers' write paths must `await` the encrypt + INSERT before returning the response. No founder concept re-explanation needed at this session's documentation work.

- **KG2 (Haiku reliability boundary) — N/A this session.** No model selection at any layer; no LLM call paths touched at the design stage.

- **KG3 (Hub-label end-to-end contract) — N/A this session.** Neither stream touches `mentor_interactions` or any hub-scoped reader. The new tables (`open_deferrals`, `deferral_resolutions`) are Phase-2 pass-1 surfaces with their own labelling discipline; the implementation session will name KG3-equivalent end-to-end contract verification at table-write/read paths.

- **KG4 (Capability-matrix cell vocabulary / Layer-2 applicability vs wiring) — N/A this session.** No Layer 2 applicability decisions touched at any layer.

- **KG7 (JSONB storage format) — engaged at Stream 2 documentation level.** ADR §Forces at play names KG7 explicitly: "`encryption_meta` is JSONB; per KG7 the writer must pass the object directly to Supabase, not `JSON.stringify` it. The existing `mentor-profile-store.ts` does this correctly; the new wiring must match." ADR Action Item 5 (encrypt-then-decrypt dry-run test) includes `jsonb_typeof(encryption_meta) = 'object'` check; ADR §"Critical Change Protocol responses §Verification step" includes the post-deploy `jsonb_typeof` check. KG7 is encoded into the implementation session's verification protocol. No founder concept re-explanation needed at this session.

**No new knowledge-gap candidates surfaced this session.** Both streams' work was design / governance / documentation; no code; no live-system effect at any edit.

**No founder concept re-explanation observed this session.**

---

## Founder Verification (Between Sessions)

The founder verifies the work via the per-stream verification protocols below plus the standard git inspection.

### Step 1 — Confirm Stream 1 registry update landed at v1.5.0

From a Terminal at the project folder (`/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/`):

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
python3 -c "
import json
with open('website/public/component-registry.json') as f: d=json.load(f)
print('version:', d['version'])
print('totalComponents:', d['totalComponents'])
print('len(components):', len(d['components']))
print('statusSummary:', d['statusSummary'])
print('D2 blocker (should be empty):', repr(next(c for c in d['components'] if c['id']=='doc-rag-mentor-alt3-canonical-framework')['blocker']))
print('D2 notes contains v1.1.0:', 'v1.1.0' in next(c for c in d['components'] if c['id']=='doc-rag-mentor-alt3-canonical-framework')['notes'])
print('New entry present:', any(c['id']=='doc-rag-mentor-alt3-architectural-conventions' for c in d['components']))
"
```

Expected output:
```
version: 1.5.0
totalComponents: 191
len(components): 191
statusSummary: {'wired': 148, 'verified': 30, 'designed': 10, 'live': 2, 'scaffolded': 1}
D2 blocker (should be empty): ''
D2 notes contains v1.1.0: True
New entry present: True
```

### Step 2 — Confirm Stream 2 ADR landed in `/adopted/`

```
ls adopted/ADR-ENCRYPTION-WIRING-01.md
ls drafts/ADR-ENCRYPTION-WIRING-01.md  # should fail with "No such file or directory"
head -5 adopted/ADR-ENCRYPTION-WIRING-01.md
grep -c "^## " adopted/ADR-ENCRYPTION-WIRING-01.md
```

Expected: file exists in `/adopted/`; not present in `/drafts/`; Status line reads "Adopted (founder approval per Path A on 2026-05-02; D-ENCRYPTION-WIRING-ADR-ADOPTED-2026-05-02). Moved from /drafts/ to /adopted/ 2026-05-02."; section count returns `11`.

### Step 3 — Confirm decision-log entries appended

```
grep -A 1 "D-REGISTRY-UPDATE-v1.5.0" operations/decision-log.md | head -3
grep -A 1 "D-ENCRYPTION-WIRING-ADR-ADOPTED" operations/decision-log.md | head -3
wc -l operations/decision-log.md
```

Expected: each grep returns the entry headline; line count returns `3345` (was 3219 pre-session; +126 lines for the two appends).

### Step 4 — Live-site dashboard verification (post-deploy)

After the founder's session-close commit pushes and Vercel auto-redeploys (~1 minute):

- https://www.sagereasoning.com/SageReasoning_Capability_Inventory.html — D2 row (`doc-rag-mentor-alt3-canonical-framework`) no longer renders red (blocker cleared); new row `doc-rag-mentor-alt3-architectural-conventions` appears in the alt-3 design grouping; statusSummary header reads `wired: 148`.
- https://www.sagereasoning.com/SageReasoning_Architecture_Map.html — same expected change.

### Step 5 — Final commit (session close + decision-log entry — per-stream commits already pushed)

The founder has been committing + pushing each stream as it landed during the session: `7a8c5a1 registry` (Stream 1 — registry v1.5.0 + proposal + backup + decision-log up to D-REGISTRY-UPDATE-v1.5.0); `2f610e2 encrytion wiring` (Stream 2 — the ADR file in its `/adopted/` location). The remaining files to commit are this session-close document + the decision-log entry for D-ENCRYPTION-WIRING-ADR-ADOPTED.

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"

# If the index.lock warning surfaces (D-LOCK-CLEANUP-2026-04-26 pattern), run this first:
rm -f .git/index.lock

git add operations/decision-log.md operations/handoffs/founder/2026-05-02-streams-1-2-registry-and-encryption-adr-close.md

git commit -m "session close: streams 1 + 2 — 2 May 2026

- Stream 1: registry update v1.5.0 (D-REGISTRY-UPDATE-v1.5.0-2026-05-02) — D2 blocker cleared + new architectural-conventions entry
- Stream 2: encryption-wiring ADR drafted + Adopted (D-ENCRYPTION-WIRING-ADR-ADOPTED-2026-05-02) — five named decisions; Critical Change Protocol responses pre-drafted per R17f; 12 action items for the implementation session
- All Standard risk; no Critical changes; AC7 not engaged; PR6 not engaged at any edit
- Phase-2 pass-1 readiness inventory: 7 of 7 design preconditions complete; encryption-wiring IMPLEMENTATION session is the only remaining work before Phase-2 pass 1 commencement"
```

Then push via **GitHub Desktop** per D-PR8-PUSH-2026-04-26. Vercel auto-redeploys on push to main; ~1 minute to deploy.

If `git add` fails with `index.lock` errors (D-LOCK-CLEANUP-2026-04-26 pattern), run `rm .git/index.lock` from the same Terminal first, then retry.

### Step 6 — Optional spot-check after push

```
git log --oneline -8
git show --stat HEAD | tail -10
```

Expected: most recent commit is "session close: streams 1 + 2 — 2 May 2026"; preceded by `2f610e2 encrytion wiring` (Stream 2), `7a8c5a1 registry` (Stream 1), `341691f post bcd session prompt`, and earlier predecessor commits.

### Step 7 — Optional rollback paths (only if needed)

**Stream 1 rollback (registry v1.4.0 restore):** if the registry update causes downstream dashboard issues:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
cp archive/component-registry/component-registry.json.backup-2026-05-02-0809 website/public/component-registry.json
git add website/public/component-registry.json
git commit -m "rollback: restore registry to v1.4.0 state (D-REGISTRY-UPDATE-v1.5.0-SUPERSEDED)"
```

Then push via GitHub Desktop. Append a `D-REGISTRY-UPDATE-v1.5.0-SUPERSEDED` entry to the decision log.

**Stream 2 rollback (ADR returned to /drafts/):** if the ADR's decisions need revision before implementation:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git mv adopted/ADR-ENCRYPTION-WIRING-01.md drafts/ADR-ENCRYPTION-WIRING-01.md
# revert the Status line edit (manually or via git checkout)
git commit -m "rollback: ADR-ENCRYPTION-WIRING-01 returned to /drafts/ (D-ENCRYPTION-WIRING-ADR-ADOPTED-SUPERSEDED)"
```

Then push via GitHub Desktop. Append a `D-ENCRYPTION-WIRING-ADR-ADOPTED-SUPERSEDED` entry to the decision log. Material changes to any of the five named decisions require a new ADR (ADR-ENCRYPTION-WIRING-02) per the ADR's §"Honest disclosure" section.

### Step 8 — Next-session preparation (action item carry-forward)

Per founder direction this session, the next session's prompt will name **"verify MENTOR_ENCRYPTION_KEY backup status against the existing production value"** as the implementation session's Step 1 (NEW), preceding ADR Action Items 4–12. Founder may resolve this between sessions by reading the existing Vercel env var and confirming whether personal backup copies (password manager + paper) exist.

---

## Orchestration Reminder (Element 21)

This session was governed end-to-end by `/adopted/session-opening-protocol.md`. Honest audit of element compliance:

- **Element 1 (Tier declaration):** ✓ Declared at open (founder/governance scope; design / housekeeping / documentary only; Standard risk both streams).
- **Element 2 (Canonical-source read sequence):** ✓ All Part A sources read in canonical order before any execution. Stream-specific reads completed at the start of each stream per the prompt's instruction.
- **Element 3 (Handoff read):** ✓ Predecessor close (`2026-05-02-streams-bcd-close.md`) read in full.
- **Element 4 (Knowledge-gaps scan):** ✓ KG1–KG7 scanned. KG1 + KG7 engaged at Stream 2 documentation level (load-bearing for implementation session); KG2 / KG3 / KG4 N/A this session.
- **Element 5 (Hold-point status):** ✓ P0 0h confirmed active; design / governance / documentation work permissible.
- **Element 6 (Model selection):** ✓ N/A this session — no LLM model selection at any layer.
- **Element 7 (Status-vocabulary confirmation):** ✓ Implementation status (`wired` for registry entries; `Adopted` for the ADR file) and decision status (`Adopted` for both decision-log entries) kept separate per the 0a separation.
- **Element 8 (Signals & risk classification):** ✓ Pre-condition signal "I need your input" used at session open (2 questions). Founder direction signals "Yes — full session" / "Both streams" / Path A choices acknowledged. Risk classifications surfaced per stream (Standard / Standard).
- **Element 9 (Change classification before execution):** ✓ Each change classified before applying. No Critical / Elevated changes at any edit.
- **Element 13 (Single-endpoint proof, PR1):** ✓ Preserved at the architectural level — no Phase-2 build commenced this session. ADR §Decision 1 names the existing `mentor-profile-store.ts` wiring as the proof endpoint for the encryption pattern.
- **Element 14 (Verification immediate, PR2):** ✓ Pre-edit backup at known timestamp before any registry edit; MD5 verified identical pre-edit; post-write JSON re-parse + counts validation; spot-check on touched entries; ADR Status line update via Edit tool with old_string verified unique.
- **Element 15 (Deferred decisions logged, PR7):** ✓ D8 optional cross-reference deferred per founder direction; Option B comprehensive connects update deferred per founder direction; six open questions logged in ADR §"Open questions" with revisit conditions; MENTOR_ENCRYPTION_KEY backup-status check promoted to next-session Step 1 per founder direction.
- **Element 16 (Tacit-knowledge promotion, PR8):** ✓ N/A this session — no new tacit-knowledge candidates surfaced.
- **Element 17 (Stewardship tiering, PR9):** ✓ N/A this session — no F-series findings surfaced.
- **Element 18 (Scope caps):** ✓ Engaged at session open (founder selected scope via AskUserQuestion); each stream's approval-pathway AskUserQuestion preserved scope boundaries; commit-or-batch question between Streams 1 + 2 honoured the recommended hard pause point per the prompt; no mid-session scope expansion. Streams executed in selected 1 → 2 order without diverging.
- **Element 19 (Stabilise before closing):** ✓ Both streams landed cleanly with verification confirming expected state; no half-changed state. Pre-edit backup available for Stream 1 rollback. Plain `mv` for Stream 2 (rather than `git mv`) was the correct tooling choice for a newly-created file; the founder's parallel commit incorporated the file at its new location. Session close (this document) produced.
- **Element 20 (Handoff in required-minimum format with extensions):** ✓ This document carries the 0b minimum (Decisions Made / Status Changes / Next Session Should / Blocked On / Open Questions) plus the extensions (Verification Method / Risk Classification / PR5 / Founder Verification / Orchestration Reminder).
- **Element 21 (Orchestration reminder):** This section.

**Net assessment:** Protocol followed. The session landed: pre-conditions confirmed; Stream 1 registry v1.5.0 produced and verified (registry edit + proposal + backup + decision-log entry); Stream 2 ADR drafted, approved, Status line updated, moved to `/adopted/`, and verified (ADR file + decision-log entry); both streams' decision-log entries appended (+126 lines); this session close produced. No protocol elements skipped.

The one tooling note: `git mv` failed for the new ADR file (file not yet under version control); plain `mv` used as the correct fallback. The founder's per-stream commit pattern (selected at the Stream 1 commit-or-batch question) committed each stream's output as it landed, leaving only the decision-log entry for Stream 2 + this session close as the final commit at session close.

**Phase-2 pass-1 readiness inventory after this session:** 7 of 7 design preconditions complete (component registry up-to-date at v1.5.0; encryption-wiring ADR Adopted; all other preconditions complete from prior sessions). The encryption-wiring IMPLEMENTATION session is the only remaining work before Phase-2 pass 1 commencement; that session is Critical risk per R17f + PR6 and follows the Critical Change Protocol responses pre-drafted in ADR-ENCRYPTION-WIRING-01.

---

## Cross-references

- `/adopted/session-opening-protocol.md` (governing frame)
- `/manifest.md` (R0, R6a–R6e, R7, R8a–R8d, R17a–R17f, R20a, AC1, AC4, AC5, AC6, AC7, KG1, KG7, ES1 — all referenced or applied)
- `/operations/decision-log.md` D-REGISTRY-UPDATE-v1.5.0-2026-05-02 (Stream 1, this session)
- `/operations/decision-log.md` D-ENCRYPTION-WIRING-ADR-ADOPTED-2026-05-02 (Stream 2, this session)
- `/operations/decision-log.md` D-REGISTRY-UPDATE-v1.4.0-2026-05-02 (predecessor session baseline)
- `/operations/decision-log.md` D-API-REASON-PRE-ALT3-SNAPSHOT-2026-05-02 + D-VALIDATION-ADDENDUM-PROMOTED-2026-05-02 + D-D2-AMENDMENT-2026-05-02 (predecessor streams-bcd session)
- `/operations/handoffs/founder/2026-05-03-post-streams-bcd-NEXT-SESSION-PROMPT.md` (this session's input prompt)
- `/operations/handoffs/founder/2026-05-02-streams-bcd-close.md` (predecessor close)
- `/website/public/component-registry.json` (v1.5.0 — the registry artefact this session updated)
- `/operations/registry-updates/proposed-2026-05-02-c.md` (Stream 1 proposal with full Pass 1–4 audit trail)
- `/archive/component-registry/component-registry.json.backup-2026-05-02-0809` (Stream 1 pre-edit backup — v1.4.0 rollback source)
- `/adopted/ADR-ENCRYPTION-WIRING-01.md` (Stream 2 deliverable)
- `/adopted/rag-mentor-alt3/canonical-framework.md` (D2 v1.1.0 — the Stream B amendment Stream 1 references)
- `/adopted/rag-mentor-alt3/architectural-conventions.md` (the catalogue Stream 1 added a registry entry for)
- `/adopted/rag-mentor-alt3/migration-plan.md` (D21 — Phase-2 Precondition 4 names Stream 2's work)
- `/adopted/rag-mentor-alt3/reflect-endpoint-14b-deferral-resolution.md` (D14b — defines the Phase-2 pass-1 tables Stream 2's ADR designs encryption for)
- `/adopted/rag-mentor-alt3/operationalised-rules.md` (D8 — defines the engine output that produces the intimate diagnostics)
- `/website/src/lib/server-encryption.ts` (the encryption module Stream 2's ADR §Decision 1 reuses)
- `/website/src/lib/encryption.ts` (the client-side encryption module Stream 2's ADR §R17d posture references)
- `/website/src/lib/mentor-profile-store.ts` (the canonical wiring precedent Stream 2's ADR §Decision 3 follows)
- `/operations/SageReasoning_Priority5_Local_Storage_Strategy.docx` (the founder's R17d philosophy Stream 2's ADR §Context references)
- `/.claude/skills/sage-registry-update/SKILL.md` (the operative Stream 1 skill, 588 lines, Q1–Q5 + Pass-4-enhanced)
- engineering:architecture skill (the Stream 2 ADR template adapted)
- `/operations/knowledge-gaps.md` (KG1 + KG7 referenced in Stream 2 documentation)

---

*End of session close. Two streams complete: Stream 1 registry update v1.5.0 (D-REGISTRY-UPDATE-v1.5.0-2026-05-02; D2 blocker cleared + new architectural-conventions catalogue entry; backup at 2026-05-02-0809; live on dashboards post-deploy); Stream 2 encryption-wiring ADR drafted + Adopted (D-ENCRYPTION-WIRING-ADR-ADOPTED-2026-05-02; five named decisions; Critical Change Protocol responses pre-drafted per R17f; 12 action items for the implementation session; MENTOR_ENCRYPTION_KEY backup-status check promoted to next-session Step 1 per founder direction). Phase-2 pass-1 readiness inventory: 7 of 7 design preconditions complete. The encryption-wiring IMPLEMENTATION session (Critical risk per R17f + PR6) is the only remaining work before Phase-2 pass 1 commencement.*
