# S11b composition-battery runs (2026-07-18)

- **`composition-battery-results-r1.json` — SUPERSEDED, kept as record.** The r1 script read circles/kathekon off the RAW Layer-1 schema (wrong layer — those are Layer-2 fields), so every reading is zero/null. Do not cite r1 for any extraction claim.
- **`composition-battery-results-r2.json` — the evidence of record.** The corrected script mirrors the live chain (`extractFeatures` → `applyMechanisms({dikaiosyneWeighting:true})`), N=3 per fixture, pre-stated thresholds. Verdict: A (party-affecting) PASS 9/9 runs with circles; B (party-less) PASS; **C (mention-without-affect) FAIL 6/6 — Layer 1 converts quoted party language into circles** (recorded as `NARROWED_ARM_BOUNDS.mentionConversion`; the Layer-1 re-check is a named follow-up, its own Critical step); D (noise, report-only) 0/3 circles, `contrary` 3/3. Composed extraction latency 13–20s/run (vs ~3s lean) — the source of the live 28s consult timeouts observed in-session.

Script: `website/scripts/at-action-composition-battery.ts` (run from `website/` with `npx tsx --env-file=.env.development.local`).
