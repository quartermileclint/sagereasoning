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

**Candidate observation (PR5 — logged 2026-05-21, 1st recurrence):** *Founder-verification curl blocks.* During the Sage Calling go-live verification, two friction points cost time: (a) example curls hit the apex `sagereasoning.com`, which 307-redirects to `www`, and `curl -L` dropped the `Authorization` header on that cross-host redirect → spurious 401 — this is **rule 3 above** observed at the verification layer rather than the application layer; (b) admin Supabase JWTs expire (~1h), so an admin-gated call needs a token grabbed immediately before it. Resolution applied: verification-block convention updated (`/operations/verification-framework.md` §API Endpoint) to mandate the canonical `www.` host, forbid `-L` on authenticated examples, and flag admin-token freshness. Not promoted to a standalone KG (root cause already lives in rule 3); promote per PR5 only if it recurs a 3rd time as a distinct pattern.

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

### Candidate pattern (2nd recurrence — watch status) — LLM marginal-case discipline requires worked OUTPUT examples (M1-CP3, 2026-05-04)

**Observation:** ADR-007 §3 (Layer 3 prose template for `/api/reason`) instructed the LLM to name marginal/undecidable assessments explicitly via a bullet list ("is_kathekon: null → 'the action's appropriateness cannot be determined...'"; "direction_of_travel: 'single_snapshot' → 'this is a single snapshot; no trajectory data is available'"; "improvement_path_structured: null → 'no specific improvement path...'"). The OUTPUT example showed a worked F1-style case but did NOT include the single-snapshot sentence in its philosophical_reflection.

The founder's between-sessions real-Sonnet harness Phase 5 run surfaced 4 failures (3 per-fixture + 1 cross-fixture coverage). The LLM silently omitted the single-snapshot sentence on F1, F3, F4 (all 3 fixtures with `direction_of_travel === 'single_snapshot'`); F2 passed because its `direction_of_travel === 'stable'`. The LLM honoured the JSON contract (validation passed; Greek-identifier consistency clean) — it just treated the marginal-case discipline as optional because the OUTPUT example didn't demonstrate it.

**Pattern:** Worked OUTPUT examples > written instructions. When an ADR specifies LLM behaviour in bullet-point instruction without demonstrating it in a concrete worked example, the LLM treats it as optional. This generalises PR5's existing JSON-key-fidelity lesson (placeholder vs concrete keys) to semantic-content discipline (marginal-case phrasing, mandatory framings, similar disciplines named in instruction but not demonstrated).

**Resolution sketch (in-session amendment 2026-05-04):** ADR-007 §3 OUTPUT example amended to include the single-snapshot sentence in philosophical_reflection (worked example demonstrating the discipline). The prose-field instruction strengthened to mark single-snapshot phrasing as MANDATORY when applicable. The fallback prose helper (`fallbackPhilosophicalReflection`) extended to append the same sentence when `direction_of_travel === 'single_snapshot'`. Founder re-runs the harness post-amendment; 77/77 pass would confirm the resolution worked.

**Second observation (2026-05-04, post-amendment harness re-run):** the founder re-ran the harness after the in-session amendment. The single-snapshot per-fixture assertions all passed (3/3) + the cross-fixture coverage passed — confirming the amendment's worked example for single-snapshot worked. A new failure surfaced: F1.P5 hard-asserted `is_kathekon: null → prose contains "cannot be determined"` and the LLM did not satisfy it. This is the same root pattern (marginal-case discipline named in instruction but not demonstrated in OUTPUT example), now manifesting on a different marginal field (kathekon-null instead of single-snapshot).

The visibility difference is fixture-driven: F1's Layer 1 output is non-deterministic at temperature 0.2, so different runs produce different kathekon profiles. The previous run had F1 with `kathekon: contrary` (`is_kathekon === false`), so the kathekon-null assertion didn't fire. This run had F1 with `kathekon: marginal` (`is_kathekon === null`), and the assertion fired and failed. The latent issue was masked, not absent.

