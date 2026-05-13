# Session Close — 2026-05-14 — Anthropic-Native Posture: CLAUDE.md + Skills Install + PR15 Amendment + Features Survey Refresh + agent-card.json Currency Check

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache). Deliverable-of-the-day: a coordinated set of changes adopting Anthropic's canonical Skills + CLAUDE.md pattern alongside our existing multi-stream governance.
**Tier:** `governance` (primary) + light `code-standard` (skills install). Session-as-a-whole **Standard** under 0d-ii. Three Elevated changes tracked as their own decision-log entries: PR15 amendment; features-survey adoption (drafts→adopted move per cache risk-table); J1 ADR A2A-addendum.
**Date:** 2026-05-14.
**Predecessor close (substrate-build):** `/operations/handoffs/founder/2026-05-14-A9-J6-cost-monitoring-close.md` (A9 + J6 Verified).
**Operative session prompt:** Next-Session Prompt — Anthropic-Native Posture (in-chat at session open).

---

## Decisions Made

- `D-ANTHROPIC-NATIVE-POSTURE-2026-05-14` (umbrella) appended (+~80 lines). Five coordinated changes: CLAUDE.md created; 17 Anthropic skills installed at `.claude/skills/anthropic/`; PR15 amended; standing cache amended; features survey refreshed + adopted.
- `D-PR15-AMENDED-FROM-ANTHROPIC-NATIVE-2026-05-14` appended (+~30 lines). Elevated. PR15 §`/adopted/project-instructions-snapshot.md` lines 502-519 replaced; OPERATIONAL DISCIPLINE subsection added; prior version preserved at `/archive/2026-05-14-pr15-pre-anthropic-native.md`.
- `D-CACHE-DRIFT-RESOLVED-2026-05-14` appended (+~30 lines). Standard. Four targeted amendments to `/adopted/standing-protocol-cache.md` (header status; how-to-use-cache mode-specific note; update-discipline; cross-references).
- `D-FEATURES-SURVEY-ADOPTED-2026-05-14` appended (+~30 lines). Elevated per cache risk-table (drafts→adopted move). Survey moved via `git mv` to `/adopted/anthropic-features-survey-2026-05-14.md`; 304→384 lines (+80) with 4 new sections + correction-on-correction notice + §5/§9 updates.
- `D-AGENT-CARD-CURRENCY-CHECK-2026-05-14` appended (+~50 lines). Elevated for J1 ADR addendum; Standard for README drift fix. Load-bearing A2A v1 alignment gaps documented; reshape deferred to follow-up session.

---

## Status Changes

| Item | Old | New |
|---|---|---|
| `/CLAUDE.md` at repo root | did not exist | **Live** (NEW; 75 lines; entry-point pointer file) |
| `/.claude/skills/anthropic/` | did not exist | **Live** (NEW; 17 Anthropic skills + provenance README; ~11MB) |
| `/.claude/skills/sage-*` | 7 skills (top level) | **unchanged** (preserved at top level) |
| PR15 in `/adopted/project-instructions-snapshot.md` | Adopted (ST2 2026-05-12) | **Amended** (Adopted; 2026-05-14 amendment per `D-PR15-AMENDED-FROM-ANTHROPIC-NATIVE-2026-05-14`) |
| `/adopted/standing-protocol-cache.md` | Adopted (last amended 2026-05-12) | **Amended** (Adopted; 2026-05-14 amendment per `D-CACHE-DRIFT-RESOLVED-2026-05-14`) |
| Features survey (location + status) | `/drafts/anthropic-features-survey-2026-05-10.md` (Drafted) | **`/adopted/anthropic-features-survey-2026-05-14.md` (Adopted)** |
| J1 ADR §"Agentic-commerce-stack adjacency" | last amended 2026-05-13 | **Amended** (2026-05-14; A2A-foundational-coordination-protocol addendum + A2A v1 alignment status) |
| `/README.md` lines 114 + 240 (agent-card descriptions) | prior counts (6 capabilities; 5-step quickstart) | corrected (9 capabilities; 6-step quickstart + cross-reference to `D-AGENT-CARD-CURRENCY-CHECK-2026-05-14`) |
| `/website/public/.well-known/agent-card.json` | served live since 28 March 2026 | **unchanged** (reshape deferred to follow-up Elevated session) |
| `/operations/decision-log.md` | 4769 lines | 4991 lines (+222 across 5 entries) |
| Substrate production state (env vars; endpoints; signatures) | A7 Verified; flags UNSET; steady-state | **unchanged** (no code changes touching production hot path) |

