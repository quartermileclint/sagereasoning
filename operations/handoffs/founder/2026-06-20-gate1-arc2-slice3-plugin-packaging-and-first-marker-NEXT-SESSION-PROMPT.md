# Next-Session Prompt — Gate-1 Arc 2 Slice 3: Plugin packaging + the FIRST `pre_decision_harness`

**For the founder. Paste as the first message of a fresh session.**

**Stream:** founder.
**Tier:** `code-critical` (AC7) — **the genuinely Critical slice.** New distribution artifact (a Claude
Code plugin), an **operator credential mint that sets the `pre_decision_harness` provenance marker**,
and **the first non-null `examination_mode` reaching the Live public accreditation read.** Full
**Critical Change Protocol (0c-ii)** applies — do not abbreviate it.
**Governing frame:** /adopted/standing-protocol-cache.md → §"Critical-risk sessions" (full templates).
**Predecessor close:** operations/handoffs/founder/2026-06-20-gate1-arc2-slice2-negative-battery-close.md.
**Predecessor decision-log entry:** `D-SAGE-PRACTICE-GATE1-ARC2-SLICE2-NEGATIVE-BATTERY-BUILT-VERIFIED`.
**Governing design:** adopted/adr/2026-06-20-pre-decision-harness-arc2.md (ADR-011 §Slice 3 + **D7**).
**Risk classification:** **Critical** under 0d-ii (credential mint / provenance marker / public trust
credential change). Critical Change Protocol **engaged**.

## Why this session matters

Arc 1 made the `examination_mode` accreditation field Live and honest, but `pre_decision_harness` is
issued to **no one** — every credential reads `post_decision_check` or `null`, because no harness
earns it. Slices 1–2 built and gated the harness (the `UserPromptSubmit` + `SubagentStart` framing
hooks; release battery 53/0). **Slice 3 is where the marker is finally earned and issued:** package
the harness as a Claude Code plugin, mint the **operator credential carrying
`examination_enforcement: pre_decision_harness`** (the Arc-1 unforgeability root — set only at admin
mint), and make a harness-backed accreditation write so the public payload reads `pre_decision_harness`
for the first time. This is what makes Option-2's shared "Gate 1" name honest two hops downstream
(`D-SAGE-PRACTICE-GATE1-SURFACE-HONESTY-OPTION2-DIFFERENTIATION`) and unblocks Arc 3 (Slice 4).

## Pre-conditions — read first

1. **Slice 2 is in-sandbox-Verified (53/0) and the live legs are walked.** If the live legs
   (`harness/gate1-pre-decision/claude-code/SLICE2-LIVE-LEGS-WALKTHROUGH.md`) are NOT yet done, do them
   first — Slice 3 ships a *distributable* artifact, so the hooks must be trajectory-proven live.
2. **Arc 1 is Live:** `SUBSTRATE_EXAMINATION_MODE_ENABLED=true` in prod; the public GET
   `/api/accreditation/{agent_id}` already folds `examination_mode` (`post_decision_check` on new
   discretionary writes, `null` on pre-field rows). `pre_decision_harness` is reachable ONLY via the
   provenance marker this session mints.
3. **The two operational memories still bind** for any live leg: `api-key-1-per-day-limit-masks-as-401`
   (raise TEST key limits first) and `claude-code-desktop-app-hook-env` (credential via `settings.env`).
4. **0h remains held** — pre-0h trust-layer work; this session does not touch the launch call.
5. **Founder election at open (recommended):** consider splitting Slice 3 into **3a packaging**
   (`code-elevated` — a repo/distribution artifact, no prod surface) and **3b mint + first marker**
   (`code-critical`/AC7). The mint + the public-read change are the genuine Critical triggers; the
   plugin manifest is not. Keeping them in one Critical session is fine; splitting lets 3a land first.

## Part A — Open under the protocol (full reads — code-critical)
Read in order:
1. /adopted/standing-protocol-cache.md → §"Critical-risk sessions" + the model/risk tables.
2. operations/handoffs/founder/2026-06-20-gate1-arc2-slice2-negative-battery-close.md.
3. adopted/adr/2026-06-20-pre-decision-harness-arc2.md — **D7** + §Slice 3 + the dated subagent finding.
4. The Arc-1 substrate (verify first-hand, PR11 — these are the unforgeability root):
   - `website/src/lib/substrate/examination-mode-flag.ts` (incl. `readPreDecisionMarker` — fail-closed read of `api_keys.credential_provenance`).
   - `composeK1InitialCoverage` (the `harness_enforced` path) + the accreditation write boundary + the public GET `/api/accreditation/{agent_id}` payload composer.
   - `/api/admin/api-keys` (where `credential_provenance` / the `examination_enforcement` marker is set at mint).
   - `website/supabase-agent-accreditation-examination-mode-migration.sql` (the Live column/CHECK).
5. The official plugin/hook-distribution wire contracts (PR11/PR12), first-hand:
   - `code.claude.com/docs/en/plugins` — `.claude-plugin/plugin.json`, `hooks/hooks.json`, `.mcp.json`, `skills/`, `${CLAUDE_PLUGIN_ROOT}`; **PR12 nuance:** adding a *marketplace* does NOT auto-install — the user runs `/plugin install`.
6. /operations/decision-log.md — last 2 entries.
7. The two memories named above.

Confirm at open: tier (`code-critical`, or 3a/3b split); 0h held; **model N/A for the framing call**
(the hook uses standard depth, never deep — ADR-011 D3); status vocab; risk class; **the six
Critical-Change-Protocol elements stated explicitly before any prod step.**

