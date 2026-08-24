# Close — Reflections Arc, Item 3 (IW-2 routes (a) and (b))

**Date:** 2026-08-24 · **Stream:** founder · **Arc:** reflections
**Tier:** `governance` design + one `code-standard` build. **AC7 not engaged.** No product code path, route, schema, flag, credential, migration, or live operation. **Production untouched.**
**Measurement neutrality:** no file in the `/api/reason` or `/api/guardrail` import graph was touched. The one code artifact is a dev-tooling script plus a pre-commit line.

---

## What landed

**Route (a) — triage + one check.** `D-IW2-ROUTE-A-LESSON-TO-CHECK-TRIAGE-AND-FIRST-CHECK-2026-08-24`. All 60 memories triaged into a four-class taxonomy; the single green-lockable case built, self-tested, mutation-verified, and wired into `.husky/pre-commit`.

**Route (b) — KG-EX2.** `D-KG-EX2-LESSON-CITED-NOT-TESTED-PREPOPULATED-2026-08-24`. Permanent register entry, deliberately constrained to the tracking layer, deliberately carrying no redirect phrase.

**Files:**
- `website/scripts/header-bytestring-check.ts` — new
- `.husky/pre-commit` — third check added (staged API files only)
- `operations/knowledge-gaps.md` — KG-EX2 appended
- `operations/reflections-examination-2026-08/2026-08-24-iw2-route-a-lesson-to-check-triage.md` — new
- `operations/decision-log.md` — two entries at the physical tail
- this close — new

---

## The finding worth carrying forward

**A lesson converts into a structural check cheaply only where the property it names is one the repository currently holds.** That criterion was not visible from the ruling and only appeared under probing. It is what splits the "mechanically testable" side three ways:

| Class | Count | Disposition |
|---|---|---|
| Green-lockable — property holds, check locks it | **1** | Built |
| Red-on-adoption — property does not hold | **2** | Named; each carries a policy question |
| Gate-coverage — already enforced, local gate misses it | **1** | Named; cost is a founder decision |
| Judgment-shaped or environment/doctrine facts | **56** | Out of route (a); ~30 belong to item 4 |

**Honest measurement:** route (a) was routed as the half of IW-2 that closes the mechanically-testable subset. The subset is roughly **4 of 60, one of which was already enforced elsewhere.** It is a smaller lever than the routing implied — which strengthens, not weakens, the ruling's conclusion that route (c) carries the remainder and that some portion is irreducible.

---

## Three decisions left with you

1. **`nextjs-route-export-validation`** — PR23's own cited example. The fix is running `npm run build` on route-touching commits, which adds real time to every such commit in a repo with nine concurrent sessions. Alternatives: a cheap AST approximation, or leave it to Vercel. **Not taken.**
2. **`supabase-view-default-grants-auto-updatable`** — 5 of 7 view-creating files carry no `REVOKE`. A check means remediating first, scoping to changed files, or downgrading to a warning. **Not taken.** Worth noting this one is a security-shaped property, unlike the other two.
3. **`never-self-report-at-a-server-boundary.md`** has an empty `description:` and `type:` in its frontmatter, making it invisible to the index scan PR23 mandates. Content intact. **Not fixed** — the memory store is outside this session's scope and a peer may hold it open.

**Recorded, no action, by your election:** ~50 routes share `RATE_LIMITS.scoring` with `/api/reason`. The memory's rationale was the false-hold observation window, stopped since 2026-07-17. Noted so a future session restarting a window inherits it rather than rediscovering it.

---

## Honest limits

- **No independent review** of either output. PR19's letter does not engage a governance session and the code artifact is dev tooling on no product path. Named, not waived.
- **The check's mutation verification proves it works, not that it is well designed.** It cannot follow `'X-Foo': SOME_CONST` indirection, and its header says so rather than implying whole-class coverage.
- **The pre-commit hook is a shared surface.** Nine peer sessions are active. The new step exits 0 when no API files are staged, so ordinary commits are unaffected; a peer staging an API file with a non-ASCII header literal will be blocked, which is the intended behaviour.
- **At-action guardrail timed out once** mid-session (28s) — the documented fail-open-honest class. That action proceeded unguarded and is recorded as such.

---

## Arc state

| # | Item | Status |
|---|---|---|
| 1 | PR-series rule text (IS-1 encoding) | complete 2026-08-24 |
| 2 | First letter ("On writing before knowing") | complete 2026-08-24 |
| 3 | IW-2 routes (a) tooling + (b) KG-EX tracking | **complete** 2026-08-24 |
| 4 | Combined scoping session (reflect-cadence + IW-2 route (c)) | **unblocked — next** |
| 5 | JSON schema + dashboard design | complete 2026-08-23 |

**Item 4 is now the only open item**, and items 1–3 all feed it: KG-EX2's missing redirect phrase is route (c)'s deliverable; the triage establishes what route (c) must cover (the ~30 judgment-shaped lessons, since route (a) reaches almost none of them); and the arc's own experience this week — the misfiling found by a peer, not by the author — is direct evidence for item 4's central question, which is how a party recognises a trigger moment without having already diagnosed the thing the trigger exists to catch.

**Nothing in this arc licenses a build beyond what your election authorised here.**

---

## Commit

Committed, **not pushed** — you push. `website/src/data/environmental-context.json` remains excluded as a pre-existing weekly-scan modification.
