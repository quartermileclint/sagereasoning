# Next session — P1 follow-on (choose one; nothing here pre-decides the choice)

**Read first, in this order:** `/adopted/standing-protocol-cache.md` → the most recent close in
`/operations/handoffs/founder/` for this stream (there isn't one yet — this file is it) →
`CLAUDE.md`'s "Production state" header (confirms nothing changed underneath this) → then this file
in full before doing anything.

## What the prior session did (commit `50c0c0f`, pushed by the founder from GitHub Desktop)

S11 register hard prerequisite **P1** — "what does the decision table actually read when it fires?" —
is **ruled and discharged**. The mentor ruled: the at-action verdict, filtered by Q3's
kathekon-engagement threshold, is the table's per-action input; a verdict engaging no kathekon arm
reports `justiceSurface: 'none'`, never `'unevaluated'`; Q2's zero-false-positive staging premise
stands. The aggregate trust state is NOT the per-action input (its consumer is Q7 depth calibration,
undisturbed).

The ruling's build consequences were then built, founder-licensed ("seam + D5 supply fix"):

- **NEW** `website/src/lib/substrate/trust-core/at-action-seam.ts` —
  `interventionInputFromAtAction`, the sibling of `interventionInputFromS3`. Reuses
  `assessKathekonEngagement` (no new predicate). **Dark — not wired to any live caller.**
- **Register D5 fixed:** `readTrustVerdict`'s `taskHasJusticeSurface` is now REQUIRED (was
  optional-defaulting-false with zero supplying callers — a live MEASURE-honesty defect: the harness
  advisory answered a question it never asked). Every caller now states it. `basis` is re-labelled
  per the ruling.

**Read the seam file's header in full before touching anything downstream of it** — it states one
disclosed design decision that a reviewer should press (justice-surface filtering keys on the two
JUSTICE arms of the four-arm predicate, not on `engaged` generally; the reasoning is in the header
and pinned in battery §4).

**Verified, all green:** at-action-seam 59/0 (new) · s8-harness-integration 155/0 ·
s10-trust-record-surface 198/0 · s4-intervention-engine 417/0 (unchanged) · kathekon-engagement 113/0
(unchanged) · false-hold-observation-report 13/0 · discernment-observability-wiring 15/0 · logos
byte-identity guard 248/0 (dormant, window not running) · `tsc --noEmit` 0 · `npm run build` ✓.

**Nothing was activated.** No schema, flag, credential, migration, deploy, or public-doc change.
P4/P5/P6 are unmoved. **The S11 flip remains REFUSED.** Full account:
`operations/decision-log.md` — search `D-S11-P1-DECISION-TABLE-INPUT-RULED-DISCHARGED-2026-09-04` and
`D-S11-P1-AT-ACTION-SEAM-BUILT-D5-FLAG-SUPPLIED-2026-09-04` (the two entries this session added, in
that order). The scope document and the verbatim ruling are at
`operations/trust-layer-2026-07/2026-09-04-P1-decision-table-input-SCOPE-FOR-RULING.md` and
`...-mentor-ruling-P1-decision-table-input-verbatim.md`. The register:
`operations/trust-layer-2026-07/S11-FLIP-PREREQUISITES-REGISTER.md` §A row P1 (now RULED +
DISCHARGED) and §D row D5 (now closed — read it; it records the two in-session self-corrections too).

