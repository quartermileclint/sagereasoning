# Next-Session Prompt — Agentic-Commerce Upstream Re-Work + Downstream Order

**Stream:** founder.
**Tier:** governance — **Elevated** risk for the J1 ADR amendment (amending an Adopted strategic document); Standard for the A10 staging-plan note and the recommended-order document. Lean templates + Elevated additions per `/adopted/standing-protocol-cache.md`.
**Governing frame:** `/adopted/standing-protocol-cache.md` (PR11 authoritative-current-sources; PR13 consider-implications; preserve-prior-versions discipline per project instructions §0e).
**Predecessor close:** `/operations/handoffs/founder/2026-05-12-agentic-commerce-inbox-synthesis-close.md`.
**Predecessor decision-log entries:** `D-A5-LAYER3-SCAFFOLDED-VERIFIED-2026-05-12` (most recent substrate-build entry); `D-MANIFEST-AMENDED-FROM-ST2-2026-05-12` (AC9 + AC10 + AC11 cross-references); `D-STAGING-PLAN-AMENDED-FROM-ST2-2026-05-12` (A10 staging context); `D-PROJECT-INSTRUCTIONS-AMENDED-FROM-ST2-2026-05-12` (PR11 + PR13 applied this session).
**Risk classification:** **Elevated** (J1 ADR amendment) + **Standard** (A10 note; recommended-order document). Critical Change Protocol NOT engaged (no code; no auth; no env-vars). AC7 NOT engaged. PR6 NOT engaged. Preserve-prior-versions discipline applies to the J1 amendment per founder preference + project instructions §0e.

## Why this session matters

The 2026-05-12 inbox synthesis close identified two clean amendment opportunities to upstream governance documents — both improve downstream defensibility at low cost. The J1 ADR's peer-category landscape predates the May-8 article that explicitly identifies SageReasoning's Character Kernel position relative to the agentic-commerce stack (ACP / UCP / AP2 / MPP / AgentCore Payments). The A10 staging-plan entry's token-format candidates list predates the AP2 mandate concept, which is the candidate most directly engineered for "agent acted later under constraints with scoped credential" — A10's exact design intent.

Beyond the two amendments, four forward-looking findings need a forward-looking artefact specifying when each folds into its natural downstream session: FPE-5 liability scope expansion; Stage 4 G3 positioning vector; A5 retrospective mandate-producer framing; AC10 / AP2 alignment cross-reference. Without that artefact, the findings risk getting lost in the inbox-close-note bedrock and re-discovered later at material cost.

After this session, the A7 R20a gate scaffolding prompt (already drafted; `/operations/handoffs/founder/2026-05-12-A7-r20a-gate-NEXT-SESSION-PROMPT.md`) becomes the natural next step. The A7 prompt does NOT require amendment in light of these findings.

## Pre-conditions

1. Predecessor close (`2026-05-12-agentic-commerce-inbox-synthesis-close.md`) and this prompt both committed + pushed to origin/main.
2. Founder has read the predecessor close before the session begins.
3. Founder commits to a bounded ~1.5-2 hour session.
4. A5 still Verified (no regression since 2026-05-12 A5 close).
5. Production state unchanged from A5 close (`SUBSTRATE_LAYER3_ENABLED` UNSET; substrate steady state preserved).

## Part A — Open under the protocol

Read in order:

1. **`/adopted/standing-protocol-cache.md`** (~3 min) — tier; signals; risk classification; preserve-prior-versions discipline; cache-update guidance (this session does NOT update either cache — neither is affected by the amendments).
2. **`/operations/handoffs/founder/2026-05-12-agentic-commerce-inbox-synthesis-close.md`** (~5 min) — predecessor close; the findings being operationalised this session.
3. **`/adopted/adr/2026-05-12-substrate-category-character-kernel.md`** (~5 min) — J1 ADR; target of amendment. Read in full to understand the existing peer-category landscape that's being extended.
4. **`/adopted/substrate-plugin-staging-plan.md`** §"Stage 1 — Existing items A1-A9" + §"A10" (~5 min) — A10 entry; target of single-line note.
5. **Skim `/inbox/acp.rtf` + `/inbox/20260508-104-promptkit-1.md`** (~5 min) — source material to cite in the J1 amendment + A10 note.

