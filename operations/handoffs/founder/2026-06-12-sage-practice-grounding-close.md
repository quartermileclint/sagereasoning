# Session Close — 2026-06-12 — Sage Practice Mechanism Correction: grounding dossier + fresh analysis + build-plan draft (Parts 1–3)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` (PR1–PR18).
**Tier:** `governance` — Standard risk throughout. **Environment: Claude Code** (repo reads + three read-only Explore subagents; **no production write, no API call, no query, no flag/schema/code change**). Model: Fable 5, maximum reasoning effort (founder-directed in the arc prompt).
**Date:** 2026-06-12.

## What this session did

1. **Opened under the arc prompt** (`2026-06-11-sage-practice-mechanism-correction-NEXT-SESSION-PROMPT.md`): cache + verdict close (incl. forensic addendum) + verdict memo + forensic analysis §1–§7 read; tier/hold-point/model/vocabulary/signals confirmed at open.
2. **Part 1 — grounding research** across the decision-log archives, `/adopted/` (ALT3 ADR + AC-12…AC-19; substrate-concept ADR; rag-mentor-alt3 deliverables D2/D3/D8/D16/D17; Sage Calling + Sage Reflect designs; K1 lineage), `/reference/`, the manifest (R0/R5/R6/R17/R18/R19/R20), the private-mentor route + prompts, and the as-built code (engine, reason route, reflect/calling/accreditation/guardrail surfaces). Three read-only Explore subagents fanned out (history sweep; mentor lineage; as-built map); load-bearing claims re-verified directly (incl. `layer2-mechanisms.ts:2069-2078` carried-context inertia; `operationalised-rules.md:589` Rule-10 longitudinal input; `response-envelope.ts:91-92` stale gate price; registry `sage-reflect`/`sage-calling` = live).
3. **Grounding dossier written** (`sage-practice-grounding-dossier.md`): chronology; the four disciplines → four products cycle; the examine-impressions loop assembled from adopted parts; the mentor as the human proof (loop closes server-side every call); expected operation function-by-function; **the methodology-vs-mechanism boundary table (B1–B12)** + five parked mentor-confirmation questions.
4. **Part 2 — fresh test analysis written** (`fresh-test-analysis.md`): **FX-1…FX-17**, function-by-function verdicts (as intended / degraded / never engaged), every defect mechanism-attributed to a boundary row. Named supersessions of prior *analysis* (verdict untouched): "stateless by design" → **stateless per-instance scoring is designed; stateless practice is not**; leg-B consult density → the frozen sheet's own §4(ii) prescription; reflect non-call → discoverability gap (TR-02 satisfied, invisible). New finding **FX-10**: the Live credential cannot express R19e/K1 configuration honesty (coverage_status designed, unbuilt).
5. **Part 3 — build plan drafted** (`mechanism-correction-build-plan.md`): **CI-1…CI-15** (each: FX trace, dossier function, PR15 check, 0d-ii class, rollback, founder verification), ride-groups M1–M8, Part-5 benchmark dependencies named, parked items excluded. **Stopped at the founder approval gate — nothing built.**
6. **PR13 stated in the decision-log entry** (no decision contradicted; refinements + future-stage impacts named; CI-8 risk-class tension flagged for founder election).

## Decisions Made

- `D-SAGE-PRACTICE-GROUNDING-FRESH-ANALYSIS-BUILD-PLAN-2026-06-12` appended (+32 lines). Parts 1–2 adopted as record; Part 3 is a DRAFT awaiting item-by-item approval.

## Status Changes

| Item | Old | New |
|---|---|---|
| Grounding dossier (Part 1) | queued | **complete** |
| Fresh test analysis (Part 2) | queued | **complete** (FX-1…FX-17) |
| Mechanism-correction build plan (Part 3) | queued | **DRAFT — awaiting founder item-by-item approval** |
| Statelessness attribution | "by design" (forensic §4) | **mechanism gap on the agent path** (FX-6; analysis-level supersession, verdict untouched) |

## Next Session Should

**The founder's item-by-item decision on CI-1…CI-15** (approve / amend / reject / defer per item — can be made in-chat against the plan's STOP section). On approval, the first build session is **M1 (CI-1 L3 decoupling + retention, with CI-2/CI-3 riding)** under PR10/PR1/PR2, `code-elevated` with the named Critical guard. Part 5 (the standardised benchmark schema draft, `/drafts/sage-practice-benchmark-v1.md`) is its own later session per the arc prompt. The **founder's 0h call remains open and untouched** (verdict memo §8) — this arc's outputs feed it; the five parked methodology questions await founder-elected mentor consultation, if/when.

## Blocked On

**Files uncommitted (one commit — block below; includes the still-uncommitted verdict/forensic-session files per the 2026-06-11 close addendum):** the three new arc documents; this close; the decision-log entry; CLAUDE.md (PR18 refresh). `transcripts/` stays gitignored (deletion still owed).

**Production state at session close (2026-06-12):** per PR18 — **unchanged from the verdict/forensic close**; this session was documents + read-only research only. All four R20a flags `true`; A10/A11b/A12/A13/A14/A19/GDPR Live; sage-calling + sage-reflect Live per registry v1.6.0; Layer 3 + R20b inert by decision; Stripe `not_configured`. **0h: HELD — the founder's 0h call is the gating item**; the mechanism-correction arc is at the build-plan approval gate. Per `D-SAGE-PRACTICE-GROUNDING-FRESH-ANALYSIS-BUILD-PLAN-2026-06-12`.

