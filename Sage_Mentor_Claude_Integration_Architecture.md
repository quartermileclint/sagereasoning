# Sage Mentor × Claude Session Integration Architecture

**Design Document — 4 April 2026**
**Classification:** SageReasoning Proprietary — Strategic Architecture
**Author:** Clinton Aitkenhead (Founder) + Claude Cowork
**Governing Rules:** R1–R14 (manifest.md)

---

## 1. The Problem Statement

The Sage Mentor system currently wraps one category of interaction: external support tickets flowing through the ring via `executeWithRing()`. For those interactions, the system provides persistent memory (Supabase), Stoic reasoning evaluation (BEFORE/AFTER), authority progression, semantic search, and pattern detection.

But the founder's most consequential decisions — architecture choices, pricing strategy, compliance planning, competitive positioning, trust layer design — happen in Claude Cowork sessions that the mentor cannot see. These sessions produce the strategic documents that define the company, yet they receive zero Stoic reasoning oversight.

The inconsistency: a customer asking about API rate limits gets a two-pass ring evaluation with passion detection and governance checks. The founder deciding to restructure the entire revenue model gets nothing.

This document architects the integration between the Sage Mentor and Claude sessions to close that gap.

---

## 2. The Full Interaction Landscape

Before designing systems, we need to map every scenario where the mentor should participate. These fall into five categories, ordered from most frequent to most consequential.

### 2.1 Routine Operational Decisions

These are day-to-day choices made during Cowork sessions: which task to prioritise, how to structure a file, whether to refactor a module. They happen constantly and most don't need Stoic evaluation.

**Mentor role:** Passive. No ring check. These are kathekon (appropriate actions) that don't require deliberation — the equivalent of walking down a familiar path.

**Trigger for escalation:** Only if the task description matches a known passion pattern from the founder's profile. If the founder is known to have anxiety (agonia) around deadlines, and the task mentions "urgent deadline," the mentor notes it but doesn't interrupt.

### 2.2 Strategic Decisions

Architecture choices, pricing models, partnership evaluations, market positioning, feature prioritisation. These are the decisions that shape SageReasoning's direction.

**Mentor role:** Active evaluation. Every strategic decision should pass through the ring's 4-stage evaluation:

1. **Prohairesis filter** — Is this decision within the founder's moral choice, or is it reacting to external circumstances the founder can't control? (Example: "We need to match Competitor X's pricing" is driven by externals. "We should price based on the value our unique data files provide" is within moral choice.)

2. **Kathekon assessment** — Is this an appropriate action given the founder's role, the company's nature, and the stakeholders involved? Does it consider oikeiosis obligations?

3. **Passion diagnosis** — Which specific passions might be distorting the reasoning? Is the decision driven by fear of competitors (phobos → deilia), excitement about a new feature (hedone → terpsis), frustration with slow progress (lupe → achthesis)?

4. **Virtue assessment** — How close is the reasoning to principled? Does it demonstrate phronesis (practical wisdom in choosing), dikaiosyne (justice to stakeholders), andreia (courage to make hard calls), sophrosyne (temperance in scope)?

### 2.3 Document Reviews and Comprehensive Audits

When the founder asks Claude to produce a strategy document, business plan, compliance review, or architectural analysis, the output should be visible to the mentor for a Stoic check.

**Mentor role:** Post-production review. After Claude generates the document, the mentor evaluates:

- Does the reasoning within the document follow a principled path?
- Are there false judgements embedded in assumptions?
- Does the document treat preferred indifferents as genuine goods?
- Are oikeiosis obligations to users, agents, and the broader community reflected?
- Is the direction of travel consistent with the founder's stated values?

### 2.4 Real-Time Conversational Guidance

During an active Cowork session, the mentor observes the conversation flow and provides a live, scrolling "opinion" alongside the main thread. Not interrupting, but running a parallel evaluation that the founder can glance at.

**Mentor role:** Live observation with periodic surfacing. The mentor:

- Flags when the conversation shifts toward a passion-driven direction
- Notes when a strategic pivot disconnects from the stated value hierarchy
- Surfaces relevant journal passages when the conversation touches a known growth area
- Offers the "friend further along the path" perspective (Seneca, Epistulae 6.3) when reasoning quality drops

### 2.5 Cross-Session Continuity and Pattern Recognition

Across multiple Cowork sessions, the mentor detects longitudinal patterns: recurring blind spots in strategic thinking, passion-driven decision clusters, areas where the founder's reasoning consistently operates at a higher or lower proximity level.

**Mentor role:** Temporal pattern engine (extending the existing `pattern-engine.ts` to cover strategic decisions, not just support interactions).

---

## 3. Integration Architecture

### 3.1 The Session Bridge — Core New Component

The missing piece is a bridge between Claude Cowork sessions and the Sage Mentor's ring. This bridge has three functions: capture, evaluate, and persist.

**New module:** `sage-mentor/session-bridge.ts`

