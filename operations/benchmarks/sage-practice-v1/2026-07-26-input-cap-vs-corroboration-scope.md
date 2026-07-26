# The `/api/reason` Input Cap vs the Outbound-Artifact Rule — Investigation + Design

**Date:** 2026-07-26. **Tier:** `code-elevated` — investigation and design only. **No code path changed, no flag set, no schema, no deploy, no live call.** Production is byte-equivalent.
**Origin:** the P2 Fable-5 rerun's §5.2 task-fit finding (`operations/agent-org-2026-07/runs/2026-07-25-rerun/verdict-memo.md`), carried as a named engineering follow-up by `D-AGENT-ORG-P2-RERUN-VERDICT-2026-07-26`.
**Filed here** rather than under `agent-org-2026-07/` because the conclusion is not a program finding but a **scope finding about the corroboration check** — it belongs beside `2026-06-27-gaming-robustness-bar-scope.md`, where the A2 structural residual it bears on is defined.
**Empirical companion:** `website/scripts/input-cap-fragment-probe.ts` (pure, repo-only, re-runnable).

---

## 0. Summary

Four questions were asked. All four are answered, none deferred.

| Question | Answer |
|---|---|
| Why 5,000? | **Answered — inherited, not considered.** A generic security-hardening tier vocabulary added whole on 2026-03-26; `/api/reason` binds `input` to the tier labelled *"context, reflections"* while the tier labelled *"documents, conversations"* already exists at 15,000. |
| What does raising it touch? | **Mapped.** R20a is the Critical surface but is precedent-covered (two perimeter routes already run at 15,000 and 30,000). The real coupling is **Layer 1's undefended 4,000-token output budget**. |
| Does truncation leave the corroboration check examining a fragment? | **Yes — confirmed empirically, with a live negative control.** It fails **silent-permissive** on its primary detector. |
| Recommendation | **Split the fix.** Land the disclosure correction first (documents-only, closes an R18 gap on its own), then raise the tier paired with a Layer-1 truncation defence (Critical, founder-walked), and scope the chunked path separately only if it carries cross-chunk corroboration state. |

**The headline is not the cap. It is that the cap reaches the disclosed A2 structural residual without anyone lying** — via a limit the product imposes, does not publish, and its own harness already works around.

---

## 1. The collision, grounded first-hand

Every citation below was re-verified in this session; none is carried forward from the predecessor's prompt.

| Fact | Location |
|---|---|
| `input` capped at `TEXT_LIMITS.medium` | `website/src/app/api/reason/route.ts:947` |
| Same cap on `context`, `domain_context`, `clarification_response` | `route.ts:949`, `:951`, `:976` |
| `medium: 5000` · `long: 15000` · `document: 30000` | `website/src/lib/security.ts:208–217` |
| Harness truncates to 4,800 + marker, built *around* the cap | `harness/gate1-pre-decision/claude-code/hooks/lib/framing-core.mjs:43–51` |
| Protocol rule 1c — "that document's full text exactly as it would ship" | `operations/agent-org-2026-07/runs/2026-07-25-rerun/leg-b/FOUNDER-RUN-INSTRUCTIONS.md:65` (repeated at :97, :129) |

The harness comment at `framing-core.mjs:37–42` is worth quoting, because it shows the trade-off was already met once and settled in the opposite direction from rule 1c:

> *"4800 leaves headroom for the truncation marker. HEAD-anchored: the opening of a task/command carries the intent; the alternative (no truncation) was an honest 400 and NO examination at all."*

That reasoning is sound for a **command**, where the opening does carry the intent. It is unsound for a **document**, where the opening carries the preamble and the commitments sit in the body. Rule 1c asks for documents; the harness was tuned for commands. The P2 run is where those two met.

---

## 2. Provenance — answered, and it is not a considered limit

`TEXT_LIMITS` entered the codebase whole, in a single commit:

```
aeadbd1  2026-03-26  Security: add rate limiting, auth, CORS, and security headers
```

All four tiers were authored together, with descriptive labels, as generic input hardening. **No cost model, latency budget, Layer-1 context budget, or abuse analysis is attached to the number 5,000** — not in the commit and not in a comment.