**Resolution sketch (watch status):** Apply the same fix-pattern as the single-snapshot amendment, but to the OUTPUT example for kathekon-null AND improvement_path_structured-null. Either: (a) add a second worked OUTPUT example to the §3 prompt covering a fixture with all three marginal fields engaged (longer prompt, but demonstrates the discipline comprehensively); (b) extend the existing F1 OUTPUT example with conditional sentences covering kathekon-null + improvement_path_structured-null marginal cases (compact but conditional examples may confuse the LLM); (c) demote the per-fixture marginal-case hard-asserts to soft-warns when the discipline is omitted but the rest of the prose is consistent (lower bar; risk of silent drift in production). Founder decides at the next session opening; the chosen path becomes the second amendment to ADR-007 (or a new ADR if the pattern generalises to other consumers).

**Resolution applied (2026-05-04, second in-session amendment, founder approved "Recommended — apply same pattern that worked"):** Variant of option (b) — extended the existing F1 OUTPUT example to include the kathekon-null sentence as a worked example, marked is_kathekon-null + improvement_path_structured-null + single_snapshot all as MANDATORY in §3 with explicit placement guidance per marginal field. Mirror amendment in `layer3-prose.ts`: `fallbackPhilosophicalReflection` now appends both single-snapshot AND kathekon-null sentences independently when applicable. In-sandbox smoke test 36/36 (was 34/34; +2 for kathekon-null fallback assertions on F1 + MARG). Founder re-runs harness post-second-amendment between sessions to confirm 79/79. If the LLM still omits a marginal-case sentence after this second amendment, that is the third recurrence and triggers permanent KG entry promotion per PR5.

**Promotion trigger (revised):** The second amendment applied a structural fix (every marginal-case discipline named in COMPOSITION CONTRACT now has MANDATORY status + worked-example demonstration in §3). If the post-second-amendment harness re-run passes 79/79, the candidate stays in watch (2nd recurrence) — the resolution worked. If the post-second-amendment re-run STILL shows marginal-case omission for any field (kathekon-null, single-snapshot, or improvement_path_structured-null), that is the third observation and PR5 promotes to a permanent KG entry. The KG entry would name the rule: "Every marginal-case discipline named in any LLM prompt's COMPOSITION CONTRACT or equivalent section MUST be demonstrated as worked prose in the OUTPUT example, with the example fixture chosen such that EVERY marginal field is exercised. ADR-template change required for all per-consumer Layer 3 ADRs."

**Promotion trigger:** PR5 promotes on third recurrence. This is the second observation. Third observation would be (a) the next harness re-run still shows the LLM omitting marginal-case phrasing for ANY marginal field (not just single-snapshot), or (b) the same pattern appears in M2/M3/M4 Layer 3 prompt templates at their respective milestones. Resolution at third observation: tighten to a permanent KG entry — every marginal-case discipline named in any ADR's "Composition Contract" or equivalent section MUST appear as worked prose in the OUTPUT example, with the example fixture chosen such that EVERY marginal field is exercised. ADR-template change required.

**Status:** Watch (2nd recurrence). Logged for promotion decision at third recurrence. Cross-references: `D-M1-CP3-LAYER3-MODULE-AND-ADR007-2026-05-04` (parent entry + Amendment block + post-amendment re-run record); `/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md` §3 + §6 + Changelog (the amendment).

### Promoted pattern (3rd+ recurrence — load-bearing resolution) — Harness assertions on subjective LLM extractions must be structural, not content-specific (M1-CP4e-B, 2026-05-07)

**Re-explanations:** 3+ (M1-CP4b worked-example fix for placeholder-vs-concrete JSON keys + per-fixture motivation_evidence assertion calibration; M1-CP4e-A F1+F2+F5 cache invalidation drift requiring P4 baseline split + F2 STATED_EQUANIMITY_UNVERIFIED carve-out + F5 stated_equanimity_signals relaxation; M1-CP4e-B F2 motivation_stated drift + F5 EUPATHEIA prose drift + F9 augmented-trigger same-fire). PR5 PROMOTED from watch-status (M1-CP4e-A close) to permanent at M1-CP4e-B.

