# Private-Mode Response Specification

**Status:** **Adopted 2026-05-14** under `D-FOUR-MODE-SPECS-ADOPTED-2026-05-14` — moved `/drafts/` → `/adopted/substrate-modes/`. **Implementation status:** Designed (per 0a vocabulary) — the mode is specified, not built; the build session is deferred (and Critical-tier when it comes, per R17f). (Decision status `Adopted` and implementation status `Designed` are distinct 0a taxonomies, stated separately per the standing cache's Element 7.)
**Stream:** founder.
**Name:** "private" (renamed from "educational" — founder decision 2026-05-14). The original "educational" framing (learners understanding the framework) is dropped; private mode is the individual's own developmental-practice rendering.
**Supersedes scope:** the "educational" mode entry in the original A6 row of `/adopted/substrate-plugin-staging-plan.md`. This specification re-scopes and renames it. Private mode is also, in effect, **the substrate-based replacement for the existing private mentor** — making it both a new mode and a K-category migration item.
**Companion specs:** `/archive/2026-05-14_agent-mode-response-spec-superseded.md`, `/adopted/substrate-modes/philosophical-mode-response-spec.md`, `/adopted/substrate-modes/standard-mode-response-spec.md`. Private mode shares the mandatory wraps, the Layer 2 source, the score architecture, and the reflection component with all three. It is closest to standard mode structurally (plain English, Summary Response, observational field detail) but **inverts the profile-data discipline**: what the other three modes exclude per R17e, private mode includes — because the consumer IS the data subject.
**F3 fold-in (per `/operations/agentic-commerce-findings-downstream-order.md`):** The private-mode response shape is the developmental-practice rendering of the Layer3Response substrate-consultation-mandate, with the profile-aware sections (Development Arc, Iterative refinement, Cross-submission patterns) added.

---

## Purpose

**Private mode** is the individual's developmental-practice rendering — the Layer 3 mode for the private mentor. It is the only mode that surfaces profile-level data, because the consumer **is** the data subject, operating within their own mentor relationship (per R17e: passion profiling results are "private to the individual and their mentor relationship").

The other three modes all serve someone looking at a single assessment. Private mode serves the person looking at their own **developmental arc** — where they were, where they are, where the work is heading — with the single assessment framed as one data point within the longer view.

Founder direction 2026-05-14: private mode should match what the existing private mentor does well (it "does this very well now"), rendered through the translation-sandwich substrate rather than the bundled-prose method. The withholding mechanism is what keeps the developmental arc honest — it withholds what the history cannot establish, so the arc does not over-claim.

---

## How the existing private mentor stores and retrieves context (discovery, 2026-05-14)

This section records what the build session inherits.

**Storage — two Supabase tables:**

| Table | Contents |
|---|---|
| `mentor_profiles` | The `encrypted_profile` column — the aggregated practitioner profile, R17b encrypted at rest. Built by the journal-ingestion pipeline. Canonical shape `MentorProfile`: `founder_facts` (biographical), `proximity_level` + `senecan_grade`, `passion_map[]` (sub_species, root_passion, frequency-bucket, false_judgement), `virtue_profile[]` (domain, strength, evidence), `causal_tendencies[]` (failure_point, description, frequency), `value_hierarchy[]` (item, declared/observed classification, gap_detected), `oikeiosis_map[]` (person_or_role, oikeiosis_stage, relationship, reflection_frequency), preferred indifferents. (A legacy shape `MentorProfileData` exists, read-time-adapted via `mentor-profile-adapter.ts`.) |
| `mentor_interactions` | The raw interaction history. Hub-scoped (`private-mentor` / `founder-mentor`). Queried with a window — default 90 days / 100 most recent rows (`mentor-interactions-loader.ts`). |

**Retrieval — `loadMentorProfile(userId)`** (`mentor-profile-store.ts`) decrypts and returns `{ profile, summary }`. `practitioner-context.ts` exposes three context builders:

- `getPractitionerContext(userId)` — condensed (~300-500 tokens), for product-facing endpoints + the public mentor
- `getFullPractitionerContext(userId)` — full profile summary (~7,500 chars), **private-mentor-only** (founder-only)
- `getProjectedPractitionerContext(userId, topic)` — topic-projected (40-60% smaller), keyword-matched to the conversation

**It is not "last ten entries in memory."** It is a persisted encrypted profile plus a windowed query of the interactions table.

**Files the build session must read in full:** `/website/src/app/api/mentor/private/reflect/route.ts` (the reflect route — how the context is assembled and wired), `/website/src/lib/context/mentor-context-private.ts` (context assembly), `/website/src/lib/context/practitioner-context.ts` (the three context builders), `/website/src/lib/mentor-profile-store.ts` (the loader), `/website/src/lib/mentor-profile-adapter.ts` (legacy→canonical read-time adapter), `/website/src/lib/mentor-interactions-loader.ts` (the interactions loader).

---

## The profile-update mechanism — Layer 2 JSON handoff

Founder decision 2026-05-14: **the profile-update source changes from the journal-ingestion pipeline (batch) to a handoff of the Layer 2 JSON output (incremental, every run).**

Today: journal entries + conversations → journal-ingestion pipeline → aggregated `MentorProfile` → stored encrypted in `mentor_profiles`. The profile is rebuilt in batch.

Proposed: every time Layer 2 runs for the subject, the Layer 2 JSON assessment is handed off and folded into the subject's encrypted profile. The profile stays current automatically — no batch rebuild required.

**This can be done securely.** The handoff writes through the *existing* encryption pipeline — the same one the journal-ingestion pipeline already uses for `mentor_profiles.encrypted_profile`. No new at-rest plaintext location is created; R17b is preserved. The journal-ingestion pipeline can remain as a supplementary source (or be retired once the handoff is proven), but the incremental Layer 2 handoff becomes the primary update path.

**The Layer 2 JSON is the universal profile-update unit.** Same currency, different storage by consumer privacy need:

| Consumer | Profile storage | Profile update |
|---|---|---|
| Human (private mode) | Server-side, encrypted in `mentor_profiles` | Layer 2 JSON handoff → write through the encryption pipeline |
| Agent (agent mode) | Wrapper-side, carried by the agent's wrapper | Wrapper accumulates Layer 2 JSON outputs; carries them back via the `carried_profile` Layer 1 input field |

**Build-session note:** the handoff is a write to the most intimate data the system holds. Per R17f, designing and wiring it is Critical-tier — the Critical Change Protocol applies. The handoff must be idempotent (re-running Layer 2 on the same input must not double-count), and the fold-in logic (how a single Layer 2 assessment updates the aggregated `passion_map` / `virtue_profile` / `causal_tendencies` frequencies) must be specified — likely a build-session ADR.

---

## Layer 1 input placeholder fields

Private mode requires these additions to the Layer 1 input schema. Names are placeholders — the build session confirms final naming against the existing Layer 1 schema conventions.

| Field | Purpose |
|---|---|
| `subject_identity_binding` | The authenticated subject's identity. **The R17e gate** — private mode cannot be called about anyone else. This field is what triggers the server-side load of the subject's encrypted profile (the human equivalent of the agent's `carried_profile`). |
| `reflective_self_report` | The practitioner's own account of what was operative for them. **Closes the reflection-component loop** — when provided, the motivation and eupatheia classifications are not withheld. |
| `history_window` | How far back to draw trajectory + cross-submission data (mirrors the existing interactions-loader's windowDays/limit; default 90 days / 100 rows). |
| `topic_signal` *(optional)* | The current entry's topic, for the topic-projection logic that `practitioner-context.ts` already implements (`detectTopicSignal` / `projectProfile`) — lets private mode project the profile to the dimensions relevant to this entry rather than loading the full ~7,500-char summary every time. |

For agents, the parallel Layer 1 fields are `carried_profile`, `profile_provenance`, `peer_agent_assessments`, and `objective_function_declaration` — specified in `/adopted/substrate-modes/sage-assent-wrapper-spec.md` §"Layer 1 implications". `subject_identity_binding` (private, human) and `carried_profile` (agent) are the parallel identity/profile-bearing fields — server-side encrypted load for humans, wrapper-carried for agents.

The four-mode work surfaced eight Layer 1 input field additions in total — four from private mode (above), four from the Sage Assent Wrapper, none from philosophical or standard mode. The consolidated set and the build approach are carried in the Layer 1 code-changes next-session prompt (`/operations/handoffs/founder/2026-05-14-layer1-schema-additions-NEXT-SESSION-PROMPT.md`).

---

## Section ordering

The text and HTML renderings follow this order:

1. **Mandatory opening wrap (R3 disclaimer)**
2. **Title + Input observed**
3. **Summary Response** — development-arc-aware: the digest situates the current assessment within the trajectory. (Founder confirmed 2026-05-14: the development-arc-aware Summary is good.)
4. **Development Arc** *(the distinctive private-mode section)* — where the practitioner was, where they are, where the work is heading. Sits high, right after the Summary. The withholding mechanism keeps the "where it's heading" part honest — it withholds what the history cannot establish rather than predicting.
5. **Verdict**
6. **Score breakdown**
7. **Overall score** — includes the **direction score** (see below)
8. **Field-by-field detail** — Layer 2 sections (Passion diagnosis, Control filter, Circles of concern, Value assessment, Appropriate-action assessment, Proximity to right action, Virtues engaged, Improvement path, **Iterative refinement** — rendered here, excluded everywhere else — Open deferrals when fired, Stage scores, Hasty-assent risk, Ambiguity notes)
9. **Cross-submission patterns** *(distinctive private-mode section)* — recurring findings across the practitioner's history
10. **Source material** — three retrieved Stoic passages keyed to the principal findings
11. **Mandatory closing wraps** — R19c + R19d + R18e

**No standalone "Reflection component" section.** Founder decision 2026-05-14: the dedicated section "added nothing of value." The reflection component still operates — its *effect* is visible where it lands: when the `reflective_self_report` is provided, the Iterative refinement section shows the motivation classification as determined ("not withheld this entry"); when it is absent, an Open deferral renders in the field-by-field detail with the `withheld_classification` structure, exactly as in the other three modes.

---

## Distinctive private-mode sections

### Development Arc

Three-part structure, populated from `iterative_refinement` + cross-submission patterns + the historical sources (`mentor_profiles` profile + `mentor_interactions` history):

- **Where you were** — earlier observations of the pattern from the history
- **Where you are** — the current position; the stable/improving/declining trajectory; what this entry's `reflective_self_report` adds that the trajectory data alone would not show
- **Where the work is heading** — the next developmental movement. **The withholding mechanism governs this part**: it states only what the history establishes, and explicitly withholds what cannot be determined ("whether this naming will hold under the next instance is not determinable from this entry alone — that is for the trajectory to show").

Build-session note: the Development Arc should be checked against what the existing private mentor's reflect output produces today — founder direction is that the private mentor "does this very well now," so private mode should replicate the parts that work rather than re-derive from first principles. This requires reading the reflect route + `mentor-context-private.ts` in detail at build time.

### Iterative refinement

The `iterative_refinement` fields — `direction_of_travel`, `senecan_grade`, `progress_dimensions` (passion_reduction, judgement_quality, disposition_stability, oikeiosis_extension), `motivation_classification` — rendered as their own section. Excluded from agent / philosophical / standard modes per R17e; **surfaced in private mode because the consumer is the data subject**.

### Cross-submission patterns

Recurring findings across the practitioner's history: recurring false judgements, persistent passions, the developmental timeline, prior mentor-conversation echoes. Drawn from `mentor_profiles` + `mentor_interactions`. Surfaced in private mode only.

---

## Score handling

Founder decision 2026-05-14: the same score architecture as the other three modes is fine (kathekon gate + components + quality multiplier + precision band — see `/archive/2026-05-14_agent-mode-response-spec-superseded.md` §"Component score"). Two private-mode additions:

### Direction score

A numeric score on the trajectory, companion to the qualitative `direction_of_travel` enum. The qualitative enum (improving / stable / declining / single_snapshot) is rendered alongside a numeric direction score so the practitioner can see trajectory as a value, not only a label — and so the HTML rendering can graph it over time.

**The direction-score formula is not yet specified.** Like the main score formula, it should be mentor-consulted before the build — the founder's private mentor signed off on the main score weights; the direction score (how `progress_dimensions` and `direction_of_travel` combine into a scalar) warrants the same grounding. Flagged as a pre-build mentor-consultation item.

### HTML graphed-over-time

Founder direction 2026-05-14: the HTML rendering (v2, website-only) should include **graphed-over-time displays** — the score and the direction score plotted across the practitioner's history. This is private-mode-specific (the other modes are per-response; only private mode has the trajectory data to graph). The HTML v2 effort for private mode therefore includes time-series charts, on top of the concentric-circle target visualisation shared with the other modes.

The score and direction score sit in the "additional detail" zone (Overall score section). Per-response score values are safe under R17e; the trajectory graph is profile data, safe in private mode because the consumer is the subject.

---

## Tone, vocabulary, formatting

Inherited from standard mode: plain English (Greek replaced; approximate English for the four hard terms — `prohairesis → moral choice`, `kathekon → appropriate action`, `katorthoma → right action`, `oikeiosis → circles of concern`); English-but-technical terms kept and glossed lightly per section; observational field detail with the development-arc-aware Summary leaning second-person where it connects to the practitioner's situation; no softening of the deterministic finding; `/api/reason` disciplines folded in; markdown formatting convention.

The Summary Response uses the same LLM-rephrased-from-deterministic-base + grounding-validator + deterministic-fallback architecture as standard mode (see `/adopted/substrate-modes/standard-mode-response-spec.md` §"The Summary Response"). The grounding validator's allowed-concept set, for private mode, includes the profile data the deterministic base draws on.

---

## R17 compliance — the heaviest engagement of the four modes

Private mode operates on and surfaces the most intimate data the system holds. **Every sub-rule of R17 engages, and the build is Critical-tier.**

| Sub-rule | Private-mode engagement |
|---|---|
| R17a — bulk profiling prevention | The `subject_identity_binding` field gates the mode: private mode verifies the consumer IS the data subject before any profile data is loaded or surfaced. It cannot be called about a third party. |
| R17b — application-level encryption | The profile is encrypted at rest in `mentor_profiles.encrypted_profile`. The Layer 2 JSON handoff writes through the existing encryption pipeline — no new at-rest plaintext location. |
| R17c — genuine deletion | The practitioner must be able to genuinely delete the profile private mode draws on, including the accumulated Layer 2 handoff history. |
| R17d — local-first consideration | The build session evaluates whether the most intimate extractions (the equivalent of trigger maps / contradiction maps) should be local-only rather than server-side. |
| R17e — "private to the individual and their mentor relationship" | Private mode **is** that surface. This is the rule that makes private mode legitimate where the other three modes must exclude profile data. |
| R17f — Critical Change Protocol | The private-mode build touches access control, encryption, and intimate data. The build session follows the full Critical Change Protocol. Unlike agent / philosophical / standard (Standard-tier builds), **the private-mode build is Critical-tier.** |
| R17g / R17h / R17i — SAR / rectification / portability | Private mode's profile data is exactly what the GDPR access / rectification / portability rights operate on (A15b / A15c / A15d in the staging plan). Private mode's data model should be designed compatibly with those endpoints. |

---

## Cross-mode relationships

| Concern | Agent | Philosophical | Standard | Private |
|---|---|---|---|---|
| Primary consumer | Software agent | Human inspector | Public human practitioner | The individual, in their own developmental practice |
| Profile data | Wrapper-carried (opt-in) | Excluded (R17e) | Excluded (R17e) | **Surfaced** (consumer is the subject) |
| `iterative_refinement` | Available when carried profile supplied | Excluded | Excluded | **Rendered** |
| Distinctive sections | Score vector, gaming defences | — | Summary Response | **Development Arc, Cross-submission patterns** |
| Profile update unit | Layer 2 JSON, wrapper-accumulated | n/a | n/a | Layer 2 JSON, server-side-encrypted handoff |
| Summary Response | No | No | Yes | Yes (development-arc-aware) |
| Source material | No | Yes | Yes | Yes |
| Direction score | No | No | No | **Yes** |
| HTML | JSON + compact prose | JSON + text + HTML (target viz) | JSON + text + HTML (target viz) | JSON + text + HTML (target viz **+ graphed-over-time**) |
| Build risk tier | Standard | Standard | Standard | **Critical** (R17f) |
| Mandatory wraps | All six | All six | All six | All six |

---

## Worked example

See `/drafts/private-mode-example.md` — the team-channel scenario given a three-month history and a `reflective_self_report`, reviewed during the 2026-05-14 scoping session ("excellent — as good as real private mentor"). The example demonstrates the Development Arc, the rendered Iterative refinement section, Cross-submission patterns, the closed-loop reflection component (effect visible in Iterative refinement rather than a standalone section), and the score behaviour with the self-report provided.

Note: the example file still carries the standalone "Reflection component" section that the founder later judged "added nothing of value." When this spec moves Draft → Adopted, the example should be regenerated without that section, with the reflection-component effect shown only in the Iterative refinement section.

---

## Cross-references for the future build session

- `/manifest.md` §R3 / §R8a / §R17 (all sub-rules — heaviest engagement) / §R18a / §R18e / §R19c / §R19d / §R20a / §AC1 / §AC2 / §AC4 / §AC9 / §AC10 / §AC11
- `/archive/2026-05-14_agent-mode-response-spec-superseded.md` — companion; the `carried_profile` mechanism is the agent parallel to private mode's server-side profile
- `/adopted/substrate-modes/philosophical-mode-response-spec.md` — companion
- `/adopted/substrate-modes/standard-mode-response-spec.md` — companion; private mode inherits standard mode's base (Summary Response, plain English, tone, disciplines)
- `/drafts/private-mode-example.md` — the reviewed worked example
- `/website/src/app/api/mentor/private/reflect/route.ts` — the existing private mentor reflect route; private mode is its substrate-based replacement
- `/website/src/lib/context/practitioner-context.ts` — the three context builders (condensed / full / projected)
- `/website/src/lib/context/mentor-context-private.ts` — context assembly
- `/website/src/lib/mentor-profile-store.ts` — `loadMentorProfile()` loader
- `/website/src/lib/mentor-profile-adapter.ts` — legacy→canonical read-time adapter; `MentorProfileData` + `MentorProfile` shapes
- `/website/src/lib/mentor-interactions-loader.ts` — the windowed interactions loader
- `/website/src/lib/translation-sandwich/layer2-mechanisms.ts` — `Layer2Assessment` shape, `OpenDeferralEntry` + `withheld_classification`
- `/website/src/lib/rag/retrieve-passages.ts` — source-material retrieval (Option A, shared with philosophical + standard)
- `/adopted/substrate-plugin-staging-plan.md` §A6 row + the K-category migration scope (private mode IS a K-category migration item)
- `/operations/agentic-commerce-findings-downstream-order.md` §F3

---

## Open questions deferred to build

1. **The Development Arc against the real private mentor.** Read the reflect route + `mentor-context-private.ts` in detail; replicate what the private mentor does well rather than the first-principles three-part arc in the example.
2. **The Layer 2 JSON handoff fold-in logic.** How does a single Layer 2 assessment update the aggregated `passion_map` / `virtue_profile` / `causal_tendencies` frequencies? Idempotency (re-running on the same input must not double-count). Likely a build-session ADR. Critical-tier per R17f.
3. **The direction-score formula.** Not yet specified. Mentor-consultation item before the build — the same grounding the main score formula got.
4. **Layer 1 input field final naming.** `subject_identity_binding`, `reflective_self_report`, `history_window`, `topic_signal` are placeholders — confirm against the existing Layer 1 schema conventions.
5. **Journal-ingestion pipeline disposition.** Once the Layer 2 JSON handoff is proven, does the journal-ingestion pipeline retire, remain supplementary, or stay primary for journal-sourced data? Sequencing decision.
6. **K-category intersection.** Private mode is the substrate replacement for the private mentor. Confirm whether the private-mode build IS the private-mentor K-category migration, or runs alongside it.
7. **HTML v2 graphed-over-time.** Time-series charts on top of the concentric-circle target viz. Separate design effort; needs the trajectory data model settled first.
8. **Topic projection.** Whether to reuse `practitioner-context.ts`'s existing `detectTopicSignal` / `projectProfile` logic, or design private-mode-specific projection.
9. **Test fixture strategy.** Verify: R17e gate (private mode rejects non-subject calls); the Layer 2 JSON handoff (idempotent, encryption-pipeline-routed); the Development Arc honesty (withholding mechanism withholds what history can't establish); Iterative refinement rendered; Cross-submission patterns; the closed-loop reflection component; the direction score; the Summary Response rephraser architecture.

---

*End of spec. Status: Adopted 2026-05-14 (document); Designed (implementation). Build session deferred — and Critical-tier when it comes (R17f). Authored 2026-05-14 in scoping/exploration session; adopted 2026-05-14 under D-FOUR-MODE-SPECS-ADOPTED-2026-05-14. All four modes of the taxonomy (philosophical / standard / private / the Sage Assent Wrapper) are now specified and adopted.*
