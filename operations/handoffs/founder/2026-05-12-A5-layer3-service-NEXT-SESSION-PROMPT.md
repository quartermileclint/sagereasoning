# Next-Session Prompt — A5: Layer 3 Server-Side Service (Scaffolding)

**Stream:** founder.
**Tier:** code-critical (per `/adopted/standing-protocol-cache.md` §"Work categories"). A5 is Critical-risk under PR6 + AC5 because the Layer 3 service is the third-layer R20a defence (deterministic injection of distress pass-through statement). The full templates apply; the lean form does not. **Critical Change Protocol (0c-ii) engages at deployment time** — see Part B Step 5.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` + the amended staging plan + the amended manifest + the project-instructions snapshot.
**Predecessor session close:** `/operations/handoffs/founder/2026-05-12-adoption-session-close.md` (ST2 amendments adoption; stress-test arc CLOSED).
**Predecessor decision-log entries:** `D-STAGING-PLAN-AMENDED-FROM-ST2-2026-05-12`; `D-MANIFEST-AMENDED-FROM-ST2-2026-05-12`; `D-PROJECT-INSTRUCTIONS-AMENDED-FROM-ST2-2026-05-12`; `D-CACHE-DRIFT-RESOLVED-2026-05-12`; `D-A4-KEY-MANAGEMENT-WIRED-VERIFIED-2026-05-10` (the most recent substrate-build decision-log entry — last code surface change).
**Risk classification:** **Critical** under 0d-ii. AC5 + AC7 + PR6 all engage (R20a perimeter; auth surface for plugin-originated calls into A5; safety-critical function chain through A5 → Layer 3 distress pass-through injection). **Critical Change Protocol applies** — see §"Critical Change Protocol pointer" below. The session-as-a-whole is Critical.

## Why this session matters

A5 is the third-layer R20a defence. Layer 2's R20a gate (A7, still Scoped) guards the Layer 2 API; A5's Layer 3 service deterministically injects the distress pass-through statement into every prose output, so that even if Layer 1's in-plugin script and A7's server-side gate both miss a distress signal (or if a future regression weakens them), Layer 3 still surfaces appropriate redirection language. This is the "no single point of failure" architecture for R20a.

A5 is also the load-bearing service for the K-category migration (Stage 2): every consumer migrating from bundled-prose to translation-sandwich needs Layer 3 to handle their `prose_mode` (clinical / terse / standard / educational; per A6 enum). Until A5 is Verified, no K-category migration can begin.

This session is **A5 scaffolding** — the service stub, the `prose_mode` parameter plumbing, the deterministic injection patterns for R3 + R19 + R20a, and the basic verification harness. **A5 wired-to-production** depends on A7 (R20a gate) being wired first; the indicative packaging in the staging plan has A7 in session 9 and A5 Verified in session 9 too. This session is session 8.

## Pre-conditions

1. **Adoption session committed + pushed.** Confirm `git log --oneline -1 origin/main` shows the adoption-session commit (`0e9c670 ST2 amendments adoption session close (2026-05-12)` per current state at prompt drafting).
2. **Project-instructions snapshot paste-synced into Cowork panel.** Founder confirms this between-session task is complete at session-open. If not, the AI should note that the operative Cowork-panel content still shows the pre-ST2 project instructions and PR10-PR16 are only authoritative via the repo snapshot for this session.
3. **Production state unchanged from adoption-session close.** Founder runs the `/api/public-key` probe between sessions; confirms steady state at session-open (sandbox cannot reach `sagereasoning.com` from this session's environment per documented limitation).
4. **A1, A2, A3, A4 still Verified.** No regression since adoption session.
5. **Founder commits to a 3-4 hour bounded session** — Critical-tier session needs sustained attention through the Critical Change Protocol steps + verification.

## Critical Change Protocol pointer (for §Part B Step 5)

Per project instructions 0c-ii (and PR6 — safety-critical changes always Critical risk), before the founder deploys this session's A5 scaffolding, the AI completes inline:

1. **What is changing** — plain language; what A5 does from the founder's perspective.
2. **What could break** — specific worst-case failure modes (e.g., "if the Layer 3 service fails open, prose without R20a distress pass-through could reach a vulnerable user").
3. **What happens to existing sessions** — for the build arc, this remains N/A per the build-sessions cache's "No current users (affirmed 2026-05-10)" note. The AI states this explicitly.
4. **Rollback plan** — exact `git revert` command + any env-var or config rollback steps.
5. **Verification step** — what the founder runs (URL + expected output, or `curl` + `python3` snippet); what to do if the result is different.
6. **Explicit founder approval** specific to the named risks.

Do not abbreviate this protocol. The full close note for this session will include Verification Method Used, Risk Classification Record, PR5 Knowledge-Gap Carry-Forward, Founder Verification (Between Sessions), and Orchestration Reminder per the standing cache's §"Critical-risk sessions" guidance.

## Part A — Open under the protocol

Read in order (full canonical-source reads required for code-critical category per standing cache Element 2):

1. **`/adopted/standing-protocol-cache.md`** (~3 min) — confirms tier (code-critical); model selection (Sonnet for Layer 3 translation per AC1 row); KG register; signals (including the new diagnostic-certainty rows from ST2); risk classification (Critical).
2. **`/adopted/build-sessions-protocol-cache.md`** (~3 min) — confirms build-arc context; agreed architecture (Layer 3 stays closed; deterministic injection); no-current-users note (simplifies CCP step 3).
3. **`/operations/handoffs/founder/2026-05-12-adoption-session-close.md`** (~5 min) — predecessor close; confirms ST2 amendments adopted; substrate at A4 Verified.
4. **`/adopted/substrate-plugin-staging-plan.md` §Stage 1 — A5, A6, A7, A9** (~10 min) — the operative item description for A5, including its `prose_mode` (A6) and R20a-gate (A7) dependencies; the indicative packaging for session 8.
5. **`/manifest.md`** — read these sections in full:
   - **R3** — Disclaimer on evaluative output (Layer 3 deterministically injects this disclaimer per A5 scope)
   - **R17** (all sub-rules a-i, including the new R17g/h/i) — context for what intimate data Layer 3 must not leak
   - **R18a** — Certification scope language + Character Kernel category (Layer 3 prose carries this framing in its output)
   - **R18e** — Article 50 transparency placeholder (Layer 3 prose carries the transparency notice; placeholder language adopted under ST2)
   - **R19** (all sub-rules a-d) — Honest positioning + mirror principle (Layer 3 injects R19c limitations link + R19d mirror principle reminders)
   - **R20** (all sub-rules a-d, including the R20a perimeter potential-broadening placeholder added under ST2) — Active protection; R20a distress pass-through is the most critical Layer 3 injection
   - **AC1** — Model selection (Sonnet for Layer 3 translation; cite the row)
   - **AC2** — Safety system latency budget (Layer 3 is downstream of distress classifier; A5 must not add latency to the classifier path)
   - **AC4** — Invocation testing for safety functions (A5 + its R20a injection function require both functional + invocation tests)
   - **AC5** — R20a enforcement perimeter (A5 is downstream of the perimeter; the perimeter triggers A5's deterministic injection)
   - **AC7** — Session 7b standing constraint (A5 introduces plugin-originated traffic into Layer 3; auth-surface posture must be named)
   - **AC8** — Translation-sandwich architectural constraint (A5 is the Layer 3 of the translation sandwich)
   - **AC9** (new under ST2) — Layer2Decision four-outcome envelope (A5 reads the four-outcome decision field; deterministic routing depends on it)
   - **AC10** (new under ST2) — Provenance + use-policy tags (A5 reads these tags; deterministic projection depends on them)
   - **AC11** (new under ST2) — OpenTelemetry GenAI semantic conventions (A5's instrumentation lands at A12; A5 scaffolding emits the spans even if A12 is not yet wired)
6. **`/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md`** (~15 min) — the existing Layer 3 prose template ADR (currently in `/adopted/adr/`; covers `/api/reason`'s Layer 3 prose generation — the closest pre-existing reference for A5 scaffolding).
7. **`/adopted/adr/2026-05-12-substrate-category-character-kernel.md`** (~5 min) — J1 ADR; the Character Kernel category language Layer 3 prose carries.
8. **`/operations/decision-log.md`** — read the last 3 entries (`D-A4-KEY-MANAGEMENT-WIRED-VERIFIED-2026-05-10`; `D-STAGING-PLAN-AMENDED-FROM-ST2-2026-05-12`; `D-MANIFEST-AMENDED-FROM-ST2-2026-05-12`) for the most recent substrate-build context.
9. **`/inbox/service now action fabric.txt`** (~5 min; per PR11(c) inbox scan) — informs Stage 6 multi-marketplace thinking + sharpens R18 Character Kernel positioning (SageReasoning is upstream judgement primitive; ServiceNow Action Fabric is downstream system-of-action). No direct impact on A5 scaffolding scope — but the Article 50 transparency notice (R18e) and the Character Kernel framing (R18a) that Layer 3 prose carries are both consumed by potential downstream consumers like ServiceNow Action Fabric. Layer 3's output must remain consumer-portable.
10. **`/website/src/lib/constraints.ts`** (~3 min) — the AC1 branded-type system; A5 names its model selection against the `LAYER3_TRANSLATION` row (Sonnet per the row).
11. **`/website/public/component-registry.json`** — find the Layer 3 entry; confirm current status; the session will update this entry from `Scoped` → `Scaffolded` at session close.

**Confirm at session open** (state explicitly, briefly):
- Tier: code-critical / Critical-risk
- Hold-point status: P0 0h active
- Model selection: Sonnet (DeepModel) per AC1 row for "Layer 3 translation (alt-3)"
- Status vocabulary: implementation `Scoped → ... → Live`; decision `Adopted / Under review / Superseded`
- Signals + risk classification: AI signals incl. diagnostic-certainty (per PR10); risk Critical
- **PR10 PEV loop applies** — Plan (Critical Change Protocol inline); Execute (PR1 single-endpoint-proof discipline + PR2 build-to-wire-immediate); Verify (diagnostic-certainty signalling)
- **PR11-PR15 standing requirements engaged** — sources consulted per PR11; negative-finding discipline per PR12; consider-implications per PR13 after any material findings; ten-domain awareness per PR14; bias toward existing Anthropic infrastructure per PR15
- **PR16 positioning + dogfood lens** at each design decision in this session

## Part B — Procedure

### Step 1 — Plan (Critical Change Protocol inline)

Complete CCP 0c-ii steps 1-5 in the conversation before writing any code. Cover the six R20a-perimeter routes that ultimately feed Layer 3 (per AC5); name the worst-case failure modes specifically; name the rollback path for both code (git revert) and any env-var/config changes (e.g., a `SUBSTRATE_LAYER3_ENABLED` feature flag that defaults to OFF until Verified).

PR15 check: confirm bespoke A5 service is appropriate (no Anthropic infrastructure delivers per-consumer Layer 3 prose generation with deterministic R3 + R19 + R20a injection). Log the bespoke election in the decision-log entry at session close.

### Step 2 — Scaffold the A5 service

Create the Layer 3 service file (path TBD at session open; recommend `/website/src/app/api/substrate/layer3/route.ts` if it doesn't exist, or extend the existing Layer 3 patterns from `/api/reason` if a shared module is the right shape).

Components to scaffold:

- **A5.1** — Layer 3 service stub: accepts `Layer2Assessment` + `consumer_context` + `prose_mode` + `tag_set` (AC9 decision + AC10 provenance/use-policies); returns `Layer3Response` with prose + injected R3 + R19 + R20a passthrough deterministically.
- **A5.2** — Deterministic R3 injection function (`injectR3Disclaimer`): inserts the R3 evaluative-output disclaimer in every prose response; idempotent; functional + invocation tested per AC4.
- **A5.3** — Deterministic R19 injection functions (`injectR19Limitations`, `injectR19MirrorPrinciple`): R19c limitations link in every prose response; R19d mirror-principle reminder where the response is mentor-flavoured.
- **A5.4** — Deterministic R20a distress pass-through injection function (`injectR20aDistressPassthrough`): when the upstream signal indicates distress (AC9 decision = ESCALATE OR a distress flag in the assessment), inserts the distress pass-through statement deterministically — even if the Sonnet generation step doesn't include it organically. **This is the safety-critical function for A5; PR6 + AC4 apply.**
- **A5.5** — `prose_mode` enum handling (A6 dependency): the four-mode enum (clinical / terse / standard / educational); routing logic that selects the prose template per mode.
- **A5.6** — R18a Character Kernel category language in prose footer/header per consumer-context (configurable; default ON for marketplace listings + plugin-originated traffic).
- **A5.7** — R18e Article 50 transparency notice (placeholder language adopted under ST2) injected in every prose response where output is AI-generated.
- **A5.8** — Empty OpenTelemetry span emission stub (per AC11; full instrumentation lands at A12 but the spans are emitted from A5 scaffolding so A12 has them to wire into).

### Step 3 — Single-endpoint proof (PR1)

Pick one consumer for the single-endpoint-proof of A5. Recommendation: `/api/reason` (already on translation-sandwich; A5 stub can be added to its Layer 3 path behind a feature flag). PR1 discipline: A5 reaches Verified status on `/api/reason` BEFORE any rollout to other consumers (K-category migration cannot begin until A5 is Verified on `/api/reason`).

### Step 4 — Build-to-wire verification (PR2)

When A5 is wired (the feature flag flipped ON for `/api/reason` in dev/staging), verification happens in the same session per PR2. For each safety-critical injection function (A5.2, A5.3, A5.4), grep confirms the function is called in the execution path — not just defined.

### Step 5 — Critical Change Protocol completion (founder-approval gate)

Before founder deploys: re-state CCP steps 1-6 with concrete answers from Steps 1-4. Founder approval is specific to the named risks. Founder may signal "Treat this as critical" (escalating any sub-component reclassification) or "I'm done for now" (close session in current state).

### Step 6 — Verify

Per AC4 invocation testing:

- **Functional tests** — A5.2, A5.3, A5.4 each pass given known input shapes.
- **Invocation tests** — grep confirms each function is called in the `/api/reason` execution path:
  ```bash
  grep -n "injectR3Disclaimer\|injectR19Limitations\|injectR19MirrorPrinciple\|injectR20aDistressPassthrough" website/src/app/api/reason/route.ts
  ```
  Expected: each function name appears at least twice (import + call). Zero appearances = invocation-test FAIL = A5 not Verified.

Per AC9 decision-vocabulary:
- Verify A5 reads the `decision` field from the Layer 2 assessment.
- Verify A5 routes ALLOW → standard prose; BLOCK → block-message prose; REVISE → revise-recommendation prose; ESCALATE → R20a distress pass-through prose with R19c limitations link.

Per AC10 provenance + use-policy tags:
- Verify A5 reads `provenance` + `use_policies` from the assessment.
- Verify A5 projects these tags into prose where appropriate (e.g., "advisory" tags carry the standard R3 disclaimer; "binding_within_session" tags carry stronger language).

Per AC11 OpenTelemetry spans:
- Verify A5 emits the agreed span set for each call (even if A12 hasn't wired the receiver yet).

### Step 7 — Append decision-log entry (full form for Critical)

Per `/adopted/standing-protocol-cache.md` §"Critical-risk sessions" — full template (not lean). Entry ID: `D-A5-LAYER3-SCAFFOLDED-VERIFIED-YYYY-MM-DD`. Sections to include:

- Decision (one paragraph)
- Reasoning (alternatives considered; PR15 bespoke-vs-Anthropic-infrastructure election)
- Files touched (each path + one-line description)
- Risk classification (Critical; AC5 + AC7 + PR6 disposition; CCP steps 1-6 completion record)
- Rollback path (exact commands)
- Verification step (founder-performable; expected outputs)
- Verification Method Used (per 0c framework, work-type-by-work-type)
- PR5 Knowledge-Gap Carry-Forward (concepts re-explained or referenced; promote to KG entries per PR5 promotion rules)
- Open questions (revisit conditions)
- Rules served (comma-separated R/AC/KG/PR codes)
- Status (Adopted)
- Cross-references (predecessor entries; this session's close path; the staging-plan + manifest sections this entry implements)

### Step 8 — Session close (full form for Critical)

Path: `/operations/handoffs/founder/YYYY-MM-DD-A5-layer3-service-close.md`. Pattern: per `/adopted/standing-protocol-cache.md` §"Critical-risk sessions" — full template. Include: Decisions Made; Status Changes (A5 Scoped → Scaffolded → Verified); Next Session Should (A7 R20a gate scaffolding per indicative packaging session 9; OR A6 `prose_mode` parameter completion if A6 wasn't fully wired in this session); Blocked On; Open Questions; Verification Method Used; Risk Classification Record; PR5 Knowledge-Gap Carry-Forward; Founder Verification (Between Sessions); Orchestration Reminder; Cross-references.

Component registry update: `/website/public/component-registry.json` entry for Layer 3 service is updated from `Scoped` → `Scaffolded` (or `Verified` if all six verifications pass in-session).

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + adopted artefacts read (Part A items 1-3) | 15-20 min |
| Manifest + ADR reads (Part A items 4-7) | 25-30 min |
| Decision-log + inbox scan + constraints.ts + registry read (Part A items 8-11) | 10-15 min |
| Session-open confirmation + PR1/PR2/PR15 checks stated | 5 min |
| Step 1 — Plan (Critical Change Protocol inline) | 20-25 min |
| Step 2 — Scaffold A5.1-A5.8 | 60-90 min |
| Step 3 — Single-endpoint proof (`/api/reason`) | 20-30 min |
| Step 4 — Build-to-wire verification | 15-20 min |
| Step 5 — Critical Change Protocol completion + founder approval | 10-15 min |
| Step 6 — Verify (functional + invocation + AC9 + AC10 + AC11 checks) | 20-30 min |
| Step 7 — Decision-log entry (full form) | 25-30 min |
| Step 8 — Session close (full form) | 25-30 min |
| **Total** | **~4-5 hours** |

**Alternative session shape (split):** Critical-tier work is the worst kind of work to rush. If the founder elects a shorter session (3-4 hours), split:

- **A5-Scaffold session:** Part A reads + Steps 1-2 + 4. A5 reaches `Scaffolded` but not `Verified`.
- **A5-Verify session (next):** Steps 3 + 5 + 6 + 7 + 8. A5 reaches `Verified`.

Founder elects at session-open.

**No-fold-into-other-work option:** A5 is Critical-tier; folding it into a Standard or Elevated session is rejected by default. Either A5 gets its own session(s) or it waits.

## Rollback path

This session's work is a `Scoped` → `Scaffolded` (or `Verified`) status change for A5 + a new Layer 3 service file + a feature flag for the rollout. Rollback steps:

1. **Code rollback:** `git revert <session-commit>` to remove the A5 scaffolding from the codebase.
2. **Feature flag rollback:** if `SUBSTRATE_LAYER3_ENABLED` was set to ON in any environment, set back to OFF before pushing the revert. The flag is the immediate rollback lever; the revert is the permanent rollback.
3. **No env-var changes** are expected this session beyond the feature flag.
4. **No auth surface changes** — A5 inherits A1's auth pattern.
5. **No schema changes** — A5 doesn't write to Supabase (Layer 3 is stateless; metering happens elsewhere).

If the founder discovers a problem with A5 between sessions, the founder can flip `SUBSTRATE_LAYER3_ENABLED=false` in Vercel Environment Variables and trigger a redeploy — restores prior behaviour immediately while a permanent revert is composed.

## Forecast

Successful A5 scaffolding produces:
- `/website/src/app/api/substrate/layer3/route.ts` (or equivalent) exists with A5.1-A5.8 components
- `/api/reason` calls Layer 3 service behind feature flag in dev/staging
- All four R20a-perimeter injection functions Verified per AC4 (functional + invocation)
- AC9 decision-routing + AC10 tag-projection + AC11 spans wired
- Component registry updated: A5 status `Scoped` → `Scaffolded` (+ possibly `Verified` if all checks pass in-session)
- Substrate production state at session close: A5 in dev/staging behind flag; production unchanged unless founder explicitly elects to flip the flag in production after Critical Change Protocol completion

**Next session after A5 Verified:** A6 (`prose_mode` parameter completion if not done) or A7 (R20a gate scaffolding) per the indicative session-9 packaging in the amended staging plan. Founder elects.

**ServiceNow Action Fabric finding (for forward-looking context, not in scope for A5):**
- A5's Layer 3 prose output must be consumer-portable so downstream consumers (Cowork, anthropics/skills marketplace, ServiceNow Action Fabric MCP server when applicable) can present it consistently. This is already an A5 design intent; the ServiceNow finding raises the bar on R18 transparency-notice + R18a Character Kernel category language portability.
- A12 (OpenTelemetry instrumentation) implementation later in Stage 1 expansion can draw on ServiceNow AICT's audit-trail + consumption-metering pattern as a reference. Not in scope for A5 — flagged here so it's not lost.
- Potential Stage 6 marketplace addition: ServiceNow Action Fabric MCP server as a fourth adoption target after Cowork + anthropics/skills + Claude Code Plugins. Not in scope for A5; logged in this prompt for surfaces-in-future-planning.

End of prompt.
