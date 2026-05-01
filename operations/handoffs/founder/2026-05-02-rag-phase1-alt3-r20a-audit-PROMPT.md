# Next-Session Prompt — Deliverable 24 (R20a Perimeter Workflow Audit)

**Stream:** founder. **Tier:** founder/tech, governance scope.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Predecessor session close:** `/operations/handoffs/founder/2026-05-01-rag-phase1-alt3-drafts-close.md` (with Option 1 / path-(b) addendum at the end).
**Architecture brief:** `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` (Adopted — alt 3 is the foundational architecture).

This session is a **workflow audit**, not a design session. No code is written, no design is committed beyond the audit's findings. The deliverable is a single document — `/drafts/rag-mentor-alt3/consumer-workflow-audit.md` — that walks each of the eight R20a perimeter routes end-to-end at the depth of the evening-reflection walkthrough produced in the 2026-05-01 session.

**Why this session exists.** The 2026-05-01 critical-path drafting session ended with an in-session ecosystem audit (registry-level) and an evening-reflection workflow walkthrough (workflow-level). The walkthrough surfaced an architectural ambiguity that the registry-level audit had missed: `/api/mentor/private/reflect` serves two distinct practitioner flows (daily-reflection ritual + deferral-resolution surface) on the same code path, and AC-18 should scope to the deferral-resolution surface only (Option 1, adopted 2026-05-01). The same kind of flow ambiguity could exist in any other R20a perimeter route. This session does the workflow-level audit for the rest of the perimeter so Phase-1 session 2 builds on top of resolved flow distinctions, not unresolved ones.

---

## Part A — Open the session under the protocol

Per `/adopted/session-opening-protocol.md` Part A elements 1–8, do the full read sequence. Tier: founder/tech, governance scope. Read:

### Required context

1. `/manifest.md` — particularly AC5 (R20a enforcement perimeter — the eight POST routes named), AC3 (Zone 2 clinical adjacency domains), AC4 (invocation testing for safety functions), R20a–R20d.
2. (Project instructions — already in system prompt)
3. **`/operations/handoffs/founder/2026-05-01-rag-phase1-alt3-drafts-close.md`** — the predecessor session close. **Read in full, including the addendum at the end.** The addendum captures Option 1 (AC-18 scoping correction) and the path-(b) sequencing decision that produced this audit session.
4. **`/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md`** — the alt-3 architecture brief. AC-1 through AC-19. Read in full.
5. **`/drafts/rag-mentor-alt3/canonical-framework.md`** — Deliverable 2 (with Option 1 amendment to Table 4). The 9+1 mechanism taxonomy. The audit references it for projection rules.
6. **`/drafts/rag-mentor-alt3/passion-taxonomy.md`** — Deliverable 3.
7. **`/drafts/rag-mentor-alt3/operationalised-rules.md`** — Deliverable 8.
8. `/operations/decision-log.md` — at minimum the last six entries (`D-MENTOR-PIPELINE-SNAPSHOT-2026-04-29`, `D-PRIVATE-MENTOR-OBSERVER-CULL-2026-04-29`, `D-RAG-MENTOR-ALT3-ADOPTED-2026-04-29`, `D-RAG-MENTOR-ALT3-PHASE1-DRAFTS-2026-05-01`, plus any founder-approval entry on the critical path).
9. `/operations/knowledge-gaps.md` — KG3 (hub-label end-to-end contract) is directly relevant; KG1 (Vercel rules), KG2 (Haiku reliability), KG6 (composition order) are relevant for any flow that the audit traces through context loaders.
10. `/archive/2026-04-29_end-to-end-mentor-pipeline_snapshot.md` — the existing rollback baseline for the conversation surface. The audit's per-route walkthroughs follow this format.
11. `/archive/2026-04-29_end-to-end-founder-hub-mentor_parked.md` — the founder-hub-scoped reference (parked).

### Per-route source files (read each route + its calling page)

**Route 1 — `/api/score` (sage-score, P3 wrapper around `runSageReason(standard)`):**
12. `/website/src/app/api/score/route.ts` — read in full.
13. `/website/src/app/score-action/page.tsx` (or wherever `prod-action-scorer` lives — find via Glob if path is uncertain).

**Route 2 — `/api/score-decision`:**
14. `/website/src/app/api/score-decision/route.ts` — read in full.
15. The page that calls it (identify via Grep on `'/api/score-decision'`).

**Route 3 — `/api/score-document` (sage-audit, uses `engine-doc-scorer` not `sage-reason-engine`):**
16. `/website/src/app/api/score-document/route.ts` — read in full.
17. `/website/src/app/score-document/page.tsx` (or wherever `prod-doc-scorer` lives).

