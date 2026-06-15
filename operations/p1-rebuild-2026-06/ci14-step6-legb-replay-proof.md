# CI-14 Step 6b — leg-B replay acceptance proof (FX-3 + FX-17 closed by construction)

**Date:** 2026-06-15. **Environment:** TEST (`iwdtrvuphogkwmovhnvz`), local `npm run dev` on `localhost:3000`.
**Flags (TEST):** `SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED=true`, `SUBSTRATE_L1_SCHEMA_KEY_PATH_ENABLED=true`, `SUBSTRATE_WRITE_PATH_ENABLED=true`, `SAGE_CALLING_ENABLED=true`, `SAGE_REFLECT_ENABLED=true`.
**Spec:** `adopted/adr/2026-06-14-credential-consolidation.md` §"FX-3 regression class" + Migration §6; Step-6 prompt §6b.

## The one credential (minted via the CI-7 CLI `mint practice`)

- **prefix** `sr_prac_` · **id** `0c307e93-c198-4b14-888a-0a769ddf8d25`
- **capabilities** `{consult, l1_supply, accreditation_write, calling, reflect}` (all five)
- **agent_id** `legb:upc-replay@v1` (K1 canonical) · **owner** promoted to the TEST admin `profiles` row (`m2-test-admin@example.com`) → `owner_kind=operator`
- defaults `30/mo, 1/day, 1 max-chain` (CI-6 consult defaults preserved on the UPC mint)
- `Target: http://localhost:3000` confirmed on both mint + revoke (TEST, not prod — memory `mint-cli-env-file-export-leak`).

## PRE-revoke — one credential ACCEPTED on every surface

| Surface | Capability | Transport | Result | What it proves |
|---|---|---|---|---|
| `POST /api/reason` (consult **+** `layer1_schema`) | `consult` + `l1_supply` | `X-Api-Key` | **200** · `meta.layer1_source=supplied`; response `extraction` = the supplied schema | **FX-3 closed** — one credential carries consult AND l1_supply; the precomputed schema is used (no server-side re-extraction ⇒ no double-L1 billing); l1_supply rides the same credential, no second auth-path to lose it |
| `POST /api/accreditation/legb:upc-replay@v1` | `accreditation_write` | `Bearer` | **400** "Body field 'kind' must be 'seed' or 'update'" | Credential ACCEPTED — auth runs before the body `kind` check (route line 424 vs 466); a 400 here means it passed authentication + agent_id binding |
| `POST /api/calling` | `calling` | `Bearer` | **200** `status=in_progress, stage=Q1` | Credential ACCEPTED — full business success |
| `POST /api/practice/reflect` | `reflect` | `Bearer` | **200** `status=in_progress` (session opened) | Credential ACCEPTED — passed the body parser AND auth |
| `POST /api/calling` (negative) | `calling` | **`X-Api-Key`** | **401** Unauthorized | **Constraint 7 confirmed live** — the write-class credential is Bearer-only even as a UPC; X-Api-Key is refused |

**FX-17 closed by construction:** the entire practice ran on **one** credential. The leg-B three-credential sequence (`sr_inst_` for reason → `sr_live_` mid-run → `sr_assent_` for the write) — and the mid-run switch that *caused* FX-3 — is now **structurally unrepresentable**: there is no second credential to switch to.

## POST-revoke (CLI `revoke practice --id 0c307e93…`) — DENIED on every surface

| Surface | Transport | Result |
|---|---|---|
| `POST /api/reason` | `X-Api-Key` | **401** (the consult surface returns the route's uniform auth-failure 401; pre-existing — it discards `validateApiKey`'s 403/suspended and falls back to the user-auth 401, route line 711) |
| `POST /api/accreditation/[agent_id]` | `Bearer` | **401** (suspended → invalid_token, no-leak collapse) |
| `POST /api/calling` | `Bearer` | **401** |
| `POST /api/practice/reflect` | `Bearer` | **401** |

Universal `is_active=false` revocation (the retained opaque-bearer primitive) denies the **one** credential across **all** surfaces at once — the SR-14 "one credential across the practice" property, now true for revocation too.

## Defect found + fixed in-session (surfaced by the live replay)

`summariseMintResponse` (CLI, `mint-credential-core.ts`) read the raw token from `api_key` only for the `'api'` class; the `'practice'` class **also mints via `/api/admin/api-keys`** (which returns `{ api_key, ...keyRecord }`) but fell into the else-branch expecting the install/assent `{ token, credential }` shape → the `sr_prac_` token was dropped (`token: null`, `record: {}`). The credential minted correctly (201) — only the CLI display/capture failed. **Fixed** by grouping `'api' || 'practice'` (mirrors `buildMintPlan`); regression-locked by new tests **SM-4** (practice response shape) + **CP-5** (`sr_prac_ → practice`). Suite: mint-credential-core **56/0** (was 54). The first orphan mint (token unrecoverable) was revoked; re-mint surfaced the token.

## Out-of-scope observation (NOT a CI-14 change)

`/api/reason` returns a generic 401 for *any* failed auth (revoked / quota-exceeded API keys included), discarding `validateApiKey`'s specific 403/429 — pre-existing route behavior, identical flag-off, not introduced by the UPC. Noted, not fixed here.

## Conclusion

The acceptance proof holds: **one Unified Practice Credential, five capabilities, every surface — used then revoked → denied everywhere.** FX-3's class and FX-17 are closed by construction. The R18f provenance gate, R20a, distress, and Layer-2 signing were untouched (the accreditation write reaches — and is correctly gated behind — the body/provenance layer, distinct from the credential layer).
