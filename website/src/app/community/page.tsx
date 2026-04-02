'use client'

import { useState, useEffect, useCallback } from 'react'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } = require('react-simple-maps')
import { supabase } from '@/lib/supabase'
import { getAlignmentTier } from '@/lib/stoic-brain'
import type { User } from '@supabase/supabase-js'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

interface MapPin {
  id: string
  display_name: string | null
  city: string | null
  country: string | null
  latitude: number
  longitude: number
  sage_alignment: string
  avg_total: number
}

interface UserLocation {
  city: string
  country: string
  latitude: number | null
  longitude: number | null
  show_on_map: boolean
}

// Common cities lookup for easy country + city selection
const COUNTRY_COORDS: Record<string, [number, number]> = {
  'Australia': [-25.2744, 133.7751],
  'United States': [37.0902, -95.7129],
  'United Kingdom': [55.3781, -3.4360],
  'Canada': [56.1304, -106.3468],
  'Germany': [51.1657, 10.4515],
  'France': [46.2276, 2.2137],
  'India': [20.5937, 78.9629],
  'Japan': [36.2048, 138.2529],
  'Brazil': [-14.2350, -51.9253],
  'China': [35.8617, 104.1954],
  'South Africa': [-30.5595, 22.9375],
  'New Zealand': [-40.9006, 174.8860],
  'Netherlands': [52.1326, 5.2913],
  'Sweden': [60.1282, 18.6435],
  'Norway': [60.4720, 8.4689],
  'Italy': [41.8719, 12.5674],
  'Spain': [40.4637, -3.7492],
  'Mexico': [23.6345, -102.5528],
  'Argentina': [-38.4161, -63.6167],
  'South Korea': [35.9078, 127.7669],
  'Singapore': [1.3521, 103.8198],
  'Other': [20, 0],
}

