# Next-Session Prompt — Agent-circles: the founder walk toward `SUBSTRATE_AGENT_CIRCLES_ENABLED`

**Paste this whole file as the FIRST message of a new session.**

**Target model: `claude-opus-5`, effort `medium`.** State model + effort in one sentence at the start of your reply.

**Tier: `code-critical`, founder-walked 0c-ii.** This session walks toward setting a flag that changes the LIVE `/api/reason` public profile AND the LIVE `/api/guardrail` gate. **AC7 + PR6 + PR17 engage here.** The AI guides, verifies, and makes repo edits; **the founder performs every live operation** — every push, every Vercel change, every flag set, every credential mint and revoke. Do not run a deploy, a flag set, a mint, or any Supabase/Vercel operation yourself; if you believe one is needed, say so and hand it to the founder.

---

## Read these at open, in this order — do not re-derive from the full build plan

1. `operations/handoffs/founder/2026-08-01-agent-circles-C0-C1-C3-CLOSE.md` — **read the "Q2 + Q4 + Q3 BUILD ADDENDUM" at the top FIRST** (it is the current state), then §5 (the walk checklist — this session's spine), §6 (rollback), §7 (carried). §§3/4a–4d/8 are context; read them only if a specific step needs them.
2. `operations/agent-circles-2026-08/2026-08-02-mentor-consultation-pr19-five-fidelity-questions-verbatim.md` — the five binding rulings. **Q1 in particular governs walk step 1** (the regime-boundary date reconciliation) and is easy to get subtly wrong.
3. `operations/agent-circles-2026-08/2026-08-02-mentor-consultation-q3-staged-pause-mechanism-verbatim.md` — Option A binding. Read its "What this settles" section: it states the exact condition under which the circle-4 flag may be set, and it forbids adding a promotion mechanism.
4. `operations/decision-log.md` — the last three entries only (`D-AGENT-CIRCLES-Q4-RESIDUAL-MENTOR-RULING-2026-08-02`, `D-AGENT-CIRCLES-Q3-STAGED-PAUSE-MENTOR-RULING-2026-08-02`, `D-AGENT-CIRCLES-Q2-Q4-Q3-BUILT-REVIEW-FOLDED-2026-08-02`).

**Do not read** the logos-on plan, the PR19 raw journal, or the Q1–Q9/L1–L4 earlier verbatim records unless a specific step needs to cite them.

---

## State at handoff (verify, don't assume)

- **HEAD should be `aac6442`** ("Agent circles: build Q2 + Q4 + Q3 — the three mentor-confirmed flag blockers"), on `main`, **committed but NOT pushed** as of handoff. The founder pushes via GitHub Desktop on their own schedule — **run `git log --oneline -3` and `git status` fresh at open** and reconcile against what you find rather than trusting this line.
- **`SUBSTRATE_AGENT_CIRCLES_ENABLED` is unset everywhere.** Nothing from this arc is live. Production is byte-equivalent.
- **Close-doc §5 step -1 is DISCHARGED** — Q2, Q4, and Q3 are all built, battery-green, mutation-verified, and each adversarially reviewed with zero CRITICAL/HIGH/MEDIUM findings.
- **⚠ The working tree carries substantial UNRELATED uncommitted work** that appeared during the build session and is not from this arc: brand assets (`brand/*.PNG`, `Brand_Guidelines*.docx`, `website/public/images/*`), a new `website/src/app/reflect/` route, and edits to `NavBar.tsx`, `DailyRhythmStrip.tsx`, `practice-sequence.ts`, `user-data-gathering.ts`, `glossary/page.tsx`, `score/page.tsx`, `layout.tsx`, `passion-log/page.tsx`, `api/user/{delete,export}/route.ts`, `api/reflect/route.ts`, and their tests. **This is almost certainly a concurrent session's work.** Ask the founder what it is before doing anything that could disturb it. **Never `git add -A`, never `git checkout`/`restore`/`clean` broadly** — stage only files you can name and justify. The build session committed by explicit path list for exactly this reason.

---

## The walk — close-doc §5, in inviolable order

Steps -1, 0, 0b, 1(code), 2, 3 are DONE. What remains:

### Step 1 (manual half) — the regime-boundary date reconciliation. BLOCKING, at FLIP TIME.

`website/src/lib/substrate/trajectory-delta.ts` carries an `agent-circles-v1` entry whose `band_start_iso`/`band_end_iso` were authored as `2026-08-01`→`2026-08-02`. **Per mentor Q1, these must equal the ACTUAL flag-flip day and the day after — not the deploy day, not the authoring day.** The code fix (`activeRegimeBoundaries`) already makes the pre-flip window safe by construction (the entry is excluded entirely while the flag is off), so a deploy without a flip cannot mislabel anything. But the dates themselves still have to be right *at the moment the flag goes on*, or examinations across the vocabulary change are mislabelled on three live surfaces (AE-1 `trajectory-delta`, AE-2 `loop-fold`'s `write_era`, B5 `session-decline-signal`).

**Do this edit in the same step as the flag flip, not before** — if the founder isn't flipping today, leave the dates alone and say so.

### Steps 4–5 — acknowledge, then push and deploy

- **Step 4** is superseded by step -1: the two disclosed consequences (C1a's lenience direction, C3's new block class) now have BUILT mechanisms (Q2's routing, Q3's staged pause), so acknowledgement alone is no longer the bar and the bar is met. **Do re-state both to the founder plainly before the push** so they are consciously accepted, not assumed.
- **Step 5** — founder commits (if anything is uncommitted) and pushes; confirm **Vercel green with the intended code BEFORE any flag touch**. This deploy is behaviour-identical: the prompt is flag-off-identical to HEAD, both new assessment fields are omitted, Q3's override is unreachable, Q4's narrowing is inert, and the regime-boundary entry is excluded.

### Step 6 — four live smokes, throwaway credential, revoked at teardown

Founder-performed. On a throwaway credential (mint → smoke → **revoke**, and confirm the revoke with a 401):
1. A **self-regarding** consult → expect **no** `self_preservation` circle.
2. A **third-party-affecting** consult → expect the affected circle, unchanged.
3. A **summariser-omission** consult (the C3 anchor class) → expect `cosmopolis` + `violated`.
4. An **honest-disclosure** consult → expect **no** violation (the protective control).

**Add a fifth, new to this walk** now that Q2/Q3/Q4 exist: a self-regarding consult should show `virtue_domains_engaged` containing **both `phronesis` and `sophrosyne`** (Q2's routing, flag-on) — and its `katorthoma_proximity` must be **unchanged** from the flag-off reading of the same input (Q2 is classification-only). If smoke 3 returns a gate verdict, confirm it reads **`pause_for_review`**, not `do_not_proceed`, when `cosmopolis` is the only violated circle (Q3).

**Note the smokes 1–4 above are the flag-OFF expectations from the original checklist for 1–2 and the flag-ON expectations for 3–4** — read §5 step 6 in the close doc directly rather than relying on this compression, and confirm with the founder which flag state each is run under before running any.

### Step 7 — the flag itself

`SUBSTRATE_AGENT_CIRCLES_ENABLED=true` in Vercel Production + redeploy, **only after** steps 1/5/6 are green. Re-smoke for `practitioner_type` + `reasoning_integrity`. **The mentor's Q3 condition for setting this flag is already satisfied** (the stateless pause exists and was verified to fire on candidate violations without touching the deny path) — say so explicitly to the founder rather than leaving it implicit.

### Step 8 — R18 public docs

**Not drafted, deliberately.** The public contract changes only if/when the flag is set. **Founder signs off on wording BEFORE any public surface changes.** If the flag goes live this session, this becomes real work: `llms.txt`, `agent-card.json` (extension count increments), `api-docs/page.tsx`. Do not pre-write it if the flag isn't flipping.

---

## Carry these into the walk — surfaced by the build, not yet dispositioned

1. **`virtue_domains_engaged` has downstream reach the Q2 review flagged for exactly this moment.** It feeds `derive-trust-events.ts` (per-domain `credential-completed` minting) and `score-architecture.ts` (`computeVirtueBonus`). Neither is a verdict or gate, both are pre-existing untouched code — but **once the flag is live, self-only actions will newly accrue phronesis/sophrosyne trust-core credit and score bonus they did not before.** Foreseeable and arguably correct (they genuinely engage those domains), but the founder should accept it knowingly at flip time. Disclosed in the code comment on `applyFirstCircleRouting`.
2. **D4 is still open and C1a does not close it.** `derive-trust-events.ts` still mints dikaiosyne justice events from self-only circles. Q4 fixed the *verdict* surface; the *trust-ledger* surface is untouched and now diverges further from the predicate. Its own session.
3. **Two live-surface fidelity degradations, disclosed not fixed** (close doc §4b items 4–5): `loop-fold.ts`'s `self_regarding` bucket and `practice-suggestion.ts`'s basis B6 both get starved by C1a's narrowing. MEASURE-only, nothing binds, but real accuracy costs on live surfaces. Founder's call on priority.
4. **The phronesis/sophrosyne proximity-path question** — the Q4 ruling surfaced but explicitly did NOT resolve whether those domains have any proximity-assessment path of their own today, or are purely descriptive. Named, unscoped, **explicitly not to be folded in as a workaround**. Its own scoping session.
5. **Optional, non-blocking:** a live-extraction demonstration fixture for Q2's routing in `first-circle-calibration-probe.ts`. Unit pins §6/§7 already demonstrate it positively; this would add a real-extraction confirmation. Nice-to-have.

---

## Boundaries

- **No live op by the AI.** No push, deploy, flag set, mint, revoke, Supabase or Vercel action. Guide and verify only.
- **Do not touch the concurrent session's uncommitted files** (see the ⚠ above). Ask first.
- **Do not build a promotion/counter mechanism for Q3** — the 2026-08-02 ruling forbids it at this stage; its absence is a requirement, not a gap.
- **Do not re-litigate** Q1–Q5, the Q4 residual, or the Q3 Option-A ruling. All binding, all recorded verbatim.
- **Do not widen scope** into D4, the loop-fold/practice-suggestion degradations, C1c, C2, or W2 — each is its own session.
- If any battery or smoke comes back unclean, **stop and report** rather than proceeding to the flag.

## Exit

- Update the close doc's §5 with what was actually walked, and append a decision-log entry.
- If the flag went live: state plainly that production is **intentionally no longer byte-equivalent**, record the rollback (unset the flag + redeploy; byte-identical flag-off, battery-asserted; `git revert` for docs), and note the R18 docs state.
- If the flag did NOT go live: say exactly which step stopped it and what remains.
- Commit only if asked. The founder pushes separately.
