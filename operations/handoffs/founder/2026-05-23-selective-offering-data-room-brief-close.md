# Session Close — 2026-05-23 — Selective Offering + Whole-System Data-Room Brief

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Tier:** `governance` — **Standard** risk. **Development-only; no code, schema, env, or deploy-config touched.** AC7 NOT engaged. PR6 NOT engaged.
**Date:** 2026-05-23.

Opened read-only as the four-product orientation (Part A + the three new inbox items + the whole-system understanding); signalled ready; the founder then set the task. The session ran in three movements: (1) a recommendation on whole-system testing, the data room, and safe Cowork→Code use; (2) assessment of a new private-mentor ruling that constrains how the four products may be offered to developers; (3) on the founder's prioritisation, production of the Priority-0 data-room brief plus this close and the Priority-1 prompt. The mentor's ruling introduces **one hard, API-enforced dependency (Sage Assent requires SageReasoning)** and **one documentation requirement (no-Reflect configs must not be marketed as a "practice")**. Grounded against the code, the hard dependency maps to verifying substrate provenance at the credential write boundary; the linkage primitives (Ed25519 signature/`receipt_id`, `loop_id`) already exist, so this is an enforcement gap, not a missing capability.

## Decisions Made
- **Founder prioritisation set** (this session's governing decision): **P0** fold the configuration rules into a detailed data-room brief (built later) — *done this session*; **P1** decision-log entry + manifest rule + ADR for the enforcement seam — *next session, prompt written*; **P2** test legitimate configurations + required disclaimers; **P3** amend documentation; **P4** later session (disclaimer language + "Sage Practice" naming question); **P5** agreed (the future Critical build).
- **The configuration rule itself is NOT adopted this session.** Its formal decision-log entry + manifest rule + ADR are explicitly **deferred to Priority 1** per the founder's sequencing (PR7 — deferred decisions documented; revisit condition = the P1 session). No `D-…` entry was appended to the decision log this session; the rule is recorded as **proposed / Under review** in the brief §3.

## Status Changes
| Item | Old | New |
|---|---|---|
| Whole-system data-room brief | (none) | **Drafted** — `/drafts/2026-05-23-whole-system-data-room-brief.md` (Scoped; build deferred) |
| Selective-offering configuration rule | (none) | **Proposed / Under review** (adoption deferred to P1) |
| Sage Assent → SageReasoning hard dependency | (none) | **Identified as an enforcement gap** (Critical when built; ADR at P1) |

## Next Session Should
Begin **Priority 1** — adopt the rule and pin its enforcement architecture, **no code**. Produce: (a) a decision-log entry adopting the dependency rule + documentation requirement; (b) a proposed manifest rule in the R18/R19 family (founder approves rule text — manifest changes require explicit approval); (c) an ADR for the enforcement seam answering the core question: *repurpose the existing Ed25519 signature/`receipt_id` verification at the credential write boundary (and/or the `loop_id` linkage) vs introduce a new SageReasoning session token — and does the write path verify substrate provenance today, or trust submitted aggregates?* Open against `/operations/handoffs/founder/2026-05-23-P1-sage-assent-dependency-enforcement-NEXT-SESSION-PROMPT.md`. Tier: `governance` / Standard (the design session); the eventual *build* is Critical.

## Blocked On
**Files created this session (uncommitted — for your commit):**
- NEW: `drafts/2026-05-23-whole-system-data-room-brief.md` (Priority-0 deliverable)
- NEW: `operations/handoffs/founder/2026-05-23-selective-offering-data-room-brief-close.md` (this close)
- NEW: `operations/handoffs/founder/2026-05-23-P1-sage-assent-dependency-enforcement-NEXT-SESSION-PROMPT.md` (the Priority-1 prompt)

**Production state at session close:** **UNCHANGED.** No code, schema, env, or deploy-config touched. Same baseline as the Parked-2 close: `discovery_sessions` at 12 columns; `SAGE_REFLECT_ENABLED=true`; `MENTOR_ENCRYPTION_KEY` set; substrate A7 Verified; Sage Assent A10 Live+Verified; Sage Calling Live (gated `SAGE_CALLING_ENABLED`); `SUBSTRATE_WRITE_PATH_ENABLED='true'`; Layer-3 + R20a substrate gates UNSET. (Confirm the Parked-2 commit was pushed and Vercel is green before the P1 session.)

## Open Questions
- **Enforcement seam (→ P1 ADR):** which primitive enforces the dependency (verified Ed25519 signature/`receipt_id`, `loop_id` linkage, or a new session token); and whether the accreditation write path currently verifies substrate provenance or trusts submitted aggregates. *Assumption to confirm: it trusts aggregates — which is the false-credential door.*
- **Manifest placement (→ P1):** proposed home is a new **R18f** (no credential without examination — the hard dependency) + an **R19** clause (configuration honesty — no "practice" claim without Reflect). Founder elects exact placement + wording.
- **"Sage Practice" naming (→ P4):** the plugin name asserts "practice," but a no-Reflect partial config is, by the mentor's reasoning, not a practice. Naming decision deferred.
- **Sage Reflect design-doc reconciliation (→ P3):** the doc's "no stage is optional / no stage can be bypassed" language vs the mentor's "selective offering is legitimate." Governance edit to an adopted doc; founder approval required.

## Founder Verification
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add "drafts/2026-05-23-whole-system-data-room-brief.md" "operations/handoffs/founder/2026-05-23-selective-offering-data-room-brief-close.md" "operations/handoffs/founder/2026-05-23-P1-sage-assent-dependency-enforcement-NEXT-SESSION-PROMPT.md"
git commit -m "Selective-offering session (2026-05-23): Priority-0 whole-system data-room brief (configuration rules folded in, build deferred); session close; Priority-1 next-session prompt (dependency rule + manifest rule + enforcement-seam ADR). Development-only — no code; production unchanged."
```
Then push via GitHub Desktop. No Vercel behaviour change (documentation only). If GitHub Desktop reports a lock, close/reopen it or `rm -f .git/index.lock`.

## Cross-references
- `/drafts/2026-05-23-whole-system-data-room-brief.md` (Priority-0 deliverable)
- `/operations/handoffs/founder/2026-05-23-P1-sage-assent-dependency-enforcement-NEXT-SESSION-PROMPT.md` (Priority-1 prompt)
- `/operations/handoffs/founder/2026-05-23-four-product-orientation-OPEN-TASK-NEXT-SESSION-PROMPT.md` (the prompt this session opened on)
- `/operations/handoffs/founder/2026-05-23-parked2-renames-close.md` (predecessor — baseline)
- `/adopted/sage-assent-write-path-design.md` (the credential write path — enforcement seam's home)
- `/manifest.md` R18 / R19 / R18d / AC7 / AC8

*End of session close. Stabilised to a known-good state: three documentation artefacts created; production unchanged; the configuration rule recorded as proposed/Under-review with formal adoption deferred to Priority 1 per the founder's sequencing. The next session opens on Priority 1.*
