# R20a perimeter-ordering AUDIT — every member classified on two axes, execution order traced

**2026-09-05** (machine date — `date`: Sat Sep 5 2026 AEST; HEAD at writing `a014620`). Tier
`governance`; Standard under 0d-ii; **changes no route**. Session 1 of the 2026-09-05 plan.

**Authority:** the binding mentor ruling on R20a length-guard ordering — verbatim at
`operations/count-discipline-2026-09/2026-09-06-mentor-ruling-r20a-length-guard-ordering-verbatim.md`
(authored 2026-09-05 AEST despite the label; adopted
`D-MENTOR-RULING-R20A-LENGTH-GUARD-ORDERING-ADOPTED-2026-09-06`):

> *Purpose (b) governs for human-facing members of the perimeter. The distress check runs before the
> length guard on any route where the human crisis form is rendered. The follow-on is a properly
> scoped perimeter-wide audit — its own session — to identify all human-facing members and confirm
> their execution order. The audit uses execution-order analysis, not textual position.*

**Framing, from the ruling:** *"inherited properties are not examined properties."* Nothing below
is reported as anyone's error. Every ordering here arrived either by accretion across commits or by
an author following the posture the codebase had at the time; none was chosen against the question
the ruling now answers, because that question did not exist when the code was written.

**Provenance markers (PR20):** **[SOURCE]** read from code this session · **[GIT]** read from
commit history this session · **[RECORDED]** taken from a project record, not re-observed (reason
stated). Production environment values are never [SOURCE] from a repo session.

---

## 0. The result in one paragraph

Membership re-derived from the registry arrays: **43 route-level + 2 substrate-gate = 45 members**
(30 flag-gated + 13 unconditional; 31 flag-pair entries). Every one of the 43 route-level members
authenticates a **human session** (a Supabase user JWT — `requireAuth` on 42 of them, an inline
`supabase.auth.getUser` on `/api/execute`) on at least one path and
renders the **human crisis form** on distress; two of them (`/api/reason`, `/api/execute`) also
accept an agent credential and are dual-audience. The 2 substrate-gate members are **agent-facing**
(write-class `sr_assent_`/UPC credential; developer form) and **the ruling does not reach them**.
By control-flow trace, **16 route-level members are NON-CONFORMANT** — a length guard can return
400 before the distress check is reached on a human session — carrying **39 guard sites**, of which
**9 are MINIMUM-length guards** on 7 routes (the ruling's sharpest case: a short genuine cry for help
is refused unread). **27 route-level members are CONFORMANT** (the check runs before any length
guard). The 16 are exactly the members whose check landed on or before 2026-08-03; every member
wired from 2026-08-12 (`/impulse`) onward placed the check first. **No route was changed.**

---

## 1. Method — stated so it can be checked

### 1.1 Membership

[SOURCE] Re-derived from `website/src/lib/__tests__/r20a-invocation-guard.test.ts` by reading the
array bodies, not by quoting any document:

```bash
cd website
F=src/lib/__tests__/r20a-invocation-guard.test.ts
awk '/^const HUMAN_FACING_POST_ROUTES/,/^\]/' $F | grep -cE "^\s*'src/"          # 43
awk '/^const SUBSTRATE_GATE_ROUTES/,/^\]/' $F | grep -cE "route:"                 # 2
awk '/^const FLAG_GATED_ROUTE_LEVEL_ROUTES/,/^\]/' $F | grep -cE "route:"        # 31 (pairs)
awk '/^const FLAG_GATED_ROUTE_LEVEL_ROUTES/,/^\]/' $F | grep -oE "route: '[^']+'" | sort -u | wc -l  # 30 routes
```

The 43 quoted paths sit at lines 88–320 of that file. A first awk range that ran to the file's last
`];` returned 47, because four paths at lines 1325–1328 belong to a *different* array
(`KNOWN_SPLIT_FILE_IN_SCOPE_ROUTES`, a pin for the handler-split predicate) — those four are
**perimeter exclusions**, not members, and are not classified here. The 30 flag-gated routes are
those with an entry in `FLAG_GATED_ROUTE_LEVEL_ROUTES` (`/api/mentor/stoa/draft-reflect` carries
two flags, hence 31 entries); the 13 unconditional members are the remainder.

### 1.2 Audience — decided by auth mode, never by directory

[SOURCE] For each member, the handler's authentication was read at the call: `requireAuth`
(`website/src/lib/security.ts:171`, which wraps `getAuthenticatedUser` at `:140` — an
`Authorization: Bearer <Supabase user JWT>` verified with `supabase.auth.getUser`; the human
browser session, per memory `human-routes-bearer-jwt-console-smoke`) ⇒ **human-facing**;
`validateApiKey` / `validatePracticeCredential` / `validateSageAssentWriteToken` /
`validatePluginInstallToken` (`sr_live_`/`sr_prac_`/`sr_assent_`/`sr_inst_` credentials) ⇒
**agent-facing**; both ⇒ **dual**. A `FOUNDER_USER_ID` gate after `requireAuth` narrows the
realistic caller to one human (the founder) and is recorded, not treated as an exemption — the
codebase's own precedent (`/api/mentor/private/reflect` has been a member since the original
eight) and the mentor's rule that classification is not by location.

Two members test the mentor's precision directly: `/api/skill/sage-classify` and
`/api/skill/sage-prioritise` live under `/api/skill/` and are **human-facing** (`requireAuth`
at `route.ts:64` and `:73`, no credential path at all).

### 1.3 Rendered form — located at the actual return, not a docstring

