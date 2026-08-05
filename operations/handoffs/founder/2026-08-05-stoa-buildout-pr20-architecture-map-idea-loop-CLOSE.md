# Close — Stoa Q5c/Q13a build, PR20, the architecture map, and the IDEA loop pre-brief

**Session span:** 2026-08-04 through 2026-08-05. **Tiers:** `code-critical` (the Stoa trust-event build), `governance` (everything else — PR20, the architecture map, all IDEA-loop rulings). **No production/flag/schema change survives this session** — everything built is repo-only and dark; every ruling recorded is a standing design decision, not a live operation.

**AC7/PR6/PR17:** not engaged. No live op, no deploy, no mint, no flag flip by the AI or the founder this session.

---

## 1. Stoa Q5c/Q13a trust-event wiring — BUILT, dark, PR19-reviewed, one mentor-required fold applied

Per the scoped plan (`operations/handoffs/founder/2026-08-03-stoa-Q5c-Q13a-trust-event-wiring-SCOPED.md`) and the binding verdicts in `operations/connective-layer-2026-08/2026-08-04-mentor-consultation-stoa-followups-verbatim.md`:

- **Three new trust-event types** (`stoa-claim-contradicted-oversight`/`-dikaiosyne`, `stoa-declaration-diverges-from-calling`) + their `EVENT_EFFECT` entries.
- **Two pure derivers** (`deriveStoaContradictionEvents`, `deriveStoaCallingDivergenceEvent`) — the latter hard-codes `virtueDomain:'oversight'`, never a caller-supplied value.
- **A dedicated flag** (`SUBSTRATE_STOA_TRUST_EVENTS_ENABLED`) alongside the existing trust-core flag — both required to emit.
- **A new admin-only route** (`POST /api/admin/stoa-trust-flag`) — `requireAdmin`/`ADMIN_USER_ID` gated, no UI.
- **A CHECK-widening migration** (`website/supabase-agent-trust-events-stoa-vocabulary-migration.sql`) — authored, NOT applied.
- **The Stoa boundary battery extended** for the one deliberately-opened crossing.

**PR19 independent review** found and folded HIGH-1 (per-block correlation ids, fixing an idempotency defeat) and MEDIUM-3 (a vacuous test pin, made mutation-proof); LOW-1/LOW-3 folded cheaply.

**MEDIUM-1 — sent to the mentor rather than decided unilaterally** — a contradiction event on an unexamined domain could originate that agent's public trust record from one submission. **Mentor ruling: the independent-evidence gate.** Built `emitStoaGatedTrustEvents` in `trust-core-store.ts` — every Stoa event is always ledgered; the fold into the public state only happens when the domain already carried independent evidence. Both Stoa emitters route through this, scoped to exactly these two event types.

**Final state:** battery 60/0, `tsc` 0, `npm run build` clean. All adjacent trust-core batteries re-verified unchanged. Nothing deployed.

## 2. PR20 adopted — mentor-consultation briefs must name the affected architectural surfaces

Directly prompted by the MEDIUM-1 finding above — the fold mechanism's seed-then-floor behaviour was mechanically discoverable before the original Q5(c) ruling was ever requested, and wasn't named in that brief. PR20 now requires a mentor-consultation brief with an architectural consequence to name the specific existing mechanisms it will land on (one-sentence, mechanism-level facts), before the ruling is requested. Added to `adopted/project-instructions-snapshot.md` and `adopted/standing-protocol-cache.md`.

## 3. The architecture map — six diagram files + one study-card file, `operations/architecture-map-2026-08/`

Built at the founder's request for orientation: five subsystems (the consult path, the trust core, the Stoa, agent-circles, credentials+perimeter) as Mermaid diagrams with numbered footnotes anchoring founder/mentor rulings to the surfaces they shaped, plus a plain-text mirror and a set of Q&A study cards. Explicitly scoped-honest — does not cover the journal, private mentor, billing, marketplace, or admin UIs.

