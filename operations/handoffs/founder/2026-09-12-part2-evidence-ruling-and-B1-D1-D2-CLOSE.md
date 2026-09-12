# Close — Part-2 evidence ruling adopted; B1 + B2 + B3 + D1 + D2 executed

**Date:** 2026-09-12 (machine date, `date`)
**Session:** `be441b20-0c12-4f91-82df-4733781d0a7a` (continuation)
**Tier:** `code-elevated` under a **scoped, per-commit founder waiver** of the armed byte-identity
guard (B1). AC7 not engaged — nothing activated, flipped, migrated or minted.
**Decision code:** `D-PART2-EVIDENCE-RULING-ADOPTED-B1-D1-D2-EXECUTED-2026-09-12`

---

## 1. The headline, stated once

**Part (2) of the four-part S11 readiness standard is not waiting on a write, a flag, or more days.
It is waiting on a window pointed at different work.**

The mentor ruled on the per-domain evidence this session relayed. `andreia` carries **one** record
across the entire window. *"One observation is not an evaluation."* And the window's composition —
governance authoring, record-keeping, this very kind of session — *"may never produce
andreia-engaging material."* Satisfying part (2) *"may require a different kind of window — one in
which the loop is operating on consequential product decisions."*

This supersedes, in effect, yesterday's Q-B recommendation. Branch 1 (a founder-walked accreditation
write) was recommended on 2026-09-11 as the path to discharging part (2). It cannot discharge it. A
write made over a single andreia observation would be precisely the dishonest write the Q-B condition
forbids: *"If the honest assessment … is that the evidence is thin, the write should say so."*

**The fork is the founder's and is unmade:** a differently-composed window, a revision of the
standard, or accepting part (2) as unmet and saying so.

---

## 2. The ruling, in full effect

Verbatim and canonical:
`operations/trust-layer-2026-07/2026-09-12-mentor-ruling-part2-evidence-and-part3-split-verbatim.md`
Question relayed:
`operations/trust-layer-2026-07/2026-09-12-mentor-question-part2-evidence-and-part3-split-FOR-RULING.md`

| Q | Ruling |
|---|---|
| **A1** | Part (2) is **NOT MET and NOT DISCHARGEABLE FROM THIS WINDOW.** `andreia` = 1 record; one observation is not an evaluation. The window's composition may never produce the material. |
| **A2** | *"Evaluated"* = the domain produced a record carrying an **assessed reading**, not merely appeared in an extraction. *"Above conservative"* reconciles to **tier 4 or better** on the A5 seven-tier scale — tier is canonical, weight is the derived monotone convenience. |
| **C1** | Part 3's consult/guard split — **left open by founder election** ("D3 leave until part 2 resolves"). Unruled. |

Folded into the pre-flip report at the ⚖️-marked points, with **§3.3 new** (per-domain evidence
table + the A1/A2 rulings) and **§10 revised** to carry the headline sentence above.

Per-domain figures, re-derived this session, not carried forward from any prior document:

| Domain | Window records | Note |
|---|---|---|
| `dikaiosyne` | 378 | |
| `phronesis` | 309 | |
| `sophrosyne` | 215 | 213 on the guard path |
| **`andreia`** | **1** | the blocking figure |

Only **two** sub-species passions appear window-wide.

---

## 3. What the founder elected, and what was executed

> "B1 waiver granted, B2 done, B3 adopted, D1 Signed, D2 bundle in, D3 leave until part 2 resolves"

**B1 — waiver granted; the Part-1 defect is FIXED.**
`website/scripts/false-hold-observation-report.ts` (GUARD_RE-matched; waived per-commit).
- Part 1's duration now computes over **window rows only**, via a shared `windowRowsFor` helper
  extracted so the same three-case window boundary is not implemented twice.
- The pooled-buffer span is retained beneath as an explicit `[DISCLOSURE ONLY — pooled buffer span …]`
  line. Nothing is hidden; it is relabelled as the disclosure the ruling said it always was.
- The script's "OPEN, UNRULED" console note is replaced with the Q-C ruling's own wording.

**B2 — already done** (the report was folded at the prior close).

