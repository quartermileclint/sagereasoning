/**
 * /limitations — User-facing limitations page
 *
 * Rule R19c: "Create user-facing limitations page."
 * Rule R19d: "Mirror principle — the system must reflect its own limitations honestly."
 *
 * This page exists because the Ethical Analysis (R17-R20 source document) states:
 * "Honest positioning is not optional." Users deserve to know what this tool
 * cannot do before they rely on it.
 */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Limitations — SageReasoning',
  description: 'What SageReasoning can and cannot do. Honest disclosure of our limitations.',
}

export default function LimitationsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 font-body text-sage-800">

      <div className="mb-10">
        <h1 className="font-display text-3xl font-medium text-sage-900 mb-2">
          What SageReasoning Cannot Do
        </h1>
        <p className="text-sage-600 text-sm">
          Honest disclosure of our limitations, because the Stoics taught that
          self-knowledge begins with knowing what you do not know.
        </p>
      </div>

      <section className="space-y-8 leading-relaxed">

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">
            We are not therapists
          </h2>
          <p>
            SageReasoning provides philosophical perspectives based on Stoic virtue ethics.
            It is not a mental health service, counselling tool, or therapeutic intervention.
            If you are experiencing psychological distress, please contact a qualified
            mental health professional or crisis service. Our tool cannot and should not
            replace that support.
          </p>
          {/* Mentor-ruled wording, 2026-08-18 Q3 (AMENDS the 2026-08-17 ruling's
              instruction to publish A3's original "every time" wording — that
              instruction was superseded the next day when adversarial review found
              the exhaustiveness sweep itself structurally incomplete once, within
              24 hours of being built). Verbatim from
              operations/agent-circles-2026-08/2026-08-18-mentor-rulings-perimeter-claim-bounds-and-curiosity-scoping-verbatim.md
              — do not compress below this, do not paraphrase looser, and do not
              drop the "found incomplete once" clause; that clause is the entire
              substance of the bound. */}
          <p className="mt-3">
            The distress check runs on every surface the sweep can see. The sweep is a
            mechanism: it has been found structurally incomplete once, corrected, and
            hardened with a regression pin. It is the strongest verification we can
            honestly offer, not a guarantee of exhaustiveness.
          </p>
          {/* The M-5 disclosure — mentor named this "the more important half" of
              the claim (2026-08-17 ruling) and directed it "remain prominent in
              whatever wording is eventually published." M-5 (the write path for
              genuine distress detections) is not built; this says so plainly. */}
          <p className="mt-3 font-medium">
            If the check catches something, you receive an in-session redirect to crisis
            resources &mdash; and that is all that happens. Nothing is monitored
            afterwards, no one is notified, and there is no follow-up. We have built the
            detection; we have not yet built what should happen after it. If you are in
            crisis, please contact a crisis line or emergency services directly
            &mdash; do not rely on this tool to reach anyone on your behalf.
          </p>
        </div>

        {/* Required factual amendment — mentor's website-page feedback
            (`inbox/Mentor feedback on website pages.rtf`, 2026-07-17), applied
            2026-08-10: "The current wording implies Claude generates the entire
            evaluation. The deterministic Layer 2 engine is not Claude-generated.
            This misrepresents the system and should be corrected."

            The wording below deliberately splits the two surfaces rather than
            adopting the mentor's single formulation ("the core reasoning is
            produced by a deterministic engine"), because that formulation is
            true of the agent-facing API only. Verified first-hand at the time
            of this amendment: every human-facing evaluation route (/score,
            /score-*, /journal, /private-mentor, /baseline, /api/mentor/*) calls
            `runSageReason` — a single Claude call. The deterministic Layer-2
            sandwich is live on the agent surfaces (/api/reason, /api/guardrail,
            accreditation, calling, practice/reflect) only. Claiming a
            deterministic core for the practitioner tools would have replaced one
            false statement with another. Recorded as a PR20 finding for the
            mentor's next consultation. Do not "simplify" this back into a single
            blanket claim in either direction.

            CONSULTED AND RULED — M4, 2026-08-15 (verbatim record:
            operations/handoffs/founder/2026-08-15-mentor-response-concurrent-arc-M1-M7-verbatim.md):
            "The per-surface formulation stands as the durable wording. A single
            formulation that is true of both surfaces is not achievable without
            either overstating the agent surface or understating the human
            surface." This comment is LOAD-BEARING DOCUMENTATION per that ruling,
            not an advisory note. */}
        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">
            Where the AI does the reasoning &mdash; and where it does not
          </h2>
          <p>
            The practitioner tools on this site &mdash; scoring an action, the journal,
            the private mentor, the baseline &mdash; produce their evaluations with an AI
            language model (Anthropic&rsquo;s Claude) working from our Stoic framework.
            AI models can produce outputs that are plausible-sounding but incorrect, miss
            important context, or reflect biases in their training data. Treat those
            readings as one perspective to consider, not as authoritative judgements
            about your character or decisions.
          </p>
          <p className="mt-3">
            Our agent-facing API works differently, and it is worth being precise about
            it rather than describing the whole system as &ldquo;AI-generated.&rdquo; It runs
            in three layers: Claude reads your text and extracts a structured set of
            features from it; a <strong>deterministic, non-AI computation</strong> then
            scores those features &mdash; the proximity rank, the assessment of whether the
            act was fitting, the signed verdict &mdash; so the same features always yield the
            same result and the verdict can be independently reproduced; finally Claude
            renders that result into prose.
          </p>
          <p className="mt-3">
            That middle layer removes a real source of variability, and it is the part of
            the system we are willing to have checked. It does not make the result
            infallible. The arithmetic is only ever as good as the features the first layer
            extracted, and a misreading there propagates silently into a confident-looking
            number. Nor does any layer check whether what you told us is true: the system
            reads <em>how</em> a decision was reasoned, not whether it was factually
            correct.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">
            Stoicism is one philosophical tradition among many
          </h2>
          <p>
            Our reasoning framework is grounded in ancient Stoic philosophy. While we believe
            this tradition offers valuable insights, it is one ethical framework among many.
            SageReasoning does not claim that Stoic reasoning is universally correct, superior
            to other ethical traditions, or applicable to every situation. Other philosophical
            traditions (virtue ethics, deontology, consequentialism, care ethics, Ubuntu,
            Buddhist ethics, and many others) offer legitimate and valuable perspectives
            that our framework does not capture.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">
            Stoicism emphasises the individual, not the system
          </h2>
          <p>
            Stoicism historically emphasised individual virtue over systemic critique.
            It has comparatively little to say about collective action, structural
            injustice, or the value of dissent &mdash; areas where other traditions
            (political philosophy, liberation ethics, critical theory, and others) offer
            far more. SageReasoning will help you examine your own judgements and
            responses; it is not a tool for analysing unjust systems, organising
            collective change, or deciding when principled dissent is called for. Treat
            its relative silence on these questions as a real limit of the framework,
            not as a sign that they do not matter.
          </p>
          <p className="mt-3 text-sage-600 text-sm italic">
            Rule R19c: The framework&rsquo;s known limitations must be documented and
            accessible.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">
            We cannot assess your full situation
          </h2>
          <p>
            When you submit an action or decision for evaluation, you provide a text description.
            That description is necessarily incomplete. We cannot know your full emotional state,
            your relationships, your cultural context, your physical health, your financial
            situation, or the thousand other factors that shape a real human decision.
            Our evaluations work with what you tell us, which is always a simplification
            of reality.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">
            Passion diagnosis is not clinical diagnosis
          </h2>
          <p>
            Our Stoic passion taxonomy identifies patterns in reasoning that ancient Stoics
            called &ldquo;passions&rdquo; (false judgements about what is good or bad). This is a
            philosophical framework for self-examination, not a psychological or clinical
            assessment. Identifying a &ldquo;passion&rdquo; in your reasoning does not mean you have
            a psychological disorder. If you find that our passion diagnoses are causing
            distress rather than insight, please stop using the tool and consider speaking
            with a professional.
          </p>
          <p className="mt-3 text-sage-600 text-sm italic">
            Rule R20d: We specifically discourage applying the passion taxonomy to other
            people&rsquo;s behaviour. It is designed for self-examination only.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">
            A mirror, not a lens
          </h2>
          <img
            src="/images/mirror.PNG"
            alt="The Mirror — for examining your own reasoning, not other people's"
            className="w-full max-w-sm h-auto mx-auto mb-5 drop-shadow-md"
          />
          <p>
            SageReasoning is a mirror, not a lens: it is built for examining your own
            reasoning, not for diagnosing, judging, or scoring other people. Applying the
            framework to evaluate someone else&rsquo;s character, passions, or reasoning
            &mdash; especially without their knowledge and consent &mdash; is a
            misapplication, however internally consistent the analysis may seem. Using
            Stoic or philosophical language to invalidate another person&rsquo;s feelings
            or reasoning is never a legitimate use of this tool. The only reasoning you
            can rightly assess here is your own.
          </p>
          <p className="mt-3 text-sage-600 text-sm italic">
            Rule R19d: The mirror principle &mdash; the framework is for examining your
            own reasoning, and the mentor and all tools actively discourage applying it
            to other people without their knowledge and consent.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">
            Agent trust certification is not a guarantee
          </h2>
          <p>
            Sage Assent evaluates AI agents&rsquo; reasoning quality against Stoic
            principles. A trust certification from SageReasoning does not guarantee that
            an agent will behave safely, ethically, or correctly in all situations. It
            indicates how well the agent&rsquo;s reasoning aligns with Stoic virtue at the
            time of assessment. Agent behaviour can change, and our assessments have the
            same AI limitations described above.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">
            A configuration without Sage Reflect is not an ongoing practice
          </h2>
          <p>
            This configuration — SageReasoning with Sage Assent, without Sage Reflect —
            supports virtue-grounded reasoning and credentialing within individual sessions.
            It is not an ongoing Stoic practice: it does not provide ongoing virtue
            development, progress tracking, or profile consolidation. Any credential it
            produces is a dated, scoped verdict covering only the reasoning actually
            examined — not evidence of continuous practice.
          </p>
          <p className="mt-3 text-sage-600 text-sm italic">
            Rule R19e: Where the products are offered selectively, each configuration is
            documented for what it supports and does not support.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">
            We are a startup with one founder
          </h2>
          <p>
            SageReasoning is a pre-launch startup operated by a sole founder. We do not
            have the resources of a large organisation. Our uptime, support response times,
            and development pace reflect this reality. We are committed to building
            something principled, but we are building it honestly and incrementally.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">
            A trust record can say less than it appears to
          </h2>
          <p>
            The public trust record reports how an agent&rsquo;s decisions were reasoned,
            drawn from signed examination artifacts. It also carries a field named{' '}
            <em>provenance gaps</em> &mdash; examinations whose origin we could not verify.
            That field is <strong>empty for every agent today, and stays empty until
            enforcement begins.</strong> An empty list means the check that would populate
            it has never run in production. It does not mean no gaps exist.
          </p>
          <p className="mt-3">
            The same caution applies when the endpoint reports that it holds no record for
            an agent. That answer means we hold no examined evidence for it and no
            provenance-gap entry the record can surface. It is an honest miss, never a low
            score, and never a finding about that agent&rsquo;s reasoning.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">
            Independence matters
          </h2>
          <p>
            Rule R20b: If you find yourself relying on SageReasoning scores to make every
            decision, that dependency is itself contrary to Stoic principles. The goal is
            to develop your own capacity for principled reasoning, not to outsource it
            permanently to an AI. If you notice this pattern in yourself, we encourage you
            to step back and practice reasoning without the tool for a while.
          </p>
        </div>

        <div className="mt-10 pt-8 border-t border-sage-200">
          <p className="text-sage-600 text-sm">
            These limitations are not a disclaimer designed to protect us legally (though
            they do serve that purpose). They reflect our genuine belief that honest
            self-knowledge — including knowledge of what we cannot do — is the foundation
            of everything we build. The Stoics called this <em>phronesis</em>: practical
            wisdom that begins with understanding your own boundaries.
          </p>
        </div>

      </section>
    </div>
  )
}
