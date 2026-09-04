# Count-discipline sweep — findings

**2026-09-05.** Item A of `2026-09-05-post-ruling-autonomous-work-NEXT-SESSION-PROMPT.md`.
Tier: `governance` + one committed test change. **No production read, no migration, no flag, no
credential, no spend.** Public-surface wording was **drafted, not applied** (R18).

Every count in this document was **derived from source**, never quoted from a governing document.
Line numbers are as of this date; prose is cited by quoted opening text, because line citations rot.

---

## Summary

| # | Finding | Severity | Status |
|---|---|---|---|
| 1 | Three public R18 surfaces document an assessment contract that returns **HTTP 400**. Stale ~5 months. | **High** (nil exposure) | **Drafted, needs R18 sign-off** |
| 2 | The 2026-09-04 count-drift assertion scanned only the file header; three stale counts sat outside it — fifth recurrence | Medium | **Fixed + enforced** (`1ecff99`) |
| 3 | Four sibling test docstrings carried stale perimeter counts | Low | **Fixed** (`1ecff99`) |
| 4 | `api-docs/page.tsx` documents a request/response shape for both assessment endpoints that the routes never accepted | **High** (nil exposure) | **Scoped, not fixed** — needs its own item |
| 5 | `component-registry.json`, pass-through field counts, D6a measurement counts | — | **Clean** — verified, no drift |

**Exposure is nil for all of the above.** The project is pre-0h with no external users. The severity
is about the R18 surface being the one whose entire purpose is honest public claims.

---

## Finding 1 — the assessment contract on the public surfaces returns 400

### What the code actually enforces

Derived from source, not from any document:

| Fact | Value | Source |
|---|---|---|
| Free-tier assessment IDs | **14** — `FD-01`…`FD-07`, `AM-01`…`AM-07` | `src/lib/agent-assessment.ts` `FREE_ASSESSMENT_IDS` |
| Free route hard gate | `responses.length !== 14` → **400** | `api/assessment/foundational/route.ts` |
| Phase count | **8** | `V3_ASSESSMENT_PHASES` |
| Phase 1 / 2 names | **Foundations** / **Architecture of Mind** | `V3_ASSESSMENT_PHASES` |
| Total assessments | **55** (7+7+7+7+9+7+6+5) | sum of `assessment_count` |
| Paid route hard gate | `responses.length !== 55` → **400** | `api/assessment/full/route.ts` |
| Paid route self-doc | "Full **55**-assessment evaluation across all **8** phases" | same file, `description` |
| `SO-01` | **does not exist** in the assessment bank | absent from `agent-assessment.ts` |
| `scenario` field | **never read by either route** (grep count 0 in both) | both route files |

### What the public surfaces claim

| Surface | Quoted opening text | Claim | Live |
|---|---|---|---|
| `public/llms.txt` | "**Free Tier — Foundational Alignment Check (11 assessments** …" | 11 | **14** |
| `public/llms.txt` | "**Returns 11 free-tier assessment prompts (Self-Observation + Classification)**" | 11; those phase names | **14**; Foundations + Architecture of Mind |
| `public/llms.txt` | `"assessment_id": "SO-01"` in the POST example | valid ID | **invalid → 400** |
| `public/llms.txt` | "**Paid Tier — Complete Virtue Alignment Assessment (37 assessments, all 7 phases)**" | 37 / 7 | **55 / 8** |
| `public/llms.txt` | "`…all 37…`" in the POST example body | 37 | **55** |
| `public/llms.txt` | "**3. Take the Foundational Alignment Check: GET /api/assessment/foundational for the 11**…" | 11 | **14** |
| `public/.well-known/agent-card.json` | "**2. Take the Foundational Alignment Check (free)**… with your 11 self-assessment responses" | 11 | **14** |
| `public/.well-known/agent-card.json` | "**3. Review your results**… for all 37 assessments across 7 phases" | 37 / 7 | **55 / 8** |
| `public/.well-known/agent-card.json` | "**Structured self-assessment across 11 prompts (Phases 1-2: Self-Observation + Classification)**" | 11; those names | **14**; Foundations + Architecture of Mind |
| `public/.well-known/agent-card.json` | "**Full 37-assessment evaluation across 7 phases.**" | 37 / 7 | **55 / 8** |
| `src/lib/skill-registry.ts` | `assessment_id: 'SO-01'` | valid ID | **invalid → 400** |

`skill-registry.ts` is served — `/api/skills`, `/api/skills/[id]`, `/api/marketplace`,
`/api/marketplace/[id]`, `/api/compose`, `/api/execute` all import it — so its example is a
published contract, not an internal comment.

### Consequence

An agent that follows the published documentation **cannot complete either endpoint**:

* POST 11 responses to `/api/assessment/foundational` → `400` (needs exactly 14)
* POST any response with `assessment_id: "SO-01"` → `400 Invalid assessment_id`
* POST 37 responses to `/api/assessment/full` → `400 Exactly 55 responses required`

This is not a cosmetic count. It is a documented contract that cannot be executed.

### Provenance — the drift is dateable

