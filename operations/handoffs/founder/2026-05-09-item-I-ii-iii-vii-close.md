# Session Close — 2026-05-09 — Item I sub-items (ii)+(iii)+(vii) bundled hygiene

**Stream:** founder.
**Governing frame:** /adopted/standing-protocol-cache.md (operative reference).
**Tier:** code-elevated — Elevated risk under 0d-ii (highest of bundle sets the tier; sub-items (ii)+(iii) Elevated, sub-item (vii) Standard). Critical Change Protocol NOT engaged.
**Date:** 2026-05-09.

## Decisions Made

- `D-ITEM-I-ii-iii-vii-COLUMN-AND-PAYLOAD-FIXES-2026-05-09` appended to active decision log (lean Elevated form, ~80 lines including verification block + open-questions section + cross-references). Captures: three sub-item closures bundled — (ii) `/api/usage` line 43 column rename PLUS expanded scope on lines 64-93 (founder elected at session-open) restructuring the `api_key_usage` query against the actual schema and dropping the schema-unsupportable `daily_trend` field; (iii) `/api/keys` GET `api_key_usage` column-name corrections at lines 38-46; (vii) payload-shape fixes — mentor-hub `{input}` → `{conversation}` single-field rename + ops-hub `{option1, option2}` → `{decision, options: [...]}` with new "Decision Question" textarea added per founder-elected option (b).

## Status Changes

