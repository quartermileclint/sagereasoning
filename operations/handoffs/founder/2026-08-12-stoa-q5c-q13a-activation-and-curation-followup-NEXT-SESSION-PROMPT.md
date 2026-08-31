# Next session — Stoa: Q5c/Q13a activation (founder-walked) + the curation-via-volume payload residual

**Paste this as the first message of a new session, beneath the standing session opener.**

**Tier: mixed, split by thread — classify at the point you pick one, not once for the whole
session.** Thread A (Q5c/Q13a activation) is `code-critical` 0c-ii, founder-walked throughout (a
schema migration + two flags on the live trust ledger) — the AI guides, verifies, and makes repo
edits; the founder runs every live DB/Vercel step, per PR17. Thread B (the curation-via-volume
payload residual) is `governance` until the mentor answers, then at most `code-elevated` to build
(one additive sentence in one response-builder, no schema/flag/credential).

**Permitted paths to WRITE, until the session's own findings justify more:**
`operations/decision-log.md`, `operations/connective-layer-2026-08/`, `CLAUDE.md`,
`operations/handoffs/founder/STANDING-SESSION-OPENER-grounded-foundations.md`, and — if Thread B is
built — `website/src/lib/substrate/trust-core/trust-record-payload.ts` and its test file. **Read
anything.** Verify with `git diff --stat` before committing.

---

## 0. Concurrency — run the parallel-window pre-flight first, as always

`operations/handoffs/founder/2026-08-10-idea-loop-parallel-window-NEXT-SESSION-PROMPT.md`. As of
2026-08-12 the bounded validation run was mid-flight (8+ of its 20–40-cycle target) — **re-derive
that count, do not inherit it.** Neither thread below touches the fenced IDEA-loop surfaces
(`/api/reason`, `/api/guardrail`, `/api/practice/{fresh,watching}`, `project-context.*`, the
`sagereasoning:idea-loop@v1` credential) — but if a blocking spec exists in the scratch project,
resolve it first per that prompt's Mode 1, regardless of which thread below you'd otherwise open.

---

## 1. What happened, so you don't re-derive it

Two sessions today closed the Stoa's biggest open question: `SUBSTRATE_STOA_ENABLED` was confirmed
`true`, ST3/ST4/browse were found live since 2026-08-03 (not dark as every prior record claimed),
and a live distress-check smoke on production confirmed ST3 correctly redirects acute content on
both write paths with zero writes. Full account:
`D-STOA-ST3-ST4-RETROACTIVE-ACTIVATION-RECONCILED-2026-08-12`.

A same-day follow-up took a three-item brief to the mentor and got back two rulings plus the
founder's own action on the third:
`D-STOA-MENTOR-FOLLOWUP-ANSWERED-2026-08-12`. In short:
- **Q5c/Q13a activation:** mentor confirmed nothing new to rule on — the build, the evidence gate,
  and the pre-activation checklist are all sound and ready. One open question was answered:
  **the migration has NOT yet been applied to TEST** (verified directly via the checklist's own
  probe method).
- **Curation via volume:** confirmed closed as a *ruling* (the 2026-08-08 consultation already
  settled it) — but a follow-up check found the shipped disclosure sentence lives only in
  `llms.txt`, never in the live trust-record payload's own `notes` array. Genuinely undecided
  whether that's a defect worth fixing.
- **The leftover declaration row:** the founder withdrew it directly; both `stoa_entries` rows are
  now `withdrawn`, confirmed.

Both CLAUDE.md and the standing opener already carry the corrected state — **read the Stoa bullet
in CLAUDE.md's "Live in production" list before doing anything else in this session; it is the
current ground truth, not this prompt's own paraphrase of it.**

---

## 2. Thread A — Q5c/Q13a trust-event activation (founder-walked, `code-critical`)

