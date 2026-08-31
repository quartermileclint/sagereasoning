# Next session — the app-wide RLS-vs-route-enforcement gap (`impulse_entries` first)

**Paste this as the first message of a new session, beneath the standing session opener.**

**Tier: mixed, phased — classify each phase separately, do not open the whole session as one
tier.** Phase 1 (survey/verification) is `code-standard`, read-only, no live op. Phase 2 (the actual
`impulse_entries` RLS fix) is **`code-critical`** — it is an auth/security/perimeter change to a
production data-access-control surface, which triggers **PR19** (independent adversarial review
required — PR19 was explicitly widened at ARC2 to cover auth/security/perimeter, and this is
exactly that class) and **AC7** (Critical Change Protocol — six-point disclosure before any live DB
policy change). **Do not attempt every affected table in one session** — see "What is NOT in scope"
below. This is a scoping-and-first-fix session, not a full remediation program.

**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Origin:** found by a PR19 independent review during the `/impulse` build
(`D-S7-IMPULSE-PR19-INDEPENDENT-REVIEW-CLEAN`, 2026-08-12), confirmed and ordered by the mentor
(`D-S7-IMPULSE-MENTOR-CLEARANCE-AND-FOLLOW-THROUGH`, 2026-08-12). Read both decision-log entries in
full before anything else — this prompt summarizes them but the mentor's exact wording matters.
**Carried from:** `operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md`, "S7 — what is DONE and
what is CARRIED," item 5.

---

## 0. Concurrency — run the parallel-window pre-flight first, as always

`operations/handoffs/founder/2026-08-10-idea-loop-parallel-window-NEXT-SESSION-PROMPT.md`. Re-derive
current state fresh — do not inherit a cycle count or mode from memory. This session's likely surfaces
(RLS policies on human-practitioner tables, not `idea_loop_*`, not the four fenced routes, not the
credential) suggest this reads as Mode 2 (ordinary build work), but confirm rather than assume — the
run may have completed or hit a new blocking spec since this prompt was written.

---

## Why this matters (read before touching anything)

Every one of the human-practitioner tools built across this project's "Remaining Principles" arc
(and several earlier surfaces) shares one migration shape: a table with **per-verb owner RLS
policies** —

```sql
CREATE POLICY "Users can insert own X" ON public.X FOR INSERT WITH CHECK (auth.uid() = user_id);
-- (and matching SELECT / UPDATE / DELETE policies)
CREATE POLICY "Service role full access to X" ON public.X FOR ALL USING (auth.role() = 'service_role');
```

This means **any authenticated practitioner, using nothing but the public anon key and their own
session JWT, can `INSERT`/`UPDATE`/`DELETE` directly against the table via PostgREST** — bypassing
the Next.js API route entirely, and with it every server-side check the route performs: field
validation, rate limiting, the deterministic gate classification, and — for `/impulse` specifically —
**the R20a distress check**. The PR19 reviewer confirmed this reachable for `impulse_entries`; the
mentor confirmed the severity and, critically, the disposition: **do not patch this one table in
isolation** —

> *"the local fix would be a false guarantee ... a fix here that doesn't fix the architecture creates
> an illusion of protection that is worse than the honest gap"*

— while also naming why `impulse_entries` should be first anyway:

> *"the one table in the application where a route bypass reaches the exact population the perimeter
> exists to protect"*

So the ordering is deliberate: fix the architecture, starting with the one table where getting it
wrong matters most, not the one that's easiest.

**A grounding fact worth verifying, not trusting:** every route.ts checked so far for these tables
(`api/mentor/impulse/route.ts`, `api/mentor/sage-compass/route.ts`, and by pattern the rest of the
family) already uses the **service-role admin client** (`createClient(supabaseUrl,
supabaseServiceKey)`) for every read and write — never a user-JWT-scoped client. If that holds across
the whole affected set, the per-verb owner policies are not required by the app's own legitimate
path at all; they may be inert, template-inherited scaffolding that exists only as an unused, live
attack surface. **This is a promising lead, not a conclusion — verify it per table before relying on
it**, and specifically confirm no client/browser component anywhere calls `supabase.from(...)`
directly against any of these tables (a quick grep for `impulse` and its siblings across
`src/app/*/page.tsx` and `src/components/` found nothing at prompt-authoring time, but re-derive this
yourself).