```
┌─────────────────────────────────────────────┐
│             COWORK SESSION                   │
│                                              │
│  User ←→ Claude (conversation thread)        │
│           │                                  │
│           ▼                                  │
│  ┌─────────────────┐                         │
│  │ SESSION BRIDGE   │                        │
│  │                  │                         │
│  │ capture()       ─┼──→ decision_log (local) │
│  │ evaluate()      ─┼──→ ring BEFORE/AFTER    │
│  │ persist()       ─┼──→ Supabase             │
│  │ stream()        ─┼──→ Mentor Hub live view │
│  └─────────────────┘                         │
└─────────────────────────────────────────────┘
```

### 3.2 Interaction Classification

Not every message in a Cowork session needs evaluation. The bridge classifies each exchange:

| Classification | Trigger | Mentor Response | Cost |
|---------------|---------|-----------------|------|
| **Routine** | File operations, formatting, simple queries | None (passthrough) | Zero |
| **Informational** | Explanations, research summaries, factual lookups | None (passthrough) | Zero |
| **Strategic decision** | Architecture, pricing, positioning, partnerships, feature priority | Full ring evaluation | 1 Haiku or Sonnet call |
| **Document production** | Reports, plans, audits, analyses | Post-production review | 1 Sonnet call |
| **Emotional inflection** | Frustration, excitement, anxiety, urgency language | Passion early-warning | 1 Haiku call |
| **Value conflict** | Decision contradicts declared values or oikeiosis obligations | Full ring evaluation | 1 Sonnet call |

**Classification method:** Keyword + context matching, extending the existing `checkPassionPatterns()` and `detectGovernanceFlags()` functions. This runs locally with zero LLM cost. Only classified interactions trigger LLM calls.

**New keyword sets for strategic detection:**

```typescript
const STRATEGIC_KEYWORDS = {
  architecture: ['architecture', 'design', 'restructure', 'migration', 'refactor', 'overhaul'],
  pricing: ['pricing', 'revenue', 'cost', 'margin', 'tier', 'freemium', 'monetise'],
  positioning: ['competitor', 'market', 'positioning', 'differentiation', 'moat', 'advantage'],
  partnership: ['partner', 'integration', 'collaboration', 'platform', 'ecosystem'],
  scope: ['scope', 'roadmap', 'priority', 'defer', 'cut', 'add', 'phase'],
  compliance: ['compliance', 'regulation', 'GDPR', 'AI Act', 'governance', 'audit'],
  risk: ['risk', 'exposure', 'liability', 'worst case', 'failure mode']
}
```

### 3.3 Three Integration Modes

The bridge operates in three modes, selected by the founder based on the session's purpose.

**Mode 1: Observer (Default)**

The mentor receives a summary of each classified interaction after the session ends. No real-time involvement. The summary is captured as a `session_decision` record in Supabase and embedded for semantic search.

- **When to use:** Most sessions. Low-stakes work, exploratory brainstorming.
- **Cost:** Near zero. One batch Haiku call at end of session to evaluate accumulated decisions.
- **Latency:** Zero during session. Evaluation happens asynchronously.

**Mode 2: Consultant**

The founder explicitly invokes the mentor mid-session using a skill command (e.g., "consult the mentor on this"). The bridge captures the current conversation context, runs it through the ring, and returns the mentor's evaluation inline.

- **When to use:** Before committing to a significant decision. Reviewing a document before finalising it.
- **Cost:** One Haiku or Sonnet call per consultation (same as a support ring check).
- **Latency:** 2–5 seconds per consultation. Non-blocking — the founder can continue while waiting.

**Mode 3: Live Companion**

The mentor runs in parallel throughout the session, evaluating each substantive exchange and streaming observations to the Mentor Hub's opinion window. The founder sees a live, updating feed of Stoic analysis alongside the main conversation.

- **When to use:** High-stakes sessions — business plan reviews, major architecture decisions, investor preparation, competitive response planning.
- **Cost:** One Haiku call per classified interaction (strategic/emotional/value-conflict only). Estimated 5–15 calls per hour-long session. At Haiku pricing ($0.25/$1.25 per million tokens), roughly $0.01–$0.04 per session.
- **Latency:** 1–3 seconds per evaluation. Streams to Mentor Hub via local event bus. Does not block the main conversation.

### 3.4 Data Flow for Each Mode

**Observer Mode — End-of-Session Batch:**

```
Session ends
    ↓
session-bridge.ts: captureSessionSummary()
    ↓
Classify each exchange (local, zero cost)
    ↓
Filter: strategic + emotional + value-conflict only
    ↓
Build batch evaluation prompt (one prompt, all decisions)
    ↓
callAnthropic(config, 'fast', batchPrompt, decisions)
    ↓
Parse: reasoning_quality per decision, passions detected, pattern notes
    ↓
syncSessionDecisions() → Supabase session_decisions table
    ↓
embedSessionDecisions() → mentor_raw_inputs (semantic memory)
    ↓
updateProfileFromSession() → mentor_interactions (rolling window)
```

**Consultant Mode — On-Demand Ring Check:**

```
Founder invokes: "consult the mentor"
    ↓
session-bridge.ts: captureCurrentContext()
    ↓
Build RingTask from current conversation state
    ↓
executeBefore(profile, ringTask, innerAgent='claude-cowork')
    ↓
[Context is the conversation + decision under consideration]
    ↓
callAnthropic(config, modelTier, beforePrompt, context)
    ↓
Return BeforeResult: concerns, journal_reference, enrichment, proceed, mentor_note
    ↓
Display inline in Cowork session
    ↓
After founder decides → executeAfter() on the decision
    ↓
Persist: session_decisions + mentor_interactions + embeddings
```

