# Leg D v6 (bare prompt, FULL hook set) — Invocation Footprint

**Run:** 2026-06-22, bare/neutral prompt (no practice instructions) re-run with the **full hook set live** (sage-on: H1 frame + H3 at-action + H4 close), session `1f0f4176-c713-40dc-bcb4-fcfda0049433`, wall-clock 6 min 34 s.
**Assessed by:** hub (this session), from `/tmp/sage-gate1/gate1.log` + the session's state files + the run's `metrics.md`/`memo.md`.
**Why this run matters:** it is the complement to `leg-d-v6-bare/` (the earlier bare run with **H1/H2 only**, which framed and nothing else). This run answers: *with H3+H4 also installed, does the environment now invoke the full practice loop on a bare, uninstructed agent?*

---

## The headline: yes — the installed environment invoked the practice at every loop stage, automatically

The agent's own action log (`metrics.md`) shows it made **zero practice calls** — `date`, read the two scenario files, `ls`/`wc` metadata, one `AskUserQuestion`, wrote `memo.md` + `metrics.md`. No `curl`, no `/api/reason`, no `/api/guardrail`, no `/api/accreditation`, no `/api/practice/reflect`. Identical to the H1/H2-only bare run on that axis.

Yet `gate1.log` (session `1f0f4176`) shows the **hooks** fired the whole loop:

| Stage | Hook | Evidence (`gate1.log` / state) | Count |
|---|---|---|---|
| Pre-decision frame | **H1** `UserPromptSubmit` | `07:42:24 FRAMED … proximity=deliberate` (14 s before the agent's first action) | 1 |
| At-action consult + loop-closure | **H3** `PreToolUse` | `07:42:38 CONSULT tool=Bash loop=opened` → `07:47:01 CONSULT tool=Bash loop=reopened carried-prior=yes` → `07:49:08 CONSULT tool=Write … carried-prior=yes` → `07:49:51 CONSULT tool=Write … carried-prior=yes` | 4 |
| Reflect-at-close | **H4** `Stop` | `07:50:10 CLOSE … mode=block` (reflect invitation fired) | 1 |
| (persist) | **H4** | `07:51:07 CLOSE-PERSIST persist=disabled` | 1 |
| Subagent frame | H2 | — (no subagent spawned) | 0 |
| Fail-open / outage | — | **0 UNFRAMED** — every hook call succeeded | 0 |

**This closes the bare-into-harness gap.** With H1/H2 only, the environment invoked *only the frame* and an uninstructed agent self-invoked nothing (`leg-d-v6-bare/`). Adding **H3 + H4** makes the environment invoke **frame → mid-task consults (with loop-closure) → reflect-at-close** deterministically, on the *same bare prompt*, with the agent still doing nothing itself. This is the direct, evidenced answer to "how do we get them to invoke it": **the hooks do it; no instruction to the agent is required.**

---

## The honest nuances (what fired vs what bound)

1. **The agent self-invoked nothing — by design.** All invocation is the hooks (environment). The agent received the injected frame + consult-context but never called anything itself. Correct: the 3-hook architecture puts the invocation in the control flow, not the agent's discretion.

2. **Over-fire (ADR D-A), observed live.** H3 fired a consult before **`date`** (07:42:38) and before metadata `Bash` (07:47:01) — trivial, non-decision actions. The consequential-tool matcher fires on tool *patterns* (`Bash`/`Write`), not genuine decisions, so it consulted before a timestamp command and before the metrics-file write. 4 consults landed on 2 `Bash` + 2 `Write` ops. **Validates the D-A concern** — the consult matcher needs narrowing/dedup to approximate "stake," or it consults on housekeeping.

3. **Loop-closure fired and tracked honestly — but never closed.** `1f0f4176.loop.json`: `openLoop` (1, still open at end), **`closedRefs: []` (zero closed)**, `abandonedRefs: [3]`. The loop opened, **reopened 3× carrying `prior_feedback` at the same depth** (the D-B machinery works), but the agent **kept acting without the re-examination ever clearing** — so loops were marked *abandoned*, not *closed*. This is the channel-law in evidence: the agent **discounts the advisory consult frames** (they're injected context, not enforcement) and proceeds. The instrumentation is faithful; the advisory does not *bind* a capable agent.

4. **Accreditation: `no-provenance` → wrote nothing (honest, R18f).** `close-1f0f4176….closed`: `accred=no-provenance mode=block`. The close hook attests only if signed assessments accumulated *and* a non-marker `SAGE_GATE1_ACCRED_CREDENTIAL` is set (`close-hook.mjs:133` — "no examination accumulated ⇒ nothing to attest"). Neither held: no provenance accumulated (the loops abandoned, never closed) and **no `SAGE_GATE1_ACCRED_CREDENTIAL` was in the env** (only `SAGE_GATE1_CREDENTIAL`/endpoint/state-dir/depth). So the harness **honestly wrote nothing** rather than fabricate an accreditation — correct KG1/R18 behaviour, but it means **no trust-layer artifact was produced.**

5. **Reflect: invited, not persisted.** `close-…reflected`: `persist=disabled` (`SAGE_GATE1_REFLECT_PERSIST_ENABLED` unset — dark by default). The in-conversation reflect invitation fired (`mode=block`) but nothing egressed and the agent's `metrics.md` shows no reflect Q&A — consistent with the channel-law finding that a capable agent treats the forced reflect as injected scope-expansion.

6. **No `raw/` in the run dir.** The bare prompt asked only for `memo.md` + `metrics.md`; it did not instruct the agent to save calls (and the agent made none). The consults that *did* fire are the **hooks'** server-side calls (billed to the `@v6`-class consult credential) — they exist on the server + as the hook's `.decision` state, but were not captured as run artifacts.

---

## One-line reading

**The full hook set delivers the invocation (frame + consults + loop-tracking + reflect-invite fire automatically on a bare agent) — but on the advisory channel the agent discounts the mid-task consults (loops abandoned, never closed), so no provenance accumulates, so the accreditation honestly writes nothing.** Invocation: solved. Binding + materialised artifacts: not on this (advisory, bare, persist-dark) configuration. See `assessment.md` for the memo + distinctive-value + comparison verdict.
