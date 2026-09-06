# S11-D2 × the observation window — does "after the baseline" mean MID-window or POST-window?

**SCOPE FOR RULING. Relay-ready.** Prepared by session S5b, `2026-09-06` (dated from `date`).
**This document puts a question. It does not answer it, and it must not be read as recommending
either reading.** Both readings are argued at their strongest below.

**Nothing was built, flagged, or pushed. The window ran untouched. `layer2-mechanisms.ts` was not
edited.**

---

## 1. The question

The D2 ruling's sequencing is binding and is **not** what is in question:

> *"the observation window opens first, establishing a baseline; the engine correction lands after
> the baseline is established, so the correction's effect on the proximity score is observable
> against a known prior state."*

The window opened `2026-09-06T09:44:55Z`. **The open question is what "after the baseline is
established" licenses:**

> **(A) MID-WINDOW** — the correction lands once N days of baseline have accrued, while the window
> continues to record; the window's records then span two tagging regimes and are segmented on read.
>
> **(B) POST-WINDOW** — the correction lands after the window closes; the window measures one regime
> throughout, and the correction's effect is observed later, against the closed window's baseline.

S11-D2 is **blocked either way until this is settled**, because its correction must edit
`website/src/lib/translation-sandwich/layer2-mechanisms.ts`, which the armed byte-identity guard
covers.

**This question is not a re-litigation of the sequence.** The D2 ruling foreclosed reordering
("*not a licence to reorder*"). It is a question about the meaning of a sequence already ruled.

---

## 2. What is already settled and is NOT in question

| Settled | Source |
|---|---|
| The correction is **owed**; D2 does not close with no build | D2 ruling, disposition |
| It lives **at the engine** (`computeVirtueDomains`), not the trust-core boundary | D2 ruling Q4 |
| The corrected tag: **(a)** a circle beyond `self_preservation` **OR (b)** a `natural_relationship` factor | D2 follow-on |
| The `is_kathekon !== null` trigger is **removed as over-broad**, in the same pass | D2 ruling Q2 + follow-on |
| The window **opens first**. Reordering is foreclosed. | D2 ruling; follow-on |
| Part (3) is a **within-consult-population** measure; the guard population is a separate disclosure | part-(3) ruling |
| The window's **duration is set by the consult population** | part-(3) ruling |
| **S11 flip REFUSED; weights BLOCKED; the 0h call is the founder's** | standing |

---

## 3. Facts established at source this session — not quoted from prior records

### 3.1 The guard detects UNCOMMITTED modifications only — and this materially weakens Reading B

`website/src/app/logos/__tests__/human-practitioner-boundary.test.ts` §C binds on
`process.env.GATE1_FALSE_HOLD_CAPTURE === 'true'` and tests `git status --short` against `GUARD_RE`.

Verified live this session: the guard is **armed** (the variable is present in the runtime
environment) and **non-vacuous** (appending one line to `guardrail-sandwich.ts` produced exactly one
failure naming that file; restored, tree clean, 249/0).

**But its coverage is uncommitted edits only.** The test's own header says so:

> *"The git guard sees UNCOMMITTED edits only (status vs HEAD)."*

**Consequence, and it cuts against the reading it appears to support:** a
**committed-and-deployed** change to `layer2-mechanisms.ts` would alter the measured instrument
mid-window and the guard **would not detect it**. The guard therefore does not, in fact, enforce a
post-window rule. It enforces "do not leave a measured file dirty in the working tree."

**This matters for how much weight Reading B can place on the guard's existence.** The guard is
consistent with Reading B but does not *establish* it, because it does not actually prevent the thing
Reading B is worried about.

**It also names a trap.** The paste's own advice for the scoping note — *"if you edit it, commit
promptly"* — is, for a *document*, harmless. Applied to `layer2-mechanisms.ts` it would be **laundering
an instrument change through a known coverage gap**: the guard would go green, the window would be
contaminated, and nothing would have caught it. **If Reading A is ruled, the stand-down must be
explicit and recorded — never a prompt commit that merely evades the check.**

### 3.2 §C2/§C2b are unconditional — and `layer2-mechanisms.ts` has no SHA pin

