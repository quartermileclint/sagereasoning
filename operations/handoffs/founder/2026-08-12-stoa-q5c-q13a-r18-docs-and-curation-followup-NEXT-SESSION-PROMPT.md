# Next session — Stoa Q5c/Q13a R18 public docs (+ an optional small curation-via-volume follow-up)

**Paste this as the first message of a new session, beneath the standing session opener.**

**Tier: `code-elevated`.** No schema, flag, or credential change — this is applying founder-signed-off
wording to three public documentation surfaces (`llms.txt`, `agent-card.json`, api-docs), following the
exact precedent the C2/C1c and ST4 R18 steps already set in this repo. AC7 not engaged.

**Permitted paths to WRITE, until the session's own findings justify more:**
`website/public/llms.txt`, `website/public/.well-known/agent-card.json`,
`website/src/app/api-docs/page.tsx`, `operations/decision-log.md`, `CLAUDE.md`,
`operations/handoffs/founder/STANDING-SESSION-OPENER-grounded-foundations.md`, and — only if the
optional Part 2 below is picked up — `website/src/lib/substrate/trust-core/trust-record-payload.ts`
and its test file. **Read anything.** Verify with `git diff --stat` before committing.

---

## 0. Concurrency — run the parallel-window pre-flight first, as always

`operations/handoffs/founder/2026-08-10-idea-loop-parallel-window-NEXT-SESSION-PROMPT.md`. Re-derive
the cycle count and check for a blocking spec — do not inherit any number from this file or from
memory of prior sessions. Neither part of this session touches the fenced IDEA-loop surfaces
(`/api/reason`, `/api/guardrail`, `/api/practice/{fresh,watching}`, `project-context.*`, the
`sagereasoning:idea-loop@v1` credential), so this should ordinarily be Mode 2 — but if a blocking spec
exists in the scratch project, resolve it first per that prompt's Mode 1, regardless of the work below.

---

## 1. What happened, so you don't re-derive it

The prior session (`D-STOA-Q5C-Q13A-ACTIVATION-LIVE-MIGRATION-STALENESS-FOUND-AND-FIXED-2026-08-12`)
activated `SUBSTRATE_STOA_TRUST_EVENTS_ENABLED` in production, found and fixed a real migration-
staleness defect along the way, and ran the full six-step smoke sequence clean on production —
including the mentor-designated hard gate (a fresh-domain flag ledgers-but-never-folds, and the public
trust-record read correctly stayed 404). Full teardown confirmed. The same session
(`D-CURATION-VIA-VOLUME-FOLDED-INTO-LIVE-PAYLOAD-2026-08-12`) also folded the curation-via-volume
disclosure sentence into the live `GET /api/trust-record/{agent_id}` payload's own `notes` array and
live-verified it against a real 591-entry agent (`sagereasoning:s9-loop@v1`) on production.

**Both are now genuinely closed — read the corrected Stoa bullet in CLAUDE.md's "Live in production"
list before doing anything else in this session; it is current ground truth, not this prompt's own
paraphrase of it.**

---

## 2. Part 1 — the Q5c/Q13a R18 public-docs step (the main work)

The pre-activation checklist (`operations/connective-layer-2026-08/2026-08-05-stoa-trust-flag-
preactivation-checklist.md`) §5 names its own trigger explicitly: *"activation is confirmed clean (the
smoke sequence passes end to end… and the cross-check query returns zero rows post-smoke). At that
point R18 docs become the next named step — not an open-ended backlog item with no clear moment to
pick it up."* That trigger fired in the prior session. This is that step.

**Unlike the C2/C1c and ST4 R18 steps, no staged-docs file already exists for Q5c/Q13a** — check
`operations/connective-layer-2026-08/` yourself in case one was authored between sessions, but as of
this prompt's writing there is none. You are drafting from source, not copying a pre-approved file.

**What to do, in order:**

1. **Read the binding source before drafting anything:**
   `operations/connective-layer-2026-08/2026-08-04-mentor-consultation-stoa-followups-verbatim.md`
   (the Q5c/Q13a ruling itself — verbatim wins over any paraphrase, including this prompt's own) and
   the build session's decision record (`D-STOA-Q5C-Q13A-BUILT-DARK-EVIDENCE-GATE-FOLDED-2026-08-04`
   in the decision log) for the exact mechanism as built: the two Q5c contradiction event types
   (`stoa-claim-contradicted-oversight`, `stoa-claim-contradicted-dikaiosyne` — domain-by-content, never
   severity), the Q13a divergence event (`stoa-declaration-diverges-from-calling`, always
   `virtue_domain: 'oversight'`, a flag-effect that never raises or lowers a level), the evidentiary
   standard for what counts as a valid contradiction (a reader examining both the artifact and the
   entry text would find the contradiction without inference), and the evidence-gate behaviour the
   prior session just live-proved (ledger-but-hold on a fresh domain; fold on a seeded one).
