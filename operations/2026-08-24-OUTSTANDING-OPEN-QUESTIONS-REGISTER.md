# Outstanding open questions — register as at 2026-08-24

**Authored 2026-08-24.** A read-only snapshot. **Nothing here is a ruling, a decision, or a build
item.** Documents only.

> **SCOPE OF THE CHECK, stated because it determines how much this can be trusted (PR20/PR25
> discipline applied to prose).** This register was built from: (i) items this session verified
> first-hand at source; (ii) an explicit-marker sweep of `operations/agent-circles-2026-08/`,
> `primal-substrate-2026-08/`, `connective-layer-2026-08/`, `reflections-examination-2026-08/`; and
> (iii) the open/parked/gated items named in `operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md`.
> **It is NOT an exhaustive project-wide sweep.** Section E is transcribed from `/CLAUDE.md` and is
> **unverified here** — that file's own header warns its counts and statuses drift, and this session
> did not re-derive them. Treat A–D as checked and E as a pointer list.

---

## A. Awaiting a mentor ruling — nothing can proceed without it

| # | Question | Where | Blocks |
|---|---|---|---|
| A1 | **Cybernetics instruction — 4 questions** (routing to a closed session; the weights-BLOCKED collision in GS-CYB-1; Task 4 growing the live extraction prompt; the ordinal-vs-numeric proximity scale) | `2026-08-24-MENTOR-QUESTIONS-cybernetics-instruction-routing-and-weights.md` | All four tasks of `inbox/Mentor Cybernetics Instructions.rtf`. **Tasks 1–3 look executable once A1's routing half is settled.** |
| A2 | **Kathekon role-relative evaluation** — should candidate evaluation be role-relative? Gap confirmed **total**: `/api/guardrail` takes no role input | `2026-08-12-SESSION-kathekon-role-relative-evaluation-SCOPING-RECORD.md` | OPEN, awaiting ruling |
| A3 | **Hegemonikon drift + melete — the uniformity-reads-as-stable family** (3 items, *"ruled together or not at all"*): the guide-reflection recurring-corroborated-patterns reading; the trust-record reading of the same; the conflation itself | `2026-08-12-SESSION-hegemonikon-drift-and-melete-SCOPING-RECORD.md` (items 1–4 RULED 2026-08-15; this family still OPEN) | OPEN. **Ruled 2026-08-24 NOT to receive §5d** — the family is not expanded |
| A4 | **Layer 3 per-consumer rendering** — re-open the S7 internal-only decision? Plus the Stage 2 reframing: what does the guide need to know about the practitioner's relational context? | `2026-08-12-SESSION-layer3-per-consumer-rendering-SCOPING-RECORD.md` | OPEN. `SUBSTRATE_LAYER3_ENABLED` activation **not licensed** |

## B. Awaiting a founder election — no ruling needed, but AI should not choose

| # | Question | Where |
|---|---|---|
| B1 | **The named-input mechanism has no register.** Named inputs are held across ~a dozen documents for at least three unopened sessions, with no surface a receiving session reads at open. Five shapes offered incl. a genuine do-nothing | `2026-08-25-named-input-register-and-concurrency-mechanism-NEXT-SESSION-PROMPT.md` Item 1 |
| B2 | **The concurrent-session coordination mechanism.** Condition met — concurrency bit two consecutive sessions (ten peers; HEAD moved mid-session). Would become PR26 if adopted | same prompt, Item 2 |
| B3 | **Is `inbox/Mentor Cybernetics Instructions.rtf` relayed as binding?** By project convention a mentor instruction binds on the founder's relay; it currently sits unadopted in `inbox/` | this session |

## C. Open by ruling — parked with a named gate, not to be opened early

