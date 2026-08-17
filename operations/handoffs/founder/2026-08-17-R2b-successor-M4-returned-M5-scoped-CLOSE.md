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

*End of the session close as first written. Four rulings addressed: one returned to its author with the
facts it needed, one discharged, one scoped, two carried with their questions closed — and a four-route
safety gap found that no ruling asked for.*

---

# CONTINUATION — the session did not end here (2026-08-17, same sitting)

**This section supersedes the close above wherever they conflict** — specifically the "Tier: governance
— no code" line, the Status Changes table, and the Founder Verification commit command. The close above
was accurate when written. The session then continued in two substantial phases.

## Phase 2 — the mentor ruled on M-4, and four founder decisions landed

**The mentor's M-4 ruling arrived and is ADOPTED AS BINDING** (`D-MENTOR-RULING-M4-RETURN-ADOPTED`;
verbatim at `operations/trust-layer-2026-07/2026-08-17-mentor-ruling-M4-return-verbatim.md`).

**It confirms the original ruling as given.** Retire `disposition_stability` from agent-facing
surfaces; **let `principled → sage_like` sit structurally unreachable** — *"a ladder that accurately
reflects what has not yet been demonstrated"*; do **not** re-tune the thresholds, which the mentor
names as the dishonest option. **Also: correct the mean-blindness now**, independently, because the two
defects affect different populations — but that correction *"does not restore the dimension to
agent-facing surfaces."* **And update the published disclosure to name both defects.** Spec 4 stays
deactivated *"until the dimension is restored."*

*"Execute retirement on this alone. No further ruling is needed on the first question."* — and the
brief committed us to not returning a third time. **That binds.**

**Four founder decisions, all recorded:** R18 **Option A** (the full `/limitations` disclosure); the
route gap **precedes M-5(b)**; **`ops-hub` IS publicly renderable** (founder-verified — so its
"monitored by Sage Ops / 2-hour acknowledgment" copy is a live public claim needing correction); and
**M-2 should also correct FD-R2**.

## Phase 3 — the R20a perimeter gap CLOSED, built dark, PR19 folded

`D-R20A-PERIMETER-GAP-CLOSURE-SIX-ROUTES-BUILT-DARK-PR19-FOLDED`. **This is code, and it is the
session's largest deliverable** — so the close's original "no code" framing no longer holds.

**SIX routes, not four.** PR19's independent third sweep found two more: `/api/mentor-baseline-response`
and its founder-only twin, both accepting an array of **unbounded** practitioner `answer` fields
straight into the LLM. The tell: `/api/score-scenario` takes the *same* shape and *does* screen it.
**The count moved 2 → 4 → 6 across three passes, and six is NOT claimed final** — the guard battery has
no filesystem-level exhaustiveness check, which is the named follow-up.

