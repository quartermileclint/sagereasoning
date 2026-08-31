# Next session — grounding-record reconciliation (CLAUDE.md + the standing opener)

**Paste this as the first message of a new session, beneath the standing session opener.**

**Tier: `governance` / documents. Standard under 0d-ii.** No code, schema, flag, credential,
migration, or public-surface change. AC7 not engaged. PR6 not engaged.

**Permitted paths: `CLAUDE.md`, `operations/handoffs/founder/STANDING-SESSION-OPENER-grounded-foundations.md`,
`operations/decision-log.md`, and `archive/` (if the opener is versioned).** Nothing else. Verify with
`git diff --stat`.

---

## 0. Concurrency — this session IS safe to run alongside IDEA-loop cycle 8

Confirmed before this prompt was written. The session touches **none** of the surfaces the
parallel-window prompt fences: not `/api/reason`, not `/api/guardrail`, not
`/api/practice/{fresh,watching}`, not the trust-core emission path, not credential validation, not
`project-context.ts`/`project-context.json`. It edits two markdown files and the decision log.

Still run the parallel-window pre-flight (`operations/handoffs/founder/2026-08-10-idea-loop-parallel-window-NEXT-SESSION-PROMPT.md`)
as a matter of course — a blocking spec in the scratch project would outrank this work. **Never write
into the run's records.**

---

## 1. Why this session exists — it is not housekeeping

The grounding records have drifted, and **the drift has now demonstrably produced defects in real
build work**. Three instances, all found on 2026-08-11:

1. **CLAUDE.md's R20a perimeter count was stale, and the wrong number propagated into a build scope
   document.** CLAUDE.md said *"11 route-level + 2 substrate-gate = 13"*; the authoritative registry
   (`website/src/lib/__tests__/r20a-invocation-guard.test.ts`) held **13 + 2 = 15** — both Stoa routes
   joined 2026-08-03. The S7 scope inherited the stale figure and was corrected only because the S7
   prompt-writing session re-counted from the test file.
2. **The standing opener listed the mentor's live-page factual amendment as outstanding** (*"~3.5 weeks
   stale … arguably first among no-dependency items"*). It had been **applied on 2026-08-10** — the
   day before the opener was written. `website/src/app/limitations/page.tsx` records the amendment in
   its own comment.
3. **The opener's D1/D2 blockers were restated as open after both were cleared**, in a mentor relay
   built on it.

This is the class the standing lesson `primary-data-beats-secondary-characterisation` names, and the
grounding records are its highest-leverage instance: **every session reads them first.** A stale line
there is inherited by everything downstream, which is exactly what happened.

**So the discipline for this session is inverted from the usual one.** You are not transcribing the
records forward. **You are re-verifying them against primary sources and correcting what does not
hold.** A claim that survives verification stays; a claim that cannot be verified is either corrected
or marked unverified. Do not carry anything forward because it is already written.

---

## 2. What to fold in — known gaps, to be verified not assumed

CLAUDE.md's most recent dated refresh block is **2026-07-19**. Its "Live in production" list runs later
(to the 2026-08-08 C2 activation), but the following are live or landed and **absent or stale**:

| Item | Status to verify |
| --- | --- |
| **`/impulse`** — the primal-substrate practice tool | **LIVE**, and an **R20a perimeter member**. Absent from CLAUDE.md entirely. A live perimeter member missing from the production-state record is the sharpest single gap. |
| **The R20a perimeter count** | Recount from the registry. It was 13+2=15 before `/impulse`; confirm what it is now. **Do not take that number from this prompt** — count it. |
| **The primal-substrate family (S1–S8)** | Complete. `operations/primal-substrate-2026-08/`; the S5 manifest amendment adopted; `/impulse` built and activated. |
| **The Stoa program** | ST1 + ST6 live; ST2/ST3/ST4 + the Q5c/Q13a trust events built and dark. |
| **The IDEA-loop program** | `fresh`, `watching`, `loop_id` all live; the runner credential minted; the bounded validation run in flight. |
| **R21 / R22** | New manifest rules, 2026-08-09. |
| **ATRF + the Consciousness and Continuity Obligation** | New un-numbered manifest sections, 2026-08-09. |
| **The moral-community amendment** | New un-numbered manifest section, adopted 2026-08-11 (S5). |
| **ARC2** | Closed — including the forced Next.js 14→16 / React 19 upgrade. |
| **C2/C1c orientation reading** | Already in the Live list — **verify it is accurate**, do not assume. |

