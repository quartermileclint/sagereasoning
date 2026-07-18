# S11a — the extraction gate: ruling applied, diagnosis of record (2026-07-18)

**Session:** S11a (`operations/handoffs/founder/2026-07-17-trust-layer-S11a-arm-narrowing-NEXT-SESSION-PROMPT.md`).
**Binding specification:** the 2026-07-17 F2 verdict, §1 + §1b (`2026-07-17-mentor-consultation-F2-exclusion-clause-verdict-verbatim.md`; verbatim wins).
**Status:** Adopted — founder election, 2026-07-18 (AskUserQuestion; two elections, both recorded in §5 and §7).
**Decision-log entry:** `D-TRUST-LAYER-S11A-EXTRACTION-PRIOR-NARROWING-DEFERRED-CAP-REVIEWED`.

---

## 1. What this session was asked to decide

R12 (supplementary ruling, verbatim): *"first, does the extraction need work before the arm is narrowed, or can they proceed in parallel? If the extraction is known to be reliable on the action classes in scope, narrow the arm. If the extraction is uncertain, the extraction question is prior."*

The predecessor session could not separate the two candidate hypotheses:

- **(a) STARVED** — the extraction should be finding affected parties and is not ⇒ the extraction question is prior; the narrowing waits.
- **(b) MIS-SITED** — a tool-call payload genuinely has no party, no role, no purpose, so `contrary` is arithmetic, not judgement ⇒ the extraction is reliable for what it is shown; the narrowing may proceed.

## 2. The gate's answer: NOT reliable — and the fork is RESOLVED, not merely uncertain

**The input is STARVED BY COMPOSITION at the harness site.** Diagnostic-certain — root cause identified, verified first-hand at source this session:

1. **`describeAction` (`harness/gate1-pre-decision/claude-code/hooks/at-action-hook.mjs:280-321`) discards the party-carrying part of the payload before Layer 1 ever sees it.**
   - For a **`Write`**, the composed text is literally `` `Write (create/overwrite) the file ${fp} (${len} chars)` `` (line 303) — **the file content is discarded entirely.** A path plus a character count.
   - For an **`Edit`/`MultiEdit`**, the composed text is `` `Edit the file ${fp} — applying this change: ${snippet}` `` where `snippet = new_string.slice(0, 200)` (lines 292-294) — the first 200 characters of the replacement string only; no old string, no surrounding context, no intent.
2. **The consult POSTs exactly that one line.** `fetchFrame(cfg, action.text, …)` (at-action-hook.mjs, the CREDENTIAL-CRITICAL consult fetch) — nothing else about the action reaches `/api/reason`.
3. **The frozen buffer corroborates on every record — stated precisely (review fold, 2026-07-18):** all 64 `Write` previews are consistent with the `describeAction` template and none contradicts it — **24/64 untruncated previews full-match** the `path (N chars)` pattern; **the remaining 40 are cut at the capture's own 160-char preview cap** (`false-hold-capture.mjs:95`) before or inside the `(N chars)` tail and verify **by prefix**; the certainty of the content-discarded claim therefore rests on the **deterministic composer source** (`at-action-hook.mjs:303` — the only producer), with the buffer providing zero-anomaly corroboration, not standalone proof. The 66 `Edit` records carried at most the 200-char snippet (the same 160-char preview cap under-shows what was sent).

**Why this resolves the fork rather than leaving it uncertain:**

- **The mis-sited premise is factually wrong for `Write`.** "The payload genuinely has no party" — but the `Write` payload *includes the full file content*, which in this repository routinely names parties, obligations, users, and credentials. The hook drops it. The Bash-drop precedent does not carry: Bash commands were included **in full** (`Run this shell command: ${cmd}`) and were dropped for over-fire on metadata commands — a different problem. Here the party-carrying material is removed **before** composition.
- **It is not a Layer-1 extractor defect.** The `LAYER1_SYSTEM_PROMPT` circles category is faithful (circles = "the parties whose rational nature is engaged by the action", verbatim-evidence discipline, the anti-role-framing guard: "surface the AFFECTED parties' circle even when the action is framed as a role obligation"). The extractor demonstrably finds circles when the composed text carries party content: the U2 and §4 live smokes (marketing spam → `local_community`; calm injustice → circle with `violated`), the corroboration/LOCUS-2 batteries — and, **in-scope**, the single circle-carrying record in the frozen buffer (idx 4, an `Edit` whose one-line composed text yielded a circle with `obligation_assessment: indeterminate`). Honest bound: the record does not retain the full sent text, so we cannot confirm *which* part of that one line yielded the circle; what it demonstrates is that in-scope composed text **can** surface a circle when it carries something readable as a party.
- **Therefore:** on the action classes in scope, affected parties **genuinely present in the underlying action are structurally invisible** to the examination — not because Layer 1 cannot read them, but because the composed input cannot carry them. That is precisely the state R13 warns about: *"If Layer 1 is not identifying affected parties when they are genuinely present, the narrowing produces a clean number on a starved input."*

