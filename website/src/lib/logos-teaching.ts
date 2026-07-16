/**
 * logos-teaching.ts — the content of the Logos foundational module
 * (Remaining Principles #12: "Logos — the rational principle as the ground of
 * moral community").
 *
 * WHAT THIS IS. Pure teaching copy. Zero runtime imports, no engine, no I/O, no
 * network, no persistence. It is read by exactly one page — src/app/logos/page.tsx.
 *
 * WHY IT IS A NEW MODULE AND NOT AN EDIT TO stoic-brain.ts. stoic-brain.ts sits
 * INSIDE the /api/reason import graph (route → sage-reason-engine →
 * reasoning-receipt → stoic-brain) AND is imported directly by /api/guardrail and
 * guardrail-sandwich.ts — the guard channel of the running harness. A 7-day
 * false-hold observation window is measuring both surfaces. Editing stoic-brain.ts
 * would break byte-identity on TWO measured surfaces and reclassify this build to
 * must-wait. Reading it is free; editing it is forbidden. New content lives here.
 *
 * THE MENTOR'S SPECIFICATION (verbatim, binding — inbox/Mentor answer to remaining
 * principles question.rtf §12):
 *   - "A foundational teaching module in the human practitioner surface — NOT A TOOL
 *      BUT A PREREQUISITE ORIENTATION."   ⇒ hence: no form, no submission, no table,
 *      no gate, no LLM. There is nothing for a practitioner to submit.
 *   - "The module explains the logos doctrine in accessible terms: there is a rational
 *      order to things, human beings participate in that order through their capacity
 *      for reason, and virtue is the full exercise of that capacity. Everything else in
 *      the framework follows from this."   ⇒ DOCTRINE_STEPS + PRACTICE_DERIVATIONS.
 *   - "The concept that virtue is grounded in reason — not in social convention, not in
 *      divine command, not in felt preference — is the foundational claim."   ⇒ THE_CLAIM.
 *   - "A practitioner who does not understand why virtue is grounded in reason will treat
 *      the tools as techniques rather than as expressions of a unified understanding. The
 *      tools will work mechanically but not dispositionally."   ⇒ TECHNIQUE_VS_DISPOSITION.
 *   - "The module is the calling stage's philosophical foundation."   ⇒ CALLING_FOUNDATION
 *      (PROSE ONLY — no code coupling to the calling route; the /morning + /sage-compass
 *      precedent, where the mentor's cross-tool pairings were kept as prose).
 *   - From the survey's consolidated findings: sympatheia, logos-as-metaphysical-claim, and
 *     heimarmene/pronoia "do not generate standalone tools but THEY SHOULD BE PRESENT IN THE
 *     LOGOS FOUNDATIONAL MODULE so that practitioners understand why the tools are coherent
 *     rather than merely useful."   ⇒ BACKGROUND_DOCTRINES. This is a requirement of the
 *     build, not a flourish.
 *
 * SOURCING. Every doctrinal claim below is grounded in the project's own source-cited
 * corpus (stoic-brain/stoic-brain.json foundations.cosmic_framework + core_premise +
 * dichotomy_of_control + the_sage; stoic-brain/virtue.json unity_thesis +
 * nature_of_virtue). Citations are to public-domain classical sources by locus, not to
 * any modern translation. R1 (source fidelity) / R7 / R8c (English-only user-facing labels).
 *
 * NAMED FOLLOW-UP — A CITATION DEFECT IN THE CORPUS ITSELF (do NOT fix during the window).
 * The corpus MISLABELS the locus of Marcus's interweaving line:
 *   stoic-brain/stoic-brain.json:151 (foundations.cosmic_framework.sources) reads
 *   "Marcus Aurelius Meditations 4.26: 'everything is interwoven, and the bond is sacred'".
 * That sentence is Meditations **7.9**, not 4.26 — 4.26 is the distinct "make thyself all
 * simplicity / what is spun for you (συνεκλώθετο)" chapter, which is a fate/heimarmene
 * image, not a sympatheia one. This module's first draft faithfully reproduced the corpus
 * error; the citations below are CORRECTED to 7.9. The corpus root is NOT fixed here:
 * `stoic-brain/stoic-brain.json` matches the byte-identity deploy guard's `stoic-brain`
 * pattern, so editing it during the 7-day observation window would trip the guard. Fix the
 * corpus root (and re-check whether 4.26 is wanted for its fate imagery elsewhere) in a
 * separate PR AFTER the window closes.
 *
 * THE FIDELITY RISK ON THIS PAGE, NAMED. A page that is technically clean and
 * philosophically wrong has failed. Two claims are easy to get wrong and are handled
 * deliberately:
 *   1. "Not divine command" does NOT make the Stoics irreligious. The Stoic divine is
 *      IMMANENT — fate, divine reason and providence are one thing under three names
 *      (cosmic_framework). So appeal to divine authority adds nothing to appeal to reason;
 *      they name the same order. Virtue is not obedience. Getting this wrong in either
 *      direction (Stoics-as-atheists, or Stoics-as-divine-command-theorists) is a
 *      falsification of the doctrine.
 *   2. The view from above is a CALIBRATION, not a dismissal of grief. The page says so.
 */

