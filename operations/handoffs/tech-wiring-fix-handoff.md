# Tech Channel Wiring Fix — Handoff

**Status:** Scoped + Designed (0a vocabulary). Not yet Scaffolded.
**Risk classification:** Elevated (0d-ii). See §6.
**Applies to:** Sage Tech agent.
**Pattern source:** PR1 — mirrors the method proven on the private mentor and designed for Support.
**Author:** AI, 20 April 2026, in-session prior to scaffold.

---

## 1. Purpose

The Tech agent (invoked as a chat persona through `/api/founder/hub`) is meant
to be the engineering voice for the operator. Today it answers from a static
compiled brain plus a persona prompt. It has no view of the running system
and no file-level map of the endpoints it is supposedly stewarding.

This handoff scopes and designs two broken input channels that need wiring
before the Tech persona can give useful engineering answers. Both channels
are new loaders in the same folder as the existing `tech-brain-loader.ts` so
the wiring surface is familiar and the blast radius is contained.

The pattern is identical to Support's wiring fix in structure: exploration
→ design → scaffold → wire → verify → close. The difference is risk level.
Nothing in Tech's wiring touches the safety-critical surface (distress
classifier, SafetyGate, Zone 2/3). Classification is **Elevated**, not
Critical.

---

## 2. Broken channels (current state)

### Channel 1 — Live System State / Known Issues

**Today:** Tech has no signal at all about what is currently broken, degraded,
or under remediation in production. There is:

- No error-log table (`analytics_events` records events, not errors — it's
  the write path for the products, not a log of failures).
