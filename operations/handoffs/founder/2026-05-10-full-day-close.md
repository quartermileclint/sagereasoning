# Session Close — 2026-05-10 — Full-Day Work: A4 Verified + Cross-Cutting Audit + Stress-Test Prep

**Stream:** founder.
**Governing frame:** /adopted/standing-protocol-cache.md + /adopted/build-sessions-protocol-cache.md.
**Tier:** mixed — code-critical Critical (A4 Verified) followed by governance work (security audit, Anthropic features survey, inbox synthesis, Judge Layer mapping, stress-test prompt amendments).
**Date:** 2026-05-10.
**Predecessor close:** /operations/handoffs/founder/2026-05-10-stage-1-a4-key-management-close.md (the A4-specific close written mid-day before the governance work began).

**This close supersedes the A4-specific close** as the authoritative session-end record because today's work spanned A4 + a substantial governance arc that the A4 close does not capture. The A4 close remains valid for A4's narrow scope; this close is the cross-cutting record.

---

## What landed today (chronological)

1. **A4 Key Management — Verified.** Stage 1 item A4 reached Verified status on `/api/public-key`. Four-env-var schema (`SUBSTRATE_LAYER2_PREVIOUS_PUBLIC_KEY`, `_KEY_ID`, `_KEY_ISSUED_AT`, `_KEY_RETIRES_AT`) populates the previous-key slot during a 30-day rotation overlap window; fail-safe to no-rotation on partial state. Founder-performable rotation runbook at `/operations/runbooks/substrate-layer2-key-rotation.md`. First scheduled rotation: Sunday 2026-09-06. Three production verification scenarios passed. Decision-log entry `D-A4-KEY-MANAGEMENT-WIRED-VERIFIED-2026-05-10` appended.

2. **Security audit produced.** `/drafts/security-audit-build-plan-vs-agentic-security-strategies-2026-05-10.md`. Triggered by the McKinsey Lilli incident and founder's recognition that the original brainstorming did not surface security adequately. 15 recommendations across 5 priority tiers (Critical / Significant / Minor). Top finding: SageReasoning has no per-agent revocation mechanism — McKinsey-class blast-radius problem.

