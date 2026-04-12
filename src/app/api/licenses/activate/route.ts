import { NextRequest, NextResponse } from 'next/server';
import { activateLicense } from '@/lib/chariow';
import { saveUserLicense, getPlanType, getAICreditAllowance, getNextResetAt } from '@/lib/firestore/licenses';

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
    const planType = getPlanType(result.data.product?.name);
    const aiCreditsTotal = getAICreditAllowance(planType);

    // Step 3: Store in Firestore
    await saveUserLicense(userId, {
      licenseKey: result.data.license_key,
      chariowLicenseId: result.data.id,
      status: result.data.status,
      expiresAt: result.data.expires_at,
      activatedAt: new Date().toISOString(),
      activationCount: result.data.activation_count,
      maxActivations: result.data.max_activations,
      activationsRemaining: result.data.activations_remaining,
      productName: result.data.product?.name,
      planType,
      aiCreditsTotal,
      aiCreditsRemaining: aiCreditsTotal,
      aiCreditsResetAt: getNextResetAt(),
    });

    return NextResponse.json({
      message: 'License activated successfully',
      data: {
        expiresAt: result.data.expires_at,
        productName: result.data.product?.name,
        activationsRemaining: result.data.activations_remaining,
        aiCreditsRemaining: aiCreditsTotal,
        aiCreditsTotal,
        planType,
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
