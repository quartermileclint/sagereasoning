# Session Close — 2026-07-26 — The `/api/reason` Input Cap vs the Outbound-Artifact Rule

**Stream:** founder.
**Governing frame:** /adopted/session-opening-protocol.md (cached via /adopted/standing-protocol-cache.md).
**Tier:** `code-elevated` — investigation and design. **What landed is Standard risk:** one analysis document and one repo-only script imported by nothing. No flag, schema, mint, deploy, credential, or live API call. AC7 not engaged. PR6 not engaged. PR19 not yet engaged.
**Date:** 2026-07-26.

## Decisions Made

- `D-REASON-INPUT-CAP-VS-CORROBORATION-SCOPED` — the 5,000-character `input` cap is scoped as a **corroboration-scope defect, not an ergonomics defect**, and the fix is split into three decoupled steps with only the documents-only disclosure correction recommended unconditionally.

## What the session found

All four questions the prompt posed are answered; none deferred, and the hypothesis was resolved rather than hedged.

- **Provenance: answered, and it is "inherited."** `TEXT_LIMITS` arrived whole in `aeadbd1` (2026-03-26, a generic security-hardening commit) with no cost, latency, or context-budget rationale. `/api/reason` binds `input` to the tier labelled *"context, reflections"*; the tier labelled *"documents, conversations"* already exists at 15,000 and is already used by two sibling routes. **Tier mis-selection, not tuning** — `medium` is the copy-paste default across ~40 call sites, and when the cap was set `/api/reason` was not yet a surface agents submitted artifacts to.
- **The hypothesis HOLDS, in the unsafe direction — and was demonstrated, not argued.** The check reads `params.input` verbatim while its own defensive cap is 50,000, so the route is the binding constraint, not the check. Its primary detector fires only on harm markers found in the submitted text, so a truncated submission raises **no contradiction** and a claimed `met` passes into a **signed** assessment — silent-permissive, unlike the `examined_before_acting` path which fails conservative. `website/scripts/input-cap-fragment-probe.ts` puts one 18,463-character artifact with an honest `met` self-report through four submissions: full text floors `sage_like → reflexive`; `truncateForServer()` returns `none` and holds `sage_like`; the harm-bearing chunk alone floors (**negative control** — the detector is provably alive on that exact text); chunk 1 alone returns `none`. **A four-rank swing on one document, decided entirely by what the cap let through.**
- **Why that is a promotion, not a complaint.** The shipped suite documents "harm scrubbed from the text" as an expected residual reached by a *dishonest* agent. The cap reaches the identical structural condition for an *honest* one — no lie told, via a limit the product imposes, does not publish, and its own harness already works around. Stated with its bound: this widens the residual's **innocent reachability**, does not enlarge its ceiling, and changes nothing about the weights-tier disposition, which was already BLOCKED on the strictly worse adversarial form.
- **Blast radius mapped rather than assumed.** R20a/AC5 makes any live change Critical — but two routes already in the same perimeter registry run at 15,000 and 30,000 today, so the walk is precedent-covered. The **real coupling is Layer 1's undefended 4,000-token output budget**: it has no `stop_reason === 'max_tokens'` defence where Layer 3 deliberately does, so raising the input cap alone would convert today's **free 400 at the door** into a **billed mid-call `layer1_throw`**. Billing is clean. The cap applies identically on `l1_supply`, where it bites hardest — the server skips extraction there, so the corroboration check is the only thing reading the text.
- **An R18 gap that exists today, independent of any cap decision.** The `input` limit is published nowhere (only `clarification_response` ≤5000, a different field), so raising it breaks no published contract — but `llms.txt:150` headlines the check as *"against your text"* and frames the residual as *"omitted from the text entirely"*, which reads as deliberate scrubbing. It does not disclose the product-caused route into the same blind spot, and the limit is discoverable only by receiving a 400.
- **One option is recommended for rejection, explicitly.** Relaxing rule 1c to a bounded extract is the cheapest option and will look attractive; it would hand the sampling frame to the very agent whose self-report is under corroboration, moving the finding *toward* the adversarial class.

## Status Changes

