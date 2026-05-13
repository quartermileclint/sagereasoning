# Next-Session Prompt — agent-card.json A2A v1 Reshape

**Stream:** founder.
**Tier:** `code-elevated` (changes user-facing JSON file served at `sagereasoning.com/.well-known/agent-card.json`; agent-developer-consumer visible; Vercel redeploys on push). Lean + Elevated additions per cache.
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache). Deliverable-of-the-day: a reshape of `/website/public/.well-known/agent-card.json` from its current mixed shape to A2A v1 canonical shape, with the substance preserved and the structure aligned to the spec.
**Predecessor session close:** `/operations/handoffs/founder/2026-05-14-anthropic-native-posture-close.md` (Anthropic-native posture session; deferred this reshape with precise gap documentation).
**Predecessor decision-log entries:** `D-AGENT-CARD-CURRENCY-CHECK-2026-05-14` (this session's parent; A2A v1 alignment gaps documented); `D-ANTHROPIC-NATIVE-POSTURE-2026-05-14` (umbrella under which the gap was identified); `D-A9-J6-COST-MONITORING-WIRED-2026-05-14`.
**Risk classification:** **Elevated** under 0d-ii (user-facing JSON file change served at a well-known path). **Critical Change Protocol NOT engaged** (no auth/encryption/perimeter/deployment-config change; AC7 not engaged; PR6 not engaged; AC5 perimeter unchanged). PR1 single-endpoint proof applies — this IS the single endpoint.

## Why this session matters

The agent-card.json was published live at `sagereasoning.com/.well-known/agent-card.json` on 28 March 2026 (per README line 411). The 2026-05-14 Anthropic-native posture session reviewed it against the A2A v1 canonical schema and found load-bearing shape misalignments: the `capabilities` field, `skills` field, and `authentication.schemes` field are all structurally wrong despite carrying semantically-correct content. An A2A v1 consumer would fail to parse the card as-is.

The substance is right; only the structure is wrong. This is a contained, well-scoped reshape. The session deliverable is a single JSON file reshape with corresponding minor adjustments to the surrounding descriptive surfaces (README, AGENTS.md if it references the shape, llms.txt if it references the shape).

This lands BEFORE A6 / A10 / A11a / A8 only if the founder elects it; the four substrate-build options remain available either way.

## Pre-conditions

1. **Anthropic-native posture session commit pushed and Vercel green.** Founder confirms `git log --oneline -3 origin/main` shows the Anthropic-native posture commit on top, preceded by 2026-05-14 A9+J6, preceded by 2026-05-13 A7.
2. **CLAUDE.md + `.claude/skills/anthropic/` + amended PR15 all live on `main`.** The amended PR15's OPERATIONAL DISCIPLINE will be honoured at session-open: consult `.claude/skills/anthropic/` for relevant SKILL.md patterns before any bespoke election.
3. **A1–A7 + A9 + J6 still Verified.** No regression since the predecessor session.
4. **Founder commits to a 60-90 min bounded session** — Elevated-tier focused work.
5. **Production state unchanged.** `SUBSTRATE_LAYER3_ENABLED` UNSET; `SUBSTRATE_R20A_GATE_ENABLED` UNSET; `/api/reason` byte-identical; `/api/substrate/layer3` returns 503; `/api/public-key` serves Ed25519 steady-state.
6. **Cowork project-instructions panel paste-synced** against `/adopted/project-instructions-snapshot.md` (amended PR15 with OPERATIONAL DISCIPLINE). Founder confirms.

## Part A — Open under the protocol

Read in order:

1. **`/adopted/standing-protocol-cache.md`** (~3 min) — confirms tier; model selection (N/A — no LLM calls); status vocabulary; signals; risk classification; lean+Elevated template additions; the 2026-05-14 amendments referencing CLAUDE.md + `.claude/skills/anthropic/`.
2. **`/operations/handoffs/founder/2026-05-14-anthropic-native-posture-close.md`** (~5 min) — predecessor close; confirms gap documentation and that the reshape was deferred to this session.
3. **`/operations/decision-log.md` entry `D-AGENT-CARD-CURRENCY-CHECK-2026-05-14`** (~3 min) — the four documented misalignments + the open questions this session resolves.
4. **`/adopted/project-instructions-snapshot.md` §PR15 (amended)** (~3 min) — confirms the OPERATIONAL DISCIPLINE that applies to this session's bespoke-vs-canonical evaluation.
5. **`/website/public/.well-known/agent-card.json`** (~3 min) — the file being reshaped. Read in full.
6. **`/adopted/anthropic-features-survey-2026-05-14.md` §14 (AAIF / A2A governance)** (~3 min) — the governance context for A2A.
7. **`/adopted/adr/2026-05-12-substrate-category-character-kernel.md` §"Agentic-commerce-stack adjacency"** (~3 min) — including the 2026-05-14 A2A foundational-coordination-protocol addendum. The Character Kernel positioning relative to A2A is set here.
8. **A2A v1 canonical spec** (~10 min) — fetch via WebFetch:
   - `https://agent2agent.info/docs/concepts/agentcard/` — the canonical AgentCard interface (TypeScript-style) with required + optional fields
   - `https://a2a-protocol.org/latest/specification/` — the full spec (large; read targeted sections)
   - `https://agent2agent.info/docs/topics/extensions` — the `extensions` field shape (where custom fields like accessTiers / rateLimits / quickStart move to)
9. **`/.claude/skills/anthropic/claude-api/SKILL.md`** (~2 min, PR15 consultation) — if any inline reference to `Anthropic-API` shapes is needed.

**Confirm at session open** (state explicitly, briefly):

- Tier: `code-elevated`; session-as-a-whole **Elevated**
- Hold-point status: P0 0h active
- Model selection: N/A — no new LLM calls; no model selection decisions this session
- Status vocabulary: implementation `Scoped → Designed → Scaffolded → Wired → Verified → Live`; decision `Adopted / Under review / Superseded`
- Signals + risk classification: Elevated; **Critical Change Protocol NOT engaged**; AC7 + PR6 not engaged; AC5 perimeter unchanged
- PR1 single-endpoint proof: applies; this IS the single endpoint
- PR10 PEV loop: applies in full (Elevated)
- PR11 authoritative-current-sources: re-scan `/inbox/` for any material since 2026-05-14
- PR12 negative-finding discipline: when comparing the reshape against the A2A v1 spec, run multiple queries before concluding any field "isn't required"
- PR15 (amended): no bespoke election needed — the A2A v1 spec IS the canonical primitive being conformed to
- PR16 (positioning + dogfood): A2A-v1-compliant card strengthens Character-Kernel-as-discoverable-agent positioning

## Part B — Procedure

### Step 1 — Map current shape to A2A v1 shape (Design; ~15-20 min)

Produce a side-by-side mapping table before writing any JSON. Inputs: current `agent-card.json` + A2A v1 canonical schema. Output: a mapping document drafted in-chat that names every field's source location and destination location.

Mapping expectations (per Step 6 of the predecessor session):

| Current field | Current shape | A2A v1 destination | Notes |
|---|---|---|---|
| `name` | string | `name` (string, required) | Aligned; unchanged |
| `description` | string | `description` (string, required) | Aligned; unchanged |
| `url` | string | `url` (string, required) | Aligned; unchanged |
| `provider` | `{organization, url}` | `provider` (object, optional) | Aligned; unchanged |
| `version` | "3.0.0" (SageReasoning API version) | `version` (string; provider-defined) | Aligned; keep |
| `documentationUrl` | string | `documentationUrl` (string, optional) | Aligned; unchanged |
| `capabilities` (9 endpoint-objects) | array of objects | **`skills` (array of skill-objects)** | RESHAPE — A2A v1 skills carry the endpoint-objects |
| `capabilities` (new) | (does not exist today) | **`capabilities` (object with streaming/pushNotifications/stateTransitionHistory booleans)** | ADD — A2A v1 capabilities are boolean flags |
| `skills` (10 strings) | array of strings | **Map to `tags` inside skill-objects, or top-level if not skill-specific** | RESHAPE — current top-level "skills" array is conceptually tags |
| `authentication.schemes` (array of `{type, description}`) | array of objects | `authentication.schemes` (array of strings) | RESHAPE — A2A v1 expects string array |
| (none today) | — | `defaultInputModes` (array of MIME-type strings) | ADD — required |
| (none today) | — | `defaultOutputModes` (array of MIME-type strings) | ADD — required |
| `accessTiers` | custom object | `extensions[]` (AgentExtension object) | RESHAPE — moves into A2A v1 extensions array |
| `rateLimits` | custom object | `extensions[]` (AgentExtension object) | RESHAPE — moves into A2A v1 extensions array |
| `tags` (top-level) | array of strings | **Deduplicate against new skill-level tags + retain top-level if A2A v1 supports it; otherwise into extensions** | DECIDE during mapping step |
| `quickStart` | custom object | `extensions[]` (AgentExtension object) | RESHAPE — moves into A2A v1 extensions array |

**Surface the completed mapping table to the founder before Step 2.** Explicit founder approval gate on the mapping decisions. Particular questions to surface:
- For `capabilities` (the new A2A v1 object): are streaming/pushNotifications/stateTransitionHistory all `false` today? Confirm against actual substrate behaviour.
- Each of the 9 current endpoint-objects becomes one A2A v1 skill-object. Confirm the mapping of `inputModes`/`outputModes` per skill.
- The 10 top-level "skills" strings: confirm whether they're meant as tags (likely) or as something else.
- `extensions[]` shape: confirm the AgentExtension object shape from A2A v1 spec before populating it.

### Step 2 — Reshape `agent-card.json` (Build; ~20-30 min)

Apply the reshape per the approved mapping. Single file change: `/website/public/.well-known/agent-card.json`. Validate JSON syntax after each edit (use bash `python3 -m json.tool` or equivalent).

Output structure (illustrative; the actual content carries the substance from the current card):

```json
{
  "name": "SageReasoning Stoic Brain",
  "description": "...",
  "url": "https://www.sagereasoning.com",
  "version": "3.0.0",
  "provider": {...},
  "documentationUrl": "...",
  "capabilities": {
    "streaming": false,
    "pushNotifications": false,
    "stateTransitionHistory": false
  },
  "authentication": {
    "schemes": ["bearer", "none"]
  },
  "defaultInputModes": ["application/json"],
  "defaultOutputModes": ["application/json"],
  "skills": [
    {
      "id": "universal-reasoning",
      "name": "Universal Stoic Reasoning (V3)",
      "description": "...",
      "tags": ["stoic-philosophy", "ethical-reasoning", "decision-support"],
      "inputModes": ["application/json"],
      "outputModes": ["application/json"]
    },
    ...
  ],
  "extensions": [
    {"uri": "https://sagereasoning.com/extensions/access-tiers", "params": {...}},
    {"uri": "https://sagereasoning.com/extensions/rate-limits", "params": {...}},
    {"uri": "https://sagereasoning.com/extensions/quick-start", "params": {...}}
  ]
}
```

PR1 single-endpoint proof applies: this IS the single endpoint. PR2 build-to-wire-verification immediate: validate JSON syntax + run the schema check in Step 4 before declaring the reshape done.

### Step 3 — Surrounding descriptive surface updates (~10 min)

The reshape may invalidate descriptive text in:

1. **`/README.md`** — line 114 (already says "9 capabilities" from the 2026-05-14 README drift fix; reshape may make this "9 skills" instead). Line 240 (descriptive sentence may need updating). Check + edit only if the actual file content drifts.
2. **`/AGENTS.md`** — if it references the agent-card shape, update to match. Check first.
3. **`/website/public/llms.txt`** — if it references the agent-card shape, update to match. Check first.
4. **`/website/src/app/api-docs/page.tsx`** (or similar) — if any UI describes the agent-card shape, update. Check first.

Standard-risk descriptive text updates. No founder approval gate needed if changes are confined to text drift.

### Step 4 — Verify

Verification expectations:

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"

# 1. JSON validity
python3 -m json.tool website/public/.well-known/agent-card.json > /dev/null && echo "JSON valid"
# Expected: "JSON valid"

# 2. A2A v1 required fields present
python3 -c "
import json
d = json.load(open('website/public/.well-known/agent-card.json'))
required = ['name', 'description', 'url', 'version', 'capabilities', 'authentication', 'defaultInputModes', 'defaultOutputModes', 'skills']
missing = [f for f in required if f not in d]
print('All required fields present' if not missing else f'MISSING: {missing}')
"
# Expected: "All required fields present"

# 3. capabilities is now an object (not array)
python3 -c "
import json
d = json.load(open('website/public/.well-known/agent-card.json'))
ok = isinstance(d['capabilities'], dict) and 'streaming' in d['capabilities']
print('capabilities object shape OK' if ok else 'FAIL: capabilities still wrong shape')
"
# Expected: "capabilities object shape OK"

# 4. skills is now array of objects (not array of strings)
python3 -c "
import json
d = json.load(open('website/public/.well-known/agent-card.json'))
ok = isinstance(d['skills'], list) and all(isinstance(s, dict) and 'id' in s for s in d['skills'])
print(f'skills shape OK ({len(d[\"skills\"])} skill-objects)' if ok else 'FAIL: skills still wrong shape')
"
# Expected: "skills shape OK (9 skill-objects)" or similar count

# 5. authentication.schemes is array of strings
python3 -c "
import json
d = json.load(open('website/public/.well-known/agent-card.json'))
ok = isinstance(d['authentication']['schemes'], list) and all(isinstance(s, str) for s in d['authentication']['schemes'])
print('authentication.schemes shape OK' if ok else 'FAIL: still array of objects')
"
# Expected: "authentication.schemes shape OK"

# 6. TypeScript compile (defensive — only the JSON file changed)
cd website && npx tsc --noEmit -p tsconfig.json && cd ..
# Expected: clean compile (no TypeScript should reference the JSON shape internally)

# 7. A5 + A7 regressions (defensive)
cd website && npx tsx src/lib/substrate/__tests__/layer3-service.test.ts && cd ..
cd website && npx tsx src/lib/substrate/__tests__/r20a-gate.test.ts && cd ..
# Expected: A5 28/28; A7 33/33

# 8. Substrate steady state (production unchanged from this session start)
curl -sS https://www.sagereasoning.com/api/public-key | python3 -c "
import json, sys
d = json.load(sys.stdin)
ok = d.get('previous') is None and d.get('rotation_overlap_until') is None and d.get('algorithm') == 'Ed25519'
print('PASS' if ok else 'FAIL')
"
# Expected: PASS

# 9. POST-DEPLOY: after Vercel redeploys, fetch the live card
curl -sS https://www.sagereasoning.com/.well-known/agent-card.json | python3 -m json.tool > /dev/null && echo "Live card valid"
# Expected: "Live card valid"

# 10. POST-DEPLOY: live card matches local file
diff <(curl -sS https://www.sagereasoning.com/.well-known/agent-card.json | python3 -m json.tool) \
     <(python3 -m json.tool < website/public/.well-known/agent-card.json) | head
# Expected: empty diff (files match)
```

If any check 1-7 fails, do NOT push. Engage rollback (revert the JSON edit; re-run check 1).
If check 8 fails, substrate has unrelated regression — investigate before push.
Checks 9 + 10 are POST-deploy; run after Vercel finishes redeploying. If they fail, engage rollback (`git revert <commit>` and push).

### Step 5 — Append decision-log entry (lean form per cache)

Append `D-AGENT-CARD-A2A-V1-RESHAPE-YYYY-MM-DD` to `/operations/decision-log.md`. Lean form per cache §"Lean decision-log entry" with Elevated additions:

- Decision: reshape complete; substance preserved; structure now A2A v1 compliant
- Reasoning: closes the deferred gap from `D-AGENT-CARD-CURRENCY-CHECK-2026-05-14`; preserves Character-Kernel-as-discoverable-agent positioning
- Files touched: agent-card.json + any surrounding descriptive surface changes from Step 3
- Risk classification: Elevated (governing-rule-protected user-facing file)
- Rollback path: `git revert` of the reshape commit
- Verification step: the 10 checks from Step 4 + the founder runs the post-deploy checks 9+10 after Vercel green
- Rules served: 0a (status — agent-card.json Verified → "A2A v1 reshape Verified"), 0d-ii (Elevated), 0f (this entry), PR1 (single-endpoint proof — this IS the endpoint), PR2 (build-to-wire-verification immediate), PR10 (PEV loop full), PR11 (authoritative-current-sources — A2A v1 spec consulted), PR15 (the canonical primitive being conformed to is the A2A v1 spec itself), PR16 (positioning + dogfood — A2A-compliant card strengthens Character-Kernel-as-discoverable-agent positioning)

### Step 6 — Session close (lean + Elevated form per cache)

Path: `/operations/handoffs/founder/YYYY-MM-DD-agent-card-a2a-reshape-close.md`. Lean template + Elevated additions per `/adopted/standing-protocol-cache.md` §"Lean session close":

- **Decisions Made** — list the decision-log entry appended
- **Status Changes** — table covering: agent-card.json (Verified-but-misaligned → A2A v1 Reshape Verified); README + AGENTS.md / llms.txt (if updated); production state (unchanged at session start; live card reshaped after deploy)
- **Next Session Should** — A6 / A10 / A11a / A8 per founder election (the four substrate-build options remain available)
- **Blocked On** — uncommitted files + Vercel deploy status (note: this session's push triggers Vercel redeploy of the agent-card.json; founder confirms green before next session)
- **Open Questions** — any A2A v1 spec ambiguities surfaced + extensions-shape decisions deferred
- **Founder Verification** — commands from Step 4 + commit command + Vercel green confirmation + post-deploy checks 9+10
- **Cross-references** — predecessor close (`2026-05-14-anthropic-native-posture-close.md`); this session's decision-log entry; new/modified files

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + A2A v1 spec reads (Part A) | 15-20 min |
| Step 1 — Mapping table + founder approval gate | 15-20 min |
| Step 2 — Reshape agent-card.json | 20-30 min |
| Step 3 — Surrounding descriptive surface updates | 10 min |
| Step 4 — Verify (steps 1-7 in-session; 8 in-session; 9-10 post-deploy) | 10-15 min |
| Step 5 — Decision-log entry | 10-15 min |
| Step 6 — Session close | 10-15 min |
| **Total (in-session)** | **~90-115 min** |
| **Post-deploy founder verification** | **~5 min after Vercel green** |

If founder elects a tighter scope (~60 min), drop Step 3 (descriptive surface updates) to a follow-up. The load-bearing item is the JSON reshape itself.

## Rollback path

Pre-deploy: revert the JSON edit; re-validate via `python3 -m json.tool`. The file returns to its pre-reshape state.

Post-deploy: `git revert <agent-card-reshape-commit>` and push via GitHub Desktop. Vercel redeploys the prior agent-card.json shape on first request post-deploy. Agent-developer consumers see the prior mixed shape again until the next reshape attempt. **No data loss; no user impact** (the agent-card is metadata; reverting changes only the discovery surface, not any operational endpoint).

## Forecast

Successful session produces:

- **A2A v1 compliant agent-card.json** at `/website/public/.well-known/agent-card.json` — served live after Vercel redeploy at `sagereasoning.com/.well-known/agent-card.json`
- All required A2A v1 fields present and correctly shaped (`capabilities` object; `skills` array of skill-objects; `authentication.schemes` array of strings; `defaultInputModes`; `defaultOutputModes`)
- Custom extensions (`accessTiers`, `rateLimits`, `quickStart`) moved into A2A v1 `extensions` array with stable URIs
- Substance preserved: the 9 current capability-objects map to 9 A2A v1 skill-objects; no semantic information lost
- 1 decision-log entry appended; lean + Elevated form
- Descriptive surfaces (README, AGENTS.md, llms.txt) updated to match — if needed
- Character-Kernel-as-discoverable-agent positioning strengthened: agent-developer consumers can now parse the card per A2A v1 spec

**Stage 1 status after this session:** existing critical chain A1→A2→A3→A4→A5→A7 + cost monitoring (A9 + J6) + Anthropic-native posture (CLAUDE.md + Skills + amended PR15 + features survey adopted) + agent-card.json A2A v1 alignment complete. Stage 1 remaining: A6 (prose_mode templates) / A8 (V3 endpoint mapping) / A10-A19 (Stage 1 expansion). Substrate operationally ready for K-category migration prep (Stage 2 still gated on A10 + Stage 1 close).

**Next session after this:** A6 prose_mode templates (Standard; ~2-3hr) OR A10 per-agent credentials kickoff (Critical; ~3-4hr) OR A11a endpoint-auth audits (Standard; ~1hr) OR A8 V3 endpoint mapping (Standard; ~1-2hr) — per founder election. Subsequent sessions consult `.claude/skills/anthropic/` + agentic-commerce-findings tracker at session-open per amended PR15.

End of prompt.
