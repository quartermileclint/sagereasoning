# Session close — `fresh` novelty-check endpoint BUILT DARK, review clean (2026-08-09)

**Stream:** founder. **Tier:** `code-elevated`. **Decision:** `D-FRESH-ENDPOINT-BUILT-DARK-REVIEW-CLEAN-2026-08-09`.
**Prompt executed:** `operations/handoffs/founder/2026-08-09-fresh-endpoint-BUILD-NEXT-SESSION-PROMPT.md` (its build-order note now updated in place — this build is done; `watching` is next).

## What happened

The first build gate of the ruled Q11 sequence executed: **`fresh` is built, dark, exactly to the ruled scope** (`operations/agent-circles-2026-08/2026-08-09-fresh-novelty-endpoint-scope.md`; verbatim ruling record wins). `POST /api/practice/fresh` — handler-split, UPC `consult`/Bearer-only, `publicAgent` bucket, behind the NEW **`SUBSTRATE_FRESH_ENABLED`** (UNSET everywhere ⇒ honest 503, zero work, battery-asserted). Server-side-only history read via the existing `getTrajectoryWindow` (90d/30-row, `credential_ref`-scoped, R17a); the caller structurally cannot submit history. No LLM call, no billing write, no cost headers, **no trust event** (settled statement in the handler header verbatim), no persistence.

**The session's most load-bearing wiring (Q-C, ruled):** `assessStructuralNovelty` gained a dated amendment — the `insufficient_history` basis fires on **total window size** (`historyWindow.length < EVIDENCE_FLOOR` ⇒ `{ novel: true, confidence: 0, basis: 'insufficient_history' }`), never on the matching-row count; a populated-but-non-matching window remains the genuinely-novel case at curve confidence. Both batteries construct the exact distinguishing fixture. Friction candidates surfaced unchanged. A window-read **outage is a 503, never an empty window** — an outage must not manufacture the starved-window pass.

**Q6 elected YES at open** (disclosed, per the prompt's explicit-decision pre-condition): `'terminated_by_timeout'` is now the seventh `cycleOutcome` value. The module's stale "DARK / UNCONSUMED" header was corrected per PR20; the darkness pin now asserts both halves (measured paths clean + the fresh handler genuinely the consumer).

**One disclosed build choice slightly beyond the ruled minimum:** the §2.9 structural-novelty-only limitation rides the wire as a static `limitation` string (in addition to the doc comments the ruling requires). The PR19 review raised no fidelity concern; the founder can strike it at activation review if preferred.

## Verified

- `fresh-handler` battery **61/0** (new) · `idea-loop-types` battery **20/0** (updated to the ruled behaviour) · `tsc` 0 · `npm run build` ✓ (`ƒ /api/practice/fresh` registered).
- **PR19 independent adversarial review: GO, zero findings** — run on the founder's elected model settings (paused before and after per the arc's standing practice); all three dimensions (ruling-fidelity / PR20 mechanism-facts / boundary compliance) clean; the §2.9 required dimension confirmed un-watered-down; both batteries independently re-run by the reviewer.

## Session honesty notes

- Every Gate-1/Gate-2 hook consult this session **timed out at 28s** (the known transient class) — the session ran unframed; one guardrail CAUTION and one elicitation fired and were answered in-conversation; the Sage Reflect close turn was taken.
- The declared-purpose calling frame DID fire on the mid-session founder turn (the model-swap message) — the first framed turn of the session.

## Production state at session close

**Byte-equivalent for every live surface on the founder's push.** The new route answers 503 flag-off; the `idea-loop-types` edits are consumed only by the dark route and its own tests (review-verified inert elsewhere). No schema, flag-set, credential, mint, or public-doc change. AC7 not engaged.

## Rollback

`git revert` the build commit — the route is dark, nothing live is affected regardless.

## Next

1. **`watching`** — the per-cycle record table + dashboard (its own `code-critical` session; the `watching_write` capability `api_keys` CHECK widening is a founder-walked step at that build's open, not before). Its ruled scope: `operations/agent-circles-2026-08/2026-08-09-watching-per-cycle-record-table-scope.md` + the verbatim record `2026-08-09-mentor-consultation-watching-scope-rulings-verbatim.md` (see `D-WATCHING-SCOPE-RULED-2026-08-09`). Carry-forwards for it: the full outcome vocabulary incl. `'terminated_by_timeout'` (now landed in the type); `rejected_by_guardrail` full transparency; the `dependency_unavailable`/null-cycle fallback-counter distinction (a genuine open question for the mentor, per the ruling's own instruction).
2. The generation-side runner code, last (structurally depends on both).
3. `fresh` activation (`SUBSTRATE_FRESH_ENABLED`) — founder-walked `code-critical`, at or after the first build gate; not pre-approved. Named follow-up: revisit the window bound after the first bounded validation run.

*End of close.*
