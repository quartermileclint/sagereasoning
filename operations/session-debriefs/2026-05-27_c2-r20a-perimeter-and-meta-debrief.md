# Session Debrief — 2026-05-27 — C2 R20a Perimeter Arc + Meta-Learnings

**Stream:** founder.
**Produced under:** Founder request 2026-05-27 (end of session) per project-instructions 0b-ii (Session Debrief Protocol).
**Adoption status:** Produced learnings adopted as **PR17** (`D-PR17-ADOPTED-WALKTHROUGH-2026-05-27`) and **KG-EX1** (pre-populated permanent entry in `/operations/knowledge-gaps.md` under PR5 pre-population authority). Standing-protocol-cache amended with an "AI failure modes to watch for at session open" subsection.
**Authoritative session close:** `/operations/handoffs/founder/2026-05-27-r20a-config-perimeter-adr-adopted-close.md`.

---

## 1. What happened (the arc)

A long, multi-phase session that began as C2 (R20a distress perimeter, code-critical) and broadened into an architecture reframe + meta-learning capture:

1. **C2 Step-1 diagnostic + harness.** Code-read mapped R20a coverage of the four product entries the loop drives → finding **M-7** in `data-room/99_review/missing-context.md`. Built `run-c2.ts` (build-only + live modes; PR1 — `/api/reason` first) + `C2_DISTRESS_INPUT` vetted from the existing eval suite. Sandbox-verified: build-only PASS + EXIT 0; `npx tsc --noEmit` EXIT 0. **CCP for the TEST flag flip drafted and deferred** per founder election (live exercise mainly re-confirms `/api/reason`, which A7 already Verified).

2. **Founder reframe to configuration-level coverage.** The founder elevated the analysis from per-product to per-configuration (L1–L7), added two missing dimensions (audience-appropriate output: human message vs agent-developer notification; no double-reporting across chained flows), and prompted a deeper code-read. The Calling→Reasoning seam was confirmed to carry content into `discovered_purpose`, while the route guard at `/api/reason` classifies only `input` — so L4/L6 do not reliably catch Calling-origin distress today. The per-product view had hidden this.

3. **Option A adopted; ADR Accepted; sequencing set.** Founder elected **Option A** (centralise distress detection at the substrate boundary; per-consumer Layer-3 rendering; route non-substrate products through the single catch; propagated flow-terminating `safety_signal` flag). ADR drafted, then approved and moved from `/drafts/adr/` to `/adopted/adr/`. Build sequence set: **Option A → C2 live (rescoped) → Session 3**. Consolidated close + Option A session-1 prompt written.

4. **GitHub Desktop guidance — two corrections by the founder.** AI's first instinct ("retire the `whole-system-data-room` branch") was prescribed before grounding in its purpose. AI also conflated the data-room *workspace concept* with the git branch of the same name and framed the room dismissively. Founder corrected both.

5. **The hand-off tendency, surfaced and elevated to a standing rule.** Founder flagged that the AI's close-writing had reduced the deferred TEST-env standup to a one-line "founder to do it between sessions." AI committed (in chat) to a live walkthrough at the testing phase. Founder asked it be made a *standing rule*. **PR17 adopted**, project-instructions snapshot + standing cache updated, C2-live carry-forward edited in both the prompt and the close.

6. **Meta-learnings capture.** Founder requested a retrospective and asked for *mechanisms* to carry learnings forward across sessions, given the AI has no persistent memory. AI proposed three captures (this debrief, KG-EX1, cache subsection); founder elected to do all three now.

---

## 2. Communication / process failures (the corrections)

Four corrections, with one common root.

1. **Per-product framing of M-7.** AI took the C2 prompt's per-endpoint framing literally; the founder's unit of analysis is the configuration/flow, which is what the test brief's own C2 row had named ("distress entering at *any* product across the loop"). Cost: a thorough but partially mis-framed diagnostic that needed reframing before the design could be sound.

2. **Premature "retire the data-room branch" recommendation.** AI proposed cleanup before inspecting the branch's purpose or asking. Read-only inspection was only run *after* the founder challenged the suggestion. The branch turned out to be a near-empty stale snapshot — but that doesn't excuse recommending removal before grounding.

3. **Data-room conflation.** AI treated "data-room" as the git branch when the founder holds it as a bounded workspace methodology ("the bounded workspace where the agent gathers the material for one piece of work and makes it legible before anyone asks for a final answer"). Framing the room as "not pulling its weight" read as dismissing a deliberate construct.

4. **One-line standup hand-off.** The interim C2 close and the consolidated close both reduced the deferred TEST-env standup to a pointer/between-sessions hand-off. Founder caught this and elevated it to a standing-rule expectation.

