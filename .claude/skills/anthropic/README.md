# Anthropic Skills — local install

This folder contains the 17 official skills from [`anthropics/skills`](https://github.com/anthropics/skills), installed as a flat copy on **2026-05-14** under `D-ANTHROPIC-NATIVE-POSTURE-2026-05-14`.

## Source

Upstream: `https://github.com/anthropics/skills` (Public repository for Agent Skills; March 2026 release).

Two upstream plugin manifests group these skills:
- **`document-skills`** — `docx`, `pdf`, `pptx`, `xlsx` (4 skills). **Source-available, not open source** — proprietary license per each skill's `LICENSE.txt`. Source shared as a reference for production-quality skill implementations.
- **`example-skills`** — the other 13 skills (Apache-2.0). Demonstration + educational use.

## What's in this folder (17 skills)

| Skill | Category | License | Brief |
|---|---|---|---|
| `algorithmic-art` | Creative | Apache-2.0 | Generative-art patterns + scripts |
| `brand-guidelines` | Enterprise | Apache-2.0 | Apply brand style to docs/decks |
| `canvas-design` | Creative | Apache-2.0 | Visual composition + layout |
| `claude-api` | Technical | Apache-2.0 | Build/debug/optimise Claude API + Anthropic SDK apps |
| `doc-coauthoring` | Enterprise | Apache-2.0 | Multi-author document workflows |
| `docx` | Documents | Proprietary | Microsoft Word docs |
| `frontend-design` | Technical | Apache-2.0 | Frontend UI design patterns |
| `internal-comms` | Enterprise | Apache-2.0 | Internal communications (memos, updates) |
| `mcp-builder` | Technical | Apache-2.0 | Build Model Context Protocol servers |
| `pdf` | Documents | Proprietary | PDF processing |
| `pptx` | Documents | Proprietary | PowerPoint decks |
| `skill-creator` | Technical | Apache-2.0 | Create + iterate on skills |
| `slack-gif-creator` | Creative | Apache-2.0 | Animated GIFs for Slack |
| `theme-factory` | Creative | Apache-2.0 | Theme/style generation |
| `web-artifacts-builder` | Technical | Apache-2.0 | Build web artifacts |
| `webapp-testing` | Technical | Apache-2.0 | Test web applications |
| `xlsx` | Documents | Proprietary | Excel spreadsheets |

## How these are discovered

Claude Code recurses into `.claude/skills/` subfolders looking for `SKILL.md` files at any depth, so all 17 skills are discoverable from `.claude/skills/anthropic/<skill-name>/SKILL.md`. The sage-* skills at `.claude/skills/<sage-name>/` remain at top level (SageReasoning-internal, built per §0g of the project instructions).

## Updating from upstream

To refresh against the latest upstream:

```
cd /tmp && rm -rf anthropic-skills-temp
git clone --depth=1 https://github.com/anthropics/skills.git anthropic-skills-temp
# Replace folder-by-folder if a specific skill has updated:
cp -r /tmp/anthropic-skills-temp/skills/<skill-name>/* .claude/skills/anthropic/<skill-name>/
# Or replace all (preserving this provenance note):
cp .claude/skills/anthropic/README.md /tmp/anthropic-skills-readme-backup.md
rm -rf .claude/skills/anthropic/*
cp -r /tmp/anthropic-skills-temp/skills/* .claude/skills/anthropic/
cp /tmp/anthropic-skills-readme-backup.md .claude/skills/anthropic/README.md
rm -rf /tmp/anthropic-skills-temp /tmp/anthropic-skills-readme-backup.md
```

Disclaimer from upstream: "These skills are provided for demonstration and educational purposes only. While some of these capabilities may be available in Claude, the implementations and behaviors you receive from Claude may differ from what is shown in these skills."

## Cross-references

- Project instructions §PR15 — amended 2026-05-14 to mandate consultation of `.claude/skills/` before bespoke election
- `/CLAUDE.md` — entry-point file for Claude Code sessions; lists this folder
- `/operations/decision-log.md` — `D-ANTHROPIC-NATIVE-POSTURE-2026-05-14`

*End of provenance note.*
