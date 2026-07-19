# Next-Session Prompt — the s9-loop consult-credential refresh

**Stream:** founder (trust-core / Gate-1 dogfood harness).
**Tier:** **`code-critical`** under 0d-ii — this session mints and/or revokes production credentials (auth/access-control change; PR6 + AC7 engage the moment any mint/revoke actually runs). The Critical Change Protocol (project instructions 0c-ii) applies in full: name what's changing, what could break, what happens to existing sessions, the rollback plan, the verification step, and explicit founder approval before any live op.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`.
**Predecessor session close:** `operations/handoffs/founder/2026-07-19-kathekon-dikaiosyne-self-circle-narrowing-CLOSE.md` (§6, "Next Session Should", names this as recommended near-term — the harness ran intermittently framed during that session).
**Risk classification:** Critical under 0d-ii (credential mint/revoke). AC7 applies to every live Supabase/mint/revoke step — the founder runs those; the AI guides + verifies. PR6 (Critical Change Protocol) + PR17 (founder-performed operational steps walked through live, not handed off).

## Why this session matters

The standing Gate-1 pre-decision harness — installed in the founder's own Claude Code loop, identity `sagereasoning:s9-loop@v1` — is the **live dogfood** for every trust-core surface this project ships (the AE-1 delta layer, AE-2 `loop_fold`, the false-hold instrument, and the general "does the practice examine its own builder" claim). During the 2026-07-19 self-circle-narrowing session, the harness's at-action consults were **intermittently framed**: some genuinely examined the action (real `is_kathekon`/circle data observed), others 401'd or hit the 28-second consult timeout (fail-open-honest — the harness never blocks on it, but the examination is silently absent for that action). This is not the 2026-07-17 public-credential-exposure class (gen-1 was revoked then; gen-2 is the credential in question now) — it is a fresh, undiagnosed intermittency on the currently-live gen-2 credentials.

An unframed or intermittently-framed harness is a silent instrument-fidelity gap: every session running on it (including sessions that touch the trust core itself) is examined less reliably than the standing claim implies, and no alarm fires — the fail-open design means the founder only notices by reading `gate1.log` after the fact, as happened this session.

## Known state (verify, don't assume)

Per `operations/trust-layer-2026-07/S11-FLIP-PREREQUISITES-REGISTER.md` §E (credential generations — READ THIS SECTION IN FULL before touching anything):

