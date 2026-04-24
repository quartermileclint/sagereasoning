# Growth Channel Wiring Fix — Handoff

**Status:** Scoped + Designed (0a vocabulary). Not yet Scaffolded.
**Risk classification:** Standard (0d-ii). See §6.
**Applies to:** Sage Growth agent.
**Pattern source:** PR1 — mirrors the method proven on the private mentor,
designed for Support, and designed for Tech.
**Author:** AI, 20 April 2026, in-session prior to scaffold.

---

## 1. Purpose

The Growth agent (invoked as a chat persona through `/api/founder/hub`) is
the marketing and positioning voice for the operator. Today it answers from
a six-domain static brain (positioning, audience, content, devrel,
community, metrics) plus a persona prompt with seven "growth reasoning
upgrades." It has no view of what has already been done in the growth
domain, and no feedback signal about what is landing or missing in the
market.

This handoff scopes and designs two broken input channels to fix that gap.
Both channels are new loaders in the same folder as the existing
`growth-brain-loader.ts` so the wiring surface is familiar and contained.

The pattern is identical to Tech's in structure. Growth's case is the
**cleanest** of the three so far — both channels are additive, neither
touches safety-critical surfaces, and Channel 2 is expected to be mostly
empty at P0. Classification is **Standard**, not Elevated.

---

## 2. Broken channels (current state)

### Channel 1 — Growth Interaction Signals

**Today:** Growth has no visibility into what growth-domain decisions and
actions have already been taken. There is:

- A global decision log at `operations/decision-log.md` — contains every
  consequential decision across all domains, unfiltered. Injecting the
  whole thing would be noise for Growth and token-expensive.
- Dozens of session handoffs in `operations/handoffs/` and
  `operations/session-handoffs/` — contain growth-relevant events
  (positioning decisions, page copy revisions, channel opens) interleaved
  with engineering, safety, and mentor work.
- No growth-specific log.

Consequence: Growth risks recommending things already decided or tried.
A founder asking "what should we do about positioning?" may get a
suggestion that was explicitly rejected two sessions ago.

### Channel 2 — Growth Observation Synthesis

**Today:** Growth has no synthesised feedback from the market. There is:

- No blog-post analytics table. The `analytics_events` table records
  product events (e.g. `decision_score_v3`, `guardrail_check`) — not
  content performance.
- No developer-discovery feed. No record of agent-card.json fetches, no
  API key provisioning log filtered for acquisition signal.
- No community-feedback file. No Discord / forum / email log.
- No existing file where the founder captures "I noticed X on LinkedIn"
  or "a developer asked about Y."

Consequence: Growth advises on strategy without feedback. Every
recommendation is a priori.

**Expected at P0:** this channel is mostly empty. That is acceptable
and expected. The design wires the channel now so it populates as data
arrives, becoming critical at P1+.

---

## 3. Design (status: Designed, 0a vocabulary)

### 3.1 Channel 1 — Growth Interaction Signals

**Data source:** A single hand-maintained markdown file.

- **New file:** `operations/growth-actions-log.md`
- **Format:** Front-matter (last updated, maintainer), then a single
  reverse-chronological list of growth-domain actions. Each entry:
  - Date (ISO).
  - Domain tag (one of: `positioning` / `audience` / `content` /
    `devrel` / `community` / `metrics` / `pricing` / `messaging`).
  - Action type: `decided` / `drafted` / `shipped` / `tested` /
    `opened` / `paused` / `reversed`.
  - One-line summary.
  - Outcome (if known) or `awaiting_signal`.
  - Link to decision-log entry or handoff if one exists.
- **Maintenance contract:** Founder updates the file at session close
  when any growth-domain action happens. The AI may propose new entries
  at session close when a session produces one, but does not overwrite
  without approval (user preference: governing documents preserved
  before change).

**Rolling window.** The loader returns the last 90 days by default. Older
entries remain in the file for audit but are not injected into context.
This mirrors the mentor `rolling_window` pattern and bounds token cost.

**Loader (new file):**
`website/src/lib/context/growth-actions-log.ts`

```ts
// Reads operations/growth-actions-log.md at request time, parses
// front-matter and entries, returns a formatted context block scoped
// to the last 90 days. Read-only. No Supabase dependency.

export type GrowthDomain =
  | 'positioning' | 'audience' | 'content' | 'devrel'
  | 'community' | 'metrics' | 'pricing' | 'messaging';

export type GrowthActionType =
  | 'decided' | 'drafted' | 'shipped' | 'tested'
  | 'opened' | 'paused' | 'reversed';

export interface GrowthAction {
  date: string;               // ISO
  domain: GrowthDomain;
  action_type: GrowthActionType;
  summary: string;
  outcome: string | 'awaiting_signal';
  reference?: string;         // link to decision log or handoff
}

export interface GrowthActionsBlock {
  as_of: string;
  window_days: number;
  actions: GrowthAction[];
  formatted_context: string;
}

export async function getGrowthActionsLog(
  options?: { windowDays?: number }
): Promise<GrowthActionsBlock>;
```

