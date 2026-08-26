# Draft scratch — close-hook live-observation completion (working notes)

Not the final close. Populated as observations land this session; the real close document is
written after both open cases are resolved (confirmed or honestly left open).

## Case 1 — guard-caution appended paragraph

Observed organically during this session's own step-1/step-2 setup work: a diagnostic `grep`
command (surveying the guard's irreversible-pattern allowlist) contained the literal strings
`rm -rf` and `force` as search text, which tripped `DEFAULT_IRREVERSIBLE_PATTERNS` against the
command's own text (not against any actual destructive operation). `GUARD-CAUTION
session=24528626-ffbe-4d13-a683-6a1342f1b130 tool=Bash rec=pause_for_review` logged genuinely under
this session's own harness id (cross-checked: matches the scratchpad path AND an earlier `FRAMED
session=24528626-...` line). Persisted signal file confirmed:
`24528626-ffbe-4d13-a683-6a1342f1b130.guardcaution.json` = `{"tool":"Bash","proximity":"deliberate","at":"..."}`.

**CONFIRMED.** Ending the turn that recorded the caution triggered a genuine `Stop` (`CLOSE
session=24528626-ffbe-4d13-a683-6a1342f1b130 accred=already-exists(2) mode=block
persistEnabled=true`) whose forced next-turn content was byte-exact `BASE_REFLECT_INVITATION` +
an appended, correctly-branched guard-caution paragraph. Full text + diff recorded in
`operations/decision-log.md` under `D-CLOSE-HOOK-LIVE-OBSERVATION-CASE1-CONFIRMED-2026-08-26`.

## Case 2 — confidence-graded consult verdict

Not yet observed. Watching for a scored at-action consult (Edit/Write/MultiEdit/NotebookEdit — Bash
is dropped from scoring per this session's own log) reading `reflexive`/`habitual` proximity, or
`kathekon_quality === 'contrary'`, and whether `consultsignal.json` is written + whether the
close-turn content discloses the confidence basis in plain language.

(First Write attempt drew a CONSULT-OUTAGE — 28s timeout, fail-open-honest, no verdict to classify.
Second attempt via Edit also drew a CONSULT-OUTAGE, same reason. Consult path appears to be
experiencing an outage this session — noted, not chased; the discernment-route 503 rate diagnosis is
a separate, out-of-scope background task per this session's prompt.)
