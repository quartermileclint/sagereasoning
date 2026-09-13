# SESSION PASTE — Standing-runner design sitting R11: the R8-D7 sampling policy as amended, and the live-loop measurement design

**Paste this as the FIRST message of a FRESH session on the main checkout of
`/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning`. Not a worktree.**

Authored 2026-09-13 (from `date`) at the founder's direction. **Every number in this file is a claim
to re-derive, not a fact to quote.**

---

## 0. Open under the standard protocol

Open under `operations/handoffs/founder/STANDING-SESSION-OPENER-grounded-foundations.md` (Version
2026-09-13; treat it as the most grounded statement of state; re-derive its numbers at your open per
its Part E). Then this.

**Tier: `governance` / design documents. AC7 NOT engaged.** This sitting designs; it builds nothing.

**House tool-mode setting for this sitting (founder-visible, deliberate):** author every document
with the **Write and Edit tools**, on the main checkout. Use Bash only to run read-only checks and to
commit. Do not use Bash heredocs to write documents.

**Absolute constraints — any one breached means stop and write the close:**
- **No code, schema, flag, credential, migration, deploy, or push.** Path-scoped commits only;
  pushing is the founder's.
- **No `GUARD_RE` file may be modified.** Re-read the regex in
  `website/src/app/logos/__tests__/human-practitioner-boundary.test.ts`. No waiver exists for this
  sitting.
- **No R18 public surface may be changed.** Stage wording only, if the design calls for it.
- **No mentor relay may be SENT.** Draft questions only.
- **Do not open `operations/agent-circles-2026-08/option-s/option-s-runner.py`** or anything under
  `option-s/`. A named defect in that instrument is reserved to a session briefed on it alone.
- **Never write to any file under `~/.sage-gate1/` or to `agent_hold_observations`.**
- **Never stage another session's files.** `git status` whole before every commit.

**Re-derive at open, run not quoted:** `git status`; `git fetch origin && git log --oneline
origin/main..HEAD`; the three SHA pins; the guard battery **run**; `ListAgents`.

---

## 1. The work — read set (stay within it)

Read, in this order, and cite from these rather than from summaries:

1. `operations/agent-circles-2026-08/2026-08-30-standing-runner-design-R8.md` §4.9, §5.3, §5.4, §7 #5,
   §11, §12 — R8-D7's own text.
2. `operations/agent-circles-2026-08/2026-09-04-standing-runner-design-R9.md` §11 (R9-D10), §16.
3. `operations/agent-circles-2026-08/2026-09-13-mentor-rulings-option-s-result-and-F-R1-verbatim.md`
   (all five exchanges — the M/W/S election, W elected as doctrine) and
   `2026-09-13-M-W-S-ELECTION-DOCUMENT.md`.
4. `operations/agent-circles-2026-08/2026-09-13-R8-D7-sampling-policy-SCOPING-DRAFT.md` — the scoping
   this sitting designs against. Its §5 Q1, Q4, Q6 and Q7 are **answered by the four rulings quoted
   in §2 below**; its Q2, Q3, Q5, Q8 remain open and are yours to carry or to draft for the mentor.
5. `website/public/llms.txt` — the "What 'deterministic' scopes to" paragraph (~line 434) and the
   trust-record "verdict determinism" item (~lines 850–894): the disclosure as published.
6. `manifest.md` §"The Prerequisite Criterion" (~line 295) — binding; apply it explicitly to every
   practitioner-facing output the design proposes.
7. `operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md` §"Named inputs held for not-yet-opened
   sessions" — the standing-runner rows and their R8/R9/R10 dispositions.

---

## 2. The four rulings this sitting designs under (verbatim, binding — quoted so you need not go looking)