**Correction, made in this session's own closing review after the claim was checked rather than assumed.** An earlier draft of this section also said "not in the decision log." That is too broad, and the decision log turns out to hold two entries that matter here — both of which *strengthen* the finding rather than weaken it:

- **`decision-log.md:13023` (2026-07-07, the `score-conversation` R20a wiring).** An adversarial review deliberately chose `DISTRESS_SUBJECT_FIELD_CAP = 15,000` — *"the TEXT_LIMITS.long posture"* — and **disclosed its residual in writing**: *"distress past the first 15,000 chars of one field doesn't reach the classifier (the same posture as every sibling)."* So the tier vocabulary **has** been reasoned about deliberately, once, on a sibling route — and when it was, the reviewer's instinct was to **name the invisible tail out loud**. That is precedent for §7 step 1, not an argument against it: the project has already recognised that a per-field cap creates a silent-tail residual, and has already judged that the honest response is to disclose it. The corroboration check has the identical structure and **no such disclosure**.
- **`decision-log.md:13811` (2026-07-11, Trust Layer S9b).** The 5,000-char cap was **hit and worked around three weeks before P2 hit it again** — *"the H1/guard http-400 class closed — both server fields cap at TEXT_LIMITS.medium 5000, verified"* — and the resolution was the client-side `truncateForServer` this document quotes in §1.

**What survives, narrowed to what was actually checked:** `/api/reason`'s *own* tier selection is nowhere reasoned about. The cap has now been **encountered three times** (S9b 2026-07-11; P2 S1 and S3, 2026-07-25) and the response each time was a client-side workaround — tighten, truncate, or chunk. **Nobody asked whether the tier was right, and nobody asked what the truncation did to the check reading the text.** That is the more precise and more damning version of "inherited", and it is the version this document now rests on.

The labels are the tell:

```ts
/** Medium text fields (context, reflections) */
medium: 5000,
/** Long text fields (documents, conversations) */
long: 15000,
```

`/api/reason`'s `input` — the field an agent submits a *document* to — is bound to the tier labelled for *reflections*. The tier labelled for *documents* already exists, is already used, and is 3× larger.

**This is a tier-selection defect, not a tuning question.** `medium` is the copy-paste default across ~40 call sites; `long` and `document` are used only where someone stopped to think (`score-conversation`, `score-document`, `founder/hub`). Nobody stopped to think at `/api/reason`, because when the cap was set `/api/reason` was not yet a surface agents submitted artifacts to.

---

## 3. Blast radius

### 3.1 R20a / AC5 — the Critical surface, but precedent-covered

`/api/reason` is a route-level member of the distress perimeter (`src/lib/__tests__/r20a-invocation-guard.test.ts:68`, inside `HUMAN_FACING_POST_ROUTES`). Raising `input` raises what the classifier processes, which makes any live change **Critical under AC5 + PR6** — a founder-walked step, not an Elevated one.

But the risk is not novel. Two routes **already in that same registry** run larger today:

- `score-document/route.ts:106` — `TEXT_LIMITS.document`, **30,000** chars
- `score-conversation/route.ts:111–119` — `TEXT_LIMITS.long`, **15,000** chars *per field*, with the R20a subject composed from the raw fields (`src/lib/score-conversation-r20a.ts`)

So a 15,000-char `/api/reason` input would sit **at** one live perimeter precedent and **below** another. The classifier itself imposes no bound of its own — `detectDistressTwoStage` (`r20a-classifier.ts:227`) passes the full text to the stage-1 regex and, on a miss, to the stage-2 Haiku call, whose `max_tokens: 150` bounds the **output** only. Stage-2 input cost scales linearly and is negligible at Haiku pricing; stage 2 runs only when the regex misses.

**Assessment:** genuinely Critical to change, genuinely routine to walk. The precedent is the argument.

### 3.2 Layer 1 — the real coupling, and the one that must ride along

`extractFeatures` calls Sonnet with `max_tokens: 4000`, temp 0.2 (`layer1-extractor.ts:1865`). Input scaling is cheap — 15,000 chars ≈ ~3,750 tokens, a fraction of a cent.

