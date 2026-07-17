# Mentor Component-Registry Assessment (2026-07-16) — Reconciliation & Build Plan

**Status:** Adopted (founder-approved 2026-07-17 at plan review).
**Stream:** founder. **Session tier:** `governance` (planning-only — no build).
**Governing frame:** `/adopted/standing-protocol-cache.md`, opened under `operations/handoffs/founder/STANDING-SESSION-OPENER-grounded-foundations.md`.
**Decision-log entry:** `D-REGISTRY-MENTOR-ASSESSMENT-RECONCILED-BUILD-PLAN-2026-07-17`.
**Source:** the mentor's full systematic Archive/Amend/Retain assessment of `website/public/component-registry.json`, delivered verbatim by the founder 2026-07-17 (mentor dated it 2026-07-16). Verdict counts as delivered: 38 RETAIN · 22 AMEND · 2 AMEND-CRITICAL · 0 ARCHIVE.

---

## 0. The load-bearing finding: the mentor's instrument was five weeks stale

The registry the mentor assessed is **`v1.6.0, lastUpdated 2026-06-10`** (214 components). The assessment is dated 2026-07-16 — after ~25 sessions of change the registry does not carry: the whole Trust Layer arc (S0a corroboration check → S10 public read surface → S11 deferral + observation period), the R20a eleventh route (`/api/score-conversation`), the two foundation-completion sessions (2026-07-07), and the seven Remaining Principles human-practitioner tools (2026-07-13 → 2026-07-16).

Every mentor verdict was therefore verified against **current code truth first-hand** in the planning session (three read-only exploration passes + direct first-hand checks; one explorer died on the account spend limit and its scope was completed first-hand, per project precedent — every claim below carries its evidence citation).

**Result: both AMEND-CRITICALs are already closed in code; 6 of the mentor's named defects are stale; 4 real gaps survive; the rest are readiness/documentation work.** The mentor's *priorities* — distress-pathway completeness first, assess shared layers before amending single tools, dates not carried items — are honored throughout, applied to the verified gap list rather than the stale one.

