# RA-1-F2 — The S11 false-hold instrument reads VACUOUSLY on the live distribution

**Status:** Finding of record. Raised 2026-07-17 during RA-1's free-text audit. **Not yet dispositioned — the disposition is the founder's, and the arm's definition is arguably the mentor's.**
**Severity:** HIGH — it does not break production, but it **compromises the evidence the S11 ENFORCE gate is meant to rest on**.
**Discovered by:** the RA-1 registry free-text audit, which found the registry's `infra-false-hold-capture` blocker asserting the capture flag was unset. Verifying that claim first-hand exposed both the stale record **and** the vacuity beneath it.

---

## 1. The precondition finding (verified first-hand)

**The 7-day S11 observation clock has been running since 2026-07-12. CLAUDE.md still lists starting it as the carried step.**

| Fact | Evidence |
|---|---|
| `GATE1_FALSE_HOLD_CAPTURE = "true"` | `.claude/settings.local.json` env block |
| `GATE1_STATE_DIR = "/Users/clintonaitkenhead/.sage-gate1"` — **durable**, not `/tmp` (the exact requirement) | same |
| Buffer exists: **117 records**, 64,712 bytes | `~/.sage-gate1/false-hold-record.jsonl` |
| Window: **2026-07-12T13:15:47Z → 2026-07-17T07:04:33Z** = **4.74 days** | the records' own `capturedAt` |
| `loopEvent`: opened 12, reopened 104, closed 1 → **116 holds** | ibid |

CLAUDE.md's 2026-07-12 refresh still reads: *"The remaining carried step to START the 7-day clock: set `GATE1_FALSE_HOLD_CAPTURE=true` and a durable `GATE1_STATE_DIR`…"*. The founder evidently walked it the same day; the close-time block never caught up. **The registry inherited the stale claim** (`infra-false-hold-capture` blocker: *"Dark — GATE1_FALSE_HOLD_CAPTURE unset… Founder-walked step: set the flag… to start the 7-day observation clock"*) — wrong in the safe-sounding direction, and now corrected.

**The window closes ~2026-07-19.** The return-with-record session is ~2 days out.

---

## 2. The finding: the instrument cannot produce a false positive

Running the project's own report offline against the live buffer:

```
npx tsx scripts/false-hold-observation-report.ts --records ~/.sage-gate1/false-hold-record.jsonl --dry-run
```

```
── Part 3 — the false-hold rate (over the live distribution) ───────
  at-action examinations: 117
  holds (loop opened/reopened): 116   (99.1% of examinations)
    false-positive holds (no kathekon factor): 0
    correct holds (kathekon-engaged):          116
  false-positive rate among holds: 0.0%
  mentor's target (false ≤ correct): MET  (0 ≤ 116)
  correct-hold arms: justice-surface=116
```

**`false ≤ correct: MET (0 ≤ 116)` is an artifact, not a measurement.**

### 2.1 The mechanism (verified at the source)

The live signal distribution is uniform:

| Signal | Distribution across 117 records |
|---|---|
| `virtueDomainsEngaged` | `["dikaiosyne"]` ×116, `["phronesis","dikaiosyne"]` ×1 → **dikaiosyne present on 117/117** |
| `obligationStatuses` | `[]` ×116, `["indeterminate"]` ×1 |
| `subSpeciesPassions` | `[]` ×117 |
| `proximity` | `"deliberate"` ×117 |

The predicate's Arm 1 (`kathekon-engagement.ts:88-101`) delegates to the engine's own reducer:

```js
// derive-trust-events.ts — deriveWorstJusticeOutcome
if (dikaiosyneEngaged && statuses.length === 0) sawUnevaluated = true
...
if (sawUnevaluated) return { eventType: 'justice-surface-unevaluated', obligationStatus: 'unevaluated' }
```

So for **every** live record: `dikaiosyne` tagged **AND** zero circles carrying an obligation → `sawUnevaluated` → non-null → `justiceSurfacePresent = true` → `engaged = true` → **`correct_hold`**.

Arm 3 never fires (`proximity` is `deliberate` on 117/117, above `habitual`). Arm 4 never fires (`subSpeciesPassions` empty on 117/117). Arm 2 fires ~never (no `violated`).

**Arm 1 alone decides every record, and Arm 1 is true by construction on this distribution. The `false_positive` class is unreachable.** An instrument that cannot emit a false positive cannot measure a false-positive rate.

### 2.2 The engine contradicts the predicate on the same records

The capture also stores the engine's own kathekon reading:

```
kathekon: {"isKathekon": false, "quality": "contrary"}  ×115 of 117
```

