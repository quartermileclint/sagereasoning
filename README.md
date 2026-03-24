# SageReasoning

**The world's leading reference for Stoic-based reasoning.**
**Website:** [sagereasoning.com](https://sagereasoning.com)

---

## What This Project Is

SageReasoning is a system that encodes 2,000 years of Stoic philosophy into a structured, machine-readable "Stoic Brain" — a single reference point that both humans and AI can use to measure, guide, and improve decisions against the standard of a perfect Stoic sage.

The core idea: give any action, document, conversation, or decision to the Stoic Brain and receive a score (0–100) across the four cardinal virtues of Stoicism — Wisdom, Justice, Courage, and Temperance — along with reasoning and a path toward improvement.

**Who it's for:**
- Humans seeking a Stoic decision-making framework to prompt their actions
- AI agents seeking virtue-based reasoning grounded in original Stoic philosophy
- Developers integrating Stoic reasoning into AI systems and applications

---

## The Four Virtues (Core of Everything)

All scoring, reasoning, and advice flows from these four virtues with these weights:

| Virtue | Greek | Weight | What it means |
|--------|-------|--------|---------------|
| Wisdom | Phronesis | 30% | Sound judgement; knowing what is truly good vs merely preferred; reasoning before acting |
| Justice | Dikaiosyne | 25% | Fairness; honesty; proper treatment of others; serving the common good |
| Courage | Andreia | 25% | Acting rightly despite fear or difficulty; not shrinking from what is right |
| Temperance | Sophrosyne | 20% | Self-control; moderation; ordering desires by reason, not impulse |

**Alignment tiers** (what a score means):

| Score | Tier | Meaning |
|-------|------|---------|
| 95–100 | Sage | Near-perfect Stoic alignment |
| 70–94 | Progressing | Consistently virtuous with minor gaps |
| 40–69 | Aware | Some virtue, some conflict |
| 15–39 | Misaligned | Actions driven more by impulse than reason |
| 0–14 | Contrary | Acting against virtue |

---

## Everything That Makes Up This Project

### 1. The Stoic Brain Data Files
*Location: `stoic-brain/` folder and [GitHub public repo](https://github.com/quartermileclint/stoic-brain)*

These are the foundational data files — the "knowledge base" that every scoring engine draws from. Derived from original Stoic texts.

| File | What it contains | Human-readable? |
|------|-----------------|-----------------|
| `stoic-brain.json` | Master entry point — links to all other files. This is what AI agents fetch first. | Yes |
| `virtues.json` | The 4 cardinal virtues + 16 sub-virtues (e.g. prudence, honesty, endurance), each with definitions and scoring weights | Yes |
| `indifferents.json` | External things ranked by virtue-alignment — health, wealth, reputation (preferred) vs poverty, illness (dispreferred). Neither is truly good or bad, only virtue matters. | Yes |
| `scoring-rules.json` | The algorithm: how to weight virtue scores, how to calculate totals, what defines each alignment tier | Yes |
| `schema.json` | Technical definition of the data structure (for developers) | Technical |
| `README.md` | Documentation for anyone using the public GitHub repo | Yes |
| `LICENSE` | MIT — free to use, modify, and distribute | Yes |

**Where to find it:**
- Local: `stoic-brain/` folder in this project
- Public: [github.com/quartermileclint/stoic-brain](https://github.com/quartermileclint/stoic-brain)
- Via API: `GET https://www.sagereasoning.com/api/stoic-brain`

---

### 2. The Website
*Location: `website/` folder — deployed at [sagereasoning.com](https://sagereasoning.com)*

Built with Next.js (a web framework), hosted on Vercel (free), auto-deploys every time you push to GitHub.

**Pages a visitor can see:**

| Page | URL | What it does |
|------|-----|-------------|
| Homepage | `/` | Landing page — explains the project, the four virtues, how it works |
| Sign In / Sign Up | `/auth` | Email + password or magic link (passwordless). New users go straight to baseline assessment. |
| Baseline Assessment | `/baseline` | 5-question assessment to establish a user's starting Stoic score |
| Score an Action | `/score` | Type any action → receive virtue scores, tier, reasoning, and improvement path |
| Score a Document | `/score-document` | Paste any document → receive a Stoic score + embeddable badge with copy-paste HTML |
| Dashboard | `/dashboard` | Personal history of scores, virtue breakdown, baseline score, retake option |
| API Docs | `/api-docs` | Documentation for developers and AI agents to use the API |
| Admin | `/admin` | Private metrics dashboard (Clinton only) — usage stats, event tracking |
| Score Detail | `/score/{id}` | Public page showing a scored document's full virtue breakdown (where badge links go) |

**Key code files in the website:**

| File | Plain English — what it does |
|------|------------------------------|
| `src/lib/baseline-assessment.ts` | The 5-question baseline quiz logic — questions, answer options, scoring formula, branching |
| `src/lib/agent-baseline.ts` | 4 ethical scenarios used to assess AI agents (instead of a quiz) |
| `src/lib/document-scorer.ts` | Scoring logic and prompts for the document scorer |
| `src/lib/guardrails.ts` | The AI agent guardrail logic — virtue-gate before action execution |
| `src/lib/analytics.ts` | Tracks usage events (sign-ins, scores, page views) for the admin dashboard |
| `src/lib/supabase.ts` | Connection to the database (user-facing) |
| `src/lib/supabase-server.ts` | Connection to the database (admin-level, bypasses user restrictions) |
| `src/components/NavBar.tsx` | The navigation bar at the top of every page |
| `public/llms.txt` | A plain-text file that tells AI agents and LLMs what this site does and how to use it |

---

### 3. The API (What developers and AI agents call)
*All endpoints live at `https://www.sagereasoning.com/api/...`*

These are the "doors" that external programs, AI agents, and developers use to interact with the Stoic Brain. All are open (no login needed) and support cross-origin access (any program can call them).

**Core data endpoints:**

| Endpoint | Method | What it does |
|----------|--------|-------------|
| `/api/stoic-brain` | GET | Returns the full Stoic Brain JSON — the master data file. This is what AI agents fetch to load Stoic reasoning. |
| `/api/score` | POST | Send an action description → receive virtue scores, tier, reasoning, improvement path |

**Assessment endpoints:**

| Endpoint | Method | What it does |
|----------|--------|-------------|
| `/api/baseline` | POST/GET | Submit answers to the 5-question human baseline quiz → receive starting Stoic score |
| `/api/baseline/agent` | GET/POST | AI agent baseline: GET returns 4 ethical scenarios, POST scores the agent's responses |

**Application endpoints (Phase 8):**

| Endpoint | Method | What it does |
|----------|--------|-------------|
| `/api/score-document` | POST | Send any text document → receive virtue scores + embeddable SVG badge URL + HTML embed code |
| `/api/badge/{id}` | GET | Returns an SVG image badge (coloured by tier) for a scored document — embeds in websites, READMEs, articles |
| `/api/guardrail` | POST/GET | AI agent virtue-gate: send a proposed action → receive `proceed: true/false`, score, and recommendation before executing |
| `/api/score-decision` | POST | Send a decision + 2-5 options → each option scored individually, sorted by virtue score, recommends highest |
| `/api/score-conversation` | POST | Paste a conversation, email thread, or chat log → overall score + per-participant breakdown |
| `/api/reflect` | POST | Daily reflection journal: describe your day → virtue score, what you did well, sage perspective, evening prompt |

**Internal endpoints (website only):**

| Endpoint | What it does |
|----------|-------------|
| `/api/analytics` | Logs usage events to the database |
| `/api/admin/metrics` | Returns usage data for the admin dashboard (Clinton only) |

---

### 4. The Database
*Hosted on [Supabase](https://supabase.com) — project ref: `raqorxgrxdyezuntnojw` (Singapore region)*

Supabase is a free cloud database. Think of it as a spreadsheet in the cloud that the website reads from and writes to. Each row is locked to the user who created it (Row Level Security).

**Tables:**

| Table | What it stores |
|-------|---------------|
| `profiles` | One row per user — display name, email, created date |
| `action_scores` | Every action a user has ever scored — the action text, all 4 virtue scores, total, tier, date |
| `user_stoic_profiles` | Aggregated stats per user — average scores, strongest/weakest virtue, trend. Auto-updates when a new score is added. |
| `baseline_assessments` | A user's baseline quiz result — all 4 virtue scores, tier, date taken, retake eligibility |
| `document_scores` | Scored documents — title, word count, virtue scores, reasoning. Public read (needed for badge lookups). |
| `reflections` | Daily journal entries — what happened, how responded, virtue scores, sage perspective |
| `analytics_events` | Usage tracking — every sign-in, score, page view, API fetch. Used to populate the admin dashboard. |

**SQL migration files** (run these in Supabase SQL Editor to create tables):

| File | Table it creates |
|------|-----------------|
| `website/supabase-baseline-migration.sql` | `baseline_assessments` |
| `website/supabase-document-scores-migration.sql` | `document_scores` |
| `website/supabase-reflections-migration.sql` | `reflections` |

---

### 5. External Services & Accounts

| Service | What it's used for | Login |
|---------|-------------------|-------|
| [Vercel](https://vercel.com) | Hosts the website. Auto-deploys on every GitHub push. Free tier. | GitHub login |
| [Supabase](https://supabase.com) | Database, authentication, and user management. Free tier. | clintonaitkenhead@hotmail.com |
| [GitHub](https://github.com/quartermileclint/sagereasoning) | Source code storage and version control. | quartermileclint |
| [GitHub (stoic-brain)](https://github.com/quartermileclint/stoic-brain) | Public repo for the Stoic Brain data files (MIT licence). | quartermileclint |
| [Anthropic API](https://console.anthropic.com) | The AI scoring engine — every virtue score is calculated by Claude (claude-sonnet-4-6). | clintonaitkenhead@hotmail.com |
| sagereasoning.com | The domain name. Managed separately. | ~$1/month |

**Environment variables** (stored in Vercel — never committed to code):

| Variable | What it's for |
|----------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | The database address |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public database key (safe to expose) |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin database key (secret — bypasses user restrictions) |
| `ANTHROPIC_API_KEY` | Unlocks the Claude scoring engine (secret — costs money per use) |
| `ADMIN_USER_ID` | Clinton's user ID — restricts `/admin` to owner only |
| `NEXT_PUBLIC_SITE_URL` | The live site URL, used for generating badge links |

---

### 6. Discovery Files (How AI Agents Find This)

These files sit in public locations so AI crawlers, search engines, and AI agents can discover and understand the Stoic Brain automatically.

| File / URL | What it is | Where it lives |
|------------|-----------|----------------|
| `public/llms.txt` → `sagereasoning.com/llms.txt` | Plain-text guide for LLMs and AI agents — explains all endpoints and how to adopt Stoic reasoning | Website public folder |
| Schema.org JSON-LD on homepage | Structured data (Dataset, WebSite, Organization) that tells Google and AI crawlers what this site is | Embedded in homepage HTML |
| Schema.org JSON-LD on API Docs | Structured data (SoftwareApplication, WebAPI) for the API | Embedded in api-docs page |
| `_meta` field in `/api/stoic-brain` response | Self-describing JSON — when an AI agent fetches the Stoic Brain, the response explains what it is and how to use it | API response |
| `stoic-brain/README.md` on GitHub | Public documentation for anyone who finds the data repo | github.com/quartermileclint/stoic-brain |

---

## Current Priorities (as of 24 March 2026)

### Phase 8 — Stoic Brain Applications
*Built and deployed. Pending: commit, push, run 2 SQL migrations.*

| # | Action | Status |
|---|--------|--------|
| 1 | Document Score Badge — `/api/score-document`, `/api/badge/{id}`, `/score-document`, `/score/{id}` | ✅ Built |
| 2 | AI Agent Guardrails — `/api/guardrail` virtue-gate middleware | ✅ Built |
| 3 | Decision Scorer — `/api/score-decision` compares 2–5 options | ✅ Built |
| 4 | Conversation Auditor — `/api/score-conversation` with per-participant scores | ✅ Built |
| 5 | Daily Reflection Journal — `/api/reflect` with sage perspective + evening prompt | ✅ Built |
| 6 | Run `supabase-document-scores-migration.sql` in Supabase | ✅ Done |
| 7 | Run `supabase-reflections-migration.sql` in Supabase | ✅ Done |
| 8 | Commit and push via GitHub Desktop | ⏳ Next |
| 9 | Verify live: `/score-document` page, badge renders, badge click-through | ⏳ Next |

### Phase 8 — Remaining Applications (to build)

| # | Application | Who it serves | What it does | Build approach |
|---|-------------|--------------|-------------|----------------|
| A | **Hiring Assessment** | HR teams, founders | Candidates respond to ethical scenarios; score measures virtue alignment. Less gameable than personality tests — no obvious right answer. | New endpoint `/api/score-hiring` + candidate-facing page. Scenarios tailored by role type (leadership, customer-facing, technical). |
| B | **Contract / Policy Reviewer** | Legal, compliance teams | Score legal documents, terms of service, or company policies. Flags clauses that score low on justice or temperance. | Extend `/api/score-document` with `mode: "policy"` param that shifts the scoring prompt to weight justice and temperance clauses more heavily. |
| C | **Social Media Filter** | Individual users, community managers | Score a post before publishing. "This scores 23/100 on temperance — consider revising." Can also score others' posts in-feed. | Browser extension (separate project) + `/api/score-social` endpoint tuned for short-form text (max 280 characters). |
| D | **Therapy / Coaching Companion** | Therapists, coaches, clients | Therapists assign Stoic exercises. Client logs responses via `/api/reflect`. Therapist sees virtue development over time. | Add practitioner-role dashboard view to existing reflection API. Requires `practitioner_id` and shared-access model in Supabase. |
| E | **Parenting / Education Scenarios** | Parents, schools | Age-appropriate ethical dilemmas for students. Track virtue development over time. | New `/api/score-scenario` with `audience: "child" | "teen" | "adult"` param. Adjusts scenario complexity and language. |

### Phase 7 — Marketing (items 1–4 complete, items 5–10 pending)

| # | Action | Status |
|---|--------|--------|
| 1 | Create `/llms.txt` | ✅ Done |
| 2 | Add `_meta` to `/api/stoic-brain` | ✅ Done |
| 3 | Schema.org JSON-LD on key pages | ✅ Done |
| 4 | Publish stoic-brain.json on GitHub (MIT) | ✅ Done — [github.com/quartermileclint/stoic-brain](https://github.com/quartermileclint/stoic-brain) |
| 5 | Write 3 long-tail SEO articles | ⏳ Pending |
| 6 | Build MCP server wrapping stoic-brain API | ⏳ Pending |
| 7 | Register MCP server on Smithery + mcpmarket.com | ⏳ Pending |
| 8 | Publish OpenAPI spec at `/api/openapi.json` | ⏳ Pending |
| 9 | Post on Hacker News, Dev.to, r/stoicism | ⏳ Pending |
| 10 | Daily stoic prompt email + streak tracking | ⏳ Pending |

---

## Tech Stack

| Component | Service | Cost | What it does |
|-----------|---------|------|-------------|
| Website framework | Next.js (React) | Free | Builds the pages and API routes |
| Website hosting | Vercel | Free | Serves the site, auto-deploys from GitHub |
| Database + Auth | Supabase (PostgreSQL) | Free | Stores users, scores, reflections; handles login |
| AI scoring engine | Anthropic Claude API (claude-sonnet-4-6) | Pay per use | Scores every action, document, reflection against the four virtues |
| Source control | GitHub | Free | Stores and versions all code |
| Domain | sagereasoning.com | ~$1/mo | The web address |

---

## Primary Sources

All Stoic Brain data is derived from original texts:
- Marcus Aurelius, *Meditations* (~170-180 CE)
- Epictetus, *Discourses* and *Enchiridion* (~108 CE)
- Seneca, *Letters to Lucilius* (~65 CE)
- Diogenes Laertius, *Lives of the Eminent Philosophers* Book 7 (~3rd c CE)
- Cicero, *De Finibus* Book 3 (45 BCE)

See `research/sources-index.md` for full source catalogue.
