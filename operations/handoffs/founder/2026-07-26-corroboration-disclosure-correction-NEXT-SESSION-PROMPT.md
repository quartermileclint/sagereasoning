# Next-Session Prompt — Step 1: The Corroboration Disclosure Correction

**Stream:** founder. **Tier:** `governance` — **Elevated** risk under 0d-ii (R18 public-surface change; precedent `D-SAGE-PRACTICE-GATE1-ARC3-SLICE4-CONFIGURATION-CONTRACT-PUBLISHED`, 2026-06-21, which published contract language at Elevated with AC7 not engaged). **Critical Change Protocol NOT engaged** — no auth, perimeter, encryption, schema, flag, or deployment-configuration change.
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessor close:** `operations/handoffs/founder/2026-07-26-reason-input-cap-vs-artifact-rule-CLOSE.md`.
**Predecessor decision-log entry:** `D-REASON-INPUT-CAP-VS-CORROBORATION-SCOPED`.
**Deliverable-of-the-day:** `operations/benchmarks/sage-practice-v1/2026-07-26-input-cap-vs-corroboration-scope.md` — read §2, §4, §5, §7 in full.

## Why this session matters

The live `llms.txt:150` corroboration claim is **materially incomplete, today, on a public surface**. It headlines the check as *"self-report claims cross-referenced against your text"* and discloses its residual as harm *"omitted from the text entirely"* — which reads as deliberate scrubbing by a dishonest agent. It does not disclose that the product's own **undocumented 5,000-character `input` cap** produces the identical blind spot for an **honest** agent with a longer artifact, silently, in the permissive direction. The cap is published on no R18 surface, so an agent can discover it only by receiving a 400.

That gap exists **independent of any decision about the cap itself**. This session closes it and nothing else. It is Step 1 of the three-step design in scope-doc §7 — the only step recommended unconditionally, because it is valuable under every branch including "do nothing about the cap," and it needs no perimeter, engine, or flag change to be worth doing.

**Electing otherwise is legitimate.** If you would rather go straight to Step 2 (raise the cap, paired with the Layer-1 truncation defence — `code-critical`, engages PR19) or Step 3, or park all three behind the 0h call, say so at open and this prompt is spent.

## Pre-conditions

1. The 2026-07-26 investigation commit is pushed (scope doc, probe, decision-log entry, close, **and this prompt file** — it post-dates that close's commit block, so add it).
2. **Nothing about the cap has changed.** This session must not alter `TEXT_LIMITS`, `route.ts:947`, the engine, or the harness. Verify at open: `grep -n "TEXT_LIMITS.medium" website/src/app/api/reason/route.ts` still returns 947/949/951 and `security.ts:212` still reads `medium: 5000`. If any has moved, **STOP** — the disclosure must describe the live limit, and a changed limit means Step 2 ran first and this prompt needs rewriting.
3. FRESH session — no investigation context carried.

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min)
2. The predecessor close (~5 min)
3. The scope doc §2 / §4 / §5 / §7 — **in full**; §5 is the exact wording being corrected
4. `/operations/decision-log.md` — the last entry, plus **line 13023** (see below)

Confirm at open: tier; hold-point status (P0 0h — still held); model selection; status vocabulary; signals + risk class.

## Part B — Procedure

### Step 1 — Read the house precedent before drafting a word

`decision-log.md:13023` (2026-07-07, the `score-conversation` R20a wiring) is the standard to match. Facing the same structural class — a per-field cap creating an invisible tail — that session chose `TEXT_LIMITS.long` and **disclosed the residual in writing**: *"distress past the first 15,000 chars of one field doesn't reach the classifier (the same posture as every sibling)."*

**That is the register.** Plain, specific, names the number, names what is lost, does not soften. Draft to it rather than inventing a voice.

### Step 2 — Draft the wording. Do not touch a public surface yet.

Two changes, drafted into a staging file (e.g. `drafts/corroboration-disclosure-staged.md`) per the R18 discipline:

**(a) Publish the `input` limit.** It is currently undocumented on all three surfaces (only `clarification_response` ≤5000 is published — a different field). State the limit, the field, and the failure shape (HTTP 400, `isBillable: false`, no engine cost). **Directional note worth stating in the draft:** publishing 5,000 now is safe even if Step 2 later raises it, because raising an already-published limit is a widening, not a breaking change.

**(b) Amend the corroboration honest-scope sentence** so the residual names **both** routes into it — deliberate omission **and** truncation to fit the limit. The current sentence discloses only the first. The headline parenthetical *"against your text"* is the other half of the problem: an agent submitting a document reads that as *my document*, and the product will silently accept a fragment of it as though it were the whole.

**Do not overstate.** The check is not broken — it is correct on what it is given, and its own defensive cap is 50,000. The honest statement is about **what reaches it**, not about its logic.

### Step 3 — Founder sign-off on the wording, before any public surface changes

R18's governance gate. Present both drafts; get explicit sign-off; only then edit. This ordering is the rule, not a courtesy — the 2026-07-08 S0a and 2026-06-21 Slice-4 sessions both worked this way.

### Step 4 — Apply to the three surfaces

- `website/public/llms.txt` — the §150 corroboration paragraph
- `website/public/.well-known/agent-card.json` — the corroboration extension (**re-validate the JSON parses and report the extension count**; it was 18 at AE-1)
- `website/src/app/api-docs/page.tsx` — the `/api/reason` section

### Step 5 — Verify

```bash
cd website
node -e "const c=require('./public/.well-known/agent-card.json');console.log('extensions:',c.capabilities?.extensions?.length ?? c.extensions?.length)"
npm run build; echo "build exit: $?"
npx tsx src/lib/translation-sandwich/__tests__/corroboration-check.test.ts | tail -2
npx tsx scripts/input-cap-fragment-probe.ts | tail -3
```
Expected: agent-card parses with its extension count reported; `build exit: 0` with `/api-docs` registered; corroboration suite `106 passed, 0 failed`; the probe still prints `REPRODUCED.` — **the probe is the check that the thing being disclosed is still true.** If it stops reproducing, the behaviour changed and the disclosure must be re-derived before publishing.

### Step 6 — Records

Lean decision-log entry + lean close per the cache. Name explicitly: that no code path, cap, flag, or schema changed; that the docs go live on the founder's push; and that Steps 2 and 3 remain unelected.

## Rollback path

`git revert` the docs commit (and redeploy if `page.tsx` shipped). No flag, schema, or credential is involved; production runtime is byte-equivalent either way — only published text changes.

## Forecast

Success = the live surfaces stop implying the check sees a whole document when it may have seen 5,000 characters of one, and an agent can learn the limit without first tripping a 400. That closes a standing R18 honesty gap on its own terms, and leaves Steps 2 and 3 exactly as open as they are now — **which is the point: the honest disclosure should not wait behind the expensive fix.**

End of prompt.
