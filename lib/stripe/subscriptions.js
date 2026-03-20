// Stripe subscription event handlers — called from the webhook route.
const { updateUser } = require('../db/users');

// Maps Stripe subscription status to our internal status values.
function mapStatus(stripeStatus) {
  const map = {
    active:            'active',
    trialing:          'trialing',
    past_due:          'active',   // still active, payment pending
    unpaid:            'expired',
    canceled:          'cancelled',
    incomplete:        'trialing',
    incomplete_expired: 'expired',
  };
  return map[stripeStatus] ?? 'expired';
}

// Called when a subscription is created or updated.
async function handleSubscriptionUpsert(subscription) {
  const userId = subscription.metadata?.user_id;
  if (!userId) {
    console.error('[handleSubscriptionUpsert] No user_id in subscription metadata');
    return;
  }

  const status = mapStatus(subscription.status);
  const tier = status === 'active' || status === 'trialing' ? 'pro' : 'free';
  const trialEndsAt = subscription.trial_end
    ? new Date(subscription.trial_end * 1000).toISOString()
    : null;

  await updateUser(userId, {
    subscription_tier: tier,
    subscription_status: status,
    stripe_customer_id: subscription.customer,
    ...(trialEndsAt && { trial_ends_at: trialEndsAt }),
  });
}

// Called when a subscription is deleted (cancelled and ended).
async function handleSubscriptionDeleted(subscription) {
  const userId = subscription.metadata?.user_id;
  if (!userId) {
    console.error('[handleSubscriptionDeleted] No user_id in subscription metadata');
    return;
  }

  await updateUser(userId, {
    subscription_tier: 'free',
    subscription_status: 'cancelled',
  });
}

module.exports = { handleSubscriptionUpsert, handleSubscriptionDeleted, mapStatus };
