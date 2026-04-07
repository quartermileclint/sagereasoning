/**
 * Next.js Middleware — Route Protection
 *
 * Intercepts requests BEFORE pages load. If a user is not authenticated
 * and tries to access a protected route, they are redirected to /auth.
 *
 * This is the server-side enforcement layer. It works because the Supabase
 * client now stores auth tokens in cookies (via @supabase/ssr), which
 * middleware can read — unlike localStorage, which is browser-only.
 *
 * @compliance R17 — Intimate data protection. Journal data, mentor profiles,
 * and progression assessments must not be accessible without authentication.
 */
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that require authentication — these contain personal/intimate data
const PROTECTED_ROUTES = [
  '/mentor-hub',
  '/private-mentor',
  '/dashboard',
  '/journal',
  '/baseline',
  '/admin',
  '/ops-hub',
  '/mentor-index',
  '/scenarios',
  '/score',
  '/score-document',
  '/score-policy',
  '/score-social',
]

// Routes that should never be blocked (public pages, auth itself, API, static)
const PUBLIC_ROUTES = [
  '/',
  '/auth',
  '/api-docs',
  '/community',
  '/limitations',
  '/marketplace',
  '/methodology',
  '/pricing',
  '/privacy',
  '/terms',
  '/transparency',
]

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Only enforce auth on protected routes
  if (!isProtectedRoute(pathname)) {
    return NextResponse.next()
  }

  // Create a Supabase server client that reads cookies from the request
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          // Update cookies on the request (for downstream handlers)
          cookiesToSet.forEach(({ name, value }: { name: string; value: string }) =>
            request.cookies.set(name, value)
          )
          // Create a new response with updated cookies
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options: CookieOptions }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do not use getSession() here — it reads from cookies without
  // verification. getUser() sends the token to Supabase for verification,
  // which is the secure approach for middleware.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // Not authenticated — redirect to sign-in page
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth'
    // Preserve the intended destination so we can redirect back after login
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // User is authenticated — allow the request through
  return supabaseResponse
}

// Tell Next.js which routes this middleware applies to
export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
