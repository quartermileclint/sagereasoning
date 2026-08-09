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

**This closes the founder-approved three-item build-gate sequence** (fresh → watching → generation-side, all three done). Per the ruled Q11 sequence's amendment (generation-step scope §2.9): **the runner scoping session** is next — credential + dedicated K1 identity mint, `watching_write` provisioning (per the `watching` build's carry-forward), the `ORIENTATION_DELIVERY_TIMEOUT_MS` revisit trigger, and the `frictionAssessment` PM-tool mapping decision. Its own prompt, not yet authored. Only after that: the bounded validation run, then any standing-runner design.

Three flag activations remain carried, none pre-approved: `SUBSTRATE_FRESH_ENABLED`, `SUBSTRATE_WATCHING_ENABLED`, `SUBSTRATE_LOOP_ID_FIELD_ENABLED`.

*End of close.*
