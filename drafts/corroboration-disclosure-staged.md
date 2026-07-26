# Staged: Corroboration Disclosure Correction — Step 1 of the input-cap-vs-corroboration scope

**Status:** STAGED — awaiting founder sign-off before any public surface is edited (R18 governance gate).
**Source:** `operations/benchmarks/sage-practice-v1/2026-07-26-input-cap-vs-corroboration-scope.md` §5, §7 Step 1.
**Scope:** documents-only. No code, flag, schema, or perimeter change. Applies to three live surfaces: `website/public/llms.txt`, `website/public/.well-known/agent-card.json`, `website/src/app/api-docs/page.tsx`.

## What this corrects

Today's live `llms.txt:150` says the corroboration check cross-references claims "against your text" and names its residual as harm "omitted from the text entirely" — which reads as an agent deliberately scrubbing its own document. That is true but incomplete: the product's own undocumented 5,000-character `input` cap (`TEXT_LIMITS.medium`, `website/src/lib/security.ts:212`) produces the identical blind spot for an **honest** agent that submits a longer artifact — silently, since the limit is published nowhere and is discoverable only by receiving a 400.

Two changes, both applied together (they are one disclosure, split for placement):

**(a) Publish the limit.** `input`, `context`, and `domain_context` on `/api/reason` are each capped at 5,000 characters; `action` and `context` on `/api/guardrail` share the same cap. State the number, the fields, and the failure shape (HTTP 400, `isBillable:false`, no engine cost) — this was published nowhere before (only `clarification_response` ≤5000, a different field, was documented).

**(b) Amend the corroboration honest-scope sentence** so the disclosed residual names *both* routes into it: deliberate omission by the agent, and truncation the product itself performs to enforce (a) — not just the first.

## Exact wording

### 1. `llms.txt` — new "Field limits" note + amended corroboration paragraph

Insert immediately before the existing `**Corroboration check…**` paragraph (after the Deferred-prose / narrative paragraphs, same section):

> **Field limits.** `input`, `context`, and `domain_context` on `/api/reason` — and `action`/`context` on `/api/guardrail` — are each capped at 5,000 characters (`TEXT_LIMITS.medium`). An oversized field returns HTTP 400 (`"<field> exceeds maximum length of 5,000 characters (received N)"`) before any engine call, at no cost. If your document is longer than this, see **Corroboration check** below — truncating or chunking it to fit changes what the check can see.

Replace the existing corroboration paragraph's headline and honest-scope sentence (body between them — the record-and-floor mechanics — is unchanged):

> **Corroboration check (extraction-trust — self-report claims cross-referenced against what the request actually sends).** Every assessment carries a deterministic `corroboration` report inside the signed `assessment.assessment`: the extraction's self-report claims (a circle's `obligation_assessment` of `met`/`indeterminate`; an `examined_before_acting` claim on a grave act) are cross-referenced against the verbatim text carried in `input` when the request reaches the endpoint. Per-claim findings use the vocabulary `corroborated | uncorroborated | contradicted`, and every finding carries the verbatim text spans (`markers[].quote`) that grounded it. The check is **record-and-floor**: claimed statuses stay verbatim in the assessment (never rewritten), and on a grounded contradiction the affected virtue-domain reading is **floored** (`dikaiosyne_override: "floor_reflexive"`; `andreia_override: "treat_unexamined"`) — monotone, floor-only: the check can only make a verdict more conservative, never less. When a corroboration floor drove the final proximity, `proximity_floors.basis` names it. **Honest scope:** the check sees only the text that reaches it in `input`, capped at 5,000 characters (see **Field limits** above). It does NOT verify facts about the world, and its blind spot has two distinct routes, not one: a harm your self-report omits from the text entirely, and a harm your text does state but that never arrived, because a longer document was truncated or chunked to fit the limit before this endpoint saw it. Both leave an unwarranted `met`/`indeterminate` claim unchallenged; only the first requires deception on your part.

### 2. `agent-card.json` — amend the existing `corroboration-check/v1` extension (no new extension; count stays 18)

Replace the extension's top-level `"description"`:

