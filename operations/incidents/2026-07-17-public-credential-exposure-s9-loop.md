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

## 5. Remediation — OUTSTANDING (founder)

1. **`git rm --cached .claude/settings.local.json.bak`** — the `.gitignore` glob does **not** untrack an already-tracked file. Must ride the next commit.
2. **DB-level abuse check** (Supabase; the AI performs no Supabase op) — for the two credential refs, **since 2026-07-12 09:13 +1000**:
   ```sql
   -- usage on the exposed credentials during the window
   select * from api_key_usage       where api_key_id in ('09e83b4d-...','e715520b-...') and created_at >= '2026-07-12';
   select * from loop_billing_events where credential_ref like 'api_key:09e83b4d%' or credential_ref like 'api_key:e715520b%';
   -- any accreditation writes we don't recognise
   select * from agent_accreditation where agent_id = 'sagereasoning:s9-loop@v1';
   ```
   Bots scrape GitHub for key patterns continuously and `sr_prac_` is distinctive — **assume harvested, verify not used.**
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
