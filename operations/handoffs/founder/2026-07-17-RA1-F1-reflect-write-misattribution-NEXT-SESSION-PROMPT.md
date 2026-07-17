# Next-Session Prompt — RA-1-F1: `/api/reflect` R17 write-misattribution

**Stream:** founder.
**Tier:** `code-critical` — **founder-walked** (AC7 + PR6 + PR17 + R17 intimate-data perimeter).
**Governing frame:** `/adopted/standing-protocol-cache.md`, opened under `STANDING-SESSION-OPENER-grounded-foundations.md`. **Critical Change Protocol (0c-ii) APPLIES — full templates, not lean.**
**Predecessor close:** `operations/handoffs/founder/2026-07-17-registry-assessment-RA1-registry-refresh-CLOSE.md` (§RA-1-F1).
**Predecessor decision-log entries:** `D-REGISTRY-RA1-REFRESH-AND-DOC-NOTES-2026-07-17`.
**Founder election:** **E1** — RA-1-F1 gets its own founder-walked Critical session **ahead of RA-2**.
**Sequencing note:** **RA-1-F2** (the S11 instrument vacuity) is time-critical and may take the front of the queue — it is a ~2h briefing, not a build. E1 stands either way. The founder sequences.

---

## Why this session matters

The mentor's second AMEND-CRITICAL was **real**, and the reconciliation declared it stale **by checking the wrong file**. The registry row the mentor assessed (`tool-sage-reflect`) has path `/website/src/app/api/reflect/route.ts`, and D24 names that endpoint **verbatim** (`consumer-workflow-audit.md:711`: `endpoint: '/api/reflect'`). The plan verified `/api/mentor/private/reflect/route.ts` — **a different route, which has no registry row at all**. The plan's conclusion was right only by luck; on the correct file, **Fix B is LIVE AND OPEN.**

D24 itself classes this item **`Critical under PR6 (R17 intimate data protection perimeter)`** (`:1053`).

**This is a write-misattribution, not a read leak.** An authenticated user who knows another user's UUID can write intimate reflection text into that user's record **and poison their longitudinal profile** — surfacing in *their* next mentor turn's Layer-2 context. **Exposure today is ~zero** (0h held, no external users), which is why it is recordable rather than an incident — and is **not** a reason to defer it.

## The verified defect (re-verify first-hand at open — do not take this on trust)

| Fact | Evidence |
|---|---|
| `requireAuth` only — **no founder gate** (contrast `/api/mentor/private/reflect:143–150`, which 403s non-founders) | `api/reflect/route.ts:69` |
| body `user_id` accepted unvalidated | `:74` |
| **no `user_id === auth.user.id` check anywhere** | grep: 0 hits |
| reflection narrative written under the arbitrary `user_id` | `:181–189` |
| analytics written under it | `:220–226` |
| `updateProfileFromReflection(supabaseAdmin, user_id, …)` — mutates **another practitioner's** passion map + rolling window | `:236–248` |
| all writes via `supabaseAdmin` — **service role, RLS bypassed** | `:3`, `:103/:178/:216/:240` |

**The contrast that proves the shape:** `/api/mentor/private/reflect` computes `effectiveUserId = user_id || auth.user.id` but is **founder-only**, and its **distress log deliberately ignores the body and writes `auth.user.id`** (`:228`) — a safety record stays non-redirectable even by the one caller who could redirect everything else. **`/api/reflect` lacks that asymmetry entirely.**

## Pre-conditions

1. Re-verify every row of the table above first-hand. **If any line does not reproduce, STOP and report** — do not build against a stale finding (that is the failure this whole RA arc exists to correct).
2. **Window discipline.** `/api/reflect/route.ts` does **not** match the extended byte-identity regex — but **RA-1-F3 records that the regex is wrong in both directions**. `/api/reason` imports `r20a-classifier.ts` (`detectDistressTwoStage`) and `constraints.ts` (`enforceDistressCheck`) at `route.ts:7-8`, called `:1002`, and **neither matches the guard** — so editing them would perturb the measured surface **while the gate prints "NONE — safe"**. **Do not edit `r20a-classifier.ts` / `constraints.ts` / `guardrails.ts` / `security.ts` / `practice-credential.ts` while the observation window is open.** Precedent: a **new sibling module** (`score-conversation-r20a.ts`).
3. Confirm the window state (closes ~2026-07-19). If closed, the prohibition relaxes — verify, don't assume.

## Part A — Open under the protocol

`code-critical` ⇒ the cache **supplements**, it does not replace. Read: the cache; the manifest's **R17** + **AC7** + **PR6** sections in full; the predecessor close §RA-1-F1; `operations/consumer-workflow-audit.md` **D24 Route-7 item 6** (`:711`, `:1053`) — the binding source; the last 2 decision-log entries.

Confirm at open: tier; hold-point; **model selection N/A** (no LLM call added); status vocabulary; signals; **and the 0c-ii six-point Critical Change Protocol answered explicitly before any edit** (what is changing; what could break; what happens to existing sessions; rollback; verification; explicit founder approval specific to the named risks).

## Part B — Procedure

### Step 1 — Founder election on fix shape (AskUserQuestion)
D24's own recommendation offers two:
- **(a) Equality check** — `if (user_id && user_id !== auth.user.id) return 403`. Preserves the wire shape; a client sending its own id still works.
- **(b) Drop the body parameter** — use `auth.user.id` directly and ignore/reject `user_id`. **Structurally stronger** (the misattribution becomes unrepresentable — the `validateAuthorityBoundary` precedent: make the safety property structural, not a guard that can be bypassed). Changes the contract for any caller that sends `user_id`.

**AI recommendation: (b)**, with (a) as the compatible fallback — but establish first whether any live caller sends `user_id` (grep the UI + tests). **The founder elects.**

### Step 2 — Build
Flag-gated dark (`SUBSTRATE_REFLECT_USER_ID_GUARD_ENABLED`), **byte-identical flag-off, test-asserted** — the 2026-07-07 `score-conversation-r20a` precedent exactly. New logic in a **new sibling module** if it exceeds a few lines (`route.ts` rejects non-handler exports at `next build` — memory `nextjs-route-export-validation`; **`npm run build`, not just `tsc`**).

Fix the **disclosed nit** in the same pass: the vestigial `.then(() => {})` at `:115` discards `{error}`, so a **failed safety-log insert is silent** — unlike the private route, which surfaces it. Await and surface.

### Step 3 — Test
Assert: a mismatched `user_id` is refused (403, or ignored under (b)); the narrative/analytics/profile writes all key on `auth.user.id`; **`updateProfileFromReflection` can never receive a foreign id**; flag-off byte-identity; the safety-log error is now surfaced. Add a **source-grep INV pin** so the guard cannot be silently removed (the established `r20a-audience-rendering.test.ts` pattern).

### Step 4 — Verify
`tsc` 0; **`npm run build` 0**; the new battery; the reflect suites (`reflect-service`, `session-store`, `request-helpers`); `r20a-invocation-guard` **92/0**; the extended byte-identity gate **NONE**.

### Step 5 — Founder-walked activation (AC7 + PR17 — walked live, never a one-line hand-off)
Push → Vercel green → set `SUBSTRATE_REFLECT_USER_ID_GUARD_ENABLED=true` → redeploy → **live smokes**: (i) own-id reflect succeeds end-to-end; (ii) foreign-id reflect is refused; (iii) the target user's profile is **unchanged** (the actual harm, verified at the DB, not inferred). **Rollback = unset the flag + redeploy (byte-identical).** **The AI performs no Vercel/Supabase/git op.**

### Step 6 — Records
Full Critical close + decision-log entry. Suggested id: `D-RA1-F1-REFLECT-WRITE-MISATTRIBUTION-FIXED`. **Correct the registry** — `tool-sage-reflect`'s blocker is currently *narrowed, not cleared*; clear it only on the verified activation.

---

## Part C — Anticipated session shape
| Phase | Estimate |
|---|---|
| Open (cache + R17/AC7/PR6 + D24) | 30 min |
| Step 1 re-verify + election | 25 min |
| Step 2 build | 60 min |
| Step 3–4 test + verify | 45 min |
| Step 5 founder-walked activation | 40 min |
| Records | 30 min |
| **Total** | **~3.5 h** |

## Rollback path
Unset `SUBSTRATE_REFLECT_USER_ID_GUARD_ENABLED` + redeploy (byte-identical, test-asserted); `git revert` the build commit.

## Forecast
Success = an authenticated user can no longer write intimate reflection text into another user's record or mutate their longitudinal profile, verified live at the DB; the mentor's second AMEND-CRITICAL is genuinely closed rather than declared stale. **Then:** RA-2 (G1 score-decision full-field R20a), RA-3 (four-page distress rendering), RA-4 (post-window), RA-5 (parallel). **E4:** send the reconciliation + refreshed registry back to the mentor.

**The 0h call remains the founder's.**

End of prompt.
