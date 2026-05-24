# 99 — Conflict Log (seed)

Where sources disagree. Each entry: the conflict, the resolution rule, and any action it implies. This is seeded at room build; the manual loop + harness sessions append to it.

---

## C-1 — Stale guides vs current code

- **Conflict:** `/PROJECT_STATE.md`, `/users-guide-to-sagereasoning.md`, `/summary-tech-guide.md` describe a "three product layers / Agent Trust Layer" world. The current code is a **four-product** system (Calling, Reasoning, Assent, Reflect).
- **Resolution rule:** current-authoritative sources win (decision-log + code + adopted design docs). The guides are **background only** (see `02_inventory/` Authority Ranking).
- **Action:** do not ground any test assertion in the guides. (Their reconciliation to four-product framing is separate doc-maintenance, not this room's job.)

## C-2 — Component registry lags the code

- **Conflict:** `component-registry.json` (v1.5.0, 2 May) predates the May build arc; its statuses do not reflect A10 **Live**, Sage Reflect **Live**, or the E#1 fix (Verified 2026-05-23).
- **Resolution rule:** the **decision-log + code** are authoritative for status; the registry is a lagging convenience.
- **Action:** when the harness needs a status, read it from the inventory (`02_inventory/`), not the registry. A registry-reconciliation pass (`sage-registry-audit` skill) is a candidate future task — out of scope for the room build.

## C-3 — `trust-layer/` directory name (recorded residual)

- **Conflict:** the directory `website/src/lib/substrate/trust-layer/` keeps the ATL-era name even though the product is "Sage Assent."
- **Resolution rule:** **consciously retained** per `D-PARKED2-DISCRIMINANT-RENAME-TRUST-LAYER-RETAIN-2026-05-23` (option (c)) — it is a verbatim KEEP-IN-SYNC mirror of the root `/trust-layer/` source-of-truth; renaming only the mirror would break the structural-identity claim.
- **Action:** none. It is a recorded residual, not a defect. Revisit only if the root `/trust-layer/` codebase is itself renamed.

## C-4 — "No stage is optional" vs "selective offering is legitimate" (flagged for Priority 3)

- **Conflict:** `/adopted/sage-reflect-product-design.md` carries "no stage is optional / no stage can be bypassed" language. The 2026-05-23 mentor ruling (now manifest **R18f + R19e**) says selective offering of the products **is** legitimate, with two named exceptions.
- **Resolution rule:** the manifest rules (R18f/R19e, Adopted 2026-05-23) govern. The design-doc language needs reconciling.
- **Action:** **Priority 3** — a governance edit to an adopted doc; founder approval required (per the P1 close Open Questions). Not this room's job; logged so it isn't lost. The test brief's configuration matrix already follows R18f/R19e, not the design-doc language.
