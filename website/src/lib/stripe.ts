/**
 * stripe.ts — Shared Stripe client and billing helpers.
 *
 * This is the single source of truth for all Stripe interactions.
 * All API routes that touch Stripe import from here.
 *
 * Rules served:
 *   R0  — Revenue for sustainability, not accumulation
 *   R5  — Paid tier must achieve 2x margin over LLM API costs
 *   R9  — No outcome promises in billing communications
 *   R10 — Billing compliance with payment processor terms
 *
 * @compliance
 * compliance_version: CR-2026-Q2-v4
 * applicable_jurisdictions: [AU, EU, US]
 * regulatory_references: [CR-005, CR-010, CR-011, CR-012]
 */
import Stripe from 'stripe'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseAdminClient = any

// =============================================================================
// STRIPE CLIENT — Singleton, server-side only
// =============================================================================

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn(
    '[stripe.ts] STRIPE_SECRET_KEY is not set. Payment endpoints will return 503.'
  )
}

/**
 * The Stripe client instance.
 * Uses API version 2025-12-18 (latest stable as of build date).
 * All Stripe calls must go through this client.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiVersion: '2025-12-18.acacia' as any,
  typescript: true,
  appInfo: {
    name: 'SageReasoning',
    url: 'https://sagereasoning.com',
    version: '0.1.0',
  },
})


// =============================================================================
// CONSTANTS
// =============================================================================

/** Where to send users after successful checkout */
export const CHECKOUT_SUCCESS_URL =
  (process.env.NEXT_PUBLIC_SITE_URL || 'https://sagereasoning.com') +
  '/dashboard?payment=success'

/** Where to send users if they cancel checkout */
export const CHECKOUT_CANCEL_URL =
  (process.env.NEXT_PUBLIC_SITE_URL || 'https://sagereasoning.com') +
  '/pricing?payment=canceled'

/** Where to redirect after billing portal session */
export const PORTAL_RETURN_URL =
  (process.env.NEXT_PUBLIC_SITE_URL || 'https://sagereasoning.com') +
  '/dashboard'

/** Stripe product/price IDs from environment */
export const STRIPE_PRICES = {
  developerPaid: process.env.STRIPE_DEVELOPER_PRICE_ID || '',
  tidingOnceOff: process.env.STRIPE_TIDING_ONCEOFF_PRICE_ID || '',
  tidingMonthly: process.env.STRIPE_TIDING_MONTHLY_PRICE_ID || '',
} as const

/**
 * R5 cost health thresholds.
 * revenue_to_cost_ratio must be >= 2.0.
 * Sage Ops monthly cap is $100 (10000 cents).
 */
export const COST_HEALTH = {
  MIN_REVENUE_TO_COST_RATIO: 2.0,
  SAGE_OPS_MONTHLY_CAP_CENTS: 10000,     // $100
  ROLLING_AVERAGE_ALERT_MULTIPLIER: 2.0,  // Alert if 2x rolling average
} as const


// =============================================================================
// HELPERS
// =============================================================================

/**
 * Check if Stripe is properly configured.
 * Returns false if the secret key is missing or placeholder.
 */
export function isStripeConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY || ''
  return key.length > 0 && !key.startsWith('sk_test_your-')
}

/**
 * Get or create a Stripe customer for a Supabase user.
 * Checks the stripe_customers table first; creates in Stripe if not found.
 */
export async function getOrCreateStripeCustomer(
  supabaseAdmin: SupabaseAdminClient,
  userId: string,
  email: string
): Promise<string> {
  // Check if user already has a Stripe customer link
  const { data: existing } = await supabaseAdmin
    .from('stripe_customers')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single()

  if (existing?.stripe_customer_id) {
    return existing.stripe_customer_id
  }

  // Create a new Stripe customer
  const customer = await stripe.customers.create({
    email,
    metadata: {
      supabase_user_id: userId,
      source: 'sagereasoning',
    },
  })

  // Store the link in our database
  await supabaseAdmin.rpc('get_or_create_stripe_customer', {
    p_user_id: userId,
    p_stripe_customer_id: customer.id,
    p_email: email,
    p_customer_type: 'developer',
  })

  return customer.id
}

/**
 * Log a Stripe event to the payment_events audit table.
 * Strips sensitive fields before storing.
 */
export async function logPaymentEvent(
  supabaseAdmin: SupabaseAdminClient,
  event: Stripe.Event,
  userId?: string,
  amountCents?: number,
  currency?: string
): Promise<void> {
  // Redact sensitive fields from event data
  const safeMetadata = {
    type: event.type,
    api_version: event.api_version,
    created: event.created,
    // Do NOT store full event.data.object — it may contain card details
    object_id: (event.data.object as { id?: string }).id,
    object_type: (event.data.object as { object?: string }).object,
  }

  await supabaseAdmin.from('payment_events').insert({
    stripe_event_id: event.id,
    event_type: event.type,
    stripe_customer_id: (event.data.object as { customer?: string }).customer || null,
    user_id: userId || null,
    amount_cents: amountCents || null,
    currency: currency || 'usd',
    status: (event.data.object as { status?: string }).status || null,
    metadata: safeMetadata,
  })
}

/**
 * Construct a Stripe webhook event from the raw body and signature.
 * Throws if verification fails.
 */
export function constructWebhookEvent(
  rawBody: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured')
  }
  return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
}
