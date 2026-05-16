# Session Close — 2026-05-16 — A10 Design Pass + Post-Session Brainstorm (re-ordering of the post-6b arc's tail)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol — `governance` row → **Lean** template) + `/adopted/build-sessions-protocol-cache.md` (build-arc context — "no current users" governing note applies; CCP step 3 will be moot through the A10 build).
**Tier:** `governance` — **Standard** risk under 0d-ii. Lean template. Critical Change Protocol NOT engaged this session (engages at the A10 build session).
**Date:** 2026-05-16.

> **Read this close in TWO parts.**
> **Part 1** records what the structured A10 design-pass session did (Steps 0–6).
> **Part 2** records what the post-session brainstorm surfaced: an inbox-file review that produced a correction to the A10 design + a founder-elected re-ordering of the work tail. The "Next Session Should" block reflects the post-brainstorm direction, not the structured-session direction.

---

## Part 1 — What the structured session did

Produced `/adopted/atl-a10-design.md` (the A10 per-agent-credentials design — nine locked decisions A–I) and appended `D-ATL-A10-DESIGN-LOCKED-2026-05-16` to the decision log. This was the **design half** of step 8 — no code landed in this session.

The design's load-bearing finding: the existing `/website/src/lib/security.ts` carries a mature opaque-token system (`api_keys` table + `validateApiKey` function + admin endpoint at `/api/admin/api-keys`) that handles ~95% of what A10 needs — SHA-256 hashing, suspension mechanics, atomic usage tracking, Stripe linkage, admin-authorisation pattern. PR15's operational discipline turned this into the dominant influence on the design: the session elected an "extend existing infrastructure" path across all nine decisions.

**Part A** — read both caches (standing + build-arc); the predecessor write-path build close; Decision C of `/adopted/atl-write-path-design.md` in full; the kathekon-aligned alternative design as the structural template; the three targeted code files (`route.ts` auth-gate site, `security.ts` for auth precedents, `supabase-server.ts` for the persistence seam); the last three decision-log entries; the agentic-commerce findings tracker; the `.claude/skills/anthropic/` skills folder. PR11 inbox scan at session-open: no new files since the predecessor write-path build close.

**Step 0** — scope confirmed via AskUserQuestion ("Proceed as scoped"): nine-question design pass producing the design document + lean decision-log entry + lean close.

**Step 1** — eight prompt-named questions surfaced (Q1–Q8) plus one added (Q1.5 — issuance authority + agent_id binding). Founder accepted the nine-question set without modification.

**Step 2** — three AskUserQuestion rounds; all nine elections matched the AI's recommendations.

| Round | Questions | Founder's elections |
|---|---|---|
| 1 of 3 | Q1 (token format), Q1.5 (issuance authority + binding), Q2 (credential storage) | (d) Opaque token + server lookup; (d) Per-owner-account, founder-only mint pre-launch; (b) Extend `api_keys` table |
| 2 of 3 | Q3 (issuance flow), Q4 (verification placement), Q5 (revocation), Q6 (rotation/expiry) | (b) `/api/admin/accreditation-credentials`; (b) `security.ts` alongside `validateApiKey`; (a) Reuse `is_active` + add `revoked_at`; (a) No expiry, only revocation |
| 3 of 3 | Q7 (audit trail), Q8 (stopgap retirement) | (c) Vercel logs + Supabase audit table; (b) Keep `SUBSTRATE_WRITE_PATH_ENABLED` as kill-switch |

**Step 3** — `/adopted/atl-a10-design.md` written in a single Write call, modelled on `/adopted/atl-kathekon-aligned-alternative-design.md`'s seven-decision-pass shape, extended to nine decisions.

**Step 4** — founder verification via AskUserQuestion: "Yes — proceed to decision-log + close." No edits requested.

**Step 5** — `D-ATL-A10-DESIGN-LOCKED-2026-05-16` appended in lean form. Nine sub-decisions summarised; ~22 deferred items named under PR7; PR15 election (extend `api_keys`) recorded.

**Step 6** — this close (Part 1).

