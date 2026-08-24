# IW-2 Route (a) — Lesson-to-Check Triage

**Date:** 2026-08-24 · **Tier:** `governance` design + one `code-standard` build (the green-lockable check) · **AC7 not engaged**
**Executes:** IW-2 route (a) — *"a lesson naming a checkable property should become a structural check, not a citation"* — as ruled at `D-REFLECTIONS-EXAMINATION-SECOND-RULING-ROUND-FOLDED-2026-08-23`. Companion: **KG-EX2** (route (b)) in `operations/knowledge-gaps.md`.
**Corpus triaged:** all 60 memories at `~/.claude/projects/-Users-clintonaitkenhead-Claude-work-PROJECTS-sagereasoning/memory/`, read by description and, for every candidate promoted to a check, read in full and probed against the repository.

---

## The finding that reframes the route

The ruling assumed a clean split — mechanically-testable lessons on one side, judgment-shaped on the other — and that the first side had *"a clear implementation path (lint rules, regression tests)."* Probing the repository shows the first side is **small, and it splits three further ways**, only one of which is a lint rule.

**The criterion the split turns on, which was not visible before probing:**

> A lesson converts into a structural check *cheaply* only when the property it names is one **the repository currently holds**. Where the repository currently violates it, conversion is not a tooling task — it is a remediation project with a policy question attached, and it should not be filed under "ready to build without further scoping."

---

## The four classes

### Class 1 — Green-lockable: the property holds now, and a check locks it. **1 of 60.**

| Lesson | Property | Probe result |
|---|---|---|
| `public-read-surface-honesty-classes` | No non-ASCII in an HTTP header literal — a ByteString runtime crash that `tsc` **and** `next build` both pass | **194 files, 57 header literals, clean** |

**Built this session.** `website/scripts/header-bytestring-check.ts` + a `--staged` step in `.husky/pre-commit`. Self-tested (six assertions proving the detector is live), and **mutation-verified against a real file in both directions**: an em-dash injected into `trust-record/[agent_id]/handler.ts:59` was flagged with its file, line, header name and offending value; restoring made it pass. The `--staged` path was separately verified on a genuinely staged file, clean and dirty.

Two disciplines from the corpus were applied to the check itself rather than cited at it:
- **Non-vacuity floor** (`guard-needs-a-non-vacuity-floor`): the check reports what it traversed and **fails** if a full-repo run inspects zero header literals — a broken detector is not a clean repo.
- **PR25 branch 1**, adopted the same day: the script's header names what it covers **and what it does not**. It cannot follow `'X-Foo': SOME_CONST` indirection, and says so rather than implying whole-class coverage.

### Class 2 — Red-on-adoption: the property does **not** hold. **2 of 60.**

| Lesson | Property | Probe result |
|---|---|---|
| `rate-limit-bucket-couples-to-measured-surface` | No human-facing route shares `RATE_LIMITS.scoring` with `/api/reason` | **~50 routes share it today** |
| `supabase-view-default-grants-auto-updatable` | A migration creating a `public` view also `REVOKE`s default grants | **5 of 7 view-creating files carry no `REVOKE`** |

**Neither is built, and neither should be treated as ready-to-build.** Adopting either as a check means one of: remediate first, scope the check to changed files only, or downgrade it to a warning — and that is a decision, not an implementation detail.

**On the scoring bucket specifically — founder-elected 2026-08-24: recorded as a finding, no action.** The memory's stated rationale is that the coupling perturbs the false-hold observation window; **that window has been stopped since 2026-07-17** (`GATE1_FALSE_HOLD_CAPTURE` unset; the 130-record buffer frozen as evidence). The coupling may therefore be acceptable at present. It is named here so a future session that restarts a measurement window inherits the fact rather than rediscovering it.

**A second observation on the same lesson, and it is the KG-EX1 shape:** three existing test files already pin this property **per route** — `founder/watching`, `practice/watching`, `practice/fresh` each assert `!routeSrc.includes('RATE_LIMITS.scoring')`. Three independent sessions reached for the same per-surface row. That is precisely what KG-EX1 warns against, arrived at without any of them citing it.

