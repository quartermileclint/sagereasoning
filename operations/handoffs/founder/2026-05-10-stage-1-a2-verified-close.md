# Session Close — 2026-05-10 — Stage 1 A2 Verified: Layer 2 Input Validation Surface on /api/reason

**Stream:** founder.
**Governing frame:** /adopted/standing-protocol-cache.md + /adopted/build-sessions-protocol-cache.md.
**Tier:** code-elevated. Lean templates per the standing cache.
**Date:** 2026-05-10.
**Predecessor close:** /operations/handoffs/founder/2026-05-10-stage-1-a1-verified-close.md
**Predecessor decision-log entries:** D-A1-INVOCATION-SITE-2026-05-10, D-A1-FLAG-FLIP-VERIFIED-2026-05-10, D-A1-LAYER2-AUTH-SCAFFOLD-2026-05-10, D-STAGING-PLAN-ADOPTED-2026-05-10.
**Session prompt:** pasted in conversation by founder; not a stand-alone file.

---

## Decisions Made

- **D-A2-INPUT-VALIDATION-SURFACE-2026-05-10** appended (lean form). Stage 1 item A2 reaches Verified on `/api/reason`. Plugin-authenticated callers per the substrate ADR submit a pre-computed Layer1Schema alongside the original input text. The route validates the schema via `validateLayer1Schema`, skips server-side `extractFeatures` + `loadLayer1WithFallback`, and feeds the validated schema directly to Layer 2. R20a continues to run on the input text per AC5. Three design choices elected (1(i) + 2(a) + 3(β) — all three recommended options). Three production verification scenarios passed. PR1 single-endpoint proof on `/api/reason` is COMPLETE for A2.

---

## Status Changes

| Item | Old | New |
|---|---|---|
| Stage 1 item A2 (Layer 2 input validation surface) | Scoped (per staging plan; no implementation) | **Verified** (`validatePluginRequest` helper wired; validation branch active on plugin-auth path; three production scenarios passed) |
| `/website/src/app/api/reason/route.ts` | A1 plugin-auth Verified; no Layer1Schema validation | A1 plugin-auth Verified + A2 Layer1Schema validation Wired and Verified |
| `/website/src/lib/translation-sandwich/parallel-run.ts` | `runSandwichInner` always runs `extractFeatures` for Layer 1 | `runSandwichInner` skips `extractFeatures` when `preExtractedLayer1Schema` is supplied (additive; existing path unchanged when field is absent) |
| PR1 single-endpoint proof for A2 on `/api/reason` | Not started | **COMPLETE** |
| Build arc | Stage 1 A1 Verified; A2 blocked on A1 | Stage 1 A2 Verified; **A3 unblocked** for next session per staging plan Session 4 packaging |

---

## Next Session Should

The next session is **Stage 1 item A3 — Layer 2 signing infrastructure** per the staging plan Session 4 packaging.

**Pre-conditions:**
1. Founder has staged and committed this session's work (see "Founder Verification" block below).
2. Founder has pushed via GitHub Desktop. Vercel may redeploy if any /website/src/ paths are touched in the close commit; this session's close commit only touches /operations/, so Vercel is unlikely to redeploy. Either way, no functional change.
3. Founder is ready to scope A3 at session-open. **A3 is Critical risk** (cryptographic signing surface; PR6 + AC7 engage). Per the staging plan and the predecessor session prompt, ADR drafting precedes scaffolding.

**Scope of next session (initial scoping; AI will surface trade-offs at session-open):**
- ADR drafting for A3 — captures the signing scheme. Founder elects between named options at session-open. Likely design questions:
  - HMAC vs asymmetric (Ed25519 / ECDSA) signing?
  - What payload is signed — the Layer1Schema, the Layer2Assessment, the composed sandwich output, or some subset?
  - Verifier-side contract: how do plugins / downstream agents verify signatures? Where do they get the public key (or HMAC secret)?
  - Key shape: rotation interval; who rotates; where keys live; how rotation interacts with already-issued signatures.
- A3 ADR is the entire next-session scope by default; the scaffolding (and PR1 single-endpoint proof) lands in a subsequent session.

