> **RULED 2026-09-05** — Part 2 — elect 2b now; do NOT build route (i); flag-and-proceed if ever elected. Verbatim (canonical): `operations/count-discipline-2026-09/2026-09-05-mentor-rulings-five-relays-verbatim.md`; adopted `D-MENTOR-RULINGS-FIVE-RELAYS-ADOPTED-2026-09-05`.

# Mentor question — what is caller-supplied extraction for, and should route (i) be built now?

**Authored 2026-09-03.** `governance`, documents only. **Nothing here is a recommendation to build
anything**, and nothing here elects a fix. No code, migration, flag, credential, or public surface was
touched. Weights BLOCKED.

**Why this question exists.** `2026-08-25-mentor-ruling-extraction-provenance-fix-choice-verbatim.md`
(Q3, binding) ruled route (i) must NOT be decided as a side effect of the provenance-gap fix, and must
be scoped as its own session — *"what is caller-supplied extraction for?"* — with the disagreement
policy, the plugin-path consequences, and the Arm-B relationship named as required inputs. That
session has run: `2026-09-03-route-i-what-is-l1-supply-for-SCOPE.md`. This document distills it into a
ruling-ready question, per PR20's requirement that mechanism facts be stated explicitly before a
ruling lands on them.

---

## PART 1 — The mechanisms this ruling lands on

**M1 — `l1_supply`'s one documented purpose.** `route.ts:20-21` — plugin-authenticated callers submit
a pre-computed Layer1Schema because the plugin already runs Layer 1 locally with its own model,
avoiding a second server-side extraction call. `presetForPurpose` grants the capability to two
presets, `ecosystem` and `plugin_install` (`practice-credential.ts:216-220`); only the second has a
stated reason in the codebase.

**M2 — Current exposure is zero.** No active credential carries `l1_supply` anywhere in the system
(the population query, item 2a, 2026-08-25; both prior holders were dead test artifacts, both
revoked). This is a point-in-time fact, not a permanent property.

**M3 — The live ENFORCE surface is already immune.** `/api/guardrail`'s route and sandwich have zero
`layer1_schema` occurrences; its body destructure is closed to a fixed field set. Arm B cannot reach
the surface that binds a proceed/block decision, with or without route (i).

**M4 — Route (i) does not unblock weights.** Weights use is BLOCKED by the self-report-omission class
(A2 — an honest extractor faithfully recording a narration that omits real harm), which route (i) does
not touch (`memory: gaming-robustness-extraction-trust-locus-split`). Closing Arm B alone does not
change the weights disposition.

**M5 — What Arm B actually threatens, given M2-M4:** the `/api/reason` consult response and the
public trust-record/accreditation surface — not ENFORCE, not weights.

**M6 — `l1_supply` is mandatory on the plugin path** (`route.ts:554-568`: absent/null `layer1_schema`
on that auth path is a 400). Under three of the four disagreement-policy shapes worked in the scope
document's §3, route (i) either permanently taxes or functionally eliminates the ONE documented reason
the capability exists.

**M7 — Item 2b (narrow `l1_supply` out of the `ecosystem` preset) is already carried, un-prioritised,
and was not previously compared against route (i) as an alternative mitigation for the same threat.**
After 2b, the only remaining `l1_supply`-capable population is `plugin_install` credentials — a
narrower, structurally more accountable caller class (a plugin author vouching for their own agent's
extraction with their own credential, not an arbitrary public caller).

---

## PART 2 — The question

**Q1. Should 2b (narrow `l1_supply` out of the `ecosystem` preset) be elected now, independent of any
route (i) decision?**

The scope document's recommendation: yes — it is cheap, reversible, already carried, and converts the
general-population Arm-B threat into a single-caller-class threat with a materially stronger
accountability posture, at a fraction of route (i)'s cost.

**Q2. Should route (i) be built at all, given M2-M6 — and if the answer is conditional on the post-2b
residual, what should trigger revisiting it?**

The scope document's recommendation: not now. The case against building it is stronger than the
2026-08-25 scoping found, because that document analysed route (i) against the full `l1_supply`
population; after 2b the remaining population is smaller and more accountable, lowering route (i)'s
marginal benefit further while its cost (M6) is unchanged.

**Q3. If route (i) is ever elected, which disagreement policy?**

Four options are worked in the scope document's §3: reject-on-disagreement (re-opens closed
over-strictness), take-the-stricter (safe but biased, untested against a two-field attack), take-the-
server's (makes the supplied schema decorative — de facto deprecates `l1_supply`), and flag-and-proceed
(closes nothing structurally but is honest, cheap, and introduces no new gaming class). The scope
document recommends flag-and-proceed as the starting point if route (i) is ever built, precisely
because the other three each recreate a problem this project has already spent real effort closing.

**Named residual, explicitly out of this question's scope:** whether `l1_supply` should be removed
from `plugin_install` too (eliminating the plugin path's local-extraction option entirely) is a more
disruptive question than 2b, was not asked by Q3 of the prior ruling, and is not put here.

---

## Cross-references

- `2026-09-03-route-i-what-is-l1-supply-for-SCOPE.md` — the full scoping this question distills
- `2026-08-25-mentor-ruling-extraction-provenance-fix-choice-verbatim.md` — Q3, the order to scope
  this separately
- `2026-08-25-extraction-provenance-and-independent-extractor-SCOPE.md` — the prior groundwork
- memory `gaming-robustness-extraction-trust-locus-split` — the Arm-B/A2 definitions M4-M5 rest on

*End of question. Nothing built, nothing elected.*
