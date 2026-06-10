# R18 Public-Materials Pass — Diffs for Founder Approval (S8b, 2026-06-10)

**Scope:** `llms.txt`, `.well-known/agent-card.json`, `/api-docs`, marketplace/badge copy (+ one MCP-surface string found in the sweep). Every capability claim checked against `/operations/capability-inventory-2026-06-10.md` + code reads this session. Honest-certification per R18a/R18b; nothing overclaimed (R19). **Nothing applied until approval.**

---

## Findings summary

| # | Surface | Finding | Class |
|---|---|---|---|
| F1 | llms.txt | `/api/reason` documented as returning "the full V3 schema" — since the CP6 cutover (2026-05-08) it returns `translation-sandwich-v1` (`{version, extraction, assessment, prose}`) | **Inaccurate claim** |
| F2 | llms.txt + agent-card | A10 per-install auth (`sr_inst_`, Live since S5) entirely undocumented — agents can't discover the production-verified flow | Completeness (R18) |
| F3 | llms.txt + agent-card | R20a safety behaviour (developer-form redirect payload) undisclosed — an integrating developer can't know distress inputs return `status:"redirected"` | Completeness (R18/R20) |
| F4 | llms.txt | Dead link: `/agent-assessment/agent-assessment-v1.json` — file lives at repo root, never deployed under `website/public/` → 404 | **Dead claim (R19)** |
| F5 | api-docs | Tier table: sage-reason "100/month" vs the locked 30 loops/month; latency "~2–4s" vs observed 13.1s (agent) / ~36s (human standard) at S8a | **Overclaim (R19)** |
| F6 | marketplace | Free-tier grid (500/100/50/25 calls/month) runs the pre-billing-model copy; no reconciliation with the per-loop model | **Overclaim risk (R19)** |
| F7 | mcp-contracts.ts | "Get a free key (100 calls/month)" + `free_tier: '100 calls/month'` — same legacy copy on the MCP discovery surface | **Overclaim (R19)** |
| F8 | badge SVG + scope language | "Stoic Evaluation" left-label is scope-honest; no certification language found anywhere; the R19e no-practice disclaimer present on api-docs + agent-card + llms.txt | **Reviewed — no change** |

The structural root of F5–F7: three surfaces still carry the per-skill call-tier model from April; llms.txt + agent-card carry the locked per-loop model (D-BILLING-MODEL-LOCKED-2026-05-17). The diffs below make the minimal honest corrections; the full pricing-surface restructure belongs to the Stripe/P1 pricing session.

---

## D1 — llms.txt

**D1a (F1):** In §"Run Full Stoic Reasoning (V3 — most powerful endpoint)", replace:
> "Returns the full V3 schema (see /api/score above for structure). `deep` additionally includes `iterative_refinement`…"

with:
> "Returns the `translation-sandwich-v1` shape: `{ version, extraction, assessment, prose }` — `extraction` is the Layer-1 feature schema, `assessment` is the deterministic Layer-2 verdict (Ed25519-signed; identical inputs produce identical assessments — verify against GET /api/public-key), `prose` is the Layer-3 philosophical rendering carrying the V3 vocabulary (katorthoma_proximity, passion_diagnosis, control_filter, oikeiosis). `deep` additionally includes iterative-refinement signals."

**D1b (F2):** After the depth paragraph, add:
> "**Agent integrations (per-install tokens):** production agent integrations authenticate with per-install tokens (`sr_inst_<32 hex>`). Mint: session-authenticated `POST /api/keys` (token shown once). Use: `Authorization: Bearer sr_inst_<token>`; plugin-authenticated calls submit a pre-computed `layer1_schema` (run Layer 1 locally) instead of raw input. Revoke: `DELETE /api/keys` — revoked tokens return 401 immediately. `sr_live_` keys remain valid for raw-input calls."

**D1c (F3):** New short section before "## Intended Users":
> "## Safety Behaviour (Distress Inputs)
> SageReasoning detects acute distress in inputs. On agent-authenticated calls this returns HTTP 200 with a developer-form payload — `{ "status": "redirected", "severity": "...", "developer_note": "...", "suggested_user_message": "...", "flow_terminated": true }` — instead of an assessment. Integrators MUST surface `suggested_user_message` (crisis resources) to the end user verbatim and stop the flow. Human-session surfaces render a crisis message directly. This behaviour is part of the contract, not an error."

