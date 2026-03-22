# SageReasoning

**The world's leading reference for Stoic-based reasoning.**
**Website:** sagereasoning.com

---

## What This Project Is

SageReasoning provides a single-point-of-reference data set — the "Stoic Brain" — for both humans and AI agents to measure, guide, and improve their decisions against the standard of perfect Stoic sage reasoning.

Clients:
1. **Humans** seeking a Stoic decision-making framework
2. **AI agents** seeking virtue-based reasoning grounded in original Stoic philosophy
3. **Developers** integrating Stoic reasoning into AI systems

---

## Project Structure

```
sagereasoning/
├── research/           P1: Historic stoic texts and passage-level references
├── stoic-brain/        P2-P3: The core data product (JSON files)
├── website/            P8: Next.js website (Phase 3)
├── api/                P4: API spec and edge functions (Phase 2)
├── docs/               Human and AI agent documentation
└── README.md
```

---

## The Stoic Brain (Current Status: v1.0)

The Stoic Brain is a structured, machine-readable and human-readable dataset encoding Stoic philosophy for practical use.

| File | Purpose | Status |
|------|---------|--------|
| `stoic-brain/stoic-brain.json` | Master file — entry point for AI agents | ✅ v1.0 |
| `stoic-brain/schema.json` | Data structure definition | ✅ v1.0 |
| `stoic-brain/virtues.json` | 4 cardinal virtues + 16 sub-virtues + scoring weights | ✅ v1.0 |
| `stoic-brain/indifferents.json` | Preferred/dispreferred indifferents + virtue relevance | ✅ v1.0 |
| `stoic-brain/scoring-rules.json` | Action scoring algorithm | ✅ v1.0 |

---

## Development Phases

| Phase | Priorities | Status |
|-------|-----------|--------|
| **Phase 1 — Foundation** | P1: Research, P2: Format, P3: Stoic Brain data | ✅ Complete |
| **Phase 2 — Build** | P4: API, P5: Indifferents scoring, P6: Past action scoring, P7: Action advice, P10: Auth | ✅ Complete |
| **Phase 3 — Ship** | P8: Website build, P9: AI agent testing | ✅ Complete |
| **Phase 4 — Scoring Engine** | Claude API server-side scoring | ✅ Complete |
| **Phase 5 — Launch** | P10: Registration/onboarding, P11: Go live | ✅ Complete |

---

## Phase 2 Complete: Supabase Backend & Auth Live

**Database (PostgreSQL on Supabase)**
- `profiles` — auto-created on user signup via trigger
- `action_scores` — stores individual action evaluations (wisdom, justice, courage, temperance scores + total + alignment tier)
- `user_stoic_profiles` — aggregated per-user stats (averages, strongest/weakest virtues, trend)
- Triggers: `on_auth_user_created`, `on_action_score_added` (auto-recalculates stoic profile on each new score)
- RLS enabled — users can only access their own data

**Authentication**
- Email provider (password + magic link sign-in)
- Site URL: `https://sagereasoning.com`
- Redirect URLs: production + localhost:3000 (dev)

**API Specification (OpenAPI 3.1)**
- `/api/v1/virtues` — cardinal virtues taxonomy
- `/api/v1/indifferents` — preferred/dispreferred indifferents
- `/api/v1/stoic-brain` — master data entry point
- `/api/v1/score-action` — POST action → receive virtue scores + sage alignment
- `/api/v1/advise-action` — GET action guidance from stoic brain
- `/api/v1/rank-indifferents` — GET ranked indifferents based on virtue-alignment
- `/api/v1/user/scores` — GET user's past action scores
- `/api/v1/user/profile` — GET user's aggregated stoic profile

**Project Configuration**
- GitHub repo: `github.com/quartermileclint/sagereasoning`
- Supabase project ref: `raqorxgrxdyezuntnojw` (ap-southeast-1)
- `.env.local` configured with live Supabase keys (not committed to git)

---

## Tech Stack

| Component | Service | Tier |
|-----------|---------|------|
| Website host | Vercel | Free |
| Database + Auth + API | Supabase | Free |
| Source control | GitHub | Free |
| Domain | sagereasoning.com | ~$1/mo |

---

## For AI Agents

To use the Stoic Brain in your reasoning:

1. Fetch `stoic-brain/stoic-brain.json` — this is the master index
2. Load `stoic-brain/virtues.json` for the full virtue taxonomy and scoring weights
3. Load `stoic-brain/indifferents.json` for the classification of external things
4. When the scoring API is live (Phase 2), use `POST /api/v1/score-action`

**Core principle for AI reasoning:** An action is virtuous to the degree it expresses wisdom, justice, courage, and temperance simultaneously — as judged by the agent's intention and reasoning, not outcome alone.

---

## Primary Sources

All data is derived from:
- Marcus Aurelius, *Meditations* (~170-180 CE)
- Epictetus, *Discourses* and *Enchiridion* (~108 CE)
- Seneca, *Letters to Lucilius* (~65 CE)
- Diogenes Laertius, *Lives of the Eminent Philosophers* Book 7 (~3rd c CE)
- Cicero, *De Finibus* Book 3 (45 BCE)

See `research/sources-index.md` for full source catalogue.

---

## Phase 3 Complete: Website Live at sagereasoning.com

**Tech deployed**
- Next.js 14 App Router + TypeScript + Tailwind CSS
- 5 pages: Landing, Auth (sign in/up/magic link), Score Action, Dashboard, API Docs
- Brand-matched: EB Garamond + Cormorant Garamond, sage green palette, all logo assets
- Deployed to Vercel — auto-deploys on every GitHub push to `main`
- Custom domain `sagereasoning.com` + `www.sagereasoning.com` live and green

---

## Phase 4 Complete: Claude API Scoring Engine Live

**What changed**
- Replaced client-side keyword heuristic (`heuristic-v1`) with server-side Claude API scoring
- New API route: `POST /api/score` — calls `claude-sonnet-4-6` with full Stoic virtue prompt
- Scores each action against Wisdom (30%), Justice (25%), Courage (25%), Temperance (20%)
- Returns virtue scores 0–100, weighted total, alignment tier, reasoning, improvement path, strength + growth area
- All scores now recorded as `scored_by: 'claude-api-v1'` in Supabase
- `ANTHROPIC_API_KEY` stored securely in Vercel environment variables (not in code)

---

## Phase 5 Complete: Registration & Go Live

**What changed**
- Auth-aware navigation bar — shows user display name + avatar initial when signed in, dropdown menu with Dashboard/Score/Sign Out
- Extracted NavBar into client component (`src/components/NavBar.tsx`) that listens for real-time Supabase auth state changes
- Fixed Vercel deployment — env vars (including `ANTHROPIC_API_KEY`) now properly injected after redeploy
- Full registration flow verified end-to-end: sign up → email confirmation → sign in → score action → view dashboard

**Live registration system**
- Email + password sign-up with display name
- Magic link (passwordless) sign-in
- Email confirmation required before first sign-in
- Auto-profile creation on sign-up (Supabase trigger)
- Auto-stoic-profile recalculation on each new score (Supabase trigger)

**Site is live at sagereasoning.com** — all 11 priorities complete through P11

---

## Questions?

- Review `docs/ai-agent-guide.md` for how AI agents integrate with the Stoic Brain
- Check `api/api-spec.yaml` for full endpoint documentation
- See `stoic-brain/scoring-rules.json` for the virtue-weighting algorithm details
