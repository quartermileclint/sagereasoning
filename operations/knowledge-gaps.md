# Knowledge Gaps — Concepts Requiring Repeated Re-Explanation

**Created:** 18 April 2026
**Source:** Build Knowledge Extraction Section 7 (17 April 2026)
**Reconciled:** 25 April 2026 under DD-2026-04-25-03. Seven permanent slots (KG1–KG7) now match the manifest's Knowledge Gaps Register schema. Build-to-wire content retired to AC4; see `/manifest.md` §Architectural Constraints. Hub-label consistency promoted from former KG8 into KG3; JSONB storage promoted from former KG10 into KG7. Former KG9 (`/private-mentor` façade) absorbed into `summary-tech-guide-addendum-context-and-memory.md` §G.2. Former KG11 (FUSE sandbox deletion) removed from register; the AI-discipline resolution at session open remains the operative mitigation. Full pre-reconciliation register preserved at `/archive/2026-04-25_knowledge-gaps_pre-ABC-reconciliation.md`.
**Purpose:** Session-opening reference. Before beginning work, check whether any of these concepts are relevant to today's tasks. If they are, read the resolution here first — don't re-derive it.

**Protocol:**
- At session open: scan this file for concepts touching today's scope.
- During session: if any concept requires re-explanation, flag it in the handoff note with a cumulative count.
- At 3 re-explanations: add the concept to this file (or update the existing entry) with the resolution that finally stuck.

---

## KG1 — Vercel Serverless Execution Model

**Re-explanations:** 4 (Sessions: 9 Apr redirect header stripping, 12 Apr fire-and-forget writes, 9 Apr Session 4 Fetch API behaviour, 17 Apr execution termination)

**Why it caused confusion:** Platform constraints were discovered one at a time through incidents rather than being documented as a set. Each session treated its discovery as a new fact rather than a known constraint.

**Plain-language resolution:** Vercel serverless functions have five rules that affect everything we build:

1. **No self-calls.** An API route cannot call another API route on the same deployment using fetch/HTTP. The www/non-www redirect strips Authorization headers. Use direct function imports instead.
2. **Await all database writes.** Vercel terminates execution after the response is sent. Any Supabase write that isn't awaited before the response may never complete. No fire-and-forget.
3. **Headers can be stripped on redirects.** If Vercel redirects a request (e.g., www → non-www), custom headers including Authorization may be lost.
4. **Execution terminates after response.** Background processing does not work. If the function returns a response, anything still running is killed.
5. **`process.cwd()` resolves to the Next.js project directory, not the repo root.** On Vercel, `process.cwd()` = `/var/task/website`. Files at the repo root are accessible via `path.join(process.cwd(), '..')`. All file-based context loaders must use this parent-traversal pattern. Confirmed by diagnostic probe on 21 April 2026 across all five loaders (Tech C1+C2, Growth C1+C2, Ops C2). Fix: `const REPO_ROOT = path.join(process.cwd(), '..')`.

**Observation history for rule 5:** Tech (1st, 20 April 2026 morning), Growth (2nd, 20 April 2026 afternoon), Ops (3rd, 20 April 2026 evening). Promoted under PR5 (re-explanation threshold) and PR8 (third recurrence). Fix landed 21 April 2026.

**When this matters:** Any time a new endpoint is designed, any time database writes are added, any time one endpoint needs to call another, any time a loader reads files from outside the `website/` directory.

---

## KG2 — Haiku Model Reliability Boundary

**Re-explanations:** 5 (Sessions: 8 Apr testing, 11 Apr Session 13, 11 Apr Session 14, 11 Apr Session 15, 17 Apr b)

**Why it caused confusion:** No documented model selection criteria existed. Haiku was the default for all depths until failures forced per-session rediscovery that it can't handle complex structured output.

**Plain-language resolution:** Haiku is fast and cheap but it can only produce reliable structured JSON for simple, single-mechanism queries (quick depth). For anything that requires multi-mechanism analysis, longer outputs, or structurally complex JSON — use Sonnet.

