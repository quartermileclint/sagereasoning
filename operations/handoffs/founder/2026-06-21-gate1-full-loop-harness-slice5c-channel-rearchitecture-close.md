# Session Close — 2026-06-21 — Gate-1 Full-Loop Harness (Slice 5c): the channel-law re-architecture (built, repo-only)

**Stream:** founder.
**Governing frame:** /adopted/standing-protocol-cache.md (§Critical-risk sessions) + `adopted/adr/2026-06-20-pre-decision-harness-arc2.md` (ADR-011, the 2026-06-21 Slice-5b channel-law amendment + the new Slice-5c build-status note).
**Tier:** `code-critical` (AC7 + PR6 engaged) — but **built repo-only / dark this session; NO net production change by the AI** (the AI performed no Vercel/Supabase/git/mint op). The AC7 live-fire is the founder-walked test loop, NOT performed this session.
**Date:** 2026-06-21.

## What happened
Resolved the five founder open questions (AskUserQuestion — all as recommended: keep reflect by decomposing onto the channel law; ship egress with install-time disclosure+consent; approve+build `context_source`; opt-out via `GATE1_REFLECT_TURN_ENABLED`; approve the public-claim narrowing), then **built the Slice-5c channel-law re-architecture** of H3/H4 + the additive `context_source` reflect-contract field + the public-claim narrowing + the egress/erasure disclosure. All repo-only/dark; the hooks stay registered-but-not-installed; gates green; adversarially reviewed (6/7 CLEAN).

**The three channels (the build):**
- **ENFORCE** — H3 guard-deny (unchanged); H4 forces **one in-conversation review turn** via a **pure invitation** (no endpoint/POST/credential), gated on `GATE1_REFLECT_TURN_ENABLED` (default on).
- **INSTRUMENT** — H4 accreditation write (unchanged, never the marker credential); the H3 consult **fetch** kept as the sole R18f provenance source (frame tail stripped, fetch never); NEW **`persistReflection()`** POSTs the agent's **verbatim** reflection out-of-band on the `stop_hook_active===true` turn (`last_assistant_message`), or honest **"not performed"** — **dark by default**, never hook-authored.
- **ADVISE** — H1/H2/H3 frames kept; the H3 imperative outbound tails stripped (advisory only; a capable agent may discount the frame — desirable).

**The `context_source` field (its own 0c-ii sub-gate):** additive optional `'agent_stated' | 'harness_inferred'` on `/api/practice/reflect`, persisted to a new nullable `sage_reflect_sessions.context_source` column. Absent ⇒ null ⇒ byte-identical for every existing caller. The harness marks its inferred open `harness_inferred` so the record is never misread as agent-stated.

**Public-claim narrowing (R18, live on push):** `llms.txt` / `agent-card.json` / api-docs `pre_decision_harness` now attests narrowly (frame injected pre-decision + irreversible actions guarded + a reflection turn fired & observed + the credential rests on genuinely-accumulated signed assessments) — never "the agent reasons from the frame" / "a sincere Q1–Q6 completed". `context_source` documented; the ADR over-claim corrected in lockstep.

## Decisions Made
- `D-SAGE-PRACTICE-GATE1-FULL-LOOP-HARNESS-SLICE5C-CHANNEL-REARCHITECTURE-BUILT-TEST-VERIFIED` appended.

## Status Changes
| Item | Old | New |
|---|---|---|
| Full-loop cooperation half | Re-architected (Designed) — Slice 5b | **Built repo-only / dark (Slice 5c)** — battery 56/0, 124/0 |
| H3 SCORE frame imperative outbound tails | present | **stripped** (advisory only; the consult fetch kept, marked credential-critical) |
| H4 reflect turn | server-open + Q1–Q6 POST instruction | **pure in-conversation invitation** (no endpoint/POST/credential) |
| H4 `persistReflection()` | n/a | **built (out-of-band, verbatim-or-not-performed, dark by default)** |
| `/api/practice/reflect` `context_source` field | absent | **built** (additive; migration + parse + persist; byte-identical absent ⇒ null) |
| public `pre_decision_harness` claim | "so the agent reasons from it" | **narrowed** to the enforceable channels (live on push) |

