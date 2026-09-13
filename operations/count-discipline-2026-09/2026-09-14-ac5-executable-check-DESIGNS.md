# §AC5 executable check — BOTH designs, prepared for the founder's election

**Authored 2026-09-14 (from `date`) by session `sagereasoning-8a [fdb13d]`, under
`operations/handoffs/founder/2026-09-14-conforming-opener-third-pass-and-pre-W2-elections-NEXT-SESSION-PROMPT.md`
Task B. Tier: `governance` / documents. AC7 NOT engaged.**

> **⛔ DESIGN ONLY. NOTHING IS BUILT.** No test file was edited, no assertion was added, and
> `manifest.md` is untouched. **Both designs are written out so that the founder's A-or-B election is
> immediately actionable by the next session** — building the wrong one is worse than building none.

**The mentor's item, verbatim** (2026-09-13, Q-S2-collision ruling, founder-items section):

> "pair whichever resolution is chosen with an executable check. A written instruction has failed to
> arrest this drift three consecutive times. An executable check is the only remedy that does not
> depend on a reader noticing."

**The election this waits on** is §EDIT 2 of
`operations/handoffs/founder/2026-09-13-manifest-edits-FOR-FOUNDER-ACT.md` — Option **A** (delete the
route-level enumeration, keep the substrate-gate pair) or Option **B** (keep the enumeration, relabel
the claim honestly). Option **C** in that file is *"add an executable check"* — this document is what
C means in practice, for each of A and B.

---

## 0. ⚠ WHERE THE CHECK WOULD ACTUALLY RUN — corrected in-session, and the correction improves the design

> **⚠ THIS SECTION ORIGINALLY STATED, AS A VERIFIED FACT, THAT NO PRE-COMMIT HOOK EXISTS. THAT WAS
> FALSE, AND IT WAS THE MOST PROMINENT CLAIM IN THIS DOCUMENT.** It was caught the only way it could
> have been — **this session's own commit ran the hook.** The original check was
> `[ -f .git/hooks/pre-commit ]`, which is the wrong location: hooks here are wired through
> `core.hooksPath`. **The single-location check is the error, not the missing file.** The corrected
> facts below are better for the design than the false ones were, and they change the recommendation.

**Verified first-hand after the hook fired:**

| Claim | Check | Result |
|---|---|---|
| A pre-commit hook exists | `git config core.hooksPath` | **YES** — `.husky/_`; the script is `.husky/pre-commit` |
| It blocks on failure | read the script | **YES** — *"Boundary battery FAILED -- commit blocked"* |
| It runs a `tsx` battery already | read the script | **YES** — `human-practitioner-boundary.test.ts`, **ALWAYS, whole repo**, not staged-scoped |
| It runs `r20a-invocation-guard.test.ts` | grepped | **NO.** Its only `r20a` references are ESLint targets (`r20a-classifier.ts`, `r20a-cost-tracker.ts`) — **not the registry battery** |
| It fails open without `npx` | read lines 73–74 | **YES** — *"WARNING — npx not found. Safety checks skipped."* |

### What this means for the design — and it is the most useful thing in this document

**An AC5 assertion added to `r20a-invocation-guard.test.ts` would NOT run on commit as things stand**,
because that battery is not in the hook. So placement alone does not make it a gate.

**But the remedy is now cheap and certain instead of speculative.** The hook already exists, already
blocks, already runs `npx tsx` on a whole-repo battery, and already has a proven always-on (not
staged-scoped) pattern with a written rationale for why always-on is necessary. **Adding the registry
battery to it is one more invocation in a mechanism that is already load-bearing** — not new
infrastructure.

**Recommendation, revised:** whichever of A/B is elected, **pair the assertion with adding
`src/lib/__tests__/r20a-invocation-guard.test.ts` to `.husky/pre-commit`.** Without that, the check
runs only when someone happens to run the battery — which is a convention, and this section's whole
history is that conventions do not arrest this drift.

**Two honest caveats on that recommendation:**

1. **Cost.** The registry battery is large (700+ assertions, dozens of file reads). Adding it to an
   always-on hook adds that to **every commit in the repository**. Whether that is acceptable is the
   founder's call, and a staged-scoped trigger is **not** an adequate substitute — §AC5 and the
   registry can drift apart in a commit that stages neither.
