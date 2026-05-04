# Next-Session Prompt — E10: post-codification menu — pilot M1, carried-forward cleanup, or strategic pivot

**Stream:** founder.
**Tier:** TBD at session open (depends on choice — see candidate menu).
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessor session close:** `/operations/handoffs/founder/2026-05-04-sub-session-E9-close.md`.
**Predecessor decision-log entry:** `D-E9-ADR003-AC8-AND-CACHE-DRIFT-RESOLVED-2026-05-04`.
**Risk classification:** TBD at session open. Critical Change Protocol engages if M1 (pilot) is chosen and at any later migration session.

## Why this session matters

Sub-session E9 codified the depth-architecture framing. ADR-003 — Depth-as-Migration-Scaffolding for the Translation-Sandwich Architecture — is adopted. AC8 — Translation-Sandwich Architectural Constraint — is in the manifest. The migration sequence (M1 → M2 → M3 → M4 → M5) and seven retirement triggers are named.

E10 is the first post-codification session. The architectural question is closed; what remains open is when (and whether) the migration begins, and what other work — cleanup or strategic pivot — happens in the meantime. The migration is a multi-session arc; M1 alone is Critical-tier and may need its own ADR. The founder controls the timing.

## Pre-conditions

1. Founder pushed E9's seven artefacts via GitHub Desktop. Working tree clean at session open. Vercel build green confirmation post-push (no behaviour change deploys this commit; build runs but should succeed unchanged).
2. Founder ran the optional `tsc --noEmit -p .` independent verification and confirmed exit 0. Same expected as E8 — no `.ts` file touched at E9.
3. Founder ran the verification greps (`AC8 — Translation-Sandwich` in `/manifest.md`; zero `AC1–AC7` in `/adopted/`; three files in `/adopted/adr/`; empty `/drafts/adr/`). All passed cleanly.
4. Founder availability: variable per chosen candidate. M1 pilot is the longest (3–6 hours minimum, may span multiple sessions). Cleanup candidates are 30 minutes to 3 hours. Strategic pivot varies.

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier, model selection per AC1, risk class per 0d-ii, status vocabulary per 0a + 0f, signals per 0d).
2. `/operations/handoffs/founder/2026-05-04-sub-session-E9-close.md` (~5 min — predecessor close).
3. `/operations/decision-log.md` last entry (`D-E9-ADR003-AC8-AND-CACHE-DRIFT-RESOLVED-2026-05-04`) — read in full.
4. **If the founder chooses M1 (pilot):** also read `/adopted/adr/2026-05-04-depth-architecture-migration.md` (ADR-003) in full. Re-read `/manifest.md` AC8 (the new constraint) and AC1 (model selection — engages directly at M1). Re-read `/adopted/adr/2026-05-04-d6-d7-consumer-wiring.md` (ADR-001 — Pattern A1/A2 substrate) and `/adopted/adr/2026-05-04-d6-d7-loop-pattern-wiring.md` (ADR-002). Read `/website/src/lib/sage-reason-engine.ts` in full and `/website/src/app/api/reason/route.ts` in full (M1's pilot consumer). The pilot session may want a fresh ADR (ADR-004) for the layer-separated engine's interface.
5. **If the founder chooses a cleanup candidate (3, 4, or 5):** cache + predecessor close + last decision-log entry are sufficient for opening; deliverable-of-the-day reads follow per the chosen candidate's procedure.
6. **If the founder chooses Candidate 6 (strategic pivot):** cache + predecessor close + last decision-log entry are sufficient for opening; the project instructions's Priority sequence is the working reference; the chosen sub-item determines further reads.

Confirm at session open per cache: tier (TBD per choice); hold-point (P0 0h still active); model selection per AC1 row that engages; status vocabulary; signals + risk classification; AC7 + AC8 dispositions.

## Part B — Procedure

### Step 1 — Founder chooses from candidate menu

The AI surfaces the menu as the first question of the session. Three top-level paths.

**Candidate M1 — Pilot the translation-sandwich migration on `/api/reason` (ADR-003 §"Migration sequence" M1).**

Scope. Build the layer-separated engine surface on a single user-facing consumer (`/api/reason`). Layer 1 LLM extracts schema from input text; Layer 2 deterministic mechanism application in code applies all six Stoic mechanisms to the schema; Layer 3 LLM produces per-consumer prose. The pilot proves the pattern; subsequent migrations (M2–M4) generalise.

Sub-paths the founder picks at session open:

- **M1a — Full pilot in one session.** Draft ADR-004 specifying the new engine's interface, build the Layer 1 + Layer 2 + Layer 3 modules, wire `/api/reason` to use them, harness verification, founder approval. Not realistic in one session for a Critical-tier change; better as a 2–3 session arc with explicit checkpoints.
- **M1b — ADR-004 first; build later.** Draft ADR-004 only; specify the new engine's interface, fallback semantics, error handling, verification harness. Code build follows in M1c. The ADR-only session is Standard risk.
- **M1c — Pilot on a non-user-facing consumer first.** Build the layer-separated engine on a fresh `/api/internal/translate` route (mirroring Sub-session D's Candidate C). Zero user impact for the proof. Standard risk for the route addition; the existing engine remains untouched. Subsequent session promotes the proven engine to a user-facing consumer.

Risk class. M1a / M1c if user-facing: Critical under PR6-style escalation (changes the shape of an LLM call for a route in the R20a perimeter). M1b: Standard (ADR drafting only). M1c if internal-only: Standard.

Estimated time. M1a: not feasible in one session (multi-session arc). M1b: 2–4 hours. M1c: 3–5 hours for the internal-only proof.

Why pick this. The migration begins. Cost data, schema-fidelity data, and architecture-implementation lessons all accrue from M1. The longer M1 is delayed, the longer ADR-003's open questions remain unanswered.

Why defer this. M1 is Critical-tier work and needs founder bandwidth. If other Priority items (Candidate 6) are more strategic, defer M1 until they're in better shape. Or if cleanup candidates would clear the rollout-arc plate before architectural work begins, do those first.

**Candidate Cleanup — Carried-forward cleanup candidates (3, 4, or 5).**

Scope. From E8's menu, reframed at E9 through the migration lens:

- **Candidate 3 — `/api/score-scenario` SCORING depth-mismatch fix.** Holding-pattern fix per ADR-003 (stops mattering at M2 but not foreclosed). Founder's prior preference: "change to 'deep'" if executed. ~30 min – 2 hrs. Standard or Elevated risk.
- **Candidate 4 — Fault-injection testing of Pattern A1 fallback paths.** Independent of migration. Tests the wrapper's fallback branches. ~60–90 min. Standard risk.
- **Candidate 5 — HTTP-layer verification.** Independent of migration. Tests route's full request-response cycle including R20a perimeter. ~2–3 hrs. Standard risk.

Risk class. Variable per sub-candidate.

Why pick this. Closes a continuity arc; the rollout-cleanup work earlier surfaced these and they remain useful regardless of migration timing. Smallest sessions on the menu.

Why defer this. None of these are session-blocking. If the founder wants to begin the migration or pivot to Priority work, they wait.

**Candidate 6 — Strategic pivot to Priority sequence.**

Scope. Step out of rollout-cleanup and migration arcs into the project instructions' Priority sequence:

- P0 0h hold-point continuation — capability matrix, value demonstration, startup preparation toolkit.
- Priority 2 — Ethical safeguards (R17, R19, R20). Some sub-items (R20a, R17a, R17b, R17c) are Critical-tier and need ADRs before coding.
- Priority 3 — Agent Trust Layer (R18). Certification scope language + badge component; Supabase integration; assessment endpoints; LLM wiring; interoperability; adversarial evaluation.

Risk class. Variable per sub-candidate. Critical for some Priority 2 items.

Estimated time. Variable; some are multi-session arcs.

Why pick this. Strategic momentum toward the larger project mission. Independent of the migration; can run in parallel with future migration sessions.

Why defer this. None of the cleanup candidates take long. If the founder wants to clear the rollout-arc plate before strategic pivot, do cleanup first. Or if the migration is the strategic priority, M1 takes precedence.

### Step 2 — Adopt the appropriate procedure

Once the founder picks, the session adopts the candidate-specific procedure.

- **M1a / M1b / M1c**: AI drafts ADR-004 in `/drafts/adr/` (or proceeds direct-to-build for M1c if scope is small enough); founder reviews + approves; AI moves to `/adopted/adr/` if Adopted; AI builds per the ADR. Decision-log entry; close. M1's specific procedure is the founder's call at session open per the picked sub-path.
- **Candidate 3**: AI surfaces analysis (corpus tier comparison, expected behaviour, migration-lens read); founder reaffirms or revises "change to 'deep'"; AI implements + harness regression + close.
- **Candidate 4**: AI surfaces fault-injection test design (mock approaches; new harness phase vs. extension); founder approves design; AI implements; close.
- **Candidate 5**: AI surfaces HTTP-layer test design (test runner choice; coverage scope); founder approves; AI implements; close.
- **Candidate 6**: AI surfaces Priority sequence sub-candidates with risk class + estimate; founder picks; session adopts that sub-candidate's procedure (which may be Critical-tier and require the full Critical Change Protocol).

### Step 3 — Append decision-log entry

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry" (Standard / Elevated) or §"Critical-risk sessions" (Critical).

For M1 specifically: the entry should explicitly cross-reference ADR-003 §"Migration sequence" M1 + AC8 §"Any new consumer added to the codebase before scaffolding retirement (M5)…" — the new pilot consumer's relationship to AC8's binding force needs to be named.

### Step 4 — Session close

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close" (Standard/Elevated) or full (Critical).

### Step 5 — Next-session prompt

The AI writes the next-session prompt at session close per the chosen candidate's continuation logic.

## Part C — Anticipated session shape

Variable. Estimates per candidate above. Smallest is Candidate 3 leave-and-document (30–60 min); largest is full M1 build (multi-session arc).

## Rollback path

Per chosen candidate. Documented at the point of decision-log entry.

## Forecast

If M1 (any sub-path) is chosen: the migration begins. The post-pilot session decides whether to advance to M2 immediately, gather more pilot data, or pivot. Multi-session arc; ADR-003's open questions begin to be answered.

If Candidate 3 is chosen: holding-pattern fix lands; remaining cleanup candidates continue to age. Next-next session: another cleanup candidate, M1, or Candidate 6.

If Candidate 4 or 5 is chosen: rollout-arc cleanup advances; one less continuity item. Next-next session: another cleanup, M1, or Candidate 6.

If Candidate 6 is chosen: Priority sequence advances; the migration timing slips by at least one session (which may or may not matter — ADR-003 doesn't impose a deadline). Next-next session: continuation of the chosen Priority item, M1, or remaining cleanup.

**Strategic note for the founder.** The architectural codification is done. The remaining choices are about pace and order. The migration is the largest unanswered piece of the project and answering it costs multiple sessions; cleanup is small and useful but not architecturally significant; Priority pivot moves toward the broader product mission. None of the three is wrong. The right pick depends on which question — "does the migration work?", "is the rollout arc fully clean?", or "does the product serve the wider mission?" — is most pressing for the founder right now.

End of prompt.
