/**
 * POST /api/billing/portal — Create a Stripe Billing Portal session.
 *
 * Allows users to manage their subscription, update payment methods,
 * view invoices, and cancel if needed.
 *
 * Returns: { url: string } — Stripe Portal URL to redirect the user to.
 *
 * Authentication: Required (Supabase JWT).
 *
 * Rules served: R0, R10 (billing compliance)
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAuth, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { stripe, isStripeConfigured, PORTAL_RETURN_URL } from '@/lib/stripe'

export async function OPTIONS() {
  return corsPreflightResponse()
}

export async function POST(request: NextRequest) {
  // ── Guard: Stripe must be configured ──────────────────────────────────
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: 'Billing portal is not yet available.' },
      { status: 503, headers: corsHeaders() }
    )
  }

  // ── Authenticate ──────────────────────────────────────────────────────
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  // ── Look up user's Stripe customer ID ─────────────────────────────────
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: customerLink } = await supabaseAdmin
    .from('stripe_customers')
    .select('stripe_customer_id')
    .eq('user_id', auth.user.id)
    .single()

  if (!customerLink?.stripe_customer_id) {
    return NextResponse.json(
      { error: 'No billing account found. You have not made any payments yet.' },
      { status: 404, headers: corsHeaders() }
    )
  }

  // ── Create portal session ─────────────────────────────────────────────
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerLink.stripe_customer_id,
      return_url: PORTAL_RETURN_URL,
    })

    return NextResponse.json(
      { url: session.url },
      { status: 200, headers: corsHeaders() }
    )
  } catch (err) {
    console.error('[billing/portal] Stripe error:', err)
    return NextResponse.json(
      { error: 'Failed to open billing portal. Please try again.' },
      { status: 500, headers: corsHeaders() }
    )
  }
}
