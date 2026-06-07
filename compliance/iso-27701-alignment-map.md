# ISO/IEC 27701:2025 — Informal Alignment Map (A16b)

**Status:** Adopted 2026-06-07 under `D-A16-A17-PRIVACY-REGULATORY-GOV-2026-06-07`.
**Rules served:** R17 (intimate data protection), R17b (encryption), R17c (deletion), R16 (data governance), R14 (compliance pipeline).
**Owner:** founder.

---

## What this is — and what it is NOT

This is an **informal self-assessment** mapping SageReasoning's *current* privacy/security controls to the structure of **ISO/IEC 27701:2025**, the Privacy Information Management System (PIMS) standard.

- It is **NOT** a certification, a certification audit, or a formal gap analysis by a certification body.
- It is **NOT** a claim that SageReasoning is "ISO 27701 aligned" in any marketing sense (R19 — honest positioning).
- It **IS** a clear-eyed internal picture of where our controls already track the standard and where they do not, so that (a) the gaps are visible and (b) if certification is ever pursued, the starting point is known.

**About the 2025 version (web-checked 2026-06-07):** ISO/IEC 27701 was revised and republished on 14 October 2025 as a **standalone** management-system standard (it no longer requires ISO/IEC 27001 as a base). Its clauses 4–10 mirror the standard management-system structure; its privacy-specific requirements draw on the former 27701:2019 plus ISO/IEC 27001:2022 and 27002:2022. Certified organisations have until 2028 to transition. **SageReasoning is not certified and is not pursuing certification at launch** (consistent with the ISO/IEC 42001 posture in `compliance_register.json` CR-007). The clause references below are to the standard's **thematic areas**; exact clause-number mapping is a task for a certification engagement, not this informal pass.

**Honesty key:** **Aligned** = a control is in place and reasonably tracks the standard's intent. **Partial** = something is in place but incomplete or undocumented. **Gap** = not yet addressed. Single-founder, pre-launch, founder-only-data context is assumed throughout — several "gaps" are appropriately deferred at this scale and are marked as such.

---

## Part A — Management-system clauses (ISO 27701:2025 §4–10)

| Area (thematic §) | What the standard wants | SageReasoning today | Assessment |
|---|---|---|---|
| **§4 Context / scope** | Define the PIMS scope, the roles (PII controller / processor), interested parties | Founder/company is **PII controller**; Anthropic, Supabase, Vercel are **sub-processors** (see `/compliance/sub-processor-register.md`). Scope = the intimate-data store + assessment pipeline. | **Partial** — roles identified and documented in the sub-processor register + DPIA; a formal one-page PIMS scope statement is not yet written. |
| **§5 Leadership** | Management commitment, a privacy policy, assigned responsibilities | Single founder holds all privacy responsibility (register `owner: founder`). The manifest's R16/R17/R19/R20 encode privacy commitment at the governing level. | **Partial** — commitment is real and documented in the manifest; no separate DPO is appointed (likely not required at this scale; revisit post-incorporation / at scale). |
| **§6 Planning (risk + DPIA)** | PII risk assessment; privacy impact assessment | **DPIA now drafted** (`/compliance/dpia-intimate-data.md`, A16a) covering the R17 intimate-data processing. | **Aligned (informal)** — the DPIA exists and follows the expected structure; lawful-basis + residual-risk sign-off are lawyer-queued (LRQ-1, LRQ-5). |
| **§7 Support** | Resources, competence, awareness, documented information | Documentation discipline is strong (manifest, decision log, this `/compliance/` set). Competence = founder + AI assistance. | **Partial** — documentation is excellent; "competence/awareness" in the formal sense (training records) is N/A at single-founder scale. |
| **§8 Operation** | Operational controls; PII risk treatment | Encryption (R17b), access control (RLS), deletion (R17c), data-subject-rights endpoints all operate in production. | **Aligned (informal)** for the controls that exist; see Part B for the detail. |
| **§9 Performance evaluation** | Monitoring, internal audit, management review | The R14 quarterly review (`/compliance/quarterly-review-cadence.md`, A17c) is the management-review mechanism; cost-health monitoring (A13) is live. | **Partial** — quarterly review now operationalised; no independent internal audit (appropriate at scale; external review is queued for the lawyer engagement). |
| **§10 Improvement** | Nonconformity handling, corrective action, continual improvement | The decision log + session-debrief protocol (0b-ii) + the F-series stewardship register capture corrective action. | **Aligned (informal)** — the project's process machinery is a continual-improvement loop. |

---

## Part B — PII-specific controls (ISO 27701:2025 privacy controls; controller obligations)

