# Session Close — 2026-05-14 — Layer 1 Schema Additions (Four-Mode Carried-Context Fields)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol) + `/adopted/build-sessions-protocol-cache.md` (build-arc context).
**Tier:** `code-elevated` — **Elevated** risk under 0d-ii. Lean + Elevated-additions template.
**Date:** 2026-05-14.
**Operative session prompt:** `/operations/handoffs/founder/2026-05-14-layer1-schema-additions-NEXT-SESSION-PROMPT.md`.

---

## What this session did

Added eight optional carried-context fields to the open `Layer1Schema` contract as clearly-marked placeholder scaffolding — four for private mode, four for the Agent Trust Layer Wrapper. The validator accepts them when present (shape-checked) and still validates a schema without them; Layer 2 defensively tolerates them (passes through untouched, does not yet act on them). No mode renderings, no wrapper, no Layer 2 reasoning logic — purely the schema scaffolding that unblocks all four mode builds at the Layer 1 layer.

Two session-open founder gates were resolved: (1) land the fields now as placeholders rather than wait for spec adoption — **landed**; (2) append the never-recorded `D-A6-RESCOPED-TO-FOUR-MODE-REDESIGN-2026-05-14` decision-log entry — **appended** verbatim from the predecessor close.

---

## Decisions Made

- **`D-A6-RESCOPED-TO-FOUR-MODE-REDESIGN-2026-05-14`** appended at session open (+47 lines). The A6 four-mode re-scope decision, drafted in the predecessor close but never recorded — appended verbatim with founder approval.
- **`D-LAYER1-SCHEMA-ADDITIONS-WIRED-VERIFIED-2026-05-14`** appended (lean + Elevated form). Eight optional carried-context fields on `Layer1Schema`; validator accepts-when-present; Layer 2 tolerates; `version` stays `'layer1-schema-v1'`; placeholder types are local (no `/trust-layer/` imports).

## Status Changes

| Item | Old | New |
|---|---|---|
| `Layer1Schema` open contract | 15 required feature fields | 15 required + 8 optional carried-context fields (placeholder scaffolding) |
| Layer 1 schema additions (this work item) | Scoped | **Verified** (Scoped → Designed → Scaffolded → Wired → Verified in one session) |
| `layer1-schema-additions.test.ts` | — | Created — first Layer 1 test file; 33 assertions, 33 pass / 0 fail |
| Production state | A7 Verified; flags UNSET; steady-state | **Unchanged** — `/api/reason` byte-identical; no env-var, schema, auth, or R20a-perimeter change |

## What could break (Elevated)

The change is additive + optional, so the realistic failure surface is small:

- **If the validator change were wrong**, a plugin-authenticated caller submitting carried-context fields could be rejected (400) or — worse — a malformed field could pass through unchecked. *Mitigated:* the 33-assertion test proves accept-valid + reject-malformed + backward-compat, and a required-field negative-control confirms the existing validator was not weakened. No current caller submits these fields, so the live blast radius today is zero.
- **If Layer 2 did not tolerate the fields**, `applyMechanisms` could throw on a wrapped schema. *Mitigated:* Step 1 confirmed Layer 2 reads only named feature fields (never iterates / spreads / stringifies the schema); test L2-1…L2-4 prove `applyMechanisms` + `detectTier1Trigger` accept a fully-wrapped schema and produce byte-identical output with vs without the fields.
- **`/api/reason` server-side path:** untouched — `extractFeatures`, `ExtractInput`, and the Layer 1 LLM system prompt were not modified; the fields default to absent on every current call.

**Rollback path:** `git revert <commit>` and push via GitHub Desktop. The eight fields are optional and additive — reverting removes them; nothing constructs or consumes them yet. No production behaviour change either way; no data loss; no user impact.

## Blocked On

**Files remaining uncommitted (to be committed by the founder):**

```
 M operations/decision-log.md
 M website/src/lib/translation-sandwich/layer1-extractor.ts
 M website/src/lib/translation-sandwich/layer2-mechanisms.ts
 M website/tsconfig.tsbuildinfo
?? website/src/lib/translation-sandwich/__tests__/layer1-schema-additions.test.ts
?? operations/handoffs/founder/2026-05-14-layer1-schema-additions-close.md
```

