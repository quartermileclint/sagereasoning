# Session Close — 2026-05-12 — Build-Plan Stress-Test ST2 (Phase 2.5 → Phase 5 complete)

**Stream:** founder.
**Governing frame:** /adopted/standing-protocol-cache.md + /adopted/build-sessions-protocol-cache.md + ST2 prompt at /operations/handoffs/founder/2026-05-12-build-plan-stress-test-ST2-NEXT-SESSION-PROMPT.md (the operative reference for ST2; supersedes the ST2 portion of the v2 prompt dated 2026-05-10).
**Tier:** governance — Elevated for the session-as-a-whole. Amendment drafts touch staging plan + manifest + project instructions; the drafts themselves remain in `/drafts/` — no `/adopted/` move this session. No code touched. Substrate production state unchanged.
**Date:** 2026-05-12.
**Predecessor close:** /operations/handoffs/founder/2026-05-12-build-plan-stress-test-ST1-close.md (ST1 close; Phase 1 + 1.5 + 2 complete; 34-amendment Phase 2 gap analysis produced).
**Stress-test arc state:** ST2 complete. Arc closes pending the adoption session (the `/drafts/` → `/adopted/` moves; see Next Session Should).

---

## What landed in ST2

1. **Part A read pass complete.** Standing protocol cache; build-sessions cache; ST1 close; Phase 2 gap analysis; two prep documents (Anthropic features survey + inbox synthesis); three inbox files informing Phase 2.5 candidates (claude on track; peers we have; vibe coding link). Inbox scan confirmed nothing new since ST1 close at 2026-05-12 06:01.

2. **Session-open confirmation completed.** Tier declared (governance / Elevated); six Standing Requirements stated aloud (SR1, SR1a, SR2, SR3, SR4, SR5); founder elected single-session scope; inline Phase 2.5 output; carry-forward open questions deferred to Phase 3.

3. **Phase 2.5 — 16-candidate deep-dive complete.** Five-point analysis per candidate (what it does + ref; problem solved; existing-work improvement; where wrong to apply; info needed before triage). Three observations carried into Phase 3: two structural-decision pairs (hosting + plugin-architecture); three near-zero-cost ALLOWs; Candidate 14 (Judge Extender) flagged as triage-first.

4. **Phase 3 — four-outcome triage complete.** **50 items triaged** in ALLOW / REVISE / BLOCK / ESCALATE framework across ten steps. Substrate-as-judge dogfood: manual mechanism walkthrough (Control Filter + Passion Diagnosis + Oikeiosis) applied to the category-label election; mechanism flagged no objection; "Character Kernel" election held.

5. **Phase 4 — four amendment-draft files written to `/drafts/`:**
   - `/drafts/2026-05-12-staging-plan-amendments.md` — Stage 1 expansion (A10-A19); Stage 3 re-scope (Plugin spec + MCP); Stage 4 G4 gating expansion; Stage 6 multi-marketplace strategy; parallel pre-launch founder-personal-exposure track
   - `/drafts/2026-05-12-manifest-amendments.md` — R17g/h/i; R18a Character Kernel; AC9-AC13; CR-### register populated (8 binding obligations); AC1 quarterly governance task
   - `/drafts/2026-05-12-project-instruction-amendments.md` — PR10 (PEV loop); PR11-PR15 (SR1-SR4); PR16 (SR5); AI signals table extended with diagnostic-certainty signals
   - `/drafts/2026-05-12-amendment-adoption-checklist.md` — six-move adoption sequence; risk per move; pre-conditions; post-conditions

6. **Phase 5 — ST2 close + decision-log entry + next-session prompt produced.**

---

## Decisions Made — full triage record (four-outcome vocabulary)

### Phase 2.5 candidates (16 items)

