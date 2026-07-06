# Next-Session Prompt — Gate-1 Arc 3 / Slice 4: publish the per-configuration "Gate 1" contract language

**For the founder. Paste as the first message of a fresh session.**

**Stream:** founder.
**Tier:** `governance → code-elevated` — **Elevated** risk (public-facing contract docs, R18; **no auth / perimeter / encryption / flag / schema** change). **AC7 NOT engaged. Critical Change Protocol NOT engaged.** If the founder reclassifies upward, follow the heavier template.
**Governing frame:** /adopted/standing-protocol-cache.md (lean templates).
**Predecessor close:** operations/handoffs/founder/2026-06-21-gate1-arc2-slice3b-first-pre-decision-harness-issued-live-close.md.
**Predecessor decision-log entry:** `D-SAGE-PRACTICE-GATE1-ARC2-SLICE3B-FIRST-PRE-DECISION-HARNESS-ISSUED-LIVE`.
**Governing design:** `adopted/adr/2026-06-20-pre-decision-harness-arc2.md` (ADR-011 §Slice 4) + `D-SAGE-PRACTICE-GATE1-SURFACE-HONESTY-OPTION2-DIFFERENTIATION` (the two-configurations-one-name decision — the SOURCE for the language to draft).

## Why this session matters

Gate-1 Arc 2 is **complete**: the `pre_decision_harness` marker is **Verified-live** (Slice 3b proved it issuable + readable on the public payload, with a non-marked control reading `post_decision_check`). The mentor's binding constraint — *do not name "Gate 1 — pre-decision" on a public surface until the harness is real* — is now **satisfied**. So the last held piece of the Gate-1 surface-honesty arc can ship: the **per-configuration contract language** that names the two honestly-distinct "Gate 1" configurations. This completes Option-2 honest differentiation end-to-end (mechanism → credential → public contract).

## Read this first — what is and isn't already done (avoid re-applying live text)

