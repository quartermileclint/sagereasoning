# W2 Session Opener — Q-S2-conforming variant

> **A preamble, not a task.** Read it, confirm what §1 asks, then wait for the task.
> **Every number in it is a claim to re-derive at your own open.**

---

## ⚠ Read this first

**This document is the founder's to change.** If something here looks wrong, incomplete, or worth
adding — including anything you would need in order to do the work well — **propose it to the founder
and do not apply it yourself.** That includes additions that seem plainly helpful.

**Route, do not resolve.** This applies to the document as much as to the work.

---

## 1. Confirm the standard opening (state these briefly, before the task)

1. **Tier** per risk classification 0d-ii, and whether **AC7** engages. **Model** per AC1.
2. **Standing holds, all unchanged: `0h` HELD · the S11 flip **REFUSED** · weights **BLOCKED** ·
   **D2 blocked**.**
3. **Status vocabulary:** `Scoped → Designed → Scaffolded → Wired → Verified → Live` for
   implementation; `Adopted / Under review / Superseded` for decisions.
4. **`git status` whole, never truncated**; unpushed commits (`git fetch origin && git log --oneline
   origin/main..HEAD`); **`ListAgents`** peer count.
5. **Whether your task touches `GUARD_RE`** — re-read the regex in
   `website/src/app/logos/__tests__/human-practitioner-boundary.test.ts`. **If it does and you have no
   recorded per-commit founder waiver, stop and route it.**

---

## 2. Read, in order (Tier 1)

1. `/adopted/standing-protocol-cache.md` — session protocol, model selection (AC1), risk
   classification (0d-ii), the concurrency check §6 (**a convention, not PR26**), status vocabulary.
   **Process rules are PR1–PR25 — verify by enumeration; do not quote that range.**
2. `/adopted/build-sessions-protocol-cache.md` — if the task is a substrate/trust-layer build.
3. `/adopted/project-instructions-snapshot.md` — **PR19** (independent review REQUIRED), PR20 as
   amended, PR25.
4. `/manifest.md` — **targeted sections only**: R0 plus the four un-numbered mentor-directed sections
   (the Moral Community Boundary; ATRF; the Consciousness and Continuity Obligation; the Prerequisite
   Criterion); AC5 (**note its internal contradiction — a founder call, unresolved**); AC7.
5. `/CLAUDE.md` — the 2026-09-12 W2 block (read its O-1 correction), the 2026-09-06 window block, the
   S9 block **with its 2026-09-12 annotation**, then the "Live in production" list.
6. `/operations/decision-log.md` — the **physical tail**. Newest entries are at the END, headed
   `## <date> — D-…`; a bare `grep '^## D-'` misses them.
7. **The closes matched to your task** (verbatim wins over every summary, including this
   document). **For tasks on the standing-runner / IDEA-loop track:**
   `operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md` §"Named inputs". **For W2:**
   `2026-09-12-W2-record-honesty-build-CLOSE.md` and `2026-09-12-W2-waiver-merge-and-schema-walk-CLOSE.md`.
   **For the Option S / M-W-S election:**
   `operations/agent-circles-2026-08/2026-09-13-mentor-rulings-option-s-result-and-F-R1-verbatim.md`
   (canonical) and `2026-09-13-M-W-S-ELECTION-DOCUMENT.md`. **`option-s/` itself stays closed** unless
   your task is briefed on it.
   **If your task touches the S11 track, ask the founder for the reading before you go looking** —
   do not assemble it yourself. That is a routing instruction, not a hint: the founder hands out that
   reading deliberately.
8. **Tier 2, task-dependent:** the day's deliverable in full; for R20a / count-discipline,
   `operations/count-discipline-2026-09/`; for agent-circles / logos-on,
   `operations/agent-circles-2026-08/` (the 2026-08-01 plan + L1–L7 verbatim; ADR-013 §12).
---

## 3. The work

**This window's designated work is the standing-runner design track.** The staged
compliance-not-virtue clause application is secondary to it.

**Scope:** design authoring in `operations/` on live or consequential surfaces, done through
Write/Edit rather than Bash-only automation. A guarded-file waiver on the measured checkout is
within scope; **a worktree is not** — work done in a worktree is outside the instrument's reach.