After Step 6 the founder pushed the design-pass commit; Vercel reported green (no-op rebuild — no code change). The structured session closed at that point.

---

## Part 2 — Post-session brainstorm and re-ordering

After the structured session closed, the founder placed two files in `/inbox/` and asked the AI to read them against the A10 design + the write-path build, then confirm the current billing model and identify how to make billing per-loop and not solely an LLM-API multiplier.

### Files reviewed

- `/inbox/20260508-262-promptkit-1.md` — Nate B Jones's "SaaS Renewal Agent License Prompt Kit" (Prompt 1: Agent System Touch Map; Prompt 2: Renewal Interrogation). Eight-vendor pattern (Salesforce / Microsoft / ServiceNow / SAP / Workday / Zendesk / HubSpot / Atlassian). Operation taxonomy. Governed-path-only-vs-open-API-vs-ambiguous flags. Identity-model attribution.
- `/inbox/Related to agent API billing.rtf` — The companion essay. "A seat prices access to software. An agent license prices delegated work." Nine traits of a fair agent license. The three buckets of questions every renewal should ask. The CFO-question shift from "how many licenses?" to "what work is moving through this platform, and what is the cost per completed unit of work?"

### Finding 1 — A10 design correction (`owner_user_id` + `agent_id` already exist on `api_keys`)

The A10 design's Decision C says "Extend `api_keys` table with `agent_id`, `owner_user_id`, `purpose`, `revoked_at` columns." The first two are **already there** in production. The current schema at `/api/api-keys-schema.sql` carries:

- `agent_id TEXT` (optional, self-reported by the developer at key-mint time)
- `owner_user_id UUID REFERENCES public.profiles(id)`
- `owner_email TEXT`
- An index `idx_api_keys_owner_user_id`

`/api/usage/route.ts` and `/api/keys/route.ts` already query `owner_user_id` as of 2026-05-09. The Stripe billing schema's `upgrade_api_key_to_paid` + `downgrade_api_key_to_free` RPCs key off `owner_user_id`. The plumbing for owner-account binding exists.

**Implication:** A10's migration is narrower than the design said. Only `purpose` + `revoked_at` are NEW; the two unique/lookup indexes scoped to `purpose='atl_write'` are NEW; everything else is reuse. There is also a semantic shift to record: the existing `api_keys.agent_id` is **self-reported and unverified** on existing ecosystem rows; post-A10, for `purpose='atl_write'` rows, `agent_id` becomes **load-bearing for auth**. The build needs an application-level invariant: `WHERE purpose='atl_write'` rows have NOT NULL `agent_id` + NOT NULL `owner_user_id`.

The A10 design is not patched this session. The correction is recorded here and will be incorporated when the A10 design is rewritten (see "Re-ordering" below).

### Finding 2 — Current billing model is per-call, not per-loop

Surveyed: `/api/api-keys-schema.sql`, `/api/migrations/stripe-billing-schema.sql`, `/business/STATUS-REVENUE-MODEL.md`, `/website/src/lib/stripe-projects.ts`, `/website/src/lib/r20a-cost-tracker.ts`, manifest §R5, `/website/src/app/api/score-iterate/route.ts` for the chain-iteration enforcement, the marketplace + api-docs pages for advertised pricing.

| Element | Current state |
|---|---|
| Pricing model | Per-API-call (count-based); NOT per-loop or per-outcome |
| Free tier | `monthly_limit=30`, `daily_limit=1`, `max_chain_iterations=1` |
| Paid tier | `monthly_limit=10,000`, `daily_limit=500`, `max_chain_iterations=3`; ~$0.0025/call |
| Wrapper invocation | 2–3 API calls per loop (guard + score + optional iterate) — billed as 2–3 separate units |
| R5 manifest rule | "Paid-tier revenue must cover at least 2x the LLM API costs" — enforced retrospectively via `cost_health_snapshots`, not built into the pricing formula |
| Cost tracking | `r20a-cost-tracker.ts` exists for the safety classifier only; no equivalent for `/api/reason` |
| Stripe Projects | Designed; not yet built (placeholder file) |
| Outcome-based billing infrastructure | None — kathekon signal exists in the substrate but is not wired to billing |

