# M-5(a) — R18 public-disclosure sign-off package

**Authored 2026-08-17. Status: DRAFT — AWAITING FOUNDER SIGNATURE. Nothing here has been applied.**
**Governing ruling:** `2026-08-16-mentor-rulings-M1-M5-r2b-verbatim.md` §M-5(a) (binding).
**R18:** founder sign-off on the exact wording is required **before** any public surface changes.

---

## 1. What the grounding actually found — and why this package is an ADDITION, not a correction

The ruling anticipated a false public claim to amend. **There isn't one.** Verified first-hand on
every primary R18 surface — `website/public/llms.txt`, `website/public/.well-known/agent-card.json`,
`website/src/app/api-docs/page.tsx` — a grep for `escalat` / `human review` / `reviewer` /
`moderation queue` / `vulnerability` returns **zero hits on all three.**

What the public surfaces do say is accurate. `llms.txt:1037-1039` describes detection, the redirect
payload, the verbatim resource list, and flow termination. It claims no human review, no queue, and
no flag write. That is honest and needs no correction.

**So M-5(a)'s claims obligation was discharged internally**, and that work is done (see §5). The
false posture lived in two internal compliance documents, and both are now corrected in place:

- `compliance/R20a-vulnerable-user-protections.md` — §3's flow steps 3–5 now carry
  `[DESIGNED — NOT BUILT]`, §4's SLA table is marked not-in-force, and a current-state block quotes
  the ruling verbatim.
- `compliance/ADR-R20a-01-classifier-pipeline.md` — §1's present-indicative third clause is annotated
  as false.

**This package exists because the grounding found a second, separate falsehood the ruling did not
name**, and closing it honestly requires a founder decision rather than an AI edit.

## 2. The second falsehood — a public disclosure claimed but never made

`R20a-vulnerable-user-protections.md` stated that the acute-crisis gap was *"Disclosed to users via
the limitations page (R19c) and the terms of service."*

**It is not.** Verified first-hand: `limitations/page.tsx` and `terms/page.tsx` contain no mention of
a queue, a reviewer, escalation, flagging, or post-session monitoring — zero grep hits on all six
terms across both files.

The internal claim has been corrected to say so. But that leaves the substantive position:
**a practitioner in acute distress receives an immediate in-session crisis redirect with verbatim
resources, and nothing happens afterwards — no flag, no queue, no follow-up — and we have never told
them that.** Deleting the false internal claim removes the record's dishonesty without addressing
the practitioner's position.

Whether to make the disclosure real is yours. The AI recommendation is **Option A below**, on the
grounding that R19c (honest positioning) already governs this exact class of statement, and that the
absence of follow-up is precisely the sort of limitation a practitioner would want to know before
confiding.

## 3. Candidate wording — for the `/limitations` page

**A practitioner-facing register is required here, not the ruling's developer register.** The
ruling's own sentence ("no live write path for real detections") is correct but unreadable to the
audience that needs this.

### Option A — recommended. Add to `/limitations`.

> ### What happens if you are in crisis
>
> If what you write shows acute distress, SageReasoning stops the philosophical response and shows
> you crisis resources immediately, in the session. That happens automatically, every time, and it is
> the protection this system actually provides.
>
> **What does not happen: nobody is notified, and no one follows up afterwards.** There is no queue, no
> on-call reviewer, and no monitoring of your session after you close it. The crisis resources we show
> you are the whole of it — they are not an introduction to a human who will make contact.
>
> This is a real limitation of a system built and run by one person, and we would rather state it
> plainly than let the presence of a safety feature imply a safety net that is not there. If you need
> a person, please use one of the numbers shown — they are staffed, and we are not.

### Option B — minimal. One sentence, added to the existing limitations list.

> SageReasoning shows crisis resources immediately when it detects acute distress, but no person is
> notified and no one follows up after your session — the resources shown are the whole of the
> response.