**Estimated next-session duration:** ~3 hours (ADR drafting + governance close).

After A3 reaches Verified, the build arc proceeds to **A4 — Key management** (Critical risk).

---

## Blocked On

**Founder action required before next session begins:**

1. Stage and commit this session's work (decision-log entry + close).

**Files remaining uncommitted:**
- `operations/decision-log.md` (D-A2-INPUT-VALIDATION-SURFACE-2026-05-10 appended)
- `operations/handoffs/founder/2026-05-10-stage-1-a2-verified-close.md` (this file)

The Step 2 wiring commit (route.ts + parallel-run.ts) is already on origin/main and deployed.

**Production state at session close:** A2 input-validation surface Verified and live at `/api/reason`. Vercel state: deployed at the A2 wiring commit. Supabase state: unchanged this session. AC7 disposition: A1 plugin-auth still active with the new third precedence tier; A2 added a validation gate (400 on invalid schema; 200 with new ingress on valid schema) before R20a for plugin-auth requests; user-auth + API-key paths unchanged. The site is in a stable, known-good state.

---

## PR5 — Knowledge-Gap Carry-Forward

Watch-status concepts from predecessor session, updated this session:

1. **Apex-domain-redirect-on-POST behaviour at sagereasoning.com.** DID NOT recur this session — founder used `https://www.sagereasoning.com` (canonical) for all curl tests. Cumulative count remains at 2 (watch-status). One more recurrence would promote to a permanent KG entry per PR8.

2. **The substrate's three-layer architecture (open Layer 1 + closed Layer 2 + closed Layer 3) and the moat boundary.** Re-explained inline this session in the A2 doc-comment block, the `validatePluginRequest` JSDoc, and the decision-log entry. **Cumulative count = 3 (third recurrence).** Per PR8 third-recurrence rule, this concept is eligible for promotion to a permanent KG entry. **However:** the resolution is already canonical via `/adopted/ADR-stoic-agent-substrate-concept.md` §"The three layers" + `/adopted/build-sessions-protocol-cache.md` §"The agreed substrate architecture (one paragraph)". No new KG entry is needed; the canonical references already serve the role a KG entry would. The PR8 promotion is recorded here in the close as a "resolution-already-canonical" promotion: subsequent sessions involving substrate work read the ADR + build-arc cache instead of re-explaining.

3. **The no-current-users governing note's effect on Critical Change Protocol step 3.** NOT used this session (A2 is Elevated, not Critical; CCP step 3 was not invoked). Cumulative count remains at 2.

4. **PR1 single-endpoint proof discipline applied to feature-flag-gated functions.** A2 itself is not feature-flag-gated (it's reachable via the plugin-auth path, which is itself flag-gated by `PLUGIN_AUTH_ENABLED`, but A2's branch runs unconditionally when plugin-auth was the successful auth path). Cumulative count remains at 2.

---

## Tacit-knowledge findings (T-series register, per PR8)

**T-AT-LEAST-NEW-1 (re-application).** The three-scenario verification methodology established in the predecessor A1 session — (1) valid happy path returns expected 200; (2) invalid path returns expected 400 from the new branch (proving the new code is what rejected the request, not a fall-through); (3) existing path returns expected 200 (proving zero regression on existing flow) — was re-applied this session for A2 verification. Cumulative count = 2 (second observation as a named pattern). Promote to a process rule on third recurrence.

**T-A2-NEW-1 — Validator-throw-to-400-with-preserved-fields.** Pattern used in `validatePluginRequest`: the canonical validator (`validateLayer1Schema`) throws `Layer1ValidationError` carrying `category` + `field` + `message`; the route helper catches the throw and emits a structured 400 response preserving those fields. The result: callers receive field-specific error info without the route having to duplicate the validator's logic, and changes to the validator's vocabulary automatically flow to the route's error responses without code edits. Cumulative count = 1 (first observation as a named pattern). May become a useful pattern for future validator-wrapping work in route helpers.

---

## Stewardship findings (F-series register, per PR9)

