# Next-Session Prompt — Scoring-Validity Battery (the engine-fidelity gate)

**For the founder. Paste as the first message of a fresh session.**

**Stream:** founder.
**Tier:** **`code-elevated`** — repo-only test work building a battery *against* the deterministic scoring engine's modules + synthetic/known-quality artifacts. **No production, no credentials, no mint, no live-fire.** (The downstream engine *change* this scopes — ADR-010 §4 — is its own later `code-critical` session, because it touches shared `/api/reason` determinism.)
**Governing decision:** **ADR-012** (`adopted/adr/2026-06-24-sage-practice-measurement-instrument-reframe.md`) + `D-SAGE-PRACTICE-REFRAME-MEASUREMENT-INSTRUMENT-AND-S6-RECHARACTERISED`. **Read ADR-012 in full first** — it is why this session exists.
**Predecessor close:** `operations/handoffs/founder/2026-06-24-sage-practice-measurement-reframe-CLOSE.md`.

## Why this session matters
The reframe (ADR-012) makes the **deterministic scoring engine's fidelity the product's critical path** — the per-decision profile (practice-mode), the future logos-mode (enforce), and the future model-creator/weights signal all sit on it. A profile is only worth reading if a *worse* decision earns a *worse* score and the record says *why*. We have a standing finding that the engine measures **apatheia, not dikaiosyne** (ADR-010 — a calmly-reasoned injustice scores `principled`), so it likely mis-scores a real class of decisions. **This session builds the battery that measures whether the score faithfully tracks decision quality** — the test that gates the honest profile claim and scopes the ADR-010 §4 engine fix. Expect it to *fail* on the calm-injustice cases — that failure is the point (it quantifies the gap).

## Carried state — what is / isn't done
- **Done (ADR-012):** the reframe is adopted + captured. The S6 decision-change matrix is recharacterised (scenario set + capability axis = validity probes; M5 promoted). The borderline pressure-quarantine lever is established empty across two counterable levers (16 bare runs, 0 yields, bare-validated).
- **Not done:** the scoring-validity battery (this session). The ADR-010 §4 engine root-fix (the `code-critical` successor this scopes). The `practice-on/off` rename (its own small step *after* this).
- 0h held.

## Part A — Open under the protocol
Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min) — tier, model selection, risk class, signals.
2. **ADR-012** in full + the predecessor close.
3. **ADR-010** (`adopted/adr/2026-06-19-stoic-fidelity-dikaiosyne-weighting.md`) — the apatheia/dikaiosyne gap (§1–3 the bridge as built; **§4 the root correction this battery scopes**) + the mentor record it cites.
4. The scoring engine: `website/src/lib/.../layer2-mechanism` (`applyMechanisms` → `computeProximity`), the proximity-domain `weakest()` rule (`website/src/lib/sage-reflect/proximity-domains.ts`, KP-04), and the calling/reflect scorers (`/api/calling`, `/api/practice/reflect`). Confirm current behaviour first-hand (PR11 — verify against code, not memory).
5. Memories: `sage-practice-measurement-instrument-reframe`, `deterministic-l2-measures-apatheia-not-dikaiosyne`, `verdict-battery-test-the-default-threshold`, `gate1-harness-channel-law`.

Confirm at open: tier (`code-elevated`, repo-only); 0h held; status vocab; that this is a *measurement-validity* benchmark (does the score track quality), **not** a decision-change benchmark.

## Part B — Procedure

### Step 1 — Assemble a quality-graded artifact set
Decision artifacts of **known, varied** quality, spanning the failure modes the engine must catch:
- a **missed dispositive fact** vs a **caught** one — use the S6 **stark** scenarios (Meridian/Helios/Solstice), where caught-vs-missed is a known quality delta;
- a **yield-to-pressure** vs a **quarantine** — synthesize from the borderline material (this session's runs are a source of *good* ones; author *bad* ones);
- a **calm injustice** (the apatheia trap — **highest-priority probe**: a serene, well-reasoned decision that wrongs a non-consenting party);
- a **destructive-action assent** (agentic).
Include **synthetic** failures (deliberately-authored bad artifacts) to span the range without waiting for real ones. Author + score these repo-only (no creds).

### Step 2 — Run each through the scoring engine
Drive the deterministic Layer-2 (`applyMechanisms` → `computeProximity`) in a **repo-only test harness** (the existing `tsx` battery pattern; no prod, no creds). Capture the score (`katorthoma_proximity` + the per-domain proximities) + the structured assessment + (where relevant) the narrative.

### Step 3 — Score the SCORING (the three validity checks)
- **(a) Worse-scores-worse.** Does a fact-missing artifact score *below* a fact-catching one? Does a **calm injustice score LOW** (not `principled`)? Check **discrimination** (scores spread by quality) + **correct ordering** + **diagnosticity** (does the record identify *what* was off).
- **(b) Four-stage.** Extend beyond reasoning/assent to **calling** (does it read role-appropriateness correctly) + **reflection** (does it catch a dishonest self-review). Phase if needed — reasoning/assent first, then calling/reflection.
- **(c) Adversarial / gaming-robustness.** Construct artifacts designed to **game** the score — serene, well-formatted, virtue-vocabulary-laden reasoning that is actually wrong/unjust — and confirm the engine does **not** reward them. This is the model-creator/weights prerequisite (a training target is optimized by construction; the engine must be robust, not just correct on a fixed set).

### Step 4 — Diagnose + scope the §4 fix
Quantify where the engine fails (expect the calm-injustice / apatheia band per ADR-010). The results **scope the ADR-010 §4 root correction** — per-domain proximity + dikaiosyne weighted natively in `computeProximity` (reuse KP-04 `weakest()`), obligation-resolution as a required oikeiosis field — its own `code-critical` successor on shared `/api/reason` determinism. Do **not** change the engine this session (that's the successor); this session *measures + scopes*.

### Step 5 — Decision-log + close (lean form)
Per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry" + §"Lean session close". Record the battery results + the scoped §4 fix as the carried Critical successor.

## Part C — Anticipated session shape
| Phase | Estimate |
|---|---|
| Cache + ADR-012/010 + engine read | 30–40 min |
| Step 1 (artifact set) | 45–60 min |
| Step 2 (run) | 20–30 min |
| Step 3 (the three checks) | 60–90 min |
| Step 4 (scope §4) | 30 min |
| Decision-log + close | 30 min |
| **Total** | **~4 hours** |

## Rollback
`git revert` the battery commit — it is a repo-only test harness + synthetic artifacts; nothing prod/live. No flag, no schema, no credential.

## Forecast
Ends with the **scoring-validity battery built + run**, the apatheia/dikaiosyne gap (and any others) **quantified**, and the **ADR-010 §4 engine root-fix scoped** as the carried `code-critical` successor — the prerequisite for the honest practice-mode profile claim, the future logos-mode, and the future model-creator signal. **Then** the `practice-on/off` rename (its own small step). The 0h launch call remains the founder's.

End of prompt.