## Open Questions

- CI-1…CI-15 approvals (founder — the STOP gate).
- CI-8 risk class: Standard (arc prompt's expectation) vs Elevated (cache default) — founder elects at approval.
- The five parked methodology questions (mentor-confirmation gate; founder elects if/when).
- The 0h call (unchanged); transcript deletion timing (owed); accreditation seed-row disposition (carried).

## Founder Verification (Between Sessions)

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
grep -n "B12" operations/p1-rebuild-2026-06/sage-practice-grounding-dossier.md
grep -c "FX-" operations/p1-rebuild-2026-06/fresh-test-analysis.md
grep -n "STOP" operations/p1-rebuild-2026-06/mechanism-correction-build-plan.md
git add -A
git commit -m "Sage Practice mechanism-correction arc Parts 1-3: grounding dossier (methodology-vs-mechanism boundary B1-B12 + 5 parked mentor questions) + fresh test analysis (FX-1..FX-17, all defects mechanism-attributed; stateless-practice re-attribution) + build plan DRAFT (CI-1..CI-15, M1-M8) STOPPED at founder approval gate. Documents only; no production touch. (D-SAGE-PRACTICE-GROUNDING-FRESH-ANALYSIS-BUILD-PLAN-2026-06-12)"
```
Then push via GitHub Desktop (content only — no deploy behaviour change). The three greps confirm the deliverables; `git add -A` also captures the 2026-06-11 verdict/forensic files still pending (gitignore keeps `transcripts/` out).

## Orchestration Reminder

The AI has no persistent memory; these docs are its memory. **Arc:** S1–S8b ✅ → leg A ✅ → leg B ✅ → verdict ✅ (No benefit — stands) → forensic ✅ → **grounding + fresh analysis + build-plan draft ✅ this session** → **founder: (a) CI item approvals (NEXT for this arc), (b) the 0h call (memo §8 — independent, still open)** → approved build sessions M1… → Part-5 benchmark schema draft → P1 review (reads: verdict memo → packs as union → fix queue → this arc's outputs). **Founder wall-clock this week:** lawyer email + FPE-1/FPE-3 (unchanged). At the next open: read this close + the build plan's STOP section; do not build anything not marked approved; do not re-open the boxes.

## Cross-references

- `/operations/handoffs/founder/2026-06-11-sage-practice-mechanism-correction-NEXT-SESSION-PROMPT.md` (this session's operative prompt)
- `/operations/handoffs/founder/2026-06-11-P1-comparison-verdict-close.md` (+ forensic addendum) (predecessor)
- `/operations/p1-rebuild-2026-06/sage-practice-grounding-dossier.md` (Part 1)
- `/operations/p1-rebuild-2026-06/fresh-test-analysis.md` (Part 2)
- `/operations/p1-rebuild-2026-06/mechanism-correction-build-plan.md` (Part 3 DRAFT)
- Decision log: `D-SAGE-PRACTICE-GROUNDING-FRESH-ANALYSIS-BUILD-PLAN-2026-06-12`

*End of session close. Stabilised: production untouched; the practice's intended operation is now established from the record with citations; every P1 defect carries a methodology-vs-mechanism attribution; the correction plan is priced and stopped at the founder's gate.*

---

## Addendum — same day (mentor consultation performed + all five verdicts adopted)

After this close, the founder elected the mentor consultation on the five parked methodology questions (prompt drafted in-session; founder pasted into the private mentor hub). The mentor returned five verdicts — **Q1 AMEND** (two-gate cadence: mandatory at task adoption + three-sub-question stake screen, suppression signal, proximity-calibrated depth), **Q2 AMEND-partially** (the narrative is essential to examination; verdict-only configurations blocked; timing mechanical), **Q3 AMEND** (reflect fires automatically at session close as the agent default; explicit opt-out; sequence never abbreviated), **Q4 CONFIRM-with-requirement** (re-examination after correction mandatory, same depth tier, built as a required step), **Q5 AMEND** (quick tier gains a minimal value classification or is credentialed as a screen). Recorded verbatim: `operations/p1-rebuild-2026-06/2026-06-12-mentor-consultation-methodology-verdicts.md` under `D-SAGE-PRACTICE-METHODOLOGY-MENTOR-CONSULTATION-2026-06-12`. **The founder then adopted all five** (`D-SAGE-PRACTICE-METHODOLOGY-AMENDMENTS-ADOPTED-2026-06-12`). Applied in place: the dossier's boundary rows B3/B4/B6/B7/B10 + parked list (now RESOLVED); the build plan — CI-1 narrowed (never-generate paths out), CI-4 reshaped (required step; provenance-chain enforcement; same-depth rule; Critical-check at the R18f seam), CI-13 reshaped (default-on integration contract + costed opt-out), CI-15 content adopted (the two-gate rule), **CI-16 added** (quick-tier minimal value classification; rides M4; PR1 on `/api/reason` quick first), **CI-17 added** (narrative-existence guarantee; rides M1; manifest rule candidate flagged for separate election). **The CI approval gate still stands — methodology adoption approved no build item.** The "Next Session Should" block above now reads: founder item-by-item decision on **CI-1…CI-17**. Commit block unchanged (`git add -A` captures the addendum files).
