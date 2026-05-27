# Next-Session Prompt — Outstanding Work → Sage Practice Spec (sequenced)

**Supersedes:** both `2026-05-25-whole-system-next-scope-NEXT-SESSION-PROMPT.md` and `2026-05-25-outstanding-sequence-to-guardrail-spec-NEXT-SESSION-PROMPT.md` (earlier drafts). This is the authoritative prompt — delete the two earlier ones when convenient.
**Stream:** founder.
**Tier:** varies per queue item (declare at each session's open). Session 1 = `governance`/Standard; Session 2 (C2) = **`code-critical`**; Session 3 = `code-standard`; Session 4 (spec) = `governance`/Standard.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Predecessor closes:** `/operations/handoffs/founder/2026-05-26-sage-practice-exploration-close.md` (the direction + findings) and `…/2026-05-25-L2complete-L4-L6-finish-positive-scenarios-build-close.md` (the build + Verification Outcome).
**Predecessor decision-log entries:** `D-SAGE-PRACTICE-DIRECTION-COVERAGE-STATUS-2026-05-26`; `D-L2COMPLETE-L4-L6-POSITIVE-SCENARIOS-BUILD-2026-05-25`.

## How to use this prompt

The positive matrix L1–L7 is complete and Verified; Combination 1 passes in production. This prompt **sequences the remaining whole-system-test work in dependency order**, ending with drafting the **Sage Practice** guardrail + dashboard spec. Work the queue **top-down — each row is its own session.** Session 1 is scoped in full; Sessions 2–4 are scoped in brief and expand into their own prompts when reached. The order is a recommendation with the dependency logic shown; you can re-order, but Session 1 clears a hard dependency and is the lowest-risk start.

**Product naming (adopted 2026-05-26):** **"Sage Practice"** is the umbrella product encompassing the four products — **Sage Calling, SageReasoning, Sage Assent, Sage Reflect**. Use it consistently in the spec, the disclaimer, the agent-card, and downstream surfaces.

## The sequence (work top-down)

| # | Session | Tier / risk | Must-come-first dependency | Delivers |
|---|---|---|---|---|
| 1 | **Priority 4 disclaimer + Combination 2** | `governance` / Standard | **HARD** — the disclaimer text must exist before Comb 2 can assert it | completes the negative-scenario coverage |
| 2 | **C2 — R20a distress perimeter across the loop** | **`code-critical`** (full Critical Change Protocol) | independent; completes the safety story / last scenario type | distress caught + redirected at each product entry |
| 3 | **Control-vs-treatment rig** (substrate ON vs OFF) | `code-standard` | best after the matrix is complete | the value evidence — "is the agent better *with* the substrate?" (0h criterion 4) |
| 4 | **Sage Practice guardrail + dashboard SPEC** (design only) | `governance` / Standard | best after #3 (the comparison is the value justification); reuses the proven agent scores + the C2 safety story + the adopted `coverage_status` design | the one-page spec that then spawns its own build sessions |
| — | Option B (admin-gate fidelity) — *optional* | `code-standard`/`elevated` | none | higher-fidelity backfill of L2-complete/L4/L6; can be dropped |

**Why the spec is last:** it's a new product workstream; drafting it after the test arc closes means it's grounded in evidence (the #3 comparison is the "why install this" proof) and reuses already-verified pieces (the agent scores in `agent_accreditation`; the distress perimeter from #2; the adopted `coverage_status` honesty design).

## Where this sits in the formal priority stack (context, not scope)

This queue finishes the **P0 0h hold-point**. P1 (Business Plan Review), P2 (Ethical Safeguards), etc. remain *your* call on when 0h closes and P1 begins. Sage Practice / the guardrail is a candidate product direction (Agent Trust Layer / plugin arc, ~P3); the Session-4 spec is **exploration to slot into the priority stack by you**, not an automatic jump ahead of P1+. The **distribution go-to-market is not elected** — recommendations only (see Locked context).

---

## ── START HERE: Session 1 — Priority 4 disclaimer + Combination 2 ──

**Why:** Combination 2 is the last negative scenario; it's documentation-gated and blocked only on the no-practice disclaimer text existing. Write it, place it, assert it. Lowest risk; **no test env**.

**Pre-conditions:**
1. On `main`; tree clean.
2. No test env needed (content + a doc-grep over repo / served surfaces).
3. **Resolve the cross-reference at open:** the test-brief §A.3 labels the disclaimer "the Priority 4 output," but the project-instructions Priority 4 is *Stripe* — it likely belongs to **P2 2e** (honest positioning / limitations page, R19c/d). Confirm which before writing.

**Part A — open under the protocol (read order):**
1. `/adopted/standing-protocol-cache.md`; 2. `/adopted/build-sessions-protocol-cache.md`; 3. the predecessor closes named above; 4. `data-room/04_test_brief/test-brief.md` §A.2 (Comb 2) + §A.3 (disclaimer) + `scenario-matrix.md` (Comb 2 row); 5. the surfaces — `website/public/llms.txt`, `website/public/.well-known/agent-card.json`, the limitations page source, developer docs; 6. `/manifest.md` R18f + R19c/d/e.
Confirm tier (`governance`/Standard); branch; status vocabulary. PR15 consult.

**Part B — procedure:**
1. Draft the no-practice disclaimer — plain-language, accurate: the Reasoning + Assent (no Reflect) config is legitimate single-session credentialing; it does **not** constitute an ongoing "practice." **Keep the wording consistent with the `coverage_status` honesty principle** (the credential is a dated, scoped verdict — see Locked context). **Founder approves the wording** before it lands.
2. Place it on each surface (docs, `llms.txt`, `agent-card.json`, limitations page).
3. Build `run-comb2.ts` (or a doc-grep on the proven harness pattern) asserting the disclaimer string is present + non-empty on every surface.
4. Verify (PR10): `npx tsc --noEmit` if any TS added; the grep asserts presence; founder eyeballs the wording.
5. Decision-log entry (lean) + session close (lean); update the scenario-matrix Comb 2 row + test-brief §A.2/§A.3 status.

**Founder verification:** open each surface, confirm wording; run the grep → expect PASS.

---

## Sessions 2–4 (expand into their own prompts when reached)

**Session 2 — C2: R20a distress perimeter (Critical).** Enable `SUBSTRATE_R20A_GATE_ENABLED` in the TEST env **under the full Critical Change Protocol (0c-ii), visibly**. Build `run-c2.ts` submitting a distress input at each product entry; assert the redirect / pass-through (synchronous, PR3; **PR6 throughout**; PR1 — one route first). Needs the test env re-pointed. Rollback = unset the flag (production untouched).

**Session 3 — control-vs-treatment rig.** Parameterise the runners (or `run-compare.ts`) to run a scenario with the substrate ON vs OFF; capture both into a ledger; define "better with the substrate" as an assertion or a founder-readable diff. The 0h criterion-4 value demonstration + the evidence base for Sage Practice. `code-standard`; needs the test env.

**Session 4 — Sage Practice guardrail + dashboard SPEC (design only — no build).** Produce a one-page spec for **Sage Practice** (the four-product suite) delivered as a governed-agent layer:
- **Hook:** a **PreToolUse hook → `/api/reason`** gating *consequential tools only* (selectivity — the cost/latency + inference-ceiling control); **advisory / log-only first** (fail-open + timeout; never brick a session); single-tool proof first (PR1). Advisory-default is also the philosophically coherent choice (cultivate reasoning, don't coerce).
- **Credential honesty — ADOPTED, carry as settled design (not an open question):** Sage Assent's credential carries a `coverage_status` field (`status: continuous | suspended | resumed_unverified`, `monitored_since`, `gap_present`, `gap_duration`, `credential_basis`); the credential goes **`suspended`** on guardrail-off and **`resumed_unverified`** on return, requiring a **fresh SageReasoning pass** before it is valid. A dated, scoped verdict, not binary pass/fail (R18f). **Keep this wording aligned with the Session-1 no-practice disclaimer — same honesty principle.** Note: implementing the `coverage_status` field is itself a Sage Assent output-schema change → **code-elevated/critical when built**, a separate session.
- **Dashboard (Cowork artifact):** the six panels from the 2026-05-25 brainstorm — (1) hook on/off toggle; (2) agents + scores *reusing `agent_accreditation`*, surfacing `coverage_status`; (3) guardrail cost/time (own cost easy; total session partial); (4) loop/cost detection (= R5; can auto-pause); (5) config presets (Observe-only / Guard consequential / Strict / Off); (6) best-effort "running now + config" from `Task`-spawn + `SubagentStop` events.
- **Scale posture (assumption, not bespoke build):** portable carried credential (central persistence only for the certified subset) + decoupled async accreditation write + aggregate-not-raw. Don't bake the single-instance design into the spec.
- **Privacy/consent (R16/R17):** the hook sends planned actions (incl. code) to `/api/reason` — explicit consent; deletion (R17c) at scale.
- **Safe test rollout:** throwaway sandbox dir, never the real repo or production; test-env `/api/reason`.
- Output = the spec; it spawns its own build sessions. Reference `D-SAGE-PRACTICE-DIRECTION-COVERAGE-STATUS-2026-05-26` + the 2026-05-26 exploration close.

---

## Locked context — do NOT re-derive

- **Adopted 2026-05-26 (`D-SAGE-PRACTICE-DIRECTION-COVERAGE-STATUS`):** the **Sage Practice** name (4-product suite); the `coverage_status` / `suspended` / `resumed_unverified` honest-credential design.
- **Findings recorded (not all adopted):** guardrails need **hooks** not the anchor file (F1); products built, distribution layer unproven (F2); scaling — `evaluated_actions` firehose + read-amplification, **inference cost the dominant ceiling**, handle via decouple/aggregate/tiered-portable-identity/shard/retention (F4); distribution — many channels, three packaging granularities, Sage Practice = the *platform* packaging (F5). **Distribution go-to-market NOT elected — recommendations only** (MCP as keystone; layer channels; one spine; advisory-default; target quality buyers; scale posture). See the entry.
- **Positive matrix L1–L7 — Verified live** (`data-room/05_outputs/`: `L1/L2/L3/L5/L7-live-*` + `L2-complete-live-*`, `L4-live-*`, `L6-live-*`). **Combination 1** — passing in production (R18f gate Live).
- **Production UNTOUCHED.** Provenance gate Live; `/api/reason` byte-identical to pre-A7.
- **Local dev is on PRODUCTION** (`.env.local` restored from `.env.local.prod-backup-2026-05-24`; 0 test refs / 1 prod ref). **No one-line "restore test" backup** — Sessions 2 and 3 must re-point `.env.local` per `/data-room/04_test_brief/test-env-standup-checklist.md`, restart the dev server, confirm `GET http://localhost:3000/api/public-key` → `key_id: substrate-layer2-test`. **Sessions 1 and 4 need no test env.** Return to prod: `cp website/.env.local.prod-backup-2026-05-24 website/.env.local`.
- **Standing test env** (2026-05-25): test Supabase `iwdtrvuphogkwmovhnvz`; test Ed25519 key-pair; two seeded credentials (`WSH_*` from `scripts/whole-system-harness/mint-test-credentials.ts`); A1 columns present; `SUBSTRATE_R20A_GATE_ENABLED` UNSET (Session 2 turns it on, under the Critical protocol).
- **Harness `lib/` proven — reuse, don't rebuild** (PR15): `http-client`, `reflect-driver`, `bridge-step`, `calling-driver`, `discovered-purpose-asserts`, `assertions`, `capture`, `fixtures`, `scenario-input`; runners `run-l1/2/3/5/7` + `run-l2-complete/4/6`.
- **Verify with `npx tsc --noEmit`** (full project; the pre-commit + Vercel check), not only `npx tsx`. Live runs reach localhost:3000, which the build sandbox cannot — live runs + the `Verified` stamp are the founder's between-session step (0c).
- **Branch:** `main`. The AI does **no** git operations; stage by name (never `git add .`; never stage `website/.env.local*` or `website/tsconfig.tsbuildinfo`); clear any `.git/index.lock` host-side.

## Rollback

Session 1 + 4 are additive docs/scaffolding (delete host-side if abandoned; nothing deployed). Session 2's rollback is unsetting `SUBSTRATE_R20A_GATE_ENABLED` in TEST. Session 3 is additive test scaffolding. Restore production local dev when test work is done.

## Forecast

Completing this queue closes the whole-system test's remaining coverage (negative + distress + the comparison rig), so 0h's value-demonstration is evidence-backed end-to-end — and you arrive at the **Sage Practice** spec (Session 4) with the value proof, the reusable scores, the safety story, and the adopted honest-credential design already in hand. The spec then spawns its own build sessions, slotted into the priority stack at your discretion.

End of prompt. Opens on `main`. Production is unchanged at session open; Sessions 2–3 re-point `.env.local` at the test project first (no one-line restore exists); Sessions 1 and 4 need no test env.
