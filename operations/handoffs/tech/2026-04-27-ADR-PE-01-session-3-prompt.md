Governing frame: /adopted/session-opening-protocol.md

I am opening a new session in the tech stream. The previous session (26 April 2026) completed ADR-PE-01 Session 2 under Option 2A: the read-precedence path was added to `/api/mentor/ring/proof` (prefer `profile.pattern_analyses['private-mentor']` when present, fall back to `ring.analysePatterns(...)` recompute when absent), the new `pattern_source: 'persisted' | 'recomputed' | null` field was surfaced in the response JSON, per_request cadence was preserved (Session 1 write surface unchanged), TypeScript reached `tsc --noEmit` exit 0, the push completed via GitHub Desktop, Vercel reached Ready, and the two-probe live-probe verified the round-trip end-to-end (both probes returned `pattern_source: "persisted"` with frozen `computed_at` between probes confirming the worst case B behaviour as designed under 2A + per_request, and `pattern_persistence.version` ticking by one per probe). Implementation Session 2 reached Verified status. The session close is at `/operations/handoffs/tech/2026-04-26-ADR-PE-01-session-2-2A-close.md`. Two decision-log entries were adopted at the close: `D-PE-01-S1-1A-VERIFIED` (the entry proposed in the Session 1 close, retroactively adopted at Session 2 open) and `D-PE-01-S2-2A-VERIFIED` (this session's verification). Both currently carry "TBD per founder share" in the commit-hash slot. This session continues from there.

I use GitHub Desktop to push commits. If any code lands this session, give me explicit GitHub Desktop instructions (open GitHub Desktop → confirm Current Repository = `sagereasoning` → confirm Current Branch = `main` → review the Changes pane → fill Summary + Description → click Commit to main → click Push origin → wait for spinner) per commit, in the same pattern the prior tech-stream sessions used.

Before touching any code, complete the session opening protocol:

* Tier declaration: this is a code/tech session. Read tier 1, 2, 3, 6, 8, 9 (every-session sources + KG governance scan + code state).
* Read the most recent handoff in `/operations/handoffs/tech/`: `2026-04-26-ADR-PE-01-session-2-2A-close.md`. Read end-to-end. The "Decisions Made", "Status Changes", "Open Questions", and "Next Session Should" sections are the load-bearing parts.
* Read the adopted ADR in full: `/compliance/ADR-PE-01-pattern-analysis-storage.md`. Specifically §3 (Decision), §6 (R17 footprint), §7 (Coordination with the loader — particularly §7.2 Write cadence and §7.3 Read cadence — both newly relevant because Session 3 wires the first live-consumer surface where real user traffic changes the cadence calculus), §8 (Single-endpoint proof sequence — Session 3 is the next step: first live consumer), §9 (Risks accepted), §10 (Rollback), and §12 (Open items O1–O5).
* Scan `/operations/knowledge-gaps.md` for any entry touching encrypted-blob reads on live-consumer surfaces (KG3 — the load-bearing entry for Session 3 because the live consumer's hub label determines whether the Session 2 reader pattern can be reused verbatim or whether the canonical `mapRequestHubToContextHub` is required), JSONB shape (KG7 — still moot at the column level because the column is ciphertext, but engaged if O3's optional `last_pattern_compute_at` plain column ever lands), and KG1 rule 2 (await all DB writes — engaged if Session 3 introduces a new write surface, e.g., if cadence at the live-consumer surface differs from the proof endpoint).
* Confirm P0 hold-point status — should still be active. Pattern-engine integration sits inside the assessment set.
* Confirm model selection (PR4). The Session 3 read-side path on a live consumer is the same pure-compute pattern as Session 2 (decrypt + JSON parse + field lookup); no LLM is added by the read precedence change itself. However, both candidate live consumers (`/api/mentor/private/reflect` and `/api/founder/hub`) already have LLM calls in path that consume the pattern-data output. If those existing LLM calls are unchanged by the Session 3 wiring, PR4 is a session-opening checkpoint cleared at open and not engaged further. If the Session 3 wiring changes prompt composition in a way that affects model selection (e.g., adding a new context block that pushes a tier toward Sonnet), PR4 engages. State this explicitly at session open.

Step 1 — Pick the Session 3 first-live-consumer framing.

Two candidate framings for Session 3 of the staged transition (per ADR-PE-01 §8). Surface both with brief reasoning. I pick.

* Option 3A — `/api/mentor/private/reflect` first. The private-mentor reflect endpoint is the closest match to the proof endpoint's semantic surface (private-mentor hub, founder + future paid practitioner traffic, longer-form reasoning where pattern signals add real value). KG3 mapping is verbatim: hub label `'private-mentor'` matches the proof endpoint's hardcode, so the Session 2 reader pattern can be reused without invoking `mapRequestHubToContextHub`. Real user traffic (vs the proof endpoint's founder-only gate) but a narrower surface than `/api/founder/hub`.
* Option 3B — `/api/founder/hub` first. The founder-hub endpoint is the broader surface: multi-hub (founder-mentor + private-mentor depending on the request body's `hub_id`), exercises `mapRequestHubToContextHub` already (existing wiring), higher request volume from the founder's working sessions. KG3 is engaged at the request-derived hub_id mapping path. Wider surface; more verification work; more KG3-relevant code.

Do not assume which option I am taking. Ask me directly: "Option 3A or Option 3B?" Wait for my answer.

Also surface, at the same time as the framing question, two follow-on plan-walk questions:

* Q-Cadence — cadence at the live-consumer surface. The proof endpoint ran on per_request because per_request makes verification observable on a low-traffic founder-only surface. A live consumer sees real user traffic; per_request becomes more expensive proportionally and the version-bump diagnostic is no longer the primary value. ADR §7.2 default is throttled (6h). Founder picks: keep `per_request` (continuity with Sessions 1 & 2; expensive at scale), switch to `throttled (6h)` (ADR default; one-line conditional check before the existing Session 1 write block), or switch to `lazy on absence` (cheapest; risky without an invalidation hook per ADR §7.2). State the trade-off for each in plain language. Default recommendation: throttled (6h) — matches ADR default and keeps live-consumer write load proportional to actual content change.
* Q-ReadPrecedence — read precedence at the live-consumer surface. Default carries forward Option 2A from Session 2 (prefer persisted, fall back to recompute). Founder may pick differently for the live consumer (e.g., Option 2B always-recompute if there is reason to distrust the cache on real user traffic). State the default explicitly and ask if Founder wants to deviate.

Step 2 — Critical Change Protocol (0c-ii) requirements.

Whichever option I pick, the session is Critical under PR6 (the read path now consumes pattern data on a live-consumer surface; the persistence block for the chosen consumer affects what real user requests see in the BEFORE/AFTER prompt augmentation). Additionally — new this session — Session 3 is the first time the encryption-pipeline blast radius extends beyond founder-only traffic, so AC7 considerations should be confirmed not engaged (no auth/cookie/session/domain-redirect changes) but stated explicitly. All five steps of the Critical Change Protocol must appear in the conversation before I deploy anything:

1. What is changing — plain language. No jargon.
2. What could break — the specific worst case for this change. For Option 3A: a wrong hub label on the reader silently returns no cache hit and falls through to recompute (KG3 — same risk as Session 2 but verbatim hub label means the risk is structurally low). Cadence-dependent worst cases (e.g., under throttled, a stale cache could persist for 6h after the underlying interaction stream changes meaningfully). For Option 3B: KG3 surface is wider because the hub_id is request-derived, so `mapRequestHubToContextHub` must be invoked correctly and the Session 1 writer's `'private-mentor'` hardcode may need a partner writer for `'founder-mentor'` data — surface this explicitly because it could expand scope.
3. What happens to existing sessions — does this affect users currently signed in? For a live consumer, real user-facing behaviour changes (the BEFORE/AFTER prompts change content). Name what the user-visible difference is.
4. Rollback plan — exact GitHub Desktop steps I can run independently to return to a known-good state.
5. Verification step — what URL I visit, what I expect to see, what to do if the result is different. The proof endpoint's `pattern_source` diagnostic is not available on live consumers (those endpoints have their own response shapes); design the verification path explicitly per consumer (e.g., a logging line, a feature-flag-gated debug endpoint, or a one-off Console snippet that exercises the consumer with a known input).

Cannot answer one of those? Stop and signal "I need your input" or "This is a limitation."

PR3 applies — pattern-engine call (when invoked via fallback) is synchronous, no fire-and-forget. PR4 applies — confirmed at session open. KG1 rule 2 applies if cadence change adds a new conditional write or if the consumer wires a write that didn't exist before. KG3 applies — the live consumer's hub label must match the writer-side label exactly (verbatim if reusing `'private-mentor'`; via `mapRequestHubToContextHub` if request-derived).

Step 3 — Acceptance criteria.

This session ends successfully if at least one of these is true:

* Implementation Session 3 (whichever option I pick) reaches Verified status: TypeScript clean (`npx tsc --noEmit` exit 0 in `/website`); the chosen live consumer passes a verification probe (per-consumer probe shape, designed in the CCP step 5) showing the read precedence is firing as expected and the persistence cadence is behaving as expected; I push the commit via GitHub Desktop; Vercel reaches Ready; I confirm the round-trip works. Critical risk under PR6.
* The session ends earlier with a clear "I'm done for now" signal from me. Stabilise and close. Do not propose additional fixes.
* The session reveals a blocker that requires a smaller scoping change (e.g., a Standard-risk preparatory edit, or a Session 2.5 to add a `'founder-mentor'` writer before Option 3B becomes safe) before the Critical work can land. In that case, surface the blocker with the AI signal "I need your input" and let me decide whether to proceed in this session or close and reopen with a narrower scope.

Step 4 — Session close.

Per the protocol Part C, produce a handoff at session end in the required-minimum format plus the relevant extensions (Verification Method Used / Risk Classification Record / PR5 Knowledge-Gap Carry-Forward / Founder Verification / Decision Log Entries — Adopted / Process-Rule Citations / Orchestration Reminder). Save to `/operations/handoffs/tech/[YYYY-MM-DD]-[short-description]-close.md`. Name the protocol explicitly as the governing frame at close.

If the session involved code and I pushed via GitHub Desktop, the handoff's "Founder Verification" section names the pushed commit hashes and the live-probe / verification result.

Carry-forward open items (do not address unless I bring them up):

* Decision-log entries to confirm at session open: `D-PE-01-S1-1A-VERIFIED` and `D-PE-01-S2-2A-VERIFIED` are both Adopted as of the 2026-04-26 Session 2 close. Commit hashes for both pushes are placeholder ("TBD per founder share from GitHub Desktop History tab"); if I share the hashes at session open, AI amends both entries inline.
* O-S5-A — `/private-mentor` chat thread persistence (pre-existing UX gap).
* O-S5-B — write-side verification of ADR-Ring-2-01 4b (deferred until natural triggering).
* O-S5-D — static fallback canonical-rewrite revisit.
* O-PE-01-A (read amplification) — every profile read decrypts the full blob even when pattern data is not needed. With Session 3 wiring the first live consumer, this becomes the first surface where amplification is on real user traffic. Revisit if profile reads on the chosen consumer become a measurable hot path.
* O-PE-01-B (blob-size monitoring) — capture blob size now that `pattern_analyses['private-mentor']` is populated through Sessions 1 and 2 (versions ≥6). Trigger condition for revisit is blob > 50 KB or encrypt/decrypt p95 > 50 ms. Not blocking; a quiet measurement when convenient.
* O-PE-01-C (optional `last_pattern_compute_at` column) — adding a plain timestamp column would let freshness queries skip decryption. Becomes more relevant if Session 3 cadence is throttled and the conditional write needs to short-circuit decrypt for stale-but-valid cache. Defer until that condition triggers.
* O-PE-01-D (write cadence) — resolved for Sessions 1 & 2 (per_request). Revisit at this session's plan walk per Q-Cadence above.
* O-PE-01-E (backfill of existing profiles) — not required; the fallback is recompute. Carries forward unchanged.

Do not write any code until I have picked a Session 3 option (Step 1) AND named the cadence (Q-Cadence) AND named the read precedence (Q-ReadPrecedence) AND the Critical Change Protocol (Step 2) is satisfied with my explicit "OK / go ahead" naming the listed risks.

If I am only doing the plan walk and decide not to proceed to code in this session, that is a complete and successful session. Do not push for code.