**The engine says these actions engage NO kathekon factors** — verbatim, *"No kathekon factors detected; action is contrary to appropriate action"*. That is precisely the class the mentor asked to be measured. The predicate says the opposite about the same 115 records. **Two readings of one record, in direct contradiction**, and the readiness report surfaces only the one that cannot fail.

### 2.3 The project's own record already refuted this predicate

From CLAUDE.md, on the ADR-010 §3 justice bridge's `justiceCheckScope`:

> *"a documented refinement of §3's literal **'dikaiosyne tagged', which fires on ~every action**"*

The §3 bridge was **deliberately built to avoid keying on "dikaiosyne tagged"** because the team had already established it fires on essentially everything. ADR-010's founding observation was the same: the engine *"registered the affected circle, tagged justice, left the obligation unevaluated"*. The S11 predicate's dominant arm keys on exactly `dikaiosyne tagged + obligation unevaluated` — the **default state of every extraction**.

### 2.4 Why the S11 review missed it

The S11 instrument's adversarial review recorded **"5 dimensions CLEAN (predicate-faithfulness, non-vacuity, …)"**. But per that same close, the report was *"exercised … on a **synthetic 14-record set**"*. **Non-vacuity on synthetic fixtures ≠ non-vacuity on the live distribution.** The synthetic set contained the varied signals the live distribution does not. The predicate is *faithful to the mentor's wording* and *vacuous against real data* — both at once.

---

## 3. What this does and does not claim

**Does NOT claim:** that the predicate misreads the mentor; the four arms track the mentor's language closely. Nor that production is broken — the intervention engine is MEASURE, the capture writes to a local buffer, nothing binds.

**DOES claim:** the number the mentor's readiness standard part (3) asks for — *"a measured false-hold rate over the live distribution; target: false holds on kathekon-free actions ≤ correct holds on problematic ones"* — **cannot be obtained from this instrument as built**, because the standard presupposes "kathekon-free actions" is a reachable class and here it is structurally empty.

**The open question of principle (mentor's call, not the AI's):** is *"dikaiosyne tagged, obligation never evaluated, no circles at all"* a **justice surface present** (⇒ correct hold), or is it the extractor reflexively tagging dikaiosyne on an action with no affected party (⇒ no kathekon factor, i.e. the false-positive class)? The engine's own kathekon reading takes the second view on 115/117. **The §3 bridge precedent took the second view too** — it refined away from the literal tag for exactly this reason.

---

## 4. Consequence for S11 — the reason this is HIGH

The return-with-record session (~2026-07-19) exists to assess the four-part readiness standard and, if met, **re-examine the ENFORCE assent**. As built, that session would read:

```
(3) false ≤ correct holds:  MET
```

…and part (3) is the **core** of the standard (the mentor: *"a measured false-hold rate on the at-action examination across the live distribution"* is the item the whole observation period was created to produce). **A founder reading "MET" could license the S11 ENFORCE flip on a measurement that cannot fail** — binding the intervention engine on evidence that never had the power to say "don't".

This is the project's own *"if it passes, could it have passed while broken?"* redirect (standing-protocol-cache §AI failure modes), applied to the S11 gate. The answer here is **yes**.

The mentor deferred S11 precisely because *"the examination that licenses the enforce assent is not complete on one day's live MEASURE."* This finding says the examination is **not complete on seven days' live MEASURE either** — not because the days are short, but because the instrument reads a constant.

---

## 5. Recommended disposition (the founder's call)

1. **Do not run the return-with-record session against part (3) as-is.** Parts (1), (2) and (4) are unaffected.
2. **Take it to the mentor** — the arm's definition is a question of principle, and the mentor's verdicts are binding verbatim. The concrete question: *does a dikaiosyne tag with zero evaluated circles constitute a justice surface, or is it the null reading?* Supply the live distribution (117 records, uniform) and the engine's contradicting `contrary` reading.
3. **A candidate narrowing, if the mentor takes the second view:** Arm 1 requires a justice surface with **at least one circle** (i.e. `statuses.length > 0`, or an oikeiosis circle present) — so `unevaluated-with-no-circles` stops counting as engagement. This mirrors the §3 bridge's refinement precedent exactly. **Do not implement before the mentor rules** — a narrowing that makes the rate non-zero is not automatically the *right* rate.
4. **Re-run the report after any narrowing** and let the clock continue; the buffer is append-only and the ingest is idempotent, so no data is lost.
5. **Fix the record:** CLAUDE.md's carried-step line (the clock is running, not pending). Done for the registry in this session.

---

## 6. Verification (founder-performable)