**D1d (F4):** Remove the line "Assessment framework file: https://www.sagereasoning.com/agent-assessment/agent-assessment-v1.json" (the GET/POST assessment endpoints above it carry the content). *Alternative if preferred: copy `agent-assessment-framework-v3.json` into `website/public/agent-assessment/` and point the link there.*

**D1e:** Header line → `# llms.txt v3.1 — June 2026`.

## D2 — .well-known/agent-card.json

**D2a (F2):** `authentication.credentials` — append: "Production agent integrations use per-install tokens (sr_inst_…): mint via session-authenticated POST /api/keys, present as Authorization: Bearer sr_inst_<token>, submit a pre-computed layer1_schema; revoke via DELETE /api/keys (immediate 401)."

**D2b (F3):** Add extension (required: false):
```json
{
  "uri": "https://sagereasoning.com/extensions/safety-redirect/v1",
  "description": "R20a distress-input behaviour. Agent-authenticated calls that contain acute-distress content return HTTP 200 with {status:'redirected', severity, developer_note, suggested_user_message, flow_terminated:true} instead of an assessment. Integrators MUST surface suggested_user_message to the end user verbatim and terminate the flow. Human-session surfaces render a crisis message directly. Contract behaviour, not an error.",
  "required": false,
  "params": { "responseShape": { "status": "redirected", "flow_terminated": true } }
}
```

**D2c (F1):** `skills[universal-reasoning].description` — append: " Response shape: translation-sandwich-v1 (deterministic signed assessment + prose render; see /api/public-key for signature verification)."

## D3 — api-docs page (`website/src/app/api-docs/page.tsx`)

**D3a (F5):** sage-reason row: `100/month` → `30 loops/month`; latency `~2–4s` → `observed ~13s (agent, pre-computed schema) / ~36s (human, standard)`.

**D3b (F5):** Footnote under the tier table:
> "Latency figures are April 2026 estimates except where marked observed (production, 2026-06-10). Figures will be recalibrated as SLO data accumulates. Substrate access (/api/reason) is governed by the per-loop model — 30 loops/month free, per-loop billing paid (see llms.txt + agent-card); per-skill allowances shown apply to the legacy skill routes."

## D4 — marketplace page (`website/src/app/marketplace/page.tsx`)

**D4 (F6):** Footnote under the Free Tier Allowances grid (same reconciliation sentence as D3b, shortened):
> "Allowances shown are per-skill evaluation tiers. Substrate access (/api/reason) is governed by the per-loop model — 30 loops/month free (see /api-docs)."
*Full pricing-surface restructure deferred to the Stripe/P1 pricing session (on the record per rec 3.3).*

## D5 — mcp-contracts.ts

**D5 (F7):** `'Include "Authorization: Bearer sr_live_<key>" header. Get a free key (100 calls/month) at sagereasoning.com.'` → `'…Get a free key (free tier: 30 loops/month) at sagereasoning.com.'`; `free_tier: '100 calls/month, rate-limited'` → `'30 loops/month (≈1/day), rate-limited'`; `paid_tier: 'Volume-based pricing, no rate limit'` → `'Per-loop billing: $0.02 base + token-cost overage (see llms.txt)'`.

## D6 — Badge / certification scope (F8)

Reviewed, no change: badge label "Stoic Evaluation" is scope-honest; R19e no-practice disclaimer present on all three discovery surfaces; no "certified/certification" overclaim found on any public surface. The full R18a/R18b badge-component scope-language work remains P3 item 3a (Scoped — correctly not claimed anywhere).

---

**Risk:** Standard (docs + string constants; D3/D4/D5 are .ts/.tsx copy edits — `npx tsc --noEmit` after). **Rollback:** `git revert`. **Verification:** founder reads this file + spot-checks the deployed surfaces post-push (llms.txt + agent-card render directly; api-docs + marketplace visual check).
