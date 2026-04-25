Governing frame: /adopted/session-opening-protocol.md

I am opening a new session in the tech stream. The previous session (26 April 2026) opened on a brief titled "wire engine-mentor-ledger" and was redirected after read-and-report found that `sage-mentor/mentor-ledger.ts` is a pure type/logic module with zero database calls and zero callers in `/website/src`. The redirect produced ADR-PE-01 v1 draft, which resolves D-PE-2 (b) — pattern-engine storage location — by selecting Option 3 (field inside the encrypted profile blob, hub-keyed). The previous session ended at "ADR draft + handoff" by design; no code was written.

This session continues from there.

I use **GitHub Desktop** to push commits. If any code lands this session, give me explicit GitHub Desktop instructions (open GitHub Desktop → confirm Current Repository = `sagereasoning` → click Push origin → wait for spinner) per commit, in the same pattern the prior tech-stream sessions used.

---

**Before touching any code, complete the session opening protocol:**

- Tier declaration: this is a code/tech session. Read tier 1, 2, 3, 6, 8, 9 (every-session sources + KG governance scan + code state).
- Read the most recent handoff in `/operations/handoffs/tech/`:
  `2026-04-26-mentor-ledger-wiring-redirected-to-ADR-PE-01-close.md`
  Read end-to-end. The "Decisions Made", "Status Changes", "Next Session Should", and "Decision Log Entries — Proposed" sections are the load-bearing parts.
- Read the ADR draft in full:
  `/drafts/ADR-PE-01-pattern-analysis-storage.md`
  Specifically §3 (Decision), §5 (Encryption pipeline impact), §8 (Single-endpoint proof sequence), §10 (Rollback), and §12 (Open items).
- Scan `/operations/knowledge-gaps.md` for any entry touching encrypted-blob writes, hub-label end-to-end contracts (KG3), or JSONB shape (KG7). KG1 rule 2 (await all DB writes) and KG3 (hub-key validation) will be the most relevant if code lands.
- Confirm P0 hold-point status — should still be active. Pattern-engine integration sits inside the assessment set.
- Confirm model selection (PR4) is not engaged at the ADR-decision level. If the session moves into implementation, the loader's model selection (if any LLM in path) is a checkpoint, not a discovery.

---

**Step 1 — ADR-PE-01 decision.**

I have three exits from this session:

- **Approve as-is.** I signal "approve ADR-PE-01" or equivalent. The session's first action is to move the file from `/drafts/ADR-PE-01-pattern-analysis-storage.md` to `/compliance/ADR-PE-01-pattern-analysis-storage.md` per the D6-A archive protocol, change the **Status:** line from "Draft (proposed for founder approval)" to "Accepted — founder approved on [today's date]", and add a decision-log entry adopting it (proposed entry ID `D-ADR-PE-01` from the close handoff). Standard risk. No code yet.
- **Request edits.** I name the sections and the changes I want. The session that applies the edits is Standard risk (documentation only). The file remains in `/drafts/`.
- **Reject and pick a different option.** If I want one of Options 0 (no persistence), 1 (sidecar table), or 2 (plain JSONB column) from the four-option comparison surfaced last session, the session redrafts the ADR around the chosen option. Standard risk for the redraft itself.

Do not assume which exit I am taking. Ask me directly: "Approve as-is, request edits, or reject?" Wait for my answer.

---

**Step 2 — If approved, pick the implementation entry point.**

Two candidate framings for Session 1 of the staged transition (per ADR-PE-01 §8):

- **Option 1A — Pattern-data write on the proof endpoint first.** Add the read-modify-write surface to `/api/mentor/ring/proof` (already wired against `PROOF_PROFILE` + `PROOF_INTERACTIONS`) so the proof endpoint becomes the first surface to actually persist pattern data inside the encrypted blob. Critical under PR6. Rollback contained — the proof endpoint is founder-only traffic.
- **Option 1B — Loader build first, then the storage wiring on the proof endpoint.** Build the live `mentor_interactions` loader (D-PE-2 (c), hub-scoped per my 2026-04-26 direction) first, prove it on the proof endpoint, *then* wire pattern-data persistence in a second session. Splits Critical risk across two sessions.

Surface both options with brief reasoning. I pick.

---

**Step 3 — Critical Change Protocol (0c-ii) requirements.**

If I pick 1A or 1B and signal "build", the session is Critical under PR6 (encryption-pipeline blast radius). All five steps of the Critical Change Protocol must appear in the conversation before I deploy anything:

1. **What is changing** — plain language. No jargon.
2. **What could break** — the specific worst case for this change.
3. **What happens to existing sessions** — does this affect users currently signed in?
4. **Rollback plan** — exact GitHub Desktop steps I can run independently to return to a known-good state.
5. **Verification step** — what URL I visit, what I expect to see, what to do if the result is different.

Cannot answer one of those? Stop and signal "I need your input" or "This is a limitation."

PR3 applies — pattern-engine call is synchronous, no fire-and-forget on the write side. KG1 rule 2 applies — await every Supabase write. KG3 applies — hub-key validation must be explicit on the writer and reader sides. KG7 — inside the encrypted blob the column is ciphertext; KG7's array-shape discipline is moot at the column level but applies if any optional `last_pattern_compute_at` plain column is added (per ADR §4.3 and O3 — defer per the ADR's default).

---

**Step 4 — Acceptance criteria.**

This session ends successfully if **at least one** of these is true:

- ADR-PE-01 promoted from `/drafts/` to `/compliance/` with adopted decision-log entry. No code. Standard risk only.
- ADR-PE-01 draft revised per my edits and remains in `/drafts/` for another review pass. Standard risk only.
- Implementation Session 1 (1A or 1B) reaches Verified status: TypeScript clean (`npx tsc --noEmit` exit 0 in `/website`), the relevant single-endpoint proof passes a live-probe (Bearer-token Console snippet pattern from prior tech sessions), the founder pushes the commit via GitHub Desktop, Vercel reaches Ready, founder confirms the round-trip works. Critical risk under PR6.
- The session ends earlier with a clear "I'm done for now" signal from me. Stabilise and close. Do not propose additional fixes.

---

**Step 5 — Session close.**

Per the protocol Part C, produce a handoff at session end in the required-minimum format plus the relevant extensions (Verification Method Used / Risk Classification Record / PR5 Knowledge-Gap Carry-Forward / Founder Verification / Decision Log Entries — Proposed). Save to `/operations/handoffs/tech/[YYYY-MM-DD]-[short-description]-close.md`. Name the protocol explicitly as the governing frame at close.

If the session involved code and I pushed via GitHub Desktop, the handoff's "Founder Verification" section names the pushed commit hashes and the live-probe result.

---

**Carry-forward open items (do not address unless I bring them up):**

- O-S5-A — `/private-mentor` chat thread persistence (pre-existing UX gap).
- O-S5-B — write-side verification of ADR-Ring-2-01 4b (deferred until natural triggering).
- O-S5-D — static fallback canonical-rewrite revisit.
- O-PE-01-A through O-PE-01-E — five open items inside ADR-PE-01 (read amplification, blob-size monitoring, optional `last_pattern_compute_at` column, write cadence, backfill of existing profiles). These activate only when implementation begins.

---

**Do not write any code until I have signalled approval of ADR-PE-01 (Step 1) AND picked an implementation framing (Step 2) AND the Critical Change Protocol (Step 3) is satisfied with my explicit "OK / go ahead" naming the listed risks.**

If I am only approving the ADR and not asking for implementation in this session, that is a complete and successful session. Do not push for code.