> **Q-M5 — Does R8-D7's scope survive the election under W?** The scope requires amendment. It does
> not survive unchanged. Under worst-of-K, a resampled rejection cannot recover — any floor among K
> draws blocks. R8's symmetric fixpoint, in which rejections can recover and winners can be
> dethroned, was designed for a policy where the operative verdict is a function of the distribution
> of draws. Under W, the operative verdict is the worst draw. A rejection that produces one floor in
> K draws is blocked regardless of the other K-1 draws. The recovery path is closed by construction.
> The amended scope: R8-D7 applies worst-of-K to the would-be winner population only. A rejection that
> has already blocked does not enter the sampling layer — it is already blocked. The sampling layer's
> purpose under W is to catch winners that carry a latent floor the single-draw verdict missed. The
> scope is therefore: K-sampling of inputs that would otherwise permit, with any floor among K draws
> blocking. The re-election fixpoint for rejections is removed. The dethronement path for winners
> remains.

> **Q-M6 — Does W oblige K greater than 1?** K is a cost election for the founder. W does not impose a
> doctrinal minimum above K=1. K=1 is worst-of-one. Under W, a single draw that floors blocks. A single
> draw that does not floor permits. K=1 is fully consistent with the elected doctrine — it is W at its
> minimal expression. The doctrinal commitment is to the worst-draw rule, not to a specific K.
> Increasing K increases the probability of catching a latent floor at the cost of additional calls.
> That is a cost-benefit election, not a doctrinal one. The practical implication: "no sampling,
> disclosure carried" is W at K=1. It is not a rejection of W. It is the cheapest implementation of W,
> with the disclosure that a single draw was taken and any floor would have blocked.

> **Q-M7 — Measure first on the live loop before any worst-of-K policy lands?** Yes. R8 §7 #5's
> telemetry-first discipline applies. The closed run measured 24 inputs from a specific population —
> guardrail rejections and winners from a closed period, under the older engine, on one endpoint. The
> four limits ride every figure from that run. A worst-of-K policy designed against that population
> and deployed to the live loop is a policy designed against a population that may not represent the
> live loop's candidate stream. The discipline is: measure on the live loop before designing the
> policy's parameters. This does not mean the election is reopened — W is elected as doctrine and that
> ruling stands. It means K and any trigger conditions should be designed against live-loop telemetry,
> not against the closed run's population. Option E — measure first on the live loop — is the
> recommended next act before any R8-D7 build proceeds beyond K=1 disclosure.

> **Q-M8 — R18 boundary for a sampled verdict.** A sampled verdict under W must disclose: that K draws
> were taken, how many produced a floor, and that the worst-draw rule was applied. It must not carry
> a confidence scalar — the prohibition on confidence scalars in the live R18 disclosure applies to
> sampled verdicts as it applies to single-draw verdicts. The published sentence "treat one call as
> one draw" requires amending to reflect that under W, K calls are taken and the worst draw is
> operative. The amendment should state the rule plainly: K draws are taken; any floor among K draws
> blocks; the operative verdict is the worst draw. The number of draws and the number of floors are
> disclosed alongside the verdict. No confidence scalar is derived from the draw distribution. The R18
> update requires founder sign-off on three live public surfaces. This ruling does not pre-empt that.
> It states what the update must and must not claim.

(Source: `operations/trust-layer-2026-07/2026-09-13-mentor-ruling-eight-questions-w2-work-s11d2-sequencing-r8d7-under-w-verbatim.md`,
Q-M5–Q-M8. Those four are the parts of that file that bear on this sitting.)

---

## 3. Deliverable A — the live-loop measurement design (Option E)

Write **`operations/agent-circles-2026-08/2026-09-13-R11-live-loop-verdict-measurement-DESIGN.md`**.