`website/tsconfig.tsbuildinfo` is a TypeScript incremental-build cache — it is tracked in the repo and routinely changes whenever `tsc` runs (prior sessions, e.g. A9+J6, committed it the same way). Include it in the commit as normal.

**Production state at session close:** unchanged from session start. Substrate at A7 Verified. `SUBSTRATE_LAYER3_ENABLED` UNSET. `SUBSTRATE_R20A_GATE_ENABLED` UNSET. `/api/reason` byte-identical. `/api/substrate/layer3` returns 503. `/api/public-key` serves Ed25519 steady-state. No env-var changes, no schema migrations, no auth-surface changes, no R20a perimeter changes.

## Open Questions

- **Stale `.git/index.lock` — clear before committing.** A `git status` run inside the build sandbox created `.git/index.lock`; the sandbox mount blocked `unlink` on it ("Operation not permitted"), so it could not be cleared from the sandbox. It is a 0-byte stale lock with no live git process. **It must be removed from your machine before `git add` / `git commit`** — see the Founder Verification block (step 0). I caused this by running `git status` in the sandbox; it is a one-time cleanup, safe to delete.
- **Spec adoption (Draft → Adopted).** The eight field names are placeholders pending adoption of the five mode specs (`/drafts/{philosophical-mode,standard-mode,private-mode}-response-spec.md`, `/drafts/agent-trust-layer-wrapper-spec.md`, and the superseded `/drafts/agent-mode-response-spec.md`). Renaming on adoption is cheap — nothing consumes the fields yet. Governance step; founder elects.
- **Governing-document drift.** The staging plan, standing cache, and build-sessions cache still carry the old A6 framing (`clinical / terse / standard / educational`; "Standard; 1 session"). Updating them is a governance step pending the founder's adoption of the four-mode re-scope.
- **No pre-existing Layer 1 test suite.** `layer1-schema-additions.test.ts` is the first Layer 1 test file; the prompt's Step 4 referenced a non-existent `layer1-extractor.test.ts`. A broader Layer 1 extractor/validator test suite is not in scope here.

## Next Session Should

The four-mode build arc is now unblocked at the Layer 1 layer. The founder elects sequencing. Candidates:

- **philosophical-mode build** — Standard tier; deterministic field rendering + source-material retrieval; needs no new Layer 1 fields.
- **standard-mode build** — Standard tier; field rendering + the Summary Response rephraser-with-grounding-validator; needs no new Layer 1 fields.
- **private-mode build** — **Critical tier** (R17f — access control + intimate data); the substrate-based private-mentor replacement; consumes the four private-mode carried-context fields; intersects the K-category migration.
- **ATL Wrapper build** — multi-session; consumes the four ATL carried-context fields; intersects the existing `/trust-layer/` codebase, the substrate build arc, and Priority 3.

Two governance items the founder may elect before or alongside the builds: **spec adoption** (move the five mode specs Draft → Adopted, which finalises the eight placeholder field names) and the **governing-document updates** (staging plan / standing cache / build-sessions cache still carry the old A6 framing). Each mode build should read its spec at session-open; the private-mode and ATL Wrapper builds confirm the final field names against the adopted specs and may rename the placeholders.

## Founder Verification (between sessions)

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"

# 0. Clear the stale sandbox-created .git/index.lock FIRST (a no-op if already gone).
#    Without this, git add / git commit / GitHub Desktop will report the index is locked.
rm -f .git/index.lock

# 1. TypeScript compile — clean (EXITCODE=0)
cd website && npx tsc --noEmit -p tsconfig.json && cd ..

# 2. New behavioural test — 33 pass / 0 fail
cd website && npx tsx src/lib/translation-sandwich/__tests__/layer1-schema-additions.test.ts && cd ..

# 3. A5 regression — 28 pass / 0 fail
cd website && npx tsx src/lib/substrate/__tests__/layer3-service.test.ts && cd ..

# 4. A7 regression — 33/33 pass
cd website && npx tsx src/lib/substrate/__tests__/r20a-gate.test.ts && cd ..

