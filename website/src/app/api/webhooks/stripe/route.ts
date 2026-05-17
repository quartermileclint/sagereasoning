/**
 * POST /api/webhooks/stripe — Stripe webhook handler.
 *
 * Receives events from Stripe and processes them:
 *   - checkout.session.completed → Provision paid API keys or log tidings
 *   - invoice.created           → (Option D) Attach per-day-aggregate loop line items
 *                                  to the draft invoice from loop_billing_events
 *   - invoice.paid              → Confirm ongoing subscription
 *   - invoice.payment_failed    → Flag account, trigger grace period
 *   - customer.subscription.updated → Sync subscription status
 *   - customer.subscription.deleted → Downgrade API key to free tier
 *
 * Security:
 *   - Verifies Stripe webhook signature (STRIPE_WEBHOOK_SECRET)
 *   - Idempotent via stripe_event_id unique constraint
 *   - No CORS (server-to-server only)
 *   - Uses service role for database writes (bypasses RLS)
 *
 * Rules served: R0 (oikeiosis), R5 (cost guardrails — Option D's prospective
 *               formula at the loop level + this handler's invoice-rendering
 *               at the month level), R10 (billing compliance)
 *
 * Option D integration (per D-BILLING-MODEL-LOCKED-2026-05-17 + build session
 * 2026-05-MM): handleInvoiceCreated reads loop_billing_events for the
 * customer's api_keys in the subscription period, aggregates by day per
 * Step 1(b) election, and creates one Stripe.InvoiceItem per day. CSV
 * download (per-loop forensic granularity) deferred under PR7 — line items
 * give the meter-visibility; CSV adds export convenience for accounting.
 *
 * Live invoice flow inert until STRIPE_PER_LOOP_PRICE_ID is set in Vercel
 * (Step 0 election — Price ID deferred to a follow-on session). When the
 * Price ID is configured and a subscription exists at that price, this
 * handler fires on Stripe's monthly invoice cycle.
 *
 * @compliance
 * compliance_version: CR-2026-Q2-v4
 * regulatory_references: [CR-005, CR-010]
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  constructWebhookEvent,
  isStripeConfigured,
  logPaymentEvent,
  stripe,
  STRIPE_PRICES,
} from '@/lib/stripe'
import type Stripe from 'stripe'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseAdmin = any

// Disable Next.js body parsing — Stripe needs the raw body for signature verification
export const runtime = 'nodejs'

// Must read raw body for Stripe signature verification
async function getRawBody(request: NextRequest): Promise<Buffer> {
  const reader = request.body?.getReader()
  if (!reader) throw new Error('No request body')

  const chunks: Uint8Array[] = []
  let done = false
  while (!done) {
    const result = await reader.read()
    if (result.value) chunks.push(result.value)
    done = result.done
  }
  return Buffer.concat(chunks)
}

export async function POST(request: NextRequest) {
  // ── Guard: Stripe must be configured ──────────────────────────────────
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: 'Payment processing is not yet configured.' },
      { status: 503 }
    )
  }

  // ── Verify webhook signature ──────────────────────────────────────────
  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event
  try {
    const rawBody = await getRawBody(request)
    event = constructWebhookEvent(rawBody, signature)
  } catch (err) {
    console.error('[Stripe webhook] Signature verification failed:', err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  // ── Supabase admin client (service role — bypasses RLS) ───────────────
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // ── Idempotency check ─────────────────────────────────────────────────
  const { data: existing } = await supabaseAdmin
    .from('payment_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .single()

  if (existing) {
    // Already processed — return 200 so Stripe doesn't retry
    return NextResponse.json({ received: true, duplicate: true })
  }

  // ── Route by event type ───────────────────────────────────────────────
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(supabaseAdmin, event)
        break

      case 'invoice.created':
        // Option D — attach per-day-aggregate loop line items to the draft
        // invoice before Stripe finalizes it. No-op if no loop_billing_events
        // rows exist for the customer's api_keys in the period.
        await handleInvoiceCreated(supabaseAdmin, event)
        break

      case 'invoice.paid':
        await handleInvoicePaid(supabaseAdmin, event)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(supabaseAdmin, event)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(supabaseAdmin, event)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(supabaseAdmin, event)
        break

      default:
        // Log unhandled events for monitoring but don't error
        console.log(`[Stripe webhook] Unhandled event type: ${event.type}`)
        await logPaymentEvent(supabaseAdmin, event)
    }
  } catch (err) {
    console.error(`[Stripe webhook] Error processing ${event.type}:`, err)
    // Return 500 so Stripe retries
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }

  return NextResponse.json({ received: true })
}


// =============================================================================
// EVENT HANDLERS
// =============================================================================

/**
 * checkout.session.completed — User completed a checkout.
 * Two cases:
 *   1. Developer paid tier → Upgrade API key
 *   2. Voluntary tiding → Log donation (no feature change)
 */