A design for measuring per-input verdict variance **on the live loop's candidate stream**, so that K
and any trigger conditions can be designed against live telemetry rather than the closed run. From
the sources, decide and justify: the population (which live candidates, at what point in the cycle,
and why that is the population Q-M5's amended scope is about — inputs that would otherwise permit);
K per input and the cost at the gate's price (re-derive the price from CI-10's metering or from the
Option S run, and say which); the credential shape (a dedicated measurement credential, distinct
identity — cite the Q1c distinct-identities ruling); what is recorded per draw (verdict, proximity,
floor attribution, engine outage) and where (design the store; name it as a founder-walked migration
if one is needed; do not build it); what the report prints (per-input distributions first, never a
directional decomposition — cite the D6a rulings); every limit that rides its figures (the four from
Option S, plus any this design adds); and what the design deliberately does not do (it changes no gate
behaviour; the first verdict stays operative; it is pure measurement — the Option S posture). Apply
the Prerequisite Criterion explicitly. **A founder-walked run is its own later step; nothing here
runs it.**

## 4. Deliverable B — R8-D7 as amended: the policy design with its parameters left open

Write **`operations/agent-circles-2026-08/2026-09-13-R11-R8D7-worst-of-K-policy-DESIGN.md`**.

The policy at the contract level, under the amended scope: what enters the sampling layer (would-be
winners only — define "would-be winner" against the runner's election as R8/R9 describe it, and say
what the removal of the rejection fixpoint does to R8 §5.3's iteration semantics and cost bound);
the rule (worst of K; any floor blocks; dethronement path retained); the disclosure a sampled
verdict carries (Q-M8's list, nothing more — no scalar); what persists (all K draws and floor
attributions, `verdict_basis: worst_of_K`); **K and any trigger condition left explicitly OPEN, to be
set from Deliverable A's data — state that K=1 with disclosure is the live state today and is W**;
the R9-D10 precision (the recorded verdict is what flows on the existing backward edge) restated for
the amended scope; the Prerequisite Criterion applied to the recorded verdict; and the R18 wording
**staged, not applied** — the amended "one call as one draw" sentence per Q-M8, marked as applying
only when K>1 is ever served. **No build proposed; no file under `website/` touched.**

## 5. Deliverable C (optional, if time allows) — the manifest ATRF item-3 amendment draft

R9 §16.5 named it: a `governance` draft for ruling that removes the outcome-comparison reading
(*"how the outcome compared to the proposal"*) that ruling C4 read down. Draft it as
`operations/agent-circles-2026-08/2026-09-13-R11-manifest-ATRF-item3-amendment-DRAFT-FOR-RULING.md`,
citing C4 verbatim from the 2026-09-04 governing-brief record. **Do not edit `manifest.md`.**

---

## 6. PR19 — two blind Sonnet reviewers (the founder's standing permission), read-only

- **Reviewer A — Deliverable A** against the Option S verbatims, the D6a rulings and the Prerequisite
  Criterion: fidelity and overclaim (any sentence that reads as a run, a build, or as closing the
  published near-boundary gap is a finding).
- **Reviewer B — Deliverable B** against R8 §5.3/§4.9, R9-D10, the election, and Q-M5–Q-M8 as quoted:
  fidelity to the amended scope; any parameter set rather than left open; any confidence scalar; any
  build language.
Give each reviewer only its own deliverable and the source paths. Fold every upheld finding at the
root; verify first-hand before folding; disclose each fold and what each reviewer was not given.

## 7. Close, records, commit

1. Close: `operations/handoffs/founder/2026-09-13-standing-runner-R11-CLOSE.md` — what was designed,
   what was left open and why, the mentor questions drafted (not sent), the founder's next steps,
   guard + three pins at close.
2. Decision-log entry at the **physical tail** (`## 2026-09-1x — D-…`).
3. A row on the priority index's named-inputs table only if a named input was consumed or redirected.
4. **Commit path-scoped:** `git add <your new files>`; `git commit -F <msgfile> -- <every path you
   touched>`; then `git show --stat HEAD`. `-F`, never `-m`. **NEVER push.**
5. Re-run the guard battery and the three pins at close.

## 8. If you hit a conflict

Route it; do not resolve it. A governed surface, a settled constraint, a `GUARD_RE` file, a decision
that is the founder's or the mentor's — stop, write the close, name it.

**D2 remains blocked. The S11 flip remains REFUSED. Weights remain BLOCKED. The 0h call remains the
founder's.**
