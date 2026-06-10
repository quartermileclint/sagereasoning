# SageReasoning — Summary Tech Guide

*Operational manual for the founder. Printable, offline-readable, intended as a desk reference, not exhaustive documentation.*

Version: First edition, April 2026. Phase: P0 (R&D), all divisions wired.
Stack: Next.js 14 App Router, Vercel, Supabase, Anthropic.

As of 2026-04-24, this guide describes the actual code layout. [DIVERGENCE] markers from the first edition were resolved under D11 (discrepancy-sort 2026-04-23, Option B: amend docs to match reality) and replaced with plain descriptive entries. [TBD] markers were resolved under D12-A: each is now either confirmed, deferred-with-reasoning in the decision log, or carried to the next confirmation pass. Line-count references to `route.ts` replaced with descriptor under D13-A.

---

## Contents

1. File Map — What Each Category Directs
2. Sources of Truth, Environment, and Growth Anchors
3. Safety and Support
4. Growth Operations
5. Steps From Here — Prioritised

---

## 1. File Map — What Each Category Directs

### 1.1 API routes — `website/src/app/api/`

The API surface is 45 folders at the time of writing. Each folder is a route. The reasoning surface — the nine `sage-*` endpoints — is only a subset.

| Category | Folders | What it directs |
|---|---|---|
| Core reasoning | `reason`, `score`, `score-iterate`, `score-decision`, `guardrail`, `stoic-brain` | The public reasoning surface. Any change here is user-visible. |
| Assessments | `assessment`, `baseline`, `evaluate` | Foundational (free), full (paid), agent baseline, self-evaluation. |
| Skills | `skill`, `skills`, `marketplace` | Specialised reasoning skills (sage-coach, sage-premortem, etc.). |
| Practitioner | `journal`, `reflections`, `reflect`, `mentor`, `mentor-*`, `practice-calendar`, `milestones`, `patterns` | Human-facing practitioner surface. |
| Commerce | `billing`, `webhooks`, `receipts`, `usage`, `keys` | Stripe, API keys, metering, receipts. |
| Identity / ops | `user`, `admin`, `founder`, `health`, `analytics`, `update-location` | Account, admin, health checks. |
| Agent surface | `mcp`, `badge`, `community-map`, `compose`, `execute` | Agent-facing routes and certification surface. |

**Rule of thumb:** any change to a folder in the first two rows is user-visible or agent-visible and must follow the Critical Change Protocol if it touches auth, session, or the distress classifier. Safety-critical paths (per PR6) are always Critical risk regardless of apparent scope.

### 1.2 Library files — `website/src/lib/`

The actual code layout (as of 2026-04-24, D11-B reconciliation):

| File / concern | Location | Notes |
|---|---|---|
| `security.ts` | `website/src/lib/security.ts` | Rate limiting (IP-based, 5-minute cleanup), CORS validation, auth header checks, CR-2026-Q2-v1 regulatory compliance. Rate-limit and CORS logic live inside this file rather than as separate modules — consider extracting if the logic grows. |
| `model-config.ts` | `website/src/lib/model-config.ts` | Central model selection (Haiku vs Sonnet) and LRU response cache (SHA-256 key, 1-hour TTL). |
| Response envelope | `website/src/lib/response-envelope.ts` | Standard response shape for sage endpoints. (Earlier briefs called this `response.ts`.) |
| Validation / guardrails | `website/src/lib/constraint.ts` + `website/src/lib/guardrails.ts` | Constraint checks and safety guardrails are split across these two files. (Earlier briefs referred to a single `validation.ts`.) |
| `server-encryption.ts` | `website/src/lib/server-encryption.ts` | AES-256-GCM encryption of mentor profile at rest. Keyed on `MENTOR_ENCRYPTION_KEY`. Implements R17b and R17e. |

**Resolved 2026-04-24:** the earlier brief named standalone `rate-limits.ts`, `cors.ts`, `response.ts`, and `validation.ts`. Under D11-B the documentation was amended to match the actual file layout rather than the other way around — the embedded/split pattern is working and the rename cost was not justified.

### 1.3 Stoic Brain depth files

Actual implementation: a single `website/src/lib/stoic-brain.ts` that exports the core reference library by reading eight JSON data files from the `stoic-brain/` root (virtue.json, value.json, passions.json, psychology.json, progress.json, scoring.json, plus others). Depth (quick / standard / deep) is a runtime parameter on `sage-reason`, not three separate code files.

