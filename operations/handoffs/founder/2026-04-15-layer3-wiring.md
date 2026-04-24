# Session Close — 15 April 2026 — Layer 3 Wiring + Layer 2 Gap Reassessment

**References:**
- session-handoffs/2026-04-14d-mentor-context-v2-cleanup.md (prior close)
- Yesterday's P0 hold point assessment (in-chat, not saved to file)
- Commit `1b61bc6` — wire Layer 3 project context to 9 engine endpoints
- Commit `bc05dfc` — add comprehension comment blocks to all 9 modified
  route files (340 line insertions, comments only, no executable change).
  Produced in response to the founder's standing COMPREHENSION REQUIREMENT
  raised at session close: every modified file must carry its own
  explanation of what it does, why it's structured that way, what breaks,
  and where the decision is documented.

**Status entering this session:**
Layer 1 live on 23 endpoints ✓. Layer 2 live on 12 endpoints + (claimed) gap on /guardrail and /score-iterate. Layer 3 live on 4 endpoints. Hold point assessment complete — proceed to Layer 3 authorised.

**Status leaving this session:**
Layer 3 wired to all 9 remaining public engine endpoints. Layer 2 gap claim corrected (see Corrections below). Deploy green on Vercel.

---

## Decisions Made

- **Proceeded with full scope (Option A) after surfacing architectural concern.** The concern: /guardrail and /score-iterate are agent-facing API-key endpoints called by arbitrary external agents. Injecting SageReasoning's Layer 3 project context into these endpoints means external callers get SageReasoning's internal project state on every call — minor IP exposure (R4) and potential reasoning pollution. Founder chose to proceed as scoped. Recorded as accepted risk.

- **Chose injection site per endpoint type.** Group A (6 endpoints using `runSageReason`) receive Layer 3 as an engine parameter, which injects automatically after practitioner context. Group B (3 endpoints calling `client.messages.create` directly) receive Layer 3 via manual append to the user message, matching the existing `/founder/hub` pattern.

- **Chose `'minimal'` level for /guardrail, `'condensed'` for all others.** Matches the session scope. Minimal is identity + ethical commitments only — appropriate for a safety gate. Condensed adds phase + recent decisions — appropriate for evaluative endpoints.

---

## Corrections to Yesterday's Hold Point Assessment

Two errors in the assessment I produced yesterday, surfaced while examining the actual code:

1. **Layer 2 was not "missing" on /guardrail or /score-iterate.** Both endpoints are `validateApiKey`-only (agent-facing). There is no user auth, no `userId` available, so `getPractitionerContext(userId)` is not applicable, not missing. The handoff line "Gap: /guardrail and /score-iterate missing Layer 2 — fix in this session" was therefore wrong. No fix applied; assessment corrected here.

2. **The "9 engine endpoints" are not architecturally uniform.** 6 use `runSageReason`; 3 (`score-document`, `score-scenario`, `score-iterate`) call the Anthropic client directly. Yesterday's assessment implied all 9 were engine-pattern endpoints needing one-param additions. The actual wiring required two different patterns. Work completed cleanly in both patterns, but the estimation of "nine route edits, each following the same pattern" was inaccurate.

Both are surfacing-in-implementation errors — the kind yesterday's code-only assessment couldn't catch without reading each file. Noted for future assessments: capability inventories drawn from high-level greps need one-file-deep verification before claims about gap shape.

---

## Status Changes

| Component | Before | After |
|---|---|---|
| Layer 3 on `/api/reason` | Not wired | **Wired, condensed** (via engine param) |
| Layer 3 on `/api/score` | Not wired | **Wired, condensed** (via engine param) |
| Layer 3 on `/api/score-decision` | Not wired | **Wired, condensed** (via engine param) |
| Layer 3 on `/api/score-social` | Not wired | **Wired, condensed** (via engine param) |
| Layer 3 on `/api/score-conversation` | Not wired | **Wired, condensed** (via engine param) |
| Layer 3 on `/api/guardrail` | Not wired | **Wired, minimal** (via engine param) |
| Layer 3 on `/api/score-document` | Not wired | **Wired, condensed** (manual injection) |
| Layer 3 on `/api/score-scenario` | Not wired | **Wired, condensed** (manual injection, scoring call only; generation call stays L1) |
| Layer 3 on `/api/score-iterate` | Not wired | **Wired, condensed** (manual injection, both initial + iteration calls) |
| Layer 2 on /guardrail | Claimed missing | **Not applicable** (API-key endpoint, no user auth) |
| Layer 2 on /score-iterate | Claimed missing | **Not applicable** (API-key endpoint, no user auth) |

**Layer 3 coverage now:** 13 endpoints total (4 prior + 9 new). All 9 public engine endpoints covered.

---

## Verification Record

