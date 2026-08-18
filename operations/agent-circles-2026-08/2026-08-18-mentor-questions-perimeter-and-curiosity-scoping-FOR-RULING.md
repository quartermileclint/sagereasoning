# Mentor questions — perimeter claim bounds + curiosity/taxonomy scoping

**Prepared 2026-08-18 for founder relay.** Five questions. **Q2 and Q3 are blocking** (they bear on
what may be published); **Q1, Q4, Q5 are not blocking** but shape the next build.

**PR20 compliance:** each question states, as one-sentence mechanism-level facts, the specific
existing behaviour a ruling would land on. Where a fact is recorded-but-not-independently-verified by
the author, it is marked as such rather than asserted.

**Context the mentor may not have:** since the 2026-08-17 and 2026-08-18 rulings, the perimeter work
completed. 42 route-level + 2 substrate-gate = 44 registered members, 29 reasoned exclusions, 73
in-scope routes, zero unclassified; the ruled exhaustiveness sweep runs green. The perimeter is
**built, not activated** — `/limitations` is unchanged and publication remains gated on live
confirmation, per the 2026-08-17 ruling.

---

## Q1 — The `taxonomy-question` outcome: is it still wanted, and on what rationale?

**Not blocking.** From the 2026-08-18 exploratory-session relay, immediate-scope item 4.

**The instruction.** Introduce a named stub outcome `taxonomy-question` on the IDEA loop, "visible in
the watching table's outcome column so that when it fires during the bounded validation run, it is
identifiable."

**Mechanism facts:**
1. `idea_loop_cycles.cycle_outcome` is `NOT NULL CHECK (cycle_outcome IN ('winner','null_cycle',
   'dependency_unavailable','terminated_by_timeout'))` — four values, on a live production table
   holding real validation-run rows.
2. Adding a fifth value is therefore a production migration applied TEST→prod, founder-walked, with
   the widened CHECK landing **before** the code that can write it (the `not_selected` precedent,
   2026-08-10). It is not a code-only stub.
3. **The bounded validation run closed 2026-08-16 at cycle 20 on your own ruling; cycle 21 was never
   opened.** The stated rationale — identifiable when it fires during that run — cannot be met.
4. Every live outcome value is snake_case (`null_cycle`, `terminated_by_timeout`, `not_selected`);
   `taxonomy-question` as written is kebab-case and would be the only one of its kind.

**The question.** Given the run has closed: is the outcome value still wanted? If so, on what
rationale — the standing-runner design? — and under what spelling? We have deliberately **not**
executed it, rather than substitute a rationale you did not give for one that has expired.

---

## Q2 — Your predicate instruction was tested and failed. We substituted. Is the substitution accepted?

**BLOCKING** — it bears directly on what the sweep verifies, and the sweep is the prerequisite you
set for publishing any coverage claim.

**Your ruling, verbatim (2026-08-18):** "The predicate should be rebuilt to match on human-facing
content — free text input, natural language output, philosophical evaluation — rather than on
authentication status. Authentication is a proxy for human-facing, and this surface demonstrates the
proxy fails."

**Mechanism facts:**
1. A content-matching predicate was built and measured before being accepted or rejected. **Recorded
   by the implementing session (not independently re-measured by this author):** matching on
   `validateTextLength || TEXT_LIMITS || an LLM call` **dropped three already-registered perimeter
   members** — `mentor/gap4`, `mentor/private/founder-facts`, and `mentor/stoa` — because each stores
   practitioner free text without validating its length and without calling an LLM.
2. Shipping it would therefore have silently stopped guarding three live members.
3. What was built instead is **proxy-free**: in scope = a write verb **and** reads caller-supplied
   input. No auth term, no content term. The content judgement moved OUT of the predicate and INTO
   29 written, reasoned exclusion entries, each requiring a stated reason.
4. This is **not literally what your ruling described.** It serves the ruling's stated purpose (no
   proxy standing between the sweep and the truth) by removing the proxy entirely rather than
   replacing one proxy with another.

**The question.** Is that substitution accepted as faithful to the ruling? If you intended the
content predicate literally despite the measured cost, we will build it and accept the three-member
regression as an explicit, disclosed trade — but we will not do so silently.

---

## Q3 — May "every time" be published given the sweep itself was found holed?

**BLOCKING** — this is the honest-claim question.

**Your standard (2026-08-17):** "A filesystem-level sweep that produces a definitive count is a
prerequisite for publishing 'every time' honestly… The honest claim is only as strong as the
verification behind it."

**Mechanism facts:**
1. The sweep now exists, runs green, and produces a definitive count: 73 in scope, 44 registered, 29
   excluded, zero unclassified.
2. **Within 24 hours of being built, independent adversarial review found a structural blind spot in
   it.** The walk read only `route.ts`; six live routes place their `await request.json()` in a
   sibling `handler.ts` (a pattern this codebase's own build constraints force), so those routes were
   silently out of scope — no registration required, no exclusion required, battery green throughout.
   It was reproduced with a synthetic unscreened route the sweep never flagged.
3. It is fixed, and four newly-visible routes were each read and given reasoned exclusions. A
   regression pin now names those four directly, because the sweep's own count floor was too loose to
   catch the fix being undone.
4. So: the sweep is a predicate, and a predicate can have blind spots discoverable only by adversarial
   review — demonstrated once, in practice, not hypothetically.

**The question.** Does the published claim need a bound naming this — that the check runs on every
surface the sweep can see, and that the sweep is a mechanism which has been found incomplete once and
corrected? Or does the corrected sweep discharge the standard as stated, with the fallibility being
ordinary engineering rather than something a practitioner needs told?

We are not asking you to weaken the claim. We are asking whether "every time" over-promises given
what we now know about how the verification behind it can fail.

---

## Q4 — `/api/guardrail`: the last deferred election inside a now-closed perimeter

**Not blocking, but should be seen before any claim publishes.**

**Mechanism facts:**
1. `/api/guardrail` is excluded from the perimeter by a **deferred founder election dated 2026-06-19**
   — a deferral, not a reasoned judgement that it belongs outside.
2. Its exclusion entry states it is reachable by a human only through `/api/compose` or
   `/api/execute` — **and both of those are now perimeter members that screen before forwarding**, so
   the human path into it is screened upstream as of this session.
3. It remains directly reachable with an agent credential, which any signed-in user can mint at
   `/api/keys`.

**The question.** Does the guardrail stay outside on the strength of (2)? We think the honest reading
is that the human-reachable path is now covered and the remaining path is agent-credentialed — the
standing exclusion class. But it is the one member of the exclusion list resting on a deferral rather
than a reason, and the claim it sits behind is about to be published.

---

## Q5 — Where does the curiosity-loop trigger live, now the runner is gone?

**Not blocking — an interpretation we would rather have ruled than assume.**

**Mechanism facts:**
1. The relay places the trigger "at the point in the IDEA loop where structural novelty is confirmed
   by the fresh endpoint."
2. The IDEA loop runner lived in a scratch project whose bounded run **closed 2026-08-16**, and the
   standing-runner design has not opened (it sits after the run's mentor review in the Q11 sequence).
3. `assessStructuralNovelty` is a committed-but-dark server-side function
   (`website/src/lib/substrate/idea-loop-types.ts`) which the `/api/practice/fresh` endpoint wraps.
4. So the only live home is server-side, alongside the fresh endpoint — which is also where the relay
   places the puzzle-taxonomy stub.

**The question.** Is server-side, beside the taxonomy stub, the intended placement? Or is the trigger
meant to be runner-side, and therefore deferred until the standing-runner design opens?

---

## What we are NOT asking

The Q11 sequence, the first build gate, GS-ATRF-1/2/3, the surface name register, the runner agent
identity, and the Q1 hard constraint (the loop proposes, never executes) are all unchanged and
untouched. The M-5 obligation is untouched and remains P0. Relay items 1, 2 and 3 (taxonomy stub,
curiosity trigger stub, guide-circle governance record) are being scoped as instructed and need no
further ruling beyond Q5's placement point.
