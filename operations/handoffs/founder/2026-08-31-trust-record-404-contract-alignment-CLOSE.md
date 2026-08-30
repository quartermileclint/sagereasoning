# Close — the trust-record 404 contract: served and published, aligned

**Date: 2026-08-31.**
**Tier:** opened `code-elevated` (one served string); **became `code-critical` in effect** when
independent review found the published contract itself defective and R18 surfaces joined the change.
**Decision-log entry:** `D-TRUST-RECORD-404-CONTRACT-ALIGNED-SERVED-AND-PUBLISHED-BUILT-R18-SIGNED`.

**Production state at close: UNCHANGED.** Nothing pushed, nothing deployed, no flag set, no schema
applied, no credential minted or revoked. **Four commits sit local. The push IS the activation
(option B, elected 2026-08-30) and it is the founder's. AC7 engages there.**

---

## The one thing to read first

**The session's stated task was "one string + one pin." It was not, and the reason matters.**

The obvious fix — append the missing clause to the 404 body — **reintroduces the fault the fix
exists to remove.** Flag-off the provenance-gaps read never runs, so an unconditional clause makes
the handler assert an absence it never checked, on a response cached for five minutes. That is the
same unverified-absence fault the 503 branch immediately above the 404 exists to prevent.

So the clause is emitted **iff the read actually ran**, and `S2-103b` exists specifically to fail the
naive fix.

This was found by **reading the gate**, not the prompt's description of it — and it is the reason the
session did not simply do what it was told in thirty minutes.

---

## What shipped into the two commits

| Commit | Contents |
|---|---|
| `d08c6b9` | The conditional served message; pins `S2-103`, `S2-103b`, `S2-103c`, `S2-103d`; the F2/F3/F4 comment folds; the R18 sign-off package |
| `7facbe5` | The signed R18 correction across `llms.txt`, `agent-card.json`, `api-docs`, and a new `/limitations` section |

Trailing from the prior session and included in the same push: `5416749` (slice-3 live-verification
record) and `0b3f826` (the successor prompt). **Both were found unpushed at this session's open,
contrary to the prompt's own §0 which said to expect none** — records-only, so nothing live was
affected, but the record of the slice-3 verification existed only locally on a checkout with twelve
active peers.

---

## What independent review found, and what it cost to be wrong

**Three adversarial reviewers on an isolated copy. Five real defects.**

**The headline was against this session's own claim.** Two reviewers found, independently, that the
pin set proved *"clause iff FLAG"* while the code says *"clause iff READ."* Those agree in every cell
but one — flag fn present, read fn absent, where the read is guarded on **both**. A mutation deriving
the condition from flag intent left **the entire battery green at 197/0** while that cell wrongly
claimed an absence nothing had checked.

This session had already asserted its mutation verification was two-directional and rigorous. It was
rigorous **over the two directions the author thought of.** `S2-103d` closes it and fails that
mutation. Independent convergence by two reviewers is the strongest signal in the session.

**The finding that changed the shape of the work.** Two reviewers converged on a second defect: the
**published contract overstates the gate.** All three surfaces said a 404 means *"no provenance-gap
entry EXISTS."* The gate counts only the **servable** set, so rows can exist while none is renderable
and the agent still 404s. The handler's own new comment argues that claiming *"no gap entry exists"*
would overstate — and that was verbatim the published claim.

**The mismatch this arc exists to close had survived the fix, inverted, with the served message as
the honest side.** One reviewer made correcting it an explicit condition on its approval of the fix.

---

## The founder's two elections

1. **Hold and ship together** rather than shipping code now and correcting the contract later —
   matching the slice-3 option-B reasoning that simultaneity, not sequence, is the honest ordering
   when there is no dark interval. A sign-off package was authored with **every "before" quote
   verified byte-accurate and unique against source**, then signed and applied.
2. **Fix the pointer now.** `/limitations` carried **zero** mention of the trust record or
   provenance, so a caller landing there from a 404 could not reach the context that makes the new
   clause interpretable — the classification step has never executed in production, so the clause is
   currently true of every agent. A section was added. **`documentation_url` was deliberately NOT
   re-pointed:** it is shared by all nine responses on the surface, so it is the surface's doc URL,
   not the 404's.

---

## Carried, with reasons — not omissions

- **The row cap (F2).** The gate reads only `.entries`, ignoring `capped`/`totalCount`, so the 404's
  absence claim is scoped to the newest 50 rows. **Not reachable today** (zero rows; classification
  has never executed). Both candidate fixes are design choices with contract consequences.
  **Carried to slice 5**, when it becomes live. Named in-code with its check, per PR25.
- **The predicate-wording residual (F3) — deliberate.** Served says *"available to surface"*; the
  contract says *"the record can surface."* Synonymous; F3's actual complaint (a qualifier on no
  published surface) is closed. **Founder elected to ship what was signed.** Recorded so a future
  reviewer does not re-raise it.
- **The 503 body.** Deliberately vaguer than the 404, and now recorded in-code as intentional: the
  accreditation-503 precedent, and enumerating internal read failures to unauthenticated callers is
  a reconnaissance surface. The distinguishing cause **is** published and **is** logged operator-side.

---

## An orchestration error of this session's own

All three reviewers were given **the same copy directory**, one licensed to mutate it. **A copy
shared by N agents is not isolation.** One reviewer ran the battery mid-mutation and saw
contradictory results; another read the tree with the mutation applied and raised a **HIGH — "the
tree does not match the diff, the fix is broken."** Disposing of it took three independent checks on
the real tree.

The §2 process correction was followed at one level and violated at the next. **Both reviewers
behaved correctly**: each labelled its dynamic results unreproduced and separated them from static
findings, and those static findings included the session's most valuable catch. Memory
`review-isolation-must-cover-filesystem` extended: **one copy per mutating agent**, and treat a
"code doesn't match the diff" HIGH during a fan-out as probably contaminated — **but check, never
assume.**

---

## Verification

S10 battery **198/0** (pins through **S2-103d**; next free **S2-104**). `tsc` clean. `npm run build`
exit 0, with `/api-docs`, `/limitations` and `/api/trust-record/[agent_id]` registered.
`agent-card.json` parses, **26 extensions** (no new extension). Sweep for the superseded phrasing
across `public/` and `src/` returns **zero**. All five pre-commit checks passed on both commits.
Both PR19 mutations and the reviewer's third mutation re-run and confirmed to bite.

## Founder verification (after the push)

1. Vercel green.
2. **Live `curl`** — the next-session prompt carries the exact checks. Non-optional: three of the
   last four defects in this arc, and this session's headline defect, were found only that way.

## Rollback

`git revert` `7facbe5` and `d08c6b9`. **Unsetting `SUBSTRATE_PROVENANCE_LEDGER_ENABLED` is NOT a
rollback path** — it would also stop the live ledger write, a standing production change.

## Next session

`operations/handoffs/founder/2026-08-31-post-404-alignment-verification-and-atrf-walk-NEXT-SESSION-PROMPT.md`
— live verification first, then the ATRF-EE walk, whose **Step 0 now exists**: a read-only
state-determination block settling the genuinely-unknown production schema state before anything
touches it.

**Switch-on scoreboard, unchanged: C1 ✅ · C2 ✅ · C4 ✅ · C3 ⏳ ~5/90 days.** Slice 5 remains
late-November at the earliest. **The 0h call remains the founder's.**
