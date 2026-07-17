# Next-Session Prompt — RA-1-F2: the S11 false-hold instrument reads vacuously — MENTOR CONSULT

**Stream:** founder (trust-layer).
**Tier:** `governance` — documents + a mentor briefing only. **NO code / schema / flag / credential / ingest.**
**Governing frame:** `/adopted/standing-protocol-cache.md`, opened under `STANDING-SESSION-OPENER-grounded-foundations.md`.
**Predecessor close:** `operations/handoffs/founder/2026-07-17-registry-assessment-RA1-registry-refresh-CLOSE.md` (Addendum 2).
**Predecessor decision-log entries:** `D-REGISTRY-RA1-FREETEXT-AUDIT-AND-F2-INSTRUMENT-VACUITY-2026-07-17`.
**Finding of record (READ THIS FIRST, IN FULL):** `operations/trust-layer-2026-07/2026-07-17-RA1-F2-s11-observation-instrument-vacuity-finding.md`.
**Risk classification:** Standard under 0d-ii. Critical Change Protocol NOT engaged. AC7 not engaged. Window-safe.

---

## Why this session matters, and why it is first

The 7-day S11 observation window **closes ~2026-07-19**. When it does, the **return-with-record** session becomes eligible — the session that assesses the mentor's four-part readiness standard and, if met, **re-examines the ENFORCE assent** (binding the intervention engine; ADR-012's second rung; the single most consequential decision in the project).

**As built, that session would read part (3) — the core of the standard — as `MET`. That reading is an artifact.** The instrument cannot emit a false positive on the live distribution, so it cannot measure a false-hold *rate*. A founder could license the ENFORCE flip on a measurement that never had the power to say "don't".

This session does **not** fix that. The arm's definition is a **question of principle**, and the mentor's verdicts are **binding verbatim** (`D-TRUST-LAYER-S11-ENFORCE-GATE-MENTOR-DEFERRED`; the verbatim record wins over any AI restatement). **This session prepares the consult and holds.**

**The AI must not implement a narrowing this session.** A narrowing that makes the rate non-zero is not automatically the *right* rate — that is the exact "fix it so it passes" trap the finding warns about.

---

## Pre-conditions

1. The finding document is committed/available and read **in full** (~14KB). It carries the mechanism, the evidence, and the three founder-performable verification commands (§6).
2. **Do not run the ingest.** The buffer is append-only and the report has run `--dry-run` only. `false-hold-observation-report.ts` without `--dry-run` writes to `agent_hold_observations`. Ingesting now would store a structurally-zero rate.
3. The observation window may still be open ⇒ no frozen-graph edits; the **extended** byte-identity gate at push. **Note RA-1-F3:** the guard is a path substring grep — a records file *named* after a frozen concept (e.g. `false-hold`) trips it as a **false positive**. If it trips, verify against the code, do not wave it away.

## Part A — Open under the protocol

1. `/adopted/standing-protocol-cache.md` (~3 min)
2. The **finding** (above) — in full
3. `operations/trust-layer-2026-07/2026-07-12-mentor-consultation-s11-enforce-gate-verdict-verbatim.md` — **the binding verdict; verbatim wins**
4. The predecessor close's Addendum 2
5. `/operations/decision-log.md` last 2 entries

Confirm at open: tier; hold-point (P0 0h); model selection (**N/A — no LLM calls**, cache Element 6); status vocabulary; signals + risk class.

## Part B — Procedure

### Step 1 — Re-verify the finding first-hand (do NOT take it on trust)
Run the finding's §6 block. Expect: flag `"true"` + durable state dir; **117+** records (the buffer keeps growing — this session's own actions will be captured); `virtueDomainsEngaged` = dikaiosyne on **all**; `obligationStatuses` = `[]` on ~all; engine `kathekon` = `{isKathekon:false, quality:"contrary"}` on ~all; report `false-positive rate among holds: 0.0%`, `correct-hold arms: justice-surface=<n>`.

**If the distribution has drifted** (e.g. some records now carry circles), say so plainly — it strengthens rather than weakens the finding's core point, but it changes the numbers the mentor is given.

### Step 2 — Author the mentor briefing
A single document the founder can relay. It must be **short, verbatim-accurate, and non-leading** — the mentor is being asked a question of principle, not asked to ratify the AI's preferred answer.

