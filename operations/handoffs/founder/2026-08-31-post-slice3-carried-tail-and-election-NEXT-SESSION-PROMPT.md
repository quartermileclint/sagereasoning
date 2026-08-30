# Next-session prompt — post-slice-3: the carried tail, then a founder election

> **SPENT — discharged 2026-08-31.** Successor:
> `2026-08-31-post-404-alignment-verification-and-atrf-walk-NEXT-SESSION-PROMPT.md`.
> Close: `2026-08-31-trust-record-404-contract-alignment-CLOSE.md`.
>
> **Two statements in this file turned out to be wrong. Recorded so it is not later read as
> accurate:**
>
> 1. **§0's `git log origin/main..HEAD --oneline # expect empty`.** It was **not** empty — two
>    records-only commits (`5416749`, `0b3f826`, the latter being this file) were found trailing at
>    open. Nothing live was affected, but the slice-3 verification record existed only locally on a
>    checkout with twelve active peers. **Run the check; never read the expectation.**
> 2. **§1a's scoping as "one string + one pin + a commit + a deploy," `code-elevated`.** The obvious
>    one-string fix **reintroduces the fault it exists to remove** — flag-off the gaps read never
>    runs, so an unconditional clause asserts an absence nothing checked, on a cacheable response.
>    The fix is conditional. And independent review then found the **published contract itself
>    overstated** the gate on all three R18 surfaces, which pulled R18 sign-off into the work and
>    made it `code-critical` in effect. §1a's own description of the defect was accurate; its
>    estimate of the remedy was not.
>
> §1b (the mentor note) and §1c/§1d (the carried follow-ups) remain open and are carried forward in
> the successor.


**Founder: paste this file as the first message of a new session.**

Open under the standing opener first — `operations/handoffs/founder/STANDING-SESSION-OPENER-grounded-foundations.md`
(Version 2026-08-29). **That opener predates this session's window and is stale in the specific ways
listed in §0 below; where the two conflict on any fact in §0, this file wins.** Everything else in
the opener stands.

---

## §0 — What changed on 2026-08-30, and what the opener does not know

**Re-derive these yourself at open — do not trust either document:**

```
git log origin/main..HEAD --oneline      # expect empty; the 08-30 work is pushed
git status --short
```

**1. The provenance ledger's classification side cannot currently run — a finding, not a bug in
slice 3.** `classifyProvenanceArtifact` is reached only from the accreditation-write route, which
returns **409 for a `seed` write against an existing row before the emission call**. The harness close
hook sends only `kind: "seed"`, against a row that exists. **15 of 15 closes since activation logged
`already-exists`; zero `accred=written`.** Record:
`operations/agent-circles-2026-08/2026-08-30-provenance-ledger-C2-observation-input-unreachable-FINDING.md`.

**2. C2 was discharged 2026-08-30 on SCOPE's pre-ledger exclusion** — NOT on the C1 empty-population
precedent. This project told the mentor the population was empty; **that was false**, the mentor
accepted the erratum, **withdrew the original discharge**, and issued a revised conditional ruling
whose condition was verified under four independent lines.
See `…/2026-08-30-mentor-ruling-provenance-ledger-C2-reachability-verbatim.md` **§ Revised ruling**.

**3. SLICE 3 IS LIVE AND VERIFIED. C4 IS DISCHARGED.** Pushed as `df894ec` + `38bc55d`, Vercel green,
then **live-`curl`-verified against production across eight checks** (see
`D-PROVENANCE-LEDGER-SLICE3-LIVE-VERIFIED-C4-DISCHARGED`). `GET /api/trust-record/{agent_id}` now
serves `provenance_gaps` + `total_provenance_gaps_count`; the §10 attestation trigger is amended; the
ENV-1 404 gate is relaxed; all three R18 surfaces carry it (**agent-card now has 26 extensions**).

**4. Slice 3 was NOT a dark build, and the founder elected to ship it live.**
`SUBSTRATE_PROVENANCE_LEDGER_ENABLED` has been `true` in Production since 2026-08-26, so deploy WAS
the activation — **option B, elected 2026-08-30**. **Rollback is `git revert` only: unsetting the flag
would also stop the live ledger write, a standing production change.**

### The switch-on scoreboard — the spine of this arc

