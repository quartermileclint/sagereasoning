# Next-Session Prompt — consult-lookup resilience + composed-consult latency (the s9-loop framing follow-up)

**Stream:** founder (trust-core / Gate-1 dogfood harness).
**Tier:** **`code-elevated`** under 0d-ii — a server-side resilience change that makes the SAME auth decision more robustly (no auth-decision / access-control change ⇒ NOT Critical) + a local harness-config knob. Confirm at open; escalate to `code-critical` only if the design turns out to touch the auth *decision* (it should not).
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`.
**Predecessor:** `operations/handoffs/founder/2026-07-19-s9-loop-consult-credential-refresh-CLOSE.md` + decision `D-S9-LOOP-CONSULT-CREDENTIAL-DIAGNOSED-HEALTHY-NO-REFRESH-2026-07-19`.

## Why this exists

The P0 "consult-credential refresh" (2026-07-19) diagnosed the s9-loop dogfood's intermittent framing and found **the credential is healthy — the fix is NOT a credential op.** DB-verified (founder-run `list`): the consult token hashes to id `33bef3d4…`, limits **5000/mo, 200/day**, monthly usage **623/5000**, daily successes peak ~57 (far below 200/day) — **quota is ruled out, do not re-litigate it.** The dominant failure is a **server-side transient DB-layer fail-secure surfacing as HTTP 401**, plus the **S11b composed-consult latency (28s hook timeouts)**. Note the route flattens EVERY `validateApiKey` failure (invalid_token / quota-429 / suspended-403 / usage-RPC-503) into a single 401 (`src/app/api/reason/route.ts:706–726` returns `auth.error`, never `apiKey.error`) — so the 401 status is diagnostically ambiguous by design; the DB `list` was the disambiguator. This session addresses those two — the real remedies the credential refresh could not provide.

**Read the predecessor decision-log entry + register §E note (2026-07-19) in full at open — they carry the Diagnostic-certain evidence so you do not re-derive it.**

## The two work items

### Item A — credential-lookup resilience (the dominant 401)

On the live consult path, a **transient query error during credential validation is fail-closed to `invalid_token` → HTTP 401** (`website/src/lib/security.ts:543`; `website/src/lib/practice-credential.ts:211` and the `invalid_token` return at ~`:304`). Under the dogfood's burst of heavy 13–20s composed consults this surfaces as a spurious auth failure (131 all-time 401s on a token with 256 successes — see the log analysis in the predecessor close).

**Design (elevated, dark/gated recommended):** distinguish a **transient query error** (network/timeout/5xx from the credential lookup) from a **genuine no-row (unknown key)** in `validatePracticeCredential`, and on the transient class **retry once (or a short bounded backoff)** before fail-closing. Preserve fail-secure semantics — a genuinely unknown key still → `invalid_token`; a persistent query error still fail-closes; the change only removes the *spurious* 401 from a one-off DB hiccup. **This makes the same auth decision, more resiliently** — surface that explicitly to keep the tier at `code-elevated`. Consider whether the `usage-RPC` fail-secure (→ 503) warrants the same one-retry treatment (17 all-time 503s, same root). Gate behind a flag if the retry changes latency/behaviour materially; assert flag-off byte-identity. Add unit coverage: transient-error → retry → success; persistent-error → fail-closed; unknown-key → 401 unchanged.

**Do NOT** widen what authenticates, relax the no-row path, or add a caller-supplied bypass. If the design starts touching the auth *decision* (not just its resilience), STOP and re-tier to `code-critical`.

### Item B — composed-consult latency (the 28s timeouts + the DB-contention driver)

45 all-time `timeout after 28000ms` on the at-action consult — the S11b composed extraction runs 13–20s and sometimes exceeds the 28s hook timeout (fail-open-honest). This latency both loses frames directly AND lengthens the window in which the burst contends the DB (feeding Item A's 401s). Two levers, both low-risk:

- **`GATE1_ACTION_TEXT_MODE=lean`** — the documented latency mitigation (register P3/P6; `action-composer.mjs`). Set it in the founder-loop `.claude/settings.local.json` `env` block. **Tradeoff (state it):** lean frames compose less context ⇒ slightly less faithful examination — a *partial* revert of the S11b input enrichment. This is a fidelity-vs-availability call; recommend it as reversible and observable, not permanent.
- **Raise the at-action hook timeout** past 28s (the `PreToolUse … at-action-hook.mjs` entry's `timeout` in `settings.local.json`, and/or the hook's internal consult `--max-time`). Trades a longer per-action pause for fewer lost frames. Check the two are consistent (the hook's own fetch timeout must be ≤ the settings `timeout`).

Item B is **local config** (settings.local.json) — no prod op. Decide with the founder whether to ship lean-mode, the timeout raise, both, or neither, and observe the failure rate over the next sessions via `gate1.log`.

## Pre-conditions / open

1. `/adopted/standing-protocol-cache.md`.
2. The predecessor close + `D-S9-LOOP-CONSULT-CREDENTIAL-DIAGNOSED-HEALTHY-NO-REFRESH-2026-07-19` + register §E (2026-07-19 note).
3. Memory: `gate1-consult-401-is-transient-fail-secure`, `api-key-1-per-day-limit-masks-as-401` (now corrected), `claude-code-desktop-app-hook-env`.
4. Re-verify the current failure profile from `gate1.log` (`GATE1_STATE_DIR=/Users/clintonaitkenhead/.sage-gate1`) before and after any change — the before/after 401+timeout rate is the verification.

## Verification

- Item A: unit battery green (transient→retry→success; persistent→fail-closed; unknown→401 unchanged); `tsc` 0; `npm run build` 0; flag-off byte-identity asserted if gated. This is server-side ⇒ a founder-walked deploy (PR17) if it ships to prod.
- Item B: local config only; the metric is a measured drop in `gate1.log` 401+timeout rate over subsequent sessions.

## Scope discipline

Item A is the substantive one (server code + possible deploy). Item B is a config knob. Neither is a credential op. Do NOT mint/revoke — the credential is healthy (predecessor decision). The S11 flip stays REFUSED; MEASURE throughout; weights BLOCKED; the 0h call remains the founder's.

End of prompt.