| # | Candidate | Election | Notes |
|---|---|---|---|
| 1 | `/security-review` slash + GitHub Action | **ALLOW** | Closes audit R6; near-zero cost; folds into PR1 |
| 2 | Sub-Agents + Agent Teams + Hooks | **ALLOW (split)** | Sub-Agents ALLOW; Agent Teams ESCALATE (research preview); Hooks ALLOW (3 foundational hooks) |
| 3 | Claude Agent SDK | **ALLOW (selective)** | Layer 1 open-source plugin client only |
| 4 | Managed Agents | **ESCALATE** | Three revisit conditions named |
| 5 | Dreams (memory consolidation) | **ESCALATE** | Research preview; R17 boundary undefined |
| 6 | Outcomes (rubric + grader) | **ALLOW** | With cost pre-condition; new AC13 |
| 7 | Multi-agent orchestration | **ESCALATE** | Revisit at Stage 3 kickoff |
| 8 | Agent Skills marketplace | **ALLOW** | Second marketplace target after Cowork |
| 9 | Memory tool API | **BLOCK (mentor) + ESCALATE (cache)** | R17b mismatch for mentor; cache evaluation deferred |
| 10 | MCP + Plugin spec | **ALLOW with REVISE** | Stage 3 C1+C2+C3+C4+C6+C7 adopt; C5 stays bespoke |
| 11 | Claude Code Plugins | **ALLOW (with C10)** | Locked into Stage 4 G1 sequencing |
| 12 | CLAUDE.md special handling | **ALLOW (split)** | Low-stakes ALLOW; manifest + /adopted/ BLOCK |
| 13 | Opus 4.7 + Sonnet 4.6 + tokenizer tax | **ESCALATE → governance task** | At next quarterly review (2026-07-06) |
| 14 | OpenBrain Judge Extender + Character Kernel | **ALLOW** | Substrate consultation no-objection; J1 ADR drafted |
| 15 | 5-MCP + hooks routine | **ALLOW with REVISE** | Session-category gated: code-elevated/critical only |
| 16 | PEV loop + diagnostic-certainty | **ALLOW** | As new PR10 |

### Three structural Judge Layer amendments (Step 2)

| # | Amendment | Election |
|---|---|---|
| 2A | Layer2Decision four-outcome envelope | **REVISE** — extend Layer2Assessment with `decision` field; don't replace |
| 2B | Provenance + use-policy tags | **REVISE** — Layer 2 outputs first; decision log later |
| 2C | Layer 1 Action Proposal Envelope | **ESCALATE** — defer until external Judge Extender adopter exists or schema stable |

### Phase 2 amendments — 30 remaining items (10 domains)

**Domain 1 (Security):** S1 REVISE (token-format ADR); S2 REVISE (decompose S2a/S2b); S3 ALLOW; S4 ALLOW (Stage 3 J7)
**Domain 2 (Regulatory):** R1 ALLOW (Stage 1 expansion); R2 REVISE (lawyer-coupled); R3 ESCALATE (EU plausibility); R4 ALLOW
**Domain 3 (Accessibility):** A1 ESCALATE (coupled with R3); A2 ALLOW; A3 ALLOW
**Domain 4 (Privacy):** P1 ALLOW (lawyer); P2 REVISE (phased with R17c); P3 ALLOW (informal); P4 ALLOW (lawyer)
**Domain 5 (Observability):** O1 ALLOW; O2 ALLOW; O3 ALLOW
**Domain 6 (Legal entity):** L1 ALLOW (track); L2 ALLOW (track)
**Domain 7 (Insurance):** I1 ALLOW (track); I2 ALLOW (track)
**Domain 8 (Marketplace economics):** M1 ALLOW (track); M2 ALLOW (Stage 4 G6); M3 REVISE (Cowork first); M4 ALLOW (Stage 1 expansion)
**Domain 9 (Onboarding UX):** U1 ALLOW; U2 ALLOW; U3 ALLOW; U4 ALLOW (Stage 3 C7)
**Domain 10 (Anthropic-native):** AN1, AN2, AN3, AN4 — covered by Phase 2.5 Candidates 1, 3+4, 10+11, 15, 16 above

### Four meta-decisions

| # | Question | Election |
|---|---|---|
| Q3 | Stage 1 expansion vs Stage 2 start | **Expand Stage 1; delay Stage 2** |
| Q4 | Lawyer engagement bring-forward | **Bring forward to Stage 1 close** |
| Q6 | Founder-personal-exposure track separation | **Parallel pre-launch track** |
| Q8 | Standing Requirements as permanent PRs | **Adopt SR1-SR5 as PR11-PR15** |

### Triage totals

- **34 Phase 2 amendments triaged + 16 Phase 2.5 candidates triaged + 3 structural Judge Layer + 4 meta-decisions = 57 items.**
- ALLOW: 34 (full or selective)
- REVISE: 9
- BLOCK: 2 (partial; CLAUDE.md + Memory tool for specific surfaces)
- ESCALATE: 12

