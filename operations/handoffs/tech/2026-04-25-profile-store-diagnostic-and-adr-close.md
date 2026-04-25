# Session Close — 25 April 2026 (Profile-Store Diagnostic + Cache ADR Accepted)

**Stream:** tech
**Governing frame:** `/adopted/session-opening-protocol.md`
**Tier read this session:** 1, 2, 3, 8, 9 (every-session + code)
**Risk classification across the session:** Standard × 1 (timing logs deployed); Critical × 1 deferred (cache implementation, queued for next session)

## Decisions Made

- **Pushed back on session-opening prompt's framing.** The prompt described `engine-mentor-ledger` as "now live" and `engine-profile-store` as a "scoped" module to be built. Both names are *registry catalogue entries* in the decision log (D-D1-5, D-D1-8, reclassified yesterday from `free_tier` to `internal`), not build targets. The actual underlying file (`mentor-profile-store.ts`) already existed and already loaded synchronously. Founder overrode by signalling the adapter work named in the prior tech handoff had been completed elsewhere and confirming the prompt's retrieval-design scope. Discrepancy logged as a candidate observation under PR5/PR8.
- **Path A chosen over Path B.** Diagnose first (instrument the function, collect real timing data) rather than design without data. Founder selected Path A.
- **Diagnostic instrumentation deployed.** Additive timing logs added to `loadMentorProfile()` — Standard risk, additive only, no behaviour change, `tsc --noEmit` clean. Founder pushed to main; Vercel green.
- **Two warm-call data points collected.** Same user-id, founder-hub flow: call 1 = 52ms total (db_ms=51, decrypt_ms=1), call 2 = 79ms total (db_ms=79, decrypt_ms=0). DB query dominates; decryption negligible; calls do not naturally warm.
- **ADR-R17-01 produced and accepted.** Recommended defaults: cache the encrypted blob (not plaintext), module-level in-memory Map within Vercel function instance, 60-second TTL, user-id key, evict on `saveMentorProfile()` plus TTL backstop, wrap `loadMentorProfile()` so all 8+ callers benefit transparently. ADR moved from `/drafts/` to `/compliance/` on approval. Decision-log entry D-R17-Cache-1 recorded.
- **Cache implementation deferred** to a subsequent tech session under full Critical Change Protocol (0c-ii) per PR6.

## Status Changes

- `website/src/lib/mentor-profile-store.ts` — `loadMentorProfile()` carries diagnostic timing instrumentation (no contract change). Status: **Live**, **Verified** (instrumentation only).
- `compliance/ADR-R17-01-profile-store-cache.md` — created in `/drafts/`, moved to `/compliance/` on founder approval. **Decision status:** Adopted.
- Profile-store cache (the design itself) — implementation status: **Designed**. Wiring not yet started.

## What Was Changed

| File | Action |
|---|---|
| `website/src/lib/mentor-profile-store.ts` | Edited — additive timing instrumentation around the function body (~+27 lines) |
| `compliance/ADR-R17-01-profile-store-cache.md` | Created — accepted ADR for cache design (was `/drafts/ADR-R17-01-profile-store-cache.md` before approval) |
| `operations/decision-log.md` | Appended — entry D-R17-Cache-1 |

### Files NOT changed
- All distress classifier code (R20a-classifier, constraints.ts SafetyGate) — untouched.
- `saveMentorProfile()` (write path) — untouched. Will be touched in the implementation session for cache eviction.
- `mentor-context-private.ts`, `practitioner-context.ts`, the three proof endpoints — untouched.

**No DB changes. No SQL. No DDL. No env vars added. No safety-critical files modified.**

## Verification Method Used (0c Framework)

- **Code change (timing logs)** — API endpoint method per verification framework. AI provided exact log line shape; founder triggered the founder-hub flow on production, copied log lines from Vercel Logs panel, pasted them back. AI confirmed the log emits with expected fields (db_ms, decrypt_ms, parse_ms, summary_ms, total_ms, found).
- **TypeScript clean** — `npx tsc --noEmit` exit 0 in `/website` before push.
- **ADR review** — founder read recommended-defaults section, R17c interaction note, risk classification, open questions, rollback plan. Approved on plain "Approve" signal.

## Risk Classification Record (0d-ii)

- **Diagnostic timing log deployment — Standard.** Additive observability. No change to safety, auth, encryption, or data deletion. Existing error log preserved. Deployed without incident.
- **Cache implementation — Critical (DEFERRED).** Touches the encryption pipeline (stores ciphertext that originates from the encryption surface) per PR6. Full Critical Change Protocol (0c-ii) — what changes, what could break, session-state effects, rollback, verification — must be enacted in the implementation session before any deploy.

## PR5 — Knowledge-Gap Carry-Forward

