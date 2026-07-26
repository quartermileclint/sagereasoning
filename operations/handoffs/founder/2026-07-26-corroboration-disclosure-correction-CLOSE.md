# Session Close — 2026-07-26 — Corroboration Disclosure Correction (Step 1)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Tier:** `governance` — Elevated under 0d-ii (R18 public-surface change; precedent `D-SAGE-PRACTICE-GATE1-ARC3-SLICE4-CONFIGURATION-CONTRACT-PUBLISHED`). **Critical Change Protocol NOT engaged** — no auth, perimeter, encryption, schema, flag, or deployment-configuration change.
**Predecessor:** `operations/handoffs/founder/2026-07-26-reason-input-cap-vs-artifact-rule-CLOSE.md`.
**Date:** 2026-07-26.

## Decisions Made

- `D-CORROBORATION-DISCLOSURE-CORRECTION-APPLIED` — Step 1 of the input-cap-vs-corroboration scope doc (publish the undocumented input limit; amend the corroboration honest-scope sentence to name both the omission and truncation routes into the same blind spot) applied to all three R18 surfaces, exactly as staged and signed off, and only that step.

## What this session did

Followed the prompt exactly: verified pre-conditions (HEAD == origin/main; the cap unchanged at 5,000 since the investigation), read the house precedent (`decision-log.md:13023`), drafted both wordings to `drafts/corroboration-disclosure-staged.md`, obtained explicit chat sign-off before touching any public surface, applied the wording to `llms.txt`, `agent-card.json`, and `api-docs/page.tsx`, and verified.

**No scope creep.** Step 2 (raising the cap) and Step 3 (a chunked path) were not touched — they remain exactly as unelected as the predecessor left them. Nothing about `context`/`domain_context`'s own tiering, `truncateForServer`'s refuse-vs-truncate posture, or any other named-but-not-investigated item from the predecessor's §8 was opened.

## Status Changes

| Item | Old | New |
|---|---|---|
| The `input` cap's publication status | Undocumented on all three R18 surfaces | **Published: 5,000 chars, exact fields, exact failure shape** |
| `llms.txt:150` corroboration honest-scope claim | Names one route into the blind spot (agent omission) | **Names two — omission and product-caused truncation** |
| Corroboration extension headline ("against your text") | Reads as "your whole document" | **Reworded to "what the request actually sends"** |
| `agent-card.json` `corroboration-check/v1` params | No field-limit disclosure | **New `field_limits` key; `scope` amended to match** |

## Verification

```
extensions: 18                                    (unchanged — an existing extension was amended, not added)
✓ Compiled successfully; /api-docs registered      (npm run build, exit 0)
=== corroboration-check: 106 passed, 0 failed ===
REPRODUCED. [same four-case table as the predecessor session]
```

## Next Session Should

Nothing is queued by default. Step 2 (raise `input` to `TEXT_LIMITS.long`, paired with a Layer-1 `stop_reason === 'max_tokens'` truncation defence — not either half alone; Critical, founder-walked, engages PR19) and Step 3 (a chunked path, gated on carrying cross-chunk corroboration state) remain the founder's to elect, in either order, or not at all. The 0h call still comes first.

## Blocked On

