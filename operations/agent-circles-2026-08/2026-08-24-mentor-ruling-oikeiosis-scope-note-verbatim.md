# Mentor ruling — the oikeiosis-only deliberation scope note (verbatim)

**Relayed by the founder 2026-08-24** (pasted directly in-session; transcribed from the paste), in
response to the open question raised at the D4-completion close
(`operations/handoffs/founder/2026-08-23-d4-completion-proxy-fix-CLOSE.md`) and named in
`2026-08-23-evaluative-engine-status-documentation-map.md` §5b.

**Status: ADOPTED AS BINDING on the founder's relay. Verbatim wins over any paraphrase, here or
elsewhere.**

**Binds (headline; the verbatim below governs):** the oikeiosis-only deliberation bound on
`ruling_faculty_state` **owes a public scope note**. It is a **different and prior** disclosure from
EE-C2's interim proxy label — the proxy label named a deficiency in *how* the oikeiosis mechanism
counts deliberation; the scope note names *what the mechanism reads at all*. **Both were owed**, and
the proxy disclosure never substituted for the scope note. The note ships on the same three R18
surfaces as the epistemic-status map, under the same sign-off discipline, and **stays until the
mechanism's scope changes** — which is a separate build decision, not a proxy fix. The mentor
**declined to rule on the specific wording** (they have not seen the §5b draft) and instead fixed
what the note **must convey**, including a third clause they explicitly flagged as mattering.

**Licenses no code.** No build, route, flag, credential, schema, or engine change. The publication is
R18-gated on founder-signed wording, as its own step.

---

## VERBATIM

**The question**

Does the oikeiosis-only deliberation bound owe a public scope note? The field's deliberation reading is drawn solely from the oikeiosis mechanism, so a snapshot deliberating in the control-filter, value-assessment, or causal-stage mechanisms reads as not-deliberating. This is pre-existing, not created here. Whether it owes a label under EE-C2's own reasoning is the question.

---

**The answer**

Yes, it owes a public scope note.

Here is the reasoning. EE-C2's own reasoning established that the label on `ruling_faculty_state` should disclose what the field actually measures, not what a consumer might assume it measures. The correction that produced EE-C2 was precisely the recognition that "deliberate" as a label implies a broader reading than the mechanism delivers — and that the gap between the label's implication and the mechanism's actual scope is a disclosure obligation, not an implementation detail.

The oikeiosis-only bound is that same gap in a different form. A consumer reading `ruling_faculty_state: deliberate` will reasonably infer that the snapshot shows deliberation in the reasoning overall. The mechanism delivers something narrower: deliberation detected in the oikeiosis mechanism only. A snapshot that deliberates in the control-filter, value-assessment, or causal-stage mechanisms — and nowhere in the oikeiosis mechanism — reads as not-deliberating. That is a material gap between what the label implies and what the mechanism measures. EE-C2's own reasoning requires it to be named.

The interim disclosure for the proxy (named in the sign-off package) is a different disclosure — it names a known deficiency in how the oikeiosis mechanism itself counts deliberation. The oikeiosis-only bound is a different and prior disclosure — it names the scope of what the mechanism reads at all. Both are owed. The proxy disclosure does not substitute for the scope note.

---

**What the scope note should say**

The proposed one-sentence wording in the documentation map's new §5b is unsigned and unpublished — you have not seen it, so I will not rule on its specific wording.

What the scope note must convey, in whatever wording is chosen:

The deliberation reading in `ruling_faculty_state` is drawn from the oikeiosis mechanism only. A snapshot that shows deliberation in the control-filter, value-assessment, or causal-stage mechanisms but not in the oikeiosis mechanism reads as not-deliberating. This is a scope constraint on the field, not a deficiency in the snapshot.

That last clause matters. The scope note should not imply the snapshot is incomplete or that the agent failed to deliberate. It should name what the field measures and what it does not, so a consumer can interpret the field correctly rather than over-reading it.

---

**Where it goes**

This is an R18-gated disclosure — it belongs on the same three surfaces as the epistemic status map, under the same sign-off discipline. It should not ship independently of the map, and it should not be held until the proxy is replaced. The proxy replacement removes the interim proxy disclosure; it does not remove the scope note. The scope note stays until the mechanism's scope changes — which would require a separate build decision, not just a proxy fix.

The practical sequencing: the proposed §5b wording should be surfaced for your review alongside or immediately after the epistemic status map sign-off. It is a small addition — one sentence on each of the three surfaces, adjacent to the interim proxy disclosure — and it belongs in the same publication wave if the wording is ready.

## END VERBATIM

---

## Recording notes (added by the AI at transcription, 2026-08-24; NOT part of the ruling)

Three present-tense facts in the ruling have moved since it was framed. Recorded here per PR20
rather than silently absorbed. **None of them touches the ruling's substance, which is adopted in
full.**

1. **"adjacent to the interim proxy disclosure" no longer locates anything.** That paragraph was
   removed from `llms.txt` and the `agent-card.json` clause at commit `f7619d9` (2026-08-23), which
   is the commit the mentor's own text anticipates ("The proxy replacement removes the interim proxy
   disclosure"). The scope note therefore goes *where the interim disclosure was*, not beside it.
   **And the third surface never had one:** `api-docs/page.tsx` carried the map but never the interim
   clause (verified against `f7619d9~1`), so on that surface there is no adjacency to work from —
   the note attaches to the existing epistemic-status paragraph instead.

2. **"alongside or immediately after the epistemic status map sign-off" — that sign-off has already
   happened.** The Shape-1 map shipped to all three surfaces on 2026-08-08. So the scope note cannot
   ride that wave; it is a standalone R18 addition to already-published sections, under the same
   sign-off discipline the mentor names. The instruction "it should not ship independently of the
   map" is read as *it must not ship without the map's context around it* — satisfied, since the map
   is already live on all three surfaces and the note attaches to it.

3. **`ruling_faculty_state: deliberate` is not a value the field emits.** The field emits one of
   seven prose strings; `deliberate` is a `katorthoma_proximity` value. The mentor's example is
   shorthand. **The substance is unaffected and if anything stronger than the example suggests:** the
   field's actual strings assert deliberation in words — *"ruling faculty deliberating without
   distortion"* and *"no passions, no deliberation; ruling faculty at rest"* — so the
   label-implies-more-than-the-mechanism-measures gap the ruling identifies is present in the
   emitted text itself, not merely in a field name.

**Consequence for the §5b draft:** it fails the ruling as written. It carries the first two required
clauses but **not the third** — the one the mentor explicitly flagged as mattering ("This is a scope
constraint on the field, not a deficiency in the snapshot"). Revised candidate wording is carried in
the successor prompt for founder signature; the mentor has ruled on content, not wording, so the
signature is genuinely the founder's.
