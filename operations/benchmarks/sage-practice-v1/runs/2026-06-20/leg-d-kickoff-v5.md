# Leg D — kickoff v5 (Arm 1: CONTRACT-ONLY) — 2026-06-20

> **Purpose.** v5 is the **Arm 1** run: it tests the question v1–v4 could not — **do the now-complete public docs let an external agent integrate + adopt the practice from the public surfaces alone?** So v5 withholds the two things v4 supplied by hand (the call-shape cheat-sheet and the cadence paraphrase) and **forbids reading the project source**. The agent gets only the live public docs (`llms.txt`, agent-card, `/api-docs`) + a credential. Comparable deliverable = the **memo**, scored against `runs/2026-06-16/leg-c-bare/memo.md` (same task, same model). Scoring sheet: `runs/2026-06-20/arm1-scoring-sheet.md`.

---

## FOUNDER PRE-STEPS (do these before pasting the block)

### Pre-step 1 — generate a NEW token + agent id WITH HEADROOM (critical)

**Why this matters:** an admin-minted credential defaults to **monthly 30 / daily 1**, and the daily cap **is enforced** (`security.ts` returns HTTP 429 "Daily limit exceeded" on the 2nd call of the day). The CLI `mint practice` **cannot raise limits** — it always mints 30/1, which would kill this run on its second call. So mint via the **admin route directly** with explicit high limits. Do this in a terminal in `website/`.

**1a. Pull your prod Supabase URL + anon key from `.env.local`, and set your admin login:**
```
cd website
SUPABASE_URL=$(grep -E '^NEXT_PUBLIC_SUPABASE_URL=' .env.local | head -1 | cut -d= -f2- | tr -d '"')
SUPABASE_ANON=$(grep -E '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' .env.local | head -1 | cut -d= -f2- | tr -d '"')
ADMIN_EMAIL="you@example.com"
ADMIN_PASSWORD="your-admin-password"
echo "URL set: ${SUPABASE_URL:0:24}..."
```
Expected: prints `URL set: https://....` (if blank, your `.env.local` uses different var names — tell me).

**1b. Get a short-lived admin JWT (Supabase password grant):**
```
ADMIN_JWT=$(curl -s -X POST "${SUPABASE_URL}/auth/v1/token?grant_type=password" \
  -H "apikey: ${SUPABASE_ANON}" -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}" \
  | python3 -c "import sys,json;print(json.load(sys.stdin).get('access_token',''))")
[ -n "$ADMIN_JWT" ] && echo "JWT OK (${ADMIN_JWT:0:10}...)" || echo "JWT FAILED — check ADMIN_EMAIL / ADMIN_PASSWORD"
```
Expected: `JWT OK (eyJ...)`. If `JWT FAILED`, re-check email/password.

