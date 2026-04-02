/**
 * The Path of the Prokoptos — 55-Day Stoic Journal (V3)
 *
 * Derived from SageReasoning V3 dataset (8 data files).
 * Phase count (8) and day count (55) emerged from V3's conceptual structure.
 *
 * V3 Derivation:
 * - V1 had 7 phases / 56 days derived from 5 data files.
 * - V3 has 8 phases / 55 days derived from 8 data files.
 * - Each phase maps to a V3 conceptual domain.
 * - Each day teaches one distinct concept traceable to a V3 source citation.
 *
 * Rules applied:
 * - R1: All content framed as philosophical exercise, not therapeutic practice.
 * - R7: Every teaching traces to a cited primary source.
 * - R8c: English-only — no Greek or Latin terminology in user-facing content.
 * - R9: No outcome promises — framed as "practice path" not "transformation."
 */

export interface JournalEntry {
  day: number
  phase: number
  phaseTitle: string
  title: string
  teaching: string
  question: string
  /** Which virtue domain this entry primarily engages, if any */
  virtue?: 'wisdom' | 'justice' | 'courage' | 'temperance'
  /** V3 source file this concept derives from (R7 traceability) */
  sourceFile: string
  /** Primary source citation (R7) */
  sourceCitation: string
}

export interface JournalPhase {
  number: number
  title: string
  days: string
  description: string
  /** V3 data file this phase derives from */
  sourceFile: string
}

export const PHASES: JournalPhase[] = [
  {
    number: 1,
    title: 'Foundations',
    days: '1–7',
    description: 'The core premises of Stoic philosophy that everything else builds on.',
    sourceFile: 'stoic-brain.json',
  },
  {
    number: 2,
    title: 'The Architecture of Mind',
    days: '8–14',
    description: 'How impressions become beliefs, impulses, and actions — the mechanism behind every choice.',
    sourceFile: 'psychology.json',
  },
  {
    number: 3,
    title: 'What We Value and Why',
    days: '15–21',
    description: 'Genuine goods, genuine evils, and the indifferents we spend most of our lives pursuing.',
    sourceFile: 'value.json',
  },
  {
    number: 4,
    title: 'The Unity of Excellence',
    days: '22–28',
    description: 'The four expressions of virtue and why they cannot be separated.',
    sourceFile: 'virtue.json',
  },
  {
    number: 5,
    title: 'When Judgement Goes Wrong',
    days: '29–37',
    description: 'The passions as false judgements — identifying them, diagnosing them, and finding the correction.',
    sourceFile: 'passions.json',
  },
  {
    number: 6,
    title: 'Right Action in the World',
    days: '38–44',
    description: 'From appropriate action to right action, and the expanding circles of who we serve.',
    sourceFile: 'action.json',
  },
  {
    number: 7,
    title: 'Measuring the Journey',
    days: '45–50',
    description: 'The stages of moral progress and how to assess where you stand.',
    sourceFile: 'progress.json',
  },
  {
    number: 8,
    title: 'Integration — Living the Practice',
    days: '51–55',
    description: 'Bringing everything together into a unified, ongoing practice of self-examination.',
    sourceFile: 'scoring.json (synthesis)',
  },
]

export const TOTAL_JOURNAL_DAYS = 55

