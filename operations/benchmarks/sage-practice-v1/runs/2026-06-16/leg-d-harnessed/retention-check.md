# Retention Check — Leg D (harnessed)

Model: Opus 4.8, maximum reasoning. Under M1 / CI-17, every examination's Layer-3 narrative exists server-side: a deferred consult moves *generation* (async via `waitUntil`, with the `narrative-sweep` cron as backstop) but never suppresses it, and the narrative is **retained encrypted** for 90 days with genuine deletion-on-request. The client-visible handle for each retained narrative is its `correlation_id`. There is **no public narrative-retrieval endpoint yet** (the R17a credential-scoped retrieval surface is planned separately), so backend retention is confirmed at scoring via SQL against `substrate_audit_narratives`. This file records the handles + the `narrative_status` I observed.

## Per-consult correlation_ids + narrative_status (`/api/reason`)

| # | Consult | correlation_id | narrative_status (observed) | Notes |
|---|---|---|---|---|
| C1 | Task adoption (`assessment_first`) | `c52837c6-3f02-42ca-bf3c-7b77b48dd6fc` | **deferred** | `narrative: {status:"deferred", correlation_id:"c52837c6…"}`; `meta.narrative_status:"deferred"`. Narrative generated async + retained; not returned in the response body. |
| C2 | Recommend / loop-closure (`assessment_first`) | `db5ccc04-db31-4820-9693-5dc94afc34b4` | **deferred** | `narrative.correlation_id = db5ccc04…`; `meta.narrative_status:"deferred"`. |
| C3 | Data handling (**full** synchronous) | `ff02472c-205a-49bc-99ea-ee17895a1146` | **inline** | Full sync → narrative generated **inline** (`prose` returned in full; `narrative` field null) AND retained inline (`meta.narrative_status:"inline"`). The retained row is keyed on this correlation_id (= the Loop-Id). The full prose is captured in `consultation-audit-report.md` §C3. |
| C4 | l1_supply demo (`assessment_first`) | `024e03bd-c804-4d66-837d-7b25c669ff7d` | **deferred** | `narrative.correlation_id = 024e03bd…`; `meta.narrative_status:"deferred"`. |

## Observations
- **3 deferred + 1 inline.** Every consult produced a retained narrative handle — consistent with the CI-17 existence guarantee (deferral moved generation for C1/C2/C4; C3's full-sync path generated + retained inline). No examination returned a verdict-only / no-narrative shape.
- The `correlation_id` equals the `X-Loop-Id` returned in the metering headers for each call (cross-check: see `leg-d-metrics.md` and the `raw/*.headers.txt` files).
- **For scoring:** confirm via SQL that `substrate_audit_narratives` holds an encrypted row for each of the four correlation_ids above (status `retained`/`completed`), and that the C1/C2/C4 deferred rows completed (via `waitUntil` or the hourly `narrative-sweep` backstop).
- Guardrail calls (`/api/guardrail`) do not run the translation-sandwich and produce no retained sandwich narrative; their Loop-Ids (`44a0ae44…`, `4df3370d…`) are billing/audit handles only.

## Deletion-on-request note
These narratives are retained against the `sagebench:meridian-ops@v1` benchmark credential (owner-scoped). If the benchmark requires genuine deletion afterward, the R17c path applies (deletion-on-request honours the encrypted-retention contract).