**Resolved 2026-04-24 (D11-B):** earlier briefs named `stoic-brain-quick.ts` / `-standard.ts` / `-deep.ts` as separate files. The runtime-parameter pattern is the working design and the documentation is amended to describe it.

| Depth | Behaviour | Typical latency |
|---|---|---|
| quick | Single-pass, structured output. Haiku class. | ~2s |
| standard | Default. Multi-step, Sonnet class where needed. | ~2–3s |
| deep | Explicit reasoning chain, Sonnet class. | ~3–4s |

### 1.4 Growth discovery files

Both present.

| File | Path | Purpose |
|---|---|---|
| `llms.txt` | `website/public/llms.txt` | Human-readable agent discovery. Documents endpoints, auth, rate limits, quick-start. v3.0, April 2026. |
| `agent-card.json` | `website/public/.well-known/agent-card.json` | Machine-readable agent card. v3.0.0, 10 capability entries. |

**Rule:** both files are growth surface. Any change to them changes how the world sees the service. Treat edits as marketing decisions, not routine config.

### 1.5 Configuration files

| File | Present | Path | What it directs |
|---|---|---|---|
| `next.config.js` | Yes | `website/next.config.js` | Security headers (X-Content-Type-Options, CSP, Permissions-Policy), CORS config, image allowlist, Apple App Site Association. |
| `package.json` | Yes | `website/package.json` | Key deps: `@anthropic-ai/sdk ^0.80.0`, `@supabase/supabase-js ^2.45.0`, `next ^14.2.0`, `stripe ^22.0.0`. |
| `.env.example` | Yes | project root | Documents Supabase, Anthropic, site URL, and Stripe variables. No values. |
| `middleware.ts` | Yes | `website/src/middleware.ts` | Request interception, Supabase auth context setup. |
| `vercel.json` | Not present (intentional) | — | Vercel reads defaults from `next.config.js` and the dashboard. Not required; consider adding only if regional routing or per-function memory overrides become necessary. Resolved 2026-04-24 under D11-B — absence documented as the intended configuration. |

---

## 2. Sources of Truth, Environment, and Growth Anchors

### 2.1 Sources of truth

One rule per surface. Any time a value disagrees between two sources, the authoritative one wins.

| Surface | Source of truth | What that means in practice |
|---|---|---|
| Production (what users see) | **Vercel Dashboard** | If it is not deployed on Vercel, it is not live. The preview URLs do not count. |
| Data (users, profiles, reflections, billing state) | **Supabase Dashboard** | Local dev DB is never production. Never copy production data to local. |
| Code (what will be deployed) | **GitHub `main`** | If it is not merged to `main`, it does not exist for deployment purposes. Branches and local commits are not truth. |
| Local environment | **`.env.local`** | **Never production truth.** Used for local development only. Never paste production secrets here. Production secrets live in Vercel environment variables. |

**Consequence:** when something behaves unexpectedly in production, check in this order — Vercel Deployments → Vercel env vars → Supabase Dashboard → GitHub `main` commit log. Do not rely on local state.

### 2.2 Environment variables

Every variable listed here is referenced in code. Values live in Vercel (production) and `.env.local` (local only).

| Variable | Used for | Criticality |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (client + server) | Critical |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (client) | Critical |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (server only) | Critical — **never expose to client** |
| `ANTHROPIC_API_KEY` | All reasoning calls | Critical |
| `MENTOR_ENCRYPTION_KEY` | AES-256-GCM mentor profile encryption (R17b) | Critical — rotating this invalidates encrypted data |
| `MENTOR_CONTEXT_V2` | Feature flag for v2 context assembly | Operational |
| `NEXT_PUBLIC_SITE_URL` | Auth redirect target | Critical for sign-in |
| `VERCEL_URL` | Deployment detection | Auto-set by Vercel |
| `FOUNDER_USER_ID` | Founder-specific feature gating | Operational |
| `ADMIN_USER_ID` | Admin access gating | Critical |
| `STRIPE_SECRET_KEY` | Stripe server API | Critical (revenue) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe client | Critical (revenue) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature verification | Critical (fraud prevention) |
| `STRIPE_DEVELOPER_PRICE_ID` | Developer paid tier price | Operational |
| `STRIPE_TIDING_ONCEOFF_PRICE_ID` | One-off voluntary contribution | Operational |
| `STRIPE_TIDING_MONTHLY_PRICE_ID` | Monthly voluntary contribution | Operational |

