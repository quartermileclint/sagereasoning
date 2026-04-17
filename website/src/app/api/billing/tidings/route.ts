/**
 * POST /api/billing/tidings — Create a Stripe Checkout for voluntary tidings.
 *
 * This is a convenience wrapper around /api/billing/checkout specifically
 * for the human-facing tiding buttons on the pricing page.
 *
 * Request body:
 *   { recurring: false, amount: 20 }  → One-off tiding of $20
 *   { recurring: true,  amount: 10 }  → Monthly tiding of $10/mo
 *
 * Returns: { url: string } — Stripe Checkout URL
 *
 * Authentication: Required (Supabase JWT).
 *
 * Rules served:
 *   R0  — Revenue accepted gratefully, not demanded
 *   R9  — Tidings do NOT unlock features (stated clearly in checkout)
 *   R10 — Billing compliance
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
} from '@/lib/stripe'

export async function OPTIONS() {
  return corsPreflightResponse()
}

export async function POST(request: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: 'Payment processing coming soon. Thank you for your generosity.' },
      { status: 503, headers: corsHeaders() }
    )
  }

  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  let body: { recurring?: boolean; amount?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400, headers: corsHeaders() }
    )
  }

  const recurring = body.recurring === true
  const amount = Math.max(1, Math.min(1000, body.amount || (recurring ? 10 : 20)))
  const amountCents = amount * 100

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const stripeCustomerId = await getOrCreateStripeCustomer(
    supabaseAdmin,
    auth.user.id,
    auth.user.email || ''
  )

  try {
    let session: Awaited<ReturnType<typeof stripe.checkout.sessions.create>>

    if (recurring) {
      // Monthly recurring tiding
      session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        mode: 'subscription',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              recurring: { interval: 'month' },
              product_data: {
                name: 'SageReasoning Monthly Tiding',
                description:
                  'Voluntary monthly support. Does not unlock additional features — every feature is already free for humans.',
              },
              unit_amount: amountCents,
            },
            quantity: 1,
          },
        ],
        success_url: CHECKOUT_SUCCESS_URL,
        cancel_url: CHECKOUT_CANCEL_URL,
        metadata: {
          supabase_user_id: auth.user.id,
          checkout_type: 'tiding_monthly',
        },
      })
    } else {
      // One-off tiding
      session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'SageReasoning Tiding',
                description:
                  'Voluntary one-time support. Does not unlock additional features — every feature is already free for humans.',
              },
              unit_amount: amountCents,
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
      })
    }

    return NextResponse.json(
      { url: session.url },
      { status: 200, headers: corsHeaders() }
    )
  } catch (err) {
    console.error('[billing/tidings] Stripe error:', err)
    return NextResponse.json(
      { error: 'Failed to create tiding session. Please try again.' },
      { status: 500, headers: corsHeaders() }
    )
  }
}