**A first-pass list of migration files carrying this exact policy shape** (grep run at
prompt-authoring time, 2026-08-12 — **re-run this yourself, do not trust it as current or
exhaustive**):
```
supabase-baseline-migration.sql
supabase-circle-extension-migration.sql
supabase-impulse-migration.sql
supabase-mentor-appendix-migration.sql
supabase-mentor-gaps-migration.sql
supabase-mentor-profiles-migration.sql
supabase-milestones-migration.sql
supabase-morning-preparation-migration.sql
supabase-reflections-migration.sql
supabase-reserve-clause-migration.sql
supabase-sage-compass-migration.sql
supabase-v3-baseline-progress-migration.sql
supabase-v3-migration.sql
supabase-view-from-above-migration.sql
```
14 files, at least 14 tables (some files may declare more than one table). **This confirms the gap is
genuinely app-wide, not a one-table oddity** — which is exactly why the mentor ruled against a local
patch. It is also why this session should not try to fix all of them in one sitting: that is a
program, not a session.

---

## Part A — Open under the protocol (read order)

1. `/adopted/standing-protocol-cache.md`.
2. This prompt in full.
3. `D-S7-IMPULSE-PR19-INDEPENDENT-REVIEW-CLEAN` (decision-log) — the medium finding's exact wording
   and the reviewer's confirmation the bypass is reachable.
4. `D-S7-IMPULSE-MENTOR-CLEARANCE-AND-FOLLOW-THROUGH` (decision-log) — item 1, the mentor's verbatim
   disposition and ordering ruling.
5. `operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md`, "S7 — what is DONE and what is
   CARRIED," item 5 — the full context in one place.
6. `website/supabase-impulse-migration.sql` (the RLS section, `§` near the bottom) and
   `website/src/app/api/mentor/impulse/route.ts` (confirm the service-role client claim above
   first-hand) — read the actual files, not this prompt's paraphrase.
7. One sibling table for contrast — pick `route_errors` (`website/supabase-route-errors-migration.sql`)
   or `collaboration_records` — both already use the **correct** pattern this session is moving
   `impulse_entries` toward: RLS on, **no policy for anon/authenticated at all**, service-role-only.
   This is the target shape, already proven safe and live elsewhere in this codebase.

**Confirm at open:** tier per phase (do not open Phase 2 work under a Phase-1 classification); that
`impulse_entries` currently carries the four owner policies + the service-role policy (re-run the
grep, don't assume); the live row count in `impulse_entries` (small, real practitioner data may now
exist since 2026-08-12 activation — treat it as real, not test data, when planning the fix).

---

## Part B — Procedure

### Phase 1 — Survey and verify (Standard, read-only, no live op)

1. **Re-derive the affected-table list yourself.** Re-run (or improve) the grep above; also check
   `supabase/migrations/*.sql` for any that use a differently-named owner column (`owner_user_id`
   rather than `user_id` — at least one sibling family, `oikeiosis`, uses `auth.uid() =
   auth_user_id`-shaped checks per its own migration; confirm the exact predicate per file rather
   than assuming `user_id` universally).
2. **For each affected table, confirm which Supabase client its route(s) use.** Grep each route file
   for `createClient(supabaseUrl, supabaseServiceKey)` vs any user-JWT-scoped client construction. Any
   table whose route uses a **user-scoped** client is a **materially different case** — removing its
   owner policies would break the app's own legitimate writes, not just close a bypass. Flag any such
   table explicitly; do not assume it doesn't exist just because `impulse_entries` and
   `sage_compass_entries` don't have it.
3. **Confirm no client/browser code calls Supabase directly against any affected table.** Grep
   `src/app/`, `src/components/`, and any client-side Supabase SDK usage (`createBrowserClient`,
   `createClientComponentClient`, or a bare `supabase.from(...)` inside a `'use client'` file) for
   each table name. A hit here means the naive fix (drop the owner policies) would break a real,
   working feature — treat this as a hard stop for that table, not a footnote.
4. **Produce a written survey** (a new file under `operations/primal-substrate-2026-08/` or a
   sibling location you judge appropriate) listing every affected table, its route's client type, any
   client-side usage found, and a per-table verdict: `safe-to-fix-same-pattern` /
   `needs-route-change-first` / `needs-further-investigation`. This is the deliverable that turns
   "unscoped" into a real backlog — do not skip it even if `impulse_entries` alone looks simple.

### Phase 2 — Fix `impulse_entries` (Critical, PR19, AC7)

**Only proceed to Phase 2 once Phase 1 confirms `impulse_entries` is genuinely `safe-to-fix-same-pattern`
— i.e., its route uses the service-role client exclusively and no client-side code touches the table
directly.** If Phase 1 finds otherwise for `impulse_entries` itself, stop and report back — do not
force the fix through.

