# Mentor question — how to close the extraction-provenance gap, and whether the honesty correction is owed first

**Authored 2026-08-25.** `governance`, documents only. **Nothing here is a recommendation to build
anything**, and nothing here elects a fix. **No code, migration, flag, credential, or public surface
was touched.** Weights BLOCKED.

**Why this question exists.** The 2026-08-24 ruling confirmed the emission-hooks finding, named it the
first item to scope, ordered it scoped **together with route (i)**, and **deliberately declined to rule
the fix**: *"the fix options differ in kind and consequence."* The scoping session
(`2026-08-25-extraction-provenance-and-independent-extractor-SCOPE.md`) has run. It resolved the
open technical question at source, found the answer inverts one of the four candidate options, and
surfaced two consequences the ruling could not have seen from the question it was given.

**PR20 compliance.** Part 1 names the specific existing mechanisms this ruling will land on, at
mechanism level, so downstream consequences are visible before the ruling rather than found afterward
by PR19 review. Every present-tense mechanism claim below was **re-verified first-hand at source on
2026-08-25**; claims that a repo session cannot settle are marked **unverified** rather than asserted.

---

## PART 1 — The mechanisms this ruling lands on

**M1 — The gap, unchanged and confirmed.** `emitAccreditationTrustEvents`
(`trust-core/emission-hooks.ts:78-93`) gates on three things: the trust-core flag,
`provenanceEnforced` (an Ed25519 **signature** check), and a non-empty `signed_assessments` array. Its
entire input is `{agentId, credentialId, provenanceEnforced, rawBody, now?, resolvedOwnerUserId?}`
(`:54-68`) — **no `layer1Source`, and none derivable from the request.** Its sibling
`emitOrientationReadingTrustEvent` has the guard at `:465`.

**M2 — The join key exists, and it is inside the signed bytes.** This was the scoping session's open
question and the answer is not the one the ruling's framing assumed. `Layer2Assessment.examination.ref`
is attached **before signing** (`layer2-mechanisms.ts:443`; `parallel-run.ts:898-900`, signed at
`:1084`) and is set from the same `correlationId` the trajectory row is keyed on (`route.ts:1374`
and `:1851`). Because it is signed, **a caller cannot forge it.**

**M3 — But that key is per-LOOP, not per-consult, and the caller sets it.** On the API-key path
`correlationId = X-Loop-Id ?? generated` (`route.ts:808-823`); `extractLoopId` validates **UUIDv4
format only** — no uniqueness check, no credential binding (`loop-cost-tracker.ts:512-525`). **One loop
id spanning many consults is the design** — it is the Option-D billing unit.
`agent_assessment_history.correlation_id` is UNIQUE and a duplicate insert is *"a benign no-op"*
(`agent-assessment-history-store.ts:425,460`), so **only the first consult in a loop writes a row.**

**M4 — Therefore the obvious fix is defeated by setting a header.** Consult once under
`X-Loop-Id: X` with raw text → row `X` written, `layer1_source='server'`. Consult again under the
**same** `X` supplying `layer1_schema` → the insert is a silent no-op, row `X` still says `'server'`.
Submit the second assessment as accreditation evidence: its `examination.ref = X`, the lookup returns
`'server'`, the event mints. **Every step is ordinary documented behaviour; no forgery is involved.**
A check built this way would be the thing *licensing* the corrected public claim — **strictly worse
than the honest gap.**

**M5 — A near variant is sound, and is the lightest structural fix available.** The Ed25519 signature
is the only per-consult, server-produced, caller-uninfluenceable identity in the system, and **nothing
persists it today** (the A12 audit row stores only a boolean `layer2_signature_present`). A ledger
mapping `sha256(signature) → layer1_source`, written at consult time (the signed assessment is already
in scope at that call site — `parallel-run.ts:1108`, `route.ts:1533,1850`) and read at write time,
closes the mint-time gap **with no signing-contract change and no wire change.** Its limits are real:
retention (a 90-day window would leave older artifacts unresolvable, interacting directly with the
already-disclosed **PA-10 stale-artifact replay class**), no history (the ledger starts empty), and
flag-dependent coverage.