The problem is the **output** budget. A longer document yields a longer extraction JSON: more circles, more kathekon factors, more causal-stage evidence. **Layer 1 has no `stop_reason === 'max_tokens'` truncation defence.** Layer 3 has one, added deliberately at M1-CP5e (`layer3-prose.ts:821–831`); Layer 1 has nothing — a grep for `stop_reason` in `layer1-extractor.ts` returns zero hits. A truncated JSON reaches `extractJSON`, which throws, surfacing as the named `'layer1_throw'` engine-unavailable reason (`parallel-run.ts:344`).

The failure **direction** is safe — fail-honest, not fail-open. The failure **economics** are not:

> Today an over-long input is a **free 400 at the door** (`isBillable: false`). Raise the cap without touching Layer 1, and the same document becomes a **billed mid-call extraction failure** after a Sonnet call has already been paid for.

**Raising the input cap without a paired Layer-1 output defence is a regression, not a fix.** This is the one hard coupling in the whole analysis.

### 3.3 Loop metering / billing — clean

No type or magnitude exposure. The S9b defect class (`loop-billing-rpc-integer-uuid-contract`) was a **type** mismatch — a string `loop_id` on a UUID column, a float cost on an INTEGER param. A character-cap change alters neither type. Token counts (~4k) and sub-cent costs sit three orders of magnitude inside INTEGER. **Nothing to do here.**

### 3.4 The `l1_supply` path — where the defect bites hardest

Both `input` guards (`route.ts:937` presence, `:947` length) are unconditional and precede every branch, so the cap applies identically on `l1_supply`. Confirmed.

That matters more than it first appears. On `l1_supply` the server **skips extraction entirely** (memory: `l1-supply-skips-extraction-context`), so the corroboration check is the *only* thing reading the submitted text. The code comment at `parallel-run.ts:796–800` states the design intent outright:

> *"works identically on the l1_supply path — **the input text is always required**, so the check reads (schema, text) downstream of extraction"*

The guarantee rests on `input` carrying the text the schema describes. **The cap silently breaks that assumption for any artifact over 5,000 characters** — on exactly the path the S0a activation record names as the Arm-B naive-lie defence.

### 3.5 Public contract — the cap is **not** published

Grepped all three R18 surfaces. `llms.txt` describes `input` semantically only (`llms.txt:106`); the only published character limit is **`clarification_response` ≤5000**, a different field, documented on all three surfaces.

**Consequence:** raising the `input` cap is a widening of an *unpublished* server-side constraint — **not a breaking change to a published contract.** That materially lowers the R18 friction on the fix. It also means an agent can discover the limit only by receiving a 400, which is its own honesty problem (§5).

---

## 4. The hypothesis — confirmed, empirically, in the unsafe direction

**Asked:** does truncation or chunking leave the corroboration check examining a fragment, such that an agent could satisfy the protocol while defeating the mechanism **without ever lying**?

**Answer: yes.** Established by code reading, then demonstrated by execution.

### 4.1 The mechanism

The check reads `params.input` verbatim as its `actionText` (`parallel-run.ts:803`). Its own defensive cap is **50,000** characters (`corroboration-check.ts:182`) — **10× the route cap**, so the check is never the binding constraint. The route is.

The load-bearing detector is domain-level dikaiosyne (`corroboration-check.ts:~596`):

```ts
const dikaiosyneOverride: 'none' | 'floor_reflexive' =
  harmStands && !anyCircleFloors ? 'floor_reflexive' : 'none'
```

`harmStands` derives **entirely** from markers found in `actionText` (`rawHarm` ← `sentenceWindows(actionText)`). No harm text submitted ⇒ `harmStands === false` ⇒ **no contradiction raised** ⇒ a claimed `met` passes unchallenged, and the assessment is **signed** carrying `any_contradiction: false`.

This is the **silent-permissive** direction. It is not the conservative failure other detectors exhibit (the `examined_before_acting` path returns `uncorroborated` on absent evidence — safe). Catching a false `met` is this detector's entire job, and truncation removes exactly the evidence it needs to do it.