**Rule:** any addition to this list requires a matching entry in `.env.example` and in Vercel. If one is updated without the other, deployment will silently fail or leak.

### 2.3 Positioning / audience / tone anchors (growth)

These are the anchor points every outbound surface is measured against. If copy drifts from these, the brand drifts.

**Positioning.** Principled reasoning, accessible to every rational agent — human and artificial. Stoic foundation. Honest about scope. Interoperable by design.

**Audiences (two, not overlapping).**

| Audience | What they want | What we offer |
|---|---|---|
| Human practitioners | Structured help examining their own judgements | Website: journal, reflections, deliberation framework, foundational assessment free forever. |
| Agent developers | Reasoning they can build on, with transparent limits | API: nine sage endpoints, agent-card and llms.txt, honest certification scope, competitor-anchored pricing. |

**Tone anchors.** Direct. Warm. Non-moralising. Narrow on claims. Long on citations. Never flattering. Never hustling. Never promising what Stoicism does not promise.

**What we do not say.** We do not say "transform your life". We do not say "the only tool you need". We do not compare favourably to therapy. We do not make claims of wisdom on our own behalf — the service is named for an aspiration, not an achievement.

---

## 3. Safety and Support

This chapter is operational. It tells you what the system does, what you do, and when.

### 3.1 The three governing rules

| Rule | Subject | Status today |
|---|---|---|
| **R17** | Intimate data — encryption at rest (17b), genuine deletion (17c), no third-party profiling (17a), passion profiling never API-exposed (17e) | Encryption wired (`server-encryption.ts`). Deletion endpoint **[TBD verify]** — brief referenced a 503 placeholder; confirm current state before any launch. |
| **R19** | Honest positioning — limitations page live, mirror principle in mentor prompts, no universality claims | Queued for P2 (Ethical Safeguards). Limitations page not yet live; mirror principle not yet in production mentor prompts. Resolved 2026-04-24 under D12-A: deferred-to-P2 status is the confirmed position. |
| **R20** | Vulnerable user protection — distress detection (20a), independence encouragement (20b), relationship asymmetry guidance (20d) | R20a distress classifier wired (`r20a-classifier.ts` + `guardrails.ts`, two-stage) and invoked on eight routes per the invocation guard test; the hub route is outside the guarded set (logged as decision-log entry, resolved under D16). R20b independence detection and R20d relationship asymmetry guidance are queued for P2 — not yet wired. Resolved 2026-04-24 under D12-A. |

### 3.2 Crisis protocol

The distress classifier runs on every reasoning call. It is synchronous — no response is returned until the classifier completes. Cost is roughly 500ms on borderline inputs; this is non-negotiable (PR3).

| Tier | Signal | System response |
|---|---|---|
| Tier 1 — Explicit | Direct statement of suicidal ideation, self-harm, immediate crisis | Response 4A: redirection to crisis resources, reasoning suppressed or tightly scoped. |
| Tier 2 — Philosophically coded | "I have achieved indifference to death", "prohairesis exhaustion", virtue futility | Response 4B: careful redirection with philosophical acknowledgement. |
| Tier 3 — Vulnerability indicator | Isolation, loss, treatment discontinuation | Monitored. Response proceeds with softened framing. |
| Tier 4 — Therapeutic over-reliance | Dependency pattern on the service itself | Scope boundary library invoked; independence encouragement surfaced. |

### 3.3 Crisis hotlines referenced in code / to be referenced

Currently confirmed in code: **988 Suicide & Crisis Lifeline (US)** — `guardrails.ts` and `support-brain-compiled.ts`, contact `988`, web `988lifeline.org`.

**[TBD / Action required]** The service's user base is not US-only. The following should be added to the crisis resource list before any public launch outside the US:

