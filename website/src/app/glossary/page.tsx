import { VIRTUE_DISPLAY, ROOT_PASSIONS, EUPATHEIAI } from '@/lib/stoic-brain'
import { STAGE_DISPLAY, PASSION_IMAGE_MAP, EUPATHEIA_DISPLAY } from '@/lib/brand-display'

/**
 * Image glossary — every brand image shown at once as reference material.
 *
 * Source: brand-2026-07 proposal §5 — distinct from the five individually-
 * earned Stage pages (/stages/*): this page shows all five Stages, unlocked
 * or not, plus every virtue/persona logo, Mirror, and all 20 passion logos,
 * grouped by root family to mirror passions.json's own structure.
 *
 * Draws entirely from the Phase 1 centralized tables (VIRTUE_DISPLAY,
 * STAGE_DISPLAY, ROOT_PASSIONS, PASSION_IMAGE_MAP) — the one page that most
 * needs them to already be correct and shared, since it displays literally
 * everything at once.
 */

const PERSONA_LOGOS = [
  {
    id: 'zeus',
    name: 'Zeus',
    image: '/images/Zeus.PNG',
    description: 'Represents the Sage — reflection and mentorship within the practice.',
  },
  {
    id: 'human',
    name: 'Human',
    image: '/images/Human.PNG',
    description: 'Seeking a Stoic decision-making framework to prompt virtuous action in daily life.',
  },
  {
    id: 'agent',
    name: 'AI Agent',
    image: '/images/agent.PNG',
    description: 'Seeking virtue-based internal reasoning grounded in a structured Stoic framework.',
  },
  {
    id: 'developer',
    name: 'Developer',
    image: '/images/Developer.PNG',
    description: 'Integrating Stoic reasoning into AI systems via a structured API and data reference.',
  },
] as const

