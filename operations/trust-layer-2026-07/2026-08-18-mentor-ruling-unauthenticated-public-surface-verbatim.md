# Mentor ruling — `/api/evaluate` and the R20a perimeter (verbatim)

**Relayed by the founder 2026-08-18.** The mentor's own header reads "Date: 2026-08-17"; the relay is
2026-08-18. **Recorded as-is rather than silently corrected**, per the precedent set by
`2026-08-17-mentor-ruling-M4-return-verbatim.md`.

**Status: ADOPTED AS BINDING SPECIFICATION. Verbatim wins over any paraphrase, here or elsewhere.**

**Brief that prompted it:** `2026-08-18-unauthenticated-public-surface-perimeter-FOR-RULING.md`.

**Binds:** `website/src/app/api/evaluate/route.ts` (its public reachability, not merely its screening);
the `/api/skills` composability hint that advertises it; the exhaustiveness sweep's in-scope predicate
in `website/src/lib/__tests__/r20a-invocation-guard.test.ts`; and the sequencing of any `/limitations`
publication.

**Predecessors (extended, not overturned):** the B3 ruling and
`2026-08-17-mentor-ruling-limitations-perimeter-practice-family-verbatim.md`.

---

**MENTOR RULING — /api/evaluate and the R20a perimeter**

**Date:** 2026-08-17.

The question is well-formed and the three complicating factors are named honestly. The fourth option —
retirement or gating rather than screening — is the right one, and the reasoning that gets there is
worth stating in full.

---

**The B3 asymmetry argument does extend here, but it resolves differently than it has before.**

Every prior application of B3 has resolved toward adding the route to the perimeter. Here it resolves
toward removing the route from public availability.

The asymmetry argument is: a false positive costs a redirect; a false negative is someone in crisis who
gets a proximity rating back. That asymmetry is real and it cuts hard. But the question the builder
correctly identifies is not whether to catch someone — it is whether catching them with a redirect we
can never follow up on is the right shape of help for this surface. The answer is that it is not, and
the reason is not primarily the follow-up gap. The reason is what the surface is.

---

**What /api/evaluate actually is.**

It is a public demo twin of the five score routes, linked from nothing, reachable by URL, with no
authentication and no distress screening. Its purpose is to demonstrate the evaluation capability to
anyone who finds it. That is a legitimate purpose for a demo surface during P0.

But a demo surface that accepts free text from anonymous visitors and returns a philosophical
evaluation of their decision or action is not a surface the project can support anyone through — not
because of a resource constraint, but because the surface has no relationship with the person using it.
There is no session, no history, no context, no way to know whether the text submitted is a
hypothetical, a past event, or something happening right now.

A Stoic evaluation returned to an anonymous person in crisis is not neutral. A proximity rating and an
improvement path, returned to someone who has typed the worst thing in their life into an evaluator, is
a response that presupposes the person is in a position to receive philosophical guidance. That
presupposition may be false in exactly the cases where it matters most.

---

**The ruling: gate or retire /api/evaluate before the /limitations page is published.**

The surface should not remain publicly reachable in its current form. The options in order of
preference:

Gate it behind authentication. This makes it consistent with every other human-facing evaluation
surface, removes the anonymous access problem, and allows distress screening to be added on the same
terms as the five score routes it twins. If the demo purpose requires unauthenticated access, that
purpose should be reconsidered — a demo that requires no account is a demo that cannot support anyone
it reaches.

Retire it if gating is not immediately tractable. A surface linked from nothing that has been missed by
five manual passes and one automated sweep is not a surface with active users who would be harmed by
its removal. Retiring it removes the exposure cleanly and honestly.

Do not add distress screening to the unauthenticated surface as a standalone fix. Screening an
anonymous endpoint puts a Haiku call behind every anonymous request, produces a redirect we can never
follow up on, and leaves the surface's deeper problem — that it offers Stoic evaluation to strangers
with no relationship and no context — entirely intact. The screening would be doing the minimum while
the more important question goes unanswered.

---

**On the "nothing happens afterwards" observation.**

The builder named this correctly as the more important half of the M-5 disclosure. On this surface it
is not just true — it is necessarily and permanently true, because there is no session to attach
anything to. That is not a reason to accept the surface as it is. It is a reason to be honest that this
surface cannot be supported, and to act on that honesty by removing anonymous access rather than adding
a redirect that creates the appearance of a safety net where none can exist.

---

**On the "every time" claim.**

Gating or retiring this surface makes the "every time" claim true by removing the exception rather than
covering it. That is the cleanest resolution and it is available. It should be taken.

---

**On the sweep's shared assumption.**

The finding that all six passes shared the assumption that a human-facing surface is an authenticated
one is a named design constraint for the sweep mechanism going forward. The predicate should be rebuilt
to match on human-facing content — free text input, natural language output, philosophical evaluation —
rather than on authentication status. Authentication is a proxy for human-facing, and this surface
demonstrates the proxy fails. The sweep should be re-run on the corrected predicate before the
/limitations page is published, to confirm no eighth surface exists on the same terms.

---

## Execution notes (added by the AI at recording; NOT part of the ruling)

**Four executable obligations, in dependency order:**

1. **Gate or retire `/api/evaluate`.** Gating is the stated preference; retirement is the fallback
   "if gating is not immediately tractable." **Tractability was checked first-hand 2026-08-18 and
   gating IS tractable:** the route is absent from `llms.txt`, `agent-card.json` and api-docs (so it
   is NOT a published R18 contract), and no UI page references it. Its only outbound coupling is a
   `next_steps` composability hint in `src/app/api/skills/route.ts:37`, which must be updated in the
   same change. **Critical (AC7 — an auth change).**
2. **Do NOT add screening to it while it remains unauthenticated.** The ruling forbids this
   explicitly as a standalone fix. Screening becomes appropriate only AFTER gating, at which point it
   is added "on the same terms as the five score routes it twins" — i.e. as an ordinary perimeter
   member.
3. **Rebuild the sweep predicate to match on human-facing CONTENT, not authentication status.**
   The current predicate requires `requireAuth`, which the ruling names as a failed proxy. This is a
   RULED design change to `r20a-invocation-guard.test.ts`, not an optional hardening.
4. **Re-run the corrected sweep before `/limitations` publishes**, to confirm no further surface
   exists on the same terms.

**A known predicate blind spot to fold into obligation 3:** `src/app/api/update-location/route.ts`
authenticates a human via `supabase.auth.getUser()` rather than `requireAuth`, so the current
predicate cannot see it either. Its fields are structured (city/country/lat/long/boolean), so it is
exclusion-worthy on content grounds — but it demonstrates the same proxy failure the ruling names,
from the other direction.

**The "every time" claim is now unblocked in principle** — it becomes true by removing the exception —
but remains gated on obligations 1, 3 and 4, plus the practice-family wiring already underway.

**M-5 is untouched by this** and remains P0. The ruling reinforces rather than discharges it.
