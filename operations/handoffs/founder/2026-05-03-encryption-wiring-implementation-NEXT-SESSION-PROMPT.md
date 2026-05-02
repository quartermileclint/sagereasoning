# Next-Session Prompt — Encryption-Wiring IMPLEMENTATION (Critical risk per R17f + PR6)

**Stream:** founder. **Tier:** founder/governance + code scope.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Predecessor session close:** `/operations/handoffs/founder/2026-05-02-streams-1-2-registry-and-encryption-adr-close.md`.
**Predecessor decision-log entries (this session):**
- `D-REGISTRY-UPDATE-v1.5.0-2026-05-02` (Stream 1 — registry v1.4.0 → v1.5.0; D2 blocker cleared + new architectural-conventions catalogue entry)
- `D-ENCRYPTION-WIRING-ADR-ADOPTED-2026-05-02` (Stream 2 — ADR-ENCRYPTION-WIRING-01 Adopted with five named decisions + Critical Change Protocol responses pre-drafted)

**Governing ADR for this session:** `/adopted/ADR-ENCRYPTION-WIRING-01.md` (read in full at session open).

**Risk classification: Critical** under R17f + PR6 + 0d-ii. The Critical Change Protocol (project instructions 0c-ii) is the operative discipline for the deploy step. The ADR pre-drafts the Critical Change Protocol responses; this session executes them verbatim with founder explicit approval at each gate.

---

## Why this session matters

Phase-2 pass-1 design preconditions are 7 of 7 complete. The encryption-wiring IMPLEMENTATION is the **only remaining work** before Phase-2 pass-1 commencement. The wiring is **Critical risk** because it touches the application-level encryption surface that protects intimate data per R17b — and per R17f, "*A protection that locks the data owner out of their own system has failed as a protection.*"

The ADR pre-drafted the architecture (five named decisions) and the Critical Change Protocol responses. This session executes the ADR's Action Items 1–12 in order, with founder explicit approval at each gate.

**Per founder direction at the predecessor session, this session's first work is NOT generating a new key. The first work is verifying the existing `MENTOR_ENCRYPTION_KEY` backup status.** The existing key is almost certainly already in production (since `mentor-profile-store.ts` reads from it and that pipeline is operational). Generating a new key when the existing one is in active use would invalidate the existing mentor-profile encrypted data — that's an R17f-violating outcome and must be avoided.

---

## Pre-conditions for this session opening

1. **Founder push of this session's input prompt + the predecessor session-close commit via GitHub Desktop.** Working tree clean at session open.
2. **Vercel green confirmation.** Founder confirms Vercel deployed the predecessor session-close commit cleanly.
3. **Founder readiness for Critical-risk work.** The session involves: (a) reading the existing production `MENTOR_ENCRYPTION_KEY` value from Vercel; (b) potentially executing the founder backup ceremony if no backup exists; (c) schema migrations against staging then production; (d) wiring code; (e) deploy under the Critical Change Protocol with explicit approval at each gate. The session is bounded but the deploy step is non-trivial.
4. **Founder access to:** Vercel dashboard (read env var); Supabase dashboard (apply schema migrations); password manager (for the backup ceremony if needed); printer (for paper backup if needed); GitHub Desktop (for commits + push).

If pre-conditions 1 + 2 are not met at session open, the agent's first action is to confirm with the founder which path applies. If pre-condition 3 is uncertain (founder not ready for Critical-risk work today), the session pauses cleanly at design-only stages and defers the deploy step.

If pre-condition 4 is not met (founder lacks access to any required dashboard or tool), the agent surfaces this as a blocker before any work begins.

---

## Part A — Open the session under the protocol

Per `/adopted/session-opening-protocol.md` Part A elements 1–8, do the full read sequence. Tier: founder/governance + code scope. Read:

