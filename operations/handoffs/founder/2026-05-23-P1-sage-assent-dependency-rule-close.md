# Session Close — 2026-05-23 — Priority 1: Sage Assent → SageReasoning Dependency Rule + Enforcement-Seam ADR

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` (general session protocol) + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Tier:** `governance` — **Standard** risk. **Development-only; no code, schema, env, or deploy-config touched.** AC7 NOT engaged this session. PR6 NOT engaged. (The eventual *build* of the gate is Critical — named, deferred.)
**Date:** 2026-05-23.

Opened read-only against the P1 next-session prompt; confirmed the open checklist (tier `governance`/Standard; P0 0h hold active; model selection N/A; status vocabulary; signals + risk class), pre-conditions (working tree clean on `main`; predecessor selective-offering commit present; no `.git/index.lock`), and ran the PR15 consult (no Anthropic-canonical primitive substitutes; F1–F4 target other sessions) + PR16 lens. Founder elected **run straight through**. The session: (1) confirmed the provenance question from the code; (2) drafted the rule statement + manifest-rule proposal; (3) authored the enforcement-seam ADR; (4) on founder elections, finalised everything. **Provenance finding (Diagnostic-certain):** the credential write path verifies *who* writes (A10 ownership) but **trusts the submitted aggregates** — no server-side Ed25519 verification, `loop_id` caller-supplied/unverified — so Combination 1 (Sage Assent without SageReasoning) is not structurally prevented today. The false-credential door is open; option (a) closes it.

## Decisions Made
- `D-SAGE-ASSENT-SAGEREASONING-DEPENDENCY-RULE-ADOPTED-2026-05-23` appended. Adopted the hard dependency rule (**R18f**) + the configuration-honesty documentation requirement (**R19e**), both founder-approved as written. Enforcement seam pinned by ADR; founder elected **option (a) — server-side Ed25519 signature verification at the write boundary**, after the A10 gate.

## Status Changes
| Item | Old | New |
|---|---|---|
| Sage Assent → SageReasoning dependency rule | Proposed / Under review | **Adopted** (decision status) |
| Configuration-honesty documentation requirement | Proposed / Under review | **Adopted** (decision status) |
| R18f + R19e (manifest) | (none) | **Live** in `/manifest.md` (governing rule text) |
| Enforcement gate (option (a) Ed25519 verification) | (none) | **Designed** (ADR specifies; build deferred, Critical) |
| Enforcement-seam ADR | (none) | **Adopted** — `/adopted/adr/2026-05-23-sage-assent-sagereasoning-dependency-enforcement.md` |

## Next Session Should
Founder's call between two paths, both opening `governance`/Standard until a build is scheduled:
- **Priority 2** — begin the whole-system test work per `/drafts/2026-05-23-whole-system-data-room-brief.md` (build the data room; the headline negative test = Combination 1 rejection; recommend one manual founder-verified loop first per PR1 + 0g before automating); **or**
- **The Critical build of the option-(a) gate** — implement `verifyLayer2Signature`, extend the write contract to carry signed provenance, wire it after the A10 gate (`code-critical`; full Critical Change Protocol; PR1 single-endpoint proof + PR2 invocation test). A dedicated next-session prompt for the build is not yet written — flag if you want it produced.

## Blocked On
**Files remaining uncommitted (for your commit):**
- MODIFIED: `manifest.md` (R18f + R19e added)
- NEW: `adopted/adr/2026-05-23-sage-assent-sagereasoning-dependency-enforcement.md`
- MODIFIED: `adopted/standing-protocol-cache.md` (cross-reference enumeration line)
- MODIFIED: `operations/decision-log.md` (the entry above)
- NEW: `operations/handoffs/founder/2026-05-23-P1-sage-assent-dependency-rule-close.md` (this close)

**Production state at session close:** **UNCHANGED.** No code, schema, env, or deploy-config touched. Same baseline as the predecessor close: substrate A7 Verified; Sage Assent A10 Live+Verified; Sage Calling Live (gated); Sage Reflect Live/Verified (gated `SAGE_REFLECT_ENABLED=true`); `SUBSTRATE_WRITE_PATH_ENABLED='true'`; Layer-3 + R20a substrate gates UNSET. The mentor-profile decrypt issue (`D-FOUNDER-HUB-…-2026-05-23`) remains OPEN/deferred — out of scope here.

## Open Questions
- **Build of the option-(a) gate** — Critical; deferred (revisit: founder schedules it, likely after P2).
- **Aggregate-faithfulness gap** — option (a) proves a genuine substrate signature exists, not that the aggregate was faithfully computed; deferred as a larger separate problem (ADR revisit-condition 1).
- **Disclaimer wording + "Sage Practice" naming** — Priority 4.
- **Sage Reflect design-doc reconciliation** — Priority 3 (governance edit to an adopted doc; founder approval required).
- **Trust-boundary fork** — provenance check at the route vs also in the library; recommended at the route (ADR revisit-condition 2).

## Founder Verification
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add manifest.md \
        "adopted/adr/2026-05-23-sage-assent-sagereasoning-dependency-enforcement.md" \
        adopted/standing-protocol-cache.md \
        operations/decision-log.md \
        "operations/handoffs/founder/2026-05-23-P1-sage-assent-dependency-rule-close.md"
git commit -m "P1 (2026-05-23): adopt Sage Assent → SageReasoning dependency rule (R18f) + configuration-honesty (R19e); enforcement-seam ADR (elected option (a) — server-side Ed25519 verification at the write boundary); decision-log entry; cache cross-ref update. Governance only — no code; production unchanged."
```
Then push via GitHub Desktop. No Vercel behaviour change (documentation only). If GitHub Desktop reports a lock, close/reopen it or `rm -f .git/index.lock`. Independent re-verification:
```
grep -n "No credential without examination" manifest.md   # R18f (item f under R18)
grep -n "Configuration honesty" manifest.md                # R19e (item e under R19)
sed -n '1,4p' adopted/adr/2026-05-23-sage-assent-sagereasoning-dependency-enforcement.md
```

## Cross-references
- `/operations/handoffs/founder/2026-05-23-P1-sage-assent-dependency-enforcement-NEXT-SESSION-PROMPT.md` (the prompt this session executed)
- `/operations/handoffs/founder/2026-05-23-selective-offering-data-room-brief-close.md` (predecessor close)
- `/drafts/2026-05-23-whole-system-data-room-brief.md` §3 (the configuration ruling adopted)
- `/adopted/adr/2026-05-23-sage-assent-sagereasoning-dependency-enforcement.md` (the enforcement-seam ADR)
- `/operations/decision-log.md` — `D-SAGE-ASSENT-SAGEREASONING-DEPENDENCY-RULE-ADOPTED-2026-05-23`
- `/manifest.md` R18f / R19e / R18a / R18b / R19 / AC7 / AC8

*End of session close. Stabilised to a known-good state: rule Adopted (R18f + R19e in the manifest), enforcement seam Designed via the ADR (option (a) elected), production unchanged. The next session is the founder's call — Priority 2 testing or the Critical build of the gate.*