| Depth | Model | Why |
|---|---|---|
| Quick | Haiku | Single mechanism, short output, simple JSON structure |
| Standard | Sonnet | Multi-mechanism, longer output, complex JSON |
| Deep | Sonnet | Full analysis, comprehensive JSON |

The R20a distress classifier uses Haiku because its output is a single small JSON object (3 fields). This is within Haiku's reliability boundary.

**When this matters:** Any time a new endpoint is designed or an existing endpoint's depth is changed.

---

## KG3 — Hub-Label Consistency Across Writer, Reader, and Client

**Provenance:** Promoted from former KG8 on 2026-04-25 under DD-2026-04-25-03. The original observations and re-explanation count are preserved. This slot previously held build-to-wire content, which has been retired to AC4 per the manifest's explicit exclusion ("Build-to-wire verification is not a KG entry — it is captured as AC4").

**Re-explanations:** 3 (Sessions: 9 (original), 10 (session-10 close noted second observation), 11 (R3 implementation))

**Why it caused confusion:** Hub labels (`'founder-mentor'`, `'private-mentor'`, `'founder-hub'`) appear in multiple places: the request body sent by `/private-mentor`, the writer's INSERT into `mentor_interactions.hub_id`, the reader's SQL `.eq('hub_id', ...)`, and the `logMentorObservation` writer. If any one of these uses a different label, rows get written under one hub and read from another, and the feature silently breaks (no error — just an empty result).

**Plain-language resolution:** Treat hub labels as end-to-end contracts. For any new endpoint that reads or writes `mentor_interactions` or `mentor_observations_structured`:

1. Does the client pass `hub_id` in the request body? If yes, use `mapRequestHubToContextHub(effectiveHubId)` in `/api/founder/hub` (and equivalent elsewhere) to map the request label to the context-reader label.
2. If the endpoint hardcodes a hub label (e.g., `/api/mentor/private/reflect` hardcodes `'private-mentor'`), verify that hardcode matches the reader's expected value. Document the hardcode in a comment so drift is visible.
3. Run one end-to-end probe: write a row via the new endpoint, then read via the mentor context, confirm the row appears.

**When this matters:** Any new endpoint touching `mentor_interactions` or any reader of hub-scoped mentor data. Any refactor of the hub label taxonomy.

---

## KG4 — Layer 2 Applicability vs Wiring

**Re-explanations:** 3 (Sessions: 7d, 15 Apr hold point, 15 Apr correction)

**Why it caused confusion:** The capability inventory used a binary framework: either an endpoint has Layer 2 (practitioner context) or it doesn't. But some endpoints *can't* have Layer 2 because they authenticate via API key, not user session. "Not wired" and "not applicable" look the same in a checklist.

**Plain-language resolution:** The context matrix must distinguish three states:

- **Wired** — endpoint has this layer, it's working
- **Not wired** — endpoint should have this layer but doesn't yet (this is a gap)
- **Not applicable** — endpoint can't have this layer (e.g., API-key auth endpoints have no user identity to load a profile for)

**When this matters:** Any capability audit or context layer review.

---

## KG5 — Token Budgets and Measurement

**Re-explanations:** 5 (Sessions: 7d, 7e, 14 Apr V2 verification, 15 Apr naming inversion, 17 Apr cost monitoring)

**Why it caused confusion:** Different sessions used different methods to count tokens — character count divided by 4, Anthropic API `usage.input_tokens`, offline estimation tools. Results didn't match, leading to conflicting claims about token usage.

**Plain-language resolution:** Use Anthropic API `usage.input_tokens` as the ground truth. The chars/4 estimate is a rough guide, not a measurement. When reporting token counts:

- Always state which method was used
- Label chars/4 estimates as "approximate"
- Use API measurements for any decision that involves money or context window limits

The naming inversion: "minimal" context level produces ~222 tokens; "condensed" produces ~139 tokens. The names suggest the opposite. This is a known quirk, not a bug — documented, accepted, will revisit at P3.

**When this matters:** Any cost analysis, context window budgeting, or comparison between context levels.

