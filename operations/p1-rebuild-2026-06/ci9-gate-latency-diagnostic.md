# CI-9 — Gate latency-variance diagnostic (FX-15: 20,015ms vs 46ms, both `ai_generated:true`)

**Date:** 2026-06-13. **Session:** Mechanism-correction M4. **Tier:** `code-standard` — **diagnostic only, not a fix** (PR10).
**Status:** **Diagnostic-certain (fast number = cache hit)** as of the founder-acknowledged replay 2026-06-13 (see §7). The 46ms-class verdict is confirmed a `runSageReason` in-memory cache hit. The *magnitude* of the ~20s cold side remains symptom-level (candidate causes in §3); the replay's cold call was ~14.3s, consistent with a single cold Haiku round-trip, and did not require a parse-retry to exceed the safety-relevant range. The original PR10 "ack required before resolved" gate is **satisfied for the fast number**; any *fix* (§6) is still a separate item.
**Scope guard:** no code path changed by this item. Candidate fixes (§6) are future items, each with its own risk class.

---

## 1. The symptom (from the P1 leg-B run)

The at-action gate (`/api/guardrail`) returned two verdicts whose `meta` looked contradictory: one at **~20,015 ms**, one at **~46 ms**, **both** labelled `ai_generated: true`. A 46 ms *generated* verdict is implausible for a Haiku round-trip (the engine targets ~2–4 s). FX-15 flagged this as "a cache hit or a fallback path mislabelling itself."

## 2. The mechanism (Diagnostic-certain at the code level)

**The 46 ms verdict is an in-memory response-cache hit inside `runSageReason`** — the engine the gate calls.

- `runSageReason` computes a cache key and short-circuits on a hit **before any LLM call**:
  - `website/src/lib/sage-reason-engine.ts:487` — `const ck = cacheKey('/api/reason', { input, context, domain_context, depth })`
  - `:488` — `const cached = cacheGet(ck)`
  - `:489-502` — on a hit it returns immediately, with **`ai_generated: true`** (`:497`) and **`latency_ms: Date.now() - startTime`** measured from `:486` (just before the cache check). A hit therefore reports only the surrounding route overhead — tens of ms — while still claiming `ai_generated: true`.
- The cache itself (`website/src/lib/model-config.ts:31-77`) is a process-local LRU `Map`, SHA-256-keyed, **1-hour TTL**, 500-entry cap. Its own header comment states: *"Identical inputs return cached results instantly (0ms latency)"* (`:11`).
- The `ai_generated: true` label is **hardcoded** in two places, so it cannot distinguish a cache hit from a fresh generation:
  - cache-hit branch: `sage-reason-engine.ts:497`
  - the shared envelope: `website/src/lib/response-envelope.ts:24` (the type is the literal `true`) and `:179` (always set).

**Why the gate hits it:** the gate calls `runSageReason` at `website/src/app/api/guardrail/route.ts:141`. The cache key includes `domain_context`, which the gate sets to one of three fixed strings keyed off `risk_class` (`guardrail/route.ts:131-135`). So **two gate calls with the same `action` + `context` + `risk_class`, on the same warm serverless instance within an hour, collide → the second is served from cache in ms.** Leg B's protocol consulted "every finding," generating many same-shape gate calls — exactly the condition for a warm-instance hit.

## 3. The 20,015 ms side (Diagnostic-uncertain — symptom level)

The cold number is a real evaluation, but **20 s is far above the ~2–4 s a single Haiku quick call should take.** Ranked candidates, to be discriminated by the replay:

1. **Parse-failure retry escalation (leading candidate).** On an unparseable response the engine retries once, and at quick depth it **escalates Haiku → Sonnet** (`sage-reason-engine.ts:567-588`) — a second, slower round-trip stacked on the first. A `console.warn` ("Parse failed… Retrying with…") is emitted on this path; **the leg-B/TEST logs should show it on the 20 s call if this is the cause.**
2. **Cold start.** First request to a cold Fluid-compute instance (module init + first Anthropic connection).
3. **Context-load latency.** The gate awaits `getProjectContext('minimal')` (`guardrail/route.ts:139`) and `getStoicBrainContext(depth)` before the engine; if either does I/O on a cold path it adds to the wall-clock.
4. **Anthropic API tail latency.** Ordinary long-tail on a single call.

These are not mutually exclusive; (1) is the most likely single explanation for a ~20 s outlier and is the cheapest to confirm (grep the logs / reproduce a parse failure).

## 4. What is *not* the cause (refuted)