# 5. Substrate steady state (production unchanged)
curl -sS -o /dev/null -w "%{http_code}\n" -X POST https://www.sagereasoning.com/api/substrate/layer3
# Expected: 503
curl -sS https://www.sagereasoning.com/api/public-key | python3 -c "import json,sys; d=json.load(sys.stdin); print('PASS' if d.get('previous') is None and d.get('algorithm')=='Ed25519' else 'FAIL')"
# Expected: PASS

# 6. Commit
git add operations/decision-log.md \
        website/src/lib/translation-sandwich/layer1-extractor.ts \
        website/src/lib/translation-sandwich/layer2-mechanisms.ts \
        website/src/lib/translation-sandwich/__tests__/layer1-schema-additions.test.ts \
        website/tsconfig.tsbuildinfo \
        operations/handoffs/founder/2026-05-14-layer1-schema-additions-close.md
git commit -m "Layer 1 schema additions: eight optional carried-context fields

Adds eight optional carried-context fields to the open Layer1Schema
contract as placeholder scaffolding pending mode-spec adoption — four
for private mode (subject_identity_binding, reflective_self_report,
history_window, topic_signal), four for the Agent Trust Layer Wrapper
(carried_profile, profile_provenance, peer_agent_assessments,
objective_function_declaration). All optional + additive: validator
accepts-when-present (shape-checked), still validates a schema without
them; Layer 2 defensively tolerates them. version stays
'layer1-schema-v1'. extractFeatures / ExtractInput / Layer 1 LLM prompt
untouched — /api/reason byte-identical. Placeholder types are local
(no /trust-layer/ imports). First Layer 1 test file added (33 pass).

Decision log: D-A6-RESCOPED-TO-FOUR-MODE-REDESIGN-2026-05-14 (appended
at session open, founder-approved) + D-LAYER1-SCHEMA-ADDITIONS-WIRED-
VERIFIED-2026-05-14. Tier code-elevated, Elevated risk; Critical Change
Protocol / AC7 / PR6 not engaged.

Files:
- website/src/lib/translation-sandwich/layer1-extractor.ts (8 optional
  fields + 5 placeholder types + assertNumber + validator block)
- website/src/lib/translation-sandwich/layer2-mechanisms.ts (tolerance
  JSDoc note; no logic change)
- website/src/lib/translation-sandwich/__tests__/layer1-schema-additions.test.ts (NEW)
- operations/decision-log.md (two entries appended)
- operations/handoffs/founder/2026-05-14-layer1-schema-additions-close.md (NEW)
- website/tsconfig.tsbuildinfo (tsc incremental-build cache)"
```

Then push via GitHub Desktop. **No Vercel behaviour change** — `/api/reason` is byte-identical with or without the new fields (they are optional and unset on every current call); `tsconfig.tsbuildinfo` and the test file are not part of the deployed bundle's behaviour.

## Cross-references

- Operative session prompt: `/operations/handoffs/founder/2026-05-14-layer1-schema-additions-NEXT-SESSION-PROMPT.md`
- Predecessor close: `/operations/handoffs/founder/2026-05-14-A6-rescope-four-mode-redesign-close.md`
- Decision-log entries: `D-A6-RESCOPED-TO-FOUR-MODE-REDESIGN-2026-05-14`, `D-LAYER1-SCHEMA-ADDITIONS-WIRED-VERIFIED-2026-05-14`
- Specs: `/drafts/private-mode-response-spec.md` §"Layer 1 input placeholder fields"; `/drafts/agent-trust-layer-wrapper-spec.md` §"Layer 1 implications"
- Modified: `/website/src/lib/translation-sandwich/layer1-extractor.ts`, `/website/src/lib/translation-sandwich/layer2-mechanisms.ts`
- New: `/website/src/lib/translation-sandwich/__tests__/layer1-schema-additions.test.ts`

*End of session close. The open Layer 1 contract is versioned in one deliberate act: eight optional carried-context placeholder fields, validator accepting them, Layer 2 tolerating them, all four mode builds unblocked at the Layer 1 layer. Production state unchanged; `/api/reason` byte-identical. One stale `.git/index.lock` must be cleared from the founder's machine before committing.*
