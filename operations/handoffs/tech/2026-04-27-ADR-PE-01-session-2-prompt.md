Governing frame: /adopted/session-opening-protocol.md

I am opening a new session in the tech stream. The previous session (26 April 2026) completed ADR-PE-01 Session 1 under Option 1A: the pattern-data write surface was added to `/api/mentor/ring/proof` (read-modify-write of the encrypted profile blob, hub-key `'private-mentor'`, per_request cadence), TypeScript reached `tsc --noEmit` exit 0, the push completed via GitHub Desktop, Vercel reached Ready, and the two-probe live-probe verified the round-trip end-to-end. Implementation Session 1 reached **Verified** status. The session close is at `/operations/handoffs/tech/2026-04-26-ADR-PE-01-session-1-1A-close.md`. This session continues from there.

I use GitHub Desktop to push commits. If any code lands this session, give me explicit GitHub Desktop instructions (open GitHub Desktop → confirm Current Repository = `sagereasoning` → confirm Current Branch = `main` → review the Changes pane → fill Summary + Description → click Commit to main → click Push origin → wait for spinner) per commit, in the same pattern the prior tech-stream sessions used.

Before touching any code, complete the session opening protocol:

* **Tier declaration:** this is a code/tech session. Read tier 1, 2, 3, 6, 8, 9 (every-session sources + KG governance scan + code state).
* Read the most recent handoff in `/operations/handoffs/tech/`: `2026-04-26-ADR-PE-01-session-1-1A-close.md`. Read end-to-end. The "Decisions Made", "Status Changes", "Open Questions", and "Next Session Should" sections are the load-bearing parts.
* Read the adopted ADR in full: `/compliance/ADR-PE-01-pattern-analysis-storage.md`. Specifically §3 (Decision), §6 (R17 footprint), §7 (Coordination with the loader — particularly §7.3 Read cadence), §8 (Single-endpoint proof sequence — Session 2 is the next step), §9 (Risks accepted), §10 (Rollback), and §12 (Open items O1–O5).
* Scan `/operations/knowledge-gaps.md` for any entry touching encrypted-blob reads, hub-key validation on the reader side (KG3 — particularly important now because Session 1 wrote with hardcoded `'private-mentor'`; Session 2's reader must use the same label or the data is invisible), and JSONB shape (KG7 — moot at the column level because the column is ciphertext, but engaged if O3's optional `last_pattern_compute_at` plain column ever lands as JSONB).
* Confirm P0 hold-point status — should still be active. Pattern-engine integration sits inside the assessment set.
* Confirm model selection (PR4). The Session 2 read-side path is pure compute on the read (decrypt + JSON parse + field lookup); no LLM is added by this session. If the BEFORE/AFTER LLM calls in the route remain unchanged, PR4 is a session-opening checkpoint cleared at open and not engaged further. State this explicitly at session open.

Step 1 — Pick the Session 2 read-precedence framing.

Two candidate framings for Session 2 of the staged transition (per ADR-PE-01 §7.3 + §8). Surface both with brief reasoning. I pick.

* **Option 2A — Prefer the persisted analysis; fall back to recompute on absence.** When `profile.pattern_analyses['private-mentor']` is present, the route uses it directly (skipping the `analysePatterns(profile, PROOF_INTERACTIONS, null)` call) and surfaces it through the existing `patternAnalysis` slot. When absent, fall back to the existing recompute path. The write side from Session 1 still fires per_request, so the persisted analysis stays fresh by virtue of being rewritten on every probe. Cheapest. Cache-honest.
* **Option 2B — Always recompute; use the persisted analysis only on recompute failure.** The route always calls `analysePatterns(...)` and uses that result. The persisted analysis is loaded but only used when the engine throws or returns null. Defeats the cache value but eliminates "stale-cache" risk because the cache is never the answer — it's a backup.

Do not assume which option I am taking. Ask me directly: "Option 2A or Option 2B?" Wait for my answer.

Also surface, at the same time as the framing question, **Q3 from the prior handoff — cadence revisit:**

* Session 1 ran on per_request because per_request makes verification observable. With the read side present, throttled (ADR §7.2 default — 6-hour minimum) becomes practical because the read can use a stale cache. Founder picks at this session's plan walk: keep `per_request`, switch to `throttled (6h)`, or switch to `lazy on absence`. State the trade-off for each in plain language.

Step 2 — Critical Change Protocol (0c-ii) requirements.