**Do the work on its merits.** Do not shape it around anything else.

---

## 4. Production state

The substrate is live at `www.sagereasoning.com`.

**Changed recently:** W2 merged and deployed **dark** (`SUBSTRATE_ENFORCEMENT_RECORD_ENABLED` unset
everywhere); the `agent_trust_events.event_type` CHECK widened 21→22 on TEST and production; the D1
R18 paragraph on three public surfaces; the O-1 and O-2 observability work; the Option S measurement
published on the three R18 surfaces (founder-signed).

**Unchanged:** the R20a perimeter and its ordering arc (closed); D4 (live, took-effect-proven); the
row-cap arc; the provenance ledger (C3 soak to ~2026-11-24); the verdict-variance disclosure; the
public assessment contract (the `api-docs` rewrite remains open).

**A repo session cannot verify Vercel environment values, Supabase state, or whether `origin/main`'s
newest commits have finished deploying. Mark those unverified rather than restating them.**

---

## 5. Re-derive at your own open — run, never quote

| What | How |
|---|---|
| Byte-identity guard | **run** `npx tsx website/src/app/logos/__tests__/human-practitioner-boundary.test.ts` |
| The three SHA pins | `shasum -a 256` on `layer2-mechanisms.ts`, `stoic-brain.ts`, `intervention-engine.ts` |
| R20a perimeter | count `HUMAN_FACING_POST_ROUTES` + `SUBSTRATE_GATE_ROUTES` **from the array bodies** |
| Agent-card extensions | `len(d['capabilities']['extensions'])` from the file |
| Process rules | enumerate the `### PRn` headings |
| Crons | count them in `vercel.json` |
| The record buffer | parse `~/.sage-gate1/false-hold-record.jsonl` record-by-record; note its size and `caller_class` distribution. **Read only — never write to `~/.sage-gate1/`, and never "refresh" the buffer: it is append-only and is never truncated.** **Two parsing traps:** "record N" is **1-indexed**; and `GUARD-OUTAGE` lines in `gate1.log` carry **no `tool=` field**. **The log token is lossier than the buffer — for caution grade the buffer is authoritative.** |
| `git status` / peers | whole; `ListAgents` |

**Any report run is `--dry-run` ONLY.**

---

## 6. Constraints that bind every sitting in this window

1. **Nothing that perturbs `/api/reason` or `/api/guardrail` may run** while the window is running —
   including anything sharing their rate-limit buckets.
2. **The byte-identity guard is ARMED.** It binds on uncommitted working-tree lines, so it is **dormant
   on a merge commit and on a commit made from GitHub Desktop**. Only the unconditional SHA pins run
   there. **The per-commit founder waiver is the real gate, not the guard.**
3. **Concurrency:** work **one arc** — do not run this alongside unrelated open sessions, and note the peer count at open. Path-scoped commits only (`git commit -F <msgfile> -- <paths>`, never `-m`);
   `git status` whole before every commit; **never stage another session's files**; a peer's push
   publishes your commits, so the commit is the point of no return.
4. **Tool mode has a consequence for the record** — a Bash-authored session and a Write/Edit-authored
   one leave different records. **Choose on the task's merits and disclose which you used. Never choose
   because of the record.**
5. **No accreditation write may rest on this window's evidence** — forbidden by standing ruling.
6. **Route, do not resolve:** a governed surface, a settled constraint, a `GUARD_RE` file, or a
   decision that is the founder's or the mentor's — stop, write the close, and name it.

---

## 7. Working inside the dogfooded harness

The harness frames each session and consults at action points. **The at-action false positive is the
measured class, not a malfunction** — an examination reading an ordinary edit as contrary to
appropriate action is the instrument doing its job, not a fault to work around.

**When the harness asks you an elicitation question, answer it genuinely.** Do not answer it the way
you think it wants to be answered.

Client `2.1.260`, entrypoint `claude-desktop`; re-derive the rest at your own open.

---

## 8. Now state the task

**Everything above is preamble. Wait for the task.**

---

*End of the W2 session opener — Version 2026-09-14. Every number in it is a claim to re-derive.*
