# Mentor ruling — VERBATIM, CANONICAL — eight questions: the W2 window's work, S11-D2 sequencing, and R8-D7 under W

**Received:** 2026-09-13 (machine date, ~11:24 AEST), relayed by the founder from
`2026-09-13-F1-and-R8D7-RELAY-DRAFT-with-recommendations.md` (Q-M1…Q-M8).
**Status: ADOPTED AS BINDING on relay. This verbatim text wins over every summary, fold or
restatement anywhere in the repository — including the two drafts it rules on, the window
specification, the S11 register, the standing opener and the decision-log entry.**
**Sits under:** the 2026-09-13 W2-window ruling (which it amends on the candidate list), the
2026-09-12 Q-S1/Q-S2/Q-S3 ruling, the 2026-09-06 D2 mid-window ruling (which it amends on the
baseline's window), R8 §5.3 (which it amends on scope), and the 2026-09-13 M/W/S election (which it
leaves standing).

**Headlines (the verbatim governs).** **Q-M1** — candidate (b) WITHDRAWN; ordering amended to (c)
primary, (a) secondary; the D2 correction accepted; "relay pending" is documentation drift. **Q-M2** —
a guarded-file waiver on the measured checkout, guard armed, IS window work; a worktree is not.
**Q-M3** — consequential design authoring in `operations/` satisfies the clock rule; "live surface"
means consequential. **Q-M4** — the S11-D2 baseline RESTARTS with the W2 window (five ordinary consult
days from W2's first record). **Q-M5** — R8-D7's scope AMENDED: worst-of-K on the would-be-winner
population only; the rejection re-election fixpoint removed. **Q-M6** — K is a cost election; K=1 is W.
**Q-M7** — measure first on the live loop (Option E) before any R8-D7 build beyond K=1 disclosure.
**Q-M8** — a sampled verdict discloses K, the floor count and the worst-draw rule; never a confidence
scalar; the R18 sentence needs founder-signed amendment when it applies.

---

## Eight questions ruled — W2 window work, S11-D2 sequencing, and R8-D7 under W

---

**Q-M1 — Correct the candidate list?**

Candidate (b) is withdrawn as a source of window work. The ruled ordering is amended to: (c) standing-runner design track as primary, (a) staged-clause application as secondary, (b) removed.

The factual correction in §1.2(b) is accepted on the same footing as the Part-1 note the verbatim carries. The D2 specification is complete; no open axis remains; the three rulings adopted 2026-09-06 are governing. The phrase "scoped-for-ruling, relay pending" surviving in secondary records is a documentation drift, not an open question.

The S11-D2 build is a sequenced item, not window work — it is a guarded-file build under the mid-window ruling's waiver shape, and its sequencing is governed by Q-M4 below.

**Q-M2 — Guarded-file waivers as window work**

Work requiring a recorded waiver on a GUARD_RE file may count as window work, subject to one condition: the waiver must be recorded on the measured checkout with the guard left armed, following the shape the D2 mid-window ruling prescribes. A worktree with capture unset is not window work — that is the ruling that found W2's build session did not happen from the window's perspective. A waived session on the measured checkout, with the guard armed and the consult path active, produces records the window counts.

The condition is not merely procedural. The window's purpose is to observe the loop operating on consequential decisions through the consult channel under conditions where the extraction can reach the domain. A waived session on the measured checkout satisfies that purpose. A worktree session does not, regardless of the work's subject matter.

This means the S11-D2 build, when it opens, is eligible window work if it runs under the waiver shape on the measured checkout. Whether it opens during the W2 window or after is governed by Q-M4.

**Q-M3 — Does design authoring in operations/ satisfy the clock rule?**

Yes. Design authoring on a document in operations/ satisfies the clock rule when two conditions hold: the document is consequential in the sense that getting it wrong has real downstream consequences for the project's architecture or governance, and the authoring is carried out through composed, narrated Write/Edit actions on the measured checkout.

The standing-runner design work satisfies both. R8-D7's sampling-policy design, the manifest ATRF item-3 amendment draft, and the build brief's second increment are documents whose errors propagate into build decisions with real costs. They are Write/Edit work by nature. The first consult record of a design sitting on this work starts the W2 window's clock.

The ruling's language — "on a live surface" — means consequential, not necessarily production code. A design document that governs a production build is live in the relevant sense.

**Q-M4 — Does the S11-D2 baseline carry from the current window or restart with W2's window?**

The baseline restarts with the W2 window.

The mid-window ruling sequenced S11-D2 against the current window's baseline — five ordinary consult days. Q-S1 ruled that the W2 window is a new window, not a continuation of the current one. A baseline defined against the current window's composition does not carry into a window with a materially different composition. The count half being met on the current window is noted and recorded; it does not transfer.

The S11-D2 baseline under the W2 window is: five ordinary consult days from W2's first record. The "ordinary" half remains the founder's judgement, as the session's recommendation correctly states. The count half restarts at zero.

**Q-M5 — Does R8-D7's scope survive the election under W?**

The scope requires amendment. It does not survive unchanged.

Under worst-of-K, a resampled rejection cannot recover — any floor among K draws blocks. R8's symmetric fixpoint, in which rejections can recover and winners can be dethroned, was designed for a policy where the operative verdict is a function of the distribution of draws. Under W, the operative verdict is the worst draw. A rejection that produces one floor in K draws is blocked regardless of the other K-1 draws. The recovery path is closed by construction.

The amended scope: R8-D7 applies worst-of-K to the would-be winner population only. A rejection that has already blocked does not enter the sampling layer — it is already blocked. The sampling layer's purpose under W is to catch winners that carry a latent floor the single-draw verdict missed. The scope is therefore: K-sampling of inputs that would otherwise permit, with any floor among K draws blocking. The re-election fixpoint for rejections is removed. The dethronement path for winners remains.

**Q-M6 — Does W oblige K greater than 1?**

K is a cost election for the founder. W does not impose a doctrinal minimum above K=1.

K=1 is worst-of-one. Under W, a single draw that floors blocks. A single draw that does not floor permits. K=1 is fully consistent with the elected doctrine — it is W at its minimal expression. The doctrinal commitment is to the worst-draw rule, not to a specific K. Increasing K increases the probability of catching a latent floor at the cost of additional calls. That is a cost-benefit election, not a doctrinal one.

The practical implication: "no sampling, disclosure carried" is W at K=1. It is not a rejection of W. It is the cheapest implementation of W, with the disclosure that a single draw was taken and any floor would have blocked.

**Q-M7 — Measure first on the live loop before any worst-of-K policy lands?**

Yes. R8 §7 #5's telemetry-first discipline applies.

The closed run measured 24 inputs from a specific population — guardrail rejections and winners from a closed period, under the older engine, on one endpoint. The four limits ride every figure from that run. A worst-of-K policy designed against that population and deployed to the live loop is a policy designed against a population that may not represent the live loop's candidate stream.

The discipline is: measure on the live loop before designing the policy's parameters. This does not mean the election is reopened — W is elected as doctrine and that ruling stands. It means K and any trigger conditions should be designed against live-loop telemetry, not against the closed run's population. Option E — measure first on the live loop — is the recommended next act before any R8-D7 build proceeds beyond K=1 disclosure.

**Q-M8 — R18 boundary for a sampled verdict**

A sampled verdict under W must disclose: that K draws were taken, how many produced a floor, and that the worst-draw rule was applied. It must not carry a confidence scalar — the prohibition on confidence scalars in the live R18 disclosure applies to sampled verdicts as it applies to single-draw verdicts.

The published sentence "treat one call as one draw" requires amending to reflect that under W, K calls are taken and the worst draw is operative. The amendment should state the rule plainly: K draws are taken; any floor among K draws blocks; the operative verdict is the worst draw. The number of draws and the number of floors are disclosed alongside the verdict. No confidence scalar is derived from the draw distribution.

The R18 update requires founder sign-off on three live public surfaces. This ruling does not pre-empt that. It states what the update must and must not claim.

---

*End of verbatim ruling.*

## Recording notes (the executing session's, not the ruling's)

- **Nothing is built, activated, flipped, deployed or pushed on this ruling.** It licenses no code.
  R8-D7 remains a design item; the S11-D2 build remains sequenced (now: five ordinary consult days
  from the W2 window's first record); any R18 amendment under Q-M8 is a future founder-signed act
  that applies only when a sampled verdict is actually served — no sampling layer exists today.
- **The W2 window's clock has NOT started.** Q-M3 makes the standing-runner design work eligible to
  start it; the first such sitting is the founder's to open under a Q-S2-conforming prompt (name the
  work, never the observation). **This session did not open it and is the wrong author for that
  prompt.**
- **Q-M8's "treat one call as one draw" sentence is left as published** — it is true of the live gate
  today (W at K=1, Q-M6). The amendment is owed if and when K>1 is served.
- **Documentation drift named by Q-M1** ("scoped-for-ruling, relay pending"): corrected this session
  in the drafted opener's `Q-D2-ENGINE` row and by a dated line on the window specification; the
  2026-09-12 summary close is left as written (a close is a dated record).
