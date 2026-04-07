/**
 * POST /api/billing/checkout — Create a Stripe Checkout session.
 *
 * Request body:
 *   { type: 'developer_paid' }   → Developer paid API tier subscription
 *   { type: 'tiding_once', amount?: number }  → One-off voluntary tiding
 *   { type: 'tiding_monthly', amount?: number } → Monthly recurring tiding
 *
 * Returns: { url: string } — Stripe Checkout URL to redirect the user to.
 *
 * Authentication: Required (Supabase JWT).
 * The user must be signed in so we can link their Stripe customer to their account.
 *
 * Rules served: R0, R5, R9 (no outcome promises), R10 (billing compliance)
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAuth, corsHeaders, corsPreflightResponse } from '@/lib/security'
import {
  stripe,
  isStripeConfigured,
  getOrCreateStripeCustomer,
  CHECKOUT_SUCCESS_URL,
  CHECKOUT_CANCEL_URL,
  STRIPE_PRICES,
} from '@/lib/stripe'

export async function OPTIONS() {
  return corsPreflightResponse()
}

export async function POST(request: NextRequest) {
  // ── Guard: Stripe must be configured ──────────────────────────────────
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: 'Payment processing is not yet available. Coming soon.' },
      { status: 503, headers: corsHeaders() }
    )
  }

  // ── Authenticate ──────────────────────────────────────────────────────
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  // ── Parse request ─────────────────────────────────────────────────────
  let body: { type?: string; amount?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400, headers: corsHeaders() }
    )
  }

  const checkoutType = body.type
  if (!checkoutType || !['developer_paid', 'tiding_once', 'tiding_monthly'].includes(checkoutType)) {
    return NextResponse.json(
      { error: 'Invalid checkout type. Must be: developer_paid, tiding_once, or tiding_monthly' },
      { status: 400, headers: corsHeaders() }
    )
  }

  // ── Get or create Stripe customer ─────────────────────────────────────
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const stripeCustomerId = await getOrCreateStripeCustomer(
    supabaseAdmin,
    auth.user.id,
    auth.user.email || ''
  )

  // ── Build checkout session ────────────────────────────────────────────
  try {
    let sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0]

    if (checkoutType === 'developer_paid') {
      // Developer paid tier — recurring subscription
      sessionParams = {
        customer: stripeCustomerId,
        mode: 'subscription',
        line_items: [
          {
            price: STRIPE_PRICES.developerPaid,
            quantity: 1,
          },
        ],
        success_url: CHECKOUT_SUCCESS_URL,
        cancel_url: CHECKOUT_CANCEL_URL,
        metadata: {
          supabase_user_id: auth.user.id,
          checkout_type: 'developer_paid',
          price_id: STRIPE_PRICES.developerPaid,
        },
        subscription_data: {
          metadata: {
            supabase_user_id: auth.user.id,
          },
        },
      }
    } else if (checkoutType === 'tiding_once') {
      // One-off voluntary tiding — payment mode
      const amount = Math.max(100, Math.min(100000, (body.amount || 20) * 100)) // $1–$1000, default $20

      sessionParams = {
        customer: stripeCustomerId,
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'SageReasoning Tiding',
                description: 'Voluntary support for the SageReasoning platform. This does not unlock any additional features.',
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        success_url: CHECKOUT_SUCCESS_URL,
        cancel_url: CHECKOUT_CANCEL_URL,
        metadata: {
          supabase_user_id: auth.user.id,
          checkout_type: 'tiding_once',
        },
      }
    } else {
      // Monthly recurring tiding — subscription mode
      sessionParams = {
        customer: stripeCustomerId,
        mode: 'subscription',
        line_items: [
          {
            price: STRIPE_PRICES.tidingMonthly,
            quantity: 1,
          },
        ],
        success_url: CHECKOUT_SUCCESS_URL,
        cancel_url: CHECKOUT_CANCEL_URL,
        metadata: {
          supabase_user_id: auth.user.id,
          checkout_type: 'tiding_monthly',
          price_id: STRIPE_PRICES.tidingMonthly,
        },
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json(
      { url: session.url },
      { status: 200, headers: corsHeaders() }
    )
  } catch (err) {
    console.error('[billing/checkout] Stripe error:', err)
    return NextResponse.json(
      { error: 'Failed to create checkout session. Please try again.' },
      { status: 500, headers: corsHeaders() }
    )
  }
}