| | Condition | Status |
|---|---|---|
| **C1** | Every agent coheres on identity | ✅ satisfied (empty population; **re-check at switch-on is a HARD obligation**) |
| **C2** | 100% ledger-eligible artifact resolution | ✅ discharged 2026-08-30, pre-ledger exclusion |
| **C3** | 90-day soak | ⏳ **~4 of 90 days**, began 2026-08-26 |
| **C4** | The `provenance_gaps` surface live | ✅ **DISCHARGED 2026-08-30** |

**C3 is the only remaining gate and it is a clock. Slice 5 cannot happen before late November.**
There is nothing to do in this arc but not-perturb it. Do NOT open slice 5.

---

## §1 — The carried tail from slice 3 (small, and the first item is a real defect)

**1a. The 404 body under-describes its own condition — FIX THIS FIRST.** Found by the live
verification, not by a local sweep. `website/src/app/api/trust-record/[agent_id]/handler.ts` still
returns:

> *"No trust record is available for agent: X. No examined trust evidence has been folded for it
> (declaration-class records alone do not surface a public record)."*

The 404 now gates on **`no examined evidence AND no provenance-gap entry`**. All three R18 surfaces
publish both halves; the served message states one. Not false, not user-harmful — but a
documented-contract/served-message mismatch, which is precisely the class this arc exists to close.
**One string + one pin (next free number is S2-103) + a commit + a deploy.** `code-elevated`; it
touches a served public message on a live surface but changes no logic.

**1b. A mentor note is owed, and it is not urgent.** SCOPE §6.5.6's *instruction* (tie the gate to
the ledger flag) was followed; its *stated reason* — *"the change is inert until the ledger itself
ships"* — **expired when the ledger shipped four days later**. Worth putting at the next
consultation, framed as a PR20-class stale premise rather than a challenge to the ruling.

**1c. Two PR19-proposed follow-ups deliberately not taken.** `readProvenanceGaps` has **no
behavioural coverage** — two source-greps only (S2-89/S2-99), and the store is where a fabricated
count or a wrong ordering would actually originate; and `capped` × `totalCount` are independent
composer inputs with no consistency validation, so inconsistent combinations serve nonsense
("showing 2 most recent of 1 total"). Both are pin/test work, not production risk.

**1d. The §6.5.5 disclosed cost is not yet exercisable live.** A 200 carrying `aggregate.level: null`
requires a gap entry, which requires slice 5. Battery-covered (S2-82/S2-83); stated so nobody hunts
for it in production.

---

## §2 — Two standing process corrections from 2026-08-30. Read these before launching any review.

Both were earned expensively in the slice-3 session and are now in memory
(`review-isolation-must-cover-filesystem`, third section).

- **A PR19 review agent that MUTATES must work on a COPY of the tree** (`git archive HEAD | tar -x -C
  /tmp`, or `cp -R`) — **never the shared checkout.** In the slice-3 session the pin-adequacy reviewer
  behaved correctly by its own lights (SHA-verified backups, restore, confirm green) and still
  silently reverted three of the orchestrator's folds **twice**, because those folds landed inside its
  window. **If it must touch the shared tree, the orchestrator stops writing for the duration.**
- **A mutation harness must assert its mutation applied exactly once and exit non-zero otherwise.** A
  mutation that fails to apply prints a green battery indistinguishable from a passing pin. This
  happened three times before it was caught.
- **Corollary, and it bit twice:** verify a fold by **running the battery**, never by grepping the
  source — the phrases you grep for also appear in the doc comments describing them.

---

## §3 — The election. Nothing below self-starts; the founder sequences.

**Recommended default: §1a first** (it is a live public-surface defect this session created and
found, it is ~30 minutes, and leaving a known contract mismatch on a live surface while doing
something larger is the wrong order). Then elect one of:

1. **The ATRF-EE founder walk — and the recommended larger item.** `operations/handoffs/founder/2026-08-23-atrf-ee-production-wave-FOUNDER-WALK.md`.
   **FIRST VERIFY whether any of its four migration steps already ran — no decision-log record exists
   either way, so production state is genuinely UNKNOWN.** The bundle: Class-B RLS apply,
   blast-radius/S4 columns, completion-signals table + `api_keys` widening (TEST then production
   each), then push/deploy, then the optional endpoint activation. **A live unknown about production
   schema state is the most uncomfortable open item in the queue.**
