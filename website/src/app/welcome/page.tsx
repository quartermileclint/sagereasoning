/**
 * /welcome — First-run orientation for newly signed-up practitioners
 *
 * Build item A18a (staging plan §A18): "Sagereasoning.com first-run experience
 * designed + built (U1)." Human-practitioner first-run only this session.
 *
 * Purpose: the bridge between "I just made an account" and "I know what to do
 * here." Shown once right after the baseline result (the baseline result CTA
 * now hands off here), and reachable any time from the nav account menu and the
 * footer.
 *
 * Honest positioning per R19 (R19c limitations / R19d mirror principle): we
 * frame the tool as a mirror for the practitioner's OWN reasoning, AI-generated,
 * a companion rather than advice — and link to /limitations, /transparency, and
 * /accessibility rather than overclaiming. Static page; no auth logic; matches
 * the /accessibility + /limitations page conventions.
 *
 * 2026-08-10 amendment (mentor website-page feedback, 2026-07-17, verbatim at
 * `inbox/Mentor feedback on website pages.rtf`). The mentor required both
 * "AI-generated" statements here to be rewritten as "the core reasoning is
 * produced by a deterministic engine … with Claude handling input translation
 * and prose rendering." That formulation was NOT applied verbatim, on founder
 * election, because it is false of this page's subject: every practitioner tool
 * /welcome sends people to (/baseline, /score, /journal, /private-mentor) calls
 * `runSageReason`, a single Claude call. The deterministic Layer-2 sandwich is
 * live on the AGENT surfaces only (/api/reason, /api/guardrail, accreditation,
 * calling, practice/reflect). Applying the mentor's wording here would have put
 * a false architectural claim on a live page. /limitations carries the full
 * two-surface explanation and is linked from both statements below; the
 * collision is recorded as a PR20 finding for the mentor's next consultation.
 * Do not "restore" the deterministic-core wording on this page without first
 * re-checking which engine the practitioner routes actually call.
 */

import type { Metadata } from 'next'
// practice-sequence.ts is a ZERO-IMPORT module — see its header. /welcome is a
// guarded TARGET_FILES entry of the logos boundary test, which follows only ONE
// hop, so anything that module imported would sit outside the guard's reach.
// It imports nothing, at any depth, which is what makes this import safe.
import { PRACTICE_SEQUENCE, WELCOME_SEQUENCE_COPY } from '@/lib/practice-sequence'

export const metadata: Metadata = {
  title: 'Getting Started — SageReasoning',
  description:
    'A short orientation for new practitioners: what SageReasoning is for, the order the practices are usually met in, how to read your results, and what to expect honestly.',
}

const FIRST_STEPS = [
  {
    title: 'Take your baseline',
    href: '/baseline',
    body:
      'A short set of questions that calibrates where your practice is starting from. It is not a grade — it is a starting point you can build on.',
    cta: 'Start the baseline',
  },
  {
    title: 'Score an action',
    href: '/score',
    body:
      'The everyday tool. Describe something you did, or plan to do, and receive a Stoic reading of your reasoning along with a path for growth.',
    cta: 'Score an action',
  },
  {
    title: 'Keep a journal',
    href: '/journal',
    body:
      'A quiet place to record what you noticed and return to it later. Patterns become visible over time in a way they rarely do in the moment.',
    cta: 'Open the journal',
  },
  {
    title: 'Meet your private mentor',
    href: '/private-mentor',
    body:
      'A reflective companion for deeper examination — for working through a decision or a reaction by following your own reasoning more carefully.',
    cta: 'Meet the mentor',
  },
]

// The seven practice tools moved OUT of this list and into their own ordered
// section below (election E2) — listing them alphabetically as "more to explore"
// was the un-ordered presentation the mentor's sequence replaces. `/passion-log`
// was missing from this list entirely and is now in the sequence where it belongs.
// Mentor's required product-state verification (website-page feedback,
// 2026-07-17): "confirm which surfaces are live and accessible. Remove or mark
// as coming soon any that are not." Verified 2026-08-10: all four routes exist
// and render; none is coming-soon, so nothing is removed. `/scenarios` is the
// only one behind PROTECTED_ROUTES (src/middleware.ts), hence `requiresAccount`
// — the other three are public. Re-check this flag against the middleware list
// if either changes.
const MORE_TO_EXPLORE = [
  { label: 'Ethical scenarios', href: '/scenarios', requiresAccount: true },
  { label: 'The image glossary', href: '/glossary', requiresAccount: false },
  { label: 'The community map', href: '/community', requiresAccount: false },
  { label: 'How the method works', href: '/methodology', requiresAccount: false },
]