**Failure mode:** If the file is missing or malformed, the loader returns
a stub with `actions: []` and `formatted_context` = `"Growth actions log
unavailable. Growth is answering without prior-action context. Update
operations/growth-actions-log.md to restore this signal."`. Growth is
told it is answering blind — better than silent fallback.

### 3.2 Channel 2 — Growth Observation Synthesis

**Data source:** A single hand-maintained markdown file, expected to be
mostly empty at P0.

- **New file:** `operations/growth-market-signals.md`
- **Format:** Front-matter (last updated, maintainer), then four
  sections:
  - **## Content Performance** — observations about published content
    (blog posts, landing pages, social posts). Freeform; entry shape:
    date, piece reference, observation, signal strength
    (strong / weak / anecdotal).
  - **## Developer Discovery** — agent-side signals (API key sign-ups,
    agent-card.json fetches the founder has been told about, developer
    questions in DMs or forums).
  - **## Community Feedback** — direct feedback from practitioners
    (emails, tweets, conversations).
  - **## Competitive / Market Observations** — noticed positioning
    changes by adjacent companies, new entrants, shifts in language
    used in the space.
- **Maintenance contract:** Founder appends at session close or on
  observation. AI does not invent signals — if nothing has been
  observed, sections remain empty with an explicit "no signal yet"
  placeholder dated to the last review.

**Rolling window:** last 120 days by default. Broader than Channel 1
because market signals accumulate slowly. Below 5 total signals across
all sections, the loader widens to all available entries (avoids
returning "no signal yet" when the file has sparse but all-historical
data).

**Loader (new file):**
`website/src/lib/context/growth-market-signals.ts`

```ts
// Reads operations/growth-market-signals.md at request time. Handles
// the sparse-at-P0 case gracefully: if all four sections are empty,
// returns an explicit "no market signals captured yet" block rather
// than silent absence. Read-only. No Supabase dependency.

export type SignalStrength = 'strong' | 'weak' | 'anecdotal';

export interface MarketSignal {
  date: string;
  section: 'content_performance' | 'developer_discovery'
    | 'community_feedback' | 'market_observations';
  reference?: string;
  observation: string;
  strength: SignalStrength;
}

export interface MarketSignalsBlock {
  as_of: string;
  signals: MarketSignal[];
  formatted_context: string;
  is_sparse: boolean;        // true if <5 signals in window
}

export async function getGrowthMarketSignals(
  options?: { windowDays?: number }
): Promise<MarketSignalsBlock>;
```

**Sparse-state handling.** `is_sparse = true` produces a block that
explicitly tells Growth: "Market signals captured so far: [n]. This is
expected at P0. Base recommendations on Growth Brain static context
and flag market-feedback gaps when they matter." No silent fallback.

### 3.3 Injection point

`website/src/app/api/founder/hub/route.ts`, the `case 'growth'` branch
(line 311 onward). Both new blocks are inserted after the seven
"GROWTH REASONING UPGRADES" and before the existing `${brainContext}`
injection. Order:

1. Persona prompt (existing).
2. Growth reasoning upgrades (existing — 7 bullets).
3. **(new) Growth actions log block.**
4. **(new) Growth market signals block.**
5. Growth brain static context (existing, `getGrowthBrainContext(depth)`).

### 3.4 No verification harness drift-check needed

Unlike Tech, Growth's two channels do not need a drift-detection step.
Both are single-source hand-maintained files with no parallel code
representation. A verification harness is still produced to confirm
the loaders parse correctly and inject non-empty context when data is
present.

---

## 4. Files that will be touched

**New files:**

