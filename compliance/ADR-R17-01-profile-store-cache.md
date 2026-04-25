# ADR-R17-01 — Profile-Store Retrieval Cache

**Status:** Accepted — founder approved recommended defaults on 25 April 2026. Implementation deferred to a subsequent session under Critical Change Protocol (0c-ii). Located at `/compliance/`.
**Date:** 2026-04-25
**Related rules:** R17 (intimate data — encryption pipeline; specifically R17b application-level encryption and R17c genuine deletion endpoint), PR1 (single-endpoint proof before rollout), PR3 (safety systems are synchronous), PR6 (safety-critical changes are Critical risk), R5 (cost health).
**Supersedes:** —
**Superseded by:** —

---

## 1. Context

`loadMentorProfile()` in `website/src/lib/mentor-profile-store.ts` is the single retrieval function for the founder's encrypted MentorProfile. It is called from at least eight code paths in the website, including the three flows the prompt at session-open named (`founder-hub`, `private-mentor`, `mentor-private-reflect`).

Each call performs two costly operations in sequence:

1. **Supabase query** — fetch one row by user-id from the `mentor_profiles` table.
2. **Decryption** — AES-256-GCM decrypt of the `encrypted_profile` blob, then `JSON.parse`, then `buildProfileSummary`.

The retrieval pattern is currently **synchronous, no cache**. Every call pays both costs.

Diagnostic instrumentation was added in this session (additive timing logs around the function body, Standard risk). Two data points were collected from a live `founder-hub` session, same user-id:

| Call | db_ms | decrypt_ms | parse_ms | summary_ms | total_ms |
|---|---|---|---|---|---|
| 1 | 51 | 1 | 0 | 0 | 52 |
| 2 | 79 | 0 | 0 | 0 | 79 |

**Findings from the data:**
- DB query dominates total cost (51–79ms).
- Decryption is essentially free (0–1ms).
- Calls do not naturally warm — second call was slower than first.
- The total numbers are healthy-to-moderate, not catastrophic, but variance is real.
- Data is thin (n=2). Cold-call data point not yet collected.

The decryption finding is decisive for the cache shape: caching the *encrypted* blob captures essentially all the available saving without growing the R17 plaintext-at-rest surface.

This ADR resolves the cache implementation questions. It does not change R17 or any safety rule. It does not change the retrieval function's contract.

## 2. Decision drivers

- **R17 surface containment** — the cache must not put plaintext profile data at rest anywhere new. The data shows decrypt is 0–1ms, so caching ciphertext only is sufficient.
- **Operational simplicity** — a solo non-technical founder must be able to support this. No new external infrastructure unless the data demands it.
- **Vercel serverless model** — function instances are stateless across cold starts, share state only when warm. Module-level in-memory state works for the warm-call case but does not survive cold start.
- **Cache invalidation safety** — `saveMentorProfile()` writes (called from journal ingestion and the `/api/mentor-profile` PUT endpoint) must reliably evict stale cache entries. R17c (genuine deletion) must also evict.
- **PR1 — single-endpoint proof before rollout** — the cache is wrapped around `loadMentorProfile()` itself, so all callers benefit at once. The "single endpoint" here is the function. Any rollout to additional caching layers (e.g., observation-retrieval cache) is out of scope.
- **PR3 — safety systems are synchronous** — profile retrieval is not directly a safety function (the distress classifier does not require profile context to fire). However, profile context feeds the mentor's reasoning path, so a slow or failed retrieval cascades into the user-facing response. The cache must not introduce async behaviour that delays the response construction.
- **PR6 — safety-critical changes are Critical risk** — this change touches the encryption pipeline (it stores ciphertext that came out of the encryption surface). Classified Critical. Critical Change Protocol applies before deployment.

## 3. Options considered

### D1 — What value the cache stores

| Option | Description | Trade-offs |
|---|---|---|
| **D1-a** | Cache decrypted plaintext profile (the full `MentorProfileData` object) | Saves DB + decrypt + parse + summary on cache hit. Decrypt savings are 0–1ms — negligible. Plaintext profile sits in cache; R17 surface increases meaningfully. Cache-side encryption needed to mitigate, which negates the saving. **Rejected.** |
| **D1-b** | Cache the encrypted blob (`encrypted_profile` + `encryption_meta`) | Saves the DB round-trip on cache hit (the actual bottleneck). Decryption + parse + summary still run per call (~1–2ms total — acceptable). R17 surface unchanged: cache holds ciphertext, which is already at-rest in the DB and is meaningless without the server-side key. **Recommended.** |
| **D1-c** | No cache (status quo) | Simplest. No invalidation problem. Leaves observed variance. Each call pays full DB cost. **Rejected** — the data shows the variance is real and warm-call benefit does not happen naturally. |

