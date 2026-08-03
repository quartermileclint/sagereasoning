# Next-Session Prompt — Stoa ST7: pick a deferred thread

**Stream:** founder.
**Governing frame:** /adopted/standing-protocol-cache.md; the Stoa build plan §3 ST7 (`operations/connective-layer-2026-08/2026-08-02-stoa-build-plan.md`); the ST6 activation close (`operations/handoffs/founder/2026-08-03-stoa-ST6-activation-CLOSE.md`); `operations/decision-log.md` entries `D-STOA-ST6-DRAFT-MIRROR-READING-BUILT-DARK-2026-08-03` and `D-STOA-ST6-DRAFT-MIRROR-READING-ACTIVATION-LIVE-2026-08-03`.
**Tier:** unscoped — depends entirely on which thread is opened. Each is sketched below with its own likely tier so the opening session can classify itself correctly at open.

## Why this document exists

Every **scoped** Stoa build item is now built and live (ST1 through ST6, plan §3). ST7 is not one task — it's four genuinely separate, deliberately deferred threads, none blocking the others, none currently scheduled. This prompt exists so a future session (or the founder directly) can pick ONE without having to re-derive what's outstanding from the plan document or the decision log. Do not treat this as an instruction to do all four, or to do any of them now — read the founder's actual request first and match it to the relevant section below, or ask which thread if the founder just says "continue the Stoa work."

## The four threads

### 1. Subscriptions — blocked on the email/Resend decision
The Stoa's subscription/notification surface (who gets notified when a new declaration matches their interests, or similar — check the plan §3 ST7 subsection for the exact spec) needs outbound email, which needs the Resend provisioning decision this repo has carried as an open founder-performed step for some time (see the CLAUDE.md "Awaiting commencement" list, item 1 — `operations/handoffs/founder/2026-07-22-resend-email-provisioning-NEXT-SESSION-PROMPT.md`). **Do not open this thread until Resend is actually provisioned** — check `website/public/llms.txt`/the manual for whether the #15 decision status line still reads "decided, pending" or has been corrected to "live" per that prompt's own closing instruction. If it's still pending, this thread is not yet actionable; tell the founder and point back to the Resend prompt instead.

### 2. Q5c/Q13a trust-event machinery
The mentor consultation verbatim (`operations/connective-layer-2026-08/2026-08-02-mentor-consultation-connective-layer-verbatim.md`) answers Q5c and Q13a describe trust-event wiring for the Stoa surfaces that was deliberately NOT built during ST1–ST6 (out of scope for the initial build; the founder elected to ship the connective-layer surfaces first and defer the trust-layer coupling). Before opening this thread: re-read Q5c and Q13a verbatim (don't rely on a paraphrase — the mentor's exact wording governs), and cross-check against the CURRENT state of the Trust Layer arc in CLAUDE.md's "Live in production" list (S1–S11b and beyond may have moved since this prompt was written — re-derive the live trust-core surface state fresh, don't assume it matches whatever was live on 2026-08-03). This is very likely its own `code-critical` session (new trust-event types touch the S1 append-only ledger schema) — possibly more than one sitting, given the arc's history of adversarial-review-driven multi-session builds.

### 3. The map-into-Stoa fold election
There's a standing, unresolved election about whether/how the existing community map feature (`community_map_pins` — note the pre-existing `42703` schema gap on `community_map_pins.show_on_map` named elsewhere in CLAUDE.md as a still-open follow-up) folds into or alongside the Stoa's declaration directory. This has not been scoped even at the design level — opening this thread starts with a design conversation with the founder (likely `governance` or `code-elevated` to start), not a build.

### 4. Nav + glossary placement
The Stoa's various surfaces (`/stoa` human declare, the agent surface, the draft-reflect exception) do not yet have settled navigation/glossary placement — check the current `NavBar.tsx` + footer state and the `/glossary` page (both touched most recently in the 2026-07-26 brand-and-navigation-amendments build per CLAUDE.md) to see whether Stoa links exist anywhere reachable, and if not, whether that's an intentional omission (a "for-invite-only" surface, say) or a genuine orphaned-route gap matching the pattern the 2026-07-24 navigation audit found for other tools. This is the lightest of the four threads — likely `code-elevated` or even `code-standard`, a nav/copy change with no schema or perimeter implications, similar in weight to the earlier nav-gap fixes.

## What NOT to do

- Don't open more than one thread per session without the founder explicitly asking for that.
- Don't assume thread priority — none is marked urgent, and the founder may have opinions that don't match the order they're listed in here.
- Don't re-scope any of the four beyond what's written above without a fresh AskUserQuestion-style check-in with the founder — this document is a pointer, not a plan.

## Forecast

Depends entirely on which thread is chosen. Thread 4 (nav/glossary) is a short single-sitting session. Thread 1 (subscriptions) can't start until Resend is provisioned — check that first. Threads 2 and 3 both start with clarification/design work before any code, and thread 2 in particular could span multiple sessions given the Trust Layer arc's track record.

End of prompt.