## Verification Method Used
In-sandbox gates (`logic-harness` 56/0; `negative-battery` 124/0 — RELEASE GATE PASS, close 37 / at-action 31); reflect unit tests (`request-helpers` 17/0 incl. `context_source`; `session-store` 34/0; `reflect-service` 28/0; `reflect-completion-schema-drift` 9/0); `tsc --noEmit` 0; `npm run build` 0 (`/api/practice/reflect` + `/api-docs` registered); `agent-card.json` parses (14 extensions). First-hand: the harness reflect-open payload passes the real `parseSessionSummary`/`parseReflectBody` (not just the mock). A **7-dimension / 13-agent adversarial workflow** with an adversarial verify stage per medium+ finding: **6/7 CLEAN**; the one FINDINGS dimension (egress/erasure) = the pre-existing, disclosed reflect-row erasure follow-up (verifier: "defensible"); folds applied (public `context_source` docs + maintainer comments at the erase sites). The AI performed no Vercel/Supabase/git/mint operation.

## Risk Classification Record
**Critical** under 0d-ii (AC7 + PR6): a public reflect-contract change + a re-install/live-fire setup + a data-egress disclosure on the trust surface. **Repo-only / dark this session** — on the founder's push the R18 docs go live + the additive reflect-route code deploys (byte-identical for existing callers); the migration is founder-applied (its own 0c-ii sub-gate); the hooks stay registered-but-not-installed; `SAGE_GATE1_REFLECT_PERSIST_ENABLED` unset (no egress). R18f/R20a/distress/Layer-2 signing/UPC auth untouched.

## PR5 Knowledge-Gap Carry-Forward
- **The channel law holds at the build level** (memory `gate1-harness-channel-law`): every load-bearing step is out-of-band (guard-deny, accred-write, persistReflection); the frame + reflect turn are advisory/in-task. The Slice-5b live finding (a capable agent refuses an injected outbound-action instruction) is now designed around, not fought.
- **The reflect-store genuine-deletion functions (`deleteAgentSessions`/`deleteSession`/`sweepExpiredSessions`) are built but UNWIRED** — not in `/api/user/delete`, `/api/credential/erase`, or any cron. A **pre-existing** gap (reflect Live since 2026-06-18), now disclosed at the code sites + in the README + ADR. **Wiring it is the prerequisite for any STANDING `persistReflection` activation.**
- **`/api/practice/reflect` accepts the harness payloads as-is** — `circle_at_open:"community"` is a valid enum; the open + verbatim-answer both pass validation. `context_source` must be live on the endpoint BEFORE persist opens a server session (else the inferred summary reads as agent-stated).

## Blocked On
**Files remaining uncommitted (repo) — the founder commits + pushes:**
- Harness: `harness/gate1-pre-decision/claude-code/hooks/at-action-hook.mjs`, `close-hook.mjs`; `test/logic-harness.mjs`, `test/negative-battery.mjs`; `README.md`; NEW `claude-code/SLICE5C-LIVE-VERIFY-WALKTHROUGH.md`.
- Reflect contract: `website/src/app/api/practice/reflect/request-helpers.ts`, `route.ts`; `website/src/lib/sage-reflect/reflect-service.ts`, `session-store.ts`; tests `__tests__/request-helpers.test.ts`, `__tests__/session-store.test.ts`; NEW `website/supabase-sage-reflect-context-source-migration.sql`.
- Public surfaces (live on push): `website/public/llms.txt`, `website/public/.well-known/agent-card.json`, `website/src/app/api-docs/page.tsx`.
- Erasure-gap comments: `website/src/lib/consumer-erasure.ts`, `website/src/app/api/user/delete/route.ts`.
- ADR + log + this close + CLAUDE.md: `adopted/adr/2026-06-20-pre-decision-harness-arc2.md`, `operations/decision-log.md`, this file, `CLAUDE.md`.

**Production state at session close:** **byte-equivalent** (the AI changed no Vercel/Supabase/flag/credential). On the founder's push: the docs go live (R18); the additive reflect-route code deploys (absent `context_source` ⇒ null, byte-identical); **the `context_source` migration is founder-applied** (TEST→prod, its own 0c-ii sub-gate); the hooks stay registered-but-not-installed; persist is dark. The standing `pre_decision_harness` dogfood marker + the LIVE H1/H2 install are untouched.