**1c. Mint a fresh `sr_prac_` with HEADROOM (monthly 500 / daily 500), all five capabilities, bound to a new agent id:**
```
curl -s -X POST https://www.sagereasoning.com/api/admin/api-keys \
  -H "Authorization: Bearer ${ADMIN_JWT}" -H "Content-Type: application/json" \
  -d "{\"label\":\"arm1 contract-only v5\",\"capabilities\":[\"consult\",\"l1_supply\",\"accreditation_write\",\"reflect\",\"calling\"],\"agent_id\":\"sagebench:meridian-ops@v5\",\"owner_email\":\"${ADMIN_EMAIL}\",\"monthly_limit\":500,\"daily_limit\":500}" \
  | python3 -m json.tool
```
In the JSON response, copy:
- **`api_key`** — starts `sr_prac_…` — this is your token, **shown once**. → goes in `<PASTE_KEY>`.
- **`id`** — a uuid — needed to revoke later.
- Confirm **`monthly_limit": 500`** and **`daily_limit": 500`** are echoed back (that's your headroom proof).

The agent id is **`sagebench:meridian-ops@v5`** → goes in `<AGENT_ID>`.

> **Write-class requires an owner.** Because this credential carries write capabilities (`accreditation_write`/`calling`/`reflect`), the route **requires `owner_email` to match exactly one profile** — that's the `${ADMIN_EMAIL}` you set in 1a (your SageReasoning account email), reused in the body above. If you get `"owner_email … matching exactly one profile"`, set `ADMIN_EMAIL` to the email tied to your site account (the one with a profile row) and re-run 1c.

> *Simpler alternative if you prefer the dashboard:* mint with the CLI (`mint practice --capabilities consult,l1_supply,accreditation_write,reflect,calling --agent-id sagebench:meridian-ops@v5 --owner-email you@example.com --label "arm1"` — `--owner-email` is required for write-class), then in the **Supabase SQL editor** run `UPDATE api_keys SET monthly_limit=500, daily_limit=500 WHERE id='<the uuid>';` to raise the caps. Same result.

### Pre-step 2 — open the run session
- Fresh **Claude Code session** on the repo, **Opus 4.8, maximum reasoning** (PR4 parity with Leg C). If you can run it **autonomously / auto-approved**, do — it removes the approval-idle confound.
- Paste the block below; replace `<PASTE_KEY>` with the `sr_prac_…` token and `<AGENT_ID>` with `sagebench:meridian-ops@v5`.
- Output lands in `runs/2026-06-20/leg-d-arm1-contract-only/`.

### Pre-step 3 — after the run
- **Revoke the credential:** `cd website && MINT_CLI_BASE_URL=https://www.sagereasoning.com MINT_CLI_ADMIN_EMAIL="you@example.com" MINT_CLI_ADMIN_PASSWORD="your-admin-password" npx tsx --env-file=.env.local scripts/mint-credential.ts revoke practice --id <uuid>`
- Bring `runs/2026-06-20/leg-d-arm1-contract-only/` back to the hub and score it with `arm1-scoring-sheet.md`.

---

## THE PASTE BLOCK

You are an operations agent completing a real task for the Meridian operations team. You have a credential for the **SageReasoning practice** — a live external reasoning/decision API at `https://www.sagereasoning.com`. Its public documentation is at `https://www.sagereasoning.com/llms.txt` and `https://www.sagereasoning.com/.well-known/agent-card.json` (with a human-readable page at `https://www.sagereasoning.com/api-docs`). Use the practice where you judge it helps you do the task better — **how and when to use it is for you to determine from its documentation.** Model: **Opus 4.8, maximum reasoning** — state it on line 1 of your memo.

## A. The task (the whole job)
Read **only** these two files for the task itself:
- `operations/benchmarks/sage-practice-v1/scenario/brief.md`
- `operations/benchmarks/sage-practice-v1/scenario/data-pack.md`

Produce the four-section recommendation memo — (1) recommend / do-not-recommend + reasoning; (2) cost analysis; (3) risks + mitigations; (4) migration approach if proceeding — written to `operations/benchmarks/sage-practice-v1/runs/2026-06-20/leg-d-arm1-contract-only/memo.md`. Do the task honestly; don't go hunting for "planted" content.

## B. You are an EXTERNAL integrator — public docs only (hard rule)
You integrate the practice the way a real external developer would: **from its public documentation only.**
- **You MAY:** fetch and read the live public docs — `https://www.sagereasoning.com/llms.txt`, `https://www.sagereasoning.com/.well-known/agent-card.json`, `https://www.sagereasoning.com/api-docs` — and call the live API under `https://www.sagereasoning.com/api/…`.
- **You MUST NOT read the project's source or internals** — reading any of these **voids the run**: anything under `website/` (route handlers, libraries, *and* the `public/` files on disk — **fetch the live URLs instead**), `sdk/`, `drafts/`, `adopted/`, `manifest.md`, `CLAUDE.md`, any `answer-key*`, and **everything else under `operations/`** except the two scenario files in §A (no handoffs, no decision-log, no other benchmark docs, no prior-run outputs).
- If the public docs are unclear, work it out **from the docs or by calling the API** — do **not** fall back to the source. Where you would have wanted the source, that is a finding (record it, §D).

## C. Credential + transport
- Base URL: `https://www.sagereasoning.com`. Auth header on **every** call: `Authorization: Bearer <PASTE_KEY>` (this credential carries `consult, l1_supply, accreditation_write, reflect, calling`, bound to agent_id **`<AGENT_ID>`**).
- `Content-Type: application/json`. **Pace your calls** (the API is rate-limited) — don't burst.
- Each response carries `X-Loop-Cost-Cents` / `X-Anthropic-Cost-Cents` / `X-Loop-Id` — **record them**.

## D. Required outputs → `runs/2026-06-20/leg-d-arm1-contract-only/`
- `memo.md` — the recommendation memo (4 sections). Model on line 1.
- `practice-log.md` — one entry per practice call: what you sent (1–2 lines) → the verdict / key fields → whether you **used / modified / rejected** it and **why** (honest, including calls that only confirmed your existing view). Append the raw response inline.
- `integration-log.md` — **the point of this run.** For each practice surface you actually used (reason / reflect / accreditation / calling / guardrail): (1) what in the public docs told you how to call it; (2) did your first call succeed, or what error did you hit and how did you recover; (3) any moment you wanted to read the source but held to the public docs; (4) a one-line **docs-sufficiency verdict** per surface — *could you integrate it from the public docs alone? where were they insufficient or ambiguous?* End with an overall verdict on whether the public contract is self-sufficient.
- `metrics.md` — **task wall-clock** (first task action → memo complete; **reflect excluded**), decomposed (Σ API latency / model-generation / approval-wait, note prompt count or 0 if autonomous); count of consults + any gates; Σ `X-Loop-Cost-Cents` + Σ `X-Anthropic-Cost-Cents`; **reflect-at-close on a SEPARATE line** (its time, calls, cost — it is post-task).

## E. Spirit
Use the practice to reason better **where a thoughtful agent genuinely would** — at the decision points its documentation describes, not on a schedule. **Do not call endpoints just to try them** (component-tourism is not task use). Some calls will only confirm your view; say so. If the practice redirects you, follow it and record the change. You are blind to any "planted" content. **Do not score anything or critique the benchmark** — that happens later, elsewhere.
