import Stripe from 'stripe';

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: '2026-01-28.clover' });
};

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

export const PLANS = {
  student: {
    name: 'Student',
    monthlyPrice: 999, // $9.99 in cents
    annualPrice: 9588,  // $95.88/year ($7.99/mo)
    checksPerMonth: 100,
  },
  professional: {
    name: 'Professional',
    monthlyPrice: 2999, // $29.99 in cents
    annualPrice: 29988,  // $299.88/year ($24.99/mo)
    checksPerMonth: -1, // unlimited
  },
} as const;

export type PlanId = 'student' | 'professional';
export type BillingInterval = 'month' | 'year';

export async function createCheckoutSession(
  userId: string,
  email: string,
  plan: PlanId,
  interval: BillingInterval,
  returnUrl: string,
  stripeCustomerId?: string | null,
): Promise<string> {
  const stripe = getStripe();
  const planConfig = PLANS[plan];
  const unitAmount = interval === 'month' ? planConfig.monthlyPrice : planConfig.annualPrice;

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    customer_email: stripeCustomerId ? undefined : email,
    customer: stripeCustomerId || undefined,
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `LegalCitation ${planConfig.name}`,
          description: planConfig.checksPerMonth === -1
            ? 'Unlimited citation checks per month'
            : `${planConfig.checksPerMonth} citation checks per month`,
        },
        unit_amount: unitAmount,
        recurring: { interval },
      },
      quantity: 1,
    }],
    metadata: { userId, plan },
    subscription_data: { metadata: { userId, plan } },
    success_url: `${returnUrl}?checkout=success`,
    cancel_url: `${returnUrl}?checkout=cancelled`,
  };

  const session = await stripe!.checkout.sessions.create(sessionParams);
  return session.url!;
}

export async function createCustomerPortalSession(
  stripeCustomerId: string,
  returnUrl: string,
): Promise<string> {
  const stripe = getStripe();
  const session = await stripe!.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });
  return session.url;
}

export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  const stripe = getStripe();
  return stripe!.subscriptions.retrieve(subscriptionId);
}

export function constructWebhookEvent(body: Buffer, signature: string): Stripe.Event {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not set');
  return stripe!.webhooks.constructEvent(body, signature, secret);
}
