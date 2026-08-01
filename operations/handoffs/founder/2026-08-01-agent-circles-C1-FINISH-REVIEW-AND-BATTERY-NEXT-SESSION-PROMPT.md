# Next-Session Prompt — Finish PR19 review + run the verdict-equivalence battery (agent-circles C1)

**Paste this whole file as the FIRST message of a new session.**

**Target model: `claude-sonnet-5`, effort `medium`.** State this at the start of your reply (model + effort), one sentence. This is a FINISH-UP session, not a design session — two concrete, bounded tasks, both already scoped. Do not re-derive scope; it is fully specified below.

**Do not read the standing session opener or the full agent-circles plans/verbatim records for this session** — everything you need is inlined below or in the one close doc named in step 0. Reading those large files first would burn most of this session's budget on re-grounding, which is exactly the problem the founder is asking you to avoid this time.

---

## Context (all you need — do not re-derive)

- **Build status:** committed on `main` at `cfc3d7c` ("Build agent-circles C0/C1a/C1b/C1d/C1f/C3 dark behind SUBSTRATE_AGENT_CIRCLES_ENABLED"). Nothing deployed, pushed, migrated, flagged, or minted. **Do not touch this commit's content** — this session verifies and documents, it does not rebuild.
- **The full record of what was built and why:** `operations/handoffs/founder/2026-08-01-agent-circles-C0-C1-C3-CLOSE.md` — read this ONE file in full before starting (it is self-contained: what shipped, the scope decisions BD-1..BD-7, the one confirmed CRITICAL already fixed, and exactly what remains). It is the source of truth; do not consult the original build plan or the verbatim mentor records unless the close doc's own citations require it.
- **Two things are unfinished, and this session's whole job is to finish them:**
  1. An independent adversarial review (PR19) of the build is **partially complete** (39 of ~99 raised findings adjudicated: 31 confirmed, 8 refuted) but was interrupted twice before its own final step could run, so there is no clean structured output yet.
  2. A deterministic verification battery that measures the build's one live safety-relevant question (does the C1a first-circle narrowing make the live `/api/guardrail` gate more permissive on any real fixture?) has been **attempted twice and never actually executed** — both attempts were blocked by an unrelated transient tool error, not by anything wrong with the battery.
- **Known, pre-existing, NOT-yours files in the working tree** — do not stage, commit, or touch these; they belong to other sessions awaiting the founder's own disposition: `website/Brand/~$and_Guidelines.docx` (deleted, uncommitted), `website/src/data/environmental-context.json` (modified), `a3-developmental-streak.py` (untracked), `sdk/typescript/package-lock.json` (untracked). If `git status` shows anything else uncommitted at session start, stop and check before touching it — a prior interrupted session left a stray file mutation once already (see the close doc's resume-session addendum).

## Task 1 — finish the PR19 review (do this first)

**Explicit authorization for this one call:** the founder, by pasting this prompt, is directly instructing you to resume this SPECIFIC existing review run via the Workflow tool. This is the only Workflow call authorized this session — do not launch any other Workflow, and do not treat this as a general opt-in to multi-agent orchestration for anything else in the session.

