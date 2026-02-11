import { Router, type Request, type Response } from 'express';
import express from 'express';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import {
  createCheckoutSession,
  createCustomerPortalSession,
  getSubscription,
  constructWebhookEvent,
  isStripeConfigured,
  type PlanId,
  type BillingInterval,
} from '../services/stripe.js';

export const billingRouter = Router();

/**
 * POST /api/billing/create-checkout — Create Stripe Checkout session
 */
billingRouter.post('/create-checkout', requireAuth, async (req: Request, res: Response) => {
  if (!isStripeConfigured()) {
    res.status(503).json({ error: 'Payments are not yet available. Coming soon!' });
    return;
  }
  try {
    const { plan, interval } = req.body as { plan: PlanId; interval: BillingInterval };

    if (!plan || !['student', 'professional'].includes(plan)) {
      res.status(400).json({ error: 'Invalid plan. Must be "student" or "professional".' });
      return;
    }
    if (!interval || !['month', 'year'].includes(interval)) {
      res.status(400).json({ error: 'Invalid interval. Must be "month" or "year".' });
      return;
    }

    const db = getDb();
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, req.user!.userId)).limit(1);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const returnUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const checkoutUrl = await createCheckoutSession(
      user.id,
      user.email,
      plan,
      interval,
      returnUrl,
      user.stripeCustomerId,
    );

    res.json({ url: checkoutUrl });
  } catch (error) {
    console.error('Create checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

/**
 * GET /api/billing/portal — Create Stripe Customer Portal session
 */
billingRouter.get('/portal', requireAuth, async (req: Request, res: Response) => {
  if (!isStripeConfigured()) {
    res.status(503).json({ error: 'Payments are not yet available. Coming soon!' });
    return;
  }
  try {
    const db = getDb();
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, req.user!.userId)).limit(1);

    if (!user?.stripeCustomerId) {
      res.status(400).json({ error: 'No active subscription found' });
      return;
    }

    const returnUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const portalUrl = await createCustomerPortalSession(user.stripeCustomerId, returnUrl);

    res.json({ url: portalUrl });
  } catch (error) {
    console.error('Portal error:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

/**
 * GET /api/billing/status — Get current subscription info
 */
billingRouter.get('/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, req.user!.userId)).limit(1);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const result: {
      plan: string;
      status: string;
      currentPeriodEnd?: string;
      cancelAtPeriodEnd?: boolean;
    } = {
      plan: user.plan,
      status: 'active',
    };

    if (user.stripeSubscriptionId) {
      try {
        const subscription = await getSubscription(user.stripeSubscriptionId);
        result.status = subscription.status;
        // In newer Stripe API versions, period info is on subscription items
        const firstItem = subscription.items?.data?.[0];
        if (firstItem?.current_period_end) {
          result.currentPeriodEnd = new Date(firstItem.current_period_end * 1000).toISOString();
        }
        result.cancelAtPeriodEnd = subscription.cancel_at_period_end;
      } catch {
        // Subscription may have been deleted externally
        result.status = 'inactive';
      }
    }

    res.json(result);
  } catch (error) {
    console.error('Billing status error:', error);
    res.status(500).json({ error: 'Failed to get billing status' });
  }
});

/**
 * POST /api/billing/webhook — Handle Stripe webhook events
 * NOTE: This route needs raw body parsing, registered separately in server.ts
 */
export async function handleWebhook(req: Request, res: Response) {
  if (!isStripeConfigured()) {
    res.status(503).json({ error: 'Stripe not configured' });
    return;
  }

  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    res.status(400).json({ error: 'Missing stripe-signature header' });
    return;
  }

  try {
    const event = constructWebhookEvent(req.body as Buffer, signature);
    const db = getDb();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan as PlanId;

        if (userId && plan) {
          await db.update(schema.users)
            .set({
              plan,
              stripeCustomerId: session.customer,
              stripeSubscriptionId: session.subscription,
              updatedAt: new Date(),
            })
            .where(eq(schema.users.id, userId));
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const userId = subscription.metadata?.userId;

        if (userId) {
          // If subscription is cancelled or past_due, downgrade to free
          if (['canceled', 'unpaid', 'past_due'].includes(subscription.status)) {
            await db.update(schema.users)
              .set({ plan: 'free', stripeSubscriptionId: null, updatedAt: new Date() })
              .where(eq(schema.users.id, userId));
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const userId = subscription.metadata?.userId;

        if (userId) {
          await db.update(schema.users)
            .set({ plan: 'free', stripeSubscriptionId: null, updatedAt: new Date() })
            .where(eq(schema.users.id, userId));
        }
        break;
      }

      default:
        // Unhandled event type — ignore
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook verification failed' });
  }
}
