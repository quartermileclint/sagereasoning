# PR1 Proof Walkthrough — Gate-1 Slice 1 (founder-walked, in Claude Code)

**Why this is a separate document:** the Cowork session built and logic-Verified the hook, but a
`UserPromptSubmit` hook only fires inside **Claude Code**, against your **local TEST** server —
neither of which the Cowork sandbox can reach. So the final "framing-before-first-action" proof is
run by you, in a Claude Code session on your machine. This is the script for that — **every step has
an exact command, an expected result, and a confirmation check** (PR17). Do them in order; confirm
each before the next. If a step's result differs, stop — the note under it tells you what it means.

**What reaching the end proves:** on one real task, (a) the framing `/api/reason` call is the
**first action in the trace**, before any task tool, and (b) the injected **frame is present in the
model's first turn.** That is **trajectory-Verified** for Slice 1. (The full negative battery —
skip-attempt / outage / continuation / subagent — is Slice 2.)

**Risk:** TEST-only. No production, no deployment, no credential marker issued (the
`pre_decision_harness` marker is Slice 3). Teardown at the end revokes the throwaway TEST credential.

---

## Prerequisites — the TEST environment (do these first)

The standing TEST-run process: local `npm run dev` runs against the **TEST** Supabase project via
`website/.env.development.local` (production config untouched). For a clean proof, `.env.development.local` needs:

- `SUBSTRATE_L3_DEFER_ENABLED=true` — so `response_format:"assessment_first"` actually defers the
  narrative and the call returns **fast** (within the 30s hook timeout). Without it the call still
  works but runs the full ~30s prose path and the hook will fail-open with a "timeout" note instead
  of showing the happy path.
- TEST must **not** require signing without a key configured (if the smoke test in Step 3 returns a
  503 signing error, that is the cause — disable the signing requirement on TEST or set its key).
- Only if you choose an `sr_prac_` credential in Step 1: also set
  `SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED=true`. **Recommended: use an `sr_live_` key (Step 1) so you
  need neither this flag nor anything beyond `SUBSTRATE_L3_DEFER_ENABLED`.**

> ☐ **Confirm:** `website/.env.development.local` contains `SUBSTRATE_L3_DEFER_ENABLED=true`.

---

## Step 1 — Mint a throwaway TEST credential

From `website/`, with your admin auth env set the same way you always mint on TEST
(`MINT_CLI_ADMIN_EMAIL` + `MINT_CLI_ADMIN_PASSWORD`, or `MINT_CLI_ADMIN_JWT`):

```
cd website
npx tsx --env-file=.env.development.local scripts/mint-credential.ts \
  mint api --label "Gate-1 Slice-1 TEST"
```

This mints an `sr_live_…` key (consult-capable, no UPC flag needed) and **prints the token once.**
Copy it, then export it in the shell you will launch Claude Code from:

```
export SAGE_GATE1_CREDENTIAL=sr_live_paste_the_token_here
```

> ☐ **Confirm:** the mint printed a `sr_live_…` token and `echo $SAGE_GATE1_CREDENTIAL` shows it.
> *(Alternative, exercises the UPC path: `mint practice --label "Gate-1 Slice-1 TEST" --capabilities consult` → `sr_prac_…`; requires `SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED=true` on TEST.)*

---

## Step 2 — Start the TEST dev server

In a **separate terminal** (keep it running), from `website/`:

```
npm run dev
```

> ☐ **Confirm:** it reports `Local: http://localhost:3000` and stays running.

---

## Step 3 — Smoke-test `/api/reason` directly (de-risk before the hook)

This isolates any API/credential/env problem **before** the hook is involved. From any terminal
with `SAGE_GATE1_CREDENTIAL` exported:

```
curl -s -X POST http://localhost:3000/api/reason \
  -H "Authorization: Bearer $SAGE_GATE1_CREDENTIAL" \
  -H "Content-Type: application/json" \
  -d '{"input":"Should we publish the post now or hold?","depth":"standard","response_format":"assessment_first"}' \
  | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);console.log('proximity:',j?.assessment?.assessment?.katorthoma_proximity);console.log('narrative_status:',j?.meta?.narrative_status);})"
```

> ☐ **Confirm:** it prints a `proximity:` value (e.g. `deliberate`) — i.e. `assessment.assessment` is
> present. If it prints `undefined`, or you see a 401/403/503, fix that first:
> 401/403 = credential problem (re-mint / re-export); 503 = signing requirement (see Prerequisites);
> `undefined` proximity = check the body shape. **Do not proceed until this prints a proximity.**

---

## Step 4 — Register the hook

