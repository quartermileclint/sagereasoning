# Next-Session Prompt — P5: Per-agent permissions matrix

**Stream:** founder (AO program — P5; the ordering anchor for P4, per the plan's own dependency structure).
**Tier:** `code-elevated` for the matrix document itself (raised from a documents-only tier — v2 fold, PROACT-3: a document that is the effective access-control policy for autonomous agent action is not a documents-only artifact under 0d-ii, even before any provisioning occurs). The mechanical per-agent provisioning (mints, account grants) that follows in P4 is `code-critical`, founder-walked — **not** this session's scope.
**Governing frame:** `/adopted/standing-protocol-cache.md`; the AO plan `operations/agent-org-2026-07/agent-org-and-evidence-build-plan.md` §3-P5, §2 (standing constraints), §7 (Rule B).
**Predecessor session close:** `operations/handoffs/founder/2026-07-21-P3-independent-review-institutionalization-CLOSE.md` (P3 — PR19 adopted; unrelated track, does not gate this one).
**Predecessor decision-log entries:** `D-AGENT-ORG-EVIDENCE-BUILD-PLAN-ADOPTED-2026-07-19`; `D-PR19-ADOPTED-INDEPENDENT-REVIEW-REQUIRED-2026-07-21`; the P1 gap analysis (`operations/agent-org-2026-07/P1-agent-roster-gap-analysis.md`, committed `5e19141`).
**Risk classification:** `code-elevated` under 0d-ii for the matrix document (per the v2 fold rationale above — this is an access-control policy artifact, not mere documentation). Critical Change Protocol NOT engaged this session — no mint, no account grant, no schema, no deploy. AC7 not engaged. Production byte-equivalent throughout. Any actual provisioning stays deferred to P4's own founder-walked `code-critical` sessions.

## Why this session matters

P5 is now the ordering anchor for P4, not a parallel nice-to-have: per the plan's dependency line (§3-P4), **P4's first agent mint is gated on this matrix having at least one founder-signed row for that agent's role** (v2 fold, SEQ-3/PROACT-1 — a prior draft's dependency line omitted this while §7 claimed a "matrix-first" fold the dependency structure didn't actually enforce; it is now explicit and enforced by ordering, not merely asserted). P1's gap analysis (closed 2026-07-19, committed `5e19141`) ranked **Tech as the strongest first P4 candidate** — both for org value and for genuinely feeding the evidence program — so this session's first matrix row should almost certainly be Tech's.

This session also carries the plan's single most consequential safety addition (per its own v2 fold log, §8: PROACT-2, "the single most important addition in this revision"): the **attended-only default**. Provisioning a credential and installing a harness is explicitly NOT the same event as authorizing an agent to act without the founder present — the matrix is where that distinction becomes a real, signed artifact rather than an assumption.

While this runs, the P2 Fable-5 repeat stays correctly held until 2026-07-25 08:00 (per `operations/handoffs/founder/2026-07-21-interim-and-P2-Fable5-rerun-standing-note.md`) — this session is parallel-safe with that hold, not a substitute for it.

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min) — confirm tier, model selection (N/A — no LLM calls in this session beyond ordinary reasoning), risk class, signals. **Note the PR19 addition** (this session drafts no build plan and touches no trust-core/predicate/fold/engine surface, so PR19's mandatory-review trigger does not engage here — confirm that read, don't assume it).
2. `operations/agent-org-2026-07/agent-org-and-evidence-build-plan.md` §2 (standing constraints — read in full, this is where the hard floor and the attended-only default live), §3-P5, §3-P4 (to see exactly what P5 must supply before P4 can act), §5 (the credential ledger's home and format), §7 (Rule B).
3. `operations/agent-org-2026-07/P1-agent-roster-gap-analysis.md` §5 ("Ranked order for P4 + election E1") — read in full. This is the input the matrix's first row should target.
4. `operations/trust-layer-2026-07/S11-FLIP-PREREQUISITES-REGISTER.md` §E — the format precedent for the credential ledger this plan's own §5 explicitly does NOT reuse (a new, separate file is required — `operations/agent-org-2026-07/credential-ledger.md` — but its ROW FORMAT is drawn from this precedent).
5. `KILL-SWITCHES.md` (repo root or wherever it currently lives — locate via `find . -iname 'KILL-SWITCHES.md'`) — P5 must extend this per-agent (credential revocation is the real kill switch, the standing lesson this project has learned repeatedly).

Confirm at open: tier (`code-elevated` for the matrix); hold-point status (P0 0h — untouched); model selection (N/A); status vocabulary; signals + risk classification per the elevated-not-standard tier this session actually carries.

## Part B — Procedure

### Step 1 — Draft the permissions-matrix schema
One row per (agent, role) pair. Per plan §3-P5's scope line, each row states:
- **UPC capability set** per role (least-privilege — never the 30/1/1 starter defaults for a working agent; per §2's credential-discipline bullet, set daily/monthly limits deliberately).
- **External accounts** — Supabase **read-only only** (service-role access is the hard floor, never grantable via this matrix); Vercel/Stripe/production-credential-mint access are the same hard floor; Slack, analytics, and other non-production-affecting accounts are the matrix's actual scope.
- **Spend envelopes** — per-credential daily/monthly limits, plus any per-agent Anthropic budget.
- **The proactive/unattended envelope** — the specific, NAMED tasks (if any) this agent role may eventually run unattended, explicitly distinct from and subordinate to the attended-only default (§2). If a role has no unattended tasks yet approved, say so explicitly (empty is a valid, honest answer — don't leave the column implicitly blank).

### Step 2 — Populate the first row: Tech
Using P1's §5 ranking and gap analysis as the basis, draft Tech's row: what capabilities does Tech's real work (reading code/state files, drafting fixes, running diagnostics — per P1 §5's own characterization) actually require, at least-privilege. Surface this as an AskUserQuestion / explicit review point for founder sign-off before treating any row as final — this is the access-control policy for an autonomous agent, not a documentation exercise.

### Step 3 — Decide whether to populate additional rows this session
P1 ranked Ops #2, Growth #3, Support #4 (with Support's evidence-dividend fit explicitly weak — see P1 §5's note that Support's urgent gaps are better solved directly, not via P4 harnessing). Recommend: draft Ops's row alongside Tech's if time allows (both ranked "high" org-urgency AND "high" evidence-dividend fit), but do not feel obliged to complete all five in one sitting — the plan sizes this at 1–2 sessions for the matrix, and a rushed row is worse than a deferred one given §2's hard-floor stakes.

### Step 4 — Extend `KILL-SWITCHES.md` per agent
For each row populated, add the corresponding kill-switch entry (credential revocation as the concrete, actionable stop — not a policy statement).

### Step 5 — Founder sign-off
Present the drafted matrix (at minimum Tech's row) for explicit founder approval before treating any row as signed. Per §3-P5's deliverables line: "the matrix doc (founder-signed, one row minimum before P4 agent 1)." This is not a rubber-stamp step — walk through what each capability grant actually permits, per PR17's live-walkthrough discipline (even though no live op runs this session, the CONTENT of what will later be granted deserves the same care as if it were being granted now).

### Step 6 — Create the credential ledger file (if not created yet)
`operations/agent-org-2026-07/credential-ledger.md`, format per the S11 register §E precedent, scoped to this program's N org-agent identities (explicitly NOT reusing the S11 register's own §E, which is scoped to the `sagereasoning:s9-loop@v1` subject specifically — per plan §5). Leave it empty of actual entries this session (no mint has happened) — just stand up the file with its header/format ready for P4 to populate.

### Step 7 — Append decision-log entry (lean form)
Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". Cite the Elevated risk classification explicitly and why (the v2 fold rationale, PROACT-3).

### Step 8 — Session close (lean form)
Pattern: per the cache's §"Lean session close". Name P4 (agent 1 = Tech) as the next session, gated on this matrix's Tech row being signed.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + plan §2/§3-P4/§3-P5/§5/§7 + P1 §5 + register §E + KILL-SWITCHES read | 25–30 min |
| Step 1 — schema draft | 15–20 min |
| Step 2 — Tech's row | 20–30 min |
| Step 3 — optional Ops row | 20–30 min (skip if time-constrained) |
| Step 4 — KILL-SWITCHES extension | 10 min |
| Step 5 — founder sign-off | 15–20 min |
| Step 6 — ledger file stand-up | 10 min |
| Decision-log + close | 20–30 min |
| **Total** | **~2–2.5 hours** (matches the plan's 1–2 session estimate for the matrix; this covers the first of those) |

## Rollback path

Documents-only session — no code / schema / flag / credential / deploy change (no mint runs here; the matrix is policy, not provisioning). `git revert` the records commit reverts the matrix, the ledger stand-up, and the KILL-SWITCHES extension together; nothing live depends on any of it, since P4's actual mints haven't happened yet.

## Forecast

Success is at least Tech's matrix row founder-signed and the credential-ledger file standing ready, so P4's first agent session (Tech, per P1's ranking) can open with its dependency genuinely satisfied rather than assumed. This directly continues the thread P1 fed forward and unblocks the next visible step in the AO program's critical path. It does not touch the held P2 Fable-5 repeat (still gated to 2026-07-25 08:00) or re-open the S11 flip, the 0h call, or the weights posture — none of which this session's scope reaches.

End of prompt.
