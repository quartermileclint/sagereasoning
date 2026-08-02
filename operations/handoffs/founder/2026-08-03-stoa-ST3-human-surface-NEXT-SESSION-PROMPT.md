# Next-Session Prompt — Stoa ST3: the human surface `/stoa` (dark; one Critical element)

**Stream:** founder.
**Tier:** `code-elevated` for the surface, **EXCEPT the declaration route's distress wiring — an R20a perimeter addition, `code-critical` per 0d-ii (AC5), with its recorded decision made in-session.** Everything dark behind `SUBSTRATE_STOA_ENABLED` (UNSET everywhere; ST5 is the activation walk — nothing is activated this session).
**Governing frame:** /adopted/standing-protocol-cache.md; the Stoa build plan §2 (all thirty constraints) + §3 ST3 + §4 (verification mandates); **the binding verbatim records win over everything here** — `operations/connective-layer-2026-08/2026-08-02-mentor-consultation-connective-layer-verbatim.md` and `inbox/stoic network enquiry and mentor response.txt`.
**Predecessor session close:** `operations/handoffs/founder/2026-08-03-stoa-ST2-entry-model-CLOSE.md` (ST2 is **DONE — built dark + migration APPLIED-INERT on TEST + PRODUCTION**, founder-walked §VERIFY green both; see its updated production-state line).
**Predecessor decision-log entries:** `D-STOA-ST2-ENTRY-MODEL-BUILT-DARK-2026-08-03` (+ its walk addendum), `D-STOA-ST1-COMMUNITY-MAP-REPAIRED-DEGRADED-2026-08-03`.
**Risk classification:** Elevated as a whole; **Critical for the declaration route's R20a wiring** (the Critical Change Protocol 0c-ii applies to that element — cite the cache §"Critical-risk sessions"; no flag flip, no schema, no mint this session, so AC7 is not engaged beyond the perimeter-addition decision itself). **PR19 independent adversarial review REQUIRED** (founder direction: every Stoa build; parallel independent `Agent` calls are the accepted Workflow-equivalent when the Workflow opt-in is absent — disclose each time).

## Why this session matters

ST3 makes the Stoa visible to humans: the `/stoa` page where a practitioner browses the colonnade, declares their own presence, and tends it. It consumes ST2's store exactly as built (no schema change, no new store semantics without cause) and carries the arc's one `code-critical` element — the declaration route joins the R20a human-distress perimeter, because free text a person writes about what they seek and offer is exactly the class of input the perimeter exists for. Everything ships dark: flag-off, the routes 503 and the page states the space is not yet open (or is nav-hidden — decided in-session); production stays byte-equivalent on push apart from inert registered routes.

## Grounded facts (as of 2026-08-03 — verify at open, do not re-derive)

- **ST2 state:** `stoa_entries` exists **empty + inert** on TEST + PROD (RLS deny-all, service-role-only grants, 10 CHECKs verified). `SUBSTRATE_STOA_ENABLED` is UNSET everywhere. The store is `website/src/lib/stoa/stoa-store.ts` — consume it, never bypass it: `declareStoaEntry(identity, input)` (defaults visibility community-for-human; refuses a second active entry `'already_declared'`; reactivates a withdrawn row), `readStoaEntryForIdentity`, `updateStoaEntry` (sets `renewed_at`, never `declared_at`), `renewStoaEntry` (the Q9 "is this still yours?" yes), `withdrawStoaEntry`, `listStoaEntries({scope, tag?, limit?, offset?})` (recency-only, cap 200), `isStoaEnabled()`. Field caps: 2000 chars/field, 12 tags, 40 chars/tag — route-level 400s should be friendlier than the store's generic errors.
- **The batteries and how ST3 must grow them:** `website/src/lib/stoa/__tests__/stoa-boundary.test.ts` (35/0) + `stoa-store.test.ts` (65/0) + `fake-stoa-supabase.ts`. **§B's reverse sweep WILL go red the moment an ST3 route imports the store** — that is by design: add each new ST3 file to `ALLOWED_REFERENCERS` deliberately (path-exact), and add any new `lib/stoa/` sibling file knowing §A scans the whole dir with the union extractor (import / `export … from` / dynamic / `require`) against the exact allowlist. Extend the allowlist only with justification the battery comments record. Every new pin gets a live mutation check (house standard).
- **R20a wiring precedent (the eleventh route, 2026-07-07):** `/api/score-conversation` — `await enforceDistressCheck(detectDistressTwoStage(...))` over the raw submitted fields BEFORE any other work; human audience ⇒ `renderR20aRedirectResponse` human form; per-field caps before composition; the `\n\n---\n\n` seam separator lesson (bare `\n\n` lets `\s+` bridge fields into a false acute); mild → proceed + additive `support_resources`. Registry: `r20a-invocation-guard` currently 11 route-level + 2 substrate-gate = 13 routes (92/0) — the Stoa declaration route becomes the twelfth route-level entry and the guard suite must be extended + re-run. House battery pattern: the `r20a-invocation.test.ts` files under the sibling routes.
- **AC5 recorded decision (make it in-session, in the route comment + the decision log):** the declaration + edit route (human free text) joins the perimeter; the browse/list route takes no free text (query/tag params only) and stays outside by the r20a-invocation-guard precedent — state both halves explicitly.
- **Flag discipline:** every ST3 route gates on `isStoaEnabled()` ⇒ honest 503 flag-off (house pattern; zero work, zero spend); the page renders a dark state. Flag-off byte-identity is battery-asserted (plan §4.4 — visibility-matrix tests BOTH flag states).
- **Reuse (PR15):** `requireAuth` + `corsHeaders` (`@/lib/security`); `profiles.display_name` for the entry's display identity (Q4b — never email); `SupportFooter` on the page (R20a §4 crisis exit, the Remaining-Principles precedent); the shared distress classifier; consult the Anthropic `frontend-design` skill for the page and `webapp-testing` for verification. NavBar/footer placement + `/glossary` entry are ST7-deferred (plan) — do NOT add nav links this session (the page is dark).
- **Uncommitted-tree note:** stage ONLY this session's files; the tree carries other sessions' strays.
- **Session honesty note from ST1/ST2:** the Gate-1/Gate-2 hooks have been 401'ing (transient server-side fail-secure class) — if that recurs, log it honestly in the close and proceed deliberately per the standing opener.