**M6 — The public claim is inaccurate on all three R18 surfaces, and has no test pin.**
`attests[1]` (`trust-record-payload.ts:48`) claims unconditionally that decisions were reasoned *"as
narrated and extracted from the submitted text."* The same claim is mirrored at `llms.txt:759` and
`agent-card.json:446`. The payload file contains **zero** occurrences of `layer1`/`supplied`/
`provenance`. **And no test pins that sentence:** the only battery assertion is `S2-37`, strict
reference identity, whose own in-test comment states it *"cannot detect a missing envelope ITEM"*
(`s10-trust-record-surface.test.ts:266-278`). **An edit to this served public claim would pass every
battery silently today.**

**M7 — The record already points readers at a disclosure that is not there.** `agent-card.json:474`
publishes: *"the Ed25519 signature attests the deterministic computation's reproducibility from the
extraction; it does not attest the extraction's truth (see `does_not_attest` … for the canonical
condition, which is deliberately held in ONE place rather than duplicated into the signed bytes)."*
That caveat addresses **truth** (Threat A). It does not address **origin**. And it directs the reader
to `does_not_attest`, which by M6 carries nothing on this axis. **The defect is not a plain omission —
it is a pointer that resolves to nothing.**

**M8 — Route (i)'s cost is measured, and it erases the thing it modifies.** From
`m1-docs-staged-for-activation.md` §4 (measured 2026-06-12, **TEST-labelled, never
production-verified**): server-side Layer-1 extraction runs **~10–13s** and dominates every full-shape
consult; a supplied-schema `assessment_first` consult runs **~3.1–4.3s**. **Route (i) mandates
server-side extraction on every path, so it adds ~10–13s to every supplied consult (~3–4s → ~13–17s),
removing that path's entire reason to exist.** Money cost, estimated with basis stated (Sonnet at
$3/$15 per M; `max_tokens: 4000`; system prompt measured at ~4,300 tokens): **~$0.04–$0.06 per
extraction, doubling for a true ensemble.**

**M9 — Two consequences of route (i) the earlier question could not surface.**
(a) **It makes `l1_supply` advisory.** If the server always extracts, a supplied schema's only
remaining function is to be cross-checked — and `l1_supply` is **mandatory** on the plugin path
(`route.ts:554-568`), whose local Layer-1 would become redundant compute the plugin still pays for.
Route (i) is close to deciding the fate of `l1_supply` as a side effect.
(b) **"Checked against" requires a disagreement policy, and that policy is itself a gaming and
over-strictness surface.** Two honest extractions can differ legitimately at `temperature: 0.2`
(`layer1-extractor.ts:2265`). Reject-on-disagreement re-opens the over-strictness direction the ADR-010
§4 unity-thesis coupling closed. Take-the-stricter is safe but biased. Take-the-server's makes the
supplied schema decorative. **The policy is the design, and it is unruled.**

**M10 — The exposure does not reach the surface that acts.** `/api/guardrail` — the live ENFORCE
surface — has **zero** `layer1_schema` occurrences and a closed body destructure
(`api/guardrail/route.ts:105`). It always extracts server-side. The exposure reaches the accreditation
/ public-trust-record surface and the `/api/reason` consult response, **not** any proceed/block
decision.

**Marked unverified (a repo session cannot settle these).** The live production state of
`SUBSTRATE_TRAJECTORY_WRITE_ENABLED`, `SUBSTRATE_TRAJECTORY_DELTA_ENABLED`,
`SUBSTRATE_REASON_LOOP_CLOSURE_ENABLED`, `SUBSTRATE_L1_SCHEMA_KEY_PATH_ENABLED`; and the number of
live credentials carrying `l1_supply`. The decision record asserts the flags live — **that is a record
claim, not a verification.** Each is one founder-run `curl` or one SQL query away.

---

## PART 2 — The questions

**Q1 — Which structural fix?** Given that the join-back option is defeated by a request header (M3/M4)
and is therefore off the table, the genuine fork is:

- **(a) a signature-keyed provenance ledger** (M5) — no signing-contract change, no wire change,
  negligible per-consult cost, but coverage bounded by retention and starting empty; **or**