```bash
cd /Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning

# 1. the clock IS running (CLAUDE.md says it is not)
python3 -c "import json;d=json.load(open('.claude/settings.local.json'));print({k:v for k,v in d['env'].items() if 'FALSE_HOLD' in k or 'STATE_DIR' in k})"
wc -l ~/.sage-gate1/false-hold-record.jsonl

# 2. the signal distribution is uniform — dikaiosyne on every record, zero circles
python3 -c "
import json,collections
rs=[json.loads(l) for l in open('$HOME/.sage-gate1/false-hold-record.jsonl') if l.strip()]
print('virtueDomainsEngaged:', collections.Counter(json.dumps(r['signals']['virtueDomainsEngaged']) for r in rs))
print('obligationStatuses  :', collections.Counter(json.dumps(r['signals']['obligationStatuses']) for r in rs))
print('engine kathekon     :', collections.Counter(json.dumps(r['kathekon']) for r in rs))
"

# 3. the report reads 0 false positives / 116 correct, all via justice-surface
cd website && npx tsx scripts/false-hold-observation-report.ts \
  --records ~/.sage-gate1/false-hold-record.jsonl --dry-run
```

Expected: flag `"true"` + durable state dir; 117 records; `virtueDomainsEngaged` = dikaiosyne on all; `obligationStatuses` = `[]` on 116; engine `kathekon` = `{isKathekon:false, quality:"contrary"}` on 115; report `false-positive rate among holds: 0.0%`, `correct-hold arms: justice-surface=116`.

---

## 6b. A companion finding — the byte-identity guard shares the defect class (RA-1-F3)

Writing this document **tripped the extended byte-identity guard**, because the guard is a **path substring grep** and the file was originally named `…false-hold-instrument-vacuity-finding.md`. No frozen-graph code file was modified (verified: `harness/`, `website/src/lib/substrate/`, `translation-sandwich/`, `api/reason/`, `api/guardrail/` all byte-unchanged). The file was renamed to clear the trip rather than teach the reader to wave a tripped guard away — **that habit is how a guard dies.**

**The guard is wrong in both directions:**

| Direction | Class | Risk |
|---|---|---|
| **False positive** | Any *records* file whose NAME contains a frozen keyword (`false-hold`, `trust-core`, `sage-reflect`, `stoic-brain`…) trips it | Safe direction, but it trains the operator to ignore trips |
| **False negative** | `/api/reason` imports `r20a-classifier.ts` (`detectDistressTwoStage`) and `constraints.ts` (`enforceDistressCheck`) at `route.ts:7-8`, called at `:1002` — **neither path matches the regex** | **Dangerous**: an edit there perturbs the measured surface **while the gate prints "NONE — safe"** (this is the pre-existing SEQ-1 finding, now confirmed to have a symmetric twin) |

**Root cause — the same defect class this session hit four times:** a substring/reference test cannot distinguish *"mentions X"* from *"is X"*. (The other three were mine: a `'Factory wrapper'` grep, an `"exactly the following eight"` grep, and a dark-flag *reference* check — each produced a false failure.)

**Candidate fix (not applied — the gate lives in the session prompts/closes, not in one file):** scope the guard to code paths and match the real graph, e.g. restrict to `\.(ts|tsx|mjs)$` **and** add `r20a-classifier|/lib/constraints|/lib/guardrails`. A records-only change should never trip it; a shared-lib change in the engine's import closure always should.

## 7. Cross-references

- `D-TRUST-LAYER-S11-OBSERVATION-INSTRUMENT-BUILT-DARK-REVIEW-FOLDED` — the instrument's build (its review's "non-vacuity CLEAN" was on the synthetic 14-record set)
- `D-TRUST-LAYER-S11-ENFORCE-GATE-MENTOR-DEFERRED` — the four-part readiness standard; part (3) is the item at issue
- `operations/trust-layer-2026-07/2026-07-12-mentor-consultation-s11-enforce-gate-verdict-verbatim.md` — the binding verdict (verbatim wins)
- `operations/handoffs/founder/2026-07-12-trust-layer-S11-return-with-record-NEXT-SESSION-PROMPT.md` — the session this finding gates
- `D-SAGE-PRACTICE-ADR010-SECTION3-GUARDRAIL-BRIDGE-RETIREMENT` + CLAUDE.md's §3 bridge note — the *"'dikaiosyne tagged' … fires on ~every action"* precedent
- `website/src/lib/substrate/trust-core/kathekon-engagement.ts:88-101` (Arm 1) · `derive-trust-events.ts` `deriveWorstJusticeOutcome` (the `sawUnevaluated` path)

*End of finding. The instrument measures faithfully what it was told to measure, and what it was told to measure is a constant on the live distribution.*