It must carry:
- **The question, stated neutrally:** *Does a `dikaiosyne` tag with **zero evaluated circles** constitute "a justice surface present" (⇒ a correct hold), or is it the null reading — the extractor reflexively tagging dikaiosyne on an action with no affected party (⇒ no kathekon factor engaged, i.e. the false-positive class the standard measures)?*
- **The mentor's own words** that the predicate encodes (from the verbatim verdict: the four arms — justice surface / violated obligation / proximity ≤ habitual / sub-species passion; and part (3)'s target *"false holds on kathekon-free actions ≤ correct holds on problematic ones"*).
- **The live distribution** — uniform: dikaiosyne on 117/117, `obligationStatuses` `[]` on 116/117, `subSpeciesPassions` empty on 117/117, `proximity` `deliberate` on 117/117.
- **The engine's contradicting reading** — `isKathekon:false / "contrary"` on 115/117 ("No kathekon factors detected; action is contrary to appropriate action").
- **The consequence** — part (3) reads MET and cannot fail; the class it measures is structurally empty.
- **The precedent, presented as evidence not as argument** — the ADR-010 §3 bridge deliberately refined away from literal *"dikaiosyne tagged"* because it *"fires on ~every action"*; ADR-010's founding observation was the same shape (*"registered the affected circle, tagged justice, left the obligation unevaluated"*).
- **The honest disclosure that the AI has a candidate narrowing and is deliberately not implementing it** (Arm 1 requires ≥1 circle). Offer it as *one option among others*, explicitly flagged as the AI's, not the mentor's.
- **What is NOT claimed:** the predicate is faithful to the mentor's wording; production is not broken (MEASURE only, local buffer, nothing binds); parts (1)/(2)/(4) are unaffected.

Save under `operations/trust-layer-2026-07/2026-07-17-F2-mentor-briefing.md`.

### Step 3 — Record the hold
Mark the return-with-record prompt (`operations/handoffs/founder/2026-07-12-trust-layer-S11-return-with-record-NEXT-SESSION-PROMPT.md`) **HELD on F2** for part (3) — a dated in-place note, not a rewrite. Parts (1)/(2)/(4) may still be assessed.

### Step 4 — CLAUDE.md's stale carried step (founder's call, surface it)
CLAUDE.md's 2026-07-12 refresh still reads *"The remaining carried step to START the 7-day clock: set `GATE1_FALSE_HOLD_CAPTURE=true`…"*. **It has been set since 2026-07-12.** Per PR18 the production-state block is rewritten only at session close from verified observations — so propose the correction, name it, and let the founder direct.

### Step 5 — Verify
```bash
cd /Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning
# the buffer is untouched (append-only; no ingest ran)
wc -l ~/.sage-gate1/false-hold-record.jsonl
# no code/schema/flag changed
git status --short -- website/src harness/ website/supabase* | head
# extended byte-identity gate (expect NONE; if it trips, check RA-1-F3 — it may be a filename false positive)
git status --short | grep -iE "api/reason|api/guardrail|guardrail-sandwich|sage-reason-engine|reasoning-receipt|translation-sandwich|/substrate/|trust-core|kathekon-engagement|false-hold|harness/gate1|layer1-extractor|layer2-mechanisms|sage-reflect|stoic-brain" \
  && echo ">>> TRIPPED — verify before pushing <<<" || echo "NONE — safe"
```

### Step 6 — Decision-log entry (lean form) + Step 7 — Close (lean form)
Per the cache. Suggested id: `D-TRUST-LAYER-S11-F2-MENTOR-BRIEFING-AUTHORED-HELD`.

---

## Part C — Anticipated session shape
| Phase | Estimate |
|---|---|
| Cache + finding + verbatim verdict | 20 min |
| Step 1 re-verify | 15 min |
| Step 2 briefing | 45–60 min |
| Steps 3–4 hold + CLAUDE.md surface | 15 min |
| Step 5 verify | 5 min |
| Decision-log + close | 20 min |
| **Total** | **~2 h** |

## Rollback path
`git revert` — documents only. No code, schema, flag, credential, or buffer change.

## Forecast
Success = the mentor holds a neutral, verbatim-accurate statement of the question, with the live distribution and the engine's contradicting reading in hand; the return-with-record session is explicitly held on part (3); nothing is implemented. **Then:** the mentor's ruling → (if a narrowing is ordered) its own build session + a re-run of the report → the return-with-record assessment → the S11 enforce re-examination (the assent re-confirmed at flip time, PR7).

**ENFORCE remains S11, readiness-gated. Weights BLOCKED. The 0h call remains the founder's.**

End of prompt.
