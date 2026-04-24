# SageReasoning — Summary Tech Guide

*Operational manual for the founder. Printable, offline-readable, intended as a desk reference, not exhaustive documentation.*

Version: First edition, April 2026. Phase: P0 (R&D), all divisions wired.
Stack: Next.js 14 App Router, Vercel, Supabase, Anthropic.

Items marked **[TBD]** are not yet confirmed. Items marked **[DIVERGENCE]** are places where the named file or structure does not match what was found in the code — the guide reports reality, and the divergence is called out so it can be reconciled.

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

The project brief named seven library files. Three of them are present as named; four are **not present as standalone files** — their logic exists, but in different locations. The table shows reality.

| Named in brief | Actual state | Actual location / notes |
|---|---|---|
| `security.ts` | Present | Rate limiting (IP-based, 5-minute cleanup), CORS validation, auth header checks, CR-2026-Q2-v1 regulatory compliance. |
| `model-config.ts` | Present | Central model selection (Haiku vs Sonnet) and LRU response cache (SHA-256 key, 1-hour TTL). |
| `rate-limits.ts` | **[DIVERGENCE]** Not present as a file | Rate-limit logic is embedded inside `security.ts`. Consider extracting if the logic grows. |
| `cors.ts` | **[DIVERGENCE]** Not present as a file | CORS validation is embedded inside `security.ts`. |
| `response.ts` | **[DIVERGENCE]** Not present under this name | Response envelope logic lives in `response-envelope.ts`. |
| `validation.ts` | **[DIVERGENCE]** Not present as a file | Validation is distributed across `constraint.ts` and `guardrails.ts`. |
| `server-encryption.ts` | Present | AES-256-GCM encryption of mentor profile at rest. Keyed on `MENTOR_ENCRYPTION_KEY`. Implements R17b and R17e. |

**Action for founder:** decide whether to reconcile the divergence by (a) renaming/refactoring to match the named structure, or (b) amending project documentation to match the actual structure. Both are valid; mixed state is not.

### 1.3 Stoic Brain depth files

The brief referred to `stoic-brain-quick.ts`, `stoic-brain-standard.ts`, and `stoic-brain-deep.ts`. **[DIVERGENCE]** These three files do not exist.

What exists: a single `website/src/lib/stoic-brain.ts` that exports the core reference library by reading eight JSON data files from the `stoic-brain/` root (virtue.json, value.json, passions.json, psychology.json, progress.json, scoring.json, plus others).

Depth (quick / standard / deep) is currently a runtime parameter on `sage-reason`, not three separate code files. That is the actual pattern — and probably the right one — but it differs from the brief.

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
| `vercel.json` | **[DIVERGENCE]** Not present | — | Vercel reads defaults from `next.config.js` and dashboard. Not required, but consider adding for regional routing / function memory overrides. |

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
| **R19** | Honest positioning — limitations page live, mirror principle in mentor prompts, no universality claims | **[TBD]** Limitations page not yet confirmed live. Mirror principle not yet confirmed in production mentor prompts. This is P2 work. |
| **R20** | Vulnerable user protection — distress detection (20a), independence encouragement (20b), relationship asymmetry guidance (20d) | Distress classifier wired (`r20a-classifier.ts` + `guardrails.ts`, two-stage). Independence detection and asymmetry guidance **[TBD]** — confirm state. |

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

A sequenced checklist. The order matters. Each step should be completed (or explicitly deferred with reasoning in the decision log) before the next begins.

| # | Step | Why first | What "done" looks like | Est. effort |
|---|---|---|---|---|
| 1 | **End-to-end verification pass** | Per the 0h hold point, nothing is real until tested on real data. | Founder has personally run journal, reflection, deliberation, foundational assessment, and one API call, each with founder's own data, and confirmed each works. Results logged. | 1 session |
| 2 | **Personal support readiness** | If a user hits S1 today, the founder needs to know what to do. | Crisis protocol printed, hotline numbers for UK + US + international on a printed card at the desk. Response templates drafted for S1–S5. | Half a session |
| 3 | **Positioning on public surfaces** | Everything else inherits from this. | Homepage copy, meta description, OG tags, footer match the Section 2.3 anchors. No universality claims anywhere. | 1 session |
| 4 | **Publish `llms.txt` and `agent-card.json`** | Discovery surface must be live before any developer outreach. | Both files live at their canonical paths on production. Both validated (JSON for agent-card, structure for llms.txt). External agent can fetch and parse. | Half a session |
| 5 | **Verify `/api/evaluate` GET self-documentation** | An endpoint that cannot describe itself when probed is not ready. | GET on `/api/evaluate` (no auth) returns a JSON description of its capability, inputs, outputs, and limits, matching `agent-card.json`. | Half a session |
| 6 | **First blog posts — one per audience** | Positioning without evidence is advertising. | One practitioner post (a real situation reasoned through using the framework) and one developer post (one endpoint, one use case, concrete code sample) published. | 1–2 sessions |
| 7 | **Privacy policy drafting** | P3 legal review is critical path. Drafting precedes lawyer review. | A draft privacy policy covering data collected, storage, encryption (AES-256-GCM), retention, deletion, third-party sharing (none for intimate data), and user rights. Draft ready for lawyer. | 1 session (draft); external review thereafter |
| 8 | **R20 implementation completeness** | Ethical analysis: R20 is not optional before broad deployment. | R20a (distress detection) confirmed wired on every user-facing endpoint. R20b (independence detection) wired. R20d (relationship asymmetry) in mentor prompts. Crisis resource list internationalised per 3.3. | 2–3 sessions |
| 9 | **Analytics baseline** | You cannot notice drift from what you have not measured. | Minimum metrics captured: weekly active practitioners, foundational assessments completed, API calls per endpoint, paying developer count, error rate, P95 latency per endpoint. Dashboard accessible to founder. Privacy-respecting (no per-user journal content). | 1 session |
| 10 | **Cost monitoring** | R5: cost as health metric. Revenue-to-cost ratio must be trackable. | Daily cost of LLM calls visible. Alert thresholds set. Cost per endpoint class visible. R5 health threshold (2× revenue-to-cost) coded where possible, or manually reviewed weekly. | 1 session |

**After step 10:** the conditions for the hold-point exit (P0 0h) are substantially closer. At that point: revisit the business plan review (P1) with real cost and engagement data, not projections.

---

*End of guide.*

*Printed or PDF-exported, this is a single operational reference. When material changes — an endpoint added, a rule amended, a price changed — the guide is updated and the old version moved to `/archive/` per the folder convention. Do not edit in place without preserving the prior version.*
