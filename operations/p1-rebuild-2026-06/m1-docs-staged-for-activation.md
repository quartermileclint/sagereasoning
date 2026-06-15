# M1 — Docs staged for the founder's activation step (CI-17 wording + CI-2 note + CI-3 envelopes)

**Status:** **APPLIED 2026-06-15** at the M1 production-activation close (`D-MECHANISM-CORRECTION-M1-CONSULT-PATH-PRODUCTION-ACTIVATION-2026-06-15`) — the CI-17 blocked-config statement, the CI-2 open-Layer-1 contract (extended with the now-live `l1_supply` capability + `sr_prac_`), and the CI-1 `response_format` + R17 retention disclosure landed on `website/public/llms.txt` + `website/public/.well-known/agent-card.json` + a NEW api-docs `/api/reason` subsection; the privacy §9 sentence landed; the **CI-3 latency envelopes kept their TEST label** (production figures pending a measured envelope, R18). **Originally staged:** 2026-06-12 (M1 consult-path build).
**Why staged:** the public materials describe the live service (R18 lineage — the S8b honesty corrections). With `SUBSTRATE_L3_DEFER_ENABLED` and `SUBSTRATE_L1_SCHEMA_KEY_PATH_ENABLED` UNSET in production, publishing `response_format` / key-path `layer1_schema` / deferral-shaped latency envelopes would claim behaviour production does not serve. These inserts are applied **at the founder's 0c-ii activation step**, alongside the flag flips and the production migration. The CI-3 numbers below carry their environment label until production-verified (R18: production claims only after production verification).

---

## 1. CI-17 — the blocked-configuration statement (Q2 verdict, exact sentence)

**Surfaces:** `website/public/llms.txt` (the agent-integration section, after the per-install token paragraph at ~line 118); `website/public/.well-known/agent-card.json` (capability notes); the api-docs page's `/api/reason` section.

> **The narrative account is the record that examination occurred. A verdict without a narrative account is a classification, not an examination. The narrative must exist. When it is generated and to whom it is surfaced are mechanical questions. Whether it exists is a methodological requirement.**
>
> Accordingly, a verdict-only configuration is not a legitimate practice configuration. `response_format: "assessment_first"` defers narrative generation out of the response path — it never suppresses it. Every examination's narrative is generated and retained server-side against the consult's correlation id (90-day retention; genuine deletion on request; encrypted at rest).

*(First paragraph is verbatim from the 2026-06-12 mentor consultation, Q2 — do not paraphrase. Second paragraph is the feature binding.)*

**Manifest-rule candidate (flagged, NOT authored — separate founder election):** an R18f-parallel — *no examination credential over verdict-only assessments* — would make the block enforceable at the accreditation write boundary. Goes through its own governance session if elected.

## 2. CI-2 — the open-Layer-1 contract on every auth path

**Surfaces:** llms.txt (same section); api-docs `/api/reason` request-fields table.

> **Supplying your own Layer-1 schema (any auth path).** The substrate accepts any `layer1_schema` that validates against the documented contract — on per-install (`sr_inst_`) calls it is required; on API-key (`sr_live_`) calls it is optional. Supplying it skips server-side Layer-1 extraction (the response reports `meta.layer1_source: "supplied"` and `layer1_latency_ms: 0`); omitting it keeps today's raw-text behaviour (`meta.layer1_source: "server"`). A schema that fails validation returns 400 with the field-level validator error. The original `input` text is required on every path — the safety perimeter runs on the text regardless of who computed the schema.

## 3. CI-1 — response_format + narrative retention (request affordance + R17 disclosure)

**Surfaces:** llms.txt; api-docs `/api/reason`; agent-card.

> **`response_format`** (optional): `"full"` (default — assessment + narrative prose in one response) or `"assessment_first"` (the signed assessment, extraction, and meta return immediately; the narrative is generated asynchronously and retained server-side; the response carries `narrative: { status: "deferred", correlation_id }`). Deferral is a request, not a guarantee — consults carrying a distress signal always return the full synchronous shape.
>
> **Retention disclosure (R17):** retained narratives and their paired signed assessments are stored encrypted at rest, for 90 days, keyed by correlation id; genuine (hard) deletion is available on request; retrieval is currently via the audited server-side record (a consumer-facing retrieval endpoint, gated to the subject credential, is planned separately).

**Privacy-page note for the activation step:** server-side retention of input-derived examination content is a processing change — the privacy/data-handling page takes a matching sentence at activation (lawyer-coupled wording fine to defer to the Stage-1-close engagement).

## 4. CI-3 — measured per-depth latency envelopes (filled at Step 7; environment-labelled)

**Surfaces:** llms.txt; api-docs; the mcp-contract surface (locate at application: no latency claims exist on any public surface today — S8b removed them — so these are additions, not corrections).

Measured at Step 7 (2026-06-12, **TEST environment** — local Next dev server against the test Supabase project; single-run cells, same 220-char input across all cells; full-shape cells include the awaited retention insert, i.e. the activation shape). Keep the TEST label until production-verified (R18):

> Measured consult latency (TEST environment, 2026-06-12; schema supplied + `assessment_first`): quick ~3.8s · standard ~4.3s · deep ~3.1s. Schema supplied + full synchronous narrative: quick ~22.1s · standard ~20.1s · deep ~22.3s. Raw text + full (server Layer 1 + inline narrative): quick ~29.5s · standard ~33.1s · deep ~31.7s. Production figures will replace these labels after production verification.

| Depth | schema supplied + deferred | schema supplied + full | raw text + full |
|---|---|---|---|
| quick | 3.8s | 22.1s | 29.5s |
| standard | 4.3s | 20.1s | 33.1s |
| deep | 3.1s | 22.3s | 31.7s |

**Reading (the CI-3 claim):** with the schema supplied and prose deferred, depth is a flat ~3–4s envelope — the deterministic engine (0–3ms) plus auth, signing, the awaited retention write, and transport; depth as *examination scope* no longer buys a latency penalty. On the full shapes, Layer 3 (~14–17s) and server Layer 1 (~10–13s) dominate at every depth, exactly as the forensic diagnosed (FX-4/FX-13). The deferred cells are the documented low-latency consult (`quick` + schema + `assessment_first`).

---

*Applied at: the founder's 0c-ii activation step (flags + production migration + vercel.json cron entry + these docs + the privacy-page sentence). Cross-references: the M1 session close; `D-MECHANISM-CORRECTION-BUILD-PLAN-APPROVED-2026-06-12`; the Q2 consultation record.*
