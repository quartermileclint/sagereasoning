# Next-Session Prompt — Layer 1 Schema Additions (Four-Mode Carried-Context Fields)

**Stream:** founder.
**Tier:** `code-elevated`. Session-as-a-whole **Elevated** under 0d-ii — the change versions the open `Layer1Schema` contract. Additive and backward-compatible (all new fields optional), but a versioned change to an open contract. Lean + Elevated-additions template per the standing cache.
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol) + `/adopted/build-sessions-protocol-cache.md` (build-arc context). Deliverable-of-the-day: the eight optional carried-context fields added to the `Layer1Schema` type, with the validator accepting them and Layer 2 defensively tolerating them.
**Predecessor session close:** `/operations/handoffs/founder/2026-05-14-A6-rescope-four-mode-redesign-close.md` (the A6 four-mode re-scope scoping session).
**Predecessor decision-log entries:** `D-A6-RESCOPED-TO-FOUR-MODE-REDESIGN-2026-05-14` (proposed in the predecessor close — confirm it has been appended before this session, or append it at this session's open).
**Risk classification:** **Elevated** under 0d-ii. Critical Change Protocol NOT engaged. AC7 not engaged (no auth surface). PR6 not engaged (not safety-critical — these fields do not touch the distress classifier, Zone 2/3 logic, or R20a). AC5 perimeter unchanged. AC8 engaged (translation-sandwich substrate). PR1 applies (prove on `/api/reason` first).

---

## Why this session matters

The A6 re-scope (predecessor session) produced five draft design specs for the four substrate response modes — agent (the Agent Trust Layer Wrapper), philosophical, standard, private. Two of the four modes need new Layer 1 input fields to carry the context they consume: **private mode** needs four (it surfaces the practitioner's developmental profile), and the **ATL Wrapper** needs four (it carries the agent's profile and peer-agent assessments). Philosophical and standard modes need none — they are per-response on the standard Layer 1 input.

This session lands those eight fields as **optional scaffolding** on the `Layer1Schema` open contract — so the downstream mode-build sessions have the fields to populate, and so the open Layer 1 contract is versioned cleanly in one place rather than piecemeal across four build sessions. It does **not** implement the mode renderings, the wrapper, or any Layer 2 logic that uses the fields. It is purely the schema scaffolding.

This is the natural next session because it is bounded, low-risk (optional/additive), unblocks all four mode builds, and keeps the open-contract versioning a single deliberate act.

## Pre-conditions

1. **The predecessor close is committed.** Founder confirms `git log --oneline -3 origin/main` shows the A6 re-scope commit.
2. **`D-A6-RESCOPED-TO-FOUR-MODE-REDESIGN-2026-05-14` is in the decision log** — or is appended at this session's open (the proposed text is in the predecessor close).
3. **Founder has decided the placeholder-vs-adoption question** (see Part B Step 0). The five mode specs are Draft/Designed — the field names below are placeholders until the specs are Adopted. This session can either (a) land the fields as clearly-marked placeholder scaffolding ahead of spec adoption, or (b) wait for spec adoption. The founder elects at session-open. Recommendation: (a) — the fields are optional, nothing depends on them yet, and landing them unblocks the mode builds; rename is cheap while nothing consumes them.
4. **Production state unchanged** — substrate at A7 Verified; all substrate env flags UNSET; `/api/reason` byte-identical; `/api/substrate/layer3` returns 503.
5. **Founder commits to a ~90-150 min bounded session.**

---

## The consolidated Layer 1 field spec (the deliverable this session implements)

Eight new **optional** fields on `Layer1Schema`. All optional — a `Layer1Schema` input with none of them is still valid (the per-response, un-wrapped, public case — which is every call today). Additive, backward-compatible.

### From private mode (4 fields) — see `/drafts/private-mode-response-spec.md` §"Layer 1 input placeholder fields"

| Field | Type (placeholder) | Purpose |
|---|---|---|
| `subject_identity_binding` | identity reference | The authenticated subject's identity. **The R17e gate** — private mode cannot be called about anyone else. Triggers the server-side load of the subject's encrypted profile (the human equivalent of the agent's `carried_profile`). |
| `reflective_self_report` | string \| null | The practitioner's own account of what was operative for them. **Closes the reflection-component loop** — when provided, the motivation and eupatheia classifications are not withheld. |
| `history_window` | object \| null | How far back to draw trajectory + cross-submission data. Mirrors the existing `mentor-interactions-loader.ts` `windowDays` / `limit` (default 90 days / 100 rows). |
| `topic_signal` | string \| null | The current entry's topic, for the topic-projection logic `practitioner-context.ts` already implements (`detectTopicSignal` / `projectProfile`). |

### From the ATL Wrapper (4 fields) — see `/drafts/agent-trust-layer-wrapper-spec.md` §"Layer 1 implications"

| Field | Type (placeholder) | Purpose |
|---|---|---|
| `carried_profile` | object \| null | The agent's accumulated trajectory — the `WindowSnapshot` (from `/trust-layer/types/evaluation.ts`), or the raw `EvaluatedAction[]`. Lets Layer 2 do trajectory-aware assessment for agents. |
| `profile_provenance` | object \| null | Gaming defence — attests the `carried_profile` came from the agent's own prior substrate assessments, not injected third-party content. |
| `peer_agent_assessments` | array \| null | For multi-agent orchestration — the `AccreditationPayload`s and/or agent-mode renderings of the peer agents an orchestrator agent is deciding based on. |
| `objective_function_declaration` | string \| null | Gaming defence (Form 2) — the agent's declared optimisation target, checked against the candidate action for `STATED_OPERATIVE_CONFLICT`. |

**Parallel structure to note in the code comments:** `subject_identity_binding` (private, human) and `carried_profile` (agent) are the parallel identity/profile-bearing fields — server-side encrypted load for humans, wrapper-carried for agents. The Layer 2 JSON is the universal profile-update unit for both.

### What this session does NOT do

- Does NOT implement any mode rendering (those are the four mode-build sessions)
- Does NOT implement the ATL Wrapper (that is a multi-session build)
- Does NOT wire the fields into Layer 2's reasoning logic — Layer 2 only needs to **defensively tolerate** the fields (not break when they are present), not act on them
- Does NOT change Layer 1's extraction job — Layer 1 still does "text → structured features"; the new fields are carried context that flow through untouched

---

## Part A — Open under the protocol

Read in order:

1. **`/adopted/standing-protocol-cache.md`** (~3 min) — tier, model selection (N/A — no LLM model decision; Layer 1's existing Sonnet extraction is unchanged), status vocabulary, signals, risk classification, lean + Elevated template.
2. **`/adopted/build-sessions-protocol-cache.md`** (~3 min) — build-arc context.
3. **`/operations/handoffs/founder/2026-05-14-A6-rescope-four-mode-redesign-close.md`** (~5 min) — the predecessor close; the four-mode re-scope and the eight-field provenance.
4. **The five mode specs — Layer 1 sections in full** (~10 min): `/drafts/private-mode-response-spec.md` §"Layer 1 input placeholder fields"; `/drafts/agent-trust-layer-wrapper-spec.md` §"Layer 1 implications"; the §"Layer 1 input fields" sections of `/drafts/philosophical-mode-response-spec.md` and `/drafts/standard-mode-response-spec.md` (both confirm "no new fields").
5. **The Layer 1 implementation** (~10 min): `/website/src/lib/translation-sandwich/layer1-extractor.ts` (the `Layer1Schema` type definition, the extractor, the validator); `/adopted/ADR-RAG-MENTOR-ALT3-01-translation-sandwich-deterministic-engine.md` and the ADR-005 Layer 1 schema specification referenced in `layer3-prose.ts`'s header. Locate: the `Layer1Schema` type, its validator, and every call site that constructs a `Layer1Schema`.
6. **`/website/src/lib/translation-sandwich/layer2-mechanisms.ts`** (~5 min, targeted) — confirm how Layer 2 receives the `Layer1Schema` and where it would need to defensively tolerate the new optional fields. Note the existing defensive-read pattern A5 uses for AC9/AC10/AC11 in `layer3-service.ts` — the same pattern applies here.
7. **`/manifest.md`** §R4 (IP boundary) + §R17 (the private-mode fields serve R17e) + §R18 (the ATL fields serve R18) + §AC8 (translation-sandwich) (~5 min, targeted).
8. **`/operations/decision-log.md`** last 2 entries.

**Confirm at session open:** tier (`code-elevated`); hold-point status (P0 0h active); model selection (N/A — Layer 1's existing Sonnet extraction unchanged; no new model decision); status vocabulary; signals + risk classification (Elevated; Critical Change Protocol NOT engaged; PR6 not engaged; AC7 not engaged); the placeholder-vs-adoption election (pre-condition 3); PR1 single-endpoint proof on `/api/reason`; PR11 inbox scan.

---

## Part B — Procedure

### Step 0 — Confirm the placeholder election (founder gate; ~5 min)

Surface pre-condition 3: the five mode specs are Draft/Designed; the eight field names are placeholders. Confirm with the founder whether to (a) land the fields as clearly-marked placeholder scaffolding now, or (b) wait for spec adoption. If (b), the session stops here. If (a), proceed — and every new field carries a code comment marking it as a placeholder pending spec adoption, citing the source spec.

### Step 1 — Survey the `Layer1Schema` and its consumers (~15-20 min)

Read `layer1-extractor.ts` in full. Identify: the `Layer1Schema` type definition; its validator (the hand-rolled validator pattern, mirroring `layer3-prose.ts`'s `validateLayer3Prose`); every call site that constructs or validates a `Layer1Schema`. Grep for `Layer1Schema` across `/website/src` to find all consumers. Confirm Layer 2's ingress point. Output (in-chat, ~10 lines): what's there, what needs to change, every file that touches `Layer1Schema`.

### Step 2 — Design the schema additions (Design + founder approval gate; ~15-20 min)

Produce a short design spec (~20-30 lines, in-chat):

- The eight optional fields, their TypeScript types (refine the placeholder types above against the actual `Layer1Schema` conventions and against `/trust-layer/types/evaluation.ts` for `WindowSnapshot` / `EvaluatedAction` and `/trust-layer/types/accreditation.ts` for `AccreditationPayload`)
- The **flow-through decision**: confirm the recommendation — Layer 1 processes the text as today, and the new fields attach to the `Layer1Schema` it outputs (carried context flows through Layer 1 untouched to Layer 2). State explicitly whether the extractor sets them (passes them through from its input) or whether they attach post-extraction.
- The validator change — the validator accepts the new optional fields when present, and a `Layer1Schema` without them still validates (backward-compat).
- The Layer 2 defensive-tolerance change — Layer 2 must not break when the fields are present; it does not yet act on them.
- The open-contract versioning note — the `Layer1Schema` version string (if there is one) and whether this bumps it.

**Founder approval gate:** surface the design spec. Particular confirmations: the field types; the flow-through decision; that Layer 2 only defensively tolerates (does not act on) the fields this session.

### Step 3 — Implement (Build; ~30-45 min)

Apply the approved design. PR1 single-endpoint proof: `/api/reason` is the proof endpoint — the schema additions must not change `/api/reason` behaviour (the fields are optional and unset on every current call). PR2 build-to-wire-verification: the validator must actually accept the fields (not just the type declaring them) — verified in Step 4.

1. Add the eight optional fields to the `Layer1Schema` type, each with a placeholder code comment citing its source spec.
2. Update the `Layer1Schema` validator to accept the fields when present and to still pass a `Layer1Schema` without them.
3. Add Layer 2 defensive tolerance (the AC9/AC10/AC11-style defensive-read pattern — the fields are read defensively or simply ignored; Layer 2 does not break when they are present).
4. If `layer1-extractor.ts` constructs the `Layer1Schema`, confirm the new optional fields default to absent/null and the extractor does not need to populate them (it does not — the wrapper / private-mode service populates them in their build sessions).

### Step 4 — Verify

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"

# 1. TypeScript compile — clean (new optional fields + validator change)
npx tsc --noEmit -p tsconfig.json
# Expected: clean compile (EXITCODE=0)

# 2. Layer 1 test suite — existing tests still pass (backward-compat:
#    a Layer1Schema without the new fields still validates)
npx tsx src/lib/translation-sandwich/__tests__/layer1-extractor.test.ts
# (confirm the test file path in Step 1; adjust if different)
# Expected: all existing tests pass / 0 fail

# 3. NEW behavioural test — written this session: a Layer1Schema WITH
#    each of the eight new fields validates; a Layer1Schema WITHOUT them
#    validates; Layer 2 ingress tolerates a Layer1Schema carrying the
#    new fields without throwing.
npx tsx src/lib/translation-sandwich/__tests__/layer1-schema-additions.test.ts
# Expected: all pass

# 4. A5 regression — Layer 3 service unaffected
npx tsx src/lib/substrate/__tests__/layer3-service.test.ts
# Expected: 28 pass / 0 fail

# 5. A7 regression — R20a gate unaffected (defensive; this session
#    does not touch R20a)
npx tsx src/lib/substrate/__tests__/r20a-gate.test.ts
# Expected: 33/33 pass

# 6. Substrate steady state (production unchanged)
cd ..
curl -sS -o /dev/null -w "%{http_code}\n" -X POST https://www.sagereasoning.com/api/substrate/layer3
# Expected: 503
curl -sS https://www.sagereasoning.com/api/public-key | python3 -c "
import json, sys
d = json.load(sys.stdin)
print('PASS' if d.get('previous') is None and d.get('algorithm') == 'Ed25519' else 'FAIL')
"
# Expected: PASS
```

If any of checks 1-5 fails, do NOT push. Engage rollback (revert the additions; re-run 1-2). The fields are optional — reverting removes them and nothing depended on them.

### Step 5 — Append decision-log entry (lean form)

`D-LAYER1-SCHEMA-ADDITIONS-WIRED-VERIFIED-YYYY-MM-DD` per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". Capture: the eight optional fields added; the flow-through decision; the open-contract version note; that Layer 2 defensively tolerates but does not yet act on the fields; placeholder status pending spec adoption; risk Elevated; rollback path; the Step 4 verification commands; rules served (0a, 0d-ii, 0f, R4, R17, R18, AC8, PR1, PR2, PR10).

### Step 6 — Session close (lean + Elevated form)

`/operations/handoffs/founder/YYYY-MM-DD-layer1-schema-additions-close.md` per the lean session-close template, with the Elevated additions (what could break + rollback path + verification step provided). "Next Session Should" names the four mode builds — and notes the spec-adoption step (Draft → Adopted) and the governing-document updates (staging plan / caches still carry the old A6 framing) as governance items the founder elects.

---

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + spec Layer 1 sections + layer1-extractor.ts read (Part A) | 25-30 min |
| Step 0 — placeholder election gate | 5 min |
| Step 1 — survey `Layer1Schema` + consumers | 15-20 min |
| Step 2 — design spec + founder approval gate | 15-20 min |
| Step 3 — implement | 30-45 min |
| Step 4 — verify (6 checks) | 15 min |
| Step 5 — decision-log entry | 10 min |
| Step 6 — session close | 10-15 min |
| **Total** | **~2-2.5 hr** |

---

## Rollback path

`git revert <commit>` and push via GitHub Desktop. The eight fields are optional and additive — reverting removes them; nothing constructs or consumes them yet (the mode builds that populate them are downstream). No production behaviour change either way: `/api/reason` is byte-identical with or without the fields (they are unset on every current call). No data loss; no user impact.

## Forecast

A successful session produces: the `Layer1Schema` type carrying eight optional carried-context fields (clearly marked placeholders pending spec adoption); the validator accepting them; Layer 2 defensively tolerating them; a new behavioural test; one decision-log entry; a lean+Elevated session close. The open Layer 1 contract is versioned in one deliberate act. All four mode builds (philosophical, standard, private — Critical-tier — and the ATL Wrapper multi-session build) are unblocked at the Layer 1 layer. Next after this: spec adoption (Draft → Adopted) and the founder's election of the first mode build, OR the governing-document updates (staging plan / caches) to retire the old A6 framing.

End of prompt.