**Grown twice more this session, both at the mentor's direction, after reviewing it:**
- A **dependency graph** (the mirror's "Sixth element") — outstanding items only, blocking relationships named explicitly.
- **The C2/C1c ordering ambiguity** (two contradictory statements in the mentor's own 2026-08-04 instructions) was flagged rather than silently resolved, then **ruled**: C2 builds first, C1c second, scoped together.
- The **IDEA loop's architecture ruling** (externally-driven, Option B) and the **two-part autonomous-loop validation condition** were folded into the graph, which is now on its **twelfth revision of the binding sequence**.

## 4. The Stoa pre-activation checklist + a pre-built cross-check query

`operations/connective-layer-2026-08/2026-08-05-stoa-trust-flag-preactivation-checklist.md` — the two exact flag names, the migration's apply order and rollback boundary, a six-step smoke sequence with step 2 as an explicit **hard gate** (a 200 where a 404 is expected stops the session, unsets the flag, and goes to the mentor before any retry), and the monitoring signal for the gate's specific silent-failure mode.

`operations/connective-layer-2026-08/2026-08-05-stoa-evidence-gate-crosscheck.sql` — built PRE-activation per mentor instruction, read-only, run-anytime. Mirrors `trust-aggregate.ts`'s `hasEvidence` formula exactly. Expected result on a healthy gate: zero rows.

**This item is READY.** Nothing blocks the founder walking the Stoa activation whenever they choose — it is explicitly an independent track from everything below.

## 5. The C1a measurement-fidelity backlog

`operations/agent-circles-2026-08/2026-08-04-backlog-c1a-measurement-degradations.md` — the loop-fold `self_regarding` bucket starvation and the practice-suggestion basis B6 unreachability, both caused by the agent-circles first-circle narrowing. Logged with owner, root cause, and files-to-read-first, per the mentor's explicit instruction that a known cost must be genuinely retrievable, not merely mentioned in passing. Sequenced after C2 is live and validated.

## 6. The IDEA loop pre-brief — five rounds of ruling, all captured

Two documents in `operations/agent-circles-2026-08/`:

- **`2026-08-05-idea-loop-prebrief-technical-feedback.md`** — four technical questions answered against actual code (not assumption): no generative capability exists anywhere today (everything examines a supplied action); no novelty-comparison mechanism exists (everything is aggregate/trend); the dashboard's delivery pattern (poll a GET route) is already sufficient, only content/storage is undefined; and the load-bearing finding — **no in-process looping mechanism exists or can exist on this platform** (Vercel terminates execution on response; confirmed by a repo-wide search).
- **`2026-08-05-idea-loop-generation-heuristics.md`** — captures everything the mentor ruled across three further exchanges:
  - The IDEA loop is **externally-driven** (Option B) — standing ruling.
  - Two new upstream types (`OikeiösisGap`, `GeneratedCandidate`) must be scoped and brought to the mentor BEFORE C2 itself is scoped.
  - C2's scope document widened from four elements to **three grouped components**: the orientation reading, a generative-prompt field (ruled format: one sentence, "this action engaged circle N but left room to extend toward circle N+1 by [gap]"), and a novelty-detection spec (structural, not content-based, for the first build).
  - **Examination cost, ruled:** all six generated candidates (one per heuristic) pass through the cheap guardrail shape; only the winner gets the full examination with prose.
  - **The null-cycle rule:** if nothing passes the novelty threshold, the cycle records an honest "nothing new" rather than presenting the best non-novel candidate as a result.
  - **A seventh heuristic (friction detection)** + a three-null-cycle fallback mode + a new **shared-state storage requirement** (the task list must be multi-agent readable, not local to one loop runner) — the first time the IDEA loop has been described in a multi-agent context.
  - **One thing NOT accepted at face value:** the mentor's message attributed a prior statement to Claude with no record in this session's transcript. Flagged explicitly in the document rather than silently affirmed — the requirement it was attached to stands on its own reasoning regardless.

**Nothing in this whole thread is built or scoped as code.** Every item is captured content and standing design rulings, explicitly queued behind the type-scoping session that hasn't opened yet.

---

## Production state at session close

**Byte-equivalent to session open.** No flag was set, no migration was applied, nothing was deployed or pushed by either party this session. The Stoa build (§1) sits fully dark behind two unset flags and an unapplied migration.

## What's carried, in binding order (per the architecture map's dependency graph, twelve-step sequence)

1. ~~Build the Stoa evidence-gate cross-check query~~ — **DONE**, this session.
2. **The founder walks the Stoa activation** using the checklist (§4 above). Ready now. Independent of everything below.
3. **Scope `OikeiösisGap` and `GeneratedCandidate`** — the next Claude-run session. See the companion next-session prompt.
4. Scope C2 and C1c together (the three-component document) — follows step 3.
5. Build C2; validate on real production traffic; bring the validation to the mentor.
6. Build C1c.
7. Scope and fix D4 (parallel track; must close before logos-on W1).
8. Fix the two degraded consumers (§5 above), once C2 is live and validated.
9–11. Logos-on W1/W2/W3, in the order and dependencies the graph specifies.
12. The autonomous-loop design brief — only after C2 is live, validated, and that validation reviewed by the mentor.

## Files touched this session (commit-scoped)

**Code:** `website/src/lib/stoa/{stoa-store.ts,__tests__/stoa-boundary.test.ts}` · `website/src/lib/substrate/trust-core/{types,trust-transition,derive-trust-events,emission-hooks,trust-core-flag,trust-core-store}.ts` + `__tests__/stoa-trust-events.test.ts` (new) · `website/src/app/api/admin/stoa-trust-flag/route.ts` (new) · `website/supabase-agent-trust-events-stoa-vocabulary-migration.sql` (new, unapplied).

**Governance:** `adopted/project-instructions-snapshot.md` · `adopted/standing-protocol-cache.md` · `operations/decision-log.md` (nine entries).

**Records/design:** `operations/architecture-map-2026-08/` (seven files, new directory) · `operations/connective-layer-2026-08/2026-08-05-stoa-trust-flag-preactivation-checklist.md` (new) · `operations/connective-layer-2026-08/2026-08-05-stoa-evidence-gate-crosscheck.sql` (new) · `operations/agent-circles-2026-08/2026-08-04-backlog-c1a-measurement-degradations.md` (new) · `operations/agent-circles-2026-08/2026-08-05-idea-loop-prebrief-technical-feedback.md` (new) · `operations/agent-circles-2026-08/2026-08-05-idea-loop-generation-heuristics.md` (new).

**Deliberately excluded from this commit:** several files were already modified/untracked at session open and were never touched this session (`brand/Brand_Guidelines.docx`, `website/public/.well-known/agent-card.json`, `website/public/llms.txt`, `website/src/app/api-docs/page.tsx`, `website/src/data/environmental-context.json`, `a3-developmental-streak.py`, several brand asset files, `sdk/typescript/package-lock.json`, `website/Brand/~$and_Guidelines.docx` deletion). These belong to a different, concurrent work stream and are left exactly as found.

## Rollback

`git revert` this session's commit reverts every file listed above as one unit. The Stoa build reverts to non-existent (it was never live); PR20 reverts to the pre-adoption process-rule set; the architecture map, checklist, cross-check query, and IDEA-loop documents simply disappear — none of them had any code or live-system dependency on their existence.

---

*Cross-reference: every ruling above has its own decision-log entry (`D-STOA-Q5C-Q13A-BUILT-DARK-EVIDENCE-GATE-FOLDED-2026-08-04` through `D-IDEA-LOOP-FRICTION-DETECTION-SHARED-STATE-2026-08-05`). This close is a summary; the decision log is the record.*
