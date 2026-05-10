# Next-Session Prompt — Stage 1 A3: Layer 2 Signing Infrastructure (ADR Drafting)

**Stream:** founder.
**Tier:** governance (ADR drafting only this session; scaffolding lands later). Lean templates per the standing cache.
**Governing frame:** /adopted/standing-protocol-cache.md + /adopted/build-sessions-protocol-cache.md.
**Predecessor session close:** /operations/handoffs/founder/2026-05-10-stage-1-a2-verified-close.md
**Predecessor decision-log entries:** D-A2-INPUT-VALIDATION-SURFACE-2026-05-10, D-A1-FLAG-FLIP-VERIFIED-2026-05-10, D-A1-INVOCATION-SITE-2026-05-10, D-A1-LAYER2-AUTH-SCAFFOLD-2026-05-10, D-STAGING-PLAN-ADOPTED-2026-05-10
**Risk classification:** Standard under 0d-ii — governance work (ADR drafting; no code change; no production state change). Critical Change Protocol NOT engaged this session. The eventual scaffolding session that implements this ADR will be Critical under PR6 + AC7 and will engage the full CCP at that time.

---

## Founder governing note (still in force for the duration of the build arc)

Per `/adopted/build-sessions-protocol-cache.md` §"Founder governing notes for the duration of the build arc": **No current users.** This governing note will become relevant in the eventual scaffolding session (CCP step 3 = "N/A — only founder + test logins exist; no third-party sessions to invalidate"). It does not directly affect this ADR-drafting session.

---

## Why this session matters

A2 reached Verified last session — plugin-authenticated callers now submit a validated Layer1Schema, and the substrate has a stable validated input contract. A3 is the next item in Stage 1's critical path: **cryptographic signing of Layer 2's authoritative output**. Per the substrate ADR, signing is what makes Layer 2 "authoritative" rather than merely "validated" — every `Layer2Assessment` (or composed sandwich output, or hash thereof — to be decided this session) carries a cryptographic signature that downstream consumers (plugins, subagents, third-party verifiers) can check independently of the substrate.

This session is **ADR drafting only**. The architectural decisions A3 commits — what signing scheme, what payload is signed, what the verifier-side contract looks like, how keys are managed and rotated — are consequential and benefit from being decided deliberately before any code is written. Scaffolding lands in a subsequent session that engages the Critical Change Protocol in full.

A3 also feeds A4 (Key management) and the eventual plugin-side Layer 1 work in Stage 3 (the plugin produces a Layer1Schema that may itself be signed; the substrate signs Layer 2's response; the verifier-side contract is shared infrastructure).

---

## Pre-conditions

1. The session-close commit from the predecessor session is on origin/main.
2. A2 plugin-validation surface is still Verified on production. The optional re-verification curl in the predecessor close confirms this; if the founder did not run it, the next-session AI should run it as part of session-open verification (it is a 30-second governance check, not a deploy).
3. Founder has reviewed the predecessor close's "Open Questions" block (capability-matrix update; richer Layer1Schema test coverage). Neither question requires resolution before A3 begins.
4. Founder is ready to scope A3 ADR at session-open. AI surfaces trade-offs on the four named A3 design questions before the founder elects.

---

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier, model selection, signals; A3 ADR drafting is `governance` category, Standard risk, lean templates apply)
2. `/adopted/build-sessions-protocol-cache.md` (~3 min — substrate architecture; the ADR sits inside this architecture)
3. `/operations/handoffs/founder/2026-05-10-stage-1-a2-verified-close.md` (~5 min — predecessor close)
4. `/adopted/substrate-plugin-staging-plan.md` §"Stage 1 — Backend foundations" — the A3 row + dependencies + Stage 1 success criteria
5. `/adopted/ADR-stoic-agent-substrate-concept.md` §"The three layers" + §"The moat boundary" — the architectural anchor for what signing protects (the moat sits jointly on Layer 2 + Layer 3 and signing is what distinguishes "authoritative" from merely "validated")
6. Last 2 decision-log entries (`D-A2-INPUT-VALIDATION-SURFACE-2026-05-10` + `D-A1-FLAG-FLIP-VERIFIED-2026-05-10`)
7. **ADR-format precedents** (the A3 ADR mirrors these formats):
   - `/adopted/ADR-stoic-agent-substrate-concept.md` (governance ADR; Markdown structure)
   - `/adopted/ADR-ENCRYPTION-WIRING-01.md` (cryptographic ADR — closest precedent for A3; format and reasoning style worth mirroring)
8. **Cryptographic precedents in the codebase** (existing patterns the A3 design may extend or diverge from):
   - `/website/src/lib/translation-sandwich/tier1-token.ts` — existing HMAC-signed continuation-token mechanism (a precedent for stateless signed payloads on this codebase)
   - `/website/src/app/api/reason/route.ts` lines 205-269 — `checkPluginAuth`'s constant-time comparison via `node:crypto`'s `timingSafeEqual` (precedent for crypto-correctness discipline)