- No Vercel-log feed reachable from inside the app (Vercel deployment logs
  are not queryable programmatically from the serverless runtime in this
  project's current plan).
- No hand-maintained known-issues file (`operations/` has debriefs, handoffs,
  audits, decisions — no `known-issues.md`, no `tech-debt.md`, no
  `incidents.md`).

Consequence: Tech answers questions about "what's broken right now" from
guesswork. A founder asking "is anything currently failing?" gets a confident
but uninformed reply.

### Channel 2 — Endpoint Inventory Map

**Today:** Tech is told in its persona prompt that "8 human-facing POST routes"
exist (R20a perimeter language) and that `runSageReason` is "the central
reasoning engine." It is not given the file-level map of which endpoints
exist, what each does, what context layers each injects, or which are clean
vs carrying known issues.

A canonical map **already exists** as `/TECHNICAL_STATE.md` (792 lines,
last hand-updated 11 April 2026). But it is:

1. **Not loaded into Tech's context.** Tech never sees it.
2. **Drifted from reality.** It lists 9 `runSageReason` endpoints under §2.
   A current grep of `website/src/app/api/**/route.ts` finds **10** route
   files calling `runSageReason`: `score`, `reason`, `score-decision`,
   `score-social`, `score-document`, `score-conversation`, `guardrail`,
   `mentor-baseline`, `mentor-baseline-response`, `mentor-journal-week`.
   TECHNICAL_STATE.md §2 lists `score-scenario`, `score-iterate`, `evaluate`
   which the grep did not surface in the same pass, and omits the three
   mentor-* routes. Either the file or the code has drifted since 11 April
   2026.
3. **Without a maintenance contract.** Nothing in the session protocols or
   manifest ties endpoint-file changes to a TECHNICAL_STATE.md update.

Consequence: Tech cannot answer "which endpoints inject Layer 2b?" or
"which endpoints are on MODEL_DEEP?" from memory, and the one authoritative
document that could answer those questions is both invisible to it and
partly stale.

**The 9-vs-10 discrepancy is direct evidence of why Channel 2 is needed.**
Tech has no way to notice this drift today. With Channel 2 wired and a
verification harness in place, drift surfaces every time the harness runs.

---

## 3. Design (status: Designed, 0a vocabulary)

### 3.1 Channel 1 — Live System State / Known Issues

**Data source:** A single hand-maintained markdown file.

- **New file:** `operations/tech-known-issues.md`
- **Format:** Front-matter (updated date, maintainer), then two sections:
  - **## Current Issues** — bullet list of: title, severity
    (catastrophic / significant / minor / cosmetic, per PR9 tiers), affected
    surface, date first observed, status (open / investigating / mitigated /
    resolved), rollback or workaround if any.
  - **## Recently Resolved (last 30 days)** — same shape, with
    resolution date and short post-mortem link if one exists.
- **Maintenance contract:** Founder updates the file at session close when
  any issue is observed, any change goes live, or any deploy fails. The
  AI may propose edits but does not overwrite without approval (user
  preference: governing documents preserved before change).

**Vercel-log note.** Vercel logs are **out of scope for this channel.**
The runtime cannot query them from inside a serverless function, and pulling
them from the Vercel API would require a deploy-token secret, which would
pull this work into Critical (auth/secret surface, AC7). The deliberate
choice is: the known-issues file is the single source of truth, manually
kept, with whatever Vercel observations the founder has relayed written in.
Revisit post-launch if operational load makes manual upkeep unworkable.

**Loader (new file):**
`website/src/lib/context/tech-system-state.ts`

```ts
// Reads operations/tech-known-issues.md at request time, parses front-matter
// (date, maintainer) and the two sections, returns a formatted context block.
// Never imports code from sage-mentor/. Read-only.

export interface TechSystemStateBlock {
  as_of: string;              // front-matter date
  maintainer: string;         // front-matter maintainer
  current_issues: Array<{
    title: string;
    severity: 'catastrophic' | 'significant' | 'minor' | 'cosmetic';
    affected_surface: string;
    first_observed: string;
    status: 'open' | 'investigating' | 'mitigated' | 'resolved';
    workaround?: string;
  }>;
  recently_resolved: Array<{ /* same shape + resolution_date */ }>;
  formatted_context: string;  // ready-to-inject system-block string
}

export async function getTechSystemState(): Promise<TechSystemStateBlock>;
```

**Failure mode:** If the file is missing or malformed, the loader returns a
stub with `current_issues: []` and `formatted_context` = `"System state
signal unavailable. Tech is answering without current-issues context.
Update operations/tech-known-issues.md to restore this signal."`. Tech is
told it is answering blind — better than silent fallback.

**Injection point:**
`website/src/app/api/founder/hub/route.ts`, the `case 'tech'` branch
(~line 253–309). The system-state block is prepended to the existing
persona prompt as an additional system message, before the tech-brain
context. Order:

1. Persona prompt (existing).
2. Technical reasoning upgrades (existing — 10 bullets).
3. **(new) System state block.**
4. **(new) Endpoint inventory block** — Channel 2.
5. Tech brain context (existing, `getTechBrainContext(depth)`).

### 3.2 Channel 2 — Endpoint Inventory Map

**Data source:** `/TECHNICAL_STATE.md` at repo root. **Existing file.**
No new authoritative file created — the one that exists is adopted and
its maintenance contract is made explicit.

**Loader (new file):**
`website/src/lib/context/tech-endpoint-inventory.ts`

```ts
// Reads /TECHNICAL_STATE.md at request time, parses §2 (runSageReason
// endpoints) and §3 (mentor family) into a structured inventory, returns
// a formatted context block with the 'as of' date pulled from the file
// header. Read-only. Never imports from sage-mentor/.

export interface EndpointInventoryEntry {
  route: string;              // e.g. '/api/score'
  method: string;             // e.g. 'POST'
  purpose: string;            // first paragraph of 'Purpose:' line
  auth: string;
  rate_limit: string | null;
  depth: string;
  model: string;
  context_layers: string[];   // parsed from 'Context layers:' line
  status: 'Scoped' | 'Designed' | 'Scaffolded' | 'Wired' | 'Verified' | 'Live';
  side_effects: string | null;
  notes: string | null;
  family: 'runSageReason' | 'mentor' | 'assessment' | 'other';
}

export interface EndpointInventoryBlock {
  as_of: string;
  endpoints: EndpointInventoryEntry[];
  formatted_context: string;
  drift_warning: string | null;  // see §3.3
}

export async function getEndpointInventory(): Promise<EndpointInventoryBlock>;
```

**Injection point:** Same `case 'tech'` branch as Channel 1. Order is above
(step 4).

### 3.3 Verification harness — drift detection

**New file:** `scripts/tech-wiring-verification.mjs`

Founder-runnable Node script. Three checks:

1. **Channel 1 parse.** Load `operations/tech-known-issues.md` through the
   Channel 1 loader. Print the structured output. Expected shape provided
   in the prompt.
2. **Channel 2 parse.** Load `/TECHNICAL_STATE.md` through the Channel 2
   loader. Print a summary (count of endpoints in each family, 'as of'
   date).
3. **Drift check.** Grep `website/src/app/api/**/route.ts` for files
   containing the literal string `runSageReason(`. Compare the set of
   matched routes against the `family: 'runSageReason'` entries from
   Channel 2. Print:
   - **Green:** inventory matches reality.
   - **Drift:** inventory lists routes that don't exist in code, or code has
     routes not in the inventory. Print both sets and a message:
     "TECHNICAL_STATE.md §2 is out of date. Update before proceeding."

**Today's baseline:** The harness will report drift on its first run because
TECHNICAL_STATE.md §2 and the codebase are already out of sync (see §2
above). That is expected. Reconciling TECHNICAL_STATE.md against the real
endpoint list is the **first task after wiring is Verified** — not part of
the wiring session.

---

## 4. Files that will be touched

**New files:**

- `operations/tech-known-issues.md` (content: stub — "No known issues" + empty
  sections, dated today)
- `website/src/lib/context/tech-system-state.ts` (loader, ~120 lines)
- `website/src/lib/context/tech-endpoint-inventory.ts` (loader, ~180 lines)
- `scripts/tech-wiring-verification.mjs` (harness, ~120 lines)

**Modified files:**

- `website/src/app/api/founder/hub/route.ts` — new imports at top; in the
  `case 'tech'` branch, call both loaders and inject their `formatted_context`
  as new system blocks. No other branch (`ops`, `growth`, `support`) is
  touched in this session per PR1.

**Not touched (out of scope):**

- `website/src/lib/context/tech-brain-loader.ts` — untouched.
- `website/src/data/tech-brain-compiled.ts` — untouched.
- Any `sage-mentor/` file — untouched.
- Any other agent branch in `/api/founder/hub` — untouched (PR1 single-endpoint
  proof).
- Any Supabase migration — not needed, no schema change.
- Any auth / cookie / deploy-config surface — not needed.

---

## 5. Choice points for the next session

The next session opens by asking the founder to resolve these before any
scaffold work begins. Present as options with reasoning, not prescriptions.

### Choice 1 — Known-issues file: start empty or prefilled?

- **Option A (recommended):** Start empty with a dated header and placeholder
  "No known issues at [date]". Simplest. Honest. Matches what Tech actually
  knows.
- **Option B:** Prefill with the drift warning for TECHNICAL_STATE.md §2 as
  the first known issue. Couples Channel 1 and Channel 2's first real use.
- **Option C:** Prefill with a broader sweep (e.g., the silent-swallow items
  from Session 14's Option 4 menu if they were ever adopted). Expands scope.

### Choice 2 — TECHNICAL_STATE.md reconciliation: now or after wiring?

- **Option A (recommended):** Wire first, run the harness, let it report
  drift, reconcile TECHNICAL_STATE.md as a separate follow-up session. Keeps
  this session bounded.
- **Option B:** Reconcile TECHNICAL_STATE.md inside this session before
  wiring. Clean dataset at wiring time, but doubles scope and risks a
  partial close.
- **Option C:** Freeze TECHNICAL_STATE.md as-is, wire Channel 2 to ignore
  drift entirely. Loses the drift-detection benefit — recommend against.

### Choice 3 — Analytics-events error signal: include or defer?

- **Option A (recommended):** Defer. The known-issues file is the single
  source of truth for Channel 1 in this session. Adding an `analytics_events`
  query for recent errors is a second signal with its own failure modes
  (query cost, classification logic, RLS). Design it in a later session
  once Channel 1 is Verified.
- **Option B:** Include a bounded query (e.g., last 24h, specific
  event_types known to be error markers). Adds ~80 lines of loader code
  and a Supabase read in the request path. Elevates Channel 1 complexity.

### Choice 4 — Extend pattern to other chat personas (ops / growth / support)?

- **Option A (recommended):** No, not in this session. PR1 — single-endpoint
  proof before rollout. Prove on Tech, then extend one persona per session.
- **Option B:** Extend in the same session if scaffolding is mechanical.
  PR1 violation. Recommend against.

---

## 6. Risk classification — 0d-ii

| Sub-item | Risk | Reason |
|---|---|---|
| Channel 1 wiring | **Elevated** | New read path, new file dependency, non-safety-critical |
| Channel 2 wiring | **Elevated** | New read path, adds a file-parse dependency on /TECHNICAL_STATE.md |
| Injection into `case 'tech'` branch | **Elevated** | Changes a live chat persona's system prompt composition |
| Verification harness (.mjs) | **Standard** | Read-only, harness only |
| Known-issues stub file | **Standard** | New content file, no code path |

**No Critical sub-items.** The Tech persona is not a safety-critical surface
(PR6 applies to the distress classifier and Zone 2/3, which this wiring does
not touch). No auth, session, cookie, encryption, or deploy-config change.

**Rollback per sub-item:**

- Injection changes: revert the `case 'tech'` branch to pre-wiring HEAD.
  Trivial `git revert` on the `hub/route.ts` file.
- Loaders: delete the two new files under `website/src/lib/context/`. No
  other code imports them outside the `case 'tech'` branch.
- Known-issues file: delete or leave in place — harmless if the loader is
  reverted.
- Harness script: delete the `.mjs` file.

**Approval required before deploy:** Founder gives explicit "proceed" after
hearing the risk summary and rollback paths. For Elevated changes under
0d-ii, approval does not need to name each specific risk (that is the
Critical protocol); the founder just needs to have heard the rollback path.

---

## 7. Verification steps (after wiring, before close)

Founder verifies — not by reading TypeScript but by running the harness and
reading its output.

1. **Push to Vercel. Wait for Vercel Green.** (Type-check confirmation.)
2. **Run the harness locally:**
   ```
   node scripts/tech-wiring-verification.mjs
   ```
   Expected output (shape, verbatim phrasing provided in the prompt):
   - Channel 1 parses. Prints "No known issues" if the stub is empty.
   - Channel 2 parses. Prints endpoint count per family and "as of" date.
   - Drift check runs. Prints either **GREEN** (match) or **DRIFT** with
     the specific route-set difference.
3. **Live probe.** Open `/private-mentor`, pick Tech persona, ask exactly:
   `Can you tell me what endpoints exist right now and whether any are
   flagged as a known issue?`
   Expected: Tech replies with a structured list derived from the inventory
   block and — if the known-issues file is empty — states that no issues
   are currently flagged. If Tech invents an answer without referencing
   the injected blocks, the wiring is **not Verified**. Revert.

---

## 8. Out-of-scope guardrails

- No change to `tech-brain-loader.ts` or the static tech brain data.
- No extension to ops / growth / support personas in this session.
- No new Supabase table, no migration, no RLS change.
- No change to `runSageReason`, `sage-reason-engine.ts`, or any endpoint
  that calls it.
- No auth / cookie / session / encryption / deploy-config surface (AC7 /
  PR1 standing-Critical — if one appears, stop and apply 0c-ii).
- No reconciliation of TECHNICAL_STATE.md §2 drift inside the wiring
  session (Choice 2, Option A).
- No `analytics_events` query wired into Channel 1 in this session
  (Choice 3, Option A).

If the next session notices something else that should change, flag it
with "I'd push back on this" or "this is a limitation" — do not silently
expand.

---

## 9. Decision-log plan (PR7)

Session-close handoff will log the four choice-point decisions:

- D-Tech-1: Known-issues file start state.
- D-Tech-2: TECHNICAL_STATE.md reconciliation timing.
- D-Tech-3: Analytics-events error signal inclusion.
- D-Tech-4: Pattern extension to other personas.

Each entry records: decision, reasoning, alternatives considered, what
would trigger revisiting. Format matches PR7.

---

## 10. Knowledge-gap candidates (PR5)

No third-observation candidates queued for this session. Possible
second-observation surfaces:

- **File-based context loaders with drift detection** — this would be the
  first instance if wired in this session. Flag at session close if the
  pattern recurs in Growth / Ops / Support chat-persona wiring.
- **Chat-persona system-prompt composition order** — untracked today.
  If the next session finds the order matters (e.g., Tech references the
  known-issues block only when it is placed after the persona prompt),
  log as a first observation.

---

## 11. Today's verified facts (as of 20 April 2026, this session)

Not assumptions — findings from this session's exploration:

- `TECHNICAL_STATE.md` exists at repo root, 792 lines, last header update
  11 April 2026.
- `TECHNICAL_STATE.md` §2 lists 9 runSageReason endpoints: `score`,
  `reason`, `score-decision`, `score-social`, `score-document`,
  `score-scenario`, `score-iterate`, `guardrail`, `evaluate`.
- A current grep of `website/src/app/api/**/route.ts` for `runSageReason(`
  matches 10 route files: `score`, `reason`, `score-decision`,
  `score-social`, `score-document`, `score-conversation`, `guardrail`,
  `mentor-baseline`, `mentor-baseline-response`, `mentor-journal-week`.
- No `operations/tech-known-issues.md`, `operations/tech-debt.md`, or
  `operations/known-issues.md` file exists.
- No `website/src/lib/logging/` directory exists.
- No Supabase table with a name matching `error_log`, `known_issues`, or
  `tech_debt` exists in current migrations.
- `tech-brain-loader.ts` exports `getTechBrainContext(depth: TechDepth)`
  and is imported by `/api/founder/hub/route.ts`.
- Tech is invoked as a chat persona in the `case 'tech'` branch of
  `/api/founder/hub/route.ts`, ~line 253–309.
- `analytics_events` is the write-path table for product events, not an
  error log.

These are the factual ground from which the next session proceeds.