**Method (PR18):** the production-state block is rewritten at session close, from the decision log plus
that session's own verified observations, and **always carries its as-of date**. Follow it.

---

## 3. Re-verify the standing queue — do not carry it forward blind

Two of its items were found stale in a single day. Go through the opener's standing queue and, for
each, **check the repo before restating it**:

- Items already known stale: the live-page factual amendment (**done 2026-08-10**); D1 and D2 (**both
  cleared 2026-08-11**).
- Check specifically whether these are still live: the `SUBSTRATE_CREDENTIAL_LOOKUP_RETRY_ENABLED`
  activation; the Resend provisioning; the never-run items from the 07-25 audit §7 (**note the Next.js
  exposure assessment may be subsumed by the ARC2 upgrade** — the opener already flags this as needing
  a re-check); the `/api/reason` status-masking fix; the reflect-path `loop_id` metering bug; the
  `target_circle`/blast-radius persistence gap; the runner-scoping teardown SQL.
- **Add** what this arc created: the C15 three-enumeration circle discrepancy (unscoped, blocking
  nothing); S4's watching-table extension (parked on the §6 report); the GS-ATRF-2 migration (parked,
  founder-walked); the ATRF scoping session's inherited justice carry-forward.

**Where a claim cannot be verified from the repo, say so explicitly rather than restating it.** An
item marked *"status unverified — needs a founder check"* is more useful than one silently carried.

---

## 4. What NOT to do

- **Do not re-audit production.** This is a records reconciliation against the decision log and the
  repo, not a live-state audit. Where a claim needs production access to confirm, mark it unverified.
- **Do not touch anything outside the four permitted paths.** In particular no code, and nothing in
  `operations/primal-substrate-2026-08/` — that family is closed.
- **Do not resolve the C15 circle discrepancy.** Record it; it is its own item.
- **Do not open the ATRF scoping session.** Explicitly post-validation-run, *"do not open early."*
- **Do not shorten the two settled names** — *loop-level blast-radius proxy* and *permission-layer
  blast-radius enrichment* — to bare "blast radius" anywhere in the records.

---

## 5. Verification before you close

1. `git diff --stat` — the permitted paths only.
2. **Every count, ordinal, and "N of M" in what you write is re-derived from a primary source.** These
   are the highest-risk claims and the ones that have actually gone wrong.
3. The R20a perimeter count matches the registry test file exactly.
4. Every "Live in production" entry traces to a decision-log entry or a verified repo fact.
5. The production-state block carries its as-of date (PR18).
6. Any unverifiable claim is marked unverified rather than restated.
7. If the opener is materially rewritten, archive the prior version to `archive/` with its date, per
   the opener's own convention.

**PR19:** independent review before this lands, focused on (a) claims-vs-repo for the Live list, (b)
whether any stale item was carried forward unchecked, and (c) count accuracy. This is a document every
future session reads first — an error here propagates rather than sits, which is the whole reason the
session exists.

---

## 6. Close with

- A decision-log entry, house shape. **`git commit -F <file>`, not `-m`.**
- A short list of **what was found stale and corrected** — that list is itself the evidence of whether
  this session was worth running, and it feeds the next re-grounding's judgement about cadence.

---

## 7. What follows

**Gated on the validation run's §6 report:** S4's watching-table extension; S6's reordering decision;
the **ATRF scoping session** (which inherits the justice carry-forward recorded in
`operations/primal-substrate-2026-08/gs-atrf-corrections.md` §(d)); the standing-runner design.

**Not gated, but not concurrent-safe** — they touch the run's surfaces and want a quiet window: the
`/api/reason` status-masking fix; the credential-lookup retry activation; the reflect-path `loop_id`
metering bug.

Nothing here bears on the 0h call.