**The flaw the founder named:** per-call doesn't reflect business value. A loop with 5 LLM iterations costs the same to bill as one with 1 LLM iteration, but the founder absorbs the LLM-cost variance. R5's 2x ratio is a retrospective alert, not a forward pricing dial.

### Finding 3 — Six missing pass-through fields for wrapped agents to satisfy enterprise reviews

The Nate B Jones essay names what enterprise procurement / security / CFO reviews ask of an AI agent. Mapped against what the substrate captures today, six fields are missing:

1. **`operation_class`** on `EvaluatedAction` (`read | search | summarize | draft | recommend | write | approve | execute | delete`) — taxonomy from Prompt 1; lets the audit trail filter by operation kind.
2. **`downstream_identity_model`** on `CarriedProfile` (`delegated_user | service_account | vendor_framework | api_key | browser_session | mcp_server | unknown`) — answers "under what identity does this agent act?" for the SaaS systems the wrapped agent touches.
3. **`path_posture`** on the action or carried profile (`endorsed | open_api | ambiguous | unsanctioned`) — the red/yellow/green flag for governed-path compliance.
4. **`target_system`** per-action (`salesforce | microsoft | servicenow | sap | workday | zendesk | hubspot | atlassian | other | none`) — vendor-system touch list for the Prompt 1 output.
5. **`outcome_verification`** (`auto | human_approved | human_rejected | pending | n_a`) — the human-in-the-loop signal that distinguishes autonomous from approved actions. Load-bearing for outcome-aligned billing per the essay's fair-license criteria.
6. **`reversibility_signal`** on the substrate's response — exposed back to the wrapped agent at consultation time so it can implement "ask before executing irreversible high-cost actions" cleanly.

### Decision — Option D billing model elected

Of four billing options presented (A per-loop flat-rate; B per-verified-outcome; C tiered per-action; D per-loop base + LLM-token-cost overage), the founder elected **Option D**.

Concretely:
- Per-loop base rate (e.g., $0.02 — exact rate to be elected in the design session) — covers a typical 1–2 iteration loop with margin.
- Token overage: if a loop's combined Anthropic input + output token cost > a per-loop budget (e.g., $0.01), charge the difference + a configurable margin.
- R5 2x ratio becomes prospective (built into the formula) rather than retrospective (alert when violated).
- `cost_health_snapshots` keeps its role as a sanity check on the formula.

### Decision — Re-ordering the post-6b arc tail

The founder elected the following new sequencing (replacing "A10 build is the immediate next session"):

| # | Session | Risk | Spec produced |
|---|---|---|---|
| **1** | **Option D billing design pass** (governance) | Standard | `/adopted/billing-model-design.md` + decision-log entry |
| 2 | Option D billing build | Critical | Code lands the per-loop billing infrastructure |
| 3 | Pass-through fields design pass (governance) | Standard | `/adopted/wrapped-agent-passthrough-fields-design.md` + decision-log entry |
| 4 | Pass-through fields build | Elevated | Code lands the six new fields across the type system, audit trail, and (where applicable) Layer 1 |
| 5 | A10 design rewrite (governance) | Standard | Supersedes `D-ATL-A10-DESIGN-LOCKED-2026-05-16` with corrections from Finding 1 + integration with Option D billing's `credential_audit` + pass-through fields' impact on the credential surface |
| 6 | A10 build | Critical | Code lands per-agent credential verification per the rewritten design |

The post-6b arc closes at session #6 instead of #2 — the arc grows from 1 step (A10 build) to 5 steps. The substrate stays at its current Live-but-inert state (write surface gated by `SUBSTRATE_WRITE_PATH_ENABLED='true'` which remains UNSET) throughout. The pre-A10 stopgap continues to function as the kill-switch indefinitely; no rush on A10 because no current users.