| # | Item | Gate |
|---|---|---|
| C1 | **§5d — is oikeiosis-only the doctrinally right reading of a deliberating ruling faculty?** OPEN and UNDESIGNED. Routed 2026-08-24 to the standing-runner design as a named input; resolution is **engine-class, `code-critical`** | The standing-runner design, itself gated on the bounded validation run's §6 report reaching the mentor |
| C2 | **Standing-runner design** — *"not to be pre-scoped"* | §6 report |
| C3 | **ATRF scoping session** — *"do not open early"*; holds GS-ATRF-1..4 + S3's mechanism design + S5's agent-profile architecture + S8's GS-ATRF-3 build + the sufficiency-examination content spec + the boulesis/normative-gap distinction | Post-validation-run |
| C4 | **S4's watching-table extension** (additive migration, its own founder-walked Critical step) and **S6's reordering decision** | §6 report |
| C5 | **Melete** — deferred until an agent-side rehearsal surface exists (R-4) | That surface's own session |

## D. Blocked by a standing guard — named, not attempted

| # | Item | The block |
|---|---|---|
| D1 | **The sympatheia citation defect** — `stoic-brain.json:151` mis-cites Marcus's interweaving line as 4.26; it is **7.9**. Elevated by ruling from cosmetic to **load-bearing**. `/logos` was corrected 2026-07-16; the corpus root was not | `stoic-brain` matches the byte-identity guard's regex; editing it turns the guard red on two measured surfaces (`/api/reason` **and** `/api/guardrail`) |
| D2 | **The L4 audit header amendment** (P1's reciprocal half) — exact text recorded in the decision log | `l4-passion-audit.ts` sits inside the guard's measured set. **A collision between two standing instructions, surfaced not routed around** |

## E. Named-and-unbuilt — POINTER LIST, transcribed from `/CLAUDE.md`, **NOT verified this session**

Re-derive each from source before acting. `/CLAUDE.md`'s own header warns its statuses drift, and this
section is exactly the class of claim that drifts.

- **Register D4** — the trust-event reducer's self-circle narrowing (the predicate was narrowed 2026-07-19; the reducer was not). `code-critical`.
- **AE-3** — the last agent-extension slice.
- **P1 / P6 / P7 / P8** — founder console; Layer-1 extraction battery; guard-path capture + the new false-hold observation window (the 130-record buffer is frozen; the clock is stopped).
- **C1c** — from the original build plan.
- **`/api/reason` status-masking fix**; the **reflect-path `loop_id` UUID metering bug**; the **`target_circle` / blast-radius persistence gap**.
- **The app-wide RLS-vs-route-enforcement gap** — surveyed 2026-08-16 into Classes A/B/C; `impulse_entries`, `founder_conversations`/`_messages`, the three open-INSERT tables, and `mentor_profiles` are closed; the rest of the backlog is the founder's ordering. **Standing guidance carried: a table-level RLS fix is invisible to a `SECURITY DEFINER` function writing the same table.**
- **Two LOW findings on `founder_conversations`** — plaintext at rest where siblings encrypt; no data-rights or retention wiring.
- **`api/mentor/private/reflect/route.ts:660`** still honours a body-supplied `user_id` on a reflections insert — the application-layer twin of a closed database hole.
- **Resend / email provisioning** — founder-performed; blocks Stoa subscriptions.
- **The `agent_hold_observations` retention gap** (PR24's own named exception).

## F. The standing hold

**The 0h launch call remains the founder's**, and nothing in A–E bears on it. **Weights BLOCKED**
throughout — see A1/Q2, which is the first item in months to press directly on that constraint.
**The Q1 hard constraint holds: the loop proposes; it never executes.**

---

## Cross-references

- `operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md` — the primal-substrate family's own register and the gates table (source for C)
- `operations/agent-circles-2026-08/2026-08-23-evaluative-engine-status-documentation-map.md` §5d (C1)
- `operations/handoffs/founder/2026-08-25-named-input-register-and-concurrency-mechanism-NEXT-SESSION-PROMPT.md` (B1, B2)
- `operations/decision-log.md` — the authoritative trail; this register is a convenience, never a substitute

*End of register. Read-only; nothing decided.*