- **Cross-endpoint cache poisoning from `/api/reason`.** Post the M1-CP6 cutover (2026-05-08), `/api/reason` serves the **translation sandwich** (`runSandwich`), which does **not** call `runSageReason` — so it cannot seed the gate's cache. The cache is shared only among the routes that still call `runSageReason` (the gate + the five score routes), and their `domain_context`/`depth` differ, making cross-route collisions unlikely. The 46 ms is a **within-gate** repeat, not a `/api/reason` artefact. (Adversarial verification, M4 understand-workflow.)
- **A mislabelled deterministic fallback.** The structured parse-failure return is correctly labelled `ai_generated: **false**` (`sage-reason-engine.ts:610`). So the 46 ms is not that path — it is the cache-hit path (`ai_generated: true`), consistent with the symptom.

## 5. The confirming replay (founder-walked — PR17; TEST only)

Mechanism proof (no API, runnable now): `website/src/lib/__tests__/ci9-cache-mechanism.test.ts` — demonstrates (a) a `cacheGet` after `cacheSet` returns in well under 1 ms, and (b) `cacheKey` is identical for identical inputs irrespective of the *calling* endpoint label, i.e. the collision condition holds.

Empirical attribution (founder runs against TEST, real Haiku calls — `website/scripts/ci9-gate-replay.ts`):

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsx --env-file=.env.development.local scripts/ci9-gate-replay.ts
```

Expected: call #1 (cold) prints a multi-second `latency_ms`; call #2 (identical input, same process) prints a sub-100 ms `latency_ms` — **both `ai_generated:true`** — reproducing the 46 ms/20,015 ms split from one cause. If a parse failure fires on the cold call, the engine's retry `console.warn` confirms candidate (1) for the 20 s side.

Once the founder observes the split, the *fast* number moves to **Diagnostic-certain (cache hit)**; the 20 s side moves to Diagnostic-certain only if the retry warn (or a cold-start timing) is observed.

## 6. Candidate fixes (NOT built this session — each its own item + risk class)

1. **Label cache hits honestly.** Add `from_cache: boolean` to the engine meta (and stop hardcoding `ai_generated`/derive it), so a cached verdict is distinguishable. Closes the FX-15 *honesty* half. (Standard; touches the shared engine + envelope.)
2. **Namespace the cache key by the real endpoint.** Today every caller writes under `'/api/reason'` (`sage-reason-engine.ts:487`); passing the true endpoint avoids silent cross-route sharing. (Standard.)
3. **Reconsider caching on a *safety* gate (Elevated/PR6-adjacent).** A safety verdict served from a 1-hour cache is stale by design and, today, indistinguishable from a fresh evaluation. Whether a gate should cache at all — and for how long — is a safety-posture question for the founder, not a mechanical fix. **Flagged, not decided.**
4. **Make the 20 s path observable.** Emit the retry escalation as a structured signal (not just `console.warn`) so the cost/latency of the Haiku→Sonnet retry is visible in telemetry (ties to CI-10's metering).

## 7. Acknowledged replay result (2026-06-13)

The founder ran `scripts/ci9-gate-replay.ts` against TEST (two identical `runSageReason` quick calls, one warm process). Observed:

```
cold=14273ms  warm=0ms  ratio=14273.0x
RESULT: reproduced — the fast verdict is a cache hit (FX-15 mechanism confirmed).
Note: usage=absent on call #2 confirms NO fresh LLM call (pure cache hit).
```

**Interpretation:** the split is reproduced from a single cause. Call #2 returned in **0ms with `usage` absent** — a pure cache hit (no Anthropic call), exactly the §2 mechanism. This confirms the 46ms-class P1 verdict was a cache hit served with a hardcoded `ai_generated:true`. **The fast-number diagnosis is acknowledged and Diagnostic-certain.**

**Residual (unchanged):** the cold call was ~14.3s here vs the P1's ~20.0s — same order, both cold real calls; the exact ~20s magnitude (parse-retry vs cold-start vs API tail, §3) was not isolated this run and is **not required** to explain FX-15. No "Parse failed… Retrying" warn was reported on this run's cold call, so candidate (1) is neither confirmed nor excluded for the larger P1 outlier; it remains the leading explanation if the magnitude is ever pursued. Pursuing it is optional and out of CI-9's scope.

**Disposition:** CI-9 is complete as a diagnostic. The honesty defect it exposes (a cached verdict indistinguishable from a fresh one) is the candidate fix in §6.1 (`from_cache` label) — a separate, future item with its own risk class, not built here.

---

*Diagnostic note ends. The FX-15 fast-number mechanism is founder-acknowledged (§7) and Diagnostic-certain; no code path was changed by CI-9; any fix is a separate §6 item.*
