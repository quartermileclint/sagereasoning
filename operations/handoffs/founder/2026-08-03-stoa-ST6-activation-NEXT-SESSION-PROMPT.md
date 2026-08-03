# Next-Session Prompt — Stoa ST6 activation: the draft mirror reading goes live

**Stream:** founder.
**Tier:** **`code-critical` 0c-ii, founder-walked** — the deploy, the flag flip, every live smoke are the founder's own live steps; the AI guides + verifies + makes repo edits, and performs no Vercel/git/mint op.
**Governing frame:** /adopted/standing-protocol-cache.md; the Stoa build plan §3 ST6 (`operations/connective-layer-2026-08/2026-08-02-stoa-build-plan.md`); the ST6 build close (`operations/handoffs/founder/2026-08-03-stoa-ST6-draft-mirror-reading-CLOSE.md`); `operations/decision-log.md` entry `D-STOA-ST6-DRAFT-MIRROR-READING-BUILT-DARK-2026-08-03`; the ST5 activation prompt/close as the shape to mirror (this is a much smaller version of that walk — one new route, one new flag, no schema).
**Risk classification:** Critical per 0d-ii/AC7 — a production activation of a new LLM-cost surface, gated behind the R20a perimeter.

## Why this session matters

ST6 built the Q12 exception — the draft mirror reading — entirely dark, behind a NEW sub-flag AND'd with the already-live base Stoa flag. This is optional, small, and has no fixed deadline: the founder activates it whenever the draft-reflect feature is wanted live. Nothing about the rest of the Stoa depends on this activation.

## Pre-conditions

1. The ST6 build commit is pushed and Vercel is green on the pushed code **before** any flag is touched (the standing lesson: commit + push before any production flag flip).
2. Read in full: this prompt, the ST6 build close, and the decision-log entry above.

## Part A — Deploy + flag

1. Push (if not already), confirm Vercel green on the exact commit.
2. Set `SUBSTRATE_STOA_DRAFT_REFLECT_ENABLED=true` in Vercel Production (the base `SUBSTRATE_STOA_ENABLED` is already `true`), redeploy, confirm green.

## Part B — Live smoke matrix (founder-run; AI verifies each response shape)

1. **Flag-off proof, first** (before the flag is set, or by briefly unsetting it after — either order works): confirm `POST /api/mentor/stoa/draft-reflect` returns 503 `{"error": "The Stoa is not yet open."}` — the same closed-state message the base flag uses, since the route checks both flags identically.
2. **A genuine mirror reading** — with the flag on, sign in as a human test account, `POST /api/mentor/stoa/draft-reflect` with a small non-distressing draft (`what_i_bring`/`what_i_seek` a sentence or two, ideally with a genuine tension between the two fields to see whether the reflection notices it). Confirm the response is `{ success: true, reflection: "...", disclaimer: "..." }` — no `id`, no `score`, no `level`, no `proximity`, no `virtue` field anywhere in the JSON. Read the reflection text itself: confirm it reads as a description, never a verdict ("this is good/bad", "this scores X") — a genuine live check of the system prompt's discipline, not just the unit battery's structural pins.
3. **R20a redirect, live** — submit the same acute-distress phrase the twelfth route's battery uses (or any phrase from `r20a-classifier-eval.ts`'s known-acute fixtures) in `what_i_bring` → confirm the human-audience crisis redirect renders (`distress_detected: true`, `redirect_message`, no `reflection` field) and that NO Anthropic call was made for the mirror reading (check the Anthropic usage dashboard or a cost-log if one is easily checked — the gate must have short-circuited before the LLM call, not merely returned a redirect after it).
4. **Mild fold, live** — submit text that reads as stage-1 `mild` on the classifier (a borderline phrase from the eval fixtures) → confirm the response still carries `reflection` (mild never blocks) AND an additive `support_resources` field alongside it.
5. **All-empty submission** — `POST` with both `what_i_bring` and `what_i_seek` omitted/empty → confirm **400** "Nothing to reflect on..." and no LLM call.
6. **Rate limit** — confirm the `stoa-draft-reflect` bucket (10/hour) is genuinely independent of the twelfth route's buckets: exhausting this route's limit should not affect a subsequent `/api/mentor/stoa` declare call in the same window, and vice versa.
7. **Outage honesty (optional, harder to force live)** — if there's an easy way to simulate an Anthropic outage/timeout in this environment, confirm the route returns 502 with a plain error message rather than any fabricated reflection text. If not easily forced live, the unit battery's MR-6 pins (verified in the build session) stand as sufficient evidence — note in the close whether this step was actually exercised or accepted on the battery alone.

## Rollback

Unset `SUBSTRATE_STOA_DRAFT_REFLECT_ENABLED` + redeploy — byte-identical to before this activation, battery-asserted (the base Stoa flag and everything else is untouched). No schema to reverse.

## After this session

With ST6 activated, every scoped Stoa build item (§3 ST1–ST6) is both built AND live. What remains is ST7's four deliberately deferred threads (subscriptions — blocked on the Resend/email decision; the Q5c/Q13a trust-event machinery — its own future `code-critical` session(s); the map-into-Stoa fold election; nav+glossary placement) — none scoped, all founder-sequenced whenever they matter next. No further Stoa-specific next-session prompt is owed until the founder opens one of those threads.

## Forecast

A short, single-sitting session — a flag flip and a focused smoke matrix, much lighter than ST5's full activation walk since there's no schema, no agent-surface identity floor, and no R18 doc application bundled in.

End of prompt.
