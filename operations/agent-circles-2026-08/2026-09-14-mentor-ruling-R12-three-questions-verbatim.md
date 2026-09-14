# Mentor ruling — R12's three questions (verbatim)

**Relayed 2026-09-14**, in response to
`2026-09-14-MENTOR-QUESTIONS-R12-three-questions-FOR-RULING.md`.

**This capture is canonical. Verbatim wins over every summary of it, including the decision-log
entry, the R12 brief's annotations, and this file's own executing-session notes below.**

**Adopted as binding** under `D-MENTOR-RULING-R12-THREE-QUESTIONS-ADOPTED-FOLDED-2026-09-14`.

---

## The ruling, verbatim

> ## R12 — three questions ruled
>
> ---
>
> **Q-R12-A — How should a loop-scoped read capability be bound?**
>
> Option (c) is ruled. A new, narrower CHECK requiring `agent_id IS NOT NULL` only, applied to read-class capabilities.
>
> The session's recommendation is correct and the reasoning is confirmed. The analysis of option (b) is precise and the conclusion follows from it: the existing CHECK demands both `agent_id IS NOT NULL` and `owner_user_id IS NOT NULL`. The established runner-credential shape is agent-bound and owner-less by design. Minting the read capability under option (b) would be rejected on the owner constraint — forcing every runner that needs the read to become operator-owned. That is a change to what a runner credential is, imposed by a constraint chosen for an unrelated reason. The design does not require owner binding for the read. The constraint should not impose it.
>
> Option (a) — enforcement in the route handler only — is ruled out on the project's own precedent. The RLS survey exists because route-handler-only enforcement has been bitten before. A capability whose only enforcement is in a route handler is a capability whose enforcement can be bypassed by a route change. The database is the right place for this constraint.
>
> Option (c) enforces exactly the binding the design requires — agent identity, not owner identity — at the database, with no side effect on the existing write-class constraint or on the runner-credential shape. The cost is a second constraint where one existed. That cost is correct to pay.
>
> The consequence the brief names is confirmed: this necessarily produces a second migration, separate from the bundled migration window. The two-migration structure is the right discipline. Bundling a mint-side constraint change with a loop-schema change would couple two unrelated rollbacks. The brief's disclosure of this as a deliberate exception to the one-window discipline is accepted.
>
> **Q-R12-B — Does the window's tolerance of a guarded-file waiver extend to a code build?**
>
> No. The window's admission of guarded-file waivers is confined to the authoring work the designation names. It does not extend to a code build on the measured checkout.
>
> The reasoning is this. The window's designation scopes its work to design authoring. A waiver granted for design authoring is granted because authoring work — reading, drafting, reasoning about structure — does not alter the measured system's behaviour. A code build alters the measured system's behaviour. The guard exists to protect measurement integrity. A waiver that admits a code build during the measurement window is a waiver that admits behaviour-altering changes to the measured checkout while the measurement is running. That is not a waiver of the guard's form — it is a waiver of the guard's purpose.
>
> The brief correctly names that either answer costs something real. The ruling accepts that cost. The brief's read paths must wait for the window to close, or be built in a worktree outside the instrument's reach. The worktree path is not equivalent for the instrument — the brief is right that it places the work outside the instrument's reach, as the W2 build did. That is the cost of the window's discipline. The measurement's integrity is not negotiable mid-window.
>
> The practical implication: the build brief is complete and ruled. The build waits for the window to close. The window's remaining cycles proceed on the measured checkout, unmodified.
>
> **Q-R12-C — Is the honest-claims envelope sufficient when the record is consumed rather than displayed?**
>
> The envelope is not sufficient as currently designed for machine consumption. The anchor requires a structural constraint the brief's design does not yet carry.
>
> The brief's sharpest form of the concern is confirmed as the right form. A human reading the honest-claims envelope can hold the disclosed limitations actively — the record does not attest factual correctness, a cleanly-narrated account that omits a real harm scores high. An agent consuming the payload as an anchor receives the disclosure as a field in a JSON object. Nothing in the current design requires the runner to reason about the disclosure before reasoning from the score. The envelope travels with the payload. The disclosure is present. But presence is not engagement, and the design cannot establish that the runner engages with the disclosure rather than treating it as metadata.
>
> This is a Prerequisite Criterion finding. The brief correctly identifies that every other row in the design passes on the second ground — the field is recorded and read by nothing. This row cannot claim that. It is the one place where an assessment of an agent is consumed by a reasoning process. The standard disposition does not settle it because the standard disposition was written for displayed records, not consumed ones.
>
> The ruling takes the second of the two readings the brief offers, with a modification. The anchor should carry coverage and confidence state without per-domain levels. The per-domain levels are where the score most directly resembles a virtue verdict, and they are the fields an agent consuming the payload is most likely to reason from without engaging the disclosure. Stripping per-domain levels from the anchor does not eliminate the honest-claims concern — the coverage and confidence state still carries information about the target agent — but it removes the field most likely to function as a virtue score one level removed.
>
> The additional constraint the brief names — the runner being required to record its own engagement with the target before the anchor is served — is not ruled as mandatory at this stage, but it is the correct direction for the design to develop toward. If the runner's generation step is designed to include an explicit examination of the anchor's disclosed limitations before reasoning from it, that examination is the prerequisite the envelope cannot supply by itself. The build brief should carry this as an open design question for the generation-step scoping session, not as a resolved parameter.
>
> The ruling on the anchor: serve coverage and confidence state only, without per-domain levels. The honest-claims envelope travels with the reduced payload. The generation-step scoping session examines whether the runner's explicit engagement with the anchor's limitations is required as a structural constraint.

