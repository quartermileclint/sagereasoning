# Next-Session Prompt — Sage Practice Mechanism Correction: grounding → fresh findings → approved build → standardised benchmark

**Stream:** founder. **Model:** **Fable 5, maximum reasoning effort** (founder-directed). Environment: Claude Code on the founder's machine (repo access + production reach for evidence reads; no production *writes* until the build phase, and then only per its own approvals).
**Tier:** opens as `governance` (grounding + reports, Standard). The build phase reclassifies per item under 0d-ii — expected `code-elevated` for `/api/reason` response-path changes; **anything touching the R20a perimeter, auth surfaces, or env-flag activation is Critical (PR6/0c-ii)**. The founder may reclassify upward at any time.
**Governing frame:** `/adopted/standing-protocol-cache.md` (PR1–PR18). PR15 applies to every build election (Anthropic-primitive check first). PR10 PEV loop applies to all code work.
**Predecessor closes:** `/operations/handoffs/founder/2026-06-11-P1-comparison-verdict-close.md` (+ its same-evening forensic addendum), leg A + leg B closes.
**Predecessor decision-log entries:** `D-P1-COMPARISON-LEG-A-BARE-2026-06-11`, `D-P1-COMPARISON-LEG-B-HARNESSED-2026-06-11`, `D-P1-COMPARISON-VERDICT-NO-BENEFIT-2026-06-11`, `D-P1-FORENSIC-EXECUTION-ANALYSIS-2026-06-11`.

---

## Part 0 — Handoff: what was tested, what happened, and how the picture changed

Read this section as settled record. Do not re-litigate the verdict; do re-use every finding.

**The test.** The 0h main blocker was a pre-registered bare-vs-harnessed comparison (`/drafts/2026-06-10-p1-comparison-test-design.md`, FROZEN): the same real task — rebuilding the stale P1 business-review inputs — run twice from the same commit (`a3db4c7`), same model (Fable 5), fresh sessions. Leg A bare (no SageReasoning). Leg B under the full public contract: per-install credential → 12 `/api/reason` consults at four decision-point classes → `/api/guardrail` gates → Sage Assent accreditation write carrying all 12 signed assessments. Founder-set thresholds, ticked before any data existed: benefit = ≥2 material decisions/errors the bare leg missed AND ≤50% wall-clock overhead AND ≤$5 harness cost.

**The verdict** (`/operations/p1-rebuild-2026-06/verdict-memo.md`): Box 1 PASS 2/2 (F12 live mint-defaults drift 667/50/20 vs adopted 30/1/1; accreditation write/read agent_id asymmetry — both reachable only by exercising the contract; founder adjudicated those as counting). Box 2 FAIL +333% wall-clock. Box 3 PASS $0.76. Conjunction FAIL → **"No benefit" per the frozen boxes — the verdict stands as recorded.** Founder quality ratings: bare 3/5, harnessed 4/5 (harnessed preferred: "more succinct… declared the old inputs unusable… clearer and easier to read").

**The forensic re-examination** (`/operations/p1-rebuild-2026-06/forensic-execution-analysis.md` — read in full, §1–§7) then changed what the fail *means*:

