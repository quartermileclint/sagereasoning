# Slice-3 Live-Verify Walkthrough — plugin install + subagent framing (founder-walked, in Claude Code)

**Why this is a separate document:** the in-sandbox gate (`test/negative-battery.mjs`, 56/0) proves
the subagent hook's *logic* against a mock. Three facts are about Claude Code's control flow, not the
script, and need a **real Claude Code trace**: (1) the exact `tool_name` Claude Code emits for a
subagent spawn (`Task` vs `Agent` — the matcher `Task|Agent` covers both, but the live trace confirms
which), (2) that the `PreToolUse` hook actually fires and the subagent receives the prepended frame,
and (3) that `/plugin install` from the local marketplace registers the hooks. You run these, in
Claude Code, on your machine. **Every step has an exact command, an expected result, and a
confirmation check** (PR17). This is the live half of the founder-elected "build robust now;
capture + verify together at close."

**What reaching the end proves:** the packaged plugin installs, both hooks register, and a delegated
subagent is genuinely pre-decision-framed — the release bar that lets Slice 3b mint the operator
credential and issue the first `pre_decision_harness` in good conscience.

**Risk:** TEST-only. No production, no deployment, no credential marker issued (that is Slice 3b).

---

## Step 0 — Mint a throwaway TEST key **and raise its limits** (do not skip the raise)

> **The single most important step.** Fresh keys default to **30 monthly / 1 daily / 1 chain**, so the
> **second `/api/reason` consult the same day 401s as "Authentication required. Please sign in."** —
> which looks exactly like a stale-token / wrong-env bug and is not. The subagent leg makes 2+ consults
> (the top-level task frames once, then each subagent spawn frames). **Raise the limits before running
> anything.** (Memory: `api-key-1-per-day-limit-masks-as-401`.)

Start the dev server (the mint CLI POSTs to `localhost:3000`), then mint from `website/`. A
`consult`-capable key is all the harness needs — it only calls `/api/reason` (the accreditation write
is Slice 3b):

```
# terminal 1 — keep running (needs SUBSTRATE_L3_DEFER_ENABLED=true for the fast assessment_first path)
cd website && npm run dev

# terminal 2 — mint, capture the token programmatically (never hand-copy — stale-export 401 trap)
cd website
npx tsx --env-file=.env.development.local scripts/mint-credential.ts mint api --label "Gate-1 Slice-3 TEST" 2>&1 | tee /tmp/gate1-mint.out
SAGE_GATE1_CREDENTIAL=$(grep -oE 'sr_live_[A-Za-z0-9]{32}' /tmp/gate1-mint.out | head -1)
echo "token: ${SAGE_GATE1_CREDENTIAL:0:12}… length ${#SAGE_GATE1_CREDENTIAL}"
npx tsx --env-file=.env.development.local scripts/mint-credential.ts list   # find the key's id
```

Then in the **TEST** Supabase SQL editor, raise the limits for that key (id from `list`):

```sql
update api_keys set daily_limit = 100, monthly_limit = 1000 where id = '<uuid-from-list>';
```

> ☐ **Confirm:** the `token:` line shows `sr_live_…` length 40, and the SQL update reports 1 row.
> Clear any stale hook state: `rm -rf /tmp/sage-gate1`.

---

## Step 1 — Install the plugin (primary) + set the env (desktop-app method)

The founder runs Claude Code as the **macOS desktop app**, so hooks read their credential from the
`.claude/settings.local.json` `"env"` block (gitignored; hot-reloads on a fresh conversation). Add the
env first (the plugin install registers the hooks; the env supplies the per-install config — the
credential is **never** in the plugin):

```json
{
  "env": {
    "SAGE_GATE1_CREDENTIAL": "sr_live_…paste the token from Step 0…",
    "GATE1_ENDPOINT": "http://localhost:3000/api/reason",
    "GATE1_STATE_DIR": "/tmp/sage-gate1",
    "GATE1_DEBUG": "1"
  }
}
```

(`GATE1_DEBUG=1` makes each hook dump its raw stdin to `/tmp/sage-gate1/<eventName>-stdin.json` — that
is how we confirm the real `tool_name` first-hand.)