async function handleCheckoutCompleted(
  supabaseAdmin: SupabaseAdmin,
  event: Stripe.Event
) {
  const session = event.data.object as Stripe.Checkout.Session

  const userId = session.metadata?.supabase_user_id
  const checkoutType = session.metadata?.checkout_type // 'developer_paid' | 'tiding_once' | 'tiding_monthly'
  const customerId = session.customer as string

  // Log the event
  await logPaymentEvent(
    supabaseAdmin,
    event,
    userId || undefined,
    session.amount_total || undefined,
    session.currency || 'usd'
  )

  if (!userId || !customerId) {
    console.warn('[Stripe webhook] checkout.session.completed missing userId or customerId')
    return
  }

  // Ensure stripe_customers link exists
  await supabaseAdmin.rpc('get_or_create_stripe_customer', {
    p_user_id: userId,
    p_stripe_customer_id: customerId,
    p_email: session.customer_email || null,
    p_customer_type: checkoutType === 'developer_paid' ? 'developer' : 'human',
  })

  // If developer paid tier, upgrade their API key
  if (checkoutType === 'developer_paid') {
    await supabaseAdmin.rpc('upgrade_api_key_to_paid', {
      p_user_id: userId,
      // Use defaults: 10000 monthly, 500 daily, 3 iterations
    })
    console.log(`[Stripe webhook] Upgraded API key for user ${userId} to paid tier`)
  }

  // If subscription-based (monthly tiding or developer), record the subscription
  if (session.subscription) {
    await supabaseAdmin.from('stripe_subscriptions').upsert({
      stripe_customer_id: customerId,
      stripe_subscription_id: session.subscription as string,
      stripe_price_id: session.metadata?.price_id || '',
      subscription_type: checkoutType === 'developer_paid' ? 'developer_paid' : 'monthly_tiding',
      status: 'active',
    }, {
      onConflict: 'stripe_subscription_id',
    })
  }
}

/**
 * invoice.created — Stripe created a new draft invoice (Option D).
 *
 * Reads loop_billing_events for the customer's api_keys within the
 * invoice's billing period, aggregates by day, and attaches one
 * Stripe.InvoiceItem per day with the total cents for that day.
 *
 * Per Step 1(b) election (build session 2026-05-MM): per-day-aggregate
 * line items. CSV download with per-loop forensic detail deferred under
 * PR7 — Stripe invoice line items give the meter-visibility requirement;
 * CSV adds accounting-export convenience.
 *
 * Idempotency: Stripe invoice items are tied to the customer + invoice;
 * re-running this handler for the same invoice would double-bill the
 * customer. The idempotency check at the top of POST handles webhook
 * retries (stripe_event_id unique constraint on payment_events). Internal
 * idempotency within this handler: if invoice items have already been
 * added for this invoice (detected by querying existing line items), skip
 * the add step. NOT yet implemented in this build — relies on Stripe's
 * webhook idempotency only.
 */
