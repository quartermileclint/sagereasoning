# Next-Session Prompt — Gate-1 Full-Loop Harness (Slice 5c): re-architect H3/H4 onto the channel law

**For the founder. Paste as the first message of a fresh session.**

**Stream:** founder.
**Tier:** **`code-critical`** — full Critical Change Protocol (0c-ii). Touches the harness build, a **public reflect-contract change** (`/api/practice/reflect` additive `context_source` field — its own 0c-ii sub-gate), public-contract narrowing (`llms.txt` / `agent-card.json` / examination-mode docs), and a re-install + live-fire. **AC7 + PR6 engaged.** Every prod step is the founder's (PR17); the AI guides + verifies.
**Governing design:** `adopted/adr/2026-06-20-pre-decision-harness-arc2.md` — the **2026-06-21 (Slice 5b live-fire) amendment, "the channel law; H3/H4 re-architecture; corrected scope"**. Read it first, plus memory `[[gate1-harness-channel-law]]`.
**Predecessor close:** `operations/handoffs/founder/2026-06-21-gate1-full-loop-harness-slice5b-activation-close.md`.
**Predecessor decision-log entry:** `D-SAGE-PRACTICE-GATE1-FULL-LOOP-HARNESS-SLICE5B-ACTIVATION-AND-CHANNEL-REARCHITECTURE`.

## Why this session matters
Slice 5b live-fired H1–H4 and proved the **channel law**: out-of-band hook actions (guard-deny, accred-write) are robust to a resistant agent; soft-injected instructions-to-act (use the frame; perform the reflect via outbound POSTs) are **correctly refused** by a capable agent. Slice 5c rebuilds the cooperation half onto out-of-band channels so the harness delivers value without asking the agent to act on injected instructions — and applies the honesty fixes the adversarial verifier required.

## Step 0 — Resolve the open questions FIRST (they scope the build)
Get explicit founder answers before building:
1. **Reflect IN or OUT of the harness** — decompose-and-keep (enforcement+instrumentation; preserves the "ongoing practice" positioning) vs. drop entirely (narrows `pre_decision_harness` to frame + guard + accreditation). *Product call.*
2. **Egress consent** — is operator-install-time disclosure sufficient for transmitting the agent's introspective text to the service, or too sensitive to ship?
3. **Approve the additive `context_source: 'agent_stated' | 'harness_inferred'` field** on `/api/practice/reflect` (its own 0c-ii gate)?
4. **Forced-turn opt-out** — where does it live (an env flag so an operator can disable the one-extra-turn-per-close while keeping guard + accred)?
5. **Approve narrowing the public `pre_decision_harness` claim** + the ADR over-claim correction (already annotated; the public surfaces still need it)?

## Critical Change Protocol (state at open; founder approves per named risk)
1. **What changes:** (a) `at-action-hook.mjs` — strip the SCORE frame's imperative outbound tail (keep the consult *fetch* — it's the sole R18f provenance source; mark it credential-critical); (b) `close-hook.mjs` — rewrite the forced-turn reason to a non-imperative in-conversation invitation (no endpoint, no "POST", no credential); add `persistReflection()` (out-of-band, modeled on `writeAccreditation`, reads `last_assistant_message` on the `stop_hook_active===true` turn); (c) the additive `context_source` field on `/api/practice/reflect`; (d) public-contract narrowing; (e) re-install + live-fire.
2. **Named risks:** public reflect-surface change (additive, but Critical); off-machine egress of agent introspective text (disclose + consent); false-success drift (persist verbatim or explicit "not performed" — battery-locked); re-install fires real prod calls + the guard can deny.
3. **Existing sessions:** H1/H2 + the standing dogfood marker untouched; hooks hot-reload.
4. **Rollback:** `git revert` the Slice-5c commit; unset any new flag; the `context_source` field is additive/reversible.
5. **Verification:** the negative-battery + logic-harness extended green; a live re-fire showing (i) guard-deny honored, (ii) the consult provenance still accumulates, (iii) the forced reflect turn fires and the agent ENGAGES (no outbound ask), (iv) `persistReflection` writes the agent's verbatim words out-of-band (or honest "not performed"), (v) the public claim reads honestly.
6. **Approval:** per named risk.

## Step-by-step (founder-walked; sequence the `context_source` sub-gate BEFORE the reflect open relies on it)
1. **ENFORCE/ADVISE edits** (repo-only, dark): strip the H3 SCORE imperative tail; rewrite the H4 forced-turn reason; add the credential-critical comment on the consult fetch. Extend the logic-harness + negative-battery (incl. the "verbatim-or-not-performed; never hook-authored" honesty leg). Gates green.
2. **`context_source` additive field** on `/api/practice/reflect` (`request-helpers.ts`) — its own 0c-ii: build + TEST + prod. Until live, the reflect open stays disabled (forced-turn-only, no server open) so nothing fabricates `session_summary`.
3. **INSTRUMENT: `persistReflection()`** in `close-hook.mjs` — out-of-band POST of the agent's closing reflection (verbatim, or "not performed") under the hook's reflect credential, marked `harness_inferred`/`agent_stated` honestly; fail-honest; fire-once via a new `.reflected` marker. Confirm `/api/credential/erase` covers reflection rows.
4. **Disclosure docs:** the harness README + the `pre_decision_harness` contract state plainly that the close hook reads the session's closing reflection and persists it to SageReasoning under the operator's credential.
5. **Public-contract narrowing:** `llms.txt` / `agent-card.json` / examination-mode docs — `pre_decision_harness` attests frame-injected + guarded + reflection-turn-fired-&-observed + examination-backed-accreditation; never "reasons from the frame" / "sincere Q1–Q6".
6. **Re-install + live-fire** in a dedicated test loop (a fresh non-marker credential set, as in 5b); verify the five points above.
7. **Decision-log + close + CLAUDE.md refresh.**

## Risk classification
`code-critical` — public reflect-surface change + re-install/live-fire + data-egress disclosure on the trust surface. Full Critical Change Protocol; every prod step the founder's.

## Forecast
Ends with the full-loop harness re-architected onto the channel law: enforcement + instrumentation carry the load out-of-band; the frame is honestly advisory; the public claim matches what the channels enforce; reflect-at-close persists the agent's real words (or an honest "not performed") without ever asking the agent to act on an injected instruction. Then the harnessed-vs-bare value comparison can run on the honest product. The 0h call stays the founder's.

End of prompt.
