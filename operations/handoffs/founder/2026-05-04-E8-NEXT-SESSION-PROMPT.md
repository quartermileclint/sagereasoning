# Next-Session Prompt — E9: depth-architecture migration as headline; founder's choice from re-cast candidate menu

**Stream:** founder.
**Tier:** TBD at session open (depends on choice — see candidate menu).
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessor session close:** `/operations/handoffs/founder/2026-05-04-sub-session-E8-close.md`.
**Predecessor decision-log entry:** `D-E8-CLEANUP-AND-DEPTH-FRAMING-2026-05-04`.
**Risk classification:** TBD at session open. Critical Change Protocol engages only if a candidate sub-path turns Critical (some Priority 2 sub-paths in Candidate 6).

## Why this session matters

Sub-session E8 closed two carried-forward cleanup items (`/api/reason/helpers.ts` shim deletion and `/api/score-social` metadata honesty fix) and **captured a framing decision that reshapes the project's architectural roadmap**: depth tiers (`'quick' | 'standard' | 'deep'`) are migration scaffolding for the translation-sandwich architecture, not a primitive. The reasoning middle is meant to be deterministic; once all consumers operate under the new system, depth-as-LLM-reasoning-tier has no job and can be retired. Depth tiers persist today only as scaffolding for the period when not all consumers have moved to the new architecture. This framing was adopted as session insight in `D-E8-CLEANUP-AND-DEPTH-FRAMING-2026-05-04` section (3) but explicitly NOT promoted to a binding architectural constraint (no AC8 added) or ADR. Promotion to a binding rule wants its own session with the manifest in front and a migration plan sketched.

E9 is the first session positioned to take that next step — or to defer it and execute one of the carried-forward cleanup candidates from E7's menu. The founder chooses at session open.

## Pre-conditions

1. Founder pushed E8's five artefacts via GitHub Desktop. Working tree clean at session open. Vercel green confirmation post-push (or note any failure for early-session triage).
2. Founder ran the optional `tsc --noEmit -p .` independent verification and confirmed exit 0. The full RAG harness (`verify-reason-rag.ts`, 171 checks) is unchanged at E8 and should still pass at 171/171 if re-run (E8 touched no RAG wiring or harness phase).
3. Founder availability: variable — depends on candidate (estimates per candidate below).

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier, model selection per AC1, risk class per 0d-ii, status vocabulary per 0a + 0f, signals per 0d).
2. `/operations/handoffs/founder/2026-05-04-sub-session-E8-close.md` (~5 min — predecessor close).
3. `/operations/decision-log.md` last entry (`D-E8-CLEANUP-AND-DEPTH-FRAMING-2026-05-04`) — read in full to understand both the cleanup items and the architectural framing in section (3).
4. If the founder chooses the **depth-architecture migration** candidate: also read `/manifest.md` (R0–R20, AC1–AC7, KG1–KG7) in full, plus `/adopted/adr/2026-05-04-d6-d7-consumer-wiring.md` (ADR-001) and `/adopted/adr/2026-05-04-d6-d7-loop-pattern-wiring.md` (ADR-002). The migration question may want AC8 + an ADR-003.
5. If the founder chooses any other candidate: cache + predecessor close + last decision-log entry are sufficient for opening; deliverable-of-the-day reads follow per the chosen candidate's procedure.

Confirm at session open per cache: tier (TBD per choice); hold-point (P0 0h still active); model selection per AC1 row that engages; status vocabulary; signals + risk classification.

## Part B — Procedure

### Step 1 — Founder chooses from candidate menu

The AI surfaces the menu as the first question of the session. The founder picks one (or asks for more analysis on any). Once chosen, the session adopts the appropriate template form (lean for Standard/Elevated; full for Critical).

#### Candidate H — Depth-architecture migration (NEW at E9; the headline)

**Scope.** Take the framing captured in `D-E8-CLEANUP-AND-DEPTH-FRAMING-2026-05-04` section (3) and decide what to do with it. Sub-paths:

- **H1 — Promote to ADR-003.** Draft an ADR specifying the translation-sandwich architecture as the target state, name the migration sequence (which consumers move first, what triggers retirement of depth tiers), and propose AC8 if appropriate. The ADR is a *plan*, not the migration itself; building the migration is downstream sessions.
- **H2 — Stress-test the framing first.** Pull more evidence before codifying: read the full system prompts (`QUICK/STANDARD/DEEP_SYSTEM_PROMPT` in `sage-reason-engine.ts`); audit every route's depth choice with a "principled or convenient" classification; gather what data exists on output-quality and cost differentials. Decision-log entry captures the analysis; ADR follows in a later session if the framing survives.
- **H3 — Defer further; execute a cleanup candidate this session, return to H later.** The framing remains captured as session insight; cleanup work continues; H is revisited at E10+.

