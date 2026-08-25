# Session Close — 2026-08-26 — Scope the signature-keyed provenance ledger

**Stream:** founder. **Tier:** `governance` — documents only. **Risk:** Standard. **AC7 not engaged.**
No code, schema, migration, flag, credential, public surface, or live operation. **Production
byte-equivalent.** Four peer sessions were active at open; path-scoped commit, `git status` run twice.

## What was done

Scoped option (a) as a buildable `code-critical` change:
`operations/agent-circles-2026-08/2026-08-26-provenance-ledger-SCOPE.md`.
Both hard requirements discharged — the **switch-on threshold** (four checkable conditions) and the
**Q4 wording confirmation** (confirmed, no amendment). The Step-2 coverage-gap surface question is
**answered, not deferred**. The window carries a **data-derived** basis. The PA-10 dependency is named.

## Decisions Made

- `D-PROVENANCE-LEDGER-SCOPED-2026-08-26` — the scope document, its recommendations, and the finding below.

## The finding you should read first

**F-1's correction does not by itself achieve what F-1 said it does.** F-1 corrected the scoping unit to
the owner+agent pair, citing `longitudinal-identity.ts`. That module reaches `owner_agent_pair` **only
when owner and agent are both non-null** — and the s9-loop **consult** credential is owner-less by
design (the module's own docstring names it as the example). The **accreditation-write** credential is
owner+agent bound. **They never match, so every mint from the project's own reference harness would
still be refused** — exactly what F-1 was raised to prevent.

F-1's principle and unit are both correct and untouched. What it did not check is that the configuration
it cited fails the module's own precondition on one of its two credentials.

**Resolved in scoping without a design compromise** (scope §3): the module is used unchanged, the
cross-tenant guard is untouched, and the **credential configuration** moves to satisfy it — as a named
precondition on the switch-on, not a build item. **Recommended form: mint a fresh owner+agent-bound
consult credential for the harness rather than mutating the existing one's `owner_user_id`** —
`/api/credential/erase` scope-guards external-consumer erasure on `owner_user_id IS NULL`, so mutating
it would quietly take that credential out of the erasure path.

**It turns on one fact a repo session cannot verify** (below). If it comes back owner-bound, the finding
narrows to a general condition rather than a live defect — the condition holds either way.

## Founder Verification

**1 — Required. Scope §3 turns on this.**

```sql
select id, label, owner_kind, owner_user_id is null as owner_less, agent_id, capabilities, is_active
from api_keys
where agent_id = 'sagereasoning:s9-loop@v1';
```

**2 — Confirmatory. Firms the 90-day window; does not block.** Scope §12.2 carries the query — the
write-vs-consult lag per agent. A lag in hours confirms the recommendation; a lag in months moves the
question elsewhere.

**3 — Nothing to spot-check in production.** No surface changed.

## Status Changes

- The ledger: **Scoped** (was: ruled, unscoped). Still **UNSCHEDULED as a build.**
- The switch-on threshold: **Defined** — addendum 2's hard requirement discharged.
- The Q4 wording: **Confirmed**, no amendment recommended.
- Route (i) and edit two: unchanged, still their own sessions.

## Next Session Should

The founder sequences. Nothing here self-starts.

- **Run verification 1.** It is one query and it decides how live the identity finding is.
- Then, if a build is elected, **slice 1** (both migrations, TEST → production, inert) per scope §13.
  Slice 4 — the credential step — is the only one that requires action rather than waiting, so it is
  worth scheduling early rather than at the switch-on.
- **The scope recommends against de-scheduling the S2 recency-tier work.** The ledger enables it rather
  than replacing it; that reads the opposite way to the natural assumption and is scope §8.

## Blocked On

Nothing. The scoping is complete as scoped.

## Open Questions

- **No mentor question is raised**, and scope §15 argues why rather than defaulting to silence. The
  candidate the prompt anticipated (the gap surface) is answered. The identity finding is not owed —
  it relaxes no ruled constraint and lands where addendum 2 assigned such things. **You may escalate it
  if you read the credential prerequisite as heavier than the scope treats it.**
- Edit two's own wording, when enforcement begins, is recorded as a forward drafting constraint (§10).

## Cross-references

- `operations/agent-circles-2026-08/2026-08-26-provenance-ledger-SCOPE.md`
- `operations/agent-circles-2026-08/2026-08-25-mentor-ruling-extraction-provenance-fix-choice-verbatim.md` (+ both addenda)
- `operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md` — ⚠ URGENT, item 2
- `operations/decision-log.md` — `D-PROVENANCE-LEDGER-SCOPED-2026-08-26`

**Rollback:** `git revert` the session commit. Documents only.
