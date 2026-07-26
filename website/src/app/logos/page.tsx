/**
 * /logos — the Logos foundational teaching module (Remaining Principles #12).
 *
 * NOT A TOOL BUT A PREREQUISITE ORIENTATION (mentor §12). This page is therefore
 * deliberately STATIC: no form, no submission, no client state, no fetch, no route,
 * no table, no LLM gate. There is nothing for a practitioner to submit, so there is
 * nothing to persist, classify, or erase. If a future change adds a "mark as read"
 * or a progress table, that is the tool-shaped instinct the mentor explicitly warned
 * against — it needs a founder decision, and the default is no.
 *
 * All teaching copy lives in @/lib/logos-teaching (a zero-import content module).
 *
 * The one engine-adjacent import here is VIRTUE_DISPLAY from @/lib/stoic-brain — a
 * READ-ONLY value import, the shipped precedent set by /methodology and the home page.
 * Reading stoic-brain.ts is permitted; EDITING it is forbidden (it sits inside the
 * /api/reason import graph AND is imported directly by /api/guardrail — an edit would
 * break byte-identity on two surfaces measured by the running observation window).
 * The import boundary is pinned by src/app/logos/__tests__/human-practitioner-boundary.test.ts.
 */

import type { Metadata } from 'next'
import { VIRTUE_DISPLAY } from '@/lib/stoic-brain'
import {
  LOGOS_LEDE,
  THE_CLAIM,
  THE_REJECTIONS,
  DOCTRINE_STEPS,
  UNITY_OF_VIRTUE,
  TECHNIQUE_VS_DISPOSITION,
  DICHOTOMY_NOTE,
  PRACTICE_DERIVATIONS,
  BACKGROUND_INTRO,
  BACKGROUND_DOCTRINES,
  THE_IDENTITY_CLAIM,
  HONEST_NOTE,
  CALLING_FOUNDATION,
  MORAL_COMMUNITY,
  CLOSING,
} from '@/lib/logos-teaching'

export const metadata: Metadata = {
  title: 'Logos — SageReasoning',
  description:
    'The foundational orientation: virtue is grounded in reason — not in social convention, not in divine command, not in felt preference. Why every practice here coheres.',
}

