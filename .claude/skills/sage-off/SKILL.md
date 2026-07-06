# sage-off — Disable the SageReasoning Gate-1 hooks (turn the practice OFF)

**Trigger:** The founder says "sage off", "/sage-off", "turn off the sage hooks", "turn off the harness", "disable the gate-1 hooks", or any variant asking to stop the SageReasoning Gate-1 hooks from firing.

---

## What this skill does

Removes the entire `hooks` block from `.claude/settings.local.json`, so **no** SageReasoning Gate-1 hook fires (H1 top-level framing, H2 subagent framing, H3 at-action guard/consult, H4 close reflect turn) — for conversations rooted at this project. The credential + every other setting (`permissions`, `env`) are left untouched. Hooks hot-reload in this desktop build, so it takes effect without a restart. Reverse with **/sage-on**.

Why you'd run it: H3 fires a metered consult on **every** Bash/Edit/Write (cost + latency on the dogfood credential) and can block irreversible commands; H4 forces a reflect turn at every close. Turn it off when you're back to heavy real work.

## Procedure (the agent follows this)

1. **Read** `.claude/settings.local.json`. If there is **no** top-level `"hooks"` key (already off) → report "Sage is already off; backup left unchanged" and STOP. Do NOT overwrite the backup with an empty block.
2. **Refresh the backup** so /sage-on restores exactly what was on: write the current hooks block to `.claude/gate1-hooks-block.json` as `{ "hooks": { …the current hooks object verbatim… } }` (preserve the `_comment` field if present). This captures whatever hooks were installed (H1–H4, or any subset).
3. **Surgically remove** the `"hooks": { … },` block from `.claude/settings.local.json` with an Edit — delete the `"hooks": {` line through its matching closing `},` (the block sits between `"permissions": { … },` and `"env": {`). Leave `permissions` and `env` byte-for-byte unchanged. Use the Edit tool (string match), NOT a full JSON re-serialize (that would reformat the whole file).
4. **Validate:** run `node -e "const c=JSON.parse(require('fs').readFileSync('.claude/settings.local.json','utf8')); console.log('OFF — hooks present:', !!c.hooks, '| permissions+env intact:', !!c.permissions, !!c.env)"` — expect `hooks present: false` and both others `true`.
5. **Report** which hooks were disabled (from the backup) + that it hot-reloads (no restart) + that `/sage-on` restores them.

## Notes
- This removes **all** Gate-1 hooks. If the founder only wants to drop the heavy H3/H4 and keep H1/H2 framing, that's a different request — remove just the `Bash|Edit|Write|MultiEdit|NotebookEdit` PreToolUse matcher object + the `Stop` block instead, and tell them you did the partial version.
- The credential (`SAGE_GATE1_CREDENTIAL`) and all env stay in place — only the firing stops.
- The backup file `.claude/gate1-hooks-block.json` carries NO secret (the credential is in the settings `env` block, not the hooks block).
