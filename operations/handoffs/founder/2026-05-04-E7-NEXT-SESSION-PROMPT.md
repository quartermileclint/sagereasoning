# Next-Session Prompt — E8: founder's choice from candidate menu

**Stream:** founder. **Tier:** TBD at session open (depends on choice). **Governing frame:** `/adopted/standing-protocol-cache.md`. **Predecessor session close:** `/operations/handoffs/founder/2026-05-04-sub-session-E7-close.md`. **Predecessor decision-log entry:** `D-DECISION-RAG-WIRED-2026-05-04`. **Risk classification:** TBD at session open. Critical Change Protocol engages only if the founder picks a Critical-tier candidate (some sub-paths of Candidate 6).

## Why this session matters

The PR1 rollout arc for the `/api/score-*` family is now complete across all three design dimensions (depth × pattern × loop) at E7. Eight rollout consumers Verified-in-place: 1 internal (Candidate C `/api/internal/retrieve`) + 4 Pattern A2 user-facing (`/api/reason`, `/api/score`, `/api/score-conversation`, `/api/score-social`) + 3 Pattern A1 user-facing (`/api/score-document`, `/api/score-scenario`, `/api/score-decision`). Pattern A1's α loop pattern proven on first user-facing surface (ADR-002 adopted at E7).

The next session is not another consumer wiring in the same arc. The work the rollout enabled is now complete. Six candidate directions exist — three rollout-cleanup candidates carried forward from earlier sessions, two new candidates surfaced by E5–E7's continuity findings, and one strategic-pivot candidate. The founder chooses at session open.

## Pre-conditions

1. Founder pushed E7's six artefacts via GitHub Desktop. Working tree clean at session open. Vercel green confirmation post-push.
2. Founder ran the E7 harness independently and confirmed `SUMMARY: 171 / 171 checks passed`.
3. Founder availability: variable — depends on candidate (estimates per candidate below).

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier, model selection, risk class, signals).
2. `/operations/handoffs/founder/2026-05-04-sub-session-E7-close.md` (~5 min — predecessor close).
3. `/operations/decision-log.md` last entry (`D-DECISION-RAG-WIRED-2026-05-04`) — read in full to understand the rollout-complete state and the open questions register.

Confirm at session open per cache: tier (TBD per choice); hold-point (P0 0h still active); model selection per candidate; status vocabulary; signals + risk classification.

## Part B — Procedure

### Step 1 — Founder chooses from candidate menu

The AI surfaces the menu as the first question of the session. The founder picks one (or asks for more analysis on any). Once chosen, the session adopts the appropriate template (lean for Standard/Elevated; full for Critical).

#### Candidate 1 — `/api/reason/helpers.ts` shim removal

**Scope.** Delete the `/website/src/app/api/reason/helpers.ts` shim file. The shim was added during E3's Pattern S2 lift to maintain backward compatibility while consumers migrated. After E7, all rollout consumers import from `/website/src/lib/rag/helpers.ts` directly; the shim has zero remaining importers.

**Risk class.** Standard under 0d-ii — module deletion with no remaining consumers. AI verifies "zero remaining importers" via grep before deletion.

**Estimated time.** 30–60 minutes. Includes: grep verification; delete file; tsc check; small decision-log entry; close.

**Why pick this.** Smallest, cleanest session. Reduces tech debt. Removes a dead file from the codebase. Eligible since E3 by the verification chain.

**Why defer this.** Tiny win. If founder wants to make more substantive progress, this can wait.

#### Candidate 2 — `/api/score-social` route metadata fix

**Scope.** Fix the route metadata inconsistency surfaced as open question #2 in `D-SCORE-SOCIAL-RAG-WIRED-2026-05-04` (E4). The exact nature of the inconsistency is documented in that entry.

**Risk class.** Standard under 0d-ii — metadata fix; no functional change.

**Estimated time.** 30–60 minutes. Similar shape to Candidate 1.

