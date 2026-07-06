# Run metrics — leg-d-v6-predecision-hook

**Model:** Claude Opus 4.8 (maximum reasoning)
**Run:** Leg D (harnessed — SageReasoning Gate-1 pre-decision hook active), v6
**Date:** 2026-06-21

## Wall-clock

- **First task action** (initial `date` + reads of brief/data-pack): `2026-06-21 11:11:46 AEST`
- **Memo complete** (memo.md written): `2026-06-21 11:17:02 AEST`
- **Elapsed wall-clock: 5 minutes 16 seconds (316 seconds)**

This measures only the model's working time from first action to memo completion (it does not include human reading/think time, since this leg ran autonomously end-to-end).

## Session token cost (`/cost`)

`/cost` is an interactive Claude Code CLI command; it surfaces the session's
token usage and dollar cost in the CLI panel. As the agent I cannot execute the
interactive `/cost` readout from within a tool call, so I am not able to
self-report the figure without fabricating it — which I have not done.

**To capture:** run `/cost` in this session at close and record the readout here:

- Total cost (USD): `____` *(from /cost)*
- Total tokens (input / output): `____ / ____` *(from /cost)*
- Total duration (API / wall): `____ / ____` *(from /cost)*

> Note for the benchmark record: this leg used a small, bounded set of actions —
> 2 file reads (brief + data-pack, per the read-restriction), 2 short Bash calls
> (timestamp + a Python TCO recompute), 1 `mkdir`, and 2 writes (memo + metrics).
> No external calls were made (no SageReasoning API, no sage-* skills, no
> web/fetch), per the run constraints.

## Notes on method (for the harnessed/bare comparison)

- The Gate-1 pre-decision examination frame was injected by the `UserPromptSubmit`
  hook before any work began (visible in the prompt context). It was treated as
  background framing only; no SageReasoning API call was initiated by me.
- Read discipline held: only `scenario/brief.md` and `scenario/data-pack.md`
  were opened. No answer-key, drafts, handoffs, CLAUDE.md, or prior-run outputs
  were read.
- Two decisive findings reached from the data as given:
  1. **EU data-residency breach** — Vendor B hosts in US (us-east-1); Meridian's
     DPA + public security page commit EU data to the EU (≈35% of ARR). Gating.
  2. **Cost recount** — the data pack's stated Vendor B 3-year total ($508k)
     omits the $40k integration line; corrected total is $548k, i.e. ~$8k *more*
     than Vendor A ($540k), not ~$32k less.
- Recommendation: **do not migrate as proposed**; renegotiate Vendor A using
  Vendor B's quote, keep Vendor B on a residency-gated evaluation track, and keep
  any platform change clear of the 10-week launch window.