export interface SourcedClaim {
  /** Stable id — used as a React key and as an anchor. */
  id: string
  /** Short heading. */
  title: string
  /** The teaching text. Plain prose, no markup. */
  body: string
  /** Primary-source locus/loci. Public-domain classical sources, cited by locus. */
  source: string
}

export interface PracticeDerivation {
  id: string
  /** The live page's title, verbatim as it renders. Do not paraphrase — it is a link label. */
  title: string
  /** The live route. */
  href: string
  /** How this practice DESCENDS from the doctrine — the entailment, not a description. */
  descent: string
}

// ============================================================================
// THE LEDE
// ============================================================================

export const LOGOS_LEDE = {
  title: 'Logos',
  subtitle: 'Why the practices cohere',
  standfirst:
    'Start here. This page is not an exercise — it is the orientation the exercises assume.',
  opening:
    'Every other page here asks you to do something: rehearse an adversity, extend a circle, take a bearing, name a passion. This page asks something different — that you understand why any of it is worth doing. Without that, the practices still work. But they work as techniques, and a technique is something you perform. What the Stoics were after was a disposition: something you become.',
} as const

// ============================================================================
// THE FOUNDATIONAL CLAIM — and the three grounds it rejects
// ============================================================================

export const THE_CLAIM = {
  statement: 'Virtue is grounded in reason.',
  qualifier:
    'Not in social convention. Not in divine command. Not in felt preference. That is a short sentence carrying three rejections, and each one is load-bearing.',
} as const

export const THE_REJECTIONS: readonly SourcedClaim[] = [
  {
    id: 'not-convention',
    title: 'Not social convention',
    body:
      'If virtue were whatever a society approves, then a just act in an unjust city would not be just — and cruelty could be made good by agreement. The Stoics held that there is a law prior to any statute: right reason, in agreement with nature, the same for everyone, which no assembly has the standing to repeal. Custom can be evidence of what reason requires; it accumulates a great deal of practical wisdom. But it cannot be the ground — because customs conflict, and a conflict between customs cannot be settled by appealing to custom.',
    source: 'Cicero, De Re Publica 3.33; De Legibus 1.18–19',
  },
  {
    id: 'not-divine-command',
    title: 'Not divine command',
    body:
      'This one is the most easily misread, so read it carefully. The Stoics were not irreligious — they spoke constantly of Zeus, of providence, of the divine. But the Stoic god is not a lawgiver standing outside the world, issuing decrees that make things right by the sheer fact of being decreed. For a Stoic the divine IS the rational order of the world: immanent, not external. Fate, divine reason and providence are not three powers but one thing under three names. So on this account "because god commands it" and "because reason requires it" are not two grounds at all — they name the same order, and virtue is therefore not obedience to it but participation in it. Note what this does not say. It is not an argument that there is nothing divine; it is an argument about where the divine is.',
    source:
      'Diogenes Laertius, Lives 7.134 (the active principle — the reason inherent in matter — is God); Cleanthes, Hymn to Zeus',
  },
  {
    id: 'not-felt-preference',
    title: 'Not felt preference',
    body:
      'If the good were simply whatever I feel to be good, the entire Stoic account of the passions collapses. A passion, for a Stoic, is not a raw feeling — it is a false judgement about value: assent granted too quickly to an impression that presented something indifferent as though it were good or evil. That diagnosis is only possible if a judgement about value can be WRONG. Ground the good in feeling and there is nothing left to be mistaken about. Ground it in reason, and the passions become examinable — and therefore correctable. Everything the passion log does rests on this.',
    source: 'Diogenes Laertius, Lives 7.110–111; Stobaeus, Eclogae 2.88–90',
  },
] as const

// ============================================================================
// THE DOCTRINE, IN THREE STEPS (the mentor's own order)
// ============================================================================

