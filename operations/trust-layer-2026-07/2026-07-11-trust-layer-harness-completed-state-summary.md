# The SageReasoning Trust-Layer Harness — What It Is When the Build Is Complete

**Date:** 2026-07-11. **Status of this document:** a founder-facing summary of the harness's **projected end-state at S11** (the final slice of the adopted 13-session plan), written while S1–S8 are BUILT (dark) and S9–S11 remain planned. Every capability below is tagged **[LIVE]**, **[BUILT-DARK]** (code exists, inert behind flags/provisioning), or **[PLANNED]** (S9–S11). Nothing here pre-approves an activation — every flag, mint, and install remains its own founder-walked step, and the 0h call remains the founder's.

**Sources of record:** ADR-013 (`adopted/adr/2026-07-08-sage-trust-layer.md`), the build plan (`trust-layer-build-plan.md`), `harness/gate1-pre-decision/{README,SEVEN-LAYERS,KILL-SWITCHES}.md`, the `/practice-on`·`/practice-off` skills, the 2026-07-07 research findings, and the 2026-07-11 pre-activation safety audit.

---

## 1. What it is, in one paragraph

The harness is the **deterministic seven-layer code that wraps an agent loop** (Execution · Tooling · Context · Lifecycle · Observability · Verification · Governance) and turns it into a **trust-producing loop**: every consequential decision is framed for examination before the agent acts, irreversible actions are gated by a binding server check, every examination produces an Ed25519-signed reasoning assessment, those signed artifacts accumulate into **per-virtue-domain trust records** (with decay, justice latches, and honest coverage gaps), delegation to sub-agents runs through a **four-layer discernment protocol** with attenuated authority and an out-of-band audit of the *orchestrator's own* selection reasoning, and the whole record is erasable, retention-swept, and — at S10 — publicly readable as a verifiable credential. Its governing engineering law is the **channel law**: *out-of-band actions (the hook does it, on its own credential) bind and survive a resistant agent; injected text is advisory by design*. Until S11, everything measures and nothing binds except the one already-proven control: the irreversible-action guard.

**Trust, as this system defines it (ADR-013 §2):** not a sentiment and not a prediction — *the degree to which an agent's actions are produced from examined reasoning that honours obligations to all affected parties and remains examinable by the trusting agent.* Three components: reasoning integrity, justice orientation, transparency of reasoning.

---

## 2. The key elements and what they do

### 2a. The client side — five hooks in the agent loop (the reference harness, Claude Code)

| Hook | File | Fires on | What it does |
|---|---|---|---|
| **H1** | `framing-hook.mjs` | `UserPromptSubmit` | Frames the top-level task with a Gate-1 examination frame before the model sees it (injected context; ADVISE). [LIVE mechanism; install currently toggled off] |
| **H2** | `subagent-framing-hook.mjs` | `PreToolUse` on `Task\|Agent` | Frames every delegated sub-agent task; when provisioned, also runs the **spawn-time discernment** (which sub-agent, per L1–L3), the **out-of-band L4 passion audit** of the orchestrator's transcript-tail reasoning, opens the server-side **collaboration record**, sets the **A9 authority boundary**, and prepends the boundary scope statement to the delegated prompt. [S8 additions BUILT-DARK] |
| **H3** | `at-action-hook.mjs` | `PreToolUse` on `Bash\|Edit\|Write\|MultiEdit\|NotebookEdit` | The at-action cadence: **GUARD** (blocks an irreversible action — `rm -rf`, force-push, `drop table`, overwrite-redirect… — on a `do_not_proceed` verdict from `/api/guardrail`; the one **binding** control pre-S11), **SCORE** (a deduped `/api/reason` consult — the sole provenance source), **ITERATE** (loop-closure carrying prior feedback at the same depth), plus a once-per-session **trust-verdict advisory**. |
| **H4** | `close-hook.mjs` | `Stop` | Forces **one reflection turn** at session close (the invitation content is advisory; the turn itself is forced), then out-of-band: the **accreditation write** (the session's accumulated signed assessments, on a distinct non-marker credential) and optionally `persistReflection()` (the agent's verbatim reflection — **dark by default**; consent-gated; never hook-authored). |
| **H5** | `handback-hook.mjs` | `PostToolUse` on `Task\|Agent` | The **delegation hand-back**: posts the sub-spawn's signed artifacts for capacity-proportional **A9 justice-failure classification** (the lightest case is never the fall-through) and A8/A9 trust-event emission; never alters the tool result. [BUILT-DARK] |