**A residual mis-siting question survives inside the diagnosis** (carried to the work item, not resolved here): even with content included, a tool payload is a projection that lacks the agent's *narrated intention*. Whether the at-action examination should read (payload + bounded content), (payload + transcript-tail intent, the H2/H5 discernment precedent), or both, is the S11b design question. The starved-by-composition finding stands regardless of how that design lands.

**Honest bounds on the Layer-1-faithfulness half (review fold, 2026-07-18 — the "Diagnostic-certain" is scoped to the COMPOSITION claim, which is source-certain; it does NOT extend to a claim that Layer 1 is uniformly reliable on one-liner inputs).** The buffer carries counter-observations the first draft did not examine, now on record and carried into S11b's validation design: **(i)** the window's ONLY `closed` loop event (idx 104) is a **zero-information `Write`** — path + char count only — that read `moderate`/`is_kathekon: true`, i.e. the extractor "found" two kathekon factors in a sentence carrying none: extraction **variance/noise on one-liners**, in the lenient direction, and it produced the window's single loop closure; **(ii)** at least 4 `Edit` records whose visible snippet portion carries party-referring language (idx 43, 112, 126, 127 — e.g. "The R20a vulnerable-user protections apply to…") got **zero circles** — bounded honestly by *mention ≠ affected party* (a fragment quoting doc text about users is not an action affecting them, so zero circles there is arguably correct extraction) and by the 160-char preview truncation capping what is knowable. Neither observation weakens the composition finding; both mean S11b's validation battery must discriminate **noise** (idx-104 class), **mention-without-affect** (the 4-snippet class), and **genuine party-affecting content** — at N≥3 per fixture, per the standing repro-runs lesson.

## 3. Consequence under R12: the extraction question is PRIOR — the narrowing is DEFERRED

By the mentor's own conditional, the extraction is not "known to be reliable on the action classes in scope" — it is known to be **structurally starved** on them. The narrowing therefore does **not** land this session. It rides **behind** the extraction work item (S11b prompt authored this session), so that when Arm 1 is narrowed to "≥1 identified circle" (R11 — content settled, not re-litigated), the predicate reads inputs that could actually have carried a circle.

**R13 carried forward verbatim onto S11b:** the narrowing makes Arm 1 accurate for the measurement instrument; it does not fix the extraction; the A2 omission class (a harm omitted from the narration produces no circle — the same wire signature as a party-less act) remains the disclosed structural residual **even after** the recomposition, and must be visible in S11b's battery and stated on every output of the narrowed arm.

## 4. Evidence of record

### 4.1 The canonical report over the frozen buffer (current arm; dry-run, no DB)

`npx tsx scripts/false-hold-observation-report.ts --records …/false-hold-record-FROZEN-2026-07-17.jsonl --dry-run` — run this session:

> parsed: **130** valid records · window 2026-07-12T13:15:47.300Z → 2026-07-17T12:09:07.248Z (4.95 days) · holds **129** (opened 13 / reopened 116; closed 1) · false-positive holds **0** · correct holds **129**, all via `justice-surface` · **"mentor's target (false ≤ correct): MET (0 ≤ 129)"**.

This is the reading the ruling found artifactual, now on record from the tool itself over the frozen evidence.

### 4.2 The narrowed-arm reconstruction (evidence of what the narrowed arm would see — NOT a readiness claim, NOT code)

Computed offline this session by applying R11's rule — Arm 1 fires only when ≥1 circle is identified (`obligationStatuses.length >= 1` in the capture projection, one entry per circle) — with Arms 2–4 unchanged, over the same frozen 130:

| classification | current arm | narrowed arm (reconstruction) |
|---|---|---|
| `correct_hold` | **129** | **1** (the idx-4 circle record, `indeterminate`) |
| `false_positive` | **0** | **128** |
| `not_a_hold` | 1 | 1 |

**Bounds on this number, stated so it cannot be over-read:** it is a reconstruction, not a code artifact (no code changed this session); and per §2 it measures **the harness's input composition, not the examination's judiciousness** — 128 "false positives" on inputs that structurally could not have shown a party even where one existed. It is recorded so S11b does not re-derive it, and as the concrete demonstration of R13's "clean number on a starved input." The readiness standard remains NOT met, and this window cannot meet it (parts 1+2 fail; the part-3 denominator is unpopulated — register P4/P5/P6).

