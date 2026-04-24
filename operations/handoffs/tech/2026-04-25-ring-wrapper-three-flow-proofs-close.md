# Session Close — 25 April 2026 (Ring Wrapper — Three-Flow Proofs)

**Stream:** tech
**Governing frame:** `/adopted/session-opening-protocol.md`
**Tier read this session:** 1, 2, 3, 8, 9 (every-session + code)
**Risk classification across the session:** Elevated × 3, no incidents.

## Decisions Made

- **Mentor-ring proof endpoint built and Verified.** New additive route `/api/mentor/ring/proof`. Founder-only gate. Distress check via `enforceDistressCheck` (AC4 invocation). Uses a hand-constructed `MentorProfile` fixture because the website's `loadMentorProfile` returns `MentorProfileData`, a different shape than the ring expects. Cost per request: $0.0138.
- **Support-agent proof endpoint built and Verified.** New additive route `/api/support/agent/proof`. Inner agent is sage-mentor's `buildDraftPrompt`. Channel 1 (sage-mentor's `SupportSafetyGate` Critical surface), Channel 2 (history synthesis), KB lookup, and filesystem writes all DEFERRED. Cost per request: $0.0182.
- **Founder-hub ring-proof endpoint built and Verified.** New additive route `/api/founder/hub/ring-proof`. Persona-agnostic (mentor / ops / tech / growth / support). Lightweight in-route persona prompts; persona context loaders DEFERRED. Live `/api/founder/hub` route is UNCHANGED. Cost per request: $0.0123.
- **Shape unification adapter is a separately scoped follow-up.** Founder directive — must be undertaken before integration arc closes. Logged as Task #8. Three approaches to choose between: (a) one-way adapter `MentorProfileData → MentorProfile`, (b) refactor ring to accept `MentorProfileData`, (c) unify the two shapes. Decision is the first item next session.
- **Live `/api/founder/hub` refactor and `mentor_interactions` writes deliberately deferred.** Both are live-integration scope, not proof scope. Each is a separate-session piece of work.

## Status Changes

- `sage-mentor/ring-wrapper.ts`: Wired-as-module → **Verified** (proven end-to-end on production across three flows with real LLM calls)
- `sage-mentor/persona.ts` `buildBeforePrompt`/`buildAfterPrompt`: isolated → **Verified** (invoked across all three flows)
- `sage-mentor/support-agent.ts` `buildDraftPrompt`: isolated → **Verified** (invoked via support-agent proof)
- `website/src/lib/sage-mentor-ring-bridge.ts`: created → **Live** → **Verified**
- `website/src/lib/mentor-ring-fixtures.ts`: created → **Live** (TEMPORARY — retires when adapter lands)
- `website/src/app/api/mentor/ring/proof`: created → **Live** → **Verified**
- `website/src/app/api/support/agent/proof`: created → **Live** → **Verified**
- `website/src/app/api/founder/hub/ring-proof`: created → **Live** → **Verified**
- `scripts/mentor-ring-proof-verification.mjs`: created → **Verified** (12/12 static assertions; live-probe instructions for all three flows)

## What Was Changed

| File | Action |
|---|---|
| `website/src/lib/mentor-ring-fixtures.ts` | created — hand-constructed `MentorProfile` fixture (TEMPORARY) |
| `website/src/lib/sage-mentor-ring-bridge.ts` | created — function bridge for ring + support-agent exports |
| `website/src/app/api/mentor/ring/proof/route.ts` | created — proof #1 |
| `website/src/app/api/support/agent/proof/route.ts` | created — proof #2 |
| `website/src/app/api/founder/hub/ring-proof/route.ts` | created — proof #3 |
| `scripts/mentor-ring-proof-verification.mjs` | created — static harness + live-probe instructions |

### Files NOT changed
- `/api/founder/hub/route.ts` (live persona-routing surface) — untouched
- All distress classifier code (`r20a-classifier.ts`, `constraints.ts` SafetyGate) — untouched, invoked only
- `mentor-profile-store.ts`, `mentor-context-private.ts`, etc. — unchanged
- All sage-mentor source files — unchanged

**No DB changes. No SQL. No DDL. No env vars added. No safety-critical files modified.**

## Verification Method Used (0c Framework)

- API endpoint × 3 (per verification framework). For each proof:
  - AI provided a browser-DevTools snippet (terminal-free, per founder preference).
  - Founder pasted into Console at sagereasoning.com (signed-in).
  - Founder pasted full JSON response back into chat.
  - AI confirmed expected fields, status, observable behaviour.
- Pre-deploy: `npx tsc --noEmit` clean (exit 0); static harness 12/12 passing.

## Risk Classification Record (0d-ii)

- Mentor-ring proof — **Elevated**. No PR6 surfaces touched. AC4 invocation. Deployed without incident.
- Support-agent proof — **Elevated**. Same surface as mentor-ring proof. Sage-mentor's own `SupportSafetyGate` (Critical) deliberately NOT invoked — website gate used instead. Deployed without incident.
- Founder-hub ring-proof — **Elevated**. Live `/api/founder/hub` deliberately not modified. Deployed without incident.

## PR5 — Knowledge-Gap Carry-Forward

No new permanent KG entries. Existing entries relevant this session:
- KG1 (Vercel rules): respected — only DB writes are `analytics_events` on distress, awaited before response.
- KG2 (Haiku boundary): respected — ring's `selectModelTier` aligns with website constraints.
- KG3 (hub-label consistency): NOT touched — proofs do not write to `mentor_interactions`.
- KG6 (composition order): respected — system blocks for inner agents, user content in user messages.

**Two new candidate observations (1st observation each — promotion at 3rd):**

