# ADR-PE-01 — Pattern Analysis Storage Inside the Encrypted Profile Blob

**Status:** Draft (proposed for founder approval). Located at `/drafts/`. Promotes to `/compliance/ADR-PE-01-pattern-analysis-storage.md` on adoption per the D6-A archive protocol.
**Date:** 2026-04-26
**Version history:** v1 draft. Founder selected Option 3 from a four-option comparison surfaced in-session on 2026-04-26 after declining the brief's premise that `mentor-ledger.ts` had a write-side to wire (the file is a pure type/logic module with zero database calls and zero callers in `/website/src`). The four options surfaced were: (0) no persistence, (1) sidecar table, (2) plain JSONB column on `mentor_profiles`, (3) field inside the encrypted profile blob. Option 3 selected with explicit founder acknowledgement that the current D7 posture (intimate data persisted to Supabase cloud) applies, named so that a future D7 resolution is not blocked by silent architectural choice.
**Related rules:** R17 (intimate data — specifically R17b application-level encryption, R17c genuine deletion, R17f implementation safety), PR1 (single-endpoint proof before rollout), PR3 (safety systems are synchronous), PR6 (safety-critical changes are Critical risk — encryption pipeline is named explicitly), PR7 (deferred decisions are documented), KG1 rule 2 (await all DB writes — no fire-and-forget), KG3 (hub-label end-to-end contract), KG7 (JSONB shape — pass arrays/objects directly to Supabase, no `JSON.stringify`).
**Supersedes:** —
**Superseded by:** —
**Related decisions:** D-PE-2 (b) — this ADR resolves the deferred storage-location decision named in the 2026-04-25 pattern-engine close. D-PE-2 (c) — the live `mentor_interactions` loader work that this storage choice supports; founder selected hub-scoped (per-(user, hub)) on 2026-04-26. D-Ring-2-01 (ADR-Ring-2-01) — the canonical `MentorProfile` shape that the new `pattern_analyses` sub-key extends; coordination required because both ADRs change the in-blob shape. ADR-R17-01 (profile-store retrieval cache) — coordinates with this ADR because both wrap the profile-store loader path; cache invalidation rules apply unchanged. AC7 (Session 7b standing constraint) — confirmed not engaged by this ADR.

---

## 1. Context

### 1.1 What pattern-engine produces

`sage-mentor/pattern-engine.ts` is a deterministic analysis module that consumes `InteractionRecord[]` (per-session events from the `mentor_interactions` table) and produces a `PatternAnalysis` summary:

```ts
export type PatternAnalysis = {
  readonly computed_at: string
  readonly interactions_analysed: number
  readonly temporal_patterns: TemporalPattern[]
  readonly passion_clusters: PassionCluster[]
  readonly regression_warnings: RegressionWarning[]
  readonly has_novel_patterns: boolean
  readonly ring_summary: string  // pre-computed string, no LLM needed
}
```

The analysis is deterministic: same inputs, same outputs. The optional novel-pattern narrative path (`buildPatternNarrativePrompt`) is the only LLM-touching surface; the main `analysePatterns` pass is pure compute.

### 1.2 Where it stands today

As of 2026-04-25, pattern-engine reaches **Wired-against-fixture** status on `/api/mentor/ring/proof`. The endpoint exercises pattern-engine using `PROOF_INTERACTIONS` (a 15-record fixture) plus `PROOF_PROFILE`. Live integration is blocked by the three deferrals adopted under D-PE-2:

- **(a)** shape adapter — resolved 2026-04-25 (ADR-Ring-2-01).
- **(b)** pattern-analysis storage location — **resolved by this ADR**.
- **(c)** live `mentor_interactions` loader (hub-scoped, per founder direction 2026-04-26) — pending; Critical risk; future session.

### 1.3 Why storage matters at all

Pattern-engine is deterministic and synchronous (~tens of milliseconds for fixture-sized inputs, exact cost on live data unknown until the loader lands). On every reflect / hub request the engine could compute pattern analysis from scratch using the loader's output. So a "no persistence" option is technically viable. The reasons to persist `PatternAnalysis` between requests are:

1. **Cross-request continuity.** Pattern signals often emerge across many sessions. A persistence record makes "this pattern first appeared on date X, has reappeared N times" an explicit field rather than a re-derivation.
2. **Cost.** Loading and analysing all hub-scoped interactions on every request is wasteful when the answer rarely changes between two adjacent reflect calls.
3. **Auditability.** A persisted analysis with `computed_at` is a moment-in-time record. A purely transient analysis cannot be audited later.
4. **Mentor reasoning depth.** The mentor persona can reference "the pattern observed three weeks ago" only if the analysis from three weeks ago exists somewhere readable.

These benefits cost a new at-rest data location with intimate practitioner content. The choice of *where* that location is determines the R17 surface, the encryption posture, and the rollback profile.

### 1.4 Hub-scoping

The founder selected **hub-scoped** for the loader on 2026-04-26: pattern-engine analyses one stream per (user, hub) rather than one cross-hub stream per user. This means the persisted `PatternAnalysis` is also keyed by `hub_id`. The current hubs in scope are `'private-mentor'` and `'founder-mentor'` (per existing hub taxonomy).

### 1.5 D7 posture

D7 (local-first storage for intimate data) is an open non-decision in the build-knowledge-extraction D-register. Persisting `PatternAnalysis` to Supabase cloud is **the current accepted posture under D7**, not a silent architectural choice. This ADR names that explicitly. A future D7 resolution that adopts local-first storage would supersede this ADR — the storage location chosen here would be one of the surfaces a local-first migration would have to address.

---

## 2. The four options considered

| # | Option | Storage location | Encrypted at rest | New schema | Risk | Rollback |
|---|---|---|---|---|---|---|
| 0 | No persistence | Memory only, per request | n/a | None | **Standard** | Single-file revert of the loader |
| 1 | Sidecar table | New `mentor_pattern_analyses` table with own RLS | No (plain JSONB) | New migration | **Elevated** | Drop table; revert loader |
| 2 | New JSONB column on `mentor_profiles` | New `pattern_analysis JSONB` column | No (plain JSONB) | New migration | **Elevated** | Drop column; revert loader |
| 3 | **Field inside `mentor_profiles.encrypted_profile`** (blob) | Sub-key inside the existing encrypted blob | **Yes** (existing R17b pipeline) | None | **Critical** under PR6 | Re-encrypt blobs to remove field; revert loader and any blob-shape changes |

Option 3 selected.

---

## 3. Decision

**Option 3 — `pattern_analyses` sub-key inside the decrypted `MentorProfile` blob, keyed by `hub_id`.**

The pattern-analysis output is stored inside the existing encrypted blob (`mentor_profiles.encrypted_profile` ciphertext + `encryption_meta` sibling JSONB) rather than as a separate column or table. After decryption and JSON-parse, the canonical `MentorProfile` carries an optional `pattern_analyses` field keyed by `hub_id`.

```ts
// Inside the decrypted blob — extension to canonical MentorProfile
{
  ...currentMentorProfileFields,  // unchanged — see ADR-Ring-2-01 §6.1 (C-α)
  pattern_analyses?: {
    [hubId: string]: PatternAnalysis  // keyed by 'private-mentor', 'founder-mentor', etc.
  }
}
```

### 3.1 Reasoning

1. **Encryption at rest is preserved.** Pattern-engine output is intimate data by policy (it derives from passion observations and regression signals). Options 1 and 2 would store it as plain JSONB, expanding the cloud-side R17 surface unencrypted. Option 3 inherits the existing R17b application-level encryption pipeline at no incremental encryption cost.

2. **No new schema, no new migration.** The change is purely to the in-blob shape, which is already an opaque ciphertext column from PostgreSQL's perspective. KG7 (JSONB shape) does not apply at the column level — the column is `BYTEA`-equivalent ciphertext, not JSONB. (Inside the blob, KG7-equivalent discipline still applies to how arrays are represented, but no Supabase-client serialisation is involved.)

3. **R17c (genuine deletion) for free.** Pattern data is deleted when the profile blob is deleted. No separate deletion path. No risk of orphaned pattern records persisting after a profile delete, which would be a real failure mode for Options 1 and 2.

4. **Hub-scoping keyed by `hub_id` inside the blob is the natural shape.** `mentor_profiles` is per-user (`UNIQUE(user_id)`), not per-(user, hub). Putting pattern data inside the per-user blob and keying it by `hub_id` matches the data's actual cardinality (one analysis per (user, hub) pair) without inventing a new per-(user, hub) row primitive.

5. **Coordinates cleanly with ADR-Ring-2-01.** The canonical-shape transition adopted under ADR-Ring-2-01 already changes the in-blob shape on the staged path. Adding `pattern_analyses` as an optional canonical field is the same pattern: extend `MentorProfile` in place (C-α), optional field, no sage-mentor reads-pattern_analyses by default.

6. **Coordinates cleanly with ADR-R17-01.** The retrieval cache stores ciphertext. Adding a sub-key inside the decrypted blob does not change what the cache stores. The cache invalidation rules apply unchanged.

### 3.2 What is accepted by choosing Option 3

- **Critical risk classification under PR6.** Every read or write through the encryption pipeline now carries pattern-analysis data. The full Critical Change Protocol (0c-ii) applies for the implementation session(s) — not for this ADR (the ADR itself is documentation, Standard).
- **Blob-size growth.** Each `PatternAnalysis` is a few kilobytes. With two hubs and modest pattern counts, the blob grows by O(10 KB) — within encryption-pipeline tolerances but worth measuring after Session 1 lands.
- **Read amplification.** Every profile read decrypts the entire blob, including pattern data, even when the consumer doesn't need pattern data. Not a measurable cost at current traffic but a real coupling. Documented as O1 below.
- **Write coupling.** Updating pattern data requires a full blob re-encrypt and rewrite. Pattern updates and profile updates are coupled at the persistence boundary — this is acceptable because both are infrequent operations, but it forces a coordination rule (see §6.2).
- **Hub addition is non-trivial.** Adding a new hub (e.g., a future `'support-mentor'`) requires an in-blob shape addition, not a new column. The shape is forward-compatible (optional keys), but the discipline applies.

### 3.3 What this is not

- This ADR does **not** add a new column or table.
- This ADR does **not** change the encryption algorithm, key management, or encryption pipeline plaintext-handling rules.
- This ADR does **not** decide *when* pattern-engine recomputes (that is a loader / scheduler question — see §7).
- This ADR does **not** retire the in-memory compute path. Option 0 (recompute on each request) remains the fallback when pattern_analyses is absent or stale.

---

## 4. Schema changes

**No SQL migration. No new columns. No new tables. No new indexes.**

The only change is to the in-blob shape:

### 4.1 Canonical type extension

`MentorProfile` (defined in `sage-mentor/persona.ts`) gains an optional field:

```ts
// In sage-mentor/persona.ts (or via the C-α extension pattern from ADR-Ring-2-01 §6.1)
export type MentorProfile = {
  // ... all existing fields unchanged ...
  pattern_analyses?: Record<string, PatternAnalysis>  // keyed by hub_id
}
```

The field is **optional**. Profiles persisted before this ADR's implementation will be read with `pattern_analyses === undefined`, and the loader's fallback (Option 0 — compute on each request) handles that case. Backfill is not required.

### 4.2 Shape rules inside the blob

- **Key:** `hub_id` (string). Allowed values match the existing hub taxonomy: `'private-mentor'`, `'founder-mentor'`. Adding a new hub requires an explicit shape note in the relevant ADR; no schema enforcement at the type level beyond `string`.
- **Value:** `PatternAnalysis` (sage-mentor/pattern-engine.ts), unchanged. The `computed_at` field carries the freshness timestamp.
- **Absence is explicit.** A missing key for a hub means "no analysis exists yet for this (user, hub)." A present-but-empty `PatternAnalysis` (zero patterns, zero clusters) means "analysis ran and found nothing." These are distinct states and the loader respects the distinction.

### 4.3 Optional `last_pattern_compute_at` column on `mentor_profiles`

For freshness queries that want to know "is the cached analysis stale?" without decrypting, an **optional** plain timestamp column on `mentor_profiles` could carry `last_pattern_compute_at TIMESTAMPTZ`. This is a deferred sub-decision — adding it later would be a small Standard migration. Logged as O3 below.

---

## 5. Encryption pipeline impact (PR6)

### 5.1 Why this is Critical

The encryption pipeline (`server-encryption.ts`) is the R17b boundary. PR6 names "any change to encryption pipeline … is Critical regardless of apparent scope." Although this ADR adds no code to `server-encryption.ts` itself, it changes the **shape** of plaintext that flows through encrypt/decrypt. Every reader and writer that touches the blob is in the change's blast radius.

Affected surfaces (post-implementation):

