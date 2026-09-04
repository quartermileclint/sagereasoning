# R18 sign-off package — assessment-endpoint contract corrections

**2026-09-05. DRAFTED, NOT APPLIED.** Every edit below is public wording and needs founder sign-off
before it goes live. Nothing in this file has been written to any public surface.

**Grounding:** `2026-09-05-count-drift-sweep-FINDINGS.md` §Finding 1. Every number was derived from
source. The routes hard-reject the currently-documented shapes, so this is a broken contract, not a
typo. Exposure is nil (pre-0h, no external users).

**Apply the wording and the assertion in ONE change.** Wording alone repeats the 2026-03-29 →
2026-04-01 failure, where the docs were written three days before the code moved and never followed.

---

## A. `website/public/llms.txt` — six edits

**A1** — section heading

```
- **Free Tier — Foundational Alignment Check (11 assessments, Phases 1-2)**
+ **Free Tier — Foundational Alignment Check (14 assessments, Phases 1-2)**
```

**A2** — the GET description. Two corrections: the count, and the phase names, which were never
`Self-Observation + Classification`.

```
- Returns 11 free-tier assessment prompts (Self-Observation + Classification). The agent reads each REFERENCE (Stoic concept) and writes a self-assessment following the ASSESS prompt.
+ Returns 14 free-tier assessment prompts (Phase 1 Foundations + Phase 2 Architecture of Mind). The agent reads each REFERENCE (Stoic concept) and writes a self-assessment following the ASSESS prompt. All 14 are required: the POST rejects any other count with HTTP 400.
```

**A3** — the POST example. `SO-01` exists nowhere in the assessment bank; the free IDs are
`FD-01`…`FD-07` and `AM-01`…`AM-07`.

```
- Body: `{ "agent_id": "<your-id>", "responses": [{ "assessment_id": "SO-01", "response": "<your self-assessment>" }, ...] }`
+ Body: `{ "agent_id": "<your-id>", "responses": [{ "assessment_id": "FD-01", "response": "<your self-assessment>" }, ...all 14... ] }`
+
+ Valid free-tier `assessment_id` values: `FD-01`–`FD-07` (Foundations), `AM-01`–`AM-07` (Architecture of Mind). Any other id returns HTTP 400.
```

**A4** — paid heading

```
- **Paid Tier — Complete Virtue Alignment Assessment (37 assessments, all 7 phases)**
+ **Paid Tier — Complete Virtue Alignment Assessment (55 assessments, all 8 phases)**
```

**A5** — paid POST example

```
- Body: `{ "agent_id": "<your-id>", "responses": [{ "assessment_id": "<id>", "response": "<your self-assessment>" }, ...all 37...] }`
+ Body: `{ "agent_id": "<your-id>", "responses": [{ "assessment_id": "<id>", "response": "<your self-assessment>" }, ...all 55...] }`
+
+ Exactly 55 responses are required, one per assessment across the 8 phases; any other count returns HTTP 400.
```

**A6** — Adoption Guidance item 3

```
- 3. Take the Foundational Alignment Check: GET /api/assessment/foundational for the 11 self-assessment prompts, complete them, POST your responses to receive your foundational alignment assessment (free, 1/day)
+ 3. Take the Foundational Alignment Check: GET /api/assessment/foundational for the 14 self-assessment prompts, complete them, POST all 14 responses to receive your foundational alignment assessment (free, 1/day)
```

## B. `website/public/.well-known/agent-card.json` — four edits

**B1** — adoption guidance

```
- "2. Take the Foundational Alignment Check (free): GET then POST to /api/assessment/foundational with your 11 self-assessment responses",
+ "2. Take the Foundational Alignment Check (free): GET then POST to /api/assessment/foundational with all 14 self-assessment responses",
```

**B2** — adoption guidance

```
- "3. Review your results — consider the full assessment (paid): POST to /api/assessment/full for all 37 assessments across 7 phases",
+ "3. Review your results — consider the full assessment (paid): POST to /api/assessment/full for all 55 assessments across 8 phases",
```

**B3** — `foundational-assessment` skill description