### 4.2 The demonstration

`website/scripts/input-cap-fragment-probe.ts` — helpers lifted verbatim from the shipped suite, one 18,463-character artifact with the harm predicate at char 9,181, extraction claiming `met` on the harmed circle:

| Submission | Chars | Harm in text | `dikaiosyne_override` | Proximity |
|---|---|---|---|---|
| **A.** Full artifact (rule 1c as written) | 18,463 | yes | `floor_reflexive` | `sage_like` → **`reflexive`** |
| **B.** `truncateForServer()` — harness path / S1 | 4,878 | no | **`none`** | `sage_like` → **`sage_like`** |
| **C.** Harm-bearing chunk alone — S3 path *(control)* | 4,800 | yes | `floor_reflexive` | `sage_like` → **`reflexive`** |
| **D.** Chunk 1 alone | 4,800 | no | **`none`** | `sage_like` → **`sage_like`** |

**A four-rank swing on one document, one schema, one honest self-report — decided entirely by what the cap let through.** C is the negative control: the detector is provably alive on this exact text, so B's `none` is not a dead fixture.

### 4.3 Why this is a mechanism finding, not an ergonomics one

The shipped suite's own header documents the failure class it accepts (`corroboration-check.test.ts` §7):

> *"an internally-consistent lie (the A2/Arm-B-consistent class: **harm scrubbed from the text**) is NOT caught (documented, expected — the disclosed weights-tier residual)"*

That residual was scoped as requiring a **dishonest agent** who scrubs harm — and it is the residual on which `weights BLOCKED` currently rests (`2026-06-27-gaming-robustness-bar-scope.md`; memory `gaming-robustness-extraction-trust-locus-split`).

**The cap reaches the identical structural condition for an honest agent.** No deception, no adversary — a truncation the product forces, does not disclose, and its own harness performs automatically. That promotes the finding from *fit defect* to *scope defect*, and it is why §5 is not optional.

**One scoping bound, stated honestly:** this widens the *innocent reachability* of an already-disclosed residual. It does **not** enlarge the residual's ceiling, and it changes nothing about the weights-tier disposition — that was already BLOCKED on the adversarial form, which is strictly worse. Chunking is also better than truncation on the harm-detection axis specifically: the harm chunk is eventually seen (case C). What chunking breaks is the **pairing** — a `met` claim submitted with chunk 1 is corroborated against chunk 1 only, since each call carries its own extraction and its own report with no cross-chunk state.

---

## 5. The R18 consequence — the disclosure is incomplete, independent of any fix

The live `llms.txt:150` claim reads:

> **"Corroboration check (extraction-trust — self-report claims cross-referenced against your text)"** … *"cross-referenced against the verbatim submitted text"* … **"Honest scope:** the check corroborates self-report claims against the submitted text only — it does NOT verify facts about the world, and it cannot catch a harm that is **omitted from the text entirely** (the disclosed structural residual)."

Read strictly, *"against the submitted text"* is **accurate**. Two things are nonetheless wrong with it:

1. **The headline says "your text."** An agent submitting a document reads that as *my document*. Nothing on any public surface tells it that the product will silently accept a fragment of that document as though it were the whole.
2. **The residual is framed as an adversarial class.** *"Omitted from the text entirely"* reads as deliberate scrubbing. It does not disclose that the product's own undocumented 5,000-character limit produces the same condition for an honest agent — with no warning at the boundary, since the limit is discoverable only by receiving a 400.

**This is a disclosure defect that exists today, on the live surface, whatever is decided about the cap.** It is documents-only, touches no perimeter and no engine, and should not wait behind a Critical change.

---

## 6. Options

### (a) Raise the tier for the reasoning path — `medium` → `long` (15,000)