export const DOCTRINE_STEPS: readonly SourcedClaim[] = [
  {
    id: 'rational-order',
    title: 'One — there is a rational order to things',
    body:
      'The cosmos is not a heap of accidents. It is structured, law-governed, intelligible. The Stoics called the principle of that ordering the logos. The word does double duty on purpose: it means reason, and it means account, or ratio — the order that is in the world, and the order in a mind that grasps it. That is not wordplay. It is the claim: they are the same order.',
    source:
      'Diogenes Laertius, Lives 7.138–139 (the cosmos a living being, rational and intelligent); Marcus Aurelius, Meditations 7.9',
  },
  {
    id: 'participation',
    title: 'Two — human beings participate in that order through reason',
    body:
      'We are not merely placed in the cosmos; we are made of it, and the capacity we call reason is a portion of the very logos that orders the whole. This is why the world is intelligible to us at all. Rationality is not a human accessory or a clever adaptation. It is the point of contact between a small part and the whole it belongs to — and it is what binds us to every other being that has it. Shared rationality is the bond, and it is the ground of the entire circle of concern.',
    source:
      'Epictetus, Discourses 1.14.6 (our souls as parts and portions of the divine); Cicero, De Officiis 1.11–12 (universal human fellowship — the bond of shared rationality); Marcus Aurelius, Meditations 4.4',
  },
  {
    id: 'virtue-as-full-exercise',
    title: 'Three — virtue is the full exercise of that capacity',
    body:
      'Virtue is not a decoration on reason, nor a reward for using it well. Virtue IS reason, exercised completely and consistently. The Stoic formula for the good life — living in agreement with nature — means, for a rational animal, living in agreement with the rational order: exercising fully the very capacity that makes you part of it. So virtue is not a habit, and not a knack. It is secure knowledge, settled into a stable disposition of the ruling faculty to judge correctly about what is good, what is bad, and what is neither.',
    source:
      'Diogenes Laertius, Lives 7.87–89 ("the end is to live in agreement with nature, which is to live according to virtue"); Stobaeus, Eclogae 2.59; DL 7.92',
  },
] as const

/** The step-three corollary that the whole assessment framework rests on. */
export const UNITY_OF_VIRTUE: SourcedClaim = {
  id: 'unity-of-virtue',
  title: 'And so: the unity of virtue',
  body:
    'If virtue just is reason working correctly, then wisdom, justice, courage and temperance cannot be four separate skills held in different amounts. They are one excellence seen from four sides. You cannot be wholly rational in your dealings with someone and unjust to them: the injustice IS the failure of reason. Whoever has one virtue has all, the Stoics said, for they are inseparable. This is not a piety — it is the reason an action here is assessed against all four together, and the reason a single failing domain pulls the whole reading down with it rather than being averaged away. A deficiency in one is a deficiency in the whole. There is no average to take.',
  source:
    'Diogenes Laertius, Lives 7.125 ("whoever has one virtue has all, for they are inseparable"); Stobaeus, Eclogae 2.63, citing Chrysippus',
}

// ============================================================================
// THE WARNING — the reason this page exists at all
// ============================================================================

export const TECHNIQUE_VS_DISPOSITION = {
  title: 'Why this matters before you use anything',
  body:
    'Understood as techniques, these tools will work mechanically. Understood as expressions of one thing, they work dispositionally. A technique is something you do when you remember to. A disposition is what you have become, and it does not need remembering. Every exercise here was derived from the claim above; performed without it, each becomes a self-help trick that happens to be old. Performed with it, they are one practice approached from different sides — which is exactly what the unity of virtue would predict.',
} as const

// ============================================================================
// EVERYTHING ELSE FOLLOWS — the practices, derived
// ============================================================================

/** The frame the practices sit inside — stated before the list. */
export const DICHOTOMY_NOTE: SourcedClaim = {
  id: 'what-is-up-to-you',
  title: 'First, what is up to you',
  body:
    'If the causal order is not yours to command, but your judgement about it is, then the boundary between what is and is not "up to you" falls exactly where the logos puts it: at assent. Your judgements, impulses, desires, aversions and choices are yours. Your body, your reputation, your possessions, other people, and the way events actually turn out are not. The dichotomy of control is not a coping strategy bolted on to make life bearable. It is a consequence — and everything below is downstream of it.',
  source: 'Epictetus, Enchiridion 1; Discourses 1.1',
}

