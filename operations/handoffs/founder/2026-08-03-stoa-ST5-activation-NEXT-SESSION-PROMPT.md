# Next-Session Prompt — Stoa ST5: activation walk

**Stream:** founder.
**Tier:** **`code-critical` 0c-ii, founder-walked** — the deploy, the flag flip, every live smoke, and the R18 doc application are the founder's own live steps; the AI guides + verifies + makes repo edits, and performs no Vercel/Supabase/git/mint op.
**Governing frame:** /adopted/standing-protocol-cache.md; the Stoa build plan §3 ST5 + §4; the two prior closes (`2026-08-03-stoa-ST3-human-surface-CLOSE.md`, `2026-08-03-stoa-ST4-agent-surface-CLOSE.md`); `operations/decision-log.md` entries `D-STOA-ST3-HUMAN-SURFACE-BUILT-DARK-2026-08-03` and `D-STOA-ST4-AGENT-SURFACE-BUILT-DARK-2026-08-03`.
**Risk classification:** Critical per 0d-ii/AC7 (the first production activation of a new user-facing + agent-facing surface, plus a public-contract R18 change).

## Why this session matters

ST1–ST4 built The Stoa entirely dark. This is the single session where it becomes real: a flag flip turns on browsing, declaring, tending, and withdrawing for both humans and agents, and the founder's sign-off turns three staged documents into the platform's public contract for the surface. Nothing before this session touched production state; this session is where it does.

## Pre-conditions

1. Both prior commits are pushed and Vercel is green on the pushed code **before** any flag is touched (the standing lesson: commit + push before any production flag flip — memory reinforced by the 2026-07-30 B5 activation).
2. Read in full: this prompt, both prior closes, the build plan's §3 ST5 paragraph, and `operations/connective-layer-2026-08/st4-r18-docs-staged.md` (re-diff its two flagged drift risks below before applying anything from it).
3. Confirm Supabase anonymous sign-ins are OFF in the project's auth settings (ST3-carried check — an anonymous-auth user would pass `getAuthenticatedUser` and reach community scope with no identity floor; this has never been checked live for this project, per PR19 F5 at ST3).

## Two drift checks before applying the staged R18 docs

1. **Re-diff `STOA_ETHIC`** in `website/src/lib/stoa/stoa-copy.ts` against the blockquote in `st4-r18-docs-staged.md` §1 — confirm byte-exact. If another session has touched the constant since 2026-08-03, the staged quote is stale and must be re-copied, not hand-edited.
2. **Re-count `capabilities.extensions`** in `website/public/.well-known/agent-card.json` — the staged doc assumes the new entry lands as #21 (`stoa-connective-layer/v1`, after `loop-fold/v2`, which was #20 at ST4 close). If the count has moved, renumber only in this prompt's own record, never in the extension object itself (extensions don't carry an ordinal field — the count is descriptive, not load-bearing; just confirm the array append is still last-in-list for readability).

## Part A — Deploy + flag

1. Push (if not already), confirm Vercel green on the exact commit.
2. Set `SUBSTRATE_STOA_ENABLED=true` in Vercel Production, redeploy, confirm green.

## Part B — Live smoke matrix (founder-run; AI verifies each response shape)

Run against production, in this order:

1. **Unauthenticated browse** — `GET /api/stoa/entries` with no auth → `scope: "public"`, entries filtered to `visibility: "public"` only (should be empty or near-empty — the honest near-empty framing on `/stoa` should render).
2. **Human JWT browse** — sign in as any test account, `GET /api/stoa/entries` with the session cookie/JWT → `scope: "community"`.
3. **Human declare→edit→withdraw cycle** — `POST /api/mentor/stoa` (declare) → `PATCH` (edit) → `PATCH` with an empty body (renew — confirm `renewed_at` moves, `declared_at` does NOT) → `DELETE` (withdraw) → confirm a subsequent `GET` shows `status: "withdrawn"`. Confirm the near-empty framing and canonical copy render correctly on `/stoa` throughout (dark-state → live-state transition).
4. **Credential-presence browse** — mint a throwaway `sr_live_` or `sr_prac_` credential (any owner, `consult` capability), call `GET /api/stoa/entries` with `Authorization: Bearer <token>` and NO cookie/JWT → confirm `scope: "community"` (the ST4 presence arm actually elevates scope in production). Confirm this call does NOT increment the credential's usage counters (check `daily_calls_after`/`monthly_calls_after` via a subsequent `/api/usage` call or the admin credential list, before and after — should be unchanged, proving the "no metering" claim live, not just in the unit battery).
5. **Agent declare→tend→withdraw cycle (the ST4 identity floor, live)** — mint a throwaway credential that IS owner-bound and agent-bound (`capabilities: ["consult"]`, an `owner_user_id` and a K1-canonical `agent_id` set at mint). `POST /api/stoa/declare` with `Authorization: Bearer <token>` → confirm success, entry `visibility` defaults to `public` (#1). `PATCH` to tend it. `GET` to confirm the shelf/staleness fields render (staleness should read `stale: false` for a fresh entry). `DELETE` to withdraw.
6. **Owner-less credential refusal (live)** — attempt `POST /api/stoa/declare` with a credential that has `owner_user_id: null` (an ecosystem-style key) → confirm **403** with the `no_owner` message, not a 500 and not a silent success.
7. **Agent-less credential refusal (live)** — attempt with an owner-bound credential that has no `agent_id` set → confirm **403** `no_agent`.
8. **The #19 links, live** — `GET /api/stoa/entries` while the agent entry from step 5 is active (before its withdraw in step 5, reorder if needed) → confirm the served entry carries `trust_record_url`/`accreditation_url` pointing at the correct `agent_id`, and that following `trust_record_url` returns the honest absence shape (this agent has no examined trust record) — confirming the target endpoint's own design, live, not just referenced.
9. **R20a exclusion holds** — confirm `/api/stoa/declare` genuinely returns no crisis-redirect shape even when `what_i_bring` contains acute-distress language (e.g. the same phrase ST3's battery uses) — this route must NOT redirect (that would mean the R20a-exclusion design is wrong and the route needs bringing INTO the perimeter as a Critical follow-up, not a routine bug). Confirm separately that `/api/mentor/stoa` (the human route) STILL redirects on the identical text — the two routes must diverge exactly as designed.
10. **Rate limits** — confirm the four new/distinct buckets (`stoa-agent-declare`, `stoa-agent-mutate`) are independent of the human route's buckets (rapid-fire the human route's limit should not affect the agent route's remaining quota, and vice versa).

## Part C — R18 doc application (after Part B is fully green)

Apply `st4-r18-docs-staged.md`'s three edits verbatim (subject to the two drift checks above):
1. `website/public/llms.txt` — insert the "The Stoa" section.
2. `website/public/.well-known/agent-card.json` — append the extension.
3. `website/src/app/api-docs/page.tsx` — add the bullet.

Verify: `agent-card.json` parses + extension count is correct; `npm run build` green; `/api-docs` renders the new bullet.

## Part D — Teardown

Revoke every throwaway credential minted for the smokes (steps 4–7). If any test rows were written to `stoa_entries` and not cleaned up by the withdraw calls in the smoke sequence, confirm they are `status: "withdrawn"` or hard-delete them via the data-rights path (`DELETE /api/credential/erase` for the credential-bound test rows) — do NOT leave live-looking test entries visible in the colonnade.

## Rollback path

Unset `SUBSTRATE_STOA_ENABLED` + redeploy → every route returns to 503/dark (byte-identical, battery-asserted). `git revert` the R18 docs commit independently if only that needs undoing. `stoa_entries` stays applied but inert either way (ST2's schema, unaffected).

## Anticipated shape

A founder-walked session, mostly live verification rather than new code. ~2–4 hours depending on how many smoke iterations are needed. No new PR19 review is required for this session unless the smokes surface a genuine defect requiring a code change — if that happens, treat the fix as its own small Elevated/Critical addendum with its own adversarial pass before re-attempting activation.

## Forecast

Success: The Stoa is live in production for both humans and agents, the machine-readable contract is published, and every carried open item (row-level reactivation guard, anonymous-sign-ins check, q-filter pagination bound) is either closed or explicitly re-carried with a named owner. Remaining threads the founder sequences separately: ST6 (the optional draft mirror reading), ST7 (subscriptions, the Q5c/Q13a trust-event machinery, the map-into-Stoa fold, nav/glossary placement), the S11 items, 0h.

End of prompt.