Whichever option I pick, the session is **Critical under PR6** (the read path now consumes from the encrypted blob's `pattern_analyses` field, and any change to the read precedence affects what the BEFORE prompt augmentation sees). All five steps of the Critical Change Protocol must appear in the conversation before I deploy anything:

1. **What is changing** — plain language. No jargon.
2. **What could break** — the specific worst case for this change. For Option 2A: a stale persisted analysis dominates over a fresh recompute (mitigated structurally by per_request cadence — but if cadence is changed to throttled or lazy, this risk grows). For Option 2B: extra compute every request (negligible but worth naming).
3. **What happens to existing sessions** — does this affect users currently signed in?
4. **Rollback plan** — exact GitHub Desktop steps I can run independently to return to a known-good state.
5. **Verification step** — what URL I visit, what I expect to see, what to do if the result is different.

Cannot answer one of those? Stop and signal "I need your input" or "This is a limitation."

PR3 applies — pattern-engine call (when invoked) is synchronous, no fire-and-forget. KG1 rule 2 applies if any DB write happens; for Session 2 the write side is already in place from Session 1 so no new DB writes are added by this session unless cadence changes (e.g., throttling adds a `last_written_at` check that may move the write into a conditional branch). KG3 applies — the reader-side hub label must match the writer-side `'private-mentor'`. Hardcode it on the reader with a comment that names the writer site (route.ts line ~263) so any future drift is visible.

Step 3 — Acceptance criteria.

This session ends successfully if at least one of these is true:

* **Implementation Session 2 (whichever option I pick) reaches Verified status:** TypeScript clean (`npx tsc --noEmit` exit 0 in `/website`); the proof endpoint passes a live-probe (Bearer-token Console snippet pattern from prior tech sessions) showing that the persisted analysis is the source of `patternAnalysis` (Option 2A) OR that recompute is the source with persisted as fallback (Option 2B); I push the commit via GitHub Desktop; Vercel reaches Ready; I confirm the round-trip works. Critical risk under PR6.
* The session ends earlier with a clear "I'm done for now" signal from me. Stabilise and close. Do not propose additional fixes.
* The session reveals a blocker that requires a smaller scoping change (e.g., a Standard-risk preparatory edit) before the Critical work can land. In that case, surface the blocker with the AI signal "I need your input" and let me decide whether to proceed in this session or close and reopen with a narrower scope.

Step 4 — Session close.

Per the protocol Part C, produce a handoff at session end in the required-minimum format plus the relevant extensions (Verification Method Used / Risk Classification Record / PR5 Knowledge-Gap Carry-Forward / Founder Verification / Decision Log Entries — Proposed). Save to `/operations/handoffs/tech/[YYYY-MM-DD]-[short-description]-close.md`. Name the protocol explicitly as the governing frame at close.

If the session involved code and I pushed via GitHub Desktop, the handoff's "Founder Verification" section names the pushed commit hashes and the live-probe result.

Carry-forward open items (do not address unless I bring them up):

* **Decision-log entry to adopt at session open:** `D-PE-01-S1-1A-VERIFIED` (proposed in the prior handoff). Confirm adoption at session open per the same pattern as the 2026-04-26 ADR adoption + decision-log housekeeping.
* **O-S5-A** — `/private-mentor` chat thread persistence (pre-existing UX gap).
* **O-S5-B** — write-side verification of ADR-Ring-2-01 4b (deferred until natural triggering).
* **O-S5-D** — static fallback canonical-rewrite revisit.
* **O-PE-01-A** (read amplification) — every profile read decrypts the full blob even when pattern data is not needed. After Session 2 wires the read-side, this becomes more concretely measurable; revisit if profile reads become a hot path.
* **O-PE-01-B** (blob-size monitoring) — capture before/after blob size now that `pattern_analyses['private-mentor']` is populated. Trigger condition for revisit is blob > 50 KB or encrypt/decrypt p95 > 50 ms. Not blocking; a quiet measurement when convenient.
* **O-PE-01-C** (optional `last_pattern_compute_at` column) — adding a plain timestamp column would let freshness queries skip decryption. Defer until a freshness-driven feature requires it (e.g., if Session 2 cadence is throttled and we want to short-circuit decrypt for a stale-but-valid cache).
* **O-PE-01-D** (write cadence) — resolved for Session 1 (per_request). Revisit at this session's plan walk per Q3 above.
* **O-PE-01-E** (backfill of existing profiles) — not required; the fallback is recompute. Carries forward unchanged.

Do not write any code until I have picked a Session 2 option (Step 1) AND named the cadence (Q3) AND the Critical Change Protocol (Step 2) is satisfied with my explicit "OK / go ahead" naming the listed risks.

If I am only doing the plan walk and decide not to proceed to code in this session, that is a complete and successful session. Do not push for code.