| Privacy control area | What the standard wants | SageReasoning today | Assessment |
|---|---|---|---|
| **Conditions for collection & processing / lawful basis** | Identify and document the lawful basis; purpose limitation | Purpose is documented (mentor practice; reasoning assessment). Lawful basis is **not yet legally confirmed**. | **Partial / Gap** — lawful-basis determination is lawyer-queued (LRQ-1). Purpose limitation holds in practice. |
| **PII minimisation** | Collect/keep only what's needed | Intimate fields are scoped to the mentor relationship; passion-profiling results never exposed via API (R17e). | **Aligned (informal)**. |
| **Accuracy & rectification** | Keep PII accurate; allow correction | `/api/user/rectify` (R17h / GDPR Art. 16) built 2026-06-07. | **Aligned (informal)** — endpoint built; its audit-log migration (`compliance_rectification_log`) is still pending (noted, out of scope this session). |
| **Storage limitation / retention** | Defined retention periods; disposal | R17c requires defined retention + genuine deletion; **genuine deletion is live** (`/api/user/delete`). Explicit per-category **retention periods are not yet documented**. | **Partial** — deletion strong; retention-period schedule is a **Gap** (LRQ-style internal action; not legal). |
| **Obligations to PII principals (data-subject rights)** | Access, rectification, erasure, portability, objection | **Access** (`/api/user/access`, Art. 15), **Rectification** (Art. 16), **Erasure** (`/api/user/delete`, Art. 17, deployed), **Portability** (`/api/user/export`, Art. 20, live). | **Aligned (informal)** on the four core rights — a genuine strength. Two audit-log migrations pending; objection/restriction not separately surfaced. |
| **Privacy by design & default** | Build privacy in | Application-level encryption beyond DB-at-rest (R17b); RLS per-user; service_role insert-only for the classifier; reviewer-identity masking view; bulk-profiling prevention (R17a). | **Aligned (informal)** — a clear strength of the build. |
| **Security of processing / cryptography** | Encryption, key management | **AES-256-GCM** application-level encryption (`server-encryption.ts`), rotation-ready `version` field; client-side AES-256-GCM via PBKDF2 (100k) for journal data the server never sees; Ed25519 signing for Layer 2 provenance. Key custody = founder-owned offline backup (KMS deferred to scale). | **Aligned (informal)** — strong for current scale; per-user keys + KMS are deferred-by-design (documented in `ADR-ENCRYPTION-WIRING-01` / `ADR-A4`). |
| **Access control** | Restrict PII access | Supabase RLS (each row locked to its user); admin `service_role` separated; masking view for reviewers. | **Aligned (informal)**. |
| **PII sharing, transfer & sub-processors** | Govern sub-processors; document transfers | **Sub-processor register drafted** (`/compliance/sub-processor-register.md`, A16c): Anthropic, Supabase, Vercel; all US-hosted. | **Partial** — register drafted; DPA-execution status "to confirm" and cross-border transfer mechanism (EU→US) are lawyer-queued (LRQ-7). No EU users at present. |
| **Transparency / information to PII principals** | Privacy notice covering processing, sub-processors, automated decisions | Privacy policy + ToS live; ToS covers AI-generated content. Privacy policy is **stale** (Supabase region; APP 1.7 ADM transparency not yet added). | **Partial** — notice exists but needs the queued privacy-policy update (LRQ-4) before 10 Dec 2026. |
| **Records of processing (ROPA)** | Maintain a processing record | The DPIA + sub-processor register together contain most ROPA content, but no single ROPA document exists. | **Partial / Gap** — assemble a ROPA from the A16 artefacts at a future pass (internal, not legal). |
| **Incident / breach management** | Breach detection + notification procedure | No documented breach-notification procedure yet. Cyber insurance is `PLANNED` (CR-012). | **Gap** — a written breach-response runbook (incl. notification timelines) is a sensible pre-launch addition. |

---

## Summary

**Strengths that already track ISO 27701:2025 well:** application-level encryption, per-user access control, the four data-subject-rights endpoints, privacy-by-design in the build, and (now) a DPIA + sub-processor register + operationalised review cadence.

**Honest gaps (none are blockers; none require overclaiming to close):**
1. **Retention-period schedule** — define per-category retention (internal; not legal).
2. **Breach-response runbook** — write a notification procedure (internal; pre-launch).
3. **ROPA** — assemble one from the A16 artefacts (internal).
4. **PIMS scope statement** — one page formalising §4 (internal).
5. **Lawful basis** — legal determination (lawyer-queued, LRQ-1).
6. **Cross-border transfer mechanism** — relevant only once EU users exist (lawyer-queued).

None of these is upgraded to "aligned" on the strength of this document (R19). They are recorded so the next governance pass and the lawyer engagement can close them.

---

*End of alignment map. Informal self-assessment only — not certification, not a certification gap analysis.*
