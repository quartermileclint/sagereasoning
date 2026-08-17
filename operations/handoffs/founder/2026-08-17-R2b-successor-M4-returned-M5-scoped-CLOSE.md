# Session Close — 2026-08-17 — R2b successor: M-4 returned to the mentor, M-5(a) corrected, M-5(b) scoped

**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md` (cached via `/adopted/standing-protocol-cache.md`).
**Tier:** `governance` — Standard risk. **No code, no schema, no flag, nothing pushed.**
**Date:** 2026-08-17.
**Decision-log entry:** `D-R2B-SUCCESSOR-M4-RETURNED-M5A-CORRECTED-M5B-SCOPED-PR19-FOLDED`.

## Decisions Made

- **M-4 returns to the mentor rather than being built.** Two mechanism facts the ruling was never
  shown: the dimension is a hard gate on grade upgrade (published authority level), and it is
  mean-blind. Your initial election — strip the inverted valence — was superseded once its price was
  established, because capping the dimension makes `principled → sage_like` structurally unreachable.
- **M-5(a) discharged internally.** No false public claim existed to amend; the false posture was in
  two `compliance/` documents, both corrected in place quoting the ruling verbatim.
- **M-5(a)'s public half drafted, unsigned.** A *second* falsehood surfaced: the internal claim that
  the acute-crisis gap was publicly disclosed. It is not. R18 package awaits your signature.
- **M-5(b) scoped, not built**, with five decisions listed and recommendations against each.
- **M-2 and M-3 carry with their open questions settled**, so a later session cannot re-litigate them.

## Status Changes

| Item | Old | New |
|---|---|---|
| M-4 | Carried, unresolved | **Returned to mentor** — brief authored; Spec 4 still blocked |
| M-5(a) internal | False posture in 2 compliance docs | **Corrected** |
| M-5(a) public | Assumed a false public claim existed | **Verified none exists**; a different gap found, drafted for signature |
| M-5(b) | Carried, unscoped | **Scoped** (`Designed`, not `Scaffolded`) |
| M-2 column shape | Open | **Settled** — `q1_determination text` + CHECK |
| M-3 tier | Assumed repo-only | **Settled** — print-split only; ledger carried |
| 4 unprotected routes | Unknown | **Found** — safety finding, awaiting your direction |

## What needs you

1. **Relay the M-4 brief to the mentor.**
   `operations/trust-layer-2026-07/2026-08-17-M4-disposition-stability-mechanism-facts-FOR-RULING.md`.
   It is written so that if the answer is "execute retirement as ruled," we do it on that answer alone
   and do not come back a third time.
2. **Sign or amend the R18 package** —
   `operations/trust-layer-2026-07/2026-08-17-M5a-r18-public-disclosure-signoff-package.md`.
   Three options; recommendation is Option A.
3. **Direct the four-route safety gap.** Recommendation: it precedes M-5(b).
4. **Direct the two adjacent public-honesty items** — the `transparency` support@ promise (against a
   channel you have confirmed is unwatched) and the `ops-hub` monitoring copy (whose auth gating I did
   **not** verify against production — that check is outstanding and I have not concluded it is public).

## Blocked On

**Files changed (all uncommitted):**
- `compliance/R20a-vulnerable-user-protections.md` — corrected
- `compliance/ADR-R20a-01-classifier-pipeline.md` — corrected
- `operations/trust-layer-2026-07/2026-08-17-M4-disposition-stability-mechanism-facts-FOR-RULING.md` — new
- `operations/trust-layer-2026-07/2026-08-17-M5a-r18-public-disclosure-signoff-package.md` — new
- `operations/trust-layer-2026-07/2026-08-17-M5b-vulnerability-flag-write-path-SCOPE.md` — new
- `operations/trust-layer-2026-07/2026-08-16-mentor-rulings-M1-M5-r2b-verbatim.md` — execution table updated
- `operations/handoffs/founder/2026-08-15-concurrent-arc-plan.md` — R2b-successors ticked
- `operations/decision-log.md` — entry appended
- this close

**Production state at session close: UNCHANGED.** No flag set, no schema applied, no public surface
edited, nothing pushed. HEAD remains `17fda7e`. All four R2b flags remain UNSET. Spec 4's activation
remains blocked by M-4. AC7 not engaged at any point.

## Verification

`tsc` was clean at session open and **no TypeScript, SQL, or JSON file was modified**, so no
re-verification is required — confirmed by `git status`: the only non-markdown entries in the working
tree are pre-existing and not this session's.

The M-3 frozen-buffer acceptance gate input was confirmed intact (130 records) and **deliberately not
run**, because M-3 was not touched — running it would have proved nothing about this session.

## Open Questions

- Does the grade-gate coupling change *what* M-4 retires, or merely confirm the ruling as given?
  (With the mentor.)
- Is the `ops-hub` page actually publicly renderable? Not verified against production.
- Should the M-2 build also correct FD-R2 (the second consumer of the conflated Q1 state that can
  suppress a legitimate progress hold)? Settle before authoring the migration SQL.

## Founder Verification

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add compliance/R20a-vulnerable-user-protections.md compliance/ADR-R20a-01-classifier-pipeline.md operations/trust-layer-2026-07/2026-08-17-M4-disposition-stability-mechanism-facts-FOR-RULING.md operations/trust-layer-2026-07/2026-08-17-M5a-r18-public-disclosure-signoff-package.md operations/trust-layer-2026-07/2026-08-17-M5b-vulnerability-flag-write-path-SCOPE.md operations/trust-layer-2026-07/2026-08-16-mentor-rulings-M1-M5-r2b-verbatim.md operations/handoffs/founder/2026-08-15-concurrent-arc-plan.md operations/handoffs/founder/2026-08-17-R2b-successor-M4-returned-M5-scoped-CLOSE.md operations/decision-log.md
git commit -F - <<'MSG'
R2b successor: M-4 returned to the mentor, M-5(a) corrected, M-5(b) scoped

Grounding ran before any election and overturned the load-bearing claim in
all five dimensions. M-4 not built - it gates grade upgrade and is mean-blind,
neither of which the ruling was shown. M-5(a) discharged internally; no false
public claim existed, but a second falsehood did. M-5(b) scoped. PR19 folded
5 findings incl. two missed unprotected routes and one self-correction to the
M-4 brief's own framing.

No code, no schema, no flag, nothing activated.

Model: claude-opus-5
Effort: high
MSG
```

Then push via GitHub Desktop. **Nothing deploys behaviourally** — the only changed files are markdown.

## Cross-references

- `operations/handoffs/founder/2026-08-17-R2b-mentor-rulings-successor-NEXT-SESSION-PROMPT.md` (this session's prompt)
- `operations/trust-layer-2026-07/2026-08-16-mentor-rulings-M1-M5-r2b-verbatim.md` (binding)
- `D-CONCURRENT-ARC-R2B-GUARD-BUNDLE-BUILT-PR19-FOLDED-MENTOR-M1-CORRECTED`
- `operations/handoffs/founder/2026-08-17-M4-ruling-return-and-perimeter-gap-NEXT-SESSION-PROMPT.md` (successor)

*End of session close. Four rulings addressed: one returned to its author with the facts it needed, one
discharged, one scoped, two carried with their questions closed — and a four-route safety gap found
that no ruling asked for.*
