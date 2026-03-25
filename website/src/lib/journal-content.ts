/**
 * The Path of the Prokoptos — 56-Day Stoic Journal
 *
 * All content derived from the SageReasoning Stoic Brain.
 * Each entry has a teaching (READ) and a reflective question (REFLECT).
 * Entries are not virtue-scored — completing one earns a calendar stamp for tenacity.
 */

export interface JournalEntry {
  day: number
  phase: number
  phaseTitle: string
  title: string
  teaching: string
  question: string
  virtue?: 'wisdom' | 'justice' | 'courage' | 'temperance'
}

export const PHASES = [
  { number: 1, title: 'The Foundation', days: '1–10', description: 'Core concepts every user needs before deeper practice.' },
  { number: 2, title: 'Cultivating Wisdom', days: '11–18', description: 'The master virtue and its four sub-virtues.' },
  { number: 3, title: 'Mastering Your Thoughts', days: '19–26', description: 'From understanding wisdom to practising it in the domain of thought.' },
  { number: 4, title: 'Mastering Your Emotions', days: '27–35', description: 'The four passions, the three eupatheiai, and the sub-virtues of Temperance.' },
  { number: 5, title: 'Practising Acceptance', days: '36–43', description: 'Acceptance as the precondition for action, with the sub-virtues of Courage.' },
  { number: 6, title: 'Living in Gratitude', days: '44–50', description: 'Gratitude as clear-eyed recognition, with the sub-virtues of Justice.' },
  { number: 7, title: 'Integration — Becoming the Prokoptos', days: '51–56', description: 'Bringing everything together into a unified, ongoing practice.' },
]

