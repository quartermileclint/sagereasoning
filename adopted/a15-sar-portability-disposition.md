# A15 Disposition — SAR (Art 15) + Portability (Art 20) against the live endpoints

**Status:** Adopted 2026-06-07 under `D-A15-SAR-PORTABILITY-GOVERNANCE-CONFIRM-2026-06-07`.
**Category:** `governance` — Standard risk. Read-only inspection + assessment. **No code, schema, flag, or production change.**
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`.
**Purpose:** Answer the open question carried from `D-R17C-A15A-STALE-DRIFT-RECONCILED-2026-06-06` and the A14 close: *does the Verified-live `/api/user/export` already satisfy A15b (SAR / GDPR Art 15) and close A15d (portability / Art 20), or are a dedicated `/api/user/access` endpoint + a structured-export contract still required?* This disposition scopes — and shrinks — the remaining A15 Critical builds **before** they are committed to.

---

## §0 — Plain-language summary (read this first)

You already have a working "download all my data" endpoint (`/api/user/export`) and a working "delete my account and everything in it" endpoint (`/api/user/delete`). Both are live in production and were verified earlier.

The question for this session was whether those two already do the legal jobs that the three remaining A15 items name. The honest answer:

- **Portability (A15d / GDPR Article 20): essentially done.** The export already produces a complete, machine-readable JSON copy of the user's data, including the encrypted intimate store decrypted into usable form. Article 20 asks for exactly this. The only thing outstanding is a lawyer's sign-off on the wording of the compliance posture — not a build.
- **Subject Access Request (A15b / GDPR Article 15): most of the way there, but not finished.** Article 15 is broader than "give me my data." It also requires telling the person *why* you hold their data, *who* it's shared with, *how long* you keep it, *what rights* they have, and — because SageReasoning builds personality/vulnerability profiles — *that automated profiling happens and what it means*. The export delivers the data but **not** this explanatory information, and it doesn't log the access request the way the rule (R17g) asks. So A15b is a **thin** remaining build, not a big one.
- **Rectification (A15c / GDPR Article 16): genuinely still to build.** Neither endpoint lets a user formally correct inaccurate stored data with an audit record. This is a real, but focused, build.

**Net effect:** the confirm pass shrank the remaining A15 Critical work. A15d is build-complete (lawyer review only). A15b became a thin add-on (mostly boilerplate explanatory text + request logging, reusing the export's existing data-gathering). A15c remains a focused endpoint build. The big "structured-export from scratch" worry is off the table.

---

## §1 — What the two live endpoints actually do

### `/api/user/export` (GET) — Verified-live; deployed to production 2026-05-29

- **Auth:** `requireAuth(request)`; the export is strictly self-service — a user can only export **their own** `user_id`. The decrypted intimate content is therefore disclosed only to its subject.
- **Format:** a single JSON file download (`Content-Type: application/json`; `Content-Disposition: attachment; filename="sagereasoning-data-export-YYYY-MM-DD.json"`), pretty-printed, `format_version: "1.1"`, with an `export_metadata` header (export timestamp, user id, email, description).
- **Coverage — 24 tables** queried per-user, each independently (one table's failure doesn't block the rest):
  - *Core (plaintext):* `profiles`, `action_evaluations_v3`, `baseline_assessments_v3`, `journal_entries`, `deliberation_chains`, `deliberation_steps`, `user_locations`, `analytics_events`.
  - *Intimate R17b (plaintext, user_id-scoped):* `passion_events`, `premeditatio_entries`, `oikeiosis_reflections`, `founder_hub_entries`.
  - *Intimate R17b (encrypted → decrypted for the subject):* `mentor_profiles`, `mentor_baseline_appendix`, `realtime_journal_entries` (with legacy-plaintext fallback for pre-encryption rows).
  - *Intimate, profile_id-scoped (9 tables resolved via the user's mentor_profile id(s)):* `mentor_interactions`, `mentor_profile_snapshots`, `mentor_journal_refs`, `mentor_observations_structured`, `mentor_passion_map`, `mentor_causal_tendencies`, `mentor_value_hierarchy`, `mentor_oikeiosis_map`, `mentor_virtue_profile`.
- **Scope of data returned:** `select('*')` on every table → **all columns, including derived/inferred fields** (passion maps, virtue profile, causal tendencies). This is *broader* than Article 20 requires (Art 20 = user-supplied data only) and matches what Article 15's data-copy component needs.
- **Not present in the handler:** no request logging; no rate-limit call (a `checkRateLimit` helper exists in `security.ts` but is not invoked here); no Article 15 supplementary-information block.

### `/api/user/delete` (DELETE) — Verified-live; deployed to production 2026-05-30

- **Auth + confirmation:** `requireAuth` plus an explicit `{ "confirm": "DELETE" }` body token; missing/incorrect token → 400.
- **Erasure:** genuine hard-delete (not soft-delete) across 15 explicitly-named tables in FK-safe order, plus 9 profile_id-scoped children cleared transitively via `mentor_profiles` `ON DELETE CASCADE`, plus `auth.admin.deleteUser`.
- **Audit:** writes a no-PII `compliance_deletion_log` row listing every table cleared; partial failures return HTTP 207 with the error list.
- **Relevance here:** confirms the erasure half (A15a / R17c) is complete; included for completeness of the A15 picture. Not re-litigated by this disposition.

---

## §2 — Mapping to GDPR Article 15 (right of access / SAR) — R17g / A15b

**Verdict: PARTIAL — the data-copy component is substantially met; the supplementary-information + procedural components are the remaining gap.**

Article 15 has two parts. Part one (Art 15(3)) is *a copy of the personal data being processed*. Part two (Art 15(1)(a)–(h)) is *supplementary information about that processing*.

| Art 15 element | In place today? | Where / gap |
|---|---|---|
| Copy of personal data undergoing processing (15(3)) | **Yes** (substantially) | `/api/user/export` returns all 24 user-scoped tables, intimate store decrypted. |
| Purposes of processing (15(1)(a)) | **No** | Not emitted by export. Static text. |
| Categories of personal data (15(1)(b)) | **Partial** | Implied by the table keys; not stated as categories. |
| Recipients / categories of recipients, incl. sub-processors (15(1)(c)) | **No** | Anthropic / Supabase / Vercel not disclosed in the export. Overlaps A16c sub-processor register. |
| Retention period (15(1)(d)) | **No** | Not emitted. Overlaps R17 retention-limits + A16. |
| Existence of rights — rectification / erasure / restriction / objection (15(1)(e)) | **No** | Not emitted. (The rights *exist*; the access response must *state* them.) |
| Right to lodge a complaint with a supervisory authority (15(1)(f)) | **No** | Not emitted. Static text. |
| Source of the data where not collected from the subject (15(1)(g)) | **N/A → No** | Substrate data is collected from the subject; a one-line statement to that effect still belongs in the response. |
| Automated decision-making / profiling disclosure + logic + consequences (15(1)(h)) | **No** | **Most material gap.** SageReasoning *does* profile (passion maps, vulnerability patterns). Art 15(1)(h) specifically requires disclosing this and meaningful information about it. |
| R17g procedural: every request logged in the operations decision log | **No** | Export writes no request log. |
| R17g procedural: rate-limited | **No** | No rate-limit call in the export handler. |
| Within 30 days | **Yes** | Instant. |

**Completeness caveat (honest, per R18/R19):** the export's data-copy is broad but I did not exhaustively prove it captures *every* table that could hold user-attributable data. Two candidates were **not** in the export and should be confirmed:
- *Audit-trail tables* (`substrate_audit_events`, `abuse_signals`, `cost_alerts`). These store **masked/structural** fields only (no raw text, by the R3/R17 boundary) and are keyed by `agent_id`, not `user_id` — so they likely fall outside "personal data" for Art 15. This should be confirmed in the A15b build (and is a fair lawyer question).
- *"Decision-log mentions" / "third-party data"* named in R17g: the operations decision log mentions the founder, not users; no third-party data ingestion exists today. Currently N/A — state it explicitly rather than assume it.

**What A15b actually needs (shrunk scope):** not a from-scratch SAR engine. It needs (1) an Article 15 **supplementary-information block** (largely static boilerplate — purposes, sub-processors, retention, rights, complaint path, source statement, **profiling disclosure**), (2) **request logging**, and (3) **rate-limiting**, attached to the existing data-copy the export already produces. See §5 for the two ways to package this.

---

## §3 — Mapping to GDPR Article 20 (portability) — R17i / A15d

**Verdict: SATISFIED in substance by the live `/api/user/export`. Remaining = lawyer sign-off (+ optional format ADR), not a build.**

| Art 20 element | In place today? | Note |
|---|---|---|
| Machine-readable, structured | **Yes** | JSON, pretty-printed, stable keys. |
| Commonly-used format | **Yes** | JSON. R17i mentions "CSV for tabular structures" as an *option*; Art 20 doesn't mandate CSV, so JSON-only is defensible. Minor. |
| User-supplied data (Art 20's scope) | **Yes (exceeds)** | Export returns user-supplied **plus** derived data. Over-inclusion is not a violation; Art 20 simply doesn't *require* the derived fields. No action needed unless a strict "provided-only" variant is later wanted. |
| Within 30 days | **Yes** | Instant. |
| Direct transmission to another controller "where technically feasible" (Art 20(2)) | **N/A** | Best-effort optional limb; download satisfies the core right. |

**Staging-plan §A15d "structured-export contract":** the substance (a defined, stable JSON shape) is delivered by `format_version: "1.1"` and consistent table keys. A *documented* export-format contract/ADR would be a governance nicety — R17i says an export-format ADR **"may"** precede implementation, not must. Recommend treating A15d **implementation as complete** and tracking only: (a) optional format-contract ADR (low priority), (b) lawyer sign-off on the `CR-GDPR-A20-PORTABILITY` posture (currently `SCOPED pending confirmation`).

---

## §4 — Article 16 (rectification) — R17h / A15c

**Verdict: NOT addressed by either live endpoint. Remains a real, focused Critical build.**

Neither `/api/user/export` nor `/api/user/delete` provides a formal correction path. R17h requires: update named fields within 30 days; log before/after values in an **immutable audit row**; surface `/api/user/rectify`; Critical Change Protocol applies (R17f + PR6).

The confirm pass does **not** shrink A15c the way it shrank A15b/A15d — it confirms A15c is genuinely needed. Scoping notes for when it's built:
- Much intimate data is user-authored free text (journal/realtime entries) the user can already revise through normal product flows; the *formal* Art-16 surface with immutable before/after audit logging is what's missing.
- Open design question for the A15c session: which fields are user-rectifiable vs derived (you don't "rectify" an inferred passion map — you'd regenerate or delete it). Likely a defined allow-list of correctable fields.
- An immutable rectification-audit table is the new schema element (mirror the append-only pattern already used by `substrate_audit_events` / `compliance_deletion_log`).

---

## §5 — Two ways to close A15b (founder decides direction)

The manifest (R17g) names the implementation surface as **`/api/user/access`** (new). The substance can be delivered two ways; both are far smaller than a from-scratch SAR build.

**Option 1 — Dedicated `/api/user/access` (matches manifest naming).**
A thin new endpoint that reuses the export's existing data-gathering, wraps it with the Article 15 supplementary-information block, logs the request, and is rate-limited.
- *For:* matches R17g as written; keeps "portability download" (`/export`) and "access + explanation" (`/access`) as distinct surfaces with distinct legal jobs; no change to the working export.
- *Against:* a second endpoint to maintain that overlaps the export's data-gathering (factor the shared query into a helper).

**Option 2 — Augment `/api/user/export` to serve both, and amend R17g's surface naming.**
Add the supplementary-information block + logging + rate-limit to the existing export; document it as satisfying both Art 15 and Art 20; amend the manifest R17g surface name with approval + backup.
- *For:* one endpoint, least new code, single data-gathering path.
- *Against:* requires an in-place manifest edit (approval + prior-version backup); slightly muddies the Art-15-vs-Art-20 distinction in one response.

**The case for Option 1 (offered, not prescribed):** it honours the manifest as written without a governing-doc edit, and keeps the two legal rights cleanly separated, which reads better in a lawyer review and on a limitations/rights page. Either way the build is thin. **Founder elects at the A15b kickoff.** Per KG-EX1, this disposition does not retire or rewrite the existing surface — it presents the options and leaves the direction to you.

---

## §6 — Precise scope of the remaining A15 Critical builds (post-confirm)

| Item | Pre-confirm assumption | Post-confirm scope | Size |
|---|---|---|---|
| **A15b** (Art 15 SAR) | Build a full SAR export endpoint | Add an Art 15 supplementary-info block (mostly static), request logging, and rate-limiting to the **existing** data-copy; package per §5 Option 1 or 2 | **Thin** — Critical surface (auth/PII), but small |
| **A15c** (Art 16 rectification) | Build rectification | Unchanged — genuinely needed: `/api/user/rectify`, correctable-field allow-list, immutable before/after audit table | **Focused** — Critical |
| **A15d** (Art 20 portability) | "Most complex; structured-export contract" | **Implementation complete** via live `/api/user/export`; remaining = optional format ADR + lawyer posture sign-off | **None (build)** — lawyer review only |

All A15b/A15c work remains **Critical** under R17f + PR6 and follows the full Critical Change Protocol (0c-ii) when built. This disposition scopes them; it does not build them.

---

## §7 — Requirements-vs-in-place checklist (0c governance verification — founder reads this)

Read this table against §1–§4 and confirm it matches your understanding. This is the verification surface for the session; there is nothing to run.

| # | Requirement | In place? | Action item |
|---|---|---|---|
| 1 | Art 20 portability: machine-readable export of user data | **Yes** (live `/api/user/export`) | None (build). Lawyer sign-off on posture. |
| 2 | Art 15 data copy: complete copy of personal data | **Yes** (substantially; 24 tables, intimate decrypted) | Confirm audit-table exclusion in A15b. |
| 3 | Art 15 supplementary info (purposes, recipients, retention, rights, complaint, source) | **No** | A15b — static block. |
| 4 | Art 15(1)(h) profiling disclosure | **No** | A15b — most material gap; SageReasoning profiles users. |
| 5 | R17g: SAR request logged | **No** | A15b — add request logging. |
| 6 | R17g: SAR surface rate-limited | **No** | A15b — invoke `checkRateLimit`. |
| 7 | R17g: surface named `/api/user/access` | **Not built** | A15b — §5 Option 1 builds it; Option 2 amends the name. |
| 8 | Art 16 rectification path with immutable audit | **No** | A15c — focused build. |
| 9 | Erasure (R17c / A15a) | **Yes** (live `/api/user/delete`) | None. |

If rows 1, 2, and 9 read as **Yes** and rows 3–8 read as the remaining (shrunk) work, this disposition is **Verified on your read**.

---

## §8 — Governance follow-ups (NOT done this session — approval items)

Per the founder rule, no in-place edits to adopted governing documents were made. The following are available next session, each with a prior-version backup first (same shape as the R17c reconcile):

1. **`manifest.md` `CR-GDPR-A20-PORTABILITY` posture** (currently `SCOPED pending confirmation A15d's structured-export contract is fully met + lawyer review`): this disposition confirms the *build* is complete; the posture can move to reflect "implementation complete; pending lawyer review" — **Elevated** edit, your approval + backup.
2. **`adopted/substrate-plugin-staging-plan.md` §A15** annotation: record A15d build-complete and A15b/A15c shrunk scope per §6 — **Elevated** edit, your approval + backup.
3. **Carried housekeeping** (unchanged): `CLAUDE.md` "Production state (as of 2026-05-14)" block is stale; the A14 staging-plan §A14 status edit is still pending your approval.

These are surfaced, not actioned.

---

## §9 — Cross-references

- Decision log: `D-A15-SAR-PORTABILITY-GOVERNANCE-CONFIRM-2026-06-07` (this disposition); `D-R17C-A15A-STALE-DRIFT-RECONCILED-2026-06-06` (the open question this answers); `D-R17-ERASURE-PORTABILITY-COMPLETENESS-2026-05-29` (export + delete build); `D-A14-SLO-ERROR-BUDGET-POLICY-2026-06-07` (predecessor).
- Endpoints: `website/src/app/api/user/export/route.ts`; `website/src/app/api/user/delete/route.ts`.
- Rules: `manifest.md` R17, R17b, R17c, R17f, R17g, R17h, R17i; `manifest.md` §compliance_register (`CR-GDPR-A15-ACCESS`, `CR-GDPR-A16-RECTIFICATION`, `CR-GDPR-A20-PORTABILITY`).
- Plan: `adopted/substrate-plugin-staging-plan.md` §A15.

*End of disposition. Read-only governance assessment; production byte-identical; no code, schema, flags, or deploys touched.*
