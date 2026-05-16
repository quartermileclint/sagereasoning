# Session Close — 2026-05-16 — A10 Design Pass (step 8 of 8 of post-6b arc — design half)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol — `governance` row → **Lean** template) + `/adopted/build-sessions-protocol-cache.md` (build-arc context — "no current users" governing note applies; CCP step 3 will be moot through the A10 build).
**Tier:** `governance` — **Standard** risk under 0d-ii. Lean template. Critical Change Protocol NOT engaged this session (engages at the A10 build session).
**Date:** 2026-05-16.

---

## What this session did

Produced `/adopted/atl-a10-design.md` (the A10 per-agent-credentials design — nine locked decisions A–I) and appended `D-ATL-A10-DESIGN-LOCKED-2026-05-16` to the decision log. This is the **design half** of step 8 — no code lands this session. The A10 build session (Critical risk; full Critical Change Protocol) follows.

The design's load-bearing finding: the existing `/website/src/lib/security.ts` carries a mature opaque-token system (`api_keys` table + `validateApiKey` function + admin endpoint at `/api/admin/api-keys`) that handles ~95% of what A10 needs — SHA-256 hashing, suspension mechanics, atomic usage tracking, Stripe linkage, admin-authorisation pattern. PR15's operational discipline turned this into the dominant influence on the design: the session elected an "extend existing infrastructure" path (Decision C: extend `api_keys` table with new columns; Decision A: reuse the opaque-token format; Decision D: mirror the existing admin endpoint pattern; Decision E: new validator function in `security.ts` alongside `validateApiKey`). The A10 build is much lighter than a greenfield approach would have been.

**Part A** — read both caches (standing + build-arc); the predecessor write-path build close (`2026-05-16-write-path-build-close.md`); Decision C of `/adopted/atl-write-path-design.md` in full; the kathekon-aligned alternative design (`/adopted/atl-kathekon-aligned-alternative-design.md`) as the structural template (seven-decision design-pass shape; extended to nine here); the three targeted code files (`route.ts` auth-gate site, `security.ts` for auth precedents, `supabase-server.ts` for the persistence seam); the last three decision-log entries (write-path design lock; write-path build wired-verified; the decision-log tail); the agentic-commerce findings tracker (F4 names A10 as the upstream provenance surface for A12); the `.claude/skills/anthropic/` skills folder (17 skills reviewed). PR11 inbox scan: `/inbox/` last-modified 2026-05-15 15:57; no new files since the predecessor write-path build close 2026-05-16. F1 + F2 future-stage; F3 past; F4 partial — folded into Decision H + Decision A's rationale.

**Step 0** — scope confirmed via AskUserQuestion ("Proceed as scoped"): nine-question design pass producing the design document + lean decision-log entry + lean close; ~2.5–3 hr; NOT in scope: code, schema migrations, the A10 build itself.

**Step 1** — eight prompt-named questions surfaced (Q1–Q8) plus one added (Q1.5 — issuance authority + agent_id binding) that the Part A read identified as load-bearing. Founder accepted the nine-question set ("Looks good — proceed") without modification.

**Step 2** — three AskUserQuestion rounds:

| Round | Questions | Founder's elections |
|---|---|---|
| 1 of 3 | Q1 (token format), Q1.5 (issuance authority + binding), Q2 (credential storage) | (d) Opaque token + server lookup; (d) Per-owner-account, founder-only mint pre-launch; (b) Extend `api_keys` table |
| 2 of 3 | Q3 (issuance flow), Q4 (verification placement), Q5 (revocation), Q6 (rotation/expiry) | (b) `/api/admin/accreditation-credentials`; (b) `security.ts` alongside `validateApiKey`; (a) Reuse `is_active` + add `revoked_at`; (a) No expiry, only revocation |
| 3 of 3 | Q7 (audit trail), Q8 (stopgap retirement) | (c) Vercel logs + Supabase audit table; (b) Keep `SUBSTRATE_WRITE_PATH_ENABLED` as kill-switch |

All nine elections matched the AI's recommendations.

**Step 3** — `/adopted/atl-a10-design.md` written in a single Write call, modelled on `/adopted/atl-kathekon-aligned-alternative-design.md`'s seven-decision-pass shape, extended to nine decisions. Each decision section carries Why / Elected position / Why this and not alternatives / Structural constraint / R-rule engagement / Layer 1 implication. The build-session implementation summary table names the expected file changes (1 schema migration for `api_keys` columns + indexes; 1 schema migration for `credential_audit` table; modifications to `security.ts`; new admin endpoint route; modifications to the existing accreditation route; new + modified tests; 1 new Vercel env var `ADMIN_USER_EMAIL` or `ADMIN_USER_ID`).

