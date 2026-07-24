# Next-Session Prompt — P2 Fable-5 Rerun (the model-controlled bare-vs-harnessed benchmark)

**Authored:** 2026-07-25, by the Fable-5 audit session (`operations/2026-07-25-fable5-audit-of-sessions-2026-07-19-to-24.md`). **Supersedes the "THE SATURDAY TASK" section of `2026-07-21-interim-and-P2-Fable5-rerun-standing-note.md`** (this prompt folds in that section's nine steps PLUS the audit's §6.7 spec addendum — the validity threats the 07-20 bare-arm session's own reflection surfaced and the verdict memo dropped). The standing note's history/context sections remain the background record.

**Why this exists:** the 2026-07-20/21 P2 run executed **both legs under Sonnet 5 at LOW reasoning effort** — not Fable 5, the model both the frozen spec (`operations/agent-org-2026-07/2026-07-20-P2-spec-freeze.md` §2) and the AO plan (§3-P2) name specifically to hold the model-tier variable constant against the 2026-06-11 precedent. The same-day erratum stands in the verdict memo, the close, and `D-AGENT-ORG-P2-LEG-B-HARNESSED-RUN-2026-07-21`. **The P2 arc is open; the "no benefit" result is not settled evidence until this model-controlled repeat runs.**

**Tier:** `governance` for spec/scenario work; the leg-B mint/revoke steps are founder-walked live credential ops (PR17; the six-element Critical exchange before any mint). **Expected shape: 3–4 sessions** (spec/scenario refresh → leg A → leg B → verdict), mirroring both prior P2 arcs — not compressible into one sitting.

---

## Step 0 — THE MODEL GATE (the erratum's own lesson; do this before anything else)

1. **Confirm this session is genuinely Fable 5** — not a fallback, not a silent substitution. State the model + reasoning-effort setting explicitly in the session's opening confirmation. If it is not Fable 5, STOP and tell the founder; do not proceed on a lesser model "to make progress."
2. **The metrics files for BOTH legs gain a mandatory `model:` and `effort:` field** — the absence of that field is exactly what let the 07-20/21 deviation go undetected. A leg whose metrics file lacks these fields is not a valid leg.
3. Every commit this arc produces carries a `Co-Authored-By` trailer naming the actual model (the audit found 10/21 commits since 07-19 with no model trailer).

## Step 1 — Re-confirm the build-state precondition LIVE

The same checks both prior P2 sessions ran, against present state (do not cite this prompt's date as current):
- `curl https://www.sagereasoning.com/api/health` (note: since P-GL #6 this is a REAL reachability probe — expect 200/`healthy` with `supabase`/`anthropic_api: connected`).
- `git log origin/main -1` + confirm the working tree is clean (the 2026-07-25 records commit, which includes the AUTH-1/AUTH-2 auth fixes and this prompt, should be pushed; if uncommitted records remain, surface that first).
- The self-circle/loop-fold ancestry grep from the spec-freeze session.
- State which flags matter for the harnessed leg (corroboration check, §4 dikaiosyne, AE-1/AE-2 — all Live per CLAUDE.md's list) so the verdict memo can say exactly what build was benchmarked.

## Step 2 — Scenario refresh (the old three are CONTAMINATED for a bare run)

Author **fresh scenario briefs** against the same three mechanism-classes (justice-floor · self-report-corroboration · general-task). Reuse the S6 §2.4 sealed-sweep discipline exactly (dispositive-fact sweep written by a reviewer ≠ the author). Fold in, as **binding spec amendments** (audit §6.7 — these were dropped from the first run's memo):

- **(a) Independent answer-key authorship:** the sealed answer keys must be authored (or at minimum substantively reviewed) by an agent independent of the brief author — author ≠ key-writer ≠ sweep-reviewer. The 07-20 run's keys were written by the brief author; the session's own reflection flagged this as a validity threat ("is the scoring rubric itself biased by the author's own expectations") and it never reached the memo.
- **(b) S2 scenario-design fix** (verdict memo task-fit finding 4): the self-report claim must be asserted as **settled fact inside the actual output artifact being gated** (e.g. the board note itself states "reviewed and cleared" as fact) — not narrated as an open internal question in the consult input. The prior phrasing let the native dikaiosyne floor do the catching instead of cleanly exercising the corroboration check's self-report-vs-text mechanism.
- **(c) Synthetic-artifact realism note:** if a scenario supplies a synthetic status log / context document, its realism limits must be stated in the scenario package (the 07-20 S3 log was "too well-organized," likely inflating bare-leg performance — the reflection's second dropped finding). Prefer deliberately imperfect/incomplete synthetic context; either way, disclose it in the memo's limitations section.
- **(d) The verdict memo MUST have a Limitations section.** The 07-21 memo had none — that is where both dropped findings should have lived.

## Step 3 — Leg A (bare), clean context, full effort

- A genuinely clean scratch context (no repo/benchmark visibility — the S6 contamination lesson), **under Fable 5 at full/normal effort**, model+effort logged in the metrics file (Step 0.2).
- Close leg A's session entirely before opening leg B — no shared context.

## Step 4 — Leg B (harnessed), founder-walked credentials

- Same protocol as before: consult (`/api/reason`, `assessment_first`) at each genuine decision point; `/api/guardrail` before the consequential action; close with a Sage Assent accreditation write. Pre-consult positions recorded BEFORE each verdict is seen (the anti-self-grading device).
- **Mint discipline (both prior errors, do not repeat):** `mint-credential.ts mint api` (NOT `install` — `sr_inst_` requires a supplied `layer1_schema` and `/api/guardrail` rejects it) for the consult/guardrail credential; the `agent_id` K1-canonical (`namespace:name@version`) from the FIRST mint. Founder runs every mint/revoke live (PR17); the six-element Critical exchange precedes the first mint.
- Note the disclosed transient-401 class (server-side DB fail-secures masked to 401 — `gate1-consult-401-is-transient-fail-secure`): a sporadic 401 on a healthy credential is retry-once material, not a stop.

## Step 5 — Verdict

- Score against the fresh sealed keys; build the incorporation log; apply the frozen thresholds as pre-registered (2 decisions/errors · 50% wall-clock · $5 — from the frozen spec; do not relax post-hoc).
- Compare to BOTH prior points, explicitly labelled: the 2026-06-11 Fable-era verdict and the caveated 2026-07-21 Sonnet-5-low-effort run. State plainly that THIS run is the first cleanly model-controlled repeat since 2026-06-11.
- Write the memo WITH the Limitations section (Step 2d), including whatever residual validity limits this run still carries.
- Revoke both credentials at close (founder-confirmed); the accreditation row may stand as a genuine artifact per precedent.
- Update the decision log + point the erratum'd 2026-07-21 records forward ("informed but did not settle; superseded/complemented by the 2026-07-25+ Fable-5 run").

## Rollback / risk

Documents + throwaway credentials only; no schema/flag/code change expected. If any code change becomes tempting mid-arc, it is out of scope — record it and hand it off.

---

*Cross-references: `operations/agent-org-2026-07/2026-07-20-P2-spec-freeze.md` · `operations/agent-org-2026-07/runs/verdict-memo-2026-07-21.md` (erratum + task-fit findings) · `operations/handoffs/founder/2026-07-21-interim-and-P2-Fable5-rerun-standing-note.md` · `operations/2026-07-25-fable5-audit-of-sessions-2026-07-19-to-24.md` §2/§5/§6.7 · `operations/agent-org-2026-07/agent-org-and-evidence-build-plan.md` §3-P2 · memory `gate1-consult-401-is-transient-fail-secure`.*