**Common root: prescribe-before-grounding.** Three of the four (#2, #3, and arguably #1) are the same mistake — the AI reached for a recommendation, a framing, or a default *before* confirming the founder's purpose/intent. The "hand-off reflex" (#4) is a secondary form: defaulting to "founder does it later" rather than "I guide it."

**What held up (for fair balance):** The C2 diagnostic itself was honest (didn't force green tests; PR12). When reframed, the AI extended rather than defended — the per-configuration analysis was thorough and produced a sound ADR. Critical-protocol discipline held: deferred the flag flip, didn't touch production, drafted the CCP, verified build-only + tsc. Concerns were stated once and execution followed (Option A sequencing; verification-first refinement).

---

## 3. What should change (durable captures, not promises)

The founder explicitly noted that prior AI declarations of "I understand this mistake" did not prevent recurrence — because the AI has no persistent memory across sessions. The docs **are** the memory. Captures placed where the session-opening read sequence forces encounter:

- **PR17** — Founder-Performed Operational Steps Are Walked Through Live, Not Handed Off. Full text in `/adopted/project-instructions-snapshot.md` §PR17; range now PR1–PR17. Standing-protocol-cache updated. Founder paste-syncs the Cowork panel.
- **KG-EX1** (pre-populated permanent entry, `/operations/knowledge-gaps.md`) — the prescribe-before-grounding pattern + plain-language resolution + founder redirect phrases. Pre-population from this debrief authorised under PR5.
- **Standing-protocol-cache subsection** — "AI failure modes to watch for at session open" — names the three patterns with detection cues and founder redirect phrases. Read at every session open via the read sequence.
- **Behavioural commitment** (no file): at every session open the AI narrates *where we are in the arc, what's queued, what's awaiting the founder, what's awaiting the AI* — before substantive work. This is the founder's session-opening handhold.

The "prescribe-before-grounding" pattern was promoted to a permanent entry on first-observation via PR5's structured-extraction pre-population authority, rather than waiting for a third recurrence — because the founder has no coding experience and cannot be relied upon to catch each recurrence; the cost of waiting outweighs the cost of recording.

---

## 4. Observations relevant to the mentor profile

(0b-ii notes that debriefs may include mentor-profile-relevant observations.)

- **The founder's instincts have been high-signal against AI defaults.** Multiple times in this session the founder's pushback was correct. The AI should treat founder pushback as evidence to re-examine genuinely, not to defend against. The redirect phrases captured in the cache subsection are levers the founder can use without needing technical knowledge to make this re-examination reliable.

- **The founder is operating without coding experience and explicitly relies on the AI for memory and structural recall.** This means: (a) deferring work to "between sessions" without active guidance is high-friction and a category of failure, not a category of convenience (now PR17); (b) the AI's session-opening recap is the founder's primary handhold and must be reliable; (c) extra branches, parallel artifacts, or multi-place state without consolidation will compound this friction — favour single sources of truth and consolidated closes.

- **The founder's pre-existing project machinery is exactly the right architecture for the AI-memory problem.** The decision log + knowledge-gaps register + PR series + standing cache + session-opening protocol are the carry-forward mechanism. This session's learnings integrate cleanly into them. The instinct that built this scaffolding was correct.

- **Multi-session arcs need a "carried-forward state" that survives the AI's between-session reset.** This session's mechanism — the carry-forward backlog tables in the consolidated close and the next-session prompt — works, but it is light. As complexity grows, this surface may need to harden (e.g., a single living "where are we" doc, or a session-opening recap protocol). Not yet warranted; flagged for if/when complexity exceeds the current mechanism.

---

## 5. Adopted changes (cross-references)

| Change | Where |
|---|---|
| **PR17** adopted | `D-PR17-ADOPTED-WALKTHROUGH-2026-05-27` in `/operations/decision-log.md`; `/adopted/project-instructions-snapshot.md` §PR17 |
| **Standing cache PR range** → PR1–PR17 + new "AI failure modes" subsection | `/adopted/standing-protocol-cache.md` |
| **KG-EX1** pre-populated permanent entry (prescribe-before-grounding) | `/operations/knowledge-gaps.md` §"Permanent Entries (Beyond KG1–KG7)" |
| **C2-live carry-forward** updated with PR17 walkthrough requirement | `/operations/handoffs/founder/2026-05-27-OPTION-A-build-session-1-NEXT-SESSION-PROMPT.md`; `/operations/handoffs/founder/2026-05-27-r20a-config-perimeter-adr-adopted-close.md` |
| **Cowork project-instructions panel** paste-sync **— founder action pending** | (Cowork panel, off-repo) |

---

## 6. Cross-references

- Consolidated session close: `/operations/handoffs/founder/2026-05-27-r20a-config-perimeter-adr-adopted-close.md`
- Interim C2 sub-session close: `/operations/handoffs/founder/2026-05-27-C2-r20a-distress-perimeter-close.md`
- Adopted ADR (R20a configuration perimeter + audience contract): `/adopted/adr/2026-05-27-r20a-configuration-perimeter-and-audience-contract.md`
- Next-session prompt (Option A session 1, verification-first): `/operations/handoffs/founder/2026-05-27-OPTION-A-build-session-1-NEXT-SESSION-PROMPT.md`
- Decision-log entries (this session): `D-C2-R20A-PERIMETER-DIAGNOSTIC-AND-HARNESS-2026-05-27`; `D-R20A-CONFIG-PERIMETER-OPTION-A-2026-05-27`; `D-R20A-ADR-ADOPTED-SEQUENCING-2026-05-27`; `D-PR17-ADOPTED-WALKTHROUGH-2026-05-27`.
- Finding: `data-room/99_review/missing-context.md` (M-7).

*End of debrief. Filed per 0b-ii. Adopted changes referenced in the decision log per protocol.*
