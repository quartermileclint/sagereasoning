# Session close — generation-side `loop_id` field built (2026-08-09)

**Stream:** founder. **Tier:** `code-elevated`. **Decision:** `D-LOOP-ID-FIELD-BUILT-DARK-REVIEW-FOLDED-2026-08-09`.
**Prompt executed:** `operations/handoffs/founder/2026-08-09-generation-side-loopid-BUILD-NEXT-SESSION-PROMPT.md`.

## What happened

The third and last item of the founder-approved build order executed: the additive, optional `loop_id` request field on the live `/api/reason` route, exactly to QG-C's ruled shape (`operations/agent-circles-2026-08/2026-08-09-generation-step-scope.md` §2.7 + §2.11 dimension 6; verbatim record wins).

Built dark behind the NEW `SUBSTRATE_LOOP_ID_FIELD_ENABLED` (unset everywhere ⇒ byte-identical, battery-asserted): the B5 `session_marker` shape mirrored exactly — optional, validated flag-on, malformed → 400 non-billable, ignored flag-off. The validated value is stamped verbatim as its own typed `loopId?: string` field on the orientation-reading trust-event payload, riding the same event as the event's own server-computed correlation identity as a **separate field, never concatenated, both independently visible** — the ruled composition. Genuine passthrough: never branched on, never validated for shape, never enters the signed assessment. No schema migration (the payload column is JSONB, confirmed first-hand before building).

**One PR20 finding at open:** the build prompt directed mirroring "the existing B5 `session_marker` test file… almost line-for-line" — no such file exists anywhere in the repo. Built the actual house pattern (pure module + exhaustive battery + source-grep INV pins) instead, independently confirmed by the review as strictly more coverage than the unfollowable precedent.

## Verified

- `loop-id-field` battery **55/0** (new) · `tsc` 0 · `npm run build` ✓ (`ƒ /api/reason` still registered).
- Regressions clean: `orientation-trust-events` 57/0 · `agent-assessment-history-store` 120/0 · `practice-suggestion` 791/0 · `session-decline-signal` 22/0 · `fresh-handler` 61/0 · `idea-loop-types` 20/0.
- **Two load-bearing claims proven by live mutation, not asserted**: deleting the deriver's payload-stamp line fails 4 assertions; flipping the route's gate to field-first fails the byte-identity pin. Both restored and re-verified green.
- **PR19 independent adversarial review: GO_WITH_FIX, one nit folded.** Ran fully on first launch (3 dimensions, 4 agents, 0 errors, ~1.05M tokens — no spend-limit outage this session). One CONFIRMED low finding: the code's "NEVER READ" wording was imprecise (a JS destructuring assignment reads the property regardless of the flag; only inspection/validation is flag-gated — the same shape every sibling flag-gated field in that block uses). **Folded at the root** in `loop-id-field.ts`, `route.ts`, and the battery's own comments/labels; re-verified 55/0 + tsc 0 + build ✓ after the fold. Zero medium/high/critical; zero refuted.

## Session honesty notes

Every hook consult either timed out at 28s (the known transient class — session opened unframed, disclosed) or, once the frame began firing, correctly flagged benign build/verification actions as `contrary`/no-kathekon-factors (the known false-positive class) — each CAUTION was answered genuinely via the structured elicitation rather than discounted by reflex. The Sage Reflect close-turn review was taken.

## Production state at session close

**`SUBSTRATE_LOOP_ID_FIELD_ENABLED` was never set** — the field validates flag-on only, and the flag is unset everywhere in this diff. Production will be byte-equivalent on push.

## Rollback

`git revert` the build commit — flag-gated and never set, so nothing live-facing changes regardless of revert timing. No schema migration accompanies this build.

## Next

**This closes the founder-approved three-item build-gate sequence** (fresh → watching → generation-side, all three done).

Mid-session, after the build was committed but before push, the founder relayed a **mentor prioritised instruction set** confirming the sequence from here (verbatim: `operations/agent-circles-2026-08/2026-08-09-mentor-instruction-prioritised-sequence-verbatim.md`; adopted under `D-MENTOR-PRIORITISED-SEQUENCE-ADOPTED-2026-08-09`). The binding five-step order:

1. **Complete this session** — done.
2. **Runner scoping session** — four carry-forwards, explicitly *all of equal standing, none a rider on another*: the dedicated identity mint (`sagereasoning:idea-loop@v1`, 6e §A owner+agent binding); `watching_write` provisioning; the `ORIENTATION_DELIVERY_TIMEOUT_MS` revisit; the `frictionAssessment` PM-tool mapping. **Plus GS-ATRF-1/2/3 carried in explicitly** as named inputs to that session's scope document (questions the runner design must answer before the validation run — not build items). Two binding sequencing instructions: `watching_write` provisioning is *"a Critical Change Protocol item — do not treat it as a quick configuration step"*, and *"open with the identity mint… then move to the capability provisioning with full attention. **Do not batch the two.**"*
3. **Bounded validation run** — founder-attended, 20–40 cycles, brief §6 report to the mentor.
4. **Standing-runner design** — opens only after that report lands.
5. **ATRF scoping session** (NEW, named now so it is not lost) — pre-task question set design, completion-signal return path, oikeiosis extension metric for the runner. **Post-validation-run.**

### Two gaps flagged for the mentor (PR20 — the instruction's premises, checked and found not to hold)

**(a) The three items are NOT live — all are built dark.** `SUBSTRATE_FRESH_ENABLED`, `SUBSTRATE_WATCHING_ENABLED`, `SUBSTRATE_LOOP_ID_FIELD_ENABLED` are each unset; the two routes answer 503. Each activation is its own founder-walked `code-critical` step, none taken or pre-approved. **The bounded validation run cannot execute while `fresh`/`watching` return 503, and no session in the confirmed sequence owns those activations** — the same shape of gap that §2.9 surfaced for the runner scoping session itself, so its placement is the mentor's to confirm.

**(b) The six Stoic items are not on the repo record.** The instruction routes two of them ("hegemonikon stability", "kathêkon/katorthoma at agent level") to the Consciousness and Continuity Obligation with *"they are on the record. Leave them there"* — but that section names only accumulated memory and continuity of experience, and a repo-wide grep finds no 2026-08-09 record of any of the six. "The previous review" appears never to have been transcribed. Recommended: the founder relays its text so the items have a "there" to be left in.

Neither gap blocks the runner scoping session's four carry-forwards, which are fully specified and can proceed independently.

*End of close.*
