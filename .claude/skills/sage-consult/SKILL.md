# sage-consult — Invoke Sage Mentor Mid-Session

**Trigger:** The founder says "consult the mentor", "ask the mentor", "sage check", "stoic check", or any variant requesting the Sage Mentor's evaluation of the current conversation.

---

## What This Skill Does

This skill bridges the current Claude Cowork session into the Sage Mentor's ring for a **Consultant mode** evaluation. It captures the conversation context, runs it through the mentor's 4-stage Stoic reasoning pipeline, and returns the evaluation inline.

The mentor evaluates:

1. **Prohairesis filter** — Is this decision within moral choice, or reacting to externals?
2. **Kathekon assessment** — Is this action appropriate given role, nature, and stakeholders?
3. **Passion diagnosis** — Which passions might be distorting the reasoning?
4. **Virtue assessment** — How close is the reasoning to principled?
5. **Journal resurfacing** — Are there relevant journal insights the practitioner should be reminded of?

---

## When to Use

- Before committing to a significant strategic decision (architecture, pricing, partnerships, scope)
- When reviewing a document or plan before finalising it
- When the founder feels uncertain and wants a Stoic perspective
- When a decision contradicts previously stated values or oikeiosis obligations

---

## How It Works

1. The skill calls `prepareConsultation()` from `sage-mentor/session-bridge.ts`
2. This builds a `RingTask` from the current conversation state
3. The ring's `executeBefore()` runs with the founder's profile context
4. **NEW: Contextual resurfacing** — The skill calls `prepareContextualReflection()` from
   `sage-mentor/reflection-generator.ts`, passing the current session's detected passions,
   relevant virtues, and topic. If relevant journal entries exist, a brief contextual
   reflection is generated and included in the consultation output.
5. The mentor returns: concerns, journal references, enrichment notes, a proceed/pause recommendation, a mentor note, **and any contextual journal reflection**
6. The result displays inline in the Cowork session
7. After the founder makes their decision, `prepareConsultOutcome()` captures the outcome for persistence
8. Any ledger entries surfaced during the consultation are marked via `recordLedgerSurfacing()`

---

## Governance Rules Enforced

- **R1:** No therapeutic implication — the mentor evaluates reasoning, not the person
- **R3:** All evaluative output includes the disclaimer: *"Sage Mentor evaluates reasoning quality using Stoic philosophy. It does not provide psychological, therapeutic, or diagnostic advice."*
- **R6c:** Proximity levels are qualitative labels only (reflexive → sage_like)
- **R6d:** Evaluation is diagnostic, not punitive
- **R9:** No outcome promises — the mentor assesses process, not results
- **R12:** Minimum 2 evaluation mechanisms per consultation (e.g., passion check + virtue assessment)

---

## Output Format

The mentor's response appears in this format:

```
━━━ Sage Mentor Consultation ━━━

📍 Proximity: [level] — [one-line explanation]

🔍 Concerns:
   [List of concerns, if any]

📖 Journal Reference:
   [Relevant passage from the 55-Day Journal, if found]

🪞 From Your Journal:
   [Contextual reflection — 1-3 sentences connecting a relevant journal insight
   to the current decision. Uses the practitioner's own words. Only appears if
   the resurfacing engine finds a relevant ledger entry. Omitted if nothing
   contextually relevant exists — silence is better than forcing a connection.]

💡 Mentor Note:
   [The "friend further along the path" observation]

⚖️  Recommendation: [PROCEED / PAUSE / RECONSIDER]

━━━
⚠️ Sage Mentor evaluates reasoning quality using Stoic philosophy.
   It does not provide psychological, therapeutic, or diagnostic advice.
━━━
```

---

## Cost

One Haiku or Sonnet call per consultation (model tier selected by `selectModelTier()` based on complexity). Typical cost: $0.001–$0.005 per consultation.

---

## Dependencies

- `sage-mentor/session-bridge.ts` — `prepareConsultation()`, `prepareConsultOutcome()`
- `sage-mentor/ring-wrapper.ts` — `executeBefore()`, `executeAfter()`
- `sage-mentor/persona.ts` — `MentorProfile`, prompt builders
- `sage-mentor/profile-store.ts` — `loadProfile()`
- `sage-mentor/llm-bridge.ts` — `callAnthropic()`
- `sage-mentor/reflection-generator.ts` — `prepareContextualReflection()` for journal resurfacing
- `sage-mentor/mentor-ledger.ts` — `selectForContextualResurfacing()`, `recordLedgerSurfacing()`
- Supabase — `session_decisions` table for persistence
