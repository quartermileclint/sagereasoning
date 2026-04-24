# Next Session — Ops stream — D1 journey-classifications second pass

**Written:** 25 April 2026 (after D3 close + DD-2026-04-25-03 KG reconciliation).
**Governing frame:** `/adopted/session-opening-protocol.md` (adopted 24 April under DD-2026-04-24-09, housekept 25 April under DD-2026-04-25-01).
**Canonical-sources reference:** `/adopted/canonical-sources.md`.
**Prior prompt (superseded):** `/prompt.md.backup-2026-04-25-pre-protocol-rewrite` (the pre-protocol version; kept for provenance).

---

## Protocol Part A — Session opening (what the new session must do before touching work)

### 1. Tier declaration

**Stream:** Ops.
**Canonical-source tier:** {1, 2, 3, 5, 6}.
- Every session reads 1 (manifest), 2 (project instructions, pinned in the system prompt), 3 (most recent Ops handoff).
- D1 is a registry edit with governance-adjacent implications (the registry is the data the Ops persona reads through the loader), and it lands days after a major governance reconciliation — so 5 (discrepancy sort) and 6 (knowledge-gaps register) are added for state-of-corpus and PR5 respectively.
- Tier 4 (decision log) is covered by the named entries below rather than a broad scan.
- Tier 7 (project state) and tiers 8–9 (technical state, verification framework) are not required for a registry-only edit. Add them only if D1 surfaces a need.

### 2. Canonical-source read sequence

Read in this order:

1. `/manifest.md` — current version CR-2026-Q2-v4. Note especially the Architectural Constraints section (AC1–AC7) — **AC4 (Invocation Testing for Safety Functions)** is where the old KG3/KG7 build-to-wire discipline now lives.
2. Project instructions — in the session system prompt. P0 through P7, PR1–PR9, 0a–0h. Three recent amendments (D8, D9, D14) are applied at the Cowork project level.
3. `/operations/handoffs/ops/sage-ops-d3-registry-hygiene-close.md` — **authoritative for this session's opening scope** per Protocol Part A element 3. Read the Post-close amendment at the top; it records the one mid-session correction that matters for D1.
4. `/operations/discrepancy-sort-2026-04-23.md` — Track A complete; no outstanding items. Scan the D-series entries for context on what governance moves happened 23–24 April.
5. `/operations/knowledge-gaps.md` — reconciled 25 April under DD-2026-04-25-03. New numbering below under element 4.

### 3. Handoff read

`/operations/handoffs/ops/sage-ops-d3-registry-hygiene-close.md`.

The "Next Session Should" block of the close note names D1 as the queued scope with four candidates still available (D1, D2, D4, D5). The founder has already elected **D1**. The close note's Post-close amendment is the more important read — it records that D-D3-1 was appended in-session after Ops' probe caught log-vs-state drift. That lesson is carried forward below as a Part A element-15 reminder.

### 4. Knowledge-gaps scan (PR5)

Under DD-2026-04-25-03 the register was re-numbered to seven slots matching the manifest schema. Old numbers do not map 1:1 to new numbers:

| Current | Topic | Provenance |
|---|---|---|
| KG1 | Vercel serverless execution model | unchanged |
| KG2 | Haiku model reliability boundary | unchanged |
| KG3 | Hub-label consistency across writer/reader/client | promoted from former KG8 |
| KG4 | Layer 2 applicability vs wiring | unchanged |
| KG5 | Token budgets and measurement | unchanged |
| KG6 | Composition order constraint | unchanged |
| KG7 | JSONB storage format vs payload shape | promoted from former KG10 |

**Retired:** Former KG3 and KG7 (build-to-wire) → manifest **AC4**. Former KG9 (`/private-mentor` façade) → `summary-tech-guide-addendum-context-and-memory.md` §G.2. Former KG11 (FUSE sandbox) removed; AI-discipline mitigation remains operative at session open. Full pre-reconciliation register archived at `/archive/2026-04-25_knowledge-gaps_pre-ABC-reconciliation.md`.

**D1 relevance pass:**

