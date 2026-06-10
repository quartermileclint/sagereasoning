# Next-Session Prompt — Pre-Launch S8b: registry reconcile + R18 public-materials pass + elected rides → founder declares 0h exit

**Stream:** founder.
**Tier:** `registry` + `governance` + `code-standard` (the rides). Standard risk default; the archive moves are Elevated (0e archive class).
**Governing frame:** `/adopted/standing-protocol-cache.md` (now PR1–PR18; PR18 governs every production-state block this session touches).
**Predecessor session close (authoritative):** `/operations/handoffs/founder/2026-06-10-prelaunch-S8a-e2e-verification-close.md`.
**Predecessor decision-log entries:** `D-S8A-OPEN-DECISIONS-2026-06-10`, `D-PR18-ADOPTED-CLOSE-TIME-PRODUCTION-STATE-2026-06-10`, `D-PRELAUNCH-S8A-E2E-VERIFICATION-2026-06-10`.
**Risk classification:** Standard/Elevated under 0d-ii. Critical Change Protocol NOT engaged. PR6 NOT engaged (no perimeter work — the score-conversation wiring is its own future Critical session). PR4 N/A.

## Why this session matters
S8a met six of seven 0h exit criteria; the founder held the exit on a strict reading of criterion 1 — every component claimed Wired+ honestly accounted for. S8b completes that: the 191-component `component-registry.json` reconcile (39+ days stale; ≥14 components demonstrably Live) via the `sage-registry-update` skill, plus the R18 honest-certification pass over the public materials against the now-verified inventory. **At close, the founder declares the 0h exit** (or names what still blocks it). The lawyer engagement follows the same week — the Art-50 runway (2026-08-02) is ~7.5 weeks and shrinking.

## Pre-conditions
1. The S8a commit is pushed (close's Founder Verification block).
2. The Cowork project-instructions panel has been paste-synced from `/adopted/project-instructions-snapshot.md` (PR18 now in force).
3. The six S8a decisions are settled — do not re-open them.

## Part A — Open under the protocol
Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min)
2. The S8a close (authoritative state)
3. `/operations/capability-inventory-2026-06-10.md` (the verified truth the reconcile maps onto)
4. `/operations/decision-log.md` — last 3 entries

Confirm at open: tier; 0h status (**HELD — this session's close is the expected declaration point**); status vocabulary; PR18 in force (production-state blocks only at close, dated).

## Part B — Spine
### Step 1 — Registry reconcile (AI-heavy)
Via the `sage-registry-update` skill (`.claude/skills/sage-registry-update`, per §0g). Map every `component-registry.json` entry to production truth using: the capability inventory, the S1–S8a closes, and the decision log. Statuses in 0a vocabulary only. Where the registry claims Wired+ and no verification evidence exists, the entry is the finding — downgrade honestly and list it.
### Step 2 — R18 public-materials pass
`llms.txt`, `.well-known/agent-card.json`, `/api-docs`, marketplace/badge copy: every capability claim checked against the verified inventory; honest-certification language per R18a/R18b; nothing overclaimed (R19). Output: diffs for founder approval.
### Step 3 — Elected rides (from `D-S8A-OPEN-DECISIONS-2026-06-10`)
a. Founder-hub stale distress-check text — fix (Standard).
b. H1 renames: "Premeditatio Malorum" → **"Preparing for Adversity"**; "Oikeiosis Extension" → **"Expanding Your Circle of Concern"** — including nav/footer/welcome references (Standard; grep all occurrences; typecheck).
c. PROJECT_STATE.md + summary-tech-guide(+addendum) → `/archive/` with pointer stubs (Elevated, archive class: name the move, leave pointers, INDEX updated).
d. If time permits (founder elects): W1 brand-guidelines v2 draft and/or W2 home-page image swap from `/drafts/2026-06-10-brand-presentation-work-package.md` — otherwise they keep their own slot.
### Step 4 — Verify
Registry: spot-check N entries against decision-log citations (founder picks the N). Renames + hub fix: `npx tsc --noEmit` exit 0 + founder URL check after deploy. R18 pass: founder reads the diffs (business-document method).
### Step 5 — 0h declaration
Founder reviews criterion 1 with the reconcile done → declares the exit or names the blocker. Update the readiness statement's HELD line accordingly (it is the lawyer cover note — it ships this week).
### Step 6 — Decision log + close (lean form, per the cache)
Include the PR18-compliant dated production-state line. Queue next: lawyer engagement (wall-clock, this week), the A8 mapping session prompt (opens the migration + presentation arc), and the P1-input-rebuild prompt (review rec 3.2).

## What is NOT in this session
No perimeter change (score-conversation wiring is its own Critical session). No substrate migration work (A8 mapping comes first, its own session). No Stripe. No npm-vulnerability work.

## Rollback path
Docs/registry: `git revert`. Renames + hub fix: `git revert` (cosmetic code). Archive moves: move back (history preserved per 0e).

## Forecast
Most likely: the reconcile lands as a long but mechanical mapping with a handful of honest downgrades; the R18 pass produces small wording diffs; the rides clear in minutes each; the founder declares 0h; the lawyer email goes out the same week with the readiness statement attached; the A8 mapping session is queued. The runway then runs on wall-clock (counsel, ASIC, insurance) while the migration + presentation arc builds in parallel.

End of prompt. Opens on `main` (post-S8a commit). Trust the S8a close + decision log over any summary block (PR18).
