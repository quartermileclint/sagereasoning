# Next-Session Prompt — Practice Reminders, Agent Half, Phase A3: R18 Docs + the Founder-Walked Activation

**Stream:** founder (substrate / agent experience). This is a **substrate-build session** — read `/adopted/build-sessions-protocol-cache.md` at open alongside the standing cache.
**Tier:** `code-critical` — **env-flag activation of new content on two live public response surfaces, plus R18 public-docs changes.** The **full Critical Change Protocol (project instructions 0c-ii)** governs; **AC7 + PR6 + PR17 engage.** Every live operation (Vercel env var, redeploy, credential mint, smoke call) is **founder-performed** — the AI guides, verifies, and makes the repo edits, and performs no Vercel/Supabase/git/mint op itself.
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Plan of record:** `operations/reminders-2026-07/2026-07-26-practice-reminders-AGENT-build-plan.md` — **§6 (Phase A3) is this session's spec**, read with §4's and §5's status blocks (what is actually built) and §7 (the boundaries restated as acceptance criteria).
**Binding verdict records (read BOTH before touching a single word of public copy):** `operations/reminders-2026-07/2026-07-27-step-M-mentor-verdicts-verbatim.md` AND `operations/reminders-2026-07/2026-07-28-mentor-verdicts-agent-suggestions-verbatim.md`. **The verbatim records win over every summary — including the plan, the module headers, and this prompt.** Both A1 and A2 were caught by their own reviews making claims a summary supported and the record did not; docs are where that error becomes *public*.
**Predecessor closes:** `operations/handoffs/founder/2026-07-28-practice-reminders-AGENT-A1-suggestion-composer-CLOSE.md` (A1) and `…-AGENT-A2-reflect-developmental-CLOSE.md` (A2). Commits `a7fddea`, `2a4c7f4`, `81a0664` — all pushed, Vercel green, **both flags unset ⇒ nothing served yet.**
**Risk classification:** **Critical** under 0d-ii ("deployment-configuration changes — env flags activating new surfaces") *and* R18 (public-contract change). This is the step where A1 and A2 stop being dark.

---

## Where the arc stands

1. **A1 is COMPLETE and dark** (`D-PRACTICE-REMINDERS-AGENT-A1-SUGGESTION-COMPOSER-BUILT-REVIEW-FOLDED` + the second-consultation fold): at most ONE advisory `suggestion`, in the mentor's question form, rides inside the existing CI-13 `practice` block on the `/api/reason` consult happy path and the accreditation write 200. Behind `SUBSTRATE_PRACTICE_SUGGESTION_ENABLED`, unset everywhere. 18 basis codes / 7 practices / 2 vetted question forms. Battery 759/0.
2. **A2 is COMPLETE and dark** (`D-PRACTICE-REMINDERS-AGENT-A2-REFLECT-DEVELOPMENTAL-BUILT-REVIEW-FOLDED`): the Sage Reflect completion gains `developmental_priorities: [{domain, note}]` (a bounded agent-scoped read feeding the unmodified S4 `evaluateDevelopmentalFlags`) and, at the `grade_changed === true` moment, `suggestion` (the same A1 composer via `practiceSuggestionForReflect`). Behind the **separate** `SUBSTRATE_REFLECT_DEVELOPMENTAL_ENABLED`, unset everywhere. Batteries 20/0 + 41/0.
3. **A3 (this session)** publishes the R18 contract and flips the flag(s). **The two flags are deliberately independent** — the founder may activate one, the other, or both, and the walks may be combined (plan §5). Nothing in either predecessor pre-approves this step.

---

## Pre-conditions (confirm at open; a mismatch is a STOP, not something to absorb)