export default function GlossaryPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center mb-14">
        <h1 className="font-display text-3xl md:text-4xl font-medium text-sage-800 mb-3">
          Image Glossary
        </h1>
        <p className="font-body text-sage-600 max-w-2xl mx-auto leading-relaxed">
          Every image the site uses, gathered in one place as reference material — the virtues,
          the Five Stages of Practice, Mirror, the twenty passion logos, and the three rational
          good feelings that replace them.
        </p>
      </div>

      {/* ─── Virtues + Personas ─── */}
      <section className="mb-16">
        <h2 className="font-display text-2xl text-sage-800 mb-6 text-center">Virtues &amp; Personas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {VIRTUE_DISPLAY.map(v => (
            <div key={v.id} className="bg-white/60 border border-sage-200 rounded-lg p-5 text-center">
              <img src={v.icon} alt={v.name} className="w-full max-w-[200px] h-auto mx-auto mb-3" />
              <h3 className="font-display text-sm font-medium text-sage-800">{v.name}</h3>
              <p className="font-body text-xs text-sage-600 mt-1">{v.description}</p>
            </div>
          ))}
          {PERSONA_LOGOS.map(p => (
            <div key={p.id} className="bg-white/60 border border-sage-200 rounded-lg p-5 text-center">
              <img src={p.image} alt={p.name} className="w-full max-w-[200px] h-auto mx-auto mb-3" />
              <h3 className="font-display text-sm font-medium text-sage-800">{p.name}</h3>
              <p className="font-body text-xs text-sage-600 mt-1">{p.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── The Five Stages of Practice ─── */}
      <section className="mb-16">
        <h2 className="font-display text-2xl text-sage-800 mb-2 text-center">The Five Stages of Practice</h2>
        <p className="font-body text-sm text-sage-600 text-center max-w-xl mx-auto mb-6 italic">
          Not a fixed ladder — shown here as reference material, whether or not you have reached them yet.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {STAGE_DISPLAY.map(s => (
            <div
              key={s.id}
              className="rounded-lg p-4 text-center border border-sage-200"
              style={{ backgroundColor: `${s.color}15` }}
            >
              <img src={s.image} alt={s.name} className="w-full h-auto mx-auto mb-3" />
              <h3 className="font-display text-sm font-medium" style={{ color: s.color }}>{s.name}</h3>
              <p className="font-body text-xs text-sage-600 mt-1">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Mirror ─── */}
      <section className="mb-16">
        <h2 className="font-display text-2xl text-sage-800 mb-6 text-center">Mirror</h2>
        <div className="flex flex-col sm:flex-row items-center gap-6 bg-white/60 border border-sage-200 rounded-lg p-6 max-w-2xl mx-auto">
          <img src="/images/mirror.PNG" alt="Mirror" className="w-full max-w-[280px] sm:w-56 h-auto flex-shrink-0" />
          <p className="font-body text-sm text-sage-700 leading-relaxed">
            Represents the principle that the evaluation scores what the reasoning is, not what the
            person is worth — an honest self-reflection, not a measure of your worth as a person.
          </p>
        </div>
      </section>

      {/* ─── Passion logos, grouped by root family ─── */}
      <section className="mb-16">
        <h2 className="font-display text-2xl text-sage-800 mb-2 text-center">Passion Logos</h2>
        <p className="font-body text-sm text-sage-600 text-center max-w-xl mx-auto mb-8 italic">
          The 20 sub-species passions, grouped by the four root passions.
        </p>
        <div className="space-y-10">
          {ROOT_PASSIONS.map(root => (
            <div key={root.id}>
              <h3 className="font-display text-lg font-medium text-sage-800 mb-1">{root.name}</h3>
              <p className="font-body text-xs text-sage-600 mb-4">{root.definition}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {root.sub_species.map(sub => (
                  <div key={sub.id} className="bg-white/60 border border-sage-200 rounded-lg p-3 text-center">
                    {PASSION_IMAGE_MAP[sub.id] && (
                      <img src={PASSION_IMAGE_MAP[sub.id]} alt={sub.name} className="w-full h-auto mx-auto mb-2" />
                    )}
                    <h4 className="font-display text-xs font-medium text-sage-800">{sub.name}</h4>
                    <p className="font-body text-[10px] text-sage-600 mt-1 leading-snug">{sub.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── The three rational good feelings (eupatheiai) ─── */}
      <section>
        <h2 className="font-display text-2xl text-sage-800 mb-2 text-center">
          Rational Good Feelings
        </h2>
        <p className="font-body text-sm text-sage-600 text-center max-w-2xl mx-auto mb-8 italic">
          The eupatheiai — what each passion becomes once the judgement underneath it is
          corrected. They are not the absence of feeling but its rational form.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {EUPATHEIA_DISPLAY.map(e => {
            const doctrine = EUPATHEIAI.find(x => x.id === e.id)
            return (
              <div key={e.id} className="bg-white/60 border border-sage-200 rounded-lg p-5 text-center">
                <img src={e.image} alt={e.name} className="w-full max-w-[220px] h-auto mx-auto mb-3" />
                <h3 className="font-display text-sm font-medium text-sage-800">{e.name}</h3>
                <p className="font-body text-[11px] text-sage-500 italic mt-0.5">{e.greek}</p>
                {doctrine && (
                  <>
                    <p className="font-body text-xs text-sage-600 mt-2 leading-snug">
                      {doctrine.definition}
                    </p>
                    <p className="font-body text-[11px] text-sage-500 mt-2">
                      Replaces {doctrine.replaces}
                    </p>
                  </>
                )}
                <p className="font-body text-[11px] text-sage-600 mt-3 pt-3 border-t border-sage-100 leading-snug italic">
                  {e.imageRationale}
                </p>
              </div>
            )
          })}
        </div>
        <p className="font-body text-xs text-sage-600 text-center max-w-2xl mx-auto mt-6 leading-relaxed">
          There are only three. Distress (lupe) has no rational counterpart — the Stoic claim is
          that nothing genuinely evil befalls a person reasoning well, so there is nothing for a
          rational distress to be about. The absence is the doctrine, not a gap in the set.
        </p>
      </section>
    </div>
  )
}
