# Mentor questions — R12, three questions for ruling

**2026-09-14.** Arising from the standing-runner design track's fifth sitting (R12), which authored
the build brief R8 §11.2 and R9 §16.2 both named and neither wrote
(`2026-09-14-R12-standing-runner-build-brief-second-increment.md`).

**Nothing is built, activated, migrated or minted.** The brief authorises nothing, and no answer
below licenses a build — each remains a `code-critical`, founder-walked, PR19-reviewed step.

**What this does NOT ask.** It does not re-open the M/W/S election (W, elected 2026-09-13), the
Option S gate (fully discharged), or any R8-D7 parameter — K, the trigger, vocabulary and the
persistence target remain open by ruling pending the live-loop measurement now running, and this
sitting was designated to exclude them.

**PR20 compliance:** §0 states the mechanisms each ruling would land on, as one-sentence facts about
current behaviour. **Every present-tense fact below was re-verified against source at relay**
(2026-09-14), not carried from drafting. Two facts are marked
recorded-but-not-independently-verified because a repo session cannot read a production environment.

---

## 0. The mechanisms these rulings land on

**Credentials and capabilities.**
1. A practice credential carries a `capabilities[]` set. The full vocabulary is exactly seven values:
   `consult, l1_supply, accreditation_write, calling, reflect, watching_write, completion_signal_write`.
   **There is no read-scoped capability of any kind.**
2. Five of those seven are "write class". A database CHECK
   (`api_keys_sage_assent_write_requires_owner_and_agent`) fires when a credential carries any
   write-class capability, and its predicate requires
   **`agent_id IS NOT NULL` AND `owner_user_id IS NOT NULL` — both.**
3. A capability **outside** that write-class set is subject to no such CHECK, so it can be minted
   with `agent_id` null.
4. **Adding a value to the capability vocabulary extends no database CHECK by itself** — the database
   arrays are hard-coded, so every capability addition has shipped its own founder-walked migration
   widening the closed vocabulary CHECK. Both precedents (`watching_write`, `completion_signal_write`)
   did exactly this.
5. **This project's own standing runner credentials are agent-bound and owner-less by design**
   (`sagereasoning:idea-loop@v1`, `sagereasoning:s9-loop@v1`), which the records classify as
   `external_consumer`. *(Recorded-but-not-independently-verified: the live rows cannot be read from
   a repo session.)*

**The runner's read.**
6. The design requires the runner's cycle-open read to be **scoped to the runner's own loop
   identity**, and the server's only source for that identity is the credential's **`agent_id`**.
   **Owner binding is not something the scoping needs.**
7. The design explicitly forbids authorising this read through `watching_write` — an earlier review
   found that granting read scope through a write capability inverts the mint-level separation
   posture.

**The generation anchor.**
8. The runner's cycle-open read serves, as the generation **anchor**, the *target* agent's
   **public trust-record payload**, reused unmodified and including its honest-claims envelope, read
   server-side.
