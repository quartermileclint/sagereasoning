/** @type {import('next').NextConfig} */
const nextConfig = {
  // A12 (2026-06-03): src/instrumentation.ts register() runs at server startup.
  // As of Next.js 16, instrumentation.ts runs by default — the prior
  // experimental.instrumentationHook flag is removed (Next 16 rejects it as an
  // unrecognized key). register() is a STRICT no-op unless SUBSTRATE_OTEL_ENABLED='true'
  // (unset in production), so this remains inert in production either way.

  // Security headers
  async headers() {
    return [
      {
        // Apple App Site Association — must be served as application/json
        // Phase 0.1: Universal links preparation for future native iOS app
        source: '/.well-known/apple-app-site-association',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
      },
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://*.supabase.co https://api.anthropic.com https://api.stripe.com https://checkout.stripe.com",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ]
  },

  // Restrict image optimization to known sources
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sagereasoning.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig
