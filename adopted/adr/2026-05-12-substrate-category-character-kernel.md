# ADR — Substrate Category: Character Kernel

**Status:** Adopted 2026-05-12 under `D-MANIFEST-AMENDED-FROM-ST2-2026-05-12`. Parent triage entry: `D-STRESS-TEST-STAGING-PLAN-AMENDMENTS-2026-05-12` (ST2 Phase 3 Step 1 Candidate 14 ALLOW).
**Decision ID:** J1 ADR (Substrate Category).
**Scope:** SageReasoning's substrate-category label for marketplace listings, public-facing documentation, R18 honest-certification language, and external positioning.
**Authoritative cross-references:** `/manifest.md` §R18a (Certification scope language + Character Kernel); `/adopted/substrate-plugin-staging-plan.md` §Stage 4 G3 (marketplace listing copy); `/operations/handoffs/founder/2026-05-12-build-plan-stress-test-ST2-close.md` (substrate-as-judge dogfood walkthrough record).

---

## Decision

Adopt **"Character Kernel"** as SageReasoning's substrate-category label. Use the label consistently across:
- Marketplace listings (Cowork → anthropics/skills → Claude Code Plugins per Stage 4 + Stage 6 sequence)
- Public-facing documentation (limitations page; trust badge documentation per R18b)
- R18 honest-certification language in agent-card.json and llms.txt
- All external positioning (announcements, peer-category comparisons, conference talks)

The Character Kernel label is the operative term — it replaces ad-hoc category descriptions used earlier in the project (e.g., "Stoic agent substrate," "principled reasoning layer," "Judgment + Continuity primitive" as a category, though the latter remains valid as an architectural description of what the kernel does).

## Context

ST2 (Build-Plan Stress-Test, Phase 2.5 + Phase 3, 2026-05-12) included substrate-category-label evaluation as one of sixteen Phase 2.5 deep-dive candidates (Candidate 14 — OpenBrain Judge Extender + Character Kernel). The evaluation surfaced six category-label alternatives, each with peer-substrate evidence from the inbox "peers we have" research file:

| Alternative | Peer evidence | Notes |
|---|---|---|
| **Character Kernel** | OpenBrain framing; emerging convention | Engineering + identity vocabulary; aligns with agent-platform-operator audience; preserves continuity-of-judgement framing |
| Judgment Continuity Layer | Self-coined; descriptive | Accurate but generic; risks "yet another layer" perception |
| Normative Cognitive Middleware | ANCHOR positions itself as Cognitive Middleware | Peer-overlapping; differentiation harder |
| Practical Wisdom Layer (Phronesis) | Stoic-Aristotelian; original | Greek term doesn't translate to engineering audience; R8c surface clash |
| Assent Engine | Stoic technical term | Specialist; alien to non-Stoic audience |
| Virtue Middleware | Care-ethics adjacent | Overloads "virtue" into engineering register |

Peer-category landscape (as of ST2):

- **Character Kernel** — emerging; OpenBrain Judge Extender contracts use the framing; aligns with SageReasoning's substrate posture
- **Cognitive Middleware** (ANCHOR) — closely adjacent but not identical; ANCHOR positions on reasoning quality, not character continuity
- **Reasoning for Humans** (ResontoLogic) — practitioner-facing rather than substrate-facing
- **Constitutional Reasoning Layers** (AEGIS) — adjacent; constitutional-AI-flavoured
- **Runtime Governance Kernels** (VIGIL) — adjacent; governance-flavoured
- **Guardrail-only validators** (Guardrails AI; Patronus AI; Lakera) — a distinct category; not character-preserving
- **Memory-only continuity layers** (MemGPT; Letta) — adjacent on continuity; not judgement-grounded

The Character Kernel label sits inside the emerging "normative cognitive middleware" cluster and is distinguished by: (a) preserving the agent's identity (continuity of judgement), (b) being a judgement primitive (not a guardrail or a memory layer), and (c) being grounded in a normative tradition (Stoicism, in SageReasoning's case).

## Alternatives considered (and reasoning for rejection)

**Judgment Continuity Layer.** Rejected for marketing reasons — "Layer" is overloaded across agent architecture (input layer, prompt layer, guardrail layer, memory layer). Peer-category language gets muddied. However, "Judgment + Continuity primitive" remains valid as an architectural description of *what the Character Kernel does* (see manifest R18a wording).

**Normative Cognitive Middleware.** Rejected because ANCHOR already positions itself as Cognitive Middleware. Differentiation would require additional adjectives ("Stoic Normative Cognitive Middleware") that read poorly in product copy.

**Practical Wisdom Layer (Phronesis).** Rejected — the Greek term doesn't survive R8c (English-only on user-facing content) without adjacent gloss; using "Practical Wisdom" without the Greek loses the Stoic provenance; using both creates the kind of jargon-soup the R8 glossary discipline exists to prevent.

**Assent Engine.** Rejected — "assent" is a Stoic technical term (the moment of judgement; *synkatathesis*) but is alien to non-Stoic audiences and reads as obscure. Engine framing is fine; the noun isn't.

**Virtue Middleware.** Rejected — overloads "virtue" into the engineering register in a way that risks importing care-ethics framing the project doesn't claim. SageReasoning's normative grounding is Stoic; "virtue middleware" is closer to a generic care-ethics or virtue-ethics framing than to SageReasoning's specific posture.