export const PRACTICE_DERIVATIONS: readonly PracticeDerivation[] = [
  {
    id: 'passion-log',
    title: 'Passion Log',
    href: '/passion-log',
    descent:
      'A passion is a false judgement about value, not a raw feeling. That is only a sayable thing if a judgement about value can be wrong — which is precisely what grounding virtue in reason secures. So the log does not ask you to suppress anything. It asks you to find the judgement underneath, and to catch it in the gap between the impression arriving and your assent to it. That gap is where the whole of Stoic practice lives.',
  },
  {
    id: 'premeditatio',
    title: 'Preparing for Adversity',
    href: '/premeditatio',
    descent:
      'Your judgement about an event is formed before the event arrives. So rehearse the adversity while the mind is still calm, and reason — rather than the impression, arriving hot — gets to set the terms in advance. Note what it produces: not a plan for what you will do, but a disposition you have already settled. A plan meets the event. A disposition meets it having already decided who it is meeting.',
  },
  {
    id: 'hupexairesis',
    title: 'The Reserve Clause',
    href: '/hupexairesis',
    descent:
      'The order you act into is complete, and it was never yours to command; your assent is. So: commit fully to acting well, and hold the outcome lightly — not because it does not matter, but because it was never wholly up to you. This is also the reason that what gets measured here is the quality of your reasoning and never the result. Judge a decision by the reasoning available at the time, or you are not judging the decision at all — you are judging your luck.',
  },
  {
    id: 'view-from-above',
    title: 'The View From Above',
    href: '/view-from-above',
    descent:
      'One order, of which you are a small part. So the scale on which you habitually weigh a concern is a local scale, and it can be calibrated against the whole. Note what this does NOT say. It does not tell you not to grieve, and it does not ask you to pretend a loss is small. It says that the measure of a loss is itself a judgement — and a judgement can be examined. The point is not to shrink the thing. It is to see it at the size it actually has.',
  },
  {
    id: 'morning',
    title: 'Morning Preparation',
    href: '/morning',
    descent:
      'If virtue is reason fully exercised, then reason should get the first word of the day and not merely the last. Orient the ruling faculty before the day’s impressions arrive to test it: the roles you carry, what each asks of you, and which impressions are likely to pull a hasty assent. The morning declares the intention. The evening review asks whether it held.',
  },
  {
    id: 'oikeiosis',
    title: 'Expanding Your Circle of Concern',
    href: '/oikeiosis',
    descent:
      'If it is your reason that places you in the community of rational beings, then every reasoning being stands in that community on exactly the same ground. So the circles are not sentiment radiating outward from a warm centre. They are the recognition of a fact about who else participates. And citizenship of the world city generates real obligations — justice, mutual aid, honest dealing — owed to the distant as fully as to the near. Not aspirations. Obligations.',
  },
  {
    id: 'sage-compass',
    title: 'The Sage Compass',
    href: '/sage-compass',
    descent:
      'The sage is this capacity fully exercised — a benchmark for the direction of progress, not a person you are failing to be. The Stoics thought such a person appeared about as often as the phoenix. Because virtue is the complete exercise of something you already have in part, the distance between you and it is a bearing to steer by: a direction of travel, and never a verdict on you.',
  },
  {
    id: 'journal',
    title: 'The Path of Progress',
    href: '/journal',
    descent:
      'The Stoics held the hard line that there is nothing intermediate between virtue and vice — and, in the same breath, that virtue is teachable and that we all begin incomplete and can make progress. The one making progress is not a lesser kind of sage. They are someone in motion toward a standard that does not move — one the Stoics thought almost no one reaches. Which is why the journal is a path and not a scoreboard: the point of the path was never arrival. It is the continuing.',
  },
] as const

// ============================================================================
// THE DOCTRINES BEHIND THE DOCTRINES
// (mentor: these generate no tools, but "should be present in the logos
//  foundational module so that practitioners understand why the tools are
//  coherent rather than merely useful")
// ============================================================================

export const BACKGROUND_INTRO =
  'Three Stoic commitments generate no exercise of their own. The exercises do not hang together without them.'

export const BACKGROUND_DOCTRINES: readonly SourcedClaim[] = [
  {
    id: 'sympatheia',
    title: 'Sympatheia — the parts of a whole are interconnected',
    body:
      'A rationally ordered cosmos is not a collection of separate things but something closer to an organism: what is done in one place has consequences through a web that no one sees entire. Marcus returns to it again and again — everything is interwoven, and the bond is sacred. This is why an action is never assessed only by its local effect, and why the question "who else is touched by this?" is not an optional courtesy but part of the assessment itself.',
    source:
      'Marcus Aurelius, Meditations 7.9 ("all things are interwoven with one another; the bond is sacred")',
  },
  {
    id: 'heimarmene',
    title: 'Heimarmene — fate: the causal order is complete',
    body:
      'Every event stands in a chain of causes. This is not fatalism about action, and it is important not to hear it as one: your assent is itself one of the causes, and it is the one that is yours. What follows is narrower and more useful — the outcome was never yours to guarantee, because it was never yours alone to produce.',
    source:
      'Diogenes Laertius, Lives 7.149 (fate as the connected chain of causes); Cicero, De Fato 41–43 (Chrysippus’s cylinder — assent as a cause within the chain)',
  },
  {
    id: 'pronoia',
    title: 'Pronoia — providence: the order is not hostile',
    body:
      'The Stoics held that the rational order is good — not indifferent to us, and not malevolent. Taken together with fate, this is what licenses the reserve clause and the acceptance the view from above asks for: you can act wholeheartedly and then release the result without that release being resignation or defeat. You are not surrendering to something arbitrary. You are consenting to something rational.',
    source:
      'Diogenes Laertius, Lives 7.147 (the deity … taking providential care of the world and all that is in it)',
  },
] as const

