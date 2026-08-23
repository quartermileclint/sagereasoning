# Founder Walk — ATRF/EE Production Wave (one consolidated sitting)

**This is the live-walk reference, not a hand-off checklist.** Per PR17 the AI walks each
step with you as you run it — you paste, you read the output back, the AI verifies before
you move on. Do not run ahead of the verification of the previous step.

**Tier:** `code-critical` throughout. AC7 engages at step 1 and stays engaged. **The AI
performs no Supabase, Vercel, git-push, or mint operation at any point** — every live action
below is yours.

**Everything below is built, PR19-reviewed twice, and green.** Nothing live has been touched
yet: no SQL run, no flag set, no push.

---

## Order, and why it is this order

| # | Step | Why here |
|---|---|---|
| 1 | **A1 — Class B RLS lockdown** | Independent of everything else; already TEST-verified in a prior session. Front-loaded so a surprise here does not sit behind three other migrations. |
| 2 | **A2 — `idea_loop_candidates` additive columns** | Must precede the deploy by standing discipline. (The code is safe in either order by construction — omitted fields send no key — but the discipline is kept.) |
| 3 | **A3a — `idea_loop_completion_signals` table** | The endpoint's persistence target must exist before the endpoint deploys. |
| 4 | **A3b — `api_keys` capability widening** | Independent of 3; grouped with it because both serve A3. |
| 5 | **Push + deploy** | Carries the A3 endpoint (DARK), the A4 EE-C1 reword (LIVE on deploy), and all paired code. |
| 6 | **Post-deploy confirmation** | The one thing that changes live behaviour on this deploy is the EE-C1 wording. Confirm it. |
| 7 | **OPTIONAL — activate + smoke the endpoint** | Needs a credential mint. **Your election; see the decision point.** |

**TEST first, then production, for every one of steps 1–4.** Do not batch environments.

---

## Step 1 — A1: Class B RLS lockdown

**File:** `website/supabase-class-b-rls-lockdown-migration.sql`
**Harness:** `website/scripts/class-b-rls-bypass-proof.ts`
**Tables:** `action_evaluations_v3`, `journal_entries`, `reflections`

**Prerequisite already discharged:** the route-change that removed every client-side consumer
of these three tables is committed, pushed, and deployed (`2277ec2`, confirmed an ancestor of
`origin/main`). PR19-confirmed zero remaining client-side consumers.

**Per table, per environment, in this order:**

1. `§PRE-P1` — policy state. `§PRE-P2` — `rowsecurity = true`.
2. `§PRE-P3` — **the bypass proof, default mode.** Expect it to report the bypass is **OPEN**.
   *This is the point of the step: prove the hole is real before closing it.*
3. `§APPLY`.
4. `§VERIFY-V1` — expect exactly the one service-role policy.
5. **Re-run the harness — expect DENIED (`42501`).**
6. **Re-run the harness in `--legit` mode — expect the legitimate server path still PASSES.**

**Step 5 without step 6 is not a verified lockdown.** The `impulse_entries` precedent is
explicit: prove the hole closed *and* prove you did not break the legitimate path.

**Watch for:** `reflections` currently has **no service-role policy at all** — the 2026-08-16
row-25 fix relied on `service_role`'s `BYPASSRLS`. The migration adds one for consistency.
Its `§PRE-P1` expectation reflects that; if it does not match, stop.

**Rollback:** each table's `§INVERSE`, independently.

---

## Step 2 — A2: `idea_loop_candidates` additive columns

**File:** `website/supabase-idea-loop-candidates-atrf-blast-radius-and-s4-migration.sql`
**Live table carrying real production rows from the bounded validation run.**

Six additive nullable columns. **Three are RULED** (`blast_radius`, `agent_blast_radius`,
`target_circle` — Q-B1); **three are this build session's engineering elections**
(`blast_radius_basis`, `traceability_check`, `extraction_evidence`). The file's header states
which is which — read it before applying, not after.

**Sections in order: §1 → §2 → §3 → §4 (comments) → §5 (post-apply confirmation).**

- `§1.PRE` — **record the row count.** `§1.VERIFY` re-reads it; it must be *identical*.
- `§2.VERIFY-BEHAVIOURAL` — **TEST ONLY. Read its precondition first.** Both probes must fail
  `23514`. **A `UPDATE 0` result is a FAILED probe, not a pass** — it means the table was
  empty and nothing was tested. This probe is the safety net for a real CHECK defect found and
  fixed pre-apply (the `COALESCE` in `§1.APPLY`); do not skip it.
- `§5` — confirms the FK still cascades (`confdeltype = 'c'`), RLS still on, and
  anon/authenticated/PUBLIC still hold zero grants.

**Rollback:** per-section `§INVERSE`; each column drops independently.

---

## Step 3 — A3a: the `idea_loop_completion_signals` table

**File:** `website/supabase-idea-loop-completion-signals-migration.sql`

