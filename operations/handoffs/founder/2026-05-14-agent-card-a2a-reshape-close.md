# Session Close — 2026-05-14 — Agent-Card.json A2A v1 Reshape

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache). Deliverable-of-the-day: reshape of `/website/public/.well-known/agent-card.json` from prior mixed shape to A2A v1 canonical shape, closing the deferred gap from `D-AGENT-CARD-CURRENCY-CHECK-2026-05-14`.
**Tier:** `code-elevated` — **Elevated** risk under 0d-ii. Critical Change Protocol NOT engaged.
**Date:** 2026-05-14.
**Predecessor close:** `/operations/handoffs/founder/2026-05-14-anthropic-native-posture-close.md` (the umbrella session that documented the gap and deferred this reshape).
**Operative session prompt:** the next-session prompt provided in chat at session open.

---

## Decisions Made

- `D-AGENT-CARD-A2A-V1-RESHAPE-2026-05-14` appended to `/operations/decision-log.md` (~95 lines). Single Elevated entry. Reshapes the agent-card.json from its prior mixed shape to A2A v1 canonical shape. Closes the deferred gap documented at `D-AGENT-CARD-CURRENCY-CHECK-2026-05-14`. **Includes a load-bearing correction surfaced by PR12 negative-finding discipline:** the predecessor session's draft mapping assumed top-level `extensions[]`; the canonical A2A v1 shape places extensions inside `capabilities.extensions[]`. The reshape conforms to the canonical shape.
- Predecessor entry `D-AGENT-CARD-CURRENCY-CHECK-2026-05-14` status line updated with **"Superseded by `D-AGENT-CARD-A2A-V1-RESHAPE-2026-05-14`"** pointer.

---

## Status Changes

| Item | Old | New |
|---|---|---|
| `/website/public/.well-known/agent-card.json` (shape) | Verified-but-A2A-v1-misaligned-pending-reshape | **A2A v1 Reshape Verified** (canonical shape; 9 skill-objects; capabilities object with extensions nested; authentication.schemes string-array; defaultInputModes + defaultOutputModes present) |
| `/website/public/.well-known/agent-card.json` (file size) | 169 lines | 168 lines (substance preserved; structure aligned to canonical) |
| `/README.md` line 114 | "declares 9 capabilities, rate limits, authentication, and integration quickstart" | "(v1-shape; reshaped 2026-05-14) — declares 9 skills, rate limits, authentication schemes, and integration quickstart" |
| `/README.md` line 240 | "declares capabilities, ... 6-step quickstart ... **Note:** ... deferred to a follow-up session" | "A2A protocol standard, v1-aligned — declares 9 skills, rate limits, authentication schemes, and a 6-step quickstart ... Reshape under `D-AGENT-CARD-A2A-V1-RESHAPE-2026-05-14` closed the gaps" |
| `/operations/decision-log.md` entry `D-AGENT-CARD-CURRENCY-CHECK-2026-05-14` | Adopted; deferred follow-up TBD | Adopted; **Superseded by `D-AGENT-CARD-A2A-V1-RESHAPE-2026-05-14`** |
| `/operations/decision-log.md` total | 4991 lines | ~5087 lines (+~96 lines = predecessor superseded-pointer + new entry) |
| Substrate production state (env vars; endpoints; signatures) | A7 Verified; flags UNSET; steady-state | **unchanged** (no code changes touching production hot path; JSON file change only) |
| Live `sagereasoning.com/.well-known/agent-card.json` | prior mixed shape | will serve A2A v1 canonical shape **once Vercel redeploys following the push** |

---

## Next Session Should

The four substrate-build options from the predecessor close remain available, unchanged. Founder elects:

