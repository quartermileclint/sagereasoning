# Next-Session Prompt — E7 (or new sequence): founder's choice from candidate menu

**Stream:** founder.
**Tier:** TBD at session open (depends on choice).
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessor session close:** `/operations/handoffs/founder/2026-05-04-sub-session-E6-close.md`.
**Predecessor decision-log entry:** `D-SCENARIO-RAG-WIRED-2026-05-04`.
**Risk classification:** TBD at session open. Critical Change Protocol engages only if the founder picks a Critical-tier candidate.

## Why this session matters

The PR1 rollout arc for the `/api/score-*` family is complete at E6. Seven rollout consumers Verified-in-place: 1 internal (Candidate C `/api/internal/retrieve`) + 4 Pattern A2 user-facing (`/api/reason`, `/api/score`, `/api/score-conversation`, `/api/score-social`) + 2 Pattern A1 user-facing (`/api/score-document`, `/api/score-scenario`). Group A complete + Group B complete. Both pattern dimensions proven on multiple consumers.

The next session is **not** another consumer wiring in the same arc. The work the rollout enabled is now done. Five candidate directions exist; the founder chooses at session open. Each candidate has its own scope, risk class, and session shape — surfaced below.

## Pre-conditions

1. Founder pushed E6's five artefacts via GitHub Desktop. Working tree clean at session open. Vercel green confirmation post-push.
2. Founder ran the E6 harness independently and confirmed `SUMMARY: 139 / 139 checks passed`.
3. Founder availability: variable — depends on candidate (estimates per candidate below).

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier, model selection, risk class, signals).
2. `/operations/handoffs/founder/2026-05-04-sub-session-E6-close.md` (~5 min — predecessor close).
3. `/operations/decision-log.md` last entry (`D-SCENARIO-RAG-WIRED-2026-05-04`) — read in full to understand the rollout-complete state and the open questions register.

Confirm at session open per cache: tier (TBD per choice); hold-point (P0 0h still active); model selection per candidate; status vocabulary; signals + risk classification.

## Part B — Procedure

### Step 1 — Founder chooses from candidate menu

The AI surfaces the menu as the first question of the session. The founder picks one (or asks for more analysis on any). Once chosen, the session adopts the appropriate template (lean for Standard/Elevated; full for Critical).

#### Candidate 1 — `/api/score-decision` loop-pattern wiring

**Scope.** Wire `/api/score-decision` under a new pattern variant ("loop pattern") not yet documented. The loop pattern is the multi-option design dimension that was separately deferred from E1–E6. Needs its own ADR (provisional name: ADR-002).

**Risk class.** Elevated under 0d-ii — changes to existing user-facing functionality. Possibly Elevated+ if the loop pattern needs new helper modules.

**Estimated time.** 3–4 hours (largest of the five candidates). Includes: ADR-002 design + draft + founder approval at session-open Step 1; wiring of the loop pattern; harness Phase I; verification; decision-log entry; close + next-session prompt.

**Why pick this.** Completes the full `/api/score-*` family wiring (every `/api/score-*` route reasoning-grounded). Brings the rollout to true completion across all design dimensions. Highest "rollout completeness" return.

**Why defer this.** Largest session; needs ADR design first. If founder wants a smaller win or has limited time, defer. Also: `/api/score-decision`'s loop pattern is a separate design problem that may benefit from external consultation or more thinking before drafting the ADR.

**ADR-002 first?** The AI proposes drafting ADR-002 in the same session as the wiring, per the E1 + E5 precedent (ADR + wiring in one session). Alternative: split — one session for ADR-002 design + approval, another for wiring. Founder's call.

#### Candidate 2 — `/api/reason/helpers.ts` shim removal

**Scope.** Delete the `/website/src/app/api/reason/helpers.ts` shim file. The shim was added during E3's Pattern S2 lift to maintain backward compatibility while consumers migrated. After E6, all rollout consumers import from `/website/src/lib/rag/helpers.ts` directly; the shim has zero remaining importers.

**Risk class.** Standard under 0d-ii — module deletion with no remaining consumers. AI verifies "zero remaining importers" via grep before deletion.

**Estimated time.** 30–60 minutes. Includes: grep verification; delete file; tsc check; small decision-log entry; close.

**Why pick this.** Smallest, cleanest session. Reduces tech debt. Removes a dead file from the codebase. Eligible since E6 by the verification chain.

**Why defer this.** Tiny win. If founder wants to make more substantive progress, this can wait — it's been deferred since E3 with no consequences.

#### Candidate 3 — `/api/score-social` route metadata fix

**Scope.** Fix the route metadata inconsistency surfaced as open question #2 in `D-SCORE-SOCIAL-RAG-WIRED-2026-05-04` (E4). The exact nature of the inconsistency is documented in that entry.

**Risk class.** Standard under 0d-ii — metadata fix; no functional change.

**Estimated time.** 30–60 minutes. Similar shape to Candidate 2.

**Why pick this.** Small, clean session. Closes a specific open question. Continuity-item resolution.