### D2 — Where the cache lives

| Option | Description | Trade-offs |
|---|---|---|
| **D2-a** | Module-level in-memory `Map<userId, CachedEntry>` inside the Vercel function instance | Zero infrastructure. Helps warm-call case. Does not survive cold starts. Each Vercel function instance has its own cache — no cross-instance sharing. **Recommended for Phase 1.** Matches the warm-call pattern observed in the data. |
| **D2-b** | External cache (Vercel KV or Upstash Redis) | Cross-instance, persistent. Helps cold-ish calls (instance just spawned but cache layer already has data). Adds infrastructure dependency, cost, and a new SPOF. Cache values are still ciphertext (R17 unchanged) but the cache provider becomes a custodian of encrypted intimate data — privacy review needed. **Deferred to Phase 2** if Phase 1 cache hit rate is insufficient. |
| **D2-c** | Supabase-side caching (PostgREST cache headers, edge functions) | Outside scope. Doesn't address client-to-Supabase round-trip cost from Vercel. **Rejected.** |

### D3 — Time-to-live (TTL) for cache entries

| Option | Description | Trade-offs |
|---|---|---|
| **D3-a** | 60-second TTL | Bounds staleness window after a profile update on a different instance. Long enough that consecutive flow calls in one user session reliably hit cache. **Recommended.** |
| **D3-b** | 5-minute TTL | Higher hit rate. Larger staleness window after profile updates (e.g., journal ingestion). Acceptable today (profiles update infrequently) but increases the risk of stale-data-feeds-reasoning. **Not recommended.** |
| **D3-c** | No TTL — rely entirely on explicit invalidation | Highest hit rate, lowest staleness when invalidation works. Brittle: a missed invalidation (e.g., a write path we forget to instrument) causes stale data to feed reasoning indefinitely. **Rejected.** |

### D4 — Cache key composition

| Option | Description | Trade-offs |
|---|---|---|
| **D4-a** | User-id only | Simplest. One entry per user. **Recommended.** |
| **D4-b** | User-id + profile_version | Forces a small DB query each cache hit to read the current `profile_version` for comparison. Defeats most of the saving (DB query is the bottleneck). **Rejected.** |

### D5 — Invalidation strategy

| Option | Description | Trade-offs |
|---|---|---|
| **D5-a** | Evict on `saveMentorProfile()` (same instance only) + TTL backstop | Local invalidation is immediate on the writing instance. Other instances see stale data for up to one TTL window. Acceptable given low write frequency and 60-second TTL. **Recommended.** |
| **D5-b** | TTL only, no eviction on write | Simpler to implement. Worst-case staleness window doubles (write happens just after a fresh cache fetch on the same instance). **Rejected** for the same instance; **Acceptable fallback** for other instances. |
| **D5-c** | Cross-instance invalidation via pub/sub (e.g., Supabase Realtime, Redis pub/sub) | Eliminates cross-instance staleness. Significant complexity, new infrastructure. **Over-engineered for current scale; deferred.** |

### D6 — Scope of caching change

| Option | Description | Trade-offs |
|---|---|---|
| **D6-a** | Wrap `loadMentorProfile()` itself; all callers benefit transparently | Single point of change. No caller-site edits. **Recommended.** |
| **D6-b** | Introduce a separate `getCachedProfile()` and migrate callers explicitly | Per-caller opt-in; safer if some callers must bypass cache. None currently need to bypass, and explicit migration to 8+ call sites is unnecessary churn. **Rejected.** |

## 4. Recommended defaults

| Decision | Recommended |
|---|---|
| D1 (cache value) | **D1-b** — cache the encrypted blob, not plaintext |
| D2 (cache layer) | **D2-a** — module-level in-memory Map, Phase 1 |
| D3 (TTL) | **D3-a** — 60 seconds |
| D4 (cache key) | **D4-a** — user-id only |
| D5 (invalidation) | **D5-a** — evict on `saveMentorProfile()` + TTL backstop |
| D6 (scope) | **D6-a** — wrap `loadMentorProfile()` |

## 5. Consequences

### 5.1 Performance

- Cache hit: skips ~50–80ms DB round-trip. Decrypt + parse + summary still run (~1–2ms). Estimated saving per warm hit: ~50–80ms.
- Cache miss: same as today (52–79ms total observed).
- Across a 5-message conversation with one cold open and four warm calls: estimated saving 200–320ms total.
- This is bounded value. Other latency contributors in the founder-hub request (LLM call, observation-retrieval, mentor-context-tokens) are larger and unaffected by this cache.

### 5.2 R17 surface

- Cache holds ciphertext (`encrypted_profile`, `iv`, `authTag`, `algorithm`, `version`). This data is already at rest in Supabase and is meaningless without the server-side encryption key.
- Plaintext profile is **not** stored in cache. Decryption produces a plaintext object that lives only for the request lifetime, identical to today.
- R17 surface is **unchanged**.

### 5.3 R17c interaction (genuine deletion endpoint, currently a 503 placeholder per project instructions P2d)

- When R17c is implemented, the deletion path **must explicitly evict the local cache** for the deleted user-id. A subsequent ADR or the R17c implementation note must document this requirement.
- Cross-instance staleness window: a deleted profile could remain cached on other instances for up to one TTL (60 seconds). For deletion semantics, this may be unacceptable. **Open Question O1** below.

### 5.4 Cache invalidation correctness

- All write paths to `saveMentorProfile()` will be audited as part of the implementation session to ensure each path invalidates the cache. Current known write paths: `/api/mentor-profile` PUT, journal ingestion pipeline. Audit must confirm completeness before wiring.
- A missed write path means stale profile data feeds reasoning until TTL expires.

### 5.5 Vercel cold-start behaviour

- A new function instance starts with an empty cache. The first `loadMentorProfile()` call on that instance pays full DB cost.
- This matches today's behaviour. No regression.
- If cold starts dominate observed slowness, Phase 2 (external cache) becomes warranted. Phase 1 data will tell us.

### 5.6 Memory footprint

- Each cache entry holds an encrypted blob (typical size 5–50 KB based on profile complexity) plus small metadata. With one practitioner today and a 60-second TTL, memory cost is negligible. Even at 10,000 active practitioners with full TTL retention per instance, memory cost is bounded at a few hundred MB — well within Vercel function memory limits.

### 5.7 Risk classification (per 0d-ii)

- **Critical.** This change adds a storage location for ciphertext that originates from the encryption pipeline. Per PR6, any change touching the encryption pipeline is Critical regardless of apparent scope. Critical Change Protocol (0c-ii) applies before deployment.

## 6. Open questions

- **O1 — Deletion semantics under R17c.** When R17c is built (currently P2d on the priority list), the implementation must reconcile with this cache. Specifically: is a 60-second cross-instance staleness window for deleted profiles acceptable, or must deletion force a global cache flush? Decision deferred until R17c implementation begins. Logged for revisit.
- **O2 — Cold-call performance.** Phase 1 data only covered warm calls. A cold call (first profile load after a quiet period) was not measured before this ADR. Phase 1 deployment includes the diagnostic timing log already in place; cold-call data will be collected during the observation window.
- **O3 — Phase 2 trigger condition.** When does Phase 1 (in-memory) become insufficient and Phase 2 (external cache) become warranted? Proposed trigger: cache hit rate below 50% on observed traffic, OR cold-call timings consistently above 200ms. Confirmed by founder before Phase 2 work begins.

## 7. Founder verification

| Check | Method |
|---|---|
| Cache hit reduces total time | Diagnostic timing log already in place. After cache wires, a second call within TTL should show `total_ms` near 0–2ms (hit) or unchanged (miss). |
| Cache miss returns identical profile to status quo | Static test: first call after deploy returns same shape as today; verified by founder via the existing hub flow. |
| `saveMentorProfile` invalidation works | After a profile update (e.g., a journal ingestion run), the next `loadMentorProfile` call shows full DB timing, not cache-hit timing. |
| No regression on existing flows | Run the three proof endpoints from the 25 Apr session (`/api/mentor/ring/proof`, `/api/support/agent/proof`, `/api/founder/hub/ring-proof`) and confirm no errors. |
| TypeScript clean | `npx tsc --noEmit` exit 0. |

## 8. Rollback plan

The implementation will be a single new file (`website/src/lib/mentor-profile-cache.ts`) plus a wrap of the existing `loadMentorProfile()` in `mentor-profile-store.ts`. Rollback:

1. Revert the wrap edit in `mentor-profile-store.ts` (restore the un-cached implementation).
2. Delete `mentor-profile-cache.ts`.
3. Push to main.
4. Verify with the same diagnostic timing log lines.

The diagnostic timing log itself stays in place until cache value is verified. It is removed in a separate cleanup commit after the cache is stable.

## 9. Notes for implementation session (next session)

- Follow Critical Change Protocol (0c-ii) before deployment. All five steps must appear in the session conversation: what changes, what could break, what happens to existing sessions, rollback, verification.
- Audit all write paths to `saveMentorProfile()` before wiring. Document the audit in the implementation handoff.
- Keep the diagnostic timing log in place during the observation window (≥1 week) to gather hit-rate data and answer Open Questions O2 and O3.
- Single-endpoint proof discipline (PR1): the cache wrap *is* the proof. No multi-surface rollout is in scope.

---

*End of ADR.*
