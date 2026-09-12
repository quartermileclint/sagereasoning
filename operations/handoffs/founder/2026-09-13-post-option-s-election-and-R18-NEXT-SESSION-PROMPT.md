# NEXT SESSION PROMPT — after Option S: the M/W/S election, the R18 update, and one reserved defect

**Paste into a fresh session. Tier: `governance`** unless the founder elects the R18 application,
which is `code-elevated` + an R18 sign-off. **No spend is authorised by this prompt.**

**Written 2026-09-13** at the close of the session that ran Option S. HEAD at writing: `50fd196`.

---

## 0. Open

1. `/adopted/standing-protocol-cache.md`; `/CLAUDE.md` (the newest dated block first).
2. **The binding record for everything below:**
   `operations/agent-circles-2026-08/2026-09-13-mentor-rulings-option-s-result-and-F-R1-verbatim.md`
   — **read it in full before acting on any figure.** Verbatim wins over this prompt.
3. `ListAgents` at open; `git status` at open and before every staging; commits path-scoped.
4. **⚠ The false-hold observation window is RUNNING and the byte-identity guard is ARMED.** No file
   matching `GUARD_RE` (`layer2-mechanisms|stoic-brain|api/reason|api/guardrail|trust-core|
   kathekon-engagement|false-hold|harness/gate1|…`) may sit modified in the working tree. The
   pre-commit battery enforces this (250/0 at last commit).
5. **Do not re-derive any count from this prompt.** Read it from source.

---

## 1. State — Option S is DONE

**It ran 2026-09-12: 240 calls, 24/24 series, ~$3.40, zero failures.** Six questions ruled
2026-09-13. **The gate condition is DISCHARGED.**

| stratum | inputs | draws | floors | rate | Wilson 95% |
|---|---|---|---|---|---|
| **guardrail rejections — OPERATIVE** | 9 | 84 | 45 | **0.5357** | [0.430, 0.638] |
| winners | 15 | 144 | 0 | 0.0000 | [0.000, 0.026] |
| pooled — **disclosed, NOT the election's input** | 24 | 228 | 45 | 0.1974 | [0.151, 0.254] |

**Limits that ride every figure** (ruled, not optional): the sample is not representative of a future
candidate stream; the strata were selected on the variable being measured; variance is multi-channel;
the texts were produced under the older engine though today's engine examined them; and **two inputs
rest on 4 verdicts rather than 10** (six `engine_unavailable` each) — the instrument discloses this
itself, computed, in `thin_series_disclosure`.

**Regenerate the figures rather than quoting them:**
```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/operations/agent-circles-2026-08/option-s" && python3 option-s-runner.py summary runs
```

---

## 2. The main event — the M/W/S election (founder + mentor; NOT the session's to decide)

**It proceeds.** So does R8-D7's verdict-confidence sampling policy, on the same discharge.

**The election's entire practical content is two inputs.** 21 of 24 are deterministic, where M, W
and S coincide **by construction**. On **c6** and **c9** — each blocked on 1 of 10 draws — **W blocks
both; M and S permit both.**

**The question, as the mentor stated it for direct use:**

> *"When the engine returns a block verdict on 1 of 10 draws on an input that is otherwise permitted,
> does the project prefer a policy that blocks on any adverse draw (W), or one that blocks only when
> a majority of draws are adverse (M/S)?"*

**Ruled framing, binding:** this is **doctrine, not statistics** — *"a values judgement about what a
floor is for — whether it is a ceiling on permitted risk … or a majority signal about the input's
character."* **The doctrinal question does not need a larger n. The empirical fraction (3/24 =
0.125 [0.043, 0.310]) is carried as DIRECTIONAL CONTEXT, not as the election's basis.**

**What this session may do:** prepare the election document — the two inputs' actual texts, their
distributions, what each policy would have done, and the limits. **It may not make the election**, and
must not recommend between M, W and S: R8 reserved that as doctrine.

---

## 3. The R18 update (founder sign-off required; three live public surfaces)

**Ruled what it may and may not claim.**

**MUST NOT:** publish **0.536** against the live disclosure's *"no rate has been measured on
near-boundary inputs as a defined population"* sentence. **The gap is NOT closed.** Of the 9
rejections, 4 are stably blocked and 2 stably permitted; only 3 sit near a boundary behaviourally.
Publishing it would substitute a **provenance** category (rejected in August) for a **behavioural**
one (near the boundary today) — the exact error that disclosure's two-population split exists to
prevent.

**MAY:** disclose that a **24-input measurement on real candidate texts** now exists, with strata and
per-input distributions, and — ruled *"the measurement's most useful contribution"* — that the
**winner stratum showed zero boundary crossings in 144 draws while 10 of 15 winners varied on
proximity.** That is a clean empirical confirmation of the proximity-versus-decision distinction the
disclosure already draws with its benign control: **the proximity score moves; the block-or-permit
decision does not.**

**Draft it; do not apply it without founder sign-off.** Surfaces: `website/public/llms.txt`,
`website/public/.well-known/agent-card.json`, `website/src/app/api-docs/page.tsx`.

---

## 4. ⚠ A RESERVED DEFECT — and reading §1 of this prompt may disqualify you from fixing it

A named defect is carried in the instrument as `NAMED_DEFECT_series_completeness`:
**`complete_series()` counts RECORDS against `intended_k`, not COUNTED OUTCOMES**, so a series in
which most calls failed registers as a complete measurement — and, under the earliest-is-operative
selection rule, **beats any later series run to repair it.** The defect is **general**: any
outage-riddled series blocks its own repair. The correct fix is to count counted outcomes.

**It was deliberately NOT fixed by the session that found it**, and the mentor ruled the reason
binding: that session **knew which input the change would affect and which way it would cut**, which
is the post-hoc move the D6a class-freeze discipline forbids.

**RULED: the fix is reserved to a session that does not know which input it affects.**

**Consequence for you.** If you have read §1 above, or the verbatim record, or the run data, **you
know.** You are then in the same position as the session that declined it, and **you should not make
the fix either.** Routing around that because the fix is obvious is precisely the failure the
reservation exists to prevent.

**How to actually discharge it:** the founder briefs a session on the defect **alone** — the
`complete_series()` semantics and nothing about Option S's results, strata or inputs. That session
makes the fix on its general merits. **Do not fold it into this session's work.**

---

## 5. Founder items

- **F-R2 — the credential.** `sagereasoning:option-s@v1`, live, ~520 quota units unused. **Ruled:
  keep until the election concludes, then revoke immediately** — *"every day it exists beyond that
  point is exposure with no benefit."* Revoke via the mint CLI `revoke practice --id <uuid>`.
- **The election itself** — §2. The mentor has framed it; the answer is the founder's.
- **The R18 sign-off** — §3.

---

## 6. What this session does NOT do

Does not re-run Option S or spend anything (the instrument will refuse without the credential file,
and the confirmation gate fails closed without a tty and `--yes`). Does not make the M/W/S election or
recommend between M, W and S. Does not apply an R18 change without sign-off. Does not fix
`complete_series()` (§4). Does not touch any file matching the byte-identity `GUARD_RE`. Does not
quote a count from this prompt without re-deriving it.

## 7. Verification

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning" && git log --oneline -3 && python3 operations/agent-circles-2026-08/option-s/option-s-runner-test.py 2>&1 | tail -2
```
Expect `50fd196` at or near the top, and **45 passed, 0 failed**.

*The election is the founder's and the mentor's. Everything else here is preparation for it.*
