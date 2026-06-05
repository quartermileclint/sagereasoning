/**
 * stripe.ts — Shared Stripe client and billing helpers.
 *
 * This is the single source of truth for all Stripe interactions.
 * All API routes that touch Stripe import from here.
 *
 * Rules served:
 *   R0  — Revenue for sustainability, not accumulation
 *   R5  — Paid tier must achieve 2x margin over LLM API costs.
 *         Under Option D (per D-BILLING-MODEL-LOCKED-2026-05-17 +
 *         /adopted/billing-model-design.md), the 2x ratio is enforced
 *         PROSPECTIVELY at the loop level by construction via
 *         computeLoopBill below (Decision D's overage formula). The
 *         retrospective cost_health_snapshots surface (Decision G) is
 *         retained as a sanity check — its alert is now an exception signal,
 *         not a normal-state signal.
 *   R9  — No outcome promises in billing communications
 *   R10 — Billing compliance with payment processor terms
 *   R18a — No category-language change (billing is commercial, not credential)
 *   AC7 — Engaged at the Option D build session via deployment-config
 *         changes (STRIPE_PER_LOOP_PRICE_ID env var) + access-control changes
 *         (RPC signature extension + new loop_billing_events surface)
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
 * The Stripe client instance — lazy-initialised.
 * Uses API version 2025-12-18 (latest stable as of build date).
 * All Stripe calls must go through this client.
 *
 * Lazy initialisation prevents the Stripe constructor from throwing
 * during the Next.js build phase when STRIPE_SECRET_KEY is not yet
 * available as an environment variable.
 */
let _stripe: Stripe | null = null

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      throw new Error(
        '[stripe.ts] STRIPE_SECRET_KEY is not set. Cannot create Stripe client.'
      )
    }
    _stripe = new Stripe(key, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      apiVersion: '2025-12-18.acacia' as any,
      typescript: true,
      appInfo: {
        name: 'SageReasoning',
        url: 'https://sagereasoning.com',
        version: '0.1.0',
      },
    })
  }
  return _stripe
}

/** @deprecated Access via getStripe() — kept for backward compatibility */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getStripe() as any)[prop]
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
  /**
   * Option D per-loop billing Price ID.
   *
   * Per D-BILLING-MODEL-LOCKED-2026-05-17 + /adopted/billing-model-design.md
   * Decision F. The founder generates this Price ID in the Stripe Dashboard
   * (Products → New Product → Per-loop billing) and sets it in Vercel
   * (Project → Settings → Environment Variables → STRIPE_PER_LOOP_PRICE_ID).
   *
   * Until set, the per-loop billing surfaces still meter (writes to
   * loop_billing_events; emits X-Loop-* response headers) but Stripe invoice
   * rendering is inert — the webhook handler has no Price ID to attach line
   * items to. The metering data is preserved for forensic review.
   *
   * Step 0 election (build session 2026-05-MM): Stripe Price ID deferred to
   * a follow-on session. The metering layer + webhook handler land in this
   * build; the Price ID + live invoice flow lands separately.
   */
  perLoop: process.env.STRIPE_PER_LOOP_PRICE_ID || '',
} as const

/**
 * R5 cost health thresholds.
 * revenue_to_cost_ratio must be >= 2.0.
 * Sage Ops monthly cap is $100 (10000 cents).
 *
 * Under Option D (per D-BILLING-MODEL-LOCKED-2026-05-17), the 2x ratio is
 * enforced prospectively at the loop level by construction via OPTION_D_BILLING
 * below. cost_health_snapshots (queries against this surface) remains as a
 * retrospective sanity check — Decision G's defence-in-depth posture.
 */
export const COST_HEALTH = {
  MIN_REVENUE_TO_COST_RATIO: 2.0,
  SAGE_OPS_MONTHLY_CAP_CENTS: 10000,     // $100
  ROLLING_AVERAGE_ALERT_MULTIPLIER: 2.0,  // Alert if 2x rolling average
  // R20a classifier cost monitoring — ADR-R20a-01 D7-b
  // If classifier spend exceeds 20% of mentor-turn cost in any month, reopen ADR.
  R20A_CLASSIFIER_MAX_MENTOR_RATIO: 0.20, // 20% threshold
  // A13 per-identity cost-anomaly detector (R5: "identity X spending Nx its baseline").
  // The pure detector in /lib/cost-alerts/cost-alert-detector.ts takes these as
  // explicit params; the evaluate endpoint passes them in. Single source of truth.
  PER_IDENTITY_ANOMALY_MULTIPLIER: 2.0,   // alert when an identity's priciest loop >= 2x its other-loop mean
  PER_IDENTITY_MIN_PRIOR_LOOPS: 5,        // need >= 5 prior loops to form a baseline (false-positive guard)
  PER_IDENTITY_ABSOLUTE_FLOOR_CENTS: 1,   // ignore loops/baselines below this many cents (near-zero noise guard)
} as const