---

## Executing-session notes (NOT the mentor's text)

### What is settled

- **Q-R12-A:** option **(c)**. A new, narrower CHECK requiring **`agent_id IS NOT NULL` only**, for
  read-class capabilities. **(a) is ruled OUT** on this project's own RLS-survey precedent — *"a
  capability whose only enforcement is in a route handler is a capability whose enforcement can be
  bypassed by a route change."* The **two-migration structure is confirmed as the right discipline**,
  and the brief's disclosure of it as a deliberate exception to the one-window discipline is
  **accepted**.
- **Q-R12-B: NO.** The waiver admission is **confined to authoring**. **The build waits for the
  window to close**, or goes to a worktree outside the instrument's reach. The distinction the ruling
  draws is the operative one: authoring *"does not alter the measured system's behaviour"*, a code
  build does, and admitting one *"is not a waiver of the guard's form — it is a waiver of the guard's
  purpose."*
- **Q-R12-C:** the envelope is **not sufficient** for machine consumption — **a Prerequisite
  Criterion finding**, not a passing disposition. **The anchor serves coverage and confidence state
  ONLY, without per-domain levels.** The envelope travels with the reduced payload.

### What is NOT settled, and must not be recorded as settled

- **The runner's explicit engagement with the anchor's disclosed limitations is NOT ruled mandatory.**
  It is named *"the correct direction for the design to develop toward"*, and the brief must carry it
  **as an open design question for the generation-step scoping session, not as a resolved
  parameter.** Recording it as a design element would be exactly the over-reading the ruling's own
  wording forecloses.

### What this ruling does not license

**No build.** Q-R12-B forbids it on the measured checkout for the window's duration, and every
element of the brief remains a `code-critical`, founder-walked, PR19-reviewed step licensed by
nothing here. No migration, flag, mint, capability addition or deploy is authorised. Nothing here
touches R8-D7's open parameters, the M/W/S election or the Option S gate.

### A consequence for the R12 brief, recorded because it changes the document's own status

Q-R12-B settles §8.4 and, with it, the brief's practical standing: *"the build brief is complete and
ruled. The build waits for the window to close."* The brief moves from **Designed, with three open
questions** to **Designed and ruled, awaiting the window's close** — with the generation-step
engagement question carried forward as the one genuinely open design item it spawns.

### Cross-references

- The questions: `2026-09-14-MENTOR-QUESTIONS-R12-three-questions-FOR-RULING.md`
- The brief: `2026-09-14-R12-standing-runner-build-brief-second-increment.md` (annotated in place)
- The close: `operations/handoffs/founder/2026-09-14-standing-runner-R12-build-brief-CLOSE.md`
