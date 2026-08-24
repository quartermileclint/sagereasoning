# Close — Reflections Arc, Items 1 and 2

**Date:** 2026-08-24 · **Stream:** founder · **Arc:** reflections (*not* a SageReasoning project arc)
**Tier:** `governance`. Item 1's amendment is **Elevated** under 0d-ii; item 2 is Standard.
**AC7 not engaged.** No code, no schema, no flag, no credential, no migration, no live operation, no deploy. **Production untouched.**
**Predecessors:** `7c77123`, `364459f` — both confirmed ancestors of HEAD (`39e6569`) at open, by `git merge-base --is-ancestor`, not by inheriting the prompt's claim.

---

## What landed

**Item 1 — PR25 adopted.** `D-PR25-ADOPTED-VERIFICATION-CLAIM-CARRIES-ITS-CHECK-2026-08-24`. Applied to `adopted/project-instructions-snapshot.md`; the standing cache updated in the same session (`D-CACHE-DRIFT-RESOLVED-2026-08-24`). Founder signed off on the rule text itself via `AskUserQuestion`, on the sign-off package rather than a summary, per the PR19–PR21 convention.

**Item 2 — Letter I authored.** `D-REFLECTIONS-LETTER-1-ON-WRITING-BEFORE-KNOWING-AUTHORED-2026-08-24`. Filed in the arc directory by founder election; the `stoic-brain/` option was surfaced explicitly as not-a-filing-decision and not taken.

**Inherited open item — resolved by founder election, with its stated cause corrected.** `D-DECISION-LOG-PLACEMENT-NOTE-2026-08-24`. Nothing relocated.

**Files:**
- `adopted/project-instructions-snapshot.md` — PR25 added; cross-reference range PR10→PR25
- `adopted/standing-protocol-cache.md` — Status amendment record; process-rule range PR1–PR25
- `operations/reflections-examination-2026-08/2026-08-24-pr25-rule-text-signoff-package.md` — new
- `operations/reflections-examination-2026-08/2026-08-24-letter-1-on-writing-before-knowing.md` — new
- `operations/decision-log.md` — placement note at the head of the active region; **four entries appended at the true physical tail**
- this close — new

---

## Three inherited claims checked, three found wrong

The arc's own diagnosis is that inherited claims get restated without checking. The session prompt was treated as an inherited claim, per its own instruction.

1. **`RULING-Q2-2026-08-23` is not a ruling identifier.** It exists in exactly three places: twice as an illustrative example value for the `id` field in `2026-08-23-reflections-corpus-json-schema-design.md`, and once in the prompt presenting it as citable. The genuine record is `D-REFLECTIONS-EXAMINATION-SECOND-RULING-ROUND-FOLDED-2026-08-23`, which PR25 cites.
2. **A quotation attributed to the wrong artifact.** The prompt's R096 quote (*"the assertion I wrote to defend the exclusion is what refuted it"*) is in the findings record's §1 (`:104`), not in the Stage 1 extraction's R096 entry. PR25 and Letter I quote only what the extraction verifies.
3. **The misfiled-entries cause was wrong.** Not an offhand line in this arc's own reflections. `git blame` on the block's heading lines shows prepending on **2026-07-21, 2026-08-12, 2026-08-15, and 2026-08-23** — four arcs, three of them predating this one. "Relocate the four" was therefore a partial fix over 21 affected entries, and that was put to the founder before the election.

**PR25's number was confirmed by enumeration, not inherited:** 24 contiguous `### PR` headings, PR1–PR24; `PR25` appears nowhere in the repo but the prompt.

---

## Honest limits

- **No independent review of either output.** PR19's letter does not engage a governance/documents session — but the findings record's own IS-5 and IP-5 say an author cannot check their own artifact by re-reading it. Both outputs should be independently reviewed before being relied on. Named, not waived.
- **Letter I's eleven quotations were grep-verified at source** (six reflections, five doctrinal). That is PR25 branch 1 applied to prose on the day PR25 was adopted for code comments. It is a fact about this document and evidence of nothing about the disposition — the letter says so itself.
- **PR25 is convention-only.** Nothing enforces it. The pre-commit grep is the named escalation, not a shipped mechanism.
- **The Cowork panel paste-sync is the founder's**, marked by a `D-PI-SYNC-…` entry. Not performed here.
- **Nine concurrent peer sessions were live** (`ListAgents` at open). Only `decision-log.md` and the snapshot are shared; `decision-log.md` was re-checked clean immediately before appending. If a peer touched either file in the same window, resolve by keeping both sets of entries — nothing here overwrites.

---

## Arc state

| # | Item | Status |
|---|---|---|
| 1 | PR-series rule text (IS-1 encoding) | **complete** 2026-08-24 |
| 2 | First letter ("On writing before knowing") | **complete** 2026-08-24 |
| 3 | IW-2 routes (a) tooling + (b) KG-EX tracking | **cleared — next** |
| 4 | Combined scoping session (reflect-cadence + IW-2 route (c)) | blocked until 1–3 complete |
| 5 | JSON schema + dashboard design | complete 2026-08-23 (`364459f`) |

**Nothing in this arc licenses a build.** Item 3 produces tooling and a register entry; item 4 produces a scope. Extending item 5's schema to hold evaluative-engine outputs still requires its own PR19-reviewed build scoping.

**Next session should:** open item 3 — IW-2 route (a) (make a mechanically-testable lesson into a structural check, closing IW-6 with it) and route (b) (the KG-EX tracking layer). Route (c) is **not** item 3; it was folded into item 4 by founder decision 2026-08-23.

**Also open, for the founder, unchanged by this session:** letters 2–8 are unwritten; the collection's ordering is ruled but only its first element exists. Whether the collection ever leaves the arc directory is undecided and was deliberately left so.

---

## Commit

Committed, **not pushed** — the founder pushes. `website/src/data/environmental-context.json` is a pre-existing weekly-scan modification and was **excluded** from this commit, as the prompt required.
