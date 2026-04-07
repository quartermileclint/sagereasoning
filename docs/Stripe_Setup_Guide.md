# Stripe Account Setup Guide for SageReasoning

> **Created:** 2026-04-07
> **Audience:** Founder (non-technical)
> **Purpose:** Step-by-step instructions to create a Stripe account, get API keys,
> configure products, and connect everything to SageReasoning.

## Step 1: Create a Stripe Account

1. Open your web browser and go to **https://dashboard.stripe.com/register**
2. Fill in:
   - **Email:** clintonaitkenhead@hotmail.com (or your preferred business email)
   - **Full name:** Your legal name
   - **Country:** Australia
   - **Password:** Choose a strong, unique password
3. Click **Create account**
4. Check your email for a verification link from Stripe — click it to verify
5. You'll land on the Stripe Dashboard

## Step 2: Complete Business Verification

Stripe will ask you to verify your business before you can accept live payments.

1. In the Stripe Dashboard, look for a banner at the top saying **"Complete your account setup"** — click it
2. Fill in the required information:
   - **Business type:** Select "Individual / Sole proprietorship" (unless you've registered a company)
   - **Business name:** SageReasoning
   - **Business website:** https://sagereasoning.com
   - **Industry:** Select "Software" or "Technology"
   - **Business description:** "AI-powered philosophical reasoning platform providing Stoic-based decision evaluation tools for humans and AI agents"
3. Fill in your personal details (name, date of birth, address) — Stripe requires this for identity verification
4. Add your bank account details for payouts (this is where Stripe sends your money)
5. Click **Submit** — Stripe usually verifies within 1-2 business days

**Important:** You can use Test Mode (see Step 3) while waiting for verification.

## Step 3: Get Your API Keys

1. In the Stripe Dashboard, click **Developers** in the left sidebar
2. Click **API keys**
3. You'll see two sets of keys:

**Test Mode Keys (for testing — no real money):**
- **Publishable key:** Starts with `pk_test_...`
- **Secret key:** Starts with `sk_test_...` — click "Reveal test key" to see it

**Live Mode Keys (for real payments — only available after Step 2 is complete):**
- **Publishable key:** Starts with `pk_live_...`
- **Secret key:** Starts with `sk_live_...`

4. **Copy these keys** — you'll need them in Step 6

**Start with Test Mode keys.** Switch to Live Mode keys only after everything is tested and working.

## Step 4: Create Your Products and Prices

You need to create three products in Stripe that match SageReasoning's pricing model.

### Product 1: Developer Paid Tier (API access)

1. In the Stripe Dashboard, click **Product catalog** in the left sidebar
2. Click **+ Add product**
3. Fill in:
   - **Name:** SageReasoning Developer API — Paid Tier
   - **Description:** Production API access with 10,000 calls/month, 500/day, 3 deliberation iterations. Competitor-anchored per-call pricing.
4. Under **Pricing:**
   - Click **Add price**
   - **Pricing model:** Recurring
   - **Amount:** Set your monthly subscription price (e.g., $49.00/month — this is the base subscription; per-call overage billing can be added later)
   - **Billing period:** Monthly
   - **Currency:** USD
5. Click **Save product**
6. On the product page, find the **Price ID** — it looks like `price_1abc...` — **copy this**

### Product 2: One-Off Tiding (voluntary donation)

1. Click **+ Add product**
2. Fill in:
   - **Name:** SageReasoning Tiding (One-time)
   - **Description:** Voluntary one-time support for the SageReasoning platform. Does not unlock additional features.
3. Under **Pricing:**
   - **Pricing model:** One time
   - **Amount:** $20.00 (this is the default; users can change the amount on the pricing page)
   - **Currency:** USD
4. Click **Save product**
5. Copy the **Price ID**

### Product 3: Monthly Tiding (recurring voluntary donation)

1. Click **+ Add product**
2. Fill in:
   - **Name:** SageReasoning Tiding (Monthly)
   - **Description:** Voluntary monthly support for the SageReasoning platform. Does not unlock additional features.
3. Under **Pricing:**
   - **Pricing model:** Recurring
   - **Amount:** $10.00/month (default; users can change)
   - **Billing period:** Monthly
   - **Currency:** USD
4. Click **Save product**
5. Copy the **Price ID**

## Step 5: Set Up the Webhook

The webhook tells SageReasoning when a payment succeeds, fails, or is canceled.

1. In the Stripe Dashboard, click **Developers** in the left sidebar
2. Click **Webhooks**
3. Click **+ Add endpoint**
4. Fill in:
   - **Endpoint URL:** `https://sagereasoning.com/api/webhooks/stripe`
   - **Description:** SageReasoning payment events
5. Under **Select events to listen to**, click **+ Select events** and check these boxes:
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
6. Click **Add endpoint**
7. On the webhook details page, click **Reveal** next to "Signing secret"
8. **Copy the signing secret** — it starts with `whsec_...`

## Step 6: Add Keys to Your Environment

Open the file `.env.local` in the `website/` folder of the SageReasoning project and add your keys:

```
# Stripe
STRIPE_SECRET_KEY=sk_test_your-actual-secret-key-here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-actual-publishable-key-here
STRIPE_WEBHOOK_SECRET=whsec_your-actual-webhook-signing-secret-here

# Product/Price IDs from Step 4
STRIPE_DEVELOPER_PRICE_ID=price_your-developer-plan-price-id
STRIPE_TIDING_ONCEOFF_PRICE_ID=price_your-oneoff-tiding-price-id
STRIPE_TIDING_MONTHLY_PRICE_ID=price_your-monthly-tiding-price-id
```

**Replace** each placeholder with the actual values you copied in Steps 3, 4, and 5.

**NEVER commit .env.local to GitHub** — it contains your secret keys.

## Step 7: Test the Integration

1. Start the development server:
   ```
   cd website
   npm run dev
   ```
2. Open http://localhost:3000/pricing in your browser
3. Click "Upgrade to paid tier" — you should be redirected to a Stripe Checkout page
4. Use the **test card number:** `4242 4242 4242 4242`
   - **Expiry:** Any future date (e.g., 12/30)
   - **CVC:** Any 3 digits (e.g., 123)
   - **ZIP:** Any 5 digits (e.g., 10001)
5. Complete the checkout — you should be redirected back to your dashboard
6. Check the Stripe Dashboard under **Payments** — you should see the test payment

### Testing the Webhook Locally

For local development, Stripe needs to be able to reach your computer. Use the Stripe CLI:

1. Install the Stripe CLI: https://stripe.com/docs/stripe-cli
2. Log in: `stripe login`
3. Forward webhooks to your local server:
   ```
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. The CLI will show a webhook signing secret — use this as your `STRIPE_WEBHOOK_SECRET` during local testing
5. Make a test payment — you should see webhook events in the CLI output

## Step 8: Go Live

Once everything works in Test Mode:

1. Complete business verification (Step 2) if you haven't already
2. In the Stripe Dashboard, toggle **"Test mode"** off (top-right corner) to switch to Live Mode
3. Get your Live Mode API keys (Step 3)
4. Update `.env.local` with the Live Mode keys (replace `sk_test_` with `sk_live_`, etc.)
5. Update the webhook endpoint URL to point to your production domain
6. Update the webhook signing secret with the live endpoint's secret
7. Deploy to Vercel

## Quick Reference: Where Each Key Goes

| Key | Starts with | Where to put it | What it does |
|---|---|---|---|
| Publishable key | `pk_test_` or `pk_live_` | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Identifies your Stripe account (safe to expose in browser) |
| Secret key | `sk_test_` or `sk_live_` | `STRIPE_SECRET_KEY` | Authenticates server-side API calls (NEVER expose publicly) |
| Webhook secret | `whsec_` | `STRIPE_WEBHOOK_SECRET` | Verifies webhook signatures (NEVER expose publicly) |
| Developer Price ID | `price_` | `STRIPE_DEVELOPER_PRICE_ID` | Links to your Developer Paid Tier product |
| One-off Tiding Price ID | `price_` | `STRIPE_TIDING_ONCEOFF_PRICE_ID` | Links to your One-off Tiding product |
| Monthly Tiding Price ID | `price_` | `STRIPE_TIDING_MONTHLY_PRICE_ID` | Links to your Monthly Tiding product |

## Troubleshooting

**"Payment processing is not yet available" error:**
Your `STRIPE_SECRET_KEY` is missing or still has the placeholder value. Check `.env.local`.

**Webhook events not arriving:**
Check the Stripe Dashboard under Developers > Webhooks > your endpoint. Look for failed delivery attempts. Common issues: wrong URL, missing events, or server not running.

**"Webhook signature verification failed" error:**
Your `STRIPE_WEBHOOK_SECRET` doesn't match the endpoint. Make sure you copied the signing secret from the correct webhook endpoint (test vs. live).

**Checkout page shows wrong currency or amount:**
Check the Price IDs in `.env.local` — they must match the prices you created in Step 4.

## Cost and Fees

Stripe charges:
- **2.9% + $0.30 per successful transaction** (standard US pricing)
- **0.5% additional for international cards**
- **No monthly fees, no setup fees**

For Australian businesses, fees may vary. Check https://stripe.com/au/pricing for current rates.

These fees come out of the payment amount — you receive the remainder. Factor this into the R5 cost-health calculations (revenue-to-cost ratio must stay above 2.0x).
