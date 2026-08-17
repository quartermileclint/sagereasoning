# Next session — the gap-closure activation, M-4's execution, and two live public-honesty fixes

**Paste as the first message of a new session, in the `sagereasoning` repo root.**

**Tier: `code-critical` throughout.** Founder presence **required** — this session sets a flag on the
R20a safety perimeter and changes live public copy. **AC5 + AC7 both engage. PR19 mandatory.**

**Supersedes** `2026-08-17-M4-ruling-return-and-perimeter-gap-NEXT-SESSION-PROMPT.md` — M-4 has since
been RULED and the perimeter gap has since been BUILT. Do not work from that file.

---

## Step 0 — Open

Read: `/adopted/standing-protocol-cache.md` → this prompt in full → the close
`2026-08-17-R2b-successor-M4-returned-M5-scoped-CLOSE.md` **including its CONTINUATION section, which
supersedes the close above it** → the two decision-log entries
`D-MENTOR-RULING-M4-RETURN-ADOPTED` and
`D-R20A-PERIMETER-GAP-CLOSURE-SIX-ROUTES-BUILT-DARK-PR19-FOLDED` → the **binding**
`operations/trust-layer-2026-07/2026-08-17-mentor-ruling-M4-return-verbatim.md` **in full — verbatim
wins over every paraphrase, including this prompt** → `git status` / `git log --oneline -8`.

**Re-check the byte-identity guard's posture FIRST-HAND at this session's open.** It binds iff
`GATE1_FALSE_HOLD_CAPTURE === 'true'`, and the guard lives in
**`website/src/app/logos/__tests__/human-practitioner-boundary.test.ts`** — flag read at line 431,
binding at 450. **Two files share that basename**: the sibling under `website/src/app/reflect/__tests__/`
contains **no reference to the flag at all** and its own comment redirects to the `logos` file, so a
session grepping the bare basename can land on the wrong one and conclude the guard does not exist.
The flag was **DORMANT** throughout 2026-08-17, verified in both the process env and
`.claude/settings.local.json`. **Never infer it from a date.**

**Expected state at open.** The 2026-08-17 session committed in **two** parts:

- **`18e033a`** — Phase 1, documents only (the two corrected `compliance/` files, the three M-4/M-5
  deliverables, the first decision-log entry). **Pushed mid-session by the founder.** No `website/`
  files, so Vercel correctly did not rebuild.
- **`224e814`** — Phase 2/3: the whole gap-closure build (shared module, six `route.ts` files, the
  registry) plus the Phase-2/3 records. 16 files, pre-commit hooks passed. **Pushed; Vercel green
  (founder-confirmed).** This one DID rebuild, because it carries `website/` files — but every route is
  byte-identical flag-off, so the deploy changed no behaviour.

**So the expected HEAD at open is `224e814`.** **Do not assume it — read it.** An earlier draft of the
close asserted `17fda7e` after the founder had already moved HEAD to `18e033a`; that was caught only by
checking rather than trusting the record, which is the habit this project needs at every session open.

**Expected leftover in the working tree:** `website/src/data/environmental-context.json` only — an
unrelated stale weekly environmental scan, PR19-flagged and deliberately excluded from both commits.
Do not bundle it into this session's work either.

---

## Part A — Recommended order, and why

Four executable items. The order is a recommendation; the founder elects.

1. **Activate the gap closure.** This is the only item that makes a *live safety improvement real*.
   Six routes currently screen nothing in production.
2. **The two public-honesty fixes** — both small, both currently false in public.
3. **M-4's execution** — fully ruled, no open questions, but substantial (live signal + grade ladder +
   three R18 surfaces).
4. **The exhaustiveness backstop** — prevents the whole class recurring.

---

## Part B — Item 1: activate the six-route gap closure (`code-critical`, founder-walked)

**Built dark 2026-08-17.** Flag `SUBSTRATE_R20A_GAP_CLOSURE_ENABLED`, UNSET everywhere. Six routes:

| Route | Screened free text |
|---|---|
| `/api/mentor/passion-classify` | `description`, `user_diagnosis` |
| `/api/mentor/passion-log` | `false_judgement`, `description` |
| `/api/skill/sage-classify` | `input`, `context` |
| `/api/skill/sage-prioritise` | item descriptions, objective / criteria / stakeholders |
| `/api/mentor-baseline-response` | array of `answer` fields |
| `/api/mentor/private/baseline-response` | same, founder-only twin |

**Pre-flight (AI-run):** `tsc` 0 · `npm run build` exit 0 · `r20a-invocation-guard` **186/0** ·
re-confirm the flag is unset before the flip so "took effect" is provable.

**The walk:** commit+push FIRST → Vercel green → **then** set the flag → redeploy → smoke.
**The standing lesson applies: never flip a production flag before the code is pushed** (this project
burned a smoke that way on 2026-07-30).

**Smoke BOTH directions on EVERY route — six routes, twelve probes.** Do not sample. An acute
submission must return the redirect **with zero write / zero LLM call**; a benign one must save
normally. The two `baseline-response` routes need a `responses` array shape; the others take flat
fields. Use throwaway accounts and tear down.

