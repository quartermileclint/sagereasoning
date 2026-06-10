# Honest Capability Inventory — 2026-06-10 (Pre-Launch S8a; 0h criterion 4)

**Status vocabulary:** implementation statuses only (`Scoped → Designed → Scaffolded → Wired → Verified → Live`), per 0a. Decision statuses appear only when citing decision-log entries.
**Method:** every "Live" line below cites a decision-log entry or a this-session founder observation. Nothing is taken from summary blocks (PR18 discipline). The full 191-component `component-registry.json` reconcile is S8b work; this inventory is the per-capability truth at the granularity the readiness gate needs.
**As-of:** 2026-06-10, S8a close. Production = `www.sagereasoning.com`.

---

## 1. Verified end-to-end this session (S8a, on production, founder-performed)

| Use case | Result | Evidence |
|---|---|---|
| **Human practitioner:** real founder decision (lawyer engagement) through `/score` ("Evaluate an Action"), signed in | All four stages + R3 disclaimer + philosophical reflection rendered; ~36s; **value affirmed by the founder:** "very good and detailed and provided guidance to decision making" | Founder run + screenshot (kept as baseline for the future substrate-rollout comparison) |
| **Agent developer:** mint `sr_inst_` → authenticated `POST /api/reason` with pre-computed `layer1_schema` → revoke → re-use | **201 → 200 (13.1s, assessment payload, not redirected) → 200 → 401** | Founder console run, this session |
| **Safety (Zone-2, Haiku leg):** six AC3 domains through the full two-stage classifier | **6/6 engaged, 0/6 redirected**; five labelled `mild` per the prompt's by-design conservatism (founder-adjudicated) | `/operations/safety-signal-audits/2026-06-10-zone2-haiku-leg-calibration-audit.md` |

## 2. Live in production (with per-audience reading)

| Capability | Status | Human practitioner | Agent developer | Evidence |
|---|---|---|---|---|
| R20a distress detection + redirect (4 flags) | **Live** | Crisis message path verified (S6) | Developer-form payload verified (S6); Zone-2 Haiku leg verified (S8a) | `D-R20A-*-2026-05-31`, `D-PRELAUNCH-S6-…`, S8a audit |
| `/api/reason` substrate (A7, translation sandwich) | **Live** | n/a directly (admin test page only) | **Verified e2e S8a** (minimal-valid schema; rich schemas exercised in TEST suites) | `D-PRELAUNCH-S5-…`, S8a run |
| Human-facing tools (`/score`, `/score-document`, `/score-social`, `/scenarios`, `/journal`, `/premeditatio`, `/oikeiosis`, `/baseline`, mentor surfaces) | **Live** | **`/score` verified e2e S8a**; others Live and exercised through the build arcs | n/a | S8a run; A18e close; site |
| **Architecture note:** human tools run the **original prose paths** — `/score`, `/score-decision`, `/score-document`, `/score-social`, `/score-conversation` call `runSageReason`; `/score-scenario` + `/reflect` call the Anthropic API directly (older still). The deterministic substrate is Live on **`/api/reason` only** (PR1 single-endpoint proof; staging item A8 = the migration vehicle, status Scoped). S8a observed substrate decomposition: L1 0ms (pre-extracted) / **L2 1ms (deterministic)** / L3 10.7s (prose render) | — | 36s observed at standard depth | 13.1s observed | Code read S8a; staging plan A8; founder's S8a payload |
| A10 per-install plugin auth (mint/use/revoke) | **Live** | n/a | **Re-verified e2e S8a** | `D-PRELAUNCH-S5-…`, S8a run |
| A11b injection defence | **Live** | both | both | `D-PRELAUNCH-S4-…` |
| A12 OTel + call-grain audit (masked/structural) | **Live** | both (privacy posture) | both | S2 close |
| A13 cost-health detection + automated delivery (daily cron → Slack) | **Live** | founder-facing | founder-facing | `D-PRELAUNCH-S7B-A13-DELIVERY-LIVE-2026-06-10` |
| A14 SLO/health tracker | **Live (provisional)** — thresholds metrics-gated | founder-facing | founder-facing | same entry |
| A19 abuse detection (3 detectors, detection-only) | **Live** | n/a | protects the surface | `D-PRELAUNCH-S3/S5-…` |
| GDPR data-rights: `/api/user/access`, `/rectify`, `/delete`, `/export` | **Live** | yes | n/a (no agent PII path) | S1 close |
| Agent discovery (`llms.txt`, `.well-known/agent-card.json`, `openapi.yaml`) | **Live** | n/a | verified S5 | S5 close |
| `/api/public-key` (Ed25519, steady state) | **Live** | n/a | yes | 2026-06-10 review §1 |
| Honest-positioning surfaces (`/limitations`, `/accessibility`, `/privacy`, `/terms`, R19d mirror principle in tools) | **Live** (legal wording = placeholder pending lawyer, by design) | yes | R18 pass over agent-facing materials = S8b | `D-R19D-ALL-TOOLS-2026-06-07`; A18e close |

