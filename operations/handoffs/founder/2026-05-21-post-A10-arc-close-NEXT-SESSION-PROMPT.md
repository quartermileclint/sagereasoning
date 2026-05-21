# Next-Session Prompt — Post-6B Arc CLOSED: Track Selection + Open

**Context:** A10 (per-agent credentials) is **built + verified in production** as of 2026-05-21. The post-6b arc is **closed** — the substrate now carries authenticated read AND write public surfaces, both auditable. This prompt opens the next session and selects the next track.

**Stream:** founder.
**Tier:** declared at open, based on the track elected (governance / code-* / external).
**Governing frame:** `/adopted/standing-protocol-cache.md` (general session protocol) + `/adopted/build-sessions-protocol-cache.md` (build-arc context, if a build track is elected).
**Predecessor close:** `/operations/handoffs/founder/2026-05-21-A10-build-close.md`.
**Predecessor decision-log entry:** `D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21`.

---

## Production state as of 2026-05-21 (A10 Verified; arc closed)

- **A10 Live + Verified end-to-end.** Founder post-deploy smoke tests all passed: admin mint → `201`; write-path POST → `200`; failure modes (no token / made-up token / wrong-agent URL) → `401`; revoke → `200`; revoked-token write → `401`.
- **`SUBSTRATE_WRITE_PATH_ENABLED` = `true`** in Vercel — the **write surface is LIVE** (founder elected to leave it on). It is safely gated by per-agent `sr_atl_` tokens; there are currently **zero live credentials** (the single test credential, bound to `agent_test_v1`, was revoked during verification).
- **`ADMIN_USER_ID`** set to the founder's Supabase user id in Vercel — grants admin access to `/api/admin/accreditation-credentials` (mint/revoke) and the existing `/api/admin/api-keys`.
- **New A10 schema live in Supabase:** `api_keys` (+ `purpose`, `revoked_at`, `scope_downstream_identity_model`, `scope_path_posture`, refined CHECK, orphan-revocation trigger on `profiles`); new `credential_audit` table; `agent_accreditation` (+ 4 `typical_*` columns, `loop_id`).
- **`agent-card.json`** publicly advertises the write-surface auth (`atl-write-auth/v1` extension) at `https://www.sagereasoning.com/.well-known/agent-card.json`.
- **Unchanged:** `SUBSTRATE_LAYER3_ENABLED` UNSET; `SUBSTRATE_R20A_GATE_ENABLED` UNSET; substrate at A7 Verified; Option D Live.
- **Possible leftover test data:** an `agent_test_v1` row in `agent_accreditation` + the revoked test credential + its `credential_audit` rows. Harmless; delete if you want tidiness (`DELETE FROM public.agent_accreditation WHERE agent_id = 'agent_test_v1';`).

---

## Step 0 — Trivial housekeeping at open (Standard-risk; do first)

The decision-log entry `D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21` and the A10 close both record the implementation status as "**Wired** → **Verified** (production) upon the founder's post-deploy smoke tests." Those smoke tests have now **passed**. Append a one-line confirmation flipping the recorded implementation status to **Verified (production), 2026-05-21**, and note the production state above (write surface Live; `ADMIN_USER_ID` + `SUBSTRATE_WRITE_PATH_ENABLED='true'` set). This keeps the audit trail (R0) accurate. Standard-risk governance edit; commit with the session's other changes.

---

## Part A — Open under the protocol (regardless of track)

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — tier, model selection, risk class, signals, status vocabulary)
2. `/adopted/build-sessions-protocol-cache.md` (only if a build track is elected)
3. `/operations/handoffs/founder/2026-05-21-A10-build-close.md` (the A10 close)
4. `/operations/decision-log.md` last 2–3 entries (incl. `D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21`)
5. The deliverable for whichever track is elected (below)

Confirm at open: tier; hold-point status (P0 0h active); model selection per the cache; status vocabulary; signals + risk classification.

---

## Track selection (elect one at session open via AskUserQuestion)

The post-6b arc is closed; the following are the independent post-arc tracks. Pick one:

**A. Purpose-discovery product design pass** *(design; Standard)* — a pre-written prompt already exists at `/operations/handoffs/founder/2026-05-20-purpose-discovery-design-pass-NEXT-SESSION-PROMPT.md`, pre-conditioned on A10 Verified (now satisfied). *Recommended if you want to keep product momentum.*

**B. K-category migration** *(build arc; Elevated→Critical)* — migrate the remaining bundled-prose consumers onto the translation-sandwich substrate. The largest remaining build-arc work. Living-state source of truth: `/website/public/component-registry.json` + the user/tech manuals.

**C. Stage 1 lawyer engagement** *(governance/external; MVP critical path)* — FPE-5 TOS + liability + brand/trademark posture per ST2 Q4. On the critical path to MVP launch. Mostly founder-external (engaging a lawyer); the session prepares the brief.

**D. Source-of-truth `evaluation.ts` re-port** *(governance; Standard)* — finish the `/trust-layer/` reconciliation beyond the bounded accreditation-type sync done in the A10 build (the broader `EvaluatedAction` + `WindowSnapshot` drift).

**E. Smaller follow-ons** — Layer 3 prose degenerate-repetition anomaly investigation; Stripe-Price-ID follow-on; Layer 4 payment kill switch (Option D budget-cap enforcement).

---

## Notes

- A10 has no required follow-up — all smoke tests passed. Its PR7-deferred items (multi-owner / shared-credential flows, self-service mint, reactivation/unrevoke, per-vendor scoping, raw `EvaluatedAction` history persistence, AC10 provenance linking, validation caching, kill-switch dashboard, etc.) are listed in `/adopted/atl-a10-design.md` + the decision-log entry; none are blocking — revisit per their conditions.
- If you ever want to return the write surface to inert: unset `SUBSTRATE_WRITE_PATH_ENABLED` in Vercel and redeploy (→ 503). No code change needed.

*End of prompt. Paste into a fresh session; do the Step 0 housekeeping, open under Part A, then elect a track.*
