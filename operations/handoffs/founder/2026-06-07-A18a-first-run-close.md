# Session Close — 2026-06-07 — A18a: first-run / onboarding (the /welcome page)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds → Critical Change Protocol step 3 = N/A; all other steps in force).
**Tier:** Mixed — new page + nav/footer links **Standard** (`code-standard`); the baseline result-CTA redirect **Elevated** (additive intent; PR6 not engaged).
**Date:** 2026-06-07. **Branch:** `main`.
**Operative prompt:** `/operations/handoffs/founder/2026-06-07-post-A18b-A18d-NEXT-SESSION-PROMPT.md` (you elected **A18a**; shape = **dedicated `/welcome` + revisit links**; audience = **human practitioners only**).
**Predecessor close:** `/operations/handoffs/founder/2026-06-07-A18b-A18d-close.md`.

## What this session did

Filled the post-signup orientation gap. Grounding showed a new person goes baseline → near-empty dashboard with a single "evaluate your first action" prompt and no orientation; the rest of the practice is buried in the menu.

1. **New `/welcome` ("Getting Started") page.** Static page in the existing site style: a "mirror, not a verdict" purpose framing; four first-step cards (baseline, score an action, journal, private mentor); a plain-language "how to read your results" (qualitative levels; passions are diagnostic, not punitive); a "more to explore" list; an honest-expectations note (AI-generated, not a crisis service, links to limitations/privacy/transparency/accessibility); and a closing CTA.
2. **Shown once after the baseline.** The baseline result button now reads **"Continue"** and lands on `/welcome` (was straight to the dashboard); `/welcome`'s own buttons go on to score-an-action or the dashboard.
3. **Revisit links.** "Getting Started" added to the signed-in **account menu** and to the **footer** (Philosophy column), so anyone can return to it.

All three edited files were backed up to `archive/` before editing. **Nothing has deployed; production is byte-identical.** `/api/reason` untouched.

## Decisions Made
- `D-A18A-FIRST-RUN-WELCOME-2026-06-07` (Mixed: Standard page/links + Elevated baseline-CTA) — appended to the decision log.

## Status Changes
| Item | Old | New |
|---|---|---|
| A18a — `/welcome` first-run page | Scoped | **Wired** (built + full typecheck exit 0) → Verified on your URL check |
| `website/src/app/baseline/page.tsx` result CTA | → `/dashboard` | → `/welcome` ("Continue") |
| `website/src/components/NavBar.tsx` account menu | — | "Getting Started" link added |
| `website/src/app/layout.tsx` footer | — | "Getting Started" link added (Philosophy column) |

## Verification Method Used (0c framework)
- **AI-side (Diagnostic-certain, compile level):** full project `node_modules/.bin/tsc --noEmit` → **exit 0, 0 errors**. New page `<div>` open/close balanced (11/11). All 13 routes linked from `/welcome` confirmed to exist as real route directories. `tsx` not used (documented sandbox esbuild mismatch); `tsc` is pure JS and ran cleanly.
- **Founder-side (website-page row, 0c):** open the URLs below.

## Risk Classification Record (0d-ii)
- `/welcome` page + footer link + nav-dropdown link — **Standard** (additive).
- `baseline/page.tsx` result-CTA target swap — **Elevated** (change to existing user-facing navigation; additive intent). AC7 not engaged; PR6 not engaged.

## Blocked On
**Files uncommitted (commit command below):**
- `website/src/app/welcome/page.tsx` (new)
- `website/src/app/baseline/page.tsx`
- `website/src/components/NavBar.tsx`
- `website/src/app/layout.tsx`
- `archive/baseline-page.tsx.backup-pre-A18a-2026-06-07`
- `archive/layout.tsx.backup-pre-A18a-2026-06-07`
- `archive/NavBar.tsx.backup-pre-A18a-2026-06-07`
- `operations/decision-log.md`
- `operations/handoffs/founder/2026-06-07-A18a-first-run-close.md` (this close)

Pre-existing untracked next-session-prompt files in `/operations/handoffs/founder/` are your call whether to include. Build artifact `website/tsconfig.tsbuildinfo` may show as modified — safe to leave or discard.