**Confirm at session open** (state explicitly, briefly):

- Tier: governance / Elevated for J1; Standard for A10 + recommended-order.
- Hold-point status: P0 0h active.
- Model selection: N/A (no LLM calls this session).
- Status vocabulary: implementation taxonomy not engaged (no code); decision taxonomy `Adopted` applies to the amendment entries.
- Signals + risk: Elevated for J1 amendment; preserve-prior-versions discipline engaged.
- **PR11 inbox scan**: completed at predecessor session; no new files since then.
- **PR13 consider-implications**: re-state the implications stated in the predecessor close.
- **PR16 positioning + dogfood lens**: the J1 amendment strengthens Character Kernel positioning explicitly; the recommended-order document is a substrate-of-our-own-work artefact (dogfood-aligned governance discipline).

## Part B — Procedure

### Step 1 — Surface J1 amendment scope options for founder election

Surface three scope options for the J1 amendment. Use AskUserQuestion. Each option produces a different size of change.

- **Option (a) Minimal.** Add ACP / UCP / AP2 / MPP / AgentCore Payments to the existing peer-category landscape bullet list in the J1 ADR §"Context" section. One sentence per protocol naming what layer it owns. Preserves the current ADR shape; smallest diff. ~10-15 lines added.

- **Option (b) Standard (recommended).** Option (a) PLUS a new sub-section in §"Context" titled "Agentic-commerce-stack adjacency" positioning Character Kernel as "upstream of commerce; the judgment primitive that informs commerce action but is not itself in the commerce stack." Names the six-layer responsibility framework (discovery / authorization / payment credential / settlement / merchant relationship / governance) and identifies which layers Character Kernel touches (judgment input into authorization; no direct touch of payment credential / settlement / merchant relationship; informs governance via R0 oikeiosis + R18 honest certification). ~30-50 lines added.

- **Option (c) Maximal.** Option (b) PLUS a §"Stage 4 G3 marketplace listing copy implications" sub-section drafting positioning language for the future marketplace listing copy. Pushes Stage 4 G3 work earlier (lower-risk because copy is governance not code). ~60-80 lines added.

Founder elects. Default-recommend Option (b) — captures the architectural validation without pre-committing Stage 4 G3 copy.

### Step 2 — Apply J1 ADR amendment (Elevated)

Per founder preference + project instructions §0e: preserve previous version before changes.

1. Copy current J1 ADR to `/archive/2026-05-12-substrate-category-character-kernel-pre-agentic-commerce.md` (verbatim copy; preserves the pre-amendment state).
2. Apply the elected amendment scope to `/adopted/adr/2026-05-12-substrate-category-character-kernel.md`:
   - Update header `Status:` line to `Adopted 2026-05-12; Amended 2026-05-12 under D-AGENTIC-COMMERCE-UPSTREAM-REWORK-2026-05-12 (peer-category landscape extension)`.
   - Add the elected content to §"Context" (new bullets to existing peer-category list; new sub-section after the existing peer-category paragraphs).
   - Update §"Cross-references" to add the inbox synthesis close + the relevant inbox files.
3. **Founder approval required before commit.** Show the diff (or a summary of the additions); explicit "OK" before the file is finalised.

If the founder reclassifies upward ("treat this as critical") at any point, full Critical Change Protocol applies. Default Elevated is appropriate because: amendment is documentation only; no code; no auth surface; the amended document remains the same artefact governing the same decision; the amendment extends the analysis rather than reversing the decision.

### Step 3 — Apply A10 staging-plan note (Standard)

Single surgical addition to `/adopted/substrate-plugin-staging-plan.md` §"Stage 1" — A10 item. The existing token-format candidates line reads:

> "Token format ADR drafted before implementation. Candidate formats: JWT (HMAC or asymmetric); W3C Verifiable Credentials; hybrid."

Amend to:

> "Token format ADR drafted before implementation. Candidate formats: JWT (HMAC or asymmetric); W3C Verifiable Credentials; AP2-style mandate (Google's spec for agent authorization records — scope + constraints + proof of approval; per the 2026-05-12 agentic-commerce inbox synthesis close); hybrid."

No version preservation needed — the staging plan is amended frequently; the full pre-ST2 + ST2-amendment versions are preserved in `/archive/2026-05-12-staging-plan-amendments-source-of-amendment.md`. The amendment trail lives in the decision log.