| Gen | Role | id | Status (as of the register's last update) |
|---|---|---|---|
| 1 (S9, 2026-07-11) | consult | `09e83b4d…` | **REVOKED 2026-07-17** — public-exposure incident |
| 1 (S9, 2026-07-11) | accred | `e715520b…` | **REVOKED 2026-07-17** — public-exposure incident |
| 2 (2026-07-17) | consult | `33bef3d4-018d-4313-bcfd-65a75132155c` | claimed LIVE — 5000/200 |
| 2 (2026-07-17) | accred | `1ffe14f6-0f07-4296-b340-c3bdfbbc7ce2` | claimed LIVE — 5000/200, owner+agent bound |

The identity `sagereasoning:s9-loop@v1` was deliberately **not** split to `@v2` when gen-2 was minted (it is the subject of the D1 justice-cap review; splitting would fragment the record). Gen-2's limits (5000/200) were raised **by SQL**, not the mint CLI — the practice mint's default form silently drops `--daily`/`--monthly` overrides, so a fresh mint without the SQL follow-up lands on the CI-6 self-service defaults (**30/1/1** — 30 calls/day, 1/month-scoped limit, 1 concurrent or similar; see `API_KEY_FREE_TIER_DEFAULTS`), which starves a harness making many calls per session within hours.

**Do not assume gen-2 is broken.** The symptom this session was *intermittent*, not total — some consults succeeded with real data. Plausible causes, in rough likelihood order, to actually check before minting anything new:
1. **Rate exhaustion** — if the 5000/200 SQL raise didn't actually stick, or was on the wrong row, gen-2 could be silently back on 30/1/1 and exhausting mid-session.
2. **Token drift in `.claude/settings.local.json`** — the file is gitignored (`**/.claude/settings.local.json*`) and hand-maintained; a stale or partially-edited value there would 401 consistently, not intermittently, but check anyway (see memory `gate1-dogfood-credential-stale-token` — this exact class has happened before, twice).
3. **The 28-second consult timeout** — a genuine latency/outage issue on the `/api/reason` consult path, unrelated to the credential itself. If the 401s are actually timeouts (`gate1.log` will say `reason="timeout"` vs `reason="http 401"` — the two are different failure classes and need different fixes), this session is the wrong session (it's a latency/infra issue, not a credential refresh).
4. **A genuine revoke or expiry** nobody recorded.

## Pre-conditions

1. Read the predecessor close in full.
2. Read `S11-FLIP-PREREQUISITES-REGISTER.md` §E in full (the credential-generation ledger this session must update).
3. Have `gate1.log` available (`GATE1_STATE_DIR`, likely `~/.sage-gate1` or similar — check `.claude/settings.local.json`'s `env` block for the actual path) to read the failure pattern BEFORE hypothesizing a cause.
4. Memory to re-read at open: `gate1-dogfood-credential-stale-token`, `claude-code-desktop-app-hook-env`, `prod-mint-needs-prod-admin-jwt`, `api-key-1-per-day-limit-masks-as-401`.

## Part A — Open under the protocol

1. `/adopted/standing-protocol-cache.md` (~3 min)
2. The predecessor close (above)
3. `S11-FLIP-PREREQUISITES-REGISTER.md` §E in full
4. `operations/decision-log.md` — last 2 entries
5. The four memory files named above

Confirm at open: tier (**Critical**); hold-point status; model selection; status vocabulary; signals/risk class. State explicitly that no mint/revoke/SQL op runs without founder approval on the specific action named at the time.

## Part B — Procedure

### Step 1 — Diagnose (read-only; no live op)
- Read `gate1.log` (or the harness's equivalent buffer) for the failure pattern across this and recent sessions: count `http 401` vs `timeout` occurrences, and whether failures cluster in time (rate exhaustion — bursts late in a long session) or are scattered (something else).
- If a founder-runnable read query is available (the public `GET /api/accreditation/{agent_id}` or an admin credential-status lookup), check gen-2's actual current `daily_limit`/`monthly_limit` values against the claimed 5000/200 — confirm the SQL raise is still in effect and on the correct row (a wrong-row raise would explain "claimed 5000/200, behaves like 30/1/1").
- Check `.claude/settings.local.json`'s `env` block against the register's gen-2 ids — confirm the file actually holds the gen-2 tokens (not a stale gen-1 remnant, not a placeholder).
- **Do not proceed past this step until the failure class is Diagnostic-certain or Diagnostic-uncertain-with-founder-acknowledgement** (per the AI-signals table — don't silently guess).

### Step 2 — Decide the remedy (founder decision point)
Based on Step 1's finding, one of:
- **(a) Rate limit drifted back to defaults or was set on the wrong row** → a founder-run SQL correction re-raising the limit on the correct `api_keys` row (no new mint; Standard-adjacent but still touches a live credential's limits — confirm with the founder before running).
- **(b) Token drift in `.claude/settings.local.json`** → the AI corrects the local file to match the register's recorded gen-2 tokens (if the AI has them) or the founder re-pastes them from the original mint output (if the AI does not — raw tokens are shown once at mint and are not recoverable from the DB).
- **(c) Genuine credential problem (expired/corrupted/silently revoked)** → mint gen-3 (founder-performed, admin JWT required — see `prod-mint-needs-prod-admin-jwt`; use `website/scripts/mint-credential.ts mint api --label "s9-loop consult gen-3" ...` for the consult leg, `mint assent ...` for the accreditation-write leg per the existing gen-2 shape; **raise `--daily`/`--monthly` explicitly in the SAME mint call if the CLI supports it now, or immediately follow with the SQL raise the register documents gen-2 needed** — do not repeat the CI-6-defaults-starve-the-harness class). Decide with the founder whether to split the identity to `@v2` this time (the register's stated reason for NOT splitting at gen-2 — it being D1's cap-review subject — should be re-examined; D1's correction already landed, so the constraint may no longer apply) or keep `sagereasoning:s9-loop@v1`.
- **(d) A genuine latency/outage issue, not a credential issue** → this session's scope was mis-targeted; document the finding, do NOT mint/revoke anything, and hand off a differently-scoped follow-up (a `/api/reason` consult-latency investigation).

### Step 3 — Execute (founder-walked; AC7)
Whichever remedy Step 2 selects, the founder runs the live op (SQL / mint / settings-file edit-and-restart-the-harness). The AI verifies before and after: a read of the credential's current state pre-op, and a live consult smoke post-op (a single real `/api/reason` call through the harness, confirmed framed in `gate1.log` with real signal data, not a 401/timeout).

### Step 4 — Verify
- Run 3–5 consecutive at-action consults through the live harness (ordinary session work is fine — no synthetic load needed) and confirm zero 401s / zero timeouts in `gate1.log` for that window.
- If gen-3 was minted: confirm the OLD gen-2 tokens are either genuinely retired (revoked, if compromised/broken) or left dormant with a clear register note on why (never leave two live token sets for the same identity without a stated reason).

### Step 5 — Update the register
`S11-FLIP-PREREQUISITES-REGISTER.md` §E gets a new row (or corrected gen-2 status) + a changelog entry, in the register's existing format. This register is the standing source of truth for credential attribution — do not let this session's finding go undocumented there.

### Step 6 — Append decision-log entry (lean or full form per what actually happened)
If Step 2 resolved to (a) or (b) — no new credential, a correction only — the lean decision-log form suffices (Standard/Elevated risk, per what was actually touched). If (c) — a genuine gen-3 mint — use the Critical form (per the predecessor sessions' pattern in this arc) since a new production credential now exists.

### Step 7 — Session close (lean or full, matching Step 6's form)

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + register + memory read | 15 min |
| Step 1 — diagnose | 20–30 min |
| Step 2 — founder decision | 10 min |
| Step 3 — execute (founder-walked) | 10–20 min |
| Step 4 — verify | 10 min |
| Step 5–7 — register + decision-log + close | 20 min |
| **Total** | **~1.5–2 hours** |

## Rollback path

- If (a) SQL correction: revert the limit values via a follow-up SQL statement (record the pre-op values in Step 3 specifically so this is possible).
- If (b) settings-file correction: the file is gitignored and local-only; restoring the prior (broken) value is trivial if needed, though there's no reason to.
- If (c) gen-3 mint: revoke gen-3, leave gen-2 as the standing credential (assuming gen-2 was not the actual problem after all — a possible outcome if diagnosis was wrong). Never revoke a credential the diagnosis hasn't actually implicated.

## Forecast

Success looks like: the failure class named with Diagnostic-certainty (not guessed), the harness framing every at-action consult in a clean multi-consult verification window, the register accurately reflecting whichever credential generation is actually live, and — if a genuine mint happened — the old generation's disposition (revoked or deliberately dormant) stated, not left ambiguous. This closes the "recommended near-term" item from the self-circle-narrowing close and restores full confidence in the dogfood harness's fidelity for the sessions that follow it (notably register item D4, the reducer self-circle narrowing, and any future S11 readiness re-measurement — both depend on the harness actually examining what it claims to examine).

End of prompt.
