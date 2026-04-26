Governing frame: /adopted/session-opening-protocol.md

I am opening a new session in the tech stream. The previous session (26 April 2026) adopted ADR-PE-01: the file was promoted from `/drafts/ADR-PE-01-pattern-analysis-storage.md` to `/compliance/ADR-PE-01-pattern-analysis-storage.md`, the Status line was updated to "Accepted — founder approved on 26 April 2026", and three decision-log entries were appended (`D-ADR-PE-01`, `D-PE-2-B-RESOLVED`, `D-PE-LEDGER-WIRING-REDIRECTED`). The push completed; Vercel green. This session continues from there.

I use GitHub Desktop to push commits. If any code lands this session, give me explicit GitHub Desktop instructions (open GitHub Desktop → confirm Current Repository = `sagereasoning` → confirm Current Branch = `main` → review the Changes pane → fill Summary + Description → click Commit to main → click Push origin → wait for spinner) per commit, in the same pattern the prior tech-stream sessions used.

Before touching any code, complete the session opening protocol:

* Tier declaration: this is a code/tech session. Read tier 1, 2, 3, 6, 8, 9 (every-session sources + KG governance scan + code state).
* Read the most recent handoff in `/operations/handoffs/tech/`: `2026-04-26-ADR-PE-01-adopted-close.md`. Read end-to-end. The "Decisions Made", "Status Changes", and "Next Session Should" sections are the load-bearing parts.
* Read the adopted ADR in full: `/compliance/ADR-PE-01-pattern-analysis-storage.md`. Specifically §3 (Decision), §5 (Encryption pipeline impact), §6 (R17 footprint), §7 (Coordination with the loader), §8 (Single-endpoint proof sequence), §9 (Risks accepted), §10 (Rollback), and §12 (Open items O1–O5).
* Scan `/operations/knowledge-gaps.md` for any entry touching encrypted-blob writes (KG1 rule 2 — await all DB writes; no fire-and-forget), hub-key validation end-to-end (KG3), and JSONB shape (KG7 — moot at the column level because the column is ciphertext, but engaged if O3's optional `last_pattern_compute_at` column ever lands).
* Confirm P0 hold-point status — should still be active. Pattern-engine integration sits inside the assessment set.
* Confirm model selection (PR4). If the session moves into implementation and any LLM is in path, model selection is a session-opening checkpoint, not a mid-session discovery. The pattern-engine main `analysePatterns` pass is pure compute, no LLM. The optional novel-pattern narrative path (`buildPatternNarrativePrompt`) is the only LLM-touching surface and is out of scope for Session 1.

Step 1 — Pick the Session 1 implementation framing.

Two candidate framings for Session 1 of the staged transition (per ADR-PE-01 §8). Surface both with brief reasoning. I pick.

* Option 1A — Pattern-data write on the proof endpoint first. Add the read-modify-write surface to `/api/mentor/ring/proof` (already wired against `PROOF_PROFILE` + `PROOF_INTERACTIONS`) so the proof endpoint becomes the first surface to actually persist pattern data inside the encrypted blob. Critical under PR6. Rollback contained — the proof endpoint is founder-only traffic.
* Option 1B — Loader build first, then the storage wiring on the proof endpoint. Build the live `mentor_interactions` loader (D-PE-2 (c)) hub-scoped (per-(user, hub)) per my 2026-04-26 direction first, prove it on the proof endpoint, then wire pattern-data persistence in a second session. Splits Critical risk across two sessions.

Do not assume which option I am taking. Ask me directly: "Option 1A or Option 1B?" Wait for my answer.

Step 2 — Critical Change Protocol (0c-ii) requirements.

Whichever option I pick, the session is Critical under PR6 (encryption-pipeline blast radius — Option 1A touches the read-modify-write path inside the encrypted blob; Option 1B touches Supabase reads in a hub-scoped path that the storage wiring will later consume). All five steps of the Critical Change Protocol must appear in the conversation before I deploy anything:

1. What is changing — plain language. No jargon.
2. What could break — the specific worst case for this change. For Option 1A: a write that omits existing fields silently corrupts the blob. For Option 1B: a loader that uses a wrong hub label silently returns empty results.
3. What happens to existing sessions — does this affect users currently signed in?
4. Rollback plan — exact GitHub Desktop steps I can run independently to return to a known-good state.
5. Verification step — what URL I visit, what I expect to see, what to do if the result is different.

Cannot answer one of those? Stop and signal "I need your input" or "This is a limitation."

PR3 applies — pattern-engine call is synchronous, no fire-and-forget on the write side. KG1 rule 2 applies — await every Supabase write. KG3 applies — hub-key validation must be explicit on the writer and reader sides; use `mapRequestHubToContextHub` for any request-derived `hub_id` and hardcoded constants elsewhere, with a comment naming the hardcode so drift is visible. R17f §6.3 of the ADR names the implementation rules: read-modify-write discipline, hub-key scoping, schema-version awareness.

Step 3 — Acceptance criteria.

This session ends successfully if at least one of these is true:

* Implementation Session 1 (whichever option I pick) reaches Verified status: TypeScript clean (`npx tsc --noEmit` exit 0 in `/website`), the relevant single-endpoint proof passes a live-probe (Bearer-token Console snippet pattern from prior tech sessions), I push the commit via GitHub Desktop, Vercel reaches Ready, I confirm the round-trip works. Critical risk under PR6.
* The session ends earlier with a clear "I'm done for now" signal from me. Stabilise and close. Do not propose additional fixes.
* The session reveals a blocker that requires a smaller scoping change (e.g., a Standard-risk preparatory edit) before the Critical work can land. In that case, surface the blocker with the AI signal "I need your input" and let me decide whether to proceed in this session or close and reopen with a narrower scope.

Step 4 — Session close.

Per the protocol Part C, produce a handoff at session end in the required-minimum format plus the relevant extensions (Verification Method Used / Risk Classification Record / PR5 Knowledge-Gap Carry-Forward / Founder Verification / Decision Log Entries — Proposed). Save to `/operations/handoffs/tech/[YYYY-MM-DD]-[short-description]-close.md`. Name the protocol explicitly as the governing frame at close.

If the session involved code and I pushed via GitHub Desktop, the handoff's "Founder Verification" section names the pushed commit hashes and the live-probe result.

Carry-forward open items (do not address unless I bring them up):

* O-S5-A — `/private-mentor` chat thread persistence (pre-existing UX gap).
* O-S5-B — write-side verification of ADR-Ring-2-01 4b (deferred until natural triggering).
* O-S5-D — static fallback canonical-rewrite revisit.
* O-PE-01-A through O-PE-01-E — five open items inside ADR-PE-01:
  * O-PE-01-A (read amplification) — every profile read decrypts the full blob even when pattern data is not needed.
  * O-PE-01-B (blob-size monitoring) — capture before/after blob size after Session 1 lands; trigger condition for revisit is blob > 50 KB or encrypt/decrypt p95 > 50 ms.
  * O-PE-01-C (optional `last_pattern_compute_at` column) — adding a plain timestamp column would let freshness queries skip decryption. Defer until a freshness-driven feature requires it.
  * O-PE-01-D (write cadence) — per-request vs throttled vs lazy-on-absence. Founder picks at the Session 1 plan walk. Default recommendation: throttled (6-hour minimum between writes).
  * O-PE-01-E (backfill of existing profiles) — profiles existing before the implementation will have `pattern_analyses === undefined` until their next save; no backfill required because the fallback is recompute.

Do not write any code until I have picked an option (Step 1) AND the Critical Change Protocol (Step 2) is satisfied with my explicit "OK / go ahead" naming the listed risks.

If I am only doing the plan walk and decide not to proceed to code in this session, that is a complete and successful session. Do not push for code.