### Class 3 — Gate-coverage, not a missing assertion. **1 of 60, and it is the ruling's own example.**

`nextjs-route-export-validation` — PR23's cited case, and the one the ruling named as having a clear implementation path.

**It needs no new check.** `next build` already enforces the property. The lesson is that **the local gate does not run it**: `.husky/pre-commit` runs `tsc --noEmit` and ESLint, and neither performs Next's route-export validation. The correct fix is a *gate change* — run `npm run build` when a `route.ts`/`page.tsx` is staged — not an assertion.

**Not built, and the reason is a cost the founder should weigh:** a full `next build` on every commit touching a route would add materially to every commit in a repo with nine concurrent sessions. Options are (i) accept the cost on route-touching commits only, (ii) a cheap AST/regex approximation of the export rule, or (iii) leave it to Vercel. **Named as a decision, not taken.**

### Class 4 — Judgment-shaped, or environment facts. **56 of 60.**

Two sub-groups, both outside route (a):

- **Judgment-shaped lessons** (~30) — `method-before-purpose-test-drift`, `primary-data-beats-secondary-characterisation`, `independent-rereview-catches-self-review-blind-spots`, `enforce-activation-needs-live-distribution-evidence`, `verdict-battery-test-the-default-threshold`, `optional-payload-permissive-default`, `measure-classifier-reserve-lightest-outcome`, `never-rederive-a-key-from-untrusted-text`, `never-self-report-at-a-server-boundary`, `review-isolation-must-cover-filesystem`, `model-confabulates-plausible-harness-output`, and the trust-layer design lessons. These name situational calls. **This is route (c)'s territory — item 4's combined scoping session — not route (a)'s.**
- **Environment and reference facts** (~26) — the four `claude-code-*` entries, `vercel-hobby-cron-limit`, `supabase-sql-editor-delete-no-count`, `prod-mint-needs-prod-admin-jwt`, `test-admin-needs-profiles-row`, `api-key-1-per-day-limit-masks-as-401`, and the project-doctrine entries (`sage-practice-measurement-instrument-reframe`, `deterministic-l2-measures-apatheia-not-dikaiosyne`, `trust-layer-build-arc`). **These are not failure-mode lessons at all** — they are facts about tools, environments, or adopted doctrine. No check applies, and none should be invented for them.

---

## One defect found in the memory corpus itself

**`never-self-report-at-a-server-boundary.md` has an empty `description:` and an empty `type:` field.** Every other memory carries both. PR23 mandates consulting the *memory index* before diagnosing a recurring class — and this memory is effectively invisible to an index-based scan, because the index line is what a scan reads.

The content is intact and substantive (it carries the S8 finding that "never self-report" cannot be claimed structural at a server boundary where the audited text is caller-supplied). **Not fixed here** — the memory store is outside this session's declared scope and a peer session may hold it open. Named for the founder.

---

## What route (a) delivered, stated exactly

- **Built:** one check, covering one lesson, over one class of defect — self-tested, mutation-verified, and wired into the pre-commit gate.
- **Designed, not built:** three further candidates, each with its blocking question named.
- **Ruled out with reasons:** 56 lessons, in two sub-groups, one of which belongs to item 4.

**What this does not close.** Route (a) was offered as the half of IW-2 that closes *"the mechanically-testable subset."* The honest measurement is that the subset is **roughly 4 of 60, and one of those was already enforced elsewhere.** Route (a) is therefore a much smaller lever against IW-2 than the routing implied — which strengthens rather than weakens the ruling's own conclusion that route (c) covers the judgment-shaped remainder and that some portion of the weakness is irreducible.

**Not independently reviewed.** PR19's letter does not engage a governance session, and the one code artifact here is dev tooling on no product path. The check is nonetheless the kind of artifact IS-5 says an author cannot verify by re-reading — its mutation verification is evidence it works, not evidence it is well designed.
