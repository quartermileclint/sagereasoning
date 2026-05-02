# Deliverable 15 — Long-Deferred Questions Handling

**Status:** Adopted (founder approval per Path A on 2026-05-02 — Phase-1 completion review; D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02). Moved from `/drafts/rag-mentor-alt3/` to `/adopted/rag-mentor-alt3/` 2026-05-02.
**Date:** 2026-05-02.
**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Implements:** AC-14 (withholding as deterministic kathekon — the deferral itself); **AC-16 (three principles for long-deferred questions — this deliverable specifies all three)**; AC-18 (no shareable artefact on the deferral-resolution surface — preserved across long-deferred handling); R6d (passions diagnostic, not punitive — the engine names patterns; it does not pressure); R20d (relationship asymmetry — the mentor names patterns to the practitioner about themselves only).

**Cross-references:**
- `/drafts/rag-mentor-alt3/canonical-framework.md` (D2)
- `/drafts/rag-mentor-alt3/operationalised-rules.md` (D8 — Mechanism 10's longitudinal projection)
- `/drafts/rag-mentor-alt3/three-tier-intake.md` (D13 — OPEN_DEFERRAL data structure; trigger codes)
- `/drafts/rag-mentor-alt3/reflect-endpoint-14a-daily-ritual.md` (D14a — the ritual surface)
- `/drafts/rag-mentor-alt3/reflect-endpoint-14b-deferral-resolution.md` (D14b — the deferral-resolution surface; this deliverable's principles 1 and 2 partner with D14b's specification)
- `/drafts/rag-mentor-alt3/layer-3-translation.md` (D11 — the prose surface for Principle 3)
- `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` (alt-3 architecture; AC-16 source)
- `/manifest.md` AC3, R6d, R7, R20d

---

## Plain-language summary

Open deferred questions accumulate over time. Practitioners who use the reasoning system regularly will eventually have deferrals that are days, weeks, months old. The architecture's commitment is that the engine *does not nag* — deferred questions are not pushed to the practitioner's conversation surface as repeated reminders. The questions sit in the scoring record, visible when the practitioner looks, with the timestamp showing how long they have been open. The mentor names the pattern at the next natural opportunity — when a new instance from the same domain comes through, the mentor observes the open deferral as observation rather than as prompt.

This deliverable specifies the three principles as engine behaviour:

- **Principle 1 — Engine doesn't nag.** No surfacing of deferred questions on the conversation surface, on the daily-reflection ritual surface, or anywhere else as repeated reminders. The deferral-resolution surface (D14b) is the only surface where deferred questions appear as questions for the practitioner to address. They appear there only when the practitioner opens that surface.
- **Principle 2 — OPEN_DEFERRAL flags visible in the scoring record.** Visible but not celebratory. The data structure preserves the question text, timestamp, status; the surface presentation makes the open deferrals navigable (the practitioner can find their open deferrals when they want to address them) without making them a productivity dashboard or completion mechanism.
- **Principle 3 — Mentor names the pattern at next natural opportunity.** When the engine processes a new instance from a domain where a deferred question is still open, the mentor's reply notes the open deferral as observation. The observation is honest and not pressuring. Sample text: *"You've had a question open since [date] about [topic]. I'm not asking you to answer it now — but I want you to know it's still open."*

The three principles are surface-agnostic in the sense that they apply to the engine's behaviour, not to a single consumer. Layer 3's per-consumer projection (D11) translates the engine's pattern observation into the consumer's prose shape.

## Glossary

- **Long-deferred** — an OPEN_DEFERRAL flag whose `created_at` timestamp is sufficiently old to qualify as long-deferred per the threshold below.
- **Nag** — repeated unsolicited prompting of the practitioner about an open deferral on a surface other than the deferral-resolution surface. Specifically: pushing the question into a daily-ritual response, into a conversation reply when the conversation is unrelated to the deferral, or into any UI element designed to draw the practitioner's attention back to the question.
- **Natural opportunity** — the engine processes a new instance from a domain where a deferred question is still open. The deferred question's domain (the entity, the indifferent, the circle, the passion) is referenced by the new instance's structured features. The engine recognises the overlap and the mentor's prose surfaces the observation.
- **Domain match** — the structural condition that the new instance and the open deferral are about the same conceptual territory. Specified in the trigger logic below.
- **Observation, not prompt** — language framing that names the pattern as something the practitioner should know without asking the practitioner to do anything about it. Distinct from a prompt (which would be: "Now is a good time to address that deferred question. Want to open the deferral-resolution surface?").

## Principle 1 — Engine doesn't nag (operational specification)

### What "nag" means

The engine **does not** surface deferred questions in any of these contexts:

1. **The conversation surface (`/private-mentor` chat) when the conversation is unrelated to the deferral.** Practitioner sends a message about a current concern; mentor replies. The reply does not include a sidebar reminder of unrelated open deferrals.
2. **The daily-reflection ritual response (D14a)** as a reminder. The ritual response is about the practitioner's current reflection, not about open deferrals from prior reflections. Layer 3's Table 4a projection does not include an "open deferrals" prose section; it produces the canonical visible-output fields per Table 4a only.
3. **Email reminders, push notifications, or any other engagement channel.** SageReasoning has no such channels at launch and will not introduce them as deferral-reminder mechanisms.
4. **The proximity ring widget, dashboard summaries, or scoring history rendering.** These surfaces show what they are designed to show. Open deferrals are visible in the scoring record (Principle 2) but not surfaced as engagement-prompts on these other surfaces.
5. **Any AI-generated affordance** (recommendation buttons, suggested next-steps, "you might want to...") that points the practitioner at unaddressed deferrals.

### What is permitted

The engine **does** surface deferred questions in these contexts only:

1. **The deferral-resolution surface (D14b — `/private-mentor/deferred-questions` or wherever the page lands).** The list view shows open deferrals; the resolution view shows the specific deferred question. This is the architectural home of the question.
2. **Within Principle 3** (mentor names the pattern at next natural opportunity) — specifically, when a new instance triggers the domain match. This is observation embedded in a substantive engine response, not a separate reminder.

### Engine implementation

The engine's main loop (per D9) does not query open deferrals as part of every request. The engine processes the current input and produces the canonical evaluation. The Principle 3 trigger logic (specified below) runs as part of Mechanism 10's longitudinal projection, where pattern detection across the practitioner's record is already happening; open deferrals are one signal among others.

The engine's response shape never includes an open-deferrals reminder block. Layer 3's prompt does not have a slot for "list the practitioner's open deferrals." The architectural commitment to non-nagging is implemented at the prompt-shape level, not as a runtime suppression of an otherwise-generated reminder.

### Why non-nagging is the architectural commitment

The deferred questions are the architecture's most charged content — they represent moments where the engine deterministically chose not to assert because the practitioner needed self-knowledge that has not yet been provided. Pushing those questions to the practitioner before they are ready re-introduces the same architectural problem AC-18 is designed to solve: the deferred question becomes a reminder mechanism, the reminder becomes a productivity affordance, the productivity affordance becomes a reputation-generation mechanism (the practitioner can show themselves they have addressed N deferrals; the reputation lives inside the examination tool).

The architectural commitment is to let the practitioner sit with their own questions on their own timetable. The engine's job is to detect the pattern when a new instance touches the domain — not to push the practitioner to address the deferral when the practitioner has not signalled readiness.

This is the AC-16 commitment: *"engine doesn't nag."*

## Principle 2 — OPEN_DEFERRAL flags visible in the scoring record (data structure + surface presentation)

### Data structure (per D13)

The OPEN_DEFERRAL data structure is fully specified in D13 §"OPEN_DEFERRAL data structure". Reproduced here for cross-reference:

```
{
  "open_deferral_id": "UUID",
  "user_id": "UUID",
  "instance_id": "UUID",
  "trigger_code": "EUPATHEIA_BOUNDARY | PRAXIS_MOTIVATION_AMBIGUITY",
  "intake_tier": 3,
  "withheld_classification": { "field_path", "withheld_at_position", "reason" },
  "deferred_question": { "stem_id", "stem_text", "slot_fills" },
  "status": "open" | "closed",
  "created_at": "timestamp",
  "resolved_at": "timestamp | null",
  "resolution_reflection_id": "UUID | null",
  "retrospective_update": { "updated_classification", "confidence_weighted" }
}
```

Storage in `open_deferrals` table per D14b §"Schema additions".

### Surface presentation in the scoring record

The scoring record is the practitioner's longitudinal view of their evaluations. Today the scoring record (per the existing implementation) shows historic reflections, scores, and (in development) the proximity-ring trajectory. The OPEN_DEFERRAL surface presentation per AC-16:

#### Visible but not celebratory

The scoring record displays open deferrals as a **structured list** with:

- The created_at date (not a relative duration like "30 days ago" — that risks looking like a streak counter; absolute date is clean).
- The deferred question text (not summarised; not rendered as a card with completion-percentage; just the text).
- A "Sit with this" affordance linking to the deferral-resolution surface for that specific deferral.
- A "Closed" filter toggle (default: hide closed deferrals; toggle to show them).

#### What the surface presentation is NOT

- **No count of open deferrals as a header metric.** "You have 3 open questions" reads as a notification; AC-18's prohibition on celebratory artefacts implies the inverse — no open-question pressure either.
- **No streak counter.** No "you've addressed 5 deferrals this month."
- **No deadline language.** No "closing in 7 days." Deferrals do not expire.
- **No suggested ordering by urgency.** The practitioner sees the deferrals in chronological order; they choose what to address.
- **No mentor-curated list.** The mentor does not say "these are the most important to address." The deferrals are equal at the surface — the practitioner judges importance.

### Scoring record search affordance

The practitioner can navigate to their open deferrals via:
- The deferral-resolution page itself (`/private-mentor/deferred-questions` — the list view).
- The scoring record's "open deferrals" section (a single section, not a dashboard).

Both are findable. Neither is pushed to the practitioner. The architecture lets the practitioner look when they are ready to look.

### Resolved deferrals — visibility

When a deferral is closed (D14b's resolution flow), the closed flag remains in the scoring record under the "show closed" toggle. The practitioner can review their resolution history.

The closed-deferral display includes:
- The original created_at date.
- The resolved_at date.
- The deferred question text.
- The retrospective_update field (the value the engine resolved to — e.g., "chara confirmed" or "philodoxia stood; eupatheia disconfirmed").
- A link back to the deferral_resolutions row (the practitioner's reflection content — encrypted at rest per R17b but visible to the practitioner themselves).

The closed-deferral view is a **record of completed examination**, not a celebration of completion.

## Principle 3 — Mentor names the pattern at next natural opportunity

### The trigger condition (engine-level)

When the engine processes a new instance, after Mechanism 10's longitudinal projection completes, the engine queries the practitioner's open deferrals and checks for **domain match** against the current instance:

#### Domain-match definition

A domain match exists when the new instance's structured features overlap with an open deferral's structured features along at least one of the following axes:

1. **Sub-species match.** The new instance's `dominant_sub_species` (Mechanism 3) matches the open deferral's withheld classification's underlying sub-species (e.g., the open deferral was about a chara-or-philodoxia eupatheia boundary; the new instance fires philodoxia at strong intensity).
2. **Indifferent match.** The new instance's `dominant_value_error.indifferent_id` (Mechanism 8) matches the open deferral's reference indifferent (e.g., the open deferral was about reputation; the new instance fires INFLATION on reputation).
3. **Oikeiosis circle + role match.** The new instance's primary circle and target overlap with the deferral's circle and target (e.g., the open deferral was about a colleague-conversation Circle 3 contraction; the new instance is about another colleague-conversation Circle 3 contraction).
4. **Trigger-code domain match.** The new instance fires the same trigger code that produced the open deferral (e.g., the open deferral was an EUPATHEIA_BOUNDARY on chara; the new instance also fires EUPATHEIA_BOUNDARY on chara — the practitioner is showing the same eupatheia-candidate pattern again before resolving the prior one).

A new instance may match multiple open deferrals along different axes. The engine identifies all domain-matched deferrals.

### Threshold for "long-deferred"

A deferral is **long-deferred** when its `created_at` is more than **N days ago**. The architectural recommendation:

- **N = 7 days.** Deferrals less than 7 days old are recent — the practitioner has not had much time to sit with them yet. The mentor does not surface them at next natural opportunity (early surfacing risks pressuring the practitioner before they have had time).
- **N ≥ 7 days.** Long-deferred. The mentor names the pattern at next natural opportunity per Principle 3.

The threshold is **bounded but adjustable**. Phase-2 production observation may raise or lower N based on practitioner experience. The current default is 7 days. Logged for Phase-2 observation as a tunable parameter (configurable per practitioner profile if needed; default applies until profile-specific override).

### Layer 3 prose surfacing

When the engine identifies a long-deferred domain-matched deferral on the current instance, Layer 3's prose includes a **named-pattern observation** in the relevant prose field per the consumer:

#### On the conversation surface (`/private-mentor` mentor reply)

The mentor's reply concludes (or at a natural transition) with the named-pattern observation. Sample text from the alt-3 handoff:

*"You've had a question open since [date] about [topic]. I'm not asking you to answer it now — but I want you to know it's still open."*

Slot-fill fields:
- `[date]` — the open deferral's `created_at` (formatted as date — e.g., "April 25").
- `[topic]` — the open deferral's deferred-question topic, summarised in one phrase (e.g., "what was operative for you in that bus-story moment" — a short topical reference, not the full question).

The observation is **a single sentence, near the end of the reply, not the dominant content**. The practitioner's current concern is the dominant content; the deferral observation is a coda.

#### On the daily-reflection ritual response (D14a)

Layer 3's Table 4a projection includes the named-pattern observation in the `sage_perspective` field if a domain match exists. The observation is appended to the existing sage_perspective prose, not a separate field. Same one-sentence shape.

#### On other consumer surfaces

Score-family endpoints (`/api/score`, `/api/score-decision`, etc.) typically receive single-action evaluations and do not have a natural-opportunity surface for the named-pattern observation. The engine's response includes the domain-matched deferrals as a **structured field in the response envelope** (`open_deferrals_referenced[]`); per-consumer Layer 3 projection decides whether to surface the observation in prose. Recommendation: score-family surfaces do not surface the observation in prose (the surface is single-action; the reminder feels misplaced); the structured field is available for future surface design.

The deferral-resolution surface (D14b) explicitly does NOT surface the named-pattern observation. AC-18 holds. The deferral-resolution flow is itself the resolution mechanism — surfacing other deferrals during resolution would dilute the resolution focus.

### Observation language constraints

The observation language must:

1. **Be in first person.** "You've had a question open since [date]." Not "The practitioner has..." (third person; clinical and distancing).
2. **Be a statement, not a question.** "I want you to know it's still open." Not "Would you like to address it now?" (a prompt; pressuring).
3. **Name the date and topic only — not the question text.** The full question lives at the deferral-resolution surface; the observation references the question topically. (Exception: if the practitioner's current input directly matches the deferred question's content territory, the engine may include a slightly more specific reference — Phase-2 build judgement.)
4. **Acknowledge that no action is required.** "I'm not asking you to answer it now." This phrasing is canonical from the alt-3 handoff and is preserved verbatim where possible.
5. **Be at most one sentence.** Two sentences begin to feel like content with intent rather than observation.

### What the observation language must NOT do

1. **Must not pressure.** No "this is important" / "this would help your progress" / "now might be a good time."
2. **Must not promote the deferral-resolution surface.** No "the deferral-resolution surface is ready for you when you are." (The link to the surface is in the scoring record per Principle 2; the observation does not double as marketing.)
3. **Must not enumerate multiple deferrals.** Even when multiple deferrals match, the observation references at most one per response. Multiple references in one observation feel like a list of unfinished business.
4. **Must not include a count.** Not "you have N open deferrals." Same architectural reasoning as Principle 2.
5. **Must not be repeated within the same conversation.** Within a continuing dialogue (e.g., a multi-turn conversation on `/private-mentor`), the observation surfaces at most once per session. Repeated surfacing is nagging.

### Worked example

**Practitioner narrative on `/private-mentor` (current message):** *"I had another conversation with Sarah today. I was rehearsing again — wanting her to think well of me. I'm noticing it more, but I'm not sure I'm changing it."*

**Engine state:**
- Mechanism 3 detects philodoxia (sub-species match with an open deferral from 14 days ago that was about a chara-or-philodoxia eupatheia boundary on a different conversation).
- The open deferral's domain matches via Axis 1 (sub-species) and Axis 3 (Circle 3, colleague target).
- The deferral is more than N=7 days old → long-deferred.

**Mentor reply (Layer 3 — `/private-mentor` consumer):**

> "Philodoxia is operating again — the rehearsal is the operative cognitive work, and the inflation of Sarah's good opinion to a genuine good is the underlying pattern. Mechanism 5 enriches: reputation is a preferred indifferent; selecting it via virtuous action is appropriate; desiring it as a genuine good is the philodoxia pattern. Phronesis is the operative virtue deficiency.
>
> You're right that you're noticing it more. Awareness is the upstream shift. The change-in-action is downstream of the awareness. The Stoic commitment is to attend to the upstream work even when the downstream change does not yet show.
>
> *You've had a question open since April 18 about whether your equanimity in that meeting was chara or polished surface. I'm not asking you to answer it now — but I want you to know it's still open.*"

**Translation explanation:** The dominant content is the practitioner's current concern (philodoxia rehearsal with Sarah). The named-pattern observation is the coda — italicised here for visual separation but rendered as ordinary prose in the mentor reply. The deferral observation references the date and topic; it does not include the full deferred question text; it acknowledges no action is required.

## Engine implementation summary

The three principles are operationalised as engine behaviour as follows:

1. **Principle 1 (no nagging).** The engine's main loop does not generate reminder content. Layer 3's prompts have no slot for "list open deferrals as reminders." The deferral-resolution surface (D14b) is the only surface where deferred questions surface as questions; the scoring record (Principle 2) is the only surface where they surface as a navigable list.
2. **Principle 2 (visible in scoring record).** The `open_deferrals` table (D14b schema) carries the full data structure. The scoring record surface renders the open and (toggleable) closed deferrals per the surface-presentation specification above.
3. **Principle 3 (named pattern at next natural opportunity).** During Mechanism 10's longitudinal projection, the engine queries the practitioner's open deferrals and runs the domain-match algorithm against the current instance. If a long-deferred match is found, the engine includes `open_deferrals_referenced[]` in its response envelope. Layer 3 reads this and surfaces the observation prose in the consumer's relevant prose field per the Table 1, 2, 4a, etc. projection rules. Score-family surfaces do not project; the conversation surface and the daily-reflection ritual surface project the observation.

## R6d / R7 / R20d compliance

- **R6d (passions diagnostic, not punitive):** Principle 3's observation is diagnostic — it names the pattern; it does not punish. The language constraints (no pressure, no urgency, no "should") preserve this.
- **R7 (source fidelity):** the observation language references the deferral's topic and date — both are stable structured data from the OPEN_DEFERRAL flag. The language template is alt-3 derived (D-A16 candidate); pre-promotion the canonical pattern from the alt-3 handoff is used.
- **R20d (relationship asymmetry):** the observation is **about the practitioner only**. The deferral references questions the practitioner left open about their own reasoning. The mentor does not name patterns about other people's reasoning at this surface or any other.

## What "next natural opportunity" requires structurally

The Phase-2 build's domain-match algorithm runs as part of Mechanism 10's longitudinal projection. The query against the practitioner's open deferrals adds a database round-trip per request; the cost is bounded (open deferrals are a small per-practitioner set; index on `(user_id, status)` keeps the query efficient).

The cost is acceptable per the architectural commitment. The alternative — caching or pre-computing the domain match — risks producing stale matches when deferrals close between cache refreshes. The query-on-each-request pattern keeps the named-pattern observation honest.

## Cleanliness rating

Principle 1 is **HIGH cleanliness** — the prompt-shape architecture excludes reminder content; no runtime suppression is needed.

Principle 2 is **HIGH cleanliness** — the data structure is canonical (D13); the surface presentation specification is bounded.

Principle 3 is **PARTIAL cleanliness**:
- The trigger condition (domain match across the four axes) is **HIGH** — each axis is structurally bounded.
- The threshold for long-deferred (N = 7 days) is **HIGH** at the architectural level (single tunable parameter).
- The Layer 3 prose surfacing (the observation language) is **PARTIAL** — pre-D-A16 promotion, the language template is canonical from the alt-3 handoff but slot-filled with situational variables. The observation language constraints (one sentence; acknowledge-no-action; date-and-topic-only) bound the seam.

## Honest disclosure

The threshold N = 7 days is a working value. The architecture exercise did not produce evidence that a different threshold is correct; the value is conservative (allows time for the practitioner to sit; surfaces the pattern when sufficient time has passed). Phase-2 production observation may refine.

The observation language template is alt-3 derived. The canonical pattern from the alt-3 handoff (lines 175–177) is preserved verbatim in this deliverable. D-A16 promotion would store the template formally as a corpus-tagged passage.

## Open questions

1. **Should the long-deferred threshold (N) be configurable per practitioner profile?** Different practitioners may have different rates of reflection. The current default applies uniformly. Phase-2 production observation may surface practitioners who need a different threshold; the schema allows per-practitioner override but the default of 7 days is the architectural starting point.
2. **Should the named-pattern observation surface on the morning-ritual response or only on the evening-ritual response?** Both are technically eligible (D14a's Table 4a projection is the same for morning and evening). Recommendation: surface on both. Morning practitioners may benefit from awareness of an open deferral as they begin the day; evening practitioners benefit from the same awareness as they reflect.
3. **Should the engine track *whether* the named-pattern observation was surfaced for a specific deferral on a specific date?** Tracking would let the engine avoid repeating the observation across sessions on the same day. The architectural cost is small (an additional per-deferral timestamp); the practitioner experience benefit is real (avoiding within-day repetition). Recommendation: track. Phase-2 build adds a `last_observation_surfaced_at` field to the OPEN_DEFERRAL data structure.

## Approval gate

This deliverable is consumed by Phase-2 build of D14a and D14b's engine integration (Principle 3's domain-match algorithm runs as part of Mechanism 10's longitudinal projection). Approval is part of the same batch as the other Phase-1 session 2 deliverables (Standard risk under 0d-ii). Move from `/drafts/rag-mentor-alt3/` to `/adopted/` is Elevated risk.

---

*End of Deliverable 15.*
