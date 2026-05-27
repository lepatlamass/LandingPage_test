import { NextRequest, NextResponse } from 'next/server';
import { getAi } from '@/lib/ai/gemini';

async function verifyFirebaseTokenAndLicense(request: NextRequest): Promise<{
  uid: string;
  error?: string;
  status?: number;
} | null> {
  const firstUsageHeader = request.headers.get('x-first-usage');
  if (firstUsageHeader === 'true') {
    return null;
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { uid: '', error: 'Unauthorized: Missing or invalid Authorization header', status: 401 };
  }

  const token = authHeader.substring(7);
  if (!token) {
    return { uid: '', error: 'Unauthorized: Token is missing', status: 401 };
  }

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!apiKey || !projectId) {
    console.error('Firebase configuration is not fully defined on the server');
    return { uid: '', error: 'Internal Server Error: Database configuration missing', status: 500 };
  }

  try {
    // 1. Verify token with Google Identity Toolkit REST API
    const verifyRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: token }),
      }
    );

    if (!verifyRes.ok) {
      const errText = await verifyRes.text();
      console.warn('Token verification failed:', errText);
      return { uid: '', error: 'Unauthorized: Invalid token', status: 401 };
    }

    const verifyData = await verifyRes.json();
    const uid = verifyData.users?.[0]?.localId;
    if (!uid) {
      return { uid: '', error: 'Unauthorized: User not found', status: 401 };
    }

    // 2. Fetch the license document from Firestore using the user's token
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}/licenses/active`;
    const licenseRes = await fetch(firestoreUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (licenseRes.status === 404) {
      return { uid, error: 'Forbidden: No active license found', status: 403 };
    }

    if (!licenseRes.ok) {
      const errText = await licenseRes.text();
      console.warn('Failed to fetch license document:', errText);
      return { uid, error: 'Forbidden: Error retrieving license status', status: 403 };
    }

    const licenseData = await licenseRes.json();
    const fields = licenseData.fields || {};

    // 3. Validate isActive
    const isActive = fields.isActive?.booleanValue ?? false;
    if (!isActive) {
      return { uid, error: 'Forbidden: License is inactive', status: 403 };
    }

    // 4. Validate expiresAt if present
    const expiresAtStr = fields.expiresAt?.stringValue;
    if (expiresAtStr) {
      const expiresAt = new Date(expiresAtStr);
      if (expiresAt < new Date()) {
        return { uid, error: 'Forbidden: License has expired', status: 403 };
      }
    }

    // 5. Validate credits (either perToolCredits['bg-remover'].remaining > 0 or aiCreditsRemaining > 0)
    let hasCredits = false;

    // Check perToolCredits['bg-remover'].remaining
    const perToolCreditsMap = fields.perToolCredits?.mapValue?.fields;
    if (perToolCreditsMap && perToolCreditsMap['bg-remover']) {
      const bgRemoverCredits = perToolCreditsMap['bg-remover']?.mapValue?.fields;
      const remainingStr = bgRemoverCredits?.remaining?.integerValue;
      if (remainingStr) {
        const remaining = parseInt(remainingStr, 10);
        if (remaining > 0) {
          hasCredits = true;
        }
      }
    }

    // Fallback: Check aggregate aiCreditsRemaining
    if (!hasCredits) {
      const aggRemainingStr = fields.aiCreditsRemaining?.integerValue;
      if (aggRemainingStr) {
        const aggRemaining = parseInt(aggRemainingStr, 10);
        if (aggRemaining > 0) {
          hasCredits = true;
        }
      }
    }

    if (!hasCredits) {
      return { uid, error: 'Forbidden: No credits remaining for background removal', status: 403 };
    }

    return { uid };
  } catch (error: any) {
    console.error('Authentication/License validation error:', error);
    return { uid: '', error: 'Internal server error during verification', status: 500 };
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyFirebaseTokenAndLicense(request);
    if (authResult && authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status || 401 }
      );
    }

    const body = await request.json();
    const { base64Image, mimeType, options } = body;

    const ai = getAi();
    if (!ai) {
      return NextResponse.json(
        { error: 'AI not initialized' },
        { status: 500 }
      );
    }

    const parts: any[] = [
      {
        inlineData: {
          data: base64Image.split(',')[1] || base64Image,
          mimeType,
        },
      },
    ];

    if (options?.backgroundImageBase64 && options?.backgroundMimeType) {
      parts.push({
        inlineData: {
          data: options.backgroundImageBase64.split(',')[1] || options.backgroundImageBase64,
          mimeType: options.backgroundMimeType,
        },
      });
      parts.push({
        text: options.prompt || "Remove the background of the first image and replace it with the second image.",
      });
    } else {
      parts.push({
        text: options?.prompt || "Remove the background of this image and return the subject on a transparent background.",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: { parts },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return NextResponse.json({
          result: `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`
        });
      }
    }

    return NextResponse.json(
      { error: 'No image returned from AI' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('Background removal error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process image' },
      { status: 500 }
    );
  }
}
