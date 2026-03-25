import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-20 text-center">
      <img
        src="/images/owllogo.PNG"
        alt="Wisdom Owl"
        className="w-32 h-32 mb-8 drop-shadow-lg opacity-70"
        style={{ animation: 'owlTilt 3s ease-in-out infinite' }}
      />
      <h1 className="font-display text-4xl font-medium text-sage-800 mb-3">
        Even the wise lose their way
      </h1>
      <p className="font-body text-lg text-sage-600 mb-8 max-w-md">
        This page doesn&apos;t exist, but the path to virtue is still open.
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="px-6 py-3 bg-sage-400 text-white font-display rounded hover:bg-sage-500 transition-colors"
        >
          Return Home
        </Link>
        <Link
          href="/score"
          className="px-6 py-3 border border-sage-300 text-sage-700 font-display rounded hover:bg-sage-50 transition-colors"
        >
          Score an Action
        </Link>
      </div>

      <style>{`
        @keyframes owlTilt {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
      `}</style>
    </div>
  )
}
