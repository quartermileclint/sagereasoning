# `/api/community-map` 42703 — root-cause note

**2026-09-05.** Item C of `2026-09-05-post-ruling-autonomous-work-NEXT-SESSION-PROMPT.md`.
`governance` — diagnosis only. **No production read was performed this session**; the production
facts below are quoted from a founder-walked diagnosis recorded in the decision log on 2026-08-03,
and are labelled as such.

## Verdict

**The defect is already fixed and has been live since 2026-08-03.** No migration needs authoring.
What remains is a stale carry in `/CLAUDE.md`, whose description of the cause **was wrong even when
it was written**.

## Root cause — not what the carry says

`/CLAUDE.md` carries it as *"the pre-existing `/api/community-map` 42703
(`community_map_pins.show_on_map` missing)"*, which reads as a **missing column**. It was not.

The real cause, recorded in `website/supabase-community-map-degrade-migration.sql`:

> the live 42703 (`community_map_pins.show_on_map does not exist`) is caused by the API route
> filtering `.eq('show_on_map', true)` against the **VIEW**, which never exposed that column — the
> view filters on it internally.

The column existed on `profiles` throughout. The **view** deliberately does not expose it, because
the opt-in gate lives *inside* the view definition. The route filtered on a column that, by design,
is not part of the view's output — so Postgres raised 42703. The error was latent because it was
being swallowed rather than surfaced.

The distinction matters: a missing column would have been fixed by a migration. This was fixed by
**deleting one line of route code**.

## Evidence

| Fact | Source |
|---|---|
| Route no longer filters on `show_on_map`; select is `display_name, city, country, latitude, longitude` | `website/src/app/api/community-map/route.ts` (read this session) |
| The route's own comment names the cause and forbids reintroduction | same file: *"do not filter on it here; the view exposes no such column, and filtering on it was the cause of the long-standing 42703"* |
| Fix committed | `f198736`, 2026-08-03 — *"Stoa ST1: repair the community map and rebuild it without the alignment tier (Q6a)"* |
| Migration exists and states the code deploy is the actual fix | `website/supabase-community-map-degrade-migration.sql`: *"This migration alone does not fix the 42703; the code deploy does."* |
| **Production state, founder-walked 2026-08-03** — *"all 5 profiles location columns present, the view present in its old graded 8-column shape"*, and *"the original location migration WAS fully applied to production, confirming the session's root cause exactly (the 42703 was purely the route filtering `show_on_map` against a view that never exposed it, latent behind the swallowed error)"* | `D-STOA-ST1-COMMUNITY-MAP-REPAIRED-DEGRADED-2026-08-03`, Walk addendum |
| ST1 recorded LIVE; §1–§3 applied on production, §VERIFY green, view = the 5 plain columns, exactly three SELECT grants | same addendum |

The founder's own production diagnosis **positively disconfirms** the "missing column" description:
all five location columns were present.

## The prompt's hypothesis, checked

The session prompt suggested *"a view predating the column or the ST1 degrade migration."* Close, but
not what happened: the view was fine for its own purpose throughout. The mismatch was between the
**route's query** and the **view's contract**, not between the view and the table.

## What is actually outstanding

Nothing in code or schema. One documentation correction:

**`/CLAUDE.md` still lists the 42703 as an open named follow-up** in the dated 2026-07-07 Foundation
Completion Session 1 refresh block, with the wrong causal description. Per the count-discipline
rule, a **dated historical bullet is not rewritten** — it recorded what was believed on 2026-07-07.
The correction belongs as a **standing annotation**, in the same form the 2026-09-04 session used
for the extension count.

**Deliberately not applied here.** CLAUDE.md corrections belong with item E (the production-state
refresh), which the prompt orders last and says not to start early. Scattering CLAUDE.md edits
across items is how a half-done refresh happens. Ready-to-apply wording:

> *Closed — corrected 2026-09-05.* The `/api/community-map` 42703 named above was fixed at Stoa ST1
> and has been live since 2026-08-03 (`f198736`; `D-STOA-ST1-COMMUNITY-MAP-REPAIRED-DEGRADED-2026-08-03`).
> Its description here is also wrong as to cause: the column was never missing — the founder's own
> production diagnosis found all five location columns present. The route was filtering
> `.eq('show_on_map', true)` against a **view** that deliberately does not expose that column,
> because the opt-in gate lives inside the view. A one-line route change, not a migration.

## Carried forward — so this cannot be lost again

The annotation above is **owed and unowned unless it is tracked**, and this item's own history is the
argument for saying so: it survived four sessions as an open defect precisely because it was carried
as a sentence rather than as a task.

**If item E (the CLAUDE.md production-state refresh) runs, it applies the wording above.**
**If item E does not run, this correction carries to the next session's opener as an explicit named
item** — not as a line inside this note. A deferral recorded only in the artifact being deferred is
the same failure mode as an instruction written inside the drifting document.

## Note for whoever reads this next

This item was carried across at least four sessions as an open defect with a wrong diagnosis
attached. The wrong diagnosis is probably why: *"a column is missing"* implies a migration, which
implies a founder-walked schema step, which is heavier than the one-line code change it actually
needed — so it kept being deferred as bigger than it was. **A carried item's stated cause is worth
re-deriving before its priority is trusted.**