| Region | Resource | Contact |
|---|---|---|
| United Kingdom | Samaritans | `116 123` (free, 24/7); jo@samaritans.org |
| United Kingdom / Ireland | Emergency services | `999` |
| United States | 988 Suicide & Crisis Lifeline | `988`; 988lifeline.org |
| United States | Emergency services | `911` |
| European Union | General emergency | `112` |
| Australia | Lifeline | `13 11 14` |
| International | Befrienders Worldwide | befrienders.org — country lookup |

**Recommendation:** before launch, code the crisis resource list as data (JSON), not inline strings, so it is updatable without touching the classifier. Classify by detected user region (falling back to a universal set) to ensure the surfaced number actually works for the person in front of it.

### 3.4 Support triage

Support signals are triaged by severity. The 20% threshold is a pattern-detection heuristic: if a single failure mode, complaint, or request appears in ≥20% of signals across a rolling window, it is treated as a pattern, not an individual case — and queued for root-cause work rather than one-off response.

| Severity | Definition | Response time target | Action |
|---|---|---|---|
| S1 — Safety | Anything that compromises distress detection, crisis redirection, or safeguards for vulnerable users | Immediate, same day | Pause affected surface if needed. Incident response protocol. |
| S2 — Data | User data loss, leak, or integrity failure | Same day | Contain. Notify affected users. Supabase rollback if applicable. |
| S3 — Revenue | Billing, subscription, or webhook failure blocking paying users | Within 24 hours | Stripe dashboard verification, webhook replay if needed. |
| S4 — Functional | Endpoint or feature failure not affecting S1–S3 | Within 3 business days | Triage, fix, deploy. |
| S5 — Cosmetic | Copy, layout, minor UX | Weekly batch | Grouped release. |
| **Pattern flag** | Same signal in ≥20% of inbox / feedback over rolling window | Weekly review | Treated as root-cause, not ticket. Logged as T-series finding (PR8). |

**Rule:** the founder personally reviews S1 and S2 every time. S3–S5 can be batched. Pattern flags are reviewed at weekly close.

---

## 4. Growth Operations

### 4.1 Dual-audience positioning

The two audiences do not share surfaces. Keep them separated.

| Dimension | Human practitioners | Agent developers |
|---|---|---|
| Primary surface | sagereasoning.com (website) | API + `llms.txt` + `agent-card.json` |
| Entry point | Foundational assessment (free) | `sage-reason` docs + free tier |
| Proof | Using the tool on themselves | Running it on their own agent |
| Paid offering | Complete assessment (one-time) | Metered API above free tier |
| Tone | Warm, personal, literary | Terse, technical, honest-about-scope |
| Channel | Blog, occasional email, word of mouth | Developer docs, technical posts, agent-discovery protocols |

**Rule:** a single piece of content should address one audience. Attempts to address both in the same post read as neither.

### 4.2 Content cadence — solo founder edition

The brief is to sustain a cadence the founder can actually hold across a long run, not a sprint. The defaults below are conservative; raise only if they become easy.

| Channel | Cadence | Purpose |
|---|---|---|
| Blog (practitioner) | 1 post / 2–3 weeks | Stoic framework applied to a real situation. Approx 1,200–2,000 words. |
| Blog (developer) | 1 post / month | One endpoint walked through, or one integration pattern. Approx 800–1,500 words. |
| Email digest | Monthly | Summary of blog posts, a short framework note, nothing pitched. |
| Social posts | 1–2 / week | Short, quotable, linking back to blog. Not the primary channel. |
| Documentation updates | As needed | `llms.txt` and `agent-card.json` updated on any endpoint change. |

**Non-cadence rules.** Do not start a newsletter that cannot be sustained for a year. Do not launch a podcast in P0. Do not join growth sprints that pull effort off P0 work. Content follows capability, not the other way around.

### 4.3 Community non-negotiables

These hold regardless of growth pressure.

1. **No dark patterns.** No manufactured urgency, no fake social proof, no misleading comparisons.
2. **No weaponising Stoicism.** Stoic language is not used to shame, to gatekeep, or to flatter paying users.
3. **No diagnosis of users or third parties.** The passion taxonomy is self-applied only.
4. **No astroturfing.** No sock-puppet reviews, no manufactured testimonials, no incentivised quotes.
5. **No private mental-health claims.** Never claim, in public or private, that the service is therapeutic.
6. **No silent ad insertion.** If a partner product is ever mentioned, it is disclosed as such.
7. **No data sale, ever.** Intimate user data is not a revenue stream.

