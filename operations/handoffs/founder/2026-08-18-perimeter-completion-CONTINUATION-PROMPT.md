# Continuation — finish the perimeter closure (3 routes, 3 registrations, floors, PR19)

**Paste as the first message of a new session, in the `sagereasoning` repo root.**
**Tier: `code-critical`** (R20a perimeter, AC5). **PR19 mandatory before this is treated as verified.**

**This continues an in-flight session — the tree is mid-build and `tsc`-clean at every step.**

---

## Step 0 — Open

Read `/adopted/standing-protocol-cache.md`, then this file, then the TWO binding rulings adopted
today (verbatim wins over every paraphrase here):

- `operations/trust-layer-2026-07/2026-08-17-mentor-ruling-limitations-perimeter-practice-family-verbatim.md`
- `operations/trust-layer-2026-07/2026-08-18-mentor-ruling-unauthenticated-public-surface-verbatim.md` ← **NEW today**

**Check HEAD, do not assume it.** The 2026-08-18 prompt's own "expected HEAD" was stale on arrival —
that has now happened three sessions running.

**Byte-identity guard posture:** verified DORMANT this session (`GATE1_FALSE_HOLD_CAPTURE` unset in
both the process env and `.claude/settings.local.json`). **Re-verify first-hand; never infer from a date.**

---

## What is DONE (all verified, nothing assumed)

**The exhaustiveness sweep — the mentor's RULED PREREQUISITE — is built and rebuilt.**
Lives at the end of `website/src/lib/__tests__/r20a-invocation-guard.test.ts`.

- **Predicate is deliberately PROXY-FREE**: write verb + reads caller input. No auth term, no content
  term. This is the ruled design and the reasoning is in the file header — read it before touching it.
- **25 exclusion entries**, each with a first-hand reason.
- Hardened stripper (`stripCommentsAndStringLiterals`) closes a **latent vacuous-pass class** in the
  pre-existing battery: a route quoting the AC5 pattern inside a *string literal* passed the "calls it"
  assertion without calling it. `founder/hub` proves such text exists here.

**14 of 17 routes wired**, `tsc` 0 after every single edit:
the full ruled practice family (view-from-above, morning, premeditatio, hupexairesis, sage-compass,
oikeiosis, oikeiosis/extension), `/api/evaluate` (**gated behind requireAuth per the new ruling, then
screened**), both journal-week, both baseline, compose, execute.

**A third `buildMildSupportResources` variant `'practice'`** was added under founder-signed wording.

---

## What REMAINS — in order

### 1. Wire 3 routes (pattern is established; copy `/morning` or `/hupexairesis`)
- `src/app/api/mentor-appendix/route.ts` — `answers` (Record<qid, answer>), practitioner prose
- `src/app/api/mentor-profile/route.ts` — `profile` object; free text lives in
  `causal_tendencies.description`, `oikeiosis_map[].evidence`, `proximity_estimate.description`, `founder_facts`
- `src/app/api/founder/hub/route.ts` — `message`, TEXT_LIMITS.long, persisted + LLM-bound. Use `'skill'` variant.

**Variant rule (founder-elected):** `'practice'` for the mentor-examination family; `'skill'` for
`compose`, `execute`, `founder/hub`.

### 2. Register 3 routes that ALREADY screen but are absent from the registry
`founder/hub/ring-proof`, `mentor/ring/proof`, `support/agent/proof`. No code change — they call
`enforceDistressCheck` correctly today, but the battery does not assert it, so a refactor could delete
the check with the suite still green.

### 3. Registry + BOTH count floors IN THE SAME EDIT
Add all 20 to `HUMAN_FACING_POST_ROUTES`; bump the floor **22 → 42**. Substrate-gate floor stays 2.
**The file's own standing lesson:** a floor left at the previous count stops guarding the newest
member. It has already been missed once here.

### 4. Fix stale prose at guard lines ~432/446
Says "20 route-level ... = 22 routes overall" while asserting `>= 22` route-level. Pre-existing drift.

### 5. `npm run build` — MANDATORY
`tsc` does not catch Next.js route-export violations. Standing lesson in this repo.

### 6. PR19 — PAUSE before launching (founder drops the model setting), PAUSE after (restores it)

---

## Traps — every one of these bit somebody today

1. **Do NOT screen `/api/evaluate` while unauthenticated.** The ruling forbids it explicitly as a
   standalone fix. It is now gated, so screening is correct — but never re-open it to anonymous access.
2. **Do NOT re-narrow the sweep predicate to a content match.** It was built and MEASURED: matching on
   `validateTextLength || TEXT_LIMITS || LLM call` **drops three live registered members**
   (gap4, founder-facts, stoa) because they store free text without validating length or calling an LLM.
3. **Do NOT use `Edit` with `replace_all` on return paths.** `/api/execute` has two identical envelope
   returns in different branches; only one is the routing branch.
4. **`/sage-compass`: `distance` is FREE TEXT, `distance_reading` is the enum.** `distance` IS in the
   distress subject — that is not a #14 violation (crisis screening ≠ grading), documented in-file and
   confirmed by its 789/0 pins.
5. **Do NOT commit `website/src/data/environmental-context.json`** (pre-existing stale scan).
6. **`premeditatio`'s boundary assertion was rewritten** to express intent rather than literal equality.
   PR19 should treat that as a finding to disprove, not a fix to confirm — the author changed a test
   that caught him. Mutation-verified both directions, tree byte-restored.

---

## Carried findings — NOT fixed, deliberately

- **`mentor-appendix` ordering bypass**: `refinement: {}` passes the only guard, so baseline answers
  persist without ever calling the gating route. Founder elected screen-only; the integrity hole stands.
- **`founder/hub` briefs its agent personas** that the perimeter is "the 8 human-facing POST routes."
  It is 22, going to 42. Stale embedded knowledge block.
- **`/api/guardrail` perimeter membership** remains a deferred founder election from 2026-06-19.
- **M-4 obligations 1 and 4** untouched this session; the disclosure still GATES the retirement.

---

## The claim that may now be published — and its condition

Gating `/api/evaluate` makes the `/limitations` "every time" claim true **by removing the exception
rather than covering it**, which the mentor called "the cleanest resolution... It should be taken."

**But publication is still gated on:** the 3 remaining routes wired, the registry updated, and the
**corrected sweep re-run green** — the ruling requires the re-run explicitly, "to confirm no eighth
surface exists on the same terms." Until the battery is green, `/limitations` does not change.
