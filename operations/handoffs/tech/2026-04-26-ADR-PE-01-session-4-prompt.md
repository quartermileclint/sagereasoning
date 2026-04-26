Governing frame: /adopted/session-opening-protocol.md

I am opening a new session in the tech stream. The previous session (26 April 2026) completed ADR-PE-01 Session 3 under Option 3A: the first live-consumer wiring of pattern-data read+write was added to `/api/mentor/private/reflect` with per_request cadence and Option 2A read precedence using 2A-skip on absence (rather than 2A-recompute, which would risk empty-recompute cache pollution given the live `mentor_interactions` loader is still deferred per ADR §1.2 (c)). The reader's `PRIVATE_MENTOR_HUB` constant mirrors the writer's `'private-mentor'` hardcode at the proof endpoint verbatim — KG3 risk structurally low. TypeScript reached `tsc --noEmit` exit 0; the push completed via GitHub Desktop; Vercel reached Ready; smoke check on `/founder-hub` rendered normally; the two-probe live-probe verified the round-trip end-to-end (both probes returned `pattern_source: "persisted"` with `pattern_persistence.ok: true`, `pattern_persistence.cadence_used: "per_request"`, and `pattern_persistence.version` delta = 1 between probes — versions 7 → 8). Implementation Session 3 reached Verified status. The session close is at `/operations/handoffs/tech/2026-04-26-ADR-PE-01-session-3-3A-close.md`. One decision-log entry was adopted at the close: `D-PE-01-S3-3A-VERIFIED`. Three decision-log entries (`D-PE-01-S1-1A-VERIFIED`, `D-PE-01-S2-2A-VERIFIED`, `D-PE-01-S3-3A-VERIFIED`) all currently carry "TBD per founder share" in the commit-hash slot. This session continues from there.

I use GitHub Desktop to push commits. If any code lands this session, give me explicit GitHub Desktop instructions (open GitHub Desktop → confirm Current Repository = `sagereasoning` → confirm Current Branch = `main` → review the Changes pane → fill Summary + Description → click Commit to main → click Push origin → wait for spinner) per commit, in the same pattern the prior tech-stream sessions used. The verification probe pattern uses a Console snippet on a deployed page; the working auth-cookie discovery for this project is `decodeURIComponent(cookies['sb-access-token'])` reading the raw JWT directly from the cookie value (no JSON envelope, no chunked patterns). Use that snippet pattern from the start — it is logged as PR5 candidate observation (1 of 3) in the Session 3 close.

Before touching any code, complete the session opening protocol:

