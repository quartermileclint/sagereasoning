# Session Close — 2026-05-21 — Sage Calling LIVE close-out + Sage Reflect design draft

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users").
**Tier:** opened `governance` (Standard) for the Sage Calling close-out; stayed `governance` (Standard) when the founder elected the Sage Reflect **design-only** track. No code, no production change all session.
**Date:** 2026-05-21.

This session did two things: (A) formally closed out the Sage Calling Stage 2 go-live, and (B) on the founder's track election, drafted the full Sage Reflect product design (design only).

## Decisions Made
- `D-SAGE-CALLING-STAGE2-LIVE-VERIFIED-2026-05-21` appended — Sage Calling Stage 2 public surface **Wired → Verified / Live** on the founder's 2026-05-21 smoke test; product line Live, gated by `SAGE_CALLING_ENABLED`. Sage Calling build arc complete.
- `D-SAGE-REFLECT-DESIGN-DRAFTED-2026-05-21` appended — full Sage Reflect design drafted (DRAFT, pending lock). Four founder elections baked in (deliverable = full locked doc; reuse-where-possible + rename-later; agent-first; deterministic + translation-sandwich). Load-bearing reconciliation: **Sage Assent = the renamed Agent Trust Layer (ATL)** — reuse its grade-engine + evaluation-window rather than re-implement (SR-4).

## Status Changes
| Item | Old | New |
|---|---|---|
| Sage Calling — Stage 2 public surface | Wired | **Verified / Live** (gated by `SAGE_CALLING_ENABLED`) |
| Sage Reflect (Sage Practice product 4) | — | **Designed** (draft at `/drafts/`; pending founder lock) |

## Next Session Should
**Founder's choice.** Two open threads:
1. **Lock the Sage Reflect design** — if the founder approves the draft, a short `governance`/`archive` (Elevated) step moves `/drafts/sage-reflect-product-design.md` → `/adopted/`, appends `D-SAGE-REFLECT-DESIGN-LOCKED-…`, and resolves the lockable open items (route name; per-domain proximity question to Sage Assent; `evaluated_actions` shape). Then the **build** can be scoped (Sage Calling two-stage pattern: Elevated engine+store, then Critical endpoint).
2. **Or one of the previously-offered tracks** — K-category migration (`code-elevated`), the Stage-1-close lawyer engagement (`governance`, critical-path per ST2 Q4), or the Sage Calling PR7 follow-ons. None pre-written; founder elects order.

## Blocked On
**Files to commit + push via GitHub Desktop (only these — do NOT blanket `git add .`):**
- `operations/decision-log.md` (two entries appended)
- `operations/handoffs/founder/2026-05-21-sage-calling-stage2-endpoint-close.md` (curl host fixes + convention note)
- `operations/verification-framework.md` (curl-block convention added)
- `operations/knowledge-gaps.md` (KG1 candidate note)
- `drafts/sage-reflect-product-design.md` (NEW — the design draft)
- `operations/handoffs/founder/2026-05-21-sage-reflect-design-close.md` (this close)
- (Optional, untracked, founder's call: the pasted `…-LIVE-close-and-track-election-NEXT-SESSION-PROMPT.md` and `inbox/reflect mentor input.rtf`.)

**Pending founder action (Sage Calling cleanup — between sessions):** the smoke-test cleanup was *not* executed by the AI (it touches production data + needs your admin token). Run in Supabase SQL Editor: `DELETE FROM discovery_sessions WHERE session_id LIKE 'smoke-%';` (confirm with a SELECT first), then find the test credential id (`SELECT id … FROM api_keys WHERE agent_id='agent_smoketest_v1' AND purpose='atl_write';`) and revoke it via `DELETE https://www.sagereasoning.com/api/admin/accreditation-credentials?id=<id>` with a fresh admin JWT (no `-L`).

**Production state at session close:** **UNCHANGED this session.** Sage Calling Live (gated by `SAGE_CALLING_ENABLED`). Substrate at A7 Verified; A10 Live + Verified; `SUBSTRATE_LAYER3_ENABLED` UNSET; `SUBSTRATE_R20A_GATE_ENABLED` UNSET; Layer 1 schema v3 (accepts v1|v2|v3; producer emits v1). No deploy, no schema change, no env change in this session.

## Open Questions
Per the Sage Reflect design's "Open items": per-domain katorthoma proximity (a Sage Assent/ATL enhancement if not already stored); `evaluated_actions` shape compatibility for the Q4 kathekon feed; route-name lock (`/api/practice/reflect`); human-surface migration timing; the ATL→Sage Assent rename track; 90-day retention confirmation (lawyer track).

## Founder Verification
**1. Read the design** (the deliverable): `drafts/sage-reflect-product-design.md`. Confirm the cycle + naming, the four elections (SR-4/5/6/11), the reuse-over-rebuild reconciliation table, and the boundary conditions. Tell me what to change, or say "lock it."

**2. Run the Sage Calling smoke-test cleanup** (commands above) when convenient.

**3. Commit + push** the files listed under Blocked On.
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add operations/decision-log.md operations/verification-framework.md operations/knowledge-gaps.md "operations/handoffs/founder/2026-05-21-sage-calling-stage2-endpoint-close.md" "operations/handoffs/founder/2026-05-21-sage-reflect-design-close.md" drafts/sage-reflect-product-design.md
git commit -m "Sage Calling LIVE close-out + Sage Reflect design draft (governance; no code)"
```
Then push via GitHub Desktop. No Vercel runtime change expected (docs/draft only).

## Cross-references
- `/operations/handoffs/founder/2026-05-21-sage-calling-stage2-endpoint-close.md` (predecessor — the Critical build close, now curl-corrected)
- `/operations/handoffs/founder/2026-05-21-sage-calling-LIVE-close-and-track-election-NEXT-SESSION-PROMPT.md` (the prompt that opened this session)
- `/drafts/sage-reflect-product-design.md` (the design produced)
- `/adopted/purpose-discovery-product-design.md` (the Sage Calling design it mirrors)
- `D-SAGE-CALLING-STAGE2-LIVE-VERIFIED-2026-05-21`, `D-SAGE-REFLECT-DESIGN-DRAFTED-2026-05-21` (decision-log)
- `/adopted/standing-protocol-cache.md`, `/adopted/build-sessions-protocol-cache.md`

*End of session close. Stabilised to a known-good state: Sage Calling Live + recorded; operational findings captured; Sage Reflect designed (draft, pending lock). No code or production change this session; cleanup of test data is a pending founder action.*