**POST-BREAK AUDIT (2026-07-17, ultracode).** Because the planning session took two account-spend-limit breaks, an independent multi-agent audit was run over the finished deliverables (5 dimensions × find → adversarially-verify). It hit the same spend limit: **2 of 5 finder dimensions completed and every verifier died**, so the two dimensions' 7 findings were **verified first-hand** and the 3 dead dimensions (citation verification, cross-deliverable consistency, fresh-eyes gap hunt) were **completed first-hand** — the §4 precedent. **Outcome: 7/7 findings CONFIRMED, 0 refuted, plus 1 NEW finding the first-hand fresh-gaps sweep caught that the original session missed. All 8 are folded above.** The headline: **G2 undercounted — the rendering gap is four practitioner pages, not two** (the sweep of all 13 perimeter routes × their UI callers found `score-policy` — NavBar-linked — and `journal-feed` additionally unhandled). Also folded: `tool-sage-guard` had no disposition anywhere (mentor's "do not defer beyond the pre-launch pass" bound was dropped); `tool-sage-audit`/`tool-sage-scenario` were named in G4 then dropped from RA-5; the `tool-usage` metering-independence instruction was dropped; the `tool-sage-guard` registry entry is materially false (retired Haiku engine) and unnamed in RA-1's scope; a second stale flag comment sits in a frozen file; the byte-identity regex does not cover the shared R20a libs in the `/api/reason` import graph (an RA-2 window prohibition, now stated); and the plan's "§5 gate" cross-reference was imprecise. **SECOND COMPLETION ROUND (2026-07-17, on the founder's instruction to finish what the dead agents were doing).** The three dead dimensions were completed to the end rather than sampled. It found **two more real defects — one of them in this plan's own G3**: (i) **G3's group names were WRONG, inherited verbatim from the stale registry** — **this plan reproduced the exact failure it was convened to fix (trusting the stale instrument), on the one item nobody had opened the source file for.** G3 is rewritten from the file and is now *sharper*: Group A is by definition the set only Haiku can catch, so its untested state means the Haiku stage's whole justification is unverified. (ii) **RA-4 was under-scoped** — no runner exists for A/B/C (`run-zone2-calibration-eval.ts` imports Group D only), so RA-4 must build one first; it now carries both steps and the per-group contracts. Also fixed: plan §4's G2 verification command still named two pages after the four-page fold (a regression this session introduced) — now four, plus two new G3 checks. **Verified clean in this round:** score-conversation:165–186 read first-hand (the gate precedes the :207 context load); the ops-hub body + all three distress renderers; `guardrail-sandwich.ts` `dikaiosyneWeighting: true` at the live call site (:412); the perimeter registry (11 route-level + 2 substrate-gate; score-conversation flag-gated); `/premeditatio` + `/oikeiosis` carry **zero** page gates (the "live and ungated" claim holds); calling + practice-reflect are flag-gated (`SAGE_CALLING_ENABLED`, `SAGE_REFLECT_ENABLED`); the CLOSE's staging block, the decision-log's Files-touched list, and every cross-referenced path match reality.

**Clean:** every file:line citation in §1 re-verified; the 13-factory-tool set exactly confirmed (`sage-classify`/`sage-prioritise` correctly excluded); the G1 premise re-confirmed; no duplicate registry ids; window dates, harness-measured surfaces, trust-layer queue order, and the RA-2 flag-name freshness all verified.

---

## 1. Reconciliation: mentor verdict vs. verified current state

### 1a. Already closed (registry drift — no build; record + registry update only)

| # | Mentor item | Verified current state (evidence) |
|---|---|---|
| 1 | **sage-reflect Fix A (CRITICAL)** — "distress log is fire-and-forget" | **Already awaited.** `website/src/app/api/mentor/private/reflect/route.ts:224–238` — `await supabaseAdmin.from('analytics_events').insert(...)`, error destructured + surfaced via `console.error`. Header comments assert the KG1 no-fire-and-forget posture. Git history shows no recent fix — it was already in this state. |
| 2 | **sage-reflect Fix B (CRITICAL)** — "user_id vs auth.user.id" | **Already correct.** The distress log writes `auth.user.id` (route.ts:229) — the trusted session id; a client-supplied `user_id` cannot misattribute a distress event. (The route's *other* writes use `effectiveUserId = user_id \|\| auth.user.id` — a design point worth one eyeball in RA-1, but not the mentor's finding.) |
| 3 | **sage-converse (CRITICAL)** — "R20a not wired on the conversation surface" | **Wired AND live.** `/api/score-conversation` got route-level R20a on 2026-07-07 (`route.ts:165–186`: composed subject over conversation+context+format, before any context load or LLM call) and was **activated the same day** — `SUBSTRATE_SCORE_CONVERSATION_R20A_ENABLED=true` in Vercel, three live smokes green (acute/benign/mild), per the close-time production-state record (PR18; `D-R20A-SCORE-CONVERSATION-ELEVENTH-ROUTE-ACTIVATION-LIVE`). There is no separate unwired converse route. Residue: a stale header comment in `website/src/lib/score-conversation-r20a.ts:70–73` still says "UNSET in Vercel" — one-line comment fix, folded into RA-1. |
| 4 | **sage-decide Finding A** — "malformed body from Ops Hub" | **Fixed 2026-05-09.** `website/src/app/ops-hub/page.tsx:76–83` sends a valid `{decision, options[2]}` body; the inline comment documents the old `{option1, option2}` bug and its fix. |
| 5 | **sage-decide Finding C** — "distress handling missing on Ops Hub callers" | **Present.** `ops-hub/page.tsx` renders `redirect_message` on `distress_detected` in all three result renderers (:394–396, :613, :716–718). |
| 6 | **infra-invocation-guard-test** — "Jest ts-jest config prevents the test running" | **Runs green under tsx — re-verified first-hand in the planning session: 92 passed, 0 failed.** The suite was unified on tsx 2026-06-14 (M5); the registry note predates that. |

### 1b. Real gaps that survive reconciliation (the build items)

| # | Item | Verified gap |
|---|---|---|
| G1 | **`/api/score-decision` partial R20a input coverage** (mentor's sage-decide Finding B — the one surviving piece of the two CRITICAL+decide clusters) | **Confirmed.** `website/src/app/api/score-decision/route.ts:107` passes only `decision` to `detectDistressTwoStage`. The `options[]`, `context`, and `process` free-text fields reach the LLM unscreened. It is the **only** perimeter route with multiple independent free-text inputs that screens a subset. Distress phrased inside an option string bypasses the perimeter. The fix pattern already exists (`composeConversationDistressSubject`, score-conversation, 2026-07-07). |
| G2 | **Four practitioner pages don't render the distress response** (the surviving core of the mentor's infra-r20a-classifier "humanReady not-ready") | **Confirmed by an exhaustive perimeter-caller sweep (2026-07-17 ultracode audit — this REPLACES the original two-page claim, which undercounted).** Sweeping all 13 perimeter routes for UI callers and checking each for `distress_detected`/`redirect_message` handling: **`mentor-index/page.tsx`** (calls `/api/score`, `/api/reason`, `/api/reflect` — three perimeter routes), **`journal/page.tsx`** (`/api/journal`), **`score-policy/page.tsx`** (`/api/score-document` — **NavBar-linked as "Review a Policy"**, `website/src/components/NavBar.tsx:60`; the most exposed of the four), and **`journal-feed/page.tsx`** (`/api/mentor/journal-feed`) carry **no** distress handling. Seven sibling pages do (ops-hub, score, score-document, score-social, scenarios, mentor-hub, private-mentor). `admin/test-reason/page.tsx` also lacks it but is **founder-admin-only — deliberately out of scope**. `/api/calling` + `/api/practice/reflect` have no UI caller (API-only — fine). The API side is complete + live (crisis-line list corrected 2026-07-07: Shout UK 85258, 988 CA); the page side has this **four-page** hole. Failure mode on `score-policy`: a distress 200 carries no `katorthoma_proximity`, so the result box renders an empty gray card — the practitioner sees nothing, not even the error path. |
| G3 | **ES1 classifier-eval: three of four groups have never run at the Haiku stage — and have no runner** | **CORRECTED + SHARPENED by the 2026-07-17 audit (the first-hand read of the eval file; the original G3 text inherited the STALE REGISTRY's group names and was wrong — see §0's audit note).** The registry's `infra-r20a-classifier-eval` desc claims *"Group A (clinical crisis), Group B (philosophical), Group C (ambiguous)"*. **The file says otherwise** (`website/src/lib/__tests__/r20a-classifier-eval.ts`): **Group A = `REGEX_FALSE_NEGATIVES`** (5 inputs, :19) — *"Inputs the regex MISSES that Haiku SHOULD catch… the false-negative gap that F1 is designed to close"*; **Group B = `CORRECT_PASS_THROUGHS`** (5 inputs, :57) — *"SHOULD correctly pass through… Haiku must NOT flag these"*; **Group C = `CONTENT_SAFETY_EDGE_CASES`** (1 input, :160) — *"test the 'LLM returns non-JSON' safety net"*; **Group D = `CLINTON_PROFILE_ZONE2`** (6 inputs, :109) — Zone 2, the only name the registry got right. **Why this matters far more than the original G3 implied:** Group A is *by definition* the set only the Haiku stage can catch, so an untested Group A means **the entire justification for having a Haiku stage is unverified**; untested Group B means the over-blocking direction is unverified; untested Group C means the non-JSON safety net is unverified. **Group D alone ran at Haiku** (S8a 2026-06-10, 6/6 pass — `operations/safety-signal-audits/2026-06-10-zone2-haiku-leg-calibration-audit.md`). **And there is NO RUNNER for A/B/C:** the only runner, `run-zone2-calibration-eval.ts`, imports `CLINTON_PROFILE_ZONE2` **only** (:39) — so RA-4 must *build* the A/B/C runner before it can run anything (the Zone-2 runner is the template). The eval file's own documented invocation (`npx ts-node`, :11) is also stale — the project unified on `tsx` 2026-06-14. The mentor demands a date, not a carried item. |
| G4 | **The readiness cluster ("thirteen wrapped tools") needs a shared-layer diagnosis before any per-tool amendment** | The mentor's instruction is right; the grouping needs correction. Four of the mentor's ids don't exist in the registry (`tool-sage-score-decision/-document/-scenario/-social` — the real ids are `tool-sage-decide`, `tool-sage-audit`, `tool-sage-scenario`, `tool-sage-filter`), and the registry's actual `"Factory wrapper"` set is a *different* group: **13 marketplace skills genuinely wrapped by `createContextTemplateHandler` (`website/src/lib/context-template.ts`)** — sage-align, -coach, -comply, -educate, -govern, -identity, -invest, -moderate, -negotiate, -pivot, -premortem, -resolve, -retro — plus two mislabelled bespoke tools (sage-classify, sage-prioritise). The factory carries a known shared workaround (`context-template.ts:60` — "requireAuth hangs in factory-created handlers"). The mentor's intent — *assess the shared layer first; one factory fix may close thirteen tools* — maps onto real code and is honored as a diagnosis session (RA-5). |

### 1c. Readiness / documentation items (fold into RA-1 and RA-5)

- **D3 / D8 / D11 doc notes** (mentor: three single-note amendments) — real, cheap, docs-only: D3 gains the pre-Phase-2 passion-recalibration dependency note; D8 gains the version note (Validation Addendum authoritative until v1.1.0; architectural-conventions catalogue the interim standalone reference); D11 gains the R20d sage-filter pre-Phase-2 dependency note. Files under `adopted/rag-mentor-alt3/`. → RA-1.
- **prod-premeditatio / prod-oikeiosis** — the mentor's "Live and gated" is stale: both were substantially extended in the Remaining Principles arc (2026-07-13/14; new exercises, boundary-verified, linked from `/welcome`) and are **live and ungated** (auth at the API layer only). Whether `humanReady` should now read `ready` is a registry/diagnosis question, not a build. → RA-1 + RA-5.
- **tool-sage-calling + tool-sage-practice-reflect** — live-but-flag-gated (`SAGE_CALLING_ENABLED` etc.); the mentor's "close humanReady before ungating, both together" stands as the ungating precondition. What "closing" concretely requires comes out of RA-5; ungating remains a founder call. No urgency while gated.
- **tool-sage-reason humanReady partial** — the mentor's own hypothesis (documentation gap, not build gap) is likely right; RA-5 confirms and closes or escalates per the mentor's instruction.
- **Registry hygiene found during reconciliation** — no duplicate ids exist (the assessment's doubled tool-export/tool-delete/`tool -sage-calling` entries are assessment artifacts, not registry defects); three registry-internal contradictions are drift (`infra-r20a-classifier` live+not-ready; `tool-sage-converse` live + "NOT wired" blocker; guard-test "cannot run"); two `"Factory wrapper"` labels are wrong. → RA-1.

### 1d. Mentor-endorsed deferrals this plan deliberately does NOT pull forward

A8 substrate migration (needs its own design session — mentor explicit) · R20d sage-filter alignment (own named session) · D8 v1.1.0 revision pass · per-install metering (trigger: first paid agent onboard) · alt-3 Phase-2 builds. The RA-1 doc notes record the pre-Phase-2 dependencies exactly as the mentor asked; nothing else moves.

---

## 2. The build sessions (RA-1 … RA-5)

Naming avoids the trust-layer S-numbers and manifest R-codes. **Every item below is window-safe** — none touches the frozen `/api/reason`–guardrail graph (`stoic-brain`, `sage-reflect` lib, trust-core, harness, etc.) — but any push during the observation window still runs the **extended** byte-identity gate — the logos-close form (`2026-07-16-remaining-principles-logos-teaching-module-CLOSE.md` step 1), **not** the narrower build-plan §5 grep, which that close records as missing `api/guardrail`, `guardrail-sandwich`, `sage-reason-engine`, and `reasoning-receipt`.

### RA-1 — Reconciliation records + registry refresh + doc notes
**Tier:** `registry` + `governance`. **Risk:** Standard. **When:** immediately (window-safe; no code behavior change).
1. Commit the reconciliation memo (§1 above) as the record of what the mentor's assessment found vs. current truth — protects PR7 honesty in both directions.
2. Run **`/sage-registry-update`** to bring the registry from v1.6.0 to current truth: the Trust Layer components (trust core, discernment, public read surface, harness H1–H5), the 7 Remaining Principles tools, the corroboration check, the score-conversation wiring+activation, ADR-010 §4/§3 state, plus the specific corrections from §1 (sage-converse blocker cleared; sage-reflect blocker cleared; guard-test note corrected; **`infra-r20a-classifier-eval` desc CORRECTED — its group names are factually wrong** (claims "A clinical crisis / B philosophical / C ambiguous"; the file has A=`REGEX_FALSE_NEGATIVES`, B=`CORRECT_PASS_THROUGHS`, C=`CONTENT_SAFETY_EDGE_CASES`, D=`CLINTON_PROFILE_ZONE2` — §1b G3) + note updated to "Group D Haiku-verified at S8a 2026-06-10 (6/6); A/B/C never run at Haiku and have NO runner → RA-4"; factory-wrapper labels fixed on sage-classify/sage-prioritise).
   - **`tool-sage-guard` — the one registry entry describing a LIVE safety gate with a false engine (added by the 2026-07-17 audit; note the engine port is **ADR-009**, NOT the ADR-010 §4/§3 items listed above, so the general scope line would miss it).** Current entry reads `status: "wired"`, desc *"calls runSageReason(quick) with 3 mechanisms via Haiku"*, notes *"Uses fast Haiku model for speed"*, deps `[sage-reason-engine]`. Truth: `/api/guardrail` has served the **ADR-009 signed deterministic sandwich since 2026-06-19** (`SUBSTRATE_GUARDRAIL_SANDWICH_ENABLED=true`; Sonnet Layer-1 extraction → deterministic Layer-2 → Ed25519, no Layer-3 prose — `guardrail/route.ts:174`, `lib/guardrail-sandwich.ts`), with the §3 justice bridge **retired 2026-06-26** (native `dikaiosyneWeighting:true`). Correct desc/notes/deps; `wired` → `live`; note CI-8 cost honesty + CI-10 loop metering.
3. Apply the three **D3/D8/D11 single-note amendments** (docs-only, `adopted/rag-mentor-alt3/`).
4. Fix the stale header comment in `score-conversation-r20a.ts:70–73` (one line; reflects the 2026-07-07 activation).
5. **Founder election recorded here:** whether to send the reconciliation + refreshed registry back to the mentor for a re-assessment (the mentor's verdicts are normally binding verbatim; these rested on stale facts — the record lets the founder re-consult honestly or proceed on the reconciled plan).

### RA-2 — `/api/score-decision` full-field R20a coverage (gap G1 — the one real safety build)
**Tier:** `code-critical` (R20a perimeter change, 0d-ii; Critical Change Protocol; founder-walked activation per PR17/AC7). **Proposed date: 2026-07-18** (window-safe; the mentor's discipline — a date, not a carried item).
- Compose the distress subject from `decision + options[] + context + process`, following the score-conversation module pattern (`score-conversation-r20a.ts`): per-field caps (15,000 chars), the `\n\n---\n\n` seam separator (the F4 lesson — `\s+` bridges a bare `\n\n`), raw fields not truncations, check **before any context load or LLM call**.
- Flag-gated dark (`SUBSTRATE_SCORE_DECISION_R20A_FULLFIELDS_ENABLED`), byte-identical flag-off, test-asserted → founder-walked activation with live smokes (acute-in-option / benign / mild), exactly the 2026-07-07 precedent.
- Extend the invocation-guard registry/battery with the multi-field pin; run the full r20a suites.
- **WINDOW PROHIBITION (added by the 2026-07-17 audit — the gate regex does NOT protect these).** `/api/reason` imports `detectDistressTwoStage` from `@/lib/r20a-classifier` and `enforceDistressCheck` from `@/lib/constraints` (`api/reason/route.ts:7–8`, called at :1002), yet **neither path matches the byte-identity regex** — so editing them would perturb the measured `/api/reason` surface **while the gate printed "NONE — safe" (false assurance)**. During the observation window RA-2 must **not** edit `r20a-classifier.ts`, `constraints.ts`, `guardrails.ts`, `security.ts`, or `practice-credential.ts`; put new logic in a **new** `score-decision-r20a.ts` module (exactly what the score-conversation precedent did — it reused `getCrisisResources`/`evaluateBorderlineDistress` without editing them). Any change to those shared libs is post-window. Optionally extend the RA-session gate grep with `r20a-classifier|/lib/constraints|/lib/guardrails` for the window's remainder.
- Surface (not scope in) the two adjacent named follow-ups: the always-on `format`/field length validation class, and the perimeter-wide "mild-mutes-stage-2 on sibling single-field routes" property — both already on the named-follow-ups register.

### RA-3 — Practitioner distress-response rendering closure (gap G2)
**Tier:** `code-elevated` (existing user-facing UI). **Proposed date: 2026-07-18/19.**
- **Scope is FOUR pages, not two** (corrected by the 2026-07-17 audit — the original two-page claim undercounted). Re-verify in-session, then fix each to render `redirect_message` when the API returns `distress_detected`, following the ops-hub pattern (`ops-hub/page.tsx:716–718`):
  1. **`score-policy/page.tsx`** (`/api/score-document`) — **do this first: it is NavBar-linked** (`components/NavBar.tsx:60`, "Review a Policy"), so it is the most reachable unhandled surface, and its current failure mode is silent (an empty gray result card, not even an error).
  2. **`mentor-index/page.tsx`** — calls **three** perimeter routes (`/api/score`, `/api/reason`, `/api/reflect`); all three response paths need the branch.
  3. **`journal/page.tsx`** (`/api/journal`).
  4. **`journal-feed/page.tsx`** (`/api/mentor/journal-feed`).
- **Deliberately out of scope:** `admin/test-reason/page.tsx` (founder-admin-only). `/api/calling` + `/api/practice/reflect` have no UI caller (API-only).
- Record the full 13-route × caller coverage table in the close (a lightweight UI-side pin test is optional — propose, founder elects; a pin would prevent this class regressing, which is what let it go unnoticed).
- This closes the verified core of the mentor's classifier "human-facing distress experience" item; RA-5 confirms nothing else stands behind the `not-ready` reading.

### RA-4 — ES1 full-suite Haiku eval run (gap G3)
**Tier:** eval run (`code-standard` posture; **no code change** — any classifier/prompt fix arising is its own Critical session, post-window). **Founder-walked:** needs a live Anthropic API key + spend (separate budget from the account's Claude limit). **Proposed date: 2026-07-20** (immediately after the observation window closes, so trust-layer attention isn't split).
- **Step 1 — BUILD the A/B/C runner** (the audit found none exists; `run-zone2-calibration-eval.ts` covers Group D only). Model it on that runner: import `REGEX_FALSE_NEGATIVES`, `CORRECT_PASS_THROUGHS`, `CONTENT_SAFETY_EDGE_CASES`; drive the full `detectDistressTwoStage` path; invoke with `npx tsx --env-file=.env.local` (**not** the file header's stale `ts-node`).
- **Step 2 — Run all four groups at the Haiku stage**, each against its own contract — **A (`REGEX_FALSE_NEGATIVES`, 5): Haiku MUST catch what the regex missed** (this is the group that justifies the Haiku stage existing at all — a miss here is the most consequential possible result); **B (`CORRECT_PASS_THROUGHS`, 5): Haiku must NOT flag these** (the over-blocking direction); **C (`CONTENT_SAFETY_EDGE_CASES`, 1): the non-JSON safety net holds**; **D (`CLINTON_PROFILE_ZONE2`, 6): re-run, expect the S8a 6/6.**
- Record results as a safety-signal audit doc under `operations/safety-signal-audits/`, adjudicate misses with the founder (the 2026-04-18 + S8a precedents). **A Group-A miss is a classifier finding → its own Critical session, post-window — do not fix in RA-4.**

### RA-5 — Readiness diagnosis: the shared-layer ("wrapper-level") assessment (gap G4)
**Tier:** `governance` / read-only diagnosis. **When:** any time; parallelizable.
- Define concrete closure criteria for `humanReady`/`agentReady` per the registry skill's legend ("whether a human user can use this component as-is"), then diagnose per group:
  (a) the **13 true context-template factory tools** — determine whether one factory-level fix (starting with the `requireAuth` workaround at `context-template.ts:60`) closes the group, per the mentor's instruction;
  (b) the core engine tools (score/decide/**audit**/**scenario**/filter/iterate/converse/reflect) — readiness vs. the A8-migration blocker (A8 stays deferred). **`tool-sage-audit` (`/api/score-document`) and `tool-sage-scenario` (`/api/score-scenario`) are the real ids behind two of the mentor's four nonexistent `tool-sage-score-*` ids (§1b G4) — they are in-scope here, not dropped;**
  (b2) **`tool-sage-guard`** (`/api/guardrail`) — **the mentor's safety-classification bound applies verbatim: "do not defer this beyond the pre-launch completion pass."** Assess with (b) but do not let the A8 deferral absorb it. Its registry entry is also materially false (see RA-1 step 2 / §1c);
  (c) usage/compose/execute (marketplace entry points — mentor priority within the group). **`tool-usage` closure is assessed and closed INDEPENDENTLY of the per-install metering decision — metering stays deferred per §1d, and its deferral must not gate usage readiness (mentor explicit);**
  (d) export/delete (`humanReady` already `ready`; `agentReady` partial — R17 surfaces, not deferred past the pre-launch pass per the mentor);
  (e) calling + practice-reflect (the pre-ungating closure list, both together);
  (f) premeditatio/oikeiosis (likely `ready` now — confirm);
  (g) sage-reason (documentation-vs-build determination).
- Output: a per-group closure list, each item sized and mapped to a small named follow-up session; registry updated accordingly. **No per-tool amendment happens before this session** — the mentor's explicit ordering.

---

## 3. Sequencing constraints & interleave

- **The 7-day false-hold observation window** (opened 2026-07-12, closes ~2026-07-19) freezes the `/api/reason` + guardrail file graph. Nothing in RA-1…RA-5 touches frozen files; every push still runs the **extended** byte-identity gate (the logos-close form — see §2's note; the narrower build-plan §5 grep must not be used by literal reading). **Caveat: the regex does not cover the shared R20a libs in the `/api/reason` import graph — see the RA-2 window prohibition.**
- **The trust-layer stream keeps its own queue and priority:** D2 justice-arm narrowing (already named "next session" at the logos close) → return-with-record (~2026-07-19+) → S11 flip re-examination. The RA sessions interleave around it at the founder's election; there are no file collisions.
- **Recommended order:** RA-1 (any time, immediately) → RA-2 (2026-07-18, the only live safety gap) → RA-3 → RA-4 (2026-07-20, post-window) → RA-5 (parallel, any time). D2 + return-with-record proceed on their own window-driven clock.
- **Post-window named items:** the stoic-brain corpus citation fix (`stoic-brain/stoic-brain.json:151` — Meditations 7.9 + the DL cite, blocked by the byte-identity guard until the window closes); the family-wide convention pass items from the Remaining Principles closes; **NEW (2026-07-17 audit) — the stale flag comment at `website/src/app/api/guardrail/route.ts:164`** (*"SUBSTRATE_GUARDRAIL_SANDWICH_ENABLED UNSET (default, production)"* — false since the 2026-06-19 activation; same class as the score-conversation comment RA-1 fixes, but this file is **frozen** during the window, so it cannot ride RA-1).
- **Spend limit:** the account hit its monthly Claude spend limit on 2026-07-17 (one explorer died on it mid-planning). RA sessions are sized to run without large multi-agent fan-outs; RA-4's cost is on the separate Anthropic API key.

---

## 4. Verification (founder-performable)

```bash
cd /Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning
# 1. Registry staleness: expect v1.6.0 / 2026-06-10
head -5 website/public/component-registry.json
# 2. Mentor Fix A/B already closed: expect awaited insert + auth.user.id
sed -n '224,238p' website/src/app/api/mentor/private/reflect/route.ts
# 3. Sage-converse wiring present: expect the flag-gated distress block
sed -n '165,186p' website/src/app/api/score-conversation/route.ts
# 4. The surviving gap G1: expect only `decision` passed to the classifier
sed -n '107p' website/src/app/api/score-decision/route.ts
# 5. Gap G2: expect NO output from ANY of the four (no distress handling on any)
grep -in "distress\|redirect_message" website/src/app/score-policy/page.tsx website/src/app/mentor-index/page.tsx website/src/app/journal/page.tsx website/src/app/journal-feed/page.tsx
# 5b. G3: the eval groups are NOT what the registry claims — expect REGEX_FALSE_NEGATIVES / CORRECT_PASS_THROUGHS / CLINTON_PROFILE_ZONE2 / CONTENT_SAFETY_EDGE_CASES
grep -n "^export const" website/src/lib/__tests__/r20a-classifier-eval.ts
# 5c. G3: the only runner covers Group D only — expect one hit, CLINTON_PROFILE_ZONE2
grep -n "import {.*} from './r20a-classifier-eval'" website/src/lib/__tests__/run-zone2-calibration-eval.ts
# 6. Guard test runs (mentor item stale): expect "92 passed, 0 failed"
cd website && npx tsx src/lib/__tests__/r20a-invocation-guard.test.ts | tail -1
```

Each RA session carries its own verification step per the standing templates (RA-2: flag-off byte-identity + both-states battery + live smokes; RA-3: manual distress-path walk on both pages; RA-4: the recorded eval results; RA-1/RA-5: registry audit skill checks).

---

## Cross-references

- The mentor's assessment (verbatim, as delivered in the 2026-07-17 planning session — quoted in full in the session transcript; the founder holds the original)
- `operations/handoffs/founder/STANDING-SESSION-OPENER-grounded-foundations.md`
- `operations/handoffs/founder/2026-07-16-remaining-principles-logos-teaching-module-CLOSE.md` (predecessor close; the D2-narrowing "next session" naming)
- `operations/handoffs/founder/2026-07-12-trust-layer-S11-return-with-record-NEXT-SESSION-PROMPT.md` (the observation-window successor)
- `D-R20A-SCORE-CONVERSATION-ELEVENTH-ROUTE-ACTIVATION-LIVE` (the sage-converse closure evidence)
- `.claude/skills/sage-registry-update/SKILL.md` (the RA-1 vehicle; the `humanReady` legend)

*End of plan. The mentor's priorities stand; the facts they bind to are now current.*
