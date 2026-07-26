/**
 * Brand display — UI-only metadata (colours, images, English labels) for
 * rendering brand assets across the site. Deliberately kept OUT of
 * stoic-brain.ts: that file sits inside /api/reason's and /api/guardrail's
 * measured import graph, and editing it — even purely additively — trips the
 * git byte-identity guard several 'Remaining Principles' sessions built to
 * protect the false-hold observation window (see e.g.
 * src/app/logos/__tests__/human-practitioner-boundary.test.ts). This file
 * only reads stoic-brain's TYPES (KatorthomaProximityLevel), never its values,
 * so it adds no coupling to the measured engine.
 *
 * Source: brand-2026-07 proposal (operations/brand-2026-07/).
 */

import type { KatorthomaProximityLevel } from './stoic-brain'

// ============================================================================
// PROXIMITY COLORS — the single canonical katorthoma-proximity colour palette.
// Founder-adopted (brand-2026-07 proposal §2.1), sourced from the Five Stages
// of Practice imagery: The Storm / The Worn Path / The Crossroads /
// The Clear Summit / The Inner Fire. Replaces every independently hardcoded
// proximity palette previously scattered across page.tsx, score/page.tsx,
// community/page.tsx, dashboard/page.tsx, document-scorer.ts, and
// PracticeCalendar.tsx.
// ============================================================================

export const PROXIMITY_COLORS: Record<KatorthomaProximityLevel, string> = {
  reflexive: '#4A5568',
  habitual: '#8B6F47',
  deliberate: '#B2AC88',
  principled: '#5B8C6D',
  sage_like: '#C9A84C',
}

// ============================================================================
// STAGE DISPLAY — the Five Stages of Practice: dedicated-page metadata pairing
// each katorthoma proximity level with its Stage image + title, per
// brand-2026-07 proposal §2.2. Distinct from PROXIMITY_COLORS above (which is
// used for the per-action score indicators) — this table is consumed by the
// five dedicated Stage pages and the image-glossary page.
// ============================================================================

export interface StageDisplay {
  id: KatorthomaProximityLevel
  name: string
  slug: string
  image: string
  color: string
  description: string
}

export const STAGE_DISPLAY: readonly StageDisplay[] = [
  {
    id: 'reflexive',
    name: 'The Storm',
    slug: 'the-storm',
    image: '/images/The Storm.PNG',
    color: PROXIMITY_COLORS.reflexive,
    description: 'Everything is chaotic and uncontrolled — action from pure impulse, with no deliberation.',
  },
  {
    id: 'habitual',
    name: 'The Worn Path',
    slug: 'the-worn-path',
    image: '/images/The Worn Path.PNG',
    color: PROXIMITY_COLORS.habitual,
    description: 'Following someone else\'s footsteps, not choosing your own direction — action from convention or habit, not from understanding.',
  },
  {
    id: 'deliberate',
    name: 'The Crossroads',
    slug: 'the-crossroads',
    image: '/images/The Crossroads.PNG',
    color: PROXIMITY_COLORS.deliberate,
    description: 'Conscious reasoning at a point of choice — passion partially checked but still operative.',
  },
  {
    id: 'principled',
    name: 'The Clear Summit',
    slug: 'the-clear-summit',
    image: '/images/The Clear Summit.PNG',
    color: PROXIMITY_COLORS.principled,
    description: 'Stable commitment to virtue, with strong understanding and minimal passion — approaching sage-like quality.',
  },
  {
    id: 'sage_like',
    name: 'The Inner Fire',
    slug: 'the-inner-fire',
    image: '/images/The Inner Fire.PNG',
    color: PROXIMITY_COLORS.sage_like,
    description: 'Perfected understanding and unified virtue — complete freedom from destructive passion.',
  },
] as const

/**
 * Get the Stage display for a katorthoma proximity level.
 */
export function getStageDisplay(level: KatorthomaProximityLevel): StageDisplay {
  const found = STAGE_DISPLAY.find(s => s.id === level)
  if (!found) {
    throw new Error(`Unknown proximity level: ${level}`)
  }
  return found
}

// ============================================================================
// ROOT PASSION ENGLISH — canonical English display names for the four root
// passions (Greek ids, R8a data layer). R8c: English-only user-facing labels.
// ============================================================================

export const ROOT_PASSION_ENGLISH: Record<string, string> = {
  epithumia: 'Craving',
  hedone: 'Irrational Pleasure',
  phobos: 'Fear',
  lupe: 'Distress',
}

// ============================================================================
// PASSION IMAGE MAP — the single canonical passionId -> imagePath lookup for
// all 20 sub-species passions (19 commissioned brand images + achos's
// "millstone" image, added 2026-07-25). Source: brand-2026-07 proposal §3,
// cross-verified against stoic-brain.ts's ROOT_PASSIONS.
// ============================================================================

export const PASSION_IMAGE_MAP: Record<string, string> = {
  // epithumia (craving)
  orge: '/images/staff%20raised.PNG',
  eros: '/images/grapes.PNG',
  pothos: '/images/fig.PNG',
  philedonia: '/images/olives.PNG',
  philoplousia: '/images/owl%20coin.PNG',
  philodoxia: '/images/limestone%20fragment.PNG',
  // hedone (pleasure)
  kelesis: '/images/wax%20tablets.PNG',
  epichairekakia: '/images/cracked%20pottery.PNG',
  terpsis: '/images/lentil%20bowl.PNG',
  // phobos (fear)
  deima: '/images/sandal.PNG',
  oknos: '/images/tunic.PNG',
  aischyne: '/images/pallium%20cloak.PNG',
  thambos: '/images/spilled%20grain%20sack.PNG',
  thorybos: '/images/bread.PNG',
  agonia: '/images/wax%20scribbled.PNG',
  // lupe (distress)
  eleos: '/images/milk%20jug.PNG',
  phthonos: '/images/cheese.PNG',
  zelotypia: '/images/fish.PNG',
  penthos: '/images/onion.PNG',
  achos: '/images/millstone.PNG',
}
