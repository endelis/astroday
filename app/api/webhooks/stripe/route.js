// POST /api/webhooks/stripe — handles Stripe subscription lifecycle events.
// Verifies webhook signature before processing any event.
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { handleSubscriptionUpsert, handleSubscriptionDeleted } from '../../../../lib/stripe/subscriptions';

const HANDLED_EVENTS = new Set([
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

export async function POST(request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event;
  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('[stripe-webhook] Signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (!HANDLED_EVENTS.has(event.type)) {
    return NextResponse.json({ received: true });
  }

  const subscription = event.data.object;

  try {
    if (event.type === 'customer.subscription.deleted') {
      await handleSubscriptionDeleted(subscription);
    } else {
      await handleSubscriptionUpsert(subscription);
    }
  } catch (err) {
    console.error(`[stripe-webhook] Failed to process ${event.type}:`, err.message);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
