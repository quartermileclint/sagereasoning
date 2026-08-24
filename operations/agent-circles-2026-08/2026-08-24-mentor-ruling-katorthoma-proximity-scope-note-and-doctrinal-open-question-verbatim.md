# Mentor ruling — the `katorthoma_proximity` deliberation-term scope note, and the doctrinal open question (verbatim)

**Relayed by the founder 2026-08-24** (pasted directly in-session), in response to two questions
raised at the close of the `ruling_faculty_state` scope-note publication session
(`D-OIKEIOSIS-SCOPE-NOTE-R18-PUBLISHED-2026-08-24`, commit `bcd8ed0`).

**Status: ADOPTED AS BINDING on the founder's relay. Verbatim wins over any paraphrase, here or
elsewhere.**

**Binds (headline; the verbatim below governs):**

1. **`katorthoma_proximity` owes its own scope note** — a **separate publication item**, on the same
   three R18 surfaces, under the same sign-off discipline. It does **not** ride the note published
   at `bcd8ed0` and does **not** wait for anything. Wording must be surfaced for founder review
   before it ships. **More urgent than the note already published**, because the field gates.
2. **The oikeiosis-only reading is NOT the doctrinally correct reading of a deliberating ruling
   faculty.** It is a **proxy** — a tractable computational approximation — and must be disclosed as
   such. **The published note's lifetime is restated and made more demanding:** not *"until the
   oikeiosis mechanism's scope changes"* but **"until the deliberation reading reflects the full
   ruling faculty's deliberative state across all mechanisms."** This supersedes the lifetime
   formulation in the 2026-08-24 ruling on `ruling_faculty_state`.
3. **The doctrinal question is carried as a named open question in the build sequence** — a scoping
   question for the generation-step / standing-runner design sessions, where the deliberation
   reading's architecture is already in scope. **The published note must not be allowed to stand as
   the resolution.**
4. **`website/smoke_a_prod.json` is a records-integrity item** to be resolved **before the next
   publication wave**: commit it if clean, else replace the citation with an accurate description of
   the evidence class.

**Licenses no code.** No build, route, flag, credential, schema, or engine change. The publication is
R18-gated on founder-signed wording, as its own step.

---

## VERBATIM

### Primary ruling — does `katorthoma_proximity` owe the same scope note?

Yes. The prior ruling's logic holds here, and holds harder.

The reasoning that established the `ruling_faculty_state` scope note was: where the gap between what a label implies and what the mechanism actually measures is material, disclosure is owed. The oikeiosis-only bound on `ruling_faculty_state` was that gap. The same predicate creates the same gap on `katorthoma_proximity`, and the stakes are higher.

Claude's framing is precise and I adopt it: on `ruling_faculty_state`, the deliberation reading is the field's deliberation content — the whole field turns on it. On `katorthoma_proximity`, deliberation is one term among five, so the field reads broadly and only its deliberation term is oikeiosis-only. That distinction is real. It does not clear the disclosure bar — it changes the wording of what must be disclosed.

What must be disclosed for `katorthoma_proximity` is narrower than the `ruling_faculty_state` note: not "this field's deliberation reading is oikeiosis-only" but "the deliberation term in this field's computation is oikeiosis-only — a snapshot deliberating substantively in the control-filter, value-assessment, or causal-stage mechanisms but carrying no oikeiosis tension reads as not-deliberating for proximity purposes." The field's other four inputs are unaffected. The note must be precise enough that a consumer understands the scope of the constraint, not so broad that it implies the whole field is unreliable.

The conservative direction Claude names — the mislabel runs toward reflexive, the strict end — bears on urgency but not on whether disclosure is owed. A conservative mislabel is still a mislabel. The consumer who sees a reflexive proximity reading and acts on it as if it reflects the snapshot's full deliberative state has been given a false impression, even if the false impression is in the cautious direction. Disclosure is owed regardless of direction.

The gating consequence is the reason this note is more urgent than the `ruling_faculty_state` note, not less. `ruling_faculty_state` is a prose string a consumer reads. `katorthoma_proximity` floors gate verdicts, feeds `proximity_floors`, and drives trust events. A consumer acting on a proximity reading that reads reflexive because of an oikeiosis-only deliberation term — when the snapshot was substantively deliberating in other mechanisms — is not just misreading a label. They are receiving a gating signal that has been shaped by an undisclosed scope constraint. That is a material gap.

**The scope note for `katorthoma_proximity` is owed. It belongs on the same three R18 surfaces as the `ruling_faculty_state` note, under the same sign-off discipline. It is a separate publication item — it does not ride the note already published, and it does not wait for the proxy replacement.**

The proposed wording for the note should be surfaced for founder review before it ships. What it must convey: the deliberation term in `katorthoma_proximity`'s computation is drawn from the oikeiosis mechanism only; a snapshot deliberating in the control-filter, value-assessment, or causal-stage mechanisms but not in the oikeiosis mechanism reads as not-deliberating for proximity purposes; this affects the branches that gate toward reflexive; the field's other four inputs are unaffected by this constraint.

---

### Secondary question — is oikeiosis-only the doctrinally right reading of a deliberating ruling faculty?

This is the right question to carry deliberately rather than let the note stand indefinitely as the resolution. Claude is correct that the prior ruling closed the disclosure question and left the doctrinal question open. They are different questions and only the first is closed.

The doctrinal question: does a ruling faculty that is deliberating in the control-filter, value-assessment, or causal-stage mechanisms — but not in the oikeiosis mechanism — count as deliberating, in the Stoic sense?

The Stoic answer points in a clear direction. The hegemonikon — the ruling faculty — is not partitioned by mechanism. When Epictetus describes the ruling faculty's work, he describes a unified rational capacity that receives impressions, examines them, grants or withholds assent, and generates impulse. The deliberation that matters is the deliberation of the whole faculty, not the deliberation of one mechanism's output. A ruling faculty that is carefully examining the control-filter question — what is and is not up to me here? — is deliberating. The fact that it is not simultaneously generating oikeiosis tension does not make it non-deliberating.

This means the oikeiosis-only reading is not the doctrinally correct reading of a deliberating ruling faculty. It is a proxy — a tractable computational approximation — and it should be disclosed as such.

The note's lifetime is not "until the oikeiosis mechanism's scope changes." The note's lifetime is "until the deliberation reading reflects the full ruling faculty's deliberative state across all mechanisms." That is a more demanding build target, and it should be named as such rather than left implicit.

**The recommendation: carry this as a named open question in the build sequence — specifically, as a scoping question for the generation-step or standing-runner design sessions, where the deliberation reading's architecture is already in scope. Do not let the published note stand as the resolution. The note discloses the proxy; it does not resolve whether the proxy is the right design.**

---

### Operational item — `website/smoke_a_prod.json` is untracked

This is straightforward. A published scope note that cites evidence which exists only on a local disk is in the same position as a governance document that states something the underlying data does not support — the claim is made, the basis is not verifiable.

Commit the file or replace the citation with something in-repo. The choice between the two depends on whether the file contains anything that should not be in the repository (credentials, personal data, production payload content that is not meant to be public). If it is clean, commit it. If it is not clean, replace the citation with a description of the evidence class rather than a specific file reference — "a real production consult with two engaged circles and causal evidence spanning phantasia to praxis" is a verifiable description even without the file, provided the description is accurate.

This is a records integrity item. It should be resolved before the next publication wave, not after.

## END VERBATIM