**Why pick this.** Small, clean session. Closes a specific open question. Continuity-item resolution.

**Why defer this.** Tiny win. Same trade-off as Candidate 1.

#### Candidate 3 — `/api/score-scenario` SCORING depth-mismatch resolution

**Scope.** Decide whether to change `/api/score-scenario` SCORING Layer 1 from `'quick'` to `'deep'` to align with `MODEL_DEEP`, or leave as is and document the rationale. This is open question #1 from `D-SCENARIO-RAG-WIRED-2026-05-04` (E6).

**Risk class.** Standard if "leave as is and document"; Elevated if "change to 'deep'" (changes existing user-facing functionality — would shift the Layer 1 corpus tier from 6 mechanisms to 9 mechanisms on real scoring traffic).

**Estimated time.** 1–2 hours if "change to 'deep'" (includes wiring change + harness regression check at the new depth + decision-log entry + close); 30–60 minutes if "leave as is and document" (decision-log entry + close).

**Why pick this.** Resolves a specific open question carried forward from E6. Needs Phase-2 production observation data ideally — if no production data yet, the decision can be made on first principles + Stoic Brain corpus inspection.

**Why defer this.** No urgency. The route works as is. If founder wants Phase-2 production data first, defer until that data exists.

#### Candidate 4 — Fault-injection testing of Pattern A1 fallback paths (NEW at E7)

**Scope.** The Pattern A1 fallback runtime path is not exercised by the harness (continuity from G2 + H2 + I2). The wrapper's `try { … } catch (err) { … }` branches and the empty-result guard fire only on actual D6/D7 failure, which is unreachable from the harness's success-path fixtures. Add a fault-injection test that simulates retrieval failure and verifies the wrapper falls back to `getStoicBrainContext(depth)` (the compiled-string path) without throwing.

**Risk class.** Standard under 0d-ii — additive test code; no edit to wrapper or any consumer.

**Estimated time.** 60–90 minutes. Includes: design fault-injection approach (mock D6 to throw, mock D6 to return empty, etc.); add new harness Phase J or extension to existing phases; verify; decision-log; close.

**Why pick this.** Closes a continuity finding from E5 + E6 + E7. Provides evidence that the fallback runtime path is correct rather than relying on inference. Gives Phase-2 production debugging a known-good fallback signature to compare against.

**Why defer this.** Lower priority than rollout-cleanup if production has not surfaced any fallback-path issues. The success path is the dominant path; the fallback path is the safety net.

#### Candidate 5 — HTTP-layer verification

**Scope.** Continuity item from D + E1–E7. Script-based verification proves the wiring at the function-call boundary; HTTP-layer verification would test the route's full request-response cycle including auth, rate-limit, JSON parsing, R20a distress check, response envelope, and CORS. Could be added as a separate test suite (e.g., `verify-routes-http.ts`) or integrated into `verify-reason-rag.ts`.

**Risk class.** Standard under 0d-ii — additive test code.

**Estimated time.** 2–3 hours minimum. Includes: design HTTP-layer test approach (start dev server? hit deployed Vercel? mock NextRequest?); add tests for at least one user-facing consumer; verify; decision-log; close. Likely larger session if all consumers tested.

**Why pick this.** Catches integration bugs that script-based testing cannot reach. R20a distress-check on the route is a safety perimeter that has never been HTTP-tested.

**Why defer this.** Larger session shape; better suited for a focused session than as a continuity-cleanup. Can also wait for Phase-2 production observability instead of pre-launch HTTP testing.

#### Candidate 6 — Move to a non-rollout Priority sequence item

**Scope.** Step out of the rollout arc and back into the project instructions' Priority sequence. Sub-candidates:

