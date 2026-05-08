# Session Close — 2026-05-08 — Sub-session M1-CP6 post-audit: consumer audit + `/api/keys` fix + Test 7 validation

**Stream:** founder.
**Governing frame:** /adopted/session-opening-protocol.md (cached via /adopted/standing-protocol-cache.md). Critical Change Protocol per project instructions §0c-ii applied at the parent M1-CP6 cutover (recorded in `/operations/handoffs/founder/2026-05-08-M1-CP6-close.md`); Elevated discipline applied to the `/api/keys` fix this sub-session (per cache §"Risk classification (0d-ii) defaults" — changes to existing user-facing functionality).
**Tier:** code-elevated — Elevated risk under 0d-ii for the `/api/keys` fix (existing user-facing endpoint repaired). Audit and Test 7 themselves: Standard risk (read-only consumer mapping + agent contract verification).
**Date:** 2026-05-08 (continuation of the same calendar-day session as M1-CP6 cutover).
**Predecessor close:** `/operations/handoffs/founder/2026-05-08-M1-CP6-close.md` (M1-CP6 cutover proper). This close extends that one — does not replace it.

## Why this sub-session exists

After the M1-CP6 cutover was applied + verified (4/4 verifications passed), the founder asked for a consumer audit naming what human-user and agent-user products call `/api/reason` and how to test each. The audit surfaced eight consumers across browser pages, the agent contract, public discovery files, and skill wrapper templates. Attempts to run Test 7 (the agent-contract curl with API-key auth — the load-bearing post-cutover validation since it exercises the `validateApiKey` path that Verifications 1–4 did not touch) revealed a pre-existing 500 bug in the `/api/keys` POST endpoint that prevented API key generation. The bug was diagnosed (column-name mismatch + missing NOT NULL field), fixed, deployed, verified live. Test 7 was then run successfully; the agent contract is verified. The audit also surfaced four additional pre-existing bugs and one transient browser-side issue, all captured as carry-forwards for the next session.

## Decisions Made

- **`D-M1-CP6-POST-AUDIT-2026-05-08`** (to be appended to active decision log if founder elects — not yet appended at this close; Elevated-tier discipline allows lean form per cache §"Lean decision-log entry"; could also be folded as an addendum to the predecessor `D-M1-CP6-CUTOVER-2026-05-08` entry). Captures: consumer audit performed (8 consumer types categorised — 6 human-facing + 2 agent-facing); `/api/keys` POST bug diagnosed (column-name mismatch `user_id` → `owner_user_id` per schema; missing NOT NULL `key_prefix` field per schema line 21–22) + fixed via single-file edit (`replace_all` for column rename + add `key_prefix: rawKey.slice(0, 14)` per schema-documented format); deployed (Vercel green); validated via console snippet (key generated successfully) + Test 7 curl (full sandwich response with all six top-level fields per ADR-004 §2.1, latency 26.7s within tolerance, AC-13 Tier 2 STATED_OPERATIVE_CONFLICT soft-clarification surfaced live as bonus signal); five carry-forwards captured for next session (named in §"Open Questions" below).

## Status Changes

