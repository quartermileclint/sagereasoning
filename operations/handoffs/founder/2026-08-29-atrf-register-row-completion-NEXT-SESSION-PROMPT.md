# Next-session prompt — complete the ATRF row of the named-input register

**Paste this as the task after the standing session opener.** Tier: `governance`, documents-only.
No code, schema, flag, credential, or public-surface change is licensed by anything in this prompt.

## What this is

The named-input register (`operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md`, §"Named
inputs held for not-yet-opened sessions," lines ~477–506) exists so a question held as a **named
input** to a session that has not yet opened is findable in one place rather than reconstructed
from a dozen producing documents. Its own honest-scope note, written 2026-08-24, says plainly:

> **The ATRF row is a summary, not a verified enumeration** — a `grep "named input"` sweep found
> the phrase across roughly a dozen documents and no session has checked each one's registration
> status. **Completing the ATRF row is owed before that session opens.**

This is the third step of the mentor's ruled Q7 sequence on the five-instruction-family question
set (`operations/agent-circles-2026-08/2026-08-29-mentor-ruling-five-instruction-family-verbatim.md`),
owed **before** the nine-candidate classification and **before** the standing-runner design
session opens:

> *"Third, complete the ATRF row of the named-input register — this is owed before the session
> opens and is not folded into the review. Fourth, run the nine-candidate classification
> separately from the review… Fifth, open the standing-runner design session…"*

**Nothing in this prompt licenses opening the standing-runner session, running the nine-candidate
classification, or building anything.** This session's job is narrower: make the register
accurate, complete, and internally consistent — a documents-only correction pass.

## A genuine complication this session must resolve, not paper over

The register's ATRF row currently reads **"Receiving session: ATRF scoping session"** — but **the
ATRF scoping session already ran and closed on 2026-08-23**
(`D-MENTOR-RULINGS-ATRF-SIXTEEN-ADOPTED-EXECUTED-2026-08-23`; all sixteen questions ruled;
verbatim `2026-08-23-mentor-rulings-atrf-sixteen-questions-verbatim.md`). A register row pointing
at a closed session is exactly the class of stale carry-forward the mentor ruled on 2026-08-19
(`2026-08-19-mentor-ruling-late-arriving-carry-forward-ruled-session-verbatim.md`): **"formally
correct and practically inert… The content is valid. The destination was wrong."** That ruling's
disposition — redirect to the fitting open-or-future session, or hold as a named open connection
if none fits, never voided and never left pointing at a dead target — is the template this session
must apply to every stale row it finds, not just cite as precedent.

So this session is not a pure transcription exercise. For each named input discovered, the honest
question is always: **is its receiving session still open (or not-yet-opened), or did it already
close — and if it closed, where did the input actually land (resolved by a later ruling? absorbed
into a different question? genuinely still homeless)?**

## Step-by-step

**1. Re-sweep for the phrase, and widen the net.** A grep for `"named input"` (case-sensitive,
literal) across `operations/` at drafting time found **44 files**. Re-run it — the corpus has grown
since (this session's own adversarial review, its supporting records, and the five-instruction-
family capture files landed 2026-08-29, after the sweep that produced the 44-file count). Also
sweep for the register's own near-synonyms that may mark the same mechanism without the exact
phrase: `"named as a standing-runner input"`, `"lands as a named input"`, `"carried forward"` +
`"standing-runner"`, `"routed to"` + `"session"`. The register's rule is substance, not exact
wording — a document that holds a question for a not-yet-opened session without using the literal
phrase "named input" is still in scope.

**2. For every hit, classify it — most will not be genuine registrable items.** The phrase
appears in prose that is NOT a registrable named input far more often than it is one: rulings
*discussing* the mechanism itself (like this prompt), documents *citing* an already-registered row,
and incidental uses. Keep only hits where a document is genuinely **holding a question FOR a
specific not-yet-opened (or now-reopened-elsewhere) receiving session** that has no register row
yet, or where an EXISTING row's content, holder, or routing citation has drifted from source.

**3. Check every existing row's currency, not just the ATRF row's completeness.** The register
currently has five rows, all pointing to "Standing-runner design" plus the one stale "ATRF scoping
session" row. Re-verify each of the five "Standing-runner design" rows too — do their "Held in" and
"Routed" citations still resolve to the documents named, and has anything since resolved or
superseded them? (Likely candidates to check first: GS-ATRF-3's status — its endpoint is now built
dark per the ATRF sixteen rulings, does that change what the row says is "held"? The conjectural
entry type ↔ GS-ATRF-4 row — GS-ATRF-4 is now live in production, 2026-08-19; does the row need a
status update reflecting that?)

**4. Resolve the "ATRF scoping session" target.** Determine, per the mentor's 2026-08-19 ruling
template, where each item currently listed under that row actually belongs now that the session
has closed: GS-ATRF-1/-2/-3/-4 (all four resolved or routed by the sixteen rulings —
`2026-08-23-mentor-rulings-atrf-sixteen-questions-verbatim.md` is the authoritative status,
per the five-instruction-family ruling's own Q4); the sufficiency-examination content spec; the
boulesis/normative-gap distinction; S3's mechanism design; S5's agent-profile architecture +
completion-signal design; S8's GS-ATRF-3 build. Some of these were genuinely resolved by the
sixteen rulings (check each against that verbatim record before assuming). Others were explicitly
routed onward — the sixteen rulings' own Q-C2b answer names the **standing-runner design session**
as home for the discriminating-signature question, for instance; verify whether other items from
the old ATRF row were routed the same way and update the register's "Receiving session" column
accordingly, per-item, rather than leaving one row that no longer has a live target.

**5. Register this session's own newly-created named inputs.** The register's rule — *"a session
recording a named input also adds a row here"* — was not honoured in real time by at least two
recent sessions:
   - This session's adversarial review (`2026-08-29-ADVERSARIAL-REVIEW-cybernetic-seven-probes.md`)
     closes with *"Findings land as a named input to the standing-runner design session (ruled
     Q2d)"* and its Leverage Point Summary names several specific unscoped items (election-logic
     resolution; functional-vs-structural novelty; persisted per-cycle proximity delta + circle
     attribution) as design observations for that session — check whether any of these deserve
     their own register row versus being subsumed under the review-as-a-whole entry.
   - The five-instruction-family ruling itself confirmed the Anandkumar, convergence, and Spinoza
     frames as named standing-runner inputs (Q1) and ruled GS-CYB-2's update rule shape (Q8,
     design-with-disclosed-absence) — verify these are reflected in the register, not only in the
     ruling document, per the register's own findability purpose.