2. **Founder item F-D is now verified, not merely carried.** The hook **fails open** when `npx` is
   absent (lines 73–74) — so on a machine or client without `npx` on PATH, every check above,
   including any AC5 assertion, is silently skipped with a warning. **F-D is the difference between a
   gate and a gate with a documented bypass.** It is on the standing list and was carried unverified;
   it is verified here.

## 1. The defect being guarded — re-derived at this writing, not quoted

| Claim | Re-derived | Result |
|---|---|---|
| `HUMAN_FACING_POST_ROUTES` | parsed from the array body | **43** |
| `SUBSTRATE_GATE_ROUTES` | parsed from the array body | **2** |
| Total | | **45** |
| §AC5's stated figures | read from `manifest.md` | forty-five / forty-three / two — **correct today** |

**The defect is form, not staleness.** `manifest.md` §AC5 bolds:

> **This section does not hand-enumerate route-level membership.**

…and the two paragraphs immediately below enumerate all 43 route-level members by name (13
unconditional + 30 flag-gated). **The section asserts a discipline and breaks it in the next breath.**

**This section's drift history is the reason an assertion is warranted:** the count has been wrong
here three times (eight → thirteen → 44-against-a-live-45), each found not by a scheduled audit but by
a session that happened to re-derive from source. The sibling precedent in the registry test itself
went stale **five** times, twice while carrying its own emphatic warning not to hand-maintain it.

---

## 2. Two gaps in the options as offered — surfaced here, not silently designed around

**⚠ GAP 1 — Option A does not fully discharge the defect, and the check must cover what it leaves.**

Option A removes the enumeration but does not change the bolded sentence. That sentence **itself
hand-maintains two counts**, in its own parenthetical:

> …a session needing the current membership reads `HUMAN_FACING_POST_ROUTES` (route-level, includes
> both the **30** currently flag-gated members and the **13** that screen unconditionally)…

So after Option A the bolded claim becomes *true*, while two live, drift-prone integers remain inside
the sentence making it. **The Option A check is therefore specified below with two assertions, not
one** — no enumeration *and* every live count matching the arrays. Without the second, Option A
buys a true sentence and keeps the drift.

**This is an observation about the option, not a change to it.** The founder may elect A as written
and take the check as specified; or may elect A and additionally strike the parenthetical, in which
case assertion A2 stays anyway as the class guard.

**⚠ GAP 2 — §AC5's headline numbers are SPELLED-OUT WORDS, and a digit regex misses them entirely.**

> The R20a vulnerable-user protections apply to **forty-five** routes … **forty-three route-level** …
> plus **two substrate-gate** …

The existing sibling guard in the registry test matches on `\b\d+\s+route-level`. **Pointed at §AC5 it
would return zero offenders and look green** while the section's most prominent count sat two lines
above, in words. Both designs below therefore carry a word-number → integer mapping, and **this is one
of the mandatory mutations.**

---

## 3. Shared design decisions (both options)

### 3.1 Where it lives — `website/src/lib/__tests__/r20a-invocation-guard.test.ts`

Appended as a new block at the file's end, beside the existing self-scans.

**Four reasons, each verified first-hand:**

1. **The registry arrays are in scope there and nowhere else.** `HUMAN_FACING_POST_ROUTES`,
   `SUBSTRATE_GATE_ROUTES` and `FLAG_GATED_ROUTE_LEVEL_ROUTES` are module-private `const`s in that
   file. A separate test file would have to re-parse them out of the source by regex — the fragile
   indirection this project keeps getting burned by — or they would have to be exported, which edits
   that file regardless.
2. **The file already reads repo-root files.** Line ~1448 establishes
   `const repoRoot = path.resolve(websiteRoot, '..')` and `fs.existsSync(path.join(repoRoot, ruling))`
   for the RULED_PERIMETER_MEMBERS block. **`manifest.md` needs no new path machinery** — it is
   `path.join(repoRoot, 'manifest.md')`.
3. **Its sibling guard is the same class one document over.** The file already asserts that *its own*
   docstring carries no hand-maintained perimeter count. AC5 is that failure in `manifest.md`. Keeping
   the pair together means a session fixing one sees the other.
