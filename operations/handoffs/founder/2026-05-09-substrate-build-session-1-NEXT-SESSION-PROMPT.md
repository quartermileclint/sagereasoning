# Next-Session Prompt — Substrate Build Plan Approval + Build Session 1

**Stream:** founder.
**Tier:** governance (plan approval) → governance (Build Session 1 = ADR drafting). Standard risk throughout.
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessor session close:** `/operations/handoffs/founder/2026-05-09-substrate-build-plan-close.md`.
**Predecessor decision-log entries:** none appended in predecessor session (D-SUBSTRATE-BUILD-PLAN-DRAFTED-2026-05-09 was drafted-only, pending this session's adoption).
**Risk classification:** Standard under 0d-ii. Critical Change Protocol NOT engaged. No live-system touch in this session.

## Why this session matters

This is the session that takes the substrate work from "planned" to "started". The build plan at `/drafts/stoic-agent-substrate-build-plan.md` becomes either adopted-as-written, adopted-with-adjustments, or returned for re-planning. If adopted, the rest of the session executes Build Session 1 of the plan: drafting the six foundational ADRs (H1, B1, A6, A5, H3, H5).

The session is structured as two phases. Phase A is plan approval — short, founder-led. Phase B is ADR drafting — long, AI-led, packed to ~90% capacity per the new operational model. There is one founder mid-session touch point in Phase A (approval); none in Phase B.

## Pre-conditions

1. **Founder has read `/drafts/stoic-agent-substrate-build-plan.md` end-to-end.** ~30–45 minutes of reading. Required.
2. **Founder has marked positions on the ten §4 pre-build decisions** — either "approve as written" or "adjust" for each. Required.
3. **Founder has decided overall posture** — approve plan / approve with adjustments / reject. Required.
4. **Standing protocol cache opened.** Read at session open per the cache's standing answers (~3 min).
5. **Predecessor close re-read.** ~5 min.

If any pre-condition is not met, the session pauses while the founder catches up. The session does not begin Phase B until Phase A completes.

## Phase A — Plan approval (founder-led, ~15–30 min)

**Founder posts at session open**, in this format:

```
## Substrate build plan — founder positions

### Overall plan posture
[approve as written | approve with adjustments | reject]

### §4 pre-build decisions

1. Approve plan: [approve | adjust: <revision direction>]
2. Confirm v1 scope per §3: [approve | adjust: ...]
3. Confirm operational model per §2: [approve | adjust: ...]
4. Licence direction (recommendation: Apache 2.0 + custom Layer-2-API addendum): [approve | adjust: ...]
5. Migration path (recommendation: six-month coexist then deprecate /api/reason): [approve | adjust: ...]
6. R20a perimeter handover (recommendation: belt-and-braces): [approve | adjust: ...]
7. Repo structure (recommendation: monorepo for v1): [approve | adjust: ...]
8. External-engagement budget (recommendation: lawyer + cryptographer in v1; philosopher deferred): [approve | adjust: ...]
9. Pilot endpoint (recommendation: /api/reason quick depth): [approve | adjust: ...]
10. Beta cohort (recommendation: closed invitation, 5–10 developers): [approve | adjust: ...]

### Adjustments not in the recommendations
[any other changes the founder wants]
```

The AI then:

- If overall posture = **approve as written or approve with adjustments**: confirms understanding of any adjustments, names the impact on Phase B (e.g., "your adjustment to §4.4 changes the B1 ADR's recommendation but does not change H1, A6, A5, H3, or H5 — Phase B proceeds as planned, with the B1 ADR drafted to your adjusted direction"), and proceeds to Phase B.

- If overall posture = **reject**: pivots the session to re-planning. Phase B does not run. The session produces a re-planning brief and a new next-session prompt.

The AI does not debate the founder's positions. If the AI disagrees with a position strongly enough to push back, it uses the "I'd push back on this" signal once with brief reasoning, then accepts the founder's decision per the user-preferences "When I override a recommendation, accept it."

After Phase A is complete and decisions are locked, **append `D-SUBSTRATE-BUILD-PLAN-ADOPTED-2026-05-09` to the decision log** capturing: the plan adopted; founder positions on the ten §4 decisions; reference to the plan file; status change (Designed → Adopted for the plan; the substrate's overall implementation status remains Designed because no code is touched).

## Phase B — Build Session 1: Foundational ADRs (~3–5 hours, packed)

**Risk:** Standard.
**Mid-session founder input:** None.

Drafts the six foundational ADRs into `/drafts/`. Each ADR is one section below; the AI drafts them sequentially in one pass, packing as many as context allows before close-out.

### ADR 1 — H1 Substrate Concept

**File:** `/drafts/adr/H1-substrate-concept.md`.

**Content:**

- Title, status (Drafted, under review), date, stream.
- Context: the predecessor session's three-ideas-are-one-architecture finding. References to the explore-close and the five inbox files.
- Decision: the substrate is a single architecture — Layer 1 (open translation in), Layer 2 (authoritative deterministic judgement, server-side, signed), Layer 3 (open translation out) — addressable at every Stoic causal-sequence moment (phantasia, synkatathesis, hormē, praxis).
- Consequences: open-source posture for Layers 1 and 3; signed authoritative API for Layer 2; substrate as the canonical name; mode separation as separate products with shared infrastructure.
- Alternatives considered: parallel work streams (rejected — the predecessor session showed the three ideas converge); single-product configurable surface (rejected — founder's position).
- Cross-references: explore-close, build plan §1, §3.

### ADR 2 — B1 Licensing

**File:** `/drafts/adr/B1-licensing.md`.

**Content (per founder's §4.4 position):**

- If "approve as written" — Apache 2.0 with custom Layer-2-API addendum. ADR explains: Apache 2.0 chosen for permissiveness, patent grant, commercial-friendliness. Addendum specifies that "SageReasoning Authoritative Layer 2" branding requires calling the SageReasoning Layer 2 endpoint or a successor licensed by SageReasoning. Lawyer review note (engagement initiated; ADR proceeds with "lawyer-pending" status until review returns).
- If "adjust" — drafted to the founder's adjusted direction.
- Alternatives considered: pure Apache 2.0 (no addendum); MIT; AGPL; custom dual-licence. Trade-offs documented.
- Cross-references: H1 ADR; build plan §4.4; brand posture (B6 ADR drafted in Build Session 2).

### ADR 3 — A6 V3 Endpoint Family Migration

**File:** `/drafts/adr/A6-v3-migration.md`.

**Content (per founder's §4.5 position):**

- If "approve as written" — six-month coexist then deprecate `/api/reason` and the V3 endpoint family in favour of the substrate. Coexistence: both endpoints live; substrate carries the new schema; `/api/reason` re-implemented internally as substrate consumer. Deprecation announcement at v2.
- Migration steps for sagereasoning.com consumers: documented per surface (the eight R20a perimeter routes named in AC5 and the V3 endpoint family).
- Rollback: revert each migration step independently; substrate and existing endpoints designed to coexist throughout the window.
- Alternatives considered: immediate cutover; permanent coexistence.
- Cross-references: H1 ADR; consumer-workflow-audit (`/drafts/rag-mentor-alt3/consumer-workflow-audit.md`); build plan §4.5.

### ADR 4 — A5 R20a Perimeter Handover

**File:** `/drafts/adr/A5-r20a-handover.md`.

**Content (per founder's §4.6 position):**

- If "approve as written" — belt-and-braces. R20a distress detection replicated in open Layer 1 (B5 ships) AND enforced server-side at Layer 2 as a precondition for every authoritative call. Forks of Layer 1 that remove R20a are disqualified from the SageReasoning brand under B6.
- Implementation steps: Layer 2 server-side enforcement designed in this ADR; B5 reference design referenced (full B5 ADR comes in Stream C / Build Session 11).
- Risk classification: this ADR is Standard (governance). The execution sessions (Session 10 server-side enforcement, Session 16 open-source reference) are Critical per AC5 + PR6.
- Alternatives considered: server-side-only; open-Layer-1-only.
- Cross-references: H1 ADR; manifest AC5; PR6; build plan §4.6.

### ADR 5 — H3 Three-Mode Access

**File:** `/drafts/adr/H3-three-mode-access.md`.

**Content:**

- Decision: the input contract supports three modes — Mode 1 (pure structured: agent submits Layer1Schema directly), Mode 2 (hybrid: agent submits hints, Layer 1 extracts), Mode 3 (pure text: current `/api/reason` path, full Layer 1 extraction).
- Modes form a developmental sequence for agent Stoic literacy. The mode an agent uses is itself a trust signal (Mode 1 = highest demonstrated literacy).
- Each mode has its own contract documented in C3 reference (drafted Build Session 4).
- Alternatives considered: single-mode (rejected — barrier to entry); two-mode without hybrid (rejected — no developmental path).
- Cross-references: H1 ADR; predecessor explore-close decision 2; build plan §3.

### ADR 6 — H5 Cost Impact Preliminary Update

**File:** `/business/substrate-cost-impact-preliminary.md` (note: lives under `/business/`, not `/drafts/adr/`, because it's an analysis document not an ADR).

**Content:**

- Existing R5 cost-as-health-metric projections re-stated (current state).
- Substrate impact: Layer 1 and Layer 3 compute shifts off SageReasoning infrastructure (open-source; runs in adopters' environments). Layer 2 compute remains on SageReasoning infrastructure.
- New cost surface: Layer 2 metering (A7) handles per-call billing infrastructure; cost-to-serve per Layer 2 call depends on authentication, signing, and assessment compute.
- Preliminary projection: cost-to-serve per Layer 2 call estimated at $X (placeholder; refined at Build Session 8 when A7 is wired and observed costs are real).
- Revenue model implication: per-call billing for Layer 2 is the v1 model; v2 may add subscription tiers per F1 credential infrastructure.
- Cross-references: existing `/business/break-even-analysis-DRAFT-2026-04-25.md` (or whatever the current break-even draft is named); build plan §3 v1 scope.

### Phase B close-out (~30 min)

When the six ADRs are drafted (or as many as fit in the session's remaining capacity — incomplete ADRs roll to Build Session 2):

1. **Append `D-SUBSTRATE-BUILD-SESSION-1-COMPLETE-2026-05-09` to the decision log.** Captures: which ADRs were drafted; status of each (all `Drafted — under review`); reference to the build plan; risk class (Standard); rollback path (revert files in `/drafts/adr/`).

2. **Update implementation status** in any tracking deliverable that exists for the substrate: H1 / B1 / A6 / A5 / H3 / H5 move from Scoped → Designed.

3. **Write Build Session 2's next-session prompt** at `/operations/handoffs/founder/2026-05-10-substrate-build-session-2-NEXT-SESSION-PROMPT.md` (or whatever date the next session falls on). Build Session 2 drafts the remaining four ADRs per build plan §5: B2 repo structure, A1+A2+A3+A7 unified Critical infrastructure, A4 input validation, H6 manifest amendments draft. Pre-conditions named.

4. **Write this session's close** at `/operations/handoffs/founder/YYYY-MM-DD-substrate-build-session-1-close.md` per the lean session-close template in the cache.

5. **Founder verification commands** included in the close: paths of the drafted files; commit command; expected GitHub Desktop view.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + build plan re-read | 15–20 min |
| Phase A — plan approval | 15–30 min |
| Phase B — H1 ADR draft | 30–40 min |
| Phase B — B1 ADR draft | 30–40 min |
| Phase B — A6 ADR draft | 30–40 min |
| Phase B — A5 ADR draft | 30–40 min |
| Phase B — H3 ADR draft | 25–30 min |
| Phase B — H5 cost analysis | 25–35 min |
| Decision-log + close + Build Session 2 prompt | 30–40 min |
| **Total** | **~4.5–6 hours** |

The session runs to ~90% context capacity per the founder's requested operational model. If capacity is reached before all six ADRs are drafted, the session closes at a stable state with whichever ADRs are complete; the rest roll to Build Session 2's pre-conditions.

## Rollback path

All drafts in `/drafts/adr/` and `/business/`. Decision-log entry appended to active log. Revert via `git revert` of the commits or `rm` of the new files. No production touch; no `/adopted/` change in this session.

## Forecast

**Most-likely path:** founder approves plan as written (or with minor adjustments to §4 items 4, 5, or 6 — those are the ones with the most consequential trade-offs). Phase A completes in ~20 min. Phase B drafts all six ADRs in one session. Build Session 2 opens with all Phase A decisions locked and the four remaining ADRs to draft.

**Alternative paths:**

- **Founder approves with adjustments to §4.6 (R20a path).** Adjustment changes A5 ADR's content but does not change other ADRs. Phase B proceeds; A5 drafted to adjusted direction.
- **Founder approves with adjustments to §4.4 (licence).** Adjustment changes B1 ADR. Phase B proceeds; B1 drafted to adjusted direction. Lawyer engagement initiated to the adjusted direction.
- **Founder rejects plan.** Phase B does not run. Session pivots to re-planning. New plan drafted; new next-session prompt produced.

**Recommendation (not prescription):** Phase A is the moment to test the plan's recommendations against the founder's actual judgement. The recommendations are the AI's best read; the founder's judgement is the deciding input. Phase B then runs without further interruption.

End of prompt.