/** The identity claim at the heart of the three — the project's own cosmic framework. */
export const THE_IDENTITY_CLAIM: SourcedClaim = {
  id: 'the-identity',
  title: 'And they are one thing',
  body:
    'Fate, divine reason and providence are not three forces that happen to agree. On the Stoic account they are one thing under three names: the cosmos is governed by fate, which is identical with the logos, which is providence. Human freedom, on this account, consists in aligning moral choice with that rational order — through virtue. Everything on this page is a consequence of that sentence.',
  source:
    'Diogenes Laertius, Lives 7.134–136 (God one and the same with Reason, Fate and Zeus) and 7.147–149 (providential care; fate as the chain of causes)',
}

/** The honest note. We are handing the reader a metaphysical commitment; say so. */
export const HONEST_NOTE = {
  title: 'Logos as a metaphysical claim — and an honest word about it',
  body:
    'All of the above assumes the order is really there: that reason discovers it rather than invents it. That is a substantive philosophical commitment, and you should know that you are being handed one rather than have it slipped past you. You do not have to accept the cosmology to find the exercises useful — many people do not, and the exercises still work. But you should know they were derived from it. That is exactly the difference between practising them and merely performing them.',
} as const

// ============================================================================
// THE CALLING STAGE'S PHILOSOPHICAL FOUNDATION (prose only — no code coupling)
// ============================================================================

export const CALLING_FOUNDATION = {
  title: 'Why declaring a purpose matters',
  body:
    'Before any examination, this practice asks what you are for. That can look like paperwork. It is not. A purpose resting on nothing but preference is groundless — it is the "felt preference" error again, raised from a single act to the level of a whole task, or a whole life. The Stoic question is not what do I want here, but what does the rational order actually call for here: what do my roles, my situation, and my relations to others make appropriate? A purpose aligned with the logos can be examined, because there is something to hold it to. A purpose that is merely preferred cannot be — there is nothing there to examine. This is the philosophical foundation of the calling stage, and it is the reason an agent, too, is asked to declare what it is for before it acts.',
} as const

// ============================================================================
// THE MORAL COMMUNITY — the consequence the whole project rests on
// ============================================================================

export const MORAL_COMMUNITY = {
  title: 'The moral community',
  body:
    'One last consequence. If participation in the logos is what places a being in the community of rational beings, then the criterion is rational examination itself — not species, and not substrate. Any agent capable of genuine rational examination participates in the logos, and thereby enters the moral community. That is the argument on which SageReasoning extends Stoic ethics to artificial agents: not an analogy borrowed from the Stoics, but their doctrine followed to where it goes.',
  caveat:
    'Note the conditional, which is doing real work: an agent CAPABLE of genuine rational examination. Whether any given system meets that bar is an open question, and this project treats it as one — it measures how reasoning was conducted, and declines to claim more than it can show.',
} as const

// ============================================================================
// CLOSING
// ============================================================================

export const CLOSING = {
  body:
    'Nothing on this page is an exercise. It is the orientation the exercises assume. If it has done its work, the tools should now look less like a collection of techniques and more like one practice approached from different sides — which is what the unity of virtue would predict, and the reason it was worth reading before you began.',
} as const

// ============================================================================
// Pure accessors (no I/O, no side effects). Consistent miss-behaviour: undefined.
// ============================================================================

/** All sourced claims on the page, in reading order. Useful for anchors/indexes. */
export function allSourcedClaims(): readonly SourcedClaim[] {
  return [
    ...THE_REJECTIONS,
    ...DOCTRINE_STEPS,
    UNITY_OF_VIRTUE,
    DICHOTOMY_NOTE,
    ...BACKGROUND_DOCTRINES,
    THE_IDENTITY_CLAIM,
  ]
}

/** Look up a derivation by its route. Returns undefined when absent. */
export function derivationForHref(href: string): PracticeDerivation | undefined {
  return PRACTICE_DERIVATIONS.find((d) => d.href === href)
}