4. **It does not match `GUARD_RE`.** Re-verified this session against the live regex in
   `website/src/app/logos/__tests__/human-practitioner-boundary.test.ts`: the path
   `website/src/lib/__tests__/r20a-invocation-guard.test.ts` does **not** match. **No waiver is
   needed.** (Re-verify at build time — the regex is the authority, not this line.)

**The one argument against, stated:** that file is already long and is nominally an *invocation*
guard, so a governance-prose check mixes concerns. Judged outweighed by (1) — the alternative is
re-parsing the registry, which is worse.

### 3.2 Reading the section — shared extraction

Both designs need the same three helpers. Specify them once, shared by whichever is built.

- **`ac5Body`** — `manifest.md` sliced from the line matching `/^### AC5\b/` to the line before the
  next `/^### AC\d/`. **Assert the slice is non-empty and contains the bolded sentence's anchor text**
  — otherwise a renamed heading silently empties the body and every assertion below passes vacuously.
  *(This is the vacuity trap the sibling guard's "non-vacuity 2" was added for: a scan that reaches
  nothing returns zero offenders and looks green.)*
- **`stripHistorical(body)`** — removes dated historical-record blocks so past enumerations and past
  counts are not read as live claims. §AC5's corrections are markdown blockquotes opening
  `> **Count correction (<date>…` or `> **Prior correction (<date>…`; a block runs to the next
  non-`>` line. **Keeping these is mandatory** — the founder-act file says so explicitly, and they are
  the record of three failures.
- **`numbersIn(text)`** — returns integers from **both** digits and spelled-out number words
  (`one`…`twenty`, then the tens and the hyphenated compounds through at least `ninety-nine`).
  Per GAP 2 this is not optional.

### 3.3 Failure style

Follow the file's established style: a plain `assert(cond, message)` where the **message names the
remedy, not just the breach** — e.g. *"derive it from `HUMAN_FACING_POST_ROUTES.length +
SUBSTRATE_GATE_ROUTES.length`; do not write the number."* The sibling guard's message also carries
the drift count (*"this number has now gone stale five times"*), which is worth keeping: it tells the
next reader why the assertion exists rather than inviting them to bump an integer.

---

## 4. OPTION A — the check for "the section carries no route-level enumeration"

**Elect this if §AC5's route-level member lists are deleted.**

### A1 — no route-level enumeration

**Assertion.** After `stripHistorical`, §AC5 contains **no route-path token** (`/api/…`) other than
the allowlisted substrate-gate pair.

```
ALLOWED_ROUTE_TOKENS = new Set(SUBSTRATE_GATE_ROUTES.map(e => e.route → '/api/...' form))
offenders = matchAll(/\/api\/[A-Za-z0-9/_-]+/g) in stripHistorical(ac5Body), minus ALLOWED
assert(offenders.length === 0, ...)
```

**Why the allowlist is derived, not literal.** Option A explicitly keeps the substrate-gate pair
(*"2 members, stable since 2026-05-28, and not the thing that drifts"*). Hard-coding `/api/calling`
and `/api/practice/reflect` as string literals in the check would plant a fresh hand-maintained list
inside the guard against hand-maintained lists. **Derive the allowlist from `SUBSTRATE_GATE_ROUTES`.**
A consequence worth stating: if a third substrate-gate member is ever added, the allowlist widens
automatically and §AC5's pair becomes silently incomplete — so A1 is paired with **A3** below.

**Also rejected:** matching only inside backticks. §AC5's enumerations are backticked today, but a
future edit writing them as plain text would slip past. Match the token anywhere.

### A2 — every live count matches the arrays *(this is GAP 1's half; do not drop it)*

**Assertion.** Every integer in `stripHistorical(ac5Body)` that sits in a counting context —
adjacent to `route-level`, `substrate-gate`, `flag-gated`, `unconditional`, `routes`, or `members` —
equals the corresponding array length. Use `numbersIn` so the spelled-out headline is covered.

Expected today: `43` route-level, `2` substrate-gate, `45` total, `30` flag-gated, `13` unconditional
— all derived at runtime from `HUMAN_FACING_POST_ROUTES.length`, `SUBSTRATE_GATE_ROUTES.length`,
`FLAG_GATED_ROUTE_LEVEL_ROUTES.length`, and the difference for the unconditional count. **No integer
literal appears in the check.**

### A3 — the substrate-gate pair, if enumerated, is exactly the array

**Assertion.** The set of allowlisted tokens actually *present* in §AC5 equals the full set derived
from `SUBSTRATE_GATE_ROUTES` — so the retained pair cannot silently fall behind a third member.

### A — mutations that MUST make it fail

Each must be demonstrated red, then reverted, and the restoration hash-verified.

| # | Mutation on `manifest.md` §AC5 | Must fail | Catches |
|---|---|---|---|
| **A-M1** | Re-add one route-level member, e.g. `/api/journal`, to the live body | **A1** | the enumeration creeping back one line at a time |
| **A-M2** | Re-add the whole *Flag-gated (30)* paragraph | **A1** | wholesale reversion |
| **A-M3** | Change the parenthetical's `30` to `29` | **A2** | GAP 1 — the count inside the sentence |
| **A-M4** | Change the headline **word** `forty-three` to `forty-two` | **A2** via `numbersIn` | **GAP 2 — the spelled-out number a digit regex misses** |
| **A-M5** | Delete one entry from `SUBSTRATE_GATE_ROUTES` in the registry | **A3** | the array moving out from under the doc |
| **A-M6** | Rename the heading `### AC5` to `### AC5a` | **the non-empty/anchor assertion** | the vacuity trap — an empty slice passing green |
| **A-M7** | Wrap a live enumeration in a `>` blockquote with no date marker | **A1** | the historical carve-out being used as a bypass |

