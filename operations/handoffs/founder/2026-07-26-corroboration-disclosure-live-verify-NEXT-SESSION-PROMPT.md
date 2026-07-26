# Next-Session Prompt — Open Bridge: Nothing Queued on the Corroboration Thread

**Stream:** founder.
**Tier:** unset at open — this prompt does not presume a task. Declare tier once the founder names what to work on.
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache; deliverable-of-the-day named below once chosen).
**Predecessor session close:** `operations/handoffs/founder/2026-07-26-corroboration-disclosure-live-verify-CLOSE.md`.
**Predecessor decision-log entries:** `D-CORROBORATION-DISCLOSURE-LIVE-VERIFIED`.
**Pushed commit:** `6bca254` — "Live-verify the corroboration disclosure correction; hold Steps 2/3" — founder-confirmed committed, pushed, Vercel green.

## Why this prompt looks the way it does

The predecessor session closed a specific thread (verify the corroboration-disclosure correction was genuinely live, then elect on Steps 2/3) and the founder's election was **hold both** — a deliberate, legitimate stopping point per the scope doc's own recommendation, not a stall and not an oversight. There is no mandated next task on that thread. Writing a prompt that manufactures one would violate the standing failure-mode guard against prescribing before grounding purpose (`standing-protocol-cache.md` §"AI failure modes to watch for"). So this prompt does the honest thing instead: confirms the state the founder is resuming into, and surfaces — without picking for the founder — the standing backlog of items that are genuinely queued elsewhere in the project, so the founder can choose.

## Pre-conditions

1. `git log -1 --oneline` at session open reads `6bca254` (or a later commit that includes it) on `origin/main`. If it does not, treat this prompt's "current state" section as stale and re-derive it from `git log` + the most recent decision-log entries before proceeding.
2. FRESH session — this file is self-contained; do not assume prior-conversation context.

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min)
2. `operations/handoffs/founder/2026-07-26-corroboration-disclosure-live-verify-CLOSE.md` (~5 min) — the immediately preceding close
3. The last 3 entries of `/operations/decision-log.md` (already recent as of this writing: `D-AGENT-ORG-P2-RERUN-VERDICT-2026-07-26`, `D-REASON-INPUT-CAP-VS-CORROBORATION-SCOPED`, `D-CORROBORATION-DISCLOSURE-CORRECTION-APPLIED`, `D-CORROBORATION-DISCLOSURE-LIVE-VERIFIED`)
4. `/CLAUDE.md`'s "Agent-Organization + Evidence Program — status" section, specifically the "Awaiting commencement" list — this is the actual standing backlog, not this prompt

Confirm at open: hold-point status (P0 0h — still held, still the founder's call); status vocabulary; signals + risk classification will depend entirely on what the founder elects below.

## Part B — Ask before acting

**Do not pick a task.** Ask the founder what they want to work on. The genuinely open items, as of this writing, are (not exhaustive — the founder may want something not on this list):

**On the thread this prompt descends from (all held, none urgent):**
- Step 2 of `operations/benchmarks/sage-practice-v1/2026-07-26-input-cap-vs-corroboration-scope.md` §7 — raise `input` to `TEXT_LIMITS.long` paired with a Layer-1 `stop_reason === 'max_tokens'` defence. Critical, founder-walked, engages PR19 (independent adversarial review).
- Step 3 of the same doc — a first-class chunked examination path, gated on cross-chunk corroboration state. Needs its own design session.
- Named-but-not-investigated tail questions from the same arc: whether `context`/`domain_context` are independently mis-tiered from `input`; whether other `medium`-limit call sites hold document-class fields; whether `truncateForServer` should refuse rather than truncate a document-class input.

**Carried from earlier sessions, unrelated to this thread (see the predecessor-of-predecessor close for detail):**
- The S3 safeguard trigger (from the P2 rerun forensic).
- The `high` ↔ `reasoning_effort: 40` in-band tag mapping (unverified — named at the P2 rerun close).
- CRED-1 — the ae2-smoke credential revocation check.
- The four AUTH post-deploy smokes.

**Standing program backlog (per `/CLAUDE.md`'s "Awaiting commencement" list — larger, not yet scoped for a specific session):**
- Item 0b — the PR19 retroactive independent reviews of the two 07-18 surfaces.
- Item 0c — the consult-lookup resilience + composed-consult latency follow-up.
- Item 1 — walking the founder through actually provisioning Resend (account/domain/API key — founder-performed).
- Item 2 — the six-phase brand-and-navigation build (colour centralization, passion images, Five Stages pages, image glossary, nav additions). Large; explicitly structured to allow stopping at any phase.
- The still-open 0h launch call itself — the founder's, gating everything above P0.

If the founder names something not on this list, that is expected and correct — this list is a memory aid, not a menu limited to these options.

## Part C — Once a task is named

Declare tier per `standing-protocol-cache.md`'s work-categories table. Read the specific deliverable/prompt/ADR that governs the chosen item in full before acting — this bridging prompt does not substitute for that read. If the chosen item already has its own next-session prompt (several of the backlog items above do — check `operations/handoffs/founder/` for a matching filename before drafting a fresh plan), use that prompt instead of re-deriving scope here.

## Rollback path

None — this session has not yet done anything beyond opening. Whatever is chosen in Part B carries its own rollback path, stated in that item's own governing document.

## Forecast

Success for *this* prompt is narrow: the founder is oriented, knows nothing was silently assumed on the corroboration thread, and has picked (or explicitly deferred picking) what comes next. The actual work of the session begins only after that choice is made.

End of prompt.