- **(b) provenance inside the signed payload** — cleanest semantics, travels with the artifact, no
  lookup and no retention window, but it changes the signing contract and needs a key/version story.
  **This is cheaper than previously presented:** `examination`, `proximity_floors` and `corroboration`
  are three optional fields already added to this exact signed object, each omitted entirely when its
  flag is off to preserve flag-off byte-identity. The house pattern exists and has been walked three
  times.

**Q2 — Is the honesty correction owed NOW, ahead of and independent of any structural fix?** The
scoping session found that **no structural option repairs already-minted events** — the public record
aggregates events minted under the gap, and nothing persists a signature to re-derive them from. So
the correction appears owed under every branch. **But its correct wording depends on which structural
fix is chosen** ("cannot distinguish" today; "…outside the ledger's coverage" after (a); a
historical-scope clause after route (i)). The tension: correct now and re-correct later (two edits to
a served public claim, honest at every instant), or correct once alongside the fix (one edit, but the
inaccuracy — which the ruling called *"a live condition, not a future risk"* — stands meanwhile).
**M7 bears on this: the record currently points at a disclosure that is not there.**

**Q3 — Should route (i) be decided as a provenance fix at all?** Its measured cost removes the
supplied path's entire purpose (M8) and it decides the fate of `l1_supply`, including on the plugin
path where the schema is mandatory, as a side effect rather than as a decision (M9a). Its
disagreement policy is unruled and is itself a gaming surface (M9b). **Is route (i) better framed as
its own question — "what is `l1_supply` for?" — rather than as the fix to this gap?** Route (i)
remains the only option that addresses the Arm-B threat directly, which no other option here does;
the question is whether that argues for building it now or for scoping it separately and properly.

**Q4 — On the absent-row policy, if a ledger is chosen (Q1a).** When an artifact has no ledger entry —
out of retention, pre-ledger, or written while the consult-side flag was off — should the event
**mint anyway** (preserves today's behaviour; leaves the gap for uncovered artifacts) or be
**refused** (honest; would refuse legitimate historical and out-of-window writes)? A secondary point:
the lookup is signature-keyed, so it can cross credentials — a departure from the R17a
credential-scoping posture used everywhere else, and one that should be ruled rather than assumed.

---

## PART 3 — What is not being asked

Not asked: to build anything; to edit `attests[]` / `does_not_attest[]` (a served public claim needing
founder R18 sign-off, deliberately untouched); to re-open route (ii), the GS-CYB-1 amendment, or the
bar's Arm-B measurement (all settled 2026-08-24); to make any weights-tier claim.

**A note on this document's own limits.** PR19 does not engage for a documents session and **no
adversarial review was run on this question.** The last two mentor questions each needed a full
adversarial pass before they were fit to relay, and one of them was found to be reasoning toward a
conclusion rather than putting a question. **This document has not had that check.** Its central
technical finding (M2–M4) rests on eight first-hand source reads that are individually cited and
individually checkable, and the finding *inverts* the option the author would otherwise have
recommended — but the founder should weigh it accordingly, and a PR19 pass is warranted before any
build session acts on it.

---

## Cross-references

- `2026-08-25-extraction-provenance-and-independent-extractor-SCOPE.md` — the scope this question comes from
- `2026-08-24-mentor-ruling-gaming-robustness-bar-route-ii-verbatim.md` — **binding**; the order to scope these together, and the declined fix ruling
- `2026-08-24-MENTOR-QUESTION-gaming-robustness-bar-route-ii.md` — Part 0, the original finding
- `operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md` — the ⚠ URGENT — UNSCHEDULED registration
- `website/src/lib/substrate/trust-core/emission-hooks.ts:54-93,465` · `trust-record-payload.ts:48` · `s10-trust-record-surface.test.ts:266-278`
- `website/src/app/api/reason/route.ts:554-568,808-823,1374,1844-1851` · `loop-cost-tracker.ts:512-525` · `agent-assessment-history-store.ts:425,460`
- `operations/p1-rebuild-2026-06/m1-docs-staged-for-activation.md` §4 — the measured latency envelopes (TEST-labelled)

*End of question. Nothing built, nothing disclosed, no claim changed, no fix elected.*
