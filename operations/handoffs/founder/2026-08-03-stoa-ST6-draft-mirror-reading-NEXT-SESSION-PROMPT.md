# Next-Session Prompt — Stoa ST6: the optional draft mirror reading (Q12's one exception)

**Stream:** founder.
**Tier:** `code-elevated` (no schema change expected — see the persistence election below; escalates to `schema` only if the founder elects to persist anything, which the plan recommends against). No flag flip required to reach production — see the activation note below.
**Governing frame:** /adopted/standing-protocol-cache.md; the Stoa build plan §3 ST6 (`operations/connective-layer-2026-08/2026-08-02-stoa-build-plan.md`); Q12 verbatim in `operations/connective-layer-2026-08/2026-08-02-mentor-consultation-connective-layer-verbatim.md`; the ST5 activation close (`operations/handoffs/founder/2026-08-03-stoa-ST5-activation-CLOSE.md`, if written — otherwise this prompt + the ST5 activation prompt stand as the record of what's live).
**Risk classification:** Elevated per 0d-ii (a new LLM-reading surface reusing the existing engine on user-owned draft text; no new production flag, no schema by default, no change to any existing route).

## What's live now (context for this session)

The Stoa is fully live in production as of ST5 (2026-08-03): `SUBSTRATE_STOA_ENABLED=true`, both the human surface (`/stoa`, `/api/mentor/stoa`) and the agent surface (`/api/stoa/declare`, the credential-presence arm on `/api/stoa/entries`) are active, and the R18 public contract (llms.txt, agent-card.json extension #21 `stoa-connective-layer/v1`, the api-docs bullet) is published. Every ST5 smoke passed; three throwaway credentials were minted and revoked for verification; no test entries remain visible. Two items are carried forward as disclosed, non-blocking limitations (not this session's concern unless the founder wants to close them here — see "Optionally, while you're in this code" below):

- **The row-level reactivation guard** — the withdraw→re-declare recency-cycling lever is currently only *blunted* by the 6/hour IP-keyed rate limit, not structurally closed. Named at ST2/ST3 as "potentially a mentor question."
- **The q-filter pagination bound** — `/api/stoa/entries`' free-text search filters post-pagination, so a search can miss matches beyond the first page. Disclosed as correct-at-current-scale (≤200 entries fits one page); a store-level search is the fix once the colonnade outgrows one page.

## Why this session matters

Q12 is the one deliberate exception to "the connective layer stays entirely plain": at the declarer's own request, before publishing, the platform's examination instrument may read a **draft** declaration and reflect it back — never a verdict, never a grade, on the **mirror register only** (the same register the reasoning receipt and Sage Reflect already use elsewhere on the platform). Everything else about the Stoa — no engine reading of *published* entries, no examination triggered by browsing or contact, no practice integration of any kind — stays confirmed and unchanged. This session builds that one exception, faithfully narrow.

The mentor's own words on scope (Q12, verbatim): *"The declarer asks: does this declaration honestly represent what I am offering and seeking? The platform's examination instrument reads the draft and reflects it back. The declarer decides whether to publish, revise, or withdraw. This is the mirror principle operating correctly... It is not the platform inserting its judgement into the practitioner's presence. It is the platform offering the practitioner a tool for self-examination that they may use or not use."*

## Design questions to settle at session open (AskUserQuestion, before any code)

1. **Persistence posture.** The build plan recommends **none** — the reading exists only in the response to the declarer's request, never written to any table, never contributing to any trust/practice record. Confirm this with the founder explicitly; it's the single most consequential decision in this build (a persisted draft-reading record would be a new practice-adjacent data surface, escalating this to `schema` + `code-critical`, and would need its own data-rights wiring). Recommend: **no persistence** — read the draft, reflect, discard.
2. **Model / assessment class.** Per the AC1 model-selection table: **Sonnet, standard assessment class** (not the deep/critical tier — this is a self-examination mirror on short user text, not a consequential decision). Confirm the model constant against the CURRENT AC1 table at build time (it may have moved since this prompt was written).
3. **Trigger scope.** Confirm: **request-only**, fired by an explicit, distinct user action on the `/stoa` draft form (never on every keystroke, never on every save, never bundled into the declare/edit submission itself — Q12 is clear this must be something the declarer *brings to the platform*, not something the platform inserts). A separate button/action (e.g. "Reflect on this draft before I publish") rather than any implicit hook.
4. **Response register.** Mirror-only — description, never verdict or grade. This is the same register `EVALUATIVE_DISCLAIMER`/the reasoning-receipt pattern already establishes elsewhere (`reasoning-receipt.ts`, read-only-imported from `stoa-copy.ts`'s sibling modules per the `/logos` precedent — reuse, don't re-derive). No score, no proximity rank, no virtue-domain classification surfaces in the response — those are engine-internal machinery for OTHER surfaces and must not leak into this one even as a side-channel (a genuine risk if the underlying call reuses `/api/reason`'s full pipeline rather than a narrower reflection-only prompt).

## What to build

1. **A new, narrowly-scoped endpoint** (or an extension of the existing `/api/mentor/stoa` route — the founder/session should decide which is cleaner; a separate route is likely safer for boundary-testing purposes, matching the pattern of every other Stoa surface being its own file). Suggested shape: `POST /api/mentor/stoa/draft-reflect` — takes the same three text fields (`what_i_bring`/`what_i_seek`/`contact_channel`) the declare/edit routes accept, human-JWT-authenticated (this is a **human-only** feature per Q12's "the declarer" framing — confirm at open whether the agent surface gets an equivalent or whether Q12 is read as human-only; the plan text doesn't explicitly extend it to agents, and the safer reading is human-only unless the founder elects otherwise).
2. **R20a consideration.** This route accepts human free text (the same fields the human declare route already gates). Decide explicitly at open: does this route need its own R20a distress check (mirroring `/api/mentor/stoa`'s existing gate), or can it safely reuse/extend the same composed-subject check? Given the text is the SAME content a subsequent `/api/mentor/stoa` POST/PATCH would carry, the conservative and almost certainly correct answer is: **yes, this route needs the identical R20a gate**, run BEFORE any LLM call (never send acute-distress text to a reflection prompt; redirect first, exactly as the declare route does). This makes the route's R20a element **Critical** per 0d-ii even though the rest of the build is Elevated — flag the AC5 recorded-decision requirement and treat that one element with the same rigor ST3's declaration-submission route received.
3. **The LLM call itself** — reuse existing mirror-register machinery where possible (the `reasoning-receipt.ts` pattern, `EVALUATIVE_DISCLAIMER`) rather than inventing a new prompt template from scratch. The response must contain no persisted-record shape (no `id`, no `declared_at` — this is not an entry, it never becomes a row).
4. **No new flag needed for internal activation** if the founder is comfortable — this route can go live simply by being pushed, IF and only if it inherits `SUBSTRATE_STOA_ENABLED`'s dark posture correctly (it should 503 exactly like every other Stoa route when the flag is unset, even though the flag is currently `true` in production — confirm the flag-off byte-identity property holds for this NEW route too, the house pattern, before deciding whether it needs its own sub-flag or can simply ride the existing one). Given the flag is already live, pushing this route effectively activates it immediately in production on merge — decide at open whether that's acceptable for this feature or whether a dedicated `SUBSTRATE_STOA_DRAFT_REFLECT_ENABLED` sub-flag is warranted for a more controlled rollout (the plan doesn't mandate one; a sub-flag is the more conservative choice given this is a new LLM-cost surface).

## Verification mandates (per the build plan §4, still binding)

1. **Boundary battery** — this route must not write to `stoa_entries` or any other Stoa/trust/practice table (mutation-verify the pin — a pin that can't go red isn't a pin).
2. **No-persistence pin** (if persistence is confirmed as "none" at open) — assert no DB write call exists anywhere in the route's code path.
3. **R20a invocation test** on the new route, following the `r20a-invocation` house pattern, with its own AC5-recorded-decision comment block matching ST3's style.
4. **Flag-off byte-identity** for the new route (or its sub-flag, if elected).
5. **Mirror-register pin** — assert the response contains no score/proximity/virtue-domain field (a battery that would catch an accidental full-engine-response leak).
6. **PR19 independent adversarial review** — per the standing house discipline at every Stoa build.
7. `tsc` + `npm run build` green.

## Optionally, while you're in this code

Not required, but worth raising with the founder as a bundling option since ST6 is a small session: the two ST5-carried disclosed limitations (row-level reactivation guard, q-filter pagination bound) could be closed in the same sitting if the founder wants — but they're independent of ST6's scope and shouldn't be silently folded in without an explicit "yes, also do these" from the founder at session open. Default to NOT touching them unless asked.

## Rollback

If a sub-flag is used: unset it + redeploy (byte-identical, battery-asserted). If the route rides the existing `SUBSTRATE_STOA_ENABLED` flag directly: `git revert` the route addition (removes the new endpoint; nothing else in the Stoa is touched, since this is purely additive).

## What's deliberately NOT in scope for this session (ST7, still deferred, still not scoped)

- **Subscriptions (#6)** — blocked on the email decision (Resend, still unprovisioned per the standing CLAUDE.md record). Do not attempt to build this until that decision is made.
- **Q5c/Q13a trust-event machinery** — new trust-event classes for false-capability-in-examined-use and calling/declaration divergence need their own `code-critical` session(s), sensibly sequenced after real examined use exists that could contradict a declaration. Until built, removal/observation decisions on these grounds are operated founder-manually against examined artifacts.
- **The map-into-Stoa fold election** (from ST1) — a standing open design question, not scoped here.
- **Nav + glossary placement** — small, could ride any future Stoa-adjacent session, but not this one unless the founder asks.

## Forecast

A modest, well-bounded session — likely a single sitting. Success: the one Q12 exception exists, request-only, mirror-register, no persistence (or persistence explicitly and deliberately elected otherwise with its own schema step), R20a-gated with the same rigor as every other human-text Stoa surface, and independently PR19-reviewed. After this, ST6 is the last *scoped* Stoa build item — everything remaining (ST7's four threads, S11, 0h) is the founder's to sequence, at whatever pace suits the standing queue.

End of prompt.
