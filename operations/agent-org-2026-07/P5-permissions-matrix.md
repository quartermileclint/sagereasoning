# P5 — Per-agent permissions matrix

**Program:** Agent-Organization + Evidence Program (AO), session P5 — the ordering anchor for P4.
**Date:** 2026-07-21. **Tier:** `code-elevated` under 0d-ii (raised from a documents-only tier — this is the effective access-control policy for autonomous agent action, per plan §3-P5's PROACT-3 rationale, not mere documentation, even though no provisioning happens in this session). No code / flag / schema / mint / deploy / DB change this session. Production byte-equivalent. AC7 not engaged. Critical Change Protocol NOT engaged — every mint and account grant named below stays its own founder-walked `code-critical` step in P4.
**Depends on:** P1 (`operations/agent-org-2026-07/P1-agent-roster-gap-analysis.md`).
**Feeds:** P4 (per plan §3-P4's dependency line, P4's first mint for a given agent role is gated on that role's row here being founder-signed); the credential ledger (§5 below); `KILL-SWITCHES.md` (§4 below).

---

## 0. Method and honesty note

This matrix is grounded in: (a) the AO build plan §2 (standing constraints — the hard floor, the attended-only default, the credential-discipline bullet) and §3-P4/§3-P5 (scope lines); (b) P1's gap map and ranked order (§5 of that document); (c) the closed UPC capability vocabulary as implemented (`website/src/lib/practice-credential.ts` — `consult`, `l1_supply`, `accreditation_write`, `calling`, `reflect`; the write-class subset `{accreditation_write, calling, reflect}` binds `agent_id` at the write boundary per the 6e §A invariant); (d) the adopted starter-credential defaults (`website/src/lib/api-key-defaults.ts` — 30/1/1 monthly/daily/chain, named in the plan as the documented starve class for a working agent, not a target); (e) `harness/gate1-pre-decision/KILL-SWITCHES.md` (the layer this matrix extends); (f) `operations/trust-layer-2026-07/S11-FLIP-PREREQUISITES-REGISTER.md` §E (the row-format precedent for the credential ledger — reused for format only, not for scope; that register stays scoped to the `sagereasoning:s9-loop@v1` subject per the plan's own §5 disambiguation).

**What this session does NOT do:** mint any credential; grant any external account; edit `discernment.config.json` or author any agent's calling prompt (P4's job); decide the K1 identity scheme (election E2, P4's own election — the identity strings below are illustrative examples in the plan's own format, not binding); or authorize any unattended operation for any agent (§2's hard floor — a separate, later, explicitly-gated Critical event).

**Where I could not find a real grantable account to name, I say so rather than inventing one.** No evidence surfaced this session of a Supabase Studio collaborator-role convention, a Slack workspace membership convention, or any other non-production-affecting account already provisioned for a role other than the founder's own. Where a column below reads "none named — not provisioned at this session," that is an honest gap, not an omission.

---

## 1. Schema

One row per (agent, role). Each row states:

| Column | What it captures |
|---|---|
| **Rank / status** | P1's ranked order + whether this row is drafted, deferred, or excluded this session |
| **Illustrative K1 identity** | Non-binding example in the plan's own format (`sagereasoning:org-<agent>@v1`); P4's election E2 decides the real scheme |
| **UPC credential pair** | Per plan §3-P4(b) ("a dedicated UPC credential pair, consult + accreditation_write at minimum") — a **consult-class credential** (`consult`, optionally `l1_supply`) and a **write-class credential** (`accreditation_write`, `calling`, `reflect` — bound to owner + agent per the 6e §A invariant) |
| **Capabilities granted, and deliberately withheld** | The exact subset of the closed vocabulary, with an explicit note on anything withheld and why |
| **Spend envelope** | Recommended `monthly_limit` / `daily_limit` / `max_chain_iterations` for each credential, reasoned from the role's expected call shape — never the 30/1/1 starve-class default for a role expected to do real work |
| **External accounts** | Supabase (read-only only — service-role is the §2 hard floor, never grantable here), Slack, analytics, or any other non-production-affecting account; "none named" is a valid entry |
| **Proactive / unattended envelope** | Named candidate future unattended tasks (informational only) plus the explicit attended-only baseline; "none approved" is the default and a valid, expected entry for every row in this first pass |
| **Operating surface (E1)** | P1's recommendation for the Claude-Code-loop + Gate-1-harness surface vs. the website runtime vs. Cowork — decided for real at P4, not here |
| **Rationale** | One or two sentences tying the row back to P1's gap map |

---

## 2. The §2 hard floor, restated for self-contained reading

No row below grants, and no row in any future revision of this matrix may grant, any agent: Supabase service-role access; Vercel deploy or environment-variable access; production-credential mint or revoke capability; or any other op class the AO plan's §2 reserves to the founder. These are structural exclusions, not per-row policy choices — a row that appeared to grant one would be void on its face, not merely unwise.

Every newly-provisioned agent's default posture is **attended-only**. Nothing in this matrix activates unattended operation for any agent; that is a separate, later, explicitly Critical-tier step per plan §2, and it requires the relevant row below to already be founder-signed before it can even be proposed.

---

## 3. The matrix

### Row 1 — Tech *(drafted; recommended founder-sign target for this session)*

| Field | Value |
|---|---|
| **Rank / status** | P1 rank 1. Drafted in full this session. |
| **Illustrative K1 identity** | `sagereasoning:org-tech@v1` (illustrative only — P4's election E2 decides the real scheme) |
| **UPC credential pair** | Consult credential + write-class credential, per the S9-loop precedent's own consult/accred split (register §E) |
| **Capabilities — consult credential** | `[consult]`. **`l1_supply` deliberately WITHHELD** — a supplied `layer1_schema` skips server-side `extractFeatures`, so anything folded into `effectiveContext` is silently inert on that path (the CF-2 false-success class); Tech's diagnostic work has no demonstrated need to bypass server extraction, and granting it by default would quietly weaken the very safety extraction Tech's own consults should be examined by. |
| **Capabilities — write credential** | `[accreditation_write, calling, reflect]`. All three write-class capabilities travel together per the closed vocabulary's own grouping (they bind `agent_id` at the write boundary, 6e §A) — `calling` discharges the G1 calling gate at harness spawn; `accreditation_write` records genuinely-accumulated signed assessments; `reflect` allows the session-close reflect cycle. None of the three is withheld: Tech's role is expected to run real, attended Claude-Code-loop sessions from day one, and a credential missing `calling` would make its own calling declaration read as decorative rather than discharged — the exact failure mode P4(a) is written to avoid. |
| **Spend envelope — consult** | Recommended `monthly_limit: 150`, `daily_limit: 15`. Reasoning: Tech's real work (reading state/code, running diagnostics, drafting fixes) plausibly runs a handful of consults per attended session; 15/day covers several sessions in a single day without headroom for silent automation, and 150/month is comfortably inside the credential's own healthy-usage band the s9-loop precedent demonstrated (623/5000 monthly, well under cap) while starting far more conservatively than that identity's own limits. **Explicitly not 30/1/1** — that default is documented as the class that starves a genuinely working credential (the API-key 1-per-day-limit memory: a second same-day consult reads as a false "please sign in" auth failure, not a quota signal, and would misdirect debugging on Tech's very first working day). |
| **Spend envelope — write** | Recommended `monthly_limit: 150`, `daily_limit: 15`, `max_chain_iterations: 1` (no chaining needed for a single agent's own writes). |
| **External accounts** | **None named at initial provisioning.** Direct Supabase read-only access (a Studio collaborator seat, if that role level exists) is a plausible future grant if Tech's diagnostic work demonstrably needs schema/data inspection beyond what `/api/health`, repo-tracked migration files, and existing read endpoints already provide (e.g., feeding go-live gate-build #9's RLS inventory) — **not granted now; available on demonstrated need, its own small future founder-walked step.** Founder-JWT-gated admin surfaces (`/api/admin/slo-health`) are **not grantable under this matrix as currently built** — they authenticate via the founder's own session, not a UPC credential; delegating them would require a service-scoped credential type that does not exist today. Named here as a limitation, not silently ignored. Slack: no workspace-membership convention found for any non-founder identity; not granted. |
| **Proactive / unattended envelope** | **None approved.** Attended-only, per §2's default, effective immediately on provisioning. Named future candidate (informational only, not approved): a scheduled `/api/health`-style degraded-status check — non-destructive, read-only, low blast radius if wrong — would be the most defensible first unattended task to bring back for its own Critical-tier activation step, if and when the founder wants to consider it. Nothing here proposes a date or commits to building it. |
| **Operating surface (E1)** | Claude-Code-loop + Gate-1 harness (P1's recommendation; decided for real at P4). |
| **Rationale** | P1: "Tech is the strongest first P4 candidate, both for org value and for genuinely feeding the evidence program." Its real work already looks like the sessions that build this project, so a calling declaration is least likely to read as decorative, and Track B's evidence dividend applies cleanly (§1a of the plan). |

### Row 2 — Ops *(drafted; second recommended target)*

| Field | Value |
|---|---|
| **Rank / status** | P1 rank 2. Drafted in full this session. |
| **Illustrative K1 identity** | `sagereasoning:org-ops@v1` (illustrative only) |
| **UPC credential pair** | Consult credential + write-class credential, same pattern as Tech |
| **Capabilities — consult credential** | `[consult]`. `l1_supply` withheld for the same reason as Tech's row — no demonstrated need, and it would silently weaken the safety extraction on Ops's own consults. |
| **Capabilities — write credential** | `[accreditation_write, calling, reflect]` — same reasoning as Tech's row: Ops is recommended for the same Gate-1-harnessed surface (P1 §5), so the same three write-class capabilities apply for the same reason (a `calling`-less credential would make its declared purpose decorative). |
| **Spend envelope — consult** | Recommended `monthly_limit: 120`, `daily_limit: 10`. Reasoning: Ops's real work (drafting checklists, monitoring decision-log/KG state, maintaining runbooks — P1 §5) is file-and-state-centric and plausibly consults slightly less per session than Tech's diagnostic work, but still real, attended work that the 30/1/1 default would starve on its own first working day. |
| **Spend envelope — write** | Recommended `monthly_limit: 120`, `daily_limit: 10`, `max_chain_iterations: 1`. |
| **External accounts** | **None named.** Ops's recommended functions (§4 of P1 — legal/finance/security-ops tracking-and-reminder ownership, the incident/rollback runbook draft, migration-strategy formalization) are all repo-file-and-artifact-centric; none of P1's findings identified a need for a separate external account. If a future session finds Ops genuinely needs direct visibility into, e.g., a billing/finance tool once Stripe is activated (itself an unowned ORG_DECISION per P1 §3), that is its own future row revision — not granted now. |
| **Proactive / unattended envelope** | **None approved.** Attended-only. Named future candidate (informational only): flagging a stale weekly environmental scan (last refreshed 2026-07-13 per CLAUDE.md) or an overdue tracked-checklist item — a read-and-flag task with no side effect beyond a drafted note for founder review — would be the most defensible first unattended candidate to bring back for its own Critical-tier activation step. Not approved, not scheduled. |
| **Operating surface (E1)** | Claude-Code-loop + Gate-1 harness (P1's recommendation; decided for real at P4). |
| **Rationale** | P1: Ops has "high" org-urgency (touches several of the freshest gaps this program found — the unowned incident/rollback protocol, migration-strategy formalization, go-live-checklist maintenance) and "high" evidence-dividend fit (checklist/runbook/decision-log work is native Claude-Code-loop shape). |

### Row 3 — Growth *(deferred, not drafted this session)*

P1 rank 3. Org-urgency moderate, evidence-dividend fit moderate — "drafting blog/social content and running competitive web research fit a code loop reasonably... though less naturally than Tech/Ops's file-and-state-centric work" (P1 §5). Its capability/spend/external-account needs plausibly differ from Tech/Ops's pattern (e.g., WebSearch/WebFetch-heavy work rather than repo-diagnostic work), which this session did not have grounds to reason through carefully without either overfitting the Tech/Ops template or inventing needs. **Deferred to its own future matrix-revision session, not blocked on anything** — P4 should not mint a Growth identity until this row is drafted and signed, per the same gating rule as every other row.

### Row 4 — Support *(deferred, with a named reason not to rush it)*

P1 rank 4, and P1 is explicit that org-urgency and evidence-fit "pull apart" hardest here: Support is the most organizationally urgent of the four (the confirmed-unmonitored `support@` channel) but the weakest fit for Gate-1 harnessing (its real work — drafting replies to customer emails, triaging tickets — "does not naturally happen inside a Claude Code terminal loop"). P1's own recommendation is that Support's urgent gap is better solved by a founder decision plus finishing the pre-existing ring-architecture mount, **independent of P4** — so drafting a Gate-1 permissions row for Support here would risk manufacturing a row for a provisioning path P1 itself argues against defaulting to. **Deferred, explicitly, pending the founder's separate ring-vs-Gate1 decision for Support** (P1 §4.2) — not merely "ran out of time."

### Row 5 — Mentor *(excluded from this rollout)*

Not part of P4's rollout per P1 §4.5 — Mentor is the product's own live, user-facing reflection surface on a distinct, mature architecture, not an internal-staff role in the sense the other four are. No row drafted; none needed.

---

## 4. `KILL-SWITCHES.md` extension

`harness/gate1-pre-decision/KILL-SWITCHES.md` Layer 4 ("Credential revoke — THE REAL ONE") is written generically for a single harness identity (the s9-loop precedent). This program extends it per-org-agent: see the edit applied to that file this session, which adds a pointer from Layer 4 to the credential ledger (§5) as the current source of per-agent credential ids, rather than duplicating ids across two files that would drift.

---

## 5. Credential ledger

`operations/agent-org-2026-07/credential-ledger.md` is stood up this session (empty of entries — no mint has occurred). P4 populates it, one row per credential, at each agent's provisioning session, in the format that file documents (drawn from the S11 register §E precedent, format only).

---

## 6. Founder sign-off record

- **Tech row: SIGNED, 2026-07-21** — approved as drafted (capabilities, spend envelope, external-account answer, and attended-only default all stand unchanged). **P4's first mint for Tech is unblocked by this signature.**
- **Ops row: SIGNED, 2026-07-21** — approved as drafted (capabilities, spend envelope, external-account answer, and attended-only default all stand unchanged). **P4's first mint for Ops is unblocked by this signature.**
- Growth / Support / Mentor rows: not signed this session (§3 rows 3–5 — deferred/excluded for the reasons stated there, not merely unsigned by omission).

---

## Cross-references

- `operations/agent-org-2026-07/agent-org-and-evidence-build-plan.md` (§2, §3-P4, §3-P5, §5, §7)
- `operations/agent-org-2026-07/P1-agent-roster-gap-analysis.md` (§5 — the ranked order this matrix executes)
- `harness/gate1-pre-decision/KILL-SWITCHES.md` (Layer 4, extended this session)
- `operations/trust-layer-2026-07/S11-FLIP-PREREQUISITES-REGISTER.md` §E (row-format precedent, not scope)
- `website/src/lib/practice-credential.ts` (the closed capability vocabulary + write-class binding rule)
- `website/src/lib/api-key-defaults.ts` (the 30/1/1 starve-class default this matrix deliberately does not repeat)
- `operations/agent-org-2026-07/credential-ledger.md` (stood up this session, populated at P4)

*End of matrix (this pass). Rows 1–2 are the founder-sign target; rows 3–5 are named and reasoned, not silently skipped.*