**PR19 also caught two HIGH defects this build introduced:** the mild-severity crisis resources were
silently dropped on the primary (fresh-LLM) success path of both skill routes, attached only on the
cached path. Root cause: an `Edit` with `replace_all` matched the 6-space-indented cached return while
the primary return is 4-space-indented — reported success while hitting one of two. **Both fixed.**
And a fair honesty finding: the B3 ruling was over-attributed (it covers `/impulse` alone; the
extension to these routes is the builder's argued analogy) — **corrected in the module, with the
provenance now stated before the argument.**

## Revised Status Changes

| Item | Old | New |
|---|---|---|
| M-4 | Returned to mentor | **RULED — retire + mean-floor + dual disclosure. Execution CARRIED, unstarted** |
| Spec 4 activation | Blocked pending M-4 | **Still blocked** — ruled to stay off until the dimension is *restored* |
| R20a perimeter | 14 route-level + 2 gate | **20 route-level + 2 gate** (built dark, unset flag) |
| The route gap | Found, 4 routes, unfixed | **CLOSED for 6 routes, dark** — not proven exhaustive |
| R18 Option A | Drafted, unsigned | **Signed** — application carried |
| ops-hub gating | Unverified | **Confirmed publicly renderable** — correction carried |
| M-2 | Carried | Carried **+ FD-R2 folded in by founder decision** |

## Revised verification

`tsc` **0** · `npm run build` **exit 0**, all six routes registered ·
**r20a-invocation-guard 186/0** (126 at session open) · `r20a-classifier-session-id` 15/0 ·
**mutation-verified twice** (original routes and PR19-found routes, each → 2 failures → restored) ·
`SUBSTRATE_R20A_GAP_CLOSURE_ENABLED` **unset in every env file and the process env**.

## Revised production state at session close

**PHASE 1 WAS COMMITTED AND PUSHED MID-SESSION BY THE FOUNDER — `18e033a` on `origin/main`.** HEAD is
`18e033a`, **not** `17fda7e` (an earlier draft of this continuation said `17fda7e`; corrected on
first-hand `git log` check rather than left to drift). That commit carried **documents only** — the two
corrected `compliance/` files, the three M-4/M-5 deliverables, the first decision-log entry, the arc
plan, and this close as first written. Nothing under `website/`, so **Vercel correctly did not rebuild
and production behaviour is unchanged by it.**

**Production behaviour: UNCHANGED.** No flag set, no schema applied, no public-facing surface edited.
All four R2b flags and the new gap-closure flag are UNSET. Spec 4 blocked. AC7 not engaged at any point
in the session.

**Still uncommitted at this close:** the entire gap-closure build (the shared module, six `route.ts`
files, the registry) plus this session's Phase-2/3 records.

## ⚠ Revised Founder Verification — the command below supersedes BOTH earlier ones

Two corrections from a first-hand `git status` check: the earlier command listed files **already
committed in `18e033a`**, and it **omitted the new successor prompt**, which did not exist when it was
written.

`website/src/data/environmental-context.json` remains modified and is an **unrelated** stale weekly
scan (PR19-flagged). It is deliberately excluded — commit it separately if at all.

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add website/src/lib/r20a-gap-closure.ts website/src/app/api/mentor/passion-classify/route.ts website/src/app/api/mentor/passion-log/route.ts website/src/app/api/skill/sage-classify/route.ts website/src/app/api/skill/sage-prioritise/route.ts website/src/app/api/mentor-baseline-response/route.ts website/src/app/api/mentor/private/baseline-response/route.ts website/src/lib/__tests__/r20a-invocation-guard.test.ts operations/trust-layer-2026-07/2026-08-17-mentor-ruling-M4-return-verbatim.md operations/trust-layer-2026-07/2026-08-17-M4-mentor-consultation-outbound.md operations/trust-layer-2026-07/2026-08-16-mentor-rulings-M1-M5-r2b-verbatim.md operations/handoffs/founder/2026-08-17-activation-M4-execution-and-honesty-fixes-NEXT-SESSION-PROMPT.md operations/handoffs/founder/2026-08-17-M4-ruling-return-and-perimeter-gap-NEXT-SESSION-PROMPT.md operations/handoffs/founder/2026-08-17-R2b-successor-M4-returned-M5-scoped-CLOSE.md operations/handoffs/founder/2026-08-15-concurrent-arc-plan.md operations/decision-log.md
git status --short | grep -v "^??" | grep environmental && echo "!!! environmental-context.json is STAGED - unstage it: git restore --staged website/src/data/environmental-context.json" || echo "OK - environmental-context.json not staged"
git commit -F - <<'MSG'
R20a perimeter gap closed for SIX routes (dark) + M-4 ruled and adopted

Six authenticated human-facing routes accepted practitioner free text with
NO distress check and were absent from HUMAN_FACING_POST_ROUTES, so the
guard battery could not see them. Closed behind ONE flag, UNSET everywhere.

PR19 found two HIGH defects this build introduced (mild-support silently
dropped on the primary success path of both skill routes - a replace_all
matched only the differently-indented cached return) and two MORE
unprotected routes (mentor-baseline-response + its founder-only twin).
All fixed. The sweep count moved 2 -> 4 -> 6; six is NOT claimed final,
and the missing exhaustiveness backstop is a named follow-up.

Mentor ruled M-4: retire disposition_stability from agent-facing surfaces,
let principled->sage_like sit structurally unreachable, correct the
mean-blindness in internal logic only, disclose both defects. Execution
carried, unstarted. Spec 4 stays deactivated until restoration.

Guard battery 126 -> 186/0, mutation-verified twice. tsc 0, build 0.
Nothing activated, no schema, no public surface changed.

Model: claude-opus-5
Effort: high
MSG
```

**On deployment:** the six `route.ts` files DO deploy on push, so **Vercel will rebuild this time** —
unlike `18e033a`'s document-only set. But every route is byte-identical flag-off (proven per-route by an
independent PR19 dimension), so **the push changes no behaviour.**

*End of continuation. Six routes now screen practitioner distress that previously reached nobody, one
mentor ruling is settled and awaiting execution, and the honest limit is stated: the sweep that found
six is not proven to have found them all.*