- **KG5 (token budgets)** — relevant if D1 proposes adding a new `journey` value (e.g., `deprecated`). `compareJourneyKeys` in the loader may sort unknown keys in ways that affect rendering volume. Confirm before adopting a new value.
- **"Frankenstein duplicate" and "type-prefix naming invariant" (PR8 candidate patterns from D3, 1 observation each)** — not promoted to KG status. Potentially relevant if a D1 journey move also needs an id / path / ext / desc correction (unlikely for D1's scope but possible).
- **KG1, KG2, KG3, KG4, KG6, KG7** — not relevant for a journey-field registry pass. No code, no safety surface, no hub-label path, no JSONB read/write, no new LLM calls, no layer-2 wiring.

### 5. Hold-point status confirmation (P0 §0h)

P0 is still active. §0h (hold-point assessment) has not yet been run. D1 is a continuation of the D3 registry-hygiene pattern — it remains inside the P0-permissible set because it (a) improves what Ops can demonstrate for the hold-point Assessment 3 (value) and Assessment 4 (capability inventory), and (b) matches the "build what's needed for the assessment" exemption in §0h's framing. No permission to begin 0h itself — that's a separate trajectory decision.

### 6. Model selection (PR4)

**N/A for D1.** No code change; registry edits only. If scope expands mid-session to include loader edits (e.g., adopting a new journey value requires a sort update), confirm model selection against `/website/src/lib/ai/constraints.ts` at that point.

### 7. Status-vocabulary confirmation (0a + 0f, D14)

Two taxonomies, not interchangeable:

- **Implementation status** (for modules, rules, endpoints, features): Scoped → Designed → Scaffolded → Wired → Verified → Live.
- **Decision status** (for decision-log entries only): Adopted / Under review / Superseded by [ref].

For D1: every journey-move proposal produces a decision-log entry with decision status `Adopted`. The registry itself doesn't carry an implementation status — it's data, not a module.

### 8. Signals and risk classification ready

**AI signals:** "I'm confident" / "I'm making an assumption" / "I need your input" / "I'd push back on this" / "This is a limitation" / "This change has a known risk" / "I caused this".

**Founder signals:** "Explore" / "Design" / "Build" / "Ship" / "I've decided" / "Thinking out loud" / "Done for now" / "Treat as critical".

**Default risk for D1 moves:** Standard (registry-only edits on a non-safety-critical data file). Risk escalates to Elevated if a move also touches id / path / ext / desc on the same entry (the D-D3-1 pattern) — flag explicitly under "This change has a known risk" before executing.

---

## D1 scope — what the session does

The 65 `journey` values assigned in Option A were a single-pass classification from component id + type. Blocker text is now visible on 19 of them (D-B3-1, D-B3-2). Where the blocker describes something other than the current journey suggests, a reclassification is warranted.

**Expected shape:**
1. Produce a proposal table: id / current journey / proposed journey / reasoning drawn from blocker text.
2. Founder adjudicates en-bloc or per-item.
3. Apply approved moves in a single registry write (with backup).
4. Verify: JSON parses, per-journey distribution matches the approved deltas, TypeScript clean.
5. Log the decision (or decisions) in-session per D3 Lesson 1 (below).

**Starting candidates surfaced in prior prompts:**

- `engine-llm-bridge` — marked `free_tier`; blocker describes deprecation. Candidate moves: `unknown`, or a new `deprecated` value, or leave and annotate.
- Any `paid_api` / `both` / `free_tier` item where the blocker text describes a different audience than the current journey implies.

Not exhaustive. Expect more to emerge when all 19 blocker-carrying items are reviewed systematically.

---

## Protocol Part B — Session conduct reminders (elements 9–18 that apply to D1)

- **Element 9 — change classification before execution.** State Standard/Elevated for each registry move before writing. Adding a new journey value is Elevated (it shifts loader rendering behaviour).
- **Element 13 — single-endpoint proof (PR1).** A first registry-edit proof of the D1 pattern (one journey move, fully verified) before applying a batch.
- **Element 14 — verification immediate (PR2).** Same-session verification. JSON parses, per-journey distribution, TypeScript clean. If a new journey value is introduced, probe the loader's rendered output too.
- **Element 15 — deferred decisions logged (PR7).** Any moves the founder defers get a `D-D1-n` "Deferred" entry with revisit condition.
- **Element 18 — scope caps.** Don't expand beyond D1. If a move reveals a deeper registry issue (another Frankenstein-shaped entry), log it as a follow-up candidate; don't fix it this session.

Elements 10, 11, 12 (Critical Change Protocol, safety-critical = Critical, synchronous safety) do not apply to D1 unless scope changes.

---

## Protocol Part C — Close obligations (elements 19–21)

- **Element 20 — handoff in required-minimum format plus extensions.** File: `/operations/handoffs/ops/sage-ops-d1-journey-second-pass-close.md`. Minimum: Decisions Made / Status Changes / Next Session Should / Blocked On / Open Questions. Extensions required because D1 involves registry edits: Verification Method Used / Risk Classification Record / PR5 Knowledge-Gap Carry-Forward / Founder Verification.
- **Element 21 — orchestration reminder.** State at close that the Session Opening Protocol was the governing frame. Name any skipped element and why.

---

## D3 lessons — carry forward

### Lesson 1 — Append retroactive decision-log entries **in-session**, not deferred

The B2→B3 deferral pattern works when a decision is made this session but acted on next. It fails when a decision is made AND the action is completed this session — the log lags reality and Ops (which reads the log as the audit trail for "has X been resolved") reports stale answers. D-D3-1 was originally parked for next-session approval; Ops' post-deploy probe caught the drift the same day, and the entry was appended in-session as a correction.

**Implication for D1:** `D-D1-n` entries for journey moves approved and applied this session get appended this session, after founder approval in chat. Don't park them.

### Lesson 2 — Outputs scratch folder is cleared between sessions on this platform

The D3 forward prompt asked to archive B3 probe scripts to `/archive/2026-04-22-b3-tmp-scripts/`; the scripts didn't exist at session open. Future close notes can skip the "archive probe scripts" step or rephrase it.

### Lesson 3 — Two PR8 candidate patterns at 1 observation each

- **"Frankenstein duplicate"** — entry created by duplicating another and changing `type` without changing `id`/`path`/`ext`/`desc`. Third recurrence triggers promotion.
- **"Type-prefix naming invariant"** — ids strongly type-prefixed in practice (21/21 `document` → `doc-*`; 12/12 `reasoning` → `reasoning-*` after D3). Third recurrence triggers promotion.

---

## Context the new session will need

- **Registry file:** `website/public/component-registry.json` — 163 components, 65 non-Ready, 19 with explicit `blocker`, 0 duplicate ids after D3 + D-D3-1.
- **Loader file:** `website/src/lib/context/ops-continuity-state.ts` (~37 KB). Reads `journey` at ~line 672, groups `by_journey` at ~lines 673–675. Sort order in `compareJourneyKeys` — grep this before assuming a new journey value (e.g., `deprecated`) is Standard-risk; closed sort keys make it Elevated.
- **Route:** `website/src/app/api/founder/hub/route.ts:213` invokes `getOpsContinuityState()`; line 270 reads only `.formatted_context`. Do not edit for D1.
- **Backups parked (D3 session):** `operations/decision-log.md.backup-2026-04-22-d3`, `operations/decision-log.md.backup-2026-04-22-d3-pre-dd3-1`, `website/public/component-registry.json.backup-2026-04-22-d3`.
- **Decision log state:** ends at line 1090 as of D3 close; then grew under the 25 April housekeeping (DD-2026-04-25-01, -02, -03). Most recent D1-relevant entry is DD-2026-04-25-03 (KG reconciliation — affects which knowledge-gap numbers apply). The four D3-relevant entries remain at lines 1022, 1040, 1058, 1076.

---

## Open questions for the founder (decide at session open)

1. **Scope within D1 —** first-pass proposal for all 19 blocker-carrying items, or only those where mis-classification looks obvious? AI recommends all 19 (same effort, cleaner audit trail).
2. **New journey value permitted —** the `engine-llm-bridge` blocker suggests `deprecated` might fit. Adding a value requires an Elevated classification unless `compareJourneyKeys` handles unknown keys gracefully. Grep first, then decide.
3. **Decision-log timing (D3 Lesson 1) —** append `D-D1-n` entries in-session. AI recommends yes by default; flag anything to defer with a PR7-compliant entry at that moment.
4. **Review format —** AI produces a table (id / current / proposed / reasoning); founder approves en-bloc or per-item.

---

## Signals to use (unchanged)

Founder → AI: "D1", "proceed", "treat this as critical", "I'm done for now", "scrap that", "skip the menu, do X instead".
AI → founder: "I'm confident", "I'm making an assumption", "I need your input", "I'd push back on this", "This is a limitation", "This change has a known risk", "I caused this".

---

## One-line summary

Ops-stream session: protocol-governed opening (tier {1,2,3,5,6}); read the D3 close note and its Post-close amendment; scope is D1 — journey-classifications second pass over the 19 blocker-carrying registry items; founder approves scope, new-value policy, log timing, and review format at session open; apply D3 Lesson 1 (append `D-D1-n` entries in-session); close in minimum-plus-extensions format at `/operations/handoffs/ops/sage-ops-d1-journey-second-pass-close.md` and name the protocol as governing frame.
