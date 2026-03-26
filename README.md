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
| Review a Policy | `/score-policy` | Score contracts, terms of service, or company policies — justice and temperance weighted more heavily, flags problematic clauses |
| Social Media Filter | `/score-social` | Score a post before publishing — get publish/revise/reconsider recommendation |
| Hiring Assessment | `/hiring` | Generate role-specific ethical scenarios for candidates, score their moral reasoning |
| Coaching Companion | `/therapy` | Stoic therapeutic exercises — practitioners assign, clients journal, virtue feedback returned |
| Ethical Scenarios | `/scenarios` | Age-appropriate ethical dilemmas (child/teen/adult) with options and scoring |

**Key code files in the website:**

| File | Plain English — what it does |
|------|------------------------------|
| `src/lib/baseline-assessment.ts` | The 5-question baseline quiz logic — questions, answer options, scoring formula, branching |
| `src/lib/agent-baseline.ts` | 4 ethical scenarios used to assess AI agents (instead of a quiz) |
| `src/lib/document-scorer.ts` | Scoring logic and prompts for the document scorer |
| `src/lib/guardrails.ts` | The AI agent guardrail logic — virtue-gate before action execution |
| `src/lib/analytics.ts` | Tracks usage events (sign-ins, scores, page views) for the admin dashboard |
| `src/lib/milestones.ts` | All milestone definitions and the logic that checks when they are earned (includes journal milestones) |
| `src/lib/journal-content.ts` | All 56 Stoic journal entries — teachings, reflective questions, phase structure |
| `src/lib/stoic-brain.ts` | The four virtues, alignment tiers, and helper functions used across the website |
| `src/lib/supabase.ts` | Connection to the database (user-facing) |
| `src/lib/supabase-server.ts` | Connection to the database (admin-level, bypasses user restrictions) |
| `src/components/NavBar.tsx` | The navigation bar at the top of every page |
| `src/components/PracticeCalendar.tsx` | Monthly calendar showing daily activity — action stamps, reflection stamps, and journal stamps |
| `src/components/MilestonesDisplay.tsx` | Visual milestone progress display on the dashboard |
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
| `/api/score-document` | POST | Send any text document → virtue scores + badge. Add `mode: "policy"` for contract/policy review with adjusted weights and flagged clauses. |
| `/api/badge/{id}` | GET | Returns an SVG image badge (coloured by tier) for a scored document — embeds in websites, READMEs, articles |
| `/api/guardrail` | POST/GET | AI agent virtue-gate: send a proposed action → receive `proceed: true/false`, score, and recommendation before executing |
| `/api/score-decision` | POST | Send a decision + 2-5 options → each option scored individually, sorted by virtue score, recommends highest |
| `/api/score-conversation` | POST | Paste a conversation, email thread, or chat log → overall score + per-participant breakdown |
| `/api/reflect` | POST | Daily reflection journal: describe your day → virtue score, what you did well, sage perspective, evening prompt |
| `/api/score-hiring` | GET/POST | GET returns role-specific ethical scenarios (leadership, customer-facing, technical, general). POST scores candidate responses. |
| `/api/score-social` | POST | Score short-form text (tweets, comments, posts) before publishing — returns publish/revise/reconsider recommendation |
| `/api/score-therapy` | GET/POST | GET generates a Stoic therapeutic exercise for a focus area. POST scores a client's journal response with practitioner notes. |
| `/api/score-scenario` | GET/POST | GET generates age-appropriate ethical dilemmas (child/teen/adult). POST scores the user's response. |

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
| `journal_entries` | The Path of the Prokoptos journal — day number, phase, reflection text (or `__local__` flag for local-storage users), word count, completion timestamp |
| `analytics_events` | Usage tracking — every sign-in, score, page view, API fetch. Used to populate the admin dashboard. |

**SQL migration files** (run these in Supabase SQL Editor to create tables):

| File | Table it creates | Status |
|------|-----------------|--------|
| `website/supabase-baseline-migration.sql` | `baseline_assessments` | ✅ Done |
| `website/supabase-document-scores-migration.sql` | `document_scores` | ✅ Done |
| `website/supabase-reflections-migration.sql` | `reflections` | ✅ Done |
| `api/migrations/add-journal-entries-table.sql` | `journal_entries` | ✅ Done 26 March 2026 |

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

## Current Status (as of 26 March 2026)

### Live Features