| Item | Old | New |
|---|---|---|
| 5,000-char `input` cap vs rule 1c | Named engineering follow-up, unscoped | **Scoped — corroboration-scope defect; three-step fix designed** |
| The corroboration-fragment hypothesis | Open, worth resolving either way | **Confirmed empirically, negative-control-backed** |
| `llms.txt` corroboration honest-scope claim | Assumed adequate | **Materially incomplete — named for correction (step 1)** |
| Layer-1 `max_tokens` truncation defence | Not previously noticed absent | **Named as the hard coupling on any cap raise** |

## Next Session Should

**Nothing is queued by default — the three steps are unsequenced until the founder elects, and the 0h call still comes first.**

**Step 1** (publish the `input` limit + amend the corroboration honest-scope sentence on all three R18 surfaces) is **documents-only, Standard risk, and recommended unconditionally** — it closes a live honesty gap on its own terms and is valuable under every branch, including "do nothing about the cap." It is the natural next session if one is wanted.

**Step 2** (raise `input` to `TEXT_LIMITS.long` **paired with** a Layer-1 truncation defence — not either half alone) is `code-critical`, founder-walked under AC5, and **engages PR19**; the template at `operations/review-harness/independent-review-workflow-template.md` applies. **Step 3** (a first-class chunked path) needs its own design session and is **gated on carrying cross-chunk corroboration state** — without it, it reproduces the probe's case D while looking like a fix.

## Blocked On

