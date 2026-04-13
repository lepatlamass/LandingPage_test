import { NextRequest, NextResponse } from 'next/server';
import { activateLicense } from '@/lib/chariow';
import { getPlanType, getAICreditAllowance, getNextResetAt, buildInitialPerToolCredits } from '@/lib/firestore/licenses';

export async function POST(req: NextRequest) {
  try {
    const { licenseKey, userId } = await req.json();

    if (!licenseKey) {
      return NextResponse.json(
        { error: 'License key is required' },
        { status: 400 }
      );
    }
    if (!userId) {
      return NextResponse.json(
        { error: 'You must be logged in to activate a license' },
        { status: 401 }
      );
    }

    // Step 1: Call Chariow to activate the license
    const result = await activateLicense(licenseKey);

    // Step 2: Determine plan type and AI credits
    const productName = result.data.product?.name || '';
    const planType = getPlanType(productName);
    const aiCreditsTotal = getAICreditAllowance(planType);
    const perToolCredits = buildInitialPerToolCredits(planType);

    // Step 3: Return all data so the client can save to Firestore
    // (The client has the authenticated Firebase session needed for write permissions)
    return NextResponse.json({
      message: 'License activated successfully',
      data: {
        chariowLicenseId: result.data.id,
        licenseKey: result.data.license_key || licenseKey,
        status: result.data.status || 'active',
        expiresAt: result.data.expires_at || '',
        activationCount: result.data.activation_count ?? 1,
        maxActivations: result.data.max_activations ?? 1,
        activationsRemaining: result.data.activations_remaining ?? 0,
        productName,
        planType,
        aiCreditsTotal,
        aiCreditsRemaining: aiCreditsTotal,
        aiCreditsResetAt: getNextResetAt(),
        perToolCredits,
      },
    });
  } catch (error: any) {
    console.error('License activation error:', error);
    return NextResponse.json(
      { error: error.message || 'Activation failed' },
      { status: 400 }
    );
  }
}