- `loadMentorProfile` (renamed from `loadMentorProfileCanonical` per ADR-Ring-2-01 Session 5) — decrypts and parses; the parsed object now optionally carries `pattern_analyses`.
- The write-side (`saveMentorProfile` / equivalent) — writes the full blob including any `pattern_analyses` sub-key. Care required: a write that computes a fresh profile but does not include existing `pattern_analyses` would silently delete pattern data.
- The journal-ingestion output stage — currently writes profile data; after pattern-engine integration, may also write pattern data depending on cadence (see §7).

### 5.2 Critical Change Protocol (0c-ii) requirements

For each implementation session, the conversation must include — visibly — before the founder deploys:

1. **What is changing** — plain language. "Pattern data starts being saved inside the encrypted profile blob alongside the rest of your profile data."
2. **What could break** — specific worst case. "If the write path is wrong, an existing profile blob could be overwritten with one missing fields. The fallback for a malformed read is to return null, which means the user would see the no-profile path until the issue is resolved."
3. **What happens to existing sessions** — "Existing logged-in users continue to use their cached session. The only state being changed is on the profile-blob persistence side. No session invalidation."
4. **Rollback plan** — exact steps. "Revert the commit that introduces the pattern-analysis read/write. The blob's `pattern_analyses` field stays present but unread; once a write of any other field happens, the pattern data is preserved (because reads before the revert serialised it; the optional field round-trips). If a write happens to an existing-profile path post-revert, the field is omitted from the new blob — pattern data is dropped on next save. Acceptable: pattern data is a derived analysis, recoverable by recomputation."
5. **Verification step** — what the founder checks. "Founder visits `/founder-hub` after deploy, confirms the existing mentor flow works (no degradation). Optionally pastes a Console snippet to read the JSON and confirm `pattern_analyses` is populated for the relevant hub."

### 5.3 Synchronous-only writes (PR3 + KG1 rule 2)

Pattern-data writes are awaited before the response is constructed. No background process, no fire-and-forget. PR3 applies because pattern-engine output influences the BEFORE prompt's content; PR3 is satisfied because pattern-engine is already synchronous and stays synchronous. KG1 rule 2 applies because the write must complete before Vercel terminates execution.

---

## 6. R17 footprint

### 6.1 R17b (application-level encryption)

Pattern data is encrypted at rest via the existing pipeline. No changes to encryption keys, algorithm, IV generation, or auth-tag handling. No new at-rest plaintext surface anywhere.

### 6.2 R17c (genuine deletion)

The `/api/user/delete` endpoint deletes the `mentor_profiles` row including the `encrypted_profile` ciphertext column. Pattern data inside the blob is destroyed when the row is destroyed — same delete path, no separate cleanup. This is an explicit improvement over Options 1 and 2, where a sidecar table or new column would have required an explicit deletion-path change.

### 6.3 R17f (implementation safety)

Three implementation rules to log against this ADR for the eventual code:

- **Read-modify-write discipline.** Any code path that updates pattern data must read the existing blob, modify only the relevant `pattern_analyses[hub_id]` sub-key, and write the full blob back. Naive writes that omit fields are silent data loss. The implementation session's plan walk must name the pattern explicitly.
- **Hub-key scoping.** Writes to `pattern_analyses[hub_id]` must validate `hub_id` against the allowed set (via `mapRequestHubToContextHub` or equivalent — see KG3) before persisting. An unrecognised `hub_id` would store data under a label that no reader looks for.
- **Schema-version awareness.** The blob's `version` field (already part of `encryption_meta`) records the encryption-version. A future schema change to `pattern_analyses` (e.g., adding a sub-field to `PatternAnalysis`) is forward-compatible because the field is optional and additive. Breaking changes require a separate ADR.

### 6.4 D7 (local-first) posture confirmed

Cloud storage of intimate data continues under D7's accepted current posture. This ADR does not progress D7 toward resolution either way; it commits to cloud storage of one more class of intimate data (pattern analyses) under that current posture. A future D7 resolution that adopts local-first must include this surface in its migration plan.

---

## 7. Coordination with the loader (D-PE-2 (c))

### 7.1 Read contract

The loader (Option A from the 2026-04-26 founder direction) reads `mentor_interactions` rows scoped to `(profile_id, hub_id)` and returns `InteractionRecord[]`. After reading, the loader passes the records to `analysePatterns(profile, interactions)`, which returns a `PatternAnalysis`. The `PatternAnalysis` is then optionally cached into `profile.pattern_analyses[hub_id]` per this ADR.

### 7.2 Write cadence (deferred sub-decision)

This ADR does not prescribe *when* the loader writes pattern data back to the blob. Three reasonable cadences exist:

- **Per-request.** Every reflect / hub call recomputes and writes. Highest write load; freshest data; coupled to read latency.
- **Throttled.** Recompute and write only if `Date.now() - pattern_analyses[hub_id].computed_at > THRESHOLD` (e.g., 6 hours). Less write load; data may be slightly stale.
- **Lazy on absence.** Compute and write only if `pattern_analyses[hub_id]` is absent. Cheapest; data goes stale silently after first write. Requires an explicit invalidation hook.

Founder picks at the implementation session's plan walk. Throttled is the natural default; Per-request is acceptable on low traffic; Lazy on absence is risky without an invalidation hook. Logged as O4 below.

### 7.3 Read cadence

Reads are simple: every consumer that wants pattern data reads `profile.pattern_analyses[hub_id]` after the existing profile load. If absent, fall back to recompute (Option 0) or skip pattern augmentation entirely. The implementation session's plan walk names the per-consumer fallback.

---

## 8. Single-endpoint proof (PR1)

Per PR1, this storage pattern proves on a single endpoint before any rollout. Recommended sequence (founder picks at implementation session open):

- **Session 1 (Critical) — pattern-data write on the proof endpoint.** Add `pattern_analyses` writes to `/api/mentor/ring/proof` (already wired against fixtures). The proof endpoint becomes the first surface to actually persist pattern data inside the encrypted blob. Verify: TypeScript clean, live-probe, post-write read confirms the blob carries `pattern_analyses['private-mentor']`. Risk: Critical (PR6 — encryption pipeline).
- **Session 2 (Critical) — pattern-data read on the proof endpoint.** The proof endpoint reads the persisted `pattern_analyses` first; falls back to recompute if absent. Verify: same probe pattern; post-deploy read uses persisted analysis; round-trip works.
- **Session 3 (Critical) — wire to the first live consumer.** Founder picks: `/api/mentor/private/reflect` or `/api/founder/hub`. Each is its own PR1 single-endpoint proof.
- **Session 4+ (Critical, per consumer) — additional consumers.** As needed.

---

## 9. Risks accepted

| Risk | Mitigation |
|---|---|
| **Read-modify-write data loss.** A naive write that omits `pattern_analyses` deletes pattern data on the next save. | Implementation session's plan walk names the read-modify-write discipline. The write-side function signature uses a partial-update pattern (e.g., `updateMentorProfile(userId, patch: Partial<MentorProfile>)`) rather than a full-replace pattern, OR the full-replace pattern is documented as "must read first." |
| **Blob-size unbounded growth.** Pattern arrays could grow large with many sessions. | `PatternAnalysis` is bounded by pattern-engine's detection thresholds (top-N temporal patterns, top-N clusters, finite regression warnings). Real growth is logarithmic at worst. Monitored after Session 1 lands. |
| **Hub-key drift.** A writer using a non-canonical hub label (e.g., `'private_mentor'` underscore) stores data the reader can never find. | KG3 end-to-end discipline. The implementation uses `mapRequestHubToContextHub` for any request-derived hub_id and hardcoded constants elsewhere. The plan walk includes the grep verifying hub-key consistency. |
| **Encryption-pipeline regression.** Any bug in the read-modify-write path could leave the blob in a partial state. | The encryption pipeline is unchanged; the blob's structure is additive and optional; rollback is "revert the read-modify-write code, accept that one save dropped pattern data." Critical Change Protocol (0c-ii) applies in full. |
| **Schema drift between sessions.** A future change to `PatternAnalysis` shape could break older blobs. | The encryption blob's `version` field already exists for this. Breaking changes to `PatternAnalysis` shape go through a separate ADR with a migration plan. This ADR commits only to the current `PatternAnalysis` shape (sage-mentor/pattern-engine.ts). |
| **D7 future resolution invalidates this surface.** A future local-first decision would have to migrate this data. | Named explicitly here (§6.4). Pattern analysis is deterministic and recomputable, so a local-first migration's plan can include "drop cloud-side pattern data; recompute from local-side interactions." Less destructive than for non-derived data. |

---

## 10. Rollback

### 10.1 Pre-deploy rollback (no production data exists)

Revert the commits introducing pattern-data read and write. No data exists in the blob's `pattern_analyses` field yet. Zero data loss.