async function handleInvoiceCreated(
  supabaseAdmin: SupabaseAdmin,
  event: Stripe.Event
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoice = event.data.object as any
  const customerId = invoice.customer as string
  const invoiceId = invoice.id as string

  // Look up the user from stripe_customers
  const { data: customerLink } = await supabaseAdmin
    .from('stripe_customers')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()

  await logPaymentEvent(supabaseAdmin, event, customerLink?.user_id || undefined)

  if (!customerLink?.user_id) {
    console.warn(
      `[Stripe webhook] invoice.created for unknown customer ${customerId} — skipping Option D line items.`
    )
    return
  }

  // Skip if Option D Price ID is unset (Step 0 election — Price ID deferred).
  // The webhook handler is wired but the live flow is inert.
  if (!STRIPE_PRICES.perLoop) {
    console.log(
      `[Stripe webhook] invoice.created for user ${customerLink.user_id} — ` +
        `STRIPE_PER_LOOP_PRICE_ID unset; Option D line items skipped. ` +
        `Set the env var in Vercel to activate per-loop billing.`
    )
    return
  }

  // Determine billing period. Stripe invoices carry period_start / period_end
  // on each line item; the invoice's overall period is invoice.period_start /
  // invoice.period_end (epoch seconds). Convert to ISO date strings for the
  // loop_billing_events query.
  const periodStart = new Date((invoice.period_start as number) * 1000)
  const periodEnd = new Date((invoice.period_end as number) * 1000)

  // Find this customer's api_keys (Option D bills against api_keys.owner_user_id).
  const { data: keys } = await supabaseAdmin
    .from('api_keys')
    .select('id')
    .eq('owner_user_id', customerLink.user_id)
    .eq('billing_model', 'per_loop')

  if (!keys || keys.length === 0) {
    console.log(
      `[Stripe webhook] invoice.created for user ${customerLink.user_id} — ` +
        `no per-loop api_keys; nothing to bill.`
    )
    return
  }

  const apiKeyIds = keys.map((k: { id: string }) => k.id)

  // Query loop_billing_events for the period, aggregate by day.
  const { data: events, error: queryErr } = await supabaseAdmin
    .from('loop_billing_events')
    .select('total_cents, created_at')
    .in('api_key_id', apiKeyIds)
    .gte('created_at', periodStart.toISOString())
    .lt('created_at', periodEnd.toISOString())

  if (queryErr) {
    console.error('[Stripe webhook] Failed to query loop_billing_events:', queryErr)
    throw queryErr
  }

  if (!events || events.length === 0) {
    console.log(
      `[Stripe webhook] invoice.created for user ${customerLink.user_id} — ` +
        `no loop_billing_events in period ${periodStart.toISOString()} → ${periodEnd.toISOString()}.`
    )
    return
  }

  // Aggregate by day (UTC date string YYYY-MM-DD).
  const byDay = new Map<string, number>()
  for (const ev of events as Array<{ total_cents: number; created_at: string }>) {
    const day = ev.created_at.slice(0, 10) // YYYY-MM-DD from ISO timestamp
    byDay.set(day, (byDay.get(day) ?? 0) + ev.total_cents)
  }

  // Create one Stripe.InvoiceItem per day, sorted chronologically.
  const sortedDays = Array.from(byDay.keys()).sort()
  for (const day of sortedDays) {
    const cents = byDay.get(day)!
    try {
      await stripe.invoiceItems.create({
        customer: customerId,
        invoice: invoiceId,
        amount: cents,
        currency: 'usd',
        description: `SageReasoning per-loop usage — ${day}`,
        metadata: {
          source: 'option_d_billing',
          day,
          loops_count: String(events.filter((e: { created_at: string }) => e.created_at.startsWith(day)).length),
        },
      })
    } catch (err) {
      console.error(
        `[Stripe webhook] Failed to attach invoice item for day ${day} ` +
          `(invoice ${invoiceId}, customer ${customerId}):`,
        err
      )
      throw err
    }
  }

  console.log(
    `[Stripe webhook] Attached ${sortedDays.length} per-day Option D line items ` +
      `to invoice ${invoiceId} for user ${customerLink.user_id} ` +
      `(${events.length} loops across ${sortedDays.length} days; ` +
      `total = ${Array.from(byDay.values()).reduce((a, b) => a + b, 0)} cents).`
  )
}


/**
 * invoice.paid — Recurring payment succeeded.
 * Log it and confirm subscription is active.
 */
