# Next-Session Prompt — Section D closure: Support's channel + the remaining org decisions

**Stream:** founder (Agent-Organization + Evidence Program — closing the last open section of the go-live readiness checklist before the founder's own 0h call).
**Tier:** split, decision-dependent. Opens `governance` for grounding + the founder's own decision forks (AskUserQuestion, no code). **The build tier for Support's #11 resolution is NOT pre-decided here** — it depends entirely on which of the two paths the founder elects in Step 2 below: mounting the existing run-loop is plausibly `code-critical` (new automated processing of user-submitted support content, wired to a live caller for the first time — its own full Critical Change Protocol); confirming/staffing manual triage + correcting the manual's stale claim is `governance`/`code-standard` (a documentation correction + an ownership confirmation, no code path change). #12 and #15 are pure founder decisions, `governance` once made.
**Predecessor session:** `operations/handoffs/founder/2026-07-22-P4-agent3-growth-calling-and-provisioning-CLOSE.md` (the session whose own recommendations, accepted by the founder, generated this prompt).
**Predecessor decision-log entries:** `D-P4-AGENT3-GROWTH-CALLING-AND-PROVISIONING-2026-07-22` (+ its same-session addendum, which records the founder's acceptance and the reasoning behind reprioritizing this session); `D-AGENT-ORG-P-GL-FINISH-MENTOR-WIRING-AND-CHECKLIST-CLOSED-2026-07-20` (the session that established Section D as the *only* remaining checklist section before 0h).
**Risk classification:** Standard for the grounding reads and the decision forks themselves (documents + AskUserQuestion, no live op). **Critical Change Protocol applies conditionally** — only if the founder elects Path A (mount the run-loop) in Step 2; engage it in full at that point, not before.

## Why this session matters, and what NOT to re-derive

This is not a routine next item in a queue — it is **the last open section of the go-live readiness checklist** (`operations/agent-org-2026-07/go-live-readiness-checklist.md`), the artifact the founder's own 0h launch call is meant to rest on. The P-GL finish session's own close states this in as many words: *"only the founder-ownership Section D items and the 0h call itself remain."* Every other launch-gating build and verification item (Sections A/B) is already ✅ VERIFIED-LIVE. This session — or a short sequence of sessions if Support's own resolution turns out to need its own build — is what actually clears the runway.

**Do not re-derive what P1 and this program already found. Reuse it:**

1. **Section D has 7 routed items**, not just Support (`go-live-readiness-checklist.md` §D, lines ~80-92): #11 (support@ monitoring), #12 (human-escalation owner), #15 (email platform), #18 (session-continuity design question), #21 (rollback/incident owner), #22 (migration-management tooling), #27 (support-analytics/SLA dashboard).
2. **Two of the seven already have a partial answer — do not re-decide them, just confirm and cite.** Ops's own signed calling document (`operations/agent-org-2026-07/ops-calling-v1.md` §3) already names Ops as the "tracking/reminder owner" for both **#21** (the incident/rollback runbook — "Ops may propose runbook content; the founder approves and, at incident time, executes") and **#22** (migration-strategy formalization — "Ops may draft a tracked convention... it never applies a migration itself"), per P1 §4.1's own recommendation, executed live at Ops's P4 provisioning session. The *founder-ownership question* for #21/#22 is answered (Ops tracks, the founder still holds every credential and makes every substantive call); the *actual content* (a drafted runbook, a drafted migration convention) is separate future Ops-session work, not this session's job.
3. **#18 is already effectively resolved as a non-gap, not a genuine open item.** The 2026-07-19 launch-feedback reconciliation found session-continuity (a stateful within-session context for the reasoning engine) would conflict with the deliberately stateless, per-instance signed scoring the accreditation/trust model depends on — a design question with an already-recorded answer ("not needed as stated"), not an unresolved ownership gap. Confirm this reading is still current, then mark it closed with that citation; do not re-open the design question itself.
4. **#27 is blocked on #11/#12, not independently resolvable.** P1 found it "presupposes a support/ticketing operation + SLAs that don't exist yet." Resolve #11/#12 first; #27 either becomes tractable or stays explicitly deferred — don't force it.
5. **The founder's own accepted recommendation from the predecessor session was to resolve #11 independent of Gate-1 harnessing entirely.** Do not frame this as "should Support get a Gate-1 harness like Tech/Ops/Growth" — P1 already found that fit poor (Support's real work, drafting replies and triaging tickets, doesn't naturally happen in a terminal loop) and the founder's accepted recommendation explicitly routes around that pattern.
6. **The manual overstates what is live — this is a known, already-diagnosed finding, not something to re-investigate from scratch.** `SageReasoning_Support_Agent_Manual.docx` states "everything described here is already deployed and running." P1 confirmed this is false for the automated run-loop specifically: `processInboxItemWithGuard` (`sage-mentor/support-agent.ts:880`) is designed and unit-tested but has **zero callers anywhere in the codebase** (confirmed by grep, last touched 2026-04-20). What IS actually live: founder-manual triage of markdown files in `support/inbox/`, plus a `mailto:support@sagereasoning.com` intake whose monitoring is explicitly unconfirmed (`terms/page.tsx`'s own comment: *"Pre-launch: confirm support@ is configured and monitored"*). Re-confirm this is still accurate (code moves; re-grep, don't just cite), but don't re-run the whole diagnostic from zero — it's already done.
7. **A second contact address exists and needs folding in.** P1's own light R18 rider found `zeus@sagereasoning.com` named in `agent-card.json` (the free-key-request/token-issuance contact) alongside `support@sagereasoning.com` — neither address's monitoring status is independently verifiable from the repo. Whatever decision resolves #11/#12 should name an owner for both addresses, not just one.

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min).
2. `operations/handoffs/founder/2026-07-22-P4-agent3-growth-calling-and-provisioning-CLOSE.md` (predecessor — the session that generated this prompt) and its decision-log entry's addendum.
3. `operations/agent-org-2026-07/go-live-readiness-checklist.md` §Section D in full (the artifact this session closes) and §"Go/no-go posture" (the summary the 0h call rests on).
4. `operations/handoffs/founder/2026-07-20-P-GL-finish-CLOSE.md` (established Section D as the sole remaining gate).
5. `operations/agent-org-2026-07/P1-agent-roster-gap-analysis.md` §3 (the gap map), §4.1/§4.4 (the recommendations this session executes), §4.4's own bundling suggestion, §6 (the two-contact-address finding).
6. `operations/agent-org-2026-07/ops-calling-v1.md` §3 (confirming Ops's own #21/#22 tracking-owner coverage, so this session doesn't re-decide it).
7. **Fresh re-reads, per the standing "load current build-state first" precondition this whole program established** (do not trust any older summary, including this prompt's own §6 above, without re-confirming): `operations/handoffs/support/support-wiring-fix-close.md`, `operations/handoffs/support/support-wiring-mount-close.md`, `operations/Support_Agent_Implementation_Plan.md`, `operations/SageReasoning_Support_Agent_Manual.docx` (via `textutil` — the Read tool cannot open `.docx`), `operations/inter-agent-handoff-protocol.md`.
8. `/CLAUDE.md`'s "Live in production" / "Built but inert in production" lists — confirm nothing relevant has changed since P1's session.

Confirm at open: tier (split, decision-dependent — restate once the founder's Step 2 election is known); hold-point P0 0h (active — this session is precisely the evidence-gathering work the 0h call depends on); model selection N/A unless the Support build path needs one; status vocabulary; signals + risk classification (re-classify explicitly once Step 2 resolves).

## Part B — Procedure

### Step 1 — Re-confirm Support's actual current state (governance, read-only)
Re-grep `processInboxItemWithGuard` and `sage-mentor/support-agent.ts` for any caller added since P1's session (2026-07-20). Re-check `terms/page.tsx`'s live comment about `support@` monitoring. Confirm `zeus@sagereasoning.com`'s status is still unverifiable from the repo. Report findings plainly — if anything has changed, say so; if nothing has, say that too, rather than assuming staleness or freshness either way.

### Step 2 — Present the Support fork (AskUserQuestion, the centerpiece decision)
Two real paths, named honestly with their actual cost:
- **Path A — mount the existing run-loop.** Wire `processInboxItemWithGuard` to a real caller (a cron, a manual trigger endpoint, or something else — this itself needs scoping once elected). Genuinely automates support-ticket processing for the first time. Higher build cost, higher review burden (very plausibly `code-critical` — new automated processing touching user-submitted content on a vulnerable-user-adjacent product), but closes the gap for real rather than just disclosing it.
- **Path B — confirm manual triage as the standing choice, and correct the record.** No code change. Correct the manual's "already deployed and running" overstatement to reflect reality (founder-manual triage + a monitored mailbox). Confirm (or arrange) that `support@` and `zeus@` are both actually watched by a real person on some cadence, and name who. Lower cost, resolves the actual safety concern (a watched channel) without inventing automation the founder may not want yet.

Do not default to either — P1 itself found the org-urgency/evidence-fit split hardest here, precisely why this needs an explicit founder call, not an AI recommendation baked in.

### Step 3 — Execute per the founder's election
- **If Path A:** stop, scope a dedicated build plan (this may need to be its own follow-up session rather than continuing in this one, given the Critical-tier weight) — do not improvise a live automated support surface inside an otherwise-`governance` session.
- **If Path B:** correct the manual's overstated claim; confirm the founder's own monitoring arrangement for both `support@` and `zeus@sagereasoning.com`; update `terms/page.tsx`'s comment to reflect the confirmed (not merely aspirational) state.

### Step 4 — Resolve #12 and #15 (quick founder decisions, AskUserQuestion)
- **#12 — human-escalation owner:** who handles a person who needs a person, not an agent — the founder, a contractor, or a named vendor.
- **#15 — email platform:** select and note the intended platform (or confirm the status quo `mailto:` is the deliberate choice for now).
Both are, per P1 §4.4, "near-zero build cost once decided" — resolve them here rather than deferring further.

### Step 5 — Confirm #18/#21/#22/#27 dispositions (no new decision, just citation + checklist update)
- #18: cite the reconciliation's existing finding; mark closed as a non-gap.
- #21/#22: cite Ops's calling document's existing tracking-owner assignment; mark "owner assigned (Ops); content drafting is Ops's own future work."
- #27: mark "blocked on #11/#12" resolved-or-still-blocked depending on Steps 2-4's outcome.

### Step 6 — Update the go-live readiness checklist
Edit `operations/agent-org-2026-07/go-live-readiness-checklist.md` §Section D to reflect every resolution from Steps 2-5, and update the §"Go/no-go posture" summary if Section D is now fully closed.

### Step 7 — Decision-log entry + session close
Full or lean form depending on which tier Step 2 resolved to (Critical form if Path A; lean form if Path B). Cite `/adopted/standing-protocol-cache.md` §"Critical-risk sessions" if Critical.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Opens reads (incl. fresh Support-state re-confirm) | 25–35 min |
| Step 2 — the fork decision | 10–15 min |
| Step 3 — Path B (if elected) | 30–45 min |
| Step 3 — Path A (if elected; likely spins out its own follow-up session) | 15–20 min to scope, then its own session |
| Step 4 — #12/#15 decisions | 15–20 min |
| Step 5 — citations | 10 min |
| Step 6 — checklist update | 15 min |
| Decision-log + close | 30–40 min |
| **Total (Path B)** | **~2.5–3 hours** |
| **Total (Path A, this session only scopes it)** | **~1.5–2 hours, plus a follow-up build session** |

## Rollback path
Steps 1, 4, 5, 6, 7 are trivially reversible (`git revert`). Step 3/Path B's manual/terms-page correction is a small, reversible doc edit. Step 3/Path A, if elected, gets its own full Critical Change Protocol rollback plan at the point it's actually scoped — not pre-written here, since the shape of that build is not yet known.

## Forecast
Success is: Section D of the go-live checklist genuinely closed (every routed item either resolved or explicitly, honestly re-deferred with a named reason) — the last artifact standing between the founder and their own 0h call. Two of the seven items (#21/#22) should close almost for free, citing Ops's existing calling; two more (#12/#15) are fast founder decisions; #18 closes on citation alone; #11 and #27 are where the real work is, and #11's own resolution finally correct a stale, safety-relevant overstatement in the Support manual regardless of which path is chosen.

End of prompt.
