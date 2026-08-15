# SCOPING SESSION RECORD — Kathêkon: should candidate evaluation be role-relative?

**Status: RULED 2026-08-15 — CLOSED.** *(Superseding the original "OPEN — awaiting ruling"
line; see the dated status update directly below.)* **Tier: `governance`.** Opened 2026-08-12 by
mentor ruling on principle 2 of `2026-08-12-five-stoic-principles-architectural-examination.md`.

> **2026-08-15 STATUS UPDATE — RULED.** The session ran 2026-08-15 (concurrent-arc C2,
> `D-CONCURRENT-ARC-C2-SCOPE-DOCUMENTS-KATHEKON-AND-DRIFT-MELETE-2026-08-15`) and produced
> `2026-08-15-SCOPE-DOCUMENT-kathekon-role-relative-FOR-RULING.md`; the mentor ruled the same
> day (**Ruling Set A**, verbatim canonical:
> `2026-08-15-mentor-rulings-C2-scope-documents-verbatim.md` — verbatim wins over this summary):
> **R-1** role-relativity yes, conditionally; **R-2** locus = option D-i, guardrail-local
> threading only (D-ii ruled out — the shared-prompt/regime-boundary coupling decisive);
> **R-3** source = the human-authored protocol/task list (C6 ruled satisfied, no re-opening;
> the self-report-through-extraction verifiability limit carried as a named honest limit;
> option E carried as a future-direction note, not adopted); **R-4** the remit gate is an
> explicitly-ruled **permissible pre-filter** — the ruled winner rule is NOT amended (the QG-D
> discipline discharged in the ruling's own words); **R-5** option B adopted — the
> role-blindness qualification on all three R18 surfaces, mentor wording in hand, founder
> sign-off required. The kathekon predicate is untouched; S11 flip-readiness is not re-opened.
> **Execution folds into post-run sessions per M2** (see the concurrent-arc plan's ruled-
> additions block). **This record is closed.**

**This record opens a session. It does not run it.** Nothing here answers the session question, and
**no build is authorised** by the ruling that opened it.

---

## The session question — verbatim, as ruled

> Should the IDEA loop's candidate evaluation be role-relative, and if so, by what mechanism, given
> that `/api/guardrail` takes no role input and the ruled winner rule is "highest proximity among
> novelty-passers"?

**Not pre-answered here.** The finding below states what is architecturally the case; it does not
propose a mechanism, recommend a direction, or rank the options.

---

## The finding that opened it — gap confirmed, total not partial

**Verified at source 2026-08-12:** `website/src/app/api/guardrail/route.ts` contains **no `role`, no
`purpose`, and no `orchestrator_profile`** — the grep returns nothing. The IDEA loop's candidate
filtering pass calls `/api/guardrail` for every candidate and receives proximity plus engaged virtue
domains, **with no knowledge of whose proposal it is or what role that agent occupies.** That is
evaluation against an abstract standard.

**Role is encoded twice, live, and neither reaches the candidate path:**

- **`website/src/app/morning/page.tsx:174`** — *"Before the day's impressions arrive, orient the ruling
  faculty. Name the roles active today and their kathekonta."* Explicitly role-indexed, human surface.
- **The calling gate** — `orchestrator_profile.purpose` (Trust Layer G1, live since S9b) declares an
  agent's role at session start.

**Doctrinal ground (primary sources):** kathêkon is role-relative by definition, not incidentally.
Cicero, *De Officiis* 1.107–115 — the four-*personae* doctrine: what is appropriate is determined
jointly by universal rational nature, individual nature, circumstance, and chosen role. Diogenes
Laertius 7.107–108 defines kathêkon as what is *"consistent in life"*, and the standard examples are
role-indexed. An assessment of appropriate action blind to role is assessing conformity to a general
standard — a different thing, which should not carry the same name.

---

## Inherited constraints — binding on this session, named at its opening

### C6 — the generation step's signal sources are bounded

Ruled 2026-08-11 (`2026-08-11-mentor-ruling-scope-confirmation-verbatim.md`, C6), and inherited here
in full:

> *"shared task list, cycle history, credential-scoped examination history, and its own public trust
> record. **Explicitly not `getProjectContext`.** Generation and examination are different calls — the
> ruling that removes `projectContext` from API-key-authenticated `/api/reason` calls does not touch
> the generation call, but the generation call's signal sources are bounded as stated."*

**Consequence this session must observe:** any role signal proposed must be shown to sit *inside* that
bounded set. A mechanism that reached outside it would need C6 itself re-opened, which is not what this
session is convened to do.

### QG-D — the precedent on amending a ruled rule

Ruled 2026-08-09 (`2026-08-09-mentor-consultation-generation-step-scope-rulings-verbatim.md`, QG-D):
the **generative-only** reading was confirmed for heuristic 5 and a **selection-time weight was
rejected**, on the ground that it *"would modify the ruled winner rule"* — *highest proximity among
novelty-passers*. The winner rule was explicitly **not amended**.

**Consequence this session must observe:** any role-relative evaluation applied at selection time
faces the identical objection and would be an amendment to a ruled rule — the mentor's to make
explicitly, never assumed by a build. QG-D is the precedent, and it points at the shape of the
difficulty rather than at an answer.

---

## A boundary this session inherits, and must not erase

**Kathêkon-appropriateness is NOT a blast-radius question, and must not be folded into GS-ATRF-1.**
Stated in the analysis that opened this session, and carried here as a constraint:

- **Blast radius asks:** how far does this reach? A magnitude.
- **Kathêkon-appropriateness asks:** is this mine to do, here, now? A relation between action and role.

They come apart in both directions — an action can be **low blast radius and still not the agent's to
take** (trivial in reach, outside its remit), and **high blast radius and squarely appropriate** (far
reaching, exactly what the role exists for). A measure conflating them would report the same value for
two situations calling for opposite dispositions.

**GS-ATRF-1 is not pre-answered, not re-opened, and not enlarged by this session.** Its ruled
four-virtue answer (2026-08-09) stands untouched, and this session must not resolve itself by
absorbing into it.

---

## What this session does NOT do

- **Does not build.** No build is authorised by the ruling that opened this record.
- **Does not touch GS-ATRF-1, GS-ATRF-2, or GS-ATRF-3**, all of which remain open.
- **Does not re-open** the four QG rulings, B1's §2.12 requirement, the S6 frozen null result, or the
  `high|medium|low` blast-radius vocabulary.
- **Is not absorbed into any existing open question** — it is a separate item, by ruling.

## Sources

- `2026-08-12-five-stoic-principles-architectural-examination.md` §2 (the finding).
- `2026-08-12-mentor-consultation-five-stoic-principles-verbatim.md` (the question examined).
- `2026-08-11-mentor-ruling-scope-confirmation-verbatim.md` C6 (inherited constraint).
- `2026-08-09-mentor-consultation-generation-step-scope-rulings-verbatim.md` QG-D (precedent).
- `website/src/app/api/guardrail/route.ts`; `website/src/app/morning/page.tsx:174`.

*Status at close of this record, as originally written: **OPEN — awaiting ruling.** No work had
been done against the session question. **Superseded 2026-08-15 — RULED and CLOSED; see the
status update at the head of this file.***
