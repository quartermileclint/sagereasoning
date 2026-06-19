# Session Close — 2026-06-19 — Mechanism-correction Part C: staged docs applied + thin SDK built

**Stream:** founder.
**Governing frame:** /adopted/session-opening-protocol.md (cached via /adopted/standing-protocol-cache.md).
**Tier:** R18 (doc faithfulness) + `code-standard` (SDK) — **Standard** risk. No auth/perimeter/schema/flag change.
**Date:** 2026-06-19.

## What this session did

Applied the **staged public-contract docs §1–§7** (`operations/benchmarks/sage-practice-v1/public-contract-docs-staged.md`) to the three live public surfaces, then built the **thin TypeScript client SDK** (founder elected "Both"). Per R18, every shape was re-verified against its cited live code path **at apply time** (three parallel Explore agents + first-hand confirmation of the §3 signature nesting).

**Docs (§1–§7):**
- **§1 Accreditation write+read** (the biggest gap) — new section in `llms.txt`, a paired api-docs section, and a `request_body_shape` pointer on the agent-card `sage-assent-write-auth/v1` extension. Includes the consult→`provenance.signed_assessments` round-trip, the 422 `bad_provenance` / 403 `no_examination` split, and the #6b consumer-unforgeable read-back note (`typical_kathekon_quality` default `contrary`, `coverage_status: agent_elected`).
- **§2** `layer1_schema` object shape · **§3** signature verification (the canonical-form footgun + `public_key_pem`) · **§4** `prior_feedback` · **§5** the `l1_supply` echo caveat · **§6** guardrail-is-not-a-fact-checker.
- **§7 Clarification-continuation** (Part A, live) — turn-1/turn-2 shapes, the byte-identical-`input` rule, the four 400s, the R20a guarantee, and a **NEW 12th agent-card extension** `tier1-clarification-continuation/v1`.

**SDK (`sdk/typescript/`):** a dependency-free Node-18+ `fetch` client encoding consult (incl. `assessment_first`, `layer1_schema` reuse, `prior_feedback`), the clarification-continuation round-trip, signature verification (a faithful port of the server canonicaliser), and the accreditation `provenance` round-trip — plus a worked end-to-end example. `"private": true` (nothing published; distribution decided separately). Not imported by the Next app.

## R18 re-verification — drift handled
- `layer1_schema` `version` now accepts `v1|v2|v3` — doc leads with "supply a prior consult's `extraction` verbatim" and notes the version set.
- §3 "signature covers `.assessment.assessment`" is **correct** for an API consumer (a verifier agent's "whole Layer2Assessment" was a signer-vs-response perspective mismatch — confirmed first-hand at `parallel-run.ts:1044-1047`: the response's top-level `assessment` is the `SignedLayer2Assessment`, the signature covers its nested `assessment`).
- All §7 error strings, the 5000-char limit, the 30-min token expiry, and the R20a-on-`input`+`clarification_response` guarantee verified byte-exact.

## Decisions Made
- D-MECHANISM-CORRECTION-PART-C-DOCS-APPLIED-SDK-BUILT-2026-06-19 appended.

## Status Changes
| Item | Old | New |
|---|---|---|
| Staged public-contract docs §1–§7 | Staged | Applied to live surfaces (Live-on-push) |
| `agent-card.json` extensions | 11 | 12 (`tier1-clarification-continuation/v1`) |
| Thin client SDK (`sdk/typescript/`) | (none) | Verified (typecheck + crypto round-trip), repo-only |

## Next Session Should
No mandatory successor. Remaining mechanism-correction tail (all founder-elected, non-blocking): the deferred **api-docs `/api/guardrail` section** (Part-B follow-up); **SDK distribution** (npm scope/versioning/publish — currently `"private": true`); the **ADR-010 §4 root correction** (per-domain proximity + obligation-resolution; retires the justice bridge; its own Critical session); the **guardrail-into-perimeter election**; the deferred M5 doc surfaces (api-docs practice-cycle / `mcp-contracts.ts` / `skill-registry.ts`); parked CI-16. **The 0h launch call remains the gating item and the founder's.**

## Blocked On
**Files remaining uncommitted (founder commits + pushes, PR17):**
- `website/public/llms.txt`
- `website/public/.well-known/agent-card.json`
- `website/src/app/api-docs/page.tsx`
- `operations/decision-log.md`
- `operations/benchmarks/sage-practice-v1/public-contract-docs-staged.md` (APPLIED marker)
- `sdk/typescript/` (new — untracked)
- `CLAUDE.md` (production-state refresh, this close)
- `website/tsconfig.tsbuildinfo` (build artifact — founder's discretion to include)

**Production state at session close:** **Unchanged by this session.** No Vercel/Supabase/flag/schema/auth/perimeter touch. The doc changes are public content that goes live on the founder's push (PR17); the SDK is a repo client outside the build graph. Part A + Part B guardrail port + bridge remain Live as at their activation closes.

## Founder Verification
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npm run build                                              # exit 0; /api-docs registered; ✓ Compiled successfully
node -e "const c=require('./public/.well-known/agent-card.json'); console.log(c.capabilities.extensions.length)"   # 12
cd ../sdk/typescript && npm install && npm run typecheck    # exit 0

cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add website/public/llms.txt website/public/.well-known/agent-card.json website/src/app/api-docs/page.tsx \
        operations/decision-log.md operations/benchmarks/sage-practice-v1/public-contract-docs-staged.md \
        sdk/ CLAUDE.md operations/handoffs/founder/2026-06-19-mechanism-correction-PartC-docs-SDK-close.md
git commit -m "Part C: apply staged public-contract docs (§1–§7) + thin TS client SDK"
```
Then push via GitHub Desktop. Vercel will redeploy and serve the updated `llms.txt` / `api-docs` / `agent-card.json`; the SDK is not in the build graph (no deploy impact).

## Cross-references
- `operations/handoffs/founder/2026-06-19-mechanism-correction-PartC-docs-SDK-NEXT-SESSION-PROMPT.md` (this session's prompt)
- `operations/benchmarks/sage-practice-v1/public-contract-docs-staged.md` (the staged source of truth)
- decision-log: `D-MECHANISM-CORRECTION-PART-C-DOCS-APPLIED-SDK-BUILT-2026-06-19`
- `D-MECHANISM-CORRECTION-PART-A-CONTINUATION-PRODUCTION-ACTIVATION-2026-06-19` (made §7 publishable)

*End of session close. Public docs are now self-sufficient for the integrator round-trip; the SDK encodes the three footguns (byte-identical continuation input, the signature canonical form, the supplied-schema echo) once. Nothing deployed — the founder owns the push.*
