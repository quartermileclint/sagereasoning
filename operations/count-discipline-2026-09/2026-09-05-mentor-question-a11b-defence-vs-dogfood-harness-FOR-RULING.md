> **RULED 2026-09-05** — Part 4 — remedy (a) harness-side redaction with disclosure + logging; (b) not elected; the masked-200 `route_errors` row built alongside. Verbatim (canonical): `operations/count-discipline-2026-09/2026-09-05-mentor-rulings-five-relays-verbatim.md`; adopted `D-MENTOR-RULINGS-FIVE-RELAYS-ADOPTED-2026-09-05`.

# Mentor question — the injection defence blinds the harness on exactly the sessions that maintain the substrate. Which duty governs, and where should the remedy live?

**Prepared 2026-09-05 (22:55 AEST) for founder relay.** `governance`, documents only. One question
of principle with three candidate remedies; nothing here is built or recommended for building
without the ruling. **PR20:** every present-tense mechanism fact below is marked **[SOURCE]** (read
from code today, at HEAD `19509bb`), **[OBSERVED]** (from production `route_errors`, founder-run
query today), or **[RECORDED]** (from a project record). Prior rulings that bear on this are named
so the answer can land on them, not beside them.

---

## 1. What happened (the instance)

During Session 3 of the R20a perimeter-ordering remediation (2026-09-05), the founder's own
Claude-Code loop — the dogfooded Gate-1 harness on `sagereasoning:s9-loop@v1` — lost its
examination on every consequential action for two windows totalling ~50 minutes. **[OBSERVED]**
`route_errors` holds 18 rows for `/api/practice/discernment`, `phase: elicitation`, every one
`Layer1ValidationError: extractFeatures: high-confidence prompt-injection override detected in
input; rejected (fail-closed). Patterns: schema_field_injection`. The consult path failed by the
same mechanism at the same moments but left no row (§2.3).

The session's work was moving four distress guards and pinning them. Its edits, its batteries and
its own words contained `distress_detected`, `shouldRedirect`, `redirect_message`, `is_kathekon` —
because that is the code being maintained.

## 2. The mechanisms the ruling will land on

**2.1 The defence.** **[SOURCE]** `website/src/lib/translation-sandwich/injection-defence.ts:125–128`
defines `schema_field_injection` as the regex
`distress_detected | distress_signal | shouldRedirect | redirect_message | is_kathekon | passions_present | layer1-schema | layer1_schema | severity: none`.
Its docstring (`:100–101`): *"matches internal field identifiers a real user would never type — a
strong, low-false-positive signal → reject."* The severity rule (`:142`, `:160`) makes this
category a **reject on its own** (fail-closed), unlike the other categories, which only flag unless
stacked. A11b has been live in production since 2026-06-08 **[RECORDED]**
(`SUBSTRATE_INJECTION_DEFENCE_ENABLED=true`).

**2.2 Where it runs.** **[SOURCE]** `layer1-extractor.ts:2095` runs `detectInjection(input)` inside
`extractFeatures` — the single Sonnet Layer-1 extraction every examining route shares. A reject
throws `Layer1ValidationError` before any model call. So the defence reaches `/api/reason`
(consult), `/api/guardrail`, and `/api/practice/discernment` alike.

**2.3 How the two harness channels carry the tokens.**
- The discernment **elicitation** sends the **transcript tail** as `elicitation_text`
  (**[SOURCE]** `harness/gate1-pre-decision/claude-code/hooks/at-action-hook.mjs:222–232`,
  `readTranscriptTail(transcriptPath, dcfg.traceMaxChars)`) — the S8-proven out-of-band channel,
  chosen precisely so the agent cannot author its own answer. On a substrate session the tail is
  full of schema identifiers by construction. The route's outer catch returns 503 and writes
  `route_errors` (`discernment/handler.ts:715–733`).