---

## Status Changes

| Item | Old | New |
|---|---|---|
| /drafts/2026-05-12-staging-plan-amendments.md | did not exist | NEW (~310 lines; Stage 1 expansion + Stage 3 re-scope + Stage 4 gating + Stage 6 strategy + parallel track) |
| /drafts/2026-05-12-manifest-amendments.md | did not exist | NEW (~260 lines; R17 expansion + R18a Character Kernel + AC9-AC13 + CR-### register) |
| /drafts/2026-05-12-project-instruction-amendments.md | did not exist | NEW (~190 lines; PR10-PR16 + AI signals diagnostic-certainty) |
| /drafts/2026-05-12-amendment-adoption-checklist.md | did not exist | NEW (~150 lines; six-move adoption sequence) |
| Adopted staging plan | unchanged | unchanged (amendments are options pending adoption-session move) |
| Manifest | unchanged | unchanged |
| Project instructions | unchanged | unchanged |
| Substrate production | A4 Verified; SUBSTRATE_LAYER2_PREVIOUS_* env vars UNSET; /api/public-key steady state | **unchanged** — no code, no env-var, no production deploy this session |
| Standing protocol cache | unchanged | unchanged (pending cache update at adoption session) |
| Build-sessions protocol cache | unchanged | unchanged (pending cache update at adoption session) |
| Stress-test arc | ST1 complete; ST2 pending | ST1 + ST2 complete; adoption session pending |

---

## Next Session Should

**The next session is the adoption session — the `/drafts/` → `/adopted/` moves for the four ST2 amendment drafts.**

Estimated session duration: **1.5-2 hours** (per `/drafts/2026-05-12-amendment-adoption-checklist.md`).

Tier: governance. Risk: each move is Elevated; session-as-a-whole is Elevated. CCP not engaged (no code; no env vars; documentation only).

**Pre-conditions for the adoption session:**
1. Founder commits ST2 close + four draft files to origin/main (commit command in §"Founder Verification" below)
2. Founder reads the four draft files independently (~60 min total reading time per checklist)
3. Founder elects revisions (if any); communicates at adoption-session open

**Adoption-session sequence (six moves):**
1. Risk-classification correction (Q1 carry-forward; optional; Standard; ~5 min)
2. Staging plan adoption (Elevated; ~20 min)
3. Manifest adoption (Elevated; ~25 min) — includes J1 ADR creation
4. Project-instruction adoption (Elevated; ~20 min)
5. Cache updates (Standard; ~15 min)
6. Parallel pre-launch track artefact creation (Standard; ~10 min)

**Alternatively**, the adoption work may be folded into the next substrate-build session's open (e.g., A5 — Layer 3 server-side service under the amended plan) if scope-compatible. Founder elects.

**Next-session prompt:** `/operations/handoffs/founder/2026-05-12-adoption-session-NEXT-SESSION-PROMPT.md` (drafted at ST2 close).

---

## Blocked On

**Files uncommitted (to be committed by founder before adoption session):**

- `/drafts/2026-05-12-staging-plan-amendments.md` (NEW)
- `/drafts/2026-05-12-manifest-amendments.md` (NEW)
- `/drafts/2026-05-12-project-instruction-amendments.md` (NEW)
- `/drafts/2026-05-12-amendment-adoption-checklist.md` (NEW)
- `/operations/handoffs/founder/2026-05-12-build-plan-stress-test-ST2-close.md` (this file)
- `/operations/handoffs/founder/2026-05-12-adoption-session-NEXT-SESSION-PROMPT.md` (next-session prompt; produced this session)
- `/operations/decision-log.md` (appended with `D-STRESS-TEST-STAGING-PLAN-AMENDMENTS-2026-05-12`)

No other working-tree changes expected from this session.

**Production state at session close:** unchanged. Substrate continues at A4 Verified. All four `SUBSTRATE_LAYER2_PREVIOUS_*` env vars UNSET. `/api/public-key` serves steady-state shape (`previous: null`, `rotation_overlap_until: null`) with `key_id=substrate-layer2-2026Q2`. Vercel state: latest deploy unchanged from 2026-05-10 post-A4-cleanup. No env-var changes; no schema migrations; no auth-surface changes.

---

## Open Questions

**Resolved this session (carry-forward from ST1):**

- Q1 (Risk-classification correction): observation recorded in project-instruction amendments draft; founder elects whether to append correction at adoption session
- Q2 (v2 prompt wording inaccuracy): observation; no standalone action required
- Q3 (Stage 1 expansion vs Stage 2 start): **Expand Stage 1; delay Stage 2**
- Q4 (Lawyer engagement bring-forward): **Bring forward to Stage 1 close**
- Q5 (No current users window expiration): informs Q3 + Q4; no standalone election
- Q6 (Founder-personal-exposure track separation): **Parallel pre-launch track**
- Q7 (Substrate hosting + plugin architecture decisions): resolved via Phase 3 Steps 3 + 4 (hosting ESCALATE wholesale + ALLOW SDK selective; plugin spec ALLOW with REVISE)
- Q8 (Standing Requirements as permanent project-instruction amendment): **Adopt SR1-SR5 as PR11-PR15**

**New open questions surfaced this session:**

1. **Token format for A10 per-agent credentials.** Phase 2.5 + Phase 3 Step 8 Domain 1 S1 elected REVISE pending token-format ADR. Format candidates: JWT (HMAC or asymmetric); W3C Verifiable Credentials; hybrid. **Revisit condition:** A10 sub-stage kickoff; ADR drafted before implementation.
2. **EU customer plausibility decision** (Phase 3 Step 8 Domain 2 R3 + Domain 3 A1 coupled ESCALATE). **Revisit condition:** at lawyer engagement (Stage 1 close).
3. **R20a perimeter potential broadening** with A10 revocation API additions. Each addition is Critical per AC5 + PR6. **Revisit condition:** A10 sub-stage kickoff.
4. **Outcomes pricing cost-aware adoption threshold** (AC13). **Revisit condition:** first Outcomes adoption attempt; verify pricing fits R5 cost session-budget.
5. **Wholesale Managed Agents re-platform** (Phase 3 Step 3). **Revisit conditions:** (a) Vercel infrastructure cost exceeds $200/month; (b) Managed Agents demonstrates production support for synchronous-endpoint workloads at sub-second latency; (c) 2+ peer substrates have published their hosting architecture choices.
6. **Layer 1 Action Proposal Envelope** (Amendment 2C). **Revisit conditions:** external Judge Extender adopter exists, OR Layer 1 schema stable post-K-category migration.
7. **Memory tool cache-pattern simplification** (Candidate 9 ESCALATE). **Revisit condition:** dedicated future governance session comparing Memory tool vs current cache pattern.
8. **Cowork-side connector to `/api/reason`** (for substrate-as-judge dogfooding from this session's environment). **Revisit condition:** Cowork integration scope.

---

## Founder Verification (Between Sessions)

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"

# 1. Confirm the four ST2 draft files + close + next-session prompt exist
ls drafts/2026-05-12-staging-plan-amendments.md
ls drafts/2026-05-12-manifest-amendments.md
ls drafts/2026-05-12-project-instruction-amendments.md
ls drafts/2026-05-12-amendment-adoption-checklist.md
ls operations/handoffs/founder/2026-05-12-build-plan-stress-test-ST2-close.md
ls operations/handoffs/founder/2026-05-12-adoption-session-NEXT-SESSION-PROMPT.md

# 2. Confirm substrate production state — unchanged from ST2 start
curl -s https://www.sagereasoning.com/api/public-key | python3 -c "
import json, sys
d = json.load(sys.stdin)
ok = d.get('previous') is None and d.get('rotation_overlap_until') is None and d.get('algorithm') == 'Ed25519'
print('PASS — substrate steady state preserved (key_id={})'.format(d['key_id']) if ok else 'FAIL — state regression: ' + str({k: d.get(k) for k in ['previous','rotation_overlap_until','algorithm']}))
"

# 3. Read the four draft files (~60 minutes total reading time per checklist)
# Order: staging plan → manifest → project instructions → adoption checklist
```

Expected: all `ls` commands return file paths; curl returns PASS line.

**Session-close commit:**

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add drafts/2026-05-12-staging-plan-amendments.md \
        drafts/2026-05-12-manifest-amendments.md \
        drafts/2026-05-12-project-instruction-amendments.md \
        drafts/2026-05-12-amendment-adoption-checklist.md \
        operations/handoffs/founder/2026-05-12-build-plan-stress-test-ST2-close.md \
        operations/handoffs/founder/2026-05-12-adoption-session-NEXT-SESSION-PROMPT.md \
        operations/decision-log.md
git commit -m "Build-Plan Stress-Test ST2 close + four amendment drafts + adoption-session prompt (2026-05-12)

ST2 (Phase 2.5 + Phase 3 + Phase 4 + Phase 5) complete. Stress-test arc closes
pending adoption session.

57 items triaged in four-outcome framework (ALLOW / REVISE / BLOCK / ESCALATE):
- 34 Phase 2 amendments
- 16 Phase 2.5 candidates
- 3 structural Judge Layer amendments
- 4 meta-decisions

Four draft files produced (all in /drafts/):
- staging-plan-amendments (Stage 1 expansion A10-A19; Stage 3 re-scope on
  Anthropic Plugin spec + MCP; Stage 4 G4 gating expansion; Stage 6 multi-
  marketplace strategy; parallel pre-launch founder-personal-exposure track)
- manifest-amendments (R17g/h/i SAR + rectification + portability;
  R18a Character Kernel + Article 50 placeholder; AC9-AC13 new constraints;
  CR-### register populated with 8 binding obligations)
- project-instruction-amendments (PR10 PEV loop; PR11-PR15 SR1-SR4 promoted;
  PR16 SR5 positioning + dogfood lens; AI signals diagnostic-certainty)
- amendment-adoption-checklist (six-move adoption sequence; risk per move)

Substrate category label: Character Kernel (J1 ADR drafted; substrate-as-judge
manual mechanism walkthrough no-objection).

Decision-log entry appended:
- D-STRESS-TEST-STAGING-PLAN-AMENDMENTS-2026-05-12

Production state: unchanged. Substrate at A4 Verified;
SUBSTRATE_LAYER2_PREVIOUS_* env vars UNSET; /api/public-key serves
steady-state shape; key_id=substrate-layer2-2026Q2.

No /adopted/ changes. No manifest amendments adopted. No project-
instruction amendments adopted. No code changes. All amendments remain
in /drafts/ pending adoption session.

Next session: adoption session — six moves per
/drafts/2026-05-12-amendment-adoption-checklist.md. Or fold into
A5 session-open if scope-compatible. Prompt at
/operations/handoffs/founder/2026-05-12-adoption-session-NEXT-SESSION-PROMPT.md."
```

Then push via GitHub Desktop. This commit only touches `/drafts/` + `/operations/` paths; Vercel will not redeploy.

---

## Verification Method Used (0c Framework)

Per project-instructions 0c verification framework, work-type-by-work-type:

- **Manifest changes** (drafts only this session): founder reads draft files directly between sessions; no AI verification needed pre-adoption.
- **Staging-plan changes** (drafts only): same — founder reads.
- **Project-instruction changes** (drafts only): same — founder reads.
- **Decision-log entry**: founder reads the appended entry directly at adoption-session open.
- **Triage decisions** (57 items): each elected by founder via AskUserQuestion call in Phase 3; record preserved in chat transcript + summarised in this close.

No code; no API endpoints; no database changes; no governance implementations this session.

---

## Risk Classification Record (0d-ii)

Per project-instructions 0d-ii, this session's changes classified:

| Change | Classification |
|---|---|
| Four `/drafts/` files (this session) | **Standard** — drafting documents in `/drafts/` is Standard per standing protocol cache risk table |
| ST2 close note (this file) | **Standard** — handoff documentation |
| Decision-log entry (D-STRESS-TEST-STAGING-PLAN-AMENDMENTS-2026-05-12) | **Standard** — decision-log entry |
| Next-session prompt | **Standard** — handoff documentation |
| Session-as-a-whole risk class | **Elevated** — amendments queued for `/adopted/` move (each move would be Elevated at adoption session); no Critical surface touched |

CCP NOT engaged this session (no code; no env vars; documentation only).
AC7 NOT engaged (no auth surface; no session management; no encryption surface; no R20a perimeter).
PR6 NOT engaged (no safety-critical functions touched).

---

## PR5 — Knowledge-Gap Carry-Forward

Concepts re-explained or referenced this session:

- **KG2 — Haiku reliability boundary**: referenced (Phase 2.5 Candidate 13 governance task at next quarterly review). Re-explanation count: 0 (referenced not re-explained).
- **KG1 — Vercel five rules**: referenced (Phase 2 Domain 5 O1 cross-cuts with O2 cost telemetry; instrumentation must respect KG1 rule 2 no-fire-and-forget). Re-explanation count: 0.
- **OpenBrain Judge Extender contract**: novel concept introduced via inbox synthesis Theme A + "peers we have" file. **Promoted to permanent Knowledge-Gaps Register entry** via PR5 (pre-population from structured extraction pass per amended PR5; ST2 is a structured triage pass over the stress-test inputs).
- **Five-MCP routine**: novel concept introduced via inbox "claude on track" file. **Promoted to permanent Knowledge-Gaps Register entry** as the operational pairing for SR1, SR4 (now PR11, PR15).

**Action at adoption session:** update `/operations/knowledge-gaps.md` with two new entries (Judge Extender contract; 5-MCP routine) per PR5 pre-population authorisation.

---

## Dogfood-discipline check on this close

Per ST2 prompt foundational principle 4 (every ST2 output testable as a Judgment + Continuity primitive):

- **Clear:** plain-language summary at top; four-outcome vocabulary used throughout; cross-references named.
- **Well-formed:** sections per full-form Critical-tier template; markdown structure consistent.
- **Versioned:** dated; supersedes prior intermediate handoff; predecessor + successor named.
- **Signed by decision-log entry:** `D-STRESS-TEST-STAGING-PLAN-AMENDMENTS-2026-05-12` cross-references this close + all four amendment drafts.
- **Provenance-labelled:** §"Decisions Made" carries `(four-outcome vocabulary)` label; substrate consultation framed as `simulating substrate logic` not `using substrate`.
- **Consumable by future sessions:** §"Next Session Should" names the adoption session path; §"Open Questions" carries forward with revisit conditions.

**Gap identified by the dogfood check:** the four amendment-draft files do not yet carry provenance tags per AC10 (Amendment 2B). This is acceptable in `/drafts/`; adoption session's manifest update incorporates AC10 such that future Layer 2 output AND future decision-log entries carry tags. Existing prose entries are not retrofitted (per Amendment 2B REVISE election: Layer 2 outputs first, decision log later).

---

## Cross-references

- Operative session prompt: `/operations/handoffs/founder/2026-05-12-build-plan-stress-test-ST2-NEXT-SESSION-PROMPT.md` (the prompt the session was scoped against — see v2 prompt + ST1 close for predecessor context)
- ST1 close: `/operations/handoffs/founder/2026-05-12-build-plan-stress-test-ST1-close.md`
- v2 prompt (historical): `/operations/handoffs/founder/2026-05-10-build-plan-stress-test-NEXT-SESSION-PROMPT-v2.md`
- ST1 primary output (drove ST2): `/drafts/2026-05-12-phase-2-gap-analysis.md`
- Predecessor full-day close: `/operations/handoffs/founder/2026-05-10-full-day-close.md`
- Three ST1 prep documents (in `/drafts/`):
  - `/drafts/security-audit-build-plan-vs-agentic-security-strategies-2026-05-10.md`
  - `/drafts/anthropic-features-survey-2026-05-10.md`
  - `/drafts/inbox-research-synthesis-2026-05-10.md`
- ST2 outputs (this session):
  - `/drafts/2026-05-12-staging-plan-amendments.md`
  - `/drafts/2026-05-12-manifest-amendments.md`
  - `/drafts/2026-05-12-project-instruction-amendments.md`
  - `/drafts/2026-05-12-amendment-adoption-checklist.md`
  - This close note
  - `/operations/handoffs/founder/2026-05-12-adoption-session-NEXT-SESSION-PROMPT.md`
- Adopted staging plan: `/adopted/substrate-plugin-staging-plan.md`
- Standing protocol cache: `/adopted/standing-protocol-cache.md`
- Build-sessions protocol cache: `/adopted/build-sessions-protocol-cache.md`
- Manifest: `/manifest.md`
- Decision log: `/operations/decision-log.md` (entry `D-STRESS-TEST-STAGING-PLAN-AMENDMENTS-2026-05-12` appended)
- Inbox files informing Phase 2.5 (in `/inbox/`):
  - `claude on track.txt` (5-MCP routine)
  - `peers we have.txt` (substrate category candidates)
  - `vibe coding debugging problem link.txt` (PEV loop pattern)

*End of ST2 close. Stress-test arc complete pending adoption session. 57 items triaged; four draft files produced; substrate production unchanged. Founder elects adoption-session scope at next-session-open.*