**Founder approval required before commit** (one-line change; founder sees the exact before/after diff).

### Step 4 — Produce the recommended-order document

Create new file `/operations/agentic-commerce-findings-downstream-order.md`. Standard-risk governance artefact. Lives alongside `/operations/knowledge-gaps.md` and `/operations/parallel-track-fpe-status.md`.

Structure:

```
# Agentic-Commerce Findings — Downstream Order

Provenance: /operations/handoffs/founder/2026-05-12-agentic-commerce-inbox-synthesis-close.md

For each forward-looking finding from the 2026-05-12 inbox synthesis, this
document specifies the target session, trigger condition, and one-sentence
action instruction. Future sessions PR11-inbox-scan this file to pick up
findings relevant to their scope.

## Findings

### F1 — FPE-5 (TOS + liability) scope expansion
- Target session: FPE-5 drafting session (parallel pre-launch track; before Stage 1 close lawyer engagement)
- Trigger: when FPE-5 is scheduled OR when the lawyer engagement brief is being prepared
- Action: add a sub-bullet to FPE-5's scope specifying "liability allocation when an agent uses substrate output to inform a commercial decision; reference AP2 mandate + ACP merchant-of-record allocation conventions"
- Cross-reference: /operations/parallel-track-fpe-status.md

### F2 — Stage 4 G3 marketplace listing copy positioning vector
- Target session: Stage 4 G3 marketplace listing copy drafting session
- Trigger: when Stage 4 G3 is scheduled (post-Stage-1-close; post-licensing-gate)
- Action: incorporate "upstream of commerce; judgment primitive that informs commerce action" framing; position Character Kernel as complementary to ACP / UCP / AP2 / MPP / AgentCore — not competing
- Cross-reference: J1 ADR amended 2026-05-12 (this session); /adopted/substrate-plugin-staging-plan.md §Stage 4 G3

### F3 — A5 retrospective mandate-producer framing
- Target session: next session that references A5 (likely A6 prose_mode templates OR A7 R20a gate)
- Trigger: any session whose Part A read sequence includes the A5 close or A5 service file
- Action: note in the session's open + decision-log entry that A5's Layer3Response shape is structurally a substrate-consultation-mandate producer (R3 + R19c + R19d + R20a + R18a + R18e injections + AC9/AC10/AC11 projections = AP2-style mandate-output shape)
- Cross-reference: /website/src/lib/substrate/layer3-service.ts; D-A5-LAYER3-SCAFFOLDED-VERIFIED-2026-05-12

### F4 — AC10 / AP2 mandate alignment cross-reference
- Target session: A12 (OpenTelemetry GenAI instrumentation) — the session where AC10 first gets implemented
- Trigger: A12 session-open
- Action: add cross-reference in AC10's manifest entry naming AP2 mandate alignment as external validation; producer at A12 should emit `provenance` + `use_policies` in the shape compatible with downstream AP2-consuming agents
- Cross-reference: /manifest.md §AC10; /adopted/substrate-plugin-staging-plan.md §A12

## Recommended order of downstream work (post-this-session)

This is the recommended sequencing for the next ~10 substrate-build sessions,
with the four forward-looking findings folded into their natural sessions.
The founder elects at each session-open; this is a recommendation, not a
prescription.

1. **A7 — R20a server-side gate scaffolding** (Critical; ~3-4h)
   Existing prompt: /operations/handoffs/founder/2026-05-12-A7-r20a-gate-NEXT-SESSION-PROMPT.md.
   Findings folded: F3 (note A5 retrospective at session-open; minor inline reference in the decision-log entry).

2. **A6 — prose_mode per-mode templates** (Standard; ~2-3h) OR
   **A10 — per-agent credentials kickoff + token-format ADR** (Critical; ~3-4h, token-format ADR drafted in-session)
   Founder elects after A7. A10 is now the highest-leverage Critical item — its token-format ADR consumes the AP2 candidate added at Step 3 of this session.
   Findings folded: F4 partial (AC10 alignment is named in A10's credential design); F3 if A6 is elected (A5 retrospective in A6's session-open).

3. **FPE-1 + FPE-2** (parallel track; lawyer + accountant engagements) — may already be in progress per the adoption-session close
   Findings folded: not yet — FPE-5 timing.

4. **A11a — Audits (endpoint-auth inventory + JSON-key SQL audit)** (Standard; ~1h).

5. **A11b — Prompt-injection defence at Layer 1 + Layer 3** (Critical; ~2h).

6. **A12 — OpenTelemetry GenAI semantic conventions** (Elevated; ~1-2h)
   Findings folded: F4 (AC10 / AP2 alignment cross-reference applied in-session).

7. **A13 — R5 cost-as-health-metric alerts** (Elevated; ~1h).

8. **FPE-5 — TOS + liability** (parallel track; lawyer-coupled)
   Findings folded: F1 (liability allocation sub-bullet added in-session).

9. **A9 + J6** (cost monitoring on new path + R5 impact assessment) (Elevated/Standard; ~1-2h).

10. **A8 + K1** (V3 endpoint relationship design + bundled-prose consumer inventory) (Standard; ~1-2h).

11. **A14 — SLOs + error-budget discipline** (Standard governance + Elevated implementation; ~1-2h).

12. **A15a-d — R17 expansion (SAR + rectification + portability)** (Critical x 4; ~5h total).

13. **A16 + A17** (privacy + regulatory governance passes) (Standard; lawyer-coupled; ~4h total).

14. **A18a-e** (onboarding + limitations governance pass) (mixed; ~3-4h total).

15. **A19 — Abuse-detection + rate-limiting** (Elevated; ~1-2h).

16. **Stage 1 close gating step** — lawyer engagement complete; EU customer plausibility decision; all A10-A19 Verified.

17. **Stage 2 — K-category migration** begins (delayed-start per ST2; gated on A10 Verified + Stage 1 close).
   ...

18. **Stage 4 G3 — marketplace listing copy** (when Stage 4 begins post-licensing-gate)
   Findings folded: F2 (positioning vector applied in-session).

## How to use this document

At any future session-open, the AI's PR11 inbox-scan reads this file (in
addition to /inbox/). Findings whose target session matches the day's scope
get folded in at the named action point. Findings whose trigger condition
hasn't fired stay pending. When all four findings have been folded into their
target sessions, this document is moved to /archive/.

Cross-reference: /operations/handoffs/founder/2026-05-12-agentic-commerce-inbox-synthesis-close.md (provenance for these findings).
```

