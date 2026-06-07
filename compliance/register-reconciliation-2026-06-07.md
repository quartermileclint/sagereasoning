# Compliance Register Reconciliation — A17a

**Date:** 2026-06-07
**Tier:** governance — Standard risk (documentation + a Standard `/compliance/` data-file edit; no manifest-header change).
**Author:** founder-authored draft (AI-assisted).
**Decision-log:** `D-A16-A17-PRIVACY-REGULATORY-GOV-2026-06-07`.
**Authoritative source:** the manifest YAML front-matter CR register (`/manifest.md` lines 1–65). Per the A17a instruction, where the two registers overlap, the manifest header governs.

---

## 1. What was compared

| Register | Location | ID scheme | Scope | Version | Entries |
|---|---|---|---|---|---|
| **Manifest header CR register** (authoritative) | `/manifest.md` YAML front-matter | `CR-<REGULATION>-<ARTICLE>` (e.g. `CR-GDPR-A17-DELETION`) | The headline binding obligations + the four GDPR data-subject rights | `CR-2026-Q2-v5` | 8 |
| **Pipeline register (JSON)** | `/compliance/compliance_register.json` | `CR-001 … CR-028` (24 entries; CR-016–019 unused) (numeric) | The broad regulatory surface + the quarterly-pipeline machinery (EU AI Act high-risk, VAISS, ACL, ISO 42001, NIST, AFSL/insurance/IP, marketplace, session-bridge, the four ethical-analysis CRs) | `CR-2026-Q2-v4` | 24 |

**Finding (headline):** these are **two different registers**, not one register in two places. They use different ID schemes and cover different (overlapping) scopes. They were never meant to be merged. The reconciliation task is therefore: (a) confirm they do not **contradict** each other where they overlap, and (b) fix the places where the JSON is **stale** relative to what is now live in production.

---

## 2. Divergences found

### D1 — Version drift (Standard fix)
Manifest header is `CR-2026-Q2-v5`; JSON `_meta.version` is `CR-2026-Q2-v4`. The JSON was not version-bumped when the manifest header was amended on 2026-05-12. **Not a contradiction — a housekeeping lag.**

### D2 — Stale GDPR entry (JSON CR-009) — **the material one**
JSON `CR-009` (status `DEFERRED`) still says *"GDPR delete/export endpoints remain a deferred item (Security Audit D8)"* and lists *"Implement GDPR delete/export endpoints"* as an open action. **This is now false.** Both endpoints are live in production:
- `/api/user/delete` — deployed 2026-05-30 (`D-R17-ERASURE-PORTABILITY-COMPLETENESS-2026-05-29`)
- `/api/user/export` — Verified-live 2026-05-29 (same decision)

The manifest header records the current truth: `CR-GDPR-A17-DELETION` = `PARTIAL` (deletion live), `CR-GDPR-A20-PORTABILITY` = `SCOPED` (export live), plus `CR-GDPR-A15-ACCESS` and `CR-GDPR-A16-RECTIFICATION` (`/api/user/access`, `/api/user/rectify` built 2026-06-07).

### D3 — Stale Australia entry (JSON CR-005)
JSON `CR-005` lists *"Implement /api/user/export and /api/user/delete endpoints (existing deferred item)"* as an open action — also now done. The manifest header records `CR-AU-PRIVACY-1988` = `ALIGNED` (encryption R17b + deletion live). The **one genuinely-open** CR-005 action — updating the privacy policy for APP 1.7 automated-decision-making transparency before 10 Dec 2026 — remains open and is **not** closed by this reconciliation.

### D4 — Posture divergence on EU AI Act Article 50 (JSON CR-002 vs manifest CR-EU-AIA-A50)
JSON `CR-002` = `COMPLIANT` (*"R3 disclaimer satisfies Art. 50 transparency"*). Manifest `CR-EU-AIA-A50` = `SCOPED` (*"final language deferred to lawyer engagement"*). These disagree. Under R19 (honest positioning — do not overclaim), the **more conservative manifest posture governs**: Article 50 final wording is lawyer-dependent and not yet settled, so `COMPLIANT` is an overclaim. JSON CR-002 should be brought down to a monitoring/partial posture pending lawyer review. (See also D7 — the enforcement date itself needs correcting.)

