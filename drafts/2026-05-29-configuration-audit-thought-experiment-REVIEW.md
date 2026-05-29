# Adversarial Review — Configuration-Audit Thought-Experiment Findings

**Status:** Drafted 2026-05-29. Under review. Reviewer: Claude (Opus-class), Cowork mode session. Reviewer-recommended next action: Confirm the catalog is worth doing, but do not open Phase 1 as scoped — first settle the sequencing question (generalise now vs finish proving R20a operationally, which is the real 0h/hold-point tension, not PR1) and re-cut the six buckets against the adopted PR14 ten-domain frame with audience as a cross-cutting axis.

**Document reviewed:** `/drafts/2026-05-28-configuration-audit-thought-experiment-findings.md` (the prior session's full findings; read in full).
**Predecessor operational state at handoff:** `/operations/handoffs/founder/2026-05-28-OPTION-A-session-4-audience-rendering-close.md` — Option A Session 4 Wired, Verified, Vercel-green, committed; all four R20a flags UNSET; nothing in flight.
**This review changes nothing.** No code, no governance, no execution. Production state UNCHANGED. The findings document is untouched and remains Under review.

---

## Preamble — method and stance

This is an independent, adversarial review, not collaborative execution. My job was to confirm or challenge the prior AI's analysis cold, and to surface blind spots the prior AI could not see because it generated the work. I did **not** re-verify Option A's S4 code (that is Adopted and out of scope), and I am **not** starting any cataloguing. I read the two protocol caches, the findings document in full, the S4 close, the in-limbo S5 prompt, the design spec §5.5, the manifest's targeted sections (PR1 verbatim, R19, R20a, AC4/AC5/AC11), and the S2/S3/S4 decision-log entries.

Two things to say up front so the challenges below are read in proportion.

First, the prior AI did several things genuinely well. It captured the founder's question and six nominated axes faithfully; it repeatedly and honestly flagged what was unconfirmed (the AEO meaning, the two AI-added buckets, the L1–L7 set, the PR1 "category leap"); it raised a concern *against* the founder's chosen direction and then deferred per founder preference rather than silently complying; and the findings document is structured to invite exactly this kind of challenge. That epistemic honesty is why a useful review was possible at all.

Second, my challenges concentrate on one root pattern: the prior AI built **bespoke** framing (a new six-bucket taxonomy, a new three-phase program, a PR1 framing) where the project already has **adopted** framing that fits the task better (PR14's ten-domain gap-analysis frame; the R14 quarterly compliance cycle; the 0h hold-point discipline). The findings are honest but ungrounded in the project's own machinery. Most of what follows flows from that.

A note on materiality (PR13 reflex): the findings below would change the founder's next decision if known — that is the bar I held them to.

---

## Recommendations at a glance

| Item | Prior AI's position | My verdict | One-line recommendation |
|---|---|---|---|
| **A — Six buckets** | Six buckets; founder's 6 axes + ~20 sub-dimensions + 2 AI-added buckets | **Challenge** | Re-cut against the adopted PR14 ten-domain frame; add **audience** as a cross-cutting axis (it is not a bucket). |
| **B — Four options** | I/II/III/IV; AI preferred III, founder chose I | **Challenge (not exhaustive)** | Two strong options missing: V (use existing PR14/R14 frame) and VI (finish proving R20a operationally first). "Catalog now" and "test all at once" are separable. |
| **C — PR1 meta-tension** | A PR1 tension at the meta level, to be logged as such | **Challenge (mis-attributed)** | PR1 does not literally apply. The real tension is **0h hold-point + evidence-sequencing**. Log it under that, not as a PR1 violation. |
| **D — Three-phase plan** | 3 phases; 6–25 sessions; Phase 1 = one 3–4h session | **Challenge (optimistic)** | A four-phase cut is more honest; realistic total is higher; **L1–L7 enumeration must be a hard pre-condition**, not an open item. |
| **E — Q1–Q4** | Four structural questions | **Confirm they're valid; challenge they're sufficient** | They cover packaging, not substance. The substantive decisions (enumeration, premise-validation, taxonomy frame) sit *outside* Q1–Q4. |
| **F — Eight open items** | Eight background notes | **Challenge weighting** | Items #2 (enumeration), #4 (schedule), #8 (backout) should be founder decisions, not background. #4's "implicit acceptance" is too generous. |
| **G — Patterns** | — | **Three patterns present** | Prescribe-before-grounding (mild); narrow-unit-of-analysis (ironically, re-merged the audience split); scope-expansion bias; failure to reuse adopted frames. |
| **Q1 — S5 prompt** | Delete / supersede / revise | **Keep, mark superseded** — *but contingent on Q6* | Retain as the seed for the eventual R20a propagation test; don't delete; don't revise into a catalog prompt. |
| **Q2 — Buckets right?** | Options incl. "all six in" | **Reorganise** | Reconcile to PR14 + audience axis (see A). |
| **Q3 — Output shape** | Matrix / per-dimension / both | **Matrix only, in `/drafts`, as a skeleton first** | "Both" doubles work prematurely; defer per-dimension docs until a dimension is picked. |
| **Q4 — Session boundary** | Fresh / continue / scope-only | **Fresh session** — *moot if Q6 redirects* | Sound, but only relevant if cataloguing proceeds. |
| **NEW Q5 — L1–L7 enumeration** | (open item #2) | **Decide first** | The matrix rows. Nothing can be catalogued without it. |
| **NEW Q6 — Premise-validation** | (implicit in PR1 tension) | **Decide first** | Generalise now, or finish S5 + C2 live + one activation first? This reframes Q1, the schedule, and the backout. |
| **NEW Q7 — Taxonomy frame** | (the six buckets) | **Decide before Phase 1** | PR14 ten-domain vs the six bespoke buckets vs a reconciliation. |
| **NEW Q8 — Audience axis** | (absent) | **Decide before Phase 1** | Is the catalog configs × dimensions (grid) or configs × dimensions × audience (cube)? |
| **NEW Q9 — Backout tripwire** | (open item #8, unscoped) | **Define before Phase 1** | A concrete condition that drops Option I back to IV or VI if Phase 1 over-runs. |

---

## Section A — The six buckets

**Verdict: the bucketing is honest but ungrounded, and it has one structural error that matters.**

### A.1 — The structural error: audience is an axis, not a bucket

The single most important finding in this review. The prior AI's **Bucket 4 (Output surfaces)** folds "agent reporting opportunities," "human user outputs possible," and "developer dashboard" together under one question — "who sees what, when, in what shape?" But "human user outputs" and "agent reporting" are the *same human-vs-agent split that Option A spent five sessions separating* (`audience: 'human_user' | 'agent_developer'`). Bucket 4 quietly re-merges the very distinction Option A existed to pull apart.

Worse, the standing protocol cache's failure-mode table names this exact pattern — "Narrow unit of analysis … Misses the audience dimension (human user message vs agent developer notification)." The prior AI committed a version of that pattern while analysing the work that fixed it.

The correction is not to add a bucket. It is to recognise that **audience cross-cuts every bucket**: pricing differs by audience (a human practitioner vs an agent operator's bill), security exposure differs by audience, discoverability is inherently agent-audience, outputs differ by audience. The catalog the prior AI proposes is a grid (configurations × dimensions). Option A's whole lesson is that each cell may itself split by audience. **The catalog is a cube — configurations × dimensions × audience — not a grid.** The prior AI did not surface this, even though it is the direct generalisation of what Option A did. (This becomes proposed **Q8**.)

### A.2 — The grounding failure: the project already has a gap-analysis frame

This thought experiment is a gap-analysis. The project already has an **adopted** gap-analysis frame: **PR14**, which mandates surfacing gaps across ten default domains (Security; Regulatory + compliance; Accessibility; Privacy by design; Observability + SRE; Legal entity + tax structure; Insurance; Marketplace economics + dispute resolution; Onboarding UX; Anthropic-native capabilities). The prior AI built a fresh six-bucket taxonomy from the founder's six axes and **never referenced PR14 at all.** That is a missed reuse and a source of drift.

Mapping the six buckets onto PR14's ten domains exposes concrete gaps:

- **Accessibility (PR14 #3)** — buried as a single word inside the Bucket 5 grab-bag. Yet `CR-EAA-WCAG-AA` is an **ESCALATED** compliance item in the manifest register. Under-weighted.
- **Privacy by design (PR14 #4)** — only partially present inside Bucket 2. R17 intimate-data protections (application-level encryption, genuine deletion, SAR/rectification/portability) are major and genuinely per-configuration (which flows touch intimate data?). Not named as its own concern.
- **Onboarding UX (PR14 #9)** — buried in Bucket 5 as "onboarding + first-call developer experience."
- **Anthropic-native capabilities (PR14 #10)** — absent. Per PR15 this must always be considered; the discoverability bucket is adjacent but the Anthropic primitives (skills, MCP, plugin discovery) are not surfaced.
- **Insurance (PR14 #7)** — entirely absent. Probably cross-cutting rather than per-configuration, which is a defensible reason to exclude it — but the exclusion should be *named*, not silent.

So a check against the project's own adopted frame surfaces at least four under-weighted or missing domains. This is the kind of blind spot an independent reviewer should catch, and it is findable precisely by doing what the prior AI skipped: reconciling against existing governance. (Becomes proposed **Q7**.)

### A.3 — Bucket 2 collapses four PR14 domains into one

"Security + compliance" merges what PR14 splits into four (Security #1, Regulatory+compliance #2, Accessibility #3, Privacy-by-design #4). Technical security (injection, multi-tenancy isolation, auth) and regulatory compliance (GDPR Articles 15/16/17/20, EU AI Act Article 50, EAA/WCAG) are different workstreams with different owners, expertise, and cadences — and compliance is *already* tracked per-obligation on a quarterly R14 cycle in the manifest's `compliance_register`. Folding compliance into a "security audit pass" risks both duplicating R14 and implying compliance is a per-configuration property when much of it is org-wide (a privacy policy, a deletion endpoint, an accessibility standard apply across the product, not per-flow).

### A.4 — Bucket 5 is a catch-all that buries high-severity items

Bucket 5 (Operational resilience) contains failure modes, degradation, persistence/memory, R17c right-to-delete, onboarding DX, accessibility, *and* composability. That is not one bucket — it is five concerns swept together because they "weren't on the founder's list." Operational resilience proper (failure modes, degradation, observability) is legitimate and important (it is PR14 #5). But the bucket is mis-scoped: it **buries an ESCALATED compliance item (accessibility) and a Critical GDPR obligation (R17c genuine deletion, currently a PARTIAL 503 placeholder) under a low-urgency label.** Those belong in compliance/privacy, where their severity is visible.

### A.5 — Bucket 6 confuses an audit dimension with a work program

The K-category migration is real (it is part of the build arc per the build-sessions cache). But the founder's question was about properties of *current* approved configurations (pricing, security, discoverability, outputs). K-category migration is a *future structural change*, not a property to audit. Bucket 6 mixes "things to assess" with "things to do." Track it — but not as an audit dimension alongside the others.

### A.6 — AEO: the AI's reading tilts toward more scope

The founder wrote "AEO or agent discoverability." The "or" is at least as plausibly *synonymy* (AEO ≈ agent discoverability, named twice) as it is the AI's reading (AEO = Answer-Engine-Optimisation, a broad marketing discipline that *contains* agent discoverability). The AI's interpretation is the more expansive one. The narrower, safer reading is the founder's own gloss: "agent discoverability," full stop. This matters because Answer-Engine-Optimisation-as-a-discipline is a large surface that will inflate Bucket 3. (Confirmed correctly flagged as unconfirmed; becomes part of proposed **Q7**.)

### A.7 — Two highest-complexity items are buried as one-liners

- **Multi-tenancy isolation per configuration** (Bucket 2) reads as one line but is a deep, high-stakes security property for a substrate holding intimate data (R17): where can Operator A's data leak into Operator B's?
- **R17c genuine deletion per configuration** (Bucket 5) reads as a checkbox but is a serious design problem across a substrate with provenance trails, immutable audit rows (R17h), and the new cross-seam `safety_signal` carrier — and it is a Critical GDPR obligation currently unmet.

Burying the two hardest, highest-severity items as one-liners is itself a finding.

### A.8 — Dimensions genuinely missing (PR12, several angles)

Beyond the PR14 cross-check, an independent pass surfaces candidates the six buckets do not cleanly hold: **authentication/authorisation posture per configuration** (foundational — Option A's audience determination *depends* on `auth.user?.id`; only glanced at under multi-tenancy); **the audience axis** (A.1); **eval/quality coverage per configuration** (the manifest's ES1–ES3 gate phase transitions on Zone-2 eval coverage — directly analogous to the R20a safety perimeter, and unmentioned); and **internationalisation/localisation** (which flows emit human-facing prose needing translation — ties to accessibility and EAA).

### A.9 — A point that cuts across the whole catalog

There are **no current users** (build-sessions cache). A per-configuration catalog of pricing, error-rates, security exposure, and output surfaces would be built against **zero usage data** — every cell is theoretical until there is traffic. That does not make cataloguing worthless, but it weakens the case for a *rigorous, all-at-once* catalog now, and strengthens the sequencing argument in Section C.

---

## Section B — The four strategic options

**Verdict: the four options are not exhaustive, the framing is mildly asymmetric against the option the founder chose, but the AI's conclusion (Option I is riskiest) is substantively defensible.**

### B.1 — Not exhaustive: at least two strong options are missing

All four options vary along essentially one axis — how much to catalog up front and when to test — and II/III/IV all "catalog now" in some form. Two genuinely distinct options were not surfaced:

- **Option V — Don't build a bespoke catalog at all; apply per-configuration checks within the existing PR14 ten-domain frame and the R14 quarterly cycle.** The project already owns a gap-analysis apparatus and a recurring compliance review. Treating "per-configuration properties" as a *lens within existing governance* rather than a new artefact + three-phase program is the reuse option. The prior AI surfaced nothing that leverages the project's own machinery.
- **Option VI — Finish proving Option A operationally before cataloguing anything.** Not II's "catalog later," but actually completing S5 + the C2 live run + one production activation so that the generalisation rests on a *proven* pattern and (bonus) possibly some real usage data. This is the option the AI's own PR1 argument points toward, and none of the four is it.

The prompt also raised an external security/compliance audit before continuing; given the manifest already plans lawyer engagement at Stage 1 close and adversarial review for R18d, routing Bucket 2 to **external review** rather than a founder+AI catalog is plausible and deserved a mention.

### B.2 — Mild framing asymmetry

Option I receives the **longest cost list and the shortest benefit list** of the four. Its genuine strategic merit — surfacing cross-axis conflicts *once*, a single coherent re-engagement, avoiding the repeated re-engagement tax that II/IV pay — is compressed into a terse "buys" clause, while its costs run long ("massive scope inflation … violates PR1 … pushes C2 + M-7 out by months … high decision-fatigue"). The AI's preferred Option III gets a balanced treatment. So, to the prompt's direct question: **no, the founder's chosen option was not surfaced with the same rigour as the AI's preferred option.**

### B.3 — But the conclusion is sound, and there is a sharper way to see it

The asymmetry in *framing* does not make the *conclusion* wrong. 6–25 sessions for a non-technical solo founder, before any operational proof, is genuinely high-risk. The fairer criticism is that the AI reached a defensible conclusion via subtly loaded framing instead of symmetric rigour — and, more importantly, omitted the options (V, VI) that would resolve the tension it identified.

The insight the AI blurred, and the most useful thing in this section for the founder: **"catalog now" and "test all at once" are separable.** "Catalog now" is shared by Options I, III, and IV — it is the low-regret core where the cross-axis-conflict value lives. "Test all at once" is unique to Option I — it is where the risk concentrates (6–25 sessions before any operational proof). The founder approved "Option I," but most of Option I's benefit (the catalog) is available without its main cost (deferring all testing). That combination is, in effect, Option III or IV. The AI's own preferred III is closer to "Option I's benefits minus its main risk" than the framing admitted.

---

## Section C — The PR1 meta-tension

**Verdict: PR1 does not literally apply. The tension is real but mis-attributed; its true home is the 0h hold-point and evidence-sequencing.**

### C.1 — PR1, read literally

PR1: *"Before any new architectural pattern is deployed across multiple endpoints, it must be proven on a single endpoint first. A single-endpoint proof must reach Verified status (0a) before rollout begins."* Its terms are precise: an **architectural pattern**, **deployed**, across **endpoints**, with **rollout**. The "configuration-level audit pattern" the AI worries about multiplying is none of these — it is an analytical/cataloguing activity applied across *dimensions*, with no deployment, no endpoints, and no rollout. **PR1 does not literally apply.** The prior AI half-saw this ("a category leap PR1 doesn't explicitly cover") and then leaned on PR1 as the frame anyway.

### C.2 — The tension is real, on other grounds

The strongest grounds, in order:

1. **Evidence-sequencing / premise-validation.** Option A is the *entire evidence base* for whether config-level treatment is worth generalising — and it is not operationally proven. S5 (config-flow tests) is in limbo; the C2 live run (real Haiku) has not happened; all four flags are UNSET, so the safety functions have never fired in production. Cataloguing six dimensions of config-level treatment assumes the R20a config-level treatment *works and was worth the five sessions* — an untested assumption.
2. **The 0h hold-point discipline.** This is the precise governing principle, and it is stronger than PR1. The project instructions' 0h exists because "everything from P1 onward depends on assumptions about what we've built [that] have not been tested," and 0h exit criterion 1 is explicit: *"Every component claimed as 'wired' or above has been tested by the founder using real data."* Option A is claimed Wired/Verified but has **not** been tested with real data (no live run; flags off). Generalising from it is exactly the move 0h was written to prevent. PR2's warning rhymes here too: a safety function that is never called "creates false confidence."
3. **Bandwidth / decision-fatigue** (the AI named this) and **scope inflation** — both real, both non-PR1.

### C.3 — How the decision-log entry should record it

**Not** as "a PR1 violation accepted with reasoning." Recording it as a PR1 violation would put a mischaracterised precedent into an append-only audit trail — a future session that greps PR1 would find a "violation" that was not one, and could mis-learn what PR1 covers. Record it instead under its actual governing principles: **a deliberate acceptance of evidence-sequencing risk (Option A not yet operationally proven), framed against the 0h hold-point discipline,** with bandwidth and scope-inflation noted. Using the correct rule label is not pedantry; in an append-only trail the labels are the future index.

---

## Section D — The three-phase Option I plan

**Verdict: the cut is plausible but doesn't match how Option A actually ran; the estimate is optimistic at the low end against the wrong benchmark; and one open item must become a hard pre-condition.**

### D.1 — The cut

Catalog → wire → test is a waterfall. But Option A itself did **not** run that way. It ran ADR → design spec → build (per endpoint, each with its own CCP) → test — *per dimension*, design and build interleaved. There was no "catalog" phase and no single "wiring" phase; there was a per-dimension ADR plus a design spec. A **four-phase** cut (catalog → per-dimension ADR/design → build → test) is more honest, because it surfaces that **each dimension that needs wiring likely needs its own ADR and design spec**, exactly as R20a had both (`2026-05-27` ADR + `2026-05-28` design spec). The AI's Phase 2 hand-waves this into "each gets its own session arc modelled on Option A."

### D.2 — The estimate, and why the benchmark is wrong

"Modelled on Option A" means ~5 sessions per wiring dimension (S1 design + S2–S4 build + S5 test) — and that is the wrong, *optimistic* benchmark, because **Option A took five sessions and still is not operationally proven** (S5 + C2 live + activation remain). So the true per-dimension cost is *more* than five sessions. The AI's own bucket analysis says security hardening, AEO artefacts, and the developer dashboard all "need wiring." If even three or four buckets each need an Option-A-sized arc, the realistic total is **closer to 15–30+ sessions than to the low end of 6**. The "6" assumes nearly everything is "free," which contradicts the AI's own analysis. The estimate is honest in its width but skewed optimistic at the bottom.

### D.3 — The dependency spine the AI gestured at but did not map

Phase 1 says "document dependencies," but names none. Concretely:

- **Developer dashboard depends on telemetry existing per dimension** — AC11 OpenTelemetry instrumentation "lands at Stage 1 A12," i.e., is **not built yet**. You cannot dashboard what you have not instrumented.
- **Security audit depends on per-configuration auth posture being documented** — itself an un-surfaced dimension (A.8). You cannot assess multi-tenancy isolation without first cataloguing who-calls-what.
- **Pricing depends on per-flow metering being wired** — Option A just touched `/api/reason` metering and deferred it.
- **Discoverability depends on positioning being settled** — R18a Character Kernel is locked, but the per-configuration R19c "what this does/doesn't do" disclosures depend on each flow's honest capability statement, which depends on the capability inventory (a 0h artefact).
- **Everything depends on the L1–L7 enumeration**, which does not exist.

Several of these dependencies rest on infrastructure that does not exist yet (AC11 instrumentation; per-flow metering; the enumeration itself). A catalog that ignores this ordering will produce cells that are circular or unsatisfiable.

### D.4 — L1–L7 must be a hard pre-condition

The matrix's rows *are* the configurations. You cannot build a configurations × dimensions matrix without the configuration list. The AI left L1–L7 as open item #2; it must instead be the **first** pre-condition of Phase 1. (Becomes proposed **Q5**.)

### D.5 — "Workable matrix in 3–4 hours"

Six buckets (really up to twelve dimension-columns once audience is added, per A.1) × seven configurations × five fields per cell (state, gap, "good," dependencies, scope), many requiring code-reads to establish current state, is hundreds of data points. In 3–4 hours that is seconds per point including investigation — **realistic only for a shallow skeleton, not a rigorous filled matrix.** Phase 1 should be scoped explicitly as "skeleton + identify which cells need code-investigation" (one session), with rigorous filling acknowledged as more.

---

## Section E — The four open structural questions (Q1–Q4)

**Verdict: Q1–Q4 are valid but they are packaging questions; the substantive decisions sit outside them, and several of Q1–Q4 are downstream of decisions the AI never asked.**

Q1 (S5 prompt disposition), Q2 (buckets right?), Q3 (output shape), Q4 (session boundary) are all reasonable. But they are about *how to package the work*, not *whether and on what basis to do it*. The decisions that should precede Phase 1 and are absent from Q1–Q4:

- **Q5 — the L1–L7 enumeration** (D.4). The prerequisite; not in Q1–Q4 at all.
- **Q6 — premise-validation/sequencing** (Section C). The most consequential decision — generalise now, or finish proving Option A first — and the AI never posed it as a question.
- **Q7 — which taxonomy frame** (Section A): the six bespoke buckets, PR14's ten domains, or a reconciliation.
- **Q8 — the audience axis** (A.1): grid or cube.
- **Q9 — the backout tripwire** (open item #8): the AI flagged its absence but proposed nothing.

My recommendations on the existing four (reasoning, not prescription — the founder decides):

- **Q1 (S5 prompt): keep as reference, mark superseded — not delete, not revise-into-catalog.** It is a well-formed test plan and the seed for the eventual R20a-propagation portion of testing regardless of which option wins; deleting destroys good work; revising it into a catalog prompt conflates two different deliverables. **Important coupling:** if Q6 resolves toward "finish Option A operationally first," then S5 is *not* superseded — it is the very next session, fully live. **So Q1 cannot be answered independently of Q6.** That coupling is itself the finding.
- **Q2 (buckets): reorganise** — reconcile to PR14 + add the audience axis (Section A). Not "all six in, no changes."
- **Q3 (output shape): matrix as the index, built in `/drafts` (not `/adopted`), starting as a skeleton.** "Both" (matrix + per-dimension docs) doubles the work before any dimension is even chosen; defer per-dimension docs until one is picked for wiring.
- **Q4 (session boundary): fresh session for Phase 1** (the AI's own recommendation is right) — but moot if Q6 redirects to "finish Option A first."

The cross-cutting point: answering Q1–Q4 before Q5–Q9 is putting packaging before substance.

---

## Section F — The eight second-order open items

**Verdict: all eight are correctly identified; the weighting is wrong on three, and three deserve elevation to explicit founder decisions.**

- **#1 AEO interpretation** — correct; elevate into the Q7 taxonomy decision (it changes Bucket 3's scope materially).
- **#2 L1–L7 enumeration** — correct, and the most under-weighted of all; **elevate to the first decision (Q5).**
- **#3 Buckets 5 & 6 AI-added** — correct; folds into Q7.
- **#4 Schedule-impact acceptance** — correct, but the AI's framing ("implicit acceptance") is **too generous.** "Cover everything off before testing" is not obviously informed consent to 6–25 (realistically 15–30+) sessions and months of delay to the C2 live run, M-7 closure, and production activations. Founder preferences are explicit that the AI must "surface options, constraints, and risks" — a months-long delay is a constraint that deserves *explicit*, not implicit, acceptance. **Elevate** (it is the substance of Q6).
- **#5 PR1 classification** — correct that it is open; Section C resolves it (it is 0h/evidence-sequencing, not PR1).
- **#6 Per-dimension tier classification** — correct; can mostly *emerge* from Phase 1, with one exception: **security/auth/deletion should be pre-classified Critical now** (per PR6, AC7, R17f), not discovered later. The AI's instinct (security Critical, AEO Standard, dashboard Elevated) is sound. Keep as background; lock the security-Critical default now.
- **#7 Catalog audit-trail location** — correct; my recommendation is **`/drafts` first, promote to `/adopted` only after a full Phase-1 founder approval gate** (matches the project's own `/drafts`→`/adopted` discipline and the cache's `archive` category being Elevated). The AI leaned `/adopted` prematurely.
- **#8 Backout pathway** — correct, and **the most important of the eight.** The AI flagged the absence but proposed nothing. Option I as scoped has *no exit*: a 6–25 (15–30+) session program with no tripwire can run away. A concrete backout: *"If Phase 1 cannot produce a workable skeleton in one session, OR the L1–L7 set exceeds N, OR more than X dimensions each require an Option-A-sized arc, STOP and fall back to Option IV (prioritise top 2–3) or VI (finish Option A first)."* **Elevate to a decision (Q9).**

---

## Section G — Patterns the reviewer notices

The standing cache names three failure modes to watch for. Two are present; the third is present only in spirit.

- **Prescribe-before-grounding (KG-EX1) — PRESENT, mild-to-moderate.** The AI built a six-bucket taxonomy, a three-phase program, and a 6–25 estimate *before* the founder confirmed the L1–L7 set, the AEO meaning, or the two AI-added buckets — and without consulting PR14 (the adopted gap-analysis frame) or PR15 (bias to existing infrastructure). It chose tidy default framings ahead of grounding them in founder intent and existing governance. To its credit it labelled the foundations unconfirmed; the pattern is that it *structured the whole program on top of them anyway.* Founder redirect that fits: *"Are you grounding this in my purpose first?"*
- **Narrow unit of analysis — PRESENT, and ironically so.** The cache's description of this very pattern includes "misses the audience dimension (human user message vs agent developer notification)." The AI's Bucket 4 re-merged the human/agent audience split that Option A existed to separate (A.1). It reproduced the named pattern while analysing the work that fixed it. *"What's the unit of analysis here?"* applies directly.
- **One-line operational hand-off (PR17) — NOT literally present** (no founder-performed operational step was reduced to a one-liner; this was a strategy session). But a cousin appears: Phase 2 ("4 to 20+ sessions … each gets its own session arc") compresses what could be 20+ Critical sessions into one airy clause — the same *spirit* of under-narrating a large body of work.

Two further patterns beyond the table:

- **Scope-expansion bias.** Consistently directional: +2 buckets beyond the founder's six, ~20 sub-dimensions, AEO read as a broad discipline, and the most-ambitious Option I scoped into a full program. Worth the founder's awareness when reading any AI-generated scope.
- **Failure to reuse adopted frames (the deepest pattern).** The project has a ten-domain gap-analysis frame (PR14), a quarterly compliance machine (R14), and a hold-point discipline (0h) — and the AI referenced none of them while doing a gap-analysis that all three bear on directly. This underlies Sections A, B, and C. PR15's whole posture is reuse-before-bespoke; the spirit applies to the project's own governance, not only to Anthropic infrastructure.

**Possible new PR5 candidate observations** (offered for the founder/decision-log to weigh; first recurrence each):

1. *"When asked to generalise a just-completed pattern to new dimensions, the AI builds a bespoke taxonomy and multi-phase program rather than first reconciling against the project's existing adopted frames (PR14 ten-domain, R14 quarterly, 0h hold-point)."*
2. *"The AI defaults to the most expansive reading of an ambiguous founder term (AEO → Answer-Engine-Optimisation), inflating scope."*

---

## Net recommendation

**Confirm the per-configuration catalog is worth doing, but do not open Phase 1 as the findings scope it. First settle the sequencing question — generalise now vs finish proving R20a operationally (the real tension is the 0h hold-point and evidence-sequencing, not PR1) — and re-cut the six buckets against the adopted PR14 ten-domain frame with audience as a cross-cutting axis, resolving the L1–L7 enumeration and a backout tripwire before any cataloguing begins.**

---

*End of review. Drafted 2026-05-29; Under review. This document changes nothing — no code, no governance, no execution; production state UNCHANGED; the findings document is untouched and remains Under review. The founder reads the net recommendation and decides whether to proceed to Phase 1 as scoped, proceed with amended scope, revisit the choice among Options I–VI, or defer the cataloguing arc.*