## 3. Built but inert in production (by decision)

| Capability | Status | Why | Revisit trigger |
|---|---|---|---|
| Layer 3 standalone endpoint | Verified (TEST); **inert** | OUT of launch scope (founder, S7) | post-launch |
| R20b independence coaching | Wired; **inert** (flag unset) | off-perimeter; reviewed S6 | post-launch |
| Stripe billing | Scaffolded; `not_configured` | activation deferred; launch-criterion tension → P1 decision (rec 3.3) | first paying consumer or P1 election |
| Layer-2 key-rotation overlap vars | Verified mechanism; **unset** | steady state correct | first rotation |

## 4. Gaps (tagged per 0h criterion 3)

| Gap | Severity | Disposition |
|---|---|---|
| Privacy/ToS/Art-50 final wording is placeholder | **By design** (lawyer-gated) | Lawyer engagement this week — the readiness statement is the cover note |
| `/api/score-conversation` lacks distress detection; founder ruled it **inside** the perimeter (S8a) | **Significant** | Own Critical session (PR6/AC5 ninth-route pattern) **before launch** |
| npm vulnerabilities (3 moderate, 10 high) | **Significant** | Own Elevated session before external exposure |
| Per-install metering/quota enforcement | **Significant** (for paid onboarding only) | Trigger: first paid agent onboard (carried decision) |
| Registry statuses stale (39+ days; ≥14 components demonstrably Live) | **Significant** (documentation integrity) | S8b registry reconcile, scheduled |
| Stripe launch-criterion tension | **Significant** (decision, not build) | P1, on the record (rec 3.3) |
| Substrate not yet rolled out to human tools (prose paths serve them); founder expectation was that substitution had occurred — surfaced + adjudicated S8a | **Significant** (founder-elected S8a: **pre-launch work**) | A8 mapping session, then per-endpoint rollout (PR1 discipline; AC5-perimeter classification per route), run **parallel with lawyer wall-clock — blocks launch, not the lawyer engagement**. Founder's S8a screenshot is the before/after comparison baseline |
| Observed latencies vs docs (36s human standard; 13.1s agent) | **Minor** | A14 accumulates truth; docs estimate corrected at next touch |
| Zone-2 label conservatism (mild vs none) + `flag_written` metadata inconsistency | **Minor / Cosmetic** | Documented in the S8a audit; any prompt change is Critical, post-launch |
| Brand/presentation layer: assessment results not yet rendered in the proximity-target design (concentric circles, passion symbols, grey history); brand guidelines v1 predates the new asset system; home-page imagery outdated; agent developer-form payload carries no target-state/branding block | **Significant** (founder-elected S8a: **pre-launch**, consistency across all outputs incl. agent reports) | Work package captured: `/drafts/2026-06-10-brand-presentation-work-package.md` (W1–W5). W3/W4 join the substrate-migration arc; W1/W2 ride S8b; W5 founder wall-clock |
| Founder-hub stale text re: distress check; two practice-name H1s | **Cosmetic** | S8b (founder-elected fixes) |
| `supabase-server.ts` eager construction (test friction) | **Minor** | Own step, queued |

## 5. Bottom line per audience

**Human practitioner:** the product works end-to-end on production today — sign-in, evaluation, safety floor, honest positioning, data rights. Value affirmed on a real decision (n=1, the founder; wider evidence awaits real users). Honest caveat: the tools' judgement leg is the original prose engine until the founder-elected pre-launch migration to the deterministic substrate completes (A8 + rollout, parallel with counsel).
**Agent developer:** the full contract works on production today — discovery, per-install auth, schema-validated substrate calls, developer-form safety responses, revocation. No external agent traffic yet; metering enforcement awaits the first paid onboard.
**Founder/operations:** observability is on (OTel, cost-health with Slack delivery, SLO tracker, abuse detection). The system can be watched from day one of exposure.

*Cross-references: `/operations/handoffs/founder/2026-06-10-prelaunch-S7b-deploy-close.md`; `/operations/reviews/2026-06-10-multidisciplinary-review.md` §1; decision log entries cited inline. Registry reconcile to follow at S8b.*
