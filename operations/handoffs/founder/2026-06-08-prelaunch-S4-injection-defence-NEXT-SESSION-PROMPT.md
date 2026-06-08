# Next-Session Prompt — Pre-Launch S4 (dense): A11b injection-defence production go-live (PR6 safety-perimeter) + governance reconcile + limitations-page confirm

Paste this whole file into a new session to proceed.

This is Session 4 of the pre-launch completion plan (`/operations/pre-launch-completion-plan-2026-06-07.md`, adopted 2026-06-07). It is the **safety-perimeter** activation in the sequence, so — per that plan — the spine is kept **clean** and the fill is **low-risk doc/inert only** (no second founder-performed activation bundled in). The spine turns on the A11b prompt-injection defence that is already built, Verified-live on **both LLM seams** on TEST (2026-06-03), and deployed **inert** in production behind one unset flag.

A11b is a **code-only defence** — there is **no database table and no migration** (unlike S1/S2/S3). The S4 production change is a single Vercel env flag + redeploy. What raises the care level is **PR6**: the two seams (Layer 1 `extractFeatures`, Layer 3 `generateProse`) are safety-adjacent, so the activation must preserve the **R20a distress-redirect behaviour exactly** (verified identical flag-ON vs flag-OFF).

**Stream:** founder. **Tier:** `code-critical` — **Critical** under 0d-ii (deployment-config env-flag activation on the live `/api/reason` request path). **PR6 ENGAGED** (safety-adjacent LLM seams). AC7 not engaged. No schema/migration. Full Critical Change Protocol (0c-ii), walked live (PR17). Governing frame: `/adopted/standing-protocol-cache.md` §"Critical-risk sessions" + `/adopted/build-sessions-protocol-cache.md`.

**Predecessor closes:** `/operations/handoffs/founder/2026-06-08-prelaunch-S3-abuse-detection-activation-close.md` (S3; most recent — A19 abuse-detection activation), `/operations/handoffs/founder/2026-06-03-A11b-combined-flag-on-test-probe-close.md` (the authoritative A11b activation + verification-matrix reference — **read in full at open**).
**Predecessor decision-log entries:** `D-PRELAUNCH-S3-ABUSE-DETECTION-ACTIVATION-2026-06-08`, `D-A11B-COMBINED-FLAG-ON-TEST-PROBE-VERIFIED-LIVE-2026-06-03`.
**Plan context:** `/operations/pre-launch-completion-plan-2026-06-07.md` (this is its S4).

**Risk classification:** Critical under 0d-ii — a deployment-configuration change (env flag activating the injection-defence on the live deployment). **PR6 engaged** — the Layer-1 + Layer-3 seams sit adjacent to the R20a distress path; the Critical Change Protocol's safety-invariant check (R20a redirect identical flag-ON vs OFF) is mandatory. No code/schema change this session (the defence code shipped 2026-06-03).

## Why this session matters

A11b is the substrate's prompt-injection hardening: Layer 1 rejects or fences injected instructions in the user input; Layer 3 neutralises untrusted spans before prose generation. It is built and Verified-live on both seams on TEST; in production it sits inert behind one unset flag (`SUBSTRATE_INJECTION_DEFENCE_ENABLED`). Turning it on is a security win for both audiences and a pre-launch enabler. Because it is a flag-only activation (no table), it is operationally simpler than S2/S3 — but PR6 raises the diligence: the activation must not change how a distressed user is handled. The verification is therefore a **TEST-parity adversarial probe re-run, then a production probe**, with the R20a invariant explicitly confirmed.

## Decisions to settle at open (founder elects; AI presents with a recommendation)

**Decision 1 — Confirm A11b as the S4 spine.** Per the completion plan sequence (S4 = injection-defence). Recommendation: yes.

**Decision 2 — Keep the PR6 spine clean (do NOT bundle a second activation).** The completion plan directs that safety-perimeter activations (A11b, R20a) keep their spine clean and take only low-risk doc/inert fill; the A11b build close explicitly says "do not bundle" the injection-defence production activation. The A19 two-structural-detector TEST pass + production rollout (carried forward from the S3 close) is **available** but recommended to run as its own short step (or fold into S5 fill), **not** inside this PR6 session. Recommendation: keep the A11b spine clean; defer the A19 rollout to its own slot. (If the founder prefers to bundle the A19 rollout, run the A11b spine to full verified-disposition **first**, then the A19 rollout as a clearly separated second activation.)