## Part B — Procedure (Critical Change Protocol + build)

State the **six 0c-ii elements** up front: (1) what's changing — plain language; (2) what could
break — specific failure modes; (3) what happens to existing sessions/credentials; (4) rollback plan;
(5) verification step; (6) explicit founder approval specific to the named risks. Then:

### Step 1 — Plugin packaging (3a)
Package the harness as a Claude Code plugin: `.claude-plugin/plugin.json` (manifest), `hooks/hooks.json`
registering the `UserPromptSubmit` hook via `${CLAUDE_PLUGIN_ROOT}` (mirror `claude-code/settings.snippet.json`)
— plus the subagent hook from Step 1b once built — and, only if they earn their place (PR15), `.mcp.json`
(a substrate MCP tool) + `skills/` (an agent skill that documents the cadence). Verify the manifest +
`hooks.json` parse and that `/plugin install` from a local marketplace registers the hooks (PR12: the
install is explicit, not automatic). **No prod.**

### Step 1b — The subagent-framing hook (`PreToolUse`-on-`Agent`) — the Slice-2 carry
Slice 2 proved (live) that a `SubagentStart` command hook **cannot** frame a subagent (its stdin has no
`prompt`); the faithful path is a **`PreToolUse` hook matched to the `Agent` tool**, whose `tool_input`
carries the subagent's prompt and which **can block**. Build it **diagnostic-first** (the Slice-2 lesson —
command-hook stdin ≠ SDK type): (i) capture the real `PreToolUse`-on-`Agent` stdin/`tool_input` shape live
(reuse the `GATE1_DEBUG` raw-stdin capture in `lib/framing-core.mjs`) to confirm the exact field carrying
the subagent prompt; (ii) build the hook on the shared core — examine that prompt via `/api/reason`, inject
the frame (via `updatedInput` prepend, or the documented `PreToolUse` context mechanism — verify first-hand),
optionally `deny` for strict; **add a recursive-loop guard** (a `PreToolUse` hook that examines must not
re-trigger itself); (iii) add it to `negative-battery.mjs` as a real asserted leg against the captured
shape; (iv) live-verify in a fresh conversation that spawns a subagent. This restores the 4th battery leg
to an assertion (it is currently a documented finding). **No prod** (TEST-only until packaged).

### Step 2 — First-hand verify the mint → marker → read chain (PR11)
Before minting anything, trace in code how `examination_enforcement: pre_decision_harness` is set at
admin mint, stored in `api_keys.credential_provenance`, read fail-closed by `readPreDecisionMarker`,
folded by `composeK1InitialCoverage`'s `harness_enforced` path, and surfaced on the public GET. Confirm
a consumer **cannot** self-issue it (the unforgeability root). Note any drift from D7.

### Step 3 — TEST: mint the operator harness credential + a harness-backed accreditation write
On TEST (founder-walked, PR17): mint the operator credential carrying the provenance marker; run a
harness-backed consult + accreditation write; confirm the public GET reads
`examination_mode: "pre_decision_harness"` for that agent — the **first non-null marker**. Confirm a
NON-marked credential still reads `post_decision_check` (honest differentiation holds). Tear down.

### Step 4 — PROD activation (the Critical step; founder-walked, AC7)
Apply on prod in the inviolable order the session establishes (any migration BEFORE any flag/mint);
mint the operator credential; make the harness-backed accreditation write; verify
`pre_decision_harness` reads live on the public payload; confirm no regression to the R18f provenance
gate / R20a / distress / Layer-2 signing / UPC auth (all untouched — this is an additive provenance
marker + a read fold). Smoke + teardown of any throwaway artifacts.

### Step 5 — Re-run the gates + verify
`logic-harness.mjs` 32/0; `negative-battery.mjs` 53/0; plugin manifest/hooks parse; the live marker read.

### Step 6 — Full Critical session close + decision-log entry (full templates)
Include: Verification Method Used, Risk Classification Record, PR5 Knowledge-Gap Carry-Forward,
Founder Verification (Between Sessions), Orchestration Reminder.

## Rollback path
3a: `git revert` the packaging commit / `/plugin uninstall`. 3b: revoke the operator credential +
revert/repair the accreditation row so its `examination_mode` returns to `post_decision_check`/`null`;
the marker is additive provenance — removing it is non-destructive. The `examination_mode` column +
flag predate this session (Arc 1) and stay.

## Forecast
End with the plugin installable, the **first `pre_decision_harness` issued and reading live** on the
public accreditation payload (consumer-unforgeable), and the gates green. That satisfies the mentor's
binding constraint (the harness is real) and **unblocks Slice 4 / Arc 3** — publishing the held
"Gate 1 — pre-decision" per-configuration contract language to `llms.txt` / `agent-card.json` /
api-docs (`drafts/sage-practice-examination-mode-docs-staged.md`). The 0h launch call remains the
founder's throughout.

## Cross-references
- adopted/adr/2026-06-20-pre-decision-harness-arc2.md (ADR-011 §Slice 3 + D7)
- harness/gate1-pre-decision/ (the hooks + core + battery + walkthroughs to package)
- `D-SAGE-PRACTICE-GATE1-ARC1-EXAMINATION-MODE-ACTIVATION` (the Live field this slice first populates)
- `D-SAGE-PRACTICE-GATE1-SURFACE-HONESTY-OPTION2-DIFFERENTIATION` (why the marker must be unforgeable)
- drafts/sage-practice-examination-mode-docs-staged.md (the Slice-4 / Arc-3 contract language)
- memory: `api-key-1-per-day-limit-masks-as-401`, `claude-code-desktop-app-hook-env`

End of prompt.
