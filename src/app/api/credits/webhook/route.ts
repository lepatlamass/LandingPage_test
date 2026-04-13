import { NextRequest, NextResponse } from 'next/server';
import { addAICredits } from '@/lib/firestore/licenses';

/**
 * POST /api/credits/webhook
 * Called by Chariow (or your payment provider) after a successful credit purchase.
 * 
 * Expected body:
 * {
 *   "userId": "firebase-uid",
 *   "credits": 10,
 *   "transactionId": "txn_xxx"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, credits, transactionId } = body;

    if (!userId || !credits) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, credits' },
        { status: 400 }
      );
    }

    const newTotal = await addAICredits(userId, credits);

    if (newTotal === -1) {
      return NextResponse.json(
        { error: 'No active license found for this user' },
        { status: 404 }
      );
    }

    console.log(`[Credits Webhook] Added ${credits} credits to user ${userId} (tx: ${transactionId}). New total: ${newTotal}`);

    return NextResponse.json({
      success: true,
      creditsAdded: credits,
      newTotal,
      transactionId,
    });
  } catch (error: any) {
    console.error('[Credits Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