[SOURCE] The renderer defines exactly two wire shapes
(`website/src/lib/substrate/r20a-audience-renderer.ts:286–306`): `human_user` ⇒
`{ distress_detected, severity, redirect_message }`; `agent_developer` ⇒
`{ status:'redirected', distress_detected, severity, developer_note, suggested_user_message,
flow_terminated[, safety_signal] }`. Only 7 non-test source files call
`renderR20aRedirectResponse` directly — 5 of them members (score-conversation, stoa,
stoa/draft-reflect, impulse ×2, reason ×2) and 2 the substrate-gate members' sibling
`response-builders.ts` files (calling, practice/reflect) *(corrected at review from "7 of the 45
member files")*. For those, the `audience:` argument at the call site was
read. For the other 38 route-level members the form was identified from the **literal object
returned at the redirect site** and compared against the two shapes above: every one returns the
three-field human shape and none carries `developer_note`/`suggested_user_message`. The per-member
table cites the line of each return.

### 1.4 Execution order — control-flow trace, per handler

[SOURCE] For every exported write handler (`POST`/`PATCH`/`PUT`/`DELETE`) of every member, the body
was read from its first statement to the distress check (`enforceDistressCheck(...)`,
`enforceLayer2R20aGate(...)`, or the Stoa route's shared `runStoaDistressGate(...)`) **and on
through to the redirect return** (a guard between the check and the return would run after the
check but before the person is answered — none exists; §1.8 item 3b), and every
statement that can return before the check was recorded, **following helper calls made before the
check into their bodies** (`parseDeclaration`, `parseDraft`, `readJsonBody`,
`mergedDeclarationForGate`, `parseCallingBody`, `parseReflectBody`, and the imported credential
validators). No member uses a sibling `handler.ts` (checked: the only siblings are `r20a.ts`,
`vocabulary.ts`, `conversation-history.ts`, `request-helpers.ts`, `response-builders.ts`); the
registry's own note that "none of the currently registered members use this pattern" holds. The
1,851-line `/api/founder/hub` and 2,340-line `/api/reason` were read in full between handler start
and check, with comments stripped.

Each pre-check rejection was classed:
- **L — a length guard** (a maximum or a minimum on the length of a submitted string, or a count on
  a submitted array): the ruling's subject. A member with ≥1 L-class rejection on a human path is
  **NON-CONFORMANT**.
- **P — a presence/type check** (`!field`, `typeof field !== 'string'`, `trim().length === 0`)
  **on the screened field itself**: no text exists to screen, so nothing is refused unread;
  recorded, not counted. *(Narrowed at review: the first draft's rationale — "no text exists" —
  holds only when the presence check is on the sole screened field. A presence or type check on a
  **different** required field DOES refuse screened text unread: `/api/score-scenario:295` rejects
  a missing `scenario` while the check at `:321` screens only `response`; `/api/mentor/journal-feed:47`
  rejects an empty `action` while `impression` may carry distress; `/api/journal:34` rejects a
  missing `day_number`. Those are recorded in the rows and belong with §4.4's open question, not
  with "no text exists". None changes the 16/27 split — each sits on an already-non-conformant
  member.)*
- **A — auth, founder gate, rate limit; F — a feature flag that skips the check entirely; J — a
  malformed-JSON 400; O — other validation on non-text fields** (enums, ids, timestamps, numeric
  ranges, encryption-configured 503s): outside the ruling's literal terms; recorded in §4.4 and
  put to the founder as a question, not decided here.

### 1.5 The bounding-form set — established from source before scanning

[SOURCE] Over the 45 member files plus their 8 sibling helper modules (53 files, comment lines
excluded), the forms that bound input are the following. **The "Sites" column counts PRE-CHECK
sites** — the ones the ruling is about; forms that exist in the files only AFTER a check are listed
so the inventory is complete, with their (post-check, classification-neutral) locations. *(Corrected
at the PR19-by-analogy review: the first draft presented this table as a complete inventory while
counting only pre-check hits for some rows and file-wide hits for others.)*

| Form | Where it occurs pre-check | Sites (pre-check) |
|---|---|---|
| `validateTextLength(field, name, TEXT_LIMITS.*)` (`security.ts:195`; maximum-only — `if (!text) return null`) | 14 members incl. via `parseDraft` | 25 |
| inline `field.length > TEXT_LIMITS.long` | `/api/score-conversation` only | 2 |
| inline minimum `field.trim().length < N` | 7 members (N = 2, 3, 5, 10, 20) | 9 |
| local constants `FIELD_MAX`=2000, `TAG_MAX`=40, `TAGS_MAX_COUNT`=12 | `/api/mentor/stoa` `parseDeclaration` | 3 (one an array count) |
| schema / zod / `safeParse` | **none — zero occurrences in the 53 files** | 0 |
| `readJsonBody` / `request.json()` catch → 400 | stoa, draft-reflect, impulse, oikeiosis/extension, sage-compass, score/save, calling, practice/reflect | class J, not length |
| `parse*Content(body)` helpers (premeditatio, hupexairesis, view-from-above, morning, sage-compass, impulse, oikeiosis/extension) | all called **after** the check | n/a |
| **post-check only** — inline minimum (`gap4/route.ts:181`, `:188` `<10`; `founder/hub/route.ts:1282` `<2`); bare-literal maximum (`gap4/route.ts:195` `>5000`); literal-cap `validateTextLength(input, 'Input', 500)` (`evaluate/route.ts:183`); array counts `options.length > 5` / `steps.length > 5` (`score-decision/route.ts:125`; `compose/route.ts:121`); `validateTextLength` on `oikeiosis/route.ts:102` | all AFTER their route's check — recorded so a future move cannot promote one of these forms unnoticed | 0 |

**25 + 2 + 9 + 3 = 39** — the per-route table's figure exactly, with `/api/reason` `:1064`
(flag-conditional) counted and the Stoa helper's three sites counted once. *(The first fold of this
paragraph wrote "27 … = 41" and then subtracted two to reach 39; the method reviewer recounted from
§2.1 and the sweep — 25 is right and no subtraction is needed. Left visible because a wrong
reconciliation that lands on the right total is exactly the class the count discipline exists for.)*

`TEXT_LIMITS` (`security.ts:208`): short 2,000 · medium 5,000 · long 15,000 · document 30,000.
Composer caps that **truncate** (not reject) the screened subject are a separate class (§4.3):
`DISTRESS_SUBJECT_FIELD_CAP` 5,000 in `r20a-gap-closure.ts:222` and `impulse/r20a.ts:164`;
`STOA_DISTRESS_FIELD_CAP` 2,000 (`lib/stoa/stoa-r20a.ts:65`); 15,000 in
`score-conversation-r20a.ts:159`; `/api/founder/hub` passes `TEXT_LIMITS.long` as its cap
(`route.ts:1255`).

### 1.6 The mechanical check — a second method, not the method

[SOURCE] `operations/count-discipline-2026-09/2026-09-05-r20a-ordering-sweep.js` (**rev 2**,
committed with this audit; output in `…-sweep-OUTPUT.txt`) re-derives membership from the
registry, blanks comments **and string contents** length-preservingly, locates each write handler's
body via the TypeScript AST, finds the first check inside it, lists every bounding-form hit before
it, **follows every same-file function called before the check one level by AST body**, prints the
**imported** calls made before the check (so the hand-follow list in §1.8 item 3 is a printed list,
not an assumption), and **scans the window between the check and the first redirect marker** — a
guard there would run after the check but before the person is answered, the second bypass the
`format` move's reviewers demonstrated. Run:
`node operations/count-discipline-2026-09/2026-09-05-r20a-ordering-sweep.js website`.

*Revision record.* Rev 0 brace-matched a return-type literal instead of the body; rev 1 used the
TypeScript scanner, which mis-scanned a template literal's closing backtick and let one `//` line
survive. **Rev 1 was the version the first draft of this audit cited, and the audit's three blind
reviewers found three further defects in it, all fixed in rev 2:** (a) string contents were left
visible, so a check name inside a string literal counted as a call (the discarded textual sweep's
own defect class, in the false-conformance direction — demonstrated by mutation) and error-message
templates naming a limit constant counted as bounds; (b) helper following was gated to names
matching `parse*`/`validate*`/`readJsonBody`, so a same-file helper with any other name was
silently unfollowed (demonstrated: a `checkFields()` with a `.length > 99` guard produced
byte-identical output); (c) the check→redirect window was not scanned at all.

**Rev 2 output reconciles as follows.** Its **55 raw hit lines** (43 direct + 12 via helpers)
reconcile to the trace's **39 guard sites** — every disagreement resolved in the trace's favour, and
each printed with its form so the reconciliation is checkable: **8** are presence/type checks or
non-text comparisons the widened comparator set now prints and labels (`presence-zero` on
score 141, score-decision 98, score-document 102, score-social 103, reason 1028; and via
`checkPluginAuth` — reason's agent path — 413, 428 presence and 447 a buffer-length equality); **1**
is the continuation line of a multi-line call (reason 1067, part of the site at 1064); **1** is a
**cap argument to a composer, not a guard** (founder/hub 1255 — the one false positive on a
conformant member); **1** is the empty-subject skip (draft-reflect 154, `subject.length > 0` — a
*skip*, not a rejection); **2** are field-count caps inside `/api/execute`'s subject composers
(`collectStepText:40`, `collectExecuteText:26` — `acc.length >= 20`, truncation not rejection, the
§4.3 class); and the Stoa `PATCH` handler re-follows `parseDeclaration`, so its **3** lines appear
twice where the trace counts the helper's 3 sites once. 55 − 8 − 1 − 1 − 1 − 2 − 3 = **39**;
mechanically, the core-form lines less those exclusions number 42 = 39 + the 3 PATCH duplicates.
Six rate-limit config constants (`*_LIMIT` passed to `checkRateLimit`) are excluded by the script
itself and counted in its SUMMARY line. **The check→redirect window carries 0 bound lines on all 54
handlers** (2 handlers — the substrate gates — have no redirect marker in the handler body; the
window was scanned to the handler end and is also empty).

**Rev 2 was mutation-verified on a scratch copy of `website/src`** (the real tree untouched; `git
status` clean of `website/` after): a `'runStoaDistressGate(x)'` string literal inside the Stoa
`DELETE` body is **not** counted as a check (`with-check=54` unchanged); a `/** enforceDistressCheck(…) */`
block comment above that handler is not counted; an unmatched-name same-file helper carrying
`.length > 99`, called before score-conversation's check, is **followed** and its 1 bound line
printed; the `format` guard moved to sit between the check and the redirect return is reported as
**1 bound line in the check→redirect window** and flips the KNOWN-CASE boolean to `false`. Each of
those four is a defect a reviewer demonstrated against rev 1 or the discarded sweep.

### 1.7 Provenance

[GIT] For every non-conformant member, `git log -S<form> --reverse -- <route>` gave the first
commit carrying each guard form and the first carrying `enforceDistressCheck`; `git log -L<line>,<line>`
was then run on every **minimum-length** guard line (nine) and on six spot-checked maximum lines, and
agreed with `-S` in all fifteen cases *(the first draft said "fourteen" — a miscount, corrected at
review)*. One `-S` result was confounded and corrected by `-L`:
`/api/founder/hub` shows `enforceDistressCheck` from `2155c32` (2026-04-18) under `-S` because the
string appears in a **docstring** at `route.ts:363` — the exact trap the discarded textual sweep
fell into; `-L1260,1260` gives the true call-site commit `fba9b4c` (2026-08-18).

### 1.8 What this method cannot see — disclosed

1. **Flag values.** 30 route-level members run their check only when a flag reads `'true'`; when it
   does not, the check never runs and ordering is moot. Every flag's production state is
   **[RECORDED]** from its activation entry (gap-closure `SUBSTRATE_R20A_GAP_CLOSURE_ENABLED`,
   `D-R20A-GAP-CLOSURE-ACTIVATED-LIVE-PLUS-TWO-MORE-ROUTES-M4-MEAN-FLOOR-PR19-FOLDED`, 2026-08-17;
   score-conversation 2026-07-07; impulse 2026-08-12; Stoa + draft-reflect 2026-08-03; score/save
   2026-09-02; audience rendering, calling and reflect 2026-05-31) and **not re-observed** — a repo
   session cannot read Vercel. This audit classifies the flag-on execution order.
2. **Platform limits and the request pipeline.** The first draft said "there is no
   `middleware.ts`". **That check was mis-aimed:** the site runs Next 16 (`package.json`), which
   renamed the file — `website/src/proxy.ts` **exists**, carries a `matcher` config, and returns
   `NextResponse.next()` for every `pathname.startsWith('/api/')` (`proxy.ts:47–54`), so it bounds
   nothing on a member; `next.config.js` sets no `bodyParser`/`sizeLimit`; no member exports
   `config`/`maxDuration`. The conclusion survives; the check as first stated would not have found a
   body-bounding proxy had one existed *(corrected at review)*. Vercel's own request-body limits
   precede every handler and cannot be reordered by code. Not audited here.
3. **Imported validators** were followed by reading their bodies (`security.ts`,
   `practice-credential.ts`, `plugin-install-auth.ts`, the calling/reflect request helpers, and —
   omitted from the first draft's list, found by the method reviewer's AST inventory of every
   pre-check callee — `loop-id-field.ts`'s `validateLoopId`, a **200-character cap on the `loop_id`
   identifier** called at `reason/route.ts:1111` behind `isLoopIdFieldEnabled()`, returning 400 at
   `:1115`; class O — an id, not practitioner text; no classification changes). **No imported
   validator bounds practitioner text on any pre-check path.** The rev-2 sweep prints every imported
   call made before each check so this list is checkable rather than asserted. A future refactor
   that moves a guard into an imported module would still defeat the mechanical check's *bounds*
   view silently (the call would be printed; its body would not be read); the trace would find it
   only if re-run.
3a. **Handler discovery and helper following (the sweep).** The sweep finds handlers only as
   `export async function POST|PATCH|PUT|DELETE` declarations — no member uses `export const POST =`,
   `export { x as POST }`, or a wrapper (grep-verified at review); a future member written that way
   would be reported as "no check in handler", which fails loud. Same-file helpers are followed one
   level only; `${…}` expressions inside template literals are blanked with the string (verified to
   hide 0 real bounds at HEAD); a quote character inside a regex literal would be read as a string
   opener (0 instances affecting a bound line at HEAD). The `local-const` pattern matches
   `*_MAX|*_CAP|*_LIMIT|*_CHARS|*_COUNT|MAX_*` only.
3b. **The check→redirect window** is now scanned by the sweep (0 bounds on all 54 handlers at HEAD)
   and was read by the trace; the first draft's §1.4 described the trace as ending at the check and
   did not disclose the window as un-swept *(corrected at review)*. On `/api/score-conversation` the
   route's own FV-6a pin also covers it.
4. **The classifier itself has no minimum length** — `detectDistress` (`guardrails.ts:220–231`)
   runs the regex set on any string, and `detectDistressTwoStage` (declared `r20a-classifier.ts:260`;
   the stage-2 hand-off `return evaluateBorderlineDistress(...)` at `:301`) sends every regex miss
   to stage 2. A 14-character cry for help is therefore detectable **if it reaches
   the check**; on the seven routes in §4.2 it does not.
5. **No runtime probe was made.** Nothing was sent to production; no credential was minted; every
   claim is a read of source or history. The two owed Bearer-JWT smokes (F-6) remain owed.
6. **The mechanical check is textual and single-file** — a check on the trace, never a substitute
   for it (§1.6); its KNOWN-CASE line is a single boolean on the brace-matched END anchor and does
   not by itself distinguish "before the block" from "inside it" — the per-handler counts do.
7. **Non-length pre-check rejections** (class J/A/F/O, and P-class checks on a *different* field)
   are recorded but not classified against the ruling — §4.4.

---

## 2. Per-member table

Line numbers are as at HEAD `a014620`; **re-derive before trusting them** — files in this arc have
moved lines twice in one week. "Form" cites the redirect return site (§1.3). "Check" cites the
`enforceDistressCheck`/`enforceLayer2R20aGate`/`runStoaDistressGate` line reached on that handler.
Bounds: S=2,000 · M=5,000 · L=15,000 · D=30,000 (`TEXT_LIMITS`).

### 2.1 NON-CONFORMANT route-level members (16) — a length guard returns before the check on a human session

| # | Route | Audience (deciding fact) | Form (site) | Check | Pre-check length guards — form · field · bound · line | Provenance [GIT]: guard → check |
|---|---|---|---|---|---|---|
| 1 | `/api/score` | human — `requireAuth` `:134` | human literal `:157` | `:154` | max `action` S `:146`; max `context` M `:148` (both `validateTextLength`) | `aeadbd1` 2026-03-26 (general security pass) → `4ce5893` 2026-04-18 — **inherited** **[MOVED 2026-09-06, Session 3B Group 2 (`D-R20A-PERIMETER-ORDERING-REMEDIATION-GROUP-2-LIVE-2026-09-06`), LIVE — founder-pushed, Vercel green, live-smoked: the `action`/`context` maxima now sit after the check and its redirect return, with the classifier's input capped at the route's own bound; values unchanged.]** |
| 2 | `/api/score-decision` | human — `:91` | `:113` | `:110` | max `decision` S `:102`; max `context` M `:104` | `aeadbd1` 03-26 → `4ce5893` 04-18 — inherited **[MOVED 2026-09-06, Session 3B Group 2 (`D-R20A-PERIMETER-ORDERING-REMEDIATION-GROUP-2-LIVE-2026-09-06`), LIVE — founder-pushed, Vercel green, live-smoked: the `decision`/`context` maxima now sit after the check and its redirect return, with the classifier's input capped at the route's own bound; values unchanged.]** |
| 3 | `/api/score-document` | human — `:93` | `:117` | `:114` | max `text` D `:106` | `aeadbd1` 03-26 → `4ce5893` 04-18 — inherited (`wordCount < 20` at `:125` is AFTER the check) **[MOVED 2026-09-06, Session 3B Group 2 (`D-R20A-PERIMETER-ORDERING-REMEDIATION-GROUP-2-LIVE-2026-09-06`), LIVE — founder-pushed, Vercel green, live-smoked: the `text` maximum (D) now sit after the check and its redirect return, with the classifier's input capped at the route's own bound; values unchanged.]** |
| 4 | `/api/score-scenario` | human — `:286` | `:324` | `:321` (screens `response` only) | **min `response` <5 `:300`**; max `scenario` M `:308`; max `response` M `:313` (`:295` presence of `scenario` — a P check on a *different* field from the screened one; §4.4) | min `b0cecce` 03-24 (file creation); max `aeadbd1` 03-26 → `4ce5893` 04-18 — inherited **[MOVED 2026-09-05, Session 3 Group 1, `c679739`, live-smoked: the minimum-length half now sits after the check and its redirect return; presence/type half stays; maxima unchanged — Group 2.]** **[MOVED 2026-09-06, Session 3B Group 2 (`D-R20A-PERIMETER-ORDERING-REMEDIATION-GROUP-2-LIVE-2026-09-06`), LIVE — founder-pushed, Vercel green, live-smoked: the `scenario`/`response` maxima now sit after the check and its redirect return, with the classifier's input capped at the route's own bound; values unchanged.]** **[MOVED 2026-09-06, Session 3C Group 2b+3 (`D-R20A-PERIMETER-ORDERING-REMEDIATION-GROUP-2B-3-BUILT-2026-09-06`, `555502e`), BUILT — pending the founder's push and smokes: the `scenario` presence/type 400 (§4.4 P′) now sits after the check and its redirect return; values unchanged.]** |
| 5 | `/api/score-social` | human — `:97` | `:121` | `:118` | max `text` M `:110` | `aeadbd1` 03-26 → `4ce5893` 04-18 — inherited **[MOVED 2026-09-06, Session 3B Group 2 (`D-R20A-PERIMETER-ORDERING-REMEDIATION-GROUP-2-LIVE-2026-09-06`), LIVE — founder-pushed, Vercel green, live-smoked: the `text` maximum now sit after the check and its redirect return, with the classifier's input capped at the route's own bound; values unchanged.]** |
| 6 | `/api/reason` | **dual** — `requireAuth` `:715` (human) OR `validateApiKey` `:716` / plugin auth `:720` / install token `:750` (agent); audience set at `:814` from `auth.user?.id` | `renderR20aRedirectResponse` `:1165` with `effectiveAudience` (`human_user` for a session; `agent_developer` for a credential when `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` — [RECORDED] live 2026-05-31; `human_user` for everyone when unset). A7 defence-in-depth branch `:2028`, same rule | `:1148` | max `input` M `:1038`; max `context` M `:1040`; max `domain_context` M `:1042`; max `clarification_response` M `:1064` (only when `isTier1ContinuationEnabled()`, [RECORDED] live 2026-06-19, and the field is present). Also pre-check on **every** caller, class O: the `session_marker` enum 400 `:1085–1099` and the `loop_id` 400 `:1104–1113` (both flag-gated); credential-path-only 400/403s (`orientation_observations` `:962–979`; capability/schema) do not reach a human session. Non-conformant **on the human path**; unobjectionable on the agent path (purpose (a)) | `54064f5` 2026-04-02 (file creation) → `4ce5893` 04-18 — inherited **[MOVED 2026-09-06, Session 3B Group 2 (`D-R20A-PERIMETER-ORDERING-REMEDIATION-GROUP-2-LIVE-2026-09-06`), LIVE — founder-pushed, Vercel green, live-smoked: the HUMAN-path `input`/`context`/`domain_context`/`clarification_response` guards (one closure, agent path untouched at its original site) now sit after the check and its redirect return, with the classifier's input capped at the route's own bound; values unchanged.]** **[MOVED 2026-09-06, Session 3C Group 2b+3 (`D-R20A-PERIMETER-ORDERING-REMEDIATION-GROUP-2B-3-BUILT-2026-09-06`, `555502e`), BUILT — pending the founder's push and smokes: the `session_marker` + `loop_id` 400s (class O) now run after the check on the HUMAN path via a dual-site closure; the agent path calls the same closure at the original site, byte-identical; values unchanged.]** |
| 7 | `/api/reflect` | human — `:72` | `:126` | `:108` | max `what_happened` M `:84`; max `how_i_responded` M `:90`; **min `what_happened` <10 `:96`** | max `aeadbd1` 03-26; min `496d832` 03-23 → `4ce5893` 04-18 — inherited **[MOVED 2026-09-05, Session 3 Group 1, `c679739`, live-smoked: the minimum-length half now sits after the check and its redirect return; presence/type half stays; maxima unchanged — Group 2.]** **[MOVED 2026-09-06, Session 3B Group 2 (`D-R20A-PERIMETER-ORDERING-REMEDIATION-GROUP-2-LIVE-2026-09-06`), LIVE — founder-pushed, Vercel green, live-smoked: the `what_happened`/`how_i_responded` maxima now sit after the check and its redirect return, with the classifier's input capped at the route's own bound; values unchanged.]** |
| 8 | `/api/mentor/private/reflect` | human, founder-only (`FOUNDER_USER_ID` `:146`) — `:142` | `:244` | `:223` | max `what_happened` M `:162`; max `how_i_responded` M `:168`; **min `what_happened` <10 `:174`** (also `:210` boolean 400, class O) | all `9fe99f0` 2026-04-11 (file creation) → `4ce5893` 04-18 — inherited **[MOVED 2026-09-05, Session 3 Group 1, `c679739`, live-smoked: the minimum-length half now sits after the check and its redirect return; presence/type half stays; maxima unchanged — Group 2.]** **[MOVED 2026-09-06, Session 3B Group 2 (`D-R20A-PERIMETER-ORDERING-REMEDIATION-GROUP-2-LIVE-2026-09-06`), LIVE — founder-pushed, Vercel green, live-smoked: the `what_happened`/`how_i_responded` maxima now sit after the check and its redirect return, with the classifier's input capped at the route's own bound; values unchanged.]** **[MOVED 2026-09-06, Session 3C Group 2b+3 (`D-R20A-PERIMETER-ORDERING-REMEDIATION-GROUP-2B-3-BUILT-2026-09-06`, `555502e`), BUILT — pending the founder's push and smokes: the `:210` `bypass_pattern_cache` boolean 400 (class O) now sits after the check, below the moved minimum; values unchanged.]** |
| 9 | `/api/mentor/journal-feed` | human — `:38` | `:89–96` | `:87` | max `impression` M `:55`; max `assent` M `:58`; max `action` M `:61` (`:47` presence P; `:66–73` timestamp O) | `6b52fe8` 2026-04-12 (file creation) → `e43bc6a` 2026-05-31 — inherited **[MOVED 2026-09-06, Session 3B Group 2 (`D-R20A-PERIMETER-ORDERING-REMEDIATION-GROUP-2-LIVE-2026-09-06`), LIVE — founder-pushed, Vercel green, live-smoked: the `impression`/`assent`/`action` maxima now sit after the check and its redirect return, with the classifier's input capped at the route's own bound; values unchanged.]** **[MOVED 2026-09-06, Session 3C Group 2b+3 (`D-R20A-PERIMETER-ORDERING-REMEDIATION-GROUP-2B-3-BUILT-2026-09-06`, `555502e`), BUILT — pending the founder's push and smokes: the `:47` three-field presence 400 (P′) and the `:66–73` timestamp 400s (O) now sit after the check; the check is skipped on an all-empty subject; values unchanged.]** |
| 10 | `/api/journal` | human — `:26` | `:56–63` | `:54` (skipped for the `'__local__'` sentinel, by design) | max `reflection_text` M `:43` (`:34` presence P; `:38` day range O) | `aeadbd1` 03-26 → `e43bc6a` 05-31 — inherited **[MOVED 2026-09-06, Session 3B Group 2 (`D-R20A-PERIMETER-ORDERING-REMEDIATION-GROUP-2-LIVE-2026-09-06`), LIVE — founder-pushed, Vercel green, live-smoked: the `reflection_text` maximum now sit after the check and its redirect return, with the classifier's input capped at the route's own bound; values unchanged.]** **[MOVED 2026-09-06, Session 3C Group 2b+3 (`D-R20A-PERIMETER-ORDERING-REMEDIATION-GROUP-2B-3-BUILT-2026-09-06`, `555502e`), BUILT — pending the founder's push and smokes: the `:34` presence check SPLIT — `reflection_text` half stays, `day_number` half + the `:38` range 400 (O) after the sentinel block; values unchanged.]** |
| 11 | `/api/score-conversation` | human — `:103` | `renderR20aRedirectResponse` `:191–192` `audience: 'human_user'` | `:184` (flag `SUBSTRATE_SCORE_CONVERSATION_R20A_ENABLED`, [RECORDED] live 2026-07-07) | max `conversation` L `:111`; max `context` L `:117`; **min `conversation` <20 `:129`**. The `format` max at `:302` is **AFTER** the block (`:182–202`) — conformant, re-verified (§5) | max `aeadbd1` 03-26; min `496d832` 03-23 → `3de9572` 2026-07-07 — inherited; `format` moved `0126645` 2026-09-05 **[MOVED 2026-09-05, Session 3 Group 1, `c679739`, live-smoked: the minimum-length half now sits after the check and its redirect return; presence/type half stays; maxima unchanged — Group 2.]** **[MOVED 2026-09-06, Session 3B Group 2 (`D-R20A-PERIMETER-ORDERING-REMEDIATION-GROUP-2-LIVE-2026-09-06`), LIVE — founder-pushed, Vercel green, live-smoked: the `conversation`/`context` maxima — no length guard now precedes the block now sit after the check and its redirect return, with the classifier's input capped at the route's own bound; values unchanged.]** |
| 12 | `/api/mentor/stoa` (POST + PATCH) | human — `:341`/`:392`; identity `kind:'human'` `:343` | `renderR20aRedirectResponse` `:255–256` `'human_user'`, inside the shared `runStoaDistressGate` `:235` | `:247`, reached from `:356` (POST) / `:408` (PATCH) | via `parseDeclaration` (called `:349`/`:400`, BEFORE the gate): max `what_i_bring`/`what_i_seek`/`contact_channel` `FIELD_MAX` 2,000 `:150`; **count `tags` >12 `:171`**; max each tag `TAG_MAX` 40 `:176`. All four fields are in the screened subject (`stoa-r20a.ts:84–104`). Also `readJsonBody` J `:345`/`:396`; `visibility` enum 400 `:161–167` (O); `stoaClosed()` 503 when the Stoa flag is off `:337`/`:388` (F) | guards and check **same commit** `6559448` 2026-08-03 — authored together under the then-standing validate-first posture, not inherited across commits |
| 13 | `/api/mentor/stoa/draft-reflect` | human — `:131` | `renderR20aRedirectResponse` `:162–163` `'human_user'` | `:155` (both Stoa flags) | via `parseDraft` (called `:145`): max the three fields S `:114` (`validateTextLength`); `:118` presence P; `:136–142` J; `stoaClosed()` 503 `:127` (F) | same commit `f5b2ed2` 2026-08-03 |
| 14 | `/api/founder/hub/ring-proof` | human, founder-only `:134` — `:130` | human literal `:184–188` | `:168` | **min `message` <5 `:153`**; max `message` M `:160` (`:147` persona enum O) | same commit `0725be1` 2026-04-25 **[MOVED 2026-09-06, Session 3C Group 2b+3 (`D-R20A-PERIMETER-ORDERING-REMEDIATION-GROUP-2B-3-BUILT-2026-09-06`, `555502e`), BUILT — pending the founder's push and smokes: the `<5` minimum, the maximum AND the `persona` enum (O) now sit after the check and its redirect return, with the classifier's input capped at `medium`; values unchanged.]** |
| 15 | `/api/mentor/ring/proof` | human, founder-only `:106` — `:102` | `:221–225` | `:205` | **min `task_description` <5 `:118`**; max `task_description` M `:125` (`:161` hub enum O; `:196` boolean O) | same commit `90583a2` 2026-04-25 **[MOVED 2026-09-06, Session 3C Group 2b+3 (`D-R20A-PERIMETER-ORDERING-REMEDIATION-GROUP-2B-3-BUILT-2026-09-06`, `555502e`), BUILT — pending the founder's push and smokes: the `<5` minimum, the maximum, the `hub_id` enum and the boolean (O) now sit after the check, with the classifier's input capped at `medium`; values unchanged.]** |
| 16 | `/api/support/agent/proof` | human, founder-only `:124` — `:120` | `:194–198` | `:179` | **min `subject` <3 `:141`; min `customer` <2 `:147`; min `message` <5 `:153`**; max `subject` S `:172`; max `message` M `:174` (`customer` is bounded but not screened — the subject is `subject + message` `:178`; `:159`/`:165` enums O) | same commit `79974a4` 2026-04-25 **[MOVED 2026-09-06, Session 3C Group 2b+3 (`D-R20A-PERIMETER-ORDERING-REMEDIATION-GROUP-2B-3-BUILT-2026-09-06`, `555502e`), BUILT — pending the founder's push and smokes: the three minima, the two enums (O) and the two maxima now sit after the check, with `subject` capped at `short` and `message` at `medium`; values unchanged.]** |

**Guard sites: 39** (2+2+1+3+1+4+3+3+3+1+3+3+1+2+2+5). **Minimum-length sites: 9** on 7 routes
(#4, #7, #8, #11, #14, #15, #16 ×3). Maximum sites: 30, one of them an array count (#12 `:171`).

### 2.2 CONFORMANT route-level members (27) — the check is reached before any length guard on the human path

All 27 authenticate a human session — 26 via `requireAuth`, and `/api/execute` (row 41) by an
inline `supabase.auth.getUser` on the same Bearer JWT (`execute/route.ts:63–82`); founder-only
gates are marked. Every one
renders the human literal `{ distress_detected, severity, redirect_message }`. "Pre-check" lists
the non-length rejections that precede the check (classes A/F/J/O; presence checks P are after the
check on every member below except where noted). [GIT] check dates from `git log -L` on the check
line (impulse, passion-log, execute, evaluate, founder/hub) and from the family commit otherwise.

| # | Route | Auth | Form | Check | Pre-check (non-length) | Check landed |
|---|---|---|---|---|---|---|
| 17 | `/api/mentor/impulse` (POST + PATCH) | `:403`/`:528` | `renderR20aRedirectResponse` `:454–455`, `:561–562` `'human_user'` | `:447` / `:554` (flag `SUBSTRATE_IMPULSE_R20A_ENABLED`, [RECORDED] live 08-12) | J `:407`/`:532`; PATCH: id required `:536` + uuid regex `:542` (O). `parseImpulseContent` AFTER (`:467`/`:574`) | `98716d4` 2026-08-12 — **the first member to place the check deliberately before validation** (its comment at `:423` names the divergence from score-conversation) |
| 18 | `/api/mentor/passion-classify` | `:42` | `:68–72` | `:66` (gap-closure flag) | none | `224e814` 2026-08-17 |
| 19 | `/api/mentor/passion-log` | `:48` | `:75–79` | `:73` | none | `224e814` 08-17 |
| 20 | `/api/skill/sage-classify` | `:64` (**human despite the directory**) | `:99–103` | `:97` | none | 08-17 family |
| 21 | `/api/skill/sage-prioritise` | `:73` (human) | `:108–112` | `:106` | none | 08-17 family |
| 22 | `/api/mentor-baseline-response` | `:106` | `:135–142` | `:133` | none | 08-17 family |
| 23 | `/api/mentor/private/baseline-response` | `:108`, founder `:112` | `:145–152` | `:143` | founder 403 (A) | 08-17 family |
| 24 | `/api/mentor/gap4` (POST) | `:102`, founder `:106` | `:143–150` | `:141` | founder 403 (A). PATCH `:418` carries no free text (`action` enum only) — no check needed | 08-17 family |
| 25 | `/api/mentor/private/founder-facts` (PUT + POST) | `:33`/`:124`, founder `:39`/`:130` | `:68–75` / `:157–164` | `:66` / `:155` | founder 403 (A) | 08-17 family |
| 26 | `/api/mentor/premeditatio` (POST + PATCH) | `:199`/`:289` | `:219–223` / `:322–326` | `:217` / `:320` | none; `parsePremeditatioContent` AFTER; PATCH id check AFTER (`:333`) | `5db0ed8` 2026-08-18 family |
| 27 | `/api/mentor/hupexairesis` (POST + PATCH) | `:103`/`:190` | `:123–127` / `:210–214` | `:121` / `:208` | none | 08-18 family |
| 28 | `/api/mentor/oikeiosis` | `:37` | `:58–62` | `:56` | none | 08-18 family |
| 29 | `/api/mentor/oikeiosis/extension` (POST + PATCH) | `:224`/`:307` | `:247–251` / `:325–329` | `:245` / `:323` | J `:228`/`:311`; PATCH id AFTER (`:337`) | 08-18 family |
| 30 | `/api/mentor/view-from-above` (POST + PATCH) | `:155`/`:252` | `:181–185` / `:275–279` | `:179` / `:273` | none | 08-18 family |
| 31 | `/api/mentor/morning` (POST + PATCH) | `:133`/`:219` | `:153–157` / `:239–243` | `:151` / `:237` | none | 08-18 family |
| 32 | `/api/mentor/sage-compass` (POST + PATCH) | `:236`/`:340` | `:256–260` / `:360–364` | `:254` / `:358` | J `:240`/`:344`; PATCH id + uuid AFTER (`:372–376`) | 08-18 family |
| 33 | `/api/evaluate` | `:138` (gated 2026-08-18 by ruling; was unauthenticated) | `:162–166` | `:160` | none | `5db0ed8` 08-18 (`-L`) |
| 34 | `/api/mentor-journal-week` | `:87` | `:108–115` | `:106` | none | 08-18 family |
| 35 | `/api/mentor/private/journal-week` | `:74`, founder `:78` | `:102–109` | `:100` | founder 403 (A) | 08-18 family |
| 36 | `/api/mentor-baseline` | `:78` | `:99–106` | `:97` | none | 08-18 family |
| 37 | `/api/mentor/private/baseline` | `:74`, founder `:78` | `:102–109` | `:100` | founder 403 (A) | 08-18 family |
| 38 | `/api/mentor-appendix` | `:68` | `:115–122` | `:113` | encryption-not-configured 503 (`if` `:78`, return `:82–88`) (O) | 08-18 family |
| 39 | `/api/mentor-profile` | `:143` (no rate limit) | `:186–193` | `:184` | 503 `:153` (O) | 08-18 family |
| 40 | `/api/compose` | `:75` | `:94–98` | `:92` | none | 08-18 family |
| 41 | `/api/execute` | **dual** — inline session JWT `:63–82` (human) OR `validateApiKey` `:87` (agent) | `:125–129` (human literal) | `:123`, **human branch only** (`isR20aGapClosureEnabled() && authedUser` `:116`; a `hasScreenableSubject` skip when no text field is present) | none on the human branch. The agent branch is not screened at this route by recorded design (`:103–114`); the template-skill handlers it dispatches to call `detectDistressTwoStage` at `context-template.ts:112` — outside this audit | `5db0ed8` 08-18 (`-L`) |
| 42 | `/api/founder/hub` | `:1222`, founder `:1226` | `:1262–1269` | `:1260` (gap-closure flag `:1254`) | founder 403 (A). `TEXT_LIMITS.long` at `:1255` is the composer's **cap argument**, not a guard | `fba9b4c` 2026-08-18 (`-L`; the `-S` hit at 04-18 is the docstring at `:363`) |
| 43 | `/api/score/save` | `:283` | `:342–349` (status **422**) | `:318` (flag `SUBSTRATE_SCORE_SAVE_R20A_ENABLED`, [RECORDED] live 09-02) | J `:291`; fails **closed** (503 `:321`) if the classifier throws — the one member that refuses rather than proceeds unscreened | file `2277ec2` 2026-08-22; activation 09-02 |

### 2.3 Substrate-gate members (2)

| # | Route | Audience (deciding fact) | Form (site) | Gate | Pre-gate rejections | Disposition |
|---|---|---|---|---|---|---|
| 44 | `/api/calling` | **agent** — `verifyCallingToken` → `validateSageAssentWriteToken(raw, agent_id, …, 'calling')` `route.ts:184`; write-class credential, Bearer-only | `agent_developer` at `calling/response-builders.ts:231` | `enforceLayer2R20aGate` `:462` (flag `isCallingR20aEnabled`, [RECORDED] live 05-31) | rate limit; `SAGE_CALLING_ENABLED` 503 `:312`; J `:322`; `parseCallingBody` (`request-helpers.ts:41–80`: non-empty checks only — **no maximum on `response`**); token 401 `:332`; session-state 404/409/terminal `:352–417` | **Not reached by the ruling** — agent-facing, developer form, purpose (a) only. No text-length guard exists to reorder |
| 45 | `/api/practice/reflect` | **agent** — `verifyReflectToken` → `validateSageAssentWriteToken(…, 'reflect')` `:161` | `agent_developer` at `practice/reflect/response-builders.ts:319` | `enforceLayer2R20aGate` `:413` (flag `isReflectR20aEnabled`, [RECORDED] live 05-31) | rate limit; `SAGE_REFLECT_ENABLED` 503 `:284`; J `:293`; `parseReflectBody` (`request-helpers.ts:142–215`: non-empty; `signed_assessments` ≤32 entries `:205` — a count on an evidence array, not practitioner text); token 401 `:301`; zone-3 boundary `:390–404` | **Not reached by the ruling** — as above |

---

## 3. The substrate-gate disposition

The ruling applies "on any route where the human crisis form is rendered" and, for agent-facing
members, says "only purpose (a) is in play." Both substrate-gate members authenticate a
**write-class agent credential** and render the **developer form** through the shared renderer
with `audience: 'agent_developer'` at the two builder call sites cited above; neither has a human
session path. **The ruling does not reach them.** Their pre-gate parsers impose no maximum on the
screened `response` at all, so even under purpose (a) there is no length guard to place. Recorded,
left alone.

---

## 4. Findings

### 4.1 The perimeter has two ordering generations, and the boundary is a date

[GIT] Every non-conformant member's check landed **on or before 2026-08-03**: the five score routes
and `/api/reflect` (`4ce5893`, 2026-04-18), `/api/reason` (04-18), `/api/mentor/private/reflect`
(04-18), the three proof routes (04-25), the two journal routes (05-31), `/api/score-conversation`
(07-07), `/api/mentor/stoa` and `draft-reflect` (08-03). Every conformant member's check landed
**on or after 2026-08-12**: `/impulse` (08-12, whose own comment names the divergence), the
gap-closure family (08-17/18), `/api/execute`, `/api/evaluate`, `/api/founder/hub` (08-18),
`/api/score/save` (09-02). The posture flipped when the gap-closure work adopted "runs BEFORE the
route's own field validation" as its stated pattern; nobody went back to the earlier generation,
because nobody had asked the ruling's question yet.

### 4.2 The minimum-length class — nine sites, seven routes

The ruling's sharpest harm. On a human session, a submission shorter than the minimum is refused
with a 400 **before its words are read**: `/api/score-conversation` (<20 characters —
*"I want to die."* is 14), `/api/reflect` and `/api/mentor/private/reflect` (<10 — *"help me"* is
7), `/api/score-scenario` (<5), and the three founder-only proof routes (<5/<3/<2). The
classifier would detect these strings if reached (§1.8 item 4). These sit first in §6.

### 4.3 A relocated-harm class the ordering fix does not touch — screening truncation

Every composer that assembles a multi-field subject **slices** each field before the classifier
sees it (5,000 for the gap-closure and impulse families; 2,000 for the Stoa; 15,000 for
score-conversation and founder/hub; at most 20 fields in the gap-closure composer). Distress that
appears only past the cap reaches neither the classifier nor a 400 — it proceeds. This is the
residual the `format` move's own comment already discloses, generalised: it exists on **conformant**
members too, and moving a maximum guard after the check on a route that passes the raw field
(the score family, reflect, journal, journal-feed, the proof routes) will send **unbounded** text to
the classifier unless a screening cap is added at the same time. Named for Session 3's design,
not fixed here.

### 4.4 Pre-check rejections outside the ruling's literal terms — recorded, not decided

Many members can return before the check for reasons that are not length guards: a malformed-JSON
400 (class J, 8 members); a founder-only 403 (10 members); an encryption-not-configured 503
(`/api/mentor-appendix`, `/api/mentor-profile`); a flag-off 503 on the Stoa pair (`stoaClosed()`);
enum/id/boolean/timestamp 400s (impulse PATCH, journal, journal-feed, private/reflect, the proof
routes, the Stoa `visibility` enum); and, on `/api/reason`, the flag-gated `session_marker` and
`loop_id` 400s on every caller plus the capability and schema 400/403s on the credential path;
and **presence/type checks on a field other than the screened one** (`/api/score-scenario:295`,
`/api/mentor/journal-feed:47`, `/api/journal:34` — a distressed `response` / `impression` /
`reflection_text` is refused unread because a sibling field is missing; found at review). A
distressed person whose body is malformed in one of these ways also receives a bare error. The
ruling speaks of length guards; **whether its principle extends to these is a question for the
mentor, put to the founder here and not answered.** Presence checks on the screened field itself
(class P proper) are different: no text exists to screen.

### 4.5 Two members are dual-audience, and only their human path is bound

`/api/reason` accepts a session, an API key, a plugin credential or an install token, and renders
the form by caller (`:814`); `/api/execute` accepts a session or an API key and screens the human
branch only. The ruling binds the human path of each; the agent path's guard placement is
unobjectionable under purpose (a). Any move on `/api/reason` changes a file inside the measured
surface — see §6, sequencing.

### 4.6 One member fails closed

`/api/score/save` returns 503 rather than proceeding if the classifier throws (`:319–325`) — the
only member where an unscreened outcome would be a durable write. Not an ordering matter; recorded
because Session 3 should preserve it.

### 4.7 Known-case re-verification

`/api/score-conversation`'s `format` guard (`:302`) sits after the structural end of the R20a block
(`:182–202`) — confirmed by the trace and by the mechanical check's brace-matched anchor; the three
guards named in the paste are at `:111`, `:117`, `:129` as stated (line numbers unchanged since the
`97db750` fold). **One error in the code's own comment, not in the record:** the comment block above
the moved `format` guard (`route.ts:265–268`, landed with `0126645`/`97db750`) says the `conversation`
minimum has the *"SAME provenance (aeadbd1)"* as the two maxima. [GIT] `git log -L129,129` and
`-S'trim().length < 20'` both give `496d832` (2026-03-23) — three days earlier, a different commit.
Row 11 is right; the comment is wrong. Session 3 should correct the comment when it moves the guard,
so the next reader does not take the comment over the record (memory
`primary-data-beats-secondary-characterisation`).

---

## 5. Counts derived, and the non-vacuity of the sweep

Membership: **43 + 2 = 45** — the four commands in §1.1. Flag pairs **31** over **30** routes;
unconditional **13**. Non-conformant **16**; conformant **27**; substrate-gate **2** (16+27 = 43).
Guard sites **39**; minimum-length sites **9**. The mechanical check prints:

```
MEMBERSHIP (re-derived …): route-level=43 substrate-gate=2 flag-pair-entries=31 flag-gated-routes=30 unconditional=13
SUMMARY write-handlers=62 with-check=54 pre-check-bound-lines: direct=43 via-same-file-helper=12 raw-total=55 (…); check→redirect-window bound lines=0 (handlers with no redirect marker found: 2); rate-limit config lines excluded=6
KNOWN-CASE score-conversation: R20a flag block L182-L202; format guard L302 (occurrences: 1); format guard AFTER block end: true (…)
```

**Non-vacuity.** The sweep sees the known case exactly as the record describes it: the
`conversation` max (`:111`), the `context` max (`:117`), the `conversation` minimum (`:129`), and the
moved `format` guard (`:302`) **after** the block whose structural end it brace-matches (`:202`),
not merely after its opening (`:182`) — the distinction three PR19 reviewers established on
2026-09-05. It also sees a **negative control** the trace overrides (founder/hub `:1255`, a cap
argument) and a **helper-hidden positive** the discarded textual sweep missed (`FIELD_MAX` inside
`parseDeclaration`). And under mutation on a scratch copy (§1.6) it **fails in the right direction
on all four demonstrated defects** — a string-literal decoy, a block-comment decoy, an
unmatched-name helper, and a guard placed between the check and the redirect return. A sweep that
could not see those things could not be trusted on the unknown members; where it over-counts, §1.6
says by how much and why. The 62 write handlers include 8 without a check that carry no free text
(Stoa DELETE; gap4 PATCH; the six 405 stubs on the substrate-gate routes).

**Review record.** Three blind, parallel, read-only reviewers (claims-vs-source on 13 named members
+ 19 by bulk grep + 18 commits; method soundness with an AST inventory of every pre-check callee;
known-case non-vacuity with seven mutations) returned **0 HIGH**. The 16/27/2 split, the 39/9 guard
counts, every cited guard/check/return line they read, and every commit they re-derived held. What
they found — one MEDIUM and six LOW on the record's precision, four MEDIUM on the method's
self-description, three MEDIUM in the rev-1 sweep — is folded above, each marked *(corrected at
review)* where it sits, and the sweep was fixed at the root rather than annotated. **The headline
figures did not move under any review.**

---

## 6. Recommended remediation order for Session 3 — keyed to harm

**Tier for every item: `code-critical`** (R20a perimeter — PR6 + AC5), founder-walked, **PR19
required** (three blind reviewers, as the `format` move had), each move pinned by an
execution-order anchor of the FV-6 brace-matched shape and **mutation-verified against a guard placed
inside the block and one placed between the check and the redirect return** (the two bypasses those
reviewers demonstrated). The ruling is about **order, not existence**: every guard stays, and stays
before any context load, engine call or store write. Where a route passes the raw field to the
classifier, add a screening cap at the move (§4.3) so the per-request classifier input remains
bounded — the cost the ruling accepted is a bounded one.

**Group 1 — minimum-length guards on practitioner surfaces (a short genuine cry is refused unread):**
1. `/api/score-conversation` `:129` (<20) — the ruled route, the paradigm case.
2. `/api/reflect` `:96` (<10) — the evening reflection, the most personal daily surface.
3. `/api/mentor/private/reflect` `:174` (<10) — same shape as 2; move together.
4. `/api/score-scenario` `:300` (<5).

**Group 2 — maximum guards on the most distress-likely practitioner surfaces (a long distressed
write-up is refused unread):**
5. `/api/reflect` `:84`, `:90` and `/api/mentor/private/reflect` `:162`, `:168` — one shape.
6. `/api/journal` `:43`; `/api/mentor/journal-feed` `:55`, `:58`, `:61`.
7. `/api/score-conversation` `:111`, `:117`.
8. The score family, one shape, one shared pin pattern but a per-route pin each (memory
   `guard-scope-must-cover-the-class`): `/api/score` `:146`, `:148`; `/api/score-decision` `:102`,
   `:104`; `/api/score-scenario` `:308`, `:313`; `/api/score-social` `:110`; `/api/score-document`
   `:106` (a 30,000-character field — the largest raw input any member sends to the classifier).
9. `/api/mentor/stoa` `parseDeclaration` `:150`, `:171`, `:176` and `/api/mentor/stoa/draft-reflect`
   `parseDraft` `:114` — a **restructure, not a line move**: the Stoa gate runs over the merged
   entry after a store read; the subject must be composed from the raw body (and the prior entry)
   before parsing, keeping the parse's 400s for after the gate.
10. `/api/reason` human path `:1038`, `:1040`, `:1042` (+ `:1064` when the continuation flag is
    on). **Sequencing:** this file is inside the measured `/api/reason` surface; if the false-hold
    window (S4) has started, an edit contaminates it. Land this move **before** the founder sets
    `GATE1_FALSE_HOLD_CAPTURE`, or hold it until the window closes. Its agent path needs nothing.

**Group 3 — founder-only proof surfaces (one human caller; lowest reach):**
11. `/api/founder/hub/ring-proof` `:153`, `:160`; `/api/mentor/ring/proof` `:118`, `:125`;
    `/api/support/agent/proof` `:141`, `:147`, `:153`, `:172`, `:174`.

**Not to be changed:** `/api/calling`, `/api/practice/reflect` (agent-facing; purpose (a) governs;
no length guard exists in any case); the agent path of `/api/reason` and `/api/execute`; every
perimeter exclusion. The 27 conformant members need no move; their pins, where a per-route battery
exists, should be checked to assert the ordering they already have, so it cannot drift back.

**The walk carries F-6's two Bearer-JWT smokes** on `/api/score-conversation` and, per move, a
minimum-length smoke of the form *a 14-character distressed submission returns the crisis redirect,
not a 400*.

---

## 7. What this audit did not do

Change any route; apply a migration or flip a flag; mint or size a credential; touch
`.claude/settings.local.json`; quote a perimeter count from a document; resurrect the 20/10/13
split (its numbers are not in this document); "fix" an agent-facing member; touch the
standing-runner, S11 or Option S tracks; touch `operations/agent-circles-2026-08/d6a/` or any file
in the byte-identity guard's set. **The session ends without changing a route.**

---

*Artifacts of this audit: this document; `2026-09-05-r20a-ordering-sweep.js` (rev 2) and its
`…-OUTPUT.txt` beside it. Decision-log entry: `D-R20A-PERIMETER-ORDERING-AUDIT-COMPLETE-2026-09-05`.
Close: `operations/handoffs/founder/2026-09-05-r20a-perimeter-ordering-audit-CLOSE.md`.
Session 3 prompt: `operations/handoffs/founder/2026-09-05-r20a-perimeter-ordering-REMEDIATION-NEXT-SESSION-PROMPT.md`.
Written across two context windows on 2026-09-05: the first authored §0–§7 and hit its limit; the
second ran the review, folded it, and recorded.*
