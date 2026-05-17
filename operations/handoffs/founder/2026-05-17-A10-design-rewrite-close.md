# Session Close — 2026-05-17 — A10 Design Rewrite

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol — `governance` row → **Lean** template) + `/adopted/build-sessions-protocol-cache.md` (build-arc context — "no current users" governing note applies; moot this session since no code lands).
**Tier:** `governance` — **Standard** risk under 0d-ii. Lean template. Critical Change Protocol NOT engaged. AC7 NOT engaged. PR6 NOT engaged.
**Date:** 2026-05-17.

Session #5 of 6 in the post-6b arc tail. Rewrote `/adopted/atl-a10-design.md` in full to integrate three things that changed since the original A10 design was adopted: Finding 1's `owner_user_id` + `agent_id` correction; Option D billing posture (no integration; `agent_accreditation.loop_id` for JOIN traceability); pass-through fields integration (per-credential scoping + AccreditationPayload typical-class exposure + aggregates-only persistence). `D-ATL-A10-DESIGN-LOCKED-REWRITE-2026-05-17` appended to the decision log; predecessor `D-ATL-A10-DESIGN-LOCKED-2026-05-16` Status amended to `Superseded by D-ATL-A10-DESIGN-LOCKED-REWRITE-2026-05-17` in the same operation.