**A-M4 and A-M6 are the two that a naively-written check fails to catch.** If either passes green, the
check is not finished.

---

## 5. OPTION B — the check for "any enumeration matches the registry exactly"

**Elect this if the member lists stay and the bolded claim is replaced with the honest
snapshot-and-not-authoritative wording.**

### B1 — set equality, both directions

**Assertion.** The set of route tokens enumerated in `stripHistorical(ac5Body)`, partitioned into its
*unconditional* and *flag-gated* groups by the markdown sub-headings, equals the set derived from the
arrays — **with both directions asserted separately and reported separately**:

- `missingFromDoc` — in the arrays, absent from §AC5. *(The classic failure: a route joins the
  perimeter, the doc is not updated.)*
- `extraInDoc` — in §AC5, absent from the arrays. *(A route is removed or renamed and the doc keeps
  it — the doc then over-claims the safety perimeter, which is the worse direction.)*

**Report both in the failure message.** A single "sets differ" tells the next reader nothing about
which way the drift ran, and the two directions have different severity.

### B2 — group assignment is correct, not merely membership

**Assertion.** A route listed under *Unconditional* is absent from `FLAG_GATED_ROUTE_LEVEL_ROUTES`,
and a route listed under *Flag-gated* is present in it.

**Why this is a separate assertion and not a nicety.** B1 alone is satisfied by a doc that lists all
43 correct routes in the *wrong two groups*. §AC5's groups carry a safety meaning — *unconditional*
says the route screens on **every** call — so a flag-gated route mislisted as unconditional is a
governing safety document over-claiming protection. B1 cannot see that; B2 can.

### B3 — the counts match, same as A2

Identical to A2, and for the same reason: Option B's replacement wording keeps counts in prose.
Reuse the assertion verbatim — one implementation, elected once.

### B4 — the honest-claim wording is present

**Assertion.** §AC5 does **not** contain the old sentence *"does not hand-enumerate route-level
membership"*, and **does** contain a not-authoritative marker (e.g. `not authoritative` /
`dated snapshot`).

**Stated as the weakest assertion here, deliberately.** It is string-matching on prose and will fail
on any legitimate rewording. **Its value is narrow and real:** it stops a future editor reinstating
the old bolded claim on top of a live enumeration, which is exactly today's defect. If the founder
would rather not pin prose, **drop B4 and keep B1–B3** — the substantive guard is intact without it.

### B — mutations that MUST make it fail