- **ALREADY LIVE (do NOT re-apply):** the `examination_mode` **field-semantics + attestation-limit** docs — `drafts/sage-practice-examination-mode-docs-staged.md` §§1–3 — were applied at the Arc-1 activation (2026-06-20): the `llms.txt` "Accreditation — Examination mode" subsection, the `agent-card.json` `examination-mode/v1` extension (13 extensions), and the api-docs read-back note. Confirm they're live before drafting; **build on them, don't duplicate.**
- **STILL HELD (this session's deliverable, NOT yet drafted anywhere):** the **per-configuration contract language** — `drafts/…docs-staged.md` §"Out of scope for this file" (line 65): *"Gate 1 — pre-decision" (developer surfaces) vs "Gate 1 — post-decision (check)" (hosted surfaces).* It must be **drafted from** `D-SAGE-PRACTICE-GATE1-SURFACE-HONESTY-OPTION2-DIFFERENTIATION` (read `drafts/D-gate1-surface-honesty-option2-honest-differentiation.md`).

## Honesty constraints (load-bearing — bake into the draft)

1. **No standing harness is in distribution/use yet.** Slice 3b proved the mechanism then smoke-tore-down the proof artifacts; the Slice-3a plugin's `/plugin install` was never live-tested (no `/plugin` in the desktop build). So the language must present `pre_decision_harness` as **the configuration a developer-installed / operator-issued Gate-1 harness earns** — mechanism real, available — **without claiming adoption** or that any agent currently carries it. Don't overclaim.
2. **The mentor's binding constraint** (staged file line 66): *no public surface may present the post-decision check as pre-decision framing.* The two configurations stay honestly distinct.
3. **Consistency with the live attestation-limit note** — `examination_mode` is an **attestation, not a cryptographic proof of timing** (already live in `llms.txt`). The new per-config language must not contradict it; cross-reference it.

## Pre-conditions
1. Production is at the 3b end-state: Arc 1 Live (`SUBSTRATE_EXAMINATION_MODE_ENABLED=true`); **no standing marker credential/row** (full smoke). No prod change is needed or expected this session.
2. The Slice-3b commit is pushed + Vercel green (founder confirmed 2026-06-21).
3. 0h remains held — pre-0h trust-layer work; this session does not touch the launch call.

## Part A — Open under the protocol (lean)
Read in order:
1. /adopted/standing-protocol-cache.md (~3 min — tier, risk class, status vocab, signals).
2. The predecessor 3b close (above).
3. `D-SAGE-PRACTICE-GATE1-SURFACE-HONESTY-OPTION2-DIFFERENTIATION` (decision-log) + `drafts/D-gate1-surface-honesty-option2-honest-differentiation.md` — **the source for the language**.
4. `adopted/adr/2026-06-20-pre-decision-harness-arc2.md` §Slice 4 + §Consequences.
5. `drafts/sage-practice-examination-mode-docs-staged.md` (confirm §§1–3 are live; §"Out of scope" is the held scope).
6. The live surfaces to edit: `website/public/llms.txt`, `website/public/.well-known/agent-card.json`, the api-docs `page.tsx`.

Confirm at open: tier (Elevated); 0h held; **model N/A**; status vocab; risk class.

## Part B — Procedure (lean)

### Step 1 — Draft the per-configuration contract language
From the Option-2 decision, draft the two named configurations as public contract text:
- **"Gate 1 — pre-decision"** (developer / operator-harness surfaces): a developer-installed Gate-1 harness fires the examination BEFORE the agent reasons; the credential reads `examination_mode: pre_decision_harness`. Earned only via an operator-issued harness credential (consumer-unforgeable).
- **"Gate 1 — post-decision (check)"** (hosted / discretionary API surfaces): the examination runs AFTER the agent's judgement as an honest developmental check; the credential reads `post_decision_check`. The default for direct/discretionary API use.
Name how a consumer **tells them apart**: read `examination_mode` on the accreditation payload (the sole unforgeable distinguisher). Honour the three honesty constraints above. Keep it consistent with the live field-semantics text.

### Step 2 — Founder review of the draft (governance gate)
Surface the draft for founder sign-off **before** touching any public surface (R18). Do not apply unreviewed contract language.

### Step 3 — Apply to the public surfaces (R18 — live on the founder's push)
- `website/public/llms.txt` — extend the existing "Accreditation — Examination mode" section (don't duplicate it) with the two-configuration contract language.
- `website/public/.well-known/agent-card.json` — either extend `examination-mode/v1` or add a focused extension for the configuration contract; **JSON-validate**; note the extension count change.
- api-docs `page.tsx` — add the per-configuration note alongside the live read-back note.

### Step 4 — Verify
- `node -e "JSON.parse(require('fs').readFileSync('website/public/.well-known/agent-card.json','utf8'))"` → no throw; extension count as expected.
- `npm run build` (in `website/`) if `page.tsx` changed (route/page edits are gated by build, not just tsc — memory `nextjs-route-export-validation`).
- Re-read the live attestation-limit note + the mentor constraint; confirm no contradiction and that post-decision is never presented as pre-decision.

### Step 5 — Append decision-log entry (lean form)
Per /adopted/standing-protocol-cache.md §"Lean decision-log entry". Suggested id: `D-SAGE-PRACTICE-GATE1-ARC3-SLICE4-CONFIGURATION-CONTRACT-PUBLISHED`.

### Step 6 — Session close (lean form) + update the CLAUDE.md production-state block (PR18)
Note: the docs go live on the founder's push (R18). Record that the Gate-1 surface-honesty arc (Arcs 1–3) is complete; the standing harness onboarding (real distribution) + the 0h launch call remain.

## Risk classification
**Elevated** under 0d-ii — public-facing contract materials (R18). No auth/perimeter/encryption/flag/schema. AC7 not engaged; PR6 not engaged. The change is reversible by `git revert` of the docs commit.

## Rollback path
`git revert` the docs commit (+ redeploy if `page.tsx` changed). The `examination_mode` field + flag are untouched (Arc 1).

## Forecast
Ends with the two "Gate 1" configurations honestly documented on the public surfaces — Option-2 honest differentiation complete end-to-end (mechanism + credential + public contract). After this, the Gate-1 surface-honesty arc (Arcs 1–3) is done; the remaining Gate-1 work is the **standing harness onboarding** (real plugin distribution into a real developer loop + a standing operator credential that re-earns the marker) and, separately, the **0h launch call** (the founder's).

## Cross-references
- `adopted/adr/2026-06-20-pre-decision-harness-arc2.md` (ADR-011 §Slice 4)
- `D-SAGE-PRACTICE-GATE1-SURFACE-HONESTY-OPTION2-DIFFERENTIATION` + `drafts/D-gate1-surface-honesty-option2-honest-differentiation.md`
- `drafts/sage-practice-examination-mode-docs-staged.md` (§§1–3 LIVE; §"Out of scope" = this scope)
- `operations/handoffs/founder/2026-06-21-gate1-arc2-slice3b-first-pre-decision-harness-issued-live-close.md`
- memory: `nextjs-route-export-validation` (build-gate the `page.tsx` edit)

End of prompt.
