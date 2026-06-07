# Sub-Processor & DPA Register (A16c)

**Status:** Draft — adopted as a founder-authored draft 2026-06-07 under `D-A16-A17-PRIVACY-REGULATORY-GOV-2026-06-07`. **DPA-execution confirmation deferred** to the Stage-1-close lawyer engagement (see Lawyer Review Queue LRQ-3).
**Rules served:** R16 (data governance), R17 (intimate data), R14 (compliance pipeline).
**Controller:** founder (sole trader now; company-as-controller post-Pty Ltd incorporation, FPE-1).
**Processor relationship:** the three vendors below are **sub-processors** acting on the controller's instructions.

> **Honesty note (R19).** "DPA status" below records whether a signed Data Processing Agreement is **confirmed executed**. Where this has not been verified, it is marked **"To confirm"** — it is not asserted as in place. Confirming each is a queued action, not a claim.

---

## Register

### 1. Anthropic (Claude API)

| Field | Detail |
|---|---|
| **Role** | Sub-processor — LLM inference |
| **What it processes** | Prompt content sent for assessment + prose generation (may include intimate-adjacent reasoning content). Does **not** receive stored ciphertext; receives only what a given assessment requires. |
| **Where** | United States (Anthropic servers) |
| **Stated data policy** | Per Anthropic's stated API data-usage policy: API inputs are **not used to train models** and are **not retained beyond the immediate processing request**. *(Confirm current terms at anthropic.com/policies before launch — policy text dated in the codebase as "as of March 2026".)* |
| **DPA status** | **To confirm** — verify whether a commercial DPA (and, if needed, Zero-Data-Retention terms) is executed for the account. → **LRQ-7** |
| **Cross-border transfer** | EU→US would apply *only if EU users are onboarded*; mechanism (SCCs / EU-US Data Privacy Framework) **to confirm**. N/A today (no EU users). |

### 2. Supabase (Postgres database + auth)

| Field | Detail |
|---|---|
| **Role** | Sub-processor — data storage + authentication |
| **What it processes/stores** | Account data, auth identifiers, mentor profile, **application-level-encrypted** intimate fields (AES-256-GCM ciphertext), assessment outputs. Row-Level Security locks each row to its owner. |
| **Where** | **US East (North Virginia)** — project ref `jdbefwkonfbhjquozgxr`. *(Migrated from Singapore; the live privacy policy still says Singapore — see "Downstream" below.)* |
| **Stated data policy** | At-rest encryption; SOC 2 posture (confirm current certifications). |
| **DPA status** | **To confirm** — Supabase publishes a DPA; verify it is executed for this project. → **LRQ-7** |
| **Cross-border transfer** | Data now resides in the US. EU→US mechanism **to confirm** before any EU launch. N/A today. |

### 3. Vercel (application hosting + serverless compute)

| Field | Detail |
|---|---|
| **Role** | Sub-processor — hosting + compute (the substrate runs here) |
| **What it processes** | All request/response data **transiently in compute** (in transit and during function execution). Does not persistently store the intimate dataset (that is Supabase). |
| **Where** | United States (confirm the specific function/deployment region in the Vercel dashboard). |
| **Stated data policy** | Vercel publishes a DPA and sub-processor list; confirm current terms. |
| **DPA status** | **To confirm** — verify the Vercel DPA is accepted/executed for the account. → **LRQ-7** |
| **Cross-border transfer** | EU→US mechanism **to confirm** before any EU launch. N/A today. |

---

## Summary table

| Sub-processor | Processes | Region | DPA status | Transfer mechanism |
|---|---|---|---|---|
| Anthropic | Prompt content (inference) | US | To confirm | To confirm (N/A today) |
| Supabase | Stored data (encrypted) + auth | US East (N. Virginia) | To confirm | To confirm (N/A today) |
| Vercel | Data in transit / compute | US | To confirm | To confirm (N/A today) |

---

## Downstream: privacy-policy sub-processor list (SEPARATE approved edit)

The published privacy policy (`website/src/app/privacy/page.tsx`) must, before launch, present a sub-processor list consistent with this register. Two corrections are needed and are **a separate, founder-approved privacy-policy edit — not made in this governance session**:

1. **Supabase region** — the policy says **Singapore**; the actual region is **US East (North Virginia)**. Correct it.
2. **Completeness** — the policy names Anthropic and Supabase; it should also name **Vercel** as a hosting/compute sub-processor, and align the descriptions with this register.

This downstream edit is captured in the Lawyer Review Queue as **LRQ-4** (bundled with the APP 1.7 automated-decision-making transparency update due 10 Dec 2026, since both are the same privacy-policy edit). The privacy policy is live user-facing functionality — changing it is an **Elevated** edit requiring explicit founder approval; it is intentionally **not** performed here.

---

*End of sub-processor register. Drafted on current understanding; every DPA-execution and transfer-mechanism item is marked "to confirm" and queued, not asserted.*
