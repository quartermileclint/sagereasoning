# Sage-Interpret System Review — Maximising Effectiveness

**Date:** 6 April 2026
**Context:** Review of the sage-interpret system's current capabilities, with specific focus on retaining and resurfacing journal insights, incorporating stated aims and goals, and delivering scheduled stoic-style reflections.

---

## What the System Does Well

The architectural design of sage-interpret is strong. Several things are working in your favour.

**The Mentor Ledger is the right abstraction for what you're asking for.** The five categories it extracts — commitments, realisations, self-posed questions, tensions, and intentions — map directly to the kinds of observations you described forgetting within weeks. Realisations capture insights with lasting value. Intentions capture your aims and goals. Tensions capture the gaps you're noticing in the moment. The extraction prompt addendum (`LEDGER_EXTRACTION_ADDENDUM` in mentor-ledger.ts) is well-written: it gives the LLM clear patterns to look for ("I notice that...", "I realise...", "I know X but I still...") and explicitly demands quality over quantity.

**The developmental priority system is exactly right for your request about sage-path prioritisation.** Each ledger entry is tagged as `foundational`, `active_edge`, `consolidation`, or `aspirational`. This gives the system the vocabulary to distinguish between a passing observation and a deep insight that meaningfully contributes to progress toward the Sage. The resurfacing logic can weight by priority.

**The 10-Layer framework identifies the right extraction targets.** Layer 3 (Engagement Gradient) would tell the system which entries genuinely moved you versus which were performative. Layer 4 (Contradiction Detection) would surface declared-vs-observed value gaps — the exact kind of insight that feels important in the moment and then gets forgotten because it's uncomfortable. Layer 8 (Situational Trigger Map) would enable predictive resurfacing based on what you're working on.

**The consumer architecture is sound.** The Mentor Ledger feeds three consumers: the Private Mentor Hub (visual display), the Proactive Scheduler (morning/evening delivery), and the Pattern Engine (temporal analysis). This is the right structure for "both scheduled and contextual" delivery.

---

## The Gaps — What Needs to Change

### Gap 1: Your Aims and Goals Are Not a Distinct Extraction Target

Your stated aims and goals live inside the journal entries. The current Mentor Ledger categories can capture them — `intentions` for softer aspirations, `commitments` for firm goals — but the extraction prompt doesn't explicitly look for aims and goals as a category. The prompt looks for action-oriented language ("I will...", "I want to get better at...").

**The problem:** Aims and goals are often stated differently from intentions. "My aim is to become someone who..." or "What I'm really building toward is..." or "The kind of person I want to be..." — these are identity-level aspirations, not practice intentions. They sit above the ledger's current categories. They're the *why* behind the commitments and intentions.

**Recommendation:** Add a sixth ledger entry kind: `aim`. This captures identity-level or life-level aspirations distinct from practice intentions. The extraction prompt should look for phrases like: "My aim is...", "What matters most to me is...", "The person I want to become...", "My purpose is...", "I'm working toward...", "What I care about most deeply is...". The developmental priority for aims should default to `foundational` because they represent the practitioner's self-declared telos.

**Why this matters for resurfacing:** Aims serve a different function than realisations or intentions. They're not things the mentor checks accountability on — they're things the mentor *weaves into its framing* of everything else. When delivering a morning reflection, the mentor should be able to say: "You wrote that your aim is [X]. Today's decision about [Y] touches that directly."

### Gap 2: No Resurfacing Logic Exists Yet

The Mentor Ledger types are built. The extraction prompt is written. The aggregation functions exist. But there is no code that actually decides *when and how* to resurface a specific insight. The `times_surfaced` counter exists on each entry, and `last_engaged_at` tracks recency — but nothing reads these fields to make resurfacing decisions.

**What's needed — a Resurfacing Engine with two modes:**