```
TASK 1 — LAYER 3 WIRING (9 endpoints)
  Method:                    Read each route, show diff, apply via Edit
  Pre-flight checks:         runSageReason signature confirmed
                             (projectContext?: string | null at sage-reason-engine.ts:80,
                              auto-injection at :409-410)
                             getProjectContext import path confirmed
                             ('full' | 'summary' | 'condensed' | 'minimal' levels confirmed)
  Files modified:            9
  Verification post-edit:    9/9 endpoints have getProjectContext import + call
                             (grep count: 2 per file, 3 on score-iterate due to two call sites)

TASK 2 — LAYER 2 GAP CLOSE
  Result:                    Not applicable (see Corrections above).
  No edits made for Layer 2.

TASK 3 — DEPLOY
  Commit:                    1b61bc6 on origin/main
  Push:                      Performed by founder (sandbox has no git credentials)
  Vercel build:              Green ✓ (confirmed by founder)
  Typecheck:                 No founder-visible regressions reported
  Rollback:                  git revert 1b61bc6 — single commit, 9 files, +66/-22 lines

TASK 4 — TOKEN MEASUREMENT
  Result:                    Not captured this session.
                             Estimate (~150 tokens per call for condensed project context)
                             remains unverified. Carry forward.

OVERALL: SCOPE COMPLETE ✓ — with corrections noted above
```

---

## Files Touched This Session

**Modified (9 route files):**
- `website/src/app/api/reason/route.ts`
- `website/src/app/api/score/route.ts`
- `website/src/app/api/score-decision/route.ts`
- `website/src/app/api/score-social/route.ts`
- `website/src/app/api/score-conversation/route.ts`
- `website/src/app/api/score-document/route.ts`
- `website/src/app/api/score-scenario/route.ts`
- `website/src/app/api/score-iterate/route.ts`
- `website/src/app/api/guardrail/route.ts`

**No schema changes. No env var changes. No migration. No auth changes.**

---

## Carry-Over Register (Updated)

**Added this session:**

- **R17a ADR — bulk profiling prevention architecture decision.** Priority: P2 blocker. Must be designed before P2 coding begins. The manifest-designated Critical item.
- **R20a ADR — vulnerable user distress detection architecture decision.** Priority: P2 blocker. Must be designed before P2 coding begins. The manifest-designated Critical item.
- **Architectural question — agent-facing endpoints and project context.** /guardrail and /score-iterate now inject SageReasoning project state on every external-agent call. Revisit when building the Agent Trust Layer (P3) — customer agents reasoning about their own actions should probably not receive our project state. Options then: make Layer 3 conditional, add an opt-in flag, or strip project context from agent-facing endpoints entirely.

**Closed this session:**

- **Parallel-retrieval cutover quality review (Session B).** Closed — no regression observed across Sessions B, C, D, and Layer 3 wiring session. Re-open only if degradation observed in production.

- **Layer 3 token measurement.** Closed via offline measurement of
  `getProjectContext()` output length, same chars÷4 methodology as yesterday's
  ~150-token estimate.

  | Level | Chars | Estimated tokens | Yesterday's estimate | Delta |
  |---|---|---|---|---|
  | condensed (8 of 9 endpoints) | 557 | ~139 | ~150 | -7% ✓ within tolerance |
  | minimal (/guardrail only)    | 887 | ~222 | ~200 (implicit) | +11% |

  **Unexpected finding — `minimal` > `condensed`.** The 'minimal' level used
  on /guardrail produces ~60% MORE tokens than 'condensed' because it bundles
  the full identity paragraph and all four ethical commitments, while
  condensed is just phase + two recent decisions. Counter-intuitive —
  'minimal' suggests the lightest overhead but is in fact the heaviest Layer
  3 level wired this session.

  **R5 implication:** /guardrail is the agent-facing safety gate and will
  be the highest-volume endpoint at scale. Every external agent safety check
  pays ~222 tokens of Layer 3 overhead. Not a cost emergency at single-user
  traffic. Worth revisiting when P3 (Agent Trust Layer) redesigns agent-
  context boundaries — options then: strip /guardrail back to Layer 1 only,
  or build a truly-minimal 'identity' level (identity only, no ethical
  commitments, ~60 tokens).

  **Real `usage.input_tokens` from Anthropic API not captured this session.**
  Requires authenticated live call; would give TOTAL prompt input (Stoic
  Brain + domain + practitioner + project + user input) rather than Layer 3
  isolated. The offline measurement above answers the estimate-accuracy
  question cleanly. Deferring full-prompt token measurement to P4 (Stripe
  wiring) when per-call cost tracking becomes billing-critical anyway.

**Still open (restated):**

