# Next-Session Prompt — P1: Agent-roster review + sole-founder gap analysis

**Program:** Agent-Organization + Evidence Program (AO) — this is **P1**, the org program's root (`operations/agent-org-2026-07/agent-org-and-evidence-build-plan.md`, ADOPTED v2, `D-AGENT-ORG-EVIDENCE-BUILD-PLAN-ADOPTED-2026-07-19`).
**Stream:** founder (agent-org / evidence).
**Tier:** **`governance`** under 0d-ii — **read-only; documents out. NO code / flag / schema / mint / revoke / deploy / DB change. AC7 not engaged. PR6 not engaged. Production byte-equivalent.** If the session finds itself wanting to *change* a public surface or a credential, STOP — that is a different, later, named session (the rider is audit-only; see below).
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` (Rule B — plan §7).
**Depends on:** nothing (parallel-safe with P0/P2). P0 is discharged (`D-S9-LOOP-CONSULT-CREDENTIAL-DIAGNOSED-HEALTHY-NO-REFRESH-2026-07-19`).

## Why this session

The founder is a sole operator taking the project toward go-live. P1 asks: **what roles/functions does a real launch need an owner for, which of the five Sage agents (mentor, support, tech, growth, ops) covers them, and where are the gaps** — from a sole-founder perspective. This is the root the rest of the org program branches from: P4 (per-agent callings + harnessed identities) needs P1's **ranked order**; P5 (permissions matrix) needs P1's **gap map**; the evidence dividend (Track B) needs P1's **election E1** read (which agents will even operate on a harness-bearing surface — plan §1a).

**This is analysis, not action.** The output is a map and recommendations the founder acts on later, one founder-walked step at a time. Nothing here provisions, mints, installs, or edits a live surface.

## Standing constraints (plan §2 — bind this session)

- Nothing is pre-approved; this session decides a MAP, not any activation.
- MEASURE throughout; weights BLOCKED; the S11 flip stays REFUSED; the 0h call remains the founder's.
- **§1a bounds are live and must be honored in the analysis:** (1) the evidence dividend is **surface-conditional** — only agents whose eventual E1 lands on the Claude-Code-loop-with-Gate-1-harness surface generate harness records; website-runtime and Cowork agents serve the org function with **zero** evidence dividend. (2) The internal-staff self-reference bound is a disclosed methodological question for the mentor's later re-examination — **do not pre-judge** whether internal work is "representative."
- **The proactive-envelope hard floor (§2, PROACT-3):** the gap map may recommend *what a role owns*, but no role — however the later P5 matrix is signed — may ever hold Supabase-service-role, Vercel deploy/env, or prod credential mint/revoke. Frame every ownership recommendation within that structural floor (an agent "owns Stripe reconciliation" means it drafts/monitors/flags, not that it holds the Stripe/Vercel secrets).
- P0 context for the P4 ranking: the Gate-1 harness currently frames **intermittently** — the consult credential is healthy (P0 DB-verified 5000/200), but transient server-side DB-lookup fail-secures + the S11b composed-consult latency (28s timeouts) drop a fraction of frames (the exit-B-adjacent class; remedy handed off as a `code-elevated` follow-up, not blocking). The harness works; it is not yet perfectly reliable. Factor this into "which agent gets harnessed FIRST" only as a known, disclosed rate — it does not disqualify the harnessed surface.

## Pre-conditions / open (read in order)

1. `/adopted/standing-protocol-cache.md`.
2. The AO build plan §1, §1a, §2, §3-P1, §4, §5 (`operations/agent-org-2026-07/agent-org-and-evidence-build-plan.md`).
3. P0's close + decision (`D-S9-LOOP-CONSULT-CREDENTIAL-DIAGNOSED-HEALTHY-NO-REFRESH-2026-07-19`) — the harness-reliability context above.
4. The roster/ops inputs the plan verified exist: `operations/SageReasoning_Support_Agent_Manual.docx`, `operations/Support_Agent_Implementation_Plan.md`, `operations/inter-agent-handoff-protocol.md`, the `sage-wiring-fix` channel-gap maps (`.claude/skills/sage-wiring-fix/`), the users' guide, the component registry.

Confirm at open: tier (`governance`); that no live op will run; status vocabulary; the §1a + §2 bounds.

## Part A — Open under the protocol
1. Standing-protocol cache. 2. The AO plan sections above. 3. P0's close. 4. The roster inputs.

## Part B — Procedure

### Step 1 — Establish the "go-live functional roster" (what a launch needs owned)
From a sole-founder-going-to-market lens, enumerate the functions a live product needs an owner for. The plan's **gap candidates to examine (NOT conclusions — §3-P1):** legal/compliance (the standing lawyer-engagement items — FPE-5 TOS/liability, R17 privacy, the R18e Article-50 placeholder); finance/billing ops (**Stripe is `not_configured` in production, confirmed** — who owns activating + reconciling it?); security-ops / incident response (the **2026-07-17 credential-exposure incident had no named owner** — key rotation, exposure sweeps, revocation drills); marketing-vs-growth separation; customer-support depth vs the manual's current scope; data-rights / DPO-adjacent ownership (the R17 surfaces exist — who operates them?). Treat these as prompts to examine, not a predetermined answer set — add/remove functions as the inputs warrant.

### Step 2 — Map the five Sage agents onto the functional roster
For each of mentor, support, tech, growth, ops: what it currently covers (from the manuals + wiring-fix maps + registry), and against the Step-1 roster, what it does NOT cover. Be concrete — cite the source doc/section for each coverage claim (this is a read-only mapping; verify, don't assume).

### Step 3 — Produce the gap map + roster recommendations
- **The gap map:** function → owned-by (which agent) / partially-owned / **unowned**, with the source-cited basis.
- **Recommended roster changes:** add (a new agent/role), merge (two overlapping), or re-scope (broaden/narrow an existing agent's remit) — each with a one-line rationale, and each framed within the §2 proactive-envelope floor.

### Step 4 — The ranked P4 order + election E1 (surfaced, not decided)
- **A ranked order for P4** (plan §3-P1 deliverable): which agent gets a calling + harnessed identity FIRST and why. Per §1a, note for each agent **whether its likely E1 surface even carries the Gate-1 harness** (⇒ whether it contributes to Track B evidence at all). The ranking should weigh both org-urgency AND evidence-dividend-eligibility, and state which it prioritized where they conflict.
- **Surface election E1** for the founder (plan §3-P1 / §1a) — do NOT decide it: per agent, the operating surface is one of {Claude-Code-loop + Gate-1 harness (org function + sage-practice + calling + evidence dividend), website runtime channels (org function only, no evidence dividend — the wiring-fix surface), Cowork sessions (org function only, no evidence dividend, cannot reach production)}. Present the trade-off per agent; the founder decides at/before each agent's P4 session.

### Step 5 — Folded rider (ONE rider only — plan §3-P1, SEQ-10): light R18 claims-vs-code audit
A **light** claims-vs-code pass over the three public surfaces (`website/public/llms.txt`, `website/public/.well-known/agent-card.json`, the api-docs page) **under the go-live lens** — do the public claims still match what the code does, from a launch-readiness standpoint? **Findings feed the gap map (an "R18/go-live" row), NOT immediate edits** — any actual surface change is a separate founder-signed R18 session (§2). Keep it light; if P1 is already running long, note the audit as not-yet-done rather than bloating the session. **P3 does NOT ride this close** — it stands alone (SEQ-10).

## Deliverables (documents only)
- The gap map + roster recommendations + ranked P4 order + E1 surfaced — recommend a new file `operations/agent-org-2026-07/P1-roster-gap-map.md` (keeps the AO stream's artifacts together).
- A decision-log entry (`governance`; documents-only; production byte-equivalent) recording the gap map's adoption-as-analysis (it recommends; it decides no activation).
- The session close + (founder's choice of) the next AO step's prompt (P2 spec-freeze, or P5-matrix, or P3 standalone — the plan §4 sequence: P1 ► P5-matrix(≥1 row) ► P4; P2 and P3 and P7 and P8a are parallel-safe).
- If Step 5 ran: the R18/go-live findings folded into the gap map (audit-only).

## Verification (founder-performable)
```
grep -c "unowned\|gap map" operations/agent-org-2026-07/P1-roster-gap-map.md   # ≥1
```
No code/test/build verification — this session ships no code.

## Anticipated shape
| Phase | Estimate |
|---|---|
| Cache + AO plan + P0 close + roster inputs | 20–30 min |
| Step 1–2 (functional roster + agent mapping) | 40–60 min |
| Step 3–4 (gap map + ranked order + E1) | 30–45 min |
| Step 5 (light R18 rider, optional) | 20 min |
| Decision-log + close | 20 min |
| **Total** | **~2–2.5 hours** |

## Scope discipline
Read-only, documents out. No mint/install/edit-to-a-live-surface. The map recommends; the founder acts later, one founder-walked step at a time. §1a bounds honored; §2 proactive floor honored; S11 REFUSED; weights BLOCKED; the 0h call remains the founder's.

End of prompt.
