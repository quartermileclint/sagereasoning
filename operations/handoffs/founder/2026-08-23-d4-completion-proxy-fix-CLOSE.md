# Session Close — 2026-08-23 — D4-Completion: `ruling_faculty_state`'s deliberation proxy replaced

**Stream:** founder. **Tier:** `code-critical` (unconditional change to a measured surface + a
public-contract change). **Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessor:** `2026-08-23-atrf-ee-production-wave-CLOSE.md`. **Opened at HEAD `e462ec4`**
(== `origin/main`).

**Nothing live was touched. Nothing is pushed. One action remains and it is yours.**

## What was built

`ruling_faculty_state`'s deliberation input is now `hasGenuineDeliberation(oik)` — the
substantive-note predicate D4 introduced — instead of the legacy `deliberation_notes.length > 0`
presence proxy that counted the filler note *"No circles engaged in this snapshot."* as
deliberation. EE-C2's interim disclosure came out of all three surfaces in the same change, as the
ruling required.

The change is two edits: one argument at one call site, and the docstring whose own sentence
("ruling_faculty_state is untouched this session") became false the moment the call site changed.

**The divergence class is provably exactly one class.** `assessOikeiosis` pushes a note iff a tension
exists, a Cicero verdict is balanced, or NO circles were engaged — the first two being the predicate
— so `deliberation_notes.length > 0 ≡ hasGenuineDeliberation(oik) ∨ relevant_circles.length === 0`.
Only the zero-circle case moves. Review confirmed this structurally and over 20,176 enumerated
schemas (40,352 assessments, both flag states, zero violations).

## The flag decision, and why

**No flag.** `ruling_faculty_state` is consequential under EE-B1 on (b) served publicly, (c) carried
into the accreditation record and (d) named in an acted-upon disclosure — **but not on (a)**: nothing
floors or determines a verdict from it. `/api/guardrail`'s `proceed` comes from
`katorthoma_proximity`; the guardrail and philosophical-mode read this field for **prose only**; no
trust-event deriver, aggregator or overlay reads it at all. The §4 precedent gated a change that
moved verdicts; this moves none.

The decisive point is EE-C2 itself: it binds the disclosure's removal to the commit that fixes the
proxy, and the disclosure's truth-condition tracks when the fix *takes effect*. A flag splits those
two moments — forcing either a false public "fixed" while dark, or a deferred removal the ruling
explicitly forbids. It would buy near-zero risk reduction at the cost of fighting a binding ruling.

## Three things the prompt did not anticipate

1. **`guardrail-sandwich.ts` reads this field.** The prompt's consumer list omitted the live gate.
   It feeds `synthesizeReasoning`'s prose only — verdict unaffected — but the gate's *reasoning text*
   does change on the divergence class.
2. **`computeRulingFacultyState` has seven branches, not five**, and had **zero** test coverage of
   any kind before today.
3. **A mid-session judgement of mine was wrong, and the review refuted it with production data.**
   I judged that the fix created a new false negative. It does not: `website/smoke_a_prod.json` — a
   real consult with **two** circles, four sorted control-filter elements and causal evidence
   spanning phantasia→praxis — already reads *"Disengaged … ruling faculty at rest"* under the
   **pre-fix** code. The true limitation is different and pre-existing (below).

## PR19 — one round, six dimensions, 18 agents, 0 errors, ~5.2M tokens, twelve findings, all folded

Two dimensions CLEAN. The two that mattered most:

- **The battery could not detect a 50% mutation of the very predicate the fix wires in.** Deleting
  `c.tension !== null` left it green at 101/0, because every "genuine deliberation" fixture also
  carried a `local_community` circle that independently yields a balanced verdict — so the fixture
  *named* "cross-circle tension" was never tension-only. This mattered beyond prose: the same
  predicate governs the live flag-on proximity path. Folded with a genuinely tension-only fixture
  plus a decay guard so the coverage cannot silently rot.
- **The closure records cited a decision-log entry that did not exist** — I had drafted it to a
  scratchpad and never appended it, while two files cited it as the authority for "BUILT". Folded.

Also folded: the Overwhelmed guard's off-diagonal; **two of my own "non-vacuity floor" assertions
that could not fail** (the exact failure mode the standing memory on non-vacuity floors names);
`proximity-dikaiosyne.test.ts`'s now-false flag-off byte-identity header; the call-site comment's
flag-independence *reason*, which was a non-sequitur even though its conclusion was true; the
non-emptiness lemma the theorem's argument left implicit; the map's self-contradicting bullet; and
the R18 sign-off package, which still presented the retired wording as copy-pasteable proposed text.

