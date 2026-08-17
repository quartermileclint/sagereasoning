# For ruling — does the R20a perimeter extend to an UNAUTHENTICATED public surface?

**Authored 2026-08-18 while building the mentor-ruled exhaustiveness sweep.**
**PR20-compliant: every mechanism named below is a verified fact about current behaviour, checked
first-hand today, not inferred from documentation.**

**Predecessor rulings this builds on (not reopened):**
`2026-08-17-mentor-ruling-limitations-perimeter-practice-family-verbatim.md` (A3; practice family in;
the sweep as prerequisite) and the B3 ruling it extends.

---

## 1. Why this is arriving now

The mentor ruled on 2026-08-17 that a filesystem-level sweep producing a definitive count is a
**prerequisite** for publishing the `/limitations` "every time" claim: *"The honest claim is only as
strong as the verification behind it."*

The sweep was built today. It works, and on its first run it refuted an exclusion its own author had
just written. It then found something the ruling could not have anticipated, because every prior pass —
four by hand, one by review — shared the same assumption the sweep inherited.

**The assumption: that a human-facing surface is an authenticated one.** Every one of the 22 current
perimeter members sits behind `requireAuth`. The sweep's predicate was built to match them, so it
requires `requireAuth` too. A route with *no authentication at all* is invisible to it.

There is such a route.

## 2. The finding — `/api/evaluate`, verified first-hand

| Property | Verified state |
|---|---|
| Authentication | **None.** The source says so twice: `// No authentication required` and `// Rate limiting (stricter for no-auth)` |
| Input | `input`, free text, capped at 500 chars — prompt: *"the decision or action to evaluate"* |
| Processing | Sent to an LLM with `getStoicBrainContext('quick')` |
| Output | `katorthoma_proximity`, `philosophical_reflection` (2-3 sentences), `improvement_path` |
| Distress screening | **Zero.** No `enforceDistressCheck`, no `detectDistressTwoStage`, no import of either |
| Reachability | Live route. Linked from **no** page in `src/app` — reachable by URL only |

It is a public demo twin of the five score routes, which **are** perimeter members. The same content
class, the same Stoic evaluation output, screened on the authenticated side and unscreened on the
public one.

I checked whether this is a class or an instance. Of the four unauthenticated routes accepting a
request body on a write verb: `analytics` takes a structured payload, `deliberation-chain/[id]/conclude`
catches its body and uses only the path id, `substrate/layer3` is dark (503, flag unset).
**`/api/evaluate` is the only one that takes practitioner prose.** It is an instance, not a class.

## 3. The mechanisms a ruling would land on (PR20)

1. **`enforceDistressCheck(detectDistressTwoStage(...))`** is the AC5 pattern; it costs one Haiku call
   when stage-1 regex finds nothing (`r20a-classifier.ts:246`), and short-circuits with no LLM call
   when the regex fires. On an unauthenticated endpoint that cost is borne per anonymous request.
2. **`checkRateLimit`** is IP-keyed. `/api/evaluate` already runs a stricter limit than authenticated
   routes precisely because it has no auth.
3. **The redirect payload** returns only three keys (`distress_detected`, `severity`,
   `redirect_message`) and the crisis resource list comes from the shared `getCrisisResources()`.
   Nothing in it requires a session, an account, or a stored row.
4. **The `mild` fold** attaches `support_resources` to an otherwise-normal response. It also requires
   no session.
5. **M-5 (the distress write path) does not exist yet** and remains P0. For an anonymous caller it is
   not merely unbuilt — there is no principal to write a record *about*.
6. **The `/limitations` page** would say a crisis redirect happens "automatically, every time." That
   claim is scoped by whatever the perimeter turns out to be.

## 4. The question

**Does the R20a perimeter extend to an unauthenticated public endpoint that accepts free text and
returns a Stoic evaluation?**

And, if it does, a second question the first one raises:

**Does the sweep's predicate have to be widened from "authenticates a human" to "accepts human free
text, authenticated or not" — and if so, is the resulting count what "definitive" requires?**

## 5. The considerations, stated honestly in both directions

**For inclusion.** The B3 asymmetry argument, twice ratified, appears to cut *harder* here than
anywhere it has been applied. A false positive costs an anonymous visitor a redirect. A false negative
is a person with no account, who found a Stoic evaluator and typed the worst thing in their life into
it, receiving a `katorthoma_proximity` rating and an `improvement_path` in reply. The mentor's words
about `/view-from-above` — *"that is the wrong configuration"* — seem to apply with more force to a
surface where the practitioner has not even signed up, has no journal, no profile, and no other
surface of ours that could ever catch them.

**Against, or at least complicating.** Three things a ruling should weigh:

- **The redirect is all there could ever be.** With no session there is no record, no follow-up, and
  nothing M-5 could later attach. The disclosure the mentor called the more important half — *"nothing
  happens afterwards"* — is not merely true here but *necessarily* true. It may be that offering a
  redirect to someone we can never follow up with is right anyway; it may be that it warrants
  different wording than the authenticated surfaces get.
- **Cost and abuse posture.** Screening puts a Haiku call behind every anonymous request to an
  unauthenticated endpoint. That is a real exposure of a different kind, and the route's existing
  stricter rate limit exists because of it.
- **Whether the surface should exist at all.** It is linked from nothing. A fourth option is to
  retire or gate it rather than screen it — which closes the gap without adding a screen, and would
  make the "every time" claim true by removing the exception instead of covering it.

## 6. What is NOT being asked

- The practice-family ruling is not reopened. Those six are in, and wiring is underway.
- The already-ratified gap-closure routes are not reopened.
- Nothing about M-4 is in scope here.
- **No coverage claim has been published**, and none will be until this is settled. The `/limitations`
  page still carries its pre-existing wording.

## 7. The builder's position, offered as input and not as a recommendation to be rubber-stamped

I lean toward inclusion, and I want to name the reasoning that makes me distrust my own lean: I found
this while trying to prove my own exhaustiveness claim wrong, and there is a pull toward treating
every find as a thing to fix. The genuinely open part is not *whether* an anonymous person in crisis
should be caught — it is whether catching them with a redirect we can never follow up on is the right
shape, or whether the honest answer is that a surface we cannot support anyone through should not be
offering Stoic evaluation to strangers at all.

That second reading is the one I cannot settle, and it is why this is here rather than in a commit.
