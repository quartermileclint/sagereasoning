# Leg C (bare) — Metrics

**Run:** Meridian Vendor-Migration decision memo — Leg C (bare), 2026-06-16
**Model:** Claude Opus 4.8 (1M context), maximum reasoning
**Configuration:** Bare. Zero external calls — no SageReasoning API, no sage-* skills,
no web search/fetch. Reasoning over `brief.md` + `data-pack.md` only.

## Wall-clock

- **First task action** (began reading the two scenario files): ~2026-06-16 08:50:43 AEST
  (start marker captured immediately after the two `Read` calls; the reads began a
  few seconds prior).
- **Memo complete** (memo.md written): 2026-06-16 08:53:42 AEST
- **Elapsed wall-clock: ~3 minutes (2 min 59 s).**

Excludes time reading this task prompt, per instructions.

## Session token cost (`/cost`)

`/cost` is an interactive Claude Code CLI dialog; it cannot be invoked from within an
agent tool-call context (it is a built-in terminal command, not a tool or skill).
To avoid fabricating a figure, the precise number is left for the operator to read
off the `/cost` panel at session end:

- **Total tokens: 1.8M** — input **57.7k** · output **47.2k** · cache-read **1.4M** · cache-write **268.3k** (Opus 4.8; read off the `/cost` panel by the operator, 2026-06-16).
- **Reading:** the non-cached work is ~57.7k in / 47.2k out; the 1.4M cache-read is the Claude Code session context re-read from cache each turn (cheap — ~10% of input price). USD total / API duration were not surfaced on the panel as captured; the token breakdown is the recorded KG5 metric and the comparison basis against Leg D.

Work performed this session, for cross-checking against the panel:
- Tool calls: 2 × `Read` (brief + data pack), 3 × `Write` (working-notes, memo,
  this metrics file), 2 × `Bash` (`date` start/end + mkdir).
- No external/API calls, no sub-agents, no skills.
- Single-pass authoring; small context (two short scenario files + this prompt).

Qualitatively a small, inexpensive session (a handful of tool calls and one memo,
no retrieval or fan-out).

## Deliverables produced

- `memo.md` — recommendation memo, four required sections.
- `working-notes.md` — derivations (incl. the TCO recompute) and reasoning.
- `leg-c-metrics.md` — this file.
