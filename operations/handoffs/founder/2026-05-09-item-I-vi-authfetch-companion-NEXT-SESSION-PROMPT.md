# Next-Session Prompt — Item I (vi): authFetch migration on `/api/score-conversation` + `/api/score-decision` (companion perimeter sweep)

**Stream:** founder.
**Tier:** code-elevated category, **Standard** risk under 0d-ii (carve-out per Item I (i) precedent — additive client-side fetch-wrapper change; same pattern as the closed sub-item (i)).
**Governing frame:** /adopted/standing-protocol-cache.md (operative reference).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-09-item-I-i-authfetch-migration-close.md` (Item I (i) — three pages × five call sites; same migration pattern; closed 2026-05-09 with all three pages verified live).
**Predecessor decision-log entry:** `D-ITEM-I-i-AUTHFETCH-MIGRATION-2026-05-09`.
**Risk classification:** Standard under 0d-ii. AC7 NOT engaged. PR6 NOT engaged. Critical Change Protocol NOT engaged.

## Why this session matters

Item I sub-item (vi) was surfaced during the Item I (i) session as out-of-scope observations: two plain `fetch()` call sites remain on companion perimeter routes that require auth. The migration pattern is identical to (i) — rename `fetch` → `authFetch` at the call sites. `authFetch` is **already imported** in both files (from the (i) session), so this is single-character renames at two call sites only. Closing (vi) keeps the perimeter consistent: every R20a perimeter call from the three reasoning pages now sends the Authorization header. Direct continuation of (i); same pattern; quick win.

## Pre-conditions

1. **Item I (i) commits pushed + Vercel green.** Confirmed at end of 2026-05-09 session.
2. **Both target endpoints require auth.** Likely true (companion endpoints to /api/reason in same R20a perimeter per Deliverable 24); to be confirmed at Step 1 of this session by reading the two route.ts files. If either endpoint doesn't require auth, scope reduces.
3. **`authFetch` is already imported in both target files.** Confirmed at end of (i): `mentor-hub/page.tsx` line 4; `ops-hub/page.tsx` line 4.

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier, model selection, risk class, signals).
2. `/operations/handoffs/founder/2026-05-09-item-I-i-authfetch-migration-close.md` (~5 min — direct predecessor; same pattern; provides the verified template for this session).
3. `/operations/decision-log.md` `D-ITEM-I-i-AUTHFETCH-MIGRATION-2026-05-09` (~3 min — predecessor entry; lean-form template for this session's entry).

Confirm at open: tier (code-elevated category, Standard risk); hold-point status (P0 0h active); model selection (no LLM calls — N/A); status vocabulary (two taxonomies, never mixed); signals/risk class.

## Part B — Procedure

### Step 1 — Verify both endpoints require auth (read-only)

Read the two route files:

- `/website/src/app/api/score-conversation/route.ts`
- `/website/src/app/api/score-decision/route.ts`

Confirm each calls `requireAuth(req)` (or `validateApiKey`) at or near the top of the POST handler. Two outcomes:

- **Both endpoints require auth (expected case):** scope is two `fetch` → `authFetch` renames (Step 2).
- **One or both endpoints do NOT require auth:** scope reduces. Surface to founder at this step; ask whether to (a) proceed only with the auth-requiring endpoint(s); (b) defer the non-auth endpoint(s) to a later session; or (c) skip this session entirely.

### Step 2 — Apply the migration (founder approves before edit)

If Step 1 confirms both endpoints require auth, surface the diff plan to founder:

- `/website/src/app/mentor-hub/page.tsx` line 152 — `fetch('/api/score-conversation'` → `authFetch('/api/score-conversation'`
- `/website/src/app/ops-hub/page.tsx` line 67 — `fetch('/api/score-decision'` → `authFetch('/api/score-decision'`

(No import changes — `authFetch` already imported on line 4 of both files from the Item I (i) session.)

Founder approves per project preferences (sign-in-affecting change requires explicit approval). Then apply via Edit tool.

### Step 3 — Commit + push

Provide commit block. Suggested commit message structure (mirror the (i) commit):

- Scope: Item I (vi) authFetch migration on /api/score-conversation + /api/score-decision call sites.
- Files touched: `/website/src/app/mentor-hub/page.tsx`, `/website/src/app/ops-hub/page.tsx`.
- Risk class: Standard under 0d-ii (additive; restoring intended behaviour; no auth/encryption/perimeter/deletion surface modified).
- Rollback path: `git revert` of the migration commit.
- Verification: post-deploy founder-performable per page.

### Step 4 — Verify post-deploy (founder-performable)

Wait for Vercel to rebuild (~2–3 min after push). Then verify both call sites:

- **`/mentor-hub`** — send a message in **companion mode** (the `sessionMode === 'companion'` branch is what triggers `/api/score-conversation`; founder may need to set the mode toggle first). Open DevTools → Network → filter for "score-conversation" → confirm POST returns **200**.

- **`/ops-hub`** — enter two decision options in the **Decision Scoring** section + click Score (or equivalent CTA — see lines 61–82 in the file for the exact handler). Open DevTools → Network → filter for "score-decision" → confirm POST returns **200**.

If either returns 401, the rollback (`git revert HEAD`) is one commit. Surface at session close.

### Step 5 — Append decision-log entry (lean form)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". Mirror the structure of `D-ITEM-I-i-AUTHFETCH-MIGRATION-2026-05-09`. Suggested ID: `D-ITEM-I-vi-AUTHFETCH-COMPANION-2026-MM-DD`.

Capture:
- Two call-site renames + zero import additions.
- Verification result per endpoint.
- Item I sub-item (vi) Open → Closed; remaining sub-items: (ii) + (iii) + (iv) + (v) (four open).
- Any new observations surfaced (per the (i) session's pattern of surfacing out-of-scope plain fetches — sweep if energy allows for any remaining plain `fetch` call sites on R20a perimeter routes).

### Step 6 — Session close (lean form)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close". Mirror the structure of the (i) close.

Capture:
- Status changes (two call sites Wired-but-broken-on-auth → Live; Item I sub-item (vi) Open → Closed).
- Production state.
- Open questions (remaining four Item I sub-items; any newly surfaced).
- Founder verification block (commit + push the close + decision-log + any next-session prompt updates).

### Step 7 — Update next-session prompt

Update `/operations/handoffs/founder/2026-05-08-NEXT-SESSION-PROMPT.md` in place (PR8-style amendment) to mark Item I (vi) as Closed. Mirror the (i) closure pattern: prepend `[CLOSED YYYY-MM-DD]` markers; update the Risk class line; update the Estimated total; update the Forecast bullets; update the Recommendation paragraph.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close read (Part A) | 10–15 min |
| Step 1 — verify endpoints require auth | 5 min |
| Step 2 — apply migration (after founder approval) | 5 min |
| Step 3 — commit + push | 5 min |
| Step 4 — verify post-deploy (per page) | 5–10 min |
| Step 5+6+7 — decision-log + close + next-session prompt update | 20–30 min |
| **Total** | **~50–70 min** |

If the work goes faster (e.g., both endpoints' verification clean first attempt), session may close at the lower estimate. If Step 1 surfaces an endpoint that doesn't require auth, scope discussion may add 5–10 min for founder direction.

## Rollback path

`git revert <commit-hash>` of the migration commit + `git push origin main`. Restores prior broken-on-auth state on the two call sites — no further regression possible since prior state was already broken (pending Step 1 endpoint-auth confirmation).

## Forecast

**Most-likely path:** Step 1 confirms both endpoints require auth; Step 2 applies the two renames; Steps 3–7 close out the session in ~50–70 min total. Item I (vi) Closed; remaining Item I sub-items: (ii) + (iii) + (iv) + (v). Natural next session: bundle (ii) + (iii) (Elevated hygiene — column-name fixes on /api/usage + /api/keys GET); or Item B + Item D (post-cutover watch + cost monitoring restoration).

**Watch:** if Step 1 reveals an endpoint without auth (less likely), the scope may reduce to a single endpoint or pivot to a different sub-item. Founder elects at Step 1 outcome.

**Closure pattern:** treat this session as a direct continuation of Item I (i); use the (i) close + decision-log entry as the template. Lean form throughout.

End of prompt.