**Decision 3 — Governance reconcile scope.** The component registry shows "only 2 live" (the plan flagged this) and the staging plan's A11b/A12/A19 status cells predate the S1–S4 activations. Recommendation: reconcile staging-plan + registry statuses to production truth this session (low-risk governance fill; it is the honest-capability-inventory groundwork for S8).

## Pre-conditions (AI verifies by read at open; founder confirms)

1. Working tree clean enough to add a commit; no `.git/index.lock` (if present: `rm -f .git/index.lock` first — founder runs git; AI does read-only git inspection only).
2. `main` up to date with `origin/main`; Vercel green (founder confirmed at the S3 close push).
3. S3 is done — A19 `request_velocity_anomaly` Live in production; `abuse_signals` Live; the two structural detectors inert behind `SUBSTRATE_ABUSE_DETECTION_ROLLOUT_ENABLED` (UNSET prod). AI confirms by reading the S3 close + `D-PRELAUNCH-S3-ABUSE-DETECTION-ACTIVATION-2026-06-08`.
4. A11b code is committed + deployed, inert. AI confirms by read: the gate `SUBSTRATE_INJECTION_DEFENCE_ENABLED` lives in `website/src/lib/translation-sandwich/injection-defence.ts` (`isInjectionDefenceEnabled()` → `=== 'true'`), applied at `layer1-extractor.ts` + `layer3-prose.ts`. Default UNSET → OFF.
5. **No migration** — A11b is code-only; there is no `abuse_signals`/`substrate_audit_events`-style table to create. AI confirms there is no A11b migration file before writing the procedure.
6. The verification matrix + expected outputs are in the A11b combined-flag close (2026-06-03). AI reads it in full at open and reproduces the benign + adversarial + distress request bodies and their expected flag-ON behaviours (Layer-1 reject → `fallback:true`/`layer1_throw` + fail-closed log; Layer-1 fence-and-continue → on-task; Layer-3 neutralise → on-task + neutralise log; benign equivalence; **R20a distress redirect identical flag-ON vs OFF**).
7. Hosts: production is served at `www.sagereasoning.com` (apex `sagereasoning.com` 307-redirects to `www` — established in the S3 session); any production curl targets `www.`. Production Supabase ref `jdbefwkonfbhjquozgxr`; TEST ref `iwdtrvuphogkwmovhnvz` (for the TEST-parity probe via `npm run dev` + `.env.development.local`).
8. The AI does no Vercel, git, or Supabase operations — the founder performs the TEST-parity probe, the env-flag change + redeploy (Vercel), and the commit (GitHub Desktop), each walked live (PR17). There is no token to mint (A11b has no service endpoint).

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min) — Critical tier; §"Critical-risk sessions"; signals; AI-failure-modes table incl. prescribe-before-grounding + PR17.
2. `/operations/pre-launch-completion-plan-2026-06-07.md` — this session is its S4; confirm the safety-perimeter "clean spine, low-risk fill" intent.
3. `/operations/handoffs/founder/2026-06-08-prelaunch-S3-abuse-detection-activation-close.md` — most-recent production state.
4. `/operations/handoffs/founder/2026-06-03-A11b-combined-flag-on-test-probe-close.md` — the A11b activation + verification matrix (the deliverable-of-the-day; read in full).
5. `website/src/lib/translation-sandwich/injection-defence.ts` + the two seam gates in `layer1-extractor.ts` + `layer3-prose.ts` — confirm the flag gate, the fail-closed/fence/neutralise behaviour, and the PR6 boundary (the seams are LLM-adjacent; the R20a classifier path is separate).
6. `/manifest.md` — targeted: R8d (injection defence), R6d, R20a perimeter + the relevant AC rows; the PR6 safety boundary.
7. `/operations/decision-log.md` last 3 entries.

