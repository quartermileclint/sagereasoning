# SESSION PASTE — Session S9: harness-side A11b schema-token redaction

**Paste this whole file as the first message of a fresh session.** Standing queue row **S9** of the
single serial arc (standing opener, Version 2026-09-05 as re-planned 2026-09-06). The R20a ordering
arc is CLOSED (S3.4 landed 2026-09-06); this is the next row.

**Tier `code-elevated`, AUTONOMOUS** — harness files only. No production route, no schema, no flag,
no credential, no migration. **The AI edits and verifies; the founder commits and pushes.** PR19 is
**recommended, not required** at this tier — run it if the diff touches the redaction rule itself
(it will), and complete first-hand if the fleet dies.

**⚠ THE HARNESS IS LIVE IN THE FOUNDER'S OWN LOOP AND HOT-RELOADS MID-CONVERSATION** (memory
`claude-code-desktop-app-hook-env`). Every edit to `harness/gate1-pre-decision/claude-code/hooks/`
takes effect on the NEXT hook fire in this very session. That is intended here — it is how you will
observe the fix working — but it means a broken edit degrades your own instrument immediately.
Verify each `.mjs` with `node --check` before moving on.

**Never push. Never `git add -A`. Never stage a peer's files. NEVER edit
`website/src/lib/translation-sandwich/injection-defence.ts` — the ruling is explicit that the
defence stays untouched. Date every artifact from `date`/`git log`, never the context date.**

Written 2026-09-06 (`date`), HEAD after the S3.4 + S2 commits. Model at writing `claude-opus-5`.

---

## 0. Open under the standard protocol

1. `operations/handoffs/founder/STANDING-SESSION-OPENER-grounded-foundations.md` — Part A in full,
   the "⚠️ facts", the Standing queue. Its S9 row is this session.
2. **The binding ruling — `operations/count-discipline-2026-09/2026-09-05-mentor-rulings-five-relays-verbatim.md`
   Part 4, in full.** It is short and it decides everything here. Verbatim wins over this paste.
3. Memory `harness-blind-on-substrate-sessions-a11b-schema-tokens` — the diagnosis, the refuted
   hypothesis, and the standing instruction not to weaken the defence.
