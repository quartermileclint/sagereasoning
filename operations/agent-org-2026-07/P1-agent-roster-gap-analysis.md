# P1 — Agent-roster review + sole-founder gap analysis

**Program:** Agent-Organization + Evidence Program (AO), session P1 — the program's root.
**Date:** 2026-07-20. **Tier:** `governance` — read-only, documents out. No code / flag / schema / mint / deploy / DB change this session. Production byte-equivalent. AC7 not engaged.
**Depends on:** nothing (parallel-safe with P0, which is running separately). P0's outcome is not assumed here.
**Feeds:** P4 (ranked order + calling design), P5 (permissions-matrix gap map), P-GL (org-decision items already partially routed there by the launch-feedback reconciliation), the eventual §1a mentor re-examination (E1 read).

---

## 0. Method and honesty note

This gap map is grounded in five source classes, all read in full or targeted-read this session: (a) the AO build plan §1/§1a/§2/§3-P1; (b) the verified 28-item launch-feedback reconciliation (`2026-07-19-launch-feedback-reconciliation.md`, code-verified + adversarially re-checked, all 28 CONFIRMED); (c) the roster documents — `SageReasoning_Support_Agent_Manual.docx` (converted via `textutil`, since the Read tool cannot open binary `.docx`), `Support_Agent_Implementation_Plan.md`, `inter-agent-handoff-protocol.md`, `Sage_Ops_Cofounder_Assessment_v2.md`; (d) the `sage-wiring-fix` skill + all four wiring-fix handoff/close pairs (support, tech, growth, ops) plus the confirmation that **no such pair exists for mentor** (its directory is empty by design — mentor runs a different, already-live reference architecture); (e) `users-guide-to-sagereasoning.md` (Ch. 22–23), `component-registry.json`, and `agent-card.json` (the light R18 rider, §5 below).

**The single most load-bearing finding of this session is architectural, not administrative:** the five Sage agents run on an entirely different, older system than the one the AO plan's P4 will provision. Everything below is organized around that finding first, because it changes what "roster gap" even means for this program.

---

## 1. The architecture split (read this before the gap map)

Grep and file-existence checks this session confirm **two parallel, non-integrated agent architectures exist in this repo**:

1. **The "ring" architecture** (`sage-mentor/ring-wrapper.ts`, `sage-mentor/authority-manager.ts`, `sage-mentor/support-agent.ts`) — built April 2026. Local markdown files (`support/inbox/`, `knowledge-base/`, `workflows/`, `leads/`, `notifications/`) are the operational interface; a "ring" wraps every action with BEFORE/AFTER governance checks (R1 no-therapy, R2 no-employment, R3 disclaimer, R9 no-outcomes); agents earn authority promotion (`supervised → guided → spot_checked → autonomous → full_authority`) through demonstrated reasoning quality. This is what `SageReasoning_Support_Agent_Manual.docx`, `Support_Agent_Implementation_Plan.md`, and `inter-agent-handoff-protocol.md` describe. **Four of the five Sage agents (support, tech, growth, ops) are built on this system.**
2. **The Gate-1 / trust-core / UPC-credential architecture** — the one CLAUDE.md's entire "Live in production" section documents (`/api/reason`, `/api/guardrail`, the substrate trust-core, kathekon-engagement, the seven-layer harness H1–H5, sage-practice, UPC credentials). This is what **P4 plans to provision fresh identities onto** (a K1-canonical `sagereasoning:org-<agent>@v1` credential pair + a Gate-1 harness install, per plan §3-P4).
3. **Mentor is neither of these, cleanly.** It has no wiring-fix handoff/close pair (`sage-wiring-fix` skill's own directory listing confirms this — `operations/handoffs/mentor/` is empty) because it was wired directly in live code as "the reference pattern, proven" (`/api/mentor/private/reflect/route.ts`, `website/src/lib/context/mentor-context-private.ts`) — a bespoke, already-Live, user-facing product surface, not an internal-staff role in the sense the other four are.

**Consequence for this gap map and for P4:** "harnessing" support/tech/growth/ops under the AO program (P4) is **not** the same task as finishing their existing ring-architecture wiring — it is a second, independent identity and credential on a different system. The founder should not read a P4 harnessing session as completing the April wiring-fix work, and should not read the April wiring-fix work as a substitute for P4. Both may be worth finishing; they do not finish each other.

---

## 2. What actually exists today per agent (source-cited)

The founder-hub chat personas (a conversational "talk to this persona" surface at `/founder-hub`, `case '<agent>':` in `website/src/app/api/founder/hub/route.ts`) are a **separate, simpler** feature from the ring's autonomous run-loop. Distinguishing them matters — the wiring-fix sessions were about grounding the *chat persona's* context with live data; they say nothing about whether the *ring's automated processing* (e.g., an inbox item being drafted and reviewed without the founder typing anything) is live.

| Agent | Chat-persona context channels (per wiring-fix close files) | Ring/automation status | Source |
|---|---|---|---|
| **Support** | Channel 1 (distress pre-processing) + Channel 2 (interaction history) reached **Wired, unit-verified** (30/30 assertions). **Never promoted to Verified** — the mount session (`support-wiring-mount-close.md`) stopped at Step A: *"the grep sweep returned zero external callers... a new run-loop is a bigger scope than this session was framed for."* No subsequent session built the caller (`git log` on `sage-mentor/support-agent.ts`: last touch 2026-04-20, ~3 months stale as of this session). | **No live automated run-loop exists.** `processInboxItemWithGuard` (the guarded entry point, `support-agent.ts:880`) is defined but has no caller anywhere in the codebase. The `support/inbox/` markdown files are processed only when the founder manually opens them. | `support-wiring-fix-close.md`, `support-wiring-mount-close.md`, direct grep |
| **Tech** | Channel 1 (system state) + Channel 2 (endpoint inventory) reached **Verified** 2026-04-21 after the `process.cwd()` Vercel path-resolution fix landed (`context-loader-stub-fix-close.md`). | Chat-persona context is live and grounded. No autonomous run-loop is described for Tech beyond the chat persona. | `tech-wiring-fix-close.md`, `context-loader-stub-fix-close.md` |
| **Growth** | Channel 1 (actions log) + Channel 2 (market signals) reached **Verified** 2026-04-21, same fix. | Same as Tech — persona-only, no autonomous loop. Content-workflow / competitive-intel remain process gaps (§3 below), consistent with the reconciliation's #25/#26. | `growth-wiring-fix-close.md`, `context-loader-stub-fix-close.md` |
| **Ops** | Channel 2 (continuity — decision log, handoffs, KG register) reached **Verified** 2026-04-21. Channel 1 (cost/spend feed) was blocked on the `cost_health_snapshots` table not existing in production; that table **does now exist in production** per the P-GL launch-feedback finding #9 (found as one of three tables with no RLS) — so the underlying migration has since landed, though no session explicitly recorded promoting Ops C1 to Verified. **Recommend confirming this at the next Ops-touching session**, not assumed here. | Persona-only; no autonomous loop. | `ops-wiring-fix-close.md`, launch-feedback reconciliation item #9 |
| **Mentor** | N/A — different architecture entirely. Live via `/api/mentor/private/reflect` + `mentor-context-private.ts`. Reference pattern the wiring-fix skill was built from. | Live, user-facing, the core product's own reflection/practice surface — not a "staff" role. | `sage-wiring-fix/SKILL.md` §Reference |

**A second, related design gap:** `inter-agent-handoff-protocol.md` (Designed, 2026-04-11) specifies a lightweight markdown+Supabase coordination scheme (`agent_handoffs` table, four categories) for tech/growth/support/ops to flag items for each other asynchronously. No evidence surfaced this session that this protocol is actually exercised in practice (no live handoff files found under `operations/handoffs/` matching its naming pattern, `YYYY-MM-DD-{source}-to-{target}-{slug}.md`, distinct from the `<agent>-wiring-fix-*` files). This is consistent with the broader staleness pattern: **designed, not confirmed operating.**

---

## 3. The gap map — function → owner → status

Function candidates per the AO plan §3-P1, plus the verified launch-feedback items the plan explicitly says to fold in here. Every recommendation is framed within the **§2 hard floor**: no agent — current or future — may hold Supabase-service-role, Vercel deploy/env, or production-credential mint/revoke access. Where a function is described as "owned by" an agent below, that means the agent may draft, monitor, flag, or maintain a tracked artifact about it — never that it holds the underlying secret or executes the irreversible step.

| Function | Owned by | Status | Basis |
|---|---|---|---|
| **Legal/compliance tracking** (FPE-5 TOS/liability, R17 privacy, R18e Article-50 placeholder) | **Unowned.** No agent's brief mentions legal tracking. | Gap | Not present in Support/Ops/Tech/Growth brief documents reviewed; CLAUDE.md names these as standing lawyer-engagement items with no agent attached. |
| **Finance/billing ops** (Stripe activation + reconciliation) | **Unowned** as an ongoing function. Ops's brief (`Sage_Ops_Cofounder_Assessment_v2.md`) touches cost/spend monitoring philosophically (R5 cost-as-temperance) but the concrete "activate Stripe, reconcile invoices" task appears nowhere. | Gap (ORG_DECISION per reconciliation) | Reconciliation: Stripe `not_configured` in production, confirmed; no build item, a vendor/ops decision. |
| **Security-ops / incident response** (key rotation, exposure sweeps, revocation drills, a written rollback protocol) | **Unowned.** The 2026-07-17 public-credential-exposure incident was found "during the final `git status`... not by any tripwire, because none exists" and its own record states rollback/incident ownership is unassigned. | Gap | `operations/incidents/2026-07-17-public-credential-exposure-s9-loop.md` §3; reconciliation item #21 (rollback protocol, no owner named). |
| **Marketing vs. Growth separation** | Not split today. Growth's brief covers positioning/content/competitive signals in one remit; nothing suggests a distinct "marketing" function is being silently conflated with something Growth doesn't actually do. | Partially owned, and the split concern does not appear warranted as a genuine gap — see recommendation §4. | `growth-wiring-fix-*`, reconciliation #25/#26 |
| **Customer-support depth vs. the manual's current scope** | **Partially owned, and materially thinner than the manual claims.** The manual states "everything described here is already deployed and running" — this is not true of the automated run-loop (§2 above). What IS live is founder-manual triage of markdown files plus a `mailto:` intake that "dead-ends at an inbox whose monitoring is explicitly unconfirmed" (`terms/page.tsx`'s own live "Pre-launch: confirm support@ is configured and monitored" comment). `users-guide-to-sagereasoning.md` Ch. 22 independently confirms: *"[TBD — confirm support address and expected response window]"* and *"A formal SLA... is not in place at the time of writing [TBD]."* | Gap (the manual is stale about its own build; the actual channel is unmonitored) | `SageReasoning_Support_Agent_Manual.docx` §1 ("already deployed and running"); `support-wiring-mount-close.md`; users' guide Ch. 22; reconciliation #11 |
| **Data-rights / DPO-adjacent ops** (who operates `/api/user/delete`, `/api/user/export`, `/api/credential/erase`?) | **Unowned as a monitored function**, though the surfaces themselves are Live and code-verified working (per the reconciliation's #28 finding — the backend is fully built; only the two dashboard buttons were disabled placeholders). No agent brief names "respond to a data-rights inquiry" as a task. | Gap (the surface exists; the operational response process does not) | Reconciliation #28; CLAUDE.md R17 Live-list entries. |
| **Support inbox monitoring** (support@) | Unowned/unconfirmed | Gap (ORG_DECISION) | Reconciliation #11 |
| **Human-escalation vendor/owner** (who handles a human being who needs a person, not an agent) | Unowned | Gap (ORG_DECISION) | Reconciliation #12 |
| **Rollback / incident-response protocol** (written decision rules + a named owner) | Unowned | Gap (ORG_DECISION) | Reconciliation #21; the 2026-07-17 incident |
| **Email platform selection** | Unowned; zero email infrastructure exists | Gap (ORG_DECISION) | Reconciliation #15 |
| **Database migration strategy** (a tracked, formalized apply mechanism vs. 51+ ad hoc flat files) | Partially owned by convention (Tech's brief is closest), not formalized | Gap (ORG_DECISION / tooling) | Reconciliation #22 |
| **Content production workflow** (draft → review → publish, with owners) | Partially owned — Growth's brief has cadence guidance but no defined process | Gap (process definition, owned by Growth once defined) | Reconciliation #25 |
| **Competitive-intelligence cadence** | Partially owned — exists inside the weekly environmental scan (stale, last refreshed 2026-07-13, manual cadence), not a dedicated feed | Partial (Growth) | Reconciliation #26 |
| **Session continuity design question** (does the reasoning engine need a stateful, within-session context?) | Not an ownership gap — a design question the reconciliation itself says would conflict with the deliberate stateless-per-instance signed scoring the accreditation/trust model depends on | Design question, not a role gap | Reconciliation #18 |
| **Community/support-analytics dashboard** | Presupposes a support/ticketing operation + SLAs that don't exist yet | Blocked on the support-ops decision above, not independently ownable | Reconciliation #27 |
| **Inter-agent coordination protocol actually operating** | Designed (`inter-agent-handoff-protocol.md`), no evidence of live use | Gap (dormant design) | §2 above |
| **The chat-persona context channels themselves** (Tech, Growth, Ops C2) | Owned by their respective agents | **Live/Verified** | `context-loader-stub-fix-close.md` |
| **The automated Support run-loop** | Designed, unit-verified, never mounted | Gap (never wired to any live channel) | §2 above |

---

## 4. Recommended roster changes

Framed within the §2 proactive-envelope hard floor throughout — no recommendation below grants any agent Supabase/Vercel/mint access; every "owns" verb below means drafts/monitors/flags/maintains-a-tracked-artifact.

1. **Do not add a sixth agent for legal, finance, or security-ops.** These are low-volume, high-stakes, founder-plus-external-professional functions (a lawyer, an accountant, the founder's own judgment on incident response). Adding an agent "role" for them would be decorative — there is no ongoing operational volume to staff. **Recommend instead:** designate **Ops** as the tracking/reminder owner for all three (it already touches cost/continuity/decision-log data and its brief is explicitly about operational oversight) — Ops drafts the checklist, flags overdue items, and maintains the incident/rollback runbook draft; the founder (and, where engaged, the lawyer) makes every substantive call and holds every credential. This closes the "no owner" finding without violating the hard floor.
2. **Re-scope Support's stated remit to match reality, and treat "finish the ring wiring" as its own build task, separate from the AO program.** The manual's "already deployed and running" claim should be corrected at the next opportunity a Support-touching session runs (not this session — this is analysis, not an edit). Until the run-loop is mounted (or the founder decides it never will be, given the manual triage flow already works), Support's honest remit is: chat-persona advisory + founder-manual ticket triage, not autonomous processing.
3. **Do not split Growth into "marketing" and "growth."** The reconciliation found the content-workflow and competitive-intel gaps are process/cadence definitions missing *within* Growth's existing remit, not evidence of a genuinely separate function Growth is silently failing to cover. **Recommend:** re-scope by adding an explicit content-workflow definition (founder drafts → Growth reviews → founder publishes, on a stated cadence) as a documented process, not a new agent.
4. **Formalize a lightweight escalation/support-ops decision set as its own short founder decision, not a build.** #11 (support@ monitoring), #12 (human escalation), #15 (email vendor), #21 (rollback owner) are all genuinely ORG_DECISION items with near-zero build cost once decided. **Recommend bundling these into one short founder decision pass**, ideally before or alongside P-GL, since they gate the go/no-go checklist item #16 and several are safety-adjacent (a vulnerable-user product needs a reachable, watched support channel — this is not merely an efficiency nicety).
5. **Mentor should not be treated as part of this "staffing" roster at all.** It is the product's own user-facing reflection surface, already Live on a distinct, mature architecture, with no analog to "an agent that needs a calling and a harness to do staff work." Recommend excluding it from P4's rollout list (see §5) — re-harnessing it under the AO program's UPC/Gate-1 pattern would be duplicative of work already done, and conceptually mismatched (P4 harnesses *staff*, not the *product*).
6. **The inter-agent-handoff protocol should be either activated or explicitly retired,** not left in an ambiguous "Designed but maybe used" state. If any of tech/growth/support/ops move into P4 harnessing, this is worth resolving first — otherwise P4 will provision new identities for agents whose *existing* coordination mechanism is unconfirmed to even be running.

---

## 5. Ranked order for P4 + election E1 (surfaced, not decided)

Per §1a, the evidence dividend (Track B) applies **only** to agents whose E1 resolves to the Claude-Code-loop + Gate-1-harness surface. The ranking below weighs **org-urgency** and **evidence-dividend fit** together and states explicitly where they pull apart.

| Rank | Agent | Org-urgency | Evidence-dividend fit (does its real work look like Claude-Code-loop work?) | Recommended E1 (founder decides) |
|---|---|---|---|---|
| **1** | **Tech** | Moderate-high — system-health monitoring, endpoint inventory, known-issues tracking are exactly the kind of task this project already runs inside Claude Code sessions. | **High.** Its actual work (reading code/state files, drafting fixes, running diagnostics) is the same shape as the sessions that build this very project. Lowest risk that its calling reads as decorative. | Claude-Code-loop + Gate-1 harness |
| **2** | **Ops** | High — directly touches several of the freshest, most concrete gaps this session found (migration-strategy formalization, the incident/rollback runbook, go-live-checklist maintenance). | **High** — drafting checklists, monitoring decision-log/KG state, and maintaining runbooks are native Claude-Code-loop tasks. | Claude-Code-loop + Gate-1 harness |
| **3** | **Growth** | Moderate — content and positioning work matters for launch but is not itself safety- or legal-blocking. | **Moderate** — drafting blog/social content and running competitive web research fit a code loop reasonably (via WebSearch/WebFetch), though less naturally than Tech/Ops's file-and-state-centric work. | Claude-Code-loop + Gate-1 harness, or website runtime if the founder prefers a lighter-weight rollout for Growth specifically |
| **4** | **Support** | **Highest** of the four by a wide margin — vulnerable-user-adjacent, and its live support@ channel is confirmed unmonitored. | **Lowest.** Its real work (drafting replies to customer emails, triaging tickets) does not naturally happen inside a Claude Code terminal loop; forcing it onto Gate-1 would likely produce a decorative calling. **This is the clearest case where org-urgency and evidence-fit pull apart** — the AO program should not be read as the vehicle for fixing Support's urgent gaps. Those (§4.4 above) are better solved by a founder decision + finishing the pre-existing ring-architecture mount, independent of P4. | Website runtime channels (org function only, no evidence dividend), or defer Gate-1 harnessing of Support until the ring run-loop question is separately resolved |
| **N/A** | **Mentor** | N/A — not a staffing gap; it is the product. | N/A | Not part of this rollout (see §4.5) |

**If the founder wants P4 to close the single most urgent gap this session found (support-channel monitoring), the right move is a founder decision + a small, separately-scoped build (mount the existing `processInboxItemWithGuard` run-loop, or simply confirm/staff the mailto inbox) — not a P4 harnessing session for Support.** P4's evidence-dividend logic favors starting with Tech.

---

## 6. Folded rider — light R18 claims-vs-code spot-check

Kept deliberately light per plan §3-P1/SEQ-10 (one rider per close; findings feed this gap map only, no edits made).

- **`agent-card.json` extension count is consistent** with CLAUDE.md's most recent claim (18 extensions, counted directly from the file — matches the AE-1 trajectory-delta refresh's stated count). No drift found here.
- **Two different support-contact addresses appear across public/internal surfaces with no reconciliation:** `support@sagereasoning.com` (the `terms/page.tsz` mailto intake, per reconciliation #11 — monitoring unconfirmed) and `zeus@sagereasoning.com` (named in `agent-card.json`'s `authentication.credentials` and the `sage-assent-write-auth/v1` extension as the contact for free-key requests and token issuance). Neither address's monitoring status is verifiable from the repo. This compounds finding §3's support-monitoring gap rather than introducing a new one — worth folding into whatever founder decision resolves #11, so both addresses (not just one) get an owner.
- No other drift found in the light pass; a full R18 audit (all claims in `llms.txt` + `agent-card.json` + api-docs against current code) was out of scope for this light rider and is not attempted here.

---

## 7. Summary for the founder

- **The biggest surprise this session found is architectural:** the five Sage agents run on a different, mostly-unfinished system (the "ring") than the one P4 will provision (Gate-1/UPC). Finishing one does not finish the other.
- **The support agent's manual overstates what is live.** Its automated run-loop was designed and unit-tested in April but never connected to anything — there is no live automated support processing today, only manual founder triage plus an unmonitored `support@` mailbox.
- **No genuinely new agent role is warranted.** Every named gap (legal, finance, security-ops, escalation, email vendor, migration strategy) is either a founder-plus-Ops tracking task or a founder-plus-external-professional decision — not a staffing gap that needs a sixth persona.
- **Tech is the strongest first P4 candidate**, both for org value and for genuinely feeding the evidence program; Support is the most organizationally urgent but the weakest fit for Gate-1 harnessing, and its urgent gaps are better solved directly.

---

## Cross-references
- `operations/agent-org-2026-07/agent-org-and-evidence-build-plan.md` (§1, §1a, §2, §3-P1)
- `operations/agent-org-2026-07/2026-07-19-launch-feedback-reconciliation.md`
- `operations/handoffs/founder/2026-07-19-P1-agent-roster-gap-analysis-NEXT-SESSION-PROMPT.md`
- `operations/handoffs/founder/2026-07-19-P-GL-go-live-checklist-and-gate-builds-NEXT-SESSION-PROMPT.md`
- `operations/incidents/2026-07-17-public-credential-exposure-s9-loop.md`
- `.claude/skills/sage-wiring-fix/SKILL.md`
- `operations/handoffs/support/support-wiring-fix-close.md`, `support-wiring-mount-close.md`
- `operations/handoffs/tech/tech-wiring-fix-close.md`, `context-loader-stub-fix-close.md`
- `operations/handoffs/growth/growth-wiring-fix-close.md`
- `operations/handoffs/ops/ops-wiring-fix-close.md`
- `operations/inter-agent-handoff-protocol.md`
- `operations/Support_Agent_Implementation_Plan.md`, `SageReasoning_Support_Agent_Manual.docx`
- `users-guide-to-sagereasoning.md` (Ch. 22–23)

*End of gap map. Analysis only — no activation, mint, install, or edit performed or recommended for immediate action. The founder acts on any of the above one founder-walked step at a time.*