- **For:** uses the existing vocabulary; the label already says *documents*; precedent-backed by two live perimeter routes (§3.1); covers the realistic document range (2 of the P2 run's 3 documents fit; the third is 20,620).
- **Cost:** Critical under AC5 (§3.1). **Must be paired with a Layer-1 truncation defence** (§3.2) or it trades a free 400 for a billed failure. Should publish the new limit (§3.5).
- **Honest limit:** a **mitigation, not a fix** — it moves the boundary, it does not remove it. A 30,000-char document still truncates, still silently.

### (b) A first-class chunked or streamed examination path

- **For:** the only option that actually examines arbitrarily long artifacts, and the only one that can restore the claim/contradiction pairing case D breaks.
- **Cost:** a substantial new surface — cross-chunk corroboration state, a new public contract, and a decision about what a signed assessment covers when the text arrived in pieces. Interacts with the accreditation chain.
- **Hard condition:** **worth building only with cross-chunk corroboration state.** A chunked path without it reproduces case D exactly — 18 individually-clean reports over a document that is not clean — while *looking* like a fix. That would be worse than the status quo, because it would carry the appearance of thoroughness.

### (c) Leave the cap; change protocol rule 1c to a bounded faithful extract

- **For:** free; no server change; no Critical step.
- **Against — and this is disqualifying:** the extract would be **selected by the agent whose self-report is being corroborated.** That hands the sampling frame to the party under examination, converting an innocent blind spot into an **agent-controlled** one — moving the finding *toward* the adversarial A2 class rather than away from it. **Recommend rejecting.** (Worth stating explicitly, since it is the cheapest option and will look attractive.)

### (d) Do nothing, disclosed

- **For:** the disclosure alone is a real improvement — agents currently cannot know the limit exists.
- **Against:** leaves the mechanism defeated for precisely the audience the product targets.

---

## 7. Recommendation — split it, and land the honesty first

**Three steps, in this order, deliberately decoupled so the cheap honest one does not wait behind the expensive one.**

**Step 1 — the disclosure correction. Documents-only, Standard risk, do this first and alone.**
Publish the `input` limit on all three R18 surfaces, and amend the corroboration honest-scope sentence so the residual names *both* routes into it — deliberate omission **and** truncation to fit the limit. This closes a live honesty gap (§5) on its own terms, is independently valuable under every branch below, and requires no perimeter or engine change. **It is the only step this session would recommend proceeding with unconditionally.**

**Step 2 — raise `input` to `TEXT_LIMITS.long`, paired with a Layer-1 truncation defence. Critical, founder-walked.**
Not either half alone. The pairing is the recommendation: a `stop_reason === 'max_tokens'` check in `layer1-extractor.ts` mirroring `layer3-prose.ts:821–831`, and/or a raised Layer-1 output budget, sized against a measured 15,000-char extraction rather than assumed. Precedent makes the R20a walk routine; the Layer-1 half is the part that needs real work. Verification should include a both-directions check that nothing scores *differently* at unchanged input lengths.

**Step 3 — scope the chunked path separately, gated on cross-chunk corroboration state.**
Only if the product genuinely commits to document-producing agents as the target audience. Not this arc; needs its own design session. **Gate it on the state question** — without that, do not build it.

**What this leaves open:** even after Step 2, a sufficiently long artifact truncates silently. Step 1 makes that honest; only Step 3 makes it unnecessary. That is the trade, stated plainly rather than smoothed.

---

## 8. What this session did not do

Per the prompt's Step 5: the elected option touches both the R20a perimeter and the public contract, so **this session stops at design.** No build, dark or otherwise; no flag, schema, deploy, or live call; **PR19's independent adversarial review is therefore not yet engaged** — it engages when Step 2 is built, and the template at `operations/review-harness/independent-review-workflow-template.md` applies then.

The one artifact added to the repo is `website/scripts/input-cap-fragment-probe.ts` — pure, outside the Next build graph, wired to nothing, and re-runnable so §4.2 can be falsified rather than trusted.

**Not investigated, and named rather than silently skipped:** whether `context` and `domain_context` (also capped at `medium`) deserve the same treatment; whether the ~40 other `medium` call sites include further mis-tiered document fields; and whether the harness's own `truncateForServer` should refuse rather than truncate on a document-class input, which is arguably the more honest client-side posture and is a smaller change than any of the three steps above.
