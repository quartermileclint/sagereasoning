# Mentor ruling, verbatim — the pooled false-hold rate mixes two instrument regimes

**2026-09-11.** Received in response to
`operations/trust-layer-2026-07/2026-09-11-mentor-question-regime-mixed-false-hold-rate-FOR-RULING.md`.
**Recorded verbatim, canonical. Verbatim wins over every summary, including this project's own.**

---

## False-hold rate regime split — three questions ruled

---

**Q1 — Is the regime-scoped reading the legitimate one for assessing readiness standard part (3)?**

Yes. The regime-scoped reading is the legitimate one, and the pooled figure is not a legitimate answer to part (3).

ADR-014's ruling — mixed regimes must never be presented as one distribution — is not a presentation preference. It is an epistemic constraint. A pooled figure that combines 138 records from a retired instrument with 323 records from the current instrument does not describe either instrument. It describes a mixture that has never existed as a coherent measuring apparatus. Using that mixture to answer "is the false-hold rate at target" is precisely the presentation ADR-014 forbids, and the readiness standard's part (3) is a measurement question. A measurement question answered with a figure that violates the project's own measurement discipline is not answered — it is evaded.

The at-action-v1-lean regime is retired. Its 138 records predate the observation window entirely. They are not evidence about the current instrument's behaviour. Including them in the readiness denominator would be equivalent to including pre-window data in a window-specific measurement — a category error the project has ruled against in other contexts.

The regime-scoped figure governs part (3): 0 false-positive holds against 61 correct holds under at-action-v2-composed. The pooled figure should not appear in the READINESS SUMMARY as an answer to part (3). It may appear as a disclosure — here is what the full buffer contains, here is why it is not the operative figure — but it must not be the headline.

**Q2 — Should the script be corrected, and does that need its own waiver?**

The script should be corrected. The correction needs its own freshly-recorded waiver, separate from the waiver already granted for the pre-flip disclosures build.

The reason is not procedural formalism. The reason is that the correction changes what the READINESS SUMMARY reports as the answer to part (3) of the S11 four-part standard. That is a consequential change — it moves the headline from NOT MET to MET. A change of that magnitude in a document that gates the S11 flip deserves its own recorded waiver with its own stated grounds, not absorption into a prior waiver whose scope was the pre-flip disclosure additions.

The waiver request should state: the correction changes the READINESS SUMMARY's part (3) answer from the pooled figure (NOT MET) to the regime-scoped figure (MET), on the grounds that ADR-014 forbids the pooled figure as a legitimate answer to a measurement question. The grounds are the ruling above. The waiver is the founder's to grant. The GUARD_RE constraint on false-hold-observation-report.ts applies regardless. The observation window is armed. The waiver must be recorded before the edit, not after.

**Q3 — Does part (3) read MET, with any qualification?**

Part (3) reads MET, with one qualification that belongs beside it. The qualification is not a small-sample caveat in the mechanical sense — 61 holds is not a thin count, and the existing `[small sample]` qualifier at holds < 5 is a different threshold. The qualification is an instrument-age caveat: the at-action-v2-composed regime has existed since approximately 2026-09-06, making the 61 correct holds and 0 false positives a reading from a five-day instrument under a five-day window. The window's part (1) requirement — a representative distribution across at least 7 days — is a separately tracked condition. Part (3) does not inherit part (1)'s requirement, but the instrument age is a fact that belongs beside the MET reading so a reader of the pre-flip report understands what the MET is based on.

The qualification reads: *MET under at-action-v2-composed (0 false-positive holds, 61 correct holds). Instrument age: approximately 5 days. Pre-window at-action-v1-lean records (n=138, all false-positive) excluded per ADR-014 — mixed regimes may not be presented as one distribution.* That is the complete, honest reading of part (3). It is a MET. It carries the instrument-age disclosure. It does not carry a small-sample flag, because 61 holds is not a small sample in the sense the flag was designed for.