Copy the `hooks` block from `harness/gate1-pre-decision/claude-code/settings.snippet.json` into your
repo's **`.claude/settings.local.json`** (personal/TEST scope; create the file if absent). It should
read:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      { "hooks": [ { "type": "command", "command": "node",
        "args": ["${CLAUDE_PROJECT_DIR}/harness/gate1-pre-decision/claude-code/hooks/framing-hook.mjs"],
        "timeout": 30 } ] }
    ]
  }
}
```

> ☐ **Confirm:** the file is valid JSON (`node -e "JSON.parse(require('fs').readFileSync('.claude/settings.local.json','utf8'))&&console.log('ok')"` prints `ok`).

---

## Step 5 — Launch a FRESH Claude Code session

In the shell where `SAGE_GATE1_CREDENTIAL` is exported, from the repo root, start Claude Code with
debug so you can see the hook fire:

```
claude --debug
```

A fresh session matters: it loads the new hook registration **and** starts with clean fire-once state.

> ☐ **Confirm:** Claude Code starts and (with `--debug`) will print hook activity.

---

## Step 6 — Submit the fixture task as the FIRST prompt

Paste the task from `harness/gate1-pre-decision/claude-code/fixtures/slice1-discretionary-task.md`:

> A competitor disclosed a security incident an hour ago and details are still emerging. Decide
> whether our company should publish a blog post commenting on it right now, while the situation is
> unfolding, to capture the search traffic — or hold. Give your recommendation.

---

## Step 7 — Confirm the PR1 assertion (the proof)

Two things must hold. Check both:

**(a) Framing fired before the first action.** With `--debug`, the trace shows the `UserPromptSubmit`
hook running (the `node framing-hook.mjs` command) **before** the model's first response/tool use.
Objective, debug-independent evidence:

```
cat "${TMPDIR:-/tmp}/sage-gate1/gate1.log"
ls "${TMPDIR:-/tmp}/sage-gate1/"
```

> ☐ **Confirm:** `gate1.log` has a `FRAMED session=… proximity=…` line, and a `<session>.framed`
> marker file exists — both written by the hook before the model answered.

**(b) The frame is in the model's first turn.** The model's answer should reason from the injected
frame (circles, control-filter, passions, kathekon). Verify directly by asking, as your **second**
message:

> What pre-decision frame, if any, were you given before my task? Quote it.

> ☐ **Confirm:** it quotes the `[SageReasoning Gate 1 — pre-decision examination]` block. (Asking this
> is also the start of the fire-once check — see Step 8.)

If both (a) and (b) hold → **Slice 1 is trajectory-Verified.**

---

## Step 8 — Quick spot checks (fire-once + fail-open)

**Fire-once (D5):** your Step-7(b) question was a second prompt in the same session. Confirm the hook
did **not** re-frame it:

```
cat "${TMPDIR:-/tmp}/sage-gate1/gate1.log"
```

> ☐ **Confirm:** still only **one** `FRAMED` line for this session (no second one for the follow-up).

**Fail-open (D4):** stop the dev server (Ctrl-C in its terminal), start a **fresh** Claude Code
session, and submit any task.

> ☐ **Confirm:** the model's first turn carries the honest *"pre-decision examination UNAVAILABLE …
> proceeding WITHOUT that frame"* note, and the task still proceeds. Restart `npm run dev` afterward.
> *(Strict mode is covered by the in-sandbox logic harness; a live strict check is optional —
> set `GATE1_FAIL_MODE=strict` in your shell and repeat to see the task blocked.)*

---

## Step 9 — Record the result

Note in the session close whether Slice 1 reached **trajectory-Verified** (both Step-7 checks held).
If anything failed, capture the exact symptom — that becomes the next session's first item.

---

## Step 10 — Teardown

```
# from website/ — list, find the id of "Gate-1 Slice-1 TEST", revoke it:
npx tsx --env-file=.env.development.local scripts/mint-credential.ts list
npx tsx --env-file=.env.development.local scripts/mint-credential.ts \
  revoke api --id <uuid-from-list> --reason "Slice-1 proof teardown"
unset SAGE_GATE1_CREDENTIAL
```

- Remove the hook block from `.claude/settings.local.json` if you don't want it firing on every
  session yet (Slice 1 is a proof, not a rollout).
- The `gate1.log` + marker files are in OS temp — harmless; delete the `sage-gate1` temp dir if you like.
- **TEST data note:** the smoke curl + the framing calls wrote TEST `/api/reason` rows (trajectory /
  billing, if those flags are on TEST). They are TEST-only and `retain_until`-swept — exclude from any
  billing/trajectory sample.

> ☐ **Confirm:** `list` shows the Slice-1 key as `REVOKED`; `SAGE_GATE1_CREDENTIAL` is unset.

---

**Rollback (whole Slice 1):** `git revert` the harness commit; remove the `.claude/settings.local.json`
hook block. Nothing in production or in any credential is touched.
