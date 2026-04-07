import type { Metadata } from 'next'
import './globals.css'
import NavBar from '@/components/NavBar'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'

export const metadata: Metadata = {
  title: 'SageReasoning — Flourish Together',
  description: 'The world\'s leading reference for Stoic-based reasoning. Measure, guide, and improve decisions against the standard of perfect Stoic sage reasoning.',
  keywords: ['stoicism', 'stoic reasoning', 'virtue ethics', 'sage', 'wisdom', 'AI reasoning'],
  openGraph: {
    title: 'SageReasoning — Flourish Together',
    description: 'Measure your actions against the wisdom of the Stoic sages.',
    url: 'https://sagereasoning.com',
    siteName: 'SageReasoning',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen paper-texture">
        <NavBar />
        <ServiceWorkerRegistration />

        <main>{children}</main>

        <footer className="border-t border-sage-200 mt-20">
          <div className="max-w-6xl mx-auto px-6 py-10 font-body text-sage-600 text-sm">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div>
                <p className="font-display text-lg text-sage-800 mb-1">sagereasoning</p>
                <p className="italic">Make the best use of what is in your power, and take the rest as it happens.</p>
              </div>
              <div className="flex gap-8 text-sage-700">
                <div>
                  <p className="font-display font-medium mb-2">Tools</p>
                  <a href="/score" className="block hover:text-sage-900">Score Action</a>
                  <a href="/score-document" className="block hover:text-sage-900">Score Document</a>
                  <a href="/score-policy" className="block hover:text-sage-900">Review Policy</a>
                  <a href="/score-social" className="block hover:text-sage-900">Social Filter</a>
                  <a href="/scenarios" className="block hover:text-sage-900">Scenarios</a>
                  <a href="/journal" className="block hover:text-sage-900">Journal</a>
                  <a href="/community" className="block hover:text-sage-900">Community</a>
                  <a href="/dashboard" className="block hover:text-sage-900">Dashboard</a>
                  <a href="/private-mentor" className="block hover:text-sage-900">Private Mentor Hub</a>
                  <a href="/mentor-hub" className="block hover:text-sage-900">Mentor Hub</a>
                  <a href="/ops-hub" className="block hover:text-sage-900">Sage Ops Hub</a>
                  <a href="/api-docs" className="block hover:text-sage-900">API Docs</a>
                </div>
                <div>
                  <p className="font-display font-medium mb-2">Philosophy</p>
                  <a href="/#virtues" className="block hover:text-sage-900">The Four Virtues</a>
                  <a href="/#how-it-works" className="block hover:text-sage-900">How It Works</a>
                  <a href="/methodology" className="block hover:text-sage-900">Methodology</a>
                </div>
                <div>
                  <p className="font-display font-medium mb-2">Legal</p>
                  <a href="/terms" className="block hover:text-sage-900">Terms of Service</a>
                  <a href="/privacy" className="block hover:text-sage-900">Privacy Policy</a>
                  <a href="/transparency" className="block hover:text-sage-900">AI Transparency</a>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-sage-200 flex flex-col md:flex-row items-center justify-between gap-2 text-sage-500">
              <p>&copy; {new Date().getFullYear()} SageReasoning. Flourish together.</p>
              <p className="text-xs italic">Scores and reasoning are AI-generated and do not constitute professional advice. <a href="/transparency" className="underline hover:text-sage-700">Learn more</a></p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