The `stoic-brain.ts` freeze (§C2) and its **SHA-256 content pin** (§C2b,
`fa8895ec949b9f6d2f95b9e941a423a095e9c66abe600a1e13fa1b84469b4928`) sit **outside** the
`if (observationWindowRunning)` branch. They are unconditional and unaffected by either reading.
§C2b's own comment states this per the M1 ruling.

**§C2b closes the committed-edit gap for `stoic-brain.ts` alone.** `layer2-mechanisms.ts` — D2's
actual target — carries **no equivalent pin**. **Whether one should be added is part of this
question**, not a separate matter: under Reading B a pin would make the post-window rule genuinely
enforceable rather than nominal; under Reading A a pin plus a recorded, deliberate pin-update would
be the natural shape of a stand-down.

### 3.3 The correction demonstrably changes in-window records — observed, not predicted

Three organic records have accrued since the window opened. **One of the three would change under
the corrected tag** (full data in the companion health-check document, §5):

```
record [3]  2026-09-06T09:58:36.925Z
  circles   = []                                         <- zero circles
  domains   = ['phronesis','dikaiosyne','sophrosyne']     <- dikaiosyne tagged
  kathekon  = { isKathekon: false, quality: 'contrary' }  <- non-null: the over-broad trigger
```

Corrected: term (a) false (no circles), no evidence of term (b) ⇒ **dikaiosyne would not be tagged.**
The other two records carry genuine beyond-self circles and would be **unaffected**.

**⚠ UPDATED at PR19 fold.** The above was written against a 3-record sample. Re-derived at
`2026-09-06T11:17:56Z` (window age ~93 min, 13 `v4` records = 1 probe + 12 organic): **6 of 12
organic records carry the defect**, the excluded probe carries it too, and **all 13 tag
`dikaiosyne`**. The 6 all show `circles = []` with a non-null `kathekon` — the over-broad trigger
firing on zero other-party evidence.

**This is still not a rate and must not be quoted as one** — n=12, one session, one working style,
~93 minutes, all guard-path/`Bash`. **But it is no longer a single illustrative record.** On this
session's traffic the uncorrected tag is wrong about half the time.

Its significance for this question is twofold: it converts the two-regime split from a theoretical
consequence into a **dated, observed, and non-marginal** one; and it shows the two regimes are
**distinguishable in the recorded fields** — which is the precondition any read-side segmentation
would need.

**Both readings should weigh this, and it does not obviously favour either.** It sharpens Reading B's
contamination concern (the regimes differ on a large share of records, not a rare one) **and**
Reading A's observability rationale (a correction whose effect is this visible is one a baseline can
actually be measured against). **It is offered as evidence for the ruling, not as an argument for
either side.**

### 3.3b ⚠ FURTHER UPDATE at `11:22:53Z` — the defect sits OUTSIDE part (3)'s measured population

Later in the same session the consult population populated (the session switched from Bash heredocs
to the `Edit` tool; companion document §2.1). Re-derived, 13 organic records:

| Population | n | tool | depth | **D2-defect** |
|---|---|---|---|---|
| **guard** | 10 | `Bash` | `""` | **6** |
| **consult** | 3 | `Edit` | `standard` | **0** |

**The mechanism is legible.** Guard-path `Bash` actions extract **zero circles**, so the over-broad
`is_kathekon !== null` trigger tags `dikaiosyne` with no other-party evidence at all. The three
`Edit` consults each extracted `cosmopolis` — a genuine beyond-self circle — so term (a) holds and
the tag is **correct** on every one of them.

**Why this is load-bearing for the ruling, and it is the sharpest fact in this document:**

The part-(3) ruling makes part (3) a **within-consult-population** measure — *"The guard population
is reported separately as a disclosure, not as a denominator."* On the data so far, **the D2 tagging
defect is concentrated entirely in the population that is NOT part (3)'s denominator.**

If that distribution holds, it bears directly on the question:

- It **weakens the contamination argument for part (3) specifically** (B1/B4): a mid-window
  correction that changes no record in the measured population does not split that population's
  regime. Reading A's cost falls.
