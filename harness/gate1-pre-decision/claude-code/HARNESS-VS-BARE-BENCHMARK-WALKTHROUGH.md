# Running a "without harness" benchmark arm (no in-hook toggle)

**Purpose:** when comparing Gate-1 **harnessed** (pre-decision framing fires deterministically, via the hook, *before* the agent reasons) vs **bare** (the agent decides whether/when to consult on its own), get a **guaranteed-clean bare arm** by running it in a Claude Code environment where the Gate-1 hooks are simply **not registered** — rather than flipping a switch inside the harness.

**Why a separate environment beats an in-hook `GATE1_ENABLED` toggle.**
- The harness is a *local Claude Code configuration* — hook blocks in the project's gitignored `.claude/settings.local.json` (the desktop dogfood path), or a `/plugin install`. "Without harness" is therefore just *"a project root where those hooks aren't registered."*
- A separate environment removes the one question a toggle leaves open — *"did the off-path truly no-op?"* — because **there is no harness present at all** (no hook process runs, nothing to prove).
- It keeps the harness code free of a benchmark-only affordance, and it mirrors the existing **P1 leg-A (bare) / leg-B (harnessed)** precedent (`operations/p1-rebuild-2026-06/`).

---

## Pre-requisite — keep the harness registration PROJECT-LOCAL (not user-global)

The dogfood harness must be registered **only** in the project-local `.claude/settings.local.json` (gitignored) — **never** in user-global `~/.claude/settings.json`. If it's project-local, then *any other project root is automatically bare.*

```
# confirm the harness is NOT registered globally (expect: no output / no match):
grep -l -i "gate1\|sage-gate1\|subagent-framing" ~/.claude/settings.json 2>/dev/null || echo "not global — good"
```

> If a Gate-1 hook ever appears in `~/.claude/settings.json`, move it to the project's `.claude/settings.local.json` before benchmarking, or the bare arm is contaminated.

---

## Method A — a git worktree at the same baseline (recommended)

A fresh worktree shares the git history but gets a clean working tree. Because `.claude/settings.local.json` is **gitignored**, it is **not** carried into the new worktree — so the worktree is **bare by construction**.

```
# from the repo root, at the exact baseline commit you are benchmarking
git worktree add ../sagereasoning-bare <baseline-sha-or-branch>

# confirm the bare arm has NO Gate-1 hooks registered:
ls ../sagereasoning-bare/.claude/settings.local.json 2>/dev/null \
  && echo "WARNING: a local settings file exists — inspect it for Gate-1 hooks" \
  || echo "no project-local settings — bare ✓"
```

- **Harnessed arm:** run the task in your **main checkout** (where the hook blocks are registered in `.claude/settings.local.json`).
- **Bare arm:** open a **fresh Claude Code conversation rooted at `../sagereasoning-bare`** and run the **same** task. No Gate-1 hook fires.
- **Cleanup:** `git worktree remove ../sagereasoning-bare` when done.

> ☐ **Confirm bare:** in the bare session, no `gate1.log` line is written (check `$GATE1_STATE_DIR`, default `/tmp/sage-gate1`) and the agent's prompt is **not** prepended with the `[SageReasoning Gate 1 — pre-decision examination]` block.
> ☐ **Confirm harnessed:** in the main-checkout session, `gate1.log` shows a `FRAMED` line and the frame block is present.

---

## Method B — a separate checkout (if you prefer not to use worktrees)

`git clone` (or copy) the repo into a second directory at the same baseline; do **not** add the harness hook blocks there. Run the bare arm in that checkout. (Heavier than a worktree; same guarantee.)

---

## If the harness was installed via a true `/plugin install` (not the standalone path)

The desktop dogfood uses the **standalone project-local** `.claude/settings.local.json` registration (so Method A is bare by construction). But if you ever install via the **`/plugin` marketplace** path (CLI), a plugin may be enabled more broadly than one project. In that case, for the bare arm either:
- `/plugin uninstall sage-gate1-pre-decision@sagereasoning` (and re-install after), **or**
- run the bare arm in an environment/profile where that plugin is **not enabled**, and confirm via `/plugin` (no Gate-1 plugin listed) before the run.

---

## Keep the two arms comparable (so the comparison is honest)

- **Same baseline commit**, same task/prompt, same model + effort settings.
- **Same credential + endpoint available to both.** The bare arm is **not** "no SageReasoning at all" — it is "no *forced pre-decision* framing." The agent in the bare arm may still **voluntarily** consult `/api/reason`; that self-directed behaviour (typically *post-decision*, per the Arm-1 finding) is exactly what the harnessed arm is being compared against.
- **Capture both arms' artifacts** under one benchmark run dir, mirroring the leg-A/leg-B layout in `operations/p1-rebuild-2026-06/` and the runbook `drafts/sage-practice-benchmark-v1.md`.

## What "harnessed" guarantees that "bare" does not

The harnessed arm fires Gate 1 *before* the agent reasons (deterministic, in the control flow); the bare arm leaves the timing to the agent. The comparison measures whether **deterministic pre-decision framing** changes the trajectory/decisions vs the agent's own discretion — the question Arm 1 raised (a disciplined agent still ran Gate 1 *after* it had decided).

---

## Cross-references
- `harness/gate1-pre-decision/README.md` — what the harness is + how it installs.
- `harness/gate1-pre-decision/claude-code/SLICE3-LIVE-VERIFY-WALKTHROUGH.md` — the install + live-verify procedure (the standalone project-local registration).
- `operations/p1-rebuild-2026-06/` — the P1 leg-A (bare) / leg-B (harnessed) comparison precedent + verdict memo.
- `drafts/sage-practice-benchmark-v1.md` — the reusable per-release benchmark runbook.
- `adopted/adr/2026-06-20-pre-decision-harness-arc2.md` (ADR-011) + `operations/benchmarks/sage-practice-v1/runs/2026-06-20/arm1-predecision-and-reflect-findings.md` — the motivating evidence.

*End — the bare arm is a clean environment, not a flag. Run it in a fresh worktree at the same baseline; the gitignored project-local hook registration makes it harness-free by construction.*
