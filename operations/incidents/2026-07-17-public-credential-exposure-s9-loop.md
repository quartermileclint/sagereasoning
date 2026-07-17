# INCIDENT — live production credentials exposed in a PUBLIC repository

**Date raised:** 2026-07-17. **Severity:** HIGH (live credentials, public repo, ~5.5 days). **Status:** **CONTAINED — both credentials revoked + independently verified 401; the repo hole closed.**
**Decision-log entry:** `D-INCIDENT-PUBLIC-CREDENTIAL-EXPOSURE-S9-LOOP-2026-07-17`.
**Found:** during the final `git status` of the RA-1-F2 mentor-briefing session — **not** by any tripwire, because none exists.

---

## 1. What was exposed

| | |
|---|---|
| **File** | `.claude/settings.local.json.bak` — **tracked**, present **at HEAD** on public `main` (not merely in an old commit) |
| **Repo** | `https://github.com/quartermileclint/sagereasoning` — **PUBLIC** (founder-confirmed) |
| **Entered history** | commit **`849f830`** ("S9b walk fold"), authored/committed **2026-07-12 09:13 +1000**, subsequently **pushed** (verified: `849f830` is an ancestor of `origin/main`) |
| **Exposure window** | **2026-07-12 09:13 → 2026-07-17 22:4x +1000 ≈ 5 days 13 hours** |
| **Credentials** | `SAGE_GATE1_CREDENTIAL` = `sr_prac_2068e…` (id `09e83b4d…`) — `consult`<br>`SAGE_GATE1_ACCRED_CREDENTIAL` = `sr_prac_eb2cb…` (id `e715520b…`) — `accreditation_write` + `reflect` |
| **Identity** | `sagereasoning:s9-loop@v1` — the S9 dogfood harness loop |

**Reach of the exposed keys:** consult → `/api/reason` (real Anthropic Sonnet spend; 200/day, 5000/month); accred → **writes the PUBLIC trust/accreditation record** for `s9-loop@v1`. **Neither can** mint, deploy, reach Vercel/Supabase directly, or read another agent's data. Bounded — but the accred key could write the public trust surface, which is the asset the whole project exists to make trustworthy.

## 2. Scope — precisely bounded (do not overstate this)

A first sweep for `sr_(live|prac|inst|assent)_[a-f0-9]{6,}` returned **27 tracked files** and looked alarming. **26 were false positives** — the regex matches redacted record refs (`sr_live_410782`, `sr_assent_3396`). Re-run for **full-length tokens** (`sr_*_` + 30+ chars):

- **Exactly ONE tracked file carries a real token: `.claude/settings.local.json.bak`.**
- `.claude/gate1-hooks-block.json` (the other tracked `.claude` file) has **no `env` block ⇒ no credentials**.
- `leg-d-harnessed-v3/sage-call.sh` reads `sr_prac_7d0a66ff-REDACTED` — **the 2026-07-07 redaction held.**
- All `website/src` hits are fixtures (`sr_assent_deadbeef`, `sr_inst_abc`).

**Two credentials, one file, one commit.**

## 3. Root causes — four, and they compound

**0. The mechanism (established, not inferred).** `849f830` **ADDED** `.claude/settings.local.json.bak` (412 lines) alongside genuine S9b walk fixes. **No skill or script creates that file** — `/practice-off`'s backup is `gate1-hooks-block.json`, which the skill explicitly and correctly documents as carrying no secret. The `.bak` was made **ad-hoc** during the S9b walk, and the S9b close's verification block used **`git add -A`** — which, with no ignore rule matching the name, swept it in with the legitimate changes.

1. **The ignore rule was exact-name, not a glob.** The founder's **global** gitignore (`~/.config/git/ignore:1`) carries `**/.claude/settings.local.json` — the exact filename only. **The repo's own `.gitignore` had no `.claude` entry at all.** So `settings.local.json` was ignored while **every variant name (`.bak`, `.pre-*`) was not**. The protection looked total and was one character wide.
2. **No secret-scanning tripwire exists.** Not in the repo, not in CI, not in any session's verification block. Five days and multiple sessions' "Founder Verification" steps passed over a tracked file with two live keys in cleartext. The project's `.gitignore` already had a *"Local env-file backups (may contain secrets) — never commit"* section (`.env.local.*`) — the concept existed; it was never extended to the harness settings.
3. **The AI nearly doubled it.** Advising the clock-stop, the AI told the founder to `cp` a backup named `settings.local.json.pre-clock-stop-<ts>` — a name the global ignore does not match — containing both credentials, into a repo the founder was about to `git add`. The AI verified the flag's **parse semantics** carefully (`parseBool` fallback chain, `discernment.config.json`) and never checked the **ignore rule for the file it was creating**. Caught only by reading the final `git status` properly rather than pattern-matching "looks clean."