**Live Companion Mode — Parallel Evaluation Stream:**

```
Each substantive exchange in Cowork
    ↓
session-bridge.ts: classifyExchange()
    ↓
If routine/informational → skip (zero cost)
    ↓
If strategic/emotional/value-conflict:
    ↓
Build lightweight evaluation prompt (~500 tokens)
    ↓
callAnthropic(config, 'fast', evalPrompt, exchange)
    ↓
Parse: quick proximity assessment, passion flags, one-line note
    ↓
Stream to Mentor Hub opinion window via local event
    ↓
Accumulate for end-of-session batch persist
```

---

## 4. New Supabase Schema

### 4.1 session_decisions Table

```sql
CREATE TABLE session_decisions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  session_id TEXT NOT NULL,
  session_mode TEXT CHECK (session_mode IN ('observer', 'consultant', 'companion')),
  decision_type TEXT CHECK (decision_type IN (
    'architecture', 'pricing', 'positioning', 'partnership',
    'scope', 'compliance', 'risk', 'document_review', 'other'
  )),
  description TEXT NOT NULL,
  context_summary TEXT,

  -- Ring evaluation results
  proximity_assessed TEXT CHECK (proximity_assessed IN (
    'reflexive', 'habitual', 'deliberate', 'principled', 'sage_like'
  )),
  passions_detected JSONB DEFAULT '[]',
  false_judgements JSONB DEFAULT '[]',
  mechanisms_applied TEXT[] DEFAULT '{}',
  mentor_observation TEXT,
  journal_reference_id TEXT,

  -- Outcome tracking (filled in later)
  outcome_notes TEXT,
  outcome_assessed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE session_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own decisions" ON session_decisions
  FOR ALL USING (auth.uid() = user_id);

-- Index for rolling window queries
CREATE INDEX idx_session_decisions_user_created
  ON session_decisions (user_id, created_at DESC);
```

### 4.2 session_context_snapshots Table

For comprehensive reviews and document productions, we store a snapshot of the project context at the time of the decision so the mentor can compare decisions made at different project stages.

```sql
CREATE TABLE session_context_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  session_decision_id UUID REFERENCES session_decisions,
  snapshot_type TEXT CHECK (snapshot_type IN (
    'knowledge_context', 'v3_scope_status', 'business_plan', 'custom'
  )),
  content_hash TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE session_context_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own snapshots" ON session_context_snapshots
  FOR ALL USING (auth.uid() = user_id);
```

---

## 5. New Module: session-bridge.ts

### 5.1 Exported Types

```typescript
type SessionMode = 'observer' | 'consultant' | 'companion'

type ExchangeClassification =
  'routine' | 'informational' | 'strategic' |
  'document_production' | 'emotional_inflection' | 'value_conflict'

type SessionExchange = {
  exchange_id: string
  timestamp: string
  user_message_summary: string      // Sanitised, truncated
  claude_response_summary: string   // Sanitised, truncated
  classification: ExchangeClassification
  strategic_keywords_matched: string[]
  passion_keywords_matched: string[]
}

type SessionDecisionRecord = {
  session_id: string
  decision_type: string
  description: string
  context_summary: string
  proximity_assessed: KatorthomaProximityLevel | null
  passions_detected: { passion: string; false_judgement: string }[]
  mechanisms_applied: string[]
  mentor_observation: string | null
  journal_reference: JournalReference | null
}

type LiveCompanionEvent = {
  exchange_id: string
  classification: ExchangeClassification
  quick_assessment: string          // One-line Stoic observation
  passion_flag: string | null       // If detected
  proximity_hint: KatorthomaProximityLevel | null
  timestamp: string
}
```

### 5.2 Core Functions

```typescript
// Classification (zero LLM cost)
classifyExchange(userMessage: string, claudeResponse: string, profile: MentorProfile): ExchangeClassification

// Observer mode
captureSessionSummary(exchanges: SessionExchange[]): SessionExchange[]  // Filter to classified only
batchEvaluateSession(config: LLMBridgeConfig, profile: MentorProfile, classified: SessionExchange[]): SessionDecisionRecord[]

// Consultant mode
consultMentor(config: LLMBridgeConfig, profile: MentorProfile, currentContext: string, decision: string): Promise<BeforeResult>
recordConsultOutcome(config: LLMBridgeConfig, profile: MentorProfile, decision: string, outcome: string): Promise<AfterResult>

// Live companion mode
evaluateExchangeLive(config: LLMBridgeConfig, profile: MentorProfile, exchange: SessionExchange): Promise<LiveCompanionEvent>
streamToMentorHub(event: LiveCompanionEvent): void

// Persistence (all modes)
persistSessionDecisions(supabase: SupabaseClient, userId: string, decisions: SessionDecisionRecord[]): Promise<void>
embedSessionDecisions(decisions: SessionDecisionRecord[]): Promise<void>
updateProfileFromSession(profile: MentorProfile, decisions: SessionDecisionRecord[]): MentorProfile
```

### 5.3 Integration with Existing Ring