- **P0 0h hold-point continuation** — assessment work toward exit criteria (capability matrix, value demonstration, startup preparation toolkit). Per project instructions §"Priority 0: Foundations".
- **Priority 2 — Ethical safeguards (R17, R19, R20)** — vulnerable user detection (R20a), bulk profiling prevention (R17a), encryption wiring (R17b), genuine deletion endpoint (R17c), limitations page (R19c, R19d), relationship asymmetry guidance (R20d), independence encouragement (R20b). Per project instructions §"Priority 2".
- **Priority 3 — Agent Trust Layer (R18)** — certification scope language + badge component (R18a, R18b); Supabase integration; assessment endpoints; LLM wiring; interoperability (R18c); adversarial evaluation (R18d). Per project instructions §"Priority 3".

**Risk class.** Variable per sub-candidate. Some are Critical (R17b/R17c encryption + deletion; R20a + R17a architecture decisions before code per project instructions §2a + 2b).

**Estimated time.** Variable per sub-candidate. Some are multi-session (capability matrix; ethical safeguards full set).

**Why pick this.** Strategic momentum toward the larger project. The rollout-arc work was infrastructure; the Priority sequence is the actual product mission. Picking this signals "rollout is done, time to build the next thing."

**Why defer this.** None of the rollout-cleanup candidates (1, 2, 3, 4) take long. Could resolve them quickly first to leave a fully clean rollout arc behind, then move to Priority sequence work. Also — some Priority 2 items (R20a, R17a) need ADRs before coding per project instructions; if founder wants quick wins, those aren't quick.

### Step 2 — Adopt the appropriate procedure

Once the founder picks, the session adopts the candidate-specific procedure:

- **Candidate 1:** AI greps for remaining importers of `/api/reason/helpers.ts`; if zero, deletes file + tsc check + decision-log + close. If non-zero (unlikely), surfaces the importers and discusses.
- **Candidate 2:** AI reads E4's open question #2; identifies the metadata inconsistency; proposes fix; founder approves; implements; close.
- **Candidate 3:** AI surfaces the analysis (corpus tier comparison, expected behaviour change, Phase-2 data if available); founder picks "change" or "leave as is + document"; AI implements + close.
- **Candidate 4:** AI surfaces fault-injection test design (mock approaches; new Phase J vs extension to existing phases); founder approves design; AI implements; close.
- **Candidate 5:** AI surfaces HTTP-layer test design (test runner choice; coverage scope); founder approves design; AI implements; close.
- **Candidate 6:** AI surfaces the Priority sequence sub-candidates with risk class + estimate; founder picks one; session adopts that sub-candidate's procedure (which may be Critical-tier and require the full Critical Change Protocol).

### Step 3 — Append decision-log entry (lean form, or full if Critical)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry" (Standard/Elevated) or §"Critical-risk sessions" (Critical).

### Step 4 — Session close (lean form, or full if Critical)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close" or full.

### Step 5 — Next-session prompt

The AI writes the next-session prompt at session close per the chosen candidate's continuation logic.

## Part C — Anticipated session shape

Variable. Estimates per candidate above. Smallest candidates (1, 2) are 30–60 minutes; medium (3, 4) are 1–2 hours; larger (5) is 2–3 hours; Candidate 6 varies by sub-candidate.

## Rollback path

Per chosen candidate. Documented at the point of decision-log entry.

## Forecast

On clean completion of any candidate: rollout-arc cleanup advances OR Priority sequence advances. Next-next session is determined by the chosen candidate's outcome. After all four cleanup candidates (1, 2, 3, 4) are resolved, the rollout arc is fully clean; Candidate 5 (HTTP-layer) is the last pre-launch verification gap; Candidate 6 is the strategic pivot to product-mission work.

**Strategic note for the founder.** The rollout arc is now infrastructure-complete. The four small candidates (1–4) are eligible-now items that have accumulated through E3–E7; resolving them clears the continuity register. Candidate 5 (HTTP-layer) is a genuinely new piece of work — a test surface that has been deferred since Sub-session D. Candidate 6 is the largest strategic pivot. The choice signals where the founder wants to invest the next chunk of session time: cleanup (1, 2, 3 — quickest), evidence-building (4, 5 — medium), or pivot (6 — largest).

End of prompt.