**Route 4 — `/api/score-scenario`:**
18. `/website/src/app/api/score-scenario/route.ts` — already read in the predecessor session; reference rather than re-read.
19. `/website/src/app/scenarios/page.tsx` (or wherever `prod-scenarios` lives).

**Route 5 — `/api/score-social` (sage-filter):**
20. `/website/src/app/api/score-social/route.ts` — already read in the predecessor session; reference rather than re-read.
21. `/website/src/app/social-filter/page.tsx` (or wherever `prod-social-filter` lives).

**Route 6 — `/api/reason` (universal reasoning layer):**
22. `/website/src/app/api/reason/route.ts` — already read in the predecessor session; reference rather than re-read.
23. Identify all callers via Grep on `'/api/reason'` — this route is called from many places (page-side proximity ring widget on `/private-mentor`; potentially other surfaces). Audit lists every caller.

**Route 7 — `/api/reflect` (public sister to `/api/mentor/private/reflect`):**
24. `/website/src/app/api/reflect/route.ts` — read in full.
25. The page that calls it (likely `/reflect` or similar; identify via Glob/Grep).

**Route 8 — `/api/mentor/private/reflect` (private reflect, founder-only):**
26. `/website/src/app/api/mentor/private/reflect/route.ts` — already read in the predecessor session; the evening-reflection walkthrough in the predecessor close documents this flow.
27. `/website/src/app/private-mentor/page.tsx` — already read in the predecessor session; reference the EveningView, MorningView, and `submitRitual` function for both flows (morning + evening).

### Confirmations at session open

- Tier: founder/tech, governance scope, audit work.
- Hold-point status: P0 0h still active. Audit is permissible (registry inspection + read-only code reads + design documentation; no live-system effect).
- Model selection (PR4): not engaged (no code).
- Status vocabulary (0a + 0f, D14): the audit produces a Drafted document; per-route findings carry implementation status only as observations of as-built behaviour.
- Signals + risk classification: confirmed. The audit itself is Standard under 0d-ii.

---