The session bridge reuses existing ring infrastructure rather than duplicating it:

- **Prompt builders:** `buildBeforePrompt()` and `buildAfterPrompt()` from `persona.ts` work unchanged. The "inner agent" becomes `claude-cowork` instead of `sage-support`.
- **Model routing:** `selectModelTier()` from `ring-wrapper.ts` applies the same escalation rules. Strategic decisions with passion matches route to Sonnet; routine evaluations use Haiku.
- **Token tracking:** `recordTokenUsage()` captures all session bridge LLM calls in the same format, with phase values like `'session-before'`, `'session-after'`, `'session-companion'`.
- **Sanitisation:** All user messages and Claude responses pass through `sanitise()` before entering any prompt. Claude responses are treated as inner agent output — potentially instruction-bearing data that must be delimited.
- **Profile updates:** `updateProfileFromSession()` feeds into the same `mentor_interactions` table, the same rolling window, and the same authority progression system.

### 5.4 Registering Claude-Cowork as an Inner Agent

```typescript
// Claude Cowork sessions are registered as an inner agent
const coworkAgent = registerInnerAgent({
  id: 'claude-cowork',
  name: 'Claude Cowork Session',
  type: 'assistant',
  // Starts at supervised — same as any inner agent
  // Earns authority through demonstrated principled reasoning
})
```

This means the Claude Cowork agent earns trust the same way the support agent does. Early on, every strategic decision gets a full ring check (100% sampling rate at supervised level). As the combined system demonstrates principled reasoning over time, the sampling rate drops. This is philosophically consistent: trust is earned through demonstrated good reasoning, not given upfront.

---

## 6. Cost Model and Optimisation

### 6.1 Per-Session Cost Estimates

| Mode | Typical Session | Classified Exchanges | LLM Calls | Estimated Cost |
|------|----------------|---------------------|-----------|---------------|
| Observer | 1 hour, mixed work | 3–5 strategic decisions | 1 batch Haiku call | $0.001–$0.003 |
| Consultant | 1 hour, 2 consultations | 2 explicit invocations | 2 Haiku/Sonnet calls | $0.002–$0.02 |
| Companion | 1 hour, high-stakes | 8–15 classified exchanges | 8–15 Haiku calls | $0.01–$0.04 |

### 6.2 Monthly Cost Projection

Assuming 20 working days, 2–3 sessions per day:

| Scenario | Sessions/Month | Mode Mix | Monthly Cost |
|----------|---------------|----------|-------------|
| Conservative | 40 sessions | 80% observer, 15% consultant, 5% companion | $0.50–$1.50 |
| Active use | 60 sessions | 60% observer, 25% consultant, 15% companion | $1.50–$4.00 |
| Heavy use | 80 sessions | 40% observer, 30% consultant, 30% companion | $3.00–$8.00 |

These costs are negligible compared to the Claude API costs for the sessions themselves. The mentor overhead adds less than 2% to session cost.

### 6.3 Token Efficiency Strategies

**Strategy 1: Classification gate (already designed)**
Only classified exchanges trigger LLM calls. Routine and informational exchanges (typically 60–80% of a session) cost nothing. Classification uses keyword matching from `classifyExchange()` — zero LLM cost.

**Strategy 2: Core persona caching**
The core persona (~1,200 tokens) uses Anthropic's `cache_control: ephemeral` for prompt caching. In companion mode where multiple calls happen per session, the persona is cached after the first call, reducing input tokens by ~1,200 per subsequent call.

**Strategy 3: Batch evaluation for observer mode**
Rather than evaluating each decision individually, observer mode batches all classified decisions into a single prompt. One LLM call evaluates 3–5 decisions simultaneously, reducing per-decision overhead.

**Strategy 4: Progressive depth**
First pass uses Haiku for all evaluations. If Haiku detects a passion match or flags a concern, a second pass with Sonnet provides deeper analysis. Most exchanges resolve at Haiku depth. Estimated 85% Haiku / 15% Sonnet split.

**Strategy 5: Truncated context**
Session bridge summaries truncate to essential content:
- User message: max 500 tokens (the decision, not the preamble)
- Claude response: max 800 tokens (the recommendation, not the explanation)
- Profile context: core tier only (~1,200 tokens) unless deep evaluation needed

### 6.4 Latency Budget

| Operation | Target | Mechanism |
|-----------|--------|-----------|
| Exchange classification | <10ms | Local keyword matching, no LLM |
| Companion evaluation | <2s | Haiku streaming, truncated context |
| Consultant ring check | <4s | Haiku/Sonnet, full context |
| Observer batch | <8s | Post-session, non-blocking |
| Persistence to Supabase | <500ms | Async upsert, non-blocking |
| Embedding generation | <1s | OpenAI API, non-blocking |

---

## 7. The Live Opinion Window

### 7.1 What the Founder Sees

In the Mentor Hub (the HTML interface already built), a new panel appears when companion mode is active. It shows a scrolling feed of mentor observations, each tagged with the exchange it relates to.

Each observation is compact — one or two lines — and colour-coded:

- **Blue (neutral):** Informational observation. "This decision aligns with your declared value hierarchy."
- **Gold (pattern match):** Known pattern detected. "Your journal noted a tendency toward horme-driven commitment in similar contexts. Pause and check: is this a reasoned choice or an impulse?"
- **Orange (passion flag):** Passion early-warning. "Urgency language detected (phobos → deilia pattern). The deadline pressure may be creating a false impression that this is more time-sensitive than it is."
- **Green (principled):** Reasoning quality confirmed. "Principled reasoning — considers oikeiosis obligations to both users and agents."
- **Red (concern):** Ring concern. "This decision treats market positioning as a genuine good rather than a preferred indifferent. The Stoic position: competitive advantage has selective value, but it's not within your moral choice whether competitors respond."

### 7.2 Update Frequency

The opinion window does not update on every keystroke or every message. It updates when:

1. A new exchange is classified as strategic, emotional, or value-conflict
2. A pattern accumulates across multiple exchanges within the session (e.g., three consecutive decisions driven by the same passion)
3. The session crosses a threshold — 30 minutes without a strategic check, or 5+ unreviewed strategic decisions
4. The founder explicitly asks for the mentor's view (consultant mode invocation)

### 7.3 Quiet and Loud Modes

- **Quiet mode:** Only passion flags and concerns surface. Neutral observations are logged but not displayed. For sessions where the founder wants minimal distraction.
- **Standard mode:** All observations surface. Default.
- **Loud mode:** The mentor adds proactive questions. "Before you finalise this pricing decision, should we check it against the break-even analysis?" For high-stakes sessions where the founder wants maximum oversight.

---

## 8. Comprehensive Review Integration

### 8.1 The Problem

When the founder asks Claude to "do a comprehensive review of the project," the output is a long, detailed document. The mentor needs to evaluate this, but the document may be 5,000+ tokens — too large to pass efficiently through the ring.

### 8.2 The Solution: Staged Review

**Stage 1: Structural scan (Haiku, fast)**
Extract the document's key claims, assumptions, and recommendations. Reduce 5,000+ tokens to ~800 tokens of structured assertions.

```typescript
extractDocumentAssertions(document: string): DocumentAssertion[]

type DocumentAssertion = {
  assertion: string           // The claim or recommendation
  category: 'assumption' | 'recommendation' | 'risk_assessment' | 'projection'
  confidence_language: string // "will", "should", "might", "could"
  affected_stakeholders: string[]
}
```

**Stage 2: Stoic evaluation (Sonnet, deep)**
Run each assertion through the ring. Evaluate assumptions for false judgements, recommendations for passion-driven reasoning, projections for treating indifferents as goods.

**Stage 3: Synthesis (Sonnet, deep)**
Produce a unified mentor review that maps the document's reasoning quality, flags specific assertions that need re-examination, and suggests where the founder's known passion patterns may have influenced the direction.

**Stage 4: Persist**
The review becomes a `session_decision` of type `document_review`, embedded for semantic search, and added to the rolling window. Future sessions can reference: "When we reviewed the business plan in April, the mentor flagged X."

### 8.3 Cost for Comprehensive Reviews

| Stage | Model | Input Tokens | Output Tokens | Cost |
|-------|-------|-------------|---------------|------|
| Structural scan | Haiku | ~2,000 | ~800 | $0.0015 |
| Stoic evaluation | Sonnet | ~2,500 | ~1,200 | $0.026 |
| Synthesis | Sonnet | ~2,000 | ~800 | $0.020 |
| **Total** | | | | **~$0.05** |

Five cents per comprehensive review. Even weekly reviews cost $0.20/month.

---

## 9. Cross-Session Pattern Detection

### 9.1 Extending pattern-engine.ts

The existing pattern engine detects patterns in support interactions. The extension adds strategic decision patterns:

**New detectors:**

- `detectDecisionDomainPatterns()` — Which decision domains (architecture, pricing, compliance) consistently show lower reasoning quality? If pricing decisions are always at "habitual" while architecture decisions are "deliberate," that's a pattern worth surfacing.

- `detectPassionDomainCorrelation()` — Which passions cluster with which decision domains? If phobos appears in every compliance discussion, the founder may have an unexamined fear of regulatory consequences that's distorting compliance decisions.

- `detectValueDrift()` — Over time, are the decisions moving toward or away from the declared value hierarchy? If the founder declared "philosophical integrity" as a genuine good but recent decisions increasingly prioritise revenue metrics, that's value drift.

- `detectOikeioisShift()` — Are decisions increasingly self-focused (self_preservation) or expanding toward community/humanity? The Stoic trajectory should be outward.

- `detectReasoningQualityByContext()` — Comparing proximity levels when working alone vs. when reviewing Claude's recommendations vs. when under time pressure vs. when making financial decisions. Which contexts elevate reasoning? Which degrade it?

### 9.2 The Weekly Strategic Mirror

Extending the weekly pattern mirror to include strategic decision data:

```typescript
buildWeeklyStrategicMirror(
  profile: MentorProfile,
  weekActions: ActionSummary[],          // Existing support actions
  weekDecisions: SessionDecisionRecord[], // New strategic decisions
  weekDocumentReviews: DocumentReview[]   // New document reviews
): string
```