---

## KG6 — Composition Order Constraint

**Re-explanations:** 3 (Sessions: 7, 7g, 15 Apr Layer 3 wiring)

**Why it caused confusion:** The order in which context layers are injected into the LLM prompt matters for how the model treats the content, but this was only documented in code comments. New sessions didn't discover the constraint until implementation forced it.

**Plain-language resolution:** Two injection zones, each with a specific purpose:

- **System message blocks** (L1 Stoic Brain, L3 Agent Brains): Persistent expertise. The LLM treats these as foundational instructions. Cached by the provider.
- **User message** (L2b Practitioner, L4 Environmental, L5 Mentor KB): Per-request context. The LLM treats these as variable input.

Never put per-request context in system blocks (wastes cache, wrong authority level). Never put foundational expertise in user message (LLM gives it less weight).

**When this matters:** Any time context layers are added, modified, or wired to new endpoints.

---

## KG7 — JSONB Storage Format vs Payload Shape

**Provenance:** Promoted from former KG10 on 2026-04-25 under DD-2026-04-25-03. The original observations and re-explanation count are preserved. This slot previously held build-to-wire systemic-pattern content, which has been retired to AC4 per the manifest's explicit exclusion.

**Re-explanations:** 3 (Sessions: 10 (original observation — `Array.isArray` false-negative on `passions_detected`), 12 (reader audit confirmed the same pattern at the writer site), 13 (Option 2 fix applied and Verified))

**Why it caused confusion:** A PostgreSQL JSONB column accepts any valid JSON value — including a JSON-encoded string scalar that *contains* an array-shaped string (e.g., `"[{...}]"`). From the database's perspective this is a valid JSONB value of type `string`. From TypeScript's perspective the Supabase client returns it as a string. Readers that assume the column holds an array fail silently: `Array.isArray(value)` returns `false`, iteration yields characters not objects, and any `.length` check returns the string length rather than the element count. The bug is visible only if the reader explicitly checks `jsonb_typeof` or parses the string — defensive `JSON.parse` masks it in one direction, silent fall-through masks it in the other.

**Plain-language resolution:** JSONB columns have two shapes that look the same but behave differently:

- **Correct:** `passions_detected: [{...}, {...}]` — column stores a JSON array. `jsonb_typeof()` returns `'array'`. `Array.isArray()` on the Supabase-returned value returns `true`. Readers can iterate directly.
- **Incorrect (bug-shaped):** `passions_detected: "[{...}, {...}]"` — column stores a JSON string scalar whose contents happen to be an array-shaped string. `jsonb_typeof()` returns `'string'`. `Array.isArray()` returns `false`. Readers must `JSON.parse` before using.

This happens when a writer calls `JSON.stringify(array)` before handing the value to the Supabase client. The Supabase client will *not* unwrap the string — it passes the string straight into the JSONB column as a JSON string scalar.

**Write-site rule:** Pass arrays and objects directly to the Supabase client. Do not `JSON.stringify` them. The client handles serialisation correctly for JSONB columns.

**Read-site rule (defensive pattern, only if needed for mixed historical data):**
```ts
const parsed = typeof row.jsonb_col === 'string'
  ? JSON.parse(row.jsonb_col)
  : (row.jsonb_col || [])
```
Keep this defensive pattern on any reader that was written while the writer bug was live — it backstops legacy rows after the writer is fixed. Once the rolling window no longer contains legacy rows, the defensive pattern can be removed.

**Verification method:** Run `SELECT jsonb_typeof(col) FROM table ORDER BY created_at DESC LIMIT 1;` after any fresh write. Expected: `'array'` for array-shaped columns, `'object'` for object-shaped columns. If you get `'string'`, the writer is double-serialising.

**When this matters:** Any new INSERT or UPDATE statement on a JSONB column. Any reader of a JSONB column that expects iteration. Any schema migration that adds a JSONB column. Any bug report that describes "the rolling window is empty" or "the signal list renders `—`".

---

## Retired content — preserved for provenance

