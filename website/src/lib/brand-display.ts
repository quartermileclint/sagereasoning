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

// ============================================================================
// PASSION IMAGE RESOLUTION — a best-effort fallback for records whose
// `passions_detected` entry does not carry a usable id, added 2026-08-02.
//
// THE PROBLEM (found via a read-only production probe while wiring passion
// images onto the dashboard): the scoring engine's prompt schema
// (sage_reason_engine — a guarded, measured file this module must not import
// or edit) specifies `passions_detected: [{"id": "...", "name": "...",
// "root_passion": "..."}]` with NO constraint on what `id` should contain. Real
// production rows carry `id: "P1"`, `id: "P2"` — arbitrary per-response
// placeholders, never a sub-species id. `PASSION_IMAGE_MAP[passion.id]` has
// therefore never reliably resolved on real action_evaluations_v3 data,
// INCLUDING on /score itself at the moment of scoring, not only in later
// history views. Reflections carry a differently-shaped, equally free-text
// `passions_detected` entry (`{sub_species, root_passion, false_judgement}` —
// no `id`, no `name` at all; see supabase-reflections-migration.sql and
// /api/reflect's REFLECTION_PROMPT).
//
// THE FIX IS DISPLAY-LAYER ONLY, deliberately: the prompt lives in a guarded
// file this module must not touch (editing it would trip the false-hold
// observation window's byte-identity guard), and even a same-session prompt
// fix wouldn't help ALREADY-STORED rows. `resolvePassionImage` tries, in
// order: the field literally being a valid id (works when the LLM happens to
// echo the sub-species id verbatim, which the read-only probe found it
// sometimes does); a Greek sub-species id appearing as a whole word inside the
// free-text `name`/`description`, which is common (e.g. "epithumia — orge
// (...)", "philedonia (...)"); and an English label word appearing the same
// way ("Timidity" -> oknos), using the vocabulary from Brand_Guidelines.docx
// §Passion Logos / Stobaeus Ecl. 2.90-91 (the same source stoic-brain.ts's
// ROOT_PASSIONS encodes — duplicated here as a small literal, NOT imported
// from stoic-brain, to keep this file's stated "types only, never values" rule
// toward stoic-brain intact). Returns null rather than guessing — never a
// wrong image, matching every other passion-image site in the codebase.
// ============================================================================

const PASSION_ENGLISH_KEYWORD_TO_ID: Record<string, string> = {
  anger: 'orge',
  erotic: 'eros',
  longing: 'pothos',
  pleasure: 'philedonia',
  wealth: 'philoplousia',
  honour: 'philodoxia',
  honor: 'philodoxia',
  enchantment: 'kelesis',
  malicious: 'epichairekakia',
  amusement: 'terpsis',
  terror: 'deima',
  timidity: 'oknos',
  shame: 'aischyne',
  dread: 'thambos',
  panic: 'thorybos',
  agony: 'agonia',
  pity: 'eleos',
  envy: 'phthonos',
  jealousy: 'zelotypia',
  grief: 'penthos',
  anxiety: 'achos',
}

/**
 * Find the first of `words` that appears as a whole word inside `text`
 * (case-insensitive), and return that WORD ITSELF — never a value looked up
 * through it. Keeping the return type "the matched word" (not "whatever the
 * caller's dictionary maps it to") is deliberate: it is what let a real bug
 * surface in this function's first version, caught only by testing against
 * real production rows rather than trusting the type-checker — passing
 * PASSION_IMAGE_MAP (id -> imagePath) into a helper that returned the
 * DICTIONARY VALUE meant every Greek-id match silently returned an image path,
 * which was then looked up AGAIN as if it were an id, matching nothing. Every
 * caller below now does its own explicit second lookup instead.
 */
function findWordMatch(text: string | undefined | null, words: readonly string[]): string | null {
  if (!text) return null
  const lower = text.toLowerCase()
  for (const word of words) {
    if (new RegExp(`\\b${word}\\b`).test(lower)) return word
  }
  return null
}

const KNOWN_PASSION_IDS = Object.keys(PASSION_IMAGE_MAP)
const KNOWN_ENGLISH_KEYWORDS = Object.keys(PASSION_ENGLISH_KEYWORD_TO_ID)