**The A10 design document at `/adopted/atl-a10-design.md` remains Adopted** until session #5 supersedes it. `D-ATL-A10-DESIGN-LOCKED-2026-05-16` keeps status `Adopted` until then. The known correction (Finding 1) is recorded here and will be folded into the rewrite.

---

## Decisions Made

- **`D-ATL-A10-DESIGN-LOCKED-2026-05-16`** appended (lean form) during Part 1. Status: Adopted; will be Superseded at session #5 above.
- **Post-session brainstorm decisions** (not in decision log this session — they're elections that scope the next sessions, not adoption of a designed artefact):
  - Option D billing model elected by the founder.
  - Six pass-through fields scoped (full design at session #3).
  - Re-ordering of the post-6b arc tail to (Option D design → Option D build → pass-through design → pass-through build → A10 rewrite → A10 build).
  - A10 design correction (Finding 1) recorded for incorporation at the A10 rewrite session.

The brainstorm decisions are not appended to the decision log this session because they are *scope-shaping* decisions for future sessions, not adoptions of designed artefacts. The Option D design pass (session #1 above) will produce the canonical `D-BILLING-MODEL-LOCKED-YYYY-MM-DD` entry; the pass-through fields design pass will produce `D-WRAPPED-AGENT-PASSTHROUGH-FIELDS-DESIGN-LOCKED-YYYY-MM-DD`; the A10 rewrite will produce `D-ATL-A10-DESIGN-REVISED-YYYY-MM-DD` that supersedes today's entry.

---

## Status Changes

| Item | Old | New |
|---|---|---|
| A10 per-agent credentials (post-6b arc step 8) | **Scoped** | **Designed** under `D-ATL-A10-DESIGN-LOCKED-2026-05-16` — design will be rewritten at session #5 above; correction from Finding 1 incorporated then |
| `/adopted/atl-a10-design.md` | did not exist | **Adopted** (decision); **Designed** (implementation); known correction recorded in this close pending the rewrite session |
| Pre-A10 stopgap retirement question | **Open** | **Resolved** by Decision I (kill-switch retention); still operative through sessions #1–#6 above |
| Token format ADR (build-arc cache Q4) | **Open** | **Resolved** by Decision A (opaque tokens); will be confirmed at the A10 rewrite session |
| Billing model | **Per-call (count-based)** | **Option D elected** (per-loop base + LLM-token overage); design pass scheduled as session #1 of the new ordering |
| Wrapped-agent pass-through fields | **None scoped** | **Six fields scoped** (operation_class, downstream_identity_model, path_posture, target_system, outcome_verification, reversibility_signal); full design at session #3 of the new ordering |
| Post-6b arc length | **2 steps remaining** (A10 design + build) | **5 steps remaining** (Option D design + build + pass-through design + build + A10 rewrite + A10 build) |
| Production state | A7 Verified; write-path Live but inert; `/api/reason` byte-identical; `/api/substrate/layer3` returns 503; `/api/accreditation/[agent_id]` Live (GET 404 / POST 503); both ATL tables empty | **Unchanged** — no code, schema, env, or production exposure this session |

---

## Next Session Should

**Session #1 of the new ordering — Option D billing model design pass.** Governance-tier; Standard risk; Lean template. Estimated ~2.5–3 hr. The next-session prompt is at:

`/operations/handoffs/founder/2026-05-16-billing-model-design-NEXT-SESSION-PROMPT.md`

Open the prompt, paste it into a fresh session, and proceed. The prompt names ~8 design decisions covering loop definition, base rate, overage trigger, overage rate, cost tracking surface, migration path, R5 enforcement transition, and communication surface.

After session #1 closes, the founder elects whether the natural next session is the Option D build (session #2) or whether to compress the arc differently. Sessions #2–#6 are sequenced but not pre-scheduled.

The A10 build prompt at `/operations/handoffs/founder/2026-05-16-A10-build-NEXT-SESSION-PROMPT.md` is **deferred** but retained as a reference for session #6. The prompt will need rewriting at session #5 (the A10 design rewrite) before it's used.

---

## Blocked On

**Files remaining uncommitted (to be committed by the founder — this is the SECOND commit of the session, post-brainstorm):**

```
 M operations/handoffs/founder/2026-05-16-A10-design-pass-close.md     (rewritten — added Part 2 brainstorm section + re-ordering)
?? operations/handoffs/founder/2026-05-16-billing-model-design-NEXT-SESSION-PROMPT.md   (NEW — the next-session prompt for session #1 of the new ordering)
```

The earlier files from this session (`/adopted/atl-a10-design.md`, `D-ATL-A10-DESIGN-LOCKED-2026-05-16` in `/operations/decision-log.md`, the now-rewritten close, and the now-deferred A10-build prompt) were committed + pushed by the founder before the brainstorm. This second commit adds the brainstorm outputs.

**Production state at session close:** unchanged. Substrate at A7 Verified. `SUBSTRATE_LAYER3_ENABLED` UNSET. `SUBSTRATE_R20A_GATE_ENABLED` UNSET. `SUBSTRATE_WRITE_PATH_ENABLED` UNSET (write surface inert). `/api/reason` byte-identical. `/api/substrate/layer3` returns 503. `/api/accreditation/[agent_id]` Live for GET + POST (POST returns 503). Both ATL tables empty. `api_keys` table holds existing ecosystem keys only; the new A10 columns + `credential_audit` table are NOT yet added (and won't be until session #6 build lands).

---

## Open Questions

(Carried forward from Part 1 unless otherwise noted.)

- **A10 design correction — `owner_user_id` + `agent_id` already exist on `api_keys`** (NEW from Part 2). The A10 design's Decision C is wrong on two of four columns. Revisit condition: session #5 (A10 design rewrite). Until then, the design is Adopted-with-known-correction; the correction is not patched in-document because the rewrite will reconstruct the relevant sections anyway.
- **Option D base rate, overage trigger, overage rate, migration path** (NEW from Part 2). Open until session #1 (Option D billing design pass) elects them.
- **Pass-through-fields scoping detail** (NEW from Part 2). Six fields scoped at headline level; the full design (Layer 1 implications, ordering, parallel-vs-serial work) is open until session #3.
- All ~22 PR7-deferred items from Part 1 carry forward unchanged. Revisit conditions per the decision-log entry.

---

## Founder Verification

**Two things to do, in order. Take them one at a time — do not paste the blocks as multi-line commands per the CLAUDE.md note about prompt-consumption.**

### 1. Read the new next-session prompt between sessions

Open `/operations/handoffs/founder/2026-05-16-billing-model-design-NEXT-SESSION-PROMPT.md` in a text viewer. Confirm the scope (Option D billing model design) matches your election from the brainstorm. The prompt is what you'll paste into the next session.

If the scope needs adjusting (e.g., you'd rather combine Option D design + pass-through fields scoping into one session, or you'd rather start with a different session in the arc), message me. Edits to a next-session prompt are governance-Standard.

### 2. Commit and push (second commit of the session, post-brainstorm)

Use targeted adds (explicit paths, not `git add -A`). Run each command on its own line:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
```

```
rm -f .git/index.lock
```

```
git add operations/handoffs/founder/2026-05-16-A10-design-pass-close.md
```

```
git add operations/handoffs/founder/2026-05-16-billing-model-design-NEXT-SESSION-PROMPT.md
```

Then the commit (one command, but multi-line message — paste the whole block including the closing `"`):

```
git commit -m "Re-order post-6b arc tail post-brainstorm

After the A10 design pass closed, the founder placed two inbox files
(Nate B Jones SaaS-renewal-agent-license prompt kit + companion essay)
in /inbox/ and asked the AI to review them against the A10 design + the
write-path build. The brainstorm produced:

  - Finding: A10 design's Decision C is wrong on two of four columns
    (api_keys.agent_id + owner_user_id already exist in production).
    Correction recorded in the rewritten close; will be folded into
    the A10 design rewrite at session #5 of the new ordering.
  - Finding: current billing model is per-API-call, not per-loop.
    Founder absorbs LLM-cost variance. R5's 2x ratio is retrospective.
  - Finding: six wrapped-agent pass-through fields are missing for
    enterprise procurement/security/CFO reviews (operation_class,
    downstream_identity_model, path_posture, target_system,
    outcome_verification, reversibility_signal).
  - Decision: founder elected Option D billing — per-loop base rate
    + LLM-token-cost overage with margin.
  - Decision: re-order the post-6b arc tail to (Option D design →
    Option D build → pass-through design → pass-through build →
    A10 rewrite → A10 build). The post-6b arc closes at session #6
    instead of #2.

The A10 design at /adopted/atl-a10-design.md remains Adopted until
session #5 supersedes it. The A10 build prompt is deferred but
retained as a reference for session #6.

Standard risk; governance only; no code, schema, env, or production
exposure. AC7 not engaged; PR6 not engaged.

Next: session #1 — Option D billing model design pass."
```

Then push via **GitHub Desktop**.

**Expected Vercel behaviour:** no rebuild — only governance files changed. Production state unchanged.

---

## Cross-references

- Operative session prompt (Part 1): the A10 design-pass next-session prompt provided at session open.
- Predecessor session close: `/operations/handoffs/founder/2026-05-16-write-path-build-close.md`
- Sequencing source: `/operations/handoffs/founder/2026-05-15-post-build-brainstorm-close.md` (the post-6b arc — now extended by 4 steps per Part 2)
- Design document (A10 — Adopted, will be Superseded at session #5): `/adopted/atl-a10-design.md`
- Decision-log entry (A10 design — Adopted, will be Superseded at session #5): `D-ATL-A10-DESIGN-LOCKED-2026-05-16`
- Predecessor decision-log entries: `D-ATL-WRITE-PATH-BUILD-WIRED-VERIFIED-2026-05-16`; `D-ATL-WRITE-PATH-DESIGN-LOCKED-2026-05-16`.
- Structural template: `/adopted/atl-kathekon-aligned-alternative-design.md`.
- PR15 reuse target: `/website/src/lib/security.ts`.
- Future build target route: `/website/src/app/api/accreditation/[agent_id]/route.ts`.
- Future build target admin endpoint precedent: `/website/src/app/api/admin/api-keys/route.ts`.
- F-tracker: `/operations/agentic-commerce-findings-downstream-order.md` (F4 named in A10 design under Decision H — relationship unchanged by Part 2).
- Governance: `/adopted/standing-protocol-cache.md` (Lean templates); `/adopted/build-sessions-protocol-cache.md` ("no current users" governing note; open-questions parking lot Q4).
- Manifest: `/manifest.md` — particularly §R5 (the rule Option D operationalises as a prospective formula instead of retrospective alert).
- **Inbox files reviewed in Part 2:** `/inbox/20260508-262-promptkit-1.md` (the Nate B Jones prompt kit); `/inbox/Related to agent API billing.rtf` (the companion essay).
- **NEW next-session prompt (Part 2 successor):** `/operations/handoffs/founder/2026-05-16-billing-model-design-NEXT-SESSION-PROMPT.md`
- **DEFERRED next-session prompt (now session #6 reference):** `/operations/handoffs/founder/2026-05-16-A10-build-NEXT-SESSION-PROMPT.md` — needs rewriting at session #5 before use.
- Current billing-infrastructure files surveyed in Part 2: `/api/api-keys-schema.sql`; `/api/migrations/stripe-billing-schema.sql`; `/website/src/lib/stripe-projects.ts` (placeholder); `/website/src/lib/r20a-cost-tracker.ts`; `/website/src/app/api/admin/api-keys/route.ts`; `/website/src/app/api/score-iterate/route.ts` (chain-iteration enforcement); `/business/STATUS-REVENUE-MODEL.md`.

*End of session close. With the post-brainstorm commit pushed, the post-6b arc tail is re-ordered: Option D billing design comes first; A10 build is deferred until five sessions later (after Option D builds, after pass-through fields land, after the A10 design is rewritten). The substrate stays inert throughout — `SUBSTRATE_WRITE_PATH_ENABLED` UNSET — until the founder elects when to enable writes post-A10-build.*
