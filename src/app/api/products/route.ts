import { NextRequest, NextResponse } from 'next/server';
import { getProductPrice } from '@/lib/stripe';

export async function GET(req: NextRequest) {
  const MONTHLY_PRICE_ID = process.env.STRIPE_MONTHLY_PRICE_ID;
  const YEARLY_PRICE_ID = process.env.STRIPE_YEARLY_PRICE_ID;

  if (!MONTHLY_PRICE_ID || !YEARLY_PRICE_ID) {
    return NextResponse.json(
      { error: 'Stripe price IDs are not configured' },
      { status: 500 }
    );
  }

  try {
    const [monthly, yearly] = await Promise.all([
      getProductPrice(MONTHLY_PRICE_ID),
      getProductPrice(YEARLY_PRICE_ID),
    ]);
    return NextResponse.json({
      monthlyPrice: monthly.currentPrice,
      yearlyPrice: yearly.currentPrice,
      monthlySale: monthly.priceOff ?? null,
      yearlySale: yearly.priceOff ?? null,
      monthlyName: monthly.name,
      yearlyName: yearly.name,
      monthlyPriceId: MONTHLY_PRICE_ID,
      yearlyPriceId: YEARLY_PRICE_ID,
    });
  } catch (error: any) {
    console.error('Failed to fetch Stripe product prices:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