**⚠ There is an OLD, now-superseded prompt at
`operations/handoffs/founder/2026-08-03-stoa-ST5-activation-NEXT-SESSION-PROMPT.md`. Do not use it
— it describes flipping `SUBSTRATE_STOA_ENABLED` and live-smoking ST3/ST4, both of which are already
done.** The correct, current checklist for this thread is
`operations/connective-layer-2026-08/2026-08-05-stoa-trust-flag-preactivation-checklist.md`, written
directly at the mentor's request and confirmed sound by the mentor today. Follow it as written —
it is mechanical by design, and the mentor's own words today were *"the checklist is mechanical by
design. Trust it."* Do not improvise around any of its steps, especially the step-2 hard gate (see
below).

**What this session actually needs to do, in order:**

1. **Run the migration on TEST first.** File: `website/supabase-agent-trust-events-stoa-vocabulary-migration.sql`.
   Confirmed today (probe-verified, not assumed) that TEST has not been touched — the `artifact_kind`
   CHECK still rejects the new vocabulary. Follow the checklist's §2 apply order exactly: §PRE
   (expect both counts 0) → §A + §B → §VERIFY (18 event types, 5 artifact kinds) → the file's own
   commented-out behavioural probe (insert three rows on the throwaway `agent_id:
   sagereasoning:stoa-probe@v1`, confirm accepted, delete them) — all founder-performed per PR17,
   walked live, not delegated.
2. **Repeat on production**, same four steps.
3. **Set both flags** (`SUBSTRATE_TRUST_CORE_ENABLED` is already `true`; set the new
   `SUBSTRATE_STOA_TRUST_EVENTS_ENABLED=true`), redeploy, confirm green.
4. **Run the six-step smoke sequence**, checklist §3, on a throwaway admin session and a throwaway
   Stoa entry — never a real practitioner's. **Step 2 (the evidence-gate hard gate) is the load-
   bearing check: flag a contradiction against an agent with no prior trust state, expect
   `written:1, held:1` and a 404 on the public trust-record read, NOT a 200 showing a floored
   level.** The checklist and the mentor both say the same thing about a failure here: stop
   immediately, unset the flag, capture the row with the pre-built cross-check query
   (`operations/connective-layer-2026-08/2026-08-05-stoa-evidence-gate-crosscheck.sql`), and bring
   the finding to the mentor before any further attempt. **Do not patch mid-walk under any
   circumstance** — that is the exact false guarantee the evidence gate exists to prevent, per the
   mentor's own words today.
5. **Run the cross-check query** before the smoke (baseline, expect 0 rows) and after it (expect 0
   rows again) — checklist §4, the mentor's own requested monitoring artifact.
6. **Teardown**: delete the throwaway Stoa entry and its trust-event rows; revoke any throwaway
   admin session minted for the walk.
7. **R18 docs are correctly NOT part of this activation** — checklist §5 names the trigger as "the
   smoke sequence passes end to end, cross-check returns zero rows post-smoke," at which point R18
   becomes its own next named step, not an open-ended backlog item.
8. **Record it** — a `code-critical` decision-log entry per the standing template (AC7 engaged and
   discharged; the founder ran every live DB/flag step; the AI guided, verified, and made the repo
   edits).

---

## 3. Thread B — the curation-via-volume payload residual (mostly a decision, then a small build)

**The question, precisely, for the founder to put to the mentor (or decide directly if it reads as
obviously the founder's call, not the mentor's):** the 2026-08-08 ruling added a disclosure sentence
about curation-via-volume to `llms.txt` and `agent-card.json` — developer-facing documentation. The
live `GET /api/trust-record/{agent_id}` response — the actual URL a Stoa declaration's
`trust_record_url` field resolves to — never received it; its `notes` array carries only the
narrower, pre-existing §6(b) "shows the N most recent of M total readings" sentence. **Should the
composition-effect sentence be folded into the live payload's own `notes` array, or is
documentation-only placement judged sufficient** because the field (`orientation_readings`) and its
inline `not_attestable_clause` are already present in the payload, and the intended reader of a raw
JSON endpoint is expected to consult `llms.txt`?