- `operations/growth-actions-log.md` (content: stub — front-matter + a
  single first entry back-dated to today: "20 April 2026 · positioning ·
  decided · Growth wiring fix designed (handoff) · awaiting_signal ·
  operations/handoffs/growth-wiring-fix-handoff.md".)
- `operations/growth-market-signals.md` (content: stub — front-matter +
  four empty sections with "no signal yet (as of 20 April 2026)"
  placeholders.)
- `website/src/lib/context/growth-actions-log.ts` (loader, ~140 lines)
- `website/src/lib/context/growth-market-signals.ts` (loader, ~140 lines)
- `scripts/growth-wiring-verification.mjs` (harness, ~100 lines)

**Modified files:**

- `website/src/app/api/founder/hub/route.ts` — new imports at top; in
  the `case 'growth'` branch, await both loaders and inject their
  `formatted_context` as new system-block strings. Branch becomes async
  with respect to these calls (hub handler is already async). No other
  branch (`ops`, `tech`, `support`, `mentor`) is touched in this session
  per PR1.

**Not touched (out of scope):**

- `website/src/lib/context/growth-brain-loader.ts` — untouched.
- `website/src/data/growth-brain-compiled.ts` — untouched.
- Any `sage-mentor/` file — untouched.
- Any other agent persona branch in `/api/founder/hub` — untouched (PR1).
- Any Supabase migration — not needed, no schema change.
- Any `analytics_events` query — deferred (see Choice 3 below).
- Any auth / cookie / deploy-config surface — not needed.

---

## 5. Choice points for the next session

The next session opens by asking the founder to resolve these before any
scaffold work begins. Present as options with reasoning, not prescriptions.

### Choice 1 — Actions-log starting state

- **Option A (recommended):** Seed with one back-dated entry (the wiring
  fix itself) plus the front-matter. Proves the loader parses a
  populated file on first run.
- **Option B:** Start with front-matter only and "no entries yet"
  placeholder. Honest but means the first loader run returns an empty
  block — founder verifies the sparse-state message, not the
  populated one.
- **Option C:** Back-date a retrospective pass — founder recalls the
  last ~20 growth-domain decisions from decision-log.md and handoffs.
  Most value, most time cost. Scope-expanding. Recommend against unless
  founder has explicit appetite.

### Choice 2 — Market-signals starting state

- **Option A (recommended):** Empty stub with "no signal yet" in each
  section. Honest. The `is_sparse = true` path is exercised on first
  run. Matches what Growth actually knows at P0.
- **Option B:** Seed with any observations the founder has casually
  mentioned in past sessions. Risks the AI fabricating signals from
  vague recollection. Recommend against.

### Choice 3 — Analytics-events Supabase query: include or defer?

- **Option A (recommended):** Defer. The two markdown files are the
  single source of truth for both channels in this session. An
  `analytics_events` query adds a Supabase read to the request path
  with its own cost and failure modes. Design it in a later session
  once a specific growth-relevant event_type pattern is identified.
- **Option B:** Include a bounded query (e.g., last 30 days, specific
  event_types flagged as growth-signal). Adds loader complexity and
  elevates Channel 2 from Standard to Elevated. Recommend against at
  P0.

### Choice 4 — Extend pattern to other chat personas in this session?

- **Option A (recommended):** No. PR1 — single-persona proof before
  rollout. Growth is the third persona wiring; Ops is the only one
  remaining. Prove Growth, then Ops as a follow-up session.
- **Option B:** Bundle Growth + Ops in one session because the pattern
  is now mechanical. PR1 violation. Recommend against.

### Choice 5 — Rolling-window defaults (90 / 120)

- **Option A (recommended):** 90 days for actions, 120 days for
  market signals. Current design. Tunable per request via the options
  parameter.
- **Option B:** Same window (e.g., 90/90 or 120/120) for both. Simpler
  mental model. Minor cost either way.
- **Option C:** No rolling window — return everything. Works at P0
  because data is sparse; scales poorly at P1+. Recommend against.

---

## 6. Risk classification — 0d-ii

| Sub-item | Risk | Reason |
|---|---|---|
| Channel 1 wiring | **Standard** | Additive read path, new file dependency only, non-safety-critical |
| Channel 2 wiring | **Standard** | Additive read path, sparse-at-P0, non-safety-critical |
| Injection into `case 'growth'` branch | **Standard** | Additive system blocks, no change to existing persona prompt or brain |
| Verification harness (.mjs) | **Standard** | Read-only, harness only |
| Markdown stub files | **Standard** | New content files, no code path |

**No Elevated or Critical sub-items.** Growth is not a safety-critical
surface (PR6 applies to the distress classifier and Zone 2/3, which
this wiring does not touch). No auth, session, cookie, encryption, or
deploy-config change. The Tech wiring raised to Elevated because of a
drift-detection dependency on `/TECHNICAL_STATE.md`; Growth has no
parallel structural coupling.

**Rollback per sub-item:**

- Injection changes: revert the `case 'growth'` branch to pre-wiring
  HEAD. Trivial `git revert` on the `hub/route.ts` file.
- Loaders: delete the two new files under `website/src/lib/context/`.
  No other code imports them outside the `case 'growth'` branch.
- Markdown files: delete or leave in place — harmless if the loaders
  are reverted.
- Harness: delete the `.mjs` file.

**Approval required before deploy:** Founder gives explicit "proceed"
after hearing the risk summary and rollback paths. Standard-risk
changes under 0d-ii require acknowledgement, not named-risk approval.

---

## 7. Verification steps (after wiring, before close)

Founder verifies by running the harness and reading its output, plus a
live probe against the Growth persona.

1. **Push to Vercel. Wait for Vercel Green.** (Type-check confirmation.)
2. **Run the harness locally:**
   ```
   node scripts/growth-wiring-verification.mjs
   ```
   Expected output (shape, verbatim phrasing provided in the prompt):
   - Channel 1 parses. Prints the one seeded action (or empty-state
     message, depending on Choice 1).
   - Channel 2 parses. Prints sparse-state message (expected at P0,
     per Choice 2).
   - Each loader's `formatted_context` prints to the terminal for
     founder-eye inspection.
3. **Live probe.** Open `/private-mentor`, pick Growth persona, ask
   exactly:
   `What have we already decided about positioning, and what market
   signals have we captured so far?`
   Expected: Growth replies referencing the one seeded action (or the
   empty-state message) from Channel 1, and references the sparse
   market-signals state from Channel 2. If Growth invents an answer
   without referencing the injected blocks, the wiring is **not
   Verified**. Revert.

---

## 8. Out-of-scope guardrails

- No change to `growth-brain-loader.ts` or the static growth brain data.
- No extension to ops / tech / support / mentor personas in this session.
- No new Supabase table, no migration, no RLS change.
- No `analytics_events` query wired into Channel 2 in this session
  (Choice 3, default Option A).
- No change to `runSageReason`, `sage-reason-engine.ts`, or any endpoint
  that calls it.
- No auth / cookie / session / encryption / deploy-config surface (AC7
  / PR1 standing-Critical — if one appears, stop and apply 0c-ii).
- No change to the distress classifier, Zone 2 classification, Zone 3
  redirection, or their wrappers (PR6 — always Critical).
- No retrospective back-fill of the actions log from historical decision
  log entries (Choice 1 default is single seed entry only).
- No AI-written market signals. Market signals are founder-observed only.

If the next session notices something else that should change, flag it
with "I'd push back on this" or "this is a limitation" — do not silently
expand.

---

## 9. Decision-log plan (PR7)

Session-close handoff will log the five choice-point decisions:

- D-Growth-1: Actions-log starting state.
- D-Growth-2: Market-signals starting state.
- D-Growth-3: Analytics-events Supabase query deferral.
- D-Growth-4: Pattern extension to Ops persona.
- D-Growth-5: Rolling-window defaults.

Each entry records: decision, reasoning, alternatives considered, what
would trigger revisiting. Format matches PR7.

---

## 10. Knowledge-gap candidates (PR5)

The Growth wiring would be the **third observation** of the file-based
context loader pattern (first was Tech Channel 1, second was Tech
Channel 2). Under PR8, tacit-knowledge findings become process on
third recurrence. Candidate for promotion at Growth session close:

- **KG candidate:** "File-based context loaders for chat-persona
  agents." Pattern: `operations/<agent>-<signal>.md` as single source
  of truth, loader in `website/src/lib/context/<agent>-<signal>.ts`,
  failure-mode stub with self-disclosing message, injected after
  persona prompt and persona upgrades, before the static brain block.
  If this recurs in Ops wiring, promote at Ops close instead.

Growth also introduces one genuinely new pattern that may warrant a
first-observation entry:

- **Sparse-state disclosure.** The `is_sparse` flag on Channel 2's
  block is the first instance of a loader explicitly telling the agent
  "the data you would normally expect is absent; here is why." If
  this pattern is needed elsewhere, log as second observation.

---

## 11. Today's verified facts (as of 20 April 2026, this session)

Not assumptions — findings from this session's exploration:

- `growth-brain-loader.ts` exists at
  `website/src/lib/context/growth-brain-loader.ts`, exports
  `getGrowthBrainContext(depth: 'quick' | 'standard' | 'deep')`, with
  six domains: positioning, audience, content, devrel, community,
  metrics.
- Growth is invoked as a chat persona in the `case 'growth'` branch of
  `/api/founder/hub/route.ts`, starting line 311, running through
  ~line 352 (`${brainContext}` injection).
- Seven "GROWTH REASONING UPGRADES" are baked into the persona prompt
  covering Zone 1/2/3 scope, dual-audience copy, R18 language, cost
  discipline (R5), three growth tilts (philodoxia / penthos /
  aischyne), founder narrative as asset, Startup Preparation Toolkit
  status.
- No `operations/growth-actions-log.md` file exists.
- No `operations/growth-market-signals.md` file exists.
- `operations/decision-log.md` exists but is unfiltered (all domains
  interleaved).
- `analytics_events` table exists but records product events, not
  growth-relevant performance or discovery signals.
- No blog-post performance table exists in Supabase migrations.
- No community-feedback table or file exists.
- The four chat-persona branches (`ops`, `tech`, `growth`, `support`)
  in `/api/founder/hub` share the same injection pattern: persona
  prompt + N reasoning upgrades + `${brainContext}`. Each branch
  can be wired independently without affecting the others (PR1
  single-persona rollout is straightforward).

These are the factual ground from which the next session proceeds.