Confirm at open (narrate before any action): where we are in the arc (S4 of the completion plan; A11b built + Verified-live on TEST, deployed inert; S3/A19 velocity Live); what's queued behind; what's awaiting the founder vs the AI; tier = Critical; **PR6 ENGAGED — state the R20a distress-invariant requirement explicitly**; PR17 engaged; status vocabulary; model selection N/A for the defence itself (deterministic fencing/neutralising; the seams' Sonnet model choice is unchanged — cite AC1); PR15 (no Anthropic-canonical primitive substitutes for a Vercel flag flip — state explicitly).

## Part B — Procedure

Order: TEST-parity probe (PR6 diligence) → set the flag in Vercel Production → redeploy → verify in production (benign equivalence + adversarial + **R20a invariant**) → only then the low-risk governance fill.

**Step 0 — Confirm current production state (AI read-only + founder one check).**
- AI confirms by read: `SUBSTRATE_INJECTION_DEFENCE_ENABLED` UNSET → OFF; A11b inert; `/api/reason` byte-identical.
- Founder baseline: one benign `/api/reason` call via the `/admin/test-reason` page (authenticated, standard depth) → a normal assessment, no distress redirect. This is the flag-OFF "before" state.

**Step 1 — Critical Change Protocol brief (AI completes visibly before the founder runs anything) — 0c-ii, PR6.**
1. *What is changing:* `SUBSTRATE_INJECTION_DEFENCE_ENABLED=true` (Vercel Production) + redeploy. After it, the Layer-1 and Layer-3 seams fence/neutralise/reject injected instructions on the substrate path.
2. *What could break:* a benign input could be over-rejected (Layer-1 fail-closed → minimal fallback) — bounded by the benign-equivalence check; **the R20a distress path must stay identical (PR6)** — verified explicitly flag-ON vs OFF.
3. *Existing sessions:* no auth/session/encryption change; no users yet. `/api/reason` behaviour changes only for injection-bearing inputs; benign inputs equivalent.
4. *Rollback (founder-runnable):* unset `SUBSTRATE_INJECTION_DEFENCE_ENABLED` + redeploy → byte-identical flag-OFF behaviour. No data, no migration to undo.
5. *Verification:* Step 2 (TEST-parity probe) + Step 4 (production benign equivalence + one adversarial + one distress, R20a identical).
6. *Explicit approval:* founder says "OK / go ahead" specific to the named PR6 safety risk before Step 3.

**Step 2 — TEST-parity adversarial probe (founder, walked live) — PR6 diligence.**
Re-run the 2026-06-03 probe shape on TEST (`npm run dev` against `.env.development.local` → TEST ref `iwdtrvuphogkwmovhnvz`; set `SUBSTRATE_INJECTION_DEFENCE_ENABLED=true` in that file, never `.env.local`). Run the benign + 4–5 adversarial + 1 distress matrix flag-OFF then flag-ON; confirm Layer-1 reject/fence, Layer-3 neutralise, benign equivalence, and the **R20a distress redirect identical** flag-ON vs OFF. Remove the TEST flag at teardown. (Exact request bodies + expected outputs come from the A11b combined-flag close — AI supplies them.)

**Step 3 — Set the flag in Vercel Production, then redeploy (founder, walked live).**
vercel.com → SageReasoning → Settings → Environment Variables → add `SUBSTRATE_INJECTION_DEFENCE_ENABLED` = `true`, Environments = **Production** only → Save. Then Deployments → latest Production → ⋯ → Redeploy → wait for green.

**Step 4 — Verify the activation in PRODUCTION (Critical verification step, PR6).**
Against `www.sagereasoning.com` (via `/admin/test-reason` for authenticated calls): (a) a benign input → normal assessment, equivalent to flag-OFF; (b) one adversarial input → Layer-1 reject (`fallback:true`) or fence-and-continue (on-task, injection not steering); (c) one distress input → **R20a redirect identical to flag-OFF** (the PR6 invariant). Disposition: A11b → **Live (production)**. Proceed to fill only now.

**Step 5 — (Fill, low-risk governance) Reconcile status to production truth.**
Update `/adopted/substrate-plugin-staging-plan.md` + `component-registry.json` so statuses reflect production reality: S1 data-rights Live, S2 OTel Live, S3 A19 velocity Live + 2 detectors inert, A11b → Live (after Step 4). Correct the registry "only 2 live" gap. This is the honest-capability-inventory groundwork for S8. (Use the registry skill per the cache for `component-registry.json`.)

**Step 6 — (Fill, low-risk) Confirm the existing R19c limitations page.**
The limitations page already exists (`website/src/app/limitations/page.tsx`, built under A18b). Confirm it is deployed + live in production (open the URL), and review its wording for R19 honesty (the "in preparation for legal review — not a compliance claim" posture). **No new drafting** — confirm + note any gaps for the lawyer-review queue (`/compliance/lawyer-review-queue.md`).

**Step 7 — Decision-log entry (Critical form).**
Append `D-PRELAUNCH-S4-INJECTION-DEFENCE-ACTIVATION-2026-06-DD`: the Critical-Change-Protocol record (6 points incl. the PR6 R20a-invariant result), the risk classification (activation Critical, PR6 engaged; governance fill Standard), the rollback path, and the founder-performed verification result (TEST-parity probe + production benign/adversarial/distress + R20a identical). Status changes: `SUBSTRATE_INJECTION_DEFENCE_ENABLED` → set (Production); A11b → Live (production).

**Step 8 — Session close (full Critical form) + commit.**
Per the cache §"Critical-risk sessions" (Verification Method Used, Risk Classification Record, PR5, Founder Verification, Orchestration Reminder). The A11b activation is a **flag flip — no code change**; the only repo changes are the governance reconcile (staging plan + registry) + decision log + close, so the commit is **docs/registry only** (the redeploy that activated the flag already happened in Step 3). Provide the exact `rm -f .git/index.lock` + `git add`/commit block.

## What is NOT in this session

- **No A19 detector rollout bundled into the PR6 spine** — the A19 two-structural-detector TEST pass + production rollout (`SUBSTRATE_ABUSE_DETECTION_ROLLOUT_ENABLED`) is its own short step; do not dilute the safety-perimeter spine (Decision 2). 
- **No new limitations-page drafting** — it already exists (A18b); Step 6 only confirms + honesty-reviews it.
- **R19d mirror principle is COMPLETE** — propagated across 18 surfaces (`D-A18-MIRROR-PROPAGATION-2026-06-07`, `D-R19D-ALL-TOOLS-2026-06-07`); it is **not** an S4 item. The only residual is the deliberate `/api/reason` + `/api/guardrail` mirror-exclusion (a flagged open question, not S4 scope).
- **No migration, no enforcement, no token** — A11b is a code-only flag with no table and no service endpoint.
- **No A10 / Layer3 / R20a-rendering activation** — later sessions (S5/S6).

## Rollback path

Unset `SUBSTRATE_INJECTION_DEFENCE_ENABLED` (or set ≠ `true`) + redeploy → `/api/reason` byte-identical to flag-OFF. No data, no migration, no token to undo. The governance/registry edits are reversible via git revert (docs only).

## Forecast

Most likely: the TEST-parity probe re-confirms the matrix (Layer-1 reject/fence, Layer-3 neutralise, benign equivalence, R20a redirect identical); the founder sets one Vercel flag + redeploys; the production benign call is equivalent, one adversarial input is fenced/rejected, and the distress input redirects identically (PR6 invariant preserved); A11b → Live (production). Then the registry/staging-plan reconcile brings the capability inventory to production truth and the limitations page is confirmed live + honest. One Critical commit (docs/registry only — no code change). After it: the substrate's prompt-injection hardening is live for both audiences, the inventory tells the truth, and the only remaining dark capabilities are A10 metering, Layer 3 rendering, and the R20a rendering/gate refinements. Next in the completion plan: S5 — A10 per-agent identity + metering go-live (and, if not already done, the A19 two-detector rollout as a clean separate step).

End of prompt. Opens on `main`. Critical — full Critical Change Protocol, **PR6 engaged** (R20a distress invariant must be verified identical flag-ON vs OFF); founder runs the TEST-parity probe, sets the env flag + redeploys (Vercel), and the commit (GitHub Desktop), each walked live (PR17). Order: TEST-parity probe → set flag → redeploy → verify (incl. R20a invariant) → governance reconcile → limitations confirm. One-flag rollback.
