# Recommended Actions and Priorities — from the 2026-06-10 Multidisciplinary Review

**Status:** All items **Under review** until the founder elects them. Nothing here was executed in the review session (read-only review; no code, flag, schema, or governing-document change). Items are framed as options with reasoning per founder preferences — the founder decides direction and scope.
**Source findings:** `/operations/reviews/2026-06-10-multidisciplinary-review.md` (section references below).
**PR16 lens** (positioning impact / dogfood relevance) is marked per item where meaningful.

---

## Tier 1 — Now (this week): the critical path unchanged

**1.1 Run S7b — deploy A13 delivery + A14 tracker.** *(Critical; founder-performed, walked live per PR17; ~45–60 min)*
The queued prompt `/operations/handoffs/founder/2026-06-09-prelaunch-S7b-deploy-NEXT-SESSION-PROMPT.md` is correct and current — this review re-verified its premises today (S7 build present + uncommitted; cron/slo routes 404 in production; evaluator auth answering). Until S7b runs, cost/abuse signals are detect-only with no delivery. **This review found no reason to change the S7b plan and one reason to hurry it** (observability completes the pre-exposure bar).
*Ride-along fills proposed for S7b (Standard, AI-doable, founder approves each):* see 1.2–1.4 — they fit the completion plan's session-packing principle without touching the Critical spine.

**1.2 Refresh the CLAUDE.md production-state block** *(Standard; 10 min; ride S7b)*
It still lists A10, A11b, and the two A19 structural detectors as inert — all Live since S4/S5 (§3.12). Until fixed, every session opens on wrong state. The next-session prompt neutralizes this in the interim by stating verified truth inline. After S7b's deploy, the block should also gain A13-delivery/A14 lines, dated.
*PR16: positioning neutral; drift fix strengthens every future session.*

**1.3 README honesty fixes** *(Standard; 15 min; ride S7b or S8)*
Remove "world's leading reference" (R19b), the 0–100 scoring sentence (R6c), and the /hiring + /therapy rows (404 today); re-date the status section. The repo's front door currently contradicts the manifest's honesty rules — cheap to fix, matters if the repo is ever shown to the lawyer, a collaborator, or an investor.
*PR16: strengthens Character Kernel positioning (honesty is the brand).*

**1.4 Complete `.env.example`** *(Standard; 20 min; ride S7b or S8)*
Document all ~50 env vars the code reads (names + purpose + flag-vs-secret-vs-config; values only for non-secrets). Today it covers ~6. For a solo founder this is disaster-recovery documentation: if Vercel env were lost, no complete reference exists. The review's codebase sweep (agent report, §2) contains the full list to paste from.

**1.5 Start the FPE clock — incorporation + insurance, in parallel, now** *(Founder-performed; wall-clock)*
FPE-1 (Pty Ltd) and FPE-3 (professional-indemnity/cyber quote) have multi-week lead times independent of build pace, and FPE-1's outcome changes privacy-policy wording and the Stripe account. Nothing in S7b/S8 blocks starting them today. Recommend: a 30-minute founder errand this week — engage an incorporation service (or accountant) and request one insurance quote. The AI can prepare both briefs in any session (Standard fill).

---

## Tier 2 — Next (1–2 sessions): close 0h

**2.1 Run S8 — but consider splitting it.** *(The 0h exit session)*
As scoped, S8 carries: one human + one agent end-to-end production use case, the honest capability inventory, the registry reconcile (191 components, 39 days stale), the R18/limitations placeholder pass, and the pre-lawyer readiness statement. That is heavy for one session (§3.11). **Option A (recommended):** S8a = the two e2e use cases + capability inventory + readiness statement (the founder-confidence spine); S8b = registry reconcile via the `sage-registry-update` skill + R18 public-materials pass (AI-heavy). **Option B:** run as one dense session and accept spillover. Founder's call at S8 open.
*Dogfood relevance (PR16): the S8 human use case can itself be a real founder decision run through /api/reason — substrate-consultable; offer stands.*

**2.2 Close the Zone-2 calibration audit loop** *(Standard prep + founder-run eval; can ride S8)*
The 18-April audit file still reads "PARTIAL — LLM stage untested" (§3.11). Later live verifications proved the acute path; the six-domain Zone-2 calibration was never formally completed. Action: AI prepares an eval run from `r20a-classifier-eval.ts` against the six AC3 domains; founder runs it (real API key, ~$0.10); file the follow-up audit and close the 51-day-open safety record. PR6 posture: this is verification, not change — no perimeter code is touched.

**2.3 Founder decisions to take at S8 open** *(each one line, recorded per PR7)*
a) `/api/score-conversation` — inside or outside the R20a perimeter? (Human-authenticated free-text route currently outside AC5's eight; adding a ninth is Critical under PR6/AC5.)
b) `/api/founder/hub` — wire the distress check its comment references, or delete the comment.
c) The two practice-name H1 renames (carried since A18e).
d) Re-affirm stream concentration (all work through founder stream) as a conscious choice; mothball the support-inbox pipeline explicitly or schedule its run-loop caller post-launch.