1. **Sage-mentor `findRelevantJournalPassage` over-matching.** The matcher uses `string.includes(...)` on individual word fragments, which fires on common substrings (e.g., "deadline" includes single letters present in unrelated task text). The proof-passage-1 journal reference fired on the support inquiry about "deliberate proximity" with no semantic deadline content. The LLM correctly returned `null`; the local heuristic over-fires. Separate from ring integration — file for sage-mentor future work.
2. **Fast-tier (Haiku) path not exercised in any of the three live probes.** All three runs went deep on every call because the inner agents are freshly registered as `supervised`. The ring promotes to `guided` after 20 actions, at which point routine paths could downgrade to Haiku. Worth a future probe (or 21+ runs of any flow) to verify the cheap path works in production.

## Founder Verification (Between Sessions)

All three live probes completed and verified during the session — JSON responses confirmed in chat. No further verification required for the work landed.

For next session: review the **session-opening prompt** below before pasting into a new session.

## Next Session Should

1. **Open the next session with the prompt below.** It is self-contained and triggers the full session-opening protocol.
2. **Pick the adapter approach.** Three options: (a) one-way adapter `MentorProfileData → MentorProfile`, (b) refactor ring to accept `MentorProfileData`, (c) unify the two shapes into one source of truth. Each has trade-offs — see prompt for what to evaluate.
3. **Produce an ADR before code.** Once approach is chosen.
4. **Build the adapter (or refactor) and retire `mentor-ring-fixtures.ts`.** The three proof routes should then load profiles via the live profile store + adapter, no fixture.
5. **Adapter follow-up landing CLOSES the integration arc** per founder directive (25 Apr 2026).
6. **Subsequent sessions (separate work):** live integration of each flow — replace `/api/founder/hub`'s inline BEFORE/AFTER with the ring (refactor); add `mentor_interactions` writes (KG3 surface, hub-label decision); wire support-agent's full Channel 1 (Critical surface) + Channel 2 + KB lookup; wire persona context loaders.

## Blocked On

- **Founder design input on adapter approach (a/b/c above).** Required at start of next session.

## Open Questions

- Should the over-matching `findRelevantJournalPassage` be patched in sage-mentor in the next session, or filed for later? (Currently filed.)
- Cost behaviour at promoted authority levels — worth a probe in the adapter session.

## Process-Rule Citations

- **PR1** — respected. Three flows proven on three additive endpoints, no live-code rollout.
- **PR2** — respected. All three proofs verified in the same session.
- **PR4** — respected. Model selection confirmed against `constraints.ts` at session opening.
- **PR5** — respected. No new re-explanations; two candidate observations logged (above).
- **PR6** — respected. No safety-critical surfaces modified; existing classifiers invoked via AC4 pattern.
- **PR7** — respected. Adapter follow-up logged with scope, trigger, and reasoning (Task #8 + decision-log entries below).

## Decision Log Entries — Proposed (Founder Approval Required)

```
## 2026-04-25 — D-Ring-1: Three-flow Ring Wrapper proofs (PR1)

**Decision:** Build three additive proof routes — /api/mentor/ring/proof,
/api/support/agent/proof, /api/founder/hub/ring-proof — to satisfy PR1
(prove the ring pattern on isolated endpoints before rollout). All three
use a hand-constructed MentorProfile fixture, the website's existing
distress classifier, and no mentor_interactions writes.

**Reasoning:** The ring-wrapper module had zero imports from website/.
Wiring it directly into live orchestration (e.g., /api/founder/hub) would
have been a refactor of working code with no proof of the pattern. PR1
specifies single-endpoint proof first.

**Alternatives considered:** Refactor /api/founder/hub directly — rejected;
same-session refactor of live orchestration is high-risk. Wire with
adapter from the start — rejected; doubles scope and mixes two
architectural decisions (ring proof vs profile shape).

**Revisit condition:** None. PR1 satisfied. Future sessions wire each
flow into live code separately.

**Rules served:** PR1, PR2, PR4, AC4 invocation pattern, R20a invocation.

**Impact:** sage-mentor/ring-wrapper.ts moves from Wired-as-module to
Verified. Three new endpoints Live. No live data paths modified. Three
temporary files (fixture + bridge + harness) are documented as retiring
when the adapter lands.

**Status:** Adopted.
```

```
## 2026-04-25 — D-Ring-2: Shape unification adapter scoped as next-session priority

**Decision:** The shape mismatch between MentorProfileData (website's
loaded profile shape) and MentorProfile (ring's expected shape) is
resolved by a separately scoped follow-up. The proofs use a fixture
in the meantime.

**Reasoning:** Resolving the shape mismatch requires a design decision:
one-way adapter, ring refactor, or unification. Bundling that decision
into the proof would have doubled the scope and risked making a shape
decision under build-pressure rather than design-deliberation. Founder
explicitly confirmed this scope split.

**Alternatives considered:** Build adapter inline with proof — rejected;
mixes architectural decisions. Skip proof and refactor ring directly —
rejected; PR1 violation.

**Revisit condition:** Open from start of next session. Trigger: founder
design input on which approach to take.

**Rules served:** PR7 (deferred decisions are documented).

**Impact:** mentor-ring-fixtures.ts is TEMPORARY. The three proofs
cannot transition from fixture-driven to live-profile-driven until the
adapter lands.

**Status:** Adopted.
```

---

## Orchestration Reminder (Protocol element 21)

This session was governed end-to-end by `/adopted/session-opening-protocol.md`. No element was skipped. Element 7 (status vocabulary) was applied throughout — implementation status (Scoped/Designed/Scaffolded/Wired/Verified/Live) used for code; decision status reserved for the decision-log entries above.

---

*End of session close.*