| Feature | URL | Status |
|---------|-----|--------|
| Homepage | `/` | ✅ Live |
| Sign In / Sign Up | `/auth` | ✅ Live |
| Baseline Assessment | `/baseline` | ✅ Live |
| Score an Action | `/score` | ✅ Live |
| Score a Document | `/score-document` | ✅ Live |
| Review a Policy | `/score-policy` | ✅ Live |
| Social Media Filter | `/score-social` | ✅ Live |
| Hiring Assessment | `/hiring` | ✅ Live |
| Coaching Companion | `/therapy` | ✅ Live |
| Ethical Scenarios | `/scenarios` | ✅ Live |
| Dashboard | `/dashboard` | ✅ Live |
| **Stoic Journal** | `/journal` | ✅ Live — deployed 26 March 2026 |
| API Docs | `/api-docs` | ✅ Live |
| Admin | `/admin` | ✅ Live (owner only) |

---

### Priority 4 — Stoic Journal (COMPLETE ✅)

The Path of the Prokoptos — a 56-day structured Stoic journal. Deployed 26 March 2026.

**What was built:**

| File | What it does |
|------|-------------|
| `src/lib/journal-content.ts` | All 56 journal entries as static data — teaching passage + reflective question per day, across 7 phases |
| `src/app/journal/page.tsx` | The full journal page with storage choice setup, entry display, writing area, curriculum map, and day navigation |
| `src/app/api/journal/route.ts` | POST (submit entries with pace control) and GET (retrieve progress) endpoints |
| `api/migrations/add-journal-entries-table.sql` | Database migration — run in Supabase to create the `journal_entries` table |

**Journal design:**
- 56 days across 7 phases: Foundation → Wisdom → Thoughts → Emotions → Acceptance → Gratitude → Integration
- Every entry derived from the Stoic Brain virtue framework, sub-virtues, and scoring philosophy
- Format: READ a succinct teaching → REFLECT by writing honestly about your own experience
- One entry per day (pace-controlled server-side)
- Entries are **not virtue-scored** — the journal is a safe space for honest reflection
- Completing an entry earns a **calendar stamp** for tenacity tracking
- 6 new milestones: First Page, Examined Week, Foundation Layer, Halfway Mark, The Prokoptos, Return to the Path

**Local Storage option (Priority 5 partial implementation):**

At setup, users choose how their written reflections are stored:
- **Cloud** — saved to their account, accessible from any device, full history
- **Local Only** — text stays in browser localStorage, never sent to the server. Only a completion flag is sent for calendar stamps.

**SQL migration required:**
Run `api/migrations/add-journal-entries-table.sql` in Supabase SQL Editor. ✅ Done 26 March 2026.

---

### Phase 8 — Stoic Brain Applications (COMPLETE ✅)

| Application | Endpoint | UI Page | Status |
|-------------|----------|---------|--------|
| Document Score Badge | `/api/score-document`, `/api/badge/{id}` | `/score-document`, `/score/{id}` | ✅ Live |
| AI Agent Guardrails | `/api/guardrail` | — | ✅ Live |
| Decision Scorer | `/api/score-decision` | — | ✅ Live |
| Conversation Auditor | `/api/score-conversation` | — | ✅ Live |
| Daily Reflection | `/api/reflect` | — | ✅ Live |
| Hiring Assessment | `/api/score-hiring` | `/hiring` | ✅ Live |
| Policy Reviewer | `/api/score-document` (mode: policy) | `/score-policy` | ✅ Live |
| Social Media Filter | `/api/score-social` | `/score-social` | ✅ Live |
| Coaching Companion | `/api/score-therapy` | `/therapy` | ✅ Live |
| Ethical Scenarios | `/api/score-scenario` | `/scenarios` | ✅ Live |

---

### Remaining Priorities

| Priority | Item | Status |
|----------|------|--------|
| P1 | Brainstorm and implement more Stoic Brain use cases | ⏳ Ongoing |
| P2 | Research gamification that doesn't violate Stoic values | ⏳ Pending |
| P3 | Design a unique Stoic social platform | ⏳ Pending |
| P5 | Local storage options for sensitive features (journal: done) | 🔄 Partial |
| P6 | World map showing user locations with sage logos | ⏳ Pending |
| P7 | Security review of files and data | ⏳ Pending |
| P8 | New marketing strategy based on fully featured website | ⏳ Pending |
| P9 | Legal implications research | ⏳ Pending |
| P10 | Income model research to cover escalating costs | ⏳ Pending |
| P13 | Implement marketing strategy | ⏳ Pending |

### Phase 7 — Marketing (items 1–4 complete)

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