Call:
```
Workflow({
  scriptPath: '/Users/clintonaitkenhead/.claude/projects/-Users-clintonaitkenhead-Claude-work-PROJECTS-sagereasoning-website/8421193d-62a9-421f-aac4-60435e430365/workflows/scripts/agent-circles-c1-pr19-review-wf_54976666-937.js',
  resumeFromRunId: 'wf_54976666-937'
})
```
46 of ~106 agent calls are already cached and will replay instantly; only the remaining verifiers actually run. **Let it run to completion this time** — do not interrupt it. If it errors because the run/cache has expired, fall back to reading the journal directly (path in the close doc's §4a) and adjudicate the remaining raw findings yourself, but prefer letting the workflow finish — its own aggregation code produces a clean `confirmed`/`refuted` list you would otherwise have to reconstruct by hand.

**When it completes:**
- The one CRITICAL it already found (C3 wiring a new deny class into the live gate) is **already fixed** in the committed code (flag-gated) — do not re-fix it, just confirm the completed run doesn't contradict that or surface anything new about it.
- For every OTHER confirmed finding (medium/low/nit): read it, decide if it's real, and either (a) fix it with a small targeted edit + re-run the one relevant unit battery + `npx tsc --noEmit`, or (b) record it as a named, deliberately-deferred follow-up if fixing it would require rebuilding scope beyond this session (say which, and why, in your summary — do not silently skip). **Do not launch a fresh review round on top of this one** — the job is to finish adjudicating what was already raised, not to find more.
- **Immediately check `git status` and `git diff` for any stray edits** before doing anything else with the code — a review agent's mutation test has been left uncommitted twice already in this build's history.

## Task 2 — run the verdict-equivalence battery (do this second)

From `website/`, run BOTH commands and capture full output (redirect to a file if the output is long; read the file rather than relying on truncated terminal output):

```bash
cd website
npx tsx --env-file=.env.development.local scripts/guardrail-verdict-equivalence-battery.ts > /tmp/verdict-flag-off.log 2>&1
```
```bash
cd website
SUBSTRATE_AGENT_CIRCLES_ENABLED=true npx tsx --env-file=.env.development.local scripts/guardrail-verdict-equivalence-battery.ts > /tmp/verdict-flag-on.log 2>&1
```

If either command is blocked by a message like *"the safety classifier is temporarily unavailable"* — this happened twice in the prior session and is a transient tool-availability issue, not a code or data problem. Wait roughly 30–60 seconds and retry the exact same command. If it still fails after 3 retries, say so plainly, move on to whatever else is left in this session, and flag it as still-unrun in your summary — do not silently skip it or fabricate a result.

**Reading the output:** each fixture prints a `SANDWICH` line with `proximity=`, `proceed=`, and (when present) a note like `dikaiosyne=reflexive` or `obligation_violated [circle_name]`. Compare the two log files fixture-by-fixture (18 fixtures, IDs `U1`–`U5`, `D1`–`D5`, `A1`–`A3`, `B1`–`B2`, `C1`, `J1`–`J2`). For every fixture whose `proceed` value DIFFERS between the flag-off and flag-on run, decide:
- **(a) intended-lenience** — a self-regarding fixture that no longer engages a background `self_preservation` circle, so it now correctly proceeds. Fine, expected, note it.
- **(b) a real leak** — a fixture that affects a third party, where the flag-on run proceeds but the flag-off run blocked. **This would mean the close doc's disclosed risk materialized.** If you find one, say so immediately and clearly — do not average it away or bury it in a long list. This is the single most important thing this session can report.
Also run the summary section's own `Drifts` / `UNSAFE LEAKS` lines from both logs — they do this comparison for you against the LEGACY engine baseline; read them, don't just eyeball the raw fixture lines.

Also run the same flag-off/flag-on comparison for `scripts/locus2-sandwich-battery.ts` if time allows — it is named in the close doc's walk checklist step 2 as a second, smaller battery covering the same question from a different angle. If you don't have budget left in this session, say so and leave it as a named carry — do not skip it silently.

## Boundaries (unchanged from the build session — do NOT do these)

- No deploy, no push, no schema apply, no flag set in any real environment, no credential mint.
- No C1c (trust-event classes), no C2 (fifth-circle criterion), no S11/logos-on work, no orientation reading anywhere.
- Don't touch `derive-trust-events.ts`, `stoic-brain.ts`, or the logos boundary guard test.
- Don't re-litigate BD-1 through BD-7 (recorded scope decisions in the close doc) — they stand unless you find a review finding that specifically contradicts one, in which case say so and let the founder decide.

## Exit

Update in place (don't create new files unless a fix needs a new test):
1. `operations/handoffs/founder/2026-08-01-agent-circles-C0-C1-C3-CLOSE.md` — replace the "Resume-session addendum" section with the FINISHED PR19 outcome (full confirmed/refuted counts and what was fixed vs. deferred) and the battery RESULTS (ran or still-blocked, and any leak found).
2. `operations/decision-log.md` — one more short entry recording this session's outcome (append, do not edit prior entries).
3. Run `npx tsc --noEmit` and `npm run build` one final time from `website/` and confirm both exit 0 before ending the session.

State plainly at the end: is PR19 now fully discharged (yes/no), did the battery run and what did it show (including explicitly: was any real leak found), and what — if anything — is still carried to the founder-walk session.