- It **does not dissolve the contamination argument** (B1 still stands for the **guard
  disclosure**, which the F-3′ ruling requires be reported honestly, and which would then span two
  tagging regimes).
- It **cuts against Reading A's own strongest instrumental point** (A2): if the correction changes
  nothing in the measured population, then landing it mid-window does not make its effect
  *"observable against a known prior state"* **in part (3)'s data** either. The observability
  rationale would have to rest on the guard disclosure.

**The honest limit, stated plainly: n=3 consult records, ~98 minutes, one session, one working
style.** This is **not** a finding about the true distribution and must not be relied on as one. It
is flagged because, if it holds over a real window, it is arguably decisive — and if it does not
hold, that is itself the thing the ruling should want measured before the correction lands.
**Neither reading is asserted on the strength of it.**

### 3.4 The window is 20 minutes old, not a day

The session paste states the window "has been running for roughly a day." It was **~13 minutes** old
at session open and **20.3 minutes** at measurement (window start `09:44:55Z`; the paste's own commit
landed `09:55:25Z`). A context-date artifact.

**Relevance to this question:** the cost of Reading B is the *waiting time*, and that cost is at its
maximum right now. Essentially the entire window lies ahead.

---

## 4. Reading A — MID-WINDOW. The case at its strongest

**A1. The ruling says "opens", not "closes" — twice, in two separate binding documents.**
The principal ruling: *"the observation window opens first."* The follow-on, restating the
unchanged sequencing: *"The build lands after the observation window opens."* Neither says "closes."

**A2. The stated purpose of the sequencing only works if observation continues after the correction.**
The ruling gives the *reason* for the order: *"so the correction's effect on the proximity score is
observable against a known prior state."* Under Reading B the window closes having observed only the
prior state; the correction's effect is observed by some later, unspecified means. Under Reading A
the same instrument observes both sides of the boundary — which is what "observable against a known
prior state" most naturally describes.

**A3. "Baseline established" is not a synonym for "window closed."** A baseline is established once
enough data characterises the prior state. The window's *close* condition is a different thing
entirely — ≥7 days **and** a representativeness break-out (scoping note §5). Reading B silently
equates the two.

**A4. The two-regime consequence is named and its remedy is precedented.** The D2 ruling's own
carried-items section names **"The mid-window regime boundary the sequencing creates"** (verbatim,
as a bolded list-item lead) and points at
**AE-1's read-side S11b boundary segmentation with an excluded uncertainty band** as the precedent.
**That machinery is pointless under Reading B** — a post-window correction creates no in-window
boundary to segment. The ruling would not have named the precedent for a consequence its own
sequencing did not produce.

**A5. The ruling warns against indefinite deferral.** *"This is not a reason to defer the correction
indefinitely. It is a reason to sequence it correctly."* Reading B ties the correction to a window
whose close requires ≥7 days **and** a representativeness break-out that, per this session's §3.3
finding, may take considerably longer — the guard population's narrowness is structurally fixed, so
representativeness must come from a consult population running at 0–99 records/day.

**A6. The guard does not actually enforce Reading B** (§3.1). An argument from the guard's existence
proves less than it appears to.

---

## 5. Reading B — POST-WINDOW. The case at its strongest

**B1. The contamination rule is stated in the window's own governing note, in terms that reach this
edit exactly.** Scoping note §3.2, verbatim:

> *"every guard-bundle edit changes the measured instrument, so the window must open on the new
> instrument state, not span the edits — **a window contaminated mid-flight by instrument edits
> measures neither state.**"*

D2's correction **is** an instrument edit: `computeVirtueDomains` produces
`signals.virtueDomainsEngaged`, a field the buffer records and the classifier reads. §3.3 above shows
it changing a recorded field on live window data. If the rule means anything, it reaches this.

**B2. The M1 ruling armed the guard *for the window's duration*, and the note says so.** Scoping note
§3.3:

> *"the logos byte-identity guard is window-conditional — it re-arms the moment
> `GATE1_FALSE_HOLD_CAPTURE` is set. A mid-window measured-file edit would trip the armed guard.
> **The discipline and the enforcement now point the same way.**"*

Arming a guard that trips on measured-file edits, for exactly the period a measured-file edit is
supposedly contemplated, is self-defeating under Reading A.