1. **`/manifest.md`** — particularly **R17a–R17f** (the central rules; R17f's Critical Change Protocol obligation is the load-bearing constraint), R20a (perimeter — N/A this session because the new route comes at Phase-2 pass 1, not this session), AC1 (model selection — N/A this session; no LLM calls), AC4 (invocation testing for safety functions — adapted to encryption helpers per ADR Action Item 8), AC5 (R20a perimeter — N/A this session), AC6 (four-layer context architecture — N/A this session), **AC7 (Session-7b standing constraint — explicitly checked; ADR confirms NOT engaged at the encryption layer; verify this assumption holds at the implementation stage)**, KG1 (Vercel five rules — rule 2 load-bearing per ADR §Forces at play), KG7 (JSONB storage format — load-bearing for the post-deploy verification per ADR Action Item 5 + 10).

2. (Project instructions — already in system prompt. Particularly Priority 2 §2c and the 0c-ii Critical Change Protocol.)

3. **`/operations/handoffs/founder/2026-05-02-streams-1-2-registry-and-encryption-adr-close.md`** — the predecessor session close. Required context.

4. **`/adopted/ADR-ENCRYPTION-WIRING-01.md`** — the governing ADR. **Read in full.** This is the architecture this session executes. Pay particular attention to:
   - §"Decisions" (the five named decisions and their selected options)
   - §"Action Items" (the 12-step execution plan)
   - §"Critical Change Protocol responses" (the verbatim responses for the deploy step)
   - §"Open questions" (six items including the Q1 backup-status check that is this session's Step 1)

5. **`/operations/decision-log.md`** — read at minimum the last 5 entries:
   - `D-ENCRYPTION-WIRING-ADR-ADOPTED-2026-05-02` (the ADR adoption — sets this session's mandate)
   - `D-REGISTRY-UPDATE-v1.5.0-2026-05-02` (registry baseline)
   - `D-D2-AMENDMENT-2026-05-02` (D2 v1.1.0 — context for the Phase-2 pass-1 readiness inventory)
   - `D-VALIDATION-ADDENDUM-PROMOTED-2026-05-02` (architectural-conventions catalogue)
   - `D-API-REASON-PRE-ALT3-SNAPSHOT-2026-05-02` (Phase-2 pass-3 snapshot)

6. **`/adopted/rag-mentor-alt3/migration-plan.md`** (D21) — particularly § Precondition 4 (this session is the precondition's discharge) and § Phase-2 Pass 1 build steps (Step 2 names "Encryption wiring (P2 task 2c coordination)" — this session is that work).

7. **`/adopted/rag-mentor-alt3/reflect-endpoint-14b-deferral-resolution.md`** (D14b) — particularly § "R17 intimate data protection conformance" + § "Schema additions" (the four encrypted fields across the two new tables that this session designs the wiring for).

8. **`/website/src/lib/server-encryption.ts`** — the module this session reuses. 114 lines. Already proven via `mentor-profile-store.ts` integration.

9. **`/website/src/lib/mentor-profile-store.ts`** — the canonical wiring precedent (specifically the encrypt/decrypt usage pattern around lines 4–200). The new helpers extend this pattern.

10. **`/operations/knowledge-gaps.md`** — KG1 (rule 2: await DB writes — load-bearing) and KG7 (JSONB storage format — load-bearing for `encryption_meta` columns).

Confirm: tier; hold-point status (still active per P0 0h); model selection (N/A — no LLM calls this session); status-vocabulary readiness; signals/risk-classification readiness (Critical Change Protocol responses ready to surface verbatim).

---

## Part B — Step 1 (NEW per founder direction): Verify `MENTOR_ENCRYPTION_KEY` backup status

**Before any other work**, the agent surfaces this question via AskUserQuestion. Do not skip this step. Do not generate a new key.

**Question to surface:** "What is the current state of `MENTOR_ENCRYPTION_KEY` and your backups of it?"

**Recommended options:**

1. **Existing key in production + I have backups (password manager + paper) verified within the last month.** → Proceed to Part C (Action Items 4 onward; skip Action Items 1–3 — the ceremony is already done).
2. **Existing key in production + I have backups but haven't verified recently.** → Pause to verify. Founder reads the existing Vercel env-var value AND reads the password-manager entry AND compares them character-for-character. If they match: proceed to Part C. If they don't match: STOP — that's a fork-state requiring founder direction (which copy is canonical?).
3. **Existing key in production + I have NO backups.** → Execute the founder backup ceremony AGAINST THE EXISTING KEY (ADR Action Item 2 modified — read the existing key from Vercel, paste into password manager, print on paper, calendar reminder). Then proceed to Part C. **Do NOT generate a new key.**
4. **No `MENTOR_ENCRYPTION_KEY` in production yet (unlikely — verify by checking Vercel).** → Proceed to ADR Action Items 1–3 verbatim (generate new key + ceremony + paste into Vercel). This is the greenfield path; only correct if verification confirms no key is currently in production.

**How the founder verifies the existing key in Vercel** (the agent provides exact menu paths):

1. Open https://vercel.com (sign in if not already).
2. Click on the `sagereasoning` project (or the relevant project name).
3. Click **Settings** (top tab).
4. Click **Environment Variables** (left sidebar).
5. Look for `MENTOR_ENCRYPTION_KEY` in the list.
6. If present: click the value to reveal it (Vercel may require confirmation). The value should be exactly 64 hex characters (0–9, a–f).
7. If not present: confirm the option 4 path with the agent.

**Risk if this step is skipped:** generating a new key when the existing one is in active use will cause `decryptProfileData()` to throw on every read of existing `mentor_profiles` rows — the founder loses access to all existing mentor-profile data. That's the R17f-violating worst case. The agent must NOT proceed past this step without explicit founder confirmation of the key's status.

---

## Part C — Execute ADR Action Items 4–12 (or 1–3 if option 4 above)

Per the ADR's §"Action Items" — the agent walks the founder through each step with verification at each gate. The agent does NOT execute the deploy step (Step 9) without surfacing the Critical Change Protocol responses verbatim and obtaining founder explicit approval specific to the named risks.

### ADR Action Items recap (read the full ADR for each step's detail):

1. **[ ]** Generate production encryption key. (Skip if existing key in production per Part B above.)
2. **[ ]** Founder backup ceremony. (Execute against the existing key if Part B Option 3.)
3. **[ ]** Production env var set in Vercel. (Verification-only if existing key.)
4. **[ ]** Schema migrations against staging.
5. **[ ]** Encrypt-then-decrypt dry-run test against canonical seed data.
6. **[ ]** Schema migrations against production.
7. **[ ]** Wire `lib/encryption-helpers.ts` (or extend `mentor-profile-store.ts` pattern).
8. **[ ]** AC4 invocation testing for the new helpers + new route source. (Note: the route itself comes at Phase-2 pass 1, not this session — AC4 testing for the route is per Phase-2 pass 1's commencement.)
9. **[ ]** Critical Change Protocol for the deploy. **Founder explicit approval gate.** ← The agent surfaces the verbatim Critical Change Protocol responses from ADR §"Critical Change Protocol responses" before this gate. Founder approval must be specific to the named risks, not generic "yes proceed."
10. **[ ]** Post-deploy verification (founder runs decrypt-test against first real write — but this is N/A this session because there's no real write until Phase-2 pass 1's route lands; the verification at this session's deploy is the staging encrypt-then-decrypt test from Step 5 + the schema migration verification from Steps 4 + 6).
11. **[ ]** Decision-log entry `D-ENCRYPTION-WIRING-IMPLEMENTED-YYYY-MM-DD`.
12. **[ ]** Phase-2 pass-1 readiness inventory updates to "ready for pass-1 commencement."

### Important scope clarification

This session's deliverable is **the encryption infrastructure** (helpers + schema), NOT the new route or the new page. The new route (`/api/mentor/private/deferral-resolve`) and new page (`/private-mentor/deferred-questions`) come at Phase-2 pass 1 — that's a separate Critical-risk session per D21. This session's deploy lands the schema (with `MENTOR_RAG_V1=false` keeping it dormant) and the helper module; Phase-2 pass 1 then wires the route to consume the helpers.

This decoupling is per ADR §Decision 5: "the implementation session is *separate* from the Phase-2 pass-1 commencement session; Critical-risk work is not bundled."

---

## Part D — Founder reads needed for in-session decisions

Beyond the protocol read sequence (Part A), at certain decision points the founder may need to read:

- **For Part B (key backup status):** the screenshot/value of the Vercel env var (the founder reads this in their Vercel dashboard, not in this session's chat).
- **For Step 4/6 (schema migrations):** the SQL from ADR §Decision 3 (the agent provides verbatim copy-paste). The founder pastes into Supabase SQL editor; reviews the output; confirms before proceeding.
- **For Step 9 (deploy approval):** the verbatim Critical Change Protocol responses from ADR §"Critical Change Protocol responses". The agent surfaces them in-chat at the gate. Founder reviews each section (what's changing, what could break, what happens to existing sessions, rollback plan, verification step) and approves explicitly.

---

## Part E — Session close + next-next-session preparation

After all ADR Action Items are complete (or after a clean pause if the founder signals "done for now" mid-session), produce a session close at `/operations/handoffs/founder/[date]-encryption-wiring-implementation-close.md` per protocol Part C. Include the standard 0b minimum + extensions per the predecessor close pattern.

The "Next Session Should" section recommends **Candidate G — Phase-2 pass-1 commencement** (D14b deferral-resolution surface; Critical risk per PR6 + AC5 ninth-route discipline + R17 perimeter expansion) as the immediate next item. All Phase-2 pass-1 preconditions will be complete after this session.

If this session pauses mid-execution (e.g., founder signals "done for now" before deploy), the close documents the paused state and the next session resumes from the named ADR Action Item.

---

## Important context

- **Founder is a non-coder.** Plain-language explanations of every key management decision. Define every technical term the first time it appears. Provide exact copy/paste text for SQL, env-var values, and verification commands. Specify exact menu paths for Vercel + Supabase navigation.

- **Founder decides direction.** Where any step surfaces ambiguity, the agent surfaces options with reasoning; the founder calls. The agent does not silently proceed past any approval gate.

- **Critical Change Protocol is the operative discipline for the deploy.** The protocol's five steps (what's changing, what could break, what happens to existing sessions, rollback plan, verification step) must appear verbatim in the conversation before the deploy. The founder's approval must be specific to the named risks.

- **Risk classifications:** Steps 1–3 (key handling): Critical (key custody is R17f). Steps 4 + 6 (schema migrations): Elevated (additive change; reversible via DROP TABLE; no data exists pre-build). Step 5 (dry-run encrypt-decrypt): Standard (testing only). Step 7 (wire helpers): Standard (new module; no existing call sites changed). Step 8 (AC4 testing): Standard. Step 9 (deploy): **Critical** — the operative-Critical event. Step 10 (post-deploy verification): Standard. Step 11 (decision-log): Standard. Step 12 (readiness inventory): Standard.

- **No live-system effect on existing data.** This session's work is additive (new tables + new helpers + same key + same algorithm). The existing mentor-profile pipeline is unaffected. Existing JWT sessions remain valid through the deploy. AC7 standing constraint NOT engaged.

- **The founder's three-copy backup discipline (ADR Decision 4) is the load-bearing R17f mitigation.** If this session ends without the backup ceremony complete (because the founder doesn't want to do it today), the deploy step (Step 9) is gated until a follow-up session executes the ceremony. **Do not deploy without the backup verified.**

- **No founder concept re-explanation expected.** If a concept does need re-explanation, flag it for PR5.

---

## Standing reminders

- Single source of truth for governance metadata: `/website/public/component-registry.json` (currently v1.5.0; this session adds an entry for the new helper module if substantial — see Step 7).
- Decision-log entry per stream per PR7 — including for explicitly deferred decisions.
- Provide the founder with verification methods (URLs, expected results, copy-paste commands) for any work that touches a live surface. This session's deploy affects production database schema (live surface — verification required) + production code path (live surface — verification required).
- Do not propose changes to any /adopted/ governance document beyond what the ADR specifies. Material changes to any of the five ADR named decisions require ADR-ENCRYPTION-WIRING-02 or supersession entry per the ADR's §"Honest disclosure".
- Phase-2 pass-1 build (D14b deferral-resolution surface) does NOT commence this session. That's the next-next session per D21.
- If any step's work surfaces a need that exceeds the ADR's scope, surface it as a scope question for the founder before proceeding. The agent does not silently revise the ADR.
- Per-stream commits + pushes (the predecessor session's pattern): the founder may continue committing + pushing each step's output as it lands, rather than batching to session close. Either pattern is acceptable; the agent surfaces what files would be staged after each step's verification.

---

## Forecast

**If the session executes Steps 1–12 in full:**

- `MENTOR_ENCRYPTION_KEY` backup ceremony verified (or executed if needed) — three copies confirmed.
- Two new schema tables in production: `open_deferrals` + `deferral_resolutions` per ADR §Decision 3 (with `MENTOR_RAG_V1=false` keeping them dormant).
- New helper module at `/website/src/lib/encryption-helpers.ts` (or extension of `mentor-profile-store.ts` pattern) — `encryptDeferralPayload()` + `decryptDeferralPayload()`.
- AC4 invocation test confirms the helpers' call patterns at the helper level.
- `/operations/decision-log.md` — one new entry appended (`D-ENCRYPTION-WIRING-IMPLEMENTED-YYYY-MM-DD`).
- Component-registry entry potentially added for the new helper module (logged for next registry update if not part of this session's scope).
- Founder verification commands provided in the session close (SQL queries to confirm schema + Vercel inspection to confirm env var + grep to confirm helper invocation).
- Phase-2 pass-1 readiness: ALL preconditions complete; pass-1 commencement awaits founder direction at next-next session.

**If the session pauses mid-execution** (founder signals "done for now" before deploy):

- Whatever steps completed are committed and verified.
- Session close documents the paused state.
- Next-next session resumes from the named ADR Action Item.

**If Part B reveals a fork-state** (key in production but backups don't match):

- Session pauses. Founder direction needed (which copy is canonical?). No deploy until resolved.
- Decision-log entry captures the fork-state + the founder's resolution.

**If Part B reveals option 4** (no key in production yet):

- ADR Action Items 1–3 executed greenfield (generate + ceremony + paste).
- Then Action Items 4–12 per the standard path.

---

## Anticipated session shape

The session is bounded but the deploy step is non-trivial. Realistic time budget:

| Phase | Time estimate |
|---|---|
| Part A (canonical reads + ADR re-read) | 10–15 min |
| Part B (key backup status check) | 5–30 min depending on path |
| ADR Action Items 4 + 5 (staging schema + dry-run test) | 30–45 min |
| ADR Action Items 6 + 7 (production schema + helper module wire) | 45–60 min |
| ADR Action Item 8 (AC4 invocation test) | 15 min |
| ADR Action Item 9 (Critical Change Protocol responses + founder approval gate) | 15 min |
| Post-deploy verification + decision log + session close | 30 min |
| **Total** | **2.5–3.5 hours** |

If the founder doesn't have this much time today, the natural pause point is between Step 5 (dry-run test against staging) and Step 6 (production schema migration). Up to Step 5 is design + staging only — no production effect. Step 6 onward starts production-affecting work.

---

End of prompt. Confirm receipt and full Part A read before proceeding to Part B (key backup status check via AskUserQuestion).