**Files remaining uncommitted (this session's commit set):**
- `operations/benchmarks/sage-practice-v1/2026-07-26-input-cap-vs-corroboration-scope.md` (new)
- `website/scripts/input-cap-fragment-probe.ts` (new)
- `operations/decision-log.md` (this entry)
- `operations/handoffs/founder/2026-07-26-reason-input-cap-vs-artifact-rule-CLOSE.md` (this file)

**Production state at session close (as of 2026-07-26, per PR18):** **No production change and no production traffic** — design only; no mint, flag, schema, deploy, or API call, and no live path imports the new script. The build is `origin/main 1e0306d`, unchanged by this session. `website/public/images/millstone.PNG` remains untracked (the founder's brand-thread image; untouched). **S11 remains REFUSED; MEASURE throughout; weights BLOCKED; the 0h call remains the founder's.**

**Session honesty note:** the founder-loop practice harness ran **unframed for all substantive work** — every examination through the investigation, the scope document, and the decision-log entry returned either "no assessment in response" or an honest 28s timeout (the disclosed S11b latency class). **One frame did arrive**, on the final correction edit at the closing review, and it returned `principled` / `is_kathekon=true` **with a redirection flagging an open correction loop** — correctly, since that edit was itself a correction. Recorded rather than smoothed, and pointedly: a session whose subject is what the instrument can and cannot see spent nearly all of it unable to see itself, and the one thing it did see was the session correcting its own overclaim.

**A correction made in the closing review, not smoothed into the record:** the scope document's provenance section originally asserted that no rationale for the cap exists "in the decision log." That was written without checking — the prompt had explicitly listed the decision log among the sources to check before declaring provenance unknown. On checking, two relevant entries exist (`13023`, `13811`), and both **strengthen** the finding rather than weaken it: the tier vocabulary *was* reasoned about deliberately once, on a sibling route, where the reviewer disclosed the silent-tail residual in writing — precedent for step 1 — and this very cap was hit and worked around three weeks before P2 hit it again. Both records are amended in place with the narrowed, better-evidenced claim. **The overclaim was small and the correction improved the argument; the lapse was asserting a source had been checked when it had not.**

## Open Questions

- **Which of the three steps to take, and in what order** — the founder's election. Step 1 is the only one recommended unconditionally.
- **Even after step 2, a sufficiently long artifact truncates silently.** Step 1 makes that honest; only step 3 makes it unnecessary. That trade is stated in the scope doc rather than smoothed.
- **Not investigated, named rather than skipped:** whether `context`/`domain_context` (also `medium`) are mis-tiered; whether other `medium` call sites hold document-class fields; whether `truncateForServer` should **refuse** rather than truncate a document-class input — arguably the more honest client-side posture, and a smaller change than all three steps.
- Carried, unrelated: the 0h call; the S3 safeguard trigger; the `high` ↔ `reasoning_effort: 40` mapping; CRED-1 (ae2-smoke revocation check); the four AUTH post-deploy smokes.

## Founder Verification

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsx scripts/input-cap-fragment-probe.ts | tail -6
npx tsx src/lib/translation-sandwich/__tests__/corroboration-check.test.ts | tail -2
npx tsc --noEmit; echo "tsc exit: $?"
```
Expected: the probe prints `REPRODUCED.`; the shipped suite reports `106 passed, 0 failed`; tsc exits 0.

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add \
  operations/benchmarks/sage-practice-v1/2026-07-26-input-cap-vs-corroboration-scope.md \
  website/scripts/input-cap-fragment-probe.ts \
  operations/decision-log.md \
  operations/handoffs/founder/2026-07-26-reason-input-cap-vs-artifact-rule-CLOSE.md
git commit -F - <<'MSG'
The input cap is a corroboration-scope defect, not an ergonomics one

The 5,000-char /api/reason input cap binds the field agents submit documents
to. Provenance: inherited, not considered — TEXT_LIMITS arrived whole in a
2026-03-26 security-hardening commit, and the route uses the tier labelled
"context, reflections" while the tier labelled "documents, conversations"
already exists at 15,000 and is already used by two sibling routes.

The open hypothesis is confirmed, in the unsafe direction, and demonstrated
rather than argued. The corroboration check reads params.input verbatim while
its own cap is 50,000, so the route is the binding constraint. Its primary
detector fires only on harm markers present in the submitted text, so a
truncated submission raises no contradiction and a claimed `met` passes into a
signed assessment. input-cap-fragment-probe.ts puts one 18,463-char artifact
with an honest `met` self-report through four submissions: full text floors
sage_like to reflexive; truncateForServer() holds sage_like; the harm-bearing
chunk alone floors (negative control); chunk 1 alone holds. A four-rank swing
on one document, decided entirely by what the cap let through — and no lie was
told in any case. That reaches the disclosed A2 residual, documented as a
dishonest-agent class, via a limit the product imposes, does not publish, and
its own harness already works around. It widens innocent reachability; it does
not enlarge the ceiling or move the weights-tier disposition.

Blast radius mapped: R20a makes a live change Critical but two routes in the
same perimeter registry already run at 15,000 and 30,000; the hard coupling is
Layer 1's undefended 4,000-token output budget, which would turn today's free
400 into a billed mid-call layer1_throw. Billing is clean. l1_supply is where
it bites hardest.

Three decoupled steps recommended, only the first unconditionally: publish the
limit and amend the corroboration honest-scope sentence (documents-only, closes
a live R18 gap alone); then raise to TEXT_LIMITS.long paired with a Layer-1
truncation defence (Critical, engages PR19); then scope a chunked path only if
it carries cross-chunk corroboration state. Relaxing rule 1c to a bounded
extract is recommended for rejection — it hands the sampling frame to the agent
under corroboration.

Design only. No flag, schema, deploy, or live call; the probe is imported by
nothing.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
MSG
git status --porcelain
```
Expected: only `?? website/public/images/millstone.PNG` remains. Then push via GitHub Desktop — the deploy is a runtime no-op (the new script sits outside the Next build graph).

## Cross-references

- `operations/benchmarks/sage-practice-v1/2026-07-26-input-cap-vs-corroboration-scope.md` (the deliverable)
- `operations/benchmarks/sage-practice-v1/2026-06-27-gaming-robustness-bar-scope.md` (where the A2 residual is defined)
- `operations/agent-org-2026-07/runs/2026-07-25-rerun/verdict-memo.md` §5.2 (the origin finding)
- `operations/handoffs/founder/2026-07-26-P2-rerun-VERDICT-CLOSE.md` (predecessor close)
- `D-REASON-INPUT-CAP-VS-CORROBORATION-SCOPED` · `D-AGENT-ORG-P2-RERUN-VERDICT-2026-07-26` · `D-TRUST-LAYER-S0A-CORROBORATION-CHECK-LIVE-GATE-ACTIVATION` · `D-SAGE-PRACTICE-GAMING-ROBUSTNESS-BAR-SCOPED`

*End of session close. The cap turned out not to be about ergonomics: it is the reason an honest agent can reach a blind spot the product documents as requiring dishonesty — and the cheapest part of the fix is telling the truth about it.*