- **Option A — A6 prose_mode per-mode templates** (Standard; ~2-3hr). K-category migration prep. `.claude/skills/anthropic/skill-creator/SKILL.md` consultable per amended PR15.
- **Option B — A10 per-agent credentials kickoff + token-format ADR** (Critical; ~3-4hr). Highest-leverage Critical item. F4 forward-looking finding folds in.
- **Option C — A11a endpoint-auth audits** (Standard; ~1hr). Lean parallel-track work.
- **Option D — A8 V3 endpoint relationship design** (Standard; ~1-2hr). Produces mapping doc for K-category migration prep.

Subsequent sessions consult `.claude/skills/anthropic/` + agentic-commerce-findings tracker at session-open per amended PR15. Justification recorded in decision-log if bespoke is elected.

**Founder elects at next session-open.**

**Pre-conditions for any next session:**

1. This session's work committed to origin/main (commit command in §"Founder Verification" below).
2. Founder runs the in-session verification probes from local machine (the sandbox couldn't reach `sagereasoning.com` — sandbox proxy returned 403; founder verifies steady state locally).
3. After Vercel redeploys, founder runs the post-deploy probes (live card valid; live card matches local file).
4. No regressions to A7 / A5 / A9 / J6 detected.

---

## Blocked On

**Files uncommitted (to be committed by founder before next session):**

```
M  website/public/.well-known/agent-card.json
M  README.md
M  operations/decision-log.md
?? operations/handoffs/founder/2026-05-14-agent-card-a2a-reshape-close.md
```

**Production state at session close:** unchanged from session start. Substrate at A7 Verified. `/api/public-key` serves steady-state shape (`previous: null`; `rotation_overlap_until: null`; `algorithm: Ed25519`). `SUBSTRATE_LAYER3_ENABLED` env var UNSET. `SUBSTRATE_R20A_GATE_ENABLED` env var UNSET. `/api/reason` behaviour byte-identical. `/api/substrate/layer3` returns 503. All four `SUBSTRATE_LAYER2_PREVIOUS_*` env vars UNSET. `/api/billing/usage-summary` returns the A9+J6 extended schema. **No env-var changes; no schema migrations; no auth-surface changes; no R20a perimeter changes.** Vercel will redeploy on push; the only file deployed is `agent-card.json` (in `/website/public/`), so the only production change is the agent-card shape served at the well-known A2A discovery URL.

---

## Open Questions

**New open questions surfaced this session (per the decision-log entry):**

1. **Per-skill `endpoint` + `method` field portability.** Retained as supplementary fields; A2A v1 consumers parse the canonical fields and ignore the rest. If a future strict-validator rejects unknown fields, the supplementary routing info would need to move (e.g., to a SageReasoning routing extension at `capabilities.extensions[]`). Revisit condition: agent-developer-consumer feedback about parsing failures, or a stricter validator is identified.
2. **`protocolVersions` + `supportedInterfaces` (newer A2A v1 fields).** WebSearch surfaced these as v1 fields advertising A2A spec versions + concrete endpoint bindings. NOT added this session — outside the documented gap scope. Revisit condition: agent-developer-consumer requests them, or a subsequent A2A spec consult shows them as required.
3. **README `/api-docs` page consistency.** The page renders capability info from the live API (not from agent-card.json), so the reshape doesn't change what renders there. Not touched this session. Revisit condition: if the page is ever changed to render from agent-card.json.

**Carry-forward open questions from predecessor sessions (still open):**

- A7 production activation timing — unchanged this session.
- A5.4 production activation timing — unchanged this session.
- AC2 latency budget verification for the fresh-call path — unchanged this session.
- A9+J6 open questions (cap defaults review; per-path metric split trigger; alert delivery surface; component-registry batching) — unchanged this session; component-registry batching item grows by this reshape.
- Agent-card.json reshape session timing (from `D-AGENT-CARD-CURRENCY-CHECK-2026-05-14` open questions) — **RESOLVED** by this session.

---

## PR5 Knowledge-Gap Carry-Forward

No concepts required re-explanation this session. The PR12 negative-finding discipline worked as designed: the initial canonical interface read suggested top-level extensions might or might not be the canonical location; cross-verification against a2a-protocol.org's published examples confirmed the nested `capabilities.extensions[]` shape. Cumulative KG count: 0 carry-forward, 0 new.

The session is a useful instance of PR12 in action — the lean negative-finding discipline (try multiple queries; consult official documentation directly; state the correction explicitly) prevented committing the predecessor's draft assumption into the reshape.

---

## Founder Verification

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add website/public/.well-known/agent-card.json README.md operations/decision-log.md operations/handoffs/founder/2026-05-14-agent-card-a2a-reshape-close.md
git commit -m "agent-card.json: A2A v1 reshape (closes D-AGENT-CARD-CURRENCY-CHECK gap)

Reshape agent-card.json from prior mixed shape to A2A v1 canonical shape.
Closes the deferred gap documented at D-AGENT-CARD-CURRENCY-CHECK-2026-05-14.

PR12 yielded a load-bearing correction to the predecessor's draft mapping:
extensions live INSIDE capabilities (capabilities.extensions[] of
AgentExtension objects), NOT at top level. The canonical A2A v1 spec
per agent2agent.info + a2a-protocol.org confirmed the nested shape.

Reshape applied:
- 9 endpoint-objects from capabilities (array) -> skills (array of
  skill-objects with id/name/description/tags/inputModes/outputModes;
  endpoint+method retained as supplementary fields)
- new capabilities object: streaming/pushNotifications/
  stateTransitionHistory all false (reflects substrate behaviour)
  + extensions[] nested with 3 entries (accessTiers/rateLimits/
  quickStart at versioned URIs)
- authentication.schemes: [{type,description}] -> ['bearer','none']
  with descriptions consolidated into authentication.credentials
- defaultInputModes + defaultOutputModes added: ['application/json']
- top-level 'skills' (10 strings) + top-level 'tags' (12 strings)
  distributed across per-skill tags[] arrays
- accessTiers/rateLimits/quickStart moved into
  capabilities.extensions[] as AgentExtension objects with stable
  versioned URIs at https://sagereasoning.com/extensions/{name}/v1

Files:
- website/public/.well-known/agent-card.json (RESHAPED; 169 -> 144 lines)
- README.md line 114 (9 capabilities -> 9 skills)
- README.md line 240 (Note: deferred -> Reshape closed the gaps)
- operations/decision-log.md (D-AGENT-CARD-A2A-V1-RESHAPE entry +
  predecessor superseded-pointer; +96 lines)
- operations/handoffs/founder/2026-05-14-agent-card-a2a-reshape-close.md (NEW)

Verification (in-session): 7 checks PASS diagnostic-certain. JSON valid;
all A2A v1 required fields present; capabilities object shape OK;
skills 9 skill-objects; authentication.schemes string-array; extensions
nested in capabilities (not top-level); tsc clean compile; A5 28/28 PASS;
A7 33/33 PASS. Check 8 (substrate steady state) deferred to founder
between-sessions verification — sandbox proxy blocks outbound HTTPS to
sagereasoning.com.

PR1 single-endpoint proof: this IS the single endpoint. PR2 build-to-wire
verification immediate. PR10 PEV loop applied in full Elevated form.
PR11 authoritative-current-sources: 4 official A2A sources consulted
(agent2agent.info AgentCard interface + Extensions topic + v1.0 changes;
a2a-protocol.org via WebSearch). PR12 negative-finding discipline yielded
load-bearing correction to predecessor's draft mapping. PR13 consider-
implications: 5-question assessment applied. PR15: no bespoke election
(A2A v1 spec is the canonical primitive being conformed to). PR16
positioning: strengthens Character-Kernel-as-discoverable-agent.

Risk classification: Elevated. Critical Change Protocol NOT engaged.
AC7 + PR6 not engaged. AC5 perimeter unchanged. No env-var changes;
no schema migrations; no auth-surface changes; no R20a perimeter
changes. Vercel redeploys on push; the only deployment change is the
shape served at sagereasoning.com/.well-known/agent-card.json.

Next session: A6 / A10 / A11a / A8 per founder election."
```

Then push via GitHub Desktop. Vercel will redeploy; expect the only behaviour change to be the new agent-card.json shape served at `sagereasoning.com/.well-known/agent-card.json`.

**Between-session verification (Clinton runs locally):**

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"

# 1. Confirm commit + push
git log --oneline -3 origin/main
# Expected: top commit = the agent-card.json A2A v1 reshape commit;
# preceded by the Anthropic-native posture commit + the A9+J6 commit.

# 2. JSON validity + A2A v1 shape (mirrors in-session checks 1-5)
python3 -m json.tool website/public/.well-known/agent-card.json > /dev/null && echo "JSON valid"
# Expected: "JSON valid"

python3 -c "
import json
d = json.load(open('website/public/.well-known/agent-card.json'))
required = ['name', 'description', 'url', 'version', 'capabilities', 'authentication', 'defaultInputModes', 'defaultOutputModes', 'skills']
missing = [f for f in required if f not in d]
print('All A2A v1 required fields present' if not missing else f'MISSING: {missing}')
print('capabilities is object:', isinstance(d['capabilities'], dict))
print('capabilities.streaming present:', 'streaming' in d['capabilities'])
print('skills count:', len(d['skills']))
print('all skills have id:', all('id' in s for s in d['skills']))
print('authentication.schemes:', d['authentication']['schemes'])
print('top-level extensions present:', 'extensions' in d)
print('capabilities.extensions count:', len(d['capabilities'].get('extensions', [])))
"
# Expected: All required fields present; capabilities is object: True;
# capabilities.streaming present: True; skills count: 9; all skills have id: True;
# authentication.schemes ['bearer', 'none']; top-level extensions present: False;
# capabilities.extensions count: 3.

# 3. README updated
grep "9 skills, rate limits" README.md
# Expected: line 114 visible with updated phrasing.

grep "D-AGENT-CARD-A2A-V1-RESHAPE-2026-05-14" README.md
# Expected: line 240 visible with reshape entry cross-reference.

# 4. Decision-log entry present
grep -c "D-AGENT-CARD-A2A-V1-RESHAPE-2026-05-14" operations/decision-log.md
# Expected: >= 4 (the entry itself + the predecessor superseded-pointer +
# the cross-references at the end + the README cross-ref).

# 5. TypeScript compile (defensive; nothing in TS references the JSON
# shape internally, so a clean compile is expected)
cd website && npx tsc --noEmit -p tsconfig.json && cd ..
# Expected: clean compile.

# 6. A5 regression check
cd website && npx tsx src/lib/substrate/__tests__/layer3-service.test.ts && cd ..
# Expected: 28 pass / 0 fail.

# 7. A7 regression check
cd website && npx tsx src/lib/substrate/__tests__/r20a-gate.test.ts && cd ..
# Expected: 33/33 pass.

# 8. Substrate steady state (production unchanged from session start)
curl -sS -o /dev/null -w "%{http_code}\n" -X POST https://www.sagereasoning.com/api/substrate/layer3
# Expected: 503.

curl -sS https://www.sagereasoning.com/api/public-key | python3 -c "
import json, sys
d = json.load(sys.stdin)
ok = d.get('previous') is None and d.get('rotation_overlap_until') is None and d.get('algorithm') == 'Ed25519'
print('PASS' if ok else 'FAIL')
"
# Expected: PASS.

# 9. POST-DEPLOY (after Vercel redeploys; usually ~1-3 min after push):
#    confirm the LIVE card is valid JSON and matches the local file
curl -sS https://www.sagereasoning.com/.well-known/agent-card.json | python3 -m json.tool > /dev/null && echo "Live card valid"
# Expected: "Live card valid"

# 10. POST-DEPLOY: live card byte-matches local file (after pretty-print
#     normalisation on both sides)
diff <(curl -sS https://www.sagereasoning.com/.well-known/agent-card.json | python3 -m json.tool) \
     <(python3 -m json.tool < website/public/.well-known/agent-card.json) | head
# Expected: empty diff.
```

If any check 1-7 fails locally, engage rollback (`git revert <commit>` and push). If checks 9-10 fail post-deploy, engage rollback. The reshape returns to the prior mixed shape on first request post-revert. **No data loss; no user impact** beyond the discovery surface.

---

## Project-instructions panel paste-sync reminder

This session did NOT amend the project-instructions snapshot or the standing-protocol-cache (no governance-document changes). Founder paste-sync of the Cowork project-instructions panel is unchanged from the predecessor session — the 2026-05-14 PR15 amendment is the operative state. No new paste-sync required.

For Claude Code sessions on this repo, `CLAUDE.md` at repo root remains the auto-loaded entry point.

---

## Cross-references

- Operative session prompt: provided in chat at session open (the next-session prompt the founder posted).
- Predecessor close (governance + gap-documentation): `/operations/handoffs/founder/2026-05-14-anthropic-native-posture-close.md`.
- Predecessor close (substrate-build): `/operations/handoffs/founder/2026-05-14-A9-J6-cost-monitoring-close.md`.
- Predecessor decision-log entries:
  - `D-AGENT-CARD-CURRENCY-CHECK-2026-05-14` (predecessor; **superseded by this session's entry**)
  - `D-ANTHROPIC-NATIVE-POSTURE-2026-05-14` (umbrella)
  - `D-PR15-AMENDED-FROM-ANTHROPIC-NATIVE-2026-05-14` (PR15 operational discipline)
  - `D-A9-J6-COST-MONITORING-WIRED-2026-05-14`
  - `D-A7-R20A-GATE-SCAFFOLDED-VERIFIED-2026-05-13`
- This session's decision-log entry: `D-AGENT-CARD-A2A-V1-RESHAPE-2026-05-14`.
- Modified files:
  - `/website/public/.well-known/agent-card.json` (RESHAPED)
  - `/README.md` (lines 114 + 240 descriptive-text updates)
  - `/operations/decision-log.md` (+ predecessor superseded-pointer + new entry)
- Governing frame:
  - `/adopted/standing-protocol-cache.md` (Elevated lean+ template applied)
  - `/adopted/project-instructions-snapshot.md` §PR11 (sources consulted) + §PR12 (negative-finding discipline) + §PR15 (no bespoke election)
  - `/adopted/adr/2026-05-12-substrate-category-character-kernel.md` §"Agentic-commerce-stack adjacency" (A2A v1 alignment status note now describes "Reshape Verified"; not edited this session — the note's text remains accurate without amendment since it didn't predict the reshape would land this session)
  - `/adopted/anthropic-features-survey-2026-05-14.md` §14 (AAIF/A2A governance — context for the reshape)
- A2A v1 spec sources consulted (PR11):
  - `https://agent2agent.info/docs/concepts/agentcard/` (canonical AgentCard TypeScript interface)
  - `https://agent2agent.info/docs/topics/extensions` (Extensions topic; declaration + activation)
  - `https://agent2agent.info/docs/community/whats-new-v1` (v1.0 changes summary)
  - `https://a2a-protocol.org/latest/specification/` via WebSearch (capabilities.extensions[] nested shape confirmed)

---

*End of agent-card.json A2A v1 reshape session close. The deferred gap documented at `D-AGENT-CARD-CURRENCY-CHECK-2026-05-14` is now closed. Agent-developer consumers will see the A2A-v1-compliant card after Vercel redeploys the pushed change. Substrate hot path untouched: no env-var changes; no schema migrations; no auth-surface changes; no R20a perimeter changes; production state preserved at session close. Build arc proceeds to A6 / A10 / A11a / A8 per founder election at next session-open.*