**Step 4** — founder verification via AskUserQuestion: "Yes — proceed to decision-log + close." No edits requested.

**Step 5** — `D-ATL-A10-DESIGN-LOCKED-2026-05-16` appended to the decision log in lean form (per the standing protocol cache's "Lean decision-log entry" template). Nine sub-decisions summarised; rules served block names: 0a, 0c, 0d-ii, 0f, R0, R3, R4, R17 (primary), R18a, R18b, R18c, R18e (NOT), R20 (NOT), AC5 (NOT), AC7 (NOT this session — engages at build), AC8, AC10 (named under Decision H + PR7), KG1 (engaged at build), KG7 (NOT), PR1 (build), PR2 (build), PR4 (N/A), PR6 (NOT), PR7 (~22 deferred items named), PR10 (this is the Plan step), PR11 (inbox scan recorded), PR15 (bespoke election justified — A10 extends production-tested `api_keys` infrastructure).

**Step 6** — this close.

---

## Decisions Made

- **`D-ATL-A10-DESIGN-LOCKED-2026-05-16`** appended (lean form). Nine sub-decisions A–I defining A10's surface; ~22 deferred items named with revisit conditions; PR15 election (extend `api_keys`) is the dominant influence.

---

## Status Changes

| Item | Old | New |
|---|---|---|
| A10 per-agent credentials (post-6b arc step 8) | **Scoped** — named as the auth-seam filler in `D-ATL-WRITE-PATH-DESIGN-LOCKED-2026-05-16` Decision C | **Designed** — nine decisions A–I locked under `D-ATL-A10-DESIGN-LOCKED-2026-05-16` + `/adopted/atl-a10-design.md` |
| `/adopted/atl-a10-design.md` | did not exist | **Adopted** (decision status); **Designed** (implementation status). Build session is the next step. |
| Pre-A10 stopgap retirement question (open since the write-path design pass) | **Open** — listed in the write-path build close's Open Questions block | **Resolved** by Decision I (keep as kill-switch); revisit conditions named under PR7. |
| Token format ADR (build-arc cache Q4, refined under ST2) | **Open** — JWT / W3C VC / hybrid candidates | **Resolved** by Decision A (opaque random tokens + server-side lookup); VC interop + JWT for external verifiers deferred under PR7 with revisit conditions named. |
| Production state | A7 Verified; write-path Live but inert (`SUBSTRATE_WRITE_PATH_ENABLED` UNSET); `/api/reason` byte-identical; `/api/substrate/layer3` returns 503 (`SUBSTRATE_LAYER3_ENABLED` UNSET); R20a gate UNSET; `/api/accreditation/[agent_id]` Live (GET 404 / POST 503); both ATL tables empty | **Unchanged** — no code, schema, env, or production exposure this session |

---

## Next Session Should

**The A10 build session — step 8 of 8 (build half).** This is the natural and final next session in the post-6b arc.

- **Risk:** Critical under 0d-ii. Full Critical Change Protocol (0c-ii) ENGAGED. The auth-gate swap engages AC7 + R17 (primary); the new admin endpoint engages AC7; the schema additions to `api_keys` engage AC7; the new `credential_audit` table is a new auth-relevant surface.
- **Build-arc cache governing note:** "no current users" applies — CCP step 3 ("What happens to existing sessions?") remains "N/A — only founder + test logins exist."
- **Spec:** `/adopted/atl-a10-design.md` + `D-ATL-A10-DESIGN-LOCKED-2026-05-16`. PR1 single-build proof — schema + library + admin endpoint + route swap + tests in one session.
- **Estimated time:** ~3–4 hr (substantial code surface; Critical Change Protocol overhead; multiple tests).
- **Pre-conditions:**
  1. This session's files committed + pushed (Founder Verification below).
  2. Founder has reviewed `/adopted/atl-a10-design.md` between sessions and is ready to engage the Critical Change Protocol.
  3. Founder has decided (between sessions) on the admin-check pattern: `ADMIN_USER_EMAIL` against `user.email` OR `ADMIN_USER_ID` against `user.id`. Both produce equivalent behaviour; preference is for whichever the founder finds easier to maintain.
  4. Production state unchanged from this session's close.

A next-session prompt for the A10 build has NOT been pre-drafted. The founder can request it when ready.

After the A10 build session lands, **the post-6b arc closes.** The substrate carries authenticated read AND write public surfaces; every credential write traces to a specific `agent_id` whose identity has been verified at the route boundary. The natural next arc is either the wrapper-iteration patterns (kathekon design Q9 deferred) or the K-category migration (the build-arc cache's K-category — translation-sandwich consumer migration); the founder elects.

---

## Blocked On

**Files remaining uncommitted (to be committed by the founder):**

```
?? adopted/atl-a10-design.md                                              (NEW — the design document)
 M operations/decision-log.md                                             (D-ATL-A10-DESIGN-LOCKED-2026-05-16 appended)
?? operations/handoffs/founder/2026-05-16-A10-design-pass-close.md        (NEW — this file)
```

**Production state at session close:** unchanged from session start. Substrate at A7 Verified. `SUBSTRATE_LAYER3_ENABLED` UNSET. `SUBSTRATE_R20A_GATE_ENABLED` UNSET. `SUBSTRATE_WRITE_PATH_ENABLED` UNSET (write surface inert). `/api/reason` byte-identical. `/api/substrate/layer3` returns 503. `/api/accreditation/[agent_id]` Live for GET + POST (POST returns 503 because the env var is UNSET). `agent_accreditation` table empty. `grade_history` table empty. `api_keys` table holds existing ecosystem keys only (no `agent_id` / `owner_user_id` / `purpose` / `revoked_at` columns yet — those land at the A10 build).

---

## Open Questions

(All deferred under PR7 in `D-ATL-A10-DESIGN-LOCKED-2026-05-16`; revisit conditions named in the decision-log entry.)

- **A10 build session.** The natural next session. Critical risk; full Critical Change Protocol.
- **Multi-owner / shared-credential flows** (Decision B deferral).
- **Ownership-transfer flows** (Decision B deferral).
- **Self-service mint endpoint** (Decision B + D deferral).
- **Migration of existing `sr_live_<key>` rows to populate `owner_user_id`** (Decision C deferral).
- **Postgres CHECK constraint on `purpose`** (Decision C deferral).
- **Multiple-tokens-per-agent_id** (Decision D deferral).
- **Token re-display / recovery flow** (Decision D deferral).
- **Reactivation (unrevoke)** (Decision F deferral).
- **Per-credential revocation-reason taxonomy** (Decision F deferral).
- **Per-credential `expires_at` column** (Decision G deferral).
- **Refresh-token flow** (Decision G deferral).
- **Automated rotation reminders** (Decision G deferral).
- **AC10 provenance fields linking `agent_accreditation` writes to `credential_audit` issuance events** (Decision H deferral; A12 target — F4 cross-reference).
- **`credential_audit` partitioning / retention policy** (Decision H deferral).
- **Failed-verification rate-limiting per IP per failure-type** (Decision H deferral).
- **Per-credential kill-switch** (Decision I deferral).
- **Kill-switch dashboard** (Decision I deferral).
- **VC / AP2 mandate alignment at the token layer** (Decision A deferral).
- **JWT for external verifiers** (Decision A deferral).
- **Validation caching** (Decision E deferral).
- **Per-credential rate-limiting** (Decision E deferral).
- **Badge documentation update reflecting A10's existence + owner-account semantics** (Decision B's R18b note).

---

## Founder Verification

**Two things to do, in order. Take them one at a time — do not paste the blocks as multi-line commands per the CLAUDE.md note about prompt-consumption.**

### 1. Read the design document between sessions (no code to run this session)

Open `/adopted/atl-a10-design.md` in a text viewer. Confirm the nine decisions A–I match your Step 2 elections (already verified in-session at Step 4, but reading the document one more time between sessions catches anything that doesn't sit right). The build session will treat the document as the spec — any concern about it is much cheaper to raise now than during the Critical-risk build.

If something needs to change, message me. A change to an Adopted governance document is an Elevated session per 0d-ii — we'd run a follow-on `D-ATL-A10-DESIGN-REVISED-YYYY-MM-DD` entry that supersedes today's. Light-touch edits (clarifying language; correcting typos; adjusting cross-references) stay Standard.

### 2. Commit and push

Use targeted adds (explicit paths, not `git add -A`). Run each command on its own line:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
```

```
rm -f .git/index.lock
```

```
git add adopted/atl-a10-design.md
```

```
git add operations/decision-log.md
```

```
git add operations/handoffs/founder/2026-05-16-A10-design-pass-close.md
```

Then the commit (one command, but multi-line message — paste the whole block including the closing `"`):

```
git commit -m "A10 design pass — per-agent credentials (step 8 of 8, design half)

Locks the design for A10 per-agent credentials per the post-6b arc's
final step. Nine decisions A-I cover token format, issuance authority,
storage, issuance flow, verification placement, revocation, rotation,
audit trail, and pre-A10 stopgap retirement.

Load-bearing finding: existing /website/src/lib/security.ts already
carries a mature opaque-token system (api_keys table + validateApiKey
+ admin endpoint at /api/admin/api-keys). PR15 election extends this
infrastructure rather than building greenfield. Decision A elects
opaque sr_atl_<32 hex> tokens; Decision C extends api_keys; Decision D
mirrors /api/admin/api-keys; Decision E adds validateAtlWriteToken
alongside validateApiKey.

Standing decisions:
  - sr_atl_<32 hex> opaque tokens, SHA-256 stored
  - Per-owner-account model (auth.users.id + agent_id binding)
  - Extend api_keys with agent_id, owner_user_id, purpose, revoked_at
  - Admin endpoint at /api/admin/accreditation-credentials
  - validateAtlWriteToken in security.ts
  - Reuse is_active + add revoked_at for revocation
  - No expiry; only revocation
  - Vercel logs (verify) + Supabase credential_audit table (issue/revoke)
  - SUBSTRATE_WRITE_PATH_ENABLED retained as kill-switch

Standard risk; AC7 not engaged this session (engages at the A10 build).
PR6 not engaged. ~22 items deferred under PR7 with revisit conditions.

Decision log: D-ATL-A10-DESIGN-LOCKED-2026-05-16.

Next: step 8 build half — A10 build (Critical)."
```

Then push via **GitHub Desktop**.

**Expected Vercel behaviour:** standard rebuild (~2 min). No code changes mean no behaviour changes — the rebuild is a no-op from production's perspective. After Vercel reports the deployment as green, no post-deploy checks are required this session (no new surfaces went live; nothing to verify against).

---

## Cross-references

- Operative session prompt: the A10 design-pass next-session prompt provided at session open.
- Predecessor session close: `/operations/handoffs/founder/2026-05-16-write-path-build-close.md`
- Sequencing source: `/operations/handoffs/founder/2026-05-15-post-build-brainstorm-close.md` (step 8 of 8 in the post-6b arc)
- Design document: `/adopted/atl-a10-design.md` (NEW this session)
- Decision-log entry: `D-ATL-A10-DESIGN-LOCKED-2026-05-16` (appended this session)
- Predecessor decision-log entries: `D-ATL-WRITE-PATH-BUILD-WIRED-VERIFIED-2026-05-16` (the build whose auth seam A10 fills); `D-ATL-WRITE-PATH-DESIGN-LOCKED-2026-05-16` (Decision C names A10).
- Structural template: `/adopted/atl-kathekon-aligned-alternative-design.md` (seven-decision design-pass shape; extended to nine here).
- PR15 reuse target: `/website/src/lib/security.ts` (`validateApiKey` + `hashKey` + `extractRawKey` + `requireAuth` — the production primitive A10 extends).
- Future build target route: `/website/src/app/api/accreditation/[agent_id]/route.ts` (the `verifyAgentIdOwnership` function whose body the A10 build swaps).
- Future build target admin endpoint precedent: `/website/src/app/api/admin/api-keys/route.ts` (the pattern A10's new admin endpoint mirrors).
- F-tracker: `/operations/agentic-commerce-findings-downstream-order.md` (F4 named under Decision H).
- Governance: `/adopted/standing-protocol-cache.md` (Lean templates); `/adopted/build-sessions-protocol-cache.md` ("no current users" governing note + open-questions parking lot Q4 — now resolved by Decision A).
- Manifest: `/manifest.md` (R0, R3, R4, R17, R18a, R18b, R18c, R18e, AC5, AC7, AC8, AC10, KG1, KG7).

*End of session close. With this session's files committed + pushed, the post-6b arc is one Critical build session away from closing. The A10 build session swaps `verifyAgentIdOwnership`'s body from the env-flag stopgap to per-agent token verification — no call-site change; the seam was shaped for this exact swap when the write-path build landed yesterday.*