// The Five Stages of Practice. Names and slugs are literal here on purpose —
// /welcome is inside the logos boundary-test target set, so it must not import
// brand-display (the one-hop stoic-brain rule noted below).
//
// The slugs are load-bearing: each tile links to /stages/<slug>, and a stale one
// renders "Unknown stage." at HTTP 200 rather than a 404 — a silent dead end on
// the orientation page a new practitioner is sent to. They ARE pinned against
// the canonical STAGE_DISPLAY, by G2-1/G2-2 in
// src/lib/__tests__/practice-sequence.test.ts, which reads this array's source.
// An earlier version of this comment claimed that pin existed when it did not;
// the adversarial review demonstrated a slug mutation passing 783 assertions.
const STAGES = [
  { name: 'The Storm', slug: 'the-storm', src: '/images/The Storm.PNG' },
  { name: 'The Worn Path', slug: 'the-worn-path', src: '/images/The Worn Path.PNG' },
  { name: 'The Crossroads', slug: 'the-crossroads', src: '/images/The Crossroads.PNG' },
  { name: 'The Clear Summit', slug: 'the-clear-summit', src: '/images/The Clear Summit.PNG' },
  { name: 'The Inner Fire', slug: 'the-inner-fire', src: '/images/The Inner Fire.PNG' },
]

// The seven practices, in the order they are usually met. `/logos` is excluded
// here because it already has its own "Start with why" card above — it is the
// prerequisite orientation, not one more tool in the list.
const SEQUENCE_STEPS = PRACTICE_SEQUENCE.filter((s) => s.tracked)

