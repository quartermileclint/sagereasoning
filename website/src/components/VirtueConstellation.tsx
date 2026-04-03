'use client'

import { VIRTUE_DISPLAY, PROXIMITY_LEVELS, type KatorthomaProximityLevel } from '@/lib/stoic-brain'

interface VirtueConstellationProps {
  proximityLevel: KatorthomaProximityLevel
  virtueDomainsEngaged: string[]
}

/**
 * VirtueConstellation — a visual "coat of arms" for the user's stoic profile.
 *
 * V3: Displays proximity level and which virtue domains were engaged,
 * using qualitative assessment rather than numeric scores.
 *
 * NOTE: This component is currently unused. Retained for potential
 * future integration with the dashboard.
 */
export default function VirtueConstellation({
  proximityLevel,
  virtueDomainsEngaged,
}: VirtueConstellationProps) {
  const level = PROXIMITY_LEVELS.find(l => l.id === proximityLevel) ?? PROXIMITY_LEVELS[0]

  // Scale the sage leaf by proximity level
  const levelIndex = PROXIMITY_LEVELS.findIndex(l => l.id === proximityLevel)
  const sageScale = 0.6 + (levelIndex / 4) * 0.6 // 0.6 at reflexive → 1.2 at sage_like

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
              filter: levelIndex < 1 ? 'grayscale(80%)' : levelIndex < 2 ? 'grayscale(50%)' : 'none',
            }}
          />
          <span className="font-display text-sm font-bold mt-1 text-sage-800">
            {level.name}
          </span>
        </div>

        {/* Orbiting virtue logos */}
        {VIRTUE_DISPLAY.map((virtue, i) => {
          const isEngaged = virtueDomainsEngaged.includes(virtue.id)
          const positions = [
            { top: '0', left: '50%', transform: 'translateX(-50%)' },
            { top: '50%', right: '0', transform: 'translateY(-50%)' },
            { bottom: '0', left: '50%', transform: 'translateX(-50%)' },
            { top: '50%', left: '0', transform: 'translateY(-50%)' },
          ]

          return (
            <div
              key={virtue.id}
              className="absolute flex flex-col items-center transition-all duration-700"
              style={positions[i] as React.CSSProperties}
            >
              <img
                src={virtue.icon}
                alt={virtue.name}
                className="w-14 h-14 drop-shadow-md transition-all duration-700"
                style={{
                  opacity: isEngaged ? 1 : 0.3,
                  transform: `scale(${isEngaged ? 1.1 : 0.8})`,
                  filter: isEngaged ? 'none' : 'grayscale(80%)',
                }}
              />
            </div>
          )
        })}
      </div>

      {/* Virtue labels under constellation */}
      <div className="grid grid-cols-4 gap-2 mt-6 text-center">
        {VIRTUE_DISPLAY.map(virtue => {
          const isEngaged = virtueDomainsEngaged.includes(virtue.id)
          return (
            <div key={virtue.id}>
              <span
                className="font-display text-sm font-medium"
                style={{ color: isEngaged ? virtue.color : '#9CA3AF' }}
              >
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