export const JOURNAL_ENTRIES: JournalEntry[] = [
  // ═══════════════════════════════════════
  // PHASE 1: THE FOUNDATION (Days 1–10)
  // ═══════════════════════════════════════
  {
    day: 1, phase: 1, phaseTitle: 'The Foundation',
    title: 'What Is Truly Good?',
    teaching: 'The Stoics held that the only genuine good is virtue — the excellence of your character. Everything else — health, wealth, reputation, pleasure — they called \'indifferents.\' Not because these things don\'t matter, but because they cannot make you a good person or a bad one. Only how you use them can do that. A wealthy person who hoards is worse off in character than a poor person who gives generously. The external changed nothing; the character changed everything.',
    question: 'Think of something you currently believe is essential to your happiness — a possession, a relationship, a status. Now imagine it was taken from you tomorrow. Would you still be able to act with kindness, honesty, and courage? Write about what truly makes you \'you\' versus what simply surrounds you.',
  },
  {
    day: 2, phase: 1, phaseTitle: 'The Foundation',
    title: 'The Dichotomy of Control',
    teaching: 'Epictetus opened his Enchiridion with the most important distinction in Stoic philosophy: some things are \'up to us\' and some things are not. What is up to us? Our judgements, our desires, our intentions, our character. What is not? Our body, our reputation, what others think, what happens in the world. Most suffering comes from confusing the two — pouring energy into controlling what we cannot, while neglecting what we can.',
    question: 'Write about a situation that is currently causing you stress or frustration. Divide it into two columns in your mind: what is genuinely within your control (your response, your effort, your attitude) and what is not (other people\'s reactions, the outcome, timing). Where have you been spending most of your energy?',
  },
  {
    day: 3, phase: 1, phaseTitle: 'The Foundation',
    title: 'The Sage — A Direction, Not a Destination',
    teaching: 'In Stoic philosophy, the Sage (Sophos) is the theoretical ideal — a person who acts from perfect virtue in every situation, is never disturbed by externals, and is free from all false beliefs. The Stoics themselves admitted that a true Sage may never have existed. The point is not to become the Sage but to use the concept as a compass. Every decision can be measured against the question: what would perfect wisdom, justice, courage, and self-control look like here?',
    question: 'Think of someone you deeply admire — not for their success, but for their character. What qualities do they embody that you wish you had more of? Now consider: is there anything actually stopping you from practicing those qualities today, even imperfectly?',
  },
  {
    day: 4, phase: 1, phaseTitle: 'The Foundation',
    title: 'The Four Cardinal Virtues',
    teaching: 'Stoicism recognises four cardinal virtues, each with its own domain. Wisdom (Phronesis) is the ability to discern what is truly good, bad, or indifferent. Justice (Dikaiosyne) is giving others what they are rightly owed — fairness, kindness, honesty. Courage (Andreia) is doing what is right even when it is difficult, uncomfortable, or frightening. Temperance (Sophrosyne) is acting with measure and self-control, free from excess. These four are not separate skills. They are aspects of one unified excellence of character.',
    question: 'Consider a recent decision you made — anything from how you handled a disagreement to what you chose to do with your evening. Which of the four virtues did you express well? Which was absent or weak? Be specific about what you did and why.',
  },
  {
    day: 5, phase: 1, phaseTitle: 'The Foundation',
    title: 'Flourishing Is Not Feeling Good',
    teaching: 'The Stoic concept of eudaimonia is often translated as \'happiness,\' but it means something closer to \'flourishing\' or \'living well.\' It is not a feeling. It is a condition of character. A person who acts with consistent virtue is flourishing even in the middle of hardship, grief, or loss. A person who has every external comfort but acts from selfishness and cowardice is not flourishing, no matter how pleasant their life feels.',
    question: 'Write about a time when you were externally comfortable but internally knew something was off — perhaps you had avoided a hard conversation, compromised your integrity, or chosen ease over what was right. What did that discomfort tell you about what flourishing actually requires of you?',
  },
  {
    day: 6, phase: 1, phaseTitle: 'The Foundation',
    title: 'Impressions and Assent',
    teaching: 'The Stoics taught that events don\'t disturb us — our judgements about events do. When something happens, you first receive an impression (phantasia): \'I\'ve been insulted.\' Before that impression becomes a belief that controls your behaviour, there is a gap. In that gap, you can choose whether to give assent. You can examine the impression: is this actually harmful, or does it only feel that way? The discipline of assent — learning to pause before accepting an impression as true — is the foundation of all emotional mastery.',
    question: 'Recall a moment recently when you reacted quickly to something — an email, a comment, a piece of news. What was the impression that hit you first? If you had paused before reacting, what might you have noticed about the impression that would have changed your response?',
  },
  {
    day: 7, phase: 1, phaseTitle: 'The Foundation',
    title: 'Preferred Indifferents — Holding Lightly',
    teaching: 'Health, friendship, knowledge, freedom, a good reputation — the Stoics called these \'preferred indifferents.\' They are natural to pursue and rational to value. But the moment you pursue any of them at the cost of virtue, you have made an error. The test is not whether you want good health, but whether you would lie, cheat, or harm others to get it. A preferred indifferent held lightly is a tool for living well. Gripped tightly, it becomes a chain.',
    question: 'Choose one preferred indifferent you value highly — perhaps your reputation, your financial security, or a particular relationship. When has the fear of losing this thing tempted you to act in a way that compromised your integrity, even slightly? What would it look like to value it without being controlled by it?',
  },
  {
    day: 8, phase: 1, phaseTitle: 'The Foundation',
    title: 'Intention Over Outcome',
    teaching: 'In Stoic ethics, the quality of an action is judged by the intention and reasoning behind it, not by the result. A person who acts with genuine wisdom and kindness but fails to achieve the desired outcome has still acted virtuously. A person who achieves a great outcome through deception or selfishness has not. This is not a loophole for carelessness — wisdom includes careful deliberation. But it frees you from the paralysis of needing to guarantee results before you act.',
    question: 'Think of a time you did the right thing but it didn\'t work out as you hoped. How did you judge yourself afterward — by the quality of your reasoning and intentions, or by the outcome? Now think of a time something worked out well despite questionable motives. Which action actually reflected better character?',
  },
  {
    day: 9, phase: 1, phaseTitle: 'The Foundation',
    title: 'What the Stoics Meant by Passion',
    teaching: 'When the Stoics warned against \'passion\' (pathos), they did not mean emotion. They meant irrational emotional responses rooted in false judgements. They identified four: excessive desire (wanting what isn\'t needed), fear (dreading what hasn\'t happened and may not be truly bad), grief (judging that something irreparable has been lost), and delight-in-excess (taking pleasure in another\'s misfortune or in vice). In their place, the Sage experiences eupatheiai — rational good emotions: joy (from acting well), caution (from clear-eyed awareness), and wishing (reasonable desire for what is good).',
    question: 'Identify one emotional reaction you\'ve had this week that was disproportionate to the actual situation. What false judgement might have been underneath it? For example, if you felt intense anxiety about a meeting, was the underlying judgement \'my reputation determines my worth\' — which the Stoics would call a false belief?',
  },
  {
    day: 10, phase: 1, phaseTitle: 'The Foundation',
    title: 'The Prokoptos — The One Making Progress',
    teaching: 'Between the ordinary person ruled by passions and the perfect Sage, the Stoics recognised the Prokoptos — the one making progress. This is the realistic aspiration. The Prokoptos does not claim to be wise but practices wisdom daily. They stumble, recognise their errors, and adjust. Progress is not perfection. It is the consistent effort to bring your actions closer to virtue, to notice when you\'ve fallen short, and to begin again without self-punishment. Every journal entry you complete is an act of the Prokoptos.',
    question: 'Where are you right now on the path between reacting on impulse and acting from considered virtue? Don\'t judge yourself harshly — simply observe. Write about one specific area where you\'ve noticed genuine progress in your character over the past year, however small.',
  },

  // ═══════════════════════════════════════
  // PHASE 2: CULTIVATING WISDOM (Days 11–18)
  // ═══════════════════════════════════════
  {
    day: 11, phase: 2, phaseTitle: 'Cultivating Wisdom',
    title: 'Discernment — Seeing What Is Actually There', virtue: 'wisdom',
    teaching: 'Discernment (euboulia) is the first sub-virtue of Wisdom. It is the ability to see a situation clearly, without the distortion of desire, fear, or assumption. Most poor decisions are not failures of willpower but failures of perception. We act on what we think is happening, not on what is actually happening. The discerning person pauses to ask: what is really going on here? What am I adding to this situation with my own beliefs and biases?',
    question: 'Think of a recent situation where you later realised you had misjudged what was happening — perhaps you assumed someone\'s motives, or misread the significance of an event. What desire, fear, or assumption clouded your initial reading? What would clear-eyed discernment have looked like?',
  },
  {
    day: 12, phase: 2, phaseTitle: 'Cultivating Wisdom',
    title: 'Circumspection — Thinking Before You Leap', virtue: 'wisdom',
    teaching: 'Circumspection (anchinoia) is the sub-virtue of considering the broader context before acting. It asks: who else is affected? What are the second-order consequences? Am I seeing the full picture or just the part that\'s in front of me? The circumspect person does not rush. They understand that a decision made in haste often creates more problems than the one it was trying to solve.',
    question: 'Recall a time you made a decision too quickly and later realised you hadn\'t considered something important — perhaps how it would affect someone else, or what it would lead to down the line. If you had taken ten more minutes to think, what might you have noticed? What made you rush?',
  },
  {
    day: 13, phase: 2, phaseTitle: 'Cultivating Wisdom',
    title: 'Prescience — Thinking Ahead Without Anxiety', virtue: 'wisdom',
    teaching: 'Prescience (pronoia) is foresight applied with wisdom. It is not worry — worry fixates on what might go wrong and treats it as certain. Prescience calmly considers what is likely, prepares where preparation is useful, and accepts that the future is not in our control. Marcus Aurelius would begin each day contemplating the difficulties he might face — not to dread them, but so that nothing would catch him unprepared and provoke an irrational reaction.',
    question: 'Think about something you are anxious about in the coming week. Write down the worst realistic outcome. Now write down what you would do if that outcome occurred. Notice: you already have a response. The anxiety was treating an uncertain future as a certain disaster. How does having a calm plan change how the situation feels?',
  },
  {
    day: 14, phase: 2, phaseTitle: 'Cultivating Wisdom',
    title: 'Resourcefulness — Wisdom in Action', virtue: 'wisdom',
    teaching: 'Resourcefulness (eumechania) is the practical expression of wisdom — the ability to find a way forward when the obvious path is blocked. It is not cleverness in the service of self-interest, but ingenuity applied to virtuous ends. The resourceful person does not waste energy lamenting the obstacle; they study it and find what can be done within the constraints they face.',
    question: 'Describe a situation where you felt stuck or blocked. Instead of writing about the frustration, write about the constraints themselves as if they were features of a puzzle. What options exist within those constraints that you haven\'t fully explored? What would a resourceful person try next?',
  },
  {
    day: 15, phase: 2, phaseTitle: 'Cultivating Wisdom',
    title: 'False Beliefs — The Root of Poor Judgement', virtue: 'wisdom',
    teaching: 'The Stoics held that all vice stems from false beliefs. If you are angry, it is because you believe something that happened should not have happened — but the universe does not consult your preferences. If you are greedy, it is because you believe wealth is genuinely good rather than merely preferred. Every irrational emotion is a signal pointing to a false belief underneath. The practice of wisdom is the practice of examining your beliefs, especially the ones that feel so obviously true that you\'ve never questioned them.',
    question: 'What is one belief you hold about how the world should work that consistently causes you frustration when reality doesn\'t match it? Write the belief out explicitly. Then ask yourself: is this a fact about reality, or a preference I\'ve promoted to the status of truth?',
  },
  {
    day: 16, phase: 2, phaseTitle: 'Cultivating Wisdom',
    title: 'The View from Above', virtue: 'wisdom',
    teaching: 'Marcus Aurelius practised what is sometimes called \'the view from above\' — mentally expanding his perspective to see his situation from the widest possible vantage point. From the scale of a human life, a missed promotion is devastating. From the scale of a city, it is one event among thousands. From the scale of history, it does not register. This exercise is not meant to trivialise your experience but to free you from the grip of the impression that this moment is everything.',
    question: 'Take something that is occupying significant mental space for you right now. Describe it first as you currently experience it. Then describe it as someone who knows you well might see it. Then describe it as it might appear in the context of your entire life. Did the shift in perspective change anything about how urgent or important it feels?',
  },
  {
    day: 17, phase: 2, phaseTitle: 'Cultivating Wisdom',
    title: 'Wisdom and the Indifferents: Health', virtue: 'wisdom',
    teaching: 'Health is the most valued of the preferred indifferents. It is natural and rational to care for your body. But the Stoics observed that many people treat health as if it were the highest good — sacrificing relationships, integrity, or peace of mind in its pursuit, or falling into despair when it deteriorates. The wise person cares for their health as a preferred indifferent: they do what is reasonable without making their happiness contingent on the outcome.',
    question: 'How do you relate to your own health? Is there any area where concern for your body has tipped over into anxiety, obsession, or avoidance? Write about what a balanced relationship with your physical health would look like — one where you care for it without being enslaved to it.',
  },
  {
    day: 18, phase: 2, phaseTitle: 'Cultivating Wisdom',
    title: 'What Would a Sage Do Here?', virtue: 'wisdom',
    teaching: 'This is the central practical question of Stoic ethics. It does not ask you to be perfect. It asks you to use the Sage as a thought experiment — a benchmark for clarity. A person with complete wisdom, unfailing justice, steady courage, and measured self-control: what would they see in this situation that you might be missing? What would they prioritise? What would they refuse to do? The answer is your direction, even if you can only take one step toward it.',
    question: 'Choose a situation you are currently navigating — a decision at work, a tension in a relationship, a personal dilemma. Describe it briefly. Then write, as specifically as you can, what you believe a person of perfect character would do. Not what would feel good, not what would be easy, but what would be right. How far is that from what you are actually doing?',
  },

  // ═══════════════════════════════════════
  // PHASE 3: MASTERING YOUR THOUGHTS (Days 19–26)
  // ═══════════════════════════════════════
  {
    day: 19, phase: 3, phaseTitle: 'Mastering Your Thoughts',
    title: 'Your Thoughts Are Not Facts',
    teaching: 'The Stoics understood something that modern cognitive science has confirmed: the mind generates interpretations automatically, and we tend to treat those interpretations as facts. \'He didn\'t reply to my message\' becomes \'He\'s ignoring me\' becomes \'Nobody respects me.\' Each step feels like observation, but only the first one is. The rest are judgements you\'ve added. Mastering your thoughts begins with learning to separate raw observation from the story your mind layers on top of it.',
    question: 'Think of a situation this week where you felt a negative emotion. Write down the bare facts of what happened — just the observable events, with no interpretation. Then write down the story you told yourself about those facts. What did you add? Where did the emotion actually come from — the event, or the story?',
  },
  {
    day: 20, phase: 3, phaseTitle: 'Mastering Your Thoughts',
    title: 'The Discipline of Assent in Practice',
    teaching: 'When an impression arises — \'I\'ve been disrespected,\' \'This is unfair,\' \'I can\'t handle this\' — the Stoic practice is to hold it at arm\'s length and examine it before accepting it as true. Epictetus compared impressions to visitors at your door: you don\'t have to let every one of them in. The practice is simple but demanding: when a strong impression strikes, say to yourself, \'You are just an impression and not at all the thing you appear to be.\' Then decide whether it deserves your assent.',
    question: 'For one day this week, try to catch yourself in the act of accepting an impression without examination. Write about at least one instance where you caught an automatic judgement and paused before letting it drive your behaviour. What did you discover in the pause? If you didn\'t catch any, write about why you think they slip past unnoticed.',
  },
  {
    day: 21, phase: 3, phaseTitle: 'Mastering Your Thoughts',
    title: 'The Stories You Tell Yourself About Yourself',
    teaching: 'Among the most powerful impressions are the ones about your own identity. \'I\'m not good enough.\' \'I\'m the kind of person who always...\' \'I could never...\' These are not observations; they are narratives you have rehearsed so often they feel like bedrock truth. But the Stoics remind us that your character is built by choices, not by stories. Every moment offers a fresh choice. The narrative only has power if you keep giving it your assent.',
    question: 'What is a story you tell yourself about who you are that limits you? Write it out as a clear statement. Then ask: when did this story begin? What evidence have you been selectively gathering to support it? Is there counter-evidence you\'ve been dismissing? What would you do differently if this story were simply not true?',
  },
  {
    day: 22, phase: 3, phaseTitle: 'Mastering Your Thoughts',
    title: 'Catastrophising — The Passion of Fear in Thought',
    teaching: 'The Stoic passion of fear (phobos) manifests most commonly as catastrophising — the mind\'s tendency to project a chain of worst-case outcomes and treat them as inevitable. Seneca observed that we suffer more in imagination than in reality. The catastrophising mind skips past probability and lands on the most frightening possibility, then rehearses it as though preparing for certainty. True prescience considers what might happen calmly. Catastrophising surrenders to the impression that it will happen.',
    question: 'Write about something you recently catastrophised about. Trace the chain of thoughts: what was the initial trigger, and how did your mind escalate it? Now write what actually happened (or what is most likely to happen). Notice the gap between the catastrophe you rehearsed and the reality. What does this pattern cost you?',
  },
  {
    day: 23, phase: 3, phaseTitle: 'Mastering Your Thoughts',
    title: 'Rumination — When Thoughts Become Chains',
    teaching: 'Rumination is the mental habit of replaying past events with the implicit belief that if you think about them enough, something will change. It is a failure of the dichotomy of control applied to the past. What happened has already left your sphere of influence. The only thing \'up to you\' now is how you interpret it and what you do next. Rumination gives the false comfort of engagement while actually keeping you trapped in a loop that produces nothing.',
    question: 'Is there something from your past that you find yourself replaying repeatedly? Write about it — but instead of retelling the story, write about what your mind is seeking by going back to it. Closure? A different outcome? Self-punishment? What would it look like to accept that the event is no longer \'up to you\' and redirect that energy toward something that is?',
  },
  {
    day: 24, phase: 3, phaseTitle: 'Mastering Your Thoughts',
    title: 'Comparison — The Thief of Equanimity',
    teaching: 'Comparison is a form of false judgement that treats another person\'s externals (success, appearance, possessions) as evidence of your own deficiency. The Stoics would point out two errors: first, you are treating indifferents as goods. The other person\'s wealth or status is not a genuine good, so having less of it is not a genuine loss. Second, you are ignoring the only meaningful comparison: are you more virtuous today than yesterday? That is the only measure that tracks anything real.',
    question: 'Who do you most often compare yourself to, and in what dimension? Write about what you believe they have that you lack. Now apply the Stoic lens: is the thing you envy a genuine good (virtue) or a preferred indifferent? If it disappeared from their life, would they still be admirable? What does your comparison reveal about what you\'ve been treating as truly important?',
  },
  {
    day: 25, phase: 3, phaseTitle: 'Mastering Your Thoughts',
    title: 'The Inner Citadel',
    teaching: 'Marcus Aurelius spoke of the \'inner citadel\' — the idea that your rational mind is a fortress that nothing external can penetrate unless you open the gates. Insults cannot enter without your assent that they are hurtful. Losses cannot devastate without your judgement that they are catastrophic. This is not denial. The Sage still feels the initial sting of impression. But the citadel holds because the Sage does not add the second arrow — the story that makes the impression into suffering.',
    question: 'Think of the last time someone\'s words or actions got under your skin. What \'gate\' did you open? What was the judgement you accepted that allowed the external event to disturb your inner state? If your citadel had held — if you had felt the impression but not assented to the judgement — how would the rest of your day have been different?',
  },
  {
    day: 26, phase: 3, phaseTitle: 'Mastering Your Thoughts',
    title: 'Attention — Where You Place It Is Who You Become',
    teaching: 'The Stoics understood that attention is a form of practice. What you attend to, you strengthen. If you spend your mental energy replaying grievances, you become more grievance-prone. If you practice noticing what you can influence and acting on it, you become more effective and calm. Epictetus taught that philosophical progress begins with paying attention to your own mind — watching what it does, catching it in the act of false judgement, and gently redirecting it.',
    question: 'Track where your attention has gone today. Not what you did with your time, but what your mind kept returning to when it was free — in the shower, walking, lying in bed. What does this pattern tell you about what you are currently practising without realising it? If you could redirect that attention toward something more aligned with your character, what would it be?',
  },

  // ═══════════════════════════════════════
  // PHASE 4: MASTERING YOUR EMOTIONS (Days 27–35)
  // ═══════════════════════════════════════
  {
    day: 27, phase: 4, phaseTitle: 'Mastering Your Emotions',
    title: 'Understanding the Four Passions', virtue: 'temperance',
    teaching: 'The Stoics identified four root passions (pathe) from which all emotional disturbance grows. Excessive desire (epithumia) — craving what you don\'t have. Fear (phobos) — dreading what hasn\'t arrived. Grief (lupe) — believing something irreparable has been taken. Pleasure-in-vice (hedone) — delight that comes from something base. Each is rooted in a false judgement: that something external is genuinely good or bad rather than indifferent. Understanding this structure doesn\'t eliminate the feelings. It gives you a map to navigate them.',
    question: 'Which of the four passions is most active in your life right now? Excessive desire for something? Fear of something? Grief over something lost? Or pleasure that you suspect isn\'t serving your character? Write about how it shows up in your daily thoughts and behaviours, and identify the false judgement underneath it.',
  },
  {
    day: 28, phase: 4, phaseTitle: 'Mastering Your Emotions',
    title: 'Anger — The Most Dangerous Passion', virtue: 'temperance',
    teaching: 'Seneca devoted an entire work to anger, calling it the most destructive of all emotions. He observed that anger arises from the belief that we have been wronged and that the wrong was both intentional and unjust. The Stoic response is not suppression but examination: was this actually an injustice, or an indifferent that didn\'t go my way? Was the intent truly malicious, or am I assuming the worst? Even if the wrong was real, does anger improve my ability to respond wisely?',
    question: 'Think of the last time you felt genuinely angry. Write about the event, then unpack the three assumptions Seneca identified: (1) Was there actually a wrong, or was your expectation the problem? (2) Was it intentional, or are you assuming? (3) Did the anger help you respond better, or did it narrow your options? Be ruthlessly honest.',
  },
  {
    day: 29, phase: 4, phaseTitle: 'Mastering Your Emotions',
    title: 'Self-Control Is Not Suppression', virtue: 'temperance',
    teaching: 'Stoic self-control (enkrateia) is often confused with emotional suppression — gritting your teeth and pushing feelings down. This is not what the Stoics taught. Suppression leaves the false belief intact and simply prevents its expression. True self-control works upstream: it addresses the judgement that created the passion. When the belief is corrected, the emotional disturbance naturally subsides. You don\'t have to fight the wave if you stop feeding the wind.',
    question: 'Is there an area of your life where you are suppressing rather than resolving? Where you are using willpower to contain a reaction without ever examining the belief that generates it? Write about what you\'ve been suppressing, and then dig underneath: what judgement about the world or yourself is creating the pressure you\'re holding back?',
  },
  {
    day: 30, phase: 4, phaseTitle: 'Mastering Your Emotions',
    title: 'Eupatheiai — The Good Emotions', virtue: 'temperance',
    teaching: 'The Stoics were not emotionless. They replaced the four passions with three rational good emotions (eupatheiai). Joy (chara) — the deep satisfaction of knowing you are acting well. Caution (eulabeia) — clear-eyed awareness of genuine risks without irrational dread. Wishing (boulesis) — rational desire for what is genuinely good, which is always virtue. These are not cold or sterile. Joy in virtuous action can be profound. The difference is that eupatheiai are grounded in reality, not in false judgements about externals.',
    question: 'Can you identify a moment recently when you experienced something close to Stoic joy — a quiet, deep satisfaction from knowing you acted rightly, regardless of the outcome? It might have been small: telling the truth when a lie would have been easier, helping someone without needing recognition. Write about that moment and how it felt compared to the pleasure that comes from getting what you want.',
  },
  {
    day: 31, phase: 4, phaseTitle: 'Mastering Your Emotions',
    title: 'Grief and Loss — The Stoic Approach', virtue: 'temperance',
    teaching: 'The Stoic position on grief is often misunderstood as \'don\'t feel sad.\' What they actually taught is that grief (lupe) becomes pathological when it is rooted in the judgement that something irreplaceable and genuinely good has been taken. The Stoic reframe is not to deny loss but to adjust the underlying belief: what was lost was a preferred indifferent, not the only source of your flourishing. You still feel the natural human response. But you are not destroyed by it, because your core good — your character — remains intact.',
    question: 'Write about a loss you have experienced — it need not be recent. First, acknowledge what it meant to you without any philosophical overlay. Then, gently, consider: what was the underlying belief that made the loss feel like it threatened your ability to live well? Is that belief accurate? Can you honour the loss while recognising that your capacity for virtue — your real good — survived it?',
  },
  {
    day: 32, phase: 4, phaseTitle: 'Mastering Your Emotions',
    title: 'Desire and Attachment', virtue: 'temperance',
    teaching: 'The Stoic passion of desire (epithumia) is not wanting things. It is wanting things in the wrong way — treating a preferred indifferent as though your flourishing depends on acquiring it. Epictetus gave the famous advice: when you kiss your child goodnight, whisper to yourself that they are mortal. Not to diminish your love, but to free it from the delusion of permanence. The goal is to love and desire fully while understanding that no external thing is guaranteed, and that your good does not leave with it if it goes.',
    question: 'What are you currently gripping too tightly? A goal, a person, a version of the future? Write about what this attachment looks like in practice — how it affects your daily thoughts and decisions. Then write about what it would feel like to want this thing while genuinely accepting that you might not get it. What changes when you loosen the grip even slightly?',
  },
  {
    day: 33, phase: 4, phaseTitle: 'Mastering Your Emotions',
    title: 'Orderliness — The Shape of a Good Life', virtue: 'temperance',
    teaching: 'Orderliness (eutaxia) is the first sub-virtue of Temperance. It is the quality of living a well-structured life — not rigid or obsessive, but measured and intentional. The orderly person does not leave important things to chance or impulse. They create conditions that support virtuous action: routines that remove unnecessary decisions, environments that reduce temptation, rhythms that protect time for what matters. Disorder is not freedom. It is friction.',
    question: 'Look at your daily routines. Where is there unnecessary disorder — areas where lack of structure consistently leads to poor choices or wasted energy? Write about one area where bringing more intentional order could free you to focus on what actually matters. What small structural change would have the biggest impact?',
  },
  {
    day: 34, phase: 4, phaseTitle: 'Mastering Your Emotions',
    title: 'Propriety — The Right Thing at the Right Time', virtue: 'temperance',
    teaching: 'Propriety (kosmiotis) is the sub-virtue of knowing what is fitting for the situation. It is not about social conformity but about reading context with wisdom. The courageous thing to say at a funeral is different from the courageous thing to say in a boardroom. The kind response to a stranger\'s rudeness is different from the kind response to a friend\'s betrayal. Propriety ensures that virtue is not applied with a sledgehammer when a scalpel is needed.',
    question: 'Think of a time when you said or did the right thing in principle but at the wrong time, in the wrong way, or to the wrong person. What happened? What would propriety — the sensitivity to context and timing — have looked like in that moment? What information were you ignoring about the situation?',
  },
  {
    day: 35, phase: 4, phaseTitle: 'Mastering Your Emotions',
    title: 'Modesty — Knowing Your Place in the Whole', virtue: 'temperance',
    teaching: 'Modesty (aidemonikon) in the Stoic sense is not self-deprecation. It is the accurate recognition that you are one human being among billions, one moment in an unimaginably long history, one small part of a vast rational cosmos. This is not a diminishment. It is a liberation. When you stop inflating your own importance, you stop needing the world to revolve around your preferences. You can act for the common good without needing the credit. You can fail without it being a cosmic catastrophe.',
    question: 'Where in your life are you making things about you that aren\'t really about you? A situation at work that you\'re taking personally, a relationship dynamic where you\'ve centred your own feelings? Write about what the situation looks like when you remove yourself from the centre and see it as a broader picture that you are part of, not the point of.',
  },

  // ═══════════════════════════════════════
  // PHASE 5: PRACTISING ACCEPTANCE (Days 36–43)
  // ═══════════════════════════════════════
  {
    day: 36, phase: 5, phaseTitle: 'Practising Acceptance',
    title: 'Acceptance Is Not Passivity',
    teaching: 'The Stoic practice of acceptance is frequently mistaken for resignation. It is the opposite. Acceptance means seeing reality clearly and working with what is, rather than exhausting yourself fighting what cannot be changed. The farmer who accepts that the weather is not in her control is not passive — she is freed to focus all her energy on what she can do: prepare the soil, choose the right seed, respond to conditions as they arise. Resistance to reality is wasted energy. Acceptance is the precondition for effective action.',
    question: 'What is something in your life right now that you are resisting accepting — something that is already the case, that no amount of wishing or complaining will change? Write about what this resistance costs you in energy, mood, and effectiveness. Then write about what becomes possible if you fully accept the situation as it is. What actions open up that resistance was blocking?',
  },
  {
    day: 37, phase: 5, phaseTitle: 'Practising Acceptance',
    title: 'Endurance — The First Sub-Virtue of Courage', virtue: 'courage',
    teaching: 'Endurance (karteria) is the capacity to continue doing what is right when it is uncomfortable, painful, or prolonged. It is not the dramatic courage of a single brave act but the quiet courage of persistence. The Prokoptos who journals every day, who catches their impressions, who keeps practising virtue despite setbacks — this is endurance. It does not require that you feel strong. It requires that you continue.',
    question: 'Where in your life is endurance being tested right now? A long-term project, a difficult relationship, a health challenge, a personal change that is taking longer than you expected? Write about what makes you want to give up. Then write about what continuing — even imperfectly — would mean for your character.',
  },
  {
    day: 38, phase: 5, phaseTitle: 'Practising Acceptance',
    title: 'Accepting What Others Do',
    teaching: 'Marcus Aurelius wrote that he should begin each day expecting to encounter people who are meddling, ungrateful, arrogant, and dishonest. Not to judge them, but to prepare himself. Other people\'s behaviour is not in your control. Their rudeness, their broken promises, their failures of character — these are their business, not yours. Your business is how you respond. The Sage does not need others to behave well in order to act well themselves.',
    question: 'Who in your life consistently disappoints you or behaves in ways you find difficult? Write about the expectation you hold for them that they keep failing to meet. Now consider: is this expectation within your control to enforce? What would it look like to release the expectation while still treating them with justice and maintaining your own standards?',
  },
  {
    day: 39, phase: 5, phaseTitle: 'Practising Acceptance',
    title: 'Confidence — Acting from Conviction', virtue: 'courage',
    teaching: 'Confidence (tharrhos) in the Stoic sense is not bravado or self-assurance based on past success. It is the firm conviction that virtue is sufficient for flourishing, no matter what happens. The confident person acts because they have reasoned that the action is right, and they do not need a guarantee of success before they begin. This is not arrogance — it is freedom from the paralysis of needing certainty.',
    question: 'Think of a situation where you hesitated to act because you weren\'t sure it would work out. What were you waiting for? A guarantee that didn\'t come? Approval from someone else? Write about what confidence based on your own reasoning — rather than confidence based on predicted outcomes — would have looked like in that moment.',
  },
  {
    day: 40, phase: 5, phaseTitle: 'Practising Acceptance',
    title: 'Accepting Your Own Limitations',
    teaching: 'The dichotomy of control applies to yourself as much as to the external world. Your past actions, your current abilities, your temperament, the time you\'ve already lost — these are facts, not failures. The Stoics would say: work with the material you have. Epictetus was a former slave with a crippled leg. He did not waste energy wishing for a different starting point. He focused entirely on what remained in his power: the quality of his thoughts and actions.',
    question: 'What is a limitation you have been fighting against rather than working with? Perhaps a personality trait, a skill gap, a life circumstance that you cannot change immediately? Write about what it would look like to accept this limitation as the current reality — not as a permanent sentence, but as today\'s starting point — and build from there.',
  },
  {
    day: 41, phase: 5, phaseTitle: 'Practising Acceptance',
    title: 'Magnanimity — Greatness of Soul', virtue: 'courage',
    teaching: 'Magnanimity (megalopsuchia) is the sub-virtue of not being diminished by pettiness. The magnanimous person does not get pulled into small disputes, does not seek revenge for minor slights, does not measure their worth by comparison with others. This is not because they are indifferent to injustice — Justice demands they respond to genuine wrongs. But they can distinguish between a genuine wrong and a wounded ego, and they refuse to let the small things shrink their character.',
    question: 'What petty thing has been occupying more of your mental space than it deserves? A small slight, an irritation with someone, a frustration that keeps recycling? Write about it honestly, then ask yourself: is this a matter of justice that requires a response, or is it wounded pride that magnanimity would let pass? What does the larger version of yourself look like here?',
  },
  {
    day: 42, phase: 5, phaseTitle: 'Practising Acceptance',
    title: 'Amor Fati — Loving What Is',
    teaching: 'The Stoic concept that comes closest to \'amor fati\' (love of fate) is the idea that the rational person does not merely endure what happens but recognises it as part of the natural order. Not because everything is pleasant, but because resistance to what has already occurred is irrational. It is fighting a battle that ended before you arrived. The deepest form of acceptance is not tolerance but a genuine turning toward reality, finding within it the material for virtue rather than reasons for complaint.',
    question: 'Think of something that happened to you that you wished had gone differently — something you might even describe as having \'ruined\' a period of your life. Can you find, within that unwanted experience, anything that contributed to who you are now in a way you would not want to undo? Write about how this difficulty served your development, even if that was never its purpose.',
  },
  {
    day: 43, phase: 5, phaseTitle: 'Practising Acceptance',
    title: 'Industriousness — Right Effort, Right Direction', virtue: 'courage',
    teaching: 'Industriousness (philoponia) is not mere busyness. It is directed, purposeful effort in service of what matters. The industrious person works hard at the right things — their character, their duties, their contributions. They do not confuse activity with progress or effort with value. Seneca warned that many people spend their lives being very busy accomplishing nothing of real importance. Industriousness asks: am I working hard at something that matters, or just working hard?',
    question: 'Look at where your effort goes in a typical week. Are you industrious about the right things — your character development, your relationships, your genuine responsibilities? Or are you pouring effort into things that feel productive but don\'t actually serve what matters? Write about one area where you could redirect effort from the merely busy to the genuinely important.',
  },

  // ═══════════════════════════════════════
  // PHASE 6: LIVING IN GRATITUDE (Days 44–50)
  // ═══════════════════════════════════════
  {
    day: 44, phase: 6, phaseTitle: 'Living in Gratitude',
    title: 'Gratitude Is Not Positivity',
    teaching: 'Stoic gratitude is not the modern self-help instruction to \'think positive.\' It is something more rigorous. It begins with the recognition that every preferred indifferent you currently enjoy — your health, your friendships, your freedom, the fact that you are alive to read this — is not guaranteed and not owed to you. It was always possible for things to be otherwise. Gratitude in the Stoic sense is the clear-eyed acknowledgement of what is present, without the demand that it remain.',
    question: 'List five things in your life that you currently take for granted — things you would desperately miss if they vanished tomorrow. For each one, write a single sentence about what your life would look like without it. Notice the shift in attention. You haven\'t gained anything new. You\'ve simply seen what was already there.',
  },
  {
    day: 45, phase: 6, phaseTitle: 'Living in Gratitude',
    title: 'The Gratitude of Mortality',
    teaching: 'The Stoics practised memento mori — the remembrance of death — not as morbidity but as the most powerful engine of gratitude. When you truly absorb that your life is finite, that this particular day will never come again, and that the people you love will not always be here, something shifts. The mundane becomes precious. The irritation of a traffic jam dissolves when you remember that driving anywhere at all is a gift of limited duration.',
    question: 'Imagine that you have been told you have one year left to live. Not as a dramatic exercise, but as a genuine consideration. What in your current life would you suddenly see as precious that you currently overlook? What would you stop wasting time on? What would you say to someone that you\'ve been putting off? Write about what mortality reveals about your real priorities.',
  },
  {
    day: 46, phase: 6, phaseTitle: 'Living in Gratitude',
    title: 'Gratitude for Difficulty',
    teaching: 'Seneca argued that difficulties are not obstacles to a good life but the material of it. The athlete does not resent the weight. It is the thing that builds strength. Every frustration, every setback, every uncomfortable situation is an opportunity to practise virtue — patience, endurance, wisdom, self-control. Gratitude for difficulty is not masochism. It is the recognition that character is built under pressure, not in comfort.',
    question: 'Think of the most difficult period of your life. Write about the specific virtues it forced you to develop — not in a silver-lining, everything-happens-for-a-reason way, but honestly: what muscles of character did that difficulty build that you now rely on? Could you have developed those qualities any other way?',
  },
  {
    day: 47, phase: 6, phaseTitle: 'Living in Gratitude',
    title: 'Piety — Gratitude Toward What Is Greater', virtue: 'justice',
    teaching: 'Piety (eusebeia) is the first sub-virtue of Justice. In Stoic philosophy, it does not require belief in personal gods. It is the recognition that you exist within a rational natural order that is vastly larger than yourself, and that your existence within it is not earned. Piety is the appropriate response to the fact of being alive — a kind of cosmic gratitude. It is the foundation of humility: you did not create yourself, and you are not the centre of the universe.',
    question: 'Regardless of your religious or spiritual beliefs, write about your relationship with the fact that you exist at all. Do you live as though your existence is owed to you, or as though it is a gift of circumstance? How might your daily actions change if you lived with a deeper sense of gratitude for the mere opportunity to be here and to act?',
  },
  {
    day: 48, phase: 6, phaseTitle: 'Living in Gratitude',
    title: 'Kindness — Gratitude Extended to Others', virtue: 'justice',
    teaching: 'Kindness (eunoia) is the second sub-virtue of Justice. It is the natural extension of gratitude: when you recognise that much of what is good in your life came through others — parents, teachers, friends, strangers who built the roads you drive on — kindness becomes the obvious response. The Stoic concept of oikeiosis describes a natural affection that begins with self-care and expands outward to family, community, and ultimately all of humanity. Kindness is how gratitude moves from feeling to action.',
    question: 'Think of three people who contributed something meaningful to your life that you have never properly acknowledged — perhaps because the contribution seemed small, or because acknowledging it felt uncomfortable. Write about what each person gave you. If you were to express genuine gratitude to one of them, what would you say?',
  },
  {
    day: 49, phase: 6, phaseTitle: 'Living in Gratitude',
    title: 'Social Virtue — Gratitude for Community', virtue: 'justice',
    teaching: 'The Stoics were not individualists. They believed that human beings are fundamentally social creatures, built for cooperation and mutual care. Marcus Aurelius reminded himself constantly that he was made for others, not just for himself. Social virtue (koinonoemosyne) is the recognition that your flourishing is intertwined with the flourishing of those around you. Gratitude for community is not sentimental. It is the practical acknowledgement that you cannot develop virtue in isolation.',
    question: 'Who is in your \'community\' — the people whose lives overlap with yours in meaningful ways? Write about what each person or group brings to your life that helps you become a better person. Are there communities you have neglected or taken for granted? What would it look like to invest more of yourself in the relationships that genuinely help you grow?',
  },
  {
    day: 50, phase: 6, phaseTitle: 'Living in Gratitude',
    title: 'Fair Dealing — Giving What Is Owed', virtue: 'justice',
    teaching: 'Fair dealing (synallagmatikon) is the sub-virtue of giving people exactly what they are owed — no more, no less. It is honesty in transactions, reliability in promises, truthfulness even when it is inconvenient. The Stoics considered this so fundamental that their conflict resolution rules state: lying is never virtuous, even to prevent harm. Fair dealing is the foundation of trust, and trust is the foundation of every relationship, every institution, every society.',
    question: 'Is there anywhere in your life where you are not dealing fairly — where you owe someone honesty, reliability, effort, or acknowledgement that you have not given? Write about it without justification. What would restoring fair dealing in this area require of you? What has prevented you from doing it so far?',
  },

  // ═══════════════════════════════════════
  // PHASE 7: INTEGRATION (Days 51–56)
  // ═══════════════════════════════════════
  {
    day: 51, phase: 7, phaseTitle: 'Integration — Becoming the Prokoptos',
    title: 'The Unity of the Virtues',
    teaching: 'The Stoics held that the four virtues are not separate qualities you can possess independently. You cannot be truly courageous without wisdom (recklessness is not courage). You cannot be truly just without temperance (righteous fury without measure is not justice). The virtues are aspects of a single unified excellence of character. As you progress, they develop together. A person who grows in wisdom simultaneously grows in their capacity for justice, courage, and self-control.',
    question: 'Think of an area where you believe you are strong in one virtue but weak in another. For example, you might be courageous in confrontation but lack temperance in how you do it, or wise in analysis but lacking in the justice of applying your insights for others. Write about how strengthening your weaker virtue would actually enhance the one you think is already strong.',
  },
  {
    day: 52, phase: 7, phaseTitle: 'Integration — Becoming the Prokoptos',
    title: 'Your Duties — Kathikon in Daily Life',
    teaching: 'The Stoics spoke of kathikon — \'appropriate action\' or \'duty.\' These are the actions that flow naturally from your roles: as a parent, a friend, a colleague, a citizen, a human being. Duties are not burdens imposed from outside. They are the natural expression of your place in the web of relationships. The Prokoptos does not need to search for meaning. Meaning is already present in the faithful execution of the duties that life has given you.',
    question: 'List the roles you currently hold: family member, professional, friend, community member, human being. For each role, write down the core duty it carries. Then honestly assess: which duties are you fulfilling well? Which have you been neglecting? What would it look like to bring full virtue to every role, starting this week?',
  },
  {
    day: 53, phase: 7, phaseTitle: 'Integration — Becoming the Prokoptos',
    title: 'The Conflict Resolution Framework',
    teaching: 'When virtues seem to conflict — when being honest might hurt someone, when self-care might mean neglecting a duty — the Stoics provided a hierarchy. Virtue always wins over preferred indifferents: never sacrifice your character for external gain. Higher duties supersede lower ones: duty to humanity outweighs duty to your employer. Lying is never virtuous, but silence or redirection may be permitted. Self-care that enables greater future virtue is itself a form of duty. These rules exist not to make decisions easy but to make them clear.',
    question: 'Think of a situation where you felt genuinely torn between two seemingly right courses of action. Write about the conflict. Then apply the Stoic hierarchy: which duty was higher? Was a preferred indifferent masquerading as a virtue? Was there a path that served all four virtues simultaneously, even if imperfectly? What does the framework reveal about the right path?',
  },
  {
    day: 54, phase: 7, phaseTitle: 'Integration — Becoming the Prokoptos',
    title: 'Reviewing Your Progress — The Evening Examination',
    teaching: 'The Stoics practised a daily evening review. Seneca described his own: each night, he would examine his day and ask three questions. Where did I go wrong? What did I do well? What could I do better? This is not self-punishment. It is the Prokoptos taking inventory with the calm curiosity of a scientist. You are not judging yourself. You are observing yourself, so that tomorrow can be one degree closer to virtue than today.',
    question: 'Conduct a Stoic evening review of your day today (or yesterday). Write about: one moment where you fell short of the person you want to be, one moment where you acted well, and one specific thing you can do differently tomorrow. Keep it factual, not emotional. The goal is clarity, not guilt.',
  },
  {
    day: 55, phase: 7, phaseTitle: 'Integration — Becoming the Prokoptos',
    title: 'Building Your Personal Practice',
    teaching: 'This journal has given you a structured path, but the path does not end here. The Prokoptos builds a personal practice — daily habits that keep the principles alive. Marcus Aurelius wrote his Meditations as ongoing self-reminders, not as a finished book. Epictetus practised and taught the same exercises for decades. The question is not \'have I learned Stoicism?\' but \'am I practising it?\' A practice can be as simple as: morning intention, midday check-in, evening review.',
    question: 'Design your ongoing Stoic practice. What will you do each morning to set your intention? What will you do during the day to catch yourself when impressions are pulling you off course? What will you do each evening to review and adjust? Write it down as a commitment to yourself — simple, sustainable, and honest.',
  },
  {
    day: 56, phase: 7, phaseTitle: 'Integration — Becoming the Prokoptos',
    title: 'A Letter to Your Future Self',
    teaching: 'You have spent weeks examining Stoic principles through the lens of your own life. You have explored wisdom, mastered the territory of your thoughts, faced your emotions, practised acceptance, and cultivated gratitude. These are not things you have finished. They are things you have begun. The Prokoptos never arrives. They continue. This final entry is your opportunity to speak to the person you are becoming — to capture what you have learned and what you intend to carry forward.',
    question: 'Write a letter to yourself, to be read six months from now. Tell that future person what you discovered during this journal. What was the most important insight? What pattern did you uncover that you don\'t want to forget? What commitment are you making? Write with the honesty of someone who knows they will be the only reader.',
  },
]

/** Get the phase for a given day number */
export function getPhaseForDay(day: number): typeof PHASES[number] | undefined {
  return PHASES.find(p => {
    const [start, end] = p.days.split('–').map(Number)
    return day >= start && day <= end
  })
}

/** Get a specific journal entry by day number */
export function getJournalEntry(day: number): JournalEntry | undefined {
  return JOURNAL_ENTRIES.find(e => e.day === day)
}

/** Total number of journal days */
export const TOTAL_JOURNAL_DAYS = 56