Founder approval required before this file is created — but it's a NEW file (no preserve-prior-versions discipline; one-shot review).

### Step 5 — Append decision-log entry (lean form; one combined entry)

Entry ID: `D-AGENTIC-COMMERCE-UPSTREAM-REWORK-2026-05-12`.

Lean-form template per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". Covers:

- **Decision** (one paragraph): three changes adopted this session — J1 ADR amendment (peer-category landscape extension per Option [founder-elected]); A10 staging-plan candidates-list addition (AP2-style mandate added as fourth candidate); new operations artefact `/operations/agentic-commerce-findings-downstream-order.md` recording four forward-looking findings with target sessions.
- **Reasoning** (1-2 sentences): per the 2026-05-12 inbox synthesis close findings; PR11 inbox scan + PR13 consider-implications surfaced gaps in upstream governance documents that low-cost amendments close; recommended-order artefact prevents downstream re-discovery cost.
- **Files touched** (paths + one-line each):
  - `/adopted/adr/2026-05-12-substrate-category-character-kernel.md` — amended in place.
  - `/archive/2026-05-12-substrate-category-character-kernel-pre-agentic-commerce.md` — NEW; preserves pre-amendment J1 state.
  - `/adopted/substrate-plugin-staging-plan.md` — surgical addition to A10 candidates line.
  - `/operations/agentic-commerce-findings-downstream-order.md` — NEW.
  - `/operations/decision-log.md` — this entry appended.
  - `/operations/handoffs/founder/YYYY-MM-DD-agentic-commerce-upstream-rework-close.md` — lean-form session close.
