# Next session — scope the IDEA loop configuration shape and shared task-list storage

**Tier:** `governance`/`code-elevated` at most (two scope documents, not a build — no code should be written this session unless the founder explicitly widens scope). **Read first, in order:**

1. `operations/decision-log.md` — `D-OIKEIOSIS-GAP-GENERATED-CANDIDATE-TYPES-SCOPED-2026-08-06`, `D-OIKEIOSIS-GAP-GENERATED-CANDIDATE-TYPES-APPROVED-2026-08-06`, `D-IDEA-LOOP-NEUROSCIENCE-ADDITIONS-RECORDED-2026-08-06`, `D-IDEA-LOOP-CONFIGURATION-SHAPE-QUEUED-2026-08-06`. **Verbatim wins over this prompt's summary below.**
2. `operations/agent-circles-2026-08/2026-08-05-idea-loop-generation-heuristics.md` — the full generation-step spec as it currently stands (seven heuristics, the examination-cost/null-cycle rulings, the shared-state requirement, the neuroscience-grounded additions incl. the corrected configuration-shape parameters). This is reference material this session draws on, not this session's own deliverable.
3. `operations/agent-circles-2026-08/2026-08-06-oikeiosis-gap-generated-candidate-type-scope.md` — the approved type shapes (`OikeiösisGap`, `GeneratedCandidate`), for context on how a scope document in this arc is structured and how mentor rulings get folded back into it.
4. `operations/architecture-map-2026-08/06-PLAIN-TEXT-MIRROR.md` §"Sixth element" — the dependency graph, items 10 and 11, and step thirteen of the binding sequence. This session is step thirteen.

## What this session is

**Scope two independent things and bring both to the mentor. Nothing else.**

1. **The IDEA loop configuration shape** — four named parameters, all already settled by mentor ruling (not open questions for this session to re-derive):
   - `minimumInterval` — the minimum time between the initiation of one cycle and the initiation of the next, for computational throttling.
   - `maximumDuration` — the ceiling on how long a single cycle may run before it is terminated regardless of outcome.
   - `randomOffsetPercent` — a small percentage variation applied to the interval, for two stated purposes: preventing synchronisation problems when multiple loops run simultaneously, and introducing phantasia variation into the generation step's input sequence.
   - `minimumIncubationInterval` — the mandatory wait between the close of one cycle and the initiation of the next generation step. Distinct from `minimumInterval`: not a computational throttle, a design-encoded recognition that generative capacity increases when the system is not actively processing. Default value TBD at this session.

2. **The shared task-list storage** friction detection (heuristic 7) reads from — per `D-IDEA-LOOP-FRICTION-DETECTION-SHARED-STATE-2026-08-05`: shared, externally-readable, multi-writer, multi-reader storage, structurally distinct from the append-only, one-writer per-cycle dashboard table also named elsewhere as still-unscoped. Whether these end up as one table or two is this session's design call — the fact that they're structurally different kinds of storage was named to avoid discovering it mid-scoping.

Both are prerequisites for the generation-step scope document (not yet a numbered item in the graph — it follows this session). Per the ruling: **do not scope the generation step itself yet.** The heuristics document exists so that content survives to whenever that later session opens.

## What "bring to the mentor" means here

Same established pattern as the type-scoping session: author the shape (a design document, or a proposed type/schema — founder's call on which; PR15 leans toward a design document first given both items involve genuinely new storage, not a variation on an existing pattern), name the connecting architectural surfaces at mechanism level (PR20) — e.g. how the configuration shape relates to the externally-driven loop-runner ruling (`D-IDEA-LOOP-PREBRIEF-RULINGS-C2-WIDENED-2026-08-05`'s "the loop lives outside SageReasoning's own servers" finding — since the loop is externally-driven, where does a *configuration* actually live and get read from? this is a real open question this session needs to resolve, not assume), and how the shared task-list relates to the per-cycle dashboard table already named as a separate, still-unscoped table. Bring both to the mentor before either is built.

**One thing worth resolving early, not late:** the IDEA loop's own architecture ruling (externally-driven — the loop lives outside SageReasoning's servers; SageReasoning stays stateless and request-scoped per call) sits in some tension with `minimumInterval`/`maximumDuration`/`randomOffsetPercent`/`minimumIncubationInterval` being framed as *loop* parameters — if the loop runner is external (the founder's own Claude Code session, a dedicated harness, or a future purpose-built runner), these parameters may need to live in that external runner's own configuration, not in a SageReasoning-hosted table, or SageReasoning may need to expose them as advisory values a compliant runner reads and honors rather than enforces server-side. This wasn't resolved by either mentor instruction and is exactly the kind of surface-naming PR20 asks for before scoping locks in a shape — flag it plainly rather than picking a side silently.

## What this session should NOT do

- Do not scope the generation step's prompt structure or the seven heuristics' actual implementation (still queued, its own later session).
- Do not scope C2 or C1c (a separate, independent track in the standing sequence — this session neither blocks nor is blocked by it).
- Do not touch the Stoa activation (independent, founder-walked whenever elected).
- Do not commit the `OikeiösisGap`/`GeneratedCandidate` TypeScript module unless the founder explicitly asks — its approval doesn't require committing it as a side effect of this session.

## Founder's independent option, not sequenced against this session

The Stoa trust-flag activation (`operations/connective-layer-2026-08/2026-08-05-stoa-trust-flag-preactivation-checklist.md`) remains ready to walk whenever the founder wants — before, after, or in parallel with this session. C2+C1c scoping is also independently available whenever the founder chooses to sequence it next.
