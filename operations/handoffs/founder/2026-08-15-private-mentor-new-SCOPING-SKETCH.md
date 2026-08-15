# `/private-mentor-new` — scoping sketch: the deterministic engine as the mentor's core (2026-08-15)

**Status: SKETCH — documents only, nothing scoped-for-build, nothing licensed.** Written in answer
to the founder's question: *what would it take to create a `/private-mentor-new` page that uses the
new engine mechanisms, with revised context material (live L2b journal entries, up-to-date project
context, the mentor knowledge base), providing additional commentary at the end of the stock
deterministic translation output — examining that output in relation to the context?*
Companion to `operations/future-directions/2026-08-15-self-examination-moment-investigation-and-response.md`
(Part 2 — the old page's architecture and its measured defects).

---

## 0 — The governing collision, named first

**This ask is Layer-3-per-consumer-rendering territory.** A practitioner-contextualised rendering
layer over the deterministic verdict is precisely what the OPEN scoping session
`operations/agent-circles-2026-08/2026-08-12-SESSION-layer3-per-consumer-rendering-SCOPING-RECORD.md`
exists to design (now carrying the widened Stage 2 relational-context scope), and
`SUBSTRATE_LAYER3_ENABLED` is Verified-NOT-Live by standing decision (S7), with activation
explicitly not licensed by that record. That session is `OPEN — awaiting ruling`, and the
"who runs it" ambiguity is mentor question M2. **So the design ruling belongs to that session;
this sketch is an input to it, not a design of record.** Nothing here pre-answers its questions.

## 1 — The architecture the ask implies (deterministic-first, commentary-bounded)

Per chat turn:

1. **R20a distress check** on the founder's message (route-level, before anything else).
2. **The engine examines the message text alone** — a standard-depth consult through the live
   translation sandwich (Sonnet Layer-1 extraction at 0.2 → deterministic Layer-2 → signed
   assessment → Layer-3 prose at 0.3). **No practitioner/project/world context enters the
   examination input.** This is the clean-separation principle: the engine judges the reasoning;
   context never contaminates the judgment. (It aligns with the direction the mentor already ruled
   on 2026-08-11 for agent calls — pure examination — and structurally retires the
   unlabelled-injection defect class for this surface.)
3. **The stock deterministic output renders first, verbatim**: the Layer-3 narrative plus the
   honest extraction facts (proximity + floors, passions/sub-species, circles + obligations,
   kathekon quality) — the instrument's voice, visually distinct.
4. **Then the commentary call** — one bounded LLM pass whose input is (the deterministic verdict)
   + (live L2b) + (project summary) + (mentor KB), and whose job is to *situate* the verdict:
   relate it to the practitioner's recent entries and recurring passions, to the project moment,
   and to what the record suggests is worth further consideration. Appended to the chat as a
   **labelled commentary block** — non-doctrinal, unsigned, generated.

### The commentary discipline (the one genuinely new mechanism)

- **No-override:** commentary may relate, situate, question, and invite; it may never revise,
  soften, or contradict the verdict. The verdict text is immutable and displayed first —
  record-and-comment, the same monotone shape as the corroboration check's record-and-floor.
- **Provenance labelling:** every commentary block carries its class on its face ("Commentary —
  contextual, non-doctrinal, not part of the signed assessment"), the `context_source`/
  `examined|observed` marker family applied to a new surface.
- **Window policy — the decisive lesson from the old page:** prior *commentary* is **excluded**
  from future commentary calls. The old page's window was measured at ~85% the mentor's own prior
  output, a self-conditioning loop that recirculates generic drift. Here the conversational memory
  the commentary sees is: the founder's messages + the deterministic verdicts (+ optionally
  distilled observations) — never its own past prose. Generic-Stoic drift then cannot compound;
  each commentary is re-anchored to instrument output.
- **Anchorage encouraged by construction:** the commentary prompt requires citing which context
  item each point draws on (journal entry date, passion trend, project decision) — the P-A2
  anchorage discipline applied from birth.

## 2 — What already exists to reuse (PR15 inventory)

| Piece | Status |
|---|---|
| `/api/reason` human-JWT path | **Live** — the route accepts user-session JWT today (`reason/route.ts:678`); R20a-covered; returns signed assessment + extraction + prose; `assessment_first` deferral exists for latency shaping |
| The deterministic engine | Live (ADR-010 §4 native dikaiosyne, corroboration check, signing) — **import/call only; its files are edit-frozen (byte-identity guard) and its contract is fenced during the validation run — a new *caller* is concurrent-safe** |
| Practitioner profile | Same store both surfaces already share (`mentor_profiles`, `mentor_journal_refs`, snapshots via `practitioner-context.ts`) |
| Mentor KB (world/historical context) | `getMentorKnowledgeBase()` — reusable verbatim, safeguard labels included |
| Project context | `getProjectContext('summary')` (~180 tokens) — reusable; freshness is a maintenance cadence question, not a build question |
| Conversation persistence | `founder_conversations` tables (or new sibling tables) |
| Activation pattern | The S7 `/impulse` walk — new human route joins the R20a perimeter as a Critical, founder-walked flag activation with a both-directions live distress smoke |
| Journal ingestion pipeline | `sage-mentor/journal-data` ingestion → profile + `mentor_journal_refs` — reusable for refreshing the profile from newly uploaded journal text (founder-performed uploads) |

## 3 — What is genuinely new (the build list)

- **B1 — the live L2b loader (`practitioner-context-v2`)**: composes recent, owner-scoped rows
  from the live practice tables — `journal_entries`, `reflections`, `passion_events` (+ trend
  tables), `oikeiosis_reflections`, `circle_extension_entries`, `impulse_entries`,
  `morning_preparation_entries`, `sage_compass_entries`, `view_from_above_entries`,
  `premeditatio_entries`, `reserve_clause_entries`, milestones — N-recent per table under a token
  budget, alongside (not replacing) the ingested profile and topic-matched `mentor_journal_refs`.
  This is the "up to date journal entries from the website" half: the current loader reads the
  one-time ingestion; the practice tables are where today's entries actually live.
- **B2 — the commentary module**: one bounded call (Sonnet-class, low temperature, hard
  `max_tokens`), system = the commentary charter (§1's discipline) + KB; input = verdict + L2b-v2
  + project summary. Pure module, unit-tested like the engine's siblings.
- **B3 — the wrapper route** (e.g. `POST /api/mentor/private/consult`): orchestrates
  R20a → engine consult → persistence → commentary; joins the **R20a route-level perimeter**
  (the fifteenth member — registry arrays + guard test updated; AC5); rate-limited; new tables
  wired into **R17 data-rights** (access/export/delete) and **PR24 retention** from birth.
- **B4 — the page** (`/private-mentor-new`): chat UI rendering verdict-block + commentary-block
  distinctly; conversation history; SupportFooter; honest widget behaviour (no hardcoded metrics —
  the proximity data can now be *real*, from the turn's own assessment).
- **B5 (optional, gated on M7)**: the guide-reflection standing closing slot from birth, with the
  P-A2 provenance fields — this page would be the first surface designed under that discipline.

## 4 — Effort and sequence (honest estimate)

1. **Session A — `governance`**: fold this sketch into the Layer 3 per-consumer rendering scoping
   session when it runs (mentor-gated; M2 decides who runs it). The rulings needed: the commentary
   charter's exact bounds; the window policy; whether commentary may pose questions to the
   practitioner (the guide function); labelling wording; whether this page *supersedes or
   coexists with* `/private-mentor`.
2. **Session B — `code-critical` build** (realistically 1–2 sessions): B1–B4 dark behind a flag,
   full battery + PR19 adversarial review (with the founder's pause-before/pause-after model-
   setting discipline), measurement-neutrality preserved (imports only; no engine-file edits).
3. **Founder-walked activation** (Critical, AC7/PR6): flag flip + both-directions live distress
   smoke + perimeter verification — the S7 pattern.
4. **Optional founder-performed**: upload current journal text → re-run ingestion to refresh the
   profile/journal-refs layer.

**Per-turn cost/latency**: two Sonnet-class calls (the engine's Layer-1 + Layer-3, plus the
commentary) ≈ the old page's cost with radically different guarantees; standard-depth consult
~20–40s + commentary ~10–20s; `assessment_first` can surface the verdict before the prose if
responsiveness matters.

## 5 — What this sketch does not do

Does not run or pre-answer the Layer 3 scoping session; does not license `SUBSTRATE_LAYER3_ENABLED`
or any build; does not retire `/private-mentor` (a separate election once the new page proves out);
does not touch the fenced surfaces (the new page is a new *caller* of `/api/reason`, not a change
to it); and the commentary is advisory by the channel law — never a trust-record input, weights
BLOCKED as everywhere.

*End of sketch.*