async function handleInvoicePaid(
  supabaseAdmin: SupabaseAdmin,
  event: Stripe.Event
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoice = event.data.object as any

  // Look up user from stripe_customers
  const { data: customerLink } = await supabaseAdmin
    .from('stripe_customers')
    .select('user_id')
    .eq('stripe_customer_id', invoice.customer as string)
    .single()

  await logPaymentEvent(
    supabaseAdmin,
    event,
    customerLink?.user_id || undefined,
    invoice.amount_paid || undefined,
    invoice.currency || 'usd'
  )

  // Ensure subscription status is active
  if (invoice.subscription) {
    await supabaseAdmin
      .from('stripe_subscriptions')
      .update({ status: 'active' })
      .eq('stripe_subscription_id', invoice.subscription as string)
  }
}

/**
 * invoice.payment_failed — Recurring payment failed.
 * Log it and mark subscription as past_due.
 * Grace period handling per workflows/stripe-payment-failed.md:
 *   - 7-day grace period before suspension
 *   - Founder notified for repeat failures
 */
async function handleInvoicePaymentFailed(
  supabaseAdmin: SupabaseAdmin,
  event: Stripe.Event
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoice = event.data.object as any

  const { data: customerLink } = await supabaseAdmin
    .from('stripe_customers')
    .select('user_id')
    .eq('stripe_customer_id', invoice.customer as string)
    .single()

  await logPaymentEvent(
    supabaseAdmin,
    event,
    customerLink?.user_id || undefined,
    invoice.amount_due || undefined,
    invoice.currency || 'usd'
  )

  // Mark subscription as past_due (API key stays active during grace period)
  if (invoice.subscription) {
    await supabaseAdmin
      .from('stripe_subscriptions')
      .update({ status: 'past_due' })
      .eq('stripe_subscription_id', invoice.subscription as string)
  }

  // NOTE: The stripe-payment-failed.md workflow specifies:
  // - Log to support/inbox/ with priority: high, channel: billing
  // - 7-day grace period before API key suspension
  // - Founder escalation for repeat failures
  // These are handled by the Sage Ops support pipeline (P7)
  // For now, the database state change is sufficient — Sage Ops
  // will pick up past_due subscriptions when activated.
  console.warn(
    `[Stripe webhook] Payment failed for customer ${invoice.customer}. ` +
    `Subscription ${invoice.subscription} marked past_due. ` +
    `Grace period: 7 days per workflow/stripe-payment-failed.md.`
  )
}

/**
 * customer.subscription.updated — Subscription status changed.
 * Sync the current period and status to our database.
 */
async function handleSubscriptionUpdated(
  supabaseAdmin: SupabaseAdmin,
  event: Stripe.Event
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscription = event.data.object as any

  const { data: customerLink } = await supabaseAdmin
    .from('stripe_customers')
    .select('user_id')
    .eq('stripe_customer_id', subscription.customer as string)
    .single()

  await logPaymentEvent(supabaseAdmin, event, customerLink?.user_id || undefined)

  await supabaseAdmin
    .from('stripe_subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq('stripe_subscription_id', subscription.id)
}

/**
 * customer.subscription.deleted — Subscription canceled (end of period or immediate).
 * Downgrade the user's API key back to free tier.
 */
async function handleSubscriptionDeleted(
  supabaseAdmin: SupabaseAdmin,
  event: Stripe.Event
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscription = event.data.object as any

  const { data: customerLink } = await supabaseAdmin
    .from('stripe_customers')
    .select('user_id')
    .eq('stripe_customer_id', subscription.customer as string)
    .single()

  await logPaymentEvent(supabaseAdmin, event, customerLink?.user_id || undefined)

  // Update subscription record
  await supabaseAdmin
    .from('stripe_subscriptions')
    .update({ status: 'canceled' })
    .eq('stripe_subscription_id', subscription.id)

  // Check if this was a developer subscription
  const { data: subRecord } = await supabaseAdmin
    .from('stripe_subscriptions')
    .select('subscription_type')
    .eq('stripe_subscription_id', subscription.id)
    .single()

  // If developer_paid subscription was canceled, downgrade API key
  if (subRecord?.subscription_type === 'developer_paid' && customerLink?.user_id) {
    await supabaseAdmin.rpc('downgrade_api_key_to_free', {
      p_user_id: customerLink.user_id,
    })
    console.log(
      `[Stripe webhook] Downgraded API key for user ${customerLink.user_id} to free tier`
    )
  }
}