### 4.3 The mechanism re-verification (session-prompt Step 1 — all four lines reproduce)

- `computeVirtueDomains` (`layer2-mechanisms.ts:1803`): `circles >= 1 || is_kathekon !== null` ⇒ dikaiosyne tags on `is_kathekon === false`.
- `selectImprovementPath` priority 4 (`layer2-mechanisms.ts:1893`): `is_kathekon === false` ⇒ correction path ⇒ the loop opens ⇒ the hold.
- `deriveWorstJusticeOutcome` (`derive-trust-events.ts:200`): `dikaiosyneEngaged && statuses.length === 0` ⇒ `justice-surface-unevaluated` ⇒ non-null ⇒ Arm 1 fires.
- `assessKathekon` count table (`layer2-mechanisms.ts:800-812`): 0→`contrary`/`false`, 1→`marginal`/`null`, 2–3→`moderate`/`strong`/`true`; the exact emission string at line 1202. `computeDikaiosyneFloor` (`:1500-1510`) — §4's newer test (`circles >= 1 || hasNaturalRelationship`) reads the live 129 as **not engaged** (null), exactly as R3 records.
- `obligationStatuses: []` means zero circles: the projection maps over `relevant_circles` (one entry per circle, `null` for a circle without an assessment) in both the TS (`kathekon-engagement.ts:154`) and the JS mirror (`false-hold-capture.mjs:66`).
- The class reproduced live **on this session itself**: the at-action examination rated this session's own read-only battery runs "contrary to appropriate action; no kathekon factors detected" (pause_for_review cautions + G3 elicitations, answered genuinely in-conversation) — shell-command payloads carrying no party, role, or purpose.

## 5. The trust-record cap review (R14 — discharged this session, on current ground)

R14 binds regardless of the gate outcome, and the arm was **not** narrowed — so the cap was reviewed on **current** ground, as the session prompt requires, and this section says so plainly.

**Ground (established, two sources):** per the register (**D1**, ground QUERIED 2026-07-17, post-incident): the ledger holds exactly **ONE** `justice-surface-unevaluated` event for `sagereasoning:s9-loop@v1` — from the S9 install close-write, `2026-07-11 05:45:29.674+00`, artifact `signed:substrate-layer2-2026Q2` — and the cap rests on that single event, not on a stream from the 130 observation records (at-action consults never become trust events; emission fires only on accreditation writes). **Re-verified first-hand this session on the public surface** (read-only GET, 2026-07-18): `GET /api/trust-record/sagereasoning:s9-loop@v1` publishes `justice_capped: true`, dikaiosyne `deliberate`, basis "minimum-domain rule across 1 evaluated domain(s): dikaiosyne=deliberate (justice cap active)", confidence 0.42, one evaluated cardinal domain — and `honest_reflect_count: 11` with the latest at 2026-07-17, confirming the gen-2 harness is live and writing.

**The review's finding:** the cap rests on the same zero-circle predicate class the mentor ruled does not constitute a justice surface (R7: *"a permanent justice cap on an agent whose actions had no identified affected parties is not a correct public signal"*). It is an R18 **honesty** issue, not a safety one: the cap is the safe direction (trust reads lower, never higher) and there are no external users.

**Disposition (founder election, 2026-07-18): DISCLOSE-AND-CARRY; the durable fix rides S11b.** The deciding argument is **stability**: the gen-2 harness is live and writing, so a data-only latch clear now would be undone by the next accreditation close-write — under the un-narrowed reducer, a zero-circle dikaiosyne-tagged assessment re-emits `justice-surface-unevaluated` and **re-latches the cap**. The durable correction is the **reducer narrowing** (`deriveWorstJusticeOutcome` — LIVE code, so `code-critical` + founder-walked under AC7) **plus the state correction in the same walk**, landing once, inside S11b, alongside the recomposition (same root, one coherent change, per D2/D3 in the register). Until then the cap stands, disclosed: the register D1 records the completed review + this disposition; the ledger event itself is append-only historical truth and is **not** deleted (deleting evidence to raise trust would be the wrong direction for an honesty-first record).