export const JOURNAL_ENTRIES: JournalEntry[] = [
  // ═══════════════════════════════════════
  // PHASE 1: FOUNDATIONS (Days 1–7)
  // Source: stoic-brain.json
  // ═══════════════════════════════════════

  {
    day: 1,
    phase: 1,
    phaseTitle: 'Foundations',
    title: 'What Is Truly Good?',
    teaching:
      'The only genuine good is virtue — the excellence of your character. Everything else — health, wealth, reputation, pleasure — are "indifferents." Not because these things do not matter, but because they cannot make you a good person or a bad one. Only how you use them can do that. A wealthy person who hoards is worse off in character than a poor person who gives generously. The external changed nothing; the character changed everything. Flourishing is not a feeling. It is the objective quality of a life expressed through virtue.',
    question:
      'Think of something you currently believe is essential to your happiness — a possession, a relationship, a status. Now imagine it was taken from you tomorrow. Would you still be able to act with kindness, honesty, and courage? Write about what truly makes you "you" versus what simply surrounds you.',
    sourceFile: 'stoic-brain.json',
    sourceCitation: 'DL Lives 7.87-89; Stobaeus Eclogae 2.77; Cicero De Finibus 3.21-22',
  },
  {
    day: 2,
    phase: 1,
    phaseTitle: 'Foundations',
    title: 'The Dichotomy of Control',
    teaching:
      'The most important distinction in Stoic philosophy: some things are "up to us" and some things are not. What is up to us? Our judgements, our impulses, our desires, our aversions, our choices, and our character. What is not? Our body, our reputation, what others think, what happens in the world, and death itself. Most suffering comes from confusing the two — pouring energy into controlling what we cannot, while neglecting what we can.',
    question:
      'Write about a situation that is currently causing you stress or frustration. Divide it into two columns in your mind: what is genuinely within your control (your response, your effort, your attitude) and what is not (other people\'s reactions, the outcome, timing). Where have you been spending most of your energy?',
    sourceFile: 'stoic-brain.json',
    sourceCitation: 'Epictetus Enchiridion 1; Discourses 1.1',
  },
  {
    day: 3,
    phase: 1,
    phaseTitle: 'Foundations',
    title: 'What Is Up to Us',
    teaching:
      'Yesterday we drew the line between what is and is not within our control. Today, look more closely at what IS up to you. Six things are squarely within your power: your judgements about events, your impulses toward or away from things, your desires and aversions, your capacity to grant or withhold belief, your moral choices, and the character you build through those choices. Notice that these are all internal. No one can force you to believe something, desire something, or choose something. Others can constrain your body, your possessions, your freedom of movement — but your inner life remains yours.',
    question:
      'Pick one of the six things within your control — judgements, impulses, desires, aversions, assent, or moral choice. Recall a recent situation where you exercised this power well, and one where you gave it away. What was different between the two moments?',
    sourceFile: 'stoic-brain.json',
    sourceCitation: 'Epictetus Enchiridion 1; Discourses 1.1',
  },
  {
    day: 4,
    phase: 1,
    phaseTitle: 'Foundations',
    title: 'Flourishing Is Not Feeling Good',
    teaching:
      'Flourishing means something closer to "living well" than to happiness. It is not a feeling. It is a condition of character. A person who acts with consistent virtue is flourishing even in the middle of hardship, grief, or loss. A person who has every external comfort but acts from selfishness and cowardice is not flourishing, no matter how pleasant their life feels. Flourishing is living and acting in agreement with nature — which for a rational being means acting in agreement with reason and virtue.',
    question:
      'Write about a time when you were externally comfortable but internally knew something was off — perhaps you had avoided a hard conversation, compromised your integrity, or chosen ease over what was right. What did that discomfort tell you about what flourishing actually requires of you?',
    sourceFile: 'stoic-brain.json',
    sourceCitation: 'DL Lives 7.87; Seneca De Vita Beata 3, 16',
  },
  {
    day: 5,
    phase: 1,
    phaseTitle: 'Foundations',
    title: 'The Sage — A Direction, Not a Destination',
    teaching:
      'The Sage is the theoretical ideal — a person who acts from perfect virtue in every situation, free from all false beliefs and destructive passions. It was said that a true Sage may appear "as rarely as the phoenix." The point is not to become the Sage but to use the concept as a compass. Every decision can be measured against the question: what would perfect wisdom, justice, courage, and self-control look like here? The Sage is not someone you need to become. The Sage is the direction you face.',
    question:
      'Think of someone you deeply admire — not for their success, but for their character. What qualities do they embody that you wish you had more of? Now consider: is there anything actually stopping you from practising those qualities today, even imperfectly?',
    sourceFile: 'stoic-brain.json',
    sourceCitation: 'DL Lives 7.71-80; Stobaeus Eclogae 2.66; Seneca Ep. 42',
  },
  {
    day: 6,
    phase: 1,
    phaseTitle: 'Foundations',
    title: 'Living According to Nature',
    teaching:
      'The cosmos is governed by rational order — a divine reason that pervades everything. Human freedom does not mean escaping this order but aligning your moral choices with it through virtue. For a rational being, "living according to nature" means living according to reason. It means recognising that you are part of something larger than yourself, and that your capacity for rational choice is what makes you distinctly human. When you act from virtue, you are not fighting against the natural order. You are participating in it.',
    question:
      'Consider a situation where you felt at odds with how things were going — a plan that fell apart, a relationship that changed, a circumstance beyond your control. What would it look like to accept the situation without surrendering your agency? How might you align your choices with what is, rather than fighting against what you cannot change?',
    sourceFile: 'stoic-brain.json',
    sourceCitation: 'DL Lives 7.38; Marcus Aurelius Meditations 4.26',
  },
  {
    day: 7,
    phase: 1,
    phaseTitle: 'Foundations',
    title: 'The One Making Progress',
    teaching:
      'Between the ordinary person ruled by impulse and the perfect Sage stands a third figure: the one making progress. This is the realistic aspiration. The person making progress does not claim to be wise but practises wisdom daily. They stumble, recognise their errors, and adjust. Progress is not perfection. It is the consistent effort to bring your actions closer to virtue, to notice when you have fallen short, and to begin again without self-punishment. Every journal entry you complete is an act of the person making progress.',
    question:
      'Where are you right now on the path between reacting on impulse and acting from considered virtue? Do not judge yourself harshly — simply observe. Write about one specific area where you have noticed genuine progress in your character over the past year, however small.',
    sourceFile: 'stoic-brain.json',
    sourceCitation: 'Stobaeus Eclogae 2.66; Epictetus Discourses 1.4',
  },

  // ═══════════════════════════════════════
  // PHASE 2: THE ARCHITECTURE OF MIND (Days 8–14)
  // Source: psychology.json
  // ═══════════════════════════════════════

  {
    day: 8,
    phase: 2,
    phaseTitle: 'The Architecture of Mind',
    title: 'The Ruling Faculty',
    teaching:
      'The seat of character is what we call the ruling faculty — the rational, commanding part of the soul. It is the part of you that receives impressions of the world, decides what to believe, generates impulses toward action, and houses the dispositions that constitute your character. Every virtue and every vice lives here. All virtue is constituted by the reasoning faculty according to its essence. Your character is not something that happens to you. It is something your ruling faculty constructs through its responses.',
    question:
      'Imagine your ruling faculty as the captain of a ship. The sea and the weather are not up to the captain, but the response to them is. Recall a recent event where your "captain" responded well — with clear judgement and measured action. Now recall one where the captain was asleep at the wheel. What was different?',
    virtue: 'wisdom',
    sourceFile: 'psychology.json',
    sourceCitation: 'DL Lives 7.40; Stobaeus Eclogae 2.86',
  },
  {
    day: 9,
    phase: 2,
    phaseTitle: 'The Architecture of Mind',
    title: 'Impressions — How Things Appear',
    teaching:
      'The first thing that happens when you encounter any situation is that you receive an impression — a representation of how things appear to you. "I have been insulted." "This is dangerous." "That person is wrong." These impressions arrive automatically. You did not choose them. A critical distinction exists: there are ordinary impressions, which may be distorted by expectation, desire, or fear, and there are comprehensive impressions — those that grasp reality so clearly they carry the mark of truth. Most of our trouble begins with mistaking distorted impressions for comprehensive ones.',
    question:
      'Think of a moment today when you received a strong impression — perhaps a flash of annoyance, a surge of anxiety, or a burst of excitement. Write it down as a statement: "It appeared to me that..." Now examine it: was this impression showing you reality clearly, or was it coloured by something you feared, desired, or assumed?',
    virtue: 'wisdom',
    sourceFile: 'psychology.json',
    sourceCitation: 'DL Lives 7.39; Stobaeus Eclogae 2.86-88',
  },
  {
    day: 10,
    phase: 2,
    phaseTitle: 'The Architecture of Mind',
    title: 'Assent — Choosing What to Believe',
    teaching:
      'After receiving an impression, your ruling faculty faces a choice: assent to it (affirm it as true) or withhold assent. This is the moment where wisdom lives or dies. The wise person assents only to impressions that genuinely grasp reality. The foolish person assents hastily — accepting whatever appears without examination. Every false belief you hold, every passion that controls you, every error in judgement traces back to a moment of hasty assent. The gap between impression and assent is where your freedom lives.',
    question:
      'Identify a belief you hold strongly — about yourself, another person, or a situation. Now ask: when did I first assent to this belief? Did I examine the impression carefully, or did I accept it because it felt true, because everyone seemed to agree, or because examining it would have been uncomfortable? What would it take to re-examine it now?',
    virtue: 'wisdom',
    sourceFile: 'psychology.json',
    sourceCitation: 'DL Lives 7.40; Stobaeus Eclogae 2.88',
  },
  {
    day: 11,
    phase: 2,
    phaseTitle: 'The Architecture of Mind',
    title: 'Impulse — The Drive to Act',
    teaching:
      'When you give assent to a practical impression — one that concerns what to do — an impulse arises. This is the drive to act, the movement toward or away from something. If your assent was correct, the impulse will be proportionate and rational. If your assent was hasty or based on a false impression, the impulse will exceed what reason warrants. Passion is defined as an impulse exceeding due measure. The problem is not that you feel a drive to act. The problem is when that drive is disproportionate to reality because it was built on a false foundation.',
    question:
      'Recall a time when you felt an overwhelming urge to act — to send an angry message, to make an impulsive purchase, to avoid something frightening. Trace the impulse backward: what impression triggered it? What belief did you assent to? If the belief had been different, would the impulse have been different too?',
    sourceFile: 'psychology.json',
    sourceCitation: 'Stobaeus Eclogae 2.87-88',
  },
  {
    day: 12,
    phase: 2,
    phaseTitle: 'The Architecture of Mind',
    title: 'Action — From Impulse to Deed',
    teaching:
      'The final stage in the causal sequence is action itself — the external deed that results from your impulse. Here is a subtle but crucial point: the same external action can be either right action or merely appropriate action, depending on the quality of the stages that preceded it. Two people can both help a stranger. One does it from genuine understanding and care. The other does it from habit, social pressure, or a desire to be seen as good. The actions look identical from the outside. The character expressed is entirely different.',
    question:
      'Choose a good action you performed recently — something you are generally proud of. Now examine it honestly: what actually motivated you? Was it genuine understanding of why this was the right thing to do, or was it habit, social expectation, fear of judgement, or desire for approval? There is no wrong answer — only honest observation.',
    sourceFile: 'psychology.json',
    sourceCitation: 'Stobaeus Eclogae 2.85-86',
  },
  {
    day: 13,
    phase: 2,
    phaseTitle: 'The Architecture of Mind',
    title: 'The Full Sequence in Action',
    teaching:
      'Now you can see the complete mechanism: impression arrives, you grant or withhold assent, an impulse arises, and action follows. Every failure of character is a failure somewhere in this sequence. A distorted impression leads to hasty assent, which generates excessive impulse, which produces action driven by passion rather than reason. And every success follows the same path in reverse: a clear impression, examined assent, proportionate impulse, and action that expresses virtue. Understanding this sequence gives you four points of intervention, not just one.',
    question:
      'Take a recent decision — large or small — and walk it through the four stages. What impression did you receive? What did you assent to? What impulse arose? What did you actually do? At which stage could a different choice have changed the outcome? Write about where your chain was strongest and where it was weakest.',
    virtue: 'wisdom',
    sourceFile: 'psychology.json',
    sourceCitation: 'Stobaeus Eclogae 2.86-88',
  },
  {
    day: 14,
    phase: 2,
    phaseTitle: 'The Architecture of Mind',
    title: 'Types of Impulse',
    teaching:
      'Not all impulses are the same. Eight types of impulse exist, ranging from basic intention (marking out what is to be accomplished) through preparation (readying yourself) and choice (selecting among alternatives on the basis of reasoning) to moral choice — the deepest kind, where you commit your whole self to a course of action. There is also rational desire — wanting what is genuinely good — and willing, which is desire freely and voluntarily exercised. The distinction matters because it shows that impulse is not a single crude force. It is a spectrum from shallow to deep, from automatic to fully considered.',
    question:
      'Think about the different kinds of decisions you make in a typical day. Some are barely conscious (what to eat, which route to take). Some require deliberation (how to respond to a difficult email). Some involve your deepest commitments (how to raise your children, what kind of person to be). Write about one decision from each level. How does the depth of your engagement change the quality of the action?',
    sourceFile: 'psychology.json',
    sourceCitation: 'Stobaeus Eclogae 2.87',
  },

  // ═══════════════════════════════════════
  // PHASE 3: WHAT WE VALUE AND WHY (Days 15–21)
  // Source: value.json
  // ═══════════════════════════════════════

  {
    day: 15,
    phase: 3,
    phaseTitle: 'What We Value and Why',
    title: 'The Value Hierarchy',
    teaching:
      'Everything divides into three categories: genuinely good, genuinely evil, and indifferent. Genuinely good is virtue and what participates in virtue. Genuinely evil is vice and what participates in vice. Everything else — health, wealth, reputation, pleasure, pain, death — is indifferent. This does not mean these things are unimportant. It means they cannot, by themselves, make you a better or worse person. Only your character can do that. This hierarchy is not abstract theory. It is a practical tool for deciding what deserves your energy and what does not.',
    question:
      'List three things you spent significant energy pursuing this past week. For each, ask: is this genuinely good (does it improve my character?), genuinely evil (does it damage my character?), or indifferent (it may matter, but it does not determine who I am)? Did your energy allocation match the hierarchy, or was it inverted?',
    sourceFile: 'value.json',
    sourceCitation: 'DL Lives 7.101-107; Stobaeus Eclogae 2.77',
  },
  {
    day: 16,
    phase: 3,
    phaseTitle: 'What We Value and Why',
    title: 'Genuine Goods — Where Virtue Lives',
    teaching:
      'Genuine goods exist in three places. First, goods of the soul: the virtues themselves, right actions, correct impulses, and the rational good feelings that come from acting well. Second, external goods that participate in virtue: a friend whose friendship is grounded in shared commitment to excellence, or a community ordered by justice. Third, the virtuous person themselves — considered as a whole, they are a good. Notice that all genuine goods either are virtue, flow from virtue, or participate in virtue. Nothing outside this circle qualifies.',
    question:
      'Think of the relationships and communities in your life. Which ones make you a better person — not more comfortable or successful, but genuinely better in character? Which ones, honestly, pull you away from the person you want to be? Write about one relationship that participates in virtue, and what makes it different from the others.',
    virtue: 'justice',
    sourceFile: 'value.json',
    sourceCitation: 'Stobaeus Eclogae 2.77-79',
  },
  {
    day: 17,
    phase: 3,
    phaseTitle: 'What We Value and Why',
    title: 'Preferred Indifferents — Holding Lightly',
    teaching:
      'Among the indifferents, a distinction exists between those that are preferred and those that are dispreferred. Preferred indifferents include life, health, strength, freedom, friendship, knowledge, and wealth. These are natural to pursue and rational to select. But the key word is "select" — the wise person selects these things; they do not desire them as if they were genuine goods. The moment you pursue any preferred indifferent at the cost of virtue — lying to keep your wealth, betraying a friend to preserve your reputation — you have confused an indifferent with a genuine good.',
    question:
      'Choose one preferred indifferent you value highly — perhaps your financial security, your health, or a particular relationship. When has the fear of losing this thing tempted you to act in a way that compromised your integrity, even slightly? What would it look like to value it fully while holding it lightly?',
    sourceFile: 'value.json',
    sourceCitation: 'DL Lives 7.102; Stobaeus Eclogae 2.79-80, 2.83',
  },
  {
    day: 18,
    phase: 3,
    phaseTitle: 'What We Value and Why',
    title: 'Dispreferred Indifferents — What We Naturally Avoid',
    teaching:
      'On the other side are the dispreferred indifferents: death, disease, pain, disability, poverty, dishonour, exile, and isolation. It is rational to avoid these — they are contrary to our nature as living beings. But they are not genuinely evil. They cannot damage your character unless you let them. A person in poverty who maintains their integrity is not harmed in any way that matters. A person who avoids poverty by betraying their principles has suffered a genuine evil — the corruption of their character — while gaining only an indifferent.',
    question:
      'What dispreferred indifferent do you fear most — pain, poverty, loneliness, loss of reputation, death? Write honestly about this fear. Then ask: has this fear ever led you to compromise something more important? What would courage look like in the face of this specific fear?',
    virtue: 'courage',
    sourceFile: 'value.json',
    sourceCitation: 'DL Lives 7.102; Stobaeus Eclogae 2.80; Seneca Ep. 77, 24',
  },
  {
    day: 19,
    phase: 3,
    phaseTitle: 'What We Value and Why',
    title: 'Selection, Not Desire',
    teaching:
      'Here is one of the most practical Stoic distinctions: the wise person selects preferred indifferents — they do not desire them. Selection is rational. You assess your circumstances, weigh the options, and choose what is most according to nature, all else being equal. Desire is a passion — it grips you, distorts your judgement, and can drive you to act against virtue. You can rationally select good health without being consumed by health anxiety. You can rationally select financial stability without being driven by greed. The difference is in the quality of your engagement, not in what you pursue.',
    question:
      'Think about something you are currently pursuing. Are you selecting it rationally — choosing it as fitting while remaining open to not getting it — or are you desiring it as if your well-being depends on it? What would change in your daily behaviour if you shifted from desire to selection?',
    virtue: 'temperance',
    sourceFile: 'value.json',
    sourceCitation: 'Stobaeus Eclogae 2.83-84',
  },
  {
    day: 20,
    phase: 3,
    phaseTitle: 'What We Value and Why',
    title: 'The Five Selection Principles',
    teaching:
      'Five practical rules guide choosing among indifferents. First: choose what accords with nature over what goes against it. Second: among natural options, choose what has greater selective value. Third: choose what serves your current roles and responsibilities. Fourth — and this overrides everything — never choose an indifferent at the cost of virtue. What is morally right always prevails. Fifth: select, do not desire. Keep the quality of your engagement rational, not passionate. These five rules turn an abstract value hierarchy into a practical decision-making tool.',
    question:
      'Recall a decision you struggled with recently — one where you were torn between options. Apply the five selection principles to it in order. Does the framework clarify which option better serves your character? Write about which principle was hardest to apply honestly.',
    virtue: 'wisdom',
    sourceFile: 'value.json',
    sourceCitation: 'DL Lives 7.101-107; Stobaeus Eclogae 2.83-84; Cicero De Officiis 3.7-19',
  },
  {
    day: 21,
    phase: 3,
    phaseTitle: 'What We Value and Why',
    title: 'Genuine Evils — Vice and Its Consequences',
    teaching:
      'Just as only virtue is genuinely good, only vice is genuinely evil. Vice includes the four root passions and the wrong actions that flow from them — actions driven by false judgements about what is good and bad. All vicious persons are, in a sense, out of touch with reality — they mistake indifferents for genuine goods, they give hasty assent to distorted impressions, and their impulses exceed what reason warrants. This is not a moral condemnation. It is a diagnosis. And like any diagnosis, it points toward a correction.',
    question:
      'Consider a pattern in your own life that you know is not serving you well — a recurring reaction, a habitual avoidance, a default behaviour you fall into under pressure. Without judging yourself, try to identify the false belief underneath it. What do you treat as genuinely good or genuinely evil that is actually an indifferent?',
    sourceFile: 'value.json',
    sourceCitation: 'Stobaeus Eclogae 2.77-79; DL Lives 7.110',
  },

  // ═══════════════════════════════════════
  // PHASE 4: THE UNITY OF EXCELLENCE (Days 22–28)
  // Source: virtue.json
  // ═══════════════════════════════════════

  {
    day: 22,
    phase: 4,
    phaseTitle: 'The Unity of Excellence',
    title: 'Whoever Has One Has All',
    teaching:
      'A startling claim: whoever has one virtue has all of them, because the virtues are inseparable. You cannot be truly wise without being just, because wisdom includes knowing what is owed to others. You cannot be truly courageous without being temperate, because recklessness without self-control is not courage — it is a passion. You cannot be truly just without being wise, because justice without understanding is rigid rule-following. The four virtues are not four separate skills. They are four expressions of one unified excellence of character.',
    question:
      'Think of a time when you displayed one virtue strongly but another was clearly absent — perhaps you were courageous but unkind, or wise but lacked the courage to act on your wisdom. What does this tell you about the unity thesis? How might strengthening the weaker virtue have changed the outcome?',
    sourceFile: 'virtue.json',
    sourceCitation: 'DL Lives 7.125; Stobaeus Eclogae 2.63',
  },
  {
    day: 23,
    phase: 4,
    phaseTitle: 'The Unity of Excellence',
    title: 'Virtue as Secure Knowledge',
    teaching:
      'Virtue is defined not as a habit or a feeling but as secure knowledge — knowledge so deeply understood that it becomes a stable disposition of the soul. This means virtue, once fully acquired, cannot be lost. It is not a mood that comes and goes. It is not willpower that can be exhausted. It is understanding so complete that it has become part of who you are. Most of us have opinions about what is right. The challenge is to transform those opinions into knowledge — tested, examined, and made unshakeable through practice.',
    question:
      'Think about something you believe is right — a moral principle you hold. Now test it: is this genuine knowledge (you understand why it is right and could defend it under pressure) or opinion (you believe it because you were taught it, because it feels right, or because everyone around you agrees)? What would it take to turn your moral opinions into moral knowledge?',
    virtue: 'wisdom',
    sourceFile: 'virtue.json',
    sourceCitation: 'Stobaeus Eclogae 2.59; DL Lives 7.92; Cicero De Finibus 3.4',
  },
  {
    day: 24,
    phase: 4,
    phaseTitle: 'The Unity of Excellence',
    title: 'Practical Wisdom — Seeing Clearly',
    teaching:
      'Practical wisdom is knowledge of what is genuinely good, genuinely bad, and genuinely indifferent. It has four sub-expressions: good deliberation (knowing when and how to act), good understanding (applying general principles to specific situations), quick-wittedness (finding the virtuous path in unfamiliar circumstances), and foresight (anticipating consequences within the limits of what is up to you). Its opposite is folly — not stupidity, but false beliefs about what is good. Wisdom is the master virtue because it is the foundation on which the other three stand.',
    question:
      'Of the four sub-expressions of practical wisdom — deliberation, understanding, quick-wittedness, and foresight — which do you exercise most naturally? Which feels weakest? Write about a recent situation that required the one you find most difficult, and how you might have handled it with more of that quality.',
    virtue: 'wisdom',
    sourceFile: 'virtue.json',
    sourceCitation: 'DL Lives 7.92-93; Stobaeus Eclogae 2.59-63; Cicero De Officiis 1.15-18',
  },
  {
    day: 25,
    phase: 4,
    phaseTitle: 'The Unity of Excellence',
    title: 'Justice — Giving Each Their Due',
    teaching:
      'Justice is knowledge of what is owed to others — distributing to each their worth. Its sub-expressions are piety (right relation to the rational order of things), benevolence (active goodwill and love of humanity), social participation (fulfilling your roles in community life), and fair dealing (equity — knowing when applying rules rigidly would itself produce injustice). Justice is the widest in scope of all the virtues and its foundation is good faith. Two kinds of injustice exist: inflicting harm, and failing to prevent harm when you could.',
    question:
      'Consider the people affected by your actions today — family, colleagues, strangers, your community. Did you give each what they were owed? Was there someone whose needs you overlooked, someone you could have helped but chose not to, or someone you treated unfairly? Write about one specific relationship where you could practise justice more fully.',
    virtue: 'justice',
    sourceFile: 'virtue.json',
    sourceCitation: 'DL Lives 7.92-93; Cicero De Officiis 1.15-18, 1.20',
  },
  {
    day: 26,
    phase: 4,
    phaseTitle: 'The Unity of Excellence',
    title: 'Courage — Acting Rightly Despite Difficulty',
    teaching:
      'Courage is knowledge of what is genuinely worth fearing and what is not. It is not the absence of fear but the refusal to let false judgements about danger control your actions. Its sub-expressions are endurance (standing firm against what must be borne), confidence (rational assurance grounded in correct understanding), magnanimity (not being diminished by external circumstances), and industriousness (willing effort in service of virtue). Its opposites are cowardice (false beliefs about danger) and recklessness (acting from passion, not from understanding).',
    question:
      'Recall a situation where you knew the right thing to do but hesitated because it was difficult, uncomfortable, or frightening. What were you actually afraid of? Was the fear about something genuinely evil (damage to your character) or about a dispreferred indifferent (loss of comfort, reputation, or approval)? What would courage have looked like?',
    virtue: 'courage',
    sourceFile: 'virtue.json',
    sourceCitation: 'DL Lives 7.92-93; Stobaeus Eclogae 2.59-63; Cicero De Officiis 1.15-18',
  },
  {
    day: 27,
    phase: 4,
    phaseTitle: 'The Unity of Excellence',
    title: 'Temperance — Acting with Measure',
    teaching:
      'Temperance is knowledge of what to choose and what to avoid — the virtue that orders impulse and desire. Its sub-expressions are orderliness (right timing and measure in action), propriety (acting as befits a rational being in context), self-mastery (command over impulse and desire, not being driven by the four passions), and modesty (an inner check preventing base action). Temperance is not about denial or asceticism. It is about proportion. The temperate person enjoys preferred indifferents without being controlled by them, acts decisively without being reckless, and speaks honestly without being cruel.',
    question:
      'Think about an area of your life where your impulses tend to exceed what reason warrants — spending, eating, social media, arguing, seeking approval. Do not focus on the behaviour itself but on the impulse underneath. What drives it? What false judgement makes the impulse feel justified? What would a measured, proportionate engagement with this area look like?',
    virtue: 'temperance',
    sourceFile: 'virtue.json',
    sourceCitation: 'DL Lives 7.92-93; Stobaeus Eclogae 2.59-63; Cicero De Officiis 1.15-18',
  },
  {
    day: 28,
    phase: 4,
    phaseTitle: 'The Unity of Excellence',
    title: 'The Four Sources of the Honourable',
    teaching:
      'Everything honourable arises from one of four sources: the investigation and discovery of truth (connected to practical wisdom), the fellowship of humanity and giving each their due (connected to justice), the greatness and unconquerable strength of a lofty soul (connected to courage), and order and measure in all things done and said (connected to temperance). These four sources map directly to the four virtue expressions. When you see an action that strikes you as genuinely admirable, it draws its beauty from one or more of these sources.',
    question:
      'Recall the most admirable action you have witnessed someone perform — something that struck you as genuinely honourable, not just impressive or successful. Which of the four sources does it draw from? Does it draw from more than one? Now apply the same analysis to your own best action this week. What does the comparison reveal?',
    sourceFile: 'virtue.json',
    sourceCitation: 'Cicero De Officiis 1.15',
  },

  // ═══════════════════════════════════════
  // PHASE 5: WHEN JUDGEMENT GOES WRONG (Days 29–37)
  // Source: passions.json
  // ═══════════════════════════════════════

  {
    day: 29,
    phase: 5,
    phaseTitle: 'When Judgement Goes Wrong',
    title: 'What Passions Really Are',
    teaching:
      'When we speak of "passion," we do not mean emotion. We mean irrational impulses rooted in false judgements — movements of the soul that exceed what reason warrants. Passion is defined as "an impulse exceeding due measure." Every passion is a cognitive error: you perceive something as genuinely good or genuinely evil when it is actually indifferent, and your impulse responds to that false perception. Passion is not something that happens to you. It is something your ruling faculty produces when it assents to a distorted impression.',
    question:
      'Recall a moment this week when you experienced a strong emotional reaction — anger, anxiety, craving, or dejection. Try to identify the judgement underneath it. What did you believe was genuinely good or genuinely evil in that moment? Was that belief accurate, or were you treating an indifferent as though your well-being depended on it?',
    sourceFile: 'passions.json',
    sourceCitation: 'Stobaeus Eclogae 2.88-90; DL Lives 7.110',
  },
  {
    day: 30,
    phase: 5,
    phaseTitle: 'When Judgement Goes Wrong',
    title: 'Craving — Reaching for Apparent Good',
    teaching:
      'The first root passion is craving: an irrational reaching toward something in the future that appears good but is not genuinely good. It has six recognised forms: anger (craving revenge on someone who seems to have wronged you), erotic obsession (craving based on appearance rather than virtue), longing (craving for something absent), love of pleasure (craving bodily pleasure as an end in itself), love of wealth (craving money as an end), and love of honour (craving reputation as an end). Each one mistakes a preferred indifferent or outright illusion for a genuine good.',
    question:
      'Look at the six forms of craving: revenge, obsession, longing, pleasure-seeking, wealth-seeking, and reputation-seeking. Which one has the strongest grip on you? Write about a specific recent instance where this form of craving drove your behaviour. What was the false judgement underneath — what did you treat as genuinely good that is actually indifferent?',
    sourceFile: 'passions.json',
    sourceCitation: 'Stobaeus Eclogae 2.90-91; DL Lives 7.113',
  },
  {
    day: 31,
    phase: 5,
    phaseTitle: 'When Judgement Goes Wrong',
    title: 'Irrational Pleasure — Elation at Apparent Good',
    teaching:
      'The second root passion is irrational pleasure: elation at something present that appears good but is not genuinely good. It differs from craving in that it concerns the present, not the future. It has three recognised forms: enchantment (being captivated through the senses, losing rational perspective), malicious joy (taking pleasure in another person\'s misfortune), and excessive amusement (a pleasure that dissolves seriousness and clear thinking). Irrational pleasure is seductive because it feels rewarding. But notice: the pleasure comes from a false judgement. You are celebrating something that is not genuinely good.',
    question:
      'Think about what gives you pleasure. Can you identify an instance of irrational pleasure — a moment when you felt satisfaction or delight that, on reflection, was based on a false judgement? Perhaps pleasure at someone else\'s failure, or enchantment with something that was actually pulling you away from virtue. What was the false judgement that made it feel good?',
    sourceFile: 'passions.json',
    sourceCitation: 'Stobaeus Eclogae 2.90; DL Lives 7.114',
  },
  {
    day: 32,
    phase: 5,
    phaseTitle: 'When Judgement Goes Wrong',
    title: 'Fear — Shrinking from Apparent Evil',
    teaching:
      'The third root passion is fear: an irrational avoidance of something in the future that appears evil but is not genuinely evil. It has six recognised forms: terror (fear that produces paralysis), timidity (fear of future effort or exertion), shame (fear of a damaged reputation), dread (fear produced by something unfamiliar), panic (fear that overwhelms rational function), and agony (fear of an uncertain outcome). Each one treats a dispreferred indifferent as though it were genuinely evil — as though it could damage your character the way only vice can.',
    question:
      'Look at the six forms of fear: paralysing terror, avoidance of effort, reputation-anxiety, dread of the unfamiliar, overwhelm, and worry about uncertain outcomes. Which one most frequently drives your behaviour? Write about a specific situation where this form of fear caused you to avoid something you knew was right. What would you have done without the false judgement?',
    virtue: 'courage',
    sourceFile: 'passions.json',
    sourceCitation: 'Stobaeus Eclogae 2.90; DL Lives 7.112',
  },
  {
    day: 33,
    phase: 5,
    phaseTitle: 'When Judgement Goes Wrong',
    title: 'Distress — Contraction at Apparent Evil',
    teaching:
      'The fourth root passion is distress: an irrational contraction of the soul at something present that appears evil but is not genuinely evil. It has five recognised forms: pity (distress at another\'s suffering — note that this misidentifies an indifferent as evil, which is not the same as genuine compassion), envy (distress that another has what you want), jealousy (distress that someone possesses what you believe should be yours), grief (distress at loss), and anxiety (a weighing-down of the mind without a clear object). Distress is often the hardest passion to examine because it feels justified by the situation.',
    question:
      'Identify a form of distress you experienced recently: pity, envy, jealousy, grief, or anxiety. Now examine the judgement underneath it. What did you believe was genuinely evil — what felt like a real loss or real harm? Was it a genuine evil (damage to character) or a dispreferred indifferent (something painful but not actually destructive of who you are)? Write about the distinction.',
    sourceFile: 'passions.json',
    sourceCitation: 'Stobaeus Eclogae 2.90-91; DL Lives 7.111',
  },
  {
    day: 34,
    phase: 5,
    phaseTitle: 'When Judgement Goes Wrong',
    title: 'The Five-Step Diagnostic',
    teaching:
      'The passions taxonomy is not a punishment system. It is a diagnostic tool. When you notice a passion at work, apply five questions: First, was your impression of the situation distorted? If so, by which root passion? Second, did you give assent to a false impression? What specific false belief drove the assent? Third, did your impulse exceed what reason warranted? Fourth, which specific form of the passion was operative — not just "fear" but which of the six kinds? Fifth, what is the correct judgement that would replace the false one? This diagnostic turns a vague sense of "I overreacted" into a precise identification of where judgement went wrong and what would fix it.',
    question:
      'Choose a recent moment when passion drove your behaviour. Walk through the five diagnostic questions. Write your answers for each step. Pay special attention to step five: what is the correct judgement? This is the foundation of the Stoic approach — not suppressing feeling, but correcting the false belief underneath.',
    virtue: 'wisdom',
    sourceFile: 'passions.json',
    sourceCitation: 'passions.json > diagnostic_use; derived from Stobaeus Eclogae 2.88-91',
  },
  {
    day: 35,
    phase: 5,
    phaseTitle: 'When Judgement Goes Wrong',
    title: 'The Rational Alternatives — Joy, Rational Wish, and Caution',
    teaching:
      'The path is not the elimination of all feeling. Rather, the passions should be replaced by three rational good feelings. Joy replaces irrational pleasure — it is gladness at what is genuinely good, at virtue and right action. Rational wish replaces craving — it is desire directed at what is genuinely good, wanting the welfare of others from correct understanding. Rational caution replaces fear — it is principled avoidance of what is genuinely evil (vice), not anxious shrinking from indifferents. These are what the wise person experiences instead of passions.',
    question:
      'Think about a moment of genuine joy — not pleasure at gaining an indifferent, but gladness that came from doing something right. How did it feel different from the pleasure of getting something you wanted? Now think about a time when caution (a principled refusal) served you better than fear (anxious avoidance). Write about the quality of these rational feelings versus their passionate counterparts.',
    sourceFile: 'passions.json',
    sourceCitation: 'DL Lives 7.116; Stobaeus Eclogae 2.90',
  },
  {
    day: 36,
    phase: 5,
    phaseTitle: 'When Judgement Goes Wrong',
    title: 'The Missing Fourth — Why No Good Feeling Replaces Distress',
    teaching:
      'There is a deliberate asymmetry in the Stoic system: joy replaces irrational pleasure, rational wish replaces craving, rational caution replaces fear — but nothing replaces distress. This is not an oversight. The wise person has no cause for distress because nothing genuinely evil can befall a virtuous person. External losses — even severe ones — are dispreferred indifferents, not genuine evils. The sage may feel preference for health and life, and may rationally select them, but does not experience the contraction of distress because their fundamental well-being (their character) remains intact.',
    question:
      'This is perhaps the most challenging teaching. Think about something that causes you genuine distress — a loss, a fear realised, a persistent source of pain. Ask yourself: is what you lost genuinely evil (did it damage your character?), or is it a dispreferred indifferent that feels devastating because you have assigned it more value than it holds? Write about the tension between these two perspectives honestly.',
    sourceFile: 'passions.json',
    sourceCitation: 'DL Lives 7.116; Stobaeus Eclogae 2.90',
  },
  {
    day: 37,
    phase: 5,
    phaseTitle: 'When Judgement Goes Wrong',
    title: 'From Diagnosis to Correction',
    teaching:
      'Each passion identified through the diagnostic points to a specific false judgement. And each false judgement has a corresponding correct judgement that can replace it. This is the heart of moral progress: not suppressing your reactions but systematically correcting the beliefs that produce them. If you are gripped by love of wealth, the correction is not to hate money but to understand that wealth is a preferred indifferent — useful when held in service of virtue, harmful when pursued as though it were a genuine good. The passion is the symptom. The false judgement is the disease. The correct judgement is the remedy.',
    question:
      'Return to the five-step diagnostic you completed on Day 34. Focus on step five — the correct judgement. Write that correct judgement as a clear, specific statement. Now ask: do I actually believe this? If not, what is stopping me? What would need to change in my understanding for this correct judgement to become my natural response?',
    sourceFile: 'passions.json',
    sourceCitation: 'passions.json > diagnostic_use; Stobaeus Eclogae 2.88-91',
  },

  // ═══════════════════════════════════════
  // PHASE 6: RIGHT ACTION IN THE WORLD (Days 38–44)
  // Source: action.json
  // ═══════════════════════════════════════

  {
    day: 38,
    phase: 6,
    phaseTitle: 'Right Action in the World',
    title: 'Two Layers — Appropriate Action and Right Action',
    teaching:
      'Two layers of action are distinguished. An appropriate action is one that accords with life — it makes sense given your nature, relationships, and circumstances, and a reasonable justification can be given for it. Anyone can perform appropriate actions, whether wise or foolish. A right action is an appropriate action performed from complete understanding — the person doing it knows why it is right, not just that it is right, and their action flows from a stable commitment to virtue. The same external deed — helping a stranger, telling the truth, keeping a promise — can be either one depending on what drives it.',
    question:
      'Think of a good action you performed recently. Was it an appropriate action (right in its external form, done from habit, duty, or social expectation) or was it closer to right action (done from genuine understanding of why it was right, flowing from your character)? What would it take to move more of your appropriate actions toward right action?',
    sourceFile: 'action.json',
    sourceCitation: 'Stobaeus Eclogae Section 4; Cicero De Officiis 1.8',
  },
  {
    day: 39,
    phase: 6,
    phaseTitle: 'Right Action in the World',
    title: 'The Expanding Circles — Self',
    teaching:
      'Natural affiliation develops outward from the self. The first circle is self-preservation — the instinctive drive to maintain your own existence and develop your natural capacities. This is not selfishness. It is the necessary foundation. A person who neglects their own physical and rational development cannot effectively serve others. The appropriate actions at this level include caring for your body and mind, developing your rational faculty, and pursuing philosophical exercise. Self-care in service of virtue is not indulgent. It is the first obligation.',
    question:
      'How do you care for yourself — not in terms of comfort or pleasure, but in terms of maintaining the foundation you need to act virtuously? Are there areas where you neglect self-care in ways that reduce your capacity to serve others? Write about the relationship between taking care of yourself and taking care of your responsibilities.',
    sourceFile: 'action.json',
    sourceCitation: 'Cicero De Finibus 3.62; DL Lives 7.51',
  },
  {
    day: 40,
    phase: 6,
    phaseTitle: 'Right Action in the World',
    title: 'The Expanding Circles — Family and Community',
    teaching:
      'The second circle of natural affiliation extends to family and close friends: parents, children, spouse, siblings, and those with whom you share deep bonds. The appropriate actions here include honouring parents, educating children, supporting your partner, and maintaining friendships grounded in virtue. The third circle extends to your city, your workplace, your political community. Here justice calls you to serve the common good, contribute your abilities, defend what is right, and obey just laws. We are not born for ourselves alone — our birth claims a part for our country and a part for our friends.',
    question:
      'Map out your second and third circles. Who are the specific people you have obligations to as family and intimates? What are your roles in the broader community — professional, civic, social? Are there obligations in these circles you are currently neglecting? Write about one specific obligation you could fulfil more fully this week.',
    virtue: 'justice',
    sourceFile: 'action.json',
    sourceCitation: 'Cicero De Officiis 1.12, 1.20; DL Lives 7.52-57',
  },
  {
    day: 41,
    phase: 6,
    phaseTitle: 'Right Action in the World',
    title: 'The Expanding Circles — Humanity and the Cosmos',
    teaching:
      'The fourth circle extends to all rational beings — every human, regardless of origin, status, or relationship to you. This is cosmopolitan citizenship. All humans share divine reason; all deserve justice, honesty, and goodwill. The fifth and final circle extends to the cosmos itself: aligning your will with the rational order of nature, accepting what is beyond your control with equanimity, and recognising that your capacity for moral choice connects you to something larger than any individual life. The fully expanded person holds all five circles simultaneously.',
    question:
      'How far do your circles of concern typically extend in daily life? Do they stop at family? At community? Do they routinely reach strangers, or people very different from you? Write about a specific situation where you could expand your concern one circle outward — and what that would require of you in practice.',
    virtue: 'justice',
    sourceFile: 'action.json',
    sourceCitation: 'Cicero De Officiis 1.20; De Finibus 3.67-68; Marcus Aurelius Meditations 4.26',
  },
  {
    day: 42,
    phase: 6,
    phaseTitle: 'Right Action in the World',
    title: 'Is This Action Honourable?',
    teaching:
      'A structured framework for practical moral reasoning builds around five questions. The first two concern honour: Is this action honourable? Does it express the kind of moral beauty a virtuous person would embody? And when two honourable options are both available, which is more honourable — which better expresses the four virtues, which serves the higher obligation in your expanding circles? These questions come first because what is honourable always takes priority. No amount of advantage can outweigh what is right.',
    question:
      'Take a decision you are currently facing. Ask the first two questions of practical moral reasoning: Is the action I am considering honourable? If there are multiple honourable options, which one better expresses wisdom, justice, courage, and self-control? Which one serves the higher circle of obligation? Write out your reasoning step by step.',
    virtue: 'wisdom',
    sourceFile: 'action.json',
    sourceCitation: 'Cicero De Officiis 1.9-10',
  },
  {
    day: 43,
    phase: 6,
    phaseTitle: 'Right Action in the World',
    title: 'When Honour Conflicts with Advantage',
    teaching:
      'The final three questions address advantage and its relationship to honour. Is the action advantageous — does it serve your natural needs and preferred indifferents? Between two advantageous options, which is more advantageous? And the decisive question: when the honourable conflicts with the advantageous, which prevails? The answer is absolute: the honourable always prevails. What merely appears advantageous but conflicts with virtue is not genuinely advantageous. Apparent conflicts arise from mistaking an indifferent for a genuine good. Nothing that is morally base can be truly beneficial.',
    question:
      'Recall a time when what seemed advantageous conflicted with what you knew was right. What did you choose? If you chose advantage over honour, what false judgement made that choice feel justified? If you chose honour, what gave you the strength to accept the cost? Write about what the principle means in your life — "nothing base can be truly beneficial."',
    sourceFile: 'action.json',
    sourceCitation: 'Cicero De Officiis 3.7-19',
  },
  {
    day: 44,
    phase: 6,
    phaseTitle: 'Right Action in the World',
    title: 'When Obligations Conflict',
    teaching:
      'Life frequently presents situations where obligations at different levels conflict. Your duty to family may conflict with your duty to community. Your duty to community may conflict with your duty to humanity. The general Stoic principle is that higher circles take priority — obligations to humanity outweigh obligations to your city, which outweigh obligations to your family. But this is not absolute. Self-care that enables future virtuous action is justified. And practical wisdom means recognising that the right action in a specific situation may not follow the general rule. The person making progress learns to hold these tensions with care rather than resolving them with rigid formulas.',
    question:
      'Describe a real conflict between obligations in your life — a tension between what you owe to different people or groups. How have you been handling it? Apply the priority principle: which obligation serves the higher circle? Does practical wisdom suggest any qualification in this specific case? Write about how you might navigate this conflict with more clarity.',
    virtue: 'wisdom',
    sourceFile: 'action.json',
    sourceCitation: 'Cicero De Officiis 1.9-10; action.json > oikeiosis_sequence > priority_rule',
  },

  // ═══════════════════════════════════════
  // PHASE 7: MEASURING THE JOURNEY (Days 45–50)
  // Source: progress.json
  // ═══════════════════════════════════════

  {
    day: 45,
    phase: 7,
    phaseTitle: 'Measuring the Journey',
    title: 'The Strict Binary',
    teaching:
      'A strict binary exists: you are either a sage or you are not. All non-sages are, technically, in a state of imperfect understanding. There is no "good enough" short of complete virtue. This sounds harsh, but its purpose is not to discourage. It is to prevent complacency. The moment you think "I am wise enough" or "I am virtuous enough," you have stopped making progress. The binary keeps the aspiration alive. It says: there is always further to go, always a deeper understanding to reach, always a more complete expression of virtue to aim for.',
    question:
      'How do you react to the idea that complete virtue is the only true standard? Does it motivate you or discourage you? Write about the tension between this uncompromising standard and the practical reality that you are making progress — imperfect, uneven progress — every day. How might you hold both truths simultaneously?',
    sourceFile: 'progress.json',
    sourceCitation: 'DL Lives 7.71-80; Stobaeus Eclogae 2.66',
  },
  {
    day: 46,
    phase: 7,
    phaseTitle: 'Measuring the Journey',
    title: 'Beginning the Path',
    teaching:
      'Three grades of moral progress exist within the non-sage category. The third grade — beginning the path — is where most philosophical students find themselves. At this stage, you have escaped many great vices but not all. You may have overcome anger but not vanity, moved beyond impulsive craving but not subtle fear. Your awareness of philosophical principles is genuine but your application is inconsistent. Progress is real but uneven. You are subject to regression when tested by difficult circumstances. This is not failure. This is where the work begins.',
    question:
      'Place yourself honestly at the third grade of moral progress. Which passions have you made real progress against — where do you notice genuine improvement? And which passions still operate freely, especially when you are tired, stressed, or caught off guard? Write about the pattern of your progress: where is it strong and where is it fragile?',
    sourceFile: 'progress.json',
    sourceCitation: 'Seneca Epistulae 75.13-15',
  },
  {
    day: 47,
    phase: 7,
    phaseTitle: 'Measuring the Journey',
    title: 'Overcoming the Worst',
    teaching:
      'The second grade of progress is overcoming the worst. At this stage, the major passions are checked. Good judgement operates reliably in familiar situations. You can resist common temptations and maintain your commitments under ordinary pressure. But you are still vulnerable to unusual pressures — novel situations, extreme stress, unexpected losses. The distinction between second and third grade is consistency: the person at the second grade has moved from occasional virtuous action to a more stable pattern, but that pattern has not yet become an unshakeable disposition.',
    question:
      'Think about the difference between your behaviour in familiar, comfortable situations and your behaviour under unexpected pressure. How much does the quality of your character change when circumstances become difficult? Write about a time when pressure revealed a weakness you did not know you had — and what that taught you about where you stand.',
    virtue: 'courage',
    sourceFile: 'progress.json',
    sourceCitation: 'Seneca Epistulae 75.10-12',
  },
  {
    day: 48,
    phase: 7,
    phaseTitle: 'Measuring the Journey',
    title: 'Approaching Wisdom',
    teaching:
      'The first grade of progress is approaching wisdom. At this stage, most passions have been overcome. Understanding is strong and well-tested. The person can maintain virtue under significant pressure and their disposition is approaching the stability of genuine knowledge. But they are not yet secure from relapse. Under extreme testing, they can still fall back. The gap between "approaching wisdom" and the sage is enormous — the sage is "as rare as the phoenix." But the person at the first grade has transformed their character to the point where virtuous action is their default, not their aspiration.',
    question:
      'Without claiming to be at any particular grade, write about what "approaching wisdom" would look like for you specifically. What passions would need to be overcome? What false judgements would need to be corrected? What areas of your character would need to stabilise? Describe the version of yourself that has done this work — not perfectly, but substantially.',
    virtue: 'wisdom',
    sourceFile: 'progress.json',
    sourceCitation: 'Seneca Epistulae 75.8-9',
  },
  {
    day: 49,
    phase: 7,
    phaseTitle: 'Measuring the Journey',
    title: 'Four Dimensions of Progress',
    teaching:
      'The Stoic framework tracks moral progress along four dimensions. First: are fewer passions operative, and are they less intense? Second: is your understanding of what is genuinely good, bad, and indifferent becoming more accurate? Third: is your commitment to virtue becoming more stable — does it hold under pressure, and how quickly do you recover after setbacks? Fourth: are your circles of concern expanding — are you increasingly taking account of obligations beyond yourself? These four dimensions give you a way to assess progress without reducing it to a single number. Genuine progress is multidimensional.',
    question:
      'Rate yourself honestly on each of the four dimensions — not with numbers, but with honest assessment. Where have you made the most progress over the past year? Where have you made the least? Is there a dimension you tend to neglect? Write about what you would need to do to make progress on your weakest dimension.',
    sourceFile: 'progress.json',
    sourceCitation: 'progress.json > progress_metrics; derived from Stobaeus, Seneca, Epictetus',
  },
  {
    day: 50,
    phase: 7,
    phaseTitle: 'Measuring the Journey',
    title: 'The Philosopher as Physician',
    teaching:
      'The philosopher is like a physician of the soul. Just as a physician first persuades the patient to accept treatment and then removes arguments against it, so too the work of philosophy is to help you see where your judgement has gone wrong and to provide the tools for correction. The passions taxonomy is the diagnostic tool. The virtue system is the goal of health. The evaluation sequence is the examination. And each false judgement identified is a specific condition that can be treated through the steady practice of correct understanding. This journal is part of that practice.',
    question:
      'If a physician of the soul examined your life this week, what would they diagnose? Which false judgements are producing which passions? Which dimensions of progress need the most attention? Write a brief "diagnosis" of your current state — not as self-criticism, but as a clear-eyed assessment, the way a good physician would describe a patient\'s condition with care and precision.',
    sourceFile: 'progress.json',
    sourceCitation: 'Stobaeus Eclogae Section 1',
  },

  // ═══════════════════════════════════════
  // PHASE 8: INTEGRATION — LIVING THE PRACTICE (Days 51–55)
  // Source: scoring.json (synthesis of all V3 domains)
  // ═══════════════════════════════════════

  {
    day: 51,
    phase: 8,
    phaseTitle: 'Integration — Living the Practice',
    title: 'The Evaluation Sequence — Examining Your Actions',
    teaching:
      'Everything you have learned converges in a four-stage process for examining any action. Stage one: separate what was within your control from what was not — only evaluate your judgements, impulses, and character, not the outcome. Stage two: was the action itself appropriate given your nature, relationships, and circumstances? Stage three: which passions, if any, distorted your impression, your assent, or your impulse? What specific false judgements were operative? Stage four: taking everything together, how close was the quality of your ruling faculty to the ideal? Not four separate scores — one unified assessment of the whole.',
    question:
      'Choose the most significant action you took this past week. Walk it through all four stages of the evaluation sequence. Take your time with each stage. Write your honest assessment. Pay special attention to stage three: if passions were present, name them specifically and identify the false judgement underneath. What does stage four tell you about where you stand?',
    sourceFile: 'scoring.json',
    sourceCitation: 'scoring.json > evaluation_sequence; synthesises all V3 domains',
  },
  {
    day: 52,
    phase: 8,
    phaseTitle: 'Integration — Living the Practice',
    title: 'The Proximity Scale — Where Am I?',
    teaching:
      'The proximity scale gives five qualitative levels for assessing how close any action comes to right action. Reflexive: action from pure impulse with no deliberation, passion dominating completely. Habitual: action from convention or habit without genuine understanding. Deliberate: action from conscious reasoning with some understanding, passion partially checked. Principled: action from stable commitment with strong understanding, approaching excellence. And the ideal: action from perfected understanding and unified virtue, free from all destructive passion. The gap between "principled" and the ideal is enormous. But knowing where you stand is the beginning of knowing where to go.',
    question:
      'Take the action you evaluated yesterday. Where does it fall on the proximity scale? Be honest — most of our actions on most days fall somewhere between habitual and deliberate. Now choose a second action from this week and assess it too. Is there a pattern? Do certain types of situations consistently produce higher or lower proximity? Write about what drives the variation.',
    sourceFile: 'scoring.json',
    sourceCitation: 'scoring.json > katorthoma_proximity_scale; Stobaeus Eclogae 2.85-86; Seneca Ep. 75',
  },
  {
    day: 53,
    phase: 8,
    phaseTitle: 'Integration — Living the Practice',
    title: 'Daily Self-Examination',
    teaching:
      'Daily self-examination is practiced — reviewing the day\'s actions not to punish yourself but to learn. Three questions guide this practice each evening: what did I do poorly? What did I do well? What could I improve? Every impression should be examined before assenting to it. This practice of reflection continues every day, for the rest of your life. The journal you have been keeping for the past seven weeks is this practice in structured form. But the practice does not end when the journal does. It continues every day, for the rest of your life, because the person making progress never stops examining.',
    question:
      'Review today — just today. Walk through the key moments. Where did you act from clear understanding? Where did passion drive your behaviour? Where did you give hasty assent to a distorted impression? Apply the framework you have learned: control filter, appropriate action assessment, passion diagnosis, unified assessment. Make this the template for your daily practice going forward.',
    sourceFile: 'scoring.json',
    sourceCitation: 'Seneca De Ira 3.36; Epictetus Discourses 1.1; Marcus Aurelius Meditations passim',
  },
  {
    day: 54,
    phase: 8,
    phaseTitle: 'Integration — Living the Practice',
    title: 'The Circles of Your Life',
    teaching:
      'You have learned about the expanding circles of natural affiliation — from self to family to community to humanity to the cosmos. Now apply them concretely to your life. Your self-care enables everything else. Your family and close friends are the people whose lives you most directly shape. Your community is where your civic obligations live. Humanity is the circle that prevents parochialism and tribalism. And the cosmos is the context that gives meaning to all of it — the recognition that your capacity for rational moral choice connects you to something larger. Living the practice means holding all five circles simultaneously, not choosing between them.',
    question:
      'Map out your five circles with specific names, roles, and obligations. For each circle, identify one appropriate action you could take this week to fulfil your obligations more fully. Which circles have you been neglecting? Which have you been overemphasising at the expense of others? Write a practical plan for this week that honours all five.',
    virtue: 'justice',
    sourceFile: 'action.json',
    sourceCitation: 'Cicero De Officiis 1.12, 1.20; DL Lives 7.51-60',
  },
  {
    day: 55,
    phase: 8,
    phaseTitle: 'Integration — Living the Practice',
    title: 'The Path Continues',
    teaching:
      'You have completed 55 days of structured philosophical exercise. You have learned the foundations, the architecture of mind, the value hierarchy, the unity of virtue, the passions diagnostic, the framework for right action, the stages of moral progress, and the practice of self-examination. But the path does not end here. The person making progress never arrives — they continue. Every day offers new impressions to examine, new impulses to measure, new opportunities to act from understanding rather than passion. The question is never "am I wise?" The question is always "am I wiser than I was yesterday, and how can I be wiser tomorrow?"',
    question:
      'Write a letter to yourself — to be read in six months. Describe where you stand now on the path of moral progress. Name the passions that still grip you, the false judgements you still hold, the dimensions where your progress is strongest and weakest. Then write what you hope to see when you read this letter again: not outcomes or achievements, but qualities of character. This is your compass. Keep it.',
    sourceFile: 'scoring.json',
    sourceCitation: 'Stobaeus Eclogae 2.66; Epictetus Discourses 1.4; Seneca Ep. 75',
  },
]

// ─── Helper functions ───

export function getJournalEntry(day: number): JournalEntry | undefined {
  return JOURNAL_ENTRIES.find((e) => e.day === day)
}

export function getPhaseForDay(day: number): JournalPhase | undefined {
  return PHASES.find((p) => {
    const [start, end] = p.days.split('–').map(Number)
    return day >= start && day <= end
  })
}

/**
 * @deprecated V1 compatibility — returns virtue color for legacy display.
 * V3 journal uses virtue as optional engagement marker, not a scoring dimension.
 */
export function getVirtueColor(virtue: string): string {
  const colors: Record<string, string> = {
    wisdom: '#7d9468',
    justice: '#5b7fa5',
    courage: '#b85c38',
    temperance: '#6b8f71',
  }
  return colors[virtue] || '#78350F'
}