**6. Apply the fix.** Rewrite the register table (and its honest-scope note, which should then
say the sweep was completed and dated, not "a summary") so that every row's "Receiving session" is
a session that is genuinely open-or-not-yet-opened, every "Held in"/"Routed" citation resolves to a
real document, and no item from the old ATRF row is left dangling. Where an item's true home is now
ambiguous or contested, do not silently pick one — name the ambiguity and put it to the mentor as
its own question rather than guessing (PR20 discipline: verify mechanism facts at source; do not
infer).

## Standing constraints (apply throughout)

- **PR20** (as twice-amended) — every present-tense mechanism fact about a document's status must
  be timestamp-checked against the decision log or the document itself before this session's own
  record relies on it; a carry-forward naming a target session is checked at drafting time, not
  only at relay.
- **PR19** — if this session's output materially changes what any future session (especially the
  standing-runner design session) will read, an independent adversarial review before this
  session's records are treated as final is the project's standing practice this window (see the
  five-instruction-family and adversarial-review sessions immediately preceding this one for the
  pattern: draft, independently review, fold every confirmed finding, record the fold).
- **Nothing here pre-answers any open question.** GS-ATRF-1..4, GS-CYB-1, GS-CYB-2, §5d, and every
  other named input keep their current ruled/open status exactly as this session finds it —
  correcting *where a question is registered* is not resolving *what the question's answer is*.
- **Concurrency convention:** run `ListAgents` at open; commit path-scoped; never `git add -A`.
- **The Prerequisite Criterion** (manifest, ruled binding 2026-08-29) is engaged only if this
  session's own documents-only work somehow claims a practitioner-facing output — it should not,
  since this is a records-correction task, but note it if any ambiguity arises about whether a
  register entry itself constitutes a "design."

## What "done" looks like

- Every genuine named input discovered by the widened sweep has exactly one register row.
- No register row points at a closed receiving session without either (a) a note that the item was
  resolved by that session's own rulings, with the ruling cited, or (b) a redirect to the session
  the item's substance actually belongs to now, per the 2026-08-19 ruling's template.
- The register's honest-scope note is rewritten to state the sweep is now complete and dated
  (2026-08-29 or later), replacing the "summary, not a verified enumeration" caveat — or, if full
  completion genuinely cannot be achieved in one session, the note says precisely what remains
  unchecked and why, rather than silently dropping the caveat.
- Any item whose correct home is genuinely contested is surfaced as a named question, not decided.
- A decision-log entry records what changed, citing every source re-verified, in the pattern this
  window's sessions have established.
- **Nothing built, activated, or ruled by this session itself** — it corrects a register, and its
  only output besides the register is, possibly, a question for the mentor.

## Then what

On completion, the mentor's Q7 sequence continues: the nine-candidate classification (separate
governance act from the adversarial review; classifies the run's 9 guardrail-rejected candidates
as remediation-shaped or not, per the §6 report's own named gap) — then the standing-runner design
session opens, with the four instruction frames presented together per F5, the seven-probe
adversarial review's findings, and this session's corrected register as its inputs.

## Cross-references

- `operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md` (the register itself, lines ~477–506)
- `operations/agent-circles-2026-08/2026-08-19-mentor-ruling-late-arriving-carry-forward-ruled-session-verbatim.md`
  (the redirect-not-void template)
- `operations/agent-circles-2026-08/2026-08-23-mentor-rulings-atrf-sixteen-questions-verbatim.md`
  (the authoritative ATRF status list)
- `operations/agent-circles-2026-08/2026-08-29-mentor-ruling-five-instruction-family-verbatim.md`
  (Q7, the sequence this session executes step 3 of)
- `operations/agent-circles-2026-08/2026-08-29-ADVERSARIAL-REVIEW-cybernetic-seven-probes.md`
  (the review whose findings need registering per step 5)
- `operations/decision-log.md` — `D-FIVE-INSTRUCTION-FAMILY-RULED-ADOPTED-EXECUTED-2026-08-29`,
  `D-ADVERSARIAL-REVIEW-CYBERNETIC-SEVEN-PROBES-RUN-PR19-FOLDED-2026-08-29`