**The re-latch chain, verified first-hand at source (the review's cap-verification dimension, completed first-hand after the spend limit killed its agent):** the accreditation route calls `emitAccreditationTrustEvents` (`accreditation/[agent_id]/route.ts:803`), gated on `provenanceEnforced` (R18f-verified) + the trust-core flag; its idempotency key is a **content hash of the write's signatures**, so a write carrying NEW signed assessments emits NEW events (only identical signature sets dedup); a zero-circle dikaiosyne-tagged assessment derives `justice-surface-unevaluated` (`derive-trust-events.ts:200` + `layer2-mechanisms.ts:1803`); and `trust-transition.ts:196` **latches the deliberate cap on exactly that event** (`:171` clears it only on a demonstrated `met` evaluation — impossible on this action class). One cadence honesty note: per the register D1's 2026-07-17 query, the ledger then held only the install-time pair of examination-derived events — so re-latch is a **class certainty on any future R18f-verified close-write carrying a fresh zero-circle assessment**, not necessarily an every-session event; whether gen-2 close-writes have emitted since is not establishable read-only from here (a founder DB read can confirm at the S11b walk). The disposition is unchanged either way — correcting the state before the reducer is narrowed leaves the public signal one close-write away from reverting.

**R7 reconciled head-on (review fold — the one sentence most in tension, addressed rather than implied):** R7's verbatim *"this is a live consequence and should be addressed in the narrowing session, not deferred"* is satisfied by the **review + disposition landing here** — the cap's ground is established, re-verified live, and dispositioned with a named, sequenced fix. The FIX's deferral to S11b is entailed by the mentor's own R12 routing: the durable fix **is** the reducer narrowing, which is part of the narrowing R12 itself ruled the extraction question prior to; and R14's literal closing condition — the arm **fixed** AND the cap **unreviewed** — is unmet, since the arm was not fixed and the cap was reviewed. A data-only "fix now" would have satisfied the letter of "not deferred" while publishing a signal one close-write from reverting — the letter-over-purpose move R2 warns against.

## 6. What this session did NOT do

- **No code, schema, flag, credential, mint, deploy, or DB write.** The narrowing did not land (deferred per the gate); the cap was not altered (disclose-and-carry); `agent_hold_observations` remains empty (the report ran `--dry-run` offline only). Production is byte-equivalent to session open.
- **No part-(3) re-measurement** — needs a new window (P6) with the recomposed input + narrowed predicate + a populated denominator (P5).
- **No Layer-1 prompt change** — and the diagnosis found none is required for the circles category (the prompt is faithful; the starvation is upstream). S11b re-checks this after recomposition.
- **Nothing here is progress toward the flip.** The readiness standard remains NOT met; ENFORCE remains S11, readiness-gated; weights BLOCKED; the 0h call remains the founder's.

## 7. Elections at adoption (AskUserQuestion, 2026-07-18)

1. **The extraction gate: "Extraction is prior — defer the narrowing."** The mentor's conditional routes there on this evidence; the session prompt names this a success outcome.
2. **The cap: "Disclose-and-carry; durable fix rides the work item."** Per §5.

## 8. Successor — and the ADR-014 sequencing consequence

**S11b — the examined-input recomposition → the Arm-1 narrowing → the reducer/cap fix:** `operations/handoffs/founder/2026-07-18-trust-layer-S11b-examined-input-recomposition-NEXT-SESSION-PROMPT.md`. The §9 input question (register P1) remains its own later design step; the flip session reads the register.

**ADR-014 consequence (adopted 2026-07-18, before this session ran):** its E7 sequencing — *"S11a first (the extraction regime settled + version-marked once; the item-5 trigger a named instrument in it) → AE-1 → AE-2 → AE-3"* — expected S11a to settle the extraction regime, and the AE-1 prompt carries that as a HARD pre-condition. S11a did not settle it (this diagnosis is why); **the settlement obligation moves to S11b, and AE-1's pre-condition moves with it** (a dated note now sits at the top of the AE-1 prompt; the S11b prompt carries ADR-014's two binding requirements — the regime version-mark and the item-5 bare-tool-payload trigger riding the same settlement). One honest note: ADR-014 expected the item-5 trigger's *fire-rate* to be the diagnostic separating starved from mis-sited; this session separated them by direct source reading instead, so the trigger enters S11b as a remedy component for the residual party-less class, not as the diagnostic.

---

*Record ends. Cross-references: the S11a session prompt; the 2026-07-17 verdict (binding); the F2 briefing §10 disposition 2/3/5 (this diagnosis is the evidence-grounded resolution of that disposition space); `S11-FLIP-PREREQUISITES-REGISTER.md` (P2/P3/D1 updated this session); the frozen buffer `runs/2026-07-17/false-hold-record-FROZEN-2026-07-17.jsonl`.*