The following register entries existed before the 2026-04-25 reconciliation (DD-2026-04-25-03) and are no longer active:

- **Former KG3 (Build-to-Wire Gap — detectDistress History)** and **former KG7 (Build-to-Wire Gap Pattern — Systemic):** retired per the manifest's explicit exclusion that build-to-wire is captured in AC4 (Invocation Testing for Safety Functions), not as a KG entry. Both slots' former content is preserved at `/archive/2026-04-25_knowledge-gaps_pre-ABC-reconciliation.md`. See manifest §Architectural Constraints §AC4 for the active discipline.
- **Former KG8 (Hub-Label Consistency):** promoted into KG3 above. Same content; new slot number to match the manifest's 7-slot schema.
- **Former KG9 (`/private-mentor` page is a façade over `/api/founder/hub`):** absorbed into `summary-tech-guide-addendum-context-and-memory.md` §G.2 as the more natural home for codebase-map facts. Full original register entry preserved at `/archive/2026-04-25_knowledge-gaps_pre-ABC-reconciliation.md`.
- **Former KG10 (JSONB Storage Format vs Payload Shape):** promoted into KG7 above. Same content; new slot number.
- **Former KG11 (Sandbox File Deletion Permission — FUSE virtiofs):** removed from the register. The operational resolution — call `mcp__cowork__allow_cowork_file_delete` proactively at session open for archive/move-heavy sessions — is AI session-opening discipline, not a conceptual knowledge gap. No active register home. Full original entry preserved at `/archive/2026-04-25_knowledge-gaps_pre-ABC-reconciliation.md`.

---

*This is a living document. When a concept hits 3 re-explanations across sessions, add it here with the resolution that worked. Check this file at the start of every session.*

---

## Carry-Forward Notes — Ops Wiring Session (20 April 2026) + Path Fix Session (21 April 2026)

### KG1 rule 5 — RESOLVED (21 April 2026)

The `process.cwd()` path-resolution pattern reached its third observation at Ops Channel 2 (20 April 2026 evening) and was fixed on 21 April 2026. Rule 5 has been added to the KG1 resolution entry above. The Growth carry-forward note (previously here) has been absorbed into that entry. See D-Fix-1 in the decision log for the full reasoning.

### New candidate pattern (first observation) — Supabase-read-path loader for chat persona

Ops Channel 1 is the first loader in the codebase to read Supabase in the live request path for persona context. The stub-fallback pattern applied here worked correctly under production failure (missing table), which validates the approach but leaves the observation count at 1. Logged for future promotion decision.

### New candidate pattern (first observation) — Multi-source synthesis loader with per-source isolation

Ops Channel 2 is the first loader to synthesise five independent sources with per-source isolation. The `OpsContinuitySection<T>` type is the design primitive. Logged for future promotion decision.

### Field-level 'unknown' self-disclosure pattern (second observation)

First seen as the Channel 2 sparse-state disclosure at Growth. Now applied at field level (not block level) at D-Ops-2 and D-Ops-6. Second observation. One more observation promotes under PR8.

### New candidate pattern (first observation) — Sparse-state disclosure in context loaders

**Context:** Channel 2 of Growth (`growth-market-signals.ts`) is the first context loader in the codebase to carry an explicit "Do NOT invent data" disclosure for the sparse-state case.

**Pattern description:** When a context loader legitimately has no data to return (file is readable but empty, not a failure), do not silently inject an empty block. Instead, inject an explicit block that:
1. Tells the persona the channel is sparse.
2. Says why it is expected to be sparse at the current stage.
3. Instructs the persona explicitly not to fabricate data of the kind the channel carries.
4. Suggests a principled fallback (e.g., "base recommendations on static context and flag the gap when it matters").

This is distinct from the stub-fallback pattern (which fires on unreadable files): the stub-fallback says "I can't read the source." The sparse-state disclosure says "I can read the source and it is deliberately empty."

**Why it matters:** The alternative — silently injecting an empty block — leaves the persona without guidance about what the emptiness means. The persona's default behaviour in that case is often to fall back to training-data knowledge of "what the market typically looks like," which is exactly the hallucination path the block is supposed to prevent.