**Risk class.** Standard for H1 (additive ADR draft) or H2 (analysis document; no code change). H3 inherits the chosen cleanup candidate's risk class.

**Estimated time.** H1: 2–3 hours (ADR draft + founder review + adoption). H2: 1.5–2 hours (analysis + decision-log entry). H3: per chosen cleanup candidate.

**Why pick this.** The framing is the largest live decision in the project right now. Codifying it (or stress-testing it) shapes everything downstream — every route's depth choice, every decision about Pattern A1/A2 wiring, the migration sequence to translation-sandwich.

**Why defer this.** If migration timing is already clear in the founder's mind, codifying may be premature; let the framing season as session insight while cleanup work continues. Or if Priority 2 / Priority 3 work (Candidate 6) is more urgent strategically.

#### Candidate 3 — `/api/score-scenario` SCORING depth-mismatch resolution

**Scope.** Open question #1 from `D-SCENARIO-RAG-WIRED-2026-05-04` (E6). SCORING uses `MODEL_DEEP` (Sonnet) but Layer 1 corpus tier is `'quick'` (6 mechanisms). Two readings: (a) intentional design; (b) drift from a model upgrade where Layer 1 depth was never reconciled. Founder's stated preference at E8 open: "change to 'deep'" (Elevated risk; aligns Layer 1 with model). Under the depth-as-migration-scaffolding framing this becomes a holding-pattern fix — moot post-migration, but worth doing if migration is far.

**Risk class.** Standard if "leave as is and document"; Elevated if "change to 'deep'".

**Estimated time.** 1–2 hours if "change to 'deep'" (wiring change at SCORING call site + harness regression at new depth + decision-log + close); 30–60 minutes if "leave as is and document".

**Why pick this.** Closes a specific E6 open question; honours the founder's directional preference; makes today's state internally consistent while migration is incomplete.

**Why defer this.** Moot post-migration. If H1 is chosen and migration is sketched as imminent, this work may be wasted.

#### Candidate 4 — Fault-injection testing of Pattern A1 fallback paths

**Scope.** Continuity from G2 (E5) + H2 (E6) + I2 (E7). Pattern A1's fallback runtime path (the `try { … } catch (err) { … }` branches in `loadLayer1BlockWithFallback` plus the empty-result guard) is not exercised by the harness — those branches fire only on actual D6/D7 retrieval failure. Add a fault-injection test that simulates retrieval failure and verifies the wrapper falls back to `getStoicBrainContext(depth)` without throwing.

**Risk class.** Standard under 0d-ii (additive test code; no edit to wrapper or any consumer).

**Estimated time.** 60–90 minutes.

**Why pick this.** Closes a continuity finding from three predecessor sessions. Provides evidence that the fallback path is correct rather than relying on inference. Independent of the depth-architecture question — useful regardless of migration.

**Why defer this.** Lower priority than rollout-cleanup if production has not surfaced any fallback-path issues.

#### Candidate 5 — HTTP-layer verification

**Scope.** Continuity from D + E1–E7. Script-based verification proves the wiring at the function-call boundary; HTTP-layer verification would test the route's full request-response cycle (auth, rate-limit, JSON parsing, R20a distress-check, response envelope, CORS).

**Risk class.** Standard under 0d-ii (additive test code).

**Estimated time.** 2–3 hours minimum.

**Why pick this.** Catches integration bugs that script-based testing cannot reach. R20a distress-check on the route is a safety perimeter that has never been HTTP-tested. Independent of the depth-architecture question.

**Why defer this.** Larger session shape; better suited for a focused session than as a continuity-cleanup.

#### Candidate 6 — Move to a non-rollout Priority sequence item

**Scope.** Step out of the rollout-cleanup arc and into the project instructions' Priority sequence:

- P0 0h hold-point continuation — capability matrix, value demonstration, startup preparation toolkit (per project instructions §"Priority 0: Foundations").
- Priority 2 — Ethical safeguards (R17, R19, R20). Some sub-items (R20a, R17a, R17b, R17c) are Critical-tier and need ADRs before coding (project instructions §2a + §2b).
- Priority 3 — Agent Trust Layer (R18). Certification scope language + badge component; Supabase integration; assessment endpoints; LLM wiring; interoperability; adversarial evaluation.

**Risk class.** Variable per sub-candidate. Critical for some Priority 2 items.

**Estimated time.** Variable; some are multi-session.

**Why pick this.** Strategic momentum toward the larger project mission. Independent of the depth-architecture question.

**Why defer this.** None of the cleanup candidates (3, 4, 5) takes long. Could resolve them quickly first to leave a fully clean rollout arc behind, then move to Priority sequence work.

### Step 2 — Adopt the appropriate procedure

Once the founder picks, the session adopts the candidate-specific procedure:

- **Candidate H1:** AI drafts ADR-003 in `/drafts/adr/`; founder reviews + approves; AI moves to `/adopted/adr/`; AI proposes AC8 wording for the manifest if appropriate (founder approves before any manifest edit per project instructions's "Never edit strategic or governing documents without my explicit approval"); decision-log entry; close.
- **Candidate H2:** AI produces depth-architecture analysis (system prompts side-by-side + per-route audit + cost notes + decision-log archaeology). Saves to `/reference/` as a research artefact (Standard risk; additive file). Decision-log entry captures the findings. ADR follows in a later session if the framing survives.
- **Candidate H3:** AI confirms the framing is held as session insight; founder picks a cleanup candidate from 3/4/5/6; session proceeds per that candidate's procedure.
- **Candidate 3:** AI surfaces the analysis (corpus tier comparison, expected behaviour change, migration-lens read); founder reaffirms or revises the "change to 'deep'" disposition; AI implements + harness regression + close.
- **Candidate 4:** AI surfaces fault-injection test design (mock approaches; new harness phase vs. extension to existing phases); founder approves design; AI implements; close.
- **Candidate 5:** AI surfaces HTTP-layer test design (test runner choice; coverage scope); founder approves; AI implements; close.
- **Candidate 6:** AI surfaces the Priority sequence sub-candidates with risk class + estimate; founder picks one; session adopts that sub-candidate's procedure (which may be Critical-tier and require the full Critical Change Protocol).

### Step 3 — Append decision-log entry

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry" (Standard/Elevated) or §"Critical-risk sessions" (Critical).

For Candidate H1 specifically: the entry should explicitly cross-reference `D-E8-CLEANUP-AND-DEPTH-FRAMING-2026-05-04` section (3) as the framing's origin and document the promotion to ADR-003 (and AC8 if appropriate).

### Step 4 — Session close

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close" or full.

### Step 5 — Next-session prompt

The AI writes the next-session prompt at session close per the chosen candidate's continuation logic.

## Part C — Anticipated session shape

Variable. Estimates per candidate above. Smallest cleanup candidates (3 in "leave as is" mode) are 30–60 minutes; medium (3 in "change" mode, 4) are 1–2 hours; H1 / H2 / 5 are 2–3 hours; Candidate 6 varies by sub-candidate.

## Rollback path

Per chosen candidate. Documented at the point of decision-log entry.

## Forecast

If Candidate H1 is chosen: ADR-003 adopted; AC8 proposed (or deferred to a future amendment session); the depth-architecture migration becomes a planned multi-session arc. Next-next session: first migration step on a chosen consumer.

If Candidate H2 is chosen: depth-architecture analysis exists as a research artefact in `/reference/`; ADR follows in a later session if the framing survives stress-testing. Next-next session: ADR-003 if framing holds.

If Candidate 3, 4, or 5 is chosen: that cleanup item is closed; remaining candidates continue to age. Next-next session: another cleanup candidate or H/6.

If Candidate 6 is chosen: Priority sequence advances; the depth-architecture framing remains as session insight, picked up at a later session. Next-next session: continuation of the chosen Priority item or H.

**Strategic note for the founder.** The depth-architecture framing is the biggest live decision in the project right now. The cleanup candidates (3, 4, 5) are continuity-arc items that can wait or be resolved opportunistically. Candidate 6 is the strategic pivot to product-mission work and is independent of the depth question. The choice signals where the next chunk of session time invests: architectural codification (H1), architectural stress-testing (H2), targeted cleanup (3/4/5), or strategic pivot (6). The framing has been captured; further work can wait without it being lost.

End of prompt.