---

## Next Session Should

The build arc proceeds. Four valid elections per the A9+J6 close and the staging plan post-2026-05-14 state:

- **Option A — A6 prose_mode per-mode templates** (Standard; ~2-3hr). Closes A5.5 parameter-plumbing-only scope. F3 fold-in applies (A6 references A5). Recommended if K-category migration prep is the priority. The newly-amended PR15 + installed skills mean A6 starts with `.claude/skills/anthropic/skill-creator` consultable for any prose-template-as-skill design discussion.
- **Option B — A10 per-agent credentials kickoff + token-format ADR** (Critical; ~3-4hr). Highest-leverage Critical item. Token-format ADR consumes JWT / W3C VC / AP2-style mandate / hybrid candidates. F4 forward-looking finding folds in. Recommended if Stage 1 critical-path expansion is the priority.
- **Option C — A11a endpoint-auth audits** (Standard; ~1hr). Lean parallel-track work; not on critical path.
- **Option D — A8 V3 endpoint relationship design** (Standard; ~1-2hr). Produces mapping doc for how each `/api/score-*` endpoint becomes a plugin-internal tool wrapper. Recommended if K-category prep clarity is the priority.

**Founder elects at next session-open.**

**Pre-conditions for any next session:**
1. This session's work committed to origin/main (commit command in §"Founder Verification" below).
2. Founder runs the production-state verification probes between sessions to confirm substrate steady state preserved (A7 flag UNSET; A5 flag UNSET; `/api/reason` byte-identical; `/api/substrate/layer3` returns 503).
3. Founder confirms the new files exist on origin/main: `CLAUDE.md`; `.claude/skills/anthropic/`; `/adopted/anthropic-features-survey-2026-05-14.md`; two archive files.

**Subsequent sessions:** per amended PR15, each session-open consults `.claude/skills/anthropic/` for relevant SKILL.md patterns + the agentic-commerce-findings tracker for forward-looking findings matching the session's scope, before any bespoke election. Justification recorded in the session's decision-log entry under "Reasoning".

**Follow-up agent-card.json reshape session (deferred from Step 6 of this session):** load-bearing A2A v1 shape misalignments documented at `D-AGENT-CARD-CURRENCY-CHECK-2026-05-14`. Reshape Elevated; ~60-90 min. Founder elects timing (priority vs A6/A10/A11a/A8). When elected, session reshapes `capabilities`/`skills`/`authentication.schemes`/adds `defaultInputModes`/`defaultOutputModes`/moves custom fields to A2A `extensions`.

---

## Blocked On

**Files uncommitted (to be committed by founder before next session):**

```
?? CLAUDE.md
?? .claude/skills/anthropic/ (17 skill folders + README.md; ~11MB total)
M  adopted/project-instructions-snapshot.md
M  adopted/standing-protocol-cache.md
?? adopted/anthropic-features-survey-2026-05-14.md  (via git mv; the rename is staged once `git add` runs)
D  drafts/anthropic-features-survey-2026-05-10.md  (via git mv; the deletion-half of the rename)
M  adopted/adr/2026-05-12-substrate-category-character-kernel.md
M  README.md
?? archive/2026-05-14-pr15-pre-anthropic-native.md
?? archive/2026-05-14-j1-adr-pre-a2a-addendum.md
M  operations/decision-log.md
?? operations/handoffs/founder/2026-05-14-anthropic-native-posture-close.md
?? operations/handoffs/founder/2026-05-14-anthropic-native-posture-NEXT-SESSION-PROMPT.md  (the session-opening prompt; commits alongside the work)
```