**Why it caused confusion:** Sonnet's structured-output extraction is non-deterministic on subjective fields — whether "I hate confrontation" is a stated motivation or a passion-disclaimer; whether "no envy at all" is a stated_equanimity_signal; whether "she" is a stated_concern_target; whether F5's prose names eupatheia (genus) or chara/boulesis (species); whether the practitioner's clarification answer structurally removes the ambiguity-creating content from the original input. The harness's expected_non_empty / per-fixture assertions crystallised specific Sonnet outputs at one moment in time and then drifted out of alignment as Sonnet's output varied between runs. Each drift looked like a failure but was a defensible (sometimes more-accurate) reading.

**Plain-language resolution:** The harness asserts STRUCTURAL invariants (correct types, valid enum values, schema conformance, fields-non-empty-when-expected) — never specific content. Where content matters (e.g., a marginal-case discipline must appear in prose), the matcher accepts paraphrases via lexical-set membership rather than fixed phrases. Genus-or-species naming (eupatheia / chara / boulesis / eulabeia) is structurally equivalent. Loop-guard assertions accept any valid output (no throw) rather than prescribing trigger outcomes. Per-fixture carve-outs are documented inline with the reason and the date (e.g., F2's "I hate confrontation" reading; F7's fusion-bypass).

**Pattern:** Subjective fields where Sonnet has interpretive latitude → structural assertion + diagnostic INFO logs of the actual outcome → per-fixture carve-outs documented when content drift is genuinely defensible.

**When this matters:** Any harness assertion on LLM-derived output. Any new fixture's assertion design. Any review of `verify-translation-sandwich.ts` or M2/M3/M4 consumer harnesses.