| Item | Old | New |
|---|---|---|
| `/api/keys` POST endpoint | Wired but broken (pre-existing column-name + missing NOT NULL bugs; never inserted a row prior) | **Live** (fix deployed; key generation verified via console snippet) |
| `/api/keys` GET endpoint (api_keys query) | Wired but broken (same column-name bug) | **Live** for the api_keys query (fixed via same `replace_all`); `api_key_usage` column-name issue remains separate carry-forward (item 2 below) |
| `/api/keys` DELETE endpoint | Wired but broken (same column-name bug) | **Live** (fixed via same `replace_all`) |
| Test 7 agent contract (curl with API key) | Wired but blocked (couldn't generate key) | **Verified** (full translation-sandwich-v1 response confirmed live; both auth paths — session via `requireAuth` and API-key via `validateApiKey` — verified post-cutover) |
| AC-13 Tier 2 STATED_OPERATIVE_CONFLICT soft-clarification mechanic | Wired (M1-CP4b/4c work) | **Verified live** in Test 7 response (`prose.soft_clarification_prose` populated; `intake_clarifications.soft_clarifications` carries the trigger) |
| `/api/usage/route.ts` line 43 | Unknown — assumed Live | **Wired but broken** (same `user_id` → `owner_user_id` column-name bug as `/api/keys`; surfaced during audit; not fixed this sub-session) |
| `/api/keys` GET api_key_usage join | Unknown — assumed Live | **Wired but broken** (queries `monthly_total` + `daily_total` columns that don't exist on `api_key_usage` table per schema; actual columns are `total_calls`, etc.; affects usage display in list response only; not fixed this sub-session) |

## Next Session Should

**Founder elects at next-session-open from the open-agenda candidate items in `/operations/handoffs/founder/2026-05-08-NEXT-SESSION-PROMPT.md`.** That file is updated in this sub-session to add **Item I — Post-cutover hygiene + auth-path restoration** which bundles the five carry-forwards captured below.

The original M1-CP6 close's "Next Session Should" guidance still stands: M1 arc is complete; no immediate next-session is required; the founder may also elect to stabilise and pause. Item I joins the candidate list as one of nine options the founder may elect.

## Blocked On

**Files committed during this sub-session (via the founder's earlier commits):**
- `/website/src/app/api/keys/route.ts` — `/api/keys` fix committed + pushed; Vercel green; verified live.

**Files to commit at this sub-session close (alongside the M1-CP6 close + decision-log + next-session prompt files that were pending from the parent sub-session):**
- `/operations/handoffs/founder/2026-05-08-M1-CP6-post-audit-close.md` — this file.
- `/operations/handoffs/founder/2026-05-08-NEXT-SESSION-PROMPT.md` — updated with Item I (modified in place).
- `/operations/handoffs/founder/2026-05-08-M1-CP6-close.md` — predecessor close (was pending commit at end of parent sub-session).
- `/operations/decision-log.md` — D-M1-CP6-CUTOVER-2026-05-08 entry from parent sub-session (was pending commit). Founder may also elect to append a brief Elevated lean entry for the `/api/keys` fix (`D-M1-CP6-POST-AUDIT-2026-05-08`); not produced this sub-session — would be a Standard governance addition next session.

**Production state at this sub-session close:**
- **Vercel deployment:** GREEN. Two cutover-related deploys this calendar day: (a) M1-CP6 cutover commit (sandwich is sole user-facing path on `/api/reason`); (b) `/api/keys` fix commit (POST/GET/DELETE column-name correction + key_prefix added). Both verified live.
- **Supabase `supabase-us`:** unchanged schema. No DB DML this sub-session. The fix corrected the route code to match the existing schema (no migration needed).
- **Env flags:** unchanged from parent sub-session (`TRANSLATION_SANDWICH_PARALLEL_RUN` = `1` Production; `TRANSLATION_SANDWICH_TIER1_SECRET` SET in Production + Preview + Development).
- **AC4 / AC5 / AC7:** AC4 + AC5 still preserved (R20a perimeter unchanged across both cutover commits). AC7 NOT engaged.
- **Rules engaged this sub-session:** R0 (the principled fix-the-broken-endpoint serves Circles 3 + 4 — agent developers can now use the contract; founder can manage their own keys); R5 (cost monitoring lapse on `/api/reason` flagged as separate carry-forward, item 6 below); R7 (source fidelity preserved — Test 7 response held the seven Revisions + Amendment 4 prose discipline); R8a + R8c (controlled vocabulary + English-only on user-facing prose preserved — Greek terms glossed in Test 7 response). NOT engaged: AC4, AC5, AC7, AC8 (sandwich engine surface unchanged), PR3, PR4, PR6 (the `/api/keys` fix touched neither auth nor R20a perimeter — Critical Change Protocol NOT engaged for that fix).
- **Cost incurred this sub-session (founder-side):** ~$0.05 single Test 7 LLM call (Layer 1 + Layer 3 Sonnet at the standard ~$0.034/req baseline plus rounding).

## Open Questions

(The eight items from the predecessor M1-CP6 close still apply — Q3 + Q4 + F4 soft miss + identified_value_errors null + causal-stage sample bias + Q5 schema-vs-prompt drift + 2F deferred decision + cost monitoring lapse on /api/reason. Restated briefly below + the five new audit-surfaced carry-forwards.)

**Carried from M1-CP6 close (8 items):**
1. Q3 — F8 SCOPE_AMBIGUITY non-fire (Layer 1/Tier 1 detector concern).
2. Q4 — L3 latency monotonic creep (watch threshold 20,000 ms; flag at 25,000 ms).
3. F4 soft miss — Revision 5 input-condition heuristic violation (founder accepted as known limitation).
4. `value_assessment.identified_value_errors` null observation (Layer 2/3 audit needed).
5. Causal-stage sample bias (sample-size question).
6. Q5 schema-vs-prompt drift extended to non-SQL surfaces (line-number drift in M1-CP6 prompt — not promoted to PR yet).
7. 2F architectural arc — deferred decision per PR7; brainstorm-continuation prompt at `/operations/handoffs/founder/2026-05-08-2F-CP0-BRAINSTORM-NEXT-SESSION-PROMPT.md`.
8. Cost monitoring lapse on `/api/reason` (sandwich production path has no cost tracking post-cutover; R5 monitoring blind).

**Newly surfaced this sub-session (5 carry-forwards):**

9. **`/api/usage/route.ts` line 43 — same `user_id` → `owner_user_id` bug.** Single-character fix matching the one applied to `/api/keys` this sub-session. Pre-existing; was broken before, still broken after. Same Elevated-tier discipline. Estimated 5 min code change + commit + verify.

10. **`/api/keys` GET api_key_usage column-name mismatch.** Line 40 queries `monthly_total` + `daily_total` columns; actual columns on `api_key_usage` table are `total_calls`, `guardrail_calls`, `score_iterate_calls`, `agent_baseline_calls`, `other_calls` (plus `daily_total` may exist as separate counter — needs schema verification). Affects usage-display in list response only; doesn't affect key creation. Standard or Elevated tier depending on scope. Estimated 15–30 min code review + fix.

11. **`/private-mentor` + `/mentor-hub` + `/ops-hub` plain `fetch()` → `authFetch` migration.** Pre-existing bug documented in `/admin/test-reason/page.tsx` lines 11–14: "the existing UI pages that call /api/reason all use plain fetch() rather than authFetch — which means /api/reason rejects them with 'Authentication required'." Three pages × ~5 LOC each = trivial diff; single commit; deploy. Standard tier (additive — restoring intended behaviour). Estimated 30–45 min including verification on each page post-deploy.

12. **Public agent-discovery + skill-wrapper documentation update.** `/.well-known/agent-card.json`, `/llms.txt`, `/openapi.yaml`, and `/public/wrappers/*.md` all describe the OLD bundled-depth response shape. Update to reflect translation-sandwich-v1 (new top-level fields: `version`, `extraction`, `assessment`, `prose`, `meta`, `disclaimer`). Reduces the R10 / 3c trade-off cost retroactively for any external agents who read the descriptors going forward. Standard tier (documentation only). Estimated 45–60 min.

13. **React hydration errors on `/private-mentor` + `/mentor-hub` + `/ops-hub` (and possibly `/admin/test-reason`).** Surfaced during the consumer audit as React errors #418, #423, #425. Likely cause: service-worker cache + Vercel-rebuild interaction (the service worker `[Sage] Journal service worker registered` was logged during the errors). Diagnostic step suggested in chat (hard refresh + service-worker unregister via dev tools → Application → Service Workers). Investigation tier: Standard (read-only diagnostic) → Elevated if a code fix is needed. Estimated 30 min investigation; fix scope TBD.

## Verification Method Used (0c framework)

| Work item | Verification method |
|---|---|
| Consumer audit (8 consumer categories identified) | Grep + Read tool against codebase; cross-checked against /admin/test-reason/page.tsx comment block + ADR-004 §2.1 schema definition |
| `/api/keys` POST bug diagnosis | Read tool on /api/keys/route.ts + api/api-keys-schema.sql; compared INSERT vs schema; identified column-name mismatch + missing NOT NULL field |
| `/api/keys` POST fix (replace_all + key_prefix add) | Edit tool returned success; founder reviewed diff in chat before approval per Elevated discipline |
| Cross-check on rename direction | Grep across codebase for `api_keys` consumers; confirmed (a) `/lib/security.ts` validateApiKey doesn't use either column name; (b) /admin/api-keys endpoint uses `key_prefix` helper (confirms schema field name); (c) /api/usage has same pre-existing bug — fix direction confirmed correct |
| `/api/keys` POST fix deployment | Founder commit + push; Vercel build green |
| `/api/keys` POST fix validation (key generation) | Founder ran token-extraction + POST snippet from sagereasoning.com browser console; received `key: "sr_live_..."` response with metadata — confirmed working |
| Test 7 agent contract (curl with API key) | Founder ran single-line curl from Terminal with substituted API key; received full translation-sandwich-v1 response with all 6 top-level fields per ADR-004 §2.1 populated; latency 26.7s; AC-13 Tier 2 soft-clarification surfaced as bonus signal — agent contract verified |

All verifications founder-performable per project instructions §0c. AI did not run any verification independently.

## Risk Classification Record (0d-ii)

| Change | Classification | Reasoning |
|---|---|---|
| Consumer audit (read-only grep + Read) | Standard | Documentation only; no production touch. |
| `/api/keys` POST fix (column rename + key_prefix add) | **Elevated** | Changes to existing user-facing functionality (endpoint that has been broken). Critical Change Protocol NOT engaged — no auth/session/perimeter/encryption/deletion change; same auth check, same caller ID, same Supabase admin client; only INSERT shape changes. Brief Elevated checklist applied (named what could break + rollback path provided + founder approved before deploy + verification step provided). |
| Test 7 agent-contract curl | Standard | Read-only verification request. |
| This close + next-session prompt update | Standard | Documentation only. |

Critical Change Protocol applied at the parent M1-CP6 cutover (recorded in `/operations/handoffs/founder/2026-05-08-M1-CP6-close.md`); Elevated discipline applied to the `/api/keys` fix.

## PR5 — Knowledge-Gap Carry-Forward

Concepts re-explained / surfaced this sub-session:

- **Login session vs API key distinction** — first explanation needed (founder asked: "I am logged in on the website does that mean there is a live one?"). Cumulative: 1. Documented inline; not promoted to KG.
- **`requireAuth` checks Authorization header only, not session cookie** — first observation (the URL-navigation approach to /api/keys returned 401 because browser address bar doesn't send the header). Cumulative: 1. Documented inline; potentially relevant for future API-design sessions.
- **Schema-vs-code drift on api_keys + api_key_usage tables** — third observation in this domain (M1-CP5-prime-prime schema-vs-prompt drift on SQL columns + JSONB paths; this sub-session's `/api/keys` user_id + key_prefix bug; same `/api/usage` user_id bug; api_key_usage column names). **Pattern is broader than originally scoped** — Q5 was specifically about session-prompt SQL drift; this is production-code-vs-schema drift. **Recommendation for next session:** consider broadening Q5 KG entry to cover all schema-vs-code drift across SQL + production code + session prompts; OR introduce a new KG entry specifically for production-code-vs-schema drift. Founder elects.
- **Multi-line curl paste on macOS Terminal fragments** — first observation (the backslash line-continuation approach broke; single-line curl worked). Cumulative: 1. Note for future testing instructions: prefer single-line curl.

Session-opening protocol scan: KG1 + KG7 engaged (DB + JSONB) but Q5-related; no other KG entries engaged.

## Founder Verification (Between Sessions)

**Step A — Commit + push the close + decision-log + next-session prompt files** (covers BOTH the parent M1-CP6 close pending from earlier + this sub-session's deliverables; single commit).

Open Terminal, paste this exact block, press **Enter**:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning" && git add operations/decision-log.md operations/handoffs/founder/2026-05-08-M1-CP6-close.md operations/handoffs/founder/2026-05-08-M1-CP6-post-audit-close.md operations/handoffs/founder/2026-05-08-NEXT-SESSION-PROMPT.md operations/handoffs/founder/2026-05-08-2F-CP0-BRAINSTORM-NEXT-SESSION-PROMPT.md && git commit -m "M1-CP6 governance bundle: close + post-audit close + decision-log + next-session prompts

Bundles the governance documentation from the M1-CP6 cutover session and its post-audit sub-session:

(1) D-M1-CP6-CUTOVER-2026-05-08 decision-log entry (full form per Critical-tier discipline; ~250 lines including Critical Change Protocol six-step record + verification results + 2F deferred-decision capture per PR7).

(2) M1-CP6 close (cutover proper) — captures cutover commit + 4/4 verifications + status changes + open questions + 2F arc deferred per PR7.

(3) M1-CP6 post-audit close — captures consumer audit (8 consumer types identified); /api/keys POST bug diagnosed + fixed (column-name mismatch user_id -> owner_user_id + missing NOT NULL key_prefix added); fix deployed + verified live; Test 7 agent-contract curl run successfully; AC-13 Tier 2 soft-clarification verified live as bonus signal; 5 carry-forwards captured for next session.

(4) Next-session prompt — open agenda updated to include Item I (Post-cutover hygiene + auth-path restoration) bundling the 5 carry-forwards from the audit: /api/usage user_id fix; /api/keys GET api_key_usage column fix; /private-mentor + /mentor-hub + /ops-hub authFetch fix; agent-card.json + llms.txt + openapi.yaml + wrappers shape update; React hydration investigation.

(5) 2F-CP0 brainstorm-continuation prompt — self-contained prompt for picking up the deferred 2F architectural arc when founder elects.

Production state at commit: M1-CP6 cutover Live + verified; /api/keys fix Live + verified; Test 7 agent contract Verified. M1 arc complete. No outstanding critical work. Open agenda awaits founder election.

Risk classification: Standard governance bundle (no production touch in this commit; the Critical and Elevated production changes were committed earlier under their own commits — M1-CP6 cutover commit + /api/keys fix commit). Critical Change Protocol applied at the cutover; Elevated discipline applied at the /api/keys fix; both recorded in respective close files." && git push origin main
```

If `git add` fails with `index.lock` errors, paste this in Terminal first then retry:

```
rm "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/.git/index.lock"
```

Vercel will rebuild on push (~2–3 minutes). Build expected to be a no-op for production behaviour — this commit is governance documentation only; the production-affecting commits (M1-CP6 cutover + `/api/keys` fix) were committed earlier and have already been deployed + verified. Build should be **green**.

**Step B — Independent verification (founder-performable, optional).** Open Terminal, paste:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
ls operations/handoffs/founder/2026-05-08-M1-CP6-close.md
ls operations/handoffs/founder/2026-05-08-M1-CP6-post-audit-close.md
ls operations/handoffs/founder/2026-05-08-NEXT-SESSION-PROMPT.md
ls operations/handoffs/founder/2026-05-08-2F-CP0-BRAINSTORM-NEXT-SESSION-PROMPT.md
grep -c "D-M1-CP6-CUTOVER-2026-05-08" operations/decision-log.md
grep -c "Item I — Post-cutover hygiene" operations/handoffs/founder/2026-05-08-NEXT-SESSION-PROMPT.md
git log --oneline -5
```

Expected: ls commands all list paths without "No such file or directory" errors; grep count returns ≥ 1 for the decision-log entry; grep count returns ≥ 1 for the Item I addition; git log shows the recent commits including the M1-CP6 cutover, `/api/keys` fix, and this governance bundle.

If figures diverge, surface in next session-open.

## Orchestration Reminder

**M1 arc remains complete after this sub-session.** The post-audit work was hygiene + verification, not architectural change. The /api/keys fix restored a pre-existing broken endpoint to working state — additive, not transformative. Test 7 confirmed the agent contract works with the new schema; this is the load-bearing post-cutover validation that closes the consumer audit.

**Two auth paths now verified post-cutover:** session auth (`requireAuth`, used by /admin/test-reason during Verifications 1–3) AND API-key auth (`validateApiKey`, used by Test 7). Both work. Both produce the new translation-sandwich-v1 response shape.

**Bonus signal: AC-13 Tier 2 soft-clarification mechanic verified live in production.** The Test 7 response carried `prose.soft_clarification_prose` populated with a clarifying question, and `intake_clarifications.soft_clarifications` carried the STATED_OPERATIVE_CONFLICT trigger. The M1-CP4b/4c work observed working on real input for the first time. Worth noting but not actionable.

The next session is open-ended per the open agenda in the next-session prompt. The founder elects when and what to tackle. If no next session is elected immediately, the project is in a known-good state.

## Cross-references

- `/operations/handoffs/founder/2026-05-08-M1-CP6-close.md` (predecessor close — M1-CP6 cutover proper; this close extends but does not replace it)
- `/operations/handoffs/founder/2026-05-08-return-to-M1-CP5-prime-prime-close.md` (RTM1-CP5-prime-prime — predecessor of M1-CP6 cutover; Branch A authorisation)
- `/operations/handoffs/founder/2026-05-08-M1-CP6-NEXT-SESSION-PROMPT.md` (M1-CP6 cutover input prompt)
- `/operations/handoffs/founder/2026-05-08-NEXT-SESSION-PROMPT.md` (open-agenda next-session prompt; updated this sub-session to add Item I)
- `/operations/handoffs/founder/2026-05-08-2F-CP0-BRAINSTORM-NEXT-SESSION-PROMPT.md` (2F architectural arc continuation prompt — deferred per PR7)
- `/operations/decision-log.md` `D-M1-CP6-CUTOVER-2026-05-08` (parent cutover entry — full form)
- `/operations/decision-log.md` `D-RETURN-TO-M1-CP5-PRIME-PRIME-RUBRIC-REFRESH-2026-05-08` (Branch A election)
- `/website/src/app/api/keys/route.ts` (the fixed file)
- `/api/api-keys-schema.sql` (authoritative schema for api_keys + api_key_usage tables)
- `/website/src/app/api/reason/route.ts` (M1-CP6 cutover route — Live)
- `/website/src/lib/translation-sandwich/parallel-run.ts` (`runSandwich` — production orchestrator)
- `/website/src/lib/security.ts` (`validateApiKey` — agent-contract auth path verified at Test 7)

*End of post-audit close. Consumer audit complete; agent contract verified live; 5 carry-forwards captured for next session via Item I in the open-agenda next-session prompt; production state stable; M1 arc remains complete; next session open-ended per founder election.*