### 10.2 Post-Session-1 rollback (proof endpoint has written data to the founder's profile)

1. Revert the read-modify-write commits.
2. The blob's `pattern_analyses` field remains in the founder's profile blob — it is no longer read by any code path, but it persists until the next profile save without that field.
3. On the next profile save (e.g., journal re-ingestion, baseline-response update), `pattern_analyses` is dropped from the saved blob (because the post-revert code does not include it in the writeable shape).
4. Pattern data is then permanently gone for that profile. Recoverable by recomputation if the pattern-engine + loader still exists.

### 10.3 Post-live-consumer rollback

Same procedure as 10.2, applied per affected consumer endpoint. Pattern data is persisted only as a derived cache; loss of cache is recoverable.

### 10.4 Critical rollback path (encryption-pipeline regression)

If a write produces an invalid blob (decrypt fails for any reason post-write), the symptom is a 500 from any consumer that calls `loadMentorProfile()`. Recovery procedure:

1. Identify the offending commit (most recent encrypt/decrypt path change).
2. Revert the commit. Push to main. Vercel redeploys.
3. Existing valid blobs continue to read fine. Any blob written during the bug window is corrupt — restore from Supabase point-in-time recovery (PITR) if available, or accept the loss and reseed from journal data.
4. Founder live-probes `/founder-hub` to confirm restoration.
5. Post-mortem before any retry. The `0c-ii` step "what could break" must name this scenario in the plan walk.

---

## 11. Authority for this ADR

This ADR is **draft pending founder approval**. It is a Standard-risk document (text only — no code, no schema, no live data movement). Adoption requires a founder "approve" or equivalent signal in a session, after which the file is moved from `/drafts/` to `/compliance/` per the D6-A archive protocol and the decision log records the adoption with the entry ID `D-ADR-PE-01` (proposed).

The implementation sessions that follow this ADR are each Critical under PR6 and require their own founder approvals at the start of each session per the Critical Change Protocol (0c-ii).

---

## 12. Open items

- **O1 — Read amplification.** Every profile read decrypts the full blob, even when pattern data is not needed. Acceptable at current traffic. Logged for revisit if profile reads become a hot path.
- **O2 — Blob-size monitoring.** After Session 1 lands, capture the founder's profile blob size before and after pattern-data write. If blob size grows beyond ~50 KB, evaluate whether a sidecar table becomes preferable despite the encryption-at-rest trade-off. (Trigger: blob size > 50 KB OR encrypt/decrypt latency p95 > 50 ms.)
- **O3 — Optional `last_pattern_compute_at` column.** Adding a plain timestamp column on `mentor_profiles` would let freshness queries skip decryption. Standard-risk addition. Defer until a freshness-driven feature requires it.
- **O4 — Write cadence.** Per-request vs throttled vs lazy-on-absence. Founder picks at implementation Session 1's plan walk. Default recommendation: **throttled (6-hour minimum between writes)** as a balanced starting point.
- **O5 — Backfill of existing profiles.** Profiles that exist before this ADR's implementation will have `pattern_analyses === undefined` until their next save. No backfill is required because the fallback is recompute. A future feature could add a one-time backfill job (Critical — touches every blob).

---

## 13. Summary table — what this ADR does and does not commit to

| Concern | Committed | Deferred | Out of scope |
|---|---|---|---|
| Encrypted-at-rest storage | ✓ | | |
| Hub-scoping by `hub_id` inside the blob | ✓ | | |
| `pattern_analyses` as optional field on canonical `MentorProfile` | ✓ | | |
| No new column or migration | ✓ | | |
| R17c deletion via existing profile-delete path | ✓ | | |
| Critical Change Protocol applies to implementation | ✓ | | |
| Single-endpoint proof first (PR1) | ✓ | | |
| Write cadence (per-request / throttled / lazy) | | ✓ (Session 1 plan walk) | |
| First live consumer endpoint | | ✓ (founder picks) | |
| `last_pattern_compute_at` plain column | | ✓ (O3) | |
| Backfill of existing profiles | | ✓ (O5) | |
| Encryption algorithm or key management | | | × — unchanged |
| D7 (local-first) resolution | | | × — separate decision |
| Engine-mentor-ledger persistence | | | × — separate ADR if pursued |
| Pattern-engine algorithm changes | | | × — separate ADR if needed |

---

*End of ADR-PE-01 v1 draft. Awaiting founder approval.*