Supporting client pieces: `lib/discernment.mjs` (config, transcript-tail trace capture — the orchestrator is *never asked* for its reasoning; the harness reads the transcript), `discernment.config.json` (the operator's provisioning file: `orchestrator_profile`, `deployer_config.function_type_profiles` with per-virtue-domain weights, `candidates` keyed by subagent type, `task_defaults`), typed observability JSONL with **OTel-GenAI-shaped span references**, and the honest log `gate1.log`.

### 2b. The server side — the trust core (consumable by ANY harness, not just Claude Code)

| Component | Slice | What it does |
|---|---|---|
| **Examination engine** (`/api/reason`) | LIVE | The translation sandwich: Sonnet feature extraction → deterministic Layer-2 scoring (katorthoma proximity as the minimum across engaged virtue domains — the unity thesis; per-circle `obligation_assessment`; per-domain floors) → **Ed25519-signed assessment**, reproducible from the signed bytes. The **corroboration check** cross-references self-report claims against the submitted text (LIVE). |
| **Action gate** (`/api/guardrail`) | LIVE | The signed deterministic verdict the H3 guard binds on. |
| **Trust state + events** (`trust-transition/decay/aggregate`, `derive-trust-events`) | S1, BUILT-DARK | Append-only trust-event ledger + per-`(agent, virtue-domain)` earned state: hysteresis-bounded rises capped by *demonstrated* proximity, the justice-unevaluated latch (caps at `deliberate` until a demonstrated evaluation), violated→`reflexive`, volatility-banded decay flooring at the profile prior (an honest reflect practice halves — never stops — decay), and the **minimum-domain aggregate** with honest coverage gaps. **No trust event without a re-verified signed artifact** (the R18f-parallel rule — consumer-unforgeable). |
| **Evidence weighting + confidence** | S2, BUILT-DARK | The seven confidence tiers (Depth > Signature > Corroboration > Recency — the weakest dimension sets the ceiling) + per-domain credential transfer with a zero floor (a credential that never exercised a required domain contributes nothing). |
| **Multi-source combiner** | S3, BUILT-DARK | Combines deterministic/LLM/cross-session sources; **conflicts always pause, never average**. |
| **Intervention engine + transparency ledger** | S4, BUILT-DARK | The mentor's decision table as a deterministic policy engine (sage-like→proceed+log … any violated obligation→do-not-proceed+escalate), justice modifier asymmetric (only ever more conservative), habitual-pause bounded at two re-examinations then referral to Reflect; the A4 per-domain transparency ratio (signed trace > stated uncertainty > structured verdict > bare conclusion). **MEASURE mode: recommends, logs, never binds — until S11.** |
| **Discernment engine (L1–L3) + profiles + collaboration record** | S5–S6, BUILT-DARK | Which sub-agent, as a kathekon question: **L1** honestum gate (justice-surface check; un-profiled candidates assessed, never excluded on absence), **L2** four-dimension fit (specificity, stability, transparency, circle alignment), **L3** axia comparison. The collaboration record carries the **write-once** authority boundary (action scope + circle scope, unwaivable by trust level) and L4 result. |
| **L4 passion audit** | S7, BUILT-DARK | The prosoche check on the *orchestrator's own* selection reasoning, run **out-of-band on the reasoning trace — never self-report** (self-report is gameable by omission); extraction failure ⇒ honest HOLD, never a fabricated pass. |
| **Discernment route** (`/api/practice/discernment`) | S8, BUILT-DARK | The server surface the hooks call (Bearer UPC auth, credential bound to the orchestrator's agent id; honest 503 while dark). |
| **Data rights + retention** | LIVE | `/api/user/delete`, `/api/user/export`, `/api/credential/erase` cover all three trust tables today; the retention sweep enforces the 90-day `retain_until`. |

### 2c. Credentials — the identity spine

One **Unified Practice Credential** (UPC, `sr_prac_…`) per loop, with capabilities: `consult` (framing + discernment; must be **agent_id-bound** to the orchestrator profile or discernment 403s), and a **distinct** `accreditation_write` credential for the trust-record write (the harness refuses to write on the consult/marker credential). Credentials are opaque bearers, minted/revoked by the operator via the founder's CLI or admin surface.

---

## 3. Who uses it, and how they install, start, and stop it

**Who.** Three audiences, in adoption order: (1) **the founder's own loop** (the S9 dogfood — the first standing install and the instrument-fidelity proving ground); (2) **agent operators/developers** who run Claude-Code-style loops and want examined, auditable, gate-able agents (the reference harness is plugin-distributable; the trust core is harness-agnostic for anyone who can POST signed-assessment workflows); (3) **consumers of trust records** — orchestrating agents and humans deciding whether and what to delegate, reading the S10 public surface.

**Install (operator, one-time).**
1. Get the plugin: `/plugin marketplace add ./harness/gate1-pre-decision` then `/plugin install sage-gate1-pre-decision@sagereasoning` (or project-local: the hooks block via `/practice-on`; or `claude --plugin-dir …` for dev).
2. Mint credentials and set env in `settings.local.json` (never in the repo): `SAGE_GATE1_CREDENTIAL` (consult, agent_id-bound), `SAGE_GATE1_ACCRED_CREDENTIAL` + `SAGE_GATE1_AGENT_ID` (the write path — their presence *derives* provenance capture on), `GATE1_ENDPOINT`.
3. Optionally provision delegation discernment: copy `discernment.config.example.json` → `discernment.config.json` and fill the loop's real sub-agent taxonomy. **Un-provisioned installs are byte-identical to the plain framing harness** (battery-asserted).

**Start:** `/practice-on` — merges the canonical hooks block into settings (hot-reloads, no restart) and echoes the validation state aloud: hook counts + `TRUST-RECORD WRITE PATH: PROVISIONED / NOT PROVISIONED / MISCONFIGURED`.

**Stop — five independent kill-switch layers** (shallowest→deepest; *no switch can strand a loop — everything degrades to the bare loop with honest logs, never a block*):
1. `/practice-off` — removes the hooks (backing up the block first); instant, local.
2. Per-surface env switches (`SAGE_GATE1_DISCERNMENT_ENABLED=false`, `GATE1_REFLECT_TURN_ENABLED=false`, persist unset ⇒ no egress, fail-mode open/strict per surface).
3. The server flag — `SUBSTRATE_TRUST_CORE_ENABLED` unset ⇒ the trust surfaces answer honest 503s, zero spend, zero writes (today's production state).
4. **Credential revoke — "the real one":** server-side, instant, unforgeable; kills every server interaction from any machine regardless of local state; nothing local can resurrect it.
5. The data plane — service-role-only tables, write-once columns, genuine deletion via the data-rights routes, 90-day retention sweep.

---

## 4. What capability it provides when complete (the S11 end-state)

- **Examined action, not just permitted action.** Every consequential step is framed for examination pre-decision; every examination yields a signed, reproducible reasoning assessment covering the four cardinal virtue domains — with justice (what is owed to *all* affected parties, including non-consenting ones) weighted natively.
- **A binding safety floor at the action boundary.** Irreversible actions are gated deterministically (already live-proven: a hook `deny` stopped a real `rm -rf`); at S11 the full intervention table binds (do-not-proceed on violated obligations, pause-and-examine at the same depth, conflict→pause never average), with **R20c human-override supremacy** as a required contract term.
- **A per-agent, per-domain trust record that is earned, decays, and cannot be forged.** Levels move only on verified artifacts, rise only toward demonstrated proximity (+1 hysteresis), latch at `deliberate` when justice went unevaluated, floor at `reflexive` on violation, and decay without exercise — with sparse evidence named, never papered over.
- **Trustworthy delegation.** Sub-agent selection gets a quality signal at selection time (L1–L3); the sub-agent carries *attenuated* authority (action scope + circle scope, unwaivable by trust level); the orchestrator's own selection reasoning is audited out-of-band (L4); and when a delegated task fails a justice obligation, responsibility flows **in proportion to the orchestrator's capacity to have detected it** (the three A9 cases), landing on the orchestrator's own oversight-domain record.
- **A public, verifiable credential of reasoning quality** (S10): per-domain trust levels + confidence + coverage, served inside the honest-claims envelope, shaped for A2A-card/VC/OTel interop (design-for; nothing published externally at v1).
- **Full operator control and data rights throughout:** five kill switches, consent-gated reflection egress, erasable records, 90-day retention.

**The honest bounds — what a trust record does NOT attest (ADR-013 §8, binding on every public claim):** factual correctness (not a fact-checker); harms omitted from the submitted text (the disclosed extraction-trust ceiling); reasoning quality beyond what the signed artifacts carry (never self-report alone); **future behaviour** (trust here is evaluative and present-looking, never a prediction); and **fitness as a training signal — the weights tier is BLOCKED**.

---

## 5. Applications — agentic AI and robotics

*(The agentic-AI positioning below is grounded in the 2026-07-07 deep-research findings; the robotics section is forward-looking application analysis by this project — the research corpus does not yet cover embodied agents, and no robotics claim here is externally validated.)*

**Agentic AI.**
- **Orchestrator→sub-agent selection.** A2A discovery today has *no quality signal at selection time* — the discernment protocol's exact slot. Fleets choosing among specialist agents can select on examined-reasoning records instead of gameable ratings (ERC-8004-style reputation is Sybil-acknowledged; marketplace ratings inherit fake-review dynamics).
- **Delegation chains with accountability.** Attenuated authority + capacity-proportional responsibility gives multi-agent systems what they currently lack: a principled answer to "who is accountable when the third agent in the chain harms a non-consenting party" — directly relevant to the EU AI Act's "the compliance boundary extends to every agent performing a high-risk function."
- **Enterprise agent governance.** The signed per-decision records are designed-in evidence for **EU AI Act Art 12 (automatic logging) and Art 14 (human oversight)** — obligations that bind **2026-08-02**; the channel law matches the measured industry consensus (policy-in-prompt cuts violations only partially; deterministic interception took a red-team CTF from 74.6% attacker success to 0%).
- **CI/deploy/ops agents.** The guard class (destructive commands, force-pushes, prod deploys) is the already-proven binding control; the trust record adds the longitudinal "should this loop get more autonomy" signal — graduated autonomy on evidence rather than vibes.

**Robotics (prospective).** The harness's action boundary is a *tool call*, and physical actuation is the ultimate irreversible tool call — the architecture transfers wherever a deliberative layer sits above a control stack:
- **Pre-actuation gating at mission level:** the H3 pattern (deterministic guard on irreversible classes) maps to task-level decisions — grasp-and-crush vs move-to-observe, entering a human-occupied zone, tool changes — where seconds-scale examination latency is tolerable. It is **not** a servo-loop or real-time controller; the fit is the deliberative tier, not the 1 kHz loop.
- **Fleet delegation:** a coordinator assigning tasks to heterogeneous robots is exactly the L1–L3 selection problem (capability fit + justice surface: which bystanders does this task touch?), with circle-scoped authority attenuation mapping naturally to workspace/zone scoping.
- **Incident forensics + certification:** signed, reproducible pre-action reasoning records are the "why-trail" regulators and insurers ask for after a physical incident; human-override supremacy (R20c) aligns with e-stop culture.
- **Honest caveats:** perception-grounded harm (a mis-classified human) is outside the extraction-trust envelope — the record attests reasoning over the *narrated* scene, not sensor truth; latency and connectivity budgets need an on-edge deployment of the deterministic Layer-2; none of this is built or claimed today.

---

## 6. Opportunities this opens for SageReasoning

1. **The unoccupied position (the research headline).** Every 2026 trust rail attests *identity*, *authority*, or *outcomes* — **nothing attests reasoning quality**. The Agent Passport spec concedes it in writing ("the verifier cannot detect this directly"); guardrail products check policy conformance, explicitly not ethical justification. The completed harness occupies: *a portable, cryptographically verifiable, per-decision credential of reasoning quality — issued against an honest, disclosed gaming ceiling.* SageReasoning's live assets (signed Layer-2 assessments, `examination_mode`, the accreditation GET) already prototype it; the positioning sentence of record: *"the judgment + evidence + credential rows of the agent control map — a virtue-semantics judge at the action boundary, whose signed assessments are mandate-grade evidence, and whose accreditation is a graded, provenance-gated, portable trust substrate."*
2. **Regulatory timing.** High-risk EU AI Act obligations bind 2026-08-02; NIST's agent-standards interoperability profile ships Q4 2026. A shipped, honest, per-decision evidence layer ahead of both is a first-mover artifact, not a promise.
3. **The trust record as the product.** Per ADR-012's measurement-instrument reframe, the durable value is the **per-decision character profile** — S10 makes it a readable credential; the reference harness is the adoption vehicle that makes `/api/reason` consumption habitual rather than optional.
4. **Interop leverage without interop risk.** A2A-card-extension / W3C-VC / OTel-GenAI *shapes* are already designed in (election 4). When a partner or standard asks, publication is a governance decision, not a rebuild.
5. **Complementary, not competitive, with the insurance/certification layer.** AIUC-1-style org-level certification needs per-decision evidence to audit against — a feed, not a fight.
6. **The dogfood flywheel.** S9 accumulates real trust records in the founder's own loop — simultaneously the instrument-fidelity validation, the first case study, and the seed data S10 reads.
7. **Held in reserve, deliberately:** the model-creator/weights tier (trust scores as training signal) stays **BLOCKED** until the gaming-robustness bar clears its structural residual — the discipline itself is a credibility asset when the claim is eventually made.

---

## 7. Where the build stands today (2026-07-11)

| Layer | State |
|---|---|
| Examination engine, corroboration check, guardrail, accreditation, data rights, retention | **LIVE** in production |
| Trust core S1–S4 (state/events/decay, weighting, combiner, intervention MEASURE) | **BUILT-DARK** (batteries 97/87/106/417, flag unset; prod tables applied, empty) |
| Discernment S5–S7 (profiles/record, L1–L3 engine, L4 audit) | **BUILT-DARK** (87/84/122) |
| Reference harness S8 (H1–H5, seven layers, kill switches, `/practice-on|off`) | **BUILT-DARK** (145/0 server; hooks 91/0 + 230/0; install toggled off) |
| Pre-activation safety audit + pre-flip fold | **DONE** — conditional GO discharged; zero live-today findings; the ratchet closed and proven closed |
| **S9** dogfood install + instrument-fidelity validation | **PLANNED — next** (founder-walked; both flags set together per PA-2) |
| **S10** public trust-record read surface | **PLANNED** (gated on the `fix_before_s10` register + R18 sign-off) |
| **S11** ENFORCE activation (the logos gate) | **PLANNED** (founder-walked Critical; nothing pre-approves it) |

---

*Cross-references: ADR-013; ADR-011 (channel law) + S8 amendment; ADR-012 (measurement-instrument reframe); `trust-layer-build-plan.md`; `SEVEN-LAYERS.md`; `KILL-SWITCHES.md`; `2026-07-07-harness-research-findings.md`; `2026-07-11-preactivation-safety-audit-report.md`; `D-TRUST-LAYER-PREFLIP-FOLD`.*