1. `git log` shows `81a0664` ("Wire the reflect developmental read-back…") at or behind HEAD, pushed, Vercel green. If the tree has drifted, re-verify the baselines below before proceeding.
2. Both flags are **UNSET** in Vercel Production (`SUBSTRATE_PRACTICE_SUGGESTION_ENABLED`, `SUBSTRATE_REFLECT_DEVELOPMENTAL_ENABLED`) — confirm with the founder before any smoke, so the flag-took-effect proof below is meaningful.
3. `SUBSTRATE_PRACTICE_CYCLE_HINT_ENABLED` is **LIVE** in production (it is — since 2026-06-15). **This is load-bearing for A1: BD-3 makes the suggestion a member of the CI-13 `practice` block, so A1's flag alone serves nothing if the carrier is off.** Verify, don't assume.
4. `SAGE_REFLECT_ENABLED`, `SUBSTRATE_TRUST_CORE_ENABLED`, `SUBSTRATE_TRAJECTORY_READ_ENABLED`/`_DELTA_ENABLED`, `SUBSTRATE_LOOP_FOLD_ENABLED` all live (they are) — A2's read depends on the trust core being on to have any `credential-completed` rows at all.
5. Baselines at open (re-run, don't trust this list): practice-suggestion **759/0** · developmental-observations **20/0** · a2-developmental-reminders **41/0** · loop-fold 181/0 · trajectory-delta 73/0 · trajectory-overlay 36/0 · kathekon-engagement 105/0 · practice-cycle-hint 13/0 · practice-sequence 645/0 · S4 417/0 · S10 106/0 · trust-core 98/0 · emission-hooks 15/0 · s9b-practice-completion 86/0 · reflect-service 28/0 · sage-assent-feed 28/0 · session-store 34/0 · request-helpers 17/0 · reflect-completion-schema-drift 9/0 · response-builders-direction 6/0 · r20a-invocation 55/55 · accreditation route 90/90 (needs `--env-file=.env.development.local`; prints its summary then HANGS on a keepalive — run redirected in the background and kill after the summary) · `tsc` 0 · `npm run build` 0.

---

## Verified surface grounding (checked first-hand 2026-07-28; re-verify — line numbers drift)

- **`website/public/.well-known/agent-card.json` carries exactly 18 extensions today** (counted). So the new `practice-suggestion/v1` is genuinely **the 19th**, as plan §6 says. Validate the JSON parses after editing.
- **`website/public/llms.txt`** — two distinct insertion points, and they are *not* the same place:
  - `## Practice Cycle — Reflect at Session Close (default)` (~line 661) contains the **`practice` block JSON literal** (~665–672) that A1's `suggestion` becomes a member of. A1's contract belongs here.
  - `## Sage Reflect — Session-Close Reflection (wire shape)` (~line 678) contains the **completion response JSON literal** (~724–735). A2's `developmental_priorities` and `suggestion` belong here.
- **`website/src/app/api-docs/page.tsx` already has both sections** — "Substrate Reasoning (`/api/reason`)" (~line 480) and "Sage Reflect — Session-Close Reflection (`/api/practice/reflect`)" (~line 774). **Correction to a stale note:** CLAUDE.md's M5-era text says api-docs "needs a NEW 'Practice cycle' subsection — `/api/reason` is absent from its endpoints array." That is **out of date** — the M1 activation added the `/api/reason` section. Plan §6's "one `/api/reason` + one reflect bullet" fits existing sections; no new section required. Verify before editing and correct the stale line if you touch CLAUDE.md.
- **The composer's own framing string** (`PRACTICE_SUGGESTION_FRAMING_NOTE`, `practice-suggestion.ts`) already rides on every emitted block and states the full frame (advisory / binds nothing / not an S4 input / never a trust-event source / record-descriptive / one-max / honest silence / **weights blocked**). The public docs should be **consistent with it, not a looser paraphrase** — quote or mirror it deliberately.

---

## The work, in inviolable order

### Step 0 — Confirm the tier and get the founder's activation election *first*

Before any edit, put to the founder (AskUserQuestion): **activate A1 only, A2 only, or both together?** and **apply docs for exactly what is activated, or for both regardless?** The docs must not describe a surface that is not live (R18 honesty) — so the elections are coupled. Record the election in the decision-log entry.

### Step 1 — Draft the R18 docs and get founder sign-off BEFORE any public surface changes

This is the **AE-1 precedent and it is not optional**: the founder signs off on the *wording* before a single public file is edited. Draft into the session (or a staging file), not into `llms.txt`/`agent-card.json`/`page.tsx`.

The wording must state, for the suggestion surface:
- it is **derived from the agent's own record** — never a cross-agent comparison, never a prediction;
- it is **advisory** (the channel law) — it **binds nothing**, is **not** an input to any recommendation, gate, or trust event;
- it is a **question, not an instruction** — the deliberate design (the mentor's central verdict: *"the agent is already standing at the door with its hand on the handle"*), and the `practice`/`endpoint_hint` fields name what the lookup found, not what the agent must do;
- **at most one**, and **absent — not null, not empty — when nothing qualifies** (the protected silence; say plainly that absence is meaningful and is not an error);
- it is **never served on the public trust record** (`GET /api/trust-record/{agent_id}` — the S10 withholding stands);
- **weights-tier use remains BLOCKED.**

And for the developmental read-back:
- it is **"tracked, not intervened"** (spec-7 constraint 3, the engine's own words) — a developmental priority surfaced to the reflecting agent, binding nothing;
- **results-level only** (domain + note; engine internals stay closed — R4);
- **honestly disclose the threshold**: the shipped signal is a **3-consecutive-`deliberate` streak**, which the 2026-07-28 record licenses only as *"an acceptable approximation"* of its actual plateau recommendation (*"at least three of the four most recent accreditation writes… with no single write showing reflexive-level reasoning"*), **conditional on noting it as a known limitation**. The A2 build recorded this in code; **if the surface is documented publicly, the limitation is documented with it.** Do not publish a cleaner claim than the code makes.

**Do NOT publish** anything the records do not support — in particular do not describe the reflect-completion `suggestion` as reading "the full signal mapping" at that seam. It structurally cannot: only the 7 persisting-passion bases can fire there (A2's `persistingPassions` docstring carries the per-leg fidelity mapping). Either describe it accurately or describe it generally enough to remain true.

### Step 2 — Apply the docs (repo edits; AI-performed) + build-verify

`llms.txt` (both insertion points above), `agent-card.json` (the 19th extension; **re-validate the JSON parses and re-count to 19**), `api-docs/page.tsx` (the two bullets in the existing sections). Then `npm run build` (exit 0, both routes registered) — **`page.tsx` is a route file, so `tsc` alone is not the gate** (the standing Next.js route-export lesson).

### Step 3 — The founder-walked activation (live ops; founder-performed)

Per the elections: set the flag(s) in **Vercel Production** → **redeploy** → wait green. The docs go live on the same push.

### Step 4 — Live smokes (founder-run; the AI verifies the payloads)

**Read this section before designing the smokes — the naive plan does not survive contact.**

- **A1 flag-took-effect proof (the easy, definitive one):** a `/api/reason` consult constructed to fire a **B2 obligation basis** — an action that violates an obligation to a **beyond-self** circle (BD-4: a self-only circle cannot fire it). Expect `practice.suggestion` present, `basis.code` = `obligation_violated`, `line` ending in the vetted question, `framing_note` present. **The field is unreachable flag-off, so its presence IS the proof.**
- **A1 honest-silence control:** a benign consult with no qualifying basis → **`suggestion` key absent** from the `practice` block (the block itself still present — it is CI-13, already live).
- **A2 flag-took-effect proof:** `developmental_priorities` present on a reflect completion. **This requires the agent to have ≥3 consecutive `deliberate` `credential-completed` events in one domain** — i.e. ~3 prior accreditation writes on that agent_id. Plan the credential and the write sequence *before* the walk; this is the multi-step part.
- **A2 `suggestion` positive — likely NOT constructible in a reasonable walk, and that is fine.** It requires `grade_changed === true` (the Sage Assent grade engine has hysteresis and a `min_actions` floor — a single reflect pass does not move a grade) **AND** a qualifying persisting passion in the accreditation record, simultaneously. **Do not contrive a live positive for it.** The A2 flag's took-effect proof comes from `developmental_priorities` (same flag gates both fields), and the suggestion path is battery-proven (41/0, mutation-verified) plus composer-proven (759/0). **Recommended:** run the honest negative (a completion with `grade_changed:false` → `suggestion` absent) and record the positive as battery-verified-not-live-verified, explicitly, in the close. Put this to the founder rather than deciding silently.
- **Rollback drill:** unset one flag → redeploy → re-run the corresponding positive smoke → confirm the field is **absent** again. This is the rollback *tested*, not merely asserted.

**Credential note:** the smokes need a credential carrying `consult`, `accreditation_write` and `reflect` capabilities on one K1-canonical agent_id. The standing `sagereasoning:s9-loop@v1` gen-2 pair exists but has been returning intermittent 401/429 (the documented transient fail-secure class). A throwaway `sr_prac_` UPC minted for the walk and **revoked at teardown** is the cleaner path — the S0a/AE-2 precedent. **Mint via the CLI with `--daily`/`--monthly` raised BY SQL** (the practice mint silently drops those flags; the CI-6 defaults 30/1 will kill a multi-write walk after one action/day — a documented trap).

### Step 5 — Teardown + records

Revoke any throwaway credential; note any test rows written (`agent_assessment_history`, `loop_billing_events`, `agent_trust_events`, `agent_accreditation`) as **excluded from billing/trajectory samples**, `retain_until`-swept. Then the decision-log entry (Critical form), the plan §6/§8 status update, the session close with the Founder Verification block, and the CLAUDE.md production-state refresh (**PR18** — close-time only, from the decision log + this session's verified observations, carrying its as-of date; note that production is **intentionally NOT byte-equivalent** afterward).

---

## Boundaries (verify before close)

- **`GET /api/trust-record/{agent_id}` unchanged** — S10's withholding of the S4 recommendation stands; no suggestion, no developmental priority, ever reaches the public record.
- **The delta/fold no-recommendation contracts untouched**; the composer still never imports the intervention engine (battery-pinned); the S4 engine file itself unmodified.
- **`/api/guardrail` and `/api/practice/discernment` untouched** (plan §9 — future elections).
- **ADR-013 §8 honest-claims envelope unchanged** — a suggestion attests nothing.
- **S11/ENFORCE untouched; MEASURE throughout; weights-tier claims BLOCKED** (restate on-surface, in docs, and in the decision-log entry).
- **The 0h hold is unaffected** — this is pre-0h trust-layer work.
- **R20a perimeter untouched** — the reflect route stays inside it exactly as before; A2 added no free-text input surface.
- **`stoic-brain.ts` frozen** (standing guard). **Known and founder-undispositioned:** the logos `human-practitioner-boundary` git byte-identity guard goes red while `src/lib/substrate/` changes are uncommitted (248/1). Expected transient; record it, do **not** weaken or scope it — that disposition is the founder's open item, now carried across three sessions.

---

## Review (PR19)

An independent adversarial review is **required before this is treated as verified**, and its centre of gravity is different from A1's and A2's: those reviewed *code*; this one reviews **public claims against the binding records and against what the code actually does.** Dimensions worth running: docs-vs-records fidelity (every published sentence traced to verbatim text); docs-vs-code fidelity (does the wire genuinely do what the docs now say — including the threshold limitation and the reflect-seam narrowness); activation-safety (can either flag, once on, change any verdict, gate, trust event, or billed amount? it must not); rollback-correctness (is unset genuinely byte-identical); and boundary/blast-radius. If the review dies on account limits, complete first-hand per the §4 precedent, disclose honestly, and queue the independent re-run — **do not treat a first-hand pass as equivalent** on a session that changes public contract.

**If this session is run with the Workflow tool available and the founder wants the multi-agent review, they must say so** — Workflow is opt-in and this prompt does not itself authorize it.

---

## Rollback path

**Unset the flag(s) in Vercel + redeploy** ⇒ both surfaces byte-identical (battery-asserted, and independently review-confirmed for A2). **`git revert` the docs commit** for the public surfaces. No schema was applied, so nothing to reverse there. Revoke any throwaway credential. The rollback drill in Step 4 is what makes this claim tested rather than asserted.

---

## Open items carried (not this session's work unless the founder elects otherwise)

- **The `emission-hooks.ts` `correlationId`-ordering defect** — CONFIRMED live-production bug found by A2's review (a non-order-independent idempotency key lets a reordered retry double-count in the S1 trust ledger). Spawned as its own task; its own risk classification. **Relevant here only as a caveat:** it can inflate a `developmental_priorities` streak, and A2's own docstring says so. If the founder wants that fixed *before* A2 goes live, that reorders the arc — worth surfacing at Step 0.
- **The deferred `loop_fold` R18 docs** — the natural neighbour of this session, still not folded in. A candidate to bundle if the founder wants one docs walk instead of two.
- **The logos byte-identity guard** — scope or retire.
- Plain-language clauses for the five non-philodoxia craving sub-species (next mentor consultation); the B5 per-session-granularity decline signal; the fold-open closure class (principle pre-settled, awaiting the CI-4 marker-persistence schema step).
- R17 on `milestones` (Critical, founder-walked) · human Phases 0–1 independent-review re-runs · the journal UTC pace-gate mismatch · the day-55 evening-pole case · `/api/milestones` + `/api/baseline` on the `scoring` bucket · `oikeiosis_context` never written.

---

## Forecast

Success = an agent consulting `/api/reason` with a genuine obligation gap in its own record receives, live, one question in the mentor's register — *"This record shows an obligation to an affected party assessed as violated. Before proceeding: is this the reasoning this action warrants?"* — and an agent completing its reflect with a real developmental pattern receives the engine's own "tracked, not intervened" note, with the threshold's limitation documented rather than glossed. Both rest on published contract that says exactly what the code does and no more, and both roll back to byte-identical with one env change — demonstrated, not claimed.

End of prompt.