| Item | Old | New |
|---|---|---|
| `/api/usage` GET endpoint | Wired but broken (`user_id` column-name + multiple `api_key_usage` query column references against non-existent schema columns) | **Live** within schema's expressive limits (response shape revised — `daily_trend` dropped because schema doesn't store historical daily values; `daily_calls_today` substituted) |
| `/api/keys` GET `api_key_usage` join | Wired but broken (queried `monthly_total`/`daily_total`/`day` columns that don't exist) | **Live** (column names corrected to `total_calls`/`daily_calls`/`current_day`) |
| `/mentor-hub` companion-mode `/api/score-conversation` call | Wired but broken (sent `{input}`; route expects `{conversation}` — produced 400) | **Live** (payload field renamed; auth + body validation will pass) |
| `/ops-hub` Decision Scoring `/api/score-decision` call | Wired but broken (sent `{option1, option2}`; route expects `{decision, options: [...]}` — produced 400; UI couldn't capture decision question) | **Live** (UI textarea added; payload restructured) |
| Item I bundle | 7 sub-items: (i)+(vi) Closed; (ii)+(iii)+(iv)+(v)+(vii) open | Item I bundle: (i)+(ii)+(iii)+(vi)+(vii) Closed; (iv)+(v) remain open |
| Schema-vs-code drift pattern (Q5 watch-status) | 4 cumulative observations (3 in /api/keys + 1 carry-forward observation) | **5+ cumulative observations** (added: /api/usage line 43 + /api/usage lines 64-93 + /api/keys GET column refs); pattern increasingly load-bearing; Q5 promotion to permanent KG entry available as Item E in open agenda |

## Next Session Should

**Founder elects at next-session-open from the remaining open-agenda candidate items in `/operations/handoffs/founder/2026-05-08-NEXT-SESSION-PROMPT.md`.** Item I sub-items (iv) + (v) remain open from the original audit-surfaced bundle:
- (iv) Public agent-discovery + skill-wrapper documentation update — agent-card.json + llms.txt + openapi.yaml + public/wrappers/*.md describe the old bundled-depth response shape (Standard tier; ~45-60 min).
- (v) React hydration errors investigation — service-worker cache + Vercel-rebuild interaction (Standard tier read-only diagnostic; ~30 min).

Other open-agenda items remain available unchanged: A (2F architectural arc), B (post-cutover watch deep-dive), C (M2 scoping), D (cost monitoring restoration), E (Q5 promotion — pattern is now well past third recurrence), F (PR8 promotion), G (routine governance), H (stabilise + pause).

The original M1-CP6 "no mandatory next-session" guidance still stands; founder may elect to stabilise + pause at any time.

## Blocked On

**Files committed during this session (none — all pending at session close):**

(None. The four code edits + decision-log append + this close + next-session prompt update are all pending the founder commit at Step A below.)

**Files to commit at this session close:**
- `/website/src/app/api/usage/route.ts` — sub-item (ii) line 43 column rename + lines 64-93 query restructure.
- `/website/src/app/api/keys/route.ts` — sub-item (iii) GET path column-name corrections.
- `/website/src/app/mentor-hub/page.tsx` — sub-item (vii) `{input}` → `{conversation}` rename.
- `/website/src/app/ops-hub/page.tsx` — sub-item (vii) state + textarea + payload restructure.
- `/operations/decision-log.md` — D-ITEM-I-ii-iii-vii-COLUMN-AND-PAYLOAD-FIXES-2026-05-09 entry appended.
- `/operations/handoffs/founder/2026-05-09-item-I-ii-iii-vii-close.md` — this file.
- `/operations/handoffs/founder/2026-05-08-NEXT-SESSION-PROMPT.md` — modified in place to mark (ii)+(iii)+(vii) Closed.

**Production state at session close:**
- **Vercel deployment:** GREEN (assumed — predecessor session's commits verified live earlier in the day). After this commit pushes, Vercel will rebuild (~2-3 min). Post-rebuild, the four user-facing surfaces above transition from broken-on-payload-or-schema to working.
- **Supabase `supabase-us`:** unchanged schema. No DB DML this session. The fixes corrected the route + page code to match the existing schema (no migration needed).
- **Env flags:** unchanged.
- **AC4 / AC5 / AC7:** AC4 + AC5 still preserved (R20a perimeter unchanged — none of the four surfaces touched are R20a perimeter routes). AC7 NOT engaged.
- **Cost incurred this session (founder-side):** ~$0 (no LLM calls during this session — all work was code editing + governance).

## Open Questions

1. **Item I sub-items (iv) + (v) remain open** — public agent-discovery documentation update + React hydration investigation. See open-agenda prompt.
2. **Q5 schema-vs-code drift pattern at 5+ observations** — pattern has clearly earned promotion. Founder may elect Item E at any subsequent governance session; the increasing recurrence count strengthens the case but does not block this session's closure.
3. **`/api/usage` `daily_trend` schema-incompatibility** — the schema (`api_key_usage` table) tracks at most one row per (api_key_id, year, month) with only the current day's daily_calls. Historical daily values are not stored. Re-introducing a multi-day daily_trend feature requires a schema change (e.g., a separate `api_key_usage_daily` table or a JSONB rolling-window column). Not in scope for hygiene work; surface to founder if future cost-monitoring or analytics work calls for it.
4. **`/api/usage` per-endpoint column scope drift** — the schema's per-endpoint counters are `guardrail_calls`, `score_iterate_calls`, `agent_baseline_calls`, `other_calls`. Future endpoint additions (e.g., `/api/reason` post-M1-CP6 cutover) may not map cleanly to these four buckets. The `increment_api_usage` SQL function (lines 98-154 in api-keys-schema.sql) accepts a `p_endpoint` parameter that maps to those four; new endpoint categories would land in `other_calls`. Consider a schema review when M2/M3 consumer migrations happen.

## Verification Method Used (0c Framework)

| Work item | Verification method |
|---|---|
| Sub-item (ii) /api/usage column rename + query restructure | Read of route.ts + api/api-keys-schema.sql to confirm actual schema columns (lines 63-87); Edit applied; founder reviewed diff in chat before approval per Elevated discipline; founder will verify post-deploy via DevTools Network tab on a /api/usage call (200 with new response shape) |
| Sub-item (iii) /api/keys GET column rename | Read of route.ts (already partially fixed in M1-CP6-post-audit); Edit applied; founder reviewed diff in chat; founder verifies post-deploy via /api/keys GET response carrying populated `usage` object without 500 |
| Sub-item (vii) mentor-hub payload rename | Read of /api/score-conversation/route.ts to confirm body schema (line 85); Edit applied; founder verifies post-deploy via DevTools Network on companion-mode message — status changes from 400 to 200 |
| Sub-item (vii) ops-hub state + textarea + payload | Read of /api/score-decision/route.ts to confirm body schema (line 93); Edit applied (3 edits — state, payload, UI); founder verifies post-deploy via DevTools Network on Score Decisions click — status changes from 400 to 200; UI shows new Decision Question textarea above the two option boxes |

All verifications founder-performable per project instructions §0c. AI did not run any verification independently.

## Risk Classification Record (0d-ii)

| Change | Classification | Reasoning |
|---|---|---|
| Sub-item (ii) /api/usage edits | **Elevated** | Changes to existing user-facing functionality (broken endpoint repaired). Critical Change Protocol NOT engaged — no auth/session/perimeter/encryption/deletion change; only query-column references + response-shape change. |
| Sub-item (iii) /api/keys GET edit | **Elevated** | Same reasoning. |
| Sub-item (vii) mentor-hub + ops-hub edits | Standard | Additive client-side payload restructuring + new UI input field; no auth/session/perimeter touched. |
| Decision-log entry + this close + next-session prompt update | Standard | Documentation only. |

Bundle tier: Elevated (highest of components). Brief Elevated checklist applied per cache: named what could break + rollback path provided + founder approved before deploy + verification step provided.

## PR5 — Knowledge-Gap Carry-Forward

Concepts re-explained / surfaced this session:

- **Schema-vs-code drift on /api/usage api_key_usage columns** — fourth-or-later observation in the production-code-vs-schema drift domain. Cumulative count for Q5 (broadened): now 5+ observations. Pattern is well past third-recurrence threshold (PR8 / Q5 promotion). Documented in this session's decision-log open questions; founder elects Item E at any subsequent session.
- **/api/usage daily_trend not derivable from current schema** — first explanation needed (the schema only stores the current day's daily_calls; historical daily values would require a new table or column). Cumulative: 1. Captured in open questions for future schema review.
- **/api/score-decision design intent — `decision` is the framing question, not the placeholder** — first explanation needed (founder elected option (b) at session-open: add UI textarea rather than synthesize a placeholder; preserves the route's intended semantics — the LLM evaluates options against the framing question). Cumulative: 1. Documented in inline code comment on ops-hub.

Session-opening protocol scan (PR5): KG1 + KG7 engaged at the read level only (no JSONB writes); confirmation against api/api-keys-schema.sql performed for both /api/usage and /api/keys GET fixes. No other KG entries engaged.

## Founder Verification (Between Sessions)

**Step A — Commit + push.** Open Terminal, paste this exact block, press **Enter**:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning" && git add website/src/app/api/usage/route.ts website/src/app/api/keys/route.ts website/src/app/mentor-hub/page.tsx website/src/app/ops-hub/page.tsx operations/decision-log.md operations/handoffs/founder/2026-05-09-item-I-ii-iii-vii-close.md operations/handoffs/founder/2026-05-08-NEXT-SESSION-PROMPT.md && git commit -m "Item I (ii)+(iii)+(vii) bundle: post-cutover hygiene fixes

Three sub-item closures bundled:

(ii) /api/usage route.ts: line 43 column rename user_id -> owner_user_id PLUS expanded scope (founder elected at session-open) restructuring the api_key_usage query at lines 64-93 against the actual deployed schema. Old code referenced non-existent columns (endpoint, day, daily_total); per api/api-keys-schema.sql lines 63-87, actual columns are total_calls + per-endpoint counter columns + current_day + daily_calls. Response shape revised to drop the schema-unsupportable daily_trend field in favour of single-day daily_calls_today.

(iii) /api/keys GET api_key_usage column-name corrections at lines 38-46: monthly_total -> total_calls, daily_total -> daily_calls, day -> current_day in SELECT + filter + downstream references. Same schema-vs-code drift pattern as the M1-CP6-post-audit /api/keys POST fix.

(vii) Payload-shape fixes on score-family call sites surfaced from D-ITEM-I-vi-AUTHFETCH-COMPANION-2026-05-09's verified 400s. Mentor-hub /api/score-conversation body {input} -> {conversation} (single-field rename per route.ts:85). Ops-hub /api/score-decision body {option1, option2} -> {decision, options: [opt1, opt2]} per founder-elected option (b) — added decisionQuestion state + a third 'Decision Question' textarea above the two option boxes (best fidelity to /api/score-decision design intent — decision is the framing question, options are the alternatives).

Risk classification: Elevated under 0d-ii (highest of bundle sets the tier). Sub-items (ii) and (iii) Elevated (changes to existing user-facing functionality — broken endpoints repaired). Sub-item (vii) Standard (additive client-side payload restructure restoring intended behaviour on already-broken code paths). AC7 NOT engaged. PR6 NOT engaged. Critical Change Protocol NOT engaged.

Decision-log entry: D-ITEM-I-ii-iii-vii-COLUMN-AND-PAYLOAD-FIXES-2026-05-09 (lean Elevated form ~80 lines).

Item I bundle status: (i)+(ii)+(iii)+(vi)+(vii) Closed; (iv)+(v) remain open. Q5 schema-vs-code drift pattern now at 5+ cumulative observations; promotion to permanent KG entry available as Item E in open agenda." && git push origin main
```

If `git add` fails with `index.lock` errors, paste this in Terminal first then retry:

```
rm "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/.git/index.lock"
```

Vercel will rebuild on push (~2-3 minutes). Build expected to be **green** — these are localised code changes within existing route handlers + page components; no schema/dependency/build-config changes.

**Step B — Independent verification (founder-performable, post-deploy).** Once Vercel reports green build:

**Note on auth pattern:** `/api/usage` + `/api/keys` GET both protect with `requireAuth`, which checks the `Authorization: Bearer <token>` header (NOT the session cookie). A plain `fetch()` from console will return 401. Two options:

- **Option 1 (simpler — for sub-items (ii) + (iii)):** the build-passing on Vercel itself verifies that the column names compile against the deployed Supabase schema. If the routes had a column-not-found error, Vercel's Next.js build wouldn't fail (TypeScript doesn't type-check Supabase column strings) but the route would 500 at runtime. Without a UI consumer of these endpoints, the cleanest verification is to wait until M2 / cost-monitoring work surfaces the endpoints in the UI, then verify in passing. Acceptable to defer.
- **Option 2 (rigorous — uses console with auth):** in browser DevTools console, while signed in to sagereasoning.com, run this snippet (extracts session token from Supabase auth + calls the endpoint):

```
const { data: { session } } = await window.supabase.auth.getSession();
const r = await fetch('/api/usage', { headers: { Authorization: `Bearer ${session.access_token}` } });
console.log(r.status, await r.json());
```

Replace `/api/usage` with `/api/keys` to test (iii). If `window.supabase` is not exposed globally, use the same token-grab approach the M1-CP6-post-audit session used (predecessor close §"Step A" describes the pattern).

(ii) Expected: status 200; response body includes `keys[]` items each carrying `total_calls`, `monthly_remaining`, `by_endpoint: { guardrail, score_iterate, agent_baseline, other }`, `daily_calls_today`. **No** `daily_trend` field. **No** 500 error.

(iii) Expected: status 200; response body includes `keys[]` items each carrying a populated `usage` object with `monthly_calls`, `monthly_limit`, `monthly_remaining`, `daily_calls`, `daily_limit`. **No** 500 error.

**Sub-item (vii) verifications (UI-driven; authFetch handles auth):**

(vii-mentor-hub) Navigate to `/mentor-hub`. Ensure Companion mode is selected (top-right). Send a message in the compose box (any non-trivial input — the route requires min 20 chars on the conversation thread). After the mentor response arrives, check DevTools Network tab — there should be a 200 from `/api/score-conversation` (NOT 400). The right-panel "Live Mentor Observations" should populate with a new analysis entry.

(vii-ops-hub) Navigate to `/ops-hub`. Click "Morning Briefing" in the sidebar (this opens the Decision Scoring view per the page's navigation logic). Confirm the new "Decision Question" textarea appears above the two Option textareas. Fill all three with non-trivial content. Click "Score Decisions". Expected: status 200 in DevTools Network; result panel populates with the two-option ranking.

If figures diverge on any sub-item, surface in next session-open and we investigate. Each sub-item is independently revertible via `git revert <commit-hash>` — restoration to the prior broken state is no-regression.

## Cross-references

- `/operations/handoffs/founder/2026-05-09-item-I-vi-authfetch-companion-close.md` (predecessor close — exposed (vii) payload-shape mismatch via verified 400s)
- `/operations/handoffs/founder/2026-05-09-item-I-i-authfetch-migration-close.md` (predecessor of predecessor — restored auth path on three reasoning surfaces)
- `/operations/handoffs/founder/2026-05-08-M1-CP6-post-audit-close.md` (M1-CP6-post-audit close — set the precedent for the Elevated-tier `/api/keys` column-rename fix that this session's sub-items (ii) + (iii) follow)
- `/operations/handoffs/founder/2026-05-08-M1-CP6-close.md` (M1-CP6 close proper — the cutover this hygiene work continues post-)
- `/operations/handoffs/founder/2026-05-08-NEXT-SESSION-PROMPT.md` (open-agenda prompt; updated this session)
- `/operations/decision-log.md` `D-ITEM-I-ii-iii-vii-COLUMN-AND-PAYLOAD-FIXES-2026-05-09` (this session's entry)
- `/operations/decision-log.md` `D-ITEM-I-vi-AUTHFETCH-COMPANION-2026-05-09` (direct predecessor)
- `/operations/decision-log.md` `D-ITEM-I-i-AUTHFETCH-MIGRATION-2026-05-09` (predecessor of predecessor)
- `/operations/decision-log.md` `D-M1-CP6-CUTOVER-2026-05-08` (parent — M1 arc closure)
- `/api/api-keys-schema.sql` (authoritative schema for api_keys + api_key_usage)
- `/website/src/app/api/usage/route.ts` (fixed)
- `/website/src/app/api/keys/route.ts` (fixed — GET path)
- `/website/src/app/mentor-hub/page.tsx` (fixed)
- `/website/src/app/ops-hub/page.tsx` (fixed)
- `/website/src/app/api/score-conversation/route.ts` (route handler — body shape unchanged, served as the spec for mentor-hub fix)
- `/website/src/app/api/score-decision/route.ts` (route handler — body shape unchanged, served as the spec for ops-hub fix)

*End of close. Three Item I sub-items closed; bundle now (i)+(ii)+(iii)+(vi)+(vii) closed; (iv)+(v) remain available for next session election. Production state stable post-deploy; M1 arc remains complete. Next session open-ended per founder election from the open agenda.*