**Resolution applied (2026-05-07, M1-CP4e-B):**
- F2 motivation_stated carve-out from `=== false` baseline assertion (Sonnet's reading defensible per ADR-005 §3.10).
- F5 EUPATHEIA_BOUNDARY matcher pivoted to structural (genus or species + marginal-case language).
- Phase 12 loop-guard pivoted to structural (engine completed; outcome diagnostically logged; same-trigger logged as INFO with ADR-008 §10.3 diagnostic).
- F7 motivation_stated carve-out (fusion-bypass per ADR-005 §8.2).

**M1-CP4f scope:** Extend the structural-over-content principle to other content-specific assertions in the harness — `proseHasUndecidableKathekonPhrasing`, `proseHasSingleSnapshotPhrasing`, `proseHasNoImprovementPathPhrasing`, EUPATHEIA_BOUNDARY / PRAXIS_MOTIVATION_AMBIGUITY stem fragment matchers. Systematic refactor of harness assertion strategy. Note: this is a different but related pattern from the marginal-case discipline watch entry above — that one is about LLM-prompt design (worked OUTPUT examples for marginal cases); this one is about HARNESS-assertion design (structural over content). M1-CP4f integrates both.

**Status:** Promoted (3rd+ recurrence — load-bearing). Cross-references: `D-M1-CP4e-B-AC13-TIER1-DEPLOYED-2026-05-07` (this promotion); `D-M1-CP4e-A-LAYER-MODULES-ROUTE-HARNESS-AC13-TIER1-IMPLEMENTED-NO-DEPLOY-2026-05-06` (watch-status finding); `D-M1-CP4b-AC14-TIER2-ADR-AMENDMENTS-2026-05-06` (first observation — worked-example fix); `/website/scripts/verify-translation-sandwich.ts` (the harness with the structural pivots applied).

### Candidate pattern (2nd recurrence — watch status) — Supabase SQL-editor empty-table confirm shows no columns (A15b 2026-06-07; A15c 2026-06-07)

**What it looks like:** A founder-verification step that says "run `select * from <new_table>;` → confirm an empty table with columns X, Y, Z" is wrong for the Supabase SQL editor. For an empty table, `select *` returns the message **"Success. No rows returned"** with **no column headers** — so the founder cannot confirm the columns this way, and the instruction reads as a failure when it is actually the healthy result. Appeared in the A15b close (`compliance_access_log`) and recurred verbatim in the A15c close (`compliance_rectification_log`); the A15b ad-hoc fix given in chat was never carried into the artifact or this register — which is exactly why it recurred.

**Proposed resolution (watch status — apply now; promote to permanent on a 3rd recurrence):** In any founder-verification block confirming a newly-created table, (a) state that "Success. No rows returned" on a plain `select *` is the expected healthy result (it proves the table exists and is empty), and (b) use a structure query that returns rows regardless of emptiness:
```
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = '<table>'
order by ordinal_position;
```
Expected: one row per column. This belongs in the lean/Critical session-close "Founder Verification" template (table-create step) so future closes inherit it without re-derivation.

**Cross-references:** `D-A15C-RECTIFICATION-ENDPOINT-BUILT-2026-06-07` (this recurrence); `D-A15B-SAR-ACCESS-ENDPOINT-BUILT-2026-06-07` (first surfacing); `/operations/handoffs/founder/2026-06-07-A15c-rectification-endpoint-close.md` Step 1.

### Stable observations (no action)

- **AC4 (Invocation Testing for Safety Functions) — formerly KG3 / KG7 build-to-wire entries, retired 2026-04-25 under DD-2026-04-25-03:** Actively applied. Grep confirmed both Growth loaders are called exactly once in production (`hub/route.ts` `case 'growth':`). Harness run in-session (16/16 assertions passed). No new observation worth logging.
- **KG6 (Composition Order Constraint):** Same resolution as Tech — persona-prompt → upgrades → context blocks → brain is the established order for this architecture. Not a violation.
- **KG2, KG4, KG5:** Not relevant this session. (Former KG8, KG9, KG10 retired under the 2026-04-25 reconciliation — see the "Retired content" block above for their new homes.)

---

## Permanent Entries (Beyond KG1–KG7) — Pre-Populated from Structured Extraction (PR5)

The KG1–KG7 slots above match the manifest's Knowledge Gaps Register schema and stay clean. PR5 additionally authorises **pre-population of permanent entries from a structured extraction pass** (e.g. a build-knowledge extraction, an ST2 stress-test triage, a session-debrief). These entries are tracked here, distinct from KG1–KG7, and are read at session open under the same scan protocol.

### KG-EX1 — Prescribe-Before-Grounding (AI failure mode)

**Status:** Permanent entry, **pre-populated 2026-05-27** from the C2 session debrief (`/operations/session-debriefs/2026-05-27_c2-r20a-perimeter-and-meta-debrief.md`) under PR5 pre-population authority. Adopted via `D-PR17-ADOPTED-WALKTHROUGH-2026-05-27` (the same session that produced PR17).

**Why it caused confusion:** Three corrections in a single session, all sharing one root: the AI reached for a recommendation, a framing, or a default *before* confirming the founder's purpose or intent. The founder has no coding experience and cannot reliably catch each recurrence; relying on the founder's pushback as the only safeguard is therefore not a safeguard at all.

**Manifestations observed (single session, three forms):**

1. Suggesting the `whole-system-data-room` git branch be **retired** as "a simpler default" — *before* asking what it was for or inspecting it read-only. (The read-only inspection that would have grounded the advice was only run after founder pushback.)
2. Framing R20a coverage **per standalone product (M-7)** when the founder's — and the test brief's own — unit of analysis is the **configuration/flow** ("distress entering at any product across the loop"). The per-product framing hid a real gap (Calling→Reasoning seam → `discovered_purpose`, which the route guard does not classify).
3. Treating "**data-room**" as the git branch when the founder holds it as a **bounded workspace methodology** ("the bounded workspace where the agent gathers the material for one piece of work and makes it legible before anyone asks for a final answer"). Framing the room as "not pulling its weight" read as dismissing a deliberate construct.

A fourth, related manifestation — defaulting to **"founder stands up the env between sessions"** — is now structurally blocked by **PR17** (live walkthroughs, no one-line operational hand-offs).

**Recurrence + generalization (2026-06-24 — guard the root, not the surface):** the same root recurred in **test / evaluation / benchmark design** — and **twice *after* this entry already existed**, proving that naming the symptom in one surface's language does not prevent the next costume. Full lineage:
- **15 Apr — CCP-R17a-01 Q6** (a verification query): the method was structurally incapable of testing its stated purpose — an `UPDATE … WHERE log_id = gen_random_uuid()` on an empty table fires no per-row trigger → *"the test proved nothing"* (a **vacuous pass**; corrected to static catalog checks).
- **28 Apr — `sage-registry-update`** (manifestation 1's sibling): the skill's scope *"answered the wrong question"* vs the founder's actual end-goal.
- **27 May — C2** (manifestation 2 above): a *"partially mis-framed diagnostic"* — per-product unit when the purpose was per-flow.
- **10–11 Jun — the P1 bare-vs-harnessed "value demonstration"** and **22 Jun → 24 Jun — the S6 value-gate matrix**: both tested **decision-change / "does the harness beat bare"** (an *intervention*-effect frame) when the practice's value is **measurement / fidelity** (an *instrument*). A measure tested for *effect* reads a structurally-guaranteed false *"no benefit."* Reframed under ADR-012.

**The root (one failure, many costumes):** the work was **framed / scoped / methodised *before* being grounded in the founder's actual purpose + success criterion.** The surface changes each time — a verification query → a skill scope → a diagnostic's unit → a benchmark's axis — which is why each recurrence does not *feel* like the same mistake and slips past a surface-specific guard. **Do not patch this with another per-surface row — that just teaches the root a new costume.** Guard at the root: purpose + success-criterion *before* method.

**Plain-language resolution (carry forward — apply at every code-elevated/critical session open and at each major recommendation):**

1. **Before recommending removing, retiring, simplifying, or consolidating** something the founder set up deliberately: **confirm its purpose first** — ask, or inspect read-only — *then* advise. Do not present a "tidy default" before grounding.
2. For **coverage / quality / sufficiency questions**: default to the **flow / configuration / user-facing unit of analysis**. Treat per-component findings as input, not verdict. **Surface the audience dimension proactively** (human user message vs agent developer notification).
3. **Hold the founder's named concepts as methodologies first, mechanics second.** A "data room" is a workspace; a "perimeter" is a design property; an "ADR" is a decision record. Do not let a tooling view (a folder, a branch, a flag) read as a verdict on the concept.
4. **When a recommendation would create between-session burden on the founder, convert it into an in-session walkthrough** (PR17) rather than a deferred task.
5. **Treat founder pushback as high-signal evidence**, not as a request to defend. Re-examine genuinely. The founder's instincts have been repeatedly correct against AI defaults.
6. **Before choosing any method — and especially before designing a TEST / EVALUATION / BENCHMARK / VERIFICATION — state the *construct under test*, the *success criterion in the thing's own terms*, and the *purpose hypothesis*, and confirm them with the founder *before* building.** Two gates: **(a) instrument vs intervention** — if the thing's value is *measurement / fidelity* (a profile, a score, an observability tool), its success criterion is *fidelity*, and a comparative-outcome benchmark ("does it beat baseline") is the wrong shape and will read a false null — stop and redesign; **(b) the vacuous-pass check** — *if this test passes, could it have passed while the thing was broken?* (the CCP-Q6 trap).

**Founder redirect phrases (for the founder to use mid-session when something feels off — no technical knowledge required):**
- *"Where are we in the arc?"* — forces the AI to recite carried-forward state.
- *"What's the unit of analysis here?"* — catches narrow framing.
- *"Are you grounding this in my purpose first?"* — catches prescribe-before-grounding.
- *"Are you reducing this to a one-line hand-off?"* — PR17 trigger.
- *"What's the purpose, and what observable proves it — before you pick the method?"* — the root catch (grounds method/test/scope in purpose).
- *"Are we testing this as an instrument or an intervention?"* — catches a measure tested for effect (a measure's success is fidelity, not beating a baseline).
- *"If it passes, could it have passed while broken?"* — catches a vacuous test.

**When this matters:** Any session in which the AI is about to recommend removing / simplifying / consolidating something the founder set up; choose a framing or unit of analysis for a quality/coverage question; or defer work to the founder. Engage at session open + at each major recommendation. Also see `/adopted/standing-protocol-cache.md` §"AI failure modes to watch for at session open" — the cache surface that brings this to attention every session.

**Observation history:** First observed 2026-05-27 across three distinct manifestations within a single C2 session (sufficient for PR5 pre-population from a structured extraction; recurrence count = 1 session, multi-manifestation). Pre-population to permanent Entry status is the deliberate, founder-elected response. **Generalised 2026-06-24** (`D-AI-FAILURE-MODE-METHOD-BEFORE-PURPOSE-GENERALISED-2026-06-24`): a cross-session analysis (founder-prompted) found the same root across **≥5 instances spanning 15 Apr → 24 Jun**, including **twice in test design (P1, S6) *after* this entry already existed** — establishing it as a persistent, multi-surface root failure (method/scope/frame before purpose), not a single-session pattern. The recurrence-despite-capture is itself the lesson: surface-specific naming does not generalise; the guard must sit at the root.

---

### KG-EX2 — Lesson-Cited-Not-Tested (AI failure mode)

**Status:** Permanent entry, **pre-populated 2026-08-24** from the project-reflections structured extraction pass (`operations/reflections-examination-2026-08/2026-08-23-stage1-extraction.md`, 105 entries) under PR5 pre-population authority — the same route KG-EX1 took. Adopted via `D-KG-EX2-LESSON-CITED-NOT-TESTED-PREPOPULATED-2026-08-24`, executing **IW-2 route (b)** as ruled at `D-REFLECTIONS-EXAMINATION-SECOND-RULING-ROUND-FOLDED-2026-08-23`.

**This entry is the tracking layer, and only that.** The ruling is explicit that route (b) is *"retained only as the tracking layer beneath both, never as a standalone fix"* — because adding a citable entry to the register is exactly the move the pattern defeats. KG-EX1's own warning applies to this entry as much as to any: *"Do not patch this with another per-surface row — that just teaches the root a new costume."* **If this entry is ever cited without the current instance being tested against it, it has been used as the failure, not against it.**

**Why it causes confusion:** the governing corpus grows without a corresponding fall in the failures it names — and the growth itself becomes a cost. A lesson is consulted, correctly recalled, and not applied to the case in hand, so the record shows a project that has learned something it has not changed.

**The root:** **a citation is a cheap discharge of an expensive obligation.** Citing a lesson costs one lookup; testing the current instance against it costs a real check — and **nothing in any record distinguishes the two.** A session that cites and a session that tests produce identical artifacts.

**Manifestations observed (from the 100-reflection corpus; each verified at source):**

1. **R099 — the decisive instance.** The relevant memory was consulted *while designing the very fan-out that then committed the failure*, because the half of the lesson that applied was not the half that was remembered: *"I applied the half about racing while missing that the same class contains destruction."* The same reflection quotes PR23's own caveat — *"citing a memory without testing the current instance against it discharges the letter and not the purpose"* — in the session that broke it. It also names why the catch was luck: *"what caught it was re-reading my own output because something felt unfinished — not a discipline I'd built … a habit that depends on a feeling is not a habit."*
2. **R016 — the lesson arriving one step late.** A file's protective machinery was found only after four phases of work sat on top of it. The session's own formulation: *"when a build prompt names a specific file to edit, check that file's own protective machinery (tests, freezes, guard comments) before starting, not opportunistically later."* Honest note: the fix was cheap *"because the edits happened to be purely additive, but that was the shape of this particular change, not a property of my process."*
3. **The rule stated in the same breath as the breach** — the shape that distinguishes this from ignorance. R089: *"the lesson's form is verify before reproducing, not reproduce then verify,"* written in the reflection reporting two citations reproduced from memory. R101: *"The claim is currently ahead of its basis by exactly the margin of three still-running agents."* R023: *"I assented to my own construction against a standard I had just finished reading."*
4. **PR23 is itself an instance.** The rule that mandates memory-first states its own failure mode in its own text and has been broken in its presence. That is the sharpest available evidence that another rule of the same shape will not close this.

**Additional manifestations named in the findings record's IW-2** and not re-derived here: R019, R044, R065, R097. Cite them from `§4 IW-2` and check them at source before relying on any one of them.

**Why this is the meta-weakness:** it is the reason the *other* weaknesses persist after being written down. Every other entry in this register depends on being applied, and this is the entry about not applying entries.

**Plain-language resolution (carry forward — apply at every session open and at each point a lesson is recalled):**

1. **When you cite a lesson, name the check you ran against *this* instance.** Not the lesson's content — the check. If you cannot name one, you have recalled, not applied.
2. **Assume you have remembered the wrong half.** R099's failure was not forgetting the memory; it was recalling the half that did not bind. Re-read the source, do not work from the recollection.
3. **A catch that depended on something feeling unfinished is not a discipline.** Record it as luck, and say so, rather than as evidence of a working habit.
4. **Where a lesson names a mechanically checkable property, prefer converting it to a check over citing it** — but note the constraint route (a) established: a lesson converts cheaply only where the property is one the repo *currently holds*. Where the repo violates it, conversion is a remediation project, not a tooling task. See `operations/reflections-examination-2026-08/2026-08-24-iw2-route-a-lesson-to-check-triage.md`.
5. **Accept that a portion of this is irreducible, and name it rather than hedging it.** Ruled 2026-08-23: rules are scaffolding for sustained attention (*prosoche*); they do not substitute for it. A reader who concludes better rules alone will close this has misread the finding.

**Founder redirect phrase — SUPPLIED 2026-08-24, once route (c) was scoped.** *"That's the rule — what did the check return?"* Live in `/adopted/standing-protocol-cache.md` §"AI failure modes to watch for at session open" (row: **Lesson cited, not tested**), adopted under `D-ITEM4-TRIGGER-LEGIBILITY-SCOPED-AND-REDIRECT-PHRASE-ADOPTED-2026-08-24`. **What the founder observes — the legibility property the phrase depends on:** *"I asked whether something holds. I was told what a document says."* No knowledge of the lesson, the code, or this failure mode is required — only the shape of the answer. **It is exposure-keyed, which means it fires on correct citations too, by design:** a genuine check answers it in one sentence, so a false positive costs a sentence. **The phrase concedes the citation and asks for the one thing a citation cannot supply** — it requires an action to satisfy, not a recitation, the same property that made PR25's form the right one. Scope and reasoning: `operations/reflections-examination-2026-08/2026-08-24-item4-trigger-legibility-combined-scope.md` §3. **The residual risk, not designed away:** the phrase depends on the founder hearing the distinction between "the rule says X" and "I checked and found Y". That distinction is audible but not automatic, and there is no evidence yet about how reliably it is heard.

**When this matters:** any session that recalls, cites, or is handed a prior lesson, memory, rule, or precedent — which is every session, at open and at each recurrence-shaped diagnosis. Engage alongside PR23 rather than instead of it: PR23 governs *consulting* the memory; this entry governs the step after.

**Observation history:** Extracted 2026-08-24 from a structured pass over 100 substantive session reflections spanning 2026-07-19 to 2026-08-22. The findings record's trajectory measurement is the load-bearing fact: **verification practice improved measurably across the corpus while lesson-transfer stayed flat — SC-2 is as clear at the end of the record as at the beginning.** That flatness, across five weeks in which the governing corpus grew, is what promoted this to a permanent entry rather than a watch-status candidate. **Sufficient for PR5 pre-population; PR8's third-recurrence bar is amply exceeded independently.**