## Reasoning for adoption

1. **Peer-category differentiation is clean.** Character Kernel sits inside the normative-cognitive-middleware cluster but is differentiated by character preservation (judgement continuity). Marketplace audiences can grasp the distinction quickly: this is not a guardrail, not a memory layer, not a generic cognitive middleware — it is the part of the agent that keeps the agent *the same agent* across time and decisions.

2. **Distinctive vocabulary.** "Character Kernel" is engineering-flavoured ("kernel") and identity-flavoured ("character"). It reads natively to the agent-platform-operator audience (the primary Stage 4 G4 audience).

3. **Stoic foundation preserved.** The Stoic provenance lives in the J1 ADR text, in the R18 honest-certification language, and in the substrate's actual mechanism implementations (Control Filter, Passion Diagnosis, Oikeiosis, Appropriate Action, etc.). The category label does not need to *carry* the Stoic provenance — it needs to position the substrate in market.

4. **OpenBrain Judge Extender alignment.** The Character Kernel framing aligns with the emerging OpenBrain Judge Extender contract vocabulary (AC10 provenance + use-policy tags). This is interoperability-grounded, not aesthetic.

5. **Substrate-as-judge no-objection.** A manual mechanism walkthrough (Control Filter + Passion Diagnosis + Oikeiosis) was performed on the category-label election during ST2 Phase 3 Step 1 (substrate-as-judge dogfood; recorded honestly as Claude-reasoning-output applying the mechanisms, not a live-substrate API call — sandbox network blocked). The walkthrough surfaced no false judgement, no passion-driven distortion, and oikeiosis grounding across multiple concentric circles (self, plugin consumers, peer category, wider rational-agent community). The election is recorded as substrate-mechanism-consulted, not substrate-mechanism-decided.

## Consequences

**Positive.**

- Marketplace listings (Stage 4 G3 onwards) have a stable category to lead with.
- R18 honest-certification language gains a category vocabulary that can survive across marketplaces.
- Peer-category comparisons (ANCHOR, ResontoLogic, AEGIS, VIGIL, MemGPT, Letta, Guardrails AI) have a stable axis to compare on.
- The substrate's commercial positioning has a name agent-platform-operators can use in their own architecture diagrams.

**Negative / accepted trade-offs.**

- "Kernel" carries operating-systems connotations that some readers may import (e.g., expecting userland/kernelland separation, syscall surfaces). The R18 language clarifies the metaphor.
- "Character" risks being read as personality-frame (e.g., "the agent's character" as in "the agent has a particular personality"). The R18 language clarifies that character here means continuity of judgement, not personality theatre.
- Adoption commits SageReasoning to the Character Kernel cluster's evolution. If a peer rebrands or the cluster fragments, SageReasoning will need to re-evaluate.

## Revisit conditions

The Character Kernel label is locked in for the duration of the build arc and Stage 4 G3 marketplace listings. Revisit conditions:

1. **Peer rebrand overlapping.** If a peer substrate adopts "Character Kernel" in a way that overlaps SageReasoning's positioning substantially (e.g., a memory-only continuity layer rebrands as Character Kernel and dilutes the category), revisit.

2. **"Kernel" framing shown not to fit at Stage 3+.** If Stage 3 plugin-internals work or Stage 4 marketplace-review feedback shows that "kernel" framing is misleading for the actual integration pattern (e.g., the substrate is invoked at agent-loop boundaries rather than running continuously as the kernel metaphor implies), revisit.

3. **Market evidence after first marketplace listing.** Cowork-listing telemetry, marketplace-reviewer feedback, and early-adopter framing decisions may surface category language that fits better than Character Kernel. If three or more independent adopters use a different category term naturally, revisit.

4. **Anthropic Plugin spec terminology drift.** If Anthropic's plugin documentation adopts a different category convention for substrates of this kind, evaluate whether interoperability benefits warrant alignment. AC1 quarterly governance task (next due 2026-07-06) covers this monitoring.

Each revisit produces a new ADR superseding this one. The original is preserved.

## Cross-references

- `/manifest.md` §R18a (Certification scope language + substrate category — Character Kernel)
- `/manifest.md` §R18e (EU AI Act Article 50 transparency placeholder; lawyer-coupled)
- `/adopted/substrate-plugin-staging-plan.md` §Stage 4 G3 (marketplace listing copy with Character Kernel category language and peer-category comparison)
- `/operations/handoffs/founder/2026-05-12-build-plan-stress-test-ST2-close.md` (ST2 close; substrate-as-judge dogfood walkthrough record)
- `/operations/decision-log.md` — `D-STRESS-TEST-STAGING-PLAN-AMENDMENTS-2026-05-12` (parent triage entry); `D-MANIFEST-AMENDED-FROM-ST2-2026-05-12` (adoption entry for this ADR)
- `/inbox/peers we have.txt` (research file informing peer-category landscape)
- `/inbox/sage-intuit.txt` (research file on action-space-generation, relevant to substrate-as-judgement-primitive positioning)

---

*End of J1 ADR. Character Kernel category label adopted 2026-05-12. Operative for the duration of the build arc and Stage 4 G3 marketplace listings; revisit on the four named conditions above.*
