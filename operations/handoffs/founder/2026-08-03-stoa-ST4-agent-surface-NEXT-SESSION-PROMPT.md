# Next-Session Prompt — Stoa ST4: the agent surface + R18 staging (dark)

**Stream:** founder.
**Tier:** `code-elevated` — the build is dark behind the existing `SUBSTRATE_STOA_ENABLED` (UNSET everywhere); the public-surface/R18 changes are STAGED ONLY this session and applied at ST5 after founder sign-off (standing R18 discipline). No schema, no flag, no mint this session. The activation (flag + smokes + R18 application) is ST5, a founder-walked `code-critical` 0c-ii.
**Governing frame:** /adopted/standing-protocol-cache.md; the Stoa build plan §2 (all thirty constraints) + §3 ST4 + §4; **the binding verbatim records win** — `operations/connective-layer-2026-08/2026-08-02-mentor-consultation-connective-layer-verbatim.md` + `inbox/stoic network enquiry and mentor response.txt`.
**Predecessor session close:** `operations/handoffs/founder/2026-08-03-stoa-ST3-human-surface-CLOSE.md`.
**Predecessor decision-log entry:** `D-STOA-ST3-HUMAN-SURFACE-BUILT-DARK-2026-08-03`.
**Risk classification:** Elevated under 0d-ii (new agent-facing routes, dark; no auth-path change — the UPC chokepoint is consumed, never modified). **PR19 independent adversarial review REQUIRED** (parallel independent `Agent` calls are the accepted Workflow-equivalent — disclose each use).

## Why this session matters

ST4 makes the Stoa visible to agents and lets a developer declare an agent's presence — completing the one-space principle (humans and agents in the same colonnade, #2). It also stages (never applies) the machine-readable half of the space's ethic: the R18 surfaces that tell an agent what the space is and what it asks. After ST4, everything exists dark and ST5 is a pure activation walk.

## The carried open item this session SETTLES (plan §5 item ii)

**The agent-declare credential shape.** Owner-bound credential REQUIRED (the mentor's first answer: the *developer* declares for an agent; an owner-less credential has no accountable declarer). The open half: does declaring ride an existing UPC capability (`consult`) or a new `declare` capability (a 6e-precedent CHECK-widening question — a new capability means a migration + mint-surface change, escalating part of the session)? **Recommendation to put to the founder at open (AskUserQuestion): ride `consult` for v1** — declaring is a low-risk, reversible, rate-limitable act; a dedicated capability can be introduced later without breaking existing declarations (the store keys on agent_id, not capability). If the founder elects a new capability, that arm becomes its own founder-walked step.

## Grounded facts (as of ST3 close — verify at open)

- **ST3 state:** the human surface exists dark. Store: `website/src/lib/stoa/stoa-store.ts` (unchanged since ST2 — `declareStoaEntry` takes `{kind:'agent', agentId, credentialRef}` identities already; agent default visibility is `public` per #1; K1-canonical agent_id enforced strictly). Presentation: `stoa-presentation.ts` (`presentStoaEntry` already serves `kind:'agent'` + `agent_id`; the trust-record LINK is not yet rendered — that is this session's #19 work). R20a helpers: `stoa-r20a.ts`. Copy/tags: `stoa-copy.ts` / `stoa-tags.ts` (the ethic text is the machine-readable contract's source — reuse verbatim).
- **Existing routes:** `GET /api/stoa/entries` (anonymous → public; Supabase-JWT → community). ST4 adds the **credential presence arm**: a valid practice credential (`validatePracticeCredential`, consult capability, Bearer or X-Api-Key per the UPC transport rules — read `website/src/lib/practice-credential.ts` first) also elevates to community scope (#2). Recommended: extend the existing route with the credential check rather than duplicating the list logic; record the decision either way.
- **New route:** `POST /api/stoa/declare` (+ GET own entry / PATCH / DELETE for the agent identity — decide the exact shape at open; the mentor-route family's CRUD semantics port directly). Requirements: **owner-bound credential** (refuse owner-less with a clear 403 naming why — no accountable declarer), K1-canonical agent_id from the credential's binding (never caller-supplied free text), one entry per identity (#11), agent visibility default public (#1). **R20a/AC5:** agent-facing routes process AGENT-authored text, not human distress input — they sit OUTSIDE the human-distress perimeter by the established exclusion ("agent-facing endpoints … process agent output, not human distress input", r20a-invocation-guard header). Record that decision explicitly in-session (the AC5 recorded-decision discipline), and note the asymmetry honestly: the DEVELOPER is human, but the declaration path is credential-authenticated API traffic, matching the accreditation-write posture.
- **#19 (trust-record link):** agent entries in the served view gain `trust_record_url` (`/api/trust-record/{agent_id}`) + `accreditation_url` (`/api/accreditation/{agent_id}`) — LINKS only, with the honest "no examined record" line where a fetch of the trust record would 404. DESIGN CHOICE at open: whether the Stoa payload embeds an existence probe (a live lookup per entry — cost + coupling) or serves the links with the absence line as static wording ("where none exists the record reads honestly that none exists" — recommended: links + static wording; NO live probe, no coupling, #20 kept clean). The page may render the link on agent cards.
- **R18 staging (staged file, not applied):** an llms.txt section + an `agent-card.json` extension (working name `stoa-connective-layer/v1`) + an api-docs bullet, carrying: the canonical self-description (#30), the machine-readable ethic — the Q7 contact kathekonta binding agents identically (#21/#22, reuse `STOA_ETHIC`'s clauses), the route contracts, the honest no-verification/no-endorsement line (#13/#29), no-engagement-capture (#23), and the "listing confers no vetted standing" line (#29). Stage at `operations/connective-layer-2026-08/st4-r18-docs-staged.md`; the founder signs off before ST5 applies.
- **Battery expectations:** extend `stoa-boundary.test.ts` (§B allowlist gains the new route path-exactly; §J no-resort gains it; a pin that the declare route derives agent_id from the CREDENTIAL, never the body); a new per-route battery for the declare route (auth matrix: no credential 401 / owner-less 403 / consult-capability accepted / one-entry 409 / flag-off 503 both states); the guard registry is NOT extended (outside the human perimeter — assert that explicitly in the recorded decision). Mutation-verify every new pin.
- **Uncommitted-tree note:** stage only this session's files; the tree carries other sessions' strays.
- **Session honesty note:** the Gate-1/Gate-2 hooks have been 401/429-ing across ST1–ST3 (the known transient server-side fail-secure class; diagnosed at `gate1-consult-401-is-transient-fail-secure` — the dark-built lookup retry flag exists but is unactivated). If it recurs, log honestly and proceed deliberately.

## Pre-conditions

1. The ST3 commit is pushed, Vercel green with the confirmed hash (`git log origin/main`).
2. Read at open: plan §2 + §3 ST4/ST5 + §4; the verbatim Q1/Q4a/Q5c/Q6b/Q7/Q13 answers; the ST3 close in full; this prompt in full.
3. The founder present for the §5-item-ii election (AskUserQuestion at open).

## Part B — Procedure (compressed; the ST3 pattern ports)

1. **Open under the protocol** (cache ~3 min; tier; hold-point P0 0h; no new model decision — ST4 is deterministic, zero LLM calls; KG1 engages).
2. **Elections:** credential capability (above); declare-route shape; the #19 link form.
3. **Build dark:** the credential presence arm on the list route; the agent declare/tend routes; the #19 links in presentation (agent entries only); the page's agent-card link rendering (small).
4. **Stage the R18 docs** (file only — nothing public changes).
5. **Batteries + mutations;** tsc 0; `npm run build` 0.
6. **PR19** — fresh parallel independent reviewers (dimensions: credential-auth matrix / ruling fidelity #2 #13 #19 #21 #29 / R18-staging honesty vs the actual routes / battery adequacy). Adjudicate + fold.
7. **Records:** decision-log entry (with the recorded perimeter-exclusion decision + the capability election), lean close, plan ST4 line, author the ST5 activation-walk prompt (founder-walked `code-critical`: push → Vercel green → flag → the §3 ST5 smoke matrix → R18 application post-sign-off → rollback line). **The ST5 prompt must carry the ST3-carried checklist items:** verify Supabase **anonymous sign-ins are OFF** (an anonymous-auth user would pass `getAuthenticatedUser` and reach community scope with no identity floor — PR19 F5); note the q-filter pagination bound; and re-surface the row-level reactivation-guard question (the recency-cycling residual) for the founder/mentor.

## Anticipated shape

~4–6 hours (smaller than ST3 — no page build from scratch, no perimeter addition). Splittable at step 5.

## Rollback path

`git revert` the session commit — everything flag-gated 503-dark; the staged R18 file is repo-only; ST2's table and ST3's surfaces are untouched.

## Forecast

Success: agents can (dark) be declared into and browse the same colonnade humans use, the machine-readable ethic is staged for sign-off, and ST5 becomes a pure founder-walked activation. Carried threads the founder sequences separately: the map-into-Stoa fold election (ST7), subscriptions (#6, blocked on email), the Q5c/Q13a trust-event machinery (ST7), nav/glossary placement (ST7 — ride any adjacent session), the S11 items, 0h.

End of prompt.
