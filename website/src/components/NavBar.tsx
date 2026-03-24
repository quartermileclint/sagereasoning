'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function NavBar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)

  useEffect(() => {
    // Check current session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth state changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setMenuOpen(false)
    window.location.href = '/'
  }

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User'

  return (
    <nav className="border-b border-sage-200 bg-sage-50/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <img src="/images/sagelogosmall.PNG" alt="SageReasoning" className="w-10 h-10 rounded-full" />
          <span className="font-display text-xl font-medium text-sage-800">sagereasoning</span>
        </a>
        <div className="flex items-center gap-6 font-display text-sm">
          <a href="/score" className="text-sage-700 hover:text-sage-900 transition-colors">Score</a>
          <div className="relative">
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className="text-sage-700 hover:text-sage-900 transition-colors flex items-center gap-1"
            >
              Tools
              <svg className="w-3 h-3 text-sage-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {toolsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setToolsOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white border border-sage-200 rounded-lg shadow-lg z-50 py-1">
                  <a href="/score-document" className="block px-4 py-2 font-body text-sm text-sage-700 hover:bg-sage-50" onClick={() => setToolsOpen(false)}>Score a Document</a>
                  <a href="/score-policy" className="block px-4 py-2 font-body text-sm text-sage-700 hover:bg-sage-50" onClick={() => setToolsOpen(false)}>Review a Policy</a>
                  <a href="/score-social" className="block px-4 py-2 font-body text-sm text-sage-700 hover:bg-sage-50" onClick={() => setToolsOpen(false)}>Social Media Filter</a>
                  <a href="/hiring" className="block px-4 py-2 font-body text-sm text-sage-700 hover:bg-sage-50" onClick={() => setToolsOpen(false)}>Hiring Assessment</a>
                  <a href="/therapy" className="block px-4 py-2 font-body text-sm text-sage-700 hover:bg-sage-50" onClick={() => setToolsOpen(false)}>Coaching Companion</a>
                  <a href="/scenarios" className="block px-4 py-2 font-body text-sm text-sage-700 hover:bg-sage-50" onClick={() => setToolsOpen(false)}>Ethical Scenarios</a>
                </div>
              </>
            )}
          </div>
          <a href="/dashboard" className="text-sage-700 hover:text-sage-900 transition-colors">Dashboard</a>
          <a href="/api-docs" className="text-sage-700 hover:text-sage-900 transition-colors">API</a>

          {loading ? (
            <span className="px-4 py-2 text-sage-400">...</span>
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-sage-100 text-sage-800 rounded hover:bg-sage-200 transition-colors"
              >
                <span className="w-6 h-6 bg-sage-400 text-white rounded-full flex items-center justify-center text-xs font-bold uppercase">
                  {displayName.charAt(0)}
                </span>
                <span className="max-w-[120px] truncate">{displayName}</span>
                <svg className="w-3 h-3 text-sage-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {menuOpen && (
                <>
                  {/* Click-away overlay */}
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-sage-200 rounded-lg shadow-lg z-50 py-1">
                    <div className="px-4 py-2 border-b border-sage-100">
                      <p className="font-body text-xs text-sage-500 truncate">{user.email}</p>
                    </div>
                    <a
                      href="/dashboard"
                      className="block px-4 py-2 font-body text-sm text-sage-700 hover:bg-sage-50 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      My Dashboard
                    </a>
                    <a
                      href="/score"
                      className="block px-4 py-2 font-body text-sm text-sage-700 hover:bg-sage-50 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      Score Action
                    </a>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 font-body text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <a href="/auth" className="px-4 py-2 bg-sage-400 text-white rounded hover:bg-sage-500 transition-colors">
              Sign In
            </a>
          )}
        </div>
      </div>
    </nav>
  )
}
