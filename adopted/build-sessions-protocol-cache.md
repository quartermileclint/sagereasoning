# Build-Sessions Protocol Cache — Substrate as Plugin

**Status:** Adopted 2026-05-10 under `D-BUILD-SESSIONS-CACHE-ADOPTED-2026-05-10`. Validated as-written by the founder between sessions; no edits during planning-session validation pass. Moved from `/drafts/build-sessions-protocol-cache.md` (predecessor preserved in git history).
**Governs:** All sessions of the substrate-as-plugin build arc — from initial planning through to the plugin's first marketplace listing AND the migration of existing bundled-prose consumers onto the translation-sandwich substrate. Carries the build-arc-specific context that would otherwise be re-read at every session open.
**Does not govern:** The general session protocol (handled by `/adopted/standing-protocol-cache.md`), what gets built (manifest's remit), or how to work together (project instructions' remit).
**Update discipline:** When the build-arc architecture, decisions, or migration scope changes, this cache must be updated in the same session as the change. Cache drift is logged via a `D-BUILD-CACHE-DRIFT-…` entry. Diverges from architecture? Architecture wins; cache is reference convenience.

---

## How to use this cache at session open

For any build-arc session (planning, execution, migration, plugin work):

1. **Read the standing protocol cache** (`/adopted/standing-protocol-cache.md`) for the general session protocol, model selection, KG register, signals, risk classification.
2. **Read this cache** (~3 min) for build-arc-specific context: the agreed architecture, seven decisions/directions, two governing rules, migration intent, and living-state references.
3. **Read the predecessor build-arc session close** (~5 min) for the immediate handoff.
4. **Read the day's primary deliverable in full.**
5. **Confirm at session open**: tier; build-arc-specific architecture frame; rule applicability (Rule A licensing gate, Rule B holistic-second-pass); migration scope if applicable.

If a session is purely build-arc-internal (planning, ADR drafting, decision-log entries within the arc), this cache plus the standing cache plus the predecessor close is enough. No need to re-read the architecture exploration transcripts or the inbox research files — the agreed positions are captured here.

---

## The agreed substrate architecture (one paragraph)

The Stoic Agent Substrate is delivered as a plugin (or plugin family) installable via plugin marketplaces. Layer 1 (text → structured features) is **open-sourced** under permissive licensing (specific licence TBD at the licensing gate). Layer 2 (deterministic mechanism application) and Layer 3 (prose generation) **stay closed and server-side**, providing the authoritative judgement and the controlled deliverable. The R20a distress perimeter operates as a three-layer defence: open-source script in the plugin (fast local), server-side gate guarding Layer 2 (compliance), and Layer 3 deterministic injection of the distress pass-through statement (final enforcement). Two front-ends share one substrate: `sagereasoning.com` for human practitioners, plugins for agent developers — both call the same Layer 2 + Layer 3 backend services.

---

## The seven decisions / directions (operative summaries)

