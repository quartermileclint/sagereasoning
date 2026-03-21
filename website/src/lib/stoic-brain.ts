// Stoic Brain data — loaded from JSON files in the stoic-brain/ directory
// These are the core reference data for scoring and display

export const VIRTUES = [
  {
    id: 'wisdom',
    name: 'Wisdom',
    greek: 'Phronesis',
    weight: 0.30,
    icon: '/images/owllogo.PNG',
    color: '#7d9468',
    description: 'The knowledge of what is truly good, bad, and indifferent — applied through sound judgement in the moment.',
    subVirtues: ['Good sense', 'Good calculation', 'Quick-wittedness', 'Discretion', 'Resourcefulness'],
  },
  {
    id: 'justice',
    name: 'Justice',
    greek: 'Dikaiosyne',
    weight: 0.25,
    icon: '/images/scaleslogo.PNG',
    color: '#B2AC88',
    description: 'Giving each person and situation what is due — fairness, honesty, and proper social conduct.',
    subVirtues: ['Piety', 'Honesty', 'Equity', 'Fair dealing'],
  },
  {
    id: 'courage',
    name: 'Courage',
    greek: 'Andreia',
    weight: 0.25,
    icon: '/images/lionlogo.PNG',
    color: '#9e6b3a',
    description: 'Acting rightly despite fear, pain, or social pressure — endurance in the face of difficulty.',
    subVirtues: ['Endurance', 'Confidence', 'High-mindedness', 'Cheerfulness', 'Industriousness'],
  },
  {
    id: 'temperance',
    name: 'Temperance',
    greek: 'Sophrosyne',
    weight: 0.20,
    icon: '/images/lotuslogo.PNG.png',
    color: '#c45a7a',
    description: 'Self-control and moderation — ordering desires according to reason rather than impulse.',
    subVirtues: ['Good discipline', 'Seemliness', 'Modesty', 'Self-control'],
  },
] as const

export const ALIGNMENT_TIERS = [
  { id: 'sage', label: 'Sage', range: '95–100', color: '#4d6040', description: 'Perfect alignment with Stoic virtue' },
  { id: 'progressing', label: 'Progressing', range: '70–94', color: '#7d9468', description: 'Consistently virtuous with minor gaps' },
  { id: 'aware', label: 'Aware', range: '40–69', color: '#B2AC88', description: 'Some virtue, some conflict' },
  { id: 'misaligned', label: 'Misaligned', range: '15–39', color: '#c4843a', description: 'Actions driven more by impulse than reason' },
  { id: 'contrary', label: 'Contrary', range: '0–14', color: '#9e3a3a', description: 'Acting against virtue' },
] as const

export function getAlignmentTier(score: number) {
  if (score >= 95) return ALIGNMENT_TIERS[0]
  if (score >= 70) return ALIGNMENT_TIERS[1]
  if (score >= 40) return ALIGNMENT_TIERS[2]
  if (score >= 15) return ALIGNMENT_TIERS[3]
  return ALIGNMENT_TIERS[4]
}