2. **Housekeeping — fold 08-17 → 08-30 into `CLAUDE.md`.** It is substantially stale (last content
   edit 2026-08-23, perimeter paragraph only): it carries nothing of the R20a perimeter completion,
   the practice-family RLS lockdown, M-4/M-5, the ATRF/EE wave, the extraction-provenance thread, or
   the provenance ledger and its three slices. The standing opener's Part B plus the 08-30 decision-log
   entries are the source map. Cheap, and it compounds if deferred.
3. **The R4 activation batch** — R2b flags in the ruled order (Q1 determination → classifier shaping →
   the D4 reducer walk **last**, beginning with a founder `SELECT` of `justice_floor_active`); the new
   false-hold observation window **LAST**; `SUBSTRATE_TRAJECTORY_DISPERSION_ENABLED` excluded (M-4-blocked).
4. **The standing-runner design session (R8)** — licensed; heaviest named-input load; **completing the
   ATRF row of the named-input register is owed before it opens**, per the register's own scope note.
5. **The O-C Gate-3 design session** — licensed 2026-08-23, ruled agenda order in hand.
6. **The RLS backlog** — the view-grants remediation migration live-apply, plus a decision on the
   **escalated `vulnerability_flag_owner_view`** (a plausible full-table read on the R20a
   vulnerable-user flags table; latent, 0 rows, awaiting founder direction). And Class-B `§APPLY` if
   not folded into item 1.
7. **M-5(b) identity threading** (pass `userId`/`sessionId` at call sites — activates the built
   vulnerability-flag write path) + the `triggered_rules` encryption migration (Critical+schema); and
   the **discernment-route 503-rate diagnosis** (a named, unstarted, founder-prioritised task —
   elicitation completion fell 29.2% → 7.0% Jul→Aug, traced to 63 identical `ELICIT-OUTAGE`s).

**Held / do not open:** slice 5 (C3, ~late November); IW-7 opening 2 (signal-quality gap, by ruling);
Spec 4 dispersion (M-4 restoration); the hegemonikon uniformity family (unruled); the Prudence Stage-3
scoping session; Layer 3 activation; Resend/ST7; the S11 flip; the 0h call; **weights** (GS-CYB-1's
two-condition gate).

---

## §4 — Standing constraints, unchanged

- **Weights-BLOCKED.** **Q1 — the loop proposes; it never executes.** **The §A boundary holds.**
- **PR19 is not a formality here** — in this window independent review caught what first-hand review
  missed, again, several times, including in the slice-3 session where it falsified the session's own
  "every pin mutation-verified" claim.
- **Concurrency:** `ListAgents` at open (11+ interactive peers is normal); `git status` twice;
  **path-scoped commits — never `git add -A`**. `website/src/data/environmental-context.json` is a
  pre-existing weekly-scan stray: **leave it alone.**
- **Founder-walked discipline:** commit and push BEFORE any flag flip; this environment holds no
  production admin credential, so prod mints go through the founder's browser-session JWT.
- **Bare-SQL verification blocks**, and the SQL-editor MacRoman lesson: pure-ASCII payloads, `chr()`
  for typography, length-count verification. **Re-derive any CHECK constraint's current definition via
  `pg_get_constraintdef`** — never from a migration file's comments.
- **Nothing bears on the 0h call, which remains the founder's.**

---

## §5 — State at authoring (2026-08-30, after the slice-3 push)

- **Slice 3 live and verified; C4 discharged.** Ledger **187 rows** at last count, span 2026-08-26 →
  2026-08-30; `agent_provenance_gaps` **0 rows** and will stay 0 until slice 5.
- S10 battery **194/0** (pins through **S2-102**; next free is **S2-103**); `tsc` clean;
  `npm run build` exit 0. Regressions green: provenance-classification 14/0 · ledger-store 18/0 ·
  write-lookup-purge 33/0 · emission-hooks 19/0 · orientation 57/0 · trust-core 112/0 · sweep 43/0.
- `agent-card.json` = **26 extensions**. Sweep for the superseded trigger across `public/` and `src/`
  returns **zero**.
- The read-only C2 tally script `website/scripts/provenance-c2-discharge-tally.ts` is point-in-time
  and **must NEVER be scheduled**.
- Two small open items from 08-30, neither blocking: the **per-identity exclusion loophole** (named
  for the mentor — at switch-on it could exclude an agent that simply never consulted) and the **Q5c
  teardown gap** (`agent_accreditation` was missed; that leftover row turned out to be load-bearing on
  a readiness threshold).

**End of prompt.**