### D5 — Coverage gap, not contradiction (EAA/WCAG + CCPA)
The manifest header carries `CR-EAA-WCAG-AA` (European Accessibility Act / WCAG 2.1 AA, `ESCALATED`) and `CR-CCPA-DELETION` (California, `PARTIAL`). The JSON has **no equivalent entries** — it predates both. This is a coverage gap in the JSON, not a conflict. Recommendation: leave these as manifest-only for now (adding them to the JSON would mint new posture claims the JSON-pipeline hasn't reviewed); the JSON can pick them up at the 2026-07-06 quarterly run if desired.

### D6 — Granularity difference (GDPR Articles 15/16/20)
The manifest splits access / rectification / portability into separate CR entries; the JSON folds the whole of GDPR into `CR-009`. **Not a contradiction** — different resolution. The cross-reference (below) records the mapping.

### D7 — Article 50 enforcement date is incomplete (manifest-header accuracy — **NOT fixed here**)
Both registers state Article 50 "enforcement" as `2026-12-02`. Per a 2026-06-07 web check (sources in §5), the accurate picture is: **Article 50 obligations apply from 2 August 2026**; the **2 December 2026** date is the narrower AI-Omnibus transition backstop for the *machine-readable marking* requirement (Art. 50(2)) for generative systems already on the market before 2 Aug 2026. The manifest header's "Enforcement live 2026-12-02" is therefore incomplete. **This is a manifest-header (governing-document) change → Elevated → not made here.** Flagged to the founder for approval and logged in the Lawyer Review Queue (LRQ-6). The A17b posture draft carries the corrected dates.

### D8 — Privacy-policy region is stale (privacy-policy accuracy — **NOT fixed here**)
The live privacy policy (`website/src/app/privacy/page.tsx`) states Supabase is hosted in **Singapore (Asia-Pacific)**. The actual current region is **US East (North Virginia)** (README; project ref `jdbefwkonfbhjquozgxr`). This is a **separate, founder-approved privacy-policy edit** (not a register edit) — captured in the sub-processor register (A16c) and the Lawyer Review Queue (LRQ-4).

---

## 3. Reconciliation applied (JSON — Standard edit; backup taken)

A pre-edit backup was taken before any change:
`/archive/compliance_register.json.backup-pre-a17a-reconciliation-2026-06-07`

The following **factual / staleness** edits were applied to `/compliance/compliance_register.json`. **No posture was upgraded to a stronger claim** (R19): the only posture *movement* is the **downgrade** of CR-002 from `COMPLIANT` to a monitoring posture (D4), which is conservative. Cross-reference fields were added linking JSON entries to the authoritative manifest CR-IDs.

| JSON entry | Change | Type |
|---|---|---|
| `_meta.version` | `CR-2026-Q2-v4` → `CR-2026-Q2-v5` (aligns with manifest) | Housekeeping (D1) |
| `_meta` | Added `last_reconciliation: "2026-06-07"` + note pointing to this file and naming the manifest header as authoritative | Housekeeping |
| `CR-002` | Posture `COMPLIANT` → `MONITORING`; note + actions reworded to "R3 disclaimer is a starting point; final Art. 50 wording lawyer-dependent and deferred"; `cross_ref: CR-EU-AIA-A50` added; date corrected per D7 | Posture **downgrade** (D4, D7) |
| `CR-005` | Note + actions updated: delete/export endpoints now live (cite `D-R17-…-2026-05-29`); APP 1.7 privacy-policy update **remains** the open action; `cross_ref: CR-AU-PRIVACY-1988` added | Staleness fix (D3) |
| `CR-009` | Status `DEFERRED` → `PARTIAL`; note + actions updated: delete/export live; DPIA now drafted (A16a); remaining = lawyer review + EU-customer decision; `cross_ref: [CR-GDPR-A17-DELETION, CR-GDPR-A15-ACCESS, CR-GDPR-A16-RECTIFICATION, CR-GDPR-A20-PORTABILITY]` added | Staleness fix (D2) |

**Not changed:** every other JSON entry; the manifest header (authoritative, untouched); the privacy policy (separate approved edit).

---

## 4. The two-register relationship (recorded for future sessions)

- **Manifest header CR register** = authoritative for the 8 headline binding obligations + the four GDPR data-subject rights. This is what a lawyer or auditor should read first.
- **JSON pipeline register** = the broad working register the quarterly R14 pipeline operates on (28 obligations incl. high-risk classification, insurance, IP, marketplace). It feeds, but does not override, the manifest header.
- **Rule:** where they overlap, the manifest header wins. The JSON carries `cross_ref` fields pointing at the manifest CR-IDs so the link is explicit.
- The 2026-07-06 quarterly review (A17c) walks **both** and records results in `compliance_audit_log.json`.

---

## 5. PR13 five-question pass on the web findings (D7)

1. **Contradicts a prior decision?** No — refines the recorded Article 50 date; does not reverse any decision.
2. **Refines a prior decision?** Yes — the manifest header's "2026-12-02" is incomplete; correct apply-date is 2 Aug 2026 with a 2 Dec 2026 marking backstop.
3. **Affects work in flight this session?** Yes — the A17b posture draft uses the corrected dates; the manifest-header fix is queued (LRQ-6), not made.
4. **Affects future-stage work?** Yes — Article 50 applies 2 Aug 2026, earlier than the manifest implied; relevant to any EU-facing launch timing.
5. **Affects operational discipline?** Yes — recorded as a manifest-header accuracy item for the next governance pass; do not let "2026-12-02" propagate unqualified.

**Sources (web check 2026-06-07):**
- EU AI Act Article 50 — https://artificialintelligenceact.eu/article/50/
- European Commission draft transparency guidelines (May 2026) — https://www.globalpolicywatch.com/2026/05/10-takeaways-european-commission-draft-guidelines-on-ai-transparency-under-the-eu-ai-act/
- ISO/IEC 27701:2025 publication — https://www.iso.org/standard/27701

---

*End of reconciliation. The JSON now agrees with the authoritative manifest header on the overlapping obligations; the two manifest-header / privacy-policy accuracy items (D7, D8) are queued for founder approval rather than changed here.*