- The at-action **consult** sends the composed action text (narrated intent + bounded payload,
  S11b) to `/api/reason`. On a Layer-1 throw the route serves `buildMinimalFallback` —
  `{ extraction: null, assessment: null, … }` — **at HTTP 200** (**[SOURCE]**
  `website/src/app/api/reason/route.ts:2077–2089`, Branch 2), logging only a `console.warn`
  (`parallel-run.ts:676–680`); the route's sole `logRouteError` is its outer catch (`:2267`),
  which this branch never reaches. The harness reads that as `CONSULT-OUTAGE "no assessment in
  response"` (`framing-core.mjs:569`). **A rejected injection on the consult path is therefore
  indistinguishable from an outage in the log and absent from the database.** This is the R3
  "status masking" item already on the longer-tail list **[RECORDED]**, with its cost now shown.

**2.4 What the harness then does.** Fail-open-honest by design (KG1): the action proceeds UNFRAMED
with an honest log line; the guard, when it also cannot evaluate, returns `pause_for_review` with
"the gate fails safe (no proceed)" — a caution, not a deny. So on a substrate session the
instrument is absent at the most consequential edits and the agent proceeds on its own judgement,
which is the state the harness exists to improve on.

**2.5 What it costs the measurement.** B4 (the S11 register) measures guard availability from
`gate1.log`, whose lines cannot distinguish an injection reject from an outage. Today's 18 + 3
events would read as ~50 minutes of unavailability. The window's second precondition (F-3′, a
bounded availability rate) is computed from the same log.

## 3. Prior rulings this touches

- **A11b's own adoption** (2026-06-08): the defence is a security surface; its reject rule was
  tuned to *"minimise false-positives on natural-language emotional content"* — a practitioner
  typing about their day. The dogfood harness was not a caller the tuning contemplated.
- **The channel law** (ADR-011, 2026-06-21 amendment): out-of-band capture (the transcript tail)
  is the sole trustworthy channel for the reflect/elicitation answer. Any remedy that has the
  agent pre-shape what is sent re-opens the self-report problem the law closed.
- **S9's G1/E1 elections** (2026-07-11): the operator dogfood credential is agent-bound and
  distinguishable at the server (`credential_provenance`), so a credential-scoped policy is
  technically expressible.

## 4. The question of principle

**When the defence's duty (refuse internal-field smuggling, fail closed) and the harness's duty
(examine the agent's consequential actions, especially on the substrate itself) conflict on the
operator's own loop, which governs — and does the answer change the *location* of the remedy?**

Three candidate remedies, stated for the ruling and not chosen:

- **(a) Harness-side redaction.** The composer/capture replaces schema identifiers with neutral
  placeholders before sending (e.g. `distress_detected` → `⟨field⟩`). Keeps the defence untouched.
  Cost: the examined text is no longer verbatim — the channel-law question of whether a
  mechanically redacted tail is still "out-of-band verbatim" (it is deterministic and not
  agent-authored, but it is shaped). `code-elevated`, harness only.
- **(b) Credential-scoped downgrade.** For a credential carrying the operator dogfood marker,
  `schema_field_injection` becomes *flag* rather than *reject* (the text is still escaped and
  marked). Keeps the channel verbatim. Cost: a security surface gains a trust-scoped exception —
  the exact shape a defence should not have — and the AI recommends **against** it unless the
  mentor finds the principle requires it. `code-critical`.
- **(c) Accept and classify.** Leave both as they are; treat blindness on substrate sessions as a
  known, bounded property; have B4 classify these events as self-inflicted via `route_errors`
  (discernment half) and, once the masked fallback logs a row, the consult half too. Cost: the
  instrument is absent precisely where the mentor's Gate-1 framing says it matters most.

An engineering item rides alongside and needs no ruling: the masked-200 fallback on `/api/reason`
should write a `route_errors` row (a real injection attempt against the consult surface currently
leaves no trace). It is named here only so the mentor sees that (c)'s classification is not yet
possible on the consult half.

## 5. What is NOT asked

Whether A11b should exist (it should); whether the reject rule is correct for practitioners (it is,
by its own tuning); whether the S11 flip, the window, or the 0h call move (they do not). Nothing
here is built.

**Relay note:** attach this document whole; if the mentor has ruled on any part before, the
ruling was not found in the record at writing (the 2026-08-24 outstanding-questions register was
checked). Record: `D-CONSULT-PATH-DEGRADATION-ROOT-CAUSE-A11B-SCHEMA-FIELD-INJECTION-FAIL-CLOSED-2026-09-05`;
memory `harness-blind-on-substrate-sessions-a11b-schema-tokens`.