## Part B — Verify state

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git status -s
```

Expected: only the 2026-05-01 changes from the predecessor session (the three critical-path drafts under `/drafts/rag-mentor-alt3/`, the session close with addendum, the Phase-1 session-2 prompt with Option 1 update, the archive backups, and this prompt). No other modifications.

If the founder has signalled approval of D2, D3, D8 by moving them to `/adopted/`, expect those moves and an associated decision-log entry.

If anything else appears, ask the founder before proceeding.

---

## Part C — Produce Deliverable 24

Output: a single document at `/drafts/rag-mentor-alt3/consumer-workflow-audit.md`.

### Structure

**Header section.**
- Status: Drafted (under founder review).
- Date: (the session's date).
- Implements: AC-7 / AC-12 audit precondition; Option 1 (AC-18 scoping) verification across the perimeter.
- Cross-references to D2 (canonical framework), the predecessor session close, and the alt-3 architecture brief.

**Plain-language summary.**
What the audit is for. What the eight routes are. What the audit does NOT do (does not redesign; does not edit; does not propose Phase-2 build changes — that is for D14a / D14b and the rest of Phase-1 session 2).

**Audit method.**
For each of the eight routes, the audit captures:

1. **Server-side workflow** — every step from request entry to response return. Use the format of the predecessor session's evening-reflection walkthrough (numbered steps; rate-limit + auth + R20a + context-load + LLM call + persistence + analytics + response build).
2. **Page-side workflow** — every step from button-press on the page to the rendered result. Use the format of the predecessor walkthrough (numbered steps; capture + outbound POST + receive + render + side-effects).
3. **Flow distinctions** — does this surface serve more than one practitioner flow on the same code path? (The /api/mentor/private/reflect flow ambiguity is the canonical example: daily-reflection ritual vs deferral-resolution surface.) If yes, name each flow and what distinguishes them.
4. **AC-18 shape** — does this surface produce visible output to the practitioner? If yes, identify which fields and whether AC-18-shaped scoping treatment is needed (deferral-resolution surface holds AC-18; ritual / scoring / classification surfaces preserve visible output).
5. **AC-13 shape** — does this surface need intake clarification (Tier 1 force / Tier 2 soft / Tier 3 OPEN_DEFERRAL) before the engine proceeds? Identify any natural trigger conditions in the existing flow.
6. **AC-17 shape** — does this surface produce outputs that depend on `SELF_REPORT_DEPENDENT` or `CONFIDENCE_WEIGHTED` data? (Most do, to some extent. Be specific about which.)
7. **Phase-3+ migration projection** — how does this consumer's existing output shape project from the canonical framework's 9+1 mechanism set? Reference D2 mapping tables 1–5 where applicable; flag any output fields not yet covered by D2.
8. **As-built rollback baseline pointer** — does this consumer have an existing snapshot? If not, name what a snapshot would capture so it can be produced before any future migration.

### Per-route sections (in order)

Eight H2 sections, one per route. Recommended depth: 1500–2500 words per route. Estimated total: 12,000–20,000 words.

For Route 8 (`/api/mentor/private/reflect`), reference the evening-reflection walkthrough in the predecessor session close as the server-side + page-side workflow capture, then add the morning-reflection walkthrough as the symmetric flow (same `submitRitual` function, same endpoint, no `how_i_responded` field). Per-route flow distinction is already named (daily-reflection ritual vs deferral-resolution surface — Option 1).

For Routes 4 (`/api/score-scenario`) and 5 (`/api/score-social`), the route source was already read in the predecessor session. The audit can reference that without re-reading. Add the page-side walkthrough fresh.

For Route 6 (`/api/reason`), enumerate every caller via Grep. Each caller is its own micro-flow (the proximity ring widget on /private-mentor is one; the `runSageReason` calls from sage-* tools are others). The audit captures the route's behaviour once and lists callers.

### Findings section (after the eight per-route sections)

After the per-route audits, summarise findings:

- **Flow ambiguities discovered.** List any surface where a single code path serves more than one practitioner flow. For each, recommend whether the flows should be split (like Option 1 split for /api/mentor/private/reflect).
- **AC-18 scoping refinements.** List any surface where AC-18 needs scoping treatment beyond what Option 1 covered.
- **AC-13 trigger surfaces.** List any surface where Tier-1 forced clarification logic should be designed in for Phase-2 build.
- **AC-17 seams.** List any surface where `SELF_REPORT_DEPENDENT` / `CONFIDENCE_WEIGHTED` flagging should be added.
- **Coverage gaps in D2 mapping tables.** List any consumer whose existing output shape isn't yet mapped onto the canonical framework.
- **Snapshots needed.** List any consumer that needs an as-built rollback snapshot before its eventual migration to alt-3 in Phase 3+.
- **Phase-1 session-2 scope changes.** List any deliverable in the Phase-1 session-2 plan whose scope changes as a result of audit findings (e.g., D14a / D14b refinements, D11 Layer 3 specification additions, D13 three-tier intake additions).

### Recommendations section

- Whether Option 1 (the AC-18 scoping correction adopted 2026-05-01) is sufficient as written, or whether further scoping refinements are needed.
- Whether Phase-1 session 2 should proceed as scoped, or whether further deliverables should be added (e.g., a per-consumer projection map deliverable).
- Whether any consumers are urgent enough to warrant snapshotting before Phase-1 session 2 begins (the eight R20a perimeter routes are the safety-critical scope; Trust Layer and journal pipeline are lower-priority and can be deferred).

### Approval gate

Phase-1 session 2 does not begin until the founder has reviewed and approved (or sent back) Deliverable 24's findings and recommendations.

---

## Part D — Decision-log entry

Append to `/operations/decision-log.md`:

`D-RAG-MENTOR-ALT3-PHASE1-AUDIT-YYYY-MM-DD` — Status: Drafted — under founder review. Cross-references: D-RAG-MENTOR-ALT3-PHASE1-DRAFTS-2026-05-01, D-RAG-MENTOR-ALT3-ADOPTED-2026-04-29, the audit deliverable file, this prompt, the audit-session close.

The entry should record: (a) the audit was conducted at the founder's direction following the AC-18 scoping question; (b) the eight routes covered; (c) the headline findings (number of flow ambiguities, AC-18 scoping refinements, snapshots needed); (d) the rules served (R0 oikeiosis audit trail, 0a status vocabulary, 0c verification framework, 0d-ii Standard, 0f decision log, R5 cost-as-health-metric awareness across the perimeter, R20 vulnerable user safeguards across the perimeter, KG3 hub-label end-to-end contract, PR1 single-endpoint discipline preserved, PR5 knowledge-gap carry-forward); (e) the risk classification (Standard for the audit itself; Elevated for any consequent design changes to D14a/D14b; Critical for the eventual Phase-2 builds).

---

## Part E — Session close

Produce a session close at `/operations/handoffs/founder/YYYY-MM-DD-rag-phase1-alt3-r20a-audit-close.md` per protocol Part C. Include the standard 0b minimum (Decisions Made / Status Changes / Next Session Should / Blocked On / Open Questions) plus the extensions for governance work (Verification Method Used / Risk Classification Record / PR5 / Founder Verification).

If the audit findings change the Phase-1 session-2 scope (likely — flow ambiguities surface design changes), update the Phase-1 session-2 prompt at `/operations/handoffs/founder/2026-05-01-rag-phase1-alt3-NEXT-SESSION-PROMPT.md` with the changes (with backup per D6-A archive protocol). The "Next Session Should" in the audit-session close points to the updated Phase-1 session-2 prompt.

---

## Important context

- **Founder is a non-coder.** Plain-language explanations. Define every technical term first time it appears. Walk each flow as if the founder had not read the code.

- **Founder decides direction.** AI surfaces options with reasoning. Recommendations come from the audit, not prescriptions.

- **Audit is design-aware but not design-committing.** The audit captures findings and surfaces recommendations. It does NOT redesign D14a / D14b or change D2 / D3 / D8. Design changes follow founder approval of the audit findings, in Phase-1 session 2.

- **Honest disclosure throughout.** Where a flow is non-obvious or where an interpretation could go either way, name the ambiguity rather than resolving it silently.

- **No-shareable-artifact constraint (AC-18) is now scoped per Option 1.** The audit verifies whether Option 1's scoping (deferral-resolution surface only) is sufficient for the eight perimeter routes, or whether further scoping is needed. AC-18 is preserved as architectural commitment on the surface where it applies.

- **Reflect-endpoint-first build order (AC-19) is preserved.** Phase 2 pass 1 still builds the deferral-resolution surface (now D14b) first. The audit does not change this.

- **R20a perimeter is safety-critical.** The eight routes per AC5 carry distress-detection wiring. Any audit finding that touches the distress classifier, Zone 2 classification, or Zone 3 redirection logic is automatically Critical under PR6 — but the audit itself only documents existing behaviour, not changes to it.

- **Critical path approval is the precondition (alongside this audit).** The Phase-1 session-2 prompt requires both (a) founder approval of the critical path D2 / D3 / D8 and (b) this audit deliverable to be drafted and reviewed. If the founder has not yet approved the critical path, this audit can still proceed (it is not blocked on critical-path approval), but Phase-1 session 2 is blocked on both.

- **Risk classification:** the audit itself is Standard under 0d-ii (drafts in `/drafts/`, no live-system effect, no code touched, no manifest edit). Findings that recommend design changes to D14a/D14b or the alt-3 architecture become Elevated when adopted; Critical when implemented in Phase 2.

---

## Standing reminders

- Single source of truth: `/drafts/rag-mentor-alt3/`. The audit deliverable is one new file added to this folder.
- Per-route depth matches the predecessor session's evening-reflection walkthrough. Do not under-audit any route to save space; do not over-audit by enumerating implementation details below the workflow level.
- Decision-log entry per session per PR7 — including for explicitly deferred decisions.
- Provide the founder with verification methods for any audit finding that recommends a design change (URLs, expected results, or copy-paste commands as applicable). This audit should not produce live-surface verification needs because it is read-only.
- Do not propose code changes. Do not propose database migrations. Do not propose feature additions. The audit captures as-built behaviour and surfaces architectural ambiguities; design changes follow founder review.
- Do not edit the manifest. Manifest edits follow D6-A archive protocol and require Elevated approval.
- Do not migrate the founder-hub flow. Founder-hub is parked.
- Do not commingle the alt-3 design with prior alternatives. Their handoffs are the reasoning trail.
- Do not propose features that produce shareable artefacts on the deferral-resolution surface. AC-18 is binding on that surface (Option 1 scoping).
- Do not propose build sequencing that builds the conversation surface before the deferral-resolution surface. AC-19 is binding.

---

## Estimated session size

The eight routes vary in complexity:

- Route 8 (`/api/mentor/private/reflect`) is largely captured already — reference the predecessor session's evening-reflection walkthrough; add the morning-reflection symmetry. ~500 words new.
- Routes 4–5 (`/api/score-scenario`, `/api/score-social`) had route source read in the predecessor session — add page-side flows + AC-shape analysis. ~1500 words each.
- Route 6 (`/api/reason`) has multiple callers; enumerating them is the work. ~2000 words.
- Routes 1, 2, 3, 7 are unread — full server + page audits. ~2000–2500 words each.
- Findings + recommendations sections. ~2000 words.

**Total estimate:** 12,000–18,000 words. Tractable in one session if the agent stays disciplined to the workflow level (not the implementation level). If it goes long, the agent splits the deliverable: produce Routes 1–4 in this session; Routes 5–8 in a follow-up. Findings + recommendations in whichever session completes the eighth route.

---

End of prompt. Confirm receipt and full Part A read before proceeding to Part B.