**Observation count:** 1 (Growth Channel 2, 20 April 2026).

**Promotion trigger:** PR8 promotes on third recurrence. Candidates for future observations: any Ops pipeline-state channel that can legitimately be empty, any journaling-frequency channel that has a bootstrap period before data exists, any per-user memory channel for users who have not yet produced memory-worthy content.

**Status:** Logged for future promotion decision. Not yet a full KG entry.

### New candidate pattern (first observation) — LLM marginal-case discipline requires worked OUTPUT examples (M1-CP3, 2026-05-04)

**Observation:** ADR-007 §3 (Layer 3 prose template for `/api/reason`) instructed the LLM to name marginal/undecidable assessments explicitly via a bullet list ("is_kathekon: null → 'the action's appropriateness cannot be determined...'"; "direction_of_travel: 'single_snapshot' → 'this is a single snapshot; no trajectory data is available'"; "improvement_path_structured: null → 'no specific improvement path...'"). The OUTPUT example showed a worked F1-style case but did NOT include the single-snapshot sentence in its philosophical_reflection.

The founder's between-sessions real-Sonnet harness Phase 5 run surfaced 4 failures (3 per-fixture + 1 cross-fixture coverage). The LLM silently omitted the single-snapshot sentence on F1, F3, F4 (all 3 fixtures with `direction_of_travel === 'single_snapshot'`); F2 passed because its `direction_of_travel === 'stable'`. The LLM honoured the JSON contract (validation passed; Greek-identifier consistency clean) — it just treated the marginal-case discipline as optional because the OUTPUT example didn't demonstrate it.

**Pattern:** Worked OUTPUT examples > written instructions. When an ADR specifies LLM behaviour in bullet-point instruction without demonstrating it in a concrete worked example, the LLM treats it as optional. This generalises PR5's existing JSON-key-fidelity lesson (placeholder vs concrete keys) to semantic-content discipline (marginal-case phrasing, mandatory framings, similar disciplines named in instruction but not demonstrated).

**Resolution sketch (in-session amendment 2026-05-04):** ADR-007 §3 OUTPUT example amended to include the single-snapshot sentence in philosophical_reflection (worked example demonstrating the discipline). The prose-field instruction strengthened to mark single-snapshot phrasing as MANDATORY when applicable. The fallback prose helper (`fallbackPhilosophicalReflection`) extended to append the same sentence when `direction_of_travel === 'single_snapshot'`. Founder re-runs the harness post-amendment; 77/77 pass would confirm the resolution worked.

**Promotion trigger:** PR5 promotes on third recurrence. This is the first observation. If the post-amendment re-run still shows the LLM omitting the single-snapshot sentence, OR if a similar marginal-case-omission pattern appears in M2/M3/M4 Layer 3 templates, that is the second observation. Resolution at second observation: tighten to a permanent rule that every marginal-case discipline named in any ADR's "Composition Contract" or equivalent section MUST appear in the OUTPUT example as worked prose.

**Status:** Logged for future promotion decision. Not yet a full KG entry. Cross-references: `D-M1-CP3-LAYER3-MODULE-AND-ADR007-2026-05-04` (parent entry + Amendment block); `/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md` §3 + §6 + Changelog (the amendment).

### Stable observations (no action)

- **AC4 (Invocation Testing for Safety Functions) — formerly KG3 / KG7 build-to-wire entries, retired 2026-04-25 under DD-2026-04-25-03:** Actively applied. Grep confirmed both Growth loaders are called exactly once in production (`hub/route.ts` `case 'growth':`). Harness run in-session (16/16 assertions passed). No new observation worth logging.
- **KG6 (Composition Order Constraint):** Same resolution as Tech — persona-prompt → upgrades → context blocks → brain is the established order for this architecture. Not a violation.
- **KG2, KG4, KG5:** Not relevant this session. (Former KG8, KG9, KG10 retired under the 2026-04-25 reconciliation — see the "Retired content" block above for their new homes.)