**Files remaining uncommitted (this session's commit set):**
- `website/public/llms.txt` (modified)
- `website/public/.well-known/agent-card.json` (modified)
- `website/src/app/api-docs/page.tsx` (modified)
- `drafts/corroboration-disclosure-staged.md` (new)
- `operations/decision-log.md` (this entry)
- `operations/handoffs/founder/2026-07-26-corroboration-disclosure-correction-NEXT-SESSION-PROMPT.md` (already untracked at session open; committed alongside per the pre-condition note)
- `operations/handoffs/founder/2026-07-26-corroboration-disclosure-correction-CLOSE.md` (this file)

`website/public/images/millstone.PNG` remains untracked (the founder's brand-thread image, unrelated, untouched — carried from the predecessor session).

**Production state at session close (as of 2026-07-26, per PR18):** no flag, schema, mint, deploy, or live API call this session. The commit deploys **on the founder's push**, at which point the three public-surface files carry the corrected copy live — a content-only change, runtime byte-equivalent. `S11` remains REFUSED; MEASURE throughout; weights BLOCKED; the 0h call remains the founder's.

## Open Questions

Unchanged from the predecessor: which of Steps 2/3 to take and in what order; whether `context`/`domain_context` are independently mis-tiered; whether other `medium` call sites hold document-class fields; whether `truncateForServer` should refuse rather than truncate a document-class input. Carried, unrelated: the S3 safeguard trigger; the `high` ↔ `reasoning_effort: 40` mapping; CRED-1 (ae2-smoke revocation check); the four AUTH post-deploy smokes.

## Founder Verification

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
node -e "const c=require('./public/.well-known/agent-card.json');console.log('extensions:',c.capabilities?.extensions?.length ?? c.extensions?.length)"
npm run build; echo "build exit: $?"
npx tsx src/lib/translation-sandwich/__tests__/corroboration-check.test.ts | tail -2
npx tsx scripts/input-cap-fragment-probe.ts | tail -6
```
Expected: `extensions: 18`; `build exit: 0` with `/api-docs` registered; `106 passed, 0 failed`; the probe still prints `REPRODUCED.`

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add \
  website/public/llms.txt \
  website/public/.well-known/agent-card.json \
  website/src/app/api-docs/page.tsx \
  drafts/corroboration-disclosure-staged.md \
  operations/decision-log.md \
  operations/handoffs/founder/2026-07-26-corroboration-disclosure-correction-NEXT-SESSION-PROMPT.md \
  operations/handoffs/founder/2026-07-26-corroboration-disclosure-correction-CLOSE.md
git commit -F - <<'MSG'
Disclose the input-length limit and widen the corroboration blind-spot claim

Step 1 of the input-cap-vs-corroboration scope doc, and only step 1. The live
corroboration copy said self-report claims are cross-referenced "against your
text" and named its blind spot as harm "omitted from the text entirely" -- true
but incomplete, since the product's own undocumented 5,000-character input cap
produces the identical blind spot for an honest agent submitting a longer
document, silently, discoverable only by a 400.

Two changes to llms.txt, agent-card.json's corroboration-check/v1 extension,
and api-docs: publish the limit (input/context/domain_context on /api/reason,
action/context on /api/guardrail, each 5,000 chars, exact failure shape); and
amend the honest-scope sentence to name both routes into the blind spot --
deliberate omission and truncation to fit the published limit -- not just the
first. The headline's "against your text" is reworded to "what the request
actually sends," since an agent submitting a document reads "your text" as
its whole document.

Nothing about the cap value, the check's logic, or any code path changes.
Drafted to drafts/corroboration-disclosure-staged.md and signed off in chat
before any public surface was touched, per the R18 governance gate and the
house precedent at decision-log.md:13023, which chose an identical disclosure
posture for the same structural class on a sibling route.

agent-card.json extension count unchanged (18) -- an existing extension was
amended, not added. Build green, /api-docs registered. Corroboration suite
106/0. The fragment probe still reproduces, confirming the disclosed
behaviour is still true at the moment of disclosure.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
MSG
git status --porcelain
```
Expected: only `?? website/public/images/millstone.PNG` remains. Then push via GitHub Desktop.

## Cross-references

- `drafts/corroboration-disclosure-staged.md` (the staged, signed-off wording)
- `operations/benchmarks/sage-practice-v1/2026-07-26-input-cap-vs-corroboration-scope.md` §5, §7 (the design this executes)
- `operations/handoffs/founder/2026-07-26-corroboration-disclosure-correction-NEXT-SESSION-PROMPT.md` (this session's prompt)
- `D-CORROBORATION-DISCLOSURE-CORRECTION-APPLIED` · `D-REASON-INPUT-CAP-VS-CORROBORATION-SCOPED` · `decision-log.md:13023`

*End of session close. The honesty fix shipped without waiting on the expensive one.*
