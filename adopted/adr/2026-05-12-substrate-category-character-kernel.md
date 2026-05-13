# ADR — Substrate Category: Character Kernel

**Status:** Adopted 2026-05-12 under `D-MANIFEST-AMENDED-FROM-ST2-2026-05-12`. **Amended 2026-05-13 under `D-AGENTIC-COMMERCE-UPSTREAM-REWORK-2026-05-13`** (peer-category landscape extension; new "Agentic-commerce-stack adjacency" sub-section). **Amended 2026-05-14 under `D-AGENT-CARD-CURRENCY-CHECK-2026-05-14`** (A2A foundational-coordination-protocol addendum added to the agentic-commerce-stack-adjacency sub-section; A2A v1 alignment status recorded). Parent triage entry: `D-STRESS-TEST-STAGING-PLAN-AMENDMENTS-2026-05-12` (ST2 Phase 3 Step 1 Candidate 14 ALLOW).
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
- **Agentic-commerce-stack protocols** (ACP, UCP, AP2, MPP, AgentCore Payments) — a distinct adjacency cluster. These protocols own commerce-flow layers (discovery, authorization, payment credential, settlement, merchant relationship, governance), not character continuity. Character Kernel sits upstream of all of them as the judgment primitive that informs an agent's commerce action. See §"Agentic-commerce-stack adjacency" below.

The Character Kernel label sits inside the emerging "normative cognitive middleware" cluster and is distinguished by: (a) preserving the agent's identity (continuity of judgement), (b) being a judgement primitive (not a guardrail or a memory layer), and (c) being grounded in a normative tradition (Stoicism, in SageReasoning's case).

### Agentic-commerce-stack adjacency

The May 2026 agentic-commerce inbox synthesis (see `/operations/handoffs/founder/2026-05-12-agentic-commerce-inbox-synthesis-close.md`) identified a six-layer responsibility framework that the agentic-commerce protocols collectively address:

1. **Discovery** — ranking, recommendation, comparison, substitution; the surface where intent forms
2. **Authorization** — the evidence layer recording what the buyer (or buyer's organisation) approved the agent to do
3. **Payment credential** — the card, token, wallet, or stablecoin address the agent uses to pay
4. **Settlement** — how money moves; rail, timing, currency, reconciliation
5. **Merchant relationship** — order management, fulfillment, returns, refunds, support, disputes
6. **Governance** — spending policies, vendor lists, budget limits, audit trails, revocation authority

The agentic-commerce protocols map onto these layers:

- **ACP** (Agentic Commerce Protocol; OpenAI + Stripe) — agent-to-merchant checkout; primarily authorization + payment credential
- **UCP** (Universal Commerce Protocol) — merchant-system interoperability; primarily merchant relationship + settlement
- **AP2** (Agent Payments Protocol; Google) — delegated authorization records ("mandates") with scope + constraints + proof of approval; primarily authorization + governance
- **MPP / x402** (Machine Payments Protocol) — machine-to-machine payment rails; primarily settlement + payment credential
- **AWS AgentCore Payments** — enterprise governance of agent spending; primarily governance + authorization

**A2A (Agent2Agent) protocol — foundational coordination layer.** Underneath the commerce-flow protocols above, the **A2A protocol** (governed under the Linux Foundation Agentic AI Foundation; co-founded by Anthropic, OpenAI, Google, AWS, Microsoft, Stripe) defines the agent-to-agent coordination layer: how agents discover each other (`.well-known/agent-card.json`), declare capabilities and skills, negotiate authentication, and exchange messages and tasks. SageReasoning has served an A2A-discoverable agent card at `sagereasoning.com/.well-known/agent-card.json` since 28 March 2026.

A2A is not in the agentic-commerce stack; it is the *coordination substrate that the commerce-flow protocols ride on*. ACP/UCP/AP2/MPP/AgentCore Payments all assume an underlying agent-to-agent discovery + coordination mechanism — A2A is the canonical one. The Character Kernel's relationship to A2A is "discoverable agent that publishes a Character Kernel capability via the standard A2A discovery surface" — not a competition with A2A but a citizenship within it.

**A2A v1 alignment status (recorded 2026-05-14 under `D-AGENT-CARD-CURRENCY-CHECK-2026-05-14`):** the SageReasoning agent-card.json is operational at the discovery surface but has load-bearing shape mismatches against the A2A v1 schema (capabilities-object-vs-array; skills-objects-vs-strings; authentication.schemes-strings-vs-objects; missing defaultInputModes/defaultOutputModes). A reshape session is scheduled as a follow-up to this 2026-05-14 close.

**Character Kernel's position relative to the stack: upstream of commerce.** The judgment primitive that informs commerce action but is not itself in the commerce stack. Specifically:

- **Touches authorization (indirectly).** Character Kernel produces judgment output (assessments + assents) that *informs* what authorization an agent should seek and accept. The Layer 3 substrate response shape (`/website/src/lib/substrate/layer3-service.ts`; A5 Verified 2026-05-12) is structurally a mandate-input — it carries provenance (AC10), use-policies (AC10), and the four-outcome envelope (AC9 `ALLOW` / `BLOCK` / `REVISE` / `ESCALATE`) that maps cleanly onto agentic-commerce authorization vocabulary (authorize / decline / scope-narrow / escalate).
- **Touches governance (via R0 + R18).** R0 oikeiosis (concentric area-of-concern reasoning) and R18 honest certification language are governance contributions — they describe how the agent reasons about who is affected by its actions and what the agent honestly says about its own scope.
- **Does not touch directly.** Payment credential, settlement, merchant relationship. Character Kernel is not in the payment path; it does not hold credentials, move money, or own merchant relationships.

This positioning is **interoperable, not competitive**. An agent using ACP for checkout + AP2 for delegated authorization + AgentCore Payments for enterprise governance can also consume Character Kernel for upstream judgment without architectural overlap. Character Kernel makes the agent's authorization request more principled; the agentic-commerce protocols make the authorization actionable.

**External validation of internal architectural decisions** (per the 2026-05-12 inbox synthesis):

- AC9 four-outcome envelope maps cleanly onto agentic-commerce authorization vocabulary
- AC10 provenance + use-policy tags are structurally identical to AP2 mandate concept (scope + constraints + proof of approval, travelling with the assessment)
- AC11 OpenTelemetry GenAI semantic conventions is the same telemetry transport AWS AgentCore Payments uses

ST2 reached these designs via OpenBrain Judge Extender vocabulary; the agentic-commerce stack is converging on the same shape independently.

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
- `/operations/handoffs/founder/2026-05-12-agentic-commerce-inbox-synthesis-close.md` (inbox synthesis identifying the agentic-commerce-stack adjacency)
- `/operations/agentic-commerce-findings-downstream-order.md` (forward-looking findings tracker created alongside this amendment)
- `/inbox/20260508-104-promptkit-1.md` (responsibility-layer audit + agent-spending-authorization prompt kit — primary source for the six-layer responsibility framework)
- `/inbox/acp.rtf` (ACP architecture reference)
- `/operations/decision-log.md` — `D-AGENTIC-COMMERCE-UPSTREAM-REWORK-2026-05-13` (amendment entry for this ADR; peer-category landscape extension)

---

*End of J1 ADR. Character Kernel category label adopted 2026-05-12. Operative for the duration of the build arc and Stage 4 G3 marketplace listings; revisit on the four named conditions above.*