No catastrophic, long-term-regression, or efficiency-and-stewardship findings opened this session.

---

## Open Questions

1. **Capability-matrix update for the validation-surface addition at /api/reason.** Inherited from A1 close; deferred to a routine governance session as part of K-category migration planning. Not urgent.

2. **Richer Layer1Schema test coverage.** The minimal-empty-schema verification exercises the ingress but produces thin Layer 2/3 output. Richer schemas (with actual passions, circles, etc.) will be tested implicitly when a future plugin-side Layer 1 implementation produces real-world schemas; full coverage pending Stage 3 B1.

---

## Founder Verification (Between Sessions)

Step-by-step in your own terminal (not in this Cowork session):

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"

# 1. Confirm the A2 wiring commit is already deployed
git fetch origin main
git log --oneline -3 origin/main
# Expected: the A2 wiring commit ("Stage 1 A2 wired: Layer 2 input validation
# surface on /api/reason") is at the top (or second-from-top after the
# session-close commit, depending on order).

# 2. Confirm decision-log entry
grep -nE "^## 2026-05-10 — D-A2-INPUT-VALIDATION-SURFACE-2026-05-10" operations/decision-log.md
# Expected: one hit at the bottom of the active log.

# 3. Stage and commit (one session-close commit)
git add \
  operations/decision-log.md \
  operations/handoffs/founder/2026-05-10-stage-1-a2-verified-close.md

git commit -m "Stage 1 A2 Verified: decision-log entry + close

D-A2-INPUT-VALIDATION-SURFACE-2026-05-10 appended (lean form): A2 reaches
Verified on /api/reason. Plugin-authenticated callers submit a pre-computed
Layer1Schema; route validates via validateLayer1Schema; sandwich skips
server-side Layer 1 extraction when schema is supplied. Three design
choices elected (1(i) new Layer1Schema ingress + 2(a) R20a on original
text alongside schema + 3(beta) validatePluginRequest wrapper helper).
Three production verification scenarios passed. PR1 single-endpoint
proof complete for A2 on /api/reason.

Session close (lean form per Elevated-tier session) at
operations/handoffs/founder/2026-05-10-stage-1-a2-verified-close.md.

Production state: A2 input-validation surface Verified + live at
/api/reason. Vercel deployed at the A2 wiring commit (already on
origin/main).

Next session: A3 Layer 2 signing infrastructure (Critical risk; ADR
drafting precedes scaffolding; ~3 hours per staging plan Session 4
packaging)."
```

Then push via GitHub Desktop. The session-close commit only touches `/operations/` paths, so Vercel is unlikely to redeploy. If Vercel does redeploy, the redeploy is safe — nothing functional changed in the close commit.

**Optional confirmation curl** (re-run Scenario 1 to confirm A2 still Verified after the close commit):

```bash
curl -X POST https://www.sagereasoning.com/api/reason \
  -H "Content-Type: application/json" \
  -H "X-Plugin-Auth: <PLUGIN_AUTH_SECRET-value-from-vercel>" \
  -d '{"input":"post-close verification","depth":"quick","layer1_schema":{"version":"layer1-schema-v1","passions_present":[],"control_filter_elements":[],"oikeiosis_circles_engaged":[],"value_categories_at_stake":[],"kathekon_factors":[],"urgency_indicators":[],"causal_stage_evidence":[],"eupatheia_candidates":[],"stated_concern_targets":[],"stated_equanimity_signals":[],"motivation_stated":false,"motivation_evidence":[],"element_fusion_detected":{"fused":false,"fused_concerns":null},"ambiguity_notes":[]}}' | head -c 400