**Part A** — read both caches; the predecessor pass-through fields build close; the A10 design (predecessor) in full; the 2026-05-16 brainstorm close Part 2 in full (Finding 1 source); the pass-through fields design §Integration §A10 + §Option D billing subsections in full; the billing-model design (Decision A + `loop_billing_events` schema); the last 3 decision-log entries; targeted code reads (`evaluation.ts`, `atl-wrapper.ts`, `accreditation-record.ts`); `/api/api-keys-schema.sql` for the production schema (Finding 1's source-of-truth). PR11 inbox scan: no new files since the predecessor close. PR15 consult: bespoke election justified — substrate-internal auth + credential surface design has no Anthropic primitive substitute; the existing `api_keys` + `validateApiKey` infrastructure IS the production-adjacent reusable primitive (strengthened by Finding 1 correction — the columns already exist).

**Step 0** — three scope-confirmation questions via AskUserQuestion; founder elected all three Recommendations (rewrite-in-full not addendum; three decisions as scoped; three separate AskUserQuestion rounds).

**Step 1** — Decision 1 (owner_user_id + agent_id correction). Production schema confirmed: `agent_id TEXT` (line 75); `owner_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL` (line 77 — NOT `auth.users(id)` as the original design said); `idx_api_keys_owner_user_id` already exists (line 105). Three candidates surfaced; founder elected (b) — keep `public.profiles(id)` reference target; add CHECK constraint `CHECK (purpose != 'atl_write' OR (agent_id IS NOT NULL AND owner_user_id IS NOT NULL))` to enforce the load-bearing NOT NULL invariant at the schema level. Migration narrows: only `purpose` + `revoked_at` are NEW columns; `agent_id` + `owner_user_id` reused.

**Step 2** — Decision 2 (loop_billing_events integration). Three candidates surfaced; founder elected (a) — **no direct integration**. credential_audit handles A10 lifecycle events; write-path POST is not separately metered (double-bill concern); build adds nullable `loop_id UUID` column to `agent_accreditation` for downstream JOIN-based forensic traceability.

**Step 3** — Decision 3 (pass-through fields integration; three sub-decisions). All three batched into one AskUserQuestion call; founder elected all three Recommendations:
- **3a** — (b) Nullable scoping columns on api_keys for `scope_downstream_identity_model` + `scope_path_posture` (NULL = no restriction; opt-in scoping per credential; enforcement at verification time via extended `validateAtlWriteToken` + new `'wrong_scope'` failure reason).
- **3b** — (a) All four typical_* fields exposed on AccreditationPayload (matches existing `typical_deliberation_breadth` + `typical_kathekon_quality` pattern).
- **3c** — (a) Aggregates only — typical_* persist on `agent_accreditation`; raw EvaluatedAction history NOT persisted (deferred under PR7).

**Step 4** — rewrote `/adopted/atl-a10-design.md` in full (predecessor preserved in git history). New banner; new "What changed from the predecessor design" section; Decisions A–I restated with three sub-sections marked "**Updated 2026-05-17**" (Decisions C, D, E primarily; B + H minor); NEW "Integration with adjacent surfaces" section with three sub-sections (§Option D billing, §Pass-through fields, §A6/A7 R20a perimeter); build-session implementation summary table updated to reflect narrower api_keys migration + new agent_accreditation migration + extended AccreditationPayload + extended security.ts; cross-references expanded.

**Step 5** — founder verification via AskUserQuestion: "Yes — proceed to decision-log + close." No edits requested.

**Step 6** — `D-ATL-A10-DESIGN-LOCKED-REWRITE-2026-05-17` appended (lean form per Standard, ~120 lines because it captures three sub-decisions with their alternatives + adopted positions); predecessor `D-ATL-A10-DESIGN-LOCKED-2026-05-16` Status line amended in the same operation.

**Step 7** — this close.

## Decisions Made

- **`D-ATL-A10-DESIGN-LOCKED-REWRITE-2026-05-17`** appended (lean form per Standard risk). Status: Adopted. **Supersedes** `D-ATL-A10-DESIGN-LOCKED-2026-05-16` (predecessor entry's Status amended in the same operation). Three sub-decisions adopted: (1) Finding 1 correction with `public.profiles(id)` reference + CHECK constraint enforcement; (2) no direct loop_billing_events integration + loop_id column on agent_accreditation for JOIN traceability; (3a) nullable scoping columns on api_keys + (3b) all four typical_* fields on AccreditationPayload + (3c) aggregates-only persistence.

## Status Changes

| Item | Old | New |
|---|---|---|
| `/adopted/atl-a10-design.md` | **Adopted** (decision; predecessor design) / **Designed** (implementation) | **Adopted** (decision; rewrite Supersedes predecessor) / **Designed** (implementation; rewrite integrates three changes) |
| `D-ATL-A10-DESIGN-LOCKED-2026-05-16` (decision-log entry) | **Adopted** | **Superseded by D-ATL-A10-DESIGN-LOCKED-REWRITE-2026-05-17** |
| `D-ATL-A10-DESIGN-LOCKED-REWRITE-2026-05-17` (decision-log entry) | did not exist | **Adopted** |
| A10 build session (session #6 of the post-6b arc tail) | Scoped (against the predecessor design) | Scoped (against the rewritten design) — same risk class (Critical); same expected time (~3–4 hr); broader scope (now includes agent_accreditation migration + AccreditationPayload extension + scope-check at verification + extended writer + extended types) |
| Production state | substrate at A7 Verified; Option D Live + Verified; pass-through fields Verified; both ATL tables empty; `SUBSTRATE_WRITE_PATH_ENABLED` UNSET; `SUBSTRATE_LAYER3_ENABLED` UNSET; `SUBSTRATE_R20A_GATE_ENABLED` UNSET; `/api/reason` byte-identical (emits six X-Loop-* headers on every billable response); `/api/substrate/layer3` returns 503; `/api/accreditation/[agent_id]` Live (GET 404 / POST 503) | **Unchanged at session close** — no code, no schema, no env, no production exposure this session |

## Next Session Should

**Session #6 of the post-6b arc tail — A10 build.** `code-critical` tier; **Critical** risk under 0d-ii. Full Critical Change Protocol applies (per `/adopted/standing-protocol-cache.md` §"Critical-risk sessions"); full session-close template (Verification Method Used + Risk Classification Record + PR5 + Founder Verification + Orchestration Reminder per the predecessor encryption-wiring close). Estimated **~3–4 hr**.

The build implements the rewritten design. Scope: schema migrations (api_keys ALTER for purpose + revoked_at + 2 scope columns + CHECK constraints + indexes; new credential_audit table; agent_accreditation ALTER for 4 typical_* columns + loop_id column + CHECK constraints); security.ts extensions (validateAtlWriteToken with CarriedProfile-based scope check; generateAtlWriteToken; logAtlVerifyEvent; requireAdmin; resolveProfileId helper); new admin endpoint at `/api/admin/accreditation-credentials`; route.ts auth-gate swap at `/api/accreditation/[agent_id]` (signature extension + body parsing + scope check); writer library extension (4 typical_* + loop_id); AccreditationPayload + AccreditationRecord type extensions; buildAccreditationPayload extension; full test coverage including new wrong_scope and scope-mint paths; ADMIN_USER_EMAIL env var addition. PR1 single-build proof applies. PR6 NOT engaged (no R20a / distress-classifier surface). After this session lands, the post-6b arc closes — the substrate carries authenticated read AND write public surfaces, both auditable.

The next-session prompt for #6 is **not yet written** — to be drafted between sessions (or at session open) based on the rewritten `/adopted/atl-a10-design.md`. The prompt at `/operations/handoffs/founder/2026-05-16-A10-build-NEXT-SESSION-PROMPT.md` (deferred from the 2026-05-16 close) needs full rewriting against the new design before use — its Decision-C-aligned scope no longer matches.

Plus the independent **Stripe-Price-ID follow-on session** (Standard-to-Elevated; ~30–60 min) — pending accountant + lawyer engagement per the 2026-05-17 Addendum. Not blocking on A10 build.

Plus the deferred **Layer 3 prose anomaly investigation** (Standard-risk; ~30–60 min; potentially escalates to Elevated if identifier-leakage is confirmed as R3 PII adjacency concern) — to be scheduled when the founder elects. Carries forward from the predecessor close.

## Blocked On

**Files remaining uncommitted (to be committed by the founder per the Founder Verification block below):**

```
 M operations/decision-log.md                                                       (D-ATL-A10-DESIGN-LOCKED-REWRITE-2026-05-17 appended; predecessor Status amended)
 M adopted/atl-a10-design.md                                                        (rewritten in full)
?? operations/handoffs/founder/2026-05-17-A10-design-rewrite-close.md               (NEW — this close)
```

**Production state at session close:** **unchanged from session open**. Substrate at A7 Verified. Option D per-loop metering Live + Verified end-to-end. Pass-through fields Verified end-to-end. Stripe test-mode wiring Verified; Stripe live activation Deferred. `SUBSTRATE_WRITE_PATH_ENABLED` UNSET. `SUBSTRATE_LAYER3_ENABLED` UNSET. `SUBSTRATE_R20A_GATE_ENABLED` UNSET. `/api/reason` byte-identical (emits six X-Loop-* headers on every billable response per Option D). `/api/substrate/layer3` returns 503. `/api/accreditation/[agent_id]` Live (GET 404 / POST 503). Both ATL tables empty. **No type-system, schema, env, or runtime behaviour change this session.**

## Open Questions

- **A10 build session (session #6 of the post-6b arc tail).** Critical risk; ~3–4 hr. Revisit condition: this rewrite Adopted (now). The next-session prompt for #6 needs to be drafted between sessions or at session open against the rewritten design.
- **Source-of-truth port-mirror reconciliation** (carries forward from `D-PASS-THROUGH-FIELDS-BUILD-WIRED-VERIFIED-2026-05-17`). The A10 build will further drift the source-of-truth files (extending `AccreditationRecord` + `AccreditationPayload` in `/trust-layer/types/accreditation.ts`). Standard-risk governance session could reconcile. Revisit condition: a future session intends to pull from source-of-truth.
- **Layer 3 prose degenerate-repetition anomaly** (carries forward from `D-PASS-THROUGH-FIELDS-BUILD-WIRED-VERIFIED-2026-05-17`). Separate Standard-risk investigation session (~30–60 min; potentially escalates to Elevated). Revisit condition: founder elects to schedule.
- **Orphaned-credential auto-revocation** (NEW this session). `ON DELETE SET NULL` on `api_keys.owner_user_id` means a deleted profile leaves an orphaned credential with NULL `owner_user_id`; the CHECK constraint then makes that row's `purpose='atl_write'` status inconsistent. Build session has discretion: immediate auto-revocation (recommended) OR admin-detect-and-revoke periodic job. Revisit condition: real profile-deletion scenarios surface OR audit reports an orphaned row.
- **All other open questions from the predecessor `D-ATL-A10-DESIGN-LOCKED-2026-05-16`** carry forward at the same revisit conditions, plus these additions from the rewrite: per-vendor scoping (extends Decision 3a beyond identity_model + path_posture); R20a risk_class derivation from pass-through fields; raw EvaluatedAction history persistence on a new evaluated_action_history table; Option C tiered-per-action billing implementation; per-credential billing tiers; webhook on credential-driven billing events; scope-check telemetry separation from auth-failure telemetry; wider scope check; bulk-issuance flow. Revisit conditions per the rewritten design document.

## Founder Verification

**Two things to do, in order. Take them one at a time — do not paste the multi-line blocks as one command per the CLAUDE.md note about prompt-consumption.**

### 1. Read the rewritten design

Open `/adopted/atl-a10-design.md` in a text viewer. Confirm:
- The banner marks the rewrite as `Supersedes D-ATL-A10-DESIGN-LOCKED-2026-05-16`.
- "What changed from the predecessor design" section names the three integrations.
- Decision C's "Updated 2026-05-17" subsection captures the Finding 1 narrowing + CHECK constraint.
- Decision E's "Updated 2026-05-17" subsection captures the CarriedProfile-based scope check + new `wrong_scope` failure reason.
- The new "Integration with adjacent surfaces" section has three sub-sections (§Option D billing, §Pass-through fields, §A6/A7 R20a perimeter).
- Build-session implementation summary table reflects the narrower api_keys migration + new agent_accreditation migration.

If anything looks wrong, message me before committing — edits to a governance design are Elevated under 0d-ii but easier in-session than post-commit.

### 2. Commit and push

Use targeted adds (explicit paths, not `git add -A`). Run each command on its own line.

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
```

```
rm -f .git/index.lock
```

```
git add operations/decision-log.md
```

```
git add adopted/atl-a10-design.md
```

```
git add operations/handoffs/founder/2026-05-17-A10-design-rewrite-close.md
```

Then the commit (one command, multi-line message — paste the whole block including the closing `"`):

```
git commit -m "A10 design rewrite — Finding 1 correction + Option D posture + pass-through fields integration

Session #5 of 6 in the post-6b arc tail. Rewrites /adopted/atl-a10-design.md
in full to integrate three things changed since D-ATL-A10-DESIGN-LOCKED-2026-05-16:

1. Finding 1 correction (Decision 1): owner_user_id + agent_id already exist
   on api_keys per /api/api-keys-schema.sql lines 75 + 77; owner_user_id
   references public.profiles(id) not auth.users(id) as the original design
   assumed. Migration narrows: only purpose + revoked_at are NEW columns.
   Added CHECK constraint enforcing NOT NULL invariant for purpose='atl_write'
   rows at the schema level (defence-in-depth at near-zero cost).

2. Option D billing posture (Decision 2): NO direct integration with
   loop_billing_events. credential_audit handles A10 lifecycle events;
   write-path POST is not separately metered (the wrapper's triggering
   /api/reason call already emitted the billing row; separately metering
   would double-bill). Build session adds nullable loop_id UUID column to
   agent_accreditation for downstream JOIN-based forensic traceability.

3. Pass-through fields integration (Decision 3, three sub-decisions):
   - 3a: nullable scoping columns on api_keys (scope_downstream_identity_model,
     scope_path_posture) for per-credential scoping; verification-time check
     via extended validateAtlWriteToken + new 'wrong_scope' failure reason.
   - 3b: all four typical_* fields exposed on AccreditationPayload
     (typical_operation_class, typical_target_system_vendor,
      typical_outcome_verification, typical_reversibility_signal).
     Matches existing typical_deliberation_breadth + typical_kathekon_quality
     pattern.
   - 3c: aggregates-only persistence — typical_* persist on agent_accreditation
     as additive nullable columns. Raw EvaluatedAction history NOT persisted
     (deferred under PR7).

Predecessor design D-ATL-A10-DESIGN-LOCKED-2026-05-16 Status amended in the
same operation: 'Superseded by D-ATL-A10-DESIGN-LOCKED-REWRITE-2026-05-17'.
The predecessor design is preserved in git history.

Standard risk under 0d-ii. Governance only; no code, schema, env, or
production exposure. AC7 not engaged; PR6 not engaged. Critical Change
Protocol not engaged (engages at A10 build session #6).

Next: session #6 — A10 build (Critical; ~3-4 hr; closes the post-6b arc).

Per D-ATL-A10-DESIGN-LOCKED-REWRITE-2026-05-17."
```

Then push via **GitHub Desktop**.

**Expected Vercel behaviour:** no rebuild — only governance files changed (no TypeScript source files). Production state unchanged.

**No post-deploy smoke-test required this session** — governance documents don't trigger builds; no runtime to test.

## Cross-references

- Operative session prompt: the next-session prompt provided at session open (Next-Session Prompt — Session #5 of the post-6b arc tail: A10 Design Rewrite)
- Predecessor session close: `/operations/handoffs/founder/2026-05-17-pass-through-fields-build-close.md` (session #4 — pass-through fields build Verified)
- Brainstorm source: `/operations/handoffs/founder/2026-05-16-A10-design-pass-close.md` Part 2 (Finding 1 + the seven pass-through fields originally scoped here)
- Design document (rewritten this session): `/adopted/atl-a10-design.md`
- Decision-log entry (this session): `D-ATL-A10-DESIGN-LOCKED-REWRITE-2026-05-17`
- Decision-log entry amended this session (predecessor): `D-ATL-A10-DESIGN-LOCKED-2026-05-16` (Status: Superseded by D-ATL-A10-DESIGN-LOCKED-REWRITE-2026-05-17)
- Predecessor decision-log entries:
  - `D-PASS-THROUGH-FIELDS-BUILD-WIRED-VERIFIED-2026-05-17` (the 7 fields landed; Integration §A10 deferrals carried into Decision 3 of this rewrite)
  - `D-PASS-THROUGH-FIELDS-LOCKED-2026-05-17` (the pass-through fields spec)
  - `D-BILLING-MODEL-BUILD-WIRED-VERIFIED-2026-05-17` (Option D Live; metering layer Decision 2 of this rewrite addresses)
  - `D-BILLING-MODEL-LOCKED-2026-05-17` (Option D spec)
- Production schema source (Finding 1 correction's source-of-truth): `/api/api-keys-schema.sql` lines 75 (`agent_id TEXT`) + 77 (`owner_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL`) + 105 (existing `idx_api_keys_owner_user_id`)
- Production schema (Option D loop_billing_events that Decision 2 of this rewrite addresses): `/api/migrations/option-d-billing-schema.sql`
- Files touched (3 total this session):
  - `/operations/decision-log.md` — new entry appended; predecessor Status amended
  - `/adopted/atl-a10-design.md` — rewritten in full (predecessor preserved in git history)
  - `/operations/handoffs/founder/2026-05-17-A10-design-rewrite-close.md` (NEW — this close)
- F-tracker: `/operations/agentic-commerce-findings-downstream-order.md` (F1 + F2 + F4 future-stage; F3 past A6/A7; none target this session; F4 cross-referenced — A10's `credential_audit` table + new `agent_accreditation.loop_id` together are upstream provenance for A12)
- Governance: `/adopted/standing-protocol-cache.md` (`governance` row → Lean template) + `/adopted/build-sessions-protocol-cache.md` ("no current users" governing note — moot this session since no code lands)
- Manifest: `/manifest.md` §R0 (audit trail authenticity preserved across the supersession); §R5 (Option D's R5-by-construction property unchanged by Decision 2's no-integration posture); §R17 (Decision 1's CHECK constraint + Decision 3a's per-credential scoping are primary R17 engagements at the build session); §R18a (Character Kernel category language preserved); §R18b (badge documentation update deferred); §R18c (additive — third-party verifiers gain richer typical_* signal without breaking); AC7 (NOT engaged this session; engages at A10 build); AC8 (substrate-internal; no Layer 1 contract change); AC10 (credential_audit + agent_accreditation.loop_id together are upstream provenance for A12); KG1 (engaged at build session — every DB write/read awaited); KG7 (NOT engaged); PR1 (single-build proof — A10 build session lands schema + library + admin endpoint + auth-gate swap + AccreditationPayload extension + tests in one session)

*End of session close. The rewritten A10 design integrates the three changes from the post-6b arc tail's session #1–#4 work into one canonical spec. Session #6 (A10 build — Critical) implements the rewrite; after it lands, the post-6b arc closes with substrate carrying authenticated read AND write public surfaces, both auditable, every credential write traceable to a specific agent_id whose identity has been verified at the route boundary AND whose operational scope (identity_model + path_posture) has been checked against the credential's scope columns; AccreditationPayload exposes the four new typical_* fields parallel to the existing pattern; the agent_accreditation surface gains forensic JOIN-traceability to loop_billing_events via the nullable loop_id column; the Option D metering layer remains untouched. Production state unchanged at session close.*