/**
 * Option D per-loop billing constants.
 *
 * Per D-BILLING-MODEL-LOCKED-2026-05-17 + /adopted/billing-model-design.md
 * Decisions B, C, D. Single source of truth for the prospective R5 formula.
 *
 *   LOOP_BASE_RATE_CENTS         = $0.02/loop headline (Decision B)
 *   OVERAGE_TRIGGER_RATIO        = overage fires above 50% of base (Decision C)
 *   OVERAGE_RATE_MULTIPLIER      = 2.0× the excess Anthropic cost (Decision D)
 *
 * Worked example at the elected formula:
 *   Anthropic cost = $0.005 (typical): no overage; bill = $0.02; ratio = 4.0×
 *   Anthropic cost = $0.010 (threshold): no overage; bill = $0.02; ratio = 2.0×
 *   Anthropic cost = $0.020 (above): overage = ($0.020 - $0.010) × 2 = $0.020;
 *                                     bill = $0.040; ratio = 2.0×
 *   Anthropic cost = $0.030 (heavy): overage = $0.040; bill = $0.060; ratio = 2.0×
 *
 * As Anthropic cost rises above threshold, bill rises ×2 as fast; revenue/cost
 * ratio asymptotes to 2.0× from above; never goes below. R5 floor by construction.
 *
 * Re-tuning post-launch: see the design's "Real-cost-distribution-based base-rate
 * re-tuning" deferred item — first 2–4 weeks of production data informs whether
 * $0.02 stays put. Re-tuning is Elevated under 0d-ii.
 */
export const OPTION_D_BILLING = {
  LOOP_BASE_RATE_CENTS: 2,
  OVERAGE_TRIGGER_RATIO: 0.5,
  OVERAGE_RATE_MULTIPLIER: 2.0,
} as const


/**
 * Result of computing one loop's bill from its accumulated Anthropic cost.
 *
 * All values in integer cents (no floats; no rounding ambiguity at billing time).
 */
export interface LoopBill {
  base_cents: number          // = OPTION_D_BILLING.LOOP_BASE_RATE_CENTS
  threshold_cents: number     // = LOOP_BASE_RATE_CENTS × OVERAGE_TRIGGER_RATIO (rounded down)
  overage_cents: number       // 0 if overage didn't fire; else round(max(0, excess) × multiplier)
  overage_fired: boolean      // overage_cents > 0
  total_cents: number         // base_cents + overage_cents (what the customer pays)
}

/**
 * Single source of truth for the per-loop bill formula (Decisions B + C + D).
 *
 * Input: the loop's accumulated Anthropic cost in cents (float input from
 * loop-cost-tracker's accumulator OK; arithmetic happens in integer cents
 * via Math.round at the conversion boundary). Output: structured LoopBill.
 *
 * The formula is intentionally simple — every line traceable to one of the
 * three decisions. computeLoopBill is the function any code that needs "how
 * much would this cost the customer?" should call; metering layer in
 * /api/reason + /api/score-iterate calls it once at terminal call; Stripe
 * webhook handler may call it for reconciliation; future audit / sanity-check
 * tools may call it to verify persisted bills.
 */
export function computeLoopBill(anthropicCostCents: number): LoopBill {
  const base_cents = OPTION_D_BILLING.LOOP_BASE_RATE_CENTS

  // Threshold = base × trigger ratio; integer cents (round down to be conservative
  // on the overage trigger — favours the customer at the cent boundary).
  const threshold_cents = Math.floor(base_cents * OPTION_D_BILLING.OVERAGE_TRIGGER_RATIO)

  // Anthropic cost rounded to integer cents for the comparison + arithmetic.
  // The accumulator works in float for precision; we round at the boundary.
  const anthropic_cost_int = Math.round(anthropicCostCents)

  const excess = anthropic_cost_int - threshold_cents
  const overage_cents = excess > 0
    ? Math.round(excess * OPTION_D_BILLING.OVERAGE_RATE_MULTIPLIER)
    : 0
  const overage_fired = overage_cents > 0
  const total_cents = base_cents + overage_cents

  return {
    base_cents,
    threshold_cents,
    overage_cents,
    overage_fired,
    total_cents,
  }
}


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
