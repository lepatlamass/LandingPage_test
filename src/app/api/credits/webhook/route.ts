import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import { FieldValue } from 'firebase-admin/firestore';
import { dbAdmin } from '@/lib/firebase-admin';
import { getAICreditAllowance, getNextResetAt, buildInitialPerToolCredits } from '@/lib/firestore/licenses';

function getSubscriptionExpiresAt(subscription: Stripe.Subscription): string {
  const periodEnd = subscription.items?.data?.[0]?.current_period_end || (subscription as any).current_period_end;
  if (periodEnd) {
    return new Date(periodEnd * 1000).toISOString();
  }
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error(`[Webhook] Signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const subscriptionId = session.subscription as string;

        if (!userId || !subscriptionId) {
          console.warn('[Webhook] Missing userId or subscriptionId in checkout.session.completed');
          break;
        }

        // Fetch details from subscription
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        const priceId = subscription.items.data[0]?.price?.id;

        const monthlyPriceId = process.env.STRIPE_MONTHLY_PRICE_ID || 'price_1TlEWfBGFddGjctCnHIbBpeZ';
        const yearlyPriceId = process.env.STRIPE_YEARLY_PRICE_ID || 'price_1TlEXfBGFddGjctC1tmHlPAf';

        const planType = priceId === yearlyPriceId ? 'yearly' : 'monthly';
        const productName = planType === 'yearly' ? 'Pro Yearly' : 'Pro Monthly';
        
        const aiCreditsTotal = getAICreditAllowance(planType);
        const perToolCredits = buildInitialPerToolCredits(planType);
        const expiresAt = getSubscriptionExpiresAt(subscription);

        // 1. Write the license details document
        await dbAdmin.doc(`users/${userId}/licenses/${subscriptionId}`).set({
          licenseKey: subscriptionId,
          stripeSubscriptionId: subscriptionId,
          status: subscription.status,
          expiresAt,
          activatedAt: new Date().toISOString(),
          activationCount: 1,
          maxActivations: 1,
          activationsRemaining: 0,
          productName,
          planType,
          aiCreditsTotal,
          aiCreditsRemaining: aiCreditsTotal,
          aiCreditsResetAt: getNextResetAt(),
          perToolCredits,
          savedAt: FieldValue.serverTimestamp(),
        });

        // 2. Write/Update summary document for active check
        await dbAdmin.doc(`users/${userId}/licenses/active`).set(
          {
            licenseKey: subscriptionId,
            status: subscription.status,
            expiresAt,
            activationsRemaining: 0,
            isActive: true,
            aiCreditsTotal,
            aiCreditsRemaining: aiCreditsTotal,
            aiCreditsResetAt: getNextResetAt(),
            planType,
            perToolCredits,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        console.log(`[Webhook] Activated subscription ${subscriptionId} for user ${userId}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const userId = subscription.metadata?.userId;

          if (userId) {
            const expiresAt = getSubscriptionExpiresAt(subscription);
            
            await dbAdmin.doc(`users/${userId}/licenses/active`).set(
              {
                expiresAt,
                status: subscription.status,
                isActive: subscription.status === 'active' || subscription.status === 'trialing',
                updatedAt: FieldValue.serverTimestamp(),
              },
              { merge: true }
            );

            console.log(`[Webhook] Renewed subscription ${subscriptionId} for user ${userId}. New expiry: ${expiresAt}`);
          }
        }
        break;
      }

      case 'customer.subscription.deleted':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (userId) {
          const expiresAt = getSubscriptionExpiresAt(subscription);
          const isActive = subscription.status === 'active' || subscription.status === 'trialing';

          await dbAdmin.doc(`users/${userId}/licenses/active`).set(
            {
              status: subscription.status,
              expiresAt,
              isActive,
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
          );

          console.log(`[Webhook] Updated/Deleted subscription ${subscription.id} for user ${userId}. Active: ${isActive}`);
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Webhook] Error processing event:', error);
    return NextResponse.json({ error: error.message || 'Webhook processing failed' }, { status: 500 });
  }
}
