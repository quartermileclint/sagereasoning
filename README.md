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
| `stoic-brain/scoring-rules.json` | Action scoring algorithm | ⏳ Phase 2 |

---

## Development Phases

| Phase | Priorities | Status |
|-------|-----------|--------|
| **Phase 1 — Foundation** | P1: Research, P2: Format, P3: Stoic Brain data | 🔄 In progress |
| **Phase 2 — Build** | P4: API, P5: Indifferents scoring, P6: Past action scoring, P7: Action advice, P10: Auth | ⏳ Planned |
| **Phase 3 — Ship** | P8: Website, P9: AI agent testing | ⏳ Planned |
| **Phase 4 — Launch** | P11: Go live | ⏳ Planned |

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
