'use client'

import { VIRTUES, getAlignmentTier } from '@/lib/stoic-brain'

interface VirtueConstellationProps {
  avgWisdom: number
  avgJustice: number
  avgCourage: number
  avgTemperance: number
  avgTotal: number
}

/**
 * VirtueConstellation — a visual "coat of arms" for the user's stoic profile.
 *
 * Central sage leaf surrounded by 4 virtue animal logos.
 * Each virtue logo's opacity and scale reflects the user's actual score.
 * The sage leaf size/detail reflects overall tier.
 */
export default function VirtueConstellation({
  avgWisdom,
  avgJustice,
  avgCourage,
  avgTemperance,
  avgTotal,
}: VirtueConstellationProps) {
  const tier = getAlignmentTier(avgTotal)

  const virtueScores: Record<string, number> = {
    wisdom: avgWisdom,
    justice: avgJustice,
    courage: avgCourage,
    temperance: avgTemperance,
  }

  // Map virtue positions: top, right, bottom, left
  const positions = [
    { virtueId: 'wisdom', label: 'top', style: { top: '0', left: '50%', transform: 'translateX(-50%)' } },
    { virtueId: 'justice', label: 'right', style: { top: '50%', right: '0', transform: 'translateY(-50%)' } },
    { virtueId: 'courage', label: 'bottom', style: { bottom: '0', left: '50%', transform: 'translateX(-50%)' } },
    { virtueId: 'temperance', label: 'left', style: { top: '50%', left: '0', transform: 'translateY(-50%)' } },
  ]

  // Sage leaf scale: bigger at higher tiers
  const sageScale = avgTotal >= 95 ? 1.2 : avgTotal >= 70 ? 1.05 : avgTotal >= 40 ? 0.9 : avgTotal >= 15 ? 0.75 : 0.6

  return (
    <div className="bg-white/60 border border-sage-200 rounded-lg p-8">
      <h2 className="font-display text-xl font-medium text-sage-800 mb-2 text-center">Virtue Constellation</h2>
      <p className="font-body text-sm text-sage-500 text-center mb-6">Your personal stoic profile</p>

      {/* Constellation container */}
      <div className="relative w-64 h-64 mx-auto">
        {/* Central sage leaf */}
        <div
          className="absolute top-1/2 left-1/2 flex flex-col items-center justify-center transition-all duration-700"
          style={{
            transform: `translate(-50%, -50%) scale(${sageScale})`,
          }}
        >
          <img
            src="/images/sagelogo.PNG"
            alt="Sage"
            className="w-20 h-20 drop-shadow-lg"
            style={{
              filter: avgTotal < 15 ? 'grayscale(80%)' : avgTotal < 40 ? 'grayscale(50%)' : 'none',
            }}
          />
          <span className="font-display text-2xl font-bold mt-1" style={{ color: tier.color }}>
            {Math.round(avgTotal)}
          </span>
          <span className="font-display text-xs font-medium" style={{ color: tier.color }}>
            {tier.label}
          </span>
        </div>

        {/* Orbiting virtue logos */}
        {positions.map(({ virtueId, style }) => {
          const virtue = VIRTUES.find(v => v.id === virtueId)!
          const score = virtueScores[virtueId]
          // Opacity: minimum 0.2 for greyed state, scales up to 1.0
          const opacity = 0.2 + (score / 100) * 0.8
          // Scale: 0.7 at 0 score, 1.15 at 100
          const scale = 0.7 + (score / 100) * 0.45

          return (
            <div
              key={virtueId}
              className="absolute flex flex-col items-center transition-all duration-700"
              style={{
                ...style,
              } as React.CSSProperties}
            >
              <img
                src={virtue.icon}
                alt={virtue.name}
                className="w-14 h-14 drop-shadow-md transition-all duration-700"
                style={{
                  opacity,
                  transform: `scale(${scale})`,
                  filter: score < 20 ? 'grayscale(80%)' : score < 40 ? 'grayscale(40%)' : 'none',
                }}
              />
              <span
                className="font-display text-xs font-bold mt-0.5 transition-all duration-700"
                style={{ color: virtue.color, opacity }}
              >
                {Math.round(score)}
              </span>
            </div>
          )
        })}
      </div>

      {/* Virtue labels under constellation */}
      <div className="grid grid-cols-4 gap-2 mt-6 text-center">
        {VIRTUES.map(virtue => {
          const score = virtueScores[virtue.id]
          return (
            <div key={virtue.id}>
              <span className="font-display text-sm font-medium" style={{ color: virtue.color }}>
                {virtue.name}
              </span>
              <span className="block font-body text-xs text-sage-500">{virtue.greek}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