```
- "description": "Structured self-assessment across 11 prompts (Phases 1-2: Self-Observation + Classification). Returns …
+ "description": "Structured self-assessment across 14 prompts (Phases 1-2: Foundations + Architecture of Mind). Returns …
```

**B4** — `full-assessment` skill description

```
- "description": "Full 37-assessment evaluation across 7 phases. Returns …
+ "description": "Full 55-assessment evaluation across 8 phases. Returns …
```

**After editing, re-validate the JSON and re-derive the extension count** (expect 26 — unchanged by
these edits, which touch no extension):

```bash
cd website && python3 -c "import json;d=json.load(open('public/.well-known/agent-card.json'));print(len(d['capabilities']['extensions']))"
```

## C. `website/src/lib/skill-registry.ts` — one edit

Served via `/api/skills`, `/api/skills/[id]`, `/api/marketplace`, `/api/marketplace/[id]`,
`/api/compose`, `/api/execute` — a published example, not an internal comment.

```
- responses: [{ assessment_id: 'SO-01', response: 'I tend to prioritise my own goals.' }],
+ responses: [{ assessment_id: 'FD-01', response: 'I tend to prioritise my own goals.' }],
```

`npm run build` is **not** required (no `route.ts` / `page.tsx` touched), but `npx tsc --noEmit`
should be run.

## D. NOT included here — `api-docs/page.tsx`

Both assessment entries document `{ agent_id, scenario, context }` and a response shape the routes
never produce; neither route reads `scenario`. That is a rewrite of two endpoint entries, not a
count fix, and is **deliberately excluded** so a rewrite is not hidden inside a typo correction.
Recommended as its own R18 item.

---

## E. The assertion — apply in the same change

Draft at `2026-09-05-assessment-contract-drift.test.ts.draft`, beside this file.

**Do not move it into `src/` before the wording lands** — cases 5–10 assert the public surfaces and
will fail until then. That is deliberate: it is the "fails before the fix, passes after" shape.

Target path on apply:

```
website/src/lib/__tests__/assessment-contract-drift.test.ts
```

What it pins:

| # | Assertion | Green today? |
|---|---|---|
| 1 | `FREE_ASSESSMENT_IDS.length` equals the free route's own hard gate | yes |
| 2 | free IDs are exactly `FD-01`–`FD-07` + `AM-01`–`AM-07` | yes |
| 3 | phase count equals the paid route's stated phase count | yes |
| 4 | `sum(assessment_count)` equals the paid route's hard gate | yes |
| 5–7 | `llms.txt` states the derived free count, paid count, phase count | **no — until A1–A6** |
| 8 | `llms.txt` names no `assessment_id` absent from the bank | **no — until A3** |
| 9–10 | `agent-card.json` states the derived counts and no unknown id | **no — until B1–B4** |
| 11 | `skill-registry.ts` example ids are all real | **no — until C** |
| 12 | non-vacuity: each matcher fires on the real stale string it exists to catch | yes |

**Both directions were verified on 2026-09-05, not asserted.** The draft was run against the live
(stale) surfaces and returned **6 passed / 7 failed** — the four code-side cases and both
non-vacuity cases green, all seven public-surface cases red. Every edit in sections A–C was then
applied to scratch **copies** of the three files (no real surface touched), and the same draft
returned **13 passed / 0 failed**. That confirms three things the table alone could not:

* every anchor string in A–C matches the file byte-for-byte (a missed anchor aborts the script);
* the edits are **complete** — no residual superseded count survives anywhere in either document;
* the assertion genuinely goes green afterwards, so applying A–E in one change lands clean.

Case 8/11 is the one that matters most: it is the check that would have caught `SO-01`, which is the
part of this finding a count-only assertion would still have missed.

## F. Verification after applying

```bash
cd website
npx tsc --noEmit
npx tsx src/lib/__tests__/assessment-contract-drift.test.ts        # expect 0 failed
python3 -c "import json;d=json.load(open('public/.well-known/agent-card.json'));print(len(d['capabilities']['extensions']))"
npx tsx src/lib/__tests__/r20a-invocation-guard.test.ts | tail -1  # unaffected; expect 720 passed
```

Rollback: `git revert` the wording commit; the assertion reverts with it (it is one change).
