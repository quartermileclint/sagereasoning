# Session Close — 2026-05-10 — Stage 1 A3 Adopted: Layer 2 Signing Infrastructure ADR

**Stream:** founder.
**Governing frame:** /adopted/standing-protocol-cache.md + /adopted/build-sessions-protocol-cache.md.
**Tier:** governance — Standard risk on the ADR drafting; **Elevated** on the file move from /drafts/ to /adopted/. Lean templates per the standing cache.
**Date:** 2026-05-10.
**Predecessor close:** /operations/handoffs/founder/2026-05-10-stage-1-a2-verified-close.md
**Predecessor decision-log entries:** D-A2-INPUT-VALIDATION-SURFACE-2026-05-10, D-A1-FLAG-FLIP-VERIFIED-2026-05-10, D-A1-INVOCATION-SITE-2026-05-10, D-A1-LAYER2-AUTH-SCAFFOLD-2026-05-10, D-STAGING-PLAN-ADOPTED-2026-05-10.
**Session prompt:** pasted in conversation by founder; not a stand-alone file.

---

## Decisions Made

- **D-A3-LAYER2-SIGNING-ADR-ADOPTED-2026-05-10** appended (lean form). Stage 1 item A3 ADR drafted, founder-approved (Path A elected at session-open), and moved to /adopted/. Four named design choices committed: (1) Ed25519 asymmetric signing; (2) `Layer2Assessment` only as the signed payload; (3) hybrid distribution of the public verification key via both /api/public-key endpoint and plugin manifest's `signing_keys` block; (4) single key with quarterly rotation and 30-day overlap window. Wire format becomes `{assessment, signature, key_id}` in the composed sandwich output's `assessment` field. Critical Change Protocol responses for the eventual A3 scaffolding session drafted ahead of time inside the ADR per PR6 + AC7 discipline.

---

## Status Changes

| Item | Old | New |
|---|---|---|
| Stage 1 item A3 (Layer 2 signing infrastructure) | Scoped (per staging plan; no design) | **Designed** (ADR adopted; four design choices committed; scaffolding session can begin) |
| `/drafts/ADR-layer2-signing-infrastructure.md` | did not exist | created this session, then moved to /adopted/ (predecessor preserved in git history) |
| `/adopted/ADR-layer2-signing-infrastructure.md` | did not exist | **created** — Adopted 2026-05-10; ~440 lines; mirrors ADR-ENCRYPTION-WIRING-01 format |
| Decision status: A3 ADR | did not exist | **Adopted** |
| Build arc | Stage 1 A2 Verified; A3 unblocked for ADR drafting | Stage 1 A3 ADR Adopted; **A3 scaffolding unblocked** for next session (Critical risk; full Critical Change Protocol; PR1 single-endpoint proof on /api/reason) |

---

## Next Session Should

The next session is **Stage 1 item A3 — scaffolding** per the adopted ADR.

**Pre-conditions:**
1. Founder has staged and committed this session's work (see "Founder Verification" block below).
2. Founder has pushed via GitHub Desktop. The session-close commit only touches `/adopted/`, `/operations/decision-log.md`, and `/operations/handoffs/founder/`; no `/website/src/` paths touched, so Vercel will not redeploy. No functional change.
3. Founder is ready to scope A3 scaffolding at session-open. **A3 scaffolding is Critical risk** under PR6 + AC7 (cryptographic signing surface; co-resides with the auth surface on `/api/reason/route.ts`). The full Critical Change Protocol applies. PR1 single-endpoint proof on `/api/reason` first.
4. Founder generates the production Ed25519 signing key (or accepts the AI-suggested generation step) and completes the three-copy backup ceremony before the deploy step. Mirrors the encryption-key custody discipline from ADR-ENCRYPTION-WIRING-01 Decision 4 Option 4A.

**Scope of next session (initial scoping; AI will surface choices at session-open):**
- Generate Ed25519 key pair (`crypto.generateKeyPairSync('ed25519')`).
- Founder backup ceremony for `SUBSTRATE_LAYER2_SIGNING_KEY` (password manager + paper + Vercel env var).
- Implement canonical-JSON helper for `Layer2Assessment` (in-house implementation by default per Open Question 4 in the ADR).
- Implement `signLayer2Assessment(assessment): { assessment, signature, key_id }` helper.
- Wire signing into `runSandwichInner` between Layer 2 production and composed-output construction (parallel-run.ts lines 480–523).
- Add `/api/public-key` endpoint publishing the current + previous public keys.
- Decide wire-format migration strategy at session-open (ADR Open Question 3): versioned response shape vs hard cutover vs feature-flag-gated rollout. Recommendation: feature-flag-gated rollout (`SUBSTRATE_LAYER2_SIGNING_ENABLED`) for safe rollback per the Critical Change Protocol.
- Three production verification scenarios: (1) signing enabled + valid request → 200 with signed-assessment shape and verifiable signature; (2) signing enabled + verification check passes against /api/public-key; (3) signing disabled (rollback path A) → existing bare assessment shape returned (zero regression on existing flow).
- Round-trip + perturbation tests for the canonical-JSON helper and the sign-then-verify path.