### Option C — decline to disclose publicly; correct only the internal record.

Defensible position: the public surfaces make no false claim, so R18 is not engaged, and the internal
correction (§5) fully discharges M-5(a) as ruled. The AI does not recommend it — the honest-positioning
rule R19c is about not letting users infer more protection than exists, and a crisis redirect with no
stated limit invites exactly that inference — but the ruling's literal text is about amending a false
*public claim*, and there is none, so this option is genuinely within the ruling.

## 4. Two adjacent public honesty items — found in passing, NOT part of M-5(a)

Surfaced by the same grounding sweep. Neither is the R20a escalation claim; both are the same failure
class (a promise of human availability that is not operationally true). **Flagged for your direction;
no edit made.**

1. **`website/src/app/transparency/page.tsx:170-174`** — a live public page, under the heading
   *"Human oversight"*, states: *"If you have concerns about any AI-generated output, you can always
   contact a human at support@sagereasoning.com."* CLAUDE.md records go-live item **#11 as OPEN**, with
   the founder having confirmed directly that neither `support@` nor `zeus@` is watched on any regular
   cadence. *"You can always contact a human"* is therefore a public promise that is not kept. This is
   arguably **more serious than the M-5(a) item it was found beside**, because it is public,
   practitioner-facing, and live today.

2. **`website/src/app/ops-hub/page.tsx:638` and `:918`** — *"All alerts are monitored by Sage Ops.
   Critical alerts require acknowledgment within 2 hours"* and *"Items flagged for review are queued
   above."* An independent check found no `middleware.ts` anywhere in the project, no auth primitives
   in `ops-hub/page.tsx` or its layout, and `robots.txt` disallowing `/admin`, `/auth`, `/dashboard`,
   `/api/admin` but **not** `/ops-hub` — so the static copy appears to render to anonymous visitors
   even though its data calls 401. **This needs a first-hand live check before anything is concluded**;
   I have not verified it against production. If it is public, a 2-hour acknowledgment commitment sits
   on an indexable URL.

## 5. What has already been applied (no signature required — internal records only)

| File | Change |
|---|---|
| `compliance/R20a-vulnerable-user-protections.md` | §3 current-state block quoting the ruling; steps 3–5 marked `[DESIGNED — NOT BUILT]`; §4 SLA table marked not-in-force; §4 resource-visibility line split into its live and unbuilt halves; the acute-crisis-gap paragraph's reviewer presupposition and its false "disclosed to users" claim both corrected |
| `compliance/ADR-R20a-01-classifier-pipeline.md` | §1's false third clause annotated, with §5/§6 explicitly excluded as decision and forward-looking build records |

**Deliberately NOT changed:** `supabase/migrations/20260416_r20a_vulnerability_flag.sql`. An earlier
review characterised it as carrying the false posture; on reading it first-hand, line 45 already says
*"populated during queue review (Phase F)"* — it names the future phase honestly and needs no
correction.

**Recorded but not changed:** `r20a-classifier.ts:39`, the live stage-2 system prompt, instructs the
model *"You are NOT diagnosing. You are flagging for human review."* Never served to any user, so not
a public claim — but it means the false posture is embedded in a live code path and not only in
documents. It should be revisited when the M-5(b) write path is built, since at that point it becomes
true.

---

## 6. Signature

- [ ] **Option A** — full `/limitations` disclosure as drafted *(AI recommendation)*
- [ ] **Option B** — one-sentence minimal disclosure
- [ ] **Option C** — no public change; internal correction only
- [ ] Amended wording (write below)

- [ ] **Adjacent item 1** (`transparency` support@ promise) — direct: ______________________
- [ ] **Adjacent item 2** (`ops-hub` monitoring copy) — verify gating first, then direct: ____________

**Founder signature / date:** ______________________

*Nothing in this package is applied until the relevant box is ticked. If Option A or B is signed, the
applying session must re-derive every cited line before editing, and any drift returns here.*
