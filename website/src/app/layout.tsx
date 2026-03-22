import type { Metadata } from 'next'
import './globals.css'
import NavBar from '@/components/NavBar'

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

        <main>{children}</main>

        <footer className="border-t border-sage-200 mt-20">
          <div className="max-w-6xl mx-auto px-6 py-10 font-body text-sage-600 text-sm">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div>
                <p className="font-display text-lg text-sage-800 mb-1">sagereasoning</p>
                <p className="italic">&ldquo;Make the best use of what is in your power, and take the rest as it happens.&rdquo;</p>
                <p className="mt-1">&mdash; Epictetus</p>
              </div>
              <div className="flex gap-8 text-sage-700">
                <div>
                  <p className="font-display font-medium mb-2">Product</p>
                  <a href="/score" className="block hover:text-sage-900">Score Action</a>
                  <a href="/dashboard" className="block hover:text-sage-900">Dashboard</a>
                  <a href="/api-docs" className="block hover:text-sage-900">API Docs</a>
                </div>
                <div>
                  <p className="font-display font-medium mb-2">Philosophy</p>
                  <a href="/#virtues" className="block hover:text-sage-900">The Four Virtues</a>
                  <a href="/#how-it-works" className="block hover:text-sage-900">How It Works</a>
                </div>
              </div>
            </div>
            <p className="mt-8 pt-4 border-t border-sage-200 text-center text-sage-500">&copy; {new Date().getFullYear()} SageReasoning. Flourish together.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