9. **The Layer 2 output shape** — what's potentially being signed:
   - `/website/src/lib/translation-sandwich/layer2-mechanisms.ts` — `Layer2Assessment` interface (the deterministic mechanism output)
   - `/website/src/lib/translation-sandwich/parallel-run.ts` lines 480-491 — the composed top-level shape per ADR-004 §2.1 (`{version, extraction, assessment, prose, meta}`)

Confirm at session open: tier (governance, Standard risk default; reclassifies upward only if the session strays into code or commits an architecturally-Critical decision); hold-point status (P0 0h still active); model selection (cite cache row — N/A for ADR drafting; no LLM call); status vocabulary; signals + risk class.

---

## Part B — Procedure

### Step 1 — Founder elects the four A3 ADR design choices (~30-40 min, governance)

Four named design choices the founder elects at session-open. AI presents trade-offs on each before founder elects.

**Design choice 1 — Signing scheme.**
- **(i) HMAC with shared secret** (e.g., HMAC-SHA-256 with 32+ byte secret). Symmetric. Simplest to implement; reuses the `tier1-token.ts` precedent; verifier needs the same secret.
- **(ii) Asymmetric — Ed25519.** Modern; small keys (32-byte public key, 64-byte signature); fast signing and verification; well-supported in modern Node (`node:crypto`) and most ecosystem languages. Verifier needs only the public key.
- **(iii) Asymmetric — ECDSA P-256.** Broader compatibility with older or constrained toolchains; slightly larger keys and signatures; standard `node:crypto`-supported.
- **(iv) Hybrid (HMAC for first-marketplace shipping; asymmetric for ecosystem expansion).** Lowest immediate complexity; commits to a future migration.

**Recommendation default if founder defers:** (ii) Ed25519 — modern, fast, asymmetric (so plugins do not carry HMAC secrets), well-supported in `node:crypto`. Asymmetric is the architecturally-coherent choice for a substrate whose value proposition includes third-party verifiability.

**Design choice 2 — Payload to sign.**
- **(a) `Layer2Assessment` only** — the deterministic mechanism output. Smallest payload; most "moat-aligned" per the ADR (the moat sits jointly on Layer 2 + Layer 3; signing the Layer 2 output is what makes it authoritative, leaving Layer 3 prose unsigned and adaptable per `prose_mode`).
- **(b) Composed sandwich output** — the full `{version, extraction, assessment, prose, meta}` shape. Larger payload; signs everything the consumer sees including the Layer 3 prose.
- **(c) `Layer1Schema` + `Layer2Assessment` together** — signs the input that produced the assessment alongside the assessment itself, enabling reproducibility checks (verifiers can re-run Layer 2 deterministically and confirm the signature).
- **(d) Hash of canonical-JSON of (b)** — sign a deterministic hash of the composed output rather than the payload itself; reduces signature size; introduces canonicalisation requirement.

**Recommendation default if founder defers:** (a) `Layer2Assessment` only — smallest moat-aligned payload; what makes Layer 2 authoritative without entangling the signing infrastructure with Layer 3's prose generation (which is intentionally per-consumer-adaptable per `prose_mode`).

**Design choice 3 — Verifier-side contract (how plugins / agents get the verification key).**
- **(α) Public key embedded in API discovery** (e.g., `/api/agent-card.json` or a dedicated `/api/public-key` endpoint).
- **(β) Public key in plugin manifest** (shipped with the plugin for offline verification).
- **(γ) HMAC secret distributed via plugin-auth onboarding** (only viable if Choice 1(i) HMAC).
- **(δ) Hybrid — public key both online (API discovery) and in plugin manifest.** Defence in depth; supports both online and offline verification.

**Recommendation default if founder defers:** (δ) hybrid — both API discovery and plugin manifest. Plugins get offline verification (works without network); API discovery serves third-party verifiers and enables key rotation without forcing plugin updates immediately.

**Design choice 4 — Key shape and rotation.**
- **(λ1) Single long-lived key.** Simplest. Rotation is a one-shot event with a planned cutover; verifiers reject old signatures after rotation.
- **(λ2) Single key with rotation timeline** (e.g., quarterly). Rotation procedure documented; verifiers must accept signatures from the previous-key window during overlap (e.g., 30 days).
- **(λ3) Key per major version of Layer 2.** Signatures are tied to the substrate-version that produced them. Architectural; complicates verifier logic; protects against semantic drift between substrate versions.

**Recommendation default if founder defers:** (λ2) single key with quarterly rotation. Standard cryptographic hygiene; verifiers tolerant during overlap window; rotation procedure documented and operationalised in A4 (Key management).

The combination of these four choices is the substantive content of the A3 ADR.

### Step 2 — Draft the A3 ADR (~1.5-2 hr, governance)

Per the elected combination of design choices. Mirror the format of `/adopted/ADR-ENCRYPTION-WIRING-01.md` (closest precedent for cryptographic-substrate work) and `/adopted/ADR-stoic-agent-substrate-concept.md` (governance ADR structure). Required sections:

- **Status header** (Drafted YYYY-MM-DD; Adopted later via founder approval; the ADR moves to `/adopted/` at adoption time per preserve-prior-versions principle)
- **Context** — why signing infrastructure now; predecessor entries; the substrate ADR's moat-boundary anchor
- **Decision** — the four elected design choices with concrete specification (algorithm parameters, payload shape, key shape, rotation procedure)
- **Alternatives considered** — the unselected options from each of the four design choices, with reasoning for rejection
- **Consequences** — what changes when the ADR lands in scaffolding; verifier-side contract spec; key-rotation procedure spec; cost shape (signing is near-zero cost; key storage is operational); cross-stage implications (A4 key management; B2 in-plugin Layer 1 signing; G3 marketplace listing trust signalling)
- **Open questions** — anything explicitly deferred to A4, B2, or future sessions

Save the draft to `/drafts/ADR-layer2-signing-infrastructure.md`. Promotion to `/adopted/` happens at the same session as founder approval (could be at session-close approval or in a brief follow-up session).

### Step 3 — Append decision-log entry (lean form, ~20 min)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". Entry ID: `D-A3-LAYER2-SIGNING-ADR-DRAFTED-2026-MM-DD`. Records: the four elected design choices with reasoning; the ADR draft path; cross-references to predecessor entries and the substrate ADR.

If the ADR is also approved and moved to `/adopted/` in the same session, the entry is `D-A3-LAYER2-SIGNING-ADR-ADOPTED-2026-MM-DD` (Elevated risk for the `/drafts/` → `/adopted/` move per the standing cache).

### Step 4 — Session close (lean form, ~20 min)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close". Save to `/operations/handoffs/founder/2026-MM-DD-stage-1-a3-adr-drafted-close.md` (or `...-adopted-close.md` if the ADR also adopts this session).

Next-Session-Should block: **A3 scaffolding** (Critical risk; full Critical Change Protocol applies; PR1 single-endpoint proof on `/api/reason` first). The scaffolding session implements the ADR's elected scheme, wires signature emission into `runSandwichInner`'s Layer 2 output path, and adds a verifier-side endpoint per Choice 3.

---

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + ADR-format references read | 25-30 min |
| Step 1 — design-choice election (4 design questions) | 30-40 min |
| Step 2 — draft ADR | 1.5-2 hr |
| Step 3 — decision-log entry (lean) | 20 min |
| Step 4 — session close (lean) | 20 min |
| **Total** | **~3 hours** |

If the session reaches the 3-hour budget before the ADR is fully drafted, close at the most stable point (founder-approved design choices captured in decision-log; partial ADR draft in `/drafts/`) and resume in the next session. ADR drafting can span sessions without risk because the artefact is governance-only — no production state.

Documented stable points if early closure is needed:
- **After Step 1, before Step 2:** four design choices elected; no draft yet. Decision-log entry can still capture the elections; resume with Step 2 next session.
- **After Step 2 partial:** ADR draft exists in `/drafts/` with some sections complete; remaining sections finished next session.
- **After Step 2 complete, before Step 3:** ADR draft complete; decision-log entry not yet appended. Decision-log + close in next session.

---

## Rollback path

This session writes only governance documents (ADR draft + decision-log entry + close). No code change; no production state change; no Vercel redeploy. Rollback is `git revert` of the session-close commit if the founder decides to retract any of the four design choices; the affected ADR draft is removed from `/drafts/` in the same revert commit. No operational impact.

---

## Forecast

**Most-likely path:** founder elects the four recommended options (Ed25519 + `Layer2Assessment`-only + public-key-in-both-API-discovery-and-plugin-manifest + single-key-with-quarterly-rotation); Step 2 produces a ~150-line ADR mirroring the ADR-ENCRYPTION-WIRING-01 format; Steps 3 + 4 close the session at ~3 hours. ADR moves from `/drafts/` to `/adopted/` either at session-close approval or via a brief follow-up session.

**Possible variations:**
- Founder elects (i) HMAC for the first-marketplace shipping case — ADR explicitly names the HMAC-to-asymmetric migration path as a future work item; A3 scaffolding (next-but-one session) becomes simpler.
- Founder elects (iii) ECDSA P-256 instead of Ed25519 — minimal effect on session shape; ADR content adjusts; signing/verification reference snippets in the ADR change.
- Founder defers Choice 4 (key rotation) to a separate ADR — Step 2 budget shrinks; A3 ADR ships without the rotation contract; rotation becomes a follow-up sub-decision before A4 begins.
- Founder elects Choice 2(c) `Layer1Schema` + `Layer2Assessment` together — ADR's "Consequences" section grows to cover reproducibility-check semantics; cross-stage implications (B2 in-plugin Layer 1 signing) become more entangled with A3.

**What success looks like at session close:**
- Four design choices captured in decision-log + ADR draft.
- ADR draft at `/drafts/ADR-layer2-signing-infrastructure.md` (Designed status per 0a; Adopted decision-status if also approved this session).
- A3 implementation status moves Scoped → Designed.
- Lean session close at `/operations/handoffs/founder/2026-MM-DD-stage-1-a3-adr-drafted-close.md`.
- Next session named: **A3 scaffolding** (Critical risk; full Critical Change Protocol; PR1 single-endpoint proof on `/api/reason`).

End of prompt.