## The binding constraints ST3 encodes (plan §2 — cite each at its implementation site)

| # | Constraint | ST3 encoding |
|---|---|---|
| 1 | Per-entry visibility, declarer-chosen; human default community | The declare/edit form's visibility choice; default from the store |
| 2 | Community scope visible to any authenticated practitioner | Community entries require sign-in to view; public entries public |
| 3 | No reciprocity gate | Browse never requires declaring; no "declare to see" anywhere |
| 4 | Honest near-empty framing | The page names the colonnade-before-the-crowd state when the list is small — plain statement, never growth-hype |
| 5 | Passive shelf from DECLARED content only | Matches between the practitioner's own entry fields/tags and others' entries; own view only; no notification, no call to action; inputs pinned to declared fields (battery) |
| 8 | Recency-only ordering | The list renders `listStoaEntries` order verbatim — no client-side re-sort (pin it) |
| 9 | Search/filter permitted | Tag filter + plain text search over declarations (consultation of the resource) |
| 10 | Tags: domains, never qualities; suggested, never required | The seed vocabulary + its **deny-class battery** (the ST2-carried item): no evaluative term (`experienced`, `advanced`, `trusted`, `expert`, `senior`, `certified`, …) in the suggested list; free tags allowed but never required |
| 12 | Declaration date always displayed | `declared_at` (+ `renewed_at` when present) on every rendered entry |
| 15 | Self-declared framing by FORM | "In their own words" structure — first-person field labels; no platform-voice summary of a practitioner |
| 22/30 | The ethic + the canonical self-description | The mentor's two verbatim sentences as the page's presentation + the short kathekonta statement (contact scope, Q7) — verbatim-pinned in a battery |
| 24 | Staleness: gentle, in-product only | On one's OWN entry view after long ageing (threshold decided in-session; recommend ≥180d): "is this still yours?" + a renew action — no badge, no penalty, no expiry |
| 16/#23 | (Inherited) | No removal UI this session (founder-manual per plan ST7); no engagement capture anywhere — the page makes no analytics calls beyond the site's existing standard |

## ST2-carried items to discharge here

1. **Declare-route rate-limit/friction** — the withdraw→instant-re-declare recency bump is faithful-but-cycleable (PR19 adjudication); a modest rate limit on declare (reuse `checkRateLimit` with a NON-`scoring` bucket — the rate-limit-bucket lesson, memory `rate-limit-bucket-couples-to-measured-surface`) closes the lever.
2. **The #10 tag deny-class battery** (table above).
3. **Renewal-never-reorders** — if any in-session design pressure contests the reading of Q3a ("recency = when the declaration was made"), put it to the mentor rather than resolving by taste; otherwise carry as settled.

## Pre-conditions

1. The ST2 commit ("Stoa ST2: the stoa_entries entry model dark…") is **pushed, Vercel green with the confirmed hash** — verify at open (`git log origin/main`); if not pushed, the founder pushes first.
2. Read at open: plan §2 + §3 ST3 + §4; the verbatim Q1/Q2a/Q3a-e/Q5a/Q7/Q9/Q14 answers; the ST2 close in full; this prompt in full.
3. The founder present for the AC5 recorded decision (an in-session confirmation, not a walk — no SQL, no flag this session).

## Part A — Open under the protocol

1. `/adopted/standing-protocol-cache.md` (~3 min) — confirm tier (Elevated + the one Critical element), hold-point (P0 0h), model per the AC1 table (the distress classifier is Haiku via the shared module — no new model decision; page/route code has no LLM calls), status vocabulary, signals. KG1 engages (DB writes via the store).
2. The ST2 close + walk addendum; `/operations/decision-log.md` last 2 entries.
3. `git status` — know the tree; stage only this session's files.

## Part B — Procedure