- **~65% of leg B's window was one-off human credential provisioning measured in-window** (33.5 min agent-idle wait + ~16 min interactive 400-retries from prompt defects + a console typo). Like-for-like *agent work* was ~13 min bare vs ~23–25 min harnessed (≈ +80–90%, not +333%).
- **The reasoning engine (Layer 2) took 0–3 milliseconds per consult.** The ~30s per consult was translation: server-side Layer 1 ~13–34s (avoidable — the agent supplied a locally-computed `layer1_schema` on consults #1–2, L1=0ms, then dropped the practice after a mid-run credential switch) + Layer 3 ~12–20s Sonnet prose on every call.
- **Founder correction, accepted into the record:** L3 prose is **not** dead weight — it is the after-the-fact audit narrative pairing each L1 input with a readable verdict (tabulated in `harnessed/consultation-audit-report.md`). The defect is *when* it is generated (synchronously in the agent's hot path) and *where* it is retained (nowhere server-side — only a boolean persists; the narrative survives only if the consumer saves responses).
- **"Quick" depth is a price tier, not a latency tier** (depth changes only the 2ms engine).
- **Reflect was never called; zero subagents in either leg; nothing looped** (every loop = exactly 2 internal calls, both translation); **no consult was re-run after its correction was adopted** (the examine→redirect half of the practice worked; reiterate→re-examine→reflect never engaged).
- **Scoring is stateless** — no per-agent profile over time; the only longitudinal artefact is the terminal accreditation write; yet a real trajectory signal appeared anyway (proximity *deliberate* baseline → *reflexive* at the judgement peak → **habitual with epithumia detected at the final consult** — late-task drift caught live).
- **Methodology learnings (§7, L-1…L-6):** the harness's contribution was affect-regulation, not information — passions flagged on exactly the rows where the writer had something at stake in how a claim would land, and those rows are where the founder-rated quality edge lives; the opening plan-adoption consult did disproportionate frame-setting work; over-consultation has a detectable signature (deliberate + moderate + no passions ⇒ always "used as stated"; 8 of 12 consults were that).
- **New product findings queued:** L3 decoupling/retention options; guardrail meta still reports the retired `cost_usd: 0.0025`; gate latency variance (20s vs a suspicious 46ms "ai_generated" verdict — likely cache or mislabelled fallback); F12 re-corroborated; browser-console mint UX (replace with admin UI/CLI). Plus leg B's own R5 fix list (`harnessed/recommendations.md` R5) and F11/PF-1/PF-2.

**Evidence locations:** `/operations/p1-rebuild-2026-06/` — `bare/` (4 files), `harnessed/` (5 files + `raw/` payload-header trail + `consultation-audit-report.md`), `verdict-memo.md`, `forensic-execution-analysis.md`, `transcripts/` (**gitignored — contains retired credential values; delete after use; deletion is owed**).

## Part 1 — Grounding: deep research into the origins and intent of the Sage Practice

Before proposing any correction, establish what the mechanisms are supposed to deliver. This is a research phase — read-only, citations required for every claim.

1. **Project history.** Trace the project's evolution through `/operations/decision-log.md` + the monthly archives (`decision-log-archive-YYYY-MM.md`), `/archive/`, `/adopted/` (ADRs incl. the J1 Character Kernel ADR; the substrate staging plan), and `/manifest.md` (R0–R20, AC1–AC13 — targeted reads).
2. **Origins of the "Sage Practice."** Find where the practice was first defined and how it was intended to function: the examine-impressions loop (score → redirect → reiterate → reflect), the oikeiosis sequence (R0), kathekon/katorthoma assessment, passion diagnosis, prosoche. Sources include `/reference/` (Knowledge Context Summary; ethical analysis; journal interpretations), the sage-* skills (`.claude/skills/sage-*`), the "Sage Practice sequence plan" session lineage, and the engine itself (`translation-sandwich/layer2-mechanisms.ts` — the deterministic encoding of the methodology).
3. **The private Stoic mentor.** Research how the mentor (`/api/mentor/private/reflect`, V3 lineage) evolved the methodology: what the mentor's reflections established about how examination is meant to operate, what outputs each function is expected to produce (assessment, prose, improvement path, redirection, reflection), and how human practice and agent practice were intended to mirror each other (R19d mirror principle).
4. **Expected operation.** State, with citations, the intended operating model: when an agent should consult, what a score is supposed to change, how the loop is supposed to close, what reflect is for, what the accreditation grade is supposed to attest, and what the auditor-facing record is supposed to contain.

**Output: a grounding dossier** (`/operations/p1-rebuild-2026-06/sage-practice-grounding-dossier.md`) that ends with an explicit two-column boundary table: **methodology** (the Stoic functions — untouchable without mentor confirmation) vs **mechanism** (how the code delivers them — the correction target). Every later phase cites this boundary.

**Hard constraint (founder-set):** the goal is corrections/improvements to the **mechanisms that deliver the functions — not to the Stoic methodology of the functions themselves**. Any candidate change that crosses into methodology is parked in a "requires mentor confirmation" list and is not built. Mentor confirmation means a founder-elected consultation through the private mentor, recorded; it is not this session's to perform unprompted.

## Part 2 — Fresh test-analysis reports and findings

With the grounding in hand, re-analyse the comparison evidence from first principles (the verdict memo and forensic analysis are inputs, not ceilings — supersede their *analysis* freely; the verdict's box results are record and stand):

- A fresh findings report: what the test actually demonstrated about each sage-practice function (discovery, consultation, scoring, redirection, loop closure, reflect, accreditation, audit narrative) measured against the *intended* operation from the dossier — function by function: operated as intended / operated degraded / never engaged, with the mechanism defect named for each gap.
- Include the methodology-vs-mechanism attribution for every defect (e.g., statelessness of scoring: mechanism gap or methodological choice? The dossier decides).
- Output: `/operations/p1-rebuild-2026-06/fresh-test-analysis.md`. Findings numbered (FX-series) for traceability into the build plan.

## Part 3 — Build plan (founder approval gate — nothing is built before "approved")

Draft `/operations/p1-rebuild-2026-06/mechanism-correction-build-plan.md`:

- One item per mechanism correction, each carrying: the FX finding it fixes; the dossier function it serves; **PR15 check** (Anthropic primitive considered before bespoke); risk class under 0d-ii (expected items: L3 decoupling + server-side retention — Elevated; layer1_schema support/nudge on the API-key path — Elevated; depth-as-latency-tier — Elevated; loop-closure/re-score affordance — Standard/Elevated; trajectory persistence — schema + Elevated; mint-defaults F12 fix — Elevated; mint UX — Standard; guardrail stale price constant — Standard; gate-latency-variance investigation — Standard diagnostic first, PR10 diagnostic-certainty signalling applies); rollback path; founder verification step.
- Sequencing per PR1 (single-endpoint proof before any rollout) and the staging plan; name which items ride together.
- Expected candidates above are **candidates, not conclusions** — the dossier and fresh analysis may add, merge, or kill items.
- **Stop here.** Present the plan; the founder approves, amends, or rejects item by item. Only items marked approved proceed.

## Part 4 — Build (after approval only)

Execute approved items under the PEV loop (PR10), PR1 single-endpoint proof, PR2 same-session wire-verification, 0c-ii for anything Critical, founder walked through every founder-performed step live (PR17). Production state per PR18 — rewritten only at session close. This will span multiple sessions; each session takes the next approved item(s) and closes lean.

## Part 5 — New standardised benchmark schema (draft for founder sign-off)

Draft `/drafts/sage-practice-benchmark-v1.md` — the successor to the frozen comparison sheet, designed as a **repeatable, efficient, standardised benchmark**, not a one-off:

1. **Triggers ALL sage-practice functions** in one run: plan-adoption consult; judgement-point consults (incl. at least one designed self-presentation-stake moment so passion detection is exercised); a scope-conflict consult; guardrail gate(s); redirection with **loop closure** (re-score after the correction); a reflect leg; accreditation write **and read-back**; the audit-narrative tabulation as a required output.
2. **Bare and harnessed variants** of an identical frozen task brief, with comparable metrics: wall-clock **with provisioning and agent-work measured separately** (the leg-B lesson — credentials pre-provisioned or clocked outside the agent-work metric, conventions named in the schema), token cost (KG5 method named), harness cost (headers + ledger), findings count + founder-rated quality, decisions-changed with material grading, errors caught with the "which leg missed it" wording made unambiguous this time (contract-exercising catches: in or out — decided in the schema, not adjudicated after).
3. **Efficiency target:** the harnessed leg's consult protocol follows the §7 learnings (opening consult + stake-bearing decision points; no consults bearing the over-consultation signature) and the built mechanism corrections (schema supplied; prose decoupled if built).
4. **Pre-registration discipline preserved:** thresholds blank, founder-set at sign-off before any run; either outcome stands.
5. Schema ends with an estimated runtime + cost per benchmark execution, so it can be run routinely (e.g., per release) as a standing product benchmark.

**Stop at the draft.** The founder signs off the schema (and its thresholds) before any benchmark run is scheduled.

## Sequencing and session hygiene

Parts 1–2 are one deep session (this prompt's primary scope); Part 3 may fit the same session if budget allows, else its own. Parts 4–5 are subsequent sessions. Each session: open under the cache, lean decision-log entry + lean close, PR18 at close. If any phase finding contradicts a prior decision, PR13's five questions are stated explicitly.

## What is NOT in scope

- No change to the Stoic methodology of any function (mentor-confirmation gate; founder elects if/when).
- No re-litigation of the frozen verdict or its thresholds.
- No benchmark run (Part 5 is a draft; running it is a later, separately signed-off session).
- No production flag activation without 0c-ii.
- The P1 review and the founder's 0h call remain the founder's, outside this arc — though this arc's outputs feed both.

## Rollback path

Parts 1–3 and 5: documents — `git revert`. Part 4: per item, named in the build plan before execution.

End of prompt. The grounding dossier comes first; nothing is corrected until what the mechanisms were meant to deliver is established from the record.
