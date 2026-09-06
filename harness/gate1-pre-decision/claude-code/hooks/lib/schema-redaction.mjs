// ---------------------------------------------------------------------------
// schema-redaction.mjs — harness-side redaction of the A11b
// `schema_field_injection` token class, so the dogfood harness stops failing
// closed on exactly the sessions that maintain the substrate.
//
// WHY THIS EXISTS. website/src/lib/translation-sandwich/injection-defence.ts
// hard-rejects any Layer-1 input containing the substrate's own internal field
// identifiers. That is correct for a practitioner — nobody types those words
// about their day. But this harness sends the composed edit text (the
// at-action consult), the action text (the guard) and the transcript tail (the
// spawn discernment) to routes that run Layer-1 extraction. On any session
// that maintains the substrate those payloads are full of these identifiers BY
// CONSTRUCTION, so the defence fires, the route fails closed, and the harness
// is structurally blind at the most consequential actions — the opposite of
// what Gate 1 is for. Observed repeatedly: 2026-09-05 Session 3 logged 18
// CONSULT-OUTAGE + 19 discernment 503s from this cause alone; 2026-09-06
// Session 3C logged an UNFRAMED on a prompt that merely QUOTED the tokens.
//
// THE RULING (mentor, 2026-09-05, Part 5 relay set, Part 4 — verbatim wins;
// operations/count-discipline-2026-09/2026-09-05-mentor-rulings-five-relays-verbatim.md):
// remedy (a), harness-side redaction, GOVERNS. The defence is untouched. A
// credential-scoped downgrade of the defence was considered and explicitly NOT
// elected ("a trust-scoped exception in a security surface … the exact shape a
// defence should not have"). Accept-and-classify was ruled "not acceptable as
// a permanent posture".
//
// THE CHANNEL LAW. A mechanically redacted tail is still out-of-band verbatim.
// The mentor: "Mechanical redaction of schema identifiers with neutral
// placeholders is deterministic, not agent-authored, and does not give the
// agent any influence over what is sent. The examined text is shaped, but it
// is shaped by a rule, not by the agent. That is within the channel law's
// terms, provided the redaction rule is disclosed in the harness documentation
// and the redaction is logged so a future reader knows what was replaced."
// Hence: this file IS the rule, the README carries the disclosure, and every
// call site logs `redacted=N`.
//
// SCOPE — deliberately narrow. Redaction is applied ONLY to text that is
// actually EXAMINED (i.e. reaches Layer-1 extraction, which is the only place
// the defence runs — layer1-extractor.ts:2095/2110, layer3-prose.ts:663):
//   • fetchFrame       → /api/reason        : `input`, `context`
//   • fetchGuardrail   → /api/guardrail     : `action`, `context`
//   • buildSpawnPayload→ /api/practice/discernment : `reasoning_trace.trace`
// It is deliberately NOT applied to:
//   • the accreditation write and the hand-back payload — both carry
//     SERVER-SIGNED assessment envelopes whose fields legitimately include
//     these identifiers. Redacting them would corrupt the signed bytes and
//     break verification. Neither route runs Layer-1 extraction, so the
//     defence never sees them and there is nothing to fix.
//   • /api/practice/reflect — no Layer-1 extraction; the defence never fires.
//   • `delegated_task_preview` and the profile blocks on the spawn payload —
//     the server does not extract them, so shaping them would alter text
//     nobody examines, for no benefit, and widen the disclosure needlessly.
//
// Not a route file; exports are free.
// ---------------------------------------------------------------------------

// The placeholder. The mentor's own example, and it NAMES THE CATEGORY so a
// reader of the examined text knows something was replaced and what kind of
// thing it was — never a silent deletion, never a synonym, never a paraphrase.
// Verified (and pinned) not to trip any of the defence's five pattern
// categories itself: a redaction that re-triggered the defence would be worse
// than none.
export const SCHEMA_FIELD_PLACEHOLDER = "⟨schema-field⟩";

// The token class, byte-for-byte the source of the `schema_field_injection`
// pattern in injection-defence.ts.
//
// WHY HARD-CODED RATHER THAN PARSED AT LOAD: parsing the TypeScript module at
// hook-fire time would make every hook depend on a file outside the harness
// tree, on a path that must be resolved at runtime, in the hot path of an
// action the agent is waiting on. The honest alternative is to hard-code and
// then ASSERT non-divergence in a battery that re-reads the real source — see
// __tests__/schema-redaction.test.mjs, pin DIV-1, which fails RED the moment
// the defence's list changes. This project has been bitten repeatedly by
// hand-copied constants going stale (perimeter counts, extension counts, PR
// ranges); the lesson learned each time is that an executing check beats a
// written instruction, so there is one here.
export const SCHEMA_FIELD_PATTERN_SOURCE =
  "\\b(distress_detected|distress_signal|shouldRedirect|redirect_message|is_kathekon|passions_present|layer1-schema|layer1_schema|severity\\s*[:=]\\s*[\"']?none)\\b";

/**
 * Replace every `schema_field_injection` token with the placeholder.
 *
 * Deterministic and total: a non-string yields the empty string with a zero
 * count; text with no tokens is returned BYTE-IDENTICAL (the only
 * transformation this module ever performs is the replacement itself).
 *
 * ORDERING: call this LAST, after any truncation or composition, so the count
 * reflects what is actually sent. A token split by an earlier truncation is
 * left alone deliberately — a fragment like `distress_det` is not a match for
 * the defence's `\b`-anchored alternation either, so it cannot fail the call
 * closed and does not need replacing.
 *
 * @param {unknown} text
 * @returns {{ text: string, count: number }}
 */
export function redactSchemaFields(text) {
  const s = typeof text === "string" ? text : "";
  if (!s) return { text: "", count: 0 };
  const re = new RegExp(SCHEMA_FIELD_PATTERN_SOURCE, "gi");
  let count = 0;
  const out = s.replace(re, () => {
    count++;
    return SCHEMA_FIELD_PLACEHOLDER;
  });
  return { text: out, count };
}

/**
 * Convenience for an optional field: returns `undefined` for absent/empty
 * input so a caller can spread it into a request body without inventing a key.
 * @param {unknown} text
 * @returns {{ text: string | undefined, count: number }}
 */
export function redactOptional(text) {
  if (typeof text !== "string" || !text) return { text: undefined, count: 0 };
  return redactSchemaFields(text);
}