**Estimated next-session duration:** 3-4 hours (Critical risk; full Critical Change Protocol writeups; founder approval explicit per AC7).

After A3 scaffolding reaches Verified, the build arc proceeds to **A4 — Key management** (Critical risk; operationalises the rotation procedure drafted in this session's ADR).

---

## Blocked On

**Founder action required before next session begins:**

1. Stage and commit this session's work (decision-log entry + ADR + close).
2. Optional but recommended: read the adopted ADR end-to-end before the scaffolding session so the four design choices and the Critical Change Protocol responses are pre-loaded.

**Files remaining uncommitted:**
- `adopted/ADR-layer2-signing-infrastructure.md` (new file; moved here from /drafts/ in this session)
- `operations/decision-log.md` (D-A3-LAYER2-SIGNING-ADR-ADOPTED-2026-05-10 appended)
- `operations/handoffs/founder/2026-05-10-stage-1-a3-adr-adopted-close.md` (this file)

The /drafts/ predecessor of the ADR was created and removed in this session; the move is preserved in git history (the create + delete will appear as a `mv` in `git log --follow`).

**Production state at session close:** A2 input-validation surface still Verified and live at /api/reason. Vercel state: unchanged from predecessor close; no functional change in this session. Supabase state: unchanged. AC7 disposition: A1 plugin-auth + A2 input-validation surface unchanged; A3 signing not yet scaffolded. The site is in a stable, known-good state.

---

## PR5 — Knowledge-Gap Carry-Forward

Watch-status concepts from predecessor sessions, updated this session:

1. **Apex-domain-redirect-on-POST behaviour at sagereasoning.com.** NOT used this session — no curl tests run; governance-only session. Cumulative count remains at 2 (watch-status). One more recurrence would promote to a permanent KG entry per PR8.

2. **The substrate's three-layer architecture (open Layer 1 + closed Layer 2 + closed Layer 3) and the moat boundary.** Re-cited this session inside the A3 ADR's Context section and Decision 1 reasoning, but **without re-explanation** — the ADR cites `/adopted/ADR-stoic-agent-substrate-concept.md` §"The three layers" + §"The moat boundary" as the canonical reference rather than re-explaining inline. This is the resolution-already-canonical pattern recorded in the predecessor close. Cumulative count not advanced this session because no re-explanation occurred.

3. **The no-current-users governing note's effect on Critical Change Protocol step 3.** Cited inside the A3 ADR's Critical Change Protocol responses (drafted ahead of time for the eventual scaffolding session): "N/A — only founder + test logins exist per the build-arc cache's 'no current users (affirmed 2026-05-10)' governing note. No third-party sessions to invalidate. When the plugin ships and external users exist, this section will require the full Critical Change Protocol step 3 response." Cumulative count = 3 (third recurrence). Per PR8 third-recurrence rule, this concept is eligible for promotion to a permanent KG entry. **However:** the resolution is already canonical via `/adopted/build-sessions-protocol-cache.md` §"Founder governing notes for the duration of the build arc". No new KG entry is needed; the canonical reference already serves the role a KG entry would. The PR8 promotion is recorded here in the close as a "resolution-already-canonical" promotion: subsequent build-arc sessions involving the Critical Change Protocol step 3 read the build-arc cache's governing-notes section instead of re-explaining.

4. **PR1 single-endpoint proof discipline applied to feature-flag-gated functions.** A3 scaffolding will use a feature flag (`SUBSTRATE_LAYER2_SIGNING_ENABLED`) per the Critical Change Protocol response in the ADR. Cumulative count remains at 2 (no new application this session; advances at next-session scaffolding).

5. **Cryptographic-signing payload-vs-hash trade-off.** New this session — surfaced in the four design choices. Cumulative count = 1 (first observation as a named pattern). May recur in B2 (in-plugin Layer 1 R20a script signing decisions) and at Stage 3 D3 (subagent handoff payload signing).

---

## Tacit-knowledge findings (T-series register, per PR8)

**T-AT-LEAST-NEW-1 (re-application).** The three-scenario verification methodology established in the A1 + A2 sessions — (1) valid happy path returns expected 200; (2) invalid path returns expected 400 from the new branch; (3) existing path returns expected 200 (zero regression on existing flow) — is referenced inside the A3 ADR's "Next Session Should" scaffolding scope as the verification pattern for A3 scaffolding. Cumulative count = 3 (third observation as a named pattern). **Per PR8 third-recurrence rule, this is eligible for promotion to a process rule.** Recommended promotion text for the next governance session: "Three-scenario production verification — every Verified-status migration uses (1) new-path happy path returns expected 200; (2) new-path failure path returns expected error from the new branch (proving the new code is what rejected the request, not a fall-through); (3) existing path returns expected 200 (proving zero regression)." The promotion is logged here for visibility; the actual process-rule append happens at a routine governance session per Rule B (do not promote on third recurrence within the same session-arc; allow a sleep cycle for the founder to confirm).

**T-A2-NEW-1 — Validator-throw-to-400-with-preserved-fields.** Not exercised this session (no validation work). Cumulative count remains at 1.

**T-A3-NEW-1 — Critical Change Protocol drafted ahead of time inside the ADR.** New this session — the ADR includes a "Critical Change Protocol responses (for the eventual A3 scaffolding session — drafted here per PR6 + AC7)" section that pre-drafts the six required CCP responses. The scaffolding session inherits these as a starting point rather than starting from scratch. Cumulative count = 1. May recur in any future ADR for Critical-risk implementation work (likely candidates: B2 in-plugin R20a script ADR; A4 key management ADR; A7 server-side R20a gate ADR; A5 Layer 3 service ADR).

**T-A3-NEW-2 — ADR commits Critical-classification of the eventual scaffolding session inside the document, not just by referencing PR6.** New this session — the ADR's AC7 compatibility posture section states "the scaffolding session is **classified as Critical under PR6** because (a) the signing surface is cryptographic infrastructure where bugs have outsized consequences, and (b) the scaffolding session co-resides on the same route file as the auth surface (`/api/reason/route.ts`) so any change to the route invokes AC7-adjacent caution." This pattern (ADR explicitly committing the scaffolding-session classification rather than leaving it to be derived at scaffolding session-open) reduces classification ambiguity. Cumulative count = 1. May recur in subsequent crypto / safety-surface ADRs.

---

## Stewardship findings (F-series register, per PR9)

No catastrophic, long-term-regression, or efficiency-and-stewardship findings opened this session.

---

## Open Questions

1. **Capability-matrix update for the new validation + signing surfaces at /api/reason.** Inherited from A1 + A2 closes; deferred to a routine governance session as part of K-category migration planning. Not urgent. Promoted to a watch-item: the next governance-only session ought to clear this.

2. **Whether the three-scenario verification methodology promotion to a process rule (PR8 third recurrence per T-AT-LEAST-NEW-1 above) should happen at the A3 scaffolding session-close or at a separate governance session.** Recommendation: separate governance session per Rule B's "do not promote on third recurrence within the same session-arc" guidance — but if the founder prefers, the promotion can land in the A3 scaffolding session-close to keep momentum.

3. **Eight downstream ADR/scaffolding open questions inside the A3 ADR §"Open questions parked for downstream ADRs".** Each names the session that resolves it; not requiring resolution this session. Listed inside the ADR for visibility, not re-litigation.

---

## Founder Verification (Between Sessions)

Step-by-step in your own terminal (not in this Cowork session):

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"

# 1. Confirm the ADR is at /adopted/ and not at /drafts/
ls adopted/ADR-layer2-signing-infrastructure.md
ls drafts/ADR-layer2-signing-infrastructure.md 2>&1 | head -1
# Expected: first command lists the file (~440 lines); second command returns
# "ls: ... No such file or directory" (the move is preserved in git history).

# 2. Confirm the ADR's Status header reads "Adopted"
head -5 adopted/ADR-layer2-signing-infrastructure.md
# Expected: line 3 begins with "**Status:** Adopted 2026-05-10 under
# `D-A3-LAYER2-SIGNING-ADR-ADOPTED-2026-05-10`".

# 3. Confirm decision-log entry
grep -nE "^## 2026-05-10 — D-A3-LAYER2-SIGNING-ADR-ADOPTED-2026-05-10" operations/decision-log.md
# Expected: one hit at the bottom of the active log.

# 4. Stage and commit (one session-close commit)
git add \
  adopted/ADR-layer2-signing-infrastructure.md \
  operations/decision-log.md \
  operations/handoffs/founder/2026-05-10-stage-1-a3-adr-adopted-close.md

# (The /drafts/ create + delete is captured automatically by the working-tree
# state; you don't need to add or remove it explicitly.)

git commit -m "Stage 1 A3 ADR Adopted: ADR + decision-log entry + close

D-A3-LAYER2-SIGNING-ADR-ADOPTED-2026-05-10 appended (lean form): A3 ADR
drafted, founder-approved (Path A), moved to /adopted/. Four named design
choices committed: (1) Ed25519 asymmetric signing; (2) Layer2Assessment
only as signed payload; (3) hybrid distribution of public verification
key (API discovery + plugin manifest); (4) single key with quarterly
rotation and 30-day overlap window. Wire format becomes
{assessment, signature, key_id} in the composed sandwich output.

A3 implementation status: Scoped -> Designed.

Critical Change Protocol responses for the eventual A3 scaffolding
session drafted ahead of time inside the ADR per PR6 + AC7 discipline.

Session close (lean form per Elevated-tier session) at
operations/handoffs/founder/2026-05-10-stage-1-a3-adr-adopted-close.md.

Production state: unchanged this session. A2 input-validation surface
still Verified and live at /api/reason. No code touched; no Vercel
redeploy expected.

Next session: A3 scaffolding (Critical risk; full Critical Change
Protocol; PR1 single-endpoint proof on /api/reason; ~3-4 hours)."
```

Then push via GitHub Desktop. The session-close commit only touches `/adopted/` + `/operations/` paths, so Vercel will not redeploy. No functional change.

**Optional governance verification curl** (re-run A2 Scenario 1 to confirm A2 still Verified and the production state has not regressed during this governance-only session):

```bash
curl -X POST https://www.sagereasoning.com/api/reason \
  -H "Content-Type: application/json" \
  -H "X-Plugin-Auth: <PLUGIN_AUTH_SECRET-value-from-vercel>" \
  -d '{"input":"post-A3-adopt verification","depth":"quick","layer1_schema":{"version":"layer1-schema-v1","passions_present":[],"control_filter_elements":[],"oikeiosis_circles_engaged":[],"value_categories_at_stake":[],"kathekon_factors":[],"urgency_indicators":[],"causal_stage_evidence":[],"eupatheia_candidates":[],"stated_concern_targets":[],"stated_equanimity_signals":[],"motivation_stated":false,"motivation_evidence":[],"element_fusion_detected":{"fused":false,"fused_concerns":null},"ambiguity_notes":[]}}' | head -c 400
```

Expected: starts with `{"version":"translation-sandwich-v1","extraction":{"version":"layer1-schema-v1",...` — same as the predecessor close's optional verification curl. If you see this, A2 is still Verified post-A3-adopt and the substrate is in the expected state for the A3 scaffolding session. If anything else, governance-only session somehow regressed something — revert with `git revert HEAD && git push origin main` and report at next session open.

---

## Orchestration Reminder

Per the standing cache and the build-arc cache: the next session's open block reads (1) the standing cache, (2) the build-arc cache, (3) this close, (4) **the adopted ADR `/adopted/ADR-layer2-signing-infrastructure.md` end-to-end** (it's the deliverable-of-the-day for scaffolding), (5) the last 2 decision-log entries (this session's `D-A3-LAYER2-SIGNING-ADR-ADOPTED-2026-05-10` plus a later A3-scaffolding entry as it lands), (6) the existing `/api/reason/route.ts` to see A1 + A2 in context (where A3 signing wires in), (7) the orchestrator `/website/src/lib/translation-sandwich/parallel-run.ts` lines 480–523 (where signing wires between Layer 2 production and composed-output construction), (8) the existing crypto precedents in the codebase (`tier1-token.ts` for module discipline; `checkPluginAuth` for `timingSafeEqual` pattern), and (9) the Layer 2 output shape `/website/src/lib/translation-sandwich/layer2-mechanisms.ts` lines 342–365 (`Layer2Assessment` interface — what canonical-JSON serialisation must handle).

The next session is **Critical-tier** by default (cryptographic signing infrastructure; PR6 + AC7 engage). Full Critical Change Protocol writeups apply to any code change — and the ADR has drafted these CCP responses ahead of time, so the scaffolding session inherits them rather than starting from scratch. The scaffolding session must (a) confirm the inherited CCP responses still apply at session-open, (b) make the wire-format migration strategy decision (ADR Open Question 3; recommendation: feature-flag-gated rollout via `SUBSTRATE_LAYER2_SIGNING_ENABLED`), (c) execute the founder key-generation + backup ceremony before the deploy step, and (d) run the three-scenario production verification per the T-AT-LEAST-NEW-1 pattern.

The PR8 third-recurrence eligibility for T-AT-LEAST-NEW-1 (three-scenario verification methodology) is recorded above in the T-series block. Recommendation per Rule B: do not promote within the A3 scaffolding session itself; promote at a separate routine governance session after a sleep cycle.

The PR8 third-recurrence eligibility for the no-current-users governing note (cited as resolution-already-canonical) is recorded above in the PR5 carry-forward section. The build-arc cache's governing-notes section is the canonical reference; future sessions involving the Critical Change Protocol step 3 read the cache rather than re-explaining inline.

The Critical Change Protocol pre-drafting pattern (T-A3-NEW-1 above) is offered as a recommended approach for subsequent crypto / safety-surface ADRs (B2, A4, A7, A5). It is not promoted to a process rule on first observation per PR8.

---

## Cross-references

- Predecessor close: `/operations/handoffs/founder/2026-05-10-stage-1-a2-verified-close.md`
- This session's prompt: pasted in conversation by founder (not saved to disk by this session)
- Adopted ADR (this session's primary deliverable): `/adopted/ADR-layer2-signing-infrastructure.md`
- Substrate ADR (architectural anchor): `/adopted/ADR-stoic-agent-substrate-concept.md` §"The moat boundary"
- Format-precedent ADR: `/adopted/ADR-ENCRYPTION-WIRING-01.md`
- Adopted staging plan: `/adopted/substrate-plugin-staging-plan.md` Stage 1 item A3 (success criteria for ADR-drafting SATISFIED; A3 implementation status: Scoped → Designed)
- Build-arc cache: `/adopted/build-sessions-protocol-cache.md`
- Standing protocol cache: `/adopted/standing-protocol-cache.md`
- Decision-log entry appended this session:
  - `D-A3-LAYER2-SIGNING-ADR-ADOPTED-2026-05-10`
- Companion canonical references:
  - `D-A2-INPUT-VALIDATION-SURFACE-2026-05-10` (A2 Verified — the validated input contract A3 will sign)
  - `D-A1-FLAG-FLIP-VERIFIED-2026-05-10` (A1 plugin-auth ingress)
  - `D-A1-INVOCATION-SITE-2026-05-10` (A1 wiring)
  - `D-A1-LAYER2-AUTH-SCAFFOLD-2026-05-10` (A1 scaffold)
  - `D-STAGING-PLAN-ADOPTED-2026-05-10` (Stage 1 commitment)
  - `D-M1-CP6-CUTOVER-2026-05-08` (translation-sandwich substrate canonical at /api/reason)
- Code paths cited inside the ADR (read at the next session's open):
  - `/website/src/app/api/reason/route.ts` lines 215–278 (`checkPluginAuth` constant-time comparison)
  - `/website/src/lib/translation-sandwich/tier1-token.ts` (HMAC-signed continuation-token precedent)
  - `/website/src/lib/translation-sandwich/layer2-mechanisms.ts` lines 342–365 (`Layer2Assessment` interface — the payload to be signed)
  - `/website/src/lib/translation-sandwich/parallel-run.ts` lines 480–523 (where signing wires between Layer 2 and composed output)
- Vercel:
  - Production deployment unchanged this session
  - Production env vars unchanged this session
  - **New env var to be provisioned at A3 scaffolding:** `SUBSTRATE_LAYER2_SIGNING_KEY` (Ed25519 private key in PEM format; founder ceremony per ADR Decision 4)
  - **New feature flag to be provisioned at A3 scaffolding (recommendation):** `SUBSTRATE_LAYER2_SIGNING_ENABLED` (default false; flip true after PR1 single-endpoint proof on /api/reason)

*End of session close. The build arc has crossed the threshold from Stage 1 A2 Verified to Stage 1 A3 Designed (ADR adopted). The four design choices that govern Layer 2 signing infrastructure are committed to architecture: Ed25519 asymmetric signing, Layer2Assessment-only payload, hybrid public-key distribution, and single-key quarterly rotation with 30-day overlap. The Critical Change Protocol responses for the scaffolding session are pre-drafted inside the ADR. Next: A3 scaffolding (Critical risk; full Critical Change Protocol; PR1 single-endpoint proof on /api/reason).*