No re-explanations this session. **One candidate observation logged (1st of 3 needed for PR8 promotion):**

- **Session-opening prompts may misframe scope vs the prior handoff.** Today's opening prompt named `engine-mentor-ledger` and `engine-profile-store` as build targets when both were registry-catalogue entries from yesterday's reclassification. The framing also proposed a Redis/async retrieval question that was orthogonal to the actual blocker the prior tech handoff identified. Founder overrode after AI surfaced the discrepancy. If this happens twice more, it promotes to a process rule under PR8 — likely something like "session-opening prompts must cite the handoff section they update, or AI must verify against the handoff before acting." First observation today; promotion at third.

## Founder Verification (Between Sessions)

- **Diagnostic timing logs continue to emit** on every `loadMentorProfile` call. To collect more data points before the next session:
  - **Cold call (most valuable)** — tomorrow morning, fresh login. The first hub-page load gives a cold timing line. Feeds Open Question O2 in the ADR.
  - **More warm calls** — any normal usage produces more data. Higher n improves the Phase 2 trigger evaluation (Open Question O3).
  - **Where to find them** — Vercel dashboard → Logs → search `[mentor-profile-store] timing`. Copy lines into a note for next session paste-back.
- **ADR-R17-01** sits in `/compliance/` with status Adopted. Read §4, §5.3, §5.7, §6, §9 before implementation session begins.

## Next Session Should

1. **Open with the session-opening protocol** (always) — read this handoff first, then ADR-R17-01, then `/operations/knowledge-gaps.md` scan.
2. **Confirm cold-call data** if collected. If timings are consistent with warm calls, Phase 1 in-memory cache stands. If cold calls are dramatically slower (200ms+), revisit whether Phase 2 should jump ahead.
3. **Audit all write paths to `saveMentorProfile()`** before wiring. Known paths: `/api/mentor-profile` PUT, journal ingestion pipeline. Document the audit in the implementation handoff. A missed write path means stale profile data feeds reasoning.
4. **Implement the cache per ADR §4 defaults** — single new file `website/src/lib/mentor-profile-cache.ts`, plus a wrap of `loadMentorProfile()` in `mentor-profile-store.ts`.
5. **Run the full Critical Change Protocol (0c-ii) in the conversation before deploy** — what changes, what could break, session-state effects, rollback, verification. All five steps must appear before founder approval.
6. **Keep the diagnostic timing log in place** during the observation window (≥1 week post-cache-deploy). Removal is a separate cleanup commit after cache value is verified.
7. **Re-run the three proof endpoints from yesterday** after cache wiring (`/api/mentor/ring/proof`, `/api/support/agent/proof`, `/api/founder/hub/ring-proof`) to confirm no regression.

## Blocked On

- Nothing. Implementation session can begin whenever founder is ready.

## Open Questions

Carried from ADR-R17-01:
- **O1 — Deletion semantics under R17c.** When R17c (P2d) is built, the deletion path must explicitly evict the local cache for the deleted user-id, and the cross-instance staleness window (≤60s) must be reconciled with deletion semantics. Decision deferred to R17c implementation.
- **O2 — Cold-call performance.** Two warm data points collected. Cold-call data not yet collected. Founder verification step above gathers it.
- **O3 — Phase 2 trigger condition.** Proposed: cache hit rate <50% OR cold-call timings consistently >200ms. To be confirmed against real data.

## Process-Rule Citations

- **PR1** — respected. The cache wrap of `loadMentorProfile()` *is* the single-endpoint proof. No multi-surface rollout in scope. ADR §2 documents this framing.
- **PR2** — partial. Diagnostic timing log verified in same session. Cache wiring deferred (will be verified same-session in next session per PR2).
- **PR3** — preserved. Cache is synchronous; no async behaviour introduced. Profile retrieval continues to complete before response construction.
- **PR4** — n/a. No LLM model selection touched.
- **PR5** — one candidate observation logged (session-opening prompt vs handoff misframe). 1st of 3.
- **PR6** — respected. Cache implementation classified Critical; full Critical Change Protocol queued for next session before any deploy.
- **PR7** — respected. Open Questions O1–O3 each carry a defined revisit condition in the ADR and decision log.

## Decision Log Entries — Adopted

Appended to `/operations/decision-log.md` this session:
- **D-R17-Cache-1** — Profile-store retrieval cache (ADR-R17-01). Adopted.

## Orchestration Reminder (Protocol element 21)

This session was governed end-to-end by `/adopted/session-opening-protocol.md`. All elements applied. Element 5 (hold-point status confirmation) was implicit — the session continued tech-stream code work consistent with current P0 0h hold-point posture. Element 7 (status-vocabulary separation) was applied — implementation status (Live, Designed) and decision status (Adopted) kept distinct. No element was skipped.

---

*End of session close.*