3. **Anthropic features survey produced** (initially incomplete; corrected later). `/drafts/anthropic-features-survey-2026-05-10.md`. Started with 10 features; founder caught a major omission (Anthropic's "Dreams" feature, announced 2026-05-06); survey now carries a correction notice; three features added (Dreams; Outcomes; Multi-agent orchestration).

4. **Inbox research synthesised** (first batch — 20 files dated 2026-05-11). `/drafts/inbox-research-synthesis-2026-05-10.md`. Top 10 opportunities across 9 themes; 5 challenges to existing decisions.

5. **Judge Layer framework integrated** (second batch — 3 files dated 2026-05-11 evening). The "control layer for production agents" article + companion promptkit + OpenBrain Judge Extender guide were read end-to-end. **Found structural parallels to SageReasoning's Layer 1/2/3 + prescriptive/evaluative system.** Layer 2 IS already a judge layer; prescriptive/evaluative maps to ALLOW/BLOCK/REVISE/ESCALATE.

6. **Three more files received** (third batch — dated 2026-05-12): "claude on track.txt" (5-MCP routine + hooks); "peers we have.txt" (competitive landscape + Character Kernel label); "vibe coding debugging problem link.txt" (Reddit link; researched topic via web search).

7. **Stress-test next-session prompt drafted and progressively amended** in response to each finding. Now at `/operations/handoffs/founder/2026-05-10-build-plan-stress-test-NEXT-SESSION-PROMPT.md`. **Superseded by the fresh prompt produced at this session close** (see Next Session Should below).

---

## Decisions Made (chronological)

- **D-A4-KEY-MANAGEMENT-WIRED-VERIFIED-2026-05-10** appended (full form per Critical session). A4 Verified on `/api/public-key`. Four session-opening Choices committed: Choice 1(a) dry-run rehearsal; Choice 2(a) four optional env vars (refinement from prompt's "three" to actual implementation's "four" after `SUBSTRATE_LAYER2_PREVIOUS_KEY_ISSUED_AT` surfaced as needed to populate A3 Decision 3 response shape); Choice 3(a) rotation runbook at `/operations/runbooks/`; Choice 4(a) first scheduled rotation Sunday 2026-09-06.

- **Three prep documents produced** for the upcoming stress-test session: security audit; Anthropic features survey (with correction notice); inbox research synthesis. All in `/drafts/`; not adopted.

- **Five standing-requirement commitments drafted** for the AI to state at session-open of the stress-test session: (1) consult authoritative sources including `/inbox/` scan; (1a) negative-finding discipline; (2) consider-implications five-question assessment after web-search; (3) proactive surfacing of ten domains; (4) bias toward existing Anthropic infrastructure; (5) positioning + dogfood lens at every gap analysis and triage decision.

- **Foundational positioning and ethos drafted** as a Section 0 of the stress-test prompt: (1) Judgment + Continuity primitive positioning; (2) Judge Layer framework + four-outcome decision framing (ALLOW/BLOCK/REVISE/ESCALATE); (3) Stoic-tools-for-Stoic-products via substrate-as-judge dogfooding (founder elected over Mentor consultation); (4) dogfood discipline applied to operational artefacts.

- **Three structural amendment candidates surfaced from Judge Layer framework** for Phase 3 triage: (A) Layer 2 output shape evolves to `Layer2Decision` with four-outcome framework; (B) decision-log entries gain provenance labels and use policies per OpenBrain Judge Extender; (C) Layer 1 extended to optionally produce Action Proposal Envelope.

- **Three new findings from third inbox batch** to land at the stress-test session (added to the fresh prompt produced at this close):
  - 5-MCP-server + hooks routine adoption (codebase-memory MCP; Context7; Tavily search; read-before-edit hook; safety hook; re-index hook)
  - Category label decision (Character Kernel / Judgment Continuity Layer / Normative Cognitive Middleware) + primary peer group identification (ANCHOR; ResontoLogic/ARH)
  - PEV (Plan → Execute → Verify) loop as explicit process rule + diagnostic-certainty patterns for verification (Windsurf-style)

No amendments to `/adopted/` materials this session beyond the A4 move (drafts only for the stress-test work; founder reviews and decides at the stress-test session).

---

## Status Changes

| Item | Old | New |
|---|---|---|
| Stage 1 A4 — Key management | Scoped | **Verified** |
| `/adopted/ADR-A4-key-management.md` | did not exist | NEW (moved from /drafts/ via the A4 commit) |
| `/website/src/app/api/public-key/route.ts` | A3-modified | A4-modified (resolvePreviousKey() helper + four-env-var schema; fail-safe partial state) |
| `/website/src/app/api/public-key/__tests__/public-key-route.test.ts` | did not exist | NEW (13 Jest-style tests) |
| `/operations/runbooks/` | did not exist | NEW directory; first occupant is the rotation runbook |
| `/operations/runbooks/substrate-layer2-key-rotation.md` | did not exist | NEW (314 lines; founder-performable; 9-step procedure + off-cycle variant + 3 rollback paths) |
| `/drafts/security-audit-build-plan-vs-agentic-security-strategies-2026-05-10.md` | did not exist | NEW (~500 lines; 15 recommendations) |
| `/drafts/anthropic-features-survey-2026-05-10.md` | did not exist | NEW with correction notice (initial 10 features + 3 added post-omission-discovery) |
| `/drafts/inbox-research-synthesis-2026-05-10.md` | did not exist | NEW (top 10 opportunities; 9 themes; 5 challenges) |
| `/operations/handoffs/founder/2026-05-10-build-plan-stress-test-NEXT-SESSION-PROMPT.md` | did not exist | NEW; progressively amended across the day; **superseded by the fresh prompt at session close** |
| Founder calendar | one signing-key reminder | two cryptographic-key reminders + first-scheduled-rotation reminder pending |
| Project instructions / manifest | unchanged | unchanged (amendment candidates drafted for stress-test triage) |

---

## Verification Method Used (per 0c framework)

A4 verification used the established Critical-tier methodology: type-check exit code 0 + 24-of-24 smoke-test invariants PASS via `npx tsx` + three production scenarios on `/api/public-key`. Documented in detail in the A4-specific close.

For the governance work (security audit; Anthropic features survey; inbox synthesis; Judge Layer mapping; prompt amendments): verification was iterative founder review during the session. Each prep document was produced; founder read it (often inline in chat); founder flagged issues (omissions, scope-shifts, structural concerns); AI made amendments. The pattern of founder catching the Anthropic Dreams omission via Google search is the cleanest evidence the iterative verification worked — the negative-finding discipline (Standing Requirement 1a) is a direct codification of that learning.

---

## Risk Classification Record (per 0d-ii)

- **A4 Verified work** — Critical risk (cryptographic key management infrastructure). Full Critical Change Protocol completed; founder explicit approval received naming the four risks; three production verification scenarios passed. Already documented in the A4-specific close.
- **Governance work** — Standard for the drafts; **Elevated** if any drafts are adopted at the stress-test session. No `/adopted/` changes this session beyond the A4 move (which was Elevated for the file move + Critical for the implementation).
- **Project-instruction amendments candidates surfaced** — Elevated risk on adoption per 0d-ii. Drafts remain in `/drafts/` until the stress-test session triage decides which enter the live project instructions.

Session-as-a-whole risk class: Critical (A4 surface is the highest).

---

## PR5 — Knowledge-Gap Carry-Forward (cumulative across today)

Following yesterday's pattern; updated for today's work:

1. **Apex-domain-redirect-on-POST behaviour.** Cumulative count remains at 2 (used `www.` throughout verification curls today). No advance.

2. **The substrate's three-layer architecture and the moat boundary.** Cited in inbox synthesis, Judge Layer mapping, and prep documents — without re-explanation. Resolution-already-canonical. No advance.

3. **The no-current-users governing note's effect on CCP step 3.** Cited at A4 CCP; cited in the stress-test prompt. Resolution-already-canonical. No advance.

4. **PR1 single-endpoint proof discipline.** Applied to A4 ($/api/public-key$); referenced in the prompt amendments as needed for future work. Cumulative count = 5 (fifth application). Long past third-recurrence threshold per PR8; promotion to permanent process rule is overdue. Recommendation: promote at the F-series stewardship session post-stress-test.

5. **Cryptographic-signing payload-vs-hash trade-off.** Not engaged this session.

6. **Jest is not configured in the codebase.** Cumulative count = 2. F-series stewardship item; queued.

7. **Feature-flag-gated rollout / env-var-based fail-safe rollback pattern.** A4 applied this in env-var form (un-set four env vars → no-rotation state, ~30s recovery). Cumulative count = 3. Eligible for process-rule promotion per PR8.

8. **`tsconfig.tsbuildinfo` recurrence in `git status` after `npx tsc`.** Re-engaged this session — caused the founder friction at A4 Step 9.1 git-status output. F-series stewardship; queued for routine governance session.

9. **`git mv` does not work on untracked files.** Re-engaged this session — caused the A4 commit failure at Step 9 that took multiple rounds to fix. Cumulative count = 2 (first observation in original session prompt; second observation in actual A4 work). Eligible for promotion at PR8 third-recurrence.

10. **Multi-step Vercel UI procedures introduce founder navigation friction.** Re-engaged this session — the founder explicitly said "this is too hard, I don't know what you are asking me to do" mid-Step-9. Mitigation applied: reset to single-command blocks; one verification per response. Cumulative count = 2.

11. **NEW finding — Overconfident negative findings in web search.** First observation this session — AI claimed "Dreams" feature didn't exist when it had been announced 2026-05-06. Cause: narrow query + domain restriction + premature negative conclusion. Mitigation codified as Standing Requirement 1a (negative-finding discipline) in the stress-test prompt; candidate for promotion to permanent process rule. Cumulative count = 1.

12. **NEW finding — The build plan was scoped without explicit security/regulatory/Anthropic-platform consideration.** First observation this session — founder identified the gap after McKinsey/Lilli incident raised it. Cause: brainstorming did not proactively surface these domains. Mitigation codified as Standing Requirement 3 (proactive surfacing of ten domains). Cumulative count = 1.

13. **NEW finding — Rules without supporting infrastructure are theatre.** First observation this session — Standing Requirement 1 ("consult authoritative sources") did not catch the Anthropic Dreams omission because the AI applied it with narrow queries. The "claude on track" routine (5 MCPs + hooks) is the operational fix; the rule alone is the diagnosis. Cumulative count = 1. Implication: every standing requirement needs paired infrastructure that makes it operationally robust.

14. **NEW finding — SageReasoning's category label not yet identified.** "Peers we have" surfaced "Character Kernel" / "Judgment Continuity Layer" / "Normative Cognitive Middleware" as candidate labels. The substrate currently has no agreed category name; competitive positioning suffers. Cumulative count = 1; addressed at stress-test session.

---

## T-series tacit-knowledge findings (per PR8)

**T-AT-LEAST-NEW-1 — Three-scenario verification methodology.** Applied for fifth time today at A4 verification. Promotion to permanent process rule is significantly overdue. Recommendation: promote at the F-series stewardship session.

**T-A3-NEW-1 — Critical Change Protocol drafted ahead of time inside the ADR.** Applied at A4 (third confirmed). Eligible for promotion per PR8.

**T-A3-NEW-2 — ADR commits Critical-classification of eventual scaffolding session.** Applied at A4 (third confirmed). Eligible for promotion.

**T-A3-NEW-3 — Feature-flag-gated rollout pattern's Path A rollback property.** Applied at A4 in env-var form (third application). Eligible for promotion.

**T-A3-NEW-4 — Inline `npx tsx` smoke test as interim test runner.** Applied at A4 (second observation). Cumulative count = 2.

**T-A4-NEW-1 — `git mv` fails on untracked files.** Re-engaged at A4 Step 9 (second observation). Cumulative count = 2.

**T-A4-NEW-2 — Multi-step Vercel UI procedures need founder-paced single-command blocks.** Re-engaged today (second observation).

**T-A4-NEW-3 — Implementation refinements surface during code that adjust prompt-stated counts.** New today.

**T-2026-05-10-NEW-1 — Iterative founder review of prep documents catches omissions.** New today. Pattern: founder catches a documents's gap via simple Google search; AI was overconfident in negative finding; correction triggered prompt-level amendment. Cumulative count = 1.

**T-2026-05-10-NEW-2 — Long-day-cumulative-fatigue affects discipline application.** New today. Pattern: late-day work (Step 9 git-friction; founder "this is too hard") shows discipline degrading under fatigue even when rules are correctly written. Mitigation: stable close points; founder-pace control; written runbook procedures. Cumulative count = 1.

**T-2026-05-10-NEW-3 — Rules without paired infrastructure are theatre.** New today. The codified rule (Standing Requirement 1) didn't prevent the Anthropic Dreams omission because the infrastructure to apply it (broad searches; URL pattern checks; news venue searches) wasn't paired with the rule. Cumulative count = 1.

---

## Stewardship findings (F-series per PR9)

Existing F-series items continue; new ones added today:

**Carry-forward (from A3/A4 closes):**
- Jest configuration debt (efficiency & stewardship; ~30 min in routine governance session)
- Founder calendar consolidation across multiple cryptographic-key reminders (efficiency & stewardship)

**NEW today:**
- **`tsconfig.tsbuildinfo` not in `.gitignore`.** Side-effect of every `npx tsc` run; caused friction at A4 Step 9.1. Add to `.gitignore` in routine governance session (~5 min).
- **`website/tmp/` scratch directory not in `.gitignore`.** Created by AI for smoke tests; permission constraints prevented in-session deletion. Add to `.gitignore` (~5 min).
- **5-MCP-server + hooks infrastructure absent** (codebase-memory MCP; Context7 library docs MCP; Tavily search MCP; read-before-edit hook; safety hook; re-index hook). New today. **Long-term regression risk** if not addressed — every coding session is operationally weaker without these. Recommended: this is NOT efficiency-tier; this is **long-term regression tier** per PR9. Should land before Stage 2 K-category migration begins.
- **Project-instruction-level amendments accumulating in `/drafts/`** without integration. Multiple amendments candidate (security; regulatory; positioning; Judge Layer framework; PEV; Character Kernel naming; etc.). Risk of drift between drafts and live discipline if not adopted at stress-test session.

Recommendation: bundle Jest configuration + `.gitignore` additions + calendar consolidation + T-series promotions into a single ~60 min Standard-risk routine governance session AFTER the stress-test session. The 5-MCP infrastructure is bigger work and may need its own session.

---

## Open Questions

1. **Capability-matrix update for A1+A2+A3+A4 surfaces** — inherited from each session; continues to accumulate; deferred to K-category migration planning.

2. **Whether the T-series promotions should land at the F-series stewardship session, or be batched into the stress-test session's amendment work.** Recommendation: stewardship session post-stress-test; keeps the stress-test focused on the structural amendments.

3. **First-rotation calendar reminder** — pending founder action between sessions. Sunday 2026-09-06.

4. **Five downstream A4 ADR open questions** — plugin manifest C1, verifier-side helper B1, telemetry, encryption-key rotation runbook, founder calendar consolidation.

5. **Substrate category label** — Character Kernel / Judgment Continuity Layer / Normative Cognitive Middleware / Practical Wisdom Layer / Assent Engine / Virtue Middleware. Founder elects at stress-test session.

6. **Three structural amendment candidates from Judge Layer framework** — Layer 2 → Layer 2 Decision; decision-log provenance labels + use policies; Layer 1 Action Proposal Envelope. Founder elects at stress-test session triage.

7. **5-MCP + hooks infrastructure adoption** — codebase-memory MCP; Context7; Tavily; read-before-edit hook; etc. Founder elects at stress-test session.

8. **PEV (Plan → Execute → Verify) loop as explicit process rule** — PR10 candidate. Founder elects.

9. **Substrate hosting decision** (Vercel+Supabase vs Managed Agents) — surfaced yesterday; Dreams + Outcomes + Multi-agent orchestration now in Managed Agents make this more consequential. Founder elects at stress-test or before A5.

10. **Plugin spec adoption for Stage 3** — surfaced yesterday; saves 5-8 sessions if adopted. Founder elects at stress-test.

11. **Substack scan completeness** — homepage requires JavaScript; web-fetch returned no content. Articles surfaced via search but not fully read: "Your engineers are building your lock-in"; "2026 Sneak Peek: First Job-by-Job Guide"; "Why Your World Model Will Look Authoritative for Six Months." Founder may want to drop relevant ones in `/inbox/` for next session.

---

## Founder Verification (Between Sessions)

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"

# 1. Confirm A4 wiring + A4 session-close commits are on origin/main
git log --oneline -5 origin/main
# Expected: A4 session-close commit (decision-log + close) on top;
# A4 wiring commit beneath; A3 history below.

# 2. Confirm production state — A4 steady state preserved
curl -s https://www.sagereasoning.com/api/public-key | python3 -c "
import json, sys
d = json.load(sys.stdin)
ok = d.get('previous') is None and d.get('rotation_overlap_until') is None and d.get('algorithm') == 'Ed25519'
print('PASS — A4 steady state preserved (key_id={})'.format(d['key_id']) if ok else 'FAIL — state regression')
"

# 3. Confirm the four prep documents exist
ls drafts/security-audit-build-plan-vs-agentic-security-strategies-2026-05-10.md
ls drafts/anthropic-features-survey-2026-05-10.md
ls drafts/inbox-research-synthesis-2026-05-10.md
ls operations/handoffs/founder/2026-05-10-build-plan-stress-test-NEXT-SESSION-PROMPT.md
ls operations/handoffs/founder/2026-05-10-full-day-close.md   # this file
ls operations/handoffs/founder/2026-05-10-build-plan-stress-test-NEXT-SESSION-PROMPT-v2.md  # the fresh prompt

# 4. Optional cleanup
rm -rf website/tmp
git checkout -- website/tsconfig.tsbuildinfo 2>&1 || true

# 5. Calendar — add Sunday 2026-09-06 reminder:
#    "Substrate Layer 2 key rotation — first scheduled rotation per ADR-A4 Decision 4.
#     Run /operations/runbooks/substrate-layer2-key-rotation.md."
```

**Session-close commit:**

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add operations/handoffs/founder/2026-05-10-full-day-close.md \
        operations/handoffs/founder/2026-05-10-build-plan-stress-test-NEXT-SESSION-PROMPT-v2.md \
        drafts/security-audit-build-plan-vs-agentic-security-strategies-2026-05-10.md \
        drafts/anthropic-features-survey-2026-05-10.md \
        drafts/inbox-research-synthesis-2026-05-10.md \
        operations/handoffs/founder/2026-05-10-build-plan-stress-test-NEXT-SESSION-PROMPT.md
git commit -m "Full-day session close + stress-test prep documents (2026-05-10)

A4 Key Management Verified earlier today (separate commit upstream).
This commit captures the full-day governance work that followed:

- /drafts/security-audit-build-plan-vs-agentic-security-strategies-2026-05-10.md
  (security audit; 15 recommendations across 5 priority tiers)
- /drafts/anthropic-features-survey-2026-05-10.md
  (Anthropic platform features; initial omissions corrected per
  founder-caught Anthropic Dreams discovery)
- /drafts/inbox-research-synthesis-2026-05-10.md
  (delegated agent synthesis of 20 inbox files; top 10 opportunities;
  9 themes; 5 challenges to existing decisions)
- /operations/handoffs/founder/2026-05-10-build-plan-stress-test-NEXT-SESSION-PROMPT.md
  (the progressively-amended stress-test prompt; superseded by v2)
- /operations/handoffs/founder/2026-05-10-build-plan-stress-test-NEXT-SESSION-PROMPT-v2.md
  (FRESH stress-test prompt incorporating all findings including
  3 latest files dated 2026-05-12: claude-on-track 5-MCP routine,
  peers-we-have Character Kernel framing, vibe-coding debugging gap)
- /operations/handoffs/founder/2026-05-10-full-day-close.md
  (this file — authoritative full-day session-end record)

Production state: A4 Verified; SUBSTRATE_LAYER2_PREVIOUS_* env vars
UNSET; /api/public-key serves steady-state shape; key_id=substrate-layer2-2026Q2.

Next session: Build-Plan Stress-Test per the v2 prompt. Critical-tier
governance session; ST1/ST2 split now default given expanded scope.

Decision-log entry for the full-day governance work to be appended at
the stress-test session-close (it spans both sessions); today's
A4-Verified decision-log entry is the canonical record for the A4
work."
```

Then push via GitHub Desktop. This commit only touches `/drafts/` and `/operations/` paths; Vercel will not redeploy.

---

## Next Session Should

**The next session is the Build-Plan Stress-Test.** It is NOT a continuation of Stage 1 A5; A5 is deferred until the stress-test produces amended build-plan structure.

The prompt for tomorrow's session is at:

`/operations/handoffs/founder/2026-05-10-build-plan-stress-test-NEXT-SESSION-PROMPT-v2.md`

The v2 prompt supersedes the original stress-test prompt. It incorporates all of today's findings including the three latest inbox files (claude-on-track; peers we have; vibe coding debugging) and the Substack/Anthropic re-verification scans.

After the stress-test reaches its session-close, the build arc resumes with **A5 — Layer 3 server-side service** under the amended build plan + manifest + project instructions.

---

## Blocked On

**Founder action required before stress-test session begins:**

1. Stage and commit the session-close commit per the Founder Verification block above.
2. Push via GitHub Desktop.
3. Add calendar reminder for Sunday 2026-09-06.
4. (Optional) Read the v2 stress-test prompt end-to-end before tomorrow.
5. (Optional) Read the three prep documents in `/drafts/` if not done.
6. (Optional) Source any additional best-practice materials and drop in `/inbox/`; the AI will scan at session-open per Standing Requirement 1.

**Files remaining uncommitted** (after this session-close commit):
- None for the standard committed work (everything in the commit covers it).
- Untracked at session close: `website/tmp/a4-smoke-test.ts` (clean up per Founder Verification step 4); the next-session-prompt for A5 (drafted earlier today; now superseded but on disk).

**Production state at session close:** A4 Verified and live at `/api/public-key`. Production steady state: all four `SUBSTRATE_LAYER2_PREVIOUS_*` env vars UNSET. The endpoint serves the same shape as before A4 (`previous: null`, `rotation_overlap_until: null`) with `key_id=substrate-layer2-2026Q2`. Vercel state: latest deploy is the post-A4-cleanup deploy.

---

## Orchestration Reminder (for tomorrow's stress-test session-open)

The next session is **governance-tier, Elevated risk** (the amendments themselves are Elevated; some adopted amendments may be Critical when implemented in subsequent sessions).

The AI at tomorrow's session-open commits to all five Standing Requirements stated in the v2 prompt — most importantly:
- **SR1**: consult authoritative sources including `/inbox/` scan (the founder may add files between sessions)
- **SR1a**: negative-finding discipline (codified today after the Anthropic Dreams omission)
- **SR2**: five-question consider-implications assessment after web-search
- **SR3**: proactive surfacing of ten domains (security; regulatory; accessibility; privacy-by-design; observability; legal/tax; insurance; marketplace economics; onboarding UX; Anthropic-native capabilities)
- **SR4**: bias toward existing Anthropic infrastructure as default
- **SR5**: positioning + dogfood lens at every gap analysis and triage decision

Plus the foundational principles in Section 0 of the v2 prompt (the four principles including substrate-as-judge dogfooding).

The session structure has six phases (see v2 prompt §Part B):
1. Phase 1 — inventory + framing
2. Phase 1.5 — Action Surface Audit on SageReasoning's own architecture (Judge Layer Prompt 1 dogfood)
3. Phase 2 — domain-by-domain gap-finding (with five-failure-modes diagnostic)
4. Phase 2.5 — Anthropic + Judge Layer + 5-MCP routine deep-dive (16 candidates per v2)
5. Phase 3 — triage in four-outcome framework (ALLOW / REVISE / BLOCK / ESCALATE)
6. Phase 4 — draft amendments
7. Phase 5 — session close (with dogfood discipline check)

ST1/ST2 split is the default recommendation. ST1 closes after Phase 2 (~3 hours); ST2 resumes at Phase 2.5 + Phase 3 + Phase 4 + Phase 5 (~3-4 hours). Or one session if founder has 5-6 uninterrupted hours.

---

## Cross-references

- Predecessor: `/operations/handoffs/founder/2026-05-10-stage-1-a4-key-management-close.md` (A4-specific close; valid for A4 scope only)
- Decision-log entry for A4: `D-A4-KEY-MANAGEMENT-WIRED-VERIFIED-2026-05-10`
- A4 ADR: `/adopted/ADR-A4-key-management.md`
- A4 rotation runbook: `/operations/runbooks/substrate-layer2-key-rotation.md`
- A3 ADR: `/adopted/ADR-layer2-signing-infrastructure.md`
- Substrate ADR: `/adopted/ADR-stoic-agent-substrate-concept.md`
- Encryption-wiring ADR: `/adopted/ADR-ENCRYPTION-WIRING-01.md`
- Adopted staging plan: `/adopted/substrate-plugin-staging-plan.md`
- Standing protocol cache: `/adopted/standing-protocol-cache.md`
- Build-sessions protocol cache: `/adopted/build-sessions-protocol-cache.md`
- Three prep documents (in `/drafts/`):
  - `/drafts/security-audit-build-plan-vs-agentic-security-strategies-2026-05-10.md`
  - `/drafts/anthropic-features-survey-2026-05-10.md` (with correction notice)
  - `/drafts/inbox-research-synthesis-2026-05-10.md`
- The stress-test prompt — v1 (superseded): `/operations/handoffs/founder/2026-05-10-build-plan-stress-test-NEXT-SESSION-PROMPT.md`
- The stress-test prompt — v2 (current): `/operations/handoffs/founder/2026-05-10-build-plan-stress-test-NEXT-SESSION-PROMPT-v2.md`
- Inbox files (in `/inbox/`):
  - Yesterday's batch: 10 promptkit .md files + 8 RTF articles + 2 RTFD bundles
  - Last evening: control layer for production agents.rtf + 20260508-246-promptkit-1.md + 20260508-246-guide-main.md
  - Today: claude on track.txt + peers we have.txt + vibe coding debugging problem link.txt
- Manifest: `/manifest.md` (R-rules, AC-rules, KG-rules, PR-rules — candidates for amendment at stress-test triage)

*End of full-day session close. Today's work was substantial across A4 Verified + cross-cutting governance audit + stress-test preparation. The build arc has crossed Stage 1 A4 (Critical); the next session reconsiders the entire plan against accumulated findings before resuming Stage 1 A5.*
