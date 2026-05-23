# Next-Session Prompt — Parked-1: Classify the `mode:'atl_wrapper'` discriminant (internal-dispatch vs wire-contract)

**Stream:** founder.
**Tier:** opens at **`governance`** (a classification / investigation that ends in a recorded decision — no code change). Re-declare if the founder elects a different bite (the `trust-layer/` rename is `code-elevated`).
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-23-E1-agent-card-verdict-close.md` (E#1 — Verified/CLOSED; the verified Agent-Card chosen-role hint now persists into the five-spec assembly).
**Predecessor decision-log entry:** `D-SAGE-CALLING-E1-AGENT-CARD-VERDICT-PERSIST-2026-05-23` (Verified-production confirmation appended).
**Deliverable-of-the-day (read in full):** `/drafts/2026-05-23-track-followons-design-pack.md` §C (the rename impact-map; this is open-question (2) in the Phase-3 close + design-pack §C deferrals) + the substrate files named in Part A.
**Risk classification:** **Standard** under 0d-ii — a documentation/governance classification; no code, no schema, no deploy. AC7 NOT engaged. PR6 NOT engaged. **Note:** the classification's *output* sets the risk of any *future* rename of the discriminant (it does NOT perform that rename — see the locked context).

## Why this session matters
"ATL" / "Agent Trust Layer" has been retired everywhere except a small set of deliberately-parked internals. One of those is the Layer 3 render-mode discriminant `mode:'atl_wrapper'`. It was parked across Track C Phases 1–3 with a standing instruction: **classify whether it is internal-dispatch or a wire-contract value before anyone attempts to rename it.** This session does exactly that classification and records it — so a future rename (if elected) opens at the correct risk tier instead of guessing. The crux, already spotted at the E#1 close: `atl_wrapper` is not only a `switch` discriminant — it is written into a **versioned JSON payload** (`version: 'agent-mode-response-v1', mode: 'atl_wrapper'`), so whether that payload crosses a wire boundary to an external agent is the whole question.

## Locked context (do NOT re-litigate)
- Track C is **done** (Phases 1+2+3 Verified; "ATL"/"Agent Trust Layer" retired from internal, governance, and external/wire/public surfaces). Credential prefix `sr_assent_`; DB scope `sage_assent_write`; agent-card extension `sage-assent-write-auth/v1`.
- The `mode:'atl_wrapper'` discriminant and the `trust-layer/` directory rename were **deliberately deferred** (Phase-3 close Open Questions; design-pack §C deferrals 2–3). This session is the classification, **not** the rename.
- **This session does NOT rename anything.** It produces a recorded classification (and, if warranted, an ADR). Any rename is a separate future session whose risk tier this classification sets. Renaming a value that turns out to be wire-format would be Critical (the Phase-3 precedent) — which is exactly why the classification comes first.
- Every `D-ATL-*` decision ID is immutable (historical anchors). The provenance ID for the discriminant is `D-ATL-AGENT-MODE-RENDERING-WIRED-VERIFIED-2026-05-15`.
- "No current users" holds.

## Pre-conditions (confirm at open)
1. Working tree clean; E#1 committed + pushed; Vercel green; no `.git/index.lock` (close/reopen GitHub Desktop if it complains). `.fuse_hidden*` is gitignored.
2. Production on the post-E1 baseline: `discovery_sessions` at 12 columns; `SAGE_REFLECT_ENABLED=true`; `MENTOR_ENCRYPTION_KEY` set; substrate A7 Verified; A10 Live+Verified; Sage Calling Live (gated); `SUBSTRATE_WRITE_PATH_ENABLED='true'`; Layer-3 + R20a substrate gates UNSET.
3. `cd website && npm install` if a clean checkout (tsx is a devDependency) — only needed if you want to re-run any suite.

## Part A — Open under the protocol
Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — tier, model selection N/A, risk class, signals, status vocab).
2. `/adopted/build-sessions-protocol-cache.md` (~3 min — build-arc context; "no current users").
3. `/operations/handoffs/founder/2026-05-23-E1-agent-card-verdict-close.md` (predecessor — what landed).
4. `/operations/decision-log.md` last 1–2 entries (`D-SAGE-CALLING-E1-…`; `D-TRACK-FOLLOWONS-C-PHASE3-EXTERNAL-WIRE-2026-05-23`).
5. `/drafts/2026-05-23-track-followons-design-pack.md` §C (the rename impact-map; the (A)/(B)/(C)/(D) categories).
6. The live code (read targeted, not in full):
   - `website/src/lib/substrate/philosophical-mode-service.ts` — the `Layer3RenderMode` union (~`:204–211`) and the `renderLayer3Mode` dispatch `switch` (~`:1512–1537`).
   - `website/src/lib/substrate/agent-mode-service.ts` — the `mode:'atl_wrapper'` const on the result type (~`:315`, `:353`); **the JSON payload `version:'agent-mode-response-v1', mode:'atl_wrapper'` (~`:565–567`)**; `renderAgentMode` return `{ mode:'atl_wrapper', json, markdown }` (~`:913`).
   - `website/src/lib/substrate/sage-assent-iteration-patterns.ts` — the parallel-evaluation candidate input typed `& { mode:'atl_wrapper' }` (~`:348`, `:362`, `:364`).

Confirm at open: tier (`governance`); hold-point (P0 0h active); model selection (**N/A** — no LLM); status vocabulary; signals/risk class. **PR15 consult** (`.claude/skills/anthropic/` + `/operations/agentic-commerce-findings-downstream-order.md` — F1–F4 do not target the substrate discriminant). **PR16 lens** (the discriminant is internal naming under the "Character Kernel"/"Sage Assent" umbrella; the classification itself is positioning-neutral but determines whether a future rename can complete the C-arc cleanup).

## Part B — The work (only if the classification is elected)
**Surface the bite at open and let the founder elect.** Recommended = **the `mode:'atl_wrapper'` classification** (the sensible quick win; it gates the rename's risk). Alternative the founder may elect instead: the parked **`trust-layer/` directory rename** (`code-elevated`; grep for the `trust-layer/` directories at open since the path wasn't confirmed in advance; needs grep-compensated verification because the cross-boundary import is invisible to `tsc`). The condition-gated Track E items (E#2/#4/#5/#3) are NOT actionable pre-launch. State the election at open.

### If the classification is elected — suggested procedure
1. **Inventory** every occurrence of `atl_wrapper` — across `website/src` **and** `website/public/` (agent-card.json, llms.txt, any api-docs) **and** any persisted DB value / migration. (The Phase-3 prefix lesson: a value can live in code, in a published contract, and in the DB independently — check all three.)
2. **Trace the boundary.** The decisive question: does the `agent-mode-response-v1` JSON payload (which carries `mode:'atl_wrapper'`) get **serialized out to an external agent** through any `/api/*` route — or is it consumed only in-loop / never returned across the wire? Follow `renderAgentMode` / `renderLayer3Mode` callers up to the route layer.
3. **Classify**, with evidence:
   - **Internal-dispatch** (the value never crosses a wire boundary and is not persisted) → a future rename is **Standard/Elevated** (a mechanical internal rename, like Track C Phase 1).
   - **Wire-contract** (the value is returned to external agents in the response JSON, and/or is a versioned external identifier, and/or is persisted) → a future rename is **Critical** (the Track C Phase 3 precedent: coordinated change + version handling).
4. **Record** the classification in the decision log (lean form). If the finding is load-bearing for future work, write a short ADR under `/adopted/adr/`. **Do not rename anything.**
5. Apply the **PR10 diagnostic-certainty** signal to the finding: `Diagnostic-certain` only if the boundary trace is conclusive; otherwise `Diagnostic-uncertain — symptom level` and flag for founder acknowledgement.

### Verify
Governance/investigation — verification is the evidence trail itself (the file:line citations for the boundary trace) plus, if any comment/doc text changed, `npx tsc --noEmit` → 0. No suites expected to change (no code behaviour touched).

### Decision-log + close (lean form)
Append a lean `D-…-ATL-WRAPPER-CLASSIFICATION-…` entry (per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry") recording the classification + the evidence + the risk tier it sets for a future rename. Write the lean session close (§"Lean session close"). No cache drift expected (no governed surface changes unless an ADR is added — if so, update cross-references).

## Part C — Anticipated session shape
| Phase | Estimate |
|---|---|
| Caches + predecessor close + design-pack §C + the 3 substrate files | 20–30 min |
| Inventory (`atl_wrapper` across src + public + DB) | 15–20 min |
| Boundary trace (does the JSON reach an external agent?) | 30–45 min |
| Classify + record (decision-log entry; ADR if warranted) | 20–30 min |
| Lean close | 15–20 min |
| **Total** | **~1.5–2 hours** |

## Rollback path
Governance only — nothing to roll back (no code, no schema, no deploy). If an ADR or doc edit is made, `git revert` the commit reverses it.

## Forecast
Success = a recorded, evidence-backed classification of `mode:'atl_wrapper'` as either internal-dispatch (future rename = Standard/Elevated) or wire-contract (future rename = Critical), so the parked discriminant rename — and, after it, the `trust-layer/` directory rename — can be scoped at the right risk tier without re-investigation. After this, the remaining parked item is the `trust-layer/` directory rename; the Track E items stay condition-gated. The founder elects the next bite at open.

End of prompt. Opens as a `governance` classification on a stable known-good baseline (E#1 Verified/CLOSED; Track C complete; Vercel green).
