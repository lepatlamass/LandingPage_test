import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export interface ProductInfo {
  id: string;
  name: string;
  currentPrice: {
    value: number;
    formatted: string;
    short: string;
    currency: string;
  };
  originalPrice?: {
    value: number;
    formatted: string;
    short: string;
    currency: string;
  };
  priceOff?: string;
}

export async function getProductPrice(priceId: string): Promise<ProductInfo> {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }

  const price = await stripe.prices.retrieve(priceId, {
    expand: ['product'],
  });

  const product = price.product as Stripe.Product;
  const value = price.unit_amount ? price.unit_amount / 100 : 0;
  const currency = price.currency.toUpperCase();
  
  // Format the price based on currency
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  });
  const formatted = formatter.format(value);

  return {
    id: price.id,
    name: product.name,
    currentPrice: {
      value,
      formatted,
      short: String(value),
      currency,
    },
  };
}

export async function createCheckoutSession(
  priceId: string,
  userId: string,
  userEmail: string,
  origin: string
): Promise<string | null> {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    subscription_data: {
      metadata: {
        userId,
      },
    },
    success_url: `${origin}/account/subscription?success=true`,
    cancel_url: `${origin}/pricing?cancelled=true`,
    metadata: {
      userId,
    },
    customer_email: userEmail || undefined,
  });

  return session.url;
}

export { stripe };
