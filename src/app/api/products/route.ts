import { NextRequest, NextResponse } from 'next/server';
import { getProduct } from '@/lib/chariow';

export async function GET(req: NextRequest) {
  const MONTHLY_PRODUCT_ID = 'prd_zvd1cf';
  const YEARLY_PRODUCT_ID = 'prd_ge7e1g';

  try {
    const [monthly, yearly] = await Promise.all([
      getProduct(MONTHLY_PRODUCT_ID),
      getProduct(YEARLY_PRODUCT_ID),
    ]);
    return NextResponse.json({
      monthlyPrice: monthly.currentPrice,
      yearlyPrice: yearly.currentPrice,
      monthlySale: monthly.priceOff ?? null,
      yearlySale: yearly.priceOff ?? null,
      monthlyName: monthly.name,
      yearlyName: yearly.name,
    });
  } catch (error: any) {
    console.error('Failed to fetch Chariow products:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