## First move: verify the record, don't trust this file

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git log -1 --oneline
git log --oneline -5
```
Expected: HEAD is `50c0c0f` or a descendant of it, on `origin/main` (the founder pushed via GitHub
Desktop between sessions — confirm the push landed before assuming anything below).

```bash
cd website
npx tsx src/lib/substrate/trust-core/__tests__/at-action-seam.test.ts
grep -rn "readTrustVerdict(" src scripts | grep -v "taskHasJusticeSurface" | grep -v "export async function"
```
Expected: `59 passed, 0 failed`; the grep prints nothing (every call states the flag — if this ever
prints something, D5 has regressed).

## What is genuinely open — pick ONE, or ask the founder which

None of these three is pre-selected. The prior session's close named all three as deliberately not
done; each is a real, separate piece of work.

### Option A — re-run the 130-record reclassification (evidence, not readiness)

The ruling's first consequence names this explicitly: re-run the frozen 130-record buffer
(`operations/trust-layer-2026-07/runs/2026-07-19/` — **do not confuse with the LIVE buffer**; the
false-hold observation clock has been STOPPED since 2026-07-17, see CLAUDE.md's Trust Layer S9 Live
bullet) through the NEW filtered reading, using `interventionInputFromAtAction` where the old
reconstruction used raw Arm-1 output. **This is evidence for the record, explicitly NOT a readiness
claim** — P4/P5/P6 are untouched by it. Read the F2 briefing's own §9
(`operations/trust-layer-2026-07/2026-07-17-F2-mentor-briefing.md`) for exactly what "the
reconstruction" did the first time, so the re-run is comparable. `code-elevated`, repo-only, no live
op.

### Option B — decide the H3 advisory's fate: remove or keep re-labelled?

The prior session re-labelled `readTrustVerdict`'s recommendation (kept it, changed `basis` to
disclose scope) rather than removing it from the harness's H3 ADVISE surface
(`harness/gate1-pre-decision/claude-code/hooks/at-action-hook.mjs`, `maybeTrustAdvisory`). The ruling
offered either. This is a **founder call**, not an AI election — ask before building either direction.
If keep: verify the harness's own log line (`rec=... mode=measure`) reads sensibly against the new
`basis` text. If remove: the harness stops reading `.recommendation` at all, `readTrustVerdict` keeps
serving `.profile`/`.aggregate` for Q7 depth calibration only.

### Option C — wire the seam to a real caller (this is where S11 G6(a) actually starts)

`interventionInputFromAtAction` exists but nothing calls it. Wiring it is the FIRST piece of the S11
write-boundary G6(a) qualification (`operations/trust-layer-2026-07/2026-07-12-mentor-consultation-
s11-enforce-gate-verdict-verbatim.md`, Q3) — but **wiring the seam to a caller is NOT the same as
flipping S11**, and must not be treated as movement toward the flip. P4 (one evaluated cardinal
domain), P5 (no denominator — the guard path writes no record), and P6 (no new observation window has
started) are ALL still open; none of them are addressed by wiring this seam. If you pick this option,
scope it as its own document first (mirroring how P1 itself was scoped) before writing code — where
would the seam's caller live, what assessment does it receive, does it need the loop-closure state
(`kathekonEngagement` injection param exists precisely for this), and what does it do with the
resulting `InterventionRecommendation` while S11 stays refused (log it? discard it? surface it
somewhere new?). That question is not answered anywhere yet.

## Standing constraints that apply regardless of which option

- **The S11 flip is refused and stays refused.** Nothing in A, B, or C licenses it. If any move in
  this session starts to feel like it's building toward flipping S11, stop and name that explicitly —
  it needs its own founder-walked Critical activation per the 2026-07-12 verdict, unconditionally.
- **D5's `false` calls at both live routes are load-bearing, not decorative.** If Option C's caller
  needs `taskHasJusticeSurface: true` for a genuine task-scoped read, that is a DIFFERENT call site
  from the two existing ones — do not flip the existing discernment/trust-record GETs to `true`.
- **PR19 independent review was offered, not run, at the prior close.** If this session's work grows
  beyond a small follow-on (especially Option C), consider it before calling anything done.
- **Verify claims against source, not against this file or the decision log's prose.** The prior
  session corrected itself twice in one sitting (a miscounted call-site total; a wrong assumption
  about reducer behavior on zero circles) — both caught by running the actual code, not by re-reading
  what had already been written. Same discipline applies here.

## Not in scope for this follow-on session

- Anything about the standing-runner design track (`operations/agent-circles-2026-08/`) — that is a
  separate, parallel stream; do not fold it in even if a stray file from it appears in `git status`.
- The `2026-09-01-score-save-perimeter-activation-NEXT-SESSION-PROMPT.md` file sitting untracked in
  the repo — it predates this stream and is not this session's responsibility unless the founder
  explicitly redirects to it.