- **Risk classification:** Elevated for J1 amendment (amending Adopted strategic document); Standard for A10 + recommended-order. CCP NOT engaged (no code; no auth; no env). AC7 NOT engaged. PR6 NOT engaged. Preserve-prior-versions discipline satisfied (J1 archived pre-amendment).
- **Rollback path:** `git revert <session-commit>`. Restores J1 ADR + staging plan + deletes the new recommended-order artefact. Pre-amendment J1 is also preserved at the archived path.
- **Verification step (founder-performable):**
  ```
  grep -c "ACP\|UCP\|AP2\|AgentCore" adopted/adr/2026-05-12-substrate-category-character-kernel.md
  # Expected: >= 4 (one per protocol named in the amendment)
  grep -c "AP2-style mandate" adopted/substrate-plugin-staging-plan.md
  # Expected: >= 1
  ls operations/agentic-commerce-findings-downstream-order.md
  # Expected: file exists
  ls archive/2026-05-12-substrate-category-character-kernel-pre-agentic-commerce.md
  # Expected: file exists
  ```
- **Open questions:** none new.
- **Rules served:** R18a (Character Kernel positioning strengthened); PR11 (inbox scan operationalised); PR13 (consider-implications applied); 0e (file organisation — preserve-prior-versions for J1).
- **Status:** Adopted. Cross-references: predecessor `D-A5-LAYER3-SCAFFOLDED-VERIFIED-2026-05-12`; inbox synthesis close `/operations/handoffs/founder/2026-05-12-agentic-commerce-inbox-synthesis-close.md`; J1 ADR amended; staging plan amended; new operations artefact.

### Step 6 — Session close (lean form)

Path: `/operations/handoffs/founder/YYYY-MM-DD-agentic-commerce-upstream-rework-close.md`. Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close". Include: Decisions Made (one entry — D-AGENTIC-COMMERCE-UPSTREAM-REWORK); Status Changes (J1 amended; staging plan amended; new operations artefact); Next Session Should (A7 R20a gate per existing prompt — OR founder may elect A10 first to consume the AP2 mandate candidate that just got added; recommend A7 for critical-chain continuity); Blocked On; Open Questions (none new); Founder Verification (commit command). Cross-references back to the inbox synthesis close + this prompt.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + J1 ADR + staging plan + inbox skim (Part A) | 20-25 min |
| Session-open confirmation + signals stated | 5 min |
| Step 1 — Surface J1 amendment scope options; founder elects | 5-10 min |
| Step 2 — Apply J1 ADR amendment (preserve prior version; founder approval before commit) | 20-30 min |
| Step 3 — Apply A10 staging-plan note (founder approval before commit) | 5-10 min |
| Step 4 — Produce recommended-order document | 15-25 min |
| Step 5 — Decision-log entry (lean form) | 10-15 min |
| Step 6 — Session close (lean form) | 10-15 min |
| **Total** | **~1.5-2 hours** |

## Rollback path

This session's work is three governance changes (one Elevated, two Standard) plus a lean decision-log entry plus a lean session close. Rollback steps:

1. **Code rollback:** `git revert <session-commit>`. Restores J1 ADR, staging plan, and removes the new operations artefact.
2. **No env-var changes** this session.
3. **No code changes** this session.
4. **No auth surface changes** this session.
5. **No schema changes** this session.
6. **Pre-amendment J1 preserved** at `/archive/2026-05-12-substrate-category-character-kernel-pre-agentic-commerce.md` regardless of rollback — if a future session decides to revisit the amendment, the pre-amendment state is independently recoverable.

## Forecast

Successful upstream re-work session produces:

- J1 ADR amended with agentic-commerce-stack peer-category landscape (per founder-elected scope)
- A10 staging-plan candidates table includes AP2-style mandate as fourth token-format candidate
- `/operations/agentic-commerce-findings-downstream-order.md` exists with four findings + recommended downstream session order
- Pre-amendment J1 preserved in `/archive/`
- Decision-log entry `D-AGENTIC-COMMERCE-UPSTREAM-REWORK-2026-05-12` appended
- Production state unchanged

**Next session after this:** A7 R20a gate scaffolding per the existing prompt `/operations/handoffs/founder/2026-05-12-A7-r20a-gate-NEXT-SESSION-PROMPT.md`. Founder may alternatively elect A10 first to consume the AP2 mandate candidate that just got added — Stage 1 sequencing per the staging plan has A10 depending on A5 Verified (which is now satisfied), so either order works. Recommendation: A7 first per the indicative session-9 packaging, then A10 — but the founder's call.

End of prompt.