**Production state at session close:** unchanged from session start (and from 2026-05-14 A9+J6 close). Substrate at A7 Verified. `/api/public-key` serves steady-state shape (`previous: null`; `rotation_overlap_until: null`; `algorithm: Ed25519`). `SUBSTRATE_LAYER3_ENABLED` env var UNSET. `SUBSTRATE_R20A_GATE_ENABLED` env var UNSET. `/api/reason` behaviour byte-identical. `/api/substrate/layer3` returns 503. All four `SUBSTRATE_LAYER2_PREVIOUS_*` env vars UNSET. `/api/billing/usage-summary` returns the A9+J6 extended schema with `metrics.cost_source` + `metrics.rolling_seven_day` block. **No env-var changes; no schema migrations; no auth-surface changes; no R20a perimeter changes; no Next.js bundle changes (`.claude/` is a Claude Code convention path, not part of Vercel's deploy).** Vercel will redeploy on push but no behaviour change is expected — the only code-adjacent file modified is `/README.md` (descriptive text); the rest are governance documents + the new entry-point + the skills folder.

---

## Open Questions

**New open questions surfaced this session (per each entry's open-questions field):**

1. **Agent-card.json reshape session timing.** Load-bearing A2A v1 shape misalignments documented at `D-AGENT-CARD-CURRENCY-CHECK-2026-05-14`. Founder elects when. Revisit condition: founder direction (priority vs A6/A10/A11a/A8).
2. **A2A v1 `extensions` field shape.** At reshape time, confirm A2A v1 extensions support `accessTiers`/`rateLimits`/`tags`/`quickStart` content shapes. Revisit condition: reshape session opens.
3. **Component-registry update batching.** Deferred batch grows by CLAUDE.md + 17 Anthropic skills + amended PR15 + refreshed survey + J1 ADR addendum. Revisit condition: routine governance session.
4. **CLAUDE.md edit-by-Claude convention.** Anthropic's CLAUDE.md special handling allows Claude to edit the file as work progresses. We have not adopted this convention this session (CLAUDE.md treated as static pointer). Revisit condition: if a future session would meaningfully benefit from CLAUDE.md auto-update.

**Carry-forward open questions from predecessor sessions (still open):**

- A7 production activation timing — unchanged this session.
- A5.4 production activation timing — unchanged this session.
- AC2 latency budget verification for the fresh-call path — unchanged this session.
- A9+J6 open questions (cap defaults review; per-path metric split trigger; alert delivery surface; component-registry batching) — unchanged this session; the component-registry batching item is now bigger.

---

## PR5 Knowledge-Gap Carry-Forward

No concepts required re-explanation this session. Founder paste-syncs the project-instructions panel between Cowork sessions per project-instructions §0a/§0e discipline; this session's PR15 amendment will need to be reflected in the panel paste-sync. Cumulative KG count: 0 carry-forward, 0 new.

---

## Founder Verification

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add -A
git commit -m "Anthropic-native posture: CLAUDE.md + 17 skills + PR15 amendment + features survey adopted + J1 A2A addendum

Coordinated set of changes adopting Anthropic's canonical Skills + CLAUDE.md
pattern alongside the existing multi-stream governance.

Five decision-log entries:
- D-ANTHROPIC-NATIVE-POSTURE-2026-05-14 (umbrella; Standard)
- D-PR15-AMENDED-FROM-ANTHROPIC-NATIVE-2026-05-14 (Elevated; governing-rule)
- D-CACHE-DRIFT-RESOLVED-2026-05-14 (Standard)
- D-FEATURES-SURVEY-ADOPTED-2026-05-14 (Elevated; drafts->adopted)
- D-AGENT-CARD-CURRENCY-CHECK-2026-05-14 (Elevated for J1 ADR addendum;
  Standard for README drift; agent-card.json reshape deferred)

Files (NEW):
- CLAUDE.md (75 lines; entry-point pointer file for Claude Code sessions)
- .claude/skills/anthropic/ (17 official Anthropic skills + provenance
  README; from anthropics/skills March 2026; ~11MB)
- adopted/anthropic-features-survey-2026-05-14.md (via git mv from
  drafts/2026-05-10; +80 lines; four new sections; correction-on-correction
  notice; status flipped Drafted -> Adopted)
- archive/2026-05-14-pr15-pre-anthropic-native.md (verbatim snapshot of
  pre-amendment PR15 per project-instructions \\u00a70e)
- archive/2026-05-14-j1-adr-pre-a2a-addendum.md (verbatim snapshot of
  pre-amendment J1 ADR \\u00a7Agentic-commerce-stack adjacency)
- operations/handoffs/founder/2026-05-14-anthropic-native-posture-*.md
  (next-session prompt + this close)

Files (MODIFIED):
- adopted/project-instructions-snapshot.md \\u00a7PR15 (Cookbook patterns +
  Reference agents added; new OPERATIONAL DISCIPLINE subsection mandating
  consultation of .claude/skills/anthropic/ + agentic-commerce-findings
  before bespoke election)
- adopted/standing-protocol-cache.md (header status; how-to-use mode note;
  update-discipline; cross-references; +PR15 date callouts)
- adopted/adr/2026-05-12-substrate-category-character-kernel.md (J1 ADR;
  header status; A2A foundational-coordination-protocol addendum + A2A v1
  alignment status note in \\u00a7Agentic-commerce-stack adjacency)
- README.md (line 114 capability count 6->9; line 240 quickstart steps
  5->6 + cross-reference to D-AGENT-CARD-CURRENCY-CHECK)
- operations/decision-log.md (+222 lines across 5 entries)

Production state at commit: unchanged. Substrate at A7 Verified;
SUBSTRATE_LAYER3_ENABLED + SUBSTRATE_R20A_GATE_ENABLED both UNSET;
/api/reason byte-identical; /api/substrate/layer3 returns 503;
/api/public-key serves steady-state shape (Ed25519; previous null;
rotation_overlap_until null). No env-var changes; no schema migrations;
no auth-surface changes; no R20a perimeter changes. The .claude/
convention path is not part of the Vercel bundle so no deploy behaviour
change is expected.

Verification (in-session): 11 checks PASS diagnostic-certain:
CLAUDE.md exists; 17 Anthropic skills installed; representative SKILL.md
readable; PR15 amendment text present; standing cache updated with 3
CLAUDE.md mentions + 2 .claude/skills/anthropic mentions; features survey
adopted at /adopted/; both archive files exist; tsc clean compile;
A5 28/28 PASS; A7 33/33 PASS; production public-key steady state PASS.

PR10 PEV loop applied in lean+Elevated form. PR11 (authoritative-current-
sources): inbox clean since 2026-05-13; anthropics/skills repo +
agent2agent.info canonical schema consulted; PR15 amendment + features
survey refresh + A2A v1 alignment check all back-grounded by current
canonical sources. PR12 (negative-finding discipline): .claude/skills/
checked at both project-local + user-global paths before declaring 'not
installed'; mid-step self-correction on A2A v1 protocolVersion field
requirement. PR13 (consider-implications): 5-question assessment applied
across each amendment. PR15 (bias toward existing Anthropic infrastructure):
the session itself is the canonical example; convergence on Anthropic-
canonical primitives where they don't conflict with governance discipline.
PR16 (positioning + dogfood): strengthens Character Kernel positioning by
adopting standard Anthropic primitives without compromising governance.

Next session: A6 prose_mode templates OR A10 per-agent credentials kickoff
OR A11a audits OR A8 V3 endpoint mapping per founder election. Subsequent
sessions consult .claude/skills/anthropic/ + agentic-commerce-findings at
session-open per amended PR15."
```

Then push via GitHub Desktop. Vercel will redeploy but no behaviour change is expected.

**Between-session verification (Clinton runs locally):**

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"

# 1. Confirm commit + push
git log --oneline -3 origin/main
# Expected: top commit = the Anthropic-native posture commit; preceded by
# 2026-05-14 A9+J6 + 2026-05-13 A7.

# 2. CLAUDE.md exists at repo root
ls -la CLAUDE.md
# Expected: file exists; size > 0.

# 3. 17 Anthropic skills installed
ls .claude/skills/anthropic/ | wc -l
# Expected: 18 (17 skill folders + README.md).

# 4. PR15 amendment present
grep "AMENDED 2026-05-14" adopted/project-instructions-snapshot.md | head -3
# Expected: PR15 amendment line visible.

# 5. Standing cache references CLAUDE.md
grep -c "CLAUDE.md" adopted/standing-protocol-cache.md
# Expected: >= 3.

# 6. Features survey adopted
ls adopted/anthropic-features-survey-2026-05-14.md
ls drafts/anthropic-features-survey-2026-05-10.md 2>&1 | grep -c "No such"
# Expected: first exists; second returns 1.

# 7. Archives preserved
ls archive/2026-05-14-pr15-pre-anthropic-native.md
ls archive/2026-05-14-j1-adr-pre-a2a-addendum.md
# Expected: both exist.

# 8. TypeScript compile (expected: clean)
cd website && npx tsc --noEmit -p tsconfig.json && cd ..

# 9. A5 regression check (expected: 28 pass / 0 fail)
cd website && npx tsx src/lib/substrate/__tests__/layer3-service.test.ts && cd ..

# 10. A7 regression check (expected: 33 pass / 0 fail)
cd website && npx tsx src/lib/substrate/__tests__/r20a-gate.test.ts && cd ..

# 11. Substrate steady state (production unchanged)
curl -sS -o /dev/null -w "%{http_code}\n" -X POST https://www.sagereasoning.com/api/substrate/layer3
# Expected: 503.

curl -sS https://www.sagereasoning.com/api/public-key | python3 -c "
import json, sys
d = json.load(sys.stdin)
ok = d.get('previous') is None and d.get('rotation_overlap_until') is None and d.get('algorithm') == 'Ed25519'
print('PASS' if ok else 'FAIL')
"
# Expected: PASS.

# 12. (Optional) Agent-card.json unchanged this session
git diff HEAD~1 website/public/.well-known/agent-card.json | wc -l
# Expected: 0 (reshape deferred to follow-up session).
```

If any check fails, engage rollback (`git revert` and push). The `.claude/` directory disappears on revert; CLAUDE.md disappears; PR15 reverts to prior text; cache reverts; features survey returns to `/drafts/`; J1 ADR reverts to pre-addendum text. The two archive files persist either way as verbatim records.

---

## Project-instructions panel paste-sync reminder (between sessions)

Per project-instructions §0a/§0e discipline + this session's `D-PR15-AMENDED-FROM-ANTHROPIC-NATIVE-2026-05-14`: founder paste-syncs the Cowork project-instructions panel against the operative snapshot at `/adopted/project-instructions-snapshot.md` between sessions. The 2026-05-14 amendment to PR15 (Cookbook patterns + Reference agents added; new OPERATIONAL DISCIPLINE subsection) must be reflected in the panel for subsequent Cowork sessions to see it at session-open.

For Claude Code sessions on this repo, `CLAUDE.md` at repo root auto-loads with the amended PR15 expectation already referenced.

---

## Cross-references

- Operative session prompt: `/operations/handoffs/founder/2026-05-14-anthropic-native-posture-NEXT-SESSION-PROMPT.md`.
- Predecessor close (substrate-build): `/operations/handoffs/founder/2026-05-14-A9-J6-cost-monitoring-close.md`.
- Predecessor decision-log entries: `D-A9-J6-COST-MONITORING-WIRED-2026-05-14`; `D-A7-R20A-GATE-SCAFFOLDED-VERIFIED-2026-05-13`; `D-AGENTIC-COMMERCE-UPSTREAM-REWORK-2026-05-13`.
- This session's decision-log entries: `D-ANTHROPIC-NATIVE-POSTURE-2026-05-14` (umbrella); `D-PR15-AMENDED-FROM-ANTHROPIC-NATIVE-2026-05-14`; `D-CACHE-DRIFT-RESOLVED-2026-05-14`; `D-FEATURES-SURVEY-ADOPTED-2026-05-14`; `D-AGENT-CARD-CURRENCY-CHECK-2026-05-14`.
- New adopted artefacts:
  - `/CLAUDE.md` (NEW)
  - `/.claude/skills/anthropic/` (NEW — 17 skill folders + README)
  - `/adopted/anthropic-features-survey-2026-05-14.md` (NEW via git mv)
- Modified adopted artefacts:
  - `/adopted/project-instructions-snapshot.md` §PR15 (Elevated amendment)
  - `/adopted/standing-protocol-cache.md` (Standard amendment)
  - `/adopted/adr/2026-05-12-substrate-category-character-kernel.md` (Elevated amendment — J1 ADR §Agentic-commerce-stack adjacency)
  - `/README.md` (Standard amendment — descriptive text drift)
- Archive snapshots (preserve-prior-versions per §0e):
  - `/archive/2026-05-14-pr15-pre-anthropic-native.md`
  - `/archive/2026-05-14-j1-adr-pre-a2a-addendum.md`
- Governing frame:
  - `/manifest.md` §R5 (cost alerts; unchanged this session) + §R18a (Character Kernel positioning; reinforced by J1 addendum)
  - `/adopted/substrate-plugin-staging-plan.md` Stage 1 (unchanged this session; next-session options A6/A10/A11a/A8 named)

---

*End of Anthropic-native posture session close. Coordinated adoption of Anthropic's canonical Skills + CLAUDE.md pattern alongside existing multi-stream governance complete. PR15 operationalised. Features survey refreshed + adopted as governing reference. J1 ADR extended with A2A foundational-coordination-protocol context. agent-card.json reshape deferred to a follow-up Elevated session with precise gap documentation. Production state preserved: substrate hot path untouched; no env-var changes; no deploy-behaviour changes expected. Build arc proceeds to A6 / A10 / A11a / A8 per founder election at next session-open. Subsequent sessions consult `.claude/skills/anthropic/` + agentic-commerce-findings at session-open per amended PR15.*