* `224ba44` (**2026-03-29**, "agent assessments") wrote the llms.txt block with 11 / 37 / 7 / `SO-01`.
* `fe902f3` (**2026-04-01**, "manifest compliance") moved the code to 14 free / 55 total / 8 phases.
* The public documents were never updated. **Three days apart; ~5 months stale.**

This is the same shape as the perimeter-count failure, with one difference that matters: the
perimeter count was *wrong*, this one is *unusable*. A count that drifts misinforms; a contract that
drifts fails closed on the first honest attempt to use it.

### Disposition

**Drafted, not applied** — every item above is public wording and needs founder R18 sign-off. The
drafted replacement text is in the sign-off package beside this file. An executing assertion that
would have caught it, and will catch the next one, is drafted there too and should land in the same
change as the wording.

---

## Finding 2 — the count-drift guard was scoped to the header; three counts sat outside it

**Fixed and committed (`1ecff99`).** Full account in that commit message.

The 2026-09-04 assertion `docstring carries no hand-maintained perimeter count` read
`selfSrc.slice(0, selfSrc.indexOf('*/') + 2)` — the leading block comment only. Outside that slice:

* `"Current count: 42 route-level + 2 substrate-gate = 44 routes"` — live is **43 + 2**
* `"13 flag-pairs across 12 distinct routes"` — live is **31 across 30**

Both sat **directly beside assertions carrying the correct figure** (`>= 43`, `>= 31`), which were
bumped on 2026-09-02 when `/api/score/save` joined the perimeter while the sentences were not. That
is the exact *sentence-disagrees-with-its-own-assertion* failure the same file already records at its
third recurrence. **Fifth recurrence, in the file written to stop it.**

The instructive part is not that a number drifted again. It is that **the remedy was scoped to where
the last instance happened rather than to where the class can occur.** A guard aimed at one location
leaves every other location unguarded and, worse, creates the impression the class is handled.

Fix: scan the whole file, comment lines only (code is the authority and legitimately carries the
number — the first draft fired on its own assertions and on `let passed = 0`), with a dated
historical record allowed to quote stale figures. Mutation-verified in both directions, including
that it rejects a body-position count **even when numerically correct** — correct-today is exactly
what goes stale tomorrow.

## Finding 3 — four sibling docstrings

**Fixed (`1ecff99`).** `"AC5 perimeter unchanged at 10 routes"` (×2, live 43),
`"25 perimeter routes/blocks"` (×2, ~28 importing files — the route/helper/test boundary is genuinely
ambiguous, which is itself a reason not to write the number). In each the load-bearing claim was
"unchanged" / "all"; the number added nothing and was wrong. Numbers removed, claims kept.

**Not extended** to make the guard scan sibling files — that couples batteries across directories.
Named as an option, not built.

## Finding 4 — `api-docs/page.tsx` documents a contract neither route ever accepted

**Scoped, not fixed.** Both assessment entries document
`{ agent_id, scenario, context }` (and `deliberation_iterations` for the paid one) plus a response
shape the routes do not produce. Both routes require `{ agent_id, responses: [{ assessment_id,
response }] }`, and **neither reads `scenario` at all**.

This is a larger job than a count fix: it means writing correct documentation for two endpoints from
scratch, and it is public wording, so it is R18 either way. **Recommended as its own item** rather
than folded into the count sweep — folding it in would hide a rewrite inside a typo fix.

## Finding 5 — what was checked and is clean

Recorded so a later session does not re-derive it:

* **`public/component-registry.json`** — `totalComponents` 304 = `len(components)` 304;
  `statusSummary` sums to 304 with **no per-status mismatch** (wired 129, verified 54, live 113,
  designed 5, scaffolded 3). The registry maintains its counts correctly.
* **Pass-through fields** — llms.txt's "Five fields" / "Two fields" / "All seven fields" verified
  against `trust-layer/types/evaluation.ts`: 5 on `EvaluatedAction`, 2 on `CarriedProfile`. Accurate,
  and each is followed by its own bullet list, so it is locally self-verifying.
* **D6a measurement counts** — "five grave-vocabulary probes", "twenty examinations", "four
  members", "two routes", `0/0/2/2/8`, 12%, Wilson 7.0–19.8%, n=100. These describe a **frozen
  measurement**, not a live set. They do not drift and must not be "refreshed".
* **`agent-card.json` extension count** — derives to **26**. No public surface states it in prose,
  which is the correct posture. (CLAUDE.md's ~20 dated historical mentions are deliberately left.)
* **Depth-tier mechanism counts** (3 / 5 / 6) — fixed by the depth-tier definitions, not a live set.

---

## The general lesson, stated once

The project has now been bitten by this class **five times**, and the 2026-09-04 remedy did not
prevent the fifth. Two things distinguish the instances that recurred from the ones that did not:

1. **An instruction inside the drifting artifact does not arrest the drift.** Already learned.
2. **A guard scoped to where the last instance happened does not arrest the class.** This is the new
   one, and it is the more expensive of the two, because a narrow guard *looks* like coverage.

The corollary for the R18 surfaces in Finding 1: fixing the wording without landing the assertion
alongside it repeats the 2026-03-29 → 2026-04-01 failure exactly. The wording and the assertion are
one change, not two.