**B3. A rate spanning two regimes is the error this project most consistently rules against.** The
buffer's own governing rules already forbid mixing the `v1` records with `v3`/`v4` because they are a
different **extraction** regime. A **tagging** regime split is the same class of defect one layer
down. The P6 amendment's separation requirement — the ground on which the part-(3) ruling refused a
cross-population denominator — forbids a denominator mixing measurement conditions.

**B4. The mid-window change is real, not marginal** (§3.3). It changes `virtueDomainsEngaged`, which
feeds `dikaiosyne` engagement — the axis part (3)'s classifier turns on. A boundary in the middle of
the measured population is a boundary in the middle of the thing being measured.

**B5. The deferral cost is bounded and small.** The window is 20 minutes old with ≥7 days to run.
"Indefinite" is not what Reading B asks for; it asks for one window.

**B6. Segmentation may not transfer.** The AE-1/S11b precedent (A4) segmented on the **read** side of
records already written. Here the edit changes what is **written**. Whether read-side segmentation
rescues a write-side regime change **is not established**, and treating the precedent as
load-bearing assumes the answer. **This is the sharpest sub-question in the whole matter** — see §7.

---

## 6. What each reading would require operationally

**If Reading A (mid-window) is ruled**, three things follow and **their shape is part of the
question**, not a matter for a build session to settle alone:

1. **A founder-directed, recorded guard stand-down.** Note that **the obvious mechanism is
   unavailable**: unsetting `GATE1_FALSE_HOLD_CAPTURE` to disarm the guard would **also stop
   capture** — it is the same flag. Disarming by that route ends the window. The remaining shapes:
   - an **explicit, scoped, expiring allowlist** in the guard for the specific D2 files, landed as
     its own reviewed change and removed after; or
   - a **recorded founder waiver** for a named commit, with the guard left armed and the exception
     documented rather than encoded.
   **What must not happen is a silent "commit promptly" that merely evades the check** (§3.1).
2. **A defined baseline threshold** — how many days/records constitute "the baseline established."
   Neither ruling sets a number.
3. **A segmentation design**, and first an answer to §7's question about whether segmentation
   transfers at all.

**If Reading B (post-window) is ruled**, two things follow:

1. **S11-D2 does not open until the window closes** — ≥7 days **and** the representativeness
   break-out. Given §3.3, the founder should expect this to be governed by consult accrual, which
   this session found highly variable (0–99/day).
2. **Consider a SHA-256 content pin on `layer2-mechanisms.ts`** (§3.2), so the post-window rule is
   actually enforceable rather than nominal — the guard alone does not detect a committed edit.

---

## 7. The sub-question that may decide it, surfaced explicitly

Both readings agree the correction changes what the instrument writes. They divide on whether that
can be handled after the fact.

> **Does read-side segmentation, of the AE-1/S11b kind, actually rescue a mid-window change to what
> is WRITTEN — or does it only work for a change in how already-written records are READ?**

The AE-1 precedent segmented a **read** over records whose content was fixed. D2 changes the content
of records written after the boundary. If segmentation transfers, Reading A's principal cost is
largely answered and A4 stands. If it does not, B1's *"measures neither state"* applies with full
force and Reading A's own named remedy is unavailable.

**This session did not attempt to answer it.** It is flagged because both readings currently assume
opposite answers without either being established.

---

## 8. What this document does not decide, and what it did not do

- **It does not choose a reading.** That is the mentor's, on the founder's relay.
- **It did not edit `layer2-mechanisms.ts`**, or any file matching `GUARD_RE`. Tree clean at open,
  throughout, and at close; the guard battery is green (249/0) and was mutation-verified non-vacuous.
- **It did not build the D2 correction**, set or unset any flag, or push.
- **It did not compute B4's post-remedy guard rate** — the ≥`2026-09-08 UTC` gate stands.
- **It did not stop, pause, or otherwise disturb the window**, which ran throughout.
- **The 1-of-3 figure in §3.3 is an illustration, not a rate.**

**The S11 flip remains REFUSED. Weights remain BLOCKED. The 0h call remains the founder's.**