```

Expected: starts with `{"version":"translation-sandwich-v1","extraction":{"version":"layer1-schema-v1",...` (the `extraction` field returns the Layer1Schema we sent — proving the schema flowed through the new ingress). If you see this, A2 is still Verified post-close and you're good for the A3 session. If anything else, the close commit somehow regressed something — revert with `git revert HEAD && git push origin main` and report at next session open.

---

## Orchestration Reminder

Per the standing cache and the build-arc cache: the next session's open block reads (1) the standing cache, (2) the build-arc cache, (3) this close, (4) the adopted staging plan §"Items in this stage" for Stage 1 A3 (Critical risk), (5) the last 2 decision-log entries (this session's `D-A2-INPUT-VALIDATION-SURFACE-2026-05-10` plus a later A3-related entry as it lands), (6) the existing `/api/reason/route.ts` to see the now-Verified A2 surface in context (A1 invocation site at lines ~317–333; A2 doc-comment + validation branch at lines ~285+ and inside the POST handler), (7) the orchestrator's signature surface in `/website/src/lib/translation-sandwich/parallel-run.ts` to scope what Layer 2 outputs would be signed, and (8) any prior signing/cryptographic ADRs in the codebase (search `/adopted/` for `ADR-*ENCRYPTION*`, `ADR-*SIGNING*`).

The next session is **Critical-tier** by default (signing infrastructure; PR6 + AC7 engage). Full Critical Change Protocol writeups apply to any code change. ADR drafting itself is governance work and Standard-risk; the writeups engage when scaffolding begins (which may be a different session entirely).

The post-deploy verification methodology used in Step 3 of this session (three scenarios: valid happy path + invalid fail path + existing path regression) is now at second observation as a named pattern (T-AT-LEAST-NEW-1) and remains recommended for any A3 verification step.

The PR8 third-recurrence promotion of the three-layer-architecture concept (resolution-already-canonical) is recorded above in the PR5 carry-forward section. Future sessions involving substrate work should consult `/adopted/ADR-stoic-agent-substrate-concept.md` §"The three layers" + `/adopted/build-sessions-protocol-cache.md` §"The agreed substrate architecture" rather than re-explaining inline.

---

## Cross-references

- Predecessor close: `/operations/handoffs/founder/2026-05-10-stage-1-a1-verified-close.md`
- This session's prompt: pasted in conversation by founder (not saved to disk by this session)
- Adopted staging plan: `/adopted/substrate-plugin-staging-plan.md` (Stage 1 item A2 success criteria SATISFIED for `/api/reason`)
- ADR (J1): `/adopted/ADR-stoic-agent-substrate-concept.md`
- Build-arc cache: `/adopted/build-sessions-protocol-cache.md`
- Standing protocol cache: `/adopted/standing-protocol-cache.md`
- Decision-log entry appended this session:
  - `D-A2-INPUT-VALIDATION-SURFACE-2026-05-10`
- Companion canonical references:
  - `D-A1-LAYER2-AUTH-SCAFFOLD-2026-05-10` (scaffold predecessor for A1)
  - `D-A1-INVOCATION-SITE-2026-05-10` (A1 wiring)
  - `D-A1-FLAG-FLIP-VERIFIED-2026-05-10` (A1 deploy + verification)
  - `D-M1-CP6-CUTOVER-2026-05-08` (translation-sandwich substrate canonical at `/api/reason`)
- Code paths:
  - `/website/src/app/api/reason/route.ts` (A2 doc-comment block + `validatePluginRequest` helper + validation branch in POST handler)
  - `/website/src/lib/translation-sandwich/parallel-run.ts` (`preExtractedLayer1Schema` field on `SandwichInput`; `runSandwichInner` skip branch)
  - `/website/src/lib/translation-sandwich/layer1-extractor.ts` (`validateLayer1Schema` + `Layer1ValidationError` + `Layer1Schema` type — reused unchanged this session)
- Vercel:
  - Production deployment of A2 wiring commit (live)
  - Production env vars: `PLUGIN_AUTH_SECRET` (set, unchanged); `PLUGIN_AUTH_ENABLED=true` (unchanged)

*End of session close. The build arc has crossed the threshold from Stage 1 A1 Verified to Stage 1 A2 Verified. Plugin-authenticated traffic now has a validated input contract: a pre-computed Layer1Schema is the substrate ingress for plugin-auth callers; the validation surface enforces the contract; the schema flows through to Layer 2 with zero server-side Layer 1 work. Next: A3 Layer 2 signing infrastructure (Critical risk; ADR drafting precedes scaffolding).*