> "Substrate extraction-trust corroboration check (Trust Layer S0a, Live 2026-07-08). Every /api/reason assessment and /api/guardrail verdict carries a deterministic 'corroboration' report inside the signed assessment.assessment: the extraction's self-report claims (a circle's obligation_assessment of met/indeterminate; an examined_before_acting claim on a grave act) are cross-referenced against the verbatim text carried in `input` when the request reaches the endpoint — capped at 5,000 characters (TEXT_LIMITS.medium; the same cap applies to `context` and `domain_context` on /api/reason and to `action`/`context` on /api/guardrail); an oversized field returns HTTP 400 before any engine cost. Per-claim findings use the vocabulary corroborated|uncorroborated|contradicted; every finding carries the verbatim grounding spans (markers[].quote). Record-and-floor: claimed statuses stay verbatim, and a grounded contradiction floors the affected virtue domain (dikaiosyne_override: floor_reflexive; andreia_override: treat_unexamined) — monotone (floor-only), so a verdict can only become MORE conservative, never less; proximity_floors.basis names corroboration when it drove the floor. SCOPE: the check sees only the text that reaches it in `input`. It does NOT verify facts about the world, and its blind spot has two distinct routes, not one — a harm the self-report omits from the text entirely, and a harm the text does state but that never arrived because a longer document was truncated or chunked to fit the 5,000-character limit before this endpoint saw it. Both produce the identical unchallenged claim; only the first requires deception."

Add a new `field_limits` key to `"params"` (sibling to `report`/`findings_vocabulary`/`semantics`/`scope`), and amend `"scope"`:

```json
"field_limits": {
  "reason_endpoint": "input, context, domain_context: 5000 chars each (TEXT_LIMITS.medium)",
  "guardrail_endpoint": "action, context: 5000 chars each (same TEXT_LIMITS.medium)",
  "on_exceed": "HTTP 400, isBillable:false, no engine call incurred"
},
"scope": "cross-references self-report claims against the text that reaches this endpoint in `input`/`action` (capped at 5000 chars — see field_limits); not a fact-checker; the blind spot has two routes — a harm the self-report omits from the text, and a harm present in the sender's document but truncated/chunked away before this endpoint saw it (disclosed structural residual, either way; only the first requires deception)"
```

### 3. `api-docs/page.tsx` — new "Field limits" bullet + amended "Corroboration check" bullet

New bullet, inserted immediately before the existing "Corroboration check" `<li>`:

```jsx
<li>
  <strong>Field limits</strong> &mdash; <code>input</code>, <code>context</code>, and
  <code> domain_context</code> are each capped at 5,000 characters
  (<code>TEXT_LIMITS.medium</code>); <code>/api/guardrail</code>&apos;s <code>action</code>
  and <code>context</code> share the same cap. An oversized field returns HTTP 400 before
  any engine call, at no cost. If your document is longer, see
  <strong> Corroboration check</strong> below &mdash; truncating or chunking it to fit
  changes what the check can see.
</li>
```

Replace the existing "Corroboration check" bullet's final two sentences (the "Scope:" sentence) with:

```jsx
Scope: it sees only the text that reaches it in <code>input</code> (capped at 5,000
characters &mdash; see <strong>Field limits</strong> above). It is not a fact-checker, and
its blind spot has two routes, not one: a harm your self-report omits from the text
entirely, and a harm your text does state but that never arrived, because a longer
document was truncated or chunked to fit the limit before this endpoint saw it &mdash;
both leave an unwarranted <code>met</code>/<code>indeterminate</code> claim unchallenged,
and only the first requires deception. The <code>/api/guardrail</code> gate runs the same
check over its <code>action</code> text, under the same limit.
```

## What this does NOT do

- Does not change the cap (still 5,000; Step 2 of the scope doc, unelected, would raise it).
- Does not change the corroboration check's logic, the engine, or any flag.
- Does not claim the blind spot is closed — it discloses that it is wider than previously stated, in both directions (agent-caused and product-caused).

## Verification after apply

```bash
cd website
node -e "const c=require('./public/.well-known/agent-card.json');console.log('extensions:',c.capabilities?.extensions?.length ?? c.extensions?.length)"
npm run build; echo "build exit: $?"
npx tsx src/lib/translation-sandwich/__tests__/corroboration-check.test.ts | tail -2
npx tsx scripts/input-cap-fragment-probe.ts | tail -3
```
Expected: extension count unchanged (18); `build exit: 0` with `/api-docs` registered; corroboration suite `106 passed, 0 failed`; probe still prints `REPRODUCED.`