### Step 1 — Design pass (record decisions briefly; AskUserQuestion only if genuinely contested)
Settle: the route shape (recommend `GET /api/stoa/entries` list [public sees public; authed sees community too] + `GET/POST/PATCH/DELETE /api/mentor/stoa` for own-entry CRUD via `requireAuth`, mirroring the Remaining-Principles route family — or a single `/api/stoa` family; pick one and record why); the dark-state rendering (503-behind-flag routes + a page that renders the self-description with "not yet open" — honest, mentor-register); the staleness threshold; the shelf's matching rule (declared tags ∩ + simple term overlap — deterministic, no LLM, no behavioural input); the seed tag vocabulary (~10–20 domain tags).

### Step 2 — The routes (dark)
All gated on `isStoaEnabled()` ⇒ 503. Own-entry CRUD: `requireAuth` → identity `{kind:'human', ownerUserId: auth.user.id}` → the store. **The declaration POST/PATCH runs the R20a check FIRST** (raw `what_i_bring` + `what_i_seek` + `contact_channel`, per-field caps, `\n\n---\n\n` seams) — moderate/acute ⇒ the human crisis rendering, no store write; mild ⇒ proceed + `support_resources` fold (follow the eleventh-route file layout: a small `stoa-r20a.ts` or inline per the score-conversation pattern). Friendly 400s ahead of the store caps. The list route: no auth for public scope; auth elevates to community; tag/search params; serve the store's order verbatim.

### Step 3 — The page (dark-aware)
`/stoa`: the canonical two-sentence self-description + the ethic (#22/#30, verbatim); browse with recency order, tag filter, search; the near-empty framing (#4); sign-in affordance for community scope (#2, #3 — browse never gated on declaring); own-entry panel (declare/edit/withdraw/renew, visibility choice, date display); the passive shelf on one's own view (#5); the staleness line (#24); `SupportFooter`. Use the `frontend-design` skill; match house styling (the Stage-pages/brand precedent).

### Step 4 — Batteries
Extend `stoa-boundary.test.ts`: ALLOWED_REFERENCERS + the new-file §A scope; a **shelf-inputs pin** (#5 — the matching function reads only declared fields; mutation-verify); a **no-client-resort pin** (#8); the **verbatim copy pin** (#22/#30); the **#10 deny-class battery** on the seed vocabulary. New route battery: the `r20a-invocation.test.ts` pattern on the declaration route (perimeter-first ordering, both flag states, audience rendering); visibility-matrix tests (#1/#2/#3) both flag states; flag-off byte-identity. Extend `r20a-invocation-guard` to the twelfth route + re-run. Store battery untouched unless the store changes (it should not need to).

### Step 5 — Verify
`tsc` 0; `npm run build` 0 (routes registered); all stoa batteries green; `r20a-invocation-guard` green at its new count; the sibling regression suites the guard names; mutation checks on every new load-bearing pin. No founder DB/flag walk this session — the deploy ships dark on the ordinary push.

### Step 6 — PR19 independent adversarial review
Fresh parallel reviewers, artifacts only, told not to trust the build's claims. Dimensions at minimum: **R20a wiring correctness** (perimeter-first, fail-posture never below the regex floor, audience rendering, the twelfth-route registry); **ruling-fidelity** (#1–#5, #8–#12, #15, #22, #24 as implemented; the shelf's declared-content-only claim; the near-empty framing's register); **auth/visibility matrix** (public/community/own-entry across anon + authed + flag states; no reciprocity gate); **battery adequacy** (new pins mutation-resistant; the deny-class list; flag-off byte-identity). Adjudicate + fold before close.

### Step 7 — Records (lean forms + the Critical-element additions)
Decision-log entry (`D-STOA-ST3-HUMAN-SURFACE-BUILT-DARK-...`) carrying the AC5 recorded decision + the PR19 disposition; lean close with the Critical-element sections (verification method, risk record); plan ST3 line; author the ST4 next-session prompt (the agent surface — carry plan §5 item ii, the declare-capability question, to it).

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Open + reads | 15–20 min |
| Step 1 design | 30–45 min |
| Step 2 routes + R20a | 60–90 min |
| Step 3 page | 60–90 min |
| Step 4 batteries | 45–60 min |
| Step 5 verify | 20–30 min |
| Step 6 PR19 + folds | 60–90 min |
| Records + ST4 prompt | 30–40 min |
| **Total** | **~5–7 hours** (splittable: Steps 1–3 one sitting, 4–7 another) |

## Rollback path

`git revert` the session commit — every route is flag-gated 503-dark and the page renders a dark state; ST2's table is untouched (no schema change this session). The R20a perimeter addition rides the same revert (the registry + guard suite revert with it).

## Forecast

Success: a human practitioner-facing colonnade exists dark — browse, declare, tend, withdraw — with the distress perimeter on the one route that takes a person's free text, every ruling pinned, and the batteries grown to cover the new surface. ST4 (the agent surface + R18 staging) follows, then ST5 (the founder-walked activation). Carried threads the founder sequences separately: the map-into-Stoa fold election (ST7); ST1's named follow-ups; the S11 items; 0h.

End of prompt.