**B3 — the standing opener is adopted.**
`operations/handoffs/founder/STANDING-SESSION-OPENER-grounded-foundations.md` banner moves from
"⚠ DRAFTED, NOT YET FOUNDER-ADOPTED" to "✅ FOUNDER-ADOPTED 2026-09-12".

**D1 — R18 logos-on framing applied, founder-signed.**
`website/public/llms.txt`, `website/public/.well-known/agent-card.json` (extension index 12,
`guardrail-signed-sandwich/v1` — description appended; **extension count unchanged at 26**),
`website/src/app/api-docs/page.tsx`. `npm run build` green.

**D2 — both W3.2 pins BUILT.**
`website/src/lib/substrate/trust-core/__tests__/s4-intervention-engine.test.ts` **§W3** — a new
section, **test file only**. `intervention-engine.ts` is **not modified** and stays byte-identical
(SHA-verified before and after every mutation probe).
- §W3.1/§W3.1b — pin 1 (L6): the orientation vocabulary appears nowhere in the engine source, with
  a **positive control** so the assertion cannot pass by grepping a file that was never read.
- §W3.2–§W3.4 — pin 2 (L4, negative half): the engine's inputs carry no first-circle/prohairesis
  channel, so an enforcement decision citing only a first-circle finding is structurally
  unrepresentable.
- §W3.5 — pin 2 (L4, positive half): the **actual** `JusticeSurfaceState` union, source-grepped
  with comments stripped, carries no self-regarding value.

**D3 (W2) — deferred by election** until part 2 resolves.

---

## 4. PR19 — one HIGH, confirmed independently, fixed

The independent adversarial review of the waived build raised one HIGH and it was real:
**§W3.5 as first written pinned `ALL_JUSTICE`, a constant local to the test file** (~line 69) — not
the production union. I confirmed it myself rather than taking the reviewer's word: adding
`| 'self_regarding'` to the **real** `JusticeSurfaceState` union left the pin **green**. The pin was
asserting something about the test's own fixture.

Fixed to source-grep the actual union. Re-mutation now correctly produces:

```
FAIL: §W3.5 (L4) the ACTUAL JusticeSurfaceState union (source-grepped, not the test fixture)
      carries no self-regarding value
```

**This is the second time this session that a pin was found asserting less than its wording claimed**
(the first was §W3.1b, where "orientation" turned out not to appear in the engine's docstrings at all,
making the pin vacuous; replaced with a positive control on `justiceSurface`). Both were caught, both
were mutation-verified after the fix, and the lesson is the standing one: a pin is not verified until
the mutation it claims to catch has been shown to turn it red.

---

## 5. Verification

| Check | Result |
|---|---|
| `tsc --noEmit` | clean |
| S4 intervention-engine battery | **423 passed, 0 failed** |
| Observation-report battery | **141 passed, 0 failed** |
| §W3.5 mutation (real union) | correctly **RED** (422 passed, 1 failed) |
| `intervention-engine.ts` restore | SHA-identical — `db86fccbaadf9c633374d689816b7e9d5e47ed46e8d89876f3e553f78ef4cd73` |
| `npm run build` | green; agent-card still 26 extensions |
| `layer2-mechanisms.ts` SHA pin | `60cefedb5f4f78822301…` unchanged |
| `stoic-brain.ts` SHA pin | `fa8895ec949b9f6d2f95…` unchanged |

The byte-identity guard stayed **armed** throughout. No GUARD_RE file sits modified in the working
tree at close except those inside the granted waiver's scope, committed under it.

---

## 6. What is owed after this close

1. **The part-(2) fork — the founder's, unmade.** A differently-composed window; a revision of the
   standard; or accepting part (2) unmet.
2. **Part 3's consult/guard split** — open and unruled, deliberately parked until (1) resolves.
3. **Part (1)'s seven-day threshold** — `2026-09-13T09:44:55Z` = **Sun 13 Sep 19:44 AEST**. Reaching
   it changes the clock, not the window's composition.
4. **W2** (record honesty machinery) — deferred by election; still a named flip component (§F, W3-d).

---

**D2 remains blocked. The S11 flip remains REFUSED. Weights remain BLOCKED. The 0h call remains the
founder's.**
