---
workflow_name: Stripe Payment Failed
trigger_description: Billing issue triggered by Stripe webhook payment failure
last_run:
next_scheduled:
---

## Steps

1. Log the payment failure in support/inbox/ with:
   - `priority: high`
   - `channel: billing`
   - Customer account ID and amount
   - Stripe error code and reason for failure
2. Identify the customer and check:
   - Lead file in leads/active/ for customer context
   - Payment history for this account
   - Whether this is a first failure or repeat issue
3. Draft customer notification that includes:
   - Clear statement that payment failed and service may be interrupted
   - Customer-friendly explanation of why (card expired, insufficient funds, etc.)
   - Step-by-step instructions to update payment method in account dashboard
   - Information about the 7-day grace period
   - Support contact information if they need assistance
4. Check if this is a repeat failure:
   - If yes: escalate to founder immediately with account history and notification draft
   - If no: schedule follow-up check 3 days before grace period expires
5. Update corresponding lead file with billing status and last payment attempt date
6. Submit notification draft for founder review before sending to customer

## Ring Governance

- **R10**: Ensure billing communications comply with payment processor terms and customer agreements
- **R9**: Clearly explain grace period and service terms without guaranteeing payment processing