export default function WelcomePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 font-body text-sage-800">

      {/* Header */}
      <div className="mb-12">
        <h1 className="font-display text-3xl font-medium text-sage-900 mb-2">
          Welcome to SageReasoning
        </h1>
        <p className="font-display text-lg italic text-sage-600 mb-4">Flourish together</p>
        <p className="text-sage-700 leading-relaxed">
          You now have a place to examine your own judgments, grow in character, and
          practise reasoning a little more like the Stoic sage. This page is a short
          orientation: what the tool is for, the order the practices are usually met in,
          and how to read what you get back. You can return here any time from the account
          menu or the footer.
        </p>
      </div>

      <section className="space-y-12 leading-relaxed">

        {/* A companion for your reasoning */}
        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">
            A mirror, not a verdict
          </h2>
          {/* Brand imagery standard: message-bearing images render width-driven
              (w-full max-w-sm h-auto) so they fill an iPhone-width viewport,
              never letterboxed in a small square box. Literal <img> + literal
              path here — /welcome is inside the logos boundary-test target set,
              so it must not import brand-display (one-hop stoic-brain rule). */}
          <img
            src="/images/mirror.PNG"
            alt="The Mirror — SageReasoning's hand-drawn emblem of examined reasoning"
            className="w-full max-w-sm h-auto mx-auto mb-5 drop-shadow-md"
          />
          <p>
            SageReasoning holds up a mirror to your <em>own</em> reasoning. When you score
            an action or reflect with the mentor, the aim is to help you see your judgments,
            passions, and intentions more clearly — not to hand down a verdict on you as a
            person. The reflections in these practitioner tools are written by an AI model
            working from the Stoic framework, and are a companion to your
            thinking, not professional advice and not the last word. If something it says
            does not ring true, trust your own examination over the output. For the fuller
            picture of what this tool can and cannot do, see our{' '}
            <a href="/limitations" className="text-sage-600 underline hover:text-sage-800">
              limitations page
            </a>
            .
          </p>
        </div>

        {/* Start with why — the logos foundational module (#12).
            Placed here deliberately, and NOT in "More to explore": it is not one
            more tool, it is the prerequisite orientation the tools assume. */}
        <div className="bg-sage-100/60 border border-sage-200 rounded-lg p-6">
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">
            Start with why
          </h2>
          <p className="text-sage-700">
            Every practice here descends from a single claim: that virtue is grounded in{' '}
            <strong>reason</strong> — not in social convention, not in divine command, not
            in felt preference. You can use the tools without knowing that. But they will
            work as techniques rather than as one practice, and the difference shows over
            time. If you read one thing before you begin, read this.
          </p>
          <a
            href="/logos"
            className="mt-4 inline-block px-4 py-2 bg-sage-400 text-white font-display text-sm rounded hover:bg-sage-500 transition-colors"
          >
            Logos — why the practices cohere
          </a>
        </div>

        {/* Where to start — the ordered default path (founder election E2).
            The freedom note is SOFTENED, not deleted: the order is a default,
            not a rule, and nothing is locked. */}
        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-5">
            {WELCOME_SEQUENCE_COPY.heading}
          </h2>
          <p className="mb-4 text-sage-700">{WELCOME_SEQUENCE_COPY.intro}</p>
          <p className="mb-6 text-sage-700">{WELCOME_SEQUENCE_COPY.prerequisiteNote}</p>
          {/* Mentor's required product-state verification (website-page feedback,
              2026-07-17): "confirm all are accessible to a practitioner who lands
              on the welcome page. If any are gated, amend the calls to action."
              Verified 2026-08-10 against src/middleware.ts PROTECTED_ROUTES: all
              four (/baseline, /score, /journal, /private-mentor) ARE gated, and
              /welcome itself is NOT — so a signed-out visitor arriving from the
              footer hits /auth on every one of these four cards. The redirect is
              graceful, but it was unsignposted. This line is the amendment. */}
          <p className="mb-6 text-sm text-sage-600 italic">
            These four keep your own practice record, so they ask you to be signed in. If
            you land here signed out, each one will take you to{' '}
            <a href="/auth" className="text-sage-600 underline hover:text-sage-800">
              sign in
            </a>{' '}
            first, then on to the practice.
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            {FIRST_STEPS.map((step) => (
              <div
                key={step.href}
                className="bg-white/60 border border-sage-200 rounded-lg p-6 flex flex-col"
              >
                <h3 className="font-display text-lg font-semibold text-sage-800 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-sage-700 leading-relaxed mb-4 flex-1">
                  {step.body}
                </p>
                <a
                  href={step.href}
                  className="inline-block self-start px-4 py-2 bg-sage-400 text-white font-display text-sm rounded hover:bg-sage-500 transition-colors"
                >
                  {step.cta}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* The daily rhythm — the two things that recur alongside the sequence
            rather than sitting inside it. */}
        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">
            {WELCOME_SEQUENCE_COPY.dailyRhythmHeading}
          </h2>
          <p className="text-sage-700">{WELCOME_SEQUENCE_COPY.dailyRhythm}</p>
        </div>

        {/* The practices, in sequence. The order is the one a practitioner is
            usually introduced to them in — it removes the friction of choosing
            where to begin without removing any of the work. */}
        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-5">
            {WELCOME_SEQUENCE_COPY.toolsHeading}
          </h2>
          <ol className="space-y-4">
            {SEQUENCE_STEPS.map((step, i) => {
              // Two practices share a step number where they are met together.
              const paired = SEQUENCE_STEPS[i - 1]?.step === step.step
              return (
                <li key={step.id} className="flex gap-4">
                  <span
                    className={`font-display text-sm font-semibold w-6 shrink-0 pt-0.5 ${
                      paired ? 'text-transparent' : 'text-sage-400'
                    }`}
                    aria-hidden={paired}
                  >
                    {paired ? '·' : step.step}
                  </span>
                  <div>
                    <a
                      href={step.href}
                      className="font-display text-base font-semibold text-sage-800 underline decoration-sage-300 hover:decoration-sage-600"
                    >
                      {step.name}
                    </a>
                    {/* On its own line, not trailing the link inline: an inline
                        span separated only by a margin runs straight into the
                        link name for a screen reader ("…Concernmet alongside…"). */}
                    {paired && (
                      <p className="font-body text-xs text-sage-500 italic">
                        met alongside the one above
                      </p>
                    )}
                    <p className="text-sm text-sage-700 mt-0.5">{step.doorbell}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>

        {/* How to read your results */}
        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">
            How to read your results
          </h2>
          <p>
            Results are <strong>qualitative, not a score out of ten</strong>. Your reasoning
            is described by how closely it approaches the ideal of the perfect Stoic sage —
            from <em>reflexive</em> (little self-examination) through to <em>sage-like</em>{' '}
            (rare philosophical depth). Each level has a Stage of Practice:
          </p>
          {/* The Five Stages of Practice — literal paths (see the boundary note above).
              Each links to its own Stage page, which sets out what that stage is and
              which practices meet a practitioner there. */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 my-6">
            {STAGES.map((stage) => (
              <a
                key={stage.slug}
                href={`/stages/${stage.slug}`}
                className="text-center group"
              >
                <img
                  src={stage.src}
                  alt={`${stage.name} — Stage of Practice`}
                  className="w-full h-auto drop-shadow-sm"
                />
                <p className="text-xs text-sage-600 mt-1 font-display group-hover:text-sage-800 group-hover:underline">
                  {stage.name}
                </p>
              </a>
            ))}
          </div>
          <p>
            The point of the levels is direction, not ranking:
            they show where to look next. Any passions the tool names — frustration, craving
            for recognition, anxiety — are offered as <strong>diagnostic, not punitive</strong>.
            Naming them is how Stoic practice begins to loosen their grip. If you want the
            reasoning behind all of this, the{' '}
            <a href="/methodology" className="text-sage-600 underline hover:text-sage-800">
              methodology page
            </a>{' '}
            sets out the full four-stage approach.
          </p>
        </div>

        {/* More to explore */}
        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">
            More to explore
          </h2>
          <p className="mb-4 text-sage-700">
            When you are ready to go further, these are worth a look:
          </p>
          <ul className="space-y-2">
            {MORE_TO_EXPLORE.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-sage-600 underline hover:text-sage-800"
                >
                  {item.label}
                </a>
                {item.requiresAccount && (
                  <span className="text-xs text-sage-500 italic"> &mdash; sign-in required</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Honest expectations */}
        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">
            What to expect — honestly
          </h2>
          <p>
            SageReasoning is a pre-launch tool built by a single founder, and we would
            rather be plain with you than overclaim. The reflections in the practitioner
            tools are AI-generated and can vary in quality &mdash; our{' '}
            <a href="/limitations" className="text-sage-600 underline hover:text-sage-800">
              limitations page
            </a>{' '}
            sets out exactly which parts of the system are AI-written and which are not.
            This is <strong>not a crisis or mental-health service</strong>;
            if you are struggling, please reach out to a qualified professional or a local
            support line. You can read how we handle your data on our{' '}
            <a href="/privacy" className="text-sage-600 underline hover:text-sage-800">
              privacy
            </a>{' '}
            and{' '}
            <a href="/transparency" className="text-sage-600 underline hover:text-sage-800">
              AI transparency
            </a>{' '}
            pages, and how we approach{' '}
            <a href="/accessibility" className="text-sage-600 underline hover:text-sage-800">
              accessibility
            </a>{' '}
            here. If anything is unclear or could be better, tell us at{' '}
            <a
              href="mailto:support@sagereasoning.com"
              className="text-sage-600 underline hover:text-sage-800"
            >
              support@sagereasoning.com
            </a>
            .
          </p>
        </div>

        {/* CTA */}
        <div className="mt-4 pt-8 border-t border-sage-200 text-center space-y-4">
          <p className="font-display text-xl text-sage-800">Begin your path toward the Sage</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/score"
              className="px-8 py-3 bg-sage-400 text-white font-display text-lg rounded hover:bg-sage-500 transition-colors"
            >
              Score your first action
            </a>
            <a
              href="/dashboard"
              className="px-8 py-3 border border-sage-400 text-sage-700 font-display text-lg rounded hover:bg-sage-100 transition-colors"
            >
              Go to your dashboard
            </a>
          </div>
        </div>

      </section>
    </div>
  )
}
