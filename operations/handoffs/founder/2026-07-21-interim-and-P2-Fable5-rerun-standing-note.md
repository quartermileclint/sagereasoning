# Next-Session Prompt — Interim work (until Fable 5 returns) + standing note: P2 Fable-5 repeat on Saturday

**Context:** the P2 bare-vs-harnessed benchmark (spec-freeze → leg A → leg B → verdict) ran to completion 2026-07-20/21, but **both legs executed under Sonnet 5 at low reasoning effort due to a token/usage limit — not Fable 5**, the model both the frozen spec (`2026-07-20-P2-spec-freeze.md` §2) and the program plan (`agent-org-and-evidence-build-plan.md` §3-P2) name specifically to hold the model-tier variable constant against the 2026-06-11 precedent. This was caught and disclosed the same day (erratum added to the verdict memo, the session close, and the decision-log entry — see `operations/agent-org-2026-07/runs/verdict-memo-2026-07-21.md`'s erratum section for the full reasoning). **The P2 arc is not closed; a repeat under Fable 5 is required before the "no benefit" result can be treated as a settled, model-controlled comparison point.**

**Fable 5 is unavailable until Saturday 2026-07-25, 08:00.** This prompt covers two things: (1) what to do in the interim, so the wait isn't dead time; (2) the standing instruction to return to the P2 repeat once Fable 5 is back.

---

## STANDING NOTE — read this first at every session open between now and Saturday

**Do not attempt the P2 repeat before 2026-07-25, 08:00.** If a session opens before then and has spare capacity, or if Fable 5 becomes selectable earlier than expected, confirm it is genuinely Fable 5 (not a fallback) before starting — the same silent-substitution risk that caused this erratum could recur. Once Fable 5 is confirmed available, the P2 repeat (below, "THE SATURDAY TASK") takes priority over the interim work queued here, if both are live at once.

---

## Interim task (until Saturday): P1 — Agent-roster review + sole-founder gap analysis

**Why this one:** it's the AO program's own root session (`agent-org-and-evidence-build-plan.md` §3-P1), tiered `governance` (read-only, documents out — no live credential/production risk while attention is split across two threads), sized at one session, has **no dependency** and is explicitly parallel-safe with P0/P2, and it directly closes the one remaining open item on the go-live checklist (Section D — support-inbox monitoring, incident/rollback ownership — was routed here, not built, per the P-GL close). It is real, load-bearing work, not a filler task.

**Scope (from the plan, §3-P1):**
- Review the five Sage agents (mentor, support, tech, growth, ops) from a sole-founder go-live perspective.
- Verified inputs to read: `operations/SageReasoning_Support_Agent_Manual.docx`, `operations/Support_Agent_Implementation_Plan.md`, `operations/inter-agent-handoff-protocol.md`, the `sage-wiring-fix` channel-gap maps, the users' guide, the component registry.
- Gap candidates to examine (not pre-conclusions): legal/compliance ownership (lawyer-engagement items — FPE-5 TOS/liability, R17 privacy, the R18e Article-50 placeholder); finance/billing ops (Stripe `not_configured` — who owns activation/reconciliation?); security-ops/incident response (the 2026-07-17 credential-exposure incident had no named owner — key rotation, exposure sweeps, revocation drills); marketing-vs-growth separation; customer-support depth vs. the manual's current scope; data-rights/DPO-adjacent ownership (the R17 surfaces exist — who operates them?).
- Fold in the 9 named ORG_DECISION items from the 2026-07-19 launch-feedback reconciliation with a named-owner recommendation each: **#12 human-escalation owner · #21 rollback/incident owner (the unassigned 2026-07-17 incident) · #11 who monitors support@ · #27 support-analytics/SLA tooling · #15 email vendor · #22 migration-management tooling · #25 content workflow · #26 competitive-scan cadence · #18 session-continuity design question.**
- Load the current build-state ledger FIRST, before writing anything — the reconciliation's own meta-finding was that prior role-agent feedback went stale precisely because it ran without this; don't repeat that class of error here.
- One folded rider, per the plan's discipline of one rider per close: a light R18 claims-vs-code audit of the three public surfaces (`llms.txt`, `agent-card.json`, api-docs) under the go-live lens — findings feed the gap map, not immediate edits.

**Deliverables:** the gap map; recommended roster changes (add/merge/re-scope); a ranked order for P4 (which agent gets a harnessed identity first, and why); election E1 surfaced for the founder (per-agent operating surface — Claude Code loop + Gate-1 harness, website runtime channels, or Cowork — not decided in this session, only surfaced).

**Risk classification:** `governance`, read-only, no live op. Safe to run without founder-walked steps.

---

## THE SATURDAY TASK — P2 repeat under Fable 5 (do not start before 2026-07-25, 08:00)

Once Fable 5 is confirmed genuinely available:

1. **Re-confirm the build-state precondition live** (the same two-command check both prior P2 sessions ran — `curl .../api/health` + `git log origin/main -1` + the self-circle/loop-fold ancestry grep). State changes; do not cite this prompt's date as still-current.
2. **Decide scope: full re-run (new scenarios) vs. repeat-with-same-scenarios.** Recommendation: the three existing sealed scenario briefs (`operations/agent-org-2026-07/runs/2026-07-20-bare/brief-S1/S2/S3-*.md`) are now **contaminated for a bare run** — this session's leg A already saw them. Author fresh scenario sketches (or at minimum fresh brief text against the same three mechanism-classes: justice-floor, self-report-corroboration, general-task) before running a new bare leg. Reuse the S6 §2.4 sealed-sweep discipline (author ≠ sweep-reviewer) exactly as before.
3. **Fold in the S2 scenario-design finding from this erratum'd run** (`verdict-memo-2026-07-21.md`, task-fit finding 4): S2's brief needs the self-report claim asserted as *settled fact in the actual output artifact being gated* (e.g. the board note itself says "reviewed and cleared" as fact), not narrated as an open internal question in the consult input — the prior run's phrasing let the engine's native dikaiosyne floor do the catching instead of cleanly exercising the corroboration check's specific self-report-vs-text mechanism.
4. **Run leg A (bare) in a genuinely clean scratch context, under Fable 5, at full/normal reasoning effort** (not capped) — confirm and log the model + effort setting explicitly in the metrics file this time; that field was missing from both prior runs' metrics files and its absence is exactly what let this deviation go undetected until now.
5. **Close leg A's session before opening leg B** — no shared context, per the standing no-contamination guard.
6. **Run leg B (harnessed) under Fable 5**, same protocol as before: consult at each decision point, guardrail before the consequential action, close with a Sage Assent accreditation write. Founder-walked credential mint/revoke (PR17) — no admin JWT exists in any repo env file by design; use `website/scripts/mint-credential.ts mint api` (NOT `install`) for the consult/guardrail credential (a real error made in the 2026-07-20/21 run — avoid repeating it), and ensure the `agent_id` used is K1-canonical (`namespace:name@version`) from the first mint (the second real error made — avoid repeating it too).
7. **Score against fresh sealed keys, build the incorporation log, compare to the (now-caveated) Sonnet-5-low-effort run and to the 2026-06-11 predecessor**, and write a new verdict memo that explicitly states which model/effort ran and treats this as the first cleanly model-controlled repeat since 2026-06-11.
8. **Revoke both credentials at close; confirm.** The accreditation record may again be left standing as a genuine artifact (per the prior close's precedent) unless the founder elects otherwise.
9. **Update the decision log and the erratum'd 2026-07-21 records** to point forward to the new, controlled verdict — do not silently supersede the erratum'd run; link it as "informed but did not settle the P2 question; superseded/complemented by the 2026-07-25 Fable-5 run."

**Anticipated shape:** 3–4 sessions again (spec/scenario refresh, leg A, leg B, verdict) — mirroring both prior P2 shapes, not compressible into one sitting.

**Rollback:** documents + throwaway credentials only, as in the prior runs. No schema/flag/code change expected.

---

*Cross-references: `operations/agent-org-2026-07/2026-07-20-P2-spec-freeze.md`; `operations/agent-org-2026-07/runs/verdict-memo-2026-07-21.md` (erratum section); `operations/handoffs/founder/2026-07-21-P2-harnessed-arm-CLOSE.md` (revised); `operations/agent-org-2026-07/agent-org-and-evidence-build-plan.md` §3-P1/§3-P2.*