---

## Tier 3 — Immediately after S8: the lawyer + the business plan

**3.1 Engage the lawyer the week S8 closes.** *(Founder; wall-clock; Art-50 applies 2026-08-02)*
The packet is ready: LRQ-1/2/3/5/7 + FPE-5, DPIA, sub-processor register, Art-50 posture, ISO map, reconciled register, live honest drafts. S8's readiness statement is the cover note. Waiting longer consumes the ~7.5-week Art-50 runway (§3.2). Budget guidance is already in the LRQ.

**3.2 Rebuild P1 inputs before running P1.** *(2–3 AI-heavy sessions, founder reviews)*
Every /business document predates the pivot (§3.12): per-call $0.0025 economics vs adopted $0.02/loop Option D; no Character Kernel; no Cowork-first strategy; no Pty-Ltd cost base; no agent-market sizing; no translation-sandwich double-LLM cost model. Producing a current business plan + break-even + investment case from S8's tested-product evidence is the precondition for an honest P1 affirm/reject. PR11 inputs to fold in: the June-15 Anthropic credit-pool change (third-party agents sanctioned under $20–$200/mo caps — mildly strengthens the agent-consumer thesis; also watch the founder's own Cowork/Code costs under R5).
*PR16: directly positioning-relevant; the investment case is where Character Kernel either earns its keep or is revised.*

**3.3 Resolve the Stripe launch-criterion tension at P1.** *(Founder decision, PR7-recorded)*
Launch criterion 2 says Stripe pre-launch; the completion plan and current state (verified `not_configured`) treat activation as triggered by the first paying consumer. Either amend the criterion (recommended — consistent with "billing mechanism proven, activation on demand") or schedule a Stripe activation session before launch. Decide once, on the record.

---

## Tier 4 — Post-S8 / post-launch queue (recorded so nothing is lost)

| Item | Class | Trigger / note |
|---|---|---|
| npm vulnerability remediation (3 moderate, 10 high) | Elevated, own session | Before external exposure; never `--force` casually |
| `supabase-server.ts` lazy-client fix | Elevated, own step | Removes the `--env-file` test friction; before/after test-run comparison |
| `/api/user/export` shared-helper consolidation | Elevated, own step | Carried from S5; before/after export comparison |
| CI for the pure test suite (GitHub Actions) | Standard | PR15-consistent (platform-native); pure tests need no secrets |
| Per-install metering/quota enforcement | Critical | First paid agent onboard (carried decision) |
| A19 enforcement (beyond detection) | Critical | Before/at first real external exposure |
| MENTOR_ENCRYPTION_KEY rotation mechanism | Critical | Post-launch; version field already present |
| Retention schedule + breach-response runbook drafts | Standard | Cheap now, lawyer will ask anyway (ISO map gaps) |
| Mentor/support/ops stream revival or formal mothball | Governance | Founder choice (2.3d) |
| Trace backend (beyond Vercel logs) | Standard | When real traffic exists |
| `/api/health` cache-control check | Cosmetic | Stale timestamp observed (diagnostic-uncertain, symptom level) |
| Root-folder archive sweep (stale prompts, rtf, lock files, backups) | Standard | Any session's fill; preserves to /archive per 0e |
| INDEX.md dead-pointer fix + PROJECT_STATE/tech-guide disposition | Standard | Either retire-to-archive with pointers to live surfaces, or refresh — founder picks the model |
| tech-known-issues.md refresh | Standard | Fold the May–June known issues in |
| Annotate 3 stale "Under review" decision-log statuses | Governance | Dated annotation lines only; append-only respected |
| C-4 conflict fix (sage-reflect "no stage optional" vs R18f/R19e) | Governance | Awaiting founder approval since data-room review |
| M-6 aggregate-faithfulness + external R18d adversarial review | Critical / external | P3, pre-badge-launch |
| AC1 model-table review (new Fable/Mythos tier) | Governance | Fold into quarterly compliance review 2026-07-06 |

---

## Process-rule candidate (PR8 third-recurrence promotion — founder elects)

**Candidate PR18 — Production-state blocks are close-time artifacts.** Any "production state" summary (CLAUDE.md block, plan tables, close blocks) is rewritten only at session close, only from (a) the decision log and (b) that session's verified observations, and always carries its as-of date. Mid-session documents state flag dispositions only by citing a dated decision-log entry. *Recurrences cited:* 2026-06-07 completion-plan table (corrected at S6); S3–S5 close blocks (corrected at S6); CLAUDE.md post-S5 (found stale again 2026-06-10, this review). Three strikes under PR8 → promotion is due; text above is the proposal.

---

## Suggested sequence (one line)

**S7b (deploy + 1.2–1.4 fills) → S8a (e2e + inventory + readiness) → S8b (registry + R18 pass) → lawyer engaged + FPE-1/3 already running → P1 input rebuild → P1 review → launch decision** — with 1.5 (incorporation + insurance) started in parallel this week.

*End of recommendations. Every item Under review pending founder election; the decision log entry for this review records only the review itself.*