4. The most recent close: `2026-09-06-r20a-perimeter-ordering-remediation-session3D-stoa-CLOSE.md`
   (the arc's close) and, for the harness's own shape,
   `harness/gate1-pre-decision/README.md` + `SEVEN-LAYERS.md`.

## 1. The problem, stated exactly

`website/src/lib/translation-sandwich/injection-defence.ts:125–128` rejects any Layer-1 input
matching:

```
/\b(distress_detected|distress_signal|shouldRedirect|redirect_message|is_kathekon|passions_present|layer1-schema|layer1_schema|severity\s*[:=]\s*["']?none)\b/i
```

That is correct for a practitioner — nobody types those identifiers about their day. But the
dogfood harness sends **the composed edit text** (the at-action consult) and **the transcript tail**
(the discernment/elicitation) to `/api/reason` and `/api/practice/discernment`. On any session that
maintains the substrate, those payloads are full of exactly these tokens by construction. So the
harness **fails closed at the most consequential actions** — it is structurally blind on precisely
the sessions the mentor's Gate-1 framing says matter most.

**Observed, twice, in this very arc:** Session 3 Group 1 logged 18 `CONSULT-OUTAGE
reason="no assessment in response"` + 19 discernment `http 503` events; Session 3C logged 1
`UNFRAMED reason="no assessment in response"`. Both are self-inflicted. The `gate1.log` line is
identical to a genuine outage, which is what made it a diagnosis problem rather than an obvious one.

## 2. The ruling (Part 4) — what it decides, and what it forbids

**Remedy (a), harness-side redaction, GOVERNS.** Verbatim, the operative sentences:

> "the redaction rule should cover the `schema_field_injection` regex's full token list, replace
> each match with a bracketed placeholder that names the category (e.g. `⟨schema-field⟩`), and log
> the replacement count per call. The harness documentation should carry a note that substrate
> sessions produce redacted tails and name the rule. This is `code-elevated`, harness only."

**On the channel law** (the question of whether a mechanically redacted tail is still out-of-band
verbatim) the mentor answers **yes, with disclosure**:

> "Mechanical redaction of schema identifiers with neutral placeholders is deterministic, not
> agent-authored, and does not give the agent any influence over what is sent. The examined text is
> shaped, but it is shaped by a rule, not by the agent. That is within the channel law's terms,
> provided the redaction rule is disclosed in the harness documentation and the redaction is logged
> so a future reader knows what was replaced."

**NOT elected, and must not be built:** remedy (b), a credential-scoped downgrade of the defence
("a trust-scoped exception in a security surface … the exact shape a defence should not have").
Remedy (c), accept-and-classify, is explicitly "not acceptable as a permanent posture."

**Already done — DO NOT REPEAT:** the ruling also names the `/api/reason` masked-200 fallback
writing a `route_errors` row. **That was built in Group 2 (`cbd93ae`) and is live.** Confirm by
reading the route, then leave it alone.

## 3. Where to build it

The rule belongs in ONE shared place the composition points import — not copied per hook (memory
`guard-scope-must-cover-the-class`). Candidate home:
`harness/gate1-pre-decision/claude-code/hooks/lib/` (a new small module, e.g. `schema-redaction.mjs`).

**Composition points to cover — re-derive each with `grep -n`, do not trust these line numbers:**

| Surface | File | What is sent |
|---|---|---|
| At-action consult | `lib/action-composer.mjs` | the composed narrated-intent + payload text |
| Discernment / elicitation | `lib/discernment.mjs` — `readTranscriptTail` (~`:106`) | the transcript tail |
| Anything else that POSTs free text | `grep -rn "input:" hooks/*.mjs hooks/lib/*.mjs` | check for a third caller |

**Sweep for a third caller before designing** — the two above are the observed ones, not
necessarily all of them. The framing hooks and the close hook also send text; check each.

## 4. Design constraints

1. **The token list must be DERIVED, not retyped.** The whole failure class this project keeps
   hitting is a hand-copied constant going stale (perimeter counts, extension counts, PR ranges).
   The `.mjs` harness cannot import the TypeScript module, so the honest options are: (a) parse the
   regex out of `injection-defence.ts` source at load; (b) hard-code it WITH an assertion in a
   battery that re-reads the TS source and fails when the two diverge. **(b) is recommended** — a
   parse at hook-load time is a runtime dependency on a file outside the harness tree. Whichever you
   pick, a divergence must go RED in a test, not merely be commented against.
2. **Replace, never drop.** Each match becomes `⟨schema-field⟩` — the placeholder names the
   category, so a reader of the examined text knows something was replaced and what kind of thing it
   was. Do not delete the token, do not substitute a synonym, do not paraphrase.
3. **Log the replacement count per call**, per the ruling. The existing `gate1.log` line format is
   the place; add the count, do not invent a second log file.
4. **Preserve everything else byte-for-byte.** The redaction must be the ONLY transformation. A tail
   with no tokens must be byte-identical to today's.
5. **The redaction runs LAST**, after truncation/composition, so the placeholder count reflects what
   was actually sent — and so a token straddling a truncation boundary cannot survive as a partial.
   Think about the partial-token case explicitly and write down what you decided.
6. **Disclose in the harness docs** — `harness/gate1-pre-decision/README.md` and/or
   `SEVEN-LAYERS.md`: that substrate sessions produce redacted tails, the exact rule, and the
   channel-law reasoning (quote the mentor's "shaped by a rule, not by the agent").

## 5. Verification

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
for f in harness/gate1-pre-decision/claude-code/hooks/*.mjs harness/gate1-pre-decision/claude-code/hooks/lib/*.mjs; do node --check "$f" || echo "SYNTAX FAIL $f"; done
cd website && npx tsx src/lib/translation-sandwich/__tests__/injection-defence.test.ts | tail -1   # UNCHANGED — the defence is untouched
npx tsx src/lib/__tests__/r20a-invocation-guard.test.ts | tail -1                                   # unaffected
```
Plus the harness's own batteries (`logic-harness`, `negative-battery` — find them under
`harness/`), and the new redaction battery, which must include: every token in the list redacted;
the count correct; a token-free text byte-identical; a partial/truncated token handled as decided;
and **the divergence assertion** from constraint 1.

**The live proof is free and you should take it:** this session's own work will send schema tokens
through the harness. After the edit hot-reloads, a consult that would previously have logged
`CONSULT-OUTAGE reason="no assessment in response"` should instead succeed with a redaction count in
the log. **Record what you actually observe in `gate1.log`, including the counts** — that is the
took-effect proof, and it is the thing a future session cannot reconstruct.

## 6. Records

Decision-log entry at the physical tail (`D-S9-HARNESS-A11B-REDACTION-BUILT-2026-09-0N`); the
opener's S9 row → done and **fact 4's E5 coupling discharged** (S9 was gating S4(d)); the memory
`harness-blind-on-substrate-sessions-a11b-schema-tokens` updated to say the remedy is BUILT and what
the log now shows; a lean close carrying the observed redaction counts. **CLAUDE.md needs no
production-state block — nothing in production changes.** Then the next row is **S5** (the D2
scope-for-ruling, autonomous, also before S4(d)).

## 7. Do NOT

Touch `injection-defence.ts`. Build a credential-scoped downgrade. Re-do the `/api/reason`
`route_errors` row. Weaken, narrow, or "tune" the defence's regex. Push. Flip a flag. Quote a
perimeter count.

## 8. Rollback

`git revert` the commit. The harness reverts to its current fail-closed-and-blind behaviour, which
is the status quo — nothing in production is affected either way.

## 9. Forecast

Success = the harness sends redacted tails with a logged count, the defence is byte-untouched, a
divergence between the harness's token list and the defence's goes red in a battery, the docs
disclose the rule and the channel-law reasoning, and **this session's own `gate1.log` shows consults
succeeding where they previously failed closed**. That discharges the last gate before the window
readiness session (S4) other than S5.

End of paste.
