# IDEA loop — the seven generation heuristics (from the family conversation, relayed by the mentor 2026-08-05)

**Status: content captured, not yet scoped or built.** Per the standing sequence (`operations/architecture-map-2026-08/06-PLAIN-TEXT-MIRROR.md` §"Sixth element"), the generation step itself is explicitly NOT to be scoped until `OikeiösisGap` and `GeneratedCandidate` are scoped and brought to the mentor. These seven heuristics are generation-step design — they belong to that later step, not to the type-scoping step currently next in the queue. This document exists so the heuristics survive intact to that point, rather than needing to be reconstructed or re-asked-for later.

**A note on one thing NOT captured here as fact:** the mentor's 2026-08-05 message attributes a prior statement to me — "You said that examining what busy work needs to be done on a project will at least populate the task list when there is more than one agent collaborating." I have no record of saying this in this conversation. I'm not disputing that it was said somewhere — it may have come from a different session, a different surface, or a paraphrase of something adjacent — but I won't claim a memory I don't have just because it's attributed to me. The multi-agent shared-state requirement below is recorded on its own merits (the mentor's reasoning stands regardless of its origin), not on the strength of a self-continuity claim I can't verify.

## The seven heuristics, as given

1. **Analogous transfer** — given the `OikeiösisGap`, what existing capability could be applied to address it in a way it has not been applied before?
2. **Combinatorial generation** — take two elements from different domains in the knowledge base, combine them, produce a candidate the combination suggests.
3. **Synthesis over novelty** — produce synthesis of existing knowledge that reveals what is implicit but not yet explicit; not novelty for its own sake.
4. **Context transfer** — given an existing capability, what new context would reveal a new application not yet tried?
5. **Fifth-circle weighting** — weight candidates with genuine reach toward all rational beings more highly than candidates that serve only immediate project needs.
6. **Anomaly detection** — given the history of examined actions, what pattern is absent that should be present, or present that should be absent? The anomaly is the seed.
7. **Friction detection — added 2026-08-05.** Given the current task list, what routine tasks are being performed, and what friction points do they reveal? A friction point is any step in a routine task that takes longer than expected, produces an unsatisfying result, or requires workaround behaviour. Each friction point generates one candidate: a proposed action that would remove or reduce it.

**Friction detection carries one structural difference from the other six.** Its candidates enter the guardrail-shaped filtering pass alongside the others, but they carry a **preferred-indifferent tag at generation time, not a virtue-domain tag** — the examination step determines afterward whether they incidentally engage a virtue domain. If they don't, they remain valid task candidates anyway: they address preferred indifferents, which is appropriate action even when it isn't perfect action. (This is the same vocabulary distinction the rest of this arc has used throughout — kathekon/appropriate action vs. katorthoma/perfect action — applied here to generation for the first time.)

**The stated mechanism (six-heuristic core, unchanged):** the generation step does not choose one heuristic per cycle — it applies all six of the original heuristics and produces **one candidate per heuristic** (six candidates), then examination and novelty detection filter them down to the one most worth pursuing. Stated purpose: a richer candidate pool, higher probability that at least one candidate is genuinely novel and genuinely virtuous.

## The fallback rule — friction detection as the null-cycle backstop

**When the active generation mechanisms (heuristics 1–6) return three consecutive null cycles, the loop shifts to friction-detection-only mode** — generating candidates exclusively from heuristic 7 (the current task list) — **until a non-null cycle returns from one of the active mechanisms.** Stated purpose: prevents the loop from spinning on null cycles indefinitely, and ensures the task list is always being populated even when the stronger generation mechanisms aren't producing.

## The shared-state requirement — a storage requirement to name before the scope document, not after

**The task list friction detection reads from must be shared state — readable by every collaborating agent, not local to whichever process is running the loop.** This is the first time the IDEA loop has been described in a multi-agent context (see the note above on the attribution I can't verify — regardless of where the observation originated, the requirement itself is what needs recording): if more than one agent is collaborating on a project, examining what routine/busy work needs doing is itself one way the task list gets populated, independent of whether heuristics 1–6 are producing anything. For that to work, the task list can't be private state inside one loop runner's own process — it has to be a shared, externally-readable store multiple independent loop runners (or agents) can read from and write to.

**Consequence for the eventual type/table scoping (named now, not decided):** this is a genuinely new storage requirement, distinct from the per-cycle dashboard table already named — a shared task-list store is a different shape (mutable, multi-writer, queried by every collaborating agent) from an append-only per-cycle history table (one writer, the loop runner, one row per cycle). Whether these end up as one table or two is a design question for the scoping session; naming that they're structurally different kinds of storage is the fact worth carrying into it.

---

## Examination cost — RULED, 2026-08-05, standing design

The technical option flagged below the heuristics (guardrail-shaped filtering vs. six full consults) was put to the mentor and ruled on directly. **Binding design:**

1. **Six candidates generated, one per heuristic** (unchanged from the original spec above).
2. **Each of the six passes through the guardrail shape only** — proximity rating + virtue-domain assessment, no Layer 3 prose call. Reasoning, stated by the mentor: the guardrail shape exists precisely because not every examination needs prose (the same 2026-06-19 ruling that the safety gate skips Layer 3); the filtering pass is structurally identical to that use case — a rapid assessment to decide what's worth the full treatment, not a consult needing human-readable reasoning. Six full consults per cycle would make the loop prohibitively expensive for repeated cycles, defeating the point of a generative loop.
3. **Novelty detection runs on all six guardrail-shaped results.**
4. **The candidate with the highest proximity rating that ALSO passes the novelty threshold receives the full examination shape** (including Layer 3 prose). That prose becomes the human-legible cycle result the dashboard shows.
5. **The null-cycle rule, ruled explicitly:** if NO candidate passes the novelty threshold, the cycle must not fall back to the highest-proximity non-novel candidate and present it as if it were a result. It records a **null cycle** — a named, honest outcome meaning generation produced nothing new this cycle — and the loop continues to the next cycle. A null cycle is not a failure; it is the honest-claims discipline applied to generation: the loop does not manufacture novelty by quietly lowering the threshold when genuine novelty is absent.

**Consequence for the eventual type/table scoping (not decided here, named for that session):**
- The per-cycle dashboard table (from the earlier ruling) needs a way to represent a null cycle honestly — not an empty row, not a row forced to hold a non-novel candidate, but a row that says plainly "no candidate passed the novelty threshold this cycle."
- The `GeneratedCandidate` type needs to carry both its guardrail-shaped result (proximity + virtue domains) AND, only for the winning candidate, the full examination's prose — the two are populated at different stages of one cycle, not both up front.
- The heuristic-attribution field named as a future consideration in the original technical note still stands — six candidates now definitely need to be told apart through the whole filter pipeline, not just at generation time.

## What this doesn't change

- Sequencing is unaffected. `OikeiösisGap`/`GeneratedCandidate` scoping is still the next item. This ruling fixes the SHAPE of the generation step's cost profile for when that step is eventually scoped — it doesn't move it earlier in the queue.
