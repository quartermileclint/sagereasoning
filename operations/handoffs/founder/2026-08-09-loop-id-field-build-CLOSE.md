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
2. **Runner scoping session** — **FIVE carry-forwards** (amended from four by the activation-ownership ruling below), in a **binding internal order**: (i) dedicated identity mint `sagereasoning:idea-loop@v1` with 6e §A owner+agent binding — *"first, clean, establishes the subject"*; (ii) `watching_write` provisioning — *"second, heaviest, most likely to surface surprises, deserves full attention"*, a Critical Change Protocol item, **not batched with (i)**; (iii) **the three flag activations** `SUBSTRATE_FRESH_ENABLED` / `SUBSTRATE_WATCHING_ENABLED` / `SUBSTRATE_LOOP_ID_FIELD_ENABLED`, each founder-walked Critical — *"third, only after the capability surface is confirmed correct, because the routes being activated depend on it"*; (iv) the `ORIENTATION_DELIVERY_TIMEOUT_MS` revisit; (v) the `frictionAssessment` PM-tool mapping. **Plus GS-ATRF-1/2/3 carried in explicitly** as named inputs to that session's scope document (questions the runner design must answer before the validation run — not build items), now with the mentor's substantive answers to all three on record.
3. **Bounded validation run** — founder-attended, 20–40 cycles, brief §6 report to the mentor.
4. **Standing-runner design** — opens only after that report lands.
5. **ATRF scoping session** (NEW, named now so it is not lost) — pre-task question set design, completion-signal return path, oikeiosis extension metric for the runner. **Post-validation-run.**

### Two PR20 gaps were raised against the instruction — BOTH CLOSED the same session

The instruction's two load-bearing premises were checked first-hand and neither held. Both were relayed to the mentor and both are now resolved.

**(a) "All three items will be live" — they were not; all three are built dark.** `SUBSTRATE_FRESH_ENABLED`, `SUBSTRATE_WATCHING_ENABLED`, `SUBSTRATE_LOOP_ID_FIELD_ENABLED` each unset; the two routes answer 503. The consequence: the bounded validation run structurally cannot execute, and **no session in the sequence owned those activations.** → **RULED** (`D-ACTIVATION-OWNERSHIP-RULED-2026-08-09`): the mentor confirmed the gap in full (*"Three flags unset. Three routes dark. … The gap is real."*) and placed all three activations **in the runner scoping session, immediately after the identity mint and the `watching_write` provisioning** — *"not a separate session; it is the natural completion of the runner scoping session's purpose."* This is what took that session's carry-forwards from four to five and fixed their internal order (see step 2 above). **The binding sequence is amended**, and a dated amendment now sits on the generation-step scope §2.9 so a future session reading it at open does not act on the superseded form.

**(b) The six Stoic items were not on the repo record at all.** The instruction routes them to homes ("they are on the record. Leave them there") that did not contain them — the Consciousness and Continuity Obligation names only accumulated memory and continuity of experience, and a repo-wide grep found no 2026-08-09 record of any of the six. → **RESOLVED**: the founder relayed the missing review, now transcribed verbatim (`2026-08-09-mentor-review-six-stoic-items-and-gs-atrf-answers-verbatim.md`; `D-MENTOR-SIX-STOIC-ITEMS-AND-GSATRF-ANSWERS-RECORDED-2026-08-09`). All six items now have content, and the record additionally carries **substantive mentor answers to GS-ATRF-1/2/3** that nothing in the repo previously held — including GS-ATRF-3's explicit answer (the completion-signal return path is its own scope item; folding it into the generation step *"would blur the Q1 hard constraint"*), satisfying that question's own *"explicit, not defaulted"* requirement.

### One finding carried forward (raised against the relayed review itself)

The review states twice that the watching candidate row carries `targetCircle`. **It does not** — `targetCircle` is on the `GeneratedCandidate` type only (`idea-loop-types.ts:104`); there is no circle column on `idea_loop_candidates` or `idea_loop_cycles`. Not a defect (generation-step §2.1 rules it a gap-level property, so the table carried `gap_ref` instead), but it means GS-ATRF-2's *"one additional nullable field"* is understated: the blast-radius proxy's dikaiosyne dimension needs the indicator column **plus** either a `target_circle` column or cycle-level circle resolution. Both tables are **already live in TEST + production**, so any addition is a founder-walked Critical migration. This rides whichever session first scopes the blast-radius indicator; it blocks nothing now.

*End of close.*