1. **Design the exact change**, mirroring the already-proven `route_errors`/`collaboration_records`
   shape: `DROP POLICY` the four owner policies (view/insert/update/delete), leave the service-role
   policy in place, confirm `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` stays on (RLS enabled + no
   permissive policy for `anon`/`authenticated` = deny-by-default, matching the sibling precedent's
   comment: *"RLS on with no policy → PostgREST anon/authenticated cannot read or write"*). Write this
   as a **new, separately-named migration file** with explicit `§PRE`/`§APPLY`/`§VERIFY`/`§INVERSE`
   sections (the standing pattern this repo uses for every schema change) — the `§INVERSE` block
   should **recreate the four dropped policies verbatim** so this is a genuinely two-way-reversible
   change, not a one-way lockdown.
2. **`§PRE` must capture a live behavioural proof of the bypass, not just the policy definitions** —
   e.g., a scripted attempt to `INSERT` into `impulse_entries` using a real (throwaway, disposable)
   authenticated user's anon-key session, confirming it currently **succeeds** (matching the PR19
   finding). Do this on **TEST first**, never production, for the proof-of-bypass step.
3. **`§VERIFY` must prove the SAME attempt now fails** post-migration, on TEST, before any production
   step is considered. Also re-verify the app's own legitimate path still works end-to-end on TEST — a
   real POST through `/api/mentor/impulse` (service-role client) should still succeed unchanged.
4. **AC7 six-point disclosure, before touching production:** name this as a live RLS/auth change on a
   table carrying real practitioner data (small but real, since 2026-08-12); name the rollback
   (`§INVERSE`); get explicit founder approval before the production `§APPLY`.
5. **PR19 independent adversarial review, before the production step** — a fresh reviewer, told
   nothing about this session's own conclusions, checking: does the migration actually close every
   verb (SELECT too — a practitioner reading another practitioner's shame/dread entries via direct
   PostgREST would be its own real harm, distinct from the write-bypass the mentor named); does the
   service-role policy still permit the app's own legitimate operations; is the `§INVERSE` genuinely
   restorative; did Phase 1's "no client-side usage" claim get re-verified rather than inherited.
6. **Apply to production**, founder-walked, with the same before/after live-bypass proof run against
   production (disposable test account only — never touch a real practitioner's row for this proof).
7. **Close, recording explicitly that this closes ONLY `impulse_entries`**, not the app-wide gap — the
   remaining tables from the Phase 1 survey are the carried backlog for future sessions, in whatever
   priority order the founder elects (the mentor ruled `impulse_entries` first; it did not rule an
   order for the rest).

---

## What is NOT in scope

- **Fixing any table beyond `impulse_entries` in this session** — even if Phase 1's survey turns up
  several `safe-to-fix-same-pattern` tables, resist doing them all at once. Land `impulse_entries`
  clean, prove the pattern live, then let the founder decide the next table and session.
- **Assuming the fix pattern generalizes without checking** — a table whose route uses a user-scoped
  client, or that has genuine client-side Supabase usage, needs a different remediation (likely: change
  the route to use the service-role client and scope by a server-verified user id in code, THEN apply
  the same RLS lockdown) — that is real additional work, not a variant of the same one-line fix.
- **Touching `route_errors`, `throttle_events`, `collaboration_records`, `agent_trust_events`,
  `agent_trust_state`, `substrate_audit_narratives`, or any other table that already uses the
  service-role-only pattern** — these are the target shape, not part of the gap.
- **Redesigning the R20a perimeter, the distress-check mechanism, or any `/api/reason`/`/api/guardrail`
  surface** — this gap is about direct-database bypass of the route layer, not about the perimeter
  logic itself, which is unaffected and untouched by this work.

## Rollback

Each table's fix carries its own migration file with its own `§INVERSE` block (recreating the four
dropped policies verbatim) — use that file's own rollback, not a generic one. Nothing in Phase 1
(the survey) is an action to roll back.

## Forecast

Success = a written, table-by-table survey turning "unscoped" into a real backlog with a verdict per
table; `impulse_entries` specifically closed — its direct-PostgREST bypass proven blocked on both
TEST and production, its own legitimate route path proven unbroken, PR19 clean, AC7 discharged,
migration-with-inverse in the repo — and an honest, explicit statement that the remaining tables from
the survey are carried, not closed, with no session having tried to swallow the whole program in one
sitting.

End of prompt.