/**
 * Best-effort passion-image lookup — see the module comment above for why this
 * exists and what it deliberately does NOT do (fabricate a match). Verified
 * 2026-08-02 against real production `action_evaluations_v3` and `reflections`
 * rows (a read-only probe) — the fix here specifically closes the gap that
 * probe found: every real evaluation row's `id` is an opaque placeholder
 * ("P1", "P2", ...), so the direct-id path alone resolves nothing on real data,
 * and the Greek-id-inside-`name`/`description` fallback is what actually
 * carries the feature.
 */
export function resolvePassionImage(passion: {
  id?: string | null
  name?: string | null
  sub_species?: string | null
}): string | null {
  const directId = passion.id?.toLowerCase()
  if (directId && PASSION_IMAGE_MAP[directId]) return PASSION_IMAGE_MAP[directId]

  const directSubSpecies = passion.sub_species?.toLowerCase()
  if (directSubSpecies && PASSION_IMAGE_MAP[directSubSpecies]) return PASSION_IMAGE_MAP[directSubSpecies]

  const greekId = findWordMatch(passion.name, KNOWN_PASSION_IDS) || findWordMatch(passion.sub_species, KNOWN_PASSION_IDS)
  if (greekId) return PASSION_IMAGE_MAP[greekId]

  const englishWord =
    findWordMatch(passion.name, KNOWN_ENGLISH_KEYWORDS) ||
    findWordMatch(passion.sub_species, KNOWN_ENGLISH_KEYWORDS)
  if (englishWord) return PASSION_IMAGE_MAP[PASSION_ENGLISH_KEYWORD_TO_ID[englishWord]]

  return null
}

// ============================================================================
// EUPATHEIA DISPLAY — the three rational good feelings (chara / boulesis /
// eulabeia) and their commissioned brand images, added 2026-08-02 from the
// updated Brand_Guidelines.docx. These are the positive counterparts to the
// passions: each eupatheia is what a root passion becomes once the underlying
// judgement is corrected (DL 7.116; Stobaeus Ecl. 2.90).
//
// `replacesRoot` keys onto stoic-brain's ROOT_PASSIONS ids so a surface that
// has diagnosed a passion can name its rational counterpart without re-deriving
// the mapping. Note there is deliberately NO eupatheia for lupe — the Stoics
// held that distress has no rational counterpart, since nothing genuinely evil
// befalls the wise. That absence is a doctrine, not a gap; surfaces should say
// so rather than silently render nothing.
// ============================================================================

export interface EupatheiaDisplay {
  id: 'chara' | 'boulesis' | 'eulabeia'
  name: string
  greek: string
  image: string
  /** Root passion id (stoic-brain ROOT_PASSIONS) this good feeling replaces. */
  replacesRoot: 'hedone' | 'epithumia' | 'phobos'
  /** Why this image carries this meaning — Brand_Guidelines.docx §2. */
  imageRationale: string
}

export const EUPATHEIA_DISPLAY: readonly EupatheiaDisplay[] = [
  {
    id: 'chara',
    name: 'Joy / Rational Gladness',
    greek: 'chara',
    image: '/images/stone%20basin.PNG',
    replacesRoot: 'hedone',
    imageRationale:
      'A stone basin holds still water — gladness that rests in what is genuinely good, rather than the restless pleasure that chases it.',
  },
  {
    id: 'boulesis',
    name: 'Rational Wish',
    greek: 'boulesis',
    image: '/images/open%20hand%20extended.PNG',
    replacesRoot: 'epithumia',
    imageRationale:
      'The extended palm turned upward is a gesture of both giving and receiving — wanting the good, for oneself and others, with an open rather than a grasping hand.',
  },
  {
    id: 'eulabeia',
    name: 'Rational Caution',
    greek: 'eulabeia',
    image: '/images/Lituus.PNG',
    replacesRoot: 'phobos',
    imageRationale:
      'The lituus is the augur’s instrument for marking boundaries — caution as a drawn line you decline to cross, not as fear of what lies beyond it.',
  },
] as const

/** The eupatheia that replaces a given root passion, or null for lupe (see above). */
export function getEupatheiaForRoot(rootId: string): EupatheiaDisplay | null {
  return EUPATHEIA_DISPLAY.find(e => e.replacesRoot === rootId) ?? null
}

/**
 * Canonical passionId -> eupatheia lookup for all 20 sub-species passions.
 * Returns null for every lupe sub-species — distress has no rational
 * counterpart in the Stoic scheme.
 */
export const EUPATHEIA_IMAGE_MAP: Record<string, string> = Object.fromEntries(
  EUPATHEIA_DISPLAY.map(e => [e.id, e.image])
)