New table, FK to `idea_loop_cycles` with `ON DELETE CASCADE`. **Deliberately no
`retain_until`** — the row's lifetime is its cycle's, so every existing deletion path already
reaches it. `§VERIFY-V5` is the load-bearing check: it confirms the cascade that is the entire
basis for that decision.

- `§PRE` — record the cycle counts; `§VERIFY-V6` must match.
- `§VERIFY-V1` — **expect 17 columns** (this number was wrong at first draft and was corrected;
  count them if you want to be sure).
- `§VERIFY-V7` — **TEST ONLY. Read its precondition first**: it needs at least one row in
  `idea_loop_cycles`, and TEST may have none because the validation run wrote to production.
  Without a row the probes fail `23502` before the constraint under test is ever evaluated.
- `§VERIFY-V4` — RLS on, zero grants to anon/authenticated/PUBLIC.

**Rollback:** `DROP TABLE` — nothing else references it.

---

## Step 4 — A3b: the `api_keys` capability widening

**File:** `website/supabase-api-keys-completion-signal-write-capability-migration.sql`
**Auth-adjacent. Two constraints on a live credential table.**

- `§V.PRE` — **the live def must show SIX values.** If it shows five, the `watching_write`
  migration has not been applied here; **stop** rather than jumping ahead of it.
- `§W.PRE` — **the zero-violator check must be run on production immediately before
  `§W.APPLY`**, not from a snapshot taken earlier in the sitting.
- `§W` behavioural probes — **TEST ONLY, both of them.** The positive probe must fail `23514`;
  the **negative** probe (a consult-only credential with null owner+agent) must **succeed**.
  Running only the positive one leaves an over-fire undetected.

Both widenings are **mint-time only** — no issued credential's validation changes, and nothing
mints `completion_signal_write` until you choose to.

**Rollback:** `§V.INVERSE` / `§W.INVERSE`. `§V.INVERSE` is safe only while zero rows carry the
new capability — re-run `§V.PRE` first.

---

## Step 5 — Push + deploy

Commit and push. **One commit or two — your preference; name which in the close.** The AI
recommends **two**, so the public-behaviour change is revertable independently of the schema
and endpoint work:

- Commit A — the EE-C1 wording change + its battery *(the only live-behaviour change)*
- Commit B — everything else *(migrations, the dark endpoint, paired code, documents)*

Confirm Vercel green before step 6.

---

## Step 6 — Post-deploy confirmation

**The only live behaviour that changes on this deploy is the EE-C1 wording.** Everything else
is either schema (already applied) or dark behind an unset flag.

Confirm on production, via any `/api/guardrail` call whose action engages no kathekon factor —
the `reasoning` field must now read:

> No kathekon factors were extracted from the submitted text; on that basis, the engine reads
> the action as contrary to appropriate action.

and must **no longer** contain *"No kathekon factors detected"*.

**Nothing else about the verdict changes.** `is_kathekon`, quality, proximity, floors,
recommendation — all identical. If any of those moved, stop and roll back commit A.

---

## Step 7 — OPTIONAL: activate and smoke the completion-signal endpoint

**This is a decision point, not a default. The AI recommends deferring it.**

The endpoint is dark (`SUBSTRATE_COMPLETION_SIGNAL_ENABLED` unset ⇒ honest 503). A real
end-to-end smoke needs:

1. A minted `completion_signal_write` credential — **owner + agent bound** (the widened §W
   invariant now requires it), and
2. A recorded cycle in `idea_loop_cycles` to attach the signal to, and
3. The flag set in Vercel Production.

**Why the AI recommends deferring:** the ruling scopes receipt to *the write only* — no flag,
no dashboard, no downstream action — and names the runner-side trigger (Q-C2b) as the
**standing-runner design session's** work, not this one's. Nothing consumes a persisted signal
yet. Activating now mints a standing credential for a surface with no producer.

**A zero-footprint alternative that still proves the deploy:** with the flag still unset, POST
anything to `/api/practice/completion-signal` on production and confirm the honest **503**
naming the flag. That proves the route deployed and is correctly dark, and writes nothing.

If you do elect full activation, do it as its own walked step and record the credential.

---

## What is NOT in this walk

- **The R18 publication of the EE Shape-1 map** — awaiting your signature on
  `2026-08-23-evaluative-engine-shape1-r18-signoff-package.md`. Nothing public changes until
  then.
- **The D4-completion proxy fix** — named, not built.
- **The EE-A3 credence-field option** — explicitly not elected.
- **Q-C2b** — the standing-runner design session's.

---

## Standing rollback summary

| Change | Rollback |
|---|---|
| A1 Class B RLS | per-table `§INVERSE` |
| A2 columns | per-section `§INVERSE`; columns drop independently |
| A3a table | `DROP TABLE public.idea_loop_completion_signals;` |
| A3b capability | `§V.INVERSE` / `§W.INVERSE` (check §V.PRE first) |
| EE-C1 wording | `git revert` commit A |
| Endpoint + paired code | `git revert` commit B; flag stays unset either way |