**Every fold mutation-verified.** Five mutations, all now biting: tension-disjunct **2 fails (was 0)**,
balanced-disjunct 6, call-site revert 13, flag-off-branch narrowing 3, Overwhelmed-guard weakening 3;
restored **0**.

## Verification

New battery **120/0**. All 16 translation-sandwich suites green; `guardrail-sandwich` 91/91;
downstream consumers `sage-assent-bridge` 33/0, `agent-assessment-history-store` 120/0,
`philosophical-mode-service` 43/0 (needs `--env-file`, per CLAUDE.md's suite note),
`agent-hand-back-report` 54/0, `score-architecture` 69/0. `tsc --noEmit` **0**; `npm run build`
**0**. `agent-card.json` re-parses, **24 extensions** (unchanged — the extension stays, only the
clause went). Neither public surface still contains the interim disclosure.

**Byte-identity guard:** `GATE1_FALSE_HOLD_CAPTURE` confirmed **absent** from the harness env block
at open — no observation window running, so per the 2026-08-15 M1 ruling it did not bind.

## Status changes

| Item | Old | New |
|---|---|---|
| `ruling_faculty_state` deliberation input | legacy presence proxy | substantive-note predicate — **Verified**, unflagged |
| EE-C2 interim disclosure (3 surfaces) | Live | Removed |
| `2026-08-23-D4-completion-proxy-fix-WORK-ITEM.md` | OPEN | **CLOSED** |
| `computeRulingFacultyState` test coverage | none | 120 assertions, 5-way mutation-verified |

## Open questions

- **Does the oikeiosis-only deliberation bound owe a public scope note?** The field's deliberation
  reading is drawn *solely* from the oikeiosis mechanism, so a snapshot deliberating in the
  control-filter, value-assessment or causal-stage mechanisms reads as not-deliberating. This is
  **pre-existing**, not created here, and is **not** what EE-C2's label disclosed. It is now named in
  the documentation map's new **§5b** with proposed one-sentence wording left **unsigned and
  unpublished** — adding public wording is R18-gated on your signature, and whether the bound owes a
  label under EE-C2's own reasoning is a mentor question this session declined to answer for you.
- `computeProximity`'s `!dikaiosyne` branch deliberately keeps the raw legacy proxy. Now pinned by a
  battery assertion that goes red if a later session "tidies" it.

## Founder Verification — the one remaining action

The commit is **path-scoped on purpose**: `website/src/data/environmental-context.json` carries an
unrelated weekly-scan refresh that predates this session and must not ride in.

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning" && git add website/src/lib/translation-sandwich/layer2-mechanisms.ts website/src/lib/translation-sandwich/__tests__/ruling-faculty-deliberation.test.ts website/src/lib/translation-sandwich/__tests__/proximity-dikaiosyne.test.ts website/public/llms.txt website/public/.well-known/agent-card.json operations/agent-circles-2026-08/2026-08-23-evaluative-engine-status-documentation-map.md operations/agent-circles-2026-08/2026-08-23-evaluative-engine-shape1-r18-signoff-package.md operations/agent-circles-2026-08/2026-08-23-D4-completion-proxy-fix-WORK-ITEM.md operations/decision-log.md operations/handoffs/founder/2026-08-23-d4-completion-proxy-fix-CLOSE.md && git status --short --untracked-files=no
```

Review the staged set, then commit and push. On push, the two public surfaces lose the interim
disclosure and the engine change goes live on `/api/reason` and `/api/guardrail`.

**Rollback:** `git revert` the commit. No flag, no schema, no migration, no credential — nothing to
unwind live.

## Cross-references

- `operations/decision-log.md` — `D-D4-COMPLETION-RULING-FACULTY-DELIBERATION-PROXY-REPLACED-2026-08-23`
- `operations/agent-circles-2026-08/2026-08-23-D4-completion-proxy-fix-WORK-ITEM.md` — CLOSED, with the per-surface gate record
- `operations/agent-circles-2026-08/2026-08-23-evaluative-engine-status-documentation-map.md` — §4 removed; new §5b names the remaining bound
- `operations/handoffs/founder/2026-08-23-d4-completion-proxy-fix-NEXT-SESSION-PROMPT.md` — the prompt this session ran (now spent)

*End of close. One well-scoped fix, twelve review findings folded, every gate green — stopped at the
threshold of the single action that needs your hand.*