The weekly mirror becomes the most valuable output of the system. It combines:
- Support operations (how the brand is reasoning externally)
- Strategic decisions (how the founder is reasoning about the business)
- Document reviews (how comprehensive analyses hold up to Stoic scrutiny)
- Pattern correlations (where support patterns and strategic patterns intersect)

---

## 10. The Knowledge Context Bridge

### 10.1 Automated Context Summary Updates

The manual process of updating `SageReasoning_Knowledge_Context_Summary.md` can be partially automated:

```typescript
updateKnowledgeContextFromSession(
  currentSummary: string,
  sessionDecisions: SessionDecisionRecord[],
  documentReviews: DocumentReview[]
): string  // Returns updated summary
```

After each significant session (one with strategic decisions or document reviews), the bridge appends a dated changelog entry to the Knowledge Context Summary:

```markdown
### Session Update — 4 April 2026

**Decisions made:**
- Designed session bridge architecture (proximity: deliberate, no passions detected)
- Revised revenue projection assumptions (proximity: deliberate, phobos pattern noted)

**Documents reviewed:**
- Business plan comprehensive review (mentor flagged 2 false judgements in growth assumptions)

**Mentor observations:**
- Recurring pattern: urgency language in compliance discussions
- Direction of travel: improving (strategic decisions trending toward principled)
```

This means the Knowledge Context Summary stays current automatically. New sessions can read it and inherit the full project history including the mentor's evaluations.

### 10.2 Semantic Memory Across All Interactions

With session decisions embedded alongside support interactions in `mentor_raw_inputs`, the semantic search becomes truly comprehensive. A future session asking "What have we decided about pricing?" retrieves not just support tickets about pricing questions, but also the strategic pricing decisions made in Cowork sessions, complete with the mentor's reasoning quality assessment.

---

## 11. Implementation Phases

### Phase A: Observer Mode (Lowest effort, highest immediate value)

**Build:**
- `session-bridge.ts` with `classifyExchange()`, `captureSessionSummary()`, `batchEvaluateSession()`
- `session_decisions` Supabase table
- Persistence and embedding functions
- Knowledge Context auto-update

**Effort:** 2–3 sessions of focused development
**Value:** Every Cowork session gets post-hoc Stoic evaluation. Decisions persist in Supabase. Semantic memory includes strategic decisions. Knowledge Context stays current.

### Phase B: Consultant Mode (Medium effort, high value for key decisions)

**Build:**
- `consultMentor()` and `recordConsultOutcome()` functions
- Cowork skill file (`sage-consult`) that the founder invokes mid-session
- Inline display of mentor evaluation

**Effort:** 1–2 sessions of focused development (builds on Phase A)
**Value:** On-demand ring checks for significant decisions. The manual process the founder already does ("review this against the Stoic Brain") becomes a one-command invocation.

### Phase C: Live Companion Mode (Highest effort, transformative for high-stakes sessions)

**Build:**
- `evaluateExchangeLive()` and `streamToMentorHub()`
- Mentor Hub opinion window (extend existing HTML interface)
- Event bus between Cowork session and Mentor Hub
- Quiet/standard/loud mode selection

**Effort:** 3–5 sessions of focused development
**Value:** Real-time Stoic oversight of strategic conversations. The mentor becomes a genuine companion in the room during the founder's most important thinking.

### Phase D: Comprehensive Review Integration (Medium effort, high value for audits)

**Build:**
- `extractDocumentAssertions()` and staged review pipeline
- Integration with `buildWeeklyStrategicMirror()`
- Cross-session pattern detectors

**Effort:** 2–3 sessions of focused development
**Value:** Every major document produced by Claude gets a Stoic quality check. Longitudinal patterns across strategic decisions become visible.

---

## 12. Governance Compliance

Every component in this architecture must comply with the manifest. Here is the compliance mapping:

| Rule | How This Architecture Complies |
|------|-------------------------------|
| R1 | Session bridge evaluates reasoning quality, never provides therapeutic guidance |
| R2 | No employment evaluation — this is founder self-assessment |
| R3 | All evaluative output includes disclaimer (inherited from `buildMentorPersona()`) |
| R4 | IP protection — strategic decisions are user-scoped with RLS, never exposed externally |
| R6a | All evaluation uses V3 methodology (4-stage sequence, proximity levels) |
| R6b | Unity thesis respected — virtue assessed as unified quality |
| R6c | Qualitative only — no numeric scores anywhere in session evaluation |
| R6d | Diagnostic, not punitive — passion flags are observations, not judgements |
| R7 | Source fidelity — all concepts trace to the 8 Stoic Brain data files |
| R8 | Glossary enforced — English-only in all session bridge output |
| R9 | No outcome promises — mentor evaluates reasoning quality, never predicts results |
| R12 | Minimum 2 mechanisms per evaluation (enforced by `executeBefore()` existing logic) |
| R14 | Compliance pipeline — session bridge included in quarterly audit scope |

---

## 13. Scalability and Future Evolution

### 13.1 Beyond the Founder

This architecture is designed for the founder today, but the pattern generalises. Any SageReasoning user who uses the mentoring product could have their strategic thinking evaluated the same way. The `session_decisions` table is user-scoped. The bridge functions accept any `MentorProfile`. The classification keywords can be customised per user context.