**A third direction worth one probe:** a **mild** submission on one passion route and one skill route,
confirming `support_resources` rides on the response **and the request still succeeds**. PR19 found
this exact fold silently missing on the skill routes' primary path — it is fixed, but it is the part
most worth seeing live.

**Rollback:** unset the flag + redeploy (byte-identical flag-off, PR19-proven per-route).

---

## Part C — Item 2: the two public-honesty fixes

### (a) Apply R18 Option A — SIGNED, ready

The founder signed **Option A** of
`operations/trust-layer-2026-07/2026-08-17-M5a-r18-public-disclosure-signoff-package.md`. Apply the
drafted disclosure to `/limitations`: that a crisis detection produces **immediate in-session
resources and no follow-up of any kind** — no queue, no reviewer, no monitoring.

**R18 discipline:** re-derive every cited fact before editing; if anything has drifted, return to the
founder rather than adapting the wording yourself.

### (b) Correct the `ops-hub` copy — now confirmed a live false claim

**The founder verified `ops-hub` IS publicly renderable.** So `ops-hub/page.tsx:638` —
*"All alerts are monitored by Sage Ops. Critical alerts require acknowledgment within 2 hours"* — and
`:918` — *"Items flagged for review are queued above"* — are **public commitments that are not kept**
(no Sage Ops monitoring cadence exists; go-live #11 is OPEN).

**This is R18 territory: draft the corrected wording and get founder sign-off before editing**, exactly
as the `/limitations` package was handled. Do not self-author public copy.

**Also still open from the same sweep:** `transparency/page.tsx:172-173` promises *"you can always
contact a human at support@sagereasoning.com"* against a channel the founder has confirmed is
unwatched. Same class. Same R18 treatment. The founder has not yet directed this one — **ask.**

---

## Part D — Item 3: execute M-4 (`code-critical` + R18)

**The ruling is settled and the brief committed us to executing without returning again.** Read the
verbatim before building. Four obligations:

1. **Retire `disposition_stability` from agent-facing surfaces.**
2. **Let `principled → sage_like` sit structurally unreachable.** **DO NOT re-tune
   `elevated_dimension_count` or `min_dimension_level`** — the mentor names that as *the* dishonest
   option, because it *"would preserve reachability by removing the condition that made reachability
   meaningful."*
3. **Correct the mean-blindness in the dimension's internal logic** — require the mean to meet an
   adequate floor before certifying `advanced`. **The floor value is the builder's call**; the binding
   part is that the mean must be consulted and low variance on a poor mean must not certify `advanced`.
   **This does NOT restore the dimension to agent-facing surfaces** — it stops the second defect being
   carried forward whenever restoration eventually happens.
4. **Update the published disclosure to name BOTH defects** — the live one names only the perturbation
   limit, so an agent reading it *"would not learn that consistently poor reasoning also certifies as
   advanced."* **R18: founder sign-off on wording before any public surface changes.**

**Blast radius — re-derive it, do not trust this list:** six agent-facing surfaces; `llms.txt` lines
324 / 682 / 982; `agent-card.json:312`; the `does_not_attest` sentence in `trust-record-payload.ts`;
`grade-transition-engine.ts` (`dimensionsMeetFloor` / `dimensionsMeetElevated`, named in the ruling's
own "Binds" section — obligation 2 is to leave it ALONE); and three further producers of a same-named
field including the agent-facing `/api/baseline/agent`.

**⚠ HOW THE DISCLOSURE IS ACTUALLY PINNED — get this right before editing it.** An earlier draft of
this prompt said "pinned object-identical by the S10 battery." **That is the wrong mechanism.** In
`website/src/lib/substrate/trust-core/__tests__/s10-trust-record-surface.test.ts`:

- **`S2-37`** is `eq(payload.envelope, TRUST_RECORD_ENVELOPE, ...)` — strict **reference** identity. The
  test's own comment says it *"passes by construction whenever the payload ships the same (mutated)
  object — it cannot detect a missing envelope ITEM."* **It does not pin the sentence.**
- **`S2-39` and `S2-40`** are **substring** pins (`env.includes('Discriminative range')` and
  `env.includes('tested relapse-resistance rather than absence of perturbation')`) — *these* are what
  actually hold the disclosure text in place, and **these are what will fail** when you add the
  mean-blindness half.

So expect to update the substring pins alongside the disclosure, and **do not assume reference identity
protects the wording** — it does not. Re-read the test before editing.

**Also check the `/trust-layer` reference mirror tree** — it carries a second copy of
`computeDispositionStability` which may have diverged. Retiring in one tree and not the other reproduces
the exact same-name-means-different-things hazard M-4 is about.

**⚠ SPEC 4 STAYS DEACTIVATED.** The ruling says *"until the dimension is restored"* — **retirement does
NOT unblock it.** A tension with the original "carrying both" reasoning is recorded in the ruling file
and is **explicitly not yours to resolve.**

**The demonstrated defect, for your regression fixture:** thirty identical readings at *any* proximity
level — including thirty `reflexive` — currently return `advanced` at maximum confidence, because
`computeDispositionStability` (`window-aggregator.ts:535-575`) computes `mean` at `:541` and uses it
only for variance.

---

## Part E — Item 4: the exhaustiveness backstop (the highest-value follow-up)

**The gap-closure sweep count moved 2 → 4 → 6 across three passes. Six is not proven final**, and the
reason is structural: `r20a-invocation-guard.test.ts` is **purely additive** — no `readdirSync`/glob
walk over `src/app/api/` — so a seventh route with the same shape would be caught by nothing.

**Build the backstop:** a filesystem walk asserting every `route.ts` under `src/app/api/` that
(a) authenticates a human and (b) accepts free text is **either** a registered perimeter member **or**
on an explicit, documented exclusion list. The exclusion list must name the Remaining-Principles family
API routes — `/api/mentor/{premeditatio, hupexairesis, oikeiosis, oikeiosis/extension,
view-from-above, morning, sage-compass}` — and each agent-facing-by-design route.

**⚠ `/logos` has NO API route** — verified: `find website/src/app/api -ipath '*logos*'` returns nothing,
consistent with CLAUDE.md's record that #12 shipped as a static server component with "no
schema/route/table/gate/migration". **Do not put it in a route-path exclusion list** — an entry for a
path that does not exist either dead-weights the list or, if the walk validates its own exclusions,
fails. It belongs in the family's *prose* record, not the walk's data.

**Also fold in a third PR19 carry not yet in this prompt's body:** the guard's import assertions are
raw-source substring tests, so a route whose own *comment* quotes
`enforceDistressCheck(detectDistressTwoStage(...))` would satisfy the import check even with the import
deleted — `mentor-baseline-response` now contains exactly such a comment. The call-site assertions run
on comment-stripped source and are sound; the **import** assertions are not. Strip comments there too.

**Mutation-verify it**: add a fake unprotected route and confirm the battery fails.

**Two weaker candidates PR19 named and this build deliberately did NOT wire** — founder calls:
`mentor-journal-week` + its private twin (`recent_activity`, more often a system-composed summary than
personal disclosure), and `mentor-appendix` (stores answers that should be screened upstream at
`mentor-baseline-response`, makes no LLM call of its own).

---

## Part F — Carried, with questions already settled (do not re-litigate)

- **M-2** — build **with** the Q1 Phase-2 migration. Column **SETTLED: `q1_determination text` +
  CHECK**. **Founder decided: also correct FD-R2** (`countFailures`, `engine.ts:414-419` — an
  undetermined session counts as zero-failure and, as a *prior* session, can suppress a legitimate
  progress hold, the unsafe direction). Also needs: a `SageReflectSessionRow` entry, the drift-guard
  file list, and (house style) the column added to the original CREATE too. **The Q1 flag is UNSET, so
  the migration alone makes M-2 buildable, not live.**
- **M-3** — consult denominator **already correct, do not narrow it**. Elected: print-split only. The
  durable `agent_hold_observations` ledger pooling is its own founder-walked migration question. **Two
  traps:** no v4 record exists (capture off since 2026-07-17) so the frozen buffer **cannot exercise
  the split** — a synthetic fixture is required; and the live buffer is **138** records vs the frozen
  **130** with `GATE1_STATE_DIR` set, so **always pass the frozen path explicitly.**
- **M-5(b)** — its own P0 session; does not block R4. Five decisions in §8 of its scope document.
- **AC5 ratification (open, founder's call):** the six routes' perimeter membership rests on the
  builder's extension of B3, which is scoped to `/impulse` alone. Worth a mentor question; the dark
  flag means nothing is publicly asserted meanwhile.
- Untouched: AE-3 scoping, the `stoa-boundary` #20 ruling, `classifier_cost_log`'s absence from every
  data-rights path (R17c).

---

## Part G — PR19

**Mandatory** — R20a perimeter activation, a live agent-facing signal change, and public copy.
**PAUSE before launching** (founder drops the model setting). **PAUSE after** (founder restores it).

**Give it an explicit completeness dimension on the perimeter sweep again.** It found two routes the
previous two passes missed; assume it can find a seventh.

## Part H — Close

Full-form decision-log entry (Critical — things are being activated). Update the M-1..M-5 verbatim
execution table. Tick the arc plan. State plainly what remains carried and why.

## What NOT to do

- **Do not re-tune the grade thresholds** to keep `sage_like` reachable — the ruled dishonest option.
- **Do not activate Spec 4.** Ruled off until the dimension is *restored*, not merely retired.
- **Do not change public wording** (`/limitations`, `ops-hub`, `transparency`, `llms.txt`,
  `agent-card.json`, the trust-record payload) without founder sign-off on the exact text.
- **Do not treat the six-route count as exhaustive** without the Part E backstop or an independent sweep.
- **Do not narrow M-3's consult denominator** — confirmed correct.
- **Do not commit `website/src/data/environmental-context.json`** with any of this work.
- **Do not use `Edit` with `replace_all` to touch every return path in a route** — differing
  indentation silently defeats it. That is how this session's own HIGH defect was introduced.
