# Next-Session Prompt — Open agenda: founder elects post-M1-arc-close

**Stream:** founder.
**Tier:** TBD at session-open per founder election from candidate items below.
**Governing frame:** /adopted/standing-protocol-cache.md (operative reference).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-08-M1-CP6-close.md`.
**Predecessor decision-log entry:** `D-M1-CP6-CUTOVER-2026-05-08` (M1 arc complete; Layer 3 module Live; eight open questions tracked; 2F architectural arc deferred per PR7).
**Risk classification:** TBD per elected item.

## Why this session matters

M1 arc closed. Translation-sandwich is Live on `/api/reason`. The project is in a known-good state — no immediate next-session is required. This prompt surfaces candidate work items so the founder can elect direction at session-open. The candidate items range from architectural (2F arc continuation) to operational (cost monitoring restoration) to governance (Q5 / PR8 promotion) to maintenance (post-cutover watch deep-dive) to project-level (M2 scoping). The founder may also elect to **stabilise and pause** — no work required.

## Pre-conditions

1. **All M1-CP6 commits pushed.** Vercel green; production behaviour stable on the new translation-sandwich-v1 schema. Verify before session-open via the Independent verification block in `/operations/handoffs/founder/2026-05-08-M1-CP6-close.md` §"Founder Verification (Between Sessions)" Step B.
2. **M1 arc closure acknowledged.** No outstanding work items from M1 are blocking the next session — eight open questions are watch items, not blockers.
3. **2F clarifying questions pre-considered (if 2F is elected).** If the founder elects 2F arc continuation, the four open clarifying questions captured in `D-M1-CP6-CUTOVER-2026-05-08` deferred-decision section need answers at session-open: (i) Opus model version; (ii) replace or augment Layer 3; (iii) Component A scoring scope vs R6c; (iv) raw-data scope. Founder may pre-think; not all four must be answered to begin scoping.

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier, model selection, risk class, signals).
2. `/operations/handoffs/founder/2026-05-08-M1-CP6-close.md` (~5 min — predecessor close; status changes; eight open questions; candidate items).
3. **For 2F election only:** `D-M1-CP6-CUTOVER-2026-05-08` deferred-decision section (~3 min — captures founder's underlying intent + four clarifying questions + governance work + sequencing recommendation).
4. **For post-cutover watch / M2 scoping / cost monitoring:** the relevant section of the predecessor close (Open Questions / Production state).

Confirm at open: tier (TBD per elected item); hold-point status (P0 0h active); model selection (cite cache row at item-time); status vocabulary; signals/risk class.

## Part B — Founder election at session-open

The founder elects ONE primary item below. Other items are deferred to subsequent sessions.

### Item A — 2F architectural arc continuation (Layer 3b Opus contextualization)

**Founder's underlying intent (captured at M1-CP6 session-open):** preserve bundled engine's input-specific responsiveness — what bundled offers that sandwich Layer 3 (Sonnet) doesn't fully capture — by adding a new layer that takes raw input + raw user data + Layer 2 deterministic assessment, and produces input-specific contextualizing prose via a more capable LLM (Opus). Three components surfaced (A — numerical scoring; B — current Sonnet Layer 3 prose unchanged; C — new Opus call).

**First-session scope (2F-CP1):** founder answers the four clarifying questions. AI drafts ADR-009 (or ADR-004 amendment) specifying the new layer's module surface, prompt template, max tokens, temperature, system prompt structure, raw-data scope, fallback semantics. AI drafts AC1 amendment adding Opus row. AI drafts R6c reconciliation depending on Component A scope. AI drafts R5 cost projection update. ADRs land in `/drafts/adr/`; founder approves; ADRs move to `/adopted/adr/`.

**Risk class for first session:** Standard (governance — documentation only; no production touch).

**Estimated:** 3–5 hours for 2F-CP1. Multi-session arc thereafter (~5–7 sessions to land Live equivalent of M1-CP6 cutover).

**Pre-work founder may bring:** answers to the four clarifying questions; any cost ceiling or latency budget preferences; any raw-data scope preferences (mentor profile / journal entries / interaction history / etc.).

### Item B — Post-cutover watch deep-dive

**Scope:** investigate the eight open questions against live (post-cutover) traffic. Specifically:

(i) Q3 — F8 SCOPE_AMBIGUITY non-fire investigation. Submit the F8 fixture pattern to live `/api/reason`; observe whether the Layer 1/Tier 1 detector fires SCOPE_AMBIGUITY now that the engine is user-facing. If it does, Q3 closes. If it doesn't (3rd recurrence), escalate to Layer 1 review session.

(ii) Q4 — L3 latency creep. Observe live sandwich-only latency against the 20,000 ms watch threshold. If observations approach threshold, surface for prompt-trimming review.

(iii) `value_assessment.identified_value_errors` null observation. Audit Layer 2 module's `identified_value_errors` field population logic; understand whether Revision 6 prose is sourcing from Layer 1's `value_categories_at_stake` (per M1-CP5b Gap 6 disposition) or Layer 2's `identified_value_errors`.

(iv) Causal-stage sample bias. Run broader fixture coverage; observe whether sample-bias resolves with more data.

**Risk class:** Standard (read-only analysis against live data; no code change unless an issue is found).

**Estimated:** 2–4 hours.

**Pre-work founder may bring:** any specific concerns surfaced from live-traffic observation since cutover.

### Item C — M2 scoping (next consumer migration)

**Scope:** elect M2 target — score family (`/api/score`, `/api/score-decision`, `/api/score-document`, `/api/score-scenario`, `/api/score-social`) per ADR-003 migration sequence, OR mentor family (`/api/mentor/private/reflect` + others), OR another consumer. AI surfaces consumer-by-consumer differences; founder elects scope. AI drafts M2 multi-session checkpoint structure analogous to M1 (M2-CP1 → M2-CP6 minimum) as an ADR-010 (or similar). Per PR1 single-endpoint discipline, M2 inherits the verified pattern from M1.

**Risk class for first session:** Standard (governance — scoping work).

**Estimated:** 1–2 hours scoping; multi-session arc thereafter.

**Pre-work founder may bring:** any preference on M2 target; any awareness of consumer-specific constraints (e.g., M3 mentor family touches private intimate data per R17 — adds intimate-data-protection considerations on top of the architectural migration).

### Item D — Cost monitoring restoration on `/api/reason`

**Scope:** wire `incrementCostTracker` (or equivalent) into `runSandwich` so R5 cost-as-health-metric monitoring returns. Pre-cutover, sandwich cost was tracked via `incrementCostTracker` inside `runParallelSandwich`; that path is no longer called from `/api/reason` post-cutover. Two implementation options: (i) move cost tracking into `runSandwich`; (ii) wrap `runSandwich` at the route level with a cost-tracking adapter.

**Risk class:** Standard (additive; no user-facing change; observability restoration).

**Estimated:** 30–60 minutes.

**Pre-work founder may bring:** any preference on which approach (in-sandwich vs route-wrapper); any preference on cost-cap policy post-cutover (currently no cap on production sandwich; the pre-cutover cap was specifically for parallel-run cost discipline).

### Item E — Q5 promotion to permanent KG entry (preemptive)

**Scope:** Q5 is at 2nd recurrence in SQL/JSONB-path domain; this session surfaced a related observation in code-line-number domain. Founder may elect to broaden Q5's resolution preemptively (don't wait for further recurrence). Update `/operations/knowledge-gaps.md` with a Q5 permanent entry naming the pattern: schema-vs-prompt drift includes time references, column names, JSONB paths, code line numbers, and any configuration reference cited in a session prompt that may have moved between drafting and use.

**Risk class:** Standard (governance — documentation update).

**Estimated:** 30 minutes.

### Item F — PR8 promotion to permanent process rule

**Scope:** the in-place ADR amendment pattern is at 7th recurrence. Founder elected to hold PR8 promotion at multiple prior sessions. Pattern is well-established. Founder may elect promotion at any subsequent ADR-amending session. Update `/manifest.md` Process Rules section to add PR8 as a permanent process rule naming the in-place ADR amendment pattern + revisit conditions.

**Risk class:** Standard (governance — manifest update).

**Estimated:** 30 minutes.

### Item G — Routine governance / cache-drift / index update

**Scope:** sweep for any drift between manifest / cache / project instructions; update `/INDEX.md` if any new files were added across the M1 arc; verify `D-CACHE-DRIFT-…` entries are current; ensure all decision-log entries from M1 arc cross-reference correctly.

**Risk class:** Standard (governance — documentation maintenance).

**Estimated:** 30–60 minutes.

### Item H — Stabilise and pause

**Scope:** no work this session. M1 arc closure is acknowledged; production state is stable; next-session is deferred to founder's next initiative. The candidate items above remain available; this prompt remains the entry point for whichever direction the founder elects next.

## Part C — Anticipated session shape

| Phase | Item A | Item B | Item C | Item D | Item E | Item F | Item G |
|---|---|---|---|---|---|---|---|
| Cache + predecessor close read | 10 min | 10 min | 10 min | 10 min | 10 min | 10 min | 10 min |
| Founder election + framing | 5–10 min | 5 min | 5–10 min | 5 min | 5 min | 5 min | 5 min |
| Substantive work | 2–3 hr | 1.5–3 hr | 1 hr | 20–40 min | 15 min | 15 min | 30–45 min |
| Decision-log + close (lean) | 30 min | 20–30 min | 30 min | 20–30 min | 20 min | 20 min | 20–30 min |
| **Total** | **~3–4 hr** | **~2–4 hr** | **~1.5–2 hr** | **~1 hr** | **~50 min** | **~50 min** | **~1–1.5 hr** |

For Item H (stabilise + pause): no session.

## Rollback path

Per item:

- Item A (2F-CP1 ADR drafting): `git revert` of ADR-drafting commit; no production touch.
- Item B (post-cutover watch): read-only analysis; no rollback needed.
- Item C (M2 scoping): `git revert` of scoping ADR commit; no production touch.
- Item D (cost monitoring): Standard rollback — `git revert` of the wiring commit; no user-facing impact.
- Items E + F + G: documentation-only; `git revert` reverses cleanly.
- Item H: N/A.

## Forecast

**Most-likely paths:**

- **Item B (post-cutover watch)** lands first — observing live traffic against the eight open questions provides empirical data informing whether Q3 closes naturally or escalates, whether Q4 latency creep continues, whether F4 generalises beyond the fixture, etc. Cheapest first session post-arc-close; produces evidence for subsequent session prioritisation.
- **Item A (2F arc)** is the most ambitious and most aligned with founder's M1-CP6 brainstorm. Founder elects when ready (may want to sit with the cutover for some time first).
- **Item D (cost monitoring restoration)** is hygiene; pairs well with Item B (observing post-cutover behaviour benefits from cost observability).

**Recommendation (not prescription):** Item B first to gather post-cutover evidence + observe behaviour against open questions; Item D as a parallel hygiene task; then Item A 2F arc when founder is ready.

The founder elects. The above is information for the choice, not a prescription on it.

End of prompt.