9. That envelope's own `does_not_attest` list states, among other items, that the record does **not**
   attest **factual correctness** ("it reads how a decision was reasoned, not whether it was
   factually right"), and does **not** attest **harms omitted from the submitted text** — "a
   cleanly-narrated account that omits a real harm scores high."
10. The anchor is **consumed**: it feeds `anchor_basis` and informs which candidate the runner
    generates. Every *other* runner-supplied or runner-read field in the brief is recorded as
    disclosure and read by nothing.

**The guard.**
11. A byte-identity guard binds on a regex-matched set of files whenever the observation-window flag
    is set, and it is **currently armed**. Exactly **one** file in the entire build bundle matches:
    the IDEA-loop store module. Every route handler, the credential module, both data-rights routes
    and every migration file are outside the matched set.
12. **All three of the brief's read paths require that one store module** — it is where the read
    functions would live.

---

## 1. Q-R12-A — how should a loop-scoped read capability be bound?

**The question.** A new read capability is required (§0.1, §0.7). Should the binding its scoping
depends on be enforced at the database, and if so by which constraint?

- **(a)** Add it to the capability vocabulary only, and enforce the agent binding **in the route
  handler**.
- **(b)** Add it to the **write-class** set so the existing CHECK applies.
- **(c)** A **new, narrower CHECK** requiring **`agent_id IS NOT NULL` only**, applied to read-class
  capabilities.

**Why this is a question of principle and not a build choice.** (b) is the path of least new
machinery, and it was this sitting's first recommendation. It is wrong on the facts: the existing
CHECK demands `owner_user_id` as well (§0.2), which the read does not need (§0.6) — and which **the
established runner-credential shape does not have** (§0.5). Under (b), minting the read capability on
a real runner credential **would be rejected**, forcing every runner that needs the read to become
operator-owned — a change to what a runner credential *is*, imposed by a constraint chosen for an
unrelated reason. (a) avoids that but puts the only enforcement in a route handler, which is the
pattern this project's own RLS survey exists because it has been bitten by. (c) enforces exactly the
binding the design requires, at the database, with no side effect — at the cost of a second
constraint where one existed.

**The session's recommendation: (c).** Not decided; put here.

**A consequence the founder should have in advance, whichever way this goes:** per §0.4, resolving
this **necessarily produces a second migration**, separate from the brief's single bundled migration
window. The brief discloses that as a deliberate exception to the one-window discipline — the
capability migration touches a different table on a different release path, and bundling a mint-side
constraint change with a loop-schema change would couple two unrelated rollbacks.

---

## 2. Q-R12-B — does the window's tolerance of a guarded-file waiver extend to a build?

**Narrowed at relay, because the founder's own designation already settles half of it.** The
standing designation for this observation window states: *"A guarded-file waiver on the measured
checkout is within scope; a worktree is not — work done in a worktree is outside the instrument's
reach."* So the question is **not** whether a waiver is permissible in principle during the window.

**What remains genuinely open.** That same designation scopes this window's work to **design
authoring**. The brief's read paths are not design authoring — they are a code build, and all three
require the single guarded store module (§0.11, §0.12). So:

**Does the window's admission of guarded-file waivers extend to a code build on the measured
checkout, or is it confined to the authoring work the designation names?**

**Why it matters and is not merely procedural.** The two available routes are not equivalent for the
instrument. A waiver keeps the work on the measured checkout, so the window sees the consult and
guard records it generates — at the cost of a recorded exception to a guard that exists to protect
measurement integrity. A worktree preserves the guard untouched but places the work **outside the
instrument's reach entirely**, which is the shape the W2 build took and which the record says
produced nothing. **Either answer costs something real**, and the choice determines whether the
brief's read paths can be built during the window at all or must wait for it to close.

**No recommendation offered.** This is a question about the window's own discipline, and the sitting
that would benefit from the permissive answer is not the right one to argue for it.

---

## 3. Q-R12-C — is the honest-claims envelope sufficient when the record is *consumed* rather than displayed?

**The question.** The generation anchor serves one agent's public trust-record payload to *another*
agent, where it informs what that agent generates (§0.8, §0.10). Is the honest-claims envelope
travelling with the payload sufficient to keep this from becoming a virtue score one level removed —
substituting another agent's already-computed assessment for the runner's own examined engagement
with the target?

**Why the standard disposition does not obviously settle it.** The Prerequisite Criterion asks
whether a design produces outputs resembling wisdom without building the prerequisite for it. On the
**output** question this passes cleanly: it is the same public surface, unmodified, envelope intact,
read server-side — it produces no new assessment. Every other Prerequisite-Criterion row in the brief
also passes on a second ground: the field is **recorded and read by nothing**. **This row cannot
claim that.** It is the one place in the whole design where an assessment of an agent is *consumed*
by a reasoning process, and the only place where information about a different agent identity is
routed to the runner at all.

**The sharpest form of the concern, stated against the envelope's own text.** The envelope declares
that the record does not attest factual correctness and cannot catch a harm omitted from the
submitted text — a cleanly-narrated account that omits a real harm scores high (§0.9). A *human*
reading that disclosure can hold the number loosely. **An agent consuming the payload as an anchor
receives the disclosure as a field in a JSON object**, and nothing in the design requires it to
reason about the disclosure before reasoning from the score. The brief's answer is that the envelope
is what keeps this honest **because it travels with the payload**. That is a claim about the
envelope's adequacy under machine consumption, and the sitting could not establish it — only assert
it.

**Two readings the ruling might take, offered so the question is answerable rather than open-ended.**
Either the envelope is sufficient because the runner is an examined practitioner operating under the
same instrument and the disclosure is genuinely present; or a consumed record needs something the
displayed record does not — for example, the anchor carrying only the coverage and confidence state
without per-domain levels, or the runner being required to record its own engagement with the target
before the anchor is served.

**The session's recommendation: none.** It has a stake in the simpler answer and says so.

---

## 4. What no answer here licenses

No answer authorises a build, a migration, a flag, a mint, a capability addition, or a deploy. None
sets an R8-D7 parameter. None resolves the vocabulary-direction question, which remains held open and
owned by no session. **D2 remains blocked. The S11 flip remains REFUSED. Weights remain BLOCKED. The
0h call remains the founder's.**