| # | Decision | Source |
|---|---|---|
| 1 | Open-source Layer 1 only; Layer 3 stays closed (with `prose_mode` parameter for domain customisation) | `/operations/handoffs/founder/2026-05-10-substrate-plugin-architecture-close.md` Decision 1 |
| 2 | Build with end goal of complete plugin package (plugins are the substrate's distribution form) | Same close, Decision 2 |
| 3 | Three-layer R20a defence (in-plugin script + server-side gate + Layer 3 deterministic injection) | Same close, Decision 3 |
| 4 | Two front-ends, one substrate (sagereasoning.com for humans; plugin for agents; shared backend) | Same close, Decision 4 |
| 5 | Cowork plugin tooling identified as candidate first-marketplace path (not final commitment) | Same close, Decision 5 |
| 6 | Next session dedicated to detailed planning only | Same close, Decision 6 |
| 7 | Once Layer 1, 2, 3 are finalised and adopted, every existing SageReasoning product currently using the bundled prose method swaps to the translation-sandwich method. Migration is part of this build arc. | Same close, Decision 7 |
| 8 | Build-sessions-protocol-cache created as one-stop reference for the build arc | Same close, Decision 8 (this cache) |

---

## The two governing rules from prior staging-attempt learnings

**Rule A — Licensing immediately precedes any public open-source release.** Licensing is not a generic Stage 1 item distributed across the plan. It is a *gate* placed in the staging plan immediately before the first stage that goes public with open-sourced code. Lawyer review at the gate. Nothing public ships until the gate is cleared.

**Rule B — Holistic second pass after step-scoping.** Once all stages and steps are scoped step-by-step, a second pass over the whole plan: (i) check implications across stages, (ii) identify efficiencies (combinable work, redundancies, parallel-work opportunities), (iii) repackage into time-bounded sessions rather than step-bounded sessions (sessions end on time budget or natural pause; a session may contain multiple steps; a step may span multiple sessions), (iv) design sessions for minimal mid-session founder input (founder elects scope at session-open and reviews/approves at session-close; in between, AI works without needing decisions). Both rules govern the planning method, not just the planning output.

---

## Product migration intent — the K-category

**Scope:** Once the substrate (Layers 1, 2, 3) is finalised, every existing SageReasoning product currently using the bundled prose method gets swapped to the translation-sandwich method.

**Why:** Structural consistency across the product line. The bundled engine's limitations (those that drove the translation-sandwich design in the first place) currently still affect every consumer except `/api/reason`. The migration completes what M1-CP6 (the 2026-05-08 cutover) started for `/api/reason` only.

**Scope artefact (source of truth for what exists and current status):** `/website/public/component-registry.json` — 191 components with statuses (`scoped → designed → scaffolded → wired → verified → live`), dependencies, rules served, blockers. The registry tells us which consumers currently use bundled prose, which already use translation-sandwich, and which are in transitional states.

**Scope artefacts (what the products do):**
- `/users-guide-to-sagereasoning.md` — the user-facing manual; Parts Two and Four describe what each product does for practitioners
- `/summary-tech-guide.md` — the operational/technical manual; Section 1 (File Map) names the API surface and what each route directs
- `/summary-tech-guide-addendum-context-and-memory.md` — addendum on context architecture and memory; relevant for migration of context-dependent consumers

**Migration is part of the build arc, not separate from it.** The plugin work serves agent developers; the migration work serves human users on sagereasoning.com. Both depend on the substrate being mature, and migration findings inform substrate refinement. Migration sequencing, verification methodology, and cost impact assessment are part of the staging plan.

---

## Founder governing notes for the duration of the build arc

**No current users (affirmed 2026-05-10).** The only logins are the founder's and known test logins. The Critical Change Protocol's step 3 ("What happens to existing sessions?") is moot for the build arc and may be answered "N/A — only founder + test logins exist; no third-party sessions to invalidate." All other Critical Change Protocol steps remain in full force. When the plugin ships and external users exist, this simplification ends.

Logged via `D-BUILD-CACHE-DRIFT-RESOLVED-2026-05-10-NO-USERS` (lean form). Added in-session per the cache's update discipline below.

---

## Living-state references

These are the documents that describe **current state** and must be re-read whenever migration scope or product status is in question. Sessions that touch migration MUST read these at session-open:

| Document | Path | Role | When to re-read |
|---|---|---|---|
| Component registry | `/website/public/component-registry.json` | Source of truth for what products exist, current status, dependencies, blockers, rules served | Any session touching migration; any session changing product status |
| Users' guide | `/users-guide-to-sagereasoning.md` | What each product does for practitioners; intended use; audience | Migration-planning sessions; any session that changes product behaviour |
| Tech guide | `/summary-tech-guide.md` | Where products live in the codebase; what each route directs; safety + support; growth ops | Migration-implementation sessions; any session touching the API surface |
| Tech guide addendum | `/summary-tech-guide-addendum-context-and-memory.md` | Context architecture and memory specifics | Sessions touching context layers or mentor memory |
| Standing protocol cache | `/adopted/standing-protocol-cache.md` | General session protocol (model selection, KG register, signals, risk classification, lean templates) | Every session — the basic session-opening reference |
| This cache | `/adopted/build-sessions-protocol-cache.md` | Build-arc-specific context | Every build-arc session |
| Predecessor build-arc close | Most recent in `/operations/handoffs/founder/` matching `*substrate*` or `*plugin*` | Immediate handoff | Every build-arc session |
| Adopted staging plan | `/adopted/substrate-plugin-staging-plan.md` (once approved; currently in `/drafts/`) | The staged build plan governing the arc | Every execution session in the arc |

---

## Open questions parking lot — for visibility, not re-litigation

The build arc carries twenty open questions. They are tracked here for visibility so subsequent sessions don't have to re-read the discussion that surfaced them. Each is annotated with current status. The planning session closes some; subsequent sessions may close more.

| # | Question | Status |
|---|---|---|
| 1 | Mode separation (evaluative / prescriptive / augmentative-combo) — plugin variants or single configurable plugin? | Planning-session question |
| 2 | Layer 2 schema scale + middle protection | Confirmed by Decision 1 + closed Layer 3; permissive licence appropriate for Layer 1 |
| 3 | Distress check posture | Answered by Decision 3 (three-layer R20a defence) |
| 4 | Credential portability | Mostly resolved by plugin paradigm; specific format (JWT / W3C VC / hybrid) is planning question |
| 5 | Action scorer parallel | Confirmed: agent action scorer mirrors human action scorer wherever evaluative is in play |
| 6 | Distribution channel | Answered: plugins via marketplaces |
| 7 | Specific licence form for open Layer 1 | Deferred to lawyer review at the licensing gate (Rule A) |
| 8 | Plugin governance model | Planning-session question; minimum-viable on day one |
| 9 | Layer 2 signing infrastructure timeline | Planning-session question; foundational for the moat |
| 10 | Standards-formation engagement | Planning-session question; smaller scope under plugin paradigm |
| 11 | Brand and trademark posture | Planning-session question |
| 12 | Migration path for sagereasoning.com consumers | Now framed as the K-category in the build inventory |
| 13 | R20a perimeter handover mechanism | Answered by Decision 3 |
| 14 | First marketplace target | Planning-session question (Cowork is candidate per Decision 5) |
| 15 | Plugin version compatibility and update mechanics | Planning-session question |
| 16 | Plugin trust signalling | Planning-session question; meaningful for ethical-claim plugins |
| 17 | Plugin sandbox limitations per marketplace | Per-marketplace question; surfaces during marketplace targeting |
| 18 | Plugin economics | Planning-session question (free-to-install + paid via connector services is the standard pattern) |
| 19 | Plugin variant strategy | Same as Q1 |
| 20 | Existing V3 endpoints' relationship to plugin tools | Answered: each existing endpoint becomes a plugin-internal tool wrapper after migration to translation-sandwich (per K-category) |

---

## Build-arc session-opening checklist

For any session in this build arc:

- [ ] Standing protocol cache read (~3 min)
- [ ] This cache read (~3 min)
- [ ] Predecessor build-arc session close read (~5 min)
- [ ] If session touches migration: component-registry.json read (or relevant section); manuals consulted as needed
- [ ] Tier declared; risk class confirmed; model selection cited (per standing cache)
- [ ] Rule A applicability noted (does this session involve work that would go public?)
- [ ] Rule B applicability noted (is this a planning or scoping session that should produce a holistic-second-pass output?)
- [ ] Pre-conditions from the day's session prompt confirmed

---

## Cache update discipline

When any of the following changes:

- The agreed substrate architecture (Layer open/closed posture; plugin-as-end-goal; three-layer R20a; two-front-ends-one-substrate)
- Any of the seven decisions or directions
- Rule A or Rule B
- The K-category migration intent or the source-of-truth artefacts (component-registry, manuals)
- The open-questions parking-lot status
- The adopted staging plan once it is approved

…update this cache **in the same session as the change.** The update is Standard risk per 0d-ii. Append `D-BUILD-CACHE-DRIFT-RESOLVED-YYYY-MM-DD` entry to the decision log naming the update step. If this cache and the underlying records (the close, the staging plan once adopted, the standing protocol cache) diverge, the underlying records are authoritative.

---

## Cross-references

- `/adopted/standing-protocol-cache.md` — general session protocol (this cache builds on it; does not replace it)
- `/operations/handoffs/founder/2026-05-10-substrate-plugin-architecture-close.md` — the agreed architecture and decisions
- `/operations/handoffs/founder/2026-05-10-plugin-build-staging-NEXT-SESSION-PROMPT.md` — the planning session this cache supports
- `/operations/handoffs/founder/2026-05-09-substrate-architecture-explore-close.md` — predecessor record (some decisions superseded; on file per preserve-prior-versions)
- `/operations/handoffs/founder/2026-05-09-substrate-build-staging-NEXT-SESSION-PROMPT.md` — predecessor record (superseded; on file)
- `/inbox/Layer A – Impression Capture.rtf` through `/inbox/Layer D – CoC Extension and Ethical Colab Cred.rtf` — research files contributing to the substrate architecture
- `/inbox/sage-intuit.txt` — research file on action-space-generation
- `/inbox/plugin transcript.rtf` and `/inbox/plugin summary.rtf` — research files on the plugin paradigm
- `/manifest.md` — full manifest (R0–R20, AC1–AC8, KG1–KG7)
- `/operations/decision-log.md` — append-only decision trail

---

*End of cache. This document is the build-arc-specific session-opening reference. Adopted 2026-05-10. Update discipline: in-session amendment when underlying records change.*