2. **Draft the wording for the three surfaces** — `llms.txt` (a new subsection, following the shape of
   the existing "Accreditation — Loop Fold" or "Orientation readings" sections as the nearest
   precedent), `agent-card.json` (a new extension, incrementing the live count — verify the current
   count first-hand from the file, do not trust a number quoted anywhere else including this prompt),
   and `api-docs/page.tsx` (a short bullet in the existing accreditation/trust-record area). State
   plainly what this surfaces to a consumer: an admin-only, no-UI, curator-triggered mechanism (there is
   deliberately no automated comparator); what a `written`/`held` distinction means on the wire (this is
   an *admin* route, `requireAdmin`-gated — decide explicitly whether it belongs in public API docs at
   all, or whether the public-facing claim is narrower: "the trust record may reflect a curator-
   identified contradiction," without documenting the admin route's own request shape, since no external
   consumer can call it). **This scoping decision is exactly the kind of thing to bring back to the
   founder before publishing** — do not resolve it by silent wording choice, per the standing
   `method-before-purpose` discipline this whole Stoa arc has followed.
3. **Get founder sign-off on the drafted wording before touching any live public surface** — the same
   discipline the C2/C1c R18 step used (`2026-08-08-c2d-honest-claims-signoff-package.md` is the
   precedent to follow, not to copy content from).
4. **Apply verbatim once signed off.** Live-verify with a `curl` against a real Q5c/Q13a-flagged agent
   if one exists in production (check first — the prior session's throwaway smoke agents were torn
   down; do not create a new one just to demo the docs unless nothing real exists and the founder wants
   a fresh disposable one for this purpose specifically).
5. **PR19 independent review before closing** — the same discipline every R18 step in this arc has used.

---

## 3. Part 2 (optional, small, pick up only if Part 1 leaves room) — the totalCount-unknown branch gap

The prior session's PR19 review of the curation-via-volume fold found one low-severity, non-blocking
gap: `composeTrustRecordPayload`'s `notes` composition (`website/src/lib/substrate/trust-core/
trust-record-payload.ts`, inside the `capped` branch) only carries the composition-effect warning when
`totalCount` is a known number. When the count read fails transiently, the reader gets no
composition-effect warning at all — even though the underlying gaming risk (volume-driven displacement
of `away`/`indeterminate` entries) exists independent of whether that one read of the total succeeded.

If you pick this up: it needs its **own**, differently-worded sentence (not a copy of the total-known
one, which explicitly references "the total count discloses…") — draft it, mutation-verify a new test
pin the same way the prior session did (temporarily break it, confirm genuine failure, restore), and
live-verify if you can find or construct a real/throwaway case where the count read genuinely fails
(this may be hard to trigger deliberately — a fail-honest branch, not a common path; battery-only
verification may be the honest ceiling here, and that's fine to say plainly rather than force a live
repro).

**This is explicitly optional and secondary to Part 1.** Do not let it expand into a larger discussion
of the disclosure architecture — one sentence, in one already-identified branch.

---

## 4. What NOT to do

- **Do not touch the fenced IDEA-loop surfaces** (`/api/reason`, `/api/guardrail`,
  `/api/practice/{fresh,watching}`, `project-context.*`, the runner's credential).
- **Do not resolve the row-level reactivation guard** — still a named, unscheduled mentor question,
  unrelated to this session, not to be closed by AI judgement.
- **Do not publish anything to the three R18 surfaces before the founder signs off on the drafted
  wording** — this is a public-facing documentation change on a live product surface, and the scoping
  question in step 2 above (how much of the admin route's own mechanics to disclose) is a real decision,
  not a formality.
- **Do not treat this prompt's characterisation of any file, count, or prior state as ground truth** —
  re-derive from source per the standing lesson this whole arc has been built on
  (`primary-data-beats-secondary-characterisation`).

---

## 5. Verification before you close

1. `git diff --stat` — permitted paths only.
2. The drafted wording checked against the verbatim mentor ruling, not against this prompt's own
   summary of it.
3. The `agent-card.json` extension count re-derived first-hand (count the `extensions` array), not
   assumed from any number quoted in CLAUDE.md or this prompt.
4. If Part 2 was picked up: the new test pin mutation-verified; `npx tsc --noEmit` clean.
5. **PR19: independent adversarial review before either part's work lands** — claims-vs-repo on every
   status assertion, and specifically whether the published wording accurately describes what the route
   does (admin-only, no automated trigger, evidentiary standard) rather than overstating it into
   something that reads as automated or comprehensive monitoring.

## 6. Close with

- A decision-log entry for whichever part(s) were actually worked, each carrying its own risk
  classification (Part 1 is `code-elevated`; Part 2, if picked up, is also `code-elevated`).
- An explicit statement of what changed live vs. what remains recorded-but-unpublished.
- If Part 1 is done: correct CLAUDE.md's Stoa bullet, which currently reads "R18 public docs are now
  the correctly-named next step… not yet done."

## 7. What follows

If Part 1 closes clean, the Stoa program's only remaining named-but-unscheduled items are: the
row-level reactivation guard (mentor question) and Stoa subscriptions (blocked on Resend). Nothing here
bears on the 0h call.
