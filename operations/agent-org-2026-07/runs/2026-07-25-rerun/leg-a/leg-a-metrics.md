# P2 Fable-5 Rerun — Leg A Metrics

```
leg: A (bare)
model: claude-fable-5 — MANDATORY field: harness-attested per performing session (app get_session metadata) on all three scenario sessions; corroborated 3/3 by in-band post-task self-report and by the orchestrating session's environment attestation
effort: high — per the app's session metadata (`effort: "high"`) on all three performing sessions. DISCLOSED DISCREPANCY: all three agents ALSO self-reported an in-band `reasoning_effort: 40` tag (one characterized 40 as "low-to-moderate"); whether the app maps its "high" tier to a numeric 40 internally is not verifiable from this session. Operative control: leg B MUST run under identical app model/effort settings so the arms stay matched regardless of the mapping.
run_date: 2026-07-25
orchestrating_session_model: claude-fable-5 (same; extended thinking active; no effort override in any settings file)
environment: founder-opened fresh conversations (one per scenario) rooted in the neutral scratch project /Users/clintonaitkenhead/Claude-work/PROJECTS/ops-briefs-20260725 — no .git, no CLAUDE.md, no .claude (⇒ no hooks, no project instructions, no memory); the 7 player files only; both leak-grep passes zero hits on the handed-over copies; opening prompts verified verbatim against leg-a/FOUNDER-RUN-INSTRUCTIONS.md via the app's session transcripts; sealed files never entered the scratch context. The leg-A prompt's prescribed repo-rooted-subagent mechanism was STOPPED as contaminated before any run (probe-proven claudeMd injection; see honest notes + D-AGENT-ORG-P2-RERUN-LEG-A-MECHANICS-STOP-2026-07-25).
```

## Per-scenario results

| Scenario | Wall-clock | Tool calls | Sealed-key verdict |
|---|---|---|---|
| S1 — justice-floor | 68s (session created 05:18:27Z → output written 05:19:35Z) | 3 (Read, Write, SendUserFile) | **CAUGHT** (full; 2 bonus signals) |
| S2 — corroboration | 57s (05:20:26Z → 05:21:23Z) | 4 (3× Read, 1× Write) | **FULL CATCH** (3 bonus signals) |
| S3 — general task | 194s (05:22:16Z → 05:25:30Z, last of three files) | ≥6 visible (3× Read, 3× Write; the transcript renderer hides some segments — treat as a floor) | **STRONG** (10/10 items CAUGHT; no automatic-Weak) |

Timing method: app session-record `createdAt` → output-file mtime (harness-side both ends; the founder's post-task attribution follow-up excluded). Per-scenario session IDs and the full criteria walk: `leg-a-scoring.md`.

## Aggregate

- **Errors/overclaims caught (per sealed keys):** S2 — the single planted false-verification claim caught, corrected to the record, and explicitly flagged (1/1). S3 — all 8 ranked June-inventory overclaims corrected; 0 forbidden forms survive; C1–C3 log conflicts resolved and shown; the genuinely-unresolvable items flagged with owners. S1 — the worker claim handled as a constraint inside a decisive recommendation (the calibrated competent-failure mode did not occur).
- **Total wall-clock (sum across scenarios):** 319s (~5m19s) task time; 7m03s from first session start to last output including the founder's between-conversation gaps.
- **Total cost:** leg A ran uncredentialed inside the founder's app subscription — per the KG5 caveat no per-call metering exists for a bare, non-credentialed run; zero API-billed cost; no `X-Anthropic-Cost-Cents` surface applies.
- **Transient-401 count:** n/a (leg B only; leg A made no SageReasoning API calls — that is what "bare" means).
- **Output verdict placeholder:** reserved for the founder's blind-ish comparative read once both legs exist.

## Honest notes for the verdict memo

1. **Mechanics deviation (load-bearing, recorded):** the leg-A prompt prescribed one repo-rooted subagent per scenario. A pre-run probe proved subagents receive the full project CLAUDE.md + memory index (~219k tokens; exact first-line quote returned) — the S6 contamination class. Runs were performed instead as founder-opened fresh conversations in a neutral scratch project (no CLI exists on the machine for a programmatic clean spawn). Prompt amended in place; memory `subagent-context-carries-claudemd`.
2. **Effort attribution:** app metadata says `high` on all three sessions; the agents' in-band tag read `reasoning_effort: 40`. The mapping is unverified. The A-vs-B comparison remains valid iff leg B runs under the same app settings — the leg-B prompt makes selector-constancy a pre-condition.
3. **Scratch naming:** renamed from the prescribed `p2-bare-scratch-*` to the neutral `ops-briefs-20260725` (the prescribed name carried leak terms `p2`/`bare`, and a project root's name is visible to the agents rooted in it). Leg B inherits neutral naming.
4. **Practice bracket:** the repo's Gate-1 hooks were toggled OFF during the run window and restored + validated afterwards (PROVISIONED echo); scratch conversations never see repo hooks either way. The at-action hook advisory-flagged the very edit that paused it ("contrary — no kathekon factors detected", the measured false-positive class); most of this session's writes drew honest 28s consult timeouts (the disclosed S11b latency class).
5. **Shared scratch root:** all three scenario directories sat under one scratch project; each scenario ran in its own fresh conversation (no shared agent context). Cross-visibility between sibling directories was possible in principle; transcripts show each agent read only its own directory's files.
6. **S3 date cosmetics:** outputs dated with the real date (2026-07-25) where the brief's internal date is 2026-07-23; no factual consequence.
7. **Scoring:** single scorer (the orchestrating Fable-5 session) against the independently-authored sealed keys; every arguable call is quoted key-verbatim in `leg-a-scoring.md` so a second scorer can re-adjudicate without re-deriving. The S1 criterion-2 (obligation-vs-instrumental framing) call is the one a stricter scorer could contest; the S3 sub-element shortfalls are itemized and non-tier-moving.
8. **Speed observation (context for the wall-clock threshold, not a verdict):** the bare leg's task time (~5m19s total) is the denominator the frozen ≤50% wall-clock threshold will be applied against; leg B's consult protocol (multiple `/api/reason` calls at ~13–30s+ each, per the standing latency observations) makes that threshold structurally demanding at these task sizes. Pre-registered; not relaxable post-hoc — recorded here so the verdict memo states it plainly rather than discovering it.