**If the answer is "fold it in":**
- The change is additive, small, and lives entirely in
  `website/src/lib/substrate/trust-core/trust-record-payload.ts`'s `notes.push(...)` block (around
  line 292–304 as of this session) — extend the existing capped-list note, or add a second note
  entry, with wording that should be **verbatim-sourced from the mentor's original 2026-08-08
  ruling** (`operations/agent-circles-2026-08/2026-08-08-curation-via-volume-ruling-request.md` and
  its verbatim response), not re-authored freehand.
- Update the corresponding unit test(s) for `trust-record-payload.ts` (find via
  `src/lib/substrate/trust-core/__tests__/`) with a case asserting the new sentence's presence when
  `capped` is true and `totalCount` is available.
- Live-verify with a `curl` against a real capped trust record on production after push, the same
  discipline the 2026-08-08 session used.
- `code-elevated` — no schema, no flag, no credential; PR19 independent review still applies before
  closing (a fresh review dimension worth asking for: does the new sentence read consistently with
  the existing §6(b) note, or does it duplicate/contradict it in a way a reader would find
  confusing?).

**If the answer is "documentation-only is sufficient":** record that as the mentor's/founder's
explicit decision (not a silent close) in the decision-log, closing the residual named in
`D-STOA-MENTOR-FOLLOWUP-ANSWERED-2026-08-12`, and correct CLAUDE.md's Stoa bullet to drop the
"residual, worth a short follow-up" language.

**Either way, this thread is small — don't let it balloon.** It is one sentence's placement, not a
re-architecture of the trust-record surface.

---

## 4. What NOT to do

- **Do not use the old `2026-08-03-stoa-ST5-activation-NEXT-SESSION-PROMPT.md`.** It is fully
  superseded; following it would attempt to re-flip an already-set flag and re-smoke an
  already-smoked surface.
- **Do not patch the Q5c/Q13a evidence gate mid-walk if the step-2 hard gate fails.** Stop, unset,
  capture, escalate to the mentor. This is stated three times across the checklist, the mentor's
  ruling, and this prompt because it is the one place a well-intentioned "quick fix" would defeat
  the entire point of the gate.
- **Do not touch the fenced IDEA-loop surfaces**, `/api/reason`, `/api/guardrail`, or
  `project-context.*`.
- **Do not resolve the row-level reactivation guard** (still a named, unscheduled mentor question,
  unrelated to either thread here) **by AI judgement.**
- **Do not conflate Thread A and Thread B into one risk classification** — Thread A is Critical
  because it's schema+flag+ledger; Thread B is a documentation-adjacent sentence. Keep them
  separately scoped, especially in the decision-log entry.

---

## 5. Verification before you close

1. `git diff --stat` — permitted paths only (plus `trust-record-payload.ts` + its test if Thread B
   was built).
2. For Thread A: every checklist step's actual response/read verified against what was expected,
   not assumed from the checklist's own prose — especially the step-2 404-vs-200 distinction.
3. For Thread B: if built, a live `curl` against production confirming the new sentence appears
   exactly where and how intended.
4. Any claim about production state you could not verify directly is marked `unverified`.
5. **PR19: independent adversarial review before either thread's work lands**, focused per the
   standing discipline this whole Stoa arc has followed: does the live evidence actually prove what
   the record claims (not a battery pass standing in for a live observation), and claims-vs-repo on
   every status assertion.

## 6. Close with

- A decision-log entry per thread actually worked (`git commit -F <file>`, not `-m`), each carrying
  its own risk classification.
- An explicit statement of what changed live vs. what remains recorded-but-unactivated.

## 7. What follows

If both threads close clean, the Stoa program's only remaining named-but-unscheduled items are: the
row-level reactivation guard (mentor question), Stoa subscriptions (blocked on Resend), and whatever
R18 docs step Thread A's own checklist names once its smoke passes. Nothing here bears on the 0h
call.