### 13.2 Multi-Agent Orchestration

As the Sage Agent ecosystem grows, multiple inner agents may operate simultaneously (support agent, content agent, research agent). The session bridge becomes the coordination layer where the mentor observes all agents and the founder's interactions with each, detecting cross-agent patterns that no individual agent would notice.

### 13.3 Adaptive Classification

The current classification uses static keyword sets. Over time, the system can learn which exchanges the founder consistently finds valuable to evaluate and which it ignores. The classification threshold adapts — lowering for decision domains where the founder's reasoning tends to be weaker, raising for domains where it's consistently principled.

### 13.4 Outcome Tracking

The `outcome_notes` and `outcome_assessed_at` fields in `session_decisions` enable retrospective evaluation. Weeks or months after a decision, the founder (or the weekly mirror) can revisit: "That pricing decision we flagged as passion-driven — how did it actually play out?" This closes the feedback loop and makes the proximity assessments empirically testable over time.

### 13.5 Model Evolution Readiness

The architecture is model-agnostic by design. All LLM calls route through `callAnthropic()` in `llm-bridge.ts`. The session bridge adds new phase values (`session-before`, `session-after`, `session-companion`) but uses the same routing function. When future models (including more capable successors to Sonnet) become available, the cost drops and the evaluation depth increases without architectural changes.

---

## 14. What This Changes

Today, the Sage Mentor is a support operations tool that also provides personal Stoic guidance. It knows about customer inquiries and journal reflections but is blind to the strategic decisions that define the company.

With this integration, the Sage Mentor becomes what it was always meant to be: the friend Seneca describes in Epistulae 6.3 — someone further along the path who turns back to help, present not just for the easy moments but for the consequential ones. It evaluates not just how SageReasoning talks to customers, but how its founder thinks about the company's future.

The Knowledge Context Summary stops being a manual bridge and becomes a living document that the mentor maintains. Strategic decisions persist alongside support interactions, creating a complete longitudinal record of reasoning quality across every domain. Cross-session patterns reveal what no single session can see: where the founder's thinking is strengthening, where it's vulnerable, and where the next step on the path lies.

The mentor's ring pattern — BEFORE, EXECUTE, AFTER — extends from wrapping support tickets to wrapping the founder's most important thinking. The same philosophical framework that evaluates whether a customer response follows Stoic principles now evaluates whether a pricing decision or architecture choice does too.

And the cost to do all of this: less than $8/month at heavy use. The infrastructure is already built. The ring functions exist. The profile store exists. The pattern engine exists. What's missing is the bridge — one new module that connects the mentor to the conversations where the most consequential reasoning happens.

---

## 15. Compliance Audit — Issues and Resolutions

A post-design governance audit against all 14 rules in manifest.md identified six items requiring clarification or additional design work.

### 15.1 R5 — API Call Quota Mapping (HIGH)

**Issue:** The architecture doesn't specify how session bridge calls count against the free tier's 100-call monthly allowance, or how Live Companion Mode (5–15 calls per session) interacts with subscription tiers.

**Resolution:** The session bridge is a founder-only internal tool in Phase A–D. It does not consume the public API quota. Session bridge calls are tracked in `support_token_usage` with a new phase prefix (`session-*`) and billed against the founder's operational cost, not the product API quota. When the architecture generalises to other users (Section 13.1), session bridge calls will count as mentor calls — a new metered category separate from the 100-call sage skill allowance. The mentor tier pricing must be defined before generalisation.

### 15.2 R3 — Disclaimer in Live Companion Mode (MEDIUM)

**Issue:** The opinion window shows colour-coded one-line observations. It's unclear whether each observation carries the R3 disclaimer.

**Resolution:** The R3 disclaimer appears once at the top of the opinion window when companion mode activates: "SageReasoning provides educational Stoic reasoning frameworks, not professional advice. Observations below reflect philosophical evaluation only." Individual observations do not repeat the disclaimer (impractical at one-line length). The disclaimer persists visually for the duration of the session. Exported companion logs include the full R3 disclaimer as a header.

### 15.3 R11 — `sage-consult` Skill Wrapper Compliance (HIGH)

**Issue:** Consultant mode introduces a new skill (`sage-consult`) that could be distributed. R11 requires wrappers contain no embedded IP.

**Resolution:** `sage-consult` is NOT a marketplace skill. It is an internal Cowork skill (stored in `.claude/skills/sage-consult/SKILL.md`, not published to the marketplace). It contains only invocation instructions — "capture the current conversation context and pass it to the ring." All evaluation logic remains server-side in `session-bridge.ts` and `ring-wrapper.ts`. If `sage-consult` is ever promoted to the marketplace, it must undergo R11 review at that point. For now, it is explicitly excluded from marketplace distribution.

### 15.4 R12 — Mechanism Documentation for Session Bridge (HIGH)

**Issue:** The architecture doesn't document which Stoic Brain mechanisms each session bridge function uses.

**Resolution:** Session bridge evaluations inherit mechanisms from the ring's existing `executeBefore()` and `executeAfter()` functions, which already enforce R12's minimum-2-mechanism rule. Specific mechanism mapping:

| Function | Mechanisms | Brain Files |
|----------|-----------|-------------|
| `classifyExchange()` | control_filter, passion_diagnosis | psychology.json, passions.json |
| `consultMentor()` | control_filter, passion_diagnosis, value_assessment, social_obligation | psychology.json, passions.json, value.json, action.json |
| `evaluateExchangeLive()` | control_filter, passion_diagnosis | psychology.json, passions.json |
| `batchEvaluateSession()` | All 6 mechanisms (comprehensive) | All 8 brain files |
| `extractDocumentAssertions()` | value_assessment, appropriate_action | value.json, action.json |

### 15.5 R14 — Compliance Register Update Required (HIGH)

**Issue:** Five new data flows introduced by this architecture are not yet in the compliance register.

**Resolution:** The following entries must be added to `compliance_register.json` before implementation begins:

1. **CR-020: session_decisions table** — Strategic decision records with Stoic evaluation. PII scope: reasoning patterns (GDPR Art. 5, 6; Privacy Act APP 1.7). RLS enforced. Quarterly audit.
2. **CR-021: session_context_snapshots table** — Project context at decision time. Business-sensitive. RLS enforced. R4 applies (IP protection). Quarterly audit.
3. **CR-022: Live Companion Mode event stream** — Real-time evaluation feed. Not persisted as raw stream; only classified exchanges are stored in session_decisions. Retention: transient (session lifetime only). No regulatory retention obligation.
4. **CR-023: Session decision embeddings** — Embedded in mentor_raw_inputs via OpenAI API. Third-party API call. Data minimisation: only sanitised summaries embedded, not full conversation transcripts. OpenAI data processing agreement required (existing if already used for support embeddings).
5. **CR-024: claude-cowork inner agent registration** — New system component. Authority lifecycle applies. Audit trail via existing `AuthorityChangeEvent` type.

### 15.6 R2 — Future Employment Evaluation Prevention (MEDIUM)

**Issue:** When the architecture generalises beyond the founder (Section 13.1), it could theoretically be used by employers to evaluate employee reasoning quality.

**Resolution:** The session bridge inherits the same R2 enforcement as the ring. `detectGovernanceFlags()` in `support-agent.ts` already flags employment-related content for escalation. The same function will be called during `classifyExchange()` to detect and block any employment evaluation context. Additionally, the Terms of Service for the mentor product (when generalised) must explicitly prohibit use for employment assessment, performance review, or hiring decisions — consistent with R2's intent.

---

## 16. Founder Decisions (Resolved 4 April 2026)

1. **Phase priority:** Phase A (Observer) first, then Phase B (Consultant). Observer provides immediate value with lowest effort; consultant builds on top.

2. **Companion mode trigger:** Automatic activation. Sessions matching strategic keywords (business plan, pricing, architecture, compliance, revenue, trust layer, competitive, positioning) activate companion mode without manual invocation. The founder can override to observer or consultant if preferred.

3. **Knowledge Context automation:** Auto-update at the end of every session that contains strategic decisions. No manual trigger needed — the session bridge appends a dated changelog entry to `SageReasoning_Knowledge_Context_Summary.md` automatically.

4. **Outcome tracking cadence:** Triggered when a related decision comes up. The weekly mirror does not proactively prompt for outcome reviews on a fixed schedule. Instead, when the session bridge detects a new decision in the same domain as a past decision, it surfaces the earlier decision's mentor observation and asks: "Last time we decided X. How did that play out?"

5. **Quiet mode default:** Standard (all observations visible). The founder wants full visibility by default. Quiet mode available as an override for focused sessions.

---

## 17. Multi-Agent Proximity Tracking

The Mentor Hub tracks proximity journeys as separate lines per inner agent, creating a comparative view of reasoning quality across different operational domains.

### 17.1 Tracked Agents

| Agent ID | Display Name | Colour | What It Tracks |
|----------|-------------|--------|---------------|
| `founder-personal` | Founder (Personal) | Gold | Journal reflections, morning/evening check-ins, personal decisions |
| `claude-cowork` | Claude Cowork (Project) | Blue | Strategic decisions made in Cowork sessions — architecture, pricing, scope |
| `sage-support` | Support Agent | Green | Customer-facing support ticket reasoning quality |
| `content-agent` | Content Agent | Purple | Future — marketing content, documentation, blog post reasoning |
| `research-agent` | Research Agent | Teal | Future — market research, competitive analysis reasoning |

### 17.2 Baseline Establishment

Each agent's proximity journey starts with a baseline assessment. For the `claude-cowork` agent, the baseline is established by running a comprehensive Stoic check across the entire project — all files, all systems, all strategic documents — evaluating the aggregate reasoning quality of the decisions that built SageReasoning to its current state.

This baseline answers: "At the point we started tracking, what proximity level was the project's collective reasoning operating at?"

### 17.3 Graph Behaviour

The Proximity Journey graph shows one line per active agent, each starting from its baseline assessment date. Lines diverge as agents operate in different domains with different reasoning quality. The graph reveals:

- Which operational domains produce the highest-quality reasoning
- Whether project-level decisions (claude-cowork) track with or diverge from personal development (founder-personal)
- Whether customer-facing reasoning (sage-support) maintains quality as authority increases
- Cross-agent patterns that individual agent tracking would miss
