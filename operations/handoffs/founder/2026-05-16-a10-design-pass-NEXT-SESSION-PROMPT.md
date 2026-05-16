# Next-Session Prompt — A10 Design Pass: Per-Agent Credentials (step 8 of 8 of post-6b arc — design half)

**Stream:** founder.
**Tier:** `governance` — **Standard** risk under 0d-ii. **Lean** template. Critical Change Protocol NOT engaged this session (engages at the A10 build session).
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol — `governance` row → Lean template) + `/adopted/build-sessions-protocol-cache.md` (build-arc context — "no current users" governing note applies; CCP step 3 will be moot through the A10 build).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-16-write-path-build-close.md` (the write-path build that closed step 7).
**Predecessor decision-log entry (the immediate upstream):** `D-ATL-WRITE-PATH-BUILD-WIRED-VERIFIED-2026-05-16`.
**Sequencing source:** `/operations/handoffs/founder/2026-05-15-post-build-brainstorm-close.md` — step 8 of 8 in the post-6b arc.

---

## Why this session matters

The write-path build (step 7) left an A10-shaped auth seam: the `verifyAgentIdOwnership(request, agent_id)` function in `/website/src/app/api/accreditation/[agent_id]/route.ts` whose body, pre-A10, is just an env-flag check (`SUBSTRATE_WRITE_PATH_ENABLED === 'true'`). Per Decision C of the write-path design (`D-ATL-WRITE-PATH-DESIGN-LOCKED-2026-05-16`), A10 replaces that body with **per-agent token verification** — the function signature stays the same, the internals change. After A10 lands, an external caller hitting `POST /api/accreditation/[agent_id]` must present a token that proves they control `agent_id`; the route accepts the write only when verification succeeds.

A10 is the **last step of the post-6b arc.** After it lands, the substrate has read AND write public surfaces, both authenticated, both auditable. The arc closes.

This session is the **design half** — a governance pass that produces an `/adopted/atl-a10-design.md` document and a `D-ATL-A10-DESIGN-LOCKED-YYYY-MM-DD` decision-log entry. No code lands this session; the A10 build session (Critical risk; full Critical Change Protocol) follows.

Plan **~1.5–2.5 hr.** Founder mid-session input is concentrated at Steps 1–3 (surfacing design questions + electing positions); the AI drafts the design document in Step 4, founder verifies at Step 5.

---

## Pre-conditions

1. **Write-path build session pushed; Vercel green.** Founder verified post-deploy at 2026-05-16: POST returns 503 inert; GET returns 404 not_found. Both byte-perfect against expected.
2. **Doc-cleanup commit pushed.** The follow-on commit that corrected the curl URLs to `www.sagereasoning.com` and fixed the route test command's `--env-file` requirement in the session close + decision-log entry.
3. **Founder has reviewed** `/operations/decision-log.md` entry `D-ATL-WRITE-PATH-BUILD-WIRED-VERIFIED-2026-05-16` and the seven CCP responses recorded there.
4. **Production state unchanged from the write-path build close:** substrate at A7 Verified; `SUBSTRATE_LAYER3_ENABLED` UNSET; `SUBSTRATE_R20A_GATE_ENABLED` UNSET; `SUBSTRATE_WRITE_PATH_ENABLED` UNSET (write surface inert); `/api/reason` byte-identical; `/api/substrate/layer3` returns 503; `/api/accreditation/[agent_id]` Live for GET + POST (POST inert); both `agent_accreditation` + `grade_history` tables empty.
5. **Founder commits to a ~1.5–2.5 hr bounded session.** Standard governance pace.

---

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min) — confirm tier (`governance`), risk class (Standard), Lean template, signals, status vocabulary, AC1 model-selection table (N/A this session — no LLM calls).
2. `/adopted/build-sessions-protocol-cache.md` (~3 min) — confirm "no current users" simplification still applies; open-question parking-lot Q4 (token format) is the canonical reference for the deferred ADR.
3. `/operations/handoffs/founder/2026-05-16-write-path-build-close.md` (~5 min) — the immediate predecessor; particularly the Open Questions block which names `SUBSTRATE_WRITE_PATH_ENABLED` retirement-vs-kill-switch as an A10-close decision.
4. **`/adopted/atl-write-path-design.md` — Decision C in full** (~5 min). The auth seam this session fills. The structural constraint paragraph names the discriminated `{ ok: true, claims } | { ok: false, reason }` result shape; A10's verification function must conform.
5. **`/adopted/atl-kathekon-aligned-alternative-design.md`** (~10 min) — the structural template for a seven-decision design pass. The A10 design will mirror this shape (one decision per question; Why / Elected / Why-not-alternatives / Structural-constraint / R-rule-engagement / Layer-1-implication sections per decision).
6. **Targeted code files** (~10 min):
   - `/website/src/app/api/accreditation/[agent_id]/route.ts` — the `verifyAgentIdOwnership` function + the `AuthGateResult` type at the top of the POST section. This is the swap target.
   - `/website/src/lib/security.ts` (skim) — `getAuthenticatedUser` + `requireAuth` precedents (Supabase JWT-based; for user auth, not agent auth — but the structural pattern is relevant).
   - `/website/src/lib/supabase-server.ts` (skim) — `supabaseAdmin` client (the persistence seam A10 will likely use for any credential lookup).
7. **`/operations/decision-log.md`** — last 3 entries: `D-ATL-WRITE-PATH-BUILD-WIRED-VERIFIED-2026-05-16` (predecessor build), `D-ATL-WRITE-PATH-DESIGN-LOCKED-2026-05-16` (predecessor design — Decision C is the seam), the doc-cleanup follow-on entry if one was appended.
8. **PR11 inbox scan** — list `/inbox/` files dated since 2026-05-16; review for A10-relevant material. Confirm F1–F4 in `/operations/agentic-commerce-findings-downstream-order.md` for A10 relevance.
9. **PR15 consult** — `.claude/skills/anthropic/` review. Candidate primitives for an auth/credential-issuance design: `claude-api` (informational); `mcp-builder` (forward pointer if A10 tokens become MCP-server credentials post-launch); `skill-creator` (governance-document drafting — informational). Bespoke election expected to be justified: A10 is a substrate-internal auth surface; no Anthropic primitive substitutes.

**Confirm at open:** tier (`governance`); hold-point status (P0 0h active); model selection N/A (no LLM calls); status vocabulary; signals + risk classification; Critical Change Protocol NOT engaged this session (engages at A10 build).

---

## Part B — Procedure

### Step 0 — Scope confirm (~5 min)

State scope via AskUserQuestion: produce `/adopted/atl-a10-design.md` modelled on `/adopted/atl-kathekon-aligned-alternative-design.md` (seven-decision design-pass shape) and append `D-ATL-A10-DESIGN-LOCKED-YYYY-MM-DD` to the decision log. **In scope:** the design decisions defining A10 — token format, credential storage, issuance flow, verification placement, revocation, rotation/expiry, audit trail, pre-A10 stopgap retirement. **NOT in scope this session:** code; schema migrations; the A10 build (which is a separate Critical-risk session).

### Step 1 — Surface the design questions (~15–20 min)

The AI surfaces the candidate design questions A10 must resolve. Expected question set (subject to founder refinement at this step):

- **Q1 (token format)** — JWT / W3C Verifiable Credential / hybrid / something simpler (e.g., opaque random tokens with server-side lookup). The build-arc cache Q4 names this as a deferred ADR; this session may either fold the ADR into Decision A OR keep it as a separate `/adopted/adr/YYYY-MM-DD-a10-token-format.md` decided alongside the design.
- **Q2 (credential storage)** — new `agent_credentials` table? Columns? Or extend an existing table?
- **Q3 (issuance flow)** — who calls what to mint a token? Founder-only admin endpoint? Self-service later? On-chain registration?
- **Q4 (verification placement)** — where does the token verification function live? Inside `route.ts` (matches the write-path's pre-A10 stopgap)? In `security.ts`? In a new `atl-credentials.ts` library?
- **Q5 (revocation)** — table column + check (revocation list)? Separate `revoked_tokens` table? Issue-time-bounded tokens that expire instead of being revoked?
- **Q6 (rotation / expiry)** — do tokens expire? If so, when? Refresh-token pattern? Manual re-issuance?
- **Q7 (audit trail / observability)** — log credential issuance / verification successes / verification failures? To Vercel logs (like the write-path's `atl_write` events) or to a Supabase table?
- **Q8 (pre-A10 stopgap retirement)** — once A10 lands, what happens to `SUBSTRATE_WRITE_PATH_ENABLED`? Remove the env-flag check entirely? Keep as a kill-switch (set to anything other than "true" disables writes globally even if A10 tokens are valid)?

The AI notes any cascading dependencies (Q1's election narrows Q2's option space; Q4's election affects the A10 build's risk-classification scope). Founder may add / remove questions before Step 2.

### Step 2 — Design-decision gate (~30–45 min)

AskUserQuestion in 2–3 rounds (each round bundles 2–4 related decisions to keep founder input bounded). For each decision the AI presents the candidate answers + a recommended option + the rejected alternatives' reasoning. Founder elects.

### Step 3 — Draft `/adopted/atl-a10-design.md` (~30–40 min)

Single Write call modelled on the kathekon design document's structure. Per-decision sections with Why / Elected position / Why this and not the alternatives / Structural constraint / R-rule engagement / Layer-1 implication. A build-session implementation summary table at the bottom names the expected file changes for the A10 build session.

Cross-references: the predecessor write-path design's Decision C (the seam); the predecessor write-path build (the call site); any token-format ADR if elected as a separate artefact.

### Step 4 — Founder verification (~5 min)

AskUserQuestion: "The N decisions in the design document match the Step 2 elections?" Founder confirms or names corrections. Corrections are made in this same step; the document is not finalised until founder confirms.

### Step 5 — Append decision-log entry (lean form) (~10 min)

`D-ATL-A10-DESIGN-LOCKED-YYYY-MM-DD`. Lean form per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". Rules served expected: 0a, 0c, 0d-ii, 0f, R0, R3, R4, R17 (primary engagement — the auth gate's body fills with A10), R18a, R18c, R18e (NOT engaged at the credential layer), R20 (NOT engaged), AC5 (NOT), AC7 (engages at the A10 build — NOT this session), AC8, AC10 (audit trail per Decision G), KG1 (engages at the build), PR1 (build-session proof — A10 build lands the swap + tests in one session), PR4 (N/A), PR6 (NOT engaged), PR7 (deferred items named), PR10 (Plan — this session is the Plan step for A10 build), PR11 (inbox scan recorded), PR15 (bespoke election justified).

### Step 6 — Session close (lean form) (~15 min)

Per `/adopted/standing-protocol-cache.md` §"Lean session close". "Next Session Should" names the A10 build — Critical risk; full Critical Change Protocol; the AC7 surface that engages is the auth-gate swap; the build session opens against this design + `D-ATL-A10-DESIGN-LOCKED-YYYY-MM-DD` as the spec.

---

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Part A — caches + predecessor close + Decision C reread + structural template + targeted code + decision-log + PR11 + PR15 | 30–40 min |
| Step 0 — scope confirm | 5 min |
| Step 1 — surface design questions | 15–20 min |
| Step 2 — design-decision gate (2–3 AskUserQuestion rounds) | 30–45 min |
| Step 3 — draft design document | 30–40 min |
| Step 4 — founder verification | 5 min |
| Step 5 — decision-log entry (lean form) | 10 min |
| Step 6 — session close (lean form) | 15 min |
| **Total** | **~2.5–3 hr** |

The natural pause point if the session runs long is **after Step 2** (design decisions elected; document drafting can be a fresh follow-on session — the elections are preserved in the AskUserQuestion answers + the conversation transcript). Founder elects whether to take the pause.

---

## Rollback path

Governance-only. If any decision is reconsidered after this session lands but before the A10 build session starts: append a superseding decision-log entry (`D-ATL-A10-DESIGN-REVISED-YYYY-MM-DD`) marking `D-ATL-A10-DESIGN-LOCKED-YYYY-MM-DD` as `Superseded by D-…`. Edit `/adopted/atl-a10-design.md` in a follow-on Elevated session (edits to an adopted governance document are Elevated under 0d-ii). No production-state recovery required — nothing was built this session.

---

## Forecast

A successful design pass produces `/adopted/atl-a10-design.md` (~6–9 locked design decisions defining A10's surface) + `D-ATL-A10-DESIGN-LOCKED-YYYY-MM-DD` decision-log entry (lean form) + session close (lean form). The natural next session is the **A10 build** — Critical risk; full Critical Change Protocol; expected scope: swap `verifyAgentIdOwnership`'s body to per-agent token verification; add credential storage (new table if Decision B elects it); add issuance + revocation surfaces if Decisions C + E elect them; tests for all of the above; the pre-A10 stopgap (`SUBSTRATE_WRITE_PATH_ENABLED`) is retired or repurposed per Decision H.

After the A10 build session lands, **the post-6b arc closes.** The substrate carries authenticated read + write public surfaces; every credential write traces to a specific agent_id whose identity has been verified at the route boundary. The next arc — likely the wrapper-iteration patterns (kathekon design Q9, deferred) or the K-category migration (the build-arc cache's K-category) — opens against a substrate that is itself complete enough to support consumer work.

*End of prompt.*