* Tier declaration: this is a code/tech session. Read tier 1, 2, 3, 6, 8, 9 (every-session sources + KG governance scan + code state).
* Read the most recent handoff in `/operations/handoffs/tech/`: `2026-04-26-ADR-PE-01-session-3-3A-close.md`. Read end-to-end. The "Decisions Made", "Status Changes", "Open Questions", and "Next Session Should" sections are the load-bearing parts.
* Read the adopted ADR in full: `/compliance/ADR-PE-01-pattern-analysis-storage.md`. Specifically §3 (Decision), §6 (R17 footprint), §7 (Coordination with the loader — particularly §7.2 Write cadence and §7.3 Read cadence — both newly relevant because Session 4 wires the second live-consumer surface, where real founder working-session traffic exercises the cadence at higher request volume than reflect), §8 (Single-endpoint proof sequence — Session 4 is the next step: second live consumer), §9 (Risks accepted), §10 (Rollback), and §12 (Open items O1–O5).
* Scan `/operations/knowledge-gaps.md` for any entry touching encrypted-blob reads on live-consumer surfaces (KG3 — load-bearing for Session 4 because the second live consumer's hub label will be request-derived via `mapRequestHubToContextHub` rather than verbatim hardcoded — wider KG3 surface than Session 3), JSONB shape (KG7 — still moot at the column level because the column is ciphertext), and KG1 rule 2 (await all DB writes — engaged if Session 4 introduces a new write surface or new conditional write). Also scan for any post-Session-3 candidate-observation updates.
* Confirm P0 hold-point status — should still be active. Pattern-engine integration sits inside the assessment set.
* Confirm model selection (PR4). The Session 4 read-side path on a live consumer is the same pure-compute pattern as Sessions 2 and 3 (decrypt + JSON parse + field lookup); no LLM is added by the read precedence change itself. The candidate live consumer (`/api/founder/hub`) already has multiple LLM calls in path — Sonnet for mentor agents, Haiku for non-mentor agents (per the existing routing). Pattern data is mentor-only, so the Session 4 wiring must be gated by `agent === 'mentor'` to avoid injecting context blocks into non-mentor agent prompts. If the Session 4 wiring changes prompt composition in a way that affects model selection, PR4 engages. State this explicitly at session open.

Step 1 — Pick the Session 4 second-live-consumer framing.

The natural next candidate per ADR §8 is `/api/founder/hub`. Three candidate framings for Session 4 — surface all three with brief reasoning. I pick.

* Option 4A — `/api/founder/hub` with `'private-mentor'` requests only (defer the writer-gap). Wire the read precedence on founder/hub gated by `agent === 'mentor'`. Use `mapRequestHubToContextHub(effectiveHubId)` to derive the context hub label. For `effectiveHubId === 'private-mentor'` requests (private-mentor agent traffic), the cache hit path fires (cache populated by Sessions 1, 2, 3 under `'private-mentor'`). For `effectiveHubId === 'founder-hub'` requests (founder-mentor agent traffic), the reader looks up `pattern_analyses['founder-mentor']` which has no writer in the codebase yet — reader falls through to 2A-skip (no augmentation). KG3 surface engaged via the canonical mapper. Per_request persistence under 2A-skip means writes only fire on private-mentor traffic; founder-hub traffic generates no writes. Narrowest immediate scope; the writer-gap question is deferred.

* Option 4B — Add a `'founder-mentor'` writer first as a Session 3.5, then wire founder/hub reading both labels in Session 4 (this session becomes Session 3.5 + 4 combined). The Session 3.5 writer would either be a one-off backfill (Critical risk under PR6 because it touches the encrypted blob; bounded — runs once per profile) or a per_request writer added to the founder-hub mentor agent for `'founder-hub'` requests. Wider scope; addresses the writer-gap before reading. Trade-off: more code, more verification surface, but symmetric coverage on first deploy.

* Option 4C — Pick a different live consumer ahead of `/api/founder/hub`. Other candidates exist but most are not natural Session 4 targets:
  - `/api/reflect` (public): currently does not call `loadMentorProfile` — wiring it requires expanding scope to add the loader call, then the pattern data read. Larger surface change.
  - `/api/mentor-baseline`, `/api/mentor-appendix`: not currently consumers of pattern data; not natural targets.
  - Other mentor routes under `/api/mentor/`: founder/hub remains the broadest natural target.
  Reasoning to consider 4C: if there is a different mentor-touching surface that has higher value than founder/hub for the hold-point assessment, name it. Otherwise default to 4A or 4B.

Do not assume which option I am taking. Ask me directly: "Option 4A, 4B, or 4C?" Wait for my answer.

Also surface, at the same time as the framing question, three follow-on plan-walk questions:

* Q-Consumer (only if I pick 4C) — which alternative consumer? Surface the candidate's KG3 footprint (request-derived or hardcoded), its existing profile-load posture (does `loadMentorProfile` already get called?), its LLM tier (Sonnet or Haiku), and whether pattern data is appropriate for its prompt composition.

* Q-Cadence — cadence at the second live-consumer surface. Sessions 1, 2, 3 ran on per_request because per_request makes verification observable (the version-bump diagnostic) and the founder-only traffic kept write load bounded. The founder-hub endpoint sees real founder working-session traffic; per_request becomes more expensive proportionally and the version-bump diagnostic is no longer the primary value. ADR §7.2 default is throttled (6h). Founder picks: keep `per_request` (continuity with Sessions 1/2/3; expensive at scale), switch to `throttled (6h)` (ADR default; one-line conditional check before the persistence block — first conditional-write surface in the project; KG1 rule 2 engages because the awaited-write discipline must hold for the conditional path), or switch to `lazy on absence` (cheapest; risky without an invalidation hook per ADR §7.2). State the trade-off for each in plain language. Default recommendation: throttled (6h) — matches ADR default and keeps live-consumer write load proportional to actual content change, with the one-line conditional being the first such surface to verify in the project. If founder picks throttled, design the conditional check inline in CCP step 1: `Date.now() - new Date(persisted.computed_at).getTime() > 6 * 60 * 60 * 1000`.

* Q-ReadPrecedence — read precedence at the second live-consumer surface. Default carries forward Option 2A from Sessions 2 and 3. The 2A-skip vs 2A-recompute sub-decision continues to apply: with the live interactions loader still deferred (ADR §1.2 (c)), 2A-recompute risks empty-recompute cache pollution. Default recommendation: 2A-skip on absence. State the default explicitly and ask if Founder wants to deviate.

Step 2 — Critical Change Protocol (0c-ii) requirements.

Whichever option I pick, the session is Critical under PR6 (the read path now consumes pattern data on a real founder working-session surface; the persistence block — if cadence is per_request or throttled — affects what real user requests see in the prompt augmentation). Additionally — new this session if 4B is chosen — Session 3.5 introduces a new writer surface for `pattern_analyses['founder-mentor']`, which is an additional Critical-risk write path. AC7 considerations should be confirmed not engaged (no auth/cookie/session/domain-redirect changes) but stated explicitly. All five steps of the Critical Change Protocol must appear in the conversation before I deploy anything:

1. What is changing — plain language. No jargon. Name the specific files (`/api/founder/hub/route.ts` and any others if 4B). Name the specific gates (e.g., `agent === 'mentor'` for pattern data, `useProjection` for the load path, the cadence conditional if throttled).
2. What could break — the specific worst case for this change. For Option 4A: KG3 drift via `mapRequestHubToContextHub` (wider surface than verbatim hardcode); injection of pattern context into non-mentor agent prompts (mitigated by the `agent === 'mentor'` gate); under throttled cadence, stale-cache window up to the throttle threshold. For Option 4B: same as 4A plus the new `'founder-mentor'` writer's read-modify-write discipline (worst case D analogue for the new writer). Under per_request on real user traffic: write-load amplification on founder-hub (every request decrypts and re-encrypts the blob).
3. What happens to existing sessions — does this affect users currently signed in? For a live consumer with broader surface than reflect, real user-facing behaviour changes more visibly (founder-hub mentor responses see pattern data on cache hit; non-mentor agents unchanged). Name what the user-visible difference is.
4. Rollback plan — exact GitHub Desktop steps I can run independently to return to a known-good state. If 4B introduced a new writer, the rollback also names whether the `'founder-mentor'` cache entries should be cleared or left in place (the reader is reverted, so cache entries become unread but not destructive).
5. Verification step — what URL I visit, what I expect to see, what to do if the result is different. The Session 3 verification used `result.pattern_source` and `result.pattern_persistence` on the reflect response. The founder-hub response shape is different — design the per-consumer probe explicitly. Likely path: a debug field on the founder-hub mentor-agent response, OR a server-log line the founder can check, OR a temporary feature-flag-gated diagnostic endpoint. Use the working `cookies['sb-access-token']` cookie pattern from the start.

Cannot answer one of those? Stop and signal "I need your input" or "This is a limitation."

PR3 applies — pattern-engine call (when invoked via fallback) is synchronous, no fire-and-forget. PR4 applies — confirmed at session open. KG1 rule 2 applies if cadence change adds a new conditional write (throttled introduces one) or if 4B adds a new writer. KG3 applies — the live consumer's hub label is request-derived via `mapRequestHubToContextHub` and must be invoked correctly.

Step 3 — Acceptance criteria.

This session ends successfully if at least one of these is true:

* Implementation Session 4 (whichever option I pick) reaches Verified status: TypeScript clean (`npx tsc --noEmit` exit 0 in `/website`); the chosen live consumer passes a verification probe (per-consumer probe shape, designed in the CCP step 5) showing the read precedence is firing as expected and the persistence cadence is behaving as expected; I push the commit(s) via GitHub Desktop; Vercel reaches Ready; I confirm the round-trip works. Critical risk under PR6.

* The session ends earlier with a clear "I'm done for now" signal from me. Stabilise and close. Do not propose additional fixes.

* The session reveals a blocker that requires a smaller scoping change before the Critical work can land. In that case, surface the blocker with the AI signal "I need your input" and let me decide whether to proceed in this session or close and reopen with a narrower scope.

Step 4 — Session close.

Per the protocol Part C, produce a handoff at session end in the required-minimum format plus the relevant extensions (Verification Method Used / Risk Classification Record / PR5 Knowledge-Gap Carry-Forward / Founder Verification / Decision Log Entries — Adopted / Process-Rule Citations / Orchestration Reminder). Save to `/operations/handoffs/tech/[YYYY-MM-DD]-[short-description]-close.md`. Name the protocol explicitly as the governing frame at close.

If the session involved code and I pushed via GitHub Desktop, the handoff's "Founder Verification" section names the pushed commit hashes and the live-probe / verification result.

Carry-forward open items (do not address unless I bring them up):

* Decision-log entries to confirm at session open: `D-PE-01-S1-1A-VERIFIED`, `D-PE-01-S2-2A-VERIFIED`, and `D-PE-01-S3-3A-VERIFIED` are all Adopted as of the 2026-04-26 Session 3 close. Commit hashes for all three pushes are placeholder ("TBD per founder share from GitHub Desktop History tab"); if I share the hashes at session open, AI amends all three entries inline.

* Cosmetic comment-date fix carried forward from Session 3: `/website/src/app/api/mentor/private/reflect/route.ts` carries comment blocks dated "27 April 2026" rather than "26 April 2026". Standard-risk one-line fix; can be batched with any future change to that file (e.g., if Session 4 ends up touching reflect — not expected under 4A or 4B). Tiered as Efficiency & stewardship per PR9; absorbed into ongoing work.

* O-S5-A — `/private-mentor` chat thread persistence (pre-existing UX gap).

* O-S5-B — write-side verification of ADR-Ring-2-01 4b (deferred until natural triggering).

* O-S5-D — static fallback canonical-rewrite revisit.

* O-PE-01-A (read amplification) — every profile read decrypts the full blob even when pattern data is not needed. With Session 4 wiring the second live consumer (broader surface than reflect), this becomes measurable on a higher-traffic surface. Revisit if profile reads on the chosen consumer become a measurable hot path.

* O-PE-01-B (blob-size monitoring) — versions 8+ now written by two writers (proof endpoint and reflect endpoint). Trigger condition for revisit is blob > 50 KB or encrypt/decrypt p95 > 50 ms. Not blocking; a quiet measurement when convenient.

* O-PE-01-C (optional `last_pattern_compute_at` plain column) — adding a plain timestamp column would let freshness queries skip decryption. Becomes more relevant if Session 4 cadence is throttled and the conditional write needs to short-circuit decrypt for stale-but-valid cache. Defer until that condition triggers.

* O-PE-01-D (write cadence) — resolved for Sessions 1, 2, 3 (per_request). Revisit at this session's plan walk per Q-Cadence above.

* O-PE-01-E (backfill of existing profiles) — not required; the fallback is recompute or 2A-skip on a per-consumer basis. Carries forward unchanged.

* PR5 candidate (1 of 3) — Console-snippet auth-cookie discovery. The working pattern is `decodeURIComponent(cookies['sb-access-token'])` reading the raw JWT directly. If this session needs a verification probe and uses a different pattern unsuccessfully, that is a second occurrence and the candidate moves to 2 of 3. Use the working pattern from the start.

Do not write any code until I have picked a Session 4 option (Step 1) AND named the cadence (Q-Cadence) AND named the read precedence (Q-ReadPrecedence) AND (if applicable) named the alternative consumer (Q-Consumer for 4C only) AND the Critical Change Protocol (Step 2) is satisfied with my explicit "OK / go ahead" naming the listed risks.

If I am only doing the plan walk and decide not to proceed to code in this session, that is a complete and successful session. Do not push for code.