**The common shape of (1) and (3):** a frame accepted without checking — the same failure the mentor's ruling was about (a specification resting on an empirical premise nobody rechecked), reproduced twice in the session that documented it.

## 4. Remediation — done

| # | Action | Status |
|---|---|---|
| 1 | **Both credentials REVOKED** (founder-walked, PR17 — the AI performed no revoke) | ✅ **DONE 2026-07-17** |
| 2 | **Revocation independently verified** — negative-auth probe, both `sr_prac_` tokens → **HTTP 401** `{"error":"Plugin authentication failed"}` against live `/api/reason` | ✅ **VERIFIED first-hand** |
| 3 | Live confirmation from the harness itself — the at-action guardrail began returning `http 403` / `http 401` and degraded to **fail-open-honest** ("UNAVAILABLE" frames), the designed posture | ✅ observed in-session |
| 4 | The AI's near-miss backup **moved OUT of the repo** → `~/sage-settings-backup-pre-clock-stop-20260717.json` (rollback preserved, leak removed; confirmed gone from `git status`) | ✅ **DONE** |
| 5 | **`.gitignore` fixed** — `.claude/settings.local.json*` (**glob, not exact name**) added under the existing secrets section, with an inline note recording why | ✅ **DONE** |
| 6 | Full-length-token sweep of the tracked tree + confirmation that the other `.claude` file and the leg-d redaction are clean | ✅ **DONE** (§2) |
| 7 | Public-surface check — `GET /api/accreditation/sagereasoning:s9-loop@v1` (`post_decision_check` / `agent_elected` / `monitored_since 2026-07-11`) and `GET /api/trust-record/...` (`dikaiosyne deliberate`, `justice_capped true`, `honest_reflect_count 9` — the 9th is this session's own reflect at 11:52). **Consistent with our own activity; no evident foreign writes.** Weak signal — an aggregate surface would not clearly show a third party's writes. | ✅ done, **bounded** |

## 4b. THE ABUSE CHECK — RUN 2026-07-17. **NO EVIDENCE OF COMPROMISE.**

Founder-run in the Supabase SQL Editor (read-only); AI-interpreted. **Two independent surfaces, both clean, and they cross-corroborate.**

**Billing (`loop_billing_events`, hourly, 2026-07-12 09:00+10 → close): ~465 calls / ~553¢ (~$5.53).**
- **No foreign `agent_id`** — only `sagereasoning:s9-loop@v1` and `null`. **The `null`s are explained, not unexplained:** the harness's `fetchFrame` sends `{input, depth, response_format}` and **never sends `agent_id`**, so `null` IS the harness's own consult signature; `s9-loop@v1` is the discernment path (which does send `orchestrator_agent_id`). The two-value pattern is exactly what our code produces.
- **No unexpected `surface`** — only `api_reason`, `api_guardrail`, `api_practice_discernment`, `wrapper_internal`. No `api_score_iterate`, no `agent_baseline`.
- **No overnight activity.** Everything 05:00–23:00 Brisbane across all 6 days — the classic scraper/bot signature is absent.
- **`api_practice_discernment` + `wrapper_internal` are near-unforgeable** (they require the founder's `discernment.config.json`, an agent-bound credential, AND a real subagent spawn) and appear in **every substantial hour**.
- Volume correlates with the frozen buffer's per-day shape (07-14 heavy 104 calls/50 records; 07-15 light 25/1).

**Trust ledger (`agent_trust_events`): the decisive one — the accred key writes the PUBLIC record, and A2 could not clear it (an accreditation write is not a metered loop).**
- **Only TWO examination-derived events exist, BOTH at the S9 install `2026-07-11 05:45:29.674+00`** (artifact `signed:substrate-layer2-2026Q2`), i.e. **BEFORE the exposure window opened (2026-07-12 09:13)**. ⇒ **ZERO accreditation writes occurred during the entire exposure window, by us or anyone. The public record was never written to.**
- All 23 remaining rows are reflect events (`virtue_domain: null`, `artifact_ref: reflect:reflect-<session-uuid>`) — **all ours**; the latest (`reflect-d796acf1-…`, 2026-07-17 11:52 UTC = 21:52 Brisbane) is **this session's own reflect at this session's own id**.
- **Every ledger event falls inside an hour the billing table independently shows activity** (all 23 checked; e.g. 07-13 20:09 UTC = 07-14 06:09 Brisbane → the billing table's 07-14 06:00 row). Two tables, same story.

**HONEST BOUND (do not overstate this):** this is a **consistency check, not proof of absence**. An attacker mimicking our exact pattern — same `agent_id`, same surfaces, inside the founder's hours — would be invisible to it. What can be said: **no positive indicator of compromise, and several signals that would catch an unsophisticated one are clean.** Given `sr_prac_` is a distinctive prefix and scrapers are fast, five days without a single overnight call is materially reassuring.

**Not run (judged marginal after the above):** `api_key_usage` per-endpoint counters (A2's `surface` array is the better version of the same test); `agent_assessment_history` (A2 covers the consult path); `credential_audit` (an exposed consult/accred token cannot mint, so it could only echo our own ops). The `agent_accreditation` row query **errored on a guessed column** (`total_actions_evaluated` does not exist) — re-run as `select * from agent_accreditation where agent_id = 'sagereasoning:s9-loop@v1';` if wanted; the public GET already showed the row consistent (`post_decision_check` / `agent_elected` / `monitored_since 2026-07-11`).

**⚠ A finding that improves S11a — the cap's ground is now QUERIED, not inferred, and it is NARROWER than this record first stated.** `justice_capped: true` rests on **ONE** `justice-surface-unevaluated` event (the S9 install, 2026-07-11) — **not on a stream from the 130 observation records.** The at-action consults **never became trust events**: emission fires only on accreditation writes (`emitAccreditationTrustEvents`, gated on `provenanceEnforced`). **S11a's cap review is therefore ONE event to examine, not a stream.** Register **D1** updated accordingly.

**Disposition: the record is CLEAN ⇒ re-mint on the SAME identity `sagereasoning:s9-loop@v1`** (a split to `@v2` would fragment the record that is itself the subject of S11a's cap review, and there is no polluted-record reason to split).

## 4c. RE-MINT — DONE 2026-07-17 (founder-walked, PR17)

The abuse check (§4b) came back clean, so the identity was **reused rather than split** — `sagereasoning:s9-loop@v1` is the subject of S11a's cap review (D1) and a split to `@v2` would have fragmented the very record that review examines.

| Role | Credential id | Capabilities | Binding |
|---|---|---|---|
| **consult** | **`33bef3d4-018d-4313-bcfd-65a75132155c`** | `consult` | agent-bound; owner-less ⇒ `external_consumer` (reproduces the S9 posture, disclosed there) |
| **accred** | **`1ffe14f6-0f07-4296-b340-c3bdfbbc7ce2`** | `accreditation_write`, `reflect` | agent-bound **and** owner-bound (mandatory — the 6e §A CHECK fires on the write-class overlap) |

**Superseding (for row attribution across the generations):** consult `09e83b4d…` → **`33bef3d4…`** · accred `e715520b…` → **`1ffe14f6…`**. Any `loop_billing_events` / `agent_assessment_history` / `agent_trust_events` row keyed to the **old** ids is **pre-2026-07-17** and belongs to the exposed generation; §4b establishes those are all ours.

**Limits raised by SQL to 5000 monthly / 200 daily** — **the mint cannot do this.** `buildPracticeMintPlan` sends only `{label, capabilities, agent_id?, owner_email?, owner_kind?, tier?, notes?, examination_enforcement?}` and the flag parser does **not** reject unknown flags, so `--daily`/`--monthly` are **silently dropped** and the CI-6 server defaults (30 monthly / **1 daily**) apply. At `daily_limit = 1` the harness's *second* Write of the day 401s as *"Please sign in"* — an auth-bug-shaped failure that isn't one (standing memory: `api-key-1-per-day-limit-masks-as-401`).

**Install:** tokens read via `read -rs` (never echoed to screen or shell history), passed to the writer by env var (never in the command line), backup written to `~`, **never inside the repo**. Verified without printing secrets: both installed, distinct, **7** env keys, all four hooks, valid JSON, capture flag still **UNSET**, and **no full-length token anywhere in the tracked tree**.

**State after the re-mint:** the harness is **live again** (frames + guard). **The observation clock remains STOPPED** — re-minting restores the practice, not the measurement; any part-(3) re-measurement needs a NEW window (register **P6**).

**Residual, benign:** `.claude/settings.local.json.bak` remains **on disk** (now untracked + covered by the `.gitignore` glob) holding the **revoked** tokens — inert, and recommended for deletion as the artifact that caused this.

## 5. Remediation — OUTSTANDING (founder)

1. **`git rm --cached .claude/settings.local.json.bak`** — the `.gitignore` glob does **not** untrack an already-tracked file. Must ride the next commit. *(Done at the 2026-07-17 records commit if the close's block was followed.)*
2. **DB-level abuse check** (Supabase; the AI performs no Supabase op). **CORRECTED 2026-07-17 — the first version of this SQL was wrong on both tables** (written from memory, not from the schema; the same fault this incident is about): `api_key_usage` is a **monthly aggregate** (`year`/`month`/`total_calls`/`daily_calls`) with **no per-call `created_at`**, and `loop_billing_events` keys on **`api_key_id` (UUID)**, not `credential_ref` (that column belongs to `agent_assessment_history`). The correct queries are in the close's §9 walkthrough and the S11a-adjacent runbook; the discriminating signal is **temporal** — `loop_billing_events.created_at` clustered outside the founder's working sessions — not raw totals, because our own dogfood use is heavy and swamps the counters. Bots scrape GitHub for key patterns continuously and `sr_prac_` is distinctive — **assume harvested, verify not used.**
3. **Decide whether to re-mint.** The harness is currently **dead** (honest 401s on every action). The observation clock is stopped and the window is closed, so nothing is being lost by leaving it off. If re-minted: **the new tokens must never reach `settings.local.json.bak`** — the glob now prevents it, but the `.bak` is written by `/practice-off`, so **that skill needs checking** (see follow-up F3).
4. **History is NOT scrubbed and will not be.** `849f830` retains both tokens on a public repo permanently; rewriting pushed `main` is invasive and does not reach forks, clones, or caches. **Revocation is the remedy.** Recorded as accepted.

## 6. Named follow-ups

- **F1 — enable GitHub secret scanning + push protection** (free on public repos). Register `sr_(live|prac|inst|assent)_` as a **custom pattern**. This incident's whole root is that nothing was watching.
- **F2 — a repo-side pre-commit / CI secret tripwire** that fails on a full-length `sr_*` token. Note the lesson from this session's own sweep: **match the FULL token length**, not a 6-char prefix, or it cries wolf on every redacted record ref (26/27 false positives) and gets ignored — the same "guard that trains you to ignore it" failure as **RA-1-F3**.
- ~~**F3 — audit `/practice-off`**: it is very likely what wrote the `.bak`.~~ **HYPOTHESIS REFUTED — checked, and the opposite is true.** `/practice-off` does **not** write `settings.local.json.bak`; its backup is `.claude/gate1-hooks-block.json`, and the skill **explicitly documents**: *"The backup file `.claude/gate1-hooks-block.json` carries **NO secret** (the credential is in the settings `env` block, not the hooks block)"* — verified: that file has no `env` block. **The skill authors reasoned about exactly this exposure and got it right.** Credit where due; no fix needed there.
- **F3 (corrected) — the real mechanism: `git add -A` over an unignored ad-hoc backup.** `849f830` **ADDED** the `.bak` (412 lines) alongside genuine S9b walk fixes. No skill or script creates it — it was made ad-hoc during the S9b walk. That close's Founder Verification block used **`git add -A`**, and with no ignore rule matching the name, the file was swept in with the legitimate changes. **Follow-up: stop using `git add -A` in close verification blocks** — enumerate paths explicitly (as this session's close does). A blanket add over a repo with no secret tripwire and a one-character-wide ignore rule is how this happened.
- **F3b — the file was VISIBLE the whole time, and everyone read past it.** `.claude/settings.local.json.bak` has appeared in **every session's `git status`** since 2026-07-12, and has been listed by name in multiple session closes under *"Files remaining uncommitted."* **It was in this session's own opening git status** (`M .claude/settings.local.json.bak`) and the AI classified it as pre-existing noise without asking what a `.bak` of a credential-bearing settings file was doing in a tracked tree. **The exposure did not hide. It was reported, repeatedly, and nobody read it.** That is the same failure mode as RA-1-F3's "a guard that trains you to ignore it" — except here the guard was a human/AI reading a status line.
- **F4 — RA-1-F3 sibling, now confirmed as a class:** the project's guards are substring/name-based and wrong in both directions (byte-identity guard: false-positive on filenames, false-negative on `r20a-classifier.ts`; the ignore rule: exact-name only). **Guards need to match the real thing, not a name that resembles it.**
- **F5 — the `gate1-dogfood@v1` standing marker credential** (`322b0eb7…`) is a *different* identity and was **not** in the `.bak` — but its raw token is recorded as unrecoverable, and it remains active. Not exposed by this incident; noted for completeness.

## 7. What went right

- **Revocation is genuinely the kill switch** it is documented to be — two commands, immediate, verified by 401 within a minute.
- **The blast radius was real but bounded by design:** capability-scoped UPCs (`consult` + `accreditation_write`, 200/5000), agent-bound, with no mint/deploy/DB reach. The CI-14 capability model did its job.
- **The harness failed open, honestly**, the moment the credentials died — the designed posture, observed live.
- **The leg-d redaction precedent held.** A prior session redacted a token *before* it entered history; that discipline worked and is why this incident is two credentials rather than three.

---

*The exposure was found by reading a `git status` line properly instead of assuming it was clean — the same discipline that, earlier the same session, caught four errors in a finding of record. Nothing automated caught it, and nothing would have. That is F1.*
