# Next-Session Prompt — Sage Calling Stage 2 LIVE Close-Out + Forward Track Election

**Stream:** founder.
**Tier:** opens **`governance`** (Standard) for the close-out + verification record + smoke-test cleanup; **re-tiers when the founder elects a forward track** at Step 4 (the elected track sets the session's working tier and template form).
**Governing frame:** `/adopted/standing-protocol-cache.md` (general session protocol) + `/adopted/build-sessions-protocol-cache.md` (build-arc context; "no current users").
**Predecessor session close:** `/operations/handoffs/founder/2026-05-21-sage-calling-stage2-endpoint-close.md`.
**Predecessor decision-log entry:** `D-SAGE-CALLING-STAGE2-ENDPOINT-WIRED-VERIFIED-2026-05-21`.
**Operative deliverables (read the relevant one only after a track is elected):** `/adopted/purpose-discovery-product-design.md` (Sage Calling design + PR7 open items); `/adopted/substrate-plugin-staging-plan.md` (K-category migration + staging context); `/operations/parallel-track-fpe-status.md` (lawyer-engagement / FPE track).

## Why this session matters

Sage Calling Stage 2 (the Critical public surface) is now **Live and Verified in production**. On 2026-05-21 the founder smoke-tested the entire path by hand against `https://www.sagereasoning.com` with `SAGE_CALLING_ENABLED='true'`:
- minted an **unscoped** `sr_atl_` test credential (agent `agent_smoketest_v1`);
- confirmed all three **auth failure modes → 401** (no token; garbage token; valid token + wrong agent_id) and the positive control → 200;
- walked **Q1 → Q5** on session `smoke-001` and reached **`awaiting_approval`**;
- confirmed in Supabase: `current_stage=Q5`, `gate_status=awaiting_approval`, `outcome=found`, **`jsonb_typeof(response_history)='array'`** and **`signals_detected='array'`** (KG7 clean);
- ran the **admin approve** call → **200**, `gate_status=approved`, `discovered_purpose` five-spec returned (proving the agent's `sr_atl_` token cannot release the handoff — only the admin token can).

That clears the Critical Change Protocol's named risks (auth-gate exposure; Hard Gate firing un-approved; KG7 double-serialisation) on the live deployment. The Sage Calling build arc is **complete**. This session records the transition formally, removes the test artefacts, captures the operational findings, and the founder picks what comes next.

## Pre-conditions (confirm at open)
1. `SAGE_CALLING_ENABLED='true'` in Vercel; the 12 Stage-2 files committed + pushed (per the predecessor close's "Blocked On"). If not yet pushed/flagged, do that first — this session assumes Live.
2. The smoke-test artefacts still exist: `discovery_sessions` rows with `session_id LIKE 'smoke-%'`, and the test `atl_write` credential for `agent_smoketest_v1`. (If the founder already cleaned them, skip Step 3.)
3. Production otherwise unchanged: substrate at A7 Verified; A10 Live + Verified; `SUBSTRATE_LAYER3_ENABLED` UNSET; `SUBSTRATE_R20A_GATE_ENABLED` UNSET; Option D Live; Layer 1 schema at v3 (accepts v1|v2|v3; producer still emits v1).

## Part A — Open under the protocol
Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — tier, model selection [N/A here], risk class, signals, status vocab).
2. `/adopted/build-sessions-protocol-cache.md` (~3 min — build-arc context; "no current users").
3. `/operations/handoffs/founder/2026-05-21-sage-calling-stage2-endpoint-close.md` (the predecessor close — what's Live + the founder-verification record).
4. `/operations/decision-log.md` — the last 2 entries (`D-SAGE-CALLING-STAGE2-ENDPOINT-WIRED-VERIFIED-2026-05-21` + the engine-store entry).

Confirm at open: tier (`governance` for the close-out); hold-point status (P0 0h active); status vocabulary; signals/risk class. PR4: N/A (no LLM in the close-out). PR15: N/A unless the elected track involves a bespoke build (then consult `.claude/skills/anthropic/` + the agentic-commerce findings tracker before electing bespoke).

## Part B — Procedure

### Step 1 — Record the Live/Verified transition (lean decision-log entry)
Append `D-SAGE-CALLING-STAGE2-LIVE-VERIFIED-YYYY-MM-DD` (lean form per the standing cache). Content: Stage 2 public surface moved **Wired → Verified / Live** on the founder's 2026-05-21 post-deploy smoke test (cite the evidence above). Status of the Sage Calling product line: **Live, gated by `SAGE_CALLING_ENABLED`**. Cross-reference the predecessor Critical entry. If `/website/public/component-registry.json` tracks Sage Calling components, update their status to `live`/`verified` (registry update = Standard; follow the registry skill).

### Step 2 — Capture the operational findings from the verification (Standard)
Two recurring operational findings surfaced during the founder's between-session verification; record them so future founder-verification blocks don't re-hit them:
- **Canonical host is `www.sagereasoning.com`.** The apex `sagereasoning.com` returns a Vercel **307** to the `www` host; `curl` does not follow by default, and `-L` **drops the `Authorization` header on the cross-host redirect** (→ spurious 401). **Action:** correct the curl examples in `/operations/handoffs/founder/2026-05-21-sage-calling-stage2-endpoint-close.md` (and any standing verification-template that carries example curls) to use `https://www.sagereasoning.com`. Add a one-line note to the verification-block convention.
- **Admin Supabase JWT expires (~1 hour).** Admin endpoints (`/api/admin/accreditation-credentials`, `/api/calling/approve`) need a fresh `ey…` token grabbed immediately before the call. **Action:** note this in the verification convention.
- Consider a `operations/knowledge-gaps.md` **candidate** entry: "founder-verification curl blocks — canonical host + admin-JWT freshness + `-L` auth-drop." Promote per PR5 if it recurs.

### Step 3 — Clean up the smoke-test artefacts (operational; uses existing paths)
- **Hard-delete the test sessions (R17h):** remove the `smoke-%` `discovery_sessions` rows via the store's R17h hard-delete path (`deleteSession` by `session_id`, or directly in Supabase SQL Editor: `DELETE FROM discovery_sessions WHERE session_id LIKE 'smoke-%';`). Pre-launch hygiene — test data should not linger in the audit trail.
- **Revoke the test credential:** `DELETE https://www.sagereasoning.com/api/admin/accreditation-credentials?id=<credential_id>` with a fresh admin token (the `credential_id` was returned at mint; or look it up). Reversible by re-minting.
- This step changes no code and no production behaviour; it removes test data only. Standard risk.

### Step 4 — Founder elects the forward track (AskUserQuestion)
The Sage Calling arc is closed. Surface these three candidate tracks with reasoning, tier, and pre-conditions; the founder elects order (one now, the rest later):

- **(a) K-category migration** — swap the remaining bundled-prose product consumers onto the translation-sandwich substrate (the build-arc's remaining product work; completes what M1-CP6 started for `/api/reason`). *Tier: `code-elevated`.* Pre-read: `/website/public/component-registry.json` (which consumers still use bundled prose), the users' guide + tech guide. PR1 applies (single-consumer proof first).
- **(b) Stage 1-close lawyer engagement** — draft the engagement brief: TOS + liability allocation (incl. the agentic-commerce F1 finding), the 90-day `discovery_sessions` retention value, and the broader privacy-policy-adjacent values. *Tier: `governance`.* Critical-path per ST2 Q4 (lawyer engagement brought forward to Stage 1 close). Pre-read: `/operations/parallel-track-fpe-status.md`, `/operations/agentic-commerce-findings-downstream-order.md` (F1).
- **(c) Sage Calling PR7 follow-ons** — small, optional refinements: (i) persist the Agent-Card verification verdict so the chosen-role hint carries into the five-spec assembly (currently logged but not stored → `role` defaults to `individual_nature`); (ii) per-developer delegated Hard-Gate approval (vs admin-only) — only meaningful once external users exist; (iii) the rules+LLM hybrid is **not** triggered (the R18d suite showed the rules held) — revisit only on a future missed-signal finding. *Tier: `code-elevated`/`code-standard` depending on sub-item.*

### Step 5 — Proceed with the elected track
Re-tier to the elected track's working tier; switch to the matching template form (Lean for Standard/Elevated; Full + Critical Change Protocol if the track turns out to touch auth/encryption/deletion-functionality/deployment-config). Confirm pre-conditions for that track, then begin.

### Step 6 — Close (lean form unless the elected track re-tiers to Critical)
Per `/adopted/standing-protocol-cache.md` §"Lean session close".

## Part C — Anticipated session shape
| Phase | Estimate |
|---|---|
| Part A — caches + predecessor close + decision log | 15–20 min |
| Step 1 — Live/Verified decision-log entry (+ registry) | 15–20 min |
| Step 2 — operational findings + doc fixes | 15–20 min |
| Step 3 — smoke-test cleanup (delete rows + revoke credential) | 10–15 min |
| Step 4 — track election (AskUserQuestion) | 5–10 min |
| Step 5 — the elected track | varies (see the track's own pre-read) |
| **Close-out subtotal (Steps 1–4)** | **~1 hr** |

## Rollback path
The close-out (Steps 1–3) is governance/operational: decision-log + doc edits are reversible via git; the cleanup deletes **test data only** (R17h is the intended deletion path) and revokes a **test credential** (reversible by re-minting). No production runtime change in the close-out. Whatever track is elected at Step 4 carries its own rollback, declared at that point.

## Forecast
After the close-out, Sage Calling is fully closed as a build arc — Live, Verified, recorded, and the test artefacts removed — and the founder is into the next chosen track (K-category migration, the lawyer engagement, or the PR7 follow-ons). The `SAGE_CALLING_ENABLED` flag remains the master switch; turning it off returns the endpoint to 503 with no code change.

---
*End of prompt. Paste into a fresh session; it begins under Part A as a `governance` close-out, then re-tiers when the founder elects the forward track at Step 4.*