1. Topic-signal keyword matcher (72.5% overshoot, Session C) — deferred, wait for real-use data
2. Founder Hub R20a distress detection (low urgency, inherits from general R20a implementation)
3. Switch token logging to real `usage.input_tokens` (R5 accuracy) — becomes urgent at P4
4. Snapshot write cost review (~50–200ms per mentor request) — not urgent at single-user traffic
5. **R5 observation — /guardrail 'minimal' Layer 3 overshoots 'condensed'.**
   ~222 tokens vs ~139. Revisit at P3 (ATL) with option to introduce a truly-
   minimal 'identity-only' level, or strip /guardrail back to Layer 1 only.

---

## Founder Decision Needed

**Parallel-retrieval cutover quality review** (Session B carry-over) has no recent reference and no re-activation trigger. It's been quietly open for multiple sessions with no regression observed. Options:

- **Close it** — no regression observed across multiple sessions is itself the verification. Mark Closed in next session.
- **Schedule it** — allocate a specific next session to a structured review (comparison of structured vs legacy observations on real data).
- **Leave open indefinitely** — not recommended. It either matters or it doesn't; indefinite open is the worst state.

No action required this session. Decide at next session open.

---

## Blocked On

- Nothing currently blocked.

---

## Open Questions

- Same as carry-over #2 above (parallel-retrieval review decision).
- Agent-facing Layer 3 injection (new this session; revisit at P3).

---

## Rollback Plan

`git revert 1b61bc6`. Single commit, 9 files, +66/-22 lines. No schema, no env, no migration. All nine endpoints return to "no Layer 3" state gracefully. Downstream consumers (which don't depend on Layer 3) are unaffected.

---

## Decision Log Entry (for operations/decision-log.md if adopted)

```
## 15 April 2026 — Layer 3 Project Context Wired to 9 Public Engine Endpoints

**Decision:** Wire `getProjectContext()` to all 9 remaining public engine
endpoints: reason, score, score-decision, score-social, score-conversation,
score-document, score-scenario, score-iterate (all at 'condensed' level);
and guardrail (at 'minimal' level).

**Reasoning:** Layer 1 (Stoic Brain) and Layer 2 (practitioner context) were
already live across the engine endpoint suite. Layer 3 completes the
three-layer context architecture: callers get situational awareness of
project state in addition to philosophical grounding and personal context.
Engine infrastructure was already in place (projectContext param, loader,
static baseline) — remaining work was wiring only. Guardrail uses 'minimal'
level because a safety gate benefits from ethical commitments but not from
phase/tensions. Score-scenario's generation call deliberately omits Layer 3
(creative output, not evaluative).

**Accepted risk:** /guardrail and /score-iterate are agent-facing API-key
endpoints. Layer 3 injection exposes SageReasoning project state to external
callers. Minor IP exposure and potential reasoning pollution. Deferred
architectural fix (conditional injection / opt-in flag) to P3 (Agent Trust
Layer) where agent-context boundaries are being worked more broadly.

**Corrections to prior assessment:** Layer 2 was claimed missing on
/guardrail and /score-iterate; actually not applicable (API-key endpoints
have no user auth). The "9 engine endpoints" turned out to be 6 runSageReason
+ 3 direct-Anthropic, not architecturally uniform. Work completed cleanly
in both patterns.

**Rules served:** R0 (situational awareness strengthens oikeiosis reasoning
by letting the framework consider project state when advising on actions).

**Impact:** 9 files modified. ~150 tokens added to every call on these
endpoints (unmeasured this session — estimate only). Layer 3 coverage
increases from 4 endpoints to 13. All public engine endpoints now serve
L1 + L2 + L3 (Layer 2 where user auth is present).

**Status:** Adopted. Deployed on commit 1b61bc6 (Vercel build green).
```

---

## Next Session Recommendation

Bounded scope:

1. **Decide on parallel-retrieval carry-over** (close / schedule / leave — 5 minutes).
2. **Capture real `usage.input_tokens` on one Layer 3-wired endpoint** — validates the ~150-token estimate. Observe opportunistically on any natural call; do not dedicate a session to it.
3. **Consider: begin P2 ADR work** — R17a and R20a are now on the register as P2 blockers. The manifest says architecture decisions for these come before coding. Could start as a next-session assessment if you're ready to move P0 → P1 formally.

Not in scope for next session unless founder decides otherwise: P2 implementation, Stripe/metering, ATL build, mentor tuning.

---

## Build Status Summary

| Component | Status |
|---|---|
| MENTOR_CONTEXT_V2 | Live, Verified ✓ (unchanged) |
| Layer 1 (Stoic Brain) | Live on 23 endpoints ✓ (unchanged) |
| Layer 2 (Practitioner Context) | Live on 12 endpoints ✓ (unchanged; N/A on 2 agent-facing endpoints) |
| Layer 3 (Project Context) | **Live on 13 endpoints** ✓ (was 4; +9 this session) |
| `persona.ts` buildAfterPrompt cleanup | Live ✓ (deployed earlier today) |
| P0 hold point assessment | Complete ✓ |
| P0 exit criterion 6 (startup toolkit interface) | Still open — not blocking |