**Why defer this.** Tiny win. Same trade-off as Candidate 2.

#### Candidate 4 — SCORING call's depth-mismatch resolution on `/api/score-scenario`

**Scope.** Decide whether to change `/api/score-scenario` SCORING Layer 1 from `'quick'` to `'deep'` to align with `MODEL_DEEP`, or leave as is and document the rationale. This is open question #1 from `D-SCENARIO-RAG-WIRED-2026-05-04` (E6, this session).

**Risk class.** Standard if "leave as is and document"; Elevated if "change to 'deep'" (changes existing user-facing functionality — would shift the Layer 1 corpus tier from 6 mechanisms to 9 mechanisms on real scoring traffic).

**Estimated time.** 1–2 hours if "change to 'deep'" (includes wiring change + harness regression check at the new depth + decision-log entry + close); 30–60 minutes if "leave as is and document" (decision-log entry + close).

**Why pick this.** Resolves a specific open question from this session. Needs Phase-2 production observation data ideally — if no production data yet, the decision can be made on first principles + Stoic Brain corpus inspection.

**Why defer this.** No urgency. The route works as is. If founder wants Phase-2 production data first, defer until that data exists.

#### Candidate 5 — Move to a non-rollout Priority sequence item

**Scope.** Step out of the rollout arc and back into the project instructions' Priority sequence. Sub-candidates:

- **P0 0h hold-point continuation** — assessment work toward exit criteria (capability matrix, value demonstration, startup preparation toolkit). Per project instructions §"Priority 0: Foundations".
- **Priority 2 — Ethical safeguards (R17, R19, R20)** — vulnerable user detection (R20a), bulk profiling prevention (R17a), encryption wiring (R17b), genuine deletion endpoint (R17c), limitations page (R19c, R19d), relationship asymmetry guidance (R20d), independence encouragement (R20b). Per project instructions §"Priority 2".
- **Priority 3 — Agent Trust Layer (R18)** — certification scope language + badge component (R18a, R18b); Supabase integration; assessment endpoints; LLM wiring; interoperability (R18c); adversarial evaluation (R18d). Per project instructions §"Priority 3".

**Risk class.** Variable per sub-candidate. Some are Critical (R17b/R17c encryption + deletion; R20a + R17a architecture decisions before code per project instructions §2a + 2b).

**Estimated time.** Variable per sub-candidate. Some are multi-session (capability matrix; ethical safeguards full set).

**Why pick this.** Strategic momentum toward the larger project. The rollout-arc work was infrastructure; the Priority sequence is the actual product mission. Picking this signals "rollout is done, time to build the next thing."

**Why defer this.** None of the rollout-cleanup candidates (2, 3, 4) take long. Could resolve them quickly first to leave a fully clean rollout arc behind, then move to Priority sequence work. Also — some Priority 2 items (R20a, R17a) need ADRs before coding per project instructions; if founder wants quick wins, those aren't quick.

### Step 2 — Adopt the appropriate procedure

Once the founder picks, the session adopts the candidate-specific procedure:

- **Candidate 1:** session opens with ADR-002 design discussion. AI proposes the loop-pattern ADR; founder approves with explicit confirmations; AI implements wiring + Phase I harness; verify; decision-log; close.
- **Candidate 2:** AI greps for remaining importers of `/api/reason/helpers.ts`; if zero, deletes file + tsc check + decision-log + close. If non-zero (unlikely), surfaces the importers and discusses.
- **Candidate 3:** AI reads E4's open question #2; identifies the metadata inconsistency; proposes fix; founder approves; implements; close.
- **Candidate 4:** AI surfaces the analysis (corpus tier comparison, expected behaviour change, Phase-2 data if available); founder picks "change" or "leave as is + document"; AI implements + close.
- **Candidate 5:** AI surfaces the Priority sequence sub-candidates with risk class + estimate; founder picks one; session adopts that sub-candidate's procedure (which may be Critical-tier and require the full Critical Change Protocol).

### Step 3 — Append decision-log entry (lean form, or full if Critical)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry" (Standard/Elevated) or §"Critical-risk sessions" (Critical).

### Step 4 — Session close (lean form, or full if Critical)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close" or full.

### Step 5 — Next-session prompt

The AI writes the next-session prompt at session close per the chosen candidate's continuation logic.

## Part C — Anticipated session shape

Variable. Estimates per candidate above.

## Rollback path

Per chosen candidate. Documented at the point of decision-log entry.

## Forecast

**On clean completion of any candidate:** rollout-arc completeness improves OR Priority sequence advances. Next-next session is determined by the chosen candidate's outcome.

**Strategic note for the founder.** The rollout arc is the largest single piece of infrastructure work to date. Its completion at E6 frees attention for the Priority sequence. The five candidates above are not equally weighted — Candidates 2 + 3 are minor cleanups; Candidate 4 is a specific open-question resolution; Candidate 1 completes the rollout arc to true completion; Candidate 5 is the strategic pivot to product-mission work. The choice signals where the founder wants to invest the next chunk of session time: cleanup, completion, or pivot.

End of prompt.
