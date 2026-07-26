# Next-Session Prompt — Live-Verify the Corroboration Disclosure Correction, Then Elect (or Hold)

**Stream:** founder. **Tier:** `governance` — **Standard** (read-only verification of already-pushed, already-green content; no code, flag, schema, or perimeter change is in scope for this session). **Critical Change Protocol NOT engaged.**
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessor close:** `operations/handoffs/founder/2026-07-26-corroboration-disclosure-correction-CLOSE.md`.
**Predecessor decision-log entry:** `D-CORROBORATION-DISCLOSURE-CORRECTION-APPLIED`.
**Pushed commit:** `206e1a2` — "Disclose the input-length limit and widen the corroboration blind-spot claim" — founder-confirmed committed, pushed, Vercel green.

## Why this session exists

The predecessor session drafted, got explicit sign-off on, applied, and repo-verified (build + unit suite + the fragment probe) a documents-only correction to three public surfaces — but **repo-green is not the same claim as live-correct.** Nothing in the predecessor session curled production. This session closes that gap with a short, mechanical live check, then hands the founder the one open fork that was deliberately left unelected: whether to proceed to Step 2 (raise the cap) or Step 3 (a chunked path), or hold both at the 0h call, per `operations/benchmarks/sage-practice-v1/2026-07-26-input-cap-vs-corroboration-scope.md` §7.

**This session should be short.** If the live check passes, there is one founder decision to make and nothing else queued by default.

## Pre-conditions

1. `git log -1 --oneline` at session open reads `206e1a2` (or a later commit that includes it) on `origin/main`. If it does not, **STOP** — something moved since this prompt was written and the live-check targets below may be stale.
2. FRESH session — no investigation context carried; this file is self-contained.

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min)
2. `operations/handoffs/founder/2026-07-26-corroboration-disclosure-correction-CLOSE.md` (~5 min) — what changed, what didn't, why
3. `operations/benchmarks/sage-practice-v1/2026-07-26-input-cap-vs-corroboration-scope.md` §7 (the three-step design; only skim §1–6 if the live check surfaces something unexpected)

Confirm at open: tier (`governance`, Standard); hold-point status (P0 0h — still held); status vocabulary; signals + risk classification (none expected to change this session).

## Part B — Procedure

### Step 1 — Live-verify the three public surfaces

```bash
curl -s https://www.sagereasoning.com/llms.txt | grep -A2 "Field limits"
curl -s https://www.sagereasoning.com/llms.txt | grep "what the request actually sends"
curl -s https://www.sagereasoning.com/.well-known/agent-card.json | python3 -c "import json,sys; d=json.load(sys.stdin); print('extensions:', len(d.get('capabilities',{}).get('extensions', d.get('extensions', []))))"
curl -s https://www.sagereasoning.com/.well-known/agent-card.json | grep -o "field_limits" | head -1
curl -s https://www.sagereasoning.com/api-docs | grep -o "Field limits" | head -1
```

Expected: the first two `grep`s each return a match (the new "Field limits" paragraph and the reworded corroboration headline are live in `llms.txt`); the extension count reads **18** (unchanged — confirms the corroboration extension was amended in place, not duplicated, on the live file); `field_limits` is present in the live JSON; `Field limits` is present in the rendered `/api-docs` HTML.

If any of these fail to match, do not proceed to Step 2 — diagnose first (a stale CDN edge cache is the most likely innocent cause; a genuine mismatch between the repo and the live surface is not).

### Step 2 — One-line record

If Step 1 is clean, add a single line to the `D-CORROBORATION-DISCLOSURE-CORRECTION-APPLIED` decision-log entry (or a short follow-up entry, founder's preference) noting the live-verification and its date — this is the only gap between "repo-verified" and "verified" the predecessor session left open, and it should not be left silently assumed.

### Step 3 — The founder's election

Nothing is queued by default. Ask (do not assume) which of the following the founder wants, if any, this session:

- **Step 2 of the scope doc** — raise `input` to `TEXT_LIMITS.long` (15,000), paired with a Layer-1 `stop_reason === 'max_tokens'` truncation defence (not either half alone — see scope doc §3.2, §7). This is **Critical**, founder-walked, engages **PR19** (the independent adversarial review template at `operations/review-harness/independent-review-workflow-template.md` applies), and touches the R20a perimeter (precedent-covered per §3.1, not novel, but still a full 0c-ii).
- **Step 3 of the scope doc** — a first-class chunked examination path. Needs its own design session; gated on carrying cross-chunk corroboration state (without it, it reproduces the fragment probe's case D while looking like a fix — see §6(b)). Do not scope this casually; it is a real new surface.
- **Neither, for now** — hold both behind the 0h call, as the predecessor session left them. This is a legitimate outcome, not a stall.
- **Something else entirely** — the founder may simply want to move to other work; this prompt does not assume its own continuation is the priority.

If the founder elects Step 2, do not build it in this session unless they explicitly ask to continue past the election — scoping the AC5/PR19 walk properly (the R20a perimeter classification, the Layer-1 defence design, the both-directions verification battery named in scope-doc §7) is its own piece of work and deserves its own session opening, not a tail end of a verification session.

## Rollback path

None needed for this session's own work (read-only verification + at most one decision-log line). If Step 3's election is "proceed with Step 2," that session's own rollback path is `git revert` per usual — nothing here pre-commits to it.

## Forecast

Success = the founder knows, on evidence rather than assumption, that the corrected disclosure is actually what an agent reading `sagereasoning.com` sees today — and has made (or deliberately deferred) the one decision the predecessor session left open. Anything beyond that is a new session's scope, not this one's.

End of prompt.
