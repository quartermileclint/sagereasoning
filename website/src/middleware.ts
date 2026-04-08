/**
 * Next.js Middleware — Route Protection
 *
 * Intercepts requests BEFORE pages load. If a user is not authenticated
 * and tries to access a protected route, they are redirected to /auth.
 *
 * The client-side Supabase client (createClient) stores tokens in localStorage
 * and syncs the access token to a cookie (sb-access-token). This middleware
 * reads that cookie and verifies the token with Supabase before allowing access.
 *
 * @compliance R17 — Intimate data protection. Journal data, mentor profiles,
 * and progression assessments must not be accessible without authentication.
 */
import { createClient } from '@supabase/supabase-js'
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
    const response = NextResponse.next()
    response.headers.set('x-mw-hit', 'skip-api')
    response.headers.set('x-mw-path', pathname)
    return response
  }

  // Only enforce auth on protected routes
  if (!isProtectedRoute(pathname)) {
    return NextResponse.next()
  }

  // Read the access token cookie set by the client-side auth sync
  const token = request.cookies.get('sb-access-token')?.value

  if (!token) {
    // No token at all — redirect to sign-in
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth'
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Verify the token with Supabase (prevents forged cookies)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    // Token is invalid or expired — redirect to sign-in
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth'
    redirectUrl.searchParams.set('redirect', pathname)
    // Clear the bad cookie
    const response = NextResponse.redirect(redirectUrl)
    response.cookies.set('sb-access-token', '', { path: '/', maxAge: 0 })
    return response
  }

  // User is authenticated — allow the request through
  return NextResponse.next()
}

// Tell Next.js which routes this middleware applies to
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
