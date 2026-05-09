# Next-Session Prompt — Open agenda: founder elects post-M1-arc-close

**Stream:** founder.
**Tier:** TBD at session-open per founder election from candidate items below.
**Governing frame:** /adopted/standing-protocol-cache.md (operative reference).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-08-M1-CP6-post-audit-close.md` (extends `/operations/handoffs/founder/2026-05-08-M1-CP6-close.md` — the post-audit sub-session captured a consumer audit + `/api/keys` fix + Test 7 validation; 5 additional carry-forwards surfaced and bundled into Item I below).
**Predecessor decision-log entry:** `D-M1-CP6-CUTOVER-2026-05-08` (M1 arc complete; Layer 3 module Live; eight original open questions tracked + 5 carry-forwards added at the post-audit sub-session; 2F architectural arc deferred per PR7).
**Risk classification:** TBD per elected item.

## Why this session matters

M1 arc closed. Translation-sandwich is Live on `/api/reason`. The project is in a known-good state — no immediate next-session is required. This prompt surfaces candidate work items so the founder can elect direction at session-open. The candidate items range from architectural (2F arc continuation) to operational (cost monitoring restoration) to governance (Q5 / PR8 promotion) to maintenance (post-cutover watch deep-dive) to hygiene (post-cutover audit + auth-path restoration — Item I, added at the M1-CP6 post-audit sub-session) to project-level (M2 scoping). The founder may also elect to **stabilise and pause** — no work required.

## Pre-conditions

1. **All M1-CP6 commits pushed (cutover commit + `/api/keys` fix commit + governance bundle).** Vercel green; production behaviour stable on the new translation-sandwich-v1 schema. Verify before session-open via the Independent verification block in `/operations/handoffs/founder/2026-05-08-M1-CP6-post-audit-close.md` §"Founder Verification (Between Sessions)" Step B.
2. **M1 arc closure acknowledged.** No outstanding work items from M1 are blocking the next session — eight open questions are watch items, not blockers.
3. **2F clarifying questions pre-considered (if 2F is elected).** If the founder elects 2F arc continuation, the four open clarifying questions captured in `D-M1-CP6-CUTOVER-2026-05-08` deferred-decision section need answers at session-open: (i) Opus model version; (ii) replace or augment Layer 3; (iii) Component A scoring scope vs R6c; (iv) raw-data scope. Founder may pre-think; not all four must be answered to begin scoping.

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier, model selection, risk class, signals).
2. `/operations/handoffs/founder/2026-05-08-M1-CP6-post-audit-close.md` (~5 min — most recent predecessor close; consumer audit findings; `/api/keys` fix; 5 new carry-forwards bundled in Item I) AND `/operations/handoffs/founder/2026-05-08-M1-CP6-close.md` (~5 min — M1-CP6 cutover proper; status changes; original eight open questions).
3. **For 2F election only:** `D-M1-CP6-CUTOVER-2026-05-08` deferred-decision section (~3 min — captures founder's underlying intent + four clarifying questions + governance work + sequencing recommendation).
4. **For post-cutover watch / M2 scoping / cost monitoring:** the relevant section of the predecessor close (Open Questions / Production state).

Confirm at open: tier (TBD per elected item); hold-point status (P0 0h active); model selection (cite cache row at item-time); status vocabulary; signals/risk class.

## Part B — Founder election at session-open

The founder elects ONE primary item below. Other items are deferred to subsequent sessions.

### Item A — 2F architectural arc continuation (Layer 3b Opus contextualization)

**Founder's underlying intent (captured at M1-CP6 session-open):** preserve bundled engine's input-specific responsiveness — what bundled offers that sandwich Layer 3 (Sonnet) doesn't fully capture — by adding a new layer that takes raw input + raw user data + Layer 2 deterministic assessment, and produces input-specific contextualizing prose via a more capable LLM (Opus). Three components surfaced (A — numerical scoring; B — current Sonnet Layer 3 prose unchanged; C — new Opus call).

**First-session scope (2F-CP1):** founder answers the four clarifying questions. AI drafts ADR-009 (or ADR-004 amendment) specifying the new layer's module surface, prompt template, max tokens, temperature, system prompt structure, raw-data scope, fallback semantics. AI drafts AC1 amendment adding Opus row. AI drafts R6c reconciliation depending on Component A scope. AI drafts R5 cost projection update. ADRs land in `/drafts/adr/`; founder approves; ADRs move to `/adopted/adr/`.

**Risk class for first session:** Standard (governance — documentation only; no production touch).

**Estimated:** 3–5 hours for 2F-CP1. Multi-session arc thereafter (~5–7 sessions to land Live equivalent of M1-CP6 cutover).

**Pre-work founder may bring:** answers to the four clarifying questions; any cost ceiling or latency budget preferences; any raw-data scope preferences (mentor profile / journal entries / interaction history / etc.).

### Item B — Post-cutover watch deep-dive

**Scope:** investigate the eight open questions against live (post-cutover) traffic. Specifically:

(i) Q3 — F8 SCOPE_AMBIGUITY non-fire investigation. Submit the F8 fixture pattern to live `/api/reason`; observe whether the Layer 1/Tier 1 detector fires SCOPE_AMBIGUITY now that the engine is user-facing. If it does, Q3 closes. If it doesn't (3rd recurrence), escalate to Layer 1 review session.

(ii) Q4 — L3 latency creep. Observe live sandwich-only latency against the 20,000 ms watch threshold. If observations approach threshold, surface for prompt-trimming review.

(iii) `value_assessment.identified_value_errors` null observation. Audit Layer 2 module's `identified_value_errors` field population logic; understand whether Revision 6 prose is sourcing from Layer 1's `value_categories_at_stake` (per M1-CP5b Gap 6 disposition) or Layer 2's `identified_value_errors`.

(iv) Causal-stage sample bias. Run broader fixture coverage; observe whether sample-bias resolves with more data.

(v) **NEW (added 2026-05-09 sub-item (vii) verification)** — engine tied-option discrimination on `/api/score-decision`. Surfaced live during sub-item (vii) verification: a real two-option business decision returned both options at identical `katorthoma_proximity: deliberate` + `is_kathekon: true` + `kathekon_quality: strong`. The route's stable sort then picks the array-first option as recommended. Observation: the engine doesn't currently discriminate between strongly-tied options where one might genuinely be more virtuous than the other. May be a Layer 3 prose-template gap (the prose differentiates the options qualitatively but the structured fields don't) or a deliberate engine design (the Stoic position that virtue is binary — either present or not — and proximity is qualitative not quantitative). Worth investigating: are the two options' `stoic_insight` paragraphs internally consistent with the identical proximity scoring, or do they imply different proximity levels that the structured field doesn't capture?

**Risk class:** Standard (read-only analysis against live data; no code change unless an issue is found).

**Estimated:** 2–4 hours.

**Pre-work founder may bring:** any specific concerns surfaced from live-traffic observation since cutover.

### Item C — M2 scoping (next consumer migration)

**Scope:** elect M2 target — score family (`/api/score`, `/api/score-decision`, `/api/score-document`, `/api/score-scenario`, `/api/score-social`) per ADR-003 migration sequence, OR mentor family (`/api/mentor/private/reflect` + others), OR another consumer. AI surfaces consumer-by-consumer differences; founder elects scope. AI drafts M2 multi-session checkpoint structure analogous to M1 (M2-CP1 → M2-CP6 minimum) as an ADR-010 (or similar). Per PR1 single-endpoint discipline, M2 inherits the verified pattern from M1.

**Risk class for first session:** Standard (governance — scoping work).

**Estimated:** 1–2 hours scoping; multi-session arc thereafter.

**Pre-work founder may bring:** any preference on M2 target; any awareness of consumer-specific constraints (e.g., M3 mentor family touches private intimate data per R17 — adds intimate-data-protection considerations on top of the architectural migration).

### Item D — Cost monitoring restoration on `/api/reason`

**Scope:** wire `incrementCostTracker` (or equivalent) into `runSandwich` so R5 cost-as-health-metric monitoring returns. Pre-cutover, sandwich cost was tracked via `incrementCostTracker` inside `runParallelSandwich`; that path is no longer called from `/api/reason` post-cutover. Two implementation options: (i) move cost tracking into `runSandwich`; (ii) wrap `runSandwich` at the route level with a cost-tracking adapter.

**Risk class:** Standard (additive; no user-facing change; observability restoration).

**Estimated:** 30–60 minutes.

**Pre-work founder may bring:** any preference on which approach (in-sandwich vs route-wrapper); any preference on cost-cap policy post-cutover (currently no cap on production sandwich; the pre-cutover cap was specifically for parallel-run cost discipline).

### Item E — Q5 promotion to permanent KG entry (preemptive)

**Scope:** Q5 is at 5+ observations across multiple domains: SQL/JSONB-path; code-line-number; production-code-vs-schema column references (`/api/keys` POST + GET + `/api/usage`); and as of 2026-05-09 sub-item (vii) verification, also at the LLM-output level — a single `/api/score-decision` response returned the same passion in two different formats across two adjacent options ('philodoxia' / 'agonia' on option 1; 'Philodoxia (love of reputation/recognition)' / 'Agonia (anxiety about future catastrophe)' on option 2). The Layer 3 prose template isn't enforcing canonical taxonomy on every option-evaluation pass. Update `/operations/knowledge-gaps.md` with a Q5 permanent entry naming the pattern: schema-vs-vocabulary drift includes time references, column names, JSONB paths, code line numbers, configuration references, and LLM output controlled-vocabulary enforcement. The pattern is well past third-recurrence threshold.

**Risk class:** Standard (governance — documentation update).

**Estimated:** 30 minutes.

### Item F — PR8 promotion to permanent process rule

**Scope:** the in-place ADR amendment pattern is at 7th recurrence. Founder elected to hold PR8 promotion at multiple prior sessions. Pattern is well-established. Founder may elect promotion at any subsequent ADR-amending session. Update `/manifest.md` Process Rules section to add PR8 as a permanent process rule naming the in-place ADR amendment pattern + revisit conditions.

**Risk class:** Standard (governance — manifest update).

**Estimated:** 30 minutes.

### Item G — Routine governance / cache-drift / index update

**Scope:** sweep for any drift between manifest / cache / project instructions; update `/INDEX.md` if any new files were added across the M1 arc; verify `D-CACHE-DRIFT-…` entries are current; ensure all decision-log entries from M1 arc cross-reference correctly.

**Risk class:** Standard (governance — documentation maintenance).

**Estimated:** 30–60 minutes.

### Item H — Stabilise and pause

**Scope:** no work this session. M1 arc closure is acknowledged; production state is stable; next-session is deferred to founder's next initiative. The candidate items above (and Item I below) remain available; this prompt remains the entry point for whichever direction the founder elects next.

### Item I — Post-cutover hygiene + auth-path restoration

**Scope:** bundles 8 carry-forwards related to the post-M1-CP6-cutover surface — 5 surfaced during the M1-CP6 post-audit sub-session (consumer audit on 2026-05-08), 1 (sub-item (vi)) added at the 2026-05-09 sub-item (i) session, 1 (sub-item (vii)) added at the 2026-05-09 sub-item (vi) session, and 1 (sub-item (viii)) added at the 2026-05-09 sub-item (vii) post-deploy verification. Sub-items (i) **[CLOSED 2026-05-09 — see `D-ITEM-I-i-AUTHFETCH-MIGRATION-2026-05-09`]**, (vi) **[CLOSED 2026-05-09 — see `D-ITEM-I-vi-AUTHFETCH-COMPANION-2026-05-09`]**, (ii) + (iii) + (vii) **[ALL CLOSED 2026-05-09 — see `D-ITEM-I-ii-iii-vii-COLUMN-AND-PAYLOAD-FIXES-2026-05-09`]** plus a same-session follow-up render-fix on mentor-hub committed standalone (mentor-hub crashed rendering the now-200 score-conversation response object as React child; fixed by extracting `result.overall.reasoning` string with safe fallbacks; verified live). Remaining 3 sub-items: (iv) + (v) + (viii) — pre-existing documentation update (iv), transient browser issue investigation (v), and consumer-page-vs-API-shape adaptation (viii). (viii) is consumer-side adaptation following the cutover that the original audit did not surface. May be elected together or independently per founder discretion. In rough priority of user impact:

(i) **[CLOSED 2026-05-09]** **`/private-mentor` + `/mentor-hub` + `/ops-hub` plain `fetch()` → `authFetch` migration.** Highest user impact — these three pages are user-facing reasoning surfaces that have been broken on auth (documented in `/admin/test-reason/page.tsx` lines 11–14). Three pages × ~5 LOC each = trivial diff. Standard tier (additive — restoring intended behaviour). Estimated 30–45 min including post-deploy verification on each page. **Closed via `D-ITEM-I-i-AUTHFETCH-MIGRATION-2026-05-09`; session close at `/operations/handoffs/founder/2026-05-09-item-I-i-authfetch-migration-close.md`. Verified live on all three pages.**

(ii) **[CLOSED 2026-05-09]** **`/api/usage/route.ts` line 43 — `user_id` → `owner_user_id` column-name fix PLUS expanded scope (founder elected at session-open) restructuring the api_key_usage query at lines 64-93.** Closed via `D-ITEM-I-ii-iii-vii-COLUMN-AND-PAYLOAD-FIXES-2026-05-09`; session close at `/operations/handoffs/founder/2026-05-09-item-I-ii-iii-vii-close.md`. Endpoint moved Wired-but-broken → Live within schema's expressive limits (`daily_trend` field dropped because schema doesn't store historical daily values; `daily_calls_today` substituted). Founder verifies post-deploy via DevTools Network on a /api/usage call.

(iii) **[CLOSED 2026-05-09]** **`/api/keys` GET api_key_usage column-name mismatch.** Closed via the same bundle entry above. Lines 38-46 column-name corrections (`monthly_total` → `total_calls`, `daily_total` → `daily_calls`, `day` → `current_day`) in the SELECT + filter + downstream references. Endpoint moved Wired-but-broken → Live on the GET path. Founder verifies post-deploy via DevTools Network on a /api/keys GET call.

(iv) **Public agent-discovery + skill-wrapper documentation update.** `/.well-known/agent-card.json`, `/llms.txt`, `/openapi.yaml`, and `/public/wrappers/*.md` all describe the OLD bundled-depth response shape. Update to reflect translation-sandwich-v1 (new top-level fields: `version`, `extraction`, `assessment`, `prose`, `meta`, `disclaimer`). Reduces the R10 / 3c trade-off cost retroactively for any external agents reading the descriptors going forward. Standard tier (documentation only). Estimated 45–60 min.

(v) **React hydration errors investigation.** `/private-mentor` + `/mentor-hub` + `/ops-hub` (and possibly `/admin/test-reason`) show React errors #418, #423, #425. Likely cause: service-worker cache + Vercel-rebuild interaction (the `[Sage] Journal service worker registered` log line accompanies the errors). Diagnostic step from M1-CP6 post-audit chat: hard refresh + service-worker unregister via dev tools → Application → Service Workers. Investigation tier: Standard (read-only diagnostic) → Elevated if a code fix is needed. Estimated 30 min investigation; fix scope TBD (could be additive — skip the service worker for affected pages — or no-fix and document the workflow for users encountering the issue post-deploy).

(vi) **[CLOSED 2026-05-09]** **Out-of-scope plain `fetch()` calls — `/api/score-conversation` (mentor-hub line 152) + `/api/score-decision` (ops-hub line 68; predecessor prompt cited line 67).** Closed via `D-ITEM-I-vi-AUTHFETCH-COMPANION-2026-05-09`; session close at `/operations/handoffs/founder/2026-05-09-item-I-vi-authfetch-companion-close.md`. Verified live on both call sites with status **400** in DevTools Network (NOT 401 — auth migration confirmed working; the 400 came from a pre-existing payload-shape mismatch surfaced as new sub-item (vii)).

(vii) **[CLOSED 2026-05-09]** **Payload-shape fixes on `/api/score-conversation` + `/api/score-decision` page-side request bodies.** Closed via `D-ITEM-I-ii-iii-vii-COLUMN-AND-PAYLOAD-FIXES-2026-05-09`; session close at `/operations/handoffs/founder/2026-05-09-item-I-ii-iii-vii-close.md`. Mentor-hub `{input}` → `{conversation}` single-field rename; ops-hub `{option1, option2}` → `{decision, options: [...]}` per founder-elected option (b) — added `decisionQuestion` state + a third "Decision Question" textarea above the two option boxes (best fidelity to /api/score-decision design intent). Both call sites moved from 400-on-payload-validation to working state. Verified live. Same-session follow-up: the 200-with-object response on `/api/score-conversation` initially crashed mentor-hub's React render (set the score-data object as opinion text directly); fixed in standalone follow-up commit by extracting `result.overall.reasoning` as the displayed analysis string with safe fallbacks; also verified live.

(viii) **Consumer-page-vs-API-shape adaptation following M1-CP6 cutover.** The translation-sandwich-v1 response shape (`{version, extraction, assessment, prose, meta, disclaimer}`) replaced the bundled-engine shape on `/api/reason` at the cutover. Internal consumer pages still read `data.result || data.response` per the bundled shape; on the new shape both fields are undefined, so pages fall through to placeholder strings or raw JSON dumps. Not a regression — the pages don't crash — but the user-visible reasoning has been blank/raw on these surfaces since the cutover. Three known instances:

  - **Mentor-hub mentor reply** (`/mentor-hub` line ~131): reads `data.result || data.response || 'I acknowledge your message.'`. Post-cutover always falls to the placeholder. Real reasoning prose lives at `data.prose.assessment_prose` (or wherever the front-facing prose is in translation-sandwich-v1 — needs route-handler audit to confirm field name). Same fix pattern as the score-conversation render-fix applied this session.
  - **Ops-hub Decision Scoring display** (`/ops-hub` Morning Briefing → Decision Scoring view): reads `String(scoringResult.comparison || JSON.stringify(scoringResult.result || scoringResult, null, 2))`. `comparison` is not in the route's response shape; falls through to JSON dump. Verified live this session — user sees raw JSON instead of presentable view. Need a polished view of `result.options_scored` (the two ranking entries with their `stoic_insight` paragraphs + per-option `passions_detected`) + `result.recommended` + `result.reasoning_receipt` summary.
  - **Ops-hub Stoic Check + Alert evaluation** (both call `/api/reason`): page reads `stoicResult.reasoning` and similar; post-cutover those fields don't exist so the displays may also be partly blank or showing JSON dumps. Audit needed.
  - **`/private-mentor`**: not yet audited for this same family of issue; may need same adaptation.

  Standard tier (additive client-side adaptation; no auth/perimeter touched). Estimated 1.5–3 hours depending on how many surfaces need adaptation + how much display polish is desired. Two-session split is reasonable: session 1 = mentor-hub + private-mentor reading adaptation; session 2 = ops-hub display polish.

**Risk class:** Standard for remaining items (iv) + (v) + (viii). All Elevated-tier work in Item I has now closed (sub-items (ii) + (iii) closed 2026-05-09). Critical Change Protocol NOT engaged for any remaining sub-item.

**Estimated total:** ~2.5–4.5 hours for the full remaining bundle ((iv) + (v) + (viii)), or split across multiple sessions per founder discretion. Sub-item (viii) is the largest of the three (1.5–3 hr) given the multiple-surface scope; (iv) is medium (45–60 min); (v) is smallest (30 min).

**Pre-work founder may bring:** any preference on scope (bundled vs split); any preference on which of (iv) / (v) / (viii) is higher priority (sub-item (viii) has the most user-visible impact since it restores real reasoning prose on three reasoning surfaces); for sub-item (viii), any preference on adaptation depth (minimum string-extraction fix vs. full presentable-display polish on ops-hub).

## Part C — Anticipated session shape

| Phase | Item A | Item B | Item C | Item D | Item E | Item F | Item G | Item I |
|---|---|---|---|---|---|---|---|---|
| Cache + predecessor close read | 10 min | 10 min | 10 min | 10 min | 10 min | 10 min | 10 min | 10 min |
| Founder election + framing | 5–10 min | 5 min | 5–10 min | 5 min | 5 min | 5 min | 5 min | 5–10 min |
| Substantive work | 2–3 hr | 1.5–3 hr | 1 hr | 20–40 min | 15 min | 15 min | 30–45 min | 2–4 hr |
| Decision-log + close (lean) | 30 min | 20–30 min | 30 min | 20–30 min | 20 min | 20 min | 20–30 min | 30 min |
| **Total** | **~3–4 hr** | **~2–4 hr** | **~1.5–2 hr** | **~1 hr** | **~50 min** | **~50 min** | **~1–1.5 hr** | **~3–5 hr** |

For Item H (stabilise + pause): no session.

For Item I split (sub-items (i)+(ii)+(iii) in one session, (iv)+(v) in another): each split session ~1.5–3 hr.

## Rollback path

Per item:

- Item A (2F-CP1 ADR drafting): `git revert` of ADR-drafting commit; no production touch.
- Item B (post-cutover watch): read-only analysis; no rollback needed.
- Item C (M2 scoping): `git revert` of scoping ADR commit; no production touch.
- Item D (cost monitoring): Standard rollback — `git revert` of the wiring commit; no user-facing impact.
- Items E + F + G: documentation-only; `git revert` reverses cleanly.
- Item H: N/A.
- Item I per sub-item: (i) `git revert` of authFetch migration commits — restores broken auth state (no further regression possible — pages were already broken); (ii) + (iii) `git revert` of column-name fix commits — restores broken state on those endpoints; (iv) `git revert` of docs update — restores docs to old shape; (v) read-only investigation — no rollback; (vii) `git revert` of payload-shape commits — restores 400-validation-error state; (viii) `git revert` of consumer-page adaptation commits — restores placeholder/JSON-dump display state (no further regression possible — pages were already showing placeholders/JSON post-cutover). All Standard or Elevated; no Critical-tier rollback discipline needed.

## Forecast

**Most-likely paths:**

- **Item I sub-item (i) (auth-path restoration on `/private-mentor` + `/mentor-hub` + `/ops-hub`)** **[CLOSED 2026-05-09]** — was the most user-impacting carry-forward; closed via `D-ITEM-I-i-AUTHFETCH-MIGRATION-2026-05-09`. Three pages now Live on /api/reason auth path; verified live with full Layer 1 + Layer 3 sandwich response.
- **Item B (post-cutover watch)** is the cheapest first session — read-only analysis against live traffic; produces evidence informing whether Q3 / Q4 / F4 close naturally or escalate.
- **Item D (cost monitoring restoration)** is hygiene; pairs well with Item B (observing post-cutover behaviour benefits from cost observability) or with Item I (both are post-cutover hygiene; could be done in the same session).
- **Item I remaining bundle** (sub-items (iv) + (v) + (viii) — three remaining post-(ii)+(iii)+(vii)-closure) — documentation update + transient browser issue investigation + consumer-page-vs-API-shape adaptation. ~2.5–4.5 hr if bundled; split across multiple sessions reasonable.
- **Item A (2F arc)** is the most ambitious and most aligned with founder's M1-CP6 brainstorm. Founder elects when ready (may want to sit with the cutover for some time first).

**Recommendation (not prescription):** With Item I sub-items (i) + (ii) + (iii) + (vi) + (vii) all closed 2026-05-09, the user-impacting hygiene work is largely complete on the API-shape side; **sub-item (viii) is the next user-visible piece** — three reasoning surfaces currently show placeholder text instead of real reasoning, and ops-hub Decision Scoring shows raw JSON. Natural next steps in rough priority order: Item I sub-item (viii) (restores real reasoning + presentable display on user-facing surfaces; highest user impact remaining). Then Item B (post-cutover watch — cheapest read-only first session, observes live behaviour against the eight original open questions plus the new tied-option-discrimination observation surfaced 2026-05-09) + Item D (cost monitoring restoration — observability hygiene that pairs naturally with B). Then Item I sub-items (iv) + (v) bundled (documentation + diagnostic). Then Item E (Q5 promotion — pattern is now at 5+ observations spanning schema/code/prompt/LLM-output domains; well past third-recurrence threshold; passion-name formatting drift surfaced this session reinforces the case). Item A 2F arc when founder is ready. Items F + G can be folded opportunistically.

The founder elects. The above is information for the choice, not a prescription on it.

End of prompt.