## Open Questions
None blocking the commit. Carried (founder-walked): the `context_source` migration + reflect-route deploy (sequence BEFORE persist is ever enabled); the live-fire test loop (`SLICE5C-LIVE-VERIFY-WALKTHROUGH.md`); and the named follow-up — wiring reflect-row erasure (`deleteAgentSessions` → `/api/user/delete` + `/api/credential/erase` + a retention cron) before any STANDING persist activation.

## Founder Verification (Between Sessions)
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
node harness/gate1-pre-decision/test/logic-harness.mjs        # 56 passed, 0 failed
node harness/gate1-pre-decision/test/negative-battery.mjs      # 124 passed, 0 failed — RELEASE GATE: PASS ✓
( cd website && npx tsc --noEmit && npm run build )            # tsc 0; build ✓ (/api/practice/reflect + /api-docs registered)
( cd website && npx tsx src/app/api/practice/reflect/__tests__/request-helpers.test.ts )   # 17 pass / 0 fail
node -e "require('./website/public/.well-known/agent-card.json'); console.log('agent-card OK')"
git add harness/gate1-pre-decision website/src/app/api/practice/reflect website/src/lib/sage-reflect \
        website/src/lib/consumer-erasure.ts website/src/app/api/user/delete/route.ts \
        website/supabase-sage-reflect-context-source-migration.sql \
        website/public/llms.txt website/public/.well-known/agent-card.json website/src/app/api-docs/page.tsx \
        adopted/adr/2026-06-20-pre-decision-harness-arc2.md operations/decision-log.md CLAUDE.md \
        operations/handoffs/founder/2026-06-21-gate1-full-loop-harness-slice5c-channel-rearchitecture-close.md
git commit -m "Gate-1 Full-Loop Harness Slice 5c: H3/H4 re-architected onto the channel law (imperative outbound tails stripped; reflect turn = pure in-conversation invitation; persistReflection out-of-band, dark, verbatim-or-not-performed) + additive context_source reflect field + public pre_decision_harness claim narrowed; battery 56/0, 124/0; adversarially reviewed (6/7 clean); repo-only/dark"
```
Then push via GitHub Desktop. **The docs (`llms.txt` / `agent-card.json` / `api-docs`) go live on the push** (R18). **The `context_source` migration is a separate founder-applied step** (`website/supabase-sage-reflect-context-source-migration.sql` — TEST then prod; sequence it BEFORE enabling persist anywhere). No Vercel behaviour flips on the push (the reflect-route code is additive/byte-identical; nothing reads a new flag).

## Orchestration Reminder
Nothing is live to deactivate — the build is repo-only/dark; the hooks are registered-but-not-installed; `SAGE_GATE1_REFLECT_PERSIST_ENABLED` is unset. The standing marker + H1/H2 run unchanged in the founder's main loop. **Next** (founder-walked, `code-critical`/AC7): apply the `context_source` migration + the live-fire test loop per `SLICE5C-LIVE-VERIFY-WALKTHROUGH.md`. **Before any STANDING persist:** wire reflect-row erasure (the named follow-up). The **0h launch call remains the founder's**.

## Cross-references
- `operations/handoffs/founder/2026-06-21-gate1-full-loop-harness-slice5c-channel-rearchitecture-NEXT-SESSION-PROMPT.md` (this session's prompt)
- `operations/handoffs/founder/2026-06-21-gate1-full-loop-harness-slice5b-activation-close.md` (predecessor)
- `harness/gate1-pre-decision/claude-code/SLICE5C-LIVE-VERIFY-WALKTHROUGH.md` (the founder-walked live-fire)
- `adopted/adr/2026-06-20-pre-decision-harness-arc2.md` (ADR-011, the Slice-5c build-status note)
- decision-log: `D-SAGE-PRACTICE-GATE1-FULL-LOOP-HARNESS-SLICE5C-CHANNEL-REARCHITECTURE-BUILT-TEST-VERIFIED`
- memory: `gate1-harness-channel-law`

*End of session close. The full-loop harness's cooperation half is re-architected onto the channel law + built repo-only (battery 56/0, 124/0; adversarially reviewed, 6/7 clean). Production byte-equivalent; the docs + additive reflect code go live on the founder's push; the migration + live-fire are founder-walked next steps; the standing marker + H1/H2 untouched.*