export default function LogosPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 font-body text-sage-800">

      {/* Header */}
      <div className="mb-12">
        <div className="flex flex-col items-center mb-8">
          <img
            src="/images/LOGOS.PNG"
            alt=""
            aria-hidden="true"
            className="w-28 h-28 object-contain drop-shadow-lg rounded-full border-4 border-amber-200 bg-amber-50/60"
          />
        </div>
        <h1 className="font-display text-3xl font-medium text-sage-900 mb-2 text-center">
          {LOGOS_LEDE.title}
        </h1>
        <p className="font-display text-lg italic text-sage-600 mb-6 text-center">
          {LOGOS_LEDE.subtitle}
        </p>
        <p className="text-sage-700 text-sm italic text-center mb-6">
          {LOGOS_LEDE.standfirst}
        </p>
        <p className="text-sage-700 leading-relaxed">{LOGOS_LEDE.opening}</p>
      </div>

      <section className="space-y-12 leading-relaxed">

        {/* The claim */}
        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-4">
            The claim
          </h2>
          <p className="mb-4">Stoic ethics rests on a single foundational claim:</p>
          <blockquote className="border-l-4 border-sage-300 pl-5 py-1 my-5">
            <p className="font-display text-2xl text-sage-900">{THE_CLAIM.statement}</p>
          </blockquote>
          <p className="mb-6 text-sage-700">{THE_CLAIM.qualifier}</p>

          <div className="space-y-4">
            {THE_REJECTIONS.map((r) => (
              <div
                key={r.id}
                id={r.id}
                className="bg-white/60 border border-sage-200 rounded-lg p-5"
              >
                <h3 className="font-display font-semibold text-sage-800 mb-2">{r.title}</h3>
                <p className="text-sm text-sage-700 leading-relaxed">{r.body}</p>
                <p className="mt-3 text-xs text-sage-500 italic">{r.source}</p>
              </div>
            ))}
          </div>
        </div>

        {/* The doctrine in three steps */}
        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-4">
            The doctrine, in three steps
          </h2>
          <div className="space-y-6">
            {DOCTRINE_STEPS.map((s) => (
              <div key={s.id} id={s.id}>
                <h3 className="font-display font-semibold text-sage-800 mb-2">{s.title}</h3>
                <p className="text-sage-700">{s.body}</p>
                <p className="mt-2 text-xs text-sage-500 italic">{s.source}</p>
              </div>
            ))}
          </div>

          {/* Unity of virtue — the step-three corollary */}
          <div
            id={UNITY_OF_VIRTUE.id}
            className="mt-8 bg-white/60 border border-sage-200 rounded-lg p-6"
          >
            <h3 className="font-display font-semibold text-sage-800 mb-2">
              {UNITY_OF_VIRTUE.title}
            </h3>
            <p className="text-sage-700">{UNITY_OF_VIRTUE.body}</p>
            <p className="mt-2 text-xs text-sage-500 italic">{UNITY_OF_VIRTUE.source}</p>

            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              {VIRTUE_DISPLAY.map((virtue) => (
                <div
                  key={virtue.id}
                  className="flex items-center gap-3 bg-sage-50/70 border border-sage-200 rounded-lg p-3"
                >
                  <img
                    src={virtue.icon}
                    alt=""
                    aria-hidden="true"
                    className="w-16 sm:w-20 h-auto flex-shrink-0"
                  />
                  <div>
                    <div className="font-display text-sm font-semibold text-sage-800">
                      {virtue.name}
                    </div>
                    <div className="text-xs text-sage-600">{virtue.description}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-sage-600 italic">
              Four sides of one excellence — not four skills to be held in different amounts.
            </p>
          </div>

          <p className="mt-8 font-display text-lg text-sage-800">
            And everything else follows from this.
          </p>
        </div>

        {/* Why this matters before you use anything */}
        <div className="bg-sage-100/60 border border-sage-200 rounded-lg p-6">
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">
            {TECHNIQUE_VS_DISPOSITION.title}
          </h2>
          <p className="text-sage-700">{TECHNIQUE_VS_DISPOSITION.body}</p>
        </div>

        {/* The practices, derived */}
        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-4">
            Everything else follows: the practices, derived
          </h2>

          <div id={DICHOTOMY_NOTE.id} className="mb-8">
            <h3 className="font-display font-semibold text-sage-800 mb-2">
              {DICHOTOMY_NOTE.title}
            </h3>
            <p className="text-sage-700">{DICHOTOMY_NOTE.body}</p>
            <p className="mt-2 text-xs text-sage-500 italic">{DICHOTOMY_NOTE.source}</p>
          </div>

          <div className="space-y-4">
            {PRACTICE_DERIVATIONS.map((d) => (
              <div
                key={d.id}
                className="bg-white/60 border border-sage-200 rounded-lg p-5"
              >
                <a
                  href={d.href}
                  className="font-display font-semibold text-sage-700 underline hover:text-sage-900"
                >
                  {d.title}
                </a>
                <p className="mt-2 text-sm text-sage-700 leading-relaxed">{d.descent}</p>
              </div>
            ))}
          </div>
        </div>

        {/* The doctrines behind the doctrines */}
        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">
            The doctrines behind the doctrines
          </h2>
          <p className="mb-6 text-sage-700">{BACKGROUND_INTRO}</p>

          <div className="space-y-6">
            {BACKGROUND_DOCTRINES.map((d) => (
              <div key={d.id} id={d.id}>
                <h3 className="font-display font-semibold text-sage-800 mb-2">{d.title}</h3>
                <p className="text-sage-700">{d.body}</p>
                <p className="mt-2 text-xs text-sage-500 italic">{d.source}</p>
              </div>
            ))}
          </div>

          <div
            id={THE_IDENTITY_CLAIM.id}
            className="mt-8 bg-white/60 border border-sage-200 rounded-lg p-6"
          >
            <h3 className="font-display font-semibold text-sage-800 mb-2">
              {THE_IDENTITY_CLAIM.title}
            </h3>
            <p className="text-sage-700">{THE_IDENTITY_CLAIM.body}</p>
            <p className="mt-2 text-xs text-sage-500 italic">{THE_IDENTITY_CLAIM.source}</p>
          </div>

          <div className="mt-6 border-l-4 border-sage-300 pl-5">
            <h3 className="font-display font-semibold text-sage-800 mb-2">
              {HONEST_NOTE.title}
            </h3>
            <p className="text-sage-700">{HONEST_NOTE.body}</p>
          </div>
        </div>

        {/* Why declaring a purpose matters */}
        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">
            {CALLING_FOUNDATION.title}
          </h2>
          <p className="text-sage-700">{CALLING_FOUNDATION.body}</p>
        </div>

        {/* The moral community */}
        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">
            {MORAL_COMMUNITY.title}
          </h2>
          <p className="text-sage-700">{MORAL_COMMUNITY.body}</p>
          {/* The caveat is the load-bearing honesty qualifier on the riskiest claim on this
              page — it is what keeps it from being an overclaim. It is deliberately NOT
              typographically demoted beneath the assertion it qualifies. */}
          <div className="mt-4 border-l-4 border-sage-300 pl-5">
            <p className="text-sage-700">{MORAL_COMMUNITY.caveat}</p>
          </div>
        </div>

        {/* Closing */}
        <div className="pt-8 border-t border-sage-200">
          <p className="text-sage-700">{CLOSING.body}</p>
          <p className="mt-6 text-sage-700">
            Where to begin:{' '}
            <a href="/welcome" className="text-sage-600 underline hover:text-sage-800">
              the orientation for new practitioners
            </a>{' '}
            sets out a few things worth trying first, and{' '}
            <a href="/methodology" className="text-sage-600 underline hover:text-sage-800">
              the methodology
            </a>{' '}
            explains how a reading is actually produced.
          </p>
        </div>

      </section>
    </div>
  )
}