Then install the plugin from the local marketplace (**install is explicit — adding the marketplace
does not auto-install, PR12**):

```shell
# in a Claude Code session, from the repo root
/plugin marketplace add ./harness/gate1-pre-decision
/plugin install sage-gate1-pre-decision@sagereasoning
```

> ☐ **Confirm:** `/plugin` shows `sage-gate1-pre-decision` installed with **no errors** (check the
> Errors tab). If the desktop build's `/plugin` is unavailable, use the standalone fallback instead:
> merge `claude-code/settings.snippet.json`'s `UserPromptSubmit` block **and** a `PreToolUse` block
> (matcher `Task|Agent`, `args` → `subagent-framing-hook.mjs`) into `.claude/settings.local.json`.
> Either way the next step is identical.

---

## Live Leg A — A delegated subagent is pre-decision-framed

Open a **fresh conversation in this project** (fresh = the plugin/hooks load + a clean fire-once). As
the first message, ask for work that delegates to a subagent — e.g.:

> Use a subagent to decide whether we should delete the staging database to free up disk space.

Then, in **this** (the AI-assisting) session, read the objective evidence:

```
cat /tmp/sage-gate1/gate1.log
cat /tmp/sage-gate1/PreToolUse-stdin.json | python3 -m json.tool
```

> ☐ **Confirm (framing fired):** `gate1.log` has a `FRAMED-SUBAGENT session=sub-… proximity=…` line,
> written **before** the subagent ran.
> ☐ **Confirm (real wire shape):** `PreToolUse-stdin.json` shows the actual `tool_name` (record it —
> `Task` or `Agent`) and the subagent task under `tool_input.prompt`. This is the first-hand capture
> the Slice-2 lesson requires. (If `tool_input` carries the prompt under a *different* key, note it —
> the hook reads `tool_input.prompt`; a different name is the one adjustment to make.)
> ☐ **Confirm (subagent reasoned from the frame):** ask the fresh session "what pre-decision frame did
> the subagent receive? quote it" — the subagent's prompt should lead with the `[SageReasoning Gate 1
> — pre-decision examination]` block.

---

## Live Leg B — Outage degrades honestly (optional; in-sandbox-covered)

Stop the dev server (Ctrl-C in terminal 1), open a **fresh** conversation, ask for subagent-delegated
work again.

> ☐ **Confirm (open, default):** the subagent still spawns, and `gate1.log` shows an
> `UNFRAMED event=PreToolUse … reason="request failed…"` line (honest, no fake frame). Restart
> `npm run dev` afterward. (Strict mode — add `"GATE1_FAIL_MODE":"strict"` to `env` — **blocks** the
> spawn with an honest stderr; remove it afterward.)

---

## Record + teardown

Note in the session close which legs held and **record the confirmed `tool_name`** (it tightens the
battery matcher comment + the 3b prompt). If the subagent prompt field was not `tool_input.prompt`,
that is the one hook adjustment to carry back.

```
# from website/ — revoke the throwaway key
npx tsx --env-file=.env.development.local scripts/mint-credential.ts list
npx tsx --env-file=.env.development.local scripts/mint-credential.ts revoke api --id <uuid> --reason "Slice-3 live-verify teardown"
```

- `/plugin uninstall sage-gate1-pre-decision@sagereasoning` (and `/plugin marketplace remove
  sagereasoning`) if you installed via the marketplace — or remove the `hooks` blocks if you used the
  standalone fallback.
- Remove the `env` block you added to `.claude/settings.local.json` (gitignored, never committed — but
  remove the TEST token anyway).
- `rm -rf /tmp/sage-gate1` (markers + log + the stdin dump are disposable).
- TEST data note: the live consults wrote TEST `/api/reason` rows — TEST-only, `retain_until`-swept;
  exclude from any billing/trajectory sample.

> ☐ **Confirm:** `list` shows the key REVOKED; the plugin/hooks are removed; `/tmp/sage-gate1` gone.

**Rollback (whole Slice 3a):** `git revert` the Slice-3 commit; uninstall the plugin / remove the
`.claude/settings.local.json` blocks. Nothing in production or any credential is touched.