export default function CommunityPage() {
  const [pins, setPins] = useState<MapPin[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [showLocationForm, setShowLocationForm] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState('')
  const [cityInput, setCityInput] = useState('')
  const [showOnMap, setShowOnMap] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [hoveredPin, setHoveredPin] = useState<MapPin | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  const loadData = useCallback(async () => {
    setLoading(true)
    // Load map pins
    const res = await fetch('/api/community-map')
    const data = await res.json()
    setPins(data.pins ?? [])

    // Load user session + their location prefs
    const { data: { user: u } } = await supabase.auth.getUser()
    setUser(u)
    if (u) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('city, country, latitude, longitude, show_on_map')
        .eq('id', u.id)
        .single()
      if (profile) {
        setUserLocation(profile)
        setSelectedCountry(profile.country ?? '')
        setCityInput(profile.city ?? '')
        setShowOnMap(profile.show_on_map ?? false)
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleSaveLocation = async () => {
    if (!user || !selectedCountry) return
    setSaving(true)
    setSaveMsg('')
    const coords = COUNTRY_COORDS[selectedCountry] ?? COUNTRY_COORDS['Other']
    await fetch('/api/update-location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        city: cityInput || null,
        country: selectedCountry,
        latitude: coords[0],
        longitude: coords[1],
        show_on_map: showOnMap,
      }),
    })
    setSaving(false)
    setSaveMsg(showOnMap ? 'Your pin has been added to the map!' : 'Preferences saved.')
    setShowLocationForm(false)
    loadData()
  }

  const handleRemoveFromMap = async () => {
    if (!user) return
    setSaving(true)
    await fetch('/api/update-location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ show_on_map: false }),
    })
    setSaving(false)
    setShowOnMap(false)
    setSaveMsg('Removed from map.')
    loadData()
  }

  const tierColor = (alignment: string) => {
    switch (alignment) {
      case 'sage_like': return '#4d6040'
      case 'principled': return '#7d9468'
      case 'deliberate': return '#B2AC88'
      case 'habitual': return '#c4843a'
      case 'reflexive': return '#9e3a3a'
      // V1 fallbacks for legacy data
      case 'Sage': return '#4d6040'
      case 'Progressing': return '#7d9468'
      case 'Aware': return '#B2AC88'
      case 'Misaligned': return '#c4843a'
      case 'Contrary': return '#9e3a3a'
      default: return '#7d9468'
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      {/* Page header */}
      <div className="text-center mb-12">
        <img src="/images/sagelogo.PNG" alt="Sages" className="w-20 h-20 mx-auto mb-4 object-contain drop-shadow-md" />
        <h1 className="font-display text-3xl md:text-4xl font-medium text-sage-800 mb-3">
          Sages Around the World
        </h1>
        <p className="font-body text-sage-600 max-w-xl mx-auto leading-relaxed">
          Every marker represents a person applying Stoic virtue to their daily decisions.
          The community is global, the practice is personal.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Sages on map', value: pins.length },
          { label: 'Sage-like', value: pins.filter(p => p.sage_alignment === 'sage_like' || p.sage_alignment === 'Sage').length },
          { label: 'Principled', value: pins.filter(p => p.sage_alignment === 'principled' || p.sage_alignment === 'Progressing').length },
          { label: 'Countries', value: new Set(pins.map(p => p.country).filter(Boolean)).size },
        ].map(stat => (
          <div key={stat.label} className="bg-white/60 border border-sage-200 rounded-lg p-5 text-center">
            <p className="font-display text-3xl font-bold text-sage-800">{stat.value}</p>
            <p className="font-body text-sm text-sage-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="bg-white/80 border border-sage-200 rounded-xl overflow-hidden mb-8 relative"
           style={{ height: 480 }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="font-body text-sage-500">Loading map...</p>
          </div>
        ) : (
          <>
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ scale: 130, center: [0, 20] }}
              style={{ width: '100%', height: '100%' }}
            >
              <ZoomableGroup zoom={1} minZoom={0.8} maxZoom={6}>
                <Geographies geography={GEO_URL}>
                  {({ geographies }: { geographies: { rsmKey: string }[] }) =>
                    geographies.map((geo) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill="#e8ede4"
                        stroke="#c8d4c0"
                        strokeWidth={0.5}
                        style={{
                          default: { outline: 'none' },
                          hover: { fill: '#d4dcc8', outline: 'none' },
                          pressed: { outline: 'none' },
                        }}
                      />
                    ))
                  }
                </Geographies>

                {pins.map((pin) => (
                  <Marker
                    key={pin.id}
                    coordinates={[pin.longitude, pin.latitude]}
                    onMouseEnter={(e: React.MouseEvent<SVGElement>) => {
                      setHoveredPin(pin)
                      const rect = e.currentTarget.closest('svg')?.getBoundingClientRect()
                      if (rect) {
                        setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
                      }
                    }}
                    onMouseLeave={() => setHoveredPin(null)}
                  >
                    {/* Outer glow ring */}
                    <circle
                      r={8}
                      fill={tierColor(pin.sage_alignment) + '30'}
                      stroke={tierColor(pin.sage_alignment)}
                      strokeWidth={1}
                    />
                    {/* Sage logo as a small circle */}
                    <circle
                      r={5}
                      fill={tierColor(pin.sage_alignment)}
                    />
                    {/* Mini sage leaf dot */}
                    <text
                      textAnchor="middle"
                      y={2}
                      fontSize={5}
                      fill="white"
                      style={{ pointerEvents: 'none', fontFamily: 'serif' }}
                    >
                      ✦
                    </text>
                  </Marker>
                ))}

                {/* User's own pin highlight */}
                {user && userLocation?.show_on_map && userLocation.latitude && userLocation.longitude && (
                  <Marker coordinates={[userLocation.longitude, userLocation.latitude]}>
                    <circle r={11} fill="none" stroke="#4d6040" strokeWidth={2} strokeDasharray="3,2" />
                    <circle r={6} fill="#4d6040" />
                    <text textAnchor="middle" y={2} fontSize={6} fill="white" style={{ pointerEvents: 'none' }}>★</text>
                  </Marker>
                )}
              </ZoomableGroup>
            </ComposableMap>

            {/* Hover tooltip */}
            {hoveredPin && (
              <div
                className="absolute pointer-events-none bg-white/95 border border-sage-200 rounded-lg px-3 py-2 shadow-lg text-sm z-10"
                style={{ left: tooltipPos.x + 12, top: tooltipPos.y - 10, maxWidth: 200 }}
              >
                <p className="font-display font-medium text-sage-800">
                  {hoveredPin.display_name || 'Anonymous Sage'}
                </p>
                <p className="font-body text-xs text-sage-500">
                  {[hoveredPin.city, hoveredPin.country].filter(Boolean).join(', ')}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tierColor(hoveredPin.sage_alignment) }} />
                  <span className="font-display text-xs" style={{ color: tierColor(hoveredPin.sage_alignment) }}>
                    {hoveredPin.sage_alignment}
                  </span>
                  <span className="font-body text-xs text-sage-400">· {Math.round(hoveredPin.avg_total)}</span>
                </div>
              </div>
            )}

            {/* Tier legend */}
            <div className="absolute bottom-4 left-4 bg-white/90 border border-sage-200 rounded-lg px-3 py-2 text-xs">
              <p className="font-display text-sage-500 mb-1.5 text-xs">Proximity levels</p>
              {['sage_like', 'principled', 'deliberate', 'habitual', 'reflexive'].map(t => (
                <div key={t} className="flex items-center gap-1.5 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tierColor(t) }} />
                  <span className="font-body text-sage-600">{t === 'sage_like' ? 'Sage-like' : t.charAt(0).toUpperCase() + t.slice(1)}</span>
                </div>
              ))}
            </div>

            {/* Zoom hint */}
            <div className="absolute top-3 right-4 bg-white/80 border border-sage-100 rounded px-2 py-1">
              <p className="font-body text-xs text-sage-400">Scroll to zoom · Drag to pan</p>
            </div>
          </>
        )}
      </div>

      {/* Your pin section */}
      <div className="bg-white/60 border border-sage-200 rounded-xl p-8 mb-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="font-display text-xl font-medium text-sage-800 mb-1">Your pin on the map</h2>
            <p className="font-body text-sm text-sage-600">
              Joining the map is completely optional and shows only your city and alignment tier — never your email or personal details.
            </p>
          </div>
          {user ? (
            <div className="flex gap-3 flex-wrap">
              {userLocation?.show_on_map ? (
                <>
                  <button
                    onClick={() => setShowLocationForm(true)}
                    className="px-4 py-2 border border-sage-300 text-sage-600 font-display text-sm rounded hover:bg-sage-100 transition-colors"
                  >
                    Edit pin
                  </button>
                  <button
                    onClick={handleRemoveFromMap}
                    disabled={saving}
                    className="px-4 py-2 border border-red-200 text-red-500 font-display text-sm rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    Remove from map
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowLocationForm(true)}
                  className="px-5 py-2 bg-sage-400 text-white font-display text-sm rounded hover:bg-sage-500 transition-colors"
                >
                  Add my pin
                </button>
              )}
            </div>
          ) : (
            <a href="/auth" className="px-5 py-2 bg-sage-400 text-white font-display text-sm rounded hover:bg-sage-500 transition-colors">
              Sign in to join
            </a>
          )}
        </div>

        {userLocation?.show_on_map && !showLocationForm && (
          <div className="mt-4 pt-4 border-t border-sage-100 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-sage-500" />
            <p className="font-body text-sm text-sage-600">
              Your pin is live — showing as <strong>{[userLocation.city, userLocation.country].filter(Boolean).join(', ')}</strong>
            </p>
          </div>
        )}

        {saveMsg && (
          <div className="mt-4 pt-4 border-t border-sage-100">
            <p className="font-body text-sm text-sage-700">{saveMsg}</p>
          </div>
        )}

        {showLocationForm && user && (
          <div className="mt-6 pt-6 border-t border-sage-100 space-y-4 max-w-lg">
            <div>
              <label className="block font-display text-sm font-medium text-sage-700 mb-1">
                Country
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-4 py-2.5 border border-sage-300 rounded bg-white font-body text-sage-900 focus:outline-none focus:ring-2 focus:ring-sage-400"
              >
                <option value="">Select your country</option>
                {Object.keys(COUNTRY_COORDS).filter(c => c !== 'Other').sort().map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-display text-sm font-medium text-sage-700 mb-1">
                City <span className="text-sage-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="e.g. Melbourne"
                className="w-full px-4 py-2.5 border border-sage-300 rounded bg-white font-body text-sage-900 focus:outline-none focus:ring-2 focus:ring-sage-400"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnMap}
                onChange={(e) => setShowOnMap(e.target.checked)}
                className="mt-1 w-4 h-4 accent-sage-500"
              />
              <div>
                <span className="font-display text-sm text-sage-800">Show my pin on the community map</span>
                <p className="font-body text-xs text-sage-500 mt-0.5">
                  Only your city, country, and alignment tier will be visible to others.
                </p>
              </div>
            </label>

            <div className="flex gap-3">
              <button
                onClick={handleSaveLocation}
                disabled={saving || !selectedCountry}
                className="px-5 py-2 bg-sage-400 text-white font-display text-sm rounded hover:bg-sage-500 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setShowLocationForm(false)}
                className="px-5 py-2 border border-sage-200 text-sage-600 font-display text-sm rounded hover:bg-sage-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="text-center">
        <p className="font-body text-sage-600 mb-4">
          Not yet a member? Join the community and begin scoring your actions.
        </p>
        <a
          href="/auth"
          className="inline-block px-8 py-3 bg-sage-400 text-white font-display text-lg rounded hover:bg-sage-500 transition-colors"
        >
          Get Started
        </a>
      </div>
    </div>
  )
}