**Production state at session close:** **UNCHANGED from pre-session.** Nothing deployed; `/api/reason` byte-identical; A13 cost-health Live; all four R20a flags `true`; OTel / injection-defence / Layer3 / plugin-install-auth / abuse-detection flags UNSET. The two pending production migrations (`compliance_access_log`, `compliance_rectification_log`) remain pending (untouched this session).

## Founder Verification (Between Sessions)
No TEST database or Terminal needed — just run the site and look. I can walk any step live (PR17).

1. Start the site: `cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && npm run dev` → open **http://localhost:3000**.
2. **/welcome** — confirm it renders: the four first-step cards, "How to read your results," "What to expect — honestly," and the closing buttons.
3. **Footer** (any page) — confirm **Getting Started** appears under Philosophy and opens `/welcome`.
4. **Account menu** (signed in, top-right) — confirm **Getting Started** appears and opens `/welcome`.
5. *Optional, the hand-off:* complete (or open) the baseline; confirm its **Continue** button lands on `/welcome`, and `/welcome`'s buttons go on to score-an-action / the dashboard.

### Then commit + push
```
rm -f "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/.git/index.lock"
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add website/src/app/welcome/page.tsx \
  website/src/app/baseline/page.tsx \
  website/src/components/NavBar.tsx \
  website/src/app/layout.tsx \
  archive/baseline-page.tsx.backup-pre-A18a-2026-06-07 \
  archive/layout.tsx.backup-pre-A18a-2026-06-07 \
  archive/NavBar.tsx.backup-pre-A18a-2026-06-07 \
  operations/decision-log.md \
  operations/handoffs/founder/2026-06-07-A18a-first-run-close.md
git commit -m "A18a: new /welcome first-run page; baseline result hands off to it; Getting Started links in nav + footer. Additive; /api/reason byte-identical. (D-A18A-FIRST-RUN-WELCOME-2026-06-07)"
```
Then push via GitHub Desktop. A new static page + an additive nav/footer link + a one-line baseline redirect — Vercel should build green with no config or env change.

## Next Session Should
You elect. A18 picture after this session:
- **A18a + A18b + A18d done** (pending your URL checks). Onboarding + honest-positioning page layer in place.
- **A18c** — framework-dependence detection + independence coaching (R20b) — Elevated → **Critical under PR6**; its own dedicated Critical-protocol session (may add an LLM classifier → confirm model selection per AC1/KG2).
- **A18e** — cognitive-accessibility design pass on mentor + assessment surfaces (Standard; the accessibility page already flags this as ongoing).
- **Mirror-principle propagation** — extend the proven R19d mentor text from the single founder-only surface to the practitioner-facing mentor surfaces (mentor-baseline et al.) — Elevated; small focused pass.
- **FPE / legal track** — still the highest-leverage long-pole gating A16/A17 + Stage-1 close.
- **Governance housekeeping** (7 pending doc edits incl. the new A18 staging-plan annotation) and the **two production migrations** — small founder-performed items; walk live per PR17.

## Open Questions
- "Shown once" is implemented by routing the baseline result through `/welcome`; since baseline is normally taken once (retake is date-gated), this is effectively once without adding a persistence flag. If you later want a hard "never show again," that's a small future add (a stored flag).
- `/welcome` is a single static page for all visitors (simplest viable interface); it does not yet vary by whether the user has a baseline. Fine for now; revisitable if onboarding personalisation is wanted later.

## Cross-references
- Decision log: `D-A18A-FIRST-RUN-WELCOME-2026-06-07`; predecessor `D-A18B-A18D-LIMITATIONS-MIRROR-ACCESSIBILITY-2026-06-07`.
- Page: `website/src/app/welcome/page.tsx`. Wirings: `website/src/app/baseline/page.tsx`, `website/src/components/NavBar.tsx`, `website/src/app/layout.tsx`.
- Backups: `archive/baseline-page.tsx.backup-pre-A18a-2026-06-07`; `archive/layout.tsx.backup-pre-A18a-2026-06-07`; `archive/NavBar.tsx.backup-pre-A18a-2026-06-07`.
- Rules: `manifest.md` R3, R19c, R19d, A1. Staging: `adopted/substrate-plugin-staging-plan.md` §A18.

*End of session close. Stabilised to known-good: production byte-identical and undeployed; one new page + three additive wirings built and typecheck-clean (exit 0); all three edited files backed up; nine files uncommitted, awaiting your URL check then commit; no flags, schema, or deploys touched.*
