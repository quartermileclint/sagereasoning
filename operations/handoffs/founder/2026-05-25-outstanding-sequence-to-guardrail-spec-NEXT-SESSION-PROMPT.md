# Next-Session Prompt — Outstanding Work Sequence → Guardrail + Dashboard Spec

**Supersedes:** `/operations/handoffs/founder/2026-05-25-whole-system-next-scope-NEXT-SESSION-PROMPT.md` (the earlier election-style prompt). This sequenced version replaces it — delete the earlier file when convenient.
**Stream:** founder.
**Tier:** varies per queue item (declare at each session's open). Session 1 = `governance`/Standard; Session 2 (C2) = **`code-critical`**; Session 3 = `code-standard`; Session 4 (spec) = `governance`/Standard.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Predecessor close:** `/operations/handoffs/founder/2026-05-25-L2complete-L4-L6-finish-positive-scenarios-build-close.md` (read it + its **Verification Outcome** addendum).
**Predecessor decision-log entry:** `D-L2COMPLETE-L4-L6-POSITIVE-SCENARIOS-BUILD-2026-05-25` (read its **Verification** update).

## How to use this prompt

The positive matrix L1–L7 is complete and Verified live, and Combination 1 is passing in production. This prompt **sequences the remaining whole-system-test work in dependency order**, ending with drafting the guardrail + dashboard product spec. Work the queue **top-down — each row is its own session.** The immediate next session is **Session 1**, scoped in full below; Sessions 2–4 are scoped in brief and expand into their own prompts when reached. The order is a recommendation with the dependency logic shown — you can re-order, but Session 1 clears a hard dependency and is the natural, lowest-risk start.

## The sequence (work top-down)

| # | Session | Tier / risk | Must-come-first dependency | Delivers |
|---|---|---|---|---|
| 1 | **Priority 4 disclaimer + Combination 2** | `governance` / Standard | **HARD** — the disclaimer text must exist before Comb 2 can assert it | completes the negative-scenario coverage |
| 2 | **C2 — R20a distress perimeter across the loop** | **`code-critical`** (full Critical Change Protocol) | independent; completes the safety story / last scenario type | distress caught + redirected at each product entry |
| 3 | **Control-vs-treatment rig** (substrate ON vs OFF) | `code-standard` | best after the matrix is complete (so it covers real scenarios) | the value evidence — "is the agent better *with* the substrate?" (0h criterion 4) |
| 4 | **Guardrail + dashboard SPEC** (design only) | `governance` / Standard | best after #3 — the comparison is the guardrail's value justification; reuses the proven agent scores + the C2 safety story | the one-page spec that then spawns its own build sessions |
| — | Option B (admin-gate fidelity) — *optional* | `code-standard`/`elevated` | none | higher-fidelity backfill of L2-complete/L4/L6; can be dropped |

**Why the spec is last:** it's a new product workstream. Drafting it after the test arc closes means it's grounded in evidence (the comparison rig in #3 is the "why would anyone install this" proof) and reuses already-verified pieces (the agent scores in `agent_accreditation`; the distress perimeter from #2). Nothing *technically* blocks drafting it earlier — but finishing the in-flight test arc first is the disciplined order, and it's what you asked for.

## Where this sits in the formal priority stack (context, not scope)

This queue finishes the **P0 0h hold-point** (the whole-system test). The formal priorities above it — **P1 Business Plan Review, P2 Ethical Safeguards**, etc. — remain *your* call on when 0h closes and P1 begins. The guardrail + dashboard is a candidate product direction (Agent Trust Layer / plugin arc, ~P3); its spec (Session 4) is **exploration to be slotted into the priority stack by you**, not an automatic jump ahead of P1+.

---

## ── START HERE: Session 1 — Priority 4 disclaimer + Combination 2 ──

**Why:** Combination 2 is the last negative scenario. It's documentation-gated and blocked only on the no-practice disclaimer text existing. Write that text, place it on the surfaces, then assert it — done. Lowest risk; **needs no test env**.

**Pre-conditions:**
1. On `main`; working tree clean.
2. No test env needed (content + a doc-grep over repo / served surfaces).
3. **Resolve the cross-reference at open:** the test-brief §A.3 labels the disclaimer "the Priority 4 output," but the project-instructions Priority 4 is *Stripe* — the disclaimer likely belongs to **P2 2e** (honest positioning / limitations page, R19c/d). Confirm which before writing, so the decision-log entry cites the right priority.

**Part A — open under the protocol (read order):**
1. `/adopted/standing-protocol-cache.md` (~3 min — tier, status vocabulary, risk class, lean templates).
2. `/adopted/build-sessions-protocol-cache.md`.
3. The predecessor close named above (+ Verification Outcome).
4. `data-room/04_test_brief/test-brief.md` §A.2 (Combination 2) + §A.3 (the disclaimer) + `data-room/04_test_brief/scenario-matrix.md` (Comb 2 row).
5. The surfaces the disclaimer must appear on: `website/public/llms.txt`, `website/public/agent-card.json` (confirm exact paths), the limitations page source (`sagereasoning.com/limitations`), and the developer docs.
6. `/manifest.md` — R18f + R19c/d/e (honest positioning) — the rules the disclaimer serves.
Confirm: tier (`governance`/Standard); branch; status vocabulary. **PR15 consult** (extend the existing harness pattern for the grep runner; no framework).

**Part B — procedure:**
1. **Draft the no-practice disclaimer text** — plain-language, accurate: this config (Reasoning + Assent, no Reflect) is legitimate single-session credentialing; it does **not** constitute an ongoing "practice." Per test-brief §A.3. **Founder approves the wording** (it's governing public-facing text → explicit approval before it lands).
2. **Place it on each surface** where the config is offered: developer docs, `llms.txt`, `agent-card.json`, limitations page.
3. **Build `run-comb2.ts`** (or a doc-grep step on the proven harness pattern) asserting the disclaimer string is present + non-empty on every surface.
4. **Verify (PEV, PR10):** `npx tsc --noEmit` if any TS is added; the doc-grep asserts presence; founder eyeballs the wording on each surface.
5. **Decision-log entry (lean)** + **session close (lean)**. Update the scenario-matrix Comb 2 row + test-brief §A.2/§A.3 status to "runnable / passing."

**Founder verification:** open each surface and confirm the disclaimer reads correctly; run the doc-grep → expect PASS (string present on all surfaces).

---

## Sessions 2–4 (expand into their own prompts when reached)

**Session 2 — C2: R20a distress perimeter (Critical).** Enable `SUBSTRATE_R20A_GATE_ENABLED` in the TEST env **under the full Critical Change Protocol (0c-ii), visibly** (what changes / what could break / session impact = N/A founder+test only / rollback = unset the flag / verification / explicit approval to the named risks). Build `run-c2.ts` submitting a distress-signal input at each product entry; assert the redirect / pass-through statement appears (synchronous safety check, PR3; **PR6 applies throughout**; PR1 — prove on one route first, reach Verified, then the rest). Needs the test env re-pointed. Rollback = unset the flag (production never touched).

**Session 3 — control-vs-treatment rig.** Parameterise the runners (or a new `run-compare.ts`) to execute a scenario with the substrate ON vs OFF (the `SUBSTRATE_LAYER3_ENABLED` / signing / gate flags); capture both outputs side-by-side into a ledger; define "better with the substrate" as an assertion or a founder-readable diff. The 0h criterion-4 value demonstration **and** the evidence base for the guardrail product. `code-standard`; needs the test env.

**Session 4 — guardrail + dashboard SPEC (design only — no build).** Produce a one-page spec: a **PreToolUse hook → `/api/reason`** gating *consequential tools only* (selectivity — the cost/latency control); **advisory / log-only first** (fail-open + a timeout budget; never brick a session); single-tool proof first (PR1). A **Cowork dashboard artifact** with the six panels from the 2026-05-25 brainstorm — (1) hook on/off toggle; (2) agents + current scores *reusing `agent_accreditation`*; (3) guardrail cost/time (own cost easy; total session cost only partial); (4) loop/cost detection (= R5 cost-health alerts; can auto-pause); (5) config presets (Observe-only / Guard consequential / Strict / Off); (6) best-effort "running now + config" reconstructed from `Task`-spawn + `SubagentStop` events. Include the **privacy/consent line** (the hook sends planned actions — incl. code — to `/api/reason`; R16/R17) and the **safe test rollout** (throwaway sandbox dir, never the real repo or production; test-env `/api/reason`). Output = the spec; it then spawns its own build sessions. (Background: the 2026-05-25 exploration turn that produced the dashboard mockup + the CLAUDE.md-vs-hooks finding — hooks are the deterministic gate, CLAUDE.md is soft, skills are model-discretion.)

---

## Locked context — do NOT re-derive

- **Positive matrix L1–L7 — Verified live** (ledgers in `data-room/05_outputs/`: `L1/L2/L3/L5/L7-live-*` + `L2-complete-live-*`, `L4-live-*`, `L6-live-*`). **Combination 1** — passing in production (R18f gate Live, 2026-05-24).
- **Production is UNTOUCHED.** Provenance gate Live; `/api/reason` byte-identical to pre-A7 cutover.
- **Local dev is on PRODUCTION now** (`.env.local` restored from `.env.local.prod-backup-2026-05-24`; 0 test refs / 1 prod ref). **There is NO one-line "restore test" backup.** Any scope needing the TEST env (Sessions 2 and 3) must **re-point `.env.local` per `/data-room/04_test_brief/test-env-standup-checklist.md`** first, restart the dev server, and confirm `GET http://localhost:3000/api/public-key` → `key_id: substrate-layer2-test`. **Sessions 1 and 4 need no test env.** Return to prod: `cp website/.env.local.prod-backup-2026-05-24 website/.env.local`.
- **Standing test env** (rebuilt 2026-05-25): test Supabase `iwdtrvuphogkwmovhnvz`; test Ed25519 key-pair; two seeded `api_keys` / `sr_assent_` credentials (`WSH_*` from `scripts/whole-system-harness/mint-test-credentials.ts`); A1 `sage_reflect_sessions` columns present; `SUBSTRATE_R20A_GATE_ENABLED` intentionally UNSET (Session 2 turns it on, under the Critical protocol).
- **The harness + `lib/` are proven — reuse, don't rebuild** (PR15): `lib/http-client.ts`, `reflect-driver.ts`, `bridge-step.ts`, `calling-driver.ts`, `discovered-purpose-asserts.ts`, `assertions.ts`, `capture.ts`, `fixtures.ts`, `scenario-input.ts`; runners `run-l1/2/3/5/7` + `run-l2-complete/4/6`.
- **Verify with `npx tsc --noEmit`** (full project — the pre-commit + Vercel check), not only `npx tsx` (which strips types). Live runs reach localhost:3000, which the build sandbox cannot — live runs + the `Verified` stamp are the founder's between-session step (0c).
- **Branch:** `main`. The AI does **no** git operations; stage by name (never `git add .`; never stage `website/.env.local*` or `website/tsconfig.tsbuildinfo`); clear any `.git/index.lock` host-side.

## Rollback

Per session: Session 1 + 4 are additive docs/scaffolding (delete host-side if abandoned; nothing deployed). Session 2's rollback is unsetting `SUBSTRATE_R20A_GATE_ENABLED` in TEST (production never touched). Session 3 is additive test scaffolding. Restore production local dev when test work is done (command above).

## Forecast

Completing this queue closes the whole-system test's remaining coverage (negative + distress + the comparison rig), so 0h's value-demonstration is evidence-backed end-to-end — and you arrive at the guardrail + dashboard spec (Session 4) with the value proof, the reusable scores, and the safety story already in hand. The spec then spawns its own build sessions, slotted into the priority stack at your discretion.

End of prompt. Opens on `main`. Production is unchanged at session open; Sessions 2–3 re-point `.env.local` at the test project first (no one-line restore exists); Sessions 1 and 4 need no test env.
