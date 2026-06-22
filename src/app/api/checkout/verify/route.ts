import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import { getAICreditAllowance, getNextResetAt, buildInitialPerToolCredits } from '@/lib/firestore/licenses';

export async function POST(req: NextRequest) {
  try {
    const { userId, userEmail } = await req.json();

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'userId and userEmail are required' },
        { status: 400 }
      );
    }

    // 1. Find customer by email
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return NextResponse.json(
        { error: 'No Stripe customer found for this email' },
        { status: 404 }
      );
    }

    const customerId = customers.data[0].id;

    // 2. Find active/trialing subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      // Check trialing too
      const trialingSubs = await stripe.subscriptions.list({
        customer: customerId,
        status: 'trialing',
        limit: 1,
      });
      
      if (trialingSubs.data.length > 0) {
        subscriptions.data.push(trialingSubs.data[0]);
      }
    }

    if (subscriptions.data.length === 0) {
      return NextResponse.json(
        { error: 'No active or trialing subscription found for this customer' },
        { status: 404 }
      );
    }

    const subscription = subscriptions.data[0];
    const priceId = subscription.items?.data?.[0]?.price?.id;

    const monthlyPriceId = process.env.STRIPE_MONTHLY_PRICE_ID || 'price_1TlEWfBGFddGjctCnHIbBpeZ';
    const yearlyPriceId = process.env.STRIPE_YEARLY_PRICE_ID || 'price_1TlEXfBGFddGjctC1tmHlPAf';

    const planType = priceId === yearlyPriceId ? 'yearly' : 'monthly';
    const productName = planType === 'yearly' ? 'Pro Yearly' : 'Pro Monthly';

    const aiCreditsTotal = getAICreditAllowance(planType);
    const perToolCredits = buildInitialPerToolCredits(planType);

    const periodEnd = subscription.items?.data?.[0]?.current_period_end || (subscription as any).current_period_end;
    const expiresAt = periodEnd
      ? new Date(periodEnd * 1000).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    return NextResponse.json({
      success: true,
      data: {
        licenseKey: subscription.id,
        stripeSubscriptionId: subscription.id,
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
      }
    });
  } catch (error: any) {
    console.error('[Verify API] Error verifying subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Verification failed' },
      { status: 500 }
    );
  }
}