**Practical test:** if a proposed growth tactic would be embarrassing to explain in full to a user in crisis, it does not happen.

---

## 5. Steps From Here — Prioritised

**Relationship to project-instructions P0–P7 (resolved 2026-04-24 under D15-B):** this list is tactical — "concrete next actions inside P0–P2." The strategic roadmap remains project-instructions' P0 → P0h (hold point) → P1 (business plan review) → P2 (ethical safeguards) → P3 (Agent Trust Layer) → P4 (Stripe) → P5 (R0 operationalisation) → P6 (launch) → P7 (Sage Ops). Each tactical step below maps to a strategic priority it serves.

A sequenced checklist. The order matters. Each step should be completed (or explicitly deferred with reasoning in the decision log) before the next begins.

| # | Step | Serves priority | Why first | What "done" looks like | Est. effort |
|---|---|---|---|---|---|
| 1 | **End-to-end verification pass** | P0 0h (hold point) | Per the 0h hold point, nothing is real until tested on real data. | Founder has personally run journal, reflection, deliberation, foundational assessment, and one API call, each with founder's own data, and confirmed each works. Results logged. | 1 session |
| 2 | **Personal support readiness** | P2 (R20) | If a user hits S1 today, the founder needs to know what to do. | Crisis protocol printed, hotline numbers for UK + US + international on a printed card at the desk. Response templates drafted for S1–S5. | Half a session |
| 3 | **Positioning on public surfaces** | P2 (R19) | Everything else inherits from this. | Homepage copy, meta description, OG tags, footer match the Section 2.3 anchors. No universality claims anywhere. | 1 session |
| 4 | **Publish `llms.txt` and `agent-card.json`** | P6 (launch criterion) | Discovery surface must be live before any developer outreach. | Both files live at their canonical paths on production. Both validated (JSON for agent-card, structure for llms.txt). External agent can fetch and parse. | Half a session |
| 5 | **Verify `/api/evaluate` GET self-documentation** | P3 (ATL / honest certification) | An endpoint that cannot describe itself when probed is not ready. | GET on `/api/evaluate` (no auth) returns a JSON description of its capability, inputs, outputs, and limits, matching `agent-card.json`. | Half a session |
| 6 | **First blog posts — one per audience** | P2 (R19) / P6 (launch) | Positioning without evidence is advertising. | One practitioner post (a real situation reasoned through using the framework) and one developer post (one endpoint, one use case, concrete code sample) published. | 1–2 sessions |
| 7 | **Privacy policy drafting** | P6 (legal review, critical path) | P3 legal review is critical path. Drafting precedes lawyer review. | A draft privacy policy covering data collected, storage, encryption (AES-256-GCM), retention, deletion, third-party sharing (none for intimate data), and user rights. Draft ready for lawyer. | 1 session (draft); external review thereafter |
| 8 | **R20 implementation completeness** | P2 (ethical safeguards) | Ethical analysis: R20 is not optional before broad deployment. | R20a (distress detection) confirmed wired on every user-facing endpoint. R20b (independence detection) wired. R20d (relationship asymmetry) in mentor prompts. Crisis resource list internationalised per 3.3. | 2–3 sessions |
| 9 | **Analytics baseline** | P7 (Sage Ops data governance) | You cannot notice drift from what you have not measured. | Minimum metrics captured: weekly active practitioners, foundational assessments completed, API calls per endpoint, paying developer count, error rate, P95 latency per endpoint. Dashboard accessible to founder. Privacy-respecting (no per-user journal content). | 1 session |
| 10 | **Cost monitoring** | P4 (Stripe + R5 cost-as-health) | R5: cost as health metric. Revenue-to-cost ratio must be trackable. | Daily cost of LLM calls visible. Alert thresholds set. Cost per endpoint class visible. R5 health threshold (2× revenue-to-cost) coded where possible, or manually reviewed weekly. | 1 session |

**After step 10:** the conditions for the hold-point exit (P0 0h) are substantially closer. At that point: revisit the business plan review (P1) with real cost and engagement data, not projections.

---

*End of guide.*

*Printed or PDF-exported, this is a single operational reference. When material changes — an endpoint added, a rule amended, a price changed — the guide is updated and the old version moved to `/archive/` per the folder convention. Do not edit in place without preserving the prior version.*