**Mode A — Contextual Resurfacing (during sessions):**
When the session bridge detects the topic of a working session, the resurfacing engine should query the ledger for entries whose `connected_passions`, `connected_virtues`, or `causal_stage` match the current context. It should prefer entries with high `developmental_priority`, low `times_surfaced`, and older `last_engaged_at` (insights that haven't been revisited recently). This is the "right insight at the right time" mechanism described in the Perfect Sage Agent brainstorm.

**Mode B — Scheduled Reflections (daily/weekly):**
A scheduled task that selects entries from the ledger using a rotation algorithm:

- Daily morning reflection: draw from `active` entries with `foundational` or `active_edge` priority. Pair one `aim` or `intention` with one `realisation` or `tension`. Frame as a brief stoic-style reflection connecting the two.
- Weekly pattern mirror: surface `persistent_tensions` and `oldest_open_questions` from the ledger summary. Frame as a weekly review of what's still unresolved.

The rotation should ensure no single insight is surfaced more than once per week (unless it's contextually triggered), and that all active entries get attention over a 30-day window.

### Gap 3: Layer 3 (Engagement Gradient) Should Be Prioritised

You described observations that "feel highly relevant in the moment" — this is exactly what Layer 3 detects. Without it, the resurfacing engine treats all realisations equally. With it, the system can distinguish between an insight you wrote to fill the page and one that emerged from genuine struggle.

**Recommendation:** Build Layer 3 as the next interpretation layer after the baseline. It doesn't require a separate LLM pass — it can run as an addendum alongside the existing extraction, similar to how the Mentor Ledger works. The output is a simple `engagement_score` (0.0–1.0) on each entry, based on:

- Entry length relative to section average
- Specificity of language (concrete examples vs abstractions)
- Presence of uncertainty, struggle, or self-questioning
- Emotional honesty markers (admissions of difficulty)
- First-person emotional language density

The resurfacing engine then weights by engagement score: insights that came from moments of genuine reflection get surfaced more frequently than performative entries.

### Gap 4: No Scheduled Delivery Mechanism

The Proactive Scheduler is described in the architecture (morning check-in, evening reflection, weekly pattern mirror) but nothing is wired to deliver these. For your "both" preference — scheduled plus contextual — this needs to exist.

**Recommendation:** Build a `sage-reflect` scheduled skill that:

1. Runs daily (morning, configurable time)
2. Reads the active Mentor Ledger
3. Selects 1-2 entries using the resurfacing rotation algorithm
4. Generates a brief stoic-style reflection (3-5 sentences) that connects the selected entries to Stoic principles, using the practitioner's own words where possible
5. Delivers the reflection as a Cowork scheduled task output

The reflection format should feel like a letter from Seneca, not a notification from an app. Something like:

> *"You wrote: 'I notice my urgency isn't strategic — it's fear-driven.' This is the Stoic physician's eye turned inward. The question today is not whether urgency appears — it will — but whether you can hold the impression long enough to ask: is this fear telling me something true, or is it a false judgement dressed as strategy?"*

### Gap 5: The Sage-Path Prioritisation Needs Explicit Criteria

You asked that insights which "meaningfully contribute to the path toward an ideal Sage" be prioritised for reinforcement. The system has the data to do this — each ledger entry has `connected_virtues`, `connected_passions`, and `developmental_priority` — but no explicit scoring function that rates an entry's sage-path relevance.

**Recommendation:** Add a `sage_path_weight` computed field to each ledger entry, calculated from:

- `developmental_priority`: foundational (1.0) > active_edge (0.8) > consolidation (0.5) > aspirational (0.3)
- `engagement_score` from Layer 3 (when available): multiply the priority weight
- Connected to a persisting passion from the MentorProfile: bonus weight (+0.2) — because overcoming persisting passions is core sage-path work
- Connected to the weakest virtue domain: bonus weight (+0.2) — because growth edges are where progress happens
- Entry kind weighting: aims (1.0), tensions (0.9), realisations (0.8), questions (0.7), commitments (0.6), intentions (0.5) — tensions and realisations are more diagnostic of sage-path progress than action items

The resurfacing engine selects entries using this composite weight, with some randomness to prevent the same high-weight entries from appearing every day.

---

## Current Status Assessment (Using Shared Vocabulary)

| Component | Status | Notes |
|-----------|--------|-------|
| Sage-interpret skill (SKILL.md) | **Designed** | Workflow defined, not yet tested with real data |
| Journal interpreter (journal-interpreter.ts) | **Scaffolded** | Types and section mapping exist; functional code exists for Layer 1 extraction |
| Mentor Ledger (mentor-ledger.ts) | **Scaffolded** | Complete types, extraction prompt, and aggregation logic; not wired to LLM |
| Layer 1 — Baseline Extraction | **Scaffolded** | Extraction prompts built; needs LLM wiring and real-data testing |
| Layers 2–10 | **Designed** | Documented in 10_Layers.md; no code |
| Profile Store (profile-store.ts) | **Scaffolded** | Supabase schema and functions defined; needs database wiring |
| Embedding Pipeline | **Scaffolded** | Types exist; semantic search not wired |
| Proactive Scheduler | **Scaffolded** | Types for morning/evening/weekly exist; no delivery mechanism |
| Resurfacing Engine | **Not started** | No code, no types, no design document |
| Scheduled Reflections | **Not started** | No scheduled task, no reflection generation logic |
| Aims/Goals extraction | **Not started** | Not a distinct category in the current ledger |
| Sage-path prioritisation scoring | **Not started** | No weighting function exists |

---

## Recommended Build Sequence

Given that your journal data will be ready today, here's the order I'd recommend:

**Step 1 — Enhance the Mentor Ledger** (small change, high impact)
Add the `aim` entry kind to the ledger types and update the extraction prompt addendum. This ensures your aims and goals are captured as first-class entries from the very first interpretation run.

**Step 2 — Run the Interpretation** (test with real data)
Use sage-interpret to transcribe and interpret your journal. This produces the baseline MentorProfile and populates the Mentor Ledger with real entries. Everything after this depends on having real data to work with.

**Step 3 — Build the Resurfacing Engine** (the core of your request)
Create the selection logic that picks which entries to surface, when. Two modes: contextual (query by current session context) and scheduled (rotation algorithm with sage-path weighting).

**Step 4 — Build the Scheduled Reflection Task** (daily delivery)
Wire the resurfacing engine to a Cowork scheduled task that generates and delivers stoic-style reflections each morning.

**Step 5 — Add Layer 3 (Engagement Gradient)** (quality improvement)
Re-run interpretation with engagement scoring so the resurfacing engine can distinguish high-value insights from filler. This can be done as a second pass over already-transcribed data.

**Step 6 — Wire Contextual Resurfacing to sage-consult** (session integration)
Update the sage-consult skill so that when it's invoked during a working session, it queries the ledger for relevant entries and weaves them into its evaluation.

---

## What This Changes About the System's Effectiveness

Without these changes, sage-interpret produces a static MentorProfile that captures who you were when you wrote the journal. With them, it becomes a living memory that actively reinforces the insights you identified as important, resurfaces them when they're contextually relevant, and prioritises the ones that contribute most to your development as a practitioner.

The journal stops being something you wrote and forgot. It becomes something that keeps talking to you.