| # | Mutation | Must fail | Catches |
|---|---|---|---|
| **B-M1** | Delete `/api/score/save` from §AC5's flag-gated list | **B1** (`missingFromDoc`) | the doc lagging the registry — the 2026-09-04 drift, reproduced |
| **B-M2** | Add a plausible non-member, e.g. `/api/community-map`, to §AC5 | **B1** (`extraInDoc`) | the doc over-claiming the perimeter |
| **B-M3** | Move `/api/score-conversation` from *Flag-gated* to *Unconditional* | **B2** | **the mis-grouping B1 is blind to** |
| **B-M4** | Change the headline word `forty-five` to `forty-four` | **B3** via `numbersIn` | **GAP 2** |
| **B-M5** | Restore the bolded *"does not hand-enumerate"* sentence | **B4** (if built) | reinstating the contradiction |
| **B-M6** | Rename the heading `### AC5` | the anchor assertion | the vacuity trap |
| **B-M7** | Add a route to `HUMAN_FACING_POST_ROUTES` without touching §AC5 | **B1** (`missingFromDoc`) | the real-world direction — a genuine perimeter addition |

**B-M3 and B-M7 are the two that matter most.** B-M7 is the only mutation in either design that
reproduces the *actual historical failure* — a route joined the perimeter and the document did not
follow, silently, for over a month.

---

## 6. What NEITHER design does — stated so it is not over-read

1. **Neither runs automatically.** §0. Both depend on the battery being run.
2. **Neither validates the perimeter itself.** They compare a document against the registry arrays.
   If a route is wired but never added to `HUMAN_FACING_POST_ROUTES`, both checks pass green and the
   perimeter is still short. That is the job of the existing in-scope backstop and the ruled-membership
   block, not of this check.
3. **Neither stops a determined editor.** Both the historical carve-out and the arrays are editable.
   The check raises the cost and removes the *silent* failure; it is not a lock.
4. **Neither covers `CLAUDE.md`**, which carried the identical failure at the same moment and now
   carries its own written instruction not to quote the number forward. **Extending the same scan to
   `CLAUDE.md` is a natural follow-on and is deliberately not designed here** — it was not asked for,
   and `CLAUDE.md` legitimately carries many dated historical counts, so the historical carve-out
   would need to be much more permissive and would need its own mutation work.

---

## 7. If the founder elects A **and** B-style coverage

They are not mutually exclusive in implementation: **A2/B3 are the same assertion**, and A1 is the
logical negation of B1's scope. A sensible build order, if C is elected at all:

1. Build the three shared helpers (§3.2) with their non-vacuity assertions.
2. Build **A2/B3** (the count assertion) — it is needed under *both* options and is the one that
   catches GAP 2.
3. Build A1+A3 **or** B1+B2 (+B4) according to the election.

**PR19 applies** — an independent review of whichever is built, per the standing rule for any pin
whose mutation coverage is the whole point.

---

## 8. Verified first-hand at this writing

| Claim | Check | Result |
|---|---|---|
| `HUMAN_FACING_POST_ROUTES` / `SUBSTRATE_GATE_ROUTES` | parsed from array bodies | **43 / 2** |
| §AC5's stated figures | read from `manifest.md` | forty-five / forty-three / two — correct |
| §AC5 contradiction | read lines 370–378 | **present** — bolded claim, then 43 members enumerated |
| §AC5 headline numbers are words not digits | read | **confirmed — GAP 2 is real** |
| The parenthetical hand-maintains 30 and 13 | read | **confirmed — GAP 1 is real** |
| `GUARD_RE` vs the registry test path | matched against the live regex | **does NOT match — no waiver needed** |
| The registry test already reads repo-root files | read line ~1448 | **confirmed** (`repoRoot`) |
| Pre-commit hook | `git config core.hooksPath` + read `.husky/pre-commit` | **EXISTS and blocks** — runs the measurement-integrity battery always; **does NOT run the registry battery**; **fails open without `npx`** (F-D). *An earlier claim in this file that no hook exists was false and is corrected at §0.* |
| Sibling precedent | read the docstring-count block | **confirmed**, incl. its three non-vacuity assertions |

**Nothing was built. `manifest.md` is untouched. No test file was edited. The A-or-B election is the
founder's, and this document changes neither option.**
